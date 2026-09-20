import {
    AssessmentResult,
    BloodTestData,
    CareType,
    HRVData,
    LearningAnalyticsData,
    PortableHRVData,
    ProtocolData,
    StudentInfo,
    SurveyData,
} from '../types';
import { CARE_STRATEGIES } from '../data/careStrategies';
import { FATIGUE_SYMPTOMS } from '../data/questions';
import { LogicEngineConfig, evaluateClassificationWithScores } from '../logicEngine';
import { evaluateBrainBodyCoherence } from './brainBodyEngine';
import { generateClinicalAnalysis } from './clinicalEngine';
import { analyzeMedicalData } from './medicalEngine';
import { mapResultsToSurveyData, StudyEfficiencyResults } from './studyEfficiencyService';
import { DatabaseService } from './database';
import { CognitivePerformanceResults } from '../components/CognitivePerformanceAssessment';
import { calculateRecommendedSubjectRatios } from './studyStrategyEngine';
import { logger } from '../utils/logger';
import { createLogicConfigSnapshot } from './logicConfigSnapshot';
import { computeAssessmentConfidence } from './assessmentConfidence';
import { inferLearningTraitsFromProfile, LearningTraitsData } from '../data/learningTraitsData';

export interface SurveyScores {
    bai: number;
    isi: number;
    concentration: number;
    adrenal: number;
    isChronicFatigue: boolean;
    fatigueCount: number;
    workingMemoryScore?: number;
}

export interface FinalAssessmentInput {
    config: { usePortable: boolean; isMedicalMode: boolean; useBrainBody?: boolean };
    portableHrv: PortableHRVData;
    hrv: HRVData;
    studyEfficiencyResults: StudyEfficiencyResults | null;
    overrideStudyEfficiencyResults?: unknown;
    surveyScores: SurveyScores;
    fatigueSymptoms: boolean[];
    snsSymptomSelection: string[];
    pnsSymptomSelection: string[];
    learningTraitsData: unknown;
    student: StudentInfo;
    protocol: ProtocolData;
    analytics: LearningAnalyticsData;
    bloodTest: BloodTestData;
    cognitiveResults: CognitivePerformanceResults | null;
    medicalNotes?: string;
    logicConfig: LogicEngineConfig;
    existingSurvey?: SurveyData | null;
}

