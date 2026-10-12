import { LadderQuestion, LadderStageLevel, AIModelConfig } from '../types';
import { SUBJECT_LADDER_AI_CONFIG, SubjectLadderConfigKey } from './aiModelConfig';
import { generateAIResponseWithModel } from './aiService';
import { getQuestionsForUnit, shuffleLadderOptions } from '../data/ladderQuestions';
import { SUNEUNG_SUBJECTS } from '../data/suneungSubjects';

// 탐구(사탐/과탐/한국사/제2외국어) 판별 키워드
const INQUIRY_KEYWORDS = [
  '탐구', '사탐', '과탐', '물리', '화학', '생명', '지구', '윤리', '지리',
  '역사', '경제', '정치', '사회', '한국사', '한문', '외국어', '철학', '사상',
  '가계도', '유전', '역학', '평형', '지질', '대기', '해양'
];

/**
 * 과목명/단원명으로부터 과목 식별자('korean' | 'math' | 'english' | 'inquiry') 판별
 * (국·영 우선 판정 후 탐구 판정, 그 외는 수학 — 기존 동작 유지)
 */
export const detectSubjectKey = (subjectName: string, unitName: string = ''): SubjectLadderConfigKey => {
  const s = `${subjectName} ${unitName}`.toLowerCase();
  if (s.includes('국어') || s.includes('kor') || s.includes('독서') || s.includes('문학') || s.includes('문법') || s.includes('화작') || s.includes('언매')) {
    return 'korean';
  }
  if (s.includes('영어') || s.includes('eng') || s.includes('빈칸') || s.includes('순서') || s.includes('어법') || s.includes('삽입') || s.includes('대의')) {
    return 'english';
  }
  // 탐구: 수능 과목명 매칭 또는 탐구 키워드
  const matchedInquiry = SUNEUNG_SUBJECTS.some(sub =>
    (sub.category === 'social' || sub.category === 'science' || sub.category === 'required' || sub.category === 'foreign') &&
    sub.name && s.includes(sub.name.toLowerCase())
  );
  if (matchedInquiry || INQUIRY_KEYWORDS.some(k => s.includes(k.toLowerCase()))) {
    return 'inquiry';
  }
  return 'math';
};

/**
 * 단계별 표준 난이도 및 목표
 */
const STAGE_META: Record<LadderStageLevel, { difficulty: LadderQuestion['difficulty']; desc: string }> = {
  A: { difficulty: '기본', desc: '1~2점 수준 교과서 핵심 개념 및 기본 공식/어휘 직접 적용 (정답률 85% 이상 목표)' },
  B: { difficulty: '응용', desc: '3점 기본 수준 개념 2개 결합 및 조건식 전개 (정답률 75% 목표)' },
  C: { difficulty: '심화', desc: '3점 고난도 수준 함정 선지/식 변형 해석 및 논리 연결 (정답률 65% 목표)' },
  D: { difficulty: '기출', desc: '수능/평가원 최근 3개년 4점 빈출 유형 실전 문항 (정답률 55% 목표)' },
  E: { difficulty: '준킬러', desc: '수능 4점 준킬러 복합 발문 분해 및 다단계 추론 (정답률 40% 목표)' },
  F: { difficulty: '수능킬러', desc: '수능 1등급 결정 최상위 킬러 문항 및 복합 심화 함정 (정답률 25% 목표)' },
};

/**
 * 과목별 특화 프롬프트 생성기
 */
