import { CareType, LearningAnalyticsData, SleepPrescription } from '../types';

export const generateSleepPrescription = (
  careType: CareType,
  analytics: LearningAnalyticsData
): SleepPrescription => {
  // Default values
  let targetSleepDuration = 7.5;
  let recommendedBedtime = "23:30";
  let recommendedWakeTime = "07:00";
  let sleepStrategy = "일반적인 수면 위생 가이드를 준수하세요.";
  let preSleepRoutine = [
    "취침 1시간 전 스마트폰 사용 자제",
    "미지근한 물로 샤워하기",
    "조명 어둡게 하기"
  ];
  let powerNap: { recommended: boolean; timing?: string; duration?: number } = { recommended: false };
  let chronotypeNotes = "";

  // 1. CareType 기반 수면 전략 설정
  switch (careType) {
    case CareType.BURNOUT:
    case CareType.STRESS_OVERLOAD:
      targetSleepDuration = 8.5;
      sleepStrategy = "교감신경 과활성 상태로 긴장을 푸는 것이 최우선입니다. 수면 시간 확보가 필수적입니다.";
      preSleepRoutine.unshift("취침 2시간 전부터 업무/학습 완전 중단");
      preSleepRoutine.push("심호흡 5분 (4-7-8 호흡법)");
      break;
    case CareType.LOW_ENERGY:
    case CareType.ADRENAL:
    case CareType.DEPRESSION_AMOTIVATION:
      targetSleepDuration = 8;
      sleepStrategy = "무기력 및 부신 피로 극복을 위해 일정한 기상 시간이 중요합니다. 낮 시간 파워 냅을 적극 활용하세요.";
      powerNap = { recommended: true, timing: "14:00 - 14:30", duration: 20 };
      break;
    case CareType.BRAIN_FATIGUE:
      targetSleepDuration = 7.5;
      sleepStrategy = "뇌 피로도 감소를 위해 논렘(Non-REM) 수면의 질을 높여야 합니다.";
      preSleepRoutine = [
        "취침 90분 전 스마트폰/태블릿 블루라이트 완전 차단",
        "침실 온도 시원하게 유지 (18~20도)",
        "명상 또는 ASMR 백색소음 청취"
      ];
      break;
    case CareType.SLEEP:
      targetSleepDuration = 7.0; // 수면 제한 요법 (너무 오래 눕지 않기)
      sleepStrategy = "불면증 인지행동치료(CBT-I) 기반 가이드: 잠자리에 눕는 시간을 제한하여 수면 효율을 높이세요.";
      preSleepRoutine = [
        "졸릴 때만 침대에 눕기",
        "침대에서는 수면 외 다른 활동 금지 (독서, 스마트폰 X)",
        "잠이 안 오면 일어나서 약한 조명 아래서 이완 활동하기"
      ];
      break;
    default:
      targetSleepDuration = 7.5;
      break;
  }

  // 2. Study Pattern(Chronotype) 기반 시간 설정
  if (analytics?.chronotype === 'morning') {
    recommendedBedtime = "22:30";
    recommendedWakeTime = "06:00";
    chronotypeNotes = "아침형 학습 패턴을 유지하기 위해 자정 전 취침이 매우 중요합니다.";
    if (analytics.lowEfficiencyTime) {
      powerNap = { recommended: true, timing: analytics.lowEfficiencyTime, duration: 20 };
    }
  } else if (analytics?.chronotype === 'evening') {
    recommendedBedtime = "01:00";
    recommendedWakeTime = "08:30";
    chronotypeNotes = "저녁형 패턴을 가지고 있으므로, 억지로 아침 일찍 일어나는 것보다 일관된 수면 사이클이 중요합니다.";
    preSleepRoutine.push("기상 직후 강한 빛을 쬐어 수면 관성 극복하기");
  } else {
    chronotypeNotes = "표준적인 생체 리듬을 가지고 있습니다. 안정적인 7~8시간 수면을 유지하세요.";
  }

  return {
    recommendedBedtime,
    recommendedWakeTime,
    targetSleepDuration,
    sleepStrategy,
    preSleepRoutine,
    powerNap,
    chronotypeNotes
  };
};
