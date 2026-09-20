import React, { useState } from 'react';
import { Layout } from '../Layout';
import { StepProgressBar } from '../ui/StepProgressBar';
import { CareType, AssessmentResult } from '../../types';
import { StudyEfficiencyAssessment } from '../StudyEfficiencyAssessment';
import { AssessmentCard } from '../ui/AssessmentCard';
import { MembershipTier } from '../../utils/featureGate';
import { SubscriptionModal } from '../modals/SubscriptionModal';

interface StudyEfficiencyStepProps {
    // Navigation
    onNext: (results?: any) => void;
    onBack: () => void;

    // Current Assessment Result (if revisiting from report)
    currentResult?: AssessmentResult | null;

    // 10-Min Mode & Tier
    is10MinMode?: boolean;
    membershipTier?: MembershipTier;
    isFreeStudent?: boolean;
    onUpgradeTier?: (tier: MembershipTier) => void;

    // Layout props
    activeMenu: any;
    onMenuChange: (menu: any) => void;
    isDarkMode: boolean;
    onToggleDarkMode: () => void;
    onHomeClick?: () => void;

    // Config
    config: {
        isMedicalMode: boolean;
        useBrainBody: boolean;
        usePortable: boolean;
    };

    // Study Efficiency Results
    studyEfficiencyResults: any;
    setStudyEfficiencyResults: React.Dispatch<React.SetStateAction<any>>;

    // Progress Bar
    onStepClick?: (stepId: string) => void;
}

