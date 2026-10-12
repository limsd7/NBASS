import type { HistoryRecord } from './database';
import { CareType, StudentInfo } from '../types';

/**
 * 기본 제공 테스트/검증 계정들의 정밀 진단 히스토리 데이터
 * - limsd7: PRO 등급 (뇌피로 집중곤란형, Brain Fatigue)
 * - 연습001 (ID-20260820-6RKR): PREMIUM 등급 (몰입저하형 / 번아웃)
 * - 오류검증_전문가01 (TEST_EXPERT_01): EXPERT 등급 (전 기능 검증)
 */

export const getLimsd7Records = (): HistoryRecord[] => {
  const studentInfo: StudentInfo = {
    id: 'limsd7',
    name: 'limsd7',
    email: 'limsd7@nbass.co.kr',
    birthDate: '2008-07-15',
    testDate: '2026-09-22',
    age: 18,
    gender: 'Male',
    grade: '고등 3학년',
    height: 176,
    weight: 66,
    activityLevel: 2,
    mbti: 'INTJ',
    bmi: 21.3,
    school: '대치 미래탐구 (PRO 집중케어반)',
    membershipTier: 'pro',
    selectedSubjects: ['korean', 'math', 'english', 'inquiry'],
    focusSubjects: ['math'],
    weakSubject: 'math'
  };

  const record1: HistoryRecord = {
    student: studentInfo,
    careType: CareType.BRAIN_FATIGUE,
    dominantCareType: CareType.BRAIN_FATIGUE,
    score: 79,
    scoreLevel: '주의',
    date: '2026-09-22',
    analysisText: 'limsd7 님의 신경인지 및 자율신경 진단 결과, 고강도 문제풀이 누적으로 인한 High Beta파 과각성 및 전두엽 뇌피로(Brain Fatigue) 상태가 확인되었습니다. PRO 회원 맞춤 집중력 회복 프로토콜이 권장됩니다.',
    sleepAnalysisText: '취침 전 블루라이트 노출 차단 및 기상 후 15분 햇빛 노출로 수면 효율과 뇌 회복력을 향상시켜야 합니다.',
    hrv: {
      sns: 66,
      pns: 34,
      ansAge: 23,
      fatigue: 74,
      vitality: 42,
      physicalStress: 68,
      vlf: 520,
      lf: 470,
      hf: 215,
      tp: 1205,
      hrvIndex: 12.4,
      meanHr: 78,
      meanBpm: 78,
      stressIndex: 68,
      ppgLevel: 2,
      brainScore: 71,
      dominantEEG: ['High-Beta', 'Gamma'],
      eegGamma: 18,
      eegHBeta: 34,
      eegMBeta: 22,
      eegLBeta: 14,
      eegAlpha: 8,
      eegTheta: 4,
      brainBalanceL: 48,
      brainBalanceR: 52,
      brainStressCategory: '과각성 뇌피로',
      concentrationLevel: 62,
      concentrationCategory: '주의력 산만/피로',
      attentionLevel: 65,
      attentionCategory: '집중 유지력 저하'
    },
    survey: {
      bai: 14,
      isi: 13,
      chronicFatigue: true,
      fatigueSymptomsCount: 4,
      symptoms: ['오후 뇌피로 급증', '수학 킬러문항 풀이 시 인지 병목', '지문 독해 시 줄 놓침', '수면 후 개운함 부족'],
      sympatheticSymptoms: ['시험 압박감', '어깨/목 뻐근함'],
      parasympatheticSymptoms: ['무기력감', '식후 졸음'],
      concentrationScore: 11
    },
    protocol: {
      location: '독서실/학원 집중실',
      noiseLevel: 2,
      stressLevel: 3,
      avgSleep: 6.2,
      sleepHours: 6.2,
      emotionalFactor: 3,
      motivationalFactor: 4,
      behavioralFactor: 3,
      taskDifficulty: 4,
      timeDistortion: 3
    },
    analytics: {
      isTested: true,
      pureStudyRatio: 72,
      avgFocusDuration: 42,
      distractionCount: 7,
      goldenTimeStart: "09:30",
      goldenTimeEnd: "12:30",
      lowEfficiencyTime: "14:00~16:00",
      chronotype: 'morning',
      weekdayWeekendGap: 1.5,
      subjectRatios: {
        korean: 20,
        math: 45,
        english: 20,
        science: 15,
        social: 0,
        other: 0
      },
      goalAchievementRate: 78,
      perceivedDifficulty: 4,
      avgSleepHours: 6.2,
      sleepQuality: 3,
      preferredLocation: '독서실',
      studyStreak: 18,
      breakAdequacy: 3,
      burnoutCycle: 2,
      energyPattern: 'fluctuating'
    },
    nutrition: ['포스파티딜세린(PS)', '고함량 활성형 비타민B군', '글리시네이트 마그네슘', 'L-테아닌'],
    careGuide: [
      '25분 집중 + 5분 암흑 휴식(눈 감고 Physiological Sigh 호흡) 뽀모도로 루틴 적용',
      '오후 2시 인지 저하 시간대 수학 킬러 대신 가벼운 오답 복습 및 개념 인출(Feynman 기법)',
      '취침 1시간 전 스마트폰 블루라이트 차단 및 마그네슘 섭취로 서파수면 촉진'
    ],
    syncStatus: 'synced'
  };

  const record2: HistoryRecord = {
    ...record1,
    date: '2026-09-08',
    score: 74,
    scoreLevel: '경고',
    analysisText: 'limsd7 님의 1차 기초 진단: 고강도 수험 스트레스로 인한 뇌피로 및 집중력 저하가 심화된 상태였습니다.',
    hrv: {
      ...record1.hrv,
      fatigue: 82,
      vitality: 34,
      stressIndex: 76,
      brainScore: 64
    }
  };

  return [record1, record2];
};

