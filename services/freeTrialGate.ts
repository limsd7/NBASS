/**
 * 무료체험(3분 진단) 1회 소프트 게이트 (공용)
 *
 * - 앱(React)과 랜딩(static HTML)이 동일한 localStorage 키를 공유합니다.
 * - 실제 "1회 보장"은 서버(학생 ID 기준) 검증이 필요하며, 본 모듈은 UX 안내/차단용입니다.
 */

export const FREE_TRIAL_KEYS = {
    used: 'nbass_free_trial_used',
    lastStarted: 'nbass_free_trial_last_started',
    count: 'nbass_free_trial_count',
} as const;

/** 앱/랜딩 상호 호환을 위한 업그레이드 요청 이벤트명 */
export const FREE_TRIAL_UPGRADE_EVENT = 'nbass_upgrade_prompt';

const read = (key: string): string | null => {
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
};

const write = (key: string, value: string): void => {
    try {
        localStorage.setItem(key, value);
    } catch {
        /* ignore */
    }
};

export const isFreeTrialUsed = (): boolean => read(FREE_TRIAL_KEYS.used) === 'true';

export const getFreeTrialCount = (): number => Number(read(FREE_TRIAL_KEYS.count) || 0) || 0;

export const getFreeTrialLastStarted = (): string | null => read(FREE_TRIAL_KEYS.lastStarted);

export interface FreeTrialStatus {
    used: boolean;
    count: number;
    lastStartedAt: string | null;
}

export const getFreeTrialStatus = (): FreeTrialStatus => ({
    used: isFreeTrialUsed(),
    count: getFreeTrialCount(),
    lastStartedAt: getFreeTrialLastStarted(),
});

export const markFreeTrialUsed = (): FreeTrialStatus => {
    write(FREE_TRIAL_KEYS.used, 'true');
    write(FREE_TRIAL_KEYS.lastStarted, new Date().toISOString());
    write(FREE_TRIAL_KEYS.count, String(getFreeTrialCount() + 1));
    return getFreeTrialStatus();
};

/** 업그레이드(정밀 검사) 유도 이벤트를 발생시킵니다. */
export const requestUpgradePrompt = (): void => {
    try {
        window.dispatchEvent(new CustomEvent(FREE_TRIAL_UPGRADE_EVENT));
    } catch {
        /* ignore */
    }
};