import { LearningTraitsData, LearningTraitsScores, CareType, SurveyData } from '../types';

export type { LearningTraitsData, LearningTraitsScores };

export interface TraitQuestion {
  id: number;
  category: keyof LearningTraitsScores;
  categoryName: string;
  categoryIcon: string;
  question: string;
  detail: string;
}

export const LEARNING_TRAITS_CATEGORIES: {
  key: keyof LearningTraitsScores;
  name: string;
  englishName: string;
  icon: string;
  color: string;
  description: string;
}[] = [
  {
    key: 'gritPlan',
    name: '끈기 & 실행력',
    englishName: 'Grit & Execution',
    icon: '🎯',
    color: 'emerald',
    description: '목표 지속성, 일일 계획 준수율, 외부 유혹 통제력'
  },
  {
    key: 'mentalResilience',
    name: '멘탈 & 회복탄력성',
    englishName: 'Mental Resilience',
    icon: '🛡️',
    color: 'blue',
    description: '오답/시험 불안 제어, 슬럼프 극복 태도, 자기효능감'
  },
  {
    key: 'temperament',
    name: '탐구 & 도전 기질',
    englishName: 'Exploration & Drive',
    icon: '⚡',
    color: 'purple',
    description: '새로운 고난도 킬러 문제 도전 선호도 및 지적 호기심'
  },
  {
    key: 'metaCognition',
    name: '메타인지 전략',
    englishName: 'Metacognitive Strategy',
    icon: '🔍',
    color: 'indigo',
    description: '아는 것과 모르는 것의 명확한 구분, 능동적 오답 분석'
  },
  {
    key: 'internalMotivation',
    name: '내재동기 & 몰입환경',
    englishName: 'Internal Motivation',
    icon: '🔥',
    color: 'amber',
    description: '스스로 깨닫는 성취감, 독립적 심층 몰입 환경 선호'
  }
];

