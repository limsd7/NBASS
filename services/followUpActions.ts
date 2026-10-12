import type { AssessmentResult } from '../types';
import type { FollowUpDeltaReport } from './followUpAssessmentService';

// 2주 타겟 추적 검사 핸들러 (moved verbatim from App.tsx; no logic change)
export interface FollowUpDeps {
    result: AssessmentResult | null;
    setResult: (r: AssessmentResult) => void;
    setHistory: (updater: (prev: any[]) => any[]) => void;
    setFollowUpTargetResult: (r: AssessmentResult) => void;
    setShowFollowUpModal: (b: boolean) => void;
    setFollowUpNewResult: (r: AssessmentResult) => void;
    setFollowUpDeltaReport: (r: FollowUpDeltaReport) => void;
    setShowFollowUpDeltaModal: (b: boolean) => void;
}

export const createFollowUpHandlers = (deps: FollowUpDeps) => {
    const {
        setResult, setHistory, setFollowUpTargetResult, setShowFollowUpModal,
        setFollowUpNewResult, setFollowUpDeltaReport, setShowFollowUpDeltaModal,
    } = deps;

    const handleStartFollowUp = (targetResult?: AssessmentResult) => {
        const baseline = targetResult || deps.result;
        if (!baseline) {
            alert('비교할 이전 검사 결과가 없습니다.');
            return;
        }
        setFollowUpTargetResult(baseline);
        setShowFollowUpModal(true);
    };

    const handleFollowUpComplete = (newResult: AssessmentResult, deltaReport: FollowUpDeltaReport) => {
        setResult(newResult);
        const historyItem = { ...newResult, date: new Date().toISOString() };
        setHistory(prev => [historyItem, ...prev].slice(0, 50));
        setFollowUpNewResult(newResult);
        setFollowUpDeltaReport(deltaReport);
        setShowFollowUpModal(false);
        setShowFollowUpDeltaModal(true);
    };

    return { handleStartFollowUp, handleFollowUpComplete };
};
