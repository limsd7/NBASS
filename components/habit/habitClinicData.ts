/**
 * Habit Clinic 정적 데이터 (뷰와 분리)
 * - 12대 나쁜 습관 목록, 과학적 근거, 10대 프로토콜 메타,
 *   CareType -> 패턴 매핑, 추천 파이프라인, 습관 -> 패턴 매핑
 */
import { CareType } from '../../types';

export interface BadHabitItem {
    id: string;
    title: string;
    description: string;
    category: string;
    wastedMinutesPerDay: number;
    brainCause: string;
    impact: string;
    expectedScoreBoost: string;
    prescription: string;
}

export const BAD_HABITS_LIST: BadHabitItem[] = [
    {
        id: 'habit-01',
        title: '모르는 문제 나오면 1~2분 만에 해설지/답지 보기',
        description: '스스로 고민하지 않고 즉시 해설을 보며 "알았다"고 뇌를 속이는 가짜 공부 (Fake Study)',
        category: '가짜 공부 (Fake Study)',
        wastedMinutesPerDay: 35,
        brainCause: '전두엽의 주의 자원 고갈과 관련이 있을 수 있는 고통 회피 기제입니다. 스스로 풀리지 않는 문제를 마주했을 때 뇌는 이를 신체적 통증과 유사한 스트레스로 감지할 수 있습니다. 이때 해설지를 즉각 열람하면 복측 선조체에서 도파민이 순간적으로 분비되어 "문제를 이해했다"는 착각(Fluency Illusion)이 생길 수 있고, 스스로 기억을 끄집어내는 인출(Retrieval) 연습은 부족해질 수 있습니다.',
        impact: '실전 수능 시험장에는 해설지가 없기 때문에 생소한 신유형이나 킬러 문항을 마주하는 순간 극심한 패닉(Brain Freeze)에 빠지게 됩니다. 혼자 힘으로 실마리를 찾는 연습이 부족하면 시험장에서 1~2등급 진입이 어려워집니다.',
        expectedScoreBoost: '🎯 목표: 수능 수학/과학 킬러 2~3문항 해결로 점수 개선',
        prescription: '「3단계 점진적 차단 프로토콜 (Scaffolding Rx)」: ①답지를 반드시 책상에서 3m 이상 떨어진 곳에 물리적으로 격리합니다. ②막혔을 때 최소 5분간 빈 종이에 [주어진 조건 3가지]와 [관련 공식 2개]를 손으로 강제 인출해 적어봅니다. ③도저히 안 풀릴 때만 해설지의 첫 줄(시작 아이디어)만 가림판으로 살짝 확인한 후, 즉시 덮고 남은 과정을 스스로 완주합니다.'
    },
    {
        id: 'habit-02',
        title: '안 풀리는 1문제를 25~30분 이상 멍하니 잡고 늘어지기',
        description: '오기나 불안감으로 인해 진도를 나가지 못하고 시간만 흘려보내는 집착형 지연',
        category: '집착 지연 (Over-stuck)',
        wastedMinutesPerDay: 45,
        brainCause: '전대상피질(ACC)의 오류 감지 부담이 커지고 편도체가 불안에 휩싸이면서 나타날 수 있는 인지적 경직(Cognitive Inflexibility)입니다. "이것도 못 풀면 망한다"는 공포로 인해 다른 문제로 넘어가는 실행 전환(Task Switching) 능력이 둔해질 수 있으며, 제한된 주의 자원을 1문항에 과도하게 쓰는 경향이 있습니다.',
        impact: '시험 전체의 시간 배분이 크게 흐트러질 수 있습니다. 뒤쪽에 배치된 충분히 맞힐 수 있는 중급 배점 문항을 읽지도 못하고 찍어버리게 되어 큰 실점으로 이어질 수 있습니다.',
        expectedScoreBoost: '🎯 목표: 시간 부족으로 날리던 후반부 문항 확보로 점수 개선',
        prescription: '「10분 강제 타임아웃 & 마킹 룰」: ①타이머를 켜고 10분 동안 풀이 방향이 2갈래 이상 잡히지 않으면 즉시 문제 번호 위에 [별표 3개]를 치고 손을 뗍니다. ②심호흡 3회 후 다음 번호로 강제 점프합니다. ③전체 시험지/세션 1회독 완료 후 남은 시간(골든 버퍼)에 맑아진 뇌로 다시 돌아와 접근합니다.'
    },
    {
        id: 'habit-03',
        title: '공부 시작 전 책상 정리, 필통 정리, 플래너 꾸미기로 30분 쓰기',
        description: '어려운 공부를 시작하기 두려워 사소한 정리에 몰두하는 회피성 완벽주의',
        category: '회피 행동 (Avoidance)',
        wastedMinutesPerDay: 30,
        brainCause: '공부 착수 직전 작업기억 부담에 대한 걱정으로 나타날 수 있는 "생산적 회피(Productive Procrastination)" 현상입니다. 책상 청소나 펜 정리는 손쉬운 정리 작업을 통해 즉각적인 소소한 성취감(도파민)을 주기 때문에, 무의식적으로 부담스러운 진짜 공부를 뒤로 미루는 뇌의 방어 반응으로 설명됩니다.',
        impact: '가장 뇌가 맑고 집중력이 높은 착석 골든타임 30~40분을 비생산적 행동으로 허비할 수 있으며, 정작 책을 펼쳤을 때는 이미 시작 관성(Inertia)에 지쳐 학습 의지가 꺾일 수 있습니다.',
        expectedScoreBoost: '🎯 목표: 일일 순공 +45분 (지속 시 월 20시간 이상 추가 학습 기대)',
        prescription: '「2분 착수 트리거 (Zero-Friction Rx)」: ①전날 밤 취침 전, 내일 아침 풀 문제집을 펼쳐놓고 펜 뚜껑까지 열어둔 채 퇴실합니다. ②착석 즉시 정리·플래너 일체 금지, 타이머를 2분 누르고 첫 문제의 첫 문장 1줄만 무조건 읽고 쓰기 시작합니다. ③두뇌 시동이 걸리면 자연스럽게 몰입 상태로 전이됩니다.'
    },
    {
        id: 'habit-04',
        title: '인강 들으며 음악/유튜브 틀어놓고 멀티태스킹하기',
        description: '뇌의 도파민을 채우려다 작업기억 용량을 반토막 내는 집중력 분산',
        category: '도파민 분산 (Distraction)',
        wastedMinutesPerDay: 40,
        brainCause: '복합적인 감각 자극을 갈망하는 신경학적 주의 분산 경향과 관련이 있을 수 있습니다. 인간의 작업기억(Working Memory)은 단일 채널 음운 루프(Phonological Loop)를 공유하므로, 음악 가사나 배경 영상이 함께 들어오면 공부 정보의 부호화(Encoding)가 크게 방해받을 수 있습니다.',
        impact: '인강을 오래 들었어도 뇌에 남는 분량은 적다고 느낄 수 있습니다. 장기기억화 과정이 방해받아 며칠만 지나면 개념이 흐릿해지고 실전 응용력이 떨어질 수 있습니다.',
        expectedScoreBoost: '🎯 목표: 개념 암기 유지율 향상 및 탐구 백분위 개선',
        prescription: '「감각 단일화 & 비행기 모드 격리」: ①인강 수강 시 스마트폰은 전원 종료 후 가방 깊숙이 넣거나 다른 방에 둡니다. ②BGM은 일체 차단하며, 주변 소음이 심할 경우 핑크 노이즈(Pink Noise) 또는 무음 귀마개만 허용합니다. ③강의 1강 종료 후 5분간 화면을 끄고 강사가 말한 핵심 뼈대를 빈 종이에 인출합니다.'
    },
    {
        id: 'habit-05',
        title: '침대나 소파에 엎드려서 책 보거나 인강 듣기',
        description: '자세 이완으로 인해 뇌 각성도가 떨어져 20분 내로 졸음과 브레인포그 유발',
        category: '각성도 저하 (Low Arousal)',
        wastedMinutesPerDay: 50,
        brainCause: '신체 자세가 이완되면 상행망상활성계(ARAS)를 통한 뇌간의 상향식 각성 신호가 줄어들 수 있습니다. 뇌는 엎드린 자세를 휴식 상태로 인식해 멜라토닌 분비가 촉진될 수 있고, 두뇌의 집중 몰입도가 졸음과 피로 쪽으로 기울 수 있습니다.',
        impact: '책상 앞 공부 시간 대비 실제 흡수율이 낮아질 수 있습니다. "공부했다"는 자기만족만 남고 실질적인 두뇌 연산은 둔해진 브레인포그(Brain Fog) 상태로 시간이 낭비될 수 있습니다.',
        expectedScoreBoost: '🎯 목표: 졸음·멍때림 시간 줄이기',
        prescription: '「직각 착석 & 시야각 15도 유지」: ①공부는 오직 허리를 90도로 세울 수 있는 정규 독서실/책상 의자에서만 진행합니다. ②독서대를 사용하여 시야각을 15~20도 상향 고정하여 뇌 각성도를 물리적으로 자극합니다. ③졸음 전조 증상 발생 시 즉시 기립하여 3분 스트레칭 및 시원한 냉수를 음용합니다.'
    },
    {
        id: 'habit-06',
        title: '어려운 수학/국어 제쳐두고 쉬운 과목만 먼저 하기',
        description: '전두엽 에너지가 가장 맑은 골든타임을 쉬운 과목으로 낭비하는 편식 공부',
        category: '골든타임 낭비 (Misplacement)',
        wastedMinutesPerDay: 30,
        brainCause: '인지 부담이 큰 과목을 피하려는 무의식적 편식 학습으로 설명됩니다. 전두엽 에너지가 비교적 충만한 오전 시간대에 인지 부하가 높은 킬러 과목을 회피하고, 뇌가 편안함을 느끼는 단순 암기나 좋아하는 쉬운 과목으로 향하는 경향이 있습니다.',
        impact: '진짜 등급을 결정짓는 취약 킬러 과목의 공부량이 부족해지면, 하루 공부 시간이 길어도 실전에서 치명적인 등급 하락을 맞이할 수 있습니다.',
        expectedScoreBoost: '🎯 목표: 취약 과목 등급 단계적 향상',
        prescription: '「Eat That Frog: 오전 90분 킬러 블록」: ①기상 후 두뇌 각성 골든타임(식사 30분 후 첫 착석)에는 무조건 가장 취약하고 피하고 싶은 1순위 킬러 과목(수학 킬러/국어 독서)만 배치합니다. ②이 90분이 끝나기 전까지는 탐구나 쉬운 과목 책을 가방에서 꺼내지도 않는 철칙을 수립합니다.'
    },
    {
        id: 'habit-07',
        title: '형광펜 밑줄만 예쁘게 긋고 "다 외웠다"고 착각하기',
        description: '책을 읽으며 줄만 치고 스스로 인출(Recall)해보지 않는 수동적 눈공부',
        category: '수동적 착각 (Passive Reading)',
        wastedMinutesPerDay: 35,
        brainCause: '시각적 친숙함(Recognition)을 뇌의 인출(Recall) 능력으로 오인할 수 있는 메타인지(Metacognition) 오류입니다. 텍스트에 색칠할 때 시각 피질은 정보를 보았기 때문에 "안다"고 착각할 수 있지만, 해마와 대뇌피질 사이의 연결 고리는 충분히 형성되지 않은 수동적 소비에 그칠 수 있습니다.',
        impact: '문제를 풀 때는 선지가 헷갈려 정답률이 떨어질 수 있고, "공부할 땐 다 알았는데 시험장 가면 머리가 하얘진다"는 시험 불안으로 이어질 수 있습니다.',
        expectedScoreBoost: '🎯 목표: 빈칸추론 등 오답률 낮추기',
        prescription: '「블라인드 백지 인출(Active Recall) Rx」: ①형광펜 사용을 1페이지당 최대 3단어로 제한합니다. ②1개 소단원을 읽은 즉시 책을 완전히 덮습니다. ③빈 A4 용지에 방금 읽은 내용의 [핵심 개념 3가지]와 [인과관계 화살표]를 기억만으로 손으로 직접 써내려간 뒤 책과 대조합니다.'
    },
    {
        id: 'habit-08',
        title: '오답노트에 문제와 해설을 예쁘게 옮겨 적기만 하기',
        description: '사고 과정의 오류를 짚지 않고 글씨를 베껴 쓰며 만족하는 장식적 노동',
        category: '필사 노동 (Decorative Writing)',
        wastedMinutesPerDay: 40,
        brainCause: '전두엽의 고차원적 오류 분석 사고를 쓰지 않고, 손가락 소근육의 단순 반복 운동으로 뇌를 달래는 가짜 성취감 추구 경향으로 설명됩니다. 글씨를 반듯하게 적는 행위는 시각적 만족감을 주어 뇌가 실질적인 사고의 고통을 건너뛰게 만들 수 있습니다.',
        impact: '오답 정리에 시간을 쏟아부어도, 일주일 뒤 숫자나 조건만 바꾼 유사 변형 문제를 주면 다시 틀리기 쉽습니다.',
        expectedScoreBoost: '🎯 목표: 유사 변형 문제 오답 줄이기',
        prescription: '「3줄 메타인지 오답노트 (No-Copying Rx)」: ①문제와 해설 베껴 쓰기 절대 금지. ②오답 상단에 딱 3줄만 기록합니다: 1줄-내가 시험장에서 착각한 잘못된 사고 경로, 2줄-출제자가 판 함정 키워드, 3줄-다음에 이 유형을 볼 때 떠올릴 첫 번째 행동 수칙. ③3일 후 백지 상태에서 재풀이 1회 실시.'
    },
    {
        id: 'habit-09',
        title: '인강만 하루 5~6시간 연속으로 들으며 스스로 푸는 자습 건너뛰기',
        description: '스타 강사의 유려한 풀이를 보며 내가 이해했다고 믿는 인강 중독증',
        category: '대리 만족 (Lecture Addiction)',
        wastedMinutesPerDay: 60,
        brainCause: '일타 강사의 명쾌한 설명을 보며 거울 뉴런(Mirror Neurons)이 활성화되면서, 강사의 문제 해결력이 마치 자신의 능력인 양 느껴지는 "대리 이해 착시"가 생길 수 있습니다. 스스로 오답과 씨름하는 과정이 부족하면 개념 연결이 충분히 단단해지기 어렵습니다.',
        impact: '혼자 모의고사를 풀 때 1번 문제부터 조건 해석이 막히며 인지적 굳어짐(Cognitive Freezing)을 겪을 수 있고, 강의 러닝타임만 채우는 수험 생활에 갇힐 수 있습니다.',
        expectedScoreBoost: '🎯 목표: 100분 시험 운용 체력 기르기',
        prescription: '「1:2 인강·순공 절대 보존 법칙」: ①인강 1시간을 수강했다면 무조건 그날 해당 과목의 [혼자 문제 풀고 씹어먹는 자습 시간 2시간]이 확보되지 않으면 다음 인강 재생을 금지합니다. ②강의 수강 직후 강의창을 닫고, 강사가 풀어준 예제를 빈 화면에서 스스로 끝까지 풀어냅니다.'
    },
    {
        id: 'habit-10',
        title: '모르는 개념 검색하려다 SNS·쇼츠·커뮤니티로 탈선하기',
        description: '공부 목적으로 폰을 켰다가 알고리즘 추천 영상과 피드로 빠져 시간 낭비',
        category: '디지털 탈선 (Digital Derailment)',
        wastedMinutesPerDay: 45,
        brainCause: '모르는 개념에 부딪혔을 때 생기는 인지적 부담(Friction)을 해소하려 스마트폰을 켜는 순간, 알고리즘이 설계한 가변 보상에 주의가 끌려 전두엽의 억제 조절이 둔해질 수 있는 현상입니다.',
        impact: '단 5분만 보려던 쇼츠가 30~40분으로 이어질 수 있고, 스마트폰에서 빠져나온 후에도 여운(Attention Residue)으로 인해 깊은 몰입(Flow) 상태로 돌아오는 데 시간이 걸릴 수 있습니다.',
        expectedScoreBoost: '🎯 목표: 집중 지속시간 늘리기',
        prescription: '「아날로그 의문 파킹 랏(Parking Lot) 메모법」: ①공부 중 모르는 단어나 개념이 나와도 실시간 스마트폰 검색 절대 금지. ②책상 옆 노란색 포스트잇에 [궁금한 단어/페이지]만 1줄 메모해두고 즉시 다음 진도를 나갑니다. ③당일 모든 자습이 끝난 마지막 20분에만 몰아서 일괄 검색하여 해결합니다.'
    },
    {
        id: 'habit-11',
        title: '새벽 2~3시까지 졸면서 억지로 책상에 붙어있기',
        description: '수면 부족으로 인해 뇌 회로가 반쯤 잠든 상태에서 시간만 채우는 비효율 공부',
        category: '수면 부채 (Sleep Deprivation)',
        wastedMinutesPerDay: 60,
        brainCause: '수면 중 피로 물질 정리와 낮에 배운 내용의 기억 고착 과정이 방해받을 수 있는 행위입니다. 수면이 부족하면 주의력과 반응 속도가 떨어진다는 연구 보고가 있습니다.',
        impact: '새벽에 억지로 버티면 다음 날 수업 시간에 집중하기 어려워져, 얻는 시간보다 잃는 시간이 커질 수 있습니다.',
        expectedScoreBoost: '🎯 목표: 연산 속도 높이고 계산 실수 줄이기',
        prescription: '「서카디안 골든 6.5시간 락인」: ①수험생의 취침 한계선은 무조건 자정(24:00)으로 고정합니다. ②아무리 공부가 덜 끝났어도 24:00에는 소등하고 최소 6.5시간의 연속 수면을 보장해야 해마가 낮에 공부한 지식을 장기기억으로 압축 저장합니다. ③새벽 공부 대신 오전 6:30 기상 후 맑은 뇌로 공부합니다.'
    },
    {
        id: 'habit-12',
        title: '계획만 하루 12시간 빽빽하게 세우고 1개 틀어지면 하루 통째로 포기하기',
        description: '비현실적인 계획을 세우고 작은 차질에도 올-오어-낫싱(All or Nothing)으로 자포자기',
        category: '완벽주의 번아웃 (Planning Burnout)',
        wastedMinutesPerDay: 50,
        brainCause: '계획 오류(Planning Fallacy)와 완벽주의적 흑백논리(All-or-Nothing) 사고가 겹쳐 있는 상태로 설명됩니다. 오전 계획이 조금만 지연되어도 강한 자기 비난과 죄책감이 생길 수 있고, 이를 피하려 "오늘은 망했으니 내일부터" 식의 학습 회피를 선택할 수 있습니다.',
        impact: '계획대로 공부하는 날이 적어질 수 있으며, 만성적인 자책감과 학습된 무기력(Learned Helplessness)으로 수험 생활 전반의 자신감이 낮아질 수 있습니다.',
        expectedScoreBoost: '🎯 목표: 주간 학습 완수율 높이기',
        prescription: '「70% 탄력 버퍼 스케줄링 & 10분 마감 룰」: ①하루 계획은 최대 집중 가용 시간의 70%만 채우고, 나머지 30%는 무조건 비어있는 [완충 버퍼(Buffer Zone)]로 편성합니다. ②계획이 밀렸을 땐 포기하지 말고 밀린 분량을 버퍼 시간에 흡수시킵니다. ③"완벽한 하루"가 아니라 "70% 완주한 날들의 연속"이 수능 1등급을 만든다는 마인드셋을 확립합니다.'
    }
];

