import { GoogleGenAI } from "@google/genai";
import { MembershipTier } from "../utils/featureGate";
import { CareTypeDetail, getCareTypeDetail } from "../data/careTypesData";

export interface AIPlanResult {
  overallSummary: string;
  strengths: string[];
  weaknesses: string[];
  actionPlan: string[];
  recommendedStrategy: string;
  generatedBy: "rule_engine" | "gemini_ai";
  generatedAt: string;
}

export interface QuotaInfo {
  tier: MembershipTier;
  maxPerPeriod: number;
  periodLabel: string;
  usedCount: number;
  remainingCount: number;
  canUseAI: boolean;
}

// 1. Quota Check for Tier
export function getAIPlanQuota(studentId: string, tier: MembershipTier = "free"): QuotaInfo {
  if (tier === "expert") {
    return {
      tier,
      maxPerPeriod: 999,
      periodLabel: "무제한",
      usedCount: 0,
      remainingCount: 999,
      canUseAI: true,
    };
  }

  let maxPerPeriod = 0;
  let periodLabel = "월 0회";

  if (tier === "premium") {
    maxPerPeriod = 5;
    periodLabel = "월 5회";
  } else if (tier === "premium_plus") {
    maxPerPeriod = 12; // 주 3회 환산 (월 ~12회)
    periodLabel = "주 3회 (월 12회)";
  } else if (tier === "vip") {
    maxPerPeriod = 20; // 주 5회 환산 (월 ~20회)
    periodLabel = "주 5회 (월 20회)";
  }

  const now = new Date();
  const currentMonthKey = `ai_plan_usage_${studentId}_${now.getFullYear()}_${now.getMonth() + 1}`;
  const usedCount = parseInt(localStorage.getItem(currentMonthKey) || "0", 10);
  const remainingCount = Math.max(0, maxPerPeriod - usedCount);

  return {
    tier,
    maxPerPeriod,
    periodLabel,
    usedCount,
    remainingCount,
    canUseAI: maxPerPeriod > 0 && remainingCount > 0,
  };
}

export function recordAIPlanUsage(studentId: string) {
  const now = new Date();
  const currentMonthKey = `ai_plan_usage_${studentId}_${now.getFullYear()}_${now.getMonth() + 1}`;
  const usedCount = parseInt(localStorage.getItem(currentMonthKey) || "0", 10);
  localStorage.setItem(currentMonthKey, (usedCount + 1).toString());
}

// 2. 기본 로직 엔진 기반 100% 무결성 학습 플랜 생성기 (비용 0원, 0초 완성)
export function generateRuleBasedStudyPlan(
  studentName: string,
  gradeLevel: string,
  grades: Array<{ subjectName: string; category: string; score: number; grade?: string }>,
  goals: Array<{ subject: string; targetScore: number; targetGrade: string; memo?: string }>,
  careTypeCode: string = "BRAIN_FATIGUE"
): AIPlanResult {
  const careDetail: CareTypeDetail = getCareTypeDetail(careTypeCode);

  // 성적 및 목표 분석
  const avgScore = grades.length > 0 ? grades.reduce((acc, g) => acc + g.score, 0) / grades.length : 70;
  const weakSubjects = grades.filter((g) => g.score < 75).map((g) => g.subjectName);
  const strongSubjects = grades.filter((g) => g.score >= 85).map((g) => g.subjectName);

  // 목표 대비 Gap 분석
  const gapAnalysis: string[] = [];
  goals.forEach((goal) => {
    const matchingGrade = grades.find((g) => g.subjectName === goal.subject || g.category === goal.subject);
    if (matchingGrade) {
      const gap = goal.targetScore - matchingGrade.score;
      if (gap > 0) {
        gapAnalysis.push(`${goal.subject} (현재 ${matchingGrade.score}점 → 목표 ${goal.targetScore}점, +${gap}점 보완 필요)`);
      } else {
        gapAnalysis.push(`${goal.subject} (현재 ${matchingGrade.score}점, 목표 달성 안정권)`);
      }
    }
  });

  // 총평
  const overallSummary = `${studentName} 학생은 현재 평균 ${avgScore.toFixed(1)}점의 학업 역량을 보유하고 있으며, 뇌-신체 검진 결과 [${careDetail.emoji} ${careDetail.title}] 상태로 진단되었습니다. ${careDetail.studyImpact} 따라서 무조건적인 학습 시간 연장보다는, 생체 리듬에 맞춘 에너지 관리와 취약 과목 우선 학습이 성적 향상의 핵심 열쇠입니다.`;

  // 강점
  const strengths: string[] = [];
  if (strongSubjects.length > 0) {
    strengths.push(`${strongSubjects.join(", ")} 과목에서 탄탄한 기초 개념과 높은 성취도를 유지하고 있습니다.`);
  } else {
    strengths.push("정기적인 성적 기록과 목표 관리를 통해 자기주도 학습 습관의 기반을 잘 갖추고 있습니다.");
  }
  strengths.push(`학습 목표를 구체적으로 설정하여 동기부여와 방향성이 명확합니다.`);

  // 약점 및 병목 요인 (Care Type 연계)
  const weaknesses: string[] = [];
  if (weakSubjects.length > 0) {
    weaknesses.push(`${weakSubjects.join(", ")} 과목의 개념 미흡 및 문제 적용 훈련 부족으로 성적 편차가 발생하고 있습니다.`);
  }
  weaknesses.push(`[${careDetail.title}]에 따른 생체 피로: ${careDetail.physiology}`);
  if (gapAnalysis.length > 0) {
    weaknesses.push(`목표 점수 달성을 위해 과목별 전략적 시간 재배치가 필요합니다.`);
  }

  // 이번 주 실천 과제 (Action Plan) 4종
  const actionPlan: string[] = [
    `[컨디션 조율] ${careDetail.prescription}`,
    weakSubjects.length > 0
      ? `[취약 과목 집중] ${weakSubjects[0]} 과목은 골든타임(집중도가 가장 높은 시간)에 매일 45분씩 개념 복습 및 오답 분석 진행`
      : `[심화 도약] 핵심 과목 기출 고난도 문항 매일 3문제 분석 풀이`,
    `[목표 실행] ${goals.length > 0 ? goals[0].subject : "주요 과목"} 목표 달성을 위한 주간 단위 실천 점검표 작성`,
    `[메타인지 루틴] 공부 종료 10분 전 '백지 복습법'으로 오늘 학습한 핵심 공식 및 단어 3가지 인출 확인`,
  ];

  // 추천 전략
  const recommendedStrategy = `두뇌 피로를 덜어주는 '50+10 분할 학습법'을 준수하고, ${careDetail.title}에 최적화된 학습 환경을 조성하여 학습 몰입 밀도를 극대화하세요.`;

  return {
    overallSummary,
    strengths,
    weaknesses,
    actionPlan,
    recommendedStrategy,
    generatedBy: "rule_engine",
    generatedAt: new Date().toISOString(),
  };
}

