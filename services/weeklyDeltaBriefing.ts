import type { AssessmentResult } from '../types';

// 주간 델타 브리핑 (최근 검사 vs 이전 검사 변화량 중심, 실측값만 사용)
export interface DeltaLine {
    label: string;
    before: string;
    after: string;
    trend: 'up' | 'down' | 'same';
    improved: boolean;
}

export interface DeltaBriefing {
    isFirst: boolean;
    lines: DeltaLine[];
    praises: string[];
}

const fmtSleep = (v: any): string | null => {
    if (typeof v !== 'number' || isNaN(v) || v <= 0) return null;
    return `${v}시간`;
};
const fmtScore = (v: any, unit = '점'): string | null => {
    if (typeof v !== 'number' || isNaN(v)) return null;
    return `${v}${unit}`;
};

const cmp = (label: string, b: string | null, a: string | null, lowerIsBetter: boolean): DeltaLine | null => {
    if (b === null || a === null) return null;
    const bn = parseFloat(b);
    const an = parseFloat(a);
    if (isNaN(bn) || isNaN(an)) {
        return { label, before: b, after: a, trend: 'same', improved: false };
    }
    const trend = an > bn ? 'up' : an < bn ? 'down' : 'same';
    const improved = trend === 'same' ? false : (lowerIsBetter ? trend === 'down' : trend === 'up');
    return { label, before: b, after: a, trend, improved };
};

export const buildDeltaBriefing = (
    current: AssessmentResult,
    previous?: AssessmentResult | null
): DeltaBriefing => {
    const cs = current.survey || ({} as any);
    const sleepOf = (r: AssessmentResult): string | null =>
        fmtSleep(r.protocol?.sleepHours ?? (r.analytics as any)?.avgSleepHours);

    if (!previous) {
        const lines: DeltaLine[] = [];
        const push = (l: DeltaLine | null) => { if (l) lines.push(l); };
        push({ label: '수면', before: '—', after: sleepOf(current) || '미입력', trend: 'same', improved: false });
        push({ label: '불안(BAI)', before: '—', after: fmtScore(cs.bai) || '미입력', trend: 'same', improved: false });
        push({ label: '불면(ISI)', before: '—', after: fmtScore(cs.isi) || '미입력', trend: 'same', improved: false });
        return { isFirst: true, lines, praises: [] };
    }

    const ps = previous.survey || ({} as any);
    const lines: DeltaLine[] = [];
    const push = (l: DeltaLine | null) => { if (l) lines.push(l); };
    push(cmp('수면', sleepOf(previous), sleepOf(current), false));
    push(cmp('불안(BAI)', fmtScore(ps.bai), fmtScore(cs.bai), true));
    push(cmp('불면(ISI)', fmtScore(ps.isi), fmtScore(cs.isi), true));
    push(cmp('피로 증상', fmtScore(ps.fatigueSymptomsCount, '개'), fmtScore(cs.fatigueSymptomsCount, '개'), true));

    const praises = lines
        .filter(l => l.improved)
        .map(l => `${l.label} 개선(${l.before}→${l.after})`);

    return { isFirst: false, lines, praises };
};

export const renderDeltaLine = (l: DeltaLine): string => {
    const arrow = l.trend === 'up' ? '▲' : l.trend === 'down' ? '▼' : '→';
    const mark = l.improved ? ' 개선' : '';
    return `✦ ${l.label}: ${l.before} → ${l.after} (${arrow}${mark})`;
};
