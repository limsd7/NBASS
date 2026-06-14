/**
 * 공부 효율성 극대화를 위한 5가지 정밀 검사
 * - 크로노타입(MEQ): 아침형/저녁형 판별
 * - 학습 감각 유형(VARK): Visual/Auditory/Read-Write/Kinesthetic
 * - 시험 불안(TAI): 인지적 걱정 vs 신체적 긴장
 * - 디지털 중독: 스마트폰/숏폼 의존도
 * - 메타인지(MSLQ): 학습 전략 (시연/정교화/조직화)
 */

import { CareType } from '../types';

// ========== 1. 크로노타입 검사 (MEQ - Morningness-Eveningness Questionnaire) ==========
export interface ChronotypeQuestion {
    id: string;
    question: string;
    options: { text: string; score: number }[];
}

export const CHRONOTYPE_QUESTIONS: ChronotypeQuestion[] = [
    {
        id: 'meq_1',
        question: '아무 약속이 없다면 아침 몇 시에 일어나고 싶습니까?',
        options: [
            { text: '오전 5:00~6:30', score: 5 },
            { text: '오전 6:30~7:45', score: 4 },
            { text: '오전 7:45~9:45', score: 3 },
            { text: '오전 9:45~11:00', score: 2 },
            { text: '오전 11:00 이후', score: 1 }
        ]
    },
    {
        id: 'meq_2',
        question: '아무 약속이 없다면 밤 몇 시에 자고 싶습니까?',
        options: [
            { text: '오후 8:00~9:00', score: 5 },
            { text: '오후 9:00~10:15', score: 4 },
            { text: '오후 10:15~12:30', score: 3 },
            { text: '오전 12:30~1:45', score: 2 },
            { text: '오전 1:45 이후', score: 1 }
        ]
    },
    {
        id: 'meq_3',
        question: '아침에 일어날 때 알람이 얼마나 필요합니까?',
        options: [
            { text: '알람 없이도 잘 일어남', score: 4 },
            { text: '알람 1개면 충분', score: 3 },
            { text: '알람 2~3개 필요', score: 2 },
            { text: '알람 여러 개에도 일어나기 힘듦', score: 1 }
        ]
    },
    {
        id: 'meq_4',
        question: '오전 중 정신이 가장 맑다고 느끼는 시간은?',
        options: [
            { text: '기상 직후', score: 4 },
            { text: '기상 후 30분~1시간', score: 3 },
            { text: '기상 후 1~2시간', score: 2 },
            { text: '점심 무렵이 되어야 맑아짐', score: 1 }
        ]
    },
    {
        id: 'meq_5',
        question: '가장 집중이 잘 되는 시간대는?',
        options: [
            { text: '오전 8시~12시', score: 5 },
            { text: '오후 12시~4시', score: 3 },
            { text: '오후 4시~8시', score: 2 },
            { text: '오후 8시 이후', score: 1 }
        ]
    },
    {
        id: 'meq_6',
        question: '저녁 시간에 피로를 느끼기 시작하는 때는?',
        options: [
            { text: '오후 8시 이전', score: 5 },
            { text: '오후 8시~9시', score: 4 },
            { text: '오후 9시~10시15분', score: 3 },
            { text: '오후 10시15분~11시45분', score: 2 },
            { text: '오전 12시 이후', score: 1 }
        ]
    },
    {
        id: 'meq_7',
        question: '중요한 시험을 치러야 한다면 언제가 좋겠습니까?',
        options: [
            { text: '오전 8시~10시', score: 5 },
            { text: '오전 11시~오후 1시', score: 3 },
            { text: '오후 3시~5시', score: 2 },
            { text: '오후 7시~9시', score: 1 }
        ]
    }
];

export type ChronotypeResult = 'morning' | 'moderate_morning' | 'neutral' | 'moderate_evening' | 'evening';

export const getChronotypeResult = (score: number): ChronotypeResult => {
    if (score >= 28) return 'morning';
    if (score >= 23) return 'moderate_morning';
    if (score >= 17) return 'neutral';
    if (score >= 12) return 'moderate_evening';
    return 'evening';
};

