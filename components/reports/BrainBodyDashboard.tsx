import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { BrainBodyState, CareType, AssessmentResult } from '../../types';
import { EEG_BASED_STRATEGIES } from '../../data/eegStrategies';
import { CoherenceTimelineChart } from '../charts/CoherenceTimelineChart';

interface BrainBodyDashboardProps {
    brainBodyState: BrainBodyState;
    careType: CareType;
    previousResult?: any; // To access previous coherence
    history?: (AssessmentResult & { date: string })[];
}

export const BrainBodyDashboard: React.FC<BrainBodyDashboardProps> = ({ brainBodyState, careType, previousResult, history }) => {
    // 1. Radar Chart Data for EEG
    const hasEEG = brainBodyState.eegBalance.gamma > 0 || brainBodyState.eegBalance.alpha > 0;
    
    // Coherence trend
    const prevCoherence = previousResult?.brainBodyState?.coherence;
    const coherenceChange = prevCoherence ? brainBodyState.coherence - prevCoherence : 0;
    const changeSymbol = coherenceChange > 0 ? '▲' : coherenceChange < 0 ? '▼' : '-';
    const changeColor = coherenceChange > 0 ? 'text-emerald-500' : coherenceChange < 0 ? 'text-rose-500' : 'text-slate-400';

    
    const radarData = [
        { subject: 'Gamma', A: brainBodyState.eegBalance.gamma, fullMark: 100 },
        { subject: 'H-Beta', A: brainBodyState.eegBalance.betaH, fullMark: 100 },
        { subject: 'M-Beta', A: brainBodyState.eegBalance.betaM, fullMark: 100 },
        { subject: 'L-Beta', A: brainBodyState.eegBalance.betaL, fullMark: 100 },
        { subject: 'Alpha', A: brainBodyState.eegBalance.alpha, fullMark: 100 },
        { subject: 'Theta', A: brainBodyState.eegBalance.theta, fullMark: 100 },
    ];

    // 2. Coherence Gauge Calculation
    const coherencePercentage = brainBodyState.coherence; // 0-100
    const circumference = 2 * Math.PI * 45; // r=45
    const strokeDashoffset = circumference - (coherencePercentage / 100) * circumference;

    const coherenceColor = coherencePercentage >= 80 ? 'text-emerald-500' 
                        : coherencePercentage >= 50 ? 'text-amber-500' : 'text-rose-500';
    const strokeColor = coherencePercentage >= 80 ? '#10b981' 
                      : coherencePercentage >= 50 ? '#f59e0b' : '#f43f5e';

    const eegStrategy = EEG_BASED_STRATEGIES[brainBodyState.pattern] || EEG_BASED_STRATEGIES['UNKNOWN'];

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
                <h3 className="font-bold text-lg flex items-center gap-2">
                    <span className="text-2xl">🧠</span> Brain-Body 통합 진단 리포트
                </h3>
                <div className="text-xs font-mono bg-slate-800 px-3 py-1 rounded text-slate-300">
                    3-Layer Verification
                </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
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
                        <div className={`font-bold text-lg ${coherenceColor}`}>{brainBodyState.coherenceLevel}</div>
                        <div className="text-xs text-slate-500 mt-1">
                            Survey + HRV {hasEEG ? '+ EEG' : ''} 통합 검증
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

                {/* 2. EEG Radar */}
                <div className="flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-100 pb-6 md:pb-0 relative min-h-[200px]">
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2 z-10 relative">뇌파 밸런스 (EEG)</h4>
                    {hasEEG ? (
                        <div className="w-full h-48 -mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                    <PolarGrid stroke="#e2e8f0" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 40]} tick={false} axisLine={false} />
                                    <Radar name="EEG" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-slate-300 w-full h-full">
                            <span className="text-4xl mb-2">📡</span>
                            <span className="text-sm">EEG 데이터 없음</span>
                            <span className="text-xs mt-1">(2층 검증 모드)</span>
                        </div>
                    )}
                </div>

                {/* 3. Analysis & Action */}
                <div className="flex flex-col justify-center">
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">분석 요약</h4>
                    <div className="space-y-4">
                        <div>
                            <div className="text-xs text-slate-400 mb-1">자율신경 (HRV)</div>
                            <div className="font-bold text-slate-700">
                                SNS {brainBodyState.snsLevel}% / PNS {brainBodyState.pnsLevel}%
                                <span className="ml-2 text-xs font-normal bg-slate-100 px-2 py-1 rounded text-slate-600">
                                    {brainBodyState.ansBalance}
                                </span>
                            </div>
                        </div>
                        {hasEEG && (
                            <div>
                                <div className="text-xs text-slate-400 mb-1">지배 뇌파 (Dominant)</div>
                                <div className="font-bold text-slate-700">
                                    {brainBodyState.dominantFrequency} 
                                    {brainBodyState.secondaryFrequency && <span className="text-slate-400 font-normal"> / {brainBodyState.secondaryFrequency}</span>}
                                    <span className="ml-2 text-xs font-normal bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                        {brainBodyState.pattern}
                                    </span>
                                </div>
                            </div>
                        )}
                        <div>
                            <div className="text-xs text-slate-400 mb-1">최종 뇌-신체 판정</div>
                            <div className="font-bold text-slate-800 text-lg">
                                {brainBodyState.brainState}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Immediate Actions Footer */}
            {hasEEG && eegStrategy.pattern !== 'UNKNOWN' && (
                <div className="bg-blue-50 p-4 border-t border-blue-100">
                    <h4 className="text-xs font-bold text-blue-800 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <span>⚡</span> 즉각 조치 권장사항 (Immediate Actions)
                    </h4>
                    <ul className="text-sm text-blue-900 list-disc list-inside space-y-1">
                        {eegStrategy.immediateActions.map((action, i) => (
                            <li key={i}>{action}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Coherence Timeline (Phase 1) */}
            {history && history.length > 0 && (
                <div className="border-t border-slate-100 p-6 bg-slate-50/50">
                    <CoherenceTimelineChart history={history} />
                </div>
            )}
        </div>
    );
};
