
import { LearningAnalyticsData, StudentInfo, CareType } from "../types";

export interface ScheduleItem {
    time: string;
    activity: string;
    intensity: 'High' | 'Medium' | 'Low';
    desc: string;
}

export const generateAISchedule = (
    analytics: LearningAnalyticsData,
    student: StudentInfo,
    careType: CareType
): ScheduleItem[] => {
    const schedule: ScheduleItem[] = [];
    const { goldenTimeStart, goldenTimeEnd, chronotype } = analytics;
    const isAdrenalOrBurnout = careType === CareType.ADRENAL || careType === CareType.BURNOUT || careType === CareType.STRESS_OVERLOAD;

    // Helper to map subject keys to Korean
    const labels: Record<string, string> = {
        korean: '국어', math: '수학', english: '영어', korean_history: '한국사', science: '과학탐구', social: '사회탐구', other: '기타'
    };

    // 우선순위 3대 지표 분석
    const priorities = student.subjectPriorities;
    const focusRank = priorities?.currentFocusRank;
    const importanceRank = priorities?.importanceRank;
    const gradeRank = priorities?.gradeRank;

    // 1위 집중 과목 계산 (currentFocusRank 1위 > weakSubject > 'math')
    let topFocusSubjectKey = 'math';
    let secondFocusSubjectKey = 'korean';
    let weakestGradeSubjectKey = 'math';

    if (focusRank) {
        const sortedFocus = (Object.keys(focusRank) as Array<keyof typeof focusRank>)
            .sort((a, b) => (focusRank[a] || 99) - (focusRank[b] || 99));
        if (sortedFocus.length > 0) topFocusSubjectKey = sortedFocus[0];
        if (sortedFocus.length > 1) secondFocusSubjectKey = sortedFocus[1];
    } else if (student.weakSubject) {
        topFocusSubjectKey = student.weakSubject;
    }

    if (gradeRank) {
        // 성적이 가장 안 나오는(4위) 과목 = 취약점 보완 과목
        const sortedGrade = (Object.keys(gradeRank) as Array<keyof typeof gradeRank>)
            .sort((a, b) => (gradeRank[b] || 0) - (gradeRank[a] || 0));
        if (sortedGrade.length > 0) weakestGradeSubjectKey = sortedGrade[0];
    }

    const topSubjectName = labels[topFocusSubjectKey] || topFocusSubjectKey;
    const secondSubjectName = labels[secondFocusSubjectKey] || secondFocusSubjectKey;
    const weakestSubjectName = labels[weakestGradeSubjectKey] || weakestGradeSubjectKey;

    // 1. Morning Routine (07:00 - 09:00)
    schedule.push({
        time: "07:30 - 08:30",
        activity: "기상 및 뇌 깨우기 (Morning Ritual)",
        intensity: 'Low',
        desc: chronotype === 'morning' 
            ? `이미 각성도가 높은 상태입니다. 가벼운 영어/국어 어휘 인출 및 듣기로 뇌를 워밍업하세요.` 
            : `가장 취약한 시간대입니다. 스트레칭과 찬물 세안 후 가벼운 요약 노트로 물리적 각성을 유도하세요.`
    });

    // 2. The Golden Hour (Highest Focus) - 현재 1순위 집중 과목 킬러 공략
    schedule.push({
        time: `${goldenTimeStart} - ${goldenTimeEnd}`,
        activity: `🔥 골든타임 최우선 몰입: [${topSubjectName}] 심화 & 킬러 문항 정복`,
        intensity: 'High',
        desc: `[당장 1순위 집중 과목: ${topSubjectName}] 뇌의 연산 및 메타인지 처리 능력이 최고치인 시간대입니다. 타협 없이 고난도 문제와 개념 심화에 100% 집중하세요.`
    });

    // 3. Post-Lunch (Low Efficiency) - 성적 보완 또는 오답 분석
    schedule.push({
        time: "13:30 - 15:30",
        activity: `전략적 오답 분석 & 개념 보완: [${weakestSubjectName}]`,
        intensity: 'Medium',
        desc: `[성적 보완 과목: ${weakestSubjectName}] 식곤증과 각성도 저하가 겹치는 구간입니다. 단순 문제풀이 대신 오답 노트 정독, 해설 강의 시청 등 구조화된 피드백 학습을 진행합니다.`
    });

    // 4. Evening Session - 2순위 중요 과목 및 당일 복습
    schedule.push({
        time: "19:00 - 21:30",
        activity: `2순위 과목 [${secondSubjectName}] 및 당일 핵심 개념 백지 인출`,
        intensity: 'Medium',
        desc: isAdrenalOrBurnout
            ? "에너지가 고갈되기 쉬운 시간입니다. 과도한 문제풀이보다는 암기 및 핵심 개념 복습 위주로 진행하고, 피로감이 느껴지면 즉시 15분 휴식하세요."
            : `단기 기억을 장기 기억으로 전환하기 가장 좋은 골든 세션입니다. [${secondSubjectName}] 핵심 유형 정리 및 당일 배운 주요 과목 공식을 백지에 인출해 보세요.`
    });

    // 5. Pre-Sleep (Night Reflection)
    if (chronotype === 'evening' && !isAdrenalOrBurnout) {
        schedule.push({
            time: "22:00 - 23:30",
            activity: `제 2의 야간 골든타임: [${topSubjectName}] 고난도 피드백`,
            intensity: 'High',
            desc: "지속적인 야간 몰입이 가능한 올빼미형 타입입니다. 복잡한 논술이나 고난도 탐구 문제를 마무리하되, 최소 6.5시간의 수면을 엄수하세요."
        });
    } else {
        schedule.push({
            time: "22:00 - 23:00",
            activity: "하루 학습 정리, 두뇌 이완 및 숙면 루틴",
            intensity: 'Low',
            desc: isAdrenalOrBurnout
                ? "⚠️ **[필수] 밤 11시 수면**: 부신 기능 회복과 뇌 시냅스 정리를 위한 절대 데드라인입니다. 지금 취침해야 내일 집중력이 유지됩니다."
                : "뇌의 각성 스위치를 끄는 시간입니다. 내일의 플래너를 5분 내로 작성하고 블루라이트 차단 후 수면에 들어갑니다."
        });
    }

    return schedule;
};
