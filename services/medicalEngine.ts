import { BloodTestData, MedicalAnalysis, MedicalFinding, CareType, HRVData, SurveyData } from '../types';

// Reference ranges for blood tests
const REFERENCE_RANGES = {
    wbc: { min: 4.0, max: 10.0 },  // ×10³/μL
    hemoglobin: { male: { min: 13, max: 17 }, female: { min: 12, max: 16 } },
    hematocrit: { male: { min: 40, max: 54 }, female: { min: 36, max: 48 } },
    mcv: { min: 80, max: 100 },
    nkActivity: { min: 15, max: 40 },
    vitaminD: { deficient: 20, insufficient: 30, optimal: 100 },
    crp: { normal: 0.5, mild: 1.0, high: 3.0 },
    hba1c: { normal: 5.7, prediabetes: 6.4 },
    ast: { max: 40 },
    alt: { max: 40 },
    creatinine: { male: { min: 0.7, max: 1.3 }, female: { min: 0.5, max: 1.1 } },
    bun: { min: 7, max: 20 }
};

// Cross-Matching Patterns (혈액검사 + HRV + 설문 연계)
export interface CrossMatchPattern {
    id: string;
    name: string;
    bloodConditions: { item: string; condition: 'high' | 'low' | 'critical' }[];
    hrvConditions?: { sns?: 'high' | 'low'; pns?: 'high' | 'low' };
    surveyConditions?: { bai?: 'high'; isi?: 'high'; chronicFatigue?: boolean };
    interpretation: string;
    severity: 'mild' | 'moderate' | 'severe';
    recommendations: string[];
}

