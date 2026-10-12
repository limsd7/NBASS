// Moved verbatim from ExpertOverlay.tsx (no content change)
import { CareType } from '../../types';
import type { Resource } from './expertTypes';

export const RESOURCES: Record<string, Resource[]> = {

    [CareType.HEALTHY]: [

        {

            title: '4-7-8 호흡법 가이드 영상',

            type: 'video',

            icon: '🎬',

            description: 'Dr. Andrew Weil의 4-7-8 호흡법 설명 영상. 불안 완화와 수면 유도에 효과적.',

            url: 'https://www.youtube.com/watch?v=YRPh_GaiL8s',

            duration: '2분 30초',

            category: '호흡법'

        },

        {

            title: '포모도로 타이머 앱',

            type: 'app',

            icon: '📱',

            description: 'Focus To-Do - 포모도로 기법을 적용한 집중 타이머 앱',

            url: 'https://www.focustodo.cn/',

            category: '학습 도구'

        },

        {

            title: '학습 플래너 템플릿',

            type: 'pdf',

            icon: '📄',

            description: '주간 학습 계획표와 일일 점검표 템플릿',

            url: '/resources/study_planner_template.pdf',

            category: '학습 도구'

        },

        {

            title: '마인드맵 작성 가이드',

            type: 'pdf',

            icon: '📄',

            description: '효과적인 마인드맵 작성법과 예시 (오프라인 지원)',

            url: '/resources/mind_map_guide.html',

            category: '학습 도구'

        }

    ],

    [CareType.SLEEP]: [

        {

            title: '수면 일기 템플릿',

            type: 'pdf',

            icon: '📄',

            description: '2주간 수면 패턴을 기록하는 수면 일기 양식',

            url: '/resources/sleep_diary_template.pdf',

            category: '수면'

        },

        {

            title: '수면 위생 체크리스트',

            type: 'pdf',

            icon: '📄',

            description: '좋은 수면을 위한 환경 점검 체크리스트',

            url: '/resources/sleep_hygiene_checklist.pdf',

            category: '수면'

        },

        {

            title: '블루라이트 차단 앱 - Flux',

            type: 'app',

            icon: '📱',

            description: '컴퓨터 화면의 블루라이트를 자동으로 조절하는 앱',

            url: 'https://justgetflux.com/',

            category: '수면'

        },

        {

            title: '수면 유도 명상 (10분)',

            type: 'video',

            icon: '🎬',

            description: '잠들기 전 듣는 가이드 명상 - 이완과 수면 유도',

            url: 'https://www.youtube.com/watch?v=aEqlQvczMJQ',

            duration: '10분',

            category: '명상'

        },

        {

            title: '백색소음 재생기',

            type: 'link',

            icon: '🔗',

            description: '수면에 도움되는 백색소음/자연음 사이트',

            url: 'https://mynoise.net/',

            category: '수면'

        }

    ],

    [CareType.BURNOUT]: [

        {

            title: '번아웃 자가진단 체크리스트',

            type: 'pdf',

            icon: '📄',

            description: 'MBI 기반 번아웃 증상 체크리스트',

            url: '/resources/burnout_checklist.pdf',

            category: '자가진단'

        },

        {

            title: '에너지 관리 워크시트',

            type: 'pdf',

            icon: '📄',

            description: '일일 에너지 수준 추적 및 회복 활동 계획표',

            url: '/resources/energy_management.pdf',

            category: '회복'

        },

        {

            title: '마음챙김 명상 (5분)',

            type: 'video',

            icon: '🎬',

            description: '짧은 마음챙김 명상 - 스트레스 해소용',

            url: 'https://www.youtube.com/watch?v=inpok4MKVLM',

            duration: '5분',

            category: '명상'

        },

        {

            title: '자기 돌봄 아이디어 50가지',

            type: 'pdf',

            icon: '📄',

            description: '번아웃 회복을 위한 다양한 자기 돌봄 활동 목록 (오프라인 지원)',

            url: '/resources/self_care_guide.html',

            category: '회복'

        }

    ],

    [CareType.ANXIETY_TENSION]: [

        {

            title: '4-7-8 호흡법 영상',

            type: 'video',

            icon: '🎬',

            description: '불안 완화를 위한 호흡법 가이드',

            url: 'https://www.youtube.com/watch?v=YRPh_GaiL8s',

            duration: '2분 30초',

            category: '호흡법'

        },

        {

            title: '점진적 근육 이완법',

            type: 'video',

            icon: '🎬',

            description: '전신 근육을 순차적으로 이완하는 기법 영상',

            url: 'https://www.youtube.com/watch?v=ihO02wUzgkc',

            duration: '15분',

            category: '이완'

        },

        {

            title: '불안 일지 템플릿',

            type: 'pdf',

            icon: '📄',

            description: '불안 상황, 생각, 감정을 기록하는 인지행동 워크시트',

            url: '/resources/anxiety_journal.pdf',

            category: '자기관찰'

        },

        {

            title: 'BAI 불안 척도 해석 가이드',

            type: 'pdf',

            icon: '📄',

            description: 'Beck 불안 척도 점수 해석 및 활용법',

            url: '/resources/bai_guide.pdf',

            category: '평가도구'

        },

        {

            title: '그라운딩 기법 카드',

            type: 'image',

            icon: '🖼️',

            description: '5-4-3-2-1 그라운딩 기법 설명 이미지',

            url: '/resources/grounding_card.png',

            category: '이완'

        }

    ],

    [CareType.STRESS_OVERLOAD]: [

        {

            title: '스트레스 관리 워크북',

            type: 'pdf',

            icon: '📄',

            description: '스트레스 원인 분석 및 대처 전략 워크시트',

            url: '/resources/stress_workbook.pdf',

            category: '자기관리'

        },

        {

            title: '운동 루틴 영상 (7분)',

            type: 'video',

            icon: '🎬',

            description: '집에서 할 수 있는 7분 스트레스 해소 운동',

            url: 'https://www.youtube.com/watch?v=mmq5zZfmIws',

            duration: '7분',

            category: '운동'

        },

        {

            title: '감정 일기 앱 - Daylio',

            type: 'app',

            icon: '📱',

            description: '매일 기분과 활동을 기록하는 간편한 감정 일기 앱',

            url: 'https://daylio.net/',

            category: '자기관찰'

        },

        {

            title: '심호흡 가이드 (GIF)',

            type: 'image',

            icon: '🖼️',

            description: '호흡 타이밍을 시각화한 움직이는 이미지',

            url: '/resources/breathing_guide.gif',

            category: '호흡법'

        }

    ],

    [CareType.LOW_ENERGY]: [

        {

            title: '에너지 부스팅 아침 루틴',

            type: 'video',

            icon: '🎬',

            description: '10분 아침 스트레칭 및 활력 운동',

            url: 'https://www.youtube.com/watch?v=4pKly2JojMw',

            duration: '10분',

            category: '운동'

        },

        {

            title: '식사 기록표',

            type: 'pdf',

            icon: '📄',

            description: '일주일 식사 및 간식 기록표',

            url: '/resources/meal_log.pdf',

            category: '영양'

        },

        {

            title: '비타민D 정보 가이드',

            type: 'pdf',

            icon: '📄',

            description: '비타민D 부족 증상과 보충 방법 (오프라인 지원)',

            url: '/resources/vitamin_d_guide.html',

            category: '영양'

        },

        {

            title: '아침 기상 알람 앱 - Alarmy',

            type: 'app',

            icon: '📱',

            description: '확실하게 깨울 수 있는 미션 알람 앱',

            url: 'https://alar.my/',

            category: '생활습관'

        }

    ],

    [CareType.DEPRESSION_AMOTIVATION]: [

        {

            title: 'PHQ-9 우울 척도 해석',

            type: 'pdf',

            icon: '📄',

            description: '우울 척도 점수별 의미와 다음 단계 안내',

            url: '/resources/phq9_guide.pdf',

            category: '평가도구'

        },

        {

            title: '행동 활성화 워크시트',

            type: 'pdf',

            icon: '📄',

            description: '즐거운 활동 목록과 일정 계획표',

            url: '/resources/behavioral_activation.pdf',

            category: '치료기법'

        },

        {

            title: '긍정 확언 오디오',

            type: 'video',

            icon: '🎬',

            description: '자존감 회복을 위한 긍정 확언 오디오',

            url: 'https://www.youtube.com/watch?v=2FV4mLR1A8E',

            duration: '10분',

            category: '정서지원'

        },

        {

            title: '위기 상담 핫라인 목록',

            type: 'pdf',

            icon: '📄',

            description: '전국 정신건강 상담 전화번호 모음',

            url: '/resources/crisis_hotlines.pdf',

            category: '위기지원'

        },

        {

            title: '감사 일기 템플릿',

            type: 'pdf',

            icon: '📄',

            description: '매일 감사한 것 3가지 기록하기',

            url: '/resources/gratitude_journal.pdf',

            category: '정서지원'

        }

    ],

    [CareType.ADRENAL]: [

        {

            title: '부신 피로 자가진단',

            type: 'pdf',

            icon: '📄',

            description: '부신 피로 증상 체크리스트',

            url: '/resources/adrenal_checklist.pdf',

            category: '자가진단'

        },

        {

            title: '항스트레스 식단 가이드',

            type: 'pdf',

            icon: '📄',

            description: '부신 회복을 위한 영양 가이드',

            url: '/resources/adrenal_diet.pdf',

            category: '영양'

        },

        {

            title: '아침 루틴 체크리스트',

            type: 'pdf',

            icon: '📄',

            description: '부신 피로 회복을 위한 아침 루틴',

            url: '/resources/morning_routine.pdf',

            category: '생활습관'

        },

        {

            title: '이완 명상 (20분)',

            type: 'video',

            icon: '🎬',

            description: '부교감신경 활성화를 위한 깊은 이완 명상',

            url: 'https://www.youtube.com/watch?v=O-6f5wQXSu8',

            duration: '20분',

            category: '명상'

        }

    ],

    [CareType.BRAIN_FATIGUE]: [

        {

            title: '뇌 휴식 타이머 앱',

            type: 'app',

            icon: '📱',

            description: '50-10 학습-휴식 사이클 타이머',

            url: 'https://www.forestapp.cc/',

            category: '학습 도구'

        },

        {

            title: '눈 스트레칭 영상',

            type: 'video',

            icon: '🎬',

            description: '눈 피로 해소를 위한 5분 눈 운동',

            url: 'https://www.youtube.com/watch?v=W10J2lv3Ufc',

            duration: '5분',

            category: '휴식'

        },

        {

            title: '디지털 디톡스 가이드',

            type: 'pdf',

            icon: '📄',

            description: '스크린 타임 줄이기 실천 가이드',

            url: '/resources/digital_detox.pdf',

            category: '생활습관'

        },

        {

            title: '목/어깨 스트레칭',

            type: 'video',

            icon: '🎬',

            description: '책상 앞에서 할 수 있는 스트레칭',

            url: 'https://www.youtube.com/watch?v=SedzswEwpPw',

            duration: '8분',

            category: '휴식'

        }

    ],

    [CareType.HYPERSENSITIVE]: [

        {

            title: '감각 과부하 대처 카드',

            type: 'pdf',

            icon: '📄',

            description: '감각 자극이 과할 때 사용하는 대처 카드',

            url: '/resources/sensory_coping.pdf',

            category: '대처전략'

        },

        {

            title: '노이즈 캔슬링 앱',

            type: 'app',

            icon: '📱',

            description: 'Krisp - 주변 소음 차단 앱',

            url: 'https://krisp.ai/',

            category: '환경조절'

        },

        {

            title: '자연 소리 재생기',

            type: 'link',

            icon: '🔗',

            description: '숲, 비, 파도 등 자연 소리',

            url: 'https://www.noisli.com/',

            category: '환경조절'

        },

        {

            title: '혼자 있는 시간의 힘',

            type: 'pdf',

            icon: '📄',

            description: '내향인을 위한 에너지 충전 가이드 (오프라인 지원)',

            url: '/resources/spending_time_alone_guide.html',

            category: '자기이해'

        }

    ],

    [CareType.ATTENTION_DEFICIT]: [

        {

            title: 'ADHD 선별 체크리스트',

            type: 'pdf',

            icon: '📄',

            description: 'ASRS 기반 주의력 자가점검표',

            url: '/resources/adhd_checklist.pdf',

            category: '평가도구'

        },

        {

            title: '포모도로 타이머 (25분)',

            type: 'app',

            icon: '📱',

            description: 'Tomato Timer - 웹 기반 간편 타이머',

            url: 'https://tomato-timer.com/',

            category: '학습 도구'

        },

        {

            title: '집중력 향상 음악',

            type: 'video',

            icon: '🎬',

            description: '학습용 집중력 향상 BGM (2시간)',

            url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',

            duration: '2시간',

            category: '학습 도구'

        },

        {

            title: '책상 정리 체크리스트',

            type: 'pdf',

            icon: '📄',

            description: '집중 환경 만들기 위한 책상 정리 가이드',

            url: '/resources/desk_organization.pdf',

            category: '환경조절'

        },

        {

            title: '앱 차단기 - Freedom',

            type: 'app',

            icon: '📱',

            description: '집중을 방해하는 앱과 사이트 차단',

            url: 'https://freedom.to/',

            category: '학습 도구'

        }

    ],

    [CareType.CONCENTRATION]: [

        {

            title: '집중력 음악 (Lo-Fi)',

            type: 'video',

            icon: '🎬',

            description: 'Lo-Fi Hip Hop 24/7 스트리밍',

            url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',

            duration: '라이브',

            category: '학습 도구'

        },

        {

            title: '마인드풀 스터디 가이드',

            type: 'pdf',

            icon: '📄',

            description: '마음챙김 기반 집중 학습법',

            url: '/resources/mindful_study.pdf',

            category: '학습법'

        },

        {

            title: 'Forest 앱 - 집중 타이머',

            type: 'app',

            icon: '📱',

            description: '나무를 키우며 집중하는 게이미피케이션 앱',

            url: 'https://www.forestapp.cc/',

            category: '학습 도구'

        },

        {

            title: '딥워크 전략 요약',

            type: 'pdf',

            icon: '📄',

            description: 'Cal Newport의 딥워크 핵심 정리',

            url: '/resources/deep_work_summary.pdf',

            category: '학습법'

        }

    ],

    [CareType.CIRCULATION]: [

        {

            title: '책상 스트레칭 영상',

            type: 'video',

            icon: '🎬',

            description: '5분 앉아서 하는 전신 스트레칭',

            url: 'https://www.youtube.com/watch?v=tAUf7aajBWE',

            duration: '5분',

            category: '운동'

        },

        {

            title: '스탠딩 데스크 가이드',

            type: 'pdf',

            icon: '📄',

            description: '서서 공부하기의 장점과 실전 가이드 (오프라인 지원)',

            url: '/resources/standing_desk_guide.html',

            category: '환경조절'

        },

        {

            title: '수분 섭취 추적 앱',

            type: 'app',

            icon: '📱',

            description: 'Water Reminder - 물 마시기 알림 앱',

            url: 'https://play.google.com/store/apps/details?id=com.northpark.drinkwater',

            category: '건강관리'

        },

        {

            title: '간단 스쿼트 영상',

            type: 'video',

            icon: '🎬',

            description: '쉬는 시간 3분 하체 운동',

            url: 'https://www.youtube.com/watch?v=aclHkVaku9U',

            duration: '3분',

            category: '운동'

        },

        {

            title: '혈액순환 촉진 음식',

            type: 'pdf',

            icon: '📄',

            description: '혈액순환에 좋은 음식 목록 (오프라인 지원)',

            url: '/resources/blood_flow_foods.html',

            category: '영양'

        }

    ]

};
