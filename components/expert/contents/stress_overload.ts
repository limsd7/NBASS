// EXPERT_CONTENTS partial (moved verbatim; no content change)
import { CareType } from '../../../types';
import type { CareContent } from '../expertTypes';

export const PART_STRESS_OVERLOAD: Record<string, CareContent> = {
    [CareType.STRESS_OVERLOAD]: {

        prestudy: {

            title: "⚡ Step 1. 압력 낮추기 (Decompression)",

            intro: "\"뇌가 과열되었습니다.\" 지금 필요한 건 더 많은 연료가 아니라, 엔진을 식히는 냉각수입니다.",

            guides: [

                {

                    title: "모래주머니 버리기 (Prioritize)",

                    expertDesc: "해야 할 일의 80%를 과감히 버리고 핵심 20%만 남깁니다.",

                    rationale: "스트레스 과부하 상태에서 '다 하겠다'는 욕심은 시스템 셧다운을 부릅니다. '이것만 하면 오늘 성공'이라는 최저 기준선이 필요합니다.",

                    managerGuide: "🗣️ 결정: \"오늘 다 못 해. 딱 중요한 3개만 골라. 나머지는 과감하게 버려. 그래도 충분해.\"",

                    action: "오늘의 할 일 중 '상위 3개'만 남기고 나머지 삭제/연기.",

                    difficulty: 'easy'

                },

                {

                    title: "두뇌 쿨링 호흡 (Cooling)",

                    expertDesc: "코로 시원한 공기를 마셔 전두엽의 열을 식힙니다.",

                    rationale: "스트레스를 받으면 뇌 온도가 상승합니다. 천천히 깊게 들이마시는 시원한 공기는 물리적으로 뇌를 쿨링하여 이성적 판단을 돕습니다.",

                    managerGuide: "🗣️ 시각화: \"머리가 뜨겁지? 시원한 박하향 공기가 뇌로 들어간다고 상상하며 숨셔봐.\"",

                    action: "창문을 열고 시원한 공기를 뇌까지 보낸다는 느낌으로 심호흡 10회.",

                    difficulty: 'medium'

                },

                {

                    title: "감정 라벨링 (Naming)",

                    expertDesc: "현재 느끼는 압박감에 이름을 붙여 객관화합니다.",

                    rationale: "감정을 언어화하면 편도체의 활성도가 낮아집니다. '나는 지금 수학 때문에 짜증이 나 있구나'라고 인정하는 순간 통제권이 생깁니다.",

                    managerGuide: "🗣️ 질문: \"지금 기분이 어때? '짜증나', '답답해'라고 말해봐. 말하는 순간 별거 아니게 돼.\"",

                    action: "\"나는 지금 ~때문에 스트레스를 받는다\"라고 종이에 적기."

                },

                {

                    title: "단백질 섭취 (Energy)",

                    expertDesc: "스트레스로 소모된 뇌 에너지를 빠르게 보급합니다.",

                    rationale: "스트레스 상황에서는 뇌가 평소보다 많은 포도당과 아미노산을 소모합니다. 공복은 예민함을 증폭시키므로 양질의 단백질이 필수입니다.",

                    managerGuide: "🗣️ 처방: \"배고프면 더 화나. 계란 하나 먹고, 두유 한 잔 마시고 시작하자.\"",

                    action: "학습 전 삶은 계란이나 단백질 셰이크 가볍게 섭취.",

                    difficulty: 'hard'

                }

            ]

        },

        learning: {

            title: "🧠 Step 2. 부하 분산 전략 (Load Balancing)",

            intro: "뇌의 부하를 덜어주는 '외주화' 전략이 필요합니다. 머리로 기억하지 말고 손과 눈을 이용하세요.",

            guides: [

                {

                    title: "청킹 (Chunking)",

                    expertDesc: "방대한 정보를 작고 만만한 덩어리로 잘게 쪼갭니다.",

                    rationale: "뇌는 거대한 정보 덩어리 앞에서 압도당합니다. 전화번호처럼 3~4자리로 정보를 끊어서 입력하면 스트레스 없이 처리할 수 있습니다.",

                    managerGuide: "🗣️ 전략: \"100페이지를 언제 다 봐? 오늘은 딱 5페이지만, 그것도 3단락씩 나눠서 보자.\"",

                    action: "목표 범위를 3등분하여 한 번에 하나씩만 책상 위에 두기.",

                    difficulty: 'easy'

                },

                {

                    title: "손으로 쓰기 (Externalizing)",

                    expertDesc: "작업 기억의 부담을 손으로 덜어냅니다.",

                    rationale: "눈으로만 보면 뇌가 모든 정보를 붙들고 있어야 합니다. 손으로 쓰면 종이가 '보조 기억 장치'가 되어 뇌의 부담이 줄어듭니다.",

                    managerGuide: "🗣️ 코칭: \"머리로 외우려고 용쓰지 마. 그냥 깜지 쓰듯이 손을 움직여. 종이가 기억하게 해.\"",

                    action: "연습장을 적극 활용하여 내용을 무조건 쓰면서 공부.",

                    difficulty: 'medium'

                },

                {

                    title: "25분 컷 (Short Sprint)",

                    expertDesc: "짧고 굵게 끝낸다는 확신을 줍니다.",

                    rationale: "스트레스를 받을 땐 인내심이 바닥납니다. 50분은 너무 깁니다. 25분만 하고 무조건 쉰다는 규칙이 뇌를 달래줍니다.",

                    managerGuide: "🗣️ 타협: \"딱 25분이야. 그것도 못해? 그것만 하면 쉬게 해줄게.\"",

                    action: "포모도로 타이머를 25분으로 설정하고 철저히 준수.",

                    difficulty: 'hard'

                },

                {

                    title: "쉬운 과목 샌드위치",

                    expertDesc: "어려운 과목 사이에 좋아하는 과목을 끼워 넣습니다.",

                    rationale: "고통-고통-고통은 뇌를 파업하게 만듭니다. 가장 자신 있는 과목을 중간에 배치하여 성취감(도파민)을 수혈해야 합니다.",

                    managerGuide: "🗣️ 배치: \"수학 하다가 머리 터질 것 같으면, 바로 좋아하는 한국사 꺼내. 머리 식히고 다시 하면 돼.\"",

                    action: "취약 과목 공부 중간에 자신 있는 과목이나 단순 암기 배치.",

                    difficulty: 'easy'

                }

            ]

        },

        exercise: {

            title: "🏃 Step 3. 해소와 발산 (Release)",

            intro: "쌓인 스트레스 호르몬을 물리적으로 배출해야 합니다. 타격하거나 소리치는 것이 도움이 됩니다.",

            guides: [

                {

                    title: "코인 노래방 (Vocal Release)",

                    expertDesc: "소리를 지르며 횡경막을 자극하고 스트레스를 발산합니다.",

                    rationale: "샤우팅은 뇌의 답답함을 해소하는 가장 원초적이고 빠른 방법입니다. 노래는 호흡을 깊게 만들고 엔돌핀을 돌게 합니다.",

                    managerGuide: "🗣️ 추천: \"오늘 공부 끝나고 코노 가서 딱 3곡만 지르고 와. 소리 지르면 속이 뚫려.\"",

                    action: "주 1~2회 노래방 방문 또는 베개에 대고 소리 지르기.",

                    difficulty: 'medium'

                },

                {

                    title: "스트레스 볼/샌드백",

                    expertDesc: "물리적 타격감을 통해 공격성을 건강하게 해소합니다.",

                    rationale: "스트레스는 '투쟁-도피' 반응입니다. 무언가를 치거나 꽉 쥐는 행위는 뇌의 '싸움' 욕구를 충족시켜 안정을 줍니다.",

                    managerGuide: "🗣️ 도구: \"짜증 나면 펜 던지지 말고, 이 인형을 주먹으로 쳐. 힘껏 쳐도 돼.\"",

                    action: "책상 옆에 스트레스 볼이나 샌드백 두고 수시로 활용.",

                    difficulty: 'hard'

                },

                {

                    title: "자연 속 걷기 (Green Therapy)",

                    expertDesc: "초록색 시각 자극이 코르티솔 수치를 낮춥니다.",

                    rationale: "인간의 뇌는 자연 속에 있을 때 가장 편안함을 느낍니다. 공원이나 나무가 있는 곳을 걷는 것만으로도 회복 속도가 2배 빨라집니다.",

                    managerGuide: "🗣️ 산책: \"학원 가는 길에 공원 쪽으로 돌아서 가. 나무 좀 보고 숨 좀 쉬어.\"",

                    action: "하루 10분 이상 나무나 하늘을 보며 걷기.",

                    difficulty: 'easy'

                },

                {

                    title: "냉수 세수 (Diving Reflex)",

                    expertDesc: "찬물이 얼굴에 닿으면 심박수가 즉시 떨어집니다.",

                    rationale: "포유류 잠수 반사(Mammalian Diving Reflex)를 이용합니다. 찬물 자극은 강제로 심장 박동을 늦추고 신경계를 초기화합니다.",

                    managerGuide: "🗣️ 팁: \"열받으면 화장실 가서 찬물로 세수해. 얼굴만 식혀도 머리가 돌아가.\"",

                    action: "졸리거나 화날 때 찬물로 얼굴과 뒷목 씻기.",

                    difficulty: 'medium'

                }

            ]

        }

    },
};
