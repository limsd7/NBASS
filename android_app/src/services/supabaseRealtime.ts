/**
 * Android ↔ PC 통합 Realtime 동기화 엔진
 * ------------------------------------------------------------------
 * PC(services/supabaseRealtimeSync.ts)와 같은 Supabase 프로젝트를 보고,
 * 같은 테이블(student_schedules / grade_records / wrong_notes /
 * sleep_records / habit_diagnoses)을 구독합니다.
 *
 * - 매칭 키는 student_id 문자열이므로 양쪽에서 같은 ID로 로그인해야 만납니다.
 * - PC 모양 row(subjects, bedtime, sleep_quality 등)도 최선 매핑으로 읽습니다.
 * - 로컬 저장 키(dataSyncService의 KEYS)와 동일 키에 쓰므로 기존 화면이 그대로 동작합니다.
 * - 변경 후 window 'nbass_data_updated' (detail.type: schedule|grade|wrongNote|sleep|habit)
 *   를 발행하면 각 페이지의 useNbassRemoteRefresh 훅이 화면을 갱신합니다.
 */
import { supabase, isSupabaseReady } from '../lib/supabase';
import type { ScheduleItem, MobileGradeRecord, WrongNoteItem, SleepLogItem } from '../types';
import type { RealtimeChannel } from '@supabase/supabase-js';

export type MobileRealtimeTable =
  | 'student_schedules'
  | 'grade_records'
  | 'wrong_notes'
  | 'sleep_records'
  | 'habit_diagnoses'
  | 'grade_goals'
  | 'sleep_goals'
  | 'assessments'
  | 'user_tiers'
  | 'app_logic_config';

const CHANNEL_NAME = 'nbass-mobile-v1';
const TABLES: MobileRealtimeTable[] = [
  'student_schedules',
  'grade_records',
  'wrong_notes',
  'sleep_records',
  'habit_diagnoses',
  // PC 전용이던 목표·검사 기록도 수신 (모바일 읽기 전용 표시)
  'grade_goals',
  'sleep_goals',
  'assessments',
  // PC 오너 등급 오버라이드 (이 student_id와 일치 시 즉시 적용)
  'user_tiers',
  // PC 진단 규칙 (모바일 이식 엔진이 그대로 사용, 읽기 전용)
  'app_logic_config',
];

const KEYS = {
  SCHEDULES: 'nbass_schedules_',
  GRADES: 'nbass_grades_',
  WRONG_NOTES: 'nbass_wrong_notes_',
  SLEEP_LOGS: 'nbass_sleep_logs_',
  HABIT: 'nbass_habit_diag_',
  GRADE_GOALS: 'nbass_grade_goals_',
  SLEEP_GOALS: 'nbass_sleep_goals_',
  ASSESSMENTS: 'nbass_assessments_',
};

/** PC 목표/검사 요약 타입 (모바일 읽기 전용) */
export interface MobileGradeGoal {
  id: string;
  studentId: string;
  subjectId: string;
  tier1Target?: number;
  tier2Target?: number;
  tier3Target?: number;
  currentGrade?: number;
  memo?: string;
}

export interface MobileSleepGoal {
  studentId: string;
  targetBedtime?: string;
  targetWakeTime?: string;
  targetDuration?: number;
  memo?: string;
}

export interface MobileAssessmentSummary {
  id: string;
  studentName: string;
  careType: string;
  careScore: number;
  analysisText: string;
  createdAt: string;
}

// ---- echo 가드 (자신이 푸시한 row의 되돌이 이벤트 무시, 15초 TTL) ----
const pushedAt = new Map<string, number>();
const TTL_MS = 15_000;

export function markMobilePushed(table: string, id?: string | null): void {
  if (!id) return;
  pushedAt.set(`${table}:${id}`, Date.now());
}

function isEcho(table: string, id?: string | null): boolean {
  if (!id) return false;
  const t = pushedAt.get(`${table}:${id}`);
  if (!t) return false;
  if (Date.now() - t > TTL_MS) {
    pushedAt.delete(`${table}:${id}`);
    return false;
  }
  return true;
}

// ---- PC → Android 모양 매핑 ----
function qualityNumberToEnum(n: unknown): SleepLogItem['quality'] {
  const v = typeof n === 'number' ? n : 3;
  return v >= 4 ? 'GOOD' : v === 3 ? 'NORMAL' : 'POOR';
}

