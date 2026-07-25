import React from 'react';
import { PomodoroTimer } from '../PomodoroTimer';

export const ExamPomodoroTimer: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl">🍅</span>
        <div>
          <h3 className="font-bold text-lg text-slate-800 dark:text-white">수험생 전용 뽀모도로 타이머</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">우측 하단 🍅 버튼을 클릭하여 골든타임 학습 세션을 실행하세요.</p>
        </div>
      </div>
    </div>
  );
};
