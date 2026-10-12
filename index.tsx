
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

import { initialStudent } from './utils/constants';
import { StudentInfo, AIModelConfig } from './types';

const KoreanClinicApp = React.lazy(() => import('./components/subject-apps/KoreanClinicApp').then(m => ({ default: m.KoreanClinicApp })));
const MathClinicApp = React.lazy(() => import('./components/subject-apps/MathClinicApp').then(m => ({ default: m.MathClinicApp })));
const EnglishClinicApp = React.lazy(() => import('./components/subject-apps/EnglishClinicApp').then(m => ({ default: m.EnglishClinicApp })));

const StandaloneKoreanClinicWrapper: React.FC = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const sTag = searchParams.get('strategyTag') || undefined;
  const sType = (searchParams.get('strategyType') as any) || 'grade_strategy';
  const cGrade = parseInt(searchParams.get('currentGrade') || '2', 10);
  const tGrade = parseInt(searchParams.get('targetGrade') || '1', 10);

  let student: StudentInfo = initialStudent;
  try {
    const raw = localStorage.getItem('nbass_student_profile') || localStorage.getItem('sn1_student');
    if (raw) student = { ...initialStudent, ...JSON.parse(raw) };
  } catch {}

  let aiConfig: AIModelConfig | null = null;
  try {
    const raw = localStorage.getItem('nbass_ai_models');
    if (raw) aiConfig = JSON.parse(raw);
  } catch {}

  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-bold">국어 AI 클리닉 로딩 중...</div>}>
      <KoreanClinicApp
        student={student}
        aiConfig={aiConfig}
        initialStrategyTag={sTag}
        initialStrategyType={sType}
        currentGrade={cGrade}
        targetGrade={tGrade}
        onClose={() => window.close()}
        isStandalone={true}
      />
    </Suspense>
  );
};

const StandaloneMathClinicWrapper: React.FC = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const sTag = searchParams.get('strategyTag') || undefined;
  const sType = (searchParams.get('strategyType') as any) || 'grade_strategy';
  const cGrade = parseInt(searchParams.get('currentGrade') || '3', 10);
  const tGrade = parseInt(searchParams.get('targetGrade') || '1', 10);

  let student: StudentInfo = initialStudent;
  try {
    const raw = localStorage.getItem('nbass_student_profile') || localStorage.getItem('sn1_student');
    if (raw) student = { ...initialStudent, ...JSON.parse(raw) };
  } catch {}

  let aiConfig: AIModelConfig | null = null;
  try {
    const raw = localStorage.getItem('nbass_ai_models');
    if (raw) aiConfig = JSON.parse(raw);
  } catch {}

  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-bold">수학 AI 클리닉 로딩 중...</div>}>
      <MathClinicApp
        student={student}
        aiConfig={aiConfig}
        initialStrategyTag={sTag}
        initialStrategyType={sType}
        currentGrade={cGrade}
        targetGrade={tGrade}
        onClose={() => window.close()}
        isStandalone={true}
      />
    </Suspense>
  );
};

const StandaloneEnglishClinicWrapper: React.FC = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const sTag = searchParams.get('strategyTag') || undefined;
  const sType = (searchParams.get('strategyType') as any) || 'grade_strategy';
  const cGrade = parseInt(searchParams.get('currentGrade') || '2', 10);
  const tGrade = parseInt(searchParams.get('targetGrade') || '1', 10);

  let student: StudentInfo = initialStudent;
  try {
    const raw = localStorage.getItem('nbass_student_profile') || localStorage.getItem('sn1_student');
    if (raw) student = { ...initialStudent, ...JSON.parse(raw) };
  } catch {}

  let aiConfig: AIModelConfig | null = null;
  try {
    const raw = localStorage.getItem('nbass_ai_models');
    if (raw) aiConfig = JSON.parse(raw);
  } catch {}

  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-bold">영어 AI 클리닉 로딩 중...</div>}>
      <EnglishClinicApp
        student={student}
        aiConfig={aiConfig}
        initialStrategyTag={sTag}
        initialStrategyType={sType}
        currentGrade={cGrade}
        targetGrade={tGrade}
        onClose={() => window.close()}
        isStandalone={true}
      />
    </Suspense>
  );
};

// 브라우저 재시작 시 자동 로그아웃을 위해 세션 유효성 검증
sessionManager.initSession();

/**
 * 라우팅 핸들러
 * - ?app=korean_clinic -> StandaloneKoreanClinicWrapper (독립 국어 앱)
 * - ?app=math_clinic -> StandaloneMathClinicWrapper (독립 수학 앱)
 * - ?app=english_clinic -> StandaloneEnglishClinicWrapper (독립 영어 앱)
 * - /student?sessionId=xxx -> StudentWindow (학생용 창)
 * - 그 외 -> App (관리자/메인 창)
 */
const AppRouter: React.FC = () => {
  const path = window.location.pathname;
  const params = new URLSearchParams(window.location.search);

  // 라우트 렌더링
  if (params.get('app') === 'korean_clinic') {
    return <StandaloneKoreanClinicWrapper />;
  }
  if (params.get('app') === 'math_clinic') {
    return <StandaloneMathClinicWrapper />;
  }
  if (params.get('app') === 'english_clinic') {
    return <StandaloneEnglishClinicWrapper />;
  }

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

// Vite HMR 시 중복 createRoot 호출 경고 방지 (기존 root 재활용)
const globalWindow = window as unknown as { __nbass_root?: ReactDOM.Root };
const root = globalWindow.__nbass_root ?? (globalWindow.__nbass_root = ReactDOM.createRoot(rootElement));

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
