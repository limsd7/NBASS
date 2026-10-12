import { computeReadiness } from './assessmentReadiness';
import { getBaiNorm, getIsiNorm } from '../data/assessmentNorms';
import { BAI_QUESTIONS, ISI_QUESTIONS, CONCENTRATION_QUESTIONS, ADRENAL_QUESTIONS } from '../data/questions';

// 설문 점수 집계 + 준비도 + 규준 평가 (moved verbatim from App.tsx; no logic change)
export interface SurveyAnswerSets {
    baiAnswers: number[];
    isiAnswers: number[];
    concentrationAnswers: number[];
    adrenalAnswers: number[];
    fatigueCore: boolean;
    fatigueSymptoms: boolean[];
    snsSymptomSelection: string[];
    pnsSymptomSelection: string[];
    circulationSymptomSelection: string[];
}

export const computeSurveyScores = (sets: SurveyAnswerSets) => {
    const bai = sets.baiAnswers.reduce((a, b) => a + b, 0);
    const isi = sets.isiAnswers.reduce((a, b) => a + b, 0);
    const concentration = sets.concentrationAnswers.reduce((a, b) => a + b, 0);
    const adrenal = sets.adrenalAnswers.reduce((a, b) => a + b, 0);
    const fatigueCount = sets.fatigueSymptoms.filter(s => s).length;
    const snsCount = sets.snsSymptomSelection.length;
    const pnsCount = sets.pnsSymptomSelection.length;
    const circulationCount = sets.circulationSymptomSelection.length;
    const circulationScore = circulationCount * 3;
    return {
        bai,
        isi,
        concentration,
        adrenal,
        fatigueCount,
        snsCount,
        pnsCount,
        circulationCount,
        circulation: circulationScore,
        circulationSymptoms: sets.circulationSymptomSelection,
        isChronicFatigue: sets.fatigueCore && fatigueCount >= 4
    };
};

export interface ReadinessInputs extends SurveyAnswerSets {
    protocolLocation?: string;
    analyticsTested?: boolean;
    cognitiveTested?: boolean;
}

// [P1-8] 제출/분석 중 누락 항목(확정 진단 가능성) 안내
export const computeAssessmentReadiness = (inputs: ReadinessInputs) => {
    return computeReadiness([
        { key: 'bai', label: '불안(BAI) 설문', answered: inputs.baiAnswers.filter((a) => a >= 0).length, total: BAI_QUESTIONS.length, required: true },
        { key: 'isi', label: '수면(ISI) 설문', answered: inputs.isiAnswers.filter((a) => a >= 0).length, total: ISI_QUESTIONS.length, required: true },
        { key: 'concentration', label: '집중력 설문', answered: inputs.concentrationAnswers.filter((a) => a >= 0).length, total: CONCENTRATION_QUESTIONS.length, required: true },
        { key: 'adrenal', label: '부신피로 설문', answered: inputs.adrenalAnswers.filter((a) => a >= 0).length, total: ADRENAL_QUESTIONS.length, required: true },
        { key: 'protocol', label: '학습 프로토콜', answered: inputs.protocolLocation ? 1 : 0, total: 1, required: false },
        { key: 'analytics', label: '학습 분석', answered: inputs.analyticsTested ? 1 : 0, total: 1, required: false },
        { key: 'cognitive', label: '인지 검사', answered: inputs.cognitiveTested ? 1 : 0, total: 1, required: false },
    ]);
};

export const evaluateBai = (score: number) => {
    const norm = getBaiNorm(score);
    if (score <= 9) return { text: `정상 범위 · ${norm.peerLabel}`, color: "text-emerald-600" };
    if (score <= 18) return { text: `경미한 수준의 불안 · ${norm.peerLabel}`, color: "text-blue-600" };
    if (score <= 29) return { text: `상당한 수준의 불안 (관심 필요) · ${norm.peerLabel}`, color: "text-orange-600" };
    return { text: `심한 수준의 불안 (전문가 상담 권고) · ${norm.peerLabel}`, color: "text-red-600" };
};

export const evaluateIsi = (score: number) => {
    const norm = getIsiNorm(score);
    if (score <= 7) return { text: `걱정할 만큼의 불면증이 없습니다. · ${norm.peerLabel}`, color: "text-emerald-600" };
    if (score <= 14) return { text: `약간의 불면경향이 있습니다. · ${norm.peerLabel}`, color: "text-blue-600" };
    if (score <= 21) return { text: `중등도의 불면증이 있습니다. · ${norm.peerLabel}`, color: "text-orange-600" };
    return { text: `심한 불면증이 있습니다. · ${norm.peerLabel}`, color: "text-red-600" };
};

export const evaluateAdrenal = (score: number) => {
    if (score < 10) return { text: "비교적 양호한 상태입니다. 규칙적인 생활을 유지하세요.", color: "text-emerald-600" };
    if (score <= 25) return { text: "초기 부신피로 단계입니다. 스트레스 관리와 충분한 휴식이 필요합니다.", color: "text-orange-600" };
    return { text: "심한 부신피로 상태일 가능성이 높습니다. 식단 개선과 영양 보충, 전문가 상담이 권장됩니다.", color: "text-red-600" };
};
