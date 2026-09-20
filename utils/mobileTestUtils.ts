/**
 * 모바일 터치 최적화 공용 유틸
 * - PC 마우스 기준 타이머/클릭을 터치 환경에서도 왜곡 없이 측정하기 위함
 */

export const isTouchDevice = (): boolean => {
    try {
        return (
            typeof window !== 'undefined' &&
            ('ontouchstart' in window || (navigator && (navigator as Navigator & { maxTouchPoints?: number }).maxTouchPoints > 0))
        );
    } catch {
        return false;
    }
};

export const now = (): number => {
    try {
        if (typeof performance !== 'undefined' && performance.now) return performance.now();
    } catch { /* ignore */ }
    return Date.now();
};

/** iOS 더블탭 줌/스크롤 간섭 방지용 클래스 */
export const TOUCH_ACTION_NONE = 'touch-none select-none [-webkit-tap-highlight-color:transparent]';
export const TOUCH_ACTION_MANIPULATION = 'touch-manipulation select-none [-webkit-tap-highlight-color:transparent]';

/** 최소 터치 타깃 44px 보장 */
export const MIN_TOUCH_TARGET = 'min-h-[44px] min-w-[44px]';

/** 숫자 입력 시 iOS 자동 줌(16px 미만) 방지 + 숫자 키패드 */
export const NUMERIC_INPUT_PROPS = {
    inputMode: 'numeric' as const,
    autoComplete: 'off' as const,
    autoCorrect: 'off' as const,
    autoCapitalize: 'off' as const,
    spellCheck: false as const,
};

export const haptic = (pattern: number | number[] = 10) => {
    try {
        const nav = navigator as Navigator & { vibrate?: (p: number | number[]) => boolean };
        if (nav.vibrate) nav.vibrate(pattern);
    } catch { /* ignore */ }
};

/**
 * 터치 지연 보정값 (ms)
 * - pointerdown 이벤트의 시간과 실제 처리 시간 차이를 이용해 측정 오차를 줄임
 * - 네이티브 이벤트 시간이 있으면 그것을 기준으로 사용
 */
export const getEventLatency = (e: { timeStamp?: number }): number => {
    try {
        if (e && typeof e.timeStamp === 'number' && e.timeStamp > 0) {
            const diff = now() - e.timeStamp;
            // 비정상적으로 큰 값(백그라운드 등)은 0으로 처리
            if (diff >= 0 && diff < 1000) return diff;
        }
    } catch { /* ignore */ }
    return 0;
};

/** 백그라운드 전환 시 타이머 왜곡을 감지하기 위한 가시성 훅용 헬퍼 */
export const isDocumentHidden = (): boolean => {
    try {
        return typeof document !== 'undefined' && document.hidden;
    } catch {
        return false;
    }
};

/** 반응시간에서 터치 처리 지연을 차감한 보정값 */
export const calibratedReactionMs = (startStamp: number, endEvent?: { timeStamp?: number }): number => {
    const end = now();
    const raw = end - startStamp;
    const latency = endEvent ? getEventLatency(endEvent) : 0;
    // latency는 이미 raw에 포함되어 있으므로 과도한 차감 방지: 최대 50ms까지만 보정
    const correction = Math.min(latency, 50);
    return Math.max(0, Math.round(raw - correction * 0.5));
};
