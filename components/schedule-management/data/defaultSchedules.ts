import { DayKey, DayScheduleConfig, RoutineInput, VacationConfig, ExamModeItem } from '../types';

export interface DayMeta {
  key: DayKey;
  label: string;
  shortLabel: string;
  type: 'weekday' | 'weekend' | 'holiday';
  badgeColor: string;
  iconEmoji: string;
}

export const DAYS_METADATA: DayMeta[] = [
  { key: 'mon', label: '월요일', shortLabel: '월', type: 'weekday', badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200', iconEmoji: '📅' },
  { key: 'tue', label: '화요일', shortLabel: '화', type: 'weekday', badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200', iconEmoji: '📅' },
  { key: 'wed', label: '수요일', shortLabel: '수', type: 'weekday', badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200', iconEmoji: '📅' },
  { key: 'thu', label: '목요일', shortLabel: '목', type: 'weekday', badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200', iconEmoji: '📅' },
  { key: 'fri', label: '금요일', shortLabel: '금', type: 'weekday', badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200', iconEmoji: '📅' },
  { key: 'sat', label: '토요일', shortLabel: '토', type: 'weekend', badgeColor: 'bg-blue-100 text-blue-800 border-blue-200', iconEmoji: '⚡' },
  { key: 'sun', label: '일요일', shortLabel: '일', type: 'weekend', badgeColor: 'bg-rose-100 text-rose-800 border-rose-200', iconEmoji: '🌿' },
  { key: 'holiday', label: '공휴일', shortLabel: '공휴일', type: 'holiday', badgeColor: 'bg-red-100 text-red-800 border-red-200', iconEmoji: '🔴' }
];

export const DEFAULT_DAY_CONFIGS: Record<DayKey, DayScheduleConfig> = {
  mon: {
    dayKey: 'mon',
    dayLabel: '월요일',
    hasSchool: true,
    wakeUpTime: '07:00',
    sleepTime: '23:30',
    schoolStartTime: '08:40',
    schoolEndTime: '16:30',
    selfStudyStartTime: '20:00',
    selfStudyEndTime: '23:00',
    academies: [
      { id: 'acad-mon-1', name: '수학 심화 특강', startTime: '17:30', endTime: '19:30', days: ['월', '수', '금'] }
    ],
    memo: '한 주의 시작, 취약 과목 개념 정립'
  },
  tue: {
    dayKey: 'tue',
    dayLabel: '화요일',
    hasSchool: true,
    wakeUpTime: '07:00',
    sleepTime: '23:30',
    schoolStartTime: '08:40',
    schoolEndTime: '16:30',
    selfStudyStartTime: '20:30',
    selfStudyEndTime: '23:30',
    academies: [
      { id: 'acad-tue-1', name: '영어 실전 독해', startTime: '18:00', endTime: '20:00', days: ['화', '목'] }
    ],
    memo: '영어 지문 분석 및 어휘 확장'
  },
  wed: {
    dayKey: 'wed',
    dayLabel: '수요일',
    hasSchool: true,
    wakeUpTime: '07:00',
    sleepTime: '23:30',
    schoolStartTime: '08:40',
    schoolEndTime: '16:30',
    selfStudyStartTime: '20:00',
    selfStudyEndTime: '23:00',
    academies: [
      { id: 'acad-wed-1', name: '수학 심화 특강', startTime: '17:30', endTime: '19:30', days: ['월', '수', '금'] }
    ],
    memo: '수학 킬러 문항 집중 연습'
  },
  thu: {
    dayKey: 'thu',
    dayLabel: '목요일',
    hasSchool: true,
    wakeUpTime: '07:00',
    sleepTime: '23:30',
    schoolStartTime: '08:40',
    schoolEndTime: '16:30',
    selfStudyStartTime: '20:30',
    selfStudyEndTime: '23:30',
    academies: [
      { id: 'acad-thu-1', name: '탐구영역 클리닉', startTime: '18:00', endTime: '20:00', days: ['목'] }
    ],
    memo: '탐구 개념 노트 및 기출 오답 정리'
  },
  fri: {
    dayKey: 'fri',
    dayLabel: '금요일',
    hasSchool: true,
    wakeUpTime: '07:00',
    sleepTime: '23:30',
    schoolStartTime: '08:40',
    schoolEndTime: '16:30',
    selfStudyStartTime: '19:30',
    selfStudyEndTime: '22:30',
    academies: [
      { id: 'acad-fri-1', name: '수학 심화 특강', startTime: '17:30', endTime: '19:00', days: ['월', '수', '금'] }
    ],
    memo: '주간 학습 총정리 및 가벼운 휴식'
  },
  sat: {
    dayKey: 'sat',
    dayLabel: '토요일',
    hasSchool: false,
    wakeUpTime: '08:00',
    sleepTime: '23:30',
    schoolStartTime: '08:40',
    schoolEndTime: '16:30',
    morningStudyStartTime: '09:30',
    morningStudyEndTime: '12:30',
    afternoonStudyStartTime: '14:00',
    afternoonStudyEndTime: '17:30',
    selfStudyStartTime: '19:00',
    selfStudyEndTime: '22:30',
    academies: [
      { id: 'acad-sat-1', name: '주말 국어 모의고사 실전반', startTime: '14:00', endTime: '17:00', days: ['토'] }
    ],
    memo: '주말 타임어택 실전 모의고사 훈련'
  },
  sun: {
    dayKey: 'sun',
    dayLabel: '일요일',
    hasSchool: false,
    wakeUpTime: '08:30',
    sleepTime: '23:00',
    schoolStartTime: '08:40',
    schoolEndTime: '16:30',
    morningStudyStartTime: '10:00',
    morningStudyEndTime: '12:30',
    afternoonStudyStartTime: '14:00',
    afternoonStudyEndTime: '17:00',
    selfStudyStartTime: '19:00',
    selfStudyEndTime: '22:00',
    academies: [],
    memo: '오답 누적 노트 복습 & 차주 계획 수립'
  },
  holiday: {
    dayKey: 'holiday',
    dayLabel: '공휴일',
    hasSchool: false,
    wakeUpTime: '08:00',
    sleepTime: '23:30',
    schoolStartTime: '08:40',
    schoolEndTime: '16:30',
    morningStudyStartTime: '09:00',
    morningStudyEndTime: '12:00',
    afternoonStudyStartTime: '13:30',
    afternoonStudyEndTime: '17:30',
    selfStudyStartTime: '19:00',
    selfStudyEndTime: '22:30',
    academies: [],
    memo: '공휴일 몰입 집중 학습 (부족한 단원 완전 정복)'
  }
};

export const DEFAULT_VACATION_CONFIG: VacationConfig = {
  enabled: false,
  name: '여름방학 집중 기간',
  startDate: '2026-07-20',
  endDate: '2026-08-25'
};

export const DEFAULT_VACATION_DAY_CONFIGS: Record<DayKey, DayScheduleConfig> = {
  mon: {
    dayKey: 'mon',
    dayLabel: '방학 월요일',
    hasSchool: false,
    wakeUpTime: '07:30',
    sleepTime: '23:30',
    schoolStartTime: '08:40',
    schoolEndTime: '16:30',
    morningStudyStartTime: '09:00',
    morningStudyEndTime: '12:00',
    afternoonStudyStartTime: '13:30',
    afternoonStudyEndTime: '17:00',
    selfStudyStartTime: '19:30',
    selfStudyEndTime: '22:30',
    academies: [
      { id: 'vac-acad-1', name: '방학 수학 썸머스쿨 특강', startTime: '13:30', endTime: '16:30', days: ['월', '수', '금'] }
    ],
    memo: '방학 오전 개념 독서 & 오후 수학 특강'
  },
  tue: {
    dayKey: 'tue',
    dayLabel: '방학 화요일',
    hasSchool: false,
    wakeUpTime: '07:30',
    sleepTime: '23:30',
    schoolStartTime: '08:40',
    schoolEndTime: '16:30',
    morningStudyStartTime: '09:00',
    morningStudyEndTime: '12:00',
    afternoonStudyStartTime: '13:30',
    afternoonStudyEndTime: '17:00',
    selfStudyStartTime: '19:30',
    selfStudyEndTime: '22:30',
    academies: [
      { id: 'vac-acad-2', name: '방학 영어 실전 특강', startTime: '14:00', endTime: '17:00', days: ['화', '목'] }
    ],
    memo: '방학 영어 구문 분석 & 인강 정주행'
  },
  wed: {
    dayKey: 'wed',
    dayLabel: '방학 수요일',
    hasSchool: false,
    wakeUpTime: '07:30',
    sleepTime: '23:30',
    schoolStartTime: '08:40',
    schoolEndTime: '16:30',
    morningStudyStartTime: '09:00',
    morningStudyEndTime: '12:00',
    afternoonStudyStartTime: '13:30',
    afternoonStudyEndTime: '17:00',
    selfStudyStartTime: '19:30',
    selfStudyEndTime: '22:30',
    academies: [
      { id: 'vac-acad-3', name: '방학 수학 썸머스쿨 특강', startTime: '13:30', endTime: '16:30', days: ['월', '수', '금'] }
    ],
    memo: '수학 기출 분석 및 심화 문제 풀이'
  },
  thu: {
    dayKey: 'thu',
    dayLabel: '방학 목요일',
    hasSchool: false,
    wakeUpTime: '07:30',
    sleepTime: '23:30',
    schoolStartTime: '08:40',
    schoolEndTime: '16:30',
    morningStudyStartTime: '09:00',
    morningStudyEndTime: '12:00',
    afternoonStudyStartTime: '13:30',
    afternoonStudyEndTime: '17:00',
    selfStudyStartTime: '19:30',
    selfStudyEndTime: '22:30',
    academies: [
      { id: 'vac-acad-4', name: '방학 과학탐구 압축 완성', startTime: '14:00', endTime: '17:00', days: ['목'] }
    ],
    memo: '탐구 개념 1회독 마스터'
  },
  fri: {
    dayKey: 'fri',
    dayLabel: '방학 금요일',
    hasSchool: false,
    wakeUpTime: '07:30',
    sleepTime: '23:30',
    schoolStartTime: '08:40',
    schoolEndTime: '16:30',
    morningStudyStartTime: '09:00',
    morningStudyEndTime: '12:00',
    afternoonStudyStartTime: '13:30',
    afternoonStudyEndTime: '17:00',
    selfStudyStartTime: '19:30',
    selfStudyEndTime: '22:30',
    academies: [
      { id: 'vac-acad-5', name: '방학 수학 썸머스쿨 특강', startTime: '13:30', endTime: '16:30', days: ['월', '수', '금'] }
    ],
    memo: '주간 방학 목표 달성도 점검'
  },
  sat: {
    dayKey: 'sat',
    dayLabel: '방학 토요일',
    hasSchool: false,
    wakeUpTime: '08:00',
    sleepTime: '23:30',
    schoolStartTime: '08:40',
    schoolEndTime: '16:30',
    morningStudyStartTime: '09:30',
    morningStudyEndTime: '12:30',
    afternoonStudyStartTime: '14:00',
    afternoonStudyEndTime: '17:30',
    selfStudyStartTime: '19:00',
    selfStudyEndTime: '22:30',
    academies: [],
    memo: '방학 실전 모의고사 타임어택'
  },
  sun: {
    dayKey: 'sun',
    dayLabel: '방학 일요일',
    hasSchool: false,
    wakeUpTime: '08:30',
    sleepTime: '23:00',
    schoolStartTime: '08:40',
    schoolEndTime: '16:30',
    morningStudyStartTime: '10:00',
    morningStudyEndTime: '12:30',
    afternoonStudyStartTime: '14:00',
    afternoonStudyEndTime: '17:00',
    selfStudyStartTime: '19:00',
    selfStudyEndTime: '21:30',
    academies: [],
    memo: '한 주 피드백 & 멘탈 리프레시'
  },
  holiday: {
    dayKey: 'holiday',
    dayLabel: '방학 중 공휴일',
    hasSchool: false,
    wakeUpTime: '08:30',
    sleepTime: '23:00',
    schoolStartTime: '08:40',
    schoolEndTime: '16:30',
    morningStudyStartTime: '09:30',
    morningStudyEndTime: '12:30',
    afternoonStudyStartTime: '14:00',
    afternoonStudyEndTime: '17:00',
    selfStudyStartTime: '19:00',
    selfStudyEndTime: '22:00',
    academies: [],
    memo: '방학 공휴일 특별 힐링 및 테마 학습'
  }
};

export const DEFAULT_EXAM_MODES: ExamModeItem[] = [
  {
    id: 'normal',
    name: '일반 학습 모드',
    iconEmoji: '📖',
    description: '기본 과목 우선순위 및 밸런스 유지 데일리 루틴',
    strategyBadge: '균형 학습',
    solutionDetail: '과목별 정규 배분과 규칙적인 휴식으로 번아웃 없는 지속 가능한 페이스를 유지합니다.',
    steps: [
      { title: '데일리 루틴 준수', desc: '과목별 배정된 주간 목표 시간에 맞추어 규칙적인 학습 진행', iconType: 'book' },
      { title: '휴식 타이머 실행', desc: '뽀모도로 휴식 시간 동안 뇌 피로를 즉시 완화하는 루틴 실천', iconType: 'sparkles' }
    ],
    examName: '평상시 자습',
    examDate: '',
    isCustom: false,
    themeColor: 'indigo'
  },
  {
    id: 'mock',
    name: '🎯 모의고사 시험 모드',
    iconEmoji: '🎯',
    description: '실전 타임어택 훈련 및 오답 분석 집중',
    strategyBadge: '타임어택 훈련',
    solutionDetail: '모의고사 당일 시간 부족과 압박감으로 인한 머리 하얘짐(Freezing) 현상을 방지하기 위해, 실전과 동일한 시간에 모의고사 기출을 풀고 오답 노트의 출제 의도를 분석하는 타임어택 블록이 자동 생성됩니다.',
    steps: [
      { title: '1단계: 실전 타임어택 (80분)', desc: '실제 시험 시간과 동일하게 스톱워치를 맞추고 모르는 문제는 과감히 패스하며 풀기', iconType: 'clock' },
      { title: '2단계: 오답 구조화 분석', desc: '틀린 이유가 개념 부족인지, 시간 부족인지, 실수인지 분류하여 오답 노트 정리', iconType: 'check' }
    ],
    examName: '전국연합학력평가 / 모의평가',
    examDate: '2026-09-03',
    isCustom: false,
    themeColor: 'amber'
  },
  {
    id: 'final',
    name: '📚 기말고사 시험 모드',
    iconEmoji: '📚',
    description: '교과서 핵심 암기 및 백지 복습, 기출 집중',
    strategyBadge: '교과서 백지복습',
    solutionDetail: '학교 교과서와 선생님 필기 노트가 내신 출제의 90%입니다. 백지 복습법(Blended Active Recall)을 활용하여 빈 종이에 핵심 개념을 구조화하여 적어보는 훈련을 반복합니다.',
    steps: [
      { title: '1단계: 교과서 3회독 정독', desc: '1회독 전체 흐름 파악 ➔ 2회독 중요 암기 포인트 형광펜 ➔ 3회독 서술형 예상 문제 추출', iconType: 'book' },
      { title: '2단계: 백지 테스트 (Active Recall)', desc: '교과서를 덮고 A4 백지에 핵심 마인드맵과 공식을 스스로 인출하며 취약점 점검', iconType: 'sparkles' }
    ],
    examName: '2학기 기말고사',
    examDate: '2026-10-15',
    isCustom: false,
    themeColor: 'purple'
  },
  {
    id: 'midterm',
    name: '📝 중간고사 내신 모드',
    iconEmoji: '📝',
    description: '단원별 기출 변형 정복 & 서술형 킬러 대비',
    strategyBadge: '기출 변형 정복',
    solutionDetail: '중간고사는 시험 범위가 좁고 깊은 개념 및 서술형 문제가 변별력을 가릅니다. 부교재 및 최근 3개년 학교 기출을 완벽 분석합니다.',
    steps: [
      { title: '1단계: 부교재/프린트 단권화', desc: '선생님이 배부한 모든 프린트와 부교재 필기를 교과서에 단권화 정리', iconType: 'book' },
      { title: '2단계: 서술형 조건부 문항 훈련', desc: '감점 요소(단위, 문장 완성도, 필수 키워드)를 체크하며 서술형 답안 작성 훈련', iconType: 'check' }
    ],
    examName: '1학기 중간고사',
    examDate: '2026-04-28',
    isCustom: false,
    themeColor: 'blue'
  },
  {
    id: 'csat',
    name: '🔥 수능/모의평가 파이널 모드',
    iconEmoji: '🔥',
    description: '수능 생체 리듬 동기화 & 킬러 문항 집중 공략',
    strategyBadge: '수능 생체리듬 동기화',
    solutionDetail: '수능 시간표(국어 08:40, 수학 10:30, 영어 13:10, 탐구 14:50)에 맞추어 두뇌 피크 타임을 조절하고 긴장 완화 호흡을 훈련합니다.',
    steps: [
      { title: '1단계: 수능 교시별 생체 시계 세팅', desc: '아침 기상 06:30 유지, 오전 국어/수학 두뇌 풀가동 훈련', iconType: 'clock' },
      { title: '2단계: 킬러 문항 접근 알고리즘화', desc: '고난도 킬러 문제의 조건 해석 루틴을 체계화하여 멘탈 흔들림 차단', iconType: 'sparkles' }
    ],
    examName: '2027학년도 대학수학능력시험',
    examDate: '2026-11-19',
    isCustom: false,
    themeColor: 'rose'
  }
];

export const INITIAL_ROUTINE_STATE: RoutineInput = {
  wakeUpTime: '07:00',
  sleepTime: '23:30',
  schoolStartTime: '08:40',
  schoolEndTime: '16:30',
  academies: [
    { id: 'acad-1', name: '수학 심화 특강', startTime: '17:30', endTime: '19:30', days: ['월', '수', '금'] }
  ],
  subjects: [
    { id: 'sub-1', name: '국어', priority: 1, weeklyTargetHours: 5, currentMastery: 70, color: 'bg-rose-500' },
    { id: 'sub-2', name: '수학', priority: 1, weeklyTargetHours: 8, currentMastery: 65, color: 'bg-blue-500' },
    { id: 'sub-3', name: '영어', priority: 2, weeklyTargetHours: 5, currentMastery: 75, color: 'bg-emerald-500' },
    { id: 'sub-4', name: '과학탐구', priority: 2, weeklyTargetHours: 4, currentMastery: 80, color: 'bg-violet-500' },
    { id: 'sub-5', name: '사회탐구', priority: 3, weeklyTargetHours: 3, currentMastery: 75, color: 'bg-amber-500' }
  ],
  selfStudyStartTime: '20:00',
  selfStudyEndTime: '23:00',
  examMode: 'normal',
  examName: '2학기 기말고사',
  examDate: '2026-10-15',
  examModesList: DEFAULT_EXAM_MODES,

  activeDay: 'mon',
  isVacationMode: false,
  vacation: DEFAULT_VACATION_CONFIG,
  dayConfigs: DEFAULT_DAY_CONFIGS,
  vacationDayConfigs: DEFAULT_VACATION_DAY_CONFIGS
};