// 뇌과학 소견의 일반적 학술 배경 (대표 연구; 본 프로그램 효과를 직접 검증한 것은 아님)
// - 검증 불가·논쟁 중인 주장은 인용하지 않고, 서술 자체를 가능성 표현으로 제한한다
export const HABIT_SCIENCE_SOURCES: Record<string, string[]> = {
    'habit-01': ['Roediger & Karpicke (2006): 인출 연습의 학습 효과'],
    'habit-02': ['Miyake et al. (2000): 실행기능의 전환·억제 요소'],
    'habit-03': ['Steel (2007): academic procrastination 메타분석'],
    'habit-04': ['Ophir, Nass & Wagner (2009): 미디어 멀티태스킹과 과제 전환 비용', 'Baddeley (1992): 작업기억 모델'],
    'habit-07': ['Dunlosky et al. (2013): 연습 인출·분산 학습의 높은 효용'],
    'habit-08': ['Karpicke & Roediger (2008): 인출 연습과 장기 파지'],
    'habit-09': ['Chi et al. (1989): 자기 설명(self-explanation) 효과'],
    'habit-10': ['Leroy (2009): 주의 잔여(attention residue)'],
    'habit-11': ['Diekelmann & Born (2010): 수면과 기억 공고화', 'Williamson & Feyer (2000): 수면 부족 시 수행 저하'],
};

