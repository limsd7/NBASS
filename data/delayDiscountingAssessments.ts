/**
 * 도파민 보상 지연 테스트 (Delay Discounting Task)
 * 
 * 목적: "공부 의지"가 아닌 "생물학적 인내심" 측정
 * 방식: 밸런스 게임 - "지금 초콜릿 1개 먹기 vs 1시간 참고 2개 먹기"를
 *       다양한 시간/보상으로 테스트
 * 
 * 이유: '즉각 보상'을 선택하는 경향이 높다면, 그 학생은 의지가 약한 게 아니라
 *       전두엽의 보상 회로가 망가진 상태(도파민 중독). 
 *       이 경우 '장기 계획'은 무용지물이며, '10분 단위 초단기 보상' 전략이 필요.
 */

import { CareType } from '../types';

// ========== 1. 테스트 시나리오 정의 ==========
export interface DelayChoice {
    id: string;
    immediateReward: number;     // 즉시 보상 (소량)
    delayedReward: number;       // 지연 보상 (대량)
    delayDays: number;           // 지연 일수
    category: 'short' | 'medium' | 'long';  // 지연 기간 분류
    scenario: string;            // 시나리오 설명
    immediateLabel: string;      // 즉시 보상 라벨
    delayedLabel: string;        // 지연 보상 라벨
}

// 테스트 시나리오들 (다양한 시간/보상 조합)
export const DELAY_DISCOUNTING_SCENARIOS: DelayChoice[] = [
    // 단기 지연 (1일~7일)
    {
        id: 'dd_1',
        immediateReward: 10000,
        delayedReward: 12000,
        delayDays: 1,
        category: 'short',
        scenario: '용돈 선택',
        immediateLabel: '오늘 10,000원',
        delayedLabel: '내일 12,000원'
    },
    {
        id: 'dd_2',
        immediateReward: 15000,
        delayedReward: 20000,
        delayDays: 3,
        category: 'short',
        scenario: '게임 포인트',
        immediateLabel: '지금 15,000 포인트',
        delayedLabel: '3일 후 20,000 포인트'
    },
    {
        id: 'dd_3',
        immediateReward: 20000,
        delayedReward: 30000,
        delayDays: 7,
        category: 'short',
        scenario: '쿠폰 할인',
        immediateLabel: '오늘 20% 할인',
        delayedLabel: '1주일 후 30% 할인'
    },
    // 중기 지연 (2주~1개월)
    {
        id: 'dd_4',
        immediateReward: 30000,
        delayedReward: 50000,
        delayDays: 14,
        category: 'medium',
        scenario: '과외 선물',
        immediateLabel: '오늘 3만원 상품권',
        delayedLabel: '2주 후 5만원 상품권'
    },
    {
        id: 'dd_5',
        immediateReward: 50000,
        delayedReward: 80000,
        delayDays: 30,
        category: 'medium',
        scenario: '시험 보상',
        immediateLabel: '시험 직후 5만원',
        delayedLabel: '1달 후 8만원'
    },
    {
        id: 'dd_6',
        immediateReward: 1,
        delayedReward: 2,
        delayDays: 21,
        category: 'medium',
        scenario: '초콜릿 선택',
        immediateLabel: '지금 초콜릿 1개',
        delayedLabel: '3주 후 초콜릿 2개'
    },
    // 장기 지연 (2개월 이상)
    {
        id: 'dd_7',
        immediateReward: 100000,
        delayedReward: 200000,
        delayDays: 60,
        category: 'long',
        scenario: '학원비 보조',
        immediateLabel: '다음 달 10만원',
        delayedLabel: '2달 후 20만원'
    },
    {
        id: 'dd_8',
        immediateReward: 1,
        delayedReward: 5,
        delayDays: 90,
        category: 'long',
        scenario: '게임 아이템',
        immediateLabel: '지금 일반 아이템 1개',
        delayedLabel: '3달 후 레어 아이템 5개'
    },
    // 학습 관련 시나리오
    {
        id: 'dd_9',
        immediateReward: 30,
        delayedReward: 60,
        delayDays: 7,
        category: 'short',
        scenario: '공부 시간',
        immediateLabel: '오늘 30분 공부 후 놀기',
        delayedLabel: '일주일 열심히 하고 주말 완전 휴식'
    },
    {
        id: 'dd_10',
        immediateReward: 70,
        delayedReward: 100,
        delayDays: 30,
        category: 'medium',
        scenario: '성적 목표',
        immediateLabel: '이번 시험 70점 목표',
        delayedLabel: '다음 달 시험 100점 도전'
    },
    {
        id: 'dd_11',
        immediateReward: 1,
        delayedReward: 3,
        delayDays: 1,
        category: 'short',
        scenario: '휴식 선택',
        immediateLabel: '지금 유튜브 10분',
        delayedLabel: '공부 끝나고 유튜브 30분'
    },
    {
        id: 'dd_12',
        immediateReward: 50,
        delayedReward: 100,
        delayDays: 14,
        category: 'medium',
        scenario: '포상 선택',
        immediateLabel: '지금 간식 사먹기',
        delayedLabel: '2주 뒤 맛집 가기'
    }
];

