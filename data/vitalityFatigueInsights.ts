/**
 * Vitality & Fatigue Index에 따른 공부법 추천
 * 모든 CareType에 공통 적용
 */

import { CareType, HRVData } from '../types';

// Vitality 수준별 공부법 (공통)
export const VITALITY_STUDY_RECOMMENDATIONS = {
    high: `🔋 **Vitality 80~100% (Full Charge)**

**상태**: 정신이 맑고 무엇이든 할 수 있을 것 같은 자신감이 듦. 몰입(Flow)에 진입하기 가장 쉬운 상태.

📚 **추천 공부법: [Deep Work & Hard Logic]**
• **수학**: 아예 갈피를 못 잡았던 최고난도 문제 도전
• **국어**: 배경지식이 전혀 없는 생소한 분야의 비문학 지문 뚫기
• **영어**: 추상적이고 철학적인 빈칸 추론 문제 분석

💡 **핵심 전략**: "가장 하기 싫고 미뤄뒀던 것"을 지금 처리하세요. 뇌의 연산 능력이 최고치이므로 복잡한 정보를 연결하는 능력이 극대화됩니다.`,

    standard: `🔋 **Vitality 50~70% (Standard)**

**상태**: 일상적인 업무 수행에 지장이 없음. 다만, 1시간 이상 한 자리에 앉아 있으면 집중력이 서서히 분산됨.

📚 **추천 공부법: [Structured Output]**
• **수학**: 유형별 문제 풀이 및 풀이 과정 정교화
• **국어**: 기출 지문 분석 및 선지별 근거 찾기 (객관적 증명)
• **탐구**: 개념을 백지에 스스로 구조화하여 그려보기

💡 **핵심 전략**: 뽀모도로 기법(25분 집중/5분 휴식)을 적용하세요. 바이탈이 완만하게 떨어지는 지점이므로, '강제적인 휴식'을 통해 활력을 유지하는 것이 관건입니다.`,

    low: `🔋 **Vitality 30~40% (Low Battery)**

**상태**: 커피가 생각나고, 스마트폰에 자꾸 손이 감. 새로운 내용을 배우는 것이 고통스러움.

📚 **추천 공부법: [Active Input & Maintenance]**
• **언어**: 아는 단어 재복습, 단순 문법 문제 풀기
• **수학**: 단순 연산이나 이미 풀었던 문제 다시 풀기
• **공통**: 오답 정리, 책상 정리, 다음 날 스케줄 짜기

💡 **핵심 전략**: "손을 바삐 움직이세요." 뇌는 쉬고 싶어 하므로 근육 자극을 통해 뇌를 강제로 돌려야 합니다. 시각 자료(유튜브 교육 영상 등)를 활용하는 것도 방법입니다.`,

    emergency: `🔋 **Vitality 10~20% (Emergency)**

**상태**: 멍하니 화면만 보거나 글자가 '문자'가 아닌 '그림'으로 보임. 의지력(Willpower)이 완전히 고갈됨.

📚 **추천 공부법: [Passive Exposure]**
• **영어**: 영어 라디오나 뉴스 틀어놓기 (배경음악처럼)
• **국어**: 아주 쉬운 수필이나 잡지 읽기
• **공통**: 단 10분만 서서 공부하거나, 아예 15분간 전략적 취침

💡 **핵심 전략**: 이 상태에서 어려운 공부를 하면 학습 혐오감만 생깁니다. 바이탈을 50%까지 올리기 위한 '회복'에 집중하세요. 가벼운 산책이나 샤워가 공부보다 낫습니다.`
};

