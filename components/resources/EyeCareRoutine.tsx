import React, { useState } from 'react';
import { useWellnessGamification } from '../../hooks/useWellnessGamification';

export const EyeCareRoutine: React.FC = () => {
  const [step, setStep] = useState(0);
  const { completeActivity } = useWellnessGamification();

  const steps = [
    { title: '20-20-20 규칙', desc: '20분 공부 후 20피트(6m) 원거리를 20초간 응시하세요.' },
    { title: '시선 8자 그리기', desc: '눈동자로천천히 큰 8자를 그리며 5회 반복합니다.' },
    { title: '온열 온구 이완', desc: '양 손바닥을 비벼 따뜻하게 한 뒤 눈을 덮어 30초 휴식합니다.' }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      completeActivity('stretching', 40);
      setStep(0);
      alert('👁️ 안구 피로 회복 운동이 완료되었습니다!');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
          <span>👁️</span> 안구 피로 회복 루틴
        </h3>
        <span className="text-xs font-bold bg-amber-100 text-amber-700 px-3 py-1 rounded-full">
          {step + 1} / {steps.length} 단계
        </span>
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/20 p-5 rounded-2xl border border-amber-100 dark:border-amber-800/40 mb-4">
        <h4 className="font-bold text-amber-900 dark:text-amber-300 text-base mb-1">{steps[step].title}</h4>
        <p className="text-sm text-amber-800 dark:text-amber-400">{steps[step].desc}</p>
      </div>

      <button
        onClick={handleNext}
        className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors shadow-md"
      >
        {step < steps.length - 1 ? '다음 동작 진행 →' : '루틴 완료하기 🎉'}
      </button>
    </div>
  );
};
