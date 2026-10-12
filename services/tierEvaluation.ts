import { UserTierService } from './userTierService';
import type { MembershipTier } from '../utils/featureGate';
import type { StudentInfo } from '../types';
import type { UserRole } from '../components/modals/AuthLoginModal';

// Moved verbatim from App.tsx (no logic change)
export const resolveEffectiveTier = (
    currentUserRole: UserRole | null,
    student: StudentInfo,
    currentUserEmail: string | null,
    currentTier: MembershipTier
): MembershipTier => {
    if (currentUserRole === 'OWNER') {
        return 'expert';
    }
    return UserTierService.getEffectiveTier(
        { id: student.id, name: student.name, email: student.email || currentUserEmail || undefined },
        student.membershipTier || currentTier,
        student.name,
        currentUserEmail || undefined
    );
};

// 회원이 이미 1회 이상 검사를 완료했는지 여부 판정 (히스토리 또는 로컬 저장 기준)
export const checkAssessmentCompleted = (
    student: StudentInfo,
    currentUserEmail: string | null,
    history: any[]
): boolean => {
    return UserTierService.isProAssessmentUsed(
        { id: student.id, name: student.name, email: student.email || currentUserEmail || undefined },
        history
    );
};

// PRO 요금제(1회 스타터 패스) 검사 완료 여부 판정 (1회성 검사 제한)
export const checkProCompleted = (
    currentUserRole: UserRole | null,
    effectiveTier: MembershipTier | undefined,
    hasCompletedAssessment: boolean
): boolean => {
    // 관리자 및 전문가는 1회 제한 제외
    if (
        currentUserRole === 'OWNER' ||
        currentUserRole === 'MEDICAL_EXPERT' ||
        currentUserRole === 'ACADEMY_EXPERT' ||
        currentUserRole === 'EXPERT' ||
        effectiveTier === 'expert'
    ) {
        return false;
    }
    // PRO 및 FREE 등급은 1회 검사 완료 후 재검사 제한 (결제 유도 모달 노출)
    if (effectiveTier !== 'pro' && effectiveTier !== 'free') {
        return false;
    }
    return hasCompletedAssessment;
};

export const checkFreeStudent = (
    currentUserRole: UserRole | null,
    effectiveTier: MembershipTier | undefined,
    step: string
): boolean => {
    // 1. 관리자(오너) 및 전문가는 항상 무료 제한 완전 제외 (EXPERT 동급 이상 권한)
    if (currentUserRole === 'OWNER' || currentUserRole === 'MEDICAL_EXPERT' || currentUserRole === 'ACADEMY_EXPERT' || currentUserRole === 'EXPERT') {
        return false;
    }
    // 2. 유료 등급 (PRO / PREMIUM / PLUS / EXPERT)이면 무료 제한 완전 해제
    if (effectiveTier && effectiveTier !== 'free') {
        return false;
    }
    // 3. 학생 모드 및 무료 등급(FREE)인 경우 검사 진행 및 리포트 열람 시 무료 제한 정확히 적용
    if (currentUserRole === 'STUDENT' || step === 'register' || step === 'surveys' || step === 'protocol' || step === 'analytics' || step === 'results') {
        return true;
    }
    return !effectiveTier || effectiveTier === 'free';
};
