// 예측 규칙 정의 (Prediction Rules)
// 로직 엔진 기반 위험 예측 및 추세 분석

import { CareType } from '../types';
import { LogicCondition } from '../logicEngine';

// Re-export LogicCondition for external use
export type { LogicCondition } from '../logicEngine';

// ========== 타입 정의 ==========

export interface TrendCondition {
    field: string;                     // 'hrv.sns', 'survey.bai' 등
    trendType: 'increasing' | 'decreasing' | 'stable' | 'volatile';
    threshold: number;                 // 변화량 기준 (예: 주당 5% 이상 증가)
    minDataPoints: number;             // 최소 필요 데이터 개수
}

export interface RiskPredictionRule {
    id: string;
    name: string;
    nameKr: string;

    // 단일 데이터 조건 (기존 LogicCondition 재사용)
    currentConditions: LogicCondition[];
    currentCombinator: 'AND' | 'OR';

    // 추세 조건 (히스토리 2개+ 필요) - 옵션
    trendConditions?: TrendCondition[];
    trendRequired: boolean;            // true면 추세 데이터 필수

    // 예측 결과
    prediction: {
        riskType: CareType;
        probability: number;           // 0-100
        timeframe: '1week' | '2weeks' | '1month';
        severity: 'low' | 'medium' | 'high' | 'critical';
    };

    // 권장 조치
    recommendations: string[];

    // 상담 스크립트 (학생에게 전달할 말)
    consultScript: string;

    enabled: boolean;
    priority: number;
}

// ========== 기본 예측 규칙 ==========

