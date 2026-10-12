import React from 'react';
import { BrainBodyState, CareType, AssessmentResult } from '../../types';
import { CoherenceTimelineChart } from '../charts/CoherenceTimelineChart';

interface BrainBodyDashboardProps {
    brainBodyState: BrainBodyState;
    careType: CareType;
    previousResult?: any; // To access previous coherence
    history?: (AssessmentResult & { date: string })[];
    isExpertMode?: boolean;
    studentName?: string;
    membershipTier?: string;
    reportMode?: 'expert' | 'student';
}

export const BrainBodyDashboard: React.FC<BrainBodyDashboardProps> = ({
    brainBodyState,
    careType,
    previousResult,
    history,
    isExpertMode,
    studentName,
    membershipTier,
    reportMode
}) => {
    const hasHRV = brainBodyState.snsLevel > 0 || brainBodyState.pnsLevel > 0;

    // Check if Expert mode / Paid Tier
    const isExpertOrPaid = isExpertMode || reportMode === 'expert' || membershipTier === 'expert' || membershipTier === 'premium' || membershipTier === 'pro';
    const isFreeOrSurveyOnly = !isExpertOrPaid && !hasHRV;

    // Coherence calculation:
    // [정합성] 등급/모드에 따른 하드코딩 값(95/52)을 제거하고,
    // 실제 3계층 통합 진단(brainBodyState)의 일치도 값을 그대로 표시합니다.
    const coherencePercentage = brainBodyState.coherence;
    const coherenceLevel = brainBodyState.coherenceLevel;

    // Coherence trend
    const prevCoherence = previousResult?.brainBodyState?.coherence;
    const coherenceChange = prevCoherence ? coherencePercentage - prevCoherence : 0;
    const changeSymbol = coherenceChange > 0 ? '▲' : coherenceChange < 0 ? '▼' : '-';
    const changeColor = coherenceChange > 0 ? 'text-emerald-500' : coherenceChange < 0 ? 'text-rose-500' : 'text-slate-400';

    // Coherence Gauge Calculation
    const circumference = 2 * Math.PI * 45; // r=45
    const strokeDashoffset = circumference - (coherencePercentage / 100) * circumference;

    const coherenceColor = coherencePercentage >= 80 ? 'text-emerald-500'
        : coherencePercentage >= 50 ? 'text-amber-500' : 'text-rose-500';
    const strokeColor = coherencePercentage >= 80 ? '#10b981'
        : coherencePercentage >= 50 ? '#f59e0b' : '#f43f5e';

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
                <h3 className="font-bold text-lg flex items-center gap-2">
                    <span className="text-2xl">🧠</span> Brain-Body 통합 진단 리포트
                </h3>
                <div className="text-xs font-mono bg-slate-800 px-3 py-1 rounded text-slate-300">
                    {isExpertOrPaid ? '3-Layer Expert Full Verification' : (isFreeOrSurveyOnly ? 'FREE 1회 무료 정밀 진단' : '3-Layer Full Verification')}
                </div>
            </div>

            {/* 무료 체험 신뢰도 안내 배너 (유료/전문가 모드가 아닐 때만 표시) */}
            {isFreeOrSurveyOnly && (
                <div className="bg-amber-50 border-b border-amber-200 p-3.5 text-xs text-amber-950 flex items-start gap-2.5">
                    <span className="text-lg shrink-0">💡</span>
                    <div className="leading-relaxed">
                        <strong className="font-bold text-amber-900 block mb-0.5">
                            현재 결과는 [FREE 1회 무료 정밀 진단] 기반 분석입니다. (신뢰도 {coherencePercentage}%)
                        </strong>
                        정기결제(첫 달 14,900원)로 전환하시면 <b>14P 심층 리포트북</b>과 <b>3가지 다차원 복합 유형 진단</b>, <b>4대 과목별 뇌인지 처방전</b>이 즉시 잠금 해제됩니다. (무료: 1차 핵심 진단 제공)
                    </div>
                </div>
            )}

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* 1. Coherence Gauge */}
                <div className="flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-100 pb-6 md:pb-0">
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">진단 신뢰도 (Confidence)</h4>
                    <div className="relative w-32 h-32">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" fill="none" className="stroke-slate-100" strokeWidth="8" />
                            <circle
                                cx="50" cy="50" r="45" fill="none" stroke={strokeColor} strokeWidth="8"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                className="transition-all duration-1000 ease-out"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className={`text-3xl font-black ${coherenceColor}`}>{coherencePercentage}%</span>
                        </div>
                    </div>
                    <div className="text-center mt-4">
                        <div className={`font-bold text-lg ${coherenceColor}`}>{coherenceLevel}</div>
                        <div className="text-xs text-slate-500 mt-1">
                            {isExpertOrPaid ? '심층 설문 & 신경인지 통합 분석' : '기본 설문 기반 분석'}
                        </div>
                        {prevCoherence !== undefined && (
                            <div className="mt-2 text-[10px] font-bold bg-slate-50 border border-slate-100 rounded-full px-3 py-1 inline-flex items-center gap-1">
                                <span className="text-slate-400">이전 대비:</span>
                                <span className={changeColor}>
                                    {changeSymbol} {Math.abs(coherenceChange)}%
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. Analysis & Action */}
                <div className="flex flex-col justify-center">
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">분석 요약</h4>
                    <div className="space-y-4">
                        <div>
                            <div className="text-xs text-slate-400 mb-1">자율신경 (ANS)</div>
                            <div className="font-bold text-slate-700">
                                SNS {brainBodyState.snsLevel}% / PNS {brainBodyState.pnsLevel}%
                                <span className="ml-2 text-xs font-normal bg-slate-100 px-2 py-1 rounded text-slate-600">
                                    {brainBodyState.ansBalance}
                                </span>
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-slate-400 mb-1">종합 진단 판정</div>
                            <div className="font-bold text-slate-800 text-base flex items-center gap-2">
                                <span>{careType}</span>
                                <span className="text-xs font-normal px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                                    {isFreeOrSurveyOnly ? '1차 핵심 케어' : brainBodyState.brainState}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Coherence Timeline (Phase 1) */}
            {history && history.length > 0 && (
                <div className="border-t border-slate-100 p-6 bg-slate-50/50">
                    <CoherenceTimelineChart history={history} />
                </div>
            )}
        </div>
    );
};
