import { MembershipTier, normalizeTier } from "../utils/featureGate";
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

// 1. Quota Check for Tier (VIP/PREMIUM+ 요금제 삭제: 레거시 저장값은 'premium'으로 간주, 월 5회로 통일)
export function getAIPlanQuota(studentId: string, tier: MembershipTier = "free"): QuotaInfo {
  const normTier = normalizeTier(tier);
  if (normTier === "expert") {
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

  if (normTier === "premium") {
    maxPerPeriod = 5;
    periodLabel = "월 5회";
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
// 출력 문구 템플릿 불변, 입력 방어 + 과목 매칭률만 개선.
export function generateRuleBasedStudyPlan(
  studentName: string,
  gradeLevel: string,
  grades: Array<{ subjectName: string; category: string; score: number; grade?: string }>,
  goals: Array<{ subject: string; targetScore: number; targetGrade: string; memo?: string }>,
  careTypeCode: string = "BRAIN_FATIGUE"
): AIPlanResult {
  const careDetail: CareTypeDetail = getCareTypeDetail(careTypeCode);

  const safeGrades = Array.isArray(grades) ? grades : [];
  const safeGoals = Array.isArray(goals) ? goals : [];
  const normKey = (s: unknown): string => String(s ?? '').replace(/\s+/g, '').toLowerCase();
  const validGrades = safeGrades.filter(g => g && Number.isFinite(Number((g as any).score)));
  const scores = validGrades.map(g => Number((g as any).score)).filter(n => Number.isFinite(n));

  // 성적 및 목표 분석 (손상 점수 제외, 빈 입력 폴백 70점 유지)
  const avgScore = scores.length > 0 ? scores.reduce((acc, n) => acc + n, 0) / scores.length : 70;
  const weakSubjects = validGrades.filter((g) => Number((g as any).score) < 75).map((g) => (g as any).subjectName).filter(Boolean);
  const strongSubjects = validGrades.filter((g) => Number((g as any).score) >= 85).map((g) => (g as any).subjectName).filter(Boolean);

  const findMatchingGrade = (goalSubject: unknown) => {
    const gk = normKey(goalSubject);
    if (!gk) return undefined;
    // 1) 정확 일치 (기존 동작 유지)
    const exact = validGrades.find((g) => (g as any).subjectName === goalSubject || (g as any).category === goalSubject);
    if (exact) return exact;
    // 2) 정규화/부분 일치 (ID↔한글명↔카테고리 혼용 흡수)
    return validGrades.find((g) => {
      const nk = normKey((g as any).subjectName);
      const ck = normKey((g as any).category);
      return (nk && (nk === gk || nk.includes(gk) || gk.includes(nk))) ||
        (ck && (ck === gk || ck.includes(gk) || gk.includes(ck)));
    });
  };

  // 목표 대비 Gap 분석
  const gapAnalysis: string[] = [];
  safeGoals.forEach((goal) => {
    if (!goal || (goal as any).subject == null) return;
    const targetScore = Number((goal as any).targetScore);
    if (!Number.isFinite(targetScore)) return;
    const matchingGrade = findMatchingGrade((goal as any).subject);
    if (matchingGrade) {
      const currentScore = Number((matchingGrade as any).score);
      const gap = targetScore - currentScore;
      if (gap > 0) {
        gapAnalysis.push(`${(goal as any).subject} (현재 ${currentScore}점 → 목표 ${targetScore}점, +${gap}점 보완 필요)`);
      } else {
        gapAnalysis.push(`${(goal as any).subject} (현재 ${currentScore}점, 목표 달성 안정권)`);
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
  if (validGrades.length === 0) {
    weaknesses.push(`등록된 성적 기록이 없어 목표 Gap 분석을 건너뜁니다. 성적 입력 후 더 정밀한 플랜이 생성됩니다.`);
  }
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
    `[목표 실행] ${safeGoals.length > 0 ? (safeGoals[0] as any).subject : "주요 과목"} 목표 달성을 위한 주간 단위 실천 점검표 작성`,
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

// 3. Gemini AI 기반 심층 플랜 생성기 (서버 프록시 경유, 실패 시 규칙기반 폴백)
export async function generateGeminiStudyPlan(
  studentName: string,
  gradeLevel: string,
  studentLevel: "middle" | "high",
  grades: Array<{ subjectName: string; category: string; score: number; grade?: string; unit?: number }>,
  goals: Array<{ subject: string; targetScore: number; targetGrade: string; memo?: string }>,
  careTypeCode: string = "BRAIN_FATIGUE",
  options?: { wrongNotesCount?: number }
): Promise<AIPlanResult> {
  // 보안: 클라이언트 번들에 비밀키를 굽지 않음. 서버 /api/ai/study-plan 경유만 허용.
  // 직접 키 호출 제거 → 프록시 실패 시 규칙기반으로 폴백 (UI 동일)
  try {
    const res = await fetch('/api/ai/study-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentLevel,
        schoolYear: gradeLevel,
        subjects: grades,
        goals,
        wrongNotesCount: options?.wrongNotesCount,
        careDetail: getCareTypeDetail(careTypeCode),
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && !data.error && data.overallSummary) {
        return {
          overallSummary: data.overallSummary || '',
          strengths: data.strengths || [],
          weaknesses: data.weaknesses || [],
          actionPlan: data.actionPlan || [],
          recommendedStrategy: data.recommendedStrategy || '',
          generatedBy: 'gemini_ai',
          generatedAt: new Date().toISOString(),
        };
      }
    }
  } catch { /* 프록시 미설정 시 폴백 */ }
  return generateRuleBasedStudyPlan(studentName, gradeLevel, grades, goals, careTypeCode);
}
