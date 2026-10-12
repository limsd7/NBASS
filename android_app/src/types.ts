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
  targetUniversity?: string;
  targetMajor?: string;
}

export enum CareType {
  BURNOUT = 'Hyper-Tension Burnout',
  ANXIETY_TENSION = 'Anxiety-Tension',
  STRESS_OVERLOAD = 'Stress Overload',
  LOW_ENERGY = 'Low-Energy Fatigue',
  DEPRESSION_AMOTIVATION = 'Depression-Amotivation',
  ADRENAL = 'Adrenal Fatigue',
  BRAIN_FATIGUE = 'Brain Fatigue',
  HYPERSENSITIVE = 'Hypersensitive Learning',
  ATTENTION_DEFICIT = 'Attention Deficit',
  SLEEP = 'Sleep Dysfunction',
  CIRCULATION = 'Poor Circulation',
  HEALTHY = 'Healthy Balance',
}

export interface CareScore {
  type: string;
  name: string;
  score: number;
  description: string;
}

export interface Prescriptions {
  nutrition: string[];
  study: string[];
  sleep: string[];
  mental: string[];
}

export interface MobileAssessmentResult {
  id?: string;
  student: {
    id: string;
    name: string;
    school: string;
    grade: string;
    age: number;
    gender: string;
    targetUniversity?: string;
    targetMajor?: string;
    birthDate?: string;
    weakSubject?: string;
    focusSubjects?: string[];
    region?: string;
    height?: number;
    weight?: number;
    bmi?: number;
    activityLevel?: number;
    testDate?: string;
    subjectPriorities?: {
      importanceRank?: Record<string, number>;
      gradeRank?: Record<string, number>;
      currentFocusRank?: Record<string, number>;
    };
  };
  examDate: string;
  careType: string;
  careTypeName: string;
  secondaryCareType?: string;
  secondaryCareTypeName?: string;
  secondaryConfidence?: 'CONFIRMED' | 'PROVISIONAL';
  /** PC logicEngine 분류 코어 결과 (이식판정 근거) */
  classificationResult?: {
    primary: string;
    primaryScore: number;
    secondary: string[];
    secondaryScores: { type: string; score: number }[];
    secondaryDetails: { type: string; score: number; confidence: string; confidenceLabelKr: string }[];
    allScores: { type: string; score: number }[];
  };
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
  prescriptions?: Prescriptions;
  cognitiveProfile?: {
    workingMemorySpan: number;
    goNoGoAccuracy: number;
    reactionTimeMs: number;
    chronotype: 'morning' | 'evening' | 'intermediate';
    varkStyle: string;
    nbackAccuracy?: number;
    nbackLevel?: number;
    learningTraits?: {
      grit: number;
      resilience: number;
      temperament: number;
      metacognition: number;
      motivation: number;
    };
    metacognitionScore?: number;
    metacognitionResult?: {
      rehearsalScore: number;
      elaborationScore: number;
      organizationScore: number;
      metacognitiveScore: number;
      dominantStrategy: string;
      learnerLevel: string;
    };
    meqScore?: number;
    meqResult?: string;
    varkScores?: { V: number; A: number; R: number; K: number };
    varkPrimary?: string;
    taiCognitive?: number;
    taiSomatic?: number;
    taiSeverity?: string;
    digitalLevel?: string;
  };
  protocolData?: {
    location?: string;
    noiseLevel?: number;
    stressLevel?: number;
    sleepHours?: number;
    emotionalFactor?: number;
    motivationalFactor?: number;
    behavioralFactor?: number;
    taskDifficulty?: number;
    timeDistortion?: number;
  };
  analyticsData?: {
    pureStudyRatio?: number;
    avgFocusDuration?: number;
    distractionCount?: number;
    goldenTimeStart?: string;
    goldenTimeEnd?: string;
    lowEfficiencyTime?: string;
    weekdayWeekendGap?: number;
    subjectRatios?: { korean: number; math: number; english: number; science: number; social: number; other: number };
    goalAchievementRate?: number;
    perceivedDifficulty?: number;
    avgSleepHours?: number;
    sleepQuality?: number;
    preferredLocation?: string;
    studyStreak?: number;
    breakAdequacy?: number;
    burnoutCycle?: number;
    energyPattern?: string;
  };
  surveyScores?: {
    bai: number;
    isi: number;
    cfs: number;
    concentration: number;
    adrenal: number;
    snsCount?: number;
    pnsCount?: number;
    circulationSymptomsCount?: number;
    // PC 정식 키 별칭 (logicEngine·clinicalEngine·SecretPoint가 이 키를 읽음)
    concentrationScore?: number;
    adrenalFatigueScore?: number;
    sympatheticSymptomsCount?: number;
    parasympatheticSymptomsCount?: number;
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
  standardScore?: number; // 표준점수
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

export interface GradeGoalItem {
  id: string;
  studentId: string;
  subject: string;
  targetGrade: number;
  targetPercentile?: number;
  memo?: string;
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
  reviewStage?: number;     // 0: 신규, 1: 1일 후, 2: 3일 후, 3: 7일 후, 4: 마스터
  nextReviewDate?: string;  // YYYY-MM-DD
  lastReviewedAt?: string;
  reviewHistory?: { date: string; passed: boolean }[];
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

// ---- 죽은 데이터 (나중에 구현): HRV/EEG 센서 실측 + 휴대용 uBioMacpa ----
// 실측 하드웨어 연동 전까지 UI·판정 로직에서 사용하지 않습니다.
// 저장소(dataSyncService.get/setMobileBiosignals)만 마련되어 있고,
// Supabase assessments.hrv_data로 전송하는 코드는 연동 시점에 추가합니다.
/** 휴대용 HRV 실측값 (uBioMacpa 등, 미연동) */
export interface MobileHrvData {
  measuredAt: string; // ISO
  device: string; // 예: 'uBioMacpa'
  stressIndex?: number; // 0-100
  pulseVariability?: number;
  lf?: number;
  hf?: number;
  lfHfRatio?: number;
  meanBpm?: number;
  sdnn?: number;
  rmssd?: number;
  vascularHealthIndex?: number;
}
/** EEG 실측값 (미연동) */
export interface MobileEegData {
  measuredAt: string; // ISO
  device: string;
  brainScore?: number;
  dominantEeg?: string[];
  eegGamma?: number;
  eegHBeta?: number;
  eegMBeta?: number;
  eegLBeta?: number;
  eegAlpha?: number;
  eegTheta?: number;
  concentrationLevel?: number;
  attentionLevel?: number;
}
/** 센서 실측 묶음 (미연동) */
export interface MobileBiosignals {
  studentId: string;
  hrv?: MobileHrvData | null;
  eeg?: MobileEegData | null;
  updatedAt: string;
}

// ---- 죽은 데이터 (나중에 구현): 혈액검사 12종 + 의학 분석 ----
// 실측 연동 전까지 UI·판정 로직에서 사용하지 않습니다.
// 저장소(dataSyncService.get/setMobileBloodTest)만 마련되어 있고,
// Supabase 전송 컬럼은 연동 시점에 스키마 확장 후 추가합니다.
/** 혈액검사 12종 실측값 (미연동) */
export interface MobileBloodTestData {
  studentId: string;
  testDate?: string;
  wbc?: number; // ×10³/μL
  hemoglobin?: number; // g/dL
  hematocrit?: number; // %
  mcv?: number; // fL
  nkActivity?: number; // %
  vitaminD?: number; // ng/mL
  crp?: number; // mg/dL
  hba1c?: number; // %
  ast?: number; // U/L
  alt?: number; // U/L
  creatinine?: number; // mg/dL
  bun?: number; // mg/dL
  fastingHours?: number;
  updatedAt: string;
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

// 🎮 6. 게이미피케이션 & 액션 플래너 모델
export interface GamificationProgress {
  studentId: string;
  weekKey: string;
  exp: number;
  level: number;
  streak: number;
  completedTasks: string[];
  lastCompletedDate?: string;
  taskLog?: Record<string, { done: boolean; at: string }>;
}

// 📚 7. 오답노트 & 4대 에러 타입 모델 (PC 본체 앱 연동)
export type WrongNoteErrorType = 'CONCEPT' | 'MISTAKE_IMPULSE' | 'TIME_LIMIT' | 'KILLER_PROBLEM';

export interface WrongNote {
  id: string;
  studentId: string;
  subject: '수학' | '영어' | '국어' | '탐구' | string;
  title: string;
  questionText?: string;
  solutionText?: string;
  errorType: WrongNoteErrorType;
  errorReasonMemo?: string;
  spacedRepetitionStage: number; // 0: D+1, 1: D+3, 2: D+7, 3: D+14, 4: 마스터
  nextReviewDate: string;        // '2026-10-10'
  isResolved: boolean;
  repeatFailCount: number;
  createdAt: string;
}

// 🏛️ 8. 과목 클리닉 상태 모델
export interface SubjectClinicConfig {
  subject: 'korean' | 'math' | 'english';
  currentGrade: number;
  targetGrade: number;
  focusTheme: string;
}

