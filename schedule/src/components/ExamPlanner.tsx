import React, { useState } from 'react';
import { RoutineInput, CareType, ExamModeItem } from '../types';
import { DEFAULT_EXAM_MODES } from '../data/defaultSchedules';
import { ExamModeModal } from './ExamModeModal';
import {
  ShieldAlert,
  Calendar,
  CheckCircle2,
  Award,
  Clock,
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  Check,
  Zap,
  BookOpen,
  ArrowRight,
  Target,
  Brain
} from 'lucide-react';

interface ExamPlannerProps {
  routine: RoutineInput;
  careType: CareType;
  onUpdateRoutine: (newRoutine: RoutineInput) => void;
  onNavigateToSchedule?: () => void;
}

export const ExamPlanner: React.FC<ExamPlannerProps> = ({
  routine,
  careType,
  onUpdateRoutine,
  onNavigateToSchedule
}) => {
  const modesList: ExamModeItem[] = routine.examModesList || DEFAULT_EXAM_MODES;
  const currentModeId = routine.examMode || 'normal';

  const [selectedModeId, setSelectedModeId] = useState<string>(currentModeId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMode, setEditingMode] = useState<ExamModeItem | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const activeMode = modesList.find(m => m.id === selectedModeId) || modesList[0] || DEFAULT_EXAM_MODES[0];

  // Target date for D-Day calculation
  const targetDateStr = activeMode.examDate || (activeMode.id === currentModeId ? routine.examDate : '');
  const examTitle = activeMode.examName || activeMode.name;

  let diffDays: number | null = null;
  if (targetDateStr) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(targetDateStr);
    target.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  const handleSelectMode = (mode: ExamModeItem) => {
    setSelectedModeId(mode.id);
  };

  const handleApplyMode = (modeToApply: ExamModeItem) => {
    const updatedRoutine: RoutineInput = {
      ...routine,
      examMode: modeToApply.id,
      examName: modeToApply.examName || modeToApply.name,
      examDate: modeToApply.examDate || routine.examDate || '',
      examModesList: modesList
    };
    onUpdateRoutine(updatedRoutine);
    setFeedbackMsg(`'${modeToApply.name}'가 오늘의 시간표에 즉시 적용되었습니다!`);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleSaveModalMode = (newOrUpdatedMode: ExamModeItem) => {
    let updatedList: ExamModeItem[];
    const exists = modesList.some(m => m.id === newOrUpdatedMode.id);
    if (exists) {
      updatedList = modesList.map(m => m.id === newOrUpdatedMode.id ? newOrUpdatedMode : m);
    } else {
      updatedList = [...modesList, newOrUpdatedMode];
    }

    const updatedRoutine: RoutineInput = {
      ...routine,
      examMode: newOrUpdatedMode.id,
      examName: newOrUpdatedMode.examName || newOrUpdatedMode.name,
      examDate: newOrUpdatedMode.examDate || routine.examDate || '',
      examModesList: updatedList
    };

    onUpdateRoutine(updatedRoutine);
    setSelectedModeId(newOrUpdatedMode.id);
    setFeedbackMsg(`'${newOrUpdatedMode.name}' 시험 모드가 저장되고 적용되었습니다.`);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleDeleteMode = (modeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('이 시험 모드를 삭제하시겠습니까?')) {
      const filtered = modesList.filter(m => m.id !== modeId);
      const nextSelected = selectedModeId === modeId ? 'normal' : selectedModeId;
      const nextActiveMode = filtered.find(m => m.id === nextSelected) || filtered[0];

      const updatedRoutine: RoutineInput = {
        ...routine,
        examMode: nextSelected,
        examName: nextActiveMode?.examName || nextActiveMode?.name || '평상시 자습',
        examDate: nextActiveMode?.examDate || '',
        examModesList: filtered
      };

      onUpdateRoutine(updatedRoutine);
      setSelectedModeId(nextSelected);
      setFeedbackMsg('시험 모드가 삭제되었습니다.');
      setTimeout(() => setFeedbackMsg(null), 2500);
    }
  };

  const handleOpenEdit = (mode: ExamModeItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingMode(mode);
    setIsModalOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingMode(null);
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Feedback Toast */}
      {feedbackMsg && (
        <div className="fixed top-20 right-5 z-50 bg-stone-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-stone-700 flex items-center space-x-2 text-sm font-bold animate-in fade-in slide-in-from-top-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Top Banner with D-Day */}
      <div className="bg-gradient-to-r from-violet-900 via-indigo-900 to-stone-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-violet-200 text-xs font-bold mb-3 border border-white/10">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>특정 상황 자동 시험 공부 계획표</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
            <span>{activeMode.iconEmoji}</span>
            <span>{examTitle} D-Day 플래너</span>
          </h2>
          <p className="text-violet-200 text-xs sm:text-sm mt-1.5 max-w-2xl leading-relaxed">
            원하는 시험 모드를 자유롭게 추가하고 선택하세요. 압박 상황을 극복하기 위한 타임어택 훈련, 백지 복습, 오답 단권화 및 편도체 안정화 솔루션이 자동 연동됩니다.
          </p>
        </div>

        {/* D-Day Countdown Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/15 text-center shrink-0 min-w-[140px] shadow-lg">
          <div className="text-[11px] font-bold text-violet-200 uppercase tracking-wider">
            {activeMode.name} D-Day
          </div>
          <div className="text-3xl sm:text-4xl font-black text-amber-400 mt-1">
            {diffDays !== null ? (
              diffDays === 0 ? 'D-Day' : diffDays > 0 ? `D-${diffDays}` : `D+${Math.abs(diffDays)}`
            ) : (
              'D-Day 설정'
            )}
          </div>
          {targetDateStr && (
            <div className="text-[11px] text-violet-300 font-semibold mt-1">
              {targetDateStr}
            </div>
          )}
        </div>
      </div>

      {/* Mode Switcher & Management Card */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-stone-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-600" />
              <span>시험 모드 선택 및 자유 추가</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                총 {modesList.length}개 모드
              </span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              기본 2가지 외에도 중간고사, 수능 파이널, 자격증, 단원평가 등 원하는 시험 모드를 마음껏 추가할 수 있습니다.
            </p>
          </div>

          {/* Add New Custom Mode Button */}
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-sm transition flex items-center justify-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ 새 시험 모드 추가</span>
          </button>
        </div>

        {/* Grid of all exam modes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {modesList.map((mode) => {
            const isSelected = selectedModeId === mode.id;
            const isCurrentlyApplied = routine.examMode === mode.id;

            // Calculate item D-Day
            let modeDDay: string | null = null;
            if (mode.examDate) {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const target = new Date(mode.examDate);
              target.setHours(0, 0, 0, 0);
              const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
              modeDDay = diff === 0 ? 'D-Day' : diff > 0 ? `D-${diff}` : `D+${Math.abs(diff)}`;
            }

            return (
              <div
                key={mode.id}
                onClick={() => handleSelectMode(mode)}
                className={`p-4 rounded-2xl border text-left cursor-pointer transition-all duration-200 relative flex flex-col justify-between group ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/70 shadow-md ring-2 ring-indigo-400/40'
                    : 'border-stone-200 bg-white hover:bg-stone-50/80 hover:border-stone-300'
                }`}
              >
                <div>
                  {/* Top Badges & Actions */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-xl">{mode.iconEmoji}</span>
                      {mode.strategyBadge && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200">
                          {mode.strategyBadge}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-1">
                      {isCurrentlyApplied && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500 text-white shadow-2xs">
                          적용중
                        </span>
                      )}
                      {modeDDay && (
                        <span className="text-[11px] font-extrabold text-amber-700 bg-amber-100/90 px-2 py-0.5 rounded-md border border-amber-200">
                          {modeDDay}
                        </span>
                      )}

                      {/* Custom Mode Edit/Delete Buttons */}
                      {mode.isCustom && (
                        <div className="flex items-center space-x-0.5 ml-1 opacity-80 group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={(e) => handleOpenEdit(mode, e)}
                            title="수정"
                            className="p-1 text-stone-400 hover:text-indigo-600 rounded-md hover:bg-indigo-50 transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteMode(mode.id, e)}
                            title="삭제"
                            className="p-1 text-stone-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h4 className="font-extrabold text-stone-900 text-sm">{mode.name}</h4>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed line-clamp-2">
                    {mode.description}
                  </p>
                </div>

                {/* Bottom Quick Action */}
                <div className="pt-3 mt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-stone-400">
                    {mode.examDate ? `목표일: ${mode.examDate}` : '상시 루틴'}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApplyMode(mode);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 ${
                      isCurrentlyApplied
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-stone-100 hover:bg-indigo-600 hover:text-white text-stone-700'
                    }`}
                  >
                    {isCurrentlyApplied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>시간표 반영됨</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3 h-3 text-amber-500" />
                        <span>이 모드 적용</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Mode Detail Strategy & Action Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-2xl">
              {activeMode.iconEmoji}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-stone-900">{activeMode.name}</h3>
                {activeMode.strategyBadge && (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                    {activeMode.strategyBadge}
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 mt-0.5">{activeMode.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {activeMode.isCustom && (
              <button
                onClick={(e) => handleOpenEdit(activeMode, e)}
                className="px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-700 hover:bg-stone-50 transition flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>모드 수정</span>
              </button>
            )}
            <button
              onClick={() => handleApplyMode(activeMode)}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-sm transition flex items-center gap-1.5"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>시간표에 즉시 적용하기</span>
            </button>
          </div>
        </div>

        {/* Psychological & Neurological Care integration */}
        <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/80 border border-indigo-200 text-indigo-950 space-y-2">
          <div className="flex items-center space-x-2">
            <Brain className="w-4 h-4 text-indigo-600" />
            <span className="font-extrabold text-xs sm:text-sm">
              💡 {activeMode.name} 맞춤 두뇌 케어 솔루션 ({careType.title} 연계)
            </span>
          </div>
          <p className="text-xs sm:text-sm leading-relaxed text-indigo-900">
            {activeMode.solutionDetail ||
              `${activeMode.name} 기간 동안 압박감으로 인한 번아웃을 예방하고, 실전 타임어택 몰입과 뽀모도로 휴식(${careType.pomodoroWork}분 몰입 / ${careType.pomodoroBreak}분 휴식)을 균형 있게 실천하세요.`}
          </p>
        </div>

        {/* Steps Grid */}
        {activeMode.steps && activeMode.steps.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-extrabold text-sm text-stone-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-600" />
              <span>실행 집중 전략 가이드</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeMode.steps.map((step, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
                  <h5 className="font-bold text-stone-900 text-xs sm:text-sm flex items-center gap-2">
                    {step.iconType === 'clock' ? (
                      <Clock className="w-4 h-4 text-indigo-600" />
                    ) : step.iconType === 'check' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-purple-600" />
                    )}
                    <span>{step.title}</span>
                  </h5>
                  <p className="text-xs text-stone-600 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Final Apply Confirmation Box */}
        <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-stone-500">
            현재 선택된 모드: <span className="font-bold text-stone-800">{activeMode.name}</span> (
            {activeMode.examDate ? `목표일 ${activeMode.examDate}` : '상시 루틴'})
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleApplyMode(activeMode)}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-extrabold text-xs shadow-sm transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>이 모드로 시간표 적용</span>
            </button>
          </div>
        </div>
      </div>

      {/* Custom Exam Mode Modal */}
      <ExamModeModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingMode(null);
        }}
        onSave={handleSaveModalMode}
        editingMode={editingMode}
      />
    </div>
  );
};
