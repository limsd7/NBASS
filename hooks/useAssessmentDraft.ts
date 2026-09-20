import React, { useEffect, useState, useCallback } from 'react';
import {
    StudentInfo, HRVData, ProtocolData, LearningAnalyticsData, BloodTestData, AssessmentResult
} from '../types';
import { StudyEfficiencyResults } from '../services/studyEfficiencyService';
import { CognitivePerformanceResults } from '../components/CognitivePerformanceAssessment';

interface AssessmentDraft {
    timestamp: number;
    step: string;
    student: StudentInfo;
    hrv: HRVData;
    protocol: ProtocolData;
    analytics: LearningAnalyticsData;
    bloodTest: BloodTestData;
    snsSymptomSelection: string[];
    pnsSymptomSelection: string[];
    baiAnswers: number[];
    isiAnswers: number[];
    concentrationAnswers: number[];
    adrenalAnswers: number[];
    fatigueCore: boolean;
    fatigueSymptoms: boolean[];
    studyEfficiencyResults: StudyEfficiencyResults | null;
    workingMemoryResults: any; // Added
    cognitiveResults: CognitivePerformanceResults | null; // Added
}

interface UseAssessmentDraftProps {
    step: string;
    activeMenu: string;
    student: StudentInfo;
    hrv: HRVData;
    protocol: ProtocolData;
    analytics: LearningAnalyticsData;
    bloodTest: BloodTestData;
    snsSymptomSelection: string[];
    pnsSymptomSelection: string[];
    baiAnswers: number[];
    isiAnswers: number[];
    concentrationAnswers: number[];
    adrenalAnswers: number[];
    fatigueCore: boolean;
    fatigueSymptoms: boolean[];
    studyEfficiencyResults: StudyEfficiencyResults | null;
    workingMemoryResults: any;
    cognitiveResults: CognitivePerformanceResults | null;
    result: AssessmentResult | null;

    // Setters for recovery
    setStudent: (data: StudentInfo) => void;
    setHrv: (data: HRVData) => void;
    setProtocol: (data: ProtocolData) => void;
    setAnalytics: (data: LearningAnalyticsData) => void;
    setBloodTest: (data: BloodTestData) => void;
    setSnsSymptomSelection: (data: string[]) => void;
    setPnsSymptomSelection: (data: string[]) => void;
    setBaiAnswers: (data: number[]) => void;
    setIsiAnswers: (data: number[]) => void;
    setConcentrationAnswers: (data: number[]) => void;
    setAdrenalAnswers: (data: number[]) => void;
    setFatigueCore: (data: boolean) => void;
    setFatigueSymptoms: (data: boolean[]) => void;
    setStudyEfficiencyResults: (data: StudyEfficiencyResults | null) => void;
    setWorkingMemoryResults: (data: any) => void;
    setCognitiveResults: (data: CognitivePerformanceResults | null) => void; // Added setter
    setStep: (step: any) => void;
    setActiveMenu: (menu: any) => void;
}

