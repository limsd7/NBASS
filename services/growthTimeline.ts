/**
 * 성장 타임라인 집계 (P1-5)
 *
 * - 이력(History) 배열을 시간순으로 정렬해 점수 변화·케어타입·델타를 가진 단일 타임라인 모델로 변환합니다.
 * - 요약(첫/최근 점수, 향상폭, 최고점, 추세)을 함께 계산합니다. 순수 함수로 UI와 분리합니다.
 */
import { AssessmentResult } from '../types';

export interface GrowthEntry {
    date: string;
    careType: string;
    score: number;
    scoreLevel?: string;
    /** 직전 대비 점수 변화 ( 항목은 null) */
    delta: number | null;
}

export interface GrowthSummary {
    count: number;
    firstScore: number | null;
    lastScore: number | null;
    improvement: number | null;
    bestScore: number | null;
    latestCareType: string | null;
    trend: 'up' | 'down' | 'flat' | 'none';
}

type HistoryLike = Partial<AssessmentResult> & { date?: string };

export const buildGrowthTimeline = (history: HistoryLike[]): GrowthEntry[] => {
    const sorted = [...(history || [])]
        .filter((h) => h && typeof h.date === 'string' && h.date)
        .sort((a, b) => new Date(a.date as string).getTime() - new Date(b.date as string).getTime());

    return sorted.map((h, i) => {
        const score = Number(h.score) || 0;
        const prevScore = i > 0 ? Number(sorted[i - 1].score) || 0 : null;
        return {
            date: h.date as string,
            careType: String(h.careType || ''),
            score,
            scoreLevel: (h as { scoreLevel?: string }).scoreLevel,
            delta: prevScore === null ? null : score - prevScore,
        };
    });
};

export const summarizeGrowth = (entries: GrowthEntry[]): GrowthSummary => {
    if (!entries.length) {
        return { count: 0, firstScore: null, lastScore: null, improvement: null, bestScore: null, latestCareType: null, trend: 'none' };
    }

    const first = entries[0];
    const last = entries[entries.length - 1];
    const improvement = last.score - first.score;
    const bestScore = Math.max(...entries.map((e) => e.score));

    let trend: GrowthSummary['trend'] = 'flat';
    if (entries.length >= 2) {
        if (improvement > 0) trend = 'up';
        else if (improvement < 0) trend = 'down';
    } else {
        trend = 'none';
    }

    return {
        count: entries.length,
        firstScore: first.score,
        lastScore: last.score,
        improvement,
        bestScore,
        latestCareType: last.careType || null,
        trend,
    };
};