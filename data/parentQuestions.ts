/**
 * 학부모 모드 설문 — 관찰자(Observer) 버전
 *
 * 학생 자가 보고 설문(BAI/ISI/CFS)의 핵심 문항을 "자녀를 관찰한 부모" 관점으로 치환한 문항 세트.
 * 응답 데이터 구조는 학생용과 동일하게 점수화 가능하도록 설계.
 * 법적 안전망: 모든 결과는 "관찰 기반 참고 자료"로만 해석됨을 문구에 명시.
 */

export interface ParentQuestionOption {
    label: string;
    score: number;
}

export interface ParentQuestion {
    id: string;
    category: 'anxiety' | 'sleep' | 'fatigue' | 'concentration' | 'appetite';
    categoryLabel: string;
    text: string;          // 학부모 관찰 문구
    studentText: string;   // 대응되는 학생 자가 문항 (갭 분석용 참조)
    options: ParentQuestionOption[];
}

export interface ParentQuestionOption {
    label: string;
    score: number;
}

const FREQ_OPTIONS: ParentQuestionOption[] = [
    { label: '전혀 없음', score: 0 },
    { label: '가끔 그런 편', score: 1 },
    { label: '자주 그런 편', score: 2 },
    { label: '거의 항상 그럼', score: 3 },
];

