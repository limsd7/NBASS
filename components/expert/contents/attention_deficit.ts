// EXPERT_CONTENTS partial (moved verbatim; no content change)
import { CareType } from '../../../types';
import type { CareContent } from '../expertTypes';

export const PART_ATTENTION_DEFICIT: Record<string, CareContent> = {
    [CareType.ATTENTION_DEFICIT]: {

        prestudy: {

            title: "⚡ Step 1. 도파민 점화 (Ignition)",

            intro: "\"흥미가 없으면 뇌가 켜지지 않습니다.\" 재미와 자극을 일부러 만들어야 합니다.",

            guides: [

                {

                    title: "피젯 토이 (Fidgeting)",

                    expertDesc: "손을 꼼지락거려 뇌의 각성도를 유지합니다.",

                    rationale: "ADHD 성향의 뇌는 가만히 있으면 잡니다. 손을 움직여 전두엽에 지속적인 자극을 주어야 집중이 유지됩니다.",

                    managerGuide: "🗣️ 도구: \"펜 돌려도 돼. 스피너 돌려도 돼. 손을 가만히 두지 마.\"",

                    action: "피젯 스피너, 큐브 등을 한 손으로 만지작거리며 공부.",

                    difficulty: 'hard'

                },

                {

                    title: "노동요 (Binaural Beats)",

                    expertDesc: "적절한 청각 자극으로 집중력 주파수를 맞춥니다.",

                    rationale: "완벽한 정적은 오히려 산만함을 유발합니다. 가사가 없는 비트감 있는 음악이나 바이노럴 비트가 뇌를 집중 모드로 묶어둡니다.",

                    managerGuide: "🗣️ 음악: \"게임 BGM 같은 거 들어. 비트가 있어야 뇌가 안 심심해해.\"",

                    action: "게임 사운드트랙이나 Lo-Fi 음악 재생.",

                    difficulty: 'easy'

                },

                {

                    title: "타이머 선언 (Challenge)",

                    expertDesc: "시간 제한을 두어 게임처럼 만듭니다.",

                    rationale: "마감이 닥쳐야 움직이는 뇌입니다. 인위적인 마감을 5분 단위로 만들어 긴장감을 조성하세요.",

                    managerGuide: "🗣️ 미션: \"지금부터 5분 안에 이 문제 다 풀면 승리! 준비, 시작!\"",

                    action: "타이머를 짧게(10~15분) 설정하고 타임 어택.",

                    difficulty: 'medium'

                },

                {

                    title: "카페인 전략적 사용",

                    expertDesc: "적당량의 카페인은 전두엽 자극제입니다.",

                    rationale: "카페인은 도파민 재흡수를 막아 집중력을 높여줍니다. (단, 오후 늦게는 피할 것)",

                    managerGuide: "🗣️ 아이템: \"집중 안 돼? 시원한 아이스 커피 한 잔 마시고 딱 1시간만 달리자.\"",

                    action: "학습 시작 전 소량의 카페인 섭취.",

                    difficulty: 'hard'

                }

            ]

        },

        learning: {

            title: "🧠 Step 2. 다이내믹 학습 (Activities)",

            intro: "눈으로만 보는 공부는 지옥입니다. 온몸을 사용하여 공부하세요.",

            guides: [

                {

                    title: "낭독과 강의 (Teaching)",

                    expertDesc: "입으로 떠들면서 공부해야 뇌가 딴생각을 안 합니다.",

                    rationale: "말하기는 고도의 인지 활동입니다. 내가 일타강사가 되어 설명하듯 떠들면 잡념이 끼어들 틈이 없습니다.",

                    managerGuide: "🗣️ 연기: \"네가 선생님이야. 인형들 앉혀놓고 이거 설명해봐.\"",

                    action: "서서 화이트보드에 설명하거나 중얼거리며 공부.",

                    difficulty: 'easy'

                },

                {

                    title: "스탠딩 워크 (Movement)",

                    expertDesc: "서서 왔다 갔다 하며 뇌 혈류를 공급합니다.",

                    rationale: "움직이면 전전두엽 기능이 향상됩니다. 제자리에 앉아있기 힘들면 차라리 걸어 다니면서 단어장을 보세요.",

                    managerGuide: "🗣️ 허용: \"산만해도 괜찮아. 그냥 서서 해. 돌아다니면서 외워.\"",

                    action: "스탠딩 책상 사용 또는 방 안을 걸어 다니며 암기.",

                    difficulty: 'medium'

                },

                {

                    title: "낙서와 마킹 (Doodling)",

                    expertDesc: "손을 바쁘게 하여 시각적 주의를 붙잡습니다.",

                    rationale: "책을 더럽히세요. 줄을 긋고, 동그라미를 치고, 그림을 그려야 뇌가 텍스트에 머뭅니다.",

                    managerGuide: "🗣️ 지시: \"책 깨끗하게 쓰지 마. 마구 낙서해. 중요하다고 생각하는 거 다 표시해.\"",

                    action: "형광펜과 색연필로 적극적으로 표시하며 읽기.",

                    difficulty: 'hard'

                },

                {

                    title: "장소 바꾸기 (Novelty)",

                    expertDesc: "장소를 바꿔 신선한 자극을 줍니다.",

                    rationale: "같은 장소는 지루합니다. 집, 카페, 도서관으로 2시간마다 장소를 옮기면 뇌는 새로운 곳에서 다시 긴장합니다.",

                    managerGuide: "🗣️ 전환: \"여기 지겹지? 짐 싸. 카페 가서 1시간만 더 하고 오자.\"",

                    action: "1~2시간마다 공부 장소 변경 (카페, 거실, 방).",

                    difficulty: 'easy'

                }

            ]

        },

        exercise: {

            title: "🏃 Step 3. 복잡한 움직임 (Skill)",

            intro: "단순 반복 운동보다는 기술이 필요한 운동이 뇌를 자극합니다.",

            guides: [

                {

                    title: "구기 종목/댄스",

                    expertDesc: "복잡한 동작은 소뇌와 전두엽을 연결합니다.",

                    rationale: "춤을 추거나 공을 다루는 것은 뇌의 타이밍 감각과 조절 능력을 훈련시킵니다. 집중력 회로를 강화하는 최고의 운동입니다.",

                    managerGuide: "🗣️ 추천: \"주말에 농구 한 판 하거나 방송 댄스 배워봐. 머리가 확 좋아질 거야.\"",

                    action: "테니스, 배드민턴, 댄스 등 기술 운동.",

                    difficulty: 'medium'

                },

                {

                    title: "인터벌 러닝",

                    expertDesc: "강약 조절이 있는 운동이 도파민을 뿜어냅니다.",

                    rationale: "그냥 뛰는 것보다 '1분 전력 질주, 2분 걷기'처럼 변화를 주면 뇌는 지루해하지 않고 각성 상태를 유지합니다.",

                    managerGuide: "🗣️ 미션: \"운동장 한 바퀴는 미친듯이 뛰고, 한 바퀴는 걷자. 딱 3번만 반복해.\"",

                    action: "고강도 인터벌 트레이닝 (HIIT) 20분.",

                    difficulty: 'hard'

                },

                {

                    title: "밸런스 운동",

                    expertDesc: "균형을 잡으려는 노력이 집중력을 기릅니다.",

                    rationale: "짐볼 위에 앉거나 한 발로 서기는 소뇌를 자극하여 주의 집중력을 높입니다.",

                    managerGuide: "🗣️ 놀이: \"한 발로 1분 버티기 해볼까? 흔들리면 지는 거야.\"",

                    action: "짐볼 운동, 외발 서기, 보드 타기.",

                    difficulty: 'easy'

                },

                {

                    title: "클라이밍",

                    expertDesc: "문제 해결 능력을 요하는 전신 운동입니다.",

                    rationale: "어느 홀드를 잡을지 고민하고 몸을 쓰는 클라이밍은 '몸으로 하는 체스'입니다. 두뇌 회전과 체력을 동시에 기릅니다.",

                    managerGuide: "🗣️ 도전: \"클라이밍 어때? 길을 찾아야 올라갈 수 있어. 엄청 재밌을걸?\"",

                    action: "실내 클라이밍 체험.",

                    difficulty: 'medium'

                }

            ]

        }

    }
};
