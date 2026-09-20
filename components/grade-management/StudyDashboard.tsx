import React, { useState } from "react";
import { StudentInfo, GradeRecord, GradeGoal, AssessmentResult } from "../../types";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import { getCareTypeDetail } from "../../data/careTypesData";
import { CareTypeModal } from "./CareTypeModal";

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
  const hasAssessment = !!latestAssessment?.careType && (latestAssessment.careType as any) !== 'Unassessed' && (latestAssessment.careType as any) !== '알 수 없음';
  const careTypeCode = (hasAssessment ? latestAssessment?.careType : "HEALTHY")?.toString() || "HEALTHY";
  const currentCare = getCareTypeDetail(careTypeCode);

  // 성적 데이터 집계
  const allSubjects = records.flatMap((r) => r.subjects);
  const totalEntries = allSubjects.length;
  const avgGrade =
    totalEntries > 0
      ? (allSubjects.reduce((acc, s) => acc + (s.grade || 5), 0) / totalEntries).toFixed(1)
      : "0.0";

  // 시험별 추이 데이터 (날짜순 정렬)
  const sortedRecords = [...records].sort(
    (a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime()
  );

  const trendData = sortedRecords.map((r) => {
    const validSubs = r.subjects.filter((s) => s.grade !== undefined);
    const avg =
      validSubs.length > 0
        ? parseFloat((validSubs.reduce((acc, s) => acc + (s.grade || 0), 0) / validSubs.length).toFixed(1))
        : 0;
    return {
      examName: r.examName,
      averageGrade: avg,
      examDate: r.examDate,
    };
  });

  // 과목별 최근 성적 집계
  const subjectLatestMap: { [subId: string]: number } = {};
  [...records]
    .sort((a, b) => new Date(b.examDate).getTime() - new Date(a.examDate).getTime())
    .forEach((r) => {
      r.subjects.forEach((s) => {
        if (s.grade !== undefined && subjectLatestMap[s.subjectId] === undefined) {
          subjectLatestMap[s.subjectId] = s.grade;
        }
      });
    });

  const subjectBarData = Object.keys(subjectLatestMap).map((subId) => {
    const nameMap: { [key: string]: string } = {
      korean: "국어",
      math: "수학",
      english: "영어",
      history: "한국사",
      physics1: "물리I",
      chemistry1: "화학I",
      biology1: "생명I",
      earth1: "지구I",
      social_culture: "사문",
      life_ethics: "생윤",
    };
    return {
      subject: nameMap[subId] || subId,
      grade: subjectLatestMap[subId],
    };
  });

  const COLORS = ["#2563eb", "#06b6d4", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"];

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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl">
            🏆
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">전체 평균 등급</p>
            <p className="text-2xl font-black text-slate-800">{avgGrade}<span className="text-sm font-normal text-slate-500 ml-1">등급</span></p>
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
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Line Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg">📈</span>
              <h3 className="font-bold text-slate-800 text-base">시험별 평균 등급 추이</h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">낮을수록 우수 (1등급 목표)</span>
          </div>

          <div className="h-64 w-full">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="examName" stroke="#94a3b8" fontSize={11} />
                  <YAxis reversed domain={[1, 9]} stroke="#94a3b8" fontSize={11} ticks={[1, 3, 5, 7, 9]} />
                  <Tooltip
                    contentStyle={{ borderRadius: "1rem", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                    formatter={(val: any) => [`${val}등급`, "평균 등급"]}
                  />
                  <Line type="monotone" dataKey="averageGrade" stroke="#2563eb" strokeWidth={3} dot={{ r: 5, fill: "#2563eb" }} activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                성적 데이터가 입력되면 추이 그래프가 표시됩니다.
              </div>
            )}
          </div>
        </div>

        {/* Subject Breakdown Bar Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg">📊</span>
              <h3 className="font-bold text-slate-800 text-base">최근 과목별 등급 현황</h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">최신 시험 기준</span>
          </div>

          <div className="h-64 w-full">
            {subjectBarData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="subject" stroke="#94a3b8" fontSize={11} />
                  <YAxis reversed domain={[1, 9]} stroke="#94a3b8" fontSize={11} ticks={[1, 3, 5, 7, 9]} />
                  <Tooltip
                    contentStyle={{ borderRadius: "1rem", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                    formatter={(val: any) => [`${val}등급`, "등급"]}
                  />
                  <Bar dataKey="grade" radius={[8, 8, 0, 0]}>
                    {subjectBarData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                과목별 성적 데이터가 없습니다.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 12 CareType 맞춤 6단계 AI 사다리 훈련 바로가기 카드 (국·수·영 전 과목 융합) */}
      {(() => {
        // 모든 시험에서 등록된 취약단원을 과목별로 분리 추출
        const koreanCollected: { subjectName: string; unitName: string; priority: number }[] = [];
        const mathCollected: { subjectName: string; unitName: string; priority: number }[] = [];
        const englishCollected: { subjectName: string; unitName: string; priority: number }[] = [];

        records.forEach((r) => {
          r.subjects.forEach((s) => {
            const subId = (s.subjectId || '').toLowerCase();
            if (s.weakUnits && s.weakUnits.length > 0) {
              s.weakUnits.forEach((u, uIdx) => {
                if (subId.includes('kor') || subId.includes('국어') || u.includes('독서') || u.includes('문학') || u.includes('문법') || u.includes('화작') || u.includes('언매')) {
                  if (!koreanCollected.some((c) => c.unitName === u)) {
                    koreanCollected.push({ subjectName: '국어', unitName: u, priority: uIdx + 1 });
                  }
                } else if (subId.includes('eng') || subId.includes('영어') || u.includes('빈칸') || u.includes('순서') || u.includes('어법') || u.includes('삽입') || u.includes('대의')) {
                  if (!englishCollected.some((c) => c.unitName === u)) {
                    englishCollected.push({ subjectName: '영어', unitName: u, priority: uIdx + 1 });
                  }
                } else {
                  if (!mathCollected.some((c) => c.unitName === u)) {
                    mathCollected.push({ subjectName: '수학', unitName: u, priority: uIdx + 1 });
                  }
                }
              });
            }
          });
        });

        // 학년별 또는 기본 추천 단원 (국·수·영 완비)
        const defaultKoreanUnits = [
          { subjectName: '국어', unitName: '[독서] 과학·기술 복합 지문 인과/비례 추론', priority: 1 },
          { subjectName: '국어', unitName: '[문학] 고전시가 고어 어휘 & 갈래 복합 독해', priority: 2 },
          { subjectName: '국어', unitName: '[언어와매체] 수능 실전 문법 5문항 체계', priority: 3 },
        ];

        const defaultMathUnits = [
          { subjectName: '수학', unitName: '[수학I] 등차수열과 등비수열의 일반항 & 합', priority: 1 },
          { subjectName: '수학', unitName: '[수학II] 도함수의 활용 (접선·극값)', priority: 2 },
          { subjectName: '수학', unitName: '[미적분/수II] 부정적분과 정적분의 계산', priority: 3 },
        ];

        const defaultEnglishUnits = [
          { subjectName: '영어', unitName: '[수능 킬러] 빈칸추론 31~34번', priority: 1 },
          { subjectName: '영어', unitName: '[수능 킬러] 글의 순서 배열 & 문장 삽입', priority: 2 },
          { subjectName: '영어', unitName: '[어법·어휘] 29번 어법 & 30번 밑줄 어휘', priority: 3 },
        ];

        const korList = koreanCollected.length > 0 ? koreanCollected : defaultKoreanUnits;
        const mathList = mathCollected.length > 0 ? mathCollected : defaultMathUnits;
        const engList = englishCollected.length > 0 ? englishCollected : defaultEnglishUnits;

        // 선택된 탭에 따라 표시할 카드 결정
        let displayWeakUnits: { subjectName: string; unitName: string; priority: number; badgeColor: 'rose' | 'blue' | 'amber'; subjectIcon: string }[] = [];

        if (ladderSubjectFilter === 'all') {
          // 국·수·영 밸런스: 각 과목의 1순위 대표 단원 1개씩 3개 나란히 표시!
          displayWeakUnits = [
            { ...korList[0], priority: 1, badgeColor: 'rose', subjectIcon: '📖' },
            { ...mathList[0], priority: 1, badgeColor: 'blue', subjectIcon: '📐' },
            { ...engList[0], priority: 1, badgeColor: 'amber', subjectIcon: '🔤' },
          ];
        } else if (ladderSubjectFilter === 'korean') {
          displayWeakUnits = korList.slice(0, 3).map((item, idx) => ({
            ...item,
            priority: idx + 1,
            badgeColor: 'rose',
            subjectIcon: '📖',
          }));
        } else if (ladderSubjectFilter === 'math') {
          displayWeakUnits = mathList.slice(0, 3).map((item, idx) => ({
            ...item,
            priority: idx + 1,
            badgeColor: 'blue',
            subjectIcon: '📐',
          }));
        } else if (ladderSubjectFilter === 'english') {
          displayWeakUnits = engList.slice(0, 3).map((item, idx) => ({
            ...item,
            priority: idx + 1,
            badgeColor: 'amber',
            subjectIcon: '🔤',
          }));
        }

        return (
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-6 border border-blue-500/30 shadow-xl text-white space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">🪜</span>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-bold text-white">
                      12대 CareType 맞춤 <span className="text-blue-300">국·수·영 6단계 AI 문항 사다리 훈련</span>
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/30 text-blue-200 border border-blue-400/30">
                      {currentCare.title} 특화
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    긴장도 완화 두뇌 프라이밍 ➔ 필수 개념 3문항 메타점검 ➔ A부터 F까지 5문항 사다리 돌파
                  </p>
                </div>
              </div>

              {/* 과목 필터 탭 & 관리 버튼 */}
              <div className="flex items-center gap-2 flex-wrap self-start lg:self-auto">
                <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
                  <button
                    type="button"
                    onClick={() => setLadderSubjectFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      ladderSubjectFilter === 'all'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span>🌟</span>
                    <span>국·수·영 밸런스</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLadderSubjectFilter('korean')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      ladderSubjectFilter === 'korean'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span>📖</span>
                    <span>국어 TOP 3</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLadderSubjectFilter('math')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      ladderSubjectFilter === 'math'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span>📐</span>
                    <span>수학 TOP 3</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLadderSubjectFilter('english')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      ladderSubjectFilter === 'english'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span>🔤</span>
                    <span>영어 TOP 3</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigateTab('ladder_training')}
                  className="text-xs font-bold text-indigo-200 hover:text-white bg-indigo-500/20 hover:bg-indigo-500/40 px-3 py-2 rounded-xl border border-indigo-400/30 transition-all cursor-pointer shrink-0 flex items-center gap-1"
                  title="국·수·영 6단계 AI 사다리 훈련 센터로 이동"
                >
                  <span>전체 훈련 센터</span>
                  <span>➔</span>
                </button>

                <button
                  onClick={onOpenInputModal}
                  className="text-xs font-bold text-blue-300 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-2 rounded-xl border border-white/15 transition-all cursor-pointer shrink-0"
                >
                  + 취약단원 관리하기
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {displayWeakUnits.map((item, idx) => (
                <div
                  key={`${item.subjectName}_${item.unitName}_${idx}`}
                  className="bg-white/10 hover:bg-white/15 border border-white/10 hover:border-blue-400/50 rounded-2xl p-4 flex flex-col justify-between transition-all cursor-pointer group shadow-inner"
                  onClick={() => onOpenLadderModal?.(item.subjectName, item.unitName, item.priority)}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10.5px] font-black px-2 py-0.5 rounded-md ${
                        item.priority === 1 ? 'bg-rose-500/40 text-rose-200 border border-rose-400/40' :
                        item.priority === 2 ? 'bg-amber-500/40 text-amber-200 border border-amber-400/40' :
                        'bg-blue-500/40 text-blue-200 border border-blue-400/40'
                      }`}>
                        취약 {item.priority}순위
                      </span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                        item.badgeColor === 'rose' ? 'bg-rose-500/30 text-rose-200 border-rose-400/40' :
                        item.badgeColor === 'amber' ? 'bg-amber-500/30 text-amber-200 border-amber-400/40' :
                        'bg-blue-500/30 text-blue-200 border-blue-400/40'
                      }`}>
                        <span>{item.subjectIcon}</span>
                        <span>{item.subjectName}</span>
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-2 min-h-[40px]">
                      {item.unitName}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1">
                      A(기본 5문항) ➔ F(수능 킬러 5문항)
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-xs font-bold text-blue-300 group-hover:text-white">
                    <span>사다리 훈련 시작</span>
                    <span>⚡ ➔</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Care Type Details Modal */}
      <CareTypeModal
        isOpen={isCareModalOpen}
        onClose={() => setIsCareModalOpen(false)}
        currentCode={careTypeCode}
      />
    </div>
  );
};