// 3. Gemini AI 기반 심층 플랜 생성기 (확장용, API Key 및 쿼터 연동)
export async function generateGeminiStudyPlan(
  studentName: string,
  gradeLevel: string,
  studentLevel: "middle" | "high",
  grades: Array<{ subjectName: string; category: string; score: number; grade?: string; unit?: number }>,
  goals: Array<{ subject: string; targetScore: number; targetGrade: string; memo?: string }>,
  careTypeCode: string = "BRAIN_FATIGUE"
): Promise<AIPlanResult> {
  const careDetail = getCareTypeDetail(careTypeCode);
  const apiKey = process.env.GEMINI_API_KEY || (typeof window !== "undefined" ? (window as any).__GEMINI_API_KEY__ : "");

  if (!apiKey) {
    // API Key가 없을 경우 로직 엔진으로 안전하게 자동 전환 (Fallback)
    return generateRuleBasedStudyPlan(studentName, gradeLevel, grades, goals, careTypeCode);
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
당신은 대한민국 최고 수준의 입시 학습 컨설턴트이자 두뇌 자율신경 컨디셔닝 전문가입니다.
아래 학생의 성적 데이터, 설정 목표, 그리고 12대 Care Type(신체/뇌파/피로 상태)을 종합 분석하여 맞춤형 주간 학습 플랜을 JSON 형식으로 작성해주세요.

[학생 정보]
- 학생 이름: ${studentName} (${gradeLevel}, ${studentLevel === "middle" ? "중등" : "고등"})
- 등록된 과목 및 성적 데이터: ${JSON.stringify(grades)}
- 설정한 목표: ${JSON.stringify(goals)}
- 현재 Care Type (두뇌/신체 상태): ${careDetail.emoji} ${careDetail.title} (${careDetail.subtitle})
- 생리적 특징 및 학업 영향: ${careDetail.physiology} / ${careDetail.studyImpact}
- 맞춤 임상 처방: ${careDetail.prescription}

반드시 아래 JSON 형식으로만 응답해주세요:
{
  "overallSummary": "성적과 Care Type을 연계한 종합 분석 총평 (3~4문장, 따뜻하고 전문적인 격려)",
  "strengths": ["강점 1", "강점 2"],
  "weaknesses": ["약점 및 Care Type 연계 병목 요인 1", "약점 2"],
  "actionPlan": ["이번 주 실천 과제 1", "실천 과제 2", "실천 과제 3", "실천 과제 4"],
  "recommendedStrategy": "핵심 성공 전략 1문장"
}
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    const text = response.text || "{}";
    const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return {
      overallSummary: parsed.overallSummary || "",
      strengths: parsed.strengths || ["성실한 학습 태도와 목표 지향성"],
      weaknesses: parsed.weaknesses || ["취약 과목 집중 보완 필요"],
      actionPlan: parsed.actionPlan || ["일일 플래너 작성 및 복습 실천"],
      recommendedStrategy: parsed.recommendedStrategy || "꾸준한 루틴 유지가 핵심입니다.",
      generatedBy: "gemini_ai",
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Gemini Plan Generation Error:", error);
    // 에러 발생 시 로직 엔진 플랜 반환
    return generateRuleBasedStudyPlan(studentName, gradeLevel, grades, goals, careTypeCode);
  }
}
