import React, { useState, useEffect, useMemo } from 'react';
import { CareType as ScheduleCareType, RoutineInput, ScheduleBlock, DayKey } from './types';
import { CARE_TYPES } from './data/careTypes';
import { INITIAL_ROUTINE_STATE } from './data/defaultSchedules';
import { generateSchedule } from './utils/scheduler';
import { RoutineInputView } from './components/RoutineInput';
import { TimetableDashboard } from './components/TimetableDashboard';
import { DashboardStats } from './components/DashboardStats';
import { ExamPlanner } from './components/ExamPlanner';
import { AICoachModal } from './components/AICoachModal';
import { PomodoroModal } from './components/PomodoroModal';
import { DailyConditionModal } from './components/DailyConditionModal';
import { UserManualModal } from './components/UserManualModal';
import { ScheduleSetupModal } from './components/ScheduleSetupModal';
import { StudentInfo, CareType as MainCareType } from '../../types';
import { CARE_TYPE_LABELS } from '../../logicEngine';
import { Calendar, BookOpen, Sparkles, BarChart2, Heart, HelpCircle, Bot, Settings } from 'lucide-react';

interface ScheduleManagementViewProps {
  student?: StudentInfo;
  history?: any[];
  aiModels?: any;
  onBack?: () => void;
}