export const CROSS_MATCH_PATTERNS: CrossMatchPattern[] = [
    {
        id: 'inflammatory_stress',
        name: '염증성 스트레스 증후군',
        bloodConditions: [{ item: 'crp', condition: 'high' }],
        hrvConditions: { sns: 'high' },
        surveyConditions: { bai: 'high' },
        interpretation: 'CRP 상승과 교감신경 우세가 동시에 나타나는 염증성 스트레스 상태입니다. 만성 염증이 교감신경을 자극하여 불안과 긴장을 유발하는 악순환이 발생하고 있습니다.',
        severity: 'severe',
        recommendations: ['🥗 항염증 식단 (오메가-3, 채소, 베리류) 즉시 적용', '🧘 하루 2회 복식호흡 또는 명상 10분', '😴 수면 시간 7-8시간 확보 필수']
    },
    {
        id: 'immune_fatigue',
        name: '면역-피로 연계 증후군',
        bloodConditions: [{ item: 'nkActivity', condition: 'low' }],
        hrvConditions: { pns: 'high' },
        surveyConditions: { chronicFatigue: true },
        interpretation: 'NK세포 활성도 저하와 만성피로가 동시에 나타납니다. 만성 스트레스로 인한 면역 억제 상태로, 감염 취약성과 회복력 저하가 우려됩니다.',
        severity: 'severe',
        recommendations: ['😴 수면 우선! 10시 취침 목표', '🧄 면역력 강화 식품: 마늘, 버섯류, 프로폴리스', '🚫 과도한 운동 자제, 가벼운 산책으로 대체']
    },
    {
        id: 'vitd_depression',
        name: '비타민D 결핍성 우울',
        bloodConditions: [{ item: 'vitaminD', condition: 'low' }],
        hrvConditions: { pns: 'high' },
        surveyConditions: { bai: 'high' },
        interpretation: '비타민D 결핍이 세로토닌 합성 저하를 유발하여 우울감과 무기력을 동반합니다. 부교감신경 우세와 함께 나타나는 전형적인 저에너지 상태입니다.',
        severity: 'moderate',
        recommendations: ['☀️ 비타민D 3000-4000 IU/일 보충', '🌞 점심시간 15분 햇볕 노출', '🐟 비타민D 풍부 식품: 연어, 고등어, 달걀노른자']
    },
    {
        id: 'anemia_concentration',
        name: '빈혈성 집중력 장애',
        bloodConditions: [{ item: 'hemoglobin', condition: 'low' }],
        hrvConditions: { sns: 'high' },
        interpretation: '빈혈로 인한 뇌 산소 공급 부족이 집중력 저하를 유발합니다. 몸이 산소 부족을 보상하려고 교감신경이 활성화되어 피로감과 두근거림이 동반됩니다.',
        severity: 'moderate',
        recommendations: ['🩸 철분제 복용 (공복에 비타민C와 함께)', '🥩 철분 풍부 식품: 붉은 고기, 시금치, 콩류', '☕ 식사 전후 1시간 카페인 섭취 피하기']
    },
    {
        id: 'metabolic_brain_fog',
        name: '대사성 뇌안개',
        bloodConditions: [{ item: 'hba1c', condition: 'high' }, { item: 'mcv', condition: 'high' }],
        interpretation: '당화혈색소 상승과 MCV 증가가 동시에 나타나는 대사 이상 상태입니다. 혈당 불안정이 뇌안개(Brain Fog)와 오후 집중력 저하를 유발합니다.',
        severity: 'severe',
        recommendations: ['🍽️ 저탄수화물/케톤 식단 고려', '🚶 식후 15-20분 산책 필수', '⏰ 식사 간격 4-5시간 유지, 간식 줄이기']
    },
    {
        id: 'chronic_fatigue_triad',
        name: '만성피로 삼중주',
        bloodConditions: [{ item: 'mcv', condition: 'high' }, { item: 'vitaminD', condition: 'low' }, { item: 'crp', condition: 'high' }],
        surveyConditions: { chronicFatigue: true, isi: 'high' },
        interpretation: 'MCV 상승(B12 결핍), 비타민D 부족, CRP 상승이 동시에 나타나는 전형적인 만성피로 패턴입니다. 수면 장애와 함께 복합적인 영양 결핍이 의심됩니다.',
        severity: 'severe',
        recommendations: ['💊 종합 영양제 + B12 + 비타민D 병용', '🩺 내과 전문의 상담 권장', '📊 3개월 후 재검사 필수']
    },
    {
        id: 'liver_stress',
        name: '간-스트레스 연계',
        bloodConditions: [{ item: 'ast', condition: 'high' }, { item: 'alt', condition: 'high' }],
        hrvConditions: { sns: 'high' },
        interpretation: '간효소 상승과 교감신경 과활성이 동시에 나타납니다. 만성 스트레스가 간에 부담을 주고 있으며, 피로 물질 축적으로 인한 만성 피로가 우려됩니다.',
        severity: 'moderate',
        recommendations: ['🍵 간 해독 지원: 밀크씨슬, 녹차', '🚫 알코올 완전 절제', '🧘 스트레스 해소 활동 강화']
    },
    {
        id: 'dehydration_stress',
        name: '탈수-스트레스 복합',
        bloodConditions: [{ item: 'hematocrit', condition: 'high' }, { item: 'bun', condition: 'high' }],
        hrvConditions: { sns: 'high' },
        interpretation: '헤마토크리트와 BUN 상승이 탈수 상태를 나타냅니다. 탈수는 혈액 점도를 높여 뇌 혈류를 감소시키고 집중력 저하와 두통을 유발합니다.',
        severity: 'moderate',
        recommendations: ['💧 하루 2L 이상 수분 섭취', '🥤 카페인 음료 대신 물/허브차', '🧂 전해질 보충 (과일, 견과류)']
    }
];

// Export reference ranges for UI validation
export const getBloodTestRanges = (gender: 'Male' | 'Female' | 'Other' = 'Male') => ({
    wbc: REFERENCE_RANGES.wbc,
    hemoglobin: gender === 'Female' ? REFERENCE_RANGES.hemoglobin.female : REFERENCE_RANGES.hemoglobin.male,
    hematocrit: gender === 'Female' ? REFERENCE_RANGES.hematocrit.female : REFERENCE_RANGES.hematocrit.male,
    mcv: REFERENCE_RANGES.mcv,
    nkActivity: REFERENCE_RANGES.nkActivity,
    vitaminD: { min: REFERENCE_RANGES.vitaminD.insufficient, max: REFERENCE_RANGES.vitaminD.optimal },
    crp: { min: 0, max: REFERENCE_RANGES.crp.normal },
    hba1c: { min: 0, max: REFERENCE_RANGES.hba1c.normal },
    ast: { min: 0, max: REFERENCE_RANGES.ast.max },
    alt: { min: 0, max: REFERENCE_RANGES.alt.max },
    creatinine: gender === 'Female' ? REFERENCE_RANGES.creatinine.female : REFERENCE_RANGES.creatinine.male,
    bun: REFERENCE_RANGES.bun
});

