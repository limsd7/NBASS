import { CareType } from './types';

export const PRODUCTS: Record<string, { name: string; desc: string; price: number; tags: string[] }> = {
  'focus_alpha': {
    name: '포커스 알파 (Focus Alpha)',
    desc: 'L-테아닌이 함유되어 긴장 완화 및 집중력 강화에 도움을 줍니다.',
    price: 45000,
    tags: ['집중력', '긴장완화']
  },
  'energy_bal': {
    name: '에너지 밸런스 (Energy Balance)',
    desc: 'B군 비타민과 미네랄 복합제로 만성 피로 회복을 돕습니다.',
    price: 38000,
    tags: ['피로회복', '활력']
  },
  'stress_less': {
    name: '스트레스 리스 (Stress Less)',
    desc: '홍경천 추출물이 포함되어 스트레스로 인한 피로 개선에 도움을 줍니다.',
    price: 42000,
    tags: ['스트레스', '이완']
  },
  'deep_sleep': {
    name: '딥 슬립 (Deep Sleep)',
    desc: '긴장을 완화하고 수면의 질을 높이는 허브 블렌드입니다.',
    price: 35000,
    tags: ['수면', '이완']
  },
  'immune_one': {
    name: '이뮨 원 (Immune One)',
    desc: '정상적인 면역 기능을 위한 아연 및 비타민 D 함유.',
    price: 30000,
    tags: ['면역', '기초건강']
  },
  'magnesium': {
    name: '마그네슘+ (Magnesium+)',
    desc: '신경과 근육 기능 유지 및 에너지 이용에 필요합니다.',
    price: 25000,
    tags: ['이완', '근육안정']
  },
  'no_cardi': {
    name: '노카디 (Nocardi)',
    desc: '심혈관 건강 및 인지 수행 능력 향상을 위한 복합 포뮬러.',
    price: 55000,
    tags: ['뇌건강', '순환']
  }
};

export const SOLUTIONS: Partial<Record<CareType, { nutrition: string[], care: string[] }>> = {
  [CareType.BURNOUT]: {
    nutrition: ['magnesium', 'energy_bal', 'stress_less'],
    care: ['절대적인 휴식 시간 확보', '카페인 섭취 중단', '가벼운 산책으로 신체 리듬 회복']
  },
  [CareType.SLEEP]: {
    nutrition: ['deep_sleep', 'magnesium'],
    care: ['기상 시간 고정하기', '취침 1시간 전 스마트폰 사용 금지', '따뜻한 물로 샤워하기']
  },
  [CareType.CIRCULATION]: {
    nutrition: ['no_cardi', 'energy_bal'],
    care: ['한 시간에 한 번씩 스트레칭', '따뜻한 물 자주 마시기', '족욕 또는 반신욕']
  },
  [CareType.CONCENTRATION]: {
    nutrition: ['focus_alpha', 'no_cardi'],
    care: ['학습 환경 단순화', '뽀모도로 학습법 적용 (25분 집중, 5분 휴식)', '매일 아침 목표 설정']
  },
  [CareType.HEALTHY]: {
    nutrition: ['immune_one'],
    care: ['현재의 좋은 습관 유지', '새로운 도전 과제 설정', '규칙적인 운동 지속']
  }
};
