import React, { useState, useEffect } from 'react';

// Game Types
type GameType = 'nback' | 'stroop' | 'schulte' | null;

interface CognitivePrimingProps {
    onComplete?: (results: any) => void;
}

export const CognitivePriming: React.FC<CognitivePrimingProps> = ({ onComplete }) => {
    const [selectedGame, setSelectedGame] = useState<GameType>(null);
    const [gameState, setGameState] = useState<'intro' | 'playing' | 'result'>('intro');
    const [score, setScore] = useState(0);

    const renderGame = () => {
        switch (selectedGame) {
            case 'nback': return <NBackGame onFinish={(s) => finishGame(s)} />;
            case 'stroop': return <StroopGame onFinish={(s) => finishGame(s)} />;
            case 'schulte': return <SchulteGame onFinish={(s) => finishGame(s)} />;
            default: return null;
        }
    };

    const finishGame = (finalScore: number) => {
        setScore(finalScore);
        setGameState('result');
    };

    const reset = () => {
        setSelectedGame(null);
        setGameState('intro');
        setScore(0);
    };

    if (gameState === 'intro') {
        return (
            <div className="p-8">
                <div className="text-center mb-10">
                    <h3 className="text-2xl font-black text-slate-800 mb-2">Cognitive Priming</h3>
                    <p className="text-slate-500">공부 시작 전, 3분 두뇌 워밍업으로 전두엽을 깨우세요.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <button onClick={() => { setSelectedGame('nback'); setGameState('playing'); }} className="bg-white p-6 rounded-2xl border-2 border-slate-100 hover:border-indigo-500 hover:shadow-xl transition-all group text-left">
                        <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">🔢</div>
                        <h4 className="font-bold text-slate-800 mb-1 group-hover:text-indigo-600">N-Back Memory</h4>
                        <p className="text-xs text-slate-500">작업 기억력(Working Memory) 활성화</p>
                    </button>
                    <button onClick={() => { setSelectedGame('stroop'); setGameState('playing'); }} className="bg-white p-6 rounded-2xl border-2 border-slate-100 hover:border-rose-500 hover:shadow-xl transition-all group text-left">
                        <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">🎨</div>
                        <h4 className="font-bold text-slate-800 mb-1 group-hover:text-rose-600">Stroop Test</h4>
                        <p className="text-xs text-slate-500">억제 제어력 및 충동 조절 훈련</p>
                    </button>
                    <button onClick={() => { setSelectedGame('schulte'); setGameState('playing'); }} className="bg-white p-6 rounded-2xl border-2 border-slate-100 hover:border-emerald-500 hover:shadow-xl transition-all group text-left">
                        <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">👀</div>
                        <h4 className="font-bold text-slate-800 mb-1 group-hover:text-emerald-600">Schulte Table</h4>
                        <p className="text-xs text-slate-500">시야각 확장 및 스캐닝 속도 향상</p>
                    </button>
                </div>
            </div>
        );
    }

    if (gameState === 'result') {
        return (
            <div className="p-8 text-center flex flex-col items-center justify-center h-full">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-4xl mb-6 animate-in zoom-in">
                    🧠
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">Brain Activated!</h3>
                <p className="text-slate-500 mb-8">두뇌 워밍업이 완료되었습니다. 이제 공부에 집중하세요.</p>
                <div className="bg-slate-50 px-8 py-4 rounded-xl mb-8">
                    <p className="text-xs text-slate-400 font-bold uppercase mb-1">Session Score</p>
                    <p className="text-3xl font-black text-indigo-600">{score} pts</p>
                </div>
                <button onClick={reset} className="px-6 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-colors">
                    다른 게임 하기
                </button>
            </div>
        );
    }

    return (
        <div className="p-8 h-full flex flex-col">
            <button onClick={reset} className="self-start text-xs font-bold text-slate-400 hover:text-slate-600 mb-4">← 뒤로가기</button>
            <div className="flex-1 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center bg-slate-50/50 relative overflow-hidden">
                {renderGame()}
            </div>
        </div>
    );
};

// --- Mini Games Implementation ---

const NBackGame = ({ onFinish }: { onFinish: (score: number) => void }) => {
    const [sequence, setSequence] = useState<number[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);

    // Simple simulation for demo purposes
    useEffect(() => {
        const interval = setInterval(() => {
            if (currentIndex >= 10) {
                setGameOver(true);
                onFinish(score * 10);
                clearInterval(interval);
            } else {
                setSequence(prev => [...prev, Math.floor(Math.random() * 9)]);
                setCurrentIndex(prev => prev + 1);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [currentIndex]);

    return (
        <div className="text-center">
            <h4 className="text-xl font-bold text-indigo-900 mb-4">1-Back Memory</h4>
            <div className="text-8xl font-black text-slate-800 mb-8">
                {sequence[sequence.length - 1] ?? '?'}
            </div>
            <div className="flex gap-4 justify-center">
                <button onClick={() => setScore(s => s + 1)} className="px-6 py-3 bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 active:scale-95">일치 (Match)</button>
                <button className="px-6 py-3 bg-slate-200 text-slate-600 rounded-xl font-bold active:scale-95">불일치</button>
            </div>
        </div>
    );
};

const StroopGame = ({ onFinish }: { onFinish: (score: number) => void }) => {
    // Stroop implementation placeholder
    return (
        <div className="text-center">
            <h4 className="text-xl font-bold text-rose-900 mb-8">Stroop Test</h4>
            <div className="text-6xl font-black text-blue-500 mb-12">빨강</div>
            <p className="text-sm text-slate-500 mb-4">글자의 색상을 선택하세요!</p>
            <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
                <button onClick={() => onFinish(85)} className="p-4 bg-red-100 text-red-600 font-bold rounded-xl">빨강</button>
                <button onClick={() => onFinish(100)} className="p-4 bg-blue-100 text-blue-600 font-bold rounded-xl">파랑</button>
            </div>
        </div>
    );
};

const SchulteGame = ({ onFinish }: { onFinish: (score: number) => void }) => {
    // Schulte implementation placeholder
    return (
        <div className="text-center">
            <h4 className="text-xl font-bold text-emerald-900 mb-6">Schulte Table</h4>
            <div className="grid grid-cols-5 gap-2 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                {Array.from({ length: 25 }, (_, i) => i + 1).sort(() => Math.random() - 0.5).map(num => (
                    <button key={num} onClick={() => num === 25 && onFinish(92)} className="w-10 h-10 flex items-center justify-center bg-slate-100 hover:bg-emerald-500 hover:text-white rounded-lg font-bold text-slate-700 transition-colors">
                        {num}
                    </button>
                ))}
            </div>
            <p className="text-xs text-slate-400 mt-4">1부터 25까지 순서대로 누르세요.</p>
        </div>
    );
};
