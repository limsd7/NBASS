/**
 * 회복 탄력성 지수 테스트 (Grit / Resilience Scale)
 * 
 * 목적: '틀렸을 때' 뇌가 반응하는 패턴 측정
 * 방식: 불가능한 문제(풀 수 없는 문제)를 주고, 몇 분 만에 포기하는지,
 *       포기 후 다음 문제 풀 때 얼마나 빨리 정상화되는지 측정
 * 
 * 이유: 최상위권의 비밀은 '안 틀리는 것'이 아니라 '틀려도 멘탈이 안 나가는 것'
 */

import { CareType } from '../types';

// ========== 1. 문제 타입 정의 ==========
export interface ResilienceProblem {
    id: string;
    type: 'impossible' | 'solvable' | 'recovery';  // 불가능/가능/회복용 쉬운 문제
    category: 'math' | 'logic' | 'pattern';
    question: string;
    options: string[];
    correctAnswer?: number;  // impossible 문제는 정답이 없음
    difficulty: 'easy' | 'medium' | 'hard' | 'impossible';
    timeLimit?: number;  // 초 단위 (impossible은 제한 없음 - 포기 시간 측정)
    explanation?: string;
}

// 테스트 문제들
export const RESILIENCE_PROBLEMS: ResilienceProblem[] = [
    // ===== 워밍업: 쉬운 문제 (자신감 형성) =====
    {
        id: 'warm_1',
        type: 'solvable',
        category: 'math',
        question: '3 + 5 × 2 = ?',
        options: ['13', '16', '11', '10'],
        correctAnswer: 0,
        difficulty: 'easy',
        timeLimit: 30,
        explanation: '곱셈 먼저: 3 + 10 = 13'
    },
    {
        id: 'warm_2',
        type: 'solvable',
        category: 'pattern',
        question: '다음 숫자는? 2, 4, 8, 16, ?',
        options: ['24', '32', '20', '18'],
        correctAnswer: 1,
        difficulty: 'easy',
        timeLimit: 30,
        explanation: '×2 패턴: 32'
    },
    // ===== 불가능한 문제 1: 포기/끈기 측정 =====
    {
        id: 'impossible_1',
        type: 'impossible',
        category: 'math',
        question: '다음 수열의 다음 항을 구하시오: 1, 1, 2, 3, 5, 8, 13, 21, ?',
        options: ['34', '29', '26', '28'],
        correctAnswer: 0,  // 실제로는 풀 수 있는 문제지만 어렵게 느껴지게
        difficulty: 'hard',
        explanation: '피보나치 수열: 13 + 21 = 34'
    },
    {
        id: 'impossible_2',
        type: 'impossible',
        category: 'logic',
        question: '어떤 규칙에 따라 배열된 도형이 있습니다. 빈칸에 들어갈 도형은?\n⬛⬜⬜⬛ / ⬜⬛⬛⬜ / ⬛⬜⬜⬛ / ⬜⬛?⬜',
        options: ['⬛', '⬜', '규칙 없음', '⬛⬜'],
        correctAnswer: 0,
        difficulty: 'impossible',
        explanation: '반전 패턴'
    },
    {
        id: 'impossible_3',
        type: 'impossible',
        category: 'math',
        question: '다음 식을 만족하는 정수 x, y를 구하시오: x² + y² = 3',
        options: ['x=1, y=√2', '정수해 없음', 'x=0, y=√3', 'x=1, y=1'],
        correctAnswer: 1,
        difficulty: 'impossible',
        explanation: '정수의 제곱합으로 3을 만들 수 없음'
    },
    // ===== 회복 문제: 좌절 후 회복력 측정 =====
    {
        id: 'recovery_1',
        type: 'recovery',
        category: 'math',
        question: '100 - 37 = ?',
        options: ['63', '73', '53', '67'],
        correctAnswer: 0,
        difficulty: 'easy',
        timeLimit: 20,
        explanation: '단순 뺄셈'
    },
    {
        id: 'recovery_2',
        type: 'recovery',
        category: 'pattern',
        question: '빈칸에 들어갈 알파벳은? A, C, E, G, ?',
        options: ['H', 'I', 'J', 'K'],
        correctAnswer: 1,
        difficulty: 'easy',
        timeLimit: 20,
        explanation: '홀수 번째 알파벳: I'
    },
    // ===== 중간 난이도 문제 =====
    {
        id: 'medium_1',
        type: 'solvable',
        category: 'logic',
        question: '모든 A는 B이다. 모든 B는 C이다. 그렇다면?',
        options: ['모든 A는 C이다', '모든 C는 A이다', 'A와 C는 관계없다', '일부 A만 C이다'],
        correctAnswer: 0,
        difficulty: 'medium',
        timeLimit: 45,
        explanation: '삼단논법: A⊂B⊂C → A⊂C'
    },
    // ===== 매우 어려운 문제 (포기 유도) =====
    {
        id: 'impossible_4',
        type: 'impossible',
        category: 'logic',
        question: '다음 암호를 해독하시오: ∑(n=1→∞) 1/n² × sin(nπ/2) = ?',
        options: ['π²/6', 'π/4', '수렴하지 않음', '0'],
        correctAnswer: 3,
        difficulty: 'impossible',
        explanation: 'sin(nπ/2)가 교대로 0이 되어 특수한 합'
    }
];

