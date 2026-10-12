import { DatabaseService } from '../services/database';
import { UserTierService } from '../services/userTierService';
import { safeStorage } from './safeStorage';

/**
 * 레거시 Serial ID → 로그인 ID 일회성 이관 (UI 없음)
 * - 예: ID-20260820-2IXK → limsd77 (연습홍가마001)
 * - localStorage 프로필/미러, IndexedDB 히스토리, 등급 오버라이드 순으로 개명
 * - Supabase assessments/user_tiers는 오너가 API/SQL로 별도 개명 (RLS·대량 갱신 안전)
 * - 완료 플래그(nbass_id_migration_v1)로 1회만 실행
 */
interface IdRename {
    from: string;
    to: string;
}

const RENAMES: IdRename[] = [
    { from: 'ID-20260820-2IXK', to: 'limsd77' },
];

const DONE_KEY = 'nbass_id_migration_v1';

const eqId = (a: unknown, b: string): boolean =>
    String(a || '').trim().toLowerCase() === b.toLowerCase();

const migrateProfiles = (from: string, to: string): void => {
    if (typeof window === 'undefined') return;
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
                if (obj && typeof obj === 'object' && eqId(obj.id, from)) {
                    obj.id = to;
                    safeStorage.saveJSON(k, obj as never);
                }
            } catch { /* ignore */ }
        }
    } catch { /* ignore */ }
};

const migrateMirrors = (from: string, to: string): void => {
    if (typeof window === 'undefined') return;
    for (const key of ['sn1_history', 'nbass_history', 'nbass_history_backup']) {
        try {
            const raw = localStorage.getItem(key);
            if (!raw) continue;
            const list = JSON.parse(raw);
            if (!Array.isArray(list)) continue;
            let changed = false;
            for (const h of list) {
                if (h?.student && eqId(h.student.id, from)) {
                    h.student.id = to;
                    changed = true;
                }
            }
            if (changed) safeStorage.saveJSON(key, list as never);
        } catch { /* ignore */ }
    }
};

const migrateHistory = async (from: string, to: string): Promise<void> => {
    try {
        const all = await DatabaseService.getAllHistory();
        for (const r of all) {
            const st = (r as any)?.student;
            if (st && eqId(st.id, from) && (r as any).id) {
                st.id = to;
                try {
                    await DatabaseService.updateHistory(r as never);
                } catch { /* ignore */ }
            }
        }
    } catch { /* ignore */ }
};

const migrateTier = (from: string, to: string): void => {
    try {
        const overrides = UserTierService.getOverrides();
        const hit = (Object.values(overrides) as any[]).find(
            o => o && (eqId(o.studentId, from))
        );
        if (!hit) return;
        const tier = hit.tier || 'free';
        const name = hit.name || '';
        const notes = hit.notes || 'ID 이관(Serial → 로그인 ID)';
        try { UserTierService.removeUserTier(from); } catch { /* ignore */ }
        try {
            const email = Object.keys(overrides).find(k => k.includes('@') && (overrides[k] as any) === hit);
            UserTierService.setUserTier(to, tier, name, notes, email);
        } catch { /* ignore */ }
    } catch { /* ignore */ }
};

/** App 부팅 시 1회 호출 (冪등) */
export const runLegacyIdMigration = async (): Promise<void> => {
    try {
        if (typeof window === 'undefined') return;
        if (localStorage.getItem(DONE_KEY) === '1') return;
        for (const { from, to } of RENAMES) {
            migrateProfiles(from, to);
            migrateMirrors(from, to);
            await migrateHistory(from, to);
            migrateTier(from, to);
        }
        try { localStorage.setItem(DONE_KEY, '1'); } catch { /* ignore */ }
    } catch { /* ignore */ }
};
