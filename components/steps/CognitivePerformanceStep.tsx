import React, { useState } from 'react';
import { Layout } from '../Layout';
import { StepProgressBar } from '../ui/StepProgressBar';
import { CareType } from '../../types';
import { CognitivePerformanceAssessment, CognitivePerformanceResults } from '../CognitivePerformanceAssessment';

interface CognitivePerformanceStepProps {
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
    config,
    cognitiveResults,
    setCognitiveResults,
    careType,
    onStepClick
}) => {
    const [isTestWindowOpen, setIsTestWindowOpen] = useState(false);

    return (
        <Layout activeMenu={activeMenu} onMenuChange={onMenuChange} isDarkMode={isDarkMode} onToggleDarkMode={onToggleDarkMode}>
            <StepProgressBar currentStep="cognitive_test" isMedicalMode={config.isMedicalMode} isPortableMode={config.usePortable} onStepClick={onStepClick} />
            
            <div className="w-full max-w-full pb-20 mt-12 text-center">
                <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-200">
                    <div className="w-24 h-24 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
                        🧠
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 mb-4">인지 성능 (주의력/충동성) 테스트</h2>
                    <p className="text-slate-500 mb-8 max-w-lg mx-auto">
                        Go/No-Go 테스트와 지연 보상 할인(Delay Discounting) 테스트를 통해 학생의 주의 집중력과 충동성을 측정합니다.
                        정확한 측정을 위해 아래 버튼을 눌러 방해 없이 검사를 진행해 주세요.
                    </p>
                    
                    {!isTestWindowOpen ? (
                        <div className="space-y-4">
                            <button
                                onClick={() => setIsTestWindowOpen(true)}
                                className="px-8 py-4 bg-purple-600 text-white font-bold text-lg rounded-2xl shadow-lg shadow-purple-200 hover:bg-purple-700 hover:scale-105 transition-all"
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
                            <h3 className="font-bold text-purple-700 mb-2">⏳ 학생이 검사를 진행 중입니다...</h3>
                            <p className="text-sm text-slate-500">
                                화면에 표시된 팝업창에서 검사를 완료해주세요.
                            </p>
                        </div>
                    )}
                </div>

                {isTestWindowOpen && (
                    <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex justify-center overflow-y-auto p-4 sm:p-8">
                        <div className="bg-white dark:bg-slate-900 w-full max-w-4xl h-max min-h-[80vh] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 my-auto">
                            <CognitivePerformanceAssessment
                                careType={careType || CareType.HEALTHY}
                                isPortableMode={config.usePortable && !config.useBrainBody}
                                isInline={false}
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
