import { UserProfile, MembershipTier } from '../types';
import { DEMO_STUDENTS } from './mockData';

const STORAGE_KEY = 'nbass_mobile_user';

export const authService = {
  getCurrentUser(): UserProfile | null {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    // 기본값: 김민준(FREE)
    return DEMO_STUDENTS[0];
  },

  login(studentIdOrName: string): UserProfile {
    const trimmed = studentIdOrName.trim().toLowerCase();
    const found = DEMO_STUDENTS.find(
      s => s.studentId.toLowerCase() === trimmed || s.name.toLowerCase() === trimmed
    );

    const user = found || {
      studentId: studentIdOrName.trim(),
      name: studentIdOrName.trim(),
      school: '일반학교',
      grade: '고교생',
      tier: 'free' as MembershipTier,
      examDate: new Date().toISOString().split('T')[0]
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return user;
  },

  updateTier(newTier: MembershipTier): UserProfile {
    const current = this.getCurrentUser() || DEMO_STUDENTS[0];
    const updated = { ...current, tier: newTier };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
};
