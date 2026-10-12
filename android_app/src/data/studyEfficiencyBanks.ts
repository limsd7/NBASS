/**
 * PC studyEfficiencyAssessments.ts와 동일한 문항·채점 규칙 (모바일 이식본)
 * - MEQ 7문항, VARK 8문항, TAI 14문항, 디지털중독 12문항, 메타인지 12문항
 * - 점수 구간·판정 기준은 PC와 1:1 동일
 * - PC 전용 import(CareType 등) 없이 독립 동작
 */

// ========== 1. 크로노타입 검사 (MEQ) ==========
export interface ChronotypeOption {
  text: string;
  score: number;
}
export interface ChronotypeQuestion {
  id: string;
  question: string;
  options: ChronotypeOption[];
}

export const CHRONOTYPE_QUESTIONS: ChronotypeQuestion[] = [
  {
    id: 'meq_1',
    question: '아무 약속이 없다면 아침 몇 시에 일어나고 싶습니까?',
    options: [
      { text: '오전 5:00~6:30', score: 5 },
      { text: '오전 6:30~7:45', score: 4 },
      { text: '오전 7:45~9:45', score: 3 },
      { text: '오전 9:45~11:00', score: 2 },
      { text: '오전 11:00 이후', score: 1 }
    ]
  },
  {
    id: 'meq_2',
    question: '아무 약속이 없다면 밤 몇 시에 자고 싶습니까?',
    options: [
      { text: '오후 8:00~9:00', score: 5 },
      { text: '오후 9:00~10:15', score: 4 },
      { text: '오후 10:15~12:30', score: 3 },
      { text: '오전 12:30~1:45', score: 2 },
      { text: '오전 1:45 이후', score: 1 }
    ]
  },
  {
    id: 'meq_3',
    question: '아침에 일어날 때 알람이 얼마나 필요합니까?',
    options: [
      { text: '알람 없이도 잘 일어남', score: 4 },
      { text: '알람 1개면 충분', score: 3 },
      { text: '알람 2~3개 필요', score: 2 },
      { text: '알람 여러 개에도 일어나기 힘듦', score: 1 }
    ]
  },
  {
    id: 'meq_4',
    question: '오전 중 정신이 가장 맑다고 느끼는 시간은?',
    options: [
      { text: '기상 직후', score: 4 },
      { text: '기상 후 30분~1시간', score: 3 },
      { text: '기상 후 1~2시간', score: 2 },
      { text: '점심 무렵이 되어야 맑아짐', score: 1 }
    ]
  },
  {
    id: 'meq_5',
    question: '가장 집중이 잘 되는 시간대는?',
    options: [
      { text: '오전 8시~12시', score: 5 },
      { text: '오후 12시~4시', score: 3 },
      { text: '오후 4시~8시', score: 2 },
      { text: '오후 8시 이후', score: 1 }
    ]
  },
  {
    id: 'meq_6',
    question: '저녁 시간에 피로를 느끼기 시작하는 때는?',
    options: [
      { text: '오후 8시 이전', score: 5 },
      { text: '오후 8시~9시', score: 4 },
      { text: '오후 9시~10시15분', score: 3 },
      { text: '오후 10시15분~11시45분', score: 2 },
      { text: '오전 12시 이후', score: 1 }
    ]
  },
  {
    id: 'meq_7',
    question: '중요한 시험을 치러야 한다면 언제가 좋겠습니까?',
    options: [
      { text: '오전 8시~10시', score: 5 },
      { text: '오전 11시~오후 1시', score: 3 },
      { text: '오후 3시~5시', score: 2 },
      { text: '오후 7시~9시', score: 1 }
    ]
  }
];

export type ChronotypeResult = 'morning' | 'moderate_morning' | 'neutral' | 'moderate_evening' | 'evening';

export const getChronotypeResult = (score: number): ChronotypeResult => {
  if (score >= 28) return 'morning';
  if (score >= 23) return 'moderate_morning';
  if (score >= 17) return 'neutral';
  if (score >= 12) return 'moderate_evening';
  return 'evening';
};