// Fatigue 수준별 공부법 (공통)
export const FATIGUE_STUDY_RECOMMENDATIONS = {
    optimal: `😴 **피로 지수 10~30% (최적의 상태)**

**상태**: 살짝 나른하거나 평온함. 뇌 회전이 원활함.

📚 **공부법: [Deep Work] - 가장 어렵고 복잡한 과제**
• 새로운 고난도 개념 학습
• 수학 킬러 문항 도전
• 국어 고난도 비문학 지문 분석

⏱️ **전략**: 50분 집중 / 10분 휴식 루틴

💡 **Tip**: 이 상태는 금방 지나갑니다. '예열'한다고 쉬운 것만 하지 말고 바로 본론(가장 싫고 힘든 공부)으로 들어가세요.`,

    moderate: `😴 **피로 지수 40~60% (주의 집중 저하)**

**상태**: 눈이 조금 뻑뻑함. 같은 문장을 두 번 읽기 시작함. 잡생각이 침투함.

📚 **공부법: [Active Learning] - 손과 입을 쓰는 공부**
• 영어 단어 암기
• 이미 배운 내용 복습
• 탐구 과목 요약 노트 정리

⏱️ **전략**: 25분 집중 / 5분 휴식 (뽀모도로 기법)

💡 **Tip**: '눈'으로만 하는 공부는 금물입니다. 손으로 쓰고, 입으로 중얼거리며 뇌에 강제 신호를 보내야 집중력이 유지됩니다.`,

    high: `😴 **피로 지수 70~80% (한계 도달)**

**상태**: 머리가 무겁고 두통이 올 수 있음. 의자에 앉아 있는 것 자체가 고통임.

📚 **공부법: [Passive Learning] - 입력 위주의 공부**
• 인터넷 강의 시청 (배속 활용)
• 기출문제 해설지 읽기
• 듣기 평가 연습

⏱️ **전략**: 15분 공부 / 15분 휴식 혹은 서서 공부하기

💡 **Tip**: 생산적인 사고가 어렵습니다. 남이 설명해주는 것을 듣거나 간단한 확인 작업 위주로 진행하세요. 효율이 안 나면 '20분 파워 냅(낮잠)'이 공부 1시간보다 효과적입니다.`,

    burnout: `😴 **피로 지수 90% 이상 (번아웃/수면 부족)**

**상태**: 글자가 흐릿하게 보이고 감정 조절이 안 됨(짜증이 남). 멍하게 화면만 봄.

📚 **공부법: [Maintenance] - 유지 및 환경 정리**
• 책상 정리
• 내일 계획 세우기
• 단어 10개만 보고 덮기

⏱️ **전략**: 즉시 중단 및 취침

💡 **Tip**: 이 상태에서 공부를 지속하면 '공부에 대한 거부감'만 커집니다. 뇌가 정보를 저장(Consolidation)할 시간을 줘야 합니다. 지금 바로 자는 것이 내일의 공부 효율을 결정합니다.`
};

// 피로도별 과목 배치표 (현재 상태용 행 반환)
const getCurrentFatigueSubjectRow = (fatigueLevel: string) => {
    switch (fatigueLevel) {
        case 'optimal': return `| 10~30% | 신규 고난도 독해 | 미해결 킬러 문항 | 복잡한 구문 분석 | 생소한 개념 암기 |`;
        case 'moderate': return `| 40~60% | 문학 지문 분석 | 아는 유형 반복 풀이 | 단어 암기/쉐도잉 | 요약 노트 만들기 |`;
        case 'high': return `| 70~80% | 문학 작품 영상 시청 | 기본 연산 연습 | 듣기 평가 | 교과서 가볍게 읽기 |`;
        case 'burnout': return `| 90%+ | (휴식 권장) | (휴식 권장) | (휴식 권장) | (휴식 권장) |`;
        default: return ``;
    }
};

// Vitality 수치별 맞춤 액션 플랜 (현재 상태용 행 반환)
const getCurrentVitalityActionRow = (vitalityLevel: string) => {
    switch (vitalityLevel) {
        case 'high': return `| 80~100% | 정복(Conquer) | 킬러 문항, 신규 개념 | "최고 난이도에 뛰어들어라" |`;
        case 'standard': return `| 50~70% | 성실(Routine) | 유형 풀이, 기출 분석 | "정해진 양을 채워라" |`;
        case 'low': return `| 30~40% | 수동(Passive) | 인강 시청, 오답 필사 | "일단 앉아서 손이라도 움직여라" |`;
        case 'emergency': return `| 10~20% | 회복(Recover) | 암기 카드 훑기 | "잠깐 자거나 씻고 와라" |`;
        default: return ``;
    }
};

// Vitality Index 산출 공식 설명
export const VITALITY_INDEX_FORMULA = `
### 📈 Vitality Index (활력 지수) 산출 공식

Vitality(활력)는 단순히 피로가 없는 상태를 넘어, 뇌의 각성도와 실행 기능(Executive Function)이 얼마나 살아있는지를 의미합니다.

**Vitality% = (유연성 점수 + 탄력성 점수) / 2**

**① 유연성 점수 (Variety Score)**
• 뇌와 신경계가 외부 자극에 얼마나 기민하게 반응할 준비가 되었는지 나타냅니다
• 근거 지표: 맥박 다양성(다양성 지수)
• 성인 평균: 30~40. 높을수록 뇌의 시스템이 유연하고 활동적인 상태

**② 탄력성 점수 (Resistance Score)**
• 스트레스가 와도 무너지지 않고 버티는 신체적/정신적 에너지의 총량입니다
• 근거 지표: SDNN (맥박표준편차)
• 표준 범위보다 낮으면 활력을 유지하는 '버티는 힘'이 부족한 상태
`;

