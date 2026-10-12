export type StudentLevel = "middle" | "high";

export type SubjectCategory = "국어" | "수학" | "영어" | "사회/역사" | "과학" | "기타";

export type ExamType = "중간고사" | "기말고사" | "수행평가" | "모의고사";

export interface SubjectGrade {
  id: string;
  semester: string; // e.g. "2025-1학기"
  subjectName: string;
  category: SubjectCategory;
  examType: ExamType;
  score: number; // 0 - 100
  grade?: string; // High school: "1" ~ "9", Middle school: "A" ~ "E"
  unit: number; // Credit / weight (e.g. 2, 3, 4)
  note?: string;
}

export type WrongNoteErrorType = 'CONCEPT' | 'MISTAKE_IMPULSE' | 'TIME_LIMIT' | 'KILLER_PROBLEM';

export interface WrongNote {
  id: string;
  subject: string;
  questionTitle: string;
  wrongAnswer: string;
  correctAnswer: string;
  explanation: string;
  difficulty: "상" | "중" | "하";
  errorType?: WrongNoteErrorType; // 개념부족, 실수/산만, 시간부족, 킬러문항
  reviewStage?: number; // 0: 신규, 1: 1일후, 2: 3일후, 3: 7일후, 4: 마스터 정복
  nextReviewDate?: string; // YYYY-MM-DD
  lastReviewedAt?: string;
  reviewHistory?: { date: string; passed: boolean }[];
  isResolved: boolean;
  createdAt: string;
  imageUrl?: string;
  metacognitiveNote?: {
    misconception?: string;
    trapKeyword?: string;
    actionRule?: string;
  };
}

export interface SubjectGoal {
  id: string;
  subject: string;
  targetScore: number;
  targetGrade: string;
  memo: string;
}

export interface NotificationSetting {
  enabled: boolean;
  time: string; // e.g. "20:00"
  days: string[]; // ["월", "수", "금"]
  parentPhone: string;
  parentName: string;
  sendKakaoAuto: boolean;
}

export type CareTypeCode =
  | "BURNOUT"
  | "ANXIETY_TENSION"
  | "STRESS_OVERLOAD"
  | "LOW_ENERGY"
  | "DEPRESSION_AMOTIVATION"
  | "ADRENAL"
  | "BRAIN_FATIGUE"
  | "HYPERSENSITIVE"
  | "ATTENTION_DEFICIT"
  | "SLEEP"
  | "CIRCULATION"
  | "HEALTHY";

export interface StudentProfile {
  name: string;
  level: StudentLevel;
  gradeLevel: string; // e.g. "중학교 2학년" or "고등학교 1학년"
  schoolName: string;
  careType?: CareTypeCode;
}

export { CareType } from "../types";
