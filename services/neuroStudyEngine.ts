// 12대 CareType 맞춤 신경인지 학습 엔진 (Neuro-Study Engine)
import { LadderStageInfo, LadderStageLevel, NeuroBrainPriming, ConceptCheckItem } from '../types';
import { findUnitByName } from '../data/curriculumUnits';

export interface AdaptiveTimerConfig {
  modeName: string;
  defaultMinutes: number;
  allowNoTimer: boolean;
  breakReminderMinutes: number;
  neuroAdvice: string;
}

// A ~ F 6단계 사다리 메타데이터
export const LADDER_STAGES: Record<LadderStageLevel, LadderStageInfo> = {
  A: {
    level: 'A',
    title: 'A단계: 기본 개념 5문항',
    subtitle: '공식 정의 확인 및 직접 대입 연산',
    badgeName: '🌱 개념 씨앗 배지',
    icon: '🌱',
    color: 'emerald',
    targetFocus: '핵심 공식과 정의를 망설임 없이 인출하는 뇌 회로 활성화'
  },
  B: {
    level: 'B',
    title: 'B단계: 조금 진행된 문제 5문항',
    subtitle: '기본 개념의 1단계 변형 및 융합',
    badgeName: '🌿 응용 싹 배지',
    icon: '🌿',
    color: 'teal',
    targetFocus: '주어진 조건에서 어떤 공식을 꺼내 써야 하는지 매핑'
  },
  C: {
    level: 'C',
    title: 'C단계: 심화 문제 5문항',
    subtitle: '2가지 이상 개념 복합 및 식 변형',
    badgeName: '🌳 심화 도약 배지',
    icon: '🌳',
    color: 'blue',
    targetFocus: '작업기억에 2단계 논리 체인을 유지하며 계산 오류 없이 완주'
  },
  D: {
    level: 'D',
    title: 'D단계: 기출 변형 5문항',
    subtitle: '수능/평가원 빈출 유형 및 정형화된 패턴 공략',
    badgeName: '⚡ 기출 마스터 배지',
    icon: '⚡',
    color: 'indigo',
    targetFocus: '시험장에서 보게 될 기출 코드의 구조적 패턴을 직관적으로 감지'
  },
  E: {
    level: 'E',
    title: 'E단계: 준킬러 문제 5문항',
    subtitle: '조건 추론, 케이스 분류 및 숨은 제약 발견',
    badgeName: '🔥 준킬러 정복 배지',
    icon: '🔥',
    color: 'purple',
    targetFocus: '경우의 수 나누기와 그래프 개형 추론 등 고차원 전두엽 문제해결력'
  },
  F: {
    level: 'F',
    title: 'F단계: 수능 킬러 문제 5문항',
    subtitle: '최고난도 킬러, 다중 단원 융합 및 극한의 발상',
    badgeName: '👑 수능 킬러 완전정복 배지',
    icon: '👑',
    color: 'amber',
    targetFocus: '실전 수능 1등급을 결정짓는 킬러 문항을 뇌의 과열 없이 돌파'
  }
};

/**
 * 12대 CareType별 단원 풀기 전 두뇌 프라이밍 가이드
 */
