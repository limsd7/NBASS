// 저장소 단일 진실원천 (용량/절삭/키 규격)
// UI 변경 없음. 기존 분산된 3/5/50 절삭을 하나로 통일.

export const HISTORY_MIRROR_KEY = 'sn1_history';
export const HISTORY_MIRROR_MAX = 10;

export const storageKeys = {
  schedules: (studentId: string) => `nbass_schedules_${studentId}`,
  grades: (studentId: string) => `nbass_grades_${studentId}`,
  // 오답노트: PC/모바일 공유를 위해 학생별 키로 통일
  wrongNotes: (studentId?: string) => (studentId ? `nbass_wrong_notes_${studentId}` : 'nbass_wrong_notes'),
  wrongNotesLegacy: 'nbass_wrong_notes',
  sleepLogs: (studentId: string) => `nbass_sleep_logs_${studentId}`,
  history: HISTORY_MIRROR_KEY,
} as const;