export type ProtocolId = 'p1' | 'p2' | 'p3' | 'p4' | 'p5' | 'p6' | 'p7' | 'p8' | 'p9' | 'p10';

export const PROTOCOL_META: Record<ProtocolId, { no: number; group: 'core' | 'boost'; step: string; name: string; fullTitle: string; icon: string }> = {
    p1: { no: 1, group: 'core', step: '1번', name: '물리 차단', fullTitle: '실전 3단계 물리 행동 교정기 (자극 제어 & 서약)', icon: '🔒' },
    p2: { no: 2, group: 'core', step: '2번', name: 'IF-THEN', fullTitle: 'IF-THEN 신경망 조건반사 스위치 (이행 의도 실행기)', icon: '🧠' },
    p3: { no: 3, group: 'core', step: '3번', name: '60초 리콜', fullTitle: '60초 마이크로 리콜 & 파인만 보이스 인출기 (능동 회상)', icon: '🎙️' },
    p4: { no: 4, group: 'boost', step: '4번', name: '도파민 스트릭', fullTitle: '도파민 연속 스트릭 & 손실 회피(Loss Aversion) 금고', icon: '🔥' },
    p5: { no: 5, group: 'boost', step: '5번', name: '학부모 안심', fullTitle: '학부모 안심 동기화 & 잔소리 제로(Zero) 세이프가드', icon: '📲' },
    p6: { no: 6, group: 'core', step: '6번', name: '3분 한숨', fullTitle: '3분 생리학적 한숨(Physiological Sigh) & 자율신경 리셋', icon: '🫁' },
    p7: { no: 7, group: 'core', step: '7번', name: '3색 오답', fullTitle: '3색 뇌신경 오답 메타인지 분해기 (착각 지점 분해)', icon: '🎯' },
    p8: { no: 8, group: 'boost', step: '8번', name: '시각 터널링', fullTitle: '시각 터널링 & 모노태스킹 블랙아웃 (주의 잔류물 0%)', icon: '🌑' },
    p9: { no: 9, group: 'boost', step: '9번', name: '울트라디안', fullTitle: '울트라디안 90분 피크-딥(Peak-Dip) 과목 매칭', icon: '⚡' },
    p10: { no: 10, group: 'boost', step: '10번', name: '수면 고착', fullTitle: '취침 직전 15분 해마 수면 고착 (Sleep Memory Replay)', icon: '🌙' },
};

