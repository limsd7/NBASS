// EXPERT_CONTENTS partial (moved verbatim; no content change)
import { CareType } from '../../../types';
import type { CareContent } from '../expertTypes';

export const PART_HYPERSENSITIVE: Record<string, CareContent> = {
    [CareType.HYPERSENSITIVE]: {

        prestudy: {

            title: "⚡ Step 1. 감각 차단 (Sensory Gating)",

            intro: "\"당신의 뇌는 필터가 없는 상태입니다.\" 불필요한 자극을 물리적으로 차단해야 합니다.",

            guides: [

                {

                    title: "노이즈 캔슬링 (Silence)",

                    expertDesc: "청각적 정보 처리를 0으로 만듭니다.",

                    rationale: "과민한 뇌는 옆 사람의 볼펜 소리도 천둥처럼 듣습니다. 노이즈 캔슬링 헤드폰이나 귀마개는 선택이 아니라 필수 생존 도구입니다.",

                    managerGuide: "🗣️ 장비: \"헤드폰 써. 세상 소리 다 끄고 너만의 우주로 들어가는 거야.\"",

                    action: "공부 시작 전 반드시 귀마개나 노캔 이어폰 착용.",

                    difficulty: 'hard'

                },

                {

                    title: "후드티/모자 (Tunnel Vision)",

                    expertDesc: "시야각을 좁혀 주변의 움직임을 차단합니다.",

                    rationale: "주변 시야에 들어오는 사람들의 움직임은 집중력을 끊습니다. 모자를 눌러써서 시야를 책으로 한정시키세요.",

                    managerGuide: "🗣️ 복장: \"모자 푹 눌러써. 옆에 누가 지나가든 안 보이게. 경주마처럼 앞만 봐.\"",

                    action: "모자나 후드티 착용 후 학습.",

                    difficulty: 'easy'

                },

                {

                    title: "옷감 확인 (Tactile)",

                    expertDesc: "거슬리는 촉각 자극을 미리 제거합니다.",

                    rationale: "까끌거리는 옷 택이나 꽉 끼는 바지는 지속적으로 뇌의 리소스를 잡아먹습니다. 가장 편안한 옷을 입으세요.",

                    managerGuide: "🗣️ 점검: \"옷 불편한 거 없어? 제일 편한 츄리닝 입고 해. 몸이 편해야 머리가 돈다.\"",

                    action: "부드럽고 헐렁한 옷 착용, 책상 모서리에 보호대 부착.",

                    difficulty: 'medium'

                },

                {

                    title: "정리 정돈 (Visual Noise)",

                    expertDesc: "시각적 잡음을 제거하여 뇌를 안정시킵니다.",

                    rationale: "책상이 지저분하면 과민한 뇌는 그 패턴을 분석하느라 피곤해집니다. 책상은 수술대처럼 깨끗해야 합니다.",

                    managerGuide: "🗣️ 정리: \"책상 위에 샤프심 하나도 없이 치워. 딱 책만 남겨.\"",

                    action: "모든 물건을 서랍에 넣고 '무균실' 상태 만들기.",

                    difficulty: 'hard'

                }

            ]

        },

        learning: {

            title: "🧠 Step 2. 몰입의 요새화 (Fortress)",

            intro: "외부 방해 없이 안전하게 몰입할 수 있는 환경과 루틴을 만드세요.",

            guides: [

                {

                    title: "1인실/구석 자리",

                    expertDesc: "등 뒤가 막힌 공간에서 심리적 안정감을 얻습니다.",

                    rationale: "본능적으로 등 뒤가 뚫려 있으면 뇌는 경계 태세를 갖춥니다. 벽을 등지거나 구석 자리를 확보하세요.",

                    managerGuide: "🗣️ 자리: \"독서실 구석 자리 잡아. 등 뒤가 든든해야 마음 놓고 공부하지.\"",

                    action: "가장 구석지거나 벽을 마주 보는 자리 선정.",

                    difficulty: 'easy'

                },

                {

                    title: "이해보다 암기 (Details)",

                    expertDesc: "예민한 디테일 감각을 암기에 활용합니다.",

                    rationale: "과민형 학생은 세부 사항을 잘 포착합니다. 전체 흐름보다는 디테일한 암기 과목에서 강점을 보일 수 있습니다.",

                    managerGuide: "🗣️ 강점: \"넌 남들이 못 보는 꼼꼼한 걸 잘 보잖아. 영어 단어나 디테일한 암기에 유리해.\"",

                    action: "섬세함이 필요한 과목(어학, 탐구 디테일) 위주 배치.",

                    difficulty: 'medium'

                },

                {

                    title: "자신만의 루틴 (Ritual)",

                    expertDesc: "예측 가능한 순서로 뇌를 안심시킵니다.",

                    rationale: "예측 불가능성은 스트레스입니다. 항상 같은 시간에, 같은 순서로, 같은 펜을 쓰는 루틴이 뇌를 편안하게 합니다.",

                    managerGuide: "🗣️ 습관: \"늘 하던 대로 해. 물 한 모금 마시고, 펜 잡고, 심호흡 하고. 루틴대로 하면 잘 될 거야.\"",

                    action: "공부 시작 전 3가지 고정 행동(물-안경-심호흡 등) 수행.",

                    difficulty: 'hard'

                },

                {

                    title: "혼자 공부하기",

                    expertDesc: "타인의 존재 자체가 주는 스트레스를 피합니다.",

                    rationale: "친구와 같이 있으면 상대방의 기분이나 행동을 신경 쓰느라 에너지가 샙니다. 철저히 혼자가 되세요.",

                    managerGuide: "🗣️ 조언: \"친구랑 같이 하지 마. 너 혼자 할 때가 제일 빨라.\"",

                    action: "스터디 그룹 비추천, 단독 학습 권장.",

                    difficulty: 'easy'

                }

            ]

        },

        exercise: {

            title: "🏃 Step 3. 내면 집중 (Inner Focus)",

            intro: "외부 자극을 차단하고 자신의 내면에 집중하는 운동이 좋습니다.",

            guides: [

                {

                    title: "요가/필라테스",

                    expertDesc: "자신의 호흡과 근육 움직임에 집중합니다.",

                    rationale: "경쟁적인 구기 종목은 예민한 사람에게 스트레스입니다. 내 몸의 감각에만 집중하는 운동이 신경계를 안정시킵니다.",

                    managerGuide: "🗣️ 추천: \"시끄러운 헬스장 말고, 조용한 방에서 요가 매트 펴고 스트레칭 하자.\"",

                    action: "집에서 조용히 요가나 스트레칭 수행.",

                    difficulty: 'medium'

                },

                {

                    title: "단독 러닝 (Running)",

                    expertDesc: "일정한 리듬으로 달리며 잡념을 없앱니다.",

                    rationale: "이어폰을 끼고 혼자 달리는 시간은 외부 자극으로부터 해방되는 시간입니다. 뇌가 비워집니다.",

                    managerGuide: "🗣️ 운동: \"이어폰 끼고 아무도 없는 길을 좀 뛰고 와. 바람 맞으면 시원할 거야.\"",

                    action: "밤이나 이른 아침, 사람 없는 시간에 조깅.",

                    difficulty: 'hard'

                },

                {

                    title: "폼롤러 마사지",

                    expertDesc: "긴장된 근막을 이완시켜 과민함을 낮춥니다.",

                    rationale: "예민한 사람은 근육이 항상 긴장되어 있습니다. 근막을 풀어주면 뇌의 경계 태세도 함께 풀립니다.",

                    managerGuide: "🗣️ 케어: \"몸이 딱딱하게 굳었네. 폼롤러로 문질러주면 잠도 잘 올 거야.\"",

                    action: "자기 전 10분 이상 꼼꼼하게 전신 이완.",

                    difficulty: 'easy'

                },

                {

                    title: "명상 (Meditation)",

                    expertDesc: "떠오르는 생각들을 판단 없이 흘려보냅니다.",

                    rationale: "명상은 자극에 대한 반응성을 낮추는 훈련입니다. 외부 소음이나 내부 잡념을 그냥 '지나가는 차'처럼 바라보세요.",

                    managerGuide: "🗣️ 멘탈: \"생각이 너무 많지? 그냥 구름처럼 흘러가게 둬. 잡으려고 하지 마.\"",

                    action: "하루 10분, 마음 챙김 명상 앱 활용.",

                    difficulty: 'medium'

                }

            ]

        }

    },
};
