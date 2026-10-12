/**
 * 처방 이행률(Adherence) 산출 (P1-1)
 *
 * - 처방(케어 가이드 + 영양 가이드) 대비 완료 체크(completedExpertGuideItems) 비율을 집계합니다.
 * - 진단→실행→재진단 루프를 하나의 지표로 닫기 위한 순수 로직(UI와 분리).
 */
import { AssessmentResult } from '../types';

export type AdherenceLevel = 'excellent' | 'good' | 'fair' | 'low' | 'unknown';

export interface AdherenceSummary {
    prescribedCount: number;
    completedCount: number;
    /** 0~100 (%) */
    rate: number;
    level: AdherenceLevel;
    label: string;
}

const levelOf = (rate: number): { level: AdherenceLevel; label: string } => {
    if (rate >= 80) return { level: 'excellent', label: '이행 우수 — 처방을 충실히 실천하고 있습니다.' };
    if (rate >= 60) return { level: 'good', label: '이행 양호 — 핵심 처방이 실행되고 있습니다.' };
    if (rate >= 30) return { level: 'fair', label: '이행 보통 — 일부 처방만 실행되고 있습니다.' };
    return { level: 'low', label: '이행 저조 — 핵심 처방 실행을 늘려야 효과가 납니다.' };
};

export const computeAdherence = (result: AssessmentResult | null | undefined): AdherenceSummary => {
    const prescribed = [...(result?.careGuide || []), ...(result?.nutrition || [])];
    const prescribedCount = prescribed.length;
    const completedCount = (result?.completedExpertGuideItems || []).length;

    if (prescribedCount === 0) {
        return {
            prescribedCount: 0,
            completedCount,
            rate: 0,
            level: 'unknown',
            label: '처방 항목이 없습니다.',
        };
    }

    const rate = Math.max(0, Math.min(100, Math.round((completedCount / prescribedCount) * 100)));
    const { level, label } = levelOf(rate);
    return { prescribedCount, completedCount, rate, level, label };
};

// ==================== Habit 분리 지표 (전문가 처방 %와 분리 표기) ====================
// - completedExpertGuideItems에 섞인 'habit:pN' 태그를 별도 집계합니다.
// - 기존 computeAdherence 산식은 손대지 않습니다 (전문가 처방 기준 유지).
// - 대시보드에는 기존 % 아래에 'Habit 실천 x/10' 1줄로 소형 표시합니다.
export const HABIT_PROTOCOL_IDS = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10'] as const;
export type HabitProtocolId = (typeof HABIT_PROTOCOL_IDS)[number];

export interface HabitAdherenceSummary {
    completedCount: number;
    totalCount: number;
    /** 0~100 (%) */
    rate: number;
    level: AdherenceLevel;
    label: string;
    completedIds: HabitProtocolId[];
}

/** 'habit:pN' 태그 목록에서 Habit 실천 현황 집계 (완료 수/10, 기존 level 체계 재사용) */
export const computeHabitAdherence = (
    tags: string[] | null | undefined
): HabitAdherenceSummary => {
    const totalCount = HABIT_PROTOCOL_IDS.length;
    const seen = new Set<string>();
    for (const t of tags || []) {
        if (typeof t !== 'string' || !t.startsWith('habit:')) continue;
        const id = t.slice('habit:'.length).trim();
        if ((HABIT_PROTOCOL_IDS as readonly string[]).includes(id)) seen.add(id);
    }
    const completedIds = (HABIT_PROTOCOL_IDS as readonly string[]).filter(id => seen.has(id)) as HabitProtocolId[];
    const completedCount = completedIds.length;
    const rate = Math.max(0, Math.min(100, Math.round((completedCount / totalCount) * 100)));
    const { level, label } = levelOf(rate);
    return { completedCount, totalCount, rate, level, label, completedIds };
};