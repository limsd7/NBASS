import React, { useState, useEffect } from 'react';

// Core Breathing Widget (Reusable)
export const BreathingCore: React.FC = () => {
    const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
    const [count, setCount] = useState(4);
    const [isActive, setIsActive] = useState(false);
    const [completedCycles, setCompletedCycles] = useState(0);

    useEffect(() => {
        if (!isActive) return;

        const timer = setInterval(() => {
            setCount(prev => {
                if (prev > 1) return prev - 1;

                // 다음 단계로 전환
                if (phase === 'inhale') {
                    setPhase('hold');
                    return 7;
                } else if (phase === 'hold') {
                    setPhase('exhale');
                    return 8;
                } else {
                    setPhase('inhale');
                    setCompletedCycles(prev => prev + 1);
                    return 4;
                }
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isActive, phase]);

    const getPhaseText = () => {
        switch (phase) {
            case 'inhale': return '숨을 들이마시세요';
            case 'hold': return '숨을 참으세요';
            case 'exhale': return '천천히 내쉬세요';
        }
    };

    const getPhaseColor = () => {
        switch (phase) {
            case 'inhale': return 'from-blue-500 to-cyan-500';
            case 'hold': return 'from-amber-500 to-orange-500';
            case 'exhale': return 'from-emerald-500 to-green-500';
        }
    };

    const circleScale = phase === 'inhale' ? 'scale-150' : phase === 'hold' ? 'scale-150' : 'scale-75';

    return (
        <div className="w-full">
            {/* 호흡 시각화 */}
            <div className="relative h-64 flex items-center justify-center mb-8">
                <div
                    className={`absolute w-32 h-32 rounded-full bg-gradient-to-br ${getPhaseColor()} transition-all duration-1000 ${circleScale} opacity-60`}
                />
                <div className="relative z-10 text-center">
                    <p className="text-6xl font-black text-slate-900 mb-2">{count}</p>
                    <p className="text-lg font-bold text-slate-700">{getPhaseText()}</p>
                </div>
            </div>

            {/* 완료 사이클 */}
            <div className="text-center mb-6">
                <p className="text-sm text-slate-500">완료한 사이클</p>
                <p className="text-3xl font-black text-blue-600">{completedCycles}</p>
            </div>

            {/* 컨트롤 버튼 */}
            <div className="flex gap-3">
                <button
                    onClick={() => setIsActive(!isActive)}
                    className={`flex-1 py-4 rounded-xl font-bold text-white transition-all ${isActive
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                >
                    {isActive ? '일시정지' : '시작하기'}
                </button>
                <button
                    onClick={() => {
                        setIsActive(false);
                        setPhase('inhale');
                        setCount(4);
                        setCompletedCycles(0);
                    }}
                    className="px-6 py-4 bg-slate-200 hover:bg-slate-300 rounded-xl font-bold text-slate-700 transition-all"
                >
                    초기화
                </button>
            </div>
        </div>
    );
};

// Original Modal Wrapper
export const BreathingGuide: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-2xl"
                >
                    ×
                </button>

                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-2xl font-bold text-slate-900">4-7-8 호흡법</h2>
                    {/* New Window Link */}
                    <button
                        onClick={() => window.open('/breathing', '_blank')}
                        className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full hover:bg-indigo-100 font-bold"
                    >
                        전체 가이드 보기 ↗
                    </button>
                </div>
                <p className="text-sm text-slate-500 mb-8">
                    불안 완화와 수면 개선에 효과적인 호흡 기법입니다
                </p>

                <BreathingCore />

                {/* 안내 */}
                <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                    <p className="text-xs text-blue-900 font-bold mb-2">💡 사용 팁</p>
                    <ul className="text-xs text-blue-700 space-y-1">
                        <li>• 편안한 자세로 앉거나 누워주세요</li>
                        <li>• 4-8회 반복하면 효과적입니다</li>
                        <li>• 잠들기 전이나 스트레스 받을 때 실천하세요</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};
