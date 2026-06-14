/**
 * 작업 기억 용량 테스트 (Working Memory Capacity Test)
 * - Digit Span (숫자 따라하기): 순방향/역방향
 * - N-Back: 1-Back, 2-Back 테스트
 * 
 * 목적: 머리(RAM)의 크기 측정
 * 이유: 집중력 설문 점수가 높아도 이 용량이 작으면 멀티태스킹이나 복합 문제 풀 때 뇌가 버벅거림
 */

import { CareType } from '../types';

// ========== 1. Digit Span 테스트 설정 ==========
export interface DigitSpanConfig {
    minLength: number;      // 시작 자릿수
    maxLength: number;      // 최대 자릿수
    displayTimeMs: number;  // 각 숫자 표시 시간 (ms)
    triesPerLength: number; // 각 자릿수당 시도 횟수
}

export const DIGIT_SPAN_CONFIG: DigitSpanConfig = {
    minLength: 3,
    maxLength: 9,
    displayTimeMs: 1000,    // 1초간 각 숫자 표시
    triesPerLength: 2       // 2회 연속 실패 시 종료
};

// 무작위 숫자 시퀀스 생성 (연속 동일 숫자 방지)
export const generateDigitSequence = (length: number): number[] => {
    const sequence: number[] = [];
    for (let i = 0; i < length; i++) {
        let digit: number;
        do {
            digit = Math.floor(Math.random() * 10); // 0-9
        } while (sequence.length > 0 && digit === sequence[sequence.length - 1]);
        sequence.push(digit);
    }
    return sequence;
};

// ========== 2. N-Back 테스트 설정 ==========
export interface NBackConfig {
    sequenceLength: number;     // 시퀀스 길이
    targetRatio: number;        // 정답 비율 (0.3 = 30%)
    displayTimeMs: number;      // 각 항목 표시 시간
    interStimulusMs: number;    // 자극 사이 간격
}

export const NBACK_CONFIG: Record<1 | 2, NBackConfig> = {
    1: {
        sequenceLength: 15,
        targetRatio: 0.33,
        displayTimeMs: 1500,
        interStimulusMs: 500
    },
    2: {
        sequenceLength: 18,
        targetRatio: 0.30,
        displayTimeMs: 2000,
        interStimulusMs: 500
    }
};

// N-Back 시퀀스 생성 (정답 포함)
export interface NBackItem {
    value: string;
    isTarget: boolean;  // N개 전 항목과 일치 여부
}

export const generateNBackSequence = (n: 1 | 2): NBackItem[] => {
    const config = NBACK_CONFIG[n];
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const sequence: NBackItem[] = [];
    const targetCount = Math.floor(config.sequenceLength * config.targetRatio);
    let currentTargets = 0;

    for (let i = 0; i < config.sequenceLength; i++) {
        if (i < n) {
            // 처음 n개는 타겟이 될 수 없음
            sequence.push({
                value: letters[Math.floor(Math.random() * letters.length)],
                isTarget: false
            });
        } else {
            // n개 전 항목과 일치시킬지 결정
            const shouldBeTarget = currentTargets < targetCount &&
                Math.random() < (targetCount - currentTargets) / (config.sequenceLength - i);

            if (shouldBeTarget) {
                sequence.push({
                    value: sequence[i - n].value,
                    isTarget: true
                });
                currentTargets++;
            } else {
                // 다른 문자 선택 (n개 전과 다르게)
                let letter: string;
                do {
                    letter = letters[Math.floor(Math.random() * letters.length)];
                } while (letter === sequence[i - n].value);

                sequence.push({
                    value: letter,
                    isTarget: false
                });
            }
        }
    }

    return sequence;
};

// ========== 3. 결과 타입 정의 ==========
export interface DigitSpanResult {
    forwardSpan: number;        // 순방향 최대 자릿수
    backwardSpan: number;       // 역방향 최대 자릿수
    totalSpan: number;          // 합계 (forward + backward)
    forwardTrials: number[];    // 각 길이별 시도 결과
    backwardTrials: number[];   // 각 길이별 시도 결과
}

export interface NBackResult {
    level: 1 | 2;
    hits: number;           // 정답을 맞춘 횟수
    misses: number;         // 정답을 놓친 횟수
    falseAlarms: number;    // 오답을 정답으로 선택한 횟수
    correctRejections: number; // 오답을 올바르게 거부한 횟수
    accuracy: number;       // 전체 정확도 (0-100)
    dPrime: number;         // 민감도 지표
}

export interface WorkingMemoryResult {
    digitSpan?: DigitSpanResult;
    nBack1?: NBackResult;
    nBack2?: NBackResult;
    overallLevel: 'low' | 'below_average' | 'average' | 'above_average' | 'high';
    overallScore: number;   // 종합 점수 (0-100)
    completedAt: string;
}

