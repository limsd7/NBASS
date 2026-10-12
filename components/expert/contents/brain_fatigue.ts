// EXPERT_CONTENTS partial (moved verbatim; no content change)
import { CareType } from '../../../types';
import type { CareContent } from '../expertTypes';

export const PART_BRAIN_FATIGUE: Record<string, CareContent> = {
    [CareType.BRAIN_FATIGUE]: {

        prestudy: {

            title: "⚡ Step 1. 인지 부하 덜기 (Offloading)",

            intro: "\"뇌가 과부하로 파업 중입니다.\" 입력값은 줄이고 휴식값은 높여야 합니다.",

            guides: [

                {

                    title: "멍때리기 (DMN)",

                    expertDesc: "아무 정보도 입력하지 않는 뇌의 완전한 휴식입니다.",

                    rationale: "뇌는 아무것도 안 할 때 '디폴트 모드 네트워크(DMN)'가 켜지며 정보를 정리합니다. 스마트폰을 보지 않고 멍하니 있는 시간이 진짜 뇌 휴식입니다.",

                    managerGuide: "🗣️ 휴식: \"폰 내려놔. 눈 감고 아무 생각도 하지 마. 뇌도 숨 쉴 시간이 필요해.\"",

                    action: "학습 전 5분간 창밖 보며 멍때리기.",

                    difficulty: 'hard'

                },

                {

                    title: "단일 과제 수행 (Single Tasking)",

                    expertDesc: "멀티태스킹을 차단하여 정보 처리 비용을 아낍니다.",

                    rationale: "음악 들으며 공부하기, 친구와 톡 하며 숙제하기는 피로한 뇌에 치명타입니다. 한 번에 하나만 처리해야 뇌가 버팁니다.",

                    managerGuide: "🗣️ 규칙: \"음악 꺼. 폰도 꺼. 오직 책만 봐. 한 번에 하나만 하자.\"",

                    action: "멀티태스킹 절대 금지, 한 번에 한 과목만.",

                    difficulty: 'easy'

                },

                {

                    title: "당분 공급 (Glucose)",

                    expertDesc: "뇌의 유일한 에너지원인 포도당을 공급합니다.",

                    rationale: "뇌 피로는 실제 연료 부족일 수 있습니다. (적당량의) 사탕이나 포도당 캔디는 즉각적인 뇌 연료가 됩니다.",

                    managerGuide: "🗣️ 간식: \"머리 안 돌아가지? 포도당 캔디 하나 먹고 해.\"",

                    action: "학습 시작 전 포도당 캔디 1~2알 섭취.",

                    difficulty: 'medium'

                },

                {

                    title: "수분 충전 (Hydration)",

                    expertDesc: "뇌의 탈수를 막아 인지 속도를 유지합니다.",

                    rationale: "뇌의 75%는 물입니다. 2%만 부족해도 집중력과 기억력이 급감합니다. 물은 가장 싼 뇌 영양제입니다.",

                    managerGuide: "🗣️ 권유: \"물 한 잔 마셨어? 뇌가 말라 비틀어지면 생각이 안 나.\"",

                    action: "텀블러에 물 채워두고 수시로 마시기.",

                    difficulty: 'hard'

                }

            ]

        },

        learning: {

            title: "🧠 Step 2. 효율적 입력 (Efficient Input)",

            intro: "뇌 용량이 부족하므로, 고화질 동영상 대신 가벼운 텍스트 위주로 정보를 처리하세요.",

            guides: [

                {

                    title: "읽기 모드 (Reading)",

                    expertDesc: "수동적 시청보다 능동적 읽기가 뇌 피로를 덜 유발할 수 있습니다.",

                    rationale: "인강은 시각/청각을 동시에 처리해야 하므로 부하가 큽니다. 피로할 땐 차라리 줄글을 자신의 속도대로 읽는 것이 뇌에 여유를 줍니다.",

                    managerGuide: "🗣️ 전환: \"인강 소리가 시끄럽게 느껴지면 그냥 자습서 읽어. 네 속도대로 읽는 게 나아.\"",

                    action: "인강 비중 줄이고 텍스트 읽기 위주 학습.",

                    difficulty: 'easy'

                },

                {

                    title: "요약본 활용",

                    expertDesc: "정보의 압축본을 활용하여 처리 과정을 줄입니다.",

                    rationale: "처음부터 정리하려 하지 말고 남이 정리해 둔 요약본을 먼저 보고, 살을 붙이는 방식이 에너지를 아낍니다.",

                    managerGuide: "🗣️ 팁: \"교과서 정독 힘들지? 요약 노트부터 먼저 훑어보고 살을 붙이자.\"",

                    action: "요약집이나 마인드맵을 먼저 보고 세부 내용 학습.",

                    difficulty: 'medium'

                },

                {

                    title: "20분 법칙",

                    expertDesc: "짧은 집중 후 긴 휴식으로 뇌를 보호합니다.",

                    rationale: "피로한 뇌의 집중력 유지 시간은 짧습니다. 20분만 집중하고 10분 쉬는 방식으로 짧게 끊어 가야 합니다.",

                    managerGuide: "🗣️ 스케줄: \"욕심내지 마. 20분만 하고 10분 쉬어. 가늘고 길게 가자.\"",

                    action: "20분 학습 / 10분 눈 감고 휴식.",

                    difficulty: 'hard'

                },

                {

                    title: "수면 학습 (Sleep Learning)",

                    expertDesc: "자기 전 암기하고 잠의 뇌과학을 이용합니다.",

                    rationale: "무리해서 외우지 말고, 자기 전 한 번 읽고 자면 뇌가 잘 때 정리해 줍니다. 뇌의 자동 저장 기능을 믿으세요.",

                    managerGuide: "🗣️ 전략: \"안 외워지면 그냥 읽고 자. 자는 동안 뇌가 알아서 정리해 줄 거야.\"",

                    action: "자기 전 암기 과목 1번 읽고 바로 취침.",

                    difficulty: 'easy'

                }

            ]

        },

        exercise: {

            title: "🏃 Step 3. 회복과 충전 (Restoration)",

            intro: "운동보다는 휴식에 가까운 이완 동작이 필요합니다.",

            guides: [

                {

                    title: "NSDR (Non-Sleep Deep Rest)",

                    expertDesc: "깨어 있지만 깊은 휴식을 취하는 요가 니드라 기법입니다.",

                    rationale: "20분의 NSDR은 4시간의 수면 효과와 맞먹습니다. 유튜브 가이드를 들으며 두뇌를 깊은 수면 이완 상태로 낮추세요.",

                    managerGuide: "🗣️ 추천: \"잠깐 누워서 이거 들어봐. 잠든 건 아닌데 머리가 엄청 개운해질 거야.\"",

                    action: "유튜브에서 '요가 니드라' 또는 'NSDR' 검색하여 따라 하기.",

                    difficulty: 'medium'

                },

                {

                    title: "눈 찜질 (Eye Care)",

                    expertDesc: "시신경의 피로를 풀어 뇌의 입력을 차단합니다.",

                    rationale: "뇌 정보의 80%는 눈으로 들어옵니다. 눈을 따뜻하게 하고 가려주는 것만으로도 뇌는 '퇴근'했다고 느낍니다.",

                    managerGuide: "🗣️ 케어: \"눈이 뻑뻑하면 머리도 안 돌아가. 따뜻한 수건으로 눈 좀 덮고 있어.\"",

                    action: "온열 안대나 따뜻한 수건으로 10분간 눈 찜질.",

                    difficulty: 'hard'

                },

                {

                    title: "맨발 걷기 (Earthing)",

                    expertDesc: "발바닥 자극을 통해 머리의 열을 내립니다.",

                    rationale: "맨발로 흙을 밟으면 활성산소가 제거되고 정서적 안정을 얻습니다. 두한족열(머리는 차게, 발은 뜨겁게)의 원리입니다.",

                    managerGuide: "🗣️ 산책: \"신발 벗고 흙 좀 밟아봐. 시원한 느낌이 머리까지 전해질 거야.\"",

                    action: "안전한 공원이나 운동장에서 맨발 걷기.",

                    difficulty: 'easy'

                },

                {

                    title: "낮잠 (Power Nap)",

                    expertDesc: "짧은 낮잠으로 뇌의 캐시 메모리를 삭제합니다.",

                    rationale: "20분 이내의 낮잠은 뇌에 쌓인 아데노신을 제거하여 오후의 집중력을 리셋합니다. (30분 넘기지 말 것)",

                    managerGuide: "🗣️ 허용: \"너무 졸리면 딱 15만 자. 알람 맞춰줄게. 그게 훨씬 효율적이야.\"",

                    action: "커피 한 잔 마시고(냅라떼) 20분 낮잠.",

                    difficulty: 'medium'

                }

            ]

        }

    },
};
