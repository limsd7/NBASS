import React, { useState, useEffect } from 'react';
import { CareType, RoutineInput, ScheduleBlock, DayKey } from './types';
import { CARE_TYPES } from './data/careTypes';
import { INITIAL_ROUTINE_STATE } from './data/defaultSchedules';
import { generateSchedule } from './utils/scheduler';
import { Header } from './components/Header';
import { CareTypeSelector } from './components/CareTypeSelector';
import { RoutineInputView } from './components/RoutineInput';
import { TimetableDashboard } from './components/TimetableDashboard';
import { DashboardStats } from './components/DashboardStats';
import { ExamPlanner } from './components/ExamPlanner';
import { AICoachModal } from './components/AICoachModal';
import { PomodoroModal } from './components/PomodoroModal';
import { DailyConditionModal } from './components/DailyConditionModal';
import { UserManualModal } from './components/UserManualModal';

export default function App() {
  const [currentCareType, setCurrentCareType] = useState<CareType>(CARE_TYPES[0]); // 과긴장 번아웃 default
  const [activeTab, setActiveTab] = useState<'schedule' | 'dashboard' | 'exam' | 'input'>('schedule');

  const [routine, setRoutine] = useState<RoutineInput>(INITIAL_ROUTINE_STATE);

  const [scheduleBlocks, setScheduleBlocks] = useState<ScheduleBlock[]>([]);
  const [isCareModalOpen, setIsCareModalOpen] = useState<boolean>(false);
  const [isAICoachOpen, setIsAICoachOpen] = useState<boolean>(false);
  const [isConditionModalOpen, setIsConditionModalOpen] = useState<boolean>(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState<boolean>(false);
  const [activePomodoroBlock, setActivePomodoroBlock] = useState<ScheduleBlock | null>(null);
  const [aiCoachContext, setAICoachContext] = useState<string>('');

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
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col font-sans">
      {/* Header */}
      <Header
        currentCareType={currentCareType}
        onOpenCareModal={() => setIsCareModalOpen(true)}
        onOpenConditionCheck={() => setIsConditionModalOpen(true)}
        onOpenAICoach={() => {
          setAICoachContext("내 시간표와 현재 케어 타입에 맞는 종합 학습 조언을 해줘.");
          setIsAICoachOpen(true);
        }}
        onOpenUserManual={() => setIsManualModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className={`flex-1 w-full py-4 ${activeTab === 'schedule' ? 'w-full px-2 sm:px-3 lg:px-4' : 'max-w-7xl mx-auto px-3 sm:px-5 lg:px-6'}`}>
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
            onSaveRoutine={setRoutine}
            onGenerate={() => setActiveTab('schedule')}
          />
        )}

        {activeTab === 'exam' && (
          <ExamPlanner
            routine={routine}
            careType={currentCareType}
            onUpdateRoutine={setRoutine}
            onNavigateToSchedule={() => setActiveTab('schedule')}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardStats
            subjects={routine.subjects}
            careType={currentCareType}
          />
        )}
      </main>

      {/* Modals */}
      <CareTypeSelector
        isOpen={isCareModalOpen}
        onClose={() => setIsCareModalOpen(false)}
        currentCareType={currentCareType}
        onSelectCareType={setCurrentCareType}
      />

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
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setIsManualModalOpen(false);
        }}
        onOpenCareModal={() => {
          setIsManualModalOpen(false);
          setIsCareModalOpen(true);
        }}
        onOpenConditionCheck={() => {
          setIsManualModalOpen(false);
          setIsConditionModalOpen(true);
        }}
      />
    </div>
  );
}