const buildPromptForStage = (
  subjectKey: SubjectLadderConfigKey,
  subjectName: string,
  unitName: string,
  stage: LadderStageLevel,
  careTypeCode: string = 'HEALTHY'
): { system: string; user: string } => {
  const meta = STAGE_META[stage];

  if (subjectKey === 'korean') {
    // 📖 국어 특화 (Claude Sonnet 5.5 최적화)
    const system = `당신은 대한민국 수능 국어(독서·문학·언매) 평가원 출제위원급 AI 출제 교수입니다.
현재 수능 출제 기조에 맞추어 '${unitName}' 단원의 [${stage}단계: ${meta.desc}] 맞춤 5문항을 생성하세요.

[필수 평가원 출제 및 선지 규칙]
1. 지문과 발문은 실제 수능 시험지처럼 엄밀하고 자연스러운 한국어로 서술하세요. 번역투나 인위적 어색함을 완전히 배제하세요.
2. 5지선다 객관식(options) 5개를 만들고, 정답 1개와 매력적인 오답 4개를 배치하세요.
3. 오답 선지에는 수능 국어 5대 함정 DNA(인과 왜곡, 주객 전도, 과도한 일반화, 본문에 없는 외부 상식 개입, 지엽적 사실 왜곡)를 의도적으로 녹여내세요.
4. 반드시 순수 JSON 배열 포맷만 반환하세요. 마크다운이나 잡담은 일절 포함하지 마세요.`;

    const user = `과목: ${subjectName}
단원: ${unitName}
사다리 단계: ${stage}단계 (${meta.difficulty}) - ${meta.desc}
피검 학생 케어타입: ${careTypeCode}

위 조건에 부합하는 정밀 5문항을 다음 JSON 구조의 배열로 반환하세요:
[
  {
    "id": "ai_${subjectKey}_${stage}_1",
    "stage": "${stage}",
    "questionNumber": 1,
    "title": "문항 핵심 테마",
    "question": "수능형 발문 (필요 시 [지문] 또는 <보기> 포함)",
    "options": ["1번 선지", "2번 선지", "3번 선지", "4번 선지", "5번 선지"],
    "answer": "정답 선지와 완전히 동일한 텍스트 또는 번호",
    "solution": "[평가원식 3단계 해설]\\n1단계 지문 핵심 명제\\n2단계 정답 근거\\n3단계 매력적 오답 소거 원리",
    "hint": "힌트 1문장",
    "conceptKey": "핵심 연계 개념",
    "difficulty": "${meta.difficulty}"
  },
  ... (총 5문항)
]`;
    return { system, user };
  } else if (subjectKey === 'math') {
    // 🧮 수학 특화 (DeepSeek V4.1 Flash 최적화)
    const system = `당신은 수능 수학 영역 출제 및 검산 최고 권위 AI 수학교수입니다.
'${unitName}' 단원의 [${stage}단계: ${meta.desc}] 맞춤 5문항을 생성하세요.

[수학 연산 및 조건식 무결성 절대 규칙]
1. 모든 수식과 조건식은 수학적으로 100% 정합해야 하며, 실근이 존재하지 않거나 모순되는 조건을 절대 출제하지 마세요.
2. options 5개 중 정답(answer)은 오직 1개만 유일하게 일치해야 합니다. 나머지 4개는 계산 실수(부호 오류, 상수항 누락 등) 유발 선지로 만드세요.
3. 수식은 텍스트 또는 표준 LaTeX($...$)를 적절히 활용하여 수험생이 읽기 편하게 작성하세요.
4. 반드시 순수 JSON 배열 포맷만 반환하세요. 마크다운이나 설명 문구는 금지합니다.`;

    const user = `과목: ${subjectName}
단원: ${unitName}
사다리 단계: ${stage}단계 (${meta.difficulty}) - ${meta.desc}
피검 학생 케어타입: ${careTypeCode}

위 조건에 맞는 오류 없는 정밀 5문항을 다음 JSON 포맷의 배열로 생성하세요:
[
  {
    "id": "ai_${subjectKey}_${stage}_1",
    "stage": "${stage}",
    "questionNumber": 1,
    "title": "핵심 개념 유형",
    "question": "정확한 수식 및 발문",
    "options": ["보기1", "보기2", "보기3", "보기4", "보기5"],
    "answer": "정답 보기와 동일한 값",
    "solution": "[상세 풀이 과정]\\n1단계: 문제 조건 정리\\n2단계: 핵심 공식 적용 및 연산\\n3단계: 최종 정답 도출",
    "hint": "풀이 실마리 힌트",
    "conceptKey": "적용 수학 공식",
    "difficulty": "${meta.difficulty}"
  },
  ... (총 5문항)
]`;
    return { system, user };
  } else if (subjectKey === 'english') {
    // ⚡ 영어 특화 (Gemini 3.8 Flash 최적화)
    const system = `You are an elite CSAT (Korean University Entrance Exam) English test writer and academic linguist.
Generate 5 high-standard multiple-choice questions for '${unitName}' at [Stage ${stage}: ${meta.desc}].

[CSAT English Guidelines]
1. Use academic-level reading passages (Lexile 1050~1300) with clear thesis, logical signal words (However, Therefore, Conversely), and cohesive paragraph structure.
2. Provide exactly 5 options with one clear correct answer and 4 plausible distractors (e.g., reversal of cause-effect, overly specific detail, extreme generalization).
3. Provide step-by-step solutions and clear eliminate-the-distractor logic in Korean.
4. Output strictly valid JSON array only. No markdown formatting outside of JSON.`;

    const user = `Subject: ${subjectName}
Unit: ${unitName}
Ladder Stage: Stage ${stage} (${meta.difficulty}) - ${meta.desc}
Student CareType: ${careTypeCode}

Generate 5 rigorous questions in the following JSON array structure:
[
  {
    "id": "ai_${subjectKey}_${stage}_1",
    "stage": "${stage}",
    "questionNumber": 1,
    "title": "Passage Theme / Question Type",
    "question": "English Passage followed by Question prompt (e.g., Which of the following best fits the blank?)",
    "options": ["Option 1", "Option 2", "Option 3", "Option 4", "Option 5"],
    "answer": "Exact matching string of the correct option",
    "solution": "[정답 및 오답 상세 해설]\\n1. 지문 대의 및 논리 전개\\n2. 정답 근거\\n3. 오답 선지 소거 원리",
    "hint": "Clue focusing on Signal Words and core thesis",
    "conceptKey": "Academic Reading Structure",
    "difficulty": "${meta.difficulty}"
  },
  ... (Total 5 questions)
]`;
    return { system, user };
  } else {
    // 🔬 탐구 특화 (Gemini 3.8 Flash 최적화, 문제은행 없이 LLM 실시간 출제)
    const system = `당신은 대한민국 수능 탐구영역(사회탐구·과학탐구·한국사) 평가원 출제위원급 AI 출제 교수입니다.
'${unitName}' 단원의 [${stage}단계: ${meta.desc}] 맞춤 5문항을 생성하세요.

[탐구 출제 절대 규칙]
1. 개념 확인형과 자료 해석형(도표·그래프·실험·지도·연표 상황 제시)을 단계 난이도에 맞게 배합하세요. 자료는 문제 안에 텍스트로 완결되게 제시하세요.
2. 5지선다 객관식(options) 5개를 만들고 정답 1개와 매력적인 오답 4개(흔한 오개념, 단위·조건 착각, 과도한 일반화, 지엽 함정)를 배치하세요.
3. 해설(solution)에는 정답 도출 과정과 오답 소거 원리를 단계별로 서술하세요.
4. 반드시 순수 JSON 배열 포맷만 반환하세요. 마크다운이나 설명 문구는 금지합니다.`;

    const user = `과목: ${subjectName}
단원: ${unitName}
사다리 단계: ${stage}단계 (${meta.difficulty}) - ${meta.desc}
피검 학생 케어타입: ${careTypeCode}

위 조건에 맞는 탐구 5문항을 다음 JSON 포맷의 배열로 생성하세요:
[
  {
    "id": "ai_inquiry_${stage}_1",
    "stage": "${stage}",
    "questionNumber": 1,
    "title": "핵심 개념·자료 유형",
    "question": "발문 (필요 시 [자료] 포함)",
    "options": ["보기1", "보기2", "보기3", "보기4", "보기5"],
    "answer": "정답 보기와 동일한 값",
    "solution": "[상세 풀이 과정]\\n1단계: 핵심 개념 확인\\n2단계: 자료·조건 분석\\n3단계: 정답 도출 및 오답 소거",
    "hint": "풀이 실마리 힌트",
    "conceptKey": "적용 핵심 개념",
    "difficulty": "${meta.difficulty}"
  },
  ... (총 5문항)
]`;
    return { system, user };
  }
};

