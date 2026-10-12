import { AssessmentResult } from '../types';
import { safeStorage } from '../utils/safeStorage';
import { HISTORY_MIRROR_KEY } from '../utils/storageKeys';

// App.tsx에서 분리 (UI 변경 없음, 하드코딩 특례 제거, safeStorage 경유)
export const restoreLatestStudentResult = (
  studentInfo?: { id?: string; name?: string; email?: string } | null,
  recordList?: (AssessmentResult & { date?: string })[]
): (AssessmentResult & { date?: string }) | null => {
  try {
    let sourceList: (AssessmentResult & { date?: string })[] = recordList && recordList.length > 0 ? [...recordList] : [];

    if (typeof window !== 'undefined') {
      const storageHistoryKeys = [HISTORY_MIRROR_KEY, 'nbass_history', 'nbass_history_backup'];
      for (const k of storageHistoryKeys) {
        try {
          const raw = safeStorage.getItem(k);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              sourceList = [...sourceList, ...parsed];
            }
          }
        } catch { /* ignore */ }
      }
    }

    const sId = studentInfo?.id?.trim().toLowerCase();
    const sName = studentInfo?.name?.trim().toLowerCase();
    const sEmail = studentInfo?.email?.trim().toLowerCase();

    const candidates: string[] = [];
    if (sId) candidates.push(sId);
    if (sName) candidates.push(sName);
    if (sEmail) {
      candidates.push(sEmail);
      const atIdx = sEmail.indexOf('@');
      if (atIdx > 0) candidates.push(sEmail.substring(0, atIdx));
    }

    // studentInfo에 식별자가 전혀 없을 때만 현재 로그인 스토리지 보조 참조
    if (candidates.length === 0 && typeof window !== 'undefined') {
      const storedEmail = safeStorage.getItem('nbass_current_email');
      if (storedEmail?.trim()) {
        const em = storedEmail.trim().toLowerCase();
        candidates.push(em);
        const atIdx = em.indexOf('@');
        if (atIdx > 0) candidates.push(em.substring(0, atIdx));
      }
      try {
        const rawUser = safeStorage.getItem('nbass_user') || safeStorage.getItem('nbass_student_profile');
        if (rawUser) {
          const u = JSON.parse(rawUser);
          if (u.id?.trim()) candidates.push(u.id.trim().toLowerCase());
          if (u.name?.trim()) candidates.push(u.name.trim().toLowerCase());
          if (u.email?.trim()) candidates.push(u.email.trim().toLowerCase());
        }
      } catch { /* ignore */ }
    }

    const matched = sourceList.filter(r => {
      if (!r || !r.student) return false;
      const rId = r.student.id?.trim().toLowerCase();
      const rName = r.student.name?.trim().toLowerCase();
      const rEmail = (r.student as any)?.email?.trim().toLowerCase();
      if (candidates.length === 0) return true;
      // ID가 있으면 ID·이메일 매칭만 허용 (동명이인 기록 혼입 방지).
      // 이름 단독 매칭은 ID 미보유 레거시 복원 경로에서만 사용한다.
      if (sId) {
        return candidates.some(cand =>
          (rId && rId === cand) ||
          (rEmail && rEmail === cand)
        );
      }
      return candidates.some(cand =>
        (rId && rId === cand) ||
        (rName && rName === cand) ||
        (rEmail && rEmail === cand)
      );
    });

    if (matched.length > 0) {
      const sorted = [...matched].sort((a, b) => {
        const tA = new Date(a.date || (a.student as any)?.testDate || 0).getTime();
        const tB = new Date(b.date || (b.student as any)?.testDate || 0).getTime();
        return tB - tA;
      });
      return sorted[0];
    }

    // 식별자가 지정되지 않은 경우에만 전체 목록의 최신 레코드 반환
    if (candidates.length === 0 && sourceList.length > 0) {
      const validList = sourceList.filter(r => r && r.student);
      if (validList.length > 0) {
        const sorted = [...validList].sort((a, b) => {
          const tA = new Date(a.date || (a.student as any)?.testDate || 0).getTime();
          const tB = new Date(b.date || (b.student as any)?.testDate || 0).getTime();
          return tB - tA;
        });
        return sorted[0];
      }
    }

    // 단일 캐시 결과 조회 시에도 현재 학생 본인 기록인지 엄격 확인
    if (typeof window !== 'undefined') {
      const singleKeys = ['nbass_assessment_result', 'sn1_assessment_result', 'nbass_last_result'];
      for (const sk of singleKeys) {
        try {
          const singleRaw = safeStorage.getItem(sk);
          if (singleRaw) {
            const parsed = JSON.parse(singleRaw);
            if (parsed && parsed.student) {
              const rId = parsed.student.id?.trim().toLowerCase();
              const rName = parsed.student.name?.trim().toLowerCase();
              const rEmail = parsed.student.email?.trim().toLowerCase();
              if (candidates.length === 0) return parsed;
              const isMatch = candidates.some(cand =>
                (rId && rId === cand) ||
                (rName && rName === cand) ||
                (rEmail && rEmail === cand)
              );
              if (isMatch) return parsed;
            }
          }
        } catch { /* ignore */ }
      }
    }
  } catch (e) {
    console.warn('Failed to restore latest student result:', e);
  }
  return null;
};
