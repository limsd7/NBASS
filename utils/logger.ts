/**
 * 경량 관측성(Observability) 로거
 *
 * - 진단 파이프라인/AI 호출의 소요시간(durationMs)과 성공·실패를 일관된 포맷으로 기록합니다.
 * - 최근 이벤트를 메모리 링 버퍼에 보관하여 문제 발생 시 스냅샷(logger.recent())으로 확인할 수 있습니다.
 * - 개발 모드(import.meta.env.DEV)에서만 info/debug를 콘솔에 노출하고, warn/error는 항상 노출합니다.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEvent {
    level: LogLevel;
    scope: string;
    message: string;
    durationMs?: number;
    meta?: Record<string, unknown>;
    at: number;
}

/** 진단용 링 버퍼 크기 (최근 이벤트 보관 개수) */
const RING_SIZE = 200;
const ring: LogEvent[] = [];

const isDev = (() => {
    try {
        return Boolean((import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV);
    } catch {
        return false;
    }
})();

const push = (event: LogEvent) => {
    ring.push(event);
    if (ring.length > RING_SIZE) ring.shift();
};

const emit = (
    level: LogLevel,
    scope: string,
    message: string,
    meta?: Record<string, unknown>,
    durationMs?: number,
) => {
    const event: LogEvent = { level, scope, message, meta, durationMs, at: Date.now() };
    push(event);

    const suffix = durationMs !== undefined ? ` (${durationMs}ms)` : '';
    if (level === 'error') {
        console.error(`[${scope}] ${message}${suffix}`, meta ?? '');
    } else if (level === 'warn') {
        console.warn(`[${scope}] ${message}${suffix}`, meta ?? '');
    } else if (isDev) {
        console.log(`[${scope}] ${message}${suffix}`, meta ?? '');
    }
};

export const logger = {
    debug: (scope: string, message: string, meta?: Record<string, unknown>) =>
        emit('debug', scope, message, meta),
    info: (scope: string, message: string, meta?: Record<string, unknown>) =>
        emit('info', scope, message, meta),
    warn: (scope: string, message: string, meta?: Record<string, unknown>) =>
        emit('warn', scope, message, meta),
    error: (scope: string, message: string, meta?: Record<string, unknown>) =>
        emit('error', scope, message, meta),
    /** 소요시간을 포함한 이벤트 기록 */
    timing: (scope: string, message: string, durationMs: number, meta?: Record<string, unknown>) =>
        emit('info', scope, message, meta, durationMs),
    /** 최근 로그 스냅샷 (진단용) */
    recent: (): LogEvent[] => [...ring],
};
