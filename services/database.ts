/**
 * IndexedDB Database Service using Dexie.js
 * 
 * 이 파일은 영구 데이터 저장을 위한 IndexedDB 래퍼입니다.
 * 추후 Supabase 등 클라우드 DB로 전환 시 이 파일만 수정하면 됩니다.
 */

import Dexie, { type Table } from 'dexie';
import { AssessmentResult, StudentInfo, GradeRecord, GradeGoal } from '../types';
import { StudyEfficiencyResults } from './studyEfficiencyService';

// History Record 타입 정의
export interface HistoryRecord extends AssessmentResult {
    id?: number;  // IndexedDB auto-increment key
    date: string;
    syncStatus?: 'local' | 'synced' | 'pending';  // 추후 클라우드 동기화용
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
            return await db.history.orderBy('date').reverse().toArray();
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
            // 중복 체크
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

            const newRecord: HistoryRecord = {
                ...result,
                date: new Date().toISOString(),
                syncStatus: 'local'
            };

            return await db.history.add(newRecord);
        } catch (error) {
            console.error('Failed to add history:', error);
            throw error;
        }
    },

    /**
     * 히스토리 삭제
     */
    async deleteHistory(id: number): Promise<void> {
        try {
            await db.history.delete(id);
        } catch (error) {
            console.error('Failed to delete history:', error);
            throw error;
        }
    },

    /**
     * 기존 히스토리 레코드를 업데이트합니다.
     */
    async updateHistory(record: HistoryRecord): Promise<void> {
        try {
            if (!record.id) {
                throw new Error("Cannot update history without an id");
            }
            record.syncStatus = 'pending';
            await db.history.put(record);
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
            return await db.history
                .where('student.id')
                .equals(studentId)
                .reverse()
                .sortBy('date');
        } catch (error) {
            console.error('Failed to get student history:', error);
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
            // name과 id(studentId)가 모두 일치하는 항목 찾기
            const existing = await db.students.where('name').equals(student.name).toArray();
            const profile = existing.find(p => p.studentId === student.id || !p.studentId);
            
            if (profile && profile.id !== undefined) {
                await db.students.update(profile.id, {
                    ...student,
                    studentId: student.id,
                    updatedAt: new Date().toISOString()
                });
            } else {
                await db.students.add({
                    ...student,
                    studentId: student.id,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
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

            // DB에 없는 레코드만 필터링하여 추가
            const missingRecords = localRecords.filter(local => !dbDates.has(local.date));

            if (missingRecords.length > 0) {
                // syncStatus 추가하여 bulkAdd
                const toAdd = missingRecords.map(r => ({
                    ...r,
                    syncStatus: 'local' as const
                }));

                await db.history.bulkAdd(toAdd);
                addedCount = missingRecords.length;
                console.log(`Synced ${addedCount} missing records from localStorage to IndexedDB.`);
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

    async addGradeRecord(record: GradeRecord): Promise<string | undefined> {
        try {
            return await db.gradeRecords.add(record);
        } catch (error) {
            console.error('Failed to add grade record:', error);
            throw error;
        }
    },

    async updateGradeRecord(record: GradeRecord): Promise<string | undefined> {
        try {
            await db.gradeRecords.put(record);
            return record.id;
        } catch (error) {
            console.error('Failed to update grade record:', error);
            throw error;
        }
    },

    async getGradeRecords(studentId: string): Promise<GradeRecord[]> {
        try {
            return await db.gradeRecords
                .where('studentId')
                .equals(studentId)
                .reverse()
                .sortBy('examDate');
        } catch (error) {
            console.error('Failed to get grade records:', error);
            return [];
        }
    },

    async deleteGradeRecord(id: string): Promise<void> {
        try {
            await db.gradeRecords.delete(id);
        } catch (error) {
            console.error('Failed to delete grade record:', error);
            throw error;
        }
    },

    async upsertGradeGoal(goal: GradeGoal): Promise<string | undefined> {
        try {
            const existing = await db.gradeGoals
                .where('studentId')
                .equals(goal.studentId)
                .and(g => g.subjectId === goal.subjectId)
                .first();

            if (existing) {
                await db.gradeGoals.put({ ...goal, id: existing.id });
                return existing.id;
            } else {
                return await db.gradeGoals.add(goal);
            }
        } catch (error) {
            console.error('Failed to upsert grade goal:', error);
            throw error;
        }
    },

    async getGradeGoals(studentId: string): Promise<GradeGoal[]> {
        try {
            return await db.gradeGoals
                .where('studentId')
                .equals(studentId)
                .toArray();
        } catch (error) {
            console.error('Failed to get grade goals:', error);
            return [];
        }
    },

    async deleteGradeGoal(id: string): Promise<void> {
        try {
            await db.gradeGoals.delete(id);
        } catch (error) {
            console.error('Failed to delete grade goal:', error);
            throw error;
        }
    }
};

export default DatabaseService;
