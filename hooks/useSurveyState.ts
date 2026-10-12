import { useState, useMemo } from 'react';
import { calculateLearningTraits } from '../data/learningTraitsData';

export const useSurveyState = () => {
    const [snsSymptomSelection, setSnsSymptomSelection] = useState<string[]>([]);
    const [pnsSymptomSelection, setPnsSymptomSelection] = useState<string[]>([]);
    const [circulationSymptomSelection, setCirculationSymptomSelection] = useState<string[]>([]);
    const [baiAnswers, setBaiAnswers] = useState<number[]>(() => new Array(21).fill(0));
    const [isiAnswers, setIsiAnswers] = useState<number[]>(() => new Array(7).fill(0));
    const [concentrationAnswers, setConcentrationAnswers] = useState<number[]>(() => new Array(7).fill(0));
    const [adrenalAnswers, setAdrenalAnswers] = useState<number[]>(() => new Array(15).fill(0));
    const [fatigueCore, setFatigueCore] = useState<boolean>(false);
    const [fatigueSymptoms, setFatigueSymptoms] = useState<boolean[]>(() => new Array(8).fill(false));
    const [learningTraitsAnswers, setLearningTraitsAnswers] = useState<number[]>(() => new Array(15).fill(3));
    const [baiSubPage, setBaiSubPage] = useState<1 | 2>(1);

    const learningTraitsData = useMemo(
        () => calculateLearningTraits(learningTraitsAnswers),
        [learningTraitsAnswers],
    );

    const resetSurveys = () => {
        setSnsSymptomSelection([]);
        setPnsSymptomSelection([]);
        setCirculationSymptomSelection([]);
        setBaiAnswers(new Array(21).fill(0));
        setIsiAnswers(new Array(7).fill(0));
        setConcentrationAnswers(new Array(7).fill(0));
        setAdrenalAnswers(new Array(15).fill(0));
        setFatigueCore(false);
        setFatigueSymptoms(new Array(8).fill(false));
        setLearningTraitsAnswers(new Array(15).fill(3));
        setBaiSubPage(1);
    };

    return {
        snsSymptomSelection, setSnsSymptomSelection,
        pnsSymptomSelection, setPnsSymptomSelection,
        circulationSymptomSelection, setCirculationSymptomSelection,
        baiAnswers, setBaiAnswers,
        isiAnswers, setIsiAnswers,
        concentrationAnswers, setConcentrationAnswers,
        adrenalAnswers, setAdrenalAnswers,
        fatigueCore, setFatigueCore,
        fatigueSymptoms, setFatigueSymptoms,
        learningTraitsAnswers, setLearningTraitsAnswers,
        learningTraitsData,
        baiSubPage, setBaiSubPage,
        resetSurveys,
    };
};
