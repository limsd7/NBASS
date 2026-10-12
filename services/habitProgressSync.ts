// Habit 진행 상태 동기화 (기기 간 공유)
// - 서버 우선·로컬 미러 폴백 (게이미피케이션과 동일 패턴)
// - 병합은 필드별 최종 기록 승리(LWW), Realtime은 미사용 (진입 시 pull + 변경 시 push)

export type HabitProgressFieldValue = unknown;

export interface HabitProgressStamped {
    v: HabitProgressFieldValue;
    at: string; // ISO 시각
}

export type HabitProgressFields = Record<string, HabitProgressStamped>;

// 추적 대상 필드 (HabitClinicView progressKey 저장 항목과 일치)
export const HABIT_PROGRESS_KEYS = [
    'checkedIds',
    'successStreak',
    'todayCompleted',
    'pledgeChecked',
    'distanceChecked',
    'dopamineStreak',
    'dopaminePoints',
    'isStreakProtected',
    'streakFrozen',
    'parentSyncSent',
    'parentSyncLog',
    'savedErrorCount',
    'blackoutDeskChecked',
    'chronotype',
    'isUltradianApplied',
    'sleepPledgeChecked',
    'lastActiveDate',
    'adherenceRecorded'
] as const;

const safeValue = (v: unknown): unknown => {
    try {
        JSON.parse(JSON.stringify(v));
        return v;
    } catch {
        return null;
    }
};

// 로컬 스냅샷 + 스탬프 병합 → 서버 전송용 필드 맵 생성
export function stampHabitFields(
    snapshot: Record<string, unknown>,
    prevSnapshot: Record<string, string> | null | undefined,
    prevStamps: Record<string, string> | null | undefined,
    now: string
): HabitProgressFields {
    const fields: HabitProgressFields = {};
    for (const key of HABIT_PROGRESS_KEYS) {
        let str = '';
        try {
            str = JSON.stringify(snapshot[key] ?? null);
        } catch {
            str = 'null';
        }
        const changed = !prevSnapshot || prevSnapshot[key] !== str;
        const at = (changed ? now : prevStamps?.[key]) || now;
        fields[key] = { v: safeValue(snapshot[key]), at };
    }
    return fields;
}

// 필드별 LWW 병합 (원격이 최신인 필드만 채택)
export function mergeHabitFields(
    local: HabitProgressFields | null | undefined,
    remote: HabitProgressFields | null | undefined
): { merged: Record<string, unknown>; stamps: Record<string, string>; changed: boolean } {
    const merged: Record<string, unknown> = {};
    const stamps: Record<string, string> = {};
    let changed = false;
    for (const key of HABIT_PROGRESS_KEYS) {
        const l = local?.[key];
        const r = remote?.[key];
        if (l && r) {
            if (r.at > l.at) {
                merged[key] = r.v;
                stamps[key] = r.at;
                try {
                    if (JSON.stringify(l.v) !== JSON.stringify(r.v)) changed = true;
                } catch {
                    changed = true;
                }
            } else {
                merged[key] = l.v;
                stamps[key] = l.at;
            }
        } else if (r) {
            merged[key] = r.v;
            stamps[key] = r.at;
            changed = true;
        } else if (l) {
            merged[key] = l.v;
            stamps[key] = l.at;
        }
    }
    return { merged, stamps, changed };
}
