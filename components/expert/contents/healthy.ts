// EXPERT_CONTENTS partial (moved verbatim; no content change)
import { CareType } from '../../../types';
import type { CareContent } from '../expertTypes';

export const PART_HEALTHY: Record<string, CareContent> = {
    [CareType.HEALTHY]: {

        prestudy: {

            title: "⚡ Step 1. 학습 전 전략 (Pre-Study)",

            intro: "건강한 학생일수록 루틴을 통해 '초몰입' 상태로 진입하는 시간을 단축해야 합니다.",

            guides: [

                {

                    title: "데스크 셋업 (Visual Clean)",

                    expertDesc: "시각적 노이즈를 제거하여 뇌의 인지 부하를 최소화하는 과정입니다.",

                    rationale: "책상 위 잡동사니나 쌓여있는 문제집은 무의식적으로 뇌의 처리 용량을 잡아먹습니다. '지금 공부할 책 1권'만 남기는 행위가 뇌를 학습 모드로 전환시킵니다.",

                    managerGuide: "🗣️ 질문: \"책상 위에 문제집 몇 권 쌓여있나요? 주인공 외에는 다 무대에서 내리세요.\"",

                    action: "공부 과목이 바뀔 때마다 책상을 완전히 비우고 새로 세팅하는 '리셋 타임'을 가지게 하십시오.",

                    difficulty: 'easy'

                },

                {

                    title: "4-7-8 호흡 (Brain Reset)",

                    expertDesc: "부교감 신경을 즉각적으로 활성화하여 산만해진 과각성 긴장을 안정된 몰입 상태로 전환합니다.",

                    rationale: "4초 흡입, 7초 멈춤, 8초 배출의 리듬은 강제적으로 심박수를 낮추고 신경계를 이완시켜, 공부 시작 전 불안감을 없애줍니다.",

                    managerGuide: "🗣️ 제안: \"시험 직전, 딱 1분만 눈 감고 이 호흡을 하면 머리가 맑아집니다.\"",

                    action: "공부 시작 전 3회 반복 실시.",

                    difficulty: 'easy'

                },

                {

                    title: "디지털 디톡스 (Dopamine Control)",

                    expertDesc: "스마트폰을 시야에서 차단하여 도파민 회로를 보호합니다.",

                    rationale: "스마트폰이 책상 위에 있다는 사실만으로도 인지 능력의 일부가 '알림 감지'에 할당되어 성능이 저하됩니다(Brain Drain Effect).",

                    managerGuide: "🗣️ 강조: \"의지력이 아니라 환경으로 이기세요. 폰은 거실에 두는 겁니다.\"",

                    action: "스마트폰을 '다른 방'에 격리하거나 잠금 파우치 사용 권장.",

                    difficulty: 'hard'

                },

                {

                    title: "마이크로 목표 설정 (Micro-Goal)",

                    expertDesc: "추상적인 목표를 구체적인 숫자로 치환하여 뇌를 움직이게 합니다.",

                    rationale: "뇌는 '열심히 하기'라는 명령어를 인식하지 못합니다. '30분간 5문제 풀기'처럼 마감과 분량이 명확할 때 도파민이 분비됩니다.",

                    managerGuide: "🗣️ 질문: \"오늘 목표가 뭐야? '수학 공부' 말고 '수1 20페이지까지 풉니다'라고 말해봐.\"",

                    action: "포스트잇에 종료 시간과 구체적 분량을 적어 눈앞에 부착.",

                    difficulty: 'medium'

                }

            ]

        },

        learning: {

            title: "🧠 Step 2. 학습 전략 (Learning)",

            intro: "최상의 컨디션에서는 'Deep Work' 강도를 높여야 합니다.",

            guides: [

                {

                    title: "포모도로 2.0 (50+10)",

                    expertDesc: "전두엽의 집중력 배터리 한계를 고려한 시간 관리입니다.",

                    rationale: "뇌의 신경전달물질은 무한하지 않습니다. 50분 집중 후 10분은 반드시 쉬어야 하며, 이때 스마트폰을 보면 뇌가 시각 정보를 처리하느라 쉬지 못합니다.",

                    managerGuide: "🗣️ 질문: \"쉬는 시간에 폰 보나요? 그건 뇌를 혹사시키는 겁니다.\"",

                    action: "10분 휴식 시 '멍때리기' 또는 '스트레칭'만 허용.",

                    difficulty: 'easy'

                },

                {

                    title: "백지 복습 (Active Recall)",

                    expertDesc: "메타인지(Meta-cognition)를 극대화하는 인출 학습법입니다.",

                    rationale: "강의를 '보는' 것은 수동적 입력일 뿐입니다. 책을 덮고 빈 종이에 인출해낼 때라야 비로소 단기 기억이 장기 기억으로 전환됩니다.",

                    managerGuide: "🗣️ 제안: \"오늘 배운 내용을 안 보고 엄마한테 설명할 수 있어요? 그게 진짜 앎입니다.\"",

                    action: "학습 직후 A4 용지에 핵심 키워드를 중심으로 마인드맵 그리기.",

                    difficulty: 'medium'

                },

                {

                    title: "The Big 3 우선순위 (Prioritization)",

                    expertDesc: "의사결정 피로(Decision Fatigue)를 줄이고 성취감을 높입니다.",

                    rationale: "가장 어렵고 하기 싫은 과제('개구리')를 뇌 에너지가 가장 충만한 아침에 처리해야 합니다.",

                    managerGuide: "🗣️ 조언: \"수학 킬러 문제부터 아침에 해치우세요. 오후엔 가벼운 마음으로 암기 과목을 하면 됩니다.\"",

                    action: "전날 밤, 내일 반드시 끝낼 가장 중요한 3가지를 미리 적어두기.",

                    difficulty: 'hard'

                },

                {

                    title: "간격 반복 (Spaced Repetition)",

                    expertDesc: "망각 곡선을 역이용하여 장기 기억 저장 효율을 높입니다.",

                    rationale: "뇌는 정보를 처음 입력했을 때보다, 잊어버릴 즈음 다시 꺼낼 때(인출) 가장 강력하게 기억 회로를 강화합니다. 1일-3일-7일 주기의 복습이 기억의 유통기한을 영구적으로 만듭니다.",

                    managerGuide: "🗣️ 체크: \"오늘 배운 거 3일 뒤에 다시 볼 계획 있어? 복습 스케줄이 없으면 공부 안 한 거나 마찬가지야.\"",

                    action: "플래너에 '복습 주기(1, 3, 7일)' 미리 표시하기.",

                    difficulty: 'easy'

                }

            ]

        },

        exercise: {

            title: "🏃 Step 3. 운동 전략 (Body)",

            intro: "신체 활력을 학습 에너지로 전환하는 루틴입니다.",

            guides: [

                {

                    title: "아침 공복 산책 (Morning Walk)",

                    expertDesc: "세로토닌 활성화 및 생체 시계 동기화.",

                    rationale: "기상 직후 햇볕을 보며 걷는 것은 뇌를 깨우는 가장 강력한 신호입니다. 밤에 멜라토닌 분비를 촉진하여 수면 질까지 개선합니다.",

                    managerGuide: "🗣️ 제안: \"아침에 눈 뜨면 바로 20분만 걸으세요. 하루 집중력이 달라집니다.\"",

                    action: "매일 아침 20분, 팔을 가볍게 흔들며 걷기.",

                    difficulty: 'medium'

                },

                {

                    title: "NEAT 운동 (Brain Pumping)",

                    expertDesc: "비운동성 활동 열 생성(NEAT)을 통한 뇌 혈류 공급.",

                    rationale: "오래 앉아 있으면 뇌 산소 공급이 줄어듭니다. 1시간마다 일어나서 움직여야 해마의 신경 생성이 촉진됩니다.",

                    managerGuide: "🗣️ 질문: \"한 번 앉으면 몇 시간 동안 안 일어나나요? 바보가 되는 지름길입니다.\"",

                    action: "쉬는 시간마다 스쿼트 15회 또는 제자리 걸음.",

                    difficulty: 'hard'

                },

                {

                    title: "취침 전 스트레칭 (Relaxation)",

                    expertDesc: "근육 이완을 통한 부교감 신경 활성화.",

                    rationale: "하루 종일 긴장된 승모근과 장요근을 풀어주면 뇌가 '휴식 모드'로 인지하여 깊은 잠에 들 수 있게 합니다.",

                    managerGuide: "🗣️ 조언: \"자기 전 10분, 폼롤러가 수면제보다 낫습니다.\"",

                    action: "취침 30분 전, 조명을 낮추고 정적인 스트레칭 실시.",

                    difficulty: 'easy'

                },

                {

                    title: "고강도 인터벌 (HIIT)",

                    expertDesc: "단시간에 심박수를 최대로 올려 BDNF(뇌 유래 신경영양인자)를 폭발시킵니다.",

                    rationale: "숨이 찰 정도의 고강도 운동은 해마의 신경 세포 생성을 촉진하여 기억력을 직접적으로 향상시키는 유일한 생물학적 방법입니다.",

                    managerGuide: "🗣️ 제안: \"일주일에 두 번은 심장이 터질 것처럼 뛰어봐. 그게 뇌를 업그레이드하는 시간이야.\"",

                    action: "주 2회, 20분간 고강도 인터벌 러닝/사이클.",

                    difficulty: 'medium'

                }

            ]

        }

    },
};