export const useAssessmentDraft = ({
    step,
    activeMenu,
    student,
    hrv,
    protocol,
    analytics,
    bloodTest,
    snsSymptomSelection,
    pnsSymptomSelection,
    baiAnswers,
    isiAnswers,
    concentrationAnswers,
    adrenalAnswers,
    fatigueCore,
    fatigueSymptoms,
    studyEfficiencyResults,
    workingMemoryResults,
    cognitiveResults,
    result,
    setStudent,
    setHrv,
    setProtocol,
    setAnalytics,
    setBloodTest,
    setSnsSymptomSelection,
    setPnsSymptomSelection,
    setBaiAnswers,
    setIsiAnswers,
    setConcentrationAnswers,
    setAdrenalAnswers,
    setFatigueCore,
    setFatigueSymptoms,
    setStudyEfficiencyResults,
    setWorkingMemoryResults,
    setCognitiveResults,
    setStep,
    setActiveMenu
}: UseAssessmentDraftProps) => {

    const [pendingDraft, setPendingDraft] = React.useState<AssessmentDraft | null>(null);

    // Load Draft on Mount (조건부 완화: register 단계 제외 & 실제 응답 5개 이상일 때만 조용히 감지)
    useEffect(() => {
        const savedDraft = localStorage.getItem('sn1_assessment_draft');
        if (!savedDraft) return;

        try {
            const draft: AssessmentDraft = JSON.parse(savedDraft);
            // 24시간 유효성 검사
            const isFresh = draft.timestamp && Date.now() - draft.timestamp < 24 * 60 * 60 * 1000;
            if (!isFresh) {
                localStorage.removeItem('sn1_assessment_draft');
                return;
            }

            // 1. 단순 등록(register) 단계는 복구 대상에서 제외 (새로고침 시 귀찮은 알림 방지)
            if (!draft.step || draft.step === 'register') {
                return;
            }

            // 2. 실제 설문 답변 개수 카운트 (최소 5개 이상 작성된 유의미한 데이터인지 확인)
            let answeredCount = 0;
            if (Array.isArray(draft.baiAnswers)) answeredCount += draft.baiAnswers.filter(a => a > 0).length;
            if (Array.isArray(draft.isiAnswers)) answeredCount += draft.isiAnswers.filter(a => a > 0).length;
            if (Array.isArray(draft.concentrationAnswers)) answeredCount += draft.concentrationAnswers.filter(a => a > 0).length;
            if (Array.isArray(draft.adrenalAnswers)) answeredCount += draft.adrenalAnswers.filter(a => a > 0).length;
            if (Array.isArray(draft.snsSymptomSelection)) answeredCount += draft.snsSymptomSelection.length;
            if (Array.isArray(draft.pnsSymptomSelection)) answeredCount += draft.pnsSymptomSelection.length;
            if (draft.studyEfficiencyResults) answeredCount += 5;
            if (draft.cognitiveResults) answeredCount += 5;

            // 5개 미만인 경우(초기 진입 후 나간 경우) 팝업/배너 없이 무시
            if (answeredCount < 5) {
                return;
            }

            // 유의미한 작성 데이터가 있는 경우 조용히 복구 배너용 상태로 세팅
            setPendingDraft(draft);
        } catch (e) {
            console.error('Failed to parse draft', e);
            localStorage.removeItem('sn1_assessment_draft');
        }
    }, []);

    const recoverDraft = () => {
        if (!pendingDraft) return;
        if (pendingDraft.student) setStudent(pendingDraft.student);
        if (pendingDraft.hrv) setHrv(pendingDraft.hrv);
        if (pendingDraft.protocol) setProtocol(pendingDraft.protocol);
        if (pendingDraft.analytics) setAnalytics(pendingDraft.analytics);
        if (pendingDraft.bloodTest) setBloodTest(pendingDraft.bloodTest);
        if (pendingDraft.snsSymptomSelection) setSnsSymptomSelection(pendingDraft.snsSymptomSelection);
        if (pendingDraft.pnsSymptomSelection) setPnsSymptomSelection(pendingDraft.pnsSymptomSelection);
        if (pendingDraft.baiAnswers) setBaiAnswers(pendingDraft.baiAnswers);
        if (pendingDraft.isiAnswers) setIsiAnswers(pendingDraft.isiAnswers);
        if (pendingDraft.concentrationAnswers) setConcentrationAnswers(pendingDraft.concentrationAnswers);
        if (pendingDraft.adrenalAnswers) setAdrenalAnswers(pendingDraft.adrenalAnswers);
        if (pendingDraft.fatigueCore !== undefined) setFatigueCore(pendingDraft.fatigueCore);
        if (pendingDraft.fatigueSymptoms) setFatigueSymptoms(pendingDraft.fatigueSymptoms);
        if (pendingDraft.studyEfficiencyResults) setStudyEfficiencyResults(pendingDraft.studyEfficiencyResults);
        if (pendingDraft.workingMemoryResults) setWorkingMemoryResults(pendingDraft.workingMemoryResults);
        if (pendingDraft.cognitiveResults) setCognitiveResults(pendingDraft.cognitiveResults);
        if (pendingDraft.step) setStep(pendingDraft.step);
        setActiveMenu('assessment');
        setPendingDraft(null);
    };

    const dismissDraft = () => {
        localStorage.removeItem('sn1_assessment_draft');
        setPendingDraft(null);
    };

    // Auto-Save Effect
    useEffect(() => {
        // Don't save on results page, admin page, or if not in assessment menu
        if (step === 'results' || step === 'admin_expertise' || activeMenu !== 'assessment') {
            return;
        }

        const draft: AssessmentDraft = {
            timestamp: Date.now(),
            step,
            student,
            hrv,
            protocol,
            analytics,
            bloodTest,
            snsSymptomSelection,
            pnsSymptomSelection,
            baiAnswers,
            isiAnswers,
            concentrationAnswers,
            adrenalAnswers,
            fatigueCore,
            fatigueSymptoms,
            studyEfficiencyResults,
            workingMemoryResults,
            cognitiveResults // Save cognitive results
        };

        localStorage.setItem('sn1_assessment_draft', JSON.stringify(draft));
    }, [
        step, student, hrv, protocol, analytics, bloodTest,
        snsSymptomSelection, pnsSymptomSelection, baiAnswers,
        isiAnswers, concentrationAnswers, adrenalAnswers,
        fatigueCore, fatigueSymptoms, activeMenu, studyEfficiencyResults,
        workingMemoryResults, cognitiveResults // Trigger save on change
    ]);

    // Clear Draft on Result Generation
    useEffect(() => {
        if (result) {
            localStorage.removeItem('sn1_assessment_draft');
            setPendingDraft(null);
        }
    }, [result]);

    return {
        pendingDraft,
        recoverDraft,
        dismissDraft
    };
};