export const StudyEfficiencyStep: React.FC<StudyEfficiencyStepProps> = ({
    onNext,
    onBack,
    currentResult,
    is10MinMode = false,
    membershipTier = 'free',
    isFreeStudent = false,
    onUpgradeTier,
    activeMenu,
    onMenuChange,
    isDarkMode,
    onToggleDarkMode,
    onHomeClick,
    config,
    studyEfficiencyResults,
    setStudyEfficiencyResults,
    onStepClick
}) => {
    const [isTestWindowOpen, setIsTestWindowOpen] = useState(Boolean(currentResult));
    const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

    const isFree = isFreeStudent || membershipTier === 'free' || membershipTier === 'basic';

    return (
        <Layout onHomeClick={onHomeClick} activeMenu={activeMenu} onMenuChange={onMenuChange} isDarkMode={isDarkMode} onToggleDarkMode={onToggleDarkMode}>
            <StepProgressBar currentStep="study_efficiency" isMedicalMode={config.isMedicalMode} isPortableMode={config.usePortable} is10MinMode={is10MinMode} onStepClick={onStepClick} />

            <div className="max-w-4xl mx-auto pb-20 mt-8 px-4 animate-in fade-in duration-500">
                {is10MinMode && (
                    <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-800 p-4 rounded-2xl text-white shadow-md flex items-center justify-between mb-6 text-left">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">⚡</span>
                            <div>
                                <h4 className="text-base font-black">3분 무료체험 핵심 코스 [3단계: 공부 효율성 검사]</h4>
                                <p className="text-xs text-blue-100 font-medium">검사 완료 시 즉시 3분 맞춤 간편 진단 리포트가 발급됩니다.</p>
                            </div>
                        </div>
                        <span className="px-3 py-1 bg-white/20 rounded-xl text-xs font-black backdrop-blur-sm">Final Step</span>
                    </div>
                )}

                <AssessmentCard
                    badge={isFree ? "Free Mode • Digital Addiction" : "Study Dynamics & Chronotype"}
                    title={isFree ? "공부 효율성 검사 (디지털 도파민 중독 척도)" : "5종 공부 효율성 및 인지 스타일 정밀 검사"}
                    subtitle={isFree
                        ? "FREE 모드에서는 디지털 도파민 중독 척도 검사가 제공됩니다. (나머지 4종 검사는 PRO 이상 결제 시 전체 해금)"
                        : "크로노타입(생체 리듬), 학습 감각(VARK), 시험불안(TAI), 디지털 의존도, 메타인지를 종합 분석합니다."}
                    accentColor="blue"
                >
                    <div className="flex flex-col items-center justify-center text-center">
                        <div className="w-24 h-24 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-3xl flex items-center justify-center mb-6 shadow-sm text-blue-600 dark:text-blue-400">
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>

                        {/* 안내 박스 */}
                        {isFree ? (
                            <div className="mb-8 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-800/60 rounded-3xl text-left max-w-2xl mx-auto flex items-start gap-4 shadow-sm">
                                <div className="w-9 h-9 rounded-2xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 font-bold text-lg">
                                    📱
                                </div>
                                <div className="text-slate-700 dark:text-slate-300 leading-relaxed space-y-1.5 flex-1">
                                    <div className="flex items-center justify-between">
                                        <strong className="font-black text-blue-700 dark:text-blue-300 text-sm md:text-base">
                                            FREE 모드: 디지털 도파민 중독 척도 검사 제공
                                        </strong>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-200">
                                            1종 체험
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                                        스마트폰 및 숏폼 도파민 의존도를 측정합니다. <strong>크로노타입(수면리듬), VARK(학습감각), TAI(시험불안), 메타인지</strong> 4개 심층 정밀 검사는 <strong>PRO 이상 유료 멤버십</strong> 결제 시 전체 해금되어 5종 모두 진행하실 수 있습니다.
                                    </p>
                                    <button
                                        onClick={() => setIsSubscriptionModalOpen(true)}
                                        className="mt-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                                    >
                                        ⚡ PRO 멤버십으로 5종 전체 검사 해금하기 &rarr;
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="mb-8 p-5 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-3xl text-left max-w-2xl mx-auto flex items-start gap-4 shadow-sm">
                                <div className="w-9 h-9 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 font-bold text-lg">
                                    👑
                                </div>
                                <div className="text-slate-700 dark:text-slate-300 leading-relaxed space-y-1">
                                    <strong className="font-black text-emerald-700 dark:text-emerald-400 text-sm md:text-base block">
                                        5종 정밀 검사 해금 완료 (PRO 이상)
                                    </strong>
                                    <p className="text-xs text-emerald-900/80 dark:text-emerald-300 font-medium leading-relaxed">
                                        크로노타입, VARK 학습감각, 시험불안(TAI), 디지털 의존도, 메타인지 5개 핵심 세부 검사를 모두 진행하실 수 있습니다. 모든 검사를 완료할수록 학생의 두뇌 특성에 부합하는 초정밀 솔루션이 산출됩니다.
                                    </p>
                                </div>
                            </div>
                        )}

                        {!isTestWindowOpen ? (
                            <div className="space-y-4 w-full max-w-sm">
                                <button
                                    onClick={() => setIsTestWindowOpen(true)}
                                    className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-lg rounded-2xl shadow-xl shadow-blue-500/20 hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                                >
                                    {currentResult ? '🎯 5종 정밀 검사 열기 / 이어하기 →' : isFree ? '디지털 도파민 검사 시작하기 →' : '5종 정밀 검사 시작하기 →'}
                                </button>
                                <div>
                                    <button
                                        onClick={onBack}
                                        className="px-6 py-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold transition-colors"
                                    >
                                        {currentResult ? '← 결과 리포트로 돌아가기' : '← 이전 단계로 돌아가기'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="p-6 bg-blue-50/60 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-800/60 max-w-md animate-pulse">
                                <h3 className="font-black text-blue-700 dark:text-blue-300 mb-1 text-sm">검사가 진행 중입니다</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    화면에 표시된 창에서 검사를 진행해 주세요.
                                </p>
                            </div>
                        )}
                    </div>
                </AssessmentCard>

                {isTestWindowOpen && (
                    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex justify-center items-center p-4 sm:p-8 animate-in fade-in">
                        <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 my-auto overflow-y-auto">
                            <StudyEfficiencyAssessment
                                careType={currentResult?.careType || CareType.HEALTHY}
                                isPortableMode={config.usePortable && !config.useBrainBody}
                                isInline={true}
                                isFreeMode={isFree}
                                membershipTier={membershipTier}
                                initialSurveyData={currentResult?.survey}
                                initialData={studyEfficiencyResults}
                                onUpgrade={() => setIsSubscriptionModalOpen(true)}
                                onComplete={(results) => {
                                    setStudyEfficiencyResults(results);
                                    setIsTestWindowOpen(false);
                                    onNext(results);
                                }}
                                onClose={() => {
                                    setIsTestWindowOpen(false);
                                    if (currentResult) {
                                        onBack();
                                    }
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Subscription Modal for PRO Upgrade */}
                <SubscriptionModal
                    isOpen={isSubscriptionModalOpen}
                    onClose={() => setIsSubscriptionModalOpen(false)}
                    currentTier={membershipTier}
                    initialTier="pro"
                    triggerReason="5종 학습 효율성 정밀 진단 전체 해금"
                    onSelectTier={(tier) => {
                        setIsSubscriptionModalOpen(false);
                        if (onUpgradeTier) {
                            onUpgradeTier(tier);
                        }
                    }}
                />
            </div>
        </Layout>
    );
};
