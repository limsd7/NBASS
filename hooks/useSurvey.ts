import { useState, useMemo, useCallback } from 'react';

export function useSurvey() {
    const [snsSymptomSelection, setSnsSymptomSelection] = useState<string[]>([]);
    const [pnsSymptomSelection, setPnsSymptomSelection] = useState<string[]>([]);
    const [baiAnswers, setBaiAnswers] = useState<number[]>(new Array(21).fill(0));
    const [isiAnswers, setIsiAnswers] = useState<number[]>(new Array(7).fill(0));
    const [concentrationAnswers, setConcentrationAnswers] = useState<number[]>(new Array(7).fill(0));
    const [fatigueCore, setFatigueCore] = useState<boolean>(false);
    const [fatigueSymptoms, setFatigueSymptoms] = useState<boolean[]>(new Array(8).fill(false));
    const [adrenalAnswers, setAdrenalAnswers] = useState<number[]>(new Array(15).fill(0));
    const [baiSubPage, setBaiSubPage] = useState<1 | 2>(1);

    const surveyScores = useMemo(() => {
        const bai = baiAnswers.reduce((a, b) => a + b, 0);
        const isi = isiAnswers.reduce((a, b) => a + b, 0);
        const concentration = concentrationAnswers.reduce((a, b) => a + b, 0);
        const adrenal = adrenalAnswers.reduce((a, b) => a + b, 0);
        const fatigueCount = fatigueSymptoms.filter(s => s).length;
        const snsCount = snsSymptomSelection.length;
        const pnsCount = pnsSymptomSelection.length;
        return { bai, isi, concentration, adrenal, fatigueCount, snsCount, pnsCount, isChronicFatigue: fatigueCore && fatigueCount >= 4 };
    }, [baiAnswers, isiAnswers, concentrationAnswers, adrenalAnswers, fatigueCore, fatigueSymptoms, snsSymptomSelection, pnsSymptomSelection]);

    const baiEvaluation = useMemo(() => {
        const score = surveyScores.bai;
        if (score <= 9) return { text: "정상 범위", color: "text-emerald-600" };
        if (score <= 18) return { text: "경미한 수준의 불안", color: "text-blue-600" };
        if (score <= 29) return { text: "상당한 수준의 불안 (관심 필요)", color: "text-orange-600" };
        return { text: "심한 수준의 불안 (전문가 상담 권고)", color: "text-red-600" };
    }, [surveyScores.bai]);

    const isiEvaluation = useMemo(() => {
        const score = surveyScores.isi;
        if (score <= 7) return { text: "걱정할 만큼의 불면증이 없습니다.", color: "text-emerald-600" };
        if (score <= 14) return { text: "약간의 불면경향이 있습니다.", color: "text-blue-600" };
        if (score <= 21) return { text: "중등도의 불면증이 있습니다.", color: "text-orange-600" };
        return { text: "심한 불면증이 있습니다.", color: "text-red-600" };
    }, [surveyScores.isi]);

    const adrenalEvaluation = useMemo(() => {
        const score = surveyScores.adrenal;
        if (score < 10) return { text: "비교적 양호한 상태입니다. 규칙적인 생활을 유지하세요.", color: "text-emerald-600" };
        if (score <= 25) return { text: "초기 부신피로 단계입니다. 스트레스 관리와 충분한 휴식이 필요합니다.", color: "text-orange-600" };
        return { text: "심한 부신피로 상태일 가능성이 높습니다. 식단 개선과 영양 보충, 전문가 상담이 권장됩니다.", color: "text-red-600" };
    }, [surveyScores.adrenal]);

    const toggleSnsSymptom = useCallback((s: string) => {
        setSnsSymptomSelection(prev => prev.includes(s) ? prev.filter(i => i !== s) : [...prev, s]);
    }, []);

    const togglePnsSymptom = useCallback((s: string) => {
        setPnsSymptomSelection(prev => prev.includes(s) ? prev.filter(i => i !== s) : [...prev, s]);
    }, []);

    const updateBaiAnswer = useCallback((idx: number, score: number) => {
        setBaiAnswers(prev => {
            const next = [...prev];
            next[idx] = score;
            return next;
        });
    }, []);

    const updateIsiAnswer = useCallback((idx: number, score: number) => {
        setIsiAnswers(prev => {
            const next = [...prev];
            next[idx] = score;
            return next;
        });
    }, []);

    const updateConcentrationAnswer = useCallback((idx: number, score: number) => {
        setConcentrationAnswers(prev => {
            const next = [...prev];
            next[idx] = score;
            return next;
        });
    }, []);

    const toggleFatigueSymptom = useCallback((idx: number) => {
        setFatigueSymptoms(prev => {
            const next = [...prev];
            next[idx] = !next[idx];
            return next;
        });
    }, []);

    const updateAdrenalAnswer = useCallback((idx: number, score: number) => {
        setAdrenalAnswers(prev => {
            const next = [...prev];
            next[idx] = score;
            return next;
        });
    }, []);

    return {
        snsSymptomSelection,
        pnsSymptomSelection,
        baiAnswers,
        isiAnswers,
        concentrationAnswers,
        fatigueCore,
        fatigueSymptoms,
        adrenalAnswers,
        baiSubPage,
        surveyScores,
        baiEvaluation,
        isiEvaluation,
        adrenalEvaluation,
        setFatigueCore,
        setBaiSubPage,
        toggleSnsSymptom,
        togglePnsSymptom,
        updateBaiAnswer,
        updateIsiAnswer,
        updateConcentrationAnswer,
        toggleFatigueSymptom,
        updateAdrenalAnswer,
        
        // Full array setters for SyncAdmin support
        setBaiAnswers,
        setIsiAnswers,
        setConcentrationAnswers,
        setAdrenalAnswers,
        setSnsSymptomSelection,
        setPnsSymptomSelection,
        setFatigueSymptoms
    };
}
