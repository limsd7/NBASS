export interface CareTypeDetail {
  code: string;
  emoji: string;
  title: string;
  subtitle: string;
  physiology: string;
  studyImpact: string;
  prescription: string;
  color: string;
}

export const CARE_TYPES: CareTypeDetail[] = [
  {
    code: "BURNOUT",
    emoji: "🔥",
    title: "과긴장 번아웃",
    subtitle: "교감신경 과활성 + 신체/뇌 피로 극도 누적",
    physiology: "과도한 긴장이 지속되어 에너지 배터리가 완전 방전된 상태. 억지 공부 시 회복 탄력성 붕괴 및 두뇌 효율 급감",
    studyImpact: "책상에 앉아 있어도 암기력이 현저히 떨어지고, 10분만 책을 봐도 극심한 두통과 무기력이 찾아와 공부 지속 불가",
    prescription: "25분 집중 + 10분 완전 휴식(산책/스트레칭) 뽀모도로 철저 적용, 암기 위주보다는 가벼운 개념 구조화 위주로 학습 부하 경감",
    color: "bg-rose-500/10 text-rose-700 border-rose-500/20",
  },
  {
    code: "ANXIETY_TENSION",
    emoji: "😰",
    title: "불안-긴장형",
    subtitle: "높은 불안 척도 + High Beta파 과각성",
    physiology: "시험지나 압박 상황에서 편도체 폭주로 머리가 하얘지는(Freezing) 시험 불안 및 심장 박동 급증",
    studyImpact: "평소 실력이 좋다가도 시험장이나 모의고사만 보면 긴장하여 아는 문제도 실수로 틀리거나 시간 배분에 실패",
    prescription: "시험 직전 4-7-8 호흡법 3회 실시, 실전 모의고사 타임어택 훈련을 통해 압박 상황에 뇌를 노출하여 적절한 대처력 배양",
    color: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  },
  {
    code: "STRESS_OVERLOAD",
    emoji: "⚡",
    title: "스트레스 과부하",
    subtitle: "스트레스 저항도(SDNN/RMSSD) 급감",
    physiology: "사소한 자극이나 주변 소음에도 쉽게 예민해지고 감정 조절이 어려워지는 자율신경 불균형 상태",
    studyImpact: "주변의 작은 소음(친구 목소리, 볼펜 소리)에도 쉽게 흐트러져 집중 시간이 쪼개지고 짜증과 피로가 누적됨",
    prescription: "노이즈 캔슬링 이어폰 및 백색소음 활용, 독서실보다는 독립된 공간이나 도서관 1인실 활용 권장",
    color: "bg-orange-500/10 text-orange-700 border-orange-500/20",
  },
  {
    code: "LOW_ENERGY",
    emoji: "😴",
    title: "무기력형",
    subtitle: "부교감신경 우세 + 신체 활력도(Vitality) 저하",
    physiology: "몸이 젖은 솜처럼 무겁고 축 처지며, 공부를 시작할 기초 체력과 의욕이 고갈된 상태",
    studyImpact: "의자에 앉는 것 자체가 큰 고통이며, 책을 펼쳐도 글자가 눈에 들어오지 않고 멍하게 시간만 경과",
    prescription: "가벼운 유산소 운동(15분 조깅)으로 심박수를 높인 후 공부 시작, 책상에 앉자마자 가장 쉬운 문제 1개 풀기로 도파민 자극",
    color: "bg-purple-500/10 text-purple-700 border-purple-500/20",
  },
  {
    code: "DEPRESSION_AMOTIVATION",
    emoji: "😔",
    title: "우울-무동기형",
    subtitle: "세타파 우세 + 보상 회로(도파민) 둔화",
    physiology: "학습에 대한 흥미와 성취감이 상실되고, 기분이 가라앉아 장기 목표를 세우기 힘든 상태",
    studyImpact: "내가 왜 공부를 해야 하는지 회의감이 들고, 성적이 안 오를 것이라는 무력감에 지배됨",
    prescription: "거창한 목표 대신 '오늘 단어 10개 외우기' 같은 초소형 성취 과제를 설정하고 매일 달성 체크하여 도파민 회로 재활",
    color: "bg-indigo-500/10 text-indigo-700 border-indigo-500/20",
  },
  {
    code: "ADRENAL",
    emoji: "🥱",
    title: "부신피로 증후군",
    subtitle: "코르티솔 일주기 리듬 붕괴",
    physiology: "스트레스 호르몬 조절 기능이 약해져, 아침 기상이 극도로 힘들고 오후 4시 전후 급격한 방전 발생",
    studyImpact: "오전 수업 시간에 멍하고 졸음이 쏟아지며, 오후 늦게야 겨우 정신이 들어 야간 학습 패턴으로 악순환",
    prescription: "밤 10시~새벽 2시 수면 골든타임 사수, 카페인 음료 전면 중단 및 미네랄/비타민B 섭취로 부신 기능 회복",
    color: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
  },
  {
    code: "BRAIN_FATIGUE",
    emoji: "🧠",
    title: "뇌피로 집중곤란",
    subtitle: "뇌 대사 과부하 + 글림프 독소 누적",
    physiology: "머리에 안개가 낀 듯 멍하고(Brain Fog), 뇌 처리 속도 및 작업 기억 용량이 현저히 저하된 상태",
    studyImpact: "문제를 읽어도 무슨 뜻인지 이해가 안 되어 3번씩 다시 읽고, 단순 계산 실수나 마킹 실수가 잦아짐",
    prescription: "50분 공부 후 10분 먼 산 바라보기 및 눈 감기(스크린 타임 완전 금지), 뇌 혈류 개선을 위한 충분한 수분 섭취",
    color: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  },
  {
    code: "HYPERSENSITIVE",
    emoji: "⚠️",
    title: "과민성 학습장애",
    subtitle: "감각 신경 과각성 + 자극 차단력 저하",
    physiology: "뇌가 주변의 모든 시청각 자극에 민감하게 반응하여 중요 정보와 노이즈를 구별하지 못함",
    studyImpact: "주변 사람이 지나가거나 책장 넘기는 소리에도 시선이 돌아가 집중의 흐름이 계속해서 끊김",
    prescription: "책상 위 시각적 노이즈 완전 제거(책 1권만 두기), 가림막 스터디룸 활용 및 시각 자극 통제",
    color: "bg-red-500/10 text-red-700 border-red-500/20",
  },
  {
    code: "ATTENTION_DEFICIT",
    emoji: "🎯",
    title: "주의력 산만형",
    subtitle: "전두엽 알파파 과다 + 작업기억 인출 지연",
    physiology: "뇌의 각성도가 떨어져 멍한 상태가 지속되거나, 한 가지 과제에 진득하게 집중하지 못함",
    studyImpact: "문제를 풀다가 딴생각에 빠지거나, 15분 이상 진득하게 문제를 붙잡고 있지 못하고 핸드폰을 켬",
    prescription: "스톱워치 활용 타임어택 훈련(15분 단위 블록), 백지 복습법으로 능동적 뇌 자극 유도",
    color: "bg-cyan-500/10 text-cyan-700 border-cyan-500/20",
  },
  {
    code: "SLEEP",
    emoji: "🌙",
    title: "수면 장애형",
    subtitle: "ISI 불면 점수 고위험 + 수면 효율 저하",
    physiology: "잠드는 데 30분 이상 걸리거나 자주 깨어 깊은 수면(NREM) 단계에 도달하지 못함",
    studyImpact: "만성적인 낮 졸음으로 학교 수업 시간에 집중하지 못하고, 암기한 내용이 장기 기억으로 전환되지 않음",
    prescription: "취침 1시간 전 스마트폰 완전 격리, 아침 기상 직후 15분 햇빛 쬐기로 멜라토닌 분비 주기 정상화",
    color: "bg-indigo-500/10 text-indigo-700 border-indigo-500/20",
  },
  {
    code: "CIRCULATION",
    emoji: "💔",
    title: "혈액순환 저하형",
    subtitle: "말초 혈관 수축 + 뇌 혈류량 부족",
    physiology: "손발이 차고 저리며, 뇌로 가는 혈류 및 산소 공급 부족으로 두통과 피로감 유발",
    studyImpact: "오래 앉아 있으면 다리가 붓고 머리가 무거워져 학습 집중 지속 시간이 짧아짐",
    prescription: "1시간마다 3분 발목 스트레칭 및 따뜻한 온수 섭취, 가벼운 제자리 걷기로 혈류 순환 촉진",
    color: "bg-pink-500/10 text-pink-700 border-pink-500/20",
  },
  {
    code: "HEALTHY",
    emoji: "💚",
    title: "건강 균형형",
    subtitle: "자율신경 안정 + 최적 인지 동기화",
    physiology: "신체적·정신적 컨디션이 매우 양호하며, 뇌의 인지 기능과 자율신경계가 최상의 조화를 이룸",
    studyImpact: "공부한 만큼 100% 흡수되는 상태로, 고난도 킬러 문항 대비 및 장기 학습 레이스에 최적",
    prescription: "현재의 좋은 수면/식습관 루틴을 유지하면서, 고난도 심화 문제 풀이와 실전 모의고사 반복",
    color: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  },
];

