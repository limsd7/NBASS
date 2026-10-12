/**
 * Session Lifecycle Manager
 * 
 * 브라우저 재시작 시 자동 로그아웃을 보장하기 위한 세션 수명 주기 관리 모듈.
 * - sessionStorage는 브라우저를 완전히 닫으면 자동으로 파기됩니다.
 * - 브라우저를 새로 열었을 때 sessionStorage에 세션 플래그가 없으면 이전 세션의 localStorage 잔여 로그인 정보를 즉시 초기화합니다.
 * - 같은 세션 내에서 F5(새로고침)나 페이지 이동 시에는 sessionStorage가 유지되므로 로그아웃되지 않습니다.
 */

const SESSION_ALIVE_KEY = 'nbass_session_alive';

export const sessionManager = {
  /**
   * 앱 및 랜딩 초기 마운트 시 브라우저 세션 유효성을 검증하고,
   * 브라우저 재시작(새 브라우저 실행)으로 세션이 끊겼을 경우 잔여 로그인 상태를 자동 정리합니다.
   */
  initSession(): void {
    if (typeof window === 'undefined') return;

    try {
      const isAlive = window.sessionStorage.getItem(SESSION_ALIVE_KEY);
      if (!isAlive) {
        // 새 브라우저 창/세션이 열림 -> 이전 localStorage의 로그인 세션 정보 초기화
        const hadActiveLogin =
          localStorage.getItem('nbass_current_role') ||
          localStorage.getItem('nbass_current_email') ||
          localStorage.getItem('nbass_user') ||
          localStorage.getItem('nbass_active_role');

        if (hadActiveLogin) {
          localStorage.removeItem('nbass_current_role');
          localStorage.removeItem('nbass_current_email');
          localStorage.removeItem('nbass_user');
          localStorage.removeItem('nbass_student_profile');
          localStorage.removeItem('nbass_assessment_mode');
          localStorage.removeItem('nbass_active_role');
          localStorage.removeItem('nbass_is_owner');
        }

        // 현재 브라우저 탭 세션을 활성 상태로 등록
        window.sessionStorage.setItem(SESSION_ALIVE_KEY, 'true');
      }
    } catch (e) {
      console.warn('[sessionManager] Session init check failed:', e);
    }
  },

  /**
   * 명시적 로그인 성공 시 현재 브라우저 세션을 활성 상태로 기록
   */
  markSessionActive(): void {
    if (typeof window === 'undefined') return;
    try {
      window.sessionStorage.setItem(SESSION_ALIVE_KEY, 'true');
    } catch (e) {
      /* ignore */
    }
  },

  /**
   * 명시적 로그아웃 시 세션 플래그 및 로그인 데이터 모두 정리
   */
  clearSession(): void {
    if (typeof window === 'undefined') return;
    try {
      window.sessionStorage.removeItem(SESSION_ALIVE_KEY);
      window.sessionStorage.clear();
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.startsWith('nbass_current_') ||
          key.startsWith('nbass_active_') ||
          key.startsWith('nbass_student_profile') ||
          (key.startsWith('nbass_user') && key !== 'nbass_user_tier_overrides') ||
          key.startsWith('nbass_last_student_profile') ||
          key.startsWith('nbass_pro_used_') ||
          key === 'nbass_is_owner' ||
          key === 'nbass_assessment_mode' ||
          key === 'nbass_pro_assessment_completed'
        )) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch (e) {
      /* ignore */
    }
  }
};