// Fatigue Index 산출 공식 설명
export const FATIGUE_INDEX_FORMULA = `
### 📉 Fatigue Index (피로 지수) 산출 공식

**Fatigue% = (스트레스 부하 점수 + 신체 여유도 감점) / 2**

**① 스트레스 부하 점수**
• 신경계가 느끼는 직접적인 피로와 압박감
• 근거 지표: 성별/연령대별 대비 상대스트레스 수치
• '정상' 범주를 벗어나면 정신적인 피로가 시작된 상태

**② 신체 여유도 감점 점수**
• 신체적인 순환과 노화 상태로 인해 발생하는 잠재적 피로도
• 근거 지표: 혈관 건강 지수, 혈관 건강도 타입
• 혈관 건강 지수가 높으면 신체가 쉽게 지칠 수 있는 상태
`;

// CareType별 Vitality & Fatigue 상관관계 해석
export const CARETYPE_VF_CORRELATION: Record<CareType, string> = {
    [CareType.BURNOUT]: `**번아웃(Hyper-Tension Burnout) 유형과의 상관관계**
번아웃 상태에서는 Vitality가 30% 이하, Fatigue가 70% 이상으로 나타나는 것이 특징입니다. 코르티솔 리듬 교란으로 아침에 에너지가 부족하고 오후에 극심한 피로감을 느낍니다.

**학습 전략**: Fatigue를 50% 이하로 낮추는 것이 최우선입니다. 수면 시간 확보와 스트레스 요인 제거가 필수입니다. Deep Work는 피하고 Passive Learning 위주로 진행하세요.`,

    [CareType.ADRENAL]: `**부신피로(Adrenal Fatigue) 유형과의 상관관계**
부신피로 상태에서는 Vitality의 유연성 점수는 높지만 탄력성 점수가 낮아 "엔진 성능은 좋지만 연료 탱크가 비어 있는" 상태입니다.

**학습 전략**: 짧은 시간에 고도의 집중력을 발휘할 수 있지만, 지속 시간이 짧습니다. 에너지가 있을 때 핵심 학습(킬러 문항)을 하고, 피로 시 즉시 휴식하는 유연한 전략이 효과적입니다.`,

    [CareType.STRESS_OVERLOAD]: `**스트레스 과부하(Stress Overload) 유형과의 상관관계**
스트레스 과부하 상태에서는 Fatigue가 40~60% 수준으로 아직 완전한 고갈은 아니지만, 지속되면 Vitality가 급격히 떨어질 위험이 있습니다.

**학습 전략**: 현재 상태에서 스트레스 요인을 관리하면 빠른 회복이 가능합니다. 뽀모도로 기법으로 강제 휴식을 취하고, Vitality를 60% 이상 유지하세요.`,

    [CareType.SLEEP]: `**수면 장애(Sleep Dysfunction) 유형과의 상관관계**
수면 문제는 Vitality와 Fatigue 모두에 직접적 영향을 미칩니다. 수면이 6시간 미만이면 Vitality가 40% 이하로 떨어지고, Fatigue는 60% 이상으로 상승합니다.

**학습 전략**: 수면 중 뇌가 정보를 장기 기억으로 전환하므로, 수면 부족은 학습 효율 급락의 직접 원인입니다. 밤 11시 이전 취침을 우선하고, 낮 공부는 Active Learning 위주로 진행하세요.`,

    [CareType.ANXIETY_TENSION]: `**불안-긴장(Anxiety-Tension) 유형과의 상관관계**
불안-긴장 상태에서는 Vitality의 유연성 점수가 높게 나타날 수 있지만, 이는 과각성으로 인한 에너지 소모입니다.

**학습 전략**: 적정 불안은 집중력을 높이지만, 과도하면 Fatigue가 빠르게 상승합니다. 4-7-8 호흡법으로 긴장을 낮추고, 손으로 쓰는 공부로 에너지를 분산시키세요.`,

    [CareType.LOW_ENERGY]: `**저에너지(Low-Energy Fatigue) 유형과의 상관관계**
저에너지 상태에서는 Vitality가 20~40% 수준으로 전반적으로 낮습니다. Fatigue가 높지 않더라도 활력 자체가 부족한 상태입니다.

**학습 전략**: 규칙적인 생활 패턴, 아침 햇빛 노출(15분 이상), 가벼운 유산소 운동으로 Vitality를 끌어올리는 것이 우선입니다. 오전에 핵심 과목을 배치하세요.`,

    [CareType.DEPRESSION_AMOTIVATION]: `**우울-무동기(Depression-Amotivation) 유형과의 상관관계**
우울-무동기 상태에서는 Vitality와 Fatigue 지표 모두 신뢰도가 낮을 수 있습니다. 동기 시스템 자체가 둔화되어 있어 에너지가 있어도 활용이 어렵습니다.

**학습 전략**: 작은 활동부터 시작하여 성취감을 쌓고, 사회적 연결(스터디 그룹)을 통해 Vitality를 회복하세요. 10분 단위의 아주 작은 목표부터 시작하세요.`,

    [CareType.BRAIN_FATIGUE]: `**뇌피로(Brain Fatigue) 유형과의 상관관계**
뇌피로 상태에서는 Fatigue가 60~80% 수준이며, 인지적 과부하가 주원인입니다. 디지털 디톡스로 뇌에 휴식을 주면 Fatigue가 빠르게 낮아집니다.

**학습 전략**: 화면 없는 시간을 하루 2시간 이상 확보하세요. 종이책 위주의 Passive Learning과 손글씨 정리가 효과적입니다. 스마트폰 알림을 끄세요.`,

    [CareType.HYPERSENSITIVE]: `**과민성(Hypersensitive Learning) 유형과의 상관관계**
과민성 상태에서는 환경 자극이 Fatigue를 빠르게 높입니다. 소음, 밝은 빛 등 외부 자극을 차단하면 Vitality가 유지됩니다.

**학습 전략**: 자극이 적은 환경 조성이 학습 효율의 핵심입니다. 이어폰, 조명 조절, 조용한 공간 확보 후 공부하세요. 짧은 세션으로 자주 휴식하세요.`,

    [CareType.ATTENTION_DEFICIT]: `**주의력 산만(Attention Deficit) 유형과의 상관관계**
주의력 산만 상태에서는 Vitality는 있지만 집중이 자주 끊겨 효율이 낮습니다. Fatigue가 상승하기 전에 짧은 세션으로 학습해야 합니다.

**학습 전략**: 뽀모도로 기법(15~20분)을 적극 활용하고, 손으로 쓰고 입으로 읽는 Active Learning으로 Vitality를 유지하세요. 스마트폰을 다른 방에 두세요.`,

    [CareType.CONCENTRATION]: `**집중력 저하(Concentration Deficiency) 유형과의 상관관계**
집중력 저하 상태에서는 수면, 스트레스, 영양 등 다양한 요인이 Vitality와 Fatigue에 복합적으로 영향을 미칩니다.

**학습 전략**: 가장 문제가 되는 요인(수면/스트레스/영양)을 파악하고 우선 개선하세요. 아침 식사와 수분 섭취를 챙기고, 50분마다 스트레칭하세요.`,

    [CareType.CIRCULATION]: `**순환 저하(Poor Circulation) 유형과의 상관관계**
순환 문제는 뇌에 산소 공급을 저하시켜 Fatigue를 높이고 Vitality를 낮춥니다.

**학습 전략**: 규칙적인 움직임(50분마다 스트레칭)과 유산소 운동으로 두 지표를 동시에 개선할 수 있습니다. 서서 공부하거나 걸으면서 암기하는 것도 효과적입니다.`,

    [CareType.HEALTHY]: `**건강 균형(Healthy Balance) 유형과의 상관관계**
건강 균형 상태에서는 Vitality 60~80%, Fatigue 30% 이하가 이상적입니다. 현재의 균형을 유지하면서 고난도 학습에 도전할 수 있는 최적의 상태입니다.

**학습 전략**: 지금이 Deep Work의 적기입니다! 킬러 문항, 신규 고난도 개념에 도전하세요. 단, 과신하여 무리하지 않도록 주의하고, 규칙적인 수면 패턴을 유지하세요.`,

    [CareType.UNASSESSED]: `**미분류(Unassessed) 유형**
정확한 Vitality & Fatigue 분석을 위해 추가 데이터가 필요합니다.

**학습 전략**: 일반적으로 Vitality 60% 이상, Fatigue 50% 이하를 유지하면 학습 효율이 최적화됩니다. 충분한 수면(7~8시간)과 규칙적인 생활 패턴이 기본입니다.`
};

