
export const BAI_QUESTIONS = [
  "가끔씩 몸이 저리고 쑤시며 감각이 마비된 느낌을 받는다.",
  "흥분된 느낌을 받는다.",
  "가끔씩 다리가 떨리곤 한다.",
  "편안하게 쉴 수가 없다.",
  "매우 나쁜 일이 일어날 것 같은 두려움을 느낀다.",
  "어지러움(현기증)을 느낀다.",
  "가끔씩 심장이 두근거리고 빨리 뛴다.",
  "침착하지 못하다.",
  "자주 겁을 먹고 무서움을 느낀다.",
  "신경이 과민 되어 있다.",
  "가끔씩 숨이 막히고 질식할 것 같다.",
  "자주 손이 떨린다.",
  "안절부절 못한다.",
  "미칠 것 같은 두려움을 느낀다.",
  "가끔씩 숨쉬기 곤란할 때가 있다.",
  "죽을 것 같은 두려움을 느낀다.",
  "불안한 상태이다.",
  "자주 소화가 잘 안되고 뱃속이 불편하다.",
  "가끔 기절할 것 같다.",
  "자주 얼굴이 붉어지곤 한다.",
  "땀을 많이 흘린다. (더위로 인한 경우는 제외)"
];

export const ISI_QUESTIONS = [
  {
    id: 1,
    label: "잠들기 어렵다.",
    options: ["전혀 없다", "약간", "중간 정도", "심하다", "매우 심하다"]
  },
  {
    id: 2,
    label: "잠을 유지하기 어렵다. (자주 깸)",
    options: ["전혀 없다", "약간", "중간 정도", "심하다", "매우 심하다"]
  },
  {
    id: 3,
    label: "쉽게 깬다.",
    options: ["전혀 없다", "약간", "중간 정도", "심하다", "매우 심하다"]
  },
  {
    id: 4,
    label: "현재 수면패턴에 대해 얼마나 만족하고 계십니까?",
    options: ["매우 만족", "만족", "중간", "불만족", "매우 불만족"]
  },
  {
    id: 5,
    label: "경험하는 수면장애가 일상기능을 어느 정도로 방해한다고 생각하십니까?",
    options: ["전혀 방해 되지 않음", "조금 방해됨", "다소 방해됨", "많이 방해됨", "매우 많이 방해됨"]
  },
  {
    id: 6,
    label: "삶의 질 저하 측면에서 귀하의 수면 장애를 다른 사람이 얼마나 쉽게 알아차릴 수 있다고 생각하십니까?",
    options: ["전혀 현저 하지 않음", "조금 현저함", "다소 현저함", "많이 현저함", "매우 많이 현저함"]
  },
  {
    id: 7,
    label: "현재 수면장애에 관하여 얼마나 걱정하고 계십니까?",
    options: ["전혀", "조금", "다소", "많이", "매우 많이"]
  }
];

export const FATIGUE_SYMPTOMS = [
  "Memory or concentration decrease (기억력 혹은 집중력 감소)",
  "Sore throat (인후통)",
  "Tender lymph nodes (목이나 겨드랑이 부위 통증)",
  "Muscle pain (근육통)",
  "Joint pain without swelling (관절통)",
  "Headaches of a new type (두통)",
  "Unrefreshing sleep (잠을 자도 개운하지 않음)",
  "Post-exertional malaise > 24h (운동 후 하루 이상 피로감)"
];

export const SYMPATHETIC_SYMPTOMS = [
  { label: "빈맥 (Tachycardia)", desc: "심장이 빠르게 뛰는 증상" },
  { label: "손발떨림 (Tremors)", desc: "손이나 발이 떨리는 증상" },
  { label: "과호흡 (Hyperventilation)", desc: "숨을 과도하게 빠르게 쉬는 증상" },
  { label: "얕은호흡 (Shallow Breathing)", desc: "호흡이 얕고 짧은 증상" },
  { label: "다한증 (Hyperhidrosis)", desc: "땀이 과도하게 나는 증상" },
  { label: "식은땀 (Cold Sweats)", desc: "긴장이나 불안으로 차가운 땀이 나는 증상" },
  { label: "소화불량 (Indigestion)", desc: "음식이 잘 소화되지 않는 증상" },
  { label: "변비 (Constipation)", desc: "배변이 어려운 증상" },
  { label: "불안 (Anxiety)", desc: "이유 없이 걱정되고 초조한 느낌" },
  { label: "공황 (Panic)", desc: "갑자기 극심한 공포를 느끼는 증상" },
  { label: "수면장애 (Sleep Disorder)", desc: "잠들기 어렵거나 자주 깨는 증상" },
  { label: "과민반응 (Hypersensitivity)", desc: "사소한 자극에도 예민하게 반응" },
  { label: "배뇨억제 (Urinary Suppression)", desc: "소변이 잘 나오지 않는 증상" }
];

