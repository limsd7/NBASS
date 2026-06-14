import React, { useState, useEffect, useRef } from 'react';
import { HRVData } from '../../types';

interface PomodoroTimerProps {
    hrv: HRVData;
}

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ hrv }) => {
    // HRV 기반 권장 시간 계산
    const getRecommendedTime = () => {
        if (hrv.brainScore >= 80) return { focus: 50, break: 10 };
        if (hrv.brainScore <= 40) return { focus: 20, break: 5 };
        return { focus: 25, break: 5 };
    };

    const recommended = getRecommendedTime();

    // Timer State
    const [mode, setMode] = useState<TimerMode>('focus');
    const [timeLeft, setTimeLeft] = useState(recommended.focus * 60);
    const [isActive, setIsActive] = useState(false);
    const [cycles, setCycles] = useState(0);

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Initial setup based on HRV
    useEffect(() => {
        setTimeLeft(recommended.focus * 60);
    }, []);

    // Timer Logic
    useEffect(() => {
        if (isActive && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            handleTimerComplete();
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isActive, timeLeft]);

    const handleTimerComplete = () => {
        setIsActive(false);
        const audio = new Audio('/sounds/bell.mp3'); // Placeholder sound
        audio.play().catch(() => { }); // Ignore error if file not found

        if (mode === 'focus') {
            setCycles(c => c + 1);
            setMode('shortBreak');
            setTimeLeft(recommended.break * 60);
            alert('⏰ 집중 시간이 끝났습니다! 뇌 휴식을 취해주세요.');
        } else {
            setMode('focus');
            setTimeLeft(recommended.focus * 60);
            alert('🔋 충전 완료! 다시 집중을 시작해볼까요?');
        }
    };

    const toggleTimer = () => setIsActive(!isActive);
    const resetTimer = () => {
        setIsActive(false);
        setMode('focus');
        setTimeLeft(recommended.focus * 60);
        setCycles(0);
    };

    // Formatter
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Calculate progress for circular UI
    const totalTime = mode === 'focus' ? recommended.focus * 60 : recommended.break * 60;
    const progress = ((totalTime - timeLeft) / totalTime) * 100;

    return (
        <div className="flex flex-col items-center justify-center p-8">
            <div className="mb-8 text-center">
                <h3 className="text-2xl font-black text-slate-800 mb-2">Bio-Adaptive Cycle</h3>
                <p className="text-sm text-slate-500 font-medium">
                    현재 두뇌 컨디션(Score: {hrv.brainScore})에 최적화된 학습 주기입니다.
                </p>
            </div>

            {/* Circular Timer UI */}
            <div className="relative w-80 h-80 mb-10 flex items-center justify-center">
                {/* SVG Circle */}
                <svg className="absolute w-full h-full transform -rotate-90">
                    <circle
                        cx="160"
                        cy="160"
                        r="140"
                        className="stroke-slate-100 fill-none"
                        strokeWidth="12"
                    />
                    <circle
                        cx="160"
                        cy="160"
                        r="140"
                        className={`fill-none transition-all duration-1000 ease-linear
                            ${mode === 'focus' ? 'stroke-indigo-500' : 'stroke-emerald-500'}`}
                        strokeWidth="12"
                        strokeDasharray={2 * Math.PI * 140}
                        strokeDashoffset={2 * Math.PI * 140 * (1 - progress / 100)}
                        strokeLinecap="round"
                    />
                </svg>

                {/* Time Display */}
                <div className="text-center z-10">
                    <div className={`text-6xl font-black tabular-nums tracking-tighter mb-2
                        ${mode === 'focus' ? 'text-slate-800' : 'text-emerald-600'}`}>
                        {formatTime(timeLeft)}
                    </div>
                    <div className="text-sm font-bold uppercase tracking-widest text-slate-400">
                        {mode === 'focus' ? 'FOCUS TIME' : 'BRAIN BREAK'}
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex gap-4 mb-10">
                <button
                    onClick={toggleTimer}
                    className={`px-8 py-4 rounded-2xl font-black text-lg transition-all shadow-xl hover:scale-105 active:scale-95 flex items-center gap-2
                        ${isActive
                            ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'}`}
                >
                    {isActive ? '⏸ 잠시 멈춤' : '▶️ 시작하기'}
                </button>
                <button
                    onClick={resetTimer}
                    className="px-6 py-4 rounded-2xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                    ↺ 리셋
                </button>
            </div>

            {/* Diagnostic Result Card */}
            <div className="w-full max-w-lg bg-slate-50 border border-slate-200 p-6 rounded-2xl">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Diagnostic Prescription</h4>
                <div className="flex items-center justify-between">
                    <div className="text-center flex-1 border-r border-slate-200">
                        <p className="text-xs text-slate-500 mb-1">권장 집중 시간</p>
                        <p className="text-2xl font-black text-indigo-600">{recommended.focus}분</p>
                    </div>
                    <div className="text-center flex-1">
                        <p className="text-xs text-slate-500 mb-1">권장 휴식 시간</p>
                        <p className="text-2xl font-black text-emerald-600">{recommended.break}분</p>
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200 text-center">
                    <p className="text-sm text-slate-600 font-medium leading-relaxed">
                        {hrv.brainScore >= 80
                            ? "🚀 최상의 컨디션입니다! 긴 호흡으로 몰입 학습을 진행하세요."
                            : hrv.brainScore <= 40
                                ? "⚠️ 뇌 피로도가 높습니다. 짧게 끊어서 부담을 줄여야 합니다."
                                : "✨ 안정적인 상태입니다. 표준 주기로 리듬을 유지하세요."}
                    </p>
                </div>
            </div>
        </div>
    );
};
