import React, { useState, useEffect } from 'react';
import { CareType } from '../types';
import { useWellnessGamification } from '../hooks/useWellnessGamification';

interface PomodoroTimerProps {
  careType?: CareType;
}

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ careType }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [mode, setMode] = useState<'FOCUS' | 'BREAK'>('FOCUS');
    const [focusDuration, setFocusDuration] = useState(25);
    const [breakDuration, setBreakDuration] = useState(5);
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isRunning, setIsRunning] = useState(false);
    const { completeActivity } = useWellnessGamification();

    // Auto-adjust default timer intervals based on CareType diagnosis
    useEffect(() => {
      if (!careType) return;
      if (careType === CareType.BURNOUT || careType === CareType.ADRENAL) {
        setFocusDuration(20);
        setBreakDuration(10);
        if (!isRunning && mode === 'FOCUS') setTimeLeft(20 * 60);
      } else if (careType === CareType.ATTENTION_DEFICIT || careType === CareType.BRAIN_FATIGUE) {
        setFocusDuration(15);
        setBreakDuration(5);
        if (!isRunning && mode === 'FOCUS') setTimeLeft(15 * 60);
      } else if (careType === CareType.SLEEP || careType === CareType.CIRCULATION) {
        setFocusDuration(45);
        setBreakDuration(15);
        if (!isRunning && mode === 'FOCUS') setTimeLeft(45 * 60);
      }
    }, [careType]);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isRunning && timeLeft > 0) {
            timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        } else if (isRunning && timeLeft === 0) {
            // Timer finished
            setIsRunning(false);
            try {
              const audio = new Audio('data:audio/mp3;base64,//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq');
              audio.play().catch(() => {});
            } catch (e) {}
            
            if (mode === 'FOCUS') {
                completeActivity('pomodoro', 60);
                setMode('BREAK');
                setTimeLeft(breakDuration * 60);
            } else {
                setMode('FOCUS');
                setTimeLeft(focusDuration * 60);
            }
        }
        return () => clearTimeout(timer);
    }, [isRunning, timeLeft, mode, focusDuration, breakDuration, completeActivity]);

    const toggleTimer = () => setIsRunning(!isRunning);

    const resetTimer = () => {
        setIsRunning(false);
        setTimeLeft(mode === 'FOCUS' ? focusDuration * 60 : breakDuration * 60);
    };

    const switchMode = (newMode: 'FOCUS' | 'BREAK') => {
        setIsRunning(false);
        setMode(newMode);
        setTimeLeft(newMode === 'FOCUS' ? focusDuration * 60 : breakDuration * 60);
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 no-print">
            {/* Expanded Timer UI */}
            {isOpen && (
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 animate-in slide-in-from-bottom-4 duration-200 w-72 transition-colors">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                          <span>🍅</span> 뽀모도로 타이머
                        </h3>
                        <div className="flex gap-2">
                            <button onClick={() => setIsSettingsOpen(!isSettingsOpen)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">⚙️</button>
                            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">✕</button>
                        </div>
                    </div>

                    {isSettingsOpen ? (
                        <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl mb-4 border border-slate-200 dark:border-slate-600">
                            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3">타이머 설정</h4>
                            
                            {/* Preset Buttons */}
                            <div className="flex gap-2 mb-4">
                                <button 
                                    onClick={() => { setFocusDuration(25); setBreakDuration(5); if(mode==='FOCUS') setTimeLeft(25*60); else setTimeLeft(5*60); }}
                                    className="flex-1 py-1 px-2 text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-md hover:bg-slate-100 text-slate-600 dark:text-slate-200"
                                >
                                    기본<br/>(25/5)
                                </button>
                                <button 
                                    onClick={() => { setFocusDuration(50); setBreakDuration(10); if(mode==='FOCUS') setTimeLeft(50*60); else setTimeLeft(10*60); }}
                                    className="flex-1 py-1 px-2 text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-md hover:bg-slate-100 text-slate-600 dark:text-slate-200"
                                >
                                    딥워크<br/>(50/10)
                                </button>
                                <button 
                                    onClick={() => { setFocusDuration(90); setBreakDuration(15); if(mode==='FOCUS') setTimeLeft(90*60); else setTimeLeft(15*60); }}
                                    className="flex-1 py-1 px-2 text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-md hover:bg-slate-100 text-slate-600 dark:text-slate-200"
                                >
                                    모의고사<br/>(90/15)
                                </button>
                            </div>

                            <div className="flex flex-col gap-3">
                                <label className="flex items-center justify-between text-sm">
                                    <span className="text-slate-600 dark:text-slate-300">집중 시간 (분)</span>
                                    <input type="number" min="1" max="120" value={focusDuration} onChange={(e) => {
                                        const val = Number(e.target.value);
                                        setFocusDuration(val);
                                        if (mode === 'FOCUS') setTimeLeft(val * 60);
                                    }} className="w-16 p-1 border dark:border-slate-600 rounded text-right dark:bg-slate-800 dark:text-white" />
                                </label>
                                <label className="flex items-center justify-between text-sm">
                                    <span className="text-slate-600 dark:text-slate-300">휴식 시간 (분)</span>
                                    <input type="number" min="1" max="60" value={breakDuration} onChange={(e) => {
                                        const val = Number(e.target.value);
                                        setBreakDuration(val);
                                        if (mode === 'BREAK') setTimeLeft(val * 60);
                                    }} className="w-16 p-1 border dark:border-slate-600 rounded text-right dark:bg-slate-800 dark:text-white" />
                                </label>
                            </div>
                            <button onClick={() => setIsSettingsOpen(false)} className="w-full mt-4 py-2 bg-slate-800 dark:bg-slate-900 text-white font-bold rounded-lg text-sm">완료</button>
                        </div>
                    ) : (
                        <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-xl mb-6">
                            <button 
                                className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-colors ${mode === 'FOCUS' ? 'bg-white dark:bg-slate-800 shadow-sm text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'}`}
                                onClick={() => switchMode('FOCUS')}
                            >
                                집중 ({focusDuration}분)
                            </button>
                            <button 
                                className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-colors ${mode === 'BREAK' ? 'bg-white dark:bg-slate-800 shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}
                                onClick={() => switchMode('BREAK')}
                            >
                                휴식 ({breakDuration}분)
                            </button>
                        </div>
                    )}

                    <div className="text-center mb-6">
                        <div className={`text-6xl font-black font-mono tabular-nums tracking-tighter ${mode === 'FOCUS' ? 'text-rose-500' : 'text-emerald-500'}`}>
                            {formatTime(timeLeft)}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button 
                            onClick={toggleTimer}
                            className={`flex-1 py-3 font-bold rounded-xl text-white transition-all shadow-md hover:shadow-lg ${isRunning ? 'bg-slate-800 hover:bg-slate-900' : mode === 'FOCUS' ? 'bg-rose-500 hover:bg-rose-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}
                        >
                            {isRunning ? '일시정지 ⏸️' : '시작하기 ▶️'}
                        </button>
                        <button 
                            onClick={resetTimer}
                            className="px-4 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                        >
                            🔄
                        </button>
                    </div>
                </div>
            )}

            {/* Floating Action Button */}
            {!isOpen && (
                <button 
                    onClick={() => setIsOpen(true)}
                    className="w-16 h-16 bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 border-4 border-white dark:border-slate-800"
                >
                    <span className="text-3xl animate-bounce" style={{animationDuration: '2s'}}>🍅</span>
                    {isRunning && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
                    )}
                </button>
            )}
        </div>
    );
};
