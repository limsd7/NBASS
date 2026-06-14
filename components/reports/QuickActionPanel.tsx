import React, { useState, useEffect } from 'react';
import { CareType, QuickAction } from '../../types';
import { QUICK_ACTIONS } from '../../data/quickActions';

interface QuickActionPanelProps {
    careType: CareType;
}

export const QuickActionPanel: React.FC<QuickActionPanelProps> = ({ careType }) => {
    const actions = QUICK_ACTIONS[careType] || [];
    const [activeActionId, setActiveActionId] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

    useEffect(() => {
        let timer: any = null;
        if (isTimerRunning && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isTimerRunning) {
            setIsTimerRunning(false);
            // Optionally play a sound or show a completion message here
        }
        return () => clearInterval(timer);
    }, [isTimerRunning, timeLeft]);

    if (actions.length === 0) return null;

    const startTimer = (action: QuickAction) => {
        setActiveActionId(action.id);
        setTimeLeft(action.duration * 60);
        setIsTimerRunning(true);
    };

    const stopTimer = () => {
        setIsTimerRunning(false);
        setActiveActionId(null);
        setTimeLeft(0);
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
            <div className="bg-indigo-600 text-white p-4 flex items-center justify-between">
                <h3 className="font-bold text-lg flex items-center gap-2">
                    <span className="text-2xl">⚡</span> Quick Actions (즉시 조치)
                </h3>
                <div className="text-xs font-mono bg-indigo-800 px-3 py-1 rounded text-indigo-100">
                    Target: {careType}
                </div>
            </div>
            
            <div className="p-6">
                <p className="text-sm text-slate-500 mb-6">
                    현재 진단된 상태를 즉각적으로 개선할 수 있는 미니 액션입니다. 지금 바로 실행해보세요!
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {actions.map(action => {
                        const isActive = activeActionId === action.id;
                        return (
                            <div key={action.id} className={`border rounded-xl p-5 transition-all ${isActive ? 'border-indigo-500 ring-2 ring-indigo-200 bg-indigo-50' : 'border-slate-200 hover:border-indigo-300'}`}>
                                <div className="flex gap-4">
                                    <div className="text-4xl">{action.icon}</div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-slate-800 text-lg mb-1">{action.title}</h4>
                                        <p className="text-xs text-slate-500 mb-3">{action.description}</p>
                                        
                                        <div className="bg-slate-100 p-3 rounded-lg mb-4 text-sm text-slate-700">
                                            {action.implementation}
                                        </div>

                                        {action.results && (
                                            <div className="flex items-center gap-4 text-xs font-bold text-emerald-600 mb-4 bg-emerald-50 px-3 py-2 rounded-md">
                                                <span>📈 예상 일치도 상승: +{action.results.expectedCoherenceImprovement}%</span>
                                                <span>⏱️ 발현: {action.results.timeToEffect}</span>
                                            </div>
                                        )}

                                        {isActive ? (
                                            <div className="flex items-center gap-4 bg-indigo-900 text-white p-3 rounded-xl justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-3 h-3 rounded-full bg-red-500 ${isTimerRunning ? 'animate-pulse' : ''}`}></div>
                                                    <span className="font-mono text-2xl font-black">{formatTime(timeLeft)}</span>
                                                </div>
                                                <button onClick={stopTimer} className="text-xs bg-white text-indigo-900 font-bold px-4 py-2 rounded-lg hover:bg-slate-100">
                                                    종료하기
                                                </button>
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={() => startTimer(action)}
                                                className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <span>⏱️</span> {action.duration}분 타이머 시작하기
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
