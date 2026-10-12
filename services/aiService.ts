import { AIModelConfig, MembershipTier } from '../types';
import { MODEL_ALLOWLIST, SOTA_MODELS, SUBJECT_LADDER_AI_CONFIG } from './aiModelConfig';
import { logger } from '../utils/logger';

export interface AIResponse {
  text: string;
  error?: string;
  cached?: boolean;
  model?: string;
}

// 허용 모델/권장 모델 목록은 services/aiModelConfig.ts 로 단일화되었습니다.
// 기존 import 경로(services/aiService) 호환을 위해 재-export 합니다.
export { MODEL_ALLOWLIST, SOTA_MODELS, SUBJECT_LADDER_AI_CONFIG } from './aiModelConfig';

const CACHE_KEY = 'nbass_ai_cache_v1';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const CACHE_MAX_ENTRIES = 50;
const MAX_PROMPT_CHARS = 8000;
const MIN_CALL_INTERVAL_MS = 2000;
const MAX_CALLS_PER_MIN = 10;

const memoryCache = new Map<string, { text: string; at: number; model: string }>();
let lastCallAt = 0;
let windowStart = 0;
let windowCount = 0;

const readEnv = (key: string): string => {
  try {
    if (typeof import.meta !== 'undefined' && (import.meta as unknown as { env?: Record<string, string> }).env) {
      return (import.meta as unknown as { env: Record<string, string> }).env[key] || '';
    }
  } catch { /* ignore */ }
  try {
    if (typeof process !== 'undefined' && (process as unknown as { env?: Record<string, string> }).env) {
      return (process as unknown as { env: Record<string, string> }).env[key] || '';
    }
  } catch { /* ignore */ }
  return '';
};

export const isProxyEnabled = (): boolean => {
  return Boolean(readEnv('VITE_AI_PROXY_URL'));
};

export const getProxyUrl = (): string => {
  return readEnv('VITE_AI_PROXY_URL');
};

export const maskApiKey = (key: string): string => {
  if (!key) return '(empty)';
  if (key.length <= 8) return '****';
  return `${key.slice(0, 4)}****${key.slice(-4)}`;
};

const getRuntimeApiKey = (config: AIModelConfig | null): string => {
  // 1순위: 실행 중 사용자가 설정 화면에서 입력한 키 (메모리에만 유지 권장)
  if (config?.openRouterKey && config.openRouterKey.trim().length > 8) {
    return config.openRouterKey.trim();
  }
  // 2순위: 개발 모드에서만 환경변수 허용 (배포 번들에 키를 굽지 않기 위함)
  try {
    const isDev =
      (typeof import.meta !== 'undefined' &&
        (import.meta as unknown as { env?: Record<string, unknown> }).env?.DEV) ||
      (typeof process !== 'undefined' && (process as unknown as { env?: Record<string, string> }).env?.NODE_ENV !== 'production');
    if (isDev) {
      return readEnv('VITE_OPENROUTER_API_KEY');
    }
  } catch { /* ignore */ }
  return '';
};

export const getEffectiveModel = (requested: string | undefined, fallback: string): string => {
  if (requested && (MODEL_ALLOWLIST as readonly string[]).includes(requested)) {
    return requested;
  }
  if (requested) {
    console.warn('[AI] 허용되지 않은 모델 요청 차단, 기본 모델로 대체:', requested);
  }
  return fallback;
};

const hashPrompt = (model: string, system: string, prompt: string): string => {
  const s = `${model}|${system}|${prompt}`;
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  }
  return `ai_${h.toString(16)}`;
};

const readDiskCache = (): Record<string, { text: string; at: number; model: string }> => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, { text: string; at: number; model: string }>;
  } catch {
    return {};
  }
};

const writeDiskCache = (all: Record<string, { text: string; at: number; model: string }>) => {
  try {
    const keys = Object.keys(all).sort((a, b) => all[b].at - all[a].at).slice(0, CACHE_MAX_ENTRIES);
    const trimmed: typeof all = {};
    for (const k of keys) trimmed[k] = all[k];
    localStorage.setItem(CACHE_KEY, JSON.stringify(trimmed));
  } catch { /* 용량 초과 시 무시 */ }
};

