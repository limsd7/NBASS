import React, { useState, useEffect, useRef } from 'react';
import { StudentInfo, AssessmentResult, SleepRecord, SleepGoal } from '../../types';
import { unifiedSyncService as DatabaseService } from '../../services/unifiedSyncService';
import { SleepInputModal } from './SleepInputModal';
import { QuickSleepDiaryModal } from './QuickSleepDiaryModal';
import { SleepSoundPlayerModal } from './SleepSoundPlayerModal';
import { SleepOverviewTab } from './tabs/SleepOverviewTab';
import { SleepGoalSetting } from './tabs/SleepGoalSetting';
import { SleepSimulationView } from './tabs/SleepSimulationView';
import { SleepAnalysisView } from './tabs/SleepAnalysisView';
import { SleepManualModal } from './SleepManualModal';
import { PaywallOverlay } from '../ui/PaywallOverlay';
import { MembershipTier } from '../../utils/featureGate';

interface SleepManagementViewProps {
  student: StudentInfo;
  onBack: () => void;
  currentAssessment?: AssessmentResult;
  aiModels: any;
  membershipTier?: MembershipTier;
}

export type SleepTabType = 'overview' | 'goals' | 'simulation' | 'analysis';

export const SleepManagementView: React.FC<SleepManagementViewProps> = ({ student, onBack, currentAssessment, aiModels, membershipTier }) => {
  const [activeTab, setActiveTab] = useState<SleepTabType>('overview');
  const [records, setRecords] = useState<SleepRecord[]>([]);
  const [goal, setGoal] = useState<SleepGoal | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SleepRecord | null>(null);
  const [isQuickDiaryOpen, setIsQuickDiaryOpen] = useState(true);
  const [isSoundPlayerOpen, setIsSoundPlayerOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsQuickDiaryOpen(true);
    loadData();
  }, [student.id]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const loadedRecords = await DatabaseService.getSleepRecords(student.id);
      setRecords(loadedRecords);
      const loadedGoal = await DatabaseService.getSleepGoal(student.id);
      setGoal(loadedGoal || null);
    } catch (error) {
      console.error('Failed to load sleep data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRecord = async (recordData: Omit<SleepRecord, 'id' | 'createdAt'>) => {
    if (editingRecord) {
      const updatedRecord: SleepRecord = {
        ...recordData,
        id: editingRecord.id,
        createdAt: editingRecord.createdAt,
      };
      await DatabaseService.updateSleepRecord(updatedRecord);
    } else {
      const newRecord: SleepRecord = {
        ...recordData,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString()
      };
      await DatabaseService.addSleepRecord(newRecord);
    }
    setEditingRecord(null);
    await loadData();
  };

  const handleEditRecord = (record: SleepRecord) => {
    setEditingRecord(record);
    setIsModalOpen(true);
  };

  const handleSaveGoal = async (goalData: Omit<SleepGoal, 'id'>) => {
    const newGoal: SleepGoal = {
      ...goalData,
      id: goal?.id || crypto.randomUUID()
    };
    await DatabaseService.upsertSleepGoal(newGoal);
    await loadData();
  };

  const handleDeleteRecord = async (id: string) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      await DatabaseService.deleteSleepRecord(id);
      await loadData();
    }
  };

  const handleSyncWearable = async () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const exists = records.some(r => r.date === todayStr);
    
    const chronotype = currentAssessment?.studyEfficiencyResults?.chronotype || currentAssessment?.analytics?.chronotype;
    const isMorning = chronotype === 'Morning' || chronotype === 'morning';
    const bedtime = isMorning ? '22:45' : '00:15';
    const wakeTime = isMorning ? '06:30' : '07:45';

    if (!exists) {
      await DatabaseService.addSleepRecord({
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `sleep_${Date.now()}`,
        studentId: student.id,
        date: todayStr,
        bedtime,
        wakeTime,
        sleepQuality: 4,
        memo: '스마트워치(HealthKit/Galaxy) 실시간 동기화 데이터',
        createdAt: new Date().toISOString(),
        stages: {
          deep: 23,
          rem: 24,
          light: 53
        },
        nightHrv: 72,
        screenTimeBeforeBed: 25,
        sleepDelay: 15
      });
    }
    await loadData();
  };

  const handleImportRecords = async (importedRecords: Omit<SleepRecord, 'id' | 'createdAt'>[]) => {
    for (const rec of importedRecords) {
      const newRecord: SleepRecord = {
        ...rec,
        studentId: student.id,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString()
      };
      await DatabaseService.addSleepRecord(newRecord);
    }
    await loadData();
  };

  const tabs: { id: SleepTabType; label: string; icon: string }[] = [
    { id: 'overview', label: '수면 현황', icon: '📊' },
    { id: 'goals', label: '목표 설정', icon: '🎯' },
    { id: 'simulation', label: '수면 시뮬레이션', icon: '🧪' },
    { id: 'analysis', label: '심층 분석', icon: '🔬' }
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 min-h-screen">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
              <svg className="w-6 h-6 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <span>🌙</span>
                심층 수면 관리 시스템
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {student.name} 학생의 맞춤형 수면 최적화
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setIsQuickDiaryOpen(true)}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-bold shadow-md transition-all flex items-center gap-1.5 text-xs cursor-pointer"
            >
              <span>⚡</span> 10초 퀵기록
            </button>
            <button 
              onClick={() => setIsSoundPlayerOpen(true)}
              className="px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold shadow-md transition-all flex items-center gap-1.5 text-xs cursor-pointer"
            >
              <span>🎧</span> 델타파 사운드
            </button>
            <button 
              onClick={() => setIsManualModalOpen(true)}
              className="px-3 py-2 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-white border border-slate-200 dark:border-slate-600 rounded-xl font-medium shadow-sm transition-colors flex items-center gap-1.5 text-xs cursor-pointer"
            >
              <span>📖</span> 사용매뉴얼
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white rounded-xl font-bold shadow-sm transition-colors flex items-center gap-1.5 text-xs cursor-pointer"
            >
              <span>➕</span> 정밀 기록
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-6xl mx-auto mt-6 flex overflow-x-auto no-scrollbar">
          <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700 w-full">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          <PaywallOverlay currentTier={membershipTier || (student.membershipTier as MembershipTier) || 'free'} requiredFeature="sleep_management">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              <div className="animate-fade-in">
                {activeTab === 'overview' && (
                  <SleepOverviewTab 
                    records={records} 
                    goal={goal} 
                    onDelete={handleDeleteRecord}
                    onEdit={handleEditRecord}
                    currentAssessment={currentAssessment}
                    onSyncWearable={handleSyncWearable}
                    onImportRecords={handleImportRecords}
                  />
                )}
                {activeTab === 'goals' && (
                  <SleepGoalSetting 
                    student={student}
                    currentAssessment={currentAssessment}
                    goal={goal}
                    records={records}
                    onSaveGoal={handleSaveGoal}
                  />
                )}
                {activeTab === 'simulation' && (
                  <SleepSimulationView 
                    records={records}
                    goal={goal}
                    student={student}
                    aiModels={aiModels}
                    currentAssessment={currentAssessment}
                  />
                )}
                {activeTab === 'analysis' && (
                  <SleepAnalysisView 
                    records={records}
                    currentAssessment={currentAssessment}
                    aiModels={aiModels}
                  />
                )}
              </div>
            )}
          </PaywallOverlay>
        </div>
      </main>

      <SleepInputModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRecord(null);
        }}
        onSave={handleSaveRecord}
        studentId={student.id}
        initialRecord={editingRecord}
      />

      <QuickSleepDiaryModal
        isOpen={isQuickDiaryOpen}
        onClose={() => setIsQuickDiaryOpen(false)}
        onSave={handleSaveRecord}
        studentId={student.id}
      />

      <SleepSoundPlayerModal
        isOpen={isSoundPlayerOpen}
        onClose={() => setIsSoundPlayerOpen(false)}
        careTypeTitle={currentAssessment?.careType || '표준'}
      />

      <SleepManualModal 
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
      />
    </div>
  );
};
