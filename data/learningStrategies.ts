import { CareType, LearningTraitsData } from '../types';

/**
 * 14대 CareType별 과학적 신경인지 기전 및 과목별 초정밀 맞춤 학습 전략 데이터
 */

export interface NeuroCognitiveProfile {
  brainMechanism: string;       // 뇌 신경생리학적 기전 (전두엽/해마/편도체/자율신경)
  learningBottleneck: string;   // 학습 시 인지 병목 현상
  coreCognitiveStrength: string;// 인지적 강점 및 잠재 성장 기회
}

export interface TimeAndSessionArchitecture {
  recommendedCycle: string;    // 세션 사이클 (예: 15분 몰입 + 5분 뇌이완 마이크로 세션)
  startRitual: string;         // 착석 3단계 스타트 루틴 (Activation Ritual)
  inputOutputRatio: string;    // 인풋 vs 아웃풋 최적 비율
}

export interface SubjectProtocolDetail {
  strategyTitle: string;       // 핵심 공략명
  actionPlan: string;          // 구체적 실행 지침
  readingOrConceptMethod: string; // 독해 및 개념 체화 기법
  problemSolvingMethod: string;   // 문제 풀이 & 인출 기법
  killerTips: string;          // 킬러 문항 & 오답 방어 팁
}

export interface SubjectSpecificProtocols {
  korean: SubjectProtocolDetail;
  math: SubjectProtocolDetail;
  english: SubjectProtocolDetail;
  inquiry: SubjectProtocolDetail;
  korean_history?: SubjectProtocolDetail;
}

export interface ConcentrationAndEnvironment {
  environmentSetup: string;    // 공간, 조명, 노이즈 통제
  distractionBlocker: string;  // 시각/디지털 유혹 차단법
}

export interface MentalAndSlumpCare {
  emergencyReset: string;      // 1분 생체 호흡법 (Physiological Sigh)
  cognitiveReframing: string;  // 오답/실패 시 인지 재구조화
}

export interface DetailedCareTypeStrategy {
  careTypeName: string;
  summaryBadge: string;
  neuroCognitiveProfile: NeuroCognitiveProfile;
  timeArchitecture: TimeAndSessionArchitecture;
  subjectProtocols: SubjectSpecificProtocols;
  concentrationEnvironment: ConcentrationAndEnvironment;
  mentalSlumpCare: MentalAndSlumpCare;
  // Legacy / string fallbacks for markdown generation
  learningStyle: string;
  subjectStrategy: {
    korean: string;
    math: string;
    english: string;
    inquiry?: string;
    korean_history?: string;
  };
  concentration: string;
  mentalCare: string;
}

