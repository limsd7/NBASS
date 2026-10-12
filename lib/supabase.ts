/**
 * Supabase Client — 싱글턴 인스턴스 및 동적 연동 매니저
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './supabaseTypes';

const DEFAULT_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || '';
const DEFAULT_KEY = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || '';

/**
 * PC ↔ Android 통합 동기화용 공유 Supabase 프로젝트
 * - android_app/src/lib/supabase.ts 와 반드시 같은 값이어야 합니다.
 * - 한쪽을 바꾸면 다른 쪽도 함께 바꾸세요.
 * - 환경변수(VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)나 오너 대시보드에서
 *   저장한 값이 있으면 그 값이 우선합니다.
 */
export const SHARED_SUPABASE_URL = 'https://qnkbekaaxsgenofnmuab.supabase.co';
export const SHARED_SUPABASE_KEY = 'sb_publishable_v8BiOkwtlXWTPCsLOGOv8A_G_9b8sWE';

export type SupabaseKeyFormat = 'jwt' | 'publishable' | 'secret' | 'invalid';

/** Supabase 키 형식 판별 (구형 JWT anon 키 + 신형 sb_publishable_/sb_secret_ 키 모두 허용) */
export function keyFormat(key?: string | null): SupabaseKeyFormat {
  if (!key) return 'invalid';
  const k = key.trim();
  if (k.startsWith('sb_publishable_') && k.length > 20) return 'publishable';
  if (k.startsWith('sb_secret_') && k.length > 20) return 'secret';
  // Standard Supabase Anon keys are JWT tokens starting with 'ey'
  if (k.startsWith('ey') && k.length > 50) return 'jwt';
  return 'invalid';
}

export function isKeyValid(key?: string | null): boolean {
  return keyFormat(key) !== 'invalid';
}

/** 동기화 대상 테이블 (Realtime 구독·진단 공통) */
export const SYNC_TABLES = [
  'assessments',
  'grade_records',
  'grade_goals',
  'sleep_records',
  'sleep_goals',
  'affiliated_academies',
  'student_schedules',
  'wrong_notes',
  'habit_diagnoses',
  'user_tiers',
] as const;

export interface SyncTableCheck {
  table: string;
  ok: boolean;
  error?: string;
  latencyMs?: number;
}

/** 동기화 테이블 존재·권한 점검 (head 요청이라 행을 읽지 않음) */
export async function checkSyncTables(
  client?: SupabaseClient<any>
): Promise<SyncTableCheck[]> {
  const c: SupabaseClient<any> = client || (supabase as unknown as SupabaseClient<any>);
  const results: SyncTableCheck[] = [];
  for (const table of SYNC_TABLES) {
    const start = Date.now();
    try {
      const { error } = await c.from(table as any).select('*', { count: 'exact', head: true });
      if (!error) {
        results.push({ table, ok: true, latencyMs: Date.now() - start });
      } else {
        results.push({ table, ok: false, error: error.message || error.code, latencyMs: Date.now() - start });
      }
    } catch (err: any) {
      results.push({ table, ok: false, error: err?.message || 'query failed' });
    }
  }
  return results;
}

export function getSupabaseConfig(): { url: string; key: string } {
  const envUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || '';
  const envKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || '';
  const localUrl = typeof localStorage !== 'undefined' ? localStorage.getItem('nbass_supabase_url') : null;
  const localKey = typeof localStorage !== 'undefined' ? localStorage.getItem('nbass_supabase_key') : null;

  return {
    url: localUrl || envUrl || DEFAULT_URL || SHARED_SUPABASE_URL,
    key: localKey || envKey || DEFAULT_KEY || SHARED_SUPABASE_KEY
  };
}

export function isSupabaseReady(): boolean {
  const config = getSupabaseConfig();
  return !!(config.url && isKeyValid(config.key));
}

export function saveSupabaseConfig(url: string, key: string): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('nbass_supabase_url', url.trim());
    localStorage.setItem('nbass_supabase_key', key.trim());
    if (url && key) {
      reinitSupabaseClient(url.trim(), key.trim());
    }
    window.dispatchEvent(new CustomEvent('nbass_supabase_config_changed'));
  }
}

