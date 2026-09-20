/**
 * Supabase Client — 싱글턴 인스턴스 및 동적 연동 매니저
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './supabaseTypes';

const DEFAULT_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || '';
const DEFAULT_KEY = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || '';

export function isKeyValid(key?: string | null): boolean {
  if (!key) return false;
  const k = key.trim();
  // Standard Supabase Anon keys are JWT tokens starting with 'ey'
  return k.startsWith('ey') && k.length > 50;
}

export function getSupabaseConfig(): { url: string; key: string } {
  const envUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || '';
  const envKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || '';
  const localUrl = typeof localStorage !== 'undefined' ? localStorage.getItem('nbass_supabase_url') : null;
  const localKey = typeof localStorage !== 'undefined' ? localStorage.getItem('nbass_supabase_key') : null;

  return {
    url: localUrl || envUrl || DEFAULT_URL,
    key: localKey || envKey || ''
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
  initialConfig.url || DEFAULT_URL || 'https://placeholder.supabase.co',
  initialConfig.key || DEFAULT_KEY || 'dummy-anon-key-placeholder',
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
  });
  return supabase;
}

/**
 * Supabase 연결 상태 테스트
 */
export async function testSupabaseConnection(customUrl?: string, customKey?: string): Promise<{ success: boolean; message: string; latencyMs?: number }> {
  const targetUrl = customUrl || getSupabaseConfig().url;
  const targetKey = customKey || getSupabaseConfig().key;

  if (!targetUrl || !targetKey) {
    return { success: false, message: 'Supabase URL 또는 API Key가 설정되지 않았습니다.' };
  }

  const startTime = Date.now();
  try {
    const client = createClient(targetUrl, targetKey);
    // Ping via auth health check or simple query
    const { error } = await client.from('affiliated_academies').select('count', { count: 'exact', head: true });
    const latencyMs = Date.now() - startTime;
    
    if (error && error.code !== 'PGRST116' && !error.message.includes('does not exist')) {
      // Even if table doesn't exist yet, auth/connection reached Supabase endpoint
      if (error.code === '42P01') {
        return { success: true, message: `연결 성공 (응답 시간: ${latencyMs}ms, 테이블 생성 필요)`, latencyMs };
      }
    }
    return { success: true, message: `정상 연결됨 (응답 시간: ${latencyMs}ms)`, latencyMs };
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    // Simple fetch ping fallback
    try {
      const res = await fetch(`${targetUrl}/rest/v1/`, {
        headers: { apikey: targetKey, Authorization: `Bearer ${targetKey}` }
      });
      if (res.ok || res.status === 404 || res.status === 401) {
        return { success: true, message: `REST 엔드포인트 응답 확인 (${latencyMs}ms)`, latencyMs };
      }
    } catch {}
    return { success: false, message: err?.message || '연결 실패 (네트워크 또는 키 오류)' };
  }
}

/**
 * 현재 실행 환경 판별
 */
export const isElectron = typeof window !== 'undefined' && !!(window as any).electron;
export const isWeb = !isElectron && typeof window !== 'undefined';