// 12대 CareType → 임상 패턴 명시 매핑 (문자열 includes 금지, 미매핑은 FATIGUE)
export const PATTERN_BY_CARETYPE: Record<string, ClinicalPattern> = {
    [CareType.ATTENTION_DEFICIT]: 'DISTRACTION',
    [CareType.HYPERSENSITIVE]: 'DISTRACTION',
    [CareType.ANXIETY_TENSION]: 'ANXIETY',
    [CareType.STRESS_OVERLOAD]: 'ANXIETY',
    [CareType.BURNOUT]: 'ANXIETY',
    [CareType.DEPRESSION_AMOTIVATION]: 'SURFACE_STUDY',
    [CareType.CONCENTRATION]: 'SURFACE_STUDY',
    [CareType.LOW_ENERGY]: 'FATIGUE',
    [CareType.ADRENAL]: 'FATIGUE',
    [CareType.BRAIN_FATIGUE]: 'FATIGUE',
    [CareType.SLEEP]: 'FATIGUE',
    [CareType.CIRCULATION]: 'FATIGUE',
    [CareType.HEALTHY]: 'FATIGUE',
    [CareType.UNASSESSED]: 'FATIGUE',
};

export type ClinicalPattern = 'FATIGUE' | 'DISTRACTION' | 'ANXIETY' | 'SURFACE_STUDY';

