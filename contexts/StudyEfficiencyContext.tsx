
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
    ChronotypeResult,
    VARKResult,
    TAIResult,
    DigitalAddictionResult,
    MetacognitionResult
} from '../data/studyEfficiencyAssessments';
import { StudyEfficiencyPersistenceService } from '../services/studyEfficiencyPersistence';

// Define the results interface locally to avoid circular dependencies if imports become tricky,
// or import it if it's exported and safe.
// StudyEfficiencyAssessment.tsx exports StudyEfficiencyResults.
// However, creating a context often implies shared state, so it's safer to define types clearly here or use shared types.
// Since StudyEfficiencyResults is in the component file, I'll redefine the shape or import it.
// To avoid importing from a component file (which might cause issues), I'll define it here.

export interface StudyEfficiencyResults {
    chronotype?: { score: number; result: ChronotypeResult };
    vark?: VARKResult;
    testAnxiety?: TAIResult;
    digitalAddiction?: DigitalAddictionResult;
    metacognition?: MetacognitionResult;
    completedAt: string;
}

export type AssessmentType = 'chronotype' | 'vark' | 'testAnxiety' | 'digitalAddiction' | 'metacognition';

interface StudyEfficiencyContextType {
    // Assessment Answers State
    chronotypeAnswers: number[];
    setChronotypeAnswers: (answers: number[]) => void;

    varkAnswers: Record<string, 'V' | 'A' | 'R' | 'K'>;
    setVarkAnswers: (answers: Record<string, 'V' | 'A' | 'R' | 'K'>) => void;

    taiAnswers: number[];
    setTaiAnswers: (answers: number[]) => void;

    digitalAnswers: number[];
    setDigitalAnswers: (answers: number[]) => void;

    metacognitionAnswers: number[];
    setMetacognitionAnswers: (answers: number[]) => void;

    // Overall Results & Progress
    results: Partial<StudyEfficiencyResults>;
    setResults: (results: Partial<StudyEfficiencyResults>) => void;

    completedAssessments: Set<AssessmentType>;
    setCompletedAssessments: React.Dispatch<React.SetStateAction<Set<AssessmentType>>>;

    // Clear State
    resetAll: () => void;

    // Student Context for Persistence
    studentId: string | null;
    setStudentId: (id: string | null) => void;
}

const StudyEfficiencyContext = createContext<StudyEfficiencyContextType | null>(null);

// Update Provider to accept optional initial prop but manage state internally
export const StudyEfficiencyProvider: React.FC<{ children: ReactNode; initialStudentId?: string }> = ({ children, initialStudentId }) => {
    // Initial States
    const [studentId, setStudentId] = useState<string | null>(initialStudentId || null);
    const [chronotypeAnswers, setChronotypeAnswers] = useState<number[]>(new Array(7).fill(-1));
    const [varkAnswers, setVarkAnswers] = useState<Record<string, 'V' | 'A' | 'R' | 'K'>>({});
    const [taiAnswers, setTaiAnswers] = useState<number[]>(new Array(14).fill(0));
    const [digitalAnswers, setDigitalAnswers] = useState<number[]>(new Array(12).fill(0));
    const [metacognitionAnswers, setMetacognitionAnswers] = useState<number[]>(new Array(12).fill(0));

    const [results, setResults] = useState<Partial<StudyEfficiencyResults>>({});
    const [completedAssessments, setCompletedAssessments] = useState<Set<AssessmentType>>(new Set());

    // Persistence Effect: Load data when studentId changes
    useEffect(() => {
        if (studentId) {
            StudyEfficiencyPersistenceService.loadResults(studentId).then(loaded => {
                if (loaded) {
                    setResults(loaded);
                    // Mark completed based on loaded data
                    const completed = new Set<AssessmentType>();
                    if (loaded.chronotype) completed.add('chronotype');
                    if (loaded.vark) completed.add('vark');
                    if (loaded.testAnxiety) completed.add('testAnxiety');
                    if (loaded.digitalAddiction) completed.add('digitalAddiction');
                    if (loaded.metacognition) completed.add('metacognition');
                    setCompletedAssessments(completed);
                }
            });
        }
    }, [studentId]);

    // Persistence Effect: Save data when results change significantly
    useEffect(() => {
        // Debounce or check meaningful changes could be added, but for now specific updates are fine.
        // We only save if there is at least one result
        const hasData = Object.keys(results).length > 0;
        if (studentId && hasData) {
            // Avoid saving empty or initial states unnecessarily
            if (results.chronotype || results.vark || results.testAnxiety || results.digitalAddiction || results.metacognition) {
                StudyEfficiencyPersistenceService.saveResults(studentId, results as any);
            }
        }
    }, [results, studentId]);

    const resetAll = () => {
        setChronotypeAnswers(new Array(7).fill(-1));
        setVarkAnswers({});
        setTaiAnswers(new Array(14).fill(0));
        setDigitalAnswers(new Array(12).fill(0));
        setMetacognitionAnswers(new Array(12).fill(0));
        setResults({});
        setCompletedAssessments(new Set());
    };

    return (
        <StudyEfficiencyContext.Provider value={{
            chronotypeAnswers, setChronotypeAnswers,
            varkAnswers, setVarkAnswers,
            taiAnswers, setTaiAnswers,
            digitalAnswers, setDigitalAnswers,
            metacognitionAnswers, setMetacognitionAnswers,
            results, setResults,
            completedAssessments, setCompletedAssessments,
            resetAll,
            studentId, setStudentId
        }}>
            {children}
        </StudyEfficiencyContext.Provider>
    );
};

export const useStudyEfficiency = () => {
    const context = useContext(StudyEfficiencyContext);
    if (!context) {
        throw new Error('useStudyEfficiency must be used within a StudyEfficiencyProvider');
    }
    return context;
};