export const CHRONOTYPE_DESCRIPTIONS: Record<ChronotypeResult, {
    label: string;
    description: string;
    goldenTime: string;
    studyAdvice: string;
}> = {
    morning: {
        label: '확실한 아침형',
        description: '아침 일찍 일어나 오전에 최고의 집중력을 발휘합니다.',
        goldenTime: '오전 6:00~11:00',
        studyAdvice: '새벽~오전에 고난도 과목 배치. 저녁은 복습/암기 위주. 일찍 잠자리에 들어 리듬 유지.'
    },
    moderate_morning: {
        label: '다소 아침형',
        description: '아침에 비교적 잘 일어나고 오전에 집중이 잘 됩니다.',
        goldenTime: '오전 8:00~12:00',
        studyAdvice: '오전에 핵심 학습 배치. 점심 후 가벼운 복습. 저녁 9시 이후는 휴식.'
    },
    neutral: {
        label: '중간형',
        description: '시간대에 크게 영향받지 않고 유연하게 적응합니다.',
        goldenTime: '오전 10:00~오후 2:00, 오후 4:00~7:00',
        studyAdvice: '자신의 컨디션에 따라 유연하게 조절. 일정한 수면 패턴 유지가 핵심.'
    },
    moderate_evening: {
        label: '다소 저녁형',
        description: '오후~저녁에 점차 집중력이 올라갑니다.',
        goldenTime: '오후 3:00~9:00',
        studyAdvice: '오전은 가벼운 복습/워밍업. 오후~저녁에 고난도 학습. 새벽 공부는 비효율적.'
    },
    evening: {
        label: '확실한 저녁형',
        description: '밤에 가장 집중이 잘 되고 아침 기상이 어렵습니다.',
        goldenTime: '오후 5:00~자정',
        studyAdvice: '저녁~밤에 핵심 학습. 새벽 공부는 피하고 늦은 기상 허용. 단, 시험 2주 전부터 점진적 조정 필요.'
    }
};

// ========== 2. 학습 감각 유형 검사 (VARK) ==========
export interface VARKQuestion {
    id: string;
    situation: string;
    options: { text: string; type: 'V' | 'A' | 'R' | 'K' }[];
}

export const VARK_QUESTIONS: VARKQuestion[] = [
    {
        id: 'vark_1',
        situation: '새로운 개념을 배울 때 어떤 방식이 가장 잘 이해되나요?',
        options: [
            { text: '그림, 도표, 다이어그램으로 보기', type: 'V' },
            { text: '선생님이나 강사의 설명 듣기', type: 'A' },
            { text: '교과서나 참고서 읽기', type: 'R' },
            { text: '직접 문제를 풀면서 익히기', type: 'K' }
        ]
    },
    {
        id: 'vark_2',
        situation: '길을 찾아갈 때 어떤 방법을 선호하나요?',
        options: [
            { text: '지도나 네비게이션 화면 보기', type: 'V' },
            { text: '누군가에게 길을 물어보기', type: 'A' },
            { text: '주소나 설명을 적어서 따라가기', type: 'R' },
            { text: '일단 가보면서 찾기', type: 'K' }
        ]
    },
    {
        id: 'vark_3',
        situation: '수학 공식을 외울 때 어떤 방법이 효과적인가요?',
        options: [
            { text: '공식을 시각적으로 표현하거나 색깔로 구분', type: 'V' },
            { text: '공식을 소리 내어 여러 번 읽기', type: 'A' },
            { text: '노트에 정리해서 반복해서 읽기', type: 'R' },
            { text: '공식을 적용한 문제를 많이 풀기', type: 'K' }
        ]
    },
    {
        id: 'vark_4',
        situation: '영어 단어를 외울 때 가장 효과적인 방법은?',
        options: [
            { text: '이미지나 연상 그림과 함께 외우기', type: 'V' },
            { text: '발음을 들으면서 따라 말하기', type: 'A' },
            { text: '단어장에 적어서 반복 읽기', type: 'R' },
            { text: '문장에서 사용하며 손으로 써보기', type: 'K' }
        ]
    },
    {
        id: 'vark_5',
        situation: '시험 전날 최종 점검을 할 때?',
        options: [
            { text: '마인드맵이나 요약 도표 훑어보기', type: 'V' },
            { text: '핵심 내용을 소리 내어 복습하기', type: 'A' },
            { text: '노트 필기를 처음부터 끝까지 읽기', type: 'R' },
            { text: '핵심 문제 몇 개를 직접 풀어보기', type: 'K' }
        ]
    },
    {
        id: 'vark_6',
        situation: '강의를 들을 때 집중이 잘 되는 상황은?',
        options: [
            { text: 'PPT나 판서가 잘 정리된 수업', type: 'V' },
            { text: '선생님 설명이 재미있고 명확한 수업', type: 'A' },
            { text: '프린트 자료가 주어지는 수업', type: 'R' },
            { text: '직접 참여하거나 실습하는 수업', type: 'K' }
        ]
    },
    {
        id: 'vark_7',
        situation: '기억이 잘 안 날 때 떠올리는 방식은?',
        options: [
            { text: '그 내용이 있던 페이지나 위치를 떠올림', type: 'V' },
            { text: '들었던 설명이나 목소리를 떠올림', type: 'A' },
            { text: '적어둔 문장이나 단어를 떠올림', type: 'R' },
            { text: '그때 했던 행동이나 상황을 떠올림', type: 'K' }
        ]
    },
    {
        id: 'vark_8',
        situation: '새로운 기기 사용법을 배울 때?',
        options: [
            { text: '그림/동영상 설명서 보기', type: 'V' },
            { text: '누군가에게 설명 듣기', type: 'A' },
            { text: '매뉴얼 읽기', type: 'R' },
            { text: '직접 이것저것 눌러보기', type: 'K' }
        ]
    }
];

