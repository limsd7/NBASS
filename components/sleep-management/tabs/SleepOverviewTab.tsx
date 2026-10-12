import React, { useState, useMemo } from 'react';
import { SleepRecord, SleepGoal, AssessmentResult } from '../../../types';
import { SleepTrendChart } from '../SleepTrendChart';
import { MemoryConsolidationCard } from '../MemoryConsolidationCard';
import { BreathingCore } from '../../BreathingGuide';
import { recommendBreathingProtocols } from '../../../services/breathingEngine';
import { BREATH_SAFETY_NOTICE } from '../../../data/breathingProtocols';

interface SleepOverviewTabProps {
  records: SleepRecord[];
  goal: SleepGoal | null;
  onDelete: (id: string) => void;
  onEdit?: (record: SleepRecord) => void;
  currentAssessment?: AssessmentResult;
  onSyncWearable?: () => Promise<void> | void;
  onImportRecords?: (records: Omit<SleepRecord, 'id' | 'createdAt'>[]) => Promise<void>;
}

export const SleepOverviewTab: React.FC<SleepOverviewTabProps> = ({ 
  records, 
  goal, 
  onDelete, 
  onEdit, 
  currentAssessment, 
  onSyncWearable,
  onImportRecords
}) => {
  const getDuration = (b: string, w: string) => {
    const bParts = b.split(':').map(Number);
    const wParts = w.split(':').map(Number);
    let bMins = bParts[0] * 60 + bParts[1];
    let wMins = wParts[0] * 60 + wParts[1];
    if (bMins > 12 * 60 && wMins < 12 * 60) wMins += 24 * 60;
    return Math.max(0, wMins - bMins) / 60;
  };

  const getAverageSleep = () => {
    if (records.length === 0) return 0;
    const totalHours = records.reduce((acc, r) => acc + getDuration(r.bedtime, r.wakeTime), 0);
    return totalHours / records.length;
  };

  const sortedRecords = [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  let streak = 0;
  for (const r of sortedRecords) {
    const dur = getDuration(r.bedtime, r.wakeTime);
    const isSuccess = goal ? (dur >= goal.targetDuration - 0.5) : (dur >= 6);
    if (isSuccess && r.sleepQuality >= 3) {
      streak++;
    } else {
      break;
    }
  }

  const calculateScore = () => {
    if (records.length === 0) return 0;
    const latest = sortedRecords[0];
    const dur = getDuration(latest.bedtime, latest.wakeTime);
    let score = 50;
    if (goal) {
      score += Math.max(0, 30 - Math.abs(dur - goal.targetDuration) * 10);
    } else {
      score += dur >= 7 ? 30 : (dur * 4);
    }
    score += (latest.sleepQuality / 5) * 20;
    return Math.min(100, Math.round(score));
  };

  const todayScore = calculateScore();
  const avgSleep = getAverageSleep();
  const targetDuration = goal?.targetDuration || 7.5;
  const sleepDelay = sortedRecords.length > 0 ? (sortedRecords[0].sleepDelay ?? Math.floor(20 + (5 - sortedRecords[0].sleepQuality) * 5)) : 20;

  // [Pillar 2] 수면 부채 (Sleep Debt) 실시간 누적 계산 (최근 7일 기준)
  const sleepDebtStats = useMemo(() => {
    const recent7 = sortedRecords.slice(0, 7);
    if (recent7.length === 0) return { debtHours: 0, status: 'normal' as const };
    const idealWeeklyHours = targetDuration * recent7.length;
    const actualWeeklyHours = recent7.reduce((acc, r) => acc + getDuration(r.bedtime, r.wakeTime), 0);
    const debt = Number((actualWeeklyHours - idealWeeklyHours).toFixed(1)); // 음수면 부채
    const status = debt < -5 ? 'critical' : debt < -2 ? 'warning' : 'optimal';
    return { debtHours: debt, status };
  }, [sortedRecords, targetDuration]);

  // [Pillar 1] 일일 골든 타임 (Golden Focus Hour) 동적 예보
  const goldenTimeForecast = useMemo(() => {
    if (sortedRecords.length === 0) {
      return { morning: '09:30 ~ 11:30', afternoon: '19:30 ~ 21:30', readiness: 85 };
    }
    const latest = sortedRecords[0];
    const [wH, wM] = latest.wakeTime.split(':').map(Number);
    
    // Golden Time 1: Wake + 2.5h ~ Wake + 4.5h (Peak Cortisol & Alertness)
    const g1StartH = (wH + 2) % 24;
    const g1EndH = (wH + 4) % 24;
    const g1Str = `${g1StartH.toString().padStart(2, '0')}:${wM.toString().padStart(2, '0')} ~ ${g1EndH.toString().padStart(2, '0')}:${wM.toString().padStart(2, '0')}`;

    // Golden Time 2: Afternoon/Evening (Peak Core Body Temp)
    const g2StartH = (wH + 12) % 24;
    const g2EndH = (wH + 14) % 24;
    const g2Str = `${g2StartH.toString().padStart(2, '0')}:${wM.toString().padStart(2, '0')} ~ ${g2EndH.toString().padStart(2, '0')}:${wM.toString().padStart(2, '0')}`;

    const readiness = Math.min(98, Math.round(todayScore * 0.7 + (latest.sleepQuality / 5) * 30));
    return { morning: g1Str, afternoon: g2Str, readiness };
  }, [sortedRecords, todayScore]);

  const [isSyncing, setIsSyncing] = useState(false);
  const [showSleepBreath, setShowSleepBreath] = useState(false);
  const sleepBreath = useMemo(
    () => recommendBreathingProtocols(currentAssessment?.careType, 'pre_sleep'),
    [currentAssessment?.careType]
  );

  const handleSyncWearable = async () => {
    setIsSyncing(true);
    try {
      if (onSyncWearable) {
        await onSyncWearable();
      }
      setTimeout(() => {
        setIsSyncing(false);
        alert('애플워치/갤럭시워치/오라링 수면 단계 및 야간 생체 리듬 데이터가 동기화되었습니다.');
      }, 800);
    } catch (err) {
      console.error('Sync failed:', err);
      setIsSyncing(false);
      alert('동기화 처리 중 오류가 발생했습니다.');
    }
  };

  const getChronotypeLabel = (raw: any): string => {
    if (!raw) return '표준형';
    const val = typeof raw === 'object' ? (raw.result || raw.type) : raw;
    if (typeof val !== 'string') return '표준형';
    switch (val.toLowerCase()) {
      case 'morning':
      case 'definite_morning':
        return '아침형';
      case 'moderate_morning':
        return '중간 아침형';
      case 'evening':
      case 'definite_evening':
        return '저녁형';
      case 'moderate_evening':
        return '중간 저녁형';
      case 'intermediate':
      case 'neutral':
        return '중간(표준)형';
      default:
        return val;
    }
  };

  return (
    <div className="space-y-6">
      {/* Assessment Baseline Banner */}
      {currentAssessment && (
        <div className="bg-gradient-to-r from-indigo-900/30 via-slate-800 to-purple-900/20 p-4 rounded-2xl border border-indigo-500/20 shadow-sm flex flex-wrap items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🌙</span>
            <span className="font-bold text-white">진단 기준치:</span>
            <span className="text-slate-300">
              {currentAssessment.careType} · 
              {getChronotypeLabel(currentAssessment.studyEfficiencyResults?.chronotype || currentAssessment.analytics?.chronotype)} 크로노타입 · 
              평균 {currentAssessment.analytics?.avgSleepHours || 7}시간
            </span>
          </div>
          {currentAssessment.survey?.isi !== undefined && (
            <span className="text-xs px-2.5 py-1 bg-indigo-500/20 text-indigo-300 rounded-lg font-bold border border-indigo-400/30">
              불면증 지수 (ISI): {currentAssessment.survey.isi}점
            </span>
          )}
        </div>
      )}

      {/* [Pillar 1] Golden Focus Hour Dynamic Forecast Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-indigo-900 to-slate-900 rounded-3xl p-6 border border-indigo-500/30 text-white shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-300 flex items-center justify-center text-xl font-bold border border-amber-400/30">
              ⚡
            </div>
            <div>
              <h3 className="font-bold text-base text-white">오늘의 두뇌 집중 골든 타임 (Golden Focus Hour) 예보</h3>
              <p className="text-xs text-indigo-200/80">어젯밤 수면 리듬 분석 기반 최고 몰입 시간대</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl text-xs font-bold shrink-0">
            <span>두뇌 가용성:</span>
            <span className="text-amber-300 font-mono text-sm">{goldenTimeForecast.readiness}%</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center space-x-3">
            <span className="text-2xl">🌅</span>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block">1차 골든타임 (수학·과학 킬러문항)</span>
              <strong className="text-sm font-bold text-cyan-300 font-mono">{goldenTimeForecast.morning}</strong>
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center space-x-3">
            <span className="text-2xl">🌌</span>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block">2차 골든타임 (국어 비문학·영어 독해)</span>
              <strong className="text-sm font-bold text-indigo-300 font-mono">{goldenTimeForecast.afternoon}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Action Header & Wearable Integration */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">웨어러블 기기 실시간 연동 &amp; 데이터 가져오기</h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              Apple / Galaxy / Oura
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">수면 단계(서파/렘수면), 야간 생체 리듬 및 스마트폰 스크린타임 자동 동기화</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-white font-bold rounded-xl shadow-sm transition-colors text-xs cursor-pointer">
            <span>📁</span>
            <span>데이터 파일 가져오기</span>
            <input
              type="file"
              accept=".json,.csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = async (event) => {
                  try {
                    const text = event.target?.result as string;
                    if (file.name.endsWith('.json')) {
                      const data = JSON.parse(text);
                      const arr = Array.isArray(data) ? data : [data];
                      if (onImportRecords) {
                        await onImportRecords(arr);
                        alert(`${arr.length}건의 수면 데이터가 성공적으로 등록되었습니다.`);
                      }
                    } else {
                      alert('CSV 파싱: JSON 포맷 파일을 권장합니다.');
                    }
                  } catch (err) {
                    console.error('File parse error:', err);
                    alert('파일 형식 파싱에 실패했습니다.');
                  }
                };
                reader.readAsText(file);
              }}
            />
          </label>
          <button 
            onClick={handleSyncWearable}
            disabled={isSyncing}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm transition-colors text-xs disabled:opacity-50 cursor-pointer"
          >
            <span className={isSyncing ? "animate-spin" : ""}>🔄</span>
            <span>{isSyncing ? '동기화 중..' : '웨어러블 1-Click 동기화'}</span>
          </button>
        </div>
      </div>

      {/* [Pillar 2] 수면 부채 게이지 & 주말 분할 보상 수면 가이드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">주간 수면 부채 (Sleep Debt)</span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
              sleepDebtStats.status === 'optimal' ? 'bg-emerald-100 text-emerald-700' :
              sleepDebtStats.status === 'warning' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
            }`}>
              {sleepDebtStats.status === 'optimal' ? '수면 균형 최적' :
               sleepDebtStats.status === 'warning' ? '주의: 수면 결손' : '위험: 만성 수면 부채'}
            </span>
          </div>
          <div className="flex items-baseline space-x-2">
            <h3 className={`text-4xl font-black font-mono ${
              sleepDebtStats.debtHours >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}>
              {sleepDebtStats.debtHours > 0 ? `+${sleepDebtStats.debtHours}` : sleepDebtStats.debtHours}
            </h3>
            <span className="text-xs text-slate-500 font-bold">시간 (최근 7일 목표 대비)</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {sleepDebtStats.debtHours < -3 ? (
              '누적 수면 부채가 있으면 낮 동안의 반응 속도가 느려지고 집중이 어려워질 수 있습니다. 평일 수면 시간을 30분 늘려보세요.'
            ) : (
              '권장 수면 시간을 안정적으로 충족하여 학습된 지식이 뇌에 정상적으로 고착화되고 있습니다.'
            )}
          </p>
        </div>

        <div className="bg-gradient-to-br from-indigo-50/70 to-purple-50/70 dark:from-indigo-950/30 dark:to-purple-950/30 p-6 rounded-3xl border border-indigo-100 dark:border-indigo-900/40 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">주말 90분 파워 낮잠 프로토콜</span>
            <span className="text-base">☕</span>
          </div>
          <div className="text-xs font-bold text-slate-700 dark:text-slate-200">
            권장 낮잠 시간대: <strong className="text-indigo-600 dark:text-indigo-400">13:00 ~ 14:30 (최대 90분)</strong>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            💡 주말 3시간 이상 몰아자기(과수면)는 일요일 밤 불면증을 유발합니다. 90분(정확히 1 수면 사이클) 분할 낮잠으로 생체 시계를 보호하세요.
          </p>
        </div>
      </div>

      {/* Gamification Dashboard - Top Layer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-3xl shadow-md text-white relative overflow-hidden">
          <div className="flex justify-between items-center relative z-10">
            <div>
              <p className="text-indigo-100 text-xs font-medium">오늘의 종합 수면 점수</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-5xl font-black font-mono">{todayScore}</h3>
                <span className="text-indigo-200 text-sm font-medium">/ 100</span>
              </div>
              <p className="mt-2 text-xs text-indigo-100 opacity-90">
                {todayScore >= 80 ? '아주 훌륭합니다! 최적의 두뇌 상태입니다.' : '조금 더 규칙적인 수면이 필요합니다.'}
              </p>
            </div>
            <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
              <span className="text-4xl">🎯</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-400 to-pink-500 p-6 rounded-3xl shadow-md text-white relative overflow-hidden">
          <div className="flex justify-between items-center relative z-10">
            <div>
              <p className="text-orange-100 text-xs font-medium">연속 목표 달성일 (Streak)</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-5xl font-black font-mono">{streak}</h3>
                <span className="text-orange-100 text-sm font-medium">일 연속</span>
              </div>
              <p className="mt-2 text-xs text-orange-100 opacity-90">
                {streak >= 3 ? '스트릭이 불타오르고 있습니다! 🔥' : '오늘부터 7일 연속 목표에 도전해보세요! 💪'}
              </p>
            </div>
            <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
              <span className="text-4xl">🔥</span>
            </div>
          </div>
        </div>
      </div>

      {/* [Pillar 1] Memory Consolidation Card (서파 vs 렘 기억 고착화) */}
      <MemoryConsolidationCard latestRecord={sortedRecords[0]} />

      {/* 취침 전 호흡 루틴 (CareType 맞춤) */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 p-6 rounded-3xl border border-indigo-500/30 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{sleepBreath.primary.emoji}</span>
            <div>
              <h3 className="font-bold text-base text-white">취침 전 호흡 루틴: {sleepBreath.primary.name}</h3>
              <p className="text-xs text-indigo-200/80 mt-0.5">{sleepBreath.primary.oneLiner} · 약 {sleepBreath.primary.estMinutes}분</p>
            </div>
          </div>
          <button
            onClick={() => setShowSleepBreath(v => !v)}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shrink-0"
          >
            {showSleepBreath ? '닫기' : '🌙 호흡 시작하기'}
          </button>
        </div>
        {showSleepBreath && (
          <div className="mt-5 bg-white rounded-2xl p-5 text-slate-900">
            <BreathingCore key={sleepBreath.primary.id} pattern={sleepBreath.primary.pattern} />
            <ol className="mt-4 space-y-1.5 text-xs text-slate-600">
              {sleepBreath.primary.steps.map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="font-black text-indigo-600">{i + 1}.</span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
            <p className="mt-3 text-[10px] text-slate-400 leading-relaxed">⚠️ {BREATH_SAFETY_NOTICE}</p>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 hover:border-indigo-300 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">평균 수면 시간</p>
              <h3 className="text-3xl font-bold text-slate-800 dark:text-white mt-1">
                {avgSleep.toFixed(1)}<span className="text-lg font-normal text-slate-500 ml-1">시간</span>
              </h3>
            </div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600">
              <span className="text-2xl">⏳</span>
            </div>
          </div>
          <div className="mt-4 text-sm font-medium">
            {goal ? (
              <span className={`${avgSleep >= goal.targetDuration ? 'text-green-500' : 'text-amber-500'}`}>
                목표({goal.targetDuration}시간) 대비 {Math.abs(avgSleep - goal.targetDuration).toFixed(1)}시간 
                {avgSleep >= goal.targetDuration ? ' 초과 달성' : ' 부족'}
              </span>
            ) : (
              <span className="text-slate-400">목표 미설정</span>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 hover:border-indigo-300 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">평균 수면 질</p>
              <h3 className="text-3xl font-bold text-slate-800 dark:text-white mt-1">
                {records.length > 0 ? (records.reduce((acc, r) => acc + r.sleepQuality, 0) / records.length).toFixed(1) : '-'}
                <span className="text-lg font-normal text-slate-500 ml-1">/ 5</span>
              </h3>
            </div>
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-xl text-yellow-600">
              <span className="text-2xl">⭐</span>
            </div>
          </div>
          <div className="mt-4 text-sm text-slate-500">
            최근 {records.length}회 기록 기준
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 hover:border-red-300 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">수면 지연 (Sleep Delay)</p>
              <h3 className="text-3xl font-bold text-slate-800 dark:text-white mt-1">
                {sleepDelay}<span className="text-lg font-normal text-slate-500 ml-1">분</span>
              </h3>
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-xl text-red-600">
              <span className="text-2xl">📱</span>
            </div>
          </div>
          <div className={`mt-4 text-sm font-medium ${sleepDelay > 20 ? 'text-red-500' : 'text-green-500'}`}>
            {sleepDelay > 20 ? '야간 스크린타임 증가 주의' : '정상적인 수면 잠복기'}
          </div>
        </div>

        {/* Sleep Stages (Dynamic from latest record or averages) */}
        {(() => {
          const latestRecordWithStages = sortedRecords.find(r => r.stages && (r.stages.deep || r.stages.rem || r.stages.light));
          const deepPct = latestRecordWithStages?.stages?.deep ?? 20;
          const remPct = latestRecordWithStages?.stages?.rem ?? 22;
          const lightPct = latestRecordWithStages?.stages?.light ?? Math.max(0, 100 - deepPct - remPct);

          return (
            <div className="md:col-span-3 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">최근 수면 단계 실측 분석 (Sleep Stages)</p>
                  <div className="text-xs text-slate-400 mt-1">
                    {latestRecordWithStages ? `${latestRecordWithStages.date} 실측 데이터 기준` : '웨어러블 측정 기반 자동 연동 (표준치)'}
                  </div>
                </div>
              </div>
              <div className="h-6 w-full rounded-full overflow-hidden flex shadow-inner">
                <div className="h-full bg-blue-400 transition-all duration-500" style={{ width: `${remPct}%` }} title={`REM 수면 (${remPct}%)`}></div>
                <div className="h-full bg-indigo-300 transition-all duration-500" style={{ width: `${lightPct}%` }} title={`얕은 수면 (${lightPct}%)`}></div>
                <div className="h-full bg-indigo-700 transition-all duration-500" style={{ width: `${deepPct}%` }} title={`깊은 수면 (${deepPct}%)`}></div>
              </div>
              <div className="flex justify-between text-xs mt-2 font-medium text-slate-500">
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>REM {remPct}% (언어/기억 통합)</div>
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-300"></span>Light {lightPct}% (신체 이완)</div>
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-700"></span>Deep {deepPct}% (개념 고착화)</div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Chart Section */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
          <span>📈</span> 수면 패턴 추이
        </h3>
        <SleepTrendChart data={records.slice(0, 14)} targetDuration={targetDuration} />
      </div>

      {/* Record List */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <span>📝</span> 최근 수면 기록
        </h3>
        
        {records.length === 0 ? (
          <div className="text-center py-8 text-slate-500 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
            기록된 수면 데이터가 없습니다. 새로운 기록을 추가해 주세요.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">날짜</th>
                  <th className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">취침-기상</th>
                  <th className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">수면 품질</th>
                  <th className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">메모</th>
                  <th className="py-3 px-4 font-semibold text-right text-slate-600 dark:text-slate-300">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {records.slice(0, 10).map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 text-slate-800 dark:text-slate-200">{record.date}</td>
                    <td className="py-3 px-4 text-slate-800 dark:text-slate-200">
                      <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-sm font-mono">
                        {record.bedtime} - {record.wakeTime}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-yellow-500">{'⭐'.repeat(record.sleepQuality)}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                      {record.memo || '-'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {onEdit && (
                          <button 
                            onClick={() => onEdit(record)}
                            className="text-indigo-600 hover:text-indigo-800 p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors cursor-pointer"
                            title="수정"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                        )}
                        <button 
                          onClick={() => onDelete(record.id)}
                          className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors cursor-pointer"
                          title="삭제"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
