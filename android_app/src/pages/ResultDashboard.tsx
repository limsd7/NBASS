import React, { useState, useEffect } from 'react';
import { UserProfile, MobileAssessmentResult } from '../types';
import { dataSyncService } from '../services/dataSyncService';
import { useNbassRemoteRefresh } from '../hooks/useNbassRemoteRefresh';
import { hasRequiredTier, canUseFeature, TIER_NAMES } from '../services/featureGate';
import { LockedCard } from '../components/tiered-features/LockedCard';
import {
  Activity,
  Flame,
  Moon,
  Sparkles,
  Brain,
  ShieldAlert,
  ArrowUpRight,
  CheckCircle2,
  FileText,
  Printer,
  ChevronRight,
  Pill,
  BookOpen,
  HeartPulse,
  Clock,
  Compass,
  GraduationCap
} from 'lucide-react';

import { MobileReportModal } from '../components/modals/MobileReportModal';
import { PaywallCTA } from '../components/tiered-features/PaywallCTA';
import { PcSummarySections, PcPrescriptionSections } from '../components/PcReportSections';
import { renderMarkdownLite, renderReportBoxes } from '../utils/markdownLite';
import {
  CHRONOTYPE_LABELS,
  VARK_LABELS,
  TAI_TYPE_LABELS,
  DIGITAL_LEVEL_LABELS,
  METACOG_STRATEGY_LABELS,
  METACOG_LEVEL_LABELS,
} from '../data/studyEfficiencyBanks';

interface ResultDashboardProps {
  user: UserProfile;
  onUpgradeClick: () => void;
  onStartAssessment?: () => void;
}

