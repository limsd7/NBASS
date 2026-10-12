import React from 'react';
import { EnglishClinicController } from './useEnglishClinic';

interface Props {
    controller: EnglishClinicController;
}

/* ========================================================
   TAB 1: 1분 킬러 실전 드릴
   ======================================================== */
export const EnglishClinicDrillTab: React.FC<Props> = ({ controller }) => {
    const {
        currentDrill,
        isLoadingDrill,
        selectedOption,
        setSelectedOption,
        isSubmitted,
        feedbackResult,
        solveSeconds,
        initialStrategyTag,
        ENGLISH_TRAP_META,
        loadOrCreateDrill,
        handleSubmitDrill,
        handleCreateTwin
    } = controller;

    return (
        <div className="space-y-6 animate-in fade-in duration-200">
            {/* 상단 컨트롤 배너 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">집중 공략 전략:</span>
                    <span className="text-xs font-black text-amber-300 bg-amber-950/60 border border-amber-800/50 px-3 py-1 rounded-xl">
                        {initialStrategyTag}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 font-mono text-xs">
                        <span>⏱️</span>
                        <span className="text-slate-400">풀이 시간:</span>
                        <span className="text-amber-400 font-bold">{solveSeconds}초</span>
                    </div>
                    <button
                        onClick={() => loadOrCreateDrill(true)}
                        disabled={isLoadingDrill}
                        className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-amber-600/20 flex items-center gap-1.5 cursor-pointer"
                    >
                        <span>🔄</span>
                        <span>{isLoadingDrill ? '새 문제 생성 중...' : '새 킬러 문제 생성'}</span>
                    </button>
                </div>
            </div>

            {/* 메인 문제 카드 */}
            {isLoadingDrill ? (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-16 text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto"></div>
                    <p className="text-sm font-bold text-slate-300">Gemini 3.8 Flash가 학생 맞춤형 수능 영어 킬러 문항을 정밀 설계 중입니다...</p>
                    <p className="text-xs text-slate-500">평가원 5대 매력적 오답 함정 원리 및 패러프레이징 반영 중</p>
                </div>
            ) : currentDrill ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* 좌측: 영문 지문 및 발문 */}
                    <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-xl">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                                <span className="text-xs font-black text-amber-400 flex items-center gap-1">
                                    <span>🏷️</span> 유형: {currentDrill.topicKeyword}
                                </span>
                                <span className="text-[11px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
                                    목표 1등급 타겟 3점 문항
                                </span>
                            </div>

                            {/* 영문 지문 본문 */}
                            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800/80 text-sm leading-relaxed text-slate-200 font-serif whitespace-pre-wrap selection:bg-amber-500/30">
                                {currentDrill.passage}
                            </div>

                            {/* 발문 */}
                            <div className="p-3.5 bg-amber-950/20 border border-amber-500/30 rounded-2xl">
                                <h2 className="text-sm font-black text-amber-200 flex items-center gap-2">
                                    <span>Q.</span> {currentDrill.question}
                                </h2>
                            </div>

                            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-400 flex items-center gap-2">
                                <span>💡</span>
                                <span>
                                    <strong>독해 팁:</strong> 지문에 등장한 단어가 그대로 쓰인 선지는 <span className="text-amber-400 font-bold">[단어 일치 왜곡형 함정]</span>일 가능성이 높습니다. 대의를 재진술한 패러프레이징 선지를 찾으세요.
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* 우측: 선지 선택 및 제출 */}
                    <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-xl space-y-4">
                        <div>
                            <h3 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">
                                선지 선택 (정답을 고르세요)
                            </h3>
                            <div className="space-y-2.5">
                                {currentDrill.options.map((opt, i) => {
                                    const isChosen = selectedOption === i;
                                    const isCorrectOption = isSubmitted && i === currentDrill.correctIndex;
                                    const isWrongOption = isSubmitted && isChosen && !isCorrectOption;

                                    return (
                                        <button
                                            key={i}
                                            disabled={isSubmitted}
                                            onClick={() => setSelectedOption(i)}
                                            className={`w-full text-left p-3.5 rounded-2xl border text-xs sm:text-sm font-medium transition-all flex items-start gap-3 cursor-pointer ${isCorrectOption
                                                    ? 'bg-emerald-950/70 border-emerald-500 text-emerald-200 shadow-md shadow-emerald-500/20 font-bold'
                                                    : isWrongOption
                                                        ? 'bg-rose-950/70 border-rose-500 text-rose-200 line-through'
                                                        : isChosen
                                                            ? 'bg-amber-950/60 border-amber-500 text-white font-bold shadow-md shadow-amber-500/20'
                                                            : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700'
                                                }`}
                                        >
                                            <span className={`w-6 h-6 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${isCorrectOption
                                                    ? 'bg-emerald-500 text-slate-950'
                                                    : isWrongOption
                                                        ? 'bg-rose-500 text-white'
                                                        : isChosen
                                                            ? 'bg-amber-500 text-slate-950'
                                                            : 'bg-slate-800 text-slate-400'
                                                }`}>
                                                {i + 1}
                                            </span>
                                            <span className="leading-snug pt-0.5">{opt}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {!isSubmitted ? (
                            <button
                                onClick={handleSubmitDrill}
                                disabled={selectedOption === null}
                                className="w-full py-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-40 text-white font-black rounded-2xl text-sm transition-all shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                            >
                                <span>✓</span>
                                <span>정답 제출 및 논리 간파 분석</span>
                            </button>
                        ) : (
                            <div className="space-y-3 animate-in fade-in duration-300">
                                <div className={`p-4 rounded-2xl border ${feedbackResult?.isCorrect
                                        ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                                        : 'bg-rose-950/60 border-rose-500/50 text-rose-200'
                                    }`}>
                                    <div className="flex items-center gap-2 font-black text-sm mb-1">
                                        <span>{feedbackResult?.isCorrect ? '🎉 킬러 문항 정복 성공!' : '⚠️ 함정 선지에 낚였습니다!'}</span>
                                    </div>
                                    <p className="text-xs text-slate-300 leading-relaxed font-mono">
                                        {feedbackResult?.fatigueNote}
                                    </p>
                                </div>

                                {/* 피드백 박스 */}
                                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-2">
                                    <span className="font-bold text-amber-400 block">💡 킬러 함정 간파 해설:</span>
                                    <p className="whitespace-pre-wrap">{currentDrill.strategyFeedback}</p>
                                    {currentDrill.trapType && (
                                        <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2 text-[11px] text-slate-400">
                                            <span>출제 함정:</span>
                                            <span className="font-bold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/60">
                                                {ENGLISH_TRAP_META[currentDrill.trapType]?.label || currentDrill.trapType}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* 쌍둥이 문제 생성 버튼 */}
                                <button
                                    onClick={handleCreateTwin}
                                    className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold rounded-2xl text-xs transition-all shadow-md shadow-orange-600/20 flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <span>🔄</span>
                                    <span>[동일 함정 원리] 유사 킬러 1개 더 풀기</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default EnglishClinicDrillTab;