export interface VARKResult {
    V: number;
    A: number;
    R: number;
    K: number;
    primary: 'V' | 'A' | 'R' | 'K' | 'multi';
    secondary?: 'V' | 'A' | 'R' | 'K';
}

export const calculateVARKResult = (answers: Record<string, 'V' | 'A' | 'R' | 'K'>): VARKResult => {
    const counts = { V: 0, A: 0, R: 0, K: 0 };
    Object.values(answers).forEach(type => counts[type]++);

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]) as ['V' | 'A' | 'R' | 'K', number][];
    const [first, second] = sorted;

    // 차이가 2 이하이면 복합형
    const isMulti = first[1] - second[1] <= 1 && first[1] > 0;

    return {
        ...counts,
        primary: isMulti ? 'multi' : first[0],
        secondary: isMulti ? second[0] : undefined
    };
};

export const VARK_DESCRIPTIONS: Record<'V' | 'A' | 'R' | 'K' | 'multi', {
    label: string;
    description: string;
    studyMethods: string[];
    subjectTips: { korean: string; math: string; english: string };
}> = {
    V: {
        label: '시각형 (Visual)',
        description: '그림, 도표, 색깔, 공간적 배치를 통해 학습할 때 효과적입니다.',
        studyMethods: [
            '마인드맵과 개념도 적극 활용',
            '형광펜으로 색깔 코딩',
            '인강/유튜브 강의 선호',
            '표와 그래프로 정보 정리'
        ],
        subjectTips: {
            korean: '지문 구조를 박스/화살표로 시각화. 문학은 장면을 그림으로 상상.',
            math: '그래프와 도형을 크게 그리며 풀기. 풀이 과정을 색깔로 구분.',
            english: '단어를 이미지와 연결. 문장 구조를 도식화.'
        }
    },
    A: {
        label: '청각형 (Auditory)',
        description: '듣고 말하는 것을 통해 학습할 때 가장 효과적입니다.',
        studyMethods: [
            '강의/설명 듣기 선호',
            '소리 내어 읽고 암기',
            '토론이나 스터디 그룹 효과적',
            '녹음해서 반복 청취'
        ],
        subjectTips: {
            korean: '지문을 소리 내어 읽기. 시/소설은 감정 넣어 낭독.',
            math: '풀이 과정을 말로 설명하며 풀기. 공식을 리듬 붙여 암기.',
            english: '쉐도잉, 듣기 훈련 집중. 단어는 발음하며 암기.'
        }
    },
    R: {
        label: '읽기/쓰기형 (Read/Write)',
        description: '읽고 쓰는 활동을 통해 가장 잘 학습합니다.',
        studyMethods: [
            '교과서/참고서 정독',
            '필기 노트 꼼꼼히 작성',
            '요약본 직접 만들기',
            '글로 적어가며 정리'
        ],
        subjectTips: {
            korean: '지문 분석 내용을 글로 정리. 핵심 논지를 한 문장으로 요약.',
            math: '풀이 과정을 빠짐없이 써가며 풀기. 오답 노트 꼼꼼히 작성.',
            english: '문법 규칙을 정리 노트에 작성. 작문 연습 효과적.'
        }
    },
    K: {
        label: '운동감각형 (Kinesthetic)',
        description: '직접 해보고 움직이면서 학습할 때 효과적입니다.',
        studyMethods: [
            '문제 풀이 중심 학습',
            '서서 또는 걸으며 공부',
            '손으로 쓰며 암기',
            '실습/실험 선호'
        ],
        subjectTips: {
            korean: '펜으로 지문에 직접 표시하며 읽기. 핵심 내용 손으로 베껴 쓰기.',
            math: '많은 문제 풀이로 체득. 도형은 직접 그려보기.',
            english: '단어를 여러 번 써가며 암기. 역할극으로 회화 연습.'
        }
    },
    multi: {
        label: '복합형 (Multimodal)',
        description: '여러 감각을 활용할 때 가장 효과적입니다.',
        studyMethods: [
            '과목/상황에 따라 방법 혼용',
            '다양한 자료 형태 활용',
            '자신만의 학습 스타일 개발',
            '복합적 접근이 기억 강화'
        ],
        subjectTips: {
            korean: '듣기+읽기+시각화를 번갈아 사용. 다양한 방법 실험.',
            math: '설명 듣고, 직접 풀고, 오답 정리까지. 종합적 접근.',
            english: '듣기+읽기+쓰기+말하기 4가지 모두 훈련.'
        }
    }
};

