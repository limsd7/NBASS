import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json());

// API route for AI Coach
app.post("/api/ai-coach", async (req, res) => {
  try {
    const { careType, scheduleData, promptType, userMessage } = req.body;
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY가 서버에 설정되어 있지 않습니다." });
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `당신은 대한민국 최고 수준의 중고등학생 전문 학습 코치이자 자율신경 및 뇌 피로 케어 전문가입니다.
사용자는 현재 특정 '케어 타입'(${careType?.title || '일반'})을 가지고 있으며, 입력된 일과표와 과목 우선순위를 바탕으로 맞춤형 학습 조언, 멘탈 관리법, 휴식 가이드(명상/스트레칭), 시험 대비 전략을 제공해야 합니다.
답변은 친근하고 전문적이며, 학업 스트레스를 줄이면서도 효율을 극대화할 수 있는 구체적인 행동 지침 위주로 친절하게 한국어로 작성해주세요.`;

    const userPrompt = `
[사용자 케어 타입 정보]
- 타이틀: ${careType?.title} (${careType?.emoji})
- 특징 및 학업 영향: ${careType?.traits}
- 전문가 솔루션: ${careType?.solution}

[요청 내용]
- 프롬프트 유형: ${promptType || 'general_advice'}
- 사용자 메시지/질문: ${userMessage || '내 시간표와 학습 상태에 대해 종합 코칭을 해줘.'}
- 현재 일과표/입력 데이터: ${JSON.stringify(scheduleData || {})}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: userPrompt }] }
      ],
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    const advice = response.text || "코칭 내용을 생성하지 못했습니다.";
    res.json({ advice });
  } catch (error: any) {
    console.error("AI Coach Error:", error);
    res.status(500).json({ error: error.message || "AI 코칭 생성 실패" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