function mapGradeRow(row: any): MobileGradeRecord | null {
  if (!row?.id || !row?.student_id) return null;
  // Android 우선, 없으면 PC subjects에서 최선 변환
  const scores = Array.isArray(row.scores) && row.scores.length > 0
    ? row.scores
    : (Array.isArray(row.subjects)
      ? row.subjects.map((s: any) => ({
          subject: s?.subjectId ?? '',
          score: s?.rawScore ?? 0,
          grade: s?.grade ?? 1,
          ...(s?.percentile !== undefined ? { percentile: s.percentile } : {}),
        }))
      : []);
  return {
    id: String(row.id),
    studentId: row.student_id,
    examName: row.exam_name ?? '',
    examDate: typeof row.exam_date === 'string' ? row.exam_date.slice(0, 10) : row.exam_date,
    examType: row.exam_type === 'INTERNAL' || row.exam_type === 'CSAT' ? row.exam_type : 'MOCK',
    scores,
    memo: row.memo ?? '',
    createdAt: row.created_at ? String(row.created_at).slice(0, 10) : new Date().toISOString().split('T')[0],
  };
}

function mapSleepRow(row: any): SleepLogItem | null {
  if (!row?.id || !row?.student_id) return null;
  return {
    id: String(row.id),
    studentId: row.student_id,
    date: typeof row.date === 'string' ? row.date.slice(0, 10) : row.date,
    bedTime: row.bed_time ?? row.bedtime ?? '',
    wakeTime: row.wake_time ?? '',
    totalHours: row.total_hours !== null && row.total_hours !== undefined ? Number(row.total_hours) : 0,
    sleepDebtHours: row.sleep_debt_hours !== null && row.sleep_debt_hours !== undefined ? Number(row.sleep_debt_hours) : 0,
    quality: row.quality === 'GOOD' || row.quality === 'NORMAL' || row.quality === 'POOR'
      ? row.quality
      : qualityNumberToEnum(row.sleep_quality),
    memo: row.memo ?? '',
  };
}

function mapScheduleRow(row: any): { studentId: string; items: ScheduleItem[] } | null {
  if (!row?.student_id || !Array.isArray(row?.schedules)) return null;
  return { studentId: row.student_id, items: row.schedules as ScheduleItem[] };
}

function mapWrongNoteRow(row: any): WrongNoteItem | null {
  if (!row?.id || !row?.student_id) return null;
  return {
    id: String(row.id),
    studentId: row.student_id,
    subject: row.subject ?? '',
    unitName: row.unit_name ?? row.question_title ?? '',
    questionNumber: row.question_number ?? '',
    imageUrl: row.image_url ?? undefined,
    errorReason: row.error_reason ?? '',
    memo: row.memo ?? '',
    aiPrescription: row.ai_prescription ?? undefined,
    isResolved: !!row.is_resolved,
    createdAt: row.created_at ?? new Date().toISOString(),
  };
}

function mapGradeGoalRow(row: any): MobileGradeGoal | null {
  if (!row?.id || !row?.student_id) return null;
  return {
    id: String(row.id),
    studentId: row.student_id,
    subjectId: row.subject_id ?? '',
    tier1Target: row.tier1_target ?? undefined,
    tier2Target: row.tier2_target ?? undefined,
    tier3Target: row.tier3_target ?? undefined,
    currentGrade: row.current_grade ?? undefined,
    memo: row.memo ?? '',
  };
}

function mapSleepGoalRow(row: any): MobileSleepGoal | null {
  if (!row?.student_id) return null;
  return {
    studentId: row.student_id,
    targetBedtime: row.target_bedtime ?? undefined,
    targetWakeTime: row.target_wake_time ?? undefined,
    targetDuration: row.target_duration ?? undefined,
    memo: row.memo ?? '',
  };
}

/** PC 등급 문자열 → 모바일 등급 (basic은 free급, 모르는 값은 무시) */
const VALID_TIERS = ['free', 'pro', 'premium', 'premium_plus', 'vip', 'expert'] as const;
export type MobileTier = (typeof VALID_TIERS)[number];

function mapPcTier(tier: unknown): MobileTier | null {
  if (tier === 'basic') return 'free';
  if (typeof tier === 'string' && (VALID_TIERS as readonly string[]).includes(tier)) {
    return tier as MobileTier;
  }
  return null;
}