export const buildFinalHrv = (
    usePortable: boolean,
    portableHrv: PortableHRVData,
    hrv: HRVData,
    surveyScores?: SurveyScores,
    protocol?: ProtocolData,
    analytics?: LearningAnalyticsData,
    cognitiveResults?: CognitivePerformanceResults | null,
): HRVData => {
    if (usePortable) {
        return {
            sns: portableHrv.stressPercent,
            pns: 100 - portableHrv.stressPercent,
            ansAge: 0,
            fatigue: 0,
            vitality: Math.min(100, portableHrv.sdnn),
            vlf: 0,
            tp: 0,
            hrvIndex: 0,
            ppgLevel: hrv.ppgLevel,
            brainScore: Math.min(100, portableHrv.sdnn + 10),
            dominantEEG: [],
            eegGamma: 0,
            goldenTimeStart: '10:00',
            goldenTimeEnd: '12:00',
            eegHBeta: 0,
            eegMBeta: 0,
            eegLBeta: 0,
            eegAlpha: 0,
            eegTheta: 0,
            brainBalanceL: 50,
            brainBalanceR: 50,
            brainStressCategory: '보통',
            concentrationLevel: 50,
            concentrationCategory: '중간',
            attentionLevel: 50,
            attentionCategory: '중간',
            lf: portableHrv.lf,
            hf: portableHrv.hf,
            meanHr: portableHrv.meanBpm,
            meanBpm: portableHrv.meanBpm,
            stressIndex: portableHrv.stressIndex,
            physicalStress: portableHrv.stressIndex,
            portableHrv,
        } as unknown as HRVData;
    }

    const calculatedStress = surveyScores?.bai && surveyScores.bai > 0
        ? Math.min(95, Math.max(15, Math.round((surveyScores.bai / 63) * 100)))
        : (protocol?.stressLevel && protocol.stressLevel > 0 ? protocol.stressLevel * 10 : 45);

    const sleepHours = protocol?.sleepHours || 6.5;
    const sleepDeficit = Math.max(0, (8 - sleepHours) * 10);
    const insomniaVal = surveyScores?.isi && surveyScores.isi > 0 ? Math.round((surveyScores.isi / 28) * 50) : 15;
    const calculatedFatigue = Math.min(95, Math.max(15, Math.round(sleepDeficit + insomniaVal + (surveyScores?.fatigueCount || 0) * 5 + 10)));
    const calculatedVitality = Math.max(15, Math.min(95, 100 - calculatedFatigue));

    const calculatedSns = Math.min(85, Math.max(25, Math.round(40 + (calculatedStress * 0.45) - (calculatedVitality * 0.15))));
    const calculatedPns = 100 - calculatedSns;

    const cognitiveAcc = cognitiveResults?.attention?.accuracy || (cognitiveResults?.processingSpeed?.averageAccuracy || 75);
    const calculatedConcentration = Math.round((analytics?.pureStudyRatio || 65) * 0.4 + cognitiveAcc * 0.6);
    const calculatedBrainScore = Math.round(calculatedVitality * 0.4 + calculatedConcentration * 0.4 + calculatedPns * 0.2);

    const finalSns = (hrv.sns && hrv.sns > 0) ? hrv.sns : calculatedSns;
    const finalPns = (hrv.pns && hrv.pns > 0) ? hrv.pns : calculatedPns;
    const finalFatigue = (hrv.fatigue && hrv.fatigue > 0) ? hrv.fatigue : calculatedFatigue;
    const finalVitality = (hrv.vitality && hrv.vitality > 0) ? hrv.vitality : calculatedVitality;
    const finalStress = (hrv.physicalStress && hrv.physicalStress > 0) ? hrv.physicalStress : calculatedStress;

    // 집중도 레벨 산출: 1~10 척도 (Lv. 1~10)
    // 1) 센서 실측치(hrv.concentrationLevel)가 있는 경우 우선 적용 (100점 척도로 입력 시 10점 척도로 자동 환산)
    // 2) 센서 미측정(Free 모드 등)인 경우: 학생이 프로토콜 단계에서 응답한 행동 몰입도(protocol.behavioralFactor: 1~5점)와
    //    학습 순공율/인지 지표를 종합하여 1~10점 척도로 의미 있는 추정치 산출
    const estimatedConcentrationFromBehavior = protocol?.behavioralFactor && protocol.behavioralFactor > 0
        ? Math.round((protocol.behavioralFactor * 2) * 0.6 + (calculatedConcentration / 10) * 0.4)
        : Math.round(calculatedConcentration / 10);

    const finalConcentration = (hrv.concentrationLevel && hrv.concentrationLevel > 0)
        ? (hrv.concentrationLevel > 10 ? Math.round(hrv.concentrationLevel / 10) : hrv.concentrationLevel)
        : Math.min(10, Math.max(1, estimatedConcentrationFromBehavior || 5));

    // Physical sensor test determination (HRV / EEG)
    const isHrvTested = Boolean(
        (usePortable && portableHrv && portableHrv.pulseVariability > 0) ||
        (hrv.isHrvTested === true) ||
        (hrv.hrvIndex && hrv.hrvIndex > 0) ||
        (hrv.meanHr && hrv.meanHr > 0)
    );
    const isEegTested = Boolean(
        (hrv.isEegTested === true) ||
        (hrv.eegGamma && hrv.eegGamma > 0) ||
        (hrv.eegAlpha && hrv.eegAlpha > 0) ||
        (hrv.dominantEEG && hrv.dominantEEG.length > 0)
    );
    const isSensorMeasured = Boolean(hrv.isSensorMeasured || isHrvTested || isEegTested);

    return {
        ...hrv,
        sns: finalSns,
        pns: finalPns,
        fatigue: finalFatigue,
        vitality: finalVitality,
        physicalStress: finalStress,
        meanBpm: hrv.meanBpm || hrv.meanHr || 72,
        stressIndex: hrv.stressIndex || finalStress,
        brainScore: (hrv.brainScore && hrv.brainScore > 0) ? hrv.brainScore : calculatedBrainScore,
        concentrationLevel: finalConcentration,
        isSensorMeasured,
        isHrvTested,
        isEegTested,
    };
};