// ========== 3. 시험 불안 검사 (TAI - Test Anxiety Inventory) ==========
export interface TAIQuestion {
    id: string;
    question: string;
    dimension: 'cognitive' | 'somatic'; // 인지적 걱정 vs 신체적 긴장
}

export const TAI_QUESTIONS: TAIQuestion[] = [
    // 인지적 걱정 (Cognitive Worry)
    { id: 'tai_c1', question: '시험 중 다른 학생들이 나보다 잘 할 것 같다는 생각이 든다.', dimension: 'cognitive' },
    { id: 'tai_c2', question: '시험을 망치면 어떡하지 하는 걱정이 계속된다.', dimension: 'cognitive' },
    { id: 'tai_c3', question: '시험 결과가 나쁘면 부모님/선생님이 실망할까 걱정된다.', dimension: 'cognitive' },
    { id: 'tai_c4', question: '시험 중 알던 내용도 기억이 안 나서 당황한다.', dimension: 'cognitive' },
    { id: 'tai_c5', question: '시험 전 "이번에도 못 보면..."하는 부정적 생각이 맴돈다.', dimension: 'cognitive' },
    { id: 'tai_c6', question: '시험 결과가 내 미래를 결정한다고 느껴 부담된다.', dimension: 'cognitive' },
    { id: 'tai_c7', question: '시험 중 시간이 부족할 것 같아 초조하다.', dimension: 'cognitive' },
    // 신체적 긴장 (Somatic Tension)
    { id: 'tai_s1', question: '시험 전날이나 당일 아침에 배가 아프거나 소화가 안 된다.', dimension: 'somatic' },
    { id: 'tai_s2', question: '시험 중 손이 떨리거나 땀이 난다.', dimension: 'somatic' },
    { id: 'tai_s3', question: '시험장에서 심장이 두근거리거나 숨이 가빠진다.', dimension: 'somatic' },
    { id: 'tai_s4', question: '시험 중 목이나 어깨 근육이 뻣뻣해진다.', dimension: 'somatic' },
    { id: 'tai_s5', question: '시험 전 잠이 잘 안 오거나 자주 깬다.', dimension: 'somatic' },
    { id: 'tai_s6', question: '시험 볼 때 입이 마르거나 화장실이 자주 가고 싶다.', dimension: 'somatic' },
    { id: 'tai_s7', question: '시험 전 두통이나 어지러움을 느낀다.', dimension: 'somatic' }
];

export interface TAIResult {
    cognitiveScore: number; // 인지적 걱정 총점
    somaticScore: number;   // 신체적 긴장 총점
    totalScore: number;
    dominantType: 'cognitive' | 'somatic' | 'balanced';
    severity: 'low' | 'moderate' | 'high';
}

export const calculateTAIResult = (answers: number[]): TAIResult => {
    const cognitive = answers.slice(0, 7).reduce((a, b) => a + b, 0);
    const somatic = answers.slice(7, 14).reduce((a, b) => a + b, 0);
    const total = cognitive + somatic;

    let dominantType: 'cognitive' | 'somatic' | 'balanced';
    if (cognitive > somatic + 3) dominantType = 'cognitive';
    else if (somatic > cognitive + 3) dominantType = 'somatic';
    else dominantType = 'balanced';

    let severity: 'low' | 'moderate' | 'high';
    if (total <= 21) severity = 'low';
    else if (total <= 35) severity = 'moderate';
    else severity = 'high';

    return { cognitiveScore: cognitive, somaticScore: somatic, totalScore: total, dominantType, severity };
};

