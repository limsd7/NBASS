import React, { useState } from 'react';

export const SleepCalculator: React.FC = () => {
  const [wakeTime, setWakeTime] = useState('06:30');
  const [sleepCycles, setSleepCycles] = useState<string[]>([]);

  const calculateBedtimes = (wake: string) => {
    const [h, m] = wake.split(':').map(Number);
    const wakeDate = new Date();
    wakeDate.setHours(h, m, 0, 0);

    // 90 minute sleep cycles + 15 min to fall asleep
    const cycles = [6, 5, 4, 3]; // 9h, 7.5h, 6h, 4.5h
    const times = cycles.map(c => {
      const bed = new Date(wakeDate.getTime() - (c * 90 + 15) * 60 * 1000);
      const bh = bed.getHours().toString().padStart(2, '0');
      const bm = bed.getMinutes().toString().padStart(2, '0');
      return `${bh}:${bm} (${c * 1.5}시간 수면)`;
    });
    setSleepCycles(times);
  };

  React.useEffect(() => {
    calculateBedtimes(wakeTime);
  }, [wakeTime]);

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">⏰</span>
        <div>
          <h3 className="font-bold text-lg text-slate-800 dark:text-white">수면 주기 계산기 (90분 사이클)</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">기상 시간에 맞춰 최적의 취침 시각을 계산합니다.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
        <label className="text-sm font-bold text-slate-700 dark:text-slate-200">목표 기상 시간:</label>
        <input
          type="time"
          value={wakeTime}
          onChange={(e) => setWakeTime(e.target.value)}
          className="p-2 border rounded-xl font-bold text-slate-800 dark:bg-slate-700 dark:text-white dark:border-slate-600"
        />
      </div>

      {sleepCycles.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {sleepCycles.map((time, idx) => (
            <div key={idx} className={`p-4 rounded-2xl border text-center ${idx === 1 ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/30 dark:border-indigo-700' : 'bg-slate-50 border-slate-200 dark:bg-slate-700/50 dark:border-slate-600'}`}>
              <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">{idx === 1 ? '🌟 최적 권장' : `${4 - idx}번째 권장`}</div>
              <div className="font-black text-slate-800 dark:text-white text-base">{time}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
