/**
 * 정밀 재검사(2주 추적) 인앱 리마인더 로직 (P1-2)
 *
 * - 진단 → 실행 → 재진단 루프를 닫기 위해, 최근 진단일 기준으로 재검사 적기를 산출합니다.
 * - 순수 함수이므로 UI와 분리되어 테스트/재사용이 쉽습니다.
 */

export type FollowUpStage = 'none' | 'upcoming' | 'due' | 'overdue';

export interface FollowUpReminderStatus {
    hasBaseline: boolean;
    lastDate: string | null;
    daysElapsed: number;
    intervalDays: number;
    daysRemaining: number;
    due: boolean;
    stage: FollowUpStage;
    label: string;
}

export const DEFAULT_FOLLOWUP_INTERVAL_DAYS = 14;

const empty = (intervalDays: number): FollowUpReminderStatus => ({
    hasBaseline: false,
    lastDate: null,
    daysElapsed: 0,
    intervalDays,
    daysRemaining: intervalDays,
    due: false,
    stage: 'none',
    label: '',
});

export const computeFollowUpReminder = (
    lastDate: string | null | undefined,
    intervalDays: number = DEFAULT_FOLLOWUP_INTERVAL_DAYS,
    now: Date = new Date(),
): FollowUpReminderStatus => {
    if (!lastDate) return empty(intervalDays);

    const last = new Date(lastDate);
    if (Number.isNaN(last.getTime())) return empty(intervalDays);

    const daysElapsed = Math.floor((now.getTime() - last.getTime()) / 86_400_000);
    const daysRemaining = intervalDays - daysElapsed;

    let stage: FollowUpStage;
    let label: string;

    if (daysRemaining > 3) {
        stage = 'upcoming';
        label = `다음 정밀 재검사까지 ${daysRemaining}일 남았습니다.`;
    } else if (daysRemaining > 0) {
        stage = 'upcoming';
        label = `정밀 재검사 시기가 다가옵니다 (D-${daysRemaining}).`;
    } else if (daysRemaining === 0) {
        stage = 'due';
        label = '오늘(Day 0)이 정밀 재검사 적기입니다. 지금 다시 진단해 변화를 확인해 보세요.';
    } else {
        stage = 'overdue';
        label = `재검사 권장 시기가 ${-daysRemaining}일 지났습니다. 지금 재진단하면 변화 추이를 확인할 수 있습니다.`;
    }

    return {
        hasBaseline: true,
        lastDate,
        daysElapsed,
        intervalDays,
        daysRemaining,
        due: daysRemaining <= 0,
        stage,
        label,
    };
};