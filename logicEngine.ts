// Logic Engine Configuration
// 관리자가 UI에서 수정 가능한 로직 엔진 설정

import { CareType } from './types';

// ========== 타입 정의 ==========

export interface LogicCondition {
    field: string;
    operator: '>=' | '<=' | '>' | '<' | '==' | '!=';
    value: number | string | boolean;
}

export interface ClassificationRule {
    id: string;
    name: string;
    nameKr: string;
    conditions: LogicCondition[];
    combinator: 'AND' | 'OR';
    result: CareType;
    priority: number;
    enabled: boolean;
}

export interface ProductRecommendationRule {
    id: string;
    productId: string;
    productName: string;
    conditions: LogicCondition[];
    combinator: 'AND' | 'OR';
    enabled: boolean;
}

export interface SecretPointRule {
    id: string;
    category: 'screening' | 'referral' | 'clinical';
    message: string;
    conditions: LogicCondition[];
    combinator: 'AND' | 'OR';
    severity: 'info' | 'warning' | 'critical';
    enabled: boolean;
}

export interface LogicEngineConfig {
    classificationRules: ClassificationRule[];
    productRules: ProductRecommendationRule[];
    secretPointRules: SecretPointRule[];
    thresholds: LogicThresholds; // Added global thresholds
    version: string;
    lastModified: string;
}

export interface LogicThresholds {
    snsHigh: number;
    snsLow: number;
    pnsLow: number;
    brainScoreLow: number;
    baiHigh: number;
    isiHigh: number;
    concentrationLow: number;
    motivationLow: number;
    noiseSensitive: number;
    stressHigh: number;
    pureStudyLow: number;
    distractionHigh: number;
    goalLow: number;
    subjectImbalance: number;
    gad7High: number;
    testAnxietyHigh: number;
    portableStressHigh: number;
}

// ========== 필드 정의 (UI에서 선택 가능한 필드들) ==========

export const AVAILABLE_FIELDS = {
    hrv: [
        { key: 'sns', label: 'SNS (교감신경) %', type: 'number' },
        { key: 'pns', label: 'PNS (부교감신경) %', type: 'number' },
        { key: 'brainScore', label: '뇌 건강점수', type: 'number' },
        { key: 'ppgLevel', label: '혈관 건강 레벨 (1-7)', type: 'number' },
        { key: 'fatigue', label: '누적 피로도', type: 'number' },
        { key: 'vitality', label: '신체 활력도', type: 'number' },
        { key: 'physicalStress', label: '신체 스트레스', type: 'number' },
        { key: 'dominantEEG', label: '우세 뇌파', type: 'string' },
        { key: 'tp', label: 'TP (Total Power)', type: 'number' },
        { key: 'vlf', label: 'VLF', type: 'number' },
        { key: 'lf', label: 'LF', type: 'number' },
        { key: 'hf', label: 'HF', type: 'number' },
        { key: 'hrvIndex', label: 'HRV Index', type: 'number' },
        { key: 'ansAge', label: 'ANS 나이', type: 'number' },
        { key: 'concentrationLevel', label: '집중력 레벨', type: 'number' },
        { key: 'attentionLevel', label: '주의력 레벨', type: 'number' },
        { key: 'eegGamma', label: '감마파', type: 'number' },
        { key: 'eegHBeta', label: 'High-Beta파', type: 'number' },
        { key: 'eegMBeta', label: 'Mid-Beta파', type: 'number' },
        { key: 'eegLBeta', label: 'Low-Beta파', type: 'number' },
        { key: 'eegAlpha', label: '알파파', type: 'number' },
        { key: 'eegTheta', label: '세타파', type: 'number' },
    ],
    survey: [
        { key: 'bai', label: 'BAI 점수 (불안)', type: 'number' },
        { key: 'isi', label: 'ISI 점수 (수면)', type: 'number' },
        { key: 'gad7', label: 'GAD-7 점수', type: 'number' },
        { key: 'concentrationScore', label: '집중력 점수', type: 'number' },
        { key: 'adrenalFatigueScore', label: '부신피로 점수', type: 'number' },
        { key: 'fatigueSymptomsCount', label: '피로 증상 개수', type: 'number' },
        { key: 'chronicFatigue', label: '만성 피로 여부', type: 'boolean' },
    ],
    protocol: [
        { key: 'stressLevel', label: '스트레스 레벨', type: 'number' },
        { key: 'avgSleep', label: '평균 수면 시간', type: 'number' },
        { key: 'emotionalFactor', label: '정서적 안정감', type: 'number' },
        { key: 'motivationalFactor', label: '학습 동기 수준', type: 'number' },
        { key: 'taskDifficulty', label: '체감 난이도', type: 'number' },
    ],
    analytics: [
        { key: 'pureStudyRatio', label: '순공 시간 비율 (%)', type: 'number' },
        { key: 'avgFocusDuration', label: '평균 집중 시간 (분)', type: 'number' },
        { key: 'distractionCount', label: '산만도 (횟수/시간)', type: 'number' },
        { key: 'chronotype', label: '크로노타입', type: 'string' },
        { key: 'goalAchievementRate', label: '목표 달성률 (%)', type: 'number' },
        { key: 'sleepQuality', label: '수면 품질 (1-5)', type: 'number' },
        { key: 'energyPattern', label: '에너지 패턴', type: 'string' },
        { key: 'breakAdequacy', label: '휴식 적절성', type: 'number' },
    ],
    bloodTest: [
        { key: 'hemoglobin', label: '헤모글로빈 (g/dL)', type: 'number' },
        { key: 'vitaminD', label: '비타민D (ng/mL)', type: 'number' },
        { key: 'crp', label: 'CRP 염증지표 (mg/L)', type: 'number' },
        { key: 'hba1c', label: '당화혈색소 (%)', type: 'number' },
        { key: 'ast', label: 'AST 간기능 (U/L)', type: 'number' },
        { key: 'alt', label: 'ALT 간기능 (U/L)', type: 'number' },
        { key: 'nkActivity', label: 'NK세포활성도 (%)', type: 'number' },
    ],
    cognitive: [
        { key: 'workingMemory.overallLevel', label: '작업기억 레벨', type: 'string' },
        { key: 'workingMemory.forwardSpan', label: '정순향 기억 한도', type: 'number' },
        { key: 'attention.accuracy', label: '주의력 정확도 (%)', type: 'number' },
        { key: 'attention.reactionTime', label: '평균 반응속도 (ms)', type: 'number' },
        { key: 'attention.mistakes.commission', label: '충동적 오답(Commission) 수', type: 'number' },
        { key: 'delayDiscounting.impulsivityLevel', label: '충동성 레벨', type: 'string' },
        { key: 'processingSpeed.averageWPM', label: '정보처리 속도(WPM)', type: 'number' },
        { key: 'resilience.gradeLevel', label: '회복탄력성', type: 'string' },
    ],
};