export const PARENT_QUESTIONS: ParentQuestion[] = [
    // ===== 불안 관찰 (BAI 기반) =====
    {
        id: 'p_anx_1',
        category: 'anxiety',
        categoryLabel: '불안·긴장 관찰',
        text: '시험 기간에 아이가 평소보다 심하게 초조해하거나 안절부절하는 모습을 보인 적이 있습니까?',
        studentText: '안절부절 못한다.',
        options: FREQ_OPTIONS,
    },
    {
        id: 'p_anx_2',
        category: 'anxiety',
        categoryLabel: '불안·긴장 관찰',
        text: '시험 전후로 아이가 소화불량, 복통, 식욕 저하를 호소하거나 보였습니까?',
        studentText: '자주 소화가 잘 안되고 뱃속이 불편하다.',
        options: FREQ_OPTIONS,
    },
    {
        id: 'p_anx_3',
        category: 'anxiety',
        categoryLabel: '불안·긴장 관찰',
        text: '아이가 사소한 일에도 짜증을 내거나 예민하게 반응하는 빈도가 높아졌습니까?',
        studentText: '신경이 과민 되어 있다.',
        options: FREQ_OPTIONS,
    },
    {
        id: 'p_anx_4',
        category: 'anxiety',
        categoryLabel: '불안·긴장 관찰',
        text: '아이가 "시험에서 망칠 것 같다", "다 잘릴 것 같다" 같은 걱정을 입 밖에 내는 편입니까?',
        studentText: '매우 나쁜 일이 일어날 것 같은 두려움을 느낀다.',
        options: FREQ_OPTIONS,
    },

    // ===== 수면 관찰 (ISI 기반) =====
    {
        id: 'p_sleep_1',
        category: 'sleep',
        categoryLabel: '수면 패턴 관찰',
        text: '아이가 밤 12시 이후에도 책상에 앉아 있거나 잠들지 못하는 날이 자주 있습니까?',
        studentText: '잠들기 어렵다.',
        options: FREQ_OPTIONS,
    },
    {
        id: 'p_sleep_2',
        category: 'sleep',
        categoryLabel: '수면 패턴 관찰',
        text: '아침에 아이를 깨우기가 힘들 정도로 개운하지 않아 보이는 날이 많습니까?',
        studentText: '충분히 잤음에도 불구하고 낮 시간에 계속 졸음이 쏟아진다.',
        options: FREQ_OPTIONS,
    },
    {
        id: 'p_sleep_3',
        category: 'sleep',
        categoryLabel: '수면 패턴 관찰',
        text: '평일 아이의 평균 수면 시간은 어느 정도입니까?',
        studentText: '(수면 시간 직접 관찰)',
        options: [
            { label: '7시간 이상', score: 0 },
            { label: '6~7시간', score: 1 },
            { label: '5~6시간', score: 2 },
            { label: '5시간 미만', score: 3 },
        ],
    },
    {
        id: 'p_sleep_4',
        category: 'sleep',
        categoryLabel: '수면 패턴 관찰',
        text: '주말에 아이가 낮잠을 길게 자거나 몰아서 자는 모습을 보입니까?',
        studentText: '잠을 자도 개운하지 않음',
        options: FREQ_OPTIONS,
    },

    // ===== 피로 관찰 =====
    {
        id: 'p_fatigue_1',
        category: 'fatigue',
        categoryLabel: '피로·활력 관찰',
        text: '아이가 "피곤하다"는 말을 하루에 여러 번 하는 편입니까?',
        studentText: '만성 피로 척도 핵심 문항',
        options: FREQ_OPTIONS,
    },
    {
        id: 'p_fatigue_2',
        category: 'fatigue',
        categoryLabel: '피로·활력 관찰',
        text: '주말이나 방학에도 아이가 충분히 회복되지 않고 지쳐 보입니까?',
        studentText: '운동 후 하루 이상 피로감',
        options: FREQ_OPTIONS,
    },
    {
        id: 'p_fatigue_2b',
        category: 'fatigue',
        categoryLabel: '피로·활력 관찰',
        text: '아이가 두통이나 어지럼증을 호소하는 빈도가 늘었습니까?',
        studentText: '두통',
        options: FREQ_OPTIONS,
    },

    // ===== 집중력 관찰 =====
    {
        id: 'p_focus_1',
        category: 'concentration',
        categoryLabel: '집중력 관찰',
        text: '아이가 공부 중 스마트폰을 확인하러 나오는 횟수가 잦습니까?',
        studentText: '외부 자극에 의해 쉽게 주의가 산만해진다.',
        options: FREQ_OPTIONS,
    },
    {
        id: 'p_focus_2',
        category: 'concentration',
        categoryLabel: '집중력 관찰',
        text: '아이가 계획한 공부량을 끝까지 못 채우고 좌절하는 모습을 자주 보입니까?',
        studentText: '지시대로 따라 하지 못하거나 학업을 끝까지 마치지 못한다.',
        options: FREQ_OPTIONS,
    },
    {
        id: 'p_focus_3',
        category: 'concentration',
        categoryLabel: '집중력 관찰',
        text: '아이가 대화 중 집중하지 못하거나 같은 말을 반복해서 듣는 것처럼 느껴진 적이 있습니까?',
        studentText: '다른 사람이 말을 할 때 귀 기울여 듣지 않는다는 느낌을 받는다.',
        options: FREQ_OPTIONS,
    },

    // ===== 식습관·생활 관찰 =====
    {
        id: 'p_life_1',
        category: 'appetite',
        categoryLabel: '식습관·생활 관찰',
        text: '아이의 식사량이 줄었거나, 반대로 단 음식/야식을 찾는 빈도가 늘었습니까?',
        studentText: '짠 음식이나 단 음식이 강렬하게 당길 때가 많다.',
        options: FREQ_OPTIONS,
    },
    {
        id: 'p_life_2',
        category: 'appetite',
        categoryLabel: '식습관·생활 관찰',
        text: '아이가 카페인 음료(커피, 에너지 드링크)를 마시는 빈도는 어떻습니까?',
        studentText: '카페인 없이는 하루를 버티기 힘들다.',
        options: [
            { label: '마시지 않음', score: 0 },
            { label: '주 1~2회', score: 1 },
            { label: '주 3~5회', score: 2 },
            { label: '매일', score: 3 },
        ],
    },
    {
        id: 'p_life_3',
        category: 'appetite',
        categoryLabel: '식습관·생활 관찰',
        text: '아이가 스마트폰 사용으로 잠드는 시간이 늦어진다고 느끼십니까?',
        studentText: '(디지털 사용 관찰)',
        options: FREQ_OPTIONS,
    },
];

