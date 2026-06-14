
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { StudentWindow } from './components/StudentView';
import { BreathingGuidePage } from './components/guides/BreathingGuidePage';
import { StudyEfficiencyProvider } from './contexts/StudyEfficiencyContext';


/**
 * 라우팅 핸들러
 * - /student?sessionId=xxx -> StudentWindow (학생용 창)
 * - 그 외 -> App (관리자/메인 창)
 */
const AppRouter: React.FC = () => {
  const path = window.location.pathname;
  const params = new URLSearchParams(window.location.search);

  // 학생 창 라우트
  if (path === '/student' || path === '/student/') {
    return <StudentWindow />;
  }

  // 호흡 가이드 라우트 (새 창)
  if (path === '/breathing' || path === '/breathing/') {
    return <BreathingGuidePage />;
  }

  // 기본: 관리자/메인 앱
  return <App />;
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <StudyEfficiencyProvider>
      <AppRouter />
    </StudyEfficiencyProvider>
  </React.StrictMode>
);
