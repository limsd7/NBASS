import { UserProfile, MembershipTier } from '../types';
import { supabase } from '../lib/supabase';
import { dataSyncService } from './dataSyncService';

const STORAGE_KEY = 'nbass_mobile_user';

/** ID 형식: 영문·숫자·_- 4~20자 */
export function isValidStudentId(id: string): boolean {
  return /^[A-Za-z0-9_-]{4,20}$/.test(id.trim());
}

export const authService = {
  getCurrentUser(): UserProfile | null {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    // 기본 첫 진입 시 null로 두고 로그인 페이지를 띄우거나 첫 데모 학생 반환
    return null;
  },

  async login(studentIdOrName: string): Promise<UserProfile> {
    const trimmed = studentIdOrName.trim();
    const lower = trimmed.toLowerCase();

    // 1. 등급 동기화 테이블에서 등급 우선 조회 (PC 오너 승인 반영)
    let cloudTier: MembershipTier | null = null;
    try {
      const { data: tierRows } = await supabase
        .from('user_tiers')
        .select('student_id,tier')
        .ilike('student_id', trimmed)
        .limit(10);
      if (Array.isArray(tierRows)) {
        const hit = (tierRows as any[]).find(r => String(r.student_id).toLowerCase() === lower);
        const t = hit?.tier ? String(hit.tier).toLowerCase() : '';
        if (['free', 'pro', 'premium', 'premium_plus', 'vip', 'expert'].includes(t)) {
          cloudTier = t as MembershipTier;
        } else if (t === 'basic') {
          cloudTier = 'free';
        }
      }
    } catch (e) {
      console.warn('Supabase tier lookup notice:', e);
    }

    // 2. Supabase에서 해당 학생의 최근 assessment 또는 profile 탐색
    let user: UserProfile = {
      studentId: trimmed,
      name: trimmed,
      school: '일반고등학교',
      grade: '고3 (수험생)',
      tier: cloudTier || 'free',
      examDate: new Date().toISOString().split('T')[0]
    };

    // 3. 기존 기록이 있으면 프로필 복원 (등급은 클라우드 등급 우선)

    try {
      const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .or(`student_name.eq.${trimmed},student_info->>id.eq.${trimmed}`)
        .order('created_at', { ascending: false })
        .limit(1);

      if (!error && data && data.length > 0) {
        const row = data[0];
        const rowTier = row.student_info?.tier ? String(row.student_info.tier).toLowerCase() : '';
        user = {
          studentId: row.student_info?.id || trimmed,
          name: row.student_name || trimmed,
          school: row.student_info?.school || '일반고등학교',
          grade: row.student_info?.grade || '고3 (수험생)',
          tier: cloudTier || (['free', 'pro', 'premium', 'premium_plus', 'vip', 'expert'].includes(rowTier) ? (rowTier as MembershipTier) : 'free'),
          examDate: row.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          careType: row.care_type,
          careTypeName: row.classification_result?.careTypeName || row.care_type,
          targetUniversity: row.student_info?.targetUniversity,
          targetMajor: row.student_info?.targetMajor
        };
      }
    } catch (e) {
      console.warn('Supabase auth search notice:', e);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    dataSyncService.syncAllFromCloud(user.studentId).catch(() => {});
    return user;
  },

  /**
   * 회원가입 — ID 형식 검증 + 중복 확인 후 무료 등급으로 생성.
   * 본인인증(휴대폰·카카오·문자)은 준비 중이라 지금은 받지 않습니다.
   */
  async signup(input: { studentId: string; name: string; school?: string; grade?: string }): Promise<UserProfile> {
    const id = (input.studentId || '').trim();
    const name = (input.name || '').trim();
    if (!isValidStudentId(id)) {
      throw new Error('ID는 영문·숫자·밑줄·하이픈 4~20자로 입력해주세요.');
    }
    if (!name) {
      throw new Error('이름을 입력해주세요.');
    }
    // 중복 확인 (실패 시 통과 — 가입 차단보다 중복 허용이 낫지 않으므로 조용히 통과하지 않고, 조회 성공 시에만 검사)
    try {
      const { data: tierRows } = await supabase
        .from('user_tiers')
        .select('student_id')
        .ilike('student_id', id)
        .limit(10);
      if (Array.isArray(tierRows) && tierRows.some((r: any) => String(r.student_id).toLowerCase() === id.toLowerCase())) {
        throw new Error('DUPE_TIER');
      }
      const { data: assessRows } = await supabase
        .from('assessments')
        .select('id')
        .or(`student_name.ilike.${id},student_info->>id.ilike.${id}`)
        .limit(5);
      if (Array.isArray(assessRows) && assessRows.length > 0) {
        throw new Error('DUPE_ASSESS');
      }
    } catch (e: any) {
      if (e?.message === 'DUPE_TIER' || e?.message === 'DUPE_ASSESS') {
        throw new Error('이미 가입된 ID입니다. 로그인해주세요.');
      }
      // 조회 실패 시 통과 (오프라인 가입 허용)
    }
    const user: UserProfile = {
      studentId: id,
      name,
      school: (input.school || '').trim() || '일반고등학교',
      grade: (input.grade || '').trim() || '고3 (수험생)',
      tier: 'free',
      examDate: new Date().toISOString().split('T')[0]
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    dataSyncService.syncAllFromCloud(id).catch(() => {});
    return user;
  },

  updateTier(newTier: MembershipTier): UserProfile {
    const current = this.getCurrentUser();
    if (!current) throw new Error('로그인이 필요합니다.');
    const updated = { ...current, tier: newTier };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  saveProfile(updated: UserProfile): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('nbass_data_updated', { detail: { type: 'profile', user: updated } }));
  },

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
};
