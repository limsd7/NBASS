/**
 * 반응 속도 테스트 (Reaction Time Test)
 * 
 * 목적: 뇌의 기본 정보 처리 속도 및 반사 신경 측정
 * 방식: 신호(색상 변경)가 나타나면 최대한 빨리 클릭
 * 
 * 참고: 단순 반응 속도(SRT)는 뇌의 각성도와 신경 전달 효율성을 나타내는 기초 지표
 */

export interface ReactionTimeResult {
    avgTime: number;      // 평균 반응 속도 (ms)
    bestTime: number;     // 최고 반응 속도
    trials: number[];     // 각 시도별 기록
    completedAt: string;
}

export const REACTION_TIME_CONFIG = {
    totalTrials: 5,            // 총 시도 횟수
    minDelayMs: 2000,          // 최소 대기 시간 (2초)
    maxDelayMs: 5000,          // 최대 대기 시간 (5초)
    penaltyMs: 1000,           // 예측 클릭(부정출발) 시 페널티
    tooFastThresholdMs: 100,   // 100ms 미만은 예측 클릭으로 간주
};

export const REACTION_TIME_DESCRIPTIONS = {
    fast: {
        label: '매우 빠름 (상위 10%)',
        desc: '신경 전달 속도가 매우 빠르고 뇌의 각성도가 최상입니다.',
        range: [0, 200]
    },
    normal: {
        label: '보통 (평균)',
        desc: '일반적인 반응 속도입니다. 피로도 관리가 필요할 수 있습니다.',
        range: [201, 300]
    },
    slow: {
        label: '느림 (주의 필요)',
        desc: '뇌 피로도가 높거나 각성 수준이 낮을 수 있습니다.',
        range: [301, 9999]
    }
};

export const getReactionTimeLevel = (avgTime: number) => {
    if (avgTime <= 200) return REACTION_TIME_DESCRIPTIONS.fast;
    if (avgTime <= 300) return REACTION_TIME_DESCRIPTIONS.normal;
    return REACTION_TIME_DESCRIPTIONS.slow;
};
