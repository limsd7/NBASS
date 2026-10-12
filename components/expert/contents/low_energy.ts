// EXPERT_CONTENTS partial (moved verbatim; no content change)
import { CareType } from '../../../types';
import type { CareContent } from '../expertTypes';

export const PART_LOW_ENERGY: Record<string, CareContent> = {
    [CareType.LOW_ENERGY]: {

        prestudy: {

            title: "⚡ Step 1. 각성과 점화 (Ignition)",

            intro: "\"시동이 잘 안 걸리는 차일 뿐입니다.\" 예열 과정을 통해 뇌 온도를 높여야 합니다.",

            guides: [

                {

                    title: "업비트 음악 (BPM 130+)",

                    expertDesc: "빠른 템포의 음악으로 두뇌의 각성도를 끌어올립니다.",

                    rationale: "무기력한 뇌는 저각성(수면/멍함) 상태입니다. 빠른 비트는 청각 피질을 자극하여 뇌 전체의 텐션을 강제로 높입니다.",

                    managerGuide: "🗣️ DJ: \"신나는 아이돌 노래, 록 음악 크게 틀어. 몸이 들썩거려야 뇌도 춤을 춘다.\"",

                    action: "공부 시작 전 3곡, 댄스곡이나 록 음악 듣기.",

                    difficulty: 'hard'

                },

                {

                    title: "스탠딩 스타트 (Standing)",

                    expertDesc: "서서 시작함으로써 신체 각성도를 높입니다.",

                    rationale: "앉으면 눕고 싶어집니다. 서 있는 자세는 뇌에게 '활동 중'이라는 신호를 줍니다. 서서 책을 보면 졸음이 오기 힘듭니다.",

                    managerGuide: "🗣️ 환경: \"처음 10분은 서서 소리 내어 읽어. 일단 몸을 일으켜야 머리도 깬다.\"",

                    action: "스탠딩 책상을 쓰거나 높은 선반에 책을 두고 서서 시작.",

                    difficulty: 'easy'

                },

                {

                    title: "차가운 물 한 잔 (Wake Up)",

                    expertDesc: "내장 기관을 깨워 교감 신경을 살짝 자극합니다.",

                    rationale: "공복의 냉수는 위장을 자극하여 신진대사를 깨웁니다. 뇌로 가는 혈류량도 일시적으로 증가합니다.",

                    managerGuide: "🗣️ 습관: \"눈 뜨면 냉수 한 잔 원샷. 그게 시동 버튼이야.\"",

                    action: "얼음물이나 아주 차가운 물 한 잔 마시기.",

                    difficulty: 'medium'

                },

                {

                    title: "조명 밝기 UP (Lux)",

                    expertDesc: "강한 빛으로 멜라토닌을 억제하고 각성 호르몬을 분비시킵니다.",

                    rationale: "어두운 방은 뇌를 재웁니다. 스탠드 밝기를 최대로 높이거나 청색광(Cool White) 조명을 사용하여 뇌를 낮 시간으로 착각하게 만드세요.",

                    managerGuide: "🗣️ 조명: \"방이 왜 이렇게 어두워? 불 다 켜. 환해야 뇌가 일할 시간인 줄 알아.\"",

                    action: "방 전체 등 + 스탠드 동시에 켜기, 쿨화이트 전구 사용.",

                    difficulty: 'hard'

                }

            ]

        },

        learning: {

            title: "🧠 Step 2. 도파민 펌핑 (Dopamine Booster)",

            intro: "지루함은 무기력의 먹이입니다. 공부를 게임처럼 만들어 도파민을 끊임없이 공급해야 합니다.",

            guides: [

                {

                    title: "타임 어택 (Gamification)",

                    expertDesc: "시간 제한을 두어 긴장감을 조성합니다.",

                    rationale: "느슨한 공부는 뇌를 끄게 만듭니다. '이 문제를 3분 안에 푼다'는 미션을 걸면 뇌는 비상 사태로 인지하고 집중력을 동원합니다.",

                    managerGuide: "🗣️ 게임: \"스톱워치 켜. 이 페이지 5분 안에 다 읽으면 승리, 못 읽으면 패배. 준비, 시작!\"",

                    action: "문제당 제한 시간을 설정하고 스톱워치로 카운트다운.",

                    difficulty: 'easy'

                },

                {

                    title: "퀴즈 쇼 (Active Interactions)",

                    expertDesc: "스스로 퀴즈를 내고 맞히며 뇌를 자극합니다.",

                    rationale: "단순 읽기는 지루합니다. 스스로 출제자가 되어 퀴즈를 만들고 맞히는 과정은 뇌의 보상 회로를 자극합니다.",

                    managerGuide: "🗣️ 놀이: \"네가 선생님이야. 이거 시험에 낼 문제 한번 만들어봐.\"",

                    action: "백지를 펴고 중요 내용을 괄호 채우기 문제로 변형.",

                    difficulty: 'medium'

                },

                {

                    title: "화려한 필기 (Visual Stimuli)",

                    expertDesc: "다양한 색깔 펜을 사용하여 시각적 지루함을 없앱니다.",

                    rationale: "무채색은 뇌를 졸리게 합니다. 형광펜, 색반전 등 시각적 자극을 다양하게 주면 뇌의 주의력이 유지됩니다.",

                    managerGuide: "🗣️ 도구: \"새 형광펜 샀어? 오늘 이거 다 써보자. 알록달록해야 눈에 들어오지.\"",

                    action: "3색 이상의 펜과 형광펜을 적극적으로 활용하여 필기.",

                    difficulty: 'hard'

                },

                {

                    title: "짧은 호흡 (Short Interval)",

                    expertDesc: "지치기 전에 쉬어서 에너지를 보존합니다.",

                    rationale: "에너지 탱크가 작으므로 자주 충전해야 합니다. 40분 공부, 20분 휴식처럼 휴식 비중을 높여 장기전을 대비합니다.",

                    managerGuide: "🗣️ 스케줄: \"무리하지 마. 조금만 하고 쉬어. 대신 쉴 땐 확실하게 쉬고.\"",

                    action: "40분 학습 / 20분 휴식 패턴 적용.",

                    difficulty: 'easy'

                }

            ]

        },

        exercise: {

            title: "🏃 Step 3. 에너지 생성 (Energy Generation)",

            intro: "에너지가 없어서 운동을 못 하는 게 아니라, 운동을 안 해서 에너지가 없는 것입니다.",

            guides: [

                {

                    title: "제자리 뛰기 (Jumping Jacks)",

                    expertDesc: "순간적으로 심박수를 높여 활력을 만듭니다.",

                    rationale: "가장 빠르게 에너지를 만드는 방법은 점프입니다. 중력을 거스르는 동작은 뇌와 신체를 순식간에 각성시킵니다.",

                    managerGuide: "🗣️ 액션: \"졸리면 벌떡 일어나서 팔벌려뛰기 20번만 해. 딱 1분이면 잠 다 깰걸?\"",

                    action: "쉬는 시간마다 1분간 제자리 뛰기.",

                    difficulty: 'medium'

                },

                {

                    title: "파워 포즈 (Wonder Woman)",

                    expertDesc: "자신감 있는 자세로 호르몬 변화를 유도합니다.",

                    rationale: "어깨를 펴고 허리에 손을 얹는 '원더우먼 자세'를 2분만 유지해도 테스토스테론(자신감)이 오르고 코르티솔(스트레스)이 내립니다.",

                    managerGuide: "🗣️ 자세: \"기지개 쫙 펴고, 슈퍼맨처럼 서 있어봐. 자세가 마음을 만든다.\"",

                    action: "거울 앞에서 당당한 포즈 취하고 2분간 유지.",

                    difficulty: 'hard'

                },

                {

                    title: "계단 오르기",

                    expertDesc: "하체 근육을 자극하여 전신 혈류를 돌립니다.",

                    rationale: "허벅지 근육은 신체 당분의 저장소입니다. 계단을 오르면 뇌로 가는 에너지 공급이 원활해집니다.",

                    managerGuide: "🗣️ 습관: \"엘리베이터 타지 말고 걸어 올라와. 그게 뇌를 충전하는 길이야.\"",

                    action: "이동 시 계단 적극 활용.",

                    difficulty: 'easy'

                },

                {

                    title: "박수 치기",

                    expertDesc: "손바닥 자극으로 뇌를 깨웁니다.",

                    rationale: "손바닥에는 수많은 신경이 연결되어 있습니다. 힘차게 박수를 치면 혈액 순환이 빨라지고 정신이 듭니다.",

                    managerGuide: "🗣️ 팁: \"집중 안 되면 박수 세 번 짝! 짝! 짝! 치고 '할 수 있다' 외쳐봐.\"",

                    action: "시작 전 박수 10번 힘차게 치기.",

                    difficulty: 'medium'

                }

            ]

        }

    },
};
