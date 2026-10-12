
export type MembershipTier = 'free' | 'pro' | 'premium' | 'expert';

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

  // 신경인지 축
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

// 부분류 진단 신뢰도 상세 (실측 진단 vs 근접 추정 구분 라벨)
export interface SecondaryClassificationDetail {
  type: CareType;
  score: number;
  confidence: 'confirmed' | 'estimated'; // 70점 이상: 확정/유력 진단, 50~69점: 근접 추정
  confidenceLabelKr: '확정 진단' | '근접 추정';
}

// 분류 결과 (주분류 + 부분류)
export interface ClassificationResult {
  primary: CareType;                          // 주분류
  primaryScore: number;                       // 주분류 점수 (0-100)
  secondary: CareType[];                      // 부분류 (최대 2개)
  secondaryScores: { type: CareType; score: number }[]; // 부분류 점수들
  secondaryDetails?: SecondaryClassificationDetail[];   // 부분류 확정/근접추정 라벨링 정보
  allScores: { type: CareType; score: number }[]; // 전체 점수 (정렬됨)
  reasoning?: string;                         // 분류 결과에 대한 설명/근거 추가
}

export interface SubjectPriorityRanks {
  korean: number;        // 1, 2, 3, 4
  math: number;          // 1, 2, 3, 4
  english: number;       // 1, 2, 3, 4
  korean_history: number;// 1, 2, 3, 4
}

export interface SubjectPriorities {
  importanceRank?: SubjectPriorityRanks;    // 1) 내가 중요시 하는 과목별 1,2,3,4
  gradeRank?: SubjectPriorityRanks;         // 2) 내가 성적이 잘 나오는 과목별 1,2,3,4
  currentFocusRank?: SubjectPriorityRanks;  // 3) 내가 지금 현재 중요시(집중투자)하는 과목별 1,2,3,4
}

export interface LearningTraitsScores {
  gritPlan: number;         // 끈기 및 실행력 (0~100)
  mentalResilience: number; // 멘탈 회복탄력성 (0~100)
  temperament: number;      // 탐구도전 성향 (0~100)
  metaCognition: number;    // 메타인지 전략 (0~100)
  internalMotivation: number; // 내재적 학습동기 (0~100)
  overallAverage?: number;  // 전체 평균
  persistenceAndExecution?: number; // 끈기 및 실행력 (별칭)
  mentalAndResilience?: number; // 멘탈 회복탄력성 (별칭)
  curiosityAndChallenge?: number; // 탐구도전 성향 (별칭)
  metaCognitiveStrategy?: number; // 메타인지 전략 (별칭)
  intrinsicMotivation?: number; // 내재적 학습동기 (별칭)
}

export interface LearningTraitsData {
  scores: LearningTraitsScores;
  rawAnswers: number[]; // 15 questions (each 1-5)
  totalAverage: number; // 1.0 - 5.0
  archetypeId: string;
  archetypeName: string;
  archetypeTitle: string;
  archetypeBadge: string;
  archetypeDescription: string;
  coreStrength: string;
  cautionPoint: string;
  recommendedEnvironment: string;
}

export type SurveyTab = 'ans' | 'bai' | 'isi' | 'concentration' | 'cfs' | 'adrenal' | 'learning_traits';

export interface StudentInfo {
  id: string;
  name: string;
  birthDate: string;
  testDate: string;
  age: number;
  weakSubject?: 'korean' | 'math' | 'english';
  focusSubjects?: string[];     // 가장 부담되는 과목(들) - subjectId 배열
  selectedSubjects?: string[];  // 수능 응시 예정 과목 전체 - subjectId 배열
  subjectPriorities?: SubjectPriorities; // 국/영/수/한국사 3대 기준 우선순위 (1~4순위)
  gender: 'Male' | 'Female' | 'Other';
  grade: string;
  affiliatedAcademyId?: string; // 소속 학원 ID
  // User Registration Fields
  customId?: string;     // 학생이 직접 설정하는 로그인 ID (중복 검사 필수)
  email?: string;        // 이메일 (필수)
  phone?: string;        // 휴대전화번호 (본인 인증용, 필수)
  kakaoId?: string;      // 카카오톡 ID (선택: Premium 이상 필수/미입력시 전화번호 소통)
  region?: string;       // 지역 (시/도/구, 필수)
  school?: string;       // 학교명 (선택)