/**
 * AI 응답 문자열에서 안전하게 JSON 파싱
 */
const parseQuestionsFromJson = (rawText: string, fallbackQuestions: LadderQuestion[], stage: LadderStageLevel): LadderQuestion[] => {
  try {
    let clean = rawText.trim();
    // 마크다운 코드 블록 제거
    if (clean.includes('```json')) {
      clean = clean.split('```json')[1].split('```')[0].trim();
    } else if (clean.includes('```')) {
      clean = clean.split('```')[1].split('```')[0].trim();
    }

    const parsed = JSON.parse(clean);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error('Parsed result is not a non-empty array');
    }

    // 필드 유효성 정규화
    const validQuestions: LadderQuestion[] = parsed.map((item, idx) => {
      const qNum = typeof item.questionNumber === 'number' ? item.questionNumber : idx + 1;
      const options = Array.isArray(item.options) && item.options.length >= 2 
        ? item.options.map(String)
        : ['1번', '2번', '3번', '4번', '5번'];
      
      const answer = item.answer !== undefined ? String(item.answer) : options[0];

      return {
        id: item.id || `ai_gen_${stage}_${qNum}_${Date.now()}`,
        stage,
        questionNumber: qNum,
        title: item.title || `[AI 생성] ${stage}단계 ${qNum}번`,
        question: item.question || '문제를 불러오지 못했습니다.',
        options,
        answer,
        solution: item.solution || '상세 해설이 준비 중입니다.',
        hint: item.hint || '지문의 핵심 조건을 다시 한번 정독하세요.',
        conceptKey: item.conceptKey || '단원 핵심 원리',
        difficulty: STAGE_META[stage].difficulty,
      };
    });

    return shuffleLadderOptions(validQuestions).slice(0, 5);
  } catch (err) {
    console.warn('[LadderAiGenerator] JSON 파싱 실패, 표준 문항으로 대체:', err);
    return fallbackQuestions;
  }
};

