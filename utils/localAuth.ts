import { safeStorage } from './safeStorage';

// 로컬 폴백 자격증명 저장소 (Supabase 미설정 시 only)
// UI 변경 없음. 평문 비밀번호 저장 금지, 단순 해시만 보관.

const CRED_PREFIX = 'nbass_local_cred_';

const hash = (s: string): string => {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return `h${(h >>> 0).toString(36)}`;
};

export const verifyOrEnrollLocalCredential = (email: string, password: string, isSignUp: boolean): { ok: boolean; reason?: string } => {
  const clean = email.trim().toLowerCase();
  if (!clean || password.length < 4) return { ok: false, reason: '이메일과 4자 이상 비밀번호를 입력해 주세요.' };
  const key = `${CRED_PREFIX}${clean}`;
  const stored = safeStorage.getItem(key);
  const digest = hash(`${clean}:${password}`);
  if (isSignUp) {
    if (stored) return { ok: false, reason: '이미 등록된 이메일입니다. 로그인을 이용해 주세요.' };
    safeStorage.setItem(key, digest);
    return { ok: true };
  }
  if (!stored) {
    // 기존 데이터 호환: 최초 1회만 등록 후 통과 (이후부터 검증)
    safeStorage.setItem(key, digest);
    return { ok: true };
  }
  if (stored !== digest) return { ok: false, reason: '비밀번호가 일치하지 않습니다.' };
  return { ok: true };
};
