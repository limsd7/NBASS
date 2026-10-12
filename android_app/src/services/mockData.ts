import { NutritionProduct } from '../types';

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
    subName: '뇌 신경 전달 물질 합성 및 에너지 대사 유지에 도움을 줄 수 있음',
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
    subName: '긴장 완화에 도움을 줄 수 있으며, 수면 리듬 관리 참고용',
    category: 'Circadian & Sleep',
    tier: 'RECOMMENDED',
    mainIngredients: ['L-테아닌 200mg', '쌀 발효 마그네슘'],
    dosageMethod: '1일 1회, 2정',
    timing: '저녁 식후 또는 취침 1시간 전',
    caution: '섭취 후 졸음이 올 수 있으므로 운전이나 기계 조작 전 섭취를 피하세요.',
    image: 'https://gcwbstoacc.blob.core.windows.net/gcwbdata/product/7137f766-419b-4303-9bb6-5ad602e1c015.png',
    url: 'https://www.pntmall.com/'
  },
  // 🟢 보조 영양제 (Premium 이상 개방)
  {
    id: 'PNT-SUP-001',
    name: '알티지 오메가3 플러스',
    subName: '기억·눈 건강 유지에 도움을 줄 수 있음',
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
