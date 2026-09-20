
import { AssessmentResult, CareType } from '../types';
import { analyzeLifestyle } from './lifestyleEngine';

export interface DeepInsight {
    coreCorrelation: {
        title: string;
        items: { label: string; value: string; impact: string; severity: 'high' | 'medium' | 'low' }[];
    }[];
    hiddenRisks: { description: string; mechanism: string }[];
    prescriptionHierarchy: { stage: number; action: string; effect: string }[];
    killerScript: string;
    personalizedReport?: {
        bmi: { title: string; advice: string; detail?: string };
        diet: { title: string; advice: string };
        exercise: { title: string; advice: string };
        learning: { title: string; advice: string };
    };
}

export const generateDeepInsight = (result: AssessmentResult): DeepInsight => {
    const { careType, hrv, survey, protocol, analytics } = result;

    let insight: DeepInsight = {
        coreCorrelation: [],
        hiddenRisks: [],
        prescriptionHierarchy: [],
        killerScript: ''
    };

    // 1. ANS Overload Group
    if (careType === CareType.BURNOUT || careType === CareType.STRESS_OVERLOAD || careType === CareType.ANXIETY_TENSION) {
        insight.coreCorrelation.push({
            title: "교감신경 과열 & 인지 효율 저하",
            items: [
                { label: "뇌 건강점수", value: `${hrv.brainScore}점`, impact: "번아웃 위험", severity: hrv.brainScore < 70 ? 'high' : 'medium' },
                { label: "신경 긴장도", value: `${hrv.sns || 60}%`, impact: "정보 처리 차단", severity: (hrv.sns || 60) > 60 ? 'high' : 'medium' },
                { label: "신체 스트레스", value: `${hrv.physicalStress}%`, impact: "만성 피로 누적", severity: hrv.physicalStress > 60 ? 'high' : 'medium' }
            ]
        });

        insight.hiddenRisks.push({
            description: "노력할수록 성적이 떨어지는 역설적 구간 진입",
            mechanism: "과도한 긴장(SNS)이 전두엽의 기억 인출을 방해하여 '아는 문제도 틀리는' 현상을 유발합니다."
        });

        insight.prescriptionHierarchy = [
            { stage: 1, action: "뇌 휴식 확보", effect: "과열된 교감신경을 진정시켜 정보 수용성 회복" },
            { stage: 2, action: "수면 질 개선", effect: "단기 기억의 영구 저장 전환율 상승" },
            { stage: 3, action: "학습량 재조정", effect: "적정 부하 유지를 통한 롱런 가능" }
        ];

        insight.killerScript = "지금 이 학생에게는 '더 많은 문제집'이 아니라 '뇌를 멍하게 두는 시간'이 필요합니다. 뇌가 숨을 쉴 수 있게 해주셔야 성적이 반등합니다.";
    }

    // 2. PNS Fatigue Group
    else if (careType === CareType.LOW_ENERGY || careType === CareType.DEPRESSION_AMOTIVATION || careType === CareType.ADRENAL) {
        insight.coreCorrelation.push({
            title: "에너지 고갈 & 실행력 저하",
            items: [
                { label: "활력 지수", value: `${hrv.vitality}`, impact: "학습 지속력 바닥", severity: hrv.vitality < 40 ? 'high' : 'medium' },
                { label: "피로 지수", value: `${hrv.fatigue}`, impact: "오후 시간 무기력", severity: hrv.fatigue > 70 ? 'high' : 'medium' },
                { label: "부신피로 점수", value: `${survey.adrenalFatigueScore}`, impact: "호르몬 불균형", severity: survey.adrenalFatigueScore > 20 ? 'high' : 'medium' }
            ]
        });

        insight.hiddenRisks.push({
            description: "의지 박약으로 오해받기 쉬운 생리적 에너지 고갈",
            mechanism: "뇌의 연료(포도당/산소) 공급 시스템이 저하되어, 의욕은 있으나 몸이 따라주지 않는 상태입니다."
        });

        insight.prescriptionHierarchy = [
            { stage: 1, action: "저녁 공부 중단", effect: "에너지 고갈 방지 및 회복 대사 활성화" },
            { stage: 2, action: "오전 중심 스케줄", effect: "잔여 에너지가 있는 시간대의 효율 극대화" },
            { stage: 3, action: "고단백 아침식사", effect: "하루 에너지 총량 증대" }
        ];

        insight.killerScript = "아이가 게으른 것이 아닙니다. 배터리가 방전된 휴대폰을 억지로 켜려는 것과 같습니다. 지금은 충전(회복)이 학습보다 우선순위가 높습니다.";
    }

    // 3. Brain & Attention Group
    else if (careType === CareType.BRAIN_FATIGUE || careType === CareType.HYPERSENSITIVE || careType === CareType.ATTENTION_DEFICIT || careType === CareType.CONCENTRATION) {
        insight.coreCorrelation.push({
            title: "주의력 분산 & 학습 누수",
            items: [
                { label: "집중도", value: `${hrv.concentrationLevel}`, impact: "학습 밀도 저하", severity: hrv.concentrationLevel < 6 ? 'high' : 'medium' },
                { label: "순공 비율", value: `${analytics.pureStudyRatio}%`, impact: "시간 낭비 심각", severity: analytics.pureStudyRatio < 60 ? 'high' : 'medium' },
                { label: "주의 산만도", value: `${protocol.noiseLevel ? protocol.noiseLevel * 10 : 30}%`, impact: "멍 때림 및 집중 누수", severity: (protocol.noiseLevel || 0) > 6 ? 'high' : 'medium' }
            ]
        });

        insight.hiddenRisks.push({
            description: "앉아있는 시간의 50%가 '허수' 시간",
            mechanism: "외부 자극에 대한 필터링 기능이 약해, 작은 소음에도 뇌 자원이 분산되어 깊은 사고가 불가능합니다."
        });

        insight.prescriptionHierarchy = [
            { stage: 1, action: "환경 통제 (소음/시각)", effect: "뇌 자원 누수 차단" },
            { stage: 2, action: "짧게 끊어치기 (20분)", effect: "집중력 한계 내에서 최대 효율 발휘" },
            { stage: 3, action: "능동적 학습법 (말하기)", effect: "뇌를 강제로 각성시켜 집중 유지" }
        ];

        insight.killerScript = "단 1시간을 공부하더라도 '밀도'를 높여야 합니다. 지금 상태로 10시간 앉아있는 것은 뇌를 괴롭히는 고문일 뿐 성적에는 도움이 되지 않습니다.";
    }

    // 4. Physical Group
    else if (careType === CareType.SLEEP || careType === CareType.CIRCULATION) {
        insight.coreCorrelation.push({
            title: "신체 불균형 & 뇌 기능 제한",
            items: [
                { label: "수면 질(ISI)", value: `${survey.isi}점`, impact: "기억 저장 실패", severity: survey.isi > 15 ? 'high' : 'medium' },
                { label: "혈관 건강", value: `${hrv.vascularHealthIndex ?? 0}`, impact: "산소 공급 부족", severity: (hrv.vascularHealthIndex ?? 0) > 10 ? 'high' : 'medium' },
                { label: "활력 지수", value: `${hrv.vitality}`, impact: "지구력 저하", severity: hrv.vitality < 50 ? 'high' : 'medium' }
            ]
        });

        insight.hiddenRisks.push({
            description: "노력 대비 성화가 나오지 않는 '밑 빠진 독' 상태",
            mechanism: "낮에 학습한 내용이 해마에서 장기 기억으로 넘어가는 과정(수면 중)에서 대량 유실되고 있습니다."
        });

        insight.prescriptionHierarchy = [
            { stage: 1, action: "수면 위생 최우선", effect: "학습 기억의 저장 효율 극대화" },
            { stage: 2, action: "가벼운 유산소 운동", effect: "뇌 혈류량 증대로 각성도 향상" },
            { stage: 3, action: "수화/영양 섭취", effect: "뇌 기능 유지를 위한 기본 조건 충족" }
        ];

        insight.killerScript = "잠을 줄여 공부 시간을 늘리는 건, 수확한 곡식을 구멍 난 자루에 담는 것과 같습니다. 1시간 더 자는 것이 2시간 더 공부하는 것보다 성적에 유리합니다.";
    }

    // 5. Healthy Group
    else {
        insight.coreCorrelation.push({
            title: "최적화된 밸런스 & 가속 가능성",
            items: [
                { label: "뇌 건강점수", value: `${hrv.brainScore}점`, impact: "고효율 학습 가능", severity: 'low' },
                { label: "집중도", value: `${hrv.concentrationLevel}`, impact: "몰입 상태 양호", severity: 'low' },
                { label: "순공 비율", value: `${analytics.pureStudyRatio}%`, impact: "높은 시간 효율", severity: 'low' }
            ]
        });

        insight.hiddenRisks.push({
            description: "방심하거나 무리할 경우 밸런스 붕괴 가능성",
            mechanism: "현재 상태는 좋으나, 난이도가 급격히 올라갈 때 스트레스 관리에 실패하면 급격히 무너질 수 있습니다."
        });

        insight.prescriptionHierarchy = [
            { stage: 1, action: "고난도 킬러 문항 도전", effect: "최상의 컨디션으로 실력 퀀텀 점프" },
            { stage: 2, action: "메타인지 강화", effect: "자신의 학습 상태를 스스로 모니터링" },
            { stage: 3, action: "루틴 고도화", effect: "최적 상태를 오래 유지하는 지구력 확보" }
        ];

        insight.killerScript = "지금이 기회입니다. 아이의 뇌가 달릴 준비가 완벽하게 되어 있습니다. 지금 엑셀을 밟아야 경쟁자들을 확실하게 따돌릴 수 있습니다.";
    }

    // Populate personalizedReport using lifestyleEngine
    const lifestyle = analyzeLifestyle(result.student, result.careType);
    insight.personalizedReport = {
        bmi: {
            title: lifestyle.bmi.title,
            advice: lifestyle.bmi.sections.map(s => `• [${s.heading}]: ${s.content}`).join('\n')
        },
        diet: {
            title: lifestyle.diet.title,
            advice: lifestyle.diet.advice.replace(/\*\*/g, '')
        },
        exercise: {
            title: lifestyle.exercise.title,
            advice: lifestyle.exercise.advice.replace(/\*\*/g, '')
        },
        learning: {
            title: lifestyle.learning.title,
            advice: lifestyle.learning.advice.replace(/\*\*/g, '')
        }
    };

    return insight;
};
