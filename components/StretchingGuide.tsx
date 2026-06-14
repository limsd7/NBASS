import React, { useState, useEffect } from 'react';

type StretchingSession = {
    id: string;
    title: string;
    duration: string;
    steps: {
        instruction: string;
        timeMs: number;
        icon: string;
    }[];
};

const SESSIONS: StretchingSession[] = [
    {
        id: '1',
        title: '목/어깨 스트레칭',
        duration: '약 1분',
        steps: [
            { instruction: '오른손으로 왼쪽 머리를 잡고 부드럽게 당겨주세요.', timeMs: 15000, icon: '💆' },
            { instruction: '반대쪽도 동일하게 진행해주세요.', timeMs: 15000, icon: '💆‍♀️' },
            { instruction: '양손 깍지를 끼고 뒤통수를 부드럽게 앞으로 눌러주세요.', timeMs: 15000, icon: '🙇' },
            { instruction: '어깨를 크게 뒤로 5번 천천히 돌려주세요.', timeMs: 10000, icon: '🔄' },
        ]
    },
    {
        id: '2',
        title: '허리 스트레칭',
        duration: '약 1분',
        steps: [
            { instruction: '의자에 바르게 앉아 상체를 왼쪽으로 부드럽게 틀어주세요.', timeMs: 15000, icon: '🪑' },
            { instruction: '반대쪽도 동일하게 상체를 오른쪽으로 틀어주세요.', timeMs: 15000, icon: '🪑' },
            { instruction: '양손을 깍지 끼고 위로 쭉 뻗으며 기지개를 켭니다.', timeMs: 15000, icon: '🙌' },
            { instruction: '상체를 앞으로 천천히 숙여 허리를 이완시킵니다.', timeMs: 15000, icon: '🧘' },
        ]
    },
    {
        id: '3',
        title: '눈 운동 (안구 피로 회복)',
        duration: '약 45초',
        steps: [
            { instruction: '눈을 강하게 감았다가 크게 뜨기를 3회 반복하세요.', timeMs: 10000, icon: '👀' },
            { instruction: '시선을 위, 아래, 좌, 우 순서로 끝까지 이동시킵니다.', timeMs: 15000, icon: '👁️' },
            { instruction: '손바닥을 비벼 따뜻하게 만든 후 눈 위에 살포시 덮어주세요.', timeMs: 20000, icon: '🤲' },
        ]
    }
];

export const StretchingGuide: React.FC = () => {
    const [activeSession, setActiveSession] = useState<StretchingSession | null>(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isRunning && timeLeft > 0) {
            timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        } else if (isRunning && timeLeft === 0) {
            if (activeSession && currentStep < activeSession.steps.length - 1) {
                // Next step
                setCurrentStep(prev => prev + 1);
                setTimeLeft(activeSession.steps[currentStep + 1].timeMs / 1000);
            } else {
                // Finished
                setIsRunning(false);
            }
        }
        return () => clearTimeout(timer);
    }, [isRunning, timeLeft, activeSession, currentStep]);

    const startSession = (session: StretchingSession) => {
        setActiveSession(session);
        setCurrentStep(0);
        setTimeLeft(session.steps[0].timeMs / 1000);
        setIsRunning(true);
    };

    const stopSession = () => {
        setActiveSession(null);
        setIsRunning(false);
    };

    if (activeSession) {
        const isFinished = timeLeft === 0 && currentStep === activeSession.steps.length - 1;
        const currentStepData = activeSession.steps[currentStep];

        return (
            <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                <button
                    onClick={stopSession}
                    className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                    ✕
                </button>
                <div className="text-center">
                    <h3 className="text-2xl font-bold mb-8 text-emerald-400">{activeSession.title}</h3>

                    {!isFinished ? (
                        <div className="animate-in slide-in-from-bottom-4 duration-500">
                            <div className="text-6xl mb-6">{currentStepData.icon}</div>
                            <p className="text-xl font-medium mb-8 leading-relaxed h-16">
                                {currentStepData.instruction}
                            </p>
                            <div className="text-5xl font-black font-mono tabular-nums text-white mb-8">
                                00:{timeLeft.toString().padStart(2, '0')}
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-2 mb-4 overflow-hidden">
                                <div 
                                    className="bg-emerald-500 h-2 rounded-full transition-all duration-1000 linear"
                                    style={{ width: `${(timeLeft / (currentStepData.timeMs / 1000)) * 100}%` }}
                                ></div>
                            </div>
                            <div className="flex justify-between text-slate-500 text-sm font-bold">
                                <span>Step {currentStep + 1} / {activeSession.steps.length}</span>
                                <button onClick={() => setIsRunning(!isRunning)} className="hover:text-white transition-colors">
                                    {isRunning ? '일시정지 ⏸️' : '계속하기 ▶️'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-in zoom-in duration-500 py-10">
                            <div className="text-6xl mb-4">🎉</div>
                            <h4 className="text-2xl font-bold mb-2">수고하셨습니다!</h4>
                            <p className="text-slate-400 mb-8">스트레칭을 완료했습니다. 맑아진 정신으로 다시 집중해볼까요?</p>
                            <button onClick={stopSession} className="px-8 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors shadow-lg">
                                목록으로 돌아가기
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SESSIONS.map(session => (
                <div key={session.id} onClick={() => startSession(session)} className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                    <div className="aspect-video bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                        <span className="text-5xl group-hover:scale-110 transition-transform">
                            {session.id === '1' ? '💆' : session.id === '2' ? '🪑' : '👀'}
                        </span>
                    </div>
                    <div className="p-4">
                        <h4 className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{session.title}</h4>
                        <span className="inline-block mt-2 px-2 py-1 bg-emerald-50 text-emerald-600 text-xs rounded font-bold">
                            타이머 모드 ({session.duration})
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
};