export const getPractice001Records = (): HistoryRecord[] => {
  const studentInfo: StudentInfo = {
    id: 'ID-20260820-6RKR',
    name: '연습001',
    email: 'practice001@nbass.co.kr',
    birthDate: '2008-03-20',
    testDate: '2026-09-20',
    age: 18,
    gender: 'Male',
    grade: '고등 3학년',
    height: 174,
    weight: 64,
    activityLevel: 2,
    mbti: 'ISTJ',
    bmi: 21.1,
    school: '대치 미래탐구',
    membershipTier: 'premium',
    selectedSubjects: ['korean', 'math', 'english'],
    focusSubjects: ['math'],
    weakSubject: 'math'
  };

  const record1: HistoryRecord = {
    student: studentInfo,
    careType: CareType.BURNOUT,
    dominantCareType: CareType.BURNOUT,
    score: 82,
    scoreLevel: '주의',
    date: '2026-09-20',
    analysisText: '연습001 학생의 검사 결과: 과도한 학습 긴장으로 인한 번아웃(Burnout) 및 피로 누적 상태입니다. 정기결제 전 기능 분석 솔루션이 가동 중입니다.',
    sleepAnalysisText: '수면 부족 및 수면 리듬 불규칙성 개선이 시급합니다.',
    hrv: {
      sns: 72,
      pns: 28,
      ansAge: 25,
      fatigue: 78,
      vitality: 36,
      physicalStress: 74,
      vlf: 500,
      lf: 450,
      hf: 190,
      tp: 1140,
      hrvIndex: 11.5,
      meanHr: 82,
      meanBpm: 82,
      stressIndex: 75,
      ppgLevel: 2,
      brainScore: 68,
      dominantEEG: ['High-Beta'],
      eegGamma: 15,
      eegHBeta: 36,
      eegMBeta: 20,
      eegLBeta: 15,
      eegAlpha: 10,
      eegTheta: 4,
      brainBalanceL: 47,
      brainBalanceR: 53,
      brainStressCategory: '스트레스 과부하',
      concentrationLevel: 65,
      concentrationCategory: '집중 피로',
      attentionLevel: 68,
      attentionCategory: '산만 주의'
    },
    survey: {
      bai: 18,
      isi: 14,
      chronicFatigue: true,
      fatigueSymptomsCount: 5,
      symptoms: ['집중력 저하', '피로감', '불안감', '어깨 결림'],
      sympatheticSymptoms: ['긴장감', '가슴 두근거림'],
      parasympatheticSymptoms: ['무기력'],
      concentrationScore: 13
    },
    protocol: {
      location: '학원 자습실',
      noiseLevel: 2,
      stressLevel: 4,
      avgSleep: 5.8,
      sleepHours: 5.8,
      emotionalFactor: 4,
      motivationalFactor: 3,
      behavioralFactor: 3,
      taskDifficulty: 4,
      timeDistortion: 3
    },
    analytics: {
      isTested: true,
      pureStudyRatio: 68,
      avgFocusDuration: 35,
      distractionCount: 9,
      goldenTimeStart: "10:00",
      goldenTimeEnd: "12:00",
      lowEfficiencyTime: "15:00~17:00",
      chronotype: 'evening',
      weekdayWeekendGap: 2.0,
      subjectRatios: {
        korean: 25,
        math: 50,
        english: 25,
        science: 0,
        social: 0,
        other: 0
      },
      goalAchievementRate: 70,
      perceivedDifficulty: 4,
      avgSleepHours: 5.8,
      sleepQuality: 2,
      preferredLocation: '독서실',
      studyStreak: 12,
      breakAdequacy: 2,
      burnoutCycle: 3,
      energyPattern: 'fluctuating'
    },
    nutrition: ['글리시네이트 마그네슘', 'L-테아닌', '홍경천 추출물', '오메가3'],
    careGuide: [
      '시험 2주 전 수면 리듬 7시간 확보',
      '자율신경 이완 4-7-8 호흡법 매일 취침 전 5회',
      '수학 킬러 풀이 중간 5분간 녹색 시야 휴식'
    ],
    syncStatus: 'synced'
  };

  const record2: HistoryRecord = {
    ...record1,
    date: '2026-09-01',
    score: 85,
    scoreLevel: '주의',
    analysisText: '연습001 학생의 1차 진단 결과: 교감신경 항진 및 수험 스트레스 주의 단계'
  };

  return [record1, record2];
};

