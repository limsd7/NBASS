import React, { useState, useEffect } from 'react';

const COLORS = [
    { name: '빨강', value: '#ef4444' },
    { name: '파랑', value: '#3b82f6' },
    { name: '초록', value: '#10b981' },
    { name: '노랑', value: '#eab308' },
];

export const StroopTest: React.FC = () => {
    const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'RESULT'>('IDLE');
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [currentWord, setCurrentWord] = useState(COLORS[0]);
    const [currentColor, setCurrentColor] = useState(COLORS[0]);

    const startGame = () => {
        setScore(0);
        setTimeLeft(30);
        setGameState('PLAYING');
        nextRound();
    };

    const nextRound = () => {
        const wordIdx = Math.floor(Math.random() * COLORS.length);
        let colorIdx = Math.floor(Math.random() * COLORS.length);
        
        // 70% chance of mismatch (Stroop interference)
        if (Math.random() > 0.3) {
            while (colorIdx === wordIdx) {
                colorIdx = Math.floor(Math.random() * COLORS.length);
            }
        }
        
        setCurrentWord(COLORS[wordIdx]);
        setCurrentColor(COLORS[colorIdx]);
    };

    const handleAnswer = (colorValue: string) => {
        if (colorValue === currentColor.value) {
            setScore(s => s + 10);
        } else {
            setScore(s => Math.max(0, s - 5));
        }
        nextRound();
    };

    useEffect(() => {
        if (gameState === 'PLAYING') {
            const timer = setInterval(() => {
                setTimeLeft(t => {
                    if (t <= 1) {
                        setGameState('RESULT');
                        clearInterval(timer);
                        return 0;
                    }
                    return t - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [gameState]);

    if (gameState === 'IDLE') {
        return (
            <div className="flex flex-col items-center justify-center h-full text-white">
                <h2 className="text-3xl font-bold mb-4">Stroop Test</h2>
                <p className="text-slate-400 mb-8 text-center max-w-sm">
                    글자의 '의미'가 아닌 글자의 <strong>'색상'</strong>을 선택하세요.<br/>
                    충동성을 억제하고 인지 유연성을 훈련합니다.
                </p>
                <button onClick={startGame} className="px-8 py-3 bg-indigo-500 hover:bg-indigo-600 rounded-xl font-bold text-lg transition-colors">
                    30초 타임어택 시작
                </button>
            </div>
        );
    }

    if (gameState === 'RESULT') {
        return (
            <div className="flex flex-col items-center justify-center h-full text-white">
                <h2 className="text-3xl font-bold text-emerald-500 mb-2">Time's Up!</h2>
                <p className="text-2xl mb-8">최종 점수: <span className="font-black text-indigo-400">{score}</span></p>
                <button onClick={startGame} className="px-8 py-3 bg-indigo-500 hover:bg-indigo-600 rounded-xl font-bold text-lg transition-colors">
                    다시 시도
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center h-full text-white">
            <div className="flex justify-between w-full max-w-sm mb-12">
                <div className="font-bold text-indigo-400">Score: {score}</div>
                <div className="font-bold text-rose-400">Time: {timeLeft}s</div>
                <button onClick={() => setGameState('IDLE')} className="text-sm text-slate-400">종료</button>
            </div>

            <div className="text-7xl font-black mb-16 select-none" style={{ color: currentColor.value }}>
                {currentWord.name}
            </div>

            <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                {COLORS.map(c => (
                    <button 
                        key={c.name}
                        onClick={() => handleAnswer(c.value)}
                        className="py-4 rounded-xl font-bold text-xl transition-transform active:scale-95 border-2 border-slate-700 hover:border-slate-500 text-slate-300"
                    >
                        {c.name}
                    </button>
                ))}
            </div>
        </div>
    );
};
