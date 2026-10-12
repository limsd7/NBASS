import { useState, useEffect } from 'react';

export const useAssessmentMode = () => {
    const [isLandingMode, setIsLandingMode] = useState<boolean>(() => {
        try {
            const params = new URLSearchParams(window.location.search);
            if (params.get('view') === 'landing') return true;
            if (Boolean(params.get('app')) || params.get('role') || params.get('step') || params.get('mode') || params.get('view') === 'app') {
                return false;
            }
            return true;
        } catch {
            return false;
        }
    });

    const [is10MinMode, setIs10MinMode] = useState<boolean>(() => {
        try {
            const params = new URLSearchParams(window.location.search);
            const mode = params.get('mode');
            if (mode === '10min' || mode === '3min') {
                return true;
            }
            return false;
        } catch {
            return false;
        }
    });

    // [P1-6] 짧은 진단판(3~5분) 모드 — 설문 축약 + 선택 단계 생략
    const [isQuickMode, setIsQuickMode] = useState<boolean>(() => {
        try {
            const params = new URLSearchParams(window.location.search);
            const mode = params.get('mode');
            if (mode === 'quick' || mode === '3min' || mode === '5min') return true;
            return localStorage.getItem('nbass_quick_mode') === 'true';
        } catch {
            return false;
        }
    });

    useEffect(() => {
        try {
            const params = new URLSearchParams(window.location.search);
            const mode = params.get('mode');
            if (mode === '10min' || mode === '3min') {
                setIs10MinMode(true);
                try {
                    localStorage.setItem('nbass_assessment_mode', '10min');
                } catch { /* ignore */ }
            } else {
                setIs10MinMode(false);
                try {
                    localStorage.setItem('nbass_assessment_mode', 'full');
                } catch { /* ignore */ }
            }
            if (mode === 'quick' || mode === '3min' || mode === '5min') {
                setIsQuickMode(true);
                try { localStorage.setItem('nbass_quick_mode', 'true'); } catch { /* ignore */ }
            }
            const syncStateFromUrl = () => {
                try {
                    const currentParams = new URLSearchParams(window.location.search);
                    if (currentParams.get('view') === 'landing') {
                        setIsLandingMode(true);
                    } else if (Boolean(currentParams.get('app')) || currentParams.get('role') || currentParams.get('mode') || currentParams.get('action') || currentParams.get('view') === 'app') {
                        setIsLandingMode(false);
                    }
                } catch { /* ignore */ }
            };
            syncStateFromUrl();
            window.addEventListener('popstate', syncStateFromUrl);
            return () => window.removeEventListener('popstate', syncStateFromUrl);
        } catch { /* ignore */ }
    }, []);

    return { isLandingMode, setIsLandingMode, is10MinMode, setIs10MinMode, isQuickMode, setIsQuickMode };
};
