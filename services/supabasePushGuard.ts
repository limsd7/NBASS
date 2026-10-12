/**
 * Supabase Push Echo Guard
 * - 로컬 → Supabase 푸시 직후 되돌아오는 Realtime echo 이벤트로 인한 무한 루프 방지용.
 * - database.ts(푸시 측)와 supabaseRealtimeSync.ts(수신 측)가 공유하며, 의존성이 없어 순환참조가 없습니다.
 */

const pushedAt = new Map<string, number>();
const TTL_MS = 15_000;

function key(table: string, id: string): string {
  return `${table}:${id}`;
}

export function markSupabasePushed(table: string, id?: string | number | null): void {
  if (id === undefined || id === null || id === '') return;
  pushedAt.set(key(table, String(id)), Date.now());
  // 오래된 항목 정리 (메모리 누수 방지)
  if (pushedAt.size > 1000) {
    const now = Date.now();
    for (const [k, t] of pushedAt) {
      if (now - t > TTL_MS) pushedAt.delete(k);
    }
  }
}

export function isSupabasePushEcho(table: string, id?: string | number | null): boolean {
  if (id === undefined || id === null || id === '') return false;
  const t = pushedAt.get(key(table, String(id)));
  if (!t) return false;
  if (Date.now() - t > TTL_MS) {
    pushedAt.delete(key(table, String(id)));
    return false;
  }
  return true;
}

export function clearSupabasePushGuard(): void {
  pushedAt.clear();
}

/**
 * assessments 중복 방지용 서명.
 * insert는 서버 발급 UUID를 받기 전이라 id로 echo를 못 잡으므로,
 * 푸시 시작 시점에 서명을 등록하고, Realtime 수신 측에서 같은 서명으로 대조합니다.
 */
export function assessmentSig(
  studentId?: string | null,
  testDate?: string | null,
  score?: number | string | null,
  careType?: string | null
): string {
  return `assess:${studentId || ''}|${testDate || ''}|${score ?? ''}|${careType || ''}`;
}
