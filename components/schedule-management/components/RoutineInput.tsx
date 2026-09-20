import React, { useState } from 'react';
import { RoutineInput, DayKey, DayScheduleConfig, AcademyItem, VacationConfig, ExamModeItem } from '../types';
import { DAYS_METADATA, DEFAULT_DAY_CONFIGS, DEFAULT_VACATION_DAY_CONFIGS, DEFAULT_EXAM_MODES } from '../data/defaultSchedules';
import { ExamModeModal } from './ExamModeModal';
import { Clock, Plus, Trash2, BookOpen, School, Moon, Sparkles, Check, Palmtree, Calendar, Copy, ArrowRight, Sun, Award, Edit2, Zap, Target } from 'lucide-react';

interface RoutineInputProps {
  routine: RoutineInput;
  onSaveRoutine: (newRoutine: RoutineInput) => void;
  onGenerate: () => void;
}

export const RoutineInputView: React.FC<RoutineInputProps> = ({
  routine,
  onSaveRoutine,
  onGenerate
}) => {
  const [formData, setFormData] = useState<RoutineInput>(() => ({
    ...routine,
    dayConfigs: routine.dayConfigs || DEFAULT_DAY_CONFIGS,
    vacationDayConfigs: routine.vacationDayConfigs || DEFAULT_VACATION_DAY_CONFIGS,
    vacation: routine.vacation || {
      enabled: false,
      name: '여름방학 집중 기간',
      startDate: '2026-07-20',
      endDate: '2026-08-25'
    }
  }));

  // Selected Tab for editing: 'schedule_days' | 'vacation_settings' | 'subjects'
  const [activeSection, setActiveSection] = useState<'days' | 'vacation' | 'subjects'>('days');
  const [selectedDayKey, setSelectedDayKey] = useState<DayKey>(routine.activeDay || 'mon');
  const [isEditingVacationRoutine, setIsEditingVacationRoutine] = useState<boolean>(false);

  // Exam mode modal states
  const [isExamModalOpen, setIsExamModalOpen] = useState<boolean>(false);
  const [editingExamMode, setEditingExamMode] = useState<ExamModeItem | null>(null);

  // Temporary academy input state
  const [newAcademyName, setNewAcademyName] = useState('');
  const [newAcademyStart, setNewAcademyStart] = useState('17:30');
  const [newAcademyEnd, setNewAcademyEnd] = useState('19:30');

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const examModesList = formData.examModesList || DEFAULT_EXAM_MODES;

  const handleSaveExamModeFromModal = (newMode: ExamModeItem) => {
    let updatedList: ExamModeItem[];
    const exists = examModesList.some(m => m.id === newMode.id);
    if (exists) {
      updatedList = examModesList.map(m => m.id === newMode.id ? newMode : m);
    } else {
      updatedList = [...examModesList, newMode];
    }

    setFormData(prev => ({
      ...prev,
      examMode: newMode.id,
      examName: newMode.examName || newMode.name,
      examDate: newMode.examDate || prev.examDate || '',
      examModesList: updatedList
    }));
  };

  const handleDeleteExamMode = (modeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('이 시험 모드를 삭제하시겠습니까?')) {
      const filtered = examModesList.filter(m => m.id !== modeId);
      const nextSelected = formData.examMode === modeId ? 'normal' : formData.examMode;
      const nextActiveMode = filtered.find(m => m.id === nextSelected) || filtered[0];

      setFormData(prev => ({
        ...prev,
        examMode: nextSelected,
        examName: nextActiveMode?.examName || nextActiveMode?.name || '평상시 자습',
        examDate: nextActiveMode?.examDate || '',
        examModesList: filtered
      }));
    }
  };

  // Active current day config based on selection
  const currentConfigsMap = isEditingVacationRoutine ? formData.vacationDayConfigs : formData.dayConfigs;
  const currentConfig: DayScheduleConfig = currentConfigsMap[selectedDayKey] || DEFAULT_DAY_CONFIGS[selectedDayKey] || DEFAULT_DAY_CONFIGS.mon;
  const currentDayMeta = DAYS_METADATA.find(d => d.key === selectedDayKey) || DAYS_METADATA[0];

  const updateCurrentDayConfig = (partial: Partial<DayScheduleConfig>) => {
    if (isEditingVacationRoutine) {
      setFormData(prev => ({
        ...prev,
        vacationDayConfigs: {
          ...prev.vacationDayConfigs,
          [selectedDayKey]: {
            ...currentConfig,
            ...partial
          }
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        dayConfigs: {
          ...prev.dayConfigs,
          [selectedDayKey]: {
            ...currentConfig,
            ...partial
          }
        }
      }));
    }
  };

  const handleAddAcademyToDay = () => {
    if (!newAcademyName.trim()) return;
    const newItem: AcademyItem = {
      id: `acad-${selectedDayKey}-${Date.now()}`,
      name: newAcademyName.trim(),
      startTime: newAcademyStart,
      endTime: newAcademyEnd,
      days: [currentDayMeta.shortLabel]
    };
    updateCurrentDayConfig({
      academies: [...(currentConfig.academies || []), newItem]
    });
    setNewAcademyName('');
  };

  const handleRemoveAcademyFromDay = (id: string) => {
    updateCurrentDayConfig({
      academies: (currentConfig.academies || []).filter(a => a.id !== id)
    });
  };

  // Batch copy helpers
  const handleCopyMondayToWeekdays = () => {
    const sourceConfig = isEditingVacationRoutine ? formData.vacationDayConfigs.mon : formData.dayConfigs.mon;
    const weekdays: DayKey[] = ['tue', 'wed', 'thu', 'fri'];

    if (isEditingVacationRoutine) {
      const updated = { ...formData.vacationDayConfigs };
      weekdays.forEach(key => {
        updated[key] = {
          ...sourceConfig,
          dayKey: key,
          dayLabel: DAYS_METADATA.find(d => d.key === key)?.label || key
        };
      });
      setFormData(prev => ({ ...prev, vacationDayConfigs: updated }));
    } else {
      const updated = { ...formData.dayConfigs };
      weekdays.forEach(key => {
        updated[key] = {
          ...sourceConfig,
          dayKey: key,
          dayLabel: DAYS_METADATA.find(d => d.key === key)?.label || key
        };
      });
      setFormData(prev => ({ ...prev, dayConfigs: updated }));
    }

    setSuccessMessage('월요일 설정이 화·수·목·금 평일 전체에 일괄 복사되었습니다.');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleCopySaturdayToSunday = () => {
    const sourceConfig = isEditingVacationRoutine ? formData.vacationDayConfigs.sat : formData.dayConfigs.sat;
    const targetKey: DayKey = 'sun';

    if (isEditingVacationRoutine) {
      setFormData(prev => ({
        ...prev,
        vacationDayConfigs: {
          ...prev.vacationDayConfigs,
          sun: {
            ...sourceConfig,
            dayKey: targetKey,
            dayLabel: '일요일'
          }
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        dayConfigs: {
          ...prev.dayConfigs,
          sun: {
            ...sourceConfig,
            dayKey: targetKey,
            dayLabel: '일요일'
          }
        }
      }));
    }

    setSuccessMessage('토요일 설정이 일요일에 성공적으로 복사되었습니다.');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleSubjectPriorityChange = (id: string, priority: number) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.map(s => s.id === id ? { ...s, priority } : s)
    }));
  };

  const handleSubjectTargetHoursChange = (id: string, hours: number) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.map(s => s.id === id ? { ...s, weeklyTargetHours: hours } : s)
    }));
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSaveRoutine(formData);
    onGenerate();
    setSuccessMessage('모든 요일, 휴일, 방학 스케줄 및 과목 우선순위가 성공적으로 저장되었습니다!');
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-indigo-100 text-xs font-medium mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>요일별·공휴일·방학 기간 완벽 맞춤형 스케줄러</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              요일별/공휴일/방학 상세 일과 설정
            </h2>
            <p className="text-indigo-200 text-sm mt-1">
              월~일 요일별 등교 여부, 공휴일 자습 시간, 방학 기간 설정 및 과목 우선순위를 각각 다르게 맞춤 설정할 수 있습니다.
            </p>
          </div>
          <button
            onClick={() => handleSubmit()}
            className="px-6 py-3 bg-white text-indigo-900 font-bold rounded-xl shadow-md hover:bg-indigo-50 transition flex items-center space-x-2 shrink-0"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>시간표 최적화 반영하기</span>
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-2xl flex items-center space-x-2 shadow-xs animate-fadeIn">
          <Check className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-bold text-sm">{successMessage}</span>
        </div>
      )}

      {/* Main Section Tabs */}
      <div className="flex items-center space-x-2 bg-stone-200/80 p-1.5 rounded-2xl border border-stone-300/80">
        <button
          onClick={() => setActiveSection('days')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center space-x-2 ${
            activeSection === 'days'
              ? 'bg-white text-indigo-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Calendar className="w-4 h-4 text-indigo-600" />
          <span>1. 요일별 & 공휴일 일과 설정 (월~일·공휴일)</span>
        </button>

        <button
          onClick={() => setActiveSection('vacation')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center space-x-2 ${
            activeSection === 'vacation'
              ? 'bg-white text-amber-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Palmtree className="w-4 h-4 text-amber-600" />
          <span>2. 방학 기간 및 방학 전용 스케줄</span>
        </button>

        <button
          onClick={() => setActiveSection('subjects')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center space-x-2 ${
            activeSection === 'subjects'
              ? 'bg-white text-indigo-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <BookOpen className="w-4 h-4 text-indigo-600" />
          <span>3. 과목 우선순위 및 시험 모드</span>
        </button>
      </div>

      {/* SECTION 1: 요일별 & 공휴일 일과 설정 */}
      {activeSection === 'days' && (
        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-6">
          {/* Day Selector Buttons with Batch Tools */}
          <div className="space-y-3 pb-4 border-b border-stone-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-stone-900 text-base">편집할 요일 선택</span>
                <span className="text-xs text-stone-500">각 요일 및 공휴일의 일과를 독립적으로 설정합니다</span>
              </div>

              {/* Batch Actions */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyMondayToWeekdays}
                  className="text-xs font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl border border-indigo-200 transition flex items-center gap-1"
                  title="월요일의 일과를 화·수·목·금요일에 복사"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>월요일 ➔ 평일 일괄복사</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopySaturdayToSunday}
                  className="text-xs font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl border border-blue-200 transition flex items-center gap-1"
                  title="토요일의 일과를 일요일에 복사"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>토요일 ➔ 일요일 복사</span>
                </button>
              </div>
            </div>

            {/* Day of Week Selector */}
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {DAYS_METADATA.map(day => {
                const isSelected = selectedDayKey === day.key;
                return (
                  <button
                    key={day.key}
                    type="button"
                    onClick={() => {
                      setSelectedDayKey(day.key);
                      setIsEditingVacationRoutine(false);
                    }}
                    className={`py-2.5 px-2 rounded-2xl text-xs font-bold transition flex flex-col items-center justify-center gap-1 border ${
                      isSelected
                        ? day.key === 'holiday'
                          ? 'bg-rose-600 text-white border-rose-700 shadow-md ring-2 ring-rose-400/40'
                          : 'bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-400/40'
                        : day.key === 'holiday'
                        ? 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                        : day.type === 'weekend'
                        ? 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <span>{day.iconEmoji}</span>
                      <span className="font-extrabold text-sm">{day.shortLabel}</span>
                    </div>
                    <span className={`text-[10px] ${isSelected ? 'text-indigo-100' : 'text-stone-500'}`}>
                      {day.type === 'weekday' ? '평일' : day.type === 'weekend' ? '주말' : '휴일'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form for selected day */}
          <div className="space-y-6">
            {/* Header info of selected day */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{currentDayMeta.iconEmoji}</span>
                <div>
                  <h4 className="font-extrabold text-stone-900 text-base flex items-center gap-2">
                    <span>{currentDayMeta.label} 상세 설정</span>
                    {selectedDayKey === 'holiday' && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                        공휴일·대체휴일 전용
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {currentConfig.hasSchool ? '학교 등교가 있는 평일 스케줄입니다' : '학교 등교가 없는 자율 몰입 집중일입니다'}
                  </p>
                </div>
              </div>

              {/* School Toggle for this day */}
              <div className="flex items-center space-x-2 bg-white px-3.5 py-2 rounded-xl border border-stone-200 shadow-2xs">
                <School className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-stone-800">학교 등교 여부:</span>
                <button
                  type="button"
                  onClick={() => updateCurrentDayConfig({ hasSchool: !currentConfig.hasSchool })}
                  className={`px-3 py-1 rounded-lg text-xs font-extrabold transition ${
                    currentConfig.hasSchool
                      ? 'bg-indigo-600 text-white'
                      : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                  }`}
                >
                  {currentConfig.hasSchool ? '등교일 (ON)' : '비등교일 (OFF)'}
                </button>
              </div>
            </div>

            {/* Time Pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">🌅 기상 시간</label>
                <input
                  type="time"
                  value={currentConfig.wakeUpTime || '07:00'}
                  onChange={e => updateCurrentDayConfig({ wakeUpTime: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-sm font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">🌙 취침 시간</label>
                <input
                  type="time"
                  value={currentConfig.sleepTime || '23:30'}
                  onChange={e => updateCurrentDayConfig({ sleepTime: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-sm font-semibold"
                />
              </div>

              {currentConfig.hasSchool ? (
                <>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">🏫 학교 등교 시간</label>
                    <input
                      type="time"
                      value={currentConfig.schoolStartTime || '08:40'}
                      onChange={e => updateCurrentDayConfig({ schoolStartTime: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">🏫 학교 하교 시간</label>
                    <input
                      type="time"
                      value={currentConfig.schoolEndTime || '16:30'}
                      onChange={e => updateCurrentDayConfig({ schoolEndTime: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-sm font-semibold"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">📖 오전 집중 자습 시작</label>
                    <input
                      type="time"
                      value={currentConfig.morningStudyStartTime || '09:00'}
                      onChange={e => updateCurrentDayConfig({ morningStudyStartTime: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">📖 오전 집중 자습 종료</label>
                    <input
                      type="time"
                      value={currentConfig.morningStudyEndTime || '12:00'}
                      onChange={e => updateCurrentDayConfig({ morningStudyEndTime: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-sm font-semibold"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Afternoon / Self-study Times */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {!currentConfig.hasSchool && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">☀️ 오후 집중 자습 시작</label>
                    <input
                      type="time"
                      value={currentConfig.afternoonStudyStartTime || '13:30'}
                      onChange={e => updateCurrentDayConfig({ afternoonStudyStartTime: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">☀️ 오후 집중 자습 종료</label>
                    <input
                      type="time"
                      value={currentConfig.afternoonStudyEndTime || '17:30'}
                      onChange={e => updateCurrentDayConfig({ afternoonStudyEndTime: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-sm font-semibold"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">🌙 저녁/야간 심화 자습 시작</label>
                <input
                  type="time"
                  value={currentConfig.selfStudyStartTime || '20:00'}
                  onChange={e => updateCurrentDayConfig({ selfStudyStartTime: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-sm font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">🌙 저녁/야간 심화 자습 종료</label>
                <input
                  type="time"
                  value={currentConfig.selfStudyEndTime || '23:00'}
                  onChange={e => updateCurrentDayConfig({ selfStudyEndTime: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-sm font-semibold"
                />
              </div>
            </div>

            {/* Memo for this Day */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">{currentDayMeta.shortLabel}요일 학습 목표 및 메모</label>
              <input
                type="text"
                placeholder="예: 취약 과목 개념 정립, 킬러 문항 10제 풀기"
                value={currentConfig.memo || ''}
                onChange={e => updateCurrentDayConfig({ memo: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm"
              />
            </div>

            {/* Day Academies List */}
            <div className="space-y-3 pt-4 border-t border-stone-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <School className="w-4 h-4 text-indigo-600" />
                  <h4 className="font-extrabold text-sm text-stone-900">{currentDayMeta.label} 등록 학원/과외</h4>
                </div>
                <span className="text-xs text-stone-500">{currentDayMeta.shortLabel}요일에만 진행되는 학원을 등록하세요</span>
              </div>

              {/* Add academy input */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <input
                  type="text"
                  placeholder="학원/과외명 (예: 수학 심화 특강)"
                  value={newAcademyName}
                  onChange={e => setNewAcademyName(e.target.value)}
                  className="px-3.5 py-2 rounded-xl border border-stone-300 text-sm sm:col-span-2"
                />
                <input
                  type="time"
                  value={newAcademyStart}
                  onChange={e => setNewAcademyStart(e.target.value)}
                  className="px-3.5 py-2 rounded-xl border border-stone-300 text-sm font-semibold"
                />
                <div className="flex gap-2">
                  <input
                    type="time"
                    value={newAcademyEnd}
                    onChange={e => setNewAcademyEnd(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm font-semibold"
                  />
                  <button
                    type="button"
                    onClick={handleAddAcademyToDay}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition flex items-center justify-center font-bold text-xs shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="ml-1">추가</span>
                  </button>
                </div>
              </div>

              {currentConfig.academies && currentConfig.academies.length > 0 ? (
                <div className="space-y-2 pt-2">
                  {currentConfig.academies.map(acad => (
                    <div key={acad.id} className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200">
                      <div className="flex items-center space-x-3">
                        <span className="font-bold text-stone-900 text-sm">{acad.name}</span>
                        <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200">
                          {acad.startTime} ~ {acad.endTime}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAcademyFromDay(acad.id)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-stone-400 text-xs border border-dashed border-stone-200 rounded-xl">
                  {currentDayMeta.shortLabel}요일에 등록된 학원 일정이 없습니다.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: 방학 기간 및 방학 전용 스케줄 */}
      {activeSection === 'vacation' && (
        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-amber-50/80 border border-amber-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700">
                <Palmtree className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-amber-950 flex items-center gap-2">
                  <span>방학 기간 설정 및 활성화</span>
                  {formData.isVacationMode && (
                    <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500 text-white shadow-2xs">
                      방학 모드 적용 중
                    </span>
                  )}
                </h3>
                <p className="text-xs text-amber-800 mt-0.5">
                  방학 모드를 켜면 정규 학교 수업 대신 방학 전용 오전/오후 집중 자습 및 특강 루틴으로 자동 전환됩니다.
                </p>
              </div>
            </div>

            {/* Vacation Toggle */}
            <button
              type="button"
              onClick={() => {
                const nextVal = !formData.isVacationMode;
                setFormData(prev => ({
                  ...prev,
                  isVacationMode: nextVal,
                  vacation: { ...prev.vacation, enabled: nextVal }
                }));
              }}
              className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition shadow-xs flex items-center gap-2 ${
                formData.isVacationMode
                  ? 'bg-amber-600 text-white hover:bg-amber-700'
                  : 'bg-white text-stone-700 border border-stone-300 hover:bg-stone-50'
              }`}
            >
              <Palmtree className="w-4 h-4" />
              <span>{formData.isVacationMode ? '방학 모드 해제하기 (학기중 복귀)' : '방학 모드 켜기 (방학 스케줄 적용)'}</span>
            </button>
          </div>

          {/* Vacation Date Pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">방학 명칭</label>
              <input
                type="text"
                value={formData.vacation?.name || '여름방학 몰입 캠프'}
                onChange={e => setFormData(prev => ({
                  ...prev,
                  vacation: { ...prev.vacation, name: e.target.value }
                }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-semibold"
                placeholder="예: 2026 여름방학"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">방학 시작일</label>
              <input
                type="date"
                value={formData.vacation?.startDate || '2026-07-20'}
                onChange={e => setFormData(prev => ({
                  ...prev,
                  vacation: { ...prev.vacation, startDate: e.target.value }
                }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">방학 종료일</label>
              <input
                type="date"
                value={formData.vacation?.endDate || '2026-08-25'}
                onChange={e => setFormData(prev => ({
                  ...prev,
                  vacation: { ...prev.vacation, endDate: e.target.value }
                }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-semibold"
              />
            </div>
          </div>

          {/* Vacation Daily Schedule Customizer */}
          <div className="pt-4 border-t border-stone-100 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-extrabold text-stone-900 text-sm sm:text-base flex items-center gap-2">
                  <Sun className="w-4 h-4 text-amber-600" />
                  <span>방학 중 요일별 스케줄 커스텀</span>
                </h4>
                <p className="text-xs text-stone-500">방학 중 각 요일에 적용될 오전/오후/저녁 자습 및 특강 시간을 설정합니다.</p>
              </div>

              {/* Switch active day for vacation */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1">
                {DAYS_METADATA.map(day => (
                  <button
                    key={`vac-day-${day.key}`}
                    type="button"
                    onClick={() => {
                      setSelectedDayKey(day.key);
                      setIsEditingVacationRoutine(true);
                    }}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition border ${
                      isEditingVacationRoutine && selectedDayKey === day.key
                        ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <span>{day.shortLabel}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Vacation Routine Editor */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-stone-900">
                  🏖️ [{DAYS_METADATA.find(d => d.key === selectedDayKey)?.label}] 방학 일과
                </span>
                <span className="text-xs text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded">
                  비등교 자율 몰입일
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">방학 오전 자습</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="time"
                      value={formData.vacationDayConfigs?.[selectedDayKey]?.morningStudyStartTime || '09:00'}
                      onChange={e => {
                        const updated = { ...formData.vacationDayConfigs };
                        updated[selectedDayKey] = {
                          ...updated[selectedDayKey],
                          morningStudyStartTime: e.target.value
                        };
                        setFormData(prev => ({ ...prev, vacationDayConfigs: updated }));
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs font-semibold"
                    />
                    <span className="text-xs text-stone-400">~</span>
                    <input
                      type="time"
                      value={formData.vacationDayConfigs?.[selectedDayKey]?.morningStudyEndTime || '12:00'}
                      onChange={e => {
                        const updated = { ...formData.vacationDayConfigs };
                        updated[selectedDayKey] = {
                          ...updated[selectedDayKey],
                          morningStudyEndTime: e.target.value
                        };
                        setFormData(prev => ({ ...prev, vacationDayConfigs: updated }));
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">방학 오후 특강/자습</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="time"
                      value={formData.vacationDayConfigs?.[selectedDayKey]?.afternoonStudyStartTime || '13:30'}
                      onChange={e => {
                        const updated = { ...formData.vacationDayConfigs };
                        updated[selectedDayKey] = {
                          ...updated[selectedDayKey],
                          afternoonStudyStartTime: e.target.value
                        };
                        setFormData(prev => ({ ...prev, vacationDayConfigs: updated }));
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs font-semibold"
                    />
                    <span className="text-xs text-stone-400">~</span>
                    <input
                      type="time"
                      value={formData.vacationDayConfigs?.[selectedDayKey]?.afternoonStudyEndTime || '17:00'}
                      onChange={e => {
                        const updated = { ...formData.vacationDayConfigs };
                        updated[selectedDayKey] = {
                          ...updated[selectedDayKey],
                          afternoonStudyEndTime: e.target.value
                        };
                        setFormData(prev => ({ ...prev, vacationDayConfigs: updated }));
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">방학 저녁 심화 자습</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="time"
                      value={formData.vacationDayConfigs?.[selectedDayKey]?.selfStudyStartTime || '19:30'}
                      onChange={e => {
                        const updated = { ...formData.vacationDayConfigs };
                        updated[selectedDayKey] = {
                          ...updated[selectedDayKey],
                          selfStudyStartTime: e.target.value
                        };
                        setFormData(prev => ({ ...prev, vacationDayConfigs: updated }));
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs font-semibold"
                    />
                    <span className="text-xs text-stone-400">~</span>
                    <input
                      type="time"
                      value={formData.vacationDayConfigs?.[selectedDayKey]?.selfStudyEndTime || '22:30'}
                      onChange={e => {
                        const updated = { ...formData.vacationDayConfigs };
                        updated[selectedDayKey] = {
                          ...updated[selectedDayKey],
                          selfStudyEndTime: e.target.value
                        };
                        setFormData(prev => ({ ...prev, vacationDayConfigs: updated }));
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs font-semibold"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: 과목 우선순위 및 시험 모드 */}
      {activeSection === 'subjects' && (
        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-6">
          <div className="flex items-center space-x-2 pb-4 border-b border-stone-100">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-stone-900">과목별 우선순위 및 시험 모드</h3>
          </div>

          {/* Exam Mode Selector */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="block text-xs font-extrabold text-stone-900">시험 모드 선택 및 맞춤 추가</label>
                <p className="text-[11px] text-stone-500">
                  원하는 시험 모드를 선택하거나 '+ 새 시험 모드 추가'로 나만의 D-Day 플랜을 만들어보세요.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingExamMode(null);
                  setIsExamModalOpen(true);
                }}
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-extrabold transition border border-indigo-200 flex items-center gap-1 self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ 새 시험 모드 추가</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {examModesList.map((mode) => {
                const isSelected = formData.examMode === mode.id;

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
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      examMode: mode.id,
                      examName: mode.examName || mode.name,
                      examDate: mode.examDate || prev.examDate || ''
                    }))}
                    className={`p-3.5 rounded-2xl border text-left cursor-pointer transition flex flex-col justify-between group ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/80 text-indigo-900 font-bold ring-2 ring-indigo-400/30 shadow-xs'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-700 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-lg">{mode.iconEmoji}</span>
                          <span className="text-xs font-extrabold text-stone-900">{mode.name}</span>
                        </div>

                        <div className="flex items-center space-x-1">
                          {modeDDay && (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-md border border-amber-200">
                              {modeDDay}
                            </span>
                          )}
                          {mode.isCustom && (
                            <div className="flex items-center opacity-70 group-hover:opacity-100">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingExamMode(mode);
                                  setIsExamModalOpen(true);
                                }}
                                className="p-1 text-stone-400 hover:text-indigo-600 rounded-md transition"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => handleDeleteExamMode(mode.id, e)}
                                className="p-1 text-stone-400 hover:text-rose-600 rounded-md transition"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                        {mode.description}
                      </p>
                    </div>

                    {mode.strategyBadge && (
                      <div className="pt-2 mt-2 border-t border-stone-100/80 flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded-md">
                          {mode.strategyBadge}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                            <Check className="w-3 h-3" />
                            <span>선택됨</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* If selected mode has an exam name/date or is custom, allow inline tweaking */}
            {formData.examMode !== 'normal' && (
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-stone-50 p-4 rounded-2xl border border-stone-200">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">현재 선택된 시험 명칭</label>
                  <input
                    type="text"
                    value={formData.examName || ''}
                    onChange={e => setFormData(prev => ({ ...prev, examName: e.target.value }))}
                    placeholder="예: 2학기 기말고사 / 9월 모평"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">시험 D-Day 날짜</label>
                  <input
                    type="date"
                    value={formData.examDate || ''}
                    onChange={e => setFormData(prev => ({ ...prev, examDate: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm font-semibold"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Subject Priority List */}
          <div className="space-y-3 pt-4 border-t border-stone-100">
            <h4 className="font-extrabold text-sm text-stone-900">과목별 우선순위 지정 (1순위가 가장 높은 비중)</h4>
            <div className="space-y-2.5">
              {formData.subjects.map(sub => (
                <div key={sub.id} className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3.5 h-3.5 rounded-full ${sub.color}`} />
                    <div>
                      <h5 className="font-extrabold text-stone-900 text-sm">{sub.name}</h5>
                      <span className="text-xs text-stone-500">현재 숙달도: {sub.currentMastery}%</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-stone-600">우선순위:</span>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map(p => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => handleSubjectPriorityChange(sub.id, p)}
                            className={`w-7 h-7 rounded-lg text-xs font-extrabold transition ${
                              sub.priority === p
                                ? 'bg-indigo-600 text-white shadow-xs'
                                : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-stone-600">주간 목표:</span>
                      <input
                        type="number"
                        min={1}
                        max={30}
                        value={sub.weeklyTargetHours}
                        onChange={e => handleSubjectTargetHoursChange(sub.id, Number(e.target.value))}
                        className="w-16 px-2.5 py-1.5 rounded-lg border border-stone-300 text-center text-sm font-bold"
                      />
                      <span className="text-xs text-stone-500 font-medium">시간</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={() => handleSubmit()}
          className="px-8 py-3.5 bg-indigo-600 text-white font-extrabold rounded-2xl shadow-lg hover:bg-indigo-700 transition flex items-center space-x-2 text-sm"
        >
          <Sparkles className="w-5 h-5" />
          <span>전체 설정 저장 및 시간표 생성</span>
        </button>
      </div>

      {/* Custom Exam Mode Modal */}
      <ExamModeModal
        isOpen={isExamModalOpen}
        onClose={() => {
          setIsExamModalOpen(false);
          setEditingExamMode(null);
        }}
        onSave={handleSaveExamModeFromModal}
        editingMode={editingExamMode}
      />
    </div>
  );
};
