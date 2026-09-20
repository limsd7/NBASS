import React, { useState, useEffect, useMemo } from 'react';
import { CareType, Prescription } from '../types';

interface PrescriptionZenModeProps {
    prescription: Prescription;
    onClose: () => void;
    careType?: CareType;
}

export const PrescriptionZenMode: React.FC<PrescriptionZenModeProps> = ({ prescription, onClose }) => {
    const [step, setStep] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [prepSeconds, setPrepSeconds] = useState<number>(15); // 15s Posture Preparation
    const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
    const [breathingScale, setBreathingScale] = useState(1);

    // Biofeedback simulation state
    const [simulatedScore, setSimulatedScore] = useState(60);

    // TTS functionality
    const speak = (text: string) => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ko-KR';
        utterance.rate = 0.9;
        utterance.pitch = 1.0;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    };

    // 1. Initial Posture Prep Countdown & Voice
    useEffect(() => {
        speak(`에너지 통장 채우기를 시작합니다. 15초 동안 편안하게 눕거나 기대어 눈을 감고 자세를 잡아보세요.`);
        
        const countdownTimer = setInterval(() => {
            setPrepSeconds(prev => {
                if (prev <= 1) {
                    clearInterval(countdownTimer);
                    speak(`자세가 준비되었습니다. 호흡을 시작합니다. 숨을 천천히 들이마시세요.`);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            clearInterval(countdownTimer);
            window.speechSynthesis.cancel();
        };
    }, []);

    const handleSkipPrep = () => {
        setPrepSeconds(0);
        speak(`자세가 준비되었습니다. 호흡을 시작합니다. 숨을 천천히 들이마시세요.`);
    };

    // 2. Breathing Animation Loop (Starts only after prep is finished)
    useEffect(() => {
        if (prepSeconds > 0) return;

        let interval: NodeJS.Timeout;
        const breathingLoop = () => {
            if (breathingPhase === 'inhale') {
                setBreathingScale(1.4);
                interval = setTimeout(() => setBreathingPhase('hold'), 4000);
            } else if (breathingPhase === 'hold') {
                interval = setTimeout(() => setBreathingPhase('exhale'), 4000);
            } else {
                setBreathingScale(1.0);
                interval = setTimeout(() => setBreathingPhase('inhale'), 6000);
            }
        };
        breathingLoop();
        return () => clearTimeout(interval);
    }, [breathingPhase, prepSeconds]);

    // 3. Progress and Step Management
    useEffect(() => {
        if (prepSeconds > 0) return;

        const totalDurationMs = 5 * 60 * 1000; // 5 minutes total
        const durationPerStep = totalDurationMs / prescription.guide.length; 
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    if (step < prescription.guide.length - 1) {
                        const nextStep = step + 1;
                        setStep(nextStep);
                        speak(`다음 단계입니다. ${prescription.guide[nextStep]}`);
                        return 0;
                    }
                    return 100;
                }
                return prev + (100 / (durationPerStep / 100));
            });

            // Biofeedback simulation: gradually increase score
            setSimulatedScore(prev => {
                const target = 85 + (step * 3);
                if (prev < target) return prev + 0.1;
                return prev;
            });

        }, 100);
        return () => clearInterval(interval);
    }, [step, prescription.guide, prepSeconds]);

    // Handle ESC key to exit
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                window.speechSynthesis.cancel();
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020617] appearance-none" style={{ backgroundColor: '#020617' }}>
            {/* Dark Overlay for absolute certainty */}
            <div className="absolute inset-0 bg-[#020617]"></div>

            {/* Background Decorative Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="relative w-full max-w-5xl h-full p-8 flex flex-col items-center justify-center overflow-y-auto z-10">
                {/* Visual Exit Button (Top Right) - Highly Visible */}
                <button
                    onClick={() => { window.speechSynthesis.cancel(); onClose(); }}
                    className="absolute top-8 right-8 w-14 h-14 flex items-center justify-center bg-white/20 hover:bg-white/40 text-white rounded-full transition-all duration-300 group shadow-2xl z-[120]"
                    title="종료 (ESC)"
                >
                    <span className="text-3xl group-hover:rotate-90 transition-transform duration-300 font-light">✕</span>
                </button>

                {/* Header */}
                <div className="text-center mb-8 animate-in slide-in-from-top-4 duration-1000">
                    <p className="text-indigo-400 font-bold tracking-[0.4em] uppercase text-[11px] mb-2">Digital Prescription Zen-Mode</p>
                    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-lg">{prescription.title}</h2>
                    <div className="mt-4 flex items-center justify-center gap-6 text-white/60 text-sm">
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                            </span>
                            <span className="font-bold tracking-widest text-emerald-400">NEURAL SENSOR ACTIVE</span>
                        </div>
                        <span className="w-px h-4 bg-white/20"></span>
                        <span className="font-medium tracking-wide">{prescription.activity}</span>
                    </div>
                </div>

                {/* 15-Second Posture Prep Overlay Modal / Banner */}
                {prepSeconds > 0 ? (
                    <div className="w-full max-w-xl p-8 bg-slate-900/90 border border-indigo-500/40 rounded-3xl backdrop-blur-xl shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-500 mb-8">
                        <div className="w-20 h-20 mx-auto rounded-full bg-indigo-600/30 border-2 border-indigo-400 flex items-center justify-center text-3xl font-black text-indigo-300 animate-pulse">
                            {prepSeconds}s
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-white mb-2">🧘 바른 자세 & 마음가짐 준비 시간</h3>
                            <p className="text-slate-300 text-sm leading-relaxed">
                                바닥이나 침대에 <strong>편안하게 눕거나</strong> 의자에 몸을 푹 맡기세요.<br />
                                시원한 바람이 부는 숲속이나 잔잔한 호수를 떠올리며 긴장을 푸세요.
                            </p>
                        </div>
                        <div className="pt-2">
                            <button
                                onClick={handleSkipPrep}
                                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-extrabold rounded-2xl shadow-xl transition-all active:scale-95"
                            >
                                ⚡ 자세 준비 완료 (바로 호흡 시작)
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full items-center mb-10">
                        {/* Left: Interactive Visuals */}
                        <div className="flex flex-col items-center justify-center space-y-12">
                            {/* Breathing Circle */}
                            <div className="relative flex items-center justify-center scale-110 lg:scale-125">
                                <div
                                    className="absolute w-44 h-44 rounded-full border border-indigo-500/20 transition-all duration-[4000ms] ease-in-out"
                                    style={{ transform: `scale(${breathingScale * 1.6})`, opacity: 0.2 }}
                                ></div>
                                <div
                                    className="absolute w-44 h-44 rounded-full bg-gradient-to-br from-indigo-500/10 to-emerald-500/10 blur-2xl transition-all duration-[4000ms] ease-in-out"
                                    style={{ transform: `scale(${breathingScale * 1.3})` }}
                                ></div>
                                <div
                                    className="w-48 h-48 rounded-full bg-gradient-to-br from-indigo-600 via-indigo-500 to-emerald-500 flex flex-col items-center justify-center shadow-[0_0_60px_rgba(79,70,229,0.4)] transition-all duration-[4000ms] ease-in-out z-10 text-center px-2"
                                    style={{ transform: `scale(${breathingScale})` }}
                                >
                                    <p className="text-white font-black text-2xl tracking-tighter">
                                        {breathingPhase === 'inhale' ? 'IN' : breathingPhase === 'hold' ? 'HOLD' : 'OUT'}
                                    </p>
                                    <p className="text-indigo-100 font-bold text-xs mt-1">
                                        {breathingPhase === 'inhale' ? '숨 들이마시기' : breathingPhase === 'hold' ? '숨 멈추기' : '숨 내쉬기'}
                                    </p>
                                </div>
                            </div>

                            {/* Biofeedback Simulation Area */}
                            <div className="w-full max-w-sm bg-slate-900/50 border border-white/10 rounded-3xl p-6 backdrop-blur-md shadow-2xl">
                                <div className="flex justify-between items-end mb-4">
                                    <div>
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">Bio-Metric Pulse</p>
                                        <h4 className="text-xl font-bold text-white tracking-tight">Brain Stability</h4>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-3xl font-black text-emerald-400 tabular-nums">{simulatedScore.toFixed(1)} <span className="text-[10px] text-emerald-500/50 uppercase">pts</span></p>
                                    </div>
                                </div>
                                <div className="h-12 flex items-center gap-1.5">
                                    {[...Array(24)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="flex-1 bg-gradient-to-t from-emerald-600/20 to-emerald-400/40 rounded-full transition-all duration-700"
                                            style={{
                                                height: `${15 + Math.random() * 70}%`,
                                                animation: `wave 2s ease-in-out infinite`,
                                                animationDelay: `${i * 0.08}s`
                                            }}
                                        ></div>
                                    ))}
                                </div>
                            </div>
                        </div>

                    {/* Right: Step-by-Step Guide & Posture Guidance */}
                    <div className="space-y-4 max-w-md mx-auto lg:mx-0">
                        {/* 에너지 통장 충전(Recharge) 바른 자세 & 마음가짐 가이드 카드 */}
                        <div className="p-4 rounded-2xl bg-indigo-950/70 border border-indigo-500/40 text-white space-y-3 text-left shadow-2xl backdrop-blur-md">
                            <div className="flex items-center gap-2 text-xs font-black text-indigo-300 border-b border-indigo-500/20 pb-2">
                                <span className="text-lg">🧘</span>
                                <span>에너지 통장 충전 (Recharge) 추천 자세 & 마음가짐</span>
                            </div>
                            
                            <div className="space-y-1.5">
                                <span className="text-[11px] font-bold text-emerald-400 block">🛏️ 추천 자세:</span>
                                <p className="text-xs text-slate-300 leading-relaxed pl-2">
                                    • <b>편안히 눕기 (강력 추천)</b>: 침대나 바닥에 등을 대고 편안하게 누워 팔다리를 가볍게 벌리고 손바닥은 하늘을 향합니다.<br />
                                    • <b>기대어 앉기</b>: 의자나 소파에 몸을 푹 맡기고 등과 목의 힘을 완전히 뺍니다.
                                </p>
                            </div>

                            <div className="space-y-1.5">
                                <span className="text-[11px] font-bold text-purple-300 block">🍃 추천 생각 (마인드셋):</span>
                                <p className="text-xs text-slate-300 leading-relaxed pl-2">
                                    • <b>잔잔한 자연 상상</b>: 잔잔하고 맑은 호숫가 물결이나, 시원하고 상쾌한 솔바람이 부는 푸른 숲속을 떠올려보세요.<br />
                                    • <b>행복했던 기억</b>: 따뜻하고 행복했던 추억을 느끼며 오직 호흡의 리듬에만 온몸을 맡깁니다.
                                </p>
                            </div>
                        </div>

                        {prescription.guide.map((g, i) => (
                            <div
                                key={i}
                                className={`p-5 rounded-2xl transition-all duration-700 border ${i === step
                                    ? 'bg-white/10 border-white/20 scale-105 shadow-2xl translate-x-2'
                                    : i < step
                                        ? 'bg-emerald-500/5 border-emerald-500/10 opacity-30 shadow-none scale-95'
                                        : 'bg-white/5 border-white/5 opacity-10 blur-[1px]'
                                    }`}
                            >
                                <div className="flex gap-4 items-start">
                                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs transition-colors duration-500 ${i === step ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : i < step ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/20'
                                        }`}>
                                        {i < step ? '✓' : i + 1}
                                    </span>
                                    <div className="flex-1">
                                        <p className={`font-bold leading-relaxed transition-all duration-500 ${i === step ? 'text-white text-base' : 'text-white/40 text-sm'}`}>
                                            {g}
                                        </p>
                                        {i === step && (
                                            <div className="mt-3 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-100 linear"
                                                    style={{ width: `${progress}%` }}
                                                ></div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                )}

                {/* Footer Controls & Message */}
                <div className="flex flex-col items-center gap-6 mt-4">
                    <button
                        onClick={() => { window.speechSynthesis.cancel(); onClose(); }}
                        className="px-10 py-4 bg-white/10 hover:bg-white text-white hover:text-slate-900 rounded-2xl font-bold transition-all duration-300 border border-white/10 hover:border-white shadow-xl flex items-center gap-3 group"
                    >
                        <span>진료 완료 및 리포트로 복귀</span>
                        <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
                    </button>

                    <div className="flex items-center gap-3 text-[10px] text-white/20 font-bold tracking-[0.2em] uppercase">
                        <span className="px-2 py-0.5 border border-white/10 rounded">ESC</span>
                        <span>Press to Quick Exit</span>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes wave {
                    0%, 100% { height: 20%; opacity: 0.3; }
                    50% { height: 90%; opacity: 0.8; }
                }
            `}</style>
        </div>
    );
};
