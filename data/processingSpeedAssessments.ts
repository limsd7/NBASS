/**
 * 문해력/처리 속도 테스트 (Processing Speed & Literacy Test)
 * 
 * 목적: 정보 습득의 '엔진 출력' 확인
 * 방식: 제한 시간 내 글을 읽고, 이해한 내용을 O/X로 체크
 * 
 * 이유: HRV(체력)가 좋아도 정보를 뇌에 넣는 속도가 느리면 효율은 0.
 *       많은 학생들이 '난독' 때문에 집중을 못 하는데, 이를 '집중력 부족'으로 착각함.
 */

import { CareType } from '../types';

// ========== 1. 읽기 지문 정의 ==========
export interface ReadingPassage {
    id: string;
    title: string;
    content: string;
    wordCount: number;
    difficulty: 'easy' | 'medium' | 'hard';
    category: 'science' | 'social' | 'humanities' | 'general';
    questions: ComprehensionQuestion[];
    expectedReadTimeSeconds: number;  // 평균 독자 기준 예상 시간
}

export interface ComprehensionQuestion {
    id: string;
    question: string;
    answer: boolean;  // true = O, false = X
    explanation: string;
}

// 테스트용 지문들 (다양한 난이도와 주제)
export const READING_PASSAGES: ReadingPassage[] = [
    {
        id: 'passage_1',
        title: '광합성의 원리',
        content: `광합성은 식물이 빛 에너지를 화학 에너지로 전환하는 과정입니다. 식물의 잎에 있는 엽록체에서 이루어지며, 이산화탄소와 물을 원료로 사용합니다. 이 과정에서 포도당이 만들어지고, 부산물로 산소가 방출됩니다. 광합성은 크게 명반응과 암반응으로 나뉩니다. 명반응은 빛이 있어야 일어나며, 암반응은 빛 없이도 진행될 수 있습니다. 광합성 덕분에 지구의 대기에는 산소가 풍부해졌고, 이는 대부분의 생물이 호흡할 수 있게 해주었습니다.`,
        wordCount: 120,
        difficulty: 'easy',
        category: 'science',
        expectedReadTimeSeconds: 30,
        questions: [
            { id: 'q1_1', question: '광합성은 식물의 뿌리에서 일어난다.', answer: false, explanation: '광합성은 잎의 엽록체에서 일어납니다.' },
            { id: 'q1_2', question: '광합성의 부산물로 산소가 방출된다.', answer: true, explanation: '광합성 과정에서 산소가 부산물로 발생합니다.' },
            { id: 'q1_3', question: '암반응은 반드시 빛이 있어야 일어난다.', answer: false, explanation: '암반응은 빛 없이도 진행될 수 있습니다.' },
            { id: 'q1_4', question: '광합성에는 이산화탄소와 물이 필요하다.', answer: true, explanation: '지문에서 이산화탄소와 물을 원료로 사용한다고 명시되어 있습니다.' }
        ]
    },
    {
        id: 'passage_2',
        title: '산업 혁명의 영향',
        content: `18세기 후반 영국에서 시작된 산업 혁명은 인류 역사의 큰 전환점이었습니다. 증기 기관의 발명으로 공장제 기계 공업이 발달하면서, 농업 중심 사회에서 공업 중심 사회로 변화했습니다. 이로 인해 도시화가 급격히 진행되었고, 많은 농민들이 일자리를 찾아 도시로 이주했습니다. 그러나 빠른 산업화는 환경 오염, 아동 노동 착취, 열악한 노동 조건 등의 사회 문제도 함께 가져왔습니다. 현대 자본주의 경제 체제의 기초도 이 시기에 형성되었습니다.`,
        wordCount: 130,
        difficulty: 'medium',
        category: 'social',
        expectedReadTimeSeconds: 35,
        questions: [
            { id: 'q2_1', question: '산업 혁명은 19세기 후반 미국에서 시작되었다.', answer: false, explanation: '산업 혁명은 18세기 후반 영국에서 시작되었습니다.' },
            { id: 'q2_2', question: '증기 기관의 발명이 산업 혁명에 기여했다.', answer: true, explanation: '지문에서 증기 기관의 발명이 언급됩니다.' },
            { id: 'q2_3', question: '산업 혁명으로 도시 인구가 증가했다.', answer: true, explanation: '도시화가 진행되고 농민들이 도시로 이주했다고 합니다.' },
            { id: 'q2_4', question: '산업 혁명 시기에는 환경 문제가 없었다.', answer: false, explanation: '환경 오염 등의 사회 문제가 발생했다고 합니다.' }
        ]
    },
    {
        id: 'passage_3',
        title: '인간의 수면 주기',
        content: `수면은 REM 수면과 비REM 수면으로 구분됩니다. 비REM 수면은 다시 1단계부터 4단계까지 나뉘며, 3-4단계가 가장 깊은 수면입니다. REM 수면 동안에는 뇌가 활발히 활동하며 꿈을 꾸게 됩니다. 성인은 보통 90분 주기로 REM과 비REM 수면을 반복합니다. 깊은 수면(비REM 3-4단계)은 신체 회복에, REM 수면은 기억 정리와 감정 처리에 중요합니다. 수면 부족은 집중력 저하, 면역력 약화, 정서 불안정을 초래할 수 있습니다.`,
        wordCount: 125,
        difficulty: 'medium',
        category: 'science',
        expectedReadTimeSeconds: 35,
        questions: [
            { id: 'q3_1', question: '비REM 수면은 2단계로 나뉜다.', answer: false, explanation: '비REM 수면은 1단계부터 4단계까지 나뉩니다.' },
            { id: 'q3_2', question: 'REM 수면 중에 꿈을 꾼다.', answer: true, explanation: 'REM 수면 동안 뇌가 활발히 활동하며 꿈을 꿉니다.' },
            { id: 'q3_3', question: '성인의 수면 주기는 약 90분이다.', answer: true, explanation: '성인은 보통 90분 주기로 수면을 반복합니다.' },
            { id: 'q3_4', question: '깊은 수면은 기억 정리에 중요하다.', answer: false, explanation: '깊은 수면은 신체 회복에, REM 수면이 기억 정리에 중요합니다.' }
        ]
    },
    {
        id: 'passage_4',
        title: '조선의 과거 제도',
        content: `조선 시대의 과거 제도는 관리를 선발하는 핵심 시스템이었습니다. 과거는 크게 문과, 무과, 잡과로 나뉘었으며, 가장 중요시된 것은 문과였습니다. 문과 시험은 소과와 대과로 구분되었고, 대과에 합격해야 고위 관직에 오를 수 있었습니다. 양반 자제들은 주로 문과를 준비했고, 서원과 향교에서 유학을 공부했습니다. 과거 시험을 통해 신분 상승이 가능했지만, 실제로는 양반 계층이 붕당 정치를 통해 권력을 독점하는 경우가 많았습니다.`,
        wordCount: 140,
        difficulty: 'hard',
        category: 'humanities',
        expectedReadTimeSeconds: 40,
        questions: [
            { id: 'q4_1', question: '조선의 과거에서 무과가 가장 중요시되었다.', answer: false, explanation: '가장 중요시된 것은 문과였습니다.' },
            { id: 'q4_2', question: '대과에 합격해야 고위 관직에 오를 수 있었다.', answer: true, explanation: '지문에 명시되어 있습니다.' },
            { id: 'q4_3', question: '과거 제도를 통한 신분 상승이 가능했다.', answer: true, explanation: '과거 시험을 통해 신분 상승이 가능했다고 합니다.' },
            { id: 'q4_4', question: '양반 자제들은 주로 향교에서 무술을 배웠다.', answer: false, explanation: '양반 자제들은 서원과 향교에서 유학을 공부했습니다.' }
        ]
    },
    {
        id: 'passage_5',
        title: '블랙홀의 특성',
        content: `블랙홀은 중력이 극도로 강해 빛조차 빠져나올 수 없는 천체입니다. 사건의 지평선은 블랙홀의 경계로, 이 지점을 넘어가면 어떤 것도 탈출할 수 없습니다. 블랙홀은 질량이 큰 별이 초신성 폭발 후 남은 핵이 붕괴하면서 형성됩니다. 블랙홀 주변의 물질은 강착원반을 형성하며 블랙홀로 빨려 들어갑니다. 최근 천문학자들은 처음으로 블랙홀의 실제 이미지를 촬영하는 데 성공하여, 블랙홀의 존재를 직접 확인했습니다. 블랙홀은 시공간을 왜곡시킵니다.`,
        wordCount: 135,
        difficulty: 'hard',
        category: 'science',
        expectedReadTimeSeconds: 40,
        questions: [
            { id: 'q5_1', question: '빛은 블랙홀에서 빠져나올 수 있다.', answer: false, explanation: '빛조차 빠져나올 수 없다고 합니다.' },
            { id: 'q5_2', question: '사건의 지평선은 블랙홀의 경계이다.', answer: true, explanation: '지문에 명시되어 있습니다.' },
            { id: 'q5_3', question: '블랙홀은 작은 별에서 형성된다.', answer: false, explanation: '질량이 큰 별이 초신성 폭발 후 형성됩니다.' },
            { id: 'q5_4', question: '블랙홀의 실제 이미지가 촬영된 적이 있다.', answer: true, explanation: '최근 처음으로 블랙홀의 실제 이미지를 촬영했다고 합니다.' }
        ]
    }
];

