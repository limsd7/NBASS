// Moved verbatim from ExpertOverlay.tsx (no content change)
import { CareType } from '../../types';
import type { RedFlag } from './expertTypes';

export const RED_FLAGS: Record<string, RedFlag[]> = {

    [CareType.HEALTHY]: [

        {

            severity: 'warning',

            condition: '최근 2주 내 급격한 성적 하락 (20점 이상)',

            action: '스트레스 요인 파악을 위한 심층 면담 필요',

            referral: '학교 상담실'

        }

    ],

    [CareType.SLEEP]: [

        {

            severity: 'warning',

            condition: '수면 시간 5시간 미만이 2주 이상 지속',

            action: '수면 위생 교육 및 생활 패턴 점검',

            referral: '수면 클리닉'

        },

        {

            severity: 'critical',

            condition: '주간 졸음으로 인한 일상생활 불가 (수업 중 기절, 이동 중 졸음)',

            action: '즉시 학부모 상담 및 전문의 연계',

            referral: '수면의학과 / 신경과'

        },

        {

            severity: 'emergency',

            condition: '야간 공황 발작 또는 악몽으로 인한 수면 공포증',

            action: '즉각적인 전문 상담 연계 필요',

            referral: '정신건강의학과'

        }

    ],

    [CareType.BURNOUT]: [

        {

            severity: 'warning',

            condition: '무기력 및 학습 거부가 1주 이상 지속',

            action: '학업량 50% 감축 및 휴식 권고',

            referral: '학교 상담실'

        },

        {

            severity: 'critical',

            condition: '"다 때려치우고 싶다", "의미 없다" 등의 언급',

            action: '자해/자살 사고 여부 확인 필수, 보호자 즉시 연락',

            referral: '정신건강의학과 / 청소년상담복지센터 (1388)'

        },

        {

            severity: 'emergency',

            condition: '자해 흔적 발견 또는 자살 암시 언급',

            action: '⚠️ 즉시 보호자 연락, 전문기관 의뢰, 절대 혼자 두지 않기',

            referral: '자살예방상담전화 1393 / 정신건강위기상담 1577-0199'

        }

    ],

    [CareType.ANXIETY_TENSION]: [

        {

            severity: 'warning',

            condition: 'BAI 점수 26점 이상 (심한 불안)',

            action: '불안 관리 프로그램 집중 적용',

            referral: '학교 상담실 또는 Wee센터'

        },

        {

            severity: 'critical',

            condition: '시험 전 구토, 설사, 손 떨림 등 신체화 증상',

            action: '시험 불안 전문 상담 및 이완 기법 집중 훈련',

            referral: '소아청소년 정신건강의학과'

        },

        {

            severity: 'emergency',

            condition: '공황 발작 (과호흡, 심장 이상, 죽을 것 같은 공포)',

            action: '즉각적 진정 개입 후 전문 의료기관 연계',

            referral: '응급실 / 정신건강의학과'

        }

    ],

    [CareType.STRESS_OVERLOAD]: [

        {

            severity: 'warning',

            condition: '두통, 소화불량 등 스트레스성 신체 증상 호소',

            action: '스트레스 요인 분석 및 우선순위 조정 필요',

            referral: '학교 보건실 / 상담실'

        },

        {

            severity: 'critical',

            condition: '분노 폭발, 물건 파손, 폭력적 언행',

            action: '즉시 안정화 개입 후 분노 조절 프로그램 연계',

            referral: '청소년상담복지센터'

        },

        {

            severity: 'emergency',

            condition: '자해 욕구 표현 또는 "사라지고 싶다" 언급',

            action: '⚠️ 절대 혼자 두지 않기, 보호자 즉시 연락',

            referral: '자살예방상담전화 1393'

        }

    ],

    [CareType.LOW_ENERGY]: [

        {

            severity: 'warning',

            condition: '만성 피로가 3주 이상 지속',

            action: '신체 건강 점검 권고 (빈혈, 갑상선 등)',

            referral: '내과 / 가정의학과'

        },

        {

            severity: 'critical',

            condition: '아침에 일어나지 못해 지각/결석 반복',

            action: '기상 장애 원인 파악 및 생활 패턴 중재',

            referral: '수면의학과 / 정신건강의학과'

        }

    ],

    [CareType.DEPRESSION_AMOTIVATION]: [

        {

            severity: 'warning',

            condition: '우울감, 의욕 저하가 2주 이상 지속',

            action: 'PHQ-9 등 우울 선별검사 실시',

            referral: '학교 상담실 / Wee센터'

        },

        {

            severity: 'critical',

            condition: '사회적 고립, 식욕/수면 급변, 취미 상실',

            action: '우울증 가능성 평가 및 보호자 상담',

            referral: '소아청소년 정신건강의학과'

        },

        {

            severity: 'emergency',

            condition: '"죽고 싶다", "내가 없어져야" 등 자살 사고 표현',

            action: '⚠️ 즉각적 자살위험평가, 보호자 즉시 연락, 전문기관 의뢰',

            referral: '자살예방상담전화 1393 / 정신건강위기상담 1577-0199'

        }

    ],

    [CareType.ADRENAL]: [

        {

            severity: 'warning',

            condition: '오전에 극심한 피로, 오후에 반짝 회복 패턴',

            action: '부신 피로 특화 생활 교정 프로그램 적용',

            referral: '가정의학과 / 기능의학 클리닉'

        },

        {

            severity: 'critical',

            condition: '카페인 없이 일상 유지 불가, 혈압/혈당 불안정',

            action: '의료적 평가 필수, 학업량 대폭 조절',

            referral: '내분비내과'

        }

    ],

    [CareType.BRAIN_FATIGUE]: [

        {

            severity: 'warning',

            condition: '집중력 30분 미만, 브레인 포그 호소',

            action: '뇌 휴식 프로토콜 집중 적용',

            referral: '학교 상담실'

        },

        {

            severity: 'critical',

            condition: '심한 두통과 기억력 급감 동반',

            action: '신경과적 검진 권고',

            referral: '신경과 / 두통 클리닉'

        }

    ],

    [CareType.HYPERSENSITIVE]: [

        {

            severity: 'warning',

            condition: '소음, 빛에 과민 반응하여 학습 불가',

            action: '감각 조절 환경 구축 및 노이즈 캔슬링 도구 지원',

            referral: '학교 상담실 / 발달센터'

        },

        {

            severity: 'critical',

            condition: '감각 과부하로 인한 정서 폭발 (울음, 분노)',

            action: '즉각적 감각 통제 환경 제공, 전문 평가 의뢰',

            referral: '발달심리센터 / 정신건강의학과'

        }

    ],

    [CareType.ATTENTION_DEFICIT]: [

        {

            severity: 'warning',

            condition: '주의력 결핍으로 인한 학업 수행 불가',

            action: 'ADHD 선별검사 실시 권고',

            referral: '학교 상담실 / Wee센터'

        },

        {

            severity: 'critical',

            condition: 'ADHD 진단력 있으나 약물 중단 상태',

            action: '보호자 상담 후 전문의 재방문 권고',

            referral: '소아청소년 정신건강의학과'

        }

    ],

    [CareType.CONCENTRATION]: [

        {

            severity: 'warning',

            condition: '집중 시간이 15분 미만으로 급격히 감소',

            action: '디지털 디톡스 및 수면 패턴 점검',

            referral: '학교 상담실'

        }

    ],

    [CareType.CIRCULATION]: [

        {

            severity: 'warning',

            condition: '수족 냉증, 어지럼증 빈번',

            action: '혈액순환 개선 운동 강화 적용',

            referral: '가정의학과'

        },

        {

            severity: 'critical',

            condition: '실신(기절) 또는 실신 전조 증상',

            action: '즉시 의료 평가 필요',

            referral: '순환기내과 / 신경과'

        }

    ]

};
