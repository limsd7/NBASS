import { UserTierService } from '../../services/userTierService';
import { CareType, type ClassificationResult } from '../../types';

// Tier + data-presence checks (moved verbatim; no logic change)
export const resolveNeuroUserTier = (assessmentResult: any) => {
    return UserTierService.getEffectiveTier(
        { id: assessmentResult?.student?.id, name: assessmentResult?.student?.name, email: assessmentResult?.student?.email },
        assessmentResult?.student?.membershipTier || 'free',
        assessmentResult?.student?.name,
        assessmentResult?.student?.email
    );
};

export interface NeuroTierFlags {
    isProOrAbove: boolean;
    isPremiumOrAbove: boolean;
    isVipOrAbove: boolean;
}

export const computeNeuroTierFlags = (userTier: string): NeuroTierFlags => {
    const norm = userTier === 'vip' || userTier === 'premium_plus' ? 'premium' : userTier;
    const isProOrAbove = norm === 'pro' || norm === 'premium' || norm === 'expert';
    const isPremiumOrAbove = norm === 'premium' || norm === 'expert';
    const isVipOrAbove = norm === 'premium' || norm === 'expert';
    return { isProOrAbove, isPremiumOrAbove, isVipOrAbove };
};

export const resolveTopScores = (classificationResult?: ClassificationResult) => {
    if (!classificationResult?.allScores) return [];
    return classificationResult.allScores.slice(0, 3);
};

// Check for valid EEG data
export const checkEegData = (assessmentResult: any): boolean => {
    if (!assessmentResult?.hrv) return false;
    const { eegAlpha, eegLBeta, eegMBeta, eegHBeta, eegTheta, eegGamma } = assessmentResult.hrv;
    // Check if any of the main waves have non-zero values
    return (eegAlpha > 0 || eegLBeta > 0 || eegMBeta > 0 || eegHBeta > 0 || eegTheta > 0 || eegGamma > 0);
};

// Check for valid HRV data (actually measured)
export const checkHrvData = (assessmentResult: any): boolean => {
    if (!assessmentResult?.hrv) return false;
    const { sns, pns, tp } = assessmentResult.hrv;
    const isNotDefaultZero = (sns > 0 || pns > 0 || tp > 0);
    const isAssessedCareType = assessmentResult.careType && assessmentResult.careType !== CareType.UNASSESSED;
    return isNotDefaultZero && isAssessedCareType;
};

// Check for valid Golden Time / Chronotype data
export const checkGoldenTimeData = (assessmentResult: any): boolean => {
    if (!assessmentResult) return false;
    const isAssessedCareType = assessmentResult.careType && assessmentResult.careType !== CareType.UNASSESSED;
    return Boolean(isAssessedCareType);
};

export const resolveProductsForLineup = (recommendedProducts: any[], assessmentResult: any): any[] => {
    if (recommendedProducts && recommendedProducts.length > 0) return recommendedProducts;
    if (assessmentResult?.recommendedProducts && assessmentResult.recommendedProducts.length > 0) return assessmentResult.recommendedProducts;
    return [];
};