export const CARE_TYPE_ALIAS_MAP: Record<string, string> = {
  // Enum values from CareType in types.ts
  'Hyper-Tension Burnout': 'BURNOUT',
  'Anxiety-Tension': 'ANXIETY_TENSION',
  'Stress Overload': 'STRESS_OVERLOAD',
  'Low-Energy Fatigue': 'LOW_ENERGY',
  'Depression-Amotivation': 'DEPRESSION_AMOTIVATION',
  'Adrenal Fatigue': 'ADRENAL',
  'Brain Fatigue': 'BRAIN_FATIGUE',
  'Hypersensitive Learning': 'HYPERSENSITIVE',
  'Attention Deficit': 'ATTENTION_DEFICIT',
  'Sleep Dysfunction': 'SLEEP',
  'Poor Circulation': 'CIRCULATION',
  'Healthy Balance': 'HEALTHY',
  'Concentration Deficiency': 'ATTENTION_DEFICIT',

  // Korean names & short forms
  '과긴장 번아웃': 'BURNOUT',
  '과긴장': 'BURNOUT',
  '번아웃': 'BURNOUT',
  '과긴장번아웃': 'BURNOUT',
  '불안-긴장형': 'ANXIETY_TENSION',
  '불안-긴장': 'ANXIETY_TENSION',
  '불안긴장': 'ANXIETY_TENSION',
  '불안': 'ANXIETY_TENSION',
  '스트레스 과부하': 'STRESS_OVERLOAD',
  '스트레스과부하': 'STRESS_OVERLOAD',
  '스트레스': 'STRESS_OVERLOAD',
  '무기력형': 'LOW_ENERGY',
  '무기력': 'LOW_ENERGY',
  '우울-무동기형': 'DEPRESSION_AMOTIVATION',
  '우울-무동기': 'DEPRESSION_AMOTIVATION',
  '우울무동기': 'DEPRESSION_AMOTIVATION',
  '우울': 'DEPRESSION_AMOTIVATION',
  '부신피로 증후군': 'ADRENAL',
  '부신피로': 'ADRENAL',
  '부신피로증후군': 'ADRENAL',
  '뇌피로 집중곤란': 'BRAIN_FATIGUE',
  '뇌피로': 'BRAIN_FATIGUE',
  '뇌피로집중곤란': 'BRAIN_FATIGUE',
  '과민성 학습장애': 'HYPERSENSITIVE',
  '과민성': 'HYPERSENSITIVE',
  '과민성학습장애': 'HYPERSENSITIVE',
  '주의력 산만형': 'ATTENTION_DEFICIT',
  '주의력 산만': 'ATTENTION_DEFICIT',
  '주의력산만': 'ATTENTION_DEFICIT',
  '주의력': 'ATTENTION_DEFICIT',
  '수면 장애형': 'SLEEP',
  '수면장애': 'SLEEP',
  '수면장애형': 'SLEEP',
  '수면': 'SLEEP',
  '혈액순환 저하형': 'CIRCULATION',
  '혈액순환': 'CIRCULATION',
  '혈액순환저하형': 'CIRCULATION',
  '건강 균형형': 'HEALTHY',
  '건강균형': 'HEALTHY',
  '건강균형형': 'HEALTHY',
  '건강': 'HEALTHY',
  '집중력 저하형': 'ATTENTION_DEFICIT',
  '집중력저하': 'ATTENTION_DEFICIT',
};

