// EXPERT_CONTENTS partial (moved verbatim; no content change)
import { CareType } from '../../../types';
import type { CareContent } from '../expertTypes';

export const PART_DEPRESSION_AMOTIVATION: Record<string, CareContent> = {
    [CareType.DEPRESSION_AMOTIVATION]: {

        prestudy: {

            title: "⚡ Step 1. 문턱 낮추기 (Low Friction)",

            intro: "\"의욕은 행동한 뒤에 따라옵니다.\" 시작의 장벽을 바닥까지 낮춰야 합니다.",

            guides: [

                {

                    title: "5분 법칙 (Just 5 Mins)",

                    expertDesc: "뇌의 저항감을 최소화하기 위해 '딱 5분'만 한다고 속입니다.",

                    rationale: "시작이 가장 어렵습니다. '5분만 하고 마음에 안 들면 그만두자'는 생각은 뇌의 부담을 덜어주어 일단 시작하게 만듭니다. 대개는 5분을 넘겨 계속하게 됩니다.",

                    managerGuide: "🗣️ 협상: \"공부하지 마. 딱 5분만 책 펴놓고 멍때리자. 5분 뒤에 하기 싫으면 자도 돼.\"",

                    action: "타이머 5분 맞추고 일단 책상에 앉기.",

                    difficulty: 'hard'

                },

                {

                    title: "침대 탈출 (Bed Separation)",

                    expertDesc: "우울의 늪인 침대와 자신을 물리적으로 분리합니다.",

                    rationale: "침대에 누워 있으면 뇌는 무기력을 학습합니다. 일어나는 행위 자체가 첫 번째 승리입니다.",

                    managerGuide: "🗣️ 미션: \"눈 뜨면 좀비처럼 기어서라도 책상 의자에 앉아. 그게 오늘의 첫 성공이야.\"",

                    action: "기상 즉시 이불 개고 책상 의자에 앉기 (공부 안 해도 됨).",

                    difficulty: 'easy'

                },

                {

                    title: "햇볕 샤워 (Sunlight)",

                    expertDesc: "세로토닌을 생성하여 우울감을 걷어냅니다.",

                    rationale: "햇볕은 최고의 천연 항우울제입니다. 망막에 빛이 들어오면 기분을 좋게 하는 세로토닌이 분비되어 의욕 생성의 기초가 됩니다.",

                    managerGuide: "🗣️ 처방: \"커튼 활짝 걷어. 창문 열고 햇빛 5분만 봐. 기분이 한결 나아질 거야.\"",

                    action: "창가에서 햇볕 쬐며 양치하기.",

                    difficulty: 'medium'

                },

                {

                    title: "쉬운 목표 세분화",

                    expertDesc: "아주 작은 성취감으로 도파민 회로를 재가동합니다.",

                    rationale: "우울하면 '아무것도 못 한다'는 무력감에 빠집니다. '책 펴기', '필통 열기' 같은 사소한 성공을 체크하며 뇌에 '나도 할 수 있다'는 신호를 줍니다.",

                    managerGuide: "🗣️ 칭찬: \"와, 책 폈네? 대단해. 이번엔 펜 뚜껑 열어볼까? 잘했어!\"",

                    action: "체크리스트에 '노트 펴기', '제목 쓰기' 등 아주 사소한 것 적고 지우기.",

                    difficulty: 'hard'

                }

            ]

        },

        learning: {

            title: "🧠 Step 2. 의미 연결 (Connection)",

            intro: "공부의 이유를 잃어버린 상태입니다. 내가 좋아하는 것과 공부를 연결해야 합니다.",

            guides: [

                {

                    title: "좋아하는 과목부터",

                    expertDesc: "싫어하는 과목은 과감히 미루고 흥미 있는 것부터 합니다.",

                    rationale: "지금은 편식이 필요합니다. 뇌가 거부감을 느끼지 않는 과목으로 학습 궤도에 진입하는 것이 우선입니다.",

                    managerGuide: "🗣️ 허용: \"수학 싫으면 하지 마. 네가 좋아하는 역사 만화책부터 보자. 글자 읽는 게 어디야.\"",

                    action: "가장 부담 없는 과목이나 독서로 시작.",

                    difficulty: 'easy'

                },

                {

                    title: "의미 부여 (Why)",

                    expertDesc: "이 공부가 내 삶에 어떤 도움이 될지 이기적으로 생각합니다.",

                    rationale: "타인을 위한 공부는 동기가 생기지 않습니다. 이 공부가 나의 돈, 명예, 자유에 어떻게 기여할지 상상하면 도파민이 나옵니다.",

                    managerGuide: "🗣️ 질문: \"이거 배워서 어디다 써먹을까? 나중에 돈 많이 버는 데 도움 되나?\"",

                    action: "학습 전 '이 공부를 하면 나에게 좋은 점 1가지' 적기.",

                    difficulty: 'medium'

                },

                {

                    title: "카페인 & 초콜릿 (Reward)",

                    expertDesc: "즉각적인 보상으로 뇌를 달랩니다.",

                    rationale: "내적 동기가 부족할 땐 외적 보상이 필요합니다. 공부할 때만 먹을 수 있는 간식을 마련하면 뇌는 그 간식을 먹기 위해 책상에 앉습니다.",

                    managerGuide: "🗣️ 유혹: \"이 문제 다 풀면 초콜릿 하나 먹자. 공부할 때만 먹는 특별한 거야.\"",

                    action: "학습 분량 끝날 때마다 작은 간식 보상.",

                    difficulty: 'hard'

                },

                {

                    title: "친구와 함께 (Social)",

                    expertDesc: "고립감을 없애고 사회적 유대감으로 움직입니다.",

                    rationale: "혼자 하면 우울해집니다. 도서관이나 스터디 카페 등 남들이 열심히 하는 공간에 가면 거울 뉴런이 작동하여 덩달아 하게 됩니다.",

                    managerGuide: "🗣️ 제안: \"집에만 있지 말고 도서관 가자. 남들 공부하는 구경만 해도 자극 돼.\"",

                    action: "스터디 그룹 참여 또는 열린 공간에서 학습.",

                    difficulty: 'easy'

                }

            ]

        },

        exercise: {

            title: "🏃 Step 3. 행동 활성화 (Activation)",

            intro: "생각은 우울증을 키우지만, 몸의 움직임은 우울증을 죽입니다.",

            guides: [

                {

                    title: "무작정 걷기 (Just Walk)",

                    expertDesc: "생각할 틈을 주지 않고 다리를 움직입니다.",

                    rationale: "걸으면 뇌의 전두엽이 활성화되어 부정적인 반추(곱씹기)가 줄어듭니다. 목적지 없이 그냥 걷는 것만으로도 뇌는 긍정적으로 변합니다.",

                    managerGuide: "🗣️ 독려: \"생각하지 마. 그냥 운동화 신고 밖으로 나가. 10분만 걷고 오자.\"",

                    action: "매일 같은 시간 20분 산책.",

                    difficulty: 'medium'

                },

                {

                    title: "반려동물/식물 케어",

                    expertDesc: "타 대상을 돌보며 존재 가치를 확인합니다.",

                    rationale: "무언가를 돌보는 행위는 옥시토신을 분비시켜 정서적 안정을 줍니다. 나도 쓸모 있는 존재라는 느낌이 생명력을 줍니다.",

                    managerGuide: "🗣️ 부탁: \"강아지 산책 좀 시켜줄래? 너 아니면 안 돼.\"",

                    action: "강아지 산책시키기 또는 화분에 물 주기.",

                    difficulty: 'hard'

                },

                {

                    title: "자세 교정 (Upright)",

                    expertDesc: "구부정한 자세를 펴서 기분을 바꿉니다.",

                    rationale: "우울하면 등이 굽습니다. 반대로 등을 펴고 턱을 들면 뇌는 자신이 당당하다고 착각하게 됩니다. 신체 언어가 감정을 지배합니다.",

                    managerGuide: "🗣️ 교정: \"가슴 펴! 어깨 펴! 고개 들고! 자세가 바뀌면 마음도 바뀐다.\"",

                    action: "의식적으로 척추를 펴고 시선을 정면보다 약간 위로 두기.",

                    difficulty: 'easy'

                },

                {

                    title: "방 청소 (Environment)",

                    expertDesc: "혼란스러운 주변을 정리하여 마음의 질서를 잡습니다.",

                    rationale: "어지러운 방은 혼란스러운 마음을 대변합니다. 주변을 깨끗이 하면 통제감이 생기고 뇌가 맑아집니다.",

                    managerGuide: "🗣️ 시작: \"책상 위에 쓰레기만이라도 줍자. 방이 깨끗해지면 머리도 맑아져.\"",

                    action: "하루 10분 내 방 정리정돈.",

                    difficulty: 'medium'

                }

            ]

        }

    },
};
