/**
 * IndexedDB Database Service using Dexie.js
 * 
 * 이 파일은 영구 데이터 저장을 위한 IndexedDB 래퍼입니다.
 * 추후 Supabase 등 클라우드 DB로 전환 시 이 파일만 수정하면 됩니다.
 */

import Dexie, { type Table } from 'dexie';
import { AssessmentResult, StudentInfo, GradeRecord, GradeGoal, SleepRecord, SleepGoal, BankQuestion } from '../types';
import { StudyEfficiencyResults } from './studyEfficiencyService';
import { supabase, isSupabaseReady } from '../lib/supabase';
import { safeStorage } from '../utils/safeStorage';
import { getAllDefaultSampleRecords, getLimsd7Records } from './defaultStudentRecords';

// 현재 Supabase 로그인 세션의 사용자 ID (없으면 null → 클라우드 동기화 생략)
// RLS(user_id) 정책을 만족하는 upsert를 위해 페이로드에 동봉한다.
const getSupabaseUid = async (): Promise<string | null> => {
    try {
        const { data } = await supabase.auth.getUser();
        return data?.user?.id || null;
    } catch {
        return null;
    }
};
import { markSupabasePushed, assessmentSig } from './supabasePushGuard';

// History Record 타입 정의
export interface HistoryRecord extends AssessmentResult {
    id?: number;  // IndexedDB auto-increment key
    date: string;
    syncStatus?: 'local' | 'synced' | 'pending';  // 추후 클라우드 동기화용
}

/**
 * 빈껍데기 기록 판정: 설문에 단 1개도 답하지 않은 재계산 쓰레기.
 * 어떤 경로로든 저장·동기화·복원 대상에서 제외한다.
 */
export const isBlankSurveyRecord = (result: any): boolean => {
    try {
        const s = result?.survey;
        if (!s || typeof s !== 'object') return true;
        let answered = 0;
        if ((s.bai || 0) > 0) answered++;
        if ((s.isi || 0) > 0) answered++;
        if ((s.concentrationScore || 0) > 0) answered++;
        if ((s.adrenalFatigueScore || 0) > 0) answered++;
        if ((s.chronicFatigueScore || 0) > 0) answered++;
        if ((s.fatigueSymptomsCount || 0) > 0) answered++;
        if (Array.isArray(s.symptoms) && s.symptoms.length > 0) answered++;
        if (Array.isArray(s.sympatheticSymptoms) && s.sympatheticSymptoms.length > 0) answered++;
        if (Array.isArray(s.parasympatheticSymptoms) && s.parasympatheticSymptoms.length > 0) answered++;
        if (s.chronicFatigue) answered++;
        return answered === 0;
    } catch {
        return true;
    }
};

// Gamification 진행 상태 (주간 액션 플래너, 기기 간 공유 단위: student_id + week_key)
export interface GamificationProgress {
    studentId: string;
    weekKey: string;
    completedTasks: string[];
    exp: number;
    level: number;
    streak: number;
    lastCompletedDate?: string;
    updatedAt?: string;
    // 체크/해제 tombstone 로그 (taskId -> 마지막 액션, 최신 액션이 승리)
    taskLog?: Record<string, { done: boolean; at: string }>;
}

// 기기 간 병합: 과제별 최종 액션 승리(LWW) + 수치 max + 최근 일자
export interface GamificationProgressInput {
    completedTasks?: string[];
    exp?: number;
    level?: number;
    streak?: number;
    lastCompletedDate?: string;
}

export function mergeGamificationProgress(
    local: (GamificationProgressInput & { taskLog?: Record<string, { done: boolean; at: string }> }) | null | undefined,
    remote: (GamificationProgressInput & { taskLog?: Record<string, { done: boolean; at: string }> }) | null | undefined
): { completedTasks: string[]; exp: number; level: number; streak: number; lastCompletedDate?: string; taskLog: Record<string, { done: boolean; at: string }> } {
    const log: Record<string, { done: boolean; at: string }> = {};
    const takeLog = (src: { taskLog?: Record<string, { done: boolean; at: string }> } | null | undefined) => {
        const entries = src?.taskLog;
        if (!entries || typeof entries !== 'object') return;
        for (const [taskId, e] of Object.entries(entries)) {
            if (typeof taskId !== 'string' || !e || typeof e.done !== 'boolean' || typeof e.at !== 'string') continue;
            const prev = log[taskId];
            if (!prev || e.at > prev.at) log[taskId] = { done: e.done, at: e.at };
        }
    };
    takeLog(local as any);
    takeLog(remote);
    const tasks = new Set<string>();
    // 로그에 없는 레거시 체크 항목은 체크 유지 (하위 호환)
    for (const t of local?.completedTasks || []) if (typeof t === 'string') tasks.add(t);
    for (const t of remote?.completedTasks || []) if (typeof t === 'string') tasks.add(t);
    // 로그 판정 적용 (최신 액션이 해제면 제거)
    for (const [taskId, e] of Object.entries(log)) {
        if (e.done) tasks.add(taskId);
        else tasks.delete(taskId);
    }
    const lastDates = [local?.lastCompletedDate, remote?.lastCompletedDate].filter(Boolean) as string[];
    lastDates.sort();
    return {
        completedTasks: Array.from(tasks),
        exp: Math.max(local?.exp || 0, remote?.exp || 0),
        level: Math.max(local?.level && local.level >= 1 ? local.level : 1, remote?.level && remote.level >= 1 ? remote.level : 1),
        streak: Math.max(local?.streak || 0, remote?.streak || 0),
        lastCompletedDate: lastDates.length > 0 ? lastDates[lastDates.length - 1] : undefined,
        taskLog: log
    };
}

// Habit 진행 상태 (공부습관 클리닉, 기기 간 공유 단위: student_id 단일 행)
// - 체크/해제가 양방향으로 일어나므로 필드별 LWW: 각 필드 { v: 값, at: ISO시각 }
// - 게이미피케이션 taskLog 방식과 동일한 판정 (필드별 최신 시각 승리)
export type HabitFieldValue = { v: unknown; at: string };
export type HabitFieldMap = Record<string, HabitFieldValue>;

export function mergeHabitProgress(
    local: HabitFieldMap | null | undefined,
    remote: HabitFieldMap | null | undefined
): HabitFieldMap {
    const merged: HabitFieldMap = {};
    const keys = new Set<string>([
        ...Object.keys(local || {}),
        ...Object.keys(remote || {}),
    ]);
    for (const k of keys) {
        const l = (local || {})[k];
        const r = (remote || {})[k];
        const lok = l && typeof l === 'object' && typeof (l as any).at === 'string';
        const rok = r && typeof r === 'object' && typeof (r as any).at === 'string';
        if (lok && rok) {
            merged[k] = (l as HabitFieldValue).at >= (r as HabitFieldValue).at
                ? (l as HabitFieldValue)
                : (r as HabitFieldValue);
        } else if (rok) {
            merged[k] = r as HabitFieldValue;
        } else if (lok) {
            merged[k] = l as HabitFieldValue;
        }
    }
    return merged;
}

// 히스토리 미러 저장 (용량 초과 시 시도조차 하지 않고 키 제거 — 경고 폭탄 방지, DB가 진실원천)
function saveMirrorOrDrop(key: string, list: unknown[]): void {
    if (typeof window === 'undefined') return;
    try {
        const json = JSON.stringify(list);
        if (json && json.length < 200000) {
            try {
                if (safeStorage.saveJSON(key, list as never)) return;
            } catch { /* ignore */ }
        }
    } catch { /* ignore */ }
    try { localStorage.removeItem(key); } catch { /* ignore */ }
}

// 삭제된 학생의 localStorage 잔재 정리 (미러 복원 부활 차단용 — UI 없음)
function pruneLocalStudentTraces(identities: Set<string>): void {
    if (typeof window === 'undefined' || identities.size === 0) return;
    const has = (v: unknown): boolean => !!v && identities.has(String(v).trim().toLowerCase());

    // 1) 히스토리 미러 배열에서 삭제 대상 항목 제거
    for (const key of ['sn1_history', 'nbass_history', 'nbass_history_backup']) {
        try {
            const raw = localStorage.getItem(key);
            if (!raw) continue;
            const list = JSON.parse(raw);
            if (!Array.isArray(list)) continue;
            const next = list.filter((h: any) => {
                const st = h?.student || {};
                return !(has(st.id) || has(st.name) || has(st.email));
            });
            if (next.length !== list.length) {
                if (next.length === 0) {
                    try { localStorage.removeItem(key); } catch { /* ignore */ }
                } else {
                    saveMirrorOrDrop(key, next);
                }
            }
        } catch { /* ignore */ }
    }

    // 2) 단일 최신 결과에서 삭제 대상이면 제거
    for (const key of ['nbass_assessment_result', 'sn1_assessment_result', 'nbass_last_result']) {
        try {
            const raw = localStorage.getItem(key);
            if (!raw) continue;
            const obj = JSON.parse(raw);
            const st = obj?.student || {};
            if (has(st.id) || has(st.name) || has(st.email)) {
                try { localStorage.removeItem(key); } catch { /* ignore */ }
            }
        } catch { /* ignore */ }
    }

    // 3) 프로필 캐시 / 1회 사용 플래그 정리
    try {
        const keys: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k) keys.push(k);
        }
        for (const k of keys) {
            if (k === 'nbass_student_profile' || k === 'nbass_user' ||
                k === 'nbass_last_student_profile' || k === 'sn1_student') {
                try {
                    const obj = JSON.parse(localStorage.getItem(k) || 'null');
                    if (obj && (has(obj.id) || has(obj.name) || has(obj.email))) {
                        localStorage.removeItem(k);
                    }
                } catch { /* ignore */ }
            } else if (k.startsWith('nbass_student_profile_')) {
                const suffix = k.slice('nbass_student_profile_'.length).toLowerCase();
                if (identities.has(suffix)) {
                    try { localStorage.removeItem(k); } catch { /* ignore */ }
                    continue;
                }
                try {
                    const obj = JSON.parse(localStorage.getItem(k) || 'null');
                    if (obj && (has(obj.id) || has(obj.name) || has(obj.email))) {
                        localStorage.removeItem(k);
                    }
                } catch { /* ignore */ }
            } else if (k.startsWith('nbass_pro_used_')) {
                const suffix = k.slice('nbass_pro_used_'.length).toLowerCase();
                if (identities.has(suffix)) {
                    try { localStorage.removeItem(k); } catch { /* ignore */ }
                }
            }
        }
    } catch { /* ignore */ }
}

