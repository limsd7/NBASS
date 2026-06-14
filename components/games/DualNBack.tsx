import React, { useState, useEffect, useRef } from 'react';

export const DualNBack: React.FC = () => {
    const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'RESULT'>('IDLE');
    const [n, setN] = useState(2);
    const [score, setScore] = useState(0);
    const [positionGrid, setPositionGrid] = useState<number | null>(null);
    const [history, setHistory] = useState<number[]>([]);
    const [matched, setMatched] = useState<boolean | null>(null);
    const intervalRef = useRef<any>(null);

    const startGame = () => {
        setGameState('PLAYING');
        setScore(0);
        setHistory([]);
        nextRound();
    };

    const nextRound = () => {
        const nextPos = Math.floor(Math.random() * 9);
        setPositionGrid(nextPos);
        setHistory(prev => [...prev, nextPos]);
        setMatched(null);

        intervalRef.current = setTimeout(() => {
            setPositionGrid(null);
            setTimeout(() => {
                if (gameState === 'PLAYING') {
                    // check if round ends
                }
            }, 500);
        }, 1500);
    };

    const handleMatchClick = () => {
        if (history.length <= n) return;
        const isMatch = history[history.length - 1] === history[history.length - 1 - n];
        if (isMatch) {
            setScore(s => s + 10);
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
            }, 2500);
            return () => clearInterval(timer);
        }
    }, [gameState, n, history.length]);

    useEffect(() => {
        return () => clearTimeout(intervalRef.current);
    }, []);

    if (gameState === 'IDLE') {
        return (
            <div className="flex flex-col items-center justify-center h-full text-white">
                <h2 className="text-3xl font-bold mb-4">Dual N-Back</h2>
                <p className="text-slate-400 mb-8 text-center max-w-sm">
                    현재 나오는 사각형의 위치가 {n}번 전의 위치와 같다면 [일치] 버튼을 누르세요. 작업 기억력을 향상시킵니다.
                </p>
                <div className="flex gap-4 mb-8">
                    <button onClick={() => setN(Math.max(1, n - 1))} className="px-4 py-2 bg-slate-800 rounded-lg">- N</button>
                    <div className="px-6 py-2 bg-slate-700 rounded-lg font-bold text-xl">N = {n}</div>
                    <button onClick={() => setN(n + 1)} className="px-4 py-2 bg-slate-800 rounded-lg">+ N</button>
                </div>
                <button onClick={startGame} className="px-8 py-3 bg-indigo-500 hover:bg-indigo-600 rounded-xl font-bold text-lg transition-colors">
                    훈련 시작
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center h-full text-white">
            <div className="flex justify-between w-full max-w-sm mb-8">
                <div className="font-bold text-indigo-400">Score: {score}</div>
                <div className="font-bold text-slate-400">N={n}</div>
                <button onClick={() => setGameState('IDLE')} className="text-sm text-rose-400">종료</button>
            </div>
            
            <div className="grid grid-cols-3 gap-2 w-64 h-64 bg-slate-800 p-2 rounded-xl mb-8 relative">
                {Array.from({ length: 9 }).map((_, i) => (
                    <div 
                        key={i} 
                        className={`rounded-lg transition-colors duration-200 ${positionGrid === i ? 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.6)]' : 'bg-slate-700'}`}
                    />
                ))}
                {matched === true && <div className="absolute inset-0 border-4 border-emerald-500 rounded-xl animate-ping pointer-events-none" />}
                {matched === false && <div className="absolute inset-0 border-4 border-rose-500 rounded-xl animate-ping pointer-events-none" />}
            </div>

            <button 
                onClick={handleMatchClick}
                className="w-64 py-4 bg-emerald-500 hover:bg-emerald-600 rounded-xl font-bold text-xl transition-colors active:scale-95"
            >
                위치 일치!
            </button>
        </div>
    );
};
