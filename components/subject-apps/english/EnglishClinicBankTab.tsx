import React from 'react';
import { EnglishClinicController } from './useEnglishClinic';

interface Props {
    controller: EnglishClinicController;
}

/* ========================================================
   TAB 3: 영어 AI 문제은행 저장소
   ======================================================== */
export const EnglishClinicBankTab: React.FC<Props> = ({ controller }) => {
    const {
        bankList,
        bankFilter,
        setBankFilter,
        isLoadingBank,
        setActiveTab,
        handleReSolveFromBank,
        handleDeleteFromBank
    } = controller;

    return (
        <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                        <span>📚</span> 나만의 수능 영어 킬러 AI 문제은행
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                        Gemini 3.8 Flash가 학생 맞춤형으로 생성한 모든 킬러 문항이 중복 없이 자동 저장되어 언제든 다시 풀 수 있습니다.
                    </p>
                </div>

                {/* 필터 탭 */}
                <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                    {(['all', 'unsolved', 'failed', 'correct'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setBankFilter(f)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${bankFilter === f
                                    ? 'bg-amber-600 text-white shadow-xs'
                                    : 'text-slate-400 hover:text-slate-200'
                                }`}
                        >
                            {f === 'all' && '전체'}
                            {f === 'unsolved' && '미해결'}
                            {f === 'failed' && '오답'}
                            {f === 'correct' && '해결'}
                        </button>
                    ))}
                </div>
            </div>

            {/* 문제 리스트 */}
            {isLoadingBank ? (
                <div className="py-12 text-center text-xs text-slate-500">문제은행 불러오는 중...</div>
            ) : bankList.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
                    <span className="text-4xl block">📭</span>
                    <h3 className="text-sm font-bold text-slate-300">저장된 문제가 아직 없습니다.</h3>
                    <p className="text-xs text-slate-500">[1분 킬러 실전 드릴] 탭에서 문제를 생성하여 풀어보세요.</p>
                    <button
                        onClick={() => setActiveTab('drill')}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                    >
                        실전 드릴 풀러 가기 ➔
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {bankList
                        .filter(q => {
                            if (bankFilter === 'unsolved') return !q.isSolved;
                            if (bankFilter === 'failed') return q.isSolved && !q.isCorrect;
                            if (bankFilter === 'correct') return q.isSolved && q.isCorrect;
                            return true;
                        })
                        .map(q => (
                            <div
                                key={q.id}
                                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                            >
                                <div className="space-y-2 flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${q.isSolved
                                                ? q.isCorrect
                                                    ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30'
                                                    : 'bg-rose-950/60 text-rose-400 border-rose-500/30'
                                                : 'bg-amber-950/60 text-amber-400 border-amber-500/30'
                                            }`}>
                                            {q.isSolved ? (q.isCorrect ? '✓ 정답 통과' : '✕ 오답 복습 필요') : '⏳ 미해결'}
                                        </span>
                                        <span className="text-xs font-bold text-white truncate">{q.topicKeyword}</span>
                                        <span className="text-[10px] text-slate-500">
                                            {q.createdAt?.slice(0, 10)}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400 line-clamp-2 font-serif">
                                        {q.passage}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        onClick={() => handleReSolveFromBank(q)}
                                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                                    >
                                        다시 풀기
                                    </button>
                                    <button
                                        onClick={() => handleDeleteFromBank(q.id)}
                                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                                        title="삭제"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
};

export default EnglishClinicBankTab;