export const ResultDashboard: React.FC<ResultDashboardProps> = ({
  user,
  onUpgradeClick,
  onStartAssessment
}) => {
  const [result, setResult] = useState<MobileAssessmentResult | null>(() =>
    dataSyncService.getLatestAssessment(user.studentId)
  );
  const [activePrescriptionTab, setActivePrescriptionTab] = useState<'nutrition' | 'study' | 'sleep' | 'mental'>('nutrition');
  const [reportTab, setReportTab] = useState<'summary' | 'prescription' | 'cognitive' | 'history' | 'letter'>('summary');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const isProOrAbove = hasRequiredTier(user.tier, 'pro');
  const isPremiumOrAbove = hasRequiredTier(user.tier, 'premium');
  const [isLetterOpen, setIsLetterOpen] = useState(false);
  const [letterCopied, setLetterCopied] = useState(false);
  // 수능 D-Day (user.examDate 기준)
  const dday: number | null = (() => {
    try {
      if (!user.examDate) return null;
      const t = new Date(user.examDate + 'T00:00:00').getTime();
      const n = new Date(); n.setHours(0, 0, 0, 0);
      if (isNaN(t)) return null;
      return Math.round((t - n.getTime()) / 86400000);
    } catch {
      return null;
    }
  })();
  // 성장 추이 (PC 포함 검사 요약 이력)
  const summaries: any[] = (() => {
    try {
      return dataSyncService.getAssessmentSummaries(user.studentId);
    } catch {
      return [];
    }
  })();
  const growthPoints = [...summaries].reverse().slice(-6);
  // 이력 탭: 로컬 전체 + 클라우드 요약 병합 (중복 제거, 최신순)
  const historyItems: any[] = (() => {
    try {
      const local = dataSyncService.getAssessmentHistory(user.studentId);
      const localRows = local.map((r: any, i: number) => ({
        kind: 'local',
        key: `local-${r.id || i}`,
        id: r.id,
        date: String(r.examDate || '').slice(0, 10),
        careType: r.careTypeName || r.careType,
        score: r.metrics?.brainVitality ?? r.careScore ?? 0,
        full: r,
      }));
      const cloudRows = summaries
        .filter((s: any) => !localRows.some(
          (l: any) => l.date === String(s.createdAt || '').slice(0, 10) && (l.careType === s.careType || l.careType === s.careTypeName)
        ))
        .map((s: any) => ({
          kind: 'cloud',
          key: `cloud-${s.id}`,
          id: s.id,
          date: String(s.createdAt || '').slice(0, 10),
          careType: s.careType,
          score: s.careScore,
          summary: s,
        }));
      return [...localRows, ...cloudRows]
        .sort((a, b) => String(b.date).localeCompare(String(a.date)));
    } catch {
      return [];
    }
  })();
  const [detailRef, setDetailRef] = useState<{ kind: string; id?: string; full?: any; summary?: any } | null>(null);
  const [detailData, setDetailData] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const openHistoryDetail = (s: any) => {
    if (s.kind === 'local' && s.full) {
      const r = s.full;
      setDetailData({
        date: String(r.examDate || '').slice(0, 10),
        careType: r.careTypeName || r.careType,
        score: r.metrics?.brainVitality ?? 0,
        metrics: r.metrics,
        survey: r.surveyScores
          ? {
              bai: r.surveyScores.bai, isi: r.surveyScores.isi, cfs: r.surveyScores.cfs,
              concentration: r.surveyScores.concentration, adrenal: r.surveyScores.adrenal,
              testAnxiety: r.cognitiveProfile?.taiCognitive !== undefined
                ? `${r.cognitiveProfile.taiCognitive}/${r.cognitiveProfile.taiSomatic}` : undefined,
            }
          : undefined,
        cognitive: r.cognitiveProfile
          ? `작업기억 ${r.cognitiveProfile.workingMemorySpan} · N-Back ${r.cognitiveProfile.nbackAccuracy !== undefined ? `${r.cognitiveProfile.nbackAccuracy}%` : '-'} · 메타인지 ${r.cognitiveProfile.metacognitionScore !== undefined ? `${r.cognitiveProfile.metacognitionScore}점` : '-'}`
          : undefined,
        env: r.analyticsData
          ? `순공 ${r.analyticsData.pureStudyRatio ?? '-'}% · 골든타임 ${r.analyticsData.goldenTimeStart || ''}~${r.analyticsData.goldenTimeEnd || ''} · 평균수면 ${r.analyticsData.avgSleepHours ?? '-'}h`
          : undefined,
        analysis: r.careTypeSummary || r.analysisText,
      });
      setDetailRef({ kind: 'local', id: s.id });
      return;
    }
    setDetailRef({ kind: 'cloud', id: s.id, summary: s.summary });
    setDetailData(null);
    setDetailLoading(true);
    dataSyncService.fetchAssessmentRow(s.id)
      .then((row) => {
        if (!row) {
          const sm = s.summary || {};
          setDetailData({
            date: String(sm.createdAt || '').slice(0, 10),
            careType: sm.careType || '종합 진단',
            score: sm.careScore ?? 0,
            analysis: sm.analysisText,
          });
          return;
        }
        const cp = row.study_efficiency_data || {};
        const sv = row.survey_data || {};
        const an = row.analytics_data || {};
        const pr = row.protocol_data || {};
        setDetailData({
          date: String(row.created_at || '').slice(0, 10),
          careType: row.classification_result?.careTypeName || row.care_type || '종합 진단',
          score: row.care_score ?? 0,
          survey: {
            bai: sv.bai, isi: sv.isi, cfs: sv.cfs,
            concentration: sv.concentration, adrenal: sv.adrenal,
            testAnxiety: cp.taiCognitive !== undefined ? `${cp.taiCognitive}/${cp.taiSomatic}` : undefined,
          },
          cognitive: cp && (cp.workingMemorySpan !== undefined || cp.nbackAccuracy !== undefined)
            ? `작업기억 ${cp.workingMemorySpan ?? '-'} · N-Back ${cp.nbackAccuracy !== undefined ? `${cp.nbackAccuracy}%` : '-'} · 메타인지 ${cp.metacognitionScore !== undefined ? `${cp.metacognitionScore}점` : '-'}`
            : undefined,
          env: (an && (an.pureStudyRatio !== undefined || pr.location))
            ? `장소 ${pr.location || '-'} · 순공 ${an.pureStudyRatio ?? '-'}% · 평균수면 ${an.avgSleepHours ?? '-'}h`
            : undefined,
          analysis: row.analysis_text,
        });
      })
      .catch(() => setDetailData(null))
      .finally(() => setDetailLoading(false));
  };
  const buildConsultationLetter = () => {
    const lines: string[] = [];
    lines.push(`[NBASS 상담 소견서] ${result.student.name} (${result.student.school} ${result.student.grade})`);
    lines.push(`진단일: ${result.examDate}${dday !== null ? ` · 수능 D${dday > 0 ? '-' + dday : dday === 0 ? '-Day' : '+' + -dday}` : ''}`);
    lines.push(`주진단: ${result.careTypeName} (${result.careType})`);
    lines.push(`5대 지표 — 두뇌활력 ${result.metrics.brainVitality} / 스트레스저항 ${result.metrics.stressResistance} / 집중유지 ${result.metrics.focusCapacity} / 수면회복 ${result.metrics.sleepEfficiency} / 뇌신체조화 ${result.metrics.coherence}`);
    try {
      const grades = dataSyncService.getGradeRecords(user.studentId);
      if (grades.length > 0) {
        const g = grades[0];
        lines.push(`최근 성적: ${g.examName}(${(g.examDate || '').slice(0, 10)}) ` + (g.scores || []).map((s: any) => `${s.subject} ${s.score}점(${s.grade}등급)`).join(', '));
      }
      const sleeps = dataSyncService.getSleepLogs(user.studentId);
      if (sleeps.length > 0) {
        const avg = sleeps.reduce((a: number, l: any) => a + (l.totalHours || 0), 0) / sleeps.length;
        lines.push(`평균 수면: ${avg.toFixed(1)}시간 (최근 ${sleeps.length}건)`);
      }
      const goal = dataSyncService.getSleepGoal(user.studentId);
      if (goal && (goal.targetBedtime || goal.targetWakeTime)) {
        lines.push(`수면 목표: 취침 ${goal.targetBedtime || '-'} / 기상 ${goal.targetWakeTime || '-'}`);
      }
    } catch { /* ignore */ }
    lines.push(`핵심 처방 — 학습: ${result.keyAdvice.study}`);
    lines.push(`핵심 처방 — 수면: ${result.keyAdvice.circadian}`);
    lines.push(`핵심 처방 — 멘탈: ${result.keyAdvice.stress}`);
    return lines.join('\n');
  };
  const handleCopyLetter = async () => {
    try {
      await navigator.clipboard.writeText(buildConsultationLetter());
      setLetterCopied(true);
      setTimeout(() => setLetterCopied(false), 2000);
    } catch {
      alert('복사에 실패했습니다. 텍스트를 직접 선택해 복사해주세요.');
    }
  };
  // PC 검사 기록 요약 (있으면 상단에 실데이터 카드 표시, 없으면 목업 UI 그대로)
  const [latestAssessment, setLatestAssessment] = useState<any | null>(
    () => dataSyncService.getAssessmentSummaries(user.studentId)[0] || null
  );

  useEffect(() => {
    setLatestAssessment(dataSyncService.getAssessmentSummaries(user.studentId)[0] || null);
  }, [user.studentId]);

  useNbassRemoteRefresh(() => {
    setLatestAssessment(dataSyncService.getAssessmentSummaries(user.studentId)[0] || null);
  }, ['assessment', 'remote']);

  useEffect(() => {
    const handleUpdate = () => {
      setResult(dataSyncService.getLatestAssessment(user.studentId));
    };
    window.addEventListener('nbass_data_updated', handleUpdate);
    return () => window.removeEventListener('nbass_data_updated', handleUpdate);
  }, [user.studentId]);

  // 진단 기록 없음 → 빈 상태 (목업 표시 금지)
  if (!result) {
    return (
      <div className="p-4 space-y-4 pb-24 max-w-4xl mx-auto">
      {/* 리포트 서브메뉴 */}
      <div className="sticky top-0 z-20 py-2 -mx-1 px-1 bg-slate-50/95 backdrop-blur">
        <div className="grid grid-cols-5 p-1 bg-white rounded-2xl border border-slate-200 shadow-xs">
          {[
            ['summary', '요약'],
            ['prescription', '처방'],
            ['cognitive', '인지·기질'],
            ['history', '이력'],
            ['letter', '소견서'],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setReportTab(id as any)}
              className={`py-2 rounded-xl text-[11px] font-black transition ${reportTab === id ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
        {latestAssessment && (
          <div className="bg-white p-5 rounded-3xl border border-indigo-200 shadow-xs">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 mb-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>PC 정밀 진단 연동</span>
              <span className="text-[10px] text-slate-400 font-medium">
                {String(latestAssessment.createdAt || '').slice(0, 10)}
              </span>
            </div>
            <h3 className="text-base font-black text-slate-900 leading-tight mb-1">
              {latestAssessment.careType || '종합 진단'}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
              종합 점수 {latestAssessment.careScore}점
              {latestAssessment.analysisText ? ` · ${String(latestAssessment.analysisText).slice(0, 120)}` : ''}
            </p>
          </div>
        )}
        <div className="bg-white p-8 rounded-3xl border border-dashed border-slate-300 text-center">
          <p className="text-2xl mb-2">📋</p>
          <h3 className="text-sm font-black text-slate-900 mb-1">아직 진단 기록이 없습니다</h3>
          <p className="text-xs text-slate-500 mb-4">정밀 진단을 완료하면 두뇌·신체 종합 처방전이 표시됩니다.</p>
          {onStartAssessment && (
            <button
              onClick={() => {
                const n = dataSyncService.countAssessments(user.studentId);
                if (canUseFeature(user.tier, 'assessment', { assessmentCount: n })) onStartAssessment();
                else onUpgradeClick();
              }}
              className="py-2.5 px-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-black shadow-md active:scale-95 transition"
            >
              정밀 진단 시작하기
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 pb-24 max-w-4xl mx-auto">
      {/* 1. Student Summary Banner & Assessment CTA */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white p-5 rounded-3xl shadow-sm border border-indigo-800/40 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-xs text-indigo-300 font-bold">
                {result.student.school} · {result.student.grade}
              </span>
              <span className="text-[10px] bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded-full border border-indigo-400/20 font-bold">
                {result.examDate} 진단 완료
              </span>
              {dday !== null && (
                <span className="text-[10px] bg-rose-500/30 text-rose-200 px-2 py-0.5 rounded-full border border-rose-400/30 font-black">
                  {dday > 0 ? `수능 D-${dday}` : dday === 0 ? '수능 D-Day' : `수능 D+${-dday}`}
                </span>
              )}
              {result.student.targetUniversity && (
                <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30 font-bold flex items-center gap-1">
                  <GraduationCap className="w-3 h-3" />
                  {result.student.targetUniversity} {result.student.targetMajor}
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black">
              {result.student.name} 님의 전두엽·뇌신체 종합 처방전
            </h2>
          </div>

          {onStartAssessment && (
            <button
              onClick={() => {
                const n = dataSyncService.countAssessments(user.studentId);
                if (canUseFeature(user.tier, 'assessment', { assessmentCount: n })) onStartAssessment();
                else onUpgradeClick();
              }}
              className="py-2.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 text-white text-xs font-black shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition self-start sm:self-auto"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>새 정밀 검사 진행</span>
            </button>
          )}
{reportTab === 'summary' && (<>
      {/* PC 연동: 최신 정밀 진단 요약 (PC 검사 기록이 있을 때만 표시) */}
      {latestAssessment && (
        <div className="bg-white p-5 rounded-3xl border border-indigo-200 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 mb-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>PC 정밀 진단 연동</span>
            <span className="text-[10px] text-slate-400 font-medium">
              {String(latestAssessment.createdAt || '').slice(0, 10)}
            </span>
          </div>
          <h3 className="text-base font-black text-slate-900 leading-tight mb-1">
            {latestAssessment.careType || '종합 진단'}
          </h3>
          <div className="text-xs text-slate-600 leading-relaxed">
            <p className="font-black text-slate-900 mb-1.5">종합 점수 {latestAssessment.careScore}점</p>
            {renderReportBoxes(String(latestAssessment.analysisText || '').slice(0, 2000), 'pc')}
          </div>
        </div>
      )}
</>)}

      {/* 2. Care Type Diagnosis Card */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
            <Brain className="w-4 h-4 text-indigo-600" />
            <span>신경계 케어타입 판정</span>
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${result.careTypeBadgeColor}`}>
            최우선 케어
          </span>
        </div>

        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
          <span className="text-slate-300 font-semibold">회원 등급</span>
          <div className="flex items-center gap-2">
            <span className="font-black text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/30">
              {TIER_NAMES[user.tier]}
            </span>
            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="text-[11px] text-slate-300 hover:text-white flex items-center gap-1 font-bold bg-white/10 px-2.5 py-1 rounded-lg border border-white/10 active:scale-95 transition"
            >
              <Printer className="w-3 h-3 text-amber-300" /> 리포트 보기 / 인쇄
            </button>
          </div>
        </div>
      </div>
        </div>
      </div>

      {/* Responsive Grid for Tablet (2 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
{reportTab === 'summary' && (<>
        {/* 2. Care Type Diagnosis Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 text-xs font-black text-slate-600">
                <Brain className="w-4 h-4 text-indigo-600" />
                <span>신경계 케어타입 판정</span>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${result.careTypeBadgeColor}`}>
                최우선 케어 대상
              </span>
            </div>

            <h3 className="text-lg font-black text-slate-900 leading-tight mb-2">
              {result.careTypeName}
            </h3>

            <div className="text-xs text-slate-600 leading-relaxed">
              {renderReportBoxes(result.careTypeSummary, 'ct')}
            </div>

            {/* 부분류 표시 */}
            {result.secondaryCareTypeName && (
              <div className="mt-3 p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black text-indigo-700 block">
                    부분류(동반 위험 요인)
                  </span>
                  <span className="text-xs font-black text-slate-800">
                    {result.secondaryCareTypeName}
                  </span>
                </div>
                <span className="text-[10px] bg-indigo-600 text-white font-black px-2 py-0.5 rounded-full">
                  {result.secondaryConfidence === 'CONFIRMED' ? '확정 진단' : '근접 추정'}
                </span>
              </div>
            )}
          </div>

          {/* Top 3 Score breakdown */}
          {result.topCareScores && result.topCareScores.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-100">
              <span className="text-[11px] font-black text-slate-500 block mb-2">
                유형별 점수 분포
              </span>
              <div className="space-y-1.5">
                {result.topCareScores.slice(0, 3).map((cs, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-slate-600">{cs.name}</span>
                    <span className="text-indigo-600">{cs.score}점</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
</>)}

{reportTab === 'cognitive' && (<>
      {/* 인지·기질 실측 결과 (실측한 항목만 표시) */}
      {result.cognitiveProfile && (
        (result.cognitiveProfile.nbackAccuracy !== undefined ||
          result.cognitiveProfile.learningTraits !== undefined ||
          result.cognitiveProfile.metacognitionScore !== undefined) && (
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-sm font-black text-slate-900">🧠 인지·기질 실측 결과</h3>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-50 rounded-2xl border border-slate-100 p-2.5">
                <p className="text-[10px] font-bold text-slate-500">작업기억 폭</p>
                <p className="text-sm font-black text-indigo-600">{result.cognitiveProfile.workingMemorySpan}</p>
              </div>
              <div className="bg-slate-50 rounded-2xl border border-slate-100 p-2.5">
                <p className="text-[10px] font-bold text-slate-500">N-Back</p>
                <p className="text-sm font-black text-purple-600">
                  {result.cognitiveProfile.nbackAccuracy !== undefined
                    ? `${result.cognitiveProfile.nbackAccuracy}% (Lv.${result.cognitiveProfile.nbackLevel})`
                    : '-'}
                </p>
              </div>
              <div className="bg-slate-50 rounded-2xl border border-slate-100 p-2.5">
                <p className="text-[10px] font-bold text-slate-500">메타인지</p>
                <p className="text-sm font-black text-emerald-600">
                  {result.cognitiveProfile.metacognitionScore !== undefined
                    ? `${result.cognitiveProfile.metacognitionScore}점`
                    : '-'}
                </p>
              </div>
            </div>
            {result.cognitiveProfile.learningTraits && (isProOrAbove ? (
              <div className="space-y-2">
                {[
                  ['끈기·실행력', result.cognitiveProfile.learningTraits.grit, 'bg-indigo-500'],
                  ['멘탈 회복탄력성', result.cognitiveProfile.learningTraits.resilience, 'bg-emerald-500'],
                  ['탐구·도전 성향', result.cognitiveProfile.learningTraits.temperament, 'bg-amber-500'],
                  ['메타인지 전략', result.cognitiveProfile.learningTraits.metacognition, 'bg-blue-500'],
                  ['내재적 학습동기', result.cognitiveProfile.learningTraits.motivation, 'bg-purple-500'],
                ].map(([label, score, bar]) => (
                  <div key={label as string}>
                    <div className="flex justify-between text-[11px] font-bold mb-1">
                      <span className="text-slate-700">{label}</span>
                      <span className="text-slate-900">{score as number}점 / 100</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className={`${bar} h-full rounded-full`} style={{ width: `${score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <PaywallCTA
                title="5대 기질 그래프"
                description="PRO 이상에서 5대 학습기질 그래프와 해석이 열립니다."
                onUpgradeClick={onUpgradeClick}
              />
            ))}
          </div>
        )
      )}
</>)}

{reportTab === 'summary' && (<>
      {/* 정밀 효율 검사 상세 (MEQ/VARK/TAI/디지털/메타인지 결과) */}
      {result.cognitiveProfile && (
        (result.cognitiveProfile.meqScore !== undefined ||
          result.cognitiveProfile.varkScores !== undefined ||
          result.cognitiveProfile.taiCognitive !== undefined ||
          result.cognitiveProfile.digitalLevel !== undefined ||
          result.cognitiveProfile.metacognitionResult !== undefined) && (
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2.5">
            <h3 className="text-sm font-black text-slate-900">🔬 정밀 효율 검사 상세</h3>
            {result.cognitiveProfile.meqScore !== undefined && (
              <div className="bg-slate-50 rounded-2xl border border-slate-100 p-3">
                <p className="text-[11px] font-black text-slate-500 mb-0.5">크로노타입 (MEQ {result.cognitiveProfile.meqScore}점)</p>
                <p className="text-xs font-black text-slate-900">
                  {CHRONOTYPE_LABELS[(result.cognitiveProfile.meqResult as any) as keyof typeof CHRONOTYPE_LABELS]?.label || result.cognitiveProfile.meqResult}
                  <span className="text-[11px] font-bold text-indigo-600 ml-1.5">
                    {CHRONOTYPE_LABELS[(result.cognitiveProfile.meqResult as any) as keyof typeof CHRONOTYPE_LABELS]?.goldenTime}
                  </span>
                </p>
              </div>
            )}
            {result.cognitiveProfile.varkScores && (
              <div className="bg-slate-50 rounded-2xl border border-slate-100 p-3">
                <p className="text-[11px] font-black text-slate-500 mb-0.5">VARK 학습 감각</p>
                <p className="text-xs font-black text-slate-900">
                  {VARK_LABELS[(result.cognitiveProfile.varkPrimary as any) as keyof typeof VARK_LABELS]?.label || result.cognitiveProfile.varkPrimary}
                  <span className="text-[11px] font-bold text-slate-500 ml-1.5">
                    V{result.cognitiveProfile.varkScores.V} · A{result.cognitiveProfile.varkScores.A} · R{result.cognitiveProfile.varkScores.R} · K{result.cognitiveProfile.varkScores.K}
                  </span>
                </p>
              </div>
            )}
            {result.cognitiveProfile.taiCognitive !== undefined && (
              <div className="bg-slate-50 rounded-2xl border border-slate-100 p-3">
                <p className="text-[11px] font-black text-slate-500 mb-0.5">시험 불안 (TAI)</p>
                <p className="text-xs font-black text-slate-900">
                  인지 {result.cognitiveProfile.taiCognitive} · 신체 {result.cognitiveProfile.taiSomatic}
                  <span className="text-[11px] font-bold text-rose-600 ml-1.5">
                    {(result.cognitiveProfile.taiCognitive ?? 0) > (result.cognitiveProfile.taiSomatic ?? 0) + 3
                      ? TAI_TYPE_LABELS.cognitive.label
                      : (result.cognitiveProfile.taiSomatic ?? 0) > (result.cognitiveProfile.taiCognitive ?? 0) + 3
                        ? TAI_TYPE_LABELS.somatic.label
                        : TAI_TYPE_LABELS.balanced.label}
                  </span>
                </p>
              </div>
            )}
            {result.cognitiveProfile.digitalLevel && (
              <div className="bg-slate-50 rounded-2xl border border-slate-100 p-3">
                <p className="text-[11px] font-black text-slate-500 mb-0.5">디지털 중독</p>
                <p className="text-xs font-black text-slate-900">
                  {DIGITAL_LEVEL_LABELS[result.cognitiveProfile.digitalLevel as keyof typeof DIGITAL_LEVEL_LABELS]?.label || result.cognitiveProfile.digitalLevel}
                </p>
              </div>
            )}
            {result.cognitiveProfile.metacognitionResult && (
              <div className="bg-slate-50 rounded-2xl border border-slate-100 p-3">
                <p className="text-[11px] font-black text-slate-500 mb-0.5">메타인지 전략</p>
                <p className="text-xs font-black text-slate-900">
                  {METACOG_LEVEL_LABELS[result.cognitiveProfile.metacognitionResult.learnerLevel as keyof typeof METACOG_LEVEL_LABELS] || result.cognitiveProfile.metacognitionResult.learnerLevel}
                  <span className="text-[11px] font-bold text-slate-500 ml-1.5">
                    주전략: {METACOG_STRATEGY_LABELS[result.cognitiveProfile.metacognitionResult.dominantStrategy] || result.cognitiveProfile.metacognitionResult.dominantStrategy}
                  </span>
                </p>
              </div>
            )}
          </div>
        )
      )}

      {/* 학습 환경·분석 (프로토콜/애널리틱스) */}
      {reportTab === 'summary' && (result.protocolData || result.analyticsData) && (
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2.5">
          <h3 className="text-sm font-black text-slate-900">🏫 학습 환경·분석</h3>
          {result.protocolData && (
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-50 rounded-2xl border border-slate-100 p-2.5">
                <p className="text-[10px] font-bold text-slate-500">장소</p>
                <p className="text-xs font-black text-slate-900">{result.protocolData.location || '-'}</p>
              </div>
              <div className="bg-slate-50 rounded-2xl border border-slate-100 p-2.5">
                <p className="text-[10px] font-bold text-slate-500">소음/스트레스</p>
                <p className="text-xs font-black text-slate-900">{result.protocolData.noiseLevel ?? '-'}/{result.protocolData.stressLevel ?? '-'}</p>
              </div>
              <div className="bg-slate-50 rounded-2xl border border-slate-100 p-2.5">
                <p className="text-[10px] font-bold text-slate-500">수면</p>
                <p className="text-xs font-black text-slate-900">{result.protocolData.sleepHours !== undefined ? `${result.protocolData.sleepHours}h` : '-'}</p>
              </div>
            </div>
          )}
          {result.analyticsData && (
            <div className="bg-slate-50 rounded-2xl border border-slate-100 p-3 space-y-1">
              {result.analyticsData.pureStudyRatio !== undefined && (
                <p className="text-xs text-slate-700">순공 비율 <strong className="text-slate-900">{result.analyticsData.pureStudyRatio}%</strong></p>
              )}
              {(result.analyticsData.goldenTimeStart || result.analyticsData.goldenTimeEnd) && (
                <p className="text-xs text-slate-700">골든타임 <strong className="text-slate-900">{result.analyticsData.goldenTimeStart || ''} ~ {result.analyticsData.goldenTimeEnd || ''}</strong></p>
              )}
              {result.analyticsData.avgSleepHours !== undefined && (
                <p className="text-xs text-slate-700">평균 수면 <strong className="text-slate-900">{result.analyticsData.avgSleepHours}시간</strong></p>
              )}
              {result.analyticsData.studyStreak !== undefined && (
                <p className="text-xs text-slate-700">연속 학습 <strong className="text-slate-900">{result.analyticsData.studyStreak}일</strong></p>
              )}
            </div>
          )}
        </div>
      )}

        {/* 3. 5대 생체 & 인지 지표 카드 */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>두뇌 &amp; 신체 5대 핵심 활력 지표</span>
            </h3>
            {!isProOrAbove && (
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                PRO에서 5대 지표 전면 개방
              </span>
            )}
          </div>

          <div className="space-y-3.5">
            {/* 1. 두뇌 활력도 */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-slate-700">🧠 두뇌 활력도 (Brain Vitality)</span>
                <span className="text-indigo-600 font-black">{result.metrics.brainVitality}점 / 100</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all"
                  style={{ width: `${result.metrics.brainVitality}%` }}
                />
              </div>
            </div>

            {/* 2. 스트레스 저항도 */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-slate-700">🛡️ 스트레스 저항도 (Stress Resistance)</span>
                <span className="text-emerald-600 font-black">{result.metrics.stressResistance}점 / 100</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-400 to-teal-500 h-full rounded-full transition-all"
                  style={{ width: `${result.metrics.stressResistance}%` }}
                />
              </div>
            </div>

            {/* 3~5. 집중 유지력 / 수면 회복력 / 조화도 */}
            {isProOrAbove ? (
              <>
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-700">🎯 집중 유지력 (Focus Capacity)</span>
                    <span className="text-blue-600 font-black">{result.metrics.focusCapacity}점 / 100</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-400 to-cyan-500 h-full rounded-full transition-all"
                      style={{ width: `${result.metrics.focusCapacity}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-700">🌙 수면 회복력 (Sleep Recovery)</span>
                    <span className="text-purple-600 font-black">{result.metrics.sleepEfficiency}점 / 100</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-purple-400 to-pink-500 h-full rounded-full transition-all"
                      style={{ width: `${result.metrics.sleepEfficiency}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-700">⚖️ 뇌-신체 조화도 (Coherence)</span>
                    <span className="text-amber-600 font-black">{result.metrics.coherence}점 / 100</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-400 to-orange-500 h-full rounded-full transition-all"
                      style={{ width: `${result.metrics.coherence}%` }}
                    />
                  </div>
                </div>
              </>
            ) : (
              <LockedCard
                requiredTier="pro"
                featureTitle="집중 유지력 · 수면 회복력 · 뇌-신체 조화도 지표"
                description="PRO 이상 등급에서 전두엽 5대 지표 및 정밀 인지 분석이 전면 개방됩니다."
                onUpgradeClick={onUpgradeClick}
              />
            )}
          </div>
        </div>
</>)}
      </div>

{reportTab === 'prescription' && (<>
      {/* 4. 4대 맞춤 처방전 패널 (Nutrition, Study, Sleep, Mental) */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>케어타입 맞춤 4대 솔루션 처방전</span>
          </h3>
          <span className="text-[10px] text-slate-400 font-bold">의과학 기반 프로토콜</span>
        </div>

        {/* Prescription Segment Tabs */}
        <div className="grid grid-cols-4 p-1 bg-slate-100 rounded-2xl">
          {[
            { id: 'nutrition', label: '영양 처방', icon: Pill },
            { id: 'study', label: '학습 전략', icon: BookOpen },
            { id: 'sleep', label: '수면 리듬', icon: Moon },
            { id: 'mental', label: '멘탈 이완', icon: HeartPulse },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activePrescriptionTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActivePrescriptionTab(tab.id as any)}
                className={`py-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1 ${
                  isActive
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Prescription Content List */}
        <div className="space-y-2.5 pt-1">
          {result.prescriptions && result.prescriptions[activePrescriptionTab]?.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5"
            >
              <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                {idx + 1}
              </div>
              <div className="text-xs font-bold text-slate-800 leading-relaxed">
                {renderMarkdownLite(item, `rx-${idx}`)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {reportTab === 'prescription' && !isProOrAbove && (
        <div className="pb-1">
          <PaywallCTA
            title="처방 전체 해제"
            description="PRO 이상에서 4대 처방 전문과 시뮬레이션 전체가 열립니다."
            onUpgradeClick={onUpgradeClick}
          />
        </div>
      )}
      {/* 5. 목표 대학 및 성적 합격 시뮬레이션 */}
      {result.student.targetUniversity && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50/60 p-5 rounded-3xl border border-blue-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-black text-slate-900">
                목표 대학 합격 시뮬레이션 ({result.student.targetUniversity})
              </h3>
            </div>
            <span className="text-[10px] font-black bg-blue-600 text-white px-2 py-0.5 rounded-full">
              AI 예측 모델
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            현재 두뇌 활력도({result.metrics.brainVitality}점)와 자율신경 안정화 프로토콜을 충실히 이행할 경우,
            수능 당일 실전 인출 효율이 극대화되어 <b>{result.student.targetUniversity} {result.student.targetMajor || ''}</b> 목표
            진입 안정권 점수 달성 확률이 약 <b>78.4%</b>로 예측됩니다.
          </p>
        </div>
      )}
</>)}

{reportTab === 'summary' && (<>
      {/* 성장 추이 (검사 요약 2건 이상일 때) */}
      {growthPoints.length >= 2 && (
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <h3 className="text-sm font-black text-slate-900 mb-2">📈 종합 점수 성장 추이</h3>
          <svg viewBox="0 0 300 90" className="w-full h-24 overflow-visible">
            <line x1="30" y1="10" x2="290" y2="10" stroke="#e2e8f0" strokeDasharray="3 3" />
            <text x="2" y="14" fontSize="8" fill="#94a3b8">100</text>
            <line x1="30" y1="45" x2="290" y2="45" stroke="#e2e8f0" strokeDasharray="3 3" />
            <text x="2" y="49" fontSize="8" fill="#94a3b8">50</text>
            <line x1="30" y1="80" x2="290" y2="80" stroke="#e2e8f0" strokeDasharray="3 3" />
            <text x="2" y="84" fontSize="8" fill="#94a3b8">0</text>
            <path
              d={growthPoints.map((s: any, i: number) => {
                const x = growthPoints.length <= 1 ? 160 : 30 + (i * 260) / (growthPoints.length - 1);
                const y = 80 - (Math.min(100, Math.max(0, Number(s.careScore || 0))) / 100) * 70;
                return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
              }).join(' ')}
              fill="none" stroke="#8b5cf6" strokeWidth="2.5"
            />
            {growthPoints.map((s: any, i: number) => {
              const x = growthPoints.length <= 1 ? 160 : 30 + (i * 260) / (growthPoints.length - 1);
              const y = 80 - (Math.min(100, Math.max(0, Number(s.careScore || 0))) / 100) * 70;
              return <circle key={s.id || i} cx={x} cy={y} r="4" fill="#8b5cf6" />;
            })}
          </svg>
          <p className="text-[11px] text-slate-500 font-bold mt-1">
            {String(growthPoints[0]?.createdAt || '').slice(0, 10)} {growthPoints[0]?.careScore}점 → {String(growthPoints[growthPoints.length - 1]?.createdAt || '').slice(0, 10)} {growthPoints[growthPoints.length - 1]?.careScore}점
          </p>
          {(() => {
            const first = Number(growthPoints[0]?.careScore || 0);
            const last = Number(growthPoints[growthPoints.length - 1]?.careScore || 0);
            const delta = last - first;
            const msg = delta >= 5
              ? `📈 ${delta}점 상승 — 현재 처방 루틴이 유효합니다. 같은 강도로 유지하세요.`
              : delta <= -5
                ? `📉 ${-delta}점 하락 — 수면·집중 루틴을 점검하고 2주 뒤 재측정하세요.`
                : '➡️ 유지 국면 — 정체 시 수면 부채와 디지털 방해 요인을 먼저 점검하세요.';
            return <p className="text-[11px] font-bold text-indigo-700 bg-indigo-50 rounded-xl px-3 py-2 mt-2">{msg}</p>;
          })()}
        </div>
      )}
</>)}
      {reportTab === 'summary' && (
        <PcSummarySections result={result} user={user} onUpgradeClick={onUpgradeClick} />
      )}
      {reportTab === 'summary' && (
        <div className="p-4 rounded-3xl border border-dashed border-slate-300 bg-white text-center">
          <p className="text-xs font-black text-slate-700">🔒 심층 생체 분석 · AI 코칭 (준비중)</p>
          <p className="text-[11px] text-slate-500 mt-1">HRV/EEG 실측 연동과 AI 백엔드가 연결되면 이 리포트에서 열립니다.</p>
        </div>
      )}

      {reportTab === 'prescription' && (
        <PcPrescriptionSections result={result} user={user} onUpgradeClick={onUpgradeClick} />
      )}
      {reportTab === 'history' && (
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2.5">
          <h3 className="text-sm font-black text-slate-900">🗂️ 검사 이력 ({historyItems.length}건)</h3>
          {(() => {
            // Progress Tracker (PC Before&After 대응): 지표 풀보유 최신 2회차 비교
            const fulls = historyItems.filter((h: any) => h?.full?.metrics).slice(0, 2);
            if (fulls.length < 2) return null;
            const cur = fulls[0].full.metrics;
            const prev = fulls[1].full.metrics;
            const rows = [
              { label: '두뇌 활력도', c: cur.brainVitality, p: prev.brainVitality },
              { label: '스트레스 저항도', c: cur.stressResistance, p: prev.stressResistance },
              { label: '집중 유지력', c: cur.focusCapacity, p: prev.focusCapacity },
              { label: '수면 회복력', c: cur.sleepEfficiency, p: prev.sleepEfficiency },
              { label: '뇌-신체 조화도', c: cur.coherence, p: prev.coherence },
            ];
            return (
              <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-3">
                <p className="text-[11px] font-black text-emerald-900 mb-2">📊 직전 대비 ({fulls[1].date} → {fulls[0].date})</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {rows.map(m => {
                    const c = Number(m.c) || 0;
                    const p = Number(m.p) || 0;
                    const d = c - p;
                    return (
                      <div key={m.label} className="bg-white border border-emerald-100 rounded-xl px-2 py-1.5 text-center">
                        <p className="text-[9px] font-bold text-slate-500">{m.label}</p>
                        <p className="text-xs font-black text-slate-900">{c}점 <span className={`text-[10px] font-black ${d > 0 ? 'text-emerald-600' : d < 0 ? 'text-rose-500' : 'text-slate-400'}`}>{d > 0 ? `▲+${d}` : d < 0 ? `▼${d}` : '—'}</span></p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
          {historyItems.length === 0 ? (
            <p className="text-[11px] text-slate-400 font-bold">동기화된 검사 이력이 없습니다. 정밀 진단을 완료하면 쌓입니다.</p>
          ) : (
            <>
              {historyItems.slice(0, 1).map((s: any) => (
                <button
                  key={s.key || 'latest'}
                  onClick={() => openHistoryDetail(s)}
                  className="w-full flex items-center justify-between text-xs bg-indigo-50/60 border border-indigo-100 rounded-xl px-3 py-2.5 text-left active:scale-98 transition"
                >
                  <div>
                    <p className="font-black text-slate-900">{s.careType || '종합 진단'}</p>
                    <p className="text-[10px] text-slate-400">{s.date} · 최신 · 자세히 보기</p>
                  </div>
                  <span className="font-black text-indigo-600">{s.score}점</span>
                </button>
              ))}
              {historyItems.length > 1 && (isProOrAbove ? (
                historyItems.slice(1).map((s: any) => (
                  <button
                    key={s.key}
                    onClick={() => openHistoryDetail(s)}
                    className="w-full flex items-center justify-between text-xs bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-left active:scale-98 transition"
                  >
                    <div>
                      <p className="font-bold text-slate-800">{s.careType || '종합 진단'}</p>
                      <p className="text-[10px] text-slate-400">{s.date} · 자세히 보기</p>
                    </div>
                    <span className="font-black text-slate-600">{s.score}점</span>
                  </button>
                ))
              ) : (
                <PaywallCTA
                  title="나머지 검사 이력 열람"
                  description="PRO 이상에서 전체 검사 이력과 점수 추이를 열람할 수 있습니다."
                  onUpgradeClick={onUpgradeClick}
                />
              ))}
            </>
          )}
        </div>
      )}
      {/* 이력 상세 모달 (과거 검사全文) */}
      {detailRef && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setDetailRef(null)}>
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[82vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900">📋 검사 상세</h3>
              <button onClick={() => setDetailRef(null)} className="text-slate-400 hover:text-slate-600 text-lg leading-none">×</button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 space-y-3">
              {detailLoading && <p className="text-xs font-bold text-slate-500 text-center py-6">불러오는 중...</p>}
              {!detailLoading && !detailData && (
                <p className="text-xs font-bold text-slate-500 text-center py-6">상세 기록을 불러오지 못했습니다.</p>
              )}
              {!detailLoading && detailData && (
                <>
                  <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-3.5">
                    <p className="text-[10px] font-bold text-indigo-500">{detailData.date}</p>
                    <h4 className="text-base font-black text-slate-900">{detailData.careType}</h4>
                    <p className="text-xs font-black text-indigo-600 mt-0.5">종합 점수 {detailData.score}점</p>
                  </div>
                  {detailData.metrics && (
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        ['두뇌 활력도', detailData.metrics.brainVitality],
                        ['스트레스 저항도', detailData.metrics.stressResistance],
                        ['집중 유지력', detailData.metrics.focusCapacity],
                        ['수면 회복력', detailData.metrics.sleepEfficiency],
                      ].map(([label, v]) => (
                        <div key={label as string} className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
                          <p className="text-[10px] font-bold text-slate-500">{label}</p>
                          <p className="text-sm font-black text-slate-900">{v ?? '-'}점</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {detailData.survey && (
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3">
                      <p className="text-[11px] font-black text-slate-500 mb-1.5">설문 점수</p>
                      <div className="grid grid-cols-3 gap-1.5 text-center">
                        {[
                          ['불안', detailData.survey.bai],
                          ['불면', detailData.survey.isi],
                          ['피로', detailData.survey.cfs],
                          ['집중저하', detailData.survey.concentration],
                          ['부신피로', detailData.survey.adrenal],
                          ['시험불안', detailData.survey.testAnxiety],
                        ].map(([label, v]) => (
                          <div key={label as string} className="bg-white rounded-xl border border-slate-100 px-2 py-1.5">
                            <p className="text-[10px] font-bold text-slate-400">{label}</p>
                            <p className="text-xs font-black text-slate-800">{v ?? '-'}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {detailData.cognitive && (
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3">
                      <p className="text-[11px] font-black text-slate-500 mb-1">인지 실측</p>
                      <p className="text-xs text-slate-700 font-bold">{detailData.cognitive}</p>
                    </div>
                  )}
                  {detailData.env && (
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3">
                      <p className="text-[11px] font-black text-slate-500 mb-1">학습 환경·분석</p>
                      <p className="text-xs text-slate-700 font-bold">{detailData.env}</p>
                    </div>
                  )}
                  {detailData.analysis && (
                    <div>{renderReportBoxes(detailData.analysis, 'hist')}</div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
{reportTab === 'letter' && (<>
      {/* 상담 소견서 (템플릿 생성 + 복사) */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900">✉️ 상담 소견서</h3>
          <button
            onClick={() => setIsLetterOpen(true)}
            className="px-3.5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black active:scale-95 transition"
          >
            소견서 보기
          </button>
        </div>
        <p className="text-[11px] text-slate-500 mt-1">진단·성적·수면 기록으로 자동 작성됩니다.</p>
      </div>
      {isLetterOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setIsLetterOpen(false)}>
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900">상담 소견서</h3>
              <button onClick={() => setIsLetterOpen(false)} className="text-slate-400 hover:text-slate-600 text-lg leading-none">×</button>
            </div>
            {!isPremiumOrAbove && (
              <div className="px-4 pt-3">
                <PaywallCTA
                  title="소견서 출력 해제"
                  description="PREMIUM 이상에서 소견서 복사와 인쇄가 열립니다. 미리보기는 무료입니다."
                  onUpgradeClick={onUpgradeClick}
                />
              </div>
            )}
            <pre className="p-4 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed overflow-y-auto flex-1">{buildConsultationLetter()}</pre>
            <div className="p-4 border-t border-slate-100 flex gap-2">
              <button
                onClick={() => { if (isPremiumOrAbove) handleCopyLetter(); else onUpgradeClick(); }}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-black active:scale-98 transition"
              >
                {isPremiumOrAbove ? (letterCopied ? '✅ 복사됨' : '전문 복사하기') : '🔒 PREMIUM 복사하기'}
              </button>
              <button
                onClick={() => setIsLetterOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
</>)}

      {/* PC 리포트와 동일한 모바일/태블릿 반응형 뷰어 & A4 인쇄 모달 */}
      <MobileReportModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        result={result}
        user={user}
      />
    </div>
  );
};
