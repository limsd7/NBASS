/**
 * 부모용 알림톡 템플릿 20종 레지스트리 (단일 정의점)
 * - 발송 정책(빈도 상한· 중복 키 종류)·승인 변수 목록을 한 곳에서 관리
 * - server.ts 허용목록·컴파일 분기·발송 정책이 모두 이 파일을 참조
 * - 상세 내용은 링크(앱)로 전달하고 템플릿 본문은 고정 (재승인 최소화)
 */

export const PARENT_TEMPLATE_IDS = [
    'PARENT_WELCOME',
    'PARENT_NEW_REPORT',
    'PARENT_RECHECK_REPORT',
    'PARENT_PRESCRIPTION_GUIDE',
    'PARENT_WEEKLY_DIGEST',
    'PARENT_MIDWEEK_TIP',
    'PARENT_HABIT_MILESTONE',
    'PARENT_HABIT_ERROR_MILESTONE',
    'PARENT_HABIT_SLUMP',
    'PARENT_GRADE_UP',
    'PARENT_GRADE_DOWN',
    'PARENT_GRADE_GOAL',
    'PARENT_SLEEP_NOTICE',
    'PARENT_SLEEP_IMPROVED',
    'PARENT_CONSULT_SUMMARY',
    'PARENT_DDAY_GUIDE',
    'PARENT_REPORT_READY',
    'PARENT_BURNOUT_ALERT',
    'PARENT_MONTHLY_GROWTH',
    'PARENT_SETTINGS_CHANGED',
    'PARENT_FREE_NOTICE',
    'PARENT_FREE_PRAISE',
] as const;

export type ParentTemplateType = (typeof PARENT_TEMPLATE_IDS)[number];

export type ParentEventKeyKind =
    | 'once'        // 평생 1회 (환영)
    | 'reportDate'  // 진단일별 1회 (같은 리포트 재발송 금지)
    | 'week'        // 주차별 1회
    | 'month'       // 월별 1회
    | 'milestone'   // 임계값별 평생 1회
    | 'recordId'    // 원본 기록별 1회
    | 'dday';       // D-day 지정별 1회 (D-14/D-7/D-1)

export interface ParentTemplateMeta {
    id: ParentTemplateType;
    label: string;
    summary: string;
    eventKeyKind: ParentEventKeyKind;
    /** 주당 상한 (전역 주 5통 캡과 별개로 템플릿별 적용) */
    maxPerWeek: number;
    /** 승인 변수 (#{변수} 자리, 상세는 링크) */
    variables: string[];
}

/**
 * 범용 템플릿 변수 남용 방지 규칙 (코드 강제)
 * - 본문 200자 상한, 서열/순위 표현 금지, 실측치만
 */
export const FREE_TEXT_MAX = 200;
const BANNED_FREE_TEXT = ['전교', '1등', '꼴등', '꼴찌', '순위', '상위 1%', '하위'];

export function sanitizeFreeText(input: string): { text: string; blocked: boolean } {
    const text = String(input || '').slice(0, FREE_TEXT_MAX);
    const blocked = BANNED_FREE_TEXT.some(w => text.includes(w));
    return { text, blocked };
}