// ========== 2. 결과 타입 정의 ==========
export interface DelayDiscountingResult {
    responses: {
        choiceId: string;
        choseImmediate: boolean;
        responseTimeMs: number;
    }[];
    // 전체 지표
    totalChoices: number;
    immediateChoices: number;
    delayedChoices: number;
    immediateRate: number;          // 즉시 보상 선택 비율 (0-100)

    // 카테고리별 즉시 선택 비율
    shortTermRate: number;          // 단기 지연에서 즉시 선택 비율
    mediumTermRate: number;         // 중기 지연에서 즉시 선택 비율
    longTermRate: number;           // 장기 지연에서 즉시 선택 비율

    // 할인율 지표
    kValue: number;                 // 쌍곡선 할인율 (높을수록 인내심 부족)

    // 평균 응답 시간
    avgResponseTimeMs: number;

    // 판정 결과
    impulsivityLevel: 'low' | 'moderate' | 'high' | 'severe';
    dopamineStatus: string;

    completedAt: string;
}

// ========== 3. 결과 계산 함수 ==========
export const calculateDelayDiscountingResult = (
    responses: { choiceId: string; choseImmediate: boolean; responseTimeMs: number }[]
): DelayDiscountingResult => {
    const scenarios = DELAY_DISCOUNTING_SCENARIOS;

    // 기본 통계
    const totalChoices = responses.length;
    const immediateChoices = responses.filter(r => r.choseImmediate).length;
    const delayedChoices = totalChoices - immediateChoices;
    const immediateRate = Math.round((immediateChoices / totalChoices) * 100);

    // 카테고리별 분석
    const analyzeCategory = (category: 'short' | 'medium' | 'long'): number => {
        const categoryResponses = responses.filter(r => {
            const scenario = scenarios.find(s => s.id === r.choiceId);
            return scenario?.category === category;
        });
        if (categoryResponses.length === 0) return 0;
        const immediateInCategory = categoryResponses.filter(r => r.choseImmediate).length;
        return Math.round((immediateInCategory / categoryResponses.length) * 100);
    };

    const shortTermRate = analyzeCategory('short');
    const mediumTermRate = analyzeCategory('medium');
    const longTermRate = analyzeCategory('long');

    // 쌍곡선 할인율 (k) 추정 - 간소화 버전
    // k가 높을수록 즉각적 보상 선호 (인내심 부족)
    let kEstimate = 0;
    responses.forEach(r => {
        const scenario = scenarios.find(s => s.id === r.choiceId);
        if (scenario && r.choseImmediate) {
            // 즉시 보상 선택 시: 지연 기간이 길수록 k가 높음
            kEstimate += (scenario.delayedReward / scenario.immediateReward - 1) / scenario.delayDays;
        }
    });
    kEstimate = Math.round((kEstimate / totalChoices) * 1000) / 1000;

    // 평균 응답 시간
    const avgResponseTimeMs = Math.round(
        responses.reduce((sum, r) => sum + r.responseTimeMs, 0) / responses.length
    );

    // 충동성 레벨 판정
    let impulsivityLevel: 'low' | 'moderate' | 'high' | 'severe';
    let dopamineStatus: string;

    if (immediateRate <= 25) {
        impulsivityLevel = 'low';
        dopamineStatus = '도파민 보상 회로 건강: 장기 목표 설정이 효과적입니다.';
    } else if (immediateRate <= 50) {
        impulsivityLevel = 'moderate';
        dopamineStatus = '보통 수준: 중기 목표와 단기 보상을 혼합하세요.';
    } else if (immediateRate <= 75) {
        impulsivityLevel = 'high';
        dopamineStatus = '주의 필요: 즉각 보상 경향이 높습니다. 단기 보상 전략을 사용하세요.';
    } else {
        impulsivityLevel = 'severe';
        dopamineStatus = '도파민 민감도 저하: 10분 단위 초단기 보상 전략이 필수입니다.';
    }

    return {
        responses,
        totalChoices,
        immediateChoices,
        delayedChoices,
        immediateRate,
        shortTermRate,
        mediumTermRate,
        longTermRate,
        kValue: kEstimate,
        avgResponseTimeMs,
        impulsivityLevel,
        dopamineStatus,
        completedAt: new Date().toISOString()
    };
};

