/**
 * 통합 동기화 창구 (단일 호출점)
 * - 화면 코드는 database.ts와 dataSyncService.ts를 직접 호출하지 않고 이 파일만 호출합니다.
 * - 키는 nbass_ 접두사로 통일하여 루트와 안드로이드가 같은 값을 봅니다.
 * - IndexedDB가 있으면 그것을 우선하고, 없으면 localStorage로 폴백합니다.
 */
import { DatabaseService } from './database';
import { mergeGamificationProgress as mergeGamificationProgressFn } from './database';
import { mergeHabitProgress as mergeHabitProgressFn } from './database';
import { safeStorage } from '../utils/safeStorage';
import { HISTORY_MIRROR_MAX, storageKeys } from '../utils/storageKeys';

const KEYS = {
    schedules: (studentId: string) => storageKeys.schedules(studentId),
    grades: (studentId: string) => storageKeys.grades(studentId),
    wrongNotes: storageKeys.wrongNotesLegacy,
    sleepLogs: (studentId: string) => storageKeys.sleepLogs(studentId),
    history: storageKeys.history,
};

const readJSON = <T>(key: string, fallback: T): T => {
    return safeStorage.getJSON<T>(key, fallback);
};

// 단일 저장소(localStorage)에 1회만 기록합니다.
// safeStorage가 쿼터 초과 시 자동 정리/재시도를 수행하므로 중복 기록이 불필요합니다.
const writeJSON = (key: string, value: unknown) => {
    safeStorage.saveJSON(key, value as never);
};