export const TAI_INTERVENTIONS: Record<'cognitive' | 'somatic' | 'balanced', {
    label: string;
    description: string;
    strategies: string[];
    examDayTips: string[];
}> = {
    cognitive: {
        label: '인지적 걱정 우세',
        description: '"시험 망치면 어쩌지?"류의 부정적 사고가 주요 원인입니다.',
        strategies: [
            '인지 재구조화: 부정적 생각을 객관적으로 검토',
            '걱정 시간 제한: 하루 10분만 걱정하고 나머지는 학습',
            '성공 경험 일지: 작은 성취도 기록하여 자신감 회복',
            '현실적 목표 설정: 100점이 아닌 "할 수 있는 최선"'
        ],
        examDayTips: [
            '시험 전 "최악의 상황도 대처 가능하다" 자기 암시',
            '모르는 문제는 넘기고 아는 것에 집중',
            '시험 결과와 나의 가치는 별개임을 상기'
        ]
    },
    somatic: {
        label: '신체적 긴장 우세',
        description: '손떨림, 두근거림, 소화불량 등 신체 증상이 주요 문제입니다.',
        strategies: [
            '4-7-8 호흡법 훈련 (매일 연습)',
            '점진적 근육 이완법 (목, 어깨 위주)',
            '시험 상황 노출 연습 (모의고사 많이 치기)',
            '카페인/당류 제한 (시험 전날부터)'
        ],
        examDayTips: [
            '시험장 도착 후 4-7-8 호흡 5회',
            '손바닥 합장 후 10초 힘주기로 긴장 에너지 방출',
            '목/어깨 스트레칭 실시'
        ]
    },
    balanced: {
        label: '인지+신체 복합형',
        description: '정신적 걱정과 신체 반응이 모두 나타납니다.',
        strategies: [
            '마음챙김 명상: 생각과 신체 감각 동시 관찰',
            '호흡법 + 긍정 자기대화 병행',
            '충분한 수면으로 기초 체력 확보',
            '시험 루틴 확립으로 예측 가능성 높이기'
        ],
        examDayTips: [
            '평소 연습한 이완 루틴 그대로 실행',
            '시험은 연습의 연장선이라고 생각',
            '긴장을 "준비된 상태"로 재해석'
        ]
    }
};

// ========== 4. 디지털 중독 검사 ==========
export interface DigitalAddictionQuestion {
    id: string;
    question: string;
    category: 'tolerance' | 'withdrawal' | 'control' | 'impact';
}

export const DIGITAL_ADDICTION_QUESTIONS: DigitalAddictionQuestion[] = [
    // 내성 (Tolerance)
    { id: 'da_t1', question: '스마트폰/SNS 사용 시간이 점점 늘어났다.', category: 'tolerance' },
    { id: 'da_t2', question: '짧은 영상(숏폼)을 보면 시간 가는 줄 모른다.', category: 'tolerance' },
    { id: 'da_t3', question: '이전보다 더 자극적인 콘텐츠를 찾게 된다.', category: 'tolerance' },
    // 금단 (Withdrawal)
    { id: 'da_w1', question: '폰이 없으면 불안하거나 초조하다.', category: 'withdrawal' },
    { id: 'da_w2', question: '알림을 확인하지 않으면 찝찝하다.', category: 'withdrawal' },
    { id: 'da_w3', question: '공부 중에도 폰이 신경 쓰인다.', category: 'withdrawal' },
    // 조절 실패 (Control)
    { id: 'da_c1', question: '"5분만" 하려다 30분 이상 지나간 적이 많다.', category: 'control' },
    { id: 'da_c2', question: '폰 사용을 줄이려 했지만 실패한 적이 있다.', category: 'control' },
    { id: 'da_c3', question: '자기 전 폰을 보다가 늦게 자는 경우가 많다.', category: 'control' },
    // 영향 (Impact)
    { id: 'da_i1', question: '폰 때문에 공부 계획을 못 지킨 적이 있다.', category: 'impact' },
    { id: 'da_i2', question: '수업/공부 중 폰을 몰래 확인한다.', category: 'impact' },
    { id: 'da_i3', question: '책/교과서를 읽다가 지루해서 폰을 찾게 된다.', category: 'impact' }
];

export interface DigitalAddictionResult {
    toleranceScore: number;
    withdrawalScore: number;
    controlScore: number;
    impactScore: number;
    totalScore: number;
    level: 'healthy' | 'caution' | 'risk' | 'addiction';
    dopamineStatus: string;
}

