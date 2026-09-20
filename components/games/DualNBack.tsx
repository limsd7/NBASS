import React, { useState, useEffect, useRef } from 'react';

interface DualNBackProps {
    onClose?: () => void;
}

export const DualNBack: React.FC<DualNBackProps> = ({ onClose }) => {
    const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'RESULT'>('IDLE');
    const [n, setN] = useState(2);
    const [score, setScore] = useState(0);
    const [trialsCount, setTrialsCount] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [positionGrid, setPositionGrid] = useState<number | null>(null);
    const [history, setHistory] = useState<number[]>([]);
    const [matched, setMatched] = useState<boolean | null>(null);
    const intervalRef = useRef<any>(null);

    const maxTrials = 20;

    const startGame = () => {
        setGameState('PLAYING');
        setScore(0);
        setTrialsCount(0);
        setCorrectCount(0);
        setHistory([]);
        nextRound();
    };

    const nextRound = () => {
        const nextPos = Math.floor(Math.random() * 9);
        setPositionGrid(nextPos);
        setHistory(prev => [...prev, nextPos]);
        setMatched(null);
        setTrialsCount(prev => prev + 1);

        if (trialsCount >= maxTrials) {
            setGameState('RESULT');
            return;
        }

        intervalRef.current = setTimeout(() => {
            setPositionGrid(null);
        }, 1200);
    };

    const handleMatchClick = () => {
        if (history.length <= n) return;
        const isMatch = history[history.length - 1] === history[history.length - 1 - n];
        if (isMatch) {
            setScore(s => s + 10);
            setCorrectCount(c => c + 1);
            setMatched(true);
        } else {
            setScore(s => Math.max(0, s - 5));
            setMatched(false);
        }
    };

    useEffect(() => {
        if (gameState === 'PLAYING') {
            const timer = setInterval(() => {
                nextRound();
            }, 2400);
            return () => clearInterval(timer);
        }
    }, [gameState, n, history.length, trialsCount]);

    useEffect(() => {
        return () => clearTimeout(intervalRef.current);
    }, []);

    if (gameState === 'IDLE') {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-slate-800 dark:text-slate-100 max-w-lg mx-auto shadow-xl transition-colors">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 shadow-sm">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <h2 className="text-2xl font-black mb-2 tracking-tight">Dual N-Back 훈련</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-6 text-center text-xs leading-relaxed max-w-sm">
                    현재 사각형의 위치가 <span className="text-indigo-600 dark:text-indigo-400 font-bold">{n}번 전</span>의 위치와 동일한 순간 <span className="font-bold text-slate-700 dark:text-slate-200">[위치 일치!]</span>를 누르세요. 작업기억력과 전두엽 활성도를 극대화합니다.
                </p>

                <div className="flex items-center gap-3 mb-6 bg-slate-50 dark:bg-slate-800/80 p-2 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <button 
                        onClick={() => setN(Math.max(1, n - 1))} 
                        className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-xl font-bold shadow-sm transition-all"
                    >
                        -
                    </button>
                    <div className="px-5 py-2 font-black text-indigo-600 dark:text-indigo-400 text-lg">
                        N = {n}
                    </div>
                    <button 
                        onClick={() => setN(n + 1)} 
                        className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-xl font-bold shadow-sm transition-all"
                    >
                        +
                    </button>
                </div>

                <div className="flex items-center gap-3 w-full">
                    {onClose && (
                        <button 
                            onClick={onClose}
                            className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm transition-all"
                        >
                            닫기
                        </button>
                    )}
                    <button 
                        onClick={startGame} 
                        className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-sm transition-all shadow-md shadow-indigo-200 dark:shadow-none"
                    >
                        훈련 시작하기
                    </button>
                </div>
            </div>
        );
    }

    if (gameState === 'RESULT') {
        const accuracy = trialsCount > 0 ? Math.round((correctCount / Math.max(1, trialsCount - n)) * 100) : 0;
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-slate-800 dark:text-slate-100 max-w-lg mx-auto shadow-xl transition-colors">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-xl font-black mb-1">훈련 완료</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">N={n} 세션 결과 분석</p>

                <div className="grid grid-cols-2 gap-3 w-full mb-6">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">최종 점수</span>
                        <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{score}점</div>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">일치 검출 정확도</span>
                        <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{accuracy}%</div>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full">
                    <button 
                        onClick={() => setGameState('IDLE')} 
                        className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs transition-all"
                    >
                        설정으로
                    </button>
                    <button 
                        onClick={startGame} 
                        className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition-all shadow-md"
                    >
                        다시 도전
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-slate-800 dark:text-slate-100 max-w-sm mx-auto shadow-2xl transition-colors">
            <div className="flex justify-between items-center w-full mb-6">
                <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 font-black text-xs">
                        N = {n}
                    </span>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        {trialsCount}/{maxTrials}
                    </span>
                </div>
                <div className="font-mono font-black text-indigo-600 dark:text-indigo-400 text-sm">
                    점수: {score}
                </div>
                <button 
                    onClick={() => setGameState('IDLE')} 
                    className="text-xs font-bold text-rose-500 hover:text-rose-600 px-2 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                >
                    종료
                </button>
            </div>
            
            {/* Grid Container */}
            <div className="grid grid-cols-3 gap-2.5 w-64 h-64 bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl mb-6 relative border border-slate-200 dark:border-slate-700">
                {Array.from({ length: 9 }).map((_, i) => (
                    <div 
                        key={i} 
                        className={`rounded-xl transition-all duration-200 flex items-center justify-center ${
                            positionGrid === i 
                                ? 'bg-indigo-600 dark:bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.7)] scale-95' 
                                : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/60'
                        }`}
                    />
                ))}
                {matched === true && <div className="absolute inset-0 border-4 border-emerald-500 rounded-2xl animate-ping pointer-events-none" />}
                {matched === false && <div className="absolute inset-0 border-4 border-rose-500 rounded-2xl animate-ping pointer-events-none" />}
            </div>

            <button 
                onClick={handleMatchClick}
                className="w-64 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-base shadow-lg shadow-emerald-200 dark:shadow-none transition-all active:scale-95 flex items-center justify-center gap-2"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                <span>위치 일치!</span>
            </button>
        </div>
    );
};
