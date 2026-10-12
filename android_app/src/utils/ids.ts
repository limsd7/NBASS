/**
 * 신규 레코드 ID 발급.
 * Supabase 공용 테이블의 id가 TEXT이므로 어떤 문자열도 저장되지만,
 * PC와 형식을 맞추기 위해 가능한 경우 UUID를 발급합니다.
 * (crypto.randomUUID 미지원 환경에서는 prefix+시간+난수 폴백 — TEXT라 저장에는 문제없음)
 */
export function newRecordId(prefix: string): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch {
    /* fallback below */
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export default newRecordId;