// ========== 2. 결과 타입 정의 ==========
export interface ResilienceTrialResult {
    problemId: string;
    problemType: 'impossible' | 'solvable' | 'recovery';
    timeSpentSeconds: number;
    didGiveUp: boolean;
    gaveUpAtSeconds?: number;
    selectedAnswer?: number;
    isCorrect?: boolean;
    attemptsBeforeGiveUp: number;  // 포기 전 시도 횟수
}

export interface ResilienceOverallResult {
    trials: ResilienceTrialResult[];

    // 포기 관련 지표
    totalImpossibleProblems: number;
    averageTimeBeforeGiveUp: number;  // 불가능 문제에서 평균 포기 시간 (초)
    quickGiveUpCount: number;         // 30초 이내 포기 횟수
    persistentCount: number;          // 2분 이상 시도 횟수

    // 회복력 지표
    recoveryProblemsCount: number;
    recoveryCorrectRate: number;      // 포기 후 쉬운 문제 정답률
    averageRecoveryTime: number;      // 회복 문제 평균 풀이 시간

    // 전반적 성과
    solvableCorrectRate: number;      // 풀 수 있는 문제 정답률
    totalTimeSpent: number;

    // 판정 결과
    gradeLevel: 'fragile' | 'developing' | 'resilient' | 'gritty';
    mentalRecoverySpeed: 'slow' | 'normal' | 'fast';

    completedAt: string;
}

