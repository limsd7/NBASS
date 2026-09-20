import { CareType } from '../types';

type BmiCategory = 'underweight' | 'normal' | 'overweight';

export interface BmiStrategy {
  title: string;
  sections: {
    heading: string;
    content: string;
  }[];
}

// 12가지 CareType에 대한 세분화된 전략 컨텐츠 생성

// 1. 기본 템플릿 (HEALTHY - User Provided Text)
const HEALTHY_STRATEGY: Record<BmiCategory, BmiStrategy> = {
  underweight: {
    title: "학습 에너지를 충전하라",
    sections: [
      {
        heading: "그룹 특성",
        content: "신체 에너지 비축량이 적어 오후 시간 집중력이 급격히 떨어질 수 있는 그룹입니다."
      },
      {
        heading: "영양과 집중력",
        content: "뇌는 포도당을 주 연료로 사용합니다. 규칙적인 식사를 통해 공부에 필요한 '두뇌 연료'를 지속적으로 공급해 주세요."
      },
      {
        heading: "지구력 강화",
        content: "기초 체력이 부족하면 장시간 앉아 공부할 때 허리나 목의 근육 피로가 빨리 옵니다. 단백질 섭취와 근력 운동으로 공부 지구력을 키우세요."
      },
      {
        heading: "휴식 전략",
        content: "에너지 소모가 빠르므로 50분 공부 후 반드시 10분간 고열량 간식(견과류 등)을 섭취하며 뇌의 피로를 풀어주는 것이 좋습니다."
      }
    ]
  },
  normal: {
    title: "현재의 리듬을 유지하고 최적화하라",
    sections: [
      {
        heading: "그룹 특성",
        content: "학습을 위한 생체 리듬 유지에 최적화된 신체 상태입니다."
      },
      {
        heading: "최상의 컨디션 유지",
        content: "현재의 신체 밸런스는 뇌가 가장 활발하게 움직일 수 있는 상태입니다. 규칙적인 수면 리듬을 통해 이 컨디션을 시험 기간까지 유지하세요."
      },
      {
        heading: "혈액 순환과 뇌 기능",
        content: "공부 전 가벼운 스트레칭이나 산책은 뇌로 가는 혈류량을 늘려 암기력을 높여줍니다."
      },
      {
        heading: "멘탈 관리",
        content: "신체적 안정감이 정서적 안정감으로 이어집니다. 지금의 건강한 식습관이 시험 불안을 줄여주는 기초가 됩니다."
      }
    ]
  },
  overweight: {
    title: "몸을 가볍게, 머리는 맑게",
    sections: [
      {
        heading: "그룹 특성",
        content: "혈당 변화가 심하거나 신체적 무거움으로 인해 졸음이나 무기력증을 느끼기 쉬운 그룹입니다."
      },
      {
        heading: "식곤증 관리",
        content: "과도한 탄수화물 섭취는 혈당을 급격히 높여 졸음을 유발합니다. 집중력이 중요한 시간에는 당분이 적은 식단을 선택해 맑은 정신을 유지하세요."
      },
      {
        heading: "산소 공급과 뇌 깨우기",
        content: "체중이 높으면 호흡이 얕아져 뇌에 산소 공급이 부족해질 수 있습니다. 틈틈이 심호흡을 하고 환기를 시켜 뇌를 깨워주세요."
      },
      {
        heading: "염증과 기억력",
        content: "비만은 몸속 미세 염증을 유발해 뇌 기능을 저하시킬 수 있습니다. 항산화 식품(채소, 과일) 섭취와 활동량 늘리기로 기억력을 보호하세요."
      },
      {
        heading: "수면의 질",
        content: "체중은 수면 무호흡이나 코골이를 유발해 잠을 자도 피곤하게 만듭니다. 수면의 질이 낮으면 학습 효율도 떨어지므로 적정 체중 관리가 곧 성적 관리입니다."
      }
    ]
  }
};

// ==========================================
// 2. CareType별 변형 로직 (Variation Logic)
// ==========================================

// Helper to deep copy and modify
const createStrategy = (
  base: Record<BmiCategory, BmiStrategy>,
  modifiers: Partial<Record<BmiCategory, Partial<BmiStrategy>>>
): Record<BmiCategory, BmiStrategy> => {
  const newStrategy = JSON.parse(JSON.stringify(base));
  Object.keys(modifiers).forEach(k => {
    const key = k as BmiCategory;
    if (modifiers[key]) {
      // Merge title if provided
      if (modifiers[key]!.title) newStrategy[key].title = modifiers[key]!.title;
      // Replace sections if provided
      if (modifiers[key]!.sections) {
        // Instead of full replace, let's map by heading if we want smart replace, but full replace is safer for specific text
        newStrategy[key].sections = modifiers[key]!.sections;
      }
    }
  });
  return newStrategy;
};

