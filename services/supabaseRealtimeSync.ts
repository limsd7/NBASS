/**
 * Supabase Realtime 양방향 동기화 엔진
 * ------------------------------------------------------------------
 * 기존 구조는 "로컬(IndexedDB) → Supabase 단방향 푸시"만 있었고,
 * Supabase Realtime 구독(channel/postgres_changes)이 전혀 없었습니다.
 *
 * 이 모듈이 제공하는 것:
 *  1) Realtime 구독 — assessments / grade_records / grade_goals /
 *     sleep_records / sleep_goals / affiliated_academies 테이블의
 *     INSERT / UPDATE / DELETE를 실시간 수신 → IndexedDB/localStorage에 반영
 *  2) 초기 Pull — 앱 시작 시 Supabase → 로컬로 누락분 내려받기
 *  3) Push 보완 — database.ts의 기존 푸시와 함께 동작하며 echo는
 *     supabasePushGuard로 억제 (무한 루프 방지)
 *
 * 사용법:
 *   import { startSupabaseRealtime, pullSupabaseToLocal } from './supabaseRealtimeSync';
 *   const stop = startSupabaseRealtime();
 *   await pullSupabaseToLocal();
 *
 * 이벤트 알림:
 *   - 데이터 변경: window 'nbass_supabase_realtime' (detail: { table, eventType, at })
 *   - 연결 상태:   window 'nbass_supabase_realtime_status' (detail: { status })
 *   - 로컬 갱신:   window 'nbass_local_data_changed' (detail: { source: 'supabase-realtime' })
 */

import { supabase, isSupabaseReady } from '../lib/supabase';
import { db } from './database';
import { markSupabasePushed, isSupabasePushEcho, assessmentSig } from './supabasePushGuard';
import { safeStorage } from '../utils/safeStorage';
import type { RealtimeChannel } from '@supabase/supabase-js';

export type RealtimeTable =
  | 'assessments'
  | 'grade_records'
  | 'grade_goals'
  | 'sleep_records'
  | 'sleep_goals'
  | 'affiliated_academies'
  | 'student_schedules'
  | 'wrong_notes'
  | 'habit_diagnoses'
  | 'user_tiers'
  | 'app_logic_config';

export type RealtimeEventType = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

export interface SupabaseRealtimeEvent {
  table: RealtimeTable;
  eventType: Exclude<RealtimeEventType, '*'>;
  newRow: any | null;
  oldRow: any | null;
  at: string;
}

export type RealtimeStatus =
  | 'disabled' // Supabase 미설정 (로컬 전용 모드)
  | 'connecting'
  | 'connected'
  | 'error'
  | 'closed';

const CHANNEL_NAME = 'nbass-realtime-v1';
const TABLES: RealtimeTable[] = [
  'assessments',
  'grade_records',
  'grade_goals',
  'sleep_records',
  'sleep_goals',
  'affiliated_academies',
  // Android 공용 테이블 (PC는 수신·병합, 스케줄 저장은 Android 모양 그대로 보관)
  'student_schedules',
  'wrong_notes',
  'habit_diagnoses',
  // 등급 동기화 테이블 (오너 오버라이드 ↔ Android)
  'user_tiers',
  // 진단 규칙 동기화 테이블 (오너 커스텀 → 전 기기)
  'app_logic_config',
];

let channel: RealtimeChannel | null = null;
let channelClient: any = null;
let started = false;
let status: RealtimeStatus = 'disabled';
let lastEvent: SupabaseRealtimeEvent | null = null;
const listeners = new Set<(e: SupabaseRealtimeEvent) => void>();

function emitDomEvent(name: string, detail: unknown): void {
  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(name, { detail }));
    }
  } catch {
    /* ignore */
  }
}

function setStatus(next: RealtimeStatus): void {
  status = next;
  emitDomEvent('nbass_supabase_realtime_status', { status: next, at: new Date().toISOString() });
}

export function getSupabaseRealtimeStatus(): RealtimeStatus {
  return status;
}

export function getLastSupabaseRealtimeEvent(): SupabaseRealtimeEvent | null {
  return lastEvent;
}

