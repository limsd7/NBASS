/**
 * useSync Hook
 * React 컴포넌트에서 SyncService를 쉽게 사용하기 위한 훅
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { getLocalSyncService } from '../services/localSync';
import {
    SyncMessage,
    SyncMessageType,
    SessionState,
    StudentSurveyBundle,
    ProtocolBundle,
    AnalyticsBundle
} from '../services/syncService';

// 훅 옵션
interface UseSyncOptions {
    onMessage?: (message: SyncMessage) => void;
    autoSubscribe?: boolean;
}

// 관리자용 훅
export const useSyncAdmin = (options: UseSyncOptions = {}) => {
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [sessionState, setSessionState] = useState<SessionState | null>(null);
    const [studentReady, setStudentReady] = useState(false);
    const [studentData, setStudentData] = useState<{
        survey?: StudentSurveyBundle;
        protocol?: ProtocolBundle;
        analytics?: AnalyticsBundle;
    }>({});

    const syncService = getLocalSyncService();
    const unsubscribeRef = useRef<(() => void) | null>(null);

    // 세션 생성
    const createSession = useCallback(async (studentId: string, studentName: string) => {
        const id = await syncService.createSession(studentId, studentName);
        setSessionId(id);
        setSessionState(syncService.getSessionState(id));

        // 구독 시작
        unsubscribeRef.current = syncService.subscribe(id, (message) => {
            console.log('[Admin] Received:', message);

            switch (message.type) {
                case 'ADMIN_READY':
                    setStudentReady(true);
                    if (sessionId) {
                        setSessionState(syncService.getSessionState(sessionId));
                    }
                    break;

                case 'SURVEY_BAI':
                case 'SURVEY_ISI':
                case 'SURVEY_CONCENTRATION':
                case 'SURVEY_FATIGUE':
                case 'SURVEY_ADRENAL':
                    // 설문 데이터 업데이트
                    setStudentData(prev => ({
                        ...prev,
                        survey: { ...(prev.survey || {} as StudentSurveyBundle), ...message.data }
                    }));
                    break;

                case 'PROTOCOL_DATA':
                    setStudentData(prev => ({
                        ...prev,
                        protocol: message.data
                    }));
                    break;

                case 'ANALYTICS_DATA':
                    setStudentData(prev => ({
                        ...prev,
                        analytics: message.data
                    }));
                    break;

                case 'STUDENT_COMPLETE':
                    setStudentData(message.data);
                    if (sessionId) {
                        const state = syncService.getSessionState(sessionId);
                        if (state) {
                            state.status = 'student_done';
                            setSessionState(state);
                        }
                    }
                    break;
            }

            options.onMessage?.(message);
        });

        return id;
    }, [options, syncService]);

    // 학생 창 열기
    const openStudentWindow = useCallback(() => {
        if (!sessionId) {
            console.warn('No session to open');
            return null;
        }

        const url = `/student?sessionId=${sessionId}`;
        const windowFeatures = 'width=1200,height=900,menubar=no,toolbar=no,location=no,status=no';
        const studentWindow = window.open(url, 'StudentWindow', windowFeatures);

        return studentWindow;
    }, [sessionId]);

    // 세션 종료
    const closeSession = useCallback(async () => {
        if (sessionId) {
            await syncService.closeSession(sessionId);
            setSessionId(null);
            setSessionState(null);
            setStudentReady(false);
            setStudentData({});
        }
    }, [sessionId, syncService]);

    // 데이터 전송
    const send = useCallback(async <T,>(type: SyncMessageType, data: T) => {
        if (sessionId) {
            await syncService.send(sessionId, type, data);
        }
    }, [sessionId, syncService]);

    // 정리
    useEffect(() => {
        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
            }
        };
    }, []);

    return {
        sessionId,
        sessionState,
        studentReady,
        studentData,
        createSession,
        openStudentWindow,
        closeSession,
        send,
        isConnected: syncService.isConnected()
    };
};

// 학생용 훅
export const useSyncStudent = (sessionId: string | null, options: UseSyncOptions = {}) => {
    const [sessionState, setSessionState] = useState<SessionState | null>(null);
    const [isJoined, setIsJoined] = useState(false);
    const [currentStep, setCurrentStep] = useState<string>('waiting');

    const syncService = getLocalSyncService();
    const unsubscribeRef = useRef<(() => void) | null>(null);

    // 세션 참여
    const joinSession = useCallback(async () => {
        if (!sessionId) return false;

        const state = await syncService.joinSession(sessionId);
        if (state) {
            setSessionState(state);
            setIsJoined(true);
            setCurrentStep('survey_bai');

            // 관리자 메시지 구독
            unsubscribeRef.current = syncService.subscribe(sessionId, (message) => {
                console.log('[Student] Received:', message);

                if (message.type === 'SESSION_CLOSED') {
                    setIsJoined(false);
                    setSessionState(null);
                }

                if (message.type === 'STUDENT_INFO') {
                    setSessionState(prev => prev ? { ...prev, ...message.data } : null);
                }

                options.onMessage?.(message);
            });

            return true;
        }
        return false;
    }, [sessionId, options, syncService]);

    // 데이터 전송
    const send = useCallback(async <T,>(type: SyncMessageType, data: T) => {
        if (sessionId) {
            await syncService.send(sessionId, type, data);
        }
    }, [sessionId, syncService]);

    // 상태 업데이트
    const updateStep = useCallback((step: string) => {
        setCurrentStep(step);
        if (sessionId && sessionState) {
            sessionState.currentStep = step;
            setSessionState({ ...sessionState });
        }
    }, [sessionId, sessionState]);

    // 전체 설문 데이터 전송 (완료 시)
    const submitAllData = useCallback(async (data: {
        survey: StudentSurveyBundle;
        protocol: ProtocolBundle;
        analytics: AnalyticsBundle;
    }) => {
        if (sessionId) {
            await syncService.send(sessionId, 'STUDENT_COMPLETE', data);
            setCurrentStep('completed');
        }
    }, [sessionId, syncService]);

    // 정리
    useEffect(() => {
        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
            }
        };
    }, []);

    // 자동 참여
    useEffect(() => {
        if (sessionId && !isJoined) {
            joinSession();
        }
    }, [sessionId, isJoined, joinSession]);

    return {
        sessionState,
        isJoined,
        currentStep,
        joinSession,
        send,
        updateStep,
        submitAllData,
        isConnected: syncService.isConnected()
    };
};

export default useSyncAdmin;