// Analyze individual blood test item
const analyzeItem = (
    item: string,
    value: number,
    gender: 'Male' | 'Female' | 'Other' = 'Male'
): MedicalFinding => {
    let normalRange = '';
    let status: 'normal' | 'low' | 'high' | 'critical' = 'normal';
    let interpretation = '';

    switch (item) {
        case 'wbc':
            normalRange = `${REFERENCE_RANGES.wbc.min}-${REFERENCE_RANGES.wbc.max} ×10³/μL`;
            if (value > REFERENCE_RANGES.wbc.max * 1.5) {
                status = 'critical';
                interpretation = '백혈구 수치가 현저히 상승했습니다. 급성 감염 또는 심각한 염증 상태가 의심됩니다.';
            } else if (value > REFERENCE_RANGES.wbc.max) {
                status = 'high';
                interpretation = '백혈구 증가. 감염, 염증 또는 스트레스 반응이 있을 수 있습니다.';
            } else if (value < REFERENCE_RANGES.wbc.min) {
                status = 'low';
                interpretation = '백혈구 감소. 면역력 저하로 감염에 취약한 상태입니다.';
            } else {
                interpretation = '백혈구 수치가 정상입니다.';
            }
            break;

        case 'hematocrit':
            const hctRange = gender === 'Female' ? REFERENCE_RANGES.hematocrit.female : REFERENCE_RANGES.hematocrit.male;
            normalRange = `${hctRange.min}-${hctRange.max}%`;
            if (value > hctRange.max) {
                status = 'high';
                interpretation = '헤마토크리트 상승. 탈수 또는 다혈증이 의심됩니다. 혈액 점도 증가로 두통, 집중력 저하가 발생할 수 있습니다.';
            } else if (value < hctRange.min) {
                status = 'low';
                interpretation = '헤마토크리트 저하. 빈혈 상태로 피로와 무기력의 원인이 됩니다.';
            } else {
                interpretation = '헤마토크리트가 정상입니다.';
            }
            break;

        case 'hemoglobin':
            const hgRange = gender === 'Female' ? REFERENCE_RANGES.hemoglobin.female : REFERENCE_RANGES.hemoglobin.male;
            normalRange = `${hgRange.min}-${hgRange.max} g/dL`;
            if (value < hgRange.min - 2) {
                status = 'critical';
                interpretation = '심각한 빈혈 상태입니다. 뇌로 가는 산소 공급이 현저히 부족하여 극심한 피로와 집중력 저하가 예상됩니다.';
            } else if (value < hgRange.min) {
                status = 'low';
                interpretation = '경도 빈혈입니다. 만성 피로와 학습 효율 저하의 원인이 될 수 있습니다.';
            } else if (value > hgRange.max) {
                status = 'high';
                interpretation = '헤모글로빈이 높습니다. 탈수 가능성이 있으며 수분 섭취를 권장합니다.';
            } else {
                interpretation = '정상 범위입니다. 산소 운반 능력이 양호합니다.';
            }
            break;

        case 'mcv':
            normalRange = `${REFERENCE_RANGES.mcv.min}-${REFERENCE_RANGES.mcv.max} fL`;
            if (value < REFERENCE_RANGES.mcv.min) {
                status = 'low';
                interpretation = '소구성 빈혈 가능성. 철분 결핍을 의심해야 합니다.';
            } else if (value > REFERENCE_RANGES.mcv.max) {
                status = 'high';
                interpretation = '대구성 빈혈 가능성. 비타민 B12 또는 엽산 결핍을 고려해야 합니다.';
            } else {
                interpretation = '적혈구 크기가 정상입니다.';
            }
            break;

        case 'nkActivity':
            normalRange = `${REFERENCE_RANGES.nkActivity.min}-${REFERENCE_RANGES.nkActivity.max}%`;
            if (value < 15) {
                status = 'critical';
                interpretation = 'NK세포 활성도가 심각하게 낮습니다. 면역력 저하로 감염에 취약하며, 만성 스트레스로 인한 면역 억제가 의심됩니다.';
            } else if (value < REFERENCE_RANGES.nkActivity.min) {
                status = 'low';
                interpretation = 'NK세포 활성도가 낮습니다. 스트레스 관리와 충분한 수면이 필요합니다.';
            } else if (value > REFERENCE_RANGES.nkActivity.max) {
                status = 'high';
                interpretation = 'NK세포 활성도가 높습니다. 면역 기능이 활발합니다.';
            } else {
                interpretation = '면역 기능이 정상 범위입니다.';
            }
            break;

        case 'vitaminD':
            normalRange = '30-100 ng/mL';
            if (value < REFERENCE_RANGES.vitaminD.deficient) {
                status = 'critical';
                interpretation = '비타민D 결핍입니다. 세로토닌 합성 저하로 우울감, 수면 장애, 집중력 저하가 발생할 수 있습니다. 즉시 보충이 필요합니다.';
            } else if (value < REFERENCE_RANGES.vitaminD.insufficient) {
                status = 'low';
                interpretation = '비타민D 부족입니다. 학습 효율과 기분 조절에 영향을 줄 수 있습니다.';
            } else {
                interpretation = '비타민D 수치가 적정합니다.';
            }
            break;

        case 'crp':
            normalRange = '<1.0 mg/L';
            if (value > REFERENCE_RANGES.crp.mild) {
                status = 'critical';
                interpretation = '만성 염증 상태입니다. 전신 염증은 뇌 기능 저하와 인지 능력 감소를 유발합니다.';
            } else if (value > REFERENCE_RANGES.crp.normal) {
                status = 'high';
                interpretation = '경미한 염증 반응이 있습니다. 식이 조절과 스트레스 관리가 필요합니다.';
            } else {
                interpretation = '염증 지표가 정상입니다.';
            }
            break;

        case 'hba1c':
            normalRange = '<5.7%';
            if (value > REFERENCE_RANGES.hba1c.prediabetes) {
                status = 'critical';
                interpretation = '당뇨 범위입니다. 혈당 불안정으로 인한 집중력 저하와 에너지 롤러코스터 현상이 심각합니다.';
            } else if (value > REFERENCE_RANGES.hba1c.normal) {
                status = 'high';
                interpretation = '당뇨 전단계입니다. 식후 졸음과 오후 집중력 저하의 원인이 될 수 있습니다.';
            } else {
                interpretation = '혈당 조절이 양호합니다.';
            }
            break;

        case 'ast':
            normalRange = '0-40 U/L';
            if (value > REFERENCE_RANGES.ast.max * 2) {
                status = 'critical';
                interpretation = 'AST가 현저히 상승했습니다. 간 기능 이상이 의심되며 전문의 상담이 필요합니다.';
            } else if (value > REFERENCE_RANGES.ast.max) {
                status = 'high';
                interpretation = 'AST가 경미하게 상승했습니다. 간의 해독 부담이 증가한 상태입니다.';
            } else {
                interpretation = '간 기능이 정상입니다.';
            }
            break;

        case 'alt':
            normalRange = '0-40 U/L';
            if (value > REFERENCE_RANGES.alt.max * 2) {
                status = 'critical';
                interpretation = 'ALT가 현저히 상승했습니다. 간세포 손상이 의심됩니다.';
            } else if (value > REFERENCE_RANGES.alt.max) {
                status = 'high';
                interpretation = 'ALT가 경미하게 상승했습니다. 피로 물질 축적의 원인이 될 수 있습니다.';
            } else {
                interpretation = '간세포 상태가 정상입니다.';
            }
            break;

        case 'creatinine':
            const crRange = gender === 'Female' ? REFERENCE_RANGES.creatinine.female : REFERENCE_RANGES.creatinine.male;
            normalRange = `${crRange.min}-${crRange.max} mg/dL`;
            if (value > crRange.max * 1.5) {
                status = 'critical';
                interpretation = '신장 기능 저하가 의심됩니다. 전문의 상담이 필요합니다.';
            } else if (value > crRange.max) {
                status = 'high';
                interpretation = '신장 기능이 경미하게 저하되었습니다. 충분한 수분 섭취가 필요합니다.';
            } else if (value < crRange.min) {
                status = 'low';
                interpretation = '근육량 감소 또는 영양 부족이 의심됩니다.';
            } else {
                interpretation = '신장 기능이 정상입니다.';
            }
            break;

        case 'bun':
            normalRange = `${REFERENCE_RANGES.bun.min}-${REFERENCE_RANGES.bun.max} mg/dL`;
            if (value > REFERENCE_RANGES.bun.max) {
                status = 'high';
                interpretation = 'BUN 상승. 탈수 또는 단백질 과다 섭취 가능성이 있습니다.';
            } else if (value < REFERENCE_RANGES.bun.min) {
                status = 'low';
                interpretation = 'BUN 저하. 단백질 섭취 부족이 의심됩니다.';
            } else {
                interpretation = '질소 대사가 정상입니다.';
            }
            break;

        default:
            normalRange = 'N/A';
            interpretation = '분석 불가';
    }

    return {
        item,
        value,
        normalRange,
        status,
        interpretation
    };
};