export const unifiedSyncService = {
    // 정식 저장소의 모든 메서드를 자동 전달 (누락 방지, 단일 호출점 유지)
    ...DatabaseService,
    getSchedules<T>(studentId: string, fallback: T[] = [] as unknown as T[]): T[] {
        if (!studentId) return fallback;
        return readJSON<T[]>(KEYS.schedules(studentId), fallback);
    },
    saveSchedules<T>(studentId: string, items: T[]) {
        if (!studentId) return;
        writeJSON(KEYS.schedules(studentId), items);
    },
    getGrades<T>(studentId: string, fallback: T[] = [] as unknown as T[]): T[] {
        if (!studentId) return fallback;
        return readJSON<T[]>(KEYS.grades(studentId), fallback);
    },
    saveGrades<T>(studentId: string, items: T[]) {
        if (!studentId) return;
        writeJSON(KEYS.grades(studentId), items);
    },
    getWrongNotes<T>(fallback: T[] = [] as unknown as T[], studentId?: string): T[] {
        // 학생별 키 우선, 레거시 전역 키 폴백 (모바일/PC 공유 단절 해소)
        if (studentId) {
            const scoped = readJSON<T[]>(storageKeys.wrongNotes(studentId), null as unknown as T[]);
            if (scoped) return scoped;
        }
        return readJSON<T[]>(KEYS.wrongNotes, fallback);
    },
    saveWrongNotes<T>(items: T[], studentId?: string) {
        if (studentId) writeJSON(storageKeys.wrongNotes(studentId), items);
        writeJSON(KEYS.wrongNotes, items);
    },
    getSleepLogs<T>(studentId: string, fallback: T[] = [] as unknown as T[]): T[] {
        if (!studentId) return fallback;
        return readJSON<T[]>(KEYS.sleepLogs(studentId), fallback);
    },
    saveSleepLogs<T>(studentId: string, items: T[]) {
        if (!studentId) return;
        writeJSON(KEYS.sleepLogs(studentId), items);
    },
    async getAllHistory(): Promise<any[]> {
        try {
            return await DatabaseService.getAllHistory();
        } catch { /* 폴백 */ }
        return readJSON<any[]>(KEYS.history, []);
    },
    async getHistoryByStudent(nameOrId?: string, birthDate?: string): Promise<any[]> {
        try {
            if (nameOrId && !birthDate) {
                try {
                    return await DatabaseService.getHistoryByStudent(nameOrId);
                } catch { /* 이름 조회로 폴백 */ }
            }
            if (nameOrId) return await DatabaseService.getHistoryByStudentInfo(nameOrId, birthDate);
        } catch { /* 폴백 */ }
        return readJSON<any[]>(KEYS.history, []);
    },
    async getHistoryByStudentInfo(name?: string, birthDate?: string): Promise<any[]> {
        try {
            if (name) return await DatabaseService.getHistoryByStudentInfo(name, birthDate);
        } catch { /* 폴백 */ }
        return readJSON<any[]>(KEYS.history, []);
    },
    async saveHistory(item: unknown) {
        try {
            await DatabaseService.addHistory(item as never);
        } catch { /* ignore */ }
        const prev = readJSON<unknown[]>(KEYS.history, []);
        writeJSON(KEYS.history, [item, ...prev].slice(0, HISTORY_MIRROR_MAX));
    },
    async autoSync() {
        try {
            await DatabaseService.autoSyncAllToSupabase().catch(() => undefined);
        } catch { /* ignore */ }
    },
    /** Supabase → 로컬 Pull (누락분 병합, Realtime 초기 동기화용) */
    async pullFromSupabase() {
        try {
            const { pullSupabaseToLocal } = await import('./supabaseRealtimeSync');
            return await pullSupabaseToLocal();
        } catch {
            return { pulled: 0, perTable: {} };
        }
    },
    /** 로컬 → Supabase Push (미동기화분 일괄 업로드) */
    async pushToSupabase() {
        try {
            const { pushLocalToSupabase } = await import('./supabaseRealtimeSync');
            return await pushLocalToSupabase();
        } catch {
            return { pushed: 0 };
        }
    },
    // 수면 패스스루 (단일 호출점 유지, 내부는 정식 저장소 위임)
    async getSleepRecords(studentId: string) {
        return DatabaseService.getSleepRecords(studentId);
    },
    async addSleepRecord(record: unknown) {
        return DatabaseService.addSleepRecord(record as never);
    },
    async updateSleepRecord(record: unknown) {
        return DatabaseService.updateSleepRecord(record as never);
    },
    async deleteSleepRecord(id: string | number) {
        return DatabaseService.deleteSleepRecord(id as never);
    },
    async getSleepGoal(studentId: string) {
        return DatabaseService.getSleepGoal(studentId);
    },
    async upsertSleepGoal(goal: unknown) {
        return DatabaseService.upsertSleepGoal(goal as never);
    },
    // 성적 패스스루 (단일 호출점 유지, 내부는 정식 저장소 위임)
    async getGradeRecords(studentId: string) {
        return DatabaseService.getGradeRecords(studentId);
    },
    async addGradeRecord(record: unknown) {
        return DatabaseService.addGradeRecord(record as never);
    },
    async updateGradeRecord(record: unknown) {
        return DatabaseService.updateGradeRecord(record as never);
    },
    async deleteGradeRecord(id: string | number) {
        return DatabaseService.deleteGradeRecord(id as never);
    },
    async getGradeGoals(studentId: string) {
        return DatabaseService.getGradeGoals(studentId);
    },
    async upsertGradeGoal(goal: unknown) {
        return DatabaseService.upsertGradeGoal(goal as never);
    },
    async deleteGradeGoal(id: string | number) {
        return DatabaseService.deleteGradeGoal(id as never);
    },
    async getHistoryByStudentId(studentId: string) {
        return DatabaseService.getHistoryByStudent(studentId);
    },
    async getHistoryByStudentSingle(studentId: string) {
        return DatabaseService.getHistoryByStudent(studentId);
    },
    async updateHistory(record: unknown) {
        return DatabaseService.updateHistory(record as never);
    },
    // 게이미피케이션 진행 상태 (기기 간 공유: 서버 우선, 로컬 미러 폴백)
    async getGamificationProgress(studentId: string, weekKey: string) {
        return DatabaseService.getGamificationProgress(studentId, weekKey);
    },
    async saveGamificationProgress(
        studentId: string,
        weekKey: string,
        progress: { completedTasks: string[]; exp: number; level: number; streak: number; lastCompletedDate?: string; taskLog?: Record<string, { done: boolean; at: string }> }
    ) {
        return DatabaseService.saveGamificationProgress(studentId, weekKey, progress);
    },
    mergeGamificationProgress(
        local: { completedTasks?: string[]; exp?: number; level?: number; streak?: number; lastCompletedDate?: string; taskLog?: Record<string, { done: boolean; at: string }> } | null | undefined,
        remote: { completedTasks?: string[]; exp?: number; level?: number; streak?: number; lastCompletedDate?: string; taskLog?: Record<string, { done: boolean; at: string }> } | null | undefined
    ) {
        return mergeGamificationProgressFn(local, remote);
    },
    // Realtime 구독: 같은 학생·주차의 원격 변경을 즉시 수신 (없으면 빈 해제 함수)
    subscribeGamificationProgress(
        studentId: string,
        weekKey: string,
        onRemote: (remote: {
            completedTasks: string[];
            exp: number;
            level: number;
            streak: number;
            lastCompletedDate?: string;
            taskLog?: Record<string, { done: boolean; at: string }>;
            updatedAt?: string;
        }) => void
    ): () => void {
        return DatabaseService.subscribeGamificationProgress(studentId, weekKey, onRemote);
    },
    // Habit 진행 상태 (기기 간 공유: 서버 우선, 로컬 미러 폴백, 필드별 LWW)
    // - 진입 시 pull + 변경 시 push (Realtime 제외: Habit 화면 동시 사용 빈도 낮음)
    async getHabitProgress(studentId: string) {
        return DatabaseService.getHabitProgress(studentId);
    },
    async saveHabitProgress(
        studentId: string,
        fields: Record<string, { v: unknown; at: string }>
    ) {
        return DatabaseService.saveHabitProgress(studentId, fields);
    },
    mergeHabitProgress(
        local: Record<string, { v: unknown; at: string }> | null | undefined,
        remote: Record<string, { v: unknown; at: string }> | null | undefined
    ) {
        return mergeHabitProgressFn(local, remote);
    },
};

export default unifiedSyncService;
export type { HistoryRecord, ConsultationHistory, RoutineTracking, GamificationProgress, HabitFieldMap, HabitFieldValue } from './database';
export { mergeGamificationProgress, mergeHabitProgress } from './database';
export { db } from './database';
