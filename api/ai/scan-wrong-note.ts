// POST /api/ai/scan-wrong-note (server.ts와 동일 스펙)
import { getAiClient, getGeminiKey, noKey, cleanJson, methodGuard } from "../_lib";

export default async function handler(req: any, res: any) {
  if (!methodGuard(req, res)) return;
  try {
    const { imageBase64, mimeType } = req.body || {};

    if (!getGeminiKey()) return noKey(res);

    if (!imageBase64) {
      return res.status(400).json({ error: "이미지 데이터가 전달되지 않았습니다." });
    }

    const ai = getAiClient();
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
반드시 백틱(\`\`\`json) 없는 순수 JSON 문자열로만 응답해주세요.`,
        },
      ],
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = (response as any).text || "{}";
    let parsed;
    try {
      parsed = JSON.parse(cleanJson(text));
    } catch {
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
}
