import type { AssessmentResult, GradeRecord } from '../../../types';

// Moved verbatim from ResultsView.tsx gradeCorrelationData useMemo body (no logic change).
// [Fix] 선형 보간 추정 제거: 각 시험 시점에 실측 검사 이력을 매칭하여 사용
export const computeGradeCorrelationData = (
    gradeRecords: GradeRecord[],
    assessmentHistory: AssessmentResult[],
    result: AssessmentResult
) => {
        if (!gradeRecords || gradeRecords.length === 0) return [];
        const sorted = [...gradeRecords].sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime());

        // 검사 이력을 날짜 오름차순 정렬
        const sortedHistory = [...assessmentHistory]
            .filter(h => h?.date)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // 시험일 기준 실측 지표 매칭: 시험일 이전에 실시한 가장 최근 검사 사용
        const findMetricsForDate = (examDate: string) => {
            const examTime = new Date(examDate).getTime();
            const prior = sortedHistory.filter(h => new Date(h.date).getTime() <= examTime);
            if (prior.length > 0) {
                const m = prior[prior.length - 1];
                return {
                    stress: m.hrv?.physicalStress,
                    focus: m.hrv?.concentrationLevel ?? m.analytics?.pureStudyRatio,
                    memory: m.workingMemoryResults?.overallScore,
                    measured: true, // 시험 시점에 실측된 검사 이력 기반
                };
            }
            // 시험 이전 검사 이력이 없으면 현재 진단 결과의 실측값으로 대체 (추정 표시)
            return {
                stress: result?.hrv?.physicalStress,
                focus: result?.hrv?.concentrationLevel ?? result?.analytics?.pureStudyRatio,
                memory: result?.workingMemoryResults?.overallScore,
                measured: false, // 현재 기준값으로의 추정
            };
        };

        return sorted.map((r) => {
            const validGrades = r.subjects.filter(s => s.grade !== undefined).map(s => s.grade as number);
            const avgGrade = validGrades.length > 0 ? parseFloat((validGrades.reduce((a, b) => a + b, 0) / validGrades.length).toFixed(1)) : 4.0;
            const weakSub = r.subjects.find(s => s.subjectId === result?.student?.weakSubject);
            const weakGrade = weakSub?.grade !== undefined ? weakSub.grade : avgGrade;

            const metrics = findMetricsForDate(r.examDate);
            const hrvIndex = Math.max(15, Math.min(95, Math.round(100 - (metrics.stress ?? 50))));
            const focusIndex = Math.max(15, Math.min(98, Math.round(metrics.focus ?? 70)));
            const memoryScore = Math.max(0, Math.min(100, Math.round(metrics.memory ?? 65)));

            return {
                examName: r.examName,
                examDate: r.examDate,
                avgGrade,
                weakGrade,
                hrvResistance: hrvIndex,
                focusCapacity: focusIndex,
                memoryScore,
                isMeasured: metrics.measured,
            };
        });
};
