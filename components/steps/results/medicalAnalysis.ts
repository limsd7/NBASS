import { analyzeMedicalData, hasRealBloodData } from '../../../services/medicalEngine';
import type { AssessmentResult } from '../../../types';

// Moved verbatim from ResultsView.tsx (no logic change)
export const resolveMedicalAnalysis = (result: AssessmentResult) => {
    if (result.medicalAnalysis) return result.medicalAnalysis;
    if (hasRealBloodData(result.bloodTest)) {
        try {
            return analyzeMedicalData(result.bloodTest, result.careType, result.student?.gender);
        } catch (e) {
            console.error("MedicalEngine analysis error:", e);
            return null;
        }
    }
    return null;
};
