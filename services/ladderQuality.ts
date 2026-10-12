/**
 * 사다리 훈련 문항 품질(오답률) 기반 난이도 보정 (P2-10)
 *
 * - 문항별 시도/정답 횟수를 로컬에 누적 기록하여 실측 정답률을 산출합니다.
 * - 실측 정답률이 기준을 벗어나면 난이도 조정(상향/유지/하향)을 제안합니다.
 *     · 정답률 과다(>=85%, 표본 충분) → 너무 쉬움 → 난이도 상향 제안
 *     · 정답률 과소(<=40%, 표본 충분) → 너무 어려움/문항 오류 의심 → 난이도 하향·검수 제안
 * - 순수 집계 + localStorage 저장소로 분리하여 화면과 독립적으로 동작합니다.
 */

const STORAGE_KEY = 'nbass_ladder_quality';
const MIN_SAMPLE = 5;

export interface LadderAttemptInput {
    questionId: string;
    /** `${subjectName}::${unitName}` 형태의 단원 키 */
    unitKey: string;
    stage: string;
    correct: boolean;
}

interface QuestionStat {
    attempts: number;
    correct: number;
    unitKey: string;
    stage: string;
    updatedAt: number;
}

type QualityStore = Record<string, QuestionStat>;

export interface QuestionQuality {
    questionId: string;
    unitKey: string;
    stage: string;
    attempts: number;
    correct: number;
    /** 0~100 */
    accuracy: number;
    suggestedAdjustment: 'up' | 'keep' | 'down';
    note: string;
}

export interface UnitQuality {
    unitKey: string;
    attempts: number;
    accuracy: number;
    suggestedDifficultyAdjustment: 'up' | 'keep' | 'down';
    note: string;
    questions: number;
}

const readStore = (): QualityStore => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? (JSON.parse(raw) as QualityStore) : {};
    } catch {
        return {};
    }
};

const writeStore = (store: QualityStore) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch {
        /* 용량 초과 시 무시 */
    }
};

const decideAdjustment = (accuracy: number, attempts: number): 'up' | 'keep' | 'down' => {
    if (attempts < MIN_SAMPLE) return 'keep';
    if (accuracy >= 85) return 'up';
    if (accuracy <= 40) return 'down';
    return 'keep';
};

const noteFor = (adj: 'up' | 'keep' | 'down', accuracy: number, attempts: number): string => {
    if (attempts < MIN_SAMPLE) return `표본 부족(${attempts}회) · 판단 보류`;
    if (adj === 'up') return `정답률 ${accuracy}% · 난이도 상향 검토`;
    if (adj === 'down') return `정답률 ${accuracy}% · 난이도 하향/문항 검수 검토`;
    return `정답률 ${accuracy}% · 난이도 적정`;
};

export const recordLadderAttempt = ({ questionId, unitKey, stage, correct }: LadderAttemptInput): void => {
    if (!questionId) return;
    const store = readStore();
    const prev = store[questionId] || { attempts: 0, correct: 0, unitKey, stage, updatedAt: 0 };
    store[questionId] = {
        attempts: prev.attempts + 1,
        correct: prev.correct + (correct ? 1 : 0),
        unitKey: unitKey || prev.unitKey,
        stage: stage || prev.stage,
        updatedAt: Date.now(),
    };
    writeStore(store);
};

export const getQuestionQuality = (questionId: string): QuestionQuality | null => {
    const stat = readStore()[questionId];
    if (!stat) return null;
    const accuracy = stat.attempts > 0 ? Math.round((stat.correct / stat.attempts) * 100) : 0;
    const adj = decideAdjustment(accuracy, stat.attempts);
    return {
        questionId,
        unitKey: stat.unitKey,
        stage: stat.stage,
        attempts: stat.attempts,
        correct: stat.correct,
        accuracy,
        suggestedAdjustment: adj,
        note: noteFor(adj, accuracy, stat.attempts),
    };
};

export const getUnitQuality = (unitKey: string): UnitQuality | null => {
    const store = readStore();
    const entries = Object.entries(store).filter(([, s]) => s.unitKey === unitKey);
    if (entries.length === 0) return null;

    const attempts = entries.reduce((sum, [, s]) => sum + s.attempts, 0);
    const correct = entries.reduce((sum, [, s]) => sum + s.correct, 0);
    const accuracy = attempts > 0 ? Math.round((correct / attempts) * 100) : 0;
    const adj = decideAdjustment(accuracy, attempts);
    return {
        unitKey,
        attempts,
        accuracy,
        suggestedDifficultyAdjustment: adj,
        note: noteFor(adj, accuracy, attempts),
        questions: entries.length,
    };
};

export const listQuestionQuality = (): QuestionQuality[] => {
    const store = readStore();
    return Object.keys(store)
        .map((id) => getQuestionQuality(id))
        .filter((q): q is QuestionQuality => Boolean(q));
};

export const resetLadderQuality = (): void => {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch {
        /* ignore */
    }
};

/**
 * 특정 문항의 이전 풀이 시도 횟수 반환
 */
export const getQuestionAttemptCount = (questionId: string): number => {
    if (!questionId) return 0;
    const store = readStore();
    return store[questionId]?.attempts || 0;
};

/**
 * 주어진 문항들 중 이전에 1회 이상 풀어본 문항이 포함되어 있는지 여부 반환
 */
export const hasAnyQuestionAttempted = (questionIds: string[]): boolean => {
    if (!questionIds || questionIds.length === 0) return false;
    const store = readStore();
    return questionIds.some(id => (store[id]?.attempts || 0) > 0);
};