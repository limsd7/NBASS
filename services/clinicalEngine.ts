
import { HRVData, SurveyData, ProtocolData, LearningAnalyticsData, CareType, StudentInfo, ANS_BALANCE_DESCRIPTIONS, getStressLevel, BrainBodyState } from "../types";
import { LogicEngineConfig, evaluateProductRules } from "../logicEngine";
import { ANALYSIS_TYPES, ANALYSIS_TEXTS, AnalysisType } from "../data/analysisData";
import { analyzeLifestyle } from "./lifestyleEngine";
import { analyzeStudyStrategy } from "./studyStrategyEngine";
import { predictFromSingleData } from "./predictionEngine";
import { CARE_STRATEGIES } from "../data/careStrategies";
import { CARE_TYPE_INSIGHTS } from "../data/careTypeInsights";
import { DETAILED_INSIGHTS, DetailedInsightSet, getDetailedInsights } from "../data/detailedInsights";
import { getVitalityFatigueGuide, calculateVitalityFatigueMetrics, VITALITY_INDEX_FORMULA, FATIGUE_INDEX_FORMULA, CARETYPE_VF_CORRELATION } from "../data/vitalityFatigueInsights";
import { getBrainBalanceGuide, determineDominantEEGType, EEG_CHARACTERISTICS, EEG_STUDY_STRATEGIES, BRAIN_BALANCE_INSIGHTS } from "../data/brainBalanceRadarInsights";
import { getStressConcentrationGuide, analyzeCurrentState } from "../data/stressConcentrationGuide";
import { generateIntegratedAssessment, generateStudyMatrix, generateWarmupGuide } from "../data/integratedStudyEngine";
import { generateDynamicExamAdvice } from "../data/dynamicExamStrategy";
import { INTEGRATED_COGNITIVE_DIAGNOSIS } from "../data/integratedCognitiveDiagnosis";
import { CognitivePerformanceResults } from "../components/CognitivePerformanceAssessment";
import { generateCognitiveDiagnosis } from "./cognitiveReportGenerator";
import { generateIntegratedSolutions } from "./integratedSolutionGenerator";
import { generateBrainPeakTimeSchedule } from "./chronobiologyEngine";
import { EEG_BASED_STRATEGIES } from "../data/eegStrategies";



// Layer 1: 상태 태그 (Tags)
type AnalysisTag =
    | 'SNS_HIGH' | 'PNS_LOW' | 'SNS_LOW'
    | 'BRAIN_FATIGUE' | 'BRAIN_STRESS_HIGH'
    | 'ANXIETY_HIGH' | 'INSOMNIA_HIGH'
    | 'FOCUS_LOW' | 'MOTIVATION_LOW'
    | 'NOISE_SENSITIVE' | 'LOC_DISSATISFACTION'
    | 'LOW_PURE_STUDY' | 'HIGH_DISTRACTION' | 'SUBJECT_IMBALANCE' | 'BURNOUT_RISK'
    | 'ADRENAL_WARNING' | 'ADRENAL_DANGER'
    | 'LAB_HEMO_LOW' | 'LAB_VITD_LOW' | 'LAB_CRP_HIGH' | 'LAB_ASTALT_HIGH' | 'LAB_HBA1C_HIGH' | 'LAB_NK_LOW'
    | 'GAD7_HIGH' | 'DIGITAL_ADDICTION' | 'TEST_ANXIETY' | 'FATIGUE_CHRONIC' | 'CONCENTRATION_CRITICAL'
    | 'ADHD_RISK' | 'DOPAMINE_RISK' | 'BRAIN_FOG'
    | 'BURNOUT_WARNING' | 'CHRONO_MISMATCH';

