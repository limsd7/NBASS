
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
    const { goldenTimeStart, goldenTimeEnd, chronotype, subjectRatios } = analytics;
    const weakSubject = student.weakSubject || 'math';
    const isAdrenalOrBurnout = careType === CareType.ADRENAL || careType === CareType.BURNOUT || careType === CareType.STRESS_OVERLOAD;

    // Helper to map subject keys to Korean
    const labels: Record<string, string> = {
        korean: '국어', math: '수학', english: '영어', science: '과학', social: '사회', other: '기타'
    };

    // 1. Morning Routine (07:00 - 09:00)
    schedule.push({
        time: "07:30 - 08:30",
        activity: "기상 및 뇌 깨우기 (Ritual)",
        intensity: 'Low',
        desc: chronotype === 'morning' ? "이미 각성도가 높은 상태입니다. 가벼운 영어 듣기로 시작하세요." : "가장 취약한 시간대입니다. 스트레칭과 찬물 세안으로 물리적 각성을 유도하세요."
    });

    // 2. The Golden Hour (Highest Focus)
    schedule.push({
        time: `${goldenTimeStart} - ${goldenTimeEnd}`,
        activity: `최고 몰입: ${labels[weakSubject]} 심화 학습`,
        intensity: 'High',
        desc: "뇌의 연산 능력이 최고치인 시간대입니다. 가장 어렵거나 회피하고 싶은 취약 과목의 킬러 문항을 배치하세요."
    });

    // 3. Post-Lunch (Low Efficiency)
    schedule.push({
        time: "13:30 - 15:30",
        activity: "수동적 학습 및 오답 정리",
        intensity: 'Medium',
        desc: "식곤증과 각성도 저하가 겹치는 구간입니다. 인강 시청이나 이미 풀었던 문제의 오답 분석 등 눈으로 하는 공부를 권장합니다."
    });

    // 4. Evening Session
    schedule.push({
        time: "19:00 - 21:30",
        activity: "암기 과목 및 당일 복습",
        intensity: 'Medium',
        desc: isAdrenalOrBurnout
            ? "에너지가 고갈되기 쉬운 시간입니다. 과도한 학습보다는 가벼운 암기 위주로 진행하고, 피로감이 느껴지면 즉시 휴식하세요."
            : "단기 기억을 장기 기억으로 전환하기 좋은 시간입니다. 탐구 영역 암기나 그날 배운 핵심 개념을 백지에 인출해 보세요."
    });

    // 5. Pre-Sleep (Night Reflection)
    if (chronotype === 'evening' && !isAdrenalOrBurnout) {
        schedule.push({
            time: "22:00 - 23:30",
            activity: "제 2의 골든타임: 창의적 문제풀이",
            intensity: 'High',
            desc: "지속적인 야간 몰입이 가능한 타입입니다. 어려운 논술이나 고난도 수학 문제를 배치하되, 수면 시간을 확보하세요."
        });
    } else {
        schedule.push({
            time: "22:00 - 23:00",
            activity: "하루 정리 및 수면 준비",
            intensity: 'Low',
            desc: isAdrenalOrBurnout
                ? "⚠️ **[필수] 밤 11시 수면**: 부신 기능 회복을 위한 절대적인 데드라인입니다. 지금 자야 내일의 뇌가 작동합니다."
                : "뇌의 스위치를 끄는 시간입니다. 내일의 플래너를 작성하고 뇌파 안정을 위해 전자기기 사용을 중단하세요."
        });
    }

    return schedule;
};
