import React from 'react';
import { TrapType } from '../../../types';
import { KoreanClinicController } from './useKoreanClinic';

interface Props {
    controller: KoreanClinicController;
}

/* ==================== TAB 4: 내 함정 DNA 분석 ==================== */
export const KoreanClinicTrapDnaTab: React.FC<Props> = ({ controller }) => {
    const { trapDna, student, getTrapLabel } = controller;

    return (
        <div className="space-y-6">
            <div className="bg-rose-950/30 border border-rose-800/60 rounded-3xl p-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h3 className="text-base font-black text-white flex items-center gap-2">
                        <span>🧬</span>
                        <span>{student.name} 학생의 국어 함정 DNA (Trap DNA)</span>
                    </h3>
                    <p className="text-xs text-rose-300/80 mt-1">
                        학생이 반복해서 걸려드는 평가원 오답 선지 패턴을 분석하여, 1등급 도약을 가로막는 치명적 약점을 도출합니다.
                    </p>
                </div>

                {trapDna?.mostVulnerableTrap && (
                    <div className="bg-rose-900/80 border border-rose-500 px-4 py-2 rounded-2xl text-xs font-bold text-rose-100 flex items-center gap-2">
                        <span>🚨 최다 오답 함정:</span>
                        <span className="text-amber-300 underline">{getTrapLabel(trapDna.mostVulnerableTrap)}</span>
                    </div>
                )}
            </div>

            {/* 종합 지표 카드 4개 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 text-center">
                    <span className="text-xs text-slate-400 block mb-1">총 풀이 문항</span>
                    <span className="text-2xl font-black text-white">{trapDna?.totalAttempts || 0}</span>
                </div>
                <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 text-center">
                    <span className="text-xs text-slate-400 block mb-1">선지 판별 정답률</span>
                    <span className="text-2xl font-black text-emerald-400">{trapDna?.accuracyRate || 0}%</span>
                </div>
                <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 text-center">
                    <span className="text-xs text-slate-400 block mb-1">평균 판별 소요시간</span>
                    <span className="text-2xl font-black text-blue-400">{trapDna?.avgSolveSec || 0}초</span>
                </div>
                <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 text-center">
                    <span className="text-xs text-slate-400 block mb-1">작업기억 과부하 횟수</span>
                    <span className="text-2xl font-black text-amber-400">{trapDna?.cognitiveOverloadCount || 0}회</span>
                </div>
            </div>

            {/* 함정 유형별 취약도 프로그레스 바 */}
            <div className="bg-slate-800/70 border border-slate-700 rounded-3xl p-6 space-y-4">
                <h4 className="text-sm font-bold text-slate-200">5대 평가원 오답 함정별 취약도 분석</h4>

                {trapDna && (
                    <div className="space-y-4">
                        {(Object.keys(trapDna.trapBreakdown) as TrapType[]).map((trapKey) => {
                            const data = trapDna.trapBreakdown[trapKey];
                            const failRate = data.failRate;
                            const isWorst = trapDna.mostVulnerableTrap === trapKey;

                            return (
                                <div key={trapKey} className="space-y-1.5">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-slate-200 flex items-center gap-1.5">
                                            {isWorst && <span className="text-rose-400 font-black">● [최취약]</span>}
                                            <span>{getTrapLabel(trapKey)}</span>
                                        </span>
                                        <span className="text-slate-400">
                                            시도 {data.attempts}회 중 <strong className="text-rose-400">{data.failedCount}회 오답</strong> (오답률 {failRate}%)
                                        </span>
                                    </div>
                                    <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-700/60">
                                        <div
                                            className={`h-full transition-all duration-500 ${failRate > 50 ? 'bg-gradient-to-r from-amber-500 to-rose-600' :
                                                    failRate > 20 ? 'bg-blue-500' :
                                                        'bg-emerald-500'
                                                }`}
                                            style={{ width: `${Math.max(failRate, data.attempts > 0 ? 5 : 0)}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default KoreanClinicTrapDnaTab;