export function getBrainPrimingGuide(careType: string, unitName: string): NeuroBrainPriming {
  const normType = careType?.toUpperCase() || 'HEALTHY';

  switch (normType) {
    case 'BURNOUT':
      return {
        careType: 'BURNOUT',
        careTypeName: '과긴장 번아웃형',
        prepTitle: '🌬️ 편도체 완전 감압 & 뇌압 낮추기',
        description: `현재 뇌의 교감신경 에너지가 방전 상태입니다. '${unitName}' 문제를 바로 풀면 뇌가 저항을 일으킵니다. 의자 등받이에 깊숙이 기대고 어깨 힘을 뺍니다.`,
        breathingTechnique: '생리적 한숨(Physiological Sigh): 코로 숨을 깊게 들이쉬고, 끝에서 한 번 더 들이쉰 뒤 입으로 길게 하- 내쉽니다 (5회 반복).',
        neuroScienceTip: '뇌의 이산화탄소 분압을 낮추고 심박수를 떨어뜨려, 전두엽의 작업기억 공간을 즉각 20% 이상 확보합니다.',
        recommendedDurationMinutes: 2
      };

    case 'ANXIETY_TENSION':
      return {
        careType: 'ANXIETY_TENSION',
        careTypeName: '불안-긴장형',
        prepTitle: '🧊 "Freezing(머리 하얘짐)" 차단 & 4-7-8 이완',
        description: `'${unitName}' 파트에서 틀릴까 봐 조급해질 때 편도체가 폭주합니다. "틀려도 괜찮고, 지금은 뇌에 길을 내는 훈련이다"라고 스스로에게 선언하세요.`,
        breathingTechnique: '4-7-8 호흡: 4초간 코로 흡기 ➔ 7초간 호흡 멈춤 ➔ 8초간 입으로 천천히 호기 (3세트).',
        neuroScienceTip: '미주신경(Vagus nerve)을 물리적으로 자극하여 시험 불안으로 인한 고각성 High-Beta파를 Alpha파로 전환합니다.',
        recommendedDurationMinutes: 3
      };

    case 'STRESS_OVERLOAD':
      return {
        careType: 'STRESS_OVERLOAD',
        careTypeName: '스트레스 과부하형',
        prepTitle: '🎧 감각 노이즈 차단 & 시야 좁히기',
        description: `주변의 작은 자극이나 압박감에 자율신경계가 과열되어 있습니다. 책상 위에서 불필요한 물건을 치우고 오직 '${unitName}' 화면 하나에만 시선을 모읍니다.`,
        breathingTechnique: '박스 호흡(Box Breathing): 4초 들이쉬고, 4초 멈추고, 4초 내쉬고, 4초 멈추기 (4회).',
        neuroScienceTip: '주변 시야를 차단하고 시각적 초점을 좁히면 뇌의 후두엽-두정엽 노이즈 필터링이 가동되어 몰입도가 상승합니다.',
        recommendedDurationMinutes: 2
      };

    case 'LOW_ENERGY':
      return {
        careType: 'LOW_ENERGY',
        careTypeName: '무기력형',
        prepTitle: '⚡ 도파민 마이크로 부스팅 & 기립 스트레칭',
        description: `몸이 무겁고 시작하기 싫은 상태는 도파민 부족 신호입니다. 자리에 앉기 전 30초간 가볍게 제자리 콩콩 뛰거나 기지개를 켭니다.`,
        breathingTechnique: '파워 호흡: 코로 빠르게 1초 들이쉬고 1초 강하게 내쉬기 (10회).',
        neuroScienceTip: 'A단계 1번 문제는 3초 만에 풀 수 있는 아주 쉬운 문제입니다. 딱 1문제만 맞추면 도파민 회로가 점화되어 가속도가 붙습니다.',
        recommendedDurationMinutes: 2
      };

    case 'DEPRESSION_AMOTIVATION':
      return {
        careType: 'DEPRESSION_AMOTIVATION',
        careTypeName: '우울-무동기형',
        prepTitle: '🌱 제로 저항(Zero-Friction) 착수 프라이밍',
        description: `'${unitName}'을 완벽하게 끝내야 한다는 부담을 버리세요. "A단계 5문제 중 1개만 봐도 오늘 승리다"라는 마음으로 시작합니다.`,
        breathingTechnique: '천천히 가슴에 손을 얹고 심장 박동을 느끼며 편안하게 심호흡 3회.',
        neuroScienceTip: '목표치가 높을수록 뇌의 복측선조체는 셧다운됩니다. 극소 단위의 행동 시작이 무기력 뇌파(Theta)를 각성 뇌파로 바꿉니다.',
        recommendedDurationMinutes: 2
      };

    case 'ADRENAL':
      return {
        careType: 'ADRENAL',
        careTypeName: '부신피로 증후군',
        prepTitle: '💧 뇌수분 공급 & 코르티솔 리듬 조율',
        description: `스트레스 호르몬 고갈로 뇌 세포가 쉽게 피로해집니다. 시원한 물 1~2모금을 천천히 마시고 목과 어깨를 가볍게 돌립니다.`,
        breathingTechnique: '깊은 복식호흡: 배가 부풀어 오르도록 5초간 들이쉬고 5초간 천천히 비워내기.',
        neuroScienceTip: '수분 부족 시 뇌의 신경전달물질 이동 속도가 30% 감퇴합니다. 수분 공급만으로도 계산 멍때림을 방지할 수 있습니다.',
        recommendedDurationMinutes: 2
      };

    case 'BRAIN_FATIGUE':
      return {
        careType: 'BRAIN_FATIGUE',
        careTypeName: '뇌피로 집중곤란형',
        prepTitle: '🧠 안구 운동(Saccades) & Brain Fog 걷어내기',
        description: `머리가 멍하고 글자가 눈에 튕겨 나갈 때입니다. 모니터에서 눈을 떼고 벽의 모서리를 따라 시선을 좌-우-상-하로 5초간 움직여보세요.`,
        breathingTechnique: '눈을 감고 관자놀이를 가볍게 누르며 코로 깊게 3회 호흡.',
        neuroScienceTip: '안구 도약 운동(Saccadic Eye Movement)은 소뇌와 전두엽의 전두안야(FEF)를 동기화하여 흐릿해진 인지 처리 속도를 즉시 깨웁니다.',
        recommendedDurationMinutes: 2
      };

    case 'HYPERSENSITIVE':
      return {
        careType: 'HYPERSENSITIVE',
        careTypeName: '과민성 학습장애형',
        prepTitle: '🎯 포커스 윈도우(Focus Window) 시각화',
        description: `주변 자극에 뇌가 과민하게 반응 중입니다. 지금 화면의 '${unitName}' 문제 박스 외에 다른 모든 배경은 캄캄한 어둠 속이라고 상상합니다.`,
        breathingTechnique: '이어폰 착용 또는 귀를 손으로 막고 자신의 숨소리에만 10초간 집중하기.',
        neuroScienceTip: '감각 입력 경로를 의도적으로 좁힘으로써 상구(Superior colliculus)의 노이즈 처리 부담을 최소화합니다.',
        recommendedDurationMinutes: 2
      };

    case 'ATTENTION_DEFICIT':
      return {
        careType: 'ATTENTION_DEFICIT',
        careTypeName: '주의력 산만형',
        prepTitle: '⏱️ 15분 타임어택 퀘스트 게임화',
        description: `'${unitName}' 문제를 공부가 아닌 '시간 내에 클리어하는 탈출 게임'으로 규정합니다. 스마트폰은 손이 닿지 않는 곳으로 옮겨두세요.`,
        breathingTechnique: '빠르게 3회 들이쉬고 멈춘 뒤, "퀘스트 시작!" 마음속으로 외치며 풀이 개시.',
        neuroScienceTip: '도파민 수치가 낮은 주의산만형 뇌는 짧은 제한 시간(스톱워치)과 단계별 클리어 뱃지 등 즉각적 보상 자극에 최상의 몰입을 보입니다.',
        recommendedDurationMinutes: 1
      };

    case 'SLEEP':
      return {
        careType: 'SLEEP',
        careTypeName: '수면 장애형',
        prepTitle: '☀️ 조명 밝히기 & 뇌 각성 알파파 유도',
        description: `수면 부족으로 인해 뇌 전두엽 대사가 가라앉아 있습니다. 방 조명을 밝게 하고 차가운 물로 손목 안쪽을 적셔 각성도를 올립니다.`,
        breathingTechnique: '가슴을 활짝 펴고 척추를 세운 뒤 깊고 강하게 4초 흡기 - 4초 호기 (5회).',
        neuroScienceTip: '빛과 시원한 체온 자극이 시교차상핵(SCN)을 자극하여 졸음을 억제하고 주간 인지 각성도를 15% 끌어올립니다.',
        recommendedDurationMinutes: 2
      };

    case 'CIRCULATION':
      return {
        careType: 'CIRCULATION',
        careTypeName: '혈액순환 저하형',
        prepTitle: '🦵 발목 펌핑 & 뇌 혈류 부스팅',
        description: `장시간 앉아 있어 혈액이 하체에 몰려 뇌 산소가 부족합니다. 발끝을 몸 쪽으로 당겼다 펴는 발목 펌핑을 10회 실시하세요.`,
        breathingTechnique: '온몸에 산소를 가득 채우듯 깊고 풍부한 흉곽 호흡 4회.',
        neuroScienceTip: '종아리 근육(제2의 심장)을 수축시키면 정맥혈이 심장과 뇌로 빠르게 재유입되어 뇌 회전이 맑아집니다.',
        recommendedDurationMinutes: 2
      };

    case 'HEALTHY':
    default:
      return {
        careType: 'HEALTHY',
        careTypeName: '최적 균형형',
        prepTitle: '🎯 실전 수능 모드 딥플로우 셋업',
        description: `신경인지 컨디션이 최적의 상태입니다. '${unitName}'의 A단계부터 F단계 킬러까지 한 호흡으로 뚫어내는 실전 수능 풀집중을 시작합니다.`,
        breathingTechnique: '단전호흡: 호흡에 의식을 집중하며 차분하게 3회 심호흡.',
        neuroScienceTip: '최적 균형 상태에서는 쉬운 문제의 신속성(A~C)과 고난도 문제의 다각도 발상(D~F)을 넘나드는 인지 유연성이 극대화됩니다.',
        recommendedDurationMinutes: 1
      };
  }
}

