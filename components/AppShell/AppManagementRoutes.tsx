import React from 'react';
import { AssessmentResult, HRVData, LearningAnalyticsData, ProtocolData, StudentInfo } from '../../types';
// 코드 분할(React.lazy): 관리 화면(학습/성적/수면)은 해당 스텝 진입 시점에 지연 로딩합니다.
const StudyManagementView = React.lazy(() => import('../study-management/StudyManagementView').then((m) => ({ default: m.StudyManagementView })));
const GradeManagementView = React.lazy(() => import('../grade-management/GradeManagementView').then((m) => ({ default: m.GradeManagementView })));
const SleepManagementView = React.lazy(() => import('../sleep-management/SleepManagementView').then((m) => ({ default: m.SleepManagementView })));
import { MembershipTier } from '../../utils/featureGate';

interface AppManagementRoutesProps {
    step: string;
    student: StudentInfo;
    hrv: HRVData;
    result: AssessmentResult | null;
    protocol: ProtocolData;
    analytics: LearningAnalyticsData;
    aiModels: import('../../types').AIModelConfig;
    effectiveTier: MembershipTier;
    onBackToResults: () => void;
    onUpgradeClick?: (targetTier?: MembershipTier) => void;
}

const FALLBACK_SURVEY = {
    gad7: 0,
    bai: 0,
    isi: 0,
    chronicFatigue: false,
    fatigueSymptomsCount: 0,
    symptoms: [],
    sympatheticSymptoms: [],
    parasympatheticSymptoms: [],
    concentrationScore: 0,
    adrenalFatigueScore: 0,
};

export const AppManagementRoutes: React.FC<AppManagementRoutesProps> = ({
    step,
    student,
    hrv,
    result,
    protocol,
    analytics,
    aiModels,
    effectiveTier,
    onBackToResults,
    onUpgradeClick,
}) => {
    if (step === 'study_management') {
        return (
            <StudyManagementView
                student={student}
                hrv={hrv}
                survey={result?.survey || FALLBACK_SURVEY}
                protocol={protocol}
                analytics={analytics}
                onBack={onBackToResults}
                membershipTier={effectiveTier}
            />
        );
    }
    if (step === 'grade_management') {
        return (
            <GradeManagementView
                student={student}
                onBack={onBackToResults}
                currentAssessment={result || undefined}
                aiModels={aiModels}
                membershipTier={effectiveTier}
                onUpgradeClick={onUpgradeClick}
            />
        );
    }
    if (step === 'sleep_management') {
        return (
            <SleepManagementView
                student={student}
                onBack={onBackToResults}
                currentAssessment={result || undefined}
                aiModels={aiModels}
                membershipTier={effectiveTier}
            />
        );
    }
    return null;
};