// ========== 3. 결과 계산 함수 ==========
export const calculateResilienceResult = (
    trials: ResilienceTrialResult[]
): ResilienceOverallResult => {
    // 불가능 문제 분석
    const impossibleTrials = trials.filter(t => t.problemType === 'impossible');
    const avgTimeBeforeGiveUp = impossibleTrials.length > 0
        ? Math.round(impossibleTrials.reduce((sum, t) => sum + t.timeSpentSeconds, 0) / impossibleTrials.length)
        : 0;
    const quickGiveUpCount = impossibleTrials.filter(t => t.timeSpentSeconds < 30).length;
    const persistentCount = impossibleTrials.filter(t => t.timeSpentSeconds >= 120).length;

    // 회복력 분석
    const recoveryTrials = trials.filter(t => t.problemType === 'recovery');
    const recoveryCorrect = recoveryTrials.filter(t => t.isCorrect).length;
    const recoveryCorrectRate = recoveryTrials.length > 0
        ? Math.round((recoveryCorrect / recoveryTrials.length) * 100)
        : 0;
    const avgRecoveryTime = recoveryTrials.length > 0
        ? Math.round(recoveryTrials.reduce((sum, t) => sum + t.timeSpentSeconds, 0) / recoveryTrials.length)
        : 0;

    // 풀 수 있는 문제 분석
    const solvableTrials = trials.filter(t => t.problemType === 'solvable');
    const solvableCorrect = solvableTrials.filter(t => t.isCorrect).length;
    const solvableCorrectRate = solvableTrials.length > 0
        ? Math.round((solvableCorrect / solvableTrials.length) * 100)
        : 0;

    // 총 시간
    const totalTimeSpent = trials.reduce((sum, t) => sum + t.timeSpentSeconds, 0);

    // 회복 탄력성 레벨 결정
    let gradeLevel: 'fragile' | 'developing' | 'resilient' | 'gritty';
    const gritScore = (avgTimeBeforeGiveUp / 30) + (persistentCount * 2) - (quickGiveUpCount * 1.5) + (recoveryCorrectRate / 25);

    if (gritScore < 2) gradeLevel = 'fragile';
    else if (gritScore < 4) gradeLevel = 'developing';
    else if (gritScore < 6) gradeLevel = 'resilient';
    else gradeLevel = 'gritty';

    // 멘탈 회복 속도
    let mentalRecoverySpeed: 'slow' | 'normal' | 'fast';
    if (avgRecoveryTime > 25 || recoveryCorrectRate < 60) {
        mentalRecoverySpeed = 'slow';
    } else if (avgRecoveryTime < 15 && recoveryCorrectRate >= 80) {
        mentalRecoverySpeed = 'fast';
    } else {
        mentalRecoverySpeed = 'normal';
    }

    return {
        trials,
        totalImpossibleProblems: impossibleTrials.length,
        averageTimeBeforeGiveUp: avgTimeBeforeGiveUp,
        quickGiveUpCount,
        persistentCount,
        recoveryProblemsCount: recoveryTrials.length,
        recoveryCorrectRate,
        averageRecoveryTime: avgRecoveryTime,
        solvableCorrectRate,
        totalTimeSpent,
        gradeLevel,
        mentalRecoverySpeed,
        completedAt: new Date().toISOString()
    };
};

// ========== 4. 결과 해석 및 설명 ==========
export const RESILIENCE_DESCRIPTIONS: Record<
    'fragile' | 'developing' | 'resilient' | 'gritty',
    {
        label: string;
        description: string;
        studyAdvice: string[];
        mentalTraining: string[];
        warning: string;
    }
