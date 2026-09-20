import React from 'react';

interface StepProgressBarProps {
    currentStep: string;
    isMedicalMode?: boolean;
    isPortableMode?: boolean;
    isBrainBodyMode?: boolean;
    isFreeMode?: boolean;
    is10MinMode?: boolean;
    onStepClick?: (stepId: any) => void;
    studentInfo?: {
        grade?: string;
        age?: number | string;
        gender?: string;
        testDate?: string;
        weakSubject?: string;
    };
    bottomContent?: React.ReactNode;
    children?: React.ReactNode;
}

interface Step {
    id: string;
    label: string;
    shortLabel: string;
}

const FREE_10MIN_STEPS: Step[] = [
    { id: 'register', label: '과목 선택', shortLabel: '과목' },
    { id: 'surveys', label: '심리/수면 설문', shortLabel: '1단계 설문' },
    { id: 'protocol', label: '집중력 프로토콜', shortLabel: '2단계 환경' },
    { id: 'study_efficiency', label: '공부 효율성', shortLabel: '3단계 효율' },
    { id: 'results', label: '10분 간편 리포트', shortLabel: '요약 리포트' }
];

const STANDARD_STEPS: Step[] = [
    { id: 'register', label: '학생 등록', shortLabel: '등록' },
    { id: 'surveys', label: '설문 조사', shortLabel: '설문' },
    { id: 'protocol', label: '학습 환경', shortLabel: '환경' },
    { id: 'analytics', label: '학습 분석', shortLabel: '분석' },
    { id: 'study_efficiency', label: '효율성 검사', shortLabel: '효율성' },
    { id: 'cognitive_test', label: '인지 테스트', shortLabel: '인지' },
    { id: 'loading', label: '결과 생성', shortLabel: '생성' },
    { id: 'results', label: '종합 결과', shortLabel: '결과' }
];

const MEDICAL_STEPS: Step[] = STANDARD_STEPS;