export const buildSurveyData = (
    surveyScores: SurveyScores,
    fatigueSymptoms: boolean[],
    snsSymptomSelection: string[],
    pnsSymptomSelection: string[],
    learningTraitsData: unknown,
    effResults: StudyEfficiencyResults | null | unknown,
    existingSurvey?: SurveyData | null,
): SurveyData => {
    const effSurvey = mapResultsToSurveyData(effResults as StudyEfficiencyResults);
    return {
        ...(existingSurvey || {}),
        // GAD-7은 현재 설문 흐름에서 수집하지 않으므로 임의 상수(5)를 대입하지 않습니다(undefined 유지).
        bai: surveyScores.bai || existingSurvey?.bai || 0,
        isi: surveyScores.isi || existingSurvey?.isi || 0,
        concentrationScore: surveyScores.concentration ?? existingSurvey?.concentrationScore ?? 0,
        adrenalFatigueScore: surveyScores.adrenal ?? existingSurvey?.adrenalFatigueScore ?? 0,
        chronicFatigue: surveyScores.isChronicFatigue || existingSurvey?.chronicFatigue || false,
        fatigueSymptomsCount: surveyScores.fatigueCount || existingSurvey?.fatigueSymptomsCount || 0,
        symptoms: (fatigueSymptoms && fatigueSymptoms.some(Boolean) ? FATIGUE_SYMPTOMS.filter((_, i) => fatigueSymptoms[i]) : existingSurvey?.symptoms) || [],
        sympatheticSymptoms: (snsSymptomSelection && snsSymptomSelection.length > 0) ? snsSymptomSelection : (existingSurvey?.sympatheticSymptoms || []),
        parasympatheticSymptoms: (pnsSymptomSelection && pnsSymptomSelection.length > 0) ? pnsSymptomSelection : (existingSurvey?.parasympatheticSymptoms || []),
        learningTraits: learningTraitsData || existingSurvey?.learningTraits,
        ...effSurvey,
    } as SurveyData;
};

const PROVISIONAL_GUIDE =
    '## [1] 📋 데이터 기반 잠정 가이드 (Provisional Guidance)\n- **현재 상태**: 필수 설문 및 인지 검사 데이터가 일부 미입력되어 확정 진단 대신 **잠정 기초 컨디셔닝 솔루션**이 제공됩니다.\n- **기초 학습·신체 관리 수칙**:\n  1. 💧 **수분 및 휴식**: 50분 집중 후 10분 가벼운 스트레칭과 수분 섭취로 뇌 혈류 유지\n  2. 🌙 **수면 골든타임**: 밤 12시 이전 취침으로 누적 인지 피로 해소\n  3. 🧘 **시작 전 3분 호흡**: 4-7-8 복식호흡으로 두뇌 각성 안정화\n- **안내**: 정밀 8대 CareType 확정 진단을 위해 심리 설문 및 인지 검사를 완료해 주시기 바랍니다.';

