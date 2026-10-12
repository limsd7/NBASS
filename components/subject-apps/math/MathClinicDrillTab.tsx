import React from 'react';
import { MathClinicController } from './useMathClinic';

interface Props {
    controller: MathClinicController;
}

/* ==================== TAB 1: 1분 준킬러 실전 드릴 ==================== */
export const MathClinicDrillTab: React.FC<Props> = ({ controller }) => {
    const {
        currentDrill,
        isLoadingDrill,
        selectedOption,
        setSelectedOption,
        isSubmitted,
        feedbackResult,
        solveSeconds,
        initialStrategyTag,
        loadOrCreateDrill,
        handleSubmitAnswer,
        handleGenerateTwin
    } = controller;

    return (
        <div className="space-y-6">
            {/* 상단 액션 바 */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400">집중 공략 전략:</span>
                    <span className="bg-purple-900/40 text-purple-300 text-xs px-2.5 py-1 rounded-lg border border-purple-700/60 font-medium">
                        {initialStrategyTag}
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    {/* 실시간 타이머 */}
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 rounded-xl text-xs font-bold text-amber-400 border border-slate-700">
                        <span>⏱️</span>
                        <span>풀이 시간: {solveSeconds}초</span>
                    </div>

                    <button
                        onClick={loadOrCreateDrill}
                        disabled={isLoadingDrill}
                        className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                        <span>🔄</span>
                        <span>{isLoadingDrill ? 'AI 출제 중...' : '새 준킬러 문제 생성'}</span>
                    </button>
                </div>
            </div>

            {isLoadingDrill ? (
                <div className="bg-slate-950/40 rounded-3xl p-16 border border-slate-800 text-center space-y-4">
                    <div className="animate-spin text-4xl inline-block">📐</div>
                    <h3 className="text-lg font-bold text-white">Gemini 3.8 Flash가 학생 맞춤 수능 4점 준킬러를 설계 중입니다...</h3>
                    <p className="text-xs text-slate-400">발문 조건 [가], [나] 분해 및 계산 실수 트랩 DNA를 주입하고 있습니다. (약 3~5초)</p>
                </div>
            ) : currentDrill ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* 좌측: 발문 및 조건 분해 지문 영역 (7 cols) */}
                    <div className="lg:col-span-7 bg-slate-950/80 rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                                <span>🏷️</span>
                                <span>유형: {currentDrill.topicKeyword}</span>
                            </span>
                            <span className="text-[11px] font-medium bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                                목표 {currentDrill.targetGrade}등급 타겟 4점 문항
                            </span>
                        </div>

                        {/* 발문 본문 */}
                        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 font-mono text-sm leading-relaxed text-slate-200 whitespace-pre-wrap">
                            {currentDrill.passage}
                        </div>

                        {/* 질문 */}
                        <div className="p-4 bg-purple-950/30 border border-purple-800/40 rounded-2xl">
                            <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                                <span className="text-purple-400">Q.</span>
                                <span>{currentDrill.question}</span>
                            </h3>
                        </div>

                        {/* 세로 2단 줄맞춤 연습 가이드 팁 */}
                        <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800/80 text-xs text-slate-400 flex items-center gap-2">
                            <span className="text-base shrink-0">💡</span>
                            <span><strong>두뇌 팁:</strong> 연습장 여백을 세로 2단으로 나누어, 좌측단에는 [수식 정리/도함수], 우측단에는 [줄맞춤 대입 연산]을 전개하세요.</span>
                        </div>
                    </div>

                    {/* 우측: 4지 선지 선택 & 채점 피드백 (5 cols) */}
                    <div className="lg:col-span-5 bg-slate-950/80 rounded-3xl p-6 sm:p-8 border border-slate-800 flex flex-col justify-between space-y-6">
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                선지 선택 (정답을 고르세요)
                            </h4>

                            <div className="space-y-2.5">
                                {currentDrill.options.map((opt, idx) => {
                                    const isSelected = selectedOption === idx;
                                    const isCorrectOption = idx === currentDrill.correctIndex;
                                    let optionStyle = 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800';

                                    if (isSubmitted) {
                                        if (isCorrectOption) {
                                            optionStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-300 font-bold';
                                        } else if (isSelected && !isCorrectOption) {
                                            optionStyle = 'bg-rose-950/60 border-rose-500 text-rose-300 line-through';
                                        } else {
                                            optionStyle = 'bg-slate-900/40 border-slate-800/40 text-slate-500';
                                        }
                                    } else if (isSelected) {
                                        optionStyle = 'bg-purple-600/30 border-purple-500 text-white font-bold ring-2 ring-purple-500/50';
                                    }

                                    return (
                                        <button
                                            key={idx}
                                            disabled={isSubmitted}
                                            onClick={() => setSelectedOption(idx)}
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

                        {/* 정답 제출 버튼 */}
                        {!isSubmitted ? (
                            <button
                                onClick={handleSubmitAnswer}
                                disabled={selectedOption === null}
                                className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 text-white font-bold rounded-2xl text-sm transition-all shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <span>✓</span>
                                <span>정답 제출 및 인지 과부하 분석</span>
                            </button>
                        ) : (
                            /* 채점 결과 및 쌍둥이 문제 생성 액션 */
                            <div className="space-y-4 animate-in fade-in duration-200">
                                <div className={`p-4 rounded-2xl border ${feedbackResult?.isCorrect
                                        ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300'
                                        : 'bg-rose-950/40 border-rose-500/60 text-rose-300'
                                    }`}>
                                    <div className="flex items-center gap-2 font-black text-sm mb-1">
                                        <span>{feedbackResult?.isCorrect ? '🎉 정답입니다!' : '❌ 오답입니다.'}</span>
                                        <span className="text-xs font-normal">({solveSeconds}초 소요)</span>
                                    </div>
                                    <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                                        {currentDrill.strategyFeedback}
                                    </p>
                                    {feedbackResult?.fatigueNote && (
                                        <div className="mt-2.5 pt-2 border-t border-slate-800 text-[11px] text-amber-300/90 font-medium">
                                            {feedbackResult.fatigueNote}
                                        </div>
                                    )}
                                </div>

                                {/* 액션 버튼들 */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleGenerateTwin}
                                        className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-xs transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                                    >
                                        <span>🔄</span>
                                        <span>쌍둥이 유사 문제 1개 더</span>
                                    </button>
                                    <button
                                        onClick={loadOrCreateDrill}
                                        className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-2xl text-xs transition-all border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
                                    >
                                        <span>➔</span>
                                        <span>다음 준킬러 문제</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default MathClinicDrillTab;