// Generate CareType correlation analysis
const generateCareTypeCorrelation = (
    findings: MedicalFinding[],
    careType: CareType
): string => {
    const abnormal = findings.filter(f => f.status !== 'normal');

    if (abnormal.length === 0) {
        return `현재 ${careType} 유형으로 진단되었으나, 혈액검사 결과는 모두 정상 범위입니다. 생활 습관 개선만으로도 충분한 회복이 가능합니다.`;
    }

    let correlation = `현재 **${careType}** 유형 진단과 혈액검사 이상 소견의 연관성:\n\n`;

    // CareType별 연관 분석
    const careTypeAnalysis: Record<string, string[]> = {
        [CareType.BURNOUT]: ['hemoglobin', 'vitaminD', 'ast', 'alt', 'nkActivity'],
        [CareType.SLEEP]: ['vitaminD', 'crp', 'hba1c'],
        [CareType.CONCENTRATION]: ['hemoglobin', 'mcv', 'hba1c', 'vitaminD'],
        [CareType.CIRCULATION]: ['hemoglobin', 'crp', 'creatinine'],
        [CareType.ADRENAL]: ['vitaminD', 'hba1c', 'nkActivity', 'crp'],
        [CareType.HEALTHY]: []
    };

    const relevantItems = careTypeAnalysis[careType] || [];
    const relevantAbnormal = abnormal.filter(f => relevantItems.includes(f.item));

    if (relevantAbnormal.length > 0) {
        relevantAbnormal.forEach(finding => {
            correlation += `- **${finding.item}** (${finding.value}, ${finding.status}): ${finding.interpretation}\n`;
        });
        correlation += `\n위 이상 소견들이 ${careType} 증상을 악화시키는 주요 원인으로 작용할 수 있습니다.`;
    } else {
        correlation += `혈액검사 이상 소견이 있으나, 현재 진단된 ${careType} 유형과 직접적인 연관성은 낮습니다. 그러나 전반적인 건강 관리가 필요합니다.`;
    }

    return correlation;
};

