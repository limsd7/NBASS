import React, { useState, useEffect } from 'react';
import type { MobileAssessmentResult, UserProfile } from '../types';
import { dataSyncService } from '../services/dataSyncService';
import { hasRequiredTier } from '../services/featureGate';
import { PaywallCTA } from './tiered-features/PaywallCTA';
import { evaluateRule } from '../services/logicEngine';

interface Props {
  result: MobileAssessmentResult;
  user: UserProfile;
  onUpgradeClick?: () => void;
}

const clamp100 = (v: number) => Math.max(0, Math.min(100, Math.round(v)));

// PC DEFAULT_SECRET_POINT_RULES 중 설문 기반 6종 (hrv 조건은 실측 없이 스킵됨)
const SECRET_RULES: { id: string; severity: 'info' | 'warning' | 'critical'; message: string; conditions: any[]; combinator: 'AND' | 'OR' }[] = [
  { id: 'sp_gad7', severity: 'warning', message: 'GAD-7 (범불안장애 선별) 실시 고려', conditions: [{ field: 'survey.bai', operator: '>=', value: 15 }], combinator: 'OR' },
  { id: 'sp_psqi', severity: 'warning', message: 'PSQI (피츠버그 수면 질 지수) 실시 권고', conditions: [{ field: 'survey.isi', operator: '>=', value: 15 }], combinator: 'OR' },
  { id: 'sp_adhd', severity: 'info', message: 'ADHD 스크리닝 검사 고려', conditions: [{ field: 'survey.concentrationScore', operator: '>=', value: 20 }], combinator: 'OR' },
  { id: 'sp_cortisol', severity: 'warning', message: '스트레스 호르몬(코티솔) 검사 권고', conditions: [{ field: 'hrv.sns', operator: '>', value: 70 }], combinator: 'OR' },
  { id: 'sp_psychiatry', severity: 'critical', message: '정신건강의학과 초진 검토', conditions: [{ field: 'survey.bai', operator: '>=', value: 25 }], combinator: 'OR' },
  { id: 'sp_sleep_clinic', severity: 'critical', message: '수면 클리닉 연계 권장', conditions: [{ field: 'survey.isi', operator: '>=', value: 20 }], combinator: 'OR' },
];

const SEV_STYLE: Record<string, string> = {
  info: 'bg-slate-50 border-slate-200 text-slate-700',
  warning: 'bg-amber-50 border-amber-200 text-amber-900',
  critical: 'bg-rose-50 border-rose-200 text-rose-900',
};

function Gauge({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-[11px] font-bold mb-1">
        <span className="text-slate-700">{label}</span>
        <span className="text-slate-900">{clamp100(value)} / 100</span>
      </div>
      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
        <div className={`${color} h-full rounded-full`} style={{ width: `${clamp100(value)}%` }} />
      </div>
    </div>
  );
}

