/**
 * 주의력 및 억제력 테스트 (Attention / Go-NoGo Task)
 * 
 * 목적: 충동 조절 능력과 선택적 주의력 측정
 * 방식: 특정 신호(Go)에만 반응하고, 방해 신호(No-Go)에는 반응하지 않음
 */

export interface AttentionResult {
    accuracy: number;        // 정확도 (%)
    avgReactionTime: number; // Go 반응 속도 평균
    mistakes: {
        commission: number;  // No-Go를 눌러버린 실수 (충동성)
        omission: number;    // Go를 안 누른 실수 (주의력 저하)
    };
    totalTrials: number;
    completedAt: string;
}

export const ATTENTION_TEST_CONFIG = {
    totalTrials: 20,           // 총 시도 횟수
    noGoProbability: 0.3,      // No-Go 자극 비율 (30%)
    displayTimeMs: 1000,       // 자극 표시 시간
    interStimulusInterval: 1500, // 자극 간 간격
};

export const ATTENTION_DESCRIPTIONS = {
    excellent: {
        label: '최우수 (상위 5%)',
        desc: '탁월한 주의력과 충동 조절 능력을 보입니다.',
        minAccuracy: 95
    },
    good: {
        label: '양호',
        desc: '안정적인 주의력을 유지하고 있습니다.',
        minAccuracy: 85
    },
    fair: {
        label: '보통',
        desc: '가끔 주의가 산만해지거나 충동적일 수 있습니다.',
        minAccuracy: 70
    },
    poor: {
        label: '주의 필요',
        desc: '주의력 훈련과 환경 통제가 시급합니다.',
        minAccuracy: 0
    }
};

export const getAttentionLevel = (accuracy: number) => {
    if (accuracy >= 95) return ATTENTION_DESCRIPTIONS.excellent;
    if (accuracy >= 85) return ATTENTION_DESCRIPTIONS.good;
    if (accuracy >= 70) return ATTENTION_DESCRIPTIONS.fair;
    return ATTENTION_DESCRIPTIONS.poor;
};