export const generateClinicalAnalysis = (
    student: StudentInfo,
    hrv: HRVData,
    survey: SurveyData,
    protocol: ProtocolData,
    analytics: LearningAnalyticsData,
    careType: CareType,
    logicConfig: LogicEngineConfig, // Renamed from config
    bloodTest?: any,
    cognitiveResults?: CognitivePerformanceResults,
    brainBodyState?: BrainBodyState
): string => {
    // 1. Data Tagging
    const tags = new Set<AnalysisTag>();
    const T = logicConfig.thresholds; // Alias
    const isPortable = !!hrv.portableHrv;

    if (hrv.sns > T.snsHigh) tags.add('SNS_HIGH');
    if (hrv.sns < T.snsLow) tags.add('SNS_LOW');
    if (hrv.pns < T.pnsLow) tags.add('PNS_LOW');

    // EEG/Brain 관련 태그는 Clinical 모드에서만 적용 (휴대용 uBioMacpa는 EEG 미포함)
    if (!isPortable) {
        if (hrv.brainScore < T.brainScoreLow) tags.add('BRAIN_FATIGUE');
        if (['높음', '중간'].includes(hrv.brainStressCategory)) tags.add('BRAIN_STRESS_HIGH');
    }

    // --- Survey Analysis Expansion (Comprehensive) ---
    // 1. Anxiety Complex (BAI + GAD-7 + Test Anxiety)
    if (survey.bai >= T.baiHigh) tags.add('ANXIETY_HIGH');
    if (survey.gad7 && survey.gad7 >= T.gad7High) tags.add('GAD7_HIGH'); // Moderate Anxiety
    // Test Anxiety Calculation (Cognitive + Somatic)
    const testAnxietyTotal = (survey.testAnxietyCognitive || 0) + (survey.testAnxietySomatic || 0);
    if (testAnxietyTotal >= T.testAnxietyHigh) tags.add('TEST_ANXIETY');

    // 2. Sleep (ISI)
    if (survey.isi >= T.isiHigh) tags.add('INSOMNIA_HIGH');

    // 3. Concentration & Addiction
    if (survey.concentrationScore >= T.concentrationLow) tags.add('FOCUS_LOW');
    if (survey.concentrationScore >= 22) tags.add('CONCENTRATION_CRITICAL'); // Severe focus issue (>= 22 out of 28)
    if (survey.digitalAddictionLevel === 'risk' || survey.digitalAddictionLevel === 'addiction') tags.add('DIGITAL_ADDICTION');

    // 4. Energy & Fatigue (Adrenal + CFS)
    if (protocol.motivationalFactor <= T.motivationLow) tags.add('MOTIVATION_LOW');
    if (survey.adrenalFatigueScore && survey.adrenalFatigueScore >= 10 && survey.adrenalFatigueScore <= 25) tags.add('ADRENAL_WARNING');
    if (survey.adrenalFatigueScore && survey.adrenalFatigueScore >= 26) tags.add('ADRENAL_DANGER');
    if (survey.chronicFatigue || survey.fatigueSymptomsCount >= 5) tags.add('FATIGUE_CHRONIC');

    // 5. Cognitive Performance (Hard Data Check)
    // This section overrides subjective survey data with objective test results
    if (cognitiveResults) {
        // A. Attention (Go/No-Go) -> ADHD Risk
        if (cognitiveResults.attention) {
            // Accuracy < 80% OR Commission Errors (Impulsivity) >= 2
            if (cognitiveResults.attention.accuracy < 80 || cognitiveResults.attention.mistakes.commission >= 2) {
                tags.add('ADHD_RISK');
            }
        }

        // B. Delay Discounting -> Dopamine/Addiction Risk
        if (cognitiveResults.delayDiscounting?.impulsivityLevel) {
            // [FIX] Use impulsivityLevel instead of non-existent field
            if (['high', 'severe'].includes(cognitiveResults.delayDiscounting.impulsivityLevel)) {
                tags.add('DOPAMINE_RISK');
            }
        }

        // C. Working Memory -> Brain Fog / Efficiency
        if (cognitiveResults.workingMemory) {
            if (['low', 'below_average'].includes(cognitiveResults.workingMemory.overallLevel)) {
                tags.add('BRAIN_FOG');
            }
        }
    }

    // 6. Medical Data (Hard Physiological Override)
    if (bloodTest) {
        if (bloodTest.hemoglobin !== undefined && bloodTest.hemoglobin > 0 && bloodTest.hemoglobin < 13) tags.add('LAB_HEMO_LOW'); // 빈혈 -> 피로
        if (bloodTest.vitaminD !== undefined && bloodTest.vitaminD > 0 && bloodTest.vitaminD < 20) tags.add('LAB_VITD_LOW'); // 비타민D 결핍 -> 우울/피로
        if (bloodTest.crp !== undefined && bloodTest.crp > 1) tags.add('LAB_CRP_HIGH'); // 염증 -> 피로
        if ((bloodTest.ast !== undefined && bloodTest.ast > 40) || (bloodTest.alt !== undefined && bloodTest.alt > 40)) tags.add('LAB_ASTALT_HIGH'); // 간기능 -> 만성피로
        if (bloodTest.hba1c !== undefined && bloodTest.hba1c >= 5.7) tags.add('LAB_HBA1C_HIGH'); // 혈당 -> 식곤증/집중저하
        if (bloodTest.nkActivity !== undefined && bloodTest.nkActivity > 0 && bloodTest.nkActivity < 500) tags.add('LAB_NK_LOW'); // 면역 -> 컨디션 저하
    }

    // 7. Future Prediction & Chronotype (Logic Expansion)
    // A. Future Risk Prediction
    try {
        const predictions = predictFromSingleData(hrv, survey, protocol, analytics, cognitiveResults);
        const burnoutRisk = predictions.find(p => p.riskType === CareType.BURNOUT && p.severity === 'critical');
        if (burnoutRisk) {
            tags.add('BURNOUT_WARNING'); // Future risk detected
        }
    } catch (e) {
        console.warn('Prediction engine warning:', e);
    }

    // B. Chronotype Mismatch
    // If Peak Time is very late (Evening type) but has School (Morning schedule assumed)
    // Analytics.goldenTimeStart format "HH:MM". If > 17 (5 PM), likely Night Owl.
    if (analytics.goldenTimeStart) {
        const peakHour = parseInt(analytics.goldenTimeStart.split(':')[0], 10);
        if (peakHour >= 17) {
            tags.add('CHRONO_MISMATCH');
        }
    }

    // 8. Environment
    if (protocol.noiseLevel >= T.noiseSensitive) tags.add('NOISE_SENSITIVE');
    if (protocol.stressLevel >= T.stressHigh && protocol.location === '기타') tags.add('LOC_DISSATISFACTION');

    // 9. Learning Metrics
    if (analytics.pureStudyRatio < T.pureStudyLow) tags.add('LOW_PURE_STUDY');
    if (analytics.distractionCount > T.distractionHigh) tags.add('HIGH_DISTRACTION');
    if (analytics.goalAchievementRate < T.goalLow) tags.add('BURNOUT_RISK');
    const maxRatio = Math.max(...Object.values(analytics.subjectRatios) as number[]);
    if (maxRatio > T.subjectImbalance) tags.add('SUBJECT_IMBALANCE');

    // 2. New Engines Analysis
    const lifestyle = analyzeLifestyle(student, careType);
    const studyStrategy = analyzeStudyStrategy(student, careType);

    // Format BMI analysis text
    let bmiAnalysisText = `- **BMI 분석**: ${lifestyle.bmi.title}\n`;
    lifestyle.bmi.sections.forEach(sec => {
        bmiAnalysisText += `  > **${sec.heading}**: ${sec.content}\n`;
    });

    // 3. Classification Engine (Comprehensive Logic)
    let primaryType: AnalysisType = ANALYSIS_TYPES.BALANCED;

    if (isPortable && hrv.portableHrv) {
        const p = hrv.portableHrv;

        // [Portable Priority]
        // 1. Physical Depletion (Severe)
        if (tags.has('ADRENAL_DANGER') || tags.has('FATIGUE_CHRONIC') || p.ansBalanceType === 'overwork_chronic') {
            // Severe Energy Depletion -> Immersion/Burnout
            primaryType = ANALYSIS_TYPES.IMMERSION;
        }
        // 2. Anxiety / Acute Stress
        else if (tags.has('ANXIETY_HIGH') || tags.has('GAD7_HIGH') || tags.has('TEST_ANXIETY') || p.ansBalanceType === 'acute') {
            primaryType = ANALYSIS_TYPES.ANXIETY;
        }
        // 3. Energy / Motivation Low
        else if (p.ansBalanceType === 'disease_chronic' || p.pulseVariability <= 25 || tags.has('MOTIVATION_LOW')) {
            primaryType = ANALYSIS_TYPES.MOTIVATION;
        }
        // 4. Immersion Blockers
        else if (tags.has('CONCENTRATION_CRITICAL') || tags.has('DIGITAL_ADDICTION')) {
            primaryType = ANALYSIS_TYPES.IMMERSION;
        }
        else if (tags.has('NOISE_SENSITIVE')) {
            primaryType = ANALYSIS_TYPES.ENVIRONMENT;
        }
    } else {
        // [Clinical Priority] - FULL ROBUST LOGIC
        // Priority 1: Physiological Depletion (Body fails Mind)
        // Blood Test 'Partial Failure' (Anemia, Liver) OR Adrenal Fatigue -> MOTIVATION or IMMERSION
        const hasMedicalFatigue = tags.has('LAB_HEMO_LOW') || tags.has('LAB_ASTALT_HIGH') || tags.has('LAB_VITD_LOW') || tags.has('BURNOUT_WARNING');

        if (tags.has('ADRENAL_DANGER') || tags.has('FATIGUE_CHRONIC') || hasMedicalFatigue) {
            primaryType = ANALYSIS_TYPES.MOTIVATION; // Physical energy is the root cause. Updated: Burnout Warning maps here too.
        }
        // Priority 2: Neurological / Cognitive Efficiency (Brain fails Mind)
        else if (tags.has('ADHD_RISK') || tags.has('BRAIN_FOG') || tags.has('BRAIN_FATIGUE')) {
            // ADHD risk or Brain Fog -> Primary issue is ability to focus/immerse
            primaryType = ANALYSIS_TYPES.IMMERSION;
        }
        else if (tags.has('DOPAMINE_RISK') || tags.has('DIGITAL_ADDICTION')) {
            primaryType = ANALYSIS_TYPES.IMMERSION; // Addiction based Immersion loss
        }
        // Priority 3: Psychological Barriers (Emotion blocks Mind)
        else if (tags.has('ANXIETY_HIGH') || tags.has('GAD7_HIGH') || tags.has('TEST_ANXIETY')) {
            primaryType = ANALYSIS_TYPES.ANXIETY;
        }
        else if (careType === CareType.SLEEP || tags.has('INSOMNIA_HIGH')) {
            // Sleep issues creates Anxiety-like high tension or Immersion loss.
            // Mapping Sleep to Anxiety broadens the context of "High Arousal/Dysregulation".
            // Or prioritize Immersion if it's purely exhaustion. Current logic: Anxiety/Tension.
            primaryType = ANALYSIS_TYPES.ANXIETY;
        }
        // Priority 4: Environmental / Mild Issues
        else if (tags.has('NOISE_SENSITIVE') || tags.has('LOC_DISSATISFACTION') || tags.has('CHRONO_MISMATCH')) {
            primaryType = ANALYSIS_TYPES.ENVIRONMENT; // Mismatch with environment/schedule
        }
        else if (tags.has('MOTIVATION_LOW')) {
            primaryType = ANALYSIS_TYPES.MOTIVATION;
        }
        else if (tags.has('FOCUS_LOW')) {
            primaryType = ANALYSIS_TYPES.IMMERSION;
        }
        // If no tags -> Default to BALANCED (Already initialized)
    }

    // 4. Report Assembly
    const content = ANALYSIS_TEXTS.overview[primaryType];
    const solutions = ANALYSIS_TEXTS.solutions;
    let customSolutions: string[] = [];
    const strategy = CARE_STRATEGIES[careType] || CARE_STRATEGIES[CareType.HEALTHY];
    customSolutions.push(`🎯 **[핵심 학습 전략]**: ${strategy.studyStrategy}`);
    const recommendedProducts = evaluateProductRules(logicConfig.productRules, hrv, survey, careType, bloodTest);
    if (recommendedProducts.length > 0) {
        const essentials = recommendedProducts.filter(p => p.tier === 'ESSENTIAL').map(p => {
            const rule = logicConfig.productRules.find(r => r.productId === p.productId);
            return rule ? rule.productName : p.productId;
        });
        if (essentials.length > 0) {
            customSolutions.push(`💊 **[영양 처방]**: 핵심 필요 영양소 - **${Array.from(new Set(essentials)).join(', ')}**`);
        } else {
            customSolutions.push(`💊 **[영양 가이드]**: ${strategy.nutritionGuide}`);
        }
    } else {
        customSolutions.push(`💊 **[영양 가이드]**: ${strategy.nutritionGuide}`);
    }
    customSolutions.push(`💪 **[운동 처방]**: ${strategy.exerciseGuide}`);
    customSolutions.push(`🌅 **[사전 루틴]**: ${strategy.preStudyRoutine}`);
    customSolutions.push(`💤 **[회복 솔루션]**: ${strategy.recoveryGuide}`);
    if (strategy.lifestyleGuide) {
        customSolutions.push(`📱 **[생활 수칙]**: ${strategy.lifestyleGuide}`);
    }
    if (primaryType === ANALYSIS_TYPES.ANXIETY) customSolutions.push(...solutions.stressCare);
    if (primaryType === ANALYSIS_TYPES.MOTIVATION) customSolutions.push(...solutions.motivationBoost);
    if (primaryType === ANALYSIS_TYPES.ENVIRONMENT) customSolutions.push(...solutions.envControl);
    if (primaryType === ANALYSIS_TYPES.IMMERSION) customSolutions.push(...solutions.focusTraining);
    if (tags.has('ADRENAL_WARNING') || tags.has('ADRENAL_DANGER')) {
        customSolutions.push("⚡ [부신케어] 취침 시간을 밤 11시 이전으로 앞당겨 호르몬 재생을 돕습니다.");
        customSolutions.push("⚡ [부신케어] 아침 기상 직후 따뜻한 소금물 한 잔이나 비타민C 섭취를 권장합니다.");
        customSolutions.push("⚡ [부신케어] 급격한 혈당 변동을 유발하는 단순 당류 간식을 제한하십시오.");
    }
    if (tags.has('ADRENAL_DANGER')) {
        customSolutions.push("🏥 [전문가권고] 부신 기능 저하가 심각하므로 고강도 운동보다는 가벼운 산책과 명상이 필요합니다.");
    }
    if (tags.has('LAB_HEMO_LOW')) customSolutions.push("🏥 [혈액검계] 헤모글로빈 수치가 낮습니다. 철분 보충 및 단백질 섭취를 늘리세요.");
    if (tags.has('LAB_VITD_LOW')) customSolutions.push("🏥 [혈액검계] 비타민D 수치가 낮습니다. 보충제 섭취 및 하루 20분 일광욕을 권장합니다.");
    if (tags.has('LAB_CRP_HIGH')) customSolutions.push("🏥 [혈액검계] 염증지표(CRP)가 높습니다. 오메가3 섭취 및 항염증 식단(채소 위주)이 필요합니다.");


    // Detailed Insight Data 먼저 준비 (examContext에서 사용)
    const detailedInsightData: DetailedInsightSet = getDetailedInsights(careType, analytics);

    // [New] 3단계 종합 진단 데이터 생성 (Integrated Engine 활용)
    const integratedAssessment = generateIntegratedAssessment(hrv, careType, isPortable);
    const dynamicExamAdvice = generateDynamicExamAdvice(integratedAssessment, careType);

    // [NEW] Brain Peak Time Schedule Generator
    const brainPeakTimeSchedule = generateBrainPeakTimeSchedule(
        student, hrv, survey, protocol, analytics, careType, bloodTest
    );

    // 수험생 실전 전략 - 모든 모드에서 항상 표시 (Portable, HRV, 의학 전문가 모드 공통)
    const examContext = `
## 📈 수험생 실전 전략 (Exam Strategy)

${detailedInsightData.examDayStrategy}

${dynamicExamAdvice}

${brainPeakTimeSchedule}

${detailedInsightData.vulnerableTimeStrategy}
    `.trim();

    console.log('[DEBUG] examContext generated - length:', examContext.length);
    console.log('[DEBUG] examContext preview:', examContext.substring(0, 200));


    let adrenalAnalysis = "";
    if (tags.has('ADRENAL_WARNING')) {
        adrenalAnalysis = "- **부신 피로**: ⚠️ 초기 부신 피로 증상이 감지되었습니다. 만성 피로로 이어지지 않도록 관리가 필요합니다.";
        adrenalAnalysis += "\n  > **[생활 수칙 요약]**\n  > 1. 밤 11시 전 취침 (골든 타임 사수)\n  > 2. 아침 단백질 식사 필수, 단순 당류(설탕) 제한\n  > 3. 고강도 운동 자제하고 가벼운 산책 권장\n  > 4. 카페인 섭취 중단 또는 오전 1잔으로 제한";
    }
    if (tags.has('ADRENAL_DANGER')) {
        adrenalAnalysis = "- **부신 피로**: 🚨 **[심각]** 부신 기능 저하로 인한 에너지 고갈 상태입니다. 즉각적인 생활 습관 교정이 시급합니다.";
        adrenalAnalysis += "\n  > **[생활 수칙 요약]**\n  > 1. 밤 11시 전 취침 (골든 타임 사수)\n  > 2. 아침 단백질 식사 필수, 단순 당류(설탕) 제한\n  > 3. 고강도 운동 자제하고 가벼운 산책 권장\n  > 4. 카페인 섭취 중단 또는 오전 1잔으로 제한";
    }

    // 4. Report Assembly (Section 1: Lifestyle Connection)
    let lifestyleReport = `## [1] 맞춤형 신체-학습 연결 리포트 (Physical-Learning)\n\n`;

    lifestyleReport += `### 💊 영양 처방 (Nutrition)\n`;
    lifestyleReport += `- **추천 식단**: ${lifestyle.diet.title}\n`;
    const dietLines = lifestyle.diet.advice.split('\n').filter(l => l.trim().startsWith('- '));
    dietLines.forEach(line => {
        lifestyleReport += `  > ${line.substring(2)}\n`;
    });

    lifestyleReport += `\n### 🏃 행동 및 생활 처방 (Lifestyle & Behavior)\n`;
    
    // BMI Detail
    lifestyleReport += `- **BMI 분석**: ${lifestyle.bmi.title}\n`;
    lifestyle.bmi.sections.forEach(sec => {
        lifestyleReport += `  > **${sec.heading}**: ${sec.content}\n`;
    });

    // Exercise Detail
    lifestyleReport += `- **운동 처방**: ${lifestyle.exercise.title}\n`;
    const exerciseLines = lifestyle.exercise.advice.split('\n').filter(l => l.trim().startsWith('- '));
    exerciseLines.forEach(line => {
        lifestyleReport += `  > ${line.substring(2)}\n`;
    });

    // Learning Efficiency Detail
    lifestyleReport += `- **학습 효율**: ${lifestyle.learning.title}\n`;
    const learningLines = lifestyle.learning.advice.split('\n').filter(l => l.trim().startsWith('- '));
    learningLines.forEach(line => {
        lifestyleReport += `  > ${line.substring(2)}\n`;
    });

    // 5. Detailed Data Insight Generation (Section 3) - 500자 내외 상세 해석 적용
    const insight = CARE_TYPE_INSIGHTS[careType] || CARE_TYPE_INSIGHTS[CareType.HEALTHY];
    // detailedInsightData는 위에서 이미 선언됨


    let detailedInsight = isPortable
        ? `## [3] 휴대용 생체 데이터 분석 (Portable Insight)\n`
        : `## [3] 정밀 데이터 분석 (Data Insight)\n`;

    // A. 종합 유형 & 상태 분석 (500자 내외 상세 해석)
    detailedInsight += `- **종합 유형**: **${content.title}**\n`;
    detailedInsight += `  > **[심층 분석]**: ${detailedInsightData.overviewAnalysis}\n\n`;

    if (isPortable && hrv.portableHrv) {
        const p = hrv.portableHrv;
        // B. 자율신경 (Portable Specific - 500자 내외 상세 해석)
        detailedInsight += `- **자율신경**: ${ANS_BALANCE_DESCRIPTIONS[p.ansBalanceType].label}\n`;
        detailedInsight += `  > **[자율신경 해석]**: ${detailedInsightData.ansInterpretation}\n\n`;

        // C. 생체 스트레스 (500자 내외 상세 해석)
        detailedInsight += `- **생체 스트레스**: 지수 **${p.stressIndex}**, 맥박 변화도 **${p.pulseVariability}**, 혈관 건강지수 **${p.vascularHealthIndex > 0 ? '+' : ''}${p.vascularHealthIndex}**\n`;
        detailedInsight += `  > **[생체 스트레스 해석]**: ${detailedInsightData.stressInterpretation}\n\n`;

    } else {
        // B. 자율신경 (Clinical Specific - 500자 내외 상세 해석)
        let ansStatus = hrv.sns > 60 ? "교감 항진(긴장)" : hrv.pns < 30 ? "회복력 저하" : "안정적";
        detailedInsight += `- **자율신경**: SNS **${hrv.sns}%** / PNS **${hrv.pns}%** — ${ansStatus}\n`;
        detailedInsight += `  > **[자율신경 해석]**: ${detailedInsightData.ansInterpretation}\n\n`;

        // C. 뇌파 균형 (Clinical Specific)
        const eegLabels = Array.isArray(hrv.dominantEEG) ? hrv.dominantEEG : [hrv.dominantEEG];
        detailedInsight += `- **뇌파 균형**: 주 우세파 **${eegLabels.join(', ')}**, 뇌 스트레스 **${hrv.brainStressCategory}**, 집중도 **Lv.${hrv.concentrationLevel || 5}**\n`;
        detailedInsight += `  > **[뇌파 해석]**: ${insight.eegInterpretation}\n\n`;

        // D. 생체 스트레스 (Clinical - 500자 내외 상세 해석)
        detailedInsight += `- **생체 스트레스**: 신체 스트레스 **${hrv.physicalStress || 'N/A'}**, 피로 지수 **${hrv.fatigue}%**, 활력 지수 **${hrv.vitality}%**\n`;
        detailedInsight += `  > **[생체 스트레스 해석]**: ${detailedInsightData.stressInterpretation}\n\n`;
    }

    // E. 학습 밀도 (Common - 500자 내외 상세 해석)
    detailedInsight += `- **학습 밀도**: 순공 비율 **${analytics.pureStudyRatio}%**, 목표 달성률 **${analytics.goalAchievementRate}%**, 평균 집중 시간 **${analytics.avgFocusDuration}분**\n`;
    detailedInsight += `  > **[학습 밀도 해석]**: ${detailedInsightData.studyDensityAnalysis}\n`;

    // 6. Final Report Generation
    console.log('[DEBUG] Final examContext before report generation:', examContext.substring(0, 100));
    console.log('[DEBUG] examContext empty?', examContext === '');

    // ANS 기반 공부법 섹션 생성
    const ansStudySection = `
##[5] 🧠 자율신경 균형에 따른 공부법 (ANS-Based Study Method)

**교감/부교감 신경과 진단과의 상관관계**: 교감신경(SNS)이 활성화되면 몸이 '투쟁-도피' 모드로 전환되어 각성도가 높아지지만, 과도해지면 불안과 집중력 저하를 유발합니다. 반면 부교감신경(PNS)이 우세하면 '휴식-소화' 모드로 나른함과 무기력감이 나타납니다. 현재 ${careType}로 분류된 상태에서의 자율신경 균형에 맞는 학습법을 제안합니다.

### 📚 일반 공부법
${detailedInsightData.ansStudyMethodGeneral}

### 📐 수학 공부법
${detailedInsightData.ansStudyMethodMath}

### 📖 국어 공부법
${detailedInsightData.ansStudyMethodKorean}

### 🌐 영어 공부법
${detailedInsightData.ansStudyMethodEnglish}
    `.trim();

    // Vitality & Fatigue Index 기반 학습법 섹션 생성
    const { vitality, fatigue, calculationDetail } = calculateVitalityFatigueMetrics(hrv, isPortable);

    const vitalityFatigueSection = `
##[5-2] 🔋 Vitality & Fatigue Index 기반 학습법 (Energy-Based Study Method)

**현재 상태**: Vitality(활력) **${vitality}%** / Fatigue(피로) **${fatigue}%**

${calculationDetail}

${getVitalityFatigueGuide(vitality, fatigue, careType)}
    `.trim();

    // Brain Balance Radar 섹션 생성 (HRV/의학적 모드에서만 - Portable은 EEG 미사용)
    let brainBalanceSection = '';
    if (!isPortable) {
        const eegData = {
            gamma: hrv.eegGamma || 0,
            hBeta: hrv.eegHBeta || 0,
            mBeta: hrv.eegMBeta || 0,
            lBeta: hrv.eegLBeta || 0,
            alpha: hrv.eegAlpha || 0,
            theta: hrv.eegTheta || 0
        };
        const dominantType = determineDominantEEGType(eegData.gamma, eegData.hBeta, eegData.mBeta, eegData.lBeta, eegData.alpha, eegData.theta);
        const strategy = EEG_STUDY_STRATEGIES[dominantType];
        const insight = BRAIN_BALANCE_INSIGHTS[careType];

        brainBalanceSection = `
##[5-3] 🧠 Brain Balance Radar 분석(EEG - Based Study Method)

        ** 현재 뇌파 분포 **: Gamma ** ${eegData.gamma}%** | H - Beta ** ${eegData.hBeta}%** | M - Beta ** ${eegData.mBeta}%** | L - Beta ** ${eegData.lBeta}%** | Alpha ** ${eegData.alpha}%** | Theta ** ${eegData.theta}%**

### 뇌파 항목별 특성

        | 뇌파 | 학습 시 상태 | 분석 및 의미 |
| ------| -------------| -------------|
| Gamma(인지) | 초고도 집중, 통합적 사고 | 복잡한 정보를 결합하거나 고난도 문제를 풀 때 활성화 |
| H - Beta(긴장) | 과각성, 불안, 스트레스 | 마감 임박, 시험 직전의 긴박한 상태.수치 과다 시 실수 증가 |
| M - Beta(몰입) | 능동적 집중, 논리적 사고 | 수학 풀이, 독해 등 본격 학습에 가장 이상적인 집중 상태 |
| L - Beta(주의) | 외적 주의집중, 준비 상태 | 인강 시청, 단순 암기 등 외부 정보 수용 준비 상태 |
| Alpha(이완) | 안정, 창의적 영감 | 긴장 해소 상태, 암기 회상이나 아이디어 도출에 효과적 |
| Theta(졸음) | 멍함, 얕은 잠, 무의식 | 집중력 고갈 상태.이때 공부 지속 시 효율 매우 낮음 |

        ---

### 현재 우세 패턴 분석: ${strategy.titleKr}

${insight.interpretation}

    ---

### 📚 추천 학습 모드: ${strategy.recommendedMode}

${insight.studyRecommendation}

    ---

### 과목별 딥 워크 전략

${strategy.subjectStrategies.math}

${strategy.subjectStrategies.korean}

${strategy.subjectStrategies.science}

    ---

### 효율 극대화 추가 전략
${strategy.additionalStrategies.map(s => `• ${s}`).join('\n')}

    ---

### ⚠️ 주의 패턴
${insight.warningPatterns.map(p => `• ${p}`).join('\n')}

### 💡 뇌파 최적화 팁
${insight.optimizationTips.map(t => `• ${t}`).join('\n')}

    ---

** 요약 **: ${strategy.summary.join(' | ')}
    `.trim();
    }


    // Stress & Concentration Gauge 기반 공부법 섹션 생성 (모든 모드에서 적용)
    const scGuide = getStressConcentrationGuide(careType);

    // 현재 스트레스/집중 상태 분석 (HRV 데이터 또는 Portable 데이터 기반)
    const stressIndex = isPortable && hrv.portableHrv ? hrv.portableHrv.stressIndex : hrv.physicalStress || 50;
    const concentrationLevel = !isPortable ? hrv.concentrationLevel || 50 : 50;
    const dominantEEG = !isPortable ? hrv.dominantEEG : [];
    const currentState = analyzeCurrentState(stressIndex, concentrationLevel, dominantEEG);

    const stressConcentrationSection = `
## [5-4] 📊 Stress & Concentration Gauge 공부법(Gauge - Based Subject Study Method)

**현재 상태 분석**: 스트레스 게이지 **${currentState.stressState === 'high' ? '높음 🔴' : '낮음 🟢'}** / 집중도 게이지 **${currentState.concentrationState === 'high' ? '높음 🟢' : '낮음 🟡'}**

${currentState.stressState === 'high' ? `### 🔥 스트레스 게이지가 높을 때 공부법\n${scGuide.highStressStudyMethod}` : `### 😌 스트레스 게이지가 낮을 때 공부법\n${scGuide.lowStressStudyMethod}`}

${currentState.concentrationState === 'high' ? `### ⚡ 집중도 게이지가 높을 때 공부법(Deep Work 모드)\n${scGuide.highConcentrationStudyMethod}` : `### 😴 집중도 게이지가 낮을 때 공부법(회복 모드)\n${scGuide.lowConcentrationStudyMethod}`}

### 📚 현재 상태 맞춤 과목별 공부법

#### 📖 국어
${currentState.stressState === 'high' ? scGuide.stressBasedSubjects.korean : scGuide.concentrationBasedSubjects.korean}

#### 📐 수학
${currentState.stressState === 'high' ? scGuide.stressBasedSubjects.math : scGuide.concentrationBasedSubjects.math}

#### 🌐 영어
${currentState.stressState === 'high' ? scGuide.stressBasedSubjects.english : scGuide.concentrationBasedSubjects.english}

💡 **실시간 활용 팁**: 공부 시작 전 자신의 스트레스와 집중 상태를 체크하고, 현재 상태에 맞는 공부법을 선택하세요.
    `.trim();

    // 통합 학습 최적화 섹션 생성
    const integrated = generateIntegratedAssessment(hrv, careType, isPortable);
    const integratedStudySection = `
##[5-5] 🎯 통합 학습 최적화 요약(Integrated Study Optimization Summary)

    **📊 4가지 지표 종합 분석 **

| 지표 | 현재 상태 | 점수 |
| -----| ---------| -----|
| ANS(자율신경 균형) | ${integrated.physicalStateDescription.split(' - ')[0]} | ${integrated.ansScore} 점 |
| Vitality(활력 지수) | ${integrated.vitalityScore >= 70 ? '높음 🟢' : integrated.vitalityScore >= 40 ? '보통 🟡' : '낮음 🔴'} | ${integrated.vitalityScore}% |
| Fatigue(피로 지수) | ${integrated.fatigueScore <= 30 ? '낮음 🟢' : integrated.fatigueScore <= 60 ? '보통 🟡' : '높음 🔴'} | ${integrated.fatigueScore}% |
| Stress(스트레스) | ${integrated.stressScore <= 40 ? '낮음 🟢' : integrated.stressScore <= 60 ? '보통 🟡' : '높음 🔴'} | ${integrated.stressScore} 점 |
    ${!isPortable ? `| Concentration (집중도) | ${integrated.concentrationScore >= 60 ? '높음 🟢' : integrated.concentrationScore >= 40 ? '보통 🟡' : '낮음 🔴'} | ${integrated.concentrationScore}점 |
| Brain Pattern (뇌파) | ${integrated.eegType || 'N/A'} | - |` : ''
        }

---

### 🔬 신체 - 정신 - 인지 3단계 진단

    ** Step 1. 신체 상태(자율신경 필터) **
        ${integrated.physicalStateDescription}

** Step 2. 정신 각성도(뇌파 / 집중도 필터) **
    ${integrated.mentalArousalDescription}

** Step 3. 종합 판정 **
    ${integrated.overallSummary}

${integrated.warningMessage ? `\n⚠️ **주의**: ${integrated.warningMessage}\n` : ''}

---

### 📚 최적 공부법 선택 결과

    **🥇 우선 추천 과목 **: ${integrated.prioritySubject === 'math' ? '수학 📐' : integrated.prioritySubject === 'korean' ? '국어 📖' : '영어 🌐'}

---

    ${integrated.mathStrategy}

---

    ${integrated.koreanStrategy}

---

    ${integrated.englishStrategy}

---

    ${generateStudyMatrix()}

---

    ${generateWarmupGuide()}

---

💡 ** 활용 가이드 **: 이 분석은 현재 순간의 상태를 반영합니다.공부 중 상태가 변하면(피로감 증가, 집중력 저하 등) 해당 상태에 맞는 공부법으로 전환하세요.무리하게 한 방법을 고수하는 것보다 유연하게 조정하는 것이 학습 효율을 높입니다.
    `.trim();

    // 5-6. 통합 인지 진단 (Working Memory Diagnostic Results) 섹션 생성
    // [MODIFIED] Now using dynamic generation based on actual test results
    const integratedCognitive = generateCognitiveDiagnosis(careType, cognitiveResults);

    const integratedCognitiveSection = `
##[5-6] 🧠 통합 인지 진단(Working Memory Diagnostic Results)

** 진단 요약 **: ${careType} 유형의 인지 특성을 분석하여 가장 효과적인 개선 전략을 제안합니다.Working Memory와 전두엽 기능을 강화하는 것이 핵심입니다.

### 🚀 공부효율성 향상 방법
${integratedCognitive.efficiencyImprovement}

### ⚠️ 취약 부분 정밀 분석
${integratedCognitive.weaknessAnalysis}

### 📈 예상 향상률 및 기대 효과
현재의 취약점을 보완하고 맞춤형 훈련을 지속할 경우, 약 ** ${integratedCognitive.expectedImprovementRate}%** 의 학습 효율 향상이 기대됩니다.

### 🧩 Working Memory 강화 훈련(Pre / Post - Study)
${integratedCognitive.workingMemoryTraining}
`.trim();

    // [NEW] Generate Integrated Solutions (Killer Tips)
    const integratedSolutions = generateIntegratedSolutions(
        student,
        hrv,
        survey,
        analytics,
        cognitiveResults,
        bloodTest
    );

    // [NEW] Brain-Body Report (3-Layer Verification)
    let brainBodyReport = '';
    if (brainBodyState) {
        const hasEEG = brainBodyState.eegBalance.gamma > 0 || brainBodyState.eegBalance.alpha > 0;
        const eegPatternStrategy = EEG_BASED_STRATEGIES[brainBodyState.pattern] || EEG_BASED_STRATEGIES['UNKNOWN'];
        
        brainBodyReport = `
## [🧠 Brain-Body Report] 3계층 통합 진단
> **진단명**: ${careType} 
> **신뢰도(Confidence)**: ${(brainBodyState.confidence * 100).toFixed(0)}% (${brainBodyState.coherenceLevel})

- **자율신경 (HRV)**: SNS ${brainBodyState.snsLevel}% | PNS ${brainBodyState.pnsLevel}% (${brainBodyState.ansBalance})
${hasEEG ? `- **뇌파 패턴 (EEG)**: ${brainBodyState.pattern} (${eegPatternStrategy.characteristics})` : '- **뇌파 패턴 (EEG)**: 데이터 없음 (2층 검증 수행)'}
- **통합 일치도 (Coherence)**: ${brainBodyState.coherence >= 80 ? '✅ 일치 (높음)' : brainBodyState.coherence >= 50 ? '🟡 부분 일치 (중간)' : '🔴 불일치 (낮음/거짓 양성 의심)'}

${hasEEG && eegPatternStrategy.pattern !== 'UNKNOWN' ? `### ⚡ EEG 기반 즉각 조치사항 (Immediate Actions)\n${eegPatternStrategy.immediateActions.map(a => `1. ${a}`).join('\n')}\n` : ''}
        `.trim();
    }

    return `
${brainBodyReport ? brainBodyReport + '\n\n' : ''}${lifestyleReport.trim()}

##[2] 성향 기반 학습 전략(MBTI & Subject)
    - ** 학습 스타일 **: ${studyStrategy.learningStyle}
- ** 국어 공략 **: ${studyStrategy.subjectStrategy.korean}
- ** 수학 공략 **: ${studyStrategy.subjectStrategy.math}
- ** 영어 공략 **: ${studyStrategy.subjectStrategy.english}
- ** 집중력 유지 **: ${studyStrategy.concentration}
- ** 멘탈 케어 **: ${studyStrategy.mentalCare}

${detailedInsight.trim()}

${adrenalAnalysis ? adrenalAnalysis : ''}
${examContext}

${ansStudySection}

${vitalityFatigueSection}

${brainBalanceSection}

${stressConcentrationSection}



${integratedStudySection}

${integratedCognitiveSection}

##[6] 📈 데이터 상관관계 & 번아웃 알람(Correlation & Burnout Alert)
    - ** 상관관계 **: ${detailedInsightData.correlationAnalysis}
- ** 번아웃 알람 **: ${detailedInsightData.burnoutAlert}

##[7] 최종 솔루션 제안(Action Plan)
${customSolutions.map(sol => `- ${sol}`).join('\n')}

${integratedSolutions}

---
* 본 리포트는 마인드 - 바디 커넥트 통합 알고리즘에 의해 생성되었습니다.*
    `.trim();
};
