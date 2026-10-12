// EXPERT_CONTENTS partial (moved verbatim; no content change)
import { CareType } from '../../../types';
import type { CareContent } from '../expertTypes';

export const PART_ADRENAL: Record<string, CareContent> = {
    [CareType.ADRENAL]: {

        prestudy: {

            title: "⚡ Step 1. 에너지 누수 차단 (Pre-Study)",

            intro: "\"부신이 지친 학생에게 '의지력'을 강요하는 것은 폭력입니다.\" 에너지를 쥐어짜지 않고 흐름을 타는 것이 핵심입니다.",

            guides: [

                {

                    title: "데스크 셋업 (Visual Clean)",

                    expertDesc: "시각적 자극을 최소화하여 뇌의 에너지 소모를 줄입니다.",

                    rationale: "부신 피로 상태에서는 작은 자극도 큰 스트레스로 다가옵니다. 시야에 '지금 할 것'만 남겨두는 것이 가장 강력한 에너지 보존법입니다.",

                    managerGuide: "🗣️ 코칭: \"책상 위에 이것저것 두지 마세요. 시야가 깨끗해야 뇌가 안 지칩니다.\"",

                    action: "책상 위 잡동사니 제거, 공부할 책 한 권만 배치.",

                    difficulty: 'easy'

                },

                {

                    title: "골든 타임 사수 (Sleep Hygiene)",

                    expertDesc: "부신 회복의 핵심인 밤 11시 취침을 목표로 합니다.",

                    rationale: "밤 11시가 넘으면 '세컨드 윈드' 현상으로 인해 오히려 각성되어 잠들기 어려워지고 부신은 더 고갈됩니다.",

                    managerGuide: "🗣️ 강력 권고: \"밤 11시 넘어서 공부하지 마세요. 그건 공부가 아니라 몸을 깎아먹는 겁니다.\"",

                    action: "밤 10시 30분 취침 준비, 11시 소등 및 수면.",

                    difficulty: 'medium'

                },

                {

                    title: "전자기기 차단 (Digital Detox)",

                    expertDesc: "취침 전 블루라이트 차단으로 코르티솔 분비를 억제합니다.",

                    rationale: "블루라이트는 뇌를 낮으로 착각하게 만들어 코르티솔 수치를 높입니다. 이는 부신을 쉬지 못하게 만듭니다.",

                    managerGuide: "🗣️ 약속: \"자기 전 1시간은 폰 금지입니다. 정 심심하면 종이책을 보세요.\"",

                    action: "취침 1시간 전 스마트폰 사용 금지 및 격리.",

                    difficulty: 'hard'

                },

                {

                    title: "D-Day 확언 (Positivity)",

                    expertDesc: "긍정적인 확언으로 심리적 스트레스를 낮춥니다.",

                    rationale: "부신 피로는 심리적 압박감에서 오는 경우가 많습니다. '나는 매일 조금씩 나아지고 있다'는 확언이 코르티솔 수치를 낮춥니다.",

                    managerGuide: "🗣️ 응원: \"너는 충분히 잘하고 있어. 오늘 하루도 고생했다고 스스로에게 말해주자.\"",

                    action: "학습 시작 전 긍정 확언 3회 낭독.",

                    difficulty: 'easy'

                }

            ]

        },

        learning: {

            title: "🧠 Step 2. 부신 친화적 영양 & 학습 (Nutrition)",

            intro: "\"잘 먹는 것이 곧 공부입니다.\" 혈당 롤러코스터를 막아야 부신을 지킬 수 있습니다.",

            guides: [

                {

                    title: "혈당 롤러코스터 방지",

                    expertDesc: "정제 탄수화물을 제한하여 급격한 혈당 변동을 막습니다.",

                    rationale: "혈당이 널뛰면 부신은 이를 조절하기 위해 계속 일해야 합니다. 아침에 단백질 위주 식사는 하루 에너지를 안정적으로 만듭니다.",

                    managerGuide: "🗣️ 식단: \"아침에 시리얼 말고 계란 드세요. 설탕은 부신의 적입니다.\"",

                    action: "기상 후 1시간 내 단백질(계란, 두부 등) 포함 아침 식사.",

                    difficulty: 'medium'

                },

                {

                    title: "카페인 컷오프 (No Caffeine)",

                    expertDesc: "부신을 채찍질하는 카페인 섭취를 엄격히 제한합니다.",

                    rationale: "커피는 고갈된 부신을 억지로 짜내는 채찍과 같습니다. 카페인 없이 견과류 등으로 에너지를 보충하세요.",

                    managerGuide: "🗣️ 경고: \"커피 마시면 당장은 깨는 것 같죠? 내일 쓸 에너지를 가불하는 겁니다.\"",

                    action: "오전 10시 이후 카페인 금지, 힘들면 오전 1잔만 허용.",

                    difficulty: 'hard'

                },

                {

                    title: "소금물/비타민C (Mineral Load)",

                    expertDesc: "고갈된 미네랄을 보충하여 부신 기능을 돕습니다.",

                    rationale: "부신 기능 저하 시 나트륨 손실이 큽니다. 질 좋은 소금과 비타민 C는 부신 회복의 필수 연료입니다.",

                    managerGuide: "🗣️ 팁: \"물 마실 때 소금 한 꼬집, 그리고 비타민 C 꼭 챙겨 드세요.\"",

                    action: "물 500ml에 죽염/천일염 약간 타서 섭취, 비타민 C 충분히 섭취.",

                    difficulty: 'easy'

                },

                {

                    title: "20분 컷 학습법 (Short Term)",

                    expertDesc: "짧게 끊어치는 학습으로 인지 피로를 최소화합니다.",

                    rationale: "긴 호흡의 학습은 부신 피로 환자에게 독입니다. 20분 학습 후 5분 휴식으로 뇌와 신체를 자주 리셋해야 합니다.",

                    managerGuide: "🗣️ 전략: \"길게 하려고 하지 마. 딱 20분만 하고 무조건 쉬어. 그게 더 빨라.\"",

                    action: "20분 집중 / 5분 완전 휴식 루틴 적용.",

                    difficulty: 'medium'

                }

            ]

        },

        exercise: {

            title: "🏃 Step 3. 에너지 보존 운동 (Rest & Restore)",

            intro: "\"열심히 운동하지 마세요.\" 지금은 에너지를 쓸 때가 아니라 채울 때입니다.",

            guides: [

                {

                    title: "고강도 운동 NO",

                    expertDesc: "과도한 운동은 코르티솔을 높여 부신을 더욱 고갈시킵니다.",

                    rationale: "숨이 턱까지 차는 운동은 현재 상태에서 회복을 방해합니다. 산책이나 요가 같은 이완 운동이 적합합니다.",

                    managerGuide: "🗣️ 조언: \"헬스장 가서 무리하지 마세요. 지금은 올림픽 나가는 게 아닙니다.\"",

                    action: "격렬한 달리기, 웨이트 대신 가벼운 걷기 권장.",

                    difficulty: 'hard'

                },

                {

                    title: "햇볕 쬐기 (Morning Light)",

                    expertDesc: "기상 후 햇볕으로 생체 리듬을 정상화합니다.",

                    rationale: "아침 햇볕은 생체 시계를 리셋하여 밤의 숙면을 유도하고, 세로토닌을 생성합니다.",

                    managerGuide: "🗣️ 루틴: \"눈 뜨면 바로 커튼 치고 베란다라도 나가세요. 햇빛이 약입니다.\"",

                    action: "기상 후 30분 이내 햇빛 샤워 (최소 10분).",

                    difficulty: 'easy'

                },

                {

                    title: "거절의 기술 (Say NO)",

                    expertDesc: "심리적 에너지 누수를 막기 위해 불필요한 일정을 거절합니다.",

                    rationale: "책임감 과잉은 부신의 적입니다. 자신의 한계를 인정하고 에너지를 비축하는 시기입니다.",

                    managerGuide: "🗣️ 멘탈: \"친구 부탁, 무리한 약속 다 거절하세요. 지금은 너만 생각해.\"",

                    action: "학습 외 불필요한 약속 및 부탁 정중히 거절하기.",

                    difficulty: 'medium'

                },

                {

                    title: "마그네슘 이완 (Relaxation)",

                    expertDesc: "천연 진정제로 불리는 마그네슘으로 근육과 신경을 이완합니다.",

                    rationale: "마그네슘은 긴장된 신경을 풀어주고 숙면을 돕습니다. 폼롤러 마사지와 병행하면 효과가 배가됩니다.",

                    managerGuide: "🗣️ 추천: \"자기 전에 마그네슘 먹고 스트레칭 좀 하다 자. 꿀잠 잘 거야.\"",

                    action: "저녁 식후 마그네슘 섭취 및 가벼운 스트레칭.",

                    difficulty: 'hard'

                }

            ]

        }

    },
};