export const DEFAULT_PREDICTION_RULES: RiskPredictionRule[] = [
    // === 단일 데이터 기반 규칙 (1개 데이터로 예측 가능) ===

    {
        id: 'pred_burnout_warning',
        name: 'Burnout Warning',
        nameKr: '번아웃 전조 경고',
        currentConditions: [
            { field: 'hrv.sns', operator: '>=', value: 65 },
            { field: 'hrv.fatigue', operator: '>=', value: 70 }
        ],
        currentCombinator: 'AND',
        trendRequired: false,
        prediction: {
            riskType: CareType.BURNOUT,
            probability: 75,
            timeframe: '1week',
            severity: 'high'
        },
        recommendations: [
            '이번 주 휴식 비중 20% 증가',
            '고강도 학습 시간 30% 감축',
            '매일 30분 이상 가벼운 운동 권장'
        ],
        consultScript: '현재 몸이 많이 지쳐있는 상태예요. 이번 주는 학습량을 조금 줄이고, 충분히 휴식을 취하는 게 좋겠어요. 무리하지 말고 컨디션 회복에 집중해 보세요.',
        enabled: true,
        priority: 1
    },
    {
        id: 'pred_sleep_deterioration',
        name: 'Sleep Deterioration Risk',
        nameKr: '수면 악화 위험',
        currentConditions: [
            { field: 'survey.isi', operator: '>=', value: 15 },
            { field: 'hrv.pns', operator: '<', value: 30 }
        ],
        currentCombinator: 'AND',
        trendRequired: false,
        prediction: {
            riskType: CareType.SLEEP,
            probability: 70,
            timeframe: '2weeks',
            severity: 'high'
        },
        recommendations: [
            '취침 1시간 전 스마트폰 사용 금지',
            '취침/기상 시간 규칙적으로 유지',
            '저녁 카페인 섭취 제한'
        ],
        consultScript: '요즘 잠을 잘 못 자고 있는 것 같아요. 수면 패턴이 무너지면 학습 효율도 많이 떨어지거든요. 이번 주부터 매일 같은 시간에 자고 일어나는 연습을 해봐요.',
        enabled: true,
        priority: 2
    },
    {
        id: 'pred_brain_fatigue_collapse',
        name: 'Brain Fatigue Collapse Risk',
        nameKr: '집중력 붕괴 위험',
        currentConditions: [
            { field: 'hrv.brainScore', operator: '<', value: 50 },
            { field: 'hrv.concentrationLevel', operator: '<', value: 40 }
        ],
        currentCombinator: 'AND',
        trendRequired: false,
        prediction: {
            riskType: CareType.BRAIN_FATIGUE,
            probability: 80,
            timeframe: '1week',
            severity: 'critical'
        },
        recommendations: [
            '학습 시간 50% 감축 필수',
            '뇌 휴식 활동 (산책, 명상) 매일 실시',
            '오메가-3 등 두뇌 영양 보충 권장'
        ],
        consultScript: '지금 두뇌가 많이 피곤한 상태예요. 억지로 공부해도 머리에 잘 안 들어올 거예요. 며칠간 학습량을 확 줄이고 뇌가 쉴 수 있도록 해주세요.',
        enabled: true,
        priority: 1
    },
    {
        id: 'pred_anxiety_escalation',
        name: 'Anxiety Escalation Risk',
        nameKr: '불안 악화 위험',
        currentConditions: [
            { field: 'survey.bai', operator: '>=', value: 20 },
            { field: 'hrv.sns', operator: '>=', value: 60 }
        ],
        currentCombinator: 'AND',
        trendRequired: false,
        prediction: {
            riskType: CareType.ANXIETY_TENSION,
            probability: 65,
            timeframe: '2weeks',
            severity: 'high'
        },
        recommendations: [
            '4-7-8 호흡법 매일 3회 실시',
            '시험/성적 관련 대화 최소화',
            '긴장 완화 음악 듣기 권장'
        ],
        consultScript: '요즘 마음이 많이 불안한 것 같아요. 긴장을 풀 수 있는 시간을 가져보는 게 좋겠어요. 공부하기 전에 심호흡을 몇 번 해보고, 너무 조급해하지 않아도 괜찮아요.',
        enabled: true,
        priority: 2
    },
    {
        id: 'pred_adrenal_progression',
        name: 'Adrenal Fatigue Progression',
        nameKr: '부신피로 진행 위험',
        currentConditions: [
            { field: 'survey.adrenalFatigueScore', operator: '>=', value: 30 },
            { field: 'hrv.vitality', operator: '<', value: 40 }
        ],
        currentCombinator: 'AND',
        trendRequired: false,
        prediction: {
            riskType: CareType.ADRENAL,
            probability: 70,
            timeframe: '1month',
            severity: 'high'
        },
        recommendations: [
            '영양 보충제(비타민B, 마그네슘) 섭취 권장',
            '아침 기상 시간 일정하게 유지',
            '과도한 카페인/당분 섭취 제한'
        ],
        consultScript: '몸의 에너지 시스템이 많이 지쳐있어요. 당장 성적보다 건강 회복이 우선이에요. 규칙적인 생활 패턴과 충분한 영양 섭취가 정말 중요해요.',
        enabled: true,
        priority: 3
    },
    {
        id: 'pred_motivation_crisis',
        name: 'Motivation Crisis',
        nameKr: '동기 저하 위기',
        currentConditions: [
            { field: 'protocol.motivationalFactor', operator: '<=', value: 2 },
            { field: 'analytics.pureStudyRatio', operator: '<', value: 40 }
        ],
        currentCombinator: 'AND',
        trendRequired: false,
        prediction: {
            riskType: CareType.DEPRESSION_AMOTIVATION,
            probability: 60,
            timeframe: '2weeks',
            severity: 'medium'
        },
        recommendations: [
            '작은 목표 설정 및 달성 경험 유도',
            '관심 분야와 학습 연결점 찾기',
            '성취감을 느낄 수 있는 활동 추가'
        ],
        consultScript: '요즘 공부가 재미없고 힘들죠? 그럴 수 있어요. 잠시 쉬어가도 괜찮아요. 너무 큰 목표보다 오늘 할 수 있는 작은 것부터 해보면 어떨까요?',
        enabled: true,
        priority: 3
    },
    {
        id: 'pred_cognitive_overload',
        name: 'Cognitive Overload Risk',
        nameKr: '인지적 과부하 경고',
        currentConditions: [
            { field: 'survey.testAnxietyCognitive', operator: '>=', value: 15 },
            { field: 'cognitive.workingMemory.forwardSpan', operator: '<', value: 5 }
        ],
        currentCombinator: 'AND',
        trendRequired: false,
        prediction: {
            riskType: CareType.BRAIN_FATIGUE,
            probability: 80,
            timeframe: '1week',
            severity: 'high'
        },
        recommendations: [
            '학습 내용 잘게 쪼개기(Chunking) 도입',
            '한 번에 한 과목만 집중 (멀티태스킹 금지)',
            '충분한 수면으로 뇌 휴식 확보'
        ],
        consultScript: '시험에 대한 걱정이 너무 많아 뇌의 여유 공간(작업 기억)이 부족한 상태예요. 마치 컴퓨터 램(RAM)이 가득 찬 것과 같아요. 일단 푹 자고, 공부량을 작게 쪼개서 해보세요.',
        enabled: true,
        priority: 2
    },
    {
        id: 'pred_impulsivity_risk',
        name: 'Impulsivity & Distraction Risk',
        nameKr: '충동성 및 산만함 위험',
        currentConditions: [
            { field: 'cognitive.attention.mistakes.commission', operator: '>=', value: 3 },
            { field: 'analytics.pureStudyRatio', operator: '<', value: 40 }
        ],
        currentCombinator: 'AND',
        trendRequired: false,
        prediction: {
            riskType: CareType.ATTENTION_DEFICIT,
            probability: 70,
            timeframe: '1week',
            severity: 'medium'
        },
        recommendations: [
            '뽀모도로 학습법 (25분 집중, 5분 휴식) 적용',
            '스마트폰은 학습 공간 밖에 두기',
            '명상 및 심호흡 훈련 도입'
        ],
        consultScript: '집중이 잘 안 되고 충동적인 실수가 늘어나고 있어요. 순공 시간도 많이 줄었네요. 집중할 수 있는 환경을 먼저 세팅하고 짧게 집중하는 연습부터 다시 시작해봐요.',
        enabled: true,
        priority: 3
    },

    // === 추세 기반 규칙 (2개+ 데이터 필요) ===

    {
        id: 'pred_sns_rapid_increase',
        name: 'SNS Rapid Increase',
        nameKr: 'SNS 급상승 추세',
        currentConditions: [
            { field: 'hrv.sns', operator: '>=', value: 55 }
        ],
        currentCombinator: 'AND',
        trendConditions: [
            { field: 'hrv.sns', trendType: 'increasing', threshold: 5, minDataPoints: 2 }
        ],
        trendRequired: true,
        prediction: {
            riskType: CareType.BURNOUT,
            probability: 85,
            timeframe: '1week',
            severity: 'critical'
        },
        recommendations: [
            '즉시 휴식 모드 전환 권장',
            '학습 스케줄 전면 재조정 필요',
            '스트레스 원인 파악 및 제거'
        ],
        consultScript: '최근 스트레스 수치가 계속 올라가고 있어요. 지금 멈추지 않으면 곧 번아웃이 올 수 있어요. 이번 주는 정말 푹 쉬는 게 좋겠어요.',
        enabled: true,
        priority: 1
    },
    {
        id: 'pred_sleep_continuous_decline',
        name: 'Sleep Continuous Decline',
        nameKr: '수면 지속 악화',
        currentConditions: [
            { field: 'survey.isi', operator: '>=', value: 12 }
        ],
        currentCombinator: 'AND',
        trendConditions: [
            { field: 'survey.isi', trendType: 'increasing', threshold: 2, minDataPoints: 3 }
        ],
        trendRequired: true,
        prediction: {
            riskType: CareType.SLEEP,
            probability: 90,
            timeframe: '1week',
            severity: 'critical'
        },
        recommendations: [
            '수면 클리닉 상담 권고',
            '수면 위생 전면 점검 필요',
            '취침 환경 개선 (온도, 소음, 빛)'
        ],
        consultScript: '수면 문제가 점점 심해지고 있어요. 이 상태가 계속되면 학습은커녕 건강에도 문제가 생길 수 있어요. 전문가 상담을 받아보는 것도 좋을 것 같아요.',
        enabled: true,
        priority: 1
    },
    {
        id: 'pred_brain_score_declining',
        name: 'Brain Score Declining',
        nameKr: '뇌기능 점수 하락세',
        currentConditions: [
            { field: 'hrv.brainScore', operator: '<', value: 70 }
        ],
        currentCombinator: 'AND',
        trendConditions: [
            { field: 'hrv.brainScore', trendType: 'decreasing', threshold: 5, minDataPoints: 2 }
        ],
        trendRequired: true,
        prediction: {
            riskType: CareType.BRAIN_FATIGUE,
            probability: 80,
            timeframe: '1week',
            severity: 'high'
        },
        recommendations: [
            '학습 시간 점진적 감축',
            '뇌 활성화 활동 (퍼즐, 산책) 추가',
            '충분한 수분 섭취'
        ],
        consultScript: '두뇌 건강 점수가 계속 떨어지고 있어요. 지금 무리하면 회복하는 데 더 오래 걸려요. 학습보다 회복에 먼저 집중해 보세요.',
        enabled: true,
        priority: 2
    },
    {
        id: 'pred_recovery_failure',
        name: 'Recovery Failure Pattern',
        nameKr: '회복 실패 패턴',
        currentConditions: [
            { field: 'hrv.pns', operator: '<', value: 35 }
        ],
        currentCombinator: 'AND',
        trendConditions: [
            { field: 'hrv.pns', trendType: 'stable', threshold: 5, minDataPoints: 2 }
        ],
        trendRequired: true,
        prediction: {
            riskType: CareType.ADRENAL,
            probability: 75,
            timeframe: '1month',
            severity: 'high'
        },
        recommendations: [
            '휴식의 질 개선 필요',
            '깊은 수면 유도 방법 적용',
            '주말 완전 휴식일 설정'
        ],
        consultScript: '휴식을 취해도 회복이 잘 안 되고 있어요. 휴식의 질을 높여야 해요. 스마트폰 없이 푹 쉬는 날을 만들어 보세요.',
        enabled: true,
        priority: 2
    },
    {
        id: 'pred_cognitive_decline_trend',
        name: 'Cognitive Decline Trend',
        nameKr: '두뇌 정보처리속도 하락세',
        currentConditions: [
            { field: 'cognitive.processingSpeed.averageWPM', operator: '<', value: 200 }
        ],
        currentCombinator: 'AND',
        trendConditions: [
            { field: 'cognitive.processingSpeed.averageWPM', trendType: 'decreasing', threshold: 10, minDataPoints: 2 }
        ],
        trendRequired: true,
        prediction: {
            riskType: CareType.BRAIN_FATIGUE,
            probability: 85,
            timeframe: '2weeks',
            severity: 'high'
        },
        recommendations: [
            '주말 온전한 뇌 휴식 (Digital Detox) 실시',
            '오메가-3, 항산화 영양제 섭취 권장',
            '수면 시간 1시간 연장'
        ],
        consultScript: '글을 읽고 처리하는 두뇌 속도가 지속적으로 떨어지고 있어요. 두뇌에 피로가 깊이 쌓인 상태입니다. 이번 주말에는 디지털 기기를 멀리하고 뇌를 완전히 쉬게 해주세요.',
        enabled: true,
        priority: 2
    }
];

// ========== 유틸리티 함수 ==========

export const loadPredictionRules = (): RiskPredictionRule[] => {
    try {
        const saved = localStorage.getItem('sn1_prediction_rules');
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {
        console.error('Failed to load prediction rules:', e);
    }
    return [...DEFAULT_PREDICTION_RULES];
};

export const savePredictionRules = (rules: RiskPredictionRule[]): void => {
    localStorage.setItem('sn1_prediction_rules', JSON.stringify(rules));
};

export const resetPredictionRules = (): RiskPredictionRule[] => {
    const defaults = [...DEFAULT_PREDICTION_RULES];
    localStorage.setItem('sn1_prediction_rules', JSON.stringify(defaults));
    return defaults;
};