/** 등급 row가 로그인한 student의 것인지 (ID 대소문자 무시, 없으면 name으로 폴백) */
function isOwnTierRow(row: any, studentId: string, userName?: string | null): boolean {
  if (!row?.student_id) return false;
  if (String(row.student_id).toLowerCase() === String(studentId).toLowerCase()) return true;
  const rowName = row?.name ? String(row.name).trim().toLowerCase() : '';
  if (userName && rowName && rowName === String(userName).trim().toLowerCase()) return true;
  return false;
}

/** 저장된 모바일 유저의 이름 조회 (등급 name-폴백 매칭용) */
function storedUserName(): string | null {
  try {
    const raw = localStorage.getItem('nbass_mobile_user');
    if (!raw) return null;
    const name = (JSON.parse(raw) as any)?.name;
    return name ? String(name) : null;
  } catch {
    return null;
  }
}

/** 모바일 유저 등급을 클라우드 값으로 갱신. 바뀌었으면 true */
function applyTierToLocalUser(tier: MobileTier): boolean {
  try {
    const raw = localStorage.getItem('nbass_mobile_user');
    if (!raw) return false;
    const user = JSON.parse(raw);
    if (user?.tier === tier) return false;
    user.tier = tier;
    localStorage.setItem('nbass_mobile_user', JSON.stringify(user));
    return true;
  } catch {
    return false;
  }
}

/** assessments row → 모바일 표시용 요약 (본인 student_id 매칭은 호출 측에서 검증) */
export function mapAssessmentSummary(row: any): MobileAssessmentSummary | null {
  if (!row?.id) return null;
  const si = (row.student_info as any) || {};
  return {
    id: String(row.id),
    studentName: row.student_name ?? si.name ?? '',
    careType: row.care_type ?? '',
    careScore: Number(row.care_score ?? 0),
    analysisText: row.analysis_text ?? '',
    createdAt: row.created_at ?? new Date().toISOString(),
  };
}

/** assessments row가 이 student의 것인지 (student_info.id/customId 기준, 엄격) */
function isOwnAssessment(row: any, studentId: string): boolean {
  const si = (row?.student_info as any) || {};
  return si?.id === studentId || si?.customId === studentId;
}

// ---- localStorage 읽기/쓰기 (dataSyncService와 동일 키) ----
function readList<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function upsertById<T extends { id: string }>(key: string, item: T): void {
  const list = readList<T>(key);
  const next = [item, ...list.filter((x) => x?.id !== item.id)].slice(0, 500);
  localStorage.setItem(key, JSON.stringify(next));
}

function removeById(key: string, id: string): void {
  const list = readList<{ id: string }>(key);
  localStorage.setItem(key, JSON.stringify(list.filter((x) => x?.id !== id)));
}

function emit(type: string, payload: unknown): void {
  try {
    window.dispatchEvent(new CustomEvent('nbass_data_updated', { detail: { type, ...(payload as object), remote: true } }));
  } catch {
    /* ignore */
  }
}

