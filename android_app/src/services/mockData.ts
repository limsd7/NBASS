import { MobileAssessmentResult, NutritionProduct, UserProfile } from '../types';

export const DEMO_STUDENTS: UserProfile[] = [
  {
    studentId: 'STD-2026-001',
    name: '김민준',
    school: '한빛고등학교',
    grade: '고3 (수험생)',
    tier: 'free',
    examDate: '2026-09-01'
  },
  {
    studentId: 'STD-2026-002',
    name: '이서연',
    school: '대청중학교',
    grade: '중3',
    tier: 'pro',
    examDate: '2026-09-02'
  },
  {
    studentId: 'STD-2026-003',
    name: '박도현',
    school: '대성고등학교',
    grade: '고2',
    tier: 'premium',
    examDate: '2026-09-03'
  },
  {
    studentId: 'STD-2026-004',
    name: '정하은',
    school: '서울국제고',
    grade: '고1',
    tier: 'vip',
    examDate: '2026-09-04'
  }
];

export const MOCK_ASSESSMENT_RESULT: MobileAssessmentResult = {
  student: {
    id: 'STD-2026-001',
    name: '김민준',
    school: '한빛고등학교',
    grade: '고3 (수험생)',
    age: 18,
    gender: '남'
  },
  examDate: '2026-09-01',
  careType: 'BRAIN_FATIGUE',
  careTypeName: '두뇌 피로 및 기억 저하형 (Brain Fatigue)',
  careTypeBadgeColor: 'bg-rose-500 text-white',
  careTypeSummary: '장시간 연속 학습과 수면 부족으로 인해 전두엽의 포도당 대사율이 감소하고 아데노신 피로물질이 누적된 상태입니다. 오후 2시 전후 급격한 집중력 저하와 브레인포그(Brain Fog)가 관찰됩니다.',
  metrics: {
    brainVitality: 62,
    stressResistance: 48,
    focusCapacity: 58,
    sleepEfficiency: 52,
    coherence: 64
  },
  keyAdvice: {
    study: '오후 집중력 저하 시간대에 25분 몰입 + 5분 휴식(뽀모도로)과 20분 커피 냅(Coffee Nap)을 적극 도입하여 전두엽 피로도를 초기화하세요.',
    circadian: '기상 직후 15분간 자연광을 쬐어 멜라토닌 분비를 리셋하고, 취침 1시간 전 스마트폰 블루라이트를 완벽히 차단하여 해마의 장기기억 고착 수면을 유도하세요.',
    stress: '공부 시작 전 3분 4-7-8 호흡법으로 교감신경 긴장을 낮추고 뇌혈류를 이완시켜 심신 안정 상태를 확보하세요.'
  },
  topCareScores: [
    { type: 'BRAIN_FATIGUE', name: '두뇌 피로도', score: 78, description: '전두엽 대사 저하 및 인지 피로 지수 높음' },
    { type: 'SLEEP_DEBT', name: '수면 부채 지수', score: 68, description: '깊은 렘수면 부족으로 인한 기억 정리 지연' },
    { type: 'EXAM_ANXIETY', name: '시험 긴장도', score: 55, description: '모의고사 및 실전 직전 교감신경 긴장' }
  ]
};

export const MOCK_NUTRITION_PRODUCTS: NutritionProduct[] = [
  // ☕ HL COFFEE 부스터 (무료 등급부터 100% 전면 개방!)
  {
    id: 'HL-COFFEE-001',
    name: 'HL 아르기닌·카르니틴 스마트 아메리카노',
    subName: 'NBASS x HL COFFEE 두뇌 혈류 처방 가이드 (수험생 전용)',
    category: 'Brain Blood Flow & Metabolism',
    tier: 'SPECIAL',
    mainIngredients: [
      'L-아르기닌 2,600mg (산화질소 NO 생성)',
      'L-카르니틴 1,200mg (미토콘드리아 지방대사)',
      '시트룰린 (수박추출물)',
      '마일드 카페인 (스타벅스 Tall 수준)'
    ],
    dosageMethod: '1일 1회, 1포를 미온수 또는 시원한 냉수 500ml 이상에 넉넉히 희석',
    timing: '아침 기상 직후 또는 오전 공부 시작 30분 전 공복 음용 (오후 2시 이전 완료)',
    caution: '⚠️ 60℃ 이상 뜨거운 물 절대 금지 (유효성분 열변성 방지). 반드시 500ml 이상 연하게 희석해 아이스 티처럼 음용하세요.',
    image: '/hl_coffee_circle.png',
    url: 'https://www.hl-coffee.com/category/coffee/29/',
    isHlCoffee: true
  },
  // 🔴 핵심 영양제 (Pro 이상 개방)
  {
    id: 'PNT-CORE-001',
    name: '액티브 B 컴플렉스',
    subName: '뇌 신경 전달 물질 합성 및 포도당 에너지 대사 촉진',
    category: 'Energy Metabolism',
    tier: 'ESSENTIAL',
    mainIngredients: ['활성 비타민 B군 8종 (B1, B2, B6, B12, 엽산)'],
    dosageMethod: '1일 1회, 1정',
    timing: '아침 식후 즉시',
    caution: '공복 섭취 시 속쓰림이 있을 수 있으니 식후 복용하세요.',
    image: 'https://gcwbstoacc.blob.core.windows.net/gcwbdata/product/7e32d64f-4d37-4d76-bafe-5b62e49c7bc2.png',
    url: 'https://www.pntmall.com/'
  },
  // 🟡 추천 영양제 (Premium 이상 개방)
  {
    id: 'PNT-REC-001',
    name: '캄 슬립 (Calm Sleep)',
    subName: '교감신경 긴장 완화 & 시험불안 진정, 숙면 유도',
    category: 'Circadian & Sleep',
    tier: 'RECOMMENDED',
    mainIngredients: ['L-테아닌 200mg', '쌀 발효 마그네슘'],
    dosageMethod: '1일 1회, 2정',
    timing: '저녁 식후 또는 취침 1시간 전',
    caution: '섭취 후 졸음이 올 수 있으므로 운전이나 기계 조작 전 섭취를 피하세요.',
    image: 'https://gcwbstoacc.blob.core.windows.net/gcwbdata/product/7137f766-419b-4303-9bb6-5ad602e1c015.png',
    url: 'https://www.pntmall.com/'
  },
  // 🟢 보조 영양제 (Premium+ 이상 개방)
  {
    id: 'PNT-SUP-001',
    name: '알티지 오메가3 플러스',
    subName: '해마 장기기억 고착 & 시각 피로 개선 및 뇌세포막 유동성',
    category: 'Brain Cell Health',
    tier: 'SUPPORTIVE',
    mainIngredients: ['EPA 및 DHA 함유 유지 1,000mg', '비타민 E'],
    dosageMethod: '1일 1회, 2캡슐',
    timing: '점심 식후',
    caution: '혈전용해제 복용 중인 경우 전문의와 상담하세요.',
    image: 'https://gcwbstoacc.blob.core.windows.net/gcwbdata/product/f769be42-0235-4523-9940-34a602c8a177.png',
    url: 'https://www.pntmall.com/'
  }
];