export const PARENT_TEMPLATE_META: Record<ParentTemplateType, ParentTemplateMeta> = {
    PARENT_WELCOME: {
        id: 'PARENT_WELCOME', label: '가입 환영·수신 안내', summary: '알림 항목·빈도·거부 방법 안내',
        eventKeyKind: 'once', maxPerWeek: 1, variables: ['학생명'],
    },
    PARENT_NEW_REPORT: {
        id: 'PARENT_NEW_REPORT', label: '새 진단 리포트', summary: '진단 유형 + 처방 요약 + 링크',
        eventKeyKind: 'reportDate', maxPerWeek: 2, variables: ['학생명', '진단유형', '처방요약', '링크'],
    },
    PARENT_RECHECK_REPORT: {
        id: 'PARENT_RECHECK_REPORT', label: '재진단 비교', summary: '이전 대비 변화 1줄 + 링크',
        eventKeyKind: 'reportDate', maxPerWeek: 2, variables: ['학생명', '변화요약', '링크'],
    },
    PARENT_PRESCRIPTION_GUIDE: {
        id: 'PARENT_PRESCRIPTION_GUIDE', label: '처방 이행 가이드', summary: '핵심 처방 1가지 + 부모 역할 1줄',
        eventKeyKind: 'reportDate', maxPerWeek: 1, variables: ['학생명', '핵심처방', '부모역할', '링크'],
    },
    PARENT_WEEKLY_DIGEST: {
        id: 'PARENT_WEEKLY_DIGEST', label: '주간 종합', summary: '실천·수면 요약 + 칭찬 1개',
        eventKeyKind: 'week', maxPerWeek: 1, variables: ['학생명', '주간요약', '칭찬포인트', '링크'],
    },
    PARENT_MIDWEEK_TIP: {
        id: 'PARENT_MIDWEEK_TIP', label: '수요일 코칭 팁', summary: '대화법 1가지',
        eventKeyKind: 'week', maxPerWeek: 1, variables: ['코칭팁'],
    },
    PARENT_HABIT_MILESTONE: {
        id: 'PARENT_HABIT_MILESTONE', label: '실천 마일스톤', summary: '연속 실천 달성 (7일·30일)',
        eventKeyKind: 'milestone', maxPerWeek: 1, variables: ['학생명', '달성내용', '링크'],
    },
    PARENT_HABIT_ERROR_MILESTONE: {
        id: 'PARENT_HABIT_ERROR_MILESTONE', label: '오답 누적 마일스톤', summary: '3색 오답 분석 누적 (10·30·50건)',
        eventKeyKind: 'milestone', maxPerWeek: 1, variables: ['학생명', '달성내용', '링크'],
    },
    PARENT_HABIT_SLUMP: {
        id: 'PARENT_HABIT_SLUMP', label: '실천 이탈 주의', summary: '3일 이상 기록 없음 시 부드러운 환기',
        eventKeyKind: 'week', maxPerWeek: 1, variables: ['학생명', '미기록일수'],
    },
    PARENT_GRADE_UP: {
        id: 'PARENT_GRADE_UP', label: '성적 상승', summary: '상승 과목·과정 칭찬 (서열 표기 금지)',
        eventKeyKind: 'recordId', maxPerWeek: 2, variables: ['학생명', '변동내용', '링크'],
    },
    PARENT_GRADE_DOWN: {
        id: 'PARENT_GRADE_DOWN', label: '성적 하락', summary: '위로 + 다음 계획 1줄 (질책 금지)',
        eventKeyKind: 'recordId', maxPerWeek: 2, variables: ['학생명', '변동내용', '다음계획', '링크'],
    },
    PARENT_GRADE_GOAL: {
        id: 'PARENT_GRADE_GOAL', label: '목표 달성', summary: '목표 과목 달성 축하',
        eventKeyKind: 'milestone', maxPerWeek: 1, variables: ['학생명', '달성내용', '링크'],
    },
    PARENT_SLEEP_NOTICE: {
        id: 'PARENT_SLEEP_NOTICE', label: '수면 리듬 주의', summary: '늦은 취침 패턴 + 권장 1줄',
        eventKeyKind: 'week', maxPerWeek: 1, variables: ['학생명', '관찰내용', '링크'],
    },
    PARENT_SLEEP_IMPROVED: {
        id: 'PARENT_SLEEP_IMPROVED', label: '수면 개선 칭찬', summary: '리듬 개선 시 칭찬',
        eventKeyKind: 'milestone', maxPerWeek: 1, variables: ['학생명', '개선내용'],
    },
    PARENT_CONSULT_SUMMARY: {
        id: 'PARENT_CONSULT_SUMMARY', label: 'AI 상담 요약', summary: '실천 처방 + 응원 요청',
        eventKeyKind: 'recordId', maxPerWeek: 2, variables: ['학생명', '처방요약', '링크'],
    },
    PARENT_DDAY_GUIDE: {
        id: 'PARENT_DDAY_GUIDE', label: 'D-day 컨디셔닝', summary: 'D-14·D-7·D-1 수칙',
        eventKeyKind: 'dday', maxPerWeek: 1, variables: ['학생명', 'D-day', '수칙', '링크'],
    },
    PARENT_REPORT_READY: {
        id: 'PARENT_REPORT_READY', label: '리포트북 발급', summary: '심층 리포트북 발급 완료 + 링크',
        eventKeyKind: 'recordId', maxPerWeek: 2, variables: ['학생명', '링크'],
    },
    PARENT_BURNOUT_ALERT: {
        id: 'PARENT_BURNOUT_ALERT', label: '고위험 주의', summary: '과긴장 감지 시 취침 권고 (월 1회 상한)',
        eventKeyKind: 'week', maxPerWeek: 1, variables: ['학생명', '관찰내용'],
    },
    PARENT_MONTHLY_GROWTH: {
        id: 'PARENT_MONTHLY_GROWTH', label: '월간 성장', summary: '한 달 실천·변화 요약 + 칭찬',
        eventKeyKind: 'month', maxPerWeek: 1, variables: ['학생명', '월간요약', '칭찬포인트', '링크'],
    },
    PARENT_SETTINGS_CHANGED: {
        id: 'PARENT_SETTINGS_CHANGED', label: '수신 설정 변경 확인', summary: '알림 항목 변경 내역 확인',
        eventKeyKind: 'recordId', maxPerWeek: 5, variables: ['변경내용'],
    },
    PARENT_FREE_NOTICE: {
        id: 'PARENT_FREE_NOTICE', label: '소식 범용형', summary: '제목+본문+링크 (변수 남용 방지 규칙 적용)',
        eventKeyKind: 'recordId', maxPerWeek: 2, variables: ['제목', '본문', '링크'],
    },
    PARENT_FREE_PRAISE: {
        id: 'PARENT_FREE_PRAISE', label: '칭찬 범용형', summary: '달성+격려+링크 (서열 표현 금지)',
        eventKeyKind: 'recordId', maxPerWeek: 2, variables: ['학생명', '달성내용', '격려문구', '링크'],
    },
};