// ========== 기본 분류 규칙 (12개 세분화) ==========

export const DEFAULT_CLASSIFICATION_RULES: ClassificationRule[] = [
    // === ANS 축 - SNS 과활성 ===
    {
        id: 'rule_burnout',
        name: 'BURNOUT',
        nameKr: '과긴장 번아웃',
        conditions: [
            { field: 'hrv.sns', operator: '>=', value: 65 },
            { field: 'hrv.fatigue', operator: '>=', value: 70 },
            { field: 'survey.bai', operator: '>=', value: 15 },
        ],
        combinator: 'AND',
        result: CareType.BURNOUT,
        priority: 1,
        enabled: true,
    },
    {
        id: 'rule_anxiety_tension',
        name: 'ANXIETY_TENSION',
        nameKr: '불안-긴장형',
        conditions: [
            { field: 'hrv.sns', operator: '>=', value: 60 },
            { field: 'survey.bai', operator: '>=', value: 20 },
            { field: 'hrv.dominantEEG', operator: '==', value: 'H-Beta' },
        ],
        combinator: 'AND',
        result: CareType.ANXIETY_TENSION,
        priority: 2,
        enabled: true,
    },
    {
        id: 'rule_stress_overload',
        name: 'STRESS_OVERLOAD',
        nameKr: '스트레스 과부하',
        conditions: [
            { field: 'hrv.fatigue', operator: '>=', value: 60 },
            { field: 'protocol.stressLevel', operator: '>=', value: 7 },
        ],
        combinator: 'AND',
        result: CareType.STRESS_OVERLOAD,
        priority: 3,
        enabled: true,
    },

    // === ANS 축 - PNS 과활성 ===
    {
        id: 'rule_low_energy',
        name: 'LOW_ENERGY',
        nameKr: '무기력형',
        conditions: [
            { field: 'hrv.pns', operator: '>=', value: 60 },
            { field: 'hrv.vitality', operator: '<', value: 40 },
            { field: 'analytics.energyPattern', operator: '==', value: 'declining' },
        ],
        combinator: 'AND',
        result: CareType.LOW_ENERGY,
        priority: 4,
        enabled: true,
    },
    {
        id: 'rule_depression_amotivation',
        name: 'DEPRESSION_AMOTIVATION',
        nameKr: '우울-무동기형',
        conditions: [
            { field: 'protocol.motivationalFactor', operator: '<=', value: 2 },
            { field: 'hrv.dominantEEG', operator: '==', value: 'Theta' },
            { field: 'analytics.pureStudyRatio', operator: '<', value: 40 },
        ],
        combinator: 'AND',
        result: CareType.DEPRESSION_AMOTIVATION,
        priority: 5,
        enabled: true,
    },
    {
        id: 'rule_adrenal',
        name: 'ADRENAL',
        nameKr: '부신피로 증후군',
        conditions: [
            { field: 'survey.adrenalFatigueScore', operator: '>=', value: 35 },
        ],
        combinator: 'OR',
        result: CareType.ADRENAL,
        priority: 6,
        enabled: true,
    },

    // === 뇌파/인지 축 ===
    {
        id: 'rule_brain_fatigue',
        name: 'BRAIN_FATIGUE',
        nameKr: '뇌피로 집중곤란',
        conditions: [
            { field: 'hrv.brainScore', operator: '<', value: 50 },
            { field: 'hrv.concentrationLevel', operator: '<', value: 40 },
            { field: 'analytics.avgFocusDuration', operator: '<', value: 20 },
        ],
        combinator: 'AND',
        result: CareType.BRAIN_FATIGUE,
        priority: 7,
        enabled: true,
    },
    {
        id: 'rule_hypersensitive',
        name: 'HYPERSENSITIVE',
        nameKr: '과민성 학습장애',
        conditions: [
            { field: 'hrv.eegHBeta', operator: '>=', value: 30 },
            { field: 'analytics.distractionCount', operator: '>', value: 10 },
            { field: 'survey.concentrationScore', operator: '<=', value: 15 },
        ],
        combinator: 'AND',
        result: CareType.HYPERSENSITIVE,
        priority: 8,
        enabled: true,
    },
    {
        id: 'rule_attention_deficit',
        name: 'ATTENTION_DEFICIT',
        nameKr: '주의력 산만형',
        conditions: [
            { field: 'hrv.attentionLevel', operator: '<', value: 40 },
            { field: 'hrv.dominantEEG', operator: '==', value: 'Alpha' },
        ],
        combinator: 'AND',
        result: CareType.ATTENTION_DEFICIT,
        priority: 9,
        enabled: true,
    },

    // === 신체/대사 축 ===
    {
        id: 'rule_sleep',
        name: 'SLEEP',
        nameKr: '수면 장애형',
        conditions: [
            { field: 'survey.isi', operator: '>=', value: 15 },
            { field: 'protocol.avgSleep', operator: '<', value: 6 },
        ],
        combinator: 'AND',
        result: CareType.SLEEP,
        priority: 10,
        enabled: true,
    },
    {
        id: 'rule_circulation',
        name: 'CIRCULATION',
        nameKr: '혈액순환 저하형',
        conditions: [
            { field: 'hrv.ppgLevel', operator: '>=', value: 5 },
            { field: 'hrv.vlf', operator: '<', value: 100 },
        ],
        combinator: 'AND',
        result: CareType.CIRCULATION,
        priority: 11,
        enabled: true,
    },

    // === 레거시 호환 ===
    {
        id: 'rule_concentration',
        name: 'CONCENTRATION',
        nameKr: '집중력 저하형 (레거시)',
        conditions: [
            { field: 'hrv.tp', operator: '<', value: 500 },
            { field: 'survey.chronicFatigue', operator: '==', value: true },
        ],
        combinator: 'AND',
        result: CareType.CONCENTRATION,
        priority: 12,
        enabled: false, // 레거시 - 기본 비활성화
    },
];