/**
 * 12대 CareType별 맞춤 탄력 타이머 (Adaptive Flow Timer)
 * 뽀모도로(25분 고정)의 부작용을 제거하고 개인별 최적 집중 블록 제공
 */
export function getAdaptiveTimerConfig(careType: string): AdaptiveTimerConfig {
  const normType = careType?.toUpperCase() || 'HEALTHY';

  switch (normType) {
    case 'BURNOUT':
    case 'ANXIETY_TENSION':
      return {
        modeName: '시간 압박 프리(무제한/노타이머) 모드',
        defaultMinutes: 0, // 0 = 타이머 없이 편안하게
        allowNoTimer: true,
        breakReminderMinutes: 20,
        neuroAdvice: '시간 초침 소리가 편도체를 자극하지 않도록 타이머를 끄고, 오직 문제의 원리에만 편안하게 집중하세요.'
      };

    case 'LOW_ENERGY':
    case 'DEPRESSION_AMOTIVATION':
      return {
        modeName: '15분 마이크로 퀘스트 모드',
        defaultMinutes: 15,
        allowNoTimer: false,
        breakReminderMinutes: 15,
        neuroAdvice: '15분 동안 딱 5문제만 끝내고 즉시 5분 쉬는 짧은 스프린트로 도파민을 충전합니다.'
      };

    case 'ATTENTION_DEFICIT':
    case 'BRAIN_FATIGUE':
      return {
        modeName: '20분 타임어택 인터벌 모드',
        defaultMinutes: 20,
        allowNoTimer: false,
        breakReminderMinutes: 20,
        neuroAdvice: '20분 스톱워치를 켜고 잡생각이 들어올 틈 없이 5문항을 빠르게 돌파합니다.'
      };

    case 'STRESS_OVERLOAD':
    case 'HYPERSENSITIVE':
      return {
        modeName: '25분 몰입 블록 모드',
        defaultMinutes: 25,
        allowNoTimer: true,
        breakReminderMinutes: 25,
        neuroAdvice: '주변 시각과 청각을 완벽히 차단한 상태에서 25분간 고도의 집중을 유지합니다.'
      };

    case 'SLEEP':
    case 'CIRCULATION':
      return {
        modeName: '35분 순환 플로우 모드',
        defaultMinutes: 35,
        allowNoTimer: false,
        breakReminderMinutes: 35,
        neuroAdvice: '35분 집중 풀이 후 반드시 3분간 자리에서 일어나 가벼운 스트레칭과 수분을 보충합니다.'
      };

    case 'HEALTHY':
    default:
      return {
        modeName: '50분~100분 수능 실전 모드',
        defaultMinutes: 50,
        allowNoTimer: true,
        breakReminderMinutes: 50,
        neuroAdvice: '수능 수학 100분 연속 사고력에 적응하도록 고난도 문제까지 끊김 없는 딥플로우를 유지합니다.'
      };
  }
}