// ========== 2. 결과 타입 정의 ==========
export interface ProcessingSpeedResult {
    passageId: string;
    passageTitle: string;
    difficulty: 'easy' | 'medium' | 'hard';

    // 읽기 시간
    readingTimeSeconds: number;
    expectedTimeSeconds: number;
    wordsPerMinute: number;

    // 이해도
    totalQuestions: number;
    correctAnswers: number;
    accuracy: number;  // 0-100

    // 각 문항별 결과
    questionResults: {
        questionId: string;
        question: string;
        userAnswer: boolean;
        correctAnswer: boolean;
        isCorrect: boolean;
    }[];
}

export interface ProcessingSpeedOverallResult {
    passages: ProcessingSpeedResult[];

    // 전체 지표
    totalPassages: number;
    averageWPM: number;              // 평균 분당 단어 수
    averageAccuracy: number;         // 평균 이해도
    speedEfficiencyRatio: number;    // 속도 대비 정확도 비율

    // 난이도별 분석
    easyPerformance?: { wpm: number; accuracy: number };
    mediumPerformance?: { wpm: number; accuracy: number };
    hardPerformance?: { wpm: number; accuracy: number };

    // 판정 결과
    readingLevel: 'slow' | 'below_average' | 'average' | 'above_average' | 'fast';
    comprehensionLevel: 'low' | 'below_average' | 'average' | 'above_average' | 'high';
    overallLevel: 'needs_support' | 'developing' | 'proficient' | 'advanced';