/** 학부모 모드 결과 등급 산출 */
export interface ParentAssessmentResult {
    totalScore: number;
    maxScore: number;
    ratio: number; // 0~100
    grade: 'stable' | 'watch' | 'attention';
    gradeLabel: string;
    gradeColor: string;
    categoryResults: { category: string; score: number; max: number; ratio: number }[];
    recommendations: string[];
    gapHints: string[];
}

export function calculateParentResult(answers: Record<string, number>): ParentAssessmentResult {
    const questions = PARENT_QUESTIONS;
    let total = 0;
    let max = 0;
    const categoryMap: Record<string, { score: number; max: number }> = {};

    for (const q of questions) {
        const score = answers[q.id] ?? 0;
        const catMax = Math.max(...q.options.map(o => o.score));
        total += score;
        max += catMax;
        if (!categoryMap[q.category]) categoryMap[q.category] = { score: 0, max: 0 };
        categoryMap[q.category].score += score;
        categoryMap[q.category].max += catMax;
    }

    const ratio = max > 0 ? Math.round((total / max) * 100) : 0;

    let grade: ParentAssessmentResult['grade'] = 'stable';
    let gradeLabel = '안정 관찰';
    let gradeColor = '#10b981';
    if (ratio >= 50) {
        grade = 'attention';
        gradeLabel = '집중 케어 권장';
        gradeColor = '#f87171';
    } else if (ratio >= 25) {
        grade = 'watch';
        gradeLabel = '주의 관찰';
        gradeColor = '#f59e0b';
    }

    const categoryResults = Object.entries(categoryMap).map(([cat, v]) => ({
        category: cat,
        score: v.score,
        max: v.max,
        ratio: v.max > 0 ? Math.round((v.score / v.max) * 100) : 0,
    }));

    // 카테고리별 추천 처방
    const recommendations: string[] = [];
    const sorted = [...categoryResults].sort((a, b) => b.ratio - a.ratio);
    for (const c of sorted) {
        if (c.ratio >= 50) {
            if (c.category === 'anxiety') recommendations.push('시험 불안 완화 루틴: 시험 전 4-7-8 호흡법을 매일 저녁 5분씩 연습해보세요.');
            if (c.category === 'sleep' || c.category === 'sleep') recommendations.push('수면 루틴 조정: 자기 1시간 전 스마트폰 충전기를 침실 밖에 두는 규칙부터 시작해보세요.');
            if (c.category === 'fatigue') recommendations.push('만성 피로 회복: 주말 몰아자기보다 매일 30분씩 취침 시간을 앞당기는 방식을 권합니다.');
            if (c.category === 'concentration') recommendations.push('집중력 회복: 25분 학습 + 5분 휴식(뽀모도로)을 스마트폰 없이 시도해보세요.');
            if (c.category === 'appetite') recommendations.push('식습관 조절: 카페인은 오후 2시 이후 금지, 아침 단백질 섭취를 권합니다.');
        }
    }
    if (recommendations.length === 0) {
        recommendations.push('현재 관찰 범위에서는 안정적인 상태로 보입니다. 2~4주 후 재진단으로 추이를 확인해보세요.');
    }

    // 갭 힌트 (학부모 관찰이 심각한데 학생이 자가 보고를 안 했을 가능성)
    const gapHints: string[] = [];
    if (ratio >= 40) {
        gapHints.push('학부모 관찰상 주의 신호가 확인됩니다. 자녀 본인은 "괜찮다"고 말할 수 있으므로, 본인 직접 진단과 비교해보세요.');
    }
    if ((categoryMap['sleep']?.score ?? 0) >= 4) {
        gapHints.push('수면 부족은 성적 정체의 가장 흔한 원인입니다. 자녀와 수면 시간을 함께 점검해보세요.');
    }

    return {
        totalScore: total,
        maxScore: max,
        ratio,
        grade,
        gradeLabel,
        gradeColor,
        categoryResults,
        recommendations,
        gapHints,
    };
}

/** 자녀 초대 코드 생성 (6자리) */
export function generateChildInviteCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}