export const DETAILED_CARETYPE_STRATEGIES: Record<CareType, DetailedCareTypeStrategy> = {
  [CareType.BURNOUT]: {
    careTypeName: '과긴장 번아웃 (Hyper-Tension Burnout)',
    summaryBadge: '🔋 마이크로 세션 & 저부하 인지 회복',
    neuroCognitiveProfile: {
      brainMechanism: '전두엽 피질의 포도당 대사율이 급감하고 편도체 과항진으로 인해 뇌의 작업기억(Working Memory) 용량이 40% 이상 축소된 상태입니다. 정보 저장을 담당하는 해마의 시냅스 가소성이 저하되어 있습니다.',
      learningBottleneck: '장시간 집중 시 뇌의 정보 거부 반응(브레인 셧다운)이 발생하여 활자가 튕기고 단순 계산에서도 인지적 과부하가 발생합니다.',
      coreCognitiveStrength: '기존에 축적된 장기 기억과 직관적 통찰력이 뛰어나므로, 뇌 부하만 줄여주면 빠르게 최상위권 감각을 복구할 수 있습니다.'
    },
    timeArchitecture: {
      recommendedCycle: '⚡ 15분 초단기 몰입 + 5분 암흑 뇌이완 (마이크로 뽀모도로)',
      startRitual: '책상 착석 후 1분간 눈을 감고 미온수를 마시며 "오늘 분량은 가볍게 3문제만"이라고 뇌의 저항을 낮춥니다.',
      inputOutputRatio: '인풋(개념/강의) 25% : 아웃풋(가벼운 기본기 확인) 75%'
    },
    subjectProtocols: {
      korean: {
        strategyTitle: '📖 역순 분절 독해 & 문학 감상 중심 회복',
        actionPlan: '하루 비문학 1지문, 문학 1세트만 깊이 있게 보되 지문을 읽기 전 해설지 요약부터 확인하는 역순 분석을 실시합니다.',
        readingOrConceptMethod: '지문 전체를 한 번에 읽지 않고 1문단 읽고 1줄 키워드 여백 메모하는 분절 독해법을 적용합니다.',
        problemSolvingMethod: '정답 찾기에 집착하지 않고 선지의 논리적 연결성만 확인하는 저부하 매칭 훈련을 합니다.',
        killerTips: '고난도 철학/과학 킬러 지문은 과감히 건너뛰고, EBS 연계 문학 작품의 줄거리 파악으로 1교시 자신감을 회복합니다.'
      },
      math: {
        strategyTitle: '📐 효능감 회복을 위한 3점 문항 타임어택 & 눈풀이',
        actionPlan: '새로운 킬러 문제 대신 이미 풀었던 기본 유형서의 대표 예제를 빠르게 풀며 성공 경험 도파민을 충전합니다.',
        readingOrConceptMethod: '공식 암기보다는 공식 유도 과정을 펜으로 가볍게 따라 쓰며 손의 감각을 깨웁니다.',
        problemSolvingMethod: '하루 15문제 이내로 제한하고, 풀이 과정은 3줄 이내로 핵심 식만 적는 가벼운 풀이를 지향합니다.',
        killerTips: '21/22/30번 등 최고난도 킬러는 잠시 보류하고 4점 준킬러의 첫 조건 해석에만 집중하여 두뇌 피로를 방지합니다.'
      },
      english: {
        strategyTitle: '🔤 청각 다중 채널 단어 암기 & 배경지식 독해',
        actionPlan: '눈으로 빽빽하게 단어를 외우지 말고, 원어민 MP3 음원을 들으며 따라 말하는 청각 자극 암기를 진행합니다.',
        readingOrConceptMethod: 'EBS 연계 교재의 한글 해석본을 먼저 읽어 배경지식을 완벽히 장악한 후 영문 지문을 빠르게 스캐닝합니다.',
        problemSolvingMethod: '대의 파악(주제/제목/요지) 문항 위주로 첫 문장과 결론 문장의 패러프레이징만 연결합니다.',
        killerTips: '빈칸 추론 킬러 문항은 선택지 5개 중 명백한 오답 3개를 지우는 소거법에 집중하여 인지 소모를 줄입니다.'
      },
      inquiry: {
        strategyTitle: '⚡ 단원별 마인드맵 & 1일 1개념 백지 인출',
        actionPlan: '교재 1권을 정주행하기보다 가장 자신 있는 1개 킬러 단원만 골라 개념 구조도를 그립니다.',
        readingOrConceptMethod: '교과서 핵심 키워드 5개만 골라 백지에 포스트잇으로 정리합니다.',
        problemSolvingMethod: '기출 2점 문항을 풀며 개념의 구멍 유무만 빠르게 스크리닝합니다.',
        killerTips: '자료 해석형 복합 도표 문제는 핵심 변수 2개만 형광펜으로 체크하고 단순화합니다.'
      }
    },
    concentrationEnvironment: {
      environmentSetup: '주광색의 강한 조명 대신 3000K 내외의 따뜻한 간접 조명과 조용한 1인 스터디룸 환경을 권장합니다.',
      distractionBlocker: '스마트폰은 아예 다른 방에 보관하고, 타이머는 아날로그 무소음 스톱워치만 사용합니다.'
    },
    mentalSlumpCare: {
      emergencyReset: '뇌 과열 시 4초 들이마시고 7초 멈춘 뒤 8초간 천천히 내쉬는 4-7-8 호흡을 3회 반복합니다.',
      cognitiveReframing: '"오늘 진도를 못 뺀 것은 게으름이 아니라 뇌의 회복 신호다. 15분 쉬고 나면 2배 빨라진다."'
    },
    learningStyle: "번아웃 상태에서는 '최소 부하, 최대 효율'을 지향하는 15분 마이크로 러닝이 핵심입니다. 극단적으로 학습 단위를 쪼개어 전두엽 거부 반응을 해소하면 정보 흡수율이 40% 이상 상승합니다.",
    subjectStrategy: {
      korean: "비문학 분절 독해 및 해설지를 먼저 보는 역순 학습으로 뇌 예측 부담을 30% 이상 경감시킵니다.",
      math: "기본 3점 예제 위주로 하루 10문제만 해결하며 성취감 도파민을 회복합니다.",
      english: "청각 음원 기반 단어 노출과 한글 해석본 배경지식 독해로 텍스트 피로를 분산합니다.",
      inquiry: "핵심 1개 단원 백지 마인드맵 정리로 개념 휘발을 방어합니다."
    },
    concentration: "**[집중 유지]** 15분 학습 후 5분 암흑 휴식(스마트폰 금지). 뇌 리셋을 통해 오후 집중 지속 시간을 50% 연장합니다.",
    mentalCare: "**[멘탈 케어]** 자기 자비(Self-Compassion) 훈련. 계획 미달 시 자책 대신 '충전 중'임을 인정하여 전두엽 회복을 촉진합니다."
  },

  [CareType.ADRENAL]: {
    careTypeName: '부신피로 증후군 (Adrenal Fatigue)',
    summaryBadge: '🌊 일주기 호르몬 서핑 & 오후 골든타임 집중',
    neuroCognitiveProfile: {
      brainMechanism: '코르티솔 일주기 분비 곡선이 평탄화되어 기상 직후 각성이 지연되고 오후 3~5시에 급격한 혈당/에너지 강하(Adrenal Crash)가 일어납니다.',
      learningBottleneck: '오전 9~11시 브레인 포그가 심하며, 장시간 공복 시 집중력이 수직 낙하하여 공부 지속성이 단절됩니다.',
      coreCognitiveStrength: '에너지가 안정되는 오후 늦게와 저녁 시간대에 폭발적인 집중 몰입을 발휘할 수 있는 야행성 스퍼트 잠재력을 보유하고 있습니다.'
    },
    timeArchitecture: {
      recommendedCycle: '🌊 30분 블록 학습 + 견과류/미네랄 보충 + 5분 림프 스트레칭',
      startRitual: '기상 직후 따뜻한 레몬수나 소금물 1잔을 마시고 10분간 아침 햇볕을 쬐며 시교차상핵(SCN) 생체시계를 리셋합니다.',
      inputOutputRatio: '인풋(강의) 40% : 아웃풋(문제풀이) 60%'
    },
    subjectProtocols: {
      korean: {
        strategyTitle: '📖 시간대별 과목 재배치 & 문단 분절 압축 독해',
        actionPlan: '아침 각성이 더딘 시간에는 독서 지문 대신 화작/언매 및 문학 작품 정독을 배치하고, 맑아지는 오후에 비문학을 풉니다.',
        readingOrConceptMethod: '한 지문을 다 읽고 문제를 풀지 말고, 2개 문단 독해 후 해당 문단 관련 선지를 즉시 해결하는 핑퐁 독해를 합니다.',
        problemSolvingMethod: '형광펜으로 핵심 접속사(그러나, 따라서)를 시각화하여 주의력 소모를 절약합니다.',
        killerTips: '오전 모의고사 시 1교시 시작 15분 전 포도당 캔디 1알로 뇌 각성도를 급상승시킵니다.'
      },
      math: {
        strategyTitle: '📐 오후 골든타임 집중 배치 & 4점 준킬러 분할 정복',
        actionPlan: '에너지가 가장 높은 오후 2시~5시에 수학 고난도 기출 풀이 세션을 집중 배치합니다.',
        readingOrConceptMethod: '개념 노트를 눈으로 보지 않고, 3분 타이머를 켜고 핵심 공식 유도 과정을 직접 써봅니다.',
        problemSolvingMethod: '풀이가 10줄을 넘어가는 문제는 단계별(Step 1, Step 2)로 풀이 공간을 나누어 계산 실수를 차단합니다.',
        killerTips: '막히는 문제는 5분 이상 잡지 말고 별표 후 저녁 복습 시간대로 넘기는 시간 관리 루틴을 확립합니다.'
      },
      english: {
        strategyTitle: '🔤 듣기 평가 연계 & 시각 피로 분산 독해법',
        actionPlan: '눈 피로가 부신 피로를 촉진하므로, 듣기 평가 20분을 풀며 독해 문항 3~4개를 안전하게 동시 처리합니다.',
        readingOrConceptMethod: '지문의 모든 문장을 완벽히 번역하려 하지 말고, 소재(Topic)와 필자의 방향성(Attitude) 2개만 낚아챕니다.',
        problemSolvingMethod: '문장 간 연결사(However, For example)를 기준으로 논리 전개 흐름도(Flowchart)를 머릿속에 그립니다.',
        killerTips: '순서 배열 문항은 지시사(this, such)와 정관사(the)의 인과관계 힌트를 찾아 기계적으로 연결합니다.'
      },
      inquiry: {
        strategyTitle: '⚡ 취약 단원 3회독 압축 노트 & 기출 오답 단권화',
        actionPlan: '피로도가 높은 저녁 9시 이후에는 가벼운 암기 과목을 배치하여 부담 없이 완주합니다.',
        readingOrConceptMethod: '교재 여백에 내가 헷갈렸던 함정 보기를 빨간펜으로 1줄 요약해둡니다.',
        problemSolvingMethod: '타이머로 20문항을 25분에 푸는 타임 리허설을 주 2회 실시합니다.',
        killerTips: '헷갈리는 개념은 나만의 유치한 앞글자 암기법(두문자어)을 만들어 뇌의 인출 부담을 제로화합니다.'
      }
    },
    concentrationEnvironment: {
      environmentSetup: '혈당 유지를 위해 책상에 견과류, 호박씨, 아미노산 음료를 구비하고, 발 받침대를 두어 척추 부담을 줄입니다.',
      distractionBlocker: '카페인 고용량 음료를 절대 금지하고, 무카페인 페퍼민트 허브차로 뇌 혈류를 자극합니다.'
    },
    mentalSlumpCare: {
      emergencyReset: '오후 4시 피로 폭풍이 올 때 책상에 엎드려 15분간 안대 착용 후 무자극 파워냅(Power Nap)을 취합니다.',
      cognitiveReframing: '"완벽하게 10시간 앉아있는 것보다, 맑은 정신으로 5시간 집중하는 것이 훨씬 높은 점수를 만든다."'
    },
    learningStyle: "에너지 서핑(Energy Surfing) 전략: 기상 직후 2시간은 저부하 루틴, 오후 골든타임에 핵심 과목(수학/비문학)을 집중 배치합니다.",
    subjectStrategy: {
      korean: "오전 화작/언매, 오후 독서 지문 핑퐁 독해로 피로도에 따른 인지 부하를 분산합니다.",
      math: "오후 2~5시 준킬러 집중 배치 및 3단계 분할 풀이로 계산 실수를 방어합니다.",
      english: "듣기 평가 훈련과 소재/태도 2포인트 독해로 시각 피로를 최소화합니다.",
      inquiry: "저녁 취약 단원 단권화 압축 노트 복습으로 하루를 안정감 있게 마감합니다."
    },
    concentration: "**[집중 유지]** 2시간 간격 혈당 안정 간식(견과류) 섭취로 브레인 포그를 방지하고 순공 효율을 30% 방어합니다.",
    mentalCare: "**[멘탈 케어]** '오늘 75점짜리 하루도 대성공이다'라는 마인드로 코르티솔 과다 분비를 억제합니다."
  },

  [CareType.ANXIETY_TENSION]: {
    careTypeName: '불안-긴장형 (Anxiety-Tension)',
    summaryBadge: '🛡️ 타임박싱 & 결과 탈피 과정 중심 제어',
    neuroCognitiveProfile: {
      brainMechanism: '노르에피네프린 및 편도체(Amygdala)의 과잉 흥분으로 교감신경계가 항진되어 시험 상황이나 난문 직면 시 전두엽 질식(Choking) 현상이 일어납니다.',
      learningBottleneck: '"틀리면 어쩌지"하는 걱정 때문에 쉬운 문제도 3~4번씩 다시 확인하며 지엽적인 것에 매달려 진도가 정체됩니다.',
      coreCognitiveStrength: '치밀한 꼼꼼함과 높은 위험 감지 능력을 지니고 있어, 불안만 통제하면 시험에서 계산 실수 0%의 무결점 풀이가 가능합니다.'
    },
    timeArchitecture: {
      recommendedCycle: '⏱️ 35분 타임어택 집중 + 7분 생체 이완 호흡',
      startRitual: '책상 앞 포스트잇에 "지금 나의 걱정 3가지"를 적어 서랍에 넣고 "이 고민은 10시 이후에 한다"고 봉인합니다.',
      inputOutputRatio: '인풋(개념) 30% : 아웃풋(시간제한 실전풀이) 70%'
    },
    subjectProtocols: {
      korean: {
        strategyTitle: '📖 시간 압박 적응 훈련 & 논리적 근거 1:1 매칭',
        actionPlan: '매일 아침 8시 40분 정각에 타이머를 켜고 45문항을 70분(실전보다 10분 단축)에 푸는 훈련을 지속합니다.',
        readingOrConceptMethod: '지문에서 주관적 느낌(Feel)으로 풀지 않고, 정답의 문장 위치에 밑줄을 긋는 객관적 근거 매칭을 습관화합니다.',
        problemSolvingMethod: '2개 선지가 헷갈릴 때는 지문으로 돌아가 핵심 서술어의 일치 여부만 단호하게 판별합니다.',
        killerTips: '1번부터 막힐 경우를 대비해 평소 [문학 -> 화작/언매 -> 독서] 순서로 푸는 나만의 비상 플랜 B를 체화해둡니다.'
      },
      math: {
        strategyTitle: '📐 손절의 미학 (3분 룰) & 확실한 점수 확보 루틴',
        actionPlan: '시험지를 받자마자 1~15번, 16~22번 중 내가 확실히 맞힐 수 있는 3점 및 쉬운 4점부터 동그라미 치며 풉니다.',
        readingOrConceptMethod: '문제의 발문에서 주어진 조건(자연수 n, 열린 구간 등)에 네모 박스를 치며 조건 누락 실수를 방지합니다.',
        problemSolvingMethod: '3분 동안 풀이 아이디어가 안 떠오르면 별표 치고 즉시 다음 문제로 넘어가는 손절 훈련을 합니다.',
        killerTips: '오답 노트에는 문제 풀이 전체가 아닌 "내가 놓친 발문 조건 1줄"만 기록하여 멘탈 타격을 최소화합니다.'
      },
      english: {
        strategyTitle: '🔤 키워드 추출 논리 독해 & 선택지 소거법',
        actionPlan: '한 문장에 얽매이지 않고 단락 전체의 중심 생각(Main Idea)을 빠르게 낚아채는 매크로 독해를 훈련합니다.',
        readingOrConceptMethod: '모르는 단어가 나와도 당황하지 않고 문맥상 + / - 뉘앙스로 치환하여 돌파합니다.',
        problemSolvingMethod: '빈칸 문장에 나오는 Not, Rarely 등 부정 표현에 형광펜을 쳐서 반대 답을 고르는 실수를 원천 차단합니다.',
        killerTips: '31~34번 고난도 빈칸은 1차 패스 후 장문 독해(41~45번)를 먼저 다 맞힌 뒤 차분하게 공략합니다.'
      },
      inquiry: {
        strategyTitle: '⚡ 헷갈리는 선지 OX 단권화 노트 & 타임 시뮬레이션',
        actionPlan: '기출 선지 중 평가원 특유의 낚시성 보기(ㄱ, ㄴ, ㄷ)만 따로 모아 OX 퀴즈 카드로 만듭니다.',
        readingOrConceptMethod: '개념을 눈으로 확인할 때 "왜 틀렸는지" 오답의 이유를 말로 소리 내어 반박해봅니다.',
        problemSolvingMethod: '30분 시험을 23분 컷으로 연습하여 실전 마킹 실수와 검산 시간을 7분 이상 확보합니다.',
        killerTips: '도표/자료 계산 문제는 여백에 식을 정갈하게 나열하여 검산 시 10초 만에 확인 가능하게 만듭니다.'
      }
    },
    concentrationEnvironment: {
      environmentSetup: '주변 시야가 차단되는 독서실형 책상과 소음 방지용 3M 귀마개 또는 ANC 헤드폰 사용을 권장합니다.',
      distractionBlocker: '남들과의 스터디 플래너 시간 비교 어플(열품타 등)을 과감히 삭제하고 오직 나만의 과제 달성률에 집중합니다.'
    },
    mentalSlumpCare: {
      emergencyReset: '가슴이 두근거릴 때 코로 2번 연속 빠르게 들이마시고 입으로 길게 한숨 쉬듯 내쉬는 생리적 한숨(Physiological Sigh)을 3회 실시합니다.',
      cognitiveReframing: '"불안하다는 것은 내가 그만큼 합격을 간절히 원하고 준비가 되었다는 증거다. 이 에너지를 집중으로 바꾼다."'
    },
    learningStyle: "나무보다 숲을 보는 매크로 학습: 타임박싱을 통해 한 문제 집착을 끊어내고 실전 시뮬레이션으로 불안을 성취감으로 전환합니다.",
    subjectStrategy: {
      korean: "매일 70분 타임어택 훈련과 객관적 근거 매칭으로 시험장 질식 현상을 방어합니다.",
      math: "3분 손절 룰과 조건 네모 박스 루틴으로 실수 없는 1~2등급 베이스를 구축합니다.",
      english: "키워드 논리 추출과 부정어 체크로 빈칸/순서 킬러의 함정을 완벽히 회피합니다.",
      inquiry: "기출 선지 OX 단권화 카드와 23분 컷 타임 리허설로 마킹 실수를 원천 차단합니다."
    },
    concentration: "**[집중 유지]** 과정 중심 목표(Process Goal) 설정으로 심리적 긴장도를 낮춰 계산 실수를 50% 이상 절감합니다.",
    mentalCare: "**[멘탈 케어]** 생리적 한숨 호흡법과 걱정 분리 보관함 기법으로 시험장 클러치 능력을 완성합니다."
  },

  [CareType.STRESS_OVERLOAD]: {
    careTypeName: '스트레스 과부하 (Stress Overload)',
    summaryBadge: '🧹 인지 부하 제어 & 싱글 태스킹 단순화',
    neuroCognitiveProfile: {
      brainMechanism: '만성 코르티솔 노출로 해마의 수상돌기 위축 및 전두엽 억제 제어력이 떨어져 정보 과밀 시 인지 회로가 마비됩니다.',
      learningBottleneck: '책상에 여러 권의 책을 쌓아두고 공부하면 시각적 스트레스로 뇌가 지쳐 30분 만에 두통과 산만함이 찾아옵니다.',
      coreCognitiveStrength: '위기 상황에서의 단기 폭발적 집중력(Sprint Focus)이 뛰어나므로, 과제를 단순화해주면 놀라운 진도 속도를 냅니다.'
    },
    timeArchitecture: {
      recommendedCycle: '🧹 25분 싱글태스킹 + 5분 완전 무자극 멍때리기',
      startRitual: '책상 위 모든 책을 바닥에 내리고 지금 25분 동안 풀 책 단 1권, 펜 1자루만 올려둡니다.',
      inputOutputRatio: '인풋 20% : 아웃풋 80%'
    },
    subjectProtocols: {
      korean: {
        strategyTitle: '📖 정보량 압축 & 사실 일치 중심의 멘탈 방어 독해',
        actionPlan: '복잡한 인문 철학 지문보다 과학/기술/경제 등 정보의 인과관계가 명확한 지문부터 해결합니다.',
        readingOrConceptMethod: '지문 옆 여백에 각 문단의 핵심 키워드 2개만 화살표(A → B)로 단순화하여 필기합니다.',
        problemSolvingMethod: '심화 추론 문제에 매달리지 않고, 사실적 일치/불일치 문항을 빠르고 정확하게 100% 확보합니다.',
        killerTips: '지문이 길어 뇌가 멈출 때는 문단이 바뀔 때마다 펜을 책상에 톡 치며 뇌를 깨우는 리듬을 탑니다.'
      },
      math: {
        strategyTitle: '📐 성공 경험 누적을 위한 오답 리마인드 & 유형 굳히기',
        actionPlan: '스트레스가 높을 때는 신유형 N제를 풀지 말고, 검증된 기출문제집의 기출 분석을 재확인합니다.',
        readingOrConceptMethod: '개념 공식의 핵심 아이디어를 1장의 요약 치트시트(Cheat Sheet)로 만들어 옆에 두고 풉니다.',
        problemSolvingMethod: '내가 과거에 맞혔던 4점 문제들을 다시 풀며 "나도 풀 수 있다"는 뇌의 자기 통제감을 복구합니다.',
        killerTips: '계산이 꼬였을 때는 지우개로 벅벅 지우지 말고, 줄을 긋고 깨끗한 여백에 새롭게 번호를 매겨 다시 풉니다.'
      },
      english: {
        strategyTitle: '🔤 구문 단순화 & EBS 핵심 연계 어휘 집중',
        actionPlan: '복잡한 문법 구문 분석에 집착하지 말고, 주어-동사-목적어의 뼈대만 빠르게 짚고 넘어갑니다.',
        readingOrConceptMethod: '문장이 4줄 이상 길어지면 관계사/수식어구에 괄호 ( )를 쳐서 문장 구조를 강제로 단순화합니다.',
        problemSolvingMethod: '주제/제목 문항에서 가장 많이 반복되는 핵심 명사(Core Noun)를 찾아 정답 선지와 연결합니다.',
        killerTips: '단어 암기는 하루 20개씩 3회(아침, 점심, 저녁)로 쪼개어 뇌의 부담을 0으로 만듭니다.'
      },
      inquiry: {
        strategyTitle: '⚡ 핵심 개념도 1장 요약 & 킬러 도표 단순화',
        actionPlan: '여러 권의 참고서를 보지 말고 단 1권의 메인 교재에 모든 필기를 몰아넣는 단권화에 집중합니다.',
        readingOrConceptMethod: '개념 흐름을 나만의 도식과 기호로 압축하여 시각적 피로도를 낮춥니다.',
        problemSolvingMethod: '기출 선지에서 틀린 단어에 X표를 치고 바른 단어를 적어두는 오답 교정 훈련을 합니다.',
        killerTips: '도표 문제는 복잡한 숫자를 대략적인 정수(어림수)로 치환하여 계산 스트레스를 반감시킵니다.'
      }
    },
    concentrationEnvironment: {
      environmentSetup: '책상 위 미니멀리즘 유지, 자연 채광이 잘 드는 창가 좌석, 백색소음기(빗소리/파도소리) 활용.',
      distractionBlocker: '공부 중 떠오르는 잡생각이나 해야 할 일은 포스트잇에 적고 즉시 시야 밖으로 넘깁니다.'
    },
    mentalSlumpCare: {
      emergencyReset: '하루 10분 창밖 먼 산이나 하늘을 보며 멍때리기(Brain Rest)로 뇌 림프계(Glymphatic) 노폐물 청소를 돕습니다.',
      cognitiveReframing: '"수능은 100문제가 아니라, 지금 내 눈앞의 1문제를 100번 푸는 것이다. 하나씩만 깬다."'
    },
    learningStyle: "싱글 태스킹(Single-tasking) 단순화: 한 번에 한 과목, 한 권의 책만 책상에 두고 뇌의 처리 부하를 최소화합니다.",
    subjectStrategy: {
      korean: "키워드 1줄 화살표 압축 독해와 사실 일치 선지 확보로 뇌 피로를 방지합니다.",
      math: "과거 성공 기출 재풀이와 1장 치트시트로 자기 통제감을 복구합니다.",
      english: "문장 뼈대 괄호 치기 독해와 20개 분할 암기로 단기 기억 과부하를 막습니다.",
      inquiry: "1권 단권화 몰입과 어림수 계산법으로 인지 에너지 소모를 줄입니다."
    },
    concentration: "**[집중 유지]** 책상 위 1권 원칙과 백색소음으로 잡념 전환율을 1/3 이하로 줄입니다.",
    mentalCare: "**[멘탈 케어]** 하루 10분 뇌 휴식(Brain Rest)과 하나씩 깨는 싱글 마인드셋으로 평정심을 유지합니다."
  },

  [CareType.SLEEP]: {
    careTypeName: '수면 장애형 (Sleep Dysfunction)',
    summaryBadge: '🌅 기억 응고화 & 아침 골든타임 인출 복습',
    neuroCognitiveProfile: {
      brainMechanism: '서파 수면(N3) 및 REM 수면 부족으로 낮 동안 해마에 임시 저장된 기억이 대뇌피질로 전이(Memory Consolidation)되지 못하고 휘발되는 상태입니다.',
      learningBottleneck: '오후 1시~4시 사이 심각한 수면 발작성 졸음과 뇌 회전 저하로 시간당 학습량이 70% 이상 급락합니다.',
      coreCognitiveStrength: '기상 직후 3시간 동안은 뇌의 저장 공간이 일시적으로 리셋되어 최고 수준의 암기 흡수력을 발휘할 수 있습니다.'
    },
    timeArchitecture: {
      recommendedCycle: '🌅 45분 서서 공부 + 15분 카페인 냅(Caffeine Nap) + 자기 전 20분 기억 응고화',
      startRitual: '기상 직후 찬물 세안 후 밝은 조명을 켜고 오늘 공부할 핵심 단어 10개를 3분간 소리 내어 읽습니다.',
      inputOutputRatio: '인풋 35% : 아웃풋 65%'
    },
    subjectProtocols: {
      korean: {
        strategyTitle: '📖 아침 뇌 예열 낭독 & 소리 내어 읽는 비문학 독해',
        actionPlan: '기상 직후 가장 맑은 아침 시간에 국어 비문학 분석을 최우선으로 배치합니다.',
        readingOrConceptMethod: '졸음이 올 때는 눈으로만 읽지 말고, 입술을 웅얼거리며 소리 내어 지문을 읽는 낭독 독해를 합니다.',
        problemSolvingMethod: '문단마다 핵심 요약문을 지문 옆에 직접 손글씨로 적어 졸음을 물리적으로 차단합니다.',
        killerTips: '실전 수능 1교시(08:40) 리듬에 맞춰 아침 7시 이전 기상 루틴을 2주간 강제 고정합니다.'
      },
      math: {
        strategyTitle: '📐 손을 멈추지 않는 백지 연산 & 스탠딩 데스크 활용',
        actionPlan: '나른한 오후 시간대에는 서서 공부하는 스탠딩 데스크로 이동하여 수학 문제 풀이를 진행합니다.',
        readingOrConceptMethod: '개념 유도 공식을 큰 스케치북에 마커로 큼직하게 쓰며 시각/촉각 자극을 극대화합니다.',
        problemSolvingMethod: '문제가 안 풀릴 때 멍하니 고민하지 말고, 3분 내에 해설지의 핵심 발상(Idea) 첫 줄만 보고 다시 손을 움직입니다.',
        killerTips: '오답 정리는 직접 가위로 오려 붙이며 손을 바쁘게 움직여 뇌 각성도를 유지합니다.'
      },
      english: {
        strategyTitle: '🔤 딕테이션(받아쓰기) 연계 & 자기 전 30분 단어 고정',
        actionPlan: '취침 전 30분을 "황금 암기 시간"으로 설정하여 영단어 50개를 훑어보고 즉시 잠자리에 듭니다.',
        readingOrConceptMethod: '수면 중 뇌가 방금 본 단어를 장기 기억으로 저장하므로, 자기 직전 스마트폰 대신 단어장만 봅니다.',
        problemSolvingMethod: '듣기 평가 시 수동적으로 듣지 말고 중요 연어(Collocation)를 빈칸에 받아적으며 풉니다.',
        killerTips: '점심 식후 영어 시간(13:10) 졸음을 방지하기 위해 점심은 저탄수화물 고단백 식단을 유지합니다.'
      },
      inquiry: {
        strategyTitle: '⚡ 아침 백지 인출 & 5분 주기 회상 카드',
        actionPlan: '어젯밤 자기 전에 외운 탐구 개념을 아침에 일어나자마자 5분간 백지에 적어보는 모닝 인출을 실시합니다.',
        readingOrConceptMethod: '기억이 휘발되기 전 24시간 이내 3회(아침, 점심, 저녁) 누적 복습을 진행합니다.',
        problemSolvingMethod: '기출 킬러 그래프를 손으로 직접 모눈종이에 그려보며 변수 관계를 체화합니다.',
        killerTips: '자주 까먹는 암기 사항은 화장실 거울과 침대 옆에 붙여두고 무의식적으로 노출시킵니다.'
      }
    },
    concentrationEnvironment: {
      environmentSetup: '스탠딩 데스크 필수 구비, 시원한 실내 온도(20~22℃), 강력한 백색 LED 조명 활용.',
      distractionBlocker: '침대와 책상 공간의 완전한 분리. 침대에서는 공부나 스마트폰을 절대 하지 않고 수면 전용 공간으로 격리.'
    },
    mentalSlumpCare: {
      emergencyReset: '점심 직후 아메리카노 반 잔을 마시고 즉시 15~20분간 알람을 맞추고 자는 카페인 냅(Caffeine Nap)을 실행합니다.',
      cognitiveReframing: '"잠을 줄여서 공부하는 것은 밑 빠진 독에 물 붓기다. 6시간 푹 자는 것이 2시간 더 공부하는 것보다 점수가 높다."'
    },
    learningStyle: "기억 응고화 & 인출 중심: 자기 전 30분 단어/개념 입력 -> 수면 중 장기 기억 고정 -> 기상 직후 5분 백지 인출 루틴을 가동합니다.",
    subjectStrategy: {
      korean: "아침 골든타임 비문학 낭독 독해로 1교시 실전 뇌 각성을 완성합니다.",
      math: "오후 스탠딩 데스크 백지 연산과 빠른 힌트 참조로 졸음을 차단합니다.",
      english: "취침 직전 30분 단어 고정 암기와 점심 식단 조절로 오후 졸음을 방어합니다.",
      inquiry: "모닝 5분 백지 인출과 누적 3회독 카드로 기억 휘발을 100% 차단합니다."
    },
    concentration: "**[집중 유지]** 오후 20분 전략적 카페인 냅으로 4시간의 고밀도 몰입 시간을 추가 확보합니다.",
    mentalCare: "**[멘탈 케어]** 수면 강박을 버리고 '누워만 있어도 뇌의 80%는 쉰다'는 편안한 마음으로 입면합니다."
  },

  [CareType.LOW_ENERGY]: {
    careTypeName: '기력 저하 / 무기력형 (Low-Energy Fatigue)',
    summaryBadge: '🎮 퀘스트 게임화 & 마이크로 보상 도파민',
    neuroCognitiveProfile: {
      brainMechanism: '중뇌 복측피개구역(VTA)의 도파민 기초 분비율 저하 및 부교감신경의 무기력 우세로 인해 착석 동기 에너지가 고갈된 상태입니다.',
      learningBottleneck: '공부를 시작하기까지 1~2시간 이상 멍하니 휴대폰을 보거나 침대에 누워 시동 자체가 안 걸립니다.',
      coreCognitiveStrength: '일단 재미나 경쟁 요소로 도파민 시동이 걸리면, 잡념 없이 우직하게 한 우물을 파는 깊은 흡수력을 발휘합니다.'
    },
    timeArchitecture: {
      recommendedCycle: '🎮 20분 퀘스트 몰입 + 3분 도파민 보상 (게임화 스터디)',
      startRitual: '책상 정리하기, 물 한 잔 마시기 등 "10초짜리 초소형 퀘스트" 3개를 연속 클리어하며 뇌에 도파민을 공급합니다.',
      inputOutputRatio: '인풋 40% : 아웃풋 60%'
    },
    subjectProtocols: {
      korean: {
        strategyTitle: '📖 흥미 유발 테마 독해 & 좋아하는 문학 소설 중심',
        actionPlan: '가장 관심 있는 분야(영화, 우주, 뇌과학 등)의 흥미로운 비문학 지문부터 골라 푸는 뷔페식 공부를 합니다.',
        readingOrConceptMethod: '지문 속 인물의 갈등 관계를 웹툰 보듯 상상하며 문학 작품에 감정 이입을 해봅니다.',
        problemSolvingMethod: '친구와 함께 문제 내기 배틀을 하거나 정답 맞히기 점수 내기를 통해 승부욕을 자극합니다.',
        killerTips: '지루한 문법 이론은 유튜브의 3분짜리 짧고 재미있는 클립 영상으로 가볍게 시작합니다.'
      },
      math: {
        strategyTitle: '📐 내가 일타강사가 되는 티칭(Teaching) 학습법',
        actionPlan: '문제를 풀고 나서 인형이나 스마트폰 카메라를 보고 선생님처럼 2분간 풀이법을 설명하는 영상을 찍습니다.',
        readingOrConceptMethod: '알록달록한 4색 볼펜과 형광펜으로 예쁜 풀이 노트를 만들며 시각적 재미를 부여합니다.',
        problemSolvingMethod: '타이머로 "1문제 3분 컷" 챌린지를 걸고 성공할 때마다 플래너에 스티커를 붙입니다.',
        killerTips: '기출 킬러 문제는 혼자 끙끙대지 말고 해설 강의를 배속으로 보며 감탄하는 것으로 시작합니다.'
      },
      english: {
        strategyTitle: '🔤 팝송/미드 쉐도잉 & 영어 퀴즈 어플 활용',
        actionPlan: '단어장 책만 보면 졸리므로, Quizlet이나 암기고래 같은 스마트폰 퀴즈 어플로 게임하듯 외웁니다.',
        readingOrConceptMethod: '지문 내용이 재미있는 유머 에피소드나 동물 이야기 지문부터 먼저 풀어 각성도를 올립니다.',
        problemSolvingMethod: '영어 문장을 한국어로 번역하기보다 원어민 억양을 흉내 내며 리듬감 있게 읽습니다.',
        killerTips: '듣기 평가는 1.2배속으로 들으며 귀를 팽팽하게 긴장시키는 게임 모드로 진행합니다.'
      },
      inquiry: {
        strategyTitle: '⚡ 핵심 암기 카드 대결 & 스토리텔링 정리',
        actionPlan: '친구와 스터디를 결성하여 매일 서로 암기 카드 5개씩 질문하고 맞히는 핑퐁 퀴즈를 합니다.',
        readingOrConceptMethod: '역사나 과학의 사건 인과관계를 한 편의 막장 드라마 스토리처럼 재미있게 엮어 외웁니다.',
        problemSolvingMethod: '단원별 100점 달성 시 내가 좋아하는 간식을 선물하는 보상 시스템을 만듭니다.',
        killerTips: '어려운 도표는 색연필로 직접 색칠하며 뇌의 우뇌 영역(시각/직관)을 강하게 자극합니다.'
      }
    },
    concentrationEnvironment: {
      environmentSetup: '오픈형 스터디 카페나 도서관 등 주변 사람들의 공부 열기가 느껴지는 공간을 활용하여 거울 뉴런을 자극합니다.',
      distractionBlocker: '공부 20분 성공할 때마다 좋아하는 음악 1곡 듣기 등 즉각적인 마이크로 보상을 설계합니다.'
    },
    mentalSlumpCare: {
      emergencyReset: '무기력감이 극심할 땐 제자리 점핑 20회나 팔굽혀펴기 10회로 혈류를 강제 펌핑합니다.',
      cognitiveReframing: '"시작이 반이다. 1문제만 풀고 그만둬도 안 푼 것보다 100배 위대하다."'
    },
    learningStyle: "게임화(Gamification) 전략: 20분 퀘스트 완수와 즉각적인 마이크로 보상(경험치/스티커)으로 도파민 회로를 활성화합니다.",
    subjectStrategy: {
      korean: "흥미 있는 테마 지문 선별과 웹툰식 문학 몰입으로 거부감을 해소합니다.",
      math: "내가 일타강사가 되는 2분 티칭 학습과 타이머 챌린지로 뇌를 깨웁니다.",
      english: "스마트폰 퀴즈 어플 암기와 1.2배속 리듬 독해로 지루함을 타파합니다.",
      inquiry: "친구와의 암기 배틀 및 스토리텔링 구조화로 암기 지속력을 3배 높입니다."
    },
    concentration: "**[집중 유지]** 스터디 카페의 오픈 환경과 동적 신체 자극으로 오후 졸음을 80% 이상 차단합니다.",
    mentalCare: "**[멘탈 케어]** '1문제 풀기도 대단한 승리'라는 자기효능감 회복으로 장기 슬럼프를 탈출합니다."
  },

  [CareType.DEPRESSION_AMOTIVATION]: {
    careTypeName: '우울-무동기형 (Depression-Amotivation)',
    summaryBadge: '🤝 소셜 러닝 & 감정 분리 힐링 루틴',
    neuroCognitiveProfile: {
      brainMechanism: '세로토닌 및 도파민 신경전달물질 고갈로 뇌의 보상 회로가 무반응 상태이며, 디폴트 모드 네트워크(DMN)의 과항진으로 부정적 반추(Rumination)가 지속됩니다.',
      learningBottleneck: '"공부해서 뭐하나, 어차피 안 될 텐데"라는 비관적 사고가 전두엽을 장악해 책상 앞 착석 자체를 거부합니다.',
      coreCognitiveStrength: '깊은 정서적 통찰력과 섬세한 공감 능력을 보유하고 있어, 인문/문학 및 개념의 근본적 의미를 꿰뚫는 힘이 탁월합니다.'
    },
    timeArchitecture: {
      recommendedCycle: '🤝 25분 캠스터디 동행 + 5분 햇빛 스트레칭 (감정 분리 루틴)',
      startRitual: '창문을 활짝 열고 햇볕을 3분간 쬐며 "공부는 감정과 상관없이 밥 먹듯 하는 일상의 루틴이다"라고 선언합니다.',
      inputOutputRatio: '인풋 50% : 아웃풋 50%'
    },
    subjectProtocols: {
      korean: {
        strategyTitle: '📖 문학 텍스트를 통한 정서 치유 & 명문장 필사 독해',
        actionPlan: '우울할 때 감정이입이 잘되는 특성을 살려 현대시, 고전시가, 수필 등 아름다운 문학 작품부터 읽습니다.',
        readingOrConceptMethod: '지문에서 마음에 와닿는 문장 1줄을 노트에 정갈하게 필사하며 마음을 안정시킵니다.',
        problemSolvingMethod: '문학 작품 속 화자의 정서(슬픔, 극복, 체념)를 깊이 분석하며 문제 정답률을 올립니다.',
        killerTips: '비문학 독서는 과학/기술 대신 인문학, 예술, 심리학 제재부터 접근하여 지적 위안을 얻습니다.'
      },
      math: {
        strategyTitle: '📐 답이 딱 떨어지는 명쾌한 연산 & 논리 방파제',
        actionPlan: '복잡한 사고가 필요한 킬러 문제 대신, 명확한 공식으로 답이 도출되는 유형별 기본 문제를 풉니다.',
        readingOrConceptMethod: '수학의 규칙성과 논리성은 복잡한 감정의 파도를 잠재우는 최고의 방파제가 됩니다.',
        problemSolvingMethod: '풀이 과정을 줄 맞춰 반듯하게 적으며 어지러운 머릿속을 시각적으로 정돈합니다.',
        killerTips: '오답이 나와도 실망하지 않고 "이것은 수학적 오류일 뿐 내 가치와 무관하다"고 분리합니다.'
      },
      english: {
        strategyTitle: '🔤 긍정 에세이/TED 강연 독해 & 낭독 힐링',
        actionPlan: '희망과 회복탄력성을 다룬 영어 명언, TED 강연 스크립트, 감동적인 에세이 지문을 선별해 독해합니다.',
        readingOrConceptMethod: '긍정적인 영어 문장을 소리 내어 낭독하며 뇌에 밝은 언어 자극을 입력합니다.',
        problemSolvingMethod: '단어 암기는 하루 15개씩 적은 분량으로 확실히 외워 매일 만점 시험지를 만듭니다.',
        killerTips: '선생님이나 멘토에게 칭찬받을 수 있는 과제를 먼저 제출하여 긍정적 피드백을 받습니다.'
      },
      inquiry: {
        strategyTitle: '⚡ 친구와 함께하는 백지 노트 공유 & 멘토링 스터디',
        actionPlan: '혼자 방에 틀어박히지 않고, 신뢰하는 친구나 멘토와 공부 진도를 매일 공유하는 소셜 러닝을 합니다.',
        readingOrConceptMethod: '교과서 개념을 누군가에게 부드럽게 설명해주는 방식으로 공부합니다.',
        problemSolvingMethod: '기출문제를 풀고 서로 채점해주며 따뜻한 응원의 한마디를 나눕니다.',
        killerTips: '공부 플래너 맨 위에 "오늘 하루도 버텨낸 나 자신을 칭찬해"라는 격려 문구를 적어둡니다.'
      }
    },
    concentrationEnvironment: {
      environmentSetup: '햇빛이 가득 드는 창가 책상, 밝고 따뜻한 노란 조명, 실내 공기정화 식물(초록색) 배치.',
      distractionBlocker: '부정적 감정을 유발하는 SNS, 인터넷 커뮤니티를 완벽히 차단하고 열품타/캠스터디만 유지.'
    },
    mentalSlumpCare: {
      emergencyReset: '하루 20분 야외 산책으로 세로토닌 합성을 촉진하고 뇌에 신선한 산소를 공급합니다.',
      cognitiveReframing: '"나는 우울한 사람이 아니다. 지금 내 마음에 우울이라는 구름이 잠시 지나갈 뿐이다."'
    },
    learningStyle: "소셜 러닝(Social Learning) & 감정 분리: 혼자만의 고립을 피하고 함께 공부하는 연대감 속에서 밥 먹듯 루틴을 이어갑니다.",
    subjectStrategy: {
      korean: "문학 작품 정서 치유 독해와 명문장 필사로 마음을 안정시키고 독해력을 다집니다.",
      math: "명쾌한 기본 유형 연산으로 감정의 소용돌이를 잠재우는 논리 방파제를 구축합니다.",
      english: "긍정적 텍스트 낭독과 매일 15개 단어 만점 달성으로 작은 성공을 누적합니다.",
      inquiry: "친구와의 진도 공유 및 멘토링 피드백으로 학업 동기를 지속적으로 수혈받습니다."
    },
    concentration: "**[집중 유지]** 창가 햇빛 학습과 야외 20분 산책으로 세로토닌을 올려 인지 명료함을 회복합니다.",
    mentalCare: "**[멘탈 케어]** 감정과 공부의 분리 훈련으로 인생의 어떤 파도에도 무너지지 않는 내면을 만듭니다."
  },

  [CareType.BRAIN_FATIGUE]: {
    careTypeName: '뇌피로 집중곤란 (Brain Fatigue)',
    summaryBadge: '🍃 디지털 디톡스 & 아날로그 필기 정렬',
    neuroCognitiveProfile: {
      brainMechanism: '과도한 미디어/인강 시청으로 시각 피질 및 전두엽에 아데노신이 과축적되고 인지 피로와 졸음 서파가 비정상적으로 치솟은 상태입니다.',
      learningBottleneck: '글을 읽어도 머릿속에 남지 않고 튕겨 나가는 브레인 포그(Brain Fog)와 난독 현상이 발생합니다.',
      coreCognitiveStrength: '디지털 자극을 끄고 아날로그 종이책으로 전환하면 급속도로 정보 정리(Sorting) 기능이 살아납니다.'
    },
    timeArchitecture: {
      recommendedCycle: '🍃 30분 아날로그 집중 + 5분 안구 온열 찜질 (디톡스 사이클)',
      startRitual: '스마트폰을 완전히 끄고 종이책과 파란색 볼펜만 책상에 두고 3회 심호흡을 합니다.',
      inputOutputRatio: '인풋(강의) 10% : 아웃풋(종이책 자습) 90%'
    },
    subjectProtocols: {
      korean: {
        strategyTitle: '📖 지문 구조도 그리기 & 손으로 쓰는 아날로그 독해',
        actionPlan: '눈으로만 읽지 말고, 펜으로 문단마다 접속사(세모), 핵심어(동그라미), 대립항(네모)을 표시합니다.',
        readingOrConceptMethod: '지문 옆 빈 공간에 지문의 전체 논리 구조도를 3단계 박스로 직접 그립니다.',
        problemSolvingMethod: '인터넷 강의 시청 시간을 절반으로 줄이고, 기출문제집 종이책을 직접 분석하는 자습 비중을 2배 늘립니다.',
        killerTips: '지문이 튕길 때는 지문 1문단을 백지에 그대로 정갈하게 베껴 쓰며 뇌의 초점을 맞춥니다.'
      },
      math: {
        strategyTitle: '📐 줄 맞춤 풀이 노트 & 오답 가위질 아날로그 정리',
        actionPlan: '모눈종이나 줄 노트를 준비하여 풀이 과정을 1번부터 끝까지 줄을 맞춰 깔끔하게 정돈합니다.',
        readingOrConceptMethod: '정리된 시각 정보는 뇌의 정보 처리 과부하를 50% 이상 즉각적으로 줄여줍니다.',
        problemSolvingMethod: '틀린 문제는 태블릿에 저장하지 말고, 직접 종이 시험지를 가위로 오려 오답 공책에 풀로 붙입니다.',
        killerTips: '손끝의 촉각 자극이 뇌 전두엽을 자극하여 킬러 문제의 직관적 통찰력을 깨웁니다.'
      },
      english: {
        strategyTitle: '🔤 종이 단어장 직접 제작 & 손가락 가림 독해',
        actionPlan: '스마트폰 앱 대신 A4 용지를 반으로 접어 왼쪽엔 영단어, 오른쪽엔 뜻을 손으로 직접 적습니다.',
        readingOrConceptMethod: '독해할 때 손가락이나 자(Ruler)로 다음 문장을 가려가며 한 문장씩 온전히 처리합니다.',
        problemSolvingMethod: '동영상 해설 강의 대신 종이 해설지의 구문 분석표를 차분히 읽으며 이해합니다.',
        killerTips: '시험 직전에는 태블릿 화면을 보지 말고 종이로 인쇄된 요약본만 봅니다.'
      },
      inquiry: {
        strategyTitle: '⚡ 색연필 개념 지도 작성 & 백지 마인드맵',
        actionPlan: '인강을 멈추고 교과서와 기출문제집만 펴서 나만의 컬러 개념 지도를 그립니다.',
        readingOrConceptMethod: '대단원-중단원-소단원의 위계 구조를 마인드맵으로 직접 그리며 머릿속 서랍을 정리합니다.',
        problemSolvingMethod: '기출 선지의 함정 패턴을 빨간 펜으로 종이 노트에 직접 필기합니다.',
        killerTips: '뇌가 멍할 때는 10분간 눈을 감고 방금 정리한 마인드맵을 머릿속으로 시각화(Visualization)합니다.'
      }
    },
    concentrationEnvironment: {
      environmentSetup: '전자기기가 일절 없는 아날로그 독서실, 온습도가 쾌적한 공간, 눈 피로를 줄이는 그린 펠트 데스크 매트.',
      distractionBlocker: '스마트폰은 전원을 꺼서 가방 깊숙이 보관하고, 태블릿 PC 인강 시청 시간은 하루 최대 2시간으로 엄격히 제한.'
    },
    mentalSlumpCare: {
      emergencyReset: '3분 멍때리기 및 안구 찜질로 시각 피질의 정보 입력을 0으로 만들어 뇌 피로를 즉각 리셋합니다.',
      cognitiveReframing: '"느리게 가는 것이 가장 빠른 길이다. 디지털 자극을 비워내면 내 뇌의 원래 명석함이 돌아온다."'
    },
    learningStyle: "아날로그 전환(Analog Transition) & 뇌 휴식: 전자기기를 차단하고 손으로 직접 쓰고 그리는 촉각/시각 자극으로 뇌의 브레인 포그를 걷어냅니다.",
    subjectStrategy: {
      korean: "지문 3단계 구조도 그리기와 손글씨 독해로 정보가 튕기는 현상을 완벽 차단합니다.",
      math: "모눈종이 줄 맞춤 풀이와 가위질 오답 정리로 뇌의 정보 처리 과부하를 해소합니다.",
      english: "직접 만드는 종이 단어장과 손가락 가림 독해로 한 문장씩 온전히 처리합니다.",
      inquiry: "색연필 개념 지도와 백지 마인드맵으로 헝클어진 탐구 개념 서랍을 정리합니다."
    },
    concentration: "**[집중 유지]** 전자기기 완전 배제와 30분 집중 + 5분 암흑 휴식으로 시각 피질을 보호합니다.",
    mentalCare: "**[멘탈 케어]** 3분 멍때리기와 주말 숲 산책으로 뇌에 축적된 아데노신 피로 물질을 청소합니다."
  },

  [CareType.HYPERSENSITIVE]: {
    careTypeName: '과민성 감각예민 (Hypersensitive Learning)',
    summaryBadge: '🛡️ 완벽 환경 통제(벙커) & 감각 차단 초집중',
    neuroCognitiveProfile: {
      brainMechanism: '감각 피질(시각/청각)의 역치가 매우 낮아 미세한 소음, 빛, 온도 변화에도 편도체가 즉각 반응하며 뇌 에너지를 급격히 소모하는 상태입니다.',
      learningBottleneck: '주변의 작은 소음(볼펜 딸깍, 발소리)이나 시야의 움직임에 집중이 끊기고 신경이 곤두서 공부 흐름이 쪼개집니다.',
      coreCognitiveStrength: '자극이 완벽히 통제된 환경에서는 미세한 논리적 오류와 디테일을 누구보다 예리하게 포착하는 초집중 감각을 발휘합니다.'
    },
    timeArchitecture: {
      recommendedCycle: '🛡️ 40분 무소음 딥포커스 + 5분 암실 감각 차단 휴식',
      startRitual: '노이즈 캔슬링 착용 -> 시야 가림막 세팅 -> 책상 위 자극원 100% 제거 후 시작.',
      inputOutputRatio: '인풋 30% : 아웃풋 70%'
    },
    subjectProtocols: {
      korean: {
        strategyTitle: '📖 미세 뉘앙스 포착 독해 & 백색소음 실전 훈련',
        actionPlan: '인물의 미세한 심리 변화와 비문학의 대립항 전개를 예리하게 분석하는 정밀 독해를 실시합니다.',
        readingOrConceptMethod: '주변 소음에 흔들리지 않도록 귀마개를 착용하고 지문의 접속사와 논리 전환점을 꼼꼼히 체크합니다.',
        problemSolvingMethod: '문학 선지의 애매한 단어 뉘앙스를 사전적 의미와 문맥으로 정밀 소거합니다.',
        killerTips: '실전 수능장의 백색소음에 대비하여 주 1회 잔잔한 클래식/백색소음 환경에서 모의고사를 훈련합니다.'
      },
      math: {
        strategyTitle: '📐 완벽 검산 루틴 & 오차 제로 정밀 풀이',
        actionPlan: '계산 실수에 대한 불안감을 없애기 위해 문제 풀이 영역을 4분할하여 깔끔하게 정리합니다.',
        readingOrConceptMethod: '문제의 조건(자연수, 정수, 범위 조건)을 형광펜으로 꼼꼼히 체크하여 조건 누락을 방지합니다.',
        problemSolvingMethod: '풀이 3단계마다 중간 계산을 검증하는 10초 인터벌 체크 루틴을 적용합니다.',
        killerTips: '킬러 문항의 숨은 조건과 특수 케이스를 섬세하게 분류하여 완벽한 정답을 도출합니다.'
      },
      english: {
        strategyTitle: '🔤 청각 노이즈 차단 독해 & 구문 완벽 장악',
        actionPlan: '주변 환경을 완벽히 정숙하게 만든 후 고난도 구문과 빈칸 추론을 정밀 타격합니다.',
        readingOrConceptMethod: '문장 간의 논리적 단절과 역접 연결사를 예민하게 포착하여 글의 흐름을 꿰뚫습니다.',
        problemSolvingMethod: '매력적 오답 선지의 미세한 과장/왜곡을 정확히 짚어내어 소거합니다.',
        killerTips: '듣기 평가 시 볼륨을 최적화하고 이어플러그와 헤드폰을 상황에 맞게 적극 활용합니다.'
      },
      inquiry: {
        strategyTitle: '⚡ 지엽 개념 정밀 대조 & 함정 선지 사전 발굴',
        actionPlan: '교과서와 수능특강의 각주와 구석진 지엽 개념까지 꼼꼼히 대조하여 단권화합니다.',
        readingOrConceptMethod: '도표와 그래프의 축 레이블, 단위, 예외 조건을 철저히 확인합니다.',
        problemSolvingMethod: '출제자의 함정 선지 패턴을 별도 포스트잇에 정리하여 함정 감지 레이더를 구축합니다.',
        killerTips: '남들이 실수로 틀리는 지엽 문항을 완벽히 맞혀 확실한 1등급 격차를 만듭니다.'
      }
    },
    concentrationEnvironment: {
      environmentSetup: '노이즈 캔슬링 이어폰/귀마개, 3면 독서실 칸막이, 눈부심 없는 간접 조명, 편안한 복장.',
      distractionBlocker: '시야 내 움직이는 물체 완전 차단, 스마트폰 및 알림 기기 전면 격리.'
    },
    mentalSlumpCare: {
      emergencyReset: '자극 과부하 시 어두운 방에서 눈가리개를 하고 5분간 완벽한 고요 속에서 감각 리셋.',
      cognitiveReframing: '"나의 예민함은 결함이 아니라, 남들이 못 보는 디테일을 잡아내는 최상위권의 슈퍼 파워다."'
    },
    learningStyle: "완벽 환경 통제(Total Control) & 초집중 몰입: 외부 자극 변수를 완벽히 차단한 나만의 벙커에서 예민한 인지 감각을 폭발적 몰입력으로 전환합니다.",
    subjectStrategy: {
      korean: "미세 뉘앙스 포착 독해와 백색소음 실전 훈련으로 흔들리지 않는 1교시를 만듭니다.",
      math: "4분할 정갈한 풀이와 조건 형광펜 체크로 계산 실수를 원천 봉쇄합니다.",
      english: "노이즈 차단 환경에서 고난도 빈칸 논리 연결사를 정밀 타격합니다.",
      inquiry: "지엽 개념 정밀 대조와 함정 선지 발굴로 만점 방어막을 구축합니다."
    },
    concentration: "**[집중 유지]** 노이즈 캔슬링과 시야 칸막이로 감각 자극 소모를 0으로 만들어 순수 몰입 시간을 2배로 확장합니다.",
    mentalCare: "**[멘탈 케어]** 예민함을 최상위권의 섬세한 무기로 재정의하고 감각 휴식 명상으로 뇌를 회복합니다."
  },

  [CareType.ATTENTION_DEFICIT]: {
    careTypeName: '주의력 산만형 (Attention Deficit)',
    summaryBadge: '⚡ 15분 고속 전환 인터리빙 & 딴짓 노트 방어',
    neuroCognitiveProfile: {
      brainMechanism: '도파민 기본 기저 농도가 낮아 지속적인 단일 자극에 금방 지루함을 느끼고 새로운 자극을 찾아 뇌가 방황하는 상태입니다.',
      learningBottleneck: '한자리에 30분 이상 가만히 앉아 있기 힘들고, 문제 풀이 중간에 딴생각으로 쉽게 이탈합니다.',
      coreCognitiveStrength: '자극의 속도감이 주어지면 남들보다 2~3배 빠른 순발력과 직관적 문제 해결 능력을 폭발시킵니다.'
    },
    timeArchitecture: {
      recommendedCycle: '⚡ 15분 스프린트 + 3분 딴짓/스트레칭 (초단기 인터벌)',
      startRitual: '스톱워치 15분 세팅 -> "15분 안에 5문제만 끝내자" 카운트다운 스타트.',
      inputOutputRatio: '인풋 20% : 아웃풋 80%'
    },
    subjectProtocols: {
      korean: {
        strategyTitle: '📖 문단별 헤드라인 달기 & 스피드 낙서 독해',
        actionPlan: '긴 지문을 지루하게 읽지 말고 문단마다 3초 만에 3단어 헤드라인을 여백에 적습니다.',
        readingOrConceptMethod: '손으로 펜을 빠르게 움직이며 키워드에 동그라미/밑줄을 치는 능동적 표기 독해를 합니다.',
        problemSolvingMethod: '문제 선지에서 틀린 단어를 빠르게 가위표(X) 치는 스피드 소거법을 씁니다.',
        killerTips: '집중이 흐려질 땐 지문 옆에 질문이나 짧은 반론을 메모하며 뇌의 참여도를 유지합니다.'
      },
      math: {
        strategyTitle: '📐 화이트보드 서서 풀기 & 3분 타임어택',
        actionPlan: '앉아서 풀기 답답할 땐 스탠딩 데스크나 화이트보드에 서서 큼직하게 풀이합니다.',
        readingOrConceptMethod: '한 문제당 3분 타이머를 맞추고 게임하듯 타임어택 미션을 수행합니다.',
        problemSolvingMethod: '다양한 색깔의 보드마카를 써서 시각적 단조로움을 깨뜨립니다.',
        killerTips: '단순 계산 실수를 막기 위해 풀이 단계마다 크게 번호를 매깁니다.'
      },
      english: {
        strategyTitle: '🔤 1초 플래시 단어 암기 & 1.3배속 리스닝 타격',
        actionPlan: '한 단어를 3초 이상 보지 않고 1초 만에 플래시 카드 넘기듯 빠르게 100단어를 회독합니다.',
        readingOrConceptMethod: '독해 인강을 들을 땐 무조건 1.3배속 이상으로 설정하여 뇌가 딴생각을 할 틈을 주지 않습니다.',
        problemSolvingMethod: '지문의 첫 문장과 마지막 문장만 읽고 글의 중심 내용을 5초 안에 예측해보는 브레인스토밍을 합니다.',
        killerTips: '순서 배열 문항은 블록 맞추기 게임하듯 [B-C-A]의 논리 퍼즐 조각을 맞추는 감각으로 풉니다.'
      },
      inquiry: {
        strategyTitle: '⚡ 4색 컬러 펜 인터리빙 암기 & 10분 개념 챌린지',
        actionPlan: '한 과목을 3시간 내내 하지 않고, 탐구 과목 A 30분 -> 탐구 과목 B 30분으로 번갈아 학습합니다.',
        readingOrConceptMethod: '개념을 외울 때 방 안을 서성거리며 중얼중얼 랩을 하듯 리듬감 있게 외웁니다.',
        problemSolvingMethod: '스톱워치로 5분 안에 기출 5문제 풀기 미션을 수행하여 긴장감을 최고로 유지합니다.',
        killerTips: '틀린 문제는 오답 노트 대신 책상 앞 벽에 포스트잇으로 빽빽하게 붙여두고 수시로 떼어냅니다.'
      }
    },
    concentrationEnvironment: {
      environmentSetup: '피젯 토이(스트레스 볼) 구비, 무소음 스탠딩 데스크, 장소 교체(방 -> 거실 -> 독서실) 허용.',
      distractionBlocker: '공부 중 떠오르는 기발한 아이디어나 쇼핑 목록은 "딴짓 노트"에 적어두고 뇌를 안심시킨 뒤 즉시 복귀.'
    },
    mentalSlumpCare: {
      emergencyReset: '산만해질 때 껌을 씹거나 차가운 얼음물을 마셔 구강 감각 자극으로 전두엽 각성을 유도합니다.',
      cognitiveReframing: '"나의 산만함은 넘치는 창의성과 번개 같은 속도의 다른 이름이다. 짧게 여러 번 치고 빠진다!"'
    },
    learningStyle: "멀티 채널 감각 자극 & 인터리빙(Interleaving): 소리 내고, 서서 쓰고, 15분 단위로 과목을 교차하며 뇌의 도파민을 유지합니다.",
    subjectStrategy: {
      korean: "문단별 헤드라인 달기와 낙서식 독해로 긴 글 난독을 격파합니다.",
      math: "화이트보드 서서 풀기와 3분 타임어택으로 계산 실수와 지루함을 잡습니다.",
      english: "단어 카드 1초 넘기기와 1.3배속 청각 타격으로 딴생각을 원천 차단합니다.",
      inquiry: "탐구 30분 교차 학습과 랩 스타일 낭독 암기로 암기 속도를 2배 높입니다."
    },
    concentration: "**[집중 유지]** 딴짓 노트 활용과 피젯 자극으로 버려지는 시간을 하루 2시간 이상 순공 시간으로 회수합니다.",
    mentalCare: "**[멘탈 케어]** 짧은 몰입의 연속 성공으로 자기 통제감을 극대화하여 시험장 순발력을 완성합니다."
  },

  [CareType.CONCENTRATION]: {
    careTypeName: '집중력 저하형 (Concentration Deficiency)',
    summaryBadge: '🌊 몰입 의식(Ritual) & 50분 딥워크 아키텍처',
    neuroCognitiveProfile: {
      brainMechanism: '알파파-베타파 간의 동기화가 불안정하여 집중 상태로 진입하는 예열 시간(Warm-up Time)이 길고 몰입 유지가 단절되는 상태입니다.',
      learningBottleneck: '책상에 앉아 30분 동안 멍때리며 예열하다가 막 집중하려 할 때 피로감을 느끼며 흐름이 끊깁니다.',
      coreCognitiveStrength: '일단 몰입(Flow) 상태에 도달하면 시간 가는 줄 모르고 파고드는 강력한 딥워크(Deep Work) 잠재력을 보유하고 있습니다.'
    },
    timeArchitecture: {
      recommendedCycle: '🌊 50분 딥워크 몰입 + 10분 완전 리셋 (정석 뽀모도로)',
      startRitual: '안경 닦기 -> 책상 위 먼지 털기 -> 좋아하는 워밍업 음악 1곡 재생의 3단계 착석 의식(Ritual).',
      inputOutputRatio: '인풋 30% : 아웃풋 70%'
    },
    subjectProtocols: {
      korean: {
        strategyTitle: '📖 문학 소설 워밍업 후 고난도 비문학 딥워크',
        actionPlan: '처음부터 어려운 비문학을 풀지 말고, 몰입이 쉬운 현대소설 1편으로 뇌를 예열한 후 비문학으로 진입합니다.',
        readingOrConceptMethod: '독해 속도를 평소보다 10% 빠르게 유지하여 딴생각이 파고들 틈을 주지 않는 스피드 독해를 합니다.',
        problemSolvingMethod: '문제 풀이 시 지문의 단락 번호(①, ②, ③)를 선지 옆에 적으며 집중의 끈을 유지합니다.',
        killerTips: '긴 지문을 읽을 때 집중이 흐려지면 3문단에서 심호흡 1번 하고 다시 속도를 냅니다.'
      },
      math: {
        strategyTitle: '📐 쉬운 3점 워밍업 5문제 -> 4점 준킬러 연속 격파',
        actionPlan: '가장 자신 있는 단원의 3점 문제 5개를 순식간에 풀어 뇌의 회전수(RPM)를 최고치로 올립니다.',
        readingOrConceptMethod: '개념 공식의 유기적 연결 고리를 A4 1장에 도식화하며 집중을 유도합니다.',
        problemSolvingMethod: '50분 세션 동안 4점짜리 6문제를 끝까지 물고 늘어지는 딥 다이브(Deep Dive) 훈련을 합니다.',
        killerTips: '막히는 순간에도 펜을 놓지 않고 그래프를 다시 그리거나 특수한 값(x=0, 1)을 대입해봅니다.'
      },
      english: {
        strategyTitle: '🔤 빠른 호흡의 구문 독해 & 대의 파악 스프린트',
        actionPlan: '천천히 읽지 말고 약간 벅찬 속도로 영문을 읽어 내려가며 뇌의 몰입도를 강제로 끌어올립니다.',
        readingOrConceptMethod: '단어는 눈으로 보지 않고 손으로 빠르게 타이핑하거나 쓰면서 외웁니다.',
        problemSolvingMethod: '빈칸 문장의 앞뒤 문맥 3줄에 형광펜을 집중하여 단서(Clue)를 낚아챕니다.',
        killerTips: '듣기 평가 시간에 잡념이 들지 않도록 스크립트의 핵심 단어를 연필로 톡톡 치며 따라갑니다.'
      },
      inquiry: {
        strategyTitle: '⚡ 50분 개념 백지화 & 실전 20문항 연속 풀이',
        actionPlan: '단원 전체를 50분 동안 집중하여 백지에 완벽히 복원하는 파인만 테크닉을 적용합니다.',
        readingOrConceptMethod: '내가 인강 강사가 되어 칠판에 개념을 체계적으로 판서하듯 필기합니다.',
        problemSolvingMethod: '20문항 모의고사를 20분 타이머로 긴장감 있게 풀며 고도의 몰입감을 훈련합니다.',
        killerTips: '어려운 자료 해석은 표의 가로축과 세로축의 곱/비율 관계를 신속히 계산합니다.'
      }
    },
    concentrationEnvironment: {
      environmentSetup: '주변 유혹 요소를 완벽히 치운 미니멀 책상, 4000K 주백색 집중 조명, 편안한 의자 세팅.',
      distractionBlocker: '스마트폰은 잠금 상자(타임락)에 50분간 가두고 완벽한 집중 환경을 조성.'
    },
    mentalSlumpCare: {
      emergencyReset: '집중이 끊길 땐 찬물로 세안하고 손목을 찬물에 30초간 대어 미주신경을 자극합니다.',
      cognitiveReframing: '"몰입의 기쁨은 그 어떤 게임보다 짜릿하다. 지금 이 50분에 온전히 빠져든다."'
    },
    learningStyle: "몰입의 조건(Flow State) 설계: 착석 의식으로 예열 시간을 단축하고 50분 딥워크로 시간당 순공 밀도를 2배로 만듭니다.",
    subjectStrategy: {
      korean: "소설 워밍업과 10% 스피드 독해로 잡념 침투를 차단합니다.",
      math: "RPM 예열 3점 5문제 후 4점 준킬러 딥 다이브로 수학적 사고력을 극대화합니다.",
      english: "약간 벅찬 속도의 압축 독해와 단서 낚아채기로 고밀도 집중을 유지합니다.",
      inquiry: "50분 백지 복원 파인만 테크닉과 20분 타임 모의고사로 실전력을 다집니다."
    },
    concentration: "**[집중 유지]** 50분 딥워크와 착석 의식(Ritual)으로 하루 10시간 공부량을 6시간 만에 끝내는 효율을 달성합니다.",
    mentalCare: "**[멘탈 케어]** 찬물 미주신경 리셋과 몰입의 쾌감(Joy of learning)으로 흔들림 없는 학습 지속성을 만듭니다."
  },

  [CareType.CIRCULATION]: {
    careTypeName: '혈액순환 저하형 (Poor Circulation)',
    summaryBadge: '🏃 동적 신체 펌핑 & 스탠딩 데스크 산소 공급',
    neuroCognitiveProfile: {
      brainMechanism: '장시간 좌식 생활로 인한 척추 압박 및 말초 혈류 저하로 뇌로 가는 경동맥 혈류량과 산소 분압이 떨어져 하품과 뇌 저산소증이 발생합니다.',
      learningBottleneck: '오후 2시만 넘어가면 목/어깨가 굳고 눈이 뻑뻑하며 머리가 무거워 암기한 내용이 튕겨 나갑니다.',
      coreCognitiveStrength: '스트레칭이나 가벼운 유산소로 뇌 혈류만 뚫어주면 전신 활력과 함께 놀라운 뒷심 지구력을 발휘합니다.'
    },
    timeArchitecture: {
      recommendedCycle: '🏃 45분 집중 + 5분 림프 마사지 & 발목 펌핑 (동적 러닝)',
      startRitual: '공부 시작 전 제자리 스쿼트 10회 및 목/어깨 스트레칭으로 뇌 혈류 펌프질 가동.',
      inputOutputRatio: '인풋 30% : 아웃풋 70%'
    },
    subjectProtocols: {
      korean: {
        strategyTitle: '📖 독서대 시선 수평 유지 & 낭독형 비문학 독해',
        actionPlan: '고개를 푹 숙이는 거북목 자세를 금지하고, 2단 독서대로 시선을 눈높이에 맞춰 뇌 혈류를 개방합니다.',
        readingOrConceptMethod: '지문을 읽을 때 바른 척추 자세를 유지하며 소리 내어 지문을 읽어 산소 흡입량을 늘립니다.',
        problemSolvingMethod: '한 지문 풀 때마다 어깨를 으쓱하는 견갑골 이완 운동을 루틴화합니다.',
        killerTips: '1교시 시험 시작 전 따뜻한 물을 마셔 혈액 점도를 낮추고 뇌 혈류를 맑게 유지합니다.'
      },
      math: {
        strategyTitle: '📐 스탠딩 데스크 연산 & 종아리 발목 펌핑 풀이',
        actionPlan: '장시간 앉아있으면 하체에 혈액이 쏠리므로, 스탠딩 데스크에서 서서 수학 문제를 풉니다.',
        readingOrConceptMethod: '발 받침대에 한 발씩 번갈아 올리며 종아리 근육을 수축시켜 심장으로 혈액을 보냅니다.',
        problemSolvingMethod: '계산 과정은 큼직큼직하게 쓰며 시각적 피로와 목의 긴장을 줄입니다.',
        killerTips: '막히는 문제는 방 안을 걸어 다니며 머릿속으로 공식을 유도해봅니다.'
      },
      english: {
        strategyTitle: '🔤 쉐도잉 리듬 독해 & 입으로 외우는 연어 암기',
        actionPlan: '원어민 음원을 들으며 입으로 따라 말하는 쉐도잉 학습으로 호흡량을 2배로 늘립니다.',
        readingOrConceptMethod: '책을 들고 서서 걸어 다니며 영단어 30개를 10분 만에 암기합니다.',
        problemSolvingMethod: '독해 지문의 연결사를 볼 때 손으로 크게 제스처를 취하며 뇌를 자극합니다.',
        killerTips: '듣기 평가 시 척추를 곧게 펴고 귀를 기울여 뇌로 가는 혈류를 극대화합니다.'
      },
      inquiry: {
        strategyTitle: '⚡ 컬러풀 마인드맵 & 50분 주기 전신 스트레칭',
        actionPlan: '50분 공부 후 반드시 일어나서 온몸을 털어주는 림프 털기 운동을 2분간 실시합니다.',
        readingOrConceptMethod: '개념 요약 노트를 벽에 붙여두고 서서 읽으며 암기합니다.',
        problemSolvingMethod: '타이머로 실전 모의고사를 풀 때도 바른 좌식 자세를 철저히 지킵니다.',
        killerTips: '수족냉증 방지를 위해 따뜻한 양말과 텀블러를 책상에 항상 준비합니다.'
      }
    },
    concentrationEnvironment: {
      environmentSetup: '높이 조절 스탠딩 데스크, 2단 독서대, 1시간 간격 실내 강제 환기(CO2 농도 800ppm 이하 유지).',
      distractionBlocker: '다리 꼬기 금지, 발 받침대 사용으로 골반 뒤틀림 및 혈류 정체 원천 방지.'
    },
    mentalSlumpCare: {
      emergencyReset: '머리가 멍할 때 따뜻한 물로 족욕 10분을 하거나 목 뒤에 온찜질을 하여 경동맥을 확장합니다.',
      cognitiveReframing: '"건강한 신체에 건강한 1등급이 깃든다. 바른 자세와 뇌 혈류가 최고의 공부 무기다."'
    },
    learningStyle: "움직이는 공부(Kinesthetic Learning): 스탠딩 데스크와 자세 교정으로 뇌 산소 공급량을 극대화하여 오후 학습 효율을 40% 올립니다.",
    subjectStrategy: {
      korean: "2단 독서대 시선 수평과 낭독 독해로 경동맥 혈류를 맑게 유지합니다.",
      math: "스탠딩 데스크 연산과 종아리 펌핑으로 하체 혈류 정체 및 피로를 차단합니다.",
      english: "쉐도잉 호흡 독해와 서서 걷는 단어 암기로 뇌 각성도를 최상으로 올립니다.",
      inquiry: "벽보 암기와 50분 림프 스트레칭으로 지치지 않는 수험 뒷심을 완성합니다."
    },
    concentration: "**[집중 유지]** 1시간 간격 환기와 미온수 수분 섭취로 뇌 저산소증을 완벽히 방어합니다.",
    mentalCare: "**[멘탈 케어]** 목 뒤 온찜질과 족욕으로 부교감신경을 이완하여 긍정적이고 맑은 멘탈을 유지합니다."
  },

  [CareType.HEALTHY]: {
    careTypeName: '건강 균형형 / 최적 몰입 (Healthy Balance)',
    summaryBadge: '🚀 한계 돌파 & 최고난도 킬러 정복',
    neuroCognitiveProfile: {
      brainMechanism: '자율신경 SNS/PNS 균형이 이상적이며 신경인지 집중도와 인지 명료도가 최고조로, 전두엽 실행기능과 해마 기억 저장력이 최적화된 상태입니다.',
      learningBottleneck: '현재에 안주하거나 지나친 자만심으로 쉬운 문제에서 방심하여 사소한 실수가 나올 위험이 유일한 변수입니다.',
      coreCognitiveStrength: '학습 시간과 성취도가 1:1로 정직하게 비례하는 최상의 뇌 상태로, 상위 1% 킬러 문항을 씹어 먹는 폭발적 잠재력을 보유하고 있습니다.'
    },
    timeArchitecture: {
      recommendedCycle: '🚀 90분 울트라디안(Ultradian) 심층 몰입 + 15분 액티브 리프레시',
      startRitual: '오늘의 최고난도 킬러 3문제를 플래너 최상단에 적고 "오늘 내 한계를 깬다"는 도전 선언.',
      inputOutputRatio: '인풋 20% : 아웃풋 80%'
    },
    subjectProtocols: {
      korean: {
        strategyTitle: '📖 리트(LEET)/사관학교 고난도 제재 정복 & 시간 단축',
        actionPlan: '수능 기출을 넘어 LEET/MEET 고난도 철학, 경제, 양자역학 제재를 매일 2지문씩 분석합니다.',
        readingOrConceptMethod: '지문의 모든 논리적 비약과 숨겨진 전제를 찾아내는 비판적 독해(Critical Reading)를 훈련합니다.',
        problemSolvingMethod: '45문항을 65분 안에 만점으로 풀어내는 극한의 타임어택 시뮬레이션을 실행합니다.',
        killerTips: '오답 선지의 출제 원리를 역으로 분석하여 내가 직접 평가원식 함정 문제를 출제해봅니다.'
      },
      math: {
        strategyTitle: '📐 킬러 문항(22/30번) 30분 깊은 생각 & 다각적 풀이',
        actionPlan: '해설지를 절대 보지 않고 최고난도 킬러 1문제를 30분 이상 깊이 고민하여 자력으로 뚫어냅니다.',
        readingOrConceptMethod: '하나의 문제를 기하적 접근, 대수적 접근, 미적분적 접근 등 3가지 다른 방식으로 풀어냅니다.',
        problemSolvingMethod: '나만의 수학 개념 체계도와 킬러 알고리즘 공책을 완성하여 만점 방어벽을 구축합니다.',
        killerTips: '친구들에게 고난도 문제를 논리정연하게 설명해주는 티칭 학습으로 개념의 완벽한 100% 체화를 이룹니다.'
      },
      english: {
        strategyTitle: '🔤 원서 에세이/철학 원문 독해 & 빈칸 만점 굳히기',
        actionPlan: 'EBS 연계를 넘어 인문/사회 철학 원서 지문을 독해하며 어휘력과 구문 해석력을 대학 수준으로 올립니다.',
        readingOrConceptMethod: '빈칸 추론 31~34번을 6분 안에 모두 정답 처리하는 절대적 독해 속도를 완성합니다.',
        problemSolvingMethod: '모든 오답 선지의 매력적 함정 포인트를 1초 만에 분석하여 완벽 소거합니다.',
        killerTips: '안정적인 100점을 위해 수능 당일 어떤 돌발 난이도가 나와도 흔들리지 않는 멘탈을 유지합니다.'
      },
      inquiry: {
        strategyTitle: '⚡ 신유형 킬러 도표 자체 제작 & 전 단원 만점 굳히기',
        actionPlan: '시중 모든 고난도 N제와 사설 모의고사를 섭렵하며 신유형 자료 해석 킬러를 완벽 정복합니다.',
        readingOrConceptMethod: '개념의 사소한 예외 사항까지 완벽히 숙지하여 지엽 낚시 가능성을 0%로 만듭니다.',
        problemSolvingMethod: '30분 시험을 18분 컷으로 풀고 남은 12분 동안 2번 전수 검산하는 무결점 루틴을 체화합니다.',
        killerTips: '내가 약한 0.1%의 빈틈을 찾아내어 메타인지 오답 바인더에 누적 관리합니다.'
      }
    },
    concentrationEnvironment: {
      environmentSetup: '현재의 최적 루틴(수면 7시간, 규칙적 식사, 주 3회 운동)을 성스러운 의식처럼 철저히 고수.',
      distractionBlocker: '주말 반나절은 확실한 문화/스포츠 보상으로 뇌에 신선한 휴식을 부여하여 슬럼프를 사전 차단.'
    },
    mentalSlumpCare: {
      emergencyReset: '겸손함과 감사하는 마음 유지. "나는 날마다 발전하고 있으며 수능 당일 최고의 결과를 낸다."',
      cognitiveReframing: '"압도적인 실력은 우연이 아니라 매일의 완벽한 루틴이 복리로 쌓인 결과다."'
    },
    learningStyle: "한계 돌파(Limit Breaking) & 킬러 정복: 최상의 두뇌 컨디션에서 평소 미뤄둔 최고난도 킬러와 약점을 정면 돌파하여 상위 1%로 도약합니다.",
    subjectStrategy: {
      korean: "LEET 고난도 비판적 독해와 65분 만점 타임어택으로 1교시를 압도합니다.",
      math: "킬러 30분 자력 돌파와 3가지 다각적 풀이로 절대 만점 실력을 완성합니다.",
      english: "원서급 논리 독해와 6분 빈칸 격파로 흔들리지 않는 1등급을 굳힙니다.",
      inquiry: "18분 컷 및 2회 전수 검산 시스템으로 무결점 만점을 획득합니다."
    },
    concentration: "**[집중 유지]** 90분 울트라디안 심층 몰입과 완벽한 생활 루틴 준수로 상위 1%의 격차를 만듭니다.",
    mentalCare: "**[멘탈 케어]** 가르쳐주며 배우는 티칭 효과와 감사 마인드로 인성과 실력을 겸비한 인재로 성장합니다."
  },

  [CareType.UNASSESSED]: {
    careTypeName: '일반 표준형 (General Assessment)',
    summaryBadge: '📚 50/10 정석 루틴 & 4대 영역 균형 학습',
    neuroCognitiveProfile: {
      brainMechanism: '표준적인 뇌 신경 대사 상태로 규칙적인 자극과 체계적인 학습 루틴이 주어질 때 가장 안정적인 성적 향상을 보입니다.',
      learningBottleneck: '특정 취약 단원에 대한 메타인지 분석 부족 시 학습 효율이 분산될 수 있습니다.',
      coreCognitiveStrength: '체계적인 계획 수립과 꾸준한 실행이 뒷받침되면 전 과목의 고른 성적 상승을 이끌어낼 수 있습니다.'
    },
    timeArchitecture: {
      recommendedCycle: '📚 50분 집중 + 10분 스트레칭 (표준 주기)',
      startRitual: '오늘의 할 일 3가지를 플래너에 적고 우선순위 1번 과목부터 착석.',
      inputOutputRatio: '인풋 40% : 아웃풋 60%'
    },
    subjectProtocols: {
      korean: {
        strategyTitle: '📖 매일 아침 비문학 3지문 분석 & 기출 어휘 정리',
        actionPlan: '아침 시간을 활용해 평가원 기출 비문학 3지문과 문학 1세트를 꾸준히 분석합니다.',
        readingOrConceptMethod: '문단별 중심 문장에 밑줄을 긋고 글의 전개 방식을 파악하는 정석 독해를 합니다.',
        problemSolvingMethod: '틀린 문제는 해설을 보지 않고 지문에서 근거 문장을 다시 찾아 형광펜을 칩니다.',
        killerTips: 'EBS 수능특강/수능완성 연계 교재를 꼼꼼히 회독합니다.'
      },
      math: {
        strategyTitle: '📐 개념서 정독 & 유형별 기출 문제 단계적 마스터',
        actionPlan: '개념원리나 쎈수학 등의 유형서를 완벽히 마스터한 후 기출 4점으로 확장합니다.',
        readingOrConceptMethod: '공식의 조건과 유도 과정을 꼼꼼히 읽고 백지에 정리합니다.',
        problemSolvingMethod: '틀린 문제는 오답 노트에 적고 3일 뒤에 반드시 다시 풀어봅니다.',
        killerTips: '계산 실수를 줄이기 위해 풀이 공간을 바르게 정돈합니다.'
      },
      english: {
        strategyTitle: '🔤 매일 단어 30개 암기 & 구문 독해 기본기 다지기',
        actionPlan: '매일 아침/저녁 30분씩 투자하여 수능 필수 어휘 30개를 누적 암기합니다.',
        readingOrConceptMethod: '천일문 등 구문 기본서를 통해 긴 문장의 주어와 동사를 끊어 읽는 훈련을 합니다.',
        problemSolvingMethod: '듣기 평가 모의고사를 주 2회 실시하여 17문항 만점을 확보합니다.',
        killerTips: '대의 파악 문항을 빠르고 정확하게 풀어 독해 시간을 확보합니다.'
      },
      inquiry: {
        strategyTitle: '⚡ 개념 단권화 & 단원별 기출 문제 3회독',
        actionPlan: '탐구 2과목의 기본 개념을 꼼꼼히 정리하고 기출문제를 3회 반복 풀이합니다.',
        readingOrConceptMethod: '교과서와 연계 교재의 핵심 표와 그래프를 완벽히 숙지합니다.',
        problemSolvingMethod: '자주 틀리는 단원은 오답 개념 카드를 만들어 수시로 복습합니다.',
        killerTips: '시간 배분 연습을 통해 실전에서 쫓기지 않도록 훈련합니다.'
      }
    },
    concentrationEnvironment: {
      environmentSetup: '정리정돈된 책상, 적절한 조명, 스마트폰 사용 시간 통제.',
      distractionBlocker: '공부 중 인터넷 서핑이나 SNS 알림을 차단하는 앱 활용.'
    },
    mentalSlumpCare: {
      emergencyReset: '피곤할 땐 10분간 가벼운 산책이나 스트레칭으로 뇌를 환기합니다.',
      cognitiveReframing: '"매일의 작은 성실함이 모여 결국 큰 합격을 만든다."'
    },
    learningStyle: "규칙적이고 체계적인 표준 학습: 50분 집중과 10분 휴식의 기본 주기를 지키며 꾸준한 루틴을 유지합니다.",
    subjectStrategy: {
      korean: "매일 아침 비문학 3지문 분석과 근거 찾기로 독해 기본기를 다집니다.",
      math: "개념서 정독과 3회독 오답 복습으로 유형 적응력을 완성합니다.",
      english: "매일 단어 30개 암기와 구문 끊어 읽기로 안정적인 등급을 확보합니다.",
      inquiry: "개념 단권화와 기출 3회독으로 탐구 만점 베이스를 다집니다."
    },
    concentration: "**[집중 유지]** 기본 생활 패턴 준수와 스마트폰 차단으로 안정적인 순공 시간을 확보합니다.",
    mentalCare: "**[멘탈 케어]** 긍정적 자기 암시와 꾸준함으로 흔들리지 않는 수험 레이스를 완주합니다."
  }
};

