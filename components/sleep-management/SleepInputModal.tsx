import React, { useState, useEffect } from 'react';
import { SleepRecord } from '../../types';

interface SleepInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: Omit<SleepRecord, 'id' | 'createdAt'>) => Promise<void>;
  studentId: string;
  initialDate?: string;
  initialRecord?: SleepRecord | null;
}

export const SleepInputModal: React.FC<SleepInputModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  studentId, 
  initialDate,
  initialRecord 
}) => {
  const [date, setDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
  const [bedtime, setBedtime] = useState('23:00');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [sleepQuality, setSleepQuality] = useState(3);
  const [memo, setMemo] = useState('');
  
  // [NEW] Detailed Bio/Stage Metrics
  const [deepStage, setDeepStage] = useState<number>(20);
  const [remStage, setRemStage] = useState<number>(22);
  const [lightStage, setLightStage] = useState<number>(58);
  const [screenTime, setScreenTime] = useState<number>(20);
  const [sleepDelay, setSleepDelay] = useState<number>(15);
  const [nightHrv, setNightHrv] = useState<number>(60);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialRecord) {
      setDate(initialRecord.date);
      setBedtime(initialRecord.bedtime);
      setWakeTime(initialRecord.wakeTime);
      setSleepQuality(initialRecord.sleepQuality);
      setMemo(initialRecord.memo || '');
      setDeepStage(initialRecord.stages?.deep ?? 20);
      setRemStage(initialRecord.stages?.rem ?? 22);
      setLightStage(initialRecord.stages?.light ?? 58);
      setScreenTime(initialRecord.screenTimeBeforeBed ?? 20);
      setSleepDelay(initialRecord.sleepDelay ?? 15);
      setNightHrv(initialRecord.nightHrv ?? 60);
      setShowAdvanced(true);
    } else {
      setDate(initialDate || new Date().toISOString().split('T')[0]);
      setBedtime('23:00');
      setWakeTime('07:00');
      setSleepQuality(3);
      setMemo('');
      setDeepStage(20);
      setRemStage(22);
      setLightStage(58);
      setScreenTime(20);
      setSleepDelay(15);
      setNightHrv(60);
      setShowAdvanced(false);
    }
  }, [initialRecord, initialDate, isOpen]);

  if (!isOpen) return null;

  const calculateDuration = () => {
    const [bH, bM] = bedtime.split(':').map(Number);
    const [wH, wM] = wakeTime.split(':').map(Number);
    let diff = (wH * 60 + wM) - (bH * 60 + bM);
    if (diff < 0) diff += 24 * 60;
    return (diff / 60).toFixed(1);
  };

  const handleDeepChange = (val: number) => {
    const d = Math.max(0, Math.min(60, val));
    setDeepStage(d);
    setLightStage(Math.max(0, 100 - d - remStage));
  };

  const handleRemChange = (val: number) => {
    const r = Math.max(0, Math.min(60, val));
    setRemStage(r);
    setLightStage(Math.max(0, 100 - deepStage - r));
  };

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
        memo: memo.trim() || undefined,
        stages: {
          deep: deepStage,
          rem: remStage,
          light: lightStage,
        },
        screenTimeBeforeBed: screenTime,
        sleepDelay,
        nightHrv,
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🌙</span>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                {initialRecord ? '수면 기록 수정' : '정밀 수면 기록 추가'}
              </h2>
              <p className="text-xs text-slate-500">수면 시간 및 단계별 생체 리듬 데이터를 입력하세요</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg cursor-pointer">
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <form id="sleep-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">날짜</label>
                <input 
                  type="date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)} 
                  required 
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">총 수면 시간</label>
                <div className="p-2.5 text-xs font-bold rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/40 text-center font-mono">
                  ⏱️ {calculateDuration()} 시간
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">취침 시간</label>
                <input 
                  type="time" 
                  value={bedtime} 
                  onChange={(e) => setBedtime(e.target.value)} 
                  required 
                  className="w-full p-2.5 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">기상 시간</label>
                <input 
                  type="time" 
                  value={wakeTime} 
                  onChange={(e) => setWakeTime(e.target.value)} 
                  required 
                  className="w-full p-2.5 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white" 
                />
              </div>
            </div>

            {/* Quality Stars */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">수면 품질</label>
              <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button 
                    key={val} 
                    type="button" 
                    onClick={() => setSleepQuality(val)} 
                    className={`w-9 h-9 rounded-xl font-bold transition-all cursor-pointer ${
                      sleepQuality === val ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {val}★
                  </button>
                ))}
              </div>
            </div>

            {/* Advanced Toggle */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full py-2 px-3 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800/40 rounded-xl flex items-center justify-between cursor-pointer"
              >
                <span>🧬 정밀 생체 &amp; 수면 단계 (Stages / 자율신경) 상세 입력</span>
                <span>{showAdvanced ? '▲ 접기' : '▼ 펼치기'}</span>
              </button>
            </div>

            {showAdvanced && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 animate-fade-in">
                {/* Sleep Stages */}
                <span className="text-[11px] font-bold text-slate-500 block">
                  수면 단계 비율 (%) - 합계 100%
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-indigo-600 font-bold mb-0.5">서파수면(Deep)</label>
                    <input
                      type="number"
                      min="0"
                      max="60"
                      value={deepStage}
                      onChange={(e) => handleDeepChange(Number(e.target.value))}
                      className="w-full p-2 text-xs font-mono rounded-lg border border-indigo-200 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-purple-600 font-bold mb-0.5">렘수면(REM)</label>
                    <input
                      type="number"
                      min="0"
                      max="60"
                      value={remStage}
                      onChange={(e) => handleRemChange(Number(e.target.value))}
                      className="w-full p-2 text-xs font-mono rounded-lg border border-purple-200 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-0.5">얕은수면(Light)</label>
                    <input
                      type="number"
                      value={lightStage}
                      readOnly
                      className="w-full p-2 text-xs font-mono rounded-lg border border-slate-200 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[10px] font-medium text-slate-600 dark:text-slate-300 mb-0.5">취침 전 스크린타임(분)</label>
                    <input
                      type="number"
                      min="0"
                      max="180"
                      value={screenTime}
                      onChange={(e) => setScreenTime(Number(e.target.value))}
                      className="w-full p-2 text-xs rounded-lg border border-slate-200 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-600 dark:text-slate-300 mb-0.5">입면 잠복기(분)</label>
                    <input
                      type="number"
                      min="0"
                      max="120"
                      value={sleepDelay}
                      onChange={(e) => setSleepDelay(Number(e.target.value))}
                      className="w-full p-2 text-xs rounded-lg border border-slate-200 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-medium text-slate-600 dark:text-slate-300 mb-0.5">야간 자율신경 안정도 (선택)</label>
                  <input
                    type="number"
                    min="10"
                    max="150"
                    value={nightHrv}
                    onChange={(e) => setNightHrv(Number(e.target.value))}
                    className="w-full p-2 text-xs rounded-lg border border-slate-200 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-mono"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">메모 (선택)</label>
              <textarea 
                value={memo} 
                onChange={(e) => setMemo(e.target.value)} 
                placeholder="수면에 방해된 요소나 특이사항을 적어주세요." 
                className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white resize-none" 
                rows={2} 
              />
            </div>
          </form>
        </div>

        <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 rounded-b-3xl flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            취소
          </button>
          <button 
            type="submit" 
            form="sleep-form" 
            disabled={isSaving} 
            className="px-6 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none cursor-pointer"
          >
            {isSaving ? '저장 중...' : initialRecord ? '수정 내용 저장' : '기록 저장하기'}
          </button>
        </div>
      </div>
    </div>
  );
};