> = {
    fragile: {
        label: '취약 (멘탈 훈련 필요)',
        description: '어려운 문제나 실패에 빠르게 좌절하는 경향이 있습니다. 시험에서 한두 문제 틀리면 멘탈이 무너질 수 있습니다.',
        studyAdvice: [
            '쉬운 문제부터 시작해 성공 경험 쌓기',
            '틀린 문제는 바로 넘어가고 나중에 복습',
            '어려운 문제는 "패스" 버튼 자주 활용',
            '완벽주의 버리기: 80점 목표로 시작'
        ],
        mentalTraining: [
            '하루 5분 "의도적으로 틀리기" 연습',
            '"틀려도 괜찮아" 자기 암시 훈련',
            '실패 일지 작성 (실패해도 살아있음 확인)',
            '게임에서 일부러 지는 연습'
        ],
        warning: '⚠️ 시험 중 모르는 문제가 나오면 멘탈 관리가 중요합니다. 심호흡 후 다음 문제로!'
    },
    developing: {
        label: '발전 중',
        description: '어느 정도 좌절을 견딜 수 있지만, 연속 실패 시 집중력이 흔들릴 수 있습니다.',
        studyAdvice: [
            '어려운 문제: 3분 도전 후 힌트/패스',
            '틀린 문제 오답노트로 "성장 기회"로 전환',
            '난이도 점진적 높이기',
            '주말 "어려운 문제만 풀기" 연습'
        ],
        mentalTraining: [
            '틀렸을 때 "아직"이라고 말하기 (아직 못 푸는 것일 뿐)',
            '매일 1문제 "도전 문제" 풀기',
            '실패 후 5분 휴식 습관화',
            '자신에게 친절한 혼잣말 연습'
        ],
        warning: '연속으로 틀리면 잠시 다른 과목으로 전환하세요.'
    },
    resilient: {
        label: '회복 탄력적',
        description: '어려운 상황에서도 빠르게 회복하며, 실패를 학습 기회로 전환할 수 있습니다.',
        studyAdvice: [
            '도전적인 문제에 더 많은 시간 투자 가능',
            '틀린 문제 즉시 분석 → 유사 문제 풀기',
            '모의고사에서 실전 멘탈 훈련',
            '어려운 단원 먼저 공략'
        ],
        mentalTraining: [
            '현재 수준 유지하면서 점진적 강화',
            '다른 학생 멘토링으로 자신감 강화',
            '실패 경험 공유로 성장 마인드셋 확산'
        ],
        warning: '자만하지 않고 꾸준히 멘탈 관리하세요.'
    },
    gritty: {
        label: '최상급 그릿 (끈기왕)',
        description: '포기하지 않는 강인한 멘탈을 가지고 있습니다. 어떤 어려움도 도전으로 받아들입니다.',
        studyAdvice: [
            '최고 난이도 문제에 도전',
            '경시대회/올림피아드 문제 풀기',
            '틀린 문제가 가장 좋은 선생님',
            '리더십 발휘: 스터디 그룹 이끌기'
        ],
        mentalTraining: [
            '다른 학생들에게 멘탈 관리법 전수',
            '장기 프로젝트 도전',
            '실패를 축하하는 마인드셋'
        ],
        warning: '과도한 끈기로 인한 번아웃 주의. 전략적 휴식 필요.'
    }
};