export function onSupabaseRealtimeEvent(cb: (e: SupabaseRealtimeEvent) => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

// ---------------------------------------------------------------------------
// Supabase row → 로컬 레코드 매핑
// ---------------------------------------------------------------------------

function mapAssessmentRowToHistory(row: any): any {
  const student = (row.student_info as any) || {};
  return {
    supabaseId: row.id,
    student: {
      id: student.id || student.customId || row.student_name || `remote-${String(row.id).slice(0, 8)}`,
      name: student.name || row.student_name || '미지정',
      ...student,
    },
    survey: row.survey_data || {},
    hrv: row.hrv_data || {},
    protocol: row.protocol_data || {},
    analytics: row.analytics_data || undefined,
    classificationResult: row.classification_result || undefined,
    careType: row.care_type || 'Type-1',
    score: Number(row.care_score ?? 0),
    studyEfficiencyResults: row.study_efficiency_data || undefined,
    analysisText: row.analysis_text || '',
    date: row.created_at || new Date().toISOString(),
    syncStatus: 'synced' as const,
  };
}

// Android quality(TEXT) → PC sleepQuality(1-5)
function androidQualityToNumber(q: unknown): number | undefined {
  if (q === 'GOOD') return 5;
  if (q === 'NORMAL') return 3;
  if (q === 'POOR') return 1;
  return undefined;
}

// Android scores(SubjectScore[]) → PC subjects(SubjectGrade[]) 최선 매핑
function androidScoresToSubjects(scores: unknown): any[] {
  if (!Array.isArray(scores)) return [];
  return scores.map((s: any) => ({
    subjectId: s?.subject ?? '',
    rawScore: s?.score,
    grade: s?.grade,
    percentile: s?.percentile,
  }));
}

function mapGradeRecordRow(row: any): any {
  const subjects = Array.isArray(row.subjects) && row.subjects.length > 0
    ? row.subjects
    : androidScoresToSubjects(row.scores);
  return {
    id: String(row.id),
    studentId: row.student_id,
    examName: row.exam_name,
    examType: row.exam_type || 'mock_exam',
    examDate: row.exam_date,
    subjects,
    memo: row.memo || '',
    createdAt: row.created_at || new Date().toISOString(),
    // Android 원본 보존 (재푸시 시 소실 방지)
    ...(Array.isArray(row.scores) ? { scores: row.scores } : {}),
  };
}

function mapGradeGoalRow(row: any): any {
  return {
    id: String(row.id),
    studentId: row.student_id,
    subjectId: row.subject_id,
    tier1Target: row.tier1_target,
    tier2Target: row.tier2_target,
    tier3Target: row.tier3_target,
    currentGrade: row.current_grade,
    memo: row.memo || '',
  };
}

function mapSleepRecordRow(row: any): any {
  return {
    id: String(row.id),
    studentId: row.student_id,
    date: typeof row.date === 'string' ? row.date.slice(0, 10) : row.date,
    bedtime: row.bedtime ?? row.bed_time,
    wakeTime: row.wake_time,
    sleepQuality: row.sleep_quality ?? androidQualityToNumber(row.quality) ?? 3,
    memo: row.memo || '',
    createdAt: row.created_at || new Date().toISOString(),
    stages: row.stages || undefined,
    nightHrv: row.night_hrv ?? undefined,
    screenTimeBeforeBed: row.screen_time ?? undefined,
    sleepDelay: row.sleep_delay ?? undefined,
    // Android 원본 보존 (재푸시 시 소실 방지)
    ...(row.bed_time !== undefined ? { bed_time: row.bed_time } : {}),
    ...(row.quality !== undefined ? { quality: row.quality } : {}),
    ...(row.total_hours !== undefined && row.total_hours !== null ? { totalHours: Number(row.total_hours) } : {}),
    ...(row.sleep_debt_hours !== undefined && row.sleep_debt_hours !== null ? { sleepDebtHours: Number(row.sleep_debt_hours) } : {}),
  };
}

/**
 * Android wrong_notes row → PC 오답노트 모양으로 최선 매핑.
 * PC WrongNote와 필드가 달라 source:'android' 태그를 붙여 구분합니다.
 */
function mapAndroidWrongNoteToPc(row: any): any {
  const unit = row.unit_name || '';
  const qno = row.question_number || '';
  return {
    id: String(row.id),
    subject: row.subject || '',
    questionTitle: [unit, qno].filter(Boolean).join(' ') || row.question_title || '오답노트',
    wrongAnswer: row.error_reason || '',
    correctAnswer: row.correct_answer || '',
    explanation: row.memo || row.explanation || '',
    difficulty: row.difficulty || '중',
    isResolved: !!row.is_resolved,
    createdAt: row.created_at || new Date().toISOString(),
    source: 'android',
    studentId: row.student_id,
    unitName: unit || undefined,
    questionNumber: qno || undefined,
    aiPrescription: row.ai_prescription || undefined,
    imageUrl: row.image_url || undefined,
  };
}

function scheduleStorageKey(studentId: string): string {
  return `nbass_schedules_${studentId}`;
}

function habitStorageKey(studentId: string): string {
  return `nbass_habit_diag_${studentId}`;
}

const PC_WRONG_NOTES_KEY = 'nbass_wrong_notes';

function readPcWrongNotes(): any[] {
  try {
    const raw = localStorage.getItem(PC_WRONG_NOTES_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function writePcWrongNotes(items: any[]): void {
  safeStorage.saveJSON(PC_WRONG_NOTES_KEY, items as never);
}

/** Android 오답 1건을 PC 전역 오답 목록에 병합 (id 기준 upsert) */
function mergeAndroidWrongNote(row: any): void {
  if (!row?.id) return;
  const mapped = mapAndroidWrongNoteToPc(row);
  const list = readPcWrongNotes();
  const idx = list.findIndex((n: any) => n?.id === mapped.id);
  if (idx >= 0) list[idx] = { ...list[idx], ...mapped };
  else list.unshift(mapped);
  writePcWrongNotes(list.slice(0, 500));
}

function removePcWrongNote(id: string): void {
  const list = readPcWrongNotes();
  const next = list.filter((n: any) => n?.id !== id || n?.source !== 'android');
  if (next.length !== list.length) writePcWrongNotes(next);
}

function mapSleepGoalRow(row: any): any {
  return {
    id: String(row.id),
    studentId: row.student_id,
    targetBedtime: row.target_bedtime,
    targetWakeTime: row.target_wake_time,
    targetDuration: row.target_duration,
    memo: row.memo || '',
    currentStreak: row.current_streak || 0,
    longestStreak: row.longest_streak || 0,
    conditionScore: row.condition_score || 0,
    isDdayMode: !!row.is_dday_mode,
    dDayDate: row.dday_date || undefined,
    dDayTargetWakeTime: row.dday_target_wake_time || undefined,
  };
}

function notifyLocalChanged(): void {
  emitDomEvent('nbass_local_data_changed', { source: 'supabase-realtime', at: new Date().toISOString() });
}

// ---------------------------------------------------------------------------
// 기지 학생 필터 (#2 — 타 학생 데이터 혼입 차단)
// 로컬에 아는 학생이 하나도 없으면(최초 실행) 전체 허용(부트스트랩),
// 하나라도 있으면 해당 학생의 row만 병합합니다.
// ---------------------------------------------------------------------------

interface KnownStudents {
  ids: Set<string>;
  names: Set<string>;
}

let knownCache: { at: number; keys: KnownStudents } | null = null;
const KNOWN_TTL_MS = 30_000;

export async function getKnownStudentKeys(): Promise<KnownStudents> {
  const now = Date.now();
  if (knownCache && now - knownCache.at < KNOWN_TTL_MS) return knownCache.keys;
  const ids = new Set<string>();
  const names = new Set<string>();
  try {
    const [grades, gradeGoals, sleeps, sleepGoals, hist] = await Promise.all([
      db.gradeRecords.toArray().catch(() => []),
      db.gradeGoals.toArray().catch(() => []),
      db.sleepRecords.toArray().catch(() => []),
      db.sleepGoals.toArray().catch(() => []),
      db.history.limit(500).toArray().catch(() => []),
    ]);
    for (const g of [...grades, ...gradeGoals, ...sleeps, ...sleepGoals] as any[]) {
      if (g?.studentId) ids.add(String(g.studentId));
    }
    for (const h of hist as any[]) {
      if (h?.student?.id) ids.add(String(h.student.id));
      if (h?.student?.customId) ids.add(String(h.student.customId));
      if (h?.student?.name) names.add(String(h.student.name).trim());
    }
  } catch {
    /* ignore */
  }
  knownCache = { at: now, keys: { ids, names } };
  return knownCache.keys;
}

function studentIdRowMatches(row: any, keys: KnownStudents): boolean {
  if (keys.ids.size === 0) return true; // 부트스트랩: 아는 학생이 없으면 허용
  const sid = row?.student_id;
  return !!sid && keys.ids.has(String(sid));
}

function assessmentRowMatches(row: any, keys: KnownStudents): boolean {
  if (keys.ids.size === 0 && keys.names.size === 0) return true;
  const si = (row?.student_info as any) || {};
  if (si?.id && keys.ids.has(String(si.id))) return true;
  if (si?.customId && keys.ids.has(String(si.customId))) return true;
  const nm = row?.student_name || si?.name;
  if (nm && keys.names.has(String(nm).trim())) return true;
  return false;
}

function assessmentRowSig(row: any): string {
  const si = (row?.student_info as any) || {};
  return assessmentSig(si?.id ?? null, si?.testDate ?? null, row?.care_score ?? null, row?.care_type ?? null);
}

// ---------------------------------------------------------------------------
// sn1_history 미러 동기화 (Realtime Pull이 Dexie만 갱신하면 미러가 stale해짐)
// ---------------------------------------------------------------------------

async function syncHistoryMirror(): Promise<void> {
  try {
    const latest = await db.history.orderBy('date').reverse().limit(50).toArray().catch(() => []);
    safeStorage.saveJSON('sn1_history', latest as never);
  } catch {
    /* ignore */
  }
}

// ---------------------------------------------------------------------------
// Realtime 수신 → 로컬 반영
// ---------------------------------------------------------------------------

async function applyRemoteEvent(evt: SupabaseRealtimeEvent): Promise<void> {
  const row = evt.newRow || evt.oldRow;
  const remoteId: string | undefined = row?.id ? String(row.id) : undefined;

  // 자신이 방금 푸시한 내용의 echo는 무시
  if (remoteId && isSupabasePushEcho(evt.table, remoteId)) return;

  // 기지 학생 필터 + assessments 서명 echo 검사
  try {
    const keys = await getKnownStudentKeys();
    if (evt.table === 'assessments') {
      if (evt.eventType !== 'DELETE' && row) {
        if (isSupabasePushEcho(evt.table, assessmentRowSig(row))) return;
        if (!assessmentRowMatches(row, keys)) return;
      }
    } else if (evt.table !== 'affiliated_academies' && evt.table !== 'app_logic_config') {
      // student_id 검증이 불가능하면 병합하지 않음 (타 학생 혼입 차단)
      if (!row?.student_id || !studentIdRowMatches(row, keys)) return;
    }
  } catch {
    /* 필터 실패 시 진행 (가용성 우선) */
  }

  try {
    switch (evt.table) {
      case 'assessments': {
        if (evt.eventType === 'DELETE') {
          if (remoteId) {
            const targets = await db.history.toArray();
            const hit = targets.find((r: any) => r.supabaseId === remoteId);
            if (hit?.id) await db.history.delete(hit.id);
          }
        } else if (row) {
          const mapped = mapAssessmentRowToHistory(row);
          const all = await db.history.toArray();
          const dup = all.find(
            (r: any) =>
              r.supabaseId === remoteId ||
              (r.student?.id === mapped.student.id &&
                r.student?.testDate === mapped.student.testDate &&
                (r.score || 0) === (mapped.score || 0) &&
                r.careType === mapped.careType)
          );
          if (!dup) {
            await db.history.add(mapped);
          } else if ((dup as any).supabaseId !== remoteId && remoteId) {
            await db.history.update(dup.id!, { syncStatus: 'synced', ...( { supabaseId: remoteId } as any) });
          }
        }
        break;
      }
      case 'grade_records': {
        if (evt.eventType === 'DELETE') {
          if (row?.id) await db.gradeRecords.delete(String(row.id)).catch(() => undefined);
        } else if (row?.id) {
          await db.gradeRecords.put(mapGradeRecordRow(row)).catch(() => undefined);
        }
        break;
      }
      case 'grade_goals': {
        if (evt.eventType === 'DELETE') {
          if (row?.id) await db.gradeGoals.delete(String(row.id)).catch(() => undefined);
        } else if (row?.id) {
          await db.gradeGoals.put(mapGradeGoalRow(row)).catch(() => undefined);
        }
        break;
      }
      case 'sleep_records': {
        if (evt.eventType === 'DELETE') {
          if (row?.id) await db.sleepRecords.delete(String(row.id)).catch(() => undefined);
        } else if (row?.id) {
          await db.sleepRecords.put(mapSleepRecordRow(row)).catch(() => undefined);
        }
        break;
      }
      case 'sleep_goals': {
        if (evt.eventType === 'DELETE') {
          if (row?.id) await db.sleepGoals.delete(String(row.id)).catch(() => undefined);
        } else if (row?.id) {
          await db.sleepGoals.put(mapSleepGoalRow(row)).catch(() => undefined);
        }
        break;
      }
      case 'affiliated_academies': {
        // affiliated_academies는 localStorage 기반이므로 변경 신호만 보낸다.
        // 실제 목록 갱신은 AffiliatedAcademyService.fetchFromSupabase()가 담당한다.
        try {
          const { AffiliatedAcademyService } = await import('./affiliatedAcademyService');
          await AffiliatedAcademyService.fetchFromSupabase().catch(() => undefined);
        } catch {
          /* ignore */
        }
        break;
      }
      case 'student_schedules': {
        // Android 스케줄 (student_id 기준 통째 교체 — PC는 이 키를 렌더에 쓰지 않음)
        const sid = row?.student_id;
        if (evt.eventType === 'DELETE') {
          if (sid && !isSupabasePushEcho(evt.table, `sched:${sid}`)) {
            try {
              localStorage.removeItem(scheduleStorageKey(sid));
            } catch {
              /* ignore */
            }
          }
        } else if (sid && Array.isArray(row?.schedules)) {
          if (!isSupabasePushEcho(evt.table, `sched:${sid}`)) {
            safeStorage.saveJSON(scheduleStorageKey(sid), row.schedules as never);
          }
        }
        break;
      }
      case 'wrong_notes': {
        if (evt.eventType === 'DELETE') {
          if (row?.id) removePcWrongNote(String(row.id));
        } else if (row?.id) {
          mergeAndroidWrongNote(row);
        }
        break;
      }
      case 'habit_diagnoses': {
        // PC에 습관 진단 UI 저장소가 없어 원본 그대로 보관 (키 규칙은 Android와 동일)
        const sid = row?.student_id;
        if (evt.eventType === 'DELETE') {
          if (sid) {
            try {
              localStorage.removeItem(habitStorageKey(sid));
            } catch {
              /* ignore */
            }
          }
        } else if (sid) {
          safeStorage.saveJSON(habitStorageKey(sid), {
            studentId: sid,
            checkedHabitIds: row.checked_habits || [],
            shockReport: row.shock_report || '',
            updatedAt: row.updated_at || new Date().toISOString(),
          } as never);
        }
        break;
      }
      case 'user_tiers': {
        // 등급 변경 수신 → 로컬 오버라이드에 병합 (saveOverrides가 nbass_tier_changed 발행)
        try {
          const { UserTierService } = await import('./userTierService');
          const sid = row?.student_id?.trim();
          if (evt.eventType === 'DELETE') {
            if (sid && !isSupabasePushEcho(evt.table, UserTierService.tierPushKey(sid))) {
              UserTierService.removeUserTier(sid);
            }
          } else if (sid) {
            if (isSupabasePushEcho(evt.table, UserTierService.tierPushKey(sid))) break;
            const raw = localStorage.getItem('nbass_user_tier_overrides');
            const saved = raw ? JSON.parse(raw) : {};
            const entry = {
              studentId: sid,
              name: row.name || '',
              tier: row.tier || 'free',
              grantedBy: row.granted_by || 'OWNER',
              updatedAt: row.updated_at || new Date().toISOString(),
              notes: row.notes || 'Supabase 동기화 등급',
            };
            saved[sid] = entry;
            if (entry.name) saved[entry.name] = entry;
            UserTierService.saveOverrides(saved);
          }
        } catch {
          /* ignore */
        }
        break;
      }
      case 'app_logic_config': {
        // 진단 규칙 변경 수신 → lastModified 비교 후 로컬에 병합 (푸시 없음)
        try {
          if (evt.eventType !== 'DELETE' && row?.config?.lastModified) {
            const { isSupabasePushEcho: isEcho } = await import('./supabasePushGuard');
            if (!isEcho('app_logic_config', 'logic:default')) {
              let localLast = '';
              try {
                const raw = localStorage.getItem('sn1_logic_config');
                if (raw) localLast = (JSON.parse(raw) as any)?.lastModified || '';
              } catch { /* ignore */ }
              if (String(row.config.lastModified) > localLast) {
                localStorage.setItem('sn1_logic_config', JSON.stringify(row.config));
                emitDomEvent('nbass_logic_config_changed', { source: 'supabase-realtime', at: new Date().toISOString() });
              }
            }
          }
        } catch {
          /* ignore */
        }
        break;
      }
    }
  } catch (err) {
    console.warn('[SupabaseRealtime] apply failed:', evt.table, evt.eventType, err);
    return;
  }

  lastEvent = evt;
  listeners.forEach((cb) => {
    try {
      cb(evt);
    } catch {
      /* ignore */
    }
  });
  emitDomEvent('nbass_supabase_realtime', evt);
  notifyLocalChanged();
}

// ---------------------------------------------------------------------------
// 구독 시작 / 중지
// ---------------------------------------------------------------------------

/**
 * Supabase Realtime 구독을 시작합니다. 멱등적이며, Supabase 미설정 시 noop를 반환합니다.
 * @returns 구독 해제 함수
 */
export function startSupabaseRealtime(
  onEvent?: (e: SupabaseRealtimeEvent) => void
): () => void {
  if (onEvent) listeners.add(onEvent);

  if (started && channel) {
    return () => {
      if (onEvent) listeners.delete(onEvent);
    };
  }

  if (!isSupabaseReady()) {
    setStatus('disabled');
    return () => {
      if (onEvent) listeners.delete(onEvent);
    };
  }

  try {
    setStatus('connecting');
    // 기존 채널 정리 후 재생성 (설정 변경 대응 — 채널을 만든 클라이언트로 정리)
    try {
      channel?.unsubscribe();
    } catch {
      /* ignore */
    }
    try {
      if (channel) (channelClient || supabase).removeChannel(channel);
    } catch {
      /* ignore */
    }

    const ch = supabase.channel(CHANNEL_NAME);
    for (const table of TABLES) {
      ch.on(
        'postgres_changes' as any,
        { event: '*', schema: 'public', table },
        (payload: any) => {
          const eventType = (payload?.eventType || '*') as SupabaseRealtimeEvent['eventType'];
          if (eventType !== 'INSERT' && eventType !== 'UPDATE' && eventType !== 'DELETE') return;
          const evt: SupabaseRealtimeEvent = {
            table,
            eventType,
            newRow: payload?.new ?? null,
            oldRow: payload?.old ?? null,
            at: new Date().toISOString(),
          };
          void applyRemoteEvent(evt);
        }
      );
    }

    ch.subscribe((s: string) => {
      if (s === 'SUBSCRIBED') {
        started = true;
        setStatus('connected');
      } else if (s === 'CHANNEL_ERROR' || s === 'TIMED_OUT') {
        setStatus('error');
      } else if (s === 'CLOSED') {
        setStatus('closed');
        started = false;
      }
    });
    channel = ch;
    channelClient = supabase;
  } catch (err) {
    console.warn('[SupabaseRealtime] subscribe failed:', err);
    setStatus('error');
  }

  return () => {
    if (onEvent) listeners.delete(onEvent);
    // 마지막 리스너까지 모두 해제되면 채널도 정리
    if (listeners.size === 0) stopSupabaseRealtime();
  };
}

export function stopSupabaseRealtime(): void {
  try {
    channel?.unsubscribe();
  } catch {
    /* ignore */
  }
  try {
    if (channel) (channelClient || supabase).removeChannel(channel);
  } catch {
    /* ignore */
  }
  channel = null;
  channelClient = null;
  started = false;
  // Supabase 미설정이면 disabled, 그 외에는 closed
  setStatus(isSupabaseReady() ? 'closed' : 'disabled');
}

/** Supabase 설정 변경(키 입력/저장) 시 구독을 재시작합니다. */
export function restartSupabaseRealtime(): void {
  stopSupabaseRealtime();
  listeners.clear();
  startSupabaseRealtime();
}

// ---------------------------------------------------------------------------
// 초기 Pull: Supabase → 로컬 (누락분만 병합, 로컬 삭제 없음)
// ---------------------------------------------------------------------------

export interface PullResult {
  pulled: number;
  perTable: Partial<Record<RealtimeTable, number>>;
}

async function safeSelect(table: RealtimeTable, orderCol = 'updated_at'): Promise<any[]> {
  try {
    const { data, error } = await (supabase.from(table as any) as any)
      .select('*')
      .order(orderCol, { ascending: false })
      .limit(500);
    if (!error && Array.isArray(data)) return data as any[];
  } catch {
    /* fallback below */
  }
  // updated_at이 없는 구(舊) 테이블 대비 created_at 폴백
  try {
    const { data } = await (supabase.from(table as any) as any)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);
    if (Array.isArray(data)) return data as any[];
  } catch {
    /* ignore */
  }
  try {
    const { data } = await (supabase.from(table as any) as any).select('*').limit(500);
    if (Array.isArray(data)) return data as any[];
  } catch {
    /* ignore */
  }
  return [];
}

/**
 * 모바일 전용 학생코드/이름으로 assessments를 직접 가져오기.
 * pullSupabaseToLocal의 기지-학생 필터에 걸려 누락되는 모바일 신규학생용.
 * 사용자가 코드를 직접 입력한 명시적 요청이므로 필터를 우회한다 (해당 코드 일치행만).
 */
export async function pullAssessmentsByStudentCode(code: string): Promise<{ added: number; matched: number }> {
  const result = { added: 0, matched: 0 };
  const target = (code || '').trim();
  if (!target || !isSupabaseReady()) return result;
  try {
    const { data, error } = await (supabase.from('assessments' as any) as any)
      .select('id,student_name,student_info,survey_data,hrv_data,protocol_data,analytics_data,classification_result,care_type,care_score,study_efficiency_data,analysis_text,status,created_at,updated_at')
      .or(`student_name.eq.${target},student_info->>id.eq.${target},student_info->>customId.eq.${target}`)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error || !Array.isArray(data)) return result;
    result.matched = data.length;
    if (data.length === 0) return result;
    const existing = await db.history.toArray().catch(() => []);
    const has = (remoteId: string, m: any) =>
      (existing as any[]).some(
        (r: any) =>
          r.supabaseId === remoteId ||
          (r.student?.id === m.student.id &&
            r.student?.testDate === m.student.testDate &&
            (r.score || 0) === (m.score || 0) &&
            r.careType === m.careType)
      );
    for (const row of data) {
      if (!row?.id) continue;
      const mapped = mapAssessmentRowToHistory(row);
      if (!has(String(row.id), mapped)) {
        try {
          await db.history.add(mapped);
          result.added++;
        } catch {
          /* duplicate race — ignore */
        }
      }
    }
    if (result.added > 0) {
      knownCache = null; // 기지-학생 캐시 무효화 (가져온 학생을 즉시 인식)
      await syncHistoryMirror();
      notifyLocalChanged();
    }
  } catch (err) {
    console.warn('[SupabaseRealtime] pull by code failed:', err);
  }
  return result;
}

export async function pullSupabaseToLocal(): Promise<PullResult> {  const perTable: Partial<Record<RealtimeTable, number>> = {};
  if (!isSupabaseReady()) return { pulled: 0, perTable };
  const keys = await getKnownStudentKeys().catch(() => ({ ids: new Set<string>(), names: new Set<string>() }));

  // 1) assessments → history (중복 제외하고 누락분만 추가)
  // eeg_data는 앱에서 읽지 않으므로 제외 (원시 파형 대용량 전송 방지)
  const ASSESSMENT_PULL_COLUMNS = 'id,student_name,student_info,survey_data,hrv_data,protocol_data,analytics_data,classification_result,care_type,care_score,study_efficiency_data,analysis_text,status,created_at,updated_at';
  const selectAssessments = async (): Promise<any[]> => {
    try {
      const { data, error } = await (supabase.from('assessments' as any) as any)
        .select(ASSESSMENT_PULL_COLUMNS)
        .order('updated_at', { ascending: false })
        .limit(500);
      if (!error && Array.isArray(data)) return data as any[];
    } catch {
      /* fallback below */
    }
    return safeSelect('assessments');
  };
  try {
    const rows = await selectAssessments();
    if (rows.length > 0) {
      const existing = await db.history.toArray();
      const has = (remoteId: string, m: any) =>
        existing.some(
          (r: any) =>
            r.supabaseId === remoteId ||
            (r.student?.id === m.student.id &&
              r.student?.testDate === m.student.testDate &&
              (r.score || 0) === (m.score || 0) &&
              r.careType === m.careType)
        );
      let added = 0;
      for (const row of rows) {
        if (!row?.id) continue;
        if (!assessmentRowMatches(row, keys)) continue;
        const mapped = mapAssessmentRowToHistory(row);
        if (!has(String(row.id), mapped)) {
          try {
            await db.history.add(mapped);
            added++;
          } catch {
            /* duplicate race — ignore */
          }
        }
      }
      if (added > 0) {
        perTable.assessments = added;
        await syncHistoryMirror();
      }
    }
  } catch (err) {
    console.warn('[SupabaseRealtime] pull assessments failed:', err);
  }

  // 2) grade_records / grade_goals (id 기준 upsert — 원격이 최신이라 가정)
  try {
    const rows = await safeSelect('grade_records');
    let n = 0;
    for (const row of rows) {
      if (!row?.id || !row?.student_id) continue;
      if (!studentIdRowMatches(row, keys)) continue;
      try {
        await db.gradeRecords.put(mapGradeRecordRow(row));
        n++;
      } catch {
        /* ignore */
      }
    }
    if (n > 0) perTable.grade_records = n;
  } catch (err) {
    console.warn('[SupabaseRealtime] pull grade_records failed:', err);
  }

  try {
    const rows = await safeSelect('grade_goals');
    let n = 0;
    for (const row of rows) {
      if (!row?.id || !row?.student_id) continue;
      if (!studentIdRowMatches(row, keys)) continue;
      try {
        await db.gradeGoals.put(mapGradeGoalRow(row));
        n++;
      } catch {
        /* ignore */
      }
    }
    if (n > 0) perTable.grade_goals = n;
  } catch (err) {
    console.warn('[SupabaseRealtime] pull grade_goals failed:', err);
  }

  // 3) sleep_records / sleep_goals
  try {
    const rows = await safeSelect('sleep_records');
    let n = 0;
    for (const row of rows) {
      if (!row?.id || !row?.student_id) continue;
      if (!studentIdRowMatches(row, keys)) continue;
      try {
        await db.sleepRecords.put(mapSleepRecordRow(row));
        n++;
      } catch {
        /* ignore */
      }
    }
    if (n > 0) perTable.sleep_records = n;
  } catch (err) {
    console.warn('[SupabaseRealtime] pull sleep_records failed:', err);
  }

  try {
    const rows = await safeSelect('sleep_goals');
    let n = 0;
    for (const row of rows) {
      if (!row?.id || !row?.student_id) continue;
      if (!studentIdRowMatches(row, keys)) continue;
      try {
        await db.sleepGoals.put(mapSleepGoalRow(row));
        n++;
      } catch {
        /* ignore */
      }
    }
    if (n > 0) perTable.sleep_goals = n;
  } catch (err) {
    console.warn('[SupabaseRealtime] pull sleep_goals failed:', err);
  }

  // 4) affiliated_academies → localStorage (서비스 경유)
  try {
    const { AffiliatedAcademyService } = await import('./affiliatedAcademyService');
    await AffiliatedAcademyService.fetchFromSupabase().catch(() => undefined);
  } catch {
    /* ignore */
  }

  // 5) student_schedules → localStorage (Android 모양 그대로, student_id별 통째 보관)
  try {
    const rows = await safeSelect('student_schedules');
    let n = 0;
    for (const row of rows) {
      if (!row?.student_id || !Array.isArray(row?.schedules)) continue;
      if (!studentIdRowMatches(row, keys)) continue;
      try {
        safeStorage.saveJSON(scheduleStorageKey(row.student_id), row.schedules as never);
        n++;
      } catch {
        /* ignore */
      }
    }
    if (n > 0) perTable.student_schedules = n;
  } catch (err) {
    console.warn('[SupabaseRealtime] pull student_schedules failed:', err);
  }

  // 6) wrong_notes → PC 전역 오답 목록에 병합
  try {
    const rows = await safeSelect('wrong_notes');
    let n = 0;
    for (const row of rows) {
      if (!row?.id) continue;
      if (row?.student_id && !studentIdRowMatches(row, keys)) continue;
      try {
        mergeAndroidWrongNote(row);
        n++;
      } catch {
        /* ignore */
      }
    }
    if (n > 0) perTable.wrong_notes = n;
  } catch (err) {
    console.warn('[SupabaseRealtime] pull wrong_notes failed:', err);
  }

  // 7) habit_diagnoses → 원본 그대로 보관 (Android와 동일 키)
  try {
    const rows = await safeSelect('habit_diagnoses');
    let n = 0;
    for (const row of rows) {
      if (!row?.student_id) continue;
      if (!studentIdRowMatches(row, keys)) continue;      try {
        safeStorage.saveJSON(habitStorageKey(row.student_id), {
          studentId: row.student_id,
          checkedHabitIds: row.checked_habits || [],
          shockReport: row.shock_report || '',
          updatedAt: row.updated_at || new Date().toISOString(),
        } as never);
        n++;
      } catch {
        /* ignore */
      }
    }
    if (n > 0) perTable.habit_diagnoses = n;
  } catch (err) {
    console.warn('[SupabaseRealtime] pull habit_diagnoses failed:', err);
  }

  // 8) user_tiers → 로컬 오버라이드 병합 (echo 제외)
  try {
    const { UserTierService } = await import('./userTierService');
    const pulled_n = await UserTierService.pullTiersFromSupabase().catch(() => 0);
    if (pulled_n > 0) perTable.user_tiers = pulled_n;
  } catch (err) {
    console.warn('[SupabaseRealtime] pull user_tiers failed:', err);
  }

  // 9) app_logic_config → 로컬 규칙 병합 (lastModified 최신승)
  try {
    const { pullLogicConfigFromSupabase } = await import('../logicEngine');
    const applied = await pullLogicConfigFromSupabase().catch(() => false);
    if (applied) perTable.app_logic_config = 1;
  } catch (err) {
    console.warn('[SupabaseRealtime] pull app_logic_config failed:', err);
  }

  const pulled = Object.values(perTable).reduce((a, b) => a + (b || 0), 0);
  if (pulled > 0) notifyLocalChanged();
  return { pulled, perTable };
}

// ---------------------------------------------------------------------------
// Push 보완: 로컬 미동기화분 → Supabase (echo 억제 마킹 포함)
// ---------------------------------------------------------------------------

export interface PushResult {
  pushed: number;
}

export async function pushLocalToSupabase(): Promise<PushResult> {
  if (!isSupabaseReady()) return { pushed: 0 };
  let pushed = 0;
  try {
    const { DatabaseService } = await import('./database');
    // assessments 미동기화분 (기존 로직 재사용)
    try {
      const r = await DatabaseService.autoSyncAllToSupabase().catch(() => ({ synced: 0 }));
      pushed += (r as any)?.synced || 0;
    } catch {
      /* ignore */
    }
    // 성적/수면 전수 upsert (멱등 — 변경 없어도 덮어쓰므로 안전)
    try {
      const grades = await db.gradeRecords.toArray().catch(() => []);
      for (const g of grades) {
        try {
          const ok = await (DatabaseService as any).syncGradeRecordToSupabase(g);
          if (ok) {
            pushed++;
            markSupabasePushed('grade_records', (g as any).id);
          }
        } catch {
          /* ignore */
        }
      }
    } catch {
      /* ignore */
    }
    try {
      const goals = await db.gradeGoals.toArray().catch(() => []);
      for (const g of goals) {
        try {
          const ok = await (DatabaseService as any).syncGradeGoalToSupabase(g);
          if (ok) {
            pushed++;
            markSupabasePushed('grade_goals', (g as any).id);
          }
        } catch {
          /* ignore */
        }
      }
    } catch {
      /* ignore */
    }
    try {
      const sleeps = await db.sleepRecords.toArray().catch(() => []);
      for (const s of sleeps) {
        try {
          const ok = await (DatabaseService as any).syncSleepRecordToSupabase(s);
          if (ok) {
            pushed++;
            markSupabasePushed('sleep_records', (s as any).id);
          }
        } catch {
          /* ignore */
        }
      }
    } catch {
      /* ignore */
    }
    try {
      const sgoals = await db.sleepGoals.toArray().catch(() => []);
      for (const s of sgoals) {
        try {
          const ok = await (DatabaseService as any).syncSleepGoalToSupabase(s);
          if (ok) {
            pushed++;
            markSupabasePushed('sleep_goals', (s as any).id);
          }
        } catch {
          /* ignore */
        }
      }
    } catch {
      /* ignore */
    }
  } catch (err) {
    console.warn('[SupabaseRealtime] push failed:', err);
  }
  return { pushed };
}

// ---------------------------------------------------------------------------
// PC 스케줄 → Android (ScheduleBlock[] → 모바일 ScheduleItem[] 변환 푸시)
// ---------------------------------------------------------------------------

const PC_BLOCK_COLORS: Record<string, string> = {
  study: 'bg-indigo-100 text-indigo-900 border-indigo-300',
  break: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  school: 'bg-slate-100 text-slate-900 border-slate-300',
  academy: 'bg-blue-100 text-blue-900 border-blue-300',
  routine: 'bg-amber-100 text-amber-900 border-amber-300',
  sleep: 'bg-purple-100 text-purple-900 border-purple-300',
  meal: 'bg-orange-100 text-orange-900 border-orange-300',
};

export function pcBlocksToMobileItems(studentId: string, blocks: any[]): any[] {
  if (!Array.isArray(blocks)) return [];
  return blocks.map((b: any) => ({
    id: String(b?.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`),
    studentId,
    startTime: b?.startTime ?? '',
    endTime: b?.endTime ?? '',
    subject: b?.subjectName || b?.title || '',
    activity: b?.description || b?.title || '',
    color: PC_BLOCK_COLORS[b?.type] || 'bg-slate-100 text-slate-900 border-slate-300',
    isCompleted: !!b?.completed,
  }));
}

/** PC 타임테이블 블록을 모바일 모양으로 변환해 student_schedules에 통째 upsert */
export async function pushPcScheduleBlocks(studentId: string, blocks: any[]): Promise<boolean> {
  try {
    if (!isSupabaseReady() || !studentId || !Array.isArray(blocks) || blocks.length === 0) return false;
    const items = pcBlocksToMobileItems(studentId, blocks);
    const { error } = await (supabase.from('student_schedules' as any) as any).upsert(
      { student_id: studentId, schedules: items, updated_at: new Date().toISOString() },
      { onConflict: 'student_id' } as any
    );
    if (!error) markSupabasePushed('student_schedules', `sched:${studentId}`);
    return !error;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// PC 오답노트 → wrong_notes (studentId가 있는 PC 원본만 푸시)
// ---------------------------------------------------------------------------

function mapPcWrongNoteToRow(note: any): any | null {
  if (!note?.id || !note?.studentId) return null;
  return {
    id: String(note.id),
    student_id: String(note.studentId),
    subject: note.subject || '',
    question_title: note.questionTitle || '',
    wrong_answer: note.wrongAnswer || '',
    correct_answer: note.correctAnswer || '',
    explanation: note.explanation || '',
    difficulty: note.difficulty || '',
    memo: note.explanation || '',
    is_resolved: !!note.isResolved,
    created_at: note.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

/** PC 오답 목록 중 Android에서 온 것(source:'android')을 제외하고 푸시 */
export async function pushPcWrongNotes(notes: any[]): Promise<number> {
  if (!isSupabaseReady() || !Array.isArray(notes) || notes.length === 0) return 0;
  const rows = notes
    .filter((n: any) => n && (n as any).source !== 'android')
    .map(mapPcWrongNoteToRow)
    .filter((r: any) => !!r);
  if (rows.length === 0) return 0;
  try {
    const { error } = await (supabase.from('wrong_notes' as any) as any).upsert(rows, { onConflict: 'id' } as any);
    if (error) return 0;
    rows.forEach((r: any) => markSupabasePushed('wrong_notes', r.id));
    return rows.length;
  } catch {
    return 0;
  }
}

/** PC에서 삭제된 오답 1건을 Supabase에서도 삭제 */
export async function deletePcWrongNote(id: string): Promise<boolean> {
  if (!isSupabaseReady() || !id) return false;
  try {
    const { error } = await (supabase.from('wrong_notes' as any) as any).delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}