// Vitality & Fatigue 통합 학습 가이드 생성
export const getVitalityFatigueGuide = (vitality: number, fatigue: number, careType: CareType): string => {
    let vitalityLevel: keyof typeof VITALITY_STUDY_RECOMMENDATIONS;
    let fatigueLevel: keyof typeof FATIGUE_STUDY_RECOMMENDATIONS;

    if (vitality >= 80) vitalityLevel = 'high';
    else if (vitality >= 50) vitalityLevel = 'standard';
    else if (vitality >= 30) vitalityLevel = 'low';
    else vitalityLevel = 'emergency';

    if (fatigue <= 30) fatigueLevel = 'optimal';
    else if (fatigue <= 60) fatigueLevel = 'moderate';
    else if (fatigue <= 80) fatigueLevel = 'high';
    else fatigueLevel = 'burnout';

    return `
### 🔋 현재 Vitality(활력 지수) 수준에 따른 학습법

${VITALITY_STUDY_RECOMMENDATIONS[vitalityLevel]}

### 😴 현재 Fatigue(피로 지수) 수준에 따른 학습법

${FATIGUE_STUDY_RECOMMENDATIONS[fatigueLevel]}

### 🔗 ${careType} 유형과의 상관관계

${CARETYPE_VF_CORRELATION[careType]}

### 📊 피로 지수 기반 맞춤 과목 배치

| 피로 지수 | 국어 | 수학 | 영어 | 탐구/암기 |
|--------|------|------|------|-----------|
${getCurrentFatigueSubjectRow(fatigueLevel)}

### 💡 활력 지수 기반 맞춤 액션 플랜

| Vitality | 추천 모드 | 권장 과목 | 행동 강령 |
|----------|-----------|-----------|-----------|
${getCurrentVitalityActionRow(vitalityLevel)}
    `.trim();
};

