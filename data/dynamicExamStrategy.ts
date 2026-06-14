import { IntegratedAssessment } from './integratedStudyEngine';
import { CareType } from '../types';

/**
 * 3단계 종합 진단 결과를 바탕으로 "오늘의 컨디션"에 맞춘 추가 실전 전략을 생성합니다.
 * 기존의 CareType 기반 정적 가이드에, 실시간 신체/정신 상태에 따른 긴급 처방을 더합니다.
 */
export const generateDynamicExamAdvice = (
    assessment: IntegratedAssessment,
    careType: CareType
): string => {
    const { physicalState, mentalArousal, stressScore, concentrationScore } = assessment;

    // 1. 신체 상태(Physical State)에 따른 긴급 처방
    let physicalAdvice = "";
    if (physicalState === 'sympathetic_dominant') {
        physicalAdvice = `
> **🔥 [신체 긴급 처방] 고에너지/긴장 상태 감지**
> 현재 심박과 호흡이 빠른 편입니다. 이는 시험 직전 **과도한 긴장**으로 이어질 수 있습니다.
> - **Action**: 시험지 받기 직전, **4초 들이쉬고 7초 멈추고 8초 내쉬는 호흡**을 3회만 실시하세요. 강제로 부교감신경을 켜야 실수를 막습니다.`;
    } else if (physicalState === 'parasympathetic_dominant') {
        physicalAdvice = `
> **🌙 [신체 긴급 처방] 저에너지/나른함 감지**
> 현재 신체가 다소 처져 있어, 시험 초반 **집중력 로딩 시간**이 길어질 수 있습니다.
> - **Action**: 시험 시작 전, **손바닥을 강하게 10번 마주치거나** 차가운 물을 한 모금 마셔 뇌를 깨우세요. 초반 5분간 의식적으로 **펜을 강하게 쥐고** 글씨를 또박또박 쓰는 것이 각성에 도움됩니다.`;
    }

    // 2. 정신 각성도(Mental Arousal)에 따른 문제 풀이 전략
    let mentalAdvice = "";
    if (mentalArousal === 'high_arousal') {
        mentalAdvice = `
> **🧠 [두뇌 각성도 최상] 공격적 풀이 권장**
> 현재 뇌의 연산 속도가 매우 빠릅니다. **1번부터 풀지 말고, 가장 자신 있는 고난도 지문/유형부터** 공략해도 좋습니다.
> - **Tip**: 머리 회전이 빨라 텍스트를 건너뛸 위험이 있으니, **키워드에 동그라미**를 치며 속도를 조절하세요.`;
    } else if (mentalArousal === 'low_arousal') {
        mentalAdvice = `
> **🐢 [두뇌 각성도 저하] 방어적 풀이 권장**
> 정보 처리 속도가 평소보다 느릴 수 있습니다. 어려운 문제에 매달리면 멘탈이 흔들립니다.
> - **Tip**: **무조건 쉬운 문제부터** 순서대로 풀며 뇌 예열 시간을 확보하세요. 모르는 문제는 과감히 별표 치고 넘어가는 **Pass 전략**이 평소보다 중요합니다.`;
    } else if (mentalArousal === 'emergency') {
        mentalAdvice = `
> **🚨 [두뇌 응급 모드] 휴식 우선**
> 현재 뇌 피로도가 극심합니다. 쉬는 시간에 단어장을 보지 말고 **무조건 눈을 감고 뇌를 차단**하세요.
> - **Tip**: 시험 중 멍해지면 30초간 펜을 놓고 **심호흡**만 하세요. 30초 투자가 남은 시간을 살립니다.`;
    }

    // 3. 종합 조언 (기존 CareType과의 조합 고려)
    // CareType이 '불안형'인데 '고각성' 상태라면 -> 실수 주의 강조
    let additionalTip = "";
    if ((careType === CareType.ANXIETY_TENSION || careType === CareType.STRESS_OVERLOAD) && physicalState === 'sympathetic_dominant') {
        additionalTip = `
> **⚠️ [주의] 과잉 각성 경보**
> 불안 성향과 현재의 신체 긴장이 겹쳐 **'급발진 실수'**(문제를 다 읽지 않고 답 찍기) 위험이 있습니다.
> - **Check**: 선지를 고를 때 **"이게 답인 근거가 지문에 어디 있지?"**라고 마음속으로 한 번만 물어보세요.`;
    }

    // 내용이 있을 때만 섹션 생성
    if (!physicalAdvice && !mentalAdvice && !additionalTip) return "";

    return `
### ⚡ [오늘의 실시간 컨디션 맞춤 전략]
_※ 현재 측정된 3단계 정밀 진단 결과를 반영한 긴급 처방입니다._

${physicalAdvice}
${mentalAdvice}
${additionalTip}
    `.trim();
};