// A. Exhaustion Group (Burnout, Adrenal, Low Energy) - Focus on Recovery & Easy nutrition
const EXHAUSTION_STRATEGY = createStrategy(HEALTHY_STRATEGY, {
  underweight: {
    title: "고갈된 에너지를 충전하라 (회복 중심)",
    sections: [
      { heading: "영양과 집중력", content: "소화력이 약해져 있습니다. 죽이나 스프 처럼 소화가 잘 되는 따뜻한 고영양식으로 뇌 에너지를 부드럽게 채워주세요." },
      { heading: "지구력 강화", content: "무리한 운동은 오히려 독이 됩니다. 가벼운 맨손 체조나 걷기로 혈류량만 유지해도 충분합니다. 에너지를 아껴 공부에 쓰세요." },
      { heading: "휴식 전략", content: "50분 공부가 버겁다면 30분 공부, 5분 휴식으로 주기를 짧게 가져가세요. 휴식 때는 눈을 감고 시각 정보를 차단하세요." }
    ]
  },
  normal: {
    title: "현재의 에너지를 보호하고 회복하라",
    sections: [
      { heading: "최상의 컨디션 회복", content: "현재 체중은 정상이지만, 에너지가 고갈된 상태입니다. '더 하는 것'보다 '덜 하는 것'이 성적 향상의 지름길입니다. 수면 시간을 1시간 더 확보하세요." },
      { heading: "혈액 순환과 뇌 기능", content: "뇌 피로도가 높습니다. 멍한 상태에서는 스트레칭보다 '멍 때리기(Brain Rest)'가 뇌 회복에 더 도움이 됩니다." },
      { heading: "멘탈 관리", content: "몸이 힘들면 마음도 무너집니다. 지금 느끼는 불안감은 내 실력이 아니라 '피로' 때문임을 기억하세요." }
    ]
  },
  overweight: {
    title: "몸의 부담을 줄여 뇌를 살려라",
    sections: [
      { heading: "식곤증 관리", content: "피로할수록 단 것이 당기지만, 이는 '혈당 스파이크'를 불러와 더 큰 피로를 만듭니다. 간식 대신 물 한 잔을 드세요." },
      { heading: "산소 공급과 뇌 깨우기", content: "피로로 인해 자세가 구부정해지고 호흡이 얕아집니다. 의식적으로 어깨를 펴고 깊게 숨을 쉬어 뇌에 산소를 보내세요." },
      { heading: "염증과 기억력", content: "체내 염증과 피로가 겹치면 기억력이 급감합니다. 인스턴트 식품을 끊는 것만으로도 머리가 맑아지는 것을 느낄 수 있습니다." },
      { heading: "수면의 질", content: "코골이는 만성 피로의 주범입니다. 옆으로 누워 자거나 베개 높이를 조절하여 수면 중 산소 공급을 원활하게 해주세요." }
    ]
  }
});

// B. High Stress Group (Anxiety, Stress Overload, Hypersensitive) - Focus on Calming & Stability
const STRESS_STRATEGY = createStrategy(HEALTHY_STRATEGY, {
  underweight: {
    title: "예민한 신경을 달래고 에너지를 채워라",
    sections: [
      { heading: "영양과 집중력", content: "긴장하면 소화가 안 되고 입맛이 떨어질 수 있습니다. 조금씩 자주 먹어 뇌 에너지가 떨어지지 않게 하세요. 카페인은 불안을 증폭시키니 피하세요." },
      { heading: "지구력 강화", content: "근육이 과도하게 긴장되어 있습니다. 운동보다는 따뜻한 물 목욕이나 스트레칭으로 굳은 몸을 이완시키는 것이 지구력 유지에 좋습니다." },
      { heading: "휴식 전략", content: "휴식 시간에는 스마트폰을 멀리하세요. 뇌가 쉴 수 있도록 좋아하는 음악을 듣거나 눈을 감고 명상을 하는 것이 좋습니다." }
    ]
  },
  normal: {
    title: "긴장을 낮추고 몰입을 높여라",
    sections: [
      { heading: "최상의 컨디션 유지", content: "신체 밸런스는 좋으나 신경이 날카롭습니다. 규칙적인 식사와 수면은 정서적 예민함을 낮추는 가장 강력한 처방입니다." },
      { heading: "혈액 순환과 뇌 기능", content: "스트레스로 인해 어깨나 뒷목이 굳기 쉽습니다. 1시간마다 목 스트레칭을 해주면 뇌로 가는 혈류가 개선되어 머리가 맑아집니다." },
      { heading: "멘탈 관리", content: "불안할수록 몸을 움직이세요. 가벼운 산책이나 정리 정돈은 복잡한 머릿속을 비우고 안정감을 줍니다." }
    ]
  },
  overweight: {
    title: "스트레스성 식욕을 잡고 집중하라",
    sections: [
      { heading: "식곤증 및 식욕 관리", content: "스트레스를 받으면 폭식할 위험이 있습니다. 씹는 행위가 뇌를 깨우므로, 껌을 씹거나 아삭한 채소 스틱을 간식으로 활용하세요." },
      { heading: "산소 공급과 뇌 깨우기", content: "긴장하면 호흡이 빨라지고 얕아집니다. 4초간 들이마시고 6초간 내뱉는 '이완 호흡'으로 뇌에 산소를 충분히 공급하세요." },
      { heading: "염증과 기억력", content: "스트레스 호르몬은 뱃살의 원인이 됩니다. 복부 비만은 염증을 유발해 집중력을 떨어뜨리니, 야식은 절대 금물입니다." },
      { heading: "수면의 질", content: "잡생각으로 잠들기 어려울 수 있습니다. 자기 전 따뜻한 우유 한 잔이나 족욕으로 신경을 이완시켜 숙면을 유도하세요." }
    ]
  }
});