// ========== 4. 결과 해석 및 설명 ==========
export const IMPULSIVITY_DESCRIPTIONS: Record<
    'low' | 'moderate' | 'high' | 'severe',
    {
        label: string;
        description: string;
        studyAdvice: string[];
        rewardStrategy: string[];
        warning: string;
    }
> = {
    low: {
        label: '장기 보상 지향형 (인내심 높음)',
        description: '지연된 큰 보상을 선호합니다. 전두엽 기능이 우수하여 장기 목표 설정이 효과적입니다.',
        studyAdvice: [
            '월간/학기 단위 큰 목표 설정',
            '장기 프로젝트 학습 추천',
            '입시 전략 수립에 유리',
            '딥러닝 방식의 학습 효과적'
        ],
        rewardStrategy: [
            '대학 합격, 장학금 등 큰 목표 활용',
            '분기별 대형 보상 설정',
            '성취 일지로 장기 성과 추적'
        ],
        warning: '과도한 지연 보상 추구로 현재 즐거움을 놓치지 않도록 균형 유지'
    },
    moderate: {
        label: '균형형',
        description: '상황에 따라 즉시/지연 보상을 선택합니다. 적절한 보상 전략 혼합이 효과적입니다.',
        studyAdvice: [
            '주간 목표 + 일일 성취감 병행',
            '중요 과목은 장기, 취약 과목은 단기 목표',
            '시험 2주 전부터 집중 모드 가능',
            '계획과 유연성의 균형'
        ],
        rewardStrategy: [
            '주간 보상 (맛집, 영화) + 월간 보상 (선물) 조합',
            '일일 작은 성취 체크리스트',
            '주말 보상 day 설정'
        ],
        warning: '스트레스 상황에서 즉시 보상 경향이 증가할 수 있으니 주의'
    },
    high: {
        label: '즉시 보상 선호형',
        description: '즉각적인 보상을 선호하는 경향이 있습니다. 도파민 민감도가 다소 저하되어 있을 수 있습니다.',
        studyAdvice: [
            '25분 뽀모도로 후 5분 보상',
            '한 단원 끝날 때마다 작은 간식',
            '어려운 과목은 최소 단위로 쪼개기',
            '즉각적 피드백이 있는 앱 학습'
        ],
        rewardStrategy: [
            '매 30분 학습 후 작은 보상',
            '문제 5개 풀면 스마트폰 1분',
            '당일 목표 달성 시 저녁 자유시간',
            '포인트제 즉각 보상 시스템'
        ],
        warning: '장기 계획보다 오늘의 작은 성공에 집중하세요'
    },
    severe: {
        label: '도파민 조절 곤란 (강한 충동성)',
        description: '즉각적 만족을 매우 강하게 추구합니다. 전두엽 보상 회로 조절이 필요한 상태입니다.',
        studyAdvice: [
            '10분 단위 초단기 목표 설정',
            '한 문제 풀면 바로 체크 ✓',
            '게임화된 학습 앱 필수',
            '절대 1시간 이상 연속 공부 금지'
        ],
        rewardStrategy: [
            '10분마다 타이머 + 즉시 휴식',
            '완료 팝업/효과음 있는 앱 사용',
            '눈앞에 간식 두고 공부',
            '매 페이지 끝날 때 스탬프 찍기',
            '포모도로 5분도 힘들면 3분부터 시작'
        ],
        warning: '⚠️ 장기 계획은 실패 확률 높음. 의지력 문제가 아닌 뇌 회로 문제. 디지털 디톡스 병행 권장.'
    }
};

