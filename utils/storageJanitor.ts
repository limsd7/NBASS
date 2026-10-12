import { safeStorage } from './safeStorage';

/**
 * 저장소 정리 (부팅 시 1회 실행 — UI 없음)
 * localStorage 포화(QuotaExceededError)로 앱이 죽는 것을 방지한다.
 * - 히스토리 미러 배열은 최신 10건으로 절삭
 * - 등급 오버라이드는 studentId 기준 중복 제거 + 200명 상한
 * - 임시 캐시 키 제거
 */
const MIRROR_KEYS = ['sn1_history', 'nbass_history', 'nbass_history_backup'];
const TEMP_KEYS = ['nbass_nback_logs_cache', 'edugrade_temp', 'surveyFormData'];
const TIER_OVERRIDES_KEY = 'nbass_user_tier_overrides';
const MAX_TIER_STUDENTS = 200;
// Mirrors/draft는 이 바이트 이하로만 유지 (등급·프로필 등 필수 키 공간 확보)
const MIRROR_BUDGET = 200000;
const DRAFT_KEY = 'sn1_assessment_draft';
const DRAFT_BUDGET = 200000;

const trimMirror = (key: string, max: number): void => {
    trimMirrorToBudget(key, max, MIRROR_BUDGET);
};

/** 배열 미러를 바이트 예산 이하가 될 때까지 최신순으로 줄임 (1건도 크면 키 제거) */
const trimMirrorToBudget = (key: string, max: number, budget: number): void => {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return;
        let list: unknown[];
        try {
            list = JSON.parse(raw);
        } catch {
            try { localStorage.removeItem(key); } catch { /* ignore */ }
            return;
        }
        if (!Array.isArray(list)) return;
        let keep = Math.min(list.length, max);
        while (keep > 0) {
            const sliced = list.slice(0, keep);
            let json = '';
            try { json = JSON.stringify(sliced); } catch { break; }
            if (json.length < budget) {
                if (keep < list.length) safeStorage.saveJSON(key, sliced as never);
                return;
            }
            keep = Math.floor(keep / 2);
        }
        // 1건조차 예산 초과면 키 제거 (DB가 진실원천)
        try { localStorage.removeItem(key); } catch { /* ignore */ }
    } catch { /* ignore */ }
};

const dedupeTierOverrides = (): void => {
    try {
        const raw = localStorage.getItem(TIER_OVERRIDES_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') return;
        const entries = Object.values(parsed) as any[];
        if (!Array.isArray(entries)) return;

        // studentId(또는 name) 기준 최신 1건만 유지
        const byStudent = new Map<string, any>();
        for (const e of entries) {
            if (!e || typeof e !== 'object') continue;
            const sid = String(e.studentId || e.name || '').trim();
            if (!sid) continue;
            const prev = byStudent.get(sid.toLowerCase());
            const curTime = String(e.updatedAt || '');
            const prevTime = prev ? String(prev.updatedAt || '') : '';
            if (!prev || curTime >= prevTime) byStudent.set(sid.toLowerCase(), e);
        }
        const sorted = [...byStudent.values()]
            .sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')))
            .slice(0, MAX_TIER_STUDENTS);

        // 팬아웃 키가 과도할 때만 재작성 (정상 규모면 손대지 않음)
        if (Object.keys(parsed).length <= 120) return;

        const next: Record<string, any> = {};
        for (const e of sorted) {
            const sid = String(e.studentId || e.name || '').trim();
            const nm = String(e.name || '').trim();
            // notes 등 부가 문자열은 길이 제한 (등급 판단에 불필요한 대용량 텍스트 누적 방지)
            const slim = { ...e };
            if (typeof slim.notes === 'string' && slim.notes.length > 200) {
                slim.notes = slim.notes.slice(0, 200);
            }
            next[sid] = slim;
            next[sid.toLowerCase()] = slim;
            if (nm) {
                next[nm] = slim;
                next[nm.toLowerCase()] = slim;
            }
        }
        safeStorage.saveJSON(TIER_OVERRIDES_KEY, next as never);
    } catch { /* ignore */ }
};

let janitorDone = false;

/** App 마운트 시 1회 호출 */
export const runStorageJanitor = (): void => {
    if (janitorDone) return;
    janitorDone = true;
    try {
        if (typeof window === 'undefined' || !window.localStorage) return;
        const before = measureUsage();
        // 백업 미러는 폴백 중 최하위라 통째로 비움
        try { localStorage.removeItem('nbass_history_backup'); } catch { /* ignore */ }
        // 전체가 4MB를 넘으면 재생성 가능한 캐시부터 회수 (대학 DB는 번들 기본값으로 복원됨)
        if (before.total > 4000000) {
            for (const k of ['custom_universities_db', 'custom_universities_db_timestamp']) {
                try { localStorage.removeItem(k); } catch { /* ignore */ }
            }
        }
        for (const k of MIRROR_KEYS) trimMirror(k, 10);
        // 초안 예산 초과 시 제거 (이어하기 배너만 사라지고 앱은 정상 동작)
        try {
            const draftRaw = localStorage.getItem(DRAFT_KEY) || '';
            if (draftRaw.length > DRAFT_BUDGET) localStorage.removeItem(DRAFT_KEY);
        } catch { /* ignore */ }
        for (const k of TEMP_KEYS) {
            try { localStorage.removeItem(k); } catch { /* ignore */ }
        }
        dedupeTierOverrides();
        // 용량 상위 키 진단 로그 (다음 원인 파악용)
        try {
            const after = measureUsage();
            console.log('[storageJanitor] bytes before/after:', before.total, '->', after.total,
                'top:', after.top.map(t => `${t.key}:${t.bytes}`).join(', '));
        } catch { /* ignore */ }
    } catch { /* ignore */ }
};

const measureUsage = (): { total: number; top: Array<{ key: string; bytes: number }> } => {
    const sizes: Array<{ key: string; bytes: number }> = [];
    try {
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (!k) continue;
            try {
                sizes.push({ key: k, bytes: (localStorage.getItem(k) || '').length });
            } catch { /* ignore */ }
        }
    } catch { /* ignore */ }
    sizes.sort((a, b) => b.bytes - a.bytes);
    return { total: sizes.reduce((a, s) => a + s.bytes, 0), top: sizes.slice(0, 8) };
};
