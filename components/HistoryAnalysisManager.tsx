
import React from 'react';
import { HistoryAnalysisModal } from './modals/HistoryAnalysisModal';
import { AssessmentResult, AIModelConfig } from '../types';

interface HistoryAnalysisManagerProps {
    isOpen: boolean;
    onClose: () => void;
    history: (AssessmentResult & { date: string })[];
    selectedStudentId: string | null;
    currentResult: AssessmentResult | null;
    aiModels?: AIModelConfig | null;
}

/**
 * Manages the logic for the History Analysis Modal.
 * It determines the correct student context (name, birthdate, id) 
 * whether accessed from the History View (via selectedStudentId) 
 * or the Results View (via currentResult).
 */
export const HistoryAnalysisManager: React.FC<HistoryAnalysisManagerProps> = ({
    isOpen,
    onClose,
    history,
    selectedStudentId,
    currentResult,
    aiModels
}) => {
    // If not open, we can return null early, but the Modal usually handles isOpen=true/false 
    // with internal transitions or just null.
    // However, the original code had logic to calculate props only when needed.
    // We'll calculate props here.

    if (!isOpen) return null;

    try {
        // Determine student info source
        // Priority: currentResult (if viewing specific result) > historyItem (if selected in history list)

        // Find history item if selectedStudentId is present
        const historyItem = (selectedStudentId && Array.isArray(history))
            ? history.find(h => h?.student?.id === selectedStudentId)
            : null;

        // Resolve props
        const studentName = currentResult?.student?.name || historyItem?.student?.name || "";
        const studentBirthDate = currentResult?.student?.birthDate || historyItem?.student?.birthDate || "";
        const studentId = currentResult?.student?.id || selectedStudentId || undefined;

        // Debug log similar to original implementation for tracing
        console.log("[HistoryManager] Determining props:", {
            fromResult: !!currentResult,
            fromHistory: !!historyItem,
            final: { studentName, studentBirthDate, studentId }
        });

        return (
            <HistoryAnalysisModal
                isOpen={isOpen}
                onClose={onClose}
                studentName={studentName}
                studentBirthDate={studentBirthDate}
                studentId={studentId}
                aiModels={aiModels}
            />
        );
    } catch (err) {
        console.error("[HistoryManager] Failed to render HistoryAnalysisModal:", err);
        return null;
    }
};
