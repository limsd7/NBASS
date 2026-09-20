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
    CLAUDE_LATEST: 'anthropic/claude-3.7-sonnet',
    CLAUDE_OPUS: 'anthropic/claude-3.7-sonnet',
    CLAUDE_FAST: 'anthropic/claude-3.5-haiku',
    GEMINI_LATEST: 'google/gemini-2.5-flash',
    GEMINI_PRO_LATEST: 'google/gemini-2.5-flash',
    DEEPSEEK_REASONER: 'deepseek/deepseek-r1',
    DEEPSEEK_CHAT: 'deepseek/deepseek-chat',
    LLAMA_LATEST: 'meta-llama/llama-3.3-70b-instruct',
    // 하위 호환용 별칭 (구형 호출이 깨지지 않도록 유지)
    LEGACY_CLAUDE_35: 'anthropic/claude-3.5-sonnet',
    LEGACY_GEMINI_20: 'google/gemini-2.0-flash-001',
} as const;

/** 모델명이 허용 목록에 포함되는지 검사하는 타입 가드 */
export const isAllowedModel = (model: unknown): model is AllowedModel =>
    typeof model === 'string' && (MODEL_ALLOWLIST as readonly string[]).includes(model);
