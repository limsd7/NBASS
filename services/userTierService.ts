import { MembershipTier } from '../utils/featureGate';
import { logFunnelEvent, getStoredAttribution } from '../utils/utmTracker';

export interface UserTierOverride {
  studentId: string;
  name?: string;
  tier: MembershipTier;
  grantedBy: string; // e.g. 'OWNER'
  updatedAt: string;
  notes?: string;
}

const TIER_OVERRIDES_KEY = 'nbass_user_tier_overrides';

// Default initial overrides (e.g. 연습001 ID: ID-20260820-6RKR -> VIP, 테스터001 -> EXPERT 전권, limsd7 -> PRO)
const INITIAL_OVERRIDES: Record<string, UserTierOverride> = {
  'limsd7': {
    studentId: 'limsd7',
    name: 'limsd7',
    tier: 'pro',
    grantedBy: 'OWNER',
    updatedAt: new Date().toISOString(),
    notes: '오너 승인 PRO 등급 (정밀 진단 1회 스타터 패스)'
  },
  'ID-20260820-6RKR': {
    studentId: 'ID-20260820-6RKR',
    name: '연습001',
    tier: 'expert',
    grantedBy: 'OWNER',
    updatedAt: new Date().toISOString(),
    notes: '오너 특별 승인 (전문가 EXPERT 전 기능 및 오류 검증 모드)'
  },
  '연습001': {
    studentId: 'ID-20260820-6RKR',
    name: '연습001',
    tier: 'expert',
    grantedBy: 'OWNER',
    updatedAt: new Date().toISOString(),
    notes: '오너 특별 승인 (전문가 EXPERT 전 기능 및 오류 검증 모드)'
  },
  'TEST_EXPERT_01': {
    studentId: 'TEST_EXPERT_01',
    name: '오류검증_전문가01',
    tier: 'expert',
    grantedBy: 'OWNER',
    updatedAt: new Date().toISOString(),
    notes: '시스템 취약점 & 기능 오류 검증 전용 EXPERT 계정'
  },
  '오류검증_전문가01': {
    studentId: 'TEST_EXPERT_01',
    name: '오류검증_전문가01',
    tier: 'expert',
    grantedBy: 'OWNER',
    updatedAt: new Date().toISOString(),
    notes: '시스템 취약점 & 기능 오류 검증 전용 EXPERT 계정'
  }
};