// Student 프로필 저장용 (추후 확장) - id 충돌 방지를 위해 Omit 사용
export interface StudentProfile extends Omit<StudentInfo, 'id'> {
    id?: number;
    studentId?: string; // 원래 StudentInfo의 id (string) 저장용 필드 추가
    createdAt: string;
    updatedAt: string;
}

// 앱 설정 저장용
export interface AppSettings {
    id?: number;
    key: string;
    value: string;
    updatedAt: string;
}

// 상담 이력 저장용
export interface ConsultationHistory {
    id?: number;
    studentId: string;
    studentName: string;
    date: string;
    usedRules: string[];  // 사용된 예측 규칙 ID들
    usedScripts: string[];  // 복사한 상담 스크립트들
    notes: string;  // 관리자 메모
    studentResponse: string;  // 학생 반응
    predictions: any;  // 예측 결과 스냅샷
}

// 자가진단 결과 저장용
export interface SelfCheckResult {
    id?: number;
    studentId: string;
    careType: string;
    date: string;
    score: number;
    answers: Record<string, boolean>;
    createdAt: string;
}

// 루틴 추적 저장용
export interface RoutineTracking {
    id?: number;
    studentId: string;
    careType: string;
    date: string;
    completedIds: string[];
    completionRate: number;
    createdAt: string;
}

// 공부 효율성 정밀 검사 결과 독립 저장용
export interface StudyEfficiencyRecord {
    id?: number;
    studentId: string;
    date: string;
    results: StudyEfficiencyResults;
    createdAt: string;
}

// 작업 기억 용량 검사 결과 저장용
export interface WorkingMemoryRecord {
    id?: number;
    studentId: string;
    date: string;
    results: any; // WorkingMemoryResult
    createdAt: string;
}

// 인지 성능 검사 결과 저장용
export interface CognitivePerformanceRecord {
    id?: number;
    studentId: string;
    date: string;
    results: any; // CognitivePerformanceResults
    createdAt: string;
}

// Dexie Database 클래스 정의
class MindBodyDatabase extends Dexie {
    history!: Table<HistoryRecord, number>;
    students!: Table<StudentProfile, number>;
    settings!: Table<AppSettings, number>;
    consultations!: Table<ConsultationHistory, number>;
    selfCheckResults!: Table<SelfCheckResult, number>;
    routineTracking!: Table<RoutineTracking, number>;
    studyEfficiency!: Table<StudyEfficiencyRecord, number>;
    workingMemory!: Table<WorkingMemoryRecord, number>;
    cognitivePerformance!: Table<CognitivePerformanceRecord, number>;
    gradeRecords!: Table<GradeRecord, string>;
    gradeGoals!: Table<GradeGoal, string>;
    sleepRecords!: Table<SleepRecord, string>;
    sleepGoals!: Table<SleepGoal, string>;
    questionBank!: Table<BankQuestion, string>;

    constructor() {
        super('MindBodyConnectDB');

        // 버전 2 - consultations 추가
        this.version(2).stores({
            // history 테이블: id 자동증가, date와 student.name으로 인덱싱
            history: '++id, date, student.name, student.id, careType, syncStatus',
            // students 테이블: 학생 프로필 저장
            students: '++id, name, &[name+birthDate], createdAt',
            // settings 테이블: 앱 설정
            settings: '++id, &key',
            // consultations 테이블: 상담 이력
            consultations: '++id, studentId, date'
        });

        // 버전 3 - selfCheckResults, routineTracking 추가
        this.version(3).stores({
            history: '++id, date, student.name, student.id, careType, syncStatus',
            students: '++id, name, &[name+birthDate], createdAt',
            settings: '++id, &key',
            consultations: '++id, studentId, date',
            // 자가진단 결과 테이블
            selfCheckResults: '++id, studentId, careType, date, createdAt',
            // 루틴 추적 테이블
            routineTracking: '++id, studentId, careType, date, createdAt'
        });

        // 버전 4 - studyEfficiency 추가
        this.version(4).stores({
            history: '++id, date, student.name, student.id, careType, syncStatus',
            students: '++id, name, &[name+birthDate], createdAt',
            settings: '++id, &key',
            consultations: '++id, studentId, date',
            selfCheckResults: '++id, studentId, careType, date, createdAt',
            routineTracking: '++id, studentId, careType, date, createdAt',
            // 공부 효율성 검사 결과 테이블
            studyEfficiency: '++id, studentId, date, createdAt'
        });

        // 버전 5 - workingMemory, cognitivePerformance 추가
        this.version(5).stores({
            history: '++id, date, student.name, student.id, careType, syncStatus',
            students: '++id, name, &[name+birthDate], createdAt',
            settings: '++id, &key',
            consultations: '++id, studentId, date',
            selfCheckResults: '++id, studentId, careType, date, createdAt',
            routineTracking: '++id, studentId, careType, date, createdAt',
            studyEfficiency: '++id, studentId, date, createdAt',
            workingMemory: '++id, studentId, date, createdAt',
            cognitivePerformance: '++id, studentId, date, createdAt'
        });

        // 버전 6 - gradeRecords, gradeGoals 추가
        this.version(6).stores({
            history: '++id, date, student.name, student.id, careType, syncStatus',
            students: '++id, name, &[name+birthDate], createdAt',
            settings: '++id, &key',
            consultations: '++id, studentId, date',
            selfCheckResults: '++id, studentId, careType, date, createdAt',
            routineTracking: '++id, studentId, careType, date, createdAt',
            studyEfficiency: '++id, studentId, date, createdAt',
            workingMemory: '++id, studentId, date, createdAt',
            cognitivePerformance: '++id, studentId, date, createdAt',
            gradeRecords: 'id, studentId, examDate, createdAt',
            gradeGoals: 'id, studentId, subjectId'
        });

        // 버전 7 - sleepRecords, sleepGoals 추가
        this.version(7).stores({
            history: '++id, date, student.name, student.id, careType, syncStatus',
            students: '++id, name, &[name+birthDate], createdAt',
            settings: '++id, &key',
            consultations: '++id, studentId, date',
            selfCheckResults: '++id, studentId, careType, date, createdAt',
            routineTracking: '++id, studentId, careType, date, createdAt',
            studyEfficiency: '++id, studentId, date, createdAt',
            workingMemory: '++id, studentId, date, createdAt',
            cognitivePerformance: '++id, studentId, date, createdAt',
            gradeRecords: 'id, studentId, examDate, createdAt',
            gradeGoals: 'id, studentId, subjectId',
            sleepRecords: 'id, studentId, date, createdAt',
            sleepGoals: 'id, studentId'
        });

        // 버전 8 - 과목별 AI 클리닉 문제은행(questionBank) 추가
        this.version(8).stores({
            history: '++id, date, student.name, student.id, careType, syncStatus',
            students: '++id, name, &[name+birthDate], createdAt',
            settings: '++id, &key',
            consultations: '++id, studentId, date',
            selfCheckResults: '++id, studentId, careType, date, createdAt',
            routineTracking: '++id, studentId, careType, date, createdAt',
            studyEfficiency: '++id, studentId, date, createdAt',
            workingMemory: '++id, studentId, date, createdAt',
            cognitivePerformance: '++id, studentId, date, createdAt',
            gradeRecords: 'id, studentId, examDate, createdAt',
            gradeGoals: 'id, studentId, subjectId',
            sleepRecords: 'id, studentId, date, createdAt',
            sleepGoals: 'id, studentId',
            questionBank: 'id, studentId, subjectId, strategyType, strategyTag, fingerprint, isSolved, isCorrect, createdAt'
        });
    }
}

// Database 싱글톤 인스턴스
export const db = new MindBodyDatabase();

/**
 * Database Service - 데이터 접근 레이어
 * 추후 클라우드 DB 전환 시 이 인터페이스를 유지하면서 내부 구현만 변경
 */
