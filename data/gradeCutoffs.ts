export interface GradeCutoff {
    rawScore: number;
    standardScore: number;
    percentile: number;
    grade: number;
}

export interface ExamCutoff {
    examId: string;
    examName: string;
    // subjectId -> array of cutoff data mapped by descending rawScore or just finding the closest
    subjects: Record<string, GradeCutoff[]>;
}

// Helper to generate a dummy cutoff curve for testing
const generateMockCurve = (grade1Cut: number, maxStandardScore: number): GradeCutoff[] => {
    const curve: GradeCutoff[] = [];
    for (let raw = 100; raw >= 0; raw--) {
        let grade = 9;
        let percentile = 0;
        let std = 0;

        if (raw >= grade1Cut) { grade = 1; percentile = 96 + Math.floor((raw - grade1Cut) / 2); std = maxStandardScore - (100 - raw); }
        else if (raw >= grade1Cut - 8) { grade = 2; percentile = 89 + Math.floor((raw - (grade1Cut - 8)) / 1.5); std = maxStandardScore - 10 - (grade1Cut - 1 - raw); }
        else if (raw >= grade1Cut - 17) { grade = 3; percentile = 77 + Math.floor((raw - (grade1Cut - 17)) / 1.2); std = maxStandardScore - 20 - (grade1Cut - 9 - raw); }
        else if (raw >= grade1Cut - 27) { grade = 4; percentile = 60 + Math.floor((raw - (grade1Cut - 27)) / 1.2); std = maxStandardScore - 30 - (grade1Cut - 18 - raw); }
        else if (raw >= grade1Cut - 38) { grade = 5; percentile = 40 + Math.floor((raw - (grade1Cut - 38)) / 1.2); std = maxStandardScore - 40 - (grade1Cut - 28 - raw); }
        else if (raw >= grade1Cut - 50) { grade = 6; percentile = 23 + Math.floor((raw - (grade1Cut - 50)) / 1.2); std = maxStandardScore - 50 - (grade1Cut - 39 - raw); }
        else if (raw >= grade1Cut - 62) { grade = 7; percentile = 11 + Math.floor((raw - (grade1Cut - 62)) / 1.5); std = maxStandardScore - 60 - (grade1Cut - 51 - raw); }
        else if (raw >= grade1Cut - 75) { grade = 8; percentile = 4 + Math.floor((raw - (grade1Cut - 75)) / 2); std = maxStandardScore - 70 - (grade1Cut - 63 - raw); }
        else { grade = 9; percentile = Math.max(0, Math.floor(raw / 5)); std = Math.max(0, 50 - (100 - raw)); }

        percentile = Math.min(100, Math.max(0, percentile));
        
        curve.push({ rawScore: raw, standardScore: std, percentile, grade });
    }
    return curve;
};

export const MOCK_EXAM_CUTOFFS: ExamCutoff[] = [
    {
        examId: '2024_06_mock',
        examName: '2024년 6월 평가원 모의고사',
        subjects: {
            'korean': generateMockCurve(88, 136),
            'math': generateMockCurve(84, 142),
            'english': generateMockCurve(90, 100), // Absolute grading simulation
            'social_culture': generateMockCurve(47, 72),
            'life_science_1': generateMockCurve(45, 71)
        }
    },
    {
        examId: '2024_09_mock',
        examName: '2024년 9월 평가원 모의고사',
        subjects: {
            'korean': generateMockCurve(92, 132),
            'math': generateMockCurve(88, 138),
            'english': generateMockCurve(90, 100),
            'social_culture': generateMockCurve(45, 74),
            'life_science_1': generateMockCurve(42, 75)
        }
    }
];

export const getCutoffData = (examId: string, subjectId: string, rawScore: number): GradeCutoff | null => {
    const exam = MOCK_EXAM_CUTOFFS.find(e => e.examId === examId);
    if (!exam) return null;
    
    const subjectCurve = exam.subjects[subjectId];
    if (!subjectCurve) return null;
    
    return subjectCurve.find(c => c.rawScore === rawScore) || null;
};