// ========== 4. 결과 계산 함수 ==========
export const calculateDigitSpanResult = (
    forwardTrials: boolean[][],  // 각 길이별 성공 여부 배열
    backwardTrials: boolean[][]
): DigitSpanResult => {
    // 순방향: 최소 1회 성공한 최대 길이
    let forwardSpan = DIGIT_SPAN_CONFIG.minLength - 1;
    for (let i = 0; i < forwardTrials.length; i++) {
        const length = DIGIT_SPAN_CONFIG.minLength + i;
        if (forwardTrials[i].some(success => success)) {
            forwardSpan = length;
        }
    }

    // 역방향: 최소 1회 성공한 최대 길이
    let backwardSpan = DIGIT_SPAN_CONFIG.minLength - 1;
    for (let i = 0; i < backwardTrials.length; i++) {
        const length = DIGIT_SPAN_CONFIG.minLength + i;
        if (backwardTrials[i].some(success => success)) {
            backwardSpan = length;
        }
    }

    return {
        forwardSpan,
        backwardSpan,
        totalSpan: forwardSpan + backwardSpan,
        forwardTrials: forwardTrials.map(t => t.filter(Boolean).length),
        backwardTrials: backwardTrials.map(t => t.filter(Boolean).length)
    };
};

export const calculateNBackResult = (
    level: 1 | 2,
    responses: { isTarget: boolean; userResponse: boolean }[]
): NBackResult => {
    let hits = 0;
    let misses = 0;
    let falseAlarms = 0;
    let correctRejections = 0;

    responses.forEach(r => {
        if (r.isTarget && r.userResponse) hits++;
        else if (r.isTarget && !r.userResponse) misses++;
        else if (!r.isTarget && r.userResponse) falseAlarms++;
        else correctRejections++;
    });

    const accuracy = Math.round(((hits + correctRejections) / responses.length) * 100);

    // d' (d-prime) 계산 - 신호 탐지 이론
    const hitRate = Math.min(0.99, Math.max(0.01, hits / (hits + misses || 1)));
    const faRate = Math.min(0.99, Math.max(0.01, falseAlarms / (falseAlarms + correctRejections || 1)));

    // Z-score 근사 (정규분포 역함수)
    const zHit = Math.sqrt(2) * inverseErf(2 * hitRate - 1);
    const zFa = Math.sqrt(2) * inverseErf(2 * faRate - 1);
    const dPrime = Math.round((zHit - zFa) * 100) / 100;

    return {
        level,
        hits,
        misses,
        falseAlarms,
        correctRejections,
        accuracy,
        dPrime: isNaN(dPrime) ? 0 : dPrime
    };
};

// 오류 함수 역함수 근사
function inverseErf(x: number): number {
    const a = 0.147;
    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);

    const ln = Math.log(1 - x * x);
    const t1 = 2 / (Math.PI * a) + ln / 2;
    const t2 = ln / a;

    return sign * Math.sqrt(Math.sqrt(t1 * t1 - t2) - t1);
}

// 종합 레벨 판정
export const calculateOverallLevel = (result: WorkingMemoryResult): {
    level: 'low' | 'below_average' | 'average' | 'above_average' | 'high';
    score: number;
} => {
    let score = 0;
    let count = 0;

    // Digit Span 점수 (0-50점)
    if (result.digitSpan) {
        const dsScore = Math.min(50, (result.digitSpan.totalSpan - 4) * 7); // 4+4=8이 기준점
        score += Math.max(0, dsScore);
        count++;
    }

    // N-Back 점수 (0-50점)
    if (result.nBack1 || result.nBack2) {
        const n1Score = result.nBack1 ? result.nBack1.accuracy * 0.3 : 0;
        const n2Score = result.nBack2 ? result.nBack2.accuracy * 0.5 : 0;
        score += n1Score + n2Score;
        count++;
    }

    const finalScore = count > 0 ? Math.round(score / count * 2) : 0;

    let level: 'low' | 'below_average' | 'average' | 'above_average' | 'high';
    if (finalScore < 30) level = 'low';
    else if (finalScore < 45) level = 'below_average';
    else if (finalScore < 60) level = 'average';
    else if (finalScore < 75) level = 'above_average';
    else level = 'high';

    return { level, score: finalScore };
};

// ========== 5. 결과 해석 및 설명 ==========
export const WORKING_MEMORY_DESCRIPTIONS: Record<
    'low' | 'below_average' | 'average' | 'above_average' | 'high',
    {
        label: string;
        description: string;
        studyAdvice: string[];
        strengths: string[];
        challenges: string[];
    }
