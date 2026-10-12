import type { MembershipTier } from '../utils/featureGate';
import { normalizeTier } from '../utils/featureGate';
import type { UserRole } from '../components/modals/AuthLoginModal';

// 구독 게이팅 문구 단일원천 (moved verbatim from App.tsx; no copy change)
export const SUBSCRIPTION_COPY = {
    precisionRequired: '정밀 검사는 1회 리포트(₩24,900) 또는 정기결제(월 ₩19,900) 결제 후 이용 가능합니다.',
    habitsPremiumRequired: '수험생 공부습관 교정 클리닉(Habit Clinic)은 PREMIUM 등급 이상에서 이용 가능합니다.',
} as const;

export type PrecisionGate = 'allow' | 'upgrade_prompt' | 'subscribe';

// 정밀 검사 PRO 이상 게이팅 판정:
// - 최고 관리자는 제한 없이 통과
// 정밀 검사 PRO 이상 게이팅 판정:
// - 최고 관리자는 제한 없이 통과
// - 이미 1회 검사를 완료한 회원(PRO 및 FREE 1회 소진자)은 2회차 재검사 시 업그레이드 프롬프트
// - 1회차 무료 검사는 차단 없이 허용 ('allow')
export const resolvePrecisionAssessmentGate = (
    currentUserRole: UserRole | null,
    hasCompletedAssessment: boolean,
    effectiveTier: MembershipTier | undefined
): PrecisionGate => {
    const isSuperAdmin = currentUserRole === 'OWNER';

    if (!isSuperAdmin && hasCompletedAssessment) {
        return 'upgrade_prompt';
    }

    return 'allow';
};

export const checkHabitsAllowed = (
    effectiveTier: MembershipTier | undefined,
    currentUserRole: UserRole | null
): boolean => {
    return normalizeTier(effectiveTier) === 'premium' || normalizeTier(effectiveTier) === 'expert' || currentUserRole === 'OWNER' || currentUserRole === 'MEDICAL_EXPERT' || currentUserRole === 'EXPERT';
};
