import type { AssessmentResult } from '../../../types';
import { getAnalystDisplayText } from '../../../utils/analystConfig';
import { generateSleepPrescription } from '../../../utils/sleepLogic';

// Examiner / BMI / bio-metric panel / sleep schedule / demographics / efficiency data
// (all moved verbatim from MedicalReport.tsx; no logic change)

export const resolveExaminerDisplay = (
    config: { currentExaminerId?: string | null; examiners?: { id: string; position?: string }[] } | undefined,
    result: AssessmentResult
) => {
    const getCurrentExaminer = () => {
        if (!config?.currentExaminerId || !config?.examiners) return null;
        return config.examiners.find(e => e.id === config.currentExaminerId);
    };
    const examiner = getCurrentExaminer();
    const examinerDisplay = examiner
        ? `${examiner.id}${examiner.position ? ` (${examiner.position})` : ''}`
        : (result.analystConfig ? getAnalystDisplayText(result.analystConfig) : 'Dr. Lim');
    return { examiner, examinerDisplay };
};

export const resolveBmi = (student: AssessmentResult['student']) => {
    const bmi = student.bmi || (student.weight && student.height ? student.weight / ((student.height / 100) ** 2) : 0);
    const bmiStatus = bmi > 25 ? '비만 (Obese)' : bmi > 23 ? '과체중 (Overweight)' : '정상 (Normal)';
    return { bmi, bmiStatus };
};

export interface ScorePanelInput {
    hrv: AssessmentResult['hrv'];
    survey: AssessmentResult['survey'];
    protocol: AssessmentResult['protocol'];
    analytics: AssessmentResult['analytics'];
    cognitiveResults: any;
    usePortable?: boolean;
}

// Dynamic bio-metric scores
export const resolveScorePanel = (input: ScorePanelInput) => {
    const { hrv, survey, protocol, analytics, cognitiveResults, usePortable } = input;
    const hasHRV = Boolean(
        (hrv as any).isHrvTested ?? (
            (usePortable && (hrv as any).portableHrv && (hrv as any).portableHrv.pulseVariability > 0) ||
            Boolean((hrv.hrvIndex && hrv.hrvIndex > 0) || (hrv.meanHr && hrv.meanHr > 0))
        )
    );

    const surveyStressVal = survey?.bai && survey.bai > 0 ? Math.round(Math.min(95, (survey.bai / 63) * 100)) : (protocol?.stressLevel && protocol.stressLevel > 0 ? protocol.stressLevel * 10 : 42);
    const stressScore = hasHRV ? (hrv.physicalStress || 50) : surveyStressVal;

    const sleepDeficit = protocol?.sleepHours && protocol.sleepHours > 0 ? Math.max(0, (8 - protocol.sleepHours) * 12) : 15;
    const insomniaVal = survey?.isi && survey.isi > 0 ? Math.round((survey.isi / 28) * 50) : 15;
    const surveyFatigueVal = Math.min(95, Math.max(15, sleepDeficit + insomniaVal + 10));
    const fatigueScore = hasHRV ? (hrv.fatigue || 45) : surveyFatigueVal;

    const vitalityScore = hasHRV ? (hrv.vitality || Math.max(15, 100 - fatigueScore)) : Math.max(15, Math.min(95, 100 - fatigueScore));

    const pureRatioVal = analytics?.pureStudyRatio && analytics.pureStudyRatio > 0 ? analytics.pureStudyRatio : 65;
    const cognitiveVal = cognitiveResults?.attention?.accuracy ? cognitiveResults.attention.accuracy : (cognitiveResults?.processingSpeed?.averageAccuracy || 70);
    const surveyConcentrationVal = Math.round(pureRatioVal * 0.5 + cognitiveVal * 0.5);
    const concentrationScore = hrv.concentrationLevel || surveyConcentrationVal;

    const ansBalanceScore = Math.max(20, Math.min(95, Math.round(100 - (stressScore * 0.45) - (fatigueScore * 0.35))));

    const calculatedSns = Math.min(85, Math.max(25, Math.round(40 + (stressScore * 0.45) - (vitalityScore * 0.15))));
    const calculatedPns = 100 - calculatedSns;
    const snsScore = (hrv.sns && hrv.sns > 0) ? hrv.sns : calculatedSns;
    const pnsScore = (hrv.pns && hrv.pns > 0) ? hrv.pns : calculatedPns;

    const ansStatusText = snsScore > 60
        ? '교감신경 우세 (긴장)'
        : pnsScore > 60
            ? '부교감 우세 (나른)'
            : '자율신경 균형 양호';
    const ansScoreText = `${ansBalanceScore}점`;

    return {
        hasHRV, stressScore, fatigueScore, vitalityScore, concentrationScore,
        ansBalanceScore, snsScore, pnsScore, ansStatusText, ansScoreText,
    };
};

