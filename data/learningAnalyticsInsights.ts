/**
 * Learning Analytics Dashboard - Detailed Insights
 * 학습 분석 대시보드 상세 해석 및 권장사항
 * 
 * 모든 CareType에 공통 적용
 * Portable, HRV, Medical Expert 모드 모두 호환
 */

import { CareType } from '../types';

export interface LearningMetricInsight {
    explanation: string;           // 의미 설명 및 영향 예측 (~500자)
    recommendations: string[];     // 개선 방법 (3-5개)
}

export interface LearningAnalyticsInsightSet {
    focusQuality: LearningMetricInsight;      // Focus Quality (순공 비율)
    goalAchievement: LearningMetricInsight;   // Goal Achievement (목표 달성률)
    goldenTime: LearningMetricInsight;        // Golden Time (~300자)
    preferredLocation: LearningMetricInsight; // Preferred Location (~300자)
    studyStreak: LearningMetricInsight;       // Study Streak (~300자)
}

/**
 * 공통 Learning Analytics 해석 (모든 CareType에 적용)
 */
export const LEARNING_ANALYTICS_INSIGHTS: LearningAnalyticsInsightSet = {
    focusQuality: {
        explanation: `**Focus Quality(순공 비율)**은 전체 학습 시간 대비 실제로 집중하여 공부한 시간의 비율을 의미합니다. 이는 '형식적 학습'과 '실질적 학습'을 구분하는 핵심 지표입니다.

**학습 효율에 미치는 영향**: 순공 비율이 10% 증가하면 동일 시간 대비 학습 효율이 약 15-20% 향상됩니다. 예를 들어, 현재 순공 비율이 60%라면 70%로 개선 시 같은 시간을 공부해도 기억에 남는 양이 15-20% 증가합니다. 순공 비율 80% 이상일 때 장기 기억 전환율이 최대화되며, 50% 미만일 경우 공부 시간 대비 성과가 현저히 낮아집니다.

**예측**: 순공 비율을 현재보다 10% 향상시키면 월간 학습 성취도가 약 12-18% 증가하고, 복습 필요 시간은 약 20% 감소합니다.`,
        recommendations: [
            '포모도로 기법 활용: 25분 집중 - 5분 휴식 사이클로 집중력 유지',
            '학습 시작 전 스마트폰을 다른 방에 두고 알림 완전 차단',
            '학습 환경에서 시각적 방해 요소 제거 (정돈된 책상, 단순한 배경)',
            '능동적 학습 전략: 읽기만 하지 말고 쓰기·말하기·문제풀이 병행',
            '하루 목표를 구체적·측정 가능하게 설정 (예: "수학 20문제 풀기")'
        ]
    },

    goalAchievement: {
        explanation: `**Goal Achievement(목표 달성률)**은 설정한 학습 목표를 실제로 완수한 비율을 나타냅니다. 이는 계획 능력, 실행력, 자기 통제 능력을 종합적으로 반영합니다.

**학습 효율에 미치는 영향**: 목표 달성률이 높을수록 자기효능감이 증가하여 학습 동기가 강화되고, 이는 다시 학습 효율을 높이는 선순환을 만듭니다. 목표 달성률 80% 이상일 때 학습 만족도가 급증하며, 지속적인 동기 유지가 가능합니다. 반면 50% 미만일 경우 좌절감으로 인한 학습 회피 행동이 증가합니다.

**예측**: 목표 달성률을 10% 향상시키면 자기효능감이 약 25% 증가하고, 학습 지속 가능성(번아웃 저항력)이 약 30% 개선됩니다. 또한 학습 스트레스는 15% 감소하여 전반적인 학습 만족도가 향상됩니다.`,
        recommendations: [
            'SMART 목표 설정: 구체적·측정가능·달성가능·관련성·시간제한 있는 목표',
            '큰 목표를 작은 단위로 분할: 하루 목표는 2-3시간 내 완수 가능하게',
            '목표 달성 시 즉각적 보상: 작은 성취에도 스스로 인정·칭찬하기',
            '미달성 목표는 자책 대신 원인 분석: "왜 못했나?" → "다음엔 어떻게?"',
            '일일 목표 체크리스트 작성: 시각적으로 진행 상황 확인하며 동기 유지'
        ]
    },

    goldenTime: {
        explanation: `**Golden Time**은 개인의 생체 리듬 분석 결과 집중력과 학습 효율이 최고조에 달하는 시간대입니다. 이 시간대에는 뇌의 전두엽 활성도가 최대이며, 작업 기억 용량이 20-30% 증가합니다. Golden Time을 활용하면 동일 내용을 학습해도 기억 고정 효율이 40% 이상 높아지므로, 이 시간대에는 가장 중요하고 어려운 과목을 배치하세요.`,
        recommendations: [
            'Golden Time에 고난도 과목·신규 개념 학습 집중 배치',
            '이 시간대만큼은 절대 방해받지 않도록 환경 완벽 통제',
            'Golden Time 30분 전 가벼운 스낵·물 섭취로 뇌 에너지 준비'
        ]
    },

    preferredLocation: {
        explanation: `**Preferred Location**은 과거 학습 패턴 분석 결과 가장 높은 집중도와 성과를 보인 학습 장소입니다. 환경의 일관성은 학습 효율에 15-25% 영향을 미칩니다. 익숙한 장소는 뇌가 '학습 모드'로 빠르게 전환되도록 돕는 조건화 효과가 있습니다. 단, 장소에 너무 의존하면 시험장 등 새로운 환경에서 적응이 어려울 수 있으니 주 2회는 다른 장소에서도 연습하세요.`,
        recommendations: [
            '주 5일은 Preferred Location에서, 주 2일은 다른 장소에서 학습',
            '해당 장소의 최적 조건 파악: 조명·온도·소음 수준 일정하게 유지',
            '장소 변경 시 적응 시간 10분 확보: 환경 익숙해지기'
        ]
    },

    studyStreak: {
        explanation: `**Study Streak**는 연속으로 학습을 실천한 일수를 나타냅니다. 연속 학습은 습관 형성의 핵심 지표로, 21일 이상 지속 시 학습이 자동화되어 의지력 소모가 50% 감소합니다. 7일 연속 학습 시 뇌의 신경 회로가 강화되어 같은 노력으로 20% 더 많은 정보를 처리할 수 있습니다. 단, 과도한 연속 학습(30일 이상)은 번아웃 위험이 있으니 주 1회 휴식일을 계획적으로 배치하세요.`,
        recommendations: [
            '하루 최소 학습량 설정: 바쁜 날도 30분은 유지하여 Streak 지키기',
            '7일·14일·21일 단위로 자신에게 보상: 동기 유지',
            '주 1회 휴식일 계획: Streak를 깨지 않되 강도 낮은 복습만 진행'
        ]
    }
};

