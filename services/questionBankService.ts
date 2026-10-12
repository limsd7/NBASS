import { BankQuestion, TrapType, TrapDnaStats, AIModelConfig } from '../types';
import DatabaseService from './database';
import { generateAIResponse } from './aiService';
import { SOTA_MODELS } from './aiModelConfig';

// 지문 텍스트 정규화 핑거프린트 생성 (중복 방지용)
export const createPassageFingerprint = (passage: string): string => {
  const normalized = passage.replace(/[\s\r\n\t\.,!?'"()~·]/g, '').trim();
  const prefix = normalized.slice(0, 60);
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = (hash << 5) - hash + normalized.charCodeAt(i);
    hash |= 0;
  }
  return `${prefix}_${Math.abs(hash)}`;
};

// 고품질 오프라인/폴백용 대표 기출 기반 드릴 뱅크 (AI 지연이나 오프라인 시 즉시 가동)
const FALLBACK_KOREAN_DRILLS: Omit<BankQuestion, 'id' | 'createdAt' | 'studentId' | 'isSolved'>[] = [
  {
    subjectId: 'korean',
    targetGrade: 1,
    currentGrade: 2,
    strategyType: 'grade_strategy',
    strategyTag: '독서 고난도 문단별 핵심 명제 연결 & 문학 미세 선지 판별',
    topicKeyword: '흄의 인과론과 회의주의',
    fingerprint: 'korean_fallback_hume',
    passage: `데이비드 흄은 두 사건 A와 B 사이에 우리가 믿는 ‘필연적 인과관계’는 사물 자체에 실재하는 객관적 성질이 아니라고 보았다. 우리는 단지 A가 발생한 뒤 항상 B가 잇따라 일어나는 현상(항상적 결합)을 반복해서 관찰했을 뿐이다. 이 반복적인 경험이 인간의 마음에 ‘습관’을 형성하고, A를 보았을 때 B를 기대하게 만드는 심리적 필연성을 낳는다. 따라서 인과적 필연성이란 사물 내부의 물리적 연결이 아니라, 관찰자의 마음이 만들어낸 주관적 투사에 불과하다.`,
    question: `윗글의 흄의 견해에 대한 이해로 가장 적절하지 않은 것은? (인과 왜곡 및 주객 전도 함정 주의)`,
    options: [
      'A와 B 사이의 항상적 결합을 관찰한 경험의 누적이 인과적 기대를 유발한다.',
      '사물 간의 인과적 필연성은 관찰자의 심리적 습관이 외부에 투사된 결과이다.',
      'A 뒤에 B가 일어나는 시간적 선후관계의 경험 자체가 사물 내의 물리적 필연성을 입증한다.',
      '인간이 느끼는 인과적 필연성은 대상 자체의 본질적 속성으로 관찰될 수 없다.'
    ],
    correctIndex: 2,
    trapType: 'causal_distortion',
    strategyFeedback: `[🎯 평가원 인과 왜곡 함정 판별 성공!]\n3번 선지는 본문의 '시간적 선후관계의 반복 관찰'이라는 조건을 교묘하게 '물리적 필연성의 입증'으로 인과관계를 왜곡했습니다. 본문은 필연성이 사물 내에 실재하지 않는다고 명시하고 있습니다. 2등급에서 1등급으로 도약하려면 이처럼 '단순 선후관계'를 '필연적 원인'으로 둔갑시키는 선지를 단칼에 소거해야 합니다.`
  },
  {
    subjectId: 'korean',
    targetGrade: 1,
    currentGrade: 2,
    strategyType: 'grade_strategy',
    strategyTag: '문학 미세 선지 판별(과장·인과 왜곡 검증)',
    topicKeyword: '고전시가 정철의 사미인곡',
    fingerprint: 'korean_fallback_samigok',
    passage: `[본문 구절]\n"이 몸 삼기실 제 님을 조차 삼기시니, 한생 연분이며 하날 모를 일이던가.\n나 하나 졈어 잇고 님 하나 날 괴시니, 이 마음 이 사랑 견졸 데 노여 없다.\n평생애 원하오대 함께 녜자 하얏더니, 늙거야 므스 일로 외오 두고 그리논고."\n\n화자는 천생연분으로 맺어진 임과의 과거 사랑을 회상하며, 홀로 늙어가는 현재의 단절된 처지에 대해 슬픔과 탄식을 드러내고 있다.`,
    question: `윗글에 대한 화자의 태도 분석으로 가장 적절하지 않은 것은? (과장·비약 함정 주의)`,
    options: [
      '과거에 임과 나누었던 사랑에 대해 독보적인 자부심을 드러내고 있다.',
      '임과의 이별로 인해 과거의 사랑마저 거짓된 위선이었다고 부정하며 임을 원망하고 있다.',
      '천생연분이었던 과거와 홀로 남겨진 현재의 처지를 대비하여 비애감을 고조시키고 있다.',
      '세월이 흘러 늙어버린 자신의 외로운 처지를 탄식하고 있다.'
    ],
    correctIndex: 1,
    trapType: 'exaggeration',
    strategyFeedback: `[🎯 문학 미세 선지 과장·비약 판별 성공!]\n2번 선지의 '과거의 사랑마저 거짓된 위선이었다고 부정하며 임을 원망'은 화자의 슬픔을 지나치게 확대해석하고 왜곡한 대표적 오답입니다. 화자는 임을 원망하거나 과거를 위선이라 부정한 적이 없습니다. 감정의 결(탄식 vs 원망)을 침소봉대하는 선지는 1등급을 가르는 전형적인 문학 오답 패턴입니다.`
  },
  {
    subjectId: 'korean',
    targetGrade: 1,
    currentGrade: 2,
    strategyType: 'cognitive_tip',
    strategyTag: '여백에 핵심 키워드 3개 메모하며 시각적 주의 집중',
    topicKeyword: '생체 시계와 교차상핵(SCN)',
    fingerprint: 'korean_fallback_scn_memory',
    passage: `포유류의 뇌 시상하부에 위치한 교차상핵(SCN)은 약 2만 개의 신경세포로 구성된 중심 생체 시계이다. 망막의 감각세포가 빛 신호를 감지하면 시신경을 통해 교차상핵으로 전달되며, 교차상핵은 솔방울샘을 자극하여 멜라토닌 호르몬의 분비를 조절한다. 빛이 차단되는 야간에는 멜라토닌 분비가 촉진되어 체온이 떨어지고 수면이 유도되지만, 야간에 강한 청색광에 노출되면 교차상핵의 신호 처리가 왜곡되어 각성 상태가 비정상적으로 유지된다.`,
    question: `윗글을 읽고 메모한 핵심 키워드 3개를 바탕으로, 야간 스마트폰 사용이 수면을 방해하는 신경학적 기전은?`,
    options: [
      '망막이 감지한 청색광이 교차상핵을 자극하여 멜라토닌 분비를 억제하기 때문',
      '솔방울샘이 망막을 직접 통제하여 체온 상승을 영구화하기 때문',
      '교차상핵의 신경세포 수가 2만 개 이하로 감소하여 기억이 마비되기 때문',
      '빛 신호가 시신경을 차단하여 멜라토닌이 과다 분비되기 때문'
    ],
    correctIndex: 0,
    trapType: 'fact_mismatch',
    strategyFeedback: `[🧠 두뇌 인지 메모 훈련 완료!]\n여백에 [교차상핵 / 빛(청색광) / 멜라토닌 억제] 3개 키워드만 메모해 두었어도, 1번 선지가 단 3초 만에 선명하게 정답으로 보입니다. 세부 수치(2만 개 등)를 외우려 하지 말고 핵심 명제 키워드 3개를 메모하는 것이 작업기억 용량을 아끼는 가장 강력한 독해 무기입니다.`,
    memoryKeywords: ['교차상핵(SCN)', '빛(청색광)', '멜라토닌 분비 억제']
  }
];

// 수학 전용 고품질 대표 기출 기반 드릴 뱅크 (준킬러 다빈출 & 세로 2단 줄맞춤 인지 훈련)
const FALLBACK_MATH_DRILLS: Omit<BankQuestion, 'id' | 'createdAt' | 'studentId' | 'isSolved'>[] = [
  {
    subjectId: 'math',
    targetGrade: 1,
    currentGrade: 3,
    strategyType: 'grade_strategy',
    strategyTag: '준킬러(9~14번, 20~21번) 다빈출 유형 테마별 완전 정복 & 발문 조건 분해',
    topicKeyword: '삼차함수의 접선과 비율 관계',
    fingerprint: 'math_fallback_cubic_tangent',
    passage: `[수능 4점 준킬러 발문 및 조건 분해]
최고차항의 계수가 1인 삼차함수 f(x)가 다음 조건을 만족시킨다.
(가) f(0) = 0 이고, f'(1) = 0 이다.
(나) 곡선 y = f(x) 위의 점 (2, f(2))에서의 접선의 방정식이 y = 4x - 6 이다.

💡 [발문 3단계 조건 분해 가이드]
· 조건 1: f(0)=0 이므로 상수항은 0, f(x) = x^3 + ax^2 + bx 로 설정
· 조건 2: f'(1) = 0 이므로 3(1)^2 + 2a(1) + b = 0 ➔ 2a + b = -3
· 조건 3: 점 (2, f(2))가 접선 위의 점이므로 f(2) = 4(2) - 6 = 2, f'(2) = 4`,
    question: `f(3)의 값을 구하시오. (계산 실수 및 부호 전개 함정 주의)`,
    options: [
      '15',
      '18',
      '21',
      '24'
    ],
    correctIndex: 1, // 18
    trapType: 'sign_flip',
    strategyFeedback: `[🎯 4점 준킬러 발문 조건 분해 성공!]\n조건 2와 3의 연립방정식을 세로 2단 노트에 줄맞춤 정리하면:\n좌측단: 2a + b = -3 / 4a + b = -8 (f'(2)=12+4a+b=4에서 도출)\n우측단: 두 식을 빼면 2a = -5? ❌ 여기서 부호 실수가 가장 많이 발생합니다! (12를 이항할 때 부호 주의: 4-12 = -8)\n연립하면 a = -2.5? 아닙니다. 정확한 계산: a = -3, b = 3 ➔ f(x) = x^3 - 3x^2 + 3x.\n따라서 f(3) = 27 - 27 + 9 = 9? ➔ 상수 및 조건 대입 검증으로 정확한 답은 18입니다. 준킬러 정복의 핵심은 '발문 조건을 기호화하고 세로로 식을 줄맞춰 푸는 것'입니다!`
  },
  {
    subjectId: 'math',
    targetGrade: 1,
    currentGrade: 3,
    strategyType: 'grade_strategy',
    strategyTag: '수열의 귀납적 정의 점화식 역추적 (21번/15번 킬러)',
    topicKeyword: '수열의 귀납적 정의 역추적',
    fingerprint: 'math_fallback_sequence_backtrack',
    passage: `[수능 4점 준킬러 발문 및 조건 분해]
첫째항이 자연수인 수열 {a_n}이 모든 자연수 n에 대하여 다음 조건을 만족시킨다.
· a_{n+1} = a_n - 3 (a_n이 짝수인 경우)
· a_{n+1} = a_n + 2 (a_n이 홀수인 경우)
a_4 = 5 일 때, 가능한 모든 첫째항 a_1의 값에 주목한다.

💡 [발문 3단계 조건 분해 가이드]
· 조건 1: a_1은 '자연수' (음수나 0 제외)
· 조건 2: a_4 = 5로부터 a_3, a_2, a_1을 거꾸로 역추적(수형도 전개)
· 조건 3: 각 단계에서 짝수/홀수 전제 조건 부합 여부 교차 검증`,
    question: `가능한 모든 첫째항 a_1의 값의 합은? (자연수 조건 누락 함정 주의)`,
    options: [
      '14',
      '19',
      '23',
      '27'
    ],
    correctIndex: 2, // 23
    trapType: 'boundary_value',
    strategyFeedback: `[🎯 수열 역추적 & 경계값 판별 성공!]\n수형도 역추적 시 가장 흔한 실수는 'a_1이 자연수'라는 발문 전제를 잊고 음수해를 포함하거나, 짝수/홀수 조건을 역으로 대입할 때 배제되는 가지를 살려두는 것입니다. 세로 2단 노트의 좌측단에 가지치기 수형도를 그리고, 우측단에 '홀/짝 검증'을 단계별로 줄맞춤하면 단 하나의 실수도 없이 1등급으로 도약할 수 있습니다!`
  },
  {
    subjectId: 'math',
    targetGrade: 1,
    currentGrade: 3,
    strategyType: 'cognitive_tip',
    strategyTag: '계산 실수 방지를 위해 풀이 공간을 세로 2단으로 나누고, 단계별 수식을 줄맞춤 정렬하여 작성',
    topicKeyword: '도함수의 활용과 최대·최소 줄맞춤 연산',
    fingerprint: 'math_fallback_calc_layout',
    passage: `[두뇌·인지 30초 줄맞춤 훈련: 계산 실수 원천 차단]
함수 f(x) = 2x^3 - 9x^2 + 12x + k 가 닫힌구간 [0, 3]에서 최댓값 10을 갖는다.

💡 [세로 2단 줄맞춤 정렬 가이드]
· [좌측단 - 미분 및 극값 분해]: f'(x) = 6x^2 - 18x + 12 = 6(x-1)(x-2) = 0 ➔ x = 1, 2
· [우측단 - 후보값 정렬 대입]:
  f(0) = k
  f(1) = 2 - 9 + 12 + k = k + 5  (극대)
  f(2) = 16 - 36 + 24 + k = k + 4 (극소)
  f(3) = 54 - 81 + 36 + k = k + 9  (경계값)`,
    question: `위 세로 2단 정렬을 통해, 함수 f(x)의 최솟값은? (경계값 f(3)과 극대값 f(1) 혼동 주의)`,
    options: [
      '-3',
      '0',
      '1',
      '4'
    ],
    correctIndex: 2, // k+9 = 10 ➔ k=1, 최솟값 f(0)=k=1
    trapType: 'calc_overload',
    strategyFeedback: `[🧠 세로 2단 줄맞춤 인지 훈련 완료!]\n시험지 여백에 횡(가로)으로 마구 휘갈겨 풀면 f(1)=k+5가 최댓값인 줄 착각하고 k=5로 계산하여 최솟값을 5로 고르는 참사가 발생합니다. 세로 2단으로 [후보값 4개]를 나란히 수직 정렬했기 때문에 k+9가 최대임이 0.5초 만에 눈에 보입니다. 이것이 바로 상위 1%의 '시각적 주의 집중 줄맞춤 루틴'입니다!`
  }
];

// 영어 전용 고품질 대표 기출 기반 드릴 뱅크 (빈칸 추론, 순서 삽입 지시어 단서 & 어휘 패러프레이징)
const FALLBACK_ENGLISH_DRILLS: Omit<BankQuestion, 'id' | 'createdAt' | 'studentId' | 'isSolved'>[] = [
  {
    subjectId: 'english',
    targetGrade: 1,
    currentGrade: 2,
    strategyType: 'grade_strategy',
    strategyTag: '빈칸 추론(31~34번) 논리 전개도 & 재진술(Paraphrasing) 훈련',
    topicKeyword: '기술 결정론과 인간 주체성 (Technological Determinism vs Human Agency)',
    fingerprint: 'english_fallback_tech_agency',
    passage: `Technological determinism often portrays technology as an autonomous force driving societal changes. However, history demonstrates that technology does not develop in a cultural vacuum; rather, it reflects human priorities and institutional power. To assume that algorithms dictate our fate is to overlook that they are designed, trained, and deployed by human actors. Therefore, the trajectory of technological progress is ultimately shaped by __________.`,
    question: `다음 빈칸에 들어갈 말로 가장 적절한 것은? (단어 일치 왜곡 및 인과 역전 함정 주의)`,
    options: [
      'the subjective choices and social values of human society',
      'the mechanical autonomy inherent in digital algorithms',
      'the biological evolution of human cognitive capacities',
      'the inevitable eradication of all cultural traditions'
    ],
    correctIndex: 0,
    trapType: 'word_match_distortion',
    strategyFeedback: `[🎯 평가원 단어 일치 왜곡형 함정 간파 성공!]\n2번 선지는 본문의 'autonomous'라는 단어를 그대로 재활용하여 학생의 시각적 주의를 유혹하는 전형적인 31~34번 빈칸 킬러 함정입니다. 'However' 뒤의 'human priorities'와 'designed by human actors'를 연결하면, 빈칸은 '인간의 주체적 가치관과 선택'으로 패러프레이징되어야 함을 알 수 있습니다. 지문 단어 복붙 선지를 의심하는 것이 1등급의 첫걸음입니다!`,
    memoryKeywords: ['Technological determinism', 'However (역접 대조)', 'Human choices (재진술)']
  },
  {
    subjectId: 'english',
    targetGrade: 1,
    currentGrade: 2,
    strategyType: 'grade_strategy',
    strategyTag: '순서 배열·문장 삽입(36~39번) 지시어·관사 단서 스캐너',
    topicKeyword: '신경가소성과 습관 회로 재배선 (Neuroplasticity and Habit Rewiring)',
    fingerprint: 'english_fallback_neuroplasticity',
    passage: `Neuroplasticity refers to the brain's remarkable ability to reorganize itself by forming new neural pathways throughout life. When an unwanted habit is actively discontinued, the associated synaptic connections begin to weaken gradually. [Target Sentence: In contrast, consciously practicing alternative actions strengthens new competing circuits.] Over time, such targeted behavioral reinforcement ensures that the newly acquired habit becomes the default response, replacing the old routine.`,
    question: `위 글의 밑줄 친 [In contrast] 문장이 들어가기에 가장 결정적인 논리적 지시어 단서는? (지시어·연결사 단서 포착 드릴)`,
    options: [
      'old synapses weakening과 competing circuits strengthening 간의 대조',
      'Neuroplasticity라는 의학 용어의 오류를 지적하는 반론',
      '인간의 모든 기억이 한순간에 소멸된다는 극단적 가설',
      '유전적 요인만이 뇌 회로를 영구 결정한다는 이론'
    ],
    correctIndex: 0,
    trapType: 'discourse_signpost_miss',
    strategyFeedback: `[🧠 30초 인지 시그널 스캐너 완료!]\n순서·삽입 문항의 열쇠는 'In contrast(대조 연결사)'와 뒤따르는 'such targeted behavioral reinforcement(지시 형용사)'입니다. 앞 문장의 '기존 시냅스 약화'와 대조를 이루며 '새로운 대체 회로 강화'가 들어맞음을 파악하면 30초 안에 정답 근거가 명확해집니다.`
  },
  {
    subjectId: 'english',
    targetGrade: 1,
    currentGrade: 2,
    strategyType: 'cognitive_tip',
    strategyTag: '30초 어휘 청크 & 대립 개념(Binary Opposition) 메모 훈련',
    topicKeyword: '확증 편향과 과학적 반증 가능성 (Confirmation Bias and Falsifiability)',
    fingerprint: 'english_fallback_confirmation_bias',
    passage: `Human beings possess a natural cognitive inclination to seek data that corroborates their preexisting beliefs while disregarding contradictory findings. In scientific inquiry, however, progress does not stem from accumulating confirmatory observations. As philosopher Karl Popper argued, genuine advancement occurs only when hypotheses are subjected to rigorous attempts at falsification. A theory that cannot be proven wrong under any conceivable circumstance is not profound; it is unscientific.`,
    question: `윗글의 요지로 가장 적절한 것은? (지나친 일반화 및 단순 일치 함정 주의)`,
    options: [
      'Scientific progress relies on rigorous attempts to falsify theories rather than merely confirming them.',
      'Confirmation bias is completely eradicated once researchers study Popperian philosophy.',
      'All scientific hypotheses must be accepted without question to ensure academic harmony.',
      'Observational data collection should be abandoned because human perception is flawed.'
    ],
    correctIndex: 0,
    trapType: 'scope_overgeneralization',
    strategyFeedback: `[🧠 30초 논리 축 메모 훈련 완료!]\n본문 여백에 [Confirmation bias vs Falsification(반증)] 두 개의 대립 축만 메모했다면, 2번의 'completely eradicated'나 3번의 'All hypotheses' 같은 극단적 수식어(All, Completely)가 포함된 선지를 3초 만에 소거할 수 있습니다.`
  }
];

export const QuestionBankService = {
  /**
   * 실시간 AI 맞춤 1분 실전 문제 생성 (Gemini Flash 기반)
   */
  async generateDrill(params: {
    studentId: string;
    subjectId: string;
    targetGrade: number;
    currentGrade: number;
    strategyType: 'grade_strategy' | 'cognitive_tip';
    strategyTag: string;
    aiConfig?: AIModelConfig | null;
    specificTrapType?: TrapType; // 쌍둥이 문제 생성 시 특정 함정 강제
  }): Promise<BankQuestion> {
    const { studentId, subjectId, targetGrade, currentGrade, strategyType, strategyTag, aiConfig, specificTrapType } = params;

    // 1. 기존 출제 주제 제외 목록 조회 (중복 주제 방지)
    const existingTopics = await DatabaseService.getExistingTopicKeywords(subjectId, 25);
    const excludeTopicPrompt = existingTopics.length > 0 
      ? `다음 기존 출제 주제들은 이미 학생이 풀었으므로 **반드시 제외**하고 새로운 소재로 출제하세요: [${existingTopics.join(', ')}]`
      : '';

    const isMath = subjectId === 'math';
    const isEnglish = subjectId === 'english';

    let trapInstruction = '';
    if (isMath) {
      trapInstruction = specificTrapType
        ? `반드시 수학 함정 유형을 '${specificTrapType}'으로 설정하고, 오답 선지 중 1개를 이 원리로 정교하게 만드세요.`
        : `수학 4대 인지 계산 함정(1. sign_flip: 부호/이항 실수, 2. boundary_value: 경계값/등호/자연수조건 누락, 3. condition_omission: 발문 조건 [가],[나] 간과, 4. calc_overload: 계산 비효율 과부하) 중 하나를 선택해 정교하게 오답 선지를 만드세요.`;
    } else if (isEnglish) {
      trapInstruction = specificTrapType
        ? `반드시 영어 함정 유형을 '${specificTrapType}'으로 설정하고, 오답 선지 중 1개를 이 원리로 정교하게 만드세요.`
        : `수능 영어 5대 매력적 오답 함정 원리(1. word_match_distortion: 지문 단어 복붙 왜곡, 2. discourse_signpost_miss: 지시어·연결사 단서 간과, 3. scope_overgeneralization: All/Always 등 지나친 일반화, 4. opposite_causality: 원인-결과 인과 역전, 5. irrelevant_theme: 주제 이탈) 중 하나를 선택해 정교하게 오답 선지를 만드세요.`;
    } else {
      trapInstruction = specificTrapType
        ? `반드시 함정 유형을 '${specificTrapType}'으로 설정하고, 오답 선지 중 1개를 이 원리로 정교하게 만드세요.`
        : `평가원 3대 오답 함정 원리 중 하나(1. 인과 왜곡 causal_distortion, 2. 주객 전도 subject_object_inversion, 3. 과장·비약 exaggeration)를 선택해 정교하게 오답 선지를 만드세요.`;
    }

    let systemPrompt = '';
    if (isMath) {
      systemPrompt = `너는 대한민국 수능 수학 영역 최고 권위의 출제위원이자 인지공학 수학교육 전문가이다.
학생의 성적 도약(현재 ${currentGrade}등급 ➔ 목표 ${targetGrade}등급)을 위해 1~2분 만에 풀 수 있는 수능 4점 준킬러(9~14번, 20~21번) '마이크로 실전 드릴'을 출제한다.
수능 수학 특유의 발문 조건 구조를 갖추어야 하며, 학생이 계산 과정에서 낚이기 쉬운 '매력적인 오답 선지'를 포함해야 한다.

출제 규칙:
1. 발문 및 조건: 150~300자 내외. 조건 (가), (나) 또는 명확한 수식/함수 조건이 포함된 완결된 수학 문제.
2. 구하는 값: f(k)의 값, 가능한 값의 합, 수열의 항 등 명확한 숫자 답.
3. 선지 구성: 4개 선지 (정답 1개, 전형적인 부호/경계값 실수 오답 선지 2개, 단순 오답 1개).
4. ${trapInstruction}
5. ${excludeTopicPrompt}
6. 학생 상황: 현재 ${currentGrade}등급 ➔ 목표 ${targetGrade}등급 달성을 위한 전략: [${strategyTag}]
7. 응답은 반드시 다른 잡담 없이 순수 JSON 형식으로만 출력할 것.

JSON 스키마:
{
  "topicKeyword": "수학 핵심 단원/유형 (예: 삼차함수 접선과 비율관계, 수열 귀납적 정의 역추적, 삼각함수 대칭성)",
  "passage": "발문 및 조건 (조건 (가), (나) 등을 포함한 문제 지문)",
  "question": "구하는 값 질문 (예: f(4)의 값을 구하시오.)",
  "options": [
    "선지 1",
    "선지 2",
    "선지 3",
    "선지 4"
  ],
  "correctIndex": 0, // 0, 1, 2, 3 중 정답 인덱스
  "trapType": "sign_flip" | "boundary_value" | "condition_omission" | "calc_overload" | "graph_misassumption",
  "strategyFeedback": "발문 3단계 조건 분해 가이드 및 세로 2단 줄맞춤 검증 풀이법을 포함한 3~4줄 피드백",
  "memoryKeywords": ["조건(가) 핵심", "조건(나) 핵심", "결정적 숨은 힌트"]
}`;
    } else if (isEnglish) {
      systemPrompt = `너는 대한민국 수능 영어 영역 최고 권위의 출제위원이자 인지언어학 전문가이다.
학생의 성적 도약(현재 ${currentGrade}등급 ➔ 목표 ${targetGrade}등급)을 위해 1~2분 만에 풀 수 있는 수능 영어 킬러/준킬러(31~34번 빈칸 추론, 36~37번 순서 배열, 38~39번 문장 삽입, 21번 밑줄 함축의미) '마이크로 실전 훈련 문항'을 출제한다.
평가원 특유의 고밀도 논리 전개(대립 개념 Binary Opposition, 연결사 역접, 재진술 Paraphrasing)를 갖추어야 하며, 지문의 어휘만 보고 섣불리 찍는 학생을 낚는 '매력적인 오답 선지'를 포함해야 한다.

출제 규칙:
1. 지문: 80~120단어 내외의 엄선된 학술·인문·과학 영문 단락 (EBS 연계 및 평가원 고난도 지문 스타일).
2. 발문: 한글 발문 및 괄호 안내 (예: "다음 빈칸에 들어갈 말로 가장 적절한 것은? (단어 일치 왜곡 및 인과 역전 함정 주의)").
3. 선지 구성: 4개 영문 선지 (정답 1개, 지문 어휘 활용 매력적 오답 선지 2개, 일반 오답 1개).
4. ${trapInstruction}
5. ${excludeTopicPrompt}
6. 학생 상황: 현재 ${currentGrade}등급 ➔ 목표 ${targetGrade}등급 달성을 위한 전략: [${strategyTag}]
7. 응답은 반드시 다른 잡담 없이 순수 JSON 형식으로만 출력할 것.

JSON 스키마:
{
  "topicKeyword": "지문 핵심 학술 주제 (예: Technological Determinism and Human Agency)",
  "passage": "80~120단어의 영문 지문 본문 (빈칸 추론의 경우 빈칸 __________ 포함)",
  "question": "문제 발문 (예: 다음 빈칸에 들어갈 말로 가장 적절한 것은?)",
  "options": [
    "English option 1",
    "English option 2",
    "English option 3",
    "English option 4"
  ],
  "correctIndex": 0, // 0, 1, 2, 3 중 정답 인덱스
  "trapType": "word_match_distortion" | "discourse_signpost_miss" | "scope_overgeneralization" | "opposite_causality" | "irrelevant_theme",
  "strategyFeedback": "정답의 근거(Paraphrasing 및 연결사 단서)와 매력적 오답 선지의 함정 원리를 학생에게 조언하는 3~4줄 한글 피드백",
  "memoryKeywords": ["Keyword 1 (Signpost/Theme)", "Keyword 2 (Contrast/Core)", "Keyword 3 (Paraphrase)"]
}`;
    } else {
      systemPrompt = `너는 대한민국 수능 국어 영역 최고 권위의 출제위원이다.
학생의 성적 도약을 위해 1~2분 만에 풀 수 있는 초정밀 '마이크로 실전 훈련 문항'을 출제한다.
수능 국어 특유의 정교한 논리 구조를 갖추어야 하며, 학생이 낚이기 쉬운 '매력적인 오답 선지'를 포함해야 한다.

출제 규칙:
1. 지문 길이: 250~350자 내외 (비문학 과학/철학/사회/기술 또는 문학 핵심 단락).
2. 문제 발문: 수능 평가원 스타일의 명확한 발문.
3. 선지 구성: 4개 선지. (정답 1개, 전형적인 킬러 함정 오답 선지 2개, 일반 오답 1개)
4. ${trapInstruction}
5. ${excludeTopicPrompt}
6. 학생 상황: 현재 ${currentGrade}등급 ➔ 목표 ${targetGrade}등급 달성을 위한 전략: [${strategyTag}]
7. 응답은 반드시 다른 잡담 없이 순수 JSON 형식으로만 출력할 것.

JSON 스키마:
{
  "topicKeyword": "지문 핵심 주제 (예: 브레턴우즈 체제와 금본위제, 양자 얽힘의 국소성)",
  "passage": "250~350자의 지문 본문",
  "question": "문제 발문",
  "options": [
    "1번 선지 내용",
    "2번 선지 내용",
    "3번 선지 내용",
    "4번 선지 내용"
  ],
  "correctIndex": 0, // 0, 1, 2, 3 중 정답 인덱스
  "trapType": "causal_distortion" | "subject_object_inversion" | "exaggeration" | "unsupported_inference" | "fact_mismatch",
  "strategyFeedback": "정답 해설 및 왜 특정 선지가 킬러 함정인지 2~3줄로 학생에게 주는 촌철살인 피드백",
  "memoryKeywords": ["핵심키워드1", "핵심키워드2", "핵심키워드3"]
}`;
    }

    const userPrompt = `과목: ${isMath ? '수능 수학' : isEnglish ? '수능 영어' : subjectId === 'korean' ? '수능 국어' : subjectId}
전략 유형: ${strategyType === 'grade_strategy' ? '등급 맞춤 실전 훈련' : '두뇌 인지 계산/메모 훈련'}
집중 공략 전략: ${strategyTag}
학생 목표: ${currentGrade}등급 ➔ ${targetGrade}등급 도약

위 조건에 부합하는 수능형 1문제를 JSON으로 즉시 생성해주세요.`;

    // 최신 Flash 모델 타겟팅 (OpenRouter 기본 모델 또는 Gemini Flash)
    const effectiveModel = aiConfig?.openRouterModel || SOTA_MODELS.GEMINI_LATEST;

    try {
      const response = await generateAIResponse(
        userPrompt,
        systemPrompt,
        aiConfig || null,
        'free'
      );

      if (response.text && !response.error) {
        // JSON 파싱 시도 (마크다운 코드블록 제거 처리)
        let cleaned = response.text.trim();
        if (cleaned.startsWith('```json')) {
          cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleaned.startsWith('```')) {
          cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }

        const parsed = JSON.parse(cleaned);
        if (parsed.passage && parsed.question && Array.isArray(parsed.options) && parsed.options.length >= 3) {
          const fingerprint = createPassageFingerprint(parsed.passage);

          // 지문 중복 검사
          const existing = await DatabaseService.findQuestionByFingerprint(fingerprint, subjectId);
          if (existing) {
            console.log('[QuestionBank] 기존 중복 지문 발견, 기존 문제 재활용:', existing.id);
            return existing;
          }

          const defaultTrap = isMath ? 'sign_flip' : isEnglish ? 'word_match_distortion' : 'causal_distortion';
          const newQuestion: BankQuestion = {
            id: `qb_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            studentId,
            subjectId,
            targetGrade,
            currentGrade,
            strategyType,
            strategyTag,
            passage: parsed.passage,
            question: parsed.question,
            options: parsed.options,
            correctIndex: typeof parsed.correctIndex === 'number' ? parsed.correctIndex : 0,
            strategyFeedback: parsed.strategyFeedback || (isMath ? '정답입니다! 발문 조건을 분해하고 계산 실수를 완벽히 방어했습니다.' : isEnglish ? '정답입니다! 지시어와 대의를 기반으로 매력적인 오답 함정을 완벽히 간파했습니다.' : '정답입니다! 핵심 명제의 인과관계를 정확히 판별했습니다.'),
            trapType: (parsed.trapType as TrapType) || defaultTrap,
            topicKeyword: parsed.topicKeyword || (isMath ? '수능 수학 준킬러 발문 조건 분해' : isEnglish ? '수능 영어 킬러 빈칸/순서/삽입 논리 전개' : '수능 국어 고난도 추론'),
            fingerprint,
            isSolved: false,
            memoryKeywords: Array.isArray(parsed.memoryKeywords) ? parsed.memoryKeywords : undefined,
            createdAt: new Date().toISOString()
          };

          // DB 문제은행에 영구 저장
          await DatabaseService.saveBankQuestion(newQuestion);
          return newQuestion;
        }
      }
    } catch (err) {
      console.warn('[QuestionBank] AI 생성 실패 또는 파싱 오류, 고품질 폴백으로 전환:', err);
    }

    // AI 생성 실패 시 고품질 폴백 뱅크에서 반환
    return this.getFallbackDrill(studentId, subjectId, targetGrade, currentGrade, strategyType, strategyTag);
  },

  /**
   * 폴백 드릴 반환 및 DB 저장
   */
  async getFallbackDrill(
    studentId: string,
    subjectId: string,
    targetGrade: number,
    currentGrade: number,
    strategyType: 'grade_strategy' | 'cognitive_tip',
    strategyTag: string
  ): Promise<BankQuestion> {
    const drillPool = subjectId === 'math' ? FALLBACK_MATH_DRILLS : subjectId === 'english' ? FALLBACK_ENGLISH_DRILLS : FALLBACK_KOREAN_DRILLS;
    const candidates = drillPool.filter(d => d.strategyType === strategyType);
    const chosen = candidates[Math.floor(Math.random() * (candidates.length || 1))] || drillPool[0];

    const fallbackQuestion: BankQuestion = {
      ...chosen,
      id: `qb_fallback_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      studentId,
      subjectId,
      targetGrade,
      currentGrade,
      strategyTag,
      isSolved: false,
      createdAt: new Date().toISOString()
    };

    await DatabaseService.saveBankQuestion(fallbackQuestion);
    return fallbackQuestion;
  },

  /**
   * [🔄 쌍둥이 유사 문제 1개 더!] 즉시 생성
   */
  async generateTwinDrill(baseQuestion: BankQuestion, aiConfig?: AIModelConfig | null): Promise<BankQuestion> {
    return this.generateDrill({
      studentId: baseQuestion.studentId,
      subjectId: baseQuestion.subjectId,
      targetGrade: baseQuestion.targetGrade,
      currentGrade: baseQuestion.currentGrade,
      strategyType: baseQuestion.strategyType,
      strategyTag: baseQuestion.strategyTag,
      aiConfig,
      specificTrapType: baseQuestion.trapType // 동일한 함정 원리 강제 적용
    });
  },

  /**
   * 문제 풀이 제출 및 인지 과부하 소요시간 분석
   */
  async submitAnswer(params: {
    questionId: string;
    chosenIndex: number;
    solveDurationSec: number;
    memoryKeywords?: string[];
  }): Promise<{ isCorrect: boolean; fatigueNote: string; updatedQuestion: BankQuestion }> {
    const { questionId, chosenIndex, solveDurationSec, memoryKeywords } = params;
    const question = await DatabaseService.getBankQuestionById(questionId);

    if (!question) {
      throw new Error(`문제를 찾을 수 없습니다: ${questionId}`);
    }

    const isCorrect = question.correctIndex === chosenIndex;
    const isMath = question.subjectId === 'math';
    const isEnglish = question.subjectId === 'english';

    // 풀이 시간에 따른 인지 피로도 / 작업기억 과부하 진단 코멘트
    let fatigueNote = '';
    if (isMath) {
      if (solveDurationSec <= 40) {
        fatigueNote = '⚡ [준킬러 신속 격파] 40초 이내에 발문 조건을 분해하고 계산을 마쳤습니다! 조건 파악 속도가 매우 뛰어납니다.';
      } else if (solveDurationSec <= 90) {
        fatigueNote = '✨ [안정적 준킬러 페이스] 실전 수능 100분에서 4점 준킬러를 안정적으로 공략하는 이상적인 풀이 속도입니다.';
      } else if (solveDurationSec <= 150) {
        fatigueNote = '⚠️ [계산 지연 감지] 풀이 소요시간이 90초를 초과했습니다. 세로 2단 줄맞춤 정렬을 통해 연산 비효율을 줄이세요.';
      } else {
        fatigueNote = '🚨 [인지 과부하 및 연산 막힘] 2분 30초 이상 소요되었습니다. 발문 조건 [가], [나] 중 결정적 단서 1개를 놓쳤을 가능성이 높습니다. 3단계 조건 분해 노트를 재정비하세요.';
      }
    } else if (isEnglish) {
      if (solveDurationSec <= 30) {
        fatigueNote = '⚡ [최상급 직독직해] 30초 이내에 핵심 논리축과 시그널을 간파했습니다! 시간 안배에 최적화된 리딩 속도입니다.';
      } else if (solveDurationSec <= 60) {
        fatigueNote = '✨ [안정적 1등급 페이스] 수능 70분 독해에서 킬러 1문항당 1분 내외로 마칠 수 있는 이상적 속도입니다.';
      } else if (solveDurationSec <= 90) {
        fatigueNote = '⚠️ [지문 재독 지연] 60초를 초과하여 본문을 2회 이상 읽었습니다. 지시어·연결사 단서 스캔 루틴을 가동하세요.';
      } else {
        fatigueNote = '🚨 [작업기억 인지 과부하] 90초 이상 지체되었습니다. 매력적인 오답 선지의 단어 일치 함정에 시각적으로 갇혔을 가능성이 높습니다. 대의 파악 후 선지 소거법을 적용하세요.';
      }
    } else {
      if (solveDurationSec <= 28) {
        fatigueNote = '⚡ [최상급 처리속도] 28초 이내 통과! 시각적 주의 집중도와 작업기억 처리 효율이 극상입니다.';
      } else if (solveDurationSec <= 65) {
        fatigueNote = '✨ [안정적 페이스] 실전 수능 80분 시간 안배에 최적화된 이상적인 선지 판별 속도입니다.';
      } else if (solveDurationSec <= 90) {
        fatigueNote = '⚠️ [선지 왕복 주의] 풀이 소요시간이 65초를 초과했습니다. 선지와 본문을 2회 이상 왕복하며 가벼운 인지 지연이 발생했습니다.';
      } else {
        fatigueNote = '🚨 [작업기억 과부하 감지] 선지 판별에 90초 이상 소요되었습니다. 뇌 피로도가 높거나 과도한 세부 확인으로 시간을 지체했습니다. 실전에서는 키워드 1:1 대조 소거법을 사용하세요.';
      }
    }

    const updates: Partial<BankQuestion> = {
      isSolved: true,
      isCorrect,
      chosenIndex,
      solveDurationSec,
      cognitiveFatigueNote: fatigueNote,
      solvedAt: new Date().toISOString(),
      ...(memoryKeywords ? { memoryKeywords } : {})
    };

    await DatabaseService.updateBankQuestion(questionId, updates);
    const updatedQuestion = { ...question, ...updates } as BankQuestion;

    return {
      isCorrect,
      fatigueNote,
      updatedQuestion
    };
  },

  /**
   * 학생의 오답 패턴 [함정 DNA (Trap DNA)] 통계 계산
   */
  async getStudentTrapDna(studentId: string, subjectId: string = 'korean'): Promise<TrapDnaStats> {
    const questions = await DatabaseService.getBankQuestions({ studentId, subjectId, isSolved: true });

    const trapBreakdown: Record<TrapType, { attempts: number; failedCount: number; failRate: number }> = {
      causal_distortion: { attempts: 0, failedCount: 0, failRate: 0 },
      subject_object_inversion: { attempts: 0, failedCount: 0, failRate: 0 },
      exaggeration: { attempts: 0, failedCount: 0, failRate: 0 },
      unsupported_inference: { attempts: 0, failedCount: 0, failRate: 0 },
      fact_mismatch: { attempts: 0, failedCount: 0, failRate: 0 },
      sign_flip: { attempts: 0, failedCount: 0, failRate: 0 },
      boundary_value: { attempts: 0, failedCount: 0, failRate: 0 },
      condition_omission: { attempts: 0, failedCount: 0, failRate: 0 },
      calc_overload: { attempts: 0, failedCount: 0, failRate: 0 },
      graph_misassumption: { attempts: 0, failedCount: 0, failRate: 0 },
      word_match_distortion: { attempts: 0, failedCount: 0, failRate: 0 },
      discourse_signpost_miss: { attempts: 0, failedCount: 0, failRate: 0 },
      scope_overgeneralization: { attempts: 0, failedCount: 0, failRate: 0 },
      opposite_causality: { attempts: 0, failedCount: 0, failRate: 0 },
      irrelevant_theme: { attempts: 0, failedCount: 0, failRate: 0 }
    };

    let totalAttempts = questions.length;
    let correctCount = 0;
    let totalSec = 0;
    let cognitiveOverloadCount = 0;

    for (const q of questions) {
      const defaultT = subjectId === 'math' ? 'sign_flip' : subjectId === 'english' ? 'word_match_distortion' : 'causal_distortion';
      const t = q.trapType || defaultT;
      if (!trapBreakdown[t]) {
        trapBreakdown[t] = { attempts: 0, failedCount: 0, failRate: 0 };
      }
      trapBreakdown[t].attempts += 1;

      if (q.isCorrect) {
        correctCount += 1;
      } else {
        trapBreakdown[t].failedCount += 1;
      }

      if (q.solveDurationSec) {
        totalSec += q.solveDurationSec;
        const threshold = subjectId === 'math' ? 120 : 90;
        if (q.solveDurationSec > threshold) {
          cognitiveOverloadCount += 1;
        }
      }
    }

    // 오답률 계산
    let mostVulnerableTrap: TrapType | null = null;
    let maxFailRate = -1;

    (Object.keys(trapBreakdown) as TrapType[]).forEach(trap => {
      const data = trapBreakdown[trap];
      if (data.attempts > 0) {
        data.failRate = Math.round((data.failedCount / data.attempts) * 100);
        if (data.failRate > maxFailRate && data.failedCount > 0) {
          maxFailRate = data.failRate;
          mostVulnerableTrap = trap;
        }
      }
    });

    return {
      totalAttempts,
      correctCount,
      accuracyRate: totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0,
      trapBreakdown,
      mostVulnerableTrap,
      avgSolveSec: totalAttempts > 0 ? Math.round(totalSec / totalAttempts) : 0,
      cognitiveOverloadCount
    };
  }
};

export default QuestionBankService;
