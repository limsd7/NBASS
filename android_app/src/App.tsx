import React, { useState } from 'react';
import { UserProfile } from './types';
import { authService } from './services/authService';
import { Header } from './components/navigation/Header';
import { BottomNav, NavTab } from './components/navigation/BottomNav';
import { LoginPage } from './pages/LoginPage';
import { ResultDashboard } from './pages/ResultDashboard';
import { HabitClinicPage } from './pages/HabitClinicPage';
import { SchedulePage } from './pages/SchedulePage';
import { WrongNotesPage } from './pages/WrongNotesPage';
import { GradeAndSleepPage } from './pages/GradeAndSleepPage';

export const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(() => authService.getCurrentUser());
  const [activeTab, setActiveTab] = useState<NavTab>('result');

  const handleLoginSuccess = (loggedInUser: UserProfile) => {
    setUser(loggedInUser);
    setActiveTab('result');
  };

  const handleUserUpdated = (updatedUser: UserProfile) => {
    setUser(updatedUser);
  };

  const handleUpgradeClick = () => {
    alert('상단 헤더의 내 등급 뱃지를 터치하여 원하시는 등급(PRO, PREMIUM, PLUS+, VIP)으로 즉시 전환해보세요!');
  };

  if (!user) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 select-none">
      {/* Top Mobile Header (HL Coffee 팝업 & 등급 스위처 내장) */}
      <Header
        user={user}
        onUserUpdated={handleUserUpdated}
      />

      {/* Main Content Area (5 Core Tabs) */}
      <main className="flex-1 overflow-y-auto">
        {activeTab === 'result' && (
          <ResultDashboard user={user} onUpgradeClick={handleUpgradeClick} />
        )}
        {activeTab === 'habit' && (
          <HabitClinicPage user={user} onUpgradeClick={handleUpgradeClick} />
        )}
        {activeTab === 'schedule' && (
          <SchedulePage user={user} onUpgradeClick={handleUpgradeClick} />
        )}
        {activeTab === 'wrongNotes' && (
          <WrongNotesPage user={user} onUpgradeClick={handleUpgradeClick} />
        )}
        {activeTab === 'more' && (
          <GradeAndSleepPage user={user} onUpgradeClick={handleUpgradeClick} />
        )}
      </main>

      {/* Bottom 5-Tab Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
};

export default App;
