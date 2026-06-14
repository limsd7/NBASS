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

export const GRADE_OPTIONS = [
    "중등 1학년", "중등 2학년", "중등 3학년",
    "고등 1학년", "고등 2학년", "고등 3학년",
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
    age: 16,
    gender: 'Male',
    grade: '고등 3학년',
    height: 175,
    weight: 65,
    activityLevel: 2,
    mbti: 'ISTJ',
    bmi: 21.2
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
    emotionalFactor: 1,
    motivationalFactor: 1,
    behavioralFactor: 1,
    taskDifficulty: 1,
    timeDistortion: 1
};

export const initialAnalytics: LearningAnalyticsData = {
    pureStudyRatio: 70,
    avgFocusDuration: 50,
    distractionCount: 3,
    goldenTimeStart: "10:00",
    goldenTimeEnd: "12:00",
    lowEfficiencyTime: "14:00-16:00",
    chronotype: 'neutral',
    weekdayWeekendGap: 20,
    subjectRatios: {
        korean: 20,
        math: 40,
        english: 20,
        science: 10,
        social: 5,
        other: 5
    },
    goalAchievementRate: 80,
    perceivedDifficulty: 3,
    avgSleepHours: 6,
    sleepQuality: 3,
    preferredLocation: '독서실',
    studyStreak: 12,
    breakAdequacy: 3,
    burnoutCycle: 21,
    energyPattern: 'stable'
};
