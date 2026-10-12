import React, { useState } from "react";
import { StudentInfo, GradeRecord, GradeGoal, AssessmentResult } from "../../types";
import { CareTypeModal } from "./CareTypeModal";
import { computeAdherence, computeHabitAdherence } from "../../services/treatmentAdherence";
import { useStudyDashboardData } from "./dashboard/useStudyDashboardData";
import { StudyDashboardCharts } from "./dashboard/StudyDashboardCharts";
import { LadderTrainingCard } from "./dashboard/LadderTrainingCard";

interface StudyDashboardProps {
  student: StudentInfo;
  records: GradeRecord[];
  goals: GradeGoal[];
  latestAssessment?: AssessmentResult;
  onNavigateTab: (tab: string) => void;
  onOpenInputModal: () => void;
  onOpenLadderModal?: (subjectName: string, unitName: string, weakPriority: number) => void;
}

export const StudyDashboard: React.FC<StudyDashboardProps> = ({
  student,
  records,
  goals,
  latestAssessment,
  onNavigateTab,
  onOpenInputModal,
  onOpenLadderModal,
}) => {
  const [isCareModalOpen, setIsCareModalOpen] = useState(false);
  const [ladderSubjectFilter, setLadderSubjectFilter] = useState<'all' | 'korean' | 'math' | 'english'>('all');

  const { hasAssessment, careTypeCode, currentCare, avgGrade, trendData, subjectBarData, COLORS } =
    useStudyDashboardData(student, records, latestAssessment);

  const adherence = computeAdherence(latestAssessment);
  // Habit 분리 지표 (전문가 처방 %와 분리 표기, 기존 % 산식 유지)
  const habitAdherence = computeHabitAdherence(latestAssessment?.completedExpertGuideItems);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden border border-white/20">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 bg-blue-500/30 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-blue-200 border border-blue-400/20 mb-3">
            <span>✨</span>
            <span>
              {student.school || "학교"} · {student.grade || "학년"}
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
            안녕하세요, <span className="text-blue-300">{student.name}</span> 학생! 👋
          </h2>
          <p className="text-blue-100 text-sm md:text-base leading-relaxed">
            신체-신경인지 생체 데이터와 연동된 지능형 성적 관리 시스템입니다. 시험별 성적 추이를 점검하고 목표 달성을 위한 맞춤형 AI 플랜을 수립해보세요.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={onOpenInputModal}
              className="bg-white text-blue-950 font-bold px-5 py-2.5 rounded-2xl text-sm shadow-md hover:bg-blue-50 transition-colors flex items-center space-x-2 cursor-pointer"
            >
              <span>+ 새 성적 입력</span>
              <span>→</span>
            </button>
            <button
              onClick={() => onNavigateTab("study_goals")}
              className="bg-blue-600/80 hover:bg-blue-600 text-white font-medium px-5 py-2.5 rounded-2xl text-sm border border-blue-400/30 transition-colors flex items-center space-x-2 cursor-pointer shadow-md"
            >
              <span>🤖</span>
              <span>AI 맞춤 학습 플랜</span>
            </button>
          </div>
        </div>
      </div>

      {/* 12대 Care Type Quick Status Banner */}
      {hasAssessment ? (
        <div
          onClick={() => setIsCareModalOpen(true)}
          className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
        >
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-3xl border border-blue-100 shrink-0 group-hover:scale-105 transition-transform">
              {currentCare.emoji}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                  진단 Care Type
                </span>
                <h3 className="font-bold text-slate-800 text-base">{currentCare.title}</h3>
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-2xl line-clamp-1 md:line-clamp-none">
                {currentCare.subtitle} · {currentCare.studyImpact}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 bg-blue-50/80 group-hover:bg-blue-600 group-hover:text-white px-4 py-2 rounded-xl transition-colors shrink-0">
            <span>12대 유형 가이드 전체보기</span>
            <span>→</span>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-slate-50 to-indigo-50/40 border border-indigo-100 rounded-3xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100/70 text-indigo-700 flex items-center justify-center text-2xl shrink-0">
              📋
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200">
                  진단 검사 대기
                </span>
                <h4 className="font-bold text-slate-800 text-sm">뇌-신체 정밀 진단 검사 대기 상태</h4>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                정밀 검사를 완료하시면 학생의 교감·부교감 자율신경 균형, 두뇌 각성도, 작업기억 용량 기반 12대 CareType 맞춤 학습 전략이 자동 연동됩니다.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCareModalOpen(true)}
            className="text-xs font-bold text-indigo-600 bg-white hover:bg-indigo-600 hover:text-white border border-indigo-200 px-4 py-2 rounded-xl transition-all shadow-sm shrink-0 whitespace-nowrap cursor-pointer"
          >
            12대 유형 안내 미리보기 →
          </button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl">
            🏆
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">전체 평균 등급</p>
            <p className="text-2xl font-black text-slate-800">{avgGrade}{avgGrade !== "—" && <span className="text-sm font-normal text-slate-500 ml-1">등급</span>}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl">
            📚
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">등록된 시험 기록</p>
            <p className="text-2xl font-black text-slate-800">{records.length}<span className="text-sm font-normal text-slate-500 ml-1">회차</span></p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-2xl">
            🎯
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">설정된 목표 과목</p>
            <p className="text-2xl font-black text-slate-800">{goals.length}<span className="text-sm font-normal text-slate-500 ml-1">개</span></p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center text-2xl">
            ✅
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">처방 이행률</p>
            <p className="text-2xl font-black text-slate-800">
              {adherence.prescribedCount > 0 ? `${adherence.rate}` : '—'}
              {adherence.prescribedCount > 0 && <span className="text-sm font-normal text-slate-500 ml-1">%</span>}
            </p>
            <p className="text-[11px] text-slate-400 font-medium">
              {adherence.prescribedCount > 0
                ? (adherence.level === 'excellent' ? '우수' : adherence.level === 'good' ? '양호' : adherence.level === 'fair' ? '보통' : '저조')
                : '처방 없음'}
            </p>
            <p className="text-[11px] text-indigo-500 font-bold mt-0.5" title={habitAdherence.label}>
              Habit 실천 {habitAdherence.completedCount}/{habitAdherence.totalCount}
            </p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <StudyDashboardCharts trendData={trendData} subjectBarData={subjectBarData} COLORS={COLORS} />

      {/* 12 CareType 맞춤 6단계 AI 사다리 훈련 바로가기 카드 (국·수·영 전 과목 융합) */}
      <LadderTrainingCard
        records={records}
        currentCare={currentCare}
        ladderSubjectFilter={ladderSubjectFilter}
        setLadderSubjectFilter={setLadderSubjectFilter}
        onNavigateTab={onNavigateTab}
        onOpenInputModal={onOpenInputModal}
        onOpenLadderModal={onOpenLadderModal}
      />

      {/* Care Type Details Modal */}
      <CareTypeModal
        isOpen={isCareModalOpen}
        onClose={() => setIsCareModalOpen(false)}
        currentCode={careTypeCode}
      />
    </div>
  );
};
