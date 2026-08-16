/**
 * Supabase Client — 싱글턴 인스턴스
 * 
 * .env.local에 다음 환경변수를 설정하세요:
 *   VITE_SUPABASE_URL=https://xxxxx.supabase.co
 *   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJI...
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from './supabaseTypes';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Supabase가 설정되지 않은 경우 (로컬 Electron 모드)
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder',
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
 * 현재 실행 환경 판별
 */
export const isElectron = typeof window !== 'undefined' && !!(window as any).electron;
export const isWeb = !isElectron && typeof window !== 'undefined';