// ---- 원격 이벤트 → 로컬 반영 ----
function applyRemote(table: MobileRealtimeTable, eventType: string, row: any): void {
  const id: string | undefined = row?.id ? String(row.id) : row?.student_id ? `sid:${row.student_id}` : undefined;
  if (id && isEcho(table, id)) return;

  switch (table) {
    case 'student_schedules': {
      const m = mapScheduleRow(row);
      if (eventType === 'DELETE') {
        if (row?.student_id) {
          try { localStorage.removeItem(KEYS.SCHEDULES + row.student_id); } catch { /* ignore */ }
          emit('schedule', { studentId: row.student_id });
        }
      } else if (m) {
        localStorage.setItem(KEYS.SCHEDULES + m.studentId, JSON.stringify(m.items));
        emit('schedule', { studentId: m.studentId, items: m.items });
      }
      break;
    }
    case 'grade_records': {
      if (eventType === 'DELETE') {
        // REPLICA IDENTITY FULL 덕분에 old에 student_id가 들어있어 정확히 제거 가능
        if (row?.id && row?.student_id) {
          removeById(KEYS.GRADES + row.student_id, String(row.id));
          emit('grade', { studentId: row.student_id, deletedId: String(row.id) });
        } else {
          emit('grade', { deletedId: row?.id ? String(row.id) : undefined });
        }
      } else {
        const m = mapGradeRow(row);
        if (m) {
          upsertById(KEYS.GRADES + m.studentId, m);
          emit('grade', { studentId: m.studentId, record: m });
        }
      }
      break;
    }
    case 'wrong_notes': {
      if (eventType === 'DELETE') {
        if (row?.id && row?.student_id) {
          removeById(KEYS.WRONG_NOTES + row.student_id, String(row.id));
          emit('wrongNote', { studentId: row.student_id, deletedId: String(row.id) });
        } else {
          emit('wrongNote', {});
        }
      } else {
        const m = mapWrongNoteRow(row);
        if (m) {
          upsertById(KEYS.WRONG_NOTES + m.studentId, m);
          emit('wrongNote', { studentId: m.studentId, note: m });
        }
      }
      break;
    }
    case 'sleep_records': {
      if (eventType === 'DELETE') {
        if (row?.id && row?.student_id) {
          removeById(KEYS.SLEEP_LOGS + row.student_id, String(row.id));
          emit('sleep', { studentId: row.student_id, deletedId: String(row.id) });
        } else {
          emit('sleep', { deletedId: row?.id ? String(row.id) : undefined });
        }
      } else {
        const m = mapSleepRow(row);
        if (m) {
          upsertById(KEYS.SLEEP_LOGS + m.studentId, m);
          emit('sleep', { studentId: m.studentId, log: m });
        }
      }
      break;
    }
    case 'habit_diagnoses': {
      if (eventType === 'DELETE') {
        if (row?.student_id) {
          try { localStorage.removeItem(KEYS.HABIT + row.student_id); } catch { /* ignore */ }
        }
        emit('habit', { studentId: row?.student_id });
      } else if (row?.student_id) {
        localStorage.setItem(KEYS.HABIT + row.student_id, JSON.stringify({
          studentId: row.student_id,
          checkedHabitIds: row.checked_habits || [],
          shockReport: row.shock_report || '',
          updatedAt: row.updated_at || new Date().toISOString(),
        }));
        emit('habit', { studentId: row.student_id });
      }
      break;
    }
    case 'grade_goals': {
      if (eventType === 'DELETE') {
        if (row?.id && row?.student_id) {
          removeById(KEYS.GRADE_GOALS + row.student_id, String(row.id));
          emit('gradeGoal', { studentId: row.student_id, deletedId: String(row.id) });
        }
      } else {
        const m = mapGradeGoalRow(row);
        if (m) {
          upsertById(KEYS.GRADE_GOALS + m.studentId, m);
          emit('gradeGoal', { studentId: m.studentId, goal: m });
        }
      }
      break;
    }
    case 'sleep_goals': {
      if (eventType === 'DELETE') {
        if (row?.student_id) {
          try { localStorage.removeItem(KEYS.SLEEP_GOALS + row.student_id); } catch { /* ignore */ }
          emit('sleepGoal', { studentId: row.student_id });
        }
      } else {
        const m = mapSleepGoalRow(row);
        if (m) {
          localStorage.setItem(KEYS.SLEEP_GOALS + m.studentId, JSON.stringify(m));
          emit('sleepGoal', { studentId: m.studentId, goal: m });
        }
      }
      break;
    }
    case 'assessments': {
      // student_info 기준 엄격 매칭 (타 학생 요약 노출 금지)
      if (eventType === 'DELETE') {
        if (row?.id) emit('assessment', { deletedId: String(row.id) });
      } else if (row && isOwnAssessment(row, currentStudentId)) {
        const m = mapAssessmentSummary(row);
        if (m) {
          const key = KEYS.ASSESSMENTS + currentStudentId;
          const list = readList<MobileAssessmentSummary>(key);
          const next = [m, ...list.filter((x) => x?.id !== m.id)].slice(0, 50);
          localStorage.setItem(key, JSON.stringify(next));
          emit('assessment', { studentId: currentStudentId, summary: m });
        }
      }
      break;
    }
    case 'user_tiers': {
      // PC 오너 등급 변경 → 본인 row면 즉시 적용 (ID 우선, 이름 폴백)
      if (!currentStudentId) break;
      if (eventType === 'DELETE') break; // 삭제는 무시 (모바일 로컬 등급 유지)
      if (row && isOwnTierRow(row, currentStudentId, storedUserName())) {
        const tier = mapPcTier(row.tier);
        if (tier && applyTierToLocalUser(tier)) {
          emit('tier', { studentId: currentStudentId, tier });
        }
      }
      break;
    }
    case 'app_logic_config': {
      // PC 진단 규칙 → lastModified 비교 후 로컬에 병합 (모바일은 읽기 전용)
      if (eventType === 'DELETE') break;
      if (row?.config?.lastModified) {
        try {
          const raw = localStorage.getItem('sn1_logic_config');
          const localLast = raw ? (JSON.parse(raw) as any)?.lastModified || '' : '';
          if (String(row.config.lastModified) > localLast) {
            localStorage.setItem('sn1_logic_config', JSON.stringify(row.config));
            emit('logic', {});
          }
        } catch { /* ignore */ }
      }
      break;
    }
  }
}

