/**
 * SyncService Interface
 * 추상화된 동기화 서비스 인터페이스
 * - 현재: LocalSyncService (BroadcastChannel)
 * - 미래: ServerSyncService (WebSocket + PostgreSQL)
 */

// 메시지 타입 정의
export type SyncMessageType =
    | 'SESSION_CREATED'
    | 'STUDENT_INFO'
    | 'SURVEY_BAI'
    | 'SURVEY_ISI'
    | 'SURVEY_CONCENTRATION'
    | 'SURVEY_FATIGUE'
    | 'SURVEY_ADRENAL'
    | 'PROTOCOL_DATA'
    | 'ANALYTICS_DATA'
    | 'SLEEP_RECORD_UPDATE'
    | 'SLEEP_GOAL_UPDATE'
    | 'GRADE_RECORD_UPDATE'
    | 'GRADE_GOAL_UPDATE'
    | 'STUDENT_COMPLETE'
    | 'ADMIN_READY'
    | 'SESSION_CLOSED';

// 동기화 메시지 구조
export interface SyncMessage<T = any> {
    type: SyncMessageType;
    data: T;
    timestamp: number;
    sessionId: string;
    sender: 'admin' | 'student';
}

// 세션 상태
export interface SessionState {
    id: string;
    studentId: string;
    studentName: string;
    status: 'pending' | 'in_progress' | 'student_done' | 'completed';
    createdAt: number;
    completedAt?: number;
    currentStep?: string;
}

// 학생 설문 데이터 번들
export interface StudentSurveyBundle {
    baiScores: number[];
    isiScores: number[];
    concentrationScores: number[];
    fatigueSymptoms: boolean[];
    adrenalScores: number[];
    snsSymptoms: string[];
    pnsSymptoms: string[];
}

// 프로토콜 데이터
export interface ProtocolBundle {
    location: string;
    noiseLevel: number;
    stressLevel: number;
    avgSleep: number;
    emotionalFactor: number;
    motivationalFactor: number;
    behavioralFactor: number;
    taskDifficulty: number;
    timeDistortion: number;
}

// 학습 분석 데이터
export interface AnalyticsBundle {
    pureStudyRatio: number;
    avgFocusDuration: number;
    distractionCount: number;
    goldenTimeStart: string;
    goldenTimeEnd: string;
    lowEfficiencyTime: string;
    chronotype: 'morning' | 'evening' | 'neutral';
    weekdayWeekendGap: number;
    subjectRatios: {
        korean: number;
        math: number;
        english: number;
        science: number;
        social: number;
        other: number;
    };
    goalAchievementRate: number;
    perceivedDifficulty: number;
    avgSleepHours: number;
    sleepQuality: number;
    preferredLocation: string;
    studyStreak: number;
    breakAdequacy: number;
    burnoutCycle: number;
    energyPattern: 'stable' | 'fluctuating' | 'declining';
}

// SyncService 인터페이스 (핵심)
export interface SyncService {
    // 세션 생성 (관리자가 학생 등록 시)
    createSession(studentId: string, studentName: string): Promise<string>;

    // 세션 참여 (학생이 창 열었을 때)
    joinSession(sessionId: string): Promise<SessionState | null>;

    // 세션 상태 조회
    getSessionState(sessionId: string): SessionState | null;

    // 데이터 전송
    send<T>(sessionId: string, type: SyncMessageType, data: T): Promise<void>;

    // 메시지 구독 (실시간 수신)
    subscribe(sessionId: string, callback: (message: SyncMessage) => void): () => void;

    // 세션 종료
    closeSession(sessionId: string): Promise<void>;

    // 연결 상태
    isConnected(): boolean;
}

// 기본 내보내기
export default SyncService;
