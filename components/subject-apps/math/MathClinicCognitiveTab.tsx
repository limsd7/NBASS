import React from 'react';
import { MathClinicController } from './useMathClinic';

interface Props {
    controller: MathClinicController;
}

/* ==================== TAB 2: 30초 인지 계산 & 줄맞춤 훈련 ==================== */
export const MathClinicCognitiveTab: React.FC<Props> = ({ controller }) => {
    const {
        cognitiveDrill,
        leftColumnNote,
        setLeftColumnNote,
        rightColumnNote,
        setRightColumnNote,
        cognitiveSecondsLeft,
        isPassageBlinded,
        setIsPassageBlinded,
        cognitiveSelectedOption,
        setCognitiveSelectedOption,
        cognitiveSubmitted,
        feedbackResult,
        loadOrCreateCognitiveDrill,
        handleCognitiveSubmit
    } = controller;

    return (
        <div className="space-y-6">
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                        <span>🧠</span>
                        <span>30초 인지 계산 & 세로 2단 줄맞춤 훈련 (계산 실수 원천 차단)</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                        발문 조건을 30초 동안 쪼개고, 세로 2단 노트(좌: 식 정리 / 우: 대입 연산)에 줄맞춰 적어 계산 실수를 차단합니다.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className={`px-4 py-1.5 rounded-xl font-mono font-black text-sm flex items-center gap-1.5 border ${cognitiveSecondsLeft <= 10
                            ? 'bg-rose-950/80 text-rose-400 border-rose-500 animate-pulse'
                            : 'bg-indigo-950/80 text-indigo-300 border-indigo-700'
                        }`}>
                        <span>⏳</span>
                        <span>{cognitiveSecondsLeft}s</span>
                    </div>

                    <button
                        onClick={loadOrCreateCognitiveDrill}
                        className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                    >
                        새 인지 훈련 문제
                    </button>
                </div>
            </div>

            {cognitiveDrill && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* 지문 영역 (30초 후 블라인드 처리) */}
                    <div className="lg:col-span-7 bg-slate-950/80 rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6 relative overflow-hidden">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                                <span>👁️</span>
                                <span>30초 집중 스캔 & 세로 2단 분해</span>
                            </span>
                            <span className="text-xs text-amber-400 font-bold">
                                {isPassageBlinded ? '🔒 블라인드 활성화' : '눈으로 핵심 조건을 분해하세요!'}
                            </span>
                        </div>

                        {/* 블라인드 오버레이 */}
                        {isPassageBlinded ? (
                            <div className="bg-slate-900/90 border border-indigo-500/40 rounded-2xl p-8 text-center space-y-3 animate-in fade-in duration-300">
                                <span className="text-4xl block">🙈</span>
                                <h4 className="text-base font-black text-white">지문이 블라인드 처리되었습니다!</h4>
                                <p className="text-xs text-slate-300 leading-relaxed">
                                    세로 2단 줄맞춤 노트에 정리한 조건과 계산식을 토대로 문제를 해결하세요.
                                </p>
                                <button
                                    onClick={() => setIsPassageBlinded(false)}
                                    className="text-[11px] text-slate-400 hover:text-white underline pt-2 cursor-pointer"
                                >
                                    지문 다시 5초간 엿보기 (힌트)
                                </button>
                            </div>
                        ) : (
                            <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 font-mono text-sm leading-relaxed text-slate-200 whitespace-pre-wrap">
                                {cognitiveDrill.passage}
                            </div>
                        )}

                        {/* 세로 2단 줄맞춤 인터랙티브 연습장 */}
                        <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-2xl space-y-3">
                            <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                                <span>✏️</span>
                                <span>세로 2단 줄맞춤 연습 영역 (좌우 분할)</span>
                            </span>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {/* 좌측단: 조건 및 도함수 분해 */}
                                <div>
                                    <label className="text-[11px] font-bold text-slate-400 mb-1 block">
                                        [좌측단] 조건 해석 & 도함수 인수분해
                                    </label>
                                    <textarea
                                        value={leftColumnNote}
                                        onChange={(e) => setLeftColumnNote(e.target.value)}
                                        placeholder="예: f'(x) = 6(x-1)(x-2) = 0&#10;x = 1, 2 에서 극값 후보"
                                        rows={4}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
                                    />
                                </div>

                                {/* 우측단: 줄맞춤 대입 연산 */}
                                <div>
                                    <label className="text-[11px] font-bold text-slate-400 mb-1 block">
                                        [우측단] 단계별 줄맞춤 대입 연산
                                    </label>
                                    <textarea
                                        value={rightColumnNote}
                                        onChange={(e) => setRightColumnNote(e.target.value)}
                                        placeholder="예: f(0)=k&#10;f(1)=k+5&#10;f(2)=k+4&#10;f(3)=k+9 (최대)"
                                        rows={4}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 우측: 블라인드 문제 풀이 */}
                    <div className="lg:col-span-5 bg-slate-950/80 rounded-3xl p-6 sm:p-8 border border-slate-800 flex flex-col justify-between space-y-6">
                        <div className="space-y-4">
                            <div className="p-4 bg-indigo-950/40 border border-indigo-800/40 rounded-2xl">
                                <h4 className="text-xs font-bold text-indigo-400 mb-1">Q. 세로 2단 줄맞춤 검증 문제</h4>
                                <p className="text-sm font-black text-white">{cognitiveDrill.question}</p>
                            </div>

                            <div className="space-y-2.5">
                                {cognitiveDrill.options.map((opt, idx) => {
                                    const isSelected = cognitiveSelectedOption === idx;
                                    const isCorrectOption = idx === cognitiveDrill.correctIndex;
                                    let optionStyle = 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800';

                                    if (cognitiveSubmitted) {
                                        if (isCorrectOption) {
                                            optionStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-300 font-bold';
                                        } else if (isSelected && !isCorrectOption) {
                                            optionStyle = 'bg-rose-950/60 border-rose-500 text-rose-300 line-through';
                                        } else {
                                            optionStyle = 'bg-slate-900/40 border-slate-800/40 text-slate-500';
                                        }
                                    } else if (isSelected) {
                                        optionStyle = 'bg-indigo-600/30 border-indigo-500 text-white font-bold ring-2 ring-indigo-500/50';
                                    }

                                    return (
                                        <button
                                            key={idx}
                                            disabled={cognitiveSubmitted}
                                            onClick={() => setCognitiveSelectedOption(idx)}
                                            className={`w-full text-left p-3.5 rounded-2xl border text-xs sm:text-sm transition-all flex items-start gap-3 cursor-pointer ${optionStyle}`}
                                        >
                                            <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                                                {idx + 1}
                                            </span>
                                            <span className="flex-1 font-mono">{opt}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {!cognitiveSubmitted ? (
                            <button
                                onClick={handleCognitiveSubmit}
                                disabled={cognitiveSelectedOption === null}
                                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 text-white font-bold rounded-2xl text-sm transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <span>🧠</span>
                                <span>줄맞춤 정답 검증 완료</span>
                            </button>
                        ) : (
                            <div className="space-y-4 animate-in fade-in duration-200">
                                <div className={`p-4 rounded-2xl border ${feedbackResult?.isCorrect
                                        ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300'
                                        : 'bg-rose-950/40 border-rose-500/60 text-rose-300'
                                    }`}>
                                    <div className="font-black text-sm mb-1">
                                        {feedbackResult?.isCorrect ? '🎯 줄맞춤 정렬 성공! 실수를 잘 막았습니다.' : '❌ 계산 또는 경계값 누락이 발생했습니다.'}
                                    </div>
                                    <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                                        {cognitiveDrill.strategyFeedback}
                                    </p>
                                </div>

                                <button
                                    onClick={loadOrCreateCognitiveDrill}
                                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-xs transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                    <span>➔</span>
                                    <span>다음 줄맞춤 인지 훈련</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MathClinicCognitiveTab;