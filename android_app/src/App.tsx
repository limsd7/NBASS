import React, { useState, useEffect } from 'react';
import { UserProfile, MobileAssessmentResult } from './types';
import { authService } from './services/authService';
import { dataSyncService } from './services/dataSyncService';
import { startSupabaseRealtime, stopSupabaseRealtime, pullSupabaseToLocal } from './services/supabaseRealtime';
import { Header } from './components/navigation/Header';
import { BottomNav } from './components/navigation/BottomNav';
import { NavRail, NavTab } from './components/navigation/NavRail';
import { LoginPage } from './pages/LoginPage';
import { ResultDashboard } from './pages/ResultDashboard';
import { AssessmentPage } from './pages/AssessmentPage';
import { GradePage } from './pages/GradePage';
import { SleepMentalPage } from './pages/SleepMentalPage';
import { SchedulePage } from './pages/SchedulePage';
import { HabitClinicPage } from './pages/HabitClinicPage';
import { WrongNotesPage } from './pages/WrongNotesPage';
import { SubjectClinicPage } from './pages/SubjectClinicPage';
import { ParentDashboardPage } from './pages/ParentDashboardPage';
import { LockedFeature } from './components/tiered-features/LockedFeature';
import { canUseFeature, type FeatureKey } from './services/featureGate';

