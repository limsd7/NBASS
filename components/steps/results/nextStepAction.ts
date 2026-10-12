import type { MembershipTier } from '../../../utils/featureGate';
import type { AssessmentResult } from '../../../types';

// Moved verbatim from ResultsView.tsx handleNextStepAction (branch bodies unchanged)
export type NextStepTarget = 'pro' | 'premium' | 'habits' | 'schedule' | 'grades';

export interface NextStepDeps {
    onStartFollowUp?: (result: AssessmentResult) => void;
    result: AssessmentResult;
    onMenuChange?: (menu: any) => void;
    setActiveMenu: (menu: any) => void;
    setSubscriptionReason: (reason: string) => void;
    setSubscriptionInitialTier: (tier: MembershipTier | undefined) => void;
    setIsSubscriptionModalOpen: (open: boolean) => void;
}

export const createNextStepActionHandler = (deps: NextStepDeps) => {
    const { onStartFollowUp, result, onMenuChange, setActiveMenu, setSubscriptionReason, setSubscriptionInitialTier, setIsSubscriptionModalOpen } = deps;
    return (targetTier: NextStepTarget) => {
        if (targetTier === 'pro') {
            if (onStartFollowUp) {
                onStartFollowUp(result);
            } else {
                setSubscriptionReason('PRO 1회 스타터 패스: 추가적인 정밀 설문조사를 통해 16P 전문 심층 종합 분석 리포트를 제공합니다.');
                setSubscriptionInitialTier('pro');
                setIsSubscriptionModalOpen(true);
            }
        } else if (targetTier === 'premium') {
            setSubscriptionReason('PREMIUM 정기구독: 실전 성적 관리 및 수험생 공부습관 교정 클리닉(Habit Clinic)을 무제한 이용할 수 있습니다.');
            setSubscriptionInitialTier('premium');
            setIsSubscriptionModalOpen(true);
        } else if (targetTier === 'habits') {
            if (onMenuChange) {
                onMenuChange('habits');
            } else if (setActiveMenu) {
                setActiveMenu('habits');
            }
        } else if (targetTier === 'schedule') {
            if (onMenuChange) {
                onMenuChange('schedule');
            } else if (setActiveMenu) {
                setActiveMenu('schedule');
            }
        } else if (targetTier === 'grades') {
            if (onMenuChange) {
                onMenuChange('grades');
            } else if (setActiveMenu) {
                setActiveMenu('grades');
            }
        }
    };
};