  // Added fields
  height?: number;
  weight?: number;
  bmi?: number;
  activityLevel?: number; // 1: Low, 2: Moderate, 3: Active, 4: Very Active
  mbti?: string; // Optional legacy fallback
  learningTraits?: LearningTraitsData; // 5대 과학적 학습 기질 및 전략 데이터
  membershipTier?: 'free' | 'pro' | 'premium' | 'expert';
  subscriptionExpiresAt?: string; // ISO date string for subscription expiry

  academyName?: string; // 소속 학원명 (학생지도전문가 매칭용)

  // Gamification (Feature 3)
  gamification?: {
    exp: number;
    level: number;
    streak: number;
    lastCompletedDate?: string;
    completedTasks: string[];
    // 기기 간 체크/해제 충돌 해결용 tombstone 로그 (taskId -> 마지막 액션)
    taskLog?: Record<string, { done: boolean; at: string }>;
  };
}

export interface ExpertAccount {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: 'MEDICAL_EXPERT' | 'ACADEMY_EXPERT';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  // 의료전문가 전용
  medicalLicenseNumber?: string;
  clinicName?: string;
  medicalSpecialty?: string;
  // 학생지도전문가 전용
  academyName?: string;
  academyRegion?: string;
  position?: string;
  createdAt: string;
  approvedAt?: string;
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
  meanBpm: number; // 평균 심박수 (BPM)
  stressIndex: number; // 스트레스 지수
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

  // Sensor testing status (HRV/EEG physical hardware measurement)
  isSensorMeasured?: boolean;
  isHrvTested?: boolean;
  isEegTested?: boolean;
}

export interface ProtocolData {
  location: string;
  noiseLevel: number;
  stressLevel: number;
  avgSleep: number;
  sleepHours: number; // 평균 수면 시간
  emotionalFactor: number;
  motivationalFactor: number;
  behavioralFactor: number;
  taskDifficulty: number;
  timeDistortion: number;
}

