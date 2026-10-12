/**
 * AI 모델 설정 단일 진실 원천 (Single Source of Truth)
 *
 * - 클라이언트(services/aiService.ts)와 서버(server.ts)가 동일한 허용 목록을 공유하여
 *   모델명 드리프트로 인한 400/차단 오류를 방지합니다.
 * - 사용자/요청에서 전달된 모델명은 반드시 이 목록 안에 있어야 하며, 임의 문자열은 거부됩니다.
 * - 구형 모델명은 하위 호환용으로만 유지되며 신규 호출에는 권장 모델을 사용합니다.
 */

/** 허용 모델 목록 (화이트리스트) */
export const MODEL_ALLOWLIST = [
    // 2026년 최신 플래그십 라인업
    'anthropic/claude-5.5-sonnet',
    'deepseek/deepseek-v4.1-flash',
    'google/gemini-3.8-flash',

    // 기존 세대 및 하위 호환
    'anthropic/claude-3.7-sonnet',
    'anthropic/claude-3.5-sonnet',
    'anthropic/claude-3.5-haiku',
    'google/gemini-2.5-flash',
    'google/gemini-2.0-flash-001',
    'deepseek/deepseek-chat',
    'deepseek/deepseek-r1',
    'meta-llama/llama-3.3-70b-instruct',
] as const;

export type AllowedModel = (typeof MODEL_ALLOWLIST)[number];

/** 용도별 권장(최신) 모델 별칭 */
export const SOTA_MODELS = {
    // 2026 최신 세대 메인
    CLAUDE_LATEST: 'anthropic/claude-5.5-sonnet',
    CLAUDE_OPUS: 'anthropic/claude-5.5-sonnet',
    CLAUDE_FAST: 'anthropic/claude-3.5-haiku',
    GEMINI_LATEST: 'google/gemini-3.8-flash',
    GEMINI_PRO_LATEST: 'google/gemini-3.8-flash',
    DEEPSEEK_REASONER: 'deepseek/deepseek-v4.1-flash',
    DEEPSEEK_CHAT: 'deepseek/deepseek-v4.1-flash',
    LLAMA_LATEST: 'meta-llama/llama-3.3-70b-instruct',

    // 하위 호환용 별칭 (구형 호출이 깨지지 않도록 유지)
    LEGACY_CLAUDE_37: 'anthropic/claude-3.7-sonnet',
    LEGACY_CLAUDE_35: 'anthropic/claude-3.5-sonnet',
    LEGACY_GEMINI_25: 'google/gemini-2.5-flash',
    LEGACY_GEMINI_20: 'google/gemini-2.0-flash-001',
    LEGACY_DEEPSEEK_R1: 'deepseek/deepseek-r1',
} as const;

/** 국·수·영 6단계 AI 사다리 훈련 과목별 특화 AI 매핑 */
export const SUBJECT_LADDER_AI_CONFIG = {
    korean: {
        subjectKey: 'korean' as const,
        subjectName: '국어',
        primaryModel: 'anthropic/claude-5.5-sonnet' as AllowedModel,
        fallbackModel: 'google/gemini-3.8-flash' as AllowedModel,
        modelDisplayName: 'Claude Sonnet 5.5',
        providerName: 'Anthropic',
        specialtyBadge: '📖 문맥·평가원 오답 함정 특화',
        description: '국어 비문학/문학 지문 맥락 분석 및 평가원 5대 함정 선지(Trap DNA) 설계 최적화'
    },
    math: {
        subjectKey: 'math' as const,
        subjectName: '수학',
        primaryModel: 'deepseek/deepseek-v4.1-flash' as AllowedModel,
        fallbackModel: 'anthropic/claude-5.5-sonnet' as AllowedModel,
        modelDisplayName: 'DeepSeek V4.1 Flash',
        providerName: 'DeepSeek',
        specialtyBadge: '🧮 수식 연산·무오류 추론 특화',
        description: '수학 조건식 변형, 단계별 연산 검증 및 논리적 무결성 확보에 최적화'
    },
    english: {
        subjectKey: 'english' as const,
        subjectName: '영어',
        primaryModel: 'google/gemini-3.8-flash' as AllowedModel,
        fallbackModel: 'anthropic/claude-5.5-sonnet' as AllowedModel,
        modelDisplayName: 'Gemini 3.8 Flash',
        providerName: 'Google',
        specialtyBadge: '⚡ 초고속 네이티브 독해 특화',
        description: '학술 영문 지문 생성, 시그널 워드 빈칸추론 및 1초대 초고속 생성에 최적화'
    },
    inquiry: {
        subjectKey: 'inquiry' as const,
        subjectName: '탐구',
        primaryModel: 'google/gemini-3.8-flash' as AllowedModel,
        fallbackModel: 'anthropic/claude-5.5-sonnet' as AllowedModel,
        modelDisplayName: 'Gemini 3.8 Flash',
        providerName: 'Google',
        specialtyBadge: '🔬 탐구 개념·자료해석 특화',
        description: '탐구 영역 개념 구조화 및 도표·자료 해석형 문항 실시간 생성에 최적화'
    }
} as const;

export type SubjectLadderConfigKey = keyof typeof SUBJECT_LADDER_AI_CONFIG;

/** 모델명이 허용 목록에 포함되는지 검사하는 타입 가드 */
export const isAllowedModel = (model: unknown): model is AllowedModel =>
    typeof model === 'string' && (MODEL_ALLOWLIST as readonly string[]).includes(model);