export const DEFAULT_THRESHOLDS: LogicThresholds = {
    snsHigh: 60,
    snsLow: 30,
    pnsLow: 30,
    brainScoreLow: 70,
    baiHigh: 16,
    isiHigh: 15,
    concentrationLow: 14,
    motivationLow: 2,
    noiseSensitive: 7,
    stressHigh: 7,
    pureStudyLow: 60,
    distractionHigh: 5,
    goalLow: 70,
    subjectImbalance: 60,
    gad7High: 10,
    testAnxietyHigh: 36,
    portableStressHigh: 50
};

// ========== 기본 제품 추천 규칙 ==========

export const DEFAULT_PRODUCT_RULES: ProductRecommendationRule[] = [
    {
        id: 'prod_calm_sleep',
        productId: 'calm_sleep',
        productName: '캄 슬립 (수면)',
        conditions: [
            { field: 'survey.isi', operator: '>=', value: 10 },
        ],
        combinator: 'OR',
        enabled: true,
    },
    {
        id: 'prod_calm_sleep_pns',
        productId: 'calm_sleep',
        productName: '캄 슬립 (PNS 저하)',
        conditions: [
            { field: 'hrv.pns', operator: '<', value: 20 },
        ],
        combinator: 'OR',
        enabled: true,
    },
    {
        id: 'prod_ad_up',
        productId: 'super_arginine_6000',
        productName: '슈퍼 아르기닌 (피로)',
        conditions: [
            { field: 'survey.fatigueSymptomsCount', operator: '>=', value: 3 },
        ],
        combinator: 'OR',
        enabled: true,
    },
    {
        id: 'prod_ad_up_chronic',
        productId: 'super_arginine_6000',
        productName: '슈퍼 아르기닌 (만성피로)',
        conditions: [
            { field: 'survey.chronicFatigue', operator: '==', value: true },
        ],
        combinator: 'OR',
        enabled: true,
    },
    {
        id: 'prod_energy_bal',
        productId: 'magnesium_capsule',
        productName: '마그네슘 (긴장)',
        conditions: [
            { field: 'hrv.sns', operator: '>', value: 65 },
        ],
        combinator: 'OR',
        enabled: true,
    },
    {
        id: 'prod_energy_bal_bai',
        productId: 'magnesium_capsule',
        productName: '마그네슘 (불안)',
        conditions: [
            { field: 'survey.bai', operator: '>=', value: 15 },
        ],
        combinator: 'OR',
        enabled: true,
    },
    {
        id: 'prod_no_cardi',
        productId: 'no_cardi_ginkgo',
        productName: '엔오카디 (두뇌)',
        conditions: [
            { field: 'hrv.brainScore', operator: '<', value: 75 },
        ],
        combinator: 'OR',
        enabled: true,
    },
    {
        id: 'prod_no_cardi_conc',
        productId: 'no_cardi_ginkgo',
        productName: '엔오카디 (집중력)',
        conditions: [
            { field: 'survey.concentrationScore', operator: '<', value: 12 },
        ],
        combinator: 'OR',
        enabled: true,
    },
    {
        id: 'prod_magnesium',
        productId: 'magnesium_capsule',
        productName: '마그네슘 (스트레스/뇌파긴장)',
        conditions: [
            { field: 'hrv.stressResistance', operator: '<', value: 40 },
            { field: 'hrv.dominantEEG', operator: '==', value: 'H-Beta' },
        ],
        combinator: 'OR',
        enabled: true,
    },
    // ========== 혈액검사 기반 제품 추천 규칙 ==========
    {
        id: 'prod_iron_hemo',
        productId: 'active_b_complex',
        productName: '비컴플렉스 (빈혈 지원/활력)',
        conditions: [
            { field: 'bloodTest.hemoglobin', operator: '<', value: 13 },
        ],
        combinator: 'OR',
        enabled: true,
    },
    {
        id: 'prod_vitd_low',
        productId: 'every_d_plus',
        productName: '에브리 D (비타민D 부족)',
        conditions: [
            { field: 'bloodTest.vitaminD', operator: '<', value: 30 },
        ],
        combinator: 'OR',
        enabled: true,
    },
    {
        id: 'prod_omega_crp',
        productId: 'rtg_omega3_plus',
        productName: '오메가-3 (염증지표 상승)',
        conditions: [
            { field: 'bloodTest.crp', operator: '>', value: 1 },
        ],
        combinator: 'OR',
        enabled: true,
    },
    {
        id: 'prod_liver_ast',
        productId: 'livermarin',
        productName: '리버마린 (간기능 이상)',
        conditions: [
            { field: 'bloodTest.ast', operator: '>', value: 40 },
            { field: 'bloodTest.alt', operator: '>', value: 40 },
        ],
        combinator: 'OR',
        enabled: true,
    },
    {
        id: 'prod_bsbal_hba1c',
        productId: 'berberine',
        productName: '베르베린 (혈당 주의)',
        conditions: [
            { field: 'bloodTest.hba1c', operator: '>=', value: 5.7 },
        ],
        combinator: 'OR',
        enabled: true,
    },
    {
        id: 'prod_immune_nk',
        productId: 'immune_one',
        productName: '이뮨원 (NK세포 저하)',
        conditions: [
            { field: 'bloodTest.nkActivity', operator: '<', value: 500 },
        ],
        combinator: 'OR',
        enabled: true,
    },
];