export const CHRONOTYPE_LABELS: Record<ChronotypeResult, { label: string; goldenTime: string; studyAdvice: string }> = {
  morning: {
    label: '확실한 아침형',
    goldenTime: '오전 6:00~11:00',
    studyAdvice: '새벽~오전에 고난도 과목 배치. 저녁은 복습/암기 위주.'
  },
  moderate_morning: {
    label: '다소 아침형',
    goldenTime: '오전 8:00~12:00',
    studyAdvice: '오전에 핵심 학습 배치. 점심 후 가벼운 복습.'
  },
  neutral: {
    label: '중간형',
    goldenTime: '오전 10:00~오후 2:00, 오후 4:00~7:00',
    studyAdvice: '컨디션에 따라 유연하게 조절. 일정한 수면 패턴 유지가 핵심.'
  },
  moderate_evening: {
    label: '다소 저녁형',
    goldenTime: '오후 3:00~9:00',
    studyAdvice: '오전은 가벼운 복습/워밍업. 오후~저녁에 고난도 학습.'
  },
  evening: {
    label: '확실한 저녁형',
    goldenTime: '오후 5:00~자정',
    studyAdvice: '저녁~밤에 핵심 학습. 시험 2주 전부터 점진적 조정 필요.'
  }
};

/** MEQ 5단계를 모바일 엔진 3버킷으로 매핑 */
export const mapChronotypeToBucket = (r: ChronotypeResult): 'morning' | 'evening' | 'intermediate' => {
  if (r === 'morning' || r === 'moderate_morning') return 'morning';
  if (r === 'evening' || r === 'moderate_evening') return 'evening';
  return 'intermediate';
};

// ========== 2. VARK 검사 ==========
export interface VARKQuestion {
  id: string;
  situation: string;
  options: { text: string; type: 'V' | 'A' | 'R' | 'K' }[];
}

export const VARK_QUESTIONS: VARKQuestion[] = [
  {
    id: 'vark_1',
    situation: '새로운 개념을 배울 때 어떤 방식이 가장 잘 이해되나요?',
    options: [
      { text: '그림, 도표, 다이어그램으로 보기', type: 'V' },
      { text: '선생님이나 강사의 설명 듣기', type: 'A' },
      { text: '교과서나 참고서 읽기', type: 'R' },
      { text: '직접 문제를 풀면서 익히기', type: 'K' }
    ]
  },
  {
    id: 'vark_2',
    situation: '길을 찾아갈 때 어떤 방법을 선호하나요?',
    options: [
      { text: '지도나 네비게이션 화면 보기', type: 'V' },
      { text: '누군가에게 길을 물어보기', type: 'A' },
      { text: '주소나 설명을 적어서 따라가기', type: 'R' },
      { text: '일단 가보면서 찾기', type: 'K' }
    ]
  },
  {
    id: 'vark_3',
    situation: '수학 공식을 외울 때 어떤 방법이 효과적인가요?',
    options: [
      { text: '공식을 시각적으로 표현하거나 색깔로 구분', type: 'V' },
      { text: '공식을 소리 내어 여러 번 읽기', type: 'A' },
      { text: '노트에 정리해서 반복해서 읽기', type: 'R' },
      { text: '공식을 적용한 문제를 많이 풀기', type: 'K' }
    ]
  },
  {
    id: 'vark_4',
    situation: '영어 단어를 외울 때 가장 효과적인 방법은?',
    options: [
      { text: '이미지나 연상 그림과 함께 외우기', type: 'V' },
      { text: '발음을 들으면서 따라 말하기', type: 'A' },
      { text: '단어장에 적어서 반복 읽기', type: 'R' },
      { text: '문장에서 사용하며 손으로 써보기', type: 'K' }
    ]
  },
  {
    id: 'vark_5',
    situation: '시험 전날 최종 점검을 할 때?',
    options: [
      { text: '마인드맵이나 요약 도표 훑어보기', type: 'V' },
      { text: '핵심 내용을 소리 내어 복습하기', type: 'A' },
      { text: '노트 필기를 처음부터 끝까지 읽기', type: 'R' },
      { text: '핵심 문제 몇 개를 직접 풀어보기', type: 'K' }
    ]
  },
  {
    id: 'vark_6',
    situation: '강의를 들을 때 집중이 잘 되는 상황은?',
    options: [
      { text: 'PPT나 판서가 잘 정리된 수업', type: 'V' },
      { text: '선생님 설명이 재미있고 명확한 수업', type: 'A' },
      { text: '프린트 자료가 주어지는 수업', type: 'R' },
      { text: '직접 참여하거나 실습하는 수업', type: 'K' }
    ]
  },
  {
    id: 'vark_7',
    situation: '기억이 잘 안 날 때 떠올리는 방식은?',
    options: [
      { text: '그 내용이 있던 페이지나 위치를 떠올림', type: 'V' },
      { text: '들었던 설명이나 목소리를 떠올림', type: 'A' },
      { text: '적어둔 문장이나 단어를 떠올림', type: 'R' },
      { text: '그때 했던 행동이나 상황을 떠올림', type: 'K' }
    ]
  },
  {
    id: 'vark_8',
    situation: '새로운 기기 사용법을 배울 때?',
    options: [
      { text: '그림/동영상 설명서 보기', type: 'V' },
      { text: '누군가에게 설명 듣기', type: 'A' },
      { text: '매뉴얼 읽기', type: 'R' },
      { text: '직접 이것저것 눌러보기', type: 'K' }
    ]
  }
];

