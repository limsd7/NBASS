import React, { useState, useEffect, useRef } from "react";
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
import { resolveEffectiveStudentId } from "../../services/studentIdentity";
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
  membershipTier = "free",
  onRefreshGoals,
}) => {
  const [isGoalModalOpen, setIsGoalModalOpen] = useState<boolean>(false);
  const [editingGoal, setEditingGoal] = useState<GradeGoal | null>(null);
  const [isCareModalOpen, setIsCareModalOpen] = useState<boolean>(false);

  const hasAssessment = !!latestAssessment?.careType && (latestAssessment.careType as any) !== 'Unassessed' && (latestAssessment.careType as any) !== 'UNASSESSED' && (latestAssessment.careType as any) !== '알 수 없음';
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
  // 신규 성적 반영 알림 (규칙 플랜은 자동 재생성되므로 갱신 사실만 고지)
  const initialRecordCount = useRef(records.length);
  const [showRefreshNotice, setShowRefreshNotice] = useState(false);

  useEffect(() => {
    if (records.length > initialRecordCount.current) {
      initialRecordCount.current = records.length;
      setShowRefreshNotice(true);
    }
  }, [records.length]);

  // 성적 데이터 단순화 변환 (점수·등급 모두 없는 과목은 제외 — 80점/3등급 날조 금지)
  const simplifiedGrades = records.flatMap((r) =>
    r.subjects
      .filter((s) => Number.isFinite(Number(s.rawScore)) || (typeof s.grade === 'number' && Number.isFinite(s.grade)))
      .map((s) => ({
        subjectName: SUNEUNG_SUBJECTS.find((sub) => sub.id === s.subjectId)?.name || s.subjectId,
        category: SUNEUNG_SUBJECTS.find((sub) => sub.id === s.subjectId)?.category || "기타",
        score: Number.isFinite(Number(s.rawScore))
          ? Number(s.rawScore)
          : 100 - ((s.grade as number) - 1) * 10,
        grade: typeof s.grade === 'number' ? `${s.grade}` : undefined,
      }))
  );

  const simplifiedGoals = goals.map((g) => ({
    subject: SUNEUNG_SUBJECTS.find((sub) => sub.id === g.subjectId)?.name || g.subjectId,
    targetScore: 100 - (g.tier3Target - 1) * 10,
    targetGrade: `${g.tier3Target}등급`,
    memo: g.memo,
  }));

  const [isSaving, setIsSaving] = useState<boolean>(false);

  const safeUUID = () => {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    return `goal_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  };

  const getTargetStudentId = () => {
    return resolveEffectiveStudentId(student);
  };

  // 최초 로드 시 100% 로직 엔진 기반 플랜 즉시 생성 (비용 0원)
  useEffect(() => {
    const studentId = getTargetStudentId();
    const defaultPlan = generateRuleBasedStudyPlan(
      student.name,
      student.grade || "고등학교 2학년",
      simplifiedGrades,
      simplifiedGoals,
      careTypeCode
    );
    setPlanResult(defaultPlan);
    setQuotaInfo(getAIPlanQuota(studentId, membershipTier));
  }, [student.id, records.length, goals.length, careTypeCode]);

  // Goal Save Handler (1차≥2차≥최종 숫자 검증 + 동일 과목 upsert)
  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    const t1 = Number(targetTier1);
    const t2 = Number(targetTier2);
    const t3 = Number(targetTier3);
    if (![t1, t2, t3].every(n => Number.isFinite(n) && n >= 1 && n <= 9)) {
      alert("목표 등급은 1~9 사이의 숫자로 입력해주세요.");
      return;
    }
    // 숫자가 작을수록 우수 등급: 1차(현실적) ≥ 2차(도전) ≥ 최종(궁극) 이어야 함
    if (!(t1 >= t2 && t2 >= t3)) {
      alert("단계별 목표는 1차 ≥ 2차 ≥ 최종 등급 순이어야 합니다. (숫자가 작을수록 우수한 등급)\n예: 1차 3등급 → 2차 2등급 → 최종 1등급");
      return;
    }
    const existingSameSubject = goals.find(g => g.subjectId === selectedSubjectId && g.id !== editingGoal?.id);
    let goalId = editingGoal?.id;
    if (existingSameSubject && !goalId) {
      const subjectLabel = SUNEUNG_SUBJECTS.find(s => s.id === selectedSubjectId)?.name || selectedSubjectId;
      if (!confirm(`이미 '${subjectLabel}' 과목의 목표가 있습니다. 기존 목표를 새 값으로 덮어쓰시겠습니까?`)) {
        return;
      }
      goalId = existingSameSubject.id;
    }
    if (!goalId) goalId = safeUUID();
    setIsSaving(true);
    try {
      const studentId = getTargetStudentId();
      const newGoal: GradeGoal = {
        id: goalId,
        studentId,
        subjectId: selectedSubjectId,
        tier1Target: t1,
        tier2Target: t2,
        tier3Target: t3,
        memo: goalMemo?.trim() || "",
      };

      await DatabaseService.upsertGradeGoal(newGoal);
      setIsGoalModalOpen(false);
      await onRefreshGoals();
    } catch (err) {
      console.error("Failed to save grade goal:", err);
      alert("과목별 목표 저장 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (confirm("이 학습 목표를 삭제하시겠습니까?")) {
      try {
        await DatabaseService.deleteGradeGoal(goalId);
        await onRefreshGoals();
      } catch (err) {
        console.error("Failed to delete grade goal:", err);
        alert("목표 삭제 중 오류가 발생했습니다.");
      }
    }
  };

  const openAddModal = () => {
    setEditingGoal(null);
    const existingSubjectIds = new Set(goals.map((g) => g.subjectId));
    const firstAvailable = SUNEUNG_SUBJECTS.find((s) => !existingSubjectIds.has(s.id))?.id || "math";
    setSelectedSubjectId(firstAvailable);
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
    const studentId = getTargetStudentId();
    const quota = getAIPlanQuota(studentId, membershipTier);
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
      recordAIPlanUsage(studentId);
      setPlanResult(aiPlan);
      setQuotaInfo(getAIPlanQuota(studentId, membershipTier));
      if (aiPlan.generatedBy === "gemini_ai") {
        alert("🤖 Gemini AI 심층 학습 플랜 생성이 완료되었습니다!");
      } else {
        alert("⚙️ AI 서버에 연결되지 않아 정밀 로직 엔진 플랜으로 생성되었습니다. (서버 연결 후 Gemini AI 생성 가능)");
      }
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

        {goals.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-dashed border-slate-300 text-center space-y-3 shadow-sm">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl mx-auto">
              🎯
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-base">설정된 과목별 목표가 없습니다</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                국어, 수학, 영어, 탐구 등 목표 등급을 단계별(1차/2차/최종)로 설정하고 맞춤 AI 실천 플랜을 수립해보세요.
              </p>
            </div>
            <button
              onClick={openAddModal}
              className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-2xl text-xs shadow-md transition-all inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span>+ 첫 과목별 목표 추가하기</span>
            </button>
          </div>
        ) : (
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
        )}
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
        {showRefreshNotice && (
          <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
            <span className="font-bold">✅ 새 성적이 반영되어 플랜이 갱신되었습니다.</span>
            <button
              type="button"
              onClick={() => setShowRefreshNotice(false)}
              className="font-black text-emerald-700 hover:text-emerald-900 shrink-0 cursor-pointer"
            >
              확인
            </button>
          </div>
        )}
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
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

              {/* 단계별 목표 설정 안내 박스 */}
              <div className="p-3 bg-gradient-to-r from-blue-50/70 to-indigo-50/70 rounded-2xl border border-blue-200/80 text-[11px] text-slate-600 space-y-1">
                <div className="font-bold text-blue-900 flex items-center gap-1.5 text-xs">
                  <span>🎯</span> 단계별 목표 설정 가이드
                </div>
                <div className="space-y-0.5 text-[10.5px] leading-relaxed text-slate-600 pl-0.5">
                  <p>• <strong>1차 (현실적):</strong> 지금 나의 공부량으로 1~2개월 내에 달성 가능한 목표</p>
                  <p>• <strong>2차 (도전적):</strong> 취약 단원 보완 및 집중 학습 시 도달 가능한 도전선</p>
                  <p>• <strong className="text-emerald-700">최종 (궁극적):</strong> 이번 학년 또는 수능에서 반드시 이루고자 하는 최종 목표</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="p-2.5 bg-slate-50/80 rounded-2xl border border-slate-200/90 space-y-1.5">
                  <div>
                    <label className="font-bold text-slate-800 block text-xs">1차 목표 (현실적)</label>
                    <span className="text-[10px] text-slate-500 block leading-tight">지금 공부로 가능한 목표</span>
                  </div>
                  <select
                    value={targetTier1}
                    onChange={(e) => setTargetTier1(Number(e.target.value))}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold text-xs focus:ring-2 focus:ring-blue-500/20"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                      <option key={n} value={n}>
                        {n}등급
                      </option>
                    ))}
                  </select>
                  <p className="text-[9.5px] text-blue-600 font-medium leading-tight">
                    단기 실현선 (다음 시험)
                  </p>
                </div>

                <div className="p-2.5 bg-slate-50/80 rounded-2xl border border-slate-200/90 space-y-1.5">
                  <div>
                    <label className="font-bold text-slate-800 block text-xs">2차 목표 (도전적)</label>
                    <span className="text-[10px] text-slate-500 block leading-tight">약점 보완 시 도달 목표</span>
                  </div>
                  <select
                    value={targetTier2}
                    onChange={(e) => setTargetTier2(Number(e.target.value))}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold text-xs focus:ring-2 focus:ring-blue-500/20"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                      <option key={n} value={n}>
                        {n}등급
                      </option>
                    ))}
                  </select>
                  <p className="text-[9.5px] text-indigo-600 font-medium leading-tight">
                    중기 도약선 (취약점 극복)
                  </p>
                </div>

                <div className="p-2.5 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-1.5">
                  <div>
                    <label className="font-bold text-emerald-800 block text-xs">최종 목표 (궁극적)</label>
                    <span className="text-[10px] text-emerald-700 block leading-tight">수능/대입 합격 목표</span>
                  </div>
                  <select
                    value={targetTier3}
                    onChange={(e) => setTargetTier3(Number(e.target.value))}
                    className="w-full p-2 bg-white border border-emerald-300 rounded-xl text-emerald-800 font-black text-xs focus:ring-2 focus:ring-emerald-500/20"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                      <option key={n} value={n}>
                        {n}등급
                      </option>
                    ))}
                  </select>
                  <p className="text-[9.5px] text-emerald-700 font-bold leading-tight">
                    꿈의 최종 골든선
                  </p>
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
                  disabled={isSaving}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? "저장 중..." : "저장하기"}
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
