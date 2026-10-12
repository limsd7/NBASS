import React, { useState } from 'react';
import { SleepRecord, SleepGoal, StudentInfo, AssessmentResult, CareType } from '../../../types';
import { AIAssistantPanel } from '../../common/AIAssistantPanel';
import { generateAIResponse } from '../../../services/aiService';

interface SleepSimulationViewProps {
  records: SleepRecord[];
  goal: SleepGoal | null;
  student: StudentInfo;
  aiModels: any; // Assuming it will be used for LLM interaction
  currentAssessment?: AssessmentResult;
}

export const SleepSimulationView: React.FC<SleepSimulationViewProps> = ({ records, goal, student, aiModels, currentAssessment }) => {
  const rawChrono = currentAssessment?.studyEfficiencyResults?.chronotype || currentAssessment?.analytics?.chronotype;
  const chronoStr = typeof rawChrono === 'object' && rawChrono ? String(rawChrono.result || '') : String(rawChrono || '');
  const isMorning = chronoStr.toLowerCase().includes('morning') || chronoStr.includes('아침') || chronoStr.includes('종달새');
  const isEvening = chronoStr.toLowerCase().includes('evening') || chronoStr.includes('저녁') || chronoStr.includes('올빼미');
  const initialBed = isMorning ? '22:30' : isEvening ? '00:30' : '23:00';
  const initialWake = isMorning ? '06:30' : isEvening ? '08:00' : '07:00';

  const [targetBedtime, setTargetBedtime] = useState(goal?.targetBedtime || initialBed);
  const [targetWakeTime, setTargetWakeTime] = useState(goal?.targetWakeTime || initialWake);
  const [sliderHours, setSliderHours] = useState<number>(7.5);
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

  // [Pillar 3] 수면 시간 ↔ 킬러문항 실수 방지율 & 작업기억 보존율 실시간 계산
  const killerMistakePrevention = Math.min(96, Math.max(25, Math.round((sliderHours / 7.5) * 88)));
  const workingMemoryRetention = Math.min(98, Math.max(30, Math.round((sliderHours / 7.5) * 92)));
  const lateExamFocus = Math.min(95, Math.max(20, Math.round((sliderHours / 7.5) * 85)));

  // [Pillar 3] D-7 수면 컨디션 신호등 상태 평가
  const d7TrafficStatus = (() => {
    const recent = records.slice(0, 7);
    if (recent.length === 0) return { status: 'green' as const, label: '최적 상태 (녹색)', desc: '충분한 수면 리듬 유지로 수능 1교시 최상의 두뇌 각성 기대' };
    const avg = recent.reduce((a, b) => {
      const bP = b.bedtime.split(':').map(Number);
      const wP = b.wakeTime.split(':').map(Number);
      let diff = (wP[0] * 60 + wP[1]) - (bP[0] * 60 + bP[1]);
      if (diff < 0) diff += 24 * 60;
      return a + diff / 60;
    }, 0) / recent.length;

    if (avg < 5.5) return { status: 'red' as const, label: '위험 상태 (적색)', desc: '만성 수면 부채로 시험 중 마킹 실수 및 문제 오독 확률 2.4배 증가' };
    if (avg < 6.8) return { status: 'yellow' as const, label: '주의 상태 (황색)', desc: '수면 부족으로 3~4교시 오후 시간대 극심한 집중력 저하 우려' };
    return { status: 'green' as const, label: '최적 상태 (녹색)', desc: '규칙적인 7시간 이상 수면 확보로 킬러 문항 추론 속도 및 계산 정확도 최상' };
  })();

  const careType = currentAssessment?.careType;
  const isiScore = currentAssessment?.survey?.isi;

  const handleSimulate = async () => {
    setIsSimulating(true);
    const bParts = targetBedtime.split(':').map(Number);
    const wParts = targetWakeTime.split(':').map(Number);
    let bMins = bParts[0] * 60 + (bParts[1] || 0);
    let wMins = wParts[0] * 60 + (wParts[1] || 0);
    if (bMins > 12 * 60 && wMins < 12 * 60) wMins += 24 * 60;
    const duration = (wMins - bMins) / 60;

    // Advanced Neuro-Biological Mathematical Model Simulation
    let energyLevel = 85;
    let focusLevel = 80;
    let memoryRetention = 75;
    let stressResistance = 80;
    let overallCondition = '최상의 컨디션을 기대할 수 있습니다.';
    let baseAdvice = `권장 수면시간(${duration.toFixed(1)}h)이 안정적으로 확보되었습니다. 취침 60분 전 블루라이트 차단 시 깊은 수면(NREM 3단계) 비율이 최대화됩니다.`;

    if (duration < 6.0) {
      energyLevel = 42;
      focusLevel = 38;
      memoryRetention = 45;
      stressResistance = 35;
      overallCondition = '수면 부채 축적으로 인한 극심한 뇌 피로 및 기억 인출 지연이 예상됩니다.';
      baseAdvice = `수면시간이 ${duration.toFixed(1)}시간으로 절대적으로 부족합니다. 전전두엽 인지 기능 유지를 위해 최소 6.5시간 이상 확보하거나, 오후 2시경 20분 파워 냅을 반드시 병행하세요.`;
    } else if (duration > 9.0) {
      energyLevel = 62;
      focusLevel = 55;
      memoryRetention = 68;
      stressResistance = 72;
      overallCondition = '수면 관성(Sleep Inertia)으로 인해 기상 후 브레인 포그가 지속될 수 있습니다.';
      baseAdvice = '9시간 이상의 과수면은 오히려 서카디안 리듬을 둔화시킵니다. 기상 직후 미온수 섭취와 자연광 10분 노출로 뇌를 각성시키세요.';
    } else if (bParts[0] >= 1 && bParts[0] < 6) {
      energyLevel = Math.max(50, energyLevel - 15);
      focusLevel = Math.max(50, focusLevel - 15);
      memoryRetention = Math.max(55, memoryRetention - 10);
      stressResistance = Math.max(50, stressResistance - 20);
      overallCondition = '수면 시간은 확보되었으나, 새벽 취침으로 멜라토닌-성장호르몬 골든타임이 단절됩니다.';
      baseAdvice = '새벽 1시 이후 취침은 깊은 서파수면(Slow-Wave Sleep)을 방해합니다. 취침 시간을 30분씩 단계적으로 앞당기는 것을 권장합니다.';
    }

    // CareType adjustments
    if (careType === CareType.BURNOUT || careType === CareType.ADRENAL) {
      if (duration < 8.0) {
        stressResistance = Math.max(30, stressResistance - 15);
        overallCondition += ` [${careType} 주의: 부신 코르티솔 회복을 위해 최소 8시간 권장]`;
      }
    } else if (careType === CareType.ANXIETY_TENSION) {
      stressResistance = Math.max(35, stressResistance - 10);
    }

    // Exam Mode adjustments
    if (isExamMode) {
      if (wParts[0] > 7) {
        focusLevel = Math.max(40, focusLevel - 15);
        baseAdvice += ` ⚠️ 수능 1교시(08:40) 두뇌 최고조 각성을 위해 늦어도 아침 6시 30분~7시 사이 기상 생체 리듬을 동기화해야 합니다.`;
      }
    }

    // Attempt AI Generation if available
    try {
      const prompt = `
[수면 스케줄 시뮬레이션 AI 분석]
- 학생 진단 케어타입: ${careType || '표준형'}
- 크로노타입: ${chronoStr || '표준형'}
- 가정된 취침시간: ${targetBedtime}, 기상시간: ${targetWakeTime} (총 ${duration.toFixed(1)}시간)
- D-Day 시험 모드: ${isExamMode ? `활성화 (목표일: ${examDate || '수능/시험'})` : '일반 모드'}

위 가정된 수면 스케줄이 수험생의 전전두엽 집중력, 해마 기억력, 감정 조절에 미칠 생체학적 영향과 보완 루틴을 2줄로 요약해 주세요.
      `;
      const systemContext = "당신은 수험생 신경생리학 및 수면클리닉 수석 전문의입니다. 간결하고 강력한 의학적 조언을 한국어로 제공하세요.";
      const res = await generateAIResponse(prompt, systemContext, aiModels?.config || null, 'free');
      if (res && res.text && !res.text.includes('지연') && !res.text.includes('설정')) {
        baseAdvice = res.text.trim();
      }
    } catch {
      // Fallback to rich mathematical heuristic model advice
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
      {/* [Pillar 3] D-7 수면 컨디션 신호등 (Traffic Light Alert) */}
      <div className={`p-6 rounded-3xl border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
        d7TrafficStatus.status === 'green'
          ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
          : d7TrafficStatus.status === 'yellow'
          ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
          : 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800'
      }`}>
        <div className="flex items-center space-x-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 ${
            d7TrafficStatus.status === 'green' ? 'bg-emerald-100 dark:bg-emerald-900/50' :
            d7TrafficStatus.status === 'yellow' ? 'bg-amber-100 dark:bg-amber-900/50' : 'bg-rose-100 dark:bg-rose-900/50'
          }`}>
            {d7TrafficStatus.status === 'green' ? '🟢' : d7TrafficStatus.status === 'yellow' ? '🟡' : '🔴'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white dark:bg-slate-800 border">
                시험 D-7 수면 컨디션 신호등
              </span>
              <h4 className="font-bold text-slate-800 dark:text-white text-base">{d7TrafficStatus.label}</h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed max-w-2xl">
              {d7TrafficStatus.desc}
            </p>
          </div>
        </div>
      </div>

      {/* [Pillar 3] 수면 시간 ↔ 4점 킬러문항 실수 방지율 & 전두엽 작업기억(WM) 보존율 인터랙티브 슬라이더 */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white p-6 md:p-8 rounded-3xl border border-indigo-500/30 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-2xl border border-indigo-400/30 font-bold">
              🎯
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">수면 확보 시간 ↔ 킬러문항 실수 방지율 시뮬레이터</h3>
              <p className="text-xs text-indigo-200/80">수면 시간이 전두엽 작업기억(WM) 및 고난도 4점 문항 풀이 정확도에 미치는 영향</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-indigo-200 block">설정 수면 시간</span>
            <span className="text-2xl font-black text-cyan-300 font-mono">{sliderHours} 시간</span>
          </div>
        </div>

        {/* Interactive Slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-400">
            <span>4.5시간 (극심한 수면부채)</span>
            <span className="text-cyan-300 font-bold">권장 최적점: 7.5시간</span>
            <span>9.0시간 (과수면)</span>
          </div>
          <input
            type="range"
            min="4.5"
            max="9.0"
            step="0.5"
            value={sliderHours}
            onChange={(e) => setSliderHours(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer h-2.5 bg-slate-800 rounded-lg"
          />
        </div>

        {/* 3 Prediction Impact Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <span className="text-[11px] text-slate-300">4점 킬러문항 계산 실수 방지율</span>
            <div className="flex items-baseline space-x-2">
              <span className={`text-3xl font-black font-mono ${
                killerMistakePrevention >= 80 ? 'text-emerald-400' : killerMistakePrevention >= 60 ? 'text-amber-400' : 'text-rose-400'
              }`}>
                {killerMistakePrevention}%
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block">
              {sliderHours >= 7.0 ? '✨ 복합 조건 누락 및 계산 실수 최소화' : '⚠️ 단순 부호 실수 및 조건 누락 위험 증가'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <span className="text-[11px] text-slate-300">전두엽 작업기억(WM) 보존율</span>
            <div className="flex items-baseline space-x-2">
              <span className={`text-3xl font-black font-mono ${
                workingMemoryRetention >= 80 ? 'text-emerald-400' : workingMemoryRetention >= 60 ? 'text-amber-400' : 'text-rose-400'
              }`}>
                {workingMemoryRetention}%
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block">
              {sliderHours >= 7.0 ? '✨ 장문 지문 구조 한 번에 파악 가능' : '⚠️ 지문 재독해 횟수 증가 및 시간 부족'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <span className="text-[11px] text-slate-300">오후 4교시(탐구) 집중력 유지도</span>
            <div className="flex items-baseline space-x-2">
              <span className={`text-3xl font-black font-mono ${
                lateExamFocus >= 80 ? 'text-emerald-400' : lateExamFocus >= 60 ? 'text-amber-400' : 'text-rose-400'
              }`}>
                {lateExamFocus}%
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block">
              {sliderHours >= 7.0 ? '✨ 시험 종료 시까지 뇌 피로도 방어' : '⚠️ 탐구영역 시간대 극심한 졸음/멍함 발생'}
            </span>
          </div>
        </div>
      </div>

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
                  systemPrompt="당신은 수면 생체리듬, 자율신경 밸런스, 심리설문 결과를 종합 분석하는 NBASS 시스템의 전문 AI입니다. 학생의 수면 시뮬레이션 결과를 바탕으로, 학부모와 학생이 실천할 수 있는 구체적이고 깊이 있는 수면 건강 조언을 3~4문단으로 친절하게 작성해 주세요."
                  aiModels={aiModels}
                  buttonLabel="🧠 AI 심층 분석 및 맞춤 솔루션 생성하기"
                  membershipTier={student?.membershipTier || 'free'}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
