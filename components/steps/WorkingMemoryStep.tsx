import React, { useState } from 'react';
import { Layout } from '../Layout';
import { StepProgressBar } from '../ui/StepProgressBar';
import { CareType } from '../../types';
import { WorkingMemoryAssessment } from '../WorkingMemoryAssessment';
import { WorkingMemoryResult } from '../../data/workingMemoryAssessments';
import { AssessmentCard } from '../ui/AssessmentCard';

interface WorkingMemoryStepProps {
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

    // Working Memory Results
    workingMemoryResults: WorkingMemoryResult | null;
    setWorkingMemoryResults: React.Dispatch<React.SetStateAction<WorkingMemoryResult | null>>;

    // CareType for recommendations
    careType?: CareType;

    // Progress Bar
    onStepClick?: (stepId: any) => void;
}

export const WorkingMemoryStep: React.FC<WorkingMemoryStepProps> = ({
    onNext,
    onBack,
    activeMenu,
    onMenuChange,
    isDarkMode,
    onToggleDarkMode,
    onHomeClick,
    config,
    workingMemoryResults,
    setWorkingMemoryResults,
    careType,
    onStepClick
}) => {
    const [isTestWindowOpen, setIsTestWindowOpen] = useState(false);

    return (
        <Layout onHomeClick={onHomeClick} activeMenu={activeMenu} onMenuChange={onMenuChange} isDarkMode={isDarkMode} onToggleDarkMode={onToggleDarkMode}>
            <StepProgressBar currentStep="working_memory" isMedicalMode={config.isMedicalMode} isPortableMode={config.usePortable} onStepClick={onStepClick} />
            
            <div className="w-full max-w-4xl mx-auto pb-20 mt-8 animate-in fade-in duration-500">
                <AssessmentCard
                    badge="Cognitive RAM Assessment"
                    title="작업 기억 용량 정밀 진단"
                    subtitle="숫자 따라하기(Digit Span)와 N-Back 검사를 통해 학생의 단기 기억 및 복합 정보 처리 역량을 분석합니다."
                    accentColor="indigo"
                >
                    <div className="flex flex-col items-center justify-center text-center">
                        <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-3xl flex items-center justify-center mb-8 shadow-sm text-indigo-600 dark:text-indigo-400">
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                            </svg>
                        </div>

                        {!isTestWindowOpen ? (
                            <div className="space-y-4 w-full max-w-sm">
                                <button
                                    onClick={() => setIsTestWindowOpen(true)}
                                    className="w-full py-5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-black text-lg rounded-2xl shadow-xl shadow-indigo-500/20 hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                                >
                                    검사 시작하기 →
                                </button>
                                <div className="flex items-center justify-center gap-3">
                                    <button
                                        onClick={onBack}
                                        className="px-4 py-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold transition-colors"
                                    >
                                        ← 이전 단계로 돌아가기
                                    </button>
                                    <span className="text-slate-300 dark:text-slate-700">|</span>
                                    <button
                                        onClick={onNext}
                                        className="px-4 py-2.5 text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300 text-xs font-bold transition-colors"
                                    >
                                        검사 건너뛰기 →
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="p-6 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-2xl border border-indigo-200 dark:border-indigo-800/60 max-w-md animate-pulse">
                                <h3 className="font-black text-indigo-700 dark:text-indigo-300 mb-1 text-sm">검사가 진행 중입니다</h3>
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
                            <WorkingMemoryAssessment
                                careType={careType || CareType.HEALTHY}
                                isPortableMode={config.usePortable && !config.useBrainBody}
                                isInline={true}
                                onComplete={(results) => {
                                    setWorkingMemoryResults(results);
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
