// EXPERT_CONTENTS partial (moved verbatim; no content change)
import { CareType } from '../../../types';
import type { CareContent } from '../expertTypes';

export const PART_ANXIETY_TENSION: Record<string, CareContent> = {
    [CareType.ANXIETY_TENSION]: {

        prestudy: {

            title: "⚡ Step 1. 편도체 진정 (Calming)",

            intro: "\"불안은 뇌가 보내는 거짓 경보입니다.\" 과활성된 편도체를 진정시켜야 전두엽이 작동합니다.",

            guides: [

                {

                    title: "걱정 배출 (Worry Dump)",

                    expertDesc: "작업 기억 용량을 차지하는 '불안'을 종이에 쏟아냅니다.",

                    rationale: "불안한 생각은 뇌의 RAM(작업 기억)을 잡아먹습니다. 종이에 적는 행위만으로 뇌는 이를 '처리된 정보'로 인식하여 인지 부하를 30% 이상 줄입니다.",

                    managerGuide: "🗣️ 코칭: \"머릿속 걱정을 지금 종이에 다 적어봐. 그리고 구겨서 휴지통에 던져. 이제 뇌는 깨끗해졌어.\"",

                    action: "공부 시작 전 3분간, 방해되는 모든 걱정을 나열하고 찢어 버리기.",

                    difficulty: 'easy'

                },

                {

                    title: "그라운딩 (5-4-3-2-1)",

                    expertDesc: "오감을 자극하여 현재 시점으로 뇌를 강제 복귀시킵니다.",

                    rationale: "불안은 '미래'에 대한 공포입니다. 시각, 촉각 등 현재의 감각에 집중하면 뇌는 즉시 '안전한 현재'로 돌아와 도망치려는 반응을 멈춥니다.",

                    managerGuide: "🗣️ 제안: \"지금 눈에 보이는 빨간 물건 3개만 찾아볼래? 그리고 책상의 차가운 느낌에 집중해봐.\"",

                    action: "보이는 것 5개, 느껴지는 것 4개... 순으로 오감에 집중하기.",

                    difficulty: 'medium'

                },

                {

                    title: "결과와 과정 분리 (Detach)",

                    expertDesc: "통제 불가능한 '결과' 대신 통제 가능한 '행동'에 초점을 맞춥니다.",

                    rationale: "시험 결과는 신의 영역입니다. 뇌는 통제 불가능한 변수에 대해 스트레스를 받습니다. '오늘 3페이지 풀기'처럼 내가 할 수 있는 행동만이 불안을 잠재웁니다.",

                    managerGuide: "🗣️ 확언: \"1등급은 네가 정하는 게 아냐. 하지만 오늘 이 문제를 풀지 말지는 네가 정해. 넌 왕이야.\"",

                    action: "목표를 '100점 맞기'에서 '오늘 20문제 풀기'로 행동 중심 수정.",

                    difficulty: 'hard'

                },

                {

                    title: "4-7-8 호흡 (Vagus Nerve)",

                    expertDesc: "미주 신경을 자극하여 심박수를 강제로 안정시킵니다.",

                    rationale: "날숨을 길게 쉴 때 부교감 신경이 활성화됩니다. 신체적 긴장이 풀리면 뇌는 역으로 '상황이 안전하다'고 판단하여 학습 모드로 전환합니다.",

                    managerGuide: "🗣️ 지도: \"심장이 뛰는 건 뇌가 겁먹어서 그래. 숨을 천천히 내쉬어서 뇌를 속여보자.\"",

                    action: "4초 흡입, 7초 멈춤, 8초 배출 3세트 실시.",

                    difficulty: 'easy'

                }

            ]

        },

        learning: {

            title: "🧠 Step 2. 안정형 몰입 전략 (Safe Flow)",

            intro: "완벽주의는 불안의 다른 이름입니다. \"대충 시작해서 끝까지 가는 것\"이 승리 전략입니다.",

            guides: [

                {

                    title: "타임 박싱 (Time Boxing)",

                    expertDesc: "막연한 시간이 주는 공포를 없애기 위해 종료 시각을 못 박습니다.",

                    rationale: "끝이 보이지 않는 터널은 불안을 증폭시킵니다. '딱 30분만 하고 덮는다'는 확실한 마감은 뇌에게 안전감을 주어 몰입을 돕습니다.",

                    managerGuide: "🗣️ 약속: \"이거 언제 다 하냐고? 걱정 마, 딱 4시까지만 하고 무조건 덮을 거야.\"",

                    action: "타이머를 눈앞에 두고 정해진 시간에 강제 종료.",

                    difficulty: 'medium'

                },

                {

                    title: "개념 중심 학습 (Context First)",

                    expertDesc: "디테일에 집착하는 강박을 버리고 큰 그림부터 봅니다.",

                    rationale: "불안형 학생은 토씨 하나 놓치지 않으려다 지칩니다. 목차와 큰 흐름을 먼저 잡는 것이 뇌의 예측 불확실성을 줄여줍니다.",

                    managerGuide: "🗣️ 전략: \"나무를 보지 말고 숲을 봐. 목차부터 훑어서 지도를 머리에 넣고 시작하자.\"",

                    action: "학습 전 5분간 목차와 소제목만 읽으며 구조 파악.",

                    difficulty: 'hard'

                },

                {

                    title: "오답 노트 금지 (일시적)",

                    expertDesc: "자신의 부족함을 마주하는 고통을 일시적으로 줄여줍니다.",

                    rationale: "오답은 자존감을 깎아 불안을 가중시킬 수 있습니다. 컨디션이 저조할 땐 '맞은 문제'를 복습하며 '나도 할 수 있다'는 효능감을 먼저 채워야 합니다.",

                    managerGuide: "🗣️ 위로: \"오늘은 틀린 거 보지 마. 네가 잘 푼 문제 다시 보면서 기분 좋게 공부하자.\"",

                    action: "틀린 문제보다는 헷갈렸지만 맞춘 문제 위주로 복습.",

                    difficulty: 'easy'

                },

                {

                    title: "백색 소음 활용",

                    expertDesc: "적막함이 주는 긴장을 완화시킵니다.",

                    rationale: "완벽한 정적은 오히려 작은 소리에도 예민하게 만듭니다. 빗소리나 카페 소음은 청각적 파티고 효과를 통해 집중력을 높입니다.",

                    managerGuide: "🗣️ 환경: \"너무 조용하면 심장 소리만 들려. 빗소리 틀어놓고 편안하게 하자.\"",

                    action: "유튜브 등에서 'Rainy Cafe' 등 백색소음 재생.",

                    difficulty: 'medium'

                }

            ]

        },

        exercise: {

            title: "🏃 Step 3. 리듬 & 이완 (Rhythm)",

            intro: "규칙적인 리듬 운동은 세로토닌을 생성하여 천연 항불안제 역할을 합니다.",

            guides: [

                {

                    title: "리듬 워킹 (Serotonin Walk)",

                    expertDesc: "일정한 박자로 걷는 행위가 자율신경과 두뇌를 안정시킵니다.",

                    rationale: "하나-둘, 하나-둘. 규칙적인 리듬은 뇌간을 자극하여 세로토닌 분비를 촉진합니다. 이는 약물에 버금가는 정서 안정 효과가 있습니다.",

                    managerGuide: "🗣️ 제안: \"좋아하는 노래 비트에 맞춰서 20분만 걷자. 박자가 널 편안하게 해줄 거야.\"",

                    action: "BPM 100~120 정도의 음악을 들으며 박자에 맞춰 산책.",

                    difficulty: 'hard'

                },

                {

                    title: "점진적 근육 이완법 (PMR)",

                    expertDesc: "신체의 긴장을 의식적으로 풀어 뇌의 긴장도 풉니다.",

                    rationale: "불안하면 어깨가 굳습니다. 반대로 근육을 꽉 쥐었다가 확 풀 때의 이완 감각을 뇌에 전달하면 심리적 긴장도 같이 풀립니다.",

                    managerGuide: "🗣️ 코칭: \"주먹을 꽉 쥐어봐. 3초 뒤에 탁! 풀어. 그 시원한 느낌이 뇌에도 전해질 거야.\"",

                    action: "발끝부터 머리까지 근육을 차례로 긴장-이완 반복.",

                    difficulty: 'easy'

                },

                {

                    title: "따뜻한 차 & 족욕",

                    expertDesc: "체온 상승을 통해 부교감 신경을 활성화합니다.",

                    rationale: "신체 중심부 온도가 약간 오르면 편안함을 느끼는 신경 회로가 켜집니다. 따뜻한 물은 가장 쉬운 진정제입니다.",

                    managerGuide: "🗣️ 케어: \"공부 안 될 땐 족욕하면서 따뜻한 둥굴레차 한 잔 마셔. 그게 쉬는 거야.\"",

                    action: "자기 전 족욕 또는 따뜻한 허브티 섭취.",

                    difficulty: 'medium'

                },

                {

                    title: "요가 태양 경배 자세",

                    expertDesc: "전신을 늘려 갇혀 있던 에너지를 순환시킵니다.",

                    rationale: "몸을 웅크리는 것은 방어 자세입니다. 가슴을 활짝 여는 요가 동작은 자신감을 담당하는 테스토스테론을 미세하게 높여줍니다.",

                    managerGuide: "🗣️ 동작: \"가슴을 천장으로 활짝 열어봐. 세상이 넓어 보이고 겁날 게 없어질 거야.\"",

                    action: "아침 기상 후 태양 경배 자세 3회 실시.",

                    difficulty: 'hard'

                }

            ]

        }

    },
};