// C. Cognitive Group (Brain Fatigue, Attention Deficit) - Focus on Brain Fuel & Stimulation control
const COGNITIVE_STRATEGY = createStrategy(HEALTHY_STRATEGY, {
  underweight: {
    sections: [
      { heading: "영양과 집중력", content: "산만함은 뇌 에너지가 부족하다는 신호일 수 있습니다. 아침 식사는 필수이며, 포도당 캔디나 초콜릿 등을 활용해 즉각적인 에너지를 보충하세요." },
      { heading: "지구력 강화", content: "오래 앉아 있는 힘이 부족할 수 있습니다. 코어 근육을 키워 자세를 바로잡으면 집중력이 20% 이상 향상됩니다." },
      { heading: "휴식 전략", content: "뇌가 금방 지칩니다. 25분 공부, 5분 휴식(뽀모도로) 기법을 활용하여 짧고 굵게 집중하는 훈련을 하세요." }
    ]
  },
  normal: {
    sections: [
      { heading: "최상의 컨디션 유지", content: "신체 상태는 좋으나 뇌 효율이 떨어질 수 있습니다. 일정한 시간에 자고 일어나는 '수면 루틴'이 뇌 기능을 최적화하는 열쇠입니다." },
      { heading: "혈액 순환과 뇌 기능", content: "졸릴 때는 서서 공부하거나 소리 내어 읽으세요. 감각을 자극하면 뇌가 깨어나고 암기력이 높아집니다." },
      { heading: "멘탈 관리", content: "작은 성공 경험이 중요합니다. 거창한 계획보다 '오늘 단어 10개' 처럼 실현 가능한 목표를 세워 성취감을 맛보세요." }
    ]
  },
  overweight: {
    sections: [
      { heading: "식곤증 관리", content: "배부름은 집중력의 적입니다. 식사는 80%만 채우고, 탄수화물을 줄여야 식곤증 없이 맑은 정신으로 오후 공부를 할 수 있습니다." },
      { heading: "산소 공급과 뇌 깨우기", content: "뇌가 몽롱할 때는 환기가 답입니다. 찬 바람을 쐬거나 찬물 세수를 하여 뇌 온도를 낮추면 각성 효과가 있습니다." },
      { heading: "염증과 기억력", content: "과체중은 뇌 혈류 순환을 방해합니다. 하루 30분 유산소 운동은 뇌 유래 신경영양인자(BDNF)를 생성해 기억력을 높여줍니다." },
      { heading: "수면의 질", content: "낮 동안의 충분한 햇빛 쬐기는 밤에 멜라토닌 분비를 도와 숙면을 유도하고, 결과적으로 다음 날 집중력을 높여줍니다." }
    ]
  }
});


