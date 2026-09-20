import React, { useState } from "react";
import { SubjectGrade, SubjectCategory, ExamType, StudentProfile } from "../types";
import { Plus, Trash2, Edit3, Calculator, Award, FileSpreadsheet, Search, CheckCircle } from "lucide-react";

interface GradeManagerProps {
  grades: SubjectGrade[];
  setGrades: React.Dispatch<React.SetStateAction<SubjectGrade[]>>;
  profile: StudentProfile;
}

export function GradeManager({ grades, setGrades, profile }: GradeManagerProps) {
  const [selectedSemester, setSelectedSemester] = useState<string>("전체");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingGrade, setEditingGrade] = useState<SubjectGrade | null>(null);

  // Form state
  const [semester, setSemester] = useState<string>("2026-1학기");
  const [subjectName, setSubjectName] = useState<string>("수학");
  const [category, setCategory] = useState<SubjectCategory>("수학");
  const [examType, setExamType] = useState<ExamType>("중간고사");
  const [score, setScore] = useState<number>(90);
  const [grade, setGrade] = useState<string>("1");
  const [unit, setUnit] = useState<number>(4);
  const [note, setNote] = useState<string>("");

  // Available semesters derived from grades + default
  const semesters = ["전체", "2026-1학기", "2025-2학기", "2025-1학기", "2024-2학기"];

  const openAddModal = () => {
    setEditingGrade(null);
    setSemester("2026-1학기");
    setSubjectName("수학");
    setCategory("수학");
    setExamType("중간고사");
    setScore(90);
    setGrade("1");
    setUnit(4);
    setNote("");
    setIsModalOpen(true);
  };

  const openEditModal = (item: SubjectGrade) => {
    setEditingGrade(item);
    setSemester(item.semester);
    setSubjectName(item.subjectName);
    setCategory(item.category);
    setExamType(item.examType);
    setScore(item.score);
    setGrade(item.grade || "1");
    setUnit(item.unit);
    setNote(item.note || "");
    setIsModalOpen(true);
  };

  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingGrade) {
      setGrades((prev) =>
        prev.map((g) =>
          g.id === editingGrade.id
            ? { ...g, semester, subjectName, category, examType, score, grade, unit, note }
            : g
        )
      );
    } else {
      const newGrade: SubjectGrade = {
        id: `g_${Date.now()}`,
        semester,
        subjectName,
        category,
        examType,
        score,
        grade,
        unit,
        note,
      };
      setGrades((prev) => [newGrade, ...prev]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("정말 이 성적 기록을 삭제하시겠습니까?")) {
      setGrades((prev) => prev.filter((g) => g.id !== id));
    }
  };

  // Filtered grades
  const filteredGrades = grades.filter((g) => {
    const matchSemester = selectedSemester === "전체" || g.semester === selectedSemester;
    const matchSearch = g.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) || g.note?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSemester && matchSearch;
  });

  // Calculations for current filter
  const currentTotal = filteredGrades.length;
  const currentAvgScore = currentTotal > 0 ? (filteredGrades.reduce((acc, g) => acc + g.score, 0) / currentTotal).toFixed(1) : "0.0";
  const totalUnits = filteredGrades.reduce((acc, g) => acc + g.unit, 0);
  const weightedScoreSum = filteredGrades.reduce((acc, g) => acc + g.score * g.unit, 0);
  const weightedAvg = totalUnits > 0 ? (weightedScoreSum / totalUnits).toFixed(1) : "0.0";

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg p-6 rounded-3xl border border-white/40 dark:border-slate-700/40 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">과목별 성적 및 평균 관리</h2>
            <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/20 dark:border-blue-500/30">
              {profile.level === "middle" ? "중등 성취도(A~E)" : "고등 등급(1~9)"}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">과목별 점수와 이수 단위를 입력하면 평균과 가중 평균이 자동으로 계산됩니다.</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-2xl text-sm shadow-md shadow-blue-500/20 flex items-center justify-center space-x-2 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>성적 과목 추가하기</span>
        </button>
      </div>

      {/* Summary Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg border border-white/40 dark:border-slate-700/40 p-4 rounded-3xl flex items-center space-x-4 shadow-sm">
          <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-md shadow-blue-500/20">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-blue-600 dark:text-blue-400">선택 조건 평균 점수</p>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{currentAvgScore}점</h3>
          </div>
        </div>

        <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg border border-white/40 dark:border-slate-700/40 p-4 rounded-3xl flex items-center space-x-4 shadow-sm">
          <div className="p-3 bg-cyan-600 text-white rounded-2xl shadow-md shadow-cyan-500/20">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-cyan-600 dark:text-cyan-400">이수 단위 가중 평균</p>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{weightedAvg}점</h3>
          </div>
        </div>

        <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg border border-white/40 dark:border-slate-700/40 p-4 rounded-3xl flex items-center space-x-4 shadow-sm">
          <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-md shadow-emerald-500/20">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">총 이수 과목/단위</p>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{currentTotal}과목 ({totalUnits}단위)</h3>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg p-4 rounded-3xl border border-white/40 dark:border-slate-700/40 shadow-sm">
        <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
          {semesters.map((sem) => (
            <button
              key={sem}
              onClick={() => setSelectedSemester(sem)}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${selectedSemester === sem
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "bg-white/60 text-slate-600 hover:bg-white/80 border border-white/60"
                }`}
            >
              {sem}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="과목명 또는 메모 검색..."
            className="w-full pl-9 pr-4 py-2 bg-white/60 backdrop-blur-md border border-white/60 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
          />
        </div>
      </div>

      {/* Grades Table */}
      <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg rounded-3xl border border-white/40 dark:border-slate-700/40 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/40 dark:bg-slate-800/40 border-b border-white/40 dark:border-slate-700/40 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <th className="py-4 px-4">학기</th>
                <th className="py-4 px-4">과목 영역</th>
                <th className="py-4 px-4">과목명</th>
                <th className="py-4 px-4">시험 유형</th>
                <th className="py-4 px-4">점수</th>
                <th className="py-4 px-4">{profile.level === "middle" ? "성취도" : "등급"}</th>
                <th className="py-4 px-4">이수단위</th>
                <th className="py-4 px-4">학습 메모</th>
                <th className="py-4 px-4 text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/30 dark:divide-slate-700/30 text-sm text-slate-700 dark:text-slate-300">
              {filteredGrades.map((g) => (
                <tr key={g.id} className="hover:bg-white/40 dark:hover:bg-slate-700/40 transition-colors">
                  <td className="py-4 px-4 text-xs font-medium text-slate-500 dark:text-slate-400">{g.semester}</td>
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-1 rounded-xl text-xs font-medium bg-white/60 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 border border-white/60 dark:border-slate-600">
                      {g.category}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-bold text-slate-800 dark:text-slate-100">{g.subjectName}</td>
                  <td className="py-4 px-4 text-xs text-slate-600 dark:text-slate-400">{g.examType}</td>
                  <td className="py-4 px-4 font-semibold text-blue-600 dark:text-blue-400">{g.score}점</td>
                  <td className="py-4 px-4">
                    <span className={`px-2.5 py-1 rounded-xl text-xs font-bold ${g.grade === "1" || g.grade === "A" ? "bg-emerald-100 text-emerald-700" : "bg-white/60 text-slate-700 border border-white/60"
                      }`}>
                      {g.grade ? `${g.grade}${profile.level === "high" ? "등급" : ""}` : "-"}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-xs text-slate-500">{g.unit}단위</td>
                  <td className="py-4 px-4 text-xs text-slate-500 max-w-xs truncate">{g.note || "-"}</td>
                  <td className="py-4 px-4 text-right space-x-1">
                    <button
                      onClick={() => openEditModal(g)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-white/80 rounded-xl transition-colors cursor-pointer"
                      title="수정"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(g.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white/80 rounded-xl transition-colors cursor-pointer"
                      title="삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredGrades.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-400 text-sm">
                    조건에 해당하는 성적 데이터가 없습니다. 새로운 성적을 추가해보세요.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-md p-4">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl max-w-md w-full p-6 shadow-2xl border border-white/60 dark:border-slate-700/60 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">
              {editingGrade ? "성적 정보 수정" : "새로운 과목 성적 등록"}
            </h3>
            <form onSubmit={handleSaveGrade} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">학기 선택</label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/60 dark:bg-slate-700/60 border border-white/80 dark:border-slate-600 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                >
                  <option value="2026-1학기">2026-1학기</option>
                  <option value="2025-2학기">2025-2학기</option>
                  <option value="2025-1학기">2025-1학기</option>
                  <option value="2024-2학기">2024-2학기</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">과목 영역</label>
                  <select
                    value={category}
                    onChange={(e) => {
                      const cat = e.target.value as SubjectCategory;
                      setCategory(cat);
                      setSubjectName(cat === "사회/역사" ? "한국사" : cat);
                    }}
                    className="w-full px-3.5 py-2.5 bg-white/60 dark:bg-slate-700/60 border border-white/80 dark:border-slate-600 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                  >
                    <option value="국어">국어</option>
                    <option value="수학">수학</option>
                    <option value="영어">영어</option>
                    <option value="사회/역사">사회/역사</option>
                    <option value="과학">과학</option>
                    <option value="기타">기타</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">과목명</label>
                  <input
                    type="text"
                    required
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    placeholder="예: 수학, 문학 등"
                    className="w-full px-3.5 py-2.5 bg-white/60 dark:bg-slate-700/60 border border-white/80 dark:border-slate-600 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">시험 유형</label>
                  <select
                    value={examType}
                    onChange={(e) => setExamType(e.target.value as ExamType)}
                    className="w-full px-3.5 py-2.5 bg-white/60 dark:bg-slate-700/60 border border-white/80 dark:border-slate-600 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                  >
                    <option value="중간고사">중간고사</option>
                    <option value="기말고사">기말고사</option>
                    <option value="수행평가">수행평가</option>
                    <option value="모의고사">모의고사</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">점수 (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={score}
                    onChange={(e) => setScore(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-white/60 dark:bg-slate-700/60 border border-white/80 dark:border-slate-600 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {profile.level === "middle" ? "성취도 (A~E)" : "등급 (1~9)"}
                  </label>
                  <input
                    type="text"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    placeholder={profile.level === "middle" ? "예: A" : "예: 1"}
                    className="w-full px-3.5 py-2.5 bg-white/60 dark:bg-slate-700/60 border border-white/80 dark:border-slate-600 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">이수 단위</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={unit}
                    onChange={(e) => setUnit(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-white/60 dark:bg-slate-700/60 border border-white/80 dark:border-slate-600 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">학습 메모 / 피드백</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="예: 취약 단원 보완 필요"
                  className="w-full px-3.5 py-2.5 bg-white/60 dark:bg-slate-700/60 border border-white/80 dark:border-slate-600 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-2xl text-xs font-medium bg-white/60 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-white/90 dark:hover:bg-slate-600 border border-white/80 dark:border-slate-600 cursor-pointer"
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
    </div>
  );
}