export const DatabaseService = {
    // ==================== History 관련 ====================

    /**
     * 모든 히스토리 조회
     */
    async getAllHistory(): Promise<HistoryRecord[]> {
        try {
            const records = await db.history.orderBy('date').reverse().toArray();
            return records;
        } catch (error) {
            console.error('Failed to get history:', error);
            return [];
        }
    },

    /**
     * 히스토리 추가
     */
    async addHistory(result: AssessmentResult): Promise<number | undefined> {
        try {
            // 빈껍데기(무응답 재계산) 기록은 저장 자체를 거부 — Supabase 중복 쓰레기 원천 차단
            if (isBlankSurveyRecord(result)) {
                console.log('Blank survey record, skipping save...');
                return undefined;
            }
            // 중복 체크 1) 동일 student.id + 검사일 + 점수 + 유형
            const existing = await db.history
                .where('student.id')
                .equals(result.student.id)
                .and(item =>
                    item.student.testDate === result.student.testDate &&
                    item.score === (result.score || 0) &&
                    item.careType === result.careType
                )
                .first();

            if (existing) {
                console.log('Duplicate entry found, skipping...');
                return existing.id;
            }

            // 중복 체크 2) student.id는 세션마다 재생성되므로 이름 기준으로도 검사
            // (동일 이름 + 동일 검사일 + 동일 점수 + 동일 유형 = 동일 기록, Supabase 중복 행 방지)
            try {
                const dupName = (result.student?.name || '').trim().toLowerCase();
                const dupDate = result.student?.testDate;
                const dupScore = result.score || 0;
                const dupCare = result.careType;
                if (dupName && dupDate) {
                    const sameName = await db.history.where('student.name').equals(result.student.name).toArray()
                        .catch(() => [] as HistoryRecord[]);
                    const hit = (sameName as HistoryRecord[]).find(item =>
                        (item.student?.name || '').trim().toLowerCase() === dupName &&
                        item.student?.testDate === dupDate &&
                        (item.score || 0) === dupScore &&
                        item.careType === dupCare
                    );
                    if (hit) {
                        console.log('Duplicate entry found by name, skipping...');
                        return hit.id;
                    }
                }
            } catch { /* ignore */ }

            const newRecord: HistoryRecord = {
                ...result,
                date: new Date().toISOString(),
                syncStatus: 'pending'
            };

            const id = await db.history.add(newRecord);
            newRecord.id = id;

            // 백그라운드 자동 동기화 (UI 지연 없음)
            setTimeout(() => {
                this.syncRecordToSupabase(newRecord).catch(() => {});
            }, 100);

            return id;
        } catch (error) {
            console.error('Failed to add history:', error);
            throw error;
        }
    },

    /**
     * 개별 레코드 Supabase 백그라운드 자동 동기화 (양방향 Realtime의 Push 방향)
     * - 성공 시 echo 억제 가드에 supabase id를 등록합니다.
     * - 반환된 supabase id는 로컬 레코드에 supabaseId로 저장됩니다.
     */
    async syncRecordToSupabase(record: HistoryRecord): Promise<boolean> {
        try {
            if (!isSupabaseReady() || !supabase) return false;
            const studentName = record.student?.name || '미지정';
            // Realtime echo가 insert 결과보다 먼저 도착하는 레이스에 대비해 서명을 선등록
            markSupabasePushed('assessments', assessmentSig(
                record.student?.id, record.student?.testDate, record.score, record.careType
            ));
            let userId: string | null = null;
            try {
                const { data } = await supabase.auth.getUser();
                userId = data?.user?.id ?? null;
            } catch { /* anon 운용 — null 허용 (realtime migration에서 NULL 허용) */ }
            const payload: any = {
                student_name: studentName,
                student_info: record.student || {},
                survey_data: record.survey || {},
                hrv_data: record.hrv || {},
                protocol_data: record.protocol || {},
                classification_result: record.classificationResult || {},
                care_type: record.careType || 'Type-1',
                care_score: record.score || 0,
                study_efficiency_data: record.studyEfficiencyResults || {},
                analysis_text: record.analysisText || '',
                status: 'completed',
                updated_at: new Date().toISOString()
            };
            if (userId) payload.user_id = userId;

            const existingSupabaseId = (record as any)?.supabaseId as string | undefined;
            if (existingSupabaseId) {
                const { error } = await (supabase.from('assessments' as any) as any).update(payload).eq('id', existingSupabaseId);
                if (!error) {
                    markSupabasePushed('assessments', existingSupabaseId);
                    if (record.id) {
                        await db.history.update(record.id, { syncStatus: 'synced' });
                    }
                    return true;
                }
            }

            const { data, error } = await supabase.from('assessments' as any).insert(payload).select('id').single();
            if (!error) {
                const newId = (data as any)?.id as string | undefined;
                if (newId) markSupabasePushed('assessments', newId);
                if (record.id) {
                    await db.history.update(record.id, { syncStatus: 'synced', ...(newId ? { supabaseId: newId } as any : {}) });
                }
                return true;
            }
            if (error.code === '401' || (error as any).status === 401 || error.message?.includes('JWT') || error.message?.includes('apikey')) {
                // 401 Unauthorized - Key or RLS issue
                return false;
            }
            return false;
        } catch {
            return false;
        }
    },

    /**
     * 로컬에 있는 모든 미동기화 레코드를 Supabase로 자동 일괄 동기화
     */
    async autoSyncAllToSupabase(): Promise<{ total: number; synced: number }> {
        try {
            if (!isSupabaseReady()) return { total: 0, synced: 0 };
            const all = await db.history.toArray();
            const unSynced = all.filter(r => r.syncStatus !== 'synced');
            if (unSynced.length === 0) return { total: all.length, synced: 0 };

            // 첫 번째 레코드로 통신 가능 여부 사전 점검 (401 에러 반복 호출 방지)
            const firstTest = await this.syncRecordToSupabase(unSynced[0]);
            if (!firstTest) {
                // Supabase 키가 유효하지 않거나 RLS/테이블 설정 대기 중이면 반복 중단
                return { total: all.length, synced: 0 };
            }

            let count = 1;
            for (let i = 1; i < unSynced.length; i++) {
                const ok = await this.syncRecordToSupabase(unSynced[i]);
                if (ok) count++;
            }
            return { total: all.length, synced: count };
        } catch (e) {
            return { total: 0, synced: 0 };
        }
    },

    /**
     * 히스토리 삭제 (로컬 + Supabase 양방향 — realtime DELETE가 다른 기기에 전파됨)
     */
    async deleteHistory(id: number): Promise<void> {
        try {
            let supabaseId: string | undefined;
            try {
                const rec = await db.history.get(id);
                supabaseId = (rec as any)?.supabaseId;
            } catch { /* ignore */ }
            await db.history.delete(id);
            if (supabaseId && isSupabaseReady()) {
                try {
                    markSupabasePushed('assessments', String(supabaseId));
                    await supabase.from('assessments' as any).delete().eq('id', supabaseId);
                } catch { /* ignore */ }
            }
        } catch (error) {
            console.error('Failed to delete history:', error);
            throw error;
        }
    },

    /**
     * 특정 학생의 모든 히스토리 및 프로필 삭제 (로컬 + Supabase 확정 삭제)
     * - IndexedDB history/students, Supabase assessments, 등급 오버라이드(user_tiers),
     *   localStorage 미러(sn1_history/nbass_history/프로필/pro_used 플래그)를 함께 정리합니다.
     * - 정리하지 않으면 새로고침 시 Pull/미러 복원으로 삭제된 학생(특히 무명 수험생)이 부활합니다.
     */
    async deleteStudentRecords(studentIdOrName: string): Promise<{ deleted: number; supabaseDeleted: number; supabaseError?: string }> {
        const supabaseErrors: string[] = [];
        try {
            const target = studentIdOrName.trim();
            const targetLower = target.toLowerCase();
            // 목록 키가 'name_xxx' 형태(무명 등 ID 미보유 학생)면 이름 부분도 매칭에 사용
            const matchName = targetLower.startsWith('name_') ? targetLower.slice(5) : targetLower;
            // 무명 식별자: PC 표시명(무명 수험생) ↔ Supabase 저장명(미지정/빈값) 불일치 대응
            const ANON_NAMES = ['무명 수험생', '미지정'];
            const targetIsAnonymous = ANON_NAMES.includes(targetLower) || ANON_NAMES.includes(matchName) || targetLower.startsWith('name_');
            const isAnonName = (s: string): boolean => !s || s === '미지정' || s === '무명 수험생';
            const all = await db.history.toArray();
            const toDelete = all.filter(r =>
                r.student?.id === target ||
                r.student?.name === target ||
                (r.student?.id || '').toLowerCase() === targetLower ||
                (r.student?.name || '').toLowerCase() === targetLower ||
                (matchName ? (r.student?.name || '').toLowerCase() === matchName : false) ||
                (targetLower && !targetLower.startsWith('name_') ? (r.student?.name || '').toLowerCase().includes(targetLower) : false) ||
                (targetIsAnonymous && !(r.student?.name || '').trim() && !(r.student?.id || '').trim())
            );

            // 삭제 대상의 모든 식별자 수집 (id / name / email / 이메일 아이디)
            const identities = new Set<string>();
            if (targetLower) identities.add(targetLower);
            if (matchName) identities.add(matchName);
            const supabaseIds: string[] = [];
            for (const r of toDelete) {
                const sid = (r.student?.id || '').trim();
                const snm = (r.student?.name || '').trim();
                const eml = ((r.student as any)?.email || '').trim().toLowerCase();
                if (sid) identities.add(sid.toLowerCase());
                if (snm) identities.add(snm.toLowerCase());
                if (eml) {
                    identities.add(eml);
                    const at = eml.indexOf('@');
                    if (at > 0) identities.add(eml.substring(0, at));
                }
                const supId = (r as any)?.supabaseId;
                if (supId) supabaseIds.push(String(supId));
            }

            const deleteIds = toDelete.map(r => r.id!).filter(Boolean);
            if (deleteIds.length > 0) {
                await db.history.bulkDelete(deleteIds);
            }
            // student table profile delete (대소문자/이메일 구분 없이)
            const profiles = await db.students.toArray();
            const profIds = profiles.filter(p => {
                const n = (p.name || '').trim().toLowerCase();
                const sid = (p.studentId || '').trim().toLowerCase();
                const em = (((p as any).email || '') as string).trim().toLowerCase();
                return (n && identities.has(n)) || (sid && identities.has(sid)) || (em && identities.has(em));
            }).map(p => p.id!).filter(Boolean);
            if (profIds.length > 0) {
                await db.students.bulkDelete(profIds);
            }

            // Supabase assessments 확정 삭제 1) 연결된 supabaseId 직삭제
            let supabaseDeleted = 0;
            if (isSupabaseReady()) {
                try {
                    const uniqSupIds = [...new Set(supabaseIds)];
                    for (const supId of uniqSupIds) {
                        try { markSupabasePushed('assessments', supId); } catch { /* ignore */ }
                        try {
                            const { error } = await (supabase.from('assessments' as any) as any).delete().eq('id', supId);
                            if (!error) supabaseDeleted++;
                            else {
                                const msg = (error as any)?.message || String(error);
                                supabaseErrors.push(msg);
                                console.warn('[deleteStudentRecords] Supabase delete failed:', msg);
                            }
                        } catch (e) {
                            supabaseErrors.push(e instanceof Error ? e.message : String(e));
                            console.warn('[deleteStudentRecords] Supabase delete error:', e);
                        }
                    }
                } catch { /* ignore */ }
                // 2) supabaseId 미보유 원격 잔존분(다른 기기 생성 등)도 식별자 대조 후 삭제
                try {
                    const { data } = await (supabase.from('assessments' as any) as any)
                        .select('id,student_name,student_info')
                        .limit(500);
                    if (Array.isArray(data)) {
                        const extraIds = (data as any[])
                            .filter(row => {
                                if (!row?.id) return false;
                                if (supabaseIds.includes(String(row.id))) return false;
                                const nm = String(row?.student_name || '').trim().toLowerCase();
                                const si = (row?.student_info as any) || {};
                                const rid = si?.id ? String(si.id).trim().toLowerCase() : '';
                                const rnm = si?.name ? String(si.name).trim().toLowerCase() : '';
                                const eml = si?.email ? String(si.email).trim().toLowerCase() : '';
                                if ((nm && identities.has(nm)) ||
                                    (rid && identities.has(rid)) ||
                                    (rnm && identities.has(rnm)) ||
                                    (eml && identities.has(eml))) return true;
                                // 무명: 양쪽 표기(무명 수험생/미지정/빈값)가 달라도 삭제되도록
                                return targetIsAnonymous && isAnonName(nm) && isAnonName(rnm);
                            })
                            .map(row => String(row.id));
                        for (const extraId of extraIds) {
                            try { markSupabasePushed('assessments', extraId); } catch { /* ignore */ }
                            try {
                                const { error } = await (supabase.from('assessments' as any) as any).delete().eq('id', extraId);
                                if (!error) supabaseDeleted++;
                                else {
                                    const msg = (error as any)?.message || String(error);
                                    supabaseErrors.push(msg);
                                    console.warn('[deleteStudentRecords] Supabase delete failed:', msg);
                                }
                            } catch (e) {
                                supabaseErrors.push(e instanceof Error ? e.message : String(e));
                                console.warn('[deleteStudentRecords] Supabase delete error:', e);
                            }
                        }
                    }
                } catch { /* ignore */ }
            }

            // 등급 오버라이드 제거 (남기면 목록에 0-record 유령 학생으로 재생성됨)
            try {
                const { UserTierService } = await import('./userTierService');
                for (const ident of identities) {
                    try { UserTierService.removeUserTier(ident); } catch { /* ignore */ }
                }
            } catch { /* ignore */ }

            // localStorage 미러/프로필/사용플래그 정리 (미러 복원 부활 차단)
            try { pruneLocalStudentTraces(identities); } catch { /* ignore */ }

            // sn1_history 미러를 DB 기준으로 재작성 (삭제분 미러 잔류 차단)
            // 미러는 최신 5건만 유지 (App 전역과 동일 규격 — 전체 기록은 IndexedDB가 진실원천)
            try {
                const latest = await db.history.orderBy('date').reverse().limit(5).toArray().catch(() => []);
                saveMirrorOrDrop('sn1_history', (latest || []) as unknown[]);
            } catch { /* ignore */ }

            return { deleted: deleteIds.length, supabaseDeleted, supabaseError: supabaseErrors[0] };
        } catch (error) {
            console.error('Failed to delete student records:', error);
            throw error;
        }
    },

    /**
     * 특정 학생의 모든 히스토리 및 프로필의 멤버십 등급 일괄 업데이트
     */
    async updateStudentMembershipTier(studentIdOrName: string, newTier: string): Promise<number> {
        try {
            const target = studentIdOrName.trim().toLowerCase();
            const all = await db.history.toArray();
            let updatedCount = 0;
            for (const record of all) {
                const sName = (record.student?.name || '').trim().toLowerCase();
                const sId = (record.student?.id || '').trim().toLowerCase();
                const sEmail = (record.student?.email || '').trim().toLowerCase();
                if (sName === target || sId === target || sEmail === target) {
                    if (!record.student) (record as any).student = {};
                    record.student.membershipTier = newTier as any;
                    await db.history.put(record);
                    updatedCount++;
                }
            }
            const profiles = await db.students.toArray();
            for (const prof of profiles) {
                const pName = (prof.name || '').trim().toLowerCase();
                const pId = (prof.studentId || '').trim().toLowerCase();
                const pEmail = ((prof as any).email || '').trim().toLowerCase();
                if (pName === target || pId === target || pEmail === target) {
                    prof.membershipTier = newTier as any;
                    await db.students.put(prof);
                }
            }
            return updatedCount;
        } catch (error) {
            console.error('Failed to update student membership tier in DB:', error);
            return 0;
        }
    },

    /**
     * 학생 중복 레코드 정리 (Deduplication)
     * 동일 학생의 동일 날짜 또는 동일 검사 중복 레코드 자동 통합
     */
    async deduplicateHistory(): Promise<number> {
        try {
            const all = await db.history.toArray();
            const groups = new Map<string, HistoryRecord[]>();

            for (const record of all) {
                const sName = record.student?.name?.trim() || '';
                const sId = record.student?.id?.trim() || '';
                // 저장 시각(date)이 아닌 검사일(testDate) 기준 — 동일 검사의 반복 저장분을 하나로 묶음
                const sDate = record.student?.testDate || record.date || '';
                const sCare = record.careType || '';
                const key = `${sName.toLowerCase()}_${sId.toLowerCase()}_${sDate}_${sCare}_${record.score || 0}`;
                const list = groups.get(key);
                if (list) list.push(record);
                else groups.set(key, [record]);
            }

            const deleteIds: number[] = [];
            for (const list of groups.values()) {
                if (list.length <= 1) continue;
                // Supabase 연결분(supabaseId 보유)을 우선 유지 — 원격 재부활·재푸시 방지
                const keeper = list.find(r => (r as any)?.supabaseId) || list[0];
                for (const r of list) {
                    if (r !== keeper && r.id) deleteIds.push(r.id);
                }
            }
            // 빈껍데기(무응답 재계산) 기록은 그룹과 무관하게 전량 제거
            for (const record of all) {
                if (record.id && isBlankSurveyRecord(record) && !deleteIds.includes(record.id)) {
                    deleteIds.push(record.id);
                }
            }

            if (deleteIds.length > 0) {
                await db.history.bulkDelete(deleteIds);
            }
            return deleteIds.length;
        } catch (error) {
            console.error('Failed to deduplicate history:', error);
            return 0;
        }
    },
    async updateHistory(record: HistoryRecord): Promise<void> {
        try {
            if (!record.id && record.student?.id) {
                const existing = await db.history
                    .where('student.id')
                    .equals(record.student.id)
                    .and(h => h.date === record.date)
                    .first();
                if (existing?.id) {
                    record.id = existing.id;
                }
            }
            if (record.id) {
                record.syncStatus = 'pending';
                await db.history.put(record);
                // 백그라운드 Push (UPDATE → assessments upsert, realtime으로 전파)
                this.syncRecordToSupabase({ ...record, syncStatus: 'pending' }).catch(() => {});
            }
        } catch (error) {
            console.error('Failed to update history:', error);
            throw error;
        }
    },

    /**
     * 히스토리 전체 삭제
     */
    async clearAllHistory(): Promise<void> {
        try {
            await db.history.clear();
        } catch (error) {
            console.error('Failed to clear history:', error);
            throw error;
        }
    },

    /**
     * 히스토리 대량 가져오기 (Import)
     */
    async importHistory(records: HistoryRecord[], merge: boolean = true): Promise<void> {
        try {
            if (!merge) {
                await db.history.clear();
            }

            const existingDates = new Set(
                (await db.history.toArray()).map(h => h.date)
            );

            const newRecords = records
                .filter(r => !merge || !existingDates.has(r.date))
                .map(r => ({
                    ...r,
                    syncStatus: 'local' as const
                }));

            await db.history.bulkAdd(newRecords);
        } catch (error) {
            console.error('Failed to import history:', error);
            throw error;
        }
    },

    /**
     * 특정 학생의 히스토리 조회
     */
    /**
     * 특정 학생의 히스토리 조회 (ID 기준)
     */
    async getHistoryByStudent(studentId: string): Promise<HistoryRecord[]> {
        try {
            const cleanId = (studentId || '').trim().toLowerCase();
            let records = await db.history
                .where('student.id')
                .equals(studentId)
                .reverse()
                .sortBy('date');

            if (records.length === 0) {
                const all = await this.getAllHistory();
                records = all.filter(r => 
                    r.student?.id?.toLowerCase() === cleanId ||
                    r.student?.name?.toLowerCase() === cleanId ||
                    r.student?.email?.toLowerCase() === cleanId
                );
            }
            if (records.length === 0 && cleanId === 'limsd7') {
                return getLimsd7Records();
            }
            return records;
        } catch (error) {
            console.error('Failed to get student history:', error);
            if ((studentId || '').trim().toLowerCase() === 'limsd7') {
                return getLimsd7Records();
            }
            return [];
        }
    },

    /**
     * 이름과 생년월일로 학생 히스토리 조회 (권장)
     * ID가 매번 변경되는 경우 사용
     */
    async getHistoryByStudentInfo(name: string, birthDate?: string): Promise<HistoryRecord[]> {
        try {
            const cleanName = name.trim();
            const cleanBirthDate = birthDate?.trim();

            console.log(`[DB Debug] Querying History for: Name="${cleanName}", BirthDate="${cleanBirthDate}"`);

            // 이름으로 1차 조회 (IndexedDB Index 활용)
            let records = await db.history
                .where('student.name')
                .equals(cleanName)
                .toArray();

            console.log(`[DB Debug] Found ${records.length} records by name "${cleanName}"`);

            // 데이터가 없으면 혹시 모르니 전체 스캔해서 이름 포함 여부 확인 (비효율적이지만 디버깅용)
            if (records.length === 0) {
                console.warn("[DB Debug] No records found by index. Scanning all records for partial match...");
                const all = await db.history.toArray();
                const partialMatches = all.filter(r => r.student.name.includes(cleanName));
                if (partialMatches.length > 0) {
                    console.log(`[DB Debug] Found ${partialMatches.length} partial matches manually. Index might be broken or case mismatch.`);
                    records = partialMatches;
                } else {
                    console.log(`[DB Debug] Database contains ${all.length} total records. Top 5 names:`, all.slice(0, 5).map(r => r.student.name));
                }
            }

            // 생년월일로 2차 필터링
            const filtered = cleanBirthDate
                ? records.filter(r => {
                    if (!r.student.birthDate) return true; // 생년월일 없으면 포함 (관대하게)
                    const match = r.student.birthDate === cleanBirthDate;
                    if (!match) console.log(`[DB Debug] Mismatch: Record(${r.student.birthDate}) != Query(${cleanBirthDate})`);
                    return match;
                })
                : records;

            console.log(`[DB Debug] Final filtered count: ${filtered.length}`);

            // 날짜순 정렬
            return filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        } catch (error) {
            console.error('Failed to get student history by info:', error);
            return [];
        }
    },

    /**
     * 최근 N개 히스토리 조회
     */
    async getRecentHistory(limit: number = 10): Promise<HistoryRecord[]> {
        try {
            return await db.history
                .orderBy('date')
                .reverse()
                .limit(limit)
                .toArray();
        } catch (error) {
            console.error('Failed to get recent history:', error);
            return [];
        }
    },

    /**
     * 이름으로 학생 검색 (history 테이블에서)
     * 동일 학생 재검사 시 기존 데이터 불러오기용
     */
    async searchStudentsByName(name: string): Promise<{ student: StudentInfo; latestDate: string; count: number }[]> {
        try {
            if (!name || name.trim().length === 0) return [];

            const allHistory = await db.history.toArray();

            // 이름으로 필터링 (부분 일치)
            const matchingRecords = allHistory.filter(record =>
                record.student?.name?.toLowerCase().includes(name.toLowerCase().trim())
            );

            // 학생별로 그룹화
            const studentMap = new Map<string, { student: StudentInfo; records: HistoryRecord[] }>();

            matchingRecords.forEach(record => {
                const key = `${record.student.name}-${record.student.birthDate || ''}`;
                if (!studentMap.has(key)) {
                    studentMap.set(key, { student: record.student, records: [] });
                }
                studentMap.get(key)!.records.push(record);
            });

            // 결과 정리 (최신 검사 날짜, 검사 횟수 포함)
            return Array.from(studentMap.values()).map(({ student, records }) => ({
                student,
                latestDate: records.sort((a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                )[0].date,
                count: records.length
            })).sort((a, b) =>
                new Date(b.latestDate).getTime() - new Date(a.latestDate).getTime()
            );
        } catch (error) {
            console.error('Failed to search students:', error);
            return [];
        }
    },

    /**
     * 학생 프로필 업데이트 (게이미피케이션 및 프로필 정보 갱신용)
     */
    async updateStudent(student: StudentInfo): Promise<void> {
        try {
            if (!student || (!student.name?.trim() && !student.id?.trim())) return;
            // 이름이 없는 미완성 학생 프로필은 students 테이블에 추가하지 않음
            if (!student.name?.trim()) return;

            const { id: studentIdStr, ...studentData } = student;
            const cleanName = student.name.trim();

            // 1. studentId 또는 name으로 기존 프로필 조회
            let profile: StudentProfile | undefined;

            const existingByName = await db.students.where('name').equals(cleanName).toArray();
            profile = existingByName.find(p => p.studentId === student.id);
            if (!profile && student.birthDate) {
                profile = existingByName.find(p => p.birthDate === student.birthDate);
            }
            if (!profile && existingByName.length > 0) {
                profile = existingByName[0];
            }

            if (!profile && studentIdStr) {
                const all = await db.students.toArray();
                profile = all.find(p => p.studentId === studentIdStr);
            }

            // [name+birthDate] 복합 유니크 제약 사전 조회
            if (!profile && student.birthDate) {
                try {
                    profile = await db.students
                        .where('[name+birthDate]')
                        .equals([cleanName, student.birthDate])
                        .first();
                } catch { /* ignore */ }
            }

            if (profile && profile.id !== undefined) {
                await db.students.update(profile.id, {
                    ...studentData,
                    name: cleanName,
                    studentId: studentIdStr || profile.studentId,
                    updatedAt: new Date().toISOString()
                } as any);
            } else {
                try {
                    await db.students.add({
                        ...studentData,
                        name: cleanName,
                        studentId: studentIdStr,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    } as any);
                } catch (addErr: any) {
                    // [name+birthDate] 복합 유니크 제약 충돌 시 기존 레코드 찾아서 update 수행
                    const allStudents = await db.students.toArray();
                    const conflict = allStudents.find(s => 
                        (s.name === cleanName && s.birthDate === student.birthDate) ||
                        (studentIdStr && s.studentId === studentIdStr)
                    );

                    if (conflict && conflict.id !== undefined) {
                        await db.students.update(conflict.id, {
                            ...studentData,
                            name: cleanName,
                            studentId: studentIdStr || conflict.studentId,
                            updatedAt: new Date().toISOString()
                        } as any);
                    } else {
                        // 중복 또는 인덱스 충돌 발생 시 안전하게 기록 갱신
                        const byName = allStudents.find(s => s.name === cleanName);
                        if (byName && byName.id !== undefined) {
                            await db.students.update(byName.id, {
                                ...studentData,
                                name: cleanName,
                                studentId: studentIdStr || byName.studentId,
                                updatedAt: new Date().toISOString()
                            } as any);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Failed to update student:', error);
        }
    },

    // ==================== Settings 관련 ====================

    /**
     * 설정 저장
     */
    async setSetting(key: string, value: string): Promise<void> {
        try {
            const existing = await db.settings.where('key').equals(key).first();
            if (existing) {
                await db.settings.update(existing.id!, {
                    value,
                    updatedAt: new Date().toISOString()
                });
            } else {
                await db.settings.add({
                    key,
                    value,
                    updatedAt: new Date().toISOString()
                });
            }
        } catch (error) {
            console.error('Failed to set setting:', error);
            throw error;
        }
    },

    /**
     * 설정 조회
     */
    async getSetting(key: string): Promise<string | null> {
        try {
            const setting = await db.settings.where('key').equals(key).first();
            return setting?.value ?? null;
        } catch (error) {
            console.error('Failed to get setting:', error);
            return null;
        }
    },

    // ==================== Migration 관련 ====================

    /**
     * localStorage의 데이터를 IndexedDB로 똑똑하게 동기화 (누락된 데이터 복구용)
     */
    async syncLocalStorageData(): Promise<number> {
        try {
            const saved = localStorage.getItem('sn1_history');
            if (!saved) return 0;

            const localRecords: HistoryRecord[] = JSON.parse(saved);
            if (!Array.isArray(localRecords) || localRecords.length === 0) return 0;

            let addedCount = 0;

            // 기존 DB 데이터의 날짜 Set 생성 (빠른 조회를 위해)
            const dbRecords = await db.history.toArray();
            const dbDates = new Set(dbRecords.map(r => r.date));

            // DB에 없는 레코드만 필터링하여 추가 (date 기준, 빈껍데기 제외)
            const missingRecords = localRecords.filter(local => !dbDates.has(local.date) && !isBlankSurveyRecord(local));

            if (missingRecords.length > 0) {
                // ++id 자동증가 컬럼 충돌 방지를 위해 기존 id 제거 후 추가
                const toAdd = missingRecords.map(r => {
                    const { id, ...rest } = r as any;
                    return {
                        ...rest,
                        syncStatus: 'local' as const
                    };
                });

                try {
                    await db.history.bulkAdd(toAdd);
                    addedCount = missingRecords.length;
                } catch {
                    // bulkAdd 실패 시 레코드별 개별 안전 추가
                    for (const item of toAdd) {
                        try {
                            await db.history.add(item);
                            addedCount++;
                        } catch (err) {
                            console.warn('Skipping duplicate record sync:', err);
                        }
                    }
                }
                console.log(`Synced ${addedCount} missing records from localStorage to IndexedDB.`);
            }

            // localStorage 미러는 단일 상수로 축소 (10개)
            if (localRecords.length > 10) {
                safeStorage.saveJSON('sn1_history', localRecords.slice(0, 10));
            }

            return addedCount;
        } catch (error) {
            console.error('Failed to sync localStorage data:', error);
            return 0;
        }
    },

    /**
     * localStorage에서 IndexedDB로 데이터 마이그레이션 (구버전 호환용)
     */
    async migrateFromLocalStorage(): Promise<boolean> {
        // 기존 로직 유지하되, syncLocalStorage이 더 강력하므로 내부적으로 호출
        const count = await this.syncLocalStorageData();
        if (count > 0) {
            await this.setSetting('migrated_from_localstorage', 'true');
            return true;
        }
        return false;
    },

    // ==================== 유틸리티 ====================

    /**
     * 데이터베이스 통계
     */
    async getStats(): Promise<{
        historyCount: number;
        studentsCount: number;
        oldestRecord: string | null;
        newestRecord: string | null;
    }> {
        try {
            const historyCount = await db.history.count();
            const studentsCount = await db.students.count();

            const oldest = await db.history.orderBy('date').first();
            const newest = await db.history.orderBy('date').last();

            return {
                historyCount,
                studentsCount,
                oldestRecord: oldest?.date ?? null,
                newestRecord: newest?.date ?? null
            };
        } catch (error) {
            console.error('Failed to get stats:', error);
            return {
                historyCount: 0,
                studentsCount: 0,
                oldestRecord: null,
                newestRecord: null
            };
        }
    },

    // ==================== Consultation History 관련 ====================

    /**
     * 상담 이력 추가
     */
    async addConsultation(consultation: Omit<ConsultationHistory, 'id'>): Promise<number | undefined> {
        try {
            return await db.consultations.add({
                ...consultation,
                date: consultation.date || new Date().toISOString()
            });
        } catch (error) {
            console.error('Failed to add consultation:', error);
            throw error;
        }
    },

    /**
     * 특정 학생의 상담 이력 조회
     */
    async getConsultationsByStudent(studentId: string): Promise<ConsultationHistory[]> {
        try {
            return await db.consultations
                .where('studentId')
                .equals(studentId)
                .reverse()
                .sortBy('date');
        } catch (error) {
            console.error('Failed to get consultations:', error);
            return [];
        }
    },

    /**
     * 최근 상담 이력 조회
     */
    async getRecentConsultations(limit: number = 10): Promise<ConsultationHistory[]> {
        try {
            return await db.consultations
                .orderBy('date')
                .reverse()
                .limit(limit)
                .toArray();
        } catch (error) {
            console.error('Failed to get recent consultations:', error);
            return [];
        }
    },

    /**
     * 상담 이력 삭제
     */
    async deleteConsultation(id: number): Promise<void> {
        try {
            await db.consultations.delete(id);
        } catch (error) {
            console.error('Failed to delete consultation:', error);
            throw error;
        }
    },

    // ==================== Self Check Results ====================

    /**
     * 자가진단 결과 추가
     */
    async addSelfCheckResult(result: Omit<SelfCheckResult, 'id'>): Promise<number | undefined> {
        try {
            return await db.selfCheckResults.add({
                ...result,
                createdAt: result.createdAt || new Date().toISOString()
            });
        } catch (error) {
            console.error('Failed to add self check result:', error);
            throw error;
        }
    },

    /**
     * 특정 학생의 자가진단 결과 조회
     */
    async getSelfCheckByStudent(studentId: string, careType?: string): Promise<SelfCheckResult[]> {
        try {
            let query = db.selfCheckResults.where('studentId').equals(studentId);

            if (careType) {
                const results = await query.toArray();
                return results.filter(r => r.careType === careType).sort((a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
            }

            return await query.reverse().sortBy('createdAt');
        } catch (error) {
            console.error('Failed to get self check results:', error);
            return [];
        }
    },

    // ==================== Routine Tracking ====================

    /**
     * 루틴 추적 기록 추가
     */
    async addRoutineTracking(tracking: Omit<RoutineTracking, 'id'>): Promise<number | undefined> {
        try {
            return await db.routineTracking.add({
                ...tracking,
                createdAt: tracking.createdAt || new Date().toISOString()
            });
        } catch (error) {
            console.error('Failed to add routine tracking:', error);
            throw error;
        }
    },

    /**
     * 특정 학생의 루틴 추적 기록 조회
     */
    async getRoutineByStudent(studentId: string, careType?: string, limit: number = 30): Promise<RoutineTracking[]> {
        try {
            let query = db.routineTracking.where('studentId').equals(studentId);

            if (careType) {
                const results = await query.limit(limit).toArray();
                return results.filter(r => r.careType === careType).sort((a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
            }

            return await query.reverse().limit(limit).sortBy('createdAt');
        } catch (error) {
            console.error('Failed to get routine tracking:', error);
            return [];
        }
    },

    // ==================== Study Efficiency Results ====================

    /**
     * 공부 효율성 검사회 결과 저장 (중간 저장용)
     */
    async addStudyEfficiencyResult(record: Omit<StudyEfficiencyRecord, 'id'>): Promise<number | undefined> {
        try {
            // 동일 날짜/학생의 기존 기록이 있는지 확인하고 업데이트하거나 새로 추가
            // 하루에 여러 번 할 수도 있지만, 가장 최근 것을 우선시하거나 추가함.
            // 여기서는 단순 추가 로직 사용
            return await db.studyEfficiency.add({
                ...record,
                createdAt: record.createdAt || new Date().toISOString()
            });
        } catch (error) {
            console.error('Failed to add study efficiency result:', error);
            throw error;
        }
    },

    /**
     * 특정 학생의 최근 공부 효율성 검사 결과 조회
     */
    async getStudyEfficiencyResult(studentId: string): Promise<StudyEfficiencyRecord | undefined> {
        try {
            return await db.studyEfficiency
                .where('studentId')
                .equals(studentId)
                .reverse()
                .sortBy('date')
                .then(results => results[0]);
        } catch (error) {
            console.error('Failed to get study efficiency result:', error);
            return undefined;
        }
    },

    // ==================== Working Memory Results ====================

    async addWorkingMemoryResult(record: Omit<WorkingMemoryRecord, 'id'>): Promise<number | undefined> {
        try {
            return await db.workingMemory.add({
                ...record,
                createdAt: record.createdAt || new Date().toISOString()
            });
        } catch (error) {
            console.error('Failed to add working memory result:', error);
            throw error;
        }
    },

    async getWorkingMemoryResult(studentId: string): Promise<WorkingMemoryRecord | undefined> {
        try {
            return await db.workingMemory
                .where('studentId')
                .equals(studentId)
                .reverse()
                .sortBy('date')
                .then(results => results[0]);
        } catch (error) {
            console.error('Failed to get working memory result:', error);
            return undefined;
        }
    },

    // ==================== Cognitive Performance Results ====================

    async addCognitivePerformanceResult(record: Omit<CognitivePerformanceRecord, 'id'>): Promise<number | undefined> {
        try {
            return await db.cognitivePerformance.add({
                ...record,
                createdAt: record.createdAt || new Date().toISOString()
            });
        } catch (error) {
            console.error('Failed to add cognitive performance result:', error);
            throw error;
        }
    },

    async getCognitivePerformanceResult(studentId: string): Promise<CognitivePerformanceRecord | undefined> {
        try {
            return await db.cognitivePerformance
                .where('studentId')
                .equals(studentId)
                .reverse()
                .sortBy('date')
                .then(results => results[0]);
        } catch (error) {
            console.error('Failed to get cognitive performance result:', error);
            return undefined;
        }
    },

    // ==================== Grade Management ====================

    async syncGradeRecordToSupabase(record: GradeRecord): Promise<boolean> {
        try {
            if (!isSupabaseReady() || !supabase) return false;
            const payload: any = {
                user_id: await getSupabaseUid(),
                id: record.id,
                student_id: record.studentId,
                exam_name: record.examName,
                exam_type: record.examType,
                exam_date: record.examDate,
                subjects: record.subjects || [],
                // Android 공용 컬럼 (PC 원본에는 없으면 빈 배열, Android에서 온 row는 보존값)
                scores: (record as any).scores || [],
                memo: record.memo || '',
                updated_at: new Date().toISOString()
            };
            const { error } = await supabase.from('grade_records' as any).upsert(payload, { onConflict: 'id' } as any);
            if (!error) markSupabasePushed('grade_records', record.id);
            return !error;
        } catch {
            return false;
        }
    },

    async syncGradeGoalToSupabase(goal: GradeGoal): Promise<boolean> {
        try {
            if (!isSupabaseReady() || !supabase) return false;
            const payload: any = {
                user_id: await getSupabaseUid(),
                id: goal.id,
                student_id: goal.studentId,
                subject_id: goal.subjectId,
                tier1_target: goal.tier1Target,
                tier2_target: goal.tier2Target,
                tier3_target: goal.tier3Target,
                current_grade: goal.currentGrade,
                memo: goal.memo || '',
                updated_at: new Date().toISOString()
            };
            const { error } = await supabase.from('grade_goals' as any).upsert(payload, { onConflict: 'id' } as any);
            if (!error) markSupabasePushed('grade_goals', goal.id);
            return !error;
        } catch {
            return false;
        }
    },

    async addGradeRecord(record: GradeRecord): Promise<string | undefined> {
        try {
            const id = await db.gradeRecords.add(record);
            this.syncGradeRecordToSupabase(record).catch(() => {});
            return id;
        } catch (error) {
            console.error('Failed to add grade record:', error);
            throw error;
        }
    },

    async updateGradeRecord(record: GradeRecord): Promise<string | undefined> {
        try {
            await db.gradeRecords.put(record);
            this.syncGradeRecordToSupabase(record).catch(() => {});
            return record.id;
        } catch (error) {
            console.error('Failed to update grade record:', error);
            throw error;
        }
    },

    async getGradeRecords(studentId: string): Promise<GradeRecord[]> {
        try {
            if (!studentId) return [];
            const cleanId = studentId.trim().toLowerCase();
            const idWithoutEmail = cleanId.includes('@') ? cleanId.split('@')[0] : cleanId;

            let records = await db.gradeRecords
                .where('studentId')
                .equals(studentId)
                .reverse()
                .sortBy('examDate');

            if (records.length === 0) {
                // 대소문자 차이, 이메일 프리픽스, limsd7 호환 조회
                const all = await db.gradeRecords.toArray();
                records = all.filter(r => {
                    const rId = (r.studentId || '').trim().toLowerCase();
                    const rIdPrefix = rId.includes('@') ? rId.split('@')[0] : rId;
                    return rId === cleanId || 
                           rId === idWithoutEmail || 
                           rIdPrefix === idWithoutEmail ||
                           (cleanId === 'limsd7' && rId.includes('limsd7'));
                }).sort((a, b) => new Date(b.examDate).getTime() - new Date(a.examDate).getTime());
            }

            return records;
        } catch (error) {
            console.error('Failed to get grade records:', error);
            return [];
        }
    },

    async deleteGradeRecord(id: string): Promise<void> {
        try {
            await db.gradeRecords.delete(id);
            if (isSupabaseReady()) {
                try {
                    await supabase.from('grade_records' as any).delete().eq('id', id);
                } catch { /* ignore */ }
            }
        } catch (error) {
            console.error('Failed to delete grade record:', error);
            throw error;
        }
    },

    async upsertGradeGoal(goal: GradeGoal): Promise<string | undefined> {
        try {
            const cleanId = (goal.studentId || '').trim().toLowerCase();
            const idWithoutEmail = cleanId.includes('@') ? cleanId.split('@')[0] : cleanId;

            let existing = await db.gradeGoals
                .where('studentId')
                .equals(goal.studentId)
                .and(g => g.subjectId === goal.subjectId)
                .first();

            if (!existing) {
                const all = await db.gradeGoals.where('subjectId').equals(goal.subjectId).toArray();
                existing = all.find(g => {
                    const gId = (g.studentId || '').trim().toLowerCase();
                    const gIdPrefix = gId.includes('@') ? gId.split('@')[0] : gId;
                    return gId === cleanId || 
                           gId === idWithoutEmail || 
                           gIdPrefix === idWithoutEmail ||
                           (cleanId === 'limsd7' && gId.includes('limsd7'));
                });
            }

            const targetId = existing?.id || goal.id || `goal_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            const finalGoal: GradeGoal = {
                ...goal,
                id: targetId,
            };

            await db.gradeGoals.put(finalGoal);
            this.syncGradeGoalToSupabase(finalGoal).catch(() => {});
            return targetId;
        } catch (error) {
            console.error('Failed to upsert grade goal:', error);
            throw error;
        }
    },

    async getGradeGoals(studentId: string): Promise<GradeGoal[]> {
        try {
            if (!studentId) return [];
            const cleanId = studentId.trim().toLowerCase();
            const idWithoutEmail = cleanId.includes('@') ? cleanId.split('@')[0] : cleanId;

            let goals = await db.gradeGoals
                .where('studentId')
                .equals(studentId)
                .toArray();

            if (goals.length === 0) {
                const all = await db.gradeGoals.toArray();
                goals = all.filter(g => {
                    const gId = (g.studentId || '').trim().toLowerCase();
                    const gIdPrefix = gId.includes('@') ? gId.split('@')[0] : gId;
                    return gId === cleanId || 
                           gId === idWithoutEmail || 
                           gIdPrefix === idWithoutEmail ||
                           (cleanId === 'limsd7' && gId.includes('limsd7'));
                });
            }

            return goals;
        } catch (error) {
            console.error('Failed to get grade goals:', error);
            return [];
        }
    },

    async deleteGradeGoal(id: string): Promise<void> {
        try {
            await db.gradeGoals.delete(id);
            if (isSupabaseReady()) {
                try {
                    await supabase.from('grade_goals' as any).delete().eq('id', id);
                } catch { /* ignore */ }
            }
        } catch (error) {
            console.error('Failed to delete grade goal:', error);
            throw error;
        }
    },

    // ==================== Gamification Progress (기기 간 공유) ====================

    // 로컬 미러 키 (서버 미구성·오프라인 시 폴백 저장소)
    gamificationMirrorKey(studentId: string, weekKey: string): string {
        return `nbass_gamification_${studentId}_${weekKey}`;
    },

    async getGamificationProgress(studentId: string, weekKey: string): Promise<GamificationProgress | null> {
        // 1) 서버 우선 (RLS user_id 기준 본인 데이터)
        try {
            if (isSupabaseReady() && supabase && studentId) {
                const { data, error } = await supabase
                    .from('gamification_progress' as any)
                    .select('*')
                    .eq('student_id', studentId)
                    .eq('week_key', weekKey)
                    .maybeSingle();
                if (!error && data) {
                    const remote: GamificationProgress = {
                        studentId: (data as any).student_id,
                        weekKey: (data as any).week_key,
                        completedTasks: Array.isArray((data as any).completed_tasks) ? (data as any).completed_tasks : [],
                        exp: Number((data as any).exp) || 0,
                        level: Number((data as any).level) || 1,
                        streak: Number((data as any).streak) || 0,
                        lastCompletedDate: (data as any).last_completed_date || undefined,
                        updatedAt: (data as any).updated_at,
                        taskLog: ((data as any).task_log && typeof (data as any).task_log === 'object') ? (data as any).task_log : undefined
                    };
                    // 로컬 미러 갱신
                    try {
                        safeStorage.saveJSON(this.gamificationMirrorKey(studentId, weekKey), remote as never);
                    } catch { /* ignore */ }
                    return remote;
                }
            }
        } catch { /* 서버 실패 시 로컬 미러로 폴백 */ }
        // 2) 로컬 미러
        try {
            if (!studentId) return null;
            return safeStorage.getJSON<GamificationProgress | null>(
                this.gamificationMirrorKey(studentId, weekKey), null
            );
        } catch {
            return null;
        }
    },

    async saveGamificationProgress(
        studentId: string,
        weekKey: string,
        progress: { completedTasks: string[]; exp: number; level: number; streak: number; lastCompletedDate?: string; taskLog?: Record<string, { done: boolean; at: string }> }
    ): Promise<boolean> {
        if (!studentId) return false;
        const now = new Date().toISOString();
        // 로컬 미러는 항상 기록 (오프라인 보장)
        try {
            safeStorage.saveJSON(this.gamificationMirrorKey(studentId, weekKey), {
                studentId, weekKey, ...progress, updatedAt: now
            } as never);
        } catch { /* ignore */ }
        // 서버 upsert (실패해도 로컬은 유지)
        try {
            if (!isSupabaseReady() || !supabase) return false;
            const payload: any = {
                user_id: await getSupabaseUid(),
                student_id: studentId,
                week_key: weekKey,
                completed_tasks: progress.completedTasks || [],
                exp: progress.exp || 0,
                level: progress.level || 1,
                streak: progress.streak || 0,
                last_completed_date: progress.lastCompletedDate || null,
                task_log: progress.taskLog || {},
                updated_at: now
            };
            const { error } = await supabase.from('gamification_progress' as any).upsert(payload, { onConflict: 'student_id,week_key' } as any);
            return !error;
        } catch {
            return false;
        }
    },

    // Realtime 구독: 같은 학생의 원격 변경을 즉시 수신 (미구성 시 빈 해제 함수)
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
        try {
            if (!isSupabaseReady() || !supabase || !studentId) return () => {};
            const channel = supabase
                .channel(`gamification_${studentId}_${weekKey}`)
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'gamification_progress',
                    filter: `student_id=eq.${studentId}`
                }, (payload: any) => {
                    try {
                        const row = payload?.new;
                        if (!row || row.week_key !== weekKey) return;
                        onRemote({
                            completedTasks: Array.isArray(row.completed_tasks) ? row.completed_tasks : [],
                            exp: Number(row.exp) || 0,
                            level: Number(row.level) || 1,
                            streak: Number(row.streak) || 0,
                            lastCompletedDate: row.last_completed_date || undefined,
                            taskLog: (row.task_log && typeof row.task_log === 'object') ? row.task_log : undefined,
                            updatedAt: row.updated_at
                        });
                    } catch { /* ignore */ }
                })
                .subscribe();
            return () => {
                try {
                    supabase.removeChannel(channel);
                } catch { /* ignore */ }
            };
        } catch {
            return () => {};
        }
    },

    // ==================== Habit Progress (기기 간 공유, 필드별 LWW) ====================

    habitProgressMirrorKey(studentId: string): string {
        return `nbass_habit_progress_server_${studentId}`;
    },

    async getHabitProgress(studentId: string): Promise<Record<string, { v: unknown; at: string }> | null> {
        // 1) 서버 우선 (RLS user_id 기준 본인 데이터)
        try {
            if (isSupabaseReady() && supabase && studentId) {
                const { data, error } = await supabase
                    .from('habit_progress' as any)
                    .select('*')
                    .eq('student_id', studentId)
                    .maybeSingle();
                if (!error && data && (data as any).fields && typeof (data as any).fields === 'object') {
                    const remote = (data as any).fields as Record<string, { v: unknown; at: string }>;
                    // 로컬 미러 갱신 (서버 우선·로컬 미러 폴백)
                    try {
                        safeStorage.saveJSON(this.habitProgressMirrorKey(studentId), remote as never);
                    } catch { /* ignore */ }
                    return remote;
                }
            }
        } catch { /* 서버 실패 시 로컬 미러로 폴백 */ }
        // 2) 로컬 미러
        try {
            if (!studentId) return null;
            return safeStorage.getJSON<Record<string, { v: unknown; at: string }> | null>(
                this.habitProgressMirrorKey(studentId), null
            );
        } catch {
            return null;
        }
    },

    async saveHabitProgress(
        studentId: string,
        fields: Record<string, { v: unknown; at: string }>
    ): Promise<boolean> {
        if (!studentId) return false;
        const now = new Date().toISOString();
        // 로컬 미러는 항상 기록 (오프라인 보장)
        try {
            safeStorage.saveJSON(this.habitProgressMirrorKey(studentId), (fields || {}) as never);
        } catch { /* ignore */ }
        // 서버 upsert (실패해도 로컬은 유지)
        try {
            if (!isSupabaseReady() || !supabase) return false;
            const payload: any = {
                user_id: await getSupabaseUid(),
                student_id: studentId,
                fields: fields || {},
                updated_at: now
            };
            const { error } = await supabase.from('habit_progress' as any).upsert(payload, { onConflict: 'student_id' } as any);
            return !error;
        } catch {
            return false;
        }
    },

    // ==================== Sleep Record 관련 ====================
    async syncSleepRecordToSupabase(record: SleepRecord): Promise<boolean> {
        try {
            if (!isSupabaseReady() || !supabase) return false;
            const qualityNum = record.sleepQuality ?? 3;
            const payload: any = {
                id: record.id,
                student_id: record.studentId,
                date: record.date,
                bedtime: record.bedtime,
                wake_time: record.wakeTime,
                sleep_quality: qualityNum,
                memo: record.memo || '',
                stages: record.stages || {},
                night_hrv: record.nightHrv || null,
                screen_time: record.screenTimeBeforeBed || null,
                sleep_delay: record.sleepDelay || null,
                // Android 공용 컬럼 (Android에서 온 row의 원본 보존, PC 원본은 매핑값)
                bed_time: (record as any).bed_time ?? record.bedtime ?? null,
                quality: (record as any).quality ?? (qualityNum >= 4 ? 'GOOD' : qualityNum === 3 ? 'NORMAL' : 'POOR'),
                total_hours: (record as any).totalHours ?? null,
                sleep_debt_hours: (record as any).sleepDebtHours ?? null,
                updated_at: new Date().toISOString()
            };
            const { error } = await supabase.from('sleep_records' as any).upsert(payload, { onConflict: 'id' } as any);
            if (!error) markSupabasePushed('sleep_records', record.id);
            return !error;
        } catch {
            return false;
        }
    },

    async syncSleepGoalToSupabase(goal: SleepGoal): Promise<boolean> {
        try {
            if (!isSupabaseReady() || !supabase) return false;
            const payload: any = {
                id: goal.id,
                student_id: goal.studentId,
                target_bedtime: goal.targetBedtime,
                target_wake_time: goal.targetWakeTime,
                target_duration: goal.targetDuration,
                memo: goal.memo || '',
                current_streak: goal.currentStreak || 0,
                longest_streak: goal.longestStreak || 0,
                condition_score: goal.conditionScore || 0,
                is_dday_mode: goal.isDdayMode || false,
                dday_date: goal.dDayDate || null,
                dday_target_wake_time: goal.dDayTargetWakeTime || null,
                updated_at: new Date().toISOString()
            };
            const { error } = await supabase.from('sleep_goals' as any).upsert(payload, { onConflict: 'id' } as any);
            if (!error) markSupabasePushed('sleep_goals', goal.id);
            return !error;
        } catch {
            return false;
        }
    },

    async addSleepRecord(record: SleepRecord): Promise<string | undefined> {
        try {
            const id = await db.sleepRecords.add(record);
            this.syncSleepRecordToSupabase(record).catch(() => {});
            return id;
        } catch (error) {
            console.error('Failed to add sleep record:', error);
            throw error;
        }
    },

    async updateSleepRecord(record: SleepRecord): Promise<string | undefined> {
        try {
            await db.sleepRecords.put(record);
            this.syncSleepRecordToSupabase(record).catch(() => {});
            return record.id;
        } catch (error) {
            console.error('Failed to update sleep record:', error);
            throw error;
        }
    },

    async getSleepRecords(studentId: string): Promise<SleepRecord[]> {
        try {
            return await db.sleepRecords
                .where('studentId')
                .equals(studentId)
                .reverse()
                .sortBy('date');
        } catch (error) {
            console.error('Failed to get sleep records:', error);
            return [];
        }
    },

    async deleteSleepRecord(id: string): Promise<void> {
        try {
            await db.sleepRecords.delete(id);
            if (isSupabaseReady()) {
                try {
                    await supabase.from('sleep_records' as any).delete().eq('id', id);
                } catch { /* ignore */ }
            }
        } catch (error) {
            console.error('Failed to delete sleep record:', error);
            throw error;
        }
    },

    /**
     * 수면 목표 삭제 (로컬 + Supabase 양방향)
     */
    async deleteSleepGoal(id: string): Promise<void> {
        try {
            await db.sleepGoals.delete(id);
            if (isSupabaseReady()) {
                try {
                    await supabase.from('sleep_goals' as any).delete().eq('id', id);
                } catch { /* ignore */ }
            }
        } catch (error) {
            console.error('Failed to delete sleep goal:', error);
            throw error;
        }
    },

    async upsertSleepGoal(goal: SleepGoal): Promise<string | undefined> {
        try {
            let resId: string | undefined;
            const existing = await db.sleepGoals
                .where('studentId')
                .equals(goal.studentId)
                .first();

            if (existing) {
                await db.sleepGoals.put({ ...goal, id: existing.id });
                resId = existing.id;
            } else {
                resId = await db.sleepGoals.add(goal);
            }
            this.syncSleepGoalToSupabase(goal).catch(() => {});
            return resId;
        } catch (error) {
            console.error('Failed to upsert sleep goal:', error);
            throw error;
        }
    },

    async getSleepGoal(studentId: string): Promise<SleepGoal | undefined> {
        try {
            return await db.sleepGoals
                .where('studentId')
                .equals(studentId)
                .first();
        } catch (error) {
            console.error('Failed to get sleep goal:', error);
            return undefined;
        }
    },

    // ==================== 과목별 AI 클리닉 문제은행 관련 ====================

    /**
     * 문제은행 문제 저장 (지문 핑거프린트 중복 시 기존 항목 반환/업데이트)
     */
    async saveBankQuestion(question: BankQuestion): Promise<string> {
        try {
            // 중복 핑거프린트 확인
            if (question.fingerprint) {
                const existing = await db.questionBank
                    .where('fingerprint')
                    .equals(question.fingerprint)
                    .first();
                if (existing) {
                    // 이미 존재하는 문제면 업데이트만 수행
                    await db.questionBank.put({ ...existing, ...question, id: existing.id });
                    return existing.id;
                }
            }

            await db.questionBank.put(question);
            return question.id;
        } catch (error) {
            console.error('Failed to save bank question:', error);
            throw error;
        }
    },

    /**
     * 조건별 문제은행 문제 목록 조회
     */
    async getBankQuestions(filter?: {
        studentId?: string;
        subjectId?: string;
        strategyType?: string;
        strategyTag?: string;
        isSolved?: boolean;
        isCorrect?: boolean;
    }): Promise<BankQuestion[]> {
        try {
            let collection = db.questionBank.toCollection();

            if (filter?.subjectId) {
                collection = db.questionBank.where('subjectId').equals(filter.subjectId);
            }

            let results = await collection.toArray();

            // 필터링 적용
            if (filter) {
                if (filter.studentId) {
                    results = results.filter(q => q.studentId === filter.studentId || q.studentId === 'global' || !q.studentId);
                }
                if (filter.strategyType) {
                    results = results.filter(q => q.strategyType === filter.strategyType);
                }
                if (filter.strategyTag) {
                    results = results.filter(q => q.strategyTag === filter.strategyTag);
                }
                if (filter.isSolved !== undefined) {
                    results = results.filter(q => q.isSolved === filter.isSolved);
                }
                if (filter.isCorrect !== undefined) {
                    results = results.filter(q => q.isCorrect === filter.isCorrect);
                }
            }

            // 최신 생성순 정렬
            return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        } catch (error) {
            console.error('Failed to get bank questions:', error);
            return [];
        }
    },

    /**
     * 특정 문제 조회
     */
    async getBankQuestionById(id: string): Promise<BankQuestion | undefined> {
        try {
            return await db.questionBank.get(id);
        } catch (error) {
            console.error('Failed to get bank question by id:', error);
            return undefined;
        }
    },

    /**
     * 문제 상태 업데이트 (풀이 완료, 정답 여부, 소요 시간 등)
     */
    async updateBankQuestion(id: string, updates: Partial<BankQuestion>): Promise<void> {
        try {
            await db.questionBank.update(id, updates);
        } catch (error) {
            console.error('Failed to update bank question:', error);
            throw error;
        }
    },

    /**
     * 문제 삭제
     */
    async deleteBankQuestion(id: string): Promise<void> {
        try {
            await db.questionBank.delete(id);
        } catch (error) {
            console.error('Failed to delete bank question:', error);
            throw error;
        }
    },

    /**
     * 이미 출제된 주제 키워드 목록 조회 (AI 프롬프트 제외 목록용)
     */
    async getExistingTopicKeywords(subjectId: string = 'korean', limit: number = 30): Promise<string[]> {
        try {
            const list = await db.questionBank.where('subjectId').equals(subjectId).toArray();
            const keywords = Array.from(new Set(list.map(q => q.topicKeyword).filter(Boolean)));
            return keywords.slice(0, limit);
        } catch (error) {
            console.error('Failed to get existing topic keywords:', error);
            return [];
        }
    },

    /**
     * 지문 핑거프린트로 중복 여부 확인
     */
    async findQuestionByFingerprint(fingerprint: string, subjectId: string = 'korean'): Promise<BankQuestion | undefined> {
        try {
            return await db.questionBank
                .where('fingerprint')
                .equals(fingerprint)
                .first();
        } catch (error) {
            console.error('Failed to check fingerprint duplicate:', error);
            return undefined;
        }
    }
};

export default DatabaseService;