export const runFinalAssessment = async (input: FinalAssessmentInput): Promise<AssessmentResult> => {
    const startedAt = Date.now();
    const {
        config,
        portableHrv,
        hrv,
        studyEfficiencyResults,
        overrideStudyEfficiencyResults,
        surveyScores,
        fatigueSymptoms,
        snsSymptomSelection,
        pnsSymptomSelection,
        learningTraitsData,
        student,
        protocol,
        analytics,
        bloodTest,
        cognitiveResults,
        medicalNotes,
        logicConfig,
        existingSurvey,
    } = input;

    const finalHrv = buildFinalHrv(
        config.usePortable,
        portableHrv,
        hrv,
        surveyScores,
        protocol,
        analytics,
        cognitiveResults,
    );
    const effResults = overrideStudyEfficiencyResults || studyEfficiencyResults;
    const surveyData = buildSurveyData(
        surveyScores,
        fatigueSymptoms,
        snsSymptomSelection,
        pnsSymptomSelection,
        learningTraitsData,
        effResults,
        existingSurvey,
    );
    const studentWithTraits: StudentInfo = {
        ...student,
        learningTraits: learningTraitsData,
    } as StudentInfo;

    // 실제 뇌파(EEG) 또는 포터블 센서 실측 데이터가 존재하는지 확인
    const hasRealEegOrSensor = Boolean(
        (finalHrv.sns > 0 && finalHrv.dominantEEG) ||
        (finalHrv.eegAlpha && finalHrv.eegAlpha > 0) ||
        (config.usePortable && finalHrv.portableHrv)
    );
    // 센서가 연결되지 않은 간이 진단(Free 모드 등)에서는 하드웨어 뇌파 조건을 강제하지 않고 설문 및 생체 추정치 중심으로 판정
    const useBrainBodyForEval = Boolean(config.useBrainBody && hasRealEegOrSensor);

    const classificationResult = evaluateClassificationWithScores(
        logicConfig.classificationRules,
        finalHrv,
        surveyData,
        protocol,
        analytics,
        config.isMedicalMode ? bloodTest : undefined,
        useBrainBodyForEval,
    );
    const type = classificationResult.primary;
    const strategy = CARE_STRATEGIES[type] || CARE_STRATEGIES[CareType.HEALTHY];

    // 5대 학습 기질 데이터 정밀 연동:
    // 사용자가 설문 7번 탭에서 15개 문항을 직접 변경/응답하지 않았거나(기본 3점/50점 플랫),
    // Fast-Track/무료체험 등으로 설문이 생략된 경우, 학생의 확정 CareType 및 심리/공부효율성 검사 지표를 반영하여
    // 임상적으로 타당하고 dynamic한 5대 기질 점수와 Archetype을 자동 추정 산출합니다.
    const isExplicitUserTraits = (data: any): boolean => {
        if (!data) return false;
        if (data.rawAnswers && Array.isArray(data.rawAnswers)) {
            return data.rawAnswers.some((a: number) => a !== 3 && a !== undefined && a !== null);
        }
        if (data.scores) {
            const s = data.scores;
            return !(s.gritPlan === 50 && s.mentalResilience === 50 && s.temperament === 50 && s.metaCognition === 50 && s.internalMotivation === 50);
        }
        return false;
    };

    const resolvedTraitsData: LearningTraitsData = isExplicitUserTraits(learningTraitsData)
        ? (learningTraitsData as LearningTraitsData)
        : inferLearningTraitsFromProfile({
            careType: type,
            surveyScores,
            survey: surveyData,
            studyEfficiency: effResults as any,
            student
        });

    surveyData.learningTraits = resolvedTraitsData;
    studentWithTraits.learningTraits = resolvedTraitsData;

    const brainBodyState = evaluateBrainBodyCoherence(
        finalHrv,
        surveyData,
        type,
        protocol,
        cognitiveResults
    );

    let analysis: string;
    if (type === CareType.UNASSESSED) {
        analysis = PROVISIONAL_GUIDE;
    } else {
        analysis = generateClinicalAnalysis(
            studentWithTraits,
            finalHrv,
            surveyData,
            protocol,
            analytics,
            type,
            logicConfig,
            config.isMedicalMode ? bloodTest : undefined,
            cognitiveResults,
            brainBodyState,
        );
    }

    let prevAssessmentResult: AssessmentResult | null = null;
    try {
        const history = await DatabaseService.getHistoryByStudentInfo(student.name, student.birthDate);
        if (history && history.length > 0) {
            const sortedHistory = [...history].sort(
                (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
            );
            const lastRecord = sortedHistory[0];
            if (lastRecord) {
                prevAssessmentResult = {
                    student: { ...student },
                    careType: lastRecord.careType as CareType,
                    hrv: lastRecord.hrv as HRVData,
                    survey: lastRecord.survey as SurveyData,
                    brainBodyState: evaluateBrainBodyCoherence(
                        lastRecord.hrv as HRVData,
                        lastRecord.survey as SurveyData,
                        lastRecord.careType as CareType,
                        lastRecord.protocol as ProtocolData,
                        lastRecord.cognitiveResults,
                    ),
                    protocol: {} as ProtocolData,
                    analytics: {} as LearningAnalyticsData,
                    nutrition: [],
                    careGuide: [],
                    analysisText: '',
                    score: lastRecord.score || 0,
                    scoreLevel: '',
                    date: lastRecord.date || new Date().toISOString(),
                } as AssessmentResult;
            }
        }
    } catch (e) {
        console.warn('Failed to fetch previous history for timeline', e);
    }

    const medicalAnalysisResult =
        config.isMedicalMode && bloodTest.hemoglobin > 0
            ? analyzeMedicalData(bloodTest, type, student.gender)
            : undefined;

    const scoreLevel =
        finalHrv.brainScore >= 80
            ? 'Excellent'
            : finalHrv.brainScore >= 60
                ? 'Good'
                : finalHrv.brainScore >= 40
                    ? 'Fair'
                    : 'Needs Attention';

    // 과목별 학습시간 배분율:
    // 실제 검사(AnalyticsStep)를 완료하여 유효한 실측치가 있으면 보존,
    // 검사 미시행(Free 모드 등) 상태이면 학생의 등록 취약과목 및 우선순위 프로필 기반 동적 AI 추천 배분율 자동 적용
    const hasTestedSubjectRatios = Boolean(
        analytics?.isTested &&
        analytics?.subjectRatios &&
        Object.values(analytics.subjectRatios).some((v) => Number(v) > 0)
    );

    const effectiveSubjectRatios = hasTestedSubjectRatios
        ? analytics.subjectRatios
        : calculateRecommendedSubjectRatios(student);

    const finalResult: AssessmentResult = {
        student: studentWithTraits,
        careType: type,
        classificationResult,
        hrv: finalHrv,
        survey: surveyData,
        protocol,
        analytics: {
            ...analytics,
            subjectRatios: effectiveSubjectRatios,
            preferredLocation: protocol.location || analytics.preferredLocation,
            isTested: Boolean(analytics?.isTested),
            testDate: analytics?.testDate || (analytics?.isTested ? student.testDate : undefined),
        },
        nutrition: [strategy.nutritionGuide],
        careGuide: [
            `학습 전략: ${strategy.studyStrategy}`,
            `운동 가이드: ${strategy.exerciseGuide}`,
            `회복 루틴: ${strategy.recoveryGuide}`,
            `사전 루틴: ${strategy.preStudyRoutine}`,
            ...(strategy.lifestyleGuide ? [`생활 수칙: ${strategy.lifestyleGuide}`] : []),
        ],
        analysisText: analysis,
        score: finalHrv.brainScore,
        scoreLevel,
        bloodTest:
            config.isMedicalMode || bloodTest.hemoglobin > 0 || bloodTest.vitaminD > 0 || bloodTest.crp > 0
                ? bloodTest
                : undefined,
        medicalAnalysis: medicalAnalysisResult,
        medicalNotes: config.isMedicalMode ? medicalNotes : undefined,
        previousResult: prevAssessmentResult,
        brainBodyState,
        cognitiveResults,
        studyEfficiencyResults: (effResults as StudyEfficiencyResults) || undefined,
        workingMemoryResults:
            (surveyScores as unknown as Record<string, number>).workingMemoryScore !== undefined
                ? { score: (surveyScores as unknown as Record<string, number>).workingMemoryScore }
                : undefined,
        completedExpertGuideItems: [],
        date: new Date().toISOString(),
        // [P0-2] 결과 시점의 진단 규칙 버전/해시를 각인하여 규칙 변경 후에도 재현 가능하게 합니다.
        logicConfigSnapshot: createLogicConfigSnapshot(logicConfig),
        // [P0-3] 실측/추정 데이터 신뢰도 요약을 결과에 포함합니다.
        dataConfidence: computeAssessmentConfidence({
            isSensorMeasured: finalHrv.isSensorMeasured,
            isHrvTested: finalHrv.isHrvTested,
            isEegTested: finalHrv.isEegTested,
            portableHrvPresent: Boolean(config.usePortable && finalHrv.portableHrv),
            surveyCollected:
                surveyScores.bai > 0 || surveyScores.isi > 0 || surveyScores.concentration > 0 || surveyScores.adrenal > 0,
            cognitivePresent: Boolean(cognitiveResults),
            analyticsTested: Boolean(analytics?.isTested),
            bloodTestApplied: Boolean(config.isMedicalMode && bloodTest.hemoglobin > 0),
        }),
    } as AssessmentResult;

    // 관측성: 진단 파이프라인 소요시간과 결과 요약을 기록합니다.
    logger.timing('assessment', 'run complete', Date.now() - startedAt, {
        careType: type,
        confidence: classificationResult.primaryScore,
        score: finalHrv.brainScore,
    });

    return finalResult;
};
