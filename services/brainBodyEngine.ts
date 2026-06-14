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
    careType: CareType // The initially determined CareType from logicEngine
): BrainBodyState => {
    // Default fallback (Survey only Mode)
    let state: BrainBodyState = {
        ansBalance: 'BALANCED',
        snsLevel: 50,
        pnsLevel: 50,
        brainState: 'CALM',
        dominantFrequency: 'Unknown',
        eegBalance: { gamma: 0, betaH: 0, betaM: 0, betaL: 0, alpha: 0, theta: 0 },
        coherence: 50,
        coherenceLevel: 'MODERATE',
        pattern: 'UNKNOWN',
        confidence: 0.5,
    };

    if (!hrv) {
        return state;
    }

    const isPortable = !!hrv.portableHrv;
    const hasEEG = !isPortable && hrv.eegGamma !== undefined && hrv.eegGamma >= 0;

    // --- Layer 2: HRV Analysis ---
    state.snsLevel = hrv.sns;
    state.pnsLevel = hrv.pns;
    state.ansBalance = hrv.sns > 65 ? 'SNS_DOMINANT' : hrv.pns > 65 ? 'PNS_DOMINANT' : 'BALANCED';

    if (!hasEEG) {
        // Portable Mode Logic (2-layer)
        let layer1 = false;
        let layer2 = false;

        // Example logic for ANXIETY
        if (careType === CareType.ANXIETY_TENSION) {
            layer1 = survey.bai >= 15;
            layer2 = state.ansBalance === 'SNS_DOMINANT';
        } else if (careType === CareType.SLEEP || careType === CareType.BURNOUT) {
            layer1 = survey.isi >= 15 || survey.adrenalFatigueScore! > 15;
            layer2 = state.ansBalance === 'PNS_DOMINANT';
        } else {
            // Default check
            layer1 = true;
            layer2 = state.ansBalance === 'BALANCED';
        }

        state.coherence = layer1 && layer2 ? 80 : layer1 || layer2 ? 50 : 20;
        state.coherenceLevel = state.coherence >= 80 ? 'HIGH' : state.coherence >= 50 ? 'MODERATE' : 'LOW';
        state.confidence = state.coherence / 100;
        
        return state;
    }

    // --- Layer 3: EEG Analysis (BrainBody Mode) ---
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
        layer1 = survey.bai >= 15 || survey.gad7! >= 10;
        layer2 = state.ansBalance === 'SNS_DOMINANT';
        layer3 = state.pattern === 'HIGH_BETA_PATTERN';
    } else if (careType === CareType.SLEEP || careType === CareType.BRAIN_FATIGUE || careType === CareType.BURNOUT) {
        layer1 = survey.isi >= 15 || survey.adrenalFatigueScore! > 15;
        layer2 = state.ansBalance === 'PNS_DOMINANT' || (hrv.sns < 40 && hrv.pns < 40);
        layer3 = state.pattern === 'HIGH_THETA_PATTERN';
    } else if (careType === CareType.HEALTHY) {
        layer1 = survey.bai < 10 && survey.isi < 10;
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
        state.coherence = 70;
        state.coherenceLevel = 'MODERATE';
        state.confidence = 0.70;
    } else {
        state.coherence = 30;
        state.coherenceLevel = 'CONFLICT';
        state.confidence = 0.30;
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
        state.dominantFrequency = 'Unknown';
    }

    return state;
};