/**
 * 컨셉체크 선지 셔플 (정답 1번 고정 악용 방지)
 * - correctIndex를 함께 재매핑하므로 판정 로직 변경 없음
 * - 모달 진입 시 1회만 적용하고 풀이 중에는 순서 고정
 */
export function shuffleConceptCheckOptions(items: ConceptCheckItem[]): ConceptCheckItem[] {
  return (items || []).map(item => {
    if (!item || !Array.isArray(item.options) || item.options.length < 2) return item;
    const order = item.options.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    return {
      ...item,
      options: order.map(i => item.options[i]),
      correctIndex: order.indexOf(item.correctIndex),
    };
  });
}

/**
 * 단원별 "기본적으로 꼭 알아야 하는 핵심 개념/공식" 3문항 메타인지 자가진단 생성기
 */
export function getMetacognitiveConceptCheck(unitName: string, subjectId: string = 'math'): ConceptCheckItem[] {
  const unit = findUnitByName(unitName);
  const uName = unit ? unit.name : unitName;
  const normSub = subjectId.toLowerCase();

  // 1) 국어 과목 특화 개념 점검
  if (normSub.includes('kor') || normSub.includes('국어') || uName.includes('독서') || uName.includes('비문학') || uName.includes('문학') || uName.includes('문법') || uName.includes('화작') || uName.includes('언매')) {
    return [
      {
        id: 'chk_kor_1',
        conceptName: '비문학 독해: 중심 문장과 단락 간 논리적 인과관계',
        question: '길고 복잡한 수능 비문학(과학/경제) 지문을 읽을 때 가장 먼저 확립해야 할 독해 원칙은 무엇인가요?',
        options: [
          '각 문단의 중심 문장과 핵심 화제를 파악하고, 단락 간의 인과·대조 관계(A ➔ B, 반면 C)를 도식화하며 읽는다.',
          '첫 문장부터 마지막 문장까지 모든 단어를 암기하려 시도하며 읽는다.',
          '지문은 읽지 않고 문제의 발문과 선지만 먼저 보고 짜깁기한다.',
          '어려운 과학 공식이 나오면 이해를 포기하고 바로 문제로 넘어간다.'
        ],
        correctIndex: 0,
        explanation: '비문학 고난도 지문의 핵심은 모든 정보를 암기하는 것이 아니라, 문단 간의 논리적 뼈대(인과, 비교, 대조)와 변수 간의 비례/반비례 관계를 구조화하여 문제 선지 대조 시 빠르게 찾아내는 맵핑 능력입니다.'
      },
      {
        id: 'chk_kor_2',
        conceptName: '<보기> 3점 고난도 문항의 외적 준거 판별 원칙',
        question: '국어 3점 킬러 <보기> 적용 문항을 해결할 때 반드시 준수해야 하는 메타인지 원칙은?',
        options: [
          '<보기>에 제시된 새로운 관점(외적 준거)을 기준점으로 삼아 지문의 내용과 선지를 1:1로 엄밀히 대응시킨다.',
          '자신의 평소 배경지식과 주관적 상식으로 선지의 참/거짓을 판별한다.',
          '<보기>의 길이가 길면 무조건 가장 긴 선지를 정답으로 고른다.',
          '본문에 없는 내용이라도 <보기>에 어울리면 무조건 지문 속 사실로 간주한다.'
        ],
        correctIndex: 0,
        explanation: '<보기> 문항은 출제자가 제시한 "새로운 평가 잣대(준거)"입니다. 본문의 정보와 <보기>의 기준이 충돌 없이 유기적으로 결합된 선지를 객관적으로 골라내야 합니다.'
      },
      {
        id: 'chk_kor_3',
        conceptName: '수능 1교시(08:40) 타임어택 및 Freezing 방어 메타인지',
        question: '1교시 시험 시작 직후 비문학 첫 지문에서 글자가 튕기며 머리가 하얘질 때(Freezing) 가장 올바른 뇌 대처법은?',
        options: [
          '의자에 기대어 생리적 한숨(호흡 2번)을 쉬고, "내가 어려우면 전국 수험생도 다 어렵다"고 되뇌며 문장 성분(주어-서술어)에 밑줄을 긋는다.',
          '당황하여 1번 지문만 25분 동안 붙잡고 계속 반복해서 읽는다.',
          '국어 시험 전체를 포기하고 바로 2교시 수학 준비를 시작한다.',
          '시간이 부족할 것을 두려워하여 모든 지문을 속독으로 날려 읽는다.'
        ],
        correctIndex: 0,
        explanation: '1교시의 편도체 과열은 전두엽 작업기억을 마비시킵니다. 30초간의 의식적 호흡 감압과 주어-서술어 밑줄 긋기라는 단순 물리적 행동이 뇌의 이성적 회로를 복구합니다.'
      }
    ];
  }

  // 2) 영어 과목 특화 개념 점검
  if (normSub.includes('eng') || normSub.includes('영어') || uName.includes('빈칸') || uName.includes('순서') || uName.includes('문장 삽입') || uName.includes('대의') || uName.includes('어법')) {
    return [
      {
        id: 'chk_eng_1',
        conceptName: '구문 독해: 문장의 주어-동사 축과 수식어 분리',
        question: '3줄 이상의 길고 복잡한 수능 영어 문장을 만났을 때 직독직해를 위한 가장 본질적인 독해 공식은?',
        options: [
          '전치사구, 관계사절, 분사구문 등 수식 어구를 괄호로 묶고 문장의 본주어와 본동사를 가장 먼저 식별한다.',
          '문장의 맨 끝 단어부터 거꾸로 우리말로 번역하며 올라온다.',
          '모르는 단어가 하나라도 나오면 번역을 중단하고 사전을 찾는다.',
          '문장의 문법 구조와 상관없이 아는 단어들만 조합하여 소설을 쓴다.'
        ],
        correctIndex: 0,
        explanation: '복잡한 구문일수록 수식 거품을 걷어내고 "누가(주어) 무엇을 했다(동사)"의 핵심 뼈대를 잡는 것이 독해 속도와 정확도를 2배 이상 끌어올립니다.'
      },
      {
        id: 'chk_eng_2',
        conceptName: '빈칸추론(31~34번)의 본질: 대주제의 패러프레이징(Paraphrasing)',
        question: '수능 영어 최고난도 3점 빈칸추론 문항의 빈칸에 들어갈 정답의 성격으로 가장 타당한 설명은?',
        options: [
          '글 전체의 대주제(Topic Sentence)나 핵심 논리를 다른 동의어·유의어로 치환한 재진술(Paraphrasing)이다.',
          '지문에 한 번도 암시되지 않은 완전히 새롭고 지엽적인 외부 지식이다.',
          '글쓴이의 주장과 정반대되는 통념을 그대로 옮겨놓은 문장이다.',
          '빈칸 바로 앞 단어와 발음이 비슷한 단어이다.'
        ],
        correctIndex: 0,
        explanation: '빈칸은 지문에서 가장 중요한 "핵심 주제문"에 뚫립니다. 빈칸 주변의 부정어(never, hardly, fail to)에 유의하며, 주제의 또 다른 표현(Paraphrase)을 찾는 것이 정석입니다.'
      },
      {
        id: 'chk_eng_3',
        conceptName: '순서 배열 & 문장 삽입의 3대 절대 단서 (Signal Words)',
        question: '글의 순서 배열(36~37번)과 문장 삽입(38~39번)을 풀 때 논리적 단절(Gap)을 찾는 3대 핵심 단서는?',
        options: [
          '지시사(This, That, Such), 인칭대명사(He, They, It), 연결사(However, Therefore, Instead)',
          '문장의 글자 수, 마침표 개수, 단락의 줄 바꿈 위치',
          '단어의 알파벳 순서와 대문자 시작 여부',
          '지문의 출처 저자 이름과 출판 연도'
        ],
        correctIndex: 0,
        explanation: '수능 순서/삽입 문항은 1) 지시사/관사(Such, The), 2) 대명사(They, It), 3) 연결사(Instead, However)라는 3대 언어적 장치를 통해 논리적 결합과 단절을 명확히 증명하도록 설계됩니다.'
      }
    ];
  }

  // 3) 수학 단원별 특화 개념 점검 문항
  if (uName.includes('수열') || uName.includes('등차') || uName.includes('등비')) {
    return [
      {
        id: 'chk_seq_1',
        conceptName: '등차수열의 일반항과 합의 구조',
        question: '첫째항이 a이고 공차가 d인 등차수열의 제n항 an과 첫째항부터 n항까지의 합 Sn의 본질적 형태는 무엇인가요?',
        options: [
          'an = a + (n-1)d (n에 대한 1차식), Sn = An² + Bn (상수항이 0인 n에 대한 2차식)',
          'an = a · d^(n-1), Sn = r-1분의 a(r^n - 1)',
          'an = a + nd, Sn = n(a + l)',
          'an = Sn - S(n-1) (단, n=1부터 항상 성립)'
        ],
        correctIndex: 0,
        explanation: '등차수열의 일반항은 n의 계수가 공차 d인 1차식이고, Sn은 상수항이 0인 2차식(Sn = d/2 n² + ...)입니다. Sn에 상수항이 있으면 둘째항부터 등차수열을 이룹니다.'
      },
      {
        id: 'chk_seq_2',
        conceptName: '등비중항과 수열의 곱 성질',
        question: '세 수 a, b, c가 이 순서대로 등비수열을 이룰 때 만족하는 등비중항의 성질은?',
        options: [
          '2b = a + c',
          'b² = ac (단, a, c의 부호가 같을 때 b = ±√(ac))',
          'b = (a + c) / 2',
          'b³ = a²c'
        ],
        correctIndex: 1,
        explanation: '등비수열에서 연속한 세 항은 가운데 항의 제곱이 양 끝 항의 곱과 같습니다 (b/a = c/b ⇒ b² = ac).'
      },
      {
        id: 'chk_seq_3',
        conceptName: 'Sn과 an의 역추적 관계식 (주의점)',
        question: '수열의 합 Sn이 주어졌을 때 일반항 an을 구할 때 반드시 점검해야 할 치명적 주의점은?',
        options: [
          '항상 모든 n에 대해 an = Sn - S(n-1) 공식 하나만 쓰면 된다.',
          'an = Sn - S(n-1)은 n≥2에서만 성립하며, 첫째항 a1은 반드시 S1으로 따로 확인해야 한다.',
          '공차가 음수일 때는 an = Sn + S(n-1)로 계산한다.',
          '수열의 합 공식은 등차수열에만 적용할 수 있다.'
        ],
        correctIndex: 1,
        explanation: 'S0는 정의되지 않으므로 an = Sn - S(n-1)은 n≥2일 때만 유효합니다. a1 = S1과 an 공식에 n=1을 넣은 값이 일치하는지 반드시 확인해야 합니다.'
      }
    ];
  }

  if (uName.includes('미분') || uName.includes('도함수') || uName.includes('접선')) {
    return [
      {
        id: 'chk_diff_1',
        conceptName: '미분계수 f\'(a)의 기하학적 정의',
        question: '함수 y=f(x)의 x=a에서의 미분계수 f\'(a)가 의미하는 기하학적 본질은 무엇인가요?',
        options: [
          '곡선 y=f(x) 위의 점 (a, f(a))에서의 접선의 기울기',
          '두 점 사이를 지나는 할선의 기울기',
          '함수 f(x)가 x축과 만나는 x절편의 좌표',
          'x=a에서의 함수의 극댓값'
        ],
        correctIndex: 0,
        explanation: 'f\'(a)는 x=a에서의 순간변화율이며, 기하학적으로는 곡선 위의 점 (a, f(a))에서 그은 접선의 기울기와 정확히 일치합니다.'
      },
      {
        id: 'chk_diff_2',
        conceptName: '미분가능성과 연속성의 포함 관계',
        question: '함수 f(x)의 x=a에서의 미분가능성과 연속성에 대한 설명 중 항상 참인 것은?',
        options: [
          '연속 함수이면 반드시 그 점에서 미분가능하다.',
          '미분가능하면 반드시 그 점에서 연속이다 (대우: 불연속이면 미분 불가능).',
          '좌미분계수와 우미분계수가 존재하기만 하면 무조건 미분가능하다.',
          '절댓값 함수 y=|x|는 x=0에서 미분가능하다.'
        ],
        correctIndex: 1,
        explanation: '미분가능하면 반드시 연속입니다 (f\'(a) 존재 ⇒ lim f(x)=f(a)). 반대로 연속이더라도 뾰족점(첨점)에서는 좌미분계수와 우미분계수가 달라 미분 불가능합니다.'
      },
      {
        id: 'chk_diff_3',
        conceptName: '극값(극대·극소) 판정의 필요충분 조건',
        question: '미분가능한 함수 f(x)가 x=c에서 극값을 갖기 위한 조건으로 가장 올바른 설명은?',
        options: [
          'f\'(c) = 0 이기만 하면 무조건 x=c에서 극값을 갖는다.',
          'f\'(c) = 0 이고, x=c의 좌우에서 f\'(x)의 부호가 양에서 음 또는 음에서 양으로 바뀌어야 한다.',
          'f\'\'(c) = 0 이어야만 극값을 갖는다.',
          '극값은 반드시 함수의 최댓값 또는 최솟값이어야 한다.'
        ],
        correctIndex: 1,
        explanation: 'f\'(c)=0이어도 x=c 좌우에서 도함수의 부호가 변하지 않으면(예: f(x)=x³의 x=0) 극값이 아닙니다. 도함수 부호의 변화가 핵심입니다.'
      }
    ];
  }

  if (uName.includes('적분') || uName.includes('정적분') || uName.includes('부정적분')) {
    return [
      {
        id: 'chk_int_1',
        conceptName: '미적분학의 기본정리 (FTC)',
        question: '닫힌구간 [a, b]에서 연속인 함수 f(x)의 한 부정적분을 F(x)라 할 때, 정적분 ∫[a to b] f(x)dx의 계산식은?',
        options: [
          'F(b) - F(a)',
          'f(b) - f(a)',
          'F\'(b) - F\'(a)',
          '(b - a) · F(b)'
        ],
        correctIndex: 0,
        explanation: '미적분학의 제2 기본정리에 의해 정적분 값은 부정적분의 양 끝값의 차 F(b) - F(a)로 계산됩니다.'
      },
      {
        id: 'chk_int_2',
        conceptName: '정적분으로 정의된 함수의 양대 루틴',
        question: 'g(x) = ∫[a to x] f(t)dt 형태의 식이 주어졌을 때 가장 먼저 기계적으로 적용해야 하는 2가지 조작은?',
        options: [
          'x=a를 대입하여 g(a)=0 확인 & 양변을 x로 미분하여 g\'(x)=f(x) 구하기',
          '양변을 제곱한 뒤 t에 대해 적분하기',
          'x 대신 0을 대입하고 f(x)를 상수 취급하기',
          '역함수를 구한 뒤 아래끝 a를 소거하기'
        ],
        correctIndex: 0,
        explanation: '정적분으로 정의된 함수는 1) 아래끝과 같은 값 x=a 대입(함숫값 0) 2) x에 대한 양변 미분(도함수 도출)이 표준적 풀이의 시작점입니다.'
      },
      {
        id: 'chk_int_3',
        conceptName: '곡선과 x축 사이의 넓이 계산 시 주의점',
        question: '함수 y=f(x)와 x축 사이의 넓이 S를 구할 때 정적분과 다른 점은 무엇인가요?',
        options: [
          '넓이는 항상 0 또는 음수가 될 수 있다.',
          'f(x)가 x축 아래에 있는 구간에서는 함숫값이 음수이므로 -f(x)를 적분해야 넓이가 양수로 나온다.',
          '적분 구간의 순서를 뒤집어도 넓이는 변하지 않는다.',
          '정적분 값과 넓이는 항상 부호와 값이 100% 동일하다.'
        ],
        correctIndex: 1,
        explanation: '정적분은 부호가 있는 면적이고, 넓이는 항상 절댓값 ∫|f(x)|dx입니다. f(x)<0인 구간에서는 부호를 반전시켜 적분해야 합니다.'
      }
    ];
  }

  if (uName.includes('방정식') || uName.includes('이차') || uName.includes('판별식')) {
    return [
      {
        id: 'chk_quad_1',
        conceptName: '이차방정식의 판별식 D와 실근의 개수',
        question: '실수 계수 이차방정식 ax² + bx + c = 0에서 판별식 D = b² - 4ac의 값에 따른 실근의 상태는?',
        options: [
          'D > 0: 서로 다른 두 실근, D = 0: 중근(서로 같은 두 실근), D < 0: 서로 다른 두 허근',
          'D > 0: 중근, D = 0: 허근, D < 0: 서로 다른 두 실근',
          'D의 값과 실근의 개수는 무관하다',
          'D < 0 일 때 실근이 무수히 많다'
        ],
        correctIndex: 0,
        explanation: '근의 공식의 루트 안의 식 D=b²-4ac의 부호가 실근의 개수를 결정합니다.'
      },
      {
        id: 'chk_quad_2',
        conceptName: '근과 계수의 관계',
        question: '이차방정식 ax² + bx + c = 0의 두 근을 α, β라 할 때 두 근의 합(α+β)과 곱(αβ)은?',
        options: [
          'α+β = -b/a,  αβ = c/a',
          'α+β = b/a,   αβ = -c/a',
          'α+β = -c/a,  αβ = b/a',
          'α+β = b/(2a), αβ = c/(4a)'
        ],
        correctIndex: 0,
        explanation: 'a(x-α)(x-β) = ax² - a(α+β)x + aαβ = 0 과 계수를 비교하면 α+β = -b/a, αβ = c/a가 도출됩니다.'
      },
      {
        id: 'chk_quad_3',
        conceptName: '이차함수의 꼭짓점과 대칭축',
        question: '이차함수 y = ax² + bx + c (a≠0)의 대칭축의 방정식은 무엇인가요?',
        options: [
          'x = -b / (2a)',
          'x = b / (2a)',
          'x = -b / a',
          'x = c / a'
        ],
        correctIndex: 0,
        explanation: '완전제곱식 y = a(x + b/(2a))² - (b²-4ac)/(4a) 로 표준형을 바꾸면 대칭축은 x = -b/(2a) 입니다.'
      }
    ];
  }

  // 탐구(사탐/과탐/한국사) 특화 개념 점검 (문제은행 없이 AI 사다리와 병행)
  const normLower = `${subjectId} ${uName}`.toLowerCase();
  const isInquiryUnit = ['탐구', '물리', '화학', '생명', '지구', '윤리', '지리', '역사', '경제', '정치', '사회', '한국사', '한문', '외국어'].some(k => normLower.includes(k.toLowerCase()));
  if (isInquiryUnit) {
    return [
      {
        id: 'chk_inq_1',
        conceptName: `${uName}의 핵심 개념 구조화`,
        question: `'${uName}' 단원의 핵심 개념과 용어 정의를 머릿속으로 구조화할 수 있나요?`,
        options: [
          '핵심 개념의 정의와 하위 요소들을 말로 설명하고 서로 연결할 수 있다.',
          '용어는 알지만 개념 간의 인과·포함 관계를 설명하기 어렵다.',
          '비슷한 개념들과 헷갈려서 문제에서 보기를 봐야 구분된다.',
          '개념 정리가 전혀 되어 있지 않아 교과서 정독이 필요하다.'
        ],
        correctIndex: 0,
        explanation: '탐구 고득점의 출발점은 용어의 정확한 정의입니다. 정의를 말로 설명할 수 있어야 자료 해석 단계에서 오개념 함정을 피할 수 있습니다.'
      },
      {
        id: 'chk_inq_2',
        conceptName: '자료·도표 해석의 축과 단위 판독',
        question: `'${uName}' 관련 도표·그래프·실험 자료를 볼 때 가장 먼저 확인해야 할 것은?`,
        options: [
          '그래프의 x축·y축과 단위, 실험의 조작·통제 변인과 발문의 조건 [가]·[나]를 먼저 확인한다.',
          '그래프의 모양만 보고 감으로 답을 고른다.',
          '자료는 건너뛰고 선지만 읽고 찍는다.',
          '단위를 확인하지 않고 숫자만 비교한다.'
        ],
        correctIndex: 0,
        explanation: '탐구 킬러의 70%는 "축·단위·변인" 함정입니다. 자료를 보기 전 축과 단위, 실험 변인을 먼저 확정하는 습관이 오답률을 절반으로 줄입니다.'
      },
      {
        id: 'chk_inq_3',
        conceptName: '매력적 오답(함정 선지) 소거 원리',
        question: `'${uName}' 문제를 풀 때 보기 중 정답이 아닌데 정답처럼 보이는 선지의 공통적인 특징은?`,
        options: [
          '자료의 일부만 맞거나 조건을 살짝 비튼 부분적 참, 과도한 일반화, 단위·부호 착각이다.',
          '항상 가장 긴 문장의 선지가 오답이다.',
          '숫자가 포함된 선지는 무조건 오답이다.',
          '처음 본 용어가 들어간 선지가 정답이다.'
        ],
        correctIndex: 0,
        explanation: '탐구 오답 선지는 대부분 "부분적 참 + 조건 비틀기" 구조입니다. 선지의 모든 조건이 자료·개념과 동시에 성립하는지 끝까지 검증하세요.'
      }
    ];
  }

  // 기본 일반 단원 3문항 템플릿
  return [
    {
      id: 'chk_gen_1',
      conceptName: `${uName}의 정의 및 핵심 공식`,
      question: `'${uName}' 단원에서 문제 풀이의 출발점이 되는 가장 핵심 공식 및 정의를 머릿속으로 떠올릴 수 있나요?`,
      options: [
        '기본 공식과 그 유도 과정을 명확히 설명하고 적용할 수 있다.',
        '공식의 형태는 알지만 유도 과정이나 전제 조건이 가물가물하다.',
        '비슷한 공식과 헷갈려서 문제에서 보기를 봐야 기억난다.',
        '공식이 전혀 기억나지 않아 개념서 정독이 필요하다.'
      ],
      correctIndex: 0,
      explanation: '기본 공식이 조건 반사적으로 떠오르지 않으면 상위 단계 문제에서 작업기억 과부하가 발생합니다.'
    },
    {
      id: 'chk_gen_2',
      conceptName: '단원의 전제 조건과 예외 규칙',
      question: `'${uName}' 관련 식을 전개하거나 계산할 때 발생하는 제약 조건(분모≠0, 루트 안≥0, 밑/진수 조건 등)을 항상 체크하나요?`,
      options: [
        '문제 시작 전 미지수의 범위와 제약 조건을 가장 먼저 적어둔다.',
        '계산이 끝난 뒤 답을 낼 때 가끔 생각나서 확인한다.',
        '자주 놓쳐서 오답이나 허근을 진짜 근으로 적는 실수를 한다.',
        '제약 조건이 무엇인지 의식해본 적이 없다.'
      ],
      correctIndex: 0,
      explanation: '수능 4점 문항의 70%는 "숨겨진 제약 조건"에서 함정을 파놓습니다. 시작 전 제약 조건을 확인하는 메타인지를 갖추세요.'
    },
    {
      id: 'chk_gen_3',
      conceptName: '대표 기출 유형의 해결 알고리즘',
      question: `'${uName}'의 대표 유형 문제를 마주했을 때 1단계(조건 파악) ➔ 2단계(식 수립) ➔ 3단계(연산)의 로드맵이 서나요?`,
      options: [
        '문제의 발문을 읽자마자 어떤 풀이 도구를 꺼내야 할지 로드맵이 선다.',
        '일단 식을 이것저것 적어보면서 맞는지 맞춰보는 편이다.',
        '문제를 여러 번 읽어도 무엇을 구하라는지 파악하기 어렵다.',
        '해설지를 보지 않으면 첫 줄을 시작조차 못 하겠다.'
      ],
      correctIndex: 0,
      explanation: '개념을 안다는 것은 문제의 조건(Input)을 보고 올바른 수학적 도구(Algorithm)를 선택할 수 있음을 의미합니다.'
    }
  ];
}

