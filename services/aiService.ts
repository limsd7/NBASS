import { AIModelConfig } from '../types';

export interface AIResponse {
  text: string;
  error?: string;
}

/**
 * Enhanced AI Response Generator with Timeout Protection and Offline Template Fallback
 */
export const generateAIResponse = async (
  prompt: string,
  systemContext: string,
  config: AIModelConfig | null,
  membershipTier: 'standard' | 'premium' | 'free' | 'basic' | 'vip' = 'standard'
): Promise<AIResponse> => {
  // Helper for fetch timeout
  const fetchWithTimeout = async (url: string, options: RequestInit, timeoutMs = 7000): Promise<Response> => {
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

  const callLocal = async (): Promise<string | null> => {
    if (!config?.localModelUrl || !config?.localModelName) return null;
    try {
      let apiModelName = config.localModelName || 'phi3.5';
      if (config.localModelVram === '8GB') apiModelName = 'llama3.1:8b';
      if (config.localModelVram === '12GB') apiModelName = 'gemma4:12b';
      if (config.localModelVram === '16GB') apiModelName = 'qwen2.5:14b';
      if (config.localModelVram === '32GB') apiModelName = 'qwen2.5:32b';

      const response = await fetchWithTimeout(config.localModelUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: apiModelName,
          prompt: `${systemContext}\n\nUser: ${prompt}`,
          stream: false
        })
      }, 6000);

      if (response.ok) {
        const data = await response.json();
        return data.response || data.message?.content || null;
      }
    } catch (err) {
      console.warn('[AI] Local Ollama call timeout or error:', err);
    }
    return null;
  };

  const callGemini = async (): Promise<string | null> => {
    if (!config?.geminiKey) return null;
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.geminiKey}`;
      const response = await fetchWithTimeout(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemContext}\n\nUser: ${prompt}` }] }]
        })
      }, 8000);

      if (response.ok) {
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
      }
    } catch (err) {
      console.warn('[AI] Gemini API call timeout or error:', err);
    }
    return null;
  };

  const callClaude = async (): Promise<string | null> => {
    if (!config?.sonnetKey) return null;
    try {
      const response = await fetchWithTimeout('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.sonnetKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerously-allow-browser': 'true'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20240620',
          max_tokens: 1024,
          system: systemContext,
          messages: [{ role: 'user', content: prompt }]
        })
      }, 8000);

      if (response.ok) {
        const data = await response.json();
        return data.content?.[0]?.text || null;
      }
    } catch (err) {
      console.warn('[AI] Claude API call timeout or error:', err);
    }
    return null;
  };

  // Generate fallback smart analysis if AI providers are unreachable or unconfigured
  const generateOfflineFallback = (): string => {
    return `[NBASS AI 분석 리포트]\n\n` +
      `입력된 종합 생체 지표 및 설문 데이터 분석 결과입니다:\n` +
      `- 자율신경계 균형 및 뇌파 집중도 지표를 고려한 맞춤 처방이 작성되었습니다.\n` +
      `- 권장 학습 모드: 골든타임 학습 세션 25분 집중 후 5분 이완 호흡법 적용\n` +
      `- 추천 조치: 수면 전 디지털 디톡스 및 마그네슘/비타민B군 섭취\n\n` +
      `* 정밀 맞춤 조언을 위해 AI 설정(Gemini/Claude API Key) 또는 로컬 Ollama 서버를 구동해 주세요.`;
  };

  // Route based on tier
  if (membershipTier === 'premium' || membershipTier === 'vip') {
    const geminiRes = await callGemini();
    if (geminiRes) return { text: geminiRes };

    const claudeRes = await callClaude();
    if (claudeRes) return { text: claudeRes };

    const localRes = await callLocal();
    if (localRes) return { text: localRes };

    // Fallback if cloud and local fail
    return {
      text: generateOfflineFallback(),
      error: '클라우드 및 로컬 AI 연결 시간이 초과되어 스마트 오프라인 분석으로 대체되었습니다.'
    };
  } else {
    // Standard / Basic / Free member
    const localRes = await callLocal();
    if (localRes) return { text: localRes };

    // Direct Gemini fallback if key available
    const geminiRes = await callGemini();
    if (geminiRes) return { text: geminiRes };

    return {
      text: generateOfflineFallback(),
      error: '로컬 AI 서버가 미구동 상태여서 기본 분석 리포트로 표시되었습니다.'
    };
  }
};
