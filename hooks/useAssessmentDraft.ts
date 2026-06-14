import { useEffect, useState, useCallback } from 'react';
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

    // Load Draft on Mount
    useEffect(() => {
        const savedDraft = localStorage.getItem('sn1_assessment_draft');
        if (savedDraft) {
            try {
                const draft: AssessmentDraft = JSON.parse(savedDraft);
                // 24시간 유효성 검사
                if (draft.timestamp && Date.now() - draft.timestamp < 24 * 60 * 60 * 1000) {
                    const confirmRecover = window.confirm(
                        `📋 미완료 검사 데이터가 있습니다.\n\n` +
                        `학생: ${draft.student?.name || '이름없음'}\n` +
                        `진행 단계: ${draft.step}\n` +
                        `저장 시간: ${new Date(draft.timestamp).toLocaleString()}\n\n` +
                        `이전 데이터를 복구하시겠습니까?`
                    );

                    if (confirmRecover) {
                        if (draft.student) setStudent(draft.student);
                        if (draft.hrv) setHrv(draft.hrv);
                        if (draft.protocol) setProtocol(draft.protocol);
                        if (draft.analytics) setAnalytics(draft.analytics);
                        if (draft.bloodTest) setBloodTest(draft.bloodTest);
                        if (draft.snsSymptomSelection) setSnsSymptomSelection(draft.snsSymptomSelection);
                        if (draft.pnsSymptomSelection) setPnsSymptomSelection(draft.pnsSymptomSelection);
                        if (draft.baiAnswers) setBaiAnswers(draft.baiAnswers);
                        if (draft.isiAnswers) setIsiAnswers(draft.isiAnswers);
                        if (draft.concentrationAnswers) setConcentrationAnswers(draft.concentrationAnswers);
                        if (draft.adrenalAnswers) setAdrenalAnswers(draft.adrenalAnswers);
                        if (draft.fatigueCore !== undefined) setFatigueCore(draft.fatigueCore);
                        if (draft.fatigueSymptoms) setFatigueSymptoms(draft.fatigueSymptoms);
                        if (draft.studyEfficiencyResults) setStudyEfficiencyResults(draft.studyEfficiencyResults);
                        if (draft.workingMemoryResults) setWorkingMemoryResults(draft.workingMemoryResults);
                        if (draft.cognitiveResults) setCognitiveResults(draft.cognitiveResults); // Recover cognitive results
                        if (draft.step) setStep(draft.step);
                        setActiveMenu('assessment');
                    } else {
                        localStorage.removeItem('sn1_assessment_draft');
                    }
                } else {
                    // Expired
                    localStorage.removeItem('sn1_assessment_draft');
                }
            } catch (e) {
                console.error('Failed to recover draft', e);
                localStorage.removeItem('sn1_assessment_draft');
            }
        }
    }, []); // Run once on mount

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
        }
    }, [result]);
};
