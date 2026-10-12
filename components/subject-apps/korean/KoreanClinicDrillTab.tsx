import React from 'react';
import { KoreanClinicController } from './useKoreanClinic';

interface Props {
    controller: KoreanClinicController;
}

/* ==================== TAB 1: 1분 실전 문제 ==================== */
export const KoreanClinicDrillTab: React.FC<Props> = ({ controller }) => {
    const {
        currentDrill,
        isLoadingDrill,
        selectedOption,
        setSelectedOption,
        isSubmitted,
        feedbackResult,
        solveSeconds,
        initialStrategyTag,
        getTrapLabel,
        loadOrCreateDrill,
        handleSubmitDrill,
        handleGenerateTwin
    } = controller;

    return (
        <div className="space-y-6">
            {/* 전략 태그 및 헤더 바 */}
            <div className="bg-slate-800/70 border border-slate-700/80 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-black px-2.5 py-1 rounded-lg">
                        등급 맞춤 전략
                    </span>
                    <span className="font-bold text-slate-200 text-sm sm:text-base">
                        {currentDrill?.strategyTag || initialStrategyTag}
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    {/* ⏱️ 스톱워치 */}
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold ${solveSeconds > 80 ? 'bg-rose-950/60 border-rose-500 text-rose-300' :
                            solveSeconds > 50 ? 'bg-amber-950/60 border-amber-500 text-amber-300' :
                                'bg-slate-900 border-slate-700 text-blue-400'
                        }`}>
                        <span>⏱️</span>
                        <span>{String(Math.floor(solveSeconds / 60)).padStart(2, '0')}:{String(solveSeconds % 60).padStart(2, '0')}</span>
                        {solveSeconds > 80 && <span className="text-[10px] text-rose-400 font-sans font-normal ml-1">과부하 주의</span>}
                    </div>

                    <button
                        onClick={() => loadOrCreateDrill()}
                        disabled={isLoadingDrill}
                        className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1"
                    >
                        <span>✨</span>
                        <span>{isLoadingDrill ? 'AI 출제 중...' : '새 문제 출제'}</span>
                    </button>
                </div>
            </div>

            {isLoadingDrill ? (
                <div className="py-24 flex flex-col items-center justify-center space-y-4">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-semibold text-slate-400 animate-pulse">
                        Gemini Flash AI가 평가원 3대 함정 선지를 정밀 설계 중입니다... (약 1.5초)
                    </p>
                </div>
            ) : currentDrill ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* 좌측: 지문 독해 패널 (7열) */}
                    <div className="lg:col-span-7 bg-slate-950/60 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col shadow-inner">
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                                <span>📖</span>
                                <span>제재: {currentDrill.topicKeyword}</span>
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono">
                                지문 길이: {currentDrill.passage.length}자
                            </span>
                        </div>

                        <div className="prose prose-invert max-w-none text-slate-200 text-sm sm:text-base leading-relaxed whitespace-pre-line select-text font-serif">
                            {currentDrill.passage}
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                            <span>💡 팁: 핵심 명제 간의 인과관계를 의심하며 읽으세요.</span>
                            <span className="bg-slate-800 px-2 py-0.5 rounded text-[11px]">중복 방지 핑거프린트 인증됨</span>
                        </div>
                    </div>

                    {/* 우측: 문제 & 선지 판별 패널 (5열) */}
                    <div className="lg:col-span-5 flex flex-col space-y-4">
                        <div className="bg-slate-800/60 border border-slate-700/80 rounded-3xl p-6 flex flex-col flex-1 shadow-lg">
                            {/* 발문 */}
                            <div className="mb-4">
                                <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block mb-1">
                                    Question (1문항 타임어택)
                                </span>
                                <h3 className="font-bold text-slate-100 text-sm sm:text-base leading-snug">
                                    {currentDrill.question}
                                </h3>
                            </div>

                            {/* 선지 목록 */}
                            <div className="space-y-2.5 flex-1 mb-6">
                                {currentDrill.options.map((opt, idx) => {
                                    const isChosen = selectedOption === idx;
                                    const isCorrectOption = currentDrill.correctIndex === idx;

                                    let optionStyle = "bg-slate-900/60 border-slate-700/80 text-slate-300 hover:border-slate-500 hover:bg-slate-800/60";
                                    if (isSubmitted) {
                                        if (isCorrectOption) {
                                            optionStyle = "bg-emerald-950/80 border-emerald-500 text-emerald-200 font-bold shadow-md shadow-emerald-900/20";
                                        } else if (isChosen && !isCorrectOption) {
                                            optionStyle = "bg-rose-950/80 border-rose-500 text-rose-200 font-bold";
                                        } else {
                                            optionStyle = "bg-slate-900/30 border-slate-800 text-slate-500 opacity-60";
                                        }
                                    } else if (isChosen) {
                                        optionStyle = "bg-blue-950/70 border-blue-500 text-blue-100 font-semibold shadow-md shadow-blue-900/20";
                                    }

                                    return (
                                        <button
                                            key={idx}
                                            disabled={isSubmitted}
                                            onClick={() => setSelectedOption(idx)}
                                            className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3 text-xs sm:text-sm leading-relaxed ${optionStyle}`}
                                        >
                                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 font-bold border ${isSubmitted && isCorrectOption ? 'bg-emerald-500 border-emerald-400 text-slate-950' :
                                                    isSubmitted && isChosen ? 'bg-rose-500 border-rose-400 text-white' :
                                                        isChosen ? 'bg-blue-500 border-blue-400 text-white' :
                                                            'border-slate-600 text-slate-400'
                                                }`}>
                                                {idx + 1}
                                            </span>
                                            <span className="flex-1">{opt}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* 제출 버튼 또는 결과 피드백 */}
                            {!isSubmitted ? (
                                <button
                                    onClick={handleSubmitDrill}
                                    disabled={selectedOption === null}
                                    className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 text-sm"
                                >
                                    <span>🎯</span>
                                    <span>정답 제출 및 인지 분석 받기</span>
                                </button>
                            ) : (
                                <div className="space-y-4 animate-in fade-in duration-300">
                                    {/* 정답/오답 헤더 */}
                                    <div className={`p-4 rounded-2xl border flex items-center justify-between ${feedbackResult?.isCorrect
                                            ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                                            : 'bg-rose-950/40 border-rose-500/50 text-rose-300'
                                        }`}>
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl">{feedbackResult?.isCorrect ? '🎉' : '⚠️'}</span>
                                            <div>
                                                <strong className="text-base font-black block">
                                                    {feedbackResult?.isCorrect ? '정답입니다! 완벽한 선지 판별' : '함정에 걸렸습니다! 오답 판정'}
                                                </strong>
                                                <span className="text-xs opacity-80">
                                                    소요 시간: {solveSeconds}초 | 출제 함정: {getTrapLabel(currentDrill.trapType)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 작업기억 / 뇌 피로도 분석 */}
                                    {feedbackResult?.fatigueNote && (
                                        <div className="p-3 bg-slate-900 rounded-xl border border-slate-700/60 text-xs text-slate-300 leading-relaxed">
                                            {feedbackResult.fatigueNote}
                                        </div>
                                    )}

                                    {/* 전략 체화 해설 */}
                                    <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-700 text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                                        <strong className="text-blue-400 block mb-1">💡 평가원 출제 원리 & 오답 소거법:</strong>
                                        {currentDrill.strategyFeedback}
                                    </div>

                                    {/* 하단 추가 액션 */}
                                    <div className="flex flex-col gap-2 pt-2">
                                        {!feedbackResult?.isCorrect && (
                                            <button
                                                onClick={handleGenerateTwin}
                                                disabled={isLoadingDrill}
                                                className="w-full py-3 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-xs sm:text-sm"
                                            >
                                                <span>🔄</span>
                                                <span>같은 함정 원리, 쌍둥이 문제 1개 더 풀기 (즉시 극복)</span>
                                            </button>
                                        )}
                                        <button
                                            onClick={() => loadOrCreateDrill()}
                                            className="w-full py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold rounded-xl transition-all text-xs flex items-center justify-center gap-1.5"
                                        >
                                            <span>✨</span>
                                            <span>다음 추천 문제 풀기</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default KoreanClinicDrillTab;