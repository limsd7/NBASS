import React, { useState } from "react";
import { SubjectGoal, SubjectGrade, WrongNote, NotificationSetting, StudentProfile } from "../types";
import { Target, Sparkles, Bell, Clock, Phone, CheckCircle, RefreshCw, AlertCircle, Plus, Edit3, Trash2, Brain, Activity, ChevronRight } from "lucide-react";
import { getCareTypeDetail } from "../data/careTypesData";
import { CareTypeModal } from "./CareTypeModal";

interface GoalsAndAIPlanProps {
  goals: SubjectGoal[];
  setGoals: React.Dispatch<React.SetStateAction<SubjectGoal[]>>;
  grades: SubjectGrade[];
  wrongNotes: WrongNote[];
  notification: NotificationSetting;
  setNotification: React.Dispatch<React.SetStateAction<NotificationSetting>>;
  profile: StudentProfile;
  setProfile?: React.Dispatch<React.SetStateAction<StudentProfile>>;
}

export function GoalsAndAIPlan({
  goals,
  setGoals,
  grades,
  wrongNotes,
  notification,
  setNotification,
  profile,
  setProfile,
}: GoalsAndAIPlanProps) {
  const [isGoalModalOpen, setIsGoalModalOpen] = useState<boolean>(false);
  const [editingGoal, setEditingGoal] = useState<SubjectGoal | null>(null);
  const [isCareModalOpen, setIsCareModalOpen] = useState<boolean>(false);
  const currentCare = getCareTypeDetail(profile.careType || "BRAIN_FATIGUE");

  // Goal form state
  const [goalSubject, setGoalSubject] = useState<string>("수학");
  const [targetScore, setTargetScore] = useState<number>(95);
  const [targetGrade, setTargetGrade] = useState<string>("1");
  const [goalMemo, setGoalMemo] = useState<string>("");

  // AI Plan state
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiPlanData, setAiPlanData] = useState<{
    overallSummary: string;
    strengths: string[];
    weaknesses: string[];
    actionPlan: string[];
    recommendedStrategy: string;
  } | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Save Goal
  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingGoal) {
      setGoals((prev) =>
        prev.map((g) =>
          g.id === editingGoal.id ? { ...g, subject: goalSubject, targetScore, targetGrade, memo: goalMemo } : g
        )
      );
    } else {
      const newGoal: SubjectGoal = {
        id: `goal_${Date.now()}`,
        subject: goalSubject,
        targetScore,
        targetGrade,
        memo: goalMemo,
      };
      setGoals((prev) => [...prev, newGoal]);
    }
    setIsGoalModalOpen(false);
  };

  const openAddGoalModal = () => {
    setEditingGoal(null);
    setGoalSubject("수학");
    setTargetScore(95);
    setTargetGrade("1");
    setGoalMemo("");
    setIsGoalModalOpen(true);
  };

  const openEditGoalModal = (g: SubjectGoal) => {
    setEditingGoal(g);
    setGoalSubject(g.subject);
    setTargetScore(g.targetScore);
    setTargetGrade(g.targetGrade);
    setGoalMemo(g.memo);
    setIsGoalModalOpen(true);
  };

  const handleDeleteGoal = (id: string) => {
    if (confirm("이 학습 목표를 삭제하시겠습니까?")) {
      setGoals((prev) => prev.filter((g) => g.id !== id));
    }
  };

  // Generate AI Study Plan via Backend API
  const generateAiPlan = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch("/api/ai/study-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentLevel: profile.level,
          schoolYear: profile.gradeLevel,
          subjects: grades,
          goals,
          wrongNotesCount: wrongNotes.filter((n) => !n.isResolved).length,
          careDetail: currentCare,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "AI 분석 생성 실패");
      }
      setAiPlanData(data);
    } catch (err: any) {
      setAiError(err.message || "서버 통신 중 오류가 발생했습니다.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="bg-white/50 backdrop-blur-lg p-6 rounded-3xl border border-white/40 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-800">학습 목표 설정 및 AI 학습 플랜</h2>
            <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-700 border border-blue-500/20">
              맞춤형 컨설팅
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">과목별 구체적 목표를 설정하고, Gemini AI 기반 성적 향상 학습 계획과 알림 일정을 관리하세요.</p>
        </div>
        <button
          onClick={openAddGoalModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-2xl text-sm shadow-md shadow-blue-500/20 flex items-center justify-center space-x-2 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>과목별 목표 추가</span>
        </button>
      </div>

      {/* Goals Grid */}
      <div>
        <h3 className="text-base font-bold text-slate-800 mb-3 flex items-center space-x-2">
          <Target className="w-5 h-5 text-blue-600" />
          <span>과목별 목표 및 달성 현황</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((goal) => (
            <div key={goal.id} className="bg-white/50 backdrop-blur-lg rounded-3xl p-5 border border-white/40 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-slate-800 text-base">{goal.subject}</span>
                  <span className="px-3 py-1 rounded-xl text-xs font-semibold bg-blue-500/10 text-blue-700 border border-blue-500/20">
                    목표 {goal.targetScore}점 ({goal.targetGrade}{profile.level === "high" ? "등급" : ""})
                  </span>
                </div>
                <p className="text-xs text-slate-600 bg-white/60 backdrop-blur-sm p-3 rounded-2xl border border-white/80 mb-3 shadow-xs">{goal.memo}</p>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-white/40 text-xs">
                <span className="text-slate-400">지속적인 실천 중</span>
                <div className="space-x-1">
                  <button
                    onClick={() => openEditGoalModal(goal)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white/80 rounded-xl transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-white/80 rounded-xl transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Study Plan Generator Section */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 rounded-3xl p-6 md:p-8 text-white shadow-xl space-y-6 border border-white/10">
        {/* Care Type Integration Banner inside AI Plan */}
        <div
          onClick={() => setIsCareModalOpen(true)}
          className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex items-center justify-between cursor-pointer hover:bg-white/15 transition-all"
        >
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{currentCare.emoji}</span>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-amber-300 font-semibold">AI 컨설팅 연동 Care Type</span>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">클릭하여 변경</span>
              </div>
              <h4 className="text-sm font-bold text-white mt-0.5">{currentCare.title} — {currentCare.subtitle}</h4>
            </div>
          </div>
          <div className="text-xs text-blue-300 font-semibold flex items-center space-x-1">
            <span>변경하기</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-300 backdrop-blur-md">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Gemini AI 맞춤형 학습 분석 및 플랜 추천</h3>
              <p className="text-xs text-slate-300">현재 성적과 오답노트를 바탕으로 성적 향상을 위한 구체적인 액션 플랜을 제안합니다.</p>
            </div>
          </div>
          <button
            onClick={generateAiPlan}
            disabled={aiLoading}
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2.5 rounded-2xl text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            {aiLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>AI 분석 생성 중...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>AI 학습 플랜 생성하기</span>
              </>
            )}
          </button>
        </div>

        {aiError && (
          <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-200 text-xs flex items-center space-x-2 backdrop-blur-md">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{aiError}</span>
          </div>
        )}

        {aiPlanData && (
          <div className="space-y-6 animate-in fade-in duration-300 bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/20">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-blue-300 mb-1">총평</h4>
              <p className="text-sm md:text-base text-white leading-relaxed font-medium">
                "{aiPlanData.overallSummary}"
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-2 backdrop-blur-sm">
                <h5 className="text-xs font-bold text-emerald-300 flex items-center space-x-1.5">
                  <CheckCircle className="w-4 h-4" />
                  <span>잘하고 있는 강점</span>
                </h5>
                <ul className="list-disc list-inside text-xs text-slate-200 space-y-1">
                  {aiPlanData.strengths.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-2 backdrop-blur-sm">
                <h5 className="text-xs font-bold text-amber-300 flex items-center space-x-1.5">
                  <AlertCircle className="w-4 h-4" />
                  <span>보완이 필요한 취약점</span>
                </h5>
                <ul className="list-disc list-inside text-xs text-slate-200 space-y-1">
                  {aiPlanData.weaknesses.map((w, idx) => (
                    <li key={idx}>{w}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-blue-600/20 p-4 rounded-2xl border border-blue-400/30 space-y-2 backdrop-blur-sm">
              <h5 className="text-xs font-bold text-amber-300 flex items-center space-x-1.5">
                <Target className="w-4 h-4" />
                <span>이번 주 핵심 액션 플랜</span>
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {aiPlanData.actionPlan.map((act, idx) => (
                  <div key={idx} className="flex items-start space-x-2 text-xs text-slate-100 bg-white/10 p-3 rounded-xl border border-white/10">
                    <span className="w-5 h-5 rounded-full bg-blue-500/40 flex items-center justify-center text-[10px] font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <span>{act}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-blue-300 mb-1">성적 향상을 위한 전략</h4>
              <p className="text-xs text-slate-200 leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/10">
                {aiPlanData.recommendedStrategy}
              </p>
            </div>
          </div>
        )}

        {!aiPlanData && !aiLoading && (
          <div className="text-center py-8 text-slate-300 text-xs">
            위의 'AI 학습 플랜 생성하기' 버튼을 눌러 맞춤형 성적 분석 리포트를 받아보세요.
          </div>
        )}
      </div>

      {/* Notification & Schedule Settings */}
      <div className="bg-white/50 backdrop-blur-lg rounded-3xl p-6 border border-white/40 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-white/40 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center border border-blue-500/20">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">학습 일정 및 알림 설정</h3>
              <p className="text-xs text-slate-500">매일 지정된 시간에 오답노트 복습 및 학습 계획 리마인더 알림을 설정합니다.</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notification.enabled}
              onChange={(e) => setNotification((prev) => ({ ...prev, enabled: e.target.checked }))}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">알림 시간</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="time"
                value={notification.time}
                onChange={(e) => setNotification((prev) => ({ ...prev, time: e.target.value }))}
                className="w-full pl-9 pr-3 py-2.5 bg-white/60 border border-white/80 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">학부모 연락처 (알림톡 수신)</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={notification.parentPhone}
                onChange={(e) => setNotification((prev) => ({ ...prev, parentPhone: e.target.value }))}
                placeholder="010-0000-0000"
                className="w-full pl-9 pr-3 py-2.5 bg-white/60 border border-white/80 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">학부모 호칭</label>
            <input
              type="text"
              value={notification.parentName}
              onChange={(e) => setNotification((prev) => ({ ...prev, parentName: e.target.value }))}
              placeholder="예: 학부모님 (어머니)"
              className="w-full px-3.5 py-2.5 bg-white/60 border border-white/80 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* Add / Edit Goal Modal */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
          <div className="bg-white/85 backdrop-blur-xl rounded-3xl max-w-md w-full p-6 shadow-2xl border border-white/60">
            <h3 className="text-lg font-bold text-slate-800 mb-4">{editingGoal ? "목표 수정" : "과목별 학습 목표 추가"}</h3>
            <form onSubmit={handleSaveGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">과목명</label>
                <input
                  type="text"
                  required
                  value={goalSubject}
                  onChange={(e) => setGoalSubject(e.target.value)}
                  placeholder="예: 수학, 영어 등"
                  className="w-full px-3.5 py-2.5 bg-white/60 border border-white/80 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">목표 점수</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={targetScore}
                    onChange={(e) => setTargetScore(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-white/60 border border-white/80 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {profile.level === "middle" ? "목표 성취도 (A~E)" : "목표 등급 (1~9)"}
                  </label>
                  <input
                    type="text"
                    required
                    value={targetGrade}
                    onChange={(e) => setTargetGrade(e.target.value)}
                    placeholder="예: 1"
                    className="w-full px-3.5 py-2.5 bg-white/60 border border-white/80 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">실천 다짐 / 메모</label>
                <input
                  type="text"
                  value={goalMemo}
                  onChange={(e) => setGoalMemo(e.target.value)}
                  placeholder="예: 오답노트 매일 2문제씩 정리"
                  className="w-full px-3.5 py-2.5 bg-white/60 border border-white/80 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-xs"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsGoalModalOpen(false)}
                  className="px-4 py-2.5 rounded-2xl text-xs font-medium bg-white/60 text-slate-600 hover:bg-white/90 border border-white/80 cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  저장하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Care Type Modal */}
      {setProfile && (
        <CareTypeModal
          isOpen={isCareModalOpen}
          onClose={() => setIsCareModalOpen(false)}
          profile={profile}
          setProfile={setProfile}
        />
      )}
    </div>
  );
}
