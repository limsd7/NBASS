import React, { useState, useEffect } from 'react';

export const DigitSpan: React.FC = () => {
    const [gameState, setGameState] = useState<'IDLE' | 'SHOWING' | 'INPUT' | 'RESULT'>('IDLE');
    const [level, setLevel] = useState(4);
    const [sequence, setSequence] = useState<number[]>([]);
    const [input, setInput] = useState<string>('');
    const [showIndex, setShowIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

    const startGame = () => {
        setScore(0);
        setLevel(4);
        startRound(4);
    };

    const startRound = (currentLevel: number) => {
        const newSeq = Array.from({ length: currentLevel }, () => Math.floor(Math.random() * 10));
        setSequence(newSeq);
        setShowIndex(0);
        setInput('');
        setIsCorrect(null);
        setGameState('SHOWING');
    };

    useEffect(() => {
        if (gameState === 'SHOWING') {
            if (showIndex < sequence.length) {
                const timer = setTimeout(() => {
                    setShowIndex(i => i + 1);
                }, 1000);
                return () => clearTimeout(timer);
            } else {
                setGameState('INPUT');
            }
        }
    }, [gameState, showIndex, sequence.length]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const expected = sequence.join('');
        if (input === expected) {
            setIsCorrect(true);
            setScore(s => s + level * 10);
            setTimeout(() => {
                setLevel(l => l + 1);
                startRound(level + 1);
            }, 1000);
        } else {
            setIsCorrect(false);
            setGameState('RESULT');
        }
    };

    if (gameState === 'IDLE') {
        return (
            <div className="flex flex-col items-center justify-center h-full text-white">
                <h2 className="text-3xl font-bold mb-4">Digit Span Test</h2>
                <p className="text-slate-400 mb-8 text-center max-w-sm">
                    화면에 순서대로 나타나는 숫자를 기억한 뒤, 똑같은 순서대로 입력하세요.
                </p>
                <button onClick={startGame} className="px-8 py-3 bg-indigo-500 hover:bg-indigo-600 rounded-xl font-bold text-lg transition-colors">
                    시작하기
                </button>
            </div>
        );
    }

    if (gameState === 'RESULT') {
        return (
            <div className="flex flex-col items-center justify-center h-full text-white">
                <h2 className="text-3xl font-bold text-rose-500 mb-2">Game Over!</h2>
                <p className="text-xl mb-4">최종 레벨: {level}</p>
                <p className="text-lg text-slate-400 mb-8">Score: {score}</p>
                <p className="mb-4 text-slate-300">정답: {sequence.join('')}</p>
                <p className="mb-8 text-slate-300">입력: {input}</p>
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
                <div className="font-bold text-slate-400">Level {level}</div>
                <button onClick={() => setGameState('IDLE')} className="text-sm text-rose-400">종료</button>
            </div>

            {gameState === 'SHOWING' ? (
                <div className="text-8xl font-black text-white h-32 flex items-center justify-center">
                    {showIndex < sequence.length ? sequence[showIndex] : ''}
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="flex flex-col items-center">
                    <input 
                        type="number" 
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        autoFocus
                        className="bg-slate-800 text-white text-4xl text-center w-64 p-4 rounded-xl mb-8 border-2 border-slate-600 focus:border-indigo-500 outline-none transition-colors"
                        placeholder="숫자 입력"
                    />
                    <button type="submit" className="w-64 py-4 bg-emerald-500 hover:bg-emerald-600 rounded-xl font-bold text-xl transition-colors">
                        확인
                    </button>
                    {isCorrect === true && <div className="mt-4 text-emerald-400 font-bold animate-bounce">정답입니다! Level UP!</div>}
                </form>
            )}
        </div>
    );
};