export function normalizeCareTypeCode(code?: string): string {
  if (!code) return "HEALTHY";
  const trimmed = code.trim();
  
  // 1. Direct Alias Map
  if (CARE_TYPE_ALIAS_MAP[trimmed]) {
    return CARE_TYPE_ALIAS_MAP[trimmed];
  }
  
  // 2. Exact code match (e.g. "BURNOUT", "burnout")
  const upper = trimmed.toUpperCase().replace(/[-\s]/g, '_');
  if (CARE_TYPES.some(c => c.code === upper)) {
    return upper;
  }

  // 3. Match against title / subtitle / description
  const matched = CARE_TYPES.find(c => 
    c.title === trimmed || 
    c.title.includes(trimmed) || 
    trimmed.includes(c.title) || 
    c.code.includes(upper)
  );
  if (matched) return matched.code;

  return "HEALTHY";
}

export function getCareTypeDetail(code?: string): CareTypeDetail {
  if (!code) return CARE_TYPES.find((c) => c.code === "HEALTHY") || CARE_TYPES[0];
  const normalizedCode = normalizeCareTypeCode(code);
  const found = CARE_TYPES.find((c) => c.code === normalizedCode);
  return found || CARE_TYPES.find((c) => c.code === "HEALTHY") || CARE_TYPES[0];
}