// ---- 구독 시작/중지 ----
let channel: RealtimeChannel | null = null;
let startedFor: string | null = null;
let currentStudentId: string | null = null;

export function startSupabaseRealtime(studentId: string): () => void {
  if (!isSupabaseReady() || !studentId) return () => undefined;
  if (startedFor === studentId && channel) return () => undefined;

  stopSupabaseRealtime();
  currentStudentId = studentId;
  try {
    const ch = supabase.channel(CHANNEL_NAME);
    for (const table of TABLES) {
      ch.on(
        'postgres_changes' as any,
        { event: '*', schema: 'public', table },
        (payload: any) => {
          const eventType = payload?.eventType;
          if (eventType !== 'INSERT' && eventType !== 'UPDATE' && eventType !== 'DELETE') return;
          const row = eventType === 'DELETE' ? payload?.old : payload?.new;
          // 내 student 데이터만 반영. user_tiers는 대소문자 무시 매칭이라 case에서 처리하고,
          // assessments는 student_info 기준이라 case에서 처리한다.
          if (table !== 'user_tiers' && table !== 'assessments'
            && row && row.student_id && row.student_id !== studentId) return;
          try {
            applyRemote(table, eventType, row);
          } catch (err) {
            console.warn('[MobileRealtime] apply failed:', table, err);
          }
        }
      );
    }
    ch.subscribe((s: string) => {
      if (s === 'SUBSCRIBED') startedFor = studentId;
      else if (s === 'CLOSED' || s === 'CHANNEL_ERROR' || s === 'TIMED_OUT') {
        if (startedFor === studentId) startedFor = null;
      }
    });
    channel = ch;
  } catch (err) {
    console.warn('[MobileRealtime] subscribe failed:', err);
  }
  return () => stopSupabaseRealtime();
}

export function stopSupabaseRealtime(): void {
  try { channel?.unsubscribe(); } catch { /* ignore */ }
  try { if (channel) supabase.removeChannel(channel); } catch { /* ignore */ }
  channel = null;
  startedFor = null;
  currentStudentId = null;
}

// ---- 초기 Pull: Supabase → localStorage (이 student_id만) ----
async function safeSelectEq(table: MobileRealtimeTable, studentId: string): Promise<any[]> {
  try {
    const { data } = await (supabase.from(table as any) as any)
      .select('*')
      .eq('student_id', studentId)
      .limit(500);
    if (Array.isArray(data)) return data as any[];
  } catch { /* ignore */ }
  return [];
}