// Generate recommendations based on findings
const generateRecommendations = (findings: MedicalFinding[]): string[] => {
    const recommendations: string[] = [];
    const abnormal = findings.filter(f => f.status !== 'normal');

    abnormal.forEach(finding => {
        switch (finding.item) {
            case 'hemoglobin':
                if (finding.status === 'low' || finding.status === 'critical') {
                    recommendations.push('🩸 철분제 복용 권장 (공복 시 비타민C와 함께)');
                    recommendations.push('🥩 철분 풍부 식품 섭취: 붉은 고기, 시금치, 콩류');
                }
                break;
            case 'vitaminD':
                if (finding.status === 'low' || finding.status === 'critical') {
                    recommendations.push('☀️ 비타민D 2000-4000 IU/일 보충 권장');
                    recommendations.push('🌞 하루 15분 이상 햇볕 노출');
                }
                break;
            case 'crp':
                if (finding.status !== 'normal') {
                    recommendations.push('🥗 항염증 식단 권장: 오메가-3, 채소, 견과류');
                    recommendations.push('🧘 스트레스 관리 및 충분한 수면');
                }
                break;
            case 'hba1c':
                if (finding.status !== 'normal') {
                    recommendations.push('🍽️ 저탄수화물/저당 식단 전환');
                    recommendations.push('🚶 식후 15분 가벼운 산책');
                }
                break;
            case 'ast':
            case 'alt':
                if (finding.status !== 'normal') {
                    recommendations.push('🍵 간 해독 지원: 밀크씨슬, 녹차');
                    recommendations.push('🚫 알코올 및 고지방 식품 제한');
                }
                break;
            case 'nkActivity':
                if (finding.status === 'low' || finding.status === 'critical') {
                    recommendations.push('😴 수면 시간 7-8시간 확보 필수');
                    recommendations.push('🧄 면역력 강화 식품: 마늘, 버섯류, 프로폴리스');
                }
                break;
        }
    });

    // Remove duplicates
    return [...new Set(recommendations)];
};

