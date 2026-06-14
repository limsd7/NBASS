/**
 * StudentWindow
 * 학생 전용 창 (모니터 2)의 메인 진입점
 * URL: /student?sessionId=xxx
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useSyncStudent } from '../../hooks/useSync';
import { StudentSurveyView } from './StudentSurveyView';
import { StudentProtocolView } from './StudentProtocolView';
import {
    StudentSurveyBundle,
    ProtocolBundle,
    AnalyticsBundle
} from '../../services/syncService';

type StudentPhase = 'connecting' | 'survey' | 'protocol' | 'complete' | 'error';

export const StudentWindow: React.FC = () => {
    // URL에서 sessionId 추출
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('sessionId');

    const [phase, setPhase] = useState<StudentPhase>('connecting');
    const [studentName, setStudentName] = useState<string>('');
    const [error, setError] = useState<string>('');

    // 수집된 데이터
    const [surveyData, setSurveyData] = useState<StudentSurveyBundle | null>(null);

    // Sync 훅
    const {
        sessionState,
        isJoined,
        send,
        submitAllData,
        isConnected
    } = useSyncStudent(sessionId, {
        onMessage: (message) => {
            if (message.type === 'STUDENT_INFO') {
                setStudentName(message.data.name || '학생');
            }
            if (message.type === 'SESSION_CLOSED') {
                setPhase('complete');
            }
        }
    });

    // 세션 연결 상태 감시
    useEffect(() => {
        if (!sessionId) {
            setError('세션 ID가 없습니다. 관리자 화면에서 다시 시작해 주세요.');
            setPhase('error');
            return;
        }

        if (isJoined && sessionState) {
            setStudentName(sessionState.studentName || '학생');
            setPhase('survey');
        }
    }, [sessionId, isJoined, sessionState]);

    // 설문 완료 핸들러
    const handleSurveyComplete = useCallback(async (data: StudentSurveyBundle) => {
        setSurveyData(data);

        // 관리자에게 설문 데이터 전송
        await send('STUDENT_COMPLETE', { survey: data });

        // 프로토콜 단계로 이동
        setPhase('protocol');
    }, [send]);

    // 프로토콜 완료 핸들러
    const handleProtocolComplete = useCallback(async (protocol: ProtocolBundle, analytics: AnalyticsBundle) => {
        // 전체 데이터 전송
        if (surveyData) {
            await submitAllData({
                survey: surveyData,
                protocol,
                analytics
            });
        }

        setPhase('complete');
    }, [surveyData, submitAllData]);

    // 에러 화면
    if (phase === 'error') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-8">
                <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-lg">
                    <div className="text-6xl mb-6">⚠️</div>
                    <h2 className="text-2xl font-black text-red-800 mb-4">연결 오류</h2>
                    <p className="text-slate-600 mb-4">{error}</p>
                    <button
                        onClick={() => window.close()}
                        className="px-6 py-3 bg-slate-600 text-white rounded-xl font-bold hover:bg-slate-700 transition-colors"
                    >
                        창 닫기
                    </button>
                </div>
            </div>
        );
    }

    // 연결 중 화면
    if (phase === 'connecting') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-8">
                <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-lg">
                    <div className="text-6xl mb-6 animate-pulse">🔗</div>
                    <h2 className="text-2xl font-black text-indigo-800 mb-4">연결 중...</h2>
                    <p className="text-slate-600">관리자 화면과 연결하고 있습니다.</p>
                    <div className="mt-8 flex justify-center">
                        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    </div>
                    {sessionId && (
                        <p className="mt-4 text-xs text-slate-400">세션: {sessionId.substring(0, 8)}...</p>
                    )}
                </div>
            </div>
        );
    }

    // 완료 화면
    if (phase === 'complete') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-8">
                <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-lg">
                    <div className="text-6xl mb-6">🎉</div>
                    <h2 className="text-3xl font-black text-emerald-800 mb-4">모든 응답 완료!</h2>
                    <p className="text-lg text-slate-600 mb-2">{studentName}님, 수고하셨습니다.</p>
                    <p className="text-slate-500">상담사가 결과를 분석 중입니다.</p>

                    <div className="mt-8 p-6 bg-emerald-50 rounded-2xl">
                        <p className="text-sm text-emerald-700 font-medium">✅ 심리 상태 평가 완료</p>
                        <p className="text-sm text-emerald-700 font-medium mt-1">✅ 학습 환경 분석 완료</p>
                        <p className="text-sm text-emerald-700 font-medium mt-1">✅ 학습 패턴 분석 완료</p>
                    </div>

                    <div className="mt-6 p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500">
                            이 창은 자동으로 닫히지 않습니다.<br />
                            상담사의 안내에 따라 창을 닫아 주세요.
                        </p>
                    </div>

                    <button
                        onClick={() => window.close()}
                        className="mt-6 px-6 py-3 bg-slate-600 text-white rounded-xl font-bold hover:bg-slate-700 transition-colors"
                    >
                        창 닫기
                    </button>
                </div>
            </div>
        );
    }

    // 설문 단계
    if (phase === 'survey') {
        return (
            <StudentSurveyView
                studentName={studentName}
                onComplete={handleSurveyComplete}
                onStepChange={(step) => send('SURVEY_BAI', { currentStep: step })}
            />
        );
    }

    // 프로토콜 단계
    if (phase === 'protocol') {
        return (
            <StudentProtocolView
                studentName={studentName}
                onComplete={handleProtocolComplete}
                onBack={() => setPhase('survey')}
            />
        );
    }

    return null;
};

export default StudentWindow;
