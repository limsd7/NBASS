export type MembershipTier = 'free' | 'pro' | 'premium' | 'premium_plus' | 'vip' | 'expert';

export interface UserProfile {
  studentId: string;
  name: string;
  school?: string;
  grade?: string;
  tier: MembershipTier;
  examDate?: string;
  careType?: string;
  primaryCareType?: string;
  careTypeName?: string;
}

export interface CareScore {
  type: string;
  name: string;
  score: number;
  description: string;
}

export interface MobileAssessmentResult {
  student: {
    id: string;
    name: string;
    school: string;
    grade: string;
    age: number;
    gender: string;
  };
  examDate: string;
  careType: string;
  careTypeName: string;
  careTypeBadgeColor: string;
  careTypeSummary: string;
  metrics: {
    brainVitality: number;     // 두뇌 활력도 (0~100)
    stressResistance: number;  // 스트레스 저항도 (0~100)
    focusCapacity: number;     // 집중 유지력 (0~100)
    sleepEfficiency: number;   // 수면 회복력 (0~100)
    coherence: number;         // 뇌-신체 조화도 (0~100)
  };
  keyAdvice: {
    study: string;
    circadian: string;
    stress: string;
  };
  topCareScores: CareScore[];
}

export interface NutritionProduct {
  id: string;
  name: string;
  subName: string;
  category: string;
  tier: 'ESSENTIAL' | 'RECOMMENDED' | 'SUPPORTIVE' | 'SPECIAL';
  mainIngredients: string[];
  dosageMethod: string;
  timing: string;
  caution?: string;
  image?: string;
  url?: string;
  isHlCoffee?: boolean;
}

// 📅 1. 스케줄 항목 모델
export interface ScheduleItem {
  id: string;
  studentId: string;
  startTime: string; // '09:00'
  endTime: string;   // '11:00'
  subject: string;   // '수학', '국어', '영어', '탐구', '휴식'
  activity: string;  // '수능 기출 고난도 문항 풀이'
  color: string;     // Tailwind color class
  isCompleted?: boolean;
}

// 📊 2. 성적 기록 모델
export interface SubjectScore {
  subject: string;
  score: number;       // 원점수 (0~100)
  grade: number;       // 등급 (1~9)
  percentile?: number; // 백분위 (0~100)
}

export interface MobileGradeRecord {
  id: string;
  studentId: string;
  examName: string;   // '2026학년도 9월 모의평가'
  examDate: string;   // '2026-09-03'
  examType: 'MOCK' | 'INTERNAL' | 'CSAT';
  scores: SubjectScore[];
  memo?: string;
  createdAt: string;
}

// 📷 3. 오답노트 모델
export interface WrongNoteItem {
  id: string;
  studentId: string;
  subject: string;
  unitName: string;
  questionNumber: string;
  imageUrl?: string;        // 카메라 촬영 / 업로드 사진 (Base64 or Cloud URL)
  errorReason: string;      // '계산 실수', '개념 미숙', '문제 조건 오독', '시간 부족', '인지 피로'
  memo: string;
  aiPrescription?: string;  // AI가 분석한 학습 처방
  isResolved: boolean;
  createdAt: string;
}

// 🌙 4. 수면 기록 모델
export interface SleepLogItem {
  id: string;
  studentId: string;
  date: string;          // '2026-09-06'
  bedTime: string;       // '01:30'
  wakeTime: string;      // '07:00'
  totalHours: number;    // 5.5
  sleepDebtHours: number;// 2.0 (권장 7.5시간 기준)
  quality: 'GOOD' | 'NORMAL' | 'POOR';
  memo?: string;
}

// 🧠 5. 나쁜 공부 습관 진단 및 행동 교정 모델
export interface BadHabitItem {
  id: string;
  title: string;
  description: string;
  category: string;
  wastedMinutesPerDay: number; // 하루 낭비되는 시간 (분)
  brainCause?: string;
  impact?: string;
  expectedScoreBoost?: string;
  prescription?: string;
}

export interface HabitDiagnosisResult {
  studentId: string;
  checkedHabitIds: string[];
  totalWastedMinutes: number;   // 하루 총 낭비 시간
  primaryCareType: string;
  shockReport: {
    wastedTimeSummary: string;  // "하루 48분의 가짜 공부 발생"
    brainScienceCause: string;  // 뇌과학적 원인
    riskAssessment: string;     // 수능/내신 위험도
  };
  correctionGuide: {
    habitName: string;
    step1Rule: string;          // 1단계 봉인 룰
    step2Action: string;        // 2단계 대체 행동 (커피냅, 3분 패스 등)
    step3Reward: string;        // 3단계 뇌 보상
  }[];
  updatedAt: string;
}

export interface HabitCorrectionLog {
  id: string;
  studentId: string;
  date: string;
  targetHabitId: string;
  isSuccess: boolean;
  pomodoroSessionsCompleted: number;
}