export interface VARKResult {
  V: number;
  A: number;
  R: number;
  K: number;
  primary: 'V' | 'A' | 'R' | 'K' | 'multi';
  secondary?: 'V' | 'A' | 'R' | 'K';
}

export const calculateVARKResult = (answers: ('V' | 'A' | 'R' | 'K' | null)[]): VARKResult => {
  const counts = { V: 0, A: 0, R: 0, K: 0 };
  answers.forEach(t => { if (t) counts[t]++; });
  const sorted = (Object.entries(counts) as ['V' | 'A' | 'R' | 'K', number][]).sort((a, b) => b[1] - a[1]);
  const [first, second] = sorted;
  const isMulti = first[1] - second[1] <= 1 && first[1] > 0;
  return {
    ...counts,
    primary: isMulti ? 'multi' : first[0],
    secondary: isMulti ? second[0] : undefined
  };
};

export const VARK_LABELS: Record<'V' | 'A' | 'R' | 'K' | 'multi', { label: string; studyMethods: string[] }> = {
  V: { label: '시각형 (Visual)', studyMethods: ['마인드맵과 개념도 적극 활용', '형광펜으로 색깔 코딩', '표와 그래프로 정보 정리'] },
  A: { label: '청각형 (Auditory)', studyMethods: ['소리 내어 읽고 암기', '토론이나 스터디 그룹 효과적', '녹음해서 반복 청취'] },
  R: { label: '읽기/쓰기형 (Read/Write)', studyMethods: ['교과서/참고서 정독', '필기 노트 꼼꼼히 작성', '요약본 직접 만들기'] },
  K: { label: '운동감각형 (Kinesthetic)', studyMethods: ['문제 풀이 중심 학습', '손으로 쓰며 암기', '서서 또는 걸으며 공부'] },
  multi: { label: '복합형 (Multimodal)', studyMethods: ['과목/상황에 따라 방법 혼용', '다양한 자료 형태 활용', '복합적 접근이 기억 강화'] }
};

// ========== 3. TAI 검사 ==========
export interface TAIQuestion {
  id: string;
  question: string;
  dimension: 'cognitive' | 'somatic';
}

