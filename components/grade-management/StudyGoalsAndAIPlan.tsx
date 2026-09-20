import React, { useState, useEffect } from "react";
import { StudentInfo, GradeRecord, GradeGoal, AssessmentResult } from "../../types";
import { getCareTypeDetail } from "../../data/careTypesData";
import { CareTypeModal } from "./CareTypeModal";
import {
  generateRuleBasedStudyPlan,
  generateGeminiStudyPlan,
  getAIPlanQuota,
  recordAIPlanUsage,
  AIPlanResult,
  QuotaInfo,
} from "../../services/aiGradePlanEngine";
import { DatabaseService } from "../../services/database";
import { MembershipTier } from "../../utils/featureGate";
import { SUNEUNG_SUBJECTS } from "../../data/suneungSubjects";

interface StudyGoalsAndAIPlanProps {
  student: StudentInfo;
  records: GradeRecord[];
  goals: GradeGoal[];
  latestAssessment?: AssessmentResult;
  membershipTier?: MembershipTier;
  onRefreshGoals: () => void;
}

export const StudyGoalsAndAIPlan: React.FC<StudyGoalsAndAIPlanProps> = ({
  student,
  records,
  goals,
  latestAssessment,
  membershipTier = "premium",
  onRefreshGoals,
}) => {
  const [isGoalModalOpen, setIsGoalModalOpen] = useState<boolean>(false);
  const [editingGoal, setEditingGoal] = useState<GradeGoal | null>(null);
  const [isCareModalOpen, setIsCareModalOpen] = useState<boolean>(false);

  const hasAssessment = !!latestAssessment?.careType && (latestAssessment.careType as any) !== 'Unassessed' && (latestAssessment.careType as any) !== '알 수 없음';
  const careTypeCode = (hasAssessment ? latestAssessment?.careType : "HEALTHY")?.toString() || "HEALTHY";
  const currentCare = getCareTypeDetail(careTypeCode);

  // Goal Form State
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("math");
  const [targetTier1, setTargetTier1] = useState<number>(2);
  const [targetTier2, setTargetTier2] = useState<number>(1);
  const [targetTier3, setTargetTier3] = useState<number>(1);
  const [goalMemo, setGoalMemo] = useState<string>("");

  // Plan State
  const [planResult, setPlanResult] = useState<AIPlanResult | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [quotaInfo, setQuotaInfo] = useState<QuotaInfo>(() =>
    getAIPlanQuota(student.id, membershipTier)
  );

  // 성적 데이터 단순화 변환
  const simplifiedGrades = records.flatMap((r) =>
    r.subjects.map((s) => ({
      subjectName: SUNEUNG_SUBJECTS.find((sub) => sub.id === s.subjectId)?.name || s.subjectId,
      category: SUNEUNG_SUBJECTS.find((sub) => sub.id === s.subjectId)?.category || "기타",
      score: s.rawScore || (s.grade ? 100 - (s.grade - 1) * 10 : 80),
      grade: s.grade ? `${s.grade}` : "3",
    }))
  );

  const simplifiedGoals = goals.map((g) => ({
    subject: SUNEUNG_SUBJECTS.find((sub) => sub.id === g.subjectId)?.name || g.subjectId,
    targetScore: 100 - (g.tier3Target - 1) * 10,
    targetGrade: `${g.tier3Target}등급`,
    memo: g.memo,
  }));

  // 최초 로드 시 100% 로직 엔진 기반 플랜 즉시 생성 (비용 0원)
  useEffect(() => {
    const defaultPlan = generateRuleBasedStudyPlan(
      student.name,
      student.grade || "고등학교 2학년",
      simplifiedGrades,
      simplifiedGoals,
      careTypeCode
    );
    setPlanResult(defaultPlan);
    setQuotaInfo(getAIPlanQuota(student.id, membershipTier));
  }, [student.id, records.length, goals.length, careTypeCode]);

  // Goal Save Handler
  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    const newGoal: GradeGoal = {
      id: editingGoal?.id || crypto.randomUUID(),
      studentId: student.id,
      subjectId: selectedSubjectId,
      tier1Target: targetTier1,
      tier2Target: targetTier2,
      tier3Target: targetTier3,
      memo: goalMemo,
    };

    await DatabaseService.upsertGradeGoal(newGoal);

    setIsGoalModalOpen(false);
    onRefreshGoals();
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (confirm("이 학습 목표를 삭제하시겠습니까?")) {
      await DatabaseService.deleteGradeGoal(goalId);
      onRefreshGoals();
    }
  };

  const openAddModal = () => {
    setEditingGoal(null);
    setSelectedSubjectId("math");
    setTargetTier1(3);
    setTargetTier2(2);
    setTargetTier3(1);
    setGoalMemo("");
    setIsGoalModalOpen(true);
  };

  const openEditModal = (goal: GradeGoal) => {
    setEditingGoal(goal);
    setSelectedSubjectId(goal.subjectId);
    setTargetTier1(goal.tier1Target);
    setTargetTier2(goal.tier2Target);
    setTargetTier3(goal.tier3Target);
    setGoalMemo(goal.memo || "");
    setIsGoalModalOpen(true);
  };

  // AI 심층 플랜 요청 (Tier 쿼터 검증 후 호출)
  const handleRequestGeminiPlan = async () => {
    const quota = getAIPlanQuota(student.id, membershipTier);
    if (!quota.canUseAI) {
      alert(`[AI 호출 제한 안내]\n현재 회원님의 등급(${membershipTier.toUpperCase()})에서 제공되는 AI 생성 쿼터(${quota.periodLabel})를 모두 소진하셨습니다.\n(정밀 로직 엔진 플랜은 언제나 무제한으로 이용 가능합니다.)`);
      return;
    }

    setIsGeneratingAI(true);
    try {
      const aiPlan = await generateGeminiStudyPlan(
        student.name,
        student.grade || "고등학교",
        student.grade?.includes("중") ? "middle" : "high",
        simplifiedGrades,
        simplifiedGoals,
        careTypeCode
      );
      recordAIPlanUsage(student.id);
      setPlanResult(aiPlan);
      setQuotaInfo(getAIPlanQuota(student.id, membershipTier));
      alert("🤖 Gemini AI 심층 학습 플랜 생성이 완료되었습니다!");
    } catch (err) {
      alert("AI 플랜 생성 중 오류가 발생하여 기본 로직 플랜으로 유지됩니다.");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-800">목표 설정 및 12대 Care Type 맞춤 AI 플랜</h2>
            <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
              지능형 학습 로드맵
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            과목별 단계적 목표(1차/2차/최종)를 수립하고, 생체 Care Type과 결합된 맞춤형 주간 실천 전략을 확인하세요.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-2xl text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer shrink-0"
        >
          <span>+ 과목별 목표 추가</span>
        </button>
      </div>

      {/* Goals Grid */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
            <span>🎯</span>
            <span>설정된 과목별 목표치 ({goals.length}개)</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((goal) => {
            const subjectName = SUNEUNG_SUBJECTS.find((s) => s.id === goal.subjectId)?.name || goal.subjectId;
            return (
              <div
                key={goal.id}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-blue-300 transition-all"
              >
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-slate-800 text-base">{subjectName}</span>
                    <span className="px-3 py-1 rounded-xl text-xs font-black bg-blue-50 text-blue-700 border border-blue-100">
                      최종 {goal.tier3Target}등급 목표
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 my-3 text-[11px] text-center">
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <span className="text-slate-400 block text-[9px]">1차 목표</span>
                      <strong className="text-slate-700">{goal.tier1Target}등급</strong>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <span className="text-slate-400 block text-[9px]">2차 목표</span>
                      <strong className="text-indigo-600">{goal.tier2Target}등급</strong>
                    </div>
                    <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-100">
                      <span className="text-emerald-500 block text-[9px]">최종 목표</span>
                      <strong className="text-emerald-700">{goal.tier3Target}등급</strong>
                    </div>
                  </div>
                  {goal.memo && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                      💬 {goal.memo}
                    </p>
                  )}
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-xs mt-3">
                  <span className="text-[10px] text-slate-400">실천 관리 중</span>
                  <div className="space-x-1">
                    <button
                      onClick={() => openEditModal(goal)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer text-xs"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer text-xs"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI & Rule Engine Integrated Action Plan Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-2xl">
              🧠
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-slate-800">성적 향상 &amp; Care Type 통합 학습 플랜</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  planResult?.generatedBy === "gemini_ai"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-emerald-100 text-emerald-700"
                }`}>
                  {planResult?.generatedBy === "gemini_ai" ? "🤖 Gemini AI 심층 생성" : "⚙️ 정밀 로직 엔진"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {hasAssessment 
                  ? `진단된 [${currentCare.emoji} ${currentCare.title}] 생체 상태와 목표 Gap을 실시간으로 분석한 솔루션입니다.`
                  : "현재 표준 학습 플랜이 적용 중입니다. 정밀 검사 완료 시 학생 맞춤 생체 리듬이 연동됩니다."}
              </p>
            </div>
          </div>

          {/* AI Generation Trigger with Quota */}
          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <div className="text-[10px] text-slate-400">AI 심층 쿼터: {quotaInfo.periodLabel}</div>
              <div className="text-xs font-bold text-indigo-600">잔여 {quotaInfo.remainingCount}회</div>
            </div>
            <button
              onClick={handleRequestGeminiPlan}
              disabled={isGeneratingAI}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer shadow-sm ${
                isGeneratingAI
                  ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
            >
              <span>{isGeneratingAI ? "⏳ AI 분석 중..." : "🤖 AI 심층 플랜 재생성"}</span>
            </button>
          </div>
        </div>

        {/* Plan Content */}
        {planResult && (
          <div className="space-y-5">
            {/* Overall Summary */}
            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100">
              <strong className="text-xs font-bold text-indigo-900 block mb-1">
                📋 전담 컨설턴트 종합 분석 총평
              </strong>
              <p className="text-xs text-indigo-950 leading-relaxed font-medium">
                {planResult.overallSummary}
              </p>
            </div>

            {/* Strengths & Weaknesses 2-Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-2">
                <strong className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <span>✓</span> 학습 강점 및 유지할 점
                </strong>
                <ul className="space-y-1 text-xs text-emerald-950">
                  {planResult.strengths.map((str, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100 space-y-2">
                <strong className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                  <span>⚠️</span> 보완할 약점 및 피로 병목 요인
                </strong>
                <ul className="space-y-1 text-xs text-rose-950">
                  {planResult.weaknesses.map((weak, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-rose-500 font-bold">•</span>
                      <span>{weak}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 4 Action Plans */}
            <div className="space-y-2.5">
              <strong className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span>🎯</span> 이번 주 핵심 실천 과제 (4-Step Action Plan)
              </strong>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {planResult.actionPlan.map((action, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs flex items-start gap-3 shadow-2xs"
                  >
                    <span className="w-6 h-6 rounded-xl bg-blue-100 text-blue-700 font-black flex items-center justify-center shrink-0 text-xs">
                      {idx + 1}
                    </span>
                    <p className="text-slate-700 font-medium leading-relaxed">{action}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Strategy Footer */}
            <div className="p-3.5 bg-slate-900 text-white rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className="text-amber-300 mr-1.5">✨ 핵심 전략:</span>
                <span className="text-slate-200">
                  {planResult.recommendedStrategy}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-3">
                1:1 CLINICAL PROTOCOL
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Goal Add/Edit Modal */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-base">
                {editingGoal ? "목표 수정" : "새 과목 목표 추가"}
              </h3>
              <button
                onClick={() => setIsGoalModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveGoal} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">대상 과목</label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {SUNEUNG_SUBJECTS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.category === "social" ? "사탐" : s.category === "science" ? "과탐" : "기본"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">1차 목표 (현실적)</label>
                  <select
                    value={targetTier1}
                    onChange={(e) => setTargetTier1(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                      <option key={n} value={n}>
                        {n}등급
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">2차 목표 (도전적)</label>
                  <select
                    value={targetTier2}
                    onChange={(e) => setTargetTier2(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                      <option key={n} value={n}>
                        {n}등급
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-emerald-700 block mb-1">최종 목표 (궁극적)</label>
                  <select
                    value={targetTier3}
                    onChange={(e) => setTargetTier3(Number(e.target.value))}
                    className="w-full p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-bold"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                      <option key={n} value={n}>
                        {n}등급
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">실천 다짐 / 메모</label>
                <textarea
                  value={goalMemo}
                  onChange={(e) => setGoalMemo(e.target.value)}
                  placeholder="예: 매일 취약 단원 3문제 풀기, 6월 모평 전까지 개념 완성"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl h-20 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsGoalModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm cursor-pointer"
                >
                  저장하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Care Type Modal */}
      <CareTypeModal
        isOpen={isCareModalOpen}
        onClose={() => setIsCareModalOpen(false)}
        currentCode={careTypeCode}
      />
    </div>
  );
};