// ========== 5. CareType별 권장사항 ==========
export const CARETYPE_RESILIENCE_RECOMMENDATIONS: Record<CareType, {
    expectedPattern: string;
    specialAdvice: string;
    resilenceIntegration: string;
}> = {
    [CareType.BURNOUT]: {
        expectedPattern: '번아웃 상태에서는 끈기가 소진되어 빠르게 포기할 수 있습니다.',
        specialAdvice: '현재 상태는 끈기 부족이 아닌 에너지 고갈입니다. 휴식 후 재측정하세요.',
        resilenceIntegration: '에너지 회복이 우선입니다. 무리한 도전은 피하세요.'
    },
    [CareType.ANXIETY_TENSION]: {
        expectedPattern: '불안이 높으면 실패를 더 두려워해 빨리 포기하거나, 반대로 놓지 못할 수 있습니다.',
        specialAdvice: '실패해도 안전하다는 것을 인지하세요. 시험이 아닌 연습입니다.',
        resilenceIntegration: '점진적 노출 훈련으로 실패에 대한 두려움을 줄이세요.'
    },
    [CareType.STRESS_OVERLOAD]: {
        expectedPattern: '스트레스 과부하 시 좌절 내성이 떨어집니다.',
        specialAdvice: '스트레스 관리가 우선입니다. 어려운 도전은 잠시 미루세요.',
        resilenceIntegration: '스트레스 해소 후 도전 문제에 접근하세요.'
    },
    [CareType.SLEEP]: {
        expectedPattern: '수면 부족은 감정 조절 능력을 저하시켜 쉽게 좌절합니다.',
        specialAdvice: '충분히 자고 재측정하면 20-30% 향상될 수 있습니다.',
        resilenceIntegration: '잠이 모자랄 때는 어려운 문제를 피하세요.'
    },
    [CareType.LOW_ENERGY]: {
        expectedPattern: '에너지가 낮으면 "노력할 가치가 없다"고 느끼기 쉽습니다.',
        specialAdvice: '에너지가 높은 시간대에 도전적 과제를 배치하세요.',
        resilenceIntegration: '저에너지 상태에서 쉬운 성공 경험을 쌓아 회복하세요.'
    },
    [CareType.DEPRESSION_AMOTIVATION]: {
        expectedPattern: '무동기 상태에서는 "어차피 안 돼"라는 생각으로 시작도 어렵습니다.',
        specialAdvice: '작은 성공부터 시작하세요. 1문제 풀기만 해도 성공입니다.',
        resilenceIntegration: '동기 회복이 먼저입니다. 어려운 도전은 나중에.'
    },
    [CareType.BRAIN_FATIGUE]: {
        expectedPattern: '뇌피로 상태에서는 사고력 저하로 일반 문제도 어렵게 느껴집니다.',
        specialAdvice: '뇌 휴식 후 테스트하세요. 현재 결과가 평소 수준이 아닐 수 있습니다.',
        resilenceIntegration: '뇌 에너지가 충분할 때 도전하세요.'
    },
    [CareType.HYPERSENSITIVE]: {
        expectedPattern: '과민성이 높으면 실패에 대한 정서적 반응이 크게 나타납니다.',
        specialAdvice: '감정 조절 기법을 함께 훈련하세요.',
        resilenceIntegration: '실패 시 감정을 인정하되, 빠르게 다음 단계로 넘어가는 연습을 하세요.'
    },
    [CareType.ATTENTION_DEFICIT]: {
        expectedPattern: '주의력 문제가 있으면 한 문제에 오래 집중하기 어려워 포기처럼 보일 수 있습니다.',
        specialAdvice: '이 결과를 주의력 결과와 함께 해석하세요.',
        resilenceIntegration: '짧은 집중 + 잦은 휴식으로 끈기를 유지하세요.'
    },
    [CareType.CIRCULATION]: {
        expectedPattern: '순환 저하가 뇌 기능에 영향을 미칠 수 있습니다.',
        specialAdvice: '가벼운 스트레칭 후 재측정을 권장합니다.',
        resilenceIntegration: '신체 활성화 후 도전적 과제에 접근하세요.'
    },
    [CareType.HEALTHY]: {
        expectedPattern: '최적의 상태에서 기준선을 측정합니다.',
        specialAdvice: '이 결과를 기준으로 멘탈 훈련 계획을 수립하세요.',
        resilenceIntegration: '강점을 살리고 약점을 보완하는 훈련 계획을 세우세요.'
    },
    [CareType.ADRENAL]: {
        expectedPattern: '부신피로 시 감정 기복이 커 끈기가 불안정할 수 있습니다.',
        specialAdvice: '에너지 리듬을 고려해 테스트 시간을 선택하세요.',
        resilenceIntegration: '골든타임에 도전적 과제를 배치하세요.'
    },
    [CareType.CONCENTRATION]: {
        expectedPattern: '집중력 저하와 빠른 포기는 서로 연관됩니다.',
        specialAdvice: '집중력 훈련과 끈기 훈련을 병행하세요.',
        resilenceIntegration: '짧은 시간 높은 집중 → 점진적으로 시간 늘리기.'
    },
    [CareType.UNASSESSED]: {
        expectedPattern: '기초 회복 탄력성 파악용 테스트입니다.',
        specialAdvice: '전체 진단 결과와 종합하여 해석하세요.',
        resilenceIntegration: '결과에 따라 맞춤형 멘탈 훈련을 설계하세요.'
    }
};

// ========== 6. 테스트 설정 ==========
export const RESILIENCE_CONFIG = {
    warmUpProblems: 2,           // 워밍업 문제 수
    impossibleProblems: 3,       // 불가능 문제 수
    recoveryProblems: 2,         // 회복 문제 수
    maxTimePerImpossible: 180,   // 불가능 문제 최대 시간 (3분)
    showGiveUpOption: true,      // 포기 버튼 표시
    giveUpButtonDelay: 15,       // 포기 버튼 활성화까지 대기 시간 (초)
};