export const PARASYMPATHETIC_SYMPTOMS = [
  { label: "서맥 (Bradycardia)", desc: "심장이 느리게 뛰는 증상" },
  { label: "어지러움 (Dizziness)", desc: "머리가 핑 도는 느낌" },
  { label: "호흡저하 (Hypoventilation)", desc: "호흡이 느리고 약한 증상" },
  { label: "느린호흡 (Slow Breathing)", desc: "숨을 천천히 쉬는 증상" },
  { label: "체온저하 (Hypothermia)", desc: "체온이 낮아지는 증상" },
  { label: "수족냉증 (Cold hands/feet)", desc: "손발이 차가운 증상" },
  { label: "속쓰림 (Heartburn)", desc: "위산으로 가슴이 쓰린 느낌" },
  { label: "설사 (Diarrhea)", desc: "묽은 변을 자주 보는 증상" },
  { label: "무기력 (Lethargy)", desc: "기운이 없고 축 처지는 느낌" },
  { label: "우울감 (Depression)", desc: "기분이 가라앉고 의욕이 없는 느낌" },
  { label: "졸림 (Drowsiness)", desc: "눈이 감기고 졸린 증상" },
  { label: "감정반응 둔화 (Emotional Blunting)", desc: "감정 표현이 줄어드는 증상" },
  { label: "빈뇨 (Frequent Urination)", desc: "소변을 자주 보는 증상" }
];

export const CONCENTRATION_QUESTIONS = [
  "공부나 과제를 할 때 세부적인 일에 주의를 기울이기 힘들다.",
  "한 가지 일(강의, 독서)에 집중력을 유지하기가 어렵다.",
  "다른 사람이 말을 할 때 귀 기울여 듣지 않는다는 느낌을 받는다.",
  "지시대로 따라 하지 못하거나 학업을 끝까지 마치지 못한다.",
  "정신적인 노력이 많이 필요한 일(복잡한 문제 풀이 등)을 피한다.",
  "외부 자극에 의해 쉽게 주의가 산만해진다.",
  "일상적인 활동(준비물 챙기기, 계획 세우기)을 자주 잊어버린다."
];

export const ADRENAL_QUESTIONS = [
  {
    category: "1. 수면과 활력",
    questions: [
      "아침에 일어날 때 몸이 천근만근이고 개운하지 않다.",
      "충분히 잤음에도 불구하고 낮 시간에 계속 졸음이 쏟아진다.",
      "오후 3~4시쯤이면 급격히 기운이 빠지고 집중력이 떨어진다.",
      "밤 9~10시가 되면 피곤하지만, 막상 누우면 정신이 맑아져 잠들기 어렵다."
    ]
  },
  {
    category: "2. 식습관 및 대사",
    questions: [
      "짠 음식이나 단 음식이 강렬하게 당길 때가 많다.",
      "카페인(커피, 에너지 드링크) 없이는 하루를 버티기 힘들다.",
      "식사를 거르면 유난히 어지럽거나 예민해진다.",
      "특별히 많이 먹지 않아도 복부 비만이 심해지거나 체중이 잘 안 빠진다."
    ]
  },
  {
    category: "3. 심리 및 면역",
    questions: [
      "예전보다 스트레스에 대처하는 능력이 현저히 떨어졌다.",
      "사소한 일에도 짜증이 나고 감정 기복이 심하다.",
      "감기나 염증성 질환에 한 번 걸리면 회복이 매우 더디다.",
      "기억력이 감퇴하고 머릿속이 뿌연 느낌(브레인 포그)이 자주 든다."
    ]
  },
  {
    category: "4. 신체 반응",
    questions: [
      "앉아 있다가 일어설 때 핑 도는 어지러움(기립성 저혈압)을 느낀다.",
      "피부가 건조해지거나 알러지 증상이 심해졌다.",
      "생리 전 증후군(PMS)이 심해지거나 성욕이 눈에 띄게 줄었다."
    ]
  }
];