    // 난독 가능성 플래그
    possibleDyslexiaIndicators: string[];

    completedAt: string;
}

// ========== 3. 결과 계산 함수 ==========
export const calculateProcessingSpeedResult = (
    passage: ReadingPassage,
    readingTimeSeconds: number,
    userAnswers: boolean[]
): ProcessingSpeedResult => {
    const wordsPerMinute = Math.round((passage.wordCount / readingTimeSeconds) * 60);

    const questionResults = passage.questions.map((q, i) => ({
        questionId: q.id,
        question: q.question,
        userAnswer: userAnswers[i],
        correctAnswer: q.answer,
        isCorrect: userAnswers[i] === q.answer
    }));

    const correctAnswers = questionResults.filter(r => r.isCorrect).length;
    const accuracy = Math.round((correctAnswers / passage.questions.length) * 100);

    return {
        passageId: passage.id,
        passageTitle: passage.title,
        difficulty: passage.difficulty,
        readingTimeSeconds,
        expectedTimeSeconds: passage.expectedReadTimeSeconds,
        wordsPerMinute,
        totalQuestions: passage.questions.length,
        correctAnswers,
        accuracy,
        questionResults
    };
};

export const calculateOverallProcessingSpeed = (
    results: ProcessingSpeedResult[]
): ProcessingSpeedOverallResult => {
    if (results.length === 0) {
        return {
            passages: [],
            totalPassages: 0,
            averageWPM: 0,
            averageAccuracy: 0,
            speedEfficiencyRatio: 0,
            readingLevel: 'slow',
            comprehensionLevel: 'low',
            overallLevel: 'needs_support',
            possibleDyslexiaIndicators: [],
            completedAt: new Date().toISOString()
        };
    }

    // 평균 계산
    const avgWPM = Math.round(results.reduce((sum, r) => sum + r.wordsPerMinute, 0) / results.length);
    const avgAccuracy = Math.round(results.reduce((sum, r) => sum + r.accuracy, 0) / results.length);

    // 난이도별 분석
    const byDifficulty = (diff: 'easy' | 'medium' | 'hard') => {
        const filtered = results.filter(r => r.difficulty === diff);
        if (filtered.length === 0) return undefined;
        return {
            wpm: Math.round(filtered.reduce((sum, r) => sum + r.wordsPerMinute, 0) / filtered.length),
            accuracy: Math.round(filtered.reduce((sum, r) => sum + r.accuracy, 0) / filtered.length)
        };
    };

    // 레벨 판정 - 읽기 속도 (한국어 평균 약 200-250 WPM)
    let readingLevel: 'slow' | 'below_average' | 'average' | 'above_average' | 'fast';
    if (avgWPM < 150) readingLevel = 'slow';
    else if (avgWPM < 200) readingLevel = 'below_average';
    else if (avgWPM < 280) readingLevel = 'average';
    else if (avgWPM < 350) readingLevel = 'above_average';
    else readingLevel = 'fast';

    // 레벨 판정 - 이해도
    let comprehensionLevel: 'low' | 'below_average' | 'average' | 'above_average' | 'high';
    if (avgAccuracy < 50) comprehensionLevel = 'low';
    else if (avgAccuracy < 65) comprehensionLevel = 'below_average';
    else if (avgAccuracy < 80) comprehensionLevel = 'average';
    else if (avgAccuracy < 90) comprehensionLevel = 'above_average';
    else comprehensionLevel = 'high';

    // 종합 레벨
    const speedScore = ['slow', 'below_average', 'average', 'above_average', 'fast'].indexOf(readingLevel);
    const compScore = ['low', 'below_average', 'average', 'above_average', 'high'].indexOf(comprehensionLevel);
    const combinedScore = (speedScore + compScore) / 2;

    let overallLevel: 'needs_support' | 'developing' | 'proficient' | 'advanced';
    if (combinedScore < 1.5) overallLevel = 'needs_support';
    else if (combinedScore < 2.5) overallLevel = 'developing';
    else if (combinedScore < 3.5) overallLevel = 'proficient';
    else overallLevel = 'advanced';

    // 속도 효율 비율 (속도가 빠르면서 정확도도 높은지)
    const speedEfficiencyRatio = Math.round((avgAccuracy / 100) * (avgWPM / 250) * 100);

    // 난독 가능성 지표 (참고용)
    const possibleDyslexiaIndicators: string[] = [];
    if (avgWPM < 120 && avgAccuracy < 60) {
        possibleDyslexiaIndicators.push('읽기 속도와 이해도가 모두 낮음');
    }
    if (results.some(r => r.readingTimeSeconds > r.expectedTimeSeconds * 2)) {
        possibleDyslexiaIndicators.push('예상 시간의 2배 이상 소요된 지문 있음');
    }
    const easyPerf = byDifficulty('easy');
    if (easyPerf && easyPerf.wpm < 150) {
        possibleDyslexiaIndicators.push('쉬운 지문에서도 읽기 속도 저하');
    }

    return {
        passages: results,
        totalPassages: results.length,
        averageWPM: avgWPM,
        averageAccuracy: avgAccuracy,
        speedEfficiencyRatio,
        easyPerformance: byDifficulty('easy'),
        mediumPerformance: byDifficulty('medium'),
        hardPerformance: byDifficulty('hard'),
        readingLevel,
        comprehensionLevel,
        overallLevel,
        possibleDyslexiaIndicators,
        completedAt: new Date().toISOString()
    };
};

