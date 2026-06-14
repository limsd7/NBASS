
// 자율신경균형도 유형 (uBioMacpa Portable Device)
export enum ANSBalanceType {
  OVERWORK_CHRONIC = 'overwork_chronic',     // 과로형 만성스트레스
  ACUTE = 'acute',                           // 급성스트레스
  DISEASE_CHRONIC = 'disease_chronic',       // 질병형 만성스트레스
  CHRONIC = 'chronic',                       // 만성스트레스
  NORMAL = 'normal'                          // 정상
}

// Portable HRV Data (uBioMacpa Device)
export interface PortableHRVData {
  // 스트레스 지수 (0-100)
  stressIndex: number;
  stressPercent: number;  // 백분율 (0-100%)

  // 맥박 변화도 (성인평균 30-40, ≤20 만성스트레스)
  pulseVariability: number;

  // 자율신경균형도 유형
  ansBalanceType: ANSBalanceType;

  // HRV 상세 데이터
  lf: number;              // Low Frequency
  hf: number;              // High Frequency
  lfHfRatio: number;       // LF/HF 비율
  meanBpm: number;         // 평균 심박수
  sdnn: number;            // SDNN (전체 HRV 변동성)
  rmssd: number;           // RMSSD (부교감신경 활성도)

  // 혈관 건강 지수 (-30 ~ +30 범위, uBioMacpa 기준)
  // -30 ~ +5: 안전 / +6 ~ +20: 경계 / +20 이상: 위험
  vascularHealthIndex: number;
}

// 스트레스 지수 등급
export type StressLevel = 'minimal' | 'temporary' | 'early' | 'weakening' | 'chronic';

// 스트레스 지수 → 등급 매핑 헬퍼
export const getStressLevel = (stressIndex: number): StressLevel => {
  if (stressIndex <= 25) return 'minimal';
  if (stressIndex <= 34) return 'temporary';
  if (stressIndex <= 44) return 'early';
  if (stressIndex <= 59) return 'weakening';
  return 'chronic';
};

// 스트레스 등급 → 한글 설명 매핑
export const STRESS_LEVEL_DESCRIPTIONS: Record<StressLevel, { label: string; description: string; color: string }> = {
  minimal: { label: '정상', description: '스트레스가 거의 없는 상태', color: 'emerald' },
  temporary: { label: '일시적', description: '일시적인 스트레스 상태', color: 'green' },
  early: { label: '초기', description: '초기 스트레스 상태', color: 'yellow' },
  weakening: { label: '내성약화', description: '스트레스 내성이 약해지기 시작하는 시기', color: 'orange' },
  chronic: { label: '만성진행', description: '만성 스트레스로 진행, 전문의 상담 필요', color: 'red' }
};

// ANS Balance Type → 한글 설명 매핑
export const ANS_BALANCE_DESCRIPTIONS: Record<ANSBalanceType, { label: string; description: string; suggestedCareType: string }> = {
  [ANSBalanceType.OVERWORK_CHRONIC]: {
    label: '과로형 만성스트레스',
    description: '교감신경 과활성 + 부교감 저하',
    suggestedCareType: 'BURNOUT'
  },
  [ANSBalanceType.ACUTE]: {
    label: '급성스트레스',
    description: '일시적 교감신경 과활성',
    suggestedCareType: 'ADRENAL'
  },
  [ANSBalanceType.DISEASE_CHRONIC]: {
    label: '질병형 만성스트레스',
    description: '자율신경 전체 기능 저하, 전문의 상담 권장',
    suggestedCareType: 'CIRCULATION'
  },
  [ANSBalanceType.CHRONIC]: {
    label: '만성스트레스',
    description: '지속적 교감신경 우세',
    suggestedCareType: 'BURNOUT'
  },
  [ANSBalanceType.NORMAL]: {
    label: '정상',
    description: '자율신경 균형 양호',
    suggestedCareType: 'HEALTHY'
  }
};

// 세분화된 12가지 진단 분류 체계
export enum CareType {
  // ANS 축 - SNS 과활성
  BURNOUT = 'Hyper-Tension Burnout',        // 과긴장 번아웃
  ANXIETY_TENSION = 'Anxiety-Tension',      // 불안-긴장형
  STRESS_OVERLOAD = 'Stress Overload',      // 스트레스 과부하

  // ANS 축 - PNS 과활성
  LOW_ENERGY = 'Low-Energy Fatigue',        // 무기력형
  DEPRESSION_AMOTIVATION = 'Depression-Amotivation', // 우울-무동기형
  ADRENAL = 'Adrenal Fatigue',              // 부신피로 증후군

