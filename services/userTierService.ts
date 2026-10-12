import { MembershipTier, normalizeTier } from '../utils/featureGate';
import { logFunnelEvent, getStoredAttribution } from '../utils/utmTracker';
import { safeStorage } from '../utils/safeStorage';
import { supabase, isSupabaseReady } from '../lib/supabase';
import { markSupabasePushed, isSupabasePushEcho } from './supabasePushGuard';

export interface UserTierOverride {
  studentId: string;
  name?: string;
  tier: MembershipTier;
  grantedBy: string; // e.g. 'OWNER'
  updatedAt: string;
  notes?: string;
}

const TIER_OVERRIDES_KEY = 'nbass_user_tier_overrides';

// 디스크 포화 대비 메모리 폴백 (동일 세션 내 등급 유지용, 새로고침 시 소멸)
let memoryOverrides: Record<string, UserTierOverride> | null = null;

// 테스트 시드는 별도 파일로 분리 (파일肥大 방지, 프로덕션 하드코딩 제거)
import { TIER_SEED_OVERRIDES } from '../data/tierSeed';
const INITIAL_OVERRIDES: Record<string, UserTierOverride> = TIER_SEED_OVERRIDES;

export const UserTierService = {
  cleanupLegacyBasicTiers(): void {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(TIER_OVERRIDES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        let changed = false;
        for (const k of Object.keys(parsed)) {
          if (parsed[k]?.tier === 'basic' || (parsed[k]?.tier as string)?.toLowerCase() === 'basic') {
            parsed[k].tier = 'free';
            changed = true;
          }
        }
        if (changed) {
          localStorage.setItem(TIER_OVERRIDES_KEY, JSON.stringify(parsed));
        }
      }

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.startsWith('nbass_student_profile') ||
          key === 'nbass_user' ||
          key === 'nbass_last_student_profile'
        )) {
          try {
            const val = localStorage.getItem(key);
            if (val) {
              const obj = JSON.parse(val);
              let objChanged = false;
              if (obj.membershipTier === 'basic' || (obj.membershipTier as string)?.toLowerCase() === 'basic') {
                obj.membershipTier = 'free';
                objChanged = true;
              }
              if (obj.tier === 'basic' || (obj.tier as string)?.toLowerCase() === 'basic') {
                obj.tier = 'free';
                objChanged = true;
              }
              if (objChanged) {
                localStorage.setItem(key, JSON.stringify(obj));
              }
            }
          } catch { }
        }
      }
    } catch { }
  },

  getOverrides(): Record<string, UserTierOverride> {
    try {
      this.cleanupLegacyBasicTiers();
      const saved = localStorage.getItem(TIER_OVERRIDES_KEY);
      const raw: Record<string, UserTierOverride> = saved
        ? { ...INITIAL_OVERRIDES, ...JSON.parse(saved) }
        : { ...INITIAL_OVERRIDES };
      // 디스크 포화 시 메모리에 보관된 최신분을 우선 병합 (세션 내 등급 유지)
      const merged = memoryOverrides ? { ...raw, ...memoryOverrides } : raw;

      // 모든 오버라이드 등급 정규화 (basic/vip 등 제거)
      const sanitized: Record<string, UserTierOverride> = {};
      for (const [k, v] of Object.entries(merged)) {
        sanitized[k] = {
          ...v,
          tier: normalizeTier(v.tier)
        };
      }
      return sanitized;
    } catch {
      return { ...INITIAL_OVERRIDES };
    }
  },

  saveOverrides(overrides: Record<string, UserTierOverride>): void {
    // 메모리에는 항상 최신 보관 (디스크 포화 시에도 세션 내 등급 유지)
    memoryOverrides = { ...overrides };
    // Quota 초과 시에도 예외를 던지지 않음 (앱 크래시 방지) — safeStorage가 실패를 조용히 처리
    safeStorage.saveJSON(TIER_OVERRIDES_KEY, overrides as never);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('nbass_tier_changed', { detail: { overrides } }));
      window.dispatchEvent(new Event('storage'));
    }
  },

  tierPushKey(studentId: string): string {
    return `tier:${studentId}`;
  },

  /**
   * 등급 오버라이드 1건을 Supabase user_tiers에 푸시 (PC → 클라우드 → Android)
   * fire-and-forget. 성공 시 echo 가드에 등록합니다.
   */
  async pushTierToSupabase(studentId: string, entry: UserTierOverride): Promise<boolean> {
    try {
      if (!isSupabaseReady()) return false;
      const { error } = await (supabase.from('user_tiers' as any) as any).upsert({
        student_id: studentId,
        tier: entry.tier,
        name: entry.name || null,
        granted_by: entry.grantedBy || 'OWNER',
        notes: entry.notes || null,
        updated_at: new Date().toISOString()
      }, { onConflict: 'student_id' } as any);
      if (!error) markSupabasePushed('user_tiers', this.tierPushKey(studentId));
      return !error;
    } catch {
      return false;
    }
  },

  /** 로컬 오버라이드 전체를 Supabase에 푸시 (신규 기기 부트스트랩/마이그레이션용) */
  async pushAllOverridesToSupabase(): Promise<number> {
    if (!isSupabaseReady()) return 0;
    let n = 0;
    try {
      const overrides = this.getOverrides();
      const seen = new Set<string>();
      for (const entry of Object.values(overrides) as UserTierOverride[]) {
        const sid = entry?.studentId?.trim();
        if (!sid || seen.has(sid)) continue;
        seen.add(sid);
        const ok = await this.pushTierToSupabase(sid, entry).catch(() => false);
        if (ok) n++;
      }
    } catch { /* ignore */ }
    return n;
  },

  async deleteTierFromSupabase(studentId: string): Promise<boolean> {
    try {
      if (!isSupabaseReady() || !studentId) return false;
      const { error } = await (supabase.from('user_tiers' as any) as any).delete().eq('student_id', studentId);
      return !error;
    } catch {
      return false;
    }
  },

  /**
   * Supabase user_tiers → 로컬 오버라이드 병합 (클라우드 → PC)
   * 자신이 방금 푸시한 echo는 건너뜁니다. 병합 후 nbass_tier_changed를 발행해 UI를 갱신합니다.
   */
  async pullTiersFromSupabase(): Promise<number> {
    if (!isSupabaseReady()) return 0;
    try {
      const { data } = await (supabase.from('user_tiers' as any) as any)
        .select('*')
        .limit(500);
      if (!Array.isArray(data) || data.length === 0) return 0;
      const raw = localStorage.getItem(TIER_OVERRIDES_KEY);
      const saved = raw ? JSON.parse(raw) : {};
      let n = 0;
      for (const row of data as any[]) {
        const sid = row?.student_id?.trim();
        if (!sid || isSupabasePushEcho('user_tiers', this.tierPushKey(sid))) continue;
        const entry: UserTierOverride = {
          studentId: sid,
          name: row.name || '',
          tier: row.tier || 'free',
          grantedBy: row.granted_by || 'OWNER',
          updatedAt: row.updated_at || new Date().toISOString(),
          notes: row.notes || 'Supabase 동기화 등급'
        };
        saved[sid] = entry;
        if (entry.name) saved[entry.name] = entry;
        n++;
      }
      if (n > 0) this.saveOverrides(saved);
      return n;
    } catch {
      return 0;
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

    // 각 후보군에 대해 오버라이드 매칭 검사 (레거시 'vip' 저장값은 'premium'으로 정규화)
    for (const cand of candidates) {
      const cleanKey = cand.toLowerCase();

      // 1. Direct key match
      if (overrides[cand]) {
        return normalizeTier(overrides[cand].tier);
      }
      if (overrides[cleanKey]) {
        return normalizeTier(overrides[cleanKey].tier);
      }

      // 2. Search by studentId or name (case-insensitive)
      const found = (Object.values(overrides) as UserTierOverride[]).find(
        o => (o.studentId && o.studentId.trim().toLowerCase() === cleanKey) ||
          (o.name && o.name.trim().toLowerCase() === cleanKey)
      );

      if (found) {
        return normalizeTier(found.tier);
      }
    }

    return normalizeTier(currentTier);
  },

  setUserTier(studentId: string, tier: MembershipTier, name?: string, notes?: string, email?: string): void {
    const overrides = this.getOverrides();
    const cleanId = studentId.trim();
    const cleanName = (name?.trim() || overrides[cleanId]?.name || '').trim();
    const cleanEmail = (email?.trim() || '').toLowerCase();
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
    overrides[cleanId.toLowerCase()] = entry;

    if (cleanName) {
      overrides[cleanName] = entry;
      overrides[cleanName.toLowerCase()] = entry;
    }

    if (cleanEmail) {
      overrides[cleanEmail] = entry;
      const atIdx = cleanEmail.indexOf('@');
      if (atIdx > 0) {
        overrides[cleanEmail.substring(0, atIdx)] = entry;
      }
    }

    this.saveOverrides(overrides);
    // 백그라운드 클라우드 푸시 (Android 실시간 반영)
    this.pushTierToSupabase(cleanId, entry).catch(() => undefined);

    // localStorage 프로필 캐시들(nbass_student_profile, nbass_user 등)도 실시간 일괄 동기화
    if (typeof window !== 'undefined') {
      try {
        const syncKeys = [
          'nbass_student_profile',
          'nbass_user',
          'nbass_last_student_profile',
          `nbass_student_profile_${cleanId.toLowerCase()}`,
          cleanName ? `nbass_student_profile_${cleanName.toLowerCase()}` : null,
          cleanEmail ? `nbass_student_profile_${cleanEmail}` : null
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
            (u.email && u.email.trim().toLowerCase() === cleanId.toLowerCase()) ||
            (cleanEmail && u.email && u.email.trim().toLowerCase() === cleanEmail)
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
    const lower = cleanKey.toLowerCase();

    const existing = overrides[cleanKey] || overrides[lower];
    if (existing) {
      // 팬아웃된 모든 별칭을 함께 제거 (고아 키 방지)
      for (const k of Object.keys(overrides)) {
        const v = overrides[k];
        if (v === existing || v?.studentId === existing.studentId) {
          delete overrides[k];
        }
        if (k.toLowerCase() === lower) delete overrides[k];
      }
    } else {
      delete overrides[cleanKey];
      delete overrides[lower];
    }

    this.saveOverrides(overrides);
    // 클라우드에서도 삭제 (Android 반영)
    if (existing?.studentId) {
      this.deleteTierFromSupabase(existing.studentId).catch(() => undefined);
    } else if (cleanKey) {
      this.deleteTierFromSupabase(cleanKey).catch(() => undefined);
    }
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

      // student 객체에 명시적 식별자(name, email, id)가 전혀 없을 때만 storedEmail을 보조 후보로 참조
      if (candidates.length === 0 && typeof window !== 'undefined') {
        const storedEmail = localStorage.getItem('nbass_current_email');
        if (storedEmail?.trim()) {
          const clean = storedEmail.trim().toLowerCase();
          candidates.push(clean);
          const atIdx = clean.indexOf('@');
          if (atIdx > 0) candidates.push(clean.substring(0, atIdx));
        }
      }

      // 식별자가 전혀 없으면 신규/비식별 사용자이므로 미완료(false)로 반환
      if (candidates.length === 0) {
        return false;
      }

      // 1. localStorage 개별 키 검사 (nbass_pro_used_${cand})
      for (const cand of candidates) {
        if (localStorage.getItem(`nbass_pro_used_${cand}`) === 'true') {
          return true;
        }
      }

      // 2. 기록(History) 내 해당 학생의 검사 이력이 존재하는지 확인
      if (historyList && historyList.length > 0) {
        const hasHistory = historyList.some(h => {
          const hId = h.student?.id?.trim().toLowerCase();
          const hName = h.student?.name?.trim().toLowerCase();
          const hEmail = (h.student as any)?.email?.trim().toLowerCase();
          return (hId && candidates.includes(hId)) || 
                 (hName && candidates.includes(hName)) || 
                 (hEmail && candidates.includes(hEmail));
        });
        if (hasHistory) return true;
      }

      // 3. 로컬스토리지 내 nbass_history / sn1_history 확인
      if (typeof window !== 'undefined') {
        const storageKeys = ['nbass_history', 'sn1_history'];
        for (const sk of storageKeys) {
          const raw = localStorage.getItem(sk);
          if (raw) {
            try {
              const list = JSON.parse(raw);
              if (Array.isArray(list) && list.length > 0) {
                const match = list.some((h: any) => {
                  const hId = h.student?.id?.trim().toLowerCase();
                  const hName = h.student?.name?.trim().toLowerCase();
                  const hEmail = h.student?.email?.trim().toLowerCase();
                  return (hId && candidates.includes(hId)) || 
                         (hName && candidates.includes(hName)) || 
                         (hEmail && candidates.includes(hEmail));
                });
                if (match) return true;
              }
            } catch { /* ignore */ }
          }
        }

        // 4. 단일 최신 결과(nbass_assessment_result) 확인
        const singleRaw = localStorage.getItem('nbass_assessment_result');
        if (singleRaw) {
          try {
            const single = JSON.parse(singleRaw);
            if (single) {
              const hId = single.student?.id?.trim().toLowerCase();
              const hName = single.student?.name?.trim().toLowerCase();
              const hEmail = single.student?.email?.trim().toLowerCase();
              if ((hId && candidates.includes(hId)) || 
                  (hName && candidates.includes(hName)) || 
                  (hEmail && candidates.includes(hEmail))) {
                return true;
              }
            }
          } catch { /* ignore */ }
        }
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
      // 전역 플래그는 세션 힌트로만 유지 (타학생 판정에 단독 사용 금지)
      localStorage.setItem('nbass_pro_last_completed_at', new Date().toISOString());

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('nbass_pro_used_changed'));
      }
    } catch {
      /* ignore */
    }
  }
};