// ========== 5. CareType별 권장사항 ==========
export const CARETYPE_DELAY_RECOMMENDATIONS: Record<CareType, {
    expectedPattern: string;
    specialAdvice: string;
    studyIntegration: string;
}> = {
    [CareType.BURNOUT]: {
        expectedPattern: '번아웃 상태에서는 즉시 보상 선호가 증가할 수 있습니다.',
        specialAdvice: '에너지 고갈로 인한 일시적 현상일 수 있으니 휴식 후 재검사를 권장합니다.',
        studyIntegration: '충분한 휴식 확보 후 중기 보상 전략을 도입하세요.'
    },
    [CareType.ANXIETY_TENSION]: {
        expectedPattern: '불안이 높으면 "지금 당장" 확실한 것을 선호할 수 있습니다.',
        specialAdvice: '불확실성에 대한 불안이 선택에 영향을 미칠 수 있습니다.',
        studyIntegration: '확실하고 작은 성공 경험을 쌓아 자신감을 회복하세요.'
    },
    [CareType.STRESS_OVERLOAD]: {
        expectedPattern: '스트레스 과부하 시 충동적 선택이 증가합니다.',
        specialAdvice: '스트레스 관리가 우선입니다. 결과보다 과정에 집중하세요.',
        studyIntegration: '스트레스 해소 루틴과 학습 보상을 연결하세요.'
    },
    [CareType.SLEEP]: {
        expectedPattern: '수면 부족은 전두엽 기능을 저하시켜 충동성을 높입니다.',
        specialAdvice: '수면 개선이 최우선 과제입니다.',
        studyIntegration: '수면 전 학습 완료 시 보상을 설정하세요.'
    },
    [CareType.LOW_ENERGY]: {
        expectedPattern: '에너지가 낮으면 "노력이 필요한 지연 보상"을 피하게 됩니다.',
        specialAdvice: '에너지 수준에 맞는 현실적 목표가 필요합니다.',
        studyIntegration: '에너지가 높은 시간대에 도전적 과제를 배치하세요.'
    },
    [CareType.DEPRESSION_AMOTIVATION]: {
        expectedPattern: '무동기 상태에서는 "미래 보상"에 대한 관심이 떨어집니다.',
        specialAdvice: '작은 즉시 보상으로 동기를 점진적으로 회복하세요.',
        studyIntegration: '매우 작은 성공 경험부터 시작하여 보상 민감도를 회복하세요.'
    },
    [CareType.BRAIN_FATIGUE]: {
        expectedPattern: '뇌피로는 인지적 노력을 요하는 "기다림"을 힘들게 만듭니다.',
        specialAdvice: '뇌 휴식 시간을 충분히 확보한 후 테스트하세요.',
        studyIntegration: '짧은 집중 + 완전 휴식 사이클로 뇌 부담을 줄이세요.'
    },
    [CareType.HYPERSENSITIVE]: {
        expectedPattern: '과민성이 높으면 불확실한 미래보다 확실한 현재를 선호합니다.',
        specialAdvice: '예측 가능한 보상 시스템을 구축하세요.',
        studyIntegration: '정해진 보상 스케줄로 안정감을 제공하세요.'
    },
    [CareType.ATTENTION_DEFICIT]: {
        expectedPattern: '주의력 문제와 충동성은 높은 상관관계가 있습니다.',
        specialAdvice: '이 결과가 주의력 훈련의 중요한 근거가 됩니다.',
        studyIntegration: '게임화된 즉각 피드백 학습이 필수입니다.'
    },
    [CareType.CIRCULATION]: {
        expectedPattern: '순환 저하가 뇌 기능에 영향을 미칠 수 있습니다.',
        specialAdvice: '가벼운 운동 후 재측정을 권장합니다.',
        studyIntegration: '학습 전 간단한 스트레칭으로 순환을 개선하세요.'
    },
    [CareType.HEALTHY]: {
        expectedPattern: '건강한 상태에서의 기준선을 확인합니다.',
        specialAdvice: '이 결과를 기준으로 개인 맞춤 보상 전략을 수립하세요.',
        studyIntegration: '자신의 성향에 맞는 최적 보상 간격을 찾으세요.'
    },
    [CareType.ADRENAL]: {
        expectedPattern: '부신피로는 에너지 리듬에 따라 충동성이 변할 수 있습니다.',
        specialAdvice: '하루 중 에너지가 높은 시간에 테스트하세요.',
        studyIntegration: '골든타임에 도전적 과제, 저에너지 시간에는 쉬운 과제를 배치하세요.'
    },
    [CareType.CONCENTRATION]: {
        expectedPattern: '집중력 저하와 즉시 보상 선호는 서로 연관됩니다.',
        specialAdvice: '집중력 훈련과 보상 조절 훈련을 병행하세요.',
        studyIntegration: '집중 시간을 점진적으로 늘리면서 보상 간격도 늘려가세요.'
    },
    [CareType.UNASSESSED]: {
        expectedPattern: '기초 프로필 파악용 테스트입니다.',
        specialAdvice: '결과를 다른 검사와 종합하여 해석하세요.',
        studyIntegration: '전체 진단 결과를 바탕으로 보상 전략을 수립하세요.'
    }
};

// ========== 6. 테스트 설정 ==========
export const DELAY_DISCOUNTING_CONFIG = {
    minTrials: 8,           // 최소 문항 수
    maxTrials: 12,          // 최대 문항 수
    showTimeLimit: false,   // 시간 제한 표시 여부
    randomizeOrder: true,   // 문항 순서 랜덤화
    showProgress: true      // 진행률 표시
};
