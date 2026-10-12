import React from 'react';
import { TrapType } from '../../../types';
import { EnglishClinicController } from './useEnglishClinic';

interface Props {
    controller: EnglishClinicController;
}

/* ========================================================
   TAB 4: 내 매력적 오답 & 함정 DNA
   ======================================================== */
export const EnglishClinicTrapDnaTab: React.FC<Props> = ({ controller }) => {
    const { trapDna, ENGLISH_TRAP_META } = controller;

    return (
        <div className="space-y-6 animate-in fade-in duration-200">
            <div>
                <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <span>🧬</span> 내 영어 매력적 오답 & 함정 DNA 분석 (Trap DNA)
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                    수능 영어 킬러 문항에서 학생이 반복해서 낚이는 '평가원 5대 매력적 오답 패턴'을 정밀 진단합니다.
                </p>
            </div>

            {/* 종합 지표 카드 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                    <span className="text-xs text-slate-400 font-bold block mb-1">누적 킬러 정답률</span>
                    <span className="text-2xl font-black text-amber-400">{trapDna?.accuracyRate || 0}%</span>
                    <span className="text-[11px] text-slate-500 block mt-1">
                        총 {trapDna?.totalAttempts || 0}회 풀이 중 {trapDna?.correctCount || 0}문항 정답
                    </span>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                    <span className="text-xs text-slate-400 font-bold block mb-1">평균 킬러 소요 시간</span>
                    <span className="text-2xl font-black text-emerald-400">{trapDna?.avgSolveSec || 0}초</span>
                    <span className="text-[11px] text-slate-500 block mt-1">이상적인 실전 목표: 60~75초 이내</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                    <span className="text-xs text-slate-400 font-bold block mb-1">인지 과부하 (90초 초과)</span>
                    <span className="text-2xl font-black text-rose-400">{trapDna?.cognitiveOverloadCount || 0}회</span>
                    <span className="text-[11px] text-slate-500 block mt-1">선지 왕복 및 작업기억 지연 횟수</span>
                </div>
            </div>

            {/* 5대 함정 유형별 취약도 리스트 */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-5">
                <h3 className="text-sm font-bold text-white">영어 5대 매력적 오답 유형별 취약도</h3>
                <div className="space-y-4">
                    {(Object.entries(ENGLISH_TRAP_META) as [string, { label: string; desc: string; icon: string }][]).map(([type, meta]) => {
                        const stat = trapDna?.trapBreakdown?.[type as TrapType] || { attempts: 0, failedCount: 0, failRate: 0 };
                        const isVulnerable = trapDna?.mostVulnerableTrap === type;

                        return (
                            <div
                                key={type}
                                className={`p-4 rounded-2xl border transition-all ${isVulnerable
                                        ? 'bg-amber-950/20 border-amber-500/50'
                                        : 'bg-slate-950/60 border-slate-800'
                                    }`}
                            >
                                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-base">{meta.icon}</span>
                                        <span className="text-xs sm:text-sm font-bold text-white">{meta.label}</span>
                                        {isVulnerable && (
                                            <span className="text-[10px] font-black bg-rose-500 text-white px-2 py-0.2 rounded-full">
                                                최대 취약 함정
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-xs font-mono font-bold text-slate-400">
                                        오답률 <strong className={stat.failRate > 40 ? 'text-rose-400' : 'text-slate-200'}>{stat.failRate}%</strong> ({stat.failedCount}/{stat.attempts})
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed mb-3">{meta.desc}</p>
                                {/* 게이지 바 */}
                                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${stat.failRate > 40 ? 'bg-rose-500' : 'bg-amber-500'
                                            }`}
                                        style={{ width: `${stat.failRate}%` }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* AI 처방전 */}
            <div className="bg-gradient-to-br from-slate-900 to-amber-950/40 border border-amber-500/40 rounded-3xl p-6 sm:p-7">
                <span className="text-xs font-bold text-amber-400 block mb-1">Dr. Lim AI 신경인지 독해 처방전</span>
                <h4 className="text-sm font-black text-white mb-2">
                    1등급 도약을 위한 최종 골든 룰: "단어 일치 의심 ➔ 지시어/대조 축 확인 ➔ 패러프레이징 선택"
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                    수능 영어 31~39번은 절대 어휘력만으로 풀리지 않습니다. 평가원 출제진은 지문에 나온 고난도 단어를 오답 선지에 그대로 미끼로 배치합니다.
                    선지를 읽을 때 <strong>본문 단어가 그대로 보이면 우선 [단어 일치 왜곡형]으로 의심</strong>하고,
                    여백에 적은 <strong>[However 대립 개념]과 [재진술 패러프레이징]</strong>을 기준으로 소거해 나가면 실수 없는 1등급이 완성됩니다.
                </p>
            </div>
        </div>
    );
};

export default EnglishClinicTrapDnaTab;