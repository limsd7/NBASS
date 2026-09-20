import React, { useState } from "react";
import { SubjectGrade, WrongNote, SubjectGoal, StudentProfile } from "../types";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import { TrendingUp, Award, BookOpen, Target, Sparkles, CheckCircle2, AlertCircle, ArrowRight, Activity, Brain, ChevronRight } from "lucide-react";
import { getCareTypeDetail } from "../data/careTypesData";
import { CareTypeModal } from "./CareTypeModal";

interface DashboardProps {
  grades: SubjectGrade[];
  wrongNotes: WrongNote[];
  goals: SubjectGoal[];
  profile: StudentProfile;
  setProfile?: React.Dispatch<React.SetStateAction<StudentProfile>>;
  setActiveTab: (tab: string) => void;
}

export function Dashboard({ grades, wrongNotes, goals, profile, setProfile, setActiveTab }: DashboardProps) {
  const [isCareModalOpen, setIsCareModalOpen] = useState<boolean>(false);
  const currentCare = getCareTypeDetail(profile.careType || "BRAIN_FATIGUE");

  // Calculate statistics
  const totalGrades = grades.length;
  const averageScore = totalGrades > 0 ? (grades.reduce((acc, g) => acc + g.score, 0) / totalGrades).toFixed(1) : "0.0";
  const unresolvedNotes = wrongNotes.filter((n) => !n.isResolved).length;

  // Group by semester for trend chart
  const semesterMap: { [semester: string]: { sum: number; count: number } } = {};
  grades.forEach((g) => {
    if (!semesterMap[g.semester]) {
      semesterMap[g.semester] = { sum: 0, count: 0 };
    }
    semesterMap[g.semester].sum += g.score;
    semesterMap[g.semester].count += 1;
  });

  const trendData = Object.keys(semesterMap)
    .sort()
    .map((sem) => ({
      semester: sem,
      average: parseFloat((semesterMap[sem].sum / semesterMap[sem].count).toFixed(1)),
    }));

  // Category average breakdown
  const categoryMap: { [cat: string]: { sum: number; count: number } } = {};
  grades.forEach((g) => {
    if (!categoryMap[g.category]) {
      categoryMap[g.category] = { sum: 0, count: 0 };
    }
    categoryMap[g.category].sum += g.score;
    categoryMap[g.category].count += 1;
  });

  const categoryData = Object.keys(categoryMap).map((cat) => ({
    category: cat,
    score: parseFloat((categoryMap[cat].sum / categoryMap[cat].count).toFixed(1)),
  }));

  const COLORS = ["#2563eb", "#06b6d4", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden border border-white/20">
        <div className="absolute right-0 bottom-0 opacity-10 translate-x-4 translate-y-4">
          <Sparkles className="w-64 h-64" />
        </div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 bg-blue-500/30 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-blue-200 border border-blue-400/20 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            <span>{profile.schoolName} {profile.gradeLevel}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
            안녕하세요, <span className="text-blue-300">{profile.name}</span> 학생! 👋
          </h2>
          <p className="text-blue-100 text-sm md:text-base leading-relaxed">
            이번 학기 목표를 향해 한 걸음 더 전진하고 있어요. 등록된 성적을 분석하고 맞춤형 학습 계획과 오답노트를 관리해보세요.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab("grades")}
              className="bg-white/90 backdrop-blur-sm text-blue-900 font-semibold px-5 py-2.5 rounded-2xl text-sm shadow-md hover:bg-white transition-colors flex items-center space-x-2 cursor-pointer"
            >
              <span>성적 입력 및 관리</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab("goals")}
              className="bg-blue-600/60 hover:bg-blue-600 text-white font-medium px-5 py-2.5 rounded-2xl text-sm border border-blue-400/30 transition-colors flex items-center space-x-2 cursor-pointer shadow-md"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>AI 학습 플랜 보기</span>
            </button>
          </div>
        </div>
      </div>

      {/* 12대 Care Type Quick Status Banner */}
      <div
        onClick={() => setIsCareModalOpen(true)}
        className="bg-white/70 backdrop-blur-xl rounded-3xl p-5 border border-white/60 shadow-sm hover:border-blue-300 transition-all cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
      >
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform">
            {currentCare.emoji}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-700 border border-blue-500/20">
                12대 뇌파·자율신경 Care Type
              </span>
              <span className="text-xs text-slate-400">클릭하여 변경 및 상세 처방 확인</span>
            </div>
            <h3 className="text-base font-bold text-slate-800 mt-1 flex items-center space-x-2">
              <span>{currentCare.title}</span>
              <span className="text-xs font-normal text-slate-500">({currentCare.subtitle})</span>
            </h3>
            <p className="text-xs text-slate-600 mt-1 line-clamp-1">
              <strong className="text-blue-700 mr-1">맞춤 처방:</strong> {currentCare.prescription}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-1 text-xs font-bold text-blue-600 shrink-0 bg-blue-50 px-4 py-2.5 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
          <span>Care Type 진단/변경</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/50 backdrop-blur-lg rounded-3xl p-5 border border-white/40 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">전체 평균 점수</p>
            <h3 className="text-2xl font-bold text-slate-800">{averageScore}점</h3>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">상위권 유지 중</p>
          </div>
        </div>

        <div className="bg-white/50 backdrop-blur-lg rounded-3xl p-5 border border-white/40 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">등록된 성적 건수</p>
            <h3 className="text-2xl font-bold text-slate-800">{totalGrades}건</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">과목별 시험 데이터</p>
          </div>
        </div>

        <div className="bg-white/50 backdrop-blur-lg rounded-3xl p-5 border border-white/40 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">설정된 목표 과목</p>
            <h3 className="text-2xl font-bold text-slate-800">{goals.length}개 과목</h3>
            <p className="text-[11px] text-blue-600 font-medium mt-0.5">목표 달성 도전 중</p>
          </div>
        </div>

        <div className="bg-white/50 backdrop-blur-lg rounded-3xl p-5 border border-white/40 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">미해결 오답 노트</p>
            <h3 className="text-2xl font-bold text-slate-800">{unresolvedNotes}문항</h3>
            <p className="text-[11px] text-rose-600 font-medium mt-0.5">집중 복습 필요</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Semester Trend Line Chart */}
        <div className="bg-white/50 backdrop-blur-lg rounded-3xl p-6 border border-white/40 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">학기별 성적 추이 그래프</h3>
              <p className="text-xs text-slate-500">학기별 평균 점수 변화를 확인하세요</p>
            </div>
            <span className="text-xs font-medium px-3 py-1 bg-white/60 text-slate-600 rounded-xl border border-white/60">전체 학기</span>
          </div>
          <div className="h-72 w-full">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="semester" stroke="#64748b" fontSize={12} />
                  <YAxis domain={[60, 100]} stroke="#64748b" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", borderRadius: "16px", color: "#fff", border: "none" }}
                    formatter={(value) => [`${value}점`, "평균 점수"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="average"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ r: 5, fill: "#2563eb", strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                등록된 성적 데이터가 없습니다.
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown Bar Chart */}
        <div className="bg-white/50 backdrop-blur-lg rounded-3xl p-6 border border-white/40 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">영역별 평균 점수</h3>
              <p className="text-xs text-slate-500">과목 영역별 성취도 분석</p>
            </div>
          </div>
          <div className="h-72 w-full">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="category" stroke="#64748b" fontSize={11} />
                  <YAxis domain={[0, 100]} stroke="#64748b" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", borderRadius: "16px", color: "#fff", border: "none" }}
                    formatter={(value) => [`${value}점`, "평균"]}
                  />
                  <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                데이터가 없습니다.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Wrong Notes & Goals Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Wrong Notes */}
        <div className="bg-white/50 backdrop-blur-lg rounded-3xl p-6 border border-white/40 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold text-slate-800">최근 오답 노트</h3>
            <button
              onClick={() => setActiveTab("wrongnotes")}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              전체보기 &rarr;
            </button>
          </div>
          <div className="space-y-3">
            {wrongNotes.slice(0, 3).map((note) => (
              <div key={note.id} className="p-4 rounded-2xl border border-white/60 bg-white/40 flex items-start justify-between shadow-xs">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-blue-500/10 text-blue-700">
                      {note.subject}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                      note.difficulty === "상" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                    }`}>
                      난이도 {note.difficulty}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-800">{note.questionTitle}</h4>
                  <p className="text-xs text-slate-600 line-clamp-1">{note.explanation}</p>
                </div>
                <div>
                  {note.isResolved ? (
                    <span className="inline-flex items-center text-xs text-emerald-600 font-medium bg-emerald-50 px-2.5 py-1 rounded-xl">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> 복습완료
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-xs text-rose-600 font-medium bg-rose-50 px-2.5 py-1 rounded-xl">
                      <AlertCircle className="w-3.5 h-3.5 mr-1" /> 미해결
                    </span>
                  )}
                </div>
              </div>
            ))}
            {wrongNotes.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-6">등록된 오답노트가 없습니다.</p>
            )}
          </div>
        </div>

        {/* Goals Summary */}
        <div className="bg-white/50 backdrop-blur-lg rounded-3xl p-6 border border-white/40 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold text-slate-800">과목별 학습 목표</h3>
            <button
              onClick={() => setActiveTab("goals")}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              목표 설정 관리 &rarr;
            </button>
          </div>
          <div className="space-y-3">
            {goals.map((goal) => (
              <div key={goal.id} className="p-4 rounded-2xl border border-white/60 bg-white/40 flex items-center justify-between shadow-xs">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-sm text-slate-800">{goal.subject}</span>
                    <span className="text-xs font-medium bg-blue-500/10 text-blue-700 px-2.5 py-0.5 rounded-xl">
                      목표: {goal.targetScore}점 ({goal.targetGrade}등급)
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{goal.memo}</p>
                </div>
                <div className="w-24 bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: `${Math.min(goal.targetScore, 100)}%` }}></div>
                </div>
              </div>
            ))}
            {goals.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-6">설정된 목표가 없습니다.</p>
            )}
          </div>
        </div>
      </div>

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
