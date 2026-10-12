// Moved verbatim from ExpertOverlay.tsx (no content change)
import { CareType } from '../../types';
import type { WeeklyPlan } from './expertTypes';

export const WEEKLY_PLANS: Record<string, WeeklyPlan> = {

    [CareType.HEALTHY]: {

        totalWeeks: 4,

        goal: '최상의 컨디션 유지 및 학습 효율 극대화',

        weeks: [

            {

                week: 1,

                theme: '기본 루틴 점검',

                tasks: ['현재 학습 루틴 분석', '수면/기상 시간 기록', '하루 집중 시간 측정'],

                milestone: '현재 상태 베이스라인 확립'

            },

            {

                week: 2,

                theme: '루틴 최적화',

                tasks: ['포모도로 기법 적용', '아침 루틴 명확화', '휴식 시간 품질 개선'],

                milestone: '50분 집중 가능'

            },

            {

                week: 3,

                theme: '심화 전략 적용',

                tasks: ['간격 반복 학습 시작', '백지 복습 습관화', '수면 일정 일관성 유지'],

            },

            {

                week: 4,

                theme: '습관 고정화',

                tasks: ['전체 루틴 자동화', '주간 점검 시스템 구축', '목표 재설정'],

                milestone: '자기주도 학습 시스템 완성'

            }

        ]

    },

    [CareType.SLEEP]: {

        totalWeeks: 6,

        goal: '수면의 질 개선 및 적정 수면 시간 확보',

        weeks: [

            {

                week: 1,

                theme: '수면 패턴 파악',

                tasks: ['수면 일기 작성 시작', '취침/기상 시간 기록', '카페인 섭취 기록'],

                milestone: '수면 패턴 베이스라인 확립'

            },

            {

                week: 2,

                theme: '취침 환경 개선',

                tasks: ['침실 조명 조절', '취침 1시간 전 스마트폰 차단', '적정 실내 온도 유지'],

            },

            {

                week: 3,

                theme: '수면 루틴 구축',

                tasks: ['취침 30분 전 이완 루틴', '4-7-8 호흡법 연습', '동일 시간 기상'],

                milestone: '취침 루틴 정착'

            },

            {

                week: 4,

                theme: '수면 시간 조정',

                tasks: ['취침 시간 15분씩 앞당기기', '낮잠 제한 (20분 이내)', '주말 기상 시간 일정'],

            },

            {

                week: 5,

                theme: '수면 방해 요소 제거',

                tasks: ['늦은 저녁 식사 피하기', '침대 = 수면 연상 강화', '수면 환경 최적화'],

            },

            {

                week: 6,

                theme: '습관 고정화',

                tasks: ['수면 효율 90% 이상 달성', '일관된 수면 스케줄 유지', '스마트 알람 활용'],

                milestone: '건강한 수면 패턴 완성'

            }

        ]

    },

    [CareType.BURNOUT]: {

        totalWeeks: 8,

        goal: '완전한 에너지 회복 및 지속 가능한 페이스 찾기',

        weeks: [

            {

                week: 1,

                theme: '완전 휴식',

                tasks: ['학습량 50% 감소', '의무적 휴식 시간 확보', '즐거운 활동 1가지 시작'],

                milestone: '급성 피로 해소'

            },

            {

                week: 2,

                theme: '에너지 충전',

                tasks: ['수면 시간 1시간 증가', '가벼운 산책 시작', '스트레스 일지 작성'],

            },

            {

                week: 3,

                theme: '경계 설정',

                tasks: ['학습 시간 상한선 설정', '"아니요" 말하기 연습', '자기 돌봄 활동 추가'],

            },

            {

                week: 4,

                theme: '점진적 복귀',

                tasks: ['학습량 10% 증가', '우선순위 재정립', '완벽주의 완화'],

                milestone: '안정적 에너지 레벨 도달'

            },

            {

                week: 5,

                theme: '지속 가능한 페이스',

                tasks: ['80% 노력 원칙 적용', '주간 휴식일 고정', '취미 활동 유지'],

            },

            {

                week: 6,

                theme: '스트레스 관리',

                tasks: ['스트레스 신호 인식', '이완 기법 숙달', '지원 시스템 구축'],

            },

            {

                week: 7,

                theme: '균형 회복',

                tasks: ['학습/휴식 균형 점검', '사회적 활동 재개', '성취감 경험'],

            },

            {

                week: 8,

                theme: '새로운 습관 정착',

                tasks: ['지속 가능한 루틴 확립', '재발 방지 전략 수립', '장기 목표 재설정'],

                milestone: '번아웃 회복 완료'

            }

        ]

    },

    [CareType.ANXIETY_TENSION]: {

        totalWeeks: 6,

        goal: '불안 수준 감소 및 이완 능력 향상',

        weeks: [

            {

                week: 1,

                theme: '호흡법 습득',

                tasks: ['4-7-8 호흡법 배우기', '하루 3회 호흡 연습', '불안 일지 시작'],

                milestone: '호흡법 숙달'

            },

            {

                week: 2,

                theme: '이완 기법 확장',

                tasks: ['점진적 근육 이완 연습', '마음챙김 명상 시작', '불안 유발 상황 파악'],

            },

            {

                week: 3,

                theme: '인지 재구조화',

                tasks: ['부정적 생각 기록', '현실적 대안 생각 연습', '걱정 시간 제한'],

                milestone: '인지 왜곡 인식'

            },

            {

                week: 4,

                theme: '노출 연습',

                tasks: ['작은 불안 상황 직면', '성공 경험 기록', '회피 행동 감소'],

            },

            {

                week: 5,

                theme: '대처 전략 강화',

                tasks: ['그라운딩 기법 활용', '긍정적 자기 대화', '지지 체계 활용'],

            },

            {

                week: 6,

                theme: '자신감 회복',

                tasks: ['시험 불안 대처 연습', '불안 관리 도구 상자 완성', '독립적 대처 가능'],

                milestone: 'BAI 점수 50% 감소'

            }

        ]

    },

    [CareType.STRESS_OVERLOAD]: {

        totalWeeks: 6,

        goal: '스트레스 수준 정상화 및 적응력 향상',

        weeks: [

            {

                week: 1,

                theme: '스트레스 인식',

                tasks: ['스트레스 요인 목록화', '신체 반응 관찰', '이완 시간 확보'],

                milestone: '스트레스 원인 파악'

            },

            {

                week: 2,

                theme: '신체 활동 증가',

                tasks: ['매일 20분 운동', '스트레칭 루틴', '야외 활동 시간 확보'],

            },

            {

                week: 3,

                theme: '감정 조절',

                tasks: ['감정 표현 연습', '분노 관리 기법', '긍정적 대처 전략'],

                milestone: '감정 폭발 빈도 50% 감소'

            },

            {

                week: 4,

                theme: '인지적 유연성',

                tasks: ['부정적 생각 전환 연습', '감사 일기 시작', '완벽주의 내려놓기'],

            },

            {

                week: 5,

                theme: '회복력 강화',

                tasks: ['심호흡법 일상화', '거절 연습 (경계 설정)', '지지 체계 강화'],

            },

            {

                week: 6,

                theme: '장기 관리 전략',

                tasks: ['우선순위 재정립', '시간 관리 개선', '균형 잡힌 생활 패턴 정착'],

                milestone: '스트레스 저항력 강화'

            }

        ]

    },

    [CareType.LOW_ENERGY]: {

        totalWeeks: 6,

        goal: '에너지 수준 회복 및 활력 증진',

        weeks: [

            {

                week: 1,

                theme: '기본 점검',

                tasks: ['수면 시간 확보', '식사 규칙성 점검', '필요시 혈액검사'],

                milestone: '에너지 저하 원인 파악'

            },

            {

                week: 2,

                theme: '영양 개선',

                tasks: ['아침 식사 습관화', '철분/비타민D 보충', '수분 섭취 증가'],

            },

            {

                week: 3,

                theme: '활동량 증가',

                tasks: ['아침 햇볕 쬐기', '가벼운 운동 시작', '낮 활동 시간 확대'],

                milestone: '오전 에너지 개선'

            },

            {

                week: 4,

                theme: '신진대사 점화',

                tasks: ['단백질 중심 식단', '고강도 인터벌 운동 시도', '미토콘드리아 영양소'],

            },

            {

                week: 5,

                theme: '지구력 향상',

                tasks: ['유산소 운동 시간 확대', '피로 유발 인자 제거', '안정적 혈당 유지'],

            },

            {

                week: 6,

                theme: '활력 유지',

                tasks: ['규칙적 생활 리듬 정착', '에너지 관리 습관화', '지속 가능한 운동 루틴'],

                milestone: '에너지 레벨 정상화'

            }

        ]

    },

    [CareType.DEPRESSION_AMOTIVATION]: {

        totalWeeks: 8,

        goal: '우울감 완화 및 동기 회복',

        weeks: [

            {

                week: 1,

                theme: '안전망 구축',

                tasks: ['전문가 상담 연계', '위기 연락처 공유', '일상 유지'],

                milestone: '지지 체계 확보'

            },

            {

                week: 2,

                theme: '작은 활동 시작',

                tasks: ['침대 이탈 시간 준수', '매일 5분 외출', '샤워/세면 유지'],

            },

            {

                week: 3,

                theme: '행동 활성화',

                tasks: ['즐거웠던 활동 1가지 재개', '사회적 접촉 1회', '성취감 경험'],

                milestone: '활동 빈도 증가'

            },

            {

                week: 4,

                theme: '루틴 구축',

                tasks: ['규칙적 기상 시간', '식사 시간 고정', '간단한 운동 추가'],

            },

            {

                week: 5,

                theme: '긍정 경험 확대',

                tasks: ['감사 일기 시작', '자기 칭찬 연습', '작은 목표 달성'],

            },

            {

                week: 6,

                theme: '사회적 연결',

                tasks: ['친구/가족 만남', '그룹 활동 참여', '도움 요청 연습'],

                milestone: '사회적 활동 재개'

            },

            {

                week: 7,

                theme: '자기 효능감',

                tasks: ['작은 성공 경험 축적', '문제 해결 연습', '미래 계획 세우기'],

            },

            {

                week: 8,

                theme: '회복 유지',

                tasks: ['재발 징후 인식', '대처 전략 정리', '지속적 자기 관리'],

                milestone: 'PHQ-9 점수 50% 감소'

            }

        ]

    },

    [CareType.ADRENAL]: {

        totalWeeks: 8,

        goal: '부신 기능 회복 및 에너지 균형 달성',

        weeks: [

            {

                week: 1,

                theme: '완전 휴식',

                tasks: ['밤 10시 취침', '카페인 중단', '스트레스 활동 제한'],

                milestone: '수면 패턴 개선 시작'

            },

            {

                week: 2,

                theme: '영양 지원',

                tasks: ['항스트레스 식단 시작', '비타민C/마그네슘 보충', '저혈당 방지 식사'],

            },

            {

                week: 3,

                theme: '스트레스 감소',

                tasks: ['이완 활동 매일', '학습량 조절', '즐거운 활동 추가'],

                milestone: '오전 피로 감소'

            },

            {

                week: 4,

                theme: '점진적 활동',

                tasks: ['가벼운 산책 시작', '요가/스트레칭', '낮 휴식 시간 확보'],

            },

            {

                week: 5,

                theme: '생체 리듬 회복',

                tasks: ['기상 후 햇볕 쬐기', '규칙적 식사 시간', '낮잠 제한'],

            },

            {

                week: 6,

                theme: '에너지 관리',

                tasks: ['활동/휴식 균형', '에너지 저축 전략', '과로 방지'],

                milestone: '안정적 에너지 레벨'

            },

            {

                week: 7,

                theme: '점진적 복귀',

                tasks: ['학습량 점진적 증가', '운동 강도 조절', '사회 활동 재개'],

            },

            {

                week: 8,

                theme: '장기 관리',

                tasks: ['스트레스 관리 습관화', '경고 신호 인식', '지속 가능한 페이스'],

                milestone: '부신 기능 회복'

            }

        ]

    },

    [CareType.BRAIN_FATIGUE]: {

        totalWeeks: 6,

        goal: '뇌 피로 해소 및 인지 기능 회복',

        weeks: [

            {

                week: 1,

                theme: '디지털 디톡스',

                tasks: ['스크린 타임 2시간 제한', 'SNS 알림 차단', '종이책 읽기'],

                milestone: '디지털 자극 감소'

            },

            {

                week: 2,

                theme: '휴식 품질 개선',

                tasks: ['50분 공부-10분 휴식 철저', '멍때리기 연습', '자연 속 시간'],

            },

            {

                week: 3,

                theme: '뇌 회복 활동',

                tasks: ['충분한 수면 (7시간+)', '뇌 혈류 개선 운동', '창의적 활동 시도'],

                milestone: '집중 지속 시간 향상'

            },

            {

                week: 4,

                theme: '인지 부하 최적화',

                tasks: ['싱글 태스킹 훈련', '학습 자료 정리/단권화', '주의력 분산 요인 제거'],

            },

            {

                week: 5,

                theme: '브레인 트레이닝',

                tasks: ['기억력 강화 기법', '암기 루틴 구축', '메타인지 일기 작성'],

            },

            {

                week: 6,

                theme: '지속 가능한 학습',

                tasks: ['적정 학습량 유지', '정기적 뇌 휴식 습관', '최상의 뇌 컨디션 유지'],

                milestone: '브레인 포그 해소 및 집중력 회복'

            }

        ]

    },

    [CareType.HYPERSENSITIVE]: {

        totalWeeks: 6,

        goal: '감각 조절 능력 향상 및 환경 최적화',

        weeks: [

            {

                week: 1,

                theme: '환경 조절',

                tasks: ['조용한 학습 공간 확보', '조명 조절', '소음 차단 도구'],

                milestone: '최적 학습 환경 구축'

            },

            {

                week: 2,

                theme: '자기 조절',

                tasks: ['과부하 신호 인식', '휴식 공간 확보', '혼자 시간 보장'],

            },

            {

                week: 3,

                theme: '감각 탈감작',

                tasks: ['점진적 자극 노출', '이완 기법 적용', '민감도 기록'],

                milestone: '자극 저항성 향상'

            },

            {

                week: 4,

                theme: '에너지 관리',

                tasks: ['사회적 활동 후 충전 시간', '일정 여유 확보', '명확한 경계 설정'],

            },

            {

                week: 5,

                theme: '스트레스 방어',

                tasks: ['심리적 장벽 구축', '긍정적 자기 암시', '대처 카드 활용'],

            },

            {

                week: 6,

                theme: '강점 활용',

                tasks: ['집중력 강점 극대화', '섬세함의 가치 인식', '자기 수용 심화'],

                milestone: '민감성을 탁월한 성과로 전환'

            }

        ]

    },

    [CareType.ATTENTION_DEFICIT]: {

        totalWeeks: 6,

        goal: '집중력 향상 및 과제 완수율 증가',

        weeks: [

            {

                week: 1,

                theme: '환경 정비',

                tasks: ['책상 정리', '스마트폰 분리', '방해 요소 제거'],

                milestone: '집중 환경 조성'

            },

            {

                week: 2,

                theme: '시간 관리',

                tasks: ['포모도로 시작 (15분)', '타이머 사용 습관화', '작은 단위로 과제 분할'],

            },

            {

                week: 3,

                theme: '습관 형성',

                tasks: ['매일 같은 시간 공부', '시작 루틴 만들기', '체크리스트 활용'],

                milestone: '25분 연속 집중 가능'

            },

            {

                week: 4,

                theme: '보상 시스템',

                tasks: ['작은 성취 보상', '진행 상황 시각화', '자기 칭찬'],

            },

            {

                week: 5,

                theme: '과제 관리',

                tasks: ['우선순위 정하기', '마감 전 시작 습관', '부분 완성 인정'],

                milestone: '과제 완료율 70%'

            },

            {

                week: 6,

                theme: '장기 유지',

                tasks: ['자기 모니터링', '전략 조정', '지원 시스템 활용'],

                milestone: '독립적 집중 가능'

            }

        ]

    },

    [CareType.CONCENTRATION]: {

        totalWeeks: 4,

        goal: '심층 집중 능력 향상',

        weeks: [

            {

                week: 1,

                theme: '집중 기반 다지기',

                tasks: ['방해 요소 분석', '최적 시간대 파악', '집중 환경 조성'],

                milestone: '25분 연속 집중'

            },

            {

                week: 2,

                theme: '집중 시간 확장',

                tasks: ['포모도로 30분으로 증가', '휴식 품질 개선', '단일 과제 집중'],

            },

            {

                week: 3,

                theme: '딥워크 훈련',

                tasks: ['50분 집중 도전', '멀티태스킹 금지', '몰입 경험'],

                milestone: '50분 연속 집중'

            },

            {

                week: 4,

                theme: '습관 고정화',

                tasks: ['일일 딥워크 시간 확보', '집중력 유지 전략', '자기 점검 시스템'],

                milestone: '자유자재 집중 조절'

            }

        ]

    },

    [CareType.CIRCULATION]: {

        totalWeeks: 6,

        goal: '혈액순환 개선 및 신체 활력 증진',

        weeks: [

            {

                week: 1,

                theme: '움직임 시작',

                tasks: ['매 시간 일어서기', '간단한 스트레칭', '물 마시기 습관'],

                milestone: '좌식 시간 감소'

            },

            {

                week: 2,

                theme: '순환 루틴',

                tasks: ['매일 20분 걷기', '하체 운동 추가', '스탠딩 학습 시도'],

            },

            {

                week: 3,

                theme: '순환 촉진',

                tasks: ['따뜻한 물 마시기', '혈액순환 강화 음식', '족욕/반신욕 시도'],

                milestone: '손발 온도 상승 및 부종 감소'

            },

            {

                week: 4,

                theme: '심폐 기능 강화',

                tasks: ['숨찬 운동 주 3회', '깊은 흉곽 호흡', '계단 오르기'],

            },

            {

                week: 5,

                theme: '자세 정렬',

                tasks: ['거북목 교정 운동', '골반 정렬 스트레칭', '바른 자세 학습'],

            },

            {

                week: 6,

                theme: '활력 유지',

                tasks: ['규칙적 운동 습관 정착', '전신 순환 루틴 유지', '활동적 생활 양식'],

                milestone: '전신 활력 및 뇌 명료도 향상'

            }

        ]

    },

};