export const LEARNING_TRAITS_QUESTIONS: TraitQuestion[] = [
  // 1. 끈기 및 실행력 (Grit & Plan)
  {
    id: 1,
    category: 'gritPlan',
    categoryName: '끈기 & 실행력',
    categoryIcon: '🎯',
    question: '정해진 일일 학습 분량과 계획은 피곤하거나 유혹이 있어도 끝까지 완수하려 한다.',
    detail: '학습 계획 준수 의지와 자기 통제력'
  },
  {
    id: 2,
    category: 'gritPlan',
    categoryName: '끈기 & 실행력',
    categoryIcon: '🎯',
    question: '한 번 시작한 과목이나 문제집은 중간에 쉽게 포기하지 않고 끝까지 마친다.',
    detail: '장기 과제 완주력과 노력의 지속성'
  },
  {
    id: 3,
    category: 'gritPlan',
    categoryName: '끈기 & 실행력',
    categoryIcon: '🎯',
    question: '스마트폰, SNS 등 주변의 방해 요인이 있어도 스스로 학습 환경을 통제할 수 있다.',
    detail: '즉각적 충동 조절 및 환경 통제력'
  },

  // 2. 멘탈 & 회복탄력성 (Resilience)
  {
    id: 4,
    category: 'mentalResilience',
    categoryName: '멘탈 & 회복탄력성',
    categoryIcon: '🛡️',
    question: '어려운 문제를 틀리거나 성적이 기대에 못 미쳐도 자책하기보다 원인을 분석하고 다시 도전한다.',
    detail: '실패에 대한 학습적 회복탄력성과 성장 마인드셋'
  },
  {
    id: 5,
    category: 'mentalResilience',
    categoryName: '멘탈 & 회복탄력성',
    categoryIcon: '🛡️',
    question: '시험 전이나 실전 모의고사에서 긴장과 불안을 다스리고 집중의 에너지로 바꿀 수 있다.',
    detail: '시험 불안 조절 및 스트레스 내성'
  },
  {
    id: 6,
    category: 'mentalResilience',
    categoryName: '멘탈 & 회복탄력성',
    categoryIcon: '🛡️',
    question: '주변 친구들의 진도나 성적 비교에 흔들리지 않고 나의 페이스를 유지한다.',
    detail: '정서적 독립성과 학습 자존감'
  },

  // 3. 탐구 & 도전 기질 (Temperament)
  {
    id: 7,
    category: 'temperament',
    categoryName: '탐구 & 도전 기질',
    categoryIcon: '⚡',
    question: '단순 반복 연습보다 낯선 신유형이나 고난도 킬러 문제에 도전할 때 더 깊이 몰입된다.',
    detail: '인지적 자극 추구 및 심화 문제 선호도'
  },
  {
    id: 8,
    category: 'temperament',
    categoryName: '탐구 & 도전 기질',
    categoryIcon: '⚡',
    question: '공부할 때 원리나 배경이 충분히 납득되어야 다음 단계로 자연스럽게 넘어갈 수 있다.',
    detail: '개념적 인과관계 추구 성향'
  },
  {
    id: 9,
    category: 'temperament',
    categoryName: '탐구 & 도전 기질',
    categoryIcon: '⚡',
    question: '여러 과목을 전략적으로 교차하며 배울 때 지루함 없이 뇌의 회전이 빨라진다.',
    detail: '다채로운 인지 전환 및 멀티 과목 학습 선호'
  },

  // 4. 메타인지 전략 (Meta-Strategy)
  {
    id: 10,
    category: 'metaCognition',
    categoryName: '메타인지 전략',
    categoryIcon: '🔍',
    question: '공부하면서 내가 \'확실히 아는 것\'과 \'애매하게 아는 것\'을 명확히 구분하며 체크한다.',
    detail: '지식 상태 자기 모니터링 능력'
  },
  {
    id: 11,
    category: 'metaCognition',
    categoryName: '메타인지 전략',
    categoryIcon: '🔍',
    question: '틀린 문제를 볼 때 단순 해설 암기에 그치지 않고 \'왜 이 방식으로 생각했는가\'를 분석한다.',
    detail: '심층 오답 원인 분석 및 사고 오류 교정'
  },
  {
    id: 12,
    category: 'metaCognition',
    categoryName: '메타인지 전략',
    categoryIcon: '🔍',
    question: '남에게 설명해보거나 백지에 요약하는 등 스스로 인출(Retrieval)해보는 공부를 즐긴다.',
    detail: '능동적 인출 훈련 및 개념 구조화'
  },

  // 5. 내재동기 & 몰입환경 (Motivation)
  {
    id: 13,
    category: 'internalMotivation',
    categoryName: '내재동기 & 몰입환경',
    categoryIcon: '🔥',
    question: '타인의 인정이나 성적 보상보다 어려운 문제를 스스로 해결했을 때의 지적 희열이 더 크다.',
    detail: '내재적 학업 성취 동기'
  },
  {
    id: 14,
    category: 'internalMotivation',
    categoryName: '내재동기 & 몰입환경',
    categoryIcon: '🔥',
    question: '소음이 차단되고 방해받지 않는 독립된 공간에서 가장 높은 집중 효율을 발휘한다.',
    detail: '심층 몰입형 학습 환경 선호도'
  },
  {
    id: 15,
    category: 'internalMotivation',
    categoryName: '내재동기 & 몰입환경',
    categoryIcon: '🔥',
    question: '목표를 달성한 내 미래 모습을 구체적으로 시각화하며 매일 공부할 힘을 얻는다.',
    detail: '자기주도 비전 형성 및 목표 지속력'
  }
];

export interface ArchetypeProfile {
  id: string;
  name: string;
  title: string;
  badge: string;
  description: string;
  coreStrength: string;
  cautionPoint: string;
  recommendedEnvironment: string;
  learningQuote: string;
}