const getCached = (key: string): { text: string; model: string } | null => {
  const mem = memoryCache.get(key);
  const now = Date.now();
  if (mem && now - mem.at < CACHE_TTL_MS) return { text: mem.text, model: mem.model };
  const disk = readDiskCache();
  const hit = disk[key];
  if (hit && now - hit.at < CACHE_TTL_MS) {
    memoryCache.set(key, hit);
    return { text: hit.text, model: hit.model };
  }
  return null;
};

const setCached = (key: string, text: string, model: string) => {
  const entry = { text, at: Date.now(), model };
  memoryCache.set(key, entry);
  const disk = readDiskCache();
  disk[key] = entry;
  writeDiskCache(disk);
};

export const clearAICache = () => {
  memoryCache.clear();
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch { /* ignore */ }
};

const checkRateLimit = (): string | null => {
  const now = Date.now();
  if (now - lastCallAt < MIN_CALL_INTERVAL_MS) {
    return `요청이 너무 빠릅니다. ${Math.ceil((MIN_CALL_INTERVAL_MS - (now - lastCallAt)) / 1000)}초 후 다시 시도해주세요.`;
  }
  if (now - windowStart > 60_000) {
    windowStart = now;
    windowCount = 0;
  }
  if (windowCount >= MAX_CALLS_PER_MIN) {
    return '분당 호출 한도를 초과했습니다. 잠시 후 다시 시도해주세요. (과금 보호)';
  }
  return null;
};

const markCall = () => {
  lastCallAt = Date.now();
  windowCount += 1;
};

const truncate = (s: string, max: number): string => {
  if (s.length <= max) return s;
  return `${s.slice(0, max)}\n\n[truncated for cost guard]`;
};

const fetchWithTimeout = async (url: string, options: RequestInit, timeoutMs = 9000): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
};

const callViaProxy = async (model: string, systemContext: string, prompt: string, maxTokens: number): Promise<string | null> => {
  const proxyUrl = getProxyUrl();
  if (!proxyUrl) return null;
  try {
    const response = await fetchWithTimeout(
      proxyUrl,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, messages: [{ role: 'system', content: systemContext }, { role: 'user', content: prompt }], temperature: 0.7, max_tokens: maxTokens }),
      },
      15000,
    );
    if (!response.ok) {
      console.warn('[AI] 프록시 호출 실패:', response.status);
      return null;
    }
    const data = await response.json();
    return data.text || data.choices?.[0]?.message?.content || null;
  } catch (err) {
    console.warn('[AI] 프록시 요청 오류:', err);
    return null;
  }
};

const callDirect = async (model: string, systemContext: string, prompt: string, maxTokens: number, apiKey: string): Promise<string | null> => {
  if (!apiKey) return null;
  try {
    const response = await fetchWithTimeout(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://nbass.io',
          'X-Title': 'NBASS Learning Optimization Live Agent',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemContext },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
          max_tokens: maxTokens,
        }),
      },
      12000,
    );
    if (response.ok) {
      const data = await response.json();
      return data.choices?.[0]?.message?.content || null;
    }
    console.warn('[AI] 직접 호출 실패:', response.status, `(key ${maskApiKey(apiKey)})`);
  } catch (err) {
    console.warn('[AI] 직접 호출 오류/타임아웃:', err);
  }
  return null;
};

const generateOfflineFallback = (): string => {
  return `[NBASS AI 전문 분석 리포트]\n\n` +
    `입력된 종합 생체 지표 및 인지·설문 데이터 분석 결과입니다:\n` +
    `- 자율신경계 균형 및 인지 집중도 지표를 고려한 맞춤형 학습 처방이 생성되었습니다.\n` +
    `- 권장 집중 세션: 골든타임 학습 세션 25분 몰입 후 5분 미주신경 이완 호흡법 적용\n` +
    `- 추천 영양/생활: 수면 1시간 전 블루라이트 차단, 비타민B 컴플렉스 및 마그네슘 보충 권장\n\n` +
    `안내: 실시간 클라우드 연결이 원활하지 않아 오프라인 기본 분석으로 생성된 결과입니다. 프록시 또는 키 설정을 확인해주세요.`;
};

