import React, { useState, useEffect } from 'react';
import { 
  StudentInfo, 
  GradeRecord, 
  RoadmapDuration, 
  StudentRoadmap, 
  RoadmapPhase, 
  RoadmapMilestone 
} from '../../types';
import { getCareTypeDetail } from '../../data/careTypesData';
import {
  generateAdaptiveRoadmap,
  getStudentRoadmap,
  saveStudentRoadmap,
  calculateRoadmapProgress,
  buildRoadmapSnapshot,
  isRoadmapSnapshotStale,
  mergeRoadmapProgress
} from '../../services/neuroRoadmapEngine';
import { normalizeCareTypeCode } from '../../data/careTypesData';

interface NeuroRoadmapStudioProps {
  student: StudentInfo;
  careTypeCode?: string;
  carePrimaryScore?: number; // CareType 주분류 점수 (neuro 강도 조절용, 미전달 시 기본)
  focusSubjectIds?: string[]; // 집중 취약 과목 (시간 가중용, 미전달 시 기본)
  hasAssessment?: boolean;
  records: GradeRecord[];
  latestGrades: Map<string, number>;
  onOpenLadderModal?: (subjectName: string, unitName: string, weakPriority: number) => void;
}

export const NeuroRoadmapStudio: React.FC<NeuroRoadmapStudioProps> = ({
  student,
  careTypeCode = 'HEALTHY',
  carePrimaryScore,
  focusSubjectIds = [],
  hasAssessment = true,
  records,
  latestGrades,
  onOpenLadderModal
}) => {
  const [selectedDuration, setSelectedDuration] = useState<RoadmapDuration>('1year');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<'all' | 'korean' | 'math' | 'english' | 'neuro'>('all');
  const [roadmap, setRoadmap] = useState<StudentRoadmap | null>(null);

  // Milestone Add/Edit Modal State
  const [editingMilestone, setEditingMilestone] = useState<{
    phaseId: string;
    milestone?: RoadmapMilestone;
  } | null>(null);

  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formTrack, setFormTrack] = useState<'academic' | 'neuro'>('academic');
  const [formSubjectId, setFormSubjectId] = useState<'math' | 'korean' | 'english' | 'all'>('math');
  const [formUnit, setFormUnit] = useState('');
  const [formHours, setFormHours] = useState<number>(5);
  const [formDueDate, setFormDueDate] = useState('');

  const currentCare = getCareTypeDetail(careTypeCode);

  // 로드맵 불러오기 또는 AI 자동 생성 (입력 변화 시 완료상태 보존 병합 재생성)
  const gradesKey = `${latestGrades.get('korean') ?? '-'}/${latestGrades.get('math') ?? '-'}/${latestGrades.get('english') ?? '-'}`;
  useEffect(() => {
    loadRoadmap(selectedDuration);
  }, [student.id, selectedDuration, careTypeCode, carePrimaryScore, records.length, gradesKey]);

  const buildFresh = (duration: RoadmapDuration) =>
    generateAdaptiveRoadmap(student, duration, careTypeCode, records, latestGrades, {
      primaryScore: carePrimaryScore,
      focusSubjectIds
    });

  const loadRoadmap = (duration: RoadmapDuration) => {
    const existing = getStudentRoadmap(student.id, duration);
    const snapshot = buildRoadmapSnapshot(normalizeCareTypeCode(careTypeCode), carePrimaryScore, records, latestGrades);
    if (existing && existing.phases && existing.phases.length > 0) {
      if (isRoadmapSnapshotStale(existing.inputSnapshot, snapshot)) {
        // 입력(CareType·성적·기록)이 바뀌면 완료·커스텀을 보존한 채 내용만 갱신
        const merged = mergeRoadmapProgress(existing, { ...buildFresh(duration), inputSnapshot: snapshot });
        saveStudentRoadmap(merged);
        setRoadmap(merged);
      } else {
        setRoadmap(existing);
      }
    } else {
      // AI 자동 생성
      const initial = { ...buildFresh(duration), inputSnapshot: snapshot };
      saveStudentRoadmap(initial);
      setRoadmap(initial);
    }
  };

  // AI 자동 생성 리셋 (완료 체크·커스텀 마일스톤은 유지하고 내용만 최신화)
  const handleResetToAI = () => {
    if (confirm('학생의 최신 성적(국·수·영)과 CareType에 맞춘 AI 추천 듀얼트랙 로드맵으로 다시 생성하시겠습니까? (완료 체크와 직접 추가한 마일스톤은 유지됩니다)')) {
      const existing = getStudentRoadmap(student.id, selectedDuration);
      const snapshot = buildRoadmapSnapshot(normalizeCareTypeCode(careTypeCode), carePrimaryScore, records, latestGrades);
      const fresh = { ...buildFresh(selectedDuration), inputSnapshot: snapshot };
      const next = existing ? mergeRoadmapProgress(existing, fresh) : fresh;
      saveStudentRoadmap(next);
      setRoadmap(next);
    }
  };

  // 마일스톤 완료 여부 토글
  const handleToggleMilestone = (phaseId: string, milestoneId: string) => {
    if (!roadmap) return;

    const updatedPhases = roadmap.phases.map(phase => {
      if (phase.id === phaseId) {
        const updatedMilestones = phase.milestones.map(m => {
          if (m.id === milestoneId) {
            return { ...m, isCompleted: !m.isCompleted };
          }
          return m;
        });
        return { ...phase, milestones: updatedMilestones };
      }
      return phase;
    });

    const updatedRoadmap: StudentRoadmap = {
      ...roadmap,
      phases: updatedPhases,
      overallProgress: 0 // saveStudentRoadmap 내에서 자동 계산됨
    };

    saveStudentRoadmap(updatedRoadmap);
    setRoadmap({ ...updatedRoadmap, overallProgress: calculateRoadmapProgress(updatedRoadmap) });
  };

  // 마일스톤 삭제
  const handleDeleteMilestone = (phaseId: string, milestoneId: string) => {
    if (!roadmap) return;
    if (!confirm('이 마일스톤을 삭제하시겠습니까?')) return;

    const updatedPhases = roadmap.phases.map(phase => {
      if (phase.id === phaseId) {
        return {
          ...phase,
          milestones: phase.milestones.filter(m => m.id !== milestoneId)
        };
      }
      return phase;
    });

    const updatedRoadmap: StudentRoadmap = {
      ...roadmap,
      phases: updatedPhases
    };

    saveStudentRoadmap(updatedRoadmap);
    setRoadmap({ ...updatedRoadmap, overallProgress: calculateRoadmapProgress(updatedRoadmap) });
  };

  // 마일스톤 추가 모달 오픈
  const handleOpenAddModal = (phaseId: string) => {
    setEditingMilestone({ phaseId });
    setFormTitle('');
    setFormDesc('');
    setFormTrack('academic');
    setFormSubjectId('math');
    setFormUnit('');
    setFormHours(5);
    setFormDueDate('');
  };

  // 마일스톤 수정 모달 오픈
  const handleOpenEditModal = (phaseId: string, milestone: RoadmapMilestone) => {
    setEditingMilestone({ phaseId, milestone });
    setFormTitle(milestone.title);
    setFormDesc(milestone.description);
    setFormTrack(milestone.track);
    const sub = milestone.subjectId || (milestone.title.includes('[국어]') ? 'korean' : milestone.title.includes('[영어]') ? 'english' : 'math');
    setFormSubjectId(sub as any);
    setFormUnit(milestone.targetUnit || '');
    setFormHours(milestone.targetHoursPerWeek || 5);
    setFormDueDate(milestone.dueDate || '');
  };

  // 마일스톤 폼 저장
  const handleSaveMilestoneForm = () => {
    if (!roadmap || !editingMilestone) return;
    if (!formTitle.trim()) {
      alert('마일스톤 제목을 입력해주세요.');
      return;
    }

    const { phaseId, milestone } = editingMilestone;

    const updatedPhases = roadmap.phases.map(phase => {
      if (phase.id === phaseId) {
        let updatedMilestones: RoadmapMilestone[];

        if (milestone) {
          // 수정
          updatedMilestones = phase.milestones.map(m => {
            if (m.id === milestone.id) {
              return {
                ...m,
                title: formTitle.trim(),
                description: formDesc.trim(),
                track: formTrack,
                subjectId: formTrack === 'neuro' ? 'all' : formSubjectId,
                targetUnit: formUnit.trim() || undefined,
                targetHoursPerWeek: formHours,
                dueDate: formDueDate.trim() || undefined
              };
            }
            return m;
          });
        } else {
          // 신규 추가
          const newM: RoadmapMilestone = {
            id: `custom_m_${Date.now()}`,
            phaseId,
            title: formTitle.trim(),
            description: formDesc.trim(),
            track: formTrack,
            subjectId: formTrack === 'neuro' ? 'all' : formSubjectId,
            targetUnit: formUnit.trim() || undefined,
            targetHoursPerWeek: formHours,
            dueDate: formDueDate.trim() || undefined,
            isCompleted: false,
            isCustom: true
          };
          updatedMilestones = [...phase.milestones, newM];
        }

        return { ...phase, milestones: updatedMilestones };
      }
      return phase;
    });

    const updatedRoadmap: StudentRoadmap = {
      ...roadmap,
      phases: updatedPhases
    };

    saveStudentRoadmap(updatedRoadmap);
    setRoadmap({ ...updatedRoadmap, overallProgress: calculateRoadmapProgress(updatedRoadmap) });
    setEditingMilestone(null);
  };

  // 인쇄 기능
  const handlePrint = () => {
    window.print();
  };

  if (!roadmap) {
    return (
      <div className="bg-white p-12 rounded-3xl text-center text-slate-400">
        로드맵 데이터를 생성하는 중입니다...
      </div>
    );
  }

  const overallProgress = roadmap.overallProgress || 0;
  const totalMilestones = roadmap.phases.reduce((acc, p) => acc + p.milestones.length, 0);
  const completedMilestones = roadmap.phases.reduce((acc, p) => acc + p.milestones.filter(m => m.isCompleted).length, 0);

  // 과목별 마일스톤 개수 집계
  const korMilestonesCount = roadmap.phases.reduce((acc, p) => acc + p.milestones.filter(m => m.subjectId === 'korean' || m.title.includes('[국어]')).length, 0);
  const mathMilestonesCount = roadmap.phases.reduce((acc, p) => acc + p.milestones.filter(m => m.subjectId === 'math' || m.title.includes('[수학]')).length, 0);
  const engMilestonesCount = roadmap.phases.reduce((acc, p) => acc + p.milestones.filter(m => m.subjectId === 'english' || m.title.includes('[영어]')).length, 0);
  const neuroMilestonesCount = roadmap.phases.reduce((acc, p) => acc + p.milestones.filter(m => m.track === 'neuro').length, 0);

  // 학생 최신 등급
  const korGrade = latestGrades.get('korean') || 3;
  const mathGrade = latestGrades.get('math') || 3;
  const engGrade = latestGrades.get('english') || 2;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Studio Top Action Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-800">
              수능 국·수·영 듀얼트랙 로드맵 스튜디오
            </h2>
            <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
              {hasAssessment ? `${currentCare.title} 연계` : '기본 로드맵'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            수능 1년·2년·3년 준비 기간과 학생의 국어·수학·영어 성적 및 신경인지 상태(CareType)에 맞춘 듀얼트랙 플랜이며, 자유롭게 편집·수정할 수 있습니다.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            onClick={handleResetToAI}
            className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="현재 등급과 CareType으로 국·수·영 듀얼트랙 로드맵을 다시 생성합니다"
          >
            <span>🚀</span>
            <span>AI 추천 로드맵 재생성</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>🖨️</span>
            <span>로드맵 인쇄</span>
          </button>
        </div>
      </div>

      {/* Duration Selection Tabs (1년 / 2년 / 3년) */}
      <div className="flex items-center gap-3 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 w-full sm:w-fit">
        <button
          onClick={() => setSelectedDuration('1year')}
          className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
            selectedDuration === '1year'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <span>🔥</span>
          <span>수능 1년 준비 (고3 / N수생)</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/15">4대 분기</span>
        </button>

        <button
          onClick={() => setSelectedDuration('2year')}
          className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
            selectedDuration === '2year'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <span>🌿</span>
          <span>수능 2년 준비 (고2 중장기)</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/15">8대 분기</span>
        </button>

        <button
          onClick={() => setSelectedDuration('3year')}
          className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
            selectedDuration === '3year'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <span>🌱</span>
          <span>수능 3년 준비 (고1 마스터 플랜)</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/15">12대 분기</span>
        </button>
      </div>

      {/* Progress & Multi-Subject Overview Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden border border-white/20">
        <div className="relative z-10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{currentCare.emoji}</span>
                <span className="text-lg font-black text-white">
                  {student.name} 학생의 {selectedDuration === '1year' ? '1년 완성' : selectedDuration === '2year' ? '2년 완성' : '3년 완성'} 로드맵
                </span>
                <span className="text-xs bg-blue-500/30 text-blue-200 px-2.5 py-0.5 rounded-full border border-blue-400/30">
                  목표: {roadmap.targetExamYear}학년도 대입 수능
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-1">
                신경인지 진단: <b className="text-white">{hasAssessment ? currentCare.title : '미실시'}</b> · 
                전 과목 권고: <b>국어 1교시 멘탈</b> + <b>수학 2교시 계산실수 방지</b> + <b>영어 3교시 식곤증 격파</b>
              </p>
            </div>

            <div className="text-right sm:self-center">
              <span className="text-xs text-blue-200 font-bold block">전체 마일스톤 달성률</span>
              <span className="text-3xl font-black text-emerald-400">{overallProgress}%</span>
              <span className="text-xs text-slate-300 block font-normal">({completedMilestones} / {totalMilestones}개 완수)</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden p-0.5 border border-white/20">
            <div 
              className="bg-gradient-to-r from-rose-400 via-teal-400 to-blue-400 h-full rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${overallProgress}%` }}
            />
          </div>

          {/* Subject Badges Summary Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 pt-2">
            <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-center gap-2.5">
              <span className="text-lg">📖</span>
              <div className="text-xs">
                <div className="font-bold text-rose-300">국어 ({korGrade}등급)</div>
                <div className="text-[11px] text-slate-300">마일스톤 {korMilestonesCount}개</div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-500/30 flex items-center gap-2.5">
              <span className="text-lg">📐</span>
              <div className="text-xs">
                <div className="font-bold text-blue-300">수학 ({mathGrade}등급)</div>
                <div className="text-[11px] text-slate-300">마일스톤 {mathMilestonesCount}개</div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 flex items-center gap-2.5">
              <span className="text-lg">🔤</span>
              <div className="text-xs">
                <div className="font-bold text-amber-300">영어 ({engGrade}등급)</div>
                <div className="text-[11px] text-slate-300">마일스톤 {engMilestonesCount}개</div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-2.5">
              <span className="text-lg">🧠</span>
              <div className="text-xs">
                <div className="font-bold text-emerald-300">{hasAssessment ? currentCare.title : '기본 케어'}</div>
                <div className="text-[11px] text-slate-300">케어 트랙 {neuroMilestonesCount}개</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subject Filter Toolbar */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2 overflow-x-auto">
        <span className="text-xs font-bold text-slate-500 px-3 shrink-0">과목별 필터:</span>
        <button
          onClick={() => setSelectedSubjectFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
            selectedSubjectFilter === 'all'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>🌟</span>
          <span>전 과목 밸런스</span>
          <span className="px-1.5 py-0.2 rounded-md bg-white/20 text-[10px]">{totalMilestones}</span>
        </button>
        <button
          onClick={() => setSelectedSubjectFilter('korean')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
            selectedSubjectFilter === 'korean'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-rose-700 hover:bg-rose-50'
          }`}
        >
          <span>📖</span>
          <span>국어</span>
          <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${selectedSubjectFilter === 'korean' ? 'bg-white/20' : 'bg-rose-100'}`}>{korMilestonesCount}</span>
        </button>
        <button
          onClick={() => setSelectedSubjectFilter('math')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
            selectedSubjectFilter === 'math'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-blue-700 hover:bg-blue-50'
          }`}
        >
          <span>📐</span>
          <span>수학</span>
          <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${selectedSubjectFilter === 'math' ? 'bg-white/20' : 'bg-blue-100'}`}>{mathMilestonesCount}</span>
        </button>
        <button
          onClick={() => setSelectedSubjectFilter('english')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
            selectedSubjectFilter === 'english'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-amber-700 hover:bg-amber-50'
          }`}
        >
          <span>🔤</span>
          <span>영어</span>
          <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${selectedSubjectFilter === 'english' ? 'bg-white/20' : 'bg-amber-100'}`}>{engMilestonesCount}</span>
        </button>
        <button
          onClick={() => setSelectedSubjectFilter('neuro')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
            selectedSubjectFilter === 'neuro'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-emerald-700 hover:bg-emerald-50'
          }`}
        >
          <span>🧠</span>
          <span>두뇌 신경 케어</span>
          <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${selectedSubjectFilter === 'neuro' ? 'bg-white/20' : 'bg-emerald-100'}`}>{neuroMilestonesCount}</span>
        </button>
      </div>

      {/* Timeline Phases Grid */}
      <div className="space-y-6">
        {roadmap.phases.map((phase) => {
          const phaseTotal = phase.milestones.length;
          const phaseCompleted = phase.milestones.filter(m => m.isCompleted).length;
          const phasePct = phaseTotal > 0 ? Math.round((phaseCompleted / phaseTotal) * 100) : 0;

          // 과목 필터 적용
          const displayMilestones = phase.milestones.filter(m => {
            if (selectedSubjectFilter === 'all') return true;
            if (selectedSubjectFilter === 'neuro') return m.track === 'neuro';
            if (selectedSubjectFilter === 'korean') return m.subjectId === 'korean' || m.title.includes('[국어]');
            if (selectedSubjectFilter === 'math') return m.subjectId === 'math' || m.title.includes('[수학]');
            if (selectedSubjectFilter === 'english') return m.subjectId === 'english' || m.title.includes('[영어]');
            return true;
          });

          return (
            <div 
              key={phase.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:border-blue-300"
            >
              {/* Phase Header */}
              <div className="p-5 bg-slate-50/80 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-0.5 rounded-md bg-blue-600 text-white font-black text-xs">
                      {phase.phaseNumber}분기
                    </span>
                    <h3 className="font-bold text-slate-800 text-base">{phase.title}</h3>
                    <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                      {phase.targetDDay}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <span>🗓️ {phase.periodLabel}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 font-bold block">분기 진행률</span>
                    <span className="text-sm font-black text-blue-600">{phasePct}%</span>
                  </div>
                  <button
                    onClick={() => handleOpenAddModal(phase.id)}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                  >
                    <span>+ 마일스톤 추가</span>
                  </button>
                </div>
              </div>

              {/* Goals Summary Bar */}
              <div className="px-6 py-3 bg-gradient-to-r from-blue-50/60 to-emerald-50/60 border-b border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 text-blue-900">
                  <span className="font-bold shrink-0">📚 교과 목표:</span>
                  <span className="text-slate-700 truncate">{phase.academicGoal}</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-900">
                  <span className="font-bold shrink-0">🧠 두뇌 케어:</span>
                  <span className="text-slate-700 truncate">{phase.neuroCareGoal}</span>
                </div>
              </div>

              {/* Milestones List */}
              <div className="p-5 space-y-3">
                {displayMilestones.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    선택하신 과목 필터에 해당하는 마일스톤이 없습니다.
                  </div>
                ) : (
                  displayMilestones.map((milestone) => {
                    const isKor = milestone.subjectId === 'korean' || milestone.title.includes('[국어]');
                    const isEng = milestone.subjectId === 'english' || milestone.title.includes('[영어]');
                    const isMath = milestone.subjectId === 'math' || milestone.title.includes('[수학]');
                    const isNeuro = milestone.track === 'neuro';
                    const targetSubName = isKor ? '국어' : isEng ? '영어' : '수학';

                    return (
                      <div 
                        key={milestone.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          milestone.isCompleted 
                            ? 'bg-slate-50/80 border-slate-200 opacity-70' 
                            : isNeuro
                            ? 'bg-white border-emerald-100 hover:border-emerald-300 shadow-2xs'
                            : isKor
                            ? 'bg-white border-rose-100 hover:border-rose-300 shadow-2xs'
                            : isEng
                            ? 'bg-white border-amber-100 hover:border-amber-300 shadow-2xs'
                            : 'bg-white border-blue-100 hover:border-blue-300 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-start gap-3 flex-1">
                          {/* Completion Checkbox */}
                          <button
                            type="button"
                            onClick={() => handleToggleMilestone(phase.id, milestone.id)}
                            className={`w-6 h-6 rounded-lg border flex items-center justify-center text-xs font-black transition-all cursor-pointer shrink-0 mt-0.5 ${
                              milestone.isCompleted
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : 'bg-white border-slate-300 text-transparent hover:border-emerald-500'
                            }`}
                            title="완료 여부 체크"
                          >
                            ✓
                          </button>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              {/* Subject / Track Badge */}
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                                isNeuro
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : isKor
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : isEng
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-blue-50 text-blue-700 border border-blue-200'
                              }`}>
                                {isNeuro ? '🧠 두뇌 신경 케어' : isKor ? '📖 국어 학업' : isEng ? '🔤 영어 학업' : '📐 수학 학업'}
                              </span>

                              <h4 className={`text-sm font-bold text-slate-800 ${milestone.isCompleted ? 'line-through text-slate-400' : ''}`}>
                                {milestone.title}
                              </h4>

                              {/* Unit Tag for Ladder Link */}
                              {milestone.targetUnit && (
                                <button
                                  type="button"
                                  onClick={() => onOpenLadderModal?.(targetSubName, milestone.targetUnit!, 1)}
                                  className="px-2 py-0.5 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-bold cursor-pointer transition-transform hover:scale-105 flex items-center gap-1 shadow-2xs"
                                  title={`${targetSubName} '${milestone.targetUnit}' 6단계 AI 사다리 훈련 바로가기`}
                                >
                                  <span>⚡ {milestone.targetUnit}</span>
                                  <span className="text-[10px] text-amber-600">훈련➔</span>
                                </button>
                              )}
                            </div>

                            <p className={`text-xs text-slate-600 leading-relaxed ${milestone.isCompleted ? 'line-through text-slate-400' : ''}`}>
                              {milestone.description}
                            </p>

                            <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                              {milestone.targetHoursPerWeek && (
                                <span>⏱️ 권장 주당 {milestone.targetHoursPerWeek}시간</span>
                              )}
                              {milestone.dueDate && (
                                <span>🎯 기한: {milestone.dueDate}</span>
                              )}
                              {milestone.isCustom && (
                                <span className="text-purple-600 font-bold">✨ 사용자 커스텀</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Milestone Actions (Edit, Delete) */}
                        <div className="flex items-center gap-1 self-end sm:self-center shrink-0">
                          <button
                            onClick={() => handleOpenEditModal(phase.id, milestone)}
                            className="px-2.5 py-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          >
                            수정
                          </button>
                          <button
                            onClick={() => handleDeleteMilestone(phase.id, milestone.id)}
                            className="px-2.5 py-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Milestone Add/Edit Modal */}
      {editingMilestone && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-800">
                {editingMilestone.milestone ? '마일스톤 수정' : '새 마일스톤 추가'}
              </h3>
              <button
                onClick={() => setEditingMilestone(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Track & Subject Selection */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">트랙 및 과목 구분</label>
                <div className="grid grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    onClick={() => { setFormTrack('academic'); setFormSubjectId('korean'); }}
                    className={`py-2 px-1 rounded-xl font-bold text-xs border transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                      formTrack === 'academic' && formSubjectId === 'korean'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span>📖</span>
                    <span>국어</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setFormTrack('academic'); setFormSubjectId('math'); }}
                    className={`py-2 px-1 rounded-xl font-bold text-xs border transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                      formTrack === 'academic' && formSubjectId === 'math'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span>📐</span>
                    <span>수학</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setFormTrack('academic'); setFormSubjectId('english'); }}
                    className={`py-2 px-1 rounded-xl font-bold text-xs border transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                      formTrack === 'academic' && formSubjectId === 'english'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span>🔤</span>
                    <span>영어</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setFormTrack('neuro'); setFormSubjectId('all'); }}
                    className={`py-2 px-1 rounded-xl font-bold text-xs border transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                      formTrack === 'neuro'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span>🧠</span>
                    <span>두뇌케어</span>
                  </button>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">마일스톤 제목 *</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="예: [수학] 수열 기출 3회독 & D단계 마스터"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">상세 설명</label>
                <textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="달성할 세부 학습 목표나 신경 루틴을 적어주세요."
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
              </div>

              {/* Target Unit & Hours Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">연계 교과 단원 (선택)</label>
                  <input
                    type="text"
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    placeholder="예: 등차수열과 등비수열"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">주당 목표 시간</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formHours}
                    onChange={(e) => setFormHours(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Due Date */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">목표 기한 (선택)</label>
                <input
                  type="text"
                  value={formDueDate}
                  onChange={(e) => setFormDueDate(e.target.value)}
                  placeholder="예: 6월 모의평가 전까지 또는 2027-05-30"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingMilestone(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleSaveMilestoneForm}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black shadow-md transition-colors cursor-pointer"
              >
                저장하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
