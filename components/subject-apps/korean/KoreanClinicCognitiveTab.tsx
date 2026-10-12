import React from 'react';
import { KoreanClinicController } from './useKoreanClinic';

interface Props {
    controller: KoreanClinicController;
}

/* ==================== TAB 2: 30초 인지 메모 훈련 (블라인드) ==================== */
export const KoreanClinicCognitiveTab: React.FC<Props> = ({ controller }) => {
    const {
        cognitiveDrill,
        memoryInputs,
        setMemoryInputs,
        cognitiveSecondsLeft,
        isPassageBlinded,
        setIsPassageBlinded,
        cognitiveSelectedOption,
        setCognitiveSelectedOption,
        cognitiveSubmitted,
        loadOrCreateCognitiveDrill,
        handleCognitiveSubmit
    } = controller;

    return (
        <div className="space-y-6">
            <div className="bg-purple-950/40 border border-purple-800/60 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-black px-2.5 py-1 rounded-lg">
                            두뇌·인지 훈련
                        </span>
                        <span className="font-bold text-purple-100 text-sm sm:text-base">
                            여백에 핵심 키워드 3개 메모하며 시각적 주의 집중 (블라인드 리콜)
                        </span>
                    </div>
                    <p className="text-xs text-purple-300/80 mt-1">
                        지문을 보며 30초 안에 키워드 3개를 적으세요. 30초 후 지문이 가려지며 자신의 메모만 보고 퀴즈를 풉니다!
                    </p>
                </div>

                {/* 30초 카운트다운 게이지 */}
                <div className={`px-4 py-2 rounded-xl border text-sm font-mono font-bold flex items-center gap-2 ${isPassageBlinded ? 'bg-slate-800 border-slate-700 text-slate-400' :
                        cognitiveSecondsLeft <= 10 ? 'bg-rose-950 border-rose-500 text-rose-300 animate-pulse' :
                            'bg-purple-900/60 border-purple-500 text-purple-200'
                    }`}>
                    <span>⏳</span>
                    <span>남은 시간: {cognitiveSecondsLeft}초</span>
                </div>
            </div>

            {cognitiveDrill && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* 좌측: 지문 (블라인드 기능 탑재) */}
                    <div className="lg:col-span-7 bg-slate-950/70 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col relative overflow-hidden">
                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                            <span className="text-xs font-bold text-slate-400">제재: {cognitiveDrill.topicKeyword}</span>
                            <button
                                onClick={() => setIsPassageBlinded(!isPassageBlinded)}
                                className="text-xs text-purple-400 hover:text-purple-300 underline"
                            >
                                {isPassageBlinded ? '👁️ 지문 다시 보기' : '🙈 지금 바로 가리기 (암기 완료)'}
                            </button>
                        </div>

                        {/* 지문 텍스트 (블라인드 처리 시 흐림/가림) */}
                        <div className={`transition-all duration-500 relative font-serif text-sm sm:text-base leading-relaxed ${isPassageBlinded ? 'filter blur-md select-none opacity-20 pointer-events-none' : 'text-slate-200'
                            }`}>
                            {cognitiveDrill.passage}
                        </div>

                        {isPassageBlinded && (
                            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 animate-in fade-in">
                                <span className="text-4xl mb-2">🔒</span>
                                <h4 className="text-base font-bold text-white mb-1">지문이 블라인드 처리되었습니다!</h4>
                                <p className="text-xs text-slate-400 max-w-sm">
                                    이제 본인이 우측에 적어둔 <strong className="text-purple-300">3개 핵심 키워드</strong>만 보고 아래 퀴즈를 해결해보세요.
                                </p>
                                <button
                                    onClick={() => setIsPassageBlinded(false)}
                                    className="mt-4 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-slate-300"
                                >
                                    지문 잠깐 확인하기
                                </button>
                            </div>
                        )}
                    </div>

                    {/* 우측: 3키워드 메모 슬롯 + 블라인드 퀴즈 */}
                    <div className="lg:col-span-5 flex flex-col space-y-4">
                        {/* 키워드 3개 메모 캔버스 */}
                        <div className="bg-purple-950/30 border border-purple-800/60 rounded-3xl p-5">
                            <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                                <span>📝 여백 메모 캔버스 (핵심 명제 3개)</span>
                                <span className="text-[11px] text-purple-400 font-normal">타이핑 또는 지문 요약</span>
                            </h4>

                            <div className="space-y-2 mb-3">
                                {[0, 1, 2].map((idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <span className="w-5 h-5 rounded-full bg-purple-900/60 text-purple-300 text-xs font-bold flex items-center justify-center border border-purple-700/60">
                                            {idx + 1}
                                        </span>
                                        <input
                                            type="text"
                                            placeholder={idx === 0 ? '예: 교차상핵(SCN)' : idx === 1 ? '예: 빛 감지 / 시신경' : '예: 멜라토닌 분비 억제'}
                                            value={memoryInputs[idx]}
                                            onChange={(e) => {
                                                const next = [...memoryInputs];
                                                next[idx] = e.target.value;
                                                setMemoryInputs(next);
                                            }}
                                            className="flex-1 bg-slate-900/90 border border-purple-700/50 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-400"
                                        />
                                    </div>
                                ))}
                            </div>

                            {!isPassageBlinded && (
                                <button
                                    onClick={() => setIsPassageBlinded(true)}
                                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs transition-all shadow-md"
                                >
                                    ✅ 메모 완료! 지문 가리고 실전 퀴즈 풀기
                                </button>
                            )}
                        </div>

                        {/* 블라인드 확인 퀴즈 */}
                        <div className="bg-slate-800/70 border border-slate-700 rounded-3xl p-5 flex flex-col flex-1">
                            <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider block mb-1">
                                Recall Test (메모만 보고 풀기)
                            </span>
                            <h4 className="font-bold text-slate-100 text-xs sm:text-sm leading-snug mb-4">
                                {cognitiveDrill.question}
                            </h4>

                            <div className="space-y-2 mb-4 flex-1">
                                {cognitiveDrill.options.map((opt, idx) => {
                                    const isChosen = cognitiveSelectedOption === idx;
                                    const isCorrect = cognitiveDrill.correctIndex === idx;

                                    let style = "bg-slate-900/80 border-slate-700 text-slate-300 hover:border-slate-500";
                                    if (cognitiveSubmitted) {
                                        if (isCorrect) style = "bg-emerald-950 border-emerald-500 text-emerald-200 font-bold";
                                        else if (isChosen) style = "bg-rose-950 border-rose-500 text-rose-200 font-bold";
                                        else style = "opacity-50 border-slate-800 text-slate-500";
                                    } else if (isChosen) {
                                        style = "bg-purple-950 border-purple-500 text-purple-200 font-bold";
                                    }

                                    return (
                                        <button
                                            key={idx}
                                            disabled={cognitiveSubmitted}
                                            onClick={() => setCognitiveSelectedOption(idx)}
                                            className={`w-full text-left p-3 rounded-xl border text-xs leading-relaxed transition-all flex items-start gap-2.5 ${style}`}
                                        >
                                            <span className="w-4 h-4 rounded-full border border-slate-500 flex items-center justify-center text-[10px] shrink-0">
                                                {idx + 1}
                                            </span>
                                            <span>{opt}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {!cognitiveSubmitted ? (
                                <button
                                    onClick={handleCognitiveSubmit}
                                    disabled={cognitiveSelectedOption === null}
                                    className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold rounded-xl text-xs transition-all shadow-md"
                                >
                                    정답 확인하기
                                </button>
                            ) : (
                                <div className="space-y-3 animate-in fade-in">
                                    <div className="p-3 bg-slate-900 rounded-xl border border-purple-500/40 text-xs text-purple-200 leading-relaxed whitespace-pre-line">
                                        {cognitiveDrill.strategyFeedback}
                                    </div>
                                    <button
                                        onClick={loadOrCreateCognitiveDrill}
                                        className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-xs font-bold text-slate-200 rounded-xl transition-all"
                                    >
                                        ✨ 다른 인지 훈련 지문으로 연습하기
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KoreanClinicCognitiveTab;