import React, { useState, useMemo } from "react";
import { WrongNote, WrongNoteErrorType, CareType } from "../types";
import { 
  Plus, CheckCircle2, AlertCircle, BookOpen, Search, Filter, Trash2, 
  Check, X, Camera, Sparkles, Loader2, Calendar, Brain, ArrowRight, RotateCcw, Timer
} from "lucide-react";
import { 
  analyzeWrongNotesAndCareType, 
  ERROR_TYPE_METAS, 
  calculateNextReviewDate,
  todayLocalStr
} from "../../services/wrongNotePrescriptionEngine";
import { ActiveRecallModal } from "../../components/ActiveRecallModal";

interface WrongNotesProps {
  wrongNotes: WrongNote[];
  setWrongNotes: React.Dispatch<React.SetStateAction<WrongNote[]>>;
  careType?: CareType;
}

export function WrongNotes({ wrongNotes, setWrongNotes, careType = CareType.HEALTHY }: WrongNotesProps) {
  const [selectedSubject, setSelectedSubject] = useState<string>("전체");
  const [statusFilter, setStatusFilter] = useState<string>("all"); // all, today_due, unresolved, resolved
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"list" | "card">("list");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  // Active Recall Modal State
  const [activeRecallSubject, setActiveRecallSubject] = useState<string | null>(null);

  // Form state
  const [subject, setSubject] = useState<string>("수학");
  const [questionTitle, setQuestionTitle] = useState<string>("");
  const [wrongAnswer, setWrongAnswer] = useState<string>("");
  const [correctAnswer, setCorrectAnswer] = useState<string>("");
  const [explanation, setExplanation] = useState<string>("");
  const [difficulty, setDifficulty] = useState<"상" | "중" | "하">("중");
  const [errorType, setErrorType] = useState<WrongNoteErrorType>("CONCEPT");

  const subjects = ["전체", "국어", "수학", "영어", "한국사", "통합과학", "기타"];

  // 1. 오답노트 & CareType 정밀 처방 엔진 실행
  const report = useMemo(() => {
    return analyzeWrongNotesAndCareType(wrongNotes, careType);
  }, [wrongNotes, careType]);

  const handleImageScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64String = (reader.result as string).split(",")[1];
      try {
        const res = await fetch("/api/ai/scan-wrong-note", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64String, mimeType: file.type }),
        });
        const data = await res.json();
        if (data.error) {
          alert(data.error);
        } else {
          if (data.subject) setSubject(data.subject);
          if (data.questionTitle) setQuestionTitle(data.questionTitle);
          if (data.wrongAnswer) setWrongAnswer(data.wrongAnswer);
          if (data.correctAnswer) setCorrectAnswer(data.correctAnswer);
          if (data.explanation) setExplanation(data.explanation);
          if (data.errorType) setErrorType(data.errorType);
        }
      } catch (err: any) {
        alert("이미지 스캔 중 오류가 발생했습니다: " + err.message);
      } finally {
        setIsScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    const todayStr = todayLocalStr();
    const newNote: WrongNote = {
      id: `wn_${Date.now()}`,
      subject,
      questionTitle,
      wrongAnswer,
      correctAnswer,
      explanation,
      difficulty,
      errorType,
      reviewStage: 0,
      nextReviewDate: calculateNextReviewDate(0),
      isResolved: false,
      createdAt: todayStr,
    };
    setWrongNotes((prev) => [newNote, ...prev]);
    setIsModalOpen(false);
    // Reset
    setQuestionTitle("");
    setWrongAnswer("");
    setCorrectAnswer("");
    setExplanation("");
    setErrorType("CONCEPT");
  };

  // 간격반복 단계 이동 (Pass / Retry — Retry는 전면 리셋 대신 한 단계 후퇴)
  const handleReviewStep = (id: string, passed: boolean) => {
    const todayStr = todayLocalStr();
    setWrongNotes((prev) =>
      prev.map((n) => {
        if (n.id !== id) return n;
        const currentStage = n.reviewStage || 0;
        const newStage = passed ? Math.min(4, currentStage + 1) : Math.max(0, currentStage - 1);
        const nextDate = calculateNextReviewDate(newStage);
        const isMastered = newStage >= 4;

        return {
          ...n,
          reviewStage: newStage,
          nextReviewDate: nextDate,
          lastReviewedAt: todayStr,
          isResolved: isMastered ? true : n.isResolved,
          reviewHistory: [
            ...(n.reviewHistory || []),
            { date: todayStr, passed }
          ]
        };
      })
    );
  };

  const toggleResolved = (id: string) => {
    setWrongNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isResolved: !n.isResolved } : n))
    );
  };

  const handleDelete = (id: string) => {
    if (confirm("이 오답노트를 삭제하시겠습니까?")) {
      setWrongNotes((prev) => prev.filter((n) => n.id !== id));
    }
  };

  const todayStr = todayLocalStr();

  const filteredNotes = wrongNotes.filter((n) => {
    const matchSubject = selectedSubject === "전체" || n.subject === selectedSubject;
    const isDueToday = !n.isResolved && (!n.nextReviewDate || n.nextReviewDate <= todayStr);
    
    let matchStatus = true;
    if (statusFilter === "today_due") {
      matchStatus = isDueToday;
    } else if (statusFilter === "unresolved") {
      matchStatus = !n.isResolved;
    } else if (statusFilter === "resolved") {
      matchStatus = n.isResolved;
    }

    const matchSearch =
      n.questionTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.explanation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSubject && matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg p-6 rounded-3xl border border-white/40 dark:border-slate-700/40 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">스마트 오답 노트 & 망각곡선 처방</h2>
            <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/20 dark:border-rose-500/30">
              CareType 연동 에빙하우스 간격반복
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            4대 오답 원인을 자동 분석하고, 1일 ➡️ 3일 ➡️ 7일 망각곡선 주기에 맞춰 두뇌 신경인지 최적화 복습을 지원합니다.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveRecallSubject(selectedSubject === "전체" ? "수학" : selectedSubject)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-2xl text-xs shadow-md shadow-indigo-500/20 flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Timer className="w-4 h-4" />
            <span>백지 인출 (Active Recall)</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-2xl text-xs shadow-md shadow-blue-500/20 flex items-center space-x-2 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>오답노트 등록</span>
          </button>
        </div>
      </div>

      {/* 🧠 CareType 맞춤 오답 처방 브리핑 카드 (3개 이상 누적 시 표시) */}
      {wrongNotes.length >= 3 && report.subjectPrescriptions.length > 0 && (
        <div className="bg-gradient-to-br from-indigo-900/90 to-slate-900 text-white p-6 rounded-3xl border border-indigo-500/30 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-indigo-800/60 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center text-xl">
                🧠
              </div>
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <span>CareType 맞춤 오답 극복 처방 브리핑</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 font-bold font-mono">
                    {careType}
                  </span>
                </h3>
                <p className="text-xs text-indigo-200">
                  누적된 {wrongNotes.length}개의 오답 데이터를 신경인지 기전과 결합하여 맞춤 복습 프로토콜을 산출했습니다.
                </p>
              </div>
            </div>
            {report.dueTodayNotes.length > 0 && (
              <div className="flex items-center gap-2 bg-rose-500/20 border border-rose-500/40 px-3.5 py-1.5 rounded-2xl text-xs text-rose-300 font-bold">
                <AlertCircle size={15} />
                <span>오늘 망각곡선 복습 대상: {report.dueTodayNotes.length}문항</span>
              </div>
            )}
          </div>

          {/* CareType Alert if exists */}
          {report.careTypeAlert && (
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-amber-200 leading-relaxed flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <span>{report.careTypeAlert}</span>
            </div>
          )}

          {/* Subject-Specific Prescription Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {report.subjectPrescriptions.slice(0, 2).map((sp) => (
              <div key={sp.subject} className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-2xl space-y-2.5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
                      {sp.subject}
                    </span>
                    <span className="text-xs font-bold text-slate-300">{sp.actionablePrescription.title}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {sp.resolvedCount}/{sp.totalCount} 정복
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {sp.actionablePrescription.problemSolvingMethod}
                </p>
                <div className="space-y-1 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-400">
                  {sp.actionablePrescription.recommendedStepRoutine.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <span className="text-indigo-400 font-bold">•</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg p-4 rounded-3xl border border-white/40 dark:border-slate-700/40 shadow-sm">
        <div className="flex items-center space-x-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 scrollbar-none">
          {subjects.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${selectedSubject === sub
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 font-bold"
                  : "bg-white/60 text-slate-600 hover:bg-white/80 border border-white/60"
                }`}
            >
              {sub}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
          <div className="flex items-center bg-white/60 backdrop-blur-md p-1 rounded-2xl border border-white/60 shadow-xs">
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer flex items-center space-x-1 ${viewMode === "list" ? "bg-blue-600 text-white shadow-sm font-bold" : "text-slate-600 hover:text-slate-800"
                }`}
            >
              <span>일렬 정렬</span>
            </button>
            <button
              onClick={() => setViewMode("card")}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer flex items-center space-x-1 ${viewMode === "card" ? "bg-blue-600 text-white shadow-sm font-bold" : "text-slate-600 hover:text-slate-800"
                }`}
            >
              <span>카드형</span>
            </button>
          </div>

          <div className="flex items-center bg-white/60 backdrop-blur-md p-1 rounded-2xl border border-white/60 shadow-xs">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer ${statusFilter === "all" ? "bg-white text-slate-800 shadow-sm font-bold" : "text-slate-600"
                }`}
            >
              전체 ({wrongNotes.length})
            </button>
            <button
              onClick={() => setStatusFilter("today_due")}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer flex items-center gap-1 ${statusFilter === "today_due" ? "bg-rose-500 text-white shadow-sm font-bold" : "text-rose-600 font-bold"
                }`}
            >
              <span>📅 오늘 복습</span>
              {report.dueTodayNotes.length > 0 && (
                <span className="px-1.5 py-0.2 bg-rose-600 text-white rounded-full text-[10px]">
                  {report.dueTodayNotes.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setStatusFilter("unresolved")}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer ${statusFilter === "unresolved" ? "bg-white text-rose-700 shadow-sm font-bold" : "text-slate-600"
                }`}
            >
              미해결
            </button>
            <button
              onClick={() => setStatusFilter("resolved")}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer ${statusFilter === "resolved" ? "bg-white text-emerald-700 shadow-sm font-bold" : "text-slate-600"
                }`}
            >
              정복완료
            </button>
          </div>

          <div className="relative w-full sm:w-52">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="문제 검색..."
              className="w-full pl-9 pr-4 py-2 bg-white/65 backdrop-blur-md border border-white/60 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* Wrong Notes Container (List or Card) */}
      <div className={viewMode === "card" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" : "space-y-4"}>
        {filteredNotes.map((note) => {
          const errorMeta = ERROR_TYPE_METAS[note.errorType || "CONCEPT"];
          const stage = note.reviewStage || 0;
          const isDue = !note.isResolved && (!note.nextReviewDate || note.nextReviewDate <= todayStr);

          return (
            <div
              key={note.id}
              className={`bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg rounded-3xl border p-5 shadow-sm transition-all ${
                viewMode === "card" ? "flex flex-col justify-between" : "flex flex-col md:flex-row md:items-center justify-between gap-4"
              } ${
                note.isResolved 
                  ? "border-emerald-300/60 bg-emerald-50/20" 
                  : isDue
                    ? "border-rose-400 bg-rose-50/10 shadow-md shadow-rose-500/5"
                    : "border-white/40 hover:border-blue-300"
              }`}
            >
              <div className={viewMode === "list" ? "flex-1 space-y-2.5" : "space-y-3"}>
                <div className="flex flex-wrap justify-between items-center gap-2 mb-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-blue-500/10 text-blue-700 border border-blue-500/20">
                      {note.subject}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold border flex items-center gap-1 ${errorMeta.badgeColor}`}>
                      <span>{errorMeta.icon}</span>
                      <span>{errorMeta.label.split(' ')[0]}</span>
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-medium ${
                      note.difficulty === "상" ? "bg-rose-100 text-rose-700" :
                      note.difficulty === "중" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                    }`}>
                      {note.difficulty}
                    </span>
                  </div>

                  {/* Spaced Repetition Stage Badge */}
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold border ${
                      note.isResolved
                        ? "bg-emerald-100 text-emerald-700 border-emerald-300"
                        : isDue
                          ? "bg-rose-500 text-white border-rose-600 animate-pulse font-mono"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                    }`}>
                      {note.isResolved ? "🎉 정복 완료" : isDue ? "🔥 오늘 복습 D-Day" : `${stage}단계 (${note.nextReviewDate} 복습)`}
                    </span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">{note.questionTitle}</h3>

                <div className={viewMode === "list" ? "flex flex-wrap gap-4 text-xs bg-white/60 backdrop-blur-sm p-3 rounded-2xl border border-white/80" : "space-y-2 bg-white/60 backdrop-blur-sm p-3.5 rounded-2xl border border-white/80 text-xs shadow-xs"}>
                  <div>
                    <span className="font-semibold text-rose-600 mr-1.5">내 오답:</span>
                    <span className="text-slate-700">{note.wrongAnswer}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-emerald-600 mr-1.5">정답:</span>
                    <span className="text-slate-800 font-medium">{note.correctAnswer}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-blue-500/5 p-3.5 rounded-2xl border border-blue-500/10">
                  <strong className="text-blue-900 dark:text-blue-300 block mb-1">💡 원인 분석 & 해설</strong>
                  {note.explanation}
                </p>
              </div>

              {/* Action Buttons with Spaced Repetition Stepping */}
              <div className={viewMode === "list" ? "flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/60 flex-wrap" : "pt-4 mt-4 border-t border-white/40 flex items-center justify-between flex-wrap gap-2"}>
                {!note.isResolved && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleReviewStep(note.id, true)}
                      title="오늘 복습 통과 (다음 간격으로 진행)"
                      className="flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>복습 완료 ({stage + 1}단계로)</span>
                    </button>
                    <button
                      onClick={() => handleReviewStep(note.id, false)}
                      title="다시 틀림 (1단계로 리셋)"
                      className="p-1.5 rounded-xl text-xs bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <button
                  onClick={() => toggleResolved(note.id)}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    note.isResolved
                      ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                      : "bg-white/60 text-slate-600 hover:bg-blue-50 hover:text-blue-600 border border-white/60"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{note.isResolved ? "완료됨" : "마스터 처리"}</span>
                </button>

                <button
                  onClick={() => handleDelete(note.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {filteredNotes.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white/30 backdrop-blur-lg rounded-3xl border border-white/40">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-700">등록된 오답노트가 없습니다.</h4>
            <p className="text-xs text-slate-400 mt-1">틀린 문제를 등록하여 CareType 맞춤 복습 처방과 간격반복 스케줄을 받아보세요.</p>
          </div>
        )}
      </div>

      {/* Modal: New Wrong Note */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-white/60 dark:border-slate-700 w-full max-w-xl rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">새 오답노트 등록 & 원인 진단</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* AI Photo Scan Upload Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white shadow-md relative overflow-hidden">
              <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-1.5 text-amber-300 text-xs font-bold mb-1">
                    <Sparkles className="w-4 h-4" />
                    <span>AI 문제 사진/스캔 자동 입력</span>
                  </div>
                  <p className="text-[11px] text-blue-100">
                    시험지나 오답노트 사진을 올리면 AI가 과목, 문제, 오답, 정답, 해설을 자동으로 분석해 채워줍니다!
                  </p>
                </div>
                <label className="bg-white hover:bg-blue-50 text-blue-900 font-bold px-4 py-2.5 rounded-2xl text-xs shadow-md transition-all cursor-pointer flex items-center space-x-2 shrink-0">
                  {isScanning ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      <span>AI 분석 중...</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4 text-blue-600" />
                      <span>사진 업로드 & 스캔</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageScan}
                    disabled={isScanning}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <form onSubmit={handleAddNote} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">과목</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white/60 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                  >
                    <option value="수학">수학</option>
                    <option value="국어">국어</option>
                    <option value="영어">영어</option>
                    <option value="한국사">한국사</option>
                    <option value="통합과학">통합과학</option>
                    <option value="기타">기타</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">난이도</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as "상" | "중" | "하")}
                    className="w-full px-3.5 py-2.5 bg-white/60 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                  >
                    <option value="상">상 (킬러 문항)</option>
                    <option value="중">중 (응용 문제)</option>
                    <option value="하">하 (기본 개념)</option>
                  </select>
                </div>
              </div>

              {/* 4대 오답 원인 유형 선택기 */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  🔍 오답 원인 유형 분류 (CareType 매핑)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(ERROR_TYPE_METAS) as WrongNoteErrorType[]).map((k) => {
                    const meta = ERROR_TYPE_METAS[k];
                    const isSelected = errorType === k;
                    return (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setErrorType(k)}
                        className={`p-2.5 rounded-2xl border text-left transition cursor-pointer ${
                          isSelected
                            ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-900 dark:text-indigo-200 shadow-sm"
                            : "bg-white/60 dark:bg-slate-700/40 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 text-xs font-bold">
                          <span>{meta.icon}</span>
                          <span>{meta.label.split(' ')[0]}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                          {meta.description}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">문제 제목 / 단원</label>
                <input
                  type="text"
                  required
                  value={questionTitle}
                  onChange={(e) => setQuestionTitle(e.target.value)}
                  placeholder="예: 삼각함수의 덧셈정리와 극한 활용"
                  className="w-full px-3.5 py-2.5 bg-white/60 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">내가 적은 오답</label>
                  <input
                    type="text"
                    required
                    value={wrongAnswer}
                    onChange={(e) => setWrongAnswer(e.target.value)}
                    placeholder="예: -4"
                    className="w-full px-3.5 py-2.5 bg-white/60 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">올바른 정답</label>
                  <input
                    type="text"
                    required
                    value={correctAnswer}
                    onChange={(e) => setCorrectAnswer(e.target.value)}
                    placeholder="예: 8"
                    className="w-full px-3.5 py-2.5 bg-white/60 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">핵심 해설 및 실수 원인 분석</label>
                <textarea
                  required
                  rows={3}
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="틀린 이유와 정확한 풀이 과정을 적어주세요..."
                  className="w-full px-3.5 py-2.5 bg-white/60 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none shadow-xs"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-2xl text-xs font-medium bg-white/60 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-white/90 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 cursor-pointer font-bold"
                >
                  저장 & 망각곡선 큐 등록
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Active Recall Modal */}
      <ActiveRecallModal
        isOpen={!!activeRecallSubject}
        onClose={() => setActiveRecallSubject(null)}
        subject={activeRecallSubject || "수학"}
        careType={careType}
      />
    </div>
  );
}