// ========== 기본 Secret Point 규칙 ==========

export const DEFAULT_SECRET_POINT_RULES: SecretPointRule[] = [
    {
        id: 'sp_gad7',
        category: 'screening',
        message: 'GAD-7 (범불안장애 선별) 실시 고려',
        conditions: [
            { field: 'survey.bai', operator: '>=', value: 15 },
        ],
        combinator: 'OR',
        severity: 'warning',
        enabled: true,
    },
    {
        id: 'sp_psqi',
        category: 'screening',
        message: 'PSQI (피츠버그 수면 질 지수) 실시 권고',
        conditions: [
            { field: 'survey.isi', operator: '>=', value: 15 },
        ],
        combinator: 'OR',
        severity: 'warning',
        enabled: true,
    },
    {
        id: 'sp_adhd',
        category: 'screening',
        message: 'ADHD 스크리닝 검사 고려',
        conditions: [
            { field: 'survey.concentrationScore', operator: '>=', value: 20 },
        ],
        combinator: 'OR',
        severity: 'info',
        enabled: true,
    },
    {
        id: 'sp_cortisol',
        category: 'screening',
        message: '스트레스 호르몬(코티솔) 검사 권고',
        conditions: [
            { field: 'hrv.sns', operator: '>', value: 70 },
        ],
        combinator: 'OR',
        severity: 'warning',
        enabled: true,
    },
    {
        id: 'sp_psychiatry',
        category: 'referral',
        message: '정신건강의학과 초진 검토',
        conditions: [
            { field: 'survey.bai', operator: '>=', value: 25 },
        ],
        combinator: 'OR',
        severity: 'critical',
        enabled: true,
    },
    {
        id: 'sp_sleep_clinic',
        category: 'referral',
        message: '수면 클리닉 연계 권장',
        conditions: [
            { field: 'survey.isi', operator: '>=', value: 20 },
        ],
        combinator: 'OR',
        severity: 'critical',
        enabled: true,
    },
];

// ========== 기본 설정 ==========

export const DEFAULT_LOGIC_CONFIG: LogicEngineConfig = {
    classificationRules: DEFAULT_CLASSIFICATION_RULES,
    productRules: DEFAULT_PRODUCT_RULES,
    secretPointRules: DEFAULT_SECRET_POINT_RULES,
    thresholds: DEFAULT_THRESHOLDS,
    version: '1.0.0',
    lastModified: new Date().toISOString(),
};

// ========== 유틸리티 함수 ==========

