import React, { useState, useEffect } from 'react';

export const PomodoroTimer: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState<'FOCUS' | 'BREAK'>('FOCUS');
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isRunning && timeLeft > 0) {
            timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        } else if (isRunning && timeLeft === 0) {
            // Timer finished
            setIsRunning(false);
            const audio = new Audio('data:audio/mp3;base64,//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq'); // silent placeholder to avoid empty errors, actually we can just rely on UI update or browser ding.
            audio.play().catch(() => {});
            
            if (mode === 'FOCUS') {
                setMode('BREAK');
                setTimeLeft(5 * 60);
            } else {
                setMode('FOCUS');
                setTimeLeft(25 * 60);
            }
        }
        return () => clearTimeout(timer);
    }, [isRunning, timeLeft, mode]);

    const toggleTimer = () => setIsRunning(!isRunning);

    const resetTimer = () => {
        setIsRunning(false);
        setTimeLeft(mode === 'FOCUS' ? 25 * 60 : 5 * 60);
    };

    const switchMode = (newMode: 'FOCUS' | 'BREAK') => {
        setIsRunning(false);
        setMode(newMode);
        setTimeLeft(newMode === 'FOCUS' ? 25 * 60 : 5 * 60);
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
            {/* Expanded Timer UI */}
            {isOpen && (
                <div className="bg-white p-6 rounded-3xl shadow-2xl border border-slate-200 animate-in slide-in-from-bottom-4 duration-200 w-72">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-800">🍅 뽀모도로 타이머</h3>
                        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                    </div>

                    <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
                        <button 
                            className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-colors ${mode === 'FOCUS' ? 'bg-white shadow-sm text-rose-600' : 'text-slate-500'}`}
                            onClick={() => switchMode('FOCUS')}
                        >
                            집중 (25분)
                        </button>
                        <button 
                            className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-colors ${mode === 'BREAK' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500'}`}
                            onClick={() => switchMode('BREAK')}
                        >
                            휴식 (5분)
                        </button>
                    </div>

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
                            className="px-4 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
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
                    className="w-16 h-16 bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 border-4 border-white"
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
