export interface UserProfile {
  id: string;
  email: string;
  name: string;
  targetGroup: '수험생' | '대학생' | '직장인' | '기타';
  createdAt: string;
}

export interface AssessmentResult {
  id: string;
  date: string;
  // 실측 신체 & 환경 데이터
  bmi: number;
  bmiStatus: string;
  studyHours: number;
  sleepHours: number;
  cognitiveStyle: string;
  // 실측 인지 반응속도 데이터
  reactionTimeAvg: number;
  reactionTimeMin: number;
  reactionTimeMax: number;
  reactionStability: string;
  reactionTimes: number[];
  reactionGrade: string;
  // 실측 자가 문진 데이터
  fatigueLevel: string;
  caffeineIntake: string;
  anxietyLevel: string;
  // 간이 환산 지수 (0~100)
  focusScore: number;
  stressScore: number;
  sleepScore: number;
  // 1순위 즉시 실천 팁
  quickTips: string[];
  // 하위 호환성 (선택 필드)
  eegAlphaBetaRatio?: number;
  hrvRmssd?: number;
  recommendations?: {
    studyStrategy: string[];
    nutrition: string[];
    exercise: string[];
    sleepTip: string;
  };
}

export type ActiveTab = 'landing' | 'assessment' | 'dashboard' | 'pricing' | 'faq';