// ========== 4. 결과 해석 및 설명 ==========
export const PROCESSING_SPEED_DESCRIPTIONS: Record<
    'needs_support' | 'developing' | 'proficient' | 'advanced',
    {
        label: string;
        description: string;
        studyAdvice: string[];
        readingTips: string[];
    }
> = {
    needs_support: {
        label: '읽기 지원 필요',
        description: '읽기 속도나 이해력에서 어려움을 보입니다. 전문적인 읽기 훈련이나 추가 지원이 도움이 될 수 있습니다.',
        studyAdvice: [
            '한 문장씩 끊어 읽기 연습',
            '소리 내어 읽기로 집중력 유지',
            '핵심 단어에 밑줄 치며 읽기',
            '읽은 후 짧게 요약하는 습관',
            '하루 15분 규칙적인 독서 연습'
        ],
        readingTips: [
            '조용한 환경에서 집중하여 읽기',
            '손가락으로 라인 따라가기',
            '모르는 단어는 일단 넘어가기',
            '짧은 글부터 시작하기'
        ]
    },
    developing: {
        label: '발전 중',
        description: '기본적인 읽기 능력은 있으나, 속도나 이해력 향상의 여지가 있습니다.',
        studyAdvice: [
            '속독과 정독 균형 잡기',
            '문단별 핵심 내용 파악 훈련',
            '다양한 장르의 글 읽기',
            '읽은 내용 정리 노트 작성',
            '시간 제한 두고 읽기 연습'
        ],
        readingTips: [
            '눈으로 한 번에 여러 단어 읽기',
            '되읽기 줄이기',
            '핵심 문장 빠르게 찾기'
        ]
    },
    proficient: {
        label: '숙련됨',
        description: '읽기 속도와 이해력이 균형 잡혀 있습니다. 효율적인 정보 습득이 가능합니다.',
        studyAdvice: [
            '어려운 글로 도전 난이도 높이기',
            '비판적 읽기 연습',
            '빠른 스캐닝 기술 익히기',
            '다국어 읽기 도전'
        ],
        readingTips: [
            '목적에 맞게 읽기 속도 조절',
            '키워드 중심 빠른 파악',
            '논리 구조 분석하며 읽기'
        ]
    },
    advanced: {
        label: '우수함',
        description: '뛰어난 읽기 능력을 보입니다. 빠른 속도로 읽으면서도 높은 이해도를 유지합니다.',
        studyAdvice: [
            '속독 기법 심화 학습',
            '복잡한 학술 자료 도전',
            '읽기 능력을 활용한 학습 극대화',
            '다른 학생 멘토링'
        ],
        readingTips: [
            '포토리딩 기법 도전',
            '다층적 읽기 전략 활용',
            '정보 통합 능력 강화'
        ]
    }
};