  // 뇌파/인지 축
  BRAIN_FATIGUE = 'Brain Fatigue',          // 뇌피로 집중곤란
  HYPERSENSITIVE = 'Hypersensitive Learning', // 과민성 학습장애
  ATTENTION_DEFICIT = 'Attention Deficit',   // 주의력 산만형

  // 신체/대사 축
  SLEEP = 'Sleep Dysfunction',              // 수면 장애형
  CIRCULATION = 'Poor Circulation',         // 혈액순환 저하형

  // 건강 상태
  HEALTHY = 'Healthy Balance',              // 건강 균형형

  // 레거시 호환 (기존 CONCENTRATION)
  CONCENTRATION = 'Concentration Deficiency', // 집중력 저하형 (레거시)

  // 데이터 미입력 상태
  UNASSESSED = 'Unassessed'
}

// 분류 결과 (주분류 + 부분류)
export interface ClassificationResult {
  primary: CareType;                          // 주분류
  primaryScore: number;                       // 주분류 점수 (0-100)
  secondary: CareType[];                      // 부분류 (최대 2개)
  secondaryScores: { type: CareType; score: number }[]; // 부분류 점수들
  allScores: { type: CareType; score: number }[]; // 전체 점수 (정렬됨)
  reasoning?: string;                         // 분류 결과에 대한 설명/근거 추가
}

export interface StudentInfo {
  id: string;
  name: string;
  birthDate: string;
  testDate: string;
  age: number;
  weakSubject?: 'korean' | 'math' | 'english';
  focusSubjects?: string[];     // 가장 부담되는 과목(들) - subjectId 배열
  selectedSubjects?: string[];  // 수능 응시 예정 과목 전체 - subjectId 배열
  gender: 'Male' | 'Female' | 'Other';
  grade: string;
  // Added fields
  height?: number;
  weight?: number;
  bmi?: number;
  activityLevel?: number; // 1: Low, 2: Moderate, 3: Active, 4: Very Active
  mbti?: string;
  membershipTier?: 'standard' | 'premium';
  
  // Gamification (Feature 3)
  gamification?: {
    exp: number;
    level: number;
    streak: number;
    lastCompletedDate?: string;
    completedTasks: string[];
  };
}

export interface HRVData {
  sns: number; // Sympathetic
  pns: number; // Parasympathetic
  ansAge: number;
  fatigue: number; // 누적 피로
  vitality: number; // 신체 활력도
  physicalStress: number; // 신체 스트레스 (Added)
  vlf: number; // Very Low Frequency
  lf: number; // Low Frequency (Added)
  hf: number; // High Frequency (Added)
  tp: number;  // Total Power
  hrvIndex: number;
  meanHr: number; // 평균 심박수 (Added)
  ppgLevel: number; // 1-7

  // EEG(Brain) Fields Added for Step 5
  brainScore: number;
  dominantEEG: string[]; // 'Gamma' | 'H-Beta' | 'M-Beta' | 'L-Beta' | 'Alpha' | 'Theta'
  eegGamma: number;
  eegHBeta: number;
  eegMBeta: number;
  eegLBeta: number;
  eegAlpha: number;
  eegTheta: number;
  brainBalanceL: number;
  brainBalanceR: number;
  brainStressCategory: string; // '낮음' | '보통' | '중간' | '높음'
  concentrationLevel: number;
  concentrationCategory: string; // '낮음' | '중간' | '높음'
  attentionLevel: number;
  attentionCategory: string; // '낮음' | '중간' | '높음'
  vascularHealthIndex?: number; // 혈관 건강 지수 추가

  goldenTimeStart?: string; // [NEW] Added for Medical Report
  goldenTimeEnd?: string;   // [NEW] Added for Medical Report

  // Portable Device (uBioMacpa) Data - Optional
  portableHrv?: PortableHRVData;
}

export interface ProtocolData {
  location: string;
  noiseLevel: number;
  stressLevel: number;
  avgSleep: number;
  emotionalFactor: number;
  motivationalFactor: number;
  behavioralFactor: number;
  taskDifficulty: number;
  timeDistortion: number;
}

// 학습 분석 데이터 (Learning Analytics)
export interface LearningAnalyticsData {
  // 1. 집중도 분석 (Focus Quality)
  pureStudyRatio: number;       // 순공 시간 비율 (0-100%)
  avgFocusDuration: number;     // 평균 집중 유지 시간 (분)
  distractionCount: number;     // 산만도 (스마트폰 확인 횟수/시간)

