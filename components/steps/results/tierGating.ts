import { MembershipTier, normalizeTier } from '../../../utils/featureGate';
import { UserTierService } from '../../../services/userTierService';
import type { AssessmentResult } from '../../../types';

// Moved verbatim from ResultsView.tsx (no logic change)
export interface TierFlags {
    isExpertUser: boolean;
    isPaidUser: boolean;
    isVipOrAbove: boolean;
    isPremiumOrAbove: boolean;
    isProUsed: boolean;
}

export const resolveUserTier = (result: AssessmentResult): MembershipTier => {
    return UserTierService.getEffectiveTier(
        { id: result.student.id, name: result.student.name, email: result.student.email },
        (result.student.membershipTier as MembershipTier) || 'free',
        result.student.name,
        result.student.email
    );
};

export const computeTierFlags = (
    userTier: MembershipTier,
    currentUserRole: any,
    isAdminUnlocked: boolean,
    result: AssessmentResult,
    history: any[]
): TierFlags => {
    const normTier = normalizeTier(userTier);
    const isExpertUser = currentUserRole === 'MEDICAL_EXPERT' || currentUserRole === 'ACADEMY_EXPERT' || currentUserRole === 'EXPERT' || currentUserRole === 'OWNER' || localStorage.getItem('nbass_current_role') === 'MEDICAL_EXPERT' || localStorage.getItem('nbass_current_role') === 'ACADEMY_EXPERT' || localStorage.getItem('nbass_current_role') === 'EXPERT' || localStorage.getItem('nbass_current_role') === 'OWNER' || isAdminUnlocked;
    const isPaidUser = normTier === 'pro' || normTier === 'premium' || normTier === 'expert' || isExpertUser || (result?.student?.membershipTier && result.student.membershipTier !== 'free');

    const isVipOrAbove = normTier === 'premium' || normTier === 'expert' || isExpertUser;

    const isPremiumOrAbove = normTier === 'premium' || normTier === 'expert' || isExpertUser;
    const isProUsed = normTier === 'pro' && !isExpertUser && UserTierService.isProAssessmentUsed(result.student, history);

    return { isExpertUser, isPaidUser, isVipOrAbove, isPremiumOrAbove, isProUsed };
};