export const ARCHETYPES: Record<string, ArchetypeProfile> = {
  goal_breakthrough: {
    id: 'goal_breakthrough',
    name: '목표주도 돌파형',
    title: 'Goal-Driven Breakthrough',
    badge: '🎯 목표주도 돌파형',
    description: '강인한 실행력과 높은 내재 동기를 바탕으로 정해진 목표를 저돌적으로 완수해내는 유형입니다. 장기 수험 레이스에서 가장 큰 지속력을 발휘합니다.',
    coreStrength: '압도적인 계획 실천력과 유혹 통제력, 목표를 향한 끈기',
    cautionPoint: '완벽주의로 인한 신체 과로 및 피로 누적에 유의해야 합니다.',
    recommendedEnvironment: '스톱워치 기반의 타임어택 플래너 및 성과 가시화 대시보드',
    learningQuote: '“의심 없이 실천하는 끈기가 가장 강력한 무기입니다.”'
  },
  deep_analytical: {
    id: 'deep_analytical',
    name: '신중분석 탐구형',
    title: 'Analytical Deep-Dive',
    badge: '🔍 신중분석 탐구형',
    description: '자신의 앎과 모름을 정확히 꿰뚫어 보며, 오답의 근본 원인을 끝까지 파고들어 개념을 완벽하게 재구성하는 분석적 학습자입니다.',
    coreStrength: '정밀한 메타인지 능력, 심층 오답 분석, 빈틈없는 개념 단권화',
    cautionPoint: '세부 디테일에 지나치게 매몰되어 전체 문제풀이 진도가 지연될 수 있습니다.',
    recommendedEnvironment: '화이트보드 요약 공간, 백지 인출 노트, 소음이 완벽 차단된 독립 공간',
    learningQuote: '“왜 틀렸는지를 아는 순간 실력은 급격히 도약합니다.”'
  },
  routine_builder: {
    id: 'routine_builder',
    name: '루틴안정 실천형',
    title: 'Systematic Routine-Builder',
    badge: '📐 루틴안정 실천형',
    description: '정형화된 시간표와 일관된 환경에서 최고의 안정감과 두뇌 회전력을 발휘합니다. 일정한 규칙이 세워지면 흔들림 없이 실력을 쌓아갑니다.',
    coreStrength: '규칙적인 학습 리듬, 시간대별 규칙적 과목 배치, 기복 없는 유지력',
    cautionPoint: '예상치 못한 시험 시간표 변경이나 돌발 상황에 유연하게 대응하는 훈련이 필요합니다.',
    recommendedEnvironment: '항상 정돈된 고정 좌석(독서실/스터디카페 1인실), 일정한 루틴 알람',
    learningQuote: '“매일 반복되는 작은 루틴이 거대한 결과를 만듭니다.”'
  },
  creative_challenger: {
    id: 'creative_challenger',
    name: '창의도전 몰입형',
    title: 'Creative Challenger',
    badge: '⚡ 창의도전 몰입형',
    description: '단순 암기보다 지적 호기심을 자극하는 고난도 킬러 문제와 다채로운 과목 교차 학습에서 폭발적인 몰입도를 보이는 잠재력 높은 유형입니다.',
    coreStrength: '높은 인지적 자극 수용도, 킬러 문항 돌파력, 빠른 직관적 문제 해결',
    cautionPoint: '기본기 복습이나 반복 단순 계산을 지루해하여 쉬운 실수(실점)가 발생할 수 있습니다.',
    recommendedEnvironment: '적당한 백색소음이 있는 개방형 카페 공간, 인터벌 집중(45분 몰입+10분 환기)',
    learningQuote: '“새로운 문제를 만날 때 두뇌는 가장 활발하게 가동됩니다.”'
  },
  mindful_potential: {
    id: 'mindful_potential',
    name: '정서섬세 잠재형',
    title: 'Sensory-Mindful Potential',
    badge: '🛡️ 정서섬세 잠재형',
    description: '뛰어난 감수성과 지적 잠재력을 지녔으나, 시험 불안이나 완벽주의적 스트레스에 민감하여 심리적 안정과 멘탈 완충이 성공의 열쇠인 유형입니다.',
    coreStrength: '섬세한 이해력, 높은 감수성, 신중하고 꼼꼼한 지문 독해력',
    cautionPoint: '시험 불안 및 오답 시의 자기비하를 예방하고 긍정적 자기효능감을 충전해야 합니다.',
    recommendedEnvironment: '따뜻한 조명, 아로마 향기, 부담 없는 단계별 스몰스텝 과제 부여',
    learningQuote: '“마음이 편안할 때 당신의 진짜 잠재력이 100% 발휘됩니다.”'
  },
  self_strategist: {
    id: 'self_strategist',
    name: '자기주도 전략가형',
    title: 'Self-Regulated Strategist',
    badge: '🧭 자기주도 전략가형',
    description: '메타인지, 실행력, 멘탈 균형이 고르게 발달하여 상황에 따라 유연하게 학습 전략을 수정하고 자원을 최적화할 수 있는 다재다능한 전략가입니다.',
    coreStrength: '균형 잡힌 과목별 시간 배분, 자율적 동기부여, 객관적 자기평가',
    cautionPoint: '너무 많은 전략을 동시에 시도하기보다 핵심 한두 가지 루틴에 집중하는 것이 좋습니다.',
    recommendedEnvironment: '자율 선택형 스터디 공간, 주간 전략 플래너 및 피드백 노트',
    learningQuote: '“전략을 알고 실행하는 자가 수험의 승자가 됩니다.”'
  }
};

