import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { MODEL_ALLOWLIST } from "./services/aiModelConfig";
import { PARENT_TEMPLATE_IDS } from "./services/parentTemplates";
import { sanitizeFreeText } from "./services/parentTemplates";

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
- 누적 오답노트 개수: ${typeof wrongNotesCount === "number" ? `${wrongNotesCount}개` : "집계 정보 없음"}
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

// AI Twin Problem (쌍둥이 유사 변형 문항) 생성 엔드포인트
app.post("/api/ai/generate-twin-problem", async (req, res) => {
  try {
    const { subject, questionTitle, wrongAnswer, correctAnswer, explanation, metacognitiveNote, difficulty } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "GEMINI_API_KEY가 설정되지 않았습니다. 설정(Settings) 메뉴에서 API 키를 입력해주세요.",
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          text: `당신은 대한민국 수능 및 내신 출제 전문 강사이자 교육 평가원급 문항 설계자입니다.
학생이 이전에 틀렸던 오답 노트를 기반으로, "답을 외워서 맞히는 것을 방지"하고 동일한 사고 논리를 점검할 수 있는 [AI 쌍둥이 유사 변형 문제 1문항]을 출제해주세요.

[학생의 오답 노트 정보]
- 과목: ${subject || '수학'}
- 단원/주제: ${questionTitle || '핵심 문항'}
- 기존 오답: ${wrongAnswer || '미기재'}
- 기존 정답: ${correctAnswer || '미기재'}
- 기존 해설: ${explanation || '미기재'}
- 함정/메타인지: ${metacognitiveNote?.trapKeyword || ''} / ${metacognitiveNote?.actionRule || ''}
- 난이도: ${difficulty || '중'}

[출제 요구사항]
1. 원본 문제와 동일한 개념 및 함정 유발 기전을 유지하되, 숫자/조건/상황을 새롭게 변형하세요.
2. 풀이 과정에서 학생이 동일한 실수를 저지르지 않도록 자가 검증할 수 있어야 합니다.
3. 다음 JSON 형식으로만 엄격하게 응답해주세요:
{
  "twinTitle": "유사 변형 점검 문제 제목 (예: [변형 1회독 점검] 로그부등식의 진수 조건)",
  "question": "변형된 문제 본문 (수식 및 조건 포함)",
  "answer": "정답",
  "explanation": "핵심 풀이 알고리즘 및 오답 함정 극복 팁 (2~3문장)"
}
반드시 백틱 없는 순수 JSON 문자열로만 응답해주세요.`
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
    } catch {
      parsed = {
        twinTitle: `[변형 점검] ${questionTitle || subject || '유사 문제'}`,
        question: `다음 ${questionTitle || '문제'}와 동일한 출제 원리를 점검하기 위한 유사 문항입니다.\n(기존 문제의 조건 및 숫자를 치환하여 자가 테스트를 진행하세요)`,
        answer: correctAnswer || "정답 확인",
        explanation: `${explanation || '해설 확인'}\n💡 수칙: ${metacognitiveNote?.actionRule || '실수 방지 원칙 준수'}`
      };
    }

    res.json(parsed);
  } catch (error: any) {
    console.error("Generate Twin Problem Error:", error);
    res.status(500).json({ error: error.message || "변형 문제 생성 중 오류가 발생했습니다." });
  }
});

// OpenRouter Proxy - 브라우저에 키를 노출하지 않기 위한 서버 중계 (과금 보호 포함)
// 허용 모델 목록은 클라이언트와 동일한 단일 진실 원천(services/aiModelConfig)을 사용합니다.
const OPENROUTER_ALLOWLIST = new Set<string>(MODEL_ALLOWLIST);
let proxyWindowStart = 0;
let proxyWindowCount = 0;
app.post("/api/ai/openrouter", async (req, res) => {
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
  } catch (error: unknown) {
    console.error("OpenRouter proxy error:", error);
    return res.status(500).json({ error: "프록시 처리 중 오류" });
  }
});

// Phase 2: 부모 알림톡 서버 발송 (알림톡만 시도, 대체발송 없음)
// - 허용 템플릿은 services/parentTemplates.ts 단일 정의에서 자동 생성
// - 키는 서버 환경변수에만 보관 (브라우저 노출 금지)
const PARENT_TEMPLATE_SET = new Set<string>(PARENT_TEMPLATE_IDS as readonly string[]);
const parentTplEnvName = (t: string): string =>
    `KAKAO_TPL_${t}`;

app.post("/api/kakao/parent-send", async (req, res) => {
  try {
    const { template, recipientPhone, message } = req.body || {};
    if (!template || !PARENT_TEMPLATE_SET.has(String(template))) {
      return res.status(400).json({ error: `허용되지 않은 템플릿입니다. (부모용 20종만 가능: ${PARENT_TEMPLATE_IDS.join(', ')})` });
    }
    const phone = String(recipientPhone || '').replace(/[^0-9]/g, '');
    if (!/^01[0-9]{8,9}$/.test(phone)) {
      return res.status(400).json({ error: "수신자 번호 형식이 올바르지 않습니다." });
    }
    const text = String(message || '').slice(0, 1000);
    if (!text) {
      return res.status(400).json({ error: "발송 본문이 비어 있습니다." });
    }
    // 범용 템플릿 남용 방지: 본문 600자 상한 + 서열/순위 표현 금지
    if (String(template).startsWith('PARENT_FREE_')) {
      if (text.length > 600) {
        return res.status(400).json({ error: "범용 템플릿 본문은 600자 이내여야 합니다." });
      }
      const check = sanitizeFreeText(text);
      if (check.blocked) {
        return res.status(400).json({ error: "범용 템플릿에 서열·순위 표현을 사용할 수 없습니다." });
      }
    }
    const apiKey = process.env.KAKAO_ALIGO_APIKEY || '';
    const userId = process.env.KAKAO_ALIGO_USERID || '';
    const senderKey = process.env.KAKAO_SENDER_KEY || '';
    const senderPhone = process.env.KAKAO_SENDER_PHONE || '';
    const tplCode = process.env[parentTplEnvName(String(template))] || '';
    if (!apiKey || !userId || !senderKey || !tplCode) {
      return res.status(501).json({
        error: "KAKAO_SENDER_NOT_CONFIGURED",
        message: "알림톡 대행사 설정이 없습니다. 대행사 계약·채널·템플릿 승인 후 환경변수를 등록하세요.",
      });
    }
    const resp = await fetch('https://kakaoapi.aligo.in/akv10/alimtalk/send/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        apikey: apiKey,
        userid: userId,
        sender: senderPhone,
        senderkey: senderKey,
        tpl_code: tplCode,
        receiver_1: phone,
        message_1: text,
      }),
    });
    const result = await resp.json().catch(() => ({})) as { code?: number; message?: string; mid?: string };
    if (result.code === 0) {
      return res.json({ success: true, messageId: result.mid || `MSG_${Date.now()}`, template, recipientPhone: phone });
    }
    // 실패는 실패로 반환. 친구톡/SMS 대체발송 없음 (정책).
    return res.status(502).json({ error: "ALIMTALK_SEND_FAILED", message: result.message || "알림톡 발송 실패 (대체발송 없음)" });
  } catch (error: unknown) {
    console.error("Parent-send error:", error);
    return res.status(500).json({ error: "발송 처리 중 오류 (대체발송 없음)" });
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
