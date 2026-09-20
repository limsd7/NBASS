/**
 * 오답노트 간격반복 정책 검증 (P2-11)
 *
 * - wrongNotePrescriptionEngine의 실제 복습 주기가 이론적 망각곡선 정책과 일치하는지
 *   검증하여 노출합니다(콘텐츠 품질 보증).
 * - 정책(이론) 간격은 1·3·7·14·30일을 표준으로 삼되, 엔진 값이 있으면 그 값을 우선 신뢰합니다.
 */
import { SPACED_REPETITION_INTERVALS } from './wrongNotePrescriptionEngine';

/** 이론적 표준 간격(일) — 단계 0~4 */
export const CANONICAL_INTERVALS_DAYS = [1, 3, 7, 14, 30] as const;

export interface SpacedRepetitionCheck {
    ok: boolean;
    policy: { stage: number; days: number; expected: number; matches: boolean }[];
    deviations: string[];
}

export const verifySpacedRepetitionPolicy = (
    intervals: Record<number, number> = SPACED_REPETITION_INTERVALS,
): SpacedRepetitionCheck => {
    const policy: SpacedRepetitionCheck['policy'] = [];
    const deviations: string[] = [];

    CANONICAL_INTERVALS_DAYS.forEach((expected, stage) => {
        const days = intervals[stage];
        const actual = Number(days);
        const matches = Number.isFinite(actual) && actual === expected;
        policy.push({ stage, days: Number.isFinite(actual) ? actual : 0, expected, matches });
        if (!matches) {
            deviations.push(`단계 ${stage}: 엔진 ${Number.isFinite(actual) ? actual : '미정의'}일 vs 표준 ${expected}일`);
        }
    });

    return { ok: deviations.length === 0, policy, deviations };
};