// Strategy Mapping used by helper
const strategyData: Record<CareType, Record<BmiCategory, BmiStrategy>> = {
  [CareType.HEALTHY]: HEALTHY_STRATEGY,
  [CareType.CIRCULATION]: HEALTHY_STRATEGY, // Similar to healthy but maybe tweak later

  [CareType.BURNOUT]: EXHAUSTION_STRATEGY,
  [CareType.ADRENAL]: EXHAUSTION_STRATEGY,
  [CareType.LOW_ENERGY]: EXHAUSTION_STRATEGY,
  [CareType.DEPRESSION_AMOTIVATION]: EXHAUSTION_STRATEGY,

  [CareType.ANXIETY_TENSION]: STRESS_STRATEGY,
  [CareType.STRESS_OVERLOAD]: STRESS_STRATEGY,
  [CareType.HYPERSENSITIVE]: STRESS_STRATEGY,

  [CareType.BRAIN_FATIGUE]: COGNITIVE_STRATEGY,
  [CareType.ATTENTION_DEFICIT]: COGNITIVE_STRATEGY,
  [CareType.CONCENTRATION]: COGNITIVE_STRATEGY, // Legacy support
  [CareType.SLEEP]: EXHAUSTION_STRATEGY, // Sleep issues often lead to similar needs as burnout

  [CareType.UNASSESSED]: HEALTHY_STRATEGY
};

const getBmiCategory = (bmi: number): BmiCategory => {
  if (bmi < 18.5) return 'underweight';
  if (bmi < 23) return 'normal'; // 18.5 <= bmi < 23
  return 'overweight'; // bmi >= 23
};

/**
 * 학생의 BMI와 CareType에 맞는 상세한 BMI 전략을 반환
 */
export const getBmiStrategy = (student: { bmi?: number; height?: number; weight?: number }, careType: CareType): BmiStrategy => {
  const hasValidBmi = student.bmi !== undefined && student.bmi > 0;
  const hasHeight = student.height !== undefined && student.height > 0;

  // 신체 정보 미입력인 경우: 왜곡된 BMI 0.0 저체중 판정 대신 균형 잡힌 표준 컨디션 유지 가이드 제공
  if (!hasValidBmi || !hasHeight) {
    return {
      title: "규칙적인 식습관과 균형 잡힌 신체 컨디션 유지 (신체 정보 미입력)",
      sections: [
        {
          heading: "기초 영양과 두뇌 에너지",
          content: "뇌는 하루 에너지 소모량의 20%를 포도당으로 사용합니다. 규칙적인 3끼 식사와 충분한 수분 섭취로 두뇌 활성도를 일정하게 유지하세요."
        },
        {
          heading: "식곤증 및 집중력 방어",
          content: "정제 탄수화물이나 단순 당류 위주의 급격한 혈당 스파이크를 피하고, 단백질과 식이섬유 중심의 식단으로 오후 집중 저하를 방어하세요."
        },
        {
          heading: "혈액 순환과 스트레칭",
          content: "장시간 착석 학습 시 50분마다 가벼운 스트레칭과 심호흡으로 뇌 혈류량을 공급해 주면 기억 인출 속도가 크게 향상됩니다."
        }
      ]
    };
  }

  const bmi = student.bmi!;
  const category = getBmiCategory(bmi);

  // Select Strategy Bundle
  let strategies = strategyData[careType];
  // Fallback if not mapped
  if (!strategies) strategies = strategyData[CareType.HEALTHY];

  // Select Specific Strategy
  let strategy = strategies[category];
  if (!strategy) strategy = strategies.normal;

  // Clone to avoid mutation
  const finalStrategy: BmiStrategy = JSON.parse(JSON.stringify(strategy));

  // Dynamic Title Injection for Normal Weight as requested
  if (category === 'normal') {
    finalStrategy.title += ` (BMI ${bmi.toFixed(1)}: 최적의 학습 컨디션)`;
    finalStrategy.sections[0].content = `현재 BMI ${bmi.toFixed(1)}로 학습하기에 가장 이상적인 체중입니다. 지금의 체중(±1kg)을 유지하는 것이 피로 관리와 체력 유지에 유리합니다. ${finalStrategy.sections[0].content}`;
  } else if (category === 'underweight') {
    const targetMin = (18.5 * (student.height || 170) / 100 * (student.height || 170) / 100).toFixed(1);
    finalStrategy.title += ` (BMI ${bmi.toFixed(1)}: 에너지 보충 필요)`;
    finalStrategy.sections[0].content = `현재 BMI가 ${bmi.toFixed(1)}로, 목표 체중 약 ${targetMin}kg까지 증량하면 학습 지구력이 크게 향상될 것입니다. ${finalStrategy.sections[0].content}`;
  } else if (category === 'overweight') {
    finalStrategy.title += ` (BMI ${bmi.toFixed(1)}: 컨디션 관리 필요)`;
    finalStrategy.sections[0].content = `현재 BMI ${bmi.toFixed(1)}입니다. 무리한 다이어트보다는, 야식을 줄이고 식사량을 10%만 줄여도 학습 효율이 올라갑니다. ${finalStrategy.sections[0].content}`;
  }

  return finalStrategy;
};