// Main analysis function
export const analyzeMedicalData = (
    bloodTest: BloodTestData,
    careType: CareType,
    gender: 'Male' | 'Female' | 'Other' = 'Male'
): MedicalAnalysis => {
    const findings: MedicalFinding[] = [
        analyzeItem('wbc', bloodTest.wbc, gender),
        analyzeItem('hemoglobin', bloodTest.hemoglobin, gender),
        analyzeItem('hematocrit', bloodTest.hematocrit, gender),
        analyzeItem('mcv', bloodTest.mcv, gender),
        analyzeItem('nkActivity', bloodTest.nkActivity, gender),
        analyzeItem('vitaminD', bloodTest.vitaminD, gender),
        analyzeItem('crp', bloodTest.crp, gender),
        analyzeItem('hba1c', bloodTest.hba1c, gender),
        analyzeItem('ast', bloodTest.ast, gender),
        analyzeItem('alt', bloodTest.alt, gender),
        analyzeItem('creatinine', bloodTest.creatinine, gender),
        analyzeItem('bun', bloodTest.bun, gender)
    ];

    const abnormalFindings = findings.filter(f => f.status !== 'normal');
    const careTypeCorrelation = generateCareTypeCorrelation(findings, careType);
    const recommendations = generateRecommendations(findings);

    // Generate follow-up advice
    const criticalCount = abnormalFindings.filter(f => f.status === 'critical').length;
    let followUpAdvice = '';

    if (criticalCount >= 2) {
        followUpAdvice = '🚨 복수의 심각한 이상 소견이 발견되었습니다. 1주 내 내과 전문의 상담을 강력히 권장합니다.';
    } else if (criticalCount === 1) {
        followUpAdvice = '⚠️ 심각한 이상 소견이 1건 있습니다. 2주 내 전문의 상담을 권장합니다.';
    } else if (abnormalFindings.length > 0) {
        followUpAdvice = '📋 경미한 이상 소견이 있습니다. 3개월 후 재검사를 권장합니다.';
    } else {
        followUpAdvice = '✅ 모든 검사 결과가 정상입니다. 연 1회 정기 검진을 유지하세요.';
    }

    return {
        abnormalFindings,
        careTypeCorrelation,
        recommendations,
        followUpAdvice
    };
};

// Generate markdown report section for medical analysis
export const generateMedicalReportSection = (
    bloodTest: BloodTestData,
    analysis: MedicalAnalysis,
    medicalNotes?: string
): string => {
    let report = `
## 🩺 [의학적 정밀 분석] Medical Expert Analysis

### 혈액검사 결과 요약
| 항목 | 측정값 | 정상범위 | 판정 |
|-----|--------|---------|------|
`;

    // Add all findings to table
    const allItems = [
        { name: 'Hemoglobin (Hg)', key: 'hemoglobin', value: bloodTest.hemoglobin, unit: 'g/dL' },
        { name: 'MCV', key: 'mcv', value: bloodTest.mcv, unit: 'fL' },
        { name: 'NK 활성도', key: 'nkActivity', value: bloodTest.nkActivity, unit: '%' },
        { name: '비타민 D', key: 'vitaminD', value: bloodTest.vitaminD, unit: 'ng/mL' },
        { name: 'CRP', key: 'crp', value: bloodTest.crp, unit: 'mg/L' },
        { name: 'HbA1c', key: 'hba1c', value: bloodTest.hba1c, unit: '%' },
        { name: 'AST', key: 'ast', value: bloodTest.ast, unit: 'U/L' },
        { name: 'ALT', key: 'alt', value: bloodTest.alt, unit: 'U/L' },
        { name: 'Creatinine', key: 'creatinine', value: bloodTest.creatinine, unit: 'mg/dL' },
        { name: 'BUN', key: 'bun', value: bloodTest.bun, unit: 'mg/dL' }
    ];

    allItems.forEach(item => {
        const finding = analysis.abnormalFindings.find(f => f.item === item.key);
        const statusIcon = finding
            ? (finding.status === 'critical' ? '🚨' : finding.status === 'high' ? '⬆️' : finding.status === 'low' ? '⬇️' : '✅')
            : '✅';
        const range = finding?.normalRange || '-';
        report += `| ${item.name} | ${item.value} ${item.unit} | ${range} | ${statusIcon} |\n`;
    });

    report += `
### CareType 연관 분석
${analysis.careTypeCorrelation}

### 의학적 권고사항
${analysis.recommendations.map(r => `- ${r}`).join('\n') || '- 특별한 권고사항 없음'}

### 추적 관찰 안내
${analysis.followUpAdvice}
`;

    if (medicalNotes) {
        report += `
### 전문가 메모 (Expert Notes)
${medicalNotes}
`;
    }

    report += `
---
*본 분석은 의료 참고 자료이며, 최종 진단은 전문 의료인과 상담하시기 바랍니다.*
`;

    return report.trim();
};

