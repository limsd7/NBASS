import React, { useState } from 'react';
import { ScheduleBlock, CareType, DayKey, RoutineInput } from '../types';
import { DAYS_METADATA } from '../data/defaultSchedules';
import { CircularTimetable } from './CircularTimetable';
import { CheckCircle2, Circle, Clock, Sparkles, BookOpen, Coffee, School, Sun, Moon, AlertCircle, Heart, LayoutList, LayoutGrid, Palmtree, Calendar, Copy, ChevronRight, Check } from 'lucide-react';

interface TimetableDashboardProps {
  blocks: ScheduleBlock[];
  careType: CareType;
  routine: RoutineInput;
  onToggleBlock: (id: string) => void;
  onOpenAICoachWithContext: (contextText: string) => void;
  onStartPomodoro: (block: ScheduleBlock) => void;
  onSelectDay: (day: DayKey) => void;
  onToggleVacationMode: (enabled: boolean) => void;
  onOpenUserManual?: () => void;
}

export type PeriodFilter = 'all' | 'morning' | 'afternoon' | 'evening';

export interface PeriodInfo {
  id: 'morning' | 'afternoon' | 'evening';
  name: string;
  emoji: string;
  timeRange: string;
  badgeClass: string;
  cardBgClass: string;
  listBorderClass: string;
  accentColor: string;
  dotColor: string;
}

export const getPeriodInfo = (startTime: string): PeriodInfo => {
  const [h, m] = startTime.split(':').map(Number);
  const min = (h || 0) * 60 + (m || 0);

  if (min < 720) { // 00:00 ~ 11:59 (오전 - Vibrant Warm Amber/Orange)
    return {
      id: 'morning',
      name: '오전',
      emoji: '🌅',
      timeRange: '00:00 ~ 12:00',
      badgeClass: 'bg-amber-500 text-white font-extrabold shadow-2xs',
      cardBgClass: 'bg-gradient-to-br from-amber-100/80 via-orange-50/50 to-white border-amber-300 hover:border-amber-500 border-t-4 border-t-amber-500 shadow-xs',
      listBorderClass: 'border-l-[6px] border-l-amber-500 bg-gradient-to-r from-amber-100/60 via-amber-50/30 to-white border-amber-200/90 hover:border-amber-400 shadow-2xs',
      accentColor: 'text-amber-800',
      dotColor: 'bg-amber-500'
    };
  } else if (min < 1080) { // 12:00 ~ 17:59 (오후 - Vibrant Sky Blue/Cyan)
    return {
      id: 'afternoon',
      name: '오후',
      emoji: '☀️',
      timeRange: '12:00 ~ 18:00',
      badgeClass: 'bg-sky-600 text-white font-extrabold shadow-2xs',
      cardBgClass: 'bg-gradient-to-br from-sky-100/80 via-blue-50/50 to-white border-sky-300 hover:border-sky-500 border-t-4 border-t-sky-600 shadow-xs',
      listBorderClass: 'border-l-[6px] border-l-sky-500 bg-gradient-to-r from-sky-100/60 via-sky-50/30 to-white border-sky-200/90 hover:border-sky-400 shadow-2xs',
      accentColor: 'text-sky-800',
      dotColor: 'bg-sky-500'
    };
  } else { // 18:00 ~ 23:59 (저녁/야간 - Vibrant Deep Purple/Indigo)
    return {
      id: 'evening',
      name: '저녁',
      emoji: '🌙',
      timeRange: '18:00 ~ 24:00',
      badgeClass: 'bg-purple-600 text-white font-extrabold shadow-2xs',
      cardBgClass: 'bg-gradient-to-br from-purple-100/80 via-indigo-50/50 to-white border-purple-300 hover:border-purple-500 border-t-4 border-t-purple-600 shadow-xs',
      listBorderClass: 'border-l-[6px] border-l-purple-600 bg-gradient-to-r from-purple-100/60 via-purple-50/30 to-white border-purple-200/90 hover:border-purple-400 shadow-2xs',
      accentColor: 'text-purple-800',
      dotColor: 'bg-purple-600'
    };
  }
};

