import React from 'react';
import { EnglishClinicController } from './useEnglishClinic';

interface Props {
    controller: EnglishClinicController;
}

/* ========================================================
   TAB 2: 30초 인지 시그널 스캐너
   ======================================================== */
export const EnglishClinicCognitiveTab: React.FC<Props> = ({ controller }) => {
    const {
        cognitiveDrill,
        keyword1,
        setKeyword1,
        keyword2,
        setKeyword2,
        keyword3,
        setKeyword3,
        cognitiveSecondsLeft,
        isPassageBlinded,
        cognitiveSelectedOption,
        setCognitiveSelectedOption,
        cognitiveSubmitted,
        loadOrCreateCognitiveDrill,
        handleCognitiveSubmit
    } = controller;

    return (
        <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>🧠</span> 30초 인지 시그널 스캐너 (지시어·연결사 단서 포착)
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                        However, In contrast, Such, This 등 논리적 전환점 3개를 30초 안에 스캔하여 작업기억에 고정합니다.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono">
                        <span>⏳</span>
                        <span className={cognitiveSecondsLeft <= 5 ? 'text-rose-400 font-black animate-pulse' : 'text-amber-400 font-bold'}>
                            {cognitiveSecondsLeft}초
                        </span>
                    </div>
                    <button
                        onClick={loadOrCreateCognitiveDrill}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
                    >
                        새 시그널 훈련 문제
                    </button>
                </div>
            </div>

            {cognitiveDrill && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* 좌측: 30초 후 블라인드되는 지문 + 키워드 3개 입력 */}
                    <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                                <span>👁️</span> 30초 집중 스캔 & 시그널 포착
                            </span>
                            <span className="text-[11px] font-bold text-amber-400">
                                {isPassageBlinded ? '🔒 블라인드 모드 (기억으로 선지 판별)' : '눈으로 핵심 연결사·지시어를 스캔하세요!'}
                            </span>
                        </div>

                        {/* 지문 본문 (30초 후 블라인드) */}
                        <div className="relative">
                            <div className={`bg-slate-950 p-5 rounded-2xl border border-slate-800/80 text-sm leading-relaxed text-slate-200 font-serif whitespace-pre-wrap transition-all duration-300 ${isPassageBlinded ? 'blur-md select-none opacity-20' : ''
                                }`}>
                                {cognitiveDrill.passage}
                            </div>
                            {isPassageBlinded && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                                    <span className="text-3xl mb-2">🧠</span>
                                    <h4 className="text-sm font-black text-amber-300 mb-1">30초 스캔 시간 종료 (지문 블라인드)</h4>
                                    <p className="text-xs text-slate-400 max-w-sm">
                                        아래 메모한 핵심 시그널 3개를 바탕으로 우측의 문제를 풀어보세요.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* 핵심 시그널 3개 메모 입력 */}
                        <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
                            <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                                <span>✍️</span> 30초 논리 축 & 시그널 메모 (Binary Opposition)
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <input
                                    type="text"
                                    placeholder="시그널 1 (예: Tech determinism)"
                                    value={keyword1}
                                    onChange={(e) => setKeyword1(e.target.value)}
                                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                                />
                                <input
                                    type="text"
                                    placeholder="시그널 2 (예: However / Human agency)"
                                    value={keyword2}
                                    onChange={(e) => setKeyword2(e.target.value)}
                                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                                />
                                <input
                                    type="text"
                                    placeholder="시그널 3 (예: Social choices)"
                                    value={keyword3}
                                    onChange={(e) => setKeyword3(e.target.value)}
                                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 우측: 시그널 검증 문제 */}
                    <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-4">
                        <div>
                            <h3 className="text-xs font-bold text-amber-400 mb-2">Q. 시그널 검증 문제</h3>
                            <p className="text-sm font-bold text-white mb-4 leading-snug">{cognitiveDrill.question}</p>
                            <div className="space-y-2.5">
                                {cognitiveDrill.options.map((opt, i) => {
                                    const isChosen = cognitiveSelectedOption === i;
                                    const isCorrect = cognitiveSubmitted && i === cognitiveDrill.correctIndex;
                                    const isWrong = cognitiveSubmitted && isChosen && !isCorrect;

                                    return (
                                        <button
                                            key={i}
                                            disabled={cognitiveSubmitted}
                                            onClick={() => setCognitiveSelectedOption(i)}
                                            className={`w-full text-left p-3.5 rounded-2xl border text-xs sm:text-sm transition-all flex items-start gap-2.5 cursor-pointer ${isCorrect
                                                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 font-bold'
                                                    : isWrong
                                                        ? 'bg-rose-950/80 border-rose-500 text-rose-200 line-through'
                                                        : isChosen
                                                            ? 'bg-amber-950/60 border-amber-500 text-white font-bold'
                                                            : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                                                }`}
                                        >
                                            <span className="w-5 h-5 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-bold shrink-0">
                                                {i + 1}
                                            </span>
                                            <span className="leading-snug">{opt}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {!cognitiveSubmitted ? (
                            <button
                                onClick={handleCognitiveSubmit}
                                disabled={cognitiveSelectedOption === null}
                                className="w-full py-3.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white font-bold rounded-2xl text-xs transition-all shadow-md shadow-amber-600/30 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <span>🧠</span>
                                <span>시그널 정답 검증 완료</span>
                            </button>
                        ) : (
                            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-2">
                                <span className="font-bold text-emerald-400 block">🎯 30초 시그널 메모 훈련 성과:</span>
                                <p>{cognitiveDrill.strategyFeedback}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default EnglishClinicCognitiveTab;