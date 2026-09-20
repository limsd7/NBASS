import React, { useState, useEffect } from 'react';
import { StudentInfo, AssessmentResult, SleepGoal, CareType, SleepRecord } from '../../../types';

interface SleepGoalSettingProps {
  student: StudentInfo;
  currentAssessment?: AssessmentResult;
  goal: SleepGoal | null;
  records?: SleepRecord[];
  onSaveGoal: (goal: Omit<SleepGoal, 'id'>) => Promise<void>;
}

export const SleepGoalSetting: React.FC<SleepGoalSettingProps> = ({ student, currentAssessment, goal, records = [], onSaveGoal }) => {
  const [targetBedtime, setTargetBedtime] = useState(goal?.targetBedtime || '23:30');
  const [targetWakeTime, setTargetWakeTime] = useState(goal?.targetWakeTime || '06:30');
  const [targetDuration, setTargetDuration] = useState(goal?.targetDuration || 7);
  const [memo, setMemo] = useState(goal?.memo || '');
  const [isSaving, setIsSaving] = useState(false);

  const [isDdayMode, setIsDdayMode] = useState(goal?.isDdayMode || false);
  const [dDayDate, setDdayDate] = useState(goal?.dDayDate || '');

  // Calculate real streak and condition score from actual records
  const getDuration = (b: string, w: string) => {
    const bParts = b.split(':').map(Number);
    const wParts = w.split(':').map(Number);
    let bMins = bParts[0] * 60 + bParts[1];
    let wMins = wParts[0] * 60 + wParts[1];
    if (bMins > 12 * 60 && wMins < 12 * 60) wMins += 24 * 60;
    return Math.max(0, wMins - bMins) / 60;
  };

  const sortedRecords = [...(records || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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

  const calculateConditionScore = () => {
    if (!records || records.length === 0) {
      const baseQuality = currentAssessment?.analytics?.sleepQuality || 3;
      const baseHours = currentAssessment?.analytics?.avgSleepHours || 7;
      const isi = currentAssessment?.survey?.isi || 0;
      let score = 70 + (baseQuality - 3) * 5;
      if (baseHours >= 7 && baseHours <= 8.5) score += 10;
      if (isi >= 15) score -= 15;
      else if (isi >= 8) score -= 5;
      return Math.min(100, Math.max(40, score));
    }
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

  const currentConditionScore = calculateConditionScore();

  // D-Day progressive schedule calculation
  const dDayProgressive = (() => {
    if (!isDdayMode || !dDayDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exam = new Date(dDayDate);
    exam.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    // Starting wake: 07:30, Goal wake: 06:00 -> 90 mins advance
    // Advance 15 mins every 3 days (takes 18 days)
    const targetWakeMins = 6 * 60; // 06:00
    const [cW_H, cW_M] = targetWakeTime.split(':').map(Number);
    const currentWakeMins = cW_H * 60 + (cW_M || 0);

    const stagesCount = Math.max(1, Math.min(6, Math.floor(Math.max(0, diffDays) / 3)));
    const minutesToShift = Math.max(0, currentWakeMins - targetWakeMins);
    const shiftPerStage = Math.round(minutesToShift / Math.max(1, stagesCount));
    
    return {
      daysRemaining: diffDays,
      totalShiftNeeded: minutesToShift,
      todaySuggestedWake: diffDays <= 7 ? '06:00' : diffDays <= 14 ? '06:30' : '07:00',
      todaySuggestedBed: diffDays <= 7 ? '22:30' : diffDays <= 14 ? '23:00' : '23:30',
    };
  })();

  useEffect(() => {
    // Calculate duration when times change
    const bParts = targetBedtime.split(':').map(Number);
    const wParts = targetWakeTime.split(':').map(Number);
    
    let bMins = bParts[0] * 60 + bParts[1];
    let wMins = wParts[0] * 60 + wParts[1];
    
    if (bMins > 12 * 60 && wMins < 12 * 60) {
      wMins += 24 * 60;
    }
    
    const duration = Math.max(0, (wMins - bMins) / 60);
    setTargetDuration(parseFloat(duration.toFixed(1)));
  }, [targetBedtime, targetWakeTime]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveGoal({
        studentId: student.id,
        targetBedtime,
        targetWakeTime,
        targetDuration,
        memo,
        isDdayMode,
        dDayDate: isDdayMode ? dDayDate : undefined,
        dDayTargetWakeTime: isDdayMode ? '06:00' : undefined,
        currentStreak: streak,
        longestStreak: Math.max(goal?.longestStreak || 0, streak),
        conditionScore: currentConditionScore,
      });
      alert('수면 목표 및 D-Day 최적화 설정이 성공적으로 저장되었습니다.');
    } catch (error) {
      console.error('Failed to save goal:', error);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const getRecommendedBedtime = () => {
    const careType = currentAssessment?.careType;
    const chronotype = currentAssessment?.studyEfficiencyResults?.chronotype || currentAssessment?.analytics?.chronotype;
    
    if (chronotype === 'Morning' || chronotype === 'morning') return '22:00 ~ 22:30 (아침형)';
    if (chronotype === 'Evening' || chronotype === 'evening') return '00:00 ~ 00:30 (저녁형)';
    if (careType === CareType.BURNOUT || careType === CareType.STRESS_OVERLOAD || careType === CareType.ADRENAL) return '22:30 ~ 23:00 (회복)';
    if (careType === CareType.SLEEP) return '23:00 ~ 23:30 (CBT-I)';
    if (careType === CareType.ATTENTION_DEFICIT || careType === CareType.BRAIN_FATIGUE) return '23:00 ~ 23:30';
    return '23:00 ~ 24:00';
  };

  const getRecommendedDuration = () => {
    const careType = currentAssessment?.careType;
    if (careType === CareType.BURNOUT || careType === CareType.ADRENAL) return '최소 8~8.5시간 (피로 회복)';
    if (careType === CareType.STRESS_OVERLOAD || careType === CareType.LOW_ENERGY) return '7.5 ~ 8시간';
    if (careType === CareType.SLEEP) return '7.0시간 (수면 효율 제고)';
    return '7 ~ 7.5시간';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        
        {/* Gamification Dashboard */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
            <span>🏆</span> 수면 챌린지 달성도
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800/50 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">현재 스트릭 (연속 달성)</p>
                <div className="flex items-end gap-1 mt-1">
                  <span className="text-3xl font-black text-orange-600 dark:text-orange-400">{streak}</span>
                  <span className="text-slate-500 mb-1">일째</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-800 flex items-center justify-center text-xl">
                🔥
              </div>
            </div>
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">수면 컨디션 점수</p>
                <div className="flex items-end gap-1 mt-1">
                  <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{currentConditionScore}</span>
                  <span className="text-slate-500 mb-1">/ 100</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-800 flex items-center justify-center text-xl">
                ⭐
              </div>
            </div>
          </div>
        </div>

        {/* D-Day Mode Dashboard */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <span>🎯</span> 시험 대비 생체 리듬 최적화 (수능/내신 모드)
            </h3>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={isDdayMode} onChange={() => setIsDdayMode(!isDdayMode)} />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {isDdayMode ? (
            <div className="animate-fade-in bg-indigo-50 dark:bg-indigo-900/10 p-5 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">시험 날짜 (D-Day)</label>
                  <input 
                    type="date" 
                    value={dDayDate}
                    onChange={(e) => setDdayDate(e.target.value)}
                    className="w-full p-3 rounded-lg border border-slate-200 focus:border-indigo-500 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">시험 당일 기상 목표</label>
                  <input 
                    type="time" 
                    value="06:00"
                    readOnly
                    className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                  />
                </div>
              </div>
              <div className="text-sm text-indigo-700 dark:text-indigo-300 bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm space-y-4">
                <div>
                  <p className="font-bold mb-1 flex items-center gap-1.5">
                    <span>🧠</span> 수능 뇌 최적화 점진 적응 시뮬레이션
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    수능 1교시(08:40) 최고 두뇌 회전력을 위해 아침 6시 기상 생체 시계를 동기화합니다.
                  </p>
                </div>

                {dDayProgressive && (
                  <div className="space-y-3 pt-2 border-t border-indigo-100 dark:border-indigo-800/40">
                    <div className="flex items-center justify-between">
                      <div className="text-center">
                        <p className="text-[10px] text-slate-500 font-bold">현재 설정 기상</p>
                        <p className="font-bold text-slate-800 dark:text-white text-sm">{targetWakeTime}</p>
                      </div>
                      <div className="flex-1 px-4 text-center">
                        <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/50 border border-indigo-200">
                          {dDayProgressive.daysRemaining > 0 ? `D-${dDayProgressive.daysRemaining} 남음` : '시험 당일'}
                        </span>
                        <div className="h-1 bg-indigo-200 dark:bg-indigo-700 rounded-full relative mt-2">
                          <div className="absolute right-0 w-2.5 h-2.5 bg-indigo-600 rounded-full -top-[3px]"></div>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] text-indigo-500 font-bold">D-Day 최종 목표</p>
                        <p className="font-black text-indigo-700 dark:text-indigo-400 text-sm">06:00</p>
                      </div>
                    </div>

                    <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-800/50 flex flex-col sm:flex-row items-center justify-between gap-2">
                      <div className="text-xs text-indigo-900 dark:text-indigo-200">
                        <span>💡 오늘 권장 스케줄: </span>
                        <strong>{dDayProgressive.todaySuggestedBed} 취침 → {dDayProgressive.todaySuggestedWake} 기상</strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setTargetBedtime(dDayProgressive.todaySuggestedBed);
                          setTargetWakeTime(dDayProgressive.todaySuggestedWake);
                        }}
                        className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors shrink-0 cursor-pointer shadow-sm"
                      >
                        ⚡ 오늘 목표에 적용
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">D-Day 모드를 켜면 중요한 시험 당일 아침에 두뇌 컨디션을 최고조로 끌어올릴 수 있도록 생체 리듬 시차 적응 스케줄을 자동으로 계산합니다.</p>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
            <span>🎯</span> 일반 수면 목표 설정
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">목표 취침 시간</label>
              <input 
                type="time" 
                value={targetBedtime} 
                onChange={(e) => setTargetBedtime(e.target.value)} 
                className="w-full p-4 rounded-xl border-2 border-indigo-100 focus:border-indigo-500 dark:border-slate-600 bg-white dark:bg-slate-700 text-xl font-bold text-slate-800 dark:text-white text-center transition-colors" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">목표 기상 시간</label>
              <input 
                type="time" 
                value={targetWakeTime} 
                onChange={(e) => setTargetWakeTime(e.target.value)} 
                className="w-full p-4 rounded-xl border-2 border-indigo-100 focus:border-indigo-500 dark:border-slate-600 bg-white dark:bg-slate-700 text-xl font-bold text-slate-800 dark:text-white text-center transition-colors" 
              />
            </div>
          </div>

          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-xl mb-6 flex items-center justify-between border border-indigo-100 dark:border-indigo-800/30">
            <div>
              <p className="text-sm font-medium text-indigo-800 dark:text-indigo-300">목표 수면 시간</p>
              <p className="text-sm text-indigo-600/80 dark:text-indigo-400/80 mt-1">취침/기상 시간에 따라 자동 계산됩니다.</p>
            </div>
            <div className="text-3xl font-bold text-indigo-700 dark:text-indigo-400">
              {targetDuration}<span className="text-lg font-normal text-indigo-500 ml-1">시간</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">목표 달성 전략 및 다짐</label>
            <textarea 
              value={memo} 
              onChange={(e) => setMemo(e.target.value)} 
              placeholder="예: 자기 전 30분은 스마트폰 보지 않기, 커피는 오후 2시 이전에만 마시기..." 
              className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white resize-none focus:border-indigo-500" 
              rows={4} 
            />
          </div>

          <div className="mt-8 flex justify-end">
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none flex items-center gap-2"
            >
              {isSaving ? '저장 중...' : '목표 저장하기'}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 rounded-2xl shadow-md text-white">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span>💡</span> 전문가 권장 가이드
          </h3>
          <div className="space-y-4">
            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
              <p className="text-indigo-100 text-sm mb-1">현재 상태 ({currentAssessment?.careType || '평가 없음'})</p>
              <div className="font-semibold text-lg">권장 수면량: {getRecommendedDuration()}</div>
            </div>
            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
              <p className="text-indigo-100 text-sm mb-1">골든 타임 취침 가이드</p>
              <div className="font-semibold text-lg">권장 취침: {getRecommendedBedtime()}</div>
              <p className="text-xs text-indigo-100 mt-2 leading-relaxed">
                성장 호르몬과 멜라토닌 분비가 가장 활발한 밤 10시~새벽 2시 사이를 포함하여 수면하는 것이 뇌 기능 회복에 가장 좋습니다.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800">
          <h3 className="text-base font-bold text-indigo-800 dark:text-indigo-300 mb-4 flex items-center gap-2">
            <span>💊</span> Care Type별 맞춤 수면 액션 플랜
          </h3>
          <div className="space-y-4">
            {currentAssessment?.careType === CareType.BURNOUT && (
              <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-indigo-100 dark:border-indigo-800/50 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-indigo-700 dark:text-indigo-400">NSDR (Non-Sleep Deep Rest) 요법</span>
                  <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-md font-bold">10분 소요</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">오후 2-3시경 깊은 휴식을 취하는 NSDR 오디오를 들으며 피로를 리셋하세요. 누워서 눈을 감고 진행합니다.</p>
                <button className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-colors">
                  <span>▶️</span> NSDR 오디오 재생
                </button>
              </div>
            )}
            {currentAssessment?.careType === CareType.SLEEP && (
              <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-indigo-100 dark:border-indigo-800/50 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-indigo-700 dark:text-indigo-400">CBT-I 수면 제한 및 자극 조절</span>
                  <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-md font-bold">수면 클리닉</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">침대는 수면 전용 공간입니다. 20분 이상 잠이 오지 않으면 침대에서 벗어나 어두운 조명 아래에서 이완 후 졸릴 때 다시 눕습니다.</p>
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-xs text-indigo-700 dark:text-indigo-300 font-medium">
                  💡 낮잠은 15시 이전 15분 이하로 제한하며, 기상 시간은 주말에도 동일하게 고정합니다.
                </div>
              </div>
            )}
            {currentAssessment?.careType === CareType.ADRENAL && (
              <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-indigo-100 dark:border-indigo-800/50 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-indigo-700 dark:text-indigo-400">부신 피로 골든타임 수면 루틴</span>
                  <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-md font-bold">밤 10시~새벽 2시</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">코르티솔 회복의 핵심 시간대(22시~02시)에 반드시 깊은 수면에 진입할 수 있도록 22시 30분 전 소등을 권장합니다.</p>
                <div className="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-lg text-xs text-amber-700 dark:text-amber-300 font-medium">
                  🌙 취침 1시간 전 따뜻한 캐모마일 티 또는 마그네슘 섭취를 추천합니다.
                </div>
              </div>
            )}
            {currentAssessment?.careType === CareType.BRAIN_FATIGUE && (
              <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-indigo-100 dark:border-indigo-800/50 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-indigo-700 dark:text-indigo-400">아침 햇빛 10분 챌린지</span>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-md font-bold">기상 직후</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">브레인 포그 해소를 위해 기상 직후 30분 이내에 창문을 열거나 밖으로 나가 10분간 야외 햇빛을 쬐어 코르티솔 사이클을 정상화하세요.</p>
                <div className="bg-yellow-50 p-3 rounded-lg flex items-center gap-3">
                  <div className="text-3xl animate-pulse">☀️</div>
                  <div className="text-xs text-yellow-700 font-medium">내일 아침 기상 시간에 맞춰 '햇빛 쬐기 알림'을 설정할까요?</div>
                </div>
              </div>
            )}
            {currentAssessment?.careType === CareType.STRESS_OVERLOAD && (
              <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-indigo-100 dark:border-indigo-800/50 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-indigo-700 dark:text-indigo-400">4-7-8 수면 호흡법</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md font-bold">취침 직전</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">교감신경을 낮추고 긴장을 풀어주는 호흡법입니다. 4초 들이마시고, 7초 참은 뒤, 8초간 길게 내쉽니다.</p>
                <div className="flex justify-center my-6">
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <div className="absolute inset-0 bg-blue-200 rounded-full animate-ping opacity-75"></div>
                    <div className="relative w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                      호흡
                    </div>
                  </div>
                </div>
                <button className="w-full py-2 border-2 border-blue-500 text-blue-600 hover:bg-blue-50 rounded-lg font-bold transition-colors">
                  타이머 시작하기
                </button>
              </div>
            )}
            {currentAssessment?.careType === CareType.ANXIETY_TENSION && (
              <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-indigo-100 dark:border-indigo-800/50 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-indigo-700 dark:text-indigo-400">점진적 근육이완법 (PMR)</span>
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-md font-bold">취침 전 10분</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">시험 긴장으로 뭉친 어깨, 목, 턱 근육을 5초간 꽉 쥐었다가 10초간 스르륵 푸는 이완 훈련으로 수면 입면 시간을 단축합니다.</p>
              </div>
            )}
            {(currentAssessment?.careType === CareType.LOW_ENERGY || currentAssessment?.careType === CareType.DEPRESSION_AMOTIVATION) && (
              <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-indigo-100 dark:border-indigo-800/50 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-indigo-700 dark:text-indigo-400">20분 파워 냅 &amp; 기상 스트레칭</span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-md font-bold">오후 2시</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">에너지 소진형 수험생은 오후 2시경 20분의 파워 냅을 통해 오후 집중력을 리셋하고, 아침 기상 직후 가벼운 스트레칭으로 뇌 혈류를 촉진하세요.</p>
              </div>
            )}
            {currentAssessment?.careType === CareType.ATTENTION_DEFICIT && (
              <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-indigo-100 dark:border-indigo-800/50 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-indigo-700 dark:text-indigo-400">화이트 노이즈 (ASMR) 요법</span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-md font-bold">학습/취침 시</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">주의력이 분산될 때 집중 몰입을 돕는 백색 소음을 활용하세요.</p>
                <div className="grid grid-cols-2 gap-2">
                  <button className="py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium flex justify-center items-center gap-1">🌧️ 빗소리</button>
                  <button className="py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium flex justify-center items-center gap-1">🔥 모닥불</button>
                </div>
              </div>
            )}
            {currentAssessment?.careType === CareType.HEALTHY && (
              <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-emerald-100 dark:border-emerald-800/50 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">균형형 수면 사이클 유지</span>
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-md font-bold">현재 상태 양호</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">현재 생체 리듬이 건강하게 유지되고 있습니다. 일정한 기상 시간과 7.5시간 수면 사이클을 지속하세요.</p>
              </div>
            )}
            {!currentAssessment?.careType && (
              <div className="text-sm text-indigo-600 dark:text-indigo-400 text-center py-4 bg-white/50 rounded-lg">
                심리 진단 검사를 완료하면 맞춤형 수면 액션 플랜이 활성화됩니다.
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
          <h3 className="text-base font-bold text-slate-800 dark:text-white mb-3">수면 최적화 팁</h3>
          <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <li className="flex gap-2">
              <span className="text-indigo-500">•</span>
              취침 2시간 전부터는 청색광(스마트폰, 태블릿) 노출을 피하세요.
            </li>
            <li className="flex gap-2">
              <span className="text-indigo-500">•</span>
              방 온도는 18~20도 정도로 시원하게 유지하는 것이 좋습니다.
            </li>
            <li className="flex gap-2">
              <span className="text-indigo-500">•</span>
              주말에도 평일과 기상 시간을 일정하게 유지하여 생체 리듬을 깨뜨리지 마세요.
            </li>
            <li className="flex gap-2">
              <span className="text-indigo-500">•</span>
              낮잠이 필요하다면 오후 3시 이전에 20~30분 이내로만 취하세요.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
