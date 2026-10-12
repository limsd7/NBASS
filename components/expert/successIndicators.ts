// Moved verbatim from ExpertOverlay.tsx (no content change)
import { CareType } from '../../types';
import type { SuccessIndicator } from './expertTypes';

export const SUCCESS_INDICATORS: Record<string, SuccessIndicator[]> = {

    [CareType.HEALTHY]: [

        {

            category: '컨디션 유지',

            icon: '✨',

            indicator: '자율신경 안정 상태 유지',

            targetValue: '자율신경 균형도(PNS/SNS) 안정 유지',

            timeframe: '매 점검 시',

            measureMethod: '정기 평가 및 설문 재점검',

            priority: 'medium'

        },

        {

            category: '학습 효율',

            icon: '📚',

            indicator: '집중 시간 유지',

            targetValue: '50분 연속 집중 가능',

            timeframe: '1주 내',

            measureMethod: '자기 보고 / 학습 타이머 기록',

            priority: 'medium'

        },

        {

            category: '생활 습관',

            icon: '🌙',

            indicator: '수면 패턴 일정 유지',

            targetValue: '취침/기상 시간 편차 30분 이내',

            timeframe: '지속',

            measureMethod: '수면 일지 또는 스마트워치',

            priority: 'low'

        }

    ],

    [CareType.SLEEP]: [

        {

            category: '수면 시간',

            icon: '⏰',

            indicator: '총 수면 시간 증가',

            targetValue: '일주일 내 수면 시간 30분 증가',

            timeframe: '1주',

            measureMethod: '수면 일지 / 스마트워치 앱',

            priority: 'high'

        },

        {

            category: '수면 질',

            icon: '😴',

            indicator: '수면 효율 개선',

            targetValue: '누워서 30분 이내 입면',

            timeframe: '2주',

            measureMethod: '자기 보고 (입면 시간 체크)',

            priority: 'high'

        },

        {

            category: '주간 졸음',

            icon: '☀️',

            indicator: 'ESS 점수 감소',

            targetValue: 'ESS 점수 10점 이하',

            timeframe: '2주',

            measureMethod: 'Epworth 졸음 척도 재검사',

            priority: 'medium'

        },

        {

            category: '디지털 습관',

            icon: '📵',

            indicator: '취침 전 스마트폰 사용 감소',

            targetValue: '취침 1시간 전 사용 중단',

            timeframe: '1주',

            measureMethod: '스크린 타임 앱 확인',

            priority: 'medium'

        }

    ],

    [CareType.BURNOUT]: [

        {

            category: '휴식',

            icon: '🔋',

            indicator: '일일 학습량 조절',

            targetValue: '학습 시간 50% 감소 준수',

            timeframe: '2주',

            measureMethod: '학습 일지 / 학부모 확인',

            priority: 'high'

        },

        {

            category: '에너지',

            icon: '⚡',

            indicator: '주관적 에너지 레벨 상승',

            targetValue: '10점 만점 중 2점 이상 상승',

            timeframe: '2주',

            measureMethod: '상담 시 자기 보고 (0-10점)',

            priority: 'high'

        },

        {

            category: '정서',

            icon: '💚',

            indicator: '무력감/우울감 감소',

            targetValue: 'BDI 점수 5점 이상 감소',

            timeframe: '4주',

            measureMethod: 'Beck 우울 척도 재검사',

            priority: 'medium'

        },

        {

            category: '생활 리듬',

            icon: '🌅',

            indicator: '규칙적인 기상 시간',

            targetValue: '주말 포함 동일 시간 기상',

            timeframe: '2주',

            measureMethod: '기상 시간 기록',

            priority: 'medium'

        }

    ],

    [CareType.ANXIETY_TENSION]: [

        {

            category: '불안 수준',

            icon: '📉',

            indicator: 'BAI 점수 감소',

            targetValue: 'BAI 점수 5점 이상 하락',

            timeframe: '2주',

            measureMethod: 'Beck 불안 척도 재검사',

            priority: 'high'

        },

        {

            category: '신체 증상',

            icon: '🩺',

            indicator: '신체화 증상 감소',

            targetValue: '두통/복통 빈도 50% 감소',

            timeframe: '2주',

            measureMethod: '증상 일지 (빈도 기록)',

            priority: 'high'

        },

        {

            category: '이완 능력',

            icon: '🧘',

            indicator: '호흡법 숙달',

            targetValue: '4-7-8 호흡법 자발적 활용',

            timeframe: '1주',

            measureMethod: '자기 보고 (활용 횟수)',

            priority: 'medium'

        },

        {

            category: '시험 수행',

            icon: '📝',

            indicator: '시험 불안 감소',

            targetValue: '시험 중 신체 증상 감소',

            timeframe: '다음 시험',

            measureMethod: '시험 후 자기 보고',

            priority: 'medium'

        }

    ],

    [CareType.STRESS_OVERLOAD]: [

        {

            category: '스트레스',

            icon: '📊',

            indicator: 'PSS 점수 감소',

            targetValue: 'PSS 점수 5점 이상 하락',

            timeframe: '2주',

            measureMethod: '지각된 스트레스 척도 재검사',

            priority: 'high'

        },

        {

            category: '운동',

            icon: '🏃',

            indicator: '신체 활동 증가',

            targetValue: '주 3회 이상 운동',

            timeframe: '2주',

            measureMethod: '운동 일지 / 앱 기록',

            priority: 'high'

        },

        {

            category: '감정 조절',

            icon: '😤',

            indicator: '분노 폭발 빈도 감소',

            targetValue: '주간 폭발 횟수 50% 감소',

            timeframe: '2주',

            measureMethod: '자기 보고 / 학부모 확인',

            priority: 'medium'

        },

        {

            category: '자율신경',

            icon: '❤️',

            indicator: '자율신경 밸런스 개선',

            targetValue: '부교감신경 회복력 15% 이상 개선',

            timeframe: '4주',

            measureMethod: '설문 및 지표 재평가',

            priority: 'medium'

        }

    ],

    [CareType.LOW_ENERGY]: [

        {

            category: '에너지',

            icon: '⚡',

            indicator: '주관적 활력 상승',

            targetValue: '활력 점수 3점 이상 상승 (10점 만점)',

            timeframe: '2주',

            measureMethod: '상담 시 자기 보고',

            priority: 'high'

        },

        {

            category: '아침 각성',

            icon: '☀️',

            indicator: '기상 후 각성 시간 단축',

            targetValue: '기상 후 30분 이내 완전 각성',

            timeframe: '1주',

            measureMethod: '자기 보고',

            priority: 'high'

        },

        {

            category: '영양',

            icon: '🍳',

            indicator: '아침 식사 습관화',

            targetValue: '주 5일 이상 아침 식사',

            timeframe: '2주',

            measureMethod: '식사 일지',

            priority: 'medium'

        },

        {

            category: '건강',

            icon: '🩸',

            indicator: '혈액검사 정상화',

            targetValue: '빈혈/갑상선 수치 정상 범위',

            timeframe: '4주',

            measureMethod: '의료기관 혈액검사',

            priority: 'medium'

        }

    ],

    [CareType.DEPRESSION_AMOTIVATION]: [

        {

            category: '우울',

            icon: '📉',

            indicator: 'PHQ-9 점수 감소',

            targetValue: 'PHQ-9 5점 이상 하락',

            timeframe: '4주',

            measureMethod: 'PHQ-9 재검사',

            priority: 'high'

        },

        {

            category: '활동',

            icon: '🚶',

            indicator: '일상 활동 횟수 증가',

            targetValue: '외출/사회 활동 주 2회 이상',

            timeframe: '2주',

            measureMethod: '활동 일지',

            priority: 'high'

        },

        {

            category: '수면',

            icon: '🛏️',

            indicator: '침대 이탈 시간 준수',

            targetValue: '기상 후 10분 이내 침대 이탈',

            timeframe: '1주',

            measureMethod: '자기 보고',

            priority: 'medium'

        },

        {

            category: '즐거움',

            icon: '😊',

            indicator: '쾌감 회복 (Anhedonia 개선)',

            targetValue: '즐거움 느낀 활동 주 1회 이상',

            timeframe: '2주',

            measureMethod: '자기 보고',

            priority: 'medium'

        }

    ],

    [CareType.ADRENAL]: [

        {

            category: '피로',

            icon: '🔋',

            indicator: '오전 피로 감소',

            targetValue: '오전 에너지 3점 이상 상승 (10점)',

            timeframe: '2주',

            measureMethod: '오전 9시 에너지 레벨 자가 평가',

            priority: 'high'

        },

        {

            category: '카페인',

            icon: '☕',

            indicator: '카페인 의존도 감소',

            targetValue: '하루 커피 1잔 이하',

            timeframe: '2주',

            measureMethod: '카페인 섭취 일지',

            priority: 'high'

        },

        {

            category: '수면',

            icon: '🌙',

            indicator: '취침 시간 앞당기기',

            targetValue: '밤 10시 이전 취침',

            timeframe: '1주',

            measureMethod: '수면 일지',

            priority: 'high'

        },

        {

            category: '혈압',

            icon: '💓',

            indicator: '기립성 저혈압 개선',

            targetValue: '일어날 때 어지러움 감소',

            timeframe: '4주',

            measureMethod: '증상 자기 보고',

            priority: 'medium'

        }

    ],

    [CareType.BRAIN_FATIGUE]: [

        {

            category: '집중력',

            icon: '🎯',

            indicator: '연속 집중 시간 증가',

            targetValue: '30분 → 50분 연속 집중',

            timeframe: '2주',

            measureMethod: '학습 타이머 기록',

            priority: 'high'

        },

        {

            category: '브레인 포그',

            icon: '🌫️',

            indicator: '머리 맑음 정도 개선',

            targetValue: '뇌 안개 증상 50% 감소',

            timeframe: '2주',

            measureMethod: '자기 보고 (0-10점)',

            priority: 'high'

        },

        {

            category: '디지털',

            icon: '📱',

            indicator: '스크린 타임 감소',

            targetValue: '하루 스크린 타임 2시간 이내',

            timeframe: '1주',

            measureMethod: '스크린 타임 앱',

            priority: 'medium'

        },

        {

            category: '휴식',

            icon: '🧘',

            indicator: '50분 공부 후 반드시 휴식',

            targetValue: '휴식 규칙 준수율 80% 이상',

            timeframe: '1주',

            measureMethod: '자기 보고 / 타이머 앱',

            priority: 'medium'

        }

    ],

    [CareType.HYPERSENSITIVE]: [

        {

            category: '감각 조절',

            icon: '🔇',

            indicator: '감각 과부하 빈도 감소',

            targetValue: '과부하 에피소드 주 2회 이하',

            timeframe: '2주',

            measureMethod: '증상 일지',

            priority: 'high'

        },

        {

            category: '환경',

            icon: '🏠',

            indicator: '학습 환경 최적화',

            targetValue: '조용한 학습 공간 확보',

            timeframe: '1주',

            measureMethod: '학부모/본인 확인',

            priority: 'high'

        },

        {

            category: '정서',

            icon: '😌',

            indicator: '정서적 폭발 빈도 감소',

            targetValue: '감정 폭발 50% 감소',

            timeframe: '2주',

            measureMethod: '자기 보고 / 학부모 확인',

            priority: 'medium'

        },

        {

            category: '혼자 시간',

            icon: '🧘',

            indicator: '재충전 시간 확보',

            targetValue: '하루 30분 이상 혼자 시간',

            timeframe: '1주',

            measureMethod: '자기 보고',

            priority: 'medium'

        }

    ],

    [CareType.ATTENTION_DEFICIT]: [

        {

            category: '집중력',

            icon: '🎯',

            indicator: '지속 주의력 개선',

            targetValue: '25분 연속 집중 가능',

            timeframe: '2주',

            measureMethod: '포모도로 완료 횟수',

            priority: 'high'

        },

        {

            category: '과제 완수',

            icon: '✅',

            indicator: '과제 완료율 상승',

            targetValue: '과제 완료율 70% 이상',

            timeframe: '2주',

            measureMethod: '과제 체크리스트',

            priority: 'high'

        },

        {

            category: '환경',

            icon: '📚',

            indicator: '책상 정리 습관화',

            targetValue: '공부 시작 전 책상 정리',

            timeframe: '1주',

            measureMethod: '자기 보고',

            priority: 'medium'

        },

        {

            category: '스마트폰',

            icon: '📵',

            indicator: '공부 중 스마트폰 분리',

            targetValue: '공부 시간 100% 분리',

            timeframe: '1주',

            measureMethod: '자기 보고 / 앱 잠금',

            priority: 'high'

        }

    ],

    [CareType.CONCENTRATION]: [

        {

            category: '집중 시간',

            icon: '⏱️',

            indicator: '연속 집중 시간 증가',

            targetValue: '25분 → 50분 연속 집중',

            timeframe: '2주',

            measureMethod: '학습 타이머 기록',

            priority: 'high'

        },

        {

            category: '방해 요소',

            icon: '🚫',

            indicator: '방해 요소 제거',

            targetValue: '공부 중 스마트폰 확인 0회',

            timeframe: '1주',

            measureMethod: '자기 보고',

            priority: 'high'

        },

        {

            category: '학습 효율',

            icon: '📊',

            indicator: '단위 시간당 학습량 증가',

            targetValue: '동일 시간 대비 20% 효율 증가',

            timeframe: '2주',

            measureMethod: '문제 풀이 개수 비교',

            priority: 'medium'

        }

    ],

    [CareType.CIRCULATION]: [

        {

            category: '운동',

            icon: '🚶',

            indicator: '일일 걷기 시간 증가',

            targetValue: '하루 20분 이상 걷기',

            timeframe: '1주',

            measureMethod: '만보기 / 스마트워치',

            priority: 'high'

        },

        {

            category: '혈류',

            icon: '🩸',

            indicator: '수족 냉증 개선',

            targetValue: '손발 차가움 50% 감소',

            timeframe: '2주',

            measureMethod: '자기 보고 (0-10점)',

            priority: 'medium'

        },

        {

            category: '자세',

            icon: '🧍',

            indicator: '50분마다 스트레칭',

            targetValue: '스트레칭 습관 정착',

            timeframe: '1주',

            measureMethod: '자기 보고 / 알람 설정',

            priority: 'medium'

        },

        {

            category: '수분',

            icon: '💧',

            indicator: '수분 섭취량 증가',

            targetValue: '하루 2L 이상 물 마시기',

            timeframe: '1주',

            measureMethod: '물병 기록',

            priority: 'low'

        }

    ]

};