// Brain Peak Time calculation (100% synchronized with chronobiologyEngine)
export const resolveSleepSchedule = (result: AssessmentResult) => {
    const sleepPrescription = generateSleepPrescription(result.careType, result.analytics);

    const parseTimeHour = (timeStr: string) => parseInt(timeStr.split(':')[0], 10);
    const bedHour = parseTimeHour(sleepPrescription.recommendedBedtime) || 23;
    const wakeHour = parseTimeHour(sleepPrescription.recommendedWakeTime) || 7;

    const isMorningType = wakeHour <= 7;
    let goldenStartNum = isMorningType ? 10 : 14;
    if (result.analytics?.goldenTimeStart) {
        const parsed = parseInt(result.analytics.goldenTimeStart.split(':')[0], 10);
        if (!isNaN(parsed)) goldenStartNum = parsed;
    }
    let goldenEndNum = goldenStartNum + 2;
    if (result.hrv.brainScore && result.hrv.brainScore > 70) {
        goldenEndNum += 1;
    }

    const slumpStartNum = goldenStartNum + 4;
    const slumpEndNum = slumpStartNum + 1;
    const secondStartNum = slumpEndNum + 2;
    const secondEndNum = 22;

    const formatHour = (h: number) => `${h.toString().padStart(2, '0')}:00`;
    const goldenStart = formatHour(goldenStartNum);
    const goldenEnd = formatHour(goldenEndNum);

    return {
        sleepPrescription, parseTimeHour, bedHour, wakeHour, isMorningType,
        goldenStartNum, goldenEndNum, slumpStartNum, slumpEndNum,
        secondStartNum, secondEndNum, formatHour, goldenStart, goldenEnd,
    };
};

// Date & Age
export const resolveDemographics = (student: AssessmentResult['student']) => {
    const today = student.testDate || new Date().toISOString().split('T')[0];
    const age = student.age || (new Date().getFullYear() - new Date(student.birthDate).getFullYear());
    const genderStr = student.gender === 'Male' ? 'M' : 'F';
    return { today, age, genderStr };
};

// 5대 학습 효율성 검사 시행 여부 및 데이터 추출 (survey 필드와의 듀얼 폴백 보장)
export const resolveEfficiencyData = (studyEfficiencyResults: any, survey: AssessmentResult['survey']) => {
    const chronoData = studyEfficiencyResults?.chronotype || (survey?.chronotypeScore !== undefined && survey?.chronotypeResult ? {
        score: survey.chronotypeScore,
        result: survey.chronotypeResult as any
    } : undefined);
    const isChronoTested = Boolean(chronoData?.result);

    const varkData = studyEfficiencyResults?.vark || (survey?.varkPrimary && survey?.varkScores ? {
        ...survey.varkScores,
        primary: survey.varkPrimary as any,
        primaryStyle: survey.varkPrimary as any
    } : undefined);
    const varkStyle = varkData?.primaryStyle || varkData?.primary;
    const isVarkTested = Boolean(varkStyle);

    const taiData = studyEfficiencyResults?.testAnxiety || studyEfficiencyResults?.tai || (survey?.testAnxietyCognitive !== undefined && survey?.testAnxietySomatic !== undefined ? {
        cognitiveScore: survey.testAnxietyCognitive,
        somaticScore: survey.testAnxietySomatic,
        totalScore: survey.testAnxietyCognitive + survey.testAnxietySomatic,
        dominantType: survey.testAnxietyType || 'balanced',
        severity: (survey.testAnxietyCognitive + survey.testAnxietySomatic) <= 21 ? 'low' : (survey.testAnxietyCognitive + survey.testAnxietySomatic) <= 35 ? 'moderate' : 'high'
    } : undefined);
    const isTaiTested = Boolean(taiData && (taiData.totalScore !== undefined || taiData.result || taiData.severity));

    const digitalData = studyEfficiencyResults?.digitalAddiction || (survey?.digitalAddictionLevel ? {
        totalScore: survey.digitalAddictionScore ?? 0,
        level: survey.digitalAddictionLevel as any,
        dopamineStatus: survey.digitalAddictionLevel === 'healthy' ? '정상: 도파민 보상 체계가 건강합니다.' :
            survey.digitalAddictionLevel === 'caution' ? '주의: 도파민 민감도가 다소 저하되었을 수 있습니다.' :
                survey.digitalAddictionLevel === 'risk' ? '경계: 도파민 수용체 둔감화가 진행 중일 수 있습니다.' :
                    '위험: 즉각적 보상에 길들여져 지연된 보상(공부)이 어렵습니다.',
        toleranceScore: 0,
        withdrawalScore: 0,
        controlScore: 0,
        impactScore: 0
    } : undefined);
    const isDigitalTested = Boolean(digitalData?.level);

    const metaData = studyEfficiencyResults?.metacognition || (survey?.metacognitionLevel && survey?.metacognitionScores ? {
        learnerLevel: survey.metacognitionLevel as any,
        level: survey.metacognitionLevel as any,
        rehearsalScore: survey.metacognitionScores.rehearsal,
        elaborationScore: survey.metacognitionScores.elaboration,
        organizationScore: survey.metacognitionScores.organization,
        metacognitiveScore: survey.metacognitionScores.metacognitive,
        dominantStrategy: 'balanced'
    } : undefined);
    const metaLevel = metaData?.level || metaData?.learnerLevel;
    const isMetaTested = Boolean(metaLevel);

    const completedEffCount = [isChronoTested, isVarkTested, isTaiTested, isDigitalTested, isMetaTested].filter(Boolean).length;

    return {
        chronoData, isChronoTested, varkData, varkStyle, isVarkTested,
        taiData, isTaiTested, digitalData, isDigitalTested,
        metaData, metaLevel, isMetaTested, completedEffCount,
    };
};
