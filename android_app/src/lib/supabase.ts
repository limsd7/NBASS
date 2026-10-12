import { createClient, SupabaseClient } from '@supabase/supabase-js';

// PC ↔ Android 통합 동기화용 공유 Supabase 프로젝트.
// PC의 lib/supabase.ts → SHARED_SUPABASE_URL/SHARED_SUPABASE_KEY 와 반드시 같은 값이어야 합니다.
// 한쪽을 바꾸면 다른 쪽도 함께 바꾸세요. (통합 마이그레이션: supabase_unified_migration.sql)
const SUPABASE_URL = 'https://qnkbekaaxsgenofnmuab.supabase.co';
const SUPABASE_KEY = 'sb_publishable_v8BiOkwtlXWTPCsLOGOv8A_G_9b8sWE';

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export const isSupabaseConnected = true;

/** 하드코딩된 공유 프로젝트 기준 항상 true. PC와 같은 isSupabaseReady() 시그니처용. */
export function isSupabaseReady(): boolean {
  return !!(SUPABASE_URL && SUPABASE_KEY);
}
