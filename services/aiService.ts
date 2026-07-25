import { AIModelConfig } from '../types';

export interface AIResponse {
  text: string;
  error?: string;
}

export const generateAIResponse = async (
  prompt: string,
  systemContext: string,
  config: AIModelConfig | null,
  membershipTier: 'standard' | 'premium' | 'free' | 'basic' | 'vip' = 'standard'
): Promise<AIResponse> => {
  if (!config) {
    return { text: '', error: 'AI 설정이 없습니다.' };
  }

  const callLocal = async (): Promise<string | null> => {
    if (!config.localModelUrl || !config.localModelName) return null;
    try {
      let apiModelName = 'phi3.5';
      if (config.localModelVram === '8GB') apiModelName = 'llama3.1:8b';
      if (config.localModelVram === '12GB') apiModelName = 'gemma4:12b';
      if (config.localModelVram === '16GB') apiModelName = 'qwen2.5:14b';
      if (config.localModelVram === '32GB') apiModelName = 'qwen2.5:32b';

      const response = await fetch(config.localModelUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: apiModelName,
          prompt: `${systemContext}\n\nUser: ${prompt}`,
          stream: false
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.response || data.message?.content || null;
      }
    } catch (err) {
      console.warn('Local AI 연동 실패.', err);
    }
    return null;
  };

  const callGemini = async (): Promise<string | null> => {
    if (!config.geminiKey) return null;
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.geminiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemContext}\n\nUser: ${prompt}` }] }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
      }
    } catch (err) {
      console.warn('Gemini 연동 실패.', err);
    }
    return null;
  };

  const callClaude = async (): Promise<string | null> => {
    if (!config.sonnetKey) return null;
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
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
      });

      if (response.ok) {
        const data = await response.json();
        return data.content?.[0]?.text || null;
      }
    } catch (err) {
      console.warn('Claude 연동 실패.', err);
    }
    return null;
  };

  if (membershipTier === 'premium' || membershipTier === 'vip') {
    const geminiRes = await callGemini();
    if (geminiRes) return { text: geminiRes };

    const claudeRes = await callClaude();
    if (claudeRes) return { text: claudeRes };

    const localRes = await callLocal();
    if (localRes) return { text: localRes };

    return { text: '', error: '프리미엄 클라우드 AI 연동 및 로컬 폴백에 모두 실패했습니다.' };
  } else {
    // Standard member
    const localRes = await callLocal();
    if (localRes) return { text: localRes };

    return { text: '', error: '로컬 AI 서버가 응답하지 않습니다. (일반 회원은 클라우드 우회가 제한됩니다)' };
  }
};