export interface PipelineRecommendation {
    primaryId: ProtocolId;
    primaryTitle: string;
    primaryGain: string;
    primaryScore: string;
    secondaryIds: ProtocolId[];
    secondaryTitle: string;
    secondaryCumulativeGain: string;
    secondaryScore: string;
}

export const pipelineMap: Record<ClinicalPattern, PipelineRecommendation> = {
    FATIGUE: {
        primaryId: 'p6',
        primaryTitle: '방법 6: 🫁 3분 생리학적 한숨 & 자율신경 리셋',
        primaryGain: '전두엽 피로 누적 완화에 도움. 멍한 가짜 공부 시간을 줄이고 시험장 멍때림(브레인 프리즈) 진정에 도움',
        primaryScore: '+6~8점 목표 (1개 등급 상승 발판)',
        secondaryIds: ['p9', 'p10', 'p1'],
        secondaryTitle: '방법 9(울트라디안 피크-딥) + 방법 10(수면 리플레이) + 방법 1(물리 차단)',
        secondaryCumulativeGain: '두뇌 바이오리듬 정리 + 밤사이 기억 고착으로 일일 순공 회복 돕기',
        secondaryScore: '목표: 총점 개선 (꾸준 실천 시 등급 향상 기대)'
    },
    DISTRACTION: {
        primaryId: 'p1',
        primaryTitle: '방법 1: 🔒 3단계 물리적 차단 & 점진적 힌트 오픈',
        primaryGain: '시각 자극 거리두기로 충동적 확인 욕구 줄이기에 도움. 답지 확인 욕구 다스리기 및 킬러 문항 지구력 기르기',
        primaryScore: '+6~8점 목표 (킬러 1~2문항 추가 정답)',
        secondaryIds: ['p8', 'p4', 'p2'],
        secondaryTitle: '방법 8(시각 터널링 블랙아웃) + 방법 4(도파민 스트릭) + 방법 2(IF-THEN)',
        secondaryCumulativeGain: '시각 분산 다스리기 + 작심삼일 줄이기, 일일 낭비 시간 되찾기',
        secondaryScore: '목표: 총점 개선 (꾸준 실천 시 등급 향상 기대)'
    },
    ANXIETY: {
        primaryId: 'p2',
        primaryTitle: '방법 2: 🧠 IF-THEN 신경망 조건반사 스위치',
        primaryGain: '어려운 문제 앞 공포 반응 진정에 도움. 10초 대체 행동으로 당황 실수 줄이기',
        primaryScore: '+6~8점 목표 (시간 부족·마킹 실수 줄이기)',
        secondaryIds: ['p6', 'p5', 'p7'],
        secondaryTitle: '방법 6(자율신경 호흡) + 방법 5(학부모 안심 동기화) + 방법 7(3색 오답)',
        secondaryCumulativeGain: '시험 당일 긴장 완화에 도움 및 심리적 평정심 돕기',
        secondaryScore: '목표: 총점 개선 (꾸준 실천 시 상위권 안정 기대)'
    },
    SURFACE_STUDY: {
        primaryId: 'p3',
        primaryTitle: '방법 3: 🎙️ 60초 마이크로 리콜 & 파인만 인출기',
        primaryGain: '눈으로 보는 가짜 숙달 깨기에 도움. 30분 공부 후 60초 인출로 개념 혼동 줄이기',
        primaryScore: '+7~9점 목표 (신유형 문항 도전)',
        secondaryIds: ['p7', 'p10', 'p1'],
        secondaryTitle: '방법 7(3색 오답 분해) + 방법 10(수면 리플레이) + 방법 1(물리 차단)',
        secondaryCumulativeGain: '베껴 쓰기 줄이기, 메타인지 정리와 수면 복습으로 장기기억 돕기',
        secondaryScore: '목표: 총점 개선 (꾸준 실천 시 등급 향상 기대)'
    }
};

// 1단계 체크 습관 -> 임상 패턴 매핑 (AI 추천 다수결용)
export const HABIT_PATTERN_MAP: Record<string, ClinicalPattern> = {
    'habit-01': 'SURFACE_STUDY',
    'habit-02': 'ANXIETY',
    'habit-03': 'ANXIETY',
    'habit-04': 'DISTRACTION',
    'habit-05': 'FATIGUE',
    'habit-06': 'FATIGUE',
    'habit-07': 'SURFACE_STUDY',
    'habit-08': 'SURFACE_STUDY',
    'habit-09': 'SURFACE_STUDY',
    'habit-10': 'DISTRACTION',
    'habit-11': 'FATIGUE',
    'habit-12': 'ANXIETY',
};