/** 요약 탭: 종합 진단 분석 + 신체 지표 + 상관관계 알람 + 검진 포인트 */
export const PcSummarySections: React.FC<Props> = ({ result, user }) => {
  const sv: any = result.surveyScores || {};
  const cp: any = result.cognitiveProfile || {};
  const an: any = (result as any).analyticsData || {};
  const pr: any = (result as any).protocolData || {};

  const sleeps: any[] = (() => {
    try { return dataSyncService.getSleepLogs(user.studentId); } catch { return []; }
  })();
  const avgSleep = sleeps.length > 0
    ? sleeps.reduce((a, l) => a + (l.totalHours || 0), 0) / sleeps.length : null;
  const sleepDebt = avgSleep !== null ? Math.max(0, 7.5 - avgSleep) : 0;

  const bai = sv.bai ?? 0;
  const isi = sv.isi ?? 0;
  const cfs = sv.cfs ?? 0;
  const conc = sv.concentration ?? 0;
  const sns = sv.snsCount ?? 0;
  const pns = sv.pnsCount ?? 0;

  // Vitality & Fatigue (설문 기반 추정치 — 실측 연동 시 교체)
  const vitality = clamp100(100 - cfs * 2 - isi * 1.5 - sleepDebt * 5);
  const fatigue = clamp100(cfs * 2.5 + isi * 1.5 + sleepDebt * 5);
  const stressGauge = clamp100((bai / 63) * 100);
  const concGauge = clamp100(((21 - conc) / 21) * 100);

  const ansDominant = sns > pns + 2 ? 'sns' : pns > sns + 2 ? 'pns' : 'balanced';
  const ansAdvice =
    ansDominant === 'sns'
      ? '교감신경 우세 — 저녁 카페인 금지, 4-7-8 호흡과 가벼운 스트레칭으로 부교감을 깨우세요. 아침형 고강도 학습이 유리합니다.'
      : ansDominant === 'pns'
        ? '부교감 우세 — 기상 직후 햇빛과 가벼운 유산소로 교감을 깨우세요. 오전 워밍업 후 오후에 고난도 배치가 유리합니다.'
        : '자율신경 균형 — 현재 리듬을 유지하고, 시험 2주 전부터 기상·취침을 고정하세요.';

  const alarms: { level: 'warning' | 'info'; text: string }[] = [];
  if (sleepDebt > 1.5 && conc >= 10) alarms.push({ level: 'warning', text: `수면 부채 ${sleepDebt.toFixed(1)}h + 집중 저하 — 번아웃 주의. 오늘은 신규 진도보다 복습·수면 확보를 우선하세요.` });
  if ((cp.digitalLevel === 'risk' || cp.digitalLevel === 'addiction') && (an.pureStudyRatio ?? 100) < 50) alarms.push({ level: 'warning', text: '디지털 방해 + 낮은 순공 비율 — 공부 시작 전 폰 물리 격리(다른 방)를 적용하세요.' });
  if (isi >= 15) alarms.push({ level: 'warning', text: '불면 고위험 — 취침 1시간 전 화면 차단과 고정 기상 시간을 적용하세요.' });
  if (bai >= 15) alarms.push({ level: 'info', text: '불안 고위험 — 시험 루틴(도착→호흡→타임박싱)을 미리 정해두세요.' });
  if (alarms.length === 0) alarms.push({ level: 'info', text: '긴급 상관관계 이상 없음 — 현재 루틴을 유지하세요.' });

  const surveyCtx = {
    bai, isi,
    concentrationScore: conc,
    adrenalFatigueScore: sv.adrenal ?? 0,
    fatigueSymptomsCount: cfs,
    sympatheticSymptomsCount: sns,
    parasympatheticSymptomsCount: pns,
  };
  const secretHits = SECRET_RULES.filter((r) => {
    try {
      return evaluateRule(r.conditions, r.combinator, { hrv: {}, survey: surveyCtx });
    } catch { return false; }
  });

  const allScores: { type: string; score: number }[] =
    (result.classificationResult?.allScores?.length ? result.classificationResult.allScores : null) ||
    (result.topCareScores || []).map((s: any) => ({ type: s.type, score: s.score }));

  return (
    <>
      {/* 종합 진단 분석 (전체 유형 점수) */}
      {allScores.length > 0 && (
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <h3 className="text-sm font-black text-slate-900">📊 종합 진단 분석 (전체 유형 점수)</h3>
          {allScores.slice(0, 8).map((s, i) => (
            <div key={i}>
              <div className="flex justify-between text-[11px] font-bold mb-0.5">
                <span className="text-slate-700">{s.type}</span>
                <span className="text-slate-900">{s.score}점</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${clamp100(s.score)}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 신체 지표: Vitality/Fatigue + 게이지 + 자율신경 */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
        <h3 className="text-sm font-black text-slate-900">❤️ 신체 지표 <span className="text-[10px] font-bold text-slate-400">설문 기반 추정치</span></h3>
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-2.5">
            <p className="text-[10px] font-bold text-slate-500">Vitality Index</p>
            <p className="text-base font-black text-emerald-600">{vitality}</p>
          </div>
          <div className="bg-rose-50 border border-rose-100 rounded-2xl p-2.5">
            <p className="text-[10px] font-bold text-slate-500">Fatigue Index</p>
            <p className="text-base font-black text-rose-600">{fatigue}</p>
          </div>
        </div>
        <Gauge label="스트레스 게이지 (BAI 기반)" value={stressGauge} color="bg-gradient-to-r from-amber-400 to-rose-500" />
        <Gauge label="집중 게이지 (집중 저하 역산)" value={concGauge} color="bg-gradient-to-r from-blue-400 to-indigo-500" />
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3">
          <p className="text-[11px] font-black text-slate-500 mb-1">
            자율신경 균형 공부법 (교감 {sns} · 부교감 {pns})
          </p>
          <p className="text-xs text-slate-700 leading-relaxed font-bold">{ansAdvice}</p>
        </div>
      </div>

      {/* 상관관계 & 번아웃 알람 */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
        <h3 className="text-sm font-black text-slate-900">🚨 데이터 상관관계 &amp; 번아웃 알람</h3>
        {alarms.map((a, i) => (
          <div key={i} className={`rounded-2xl border px-3 py-2.5 text-xs font-bold leading-relaxed ${SEV_STYLE[a.level]}`}>
            {a.text}
          </div>
        ))}
      </div>

      {/* 검진 포인트 */}
      {secretHits.length > 0 && (
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <h3 className="text-sm font-black text-slate-900">🔎 검진 포인트</h3>
          {secretHits.map((r) => (
            <div key={r.id} className={`rounded-2xl border px-3 py-2.5 text-xs font-bold ${SEV_STYLE[r.severity]}`}>
              {r.message}
            </div>
          ))}
        </div>
      )}
    </>
  );
};

const TRAIT_STRATEGY: Record<string, string> = {
  grit: '긴 목표를 주간 마일스톤으로 쪼개고, 매주 달성 체크를 하세요.',
  resilience: '슬럼프 대비 루틴(수면·산책·상담 창구)을 미리 정해두세요.',
  temperament: '새 유형 문제를 매일 1문항씩 접하는 탐구 루틴을 만드세요.',
  metacognition: '매일 10분 백지 복습(블랭크 페이퍼 리콜)을 고정하세요.',
  motivation: '목표 대학·학과 이미지를 책상 앞에 붙이고 주간 점검을 하세요.',
};

const TRAIT_LABEL: Record<string, string> = {
  grit: '끈기·실행력', resilience: '멘탈 회복탄력성', temperament: '탐구·도전 성향',
  metacognition: '메타인지 전략', motivation: '내재적 학습동기',
};

/** 처방 탭: 학습 매핑 + 신체-학습 연결 + 성향 전략 + 최적화 요약 + 실전 전략 + To-Do + Zen + 잠금 */
export const PcPrescriptionSections: React.FC<Props> = ({ result, user, onUpgradeClick }) => {
  const cp: any = result.cognitiveProfile || {};
  const an: any = (result as any).analyticsData || {};
  const traits = cp.learningTraits;
  const topTrait = traits
    ? (Object.entries(traits) as [string, number][]).sort((a, b) => b[1] - a[1])[0]
    : null;
  const premium = hasRequiredTier(user.tier, 'premium');

  const varkLabel: Record<string, string> = { V: '시각형', A: '청각형', R: '읽기/쓰기형', K: '운동감각형', multi: '복합형' };
  const weak = (result.student as any)?.weakSubject || '';
  const weakLabel: Record<string, string> = { korean: '국어', math: '수학', english: '영어', science: '과학탐구', social: '사회탐구' };
  const focus = ((result.student as any)?.focusSubjects || []) as string[];

  const dday: number | null = (() => {
    try {
      if (!user.examDate) return null;
      const t = new Date(user.examDate + 'T00:00:00').getTime();
      const n = new Date(); n.setHours(0, 0, 0, 0);
      if (isNaN(t)) return null;
      return Math.round((t - n.getTime()) / 86400000);
    } catch { return null; }
  })();

  const [zenLeft, setZenLeft] = useState<number | null>(null);
  useEffect(() => {
    if (zenLeft === null || zenLeft <= 0) return;
    const t = setTimeout(() => setZenLeft((v) => (v !== null ? v - 1 : v)), 1000);
    return () => clearTimeout(t);
  }, [zenLeft]);

  const todos: string[] = (() => {
    try {
      const list: string[] = [];
      const raw = localStorage.getItem('nbass_schedules_' + user.studentId);
      const schedules = raw ? JSON.parse(raw) : [];
      if (Array.isArray(schedules)) {
        schedules.slice(0, 4).forEach((s: any) => {
          list.push(`${s.startTime || ''} ${s.subject || ''} ${s.activity || ''}`.trim());
        });
      }
      const wn = localStorage.getItem('nbass_wrong_notes_' + user.studentId);
      const notes = wn ? JSON.parse(wn) : [];
      const today = new Date().toISOString().slice(0, 10);
      const due = (Array.isArray(notes) ? notes : []).filter(
        (n: any) => !n.isResolved && (!n.nextReviewDate || n.nextReviewDate <= today)
      ).length;
      if (due > 0) list.push(`오답 복습 ${due}문제 다시풀기`);
      const goal = dataSyncService.getSleepGoal(user.studentId);
      if (goal?.targetBedtime) list.push(`${goal.targetBedtime} 취침 (수면 목표)`);
      return list.slice(0, 6);
    } catch { return []; }
  })();

  return (
    <>
      {/* 맞춤형 학습 매핑 */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
        <h3 className="text-sm font-black text-slate-900">🗺️ 맞춤형 학습 매핑</h3>
        <div className="text-xs text-slate-700 leading-relaxed space-y-1.5 font-bold">
          <p>· 감각 채널: <strong className="text-slate-900">{varkLabel[cp.varkPrimary as string] || cp.varkPrimary || '미측정'}</strong> — 같은 내용도 이 채널로 들어올 때 흡수가 빠릅니다.</p>
          <p>· 두뇌 시간대: <strong className="text-slate-900">{cp.meqResult || '미측정'}</strong> — 고난도는 본인 피크 시간에 배치하세요.</p>
          {(weak || focus.length > 0) && (
            <p>· 집중 투자: <strong className="text-slate-900">{[weakLabel[weak], ...focus.map((f) => weakLabel[f] || f)].filter(Boolean).join(' · ')}</strong>{weak ? ` — ${weakLabel[weak]}는 취약 단원부터 메우세요.` : ''}</p>
          )}
        </div>
      </div>

      {/* 맞춤형 신체-학습 연결 리포트 */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
        <h3 className="text-sm font-black text-slate-900">🔗 맞춤형 신체-학습 연결 리포트</h3>
        <div className="text-xs text-slate-700 leading-relaxed space-y-1.5 font-bold">
          <p>· 현재 주진단 <strong className="text-slate-900">{result.careTypeName}</strong> 상태에서는 컨디션 관리가 성적과 직결됩니다.</p>
          <p>· 스트레스 저항도 {result.metrics.stressResistance}점 — 60점 미만이면 학습량보다 회복(수면·휴식)을 먼저 늘리세요.</p>
          <p>· 수면 회복력 {result.metrics.sleepEfficiency}점 — 60점 미만이면 취침 고정부터, 그 다음에 인풋을 늘리세요.</p>
        </div>
      </div>

      {/* 성향 기반 학습 전략 */}
      {topTrait && (
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <h3 className="text-sm font-black text-slate-900 mb-1">🧭 성향 기반 학습 전략</h3>
          <p className="text-xs text-slate-700 font-bold">
            최상위 기질 <strong className="text-indigo-600">{TRAIT_LABEL[topTrait[0]]} ({topTrait[1]}점)</strong> — {TRAIT_STRATEGY[topTrait[0]]}
          </p>
        </div>
      )}

      {/* 통합 학습 최적화 요약 */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <h3 className="text-sm font-black text-slate-900 mb-1">⚡ 통합 학습 최적화 요약</h3>
        <p className="text-xs text-slate-700 leading-relaxed font-bold">
          두뇌 활력 {result.metrics.brainVitality}점 · 집중 유지 {result.metrics.focusCapacity}점 · 뇌-신체 조화 {result.metrics.coherence}점.
          가장 낮은 축부터 한 가지씩만 개선하세요 — 한 번에 다 바꾸면 전부 무너집니다.
        </p>
      </div>

      {/* 수험생 실전 전략 */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <h3 className="text-sm font-black text-slate-900 mb-1.5">🎯 수험생 실전 전략 {dday !== null ? <span className="text-[10px] text-rose-600">D{dday > 0 ? `-${dday}` : dday === 0 ? '-Day' : `+${-dday}`}</span> : null}</h3>
        <ul className="list-disc pl-5 space-y-1 text-xs text-slate-700 font-bold">
          <li>시험 2주 전부터 기상·취침을 시험 당일 스케줄에 고정하세요.</li>
          <li>모르는 문제는 3분 내 풀이각이 없으면 넘기고 2회독 때 푸세요.</li>
          <li>쉬는 시간은 복도 산책·스트레칭으로 — 폰은 가방에 넣으세요.</li>
          <li>전날 밤 새로운 내용 금지, 아는 것 확인만 하세요.</li>
        </ul>
      </div>

      {/* 1일 실천 To-Do 플래너 (정기결제) */}
      {premium ? (
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <h3 className="text-sm font-black text-slate-900 mb-2">📋 1일 실천 To-Do 플래너</h3>
          {todos.length === 0 ? (
            <p className="text-[11px] text-slate-400 font-bold">오늘 할 일이 없습니다. 스케줄·오답을 등록하면 자동 생성됩니다.</p>
          ) : (
            <ul className="space-y-1.5">
              {todos.map((t, i) => (
                <li key={i} className="flex items-start gap-2 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
                  <span className="text-indigo-600">☐</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <PaywallCTA
          title="1일 실천 To-Do 플래너"
          description="스케줄·오답·수면 목표에서 오늘 할 일을 자동 생성합니다. 정기결제 회원 전용입니다."
          onUpgradeClick={onUpgradeClick}
        />
      )}

      {/* 오늘의 마음 케어 Zen (정기결제) */}
      {premium ? (
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs text-center">
          <h3 className="text-sm font-black text-slate-900 mb-1">🧘 오늘의 마음 케어 (Zen 3분)</h3>
          <p className="text-[11px] text-slate-500 font-bold mb-3">어깨를 내리고, 코로 4초 들이마시고, 7초 멈추고, 8초 내쉬세요.</p>
          {zenLeft === null ? (
            <button
              onClick={() => setZenLeft(180)}
              className="py-2.5 px-6 rounded-2xl bg-purple-600 text-white text-xs font-black active:scale-95 transition"
            >
              3분 명상 시작
            </button>
          ) : zenLeft > 0 ? (
            <p className="text-2xl font-black text-purple-600 font-mono">
              {String(Math.floor(zenLeft / 60)).padStart(2, '0')}:{String(zenLeft % 60).padStart(2, '0')}
            </p>
          ) : (
            <div className="space-y-2">
              <p className="text-xs font-black text-emerald-600">✅ 3분 마음 케어 완료! 자율신경이 안정됐습니다.</p>
              <button onClick={() => setZenLeft(null)} className="text-[11px] font-bold text-slate-400">닫기</button>
            </div>
          )}
        </div>
      ) : (
        <PaywallCTA
          title="오늘의 마음 케어 (Zen)"
          description="3분 가이드 명상과 그라운딩 루틴은 정기결제 회원 전용입니다."
          onUpgradeClick={onUpgradeClick}
        />
      )}

      {/* 잠금: 전문가 심층 · AI 스케줄링 · 생체 차트 */}
      <div className="bg-white p-5 rounded-3xl border border-dashed border-slate-300 shadow-xs space-y-2">
        <h3 className="text-sm font-black text-slate-900">🔒 심층 리포트 (준비중)</h3>
        <p className="text-[11px] text-slate-500 font-bold">· 전문가 심층 솔루션 — 전문가 검수 후 공개됩니다</p>
        <p className="text-[11px] text-slate-500 font-bold">· 생체 데이터 차트 분석 — HRV/EEG 실측 연동 후 열립니다</p>
        <p className="text-[11px] text-slate-500 font-bold">· AI 최적 학습 스케줄링 — AI 백엔드 연결 후 열립니다</p>
      </div>
    </>
  );
};

export default PcSummarySections;
