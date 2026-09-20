import { CareType } from '../types';

export const CARE_TYPES: CareType[] = [
  {
    id: 'burnout',
    emoji: '🔥',
    symbol: '과긴장 번아웃',
    title: '과긴장 번아웃형',
    subtitle: '교감신경 과활성 + 신체/뇌 피로 극도 누적',
    traits: '과도한 긴장이 지속되어 에너지 배터리가 완전 방전된 상태. 억지 공부 시 회복 탄력성 붕괴 및 두뇌 효율 급감',
    solution: '25분 집중 + 10분 완전 휴식(산책/스트레칭) 뽀모도로 철저 적용, 암기 위주보다는 가벼운 개념 구조화 위주로 학습 부하 경감',
    pomodoroWork: 25,
    pomodoroBreak: 10,
    category: 'burnout',
    breakGuide: {
      title: '산책 및 전신 가벼운 스트레칭',
      description: '자리에서 일어나 창밖을 보며 가벼운 심호흡과 함께 어깨 및 목 돌리기 스트레칭을 10분간 진행합니다.',
      type: 'stretching',
      durationMinutes: 10
    }
  },
  {
    id: 'anxiety',
    emoji: '😰',
    symbol: '불안-긴장형',
    title: '불안-긴장형',
    subtitle: '높은 불안 척도 + High Beta파 과각성',
    traits: '시험지나 압박 상황에서 편도체 폭주로 머리가 하얘지는(Freezing) 시험 불안 및 심장 박동 급증',
    solution: '시험 직전 4-7-8 호흡법 3회 실시, 실전 모의고사 타임어택 훈련을 통해 압박 상황에 뇌를 노출하여 적절한 대처력 배양',
    pomodoroWork: 30,
    pomodoroBreak: 10,
    category: 'anxiety',
    breakGuide: {
      title: '4-7-8 이완 호흡법',
      description: '4초간 숨을 들이쉬고, 7초간 멈춘 뒤, 8초간 천천히 내쉬기를 3회 반복하여 부교감신경을 활성화하세요.',
      type: 'breathing',
      durationMinutes: 5
    }
  },
  {
    id: 'stress_overload',
    emoji: '⚡',
    symbol: '스트레스 과부하',
    title: '스트레스 과부하형',
    subtitle: '스트레스 저항도(SDNN/RMSSD) 급감',
    traits: '사소한 자극이나 주변 소음에도 쉽게 예민해지고 감정 조절이 어려워지는 자율신경 불균형 상태',
    solution: '노이즈 캔슬링 이어폰 및 백색소음 활용, 독서실보다는 독립된 공간이나 도서관 1인실 활용 권장',
    pomodoroWork: 35,
    pomodoroBreak: 10,
    category: 'fatigue',
    breakGuide: {
      title: '백색소음 속 눈 감기 및 명상',
      description: '이어폰을 착용하고 잔잔한 파도 소리나 숲 소리를 들으며 눈을 감고 잡념을 비웁니다.',
      type: 'meditation',
      durationMinutes: 10
    }
  },
  {
    id: 'lethargy',
    emoji: '😴',
    symbol: '무기력형',
    title: '무기력형',
    subtitle: '부교감신경 우세 + 신체 활력도(Vitality) 저하',
    traits: '몸이 젖은 솜처럼 무겁고 축 처지며, 공부를 시작할 기초 체력과 의욕이 고갈된 상태',
    solution: '가벼운 유산소 운동(15분 조깅/걷기)으로 심박수를 높인 후 공부 시작, 책상에 앉자마자 가장 쉬운 문제 1개 풀기로 도파민 자극',
    pomodoroWork: 25,
    pomodoroBreak: 10,
    category: 'fatigue',
    breakGuide: {
      title: '가벼운 제자리 뛰기 및 수분 보충',
      description: '자리에서 일어나 제자리 걸음 50회와 시원한 물 한 잔으로 혈액 순환을 촉진합니다.',
      type: 'walk',
      durationMinutes: 10
    }
  },
  {
    id: 'unmotivated',
    emoji: '😔',
    symbol: '우울-무동기형',
    title: '우울-무동기형',
    subtitle: '세타파 우세 + 보상 회로(도파민) 둔화',
    traits: '학습에 대한 흥미와 성취감이 상실되고, 기분이 가라앉아 장기 목표를 세우기 힘든 상태',
    solution: "거창한 목표 대신 '오늘 단어 10개 외우기' 같은 초소형 성취 과제를 설정하고 매일 달성 체크하여 도파민 회로 재활",
    pomodoroWork: 20,
    pomodoroBreak: 10,
    category: 'burnout',
    breakGuide: {
      title: '칭찬 일기 및 마인드 리프레시',
      description: '방금 마친 작은 학습 단계를 스스로 칭찬하고, 좋아하는 음악을 1곡 감상합니다.',
      type: 'meditation',
      durationMinutes: 10
    }
  },
  {
    id: 'adrenal_fatigue',
    emoji: '🥱',
    symbol: '부신피로 증후군',
    title: '부신피로 증후군형',
    subtitle: '코르티솔 일주기 리듬 붕괴',
    traits: '스트레스 호르몬 조절 기능이 약해져, 아침 기상이 극도로 힘들고 오후 4시 전후 급격한 방전 발생',
    solution: '밤 10시~새벽 2시 수면 골든타임 사수, 카페인 음료 전면 중단 및 미네랄/비타민B 섭취로 부신 기능 회복',
    pomodoroWork: 40,
    pomodoroBreak: 15,
    category: 'sleep',
    breakGuide: {
      title: '오후 파워 냅(Power Nap) 및 눈 피로 회복',
      description: '오후 피크타임에 10분간 책상에 엎드려 깊은 복식호흡과 함께 눈 휴식을 취합니다.',
      type: 'meditation',
      durationMinutes: 15
    }
  },
  {
    id: 'brain_fog',
    emoji: '🧠',
    symbol: '뇌피로 집중곤란',
    title: '뇌피로 집중곤란형',
    subtitle: '뇌 대사 과부하 + 글림프 독소 누적',
    traits: '머리에 안개가 낀 듯 멍하고(Brain Fog), 뇌 처리 속도 및 작업 기억 용량이 현저히 저하된 상태',
    solution: '50분 공부 후 10분 먼 산 바라보기 및 눈 감기(스크린 타임 완전 금지), 뇌 혈류 개선을 위한 충분한 수분 섭취',
    pomodoroWork: 45,
    pomodoroBreak: 10,
    category: 'focus',
    breakGuide: {
      title: '원거리 응시 및 눈 운동',
      description: '창밖 가장 먼 곳을 1분간 바라본 뒤, 눈을 감고 안구 운동을 상하좌우로 부드럽게 실시합니다.',
      type: 'stretching',
      durationMinutes: 10
    }
  },
  {
    id: 'sensory_hyper',
    emoji: '⚠️',
    symbol: '과민성 학습장애',
    title: '과민성 학습장애형',
    subtitle: '감각 신경 과각성 + 자극 차단력 저하',
    traits: '뇌가 주변의 모든 시청각 자극에 민감하게 반응하여 중요 정보와 노이즈를 구별하지 못함',
    solution: '책상 위 시각적 노이즈 완전 제거(책 1권만 두기), 가림막 스터디룸 활용 및 시각 자극 통제',
    pomodoroWork: 35,
    pomodoroBreak: 10,
    category: 'focus',
    breakGuide: {
      title: '시각 차단 암막 휴식',
      description: '잠시 조명을 낮추거나 안대를 착용하고 시각적 자극을 완전히 차단한 채 뇌를 쉽니다.',
      type: 'meditation',
      durationMinutes: 10
    }
  },
  {
    id: 'distracted',
    emoji: '🎯',
    symbol: '주의력 산만형',
    title: '주의력 산만형',
    subtitle: '전두엽 알파파 과다 + 작업기억 인출 지연',
    traits: '뇌의 각성도가 떨어져 멍한 상태가 지속되거나, 한 가지 과제에 진득하게 집중하지 못함',
    solution: '스톱워치 활용 타임어택 훈련(15분 단위 블록), 백지 복습법으로 능동적 뇌 자극 유도',
    pomodoroWork: 25,
    pomodoroBreak: 10,
    category: 'focus',
    breakGuide: {
      title: '백지 키워드 인출 스트레칭',
      description: '쉬는 시간 직전 공부한 내용을 머릿속으로 떠올려보고 가볍게 몸을 움직입니다.',
      type: 'stretching',
      durationMinutes: 10
    }
  },
  {
    id: 'sleep_disorder',
    emoji: '🌙',
    symbol: '수면 장애형',
    title: '수면 장애형',
    subtitle: 'ISI 불면 점수 고위험 + 수면 효율 저하',
    traits: '잠드는 데 30분 이상 걸리거나 자주 깨어 깊은 수면(NREM) 단계에 도달하지 못함',
    solution: '취침 1시간 전 스마트폰 완전 격리, 아침 기상 직후 15분 햇빛 쬐기로 멜라토닌 분비 주기 정상화',
    pomodoroWork: 40,
    pomodoroBreak: 10,
    category: 'sleep',
    breakGuide: {
      title: '골반 이완 및 수면 유도 호흡',
      description: '누워서 할 수 있는 골반 스트레칭과 함께 부교감신경을 안정시키는 이완 호흡을 합니다.',
      type: 'breathing',
      durationMinutes: 10
    }
  },
  {
    id: 'poor_circulation',
    emoji: '💔',
    symbol: '혈액순환 저하형',
    title: '혈액순환 저하형',
    subtitle: '말초 혈관 수축 + 뇌 혈류량 부족',
    traits: '손발이 차고 저리며, 뇌로 가는 혈류 및 산소 공급 부족으로 두통과 피로감 유발',
    solution: '1시간마다 3분 발목 스트레칭 및 따뜻한 온수 섭취, 가벼운 제자리 걷기로 혈류 순환 촉진',
    pomodoroWork: 45,
    pomodoroBreak: 10,
    category: 'fatigue',
    breakGuide: {
      title: '발목 펌프 운동 및 온수 섭취',
      description: '앉아서 발목을 위아래로 30회 강하게 움직이고 따뜻한 물을 마셔 말초 혈류를 촉진합니다.',
      type: 'stretching',
      durationMinutes: 10
    }
  },
  {
    id: 'balanced',
    emoji: '💚',
    symbol: '건강 균형형',
    title: '건강 균형형',
    subtitle: '자율신경 안정 + 최적 뇌파 동기화',
    traits: '신체적·정신적 컨디션이 매우 양호하며, 뇌의 인지 기능과 자율신경계가 최상의 조화를 이룸',
    solution: '현재의 좋은 수면/식습관 루틴을 유지하면서, 고난도 심화 문제 풀이와 실전 모의고사 반복',
    pomodoroWork: 50,
    pomodoroBreak: 10,
    category: 'balanced',
    breakGuide: {
      title: '가벼운 스트레칭 및 멘탈 셋팅',
      description: '다음 세션을 위한 목표를 가볍게 점검하고 전신 기지개로 활력을 유지합니다.',
      type: 'stretching',
      durationMinutes: 10
    }
  }
];