export const loadLogicConfig = (): LogicEngineConfig => {
    try {
        const saved = localStorage.getItem('sn1_logic_config');
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {
        console.error('Failed to load logic config:', e);
    }
    return { ...DEFAULT_LOGIC_CONFIG };
};

export const saveLogicConfig = (config: LogicEngineConfig): void => {
    config.lastModified = new Date().toISOString();
    localStorage.setItem('sn1_logic_config', JSON.stringify(config));
};

export const resetLogicConfig = (): LogicEngineConfig => {
    const defaultConfig = {
        ...DEFAULT_LOGIC_CONFIG,
        lastModified: new Date().toISOString()
    };
    localStorage.setItem('sn1_logic_config', JSON.stringify(defaultConfig));
    return defaultConfig;
};

// ========== 규칙 평가 함수 ==========

export const evaluateCondition = (
    condition: LogicCondition,
    data: { hrv: any; survey: any; protocol?: any; analytics?: any; bloodTest?: any; cognitive?: any }
): boolean => {
    const parts = condition.field.split('.');
    const category = parts[0];
    
    // First, determine the root object based on category
    let rootValue: any;
    if (category === 'hrv') rootValue = data.hrv;
    else if (category === 'survey') rootValue = data.survey;
    else if (category === 'protocol') rootValue = data.protocol;
    else if (category === 'analytics') rootValue = data.analytics;
    else if (category === 'bloodTest') rootValue = data.bloodTest;
    else if (category === 'cognitive') rootValue = data.cognitive;
    else return false;

    if (rootValue === undefined || rootValue === null) return false;

    // Deep property access for remaining parts
    let value: any = rootValue;
    for (let i = 1; i < parts.length; i++) {
        if (value === undefined || value === null) return false;
        value = value[parts[i]];
    }

    // Special fallback for bloodTest if it resolves to 0
    if (category === 'bloodTest' && (value === undefined || value === null || value === 0)) {
        return false;
    }

    if (Array.isArray(value)) {
        if (condition.operator === '==') {
            // Handle both exact match (if value is array of primitive) or inclusion
            return value.includes(condition.value);
        }
        if (condition.operator === '!=') {
            return !value.includes(condition.value);
        }
    }

    switch (condition.operator) {
        case '>=': return value >= condition.value;
        case '<=': return value <= condition.value;
        case '>': return value > condition.value;
        case '<': return value < condition.value;
        case '==': return value === condition.value;
        case '!=': return value !== condition.value;
        default: return false;
    }
};

export const evaluateRule = (
    conditions: LogicCondition[],
    combinator: 'AND' | 'OR',
    data: { hrv: any; survey: any; protocol?: any; analytics?: any; bloodTest?: any; cognitive?: any }
): boolean => {
    if (combinator === 'AND') {
        return conditions.every(c => evaluateCondition(c, data));
    } else {
        return conditions.some(c => evaluateCondition(c, data));
    }
};

// ========== 고급 평가 함수 ==========

export const evaluateClassificationRules = (
    rules: ClassificationRule[],
    hrv: any,
    survey: any
): CareType | null => {
    // 우선순위가 낮은 숫자일수록 먼저 적용 (1 -> 2 -> 3)
    const sorted = [...rules]
        .filter(r => r.enabled)
        .sort((a, b) => a.priority - b.priority);

    for (const rule of sorted) {
        if (evaluateRule(rule.conditions, rule.combinator, { hrv, survey })) {
            return rule.result;
        }
    }
    return null;
};

export interface RecommendedProduct {
    productId: string;
    tier: 'ESSENTIAL' | 'RECOMMENDED' | 'SUPPORTIVE';
}

const CARETYPE_ESSENTIAL_MAP: Record<CareType, string[]> = {
    [CareType.BURNOUT]: ['super_arginine_6000', 'magnesium_capsule'],
    [CareType.ANXIETY_TENSION]: ['magnesium_capsule', 'calm_sleep'],
    [CareType.STRESS_OVERLOAD]: ['magnesium_capsule', 'calm_sleep'],
    [CareType.LOW_ENERGY]: ['super_arginine_6000', 'active_b_complex'],
    [CareType.DEPRESSION_AMOTIVATION]: ['every_d_plus', 'active_b_complex'],
    [CareType.ADRENAL]: ['super_arginine_6000', 'active_b_complex'],
    [CareType.BRAIN_FATIGUE]: ['no_cardi_ginkgo', 'rtg_omega3_plus'],
    [CareType.HYPERSENSITIVE]: ['magnesium_capsule', 'calm_sleep'],
    [CareType.ATTENTION_DEFICIT]: ['no_cardi_ginkgo', 'rtg_omega3_plus'],
    [CareType.SLEEP]: ['calm_sleep', 'magnesium_capsule'],
    [CareType.CIRCULATION]: ['rtg_omega3_plus', 'no_cardi_ginkgo'],
    [CareType.HEALTHY]: ['probiotics_complete', 'immune_one'],
    [CareType.CONCENTRATION]: ['no_cardi_ginkgo', 'rtg_omega3_plus'],
    [CareType.UNASSESSED]: []
};

export const evaluateProductRules = (
    rules: ProductRecommendationRule[],
    hrv: any,
    survey: any,
    careType: CareType,
    bloodTest?: any
): RecommendedProduct[] => {
    const recommendedSet = new Set<string>();

    for (const rule of rules) {
        if (!rule.enabled) continue;

        if (rule.combinator === 'OR') {
            const passed = rule.conditions.some(cond => {
                if (cond.field === 'careType') {
                    return cond.operator === '==' ? careType === cond.value : careType !== cond.value;
                }
                return evaluateCondition(cond, { hrv, survey, bloodTest });
            });
            if (passed) recommendedSet.add(rule.productId);

        } else {
            const passed = rule.conditions.every(cond => {
                if (cond.field === 'careType') {
                    return cond.operator === '==' ? careType === cond.value : careType !== cond.value;
                }
                return evaluateCondition(cond, { hrv, survey, bloodTest });
            });
            if (passed) recommendedSet.add(rule.productId);
        }
    }

    const BASE_ESSENTIALS = [
        'active_b_complex',
        'probiotics_complete',
        'rtg_omega3_plus',
        'every_d_plus',
        'magnesium_capsule',
        'immune_one'
    ];

    const result: RecommendedProduct[] = [];
    const essentialsForCareType = CARETYPE_ESSENTIAL_MAP[careType] || [];

    // 1. Add Tier 1 (ESSENTIAL)
    essentialsForCareType.forEach(id => {
        result.push({ productId: id, tier: 'ESSENTIAL' });
        recommendedSet.delete(id); // Remove so it doesn't get added twice
    });

    // 2. Add Tier 2 (RECOMMENDED) - Any that matched rules but wasn't Tier 1
    recommendedSet.forEach(id => {
        result.push({ productId: id, tier: 'RECOMMENDED' });
    });

    // 3. Add Tier 3 (SUPPORTIVE) - Fill up to 5 products minimum from BASE_ESSENTIALS
    const currentIds = new Set(result.map(r => r.productId));
    if (result.length < 5) {
        for (const id of BASE_ESSENTIALS) {
            if (result.length >= 5) break;
            if (!currentIds.has(id)) {
                result.push({ productId: id, tier: 'SUPPORTIVE' });
                currentIds.add(id);
            }
        }
    }

    return result;
};



// ========== 점수 기반 분류 시스템 (주분류 + 부분류) ==========

import { ClassificationResult } from './types';

// 분류별 한글 이름 매핑
export const CARE_TYPE_LABELS: Record<CareType, { name: string; description: string; publicDescription: string; icon: string }> = {
    [CareType.BURNOUT]: {
        name: '과긴장 번아웃',
        description: '교감신경 과활성 + 피로 누적',
        publicDescription: '과도한 스트레스와 긴장이 지속되어, 신체와 뇌가 마치 방전된 배터리처럼 지쳐있는 상태입니다. 충분한 휴식이 시급합니다.',
        icon: '🔥'
    },
    [CareType.ANXIETY_TENSION]: {
        name: '불안-긴장형',
        description: '높은 불안 + 고주파 뇌파',
        publicDescription: '마음이 늘 불안하고 몸이 긴장되어 있어, 편안하게 이완하지 못하고 항상 쫓기는 듯한 느낌을 받을 수 있습니다.',
        icon: '😰'
    },
    [CareType.STRESS_OVERLOAD]: {
        name: '스트레스 과부하',
        description: '스트레스 저항력 저하',
        publicDescription: '외부에서 오는 스트레스를 견디는 힘이 약해져 있어, 작은 일에도 쉽게 예민해지고 짜증이 날 수 있는 상태입니다.',
        icon: '⚡'
    },
    [CareType.LOW_ENERGY]: {
        name: '무기력형',
        description: '부교감 우세 + 활력 저하',
        publicDescription: '에너지가 고갈되어 활동할 의욕이 잘 생기지 않고, 몸이 물에 젖은 솜처럼 무겁고 축 처지는 상태입니다.',
        icon: '😴'
    },
    [CareType.DEPRESSION_AMOTIVATION]: {
        name: '우울-무동기형',
        description: '동기 저하 + 세타파 우세',
        publicDescription: '기분이 가라앉고 무엇을 해도 즐거움을 느끼기 어려우며, 의욕이 생기지 않아 학습이나 업무에 집중하기 힘든 상태입니다.',
        icon: '😔'
    },
    [CareType.ADRENAL]: {
        name: '부신피로 증후군',
        description: '코르티솔 리듬 이상',
        publicDescription: '스트레스 호르몬 조절 기능이 약해져, 아침에 일어나기 힘들고 오후만 되면 급격히 피로가 몰려오는 상태입니다.',
        icon: '🥱'
    },
    [CareType.BRAIN_FATIGUE]: {
        name: '뇌피로 집중곤란',
        description: '뇌 기능 저하 + 집중력 감소',
        publicDescription: '뇌가 지쳐 정보 처리 속도가 느려지고, 머리가 멍하며 글을 읽어도 내용이 잘 들어오지 않는 상태입니다.',
        icon: '🧠'
    },
    [CareType.HYPERSENSITIVE]: {
        name: '과민성 학습장애',
        description: '과각성 + 주의 산만',
        publicDescription: '뇌가 지나치게 예민해져 있어, 작은 소리나 주변 자극에도 쉽게 산만해지고 깜짝깜짝 놀랄 수 있는 상태입니다.',
        icon: '⚠️'
    },
    [CareType.ATTENTION_DEFICIT]: {
        name: '주의력 산만형',
        description: '알파파 과다 + 주의력 저하',
        publicDescription: '뇌의 각성도가 떨어져 멍한 상태가 지속되거나, 한 가지 일에 진득하게 집중하지 못하고 주의가 쉽게 흩어집니다.',
        icon: '🎯'
    },
    [CareType.SLEEP]: {
        name: '수면 장애형',
        description: '수면 질 저하',
        publicDescription: '잠드는 데 시간이 오래 걸리거나 자다 깨다를 반복하여, 자고 일어나도 개운하지 않고 만성적인 피로감을 느낍니다.',
        icon: '🌙'
    },
    [CareType.CIRCULATION]: {
        name: '혈액순환 저하형',
        description: '혈관 건강 저하',
        publicDescription: '말초 혈액순환이 원활하지 않아 손발이 차거나 저리고, 뇌로 가는 혈류량이 부족하여 집중력이 떨어질 수 있습니다.',
        icon: '💔'
    },
    [CareType.HEALTHY]: {
        name: '건강 균형형',
        description: '전반적으로 양호',
        publicDescription: '자율신경과 뇌파가 균형을 이루고 있어, 신체적·정신적 컨디션이 매우 좋고 학습 효율이 높은 최적의 상태입니다.',
        icon: '💚'
    },
    [CareType.CONCENTRATION]: {
        name: '집중력 저하형',
        description: '레거시 호환',
        publicDescription: '집중을 유지하는 힘이 약해져 학습이나 업무 효율이 떨어지는 상태입니다.',
        icon: '📖'
    },
    [CareType.UNASSESSED]: {
        name: '데이터 부족',
        description: '입력된 데이터가 없어 분석할 수 없습니다.',
        publicDescription: '분석을 위한 충분한 데이터가 입력되지 않았습니다.',
        icon: '❓'
    },
};

// 상호배타적 분류 쌍 정의
const MUTUALLY_EXCLUSIVE_PAIRS: [CareType, CareType][] = [
    [CareType.BURNOUT, CareType.LOW_ENERGY], // SNS vs PNS
    [CareType.ANXIETY_TENSION, CareType.DEPRESSION_AMOTIVATION],
    [CareType.HYPERSENSITIVE, CareType.ATTENTION_DEFICIT], // Beta vs Alpha
];

// 조건 일치 점수 계산 (0-100)
const calculateConditionScore = (
    rule: ClassificationRule,
    data: { hrv: any; survey: any; protocol?: any; analytics?: any; bloodTest?: any },
    useBrainBody: boolean = true
): number => {
    if (!rule.enabled) return 0;

    // BrainBody 미사용 시 EEG/Brain 관련 조건 제외
    const activeConditions = useBrainBody
        ? rule.conditions
        : rule.conditions.filter(c => !c.field.startsWith('eeg') && !c.field.startsWith('brain'));

    let matchedConditions = 0;
    let partialScore = 0;

    // === Portable 모드 (uBioMacpa) 특화 로직: 즉시 판정 ===
    if (!useBrainBody && data.hrv?.portableHrv) {
        const p = data.hrv.portableHrv;

        // ansBalanceType 기반 직접 매핑 (강력한 가중치)
        const balanceMapping: Record<string, CareType> = {
            'overwork_chronic': CareType.BURNOUT,
            'acute': CareType.ADRENAL,
            'disease_chronic': CareType.CIRCULATION,
            'chronic': CareType.BURNOUT,
            'normal': CareType.HEALTHY
        };

        // Portable 모드에서는 ansBalanceType 매핑이 성공하면 즉시 점수 반환
        if (balanceMapping[p.ansBalanceType] === rule.result) {
            // 매핑 성공 시 즉시 80점 반환 (데이터 부족 방지)
            let portableScore = 80;

            // 스트레스 지수로 보정
            if (p.stressIndex >= 60) portableScore = 95;
            else if (p.stressIndex >= 45) portableScore = 88;

            return portableScore;
        }

        // 스트레스 지수 기반 추가 매핑 (BURNOUT/STRESS_OVERLOAD)
        if (rule.result === CareType.BURNOUT || rule.result === CareType.STRESS_OVERLOAD) {
            if (p.stressIndex >= 50) return 75;
            if (p.stressIndex >= 40) return 60;
        }

        // 매핑되지 않은 경우 낮은 점수
        // 매핑되지 않은 경우, 일반 조건 평가로 넘어갑니다 (점수 누적 가능하도록)
    }

    // 기존 조건 평가 루프
    for (const condition of activeConditions) {
        // 데이터 카테고리 확인
        const [category, field] = condition.field.split('.');
        let value: any;

        if (category === 'hrv') value = data.hrv?.[field];
        else if (category === 'survey') value = data.survey?.[field];
        else if (category === 'protocol') value = data.protocol?.[field];
        else if (category === 'analytics') value = data.analytics?.[field];
        else if (category === 'bloodTest') value = data.bloodTest?.[field];
        else continue;

        if (value === undefined || value === null) continue;

        // 완전 일치 체크
        const isMatch = evaluateCondition(condition, data);
        if (isMatch) {
            matchedConditions++;
            partialScore += 100;
        } else if (typeof value === 'number' && typeof condition.value === 'number') {
            // 부분 점수 (수치 조건의 경우 거리 기반)
            const threshold = condition.value as number;
            const diff = Math.abs(value - threshold);
            const maxDiff = Math.abs(threshold) * 0.5; // 50% 범위 내

            if (diff < maxDiff) {
                const proximity = 1 - (diff / maxDiff);
                partialScore += proximity * 60; // 최대 60점 부분 점수
            }
        }
    }

    const totalConditions = activeConditions.length + (matchedConditions > 0 && activeConditions.length === 0 ? 1 : 0);
    if (totalConditions === 0) return 0;

    // AND 조합기: 모두 충족해야 높은 점수
    if (rule.combinator === 'AND') {
        const matchRatio = Math.min(1, matchedConditions / totalConditions);
        // Portable 모드에서는 조건이 적으므로 임계값 완화
        const finalScore = Math.round((partialScore / totalConditions) * matchRatio);
        return !useBrainBody ? Math.min(100, finalScore * 1.3) : finalScore;
    }

    // OR 조합기: 하나만 충족해도 점수 부여
    const finalScoreOr = Math.round(partialScore / totalConditions);
    return !useBrainBody ? Math.min(100, finalScoreOr * 1.3) : finalScoreOr;
};

// 점수 기반 분류 평가 (주분류 + 부분류)
export const evaluateClassificationWithScores = (
    rules: ClassificationRule[],
    hrv: any,
    survey: any,
    protocol?: any,
    analytics?: any,
    bloodTest?: any,
    useBrainBody: boolean = true
): ClassificationResult => {
    const data = { hrv, survey, protocol, analytics, bloodTest };

    // 모든 분류에 대해 점수 계산
    const scores: { type: CareType; score: number; rule: ClassificationRule }[] = [];

    for (const rule of rules) {
        if (!rule.enabled) continue;

        const score = calculateConditionScore(rule, data, useBrainBody);
        scores.push({ type: rule.result, score, rule });
    }

    // 점수 내림차순 정렬
    scores.sort((a, b) => b.score - a.score);

    // 주분류 결정 (가장 높은 점수)
    let primary: CareType;
    let primaryScore = 0;
    let finalAllScores: { type: CareType; score: number }[] = [];

    // 유효한 점수가 있는 분류가 없거나, 최고 점수가 0점 이하인 경우에만 UNASSESSED 처리
    if (scores.length === 0 || scores[0].score <= 0) {
        primary = CareType.UNASSESSED;
        primaryScore = 0;
        finalAllScores = [{ type: CareType.UNASSESSED, score: 0 }]; // Special score for display
        return {
            primary,
            primaryScore,
            secondary: [],
            secondaryScores: [],
            allScores: finalAllScores
        };
    } else {
        primary = scores[0].type;
        primaryScore = scores[0].score;
    }

    // 부분류 결정 (50점 이상, 상호배타 제외, 최대 2개)
    const secondary: CareType[] = [];
    const secondaryScores: { type: CareType; score: number }[] = [];

    for (const item of scores.slice(1)) {
        if (item.score < 50) continue;
        if (secondary.length >= 2) break;

        // 상호배타 체크
        const isExclusive = MUTUALLY_EXCLUSIVE_PAIRS.some(([a, b]) =>
            (primary === a && item.type === b) || (primary === b && item.type === a)
        );

        if (!isExclusive) {
            secondary.push(item.type);
            secondaryScores.push({ type: item.type, score: item.score });
        }
    }

    // 전체 점수 (UI 표시용)
    const allScores = scores.map(s => ({ type: s.type, score: s.score }));

    return {
        primary,
        primaryScore,
        secondary,
        secondaryScores,
        allScores
    };
};

// evaluateClassificationRules 확장 (protocol, analytics 지원)
export const evaluateClassificationRulesExtended = (
    rules: ClassificationRule[],
    hrv: any,
    survey: any,
    protocol?: any,
    analytics?: any
): CareType | null => {
    const sorted = [...rules]
        .filter(r => r.enabled)
        .sort((a, b) => a.priority - b.priority);

    for (const rule of sorted) {
        if (evaluateRule(rule.conditions, rule.combinator, { hrv, survey, protocol, analytics })) {
            return rule.result;
        }
    }
    return null;
};

// evaluateRule 확장
export const evaluateRuleExtended = (
    conditions: LogicCondition[],
    combinator: 'AND' | 'OR',
    data: { hrv: any; survey: any; protocol?: any; analytics?: any; bloodTest?: any }
): boolean => {
    if (combinator === 'AND') {
        return conditions.every(c => evaluateCondition(c, data));
    } else {
        return conditions.some(c => evaluateCondition(c, data));
    }
};

// NEW: Secret Point Validation
export interface SecretPointValidationResult {
    id: string;
    message: string;
    severity: 'info' | 'warning' | 'critical';
    conditions: LogicCondition[];
    combinator?: 'AND' | 'OR';
}

export const evaluateSecretPointRules = (
    rules: SecretPointRule[],
    hrv: any,
    survey: any,
    protocol?: any,
    analytics?: any
): SecretPointValidationResult[] => {
    const results: SecretPointValidationResult[] = [];
    // enabled 체크
    const activeRules = rules.filter(r => r.enabled);

    for (const rule of activeRules) {
        // evaluateRuleExtended 재사용
        if (evaluateRuleExtended(rule.conditions, rule.combinator, { hrv, survey, protocol, analytics, bloodTest: undefined })) {
            results.push({
                id: rule.id,
                message: rule.message,
                severity: rule.severity,
                conditions: rule.conditions,
                combinator: rule.combinator
            });
        }
    }
    return results;
};