/**
 * 12대 CareType별 뇌 과학적 오답 피드백 코칭
 */
export function getNeuroErrorFeedback(careType: string, stage: LadderStageLevel, unitName: string): string {
  const normType = careType?.toUpperCase() || 'HEALTHY';

  switch (normType) {
    case 'BURNOUT':
      return `☕ [과긴장 번아웃 코칭] "뇌 에너지가 순간적으로 떨어진 것뿐입니다. 자책하지 마세요. 방금 틀린 문제는 해설을 훑어보고 심호흡을 1번 한 뒤 가볍게 넘어가도 충분합니다."`;

    case 'ANXIETY_TENSION':
      return `🌱 [불안-긴장 이완 코칭] "틀리는 순간 심장이 쿵 내려앉았다면 편도체가 놀란 신호입니다. 지금은 실전 수능이 아니라 '틀림으로써 뇌 신경망을 강화하는' 최적의 연습 시간입니다. 4초 들이쉬고 4초 내쉬어보세요."`;

    case 'STRESS_OVERLOAD':
      return `🎧 [스트레스 과부하 리셋] "조급해진 마음이 계산 과정에서 한 단계를 건너뛰게 만들었습니다. 문제 발문에서 '구하고자 하는 것'에 밑줄을 긋고 한 줄씩 차분히 다시 써보세요."`;

    case 'LOW_ENERGY':
    case 'DEPRESSION_AMOTIVATION':
      return `💪 [도파민 회복 코칭] "전혀 괜찮습니다! 지금까지 ${stage}단계까지 도전한 것 자체가 엄청난 전진입니다. 해설에서 핵심 공식 1줄만 눈에 담고 다음 문제로 가볍게 점프합시다."`;

    case 'BRAIN_FATIGUE':
      return `🧠 [작업기억 리프레시] "뇌의 작업기억 용량에 잠시 과부하가 걸렸습니다. 모니터에서 눈을 떼고 먼 곳을 5초간 응시한 뒤, 식을 암산하지 말고 연습장에 손으로 적어가며 다시 풀어보세요."`;

    case 'ATTENTION_DEFICIT':
      return `🎯 [주의 집중 정밀 튜닝] "문제의 조건을 하나 놓쳤거나 단순 연산에서 발이 걸렸습니다. '단, x>0'이나 '정수 k' 같은 숨은 제약 조건을 네모 박스 치고 다시 한번 확인하세요!"`;

    case 'HEALTHY':
    default:
      return `⚡ [실전 메타인지 디버깅] "좋은 오답입니다! 실전 킬러 문항에서도 이런 발상 오류가 승부를 가릅니다. 나의 풀이와 해설의 갈림길이 어느 지점이었는지 핀셋처럼 집어내어 내 것으로 만드세요."`;
  }
}