/**
 * CareType별 추가 맞춤 권장사항
 * 공통 권장사항에 각 CareType 특성에 맞는 추가 권장사항 제공
 */
export const CARETYPE_SPECIFIC_RECOMMENDATIONS: Record<CareType, {
    focusQuality?: string[];
    goalAchievement?: string[];
    goldenTime?: string[];
    preferredLocation?: string[];
    studyStreak?: string[];
}> = {
    [CareType.BURNOUT]: {
        focusQuality: [
            '번아웃 상태: 목표를 50% 축소하고 질 높은 집중 우선',
            '25분 집중도 부담스러우면 15분으로 시작'
        ],
        goalAchievement: [
            '현재 목표의 30-50% 수준으로 대폭 축소 필수',
            '작은 성공 경험 축적이 회복의 시작점'
        ],
        studyStreak: [
            'Streak보다 회복 우선: 하루 걸러도 괜찮음',
            '2-3일 휴식 후 재시작해도 스스로 용서하기'
        ]
    },

    [CareType.ADRENAL]: {
        goldenTime: [
            '부신피로 시 에너지 리듬 변동 심함: Golden Time이 일정하지 않을 수 있음',
            '매일 컨디션 체크 후 유연하게 학습 시간 조정'
        ],
        studyStreak: [
            '에너지가 있을 때만 학습: 억지로 Streak 유지하지 말 것'
        ]
    },

    [CareType.STRESS_OVERLOAD]: {
        focusQuality: [
            '스트레스 과부하: 걱정 시간 10분 제한 후 학습 시작',
            '집중 안 되면 5분 마음챙김 명상 후 재시도'
        ],
        goalAchievement: [
            '완벽주의 경계: "충분히 좋은" 목표로 조정'
        ]
    },

    [CareType.SLEEP]: {
        focusQuality: [
            '수면 부족 시 순공 비율 급락: 학습 시간보다 수면 시간 확보 우선',
            '15-20분 파워냅으로 오후 집중력 회복'
        ],
        goldenTime: [
            '수면 부족 시 Golden Time이 짧아짐: 이 시간에 최대한 집중'
        ]
    },

    [CareType.ANXIETY_TENSION]: {
        focusQuality: [
            '"5분만 해보기" 전략: 시작 부담 낮추기',
            '불안 올라오면 4-7-8 호흡 후 재시작'
        ],
        goalAchievement: [
            '목표 미달 시 자책 금지: 원인 분석 후 목표 재조정'
        ]
    },

    [CareType.LOW_ENERGY]: {
        focusQuality: [
            '무기력 시 10분 시도가 20분으로 자연 연장됨: 시작이 핵심',
            '에너지 높은 시간대에 중요 과목 몰아서 처리'
        ],
        goalAchievement: [
            '최소 목표만 설정: "오늘 30분" 정도로 부담 최소화'
        ],
        studyStreak: [
            '10분이라도 매일: Streak만 유지해도 성공'
        ]
    },

    [CareType.DEPRESSION_AMOTIVATION]: {
        focusQuality: [
            '혼자보다 스터디 그룹: 외부 동기 활용',
            '완벽하게 하지 않아도 됨: 시작만 해도 성공'
        ],
        goalAchievement: [
            '단 하나라도 달성하면 크게 칭찬하기',
            '목표 미달 시 자기 용서가 우선'
        ],
        studyStreak: [
            'Streak 깨져도 괜찮음: 언제든 다시 시작'
        ]
    },

    [CareType.BRAIN_FATIGUE]: {
        focusQuality: [
            '뇌피로 시 디지털 디톡스: 화면 없는 종이 교재 활용',
            '휴식 시간에 절대 스마트폰 보지 않기'
        ],
        goldenTime: [
            '오전 시간대가 Golden Time: 오후는 급격히 하락'
        ]
    },

    [CareType.HYPERSENSITIVE]: {
        focusQuality: [
            '소음 차단 이어폰 필수: 환경 통제가 순공 비율 좌우',
            '백색 소음 활용으로 불규칙 소음 차단'
        ],
        preferredLocation: [
            '과민형은 환경 일관성이 더욱 중요: 90% 이상 같은 장소'
        ]
    },

    [CareType.ATTENTION_DEFICIT]: {
        focusQuality: [
            '15분 집중 - 5분 휴식: 25분도 길면 더 짧게',
            '능동적 학습 필수: 손 움직이며 공부'
        ],
        goalAchievement: [
            '타이머·체크리스트 활용: 외부 구조화 도구 활용',
            '목표는 1-2시간 내 완수 가능한 작은 단위로'
        ]
    },

    [CareType.CONCENTRATION]: {
        focusQuality: [
            '집중력 저하형: 스마트폰을 다른 방에 두는 것만으로도 20% 향상',
            '수면·영양·운동 중 가장 문제되는 영역부터 개선'
        ]
    },

    [CareType.CIRCULATION]: {
        focusQuality: [
            '50분 이상 연속 앉아있지 말 것: 순환 저하로 집중력 급락',
            '휴식 시간에 반드시 일어나서 스트레칭'
        ],
        goldenTime: [
            '장시간 앉은 후에는 Golden Time도 효율 저하: 움직임 필수'
        ]
    },

    [CareType.HEALTHY]: {
        focusQuality: [
            '현재 상태 유지가 핵심: 과신하여 무리하지 말 것',
            '능동적 학습·간격 반복으로 더 높은 수준 도약'
        ],
        goalAchievement: [
            '꾸준함 우선: 목표 급상향보다 지속 가능성 유지'
        ]
    },

    [CareType.UNASSESSED]: {
        focusQuality: [
            '완전한 검사 완료 시 맞춤형 권장사항 제공 가능',
            '일반적으로 25분 집중 - 5분 휴식이 효과적'
        ],
        goalAchievement: [
            '데이터 보완 후 개인 맞춤 목표 설정 가능'
        ]
    }
};

/**
 * Learning Analytics 권장사항 가져오기
 * 공통 권장사항 + CareType별 추가 권장사항 결합
 */
export const getLearningRecommendations = (
    careType: CareType,
    metric: keyof LearningAnalyticsInsightSet
): string[] => {
    const baseRecommendations = LEARNING_ANALYTICS_INSIGHTS[metric].recommendations;
    const specificRecommendations = CARETYPE_SPECIFIC_RECOMMENDATIONS[careType]?.[metric] || [];

    return [...baseRecommendations, ...specificRecommendations];
};

/**
 * Learning Analytics 설명 가져오기
 */
export const getLearningExplanation = (
    metric: keyof LearningAnalyticsInsightSet
): string => {
    return LEARNING_ANALYTICS_INSIGHTS[metric].explanation;
};
