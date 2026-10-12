import type { GradeRecord } from '../types';

// 성적 하락 감지 (최신 2회차 평균 등급 비교, 낮을수록 좋은 등급제)
// 루프 닫기용: 하락 시 컨디션 재검사를 권고한다.
// UI 출력 형태(dropped/prevAvg/latestAvg/delta/prevName/latestName) 불변, 추가 필드만 확장.
export interface GradeDropInfo {
    dropped: boolean;
    prevAvg: number | null;
    latestAvg: number | null;
    /** +면 악화 (등급 숫자 상승) */
    delta: number;
    prevName: string;
    latestName: string;
    /** 평균은 안정적이나 특정 과목이 급락한 마스킹 케이스 (추가 정보, 기존 UI 무시 가능) */
    droppedSubjects?: { subjectId: string; prevGrade: number; latestGrade: number; delta: number }[];
    /** 최근 연속 하락 횟수 (평균 기준) */
    consecutiveDeclines?: number;
}

const clampGradeOrNull = (g: unknown): number | null => {
    if (typeof g !== 'number' || !Number.isFinite(g)) return null;
    const r = Math.round(g);
    return r >= 1 && r <= 9 ? r : null;
};

const avgOf = (r: GradeRecord): number | null => {
    if (!r || !Array.isArray((r as any).subjects)) return null;
    const gs = (r as any).subjects.map((s: any) => clampGradeOrNull(s?.grade)).filter((g: number | null): g is number => g !== null);
    if (gs.length === 0) return null;
    const sum = gs.reduce((a, b) => a + b, 0);
    return Number.isFinite(sum) ? sum / gs.length : null;
};

const timeOf = (d: unknown): number => {
    const t = new Date(d as string).getTime();
    return Number.isFinite(t) ? t : Number.NEGATIVE_INFINITY;
};

export const detectGradeDrop = (records: GradeRecord[], threshold = 1): GradeDropInfo => {
    const safeThreshold = Number.isFinite(threshold) ? threshold : 1;
    const empty: GradeDropInfo = { dropped: false, prevAvg: null, latestAvg: null, delta: 0, prevName: '', latestName: '', droppedSubjects: [], consecutiveDeclines: 0 };
    if (!Array.isArray(records) || records.length < 2) return empty;
    const withAvg = [...records]
        .map(r => ({ r, avg: avgOf(r) }))
        .filter((x): x is { r: GradeRecord; avg: number } => x.avg !== null && Number.isFinite(x.avg))
        // 유효 날짜 우선 정렬, 무효 날짜는 뒤가 아닌 앞으로 보내 비교에서 제외되도록 안정 정렬
        .sort((a, b) => timeOf(a.r.examDate) - timeOf(b.r.examDate))
        .filter(x => Number.isFinite(new Date(x.r.examDate as string).getTime()));
    if (withAvg.length < 2) {
        return empty;
    }
    const prev = withAvg[withAvg.length - 2];
    const latest = withAvg[withAvg.length - 1];
    const delta = latest.avg - prev.avg;
    // 과목별 마스킹 탐지: 평균은 유지되나 특정 과목이 2등급 이상 급락한 경우 별도 기록 (dropped 판정은 기존 평균 기준 유지)
    const prevMap = new Map<string, number>();
    for (const s of (prev.r.subjects || [])) {
        const g = clampGradeOrNull((s as any)?.grade);
        if (g !== null && (s as any)?.subjectId) prevMap.set((s as any).subjectId, g);
    }
    const droppedSubjects: GradeDropInfo['droppedSubjects'] = [];
    for (const s of (latest.r.subjects || [])) {
        const g = clampGradeOrNull((s as any)?.grade);
        const id = (s as any)?.subjectId;
        if (g === null || !id) continue;
        const pg = prevMap.get(id);
        if (pg !== undefined) {
            const d = g - pg;
            if (d >= 2) droppedSubjects.push({ subjectId: id, prevGrade: pg, latestGrade: g, delta: d });
        }
    }
    // 연속 하락 횟수 (평균 기준, 최대 전체 이력 스캔)
    let consecutiveDeclines = 0;
    for (let i = withAvg.length - 1; i > 0; i--) {
        if (withAvg[i].avg - withAvg[i - 1].avg >= safeThreshold) consecutiveDeclines++;
        else break;
    }
    return {
        dropped: delta >= safeThreshold,
        prevAvg: prev.avg,
        latestAvg: latest.avg,
        delta,
        prevName: prev.r.examName,
        latestName: latest.r.examName,
        droppedSubjects,
        consecutiveDeclines,
    };
};
