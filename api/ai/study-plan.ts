// POST /api/ai/study-plan (server.ts와 동일 스펙)
import { getAiClient, getGeminiKey, noKey, cleanJson, methodGuard } from "../_lib";

export default async function handler(req: any, res: any) {
  if (!methodGuard(req, res)) return;
  try {
    const { studentLevel, schoolYear, subjects, goals, wrongNotesCount, careDetail } = req.body || {};

    if (!getGeminiKey()) return noKey(res);

    const ai = getAiClient();
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
      config: { responseMimeType: "application/json", temperature: 0.7 },
    });

    const text = (response as any).text || "{}";
    let parsedData;
    try {
      parsedData = JSON.parse(cleanJson(text));
    } catch {
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
}