export const calculateDigitalAddictionResult = (answers: number[]): DigitalAddictionResult => {
    const tolerance = answers.slice(0, 3).reduce((a, b) => a + b, 0);
    const withdrawal = answers.slice(3, 6).reduce((a, b) => a + b, 0);
    const control = answers.slice(6, 9).reduce((a, b) => a + b, 0);
    const impact = answers.slice(9, 12).reduce((a, b) => a + b, 0);
    const total = tolerance + withdrawal + control + impact;

    let level: 'healthy' | 'caution' | 'risk' | 'addiction';
    let dopamineStatus: string;

    if (total <= 12) {
        level = 'healthy';
        dopamineStatus = '정상: 도파민 보상 체계가 건강합니다.';
    } else if (total <= 24) {
        level = 'caution';
        dopamineStatus = '주의: 도파민 민감도가 다소 저하되었을 수 있습니다.';
    } else if (total <= 36) {
        level = 'risk';
        dopamineStatus = '경계: 도파민 수용체 둔감화가 진행 중일 수 있습니다.';
    } else {
        level = 'addiction';
        dopamineStatus = '위험: 즉각적 보상에 길들여져 지연된 보상(공부)이 어렵습니다.';
    }

    return { toleranceScore: tolerance, withdrawalScore: withdrawal, controlScore: control, impactScore: impact, totalScore: total, level, dopamineStatus };
};

export const DIGITAL_DETOX_PROTOCOLS: Record<'healthy' | 'caution' | 'risk' | 'addiction', {
    label: string;
    description: string;
    protocols: string[];
    studyMethod: string;
}> = {
    healthy: {
        label: '건강 (양호)',
        description: '디지털 사용이 잘 통제되고 있습니다.',
        protocols: [
            '현재 습관 유지',
            '공부 시간에는 폰 다른 방에 두기',
            '앱 사용 시간 모니터링'
        ],
        studyMethod: '기존 학습 방식 유지. 뽀모도로 기법(25분 집중, 5분 휴식) 권장.'
    },
    caution: {
        label: '주의 (경미)',
        description: '약간의 의존 성향이 보입니다. 관리가 필요합니다.',
        protocols: [
            '알림 끄기 (학습 시간)',
            'SNS/숏폼 앱은 폴더 깊이 숨기기',
            '취침 1시간 전 폰 사용 중단',
            '주 1회 "폰 프리 데이" 시도'
        ],
        studyMethod: '폰 격리 후 20분 단위 집중. 휴식 시간에도 폰 대신 스트레칭.'
    },
    risk: {
        label: '경계 (중등도)',
        description: '도파민 민감도 저하로 집중력에 영향을 미치고 있습니다.',
        protocols: [
            '앱 타이머 강제 설정',
            '그레이스케일 모드 사용',
            '숏폼 앱 삭제 고려',
            '공부 시작 전 폰 잠금함에 보관',
            '2주간 "디지털 디톡스" 프로토콜'
        ],
        studyMethod: '15분 단위 뽀모도로로 시작. 집중 시간 점진적으로 늘리기. 지루함을 견디는 훈련 필요.'
    },
    addiction: {
        label: '위험 (심각)',
        description: '강한 의존 상태입니다. 적극적 개입이 필요합니다.',
        protocols: [
            '숏폼/게임 앱 완전 삭제',
            '부모님께 폰 보관 요청',
            '공부 중 폰 볼 때마다 기록',
            '전문 상담 고려',
            '4주간 집중 디톡스 프로토콜'
        ],
        studyMethod: '10분 집중 → 2분 휴식부터 시작. 성공 경험 쌓기. 지루함 = 뇌 회복의 신호.'
    }
};

// ========== 5. 메타인지 학습 전략 검사 (MSLQ 기반) ==========
export interface MetacognitionQuestion {
    id: string;
    question: string;
    strategy: 'rehearsal' | 'elaboration' | 'organization' | 'metacognitive';
}

export const METACOGNITION_QUESTIONS: MetacognitionQuestion[] = [
    // 시연 (Rehearsal) - 단순 반복
    { id: 'meta_r1', question: '중요한 내용은 여러 번 소리 내어 읽어서 외운다.', strategy: 'rehearsal' },
    { id: 'meta_r2', question: '암기할 내용은 반복해서 쓰면서 외운다.', strategy: 'rehearsal' },
    { id: 'meta_r3', question: '시험 범위를 처음부터 끝까지 여러 번 읽는다.', strategy: 'rehearsal' },
    // 정교화 (Elaboration) - 기존 지식과 연결
    { id: 'meta_e1', question: '새로운 개념을 배울 때 이미 알던 것과 연결지어 생각한다.', strategy: 'elaboration' },
    { id: 'meta_e2', question: '내용을 내 말로 바꿔서 이해하려고 노력한다.', strategy: 'elaboration' },
    { id: 'meta_e3', question: '예시나 실생활 상황에 적용해보며 이해한다.', strategy: 'elaboration' },
    // 조직화 (Organization) - 구조화
    { id: 'meta_o1', question: '내용을 학습하기 전에 목차나 전체 구조를 파악한다.', strategy: 'organization' },
    { id: 'meta_o2', question: '노트 정리 시 개념들 간의 관계를 표나 도표로 나타낸다.', strategy: 'organization' },
    { id: 'meta_o3', question: '핵심 키워드를 추출하여 마인드맵이나 요약본을 만든다.', strategy: 'organization' },
    // 메타인지 (Metacognitive) - 자기 모니터링
    { id: 'meta_m1', question: '공부하면서 내가 이해했는지 스스로 점검한다.', strategy: 'metacognitive' },
    { id: 'meta_m2', question: '모르는 부분이 있으면 다시 돌아가서 확인한다.', strategy: 'metacognitive' },
    { id: 'meta_m3', question: '공부 방법이 효과적인지 스스로 평가하고 조정한다.', strategy: 'metacognitive' }
];

