import React, { useState, useEffect } from 'react';
import { CareType } from '../types';
import { Sparkles, Timer, CheckCircle, RotateCcw, X, BookOpen, AlertCircle } from 'lucide-react';

interface ActiveRecallModalProps {
    isOpen: boolean;
    onClose: () => void;
    subject?: string;
    careType?: CareType;
    onSaveRecall?: (result: { subject: string; durationMinutes: number; scorePercent: number; keywords: string[] }) => void;
}

export const ActiveRecallModal: React.FC<ActiveRecallModalProps> = ({
    isOpen,
    onClose,
    subject = '수학',
    careType = CareType.HEALTHY,
    onSaveRecall
}) => {
    const [durationSeconds, setDurationSeconds] = useState<number>(180); // 3분
    const [timeLeft, setTimeLeft] = useState<number>(180);
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [isFinished, setIsFinished] = useState<boolean>(false);
    const [recallText, setRecallText] = useState<string>('');
    const [selfScore, setSelfScore] = useState<number>(80);
    const [isSaved, setIsSaved] = useState<boolean>(false);

    useEffect(() => {
        let timer: any = null;
        if (isRunning && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        setIsRunning(false);
                        setIsFinished(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isRunning, timeLeft]);

    if (!isOpen) return null;

    const startTimer = (secs: number) => {
        setDurationSeconds(secs);
        setTimeLeft(secs);
        setIsRunning(true);
        setIsFinished(false);
        setIsSaved(false);
    };

    const handleReset = () => {
        setIsRunning(false);
        setIsFinished(false);
        setTimeLeft(durationSeconds);
        setRecallText('');
        setIsSaved(false);
    };

    const handleSave = () => {
        const keywords = recallText
            .split(/[\n, ]+/)
            .map(k => k.trim())
            .filter(k => k.length > 1);

        if (onSaveRecall) {
            onSaveRecall({
                subject,
                durationMinutes: Math.round(durationSeconds / 60),
                scorePercent: selfScore,
                keywords
            });
        }
        setIsSaved(true);
        setTimeout(() => {
            onClose();
        }, 1200);
    };

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700/80 w-full max-w-2xl rounded-3xl p-6 shadow-2xl space-y-5 text-white">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-xl">
                            ✍️
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white flex items-center gap-2">
                                <span>백지 회상 인출 (Active Recall) 트래커</span>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
                                    {subject}
                                </span>
                            </h3>
                            <p className="text-xs text-slate-400">교재를 덮고 오늘 배운 핵심 개념/공식을 뇌에서 직접 인출하세요.</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Step 1: Timer & Writing Section */}
                {!isFinished ? (
                    <div className="space-y-4">
                        {/* Timer Control Bar */}
                        <div className="flex justify-between items-center bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                            <div className="flex items-center gap-2">
                                <Timer className={`w-5 h-5 ${isRunning ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
                                <span className="text-2xl font-mono font-black text-white">
                                    {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                                </span>
                            </div>
                            <div className="flex gap-2">
                                {!isRunning ? (
                                    <>
                                        <button
                                            onClick={() => startTimer(180)}
                                            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold transition"
                                        >
                                            3분 몰입 시작
                                        </button>
                                        <button
                                            onClick={() => startTimer(300)}
                                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold transition"
                                        >
                                            5분 심화 시작
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => {
                                            setIsRunning(false);
                                            setIsFinished(true);
                                        }}
                                        className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-xs font-bold transition"
                                    >
                                        인출 완료 (채점하기)
                                    </button>
                                )}
                                <button
                                    onClick={handleReset}
                                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                                    title="초기화"
                                >
                                    <RotateCcw size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Blank Sheet Textarea */}
                        <div>
                            <label className="text-xs font-bold text-slate-300 block mb-1.5">
                                📝 백지 인출 작성 공간 (Feynman Technique)
                            </label>
                            <textarea
                                value={recallText}
                                onChange={e => setRecallText(e.target.value)}
                                placeholder="예시:
1. 근의 공식 유도 과정
2. 이차방정식 판별식 D의 기하학적 의미 (D>0 교점 2개, D=0 접함, D<0 만나지 않음)
3. 근과 계수의 관계"
                                rows={8}
                                className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 font-mono resize-none"
                            />
                        </div>

                        <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-xs text-indigo-300 flex items-center gap-2">
                            <Sparkles size={16} className="text-indigo-400 flex-shrink-0" />
                            <span><strong>인출 팁</strong>: 완벽한 문장이 아니어도 괜찮습니다. 떠오르는 핵심 키워드, 공식, 인과관계를 단어 단위로 쏟아내세요.</span>
                        </div>
                    </div>
                ) : (
                    /* Step 2: Self-Evaluation & Spaced Repetition Connection */
                    <div className="space-y-4 animate-in fade-in duration-300">
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 flex items-center gap-3">
                            <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                            <div>
                                <h4 className="text-sm font-bold text-white">인출 세션이 완료되었습니다! 🎉</h4>
                                <p className="text-xs text-emerald-300/90">이제 교재나 노트를 펼치고, 방금 백지에 쓴 내용과 실제 개념을 대조하여 회상 완성도를 체크하세요.</p>
                            </div>
                        </div>

                        {/* Written Content Review */}
                        <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 max-h-40 overflow-y-auto font-mono text-xs text-slate-300 whitespace-pre-wrap">
                            {recallText || '(작성된 인출 내용이 없습니다)'}
                        </div>

                        {/* Self Score Selector */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-300 block">
                                📊 회상 완성도 자가 채점: <span className="text-indigo-400 font-bold text-sm">{selfScore}%</span>
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                                {[
                                    { score: 100, label: '💯 100% 완벽', desc: '누락 없이 모두 인출' },
                                    { score: 80, label: '✨ 80% 양호', desc: '핵심 개념 80% 기억' },
                                    { score: 50, label: '⚠️ 50% 보통', desc: '절반 정도만 기억남' },
                                    { score: 30, label: '🔴 30% 보완', desc: '핵심 공식/개념 누락' },
                                ].map(item => (
                                    <button
                                        key={item.score}
                                        type="button"
                                        onClick={() => setSelfScore(item.score)}
                                        className={`p-2.5 rounded-xl border text-left transition ${
                                            selfScore === item.score
                                                ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-md'
                                                : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:text-white'
                                        }`}
                                    >
                                        <div className="text-xs font-bold">{item.label}</div>
                                        <div className="text-[10px] text-slate-400 mt-0.5">{item.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                onClick={handleReset}
                                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition"
                            >
                                다시 인출하기
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaved}
                                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition flex items-center gap-1.5 shadow-lg shadow-indigo-600/30"
                            >
                                {isSaved ? (
                                    <>
                                        <CheckCircle size={16} />
                                        <span>기록 완료!</span>
                                    </>
                                ) : (
                                    <span>인출 기록 저장 및 완료</span>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