/**
 * 보안 강화 지능형 응답 생성기
 * - 프록시 우선, 직접 호출은 개인용으로만 허용
 * - 동일 프롬프트 캐시로 중복 과금 방지
 * - 속도 제한으로 폭증 방지
 * - 모델 화이트리스트로 임의 모델 호출 차단
 */
export const generateAIResponse = async (
  prompt: string,
  systemContext: string,
  config: AIModelConfig | null,
  membershipTier: MembershipTier | string = 'free',
): Promise<AIResponse> => {
  const startedAt = Date.now();
  const safePrompt = truncate(prompt, MAX_PROMPT_CHARS);
  const safeSystem = truncate(systemContext, 2000);
  const isHighTier = ['premium', 'expert'].includes(membershipTier);
  const maxTokens = isHighTier ? 1500 : 800;

  const primary = getEffectiveModel(config?.openRouterModel, isHighTier ? SOTA_MODELS.CLAUDE_LATEST : SOTA_MODELS.DEEPSEEK_CHAT);
  const secondary = isHighTier ? SOTA_MODELS.DEEPSEEK_CHAT : SOTA_MODELS.GEMINI_LATEST;
  const cacheKey = hashPrompt(primary, safeSystem, safePrompt);

  const cached = getCached(cacheKey);
  if (cached) {
    logger.debug('ai', 'cache hit', { model: cached.model });
    return { text: cached.text, cached: true, model: cached.model };
  }

  const limited = checkRateLimit();
  if (limited) {
    logger.warn('ai', 'rate limited', { error: limited });
    return { text: generateOfflineFallback(), error: limited };
  }

  // 1순위: 서버 프록시 (키가 브라우저에 노출되지 않음, 개인 배포 권장)
  if (isProxyEnabled()) {
    markCall();
    const viaProxy = await callViaProxy(primary, safeSystem, safePrompt, maxTokens);
    if (viaProxy) {
      setCached(cacheKey, viaProxy, primary);
      logger.timing('ai', 'response ok', Date.now() - startedAt, { model: primary, via: 'proxy' });
      return { text: viaProxy, model: primary };
    }
    const viaProxy2 = await callViaProxy(secondary, safeSystem, safePrompt, maxTokens);
    if (viaProxy2) {
      setCached(cacheKey, viaProxy2, secondary);
      logger.timing('ai', 'response ok', Date.now() - startedAt, { model: secondary, via: 'proxy-fallback' });
      return { text: viaProxy2, model: secondary };
    }
    logger.warn('ai', 'proxy timeout fallback', { model: primary });
    return { text: generateOfflineFallback(), error: '프록시 응답 지연으로 표준 분석으로 대체되었습니다.' };
  }

  // 2순위: 개인용 직접 호출 (키 노출 경고, 배포용으로는 비권장)
  const apiKey = getRuntimeApiKey(config);
  if (!apiKey) {
    logger.warn('ai', 'no api key / proxy, offline fallback');
    return {
      text: generateOfflineFallback(),
      error: '키가 설정되지 않아 오프라인 분석으로 표시되었습니다. 설정에서 키를 입력하거나 프록시를 구성해주세요.',
    };
  }

  markCall();
  const first = await callDirect(primary, safeSystem, safePrompt, maxTokens, apiKey);
  if (first) {
    setCached(cacheKey, first, primary);
    logger.timing('ai', 'response ok', Date.now() - startedAt, { model: primary, via: 'direct' });
    return { text: first, model: primary };
  }
  const second = await callDirect(secondary, safeSystem, safePrompt, maxTokens, apiKey);
  if (second) {
    setCached(cacheKey, second, secondary);
    logger.timing('ai', 'response ok', Date.now() - startedAt, { model: secondary, via: 'direct-fallback' });
    return { text: second, model: secondary };
  }
  logger.warn('ai', 'cloud timeout fallback', { model: primary });
  return {
    text: generateOfflineFallback(),
    error: '클라우드 응답 지연으로 표준 분석으로 대체되었습니다.',
  };
};