  // 2. 시간대별 효율 (Chronotype Analysis)
  goldenTimeStart: string;      // 골든타임 시작 (예: "09:00")
  goldenTimeEnd: string;        // 골든타임 종료 (예: "12:00")
  lowEfficiencyTime: string;    // 최저효율 시간대 (예: "14:00-16:00")
  chronotype: 'morning' | 'evening' | 'neutral'; // 아침형/저녁형
  weekdayWeekendGap: number;    // 주중-주말 학습량 편차 (%)

  // 3. 과목별 균형 (Subject Balance)
  subjectRatios: {
    korean: number;   // 국어 비중 (%)
    math: number;     // 수학 비중 (%)
    english: number;  // 영어 비중 (%)
    science: number;  // 과학탐구 비중 (%)
    social: number;   // 사회탐구 비중 (%)
    other: number;    // 기타 비중 (%)
  };
  goalAchievementRate: number;  // 목표 달성률 (%)
  perceivedDifficulty: number;  // 체감 난이도 (1-5)

  // 4. 환경 및 컨디션 (Contextual Analysis)
  avgSleepHours: number;        // 평균 수면 시간
  sleepQuality: number;         // 수면 품질 (1-5)
  preferredLocation: string;    // 선호 학습 장소
  studyStreak: number;          // 연속 학습 일수

  // 5. 피로도 및 휴식 (Recovery Analysis)
  breakAdequacy: number;        // 휴식 적절성 (1-5: 부족-과다)
  burnoutCycle: number;         // 번아웃 주기 (일)
  energyPattern: 'stable' | 'fluctuating' | 'declining'; // 에너지 패턴
}

export interface SurveyData {
  gad7: number;
  bai: number;
  isi: number;
  chronicFatigue: boolean;
  fatigueSymptomsCount: number;
  symptoms: string[];
  sympatheticSymptoms: string[];
  parasympatheticSymptoms: string[];
  concentrationScore: number;
  adrenalFatigueScore?: number;
  // 공부 효율성 정밀 검사 (Study Efficiency Assessments)
  chronotypeScore?: number;         // 크로노타입 점수 (MEQ)
  chronotypeResult?: string;        // 'morning' | 'moderate_morning' | 'neutral' | 'moderate_evening' | 'evening'
  varkPrimary?: string;             // 'V' | 'A' | 'R' | 'K' | 'multi'
  varkScores?: { V: number; A: number; R: number; K: number };
  testAnxietyCognitive?: number;    // 시험불안 - 인지적 걱정 점수
  testAnxietySomatic?: number;      // 시험불안 - 신체적 긴장 점수
  testAnxietyType?: 'cognitive' | 'somatic' | 'balanced';
  digitalAddictionScore?: number;   // 디지털 중독 총점
  digitalAddictionLevel?: string;   // 'healthy' | 'caution' | 'risk' | 'addiction'
  metacognitionLevel?: string;      // 'beginner' | 'developing' | 'proficient' | 'expert'
  metacognitionScores?: { rehearsal: number; elaboration: number; organization: number; metacognitive: number };
}

import { AnalystConfig } from './utils/analystConfig'; // Assuming this path is correct based on the instruction's context

export type CoherenceLevel = 'HIGH' | 'MODERATE' | 'LOW' | 'CONFLICT';
export type EEGPatternType = 'HIGH_BETA_PATTERN' | 'HIGH_THETA_PATTERN' | 'BALANCED_ALPHA' | 'MIXED_PATTERN' | 'UNKNOWN';

export interface BrainBodyState {
  ansBalance: 'SNS_DOMINANT' | 'PNS_DOMINANT' | 'BALANCED';
  snsLevel: number;
  pnsLevel: number;
  
  brainState: 'ALERT' | 'FOCUSED' | 'CALM' | 'FATIGUED' | 'ANXIOUS';
  dominantFrequency: string; // Primary (e.g., Gamma, Beta, Alpha, Theta)
  secondaryFrequency?: string; // Secondary (Optional)
  
  eegBalance: {
    gamma: number;
    betaH: number;
    betaM: number;
    betaL: number;
    alpha: number;
    theta: number;
  };
  
  coherence: number; // 0-100
  coherenceLevel: CoherenceLevel;
  pattern: EEGPatternType;
  confidence: number; // 0-1 (e.g. 0.95)
}

