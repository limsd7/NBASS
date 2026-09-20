import { StudentInfo, HRVData, ProtocolData, LearningAnalyticsData } from '../types';

export const generateSerialID = () => {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ID-${dateStr}-${randomStr}`;
};

export const getTodayStr = () => new Date().toISOString().split('T')[0];

export const calculateAge = (birthDate: string) => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
};

export const calculateBMI = (height?: number, weight?: number): number => {
    if (height && weight) {
        const h = height / 100;
        return parseFloat((weight / (h * h)).toFixed(1));
    }
    return 0;
};

/**
 * 나이 또는 생년월일 기반 예상 학년 자동 산출
 */
export const estimateGradeByAgeOrBirthDate = (birthDateOrAge: string | number): string => {
    let yearAge = 19; // 기본 고3 연나이

    if (typeof birthDateOrAge === 'number') {
        yearAge = birthDateOrAge >= 10 && birthDateOrAge <= 25 ? (birthDateOrAge <= 19 ? birthDateOrAge + 1 : birthDateOrAge) : 19;
    } else if (typeof birthDateOrAge === 'string' && birthDateOrAge.length >= 4) {
        const birthYear = parseInt(birthDateOrAge.slice(0, 4), 10);
        const currentYear = new Date().getFullYear();
        if (!isNaN(birthYear) && birthYear > 1950 && birthYear <= currentYear) {
            yearAge = currentYear - birthYear + 1; // 한국 학년 연나이 기준
        }
    }

    if (yearAge <= 14) return "중등 1학년";
    if (yearAge === 15) return "중등 2학년";
    if (yearAge === 16) return "중등 3학년";
    if (yearAge === 17) return "고등 1학년";
    if (yearAge === 18) return "고등 2학년";
    if (yearAge === 19) return "고등 3학년";
    return "N수생";
};

export const normalizeGrade = (grade?: string): string => {
    if (!grade) return "고등 3학년";
    const clean = grade.trim();
    if (clean === "고3" || clean.includes("고3") || clean.includes("고등 3") || clean.includes("고등학교 3")) return "고등 3학년";
    if (clean === "고2" || clean.includes("고2") || clean.includes("고등 2") || clean.includes("고등학교 2")) return "고등 2학년";
    if (clean === "고1" || clean.includes("고1") || clean.includes("고등 1") || clean.includes("고등학교 1")) return "고등 1학년";
    if (clean === "중3" || clean.includes("중3") || clean.includes("중등 3") || clean.includes("중학교 3")) return "중등 3학년";
    if (clean === "중2" || clean.includes("중2") || clean.includes("중등 2") || clean.includes("중학교 2")) return "중등 2학년";
    if (clean === "중1" || clean.includes("중1") || clean.includes("중등 1") || clean.includes("중학교 1")) return "중등 1학년";
    if (clean.includes("N수") || clean.includes("재수") || clean.includes("성인")) return "N수생";
    if (GRADE_OPTIONS.includes(clean)) return clean;
    return "고등 3학년";
};

export const GRADE_OPTIONS = [
    "고등 3학년", "고등 2학년", "고등 1학년",
    "중등 3학년", "중등 2학년", "중등 1학년",
    "N수생"
];

export const MBTI_OPTIONS = [
    'ISTJ', 'ISFJ', 'INFJ', 'INTJ', 'ISTP', 'ISFP', 'INFP', 'INTP',
    'ESTP', 'ESFP', 'ENFP', 'ENTP', 'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ'
];

export const LOCATION_OPTIONS = [
    '학교 (School)', '학원 (Academy)', '도서관 (Library)',
    '카페 (Cafe)', '집 (Home)', '독서실 (Study Room)', '기타'
];

export const getNoiseDescription = (level: number) => {
    const descriptions: Record<number, string> = {
        1: "1: 완전 차단 (무음실 수준)",
        2: "2: 극히 조용 (심야 한적한 주거지)",
        3: "3: 조용함 (독서실/도서관 수준)",
        4: "4: 약한 소음 (조용한 사무실의 정보기기 소리)",
        5: "5: 보통 (카페 백색소음/잔잔한 음악)",
        6: "6: 다소 시끄러움 (학교 교실 수준 활동 소음)",
        7: "7: 시끄러움 (사무실 대화/복도 소음)",
        8: "8: 매우 시끄러움 (사람이 많은 식당/대기실)",
        9: "9: 소음 심각 (진공청소기나 공사현장 근접)",
        10: "10: 극한 소음 (공사현장/지하철 플랫폼)"
    };
    return descriptions[level] || "";
};

export const getStressDescription = (level: number) => {
    const descriptions: Record<number, string> = {
        1: "1: 최상의 안온 (명상 직후 같은 안정 상태)",
        2: "2: 매우 안정 (충분한 휴식을 취하고 있는 상태)",
        3: "3: 안정 (적절한 자극과 정상적인 공부 상태)",
        4: "4: 보통 이하 (무난하게 일상을 소화하는 상태)",
        5: "5: 보통 (마감 압박이나 적당한 부담감 존재)",
        6: "6: 약간 높음 (피로가 누적되기 시작하고 다소 지침)",
        7: "7: 높음 (지속적인 피로와 긴장감이 느껴짐)",
        8: "8: 매우 높음 (심한 압박감과 두통/긴장 동반)",
        9: "9: 번아웃 직전 (감정 조절이 어렵고 무력함)",
        10: "10: 한계 상태 (공황 또는 정신적 마비 상태)"
    };
    return descriptions[level] || "";
};

export const initialStudent: StudentInfo = {
    id: generateSerialID(),
    name: '',
    birthDate: '2008-05-20',
    testDate: getTodayStr(),
    age: 18,
    gender: 'Male',
    grade: '고등 3학년',
    height: 175,
    weight: 65,
    activityLevel: 2,
    mbti: 'ISTJ',
    bmi: 21.2,
    selectedSubjects: ['korean', 'math', 'english', 'korean_history'],
    focusSubjects: ['math'],
    weakSubject: 'math'
};

export const initialHRV: HRVData = {
    sns: 0,
    pns: 0,
    ansAge: 0,
    fatigue: 0,
    vitality: 0,
    physicalStress: 0,
    vlf: 0,
    lf: 0,
    hf: 0,
    tp: 0,
    hrvIndex: 0,
    meanHr: 0,
    meanBpm: 75,
    stressIndex: 0,
    ppgLevel: 1, // Default Level 1
    brainScore: 0,
    dominantEEG: [], // Changed to array for multi-select
    eegGamma: 0,
    eegHBeta: 0,
    eegMBeta: 0,
    eegLBeta: 0,
    eegAlpha: 0,
    eegTheta: 0,
    brainBalanceL: 50,
    brainBalanceR: 50,
    brainStressCategory: '',
    concentrationLevel: 0,
    concentrationCategory: '',
    attentionLevel: 0,
    attentionCategory: ''
};

export const initialProtocol: ProtocolData = {
    location: '집(Home)',
    noiseLevel: 1,
    stressLevel: 1,
    avgSleep: 6, // Maintaining realistic default for sleep
    sleepHours: 6,
    emotionalFactor: 1,
    motivationalFactor: 1,
    behavioralFactor: 1,
    taskDifficulty: 1,
    timeDistortion: 1
};

export const initialAnalytics: LearningAnalyticsData = {
    isTested: false,
    pureStudyRatio: 0,
    avgFocusDuration: 0,
    distractionCount: 0,
    goldenTimeStart: "",
    goldenTimeEnd: "",
    lowEfficiencyTime: "",
    chronotype: 'neutral',
    weekdayWeekendGap: 0,
    subjectRatios: {
        korean: 0,
        math: 0,
        english: 0,
        science: 0,
        social: 0,
        other: 0
    },
    goalAchievementRate: 0,
    perceivedDifficulty: 0,
    avgSleepHours: 0,
    sleepQuality: 0,
    preferredLocation: '',
    studyStreak: 0,
    breakAdequacy: 0,
    burnoutCycle: 0,
    energyPattern: 'stable'
};

/**
 * 학습 밀도 및 패턴 분석 검사 실제 시행 여부 검증 함수
 * - isTested === true 인 경우 정식 완료 인정
 * - 구버전 하드코딩 더미 시그니처(70%, 80%, 12일, 10:00~12:00)는 미시행(false)으로 간주
 * - 주요 입력값이 모두 비어있거나 0인 경우 미시행(false)
 */
export const isLearningAnalyticsTested = (analytics?: LearningAnalyticsData | null): boolean => {
    if (!analytics) return false;
    if (analytics.isTested === true) return true;
    if (analytics.isTested === false) return false;

    // 구버전 하드코딩 더미 시그니처 자동 필터링
    const isLegacyMock = (
        analytics.pureStudyRatio === 70 &&
        analytics.goalAchievementRate === 80 &&
        analytics.studyStreak === 12 &&
        analytics.goldenTimeStart === "10:00" &&
        analytics.goldenTimeEnd === "12:00"
    );
    if (isLegacyMock) return false;

    // 주요 입력값이 전혀 없는 경우
    if (!analytics.pureStudyRatio && !analytics.goldenTimeStart && !analytics.goalAchievementRate) {
        return false;
    }

    return true;
};
