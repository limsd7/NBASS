
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { StudentWindow } from './components/StudentView';
import { BreathingGuidePage } from './components/guides/BreathingGuidePage';
import { StudyEfficiencyProvider } from './contexts/StudyEfficiencyContext';
import { PomodoroTimer } from './components/PomodoroTimer';


/**
 * 라우팅 핸들러
 * - /student?sessionId=xxx -> StudentWindow (학생용 창)
 * - 그 외 -> App (관리자/메인 창)
 */
const AppRouter: React.FC = () => {
  const path = window.location.pathname;
  const params = new URLSearchParams(window.location.search);

  // 라우트 렌더링
  let element = <App />;
  if (path === '/student' || path === '/student/') {
    element = <StudentWindow />;
  } else if (path === '/breathing' || path === '/breathing/') {
    element = <BreathingGuidePage />;
  }

  return (
    <>
      {element}
      <PomodoroTimer />
    </>
  );
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
