export interface GradeCutoff {
    rawScore: number;
    standardScore: number;
    percentile: number;
    grade: number;
}

export interface ExamCutoff {
    examId: string;
    examName: string;
    examYear?: number;
    description?: string;
    // subjectId -> array of cutoff data mapped by descending rawScore or just finding the closest
    subjects: Record<string, GradeCutoff[]>;
}

export const CUTOFFS_STORAGE_KEY = 'nbass_exam_cutoffs_db';

// Helper to generate an ESTIMATED cutoff curve based on Grade 1 Cut & Max Standard Score
// (1등급컷 실측 앵커 기반 추정치. 전 구간 실채점이 아니므로 UI에 추정치로 표기한다)
export const generateMockCurve = (grade1Cut: number, maxStandardScore: number): GradeCutoff[] => {
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
        
        curve.push({ rawScore: raw, standardScore: Math.max(0, std), percentile, grade });
    }
    return curve;
};

export const DEFAULT_MOCK_EXAM_CUTOFFS: ExamCutoff[] = [
    {
        examId: '2025_csat',
        examName: '2025학년도 대학수학능력시험 (1등급컷 기준 추정치)',
        examYear: 2025,
        description: '한국교육과정평가원 공시 1등급컷 기준 추정치 (참고용, 전 구간 실채점 아님)',
        subjects: {
            'korean': generateMockCurve(91, 139),
            'math': generateMockCurve(85, 145),
            'english': generateMockCurve(90, 100),
            'social_culture': generateMockCurve(46, 73),
            'life_science_1': generateMockCurve(44, 72)
        }
    },
    {
        examId: '2024_09_mock',
        examName: '2024년 9월 평가원 모의고사 (추정치)',
        examYear: 2024,
        description: '평가원 9월 모의평가 1등급컷 기준 추정치 (참고용)',
        subjects: {
            'korean': generateMockCurve(92, 132),
            'math': generateMockCurve(88, 138),
            'english': generateMockCurve(90, 100),
            'social_culture': generateMockCurve(45, 74),
            'life_science_1': generateMockCurve(42, 75)
        }
    },
    {
        examId: '2024_06_mock',
        examName: '2024년 6월 평가원 모의고사 (추정치)',
        examYear: 2024,
        description: '평가원 6월 모의평가 1등급컷 기준 추정치 (참고용)',
        subjects: {
            'korean': generateMockCurve(88, 136),
            'math': generateMockCurve(84, 142),
            'english': generateMockCurve(90, 100),
            'social_culture': generateMockCurve(47, 72),
            'life_science_1': generateMockCurve(45, 71)
        }
    }
];

export const MOCK_EXAM_CUTOFFS: ExamCutoff[] = DEFAULT_MOCK_EXAM_CUTOFFS;

// Retrieve from localStorage or fallback to default
export const getMockExamCutoffs = (): ExamCutoff[] => {
    try {
        const saved = localStorage.getItem(CUTOFFS_STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
            }
        }
    } catch (e) {
        console.warn('Failed to parse cached exam cutoffs:', e);
    }
    return DEFAULT_MOCK_EXAM_CUTOFFS;
};

// Save to localStorage
export const saveMockExamCutoffs = (data: ExamCutoff[]): void => {
    try {
        localStorage.setItem(CUTOFFS_STORAGE_KEY, JSON.stringify(data));
        window.dispatchEvent(new CustomEvent('nbass_cutoffs_updated', { detail: data }));
    } catch (e) {
        console.error('Failed to save exam cutoffs to localStorage:', e);
    }
};

// Reset to initial defaults
export const resetMockExamCutoffs = (): ExamCutoff[] => {
    try {
        localStorage.removeItem(CUTOFFS_STORAGE_KEY);
        window.dispatchEvent(new CustomEvent('nbass_cutoffs_updated', { detail: DEFAULT_MOCK_EXAM_CUTOFFS }));
    } catch (e) {
        console.error('Failed to reset exam cutoffs:', e);
    }
    return DEFAULT_MOCK_EXAM_CUTOFFS;
};

export const getCutoffData = (examId: string, subjectId: string, rawScore: number, customList?: ExamCutoff[]): GradeCutoff | null => {
    const list = customList || getMockExamCutoffs();
    const exam = list.find(e => e.examId === examId);
    if (!exam) return null;

    const subjectCurve = exam.subjects[subjectId];
    if (!Array.isArray(subjectCurve) || subjectCurve.length === 0) return null;

    // 정수 반올림 + 범위 클램프 후 완전일치 조회 (소수·범위밖 입력 방어)
    const rounded = Math.round(rawScore);
    if (!Number.isFinite(rounded)) return null;
    const raws = subjectCurve.map(c => c.rawScore).filter(n => Number.isFinite(n));
    if (raws.length === 0) return null;
    const min = Math.min(...raws);
    const max = Math.max(...raws);
    const clamped = Math.max(min, Math.min(max, rounded));
    return subjectCurve.find(c => c.rawScore === clamped) || null;
};