> = {
    low: {
        label: '작업 기억 용량 제한적',
        description: '한 번에 처리할 수 있는 정보량이 제한적입니다. 복잡한 문제나 멀티태스킹 시 인지 과부하가 발생할 수 있습니다.',
        studyAdvice: [
            '개념을 최대한 단순하게 쪼개서 학습하세요',
            '한 번에 하나의 과제에만 집중하세요',
            '노트에 핵심만 적어가며 기억 부담을 줄이세요',
            '복잡한 수학 문제는 단계별로 풀이를 적으며 진행하세요',
            '뽀모도로 기법 (15분 집중) 활용을 권장합니다'
        ],
        strengths: ['깊이 있는 단일 작업 집중력', '체계적 학습 습관 형성 가능'],
        challenges: ['복합 문제 해결', '동시 다중 작업', '긴 지문 이해']
    },
    below_average: {
        label: '작업 기억 용량 평균 이하',
        description: '기본적인 정보 처리는 가능하나, 복잡한 과제에서 어려움을 겪을 수 있습니다.',
        studyAdvice: [
            '복잡한 개념은 도식화하여 시각적으로 정리하세요',
            '공부할 때 중간중간 요약 정리 시간을 가지세요',
            '장문 독해 시 단락별로 핵심을 메모하세요',
            '수학 풀이 시 중간 과정을 꼭 적어두세요',
            '약간 복잡한 문제도 단계 분해 후 접근하세요'
        ],
        strengths: ['일반적인 학습 과제 수행', '반복 학습 효과'],
        challenges: ['복잡한 수학 문제 암산', '긴 영어 문장 구조 파악']
    },
    average: {
        label: '작업 기억 용량 평균',
        description: '일반적인 학습 과제를 무리 없이 수행할 수 있는 수준입니다.',
        studyAdvice: [
            '현재 학습 방식을 유지하되, 도전적 과제도 시도해보세요',
            '복잡한 문제 해결 시 구조화 습관을 기르세요',
            '시간 압박 상황에서의 연습도 병행하세요',
            '암산 능력 향상을 위한 훈련을 추가하세요'
        ],
        strengths: ['균형 잡힌 정보 처리', '적응력 있는 학습'],
        challenges: ['고난도 복합 문제에서 실수 가능성']
    },
    above_average: {
        label: '작업 기억 용량 우수',
        description: '복잡한 정보도 효과적으로 처리할 수 있습니다. 멀티태스킹에도 강점이 있습니다.',
        studyAdvice: [
            '고난도 문제에 적극적으로 도전하세요',
            '창의적 문제 해결력을 키우세요',
            '시간 제한 연습으로 효율을 극대화하세요',
            '다른 학생을 가르치며 메타인지를 강화하세요'
        ],
        strengths: ['복합 문제 해결', '효율적 정보 통합', '빠른 패턴 인식'],
        challenges: ['과신으로 인한 실수', '지나친 암기 의존']
    },
    high: {
        label: '작업 기억 용량 탁월',
        description: '뛰어난 정보 처리 능력을 갖추고 있습니다. 복잡한 추론과 동시 다중 작업에서 강점을 발휘합니다.',
        studyAdvice: [
            '최고난도 문제와 심화 학습에 집중하세요',
            '빠른 문제 풀이보다 정확성 점검에 시간을 투자하세요',
            '습득 속도에 맞춰 학습량을 조절하세요',
            '창의적, 융합적 과제에 도전하세요'
        ],
        strengths: ['탁월한 문제 해결력', '빠른 학습 속도', '복잡한 추론'],
        challenges: ['과신, 단순 암기 과제에서의 지루함']
    }
};

