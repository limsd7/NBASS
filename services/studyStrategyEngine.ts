import { StudentInfo, CareType } from "../types";
import { getLearningStrategy } from '../data/learningStrategies';

export interface StudyStrategyAnalysis {
    learningStyle: string;
    subjectStrategy: {
        korean: string;
        math: string;
        english: string;
    };
    concentration: string;
    mentalCare: string;
}

export const analyzeStudyStrategy = (student: StudentInfo, careType: CareType): StudyStrategyAnalysis => {
    const strategy = getLearningStrategy(student.mbti, careType);

    return {
        learningStyle: strategy.learningStyle,
        subjectStrategy: strategy.subjectStrategy,
        concentration: strategy.concentration,
        mentalCare: strategy.mentalCare,
    };
};
