/**
 * useNbassRemoteRefresh
 * - Supabase Realtime/원격 Pull로 localStorage가 바뀌면 화면을 다시 읽도록 합니다.
 * - dataSyncService가 발행하는 window 'nbass_data_updated' 이벤트를 구독합니다.
 * - 로컬 저장 후에도 같은 이벤트가 발행되므로 reload는 멱등해야 합니다.
 * - types를 지정하면 해당 detail.type (또는 'remote') 일 때만 reload합니다.
 */
import { useEffect, useRef } from 'react';

export function useNbassRemoteRefresh(reload: () => void, types?: string[]): void {
  const ref = useRef(reload);
  ref.current = reload;
  const typesRef = useRef(types);
  typesRef.current = types;

  useEffect(() => {
    const handler = (e: Event) => {
      try {
        const t = typesRef.current;
        if (t && t.length > 0) {
          const detailType = (e as CustomEvent)?.detail?.type;
          if (!t.includes(detailType)) return;
        }
        ref.current();
      } catch {
        /* ignore */
      }
    };
    window.addEventListener('nbass_data_updated', handler);
    return () => {
      window.removeEventListener('nbass_data_updated', handler);
    };
  }, []);
}

export default useNbassRemoteRefresh;
