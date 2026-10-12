import React from 'react';

export interface NextStepRoadmapBannerProps {
    userTier: string;
    onNextStepAction?: (targetTier: 'pro' | 'premium' | 'habits' | 'schedule' | 'grades') => void;
    onFollowUp?: () => void;
    variant?: 'hero' | 'bottom';
}

export const NextStepRoadmapBanner: React.FC<NextStepRoadmapBannerProps> = ({
    userTier,
    onNextStepAction,
    onFollowUp,
    variant = 'bottom'
}) => {
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
                badgeText: '✨ PREMIUM 전용 핵심 가이드',
                subBadge: 'PRO 미제공 · 프리미엄 전용 기능',
                message: '진단 결과를 확인하셨습니다! 이제 성적관리를 이용해 공부 관리를 더 효율적으로 진행하세요. [성적관리]와 [공부습관 교정]은 PRO에서는 제공되지 않는 PREMIUM 회원 전용 솔루션입니다.',
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
        <div className={`w-full p-5 sm:p-6 rounded-2xl md:rounded-[2rem] border transition-all relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-lg ${nextStepData.bannerBg} ${variant === 'bottom' ? 'mt-8 border-2 shadow-indigo-500/10 print-avoid-break' : 'mt-4'}`}>
            <div className="flex items-start sm:items-center gap-4">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${nextStepData.iconBg} border ${nextStepData.iconBorder} shadow-sm`}>
                    {nextStepData.bannerIcon}
                </div>
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-3 py-0.5 rounded-full text-xs font-black border ${nextStepData.badgeClass}`}>
                            {nextStepData.badgeText}
                        </span>
                        <span className="text-xs font-black text-slate-500 dark:text-slate-400">
                            {nextStepData.subBadge}
                        </span>
                    </div>
                    <p className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 leading-snug">
                        {nextStepData.message}
                    </p>
                </div>
            </div>

            <div className="shrink-0 flex items-center gap-2 self-end md:self-center flex-wrap">
                {userTier === 'premium' && (
                    <button
                        onClick={() => onNextStepAction && onNextStepAction('habits')}
                        className="px-4 py-3 bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-xl font-bold text-xs sm:text-sm transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-xs"
                        title="수험생 공부습관 교정 클리닉 바로가기"
                    >
                        <span>💡</span>
                        <span>습관교정 클리닉</span>
                        <span className="font-mono text-base">➔</span>
                    </button>
                )}
                <button
                    onClick={handleNextStepClick}
                    className={`px-5 py-3 rounded-xl font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer ${nextStepData.buttonStyle}`}
                >
                    <span>{nextStepData.buttonIcon}</span>
                    <span>{nextStepData.buttonText}</span>
                    <span className="font-mono text-base">➔</span>
                </button>
            </div>
        </div>
    );
};
