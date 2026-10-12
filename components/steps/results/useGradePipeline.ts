import { useState, useEffect } from 'react';
import { unifiedSyncService as DatabaseService } from '../../../services/unifiedSyncService';
import type { AssessmentResult, GradeRecord, GradeGoal } from '../../../types';

// Moved verbatim from ResultsView.tsx (state + effect together; no behavior change)
export const useGradePipeline = (
    result: AssessmentResult,
    handleDataUpdate: (data: AssessmentResult) => void
) => {
    // Grade Management Reverse Pipeline (성적 이력 로드)
    const [gradeRecords, setGradeRecords] = useState<GradeRecord[]>([]);
    const [gradeGoals, setGradeGoals] = useState<GradeGoal[]>([]);
    // 시험 시점별 실측 지표 매칭용 검사 이력 (HistoryRecord extends AssessmentResult)
    const [assessmentHistory, setAssessmentHistory] = useState<AssessmentResult[]>([]);

    useEffect(() => {
        if (result?.student?.id) {
            DatabaseService.getGradeRecords(result.student.id).then(records => {
                setGradeRecords(records);
                // [Fix] 직접 변이(mutate) 대신 handleDataUpdate로 불변 갱신
                if (records.length > 0 && !result.gradeHistory) {
                    handleDataUpdate({ ...result, gradeHistory: records });
                }
            }).catch(err => console.error('Failed to load grade records in ResultsView:', err));

            DatabaseService.getGradeGoals(result.student.id).then(goals => {
                setGradeGoals(goals);
            }).catch(err => console.error('Failed to load grade goals in ResultsView:', err));

            // [Fix] 선형 보간 추정 제거: 시험 시점 매칭에 사용할 실제 검사 이력 로드
            DatabaseService.getHistoryByStudent(result.student.id).then(history => {
                setAssessmentHistory((history || []) as AssessmentResult[]);
            }).catch(err => console.error('Failed to load assessment history in ResultsView:', err));
        }
    }, [result?.student?.id]);

    return { gradeRecords, gradeGoals, assessmentHistory };
};
