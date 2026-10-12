import React from 'react';
import { MathClinicController } from './useMathClinic';

interface Props {
    controller: MathClinicController;
}

/* ==================== TAB 3: 수학 AI 문제은행 저장소 ==================== */
export const MathClinicBankTab: React.FC<Props> = ({ controller }) => {
    const {
        bankList,
        bankFilter,
        setBankFilter,
        isLoadingBank,
        filteredBankList,
        getTrapLabel,
        handleSelectBankQuestion,
        handleDeleteQuestion
    } = controller;

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                        <span>📚</span>
                        <span>수학 AI 문제은행 저장소 (영구 보관 및 중복 제거)</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                        학생이 풀이하거나 AI가 출제한 수능 4점 준킬러 문제들이 중복 없이 누적 보관됩니다.
                    </p>
                </div>

                {/* 필터 탭 */}
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                    {(['all', 'unsolved', 'failed', 'correct'] as const).map(filter => {
                        const labels = { all: '전체', unsolved: '미해결', failed: '오답(취약)', correct: '정답' };
                        return (
                            <button
                                key={filter}
                                onClick={() => setBankFilter(filter)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${bankFilter === filter
                                        ? 'bg-purple-600 text-white'
                                        : 'text-slate-400 hover:text-white'
                                    }`}
                            >
                                {labels[filter]}
                            </button>
                        );
                    })}
                </div>
            </div>

            {isLoadingBank ? (
                <div className="text-center py-12 text-slate-400 text-xs">문제은행 로딩 중...</div>
            ) : filteredBankList.length === 0 ? (
                <div className="text-center py-16 bg-slate-950/40 rounded-3xl border border-slate-800 space-y-3">
                    <span className="text-3xl block">📭</span>
                    <p className="text-sm font-bold text-slate-300">저장된 문제가 없습니다.</p>
                    <p className="text-xs text-slate-500">1분 실전 드릴 또는 30초 줄맞춤 훈련을 진행하면 자동으로 문제은행에 영구 저장됩니다.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredBankList.map((q) => (
                        <div
                            key={q.id}
                            onClick={() => handleSelectBankQuestion(q)}
                            className="bg-slate-950/70 hover:bg-slate-950 border border-slate-800 hover:border-purple-500/60 rounded-2xl p-5 transition-all cursor-pointer flex flex-col justify-between space-y-4 group shadow-sm"
                        >
                            <div>
                                <div className="flex items-center justify-between gap-2 mb-2">
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-900/40 text-purple-300 border border-purple-800">
                                        {q.strategyType === 'grade_strategy' ? '🎯 1분 실전' : '🧠 줄맞춤 인지'}
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                        {q.isSolved ? (
                                            q.isCorrect ? (
                                                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">정답 ✓</span>
                                            ) : (
                                                <span className="text-[10px] font-bold text-rose-400 bg-rose-950/60 border border-rose-800 px-2 py-0.5 rounded">오답 ✕</span>
                                            )
                                        ) : (
                                            <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 border border-amber-800 px-2 py-0.5 rounded">미해결</span>
                                        )}
                                        <button
                                            onClick={(e) => handleDeleteQuestion(q.id, e)}
                                            title="문제 삭제"
                                            className="text-slate-600 hover:text-rose-400 text-xs p-1"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>

                                <h4 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1">
                                    {q.topicKeyword || q.question}
                                </h4>

                                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1.5 font-mono leading-relaxed">
                                    {q.passage}
                                </p>
                            </div>

                            <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-500">
                                <span>함정 유형: {getTrapLabel(q.trapType)}</span>
                                <span className="text-purple-400 font-bold group-hover:underline">풀어보기 ➔</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MathClinicBankTab;