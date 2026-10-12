import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini AI client server-side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// AI Study Plan & Analysis endpoint
app.post("/api/ai/study-plan", async (req, res) => {
  try {
    const { studentLevel, schoolYear, subjects, goals, wrongNotesCount, careDetail } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "GEMINI_API_KEY가 설정되지 않았습니다. 설정(Settings) 메뉴에서 API 키를 입력해주세요.",
      });
    }

    const prompt = `
당신은 대한민국 최고 수준의 입시 및 학습 컨설턴트이자 뇌파/자율신경 컨디셔닝 전문가입니다. 
아래 학생의 성적 데이터, 목표, 그리고 현재 학생의 신체적·자율신경·뇌파 상태(12대 Care Type)를 종합하여 성적 향상과 컨디션 회복이 동시에 가능한 홀리스틱 맞춤형 학습 플랜을 JSON 형식으로 작성해주세요.

[학생 정보]
- 학교급: ${studentLevel === "middle" ? "중학생" : "고등학생"} (${schoolYear})
- 등록된 과목 및 성적 데이터: ${JSON.stringify(subjects, null, 2)}
- 학생 설정 목표: ${JSON.stringify(goals, null, 2)}
- 누적 오답노트 개수: ${wrongNotesCount}개
- 현재 Care Type (신체/자율신경/뇌파 상태): ${careDetail ? `${careDetail.emoji} ${careDetail.title} (${careDetail.subtitle})` : "일반"}
- 생리적 특징 및 학업 영향: ${careDetail ? careDetail.physiology + " / " + careDetail.studyImpact : "해당 없음"}
- 추천 맞춤 처방: ${careDetail ? careDetail.prescription : "해당 없음"}

다음 항목을 포함하여 JSON으로 응답해주세요:
1. "overallSummary": 성적과 현재 Care Type(신체/컨디션) 상태를 연계한 종합 분석 총평 (따뜻하고 격려하는 어조, 3~4문장)
2. "strengths": 잘하고 있는 부분 및 강점 (배열 형태, 2~3개)
3. "weaknesses": 성적 하락 또는 학습 효율 저하의 근본 원인(Care Type 연계 분석 포함) (배열 형태, 2~3개)
4. "actionPlan": 이번 주 구체적인 학습 계획 및 Care Type 맞춤형 컨디셔닝 실천 과제 (배열 형태, 3~4가지)
5. "recommendedStrategy": 성적 향상과 두뇌 컨디션 회복을 위한 핵심 전략 팁 (문장 형태)

응답은 반드시 아래 JSON 구조로만 반환해주세요 (마크다운 코드블록 없이 순수 JSON이거나 파싱 가능한 형태):
{
  "overallSummary": "...",
  "strengths": ["...", "..."],
  "weaknesses": ["...", "..."],
  "actionPlan": ["...", "..."],
  "recommendedStrategy": "..."
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    const text = response.text || "{}";
    let parsedData;
    try {
      const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
      parsedData = JSON.parse(cleaned);
    } catch (err) {
      parsedData = {
        overallSummary: text,
        strengths: ["꾸준한 기록과 성실한 학습 태도"],
        weaknesses: ["취약 과목 개념 보완 필요"],
        actionPlan: ["매일 오답노트 2문제 이상 복습", "주간 계획표 점검"],
        recommendedStrategy: text,
      };
    }

    res.json(parsedData);
  } catch (error: any) {
    console.error("Gemini AI Error:", error);
    res.status(500).json({ error: error.message || "AI 분석 중 오류가 발생했습니다." });
  }
});

// AI OCR Scan Wrong Note endpoint
app.post("/api/ai/scan-wrong-note", async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "GEMINI_API_KEY가 설정되지 않았습니다. 설정(Settings) 메뉴에서 API 키를 입력해주세요.",
      });
    }

    if (!imageBase64) {
      return res.status(400).json({ error: "이미지 데이터가 전달되지 않았습니다." });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          inlineData: {
            data: imageBase64,
            mimeType: mimeType || "image/jpeg",
          },
        },
        {
          text: `당신은 대한민국 최고의 교육 입시 및 수능/내신 문제 분석 AI 컨설턴트입니다.
첨부된 시험 문제 또는 오답 노트 사진을 정밀하게 분석하여 다음 JSON 형식으로 정확히 추출해주세요:
{
  "subject": "수학", // 수학, 국어, 영어, 한국사, 통합과학, 기타 중 하나
  "questionTitle": "문제의 핵심 주제 또는 단원명 (예: 삼각함수의 덧셈정리와 극한, 15자 이내)",
  "wrongAnswer": "사진 속 학생이 표기한 오답 또는 흔히 빠지기 쉬운 오답",
  "correctAnswer": "올바른 정답 또는 핵심 풀이 결론",
  "explanation": "문제를 해결하기 위한 핵심 개념 및 정답 도출 원리 (2~3문장 내외 요약)",
  "difficulty": "중", // 상, 중, 하 중 하나
  "errorType": "CONCEPT", // CONCEPT(개념부족), MISTAKE_IMPULSE(부호/계산/조건오독 실수), TIME_LIMIT(시간부족/지문과다), KILLER_PROBLEM(고난도킬러/복합개념) 중 하나
  "metacognitiveNote": {
    "misconception": "학생이 시험장에서 착각했을 잘못된 사고 경로 (1줄)",
    "trapKeyword": "출제자가 파놓은 함정 키워드 또는 결정적 발문 단서 (1줄)",
    "actionRule": "다음에 이 유형을 볼 때 반드시 떠올릴 첫 번째 행동 수칙 (1줄)"
  }
}
반드시 백틱(\`\`\`json) 없는 순수 JSON 문자열로만 응답해주세요.`
        }
      ],
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    let parsed;
    try {
      const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch (e) {
      parsed = {
        subject: "수학",
        questionTitle: "스캔된 문제 풀이",
        wrongAnswer: "계산 실수 또는 개념 혼동",
        correctAnswer: "정확한 풀이 과정 확인 필요",
        explanation: text,
        difficulty: "중",
        errorType: "MISTAKE_IMPULSE",
        metacognitiveNote: {
          misconception: "발문의 단서 조건을 끝까지 확인하지 않고 섣불리 계산 시작",
          trapKeyword: "부호 변환 및 분모가 0이 되지 않는 범위 조건",
          actionRule: "구하려는 값에 동그라미 치고, 역산으로 부호 1회 즉시 검산하기",
        },
      };
    }

    res.json(parsed);
  } catch (error: any) {
    console.error("OCR Scan Error:", error);
    res.status(500).json({ error: error.message || "이미지 분석 중 오류가 발생했습니다." });
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
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
