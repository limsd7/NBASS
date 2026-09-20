import { HRVData, SurveyData, ProtocolData, LearningAnalyticsData, CareType, BrainBodyState, CoherenceLevel, EEGPatternType } from '../types';

/**
 * Calculates the Brain-Body Coherence and Confidence Level based on available mode data.
 * Mode Detection:
 * - Simple Survey Mode: Survey only (1-layer)
 * - Portable Mode: Survey + HRV (2-layer)
 * - BrainBody / Medical Mode: Survey + HRV + EEG (3-layer)
 */
export const evaluateBrainBodyCoherence = (
    hrv: HRVData | undefined,
    survey: SurveyData,
    careType: CareType, // The initially determined CareType from logicEngine
    protocol?: ProtocolData,
    cognitiveResults?: any
): BrainBodyState => {
    // Default fallback (Survey only Mode)
    let state: BrainBodyState = {
        ansBalance: 'BALANCED',
        snsLevel: 50,
        pnsLevel: 50,
        brainState: 'CALM',
        dominantFrequency: 'Alpha (8-12Hz)',
        eegBalance: { gamma: 0, betaH: 0, betaM: 0, betaL: 0, alpha: 0, theta: 0 },
        coherence: 85,
        coherenceLevel: 'HIGH',
        pattern: 'BALANCED_ALPHA',
        confidence: 0.85,
    };

    if (!hrv) {
        return state;
    }

    const isPortable = Boolean(hrv.portableHrv);
    // 물리적 뇌파 센서 실측 여부:
    // isEegTested 플래그만으로 판정하지 않고, 실제 파워 신호(양수) 존재를 필수로 요구합니다.
    // Free/무센서 모드에서 eegGamma가 0으로 초기화되어 하드웨어 뇌파 모드로 오판정되는 것을 방지합니다.
    const hasEegSignal = Boolean(
        (hrv.eegAlpha !== undefined && hrv.eegAlpha > 0) ||
        (hrv.eegGamma !== undefined && hrv.eegGamma > 0) ||
        (hrv.eegHBeta !== undefined && hrv.eegHBeta > 0) ||
        (hrv.eegMBeta !== undefined && hrv.eegMBeta > 0) ||
        (hrv.eegLBeta !== undefined && hrv.eegLBeta > 0) ||
        (hrv.eegTheta !== undefined && hrv.eegTheta > 0) ||
        (Array.isArray(hrv.dominantEEG) && hrv.dominantEEG.length > 0)
    );
    const hasRealEEG = Boolean(!isPortable && hasEegSignal);

    // --- Layer 2: Autonomic Nervous Balance ---
    state.snsLevel = hrv.sns || 50;
    state.pnsLevel = hrv.pns || 50;
    state.ansBalance = state.snsLevel > 58 ? 'SNS_DOMINANT' : state.pnsLevel > 58 ? 'PNS_DOMINANT' : 'BALANCED';

    if (!hasRealEEG) {
        // [Free 모드 / 설문·인지 기반 3계층 통합 일치도 평가]
        // 1계층: 설문 심리 상태 (Psychological Symptoms: BAI, ISI, Adrenal, Stress)
        // 2계층: 자율신경 균형 상태 (Autonomic Balance: SNS/PNS & 자율신경 자각증상)
        // 3계층: 신경인지 및 학습 제어 (Cognitive Control: 인지검사 결과, 집중도 설문, 순공율, 행동 몰입도)
        let layer1 = false;
        let layer2 = false;
        let layer3 = false;

        const baiScore = survey.bai || 0;
        const isiScore = survey.isi || 0;
        const adrenalScore = survey.adrenalFatigueScore || 0;
        const concentrationScore = survey.concentrationScore || 0;
        const pureStudyRatio = (survey as any).pureStudyRatio || 65;
        const protocolStress = protocol?.stressLevel || 5;
        const protocolBehavior = protocol?.behavioralFactor || 3;
        const sympCount = survey.sympatheticSymptoms?.length || 0;
        const paraCount = survey.parasympatheticSymptoms?.length || 0;

        const hasCognitiveIssues = Boolean(
            (cognitiveResults?.attention && (cognitiveResults.attention.accuracy < 85 || cognitiveResults.attention.mistakes.commission >= 1)) ||
            (cognitiveResults?.workingMemory && ['low', 'below_average'].includes(cognitiveResults.workingMemory.overallLevel)) ||
            (cognitiveResults?.delayDiscounting && ['high', 'severe'].includes(cognitiveResults.delayDiscounting.impulsivityLevel))
        );

        if (careType === CareType.ANXIETY_TENSION || careType === CareType.STRESS_OVERLOAD) {
            layer1 = baiScore >= 12 || protocolStress >= 6 || sympCount >= 1;
            layer2 = state.ansBalance === 'SNS_DOMINANT' || state.snsLevel >= 53 || sympCount >= 1;
            layer3 = hasCognitiveIssues || concentrationScore >= 8 || protocolStress >= 5 || pureStudyRatio < 75;
            state.pattern = 'HIGH_BETA_PATTERN';
            state.brainState = 'ANXIOUS';
            state.dominantFrequency = 'High-Beta (20-30Hz)';
        } else if (careType === CareType.BURNOUT) {
            layer1 = adrenalScore >= 12 || survey.chronicFatigue || isiScore >= 12;
            layer2 = (state.snsLevel < 48 && state.pnsLevel < 48) || state.ansBalance === 'PNS_DOMINANT' || (hrv.fatigue >= 50);
            layer3 = hasCognitiveIssues || pureStudyRatio < 65 || (protocol?.motivationalFactor !== undefined && protocol.motivationalFactor <= 3);
            state.pattern = 'HIGH_THETA_PATTERN';
            state.brainState = 'FATIGUED';
            state.dominantFrequency = 'Theta (4-8Hz)';
        } else if (careType === CareType.LOW_ENERGY || careType === CareType.DEPRESSION_AMOTIVATION || careType === CareType.ADRENAL) {
            layer1 = survey.chronicFatigue || adrenalScore >= 10 || (protocol?.motivationalFactor !== undefined && protocol.motivationalFactor <= 3);
            layer2 = state.ansBalance === 'PNS_DOMINANT' || state.pnsLevel >= 53 || (hrv.vitality < 50) || paraCount >= 1;
            layer3 = protocolBehavior <= 3 || pureStudyRatio < 65 || (cognitiveResults?.processingSpeed?.speedLevel === 'slow');
            state.pattern = 'HIGH_THETA_PATTERN';
            state.brainState = 'FATIGUED';
            state.dominantFrequency = 'Theta (4-8Hz)';
        } else if (careType === CareType.BRAIN_FATIGUE || careType === CareType.ATTENTION_DEFICIT || careType === CareType.CONCENTRATION || careType === CareType.HYPERSENSITIVE) {
            layer1 = concentrationScore >= 10 || (protocol?.noiseLevel !== undefined && protocol.noiseLevel >= 6) || (survey.digitalAddictionLevel !== undefined && survey.digitalAddictionLevel !== 'normal');
            layer2 = (hrv.fatigue >= 45) || state.ansBalance !== 'BALANCED' || ((hrv.physicalStress || 0) >= 45);
            layer3 = hasCognitiveIssues || concentrationScore >= 12 || protocolBehavior <= 3;
            state.pattern = 'MIXED_PATTERN';
            state.brainState = 'FOCUSED';
            state.dominantFrequency = 'SMR/Mid-Beta (12-15Hz)';
        } else if (careType === CareType.SLEEP) {
            layer1 = isiScore >= 10;
            layer2 = (protocol?.sleepHours !== undefined && protocol.sleepHours < 6.5) || (hrv.fatigue >= 50) || Boolean(survey.sympatheticSymptoms?.includes('insomnia'));
            layer3 = concentrationScore >= 8 || protocolBehavior <= 3;
            state.pattern = 'HIGH_THETA_PATTERN';
            state.brainState = 'FATIGUED';
            state.dominantFrequency = 'Theta (4-8Hz)';
        } else if (careType === CareType.CIRCULATION) {
            layer1 = (survey.fatigueSymptomsCount || 0) >= 2;
            layer2 = (hrv.vitality < 50) || state.pnsLevel >= 52;
            layer3 = true;
            state.pattern = 'MIXED_PATTERN';
            state.brainState = 'FOCUSED';
            state.dominantFrequency = 'Alpha (8-12Hz)';
        } else if (careType === CareType.HEALTHY) {
            layer1 = baiScore < 15 && isiScore < 15;
            layer2 = state.ansBalance === 'BALANCED' || (state.snsLevel >= 45 && state.snsLevel <= 55);
            layer3 = !hasCognitiveIssues && concentrationScore < 12;
            state.pattern = 'BALANCED_ALPHA';
            state.brainState = 'CALM';
            state.dominantFrequency = 'Alpha (8-12Hz)';
        } else {
            layer1 = true;
            layer2 = true;
            layer3 = true;
            state.pattern = 'MIXED_PATTERN';
            state.brainState = 'FOCUSED';
            state.dominantFrequency = 'Alpha (8-12Hz)';
        }

        const matches = [layer1, layer2, layer3].filter(Boolean).length;

        if (matches === 3) {
            state.coherence = 95;
            state.coherenceLevel = 'HIGH';
            state.confidence = 0.95;
        } else if (matches === 2) {
            state.coherence = 80;
            state.coherenceLevel = 'HIGH';
            state.confidence = 0.80;
        } else if (matches === 1) {
            state.coherence = 60;
            state.coherenceLevel = 'MODERATE';
            state.confidence = 0.60;
        } else {
            state.coherence = 40;
            state.coherenceLevel = 'CONFLICT';
            state.confidence = 0.40;
        }

        return state;
    }

    // --- Layer 3: Physical EEG Analysis (Clinical / Hardware BrainBody Mode Only) ---
    state.eegBalance = {
        gamma: hrv.eegGamma || 0,
        betaH: hrv.eegHBeta || 0,
        betaM: hrv.eegMBeta || 0,
        betaL: hrv.eegLBeta || 0,
        alpha: hrv.eegAlpha || 0,
        theta: hrv.eegTheta || 0
    };

    // Determine Pattern
    if (state.eegBalance.betaH > 20) state.pattern = 'HIGH_BETA_PATTERN';
    else if (state.eegBalance.theta > 22) state.pattern = 'HIGH_THETA_PATTERN';
    else if (state.eegBalance.alpha >= 20 && state.eegBalance.alpha <= 25) state.pattern = 'BALANCED_ALPHA';
    else state.pattern = 'MIXED_PATTERN';

    // Coherence Calculation
    let layer1 = false; // Survey
    let layer2 = false; // HRV
    let layer3 = false; // EEG

    if (careType === CareType.ANXIETY_TENSION || careType === CareType.STRESS_OVERLOAD) {
        layer1 = (survey.bai || 0) >= 12 || (survey.gad7 !== undefined && survey.gad7 >= 8);
        layer2 = state.ansBalance === 'SNS_DOMINANT' || state.snsLevel >= 55;
        layer3 = state.pattern === 'HIGH_BETA_PATTERN';
    } else if (careType === CareType.SLEEP || careType === CareType.BRAIN_FATIGUE || careType === CareType.BURNOUT) {
        layer1 = (survey.isi || 0) >= 12 || (survey.adrenalFatigueScore !== undefined && survey.adrenalFatigueScore >= 12);
        layer2 = state.ansBalance === 'PNS_DOMINANT' || (hrv.sns < 45 && hrv.pns < 45);
        layer3 = state.pattern === 'HIGH_THETA_PATTERN';
    } else if (careType === CareType.HEALTHY) {
        layer1 = (survey.bai || 0) < 12 && (survey.isi || 0) < 12;
        layer2 = state.ansBalance === 'BALANCED';
        layer3 = state.pattern === 'BALANCED_ALPHA';
    } else {
        layer1 = true;
        layer2 = true;
        layer3 = true;
    }

    const matches = [layer1, layer2, layer3].filter(Boolean).length;

    if (matches === 3) {
        state.coherence = 95;
        state.coherenceLevel = 'HIGH';
        state.confidence = 0.95;
    } else if (matches === 2) {
        state.coherence = 75;
        state.coherenceLevel = 'MODERATE';
        state.confidence = 0.75;
    } else {
        state.coherence = 35;
        state.coherenceLevel = 'CONFLICT';
        state.confidence = 0.35;
    }

    state.brainState = state.pattern === 'HIGH_BETA_PATTERN' ? 'ANXIOUS'
        : state.pattern === 'HIGH_THETA_PATTERN' ? 'FATIGUED'
            : state.pattern === 'BALANCED_ALPHA' ? 'CALM' : 'FOCUSED';

    // Assign Dominant and Secondary frequencies
    if (Array.isArray(hrv.dominantEEG) && hrv.dominantEEG.length > 0) {
        state.dominantFrequency = hrv.dominantEEG[0];
        if (hrv.dominantEEG.length > 1) {
            state.secondaryFrequency = hrv.dominantEEG[1];
        }
    } else {
        state.dominantFrequency = state.pattern === 'HIGH_BETA_PATTERN' ? 'High-Beta (20-30Hz)'
            : state.pattern === 'HIGH_THETA_PATTERN' ? 'Theta (4-8Hz)'
                : state.pattern === 'BALANCED_ALPHA' ? 'Alpha (8-12Hz)' : 'Mid-Beta (15-20Hz)';
    }

    return state;
};