export const ScheduleManagementView: React.FC<ScheduleManagementViewProps> = ({
  student,
  history,
  aiModels,
  onBack
}) => {
  // 1. 최신 검사 기록 추출 및 종합 진단 분석 정보 계산
  const latestRecord = useMemo(() => {
    if (history && history.length > 0) {
      const sortedHistory = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      return sortedHistory[0];
    }
    return null;
  }, [history]);

  // 주진단 유형 매핑 및 세부 진단 결과
  const diagnosisInfo = useMemo(() => {
    if (latestRecord && latestRecord.classificationResult?.primary) {
      const primaryKey = latestRecord.classificationResult.primary as MainCareType;
      const label = CARE_TYPE_LABELS[primaryKey];
      const allScores = latestRecord.classificationResult?.allScores || [];
      const primaryScoreObj = allScores.find((s: any) => s.type === primaryKey);
      const score = primaryScoreObj ? primaryScoreObj.score : (allScores[0]?.score || 0);

      // schedule 내부 CareType 매칭
      const pTypeLower = String(primaryKey).toLowerCase();
      const matchedCare = CARE_TYPES.find(c => 
        c.id.toLowerCase() === pTypeLower || 
        c.category.toLowerCase() === pTypeLower || 
        pTypeLower.includes(c.id.toLowerCase())
      ) || CARE_TYPES[0];

      return {
        hasDiagnosis: true,
        primaryKey,
        labelName: label?.name || primaryKey,
        icon: label?.icon || '🧠',
        description: label?.description || '신경계 맞춤 스케줄링 적용',
        publicDescription: label?.publicDescription || matchedCare.traits,
        score,
        careType: matchedCare,
        companionRisks: allScores.slice(1, 3).map((s: any) => ({
          name: CARE_TYPE_LABELS[s.type as MainCareType]?.name || s.type,
          icon: CARE_TYPE_LABELS[s.type as MainCareType]?.icon || '⚡',
          score: s.score
        }))
      };
    }

    return {
      hasDiagnosis: false,
      primaryKey: 'burnout',
      labelName: '과긴장 번아웃',
      icon: '🔥',
      description: '교감신경 과활성 + 신체/뇌 피로 누적',
      publicDescription: '과도한 긴장이 지속되어 에너지 배터리가 완전 방전된 상태입니다. 맞춤 휴식 뽀모도로가 적용됩니다.',
      score: 0,
      careType: CARE_TYPES[0],
      companionRisks: []
    };
  }, [latestRecord]);

  const [currentCareType, setCurrentCareType] = useState<ScheduleCareType>(diagnosisInfo.careType);
  const [activeTab, setActiveTab] = useState<'schedule' | 'dashboard' | 'exam' | 'input'>('schedule');

  // 진단 결과가 변경되면 자동으로 스케줄러 케어 타입 동기화
  useEffect(() => {
    setCurrentCareType(diagnosisInfo.careType);
  }, [diagnosisInfo]);

  // 2. 학생의 등록된 과목 정보 반영하여 Routine 초기화
  const [routine, setRoutine] = useState<RoutineInput>(() => {
    const savedRoutineKey = student?.id ? `nbass_schedule_routine_${student.id}` : 'nbass_schedule_routine_default';
    try {
      const saved = localStorage.getItem(savedRoutineKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch { }

    const baseRoutine = { ...INITIAL_ROUTINE_STATE };
    if (student?.selectedSubjects && student.selectedSubjects.length > 0) {
      baseRoutine.subjects = student.selectedSubjects.map((subjId, idx) => {
        const subjName = subjId === 'korean' ? '국어' : subjId === 'math' ? '수학' : subjId === 'english' ? '영어' : subjId;
        const color = idx === 0 ? '#3b82f6' : idx === 1 ? '#10b981' : idx === 2 ? '#f59e0b' : '#8b5cf6';
        return {
          id: subjId,
          name: subjName,
          priority: idx + 1,
          weeklyTargetHours: 12 - idx * 2,
          currentMastery: 70,
          color
        };
      });
    }
    return baseRoutine;
  });

  const [scheduleBlocks, setScheduleBlocks] = useState<ScheduleBlock[]>([]);
  const [isAICoachOpen, setIsAICoachOpen] = useState<boolean>(false);
  const [isConditionModalOpen, setIsConditionModalOpen] = useState<boolean>(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState<boolean>(false);
  const [activePomodoroBlock, setActivePomodoroBlock] = useState<ScheduleBlock | null>(null);
  const [aiCoachContext, setAICoachContext] = useState<string>('');

  // 처음 사용자를 위한 요일별/공휴일/방학 일과 설정 모달 상태
  const [isSetupModalOpen, setIsSetupModalOpen] = useState<boolean>(() => {
    const savedRoutineKey = student?.id ? `nbass_schedule_routine_${student.id}` : 'nbass_schedule_routine_default';
    try {
      const saved = localStorage.getItem(savedRoutineKey);
      // 저장된 사용자 루틴이 없으면 첫 진입 시 자동으로 모달 오픈
      return !saved;
    } catch {
      return false;
    }
  });

  const [isFirstTimeSetup, setIsFirstTimeSetup] = useState<boolean>(() => {
    const savedRoutineKey = student?.id ? `nbass_schedule_routine_${student.id}` : 'nbass_schedule_routine_default';
    try {
      return !localStorage.getItem(savedRoutineKey);
    } catch {
      return false;
    }
  });

  // 루틴 변경 시 저장
  const handleSaveRoutineWithStorage = (newRoutine: RoutineInput) => {
    setRoutine(newRoutine);
    const savedRoutineKey = student?.id ? `nbass_schedule_routine_${student.id}` : 'nbass_schedule_routine_default';
    try {
      localStorage.setItem(savedRoutineKey, JSON.stringify(newRoutine));
    } catch (e) {
      console.warn('Failed to save routine', e);
    }
  };

  // Generate schedule whenever routine, activeDay, isVacationMode, or careType changes
  useEffect(() => {
    const blocks = generateSchedule(
      routine,
      currentCareType,
      routine.activeDay || 'mon',
      routine.isVacationMode
    );
    setScheduleBlocks(blocks);
  }, [routine, currentCareType]);

  const handleToggleBlock = (id: string) => {
    setScheduleBlocks(prev =>
      prev.map(b => b.id === id ? { ...b, completed: !b.completed } : b)
    );
  };

  const handleSelectDay = (day: DayKey) => {
    setRoutine(prev => ({
      ...prev,
      activeDay: day
    }));
  };

  const handleToggleVacationMode = (enabled: boolean) => {
    setRoutine(prev => ({
      ...prev,
      isVacationMode: enabled,
      vacation: {
        ...(prev.vacation || { name: '방학 집중 기간', startDate: '', endDate: '' }),
        enabled
      }
    }));
  };

  const handleOpenAICoachWithContext = (contextText: string) => {
    setAICoachContext(contextText);
    setIsAICoachOpen(true);
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
      
      {/* Sub Header: Diagnostic Overview & Integrated Care Banner */}
      <div className="bg-gradient-to-br from-white via-indigo-50/30 to-blue-50/20 rounded-3xl p-5 sm:p-7 border border-indigo-100/80 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        
        {/* Left: Title & Live Diagnostic Connection */}
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors cursor-pointer text-slate-600 dark:text-slate-300"
                title="돌아가기"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
            )}
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white flex items-center justify-center text-xl shadow-md shadow-indigo-200 shrink-0">
              📅
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  스마트 케어 스케줄러
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-black">
                  {student?.name || '수험생'} 전용
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  종합 진단 결과 실시간 연동 중
                </span>
              </div>
            </div>
          </div>

          {/* Connected Diagnostic Card: 종합 진단 분석 결과 표출 */}
          <div className="bg-white/90 backdrop-blur-xs rounded-2xl p-4 border border-indigo-100 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-2xl shrink-0">
                {diagnosisInfo.icon}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-indigo-600 text-white tracking-wide">
                    주진단 1순위
                  </span>
                  <span className="text-base font-black text-slate-900">
                    {diagnosisInfo.labelName}
                  </span>
                  {diagnosisInfo.score > 0 && (
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                      위험도 {diagnosisInfo.score}점
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  {diagnosisInfo.description} &bull; <span className="text-indigo-700 font-bold">{diagnosisInfo.careType.pomodoroWork}분 집중 + {diagnosisInfo.careType.pomodoroBreak}분 맞춤 이완 뽀모도로 자동 반영</span>
                </p>
              </div>
            </div>

            {/* 동반 위험군 뱃지 */}
            {diagnosisInfo.companionRisks.length > 0 && (
              <div className="flex items-center gap-1.5 shrink-0 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400">동반 관리:</span>
                {diagnosisInfo.companionRisks.map((cr: any, idx: number) => (
                  <span key={idx} className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                    <span>{cr.icon}</span>
                    <span>{cr.name}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto self-end lg:self-center">
          {/* 일과 & 학원 일정 설정 (처음 사용자/언제든 재설정 모달) */}
          <button
            onClick={() => {
              setIsFirstTimeSetup(false);
              setIsSetupModalOpen(true);
            }}
            className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-black shadow-md shadow-orange-500/20 transition flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="요일별 등하교, 취침/기상, 학원/과외 일정 설정"
          >
            <Settings className="w-4 h-4" />
            <span>일과 &amp; 학원 설정</span>
          </button>

          {/* Condition Check */}
          <button
            onClick={() => setIsConditionModalOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-700 hover:text-rose-700 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Heart className="w-4 h-4 fill-rose-100 text-rose-500" />
            <span>오늘의 컨디션 점검</span>
          </button>

          {/* AI Coach */}
          <button
            onClick={() => {
              setAICoachContext(`내 주진단 상태(${diagnosisInfo.labelName})와 등록된 시간표에 맞춰 최적의 주간 학습 효율 조언을 해줘.`);
              setIsAICoachOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-black shadow-md shadow-indigo-200 transition flex items-center gap-1.5"
          >
            <Bot className="w-4 h-4" />
            <span>AI 시간표 코칭</span>
          </button>

          {/* Manual Modal */}
          <button
            onClick={() => setIsManualModalOpen(true)}
            className="p-2.5 rounded-xl text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition shadow-2xs"
            title="스케줄러 사용 가이드"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Navigation Sub-tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('schedule')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition ${
            activeTab === 'schedule'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>오늘의 서큘러 시간표</span>
        </button>

        <button
          onClick={() => setActiveTab('input')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition ${
            activeTab === 'input'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>기본 루틴 & 과목/학원 설정</span>
        </button>

        <button
          onClick={() => setActiveTab('exam')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition ${
            activeTab === 'exam'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>D-Day 시험 모드 플래너</span>
        </button>

        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition ${
            activeTab === 'dashboard'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>과목별 학습 배분 통계</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="w-full">
        {activeTab === 'schedule' && (
          <TimetableDashboard
            blocks={scheduleBlocks}
            careType={currentCareType}
            routine={routine}
            onToggleBlock={handleToggleBlock}
            onOpenAICoachWithContext={handleOpenAICoachWithContext}
            onStartPomodoro={(block) => setActivePomodoroBlock(block)}
            onSelectDay={handleSelectDay}
            onToggleVacationMode={handleToggleVacationMode}
            onOpenUserManual={() => setIsManualModalOpen(true)}
          />
        )}

        {activeTab === 'input' && (
          <RoutineInputView
            routine={routine}
            onSaveRoutine={handleSaveRoutineWithStorage}
            onGenerate={() => setActiveTab('schedule')}
          />
        )}

        {activeTab === 'exam' && (
          <ExamPlanner
            routine={routine}
            careType={currentCareType}
            onUpdateRoutine={handleSaveRoutineWithStorage}
            onNavigateToSchedule={() => setActiveTab('schedule')}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardStats
            subjects={routine.subjects}
            careType={currentCareType}
          />
        )}
      </div>

      {/* Modals */}
      <DailyConditionModal
        isOpen={isConditionModalOpen}
        onClose={() => setIsConditionModalOpen(false)}
        onSelectCareType={setCurrentCareType}
      />

      <PomodoroModal
        isOpen={Boolean(activePomodoroBlock)}
        onClose={() => setActivePomodoroBlock(null)}
        block={activePomodoroBlock}
        careType={currentCareType}
        onCompleteBlock={handleToggleBlock}
      />

      <AICoachModal
        isOpen={isAICoachOpen}
        onClose={() => setIsAICoachOpen(false)}
        careType={currentCareType}
        routine={routine}
        initialContext={aiCoachContext}
      />

      <UserManualModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
      />

      {/* 처음 사용자 온보딩 및 일과/학원 설정 모달 */}
      <ScheduleSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        routine={routine}
        onSaveRoutine={handleSaveRoutineWithStorage}
        onGenerate={() => {
          setActiveTab('schedule');
          setIsSetupModalOpen(false);
        }}
        studentName={student?.name || '수험생'}
        isFirstTime={isFirstTimeSetup}
      />

    </div>
  );
};
