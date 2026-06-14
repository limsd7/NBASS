
import { AssessmentResult, CareType } from '../types';
import { DatabaseService, HistoryRecord } from './database';

// === Type Definitions ===

export interface TimePoint {
    date: string;
    timestamp: number;
}

export interface TrendDataPoint extends TimePoint {
    [key: string]: any;
}

export interface ComprehensiveTrendData {
    summary: TrendDataPoint[];     // 종합 점수 및 유형
    survey: TrendDataPoint[];      // 설문 (BAI, ISI, etc)
    hrv: TrendDataPoint[];         // HRV (스트레스, 피로, 활력)
    eeg: TrendDataPoint[];         // 뇌파 (집중, 안정)
    rawHistory: HistoryRecord[];   // 원본 데이터
}

// === Logic ===

/**
 * 특정 학생의 전체 히스토리를 가져와 트렌드 분석을 위한 데이터로 가공합니다.
 */
/**
 * 특정 학생의 전체 히스토리를 가져와 트렌드 분석을 위한 데이터로 가공합니다.
 */
export const fetchAndProcessStudentHistory = async (name: string, birthDate?: string, studentId?: string): Promise<ComprehensiveTrendData> => {
    console.log(`[TrendService] Requesting history for: Name=${name}, BirthDate=${birthDate}, ID=${studentId}`);

    if (!name && !studentId) {
        console.warn("[TrendService] No name or ID provided, returning empty data.");
        return createEmptyTrendData();
    }

    // 1. DB에서 히스토리 조회 (이름 + 생년월일 기준)
    let history: HistoryRecord[] = [];

    if (name) {
        history = await DatabaseService.getHistoryByStudentInfo(name, birthDate);
    }

    // 2. Fallback: 이름 검색 실패 시 ID로 조회 (최소한 현재 데이터라도 표시)
    if (history.length === 0 && studentId) {
        console.log(`[TrendService] No records found by name. Trying fallback with ID: ${studentId}`);
        history = await DatabaseService.getHistoryByStudent(studentId);
    }

    console.log(`[TrendService] Final record count: ${history.length}`);

    if (history.length === 0) {
        return createEmptyTrendData();
    }

    // 날짜 오름차순 정렬 (과거 -> 현재) for Line Chart
    const sortedHistory = [...history].sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return {
        summary: processSummaryTrend(sortedHistory),
        survey: processSurveyTrend(sortedHistory),
        hrv: processHrvTrend(sortedHistory),
        eeg: processEegTrend(sortedHistory),
        rawHistory: sortedHistory
    };
};

const createEmptyTrendData = (): ComprehensiveTrendData => ({
    summary: [], survey: [], hrv: [], eeg: [], rawHistory: []
});

import { evaluateBrainBodyCoherence } from './brainBodyEngine';

/**
 * 1. 종합 결과 트렌드 (점수, CareType)
 */
const processSummaryTrend = (history: HistoryRecord[]): TrendDataPoint[] => {
    return history.map(record => {
        // [NEW] Calculate historical coherence
        const brainBodyState = evaluateBrainBodyCoherence(
            record.hrv, 
            record.survey, 
            record.careType || CareType.UNASSESSED
        );

        return {
            date: formatDate(record.date),
            timestamp: new Date(record.date).getTime(),
            score: record.score || 0,
            careType: record.careType || CareType.UNASSESSED,
            coherence: brainBodyState.coherence // Track coherence over time
            // 점수 레벨에 따른 색상 등의 메타데이터가 필요하다면 여기서 추가
        };
    });
};

/**
 * 2. 설문 결과 트렌드 (ANS, BAI, ISI 등)
 * "ANS는 어떤 식으로 변했고, BAI는 어떤 식으로 변했는지 알 수 있어야 해"
 */
const processSurveyTrend = (history: HistoryRecord[]): TrendDataPoint[] => {
    return history.map(record => {
        // 설문 점수 계산 (저장된 값이 없으면 배열 합산)
        const baiScore = record.survey.bai ?? 0;
        const isiScore = record.survey.isi ?? 0;

        // ANS(자율신경) 증상 수 (SNS / PNS)
        const snsCount = record.survey.sympatheticSymptoms ? record.survey.sympatheticSymptoms.length : 0;
        const pnsCount = record.survey.parasympatheticSymptoms ? record.survey.parasympatheticSymptoms.length : 0;

        return {
            date: formatDate(record.date),
            timestamp: new Date(record.date).getTime(),
            bai: baiScore,
            isi: isiScore,
            sns: snsCount,
            pns: pnsCount,
            adrenal: record.survey.adrenalFatigueScore ?? 0,
            concentration: record.survey.concentrationScore ?? 0,
            cfs: record.survey.fatigueSymptomsCount ?? 0 // CFS (만성피로증후군) 지표로 활용
        };
    });
};

/**
 * 3. HRV / 신체 결과 트렌드
 * "HRV 검사 또한 이전과 비교해서 어떤 식으로 변했는지"
 */
const processHrvTrend = (history: HistoryRecord[]): TrendDataPoint[] => {
    return history.map(record => ({
        date: formatDate(record.date),
        timestamp: new Date(record.date).getTime(),
        stressIndex: record.hrv.portableHrv?.stressIndex ?? record.hrv.physicalStress ?? 50, // 호환성 처리
        fatigue: record.hrv.fatigue ?? 0,
        vitality: record.hrv.vitality ?? 50,
        sns: record.hrv.sns ?? 50,
        pns: record.hrv.pns ?? 50,
        balance: Math.abs((record.hrv.sns ?? 50) - (record.hrv.pns ?? 50)), // 균형도 (차이)
        vascularHealth: record.hrv.portableHrv?.vascularHealthIndex ?? 0, // 혈관 건강 (Portable)
        // Clinical Biometrics (HRV) 추가 항목
        hrvIndex: record.hrv.hrvIndex ?? 0,
        tp: record.hrv.tp ?? 0,
        vlf: record.hrv.vlf ?? 0,
        lf: record.hrv.lf ?? 0,
        hf: record.hrv.hf ?? 0
    }));
};

/**
 * 4. EEG / 뇌파 결과 트렌드
 * "EEG 검사 또한 이전과 비교해서"
 */
const processEegTrend = (history: HistoryRecord[]): TrendDataPoint[] => {
    return history.map(record => ({
        date: formatDate(record.date),
        timestamp: new Date(record.date).getTime(),
        brainScore: record.hrv.brainScore ?? 50,
        concentration: record.hrv.concentrationLevel ?? 50,
        stable: record.hrv.brainBalanceL ?? 50, // 좌우 밸런스 등 활용
        // 뇌파 세부 대역
        gamma: record.hrv.eegGamma ?? 0,
        hBeta: record.hrv.eegHBeta ?? 0,
        mBeta: record.hrv.eegMBeta ?? 0,
        lBeta: record.hrv.eegLBeta ?? 0,
        alpha: record.hrv.eegAlpha ?? 0,
        theta: record.hrv.eegTheta ?? 0,
        // 통합 Beta (레거시 호환용)
        beta: (record.hrv.eegLBeta ?? 0) + (record.hrv.eegMBeta ?? 0) + (record.hrv.eegHBeta ?? 0),
    }));
};

// === Helpers ===

const formatDate = (isoString: string): string => {
    const d = new Date(isoString);
    return `${d.getMonth() + 1}/${d.getDate()}`; // M/D 포맷
};

export const TrendService = {
    fetchAndProcessStudentHistory
};