export const STRATEGIES_BY_CARETYPE = DETAILED_CARETYPE_STRATEGIES;

/**
 * 5대 과학적 학습 기질(Learning Traits)과 CareType에 따라 최적의 맞춤 학습 전략을 도출합니다.
 */
export const getLearningStrategy = (
  learningTraitsOrMbti: LearningTraitsData | string | undefined,
  careType: CareType
): DetailedCareTypeStrategy => {
  // 1. CareType에 맞는 기본 생체/피로도 맞춤 전략 가져오기 (필수)
  const baseStrategy = DETAILED_CARETYPE_STRATEGIES[careType] || DETAILED_CARETYPE_STRATEGIES[CareType.UNASSESSED];

  // 2. 5대 과학적 학습 기질 데이터가 있는 경우 정밀 결합 (Primary)
  if (learningTraitsOrMbti && typeof learningTraitsOrMbti === 'object' && 'archetypeTitle' in learningTraitsOrMbti) {
    const traits = learningTraitsOrMbti as LearningTraitsData;
    const traitHeader = `### 🧬 [5대 학습 기질 정밀 진단: ${traits.archetypeBadge || '성향 진단'}]\n` +
      `> **${traits.archetypeTitle || '맞춤 학습 성향'}** — ${traits.archetypeDescription || ''}\n\n` +
      `* **핵심 인지 강점**: ${traits.coreStrength || ''}\n` +
      `* **주의 및 병목 요인**: ${traits.cautionPoint || ''}\n` +
      `* **기질별 최적 환경**: ${traits.recommendedEnvironment || ''}\n\n` +
      `---\n\n### ⚡ [${baseStrategy.careTypeName} 맞춤 신경인지 처방]\n`;

    return {
      ...baseStrategy,
      learningStyle: `${traitHeader}${baseStrategy.learningStyle || ''}`,
      concentration: `**[기질별 최적 환경]** ${traits.recommendedEnvironment || ''}\n\n${baseStrategy.concentration || ''}`,
      mentalCare: `**[마인드셋 처방]** ${traits.cautionPoint || ''}에 유의하며 성장 마인드셋을 유지하세요.\n\n${baseStrategy.mentalCare || ''}`
    };
  }

  return baseStrategy;
};