export const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(() => authService.getCurrentUser());
  const [activeTab, setActiveTab] = useState<NavTab>('result');
  const [parentChildId, setParentChildId] = useState<string | null>(null);

  // 사용자 로그인 시 클라우드 자동 동기화
  useEffect(() => {
    if (user?.studentId) {
      dataSyncService.syncAllFromCloud(user.studentId).catch(() => {});
    }
  }, [user?.studentId]);

  // PC ↔ Android 통합 Realtime 동기화: 로그인 상태에서 구독 + 초기 Pull 1회
  useEffect(() => {
    const studentId = user?.studentId;
    if (!studentId) {
      stopSupabaseRealtime();
      return;
    }
    pullSupabaseToLocal(studentId).catch(() => undefined);
    const stop = startSupabaseRealtime(studentId);
    const handleOnline = () => {
      pullSupabaseToLocal(studentId).catch(() => undefined);
    };
    // PC 오너 등급 변경 수신 시 유저 상태 즉시 갱신 (뱃지·게이트 실시간 반영)
    const handleTierEvent = (e: Event) => {
      try {
        const t = (e as CustomEvent)?.detail?.type;
        if (t === 'tier' || t === 'remote') {
          setUser(authService.getCurrentUser());
        }
      } catch { /* ignore */ }
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('nbass_data_updated', handleTierEvent);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('nbass_data_updated', handleTierEvent);
      try {
        stop();
      } catch {
        /* ignore */
      }
    };
  }, [user?.studentId]);

  const handleLoginSuccess = (loggedInUser: UserProfile) => {
    setUser(loggedInUser);
    setActiveTab('result');
  };

  const handleUserUpdated = (updatedUser: UserProfile) => {
    setUser(updatedUser);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  const handleUpgradeClick = () => {
    alert('PRO 1회 이용권(₩24,900)과 월 정기권(₩19,900) 온라인 결제는 준비 중입니다. 이용을 원하시면 PC 오너에게 등급 승인을 요청하세요.');
  };

  // 요금제 게이트: 무료=리포트 열람만, 1회권=상세 리포트 열람만, 정기결제=전체 사용
  const assessmentCount = user ? dataSyncService.countAssessments(user.studentId) : 0;
  const gatedPage = (
    feature: FeatureKey,
    title: string,
    description: string,
    page: React.ReactNode,
    exhaustedFree?: boolean
  ) =>
    user && canUseFeature(user.tier, feature, { assessmentCount })
      ? page
      : (
        <LockedFeature
          title={title}
          description={description}
          exhaustedFree={exhaustedFree}
          onUpgradeClick={handleUpgradeClick}
        />
      );

  const handleAssessmentComplete = (result: MobileAssessmentResult) => {
    if (user) {
      const updated: UserProfile = {
        ...user,
        careType: result.careType,
        careTypeName: result.careTypeName,
        name: result.student.name || user.name,
        school: result.student.school || user.school,
        grade: result.student.grade || user.grade,
        targetUniversity: result.student.targetUniversity || user.targetUniversity,
        targetMajor: result.student.targetMajor || user.targetMajor
      };
      authService.saveProfile(updated);
      setUser(updated);
    }
    setActiveTab('result');
  };

  // 비로그인 상태일 때
  if (!user) {
    if (parentChildId !== null) {
      return <ParentDashboardPage initialChildId={parentChildId} onExit={() => setParentChildId(null)} />;
    }

    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onParentMode={() => setParentChildId('')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900 select-none">
      {/* 1. Tablet Sidebar Navigation Rail (>= 768px) */}
      <NavRail
        activeTab={activeTab}
        onTabChange={setActiveTab}
        user={user}
        onLogout={handleLogout}
        onTierClick={handleUpgradeClick}
        onCoffeeClick={() => alert('HL 커피는 오전 기상 직후 또는 공부 시작 30분 전 500ml 시원한 물에 희석해 마시면 전두엽 혈류가 2.4배 가속됩니다.')}
      />

      {/* 2. Main Content Wrapper */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        {/* Mobile Header (Phone only < 768px) */}
        <div className="md:hidden">
          <Header
            user={user}
            onUserUpdated={handleUserUpdated}
            onLogout={handleLogout}
          />
        </div>

        {/* Main Content Pages */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'result' && (
            <ResultDashboard
              user={user}
              onUpgradeClick={handleUpgradeClick}
              onStartAssessment={() => setActiveTab('assessment')}
            />
          )}

          {activeTab === 'assessment' && gatedPage(
            'assessment',
            '정밀 진단 검사',
            user.tier === 'free'
              ? '무료 1회 진단을 모두 사용하면 추가 진단은 정기결제 후 이용 가능합니다.'
              : '정밀 진단은 정기결제 회원부터 이용할 수 있습니다. 1회권은 리포트 열람 전용입니다.',
            <AssessmentPage
              user={user}
              onComplete={handleAssessmentComplete}
              onCancel={() => setActiveTab('result')}
            />,
            user.tier === 'free' && assessmentCount > 0
          )}

          {activeTab === 'subjectClinic' && gatedPage(
            'clinic',
            '과목 클리닉',
            '과목 클리닉은 정기결제(PREMIUM 이상) 회원부터 이용할 수 있습니다.',
            <SubjectClinicPage
              user={user}
              onUpgradeClick={handleUpgradeClick}
              onNavigateToWrongNotes={() => setActiveTab('wrongNotes')}
            />
          )}

          {activeTab === 'grade' && gatedPage(
            'grade',
            '성적 관리',
            '성적 기록·추이·시뮬레이션은 정기결제(PREMIUM 이상) 회원부터 이용할 수 있습니다.',
            <GradePage
              user={user}
              onUpgradeClick={handleUpgradeClick}
              onNavigateToSubjectClinic={() => setActiveTab('subjectClinic')}
            />
          )}

          {activeTab === 'sleep' && gatedPage(
            'sleep',
            '수면 & 멘탈 케어',
            '수면 기록·호흡·사운드·목표 관리는 정기결제(PREMIUM 이상) 회원부터 이용할 수 있습니다.',
            <SleepMentalPage
              user={user}
              onUpgradeClick={handleUpgradeClick}
            />
          )}

          {activeTab === 'schedule' && gatedPage(
            'schedule',
            '스마트 스케줄',
            '스케줄·뽀모도로·EXP 관리는 정기결제(PREMIUM 이상) 회원부터 이용할 수 있습니다.',
            <SchedulePage
              user={user}
              onUpgradeClick={handleUpgradeClick}
            />
          )}

          {activeTab === 'habit' && gatedPage(
            'habit',
            '습관 클리닉',
            '습관 진단·교정 프로토콜은 정기결제(PREMIUM 이상) 회원부터 이용할 수 있습니다.',
            <HabitClinicPage
              user={user}
              onUpgradeClick={handleUpgradeClick}
            />
          )}

          {activeTab === 'wrongNotes' && gatedPage(
            'wrongNotes',
            '오답노트',
            '오답 촬영·처방·복습 퀴즈는 정기결제(PREMIUM 이상) 회원부터 이용할 수 있습니다.',
            <WrongNotesPage
              user={user}
              onUpgradeClick={handleUpgradeClick}
            />
          )}
        </main>

        {/* Mobile Bottom Navigation (Phone only < 768px) */}
        <BottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>
    </div>
  );
};

export default App;
