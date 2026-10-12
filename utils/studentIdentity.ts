import { generateSerialID } from './constants';
import { DatabaseService } from '../services/database';

export interface StudentIdentityInput {
    id?: string | null;
    name?: string | null;
    email?: string | null;
    birthDate?: string | null;
}

const clean = (v: unknown): string => String(v || '').trim().toLowerCase();

interface CandidateProfile {
    id?: string;
    name?: string;
    email?: string;
    birthDate?: string;
}

const readProfileKeys = (): CandidateProfile[] => {
    const out: CandidateProfile[] = [];
    if (typeof window === 'undefined') return out;
    try {
        const keys: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && (k.startsWith('nbass_student_profile') || k === 'nbass_user' || k === 'nbass_last_student_profile')) {
                keys.push(k);
            }
        }
        for (const k of keys) {
            try {
                const obj = JSON.parse(localStorage.getItem(k) || 'null');
                if (obj && typeof obj === 'object' && (obj.id || obj.name || obj.email)) {
                    out.push(obj as CandidateProfile);
                }
            } catch { /* ignore */ }
        }
    } catch { /* ignore */ }
    return out;
};

/**
 * localStorage 프로필에서 기존 학생 ID를 찾는다 (동기).
 * 우선순위: 이메일 일치 > 이름+생년월일 일치 > 이름 단독(후보 1명일 때만).
 * 무명/빈 식별자는 매칭하지 않는다.
 */
export const findExistingStudentIdSync = (input: StudentIdentityInput): string | null => {
    const email = clean(input.email);
    const name = (input.name || '').trim().toLowerCase();
    const birth = (input.birthDate || '').trim();
    if (!email && !name) return null;

    const profiles = readProfileKeys();
    if (profiles.length === 0) return null;

    if (email) {
        const hit = profiles.find(p => clean(p.email) === email && (p.id || '').trim());
        if (hit?.id) return String(hit.id).trim();
    }
    if (name && birth) {
        const hit = profiles.find(p =>
            (p.name || '').trim().toLowerCase() === name &&
            (p.birthDate || '').trim() === birth &&
            (p.id || '').trim()
        );
        if (hit?.id) return String(hit.id).trim();
    }
    if (name) {
        const ids = new Set(
            profiles
                .filter(p => (p.name || '').trim().toLowerCase() === name && (p.id || '').trim())
                .map(p => String(p.id).trim())
        );
        if (ids.size === 1) return [...ids][0];
    }
    return null;
};

/**
 * 기존 학생 ID 조회 (localStorage + IndexedDB 히스토리).
 * 신규 가입/프로필 생성 시 무조건 새 ID를 발급하지 말고 이 함수로 기존 ID를 우선 재사용한다.
 */
export const findExistingStudentId = async (input: StudentIdentityInput): Promise<string | null> => {
    const syncHit = findExistingStudentIdSync(input);
    if (syncHit) return syncHit;

    const email = clean(input.email);
    const name = (input.name || '').trim().toLowerCase();
    const birth = (input.birthDate || '').trim();
    try {
        for (const key of [email, name].filter(Boolean)) {
            const records = await DatabaseService.getHistoryByStudent(key as string).catch(() => []);
            const mine = (records || []).filter(r => {
                const st = (r as any)?.student || {};
                if (email && clean(st.email) === email) return true;
                if (name && (st.name || '').trim().toLowerCase() === name) {
                    if (!birth) return true;
                    return (st.birthDate || '').trim() === birth;
                }
                return false;
            });
            const ids = new Set(
                mine.map(r => String((r as any)?.student?.id || '').trim()).filter(Boolean)
            );
            if (ids.size === 1) return [...ids][0];
            if (ids.size > 1 && email) {
                const exact = mine.find(r => clean((r as any)?.student?.email) === email);
                const eid = String((exact as any)?.student?.id || '').trim();
                if (eid) return eid;
            }
        }
    } catch { /* ignore */ }
    return null;
};

/**
 * 안정 학생 ID 확보: 기존 ID가 있으면 재사용, 없으면 로그인 ID(이메일) 우선으로 발급.
 * - 동일 로그인 → 어떤 기기/브라우저에서도 항상 같은 ID (Serial 난립 방지)
 * - 이메일이 없으면 Serial 발급 (기존 동작 유지)
 */
export const ensureStableStudentId = async (input: StudentIdentityInput): Promise<string> => {
    if (input.id?.trim()) return input.id.trim();
    const existing = await findExistingStudentId(input);
    if (existing) return existing;
    return mintLoginStudentId(input.email);
};

/**
 * 신규 발급용 ID: 로그인 ID(이메일 전체, 소문자)가 있으면 그대로 사용.
 * 이메일이 없을 때만 Serial을 발급한다.
 */
export const mintLoginStudentId = (email?: string | null): string => {
    const em = (email || '').trim().toLowerCase();
    if (em) return em;
    return generateSerialID();
};
