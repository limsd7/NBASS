/**
 * 인지게임 결과 → 인지 지표 환류 (P1-4)
 *
 * - DigitSpan / DualNBack / StroopTest 등의 원시 점수를 진단에 쓰이는 인지 지표
 *   (작업기억·억제통제·처리속도)로 정규화하여 "훈련 → 지표 → 처방" 환류를 명확히 합니다.
 * - 게임 컴포넌트는 결과 타입을 외부로 노출하지 않으므로, 본 모듈은 원시 점수만 받는
 *   순수 함수로 분리해 나중에 컴포넌트에서 호출만 추가하면 되도록 설계했습니다.
 */
import { CareType } from '../types';

export type CognitiveDomain = 'workingMemory' | 'inhibition' | 'processingSpeed';
export type CognitiveLevel = 'high' | 'average' | 'low';

export interface CognitiveIndicator {
    domain: CognitiveDomain;
    label: string;
    /** 0~100 정규화 점수 */
    score: number;
    level: CognitiveLevel;
    note: string;
}

export interface CognitiveGameInput {
    /** DigitSpan: 최대 성공 자릿수 (예: 4~10) */
    digitSpan?: number;
    /** Dual N-Back: 최대 도달 n (예: 1~4) */
    nBackLevel?: number;
    /** Stroop: 정확도(%) 또는 점수 */
    stroopScore?: number;
}

const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)));
const levelOf = (score: number): CognitiveLevel => (score >= 70 ? 'high' : score >= 45 ? 'average' : 'low');

const LEVEL_NOTE: Record<CognitiveLevel, string> = {
    high: '또래 상위 수준으로 훈련 효과가 유지되고 있습니다.',
    average: '평균 범위입니다. 짧은 훈련을 꾸준히 반복하면 상승 여지가 있습니다.',
    low: '현재 낮은 편입니다. 매일 5~10분 인지 훈련을 권장합니다.',
};

export const deriveCognitiveIndicators = (input: CognitiveGameInput): CognitiveIndicator[] => {
    const out: CognitiveIndicator[] = [];

    if (typeof input.digitSpan === 'number' && input.digitSpan > 0) {
        const score = clamp(((input.digitSpan - 4) / (10 - 4)) * 100);
        out.push({
            domain: 'workingMemory',
            label: '작업기억(숫자폭)',
            score,
            level: levelOf(score),
            note: `숫자폭 ${input.digitSpan}자리 · ${LEVEL_NOTE[levelOf(score)]}`,
        });
    }

    if (typeof input.nBackLevel === 'number' && input.nBackLevel > 0) {
        const score = clamp(((input.nBackLevel - 1) / (4 - 1)) * 100);
        out.push({
            domain: 'workingMemory',
            label: '작업기억(N-Back)',
            score,
            level: levelOf(score),
            note: `${input.nBackLevel}-Back 도달 · ${LEVEL_NOTE[levelOf(score)]}`,
        });
    }

    if (typeof input.stroopScore === 'number' && input.stroopScore > 0) {
        const score = clamp(input.stroopScore);
        out.push({
            domain: 'inhibition',
            label: '억제통제(Stroop)',
            score,
            level: levelOf(score),
            note: `정확도 ${clamp(input.stroopScore)}% · ${LEVEL_NOTE[levelOf(score)]}`,
        });
    }

    return out;
};

/** 인지 지표를 케어타입별 처방 문구로 환류 */
export const recommendFromCognitive = (careType: CareType, indicators: CognitiveIndicator[]): string[] => {
    const recs: string[] = [];
    for (const ind of indicators) {
        if (ind.level === 'low') {
            if (ind.domain === 'workingMemory') {
                recs.push('작업기억 보강: 3분 이중과제(N-Back)·암기 청킹 훈련을 하루 1세트 실시하세요.');
            } else if (ind.domain === 'inhibition') {
                recs.push('억제통제 보강: 색-단어 불일치(Stroop) 훈련으로 충동 억제를 연습하세요.');
            } else {
                recs.push('처리속도 보강: 제한시간 문제풀이를 짧게 반복해 반응 속도를 끌어올리세요.');
            }
        }
    }
    if (recs.length === 0 && indicators.length > 0) {
        recs.push('인지 지표가 양호합니다. 현재 훈련 루틴을 유지하세요.');
    }
    return recs;
};
