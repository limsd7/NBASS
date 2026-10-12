import { MembershipTier, normalizeTier } from '../../../utils/featureGate';

// Report tier derivation (moved verbatim from MedicalReport.tsx; no logic change)
export interface ReportTier {
    effectiveReportTier: MembershipTier;
    isProTier: boolean;
    isPlusOrAbove: boolean;
    isPremiumLevelOrAbove: boolean;
    isProOrAbove: boolean;
}

export const resolveReportTier = (
    membershipTier: MembershipTier | undefined,
    studentTier: unknown,
    isPremiumOrAbove: boolean
): ReportTier => {
    const effectiveReportTier: MembershipTier = normalizeTier(membershipTier || (studentTier as MembershipTier) || 'free');
    const isProTier = effectiveReportTier === 'pro';
    const isPlusOrAbove = effectiveReportTier === 'premium' || effectiveReportTier === 'expert';
    const isPremiumLevelOrAbove = effectiveReportTier === 'premium' || isPlusOrAbove || (isPremiumOrAbove && effectiveReportTier !== 'pro' && effectiveReportTier !== 'free');
    const isProOrAbove = isProTier || isPremiumLevelOrAbove;
    return { effectiveReportTier, isProTier, isPlusOrAbove, isPremiumLevelOrAbove, isProOrAbove };
};

// Tier Display Label
export const tierDisplayLabel = (tier: MembershipTier): string => {
    switch (normalizeTier(tier)) {
        case 'expert': return 'EXPERT';
        case 'premium': return 'PREMIUM';
        case 'pro': return 'PRO';
        default: return 'FREE';
    }
};

export const tierBadgeStyle = (tier: MembershipTier): string => {
    switch (normalizeTier(tier)) {
        case 'expert': return 'bg-purple-100 text-purple-800 border-purple-300';
        case 'premium': return 'bg-indigo-100 text-indigo-800 border-indigo-300';
        case 'pro': return 'bg-blue-100 text-blue-800 border-blue-300';
        default: return 'bg-slate-100 text-slate-700 border-slate-300';
    }
};