// 학습 분석 데이터 (Learning Analytics)
export interface LearningAnalyticsData {
  isTested?: boolean;           // 당일 검사 실제 시행 여부
  testDate?: string;            // 검사 시행 일자 (YYYY-MM-DD)
  // 1. 집중도 분석 (Focus Quality)
  pureStudyRatio: number;       // 순공 시간 비율 (0-100%)
  avgFocusDuration: number;     // 평균 집중 유지 시간 (분)
  distractionCount: number;     // 산만도 (스마트폰 확인 횟수/시간)
  dailyGoalAchievement?: number; // 일일 목표 달성률

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
  // GAD-7은 현재 설문 흐름에서 수집하지 않습니다. 미수집 시 undefined로 유지합니다(임의 상수 대입 금지).
  gad7?: number;
  bai: number;
  isi: number;
  chronicFatigue: boolean;
  fatigueSymptomsCount: number;
  symptoms: string[];
  sympatheticSymptoms: string[];
  sympatheticSymptomsCount?: number;
  parasympatheticSymptoms: string[];
  parasympatheticSymptomsCount?: number;
  circulationScore?: number;
  circulationSymptomsCount?: number;
  circulationSymptoms?: string[];
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
  learningTraits?: LearningTraitsData; // 5대 학습 기질 및 전략 진단 데이터
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

// 진단 규칙(logicConfig) 버전 각인 스냅샷 (P0-2)
export interface LogicConfigSnapshot {
  version: string;
  lastModified: string;
  capturedAt: string;
  rulesHash: string;
  classificationRuleCount: number;
}

// 진단 데이터 신뢰도 (P0-3): 실측/추정 구분
export type DataConfidenceStatus = 'measured' | 'estimated';
export interface DataConfidenceDomain {
  key: string;
  label: string;
  status: DataConfidenceStatus;
  note: string;
}
export interface AssessmentConfidence {
  overall: DataConfidenceStatus | 'mixed';
  measuredCount: number;
  estimatedCount: number;
  domains: DataConfidenceDomain[];
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
  date: string; // 검사 일자
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
  dominantCareType?: CareType;   // 주 CareType
  // [P0-2] 결과 저장 시점의 진단 규칙 버전 각인 (규칙 변경 시 재현성 보장용)
  logicConfigSnapshot?: LogicConfigSnapshot;
  // [P0-3] 실측/추정 데이터 신뢰도 요약
  dataConfidence?: AssessmentConfidence;
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

export interface AIModelConfig {
  geminiKey?: string;
  sonnetKey?: string;
  openRouterKey?: string;
  openRouterModel?: string;
  localModelUrl?: string;
  localModelVram?: string;
  localModelName?: string;
}

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
  weakUnits?: string[];    // 취약 단원 TOP 1, 2, 3 목록 (예: ['수열', '미분', '적분'])
}

// ===== 신경인지 연계 6단계 문항 사다리 (Neuro-Ladder) 타입 =====
export type LadderStageLevel = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export interface LadderQuestion {
  id: string;
  stage: LadderStageLevel;
  questionNumber: number; // 1 ~ 5
  title: string;
  question: string;
  options?: string[];     // 객관식 보기 (1~5번)
  answer: string | number;// 정답 (예: "3" 또는 "42")
  solution: string;       // 상세 해설 및 도출 과정
  hint: string;           // 핵심 힌트
  conceptKey: string;     // 연계 핵심 개념 공식
  difficulty: '기본' | '응용' | '심화' | '기출' | '준킬러' | '수능킬러';
}

export interface LadderStageInfo {
  level: LadderStageLevel;
  title: string;
  subtitle: string;
  badgeName: string;
  icon: string;
  color: string;
  targetFocus: string;
}

export interface NeuroBrainPriming {
  careType: string;
  careTypeName: string;
  prepTitle: string;
  description: string;
  breathingTechnique?: string;
  neuroScienceTip: string;
  recommendedDurationMinutes: number; // 2 ~ 5분
}

export interface ConceptCheckItem {
  id: string;
  conceptName: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface NeuroStudySessionResult {
  studentId: string;
  subjectId: string;
  unitName: string;
  careType: string;
  completedStages: LadderStageLevel[];
  stageScores: Record<LadderStageLevel, number>; // 각 단계별 맞춘 개수 (0~5)
  totalSolved: number;
  totalCorrect: number;
  accuracy: number;
  completedAt: string;
  neuroFeedback: string;
}

// ===== 수능 1·2·3년 신경-성적 듀얼트랙 로드맵 타입 =====
export type RoadmapDuration = '1year' | '2year' | '3year';
export type RoadmapTrackType = 'academic' | 'neuro';

export interface RoadmapMilestone {
  id: string;
  phaseId: string;
  track: RoadmapTrackType;
  subjectId?: 'math' | 'korean' | 'english' | 'inquiry' | 'all'; // 연계 과목
  title: string;
  description: string;
  targetUnit?: string;           // 연계 교과 단원명 (예: '수열', '미분', '빈칸추론')
  targetHoursPerWeek?: number;   // 권장 주간 순공/케어 시간
  isCompleted: boolean;          // 완료 여부 (체크박스)
  dueDate?: string;              // 목표 완료일 (YYYY-MM-DD)
  isCustom?: boolean;            // 사용자가 직접 추가한 커스텀 마일스톤 여부
}

export interface RoadmapPhase {
  id: string;
  phaseNumber: number;           // 1, 2, 3, ... (분기 번호)
  title: string;                 // 예: '1분기: 기초 체화 & 취약점(수열) 제거'
  periodLabel: string;           // 예: '고3 겨울방학 (12월~2월)'
  targetDDay: string;            // 예: 'D-300'
  academicGoal: string;          // 교과 목표 요약
  neuroCareGoal: string;         // 신경인지 케어 목표 요약
  milestones: RoadmapMilestone[];// 해당 분기의 듀얼트랙 마일스톤 목록
}

export interface StudentRoadmap {
  id: string;
  studentId: string;
  durationType: RoadmapDuration; // 1년 / 2년 / 3년
  targetExamYear: number;        // 예: 2027, 2028
  phases: RoadmapPhase[];
  overallProgress: number;       // 0 ~ 100%
  customNotes?: string;
  createdAt: string;
  updatedAt: string;
  // 적응형 재생성용 입력 스냅샷 (입력 변화 감지·완료상태 보존 병합용, 미존재 시 레거시로 간주)
  inputSnapshot?: RoadmapInputSnapshot;
}

// 로드맵 생성 시점의 입력 스냅샷 (stale 감지용)
export interface RoadmapInputSnapshot {
  careTypeCode: string;
  primaryScore?: number;
  recordCount: number;
  latestExamDate?: string;
  gradesKey: string; // 'korean-math-english' 현재 등급 조합
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
  // [NEW] Gamification & D-Day Fields
  currentStreak?: number;
  longestStreak?: number;
  conditionScore?: number; // 0-100
  sleepDebtMinutes?: number; // Positive = debt, Negative = surplus
  isDdayMode?: boolean;
  dDayDate?: string;
  dDayTargetWakeTime?: string;
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
  // [NEW] Feedback from real sleep records
  actualSleepAvg?: number;
  actualSleepDebtHours?: number;
  recordedDaysCount?: number;
  feedbackFromRecords?: string;
}

// 오답 원인 분류 및 망각곡선 간격반복 타입
export type WrongNoteErrorType = 'CONCEPT' | 'MISTAKE_IMPULSE' | 'TIME_LIMIT' | 'KILLER_PROBLEM';

/** 복습 기록 방식: answer=정답 직접 입력 검증, twin=AI 변형 문제 풀이, self=자기확인, recall=백지 인출 연동 */
export type WrongNoteReviewMethod = 'answer' | 'twin' | 'self' | 'recall';

export interface WrongNoteReviewRecord {
  date: string;
  passed: boolean;
  /** 검증 통과 여부 (true=정답 입력·변형 문제로 확인, false·미기재=자기보고) */
  verified?: boolean;
  method?: WrongNoteReviewMethod;
}

export interface WrongNote {
  id: string;
  studentId?: string; // 동기화용 학생 식별자 (없으면 PC 로컬 전용)
  source?: string; // 'android' — Android에서 온 병합분 표시 (재푸시 제외용)
  subject: string;
  questionTitle: string;
  wrongAnswer: string;
  correctAnswer: string;
  explanation: string;
  difficulty: "상" | "중" | "하";
  errorType?: WrongNoteErrorType; // 개념부족, 실수/산만, 시간부족, 킬러문항
  reviewStage?: number; // 0: 신규, 1: 1일 후, 2: 3일 후, 3: 7일 후, 4: 마스터 (3단계 통과 후 14일 재검증)
  nextReviewDate?: string; // YYYY-MM-DD
  lastReviewedAt?: string;
  reviewHistory?: WrongNoteReviewRecord[];
  isResolved: boolean;
  createdAt: string;
  imageUrl?: string; // 문제 원본 사진 (촬영/캡처본)
  metacognitiveNote?: { // 3줄 메타인지 빠른 기록
    misconception?: string; // 1줄: 내가 한 착각/함정 사고
    trapKeyword?: string;    // 2줄: 출제자의 함정/단서
    actionRule?: string;     // 3줄: 다음 번 첫 행동 수칙
  };
  twinProblem?: { // AI 쌍둥이 유사 변형 문항 캐시
    twinTitle: string;
    question: string;
    answer: string;
    explanation: string;
    generatedAt?: string;
  };
}

// 인지검사 결과 기반 과목별 맞춤 공부법 조정 인터페이스
export interface CognitiveSubjectAdaptation {
  cognitiveDomain: 'workingMemory' | 'inhibitoryControl' | 'cognitiveFlexibility';
  domainScore: number;
  level: 'OPTIMAL' | 'MODERATE' | 'VULNERABLE'; // 우수, 보통, 취약
  subjectProtocols: {
    math: {
      actionName: string;
      technique: string;
      caution: string;
    };
    korean: {
      actionName: string;
      technique: string;
      caution: string;
    };
    english: {
      actionName: string;
      technique: string;
      caution: string;
    };
    inquiry: {
      actionName: string;
      technique: string;
      caution: string;
    };
  };
  examRoutineAdvice: string;
  progressTracking?: {
    baselineScore: number;
    currentScore: number;
    improvementRate: number; // percentage
  };
}

// ===== 과목별 AI 클리닉 & 문제은행 타입 정의 =====

export type TrapType =
  // 국어 함정 유형
  | 'causal_distortion'        // 인과 왜곡 (선후관계를 원인-결과로 왜곡)
  | 'subject_object_inversion' // 주객 전도 / 범주 오류
  | 'exaggeration'             // 과장·확대해석 / 일반화의 오류
  | 'unsupported_inference'    // 본문에 없는 자의적 억측
  | 'fact_mismatch'            // 단순 사실 불일치
  // 수학 함정 및 계산 실수 유형
  | 'sign_flip'                // 부호 실수 / 이항 전개 오류 (Sign Flip)
  | 'boundary_value'           // 경계값 / 등호 누락 / 정수 조건 미확인 (Boundary Value)
  | 'condition_omission'       // 발문 조건 [가], [나] 간과 (Omitted Condition)
  | 'calc_overload'            // 계산 비효율 / 무리한 전개 인지 과부하 (Calculation Overload)
  | 'graph_misassumption'      // 그래프 개형 임의 단정 / 대칭성 오판 (Graph Misassumption)
  // 영어 함정 및 매력적 오답 유형
  | 'word_match_distortion'    // 단어 일치 왜곡형 (지문 단어만 보고 성급히 고르는 함정)
  | 'discourse_signpost_miss'  // 지시어·연결사 단서 간과 (However, Such, This 대명사 누락)
  | 'scope_overgeneralization' // 지나친 일반화·비약 (All, Always, Never, Solely 범위 왜곡)
  | 'opposite_causality'       // 인과 역전·주객 전도 (원인과 결과를 뒤바꾼 선지)
  | 'irrelevant_theme';        // 주제 이탈·부분적 참 (매력적이지만 글 전체 요지와 무관)

export interface BankQuestion {
  id: string;                    // 고유 UUID
  studentId: string;             // 학생 ID
  subjectId: string;             // 'korean' | 'math' | 'english' 등
  targetGrade: number;           // 목표 등급 (예: 1)
  currentGrade: number;          // 현재 등급 (예: 2)
  strategyType: 'grade_strategy' | 'cognitive_tip'; // 등급 전략 vs 인지 훈련
  strategyTag: string;           // 예: '문학 미세 선지 판별', '핵심 명제 연결'
  passage: string;               // 250~350자 내외 지문 본문
  question: string;              // 발문
  options: string[];             // 선지 목록 (3~4개)
  correctIndex: number;          // 정답 인덱스 (0-based)
  strategyFeedback: string;      // 정답/오답 해설 및 전략 체화 가이드
  trapType: TrapType;            // 출제 함정 유형
  topicKeyword: string;          // 주제 키워드 (예: '흄의 인과론', '채권 수익률')
  fingerprint: string;           // 지문 중복 방지용 정규화 해시
  isSolved: boolean;             // 풀이 완료 여부
  isCorrect?: boolean;           // 정답 여부
  chosenIndex?: number;          // 학생이 고른 선지
  solveDurationSec?: number;     // 풀이 소요 시간 (초)
  cognitiveFatigueNote?: string; // 소요 시간에 따른 인지 과부하 분석
  memoryKeywords?: string[];     // 인지 훈련 시 입력한 키워드 3개
  createdAt: string;             // 생성 일시
  solvedAt?: string;             // 풀이 일시
}

export interface TrapDnaStats {
  totalAttempts: number;
  correctCount: number;
  accuracyRate: number;
  trapBreakdown: Record<TrapType, { attempts: number; failedCount: number; failRate: number }>;
  mostVulnerableTrap: TrapType | null;
  avgSolveSec: number;
  cognitiveOverloadCount: number; // 90초 이상 고민한 횟수
}