export interface QuickAction {
  id: string;
  icon: string;
  title: string;
  description: string;
  duration: number; // minutes
  implementation: string;
  results?: {
    expectedCoherenceImprovement: number; // %
    timeToEffect: string;
  };
}

export interface PersonalizedRecommendation {
  layer1_survey: string[];      // 자기보고 기반
  layer2_hrv: string[];         // HRV 기반
  layer3_eeg?: string[];        // EEG 기반
  consensus: string[];          // 3개 모두 일치
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  details: {
    nutrition: string[];
    supplement: string[];
    exercise: string;
    timing: string;
    avoidance: string[];
  };
}

export interface AssessmentResult {
  student: StudentInfo;
  careType: CareType;
  hrv: HRVData;
  survey: SurveyData;
  protocol: ProtocolData;
  analytics: LearningAnalyticsData;
  nutrition: string[];
  careGuide: string[];
  analysisText: string;
  score: number;
  scoreLevel: string;
  // 점수 기반 분류 결과 (주분류 + 부분류)
  classificationResult?: ClassificationResult;
  // [NEW] 3-layer cross-verification result
  brainBodyState?: BrainBodyState;
  // Medical Expert Mode Fields
  bloodTest?: BloodTestData;
  medicalAnalysis?: MedicalAnalysis;
  medicalNotes?: string;
  prediction?: PredictionResult;
  cognitiveResults?: any; // Avoiding circular dependency with component
  studyEfficiencyResults?: any;
  workingMemoryResults?: any;
  analystConfig?: AnalystConfig;
  completedExpertGuideItems?: string[];
  selectedStrategies?: StrategyMap;
  selectedSubjectOptions?: Record<string, string[]>;
  previousResult?: AssessmentResult | null;
  gradeHistory?: GradeRecord[];  // 성적 이력 참조
  sleepAnalysisText?: string;    // [NEW] 수면 분석 자동 생성 및 편집 필드
}

// ========== 예측 엔진 타입 (Prediction Engine) ==========

export interface TrendAnalysis {
  field: string;
  fieldLabel: string;
  currentValue: number;
  previousValue: number;
  delta: number;
  deltaPercent: number;
  direction: 'up' | 'down' | 'stable';
  interpretation: string;
}

export interface RiskPrediction {
  ruleId: string;
  ruleName: string;
  ruleNameKr: string;
  riskType: CareType;
  probability: number;
  timeframe: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  consultScript: string;
  matchedConditions: string[];
  isTrendBased: boolean;
}

export interface PredictionResult {
  studentId: string;
  studentName: string;
  generatedAt: string;

  // 위험 예측 목록 (우선순위 정렬)
  risks: RiskPrediction[];

  // 추세 분석 결과
  trends: TrendAnalysis[];

  // 종합 가이드
  overallGuide: string;
  overallSeverity: 'healthy' | 'caution' | 'warning' | 'critical';

  // 데이터 정보
  dataPointsUsed: number;
  hasTrendData: boolean;
}

// Blood Test Data Interface (Medical Expert Mode)
export interface BloodTestData {
  // CBC (Complete Blood Count)
  wbc: number;               // WBC (×10³/μL) - 정상: 4.0-10.0, ↑감염/염증/스트레스, ↓면역저하
  hemoglobin: number;        // Hg (g/dL) - 정상: 남 13-17, 여 12-16, ↓빈혈/피로/집중력저하
  hematocrit: number;        // Hct (%) - 정상: 남 40-54, 여 36-48, ↑탈수, ↓빈혈
  mcv: number;               // MCV (fL) - 정상: 80-100, ≥100 → B12/엽산결핍 → 만성피로
  nkActivity: number;        // NK 활성도 (%) - 정상: 15-40, ↓만성피로/면역저하

  // 대사 지표
  vitaminD: number;          // ng/mL - 정상: 30-100, <20결핍, 20-30부족 → 우울/피로/면역저하
  crp: number;               // CRP (mg/dL) - 정상: <0.5, ↑감염/염증/만성스트레스
  hba1c: number;             // HbA1c (%) - 정상: <5.7, 5.7-6.4 전당뇨, ≥6.5 당뇨 → 인지기능저하

  // 간기능
  ast: number;               // AST (U/L) - 정상: 0-40, ↑간염/지방간/과로
  alt: number;               // ALT (U/L) - 정상: 0-40, ↑간손상