export const TAI_QUESTIONS: TAIQuestion[] = [
  { id: 'tai_c1', question: '시험 중 다른 학생들이 나보다 잘 할 것 같다는 생각이 든다.', dimension: 'cognitive' },
  { id: 'tai_c2', question: '시험을 망치면 어떡하지 하는 걱정이 계속된다.', dimension: 'cognitive' },
  { id: 'tai_c3', question: '시험 결과가 나쁘면 부모님/선생님이 실망할까 걱정된다.', dimension: 'cognitive' },
  { id: 'tai_c4', question: '시험 중 알던 내용도 기억이 안 나서 당황한다.', dimension: 'cognitive' },
  { id: 'tai_c5', question: '시험 전 "이번에도 못 보면..."하는 부정적 생각이 맴돈다.', dimension: 'cognitive' },
  { id: 'tai_c6', question: '시험 결과가 내 미래를 결정한다고 느껴 부담된다.', dimension: 'cognitive' },
  { id: 'tai_c7', question: '시험 중 시간이 부족할 것 같아 초조하다.', dimension: 'cognitive' },
  { id: 'tai_s1', question: '시험 전날이나 당일 아침에 배가 아프거나 소화가 안 된다.', dimension: 'somatic' },
  { id: 'tai_s2', question: '시험 중 손이 떨리거나 땀이 난다.', dimension: 'somatic' },
  { id: 'tai_s3', question: '시험장에서 심장이 두근거리거나 숨이 가빠진다.', dimension: 'somatic' },
  { id: 'tai_s4', question: '시험 중 목이나 어깨 근육이 뻣뻣해진다.', dimension: 'somatic' },
  { id: 'tai_s5', question: '시험 전 잠이 잘 안 오거나 자주 깬다.', dimension: 'somatic' },
  { id: 'tai_s6', question: '시험 볼 때 입이 마르거나 화장실이 자주 가고 싶다.', dimension: 'somatic' },
  { id: 'tai_s7', question: '시험 전 두통이나 어지러움을 느낀다.', dimension: 'somatic' }
];

export interface TAIResult {
  cognitiveScore: number;
  somaticScore: number;
  totalScore: number;
  dominantType: 'cognitive' | 'somatic' | 'balanced';
  severity: 'low' | 'moderate' | 'high';
}

export const calculateTAIResult = (answers: number[]): TAIResult => {
  const cognitive = answers.slice(0, 7).reduce((a, b) => a + b, 0);
  const somatic = answers.slice(7, 14).reduce((a, b) => a + b, 0);
  const total = cognitive + somatic;
  let dominantType: 'cognitive' | 'somatic' | 'balanced';
  if (cognitive > somatic + 3) dominantType = 'cognitive';
  else if (somatic > cognitive + 3) dominantType = 'somatic';
  else dominantType = 'balanced';
  let severity: 'low' | 'moderate' | 'high';
  if (total <= 21) severity = 'low';
  else if (total <= 35) severity = 'moderate';
  else severity = 'high';
  return { cognitiveScore: cognitive, somaticScore: somatic, totalScore: total, dominantType, severity };
};

export const TAI_TYPE_LABELS: Record<'cognitive' | 'somatic' | 'balanced', { label: string; strategies: string[] }> = {
  cognitive: {
    label: '인지적 걱정 우세',
    strategies: ['인지 재구조화: 부정적 생각을 객관적으로 검토', '걱정 시간 제한: 하루 10분만 걱정하고 나머지는 학습', '현실적 목표 설정: 100점이 아닌 "할 수 있는 최선"']
  },
  somatic: {
    label: '신체적 긴장 우세',
    strategies: ['4-7-8 호흡법 훈련 (매일 연습)', '점진적 근육 이완법 (목, 어깨 위주)', '카페인/당류 제한 (시험 전날부터)']
  },
  balanced: {
    label: '인지+신체 복합형',
    strategies: ['마음챙김 명상: 생각과 신체 감각 동시 관찰', '호흡법 + 긍정 자기대화 병행', '시험 루틴 확립으로 예측 가능성 높이기']
  }
};

// ========== 4. 디지털 중독 검사 ==========
export interface DigitalAddictionQuestion {
  id: string;
  question: string;
  category: 'tolerance' | 'withdrawal' | 'control' | 'impact';
}