// ========== 6. CareType별 권장사항 ==========
export const CARETYPE_WORKING_MEMORY_RECOMMENDATIONS: Record<CareType, {
    priority: ('digitSpan' | 'nBack1' | 'nBack2')[];
    reason: string;
    specialAdvice: string;
}> = {
    [CareType.BURNOUT]: {
        priority: ['digitSpan'],
        reason: '번아웃 상태에서는 복잡한 N-Back보다 기본 용량 측정이 적합합니다.',
        specialAdvice: '피로로 인한 일시적 저하일 수 있으니 충분한 휴식 후 재검사를 권장합니다.'
    },
    [CareType.ANXIETY_TENSION]: {
        priority: ['digitSpan', 'nBack1'],
        reason: '불안이 작업 기억에 미치는 영향을 파악합니다.',
        specialAdvice: '시험 불안과 연계하여 해석하세요. 불안이 높으면 실제 능력보다 낮게 측정될 수 있습니다.'
    },
    [CareType.STRESS_OVERLOAD]: {
        priority: ['digitSpan'],
        reason: '스트레스가 인지 기능에 미치는 영향을 확인합니다.',
        specialAdvice: '스트레스 관리 후 재측정하면 개선 가능성이 있습니다.'
    },
    [CareType.SLEEP]: {
        priority: ['digitSpan', 'nBack1'],
        reason: '수면 부족은 작업 기억에 직접적 영향을 미칩니다.',
        specialAdvice: '충분한 수면 후 재검사 시 20-30% 향상 가능합니다.'
    },
    [CareType.LOW_ENERGY]: {
        priority: ['digitSpan'],
        reason: '저에너지 상태에서 기본 인지 용량을 측정합니다.',
        specialAdvice: '에너지 수준 회복 후 N-Back까지 진행하세요.'
    },
    [CareType.DEPRESSION_AMOTIVATION]: {
        priority: ['digitSpan'],
        reason: '우울/무동기 상태에서의 인지 기능을 파악합니다.',
        specialAdvice: '동기 부여와 함께 작은 성공 경험이 중요합니다.'
    },
    [CareType.BRAIN_FATIGUE]: {
        priority: ['digitSpan', 'nBack1', 'nBack2'],
        reason: '뇌피로 상태에서 전체 작업 기억 용량 평가가 필요합니다.',
        specialAdvice: '휴식 패턴과 연계하여 최적 학습 시간을 찾으세요.'
    },
    [CareType.HYPERSENSITIVE]: {
        priority: ['digitSpan', 'nBack1'],
        reason: '과민성이 집중력과 기억에 미치는 영향을 확인합니다.',
        specialAdvice: '조용한 환경에서 테스트하는 것이 중요합니다.'
    },
    [CareType.ATTENTION_DEFICIT]: {
        priority: ['nBack1', 'nBack2', 'digitSpan'],
        reason: '주의력 산만형은 N-Back이 핵심 측정 지표입니다.',
        specialAdvice: 'N-Back 결과가 낮다면 주의력 훈련 프로그램을 권장합니다.'
    },
    [CareType.CIRCULATION]: {
        priority: ['digitSpan', 'nBack1'],
        reason: '순환 저하가 인지 기능에 미치는 영향을 확인합니다.',
        specialAdvice: '가벼운 운동 후 재측정하면 개선될 수 있습니다.'
    },
    [CareType.HEALTHY]: {
        priority: ['digitSpan', 'nBack1', 'nBack2'],
        reason: '건강한 상태에서 전체 작업 기억 프로필을 파악합니다.',
        specialAdvice: '결과를 기반으로 학습 전략을 최적화하세요.'
    },
    [CareType.ADRENAL]: {
        priority: ['digitSpan'],
        reason: '부신피로 상태에서 기본 인지 용량을 측정합니다.',
        specialAdvice: '에너지 리듬에 맞춰 검사 시간을 선택하세요.'
    },
    [CareType.CONCENTRATION]: {
        priority: ['nBack1', 'nBack2'],
        reason: '집중력 저하형은 N-Back으로 정밀 측정합니다.',
        specialAdvice: 'N-Back 훈련이 집중력 향상에 도움이 됩니다.'
    },
    [CareType.UNASSESSED]: {
        priority: ['digitSpan', 'nBack1'],
        reason: '기본 프로필 파악을 위한 표준 검사입니다.',
        specialAdvice: '전체 진단 후 추가 검사 여부를 결정하세요.'
    }
};

// ========== 7. 테스트 정보 ==========
export type WorkingMemoryTestType = 'digitSpan' | 'nBack1' | 'nBack2';

export const WORKING_MEMORY_TEST_INFO: Record<WorkingMemoryTestType, {
    title: string;
    description: string;
    icon: string;
    time: string;
    difficulty: '쉬움' | '보통' | '어려움';
}> = {
    digitSpan: {
        title: '숫자 따라하기 (Digit Span)',
        description: '화면에 나타나는 숫자를 순서대로, 또는 거꾸로 기억해서 입력합니다.',
        icon: '🔢',
        time: '약 3분',
        difficulty: '쉬움'
    },
    nBack1: {
        title: '1-Back 테스트',
        description: '연속으로 나타나는 문자 중 직전 문자와 같으면 버튼을 누릅니다.',
        icon: '1️⃣',
        time: '약 2분',
        difficulty: '보통'
    },
    nBack2: {
        title: '2-Back 테스트',
        description: '연속으로 나타나는 문자 중 2개 전 문자와 같으면 버튼을 누릅니다.',
        icon: '2️⃣',
        time: '약 3분',
        difficulty: '어려움'
    }
};
