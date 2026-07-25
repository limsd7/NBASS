import React, { useState, useEffect } from 'react';
import { StudentInfo, AssessmentResult, SleepRecord, SleepGoal } from '../../types';
import { DatabaseService } from '../../services/database';
import { SleepInputModal } from './SleepInputModal';
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
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
    const newRecord: SleepRecord = {
      ...recordData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };
    await DatabaseService.addSleepRecord(newRecord);
    await loadData();
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
          
          <div className="flex gap-2">
            <button 
              onClick={() => setIsManualModalOpen(true)}
              className="px-4 py-2 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-white border border-slate-200 dark:border-slate-600 rounded-xl font-medium shadow-sm transition-colors flex items-center gap-2"
            >
              <span>📖</span> 사용매뉴얼
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors shadow-sm flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              수면 기록
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
                />
              )}
              {activeTab === 'goals' && (
                <SleepGoalSetting 
                  student={student}
                  currentAssessment={currentAssessment}
                  goal={goal}
                  onSaveGoal={handleSaveGoal}
                />
              )}
              {activeTab === 'simulation' && (
                <PaywallOverlay currentTier={membershipTier || (student.membershipTier as MembershipTier) || 'free'} requiredFeature="sleep_analysis">
                <SleepSimulationView 
                  records={records}
                  goal={goal}
                  student={student}
                  aiModels={aiModels}
                />
                </PaywallOverlay>
              )}
              {activeTab === 'analysis' && (
                <PaywallOverlay currentTier={membershipTier || (student.membershipTier as MembershipTier) || 'free'} requiredFeature="sleep_analysis">
                <SleepAnalysisView 
                  records={records}
                  currentAssessment={currentAssessment}
                  aiModels={aiModels}
                />
                </PaywallOverlay>
              )}
            </div>
          )}
        </div>
      </main>

      <SleepInputModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveRecord}
        studentId={student.id}
      />

      <SleepManualModal 
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
      />
    </div>
  );
};
