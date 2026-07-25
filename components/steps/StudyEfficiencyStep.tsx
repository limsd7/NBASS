import React, { useState } from 'react';
import { Layout } from '../Layout';
import { StepProgressBar } from '../ui/StepProgressBar';
import { CareType } from '../../types';
import { StudyEfficiencyAssessment } from '../StudyEfficiencyAssessment';

interface StudyEfficiencyStepProps {
    // Navigation
    onNext: () => void;
    onBack: () => void;

    // Layout props
    activeMenu: 'dashboard' | 'assessment' | 'history' | 'progress' | 'resources';
    onMenuChange: (menu: any) => void;
    isDarkMode: boolean;
    onToggleDarkMode: () => void;

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
    activeMenu,
    onMenuChange,
    isDarkMode,
    onToggleDarkMode,
    config,
    studyEfficiencyResults,
    setStudyEfficiencyResults,
    onStepClick
}) => {
    const [isTestWindowOpen, setIsTestWindowOpen] = useState(false);

    return (
        <Layout activeMenu={activeMenu} onMenuChange={onMenuChange} isDarkMode={isDarkMode} onToggleDarkMode={onToggleDarkMode}>
            <StepProgressBar currentStep="study_efficiency" isMedicalMode={config.isMedicalMode} isPortableMode={config.usePortable} onStepClick={onStepClick} />
            <div className="w-full max-w-full pb-20 mt-12 text-center">
                <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-200">
                    <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
                        📝
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 mb-4">공부 효율성 정밀 검사</h2>
                    <p className="text-slate-500 mb-8 max-w-lg mx-auto">
                        학생의 다중 지능, 시간 활용, 디지털 중독 상태 등을 측정하기 위한 정밀 검사입니다.
                        학생이 집중할 수 있도록 아래 버튼을 눌러 검사를 진행해 주세요.
                    </p>
                    
                    {!isTestWindowOpen ? (
                        <div className="space-y-4">
                            <button
                                onClick={() => setIsTestWindowOpen(true)}
                                className="px-8 py-4 bg-blue-600 text-white font-bold text-lg rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 hover:scale-105 transition-all"
                            >
                                검사 시작하기
                            </button>
                            <div className="block">
                                <button
                                    onClick={onBack}
                                    className="px-6 py-2 text-slate-400 hover:text-slate-600 text-sm font-bold"
                                >
                                    건너뛰기 (이전 단계)
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 animate-pulse">
                            <h3 className="font-bold text-indigo-700 mb-2">⏳ 학생이 검사를 진행 중입니다...</h3>
                            <p className="text-sm text-slate-500">
                                화면에 표시된 팝업창에서 검사를 완료해주세요.
                            </p>
                        </div>
                    )}
                </div>

                {isTestWindowOpen && (
                    <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex justify-center overflow-y-auto p-4 sm:p-8">
                        <div className="bg-white dark:bg-slate-900 w-full max-w-4xl h-max min-h-[80vh] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 my-auto">
                            <StudyEfficiencyAssessment
                                careType={CareType.HEALTHY}
                                isPortableMode={config.usePortable && !config.useBrainBody}
                                isInline={false}
                                onComplete={(results) => {
                                    setStudyEfficiencyResults(results);
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