/**
 * 🌟 특정 단계(Stage A ~ F)의 문항 5개를 과목별 특화 AI로 실시간 생성
 */
export const generateStageLadderQuestionsAI = async (
  subjectName: string,
  unitName: string,
  stage: LadderStageLevel,
  careTypeCode: string = 'HEALTHY',
  config: AIModelConfig | null = null
): Promise<{ questions: LadderQuestion[]; aiModelUsed: string; isAiGenerated: boolean; provider: string }> => {
  const subjectKey = detectSubjectKey(subjectName, unitName);
  const aiConfig = SUBJECT_LADDER_AI_CONFIG[subjectKey];

  // 기존 표준 문항에서 해당 단계 5문항 추출 (폴백용)
  const defaultQuestions = getQuestionsForUnit(unitName, subjectName).filter(q => q.stage === stage);

  try {
    const { system, user } = buildPromptForStage(subjectKey, subjectName, unitName, stage, careTypeCode);

    // 과목별 특화 모델 호출 (국어: Claude 5.5, 수학: DeepSeek V4.1, 영어/탐구: Gemini 3.8)
    const response = await generateAIResponseWithModel(
      user,
      system,
      aiConfig.primaryModel,
      aiConfig.fallbackModel,
      config,
      3000
    );

    if (response.text && !response.error) {
      const parsed = parseQuestionsFromJson(response.text, defaultQuestions, stage);
      if (parsed.length > 0) {
        return {
          questions: parsed,
          aiModelUsed: response.model || aiConfig.primaryModel,
          isAiGenerated: true,
          provider: aiConfig.providerName
        };
      }
    }

    console.warn(`[LadderAiGenerator] AI 응답 실패 (${aiConfig.modelDisplayName}), 표준 기출 문항으로 대체합니다.`);
    return {
      questions: defaultQuestions,
      aiModelUsed: '표준 평가원 기출 라이브러리',
      isAiGenerated: false,
      provider: 'Standard Curated'
    };
  } catch (error) {
    console.error('[LadderAiGenerator] 문항 생성 중 예외 발생:', error);
    return {
      questions: defaultQuestions,
      aiModelUsed: '표준 평가원 기출 라이브러리',
      isAiGenerated: false,
      provider: 'Standard Curated'
    };
  }
};

/**
 * 🌟 단원의 전체 6단계(A~F, 총 30문항)에 대해 AI 생성본이 캐시되어 있는지 확인하거나 생성
 */
export const getCachedOrGenerateStageQuestions = async (
  subjectName: string,
  unitName: string,
  stage: LadderStageLevel,
  careTypeCode: string = 'HEALTHY',
  config: AIModelConfig | null = null,
  forceRegenerate: boolean = false
): Promise<{ questions: LadderQuestion[]; aiModelUsed: string; isAiGenerated: boolean; provider: string }> => {
  const cacheKey = `nbass_ladder_ai_${subjectName}_${unitName}_stage_${stage}`;

  if (!forceRegenerate && typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed.questions) && parsed.questions.length > 0) {
          return parsed;
        }
      }
    } catch {
      // 캐시 읽기 실패 시 통과
    }
  }

  // 신규 생성
  const result = await generateStageLadderQuestionsAI(subjectName, unitName, stage, careTypeCode, config);

  // 생성 성공 시 로컬 캐싱
  if (result.isAiGenerated && typeof window !== 'undefined') {
    try {
      localStorage.setItem(cacheKey, JSON.stringify(result));
    } catch {
      // 용량 초과 시 무시
    }
  }

  return result;
};