export interface MetacognitionResult {
    rehearsalScore: number;
    elaborationScore: number;
    organizationScore: number;
    metacognitiveScore: number;
    dominantStrategy: 'rehearsal' | 'elaboration' | 'organization' | 'metacognitive' | 'balanced';
    learnerLevel: 'beginner' | 'developing' | 'proficient' | 'expert';
}

export const calculateMetacognitionResult = (answers: number[]): MetacognitionResult => {
    const rehearsal = answers.slice(0, 3).reduce((a, b) => a + b, 0);
    const elaboration = answers.slice(3, 6).reduce((a, b) => a + b, 0);
    const organization = answers.slice(6, 9).reduce((a, b) => a + b, 0);
    const metacognitive = answers.slice(9, 12).reduce((a, b) => a + b, 0);

    const scores = { rehearsal, elaboration, organization, metacognitive };
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const [first, second] = sorted;

    let dominantStrategy: 'rehearsal' | 'elaboration' | 'organization' | 'metacognitive' | 'balanced';
    if (first[1] - second[1] <= 2) {
        dominantStrategy = 'balanced';
    } else {
        dominantStrategy = first[0] as any;
    }

    // 학습자 수준 판별 (정교화+조직화+메타인지 점수 기준)
    const advancedScore = elaboration + organization + metacognitive;
    let learnerLevel: 'beginner' | 'developing' | 'proficient' | 'expert';
    if (advancedScore <= 15) learnerLevel = 'beginner';
    else if (advancedScore <= 24) learnerLevel = 'developing';
    else if (advancedScore <= 33) learnerLevel = 'proficient';
    else learnerLevel = 'expert';

    return { rehearsalScore: rehearsal, elaborationScore: elaboration, organizationScore: organization, metacognitiveScore: metacognitive, dominantStrategy, learnerLevel };
};

export const METACOGNITION_RECOMMENDATIONS: Record<'beginner' | 'developing' | 'proficient' | 'expert', {
    label: string;
    description: string;
    upgradeStrategies: string[];
    immediateActions: string[];
}> = {
    beginner: {
        label: '초보 학습자',
        description: '주로 반복/암기에 의존합니다. 이해 중심 학습으로 전환이 필요합니다.',
        upgradeStrategies: [
            '새 내용 배울 때 "왜?"라고 3번 질문하기',
            '오늘 배운 내용을 친구에게 설명해보기',
            '개념 하나를 실생활 예시로 연결해보기',
            '단원 시작 전 목차 먼저 훑어보기'
        ],
        immediateActions: [
            '단순 반복 시간 줄이고 문제 풀이 늘리기',
            '노트에 "핵심 키워드" 칸 만들기',
            '모르는 것 인정하고 질문하는 습관'
        ]
    },
    developing: {
        label: '발전 중인 학습자',
        description: '이해하려는 노력이 보입니다. 구조화 능력을 키우면 도약합니다.',
        upgradeStrategies: [
            '단원별 마인드맵 만들기',
            '배운 개념들 간의 관계 정리',
            '스스로 예상 문제 만들어보기',
            '공부 후 "오늘 뭘 배웠나" 3줄 요약'
        ],
        immediateActions: [
            '개념 간 연결 고리 찾는 연습',
            '요약본을 직접 만들어 복습',
            '이해 안 되면 다른 방식으로 접근'
        ]
    },
    proficient: {
        label: '능숙한 학습자',
        description: '효과적인 학습 전략을 사용합니다. 메타인지를 강화하면 최상위로 갈 수 있습니다.',
        upgradeStrategies: [
            '공부 후 "내가 얼마나 이해했나" 자가 평가',
            '학습 계획 vs 실제 결과 비교 분석',
            '자신만의 최적 학습법 문서화',
            '약점 파악 후 집중 보완 계획 수립'
        ],
        immediateActions: [
            '어려운 문제일수록 과정 기록',
            '오답 패턴 분석하여 약점 파악',
            '시험 후 오답 분석 꼭 실시'
        ]
    },
    expert: {
        label: '전문 학습자',
        description: '고급 학습 전략을 잘 활용합니다. 꾸준히 유지하고 후배를 가르쳐보세요.',
        upgradeStrategies: [
            '다른 학생을 가르치며 메타인지 강화',
            '새로운 학습 방법 실험 및 평가',
            '장기 목표에 맞춘 학습 로드맵 수립',
            '심화 개념 탐구 and 융합 사고'
        ],
        immediateActions: [
            '현재 전략 유지 및 컨디션 관리',
            '동료 학습 도움으로 자기 이해 심화',
            '약점 과목에 전략 집중 적용'
        ]
    }
};

