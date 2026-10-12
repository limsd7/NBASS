import React, { useState, useEffect, useMemo } from 'react';
import type { BreathPattern } from '../data/breathingProtocols';

// Core Breathing Widget (Reusable, 패턴 범용)
// - pattern 미지정 시 기존 4-7-8 동작과 동일 (하위 호환)
// - hold가 0인 구간은 자동으로 건너뛴다
interface BreathingCoreProps {
    pattern?: BreathPattern;
    onComplete?: (cycles: number) => void;
}

type BreathPhase = 'inhale' | 'hold' | 'exhale' | 'hold2';

export const BreathingCore: React.FC<BreathingCoreProps> = ({ pattern, onComplete }) => {
    const phases = useMemo((): { key: BreathPhase; seconds: number }[] => {
        const p = pattern || { inhaleSec: 4, holdSec: 7, exhaleSec: 8, hold2Sec: 0 };
        const list: { key: BreathPhase; seconds: number }[] = [
            { key: 'inhale', seconds: Math.max(1, Math.round(p.inhaleSec)) },
        ];
        if (p.holdSec > 0) list.push({ key: 'hold', seconds: Math.max(1, Math.round(p.holdSec)) });
        list.push({ key: 'exhale', seconds: Math.max(1, Math.round(p.exhaleSec)) });
        if (p.hold2Sec > 0) list.push({ key: 'hold2', seconds: Math.max(1, Math.round(p.hold2Sec)) });
        return list;
    }, [pattern?.inhaleSec, pattern?.holdSec, pattern?.exhaleSec, pattern?.hold2Sec]);

    const [phaseIdx, setPhaseIdx] = useState(0);
    const [count, setCount] = useState(phases[0]?.seconds || 4);
    const [isActive, setIsActive] = useState(false);
    const [completedCycles, setCompletedCycles] = useState(0);
    const phase = phases[phaseIdx]?.key || 'inhale';

    useEffect(() => {
        setPhaseIdx(0);
        setCount(phases[0]?.seconds || 4);
        setIsActive(false);
        setCompletedCycles(0);
    }, [phases]);

    useEffect(() => {
        if (!isActive) return;

        const timer = setInterval(() => {
            setCount(prev => {
                if (prev > 1) return prev - 1;

                // 다음 단계로 전환
                const nextIdx = (phaseIdx + 1) % phases.length;
                if (nextIdx === 0) {
                    setCompletedCycles(c => {
                        const n = c + 1;
                        if (onComplete) {
                            try { onComplete(n); } catch { /* ignore */ }
                        }
                        return n;
                    });
                }
                setPhaseIdx(nextIdx);
                return phases[nextIdx]?.seconds || 4;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isActive, phaseIdx, phases]);

    const getPhaseText = () => {
        switch (phase) {
            case 'inhale': return '숨을 들이마시세요';
            case 'hold':
            case 'hold2': return '숨을 참으세요';
            case 'exhale': return '천천히 내쉬세요';
        }
    };

    const getPhaseColor = () => {
        switch (phase) {
            case 'inhale': return 'from-blue-500 to-cyan-500';
            case 'hold':
            case 'hold2': return 'from-amber-500 to-orange-500';
            case 'exhale': return 'from-emerald-500 to-green-500';
        }
    };

    const circleScale = phase === 'exhale' ? 'scale-75' : 'scale-150';

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
                        setPhaseIdx(0);
                        setCount(phases[0]?.seconds || 4);
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
                    긴장 완화에 도움이 될 수 있는 호흡 기법입니다
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