  // 신장기능
  creatinine: number;        // Cr (mg/dL) - 정상: 남 0.7-1.3, 여 0.5-1.1, ↑신기능저하
  bun: number;               // BUN (mg/dL) - 정상: 7-20, ↑신부전/탈수

  // 메타데이터
  testDate?: string;
  fastingHours?: number;     // 금식 시간 (권장: 8-12시간)
}

// Medical Analysis Result
export interface MedicalAnalysis {
  abnormalFindings: MedicalFinding[];
  careTypeCorrelation: string;
  recommendations: string[];
  followUpAdvice: string;
}

export interface MedicalFinding {
  item: string;
  value: number;
  normalRange: string;
  status: 'normal' | 'low' | 'high' | 'critical';
  interpretation: string;
}

export interface ExamStrategy {
  nutritionGuide: string;
  studyStrategy: string;
  exerciseGuide: string;
  preStudyRoutine: string;
  recoveryGuide: string; // 회복 및 휴식 가이드 (Added)
  lifestyleGuide: string; // 생활 습관 및 환경 통제 (스마트폰, 도파민 관리 등)
}

export interface Prescription {
  title: string;
  activity: string;
  duration: string;
  guide: string[];
  audioTag?: string;
}

export type StrategyMap = Partial<Record<CareType, ExamStrategy>>;

export interface AIModelConfig { geminiKey: string; sonnetKey: string; localModelUrl: string; localModelVram?: string; localModelName?: string; }

export interface Examiner {
  id: string;
  name: string;
  position?: string;
  gender?: string;
  birthDate?: string;
  role?: string;
  licenses?: string[];
}

// ===== 성적 관리 시스템 타입 =====
export interface GradeRecord {
  id: string;              // UUID
  studentId: string;
  examName: string;        // '1학기 중간고사', '수능 모의고사 6월' 등
  examType: ExamType;
  examDate: string;        // ISO date
  subjects: SubjectGrade[];
  memo?: string;           // 특이사항
  createdAt: string;
}

export type ExamType = 
  | 'midterm'          // 중간고사
  | 'final'            // 기말고사
  | 'mock_exam'        // 모의고사
  | 'suneung'          // 수능
  | 'practice'         // 자체 연습
  | 'other';

export interface SubjectGrade {
  subjectId: string;
  rawScore?: number;       // 원점수
  standardScore?: number;  // 표준점수
  percentile?: number;     // 백분위
  grade?: number;          // 등급 (1-9)
  subunits?: Record<string, { score: number; maxScore: number }>; // 단원별 점수 (Feature 1)
}

export interface GradeGoal {
  id: string;
  studentId: string;
  subjectId: string;
  tier1Target: number;    // 1차 목표 (등급)
  tier2Target: number;    // 2차 목표 (등급)
  tier3Target: number;    // 3차 목표 (등급 - 최종 도전 목표)
  currentGrade?: number;  // 현재 등급
  memo?: string;
}

// ===== 수면 시간 관리 프로그램 타입 =====
export interface SleepRecord {
  id: string;
  studentId: string;
  date: string;          // ISO date (YYYY-MM-DD)
  bedtime: string;       // HH:mm
  wakeTime: string;      // HH:mm
  sleepQuality: number;  // 1-5
  memo?: string;
  createdAt: string;
  // [NEW] Data Integration Fields
  stages?: {
    rem: number;       // percentage 0-100
    light: number;     // percentage 0-100
    deep: number;      // percentage 0-100
  };
  nightHrv?: number;   // average HRV during sleep
  screenTimeBeforeBed?: number; // minutes
  sleepDelay?: number; // minutes it took to fall asleep
}

export interface SleepGoal {
  id: string;
  studentId: string;
  targetBedtime: string; // HH:mm
  targetWakeTime: string; // HH:mm
  targetDuration: number; // hours
  memo?: string;
  // [NEW] Gamification Fields
  currentStreak?: number;
  longestStreak?: number;
  conditionScore?: number; // 0-100
  sleepDebtMinutes?: number; // Positive = debt, Negative = surplus
}

export interface SleepPrescription {
  recommendedBedtime: string; // e.g. "23:00"
  recommendedWakeTime: string; // e.g. "07:00"
  targetSleepDuration: number; // in hours, e.g. 8
  sleepStrategy: string;
  preSleepRoutine: string[];
  powerNap?: {
    recommended: boolean;
    timing?: string; // e.g. "14:00 - 14:20"
    duration?: number; // in minutes
  };
  chronotypeNotes: string;
}