/**
 * Calculates correct Vitality & Fatigue metrics based on device mode
 * Returns formatted metrics and calculation detail string
 */
export const calculateVitalityFatigueMetrics = (hrv: HRVData, isPortable: boolean): {
    vitality: number;
    fatigue: number;
    calculationDetail: string;
} => {
    let vitality = 50;
    let fatigue = 50;
    let calculationDetail = '';

    if (isPortable && hrv.portableHrv) {
        // Portable Mode Logic
        const p = hrv.portableHrv;
        const varietyScore = Math.min(100, Math.max(0, p.pulseVariability * 2)); // 0-50 범위를 0-100으로 정규화
        const resistanceScore = Math.min(100, Math.max(0, p.sdnn * 2)); // SDNN 정규화
        const stressLoad = p.stressPercent || p.stressIndex;
        const vascularDeduction = Math.max(0, p.vascularHealthIndex * 2); // 혈관 건강 지수 기반 감점

        vitality = parseFloat(((varietyScore + resistanceScore) / 2).toFixed(1));
        fatigue = parseFloat(((stressLoad + vascularDeduction) / 2).toFixed(1));

        calculationDetail = `
### 🧮 지수 산출 상세 (Portable 모드)

**Vitality Index 산출:**
- 유연성 점수 (맥박 다양성 ${p.pulseVariability} 기준): **${varietyScore.toFixed(1)}점**
- 탄력성 점수 (SDNN ${p.sdnn} 기준): **${resistanceScore.toFixed(1)}점**
- **최종 Vitality**: (${varietyScore.toFixed(1)} + ${resistanceScore.toFixed(1)}) / 2 = **${vitality}%**

**Fatigue Index 산출:**
- 스트레스 부하 점수: **${stressLoad}%**
- 신체 여유도 감점 (혈관 건강 지수 ${p.vascularHealthIndex > 0 ? '+' : ''}${p.vascularHealthIndex} 기준): **${vascularDeduction.toFixed(1)}점**
- **최종 Fatigue**: (${stressLoad} + ${vascularDeduction.toFixed(1)}) / 2 = **${fatigue}%**
`;
    } else {
        // Clinical/HRV Mode Logic
        vitality = hrv.vitality || 50;
        fatigue = hrv.fatigue || 50;

        calculationDetail = `
### 🧮 지수 산출 (자율신경 분석 모드)

**측정 기반:**
- Vitality: 신체 활력도 지표 기반 (**${vitality}%**)
- Fatigue: 누적 피로 지표 기반 (**${fatigue}%**)

💡 설문 응답 및 생활 리듬 데이터를 바탕으로 정밀 분석됩니다.
`;
    }

    return { vitality, fatigue, calculationDetail };
};
