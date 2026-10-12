import type { MembershipTier } from '../utils/featureGate';
import type { UserRole } from '../components/modals/AuthLoginModal';

// 권한 및 구독 등급별 검사 기록 필터링 (moved verbatim from App.tsx):
// 1) 학생(STUDENT):
//    - 본인 기록만 조회
//    - 무료 회원(FREE)의 경우: 최근 1주일(7일) 이내의 검사 기록만 조회 가능
//    - 유료 회원: 전체 기간 무제한 열람 가능 (오너 지정 승급 포함)
// 2) 의료전문가 & 오너: 전체 기간 히스토리 제한 없이 영구 열람 가능
export const filterDisplayHistory = (
    history: any[],
    currentUserRole: UserRole | null,
    effectiveTier: MembershipTier | undefined,
    studentId: string,
    studentName: string
): any[] => {
    if (currentUserRole === 'STUDENT') {
        const studentNameClean = studentName?.trim().toLowerCase();
        const studentIdClean = studentId?.trim();
        const myRecords = history.filter(h => {
            const matchId = Boolean(studentIdClean && h.student?.id === studentIdClean);
            const matchName = Boolean(studentNameClean && h.student?.name?.trim().toLowerCase() === studentNameClean);
            return matchId || matchName;
        });

        // 무료 회원(free)의 경우 최근 1주일(7일) 이내의 기록만 노출
        const isFreeTier = !effectiveTier || effectiveTier === 'free';
        if (isFreeTier) {
            const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
            const now = Date.now();
            return myRecords.filter(h => {
                const rawDate = h.date || (h.student as any)?.testDate;
                if (!rawDate) return true;
                const testTime = new Date(rawDate).getTime();
                if (isNaN(testTime)) return true;
                return (now - testTime) <= ONE_WEEK_MS;
            });
        }

        return myRecords;
    }
    // MEDICAL_EXPERT, OWNER, ACADEMY_EXPERT 등은 1주일 제한 없이 전체 열람 가능
    return history;
};
