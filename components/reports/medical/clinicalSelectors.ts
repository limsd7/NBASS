import { CareType, type AssessmentResult } from '../../../types';
import { evaluateBrainBodyCoherence } from '../../../services/brainBodyEngine';
import { getLearningStrategy } from '../../../data/learningStrategies';
import { getDynamicSubjectRoadmap } from '../../../services/studyStrategyEngine';
import { inferLearningTraitsFromProfile } from '../../../data/learningTraitsData';

// Clinical selectors (moved verbatim from MedicalReport.tsx; no logic change)
export const resolveTraits = (result: AssessmentResult) => {
    const { student, survey, studyEfficiencyResults } = result;
    const rawTraits = student?.learningTraits || survey?.learningTraits;
    const isDefaultFlat50 = !rawTraits || !rawTraits.scores || (
        rawTraits.scores.gritPlan === 50 &&
        rawTraits.scores.mentalResilience === 50 &&
        rawTraits.scores.temperament === 50 &&
        rawTraits.scores.metaCognition === 50 &&
        rawTraits.scores.internalMotivation === 50
    );
    if (isDefaultFlat50) {
        return inferLearningTraitsFromProfile({
            careType: result.careType,
            survey,
            studyEfficiency: studyEfficiencyResults as any,
            student
        });
    }
    return rawTraits;
};

export const resolveCareStrategy = (traits: any, careType: CareType) => {
    try {
        return getLearningStrategy(traits, careType);
    } catch (e) {
        console.error("getLearningStrategy error in MedicalReport:", e);
        return null;
    }
};

export const resolveSubjectRoadmap = (result: AssessmentResult) => {
    try {
        return getDynamicSubjectRoadmap(result.student, result.careType, result.gradeHistory);
    } catch (e) {
        console.error("getDynamicSubjectRoadmap error in MedicalReport:", e);
        return null;
    }
};

export const resolveBrainBody = (result: AssessmentResult) => {
    try {
        return evaluateBrainBodyCoherence(result.hrv, result.survey, result.careType, result.protocol, result.cognitiveResults);
    } catch (e) {
        console.error("BrainBodyEngine error in MedicalReport:", e);
        return null;
    }
};

// Extract top 3 valid scores for the cards
export const resolveValidScores = (classificationResult: AssessmentResult['classificationResult']) => {
    const validScores = classificationResult?.allScores?.filter(s => s.type !== CareType.UNASSESSED).slice(0, 3) || [];
    const primaryScoreData = validScores.length > 0 ? validScores[0] : null;
    const secondary1Data = validScores.length > 1 ? validScores[1] : null;
    const secondary2Data = validScores.length > 2 ? validScores[2] : null;
    return { validScores, primaryScoreData, secondary1Data, secondary2Data };
};
