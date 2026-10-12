import React from 'react';
import DatabaseService from '../../../services/database';
import { KoreanClinicController } from './useKoreanClinic';

interface Props {
    controller: KoreanClinicController;
}

/* ==================== TAB 3: 문제은행 저장소 ==================== */
export const KoreanClinicBankTab: React.FC<Props> = ({ controller }) => {
    const {
        bankList,
        bankFilter,
        setBankFilter,
        isLoadingBank,
        filteredBankList,
        getTrapLabel,
        setActiveTab,
        loadBankQuestions,
        loadOrCreateDrill,
        handleSelectFromBank
    } = controller;

    return (
        <div className="space-y-6">
            {/* 상단 통계 & 필터 */}
            <div className="bg-slate-800/70 border border-slate-700 rounded-3xl p-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h3 className="text-base font-black text-white flex items-center gap-2">
                        <span>📚</span>
                        <span>국어 AI 문제은행 저장소</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                        AI가 생성한 모든 지문과 문제가 영구 보관되며, 동일 지문은 중복 저장되지 않습니다.
                    </p>
                </div>

                {/* 필터 탭 */}
                <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-2xl border border-slate-700 text-xs">
                    <button
                        onClick={() => setBankFilter('all')}
                        className={`px-3 py-1.5 rounded-xl font-bold transition-all ${bankFilter === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                            }`}
                    >
                        전체 ({bankList.length})
                    </button>
                    <button
                        onClick={() => setBankFilter('unsolved')}
                        className={`px-3 py-1.5 rounded-xl font-bold transition-all ${bankFilter === 'unsolved' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
                            }`}
                    >
                        미풀이 ({bankList.filter(q => !q.isSolved).length})
                    </button>
                    <button
                        onClick={() => setBankFilter('failed')}
                        className={`px-3 py-1.5 rounded-xl font-bold transition-all ${bankFilter === 'failed' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-slate-200'
                            }`}
                    >
                        오답 복습 ({bankList.filter(q => q.isSolved && q.isCorrect === false).length})
                    </button>
                    <button
                        onClick={() => setBankFilter('correct')}
                        className={`px-3 py-1.5 rounded-xl font-bold transition-all ${bankFilter === 'correct' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
                            }`}
                    >
                        정답 완료 ({bankList.filter(q => q.isSolved && q.isCorrect === true).length})
                    </button>
                </div>
            </div>

            {/* 문제 카드 리스트 */}
            {isLoadingBank ? (
                <div className="py-20 text-center text-slate-400 animate-pulse">문제은행 목록을 불러오는 중...</div>
            ) : filteredBankList.length === 0 ? (
                <div className="py-20 text-center bg-slate-950/40 border border-slate-800 rounded-3xl">
                    <span className="text-3xl block mb-2">📭</span>
                    <p className="text-sm font-semibold text-slate-300">저장된 문제가 없습니다.</p>
                    <button
                        onClick={() => {
                            setActiveTab('drill');
                            loadOrCreateDrill();
                        }}
                        className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white rounded-xl"
                    >
                        첫 문제 AI 즉시 출제하기
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredBankList.map((q) => (
                        <div
                            key={q.id}
                            className="bg-slate-800/80 border border-slate-700/80 hover:border-slate-500 rounded-2xl p-5 flex flex-col justify-between transition-all hover:shadow-xl"
                        >
                            <div>
                                <div className="flex items-center justify-between gap-2 mb-2">
                                    <span className="text-[11px] font-bold text-blue-400 bg-blue-950/80 border border-blue-800/80 px-2 py-0.5 rounded">
                                        {q.strategyType === 'grade_strategy' ? '등급 전략' : '인지 훈련'}
                                    </span>
                                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${!q.isSolved ? 'bg-amber-900/60 text-amber-300 border border-amber-700' :
                                            q.isCorrect ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700' :
                                                'bg-rose-900/60 text-rose-300 border border-rose-700'
                                        }`}>
                                        {!q.isSolved ? '미풀이' : q.isCorrect ? '정답' : '오답'}
                                    </span>
                                </div>

                                <h4 className="font-bold text-slate-100 text-sm line-clamp-1 mb-1">
                                    {q.topicKeyword || '국어 고난도 추론'}
                                </h4>
                                <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                                    {q.question}
                                </p>

                                <div className="text-[11px] text-slate-500 space-y-1 mb-4">
                                    <div>함정 유형: <span className="text-slate-300">{getTrapLabel(q.trapType)}</span></div>
                                    {q.solveDurationSec && <div>풀이 시간: <span className="text-slate-300">{q.solveDurationSec}초</span></div>}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-3 border-t border-slate-700/60">
                                <button
                                    onClick={() => handleSelectFromBank(q)}
                                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all"
                                >
                                    {q.isSolved ? '다시 풀기' : '문제 풀기'}
                                </button>
                                <button
                                    onClick={async () => {
                                        if (confirm('이 문제를 문제은행에서 삭제하시겠습니까?')) {
                                            await DatabaseService.deleteBankQuestion(q.id);
                                            loadBankQuestions();
                                        }
                                    }}
                                    className="px-2.5 py-2 bg-slate-700 hover:bg-rose-900 text-slate-400 hover:text-rose-200 text-xs rounded-xl transition-all"
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

export default KoreanClinicBankTab;