// ========== CareType별 공부 효율 검사 권장 ==========
export const CARETYPE_ASSESSMENT_RECOMMENDATIONS: Record<CareType, {
    priority: string[];
    reason: string;
}> = {
    [CareType.BURNOUT]: {
        priority: ['chronotype', 'metacognition'],
        reason: '번아웃 상태에서는 골든타임 파악과 효율적 학습 전략이 핵심입니다.'
    },
    [CareType.ADRENAL]: {
        priority: ['chronotype', 'digitalAddiction'],
        reason: '부신피로는 에너지 리듬과 도파민 관리가 회복의 핵심입니다.'
    },
    [CareType.STRESS_OVERLOAD]: {
        priority: ['testAnxiety', 'digitalAddiction'],
        reason: '스트레스 과부하 시 불안 관리와 자극 조절이 우선입니다.'
    },
    [CareType.SLEEP]: {
        priority: ['chronotype', 'digitalAddiction'],
        reason: '수면 문제는 생체 리듬과 취침 전 스마트폰 사용이 핵심 원인입니다.'
    },
    [CareType.ANXIETY_TENSION]: {
        priority: ['testAnxiety', 'metacognition'],
        reason: '불안-긴장형은 시험 불안 관리와 자신감 회복이 중요합니다.'
    },
    [CareType.LOW_ENERGY]: {
        priority: ['vark', 'metacognition'],
        reason: '저에너지 상태에서는 맞춤 학습법으로 효율을 높여야 합니다.'
    },
    [CareType.DEPRESSION_AMOTIVATION]: {
        priority: ['metacognition', 'digitalAddiction'],
        reason: '동기 저하 시 작은 성공 경험과 도파민 조절이 필요합니다.'
    },
    [CareType.BRAIN_FATIGUE]: {
        priority: ['chronotype', 'vark'],
        reason: '뇌피로 상태에서는 최적 시간대와 효율적 입력 방식이 중요합니다.'
    },
    [CareType.HYPERSENSITIVE]: {
        priority: ['testAnxiety', 'vark'],
        reason: '과민성 학습자는 불안 관리와 감각 맞춤 학습이 핵심입니다.'
    },
    [CareType.ATTENTION_DEFICIT]: {
        priority: ['digitalAddiction', 'metacognition'],
        reason: '주의력 산만형은 도파민 조절과 구조화된 학습 전략이 필수입니다.'
    },
    [CareType.CIRCULATION]: {
        priority: ['chronotype', 'vark'],
        reason: '순환 저하형은 에너지 리듬에 맞춘 학습 배치가 중요합니다.'
    },
    [CareType.HEALTHY]: {
        priority: ['vark', 'metacognition'],
        reason: '건강한 상태에서는 학습법 최적화로 성과를 극대화하세요.'
    },
    [CareType.CONCENTRATION]: {
        priority: ['digitalAddiction', 'metacognition'],
        reason: '집중력 저하형은 자극 관리와 학습 전략 업그레이드가 필요합니다.'
    },
    [CareType.UNASSESSED]: {
        priority: ['chronotype', 'vark', 'metacognition'],
        reason: '기본 프로필을 파악하기 위해 전반적인 검사를 권장합니다.'
    }
};

// ========== 통합 타입 ==========
export interface StudyEfficiencyProfile {
    chronotype?: ChronotypeResult;
    chronotypeScore?: number;
    vark?: VARKResult;
    testAnxiety?: TAIResult;
    digitalAddiction?: DigitalAddictionResult;
    metacognition?: MetacognitionResult;
    assessedAt?: string;
}

export interface StudyEfficiencyData {
    chronotypeAnswers: number[];
    varkAnswers: Record<string, 'V' | 'A' | 'R' | 'K'>;
    taiAnswers: number[];
    digitalAddictionAnswers: number[];
    metacognitionAnswers: number[];
}