/**
 * 국·수·영 과목별 특화 AI(국어 Claude 5.5, 수학 DeepSeek V4.1, 영어 Gemini 3.8) 직접 호출 지원 함수
 */
export const generateAIResponseWithModel = async (
  prompt: string,
  systemContext: string,
  primaryModel: string,
  fallbackModel: string,
  config: AIModelConfig | null = null,
  maxTokens: number = 3000,
): Promise<AIResponse> => {
  const startedAt = Date.now();
  const safePrompt = truncate(prompt, MAX_PROMPT_CHARS);
  const safeSystem = truncate(systemContext, 2500);
  const primary = getEffectiveModel(primaryModel, SOTA_MODELS.CLAUDE_LATEST);
  const secondary = getEffectiveModel(fallbackModel, SOTA_MODELS.GEMINI_LATEST);
  const cacheKey = hashPrompt(primary, safeSystem, safePrompt);

  const cached = getCached(cacheKey);
  if (cached) {
    logger.debug('ai', 'cache hit', { model: cached.model });
    return { text: cached.text, cached: true, model: cached.model };
  }

  const limited = checkRateLimit();
  if (limited) {
    logger.warn('ai', 'rate limited', { error: limited });
    return { text: generateOfflineFallback(), error: limited };
  }

  // 1순위: 서버 프록시 (설정된 경우)
  if (isProxyEnabled()) {
    markCall();
    const viaProxy = await callViaProxy(primary, safeSystem, safePrompt, maxTokens);
    if (viaProxy) {
      setCached(cacheKey, viaProxy, primary);
      logger.timing('ai', 'response ok', Date.now() - startedAt, { model: primary, via: 'proxy' });
      return { text: viaProxy, model: primary };
    }
    const viaProxy2 = await callViaProxy(secondary, safeSystem, safePrompt, maxTokens);
    if (viaProxy2) {
      setCached(cacheKey, viaProxy2, secondary);
      logger.timing('ai', 'response ok', Date.now() - startedAt, { model: secondary, via: 'proxy-fallback' });
      return { text: viaProxy2, model: secondary };
    }
    logger.warn('ai', 'proxy timeout fallback', { model: primary });
    return { text: generateOfflineFallback(), error: '프록시 응답 지연으로 대체되었습니다.' };
  }

  // 2순위: OpenRouter 직접 호출
  const apiKey = getRuntimeApiKey(config);
  if (!apiKey) {
    logger.warn('ai', 'no api key / proxy, offline fallback');
    return {
      text: generateOfflineFallback(),
      error: 'API 키가 설정되지 않아 오프라인 분석으로 표시되었습니다.',
    };
  }

  markCall();
  const first = await callDirect(primary, safeSystem, safePrompt, maxTokens, apiKey);
  if (first) {
    setCached(cacheKey, first, primary);
    logger.timing('ai', 'response ok', Date.now() - startedAt, { model: primary, via: 'direct' });
    return { text: first, model: primary };
  }
  const second = await callDirect(secondary, safeSystem, safePrompt, maxTokens, apiKey);
  if (second) {
    setCached(cacheKey, second, secondary);
    logger.timing('ai', 'response ok', Date.now() - startedAt, { model: secondary, via: 'direct-fallback' });
    return { text: second, model: secondary };
  }

  logger.warn('ai', 'cloud timeout fallback', { model: primary });
  return {
    text: generateOfflineFallback(),
    error: '클라우드 응답 지연으로 표준 분석으로 대체되었습니다.',
  };
};

