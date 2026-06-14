
export const ANALYSIS_TYPES = {
    ANXIETY: '정서 불안형 (Emotional Instability Type)',
    MOTIVATION: '동기 결여형 (Low Motivation Type)',
    ENVIRONMENT: '환경 취약형 (Environmental Sensitivity Type)',
    IMMERSION: '몰입 저하형 (Low Immersion Type)',
    BALANCED: '균형 잡힌 학습자 (Balanced Learner)'
} as const;

export type AnalysisType = typeof ANALYSIS_TYPES[keyof typeof ANALYSIS_TYPES];

export const ANALYSIS_TEXTS = {
    // 1. 종합 유형 분석 (Overall Classification)
    overview: {
        [ANALYSIS_TYPES.ANXIETY]: {
            title: "🛑 핵심 진단: 심리적 긴장도가 높은 '정서 불안형'",
            desc: "현재 학생은 학습 상황에서 과도한 긴장과 불안을 경험하고 있습니다. 이는 뇌의 경계 태세(High Beta)를 높여 정보 처리를 방해하고, 쉽게 피로감을 느끼게 합니다. 성적에 대한 압박이나 실패에 대한 두려움이 실제 수행 능력을 저하시키는 주원인으로 분석됩니다."
        },
        [ANALYSIS_TYPES.MOTIVATION]: {
            title: "🛑 핵심 진단: 학습 에너지가 부족한 '동기 결여형'",
            desc: "뇌의 각성 수준이 낮고(Theta/Alpha 우세), 학습에 대한 내적 동기가 활성화되지 않은 상태입니다. '해야 한다'는 것은 알지만 몸과 뇌가 따라주지 않는 무기력감이 관찰되며, 이는 장기적인 학습 지구력을 떨어뜨립니다."
        },
        [ANALYSIS_TYPES.ENVIRONMENT]: {
            title: "🛑 핵심 진단: 주변 자극에 예민한 '환경 취약형'",
            desc: "청각적/시각적 자극에 대한 뇌의 필터링 기능이 약해져 있어, 작은 소음이나 주변 변화에도 쉽게 주의가 분산됩니다. 스트레스 저항력이 일시적으로 낮아져 있어, 학습 환경의 물리적 요소(소음, 조명, 온도 등)가 학습 효율을 크게 좌우하고 있습니다."
        },
        [ANALYSIS_TYPES.IMMERSION]: {
            title: "🛑 핵심 진단: 깊은 집중이 어려운 '몰입 저하형'",
            desc: "책상에는 오래 앉아 있지만, 뇌파상 학습에 필요한 중-고베타(M/H-Beta) 파가 효율적으로 유지되지 않아 실제 학습 밀도가 낮습니다. 잡념이 많거나(Dudding), 주의력이 겉도는 현상이 나타나고 있어 시간 대비 효율이 떨어집니다."
        },
        [ANALYSIS_TYPES.BALANCED]: {
            title: "🟢 핵심 진단: 안정적인 '자기주도 학습형'",
            desc: "전반적인 뇌-신체 스트레스 균형이 잘 잡혀 있습니다. 현재의 컨디션을 유지하면서 고난도 학습 전략을 적용하기에 적합한 상태입니다."
        }
    },

    // 2. 신경-신체 분석 (Neuro-Physical Analysis)
    brainBody: {
        snsDominant: "교감신경 항진(SNS Dominance)으로 인해 신체가 항상 '전투 준비 태세'를 유지하고 있습니다. 이는 뇌의 에너지 소모를 가속화하여 학습 후반부에 급격한 집중력 저하를 유발할 수 있습니다.",
        pnsDominant: "부교감신경 과활성 또는 교감신경 저하로 인해 전반적인 신체 활력이 떨어져 있습니다. 아침에 일어나기 힘들거나 낮 시간에 멍한 상태가 지속될 수 있습니다.",
        brainFatigue: "뇌 피로 지수(Brain Score)가 낮게 측정되어, 정보 처리 속도가 평소보다 느려져 있을 가능성이 큽니다. 휴식 없이 학습 시간만 늘리는 것은 비효율적입니다.",
        highStress: "높은 뇌 스트레스 수치는 전두엽의 실행 기능(계획, 판단)을 일시적으로 마비시킬 수 있습니다. '알던 문제도 틀리는' 실수가 잦아질 수 있는 상태입니다."
    },

    // 3. 행동 및 개입 전략 (Actionable Intervention)
    solutions: {
        stressCare: [
            "**[호흡법]**: 학습 시작 전 3분간 '4-7-8 호흡'을 통해 교감신경을 낮추는 것이 필수적입니다.",
            "**[영양]**: 마그네슘(Mg)과 테아닌(L-Theanine) 섭취를 통해 신체적 긴장 완화를 돕는 것을 권장합니다."
        ],
        motivationBoost: [
            "**[작은 성공 경험]**: 하루 목표를 아주 작게(예: 문제 5개 풀기) 설정하여 성취감을 뇌에 각인시켜야 합니다.",
            "**[도파민 관리]**: 학습 직전 스마트폰 사용을 금지하고, 학습 완료 직후에 보상을 제공하는 루틴이 필요합니다."
        ],
        envControl: [
            "**[환경 통제]**: 소음 차단 헤드셋이나 백색 소음기를 적극 활용하십시오.",
            "**[시각 차단]**: 독서실형 책상이나 시야 가림막을 사용하여 시각적 분산 요인을 물리적으로 제거해야 합니다."
        ],
        focusTraining: [
            "**[포모도로]**: 25분 집중 후 5분 휴식 주기를 철저히 지켜, 뇌가 '끝나는 시간'을 인지하게 하십시오.",
            "**[능동적 학습]**: 눈으로만 읽지 말고 손으로 쓰거나 말로 설명하는 '다감각 학습'을 통해 뇌 각성도를 높여야 합니다."
        ]
    }
};
