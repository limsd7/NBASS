import { useState, useEffect } from 'react';

export const useAssessmentMode = () => {
    const [isLandingMode, setIsLandingMode] = useState<boolean>(() => {
        try {
            const params = new URLSearchParams(window.location.search);
            if (params.get('view') === 'landing') return true;
            if (params.get('app') === 'true' || params.get('role') || params.get('step') || params.get('mode') || params.get('view') === 'app') {
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
            const tier = params.get('tier');
            const savedMode = localStorage.getItem('nbass_assessment_mode');
            if (mode === 'full' || tier === 'pro' || tier === 'premium' || tier === 'vip' || savedMode === 'full') {
                return false;
            }
            return true;
        } catch {
            return true;
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
            const tierParam = params.get('tier');
            if (mode === '10min' || mode === '3min' || tierParam === 'free') {
                setIs10MinMode(true);
                try {
                    localStorage.setItem('nbass_assessment_mode', '10min');
                } catch { /* ignore */ }
            } else if (mode === 'full' || tierParam === 'pro' || tierParam === 'premium' || tierParam === 'vip') {
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
                    } else if (currentParams.get('app') === 'true' || currentParams.get('role') || currentParams.get('mode') || currentParams.get('action') || currentParams.get('view') === 'app') {
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
