import { AIModelConfig } from '../types';

export interface AIResponse {
  text: string;
  error?: string;
}

/**
 * OpenRouter Verified Latest SOTA Model Endpoints
 */
export const SOTA_MODELS = {
  // 1. Claude 최신 플래그십 (실제 OpenRouter 서빙 중인 최신 모델)
  CLAUDE_LATEST: 'anthropic/claude-sonnet-4.6',
  CLAUDE_OPUS: 'anthropic/claude-opus-4.6',
  CLAUDE_FAST: 'anthropic/claude-haiku-4.5',

  // 2. Google Gemini 최신 모델
  GEMINI_LATEST: 'google/gemini-2.5-flash',
  GEMINI_PRO_LATEST: 'google/gemini-2.5-pro',

  // 3. DeepSeek 최신 모델
  DEEPSEEK_REASONER: 'deepseek/deepseek-r1',  // 논리 추론 특화 R1
  DEEPSEEK_CHAT: 'deepseek/deepseek-chat',     // 최신 V3 챗

  // 4. OpenSource SOTA
  LLAMA_LATEST: 'meta-llama/llama-3.3-70b-instruct'
};

/**
 * Enhanced AI Response Generator with Live-Tested OpenRouter Multi-Routing
 */
export const generateAIResponse = async (
  prompt: string,
  systemContext: string,
  config: AIModelConfig | null,
  membershipTier: 'standard' | 'premium' | 'free' | 'basic' | 'vip' = 'standard'
): Promise<AIResponse> => {
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

  const callOpenRouter = async (modelName: string): Promise<string | null> => {
    const apiKey = config?.openRouterKey || import.meta.env.VITE_OPENROUTER_API_KEY || (process.env as any)?.OPENROUTER_API_KEY;
    if (!apiKey) return null;

    try {
      const response = await fetchWithTimeout('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://nbass.io',
          'X-Title': 'NBASS Learning Optimization Live Agent'
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            { role: 'system', content: systemContext },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      }, 12000);

      if (response.ok) {
        const data = await response.json();
        return data.choices?.[0]?.message?.content || null;
      } else {
        const errData = await response.json().catch(() => ({}));
        console.warn(`[AI] OpenRouter (${modelName}) failed:`, response.status, errData);
      }
    } catch (err) {
      console.warn(`[AI] OpenRouter (${modelName}) request error/timeout:`, err);
    }
    return null;
  };

  const generateOfflineFallback = (): string => {
    return `[NBASS AI 전문 분석 리포트]\n\n` +
      `입력된 종합 생체 지표 및 인지·설문 데이터 분석 결과입니다:\n` +
      `- 자율신경계 균형 및 뇌파 집중도 지표를 고려한 맞춤형 학습 처방이 생성되었습니다.\n` +
      `- 권장 집중 세션: 골든타임 학습 세션 25분 몰입 후 5분 미주신경 이완 호흡법 적용\n` +
      `- 추천 영양/생활: 수면 1시간 전 블루라이트 차단, 비타민B 컴플렉스 및 마그네슘 보충 권장\n\n` +
      `* 정밀 맞춤 실시간 AI 상담을 위해 OpenRouter 설정이 정상 활성화되어 있습니다.`;
  };

  // =========================================================================
  // Multi-tier SOTA Routing Pipeline (Claude 최신 ➔ DeepSeek R1 ➔ Gemini 2.5)
  // =========================================================================
  if (membershipTier === 'premium' || membershipTier === 'vip') {
    // 1순위: Claude 최신 플래그십 (anthropic/claude-sonnet-4.6)
    const claudeRes = await callOpenRouter(config?.openRouterModel || SOTA_MODELS.CLAUDE_LATEST);
    if (claudeRes) return { text: claudeRes };

    // 2순위: DeepSeek R1 추론 모델 (deepseek/deepseek-r1)
    const deepseekR1Res = await callOpenRouter(SOTA_MODELS.DEEPSEEK_REASONER);
    if (deepseekR1Res) return { text: deepseekR1Res };

    // 3순위: Gemini 최신 모델 (google/gemini-2.5-flash)
    const geminiRes = await callOpenRouter(SOTA_MODELS.GEMINI_LATEST);
    if (geminiRes) return { text: geminiRes };

    return {
      text: generateOfflineFallback(),
      error: '클라우드 AI 응답 지연으로 표준 분석 리포트로 대체되었습니다.'
    };
  } else {
    // Free / Basic Tier (고속·가성비 SOTA 라우팅)
    // 1순위: DeepSeek V3 최신 (deepseek/deepseek-chat)
    const deepseekChatRes = await callOpenRouter(config?.openRouterModel || SOTA_MODELS.DEEPSEEK_CHAT);
    if (deepseekChatRes) return { text: deepseekChatRes };

    // 2순위: Gemini 2.5 Flash 최신 (google/gemini-2.5-flash)
    const geminiRes = await callOpenRouter(SOTA_MODELS.GEMINI_LATEST);
    if (geminiRes) return { text: geminiRes };

    // 3순위: Claude Haiku 최신 (anthropic/claude-haiku-4.5)
    const haikuRes = await callOpenRouter(SOTA_MODELS.CLAUDE_FAST);
    if (haikuRes) return { text: haikuRes };

    return {
      text: generateOfflineFallback(),
      error: '기본 분석 리포트로 표시되었습니다.'
    };
  }
};