export const TimetableDashboard: React.FC<TimetableDashboardProps> = ({
  blocks,
  careType,
  routine,
  onToggleBlock,
  onOpenAICoachWithContext,
  onStartPomodoro,
  onSelectDay,
  onToggleVacationMode,
  onOpenUserManual
}) => {
  const [selectedBreakGuide, setSelectedBreakGuide] = useState<any | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list'); // 기본값: 일렬형태 ('list')
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all'); // 오전/오후/저녁 필터

  const activeDayKey = routine.activeDay || 'mon';
  const isVacation = Boolean(routine.isVacationMode);
  const currentDayMeta = DAYS_METADATA.find(d => d.key === activeDayKey) || DAYS_METADATA[0];

  const currentDayConfig = isVacation
    ? (routine.vacationDayConfigs?.[activeDayKey] || routine.dayConfigs?.[activeDayKey])
    : routine.dayConfigs?.[activeDayKey];

  const completedCount = blocks.filter(b => b.completed).length;
  const totalCount = blocks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Active Exam Mode calculation
  const activeExamMode = routine.examModesList?.find(m => m.id === routine.examMode);
  let examDDayBadge: string | null = null;
  const targetDateStr = activeExamMode?.examDate || (routine.examMode !== 'normal' ? routine.examDate : '');
  if (targetDateStr) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(targetDateStr);
    target.setHours(0, 0, 0, 0);
    const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    examDDayBadge = diff === 0 ? 'D-Day' : diff > 0 ? `D-${diff}` : `D+${Math.abs(diff)}`;
  }

  // Period Counts
  const morningCount = blocks.filter(b => getPeriodInfo(b.startTime).id === 'morning').length;
  const afternoonCount = blocks.filter(b => getPeriodInfo(b.startTime).id === 'afternoon').length;
  const eveningCount = blocks.filter(b => getPeriodInfo(b.startTime).id === 'evening').length;

  const filteredBlocks = blocks.filter(block => {
    if (periodFilter === 'all') return true;
    return getPeriodInfo(block.startTime).id === periodFilter;
  });

  const handleSelectBlock = (id: string) => {
    setSelectedBlockId(id);
    const element = document.getElementById(`schedule-block-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const getBlockIcon = (type: string) => {
    switch (type) {
      case 'study': return <BookOpen className="w-5 h-5 text-indigo-600" />;
      case 'break': return <Coffee className="w-5 h-5 text-emerald-600" />;
      case 'school': return <School className="w-5 h-5 text-sky-600" />;
      case 'academy': return <Sparkles className="w-5 h-5 text-purple-600" />;
      case 'routine': return <Sun className="w-5 h-5 text-amber-500" />;
      case 'sleep': return <Moon className="w-5 h-5 text-slate-600" />;
      default: return <Clock className="w-5 h-5 text-stone-500" />;
    }
  };

  const getBlockBg = (block: ScheduleBlock, isSelected: boolean, isListView: boolean) => {
    if (isSelected) return 'bg-indigo-50/95 border-indigo-500 shadow-md ring-2 ring-indigo-400/50';
    if (block.completed) return 'bg-stone-50/90 border-stone-200 opacity-60';
    
    const period = getPeriodInfo(block.startTime);
    if (isListView) {
      return period.listBorderClass;
    } else {
      return period.cardBgClass;
    }
  };

  return (
    <div className="w-full space-y-4 pb-16">
      {/* 1. Day Selector Bar (월, 화, 수, 목, 금, 토, 일, 공휴일 & 방학 모드 토글) */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-stone-900 flex flex-wrap items-center gap-2">
                <span>요일별 & 휴일·방학 맞춤 시간표</span>
                {isVacation && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-300 flex items-center gap-1">
                    <Palmtree className="w-3 h-3 text-amber-600" />
                    <span>{routine.vacation?.name || '방학 모드 적용 중'}</span>
                  </span>
                )}
                {activeExamMode && routine.examMode !== 'normal' && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 font-extrabold border border-purple-300 flex items-center gap-1">
                    <span>{activeExamMode.iconEmoji}</span>
                    <span>{activeExamMode.name}</span>
                    {examDDayBadge && (
                      <span className="bg-purple-600 text-white px-1.5 py-0.2 rounded-md text-[10px] ml-0.5">
                        {examDDayBadge}
                      </span>
                    )}
                  </span>
                )}
              </h3>
              <p className="text-xs text-stone-500">
                원하는 요일을 클릭하면 해당 요일의 24시간 원형 계획표와 블록 목록으로 즉시 전환됩니다.
              </p>
            </div>
          </div>

          {/* Vacation Mode Toggle Switch */}
          <div className="flex items-center space-x-2 self-start md:self-auto bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-200">
            <Palmtree className={`w-4 h-4 ${isVacation ? 'text-amber-600' : 'text-stone-400'}`} />
            <span className="text-xs font-bold text-stone-700">방학 모드</span>
            <button
              onClick={() => onToggleVacationMode(!isVacation)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                isVacation ? 'bg-amber-500' : 'bg-stone-300'
              }`}
              role="switch"
              aria-checked={isVacation}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  isVacation ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Day of Week Switcher Buttons */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 pt-1 border-t border-stone-100">
          {DAYS_METADATA.map((day) => {
            const isActive = activeDayKey === day.key;
            return (
              <button
                key={day.key}
                onClick={() => onSelectDay(day.key)}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-0.5 border ${
                  isActive
                    ? day.key === 'holiday'
                      ? 'bg-rose-600 text-white border-rose-700 shadow-md ring-2 ring-rose-400/40'
                      : 'bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-400/40'
                    : day.key === 'holiday'
                    ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                    : day.type === 'weekend'
                    ? 'bg-blue-50/70 text-blue-800 border-blue-200 hover:bg-blue-100'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <div className="flex items-center gap-1">
                  <span>{day.iconEmoji}</span>
                  <span className="font-extrabold text-sm">{day.shortLabel}</span>
                </div>
                <span className={`text-[10px] ${isActive ? 'text-indigo-100' : 'text-stone-500'}`}>
                  {day.type === 'weekday' ? '등교' : day.type === 'weekend' ? '주말' : '휴일'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Day Info & Memo Badge */}
        {currentDayConfig && (
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-stone-50 rounded-xl border border-stone-200/80 text-xs">
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-stone-800 flex items-center gap-1">
                <span>{currentDayMeta.iconEmoji}</span>
                <span>{currentDayMeta.label}</span>
                {isVacation && <span className="text-amber-700">(방학 스케줄)</span>}
              </span>
              <span className="text-stone-400">·</span>
              <span className="text-stone-600 font-medium">
                {currentDayConfig.hasSchool && !isVacation
                  ? `정규 등교 (${currentDayConfig.schoolStartTime}~${currentDayConfig.schoolEndTime})`
                  : '비등교 집중 몰입일'}
              </span>
              {currentDayConfig.academies && currentDayConfig.academies.length > 0 && (
                <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-bold border border-purple-200">
                  학원 {currentDayConfig.academies.length}개
                </span>
              )}
            </div>
            {currentDayConfig.memo && (
              <div className="text-stone-500 italic text-[11px]">
                "{currentDayConfig.memo}"
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Top Summary Banner with Care Type Summary & Progress */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-4">
          <div className="text-4xl p-3 bg-stone-100 rounded-2xl shrink-0">{careType.emoji}</div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                현재 적용 중인 케어 타입
              </span>
              <span className="text-xs text-stone-500">뽀모도로 {careType.pomodoroWork}분 / 휴식 {careType.pomodoroBreak}분</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-stone-900 mt-1">{careType.title}</h2>
            <p className="text-xs text-stone-600 mt-0.5">{careType.solution}</p>
          </div>
        </div>

        {/* Progress Circle / Bar */}
        <div className="w-full md:w-64 bg-stone-100 rounded-2xl p-4 flex flex-col justify-center">
          <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
            <span className="text-stone-700">{currentDayMeta.shortLabel}요일 달성률</span>
            <span className="text-indigo-600 font-bold">{progressPercent}% ({completedCount}/{totalCount})</span>
          </div>
          <div className="w-full h-2.5 bg-stone-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Break Guide Modal Popup if triggered */}
      {selectedBreakGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🧘</span>
                <h3 className="text-lg font-bold text-stone-900">{selectedBreakGuide.title}</h3>
              </div>
              <button
                onClick={() => setSelectedBreakGuide(null)}
                className="text-stone-400 hover:text-stone-700 font-bold text-lg"
              >
                ✕
              </button>
            </div>
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-900 text-sm leading-relaxed">
              {selectedBreakGuide.description}
            </div>
            <div className="text-xs text-stone-500">
              권장 휴식 시간: {selectedBreakGuide.durationMinutes || 10}분 간 스마트폰 화면을 멀리하고 심호흡을 실시하세요.
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedBreakGuide(null)}
                className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition"
              >
                휴식 완료 및 복귀하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Main 4-Column Layout in Card View (Col 1: Circular Timetable, Col 2, 3, 4: Schedule Block Cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* 1열: 24시간 원형 생활계획표 (대화면에서 1열 25% 차지) */}
        <div className="lg:col-span-4 xl:col-span-3 lg:sticky lg:top-20 space-y-4">
          <CircularTimetable
            blocks={blocks}
            careType={careType}
            selectedBlockId={selectedBlockId}
            onSelectBlock={handleSelectBlock}
            onStartPomodoro={onStartPomodoro}
          />
        </div>

        {/* 2열, 3열, 4열: 최적화 시간표 블록 목록 (대화면에서 75% 차지하며 카드 형태 시 3단 그리드로 2,3,4열 구성) */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-4">
          {/* Timeline Header with View Mode & Period Filters */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-600" />
                  <span>[{currentDayMeta.label}] 최적화 시간표 블록 목록</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  <span className="text-amber-700 font-bold">오전(황금빛)</span> · <span className="text-sky-700 font-bold">오후(하늘색)</span> · <span className="text-purple-700 font-bold">저녁(보라색)</span>으로 확실하게 구분됩니다.
                </p>
              </div>

              <div className="flex items-center space-x-2 shrink-0 self-start sm:self-auto">
                {/* View Switcher: List vs Card */}
                <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      viewMode === 'list'
                        ? 'bg-white text-indigo-700 shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                    title="일렬 형태로 보기 (기본값)"
                  >
                    <LayoutList className="w-3.5 h-3.5" />
                    <span>일렬 형태</span>
                  </button>
                  <button
                    onClick={() => setViewMode('card')}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      viewMode === 'card'
                        ? 'bg-white text-indigo-700 shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                    title="4열 카드 형태로 보기 (1열 원형 + 2,3,4열 카드)"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>카드 형태</span>
                  </button>
                </div>

                {onOpenUserManual && (
                  <button
                    onClick={onOpenUserManual}
                    className="text-xs font-bold text-amber-900 hover:text-amber-950 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-300 transition flex items-center gap-1.5 shadow-2xs"
                    title="앱 사용 설명서 및 퀵 스타트 가이드"
                  >
                    <span>📖</span>
                    <span className="hidden sm:inline">사용 가이드</span>
                  </button>
                )}

                <button
                  onClick={() => onOpenAICoachWithContext(`[${currentDayMeta.label} 시간표] 현재 요일 일정과 내 케어 타입에 맞는 학습 조언과 집중 팁을 알려줘.`)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100 transition flex items-center gap-1.5 shadow-2xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">AI 학습 코치</span>
                </button>
              </div>
            </div>

            {/* Time of Day (오전 / 오후 / 저녁) Color Legend & Filter Tabs */}
            <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-stone-600 mr-1 hidden sm:inline">시간대 필터:</span>
                <button
                  onClick={() => setPeriodFilter('all')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition border ${
                    periodFilter === 'all'
                      ? 'bg-stone-900 text-white border-stone-900 shadow-2xs'
                      : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
                  }`}
                >
                  전체 ({totalCount})
                </button>
                <button
                  onClick={() => setPeriodFilter('morning')}
                  className={`px-3 py-1 rounded-xl text-xs font-extrabold transition border flex items-center gap-1.5 ${
                    periodFilter === 'morning'
                      ? 'bg-amber-500 text-white border-amber-600 shadow-xs ring-1 ring-amber-400'
                      : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-white inline-block"></span>
                  <span>🌅 오전 ({morningCount})</span>
                </button>
                <button
                  onClick={() => setPeriodFilter('afternoon')}
                  className={`px-3 py-1 rounded-xl text-xs font-extrabold transition border flex items-center gap-1.5 ${
                    periodFilter === 'afternoon'
                      ? 'bg-sky-600 text-white border-sky-700 shadow-xs ring-1 ring-sky-400'
                      : 'bg-sky-50 text-sky-900 border-sky-300 hover:bg-sky-100'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500 border border-white inline-block"></span>
                  <span>☀️ 오후 ({afternoonCount})</span>
                </button>
                <button
                  onClick={() => setPeriodFilter('evening')}
                  className={`px-3 py-1 rounded-xl text-xs font-extrabold transition border flex items-center gap-1.5 ${
                    periodFilter === 'evening'
                      ? 'bg-purple-600 text-white border-purple-700 shadow-xs ring-1 ring-purple-400'
                      : 'bg-purple-50 text-purple-900 border-purple-300 hover:bg-purple-100'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600 border border-white inline-block"></span>
                  <span>🌙 저녁 ({eveningCount})</span>
                </button>
              </div>

              <div className="text-[11px] font-bold text-stone-600 flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>오전 (~12:00)
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-sky-50 text-sky-900 border border-sky-200">
                  <span className="w-2 h-2 rounded-full bg-sky-500"></span>오후 (12~18시)
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-purple-50 text-purple-900 border border-purple-200">
                  <span className="w-2 h-2 rounded-full bg-purple-600"></span>저녁 (18시~)
                </span>
              </div>
            </div>
          </div>

          {/* Render List or Card View based on viewMode */}
          {filteredBlocks.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-stone-200 text-stone-500 text-sm">
              해당 시간대에 배정된 일정이 없습니다.
            </div>
          ) : viewMode === 'list' ? (
            /* 일렬 형태 (List View - Default) */
            <div className="space-y-2.5">
              {filteredBlocks.map((block) => {
                const isBreak = block.type === 'break';
                const isSelected = selectedBlockId === block.id;
                const period = getPeriodInfo(block.startTime);

                return (
                  <div
                    id={`schedule-block-${block.id}`}
                    key={block.id}
                    onClick={() => setSelectedBlockId(block.id)}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs ${getBlockBg(
                      block,
                      isSelected,
                      true
                    )}`}
                  >
                    {/* Left: Checkbox, Icon, Time & Details */}
                    <div className="flex items-start sm:items-center space-x-3 min-w-0 flex-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleBlock(block.id);
                        }}
                        className="mt-0.5 sm:mt-0 text-stone-400 hover:text-indigo-600 transition shrink-0"
                      >
                        {block.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-indigo-600 fill-indigo-50" />
                        ) : (
                          <Circle className="w-5 h-5 text-stone-300" />
                        )}
                      </button>

                      <div className="p-2 rounded-xl bg-white border border-stone-100 shadow-2xs shrink-0">
                        {getBlockIcon(block.type)}
                      </div>

                      <div className="min-w-0 flex-1">
                        {/* Time badges with Period distinction */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          {/* Period Badge (오전/오후/저녁) */}
                          <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-md border flex items-center gap-1 shadow-2xs ${period.badgeClass}`}>
                            <span>{period.emoji}</span>
                            <span>{period.name}</span>
                          </span>

                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white/95 text-stone-800 border border-stone-200 shadow-2xs">
                            {block.startTime} ~ {block.endTime}
                          </span>

                          {block.priority && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                              {block.priority}순위
                            </span>
                          )}

                          {isSelected && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-600 text-white">
                              선택됨
                            </span>
                          )}
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 mt-1">
                          <h4 className={`font-bold text-sm sm:text-base ${block.completed ? 'line-through text-stone-400' : 'text-stone-900'}`}>
                            {block.title}
                          </h4>
                          {block.description && (
                            <span className={`text-xs truncate max-w-md ${block.completed ? 'text-stone-400' : 'text-stone-600'}`}>
                              · {block.description}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Category Label & Action Button */}
                    <div className="flex items-center justify-between md:justify-end gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-stone-100/60">
                      <span className="text-[11px] font-medium text-stone-500 md:mr-1">
                        {block.type === 'study' ? '집중 블록' : block.type === 'break' ? '휴식·스트레칭' : '일상 루틴'}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {isBreak && block.breakGuide && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBreakGuide(block.breakGuide);
                            }}
                            className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-emerald-700 transition flex items-center space-x-1"
                          >
                            <Heart className="w-3.5 h-3.5 fill-emerald-200" />
                            <span>명상 가이드</span>
                          </button>
                        )}

                        {block.type === 'study' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onStartPomodoro(block);
                            }}
                            className="px-3.5 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-indigo-700 transition flex items-center space-x-1"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>뽀모도로 시작</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* 카드 형태 (Card View - 3-Column Grid for Col 2, 3, 4) */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
              {filteredBlocks.map((block) => {
                const isBreak = block.type === 'break';
                const isSelected = selectedBlockId === block.id;
                const period = getPeriodInfo(block.startTime);

                return (
                  <div
                    id={`schedule-block-${block.id}`}
                    key={block.id}
                    onClick={() => setSelectedBlockId(block.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 shadow-2xs ${getBlockBg(
                      block,
                      isSelected,
                      false
                    )}`}
                  >
                    {/* Top Bar: Icon, Time, Priority, Checkbox */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-2.5">
                        <div className="p-2 rounded-xl bg-white border border-stone-100 shadow-2xs shrink-0">
                          {getBlockIcon(block.type)}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            {/* Period Badge (오전/오후/저녁) */}
                            <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-md border flex items-center gap-1 shadow-2xs ${period.badgeClass}`}>
                              <span>{period.emoji}</span>
                              <span>{period.name}</span>
                            </span>

                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white/95 text-stone-800 border border-stone-200 shadow-2xs">
                              {block.startTime} ~ {block.endTime}
                            </span>
                            {block.priority && (
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                                {block.priority}순위
                              </span>
                            )}
                            {isSelected && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-600 text-white">
                                선택됨
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleBlock(block.id);
                        }}
                        className="text-stone-400 hover:text-indigo-600 transition shrink-0"
                      >
                        {block.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-indigo-600 fill-indigo-50" />
                        ) : (
                          <Circle className="w-5 h-5 text-stone-300" />
                        )}
                      </button>
                    </div>

                    {/* Body: Title & Description */}
                    <div>
                      <h4 className={`font-bold text-sm sm:text-base leading-snug ${block.completed ? 'line-through text-stone-400' : 'text-stone-900'}`}>
                        {block.title}
                      </h4>
                      {block.description && (
                        <p className={`text-xs mt-1 leading-relaxed line-clamp-2 ${block.completed ? 'text-stone-400' : 'text-stone-600'}`}>
                          {block.description}
                        </p>
                      )}
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="pt-2 border-t border-stone-100/80 flex items-center justify-between gap-2 mt-auto">
                      <span className="text-[11px] font-medium text-stone-500">
                        {block.type === 'study' ? '집중 블록' : block.type === 'break' ? '휴식·스트레칭' : '일상 루틴'}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {isBreak && block.breakGuide && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBreakGuide(block.breakGuide);
                            }}
                            className="px-2.5 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-emerald-700 transition flex items-center space-x-1"
                          >
                            <Heart className="w-3 h-3 fill-emerald-200" />
                            <span>명상 가이드</span>
                          </button>
                        )}

                        {block.type === 'study' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onStartPomodoro(block);
                            }}
                            className="px-2.5 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-indigo-700 transition flex items-center space-x-1"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>뽀모도로</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


