import React, { useState } from 'react';
import { SleepRecord } from '../../types';

interface SleepInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: Omit<SleepRecord, 'id' | 'createdAt'>) => Promise<void>;
  studentId: string;
  initialDate?: string;
}

export const SleepInputModal: React.FC<SleepInputModalProps> = ({ isOpen, onClose, onSave, studentId, initialDate }) => {
  const [date, setDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
  const [bedtime, setBedtime] = useState('23:00');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [sleepQuality, setSleepQuality] = useState(3);
  const [memo, setMemo] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave({
        studentId,
        date,
        bedtime,
        wakeTime,
        sleepQuality,
        memo
      });
      onClose();
    } catch (error) {
      console.error('Failed to save sleep record', error);
      alert('저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <span>🌙</span> 수면 기록 추가
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <form id="sleep-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">날짜</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">취침 시간</label>
                <input type="time" value={bedtime} onChange={(e) => setBedtime(e.target.value)} required className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">기상 시간</label>
                <input type="time" value={wakeTime} onChange={(e) => setWakeTime(e.target.value)} required className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">수면 품질 (1-5)</label>
              <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900 p-2 rounded-xl">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button key={val} type="button" onClick={() => setSleepQuality(val)} className={`w-10 h-10 rounded-full font-bold transition-colors ${sleepQuality === val ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                    {val}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-slate-500 mt-1 px-2">
                <span>매우 나쁨</span>
                <span>매우 좋음</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">메모 (선택)</label>
              <textarea value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="수면에 방해된 요소나 특이사항을 적어주세요." className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white resize-none" rows={3} />
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-b-2xl">
          <button type="submit" form="sleep-form" disabled={isSaving} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none">
            {isSaving ? '저장 중...' : '기록 저장하기'}
          </button>
        </div>
      </div>
    </div>
  );
};