// ========== 5. CareType별 권장사항 ==========
export const CARETYPE_PROCESSING_RECOMMENDATIONS: Record<CareType, {
    expectedPattern: string;
    specialAdvice: string;
    readingIntegration: string;
}> = {
    [CareType.BURNOUT]: {
        expectedPattern: '번아웃 상태에서는 읽기 속도와 집중력이 저하될 수 있습니다.',
        specialAdvice: '에너지가 가장 높은 시간대에 독서를 배치하세요.',
        readingIntegration: '휴식 후 짧은 글부터 시작하여 점진적으로 늘려가세요.'
    },
    [CareType.ANXIETY_TENSION]: {
        expectedPattern: '불안 상태에서는 같은 문장을 여러 번 읽게 될 수 있습니다.',
        specialAdvice: '호흡 조절 후 읽기 시작하면 이해도가 높아집니다.',
        readingIntegration: '차분한 마음으로 천천히 읽는 연습이 효과적입니다.'
    },
    [CareType.STRESS_OVERLOAD]: {
        expectedPattern: '스트레스가 높으면 집중력 저하로 읽기 효율이 떨어집니다.',
        specialAdvice: '스트레스 해소 활동 후 독서 세션을 가지세요.',
        readingIntegration: '가벼운 읽을거리로 시작하여 점차 난이도를 높이세요.'
    },
    [CareType.SLEEP]: {
        expectedPattern: '수면 부족은 읽기 속도와 이해력에 직접 영향을 미칩니다.',
        specialAdvice: '충분한 수면 후 테스트하면 20-30% 향상됩니다.',
        readingIntegration: '졸린 상태에서 읽기보다 짧은 휴식 후 읽기가 효과적입니다.'
    },
    [CareType.LOW_ENERGY]: {
        expectedPattern: '저에너지 상태에서는 읽기가 더 힘들게 느껴집니다.',
        specialAdvice: '에너지가 높은 골든타임에 중요한 읽기 자료를 배치하세요.',
        readingIntegration: '짧은 글을 자주 읽는 것이 긴 글을 한 번에 읽는 것보다 효과적입니다.'
    },
    [CareType.DEPRESSION_AMOTIVATION]: {
        expectedPattern: '무동기 상태에서는 읽기에 대한 흥미가 저하됩니다.',
        specialAdvice: '관심 있는 주제의 짧은 글부터 시작하세요.',
        readingIntegration: '읽기 완료 후 작은 보상을 설정하면 동기가 높아집니다.'
    },
    [CareType.BRAIN_FATIGUE]: {
        expectedPattern: '뇌피로 상태에서는 정보 처리 속도가 현저히 저하됩니다.',
        specialAdvice: '뇌 휴식 후 읽기 테스트를 하세요.',
        readingIntegration: '15분 읽기 + 5분 휴식 패턴을 유지하세요.'
    },
    [CareType.HYPERSENSITIVE]: {
        expectedPattern: '과민성이 높으면 주변 자극에 의해 읽기가 자주 중단됩니다.',
        specialAdvice: '조용한 환경에서 테스트하는 것이 중요합니다.',
        readingIntegration: '노이즈 캔슬링이나 백색소음이 도움이 됩니다.'
    },
    [CareType.ATTENTION_DEFICIT]: {
        expectedPattern: '주의력 문제가 읽기 중 집중 유지를 어렵게 합니다.',
        specialAdvice: '이 결과와 주의력 훈련을 함께 분석하세요.',
        readingIntegration: '짧은 문단별로 끊어 읽고, 포인팅 기법을 사용하세요.'
    },
    [CareType.CIRCULATION]: {
        expectedPattern: '순환 저하가 뇌로의 산소 공급에 영향을 줄 수 있습니다.',
        specialAdvice: '가벼운 스트레칭 후 읽기 세션을 시작하세요.',
        readingIntegration: '중간중간 스트레칭으로 혈액 순환을 개선하세요.'
    },
    [CareType.HEALTHY]: {
        expectedPattern: '최적의 상태에서 기준선을 측정합니다.',
        specialAdvice: '이 결과를 기준으로 학습 전략을 수립하세요.',
        readingIntegration: '다양한 난이도의 자료로 읽기 능력을 지속 발전시키세요.'
    },
    [CareType.ADRENAL]: {
        expectedPattern: '에너지 리듬에 따라 읽기 효율이 크게 변할 수 있습니다.',
        specialAdvice: '하루 중 에너지가 높은 시간에 테스트하세요.',
        readingIntegration: '골든타임에 중요한 읽기 자료를 배치하세요.'
    },
    [CareType.CONCENTRATION]: {
        expectedPattern: '집중력 저하가 읽기 효율에 직접 영향을 미칩니다.',
        specialAdvice: '집중력 훈련과 읽기 훈련을 병행하세요.',
        readingIntegration: '타이머를 활용한 집중 읽기 훈련이 효과적입니다.'
    },
    [CareType.UNASSESSED]: {
        expectedPattern: '기초 읽기 능력 파악용 테스트입니다.',
        specialAdvice: '전체 진단 결과와 종합하여 해석하세요.',
        readingIntegration: '결과에 따라 맞춤형 읽기 훈련을 설계하세요.'
    }
};

// ========== 6. 테스트 설정 ==========
export const PROCESSING_SPEED_CONFIG = {
    minPassages: 2,              // 최소 지문 수
    maxPassages: 3,              // 최대 지문 수
    showTimer: true,             // 타이머 표시
    allowSkip: false,            // 지문 건너뛰기 허용
    shufflePassages: true,       // 지문 순서 랜덤화
    shuffleQuestions: false      // 질문 순서 유지 (지문 순서대로)
};