export const DIGITAL_ADDICTION_QUESTIONS: DigitalAddictionQuestion[] = [
  { id: 'da_t1', question: '스마트폰/SNS 사용 시간이 점점 늘어났다.', category: 'tolerance' },
  { id: 'da_t2', question: '짧은 영상(숏폼)을 보면 시간 가는 줄 모른다.', category: 'tolerance' },
  { id: 'da_t3', question: '이전보다 더 자극적인 콘텐츠를 찾게 된다.', category: 'tolerance' },
  { id: 'da_w1', question: '폰이 없으면 불안하거나 초조하다.', category: 'withdrawal' },
  { id: 'da_w2', question: '알림을 확인하지 않으면 찝찝하다.', category: 'withdrawal' },
  { id: 'da_w3', question: '공부 중에도 폰이 신경 쓰인다.', category: 'withdrawal' },
  { id: 'da_c1', question: '"5분만" 하려다 30분 이상 지나간 적이 많다.', category: 'control' },
  { id: 'da_c2', question: '폰 사용을 줄이려 했지만 실패한 적이 있다.', category: 'control' },
  { id: 'da_c3', question: '자기 전 폰을 보다가 늦게 자는 경우가 많다.', category: 'control' },
  { id: 'da_i1', question: '폰 때문에 공부 계획을 못 지킨 적이 있다.', category: 'impact' },
  { id: 'da_i2', question: '수업/공부 중 폰을 몰래 확인한다.', category: 'impact' },
  { id: 'da_i3', question: '책/교과서를 읽다가 지루해서 폰을 찾게 된다.', category: 'impact' }
];

export interface DigitalAddictionResult {
  toleranceScore: number;
  withdrawalScore: number;
  controlScore: number;
  impactScore: number;
  totalScore: number;
  level: 'healthy' | 'caution' | 'risk' | 'addiction';
  dopamineStatus: string;
}

export const calculateDigitalAddictionResult = (answers: number[]): DigitalAddictionResult => {
  const tolerance = answers.slice(0, 3).reduce((a, b) => a + b, 0);
  const withdrawal = answers.slice(3, 6).reduce((a, b) => a + b, 0);
  const control = answers.slice(6, 9).reduce((a, b) => a + b, 0);
  const impact = answers.slice(9, 12).reduce((a, b) => a + b, 0);
  const total = tolerance + withdrawal + control + impact;
  let level: 'healthy' | 'caution' | 'risk' | 'addiction';
  let dopamineStatus: string;
  if (total <= 12) {
    level = 'healthy';
    dopamineStatus = '정상: 도파민 보상 체계가 건강합니다.';
  } else if (total <= 24) {
    level = 'caution';
    dopamineStatus = '주의: 도파민 민감도가 다소 저하되었을 수 있습니다.';
  } else if (total <= 36) {
    level = 'risk';
    dopamineStatus = '경계: 도파민 수용체 둔감화가 진행 중일 수 있습니다.';
  } else {
    level = 'addiction';
    dopamineStatus = '위험: 즉각적 보상에 길들여져 지연된 보상(공부)이 어렵습니다.';
  }
  return { toleranceScore: tolerance, withdrawalScore: withdrawal, controlScore: control, impactScore: impact, totalScore: total, level, dopamineStatus };
};

export const DIGITAL_LEVEL_LABELS: Record<'healthy' | 'caution' | 'risk' | 'addiction', { label: string; protocols: string[] }> = {
  healthy: { label: '건강 (양호)', protocols: ['현재 습관 유지', '공부 시간에는 폰 다른 방에 두기'] },
  caution: { label: '주의 (경미)', protocols: ['알림 끄기 (학습 시간)', '취침 1시간 전 폰 사용 중단', '주 1회 "폰 프리 데이" 시도'] },
  risk: { label: '경계 (중등도)', protocols: ['앱 타이머 강제 설정', '그레이스케일 모드 사용', '2주간 "디지털 디톡스" 프로토콜'] },
  addiction: { label: '위험 (심각)', protocols: ['숏폼/게임 앱 완전 삭제', '부모님께 폰 보관 요청', '4주간 집중 디톡스 프로토콜'] }
};

// ========== 5. 메타인지 학습 전략 검사 (MSLQ 기반, 12문항) ==========
export interface MetacognitionQuestion {
  id: string;
  question: string;
  strategy: 'rehearsal' | 'elaboration' | 'organization' | 'metacognitive';
}