export interface InferLearningTraitsOptions {
  careType?: CareType;
  surveyScores?: {
    bai?: number;
    isi?: number;
    concentration?: number;
    adrenal?: number;
    isChronicFatigue?: boolean;
    fatigueCount?: number;
  };
  survey?: Partial<SurveyData>;
  studyEfficiency?: any;
  student?: {
    grade?: string;
    weakSubject?: string;
  };
}

/**
 * 설문 미시행(또는 기본값 미수정) 상태 시 학생의 CareType 및 임상 데이터로부터
 * 5대 학습 기질 척도 및 Archetype을 과학적·동적으로 정밀 추정
 */
export const inferLearningTraitsFromProfile = (options: InferLearningTraitsOptions): LearningTraitsData => {
  const { careType, surveyScores, survey, studyEfficiency } = options;

  let baseGrit = 70;
  let baseResilience = 65;
  let baseTemperament = 65;
  let baseMeta = 70;
  let baseMotivation = 70;

  switch (careType) {
    case CareType.ANXIETY_TENSION:
      // 불안긴장형: 높은 성취욕과 꼼꼼함, 오답/시험 불안에 취약하여 멘탈 회복력 보완 필요
      baseGrit = 72;
      baseResilience = 38;
      baseTemperament = 60;
      baseMeta = 76;
      baseMotivation = 72;
      break;

    case CareType.BURNOUT:
      // 에너지 고갈형: 강한 목표의식과 실행력(Grit)으로 달리다 누적 피로에 직면
      baseGrit = 82;
      baseResilience = 40;
      baseTemperament = 62;
      baseMeta = 74;
      baseMotivation = 78;
      break;

    case CareType.DEPRESSION_AMOTIVATION:
      // 무기력 동기저하형: 착수 저항감, 정형화된 작은 일일 루틴 형성이 최우선
      baseGrit = 62;
      baseResilience = 46;
      baseTemperament = 52;
      baseMeta = 60;
      baseMotivation = 42;
      break;

    case CareType.ATTENTION_DEFICIT:
      // 주의산만/도파민형: 단순 반복 지양, 고난도 킬러 문항과 지적 호기심에 폭발적 몰입
      baseGrit = 46;
      baseResilience = 68;
      baseTemperament = 88;
      baseMeta = 62;
      baseMotivation = 82;
      break;

    case CareType.HYPERSENSITIVE:
      // 감각과민형: 예민한 메타인지와 오답 파고들기, 집중 방해요인 차단 필요
      baseGrit = 66;
      baseResilience = 50;
      baseTemperament = 68;
      baseMeta = 86;
      baseMotivation = 72;
      break;

    case CareType.BRAIN_FATIGUE:
      // 전두엽 뇌피로형: 깊은 개념 분석력과 지적 과부하 상태
      baseGrit = 68;
      baseResilience = 52;
      baseTemperament = 66;
      baseMeta = 82;
      baseMotivation = 70;
      break;

    case CareType.HEALTHY:
      // 고효율 최적형: 전 영역 고른 고득점과 자기주도적 전략
      baseGrit = 84;
      baseResilience = 82;
      baseTemperament = 78;
      baseMeta = 85;
      baseMotivation = 88;
      break;

    default:
      baseGrit = 70;
      baseResilience = 65;
      baseTemperament = 68;
      baseMeta = 72;
      baseMotivation = 70;
      break;
  }

  // 1) BAI (불안 지수: 0~63) 반영
  const bai = surveyScores?.bai ?? survey?.bai ?? 0;
  if (bai >= 25) {
    baseResilience = Math.max(25, baseResilience - 12);
  } else if (bai <= 9) {
    baseResilience = Math.min(95, baseResilience + 8);
  }

  // 2) Concentration (집중력 설문: 0~28) 반영
  const concentration = surveyScores?.concentration ?? survey?.concentrationScore ?? 14;
  if (concentration >= 20) {
    baseGrit = Math.min(95, baseGrit + 7);
    baseMotivation = Math.min(95, baseMotivation + 5);
  } else if (concentration <= 10) {
    baseGrit = Math.max(30, baseGrit - 8);
  }

  // 3) MSLQ Metacognition (5대 공부효율성 검사) 반영
  const metaScores = survey?.metacognitionScores || studyEfficiency?.metacognition;
  if (metaScores) {
    const metaVal = (metaScores as any).metacognitiveScore ?? (metaScores as any).metacognitive ?? 0;
    if (metaVal > 0) {
      const scaledMeta = Math.round(metaVal * 20);
      baseMeta = Math.round(baseMeta * 0.4 + scaledMeta * 0.6);
    }
  }

  // 4) TAI Test Anxiety (5대 공부효율성 검사) 반영
  const taiCog = survey?.testAnxietyCognitive ?? (studyEfficiency?.testAnxiety as any)?.cognitiveScore;
  if (taiCog !== undefined && taiCog !== null) {
    if (taiCog >= 14) {
      baseResilience = Math.max(25, baseResilience - 10);
    } else if (taiCog <= 7) {
      baseResilience = Math.min(95, baseResilience + 8);
    }
  }

  // 5) Digital Addiction (5대 공부효율성 검사) 반영
  const digiLevel = survey?.digitalAddictionLevel ?? (studyEfficiency?.digitalAddiction as any)?.level;
  if (digiLevel === 'danger' || digiLevel === 'risk') {
    baseTemperament = Math.min(95, baseTemperament + 8);
    baseGrit = Math.max(30, baseGrit - 8);
  }

  // 6) Chronotype (MEQ) 반영
  const chrono = survey?.chronotypeResult ?? (studyEfficiency?.chronotype as any)?.result;
  if (chrono === 'morning' || chrono === 'moderate_morning') {
    baseGrit = Math.min(95, baseGrit + 6);
  } else if (chrono === 'evening' || chrono === 'moderate_evening') {
    baseTemperament = Math.min(95, baseTemperament + 6);
  }

  const finalGrit = Math.min(98, Math.max(25, Math.round(baseGrit)));
  const finalResilience = Math.min(98, Math.max(25, Math.round(baseResilience)));
  const finalTemperament = Math.min(98, Math.max(25, Math.round(baseTemperament)));
  const finalMeta = Math.min(98, Math.max(25, Math.round(baseMeta)));
  const finalMotivation = Math.min(98, Math.max(25, Math.round(baseMotivation)));

  const scores: LearningTraitsScores = {
    gritPlan: finalGrit,
    mentalResilience: finalResilience,
    temperament: finalTemperament,
    metaCognition: finalMeta,
    internalMotivation: finalMotivation,
    persistenceAndExecution: finalGrit,
    mentalAndResilience: finalResilience,
    curiosityAndChallenge: finalTemperament,
    metaCognitiveStrategy: finalMeta,
    intrinsicMotivation: finalMotivation,
  };

  const avg100 = (finalGrit + finalResilience + finalTemperament + finalMeta + finalMotivation) / 5;
  scores.overallAverage = Math.round(avg100);
  const totalAverage = parseFloat((avg100 / 20).toFixed(2));

  // Archetype 판정
  let selectedArchetype = ARCHETYPES.self_strategist;

  if (finalResilience < 45 && (finalGrit >= 50 || finalMotivation >= 50 || careType === CareType.ANXIETY_TENSION)) {
    selectedArchetype = ARCHETYPES.mindful_potential;
  } else if (finalGrit >= 72 && (finalMotivation >= 68 || careType === CareType.BURNOUT)) {
    selectedArchetype = ARCHETYPES.goal_breakthrough;
  } else if (finalMeta >= 75 && (finalTemperament >= 60 || careType === CareType.HYPERSENSITIVE || careType === CareType.BRAIN_FATIGUE)) {
    selectedArchetype = ARCHETYPES.deep_analytical;
  } else if (finalTemperament >= 75 && (careType === CareType.ATTENTION_DEFICIT || finalResilience >= 58)) {
    selectedArchetype = ARCHETYPES.creative_challenger;
  } else if (careType === CareType.DEPRESSION_AMOTIVATION || (finalGrit >= 65 && finalMeta <= 65)) {
    selectedArchetype = ARCHETYPES.routine_builder;
  } else {
    const maxScore = Math.max(finalGrit, finalResilience, finalTemperament, finalMeta, finalMotivation);
    if (maxScore === finalMotivation && finalMotivation >= 75) selectedArchetype = ARCHETYPES.goal_breakthrough;
    else if (maxScore === finalMeta) selectedArchetype = ARCHETYPES.deep_analytical;
    else if (maxScore === finalTemperament) selectedArchetype = ARCHETYPES.creative_challenger;
    else if (maxScore === finalGrit) selectedArchetype = ARCHETYPES.routine_builder;
    else selectedArchetype = ARCHETYPES.self_strategist;
  }

  // 대표 rawAnswers (1-5) 생성 (일관성 유지)
  const scoreToAns = (s: number) => Math.min(5, Math.max(1, Math.round((s / 100) * 4 + 1)));
  const rawAnswers = [
    scoreToAns(finalGrit), scoreToAns(finalGrit), scoreToAns(finalGrit),
    scoreToAns(finalResilience), scoreToAns(finalResilience), scoreToAns(finalResilience),
    scoreToAns(finalTemperament), scoreToAns(finalTemperament), scoreToAns(finalTemperament),
    scoreToAns(finalMeta), scoreToAns(finalMeta), scoreToAns(finalMeta),
    scoreToAns(finalMotivation), scoreToAns(finalMotivation), scoreToAns(finalMotivation)
  ];

  return {
    scores,
    rawAnswers,
    totalAverage,
    archetypeId: selectedArchetype.id,
    archetypeName: selectedArchetype.name,
    archetypeTitle: selectedArchetype.title,
    archetypeBadge: selectedArchetype.badge,
    archetypeDescription: selectedArchetype.description,
    coreStrength: selectedArchetype.coreStrength,
    cautionPoint: selectedArchetype.cautionPoint,
    recommendedEnvironment: selectedArchetype.recommendedEnvironment
  };
};

