import React from 'react';

export interface ResultsHeroHeaderProps {
    studentInfo?: {
        id?: string;
        name?: string;
        email?: string;
        grade?: string;
        age?: number | string;
        gender?: string;
        testDate?: string;
        weakSubject?: string;
    };
    userTier: string;
    isVipOrAbove: boolean;
    isPremiumOrAbove: boolean;
    isExpertUser: boolean;
    isAdminUnlocked: boolean;
    currentUserRole: string | null;
    careType?: string;
    brainScore?: number;
    viewMode: 'dashboard' | 'comprehensive';
    onViewModeChange: (mode: 'dashboard' | 'comprehensive') => void;
    onPrint: () => void;
    onFollowUp?: () => void;
    onStudyMode: () => void;
    onMentalCare: () => void;
    onPsychologicalAssessment: () => void;
    onNutritionalPrescription: () => void;
    onEditData: () => void;
    onNewAssessment: () => void;
    onOpenManual: () => void;
    onOpenConfig?: () => void;
    onOpenExpertGuide?: () => void;
    onNextStepAction?: (targetTier: 'pro' | 'premium' | 'habits' | 'schedule' | 'grades') => void;
}

export const ResultsHeroHeader: React.FC<ResultsHeroHeaderProps> = ({
    studentInfo,
    userTier,
    isVipOrAbove,
    isPremiumOrAbove,
    isExpertUser,
    isAdminUnlocked,
    currentUserRole,
    careType,
    brainScore,
    viewMode,
    onViewModeChange,
    onPrint,
    onFollowUp,
    onStudyMode,
    onMentalCare,
    onPsychologicalAssessment,
    onNutritionalPrescription,
    onEditData,
    onNewAssessment,
    onOpenManual,
    onOpenConfig,
    onOpenExpertGuide,
    onNextStepAction
}) => {
    const isOwner = currentUserRole === 'OWNER' || (typeof window !== 'undefined' && localStorage.getItem('nbass_current_role') === 'OWNER') || isAdminUnlocked;

    const studentName = studentInfo?.name || '수험생';
    const grade = studentInfo?.grade || '';
    const age = studentInfo?.age ? `${studentInfo.age}세` : '';
    const gender = studentInfo?.gender === 'Male' ? '남성' : studentInfo?.gender === 'Female' ? '여성' : studentInfo?.gender || '';
    const testDate = studentInfo?.testDate || new Date().toISOString().split('T')[0];
    const weakSubject = studentInfo?.weakSubject;

    const getNextStepData = () => {
        if (userTier === 'free') {
            return {
                pillLabel: '추천: 14P 심층 처방전 잠금 해제',
                bannerIcon: '⭐',
                buttonIcon: '🔓',
                iconBg: 'bg-gradient-to-r from-amber-500/20 to-indigo-500/20 text-amber-600 dark:text-amber-400',
                iconBorder: 'border-amber-300 dark:border-amber-700',
                bannerBg: 'bg-gradient-to-r from-amber-50/90 via-indigo-50/50 to-slate-50 dark:from-amber-950/40 dark:via-indigo-950/20 dark:to-slate-900/40 border-amber-300 dark:border-amber-800/80',
                badgeClass: 'bg-gradient-to-r from-amber-100 to-indigo-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700',
                badgeText: '⭐ 5,000원 즉시 할인 혜택 · 첫 달 ₩14,900원',
                subBadge: 'PRO/SUBSCRIBER 혜택',
                message: '1회 무료 정밀 진단 결과를 확인하셨습니다. 정기결제 전환 시 5,000원 즉시 할인(첫 달 14,900원)으로 14P 심층 리포트북, 4대 과목별 처방전, AI 골든타임 시간표가 즉시 잠금 해제됩니다.',
                buttonText: '⭐ 5,000원 할인받고 14P 심층 처방전 잠금 해제 →',
                buttonStyle: 'bg-gradient-to-r from-amber-500 via-indigo-600 to-purple-600 hover:brightness-110 text-white shadow-amber-500/25',
                target: 'pro' as const
            };
        }
        if (userTier === 'pro') {
            return {
                pillLabel: '다음 추천: 성적관리 & 습관교정',
                bannerIcon: '📈',
                buttonIcon: '💎',
                iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
                iconBorder: 'border-indigo-200 dark:border-indigo-800',
                bannerBg: 'bg-gradient-to-r from-indigo-50/90 via-purple-50/50 to-slate-50 dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-slate-900/40 border-indigo-200 dark:border-indigo-800/80',
                badgeClass: 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700',
                badgeText: '💡 다음 추천 단계 · 실전 성적관리 & 공부습관 교정',
                subBadge: 'PREMIUM 정기구독',
                message: '1회 기본 리포트를 확인하셨습니다. 유료 PREMIUM을 이용해 성적 관리 & 수험생 공부습관 교정 클리닉(Habit Clinic)으로 실전 성적 향상을 시작하세요.',
                buttonText: 'PREMIUM으로 성적관리 & 습관교정 시작',
                buttonStyle: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-indigo-500/20',
                target: 'premium' as const
            };
        }
        if (userTier === 'premium') {
            return {
                pillLabel: '다음 추천: 성적관리 & 습관교정',
                bannerIcon: '📈',
                buttonIcon: '📊',
                iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
                iconBorder: 'border-purple-200 dark:border-purple-800',
                bannerBg: 'bg-gradient-to-r from-purple-50/90 via-indigo-50/60 to-slate-50 dark:from-purple-950/40 dark:via-indigo-950/30 dark:to-slate-900/40 border-purple-200 dark:border-purple-800/80',
                badgeClass: 'bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700',
                badgeText: '✨ PREMIUM 전용 핵심 솔루션',
                subBadge: 'PRO 미제공 · 프리미엄 전용 기능',
                message: '진단 결과를 확인하셨습니다! 이제 성적관리를 이용해 공부 관리를 더 효율적으로 진행하세요. 신경인지 진단과 실전 성적을 연계하는 [성적관리]와 [공부습관 교정]은 PRO에서는 제공되지 않는 PREMIUM 전용 솔루션입니다.',
                buttonText: '성적관리 바로가기',
                buttonStyle: 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-purple-500/20',
                target: 'grades' as const
            };
        }
        return {
            pillLabel: '솔루션 가동: 공부습관 교정',
            bannerIcon: '👑',
            buttonIcon: '🧬',
            iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
            iconBorder: 'border-emerald-200 dark:border-emerald-800',
            bannerBg: 'bg-gradient-to-r from-emerald-50/90 via-teal-50/50 to-slate-50 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-slate-900/40 border-emerald-200 dark:border-emerald-800/80',
            badgeClass: 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700',
            badgeText: '👑 최고 등급 솔루션 활성화 완료',
            subBadge: '전 기능 무제한 이용',
            message: '수험생을 위한 전 과정 정밀 진단, 1:1 실시간 AI 학습 클리닉 및 공부습관 교정 클리닉이 모두 가동 중입니다.',
            buttonText: '공부습관 교정 클리닉 바로가기',
            buttonStyle: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-500/20',
            target: 'habits' as const
        };
    };

    const nextStepData = getNextStepData();

    const handleNextStepClick = () => {
        if (onNextStepAction) {
            onNextStepAction(nextStepData.target);
        } else if (nextStepData.target === 'pro' && onFollowUp) {
            onFollowUp();
        }
    };

    return (
        <div className="w-full bg-white dark:bg-slate-800 p-5 sm:p-6 md:p-7 rounded-[2rem] border border-blue-100 dark:border-slate-700 shadow-xl shadow-blue-500/5 relative overflow-hidden transition-colors mb-6 no-print">
            {/* Ambient Background Glow Effect (처음화면 대시보드와 동일한 데코) */}
            <div className="absolute -right-16 -top-16 w-64 h-64 bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-gradient-to-tr from-indigo-500/5 via-blue-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

            {/* Top Row: Left (Student Info & Badges) - Right (Official Seal & Primary CTAs) */}
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                {/* Left: Brand Emblem + Student Meta */}
                <div className="flex items-start sm:items-center gap-4.5">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 flex items-center justify-center">
                        <img
                            src="./NBASS logo.jpg"
                            alt="NBASS Logo"
                            className="w-full h-full object-contain rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700"
                        />
                    </div>

                    <div className="space-y-1">
                        {/* Status Badges Row */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                                <span className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse" />
                                STEP 8 / 8 종합 결과 완료 (100%)
                            </span>

                            {userTier && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                                    <span>🏆</span>
                                    <span>{userTier.toUpperCase()}</span>
                                </span>
                            )}

                            {weakSubject && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                                    취약 과목: {weakSubject.toUpperCase()}
                                </span>
                            )}

                            {careType && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                    CareType: <strong className="ml-1 text-indigo-900 dark:text-indigo-200">{careType}</strong>
                                </span>
                            )}

                            {brainScore !== undefined && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                    Brain Score: <strong className="ml-1 text-emerald-900 dark:text-emerald-200">{brainScore}점</strong>
                                </span>
                            )}
                        </div>

                        {/* Title */}
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                            {studentName} 수험생 <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">정밀 신경인지 진단 결과</span>
                        </h2>

                        {/* Sub Meta Info */}
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 flex-wrap font-medium">
                            <span>{[grade, age, gender].filter(Boolean).join(' · ')}</span>
                            <span className="text-slate-300 dark:text-slate-600">•</span>
                            <span>검사일: {testDate}</span>
                            {studentInfo?.id && (
                                <>
                                    <span className="text-slate-300 dark:text-slate-600">•</span>
                                    <span className="font-mono text-[11px] text-slate-400">ID: {studentInfo.id}</span>
                                </>
                            )}
                        </p>
                    </div>
                </div>

                {/* Right: Official Diagnostic Seal + Primary CTAs */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between lg:justify-center gap-3 shrink-0">
                    <div className="text-left sm:text-right">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block">
                            OFFICIAL DIAGNOSTIC REPORT
                        </span>
                        <span className="text-xs font-black text-indigo-900 dark:text-indigo-300 italic tracking-tight">
                            Chief Analyst: Dr Lim
                        </span>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap w-full sm:w-auto">
                        {/* 2-Week Follow-up Assessment CTA */}
                        {onFollowUp && (
                            <button
                                onClick={onFollowUp}
                                className="px-4 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl font-black text-xs sm:text-sm shadow-md shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                                title="비정상 항목만 3분 내 집중 재평가하는 2주 정기 추적 검사"
                            >
                                <span>⚡</span>
                                <span>2주 추적 검사 (3분)</span>
                            </button>
                        )}

                        {/* Primary Print / PDF Button */}
                        <button
                            onClick={onPrint}
                            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-black text-xs sm:text-sm shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center gap-2 cursor-pointer whitespace-nowrap"
                            title="리포트북 출력 및 PDF 저장"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            <span>{userTier === 'free' ? '🔒 저장 / 인쇄' : '저장 / 인쇄 (PDF)'}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Tier Guidance & Value Recognition Banner (PREMIUM 핵심 차별화 & 다음 단계 안내) */}
            <div className={`mt-5 p-4 sm:p-5 rounded-2xl border transition-all relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm ${nextStepData.bannerBg}`}>
                <div className="flex items-start sm:items-center gap-3.5">
                    <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${nextStepData.iconBg} border ${nextStepData.iconBorder} shadow-sm`}>
                        {nextStepData.bannerIcon}
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black border ${nextStepData.badgeClass}`}>
                                {nextStepData.badgeText}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-2xs">
                                {nextStepData.subBadge}
                            </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-snug font-medium">
                            {nextStepData.message}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
                    {userTier === 'premium' ? (
                        <>
                            <button
                                onClick={() => onNextStepAction ? onNextStepAction('grades') : undefined}
                                className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-black text-xs sm:text-sm shadow-md shadow-purple-500/25 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer whitespace-nowrap"
                                title="성적관리 메뉴로 이동하여 과목별 성적 및 목표 분석 시작"
                            >
                                <span>📊</span>
                                <span>성적관리 바로가기</span>
                                <span className="font-mono text-xs">➔</span>
                            </button>
                            <button
                                onClick={() => onNextStepAction ? onNextStepAction('habits') : undefined}
                                className="px-3.5 py-2.5 bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-xl font-bold text-xs sm:text-sm transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-2xs"
                                title="수험생 공부습관 교정 클리닉으로 이동"
                            >
                                <span>💡</span>
                                <span>습관교정 클리닉</span>
                                <span className="font-mono text-xs">➔</span>
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={handleNextStepClick}
                            className={`px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm shadow-md transition-all hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer whitespace-nowrap ${nextStepData.buttonStyle}`}
                        >
                            <span>{nextStepData.buttonIcon}</span>
                            <span>{nextStepData.buttonText}</span>
                            <span className="font-mono text-xs">➔</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Bottom Row: Left (View Mode Segmented Tab) - Right (Categorized Solutions & Utilities) */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700/60 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                {/* Left: View Mode Switcher (Pill Style Tab) */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-700/60 rounded-xl border border-slate-200/80 dark:border-slate-700 shrink-0">
                    <button
                        onClick={() => onViewModeChange('dashboard')}
                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                            viewMode === 'dashboard'
                                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-300 shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        <span>📊</span>
                        <span>심층 분석 대시보드</span>
                        <span className="px-1.5 py-0.2 bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 text-[10px] rounded font-bold">
                            기본
                        </span>
                    </button>

                    <button
                        onClick={() => onViewModeChange('comprehensive')}
                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                            viewMode === 'comprehensive'
                                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        <span>📋</span>
                        <span>정밀 종합 리포트 (16P 전문)</span>
                        <span className="px-1.5 py-0.2 bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 text-[10px] rounded font-bold">
                            인쇄 일치
                        </span>
                    </button>
                </div>

                {/* Right: Categorized Action Controls */}
                <div className="flex items-center gap-2 flex-wrap xl:justify-end">
                    {/* Solution Modules Group */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Study Mode */}
                        <button
                            onClick={onStudyMode}
                            className={`px-3 py-1.5 font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 text-xs whitespace-nowrap cursor-pointer ${
                                userTier === 'free'
                                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                                    : 'bg-slate-900 dark:bg-slate-700 text-white hover:bg-slate-800 dark:hover:bg-slate-600'
                            }`}
                            title="학습 관리 및 5대 심층 검사"
                        >
                            <svg className="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <span>{userTier === 'free' ? '🔒 Study Mode' : 'Study Mode'}</span>
                        </button>

                        {/* Mental Management (정기결제 전용) */}
                        <button
                            onClick={onMentalCare}
                            className={`px-3 py-1.5 font-bold text-xs rounded-xl transition-colors shadow-sm flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                                !isVipOrAbove
                                    ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 hover:bg-purple-100'
                                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                            }`}
                            title="1:1 맞춤형 수면관리 & 심층 멘탈관리 솔루션 (정기결제 전용)"
                        >
                            <span>🧠</span>
                            <span>{!isVipOrAbove ? '🔒 멘탈 관리' : '멘탈 관리'}</span>
                        </button>

                        {/* Psychological Assessment */}
                        <button
                            onClick={onPsychologicalAssessment}
                            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 font-bold text-xs shadow-sm whitespace-nowrap cursor-pointer ${
                                userTier === 'free'
                                    ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 hover:bg-indigo-100'
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                            }`}
                            title="심리 정밀 인지 평가 (PRO 이상)"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>{userTier === 'free' ? '🔒 심리 인지' : '심리 인지'}</span>
                        </button>

                        {/* Nutritional Prescription - Premium Tier Only */}
                        <button
                            onClick={onNutritionalPrescription}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs shadow-sm transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                                !isPremiumOrAbove
                                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100'
                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            }`}
                            title="1:1 맞춤 영양 처방전 발급 (PREMIUM 전용)"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                            <span>{!isPremiumOrAbove ? '🔒 영양 처방' : '영양 처방'}</span>
                        </button>
                    </div>

                    {/* Vertical Divider between Solutions and Utilities */}
                    <div className="hidden sm:block h-5 w-px bg-slate-200 dark:bg-slate-700 mx-0.5" />

                    {/* Utility Tools Group */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Edit Data */}
                        <button
                            onClick={onEditData}
                            className="px-2.5 py-1.5 rounded-xl transition-colors flex items-center gap-1 font-bold text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 cursor-pointer whitespace-nowrap"
                            title="검사 데이터 직접 수정"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span>{userTier === 'free' ? '🔒 수정' : '수정'}</span>
                        </button>

                        {/* New Assessment */}
                        <button
                            onClick={onNewAssessment}
                            className="px-2.5 py-1.5 rounded-xl transition-colors flex items-center gap-1 font-bold text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 cursor-pointer whitespace-nowrap"
                            title="새로운 정밀 진단 검사 시작"
                        >
                            <span>🔄</span>
                            <span>새 검사</span>
                        </button>

                        {/* Manual (매뉴얼) */}
                        <button
                            onClick={onOpenManual}
                            className="px-2.5 py-1.5 rounded-xl transition-colors flex items-center gap-1 font-bold text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 cursor-pointer whitespace-nowrap"
                            title="NBASS 시스템 사용 매뉴얼"
                        >
                            <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            <span>매뉴얼</span>
                        </button>

                        {/* Owner / Admin Settings */}
                        {isOwner && onOpenConfig && (
                            <button
                                onClick={onOpenConfig}
                                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl transition-all shadow-sm border border-amber-500/30 flex items-center gap-1 cursor-pointer whitespace-nowrap"
                                title="⚙️ 시스템 및 알고리즘 환경설정 (오너/관리자 전용)"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0-.73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                                <span>설정</span>
                            </button>
                        )}

                        {/* Expert Guide (전문가 전용) */}
                        {isExpertUser && onOpenExpertGuide && (
                            <button
                                onClick={onOpenExpertGuide}
                                className="px-2.5 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1 cursor-pointer whitespace-nowrap active:scale-95"
                                title="전문가 가이드 열기"
                            >
                                <svg className="w-3.5 h-3.5 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                <span>Expert</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