export async function pullSupabaseToLocal(studentId: string): Promise<number> {
  if (!isSupabaseReady() || !studentId) return 0;
  let pulled = 0;

  const sched = await safeSelectEq('student_schedules', studentId);
  if (sched[0] && Array.isArray(sched[0].schedules)) {
    localStorage.setItem(KEYS.SCHEDULES + studentId, JSON.stringify(sched[0].schedules));
    pulled++;
  }

  const grades = await safeSelectEq('grade_records', studentId);
  if (grades.length > 0) {
    const list = readList<MobileGradeRecord>(KEYS.GRADES + studentId);
    const ids = new Set(list.map((r) => r.id));
    const merged = [...list];
    for (const row of grades) {
      const m = mapGradeRow(row);
      if (m && !ids.has(m.id)) {
        merged.unshift(m);
        ids.add(m.id);
        pulled++;
      }
    }
    localStorage.setItem(KEYS.GRADES + studentId, JSON.stringify(merged.slice(0, 500)));
  }

  const notes = await safeSelectEq('wrong_notes', studentId);
  if (notes.length > 0) {
    const list = readList<WrongNoteItem>(KEYS.WRONG_NOTES + studentId);
    const ids = new Set(list.map((n) => n.id));
    const merged = [...list];
    for (const row of notes) {
      const m = mapWrongNoteRow(row);
      if (m && !ids.has(m.id)) {
        merged.unshift(m);
        ids.add(m.id);
        pulled++;
      }
    }
    localStorage.setItem(KEYS.WRONG_NOTES + studentId, JSON.stringify(merged.slice(0, 500)));
  }

  const sleeps = await safeSelectEq('sleep_records', studentId);
  if (sleeps.length > 0) {
    const list = readList<SleepLogItem>(KEYS.SLEEP_LOGS + studentId);
    const ids = new Set(list.map((l) => l.id));
    const merged = [...list];
    for (const row of sleeps) {
      const m = mapSleepRow(row);
      if (m && !ids.has(m.id)) {
        merged.unshift(m);
        ids.add(m.id);
        pulled++;
      }
    }
    localStorage.setItem(KEYS.SLEEP_LOGS + studentId, JSON.stringify(merged.slice(0, 500)));
  }

  const habits = await safeSelectEq('habit_diagnoses', studentId);
  if (habits[0]) {
    localStorage.setItem(KEYS.HABIT + studentId, JSON.stringify({
      studentId,
      checkedHabitIds: habits[0].checked_habits || [],
      shockReport: habits[0].shock_report || '',
      updatedAt: habits[0].updated_at || new Date().toISOString(),
    }));
    pulled++;
  }

  const goals = await safeSelectEq('grade_goals', studentId);
  if (goals.length > 0) {
    const list = readList<MobileGradeGoal>(KEYS.GRADE_GOALS + studentId);
    const ids = new Set(list.map((g) => g.id));
    const merged = [...list];
    for (const row of goals) {
      const m = mapGradeGoalRow(row);
      if (m && !ids.has(m.id)) {
        merged.unshift(m);
        ids.add(m.id);
        pulled++;
      }
    }
    localStorage.setItem(KEYS.GRADE_GOALS + studentId, JSON.stringify(merged.slice(0, 200)));
  }

  const sgoal = await safeSelectEq('sleep_goals', studentId);
  if (sgoal[0]) {
    const m = mapSleepGoalRow(sgoal[0]);
    if (m) {
      localStorage.setItem(KEYS.SLEEP_GOALS + studentId, JSON.stringify(m));
      pulled++;
    }
  }

  // assessments는 student_id 컬럼이 없어 전체 최신분에서 본인 것만 선별
  try {
    const { data } = await (supabase.from('assessments' as any) as any)
      .select('id,student_name,student_info,care_type,care_score,analysis_text,created_at')
      .order('created_at', { ascending: false })
      .limit(100);
    if (Array.isArray(data)) {
      const key = KEYS.ASSESSMENTS + studentId;
      const list = readList<MobileAssessmentSummary>(key);
      const ids = new Set(list.map((a) => a.id));
      const merged = [...list];
      for (const row of data as any[]) {
        if (!isOwnAssessment(row, studentId)) continue;
        const m = mapAssessmentSummary(row);
        if (m && !ids.has(m.id)) {
          merged.unshift(m);
          ids.add(m.id);
          pulled++;
        }
      }
      localStorage.setItem(key, JSON.stringify(merged.slice(0, 50)));
    }
  } catch { /* ignore */ }

  // user_tiers는 student_id 대소문자가 PC와 다를 수 있어 전체에서 매칭 (ID 우선, 이름 폴백)
  try {
    const { data } = await (supabase.from('user_tiers' as any) as any)
      .select('student_id,tier,name')
      .limit(500);
    if (Array.isArray(data)) {
      const userName = storedUserName();
      const hit = (data as any[]).find((r) => isOwnTierRow(r, studentId, userName));
      if (hit) {
        const tier = mapPcTier(hit.tier);
        if (tier && applyTierToLocalUser(tier)) {
          pulled++;
          emit('tier', { studentId, tier });
        }
      }
    }
  } catch { /* ignore */ }

  // app_logic_config: 진단 규칙 단일 row (lastModified 최신승, 읽기 전용)
  try {
    const { data } = await (supabase.from('app_logic_config' as any) as any)
      .select('config')
      .eq('id', 'default')
      .limit(1)
      .maybeSingle();
    const remote = (data as any)?.config;
    if (remote?.lastModified) {
      let localLast = '';
      try {
        const raw = localStorage.getItem('sn1_logic_config');
        if (raw) localLast = (JSON.parse(raw) as any)?.lastModified || '';
      } catch { /* ignore */ }
      if (String(remote.lastModified) > localLast) {
        localStorage.setItem('sn1_logic_config', JSON.stringify(remote));
        pulled++;
        emit('logic', { studentId });
      }
    }
  } catch { /* ignore */ }

  if (pulled > 0) emit('remote', { studentId, pulled });
  return pulled;
}