const initialConfig = getSupabaseConfig();

export const isSupabaseConfigured = isSupabaseReady();

export let supabase: SupabaseClient<Database> = createClient<Database>(
  initialConfig.url || SHARED_SUPABASE_URL,
  initialConfig.key || SHARED_SUPABASE_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
    realtime: {
      params: {
        eventsPerSecond: 2,
      },
    },
  }
);

/**
 * 런타임에 클라이언트 재설정
 */
export function reinitSupabaseClient(url: string, key: string): SupabaseClient<Database> {
  supabase = createClient<Database>(url, key, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });
  return supabase;
}

/** 현재 싱글턴 클라이언트 반환 (재초기화 이후에도 항상 최신 인스턴스) */
export function getSupabaseClient(): SupabaseClient<Database> {
  return supabase;
}

/**
 * Supabase 연결 상태 테스트 — 정직한 판정
 * - 키 형식이 유효하지 않으면 즉시 실패 (이전처럼 무조건 성공을 반환하지 않음)
 * - 401/JWT/apikey 오류 = 키 거부 → 실패
 * - 테이블별 점검 결과를 함께 반환해 SQL 미실행을 바로 식별
 */
export async function testSupabaseConnection(customUrl?: string, customKey?: string): Promise<{ success: boolean; message: string; latencyMs?: number; tables?: SyncTableCheck[] }> {
  const targetUrl = (customUrl || getSupabaseConfig().url || '').trim();
  const targetKey = (customKey || getSupabaseConfig().key || '').trim();

  if (!targetUrl || !targetKey) {
    return { success: false, message: 'Supabase URL 또는 API Key가 설정되지 않았습니다.' };
  }
  if (!targetUrl.startsWith('https://')) {
    return { success: false, message: 'URL 형식이 올바르지 않습니다 (https:// 로 시작해야 합니다).' };
  }
  const format = keyFormat(targetKey);
  if (format === 'invalid') {
    return { success: false, message: 'API Key 형식이 올바르지 않습니다. sb_publishable_... 또는 anon(JWT) 키를 입력하세요.' };
  }

  const startTime = Date.now();
  try {
    // 테스트용 일회성 클라이언트: 전역 싱글턴과 auth 저장소를 공유하지 않도록 격리
    // (안 그러면 "Multiple GoTrueClient instances" 경고가 쌓임)
    const client = createClient(targetUrl, targetKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        storageKey: 'nbass-supabase-conn-test',
      },
    });
    const tables = await checkSyncTables(client as any);
    const latencyMs = Date.now() - startTime;
    const ok = tables.filter(t => t.ok);
    const failed = tables.filter(t => !t.ok);
    const authRejected = failed.some(t =>
      /jwt|apikey|401|permission|policy|unauthorized|invalid api key/i.test(t.error || '')
    );
    if (authRejected) {
      return {
        success: false,
        message: `키가 거부되었습니다 (401/RLS). 키를 확인하세요. (${latencyMs}ms)`,
        latencyMs,
        tables
      };
    }
    if (ok.length === 0) {
      const missing = failed.map(t => t.table).join(', ');
      return {
        success: false,
        message: `연결은 되지만 사용 가능한 테이블이 없습니다. SQL 미실행 의심: ${missing} (${latencyMs}ms)`,
        latencyMs,
        tables
      };
    }
    if (failed.length > 0) {
      const missing = failed.map(t => t.table).join(', ');
      return {
        success: true,
        message: `연결됨. ${ok.length}/${tables.length} 테이블 준비, 미생성: ${missing} (${latencyMs}ms)`,
        latencyMs,
        tables
      };
    }
    return { success: true, message: `정상 연결됨 (${tables.length}/${tables.length} 테이블, ${latencyMs}ms)`, latencyMs, tables };
  } catch (err: any) {
    return { success: false, message: err?.message || '연결 실패 (네트워크 또는 키 오류)' };
  }
}

/**
 * 현재 실행 환경 판별
 */
export const isElectron = typeof window !== 'undefined' && !!(window as any).electron;
export const isWeb = !isElectron && typeof window !== 'undefined';