/**
 * 15개 문항(각 1~5점) 응답을 기반으로 5대 척도(0~100) 및 Archetype 산출
 */
export const calculateLearningTraits = (answers: number[], careType?: CareType): LearningTraitsData => {
  // 사용자가 실제로 답변을 입력했는지 확인 (모두 3이거나 비어있으면 CareType 기반 정밀 추정 활용 가능)
  const isUserAnswered = Array.isArray(answers) && answers.length >= 15 && answers.some(a => a !== 3 && a !== undefined && a !== null);

  if (!isUserAnswered && careType) {
    return inferLearningTraitsFromProfile({ careType });
  }

  // 기본 3점(보통)으로 채움
  const safeAnswers = Array.from({ length: 15 }, (_, i) => (answers && answers[i] !== undefined) ? answers[i] : 3);

  const calcCategoryScore = (indices: number[]): number => {
    const sum = indices.reduce((acc, idx) => acc + (safeAnswers[idx] || 3), 0);
    // 3문항 min=3, max=15 -> 0~100점 변환
    return Math.round(((sum - 3) / 12) * 100);
  };

  const gritPlan = calcCategoryScore([0, 1, 2]);
  const mentalResilience = calcCategoryScore([3, 4, 5]);
  const temperament = calcCategoryScore([6, 7, 8]);
  const metaCognition = calcCategoryScore([9, 10, 11]);
  const internalMotivation = calcCategoryScore([12, 13, 14]);

  const scores: LearningTraitsScores = {
    gritPlan,
    mentalResilience,
    temperament,
    metaCognition,
    internalMotivation,
    persistenceAndExecution: gritPlan,
    mentalAndResilience: mentalResilience,
    curiosityAndChallenge: temperament,
    metaCognitiveStrategy: metaCognition,
    intrinsicMotivation: internalMotivation,
  };

  const totalSum = safeAnswers.reduce((a, b) => a + b, 0);
  const avg100 = (gritPlan + mentalResilience + temperament + metaCognition + internalMotivation) / 5;
  scores.overallAverage = Math.round(avg100);
  const totalAverage = parseFloat((totalSum / safeAnswers.length).toFixed(2));

  // Archetype 판별 알고리즘
  let selectedArchetype = ARCHETYPES.self_strategist;

  if (mentalResilience < 45 && (gritPlan >= 50 || internalMotivation >= 50)) {
    selectedArchetype = ARCHETYPES.mindful_potential;
  } else if (gritPlan >= 70 && internalMotivation >= 65) {
    selectedArchetype = ARCHETYPES.goal_breakthrough;
  } else if (metaCognition >= 70 && temperament >= 60) {
    selectedArchetype = ARCHETYPES.deep_analytical;
  } else if (temperament >= 70 && mentalResilience >= 60) {
    selectedArchetype = ARCHETYPES.creative_challenger;
  } else if (gritPlan >= 65 && metaCognition <= 65) {
    selectedArchetype = ARCHETYPES.routine_builder;
  } else {
    const maxScore = Math.max(gritPlan, mentalResilience, temperament, metaCognition, internalMotivation);
    // 모든 점수가 50인 기본 상태일 때 임의로 루틴안정 실천형에 고정되지 않도록 균형형인 self_strategist 적용
    if (gritPlan === 50 && mentalResilience === 50 && temperament === 50 && metaCognition === 50 && internalMotivation === 50) {
      selectedArchetype = ARCHETYPES.self_strategist;
    } else if (maxScore === internalMotivation) selectedArchetype = ARCHETYPES.goal_breakthrough;
    else if (maxScore === metaCognition) selectedArchetype = ARCHETYPES.deep_analytical;
    else if (maxScore === temperament) selectedArchetype = ARCHETYPES.creative_challenger;
    else if (maxScore === gritPlan) selectedArchetype = ARCHETYPES.routine_builder;
    else selectedArchetype = ARCHETYPES.self_strategist;
  }

  return {
    scores,
    rawAnswers: safeAnswers,
    totalAverage,
    archetypeId: selectedArchetype.id,
    archetypeName: selectedArchetype.name,
    archetypeTitle: selectedArchetype.title,
    archetypeBadge: selectedArchetype.badge,
    archetypeDescription: selectedArchetype.description,
    coreStrength: selectedArchetype.coreStrength,
    cautionPoint: selectedArchetype.cautionPoint,
    recommendedEnvironment: selectedArchetype.recommendedEnvironment
  };
};
