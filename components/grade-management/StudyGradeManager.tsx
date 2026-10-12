import React, { useState } from "react";
import { StudentInfo, GradeRecord, SubjectGrade } from "../../types";
import { SUNEUNG_SUBJECTS } from "../../data/suneungSubjects";
import { DatabaseService } from "../../services/database";

interface StudyGradeManagerProps {
  student: StudentInfo;
  records: GradeRecord[];
  onRefresh: () => void;
  onOpenManualInput: () => void;
  onOpenLadderModal?: (subjectName: string, unitName: string, weakPriority: number) => void;
  onEditRecord?: (recordId: string) => void;
}

export const StudyGradeManager: React.FC<StudyGradeManagerProps> = ({
  student,
  records,
  onRefresh,
  onOpenManualInput,
  onOpenLadderModal,
  onEditRecord,
}) => {
  const [selectedSemester, setSelectedSemester] = useState<string>("전체");
  const [searchQuery, setSearchQuery] = useState<string>(" ");

  // 모든 시험 레코드 내 과목 플랫 리스트 변환
  const flattenedGrades = records.flatMap((record) =>
    record.subjects.map((subj) => {
      const subjectInfo = SUNEUNG_SUBJECTS.find((s) => s.id === subj.subjectId);
      return {
        recordId: record.id,
        examName: record.examName,
        examDate: record.examDate,
        examType: record.examType,
        subjectId: subj.subjectId,
        subjectName: subjectInfo?.name || subj.subjectId,
        category: subjectInfo?.category === "social" ? "사회/탐구" : subjectInfo?.category === "science" ? "과학/탐구" : "기본",
        score: subj.rawScore,
        grade: subj.grade ? `${subj.grade}등급` : "-",
        standardScore: subj.standardScore,
        percentile: subj.percentile,
        memo: record.memo,
        weakUnits: subj.weakUnits || [],
      };
    })
  );

  // 고유 시험명/학기 목록
  const examNames = ["전체", ...Array.from(new Set(records.map((r) => r.examName)))];

  // 필터링
  const filteredGrades = flattenedGrades.filter((g) => {
    const matchSemester = selectedSemester === "전체" || g.examName === selectedSemester;
    const query = searchQuery.trim().toLowerCase();
    const matchSearch = !query ||
      g.subjectName.toLowerCase().includes(query) ||
      g.examName.toLowerCase().includes(query);
    return matchSemester && matchSearch;
  });

  const handleDeleteRecord = async (recordId: string) => {
    if (confirm("이 시험의 모든 성적 기록을 삭제하시겠습니까?")) {
      await DatabaseService.deleteGradeRecord(recordId);
      onRefresh();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Action Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-800">시험 및 과목별 성적 정밀 관리</h2>
            <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
              총 {records.length}개 시험 등록됨
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            중간/기말/모의고사 성적을 학기별, 과목별로 관리하고 취약단원 TOP 1·2·3순위에 맞춘 6단계 AI 사다리 훈련을 진행합니다.
          </p>
        </div>
        <button
          onClick={onOpenManualInput}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-2xl text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer shrink-0"
        >
          <span>+ 새 시험 성적 입력</span>
        </button>
      </div>

      {/* Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
          {examNames.slice(0, 5).map((exam) => (
            <button
              key={exam}
              onClick={() => setSelectedSemester(exam)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                selectedSemester === exam
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {exam}
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="🔍 과목명 또는 시험명 검색..."
            value={searchQuery.trim()}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 bg-white border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Grade Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">시험명 &amp; 일자</th>
                <th className="py-3.5 px-4">과목명</th>
                <th className="py-3.5 px-4 text-center">등급</th>
                <th className="py-3.5 px-4 text-center">원점수</th>
                <th className="py-3.5 px-4 text-center">표준점수</th>
                <th className="py-3.5 px-4 text-center">백분위</th>
                <th className="py-3.5 px-4">취약 단원 (TOP 3) &amp; AI 사다리</th>
                <th className="py-3.5 px-4 text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredGrades.length > 0 ? (
                filteredGrades.map((g, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      <div>{g.examName}</div>
                      <div className="text-[10px] text-slate-400 font-normal flex items-center gap-1 mt-0.5">
                        <span>📅</span> {g.examDate}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-blue-700">{g.subjectName}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-block px-2.5 py-0.5 bg-blue-50 text-blue-700 font-bold rounded-lg border border-blue-100 text-[11px]">
                        {g.grade}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-semibold text-slate-700">{g.score !== undefined ? `${g.score}점` : "-"}</td>
                    <td className="py-3.5 px-4 text-center text-slate-600">{g.standardScore || "-"}</td>
                    <td className="py-3.5 px-4 text-center text-slate-600">{g.percentile ? `${g.percentile}%` : "-"}</td>
                    <td className="py-3.5 px-4">
                      {g.weakUnits.length > 0 ? (
                        <div className="flex flex-wrap items-center gap-1.5">
                          {g.weakUnits.map((u, uIdx) => (
                            <button
                              key={u}
                              type="button"
                              onClick={() => onOpenLadderModal?.(g.subjectName, u, uIdx + 1)}
                              className={`px-2 py-0.5 rounded-lg text-[10.5px] font-bold border flex items-center gap-1 cursor-pointer transition-transform hover:scale-105 ${
                                uIdx === 0
                                  ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                                  : uIdx === 1
                                  ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                                  : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                              }`}
                              title={`${u} 6단계 사다리 훈련 시작`}
                            >
                              <span>{uIdx === 0 ? '🥇1위' : uIdx === 1 ? '🥈2위' : '🥉3위'}</span>
                              <span>{u}</span>
                              <span className="text-[9px] text-slate-400">⚡</span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 text-[11px]">지정 없음</span>
                          {g.subjectId === 'math' && (
                            <button
                              type="button"
                              onClick={() => onOpenLadderModal?.(g.subjectName, '[수학I] 등차수열과 등비수열', 1)}
                              className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 cursor-pointer"
                            >
                              ⚡ 수열 사다리 훈련
                            </button>
                          )}
                          {g.subjectId === 'korean' && (
                            <button
                              type="button"
                              onClick={() => onOpenLadderModal?.(g.subjectName, '[독서] 과학·기술 복합 지문', 1)}
                              className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 cursor-pointer"
                            >
                              ⚡ 독서 사다리 훈련
                            </button>
                          )}
                          {g.subjectId === 'english' && (
                            <button
                              type="button"
                              onClick={() => onOpenLadderModal?.(g.subjectName, '[수능 킬러] 빈칸추론 31~34번', 1)}
                              className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 cursor-pointer"
                            >
                              ⚡ 빈칸추론 사다리 훈련
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {onEditRecord && (
                          <button
                            onClick={() => onEditRecord(g.recordId)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer text-xs"
                            title="이 시험 기록 수정"
                          >
                            ✏️
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteRecord(g.recordId)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer text-xs"
                          title="시험 기록 삭제"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                    등록된 성적 기록이 없습니다. 상단의 '+ 새 시험 성적 입력' 버튼을 눌러 성적을 등록해보세요.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
