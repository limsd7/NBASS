import React, { useState } from 'react';
import { Layout } from '../Layout';
import { StepProgressBar } from '../ui/StepProgressBar';
import { CareType } from '../../types';
import { CognitivePerformanceAssessment, CognitivePerformanceResults } from '../CognitivePerformanceAssessment';
import { AssessmentCard } from '../ui/AssessmentCard';

interface CognitivePerformanceStepProps {
    // Navigation
    onNext: () => void;
    onBack: () => void;

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

    // Results
    cognitiveResults: CognitivePerformanceResults | null;
    setCognitiveResults: React.Dispatch<React.SetStateAction<CognitivePerformanceResults | null>>;

    // CareType for recommendations
    careType?: CareType;

    // Progress Bar
    onStepClick?: (stepId: any) => void;
}

export const CognitivePerformanceStep: React.FC<CognitivePerformanceStepProps> = ({
    onNext,
    onBack,
    activeMenu,
    onMenuChange,
    isDarkMode,
    onToggleDarkMode,
    onHomeClick,
    config,
    cognitiveResults,
    setCognitiveResults,
    careType,
    onStepClick
}) => {
    const [isTestWindowOpen, setIsTestWindowOpen] = useState(false);

    return (
        <Layout onHomeClick={onHomeClick} activeMenu={activeMenu} onMenuChange={onMenuChange} isDarkMode={isDarkMode} onToggleDarkMode={onToggleDarkMode}>
            <StepProgressBar currentStep="cognitive_test" isMedicalMode={config.isMedicalMode} isPortableMode={config.usePortable} onStepClick={onStepClick} />
            
            <div className="w-full max-w-4xl mx-auto pb-20 mt-8 animate-in fade-in duration-500">
                <AssessmentCard
                    badge="Executive Function Protocol"
                    title="인지 성능 (주의력/억제력) 정밀 진단"
                    subtitle="Go/No-Go 자극 억제 검사와 지연 보상 할인(Delay Discounting)을 통해 수험생의 전두엽 집중 통제력과 충동성을 평가합니다."
                    accentColor="purple"
                >
                    <div className="flex flex-col items-center justify-center text-center">
                        <div className="w-24 h-24 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 rounded-3xl flex items-center justify-center mb-8 shadow-sm text-purple-600 dark:text-purple-400">
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>

                        {!isTestWindowOpen ? (
                            <div className="space-y-4 w-full max-w-sm">
                                <button
                                    onClick={() => setIsTestWindowOpen(true)}
                                    className="w-full py-5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-lg rounded-2xl shadow-xl shadow-purple-500/20 hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                                >
                                    검사 시작하기 →
                                </button>
                                <div>
                                    <button
                                        onClick={onBack}
                                        className="px-6 py-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold transition-colors"
                                    >
                                        ← 이전 단계로 돌아가기
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="p-6 bg-purple-50/60 dark:bg-purple-950/40 rounded-2xl border border-purple-200 dark:border-purple-800/60 max-w-md animate-pulse">
                                <h3 className="font-black text-purple-700 dark:text-purple-300 mb-1 text-sm">검사가 진행 중입니다</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    화면에 표시된 팝업 창에서 검사를 진행해 주세요.
                                </p>
                            </div>
                        )}
                    </div>
                </AssessmentCard>

                {isTestWindowOpen && (
                    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex justify-center items-center p-4 sm:p-8 animate-in fade-in">
                        <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 my-auto overflow-y-auto">
                            <CognitivePerformanceAssessment
                                careType={careType || CareType.HEALTHY}
                                isPortableMode={config.usePortable && !config.useBrainBody}
                                isInline={true}
                                initialData={cognitiveResults}
                                onProgress={(results) => setCognitiveResults(results as CognitivePerformanceResults)}
                                onComplete={(results) => {
                                    setCognitiveResults(results);
                                    setIsTestWindowOpen(false);
                                    onNext();
                                }}
                                onClose={() => setIsTestWindowOpen(false)}
                            />
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};
