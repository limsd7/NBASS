export type MembershipTier = 'free' | 'basic' | 'premium' | 'vip';

export type FeatureKey =
    | 'basic_survey'
    | 'simple_tendency'
    | 'detailed_classification'
    | 'basic_prescription'
    | 'detailed_prescription'
    | 'grade_tracking'
    | 'grade_simulation'
    | 'ai_study_plan'
    | 'cognitive_assessment'
    | 'sleep_analysis'
    | 'hrv_eeg_analysis'
    | 'medical_report'
    | 'expert_consultation'
    | 'prediction_engine'
    | 'data_export'
    | 'unlimited_history';

export const FEATURE_ACCESS: Record<FeatureKey, MembershipTier[]> = {
    basic_survey: ['free', 'basic', 'premium', 'vip'],
    simple_tendency: ['free', 'basic', 'premium', 'vip'],
    detailed_classification: ['basic', 'premium', 'vip'],
    basic_prescription: ['basic', 'premium', 'vip'],
    detailed_prescription: ['premium', 'vip'],
    grade_tracking: ['basic', 'premium', 'vip'],
    grade_simulation: ['premium', 'vip'],
    ai_study_plan: ['premium', 'vip'],
    cognitive_assessment: ['premium', 'vip'],
    sleep_analysis: ['basic', 'premium', 'vip'],
    hrv_eeg_analysis: ['vip'],
    medical_report: ['vip'],
    expert_consultation: ['vip'],
    prediction_engine: ['premium', 'vip'],
    data_export: ['basic', 'premium', 'vip'],
    unlimited_history: ['premium', 'vip']
};

export function canAccess(tier: MembershipTier, feature: FeatureKey): boolean {
    return FEATURE_ACCESS[feature].includes(tier);
}

export const TIER_INFO: Record<MembershipTier, { name: string; color: string; icon: string; price: string; description: string }> = {
    free: { name: '무료 체험', color: 'gray', icon: '🆓', price: '₩0', description: '기본적인 기능 체험' },
    basic: { name: '베이직', color: 'blue', icon: '⭐', price: '₩9,900/월', description: '핵심 분석 및 처방' },
    premium: { name: '프리미엄', color: 'purple', icon: '💎', price: '₩19,900/월', description: '심층 분석 및 AI 플랜' },
    vip: { name: 'VIP', color: 'amber', icon: '👑', price: '₩39,900/월', description: '전문가 상담 및 의료 리포트' }
};

export function getNextTier(current: MembershipTier): MembershipTier | null {
    switch (current) {
        case 'free': return 'basic';
        case 'basic': return 'premium';
        case 'premium': return 'vip';
        case 'vip': return null;
        default: return null;
    }
}
