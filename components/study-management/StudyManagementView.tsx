import React, { useState } from 'react';
import { StudentInfo, HRVData, SurveyData, ProtocolData, LearningAnalyticsData } from '../../types';
import { PomodoroTimer } from './PomodoroTimer';
import { CognitivePriming } from './CognitivePriming';
import { SmartScheduler } from './SmartScheduler';
import { WorryDump } from './WorryDump';
import { SoundMixer } from './SoundMixer';
import { PaywallOverlay, FeatureGate } from '../ui/PaywallOverlay';
import { MembershipTier } from '../../utils/featureGate';

interface StudyManagementViewProps {
    student: StudentInfo;
    hrv: HRVData;
    survey: SurveyData;
    protocol: ProtocolData;
    analytics: LearningAnalyticsData;
    onBack?: () => void;
    membershipTier?: MembershipTier;
}

export const StudyManagementView: React.FC<StudyManagementViewProps> = ({
    student, hrv, survey, protocol, analytics, onBack, membershipTier
}) => {
    const [activeTab, setActiveTab] = useState(0);

    const tabs = [
        { id: 0, title: 'Bio-Adaptive Pomodoro', icon: '🍅', component: <PomodoroTimer hrv={hrv} />, desc: '생체 리듬 기반 집중 주기 측정' },
        { id: 1, title: 'Cognitive Priming', icon: '🧠', component: <CognitivePriming />, desc: '뇌 반응성 테스트 및 워밍업' },
        { id: 2, title: 'Smart Scheduler', icon: '⏰', component: (
            <PaywallOverlay currentTier={membershipTier || (student.membershipTier as MembershipTier) || 'free'} requiredFeature="ai_study_plan">
                <SmartScheduler survey={survey} />
            </PaywallOverlay>
        ), desc: '골든타임 기반 생활 계획표' },
        { id: 3, title: 'Worry Dump', icon: '🗑️', component: (
            <PaywallOverlay currentTier={membershipTier || (student.membershipTier as MembershipTier) || 'free'} requiredFeature="mental_management">
                <WorryDump />
            </PaywallOverlay>
        ), desc: '불안 해소 및 멘탈 비우기' },
        { id: 4, title: 'Sound Mixer', icon: '🎧', component: <SoundMixer />, desc: '맞춤형 청각 환경 튜닝' },
    ];

    const activeContent = tabs.find(t => t.id === activeTab)?.component;

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl shadow-sm">
                        🧬
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Neuro-Management Lab</h2>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
                            데이터 기반 학습 최적화 도구 (For {student.name})
                        </p>
                    </div>
                </div>
                {onBack && (
                    <button
                        onClick={onBack}
                        className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-colors"
                    >
                        돌아가기
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Navigation Sidebar */}
                <div className="lg:col-span-1 space-y-3">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full text-left p-4 rounded-2xl transition-all duration-200 flex items-center gap-3 border
                                ${activeTab === tab.id
                                    ? 'bg-slate-800 text-white border-slate-900 shadow-lg scale-105'
                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                                }`}
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl
                                ${activeTab === tab.id ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                {tab.icon}
                            </div>
                            <div>
                                <h3 className={`font-bold text-sm ${activeTab === tab.id ? 'text-white' : 'text-slate-800'}`}>
                                    {tab.title}
                                </h3>
                                <p className={`text-[10px] ${activeTab === tab.id ? 'text-slate-400' : 'text-slate-400'}`}>
                                    {tab.desc}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-3">
                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm min-h-[500px] relative overflow-hidden">
                        {/* Background decoration */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 z-0"></div>

                        <div className="relative z-10">
                            {activeContent}
                        </div>
                    </div>

                    {/* Context/Tip Area */}
                    <div className="mt-4 bg-indigo-900/5 border border-indigo-100 p-4 rounded-2xl flex items-start gap-3">
                        <span className="text-indigo-500 text-xl">💡</span>
                        <p className="text-sm text-indigo-800 leading-relaxed font-medium">
                            <span className="font-bold">Expert Note:</span> 이 도구들은 학생의 현재 자율신경 밸런스와 성향(Survey)을 기반으로 작동합니다.
                            상담 시 학생과 함께 시뮬레이션하며 최적의 설정값을 찾아주세요.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
