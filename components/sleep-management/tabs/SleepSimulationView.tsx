import React, { useState } from 'react';
import { SleepRecord, SleepGoal, StudentInfo } from '../../../types';
import { AIAssistantPanel } from '../../common/AIAssistantPanel';

interface SleepSimulationViewProps {
  records: SleepRecord[];
  goal: SleepGoal | null;
  student: StudentInfo;
  aiModels: any; // Assuming it will be used for LLM interaction
}

export const SleepSimulationView: React.FC<SleepSimulationViewProps> = ({ records, goal, student, aiModels }) => {
  const [targetBedtime, setTargetBedtime] = useState('23:00');
  const [targetWakeTime, setTargetWakeTime] = useState('07:00');
  const [simulationResult, setSimulationResult] = useState<{
    energyLevel: number;
    focusLevel: number;
    memoryRetention: number;
    stressResistance: number;
    overallCondition: string;
    advice: string;
    targetBedtime: string;
    targetWakeTime: string;
    duration: number;
  } | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const [isExamMode, setIsExamMode] = useState(false);
  const [examDate, setExamDate] = useState('');

  const handleSimulate = async () => {
    setIsSimulating(true);
    // In a real application, we would call an AI endpoint here using aiModels
    // For now, we simulate the delay and provide a deterministic mock result
    setTimeout(() => {
      const bParts = targetBedtime.split(':').map(Number);
      const wParts = targetWakeTime.split(':').map(Number);
      let bMins = bParts[0] * 60 + bParts[1];
      let wMins = wParts[0] * 60 + wParts[1];
      if (bMins > 12 * 60 && wMins < 12 * 60) wMins += 24 * 60;
      const duration = (wMins - bMins) / 60;

      // Simple mock logic
      let energyLevel = 85;
      let focusLevel = 80;
      let memoryRetention = 75;
      let stressResistance = 80;
      let overallCondition = '최상의 컨디션을 기대할 수 있습니다.';
      let baseAdvice = '충분한 수면 시간이 확보되었습니다. 취침 전 스마트폰 사용만 줄인다면 깊은 수면을 취할 수 있을 것입니다.';

      if (duration < 6) {
        energyLevel = 40;
        focusLevel = 35;
        memoryRetention = 45;
        stressResistance = 30;
        overallCondition = '수면 부족으로 인한 피로감이 예상됩니다.';
        baseAdvice = '최소 6시간 이상의 수면을 권장합니다. 부득이한 경우 낮잠(20분)을 통해 에너지를 보충하세요.';
      } else if (duration > 9) {
        energyLevel = 60;
        focusLevel = 50;
        memoryRetention = 65;
        stressResistance = 70;
        overallCondition = '과수면으로 인해 일시적인 무기력증이 나타날 수 있습니다.';
        baseAdvice = '너무 긴 수면은 오히려 뇌를 둔하게 만들 수 있습니다. 기상 후 가벼운 스트레칭과 햇빛 노출로 뇌를 깨워주세요.';
      } else if (bParts[0] >= 2 && bParts[0] < 6) {
        energyLevel = 65;
        focusLevel = 60;
        memoryRetention = 70;
        stressResistance = 60;
        overallCondition = '수면 시간은 적절하나, 취침 시간이 너무 늦어 회복 효율이 떨어질 수 있습니다.';
        baseAdvice = '골든타임(밤 10시~새벽 2시)을 놓쳐 멜라토닌과 성장 호르몬의 혜택을 온전히 받기 어렵습니다. 취침 시간을 1~2시간 앞당기는 것을 목표로 해보세요.';
      }

      setSimulationResult({
        energyLevel,
        focusLevel,
        memoryRetention,
        stressResistance,
        overallCondition,
        advice: baseAdvice,
        targetBedtime,
        targetWakeTime,
        duration
      });
      setIsSimulating(false);
    }, 500);
  };

  const getDuration = () => {
    const bParts = targetBedtime.split(':').map(Number);
    const wParts = targetWakeTime.split(':').map(Number);
    let bMins = bParts[0] * 60 + bParts[1];
    let wMins = wParts[0] * 60 + wParts[1];
    if (bMins > 12 * 60 && wMins < 12 * 60) wMins += 24 * 60;
    return Math.max(0, (wMins - bMins) / 60).toFixed(1);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
          <span>🧪</span> 수면 시뮬레이터 (AI 예측)
        </h3>
        <div className="flex justify-between items-start mb-6">
          <p className="text-slate-500 dark:text-slate-400">
            특정 수면 스케줄을 가정했을 때, 다음 날 예상되는 뇌기능 및 신체 컨디션을 AI가 시뮬레이션합니다.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">🎯 수능/시험 모드</span>
            <button 
              onClick={() => setIsExamMode(!isExamMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isExamMode ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isExamMode ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

        {isExamMode && (
          <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 rounded-xl animate-fade-in">
            <h4 className="font-bold text-indigo-800 dark:text-indigo-300 mb-2 flex items-center gap-2">
              <span>📅</span> D-30 생체 리듬 최적화 플랜
            </h4>
            <p className="text-sm text-indigo-600 dark:text-indigo-400 mb-4">
              시험 당일(08:40 시작)에 뇌 기능이 100% 활성화되도록 점진적으로 기상 시간을 앞당기는 시뮬레이션입니다.
            </p>
            <div className="flex items-center gap-4">
              <input 
                type="date" 
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="p-2 text-sm rounded-lg border border-indigo-200 dark:border-indigo-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
              />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                목표 기상 시간: <span className="text-indigo-600 font-bold">06:30</span>
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">예상 취침 시간</label>
            <input 
              type="time" 
              value={targetBedtime} 
              onChange={(e) => setTargetBedtime(e.target.value)} 
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">예상 기상 시간</label>
            <input 
              type="time" 
              value={targetWakeTime} 
              onChange={(e) => setTargetWakeTime(e.target.value)} 
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white" 
            />
          </div>
          <div className="flex flex-col justify-end">
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-between items-center h-[50px]">
              <span className="text-sm text-slate-500">예상 수면 시간</span>
              <span className="font-bold text-slate-800 dark:text-white">{getDuration()}시간</span>
            </div>
          </div>
          <div className="flex flex-col justify-end">
            <button 
              onClick={handleSimulate}
              disabled={isSimulating}
              className="w-full h-[50px] bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2"
            >
              {isSimulating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  분석 중...
                </>
              ) : '시뮬레이션 실행'}
            </button>
          </div>
        </div>
      </div>

      {simulationResult && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 animate-fade-in">
          <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-6 border-b border-slate-100 dark:border-slate-700 pb-3">
            다음 날 예상 컨디션
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full border-4 flex items-center justify-center text-2xl font-bold mb-2" style={{ borderColor: `hsl(${simulationResult.energyLevel * 1.2}, 80%, 50%)`, color: `hsl(${simulationResult.energyLevel * 1.2}, 80%, 40%)` }}>
                {simulationResult.energyLevel}%
              </div>
              <span className="font-medium text-slate-700 dark:text-slate-300">신체 활력</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full border-4 flex items-center justify-center text-2xl font-bold mb-2" style={{ borderColor: `hsl(${simulationResult.focusLevel * 1.2}, 80%, 50%)`, color: `hsl(${simulationResult.focusLevel * 1.2}, 80%, 40%)` }}>
                {simulationResult.focusLevel}%
              </div>
              <span className="font-medium text-slate-700 dark:text-slate-300">집중력</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full border-4 flex items-center justify-center text-2xl font-bold mb-2" style={{ borderColor: `hsl(${simulationResult.memoryRetention * 1.2}, 80%, 50%)`, color: `hsl(${simulationResult.memoryRetention * 1.2}, 80%, 40%)` }}>
                {simulationResult.memoryRetention}%
              </div>
              <span className="font-medium text-slate-700 dark:text-slate-300">기억력 (학습 효율)</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full border-4 flex items-center justify-center text-2xl font-bold mb-2" style={{ borderColor: `hsl(${simulationResult.stressResistance * 1.2}, 80%, 50%)`, color: `hsl(${simulationResult.stressResistance * 1.2}, 80%, 40%)` }}>
                {simulationResult.stressResistance}%
              </div>
              <span className="font-medium text-slate-700 dark:text-slate-300">스트레스 저항력</span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-5 border border-slate-100 dark:border-slate-800">
            <h5 className="font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
              <span>📋</span> 종합 평가
            </h5>
            <p className="text-slate-700 dark:text-slate-300 mb-4">{simulationResult.overallCondition}</p>
            
            <h5 className="font-bold text-slate-800 dark:text-white mb-2 mt-4 flex items-center gap-2">
              <span>💡</span> 기본 수면 조언
            </h5>
            <p className="text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 p-4 rounded-lg border border-indigo-100 dark:border-indigo-900/50">
              {simulationResult.advice}
            </p>

            {aiModels && (
              <div className="mt-6">
                <AIAssistantPanel 
                  contextData={{
                    targetBedtime: simulationResult.targetBedtime,
                    targetWakeTime: simulationResult.targetWakeTime,
                    duration: simulationResult.duration,
                    energyLevel: simulationResult.energyLevel,
                    focusLevel: simulationResult.focusLevel,
                    memoryRetention: simulationResult.memoryRetention,
                    stressResistance: simulationResult.stressResistance,
                    overallCondition: simulationResult.overallCondition,
                    studentData: student
                  }}
                  systemPrompt="당신은 뇌파, 심박변이도, 심리설문 결과를 종합 분석하는 NBASS 시스템의 전문 AI입니다. 학생의 수면 시뮬레이션 결과를 바탕으로, 학부모와 학생이 실천할 수 있는 구체적이고 깊이 있는 수면 건강 조언을 3~4문단으로 친절하게 작성해 주세요."
                  aiModels={aiModels}
                  buttonLabel="🧠 AI 심층 분석 및 맞춤 솔루션 생성하기"
                  membershipTier={student?.membershipTier || 'standard'}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
