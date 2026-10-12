import { StudentInfo, GradeRecord, AssessmentResult } from '../../../types';
import { getCareTypeDetail } from '../../../data/careTypesData';
import { SUNEUNG_SUBJECTS } from '../../../data/suneungSubjects';

export interface StudyDashboardData {
    hasAssessment: boolean;
    careTypeCode: string;
    currentCare: ReturnType<typeof getCareTypeDetail>;
    avgGrade: string;
    trendData: { examName: string; averageGrade: number; examDate: string }[];
    subjectBarData: { subject: string; grade: number }[];
    COLORS: string[];
}

export const useStudyDashboardData = (
    student: StudentInfo,
    records: GradeRecord[],
    latestAssessment?: AssessmentResult
): StudyDashboardData => {
    const hasAssessment = !!latestAssessment?.careType && (latestAssessment.careType as any) !== 'Unassessed' && (latestAssessment.careType as any) !== 'UNASSESSED' && (latestAssessment.careType as any) !== '알 수 없음';
    const careTypeCode = (hasAssessment ? latestAssessment?.careType : "HEALTHY")?.toString() || "HEALTHY";
    const currentCare = getCareTypeDetail(careTypeCode);

    // 성적 데이터 집계 (등급 미입력은 제외 — 5등급 대체 금지)
    const allSubjects = records.flatMap((r) => r.subjects);
    const gradedSubjects = allSubjects.filter(s => typeof s.grade === 'number' && Number.isFinite(s.grade));
    const avgGrade =
        gradedSubjects.length > 0
            ? (gradedSubjects.reduce((acc, s) => acc + (s.grade as number), 0) / gradedSubjects.length).toFixed(1)
            : "—";

    // 시험별 추이 데이터 (날짜순 정렬)
    const sortedRecords = [...records].sort(
        (a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime()
    );

    const trendData = sortedRecords.map((r) => {
        const validSubs = r.subjects.filter((s) => s.grade !== undefined);
        const avg =
            validSubs.length > 0
                ? parseFloat((validSubs.reduce((acc, s) => acc + (s.grade || 0), 0) / validSubs.length).toFixed(1))
                : 0;
        return {
            examName: r.examName,
            averageGrade: avg,
            examDate: r.examDate,
        };
    });

    // 과목별 최근 성적 집계
    const subjectLatestMap: { [subId: string]: number } = {};
    [...records]
        .sort((a, b) => new Date(b.examDate).getTime() - new Date(a.examDate).getTime())
        .forEach((r) => {
            r.subjects.forEach((s) => {
                if (s.grade !== undefined && subjectLatestMap[s.subjectId] === undefined) {
                    subjectLatestMap[s.subjectId] = s.grade;
                }
            });
        });

    const subjectBarData = Object.keys(subjectLatestMap).map((subId) => {
        return {
            subject: SUNEUNG_SUBJECTS.find(s => s.id === subId)?.name || subId,
            grade: subjectLatestMap[subId],
        };
    });

    const COLORS = ["#2563eb", "#06b6d4", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"];

    return {
        hasAssessment,
        careTypeCode,
        currentCare,
        avgGrade,
        trendData,
        subjectBarData,
        COLORS,
    };
};

export default useStudyDashboardData;