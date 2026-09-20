export interface BreakGuide {
  title: string;
  description: string;
  type: 'meditation' | 'stretching' | 'breathing' | 'walk';
  durationMinutes: number;
}

export interface CareType {
  id: string;
  emoji: string;
  symbol: string;
  title: string;
  subtitle: string;
  traits: string;
  solution: string;
  pomodoroWork: number; // minutes
  pomodoroBreak: number; // minutes
  breakGuide: BreakGuide;
  category: 'burnout' | 'anxiety' | 'fatigue' | 'focus' | 'sleep' | 'balanced';
}

export interface SubjectPriority {
  id: string;
  name: string;
  priority: number; // 1 (highest) to 5 (lowest)
  weeklyTargetHours: number;
  currentMastery: number; // 1 - 100%
  color: string;
}

export interface AcademyItem {
  id: string;
  name: string;
  startTime: string; // e.g. "17:00"
  endTime: string;   // e.g. "19:00"
  days: string[];    // ['월', '수', '금']
}

export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun' | 'holiday';

export interface VacationConfig {
  enabled: boolean;
  name: string; // e.g. "여름방학", "겨울방학", "봄방학"
  startDate: string; // "2026-07-20"
  endDate: string; // "2026-08-31"
}

export interface DayScheduleConfig {
  dayKey: DayKey;
  dayLabel: string; // e.g. "월요일", "토요일", "공휴일"
  hasSchool: boolean; // false for weekends/holidays/vacation days
  wakeUpTime: string;
  sleepTime: string;
  schoolStartTime: string;
  schoolEndTime: string;
  morningStudyStartTime?: string; // e.g. "09:00" for non-school days
  morningStudyEndTime?: string;   // e.g. "12:00"
  afternoonStudyStartTime?: string; // e.g. "13:30"
  afternoonStudyEndTime?: string;   // e.g. "17:30"
  selfStudyStartTime: string;
  selfStudyEndTime: string;
  academies: AcademyItem[];
  memo?: string;
}

export interface ExamStrategyStep {
  title: string;
  desc: string;
  iconType?: 'clock' | 'check' | 'sparkles' | 'book' | 'shield';
}

export interface ExamModeItem {
  id: string;
  name: string;
  iconEmoji: string;
  description: string;
  strategyBadge?: string;
  solutionDetail?: string;
  steps?: ExamStrategyStep[];
  examName?: string;
  examDate?: string;
  isCustom?: boolean;
  themeColor?: string;
}

export interface RoutineInput {
  wakeUpTime: string;      // e.g. "07:00"
  sleepTime: string;       // e.g. "23:30"
  schoolStartTime: string; // e.g. "08:30"
  schoolEndTime: string;   // e.g. "16:30"
  academies: AcademyItem[];
  subjects: SubjectPriority[];
  selfStudyStartTime: string; // e.g. "19:30"
  selfStudyEndTime: string;   // e.g. "22:30"
  examMode: string; // id of selected exam mode ('normal' | 'mock' | 'final' | custom id)
  examName: string;
  examDate: string;
  examModesList?: ExamModeItem[]; // List of default and user-added exam modes
  
  // Multi-day & Holiday & Vacation configurations
  activeDay: DayKey;
  isVacationMode: boolean;
  vacation: VacationConfig;
  dayConfigs: Record<DayKey, DayScheduleConfig>;
  vacationDayConfigs: Record<DayKey, DayScheduleConfig>;
}

export type BlockType = 'study' | 'break' | 'school' | 'academy' | 'routine' | 'sleep' | 'meal';

export interface ScheduleBlock {
  id: string;
  title: string;
  type: BlockType;
  startTime: string; // "08:30"
  endTime: string;   // "09:20"
  subjectName?: string;
  completed: boolean;
  breakGuide?: BreakGuide;
  priority?: number;
  description?: string;
}

export interface DailyStats {
  date: string;
  studyMinutes: number;
  targetMinutes: number;
  achievementRate: number;
  completedTasks: number;
  totalTasks: number;
}
