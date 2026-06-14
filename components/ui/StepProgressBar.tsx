import React from 'react';

interface StepProgressBarProps {
    currentStep: string;
    isMedicalMode?: boolean;
    isPortableMode?: boolean;
    isBrainBodyMode?: boolean;
    onStepClick?: (stepId: any) => void;
}

interface Step {
    id: string;
    label: string;
    icon: string;
    shortLabel: string;
}

const STANDARD_STEPS: Step[] = [
    { id: 'register', label: '학생 등록', icon: '👤', shortLabel: '등록' },
    { id: 'surveys', label: '설문 조사', icon: '📋', shortLabel: '설문' },
    { id: 'protocol', label: '학습 환경', icon: '🏠', shortLabel: '환경' },
    { id: 'analytics', label: '학습 분석', icon: '📊', shortLabel: '분석' },
    { id: 'study_efficiency', label: '효율성 검사', icon: '🎯', shortLabel: '효율성' },
    { id: 'cognitive_test', label: '인지 테스트', icon: '🧠', shortLabel: '인지' },
    { id: 'hrv', label: 'HRV 검사', icon: '❤️', shortLabel: 'HRV' },
    { id: 'eeg', label: 'EEG 검사', icon: '🧠', shortLabel: 'EEG' },
    { id: 'loading', label: '결과 생성', icon: '⚙️', shortLabel: '생성' },
    { id: 'results', label: '결과 확인', icon: '✅', shortLabel: '결과' }
];

const MEDICAL_STEPS: Step[] = [
    { id: 'register', label: '학생 등록', icon: '👤', shortLabel: '등록' },
    { id: 'surveys', label: '설문 조사', icon: '📋', shortLabel: '설문' },
    { id: 'protocol', label: '학습 환경', icon: '🏠', shortLabel: '환경' },
    { id: 'analytics', label: '학습 분석', icon: '📊', shortLabel: '분석' },
    { id: 'study_efficiency', label: '효율성 검사', icon: '🎯', shortLabel: '효율성' },
    { id: 'cognitive_test', label: '인지 테스트', icon: '🧠', shortLabel: '인지' },
    { id: 'hrv', label: 'HRV 검사', icon: '❤️', shortLabel: 'HRV' },
    { id: 'eeg', label: 'EEG 검사', icon: '🧠', shortLabel: 'EEG' },
    { id: 'bloodtest', label: '혈액 검사', icon: '🩸', shortLabel: '혈액' },
    { id: 'loading', label: '결과 생성', icon: '⚙️', shortLabel: '생성' },
    { id: 'results', label: '결과 확인', icon: '✅', shortLabel: '결과' }
];

export const StepProgressBar: React.FC<StepProgressBarProps> = ({
    currentStep,
    isMedicalMode = false,
    isPortableMode = false,
    isBrainBodyMode = true,
    onStepClick
}) => {
    let steps = isMedicalMode ? MEDICAL_STEPS : STANDARD_STEPS;

    // 만약 둘 다 체크되지 않았다면 HRV, EEG 모두 제외
    if (!isPortableMode && !isBrainBodyMode) {
        steps = steps.filter(s => s.id !== 'hrv' && s.id !== 'eeg');
    }
    // Portable 모드만 켜져있다면 EEG 스텝만 제외 (uBioMacpa 등은 EEG 미포함)
    else if (isPortableMode && !isBrainBodyMode) {
        steps = steps.filter(s => s.id !== 'eeg');
    }

    const currentIndex = steps.findIndex(s => s.id === currentStep);

    // Don't show on admin_expertise page
    if (currentStep === 'admin_expertise') {
        return null;
    }

    const handleStepClick = (stepId: string, index: number) => {
        // 이미 완료된 단계(현재 단계 이전)로만 이동 가능
        if (index < currentIndex && onStepClick) {
            onStepClick(stepId);
        }
    };

    return (
        <div className="w-full bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 px-4 py-3">
            <div className="max-w-4xl mx-auto">
                {/* Progress Bar */}
                <div className="relative mb-2">
                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 rounded-full -translate-y-1/2 z-0" />
                    <div
                        className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full -translate-y-1/2 z-10 transition-all duration-500"
                        style={{ width: `${((currentIndex) / (steps.length - 1)) * 100}%` }}
                    />

                    {/* Step Dots */}
                    <div className="relative flex justify-between z-20">
                        {steps.map((step, index) => {
                            const isCompleted = index < currentIndex;
                            const isCurrent = index === currentIndex;
                            const isClickable = isCompleted && onStepClick;

                            return (
                                <div
                                    key={step.id}
                                    className={`flex flex-col items-center group ${isClickable ? 'cursor-pointer' : ''}`}
                                    onClick={() => handleStepClick(step.id, index)}
                                >
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 relative
                                            ${isCompleted ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-200' : ''}
                                            ${isCurrent ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white ring-4 ring-indigo-100 shadow-lg shadow-indigo-200 scale-110' : ''}
                                            ${!isCompleted && !isCurrent ? 'bg-slate-200 text-slate-400' : ''}
                                            ${isClickable ? 'group-hover:scale-110 group-hover:ring-2 group-hover:ring-blue-300' : ''}
                                        `}
                                    >
                                        {isCompleted ? '✓' : step.icon}
                                        {/* Tooltip for clickable steps */}
                                        {isClickable && (
                                            <div className="absolute -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap pointer-events-none z-50">
                                                이동
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Step Labels */}
                <div className="flex justify-between">
                    {steps.map((step, index) => {
                        const isCompleted = index < currentIndex;
                        const isCurrent = index === currentIndex;
                        const isClickable = isCompleted && onStepClick;

                        return (
                            <div
                                key={step.id}
                                className={`text-[10px] font-medium text-center w-12 transition-colors 
                                    ${isClickable ? 'cursor-pointer hover:text-blue-700' : ''}
                                    ${isCurrent ? 'text-indigo-600 font-bold' : ''}
                                    ${isCompleted ? 'text-blue-500' : ''}
                                    ${!isCompleted && !isCurrent ? 'text-slate-400' : ''}
                                `}
                                onClick={() => handleStepClick(step.id, index)}
                            >
                                {step.shortLabel}
                            </div>
                        );
                    })}
                </div>

                {/* Current Step Info */}
                <div className="mt-2 flex items-center justify-center gap-2">
                    <span className="text-lg">{steps[currentIndex]?.icon}</span>
                    <span className="text-sm font-bold text-slate-700">{steps[currentIndex]?.label}</span>
                    <span className="text-xs text-slate-400">({currentIndex + 1}/{steps.length})</span>
                </div>
            </div>
        </div>
    );
};
