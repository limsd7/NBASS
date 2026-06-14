import { StudentInfo, HRVData, SurveyData, ProtocolData, LearningAnalyticsData, CareType } from "../types";

// Helper to format time (e.g., 10:00)
const formatTime = (hour: number, minute: number = 0): string => {
    const h = hour < 10 ? `0${hour}` : `${hour}`;
    const m = minute < 10 ? `0${minute}` : `${minute}`;
    return `${h}:${m}`;
};

export const generateBrainPeakTimeSchedule = (
    student: StudentInfo,
    hrv: HRVData,
    survey: SurveyData,
    protocol: ProtocolData,
    analytics: LearningAnalyticsData,
    careType: CareType,
    bloodTest?: any
): string => {

    // 1. Determine Chronotype (Basic)
    // Assuming standard wake up if not provided: 07:00
    // This could be refined with actual sleep data if available in SurveyData
    let wakeTime = 7;
    let sleepTime = 24; // 12 AM

    // Adjust based on some heuristics if available, otherwise use defaults or analyze patterns
    // For now, we'll use a standard model essential for the report structure 

    // 2. Analyze Biological Peaks & Troughs
    // Peak Focus (Golden Hour): Usually 3-4 hours after waking for morning types, or late night for night owls.
    // However, we use HRV/EEG to refine this.
    // If SNS is high (Acute Stress), peak might be earlier but short.
    // If Brain Fatigue is high, peak is broken.

    const isMorningType = wakeTime <= 7;

    // Logic for Golden Hour Assignment
    let goldenHourStart = isMorningType ? 10 : 14;

    // [MODIFIED] Use Analytics Data as Source of Truth if available
    // UI와 리포트의 시간 불일치를 방지하기 위해, 저장된 analytics 데이터를 우선 사용합니다.
    if (analytics.goldenTimeStart) {
        const parsedHour = parseInt(analytics.goldenTimeStart.split(':')[0], 10);
        if (!isNaN(parsedHour)) {
            goldenHourStart = parsedHour;
        }
    }

    let goldenHourEnd = goldenHourStart + 2;

    // Adjust Golden Hour based on HRV/EEG (Only if we are using the heuristic, 
    // BUT if we forced it from analytics, we should probably stick to analytics to match UI.
    // However, to keep rich text accuracy, we can keep the extension logic IF it doesn't contradict the start time heavily.
    // For safety/consistency with UI, let's keep the duration aligned with the typical 2-3 hour block.)
    if (hrv.brainScore && hrv.brainScore > 70) {
        // High balance means they can sustain longer peaks
        goldenHourEnd += 1;
    }

    // Logic for Slump Time (Brain Fog)
    // Typically 4 hours after Golden Hour Start (approx lunch time relative to schedule)
    // Adjusted to be logically consistent with the Golden Hour
    let slumpStart = goldenHourStart + 4;
    let slumpEnd = slumpStart + 1;

    // Logic for Second Wind (Late afternoon/Evening peak)
    // Typically 2 hours after Slump End
    let secondWindowStart = slumpEnd + 2;

    // 3. Subject Allocation Logic
    // High Focus (Golden Hour) -> Weakest Subject or Math/Logic
    // Low Focus (Slump) -> Listening, Simple Memorization, Routine
    // Recovery -> Rest / Stretching

    // Priority Subject determination
    const subjects = analytics.subjectRatios;
    // Simple heuristic: subject with lowest ratio might need more focus OR subject identified as weak in survey
    // For this generic engine, we'll assign 'High Cognitive Load' tasks to Golden Hour.

    // 4. Incorporate Blood/Nutrition Data
    const hasLowVitD = bloodTest?.vitaminD && bloodTest.vitaminD < 30;
    const hasLowIron = bloodTest?.hemoglobin && bloodTest.hemoglobin < 13;
    const hasSugarCrashRisk = bloodTest?.hba1c && bloodTest.hba1c >= 5.7;

    let nutritionAdvice = "";
    if (hasSugarCrashRisk) {
        nutritionAdvice = "⚠️ **[혈당 주의]** 식곤증 위험이 높습니다. 점심 식사 시 탄수화물을 줄이고 단백질 비중을 늘리세요.";
    } else if (hasLowIron) {
        nutritionAdvice = "🩸 **[산소 공급]** 철분 부족으로 오후 두통이 올 수 있습니다. 환기가 잘 되는 곳에서 공부하세요.";
    }

    // Constructing the Timeline
    // We will create a rich table-like structure using Markdown

    // Last validation check for CareType
    const isBurnout = careType === CareType.BURNOUT || careType === CareType.LOW_ENERGY;

    // Correcting the return string generation at the end
    const schedule = `
## [4-2] 🕒 최적 두뇌 가동 골든타임표 (Brain Peak Time Schedule)

수험생의 생체 리듬(Bio-Rhythm)과 뇌파/자율신경 상태를 분석하여 도출된 **하루 중 뇌 효율이 가장 높은 골든타임**과 **뇌 휴식이 필요한 브레인 포그(Brain Fog)** 시간대입니다. 이 흐름에 맞춰 공부 난이도를 배분하면 학습 효율이 극대화됩니다.

### 🌞 오전 루틴 (Morning Activation)
- **07:00 - 08:00 [Brain Wake-up]**: 기상 직후 코르티솔 분비 활성화. 미지근한 물 한 잔 + 가벼운 스트레칭으로 뇌 혈류량을 높이세요.
- **08:00 - 10:00 [Warm-up Mode]**: 뇌가 완전히 깨어나는 예열 시간입니다. 국어 지문 읽기나 영어 듣기 등 감각을 깨우는 학습을 배치하세요.

### 🔥 골든 아워 (Golden Hour) : **${formatTime(goldenHourStart)} ~ ${formatTime(goldenHourEnd)}**
> **💡 오늘의 승부처**: 하루 중 집중력(M-Beta)과 인지 능력(Gamma)이 최고조에 달하는 시간입니다.
- **추천 과목**: **수학 킬러 문항 / 과학 탐구 / 복합 추론 문제**
- **전략**: 휴대폰을 격리하고 방해 요소가 없는 'Deep Work' 환경을 만드세요. 이 시간의 1시간은 평소의 3시간 효율과 같습니다.

### ☁️ 브레인 포그 & 회복 (Slump & Recovery) : **${formatTime(slumpStart)} ~ ${formatTime(slumpEnd)}**
> **💤 휴식 시그널**: 식후 소화 작용으로 부교감신경이 항진되어 졸음이 오는 구간입니다. 억지로 공부하면 뇌에 피로물질(아데노신)만 쌓입니다.
- **추천 활동**: ${nutritionAdvice ? nutritionAdvice : "15분 파워 낮잠(Power Nap) 또는 산책. 눈을 감고 시각 정보를 차단하여 뇌를 쉬게 하세요."}
- **학습 추천**: 인강 시청(배속 금지), 오답 노트 정리 등 수동적인 학습이나 단순 암기.

### 🚀 2차 골든 아워 (Second Wind) : **${formatTime(secondWindowStart)} ~ 22:00**
- **16:00 - 19:00 [Logial Thinking]**: 체온이 다시 오르며 각성도가 회복되는 시기입니다. 영어 독해나 취약 과목 보완 학습을 진행하세요.
${hasLowVitD ? "- **[영양 처방]**: 16:00경 비타민D 합성을 위해 창가에서 공부하거나 영양제를 섭취하여 활력을 부스팅하세요.\n" : ""}
- **20:00 - 22:00 [Memory Consolidation]**: 하루 동안 학습한 내용을 장기 기억으로 저장하는 '해마 활성화' 골든타임입니다. 새로운 학습보다는 복습 위주로 진행하세요.

### 🌙 수면 전 루틴 (Pre-Sleep Routine)
- **23:00 ~ [Sleep Hygiene]**: 멜라토닌 분비를 위해 블루라이트(스마트폰)를 차단하세요. 오늘 외운 영단어나 탐구 개념을 가볍게 훑어보고 잠자리에 들면 자는 동안 기억이 강화됩니다.

---
**💡 닥터 뇌/과학 코멘트**: ${isBurnout ? "현재 **'번아웃/고갈형'** 상태이므로 골든 아워에도 50분 공부/10분 휴식 원칙을 철저히 지켜야 합니다. 무리한 연속 학습은 다음 날 뇌 효율을 급락시킵니다." : "현재 뇌 컨디션이 양호합니다. 골든 아워 시간을 30분씩 늘려가며 한계 돌파 훈련을 시도해보세요."}
    `.trim();

    return schedule;
};
