import { supabase } from '../lib/supabase';
import { ScheduleItem, MobileGradeRecord, WrongNoteItem, SleepLogItem } from '../types';

// LocalStorage Keys
const KEYS = {
  SCHEDULES: 'nbass_schedules_',
  GRADES: 'nbass_grades_',
  WRONG_NOTES: 'nbass_wrong_notes_',
  SLEEP_LOGS: 'nbass_sleep_logs_',
};

// 기본 초기 데이터
const DEFAULT_SCHEDULES: ScheduleItem[] = [
  { id: '1', studentId: 'STD-2026-001', startTime: '07:00', endTime: '08:00', subject: '각성 & 루틴', activity: '기상 직후 햇빛 쬐기 & HL 커피 부스터 500ml', color: 'bg-amber-100 text-amber-900 border-amber-300' },
  { id: '2', studentId: 'STD-2026-001', startTime: '09:00', endTime: '12:00', subject: '수학 (몰입)', activity: '미적분 수능 킬러문항 4문항 집중 분석', color: 'bg-indigo-100 text-indigo-900 border-indigo-300' },
  { id: '3', studentId: 'STD-2026-001', startTime: '13:30', endTime: '14:00', subject: '휴식 (커피 냅)', activity: '식후 20분 짧은 낮잠으로 전두엽 아데노신 리셋', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
  { id: '4', studentId: 'STD-2026-001', startTime: '14:30', endTime: '17:30', subject: '국어 (비문학)', activity: '독서 경제/과학 지문 구조도 독해 훈련', color: 'bg-blue-100 text-blue-900 border-blue-300' },
  { id: '5', studentId: 'STD-2026-001', startTime: '19:30', endTime: '22:00', subject: '영어 & 탐구', activity: '빈칸추론 5문항 + 탐구 핵심 개념 오답 정리', color: 'bg-purple-100 text-purple-900 border-purple-300' },
];

const DEFAULT_GRADES: MobileGradeRecord[] = [
  {
    id: 'grd-01',
    studentId: 'STD-2026-001',
    examName: '2026 6월 모의평가',
    examDate: '2026-06-04',
    examType: 'MOCK',
    scores: [
      { subject: '국어', score: 84, grade: 2, percentile: 89 },
      { subject: '수학', score: 78, grade: 3, percentile: 77 },
      { subject: '영어', score: 88, grade: 2 },
      { subject: '탐구1', score: 44, grade: 2, percentile: 88 },
      { subject: '탐구2', score: 40, grade: 3, percentile: 79 },
    ],
    memo: '수학 20번, 21번 시간 부족으로 미완성. 오후 집중력 저하 체감.',
    createdAt: '2026-06-05'
  }
];

const DEFAULT_WRONG_NOTES: WrongNoteItem[] = [
  {
    id: 'wn-01',
    studentId: 'STD-2026-001',
    subject: '수학',
    unitName: '미적분 - 여러 가지 함수의 미분법',
    questionNumber: '21번',
    errorReason: '문제 조건 오독',
    memo: 'x > 0 조건을 간과하여 극값 위치를 음수 구간까지 잘못 계산함.',
    aiPrescription: '⚡ [인지 피로형 조건 오독]: 25분 초과 시 전두엽 활성도가 떨어질 때 발생합니다. 문제 지문의 정의역 조건을 빨간 펜으로 동그라미 치는 습관을 들이세요.',
    isResolved: false,
    createdAt: '2026-09-02'
  }
];

const DEFAULT_SLEEP_LOGS: SleepLogItem[] = [
  {
    id: 'slp-01',
    studentId: 'STD-2026-001',
    date: '2026-09-05',
    bedTime: '01:30',
    wakeTime: '07:00',
    totalHours: 5.5,
    sleepDebtHours: 2.0,
    quality: 'NORMAL',
    memo: '잠들기 전 스마트폰 사용으로 입면 지연'
  }
];

export const dataSyncService = {
  // ── 1. 스케줄 관리 ──────────────────────────────
  getSchedules(studentId: string): ScheduleItem[] {
    try {
      const key = KEYS.SCHEDULES + studentId;
      const data = localStorage.getItem(key);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_SCHEDULES;
  },

  async saveSchedules(studentId: string, items: ScheduleItem[]): Promise<void> {
    const key = KEYS.SCHEDULES + studentId;
    localStorage.setItem(key, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('nbass_data_updated', { detail: { type: 'schedule', items } }));

    // Supabase 백그라운드 클라우드 동기화
    try {
      await supabase.from('student_schedules' as any).upsert({
        student_id: studentId,
        schedules: items,
        updated_at: new Date().toISOString()
      }, { onConflict: 'student_id' } as any);
    } catch (err) {
      console.warn('Supabase schedule sync notice:', err);
    }
  },

  // ── 2. 성적 관리 ──────────────────────────────
  getGradeRecords(studentId: string): MobileGradeRecord[] {
    try {
      const key = KEYS.GRADES + studentId;
      const data = localStorage.getItem(key);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_GRADES;
  },

  async saveGradeRecord(record: MobileGradeRecord): Promise<void> {
    const records = this.getGradeRecords(record.studentId);
    const updated = [record, ...records.filter(r => r.id !== record.id)];
    localStorage.setItem(KEYS.GRADES + record.studentId, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('nbass_data_updated', { detail: { type: 'grade', record } }));

    // Supabase 백그라운드 클라우드 동기화
    try {
      await supabase.from('grade_records' as any).upsert({
        id: record.id,
        student_id: record.studentId,
        exam_name: record.examName,
        exam_date: record.examDate,
        scores: record.scores,
        memo: record.memo,
        created_at: record.createdAt
      }, { onConflict: 'id' } as any);
    } catch (err) {
      console.warn('Supabase grade sync notice:', err);
    }
  },

  // ── 3. 오답노트 관리 (사진 촬영 & AI 처방) ──────
  getWrongNotes(studentId: string): WrongNoteItem[] {
    try {
      const key = KEYS.WRONG_NOTES + studentId;
      const data = localStorage.getItem(key);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_WRONG_NOTES;
  },

  async saveWrongNote(note: WrongNoteItem): Promise<void> {
    const notes = this.getWrongNotes(note.studentId);
    const updated = [note, ...notes.filter(n => n.id !== note.id)];
    localStorage.setItem(KEYS.WRONG_NOTES + note.studentId, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('nbass_data_updated', { detail: { type: 'wrongNote', note } }));

    // Supabase 백그라운드 클라우드 동기화
    try {
      await supabase.from('wrong_notes' as any).upsert({
        id: note.id,
        student_id: note.studentId,
        subject: note.subject,
        unit_name: note.unitName,
        question_number: note.questionNumber,
        image_url: note.imageUrl,
        error_reason: note.errorReason,
        memo: note.memo,
        ai_prescription: note.aiPrescription,
        is_resolved: note.isResolved,
        created_at: note.createdAt
      }, { onConflict: 'id' } as any);
    } catch (err) {
      console.warn('Supabase wrongNote sync notice:', err);
    }
  },

  // ── 4. 수면 기록 관리 (취침/기상 시간) ────────
  getSleepLogs(studentId: string): SleepLogItem[] {
    try {
      const key = KEYS.SLEEP_LOGS + studentId;
      const data = localStorage.getItem(key);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_SLEEP_LOGS;
  },

  async saveSleepLog(log: SleepLogItem): Promise<void> {
    const logs = this.getSleepLogs(log.studentId);
    const updated = [log, ...logs.filter(l => l.id !== log.id)];
    localStorage.setItem(KEYS.SLEEP_LOGS + log.studentId, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('nbass_data_updated', { detail: { type: 'sleep', log } }));

    // Supabase 백그라운드 클라우드 동기화
    try {
      await supabase.from('sleep_records' as any).upsert({
        id: log.id,
        student_id: log.studentId,
        date: log.date,
        bed_time: log.bedTime,
        wake_time: log.wakeTime,
        total_hours: log.totalHours,
        sleep_debt_hours: log.sleepDebtHours,
        quality: log.quality,
        memo: log.memo
      }, { onConflict: 'id' } as any);
    } catch (err) {
      console.warn('Supabase sleep sync notice:', err);
    }
  },

  // ── 5. 공부습관 진단 및 교정 ──────────────────
  getHabitDiagnosis(studentId: string): any {
    try {
      const key = 'nbass_habit_diag_' + studentId;
      const data = localStorage.getItem(key);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    return null;
  },

  async saveHabitDiagnosis(diag: any): Promise<void> {
    const key = 'nbass_habit_diag_' + diag.studentId;
    localStorage.setItem(key, JSON.stringify(diag));
    window.dispatchEvent(new CustomEvent('nbass_data_updated', { detail: { type: 'habit', diag } }));

    try {
      await supabase.from('habit_diagnoses' as any).upsert({
        student_id: diag.studentId,
        checked_habits: diag.checkedHabitIds,
        shock_report: diag.shockReport,
        updated_at: new Date().toISOString()
      }, { onConflict: 'student_id' } as any);
    } catch (err) {
      console.warn('Supabase habit sync notice:', err);
    }
  }
};
