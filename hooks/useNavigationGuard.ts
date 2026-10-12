import { useState, useMemo, useEffect, useRef, useCallback } from 'react';

export type AppMenu = 'dashboard' | 'assessment' | 'results' | 'schedule' | 'sleep' | 'grades' | 'history' | 'wrongnotes' | 'resources' | 'solutions' | 'progress' | 'habits';
export type AssessmentStep = 'role_selection' | 'student_directory' | 'parent_directory' | 'parent_dashboard' | 'expert_dashboard' | 'owner_dashboard' | 'register' | 'surveys' | 'protocol' | 'analytics' | 'study_efficiency' | 'cognitive_test' | 'working_memory' | 'loading' | 'results' | 'admin_expertise' | 'study_management' | 'grade_management' | 'sleep_management';

interface UseNavigationGuardArgs {
    step: AssessmentStep | string;
    setStep: (s: AssessmentStep | string) => void;
    activeMenu: AppMenu | string;
    setActiveMenu: (m: AppMenu | string) => void;
    currentUserRole: string | null;
    studentName: string;
    onLeaveToResults?: () => void;
}

export const useNavigationGuard = ({
    step,
    setStep,
    activeMenu,
    setActiveMenu,
    currentUserRole,
    studentName,
    onLeaveToResults,
}: UseNavigationGuardArgs) => {
    const [showIncompleteWarningModal, setShowIncompleteWarningModal] = useState(false);
    const [pendingNavigationAction, setPendingNavigationAction] = useState<(() => void) | null>(null);

    const isAssessmentInProgress = useMemo(() => {
        return (
            currentUserRole === 'STUDENT' &&
            activeMenu === 'assessment' &&
            step !== 'results' &&
            step !== 'role_selection' &&
            step !== 'owner_dashboard' &&
            step !== 'parent_dashboard' &&
            step !== 'expert_dashboard' &&
            (step === 'surveys' ||
                step === 'protocol' ||
                step === 'analytics' ||
                step === 'study_efficiency' ||
                step === 'working_memory' ||
                step === 'cognitive_test' ||
                step === 'hrv' ||
                step === 'eeg')
        );
    }, [currentUserRole, activeMenu, step]);

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isAssessmentInProgress) {
                e.preventDefault();
                e.returnValue = '검사가 아직 완료되지 않았습니다. 페이지를 벗어나시겠습니까?';
                return e.returnValue;
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isAssessmentInProgress]);

    const isPoppingHistoryRef = useRef(false);
    const prevNavRef = useRef<{ step: string; activeMenu: string }>({ step: String(step), activeMenu: String(activeMenu) });

    useEffect(() => {
        if (!window.history.state || typeof window.history.state !== 'object' || !('step' in window.history.state)) {
            window.history.replaceState({ step, activeMenu }, '');
        }
        const handlePopState = (event: PopStateEvent) => {
            const state = event.state as { step?: string; activeMenu?: string } | null;
            if (state && (state.step || state.activeMenu)) {
                isPoppingHistoryRef.current = true;
                if (state.step) setStep(state.step);
                if (state.activeMenu) setActiveMenu(state.activeMenu);
                prevNavRef.current = {
                    step: state.step || String(step),
                    activeMenu: state.activeMenu || String(activeMenu),
                };
                setTimeout(() => {
                    isPoppingHistoryRef.current = false;
                }, 60);
            } else {
                isPoppingHistoryRef.current = true;
                const subMenus = ['schedule', 'sleep', 'grades', 'wrongnotes', 'history', 'resources', 'progress'];
                const subSteps = ['sleep_management', 'grade_management', 'study_management'];
                if (subMenus.includes(String(activeMenu)) || subSteps.includes(String(step))) {
                    setStep('results');
                    setActiveMenu('results');
                    window.history.replaceState({ step: 'results', activeMenu: 'results' }, '');
                    prevNavRef.current = { step: 'results', activeMenu: 'results' };
                }
                setTimeout(() => {
                    isPoppingHistoryRef.current = false;
                }, 60);
            }
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [step, activeMenu, setStep, setActiveMenu]);

    useEffect(() => {
        if (isPoppingHistoryRef.current) return;
        const prev = prevNavRef.current;
        if (prev.step !== step || prev.activeMenu !== activeMenu) {
            prevNavRef.current = { step: String(step), activeMenu: String(activeMenu) };
            window.history.pushState({ step, activeMenu }, '');
        }
    }, [step, activeMenu]);

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    }, [step, activeMenu]);

    const navigateToMenu = useCallback(
        (newMenu: AppMenu | string, onResultsRestore?: () => void) => {
            setActiveMenu(newMenu);
            if (newMenu === 'assessment') {
                setStep('register');
            } else if (newMenu === 'grades') {
                setStep('grade_management');
            } else if (newMenu === 'sleep') {
                setStep('sleep_management');
            } else if (newMenu === 'results') {
                if (onResultsRestore) onResultsRestore();
                else setStep('results');
            }
        },
        [setActiveMenu, setStep],
    );

    const handleMenuChangeWithCheck = useCallback(
        (newMenu: AppMenu | string, onNavigate: (m: string) => void) => {
            if (newMenu === activeMenu && newMenu !== 'assessment' && newMenu !== 'results') return;
            if (isAssessmentInProgress && newMenu !== 'assessment') {
                setPendingNavigationAction(() => () => onNavigate(newMenu));
                setShowIncompleteWarningModal(true);
                return;
            }
            onNavigate(newMenu);
        },
        [activeMenu, isAssessmentInProgress],
    );

    const handleHomeClickWithCheck = useCallback(
        (onHome: () => void) => {
            if (isAssessmentInProgress) {
                setPendingNavigationAction(() => onHome);
                setShowIncompleteWarningModal(true);
                return;
            }
            onHome();
        },
        [isAssessmentInProgress],
    );

    const handleConfirmLeave = useCallback(() => {
        setShowIncompleteWarningModal(false);
        const action = pendingNavigationAction;
        setPendingNavigationAction(null);
        if (action) {
            action();
        } else if (onLeaveToResults) {
            onLeaveToResults();
        } else {
            setActiveMenu('results');
            setStep('results');
        }
    }, [pendingNavigationAction, onLeaveToResults, setActiveMenu, setStep]);

    const handleContinueAssessment = useCallback(() => {
        setShowIncompleteWarningModal(false);
        setPendingNavigationAction(null);
        setActiveMenu('assessment');
    }, [setActiveMenu]);

    return {
        isAssessmentInProgress,
        showIncompleteWarningModal,
        setShowIncompleteWarningModal,
        pendingNavigationAction,
        setPendingNavigationAction,
        navigateToMenu,
        handleMenuChangeWithCheck,
        handleHomeClickWithCheck,
        handleConfirmLeave,
        handleContinueAssessment,
    };
};