export const getTestExpert01Records = (): HistoryRecord[] => {
  const studentInfo: StudentInfo = {
    id: 'TEST_EXPERT_01',
    name: '오류검증_전문가01',
    email: 'expert01@nbass.co.kr',
    birthDate: '2007-11-10',
    testDate: '2026-09-24',
    age: 19,
    gender: 'Male',
    grade: '고3 (N수)',
    height: 178,
    weight: 70,
    activityLevel: 3,
    mbti: 'ENTJ',
    bmi: 22.1,
    school: 'NBASS 시스템 검증 연구팀',
    membershipTier: 'expert',
    selectedSubjects: ['korean', 'math', 'english', 'inquiry'],
    focusSubjects: ['math'],
    weakSubject: 'math'
  };

  const record1: HistoryRecord = {
    student: studentInfo,
    careType: CareType.HEALTHY,
    dominantCareType: CareType.HEALTHY,
    score: 92,
    scoreLevel: '양호',
    date: '2026-09-24',
    analysisText: '오류검증_전문가01: 전 기능 및 의료 분석/처방전 검증용 최고 등급 EXPERT 계정입니다.',
    sleepAnalysisText: '수면 및 바이오리듬 최적화 상태 유지 중입니다.',
    hrv: {
      sns: 52,
      pns: 48,
      ansAge: 20,
      fatigue: 35,
      vitality: 78,
      physicalStress: 40,
      vlf: 650,
      lf: 520,
      hf: 480,
      tp: 1650,
      hrvIndex: 18.2,
      meanHr: 72,
      meanBpm: 72,
      stressIndex: 38,
      ppgLevel: 1,
      brainScore: 88,
      dominantEEG: ['Mid-Beta', 'Alpha'],
      eegGamma: 12,
      eegHBeta: 18,
      eegMBeta: 32,
      eegLBeta: 20,
      eegAlpha: 14,
      eegTheta: 4,
      brainBalanceL: 50,
      brainBalanceR: 50,
      brainStressCategory: '정상 균형',
      concentrationLevel: 85,
      concentrationCategory: '고도 몰입',
      attentionLevel: 88,
      attentionCategory: '주의력 우수'
    },
    survey: {
      bai: 6,
      isi: 5,
      chronicFatigue: false,
      fatigueSymptomsCount: 1,
      symptoms: ['가벼운 눈 피로'],
      sympatheticSymptoms: [],
      parasympatheticSymptoms: [],
      concentrationScore: 22
    },
    protocol: {
      location: '연구실/자습실',
      noiseLevel: 1,
      stressLevel: 2,
      avgSleep: 7.2,
      sleepHours: 7.2,
      emotionalFactor: 2,
      motivationalFactor: 5,
      behavioralFactor: 4,
      taskDifficulty: 5,
      timeDistortion: 2
    },
    analytics: {
      isTested: true,
      pureStudyRatio: 88,
      avgFocusDuration: 55,
      distractionCount: 3,
      goldenTimeStart: "09:00",
      goldenTimeEnd: "12:00",
      lowEfficiencyTime: "13:30~14:30",
      chronotype: 'morning',
      weekdayWeekendGap: 0.8,
      subjectRatios: {
        korean: 25,
        math: 35,
        english: 20,
        science: 20,
        social: 0,
        other: 0
      },
      goalAchievementRate: 94,
      perceivedDifficulty: 3,
      avgSleepHours: 7.2,
      sleepQuality: 4,
      preferredLocation: '연구실',
      studyStreak: 45,
      breakAdequacy: 4,
      burnoutCycle: 1,
      energyPattern: 'stable'
    },
    nutrition: ['포스파티딜세린', '오메가3 EPA/DHA', '코엔자임Q10'],
    careGuide: [
      '시스템 전체 24P 처방전 파이프라인 검증용',
      'EXPERT 전권 제어 및 데이터 검증'
    ],
    syncStatus: 'synced'
  };

  return [record1];
};

export const getAllDefaultSampleRecords = (): HistoryRecord[] => {
  return [
    ...getLimsd7Records(),
    ...getPractice001Records(),
    ...getTestExpert01Records()
  ];
};
