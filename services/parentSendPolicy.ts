/**
 * 부모 발송 정책 (중복 방지·캡·조용한시간)
 * - 로그 키: {studentId}:{template}:{eventKey} (같은 보고서 재발송 스킵)
 * - 현재 로그는 로컬(localStorage). Phase 2 실발송 시 Supabase 테이블
 *   (kakao_send_logs: student_id, template, event_key UNIQUE, sent_at)로 이관 필요.
 */

export const PARENT_SEND_DAILY_CAP = 2;
export const PARENT_SEND_WEEKLY_CAP = 5;
export const QUIET_START_HOUR = 22;
export const QUIET_END_HOUR = 8;

const STORAGE_KEY = 'nbass_parent_send_log';
const MAX_LOG_ENTRIES = 500;

export interface ParentSendRecord {
    key: string;
    studentId: string;
    template: string;
    eventKey: string;
    at: string;
}

const readLog = (): ParentSendRecord[] => {
    try {
        const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        return Array.isArray(raw) ? raw.filter(r => r && typeof r.key === 'string') : [];
    } catch {
        return [];
    }
};

/** 신규 진단 리포트: 같은 날짜 리포트는 재발송 스킵 */
export const buildReportEventKey = (testDate: string): string => `report:${testDate}`;/** 주간 브리핑: 같은 주차 중복 스킵 (예: 2026-W41) */
export const buildWeeklyEventKey = (d: Date = new Date()): string => {
    const y = d.getFullYear();
    const oneJan = new Date(y, 0, 1);
    const week = Math.ceil((((d.getTime() - oneJan.getTime()) / 86400000) + oneJan.getDay() + 1) / 7);
    return `weekly:${y}-W${String(week).padStart(2, '0')}`;
};
/** 마일스톤: 임계값당 평생 1회 (예: streak-7) */
export const buildMilestoneEventKey = (kind: string, threshold: number | string): string =>
    `milestone:${kind}-${threshold}`;
/** 월간: 같은 월 중복 스킵 */
export const buildMonthlyEventKey = (d: Date = new Date()): string =>
    `monthly:${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
/** D-day: 지정별 1회 (예: D-7) */
export const buildDdayEventKey = (label: string): string => `dday:${label}`;

export const buildSendKey = (studentId: string, template: string, eventKey: string): string =>
    `${studentId}:${template}:${eventKey}`;

const dayStr = (d: Date): string => d.toISOString().slice(0, 10);
const weekKeyOf = (d: Date): string => {
    const y = d.getFullYear();
    const oneJan = new Date(y, 0, 1);
    const week = Math.ceil((((d.getTime() - oneJan.getTime()) / 86400000) + oneJan.getDay() + 1) / 7);
    return `${y}-W${String(week).padStart(2, '0')}`;
};

export type SendBlockReason = 'DUPLICATE' | 'DAILY_CAP' | 'WEEKLY_CAP' | 'QUIET_HOURS';

import type { ParentTemplateType } from './parentTemplates';
import { PARENT_TEMPLATE_META } from './parentTemplates';

/** 템플릿별 중복 키 생성 (레지스트리의 eventKeyKind 준수) */
export function eventKeyForTemplate(template: ParentTemplateType, arg = ''): string {
    const kind = PARENT_TEMPLATE_META[template]?.eventKeyKind || 'recordId';
    switch (kind) {
        case 'once': return 'once:default';
        case 'reportDate': return buildReportEventKey(arg);
        case 'week': return buildWeeklyEventKey();
        case 'month': return buildMonthlyEventKey();
        case 'milestone': return `milestone:${arg || 'general'}`;
        case 'dday': return buildDdayEventKey(arg);
        case 'recordId':
        default: return `record:${arg || 'default'}`;
    }
}

export function checkParentSendPolicy(
    studentId: string,
    template: string,
    eventKey: string,
    now: Date = new Date(),
    opts?: { maxPerWeek?: number }
): { ok: true } | { ok: false; reason: SendBlockReason } {
    const log = readLog();
    const key = buildSendKey(studentId, template, eventKey);
    if (log.some(r => r.key === key)) return { ok: false, reason: 'DUPLICATE' };
    const today = dayStr(now);
    const week = weekKeyOf(now);
    const mine = log.filter(r => r.studentId === studentId);
    if (mine.filter(r => r.at.slice(0, 10) === today).length >= PARENT_SEND_DAILY_CAP) {
        return { ok: false, reason: 'DAILY_CAP' };
    }
    const weekSends = mine.filter(r => weekKeyOf(new Date(r.at)) === week);
    if (weekSends.length >= PARENT_SEND_WEEKLY_CAP) {
        return { ok: false, reason: 'WEEKLY_CAP' };
    }
    if (opts?.maxPerWeek !== undefined) {
        const sameTpl = weekSends.filter(r => r.template === template).length;
        if (sameTpl >= opts.maxPerWeek) return { ok: false, reason: 'WEEKLY_CAP' };
    }
    const h = now.getHours();
    if (h >= QUIET_START_HOUR || h < QUIET_END_HOUR) return { ok: false, reason: 'QUIET_HOURS' };
    return { ok: true };
}

export function recordParentSend(studentId: string, template: string, eventKey: string): void {
    try {
        const log = readLog();
        log.unshift({
            key: buildSendKey(studentId, template, eventKey),
            studentId,
            template,
            eventKey,
            at: new Date().toISOString(),
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(log.slice(0, MAX_LOG_ENTRIES)));
    } catch { /* ignore */ }
}

export function getParentSendLog(studentId?: string): ParentSendRecord[] {
    const log = readLog();
    return studentId ? log.filter(r => r.studentId === studentId) : log;
}