// Default/empty blood test data
export const getDefaultBloodTest = (): BloodTestData => ({
    wbc: 0,
    hemoglobin: 0,
    hematocrit: 0,
    mcv: 0,
    nkActivity: 0,
    vitaminD: 0,
    crp: 0,
    hba1c: 0,
    ast: 0,
    alt: 0,
    creatinine: 0,
    bun: 0,
    fastingHours: 0
});

// Cross-Matching Analysis Function (혈액검사 + HRV + 설문 연계 분석)
export const performCrossMatching = (
    bloodTest: BloodTestData,
    hrv: HRVData,
    survey: SurveyData,
    gender: 'Male' | 'Female' | 'Other' = 'Male'
): { matchedPatterns: CrossMatchPattern[]; summary: string } => {
    const matchedPatterns: CrossMatchPattern[] = [];

    // 각 혈액검사 항목의 상태 판정
    const getItemStatus = (item: string): 'normal' | 'low' | 'high' | 'critical' => {
        const finding = analyzeItem(item, (bloodTest as any)[item], gender);
        return finding.status;
    };

    // HRV 상태 판정
    const snsStatus = hrv.sns > 60 ? 'high' : hrv.sns < 40 ? 'low' : 'normal';
    const pnsStatus = hrv.pns > 60 ? 'high' : hrv.pns < 40 ? 'low' : 'normal';

    // 설문 상태 판정
    const baiStatus = survey.bai > 21 ? 'high' : 'normal';
    const isiStatus = survey.isi > 14 ? 'high' : 'normal';

    // 각 Cross-Matching 패턴 검사
    CROSS_MATCH_PATTERNS.forEach(pattern => {
        let matched = true;

        // 혈액검사 조건 확인
        for (const cond of pattern.bloodConditions) {
            const status = getItemStatus(cond.item);
            if (cond.condition === 'high' && status !== 'high' && status !== 'critical') {
                matched = false;
                break;
            }
            if (cond.condition === 'low' && status !== 'low' && status !== 'critical') {
                matched = false;
                break;
            }
            if (cond.condition === 'critical' && status !== 'critical') {
                matched = false;
                break;
            }
        }

        // HRV 조건 확인 (있는 경우)
        if (matched && pattern.hrvConditions) {
            if (pattern.hrvConditions.sns === 'high' && snsStatus !== 'high') matched = false;
            if (pattern.hrvConditions.sns === 'low' && snsStatus !== 'low') matched = false;
            if (pattern.hrvConditions.pns === 'high' && pnsStatus !== 'high') matched = false;
            if (pattern.hrvConditions.pns === 'low' && pnsStatus !== 'low') matched = false;
        }

        // 설문 조건 확인 (있는 경우)
        if (matched && pattern.surveyConditions) {
            if (pattern.surveyConditions.bai === 'high' && baiStatus !== 'high') matched = false;
            if (pattern.surveyConditions.isi === 'high' && isiStatus !== 'high') matched = false;
            if (pattern.surveyConditions.chronicFatigue && !survey.chronicFatigue) matched = false;
        }

        if (matched) {
            matchedPatterns.push(pattern);
        }
    });

    // 요약 생성
    let summary = '';
    if (matchedPatterns.length === 0) {
        summary = '혈액검사와 자율신경/설문 데이터 간 특이적인 연관 패턴이 발견되지 않았습니다.';
    } else {
        const severeCount = matchedPatterns.filter(p => p.severity === 'severe').length;
        const moderateCount = matchedPatterns.filter(p => p.severity === 'moderate').length;

        summary = `**${matchedPatterns.length}개의 Cross-Matching 패턴이 발견되었습니다.**\n`;
        if (severeCount > 0) summary += `🚨 심각: ${severeCount}건 `;
        if (moderateCount > 0) summary += `⚠️ 중등도: ${moderateCount}건`;
    }

    return { matchedPatterns, summary };
};
