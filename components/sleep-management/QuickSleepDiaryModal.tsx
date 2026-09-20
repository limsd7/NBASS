import React, { useState } from 'react';
import { SleepRecord } from '../../types';

interface QuickSleepDiaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: Omit<SleepRecord, 'id' | 'createdAt'>) => Promise<void>;
  studentId: string;
}

export const QuickSleepDiaryModal: React.FC<QuickSleepDiaryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  studentId,
}) => {
  const getTodayStr = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };
  const [date, setDate] = useState<string>(getTodayStr());
  const [bedtime, setBedtime] = useState<string>('23:30');
  const [wakeTime, setWakeTime] = useState<string>('06:30');
  const [sleepQuality, setSleepQuality] = useState<number>(4);
  const [screenTime, setScreenTime] = useState<number>(20);
  const [memo, setMemo] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  // Calculate duration in hours
  const calculateDuration = () => {
    const [bH, bM] = bedtime.split(':').map(Number);
    const [wH, wM] = wakeTime.split(':').map(Number);
    let diff = (wH * 60 + wM) - (bH * 60 + bM);
    if (diff < 0) diff += 24 * 60;
    return (diff / 60).toFixed(1);
  };

  const handleQuickPreset = (bed: string, wake: string, quality: number, scr: number) => {
    setBedtime(bed);
    setWakeTime(wake);
    setSleepQuality(quality);
    setScreenTime(scr);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave({
        studentId,
        date,
        bedtime,
        wakeTime,
        sleepQuality,
        memo: memo.trim() || undefined,
        screenTimeBeforeBed: screenTime,
        sleepDelay: screenTime > 30 ? 25 : 10,
        stages: {
          deep: sleepQuality >= 4 ? 22 : 14,
          rem: sleepQuality >= 4 ? 24 : 18,
          light: sleepQuality >= 4 ? 54 : 68,
        },
        nightHrv: sleepQuality >= 4 ? 65 : 45,
      });
      onClose();
    } catch (err) {
      console.error('Failed to save quick sleep diary:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl font-bold">
              ⚡
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">10초 원클릭 수면 다이어리</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">어젯밤 수면을 빠르게 체크하세요</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Quick Presets */}
        <div className="mt-4 mb-3">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">
            🚀 빠른 프리셋 선택
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickPreset('23:00', '06:30', 5, 10)}
              className="p-2.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-100 dark:border-indigo-800/40 text-left transition-all cursor-pointer"
            >
              <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 block">✨ 숙면 7.5h</span>
              <span className="text-[10px] text-slate-500">23:00 ~ 06:30</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset('00:30', '06:30', 3, 35)}
              className="p-2.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-100 dark:border-amber-800/40 text-left transition-all cursor-pointer"
            >
              <span className="text-xs font-bold text-amber-700 dark:text-amber-300 block">⚠️ 보통 6.0h</span>
              <span className="text-[10px] text-slate-500">00:30 ~ 06:30</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset('02:00', '06:30', 2, 60)}
              className="p-2.5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-100 dark:border-rose-800/40 text-left transition-all cursor-pointer"
            >
              <span className="text-xs font-bold text-rose-700 dark:text-rose-300 block">🚨 피로 4.5h</span>
              <span className="text-[10px] text-slate-500">02:00 ~ 06:30</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">날짜</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">총 수면 시간</label>
              <div className="px-3 py-2 text-xs font-bold rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800/40 text-center">
                ⏱️ {calculateDuration()} 시간
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">취침 시간</label>
              <input
                type="time"
                value={bedtime}
                onChange={(e) => setBedtime(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">기상 시간</label>
              <input
                type="time"
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white font-mono"
                required
              />
            </div>
          </div>

          {/* Sleep Quality Stars */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">수면 만족도</label>
            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setSleepQuality(star)}
                  className={`text-xl transition-transform hover:scale-125 cursor-pointer ${
                    star <= sleepQuality ? 'opacity-100' : 'opacity-30 grayscale'
                  }`}
                >
                  ⭐
                </button>
              ))}
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 mr-2">
                {sleepQuality === 5 ? '최고의 숙면 🚀' :
                 sleepQuality === 4 ? '상쾌함 ✨' :
                 sleepQuality === 3 ? '보통 😐' :
                 sleepQuality === 2 ? '다소 피곤 🥱' : '수면 부족 😵'}
              </span>
            </div>
          </div>

          {/* Screen time */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">취침 전 스마트폰/화면 사용</label>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{screenTime}분</span>
            </div>
            <input
              type="range"
              min="0"
              max="90"
              step="5"
              value={screenTime}
              onChange={(e) => setScreenTime(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              다음에 하기 (닫기)
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all cursor-pointer"
            >
              {isSubmitting ? '저장 중...' : '10초 기록 완료 ✨'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
