// 상담 이력 데이터 관리
// Consultation History Data Management

import { CareType } from '../types';

// 상담 이력 엔트리 타입
export interface ConsultationEntry {
    id: string;
    studentId: string;
    studentName: string;
    timestamp: string; // ISO date string
    careType: CareType;

    // 상담 내용
    consultType: 'prediction' | 'general' | 'followup' | 'parent';
    scriptUsed?: string;  // 사용한 스크립트
    notes: string;        // 상담 메모

    // 학생 반응
    studentReaction?: 'positive' | 'neutral' | 'negative' | 'resistant';
    actionItems?: string[];  // 후속 조치 사항

    // 다음 상담 예정
    followUpDate?: string;
    followUpNotes?: string;
}

// 상담 유형 레이블
export const CONSULT_TYPE_LABELS: Record<string, { label: string; emoji: string }> = {
    prediction: { label: '예측 분석 상담', emoji: '🔮' },
    general: { label: '일반 상담', emoji: '💬' },
    followup: { label: '후속 상담', emoji: '📋' },
    parent: { label: '학부모 상담', emoji: '👪' }
};

// 학생 반응 레이블
export const REACTION_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
    positive: { label: '긍정적', emoji: '😊', color: 'text-green-600' },
    neutral: { label: '보통', emoji: '😐', color: 'text-slate-600' },
    negative: { label: '부정적', emoji: '😟', color: 'text-orange-600' },
    resistant: { label: '거부적', emoji: '😤', color: 'text-red-600' }
};

// 스토리지 키
const STORAGE_KEY = 'consultation_history';

// ID 생성
export const generateConsultationId = (): string => {
    return `consult_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// 상담 이력 불러오기
export const loadConsultationHistory = (): ConsultationEntry[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.error('Failed to load consultation history:', e);
    }
    return [];
};

// 상담 이력 저장
export const saveConsultationHistory = (history: ConsultationEntry[]): void => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
        console.error('Failed to save consultation history:', e);
    }
};

// 새 상담 기록 추가
export const addConsultationEntry = (entry: Omit<ConsultationEntry, 'id' | 'timestamp'>): ConsultationEntry => {
    const history = loadConsultationHistory();

    const newEntry: ConsultationEntry = {
        ...entry,
        id: generateConsultationId(),
        timestamp: new Date().toISOString()
    };

    history.unshift(newEntry); // 최신 기록을 맨 앞에
    saveConsultationHistory(history);

    return newEntry;
};

// 특정 학생의 상담 이력 조회
export const getStudentConsultations = (studentId: string): ConsultationEntry[] => {
    const history = loadConsultationHistory();
    return history.filter(entry => entry.studentId === studentId);
};

// 상담 기록 수정
export const updateConsultationEntry = (id: string, updates: Partial<ConsultationEntry>): ConsultationEntry | null => {
    const history = loadConsultationHistory();
    const index = history.findIndex(entry => entry.id === id);

    if (index === -1) return null;

    history[index] = { ...history[index], ...updates };
    saveConsultationHistory(history);

    return history[index];
};

// 상담 기록 삭제
export const deleteConsultationEntry = (id: string): boolean => {
    const history = loadConsultationHistory();
    const filtered = history.filter(entry => entry.id !== id);

    if (filtered.length === history.length) return false;

    saveConsultationHistory(filtered);
    return true;
};

// 최근 상담 이력 조회 (전체)
export const getRecentConsultations = (limit: number = 10): ConsultationEntry[] => {
    const history = loadConsultationHistory();
    return history.slice(0, limit);
};