export const METACOGNITION_QUESTIONS: MetacognitionQuestion[] = [
  { id: 'meta_r1', question: '중요한 내용은 여러 번 소리 내어 읽어서 외운다.', strategy: 'rehearsal' },
  { id: 'meta_r2', question: '암기할 내용은 반복해서 쓰면서 외운다.', strategy: 'rehearsal' },
  { id: 'meta_r3', question: '시험 범위를 처음부터 끝까지 여러 번 읽는다.', strategy: 'rehearsal' },
  { id: 'meta_e1', question: '새로운 개념을 배울 때 이미 알던 것과 연결지어 생각한다.', strategy: 'elaboration' },
  { id: 'meta_e2', question: '내용을 내 말로 바꿔서 이해하려고 노력한다.', strategy: 'elaboration' },
  { id: 'meta_e3', question: '예시나 실생활 상황에 적용해보며 이해한다.', strategy: 'elaboration' },
  { id: 'meta_o1', question: '내용을 학습하기 전에 목차나 전체 구조를 파악한다.', strategy: 'organization' },
  { id: 'meta_o2', question: '노트 정리 시 개념들 간의 관계를 표나 도표로 나타낸다.', strategy: 'organization' },
  { id: 'meta_o3', question: '핵심 키워드를 추출하여 마인드맵이나 요약본을 만든다.', strategy: 'organization' },
  { id: 'meta_m1', question: '공부하면서 내가 이해했는지 스스로 점검한다.', strategy: 'metacognitive' },
  { id: 'meta_m2', question: '모르는 부분이 있으면 다시 돌아가서 확인한다.', strategy: 'metacognitive' },
  { id: 'meta_m3', question: '공부 방법이 효과적인지 스스로 평가하고 조정한다.', strategy: 'metacognitive' }
];

export interface MetacognitionResult {
  rehearsalScore: number;
  elaborationScore: number;
  organizationScore: number;
  metacognitiveScore: number;
  dominantStrategy: 'rehearsal' | 'elaboration' | 'organization' | 'metacognitive' | 'balanced';
  learnerLevel: 'beginner' | 'developing' | 'proficient' | 'expert';
}

export const calculateMetacognitionResult = (answers: number[]): MetacognitionResult => {
  const rehearsal = answers.slice(0, 3).reduce((a, b) => a + b, 0);
  const elaboration = answers.slice(3, 6).reduce((a, b) => a + b, 0);
  const organization = answers.slice(6, 9).reduce((a, b) => a + b, 0);
  const metacognitive = answers.slice(9, 12).reduce((a, b) => a + b, 0);
  const scores = { rehearsal, elaboration, organization, metacognitive };
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const [first, second] = sorted;
  let dominantStrategy: 'rehearsal' | 'elaboration' | 'organization' | 'metacognitive' | 'balanced';
  if (first[1] - second[1] <= 2) {
    dominantStrategy = 'balanced';
  } else {
    dominantStrategy = first[0] as any;
  }
  const advancedScore = elaboration + organization + metacognitive;
  let learnerLevel: 'beginner' | 'developing' | 'proficient' | 'expert';
  if (advancedScore <= 15) learnerLevel = 'beginner';
  else if (advancedScore <= 24) learnerLevel = 'developing';
  else if (advancedScore <= 33) learnerLevel = 'proficient';
  else learnerLevel = 'expert';
  return { rehearsalScore: rehearsal, elaborationScore: elaboration, organizationScore: organization, metacognitiveScore: metacognitive, dominantStrategy, learnerLevel };
};

export const METACOG_STRATEGY_LABELS: Record<string, string> = {
  rehearsal: '시연(반복 암기)형',
  elaboration: '정교화(이해 연결)형',
  organization: '조직화(구조화)형',
  metacognitive: '자기점검형',
  balanced: '균형형'
};

export const METACOG_LEVEL_LABELS: Record<'beginner' | 'developing' | 'proficient' | 'expert', string> = {
  beginner: '초보 학습자',
  developing: '발전 중인 학습자',
  proficient: '능숙한 학습자',
  expert: '전문 학습자'
};
