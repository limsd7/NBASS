import React, { useState, useEffect } from 'react';
import { StudentInfo, AssessmentResult, SleepGoal, CareType } from '../../../types';

interface SleepGoalSettingProps {
  student: StudentInfo;
  currentAssessment?: AssessmentResult;
  goal: SleepGoal | null;
  onSaveGoal: (goal: Omit<SleepGoal, 'id'>) => Promise<void>;
}

export const SleepGoalSetting: React.FC<SleepGoalSettingProps> = ({ student, currentAssessment, goal, onSaveGoal }) => {
  const [targetBedtime, setTargetBedtime] = useState(goal?.targetBedtime || '23:30');
  const [targetWakeTime, setTargetWakeTime] = useState(goal?.targetWakeTime || '06:30');
  const [targetDuration, setTargetDuration] = useState(goal?.targetDuration || 7);
  const [memo, setMemo] = useState(goal?.memo || '');
  const [isSaving, setIsSaving] = useState(false);

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
        memo
      });
      alert('목표가 성공적으로 저장되었습니다.');
    } catch (error) {
      console.error('Failed to save goal:', error);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const getRecommendedBedtime = () => {
    const careType = currentAssessment?.careType;
    if (careType === CareType.BURNOUT || careType === CareType.STRESS_OVERLOAD) return '22:30 ~ 23:00';
    if (careType === CareType.ATTENTION_DEFICIT || careType === CareType.BRAIN_FATIGUE) return '23:00 ~ 23:30';
    return '23:00 ~ 24:00';
  };

  const getRecommendedDuration = () => {
    const careType = currentAssessment?.careType;
    if (careType === CareType.BURNOUT) return '최소 8시간 이상';
    if (careType === CareType.STRESS_OVERLOAD) return '7.5 ~ 8시간';
    return '7 ~ 7.5시간';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        
        {/* Gamification Dashboard */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
            <span>🎮</span> 수면 챌린지 및 달성도
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800/50 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">현재 스트릭 (연속 달성)</p>
                <div className="flex items-end gap-1 mt-1">
                  <span className="text-3xl font-black text-orange-600 dark:text-orange-400">12</span>
                  <span className="text-slate-500 mb-1">일 🔥</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-800 flex items-center justify-center text-xl">
                🏆
              </div>
            </div>
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">수면 컨디션 점수</p>
                <div className="flex items-end gap-1 mt-1">
                  <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">85</span>
                  <span className="text-slate-500 mb-1">/ 100</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-800 flex items-center justify-center text-xl">
                📈
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
            <span>🎯</span> 수면 목표 설정
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
              placeholder="예: 자기 전 30분은 스마트폰 보지 않기, 커피는 오후 2시 이전에만 마시기 등" 
              className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white resize-none" 
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
          <h3 className="text-base font-bold text-indigo-800 dark:text-indigo-300 mb-3 flex items-center gap-2">
            <span>💊</span> Care Type 맞춤 처방
          </h3>
          <ul className="space-y-4">
            {currentAssessment?.careType === CareType.BURNOUT && (
              <li className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-indigo-100 dark:border-indigo-800/50">
                <span className="font-bold text-indigo-600 dark:text-indigo-400 block mb-1">NSDR (Non-Sleep Deep Rest) 요법</span>
                <span className="text-sm text-slate-600 dark:text-slate-300">오후 2-3시경 20분간 요가 니드라 또는 NSDR 오디오를 들으며 뇌 피로를 리셋하세요.</span>
              </li>
            )}
            {currentAssessment?.careType === CareType.BRAIN_FATIGUE && (
              <li className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-indigo-100 dark:border-indigo-800/50">
                <span className="font-bold text-indigo-600 dark:text-indigo-400 block mb-1">아침 햇빛 10분 챌린지</span>
                <span className="text-sm text-slate-600 dark:text-slate-300">브레인 포그 해소를 위해 기상 직후 30분 이내에 10분간 야외 햇빛을 쬐어 코르티솔 사이클을 정상화하세요.</span>
              </li>
            )}
            {currentAssessment?.careType === CareType.STRESS_OVERLOAD && (
              <li className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-indigo-100 dark:border-indigo-800/50">
                <span className="font-bold text-indigo-600 dark:text-indigo-400 block mb-1">수면 지연 방지 루틴</span>
                <span className="text-sm text-slate-600 dark:text-slate-300">취침 전 불안감(Anxiety)으로 인한 폰 사용을 막기 위해 1시간 전부터 '박스 호흡법(Box Breathing)'을 실시하세요.</span>
              </li>
            )}
            {!([CareType.BURNOUT, CareType.BRAIN_FATIGUE, CareType.STRESS_OVERLOAD] as string[]).includes(currentAssessment?.careType || '') && (
              <li className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-indigo-100 dark:border-indigo-800/50">
                <span className="font-bold text-indigo-600 dark:text-indigo-400 block mb-1">주말 수면 보충 가이드</span>
                <span className="text-sm text-slate-600 dark:text-slate-300">주말에 부족한 잠을 보충할 때는 1~2시간만 추가로 자고, 기상 시간은 평일과 동일하게 유지하는 것이 좋습니다.</span>
              </li>
            )}
          </ul>
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