export const UserTierService = {
  getOverrides(): Record<string, UserTierOverride> {
    try {
      const saved = localStorage.getItem(TIER_OVERRIDES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Saved owner modifications take precedence over initial presets
        const merged = { ...INITIAL_OVERRIDES, ...parsed };
        // limsd7이 basic 또는 free로 저장되어 있다면 pro로 강제 보정
        if (!merged['limsd7'] || merged['limsd7'].tier === 'basic' || merged['limsd7'].tier === 'free') {
          merged['limsd7'] = INITIAL_OVERRIDES['limsd7'];
        }
        return merged;
      }
      localStorage.setItem(TIER_OVERRIDES_KEY, JSON.stringify(INITIAL_OVERRIDES));
      return { ...INITIAL_OVERRIDES };
    } catch {
      return { ...INITIAL_OVERRIDES };
    }
  },

  saveOverrides(overrides: Record<string, UserTierOverride>): void {
    try {
      localStorage.setItem(TIER_OVERRIDES_KEY, JSON.stringify(overrides));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('nbass_tier_changed', { detail: { overrides } }));
        window.dispatchEvent(new Event('storage'));
      }
    } catch (e) {
      console.error('Failed to save tier overrides:', e);
    }
  },

  getEffectiveTier(
    studentIdOrName?: string | { id?: string; name?: string; email?: string } | null,
    currentTier: MembershipTier = 'free',
    fallbackName?: string,
    fallbackEmail?: string
  ): MembershipTier {
    const overrides = this.getOverrides();

    // 수집할 식별자 목록 (ID, 이름, 이메일, 이메일 아이디 등)
    const candidates: string[] = [];

    if (typeof studentIdOrName === 'string' && studentIdOrName.trim()) {
      candidates.push(studentIdOrName.trim());
    } else if (studentIdOrName && typeof studentIdOrName === 'object') {
      if (studentIdOrName.id?.trim()) candidates.push(studentIdOrName.id.trim());
      if (studentIdOrName.name?.trim()) candidates.push(studentIdOrName.name.trim());
      if (studentIdOrName.email?.trim()) {
        candidates.push(studentIdOrName.email.trim());
        const atIdx = studentIdOrName.email.indexOf('@');
        if (atIdx > 0) candidates.push(studentIdOrName.email.substring(0, atIdx).trim());
      }
    }

    if (fallbackName?.trim()) candidates.push(fallbackName.trim());
    if (fallbackEmail?.trim()) {
      candidates.push(fallbackEmail.trim());
      const atIdx = fallbackEmail.indexOf('@');
      if (atIdx > 0) candidates.push(fallbackEmail.substring(0, atIdx).trim());
    }

    // fallback: 브라우저 환경에서 현재 세션 이메일/사용자 정보도 확인
    if (candidates.length === 0 && typeof window !== 'undefined') {
      try {
        const storedEmail = localStorage.getItem('nbass_current_email');
        if (storedEmail?.trim()) {
          candidates.push(storedEmail.trim());
          const atIdx = storedEmail.indexOf('@');
          if (atIdx > 0) candidates.push(storedEmail.substring(0, atIdx).trim());
        }
        const rawUser = localStorage.getItem('nbass_user') || localStorage.getItem('nbass_student_profile');
        if (rawUser) {
          const parsed = JSON.parse(rawUser);
          if (parsed.id?.trim()) candidates.push(parsed.id.trim());
          if (parsed.name?.trim()) candidates.push(parsed.name.trim());
          if (parsed.email?.trim()) candidates.push(parsed.email.trim());
        }
      } catch { /* ignore */ }
    }

    // 각 후보군에 대해 오버라이드 매칭 검사
    for (const cand of candidates) {
      const cleanKey = cand.toLowerCase();

      // 1. Direct key match
      if (overrides[cand]) {
        return overrides[cand].tier;
      }
      if (overrides[cleanKey]) {
        return overrides[cleanKey].tier;
      }

      // 2. Search by studentId or name (case-insensitive)
      const found = (Object.values(overrides) as UserTierOverride[]).find(
        o => (o.studentId && o.studentId.trim().toLowerCase() === cleanKey) ||
          (o.name && o.name.trim().toLowerCase() === cleanKey)
      );

      if (found) {
        return found.tier;
      }

      // 3. limsd7 계정 특화: 어떠한 경우에도 basic이 아닌 pro 반환
      if (cleanKey === 'limsd7') {
        return 'pro';
      }
    }

    // candidates 중 limsd7이 포함된 경우 안전 보장
    if (candidates.some(c => c.toLowerCase() === 'limsd7')) {
      return 'pro';
    }

    return currentTier;
  },

  setUserTier(studentId: string, tier: MembershipTier, name?: string, notes?: string): void {
    const overrides = this.getOverrides();
    const cleanId = studentId.trim();
    const cleanName = (name?.trim() || overrides[cleanId]?.name || '').trim();
    const now = new Date().toISOString();

    // 유료 전환 이벤트 기록 (free → 유료 등급 승격 시, 광고 퍼널 측정)
    if (tier !== 'free') {
      logFunnelEvent('paid', getStoredAttribution());
    }

    const entry: UserTierOverride = {
      studentId: cleanId,
      name: cleanName,
      tier,
      grantedBy: 'OWNER',
      updatedAt: now,
      notes: notes || '오너 승인 등급 조정'
    };

    overrides[cleanId] = entry;

    if (cleanName) {
      overrides[cleanName] = entry;
    }

    this.saveOverrides(overrides);

    // localStorage 프로필 캐시들(nbass_student_profile, nbass_user 등)도 실시간 일괄 동기화
    if (typeof window !== 'undefined') {
      try {
        const syncKeys = [
          'nbass_student_profile',
          'nbass_user',
          'nbass_last_student_profile',
          `nbass_student_profile_${cleanId.toLowerCase()}`,
          cleanName ? `nbass_student_profile_${cleanName.toLowerCase()}` : null
        ].filter(Boolean) as string[];

        syncKeys.forEach(k => {
          const raw = localStorage.getItem(k);
          if (raw) {
            try {
              const p = JSON.parse(raw);
              p.membershipTier = tier;
              if (p.tier) p.tier = tier;
              localStorage.setItem(k, JSON.stringify(p));
            } catch { /* ignore */ }
          }
        });

        const currUserRaw = localStorage.getItem('nbass_user');
        if (currUserRaw) {
          const u = JSON.parse(currUserRaw);
          if (
            (u.name && u.name.trim().toLowerCase() === cleanName.toLowerCase()) ||
            (u.id && u.id.trim().toLowerCase() === cleanId.toLowerCase()) ||
            (u.email && u.email.trim().toLowerCase() === cleanId.toLowerCase())
          ) {
            u.membershipTier = tier;
            u.tier = tier;
            localStorage.setItem('nbass_user', JSON.stringify(u));
          }
        }
      } catch (err) {
        console.warn('Profile sync error on setUserTier:', err);
      }
    }
  },

  removeUserTier(studentIdOrName: string): void {
    const overrides = this.getOverrides();
    const cleanKey = studentIdOrName.trim();

    const existing = overrides[cleanKey];
    if (existing) {
      delete overrides[cleanKey];
      if (existing.studentId) delete overrides[existing.studentId];
      if (existing.name) delete overrides[existing.name];
    }

    this.saveOverrides(overrides);
  },

  /**
   * PRO (1회 스타터 패스 ₩9,000) 검사 완료 여부 확인
   * studentId, name, email 중 일치하는 식별자가 있거나 PRO 전용 사용 플래그가 있으면 true 반환
   */
  isProAssessmentUsed(
    student?: { id?: string; name?: string; email?: string } | string | null,
    historyList?: Array<{ student?: { id?: string; name?: string } }>
  ): boolean {
    try {
      const candidates: string[] = [];
      if (typeof student === 'string' && student.trim()) {
        candidates.push(student.trim().toLowerCase());
      } else if (student && typeof student === 'object') {
        if (student.id?.trim()) candidates.push(student.id.trim().toLowerCase());
        if (student.name?.trim()) candidates.push(student.name.trim().toLowerCase());
        if (student.email?.trim()) {
          const cleanEmail = student.email.trim().toLowerCase();
          candidates.push(cleanEmail);
          const atIdx = cleanEmail.indexOf('@');
          if (atIdx > 0) candidates.push(cleanEmail.substring(0, atIdx));
        }
      }

      if (typeof window !== 'undefined') {
        const storedEmail = localStorage.getItem('nbass_current_email');
        if (storedEmail?.trim()) {
          const clean = storedEmail.trim().toLowerCase();
          candidates.push(clean);
          const atIdx = clean.indexOf('@');
          if (atIdx > 0) candidates.push(clean.substring(0, atIdx));
        }
      }

      // 1. localStorage 개별 키 검사
      for (const cand of candidates) {
        if (localStorage.getItem(`nbass_pro_used_${cand}`) === 'true') {
          return true;
        }
      }

      // 2. 글로벌 nbass_pro_used 플래그 검사 (현재 세션 브라우저)
      if (localStorage.getItem('nbass_pro_assessment_completed') === 'true') {
        return true;
      }

      // 3. 기록(History) 내 해당 학생의 검사 이력이 존재하는지 확인
      if (historyList && historyList.length > 0 && candidates.length > 0) {
        const hasHistory = historyList.some(h => {
          const hId = h.student?.id?.trim().toLowerCase();
          const hName = h.student?.name?.trim().toLowerCase();
          return (hId && candidates.includes(hId)) || (hName && candidates.includes(hName));
        });
        if (hasHistory) return true;
      }
    } catch {
      /* ignore */
    }
    return false;
  },

  /**
   * PRO 1회 검사 완료 시 호출되어 사용 완료 처리
   */
  markProAssessmentUsed(student?: { id?: string; name?: string; email?: string } | string | null): void {
    try {
      const candidates: string[] = [];
      if (typeof student === 'string' && student.trim()) {
        candidates.push(student.trim().toLowerCase());
      } else if (student && typeof student === 'object') {
        if (student.id?.trim()) candidates.push(student.id.trim().toLowerCase());
        if (student.name?.trim()) candidates.push(student.name.trim().toLowerCase());
        if (student.email?.trim()) {
          const cleanEmail = student.email.trim().toLowerCase();
          candidates.push(cleanEmail);
          const atIdx = cleanEmail.indexOf('@');
          if (atIdx > 0) candidates.push(cleanEmail.substring(0, atIdx));
        }
      }

      if (typeof window !== 'undefined') {
        const storedEmail = localStorage.getItem('nbass_current_email');
        if (storedEmail?.trim()) {
          const clean = storedEmail.trim().toLowerCase();
          candidates.push(clean);
          const atIdx = clean.indexOf('@');
          if (atIdx > 0) candidates.push(clean.substring(0, atIdx));
        }
      }

      for (const cand of candidates) {
        localStorage.setItem(`nbass_pro_used_${cand}`, 'true');
      }
      localStorage.setItem('nbass_pro_assessment_completed', 'true');
      localStorage.setItem('nbass_pro_last_completed_at', new Date().toISOString());

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('nbass_pro_used_changed'));
      }
    } catch {
      /* ignore */
    }
  }
};

