import { AssessmentResult, CareType } from '../types';
import { DatabaseService, HistoryRecord } from './database';
import { evaluateBrainBodyCoherence } from './brainBodyEngine';

// === Type Definitions ===

export interface TimePoint {
    date: string;
    timestamp: number;
}

export interface TrendDataPoint extends TimePoint {
    [key: string]: any;
}

export interface ComprehensiveTrendData {
    summary: TrendDataPoint[];       // 종합 성장 점수 및 유형
    survey: TrendDataPoint[];        // 심리·기질 설문 (불안, 수면, 스트레스, 집중력)
    cognitive: TrendDataPoint[];     // 인지·두뇌 테스트 (작업기억력, N-Back 등)
    academic: TrendDataPoint[];      // 학업 & 공부 효율 (순공시간, 목표달성률, 과목우선순위)
    hrv?: TrendDataPoint[];          // (추후 확장용) HRV
    eeg?: TrendDataPoint[];          // (추후 확장용) EEG
    rawHistory: HistoryRecord[];     // 원본 전체 데이터
}

// === Logic ===

/**
 * 특정 학생의 전체 히스토리를 가져와 수험생 실전 트렌드 분석을 위한 데이터로 가공합니다.
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

    // 2. Fallback: 이름 검색 실패 시 ID로 조회
    if (history.length === 0 && studentId) {
        console.log(`[TrendService] No records found by name. Trying fallback with ID: ${studentId}`);
        history = await DatabaseService.getHistoryByStudent(studentId);
    }

    console.log(`[TrendService] Final record count: ${history.length}`);

    if (history.length === 0) {
        return createEmptyTrendData();
    }

    // 동일 날짜(YYYY-MM-DD) 중복 제거 및 1개로 통합 (최신 시간 레코드 유지)
    const dateMap = new Map<string, HistoryRecord>();
    history.forEach(record => {
        const d = new Date(record.date);
        const dateStr = !isNaN(d.getTime()) 
            ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
            : record.date.slice(0, 10);
        
        if (!dateMap.has(dateStr) || new Date(record.date).getTime() > new Date(dateMap.get(dateStr)!.date).getTime()) {
            dateMap.set(dateStr, record);
        }
    });

    // 날짜 오름차순 정렬 (과거 -> 현재)
    const sortedHistory = Array.from(dateMap.values()).sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return {
        summary: processSummaryTrend(sortedHistory),
        survey: processSurveyTrend(sortedHistory),
        cognitive: processCognitiveTrend(sortedHistory),
        academic: processAcademicTrend(sortedHistory),
        rawHistory: sortedHistory
    };
};

const createEmptyTrendData = (): ComprehensiveTrendData => ({
    summary: [],
    survey: [],
    cognitive: [],
    academic: [],
    rawHistory: []
});

/**
 * 1. 종합 성장 결과 트렌드 (점수, CareType, 진단 일치도)
 */
const processSummaryTrend = (history: HistoryRecord[]): TrendDataPoint[] => {
    return history.map(record => {
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
            coherence: brainBodyState.coherence
        };
    });
};

/**
 * 2. 심리·기질 설문 트렌드 (시험불안, 수면, 집중력, 스트레스)
 */
const processSurveyTrend = (history: HistoryRecord[]): TrendDataPoint[] => {
    return history.map(record => {
        const baiScore = record.survey?.bai ?? 0;
        const isiScore = record.survey?.isi ?? 0;
        const snsCount = record.survey?.sympatheticSymptoms ? record.survey.sympatheticSymptoms.length : 0;
        const pnsCount = record.survey?.parasympatheticSymptoms ? record.survey.parasympatheticSymptoms.length : 0;
        const anxietyCognitive = record.survey?.testAnxietyCognitive ?? 0;
        const anxietySomatic = record.survey?.testAnxietySomatic ?? 0;

        return {
            date: formatDate(record.date),
            timestamp: new Date(record.date).getTime(),
            bai: baiScore,
            isi: isiScore,
            sns: snsCount,
            pns: pnsCount,
            concentration: record.survey?.concentrationScore ?? 50,
            adrenal: record.survey?.adrenalFatigueScore ?? 0,
            anxietyCognitive,
            anxietySomatic,
            cfs: record.survey?.fatigueSymptomsCount ?? 0
        };
    });
};

/**
 * 3. 인지·두뇌 테스트 트렌드 (작업기억력, N-Back 인지 반응속도, RAM 레벨)
 */
const processCognitiveTrend = (history: HistoryRecord[]): TrendDataPoint[] => {
    return history.map(record => {
        const wm = record.workingMemoryResults || record.cognitiveResults || {};
        const accuracy = wm.accuracy ?? wm.score ?? (record.score ? Math.min(100, Math.round(record.score * 0.95)) : 75);
        const level = wm.level ?? wm.nBackLevel ?? 2;
        const responseTime = wm.avgResponseTime ?? wm.reactionTime ?? 450;
        const spanScore = wm.spanScore ?? wm.capacityScore ?? (level * 25);

        return {
            date: formatDate(record.date),
            timestamp: new Date(record.date).getTime(),
            accuracy,
            level,
            responseTime,
            spanScore
        };
    });
};

/**
 * 4. 학업 & 공부 효율 트렌드 (순공비율, 목표달성률, 취약과목 케어)
 */
const processAcademicTrend = (history: HistoryRecord[]): TrendDataPoint[] => {
    return history.map(record => {
        const analytics = (record.analytics || {}) as any;
        const pureStudyRatio = analytics.pureStudyRatio ?? 70;
        const avgFocusDuration = analytics.avgFocusDuration ?? 45;
        const goalAchievementRate = analytics.goalAchievementRate ?? 80;
        const distractionCount = analytics.distractionCount ?? 3;

        return {
            date: formatDate(record.date),
            timestamp: new Date(record.date).getTime(),
            pureStudyRatio,
            avgFocusDuration,
            goalAchievementRate,
            distractionCount
        };
    });
};

// === Helpers ===

const formatDate = (isoString: string): string => {
    const d = new Date(isoString);
    return `${d.getMonth() + 1}/${d.getDate()}`;
};

export const TrendService = {
    fetchAndProcessStudentHistory
};
