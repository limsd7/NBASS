import { evaluateBrainBodyCoherence } from '../../../services/brainBodyEngine';
import type { AssessmentResult } from '../../../types';

// Moved verbatim from ResultsView.tsx (no logic change)
export const resolveBrainBodyState = (result: AssessmentResult) => {
    try {
        return evaluateBrainBodyCoherence(result.hrv, result.survey, result.careType, result.protocol, result.cognitiveResults);
    } catch (e) {
        console.error("BrainBodyEngine error:", e);
        return null;
    }
};
