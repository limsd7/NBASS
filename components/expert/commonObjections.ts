// Moved verbatim from ExpertOverlay.tsx (no content change)
import { CareType } from '../../types';
import type { CommonObjection } from './expertTypes';

export const COMMON_OBJECTIONS: Record<string, CommonObjection[]> = {

    [CareType.HEALTHY]: [

        {

            category: '시간',

            icon: '⏰',

            objection: '"시간이 없어요"',

            response: '딱 3분이면 됩니다. 양치하는 시간에 호흡법 할 수 있어요. 시간이 없는 게 아니라 우선순위의 문제예요.',

            tip: '가장 작은 단위부터 시작하게 하세요.'

        },

        {

            category: '의지',

            icon: '😓',

            objection: '"의지력이 약해서요"',

            response: '의지력이 아니라 환경 설계의 문제입니다. 폰을 다른 방에 두면 의지력 없이도 집중할 수 있어요.',

            tip: '환경 변화로 해결할 수 있는 대안을 제시하세요.'

        },

        {

            category: '효과',

            icon: '🤔',

            objection: '"이거 해도 소용없을 것 같아요"',

            response: '일주일만 해보고 판단해요. 과학적으로 증명된 방법이에요. 안 되면 다른 방법 찾으면 되고요.',

            tip: '작은 실험 개념으로 접근하게 하세요.'

        },

        {

            category: '환경',

            icon: '🏠',

            objection: '"집이 시끄러워서요"',

            response: '노이즈 캔슬링 이어폰이나 도서관 활용해 봐요. 완벽한 환경을 기다리면 평생 못 해요.',

            tip: '환경을 바꿀 수 없다면 대안을 찾게 하세요.'

        },

        {

            category: '비교',

            icon: '👥',

            objection: '"친구들은 안 해도 잘하던데요"',

            response: '남들과 비교하지 마세요. 중요한 건 어제의 나보다 오늘의 내가 나아지는 거예요.',

            tip: '자기 성장에 집중하도록 유도하세요.'

        }

    ],

    [CareType.SLEEP]: [

        {

            category: '시간',

            icon: '⏰',

            objection: '"밤에 공부해야 해서요"',

            response: '밤샘 공부는 뇌 효율이 50% 이하예요. 같은 시간을 자고 아침에 하면 2배 효율이에요.',

            tip: '수면의 학습 효율 연구 결과를 공유하세요.'

        },

        {

            category: '습관',

            icon: '😴',

            objection: '"원래 올빼미형이에요"',

            response: '올빼미형은 대부분 만들어진 거예요. 3주만 일찍 자면 뇌가 적응합니다.',

            tip: '점진적으로 15분씩 앞당기게 하세요.'

        },

        {

            category: '핑계',

            icon: '📱',

            objection: '"폰 보다가 잠드는 게 편해요"',

            response: '블루라이트가 뇌를 깨워서 수면 질이 떨어져요. 책 읽기로 바꿔 보세요.',

            tip: '대체 활동을 구체적으로 제안하세요.'

        },

        {

            category: '효과',

            icon: '🤷',

            objection: '"어차피 잠이 안 와요"',

            response: '4-7-8 호흡법 3번이면 됩니다. 뇌과학적으로 부교감신경이 활성화돼요.',

            tip: '호흡법을 직접 시연해 보세요.'

        },

        {

            category: '저항',

            icon: '🙄',

            objection: '"주말에 몰아서 자면 되잖아요"',

            response: '수면 빚은 이자가 붙어요. 주말에 몰아서 자면 월요일 더 힘들어져요.',

            tip: '수면 빚 개념을 설명하세요.'

        }

    ],

    [CareType.BURNOUT]: [

        {

            category: '책임감',

            icon: '📚',

            objection: '"쉬면 뒤처져요"',

            response: '지금 쉬지 않으면 나중에 더 오래 쉬어야 해요. 전략적 휴식이에요.',

            tip: '휴식의 투자 수익률 개념을 설명하세요.'

        },

        {

            category: '죄책감',

            icon: '😣',

            objection: '"쉬면 죄책감 들어요"',

            response: '휴식도 실력이에요. 프로 운동선수도 쉬는 날이 있어요.',

            tip: '휴식을 훈련의 일부로 재정의하세요.'

        },

        {

            category: '부모',

            icon: '👨‍👩‍👧',

            objection: '"부모님이 공부 안 한다고 뭐라 하세요"',

            response: '부모님께는 제가 상태를 말씀드릴게요. 대신 약속한 시간만큼은 확실히 쉬고, 공부할 때 몰입합시다.',

            tip: '학원/관리자 중재 역할을 강조하세요.'

        },

        {

            category: '무기력',

            icon: '😶',

            objection: '"하고 싶은 게 아무것도 없어요"',

            response: '번아웃 상태에서는 당연한 반응이에요. 1%만 회복돼도 의욕이 생겨요. 아주 작은 것부터 합시다.',

            tip: '무기력을 상태 탓으로 돌려 죄책감을 줄여주세요.'

        },

        {

            category: '회피',

            icon: '🏃',

            objection: '"그냥 다 그만두고 싶어요"',

            response: '일단 3일만 쉬어보고 결정해요. 중대한 결정은 상태가 좋을 때 하는 거예요.',

            tip: '결정을 유보하게 하고 단기 휴식을 제안하세요.'

        },

        {

            category: '시험',

            icon: '📝',

            objection: '"시험이 코앞이에요"',

            response: '번아웃 상태로 시험 보는 것보다 하루 쉬고 보는 게 점수가 높아요.',

            tip: '시험 직전 휴식의 효과를 설명하세요.'

        },

        {

            category: '비교',

            icon: '🏆',

            objection: '"다들 힘들어도 해요"',

            response: '남들도 힘들다고 내가 쓰러져야 하는 건 아니에요. 내 몸은 내가 챙겨야 해요.',

            tip: '자기 돌봄의 중요성을 강조하세요.'

        }

    ],

    [CareType.ANXIETY_TENSION]: [

        {

            category: '효과',

            icon: '🧘',

            objection: '"호흡법으로 뭐가 달라져요?"',

            response: '호흡은 직접 신경계를 조절할 수 있는 유일한 방법이에요. 과학적으로 입증됐어요.',

            tip: '즉석에서 호흡법을 함께 해보세요.'

        },

        {

            category: '성격',

            icon: '😰',

            objection: '"원래 걱정이 많은 성격이에요"',

            response: '불안은 성격이 아니라 기술이에요. 배울 수 있어요. 같이 연습해 봐요.',

            tip: '불안을 관리 가능한 것으로 재정의하세요.'

        },

        {

            category: '통제',

            icon: '🌀',

            objection: '"생각을 멈출 수가 없어요"',

            response: '멈추려 하지 말고 관찰해 보세요. 생각은 구름처럼 지나가게 두면 돼요.',

            tip: '마음챙김 관점을 소개하세요.'

        },

        {

            category: '회피',

            icon: '🏃',

            objection: '"불안한 상황을 피하면 되잖아요"',

            response: '피하면 할수록 더 무서워져요. 조금씩 노출하면 뇌가 익숙해져요.',

            tip: '노출 치료의 원리를 설명하세요.'

        },

        {

            category: '시험',

            icon: '📋',

            objection: '"시험만 보면 머리가 하얘져요"',

            response: '시험 전 5분 그라운딩으로 뇌를 안정시켜요. 연습하면 자동화돼요.',

            tip: '시험 당일 루틴을 만들어 주세요.'

        }

    ],

    [CareType.STRESS_OVERLOAD]: [

        {

            category: '시간',

            icon: '⏰',

            objection: '"운동할 시간이 없어요"',

            response: '7분이면 충분해요. 유튜브에 7분 운동 검색하면 돼요.',

            tip: '초단시간 운동 루틴을 안내하세요.'

        },

        {

            category: '발산',

            icon: '😤',

            objection: '"스트레스 받으면 게임해야 풀려요"',

            response: '게임은 뇌를 더 흥분시켜요. 10분 걷기가 실제 스트레스 호르몬을 낮춰요.',

            tip: '건강한 스트레스 발산법을 제안하세요.'

        },

        {

            category: '무력감',

            icon: '😔',

            objection: '"뭘 해도 스트레스가 줄지 않아요"',

            response: '원인을 찾아서 하나씩 해결해 봐요. 안 되는 건 내려놓는 연습도 필요해요.',

            tip: '통제 가능/불가능을 구분하게 하세요.'

        },

        {

            category: '감정',

            icon: '😠',

            objection: '"화가 나면 참을 수가 없어요"',

            response: '화가 날 때 10초 세기를 해보세요. 뇌가 판단력을 되찾아요.',

            tip: '분노 관리 기법을 연습시키세요.'

        }

    ],

    [CareType.LOW_ENERGY]: [

        {

            category: '증상',

            icon: '🥱',

            objection: '"피곤한 게 당연한 거 아니에요?"',

            response: '아니요, 청소년은 에너지가 넘쳐야 정상이에요. 뭔가 원인이 있어요.',

            tip: '신체적 원인 점검을 권유하세요.'

        },

        {

            category: '수면',

            icon: '😴',

            objection: '"많이 자도 피곤해요"',

            response: '수면의 질이 문제일 수 있어요. 수면 일기 한 번 써볼래요?',

            tip: '수면 패턴 분석을 시작하세요.'

        },

        {

            category: '노력',

            icon: '😒',

            objection: '"움직이기 싫어요"',

            response: '5분만 걸어보세요. 움직이면 오히려 에너지가 생겨요.',

            tip: '역설적 효과를 설명하세요.'

        },

        {

            category: '식사',

            icon: '🍽️',

            objection: '"아침 먹을 시간 없어요"',

            response: '바나나 하나면 2분이에요. 뇌 연료 없이는 공부가 안 돼요.',

            tip: '간편한 아침 옵션을 제안하세요.'

        }

    ],

    [CareType.DEPRESSION_AMOTIVATION]: [

        {

            category: '무기력',

            icon: '😶',

            objection: '"아무것도 하기 싫어요"',

            response: '하기 싫어도 딱 1분만 해보세요. 시작하면 뇌가 움직이기 시작해요.',

            tip: '아주 작은 행동부터 시작하게 하세요.'

        },

        {

            category: '의미',

            icon: '❓',

            objection: '"해봤자 뭐해요"',

            response: '지금 힘든 건 뇌의 일시적 상태예요. 작은 성공 경험이 쌓이면 달라져요.',

            tip: '희망적 메시지를 전달하세요.'

        },

        {

            category: '사회',

            icon: '🚪',

            objection: '"사람 만나기 싫어요"',

            response: '5분만 밖에 나갔다 와보세요. 햇볕이 세로토닌을 만들어요.',

            tip: '사회적 접촉의 최소 단위를 제안하세요.'

        },

        {

            category: '수면',

            icon: '🛌',

            objection: '"계속 자고 싶어요"',

            response: '많이 자도 피로가 안 풀리죠? 가벼운 활동이 오히려 에너지를 줘요.',

            tip: '과수면의 역효과를 설명하세요.'

        },

        {

            category: '도움',

            icon: '🤝',

            objection: '"상담 받아도 달라지지 않아요"',

            response: '혼자 이겨내려 하지 마세요. 전문가의 도움은 지름길이에요.',

            tip: '전문 상담 연계를 고려하세요.'

        }

    ],

    [CareType.ADRENAL]: [

        {

            category: '피로',

            icon: '😫',

            objection: '"아침에 일어나는 게 죽을 것 같아요"',

            response: '부신 호르몬(코르티솔)이 아침에 안 나와서 그래요. 소금물 한 잔 마시면 한결 나아요.',

            tip: '생물학적 원인을 설명하고 즉각적인 팁을 주세요.'

        },

        {

            category: '카페인',

            icon: '☕',

            objection: '"커피 없으면 눈이 안 떠져요"',

            response: '커피는 미래의 에너지를 빌려 쓰는 거예요. 지금 끊어야 부신이 회복돼요.',

            tip: '카페인의 악순환을 경고하세요.'

        },

        {

            category: '식단',

            icon: '🍭',

            objection: '"단 게 자꾸 당겨요"',

            response: '혈당이 떨어져서 그래요. 사탕 대신 견과류나 단백질 바를 드세요.',

            tip: '혈당 스파이크의 위험을 인지시키세요.'

        },

        {

            category: '수면',

            icon: '🦉',

            objection: '"밤 11시 이후에 오히려 정신이 나요"',

            response: '부신피로 2단계의 특징이에요. 그때 자야 뇌와 부신이 재생돼요.',

            tip: '세컨드 윈드(Second Wind) 현상을 설명해 주세요.'

        },

        {

            category: '휴식',

            icon: '😴',

            objection: '"쉬면 불안해요"',

            response: '그 불안감이 바로 부신 피로 증상이에요. 쉬어야 회복돼요. 휴식도 영양소입니다.',

            tip: '증상 자체가 회복 필요성의 증거임을 설명하세요.'

        }

    ],

    [CareType.BRAIN_FATIGUE]: [

        {

            category: '휴식',

            icon: '📱',

            objection: '"쉬는 시간에 폰 봐야 해요"',

            response: '폰 보는 건 뇌가 쉬는 게 아니에요. 10분 멍 때리기가 진짜 휴식이에요.',

            tip: '뇌 휴식의 정의를 설명하세요.'

        },

        {

            category: '시간',

            icon: '⏰',

            objection: '"50분은 너무 짧아요"',

            response: '50분이 뇌의 집중력 한계예요. 그 이상은 효율이 급격히 떨어져요.',

            tip: '뇌과학 연구 결과를 공유하세요.'

        },

        {

            category: '습관',

            icon: '💻',

            objection: '"컴퓨터로 다 해야 해요"',

            response: '1시간마다 5분씩 눈 쉬게 해주세요. 눈 피로가 뇌 피로로 이어져요.',

            tip: '디지털 휴식 시간을 정하게 하세요.'

        }

    ],

    [CareType.ATTENTION_DEFICIT]: [

        {

            category: '집중',

            icon: '🧠',

            objection: '"원래 집중을 못해요"',

            response: '집중력은 근육처럼 훈련할 수 있어요. 5분부터 시작해 봐요.',

            tip: '점진적 집중 시간 확장을 안내하세요.'

        },

        {

            category: '환경',

            icon: '📚',

            objection: '"책상 정리가 귀찮아요"',

            response: '깨끗한 책상이 집중력 20% 올려줘요. 1분이면 돼요.',

            tip: '정리의 효과를 구체적 수치로 제시하세요.'

        },

        {

            category: '도구',

            icon: '⏱️',

            objection: '"타이머 쓰는 게 귀찮아요"',

            response: '타이머가 의지력을 대신해요. 뇌가 마감을 인식하면 집중해요.',

            tip: '타이머 앱 사용을 권장하세요.'

        },

        {

            category: '멀티태스킹',

            icon: '🔄',

            objection: '"여러 개 같이 해야 효율적이에요"',

            response: '멀티태스킹은 효율이 40% 떨어져요. 한 번에 하나만 하세요.',

            tip: '싱글태스킹의 효과를 설명하세요.'

        }

    ],

    [CareType.CONCENTRATION]: [

        {

            category: '방해',

            icon: '📱',

            objection: '"알림 오면 봐야 해요"',

            response: '공부 시간에는 비행기 모드로 하세요. 급한 건 없어요.',

            tip: '디지털 방해 차단 전략을 제안하세요.'

        },

        {

            category: '지루함',

            icon: '😩',

            objection: '"공부가 지루해요"',

            response: '25분만 하고 쉬면 지루할 틈이 없어요. 포모도로 해보세요.',

            tip: '시간 분할 학습의 장점을 설명하세요.'

        },

        {

            category: '환경',

            icon: '🎧',

            objection: '"음악 들으면서 해야 돼요"',

            response: '가사 있는 음악은 집중력을 뺏어요. 백색소음이나 클래식으로 바꿔 보세요.',

            tip: '집중에 도움 되는 음악을 추천하세요.'

        }

    ],

    [CareType.HYPERSENSITIVE]: [

        {

            category: '환경',

            icon: '🔊',

            objection: '"조용한 곳이 없어요"',

            response: '노이즈 캔슬링 이어폰이 게임 체인저예요. 투자 가치 있어요.',

            tip: '환경 조절 도구를 추천하세요.'

        },

        {

            category: '사회',

            icon: '👥',

            objection: '"사람 많은 데 가면 지쳐요"',

            response: '그게 정상이에요. 혼자 충전하는 시간을 미리 확보하세요.',

            tip: '에너지 관리 전략을 세우게 하세요.'

        },

        {

            category: '감정',

            icon: '😢',

            objection: '"감정 조절이 안 돼요"',

            response: '민감한 건 장점이에요. 감정을 인식하고 이름 붙이는 연습부터 해요.',

            tip: '감정 라벨링 기법을 가르치세요.'

        }

    ],

    [CareType.CIRCULATION]: [

        {

            category: '자세',

            icon: '🪑',

            objection: '"앉아 있는 게 편해요"',

            response: '오래 앉으면 뇌로 가는 피가 줄어요. 1시간마다 일어나야 해요.',

            tip: '정기적 기립의 중요성을 설명하세요.'

        },

        {

            category: '운동',

            icon: '🏃',

            objection: '"운동 싫어요"',

            response: '운동 아니어도 돼요. 그냥 걷기만 해도 뇌 혈류가 20% 늘어요.',

            tip: '걷기부터 시작하게 하세요.'

        },

        {

            category: '물',

            icon: '💧',

            objection: '"물 마시기 귀찮아요"',

            response: '탈수되면 집중력이 25% 떨어져요. 물병 책상에 두세요.',

            tip: '시각적 리마인더를 제안하세요.'

        }

    ]

};