export const StepProgressBar: React.FC<StepProgressBarProps> = ({
    currentStep,
    isMedicalMode = false,
    isPortableMode = false,
    isBrainBodyMode = false,
    isFreeMode = false,
    is10MinMode = false,
    onStepClick,
    studentInfo,
    bottomContent,
    children
}) => {
    const is10Min = isFreeMode || is10MinMode;
    let steps = is10Min ? FREE_10MIN_STEPS : STANDARD_STEPS;
    steps = steps.filter(s => s.id !== 'hrv' && s.id !== 'eeg' && s.id !== 'bloodtest');

    const currentIndex = steps.findIndex(s => s.id === currentStep);

    if (currentStep === 'admin_expertise' || currentIndex === -1) {
        return null;
    }

    const handleStepClick = (stepId: string, index: number) => {
        if (index < currentIndex && onStepClick) {
            onStepClick(stepId);
        }
    };

    const progressPercentage = (currentIndex / Math.max(1, steps.length - 1)) * 100;

    return (
        <div className="w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-16 z-40 px-4 py-3 transition-colors shadow-sm">
            <div className="max-w-[1600px] mx-auto">
                {/* Mobile Header (visible only on small screens) */}
                <div className="flex md:hidden items-center justify-between mb-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                            <span className="text-xs font-black text-slate-800 dark:text-slate-100">
                                뉴로바이오 학습전략시스템
                            </span>
                        </div>
                        {studentInfo && (
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 ml-3.5">
                                {studentInfo.grade ? `${studentInfo.grade} / ` : ''}
                                {studentInfo.age ? `${studentInfo.age}세 / ` : ''}
                                {studentInfo.gender ? `${studentInfo.gender === 'Male' ? '남성' : studentInfo.gender === 'Female' ? '여성' : studentInfo.gender}` : ''}
                                {studentInfo.weakSubject ? ` • 취약:${studentInfo.weakSubject.toUpperCase()}` : ''}
                            </span>
                        )}
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] font-black text-indigo-900 dark:text-indigo-300 italic">Chief Analyst: Dr Lim</span>
                    </div>
                </div>

                {/* Main Row: Left (뉴로바이오 학습전략시스템 + 학생 정보) - Center (Stepper) - Right (Chief Analyst) */}
                <div className="flex items-center justify-between gap-3 lg:gap-6">
                    {/* Left Title: To the left of '등록' */}
                    <div className="hidden md:flex flex-col justify-center flex-shrink-0 min-w-[220px] lg:min-w-[300px]">
                        <h1 className="text-xs lg:text-sm font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-1.5 whitespace-nowrap">
                            <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse flex-shrink-0"></span>
                            <span>뉴로바이오 학습전략시스템</span>
                        </h1>
                        {studentInfo ? (
                            <div className="flex items-center gap-2 text-[10px] lg:text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 ml-3.5 whitespace-nowrap">
                                <span>
                                    {studentInfo.grade ? `${studentInfo.grade} / ` : ''}
                                    {studentInfo.age ? `${studentInfo.age}세 / ` : ''}
                                    {studentInfo.gender ? `${studentInfo.gender === 'Male' ? '남성' : studentInfo.gender === 'Female' ? '여성' : studentInfo.gender} / ` : ''}
                                    검사일: {studentInfo.testDate || new Date().toISOString().split('T')[0]}
                                </span>
                                {studentInfo.weakSubject && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded border border-slate-200 dark:border-slate-700 text-[10px]">
                                        취약 과목: {studentInfo.weakSubject.toUpperCase()}
                                    </span>
                                )}
                            </div>
                        ) : (
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-0.5 ml-3.5 whitespace-nowrap">
                                Official Diagnostic Protocol
                            </p>
                        )}
                    </div>

                    {/* Center Stepper: Steps from '등록' to '결과' */}
                    <div className="flex-1 min-w-0 max-w-4xl mx-auto w-full px-1 sm:px-2">
                        {/* Status Bar Top Line */}
                        <div className="flex items-center justify-between mb-2 text-xs">
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold text-[11px]">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse"></span>
                                    STEP {currentIndex + 1} / {steps.length}
                                </span>
                                <span className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">
                                    {steps[currentIndex]?.label}
                                </span>
                            </div>
                            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                진행률: <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{Math.round(progressPercentage)}%</span>
                            </div>
                        </div>

                        {/* Precision Progress Bar */}
                        <div className="relative mb-2.5">
                            <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-800 rounded-full z-0" />
                            <div
                                className="absolute top-1/2 -translate-y-1/2 left-0 h-1 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full z-10 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                                style={{ width: `${progressPercentage}%` }}
                            />

                            {/* Step Nodes */}
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
                                                className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-black transition-all duration-300 relative
                                                    ${isCompleted 
                                                        ? 'bg-indigo-600 text-white shadow-sm hover:scale-110' 
                                                        : ''}
                                                    ${isCurrent 
                                                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border-2 border-indigo-600 dark:border-indigo-400 ring-4 ring-indigo-100 dark:ring-indigo-950/80 shadow-md scale-110' 
                                                        : ''}
                                                    ${!isCompleted && !isCurrent 
                                                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-300 dark:border-slate-700' 
                                                        : ''}
                                                `}
                                            >
                                                {isCompleted ? (
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                ) : (
                                                    <span>{index + 1}</span>
                                                )}

                                                {isClickable && (
                                                    <div className="absolute -bottom-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 dark:bg-slate-800 text-white text-[10px] px-2 py-0.5 rounded shadow-md whitespace-nowrap pointer-events-none z-50">
                                                        이 단계로 이동
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
                                        className={`text-[10px] sm:text-[11px] font-bold text-center w-10 sm:w-14 truncate transition-colors 
                                            ${isClickable ? 'cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400' : ''}
                                            ${isCurrent ? 'text-indigo-600 dark:text-indigo-400 font-black' : ''}
                                            ${isCompleted ? 'text-slate-600 dark:text-slate-300' : ''}
                                            ${!isCompleted && !isCurrent ? 'text-slate-400 dark:text-slate-600' : ''}
                                        `}
                                        onClick={() => handleStepClick(step.id, index)}
                                        title={step.label}
                                    >
                                        {step.shortLabel}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Title: To the right of '결과' */}
                    <div className="hidden md:flex flex-col justify-center text-right flex-shrink-0 min-w-[160px] lg:min-w-[200px]">
                        <p className="text-[9px] lg:text-[10px] text-slate-400 dark:text-slate-500 font-bold tracking-widest uppercase whitespace-nowrap">
                            Official Diagnostic Report
                        </p>
                        <p className="text-xs lg:text-sm font-black text-indigo-900 dark:text-indigo-300 italic mt-0.5 whitespace-nowrap">
                            Chief Analyst: Dr Lim
                        </p>
                    </div>
                </div>

                {/* Bottom Row / Action Toolbar (Inside the SAME single container) */}
                {(bottomContent || children) && (
                    <div className="mt-2.5 pt-2.5 border-t border-slate-200/80 dark:border-slate-800">
                        {bottomContent || children}
                    </div>
                )}
            </div>
        </div>
    );
};
