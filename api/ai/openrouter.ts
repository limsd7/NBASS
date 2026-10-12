// POST /api/ai/openrouter (server.ts와 동일 스펙: allowlist + 분당 30회 보호)
import { MODEL_ALLOWLIST } from "../../services/aiModelConfig";
import { methodGuard } from "../_lib";

const OPENROUTER_ALLOWLIST = new Set<string>(MODEL_ALLOWLIST);
let proxyWindowStart = 0;
let proxyWindowCount = 0;

export default async function handler(req: any, res: any) {
  if (!methodGuard(req, res)) return;
  try {
    const { model, messages, temperature, max_tokens } = req.body || {};
    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(500).json({ error: "OPENROUTER_API_KEY가 서버에 설정되지 않았습니다." });
    }
    if (!model || !OPENROUTER_ALLOWLIST.has(String(model))) {
      return res.status(400).json({ error: "허용되지 않은 모델입니다." });
    }
    if (!Array.isArray(messages) || messages.length === 0 || messages.length > 10) {
      return res.status(400).json({ error: "메시지 형식이 올바르지 않습니다." });
    }
    const now = Date.now();
    if (now - proxyWindowStart > 60_000) {
      proxyWindowStart = now;
      proxyWindowCount = 0;
    }
    if (proxyWindowCount >= 30) {
      return res.status(429).json({ error: "분당 호출 한도 초과 (서버 과금 보호)" });
    }
    proxyWindowCount += 1;
    const safeMaxTokens = Math.min(Math.max(Number(max_tokens) || 800, 100), 1500);
    const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://nbass.io",
        "X-Title": "NBASS Learning Optimization Live Agent",
      },
      body: JSON.stringify({
        model: String(model),
        messages: messages.slice(0, 10).map((m: { role: string; content: string }) => ({
          role: m.role === 'system' ? 'system' : 'user',
          content: String(m.content || '').slice(0, 8000),
        })),
        temperature: typeof temperature === 'number' ? Math.min(Math.max(temperature, 0), 1) : 0.7,
        max_tokens: safeMaxTokens,
      }),
    });
    if (!resp.ok) {
      const errText = await resp.text().catch(() => '');
      console.warn("OpenRouter proxy failed:", resp.status, errText.slice(0, 300));
      return res.status(502).json({ error: "클라우드 응답 지연" });
    }
    const data = await resp.json() as { choices?: { message?: { content?: string } }[] };
    const text = data.choices?.[0]?.message?.content || '';
    return res.json({ text });
  } catch {
    console.error("OpenRouter proxy error");
    return res.status(500).json({ error: "프록시 처리 중 오류" });
  }
}
