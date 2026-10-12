/**
 * useSupabaseRealtime Hook
 * - 앱 마운트 시 Supabase Realtime 구독 시작 + 초기 Pull 1회
 * - Supabase 설정 변경(nbass_supabase_config_changed) 시 구독 재시작
 * - 온라인 복귀 시 Pull 재실행
 * - Realtime 수신 시 onRemoteChange 콜백 호출 (화면 새로고침용)
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  startSupabaseRealtime,
  stopSupabaseRealtime,
  pullSupabaseToLocal,
  pushLocalToSupabase,
  getSupabaseRealtimeStatus,
  type RealtimeStatus,
  type SupabaseRealtimeEvent,
} from '../services/supabaseRealtimeSync';
import { isSupabaseReady } from '../lib/supabase';

interface Options {
  autoPull?: boolean;
  autoPush?: boolean;
  onRemoteChange?: (e: SupabaseRealtimeEvent) => void;
}

export function useSupabaseRealtime(options: Options = {}) {
  const { autoPull = true, autoPush = false, onRemoteChange } = options;
  const [status, setStatus] = useState<RealtimeStatus>(() => getSupabaseRealtimeStatus());
  const [configured, setConfigured] = useState(() => isSupabaseReady());
  const [lastEvent, setLastEvent] = useState<SupabaseRealtimeEvent | null>(null);
  const [syncing, setSyncing] = useState(false);
  const cbRef = useRef(onRemoteChange);
  cbRef.current = onRemoteChange;

  const refresh = useCallback(async () => {
    if (!isSupabaseReady()) return { pulled: 0, perTable: {} };
    setSyncing(true);
    try {
      return await pullSupabaseToLocal();
    } finally {
      setSyncing(false);
    }
  }, []);

  const push = useCallback(async () => {
    if (!isSupabaseReady()) return { pushed: 0 };
    setSyncing(true);
    try {
      return await pushLocalToSupabase();
    } finally {
      setSyncing(false);
    }
  }, []);

  useEffect(() => {
    let stop: (() => void) | null = null;

    const boot = async () => {
      setConfigured(isSupabaseReady());
      stop = startSupabaseRealtime((e) => {
        setLastEvent(e);
        cbRef.current?.(e);
      });
      setStatus(getSupabaseRealtimeStatus());
      if (autoPull && isSupabaseReady()) {
        // 초기 Pull은 구독 확립과 경합하지 않도록 약간 지연
        setTimeout(() => {
          void pullSupabaseToLocal().catch(() => undefined);
        }, 800);
      }
      if (autoPush && isSupabaseReady()) {
        setTimeout(() => {
          void pushLocalToSupabase().catch(() => undefined);
        }, 1500);
      }
    };

    void boot();

    const handleStatus = (ev: Event) => {
      const detail = (ev as CustomEvent)?.detail;
      if (detail?.status) setStatus(detail.status as RealtimeStatus);
      else setStatus(getSupabaseRealtimeStatus());
    };
    const handleConfigChanged = () => {
      setConfigured(isSupabaseReady());
      try {
        stop?.();
      } catch {
        /* ignore */
      }
      stopSupabaseRealtime();
      void boot();
    };
    const handleOnline = () => {
      if (isSupabaseReady()) void pullSupabaseToLocal().catch(() => undefined);
    };

    window.addEventListener('nbass_supabase_realtime_status', handleStatus);
    window.addEventListener('nbass_supabase_config_changed', handleConfigChanged);
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('nbass_supabase_realtime_status', handleStatus);
      window.removeEventListener('nbass_supabase_config_changed', handleConfigChanged);
      window.removeEventListener('online', handleOnline);
      try {
        stop?.();
      } catch {
        /* ignore */
      }
    };
  }, [autoPull, autoPush]);

  return {
    status,
    configured,
    connected: status === 'connected',
    lastEvent,
    syncing,
    refresh,
    push,
  };
}

export default useSupabaseRealtime;
