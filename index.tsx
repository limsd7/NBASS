
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { StudentWindow } from './components/StudentView';
import { BreathingGuidePage } from './components/guides/BreathingGuidePage';
import { StudyEfficiencyProvider } from './contexts/StudyEfficiencyContext';
import { PomodoroTimer } from './components/PomodoroTimer';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { LazyLoadingFallback } from './components/common/LazyLoadingFallback';
import { runEngineSelfChecks } from './services/engineSelfCheck';
import { sessionManager } from './utils/sessionManager';

// 브라우저 재시작 시 자동 로그아웃을 위해 세션 유효성 검증
sessionManager.initSession();

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
      {/* 지연 로딩(React.lazy)되는 화면 청크를 기다리는 동안 공통 폴백을 표시합니다. */}
      <Suspense fallback={<LazyLoadingFallback />}>
        {element}
      </Suspense>
      <PomodoroTimer />
    </>
  );
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

// [P2-16] 개발 모드에서만 핵심 엔진 자기검증을 실행하여 회귀를 조기에 감지합니다.
if (import.meta.env.DEV) {
  const selfCheck = runEngineSelfChecks();
  if (!selfCheck.passed) {
    console.warn('[EngineSelfCheck] 실패:', selfCheck.failures);
  } else {
    console.log(`[EngineSelfCheck] ${selfCheck.checked}개 불변식 통과`);
  }
}

root.render(
  <React.StrictMode>
    <ErrorBoundary componentName="ApplicationRoot">
      <StudyEfficiencyProvider>
        <AppRouter />
      </StudyEfficiencyProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
