
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { AffiliatedAcademyService } from './services/affiliatedAcademyService';
import { Layout } from './components/Layout';
import { DashboardView, HistoryView, ResourcesView, ProgressView } from './components/MenuViews';
import { AdminExpertiseView } from './components/AdminExpertiseView';
import { ExpertOverlay } from './components/ExpertOverlay';
import { PrescriptionZenMode } from './components/PrescriptionZenMode';
import { BalanceChart, VitalityBarChart, RRVPhasePlot, StressGaugeChart, TrendChart } from './components/Charts';
import { BreathingGuide } from './components/BreathingGuide';
import { NeuroInsightReport } from './components/NeuroInsightReport';
import { PRODUCTS } from './data/products';
import { DEFAULT_STRATEGIES } from './data/strategies';
import { SUBJECT_OPTIONS_MAP, StrategyOption } from './data/subjectOptions';
import { CareType, HRVData, SurveyData, ProtocolData, LearningAnalyticsData, AssessmentResult, StudentInfo, StrategyMap, Prescription, BloodTestData, PortableHRVData, ANSBalanceType, getStressLevel, STRESS_LEVEL_DESCRIPTIONS, ANS_BALANCE_DESCRIPTIONS, BrainBodyState, SubjectPriorities } from './types';
import { SOLUTIONS } from './constants';
import { generateClinicalAnalysis } from './services/clinicalEngine';
import { evaluateBrainBodyCoherence } from './services/brainBodyEngine';
import { runFinalAssessment } from './services/finalAssessmentService';
import { unifiedSyncService } from './services/unifiedSyncService';
import { DETAILED_INSIGHTS } from './data/detailedInsights';
import { generateStudyEfficiencyAnalysis } from './services/simulationEngine';
import { generateAISchedule, ScheduleItem } from './services/schedulingEngine';
import { generatePrediction } from './services/predictionEngine';
import { PredictionReport } from './components/PredictionReport';
import { ConsultantTabs } from './components/ConsultantTabs';
// 코드 분할(React.lazy): 무거운 화면 컴포넌트는 실제 표시 시점에 지연 로딩합니다.
// (관리 화면 3종은 components/AppShell/AppManagementRoutes 에서 지연 로딩됩니다.)
const SleepManagementView = React.lazy(() => import('./components/sleep-management/SleepManagementView').then((m) => ({ default: m.SleepManagementView })));
const StressCareLabView = React.lazy(() => import('./components/StressCareLabView').then((m) => ({ default: m.StressCareLabView })));
const ScheduleManagementView = React.lazy(() => import('./components/schedule-management/ScheduleManagementView').then((m) => ({ default: m.ScheduleManagementView })));
import { MENTAL_PRESCRIPTIONS } from './data/prescriptions';
import { SUNEUNG_SUBJECTS } from './data/suneungSubjects';
import { getLearningExplanation, getLearningRecommendations, CARETYPE_SPECIFIC_RECOMMENDATIONS } from './data/learningAnalyticsInsights';
import { PomodoroTimer } from './components/PomodoroTimer';
import { DatabaseService } from './services/database';
import { WrongNotes } from './components/WrongNotes';
import { WrongNote } from './types';
import {
  BAI_QUESTIONS,
  ISI_QUESTIONS,
  FATIGUE_SYMPTOMS,
  SYMPATHETIC_SYMPTOMS,
  PARASYMPATHETIC_SYMPTOMS,
  CONCENTRATION_QUESTIONS,
  ADRENAL_QUESTIONS
} from './data/questions';

import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// New optimized imports
import { useDarkMode } from './hooks/useDarkMode';
import { persistStudentProfile, resolveStudentProfile } from './hooks/useStudentProfile';
import { useNavigationGuard } from './hooks/useNavigationGuard';
import { useAssessmentMode } from './hooks/useAssessmentMode';
import { useSurveyState } from './hooks/useSurveyState';
import { useAppConfigState } from './hooks/useAppConfigState';
import { AppEmptyState } from './components/AppShell/AppEmptyState';
import { AppConsultationLetterModal } from './components/AppShell/AppConsultationLetterModal';
import { AppLicenseGate } from './components/AppShell/AppLicenseGate';
import { AppManagementRoutes } from './components/AppShell/AppManagementRoutes';
import { mergeStudyEfficiencyIntoResult } from './components/AppShell/AppGlobalOverlays';
import { AppGlobalOverlays } from './components/AppShell/AppGlobalOverlays';

import { useAssessmentDraft } from './hooks/useAssessmentDraft'; // [NEW] Autosave Hook
import { AdminPasswordModal } from './components/modals/AdminPasswordModal';
const StudentDirectoryView = React.lazy(() => import('./components/dashboards/StudentDirectoryView').then((m) => ({ default: m.StudentDirectoryView })));
const ParentDirectoryView = React.lazy(() => import('./components/dashboards/ParentDirectoryView').then((m) => ({ default: m.ParentDirectoryView })));
import { DataEditorModal } from './components/modals/DataEditorModal';
// Step components
import { SurveysStep } from './components/steps/SurveysStep';
import { ProtocolStep } from './components/steps/ProtocolStep';
import { AnalyticsStep } from './components/steps/AnalyticsStep';
import { StudyEfficiencyStep } from './components/steps/StudyEfficiencyStep';
const CognitivePerformanceStep = React.lazy(() => import('./components/steps/CognitivePerformanceStep').then((m) => ({ default: m.CognitivePerformanceStep })));
import { WorkingMemoryStep } from './components/steps/WorkingMemoryStep';
const ResultsView = React.lazy(() => import('./components/steps/ResultsView').then((m) => ({ default: m.ResultsView })));
import { AIChatbotWidget } from './components/common/AIChatbotWidget';
import { RoleSelectionView } from './components/RoleSelectionView';
const ParentDashboard = React.lazy(() => import('./components/dashboards/ParentDashboard').then((m) => ({ default: m.ParentDashboard })));
const ExpertDashboard = React.lazy(() => import('./components/dashboards/ExpertDashboard').then((m) => ({ default: m.ExpertDashboard })));
const OwnerDashboardView = React.lazy(() => import('./components/dashboards/OwnerDashboardView').then((m) => ({ default: m.OwnerDashboardView })));
import { AuthLoginModal, UserRole } from './components/modals/AuthLoginModal';
import { IncompleteAssessmentModal } from './components/modals/IncompleteAssessmentModal';
import { TargetedFollowUpModal } from './components/modals/TargetedFollowUpModal';
import { FollowUpDeltaReportModal } from './components/modals/FollowUpDeltaReportModal';
import { FollowUpDeltaReport } from './services/followUpAssessmentService';

import { CognitivePerformanceResults } from './components/CognitivePerformanceAssessment';
import { StepProgressBar } from './components/ui/StepProgressBar';
import { analyzeMedicalData, generateMedicalReportSection } from './services/medicalEngine';
import {
  generateSerialID,
  getTodayStr,
  calculateAge,
  calculateBMI,
  estimateGradeByAgeOrBirthDate,
  normalizeGrade,
  GRADE_OPTIONS,
  LOCATION_OPTIONS,
  getNoiseDescription,
  getStressDescription,
  initialStudent as defaultStudent,
  initialHRV,
  initialProtocol,
  initialAnalytics
} from './utils/constants';
import { generateConsultationLetter } from './utils/consultationUtils';
import { printReport } from './utils/printUtils'; // Import Print Utility
import { DetailedAnalysisSection } from './components/DetailedAnalysisSection'; // Import New Component
import { TargetedNutritionRecommendation } from './components/TargetedNutritionRecommendation';
const HabitClinicView = React.lazy(() => import('./components/HabitClinicView').then((m) => ({ default: m.HabitClinicView })));
const GrowthTimelineView = React.lazy(() => import('./components/progress/GrowthTimelineView').then((m) => ({ default: m.GrowthTimelineView })));
import { LicenseActivation } from './components/ui/LicenseActivation';
import { MembershipBadge } from './components/ui/MembershipBadge';
import { LicenseInfo, getLicenseInfo, checkLicenseValidity } from './utils/licenseManager';
import { MembershipTier, TIER_INFO } from './utils/featureGate';
import { UserTierService } from './services/userTierService';

// Logic Engine Configuration
import {
  LogicEngineConfig,
  ClassificationRule,
  ProductRecommendationRule,
  SecretPointRule,
  loadLogicConfig,
  saveLogicConfig,
  resetLogicConfig,
  AVAILABLE_FIELDS,
  DEFAULT_LOGIC_CONFIG,
  evaluateClassificationRules,
  evaluateProductRules,
  evaluateSecretPointRules,
  evaluateClassificationWithScores,
  CARE_TYPE_LABELS
} from './logicEngine';
import { CARE_STRATEGIES } from './data/careStrategies';
import { loadProductRecommendations, saveProductRecommendations, resetProductRecommendations } from './data/productRecommendations';
import { loadPredictionRules, savePredictionRules, resetPredictionRules } from './data/predictionRules';
import { LogicSimulator } from './components/modals/LogicSimulator';
import { ConfigModal as ConfigModalComponent } from './components/modals/ConfigModal';
import { RuleEditor } from './components/modals/RuleEditor';
import { ProgressAnalytics } from './components/ProgressAnalytics';
import { WellnessPlayer } from './components/WellnessPlayer';
import { PsychologicalAssessment } from './components/PsychologicalAssessment';
import { StudyEfficiencyAssessment } from './components/StudyEfficiencyAssessment';
import { StudyEfficiencyResults, mapResultsToSurveyData, mapSurveyDataToResults } from './services/studyEfficiencyService';
import { useStudyEfficiency } from './contexts/StudyEfficiencyContext';
import {
  getChronotypeAdvice,
  getVARKAdvice,
  getTestAnxietyAdvice,
  getDigitalAddictionAdvice,
  getMetacognitionAdvice
} from './data/studyEfficiencyAdvice';
import {
  CHRONOTYPE_DESCRIPTIONS,
  VARK_DESCRIPTIONS,
  TAI_INTERVENTIONS,
  DIGITAL_DETOX_PROTOCOLS,
  METACOGNITION_RECOMMENDATIONS
} from './data/studyEfficiencyAssessments';

// Multi-Monitor Sync
import { useSyncAdmin } from './hooks/useSync';
// ... existing imports
import { NutritionalPrescriptionModal } from './components/modals/NutritionalPrescriptionModal';
import { HistoryAnalysisManager } from './components/HistoryAnalysisManager';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { safeStorage } from './utils/safeStorage';
import { sessionManager } from './utils/sessionManager';
import { evaluateAdminAccess, canAttemptAdminPortal } from './utils/adminAccess';
import { markFreeTrialUsed, FREE_TRIAL_UPGRADE_EVENT } from './services/freeTrialGate';
import { StudentSurveyBundle, ProtocolBundle, AnalyticsBundle } from './services/syncService';


import { calculateLearningTraits } from './data/learningTraitsData';
import { getBaiNorm, getIsiNorm } from './data/assessmentNorms';
import { computeReadiness } from './services/assessmentReadiness';
import { AssessmentReadinessNotice } from './components/common/AssessmentReadinessNotice';
import { SurveyTab, LearningTraitsData } from './types';
import { captureUtmFromUrl, logFunnelEvent, getStoredAttribution } from './utils/utmTracker';
import { ParentAssessmentFlow } from './components/steps/ParentAssessmentFlow';
import GapAnalysisReportView from './components/GapAnalysisReport';
import { ExamScheduleService } from './services/examScheduleService';

// Initialize with fresh ID
const initialStudent: StudentInfo = {
  ...defaultStudent,
  id: generateSerialID(),
  testDate: getTodayStr(),
  grade: '고등 3학년'
};


const App: React.FC = () => {
  const [step, setStep] = useState<'role_selection' | 'student_directory' | 'parent_directory' | 'parent_dashboard' | 'expert_dashboard' | 'owner_dashboard' | 'register' | 'surveys' | 'protocol' | 'analytics' | 'study_efficiency' | 'cognitive_test' | 'working_memory' | 'hrv' | 'eeg' | 'bloodtest' | 'loading' | 'results' | 'admin_expertise' | 'study_management' | 'grade_management' | 'sleep_management'>(() => {
    const params = new URLSearchParams(window.location.search);
    const stepParam = params.get('step');
    if (stepParam) return stepParam as any;
    return 'register'; // 일반 접속 시 수험생 진단(register)으로 즉시 진입
  });
  const [adminActionType, setAdminActionType] = useState<'config' | 'portal'>('portal');
  const [currentUserRole, setCurrentUserRole] = useState<UserRole | null>(() => {
    sessionManager.initSession();
    try {
      return (localStorage.getItem('nbass_current_role') as UserRole) || null;
    } catch {
      return null;
    }
  });
  const [authRoleModal, setAuthRoleModal] = useState<UserRole | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(() => {
    sessionManager.initSession();
    try {
      return localStorage.getItem('nbass_current_email') || null;
    } catch {
      return null;
    }
  });
  const [isProfileLoadedFromPrevious, setIsProfileLoadedFromPrevious] = useState<boolean>(false);
  // 학부모 관찰 진단 모드 (URL ?mode=parent 로 진입)
  const [isParentMode, setIsParentMode] = useState<boolean>(() => {
    try {
      return new URLSearchParams(window.location.search).get('mode') === 'parent';
    } catch {
      return false;
    }
  });
  // 자녀 초대 코드 (URL ?invite=XXXXXX 로 진입 시 갭 분석 활성화)
  const [childInviteCode] = useState<string>(() => {
    try {
      return new URLSearchParams(window.location.search).get('invite') || '';
    } catch {
      return '';
    }
  });
  const [showGapAnalysis, setShowGapAnalysis] = useState<boolean>(false);
  const [activeMenu, setActiveMenu] = useState<'dashboard' | 'assessment' | 'results' | 'schedule' | 'sleep' | 'grades' | 'history' | 'growth' | 'wrongnotes' | 'resources' | 'solutions' | 'progress' | 'habits'>('dashboard');
  // 오답노트 영구 저장 - 통합 동기화 경유 (services/unifiedSyncService 참조)
  const [wrongNotes, setWrongNotes] = useState<WrongNote[]>(() => unifiedSyncService.getWrongNotes<WrongNote>([]));
  useEffect(() => {
    unifiedSyncService.saveWrongNotes(wrongNotes);
  }, [wrongNotes]);
  const [activeTab, setActiveTab] = useState<SurveyTab>('ans');
  const [student, setStudent] = useState<StudentInfo>(initialStudent);
  const [hrv, setHrv] = useState<HRVData>(initialHRV);
  const [protocol, setProtocol] = useState<ProtocolData>(initialProtocol);
  const [analytics, setAnalytics] = useState<LearningAnalyticsData>(initialAnalytics);
  const [isCustomLoc, setIsCustomLoc] = useState(false);

  // 학생 프로필 영구 저장/불러오기 - 모듈 위임으로 슬림화 (상세 로직은 hooks/useStudentProfile 참조)
  const saveStudentProfile = useCallback((studentData: StudentInfo, email?: string | null) => {
    persistStudentProfile(studentData, email ?? currentUserEmail);
  }, [currentUserEmail]);

  // 학생 프로필 불러오기 함수 - 모듈 위임 (overrideName 전달 시 해당 이름을 우선 보존, overrideFields 전달 시 해당 필드 우선 반영)
  const loadStudentProfile = useCallback(async (
    email?: string | null,
    overrideName?: string | null,
    overrideFields?: Partial<StudentInfo> | null
  ) => {
    const cleanEmail = email?.trim().toLowerCase();
    const resolved = await resolveStudentProfile(cleanEmail);
    if (resolved) {
      const effectiveName = overrideName?.trim() || resolved.profile.name || (cleanEmail ? cleanEmail.split('@')[0] : '');
      setStudent(prev => ({
        ...prev,
        ...resolved.profile,
        ...(effectiveName ? { name: effectiveName } : {}),
        ...(overrideFields || {})
      } as StudentInfo));
      setIsProfileLoadedFromPrevious(resolved.isYearChanged);
      return true;
    } else if (overrideName || cleanEmail) {
      const effectiveName = overrideName?.trim() || (cleanEmail ? cleanEmail.split('@')[0] : '');
      setStudent(prev => ({
        ...prev,
        id: generateSerialID(),
        name: effectiveName,
        testDate: getTodayStr(),
        ...(overrideFields || {})
      }));
      setIsProfileLoadedFromPrevious(false);
      return true;
    }
    return false;
  }, []);

  // 앱 마운트 시 저장된 세션/학생 프로필 복원
  useEffect(() => {
    const savedRole = localStorage.getItem('nbass_current_role') as UserRole | null;
    const savedEmail = localStorage.getItem('nbass_current_email');
    if (savedRole === 'STUDENT' || !savedRole) {
      loadStudentProfile(savedEmail);
    }
  }, [loadStudentProfile]);

  // 단계 변경 시 화면 최상단으로 자동 스크롤
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [step, activeMenu, activeTab]);

  // 랜딩/평가 모드 - 모듈 위임으로 슬림화 (상세 로직은 hooks/useAssessmentMode 참조)
  const { isLandingMode, setIsLandingMode, is10MinMode, setIs10MinMode, isQuickMode } = useAssessmentMode();

  // 시험일 D-주간 마일스톤 알림 확인 (앱 마운트 시 1회)
  useEffect(() => {
    try {
      ExamScheduleService.cleanupExpired();
      const due = ExamScheduleService.getDueMilestones();
      for (const { schedule, milestone, daysLeft } of due) {
        // 인앱 알림 (카카오톡 실발송은 추후 kakaoNotificationService 연동 지점)
        setTimeout(() => {
          alert(`📅 ${schedule.childName} 님 — ${milestone.title}\n\n${milestone.message}`);
        }, 1500);
        ExamScheduleService.markMilestoneFired(schedule.id, milestone.key);
      }
    } catch { }
  }, []);

  // 랜딩 페이지(index.html)에서 리디렉션 시 URL 파라미터 자동 로그인 및 모드 분기
  useEffect(() => {
    // 광고 UTM 어트리뷰션 캡처 (광고 랜딩/메인 랜딩 공통) — 퍼널 분석 기반
    captureUtmFromUrl();
    // 진단 시작 이벤트 기록 (register 단계로 직접 진입한 경우 = 진단 시작)
    const entryParams = new URLSearchParams(window.location.search);
    if (entryParams.get('app') === 'true' && (entryParams.get('step') === 'register' || entryParams.get('role') === 'STUDENT')) {
      logFunnelEvent('diagnosis_start', getStoredAttribution());
    }

    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');
    const app = params.get('app');
    const roleParam = params.get('role');
    const role = roleParam ? (roleParam.toUpperCase() as UserRole) : null;
    const email = params.get('email');
    const name = params.get('name');
    const subject = params.get('subject');
    const action = params.get('action'); // 'assessment' | 'dashboard' | 'subscribe'
    const mode = params.get('mode'); // '10min' | '3min' | 'full'
    const tierParam = params.get('tier');
    const gradeParam = params.get('grade');
    const birthDateParam = params.get('birthDate') || params.get('birth');
    const genderParam = params.get('gender');

    if (mode === '10min' || mode === '3min' || tierParam === 'free') {
      setIs10MinMode(true);
      try { localStorage.setItem('nbass_assessment_mode', '10min'); } catch { }
    } else if (mode === 'full' || tierParam === 'pro' || tierParam === 'premium' || tierParam === 'vip') {
      setIs10MinMode(false);
      try { localStorage.setItem('nbass_assessment_mode', 'full'); } catch { }
    }

    if (view === 'landing') {
      setIsLandingMode(true);
      return;
    }

    if (app === 'true' || role || mode || action) {
      setIsLandingMode(false);
    }

    if (role) {
      // 세션 저장
      try {
        sessionManager.markSessionActive();
        localStorage.setItem('nbass_current_role', role);
        if (email) {
          localStorage.setItem('nbass_current_email', email);
          setCurrentUserEmail(email);
        }
      } catch { }

      setCurrentUserRole(role);

      // 역할에 따라 적절한 화면으로 이동
      if (role === 'STUDENT') {
        const cleanEmail = email?.trim().toLowerCase();
        const effectiveName = name?.trim() || (cleanEmail ? cleanEmail.split('@')[0] : '');

        const overrideFields: Partial<StudentInfo> = {};
        if (gradeParam) overrideFields.grade = normalizeGrade(gradeParam);
        if (birthDateParam) {
          overrideFields.birthDate = birthDateParam;
          overrideFields.age = calculateAge(birthDateParam);
        }
        if (genderParam) overrideFields.gender = genderParam as any;
        if (subject) {
          overrideFields.selectedSubjects = [subject];
          overrideFields.weakSubject = subject as any;
        }
        if (tierParam) {
          overrideFields.membershipTier = tierParam as any;
        }

        loadStudentProfile(cleanEmail || null, effectiveName || null, overrideFields);
        if (effectiveName || Object.keys(overrideFields).length > 0) {
          setStudent(prev => ({
            ...prev,
            ...(effectiveName ? { name: effectiveName } : {}),
            ...overrideFields,
          }));
        }

        // free모드 검사 및 일반 검사 모두 우선 등록화면(register)이 먼저 뜨도록 하여
        // 현재 등록된 내용(학년, 생년월일, 과목 등)을 확인/수정 후 진행할 수 있도록 보장
        setActiveMenu('assessment');
        setStep('register');
      } else if (role === 'OWNER') {
        setStep('owner_dashboard');
      } else if (role === 'PARENT') {
        setStep('parent_dashboard');
      } else if (role === 'MEDICAL_EXPERT' || role === 'ACADEMY_EXPERT' || role === 'EXPERT') {
        setStep('expert_dashboard');
      }

      // URL 파라미터 히스토리 정리
      window.history.replaceState({}, document.title, window.location.pathname + (mode ? `?app=true&mode=${mode}` : '?app=true'));
    }
  }, [loadStudentProfile]);

  // 검사 진행 가드 + 히스토리 동기화 - 모듈 위임 (상세 로직은 hooks/useNavigationGuard 참조)
  const {
    isAssessmentInProgress,
    showIncompleteWarningModal, setShowIncompleteWarningModal,
    pendingNavigationAction, setPendingNavigationAction,
    handleConfirmLeave, handleContinueAssessment,
    handleHomeClickWithCheck: guardHomeCheck,
  } = useNavigationGuard({
    step: step as string,
    setStep: setStep as (s: string) => void,
    activeMenu: activeMenu as string,
    setActiveMenu: setActiveMenu as (m: string) => void,
    currentUserRole: currentUserRole as unknown as string | null,
    studentName: student.name ?? '',
  });

  const handleHomeClickWithCheck = () => guardHomeCheck(() => {
    try {
      const url = new URL(window.location.href);
      url.search = '?view=landing';
      window.history.pushState({}, '', url.toString());
    } catch {
      window.history.pushState({}, '', window.location.pathname + '?view=landing');
    }
    setIsLandingMode(true);
  });

  // Survey States - 모듈 위임으로 슬림화 (상세 로직은 hooks/useSurveyState 참조)
  const {
    snsSymptomSelection, setSnsSymptomSelection,
    pnsSymptomSelection, setPnsSymptomSelection,
    baiAnswers, setBaiAnswers,
    isiAnswers, setIsiAnswers,
    concentrationAnswers, setConcentrationAnswers,
    adrenalAnswers, setAdrenalAnswers,
    fatigueCore, setFatigueCore,
    fatigueSymptoms, setFatigueSymptoms,
    learningTraitsAnswers, setLearningTraitsAnswers,
    learningTraitsData,
    baiSubPage, setBaiSubPage,
  } = useSurveyState();

  // Student Search State
  const [showStudentSearch, setShowStudentSearch] = useState(false);
  const [studentSearchResults, setStudentSearchResults] = useState<{ student: StudentInfo; latestDate: string; count: number }[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [result, setResult] = useState<AssessmentResult | null>(null);
  const isCalculatingRef = useRef(false);

  // Configuration + History + License + Toast - 모듈 위임 (상세 로직은 hooks/useAppConfigState 참조)
  const {
    showConfig, setShowConfig,
    showNutritionalPrescription, setShowNutritionalPrescription,
    showDataEditor, setShowDataEditor,
    config, setConfig,
    aiModels, setAiModels, handleAiModelsChange,
    strategies, setStrategies,
    selectedSubjectOptions, setSelectedSubjectOptions,
    completedItems, setCompletedItems,
    showSecretPoint, setShowSecretPoint,
    adminMemo, setAdminMemo,
    history, setHistory,
    selectedStudentId, setSelectedStudentId,
    licenseChecked, setLicenseChecked,
    licenseInfo, setLicenseInfo,
    currentTier, setCurrentTier,
    showLicenseScreen, setShowLicenseScreen,
    tierVersion, setTierVersion,
    showPricingModal, setShowPricingModal,
    isRegistrationSaved, setIsRegistrationSaved,
    justSaved, setJustSaved,
    showSaveRequiredModal, setShowSaveRequiredModal,
    saveSuccessNotice, setSaveSuccessNotice,
    toastMessage, setToastMessage, showToast,
  } = useAppConfigState();

  const handleSaveStudentRegistration = useCallback(() => {
    saveStudentProfile(student, currentUserEmail);
    setIsRegistrationSaved(true);
    setJustSaved(true);
    setSaveSuccessNotice('기본 정보 및 과목 설정이 저장되었습니다. (추가/수정 후 언제든 재저장 가능)');

    // 2.5초 후 '저장 완료!' 배지에서 다시 '관련기록 저장'으로 복귀하여 추가 저장 지원
    setTimeout(() => {
      setJustSaved(false);
    }, 2500);

    setTimeout(() => {
      setSaveSuccessNotice(null);
    }, 4500);
  }, [saveStudentProfile, student, currentUserEmail]);

  // 실시간 등급 변경 이벤트 리스너 (오너 변경 / 결제 승급 / PRO 1회 사용 완료 즉시 동기화)
  useEffect(() => {
    const handleTierUpdate = () => {
      setTierVersion(v => v + 1);
    };
    window.addEventListener('nbass_tier_changed', handleTierUpdate);
    window.addEventListener('nbass_pro_used_changed', handleTierUpdate);
    window.addEventListener('storage', handleTierUpdate);
    return () => {
      window.removeEventListener('nbass_tier_changed', handleTierUpdate);
      window.removeEventListener('nbass_pro_used_changed', handleTierUpdate);
      window.removeEventListener('storage', handleTierUpdate);
    };
  }, []);

  // Supabase 클라우드 자동 백그라운드 동기화 - 통합 동기화 경유
  useEffect(() => {
    const timer = setTimeout(() => {
      unifiedSyncService.autoSync();
    }, 3000);

    const handleOnline = () => {
      unifiedSyncService.autoSync();
    };
    window.addEventListener('online', handleOnline);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  // 오너 지정 승급 / 개별 회원 등급 오버라이드 실시간 계산 (예: 연습001 ID, limsd7 계정 등급 변경 시 실시간 반영)
  const effectiveTier = useMemo(() => {
    return UserTierService.getEffectiveTier(
      { id: student.id, name: student.name, email: student.email || currentUserEmail || undefined },
      student.membershipTier || currentTier,
      student.name,
      currentUserEmail || undefined
    );
  }, [student.id, student.name, student.email, currentUserEmail, student.membershipTier, currentTier, tierVersion]);

  // PRO 요금제(1회 스타터 패스 ₩9,000) 검사 완료 여부 판정 (1회성 검사 제한)
  const isProCompleted = useMemo(() => {
    // 관리자 및 전문가는 1회 제한 제외
    if (
      currentUserRole === 'OWNER' ||
      currentUserRole === 'MEDICAL_EXPERT' ||
      currentUserRole === 'ACADEMY_EXPERT' ||
      currentUserRole === 'EXPERT' ||
      effectiveTier === 'expert'
    ) {
      return false;
    }
    if (effectiveTier !== 'pro') {
      return false;
    }
    return UserTierService.isProAssessmentUsed(
      { id: student.id, name: student.name, email: student.email || currentUserEmail || undefined },
      history
    );
  }, [currentUserRole, effectiveTier, student.id, student.name, student.email, currentUserEmail, history, tierVersion]);

  const isFreeStudent = useMemo(() => {
    // 1. 유료 등급 (PRO / PREMIUM / PLUS / VIP / EXPERT)이면 무료 제한 완전 해제
    if (effectiveTier && effectiveTier !== 'free') {
      return false;
    }
    // 2. 무료 등급(FREE)인 경우 검사 진행 및 리포트 열람 시 무료 제한 정확히 적용
    if (currentUserRole === 'STUDENT' || step === 'register' || step === 'surveys' || step === 'protocol' || step === 'analytics' || step === 'results') {
      return true;
    }
    if (currentUserRole === 'OWNER' || currentUserRole === 'MEDICAL_EXPERT' || currentUserRole === 'ACADEMY_EXPERT' || currentUserRole === 'EXPERT') {
      return false;
    }
    return !effectiveTier || effectiveTier === 'free';
  }, [is10MinMode, currentUserRole, effectiveTier, step]);

  // [Free 모드 제한] 국/영/수 중 1과목만 집중 케어 허용 (기존 다중 선택 데이터 자동 정규화)
  useEffect(() => {
    if (isFreeStudent && student.focusSubjects && student.focusSubjects.length > 1) {
      const allowedCommon = student.focusSubjects.find(s => ['korean', 'math', 'english'].includes(s)) || student.focusSubjects[0] || 'math';
      setStudent(prev => ({
        ...prev,
        focusSubjects: [allowedCommon],
        weakSubject: (allowedCommon as any) || prev.weakSubject
      }));
    }
  }, [isFreeStudent, student.focusSubjects]);

  // 권한 및 구독 등급별 검사 기록 필터링:
  // 1) 학생(STUDENT):
  //    - 본인 기록만 조회
  //    - 무료 회원(FREE)의 경우: 최근 1주일(7일) 이내의 검사 기록만 조회 가능 (1주일 초과 기록은 미노출)
  //    - 유료 회원(BASIC / PREMIUM / VIP): 전체 기간 무제한 열람 가능 (오너 지정 승급 포함)
  // 2) 의료전문가(MEDICAL_EXPERT / EXPERT) & 오너(OWNER):
  //    - 전체 등록 학생의 전체 기간 히스토리 제한 없이 영구 열람 가능
  const displayHistory = useMemo(() => {
    if (currentUserRole === 'STUDENT') {
      const studentNameClean = student.name?.trim().toLowerCase();
      const studentIdClean = student.id?.trim();
      const myRecords = history.filter(h => {
        const matchId = Boolean(studentIdClean && h.student?.id === studentIdClean);
        const matchName = Boolean(studentNameClean && h.student?.name?.trim().toLowerCase() === studentNameClean);
        return matchId || matchName;
      });

      // 무료 회원(free)의 경우 최근 1주일(7일) 이내의 기록만 노출 (오너가 VIP 등으로 승급시킨 경우 제한 해제)
      const isFreeTier = !effectiveTier || effectiveTier === 'free';
      if (isFreeTier) {
        const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
        const now = Date.now();
        return myRecords.filter(h => {
          const rawDate = h.date || (h.student as any)?.testDate;
          if (!rawDate) return true;
          const testTime = new Date(rawDate).getTime();
          if (isNaN(testTime)) return true;
          return (now - testTime) <= ONE_WEEK_MS;
        });
      }

      return myRecords;
    }
    // MEDICAL_EXPERT, OWNER, ACADEMY_EXPERT 등은 1주일 제한 없이 전체 열람 가능
    return history;
  }, [currentUserRole, effectiveTier, student.id, student.name, history]);

  const [activeConfigTab, setActiveConfigTab] = useState<string>('general');
  const [showZenMode, setShowZenMode] = useState(false);
  const [showLetterModal, setShowLetterModal] = useState(false);
  const [editingStrategyType, setEditingStrategyType] = useState<CareType>(CareType.BURNOUT);
  const [prescriptions, setPrescriptions] = useState<Record<string, Prescription>>(MENTAL_PRESCRIPTIONS);

  const [showBreathingGuide, setShowBreathingGuide] = useState(false);
  const [showHistoryAnalysisModal, setShowHistoryAnalysisModal] = useState(false);
  const [showTrendModal, setShowTrendModal] = useState(false);

  // 2주 타겟 추적 검사 (Targeted Follow-up) 상태 및 핸들러
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [followUpTargetResult, setFollowUpTargetResult] = useState<AssessmentResult | null>(null);
  const [showFollowUpDeltaModal, setShowFollowUpDeltaModal] = useState(false);
  const [followUpDeltaReport, setFollowUpDeltaReport] = useState<FollowUpDeltaReport | null>(null);
  const [followUpNewResult, setFollowUpNewResult] = useState<AssessmentResult | null>(null);

  const handleStartFollowUp = (targetResult?: AssessmentResult) => {
    const baseline = targetResult || result;
    if (!baseline) {
      alert('비교할 이전 검사 결과가 없습니다.');
      return;
    }
    setFollowUpTargetResult(baseline);
    setShowFollowUpModal(true);
  };

  const handleFollowUpComplete = (newResult: AssessmentResult, deltaReport: FollowUpDeltaReport) => {
    setResult(newResult);
    const historyItem = { ...newResult, date: new Date().toISOString() };
    setHistory(prev => [historyItem, ...prev].slice(0, 50));
    setFollowUpNewResult(newResult);
    setFollowUpDeltaReport(deltaReport);
    setShowFollowUpModal(false);
    setShowFollowUpDeltaModal(true);
  };

  const renderFollowUpModals = () => (
    <>
      {showFollowUpModal && followUpTargetResult && (
        <TargetedFollowUpModal
          isOpen={showFollowUpModal}
          onClose={() => setShowFollowUpModal(false)}
          baselineResult={followUpTargetResult}
          onComplete={handleFollowUpComplete}
          isDarkMode={isDarkMode}
        />
      )}
      {showFollowUpDeltaModal && followUpDeltaReport && followUpNewResult && (
        <FollowUpDeltaReportModal
          isOpen={showFollowUpDeltaModal}
          onClose={() => setShowFollowUpDeltaModal(false)}
          deltaReport={followUpDeltaReport}
          newResult={followUpNewResult}
          onViewFullReport={() => {
            setResult(followUpNewResult);
            setStep('results');
          }}
          isDarkMode={isDarkMode}
        />
      )}
    </>
  );
  const [adminMemos, setAdminMemos] = useState<string[]>([
    "수면 불규칙으로 인한 피로 누적이 관찰됩니다.",
    "오전 카페인 섭취를 자제하고 수분 섭취를 늘리세요.",
    "가벼운 유산소 운동(걷기 30분)을 권장합니다.",
    "취침 전 스마트폰 사용을 줄여 뇌 휴식을 유도하세요.",
    "학습 중간에 4-7-8 호흡법으로 긴장을 완화하세요."
  ]);

  // Medical Expert Mode State
  const [bloodTest, setBloodTest] = useState<BloodTestData>({
    wbc: 0, hemoglobin: 0, hematocrit: 0, mcv: 0, nkActivity: 0,
    vitaminD: 0, crp: 0, hba1c: 0,
    ast: 0, alt: 0, creatinine: 0, bun: 0,
    fastingHours: 0
  });
  const [medicalNotes, setMedicalNotes] = useState('');

  // -------------------------------------------------------------
  // 구독 및 결제 모달 상태 관리 & 정밀 검사 PRO 이상 게이팅
  // -------------------------------------------------------------
  const [showSubscriptionModal, setShowSubscriptionModal] = useState<boolean>(false);
  const [subscriptionTriggerReason, setSubscriptionTriggerReason] = useState<string | undefined>();
  const [subscriptionInitialTier, setSubscriptionInitialTier] = useState<MembershipTier>('pro');

  const handleStartPrecisionAssessment = useCallback(() => {
    // 1. 관리자 / 전문가 계정은 제한 없이 통과
    const isExemptRole =
      currentUserRole === 'OWNER' ||
      currentUserRole === 'MEDICAL_EXPERT' ||
      currentUserRole === 'ACADEMY_EXPERT' ||
      currentUserRole === 'EXPERT' ||
      effectiveTier === 'expert';

    if (isExemptRole) {
      setActiveMenu('assessment');
      setStep('register');
      return;
    }

    // 2. 무료(FREE) 회원은 PRO 이상 비용 결제 필수 (1회 스타터 패스 ₩9,000 또는 정기구독)
    const isFree = !effectiveTier || effectiveTier === 'free';
    if (isFree) {
      setSubscriptionTriggerReason('정밀 검사는 PRO 이상(1회 스타터 패스 ₩9,000 또는 정기구독) 결제 후 이용 가능합니다.');
      setSubscriptionInitialTier('pro');
      setShowSubscriptionModal(true);
      return;
    }

    // 3. PRO 1회 스타터 패스 이용자가 이미 검사를 완료한 경우 (1회 정밀검사 소진)
    if (isProCompleted) {
      setSubscriptionTriggerReason('PRO 1회 스타터 패스(₩9,000) 검사가 이미 완료되었습니다. 추가 정밀 검사는 정기구독(PREMIUM 등)으로 업그레이드 후 이용 가능합니다.');
      setSubscriptionInitialTier('premium');
      setShowSubscriptionModal(true);
      return;
    }

    // 4. PRO 이상 유료 회원은 정밀 검사 등록 화면(register)으로 직행
    setActiveMenu('assessment');
    setStep('register');
  }, [currentUserRole, effectiveTier, isProCompleted]);

  const handleTierUpgrade = useCallback((tier: MembershipTier) => {
    const studentIdOrName = student.id || student.name || '학생';
    UserTierService.setUserTier(
      studentIdOrName,
      tier,
      student.name,
      '정밀 검사 시작 결제 업그레이드'
    );
    setCurrentTier(tier);
    setStudent(prev => ({ ...prev, membershipTier: tier }));
    setTierVersion(v => v + 1);
    setShowSubscriptionModal(false);
    setShowPricingModal(false);

    const tierName = TIER_INFO[tier]?.name || tier.toUpperCase();
    showToast(`🎉 [${tierName}] 결제가 완료되었습니다! 정밀 검사를 시작합니다.`);

    // 결제 완료 후 정밀 검사 등록 화면으로 이동 (단, study_efficiency 단계나 결과 단계에서는 현재 컨텍스트 유지)
    setActiveMenu('assessment');
    if (step !== 'study_efficiency' && step !== 'results') {
      setStep('register');
    }
  }, [student.id, student.name, showToast, setCurrentTier, setTierVersion, setShowPricingModal, step]);

  const subscriptionProps = useMemo(() => ({
    isSubscriptionOpen: showSubscriptionModal || showPricingModal,
    onSubscriptionClose: () => {
      setShowSubscriptionModal(false);
      setShowPricingModal(false);
    },
    onSubscriptionSelectTier: handleTierUpgrade,
    subscriptionTriggerReason,
    subscriptionInitialTier,
    onPricingClick: () => {
      setSubscriptionTriggerReason(undefined);
      setSubscriptionInitialTier('pro');
      setShowSubscriptionModal(true);
    },
  }), [showSubscriptionModal, showPricingModal, handleTierUpgrade, subscriptionTriggerReason, subscriptionInitialTier, setShowPricingModal]);

  const navigateToMenu = (newMenu: 'dashboard' | 'assessment' | 'results' | 'schedule' | 'sleep' | 'grades' | 'history' | 'growth' | 'wrongnotes' | 'resources' | 'solutions' | 'progress' | 'habits') => {
    if (newMenu === 'assessment') {
      handleStartPrecisionAssessment();
      return;
    }

    setActiveMenu(newMenu);

    if (newMenu === 'habits') {
      const isHabitsAllowed = effectiveTier === 'premium_plus' || effectiveTier === 'vip' || effectiveTier === 'expert' || currentUserRole === 'OWNER' || currentUserRole === 'MEDICAL_EXPERT' || currentUserRole === 'EXPERT';
      if (!isHabitsAllowed) {
        setSubscriptionTriggerReason('수험생 공부습관 교정 클리닉(Habit Clinic)은 PREMIUM PLUS 등급 이상에서 이용 가능합니다.');
        setSubscriptionInitialTier('premium_plus');
        setShowSubscriptionModal(true);
      }
    }

    if (newMenu === 'grades') {
      // 성적 관리 클릭 시: grade_management 단계로 직행
      setStep('grade_management');
    } else if (newMenu === 'sleep') {
      // 수면 관리 클릭 시: sleep_management 단계로 직행
      setStep('sleep_management');
    } else if (newMenu === 'results') {
      // 검사결과 클릭 시: 기존 계산된 결과(result)가 이미 있으면 그대로 유지하여 results 단계로 이동
      if (result) {
        setStep('results');
        return;
      }
      // 저장된 검사 기록이 있으면 현재 학생 본인 기록 우선으로 불러와서 이동
      const sortedHistory = [...displayHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const latestRecord = sortedHistory[0];
      if (latestRecord) {
        setResult(latestRecord);
        // 타인 기록으로 학생 정보가 덮어씌워지지 않도록, 현재 학생 이름/ID와 일치할 때만 복원
        if (latestRecord.student && (!student.name || latestRecord.student.name === student.name || latestRecord.student.id === student.id)) {
          setStudent(latestRecord.student);
        }
        if (latestRecord.hrv) setHrv(latestRecord.hrv);
        if (latestRecord.protocol) setProtocol(latestRecord.protocol);
        if (latestRecord.analytics) setAnalytics(latestRecord.analytics);
        if (latestRecord.bloodTest) setBloodTest(latestRecord.bloodTest);
        setStep('results');
      } else {
        // 결과가 없는 경우 친절하게 검사 시작으로 유도
        setStep('results');
      }
    }
  };

  const handleMenuChangeWithCheck = (newMenu: 'dashboard' | 'assessment' | 'results' | 'schedule' | 'sleep' | 'grades' | 'history' | 'growth' | 'wrongnotes' | 'resources' | 'solutions' | 'progress' | 'habits') => {
    if (newMenu === activeMenu && newMenu !== 'assessment' && newMenu !== 'results') return;

    // 검사 진행 중 다른 메뉴로 이탈 시 경고
    if (isAssessmentInProgress && newMenu !== 'assessment') {
      setPendingNavigationAction(() => () => navigateToMenu(newMenu));
      setShowIncompleteWarningModal(true);
      return;
    }
    navigateToMenu(newMenu);
  };

  // Portable HRV State (uBioMacpa Device)
  const [portableHrv, setPortableHrv] = useState<PortableHRVData>({
    stressIndex: 27,
    stressPercent: 43,
    pulseVariability: 57,
    ansBalanceType: ANSBalanceType.NORMAL,
    lf: 4.7,
    hf: 3.5,
    lfHfRatio: 1.34,
    meanBpm: 70,
    sdnn: 49,
    rmssd: 37.8,
    vascularHealthIndex: 0
  });

  // Logic Engine State
  const [logicConfig, setLogicConfig] = useState<LogicEngineConfig>(() => loadLogicConfig());
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);

  // Product Recommendations State
  const [productRecommendations, setProductRecommendations] = useState<Record<string, string[]>>(() => loadProductRecommendations());

  // Prediction Rules State
  const [predictionRules, setPredictionRules] = useState(() => loadPredictionRules());

  // Rule Editor Modals
  const [showClassificationEditor, setShowClassificationEditor] = useState(false);
  const [showProductRuleEditor, setShowProductRuleEditor] = useState(false);

  // Study Efficiency Assessment State (공부 효율성 정밀 검사)
  const [showStudyEfficiencyModal, setShowStudyEfficiencyModal] = useState(false);
  const [studyEfficiencyResults, setStudyEfficiencyResults] = useState<StudyEfficiencyResults | null>(null);
  const [cognitiveResults, setCognitiveResults] = useState<CognitivePerformanceResults | null>(null);
  const [workingMemoryResults, setWorkingMemoryResults] = useState<any>(null); // State for Working Memory Results

  // Logic Engine Evaluation Results
  const recommendedProducts = useMemo(() => {
    if (!result) return [];

    // Evaluate logic rules
    const cType = result.careType || CareType.BURNOUT;

    // bloodTest 데이터를 포함하여 제품 추천 규칙 평가
    const products = evaluateProductRules(
      logicConfig.productRules,
      result.hrv,
      result.survey,
      cType,
      result.bloodTest
    );

    // Fallback if needed
    if (!products.some(p => p.productId === 'immune_one')) products.push({ productId: 'immune_one', tier: 'SUPPORTIVE' });

    return products;
  }, [result, logicConfig.productRules]);

  const evaluatedSecretPoints = useMemo(() => {
    if (!result) return [];

    return evaluateSecretPointRules(logicConfig.secretPointRules, result.hrv, result.survey, result.protocol, result.analytics);
  }, [result, logicConfig.secretPointRules]);

  // Use Dark Mode Hook
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  // License & Membership State (moved earlier — see above)

  // Multi-Monitor Sync (듀얼 모니터 워크플로우)
  const {
    sessionId: syncSessionId,
    sessionState: syncSessionState,
    studentReady: syncStudentReady,
    studentData: syncStudentData,
    createSession: syncCreateSession,
    openStudentWindow: syncOpenStudentWindow,
    closeSession: syncCloseSession,
    send: syncSend,
    isConnected: syncIsConnected
  } = useSyncAdmin({
    onMessage: (message) => {
      console.log('[Admin] Sync message:', message);

      // 학생 데이터 수신 시 자동 반영
      if (message.type === 'STUDENT_COMPLETE' && message.data) {
        const { survey, protocol, analytics } = message.data;

        // 설문 데이터 반영
        if (survey) {
          if (survey.baiScores) setBaiAnswers(survey.baiScores);
          if (survey.isiScores) setIsiAnswers(survey.isiScores);
          if (survey.concentrationScores) setConcentrationAnswers(survey.concentrationScores);
          if (survey.fatigueSymptoms) setFatigueSymptoms(survey.fatigueSymptoms);
          if (survey.adrenalScores) setAdrenalAnswers(survey.adrenalScores);
          if (survey.snsSymptoms) setSnsSymptomSelection(survey.snsSymptoms);
          if (survey.pnsSymptoms) setPnsSymptomSelection(survey.pnsSymptoms);
        }

        // 프로토콜 데이터 반영
        if (protocol) {
          setProtocol(prev => ({ ...prev, ...protocol }));
        }

        // 분석 데이터 반영
        if (analytics) {
          setAnalytics(prev => ({ ...prev, ...analytics }));
        }
      }
    }
  });

  // 멀티모니터 모드 상태
  const [isMultiMonitorMode, setIsMultiMonitorMode] = useState(false);
  const [studentWindowRef, setStudentWindowRef] = useState<Window | null>(null);


  // Helper function moved to utils/consultationUtils.ts

  // Load History on Mount
  useEffect(() => {
    const initializeData = async () => {
      // Attempt to sync missing data from localStorage to IndexedDB on startup
      const syncedCount = await DatabaseService.syncLocalStorageData();

      // Consistently load all history from the database - 통합 동기화 경유
      const dbHistory = await unifiedSyncService.getAllHistory();
      setHistory(dbHistory as (AssessmentResult & { date: string })[]);

      if (syncedCount > 0) {
        console.log(`Successfully synced ${syncedCount} records from localStorage to IndexedDB.`);
      }
    };

    initializeData();

  }, []);

  // License Check on Mount
  useEffect(() => {
    const checkLicense = async () => {
      try {
        const info = await getLicenseInfo();
        if (info) {
          const validity = await checkLicenseValidity();
          setLicenseInfo(info);
          setCurrentTier(validity.tier);
          if (!validity.isValid) {
            setShowLicenseScreen(true);
          }
        } else {
          // No license found - show activation screen on first launch
          setShowLicenseScreen(true);
        }
      } catch (e) {
        console.error('License check failed:', e);
      } finally {
        setLicenseChecked(true);
      }
    };
    checkLicense();
  }, []);

  // [REFACTORED] Autosave & Recovery Logic (조건부 완화: register 제외 및 5문항 이상 작성 시 배너 안내)
  const { pendingDraft, recoverDraft, dismissDraft } = useAssessmentDraft({
    step,
    activeMenu,
    student,
    hrv,
    protocol,
    analytics,
    bloodTest,
    snsSymptomSelection,
    pnsSymptomSelection,
    baiAnswers,
    isiAnswers,
    concentrationAnswers,
    adrenalAnswers,
    fatigueCore,
    fatigueSymptoms,
    studyEfficiencyResults,
    workingMemoryResults,
    cognitiveResults,
    result,
    setStudent,
    setHrv,
    setProtocol,
    setAnalytics,
    setBloodTest,
    setSnsSymptomSelection,
    setPnsSymptomSelection,
    setBaiAnswers,
    setIsiAnswers,
    setConcentrationAnswers,
    setAdrenalAnswers,
    setFatigueCore,
    setFatigueSymptoms,
    setStudyEfficiencyResults,
    setWorkingMemoryResults,
    setCognitiveResults,
    setStep,
    setActiveMenu
  });

  // Listen for student survey data from localStorage (학생 창에서 저장 시 동기화)
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'surveyFormData' && event.newValue) {
        try {
          const savedData = JSON.parse(event.newValue);
          console.log('📥 학생 설문 데이터 수신:', savedData);

          // Update survey states with received data
          if (savedData.sympathetic) setSnsSymptomSelection(savedData.sympathetic);
          if (savedData.parasympathetic) setPnsSymptomSelection(savedData.parasympathetic);
          if (savedData.bai) setBaiAnswers(savedData.bai);
          if (savedData.isi) setIsiAnswers(savedData.isi);
          if (savedData.concentration) setConcentrationAnswers(savedData.concentration);
          if (savedData.adrenal) {
            // Convert adrenal array format to number array
            const adrenalArr = new Array(15).fill(0);
            savedData.adrenal.forEach((id: string) => {
              const [catIdx, qIdx] = id.split('-').map(Number);
              const idx = catIdx * 4 + qIdx; // Approximate index mapping
              if (idx < 15) adrenalArr[idx] = 1;
            });
            setAdrenalAnswers(adrenalArr);
          }
          if (savedData.cfs) {
            const cfsArr = savedData.cfs.map(() => true);
            setFatigueSymptoms(new Array(8).fill(false).map((_, i) => savedData.cfs.length > i));
          }

          // Show notification
          alert('✅ 학생 설문 데이터가 수신되었습니다!');
        } catch (error) {
          console.error('설문 데이터 파싱 오류:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // [NEW] Persistence for Working Memory & Cognitive Performance
  useEffect(() => {
    if (student?.id) {
      DatabaseService.getWorkingMemoryResult(student.id).then(res => {
        if (res?.results) setWorkingMemoryResults(res.results);
      }).catch(err => console.error('Failed to load WM results:', err));

      DatabaseService.getCognitivePerformanceResult(student.id).then(res => {
        if (res?.results) setCognitiveResults(res.results);
      }).catch(err => console.error('Failed to load CP results:', err));
    }
  }, [student?.id]);

  // [소프트 게이트] 무료 진단 업그레이드 유도 이벤트 → 구독 모달 열기
  useEffect(() => {
    const handleUpgradePrompt = () => {
      setSubscriptionTriggerReason('3분 무료 진단은 1회 제공됩니다. 정밀 종합 검사로 업그레이드하세요.');
      setSubscriptionInitialTier('pro');
      setShowSubscriptionModal(true);
    };
    window.addEventListener(FREE_TRIAL_UPGRADE_EVENT, handleUpgradePrompt);
    return () => window.removeEventListener(FREE_TRIAL_UPGRADE_EVENT, handleUpgradePrompt);
  }, []);

  // Save Result to History when result is generated
  useEffect(() => {
    if (step === 'results' && result) {
      setHistory(prev => {
        // Strict duplicate check: Check for same Student ID, Test Date check, and Score/Type
        // to avoid duplicate entries on re-renders or slight updates.
        const isDuplicate = prev.some(item =>
          item.student.id === result.student.id &&
          item.student.testDate === result.student.testDate &&
          item.score === (result.score || 0) &&
          item.careType === result.careType
        );

        if (isDuplicate) {
          return prev;
        }

        const newEntry = {
          ...result,
          date: new Date().toISOString()
        };

        const updated = [newEntry, ...prev].slice(0, 50); // Keep last 50
        safeStorage.saveJSON('sn1_history', updated.slice(0, 5));
        return updated;
      });
    }
  }, [step, result]);

  const toggleCompleted = (id: string) => {
    setCompletedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Hidden Admin Menu State
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);

  // [보안] 관리자(오너) 관제 포털: OWNER 역할 + 설정된 오너 비밀번호만 허용, 검사 진행 중 차단
  const requestAdminAccess = useCallback((type: 'config' | 'portal') => {
    const decision = canAttemptAdminPortal(currentUserRole, isAssessmentInProgress);
    if (!decision.allowed) {
      alert(decision.message || '관리자 포털에 접근할 수 없습니다.');
      return;
    }
    setAdminActionType(type);
    setShowAdminPassword(true);
  }, [currentUserRole, isAssessmentInProgress]);

  const handleAdminUnlock = () => {
    const input = adminPasswordInput.trim();

    // 최초 1회 부트스트랩: 오너 비밀번호가 아직 없으면 이 입력값을 새 비밀번호로 설정합니다.
    if (!config.expertModePassword || !config.expertModePassword.trim()) {
      const pre = canAttemptAdminPortal(currentUserRole, isAssessmentInProgress);
      if (!pre.allowed) {
        alert(pre.message || '관리자 포털에 접근할 수 없습니다.');
        return;
      }
      if (input.length < 4) {
        alert('오너 비밀번호는 4자 이상으로 설정해 주세요. (최초 1회 설정)');
        return;
      }
      setConfig({ ...config, expertModePassword: input });
      alert('오너 비밀번호가 설정되었습니다. 다음부터 이 비밀번호를 사용하세요.');
      setShowAdminPassword(false);
      setIsAdminUnlocked(true);
      setAdminPasswordInput('');
      if (adminActionType === 'portal') setStep('role_selection');
      else setShowConfig(true);
      return;
    }

    const decision = evaluateAdminAccess({
      role: currentUserRole,
      isAssessmentInProgress,
      ownerPassword: config.expertModePassword,
      inputPassword: adminPasswordInput,
    });
    if (!decision.allowed) {
      alert(decision.message || '관리자 접근이 거부되었습니다.');
      return;
    }
    setShowAdminPassword(false);
    setIsAdminUnlocked(true);
    setAdminPasswordInput('');

    if (adminActionType === 'portal') {
      setStep('role_selection');
    } else {
      setShowConfig(true);
    }
  };

  // 관리자 모드 전역 단축키: Ctrl+Shift+A (어떤 화면에서도 관리자 포털 진입)
  useEffect(() => {
    const handleAdminShortcut = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        // [보안] OWNER만 진입 시도 가능, 검사 진행 중에는 차단
        const decision = canAttemptAdminPortal(currentUserRole, isAssessmentInProgress);
        if (!decision.allowed) {
          alert(decision.message || '관리자 포털에 접근할 수 없습니다.');
          return;
        }
        setAdminActionType('portal');
        setShowAdminPassword(true);
      }
    };
    window.addEventListener('keydown', handleAdminShortcut);
    return () => window.removeEventListener('keydown', handleAdminShortcut);
  }, [currentUserRole, isAssessmentInProgress]);

  // Handle product recommendations change with localStorage save
  const handleProductRecommendationsChange = useCallback((recs: Record<string, string[]>) => {
    setProductRecommendations(recs);
    saveProductRecommendations(recs);
  }, []);

  // Handle logic config change with localStorage save
  const handleLogicConfigChange = useCallback((config: LogicEngineConfig) => {
    setLogicConfig(config);
    saveLogicConfig(config);
  }, []);

  // Handle prediction rules change with localStorage save
  const handlePredictionRulesChange = useCallback((rules: any[]) => {
    setPredictionRules(rules);
    savePredictionRules(rules);
  }, []);

  const ConfigModal = useCallback(() => (
    <ConfigModalComponent
      isOpen={showConfig}
      onTabChange={setActiveConfigTab}
      activeTab={activeConfigTab as any}
      onClose={() => setShowConfig(false)}
      config={config}
      onConfigChange={setConfig}
      strategies={strategies}
      onStrategiesChange={setStrategies}
      prescriptions={prescriptions}
      onPrescriptionsChange={setPrescriptions}
      editingStrategyType={editingStrategyType}
      onEditingStrategyTypeChange={setEditingStrategyType}
      selectedSubjectOptions={selectedSubjectOptions}
      onSelectedSubjectOptionsChange={setSelectedSubjectOptions}
      isAdminUnlocked={isAdminUnlocked}
      onViewConsultantManual={() => alert('Consultant Manual Coming Soon')}
      logicConfig={logicConfig}
      onLogicConfigChange={handleLogicConfigChange}
      onResetLogicConfig={() => setLogicConfig(resetLogicConfig())}
      productRecommendations={productRecommendations}
      onProductRecommendationsChange={handleProductRecommendationsChange}
      onResetProductRecommendations={() => setProductRecommendations(resetProductRecommendations())}
      predictionRules={predictionRules}
      onPredictionRulesChange={handlePredictionRulesChange}
      onResetPredictionRules={() => setPredictionRules(resetPredictionRules())}
      aiModels={aiModels}
      onAiModelsChange={handleAiModelsChange}
    />
  ), [showConfig, activeConfigTab, config, strategies, prescriptions, editingStrategyType, selectedSubjectOptions, isAdminUnlocked, logicConfig, handleLogicConfigChange, productRecommendations, handleProductRecommendationsChange, predictionRules, handlePredictionRulesChange, aiModels, handleAiModelsChange]);

  // Legacy ConfigModal removed

  useEffect(() => {
    setStudent(prev => ({ ...prev, age: calculateAge(prev.birthDate) }));
  }, [student.birthDate]);

  const bmiValue = useMemo(() => {
    if (student.height && student.weight) {
      const h = student.height / 100;
      return parseFloat((student.weight / (h * h)).toFixed(1));
    }
    return 0;
  }, [student.height, student.weight]);

  useEffect(() => {
    setStudent(prev => ({ ...prev, bmi: bmiValue }));
  }, [bmiValue]);


  const handleBirthDateChange = (date: string) => {
    const age = calculateAge(date);
    const estimatedGrade = estimateGradeByAgeOrBirthDate(date);
    setStudent(prev => ({
      ...prev,
      birthDate: date,
      age: age,
      grade: estimatedGrade
    }));
  };

  // Birthdate separate input refs
  const birthMonthRef = useRef<HTMLInputElement>(null);
  const birthDayRef = useRef<HTMLInputElement>(null);

  // Parse current birthDate
  const getBirthParts = () => {
    if (!student.birthDate) return { year: '', month: '', day: '' };
    const parts = student.birthDate.split('-');
    return {
      year: parts[0] || '',
      // 선행 0 제거하여 표시 (01 -> 1)
      month: parts[1] ? String(parseInt(parts[1], 10) || '') : '',
      day: parts[2] ? String(parseInt(parts[2], 10) || '') : ''
    };
  };

  const handleBirthPartChange = (part: 'year' | 'month' | 'day', value: string) => {
    const current = getBirthParts();
    const numValue = value.replace(/\D/g, ''); // 숫자만

    if (part === 'year') {
      const limitedValue = numValue.slice(0, 4);
      current.year = limitedValue;
      // 4자리 입력 완료시 월 필드로 자동 이동
      if (limitedValue.length === 4 && birthMonthRef.current) {
        setTimeout(() => birthMonthRef.current?.focus(), 0);
      }
    } else if (part === 'month') {
      const limitedValue = numValue.slice(0, 2);
      current.month = limitedValue; // 패딩 없이 원본 값 유지
      if (limitedValue.length === 2 && birthDayRef.current) {
        setTimeout(() => birthDayRef.current?.focus(), 0);
      }
    } else {
      const limitedValue = numValue.slice(0, 2);
      current.day = limitedValue; // 패딩 없이 원본 값 유지
    }

    // 날짜 생성 시에만 패딩 적용 (내부 저장용)
    if (current.year.length === 4 && current.month && current.day) {
      const newDate = `${current.year}-${current.month.padStart(2, '0')}-${current.day.padStart(2, '0')}`;
      handleBirthDateChange(newDate);
    } else {
      // 아직 완전하지 않으면 부분적으로 저장
      handleBirthDateChange(`${current.year}-${current.month}-${current.day}`);
    }
  };

  // Data Update Handler
  const handleDataUpdate = (newData: AssessmentResult) => {
    const logicConfig = loadLogicConfig();

    // Portable 모드 감지: portableHrv 데이터가 있으면 useBrainBody=false
    const isPortableMode = !!newData.hrv.portableHrv;
    const hasRealEegOrSensor = Boolean(
      (newData.hrv.sns > 0 && newData.hrv.dominantEEG) ||
      (newData.hrv.eegAlpha && (newData.hrv.eegAlpha as number) > 0) ||
      newData.hrv.portableHrv
    );
    const useBrainBodyForEval = !isPortableMode && Boolean(config.useBrainBody && hasRealEegOrSensor);

    // 1. Recalculate Classification
    const classification = evaluateClassificationWithScores(
      logicConfig.classificationRules,
      newData.hrv,
      newData.survey,
      newData.protocol,
      newData.analytics,
      newData.bloodTest,
      useBrainBodyForEval
    );

    const brainBodyState = evaluateBrainBodyCoherence(
      newData.hrv,
      newData.survey,
      classification.primary,
      newData.protocol,
      newData.cognitiveResults
    );

    // 2. Recalculate Report Text
    const reportText = generateClinicalAnalysis(
      newData.student,
      newData.hrv,
      newData.survey,
      newData.protocol,
      newData.analytics,
      classification.primary,
      logicConfig,
      newData.bloodTest,
      newData.cognitiveResults,
      brainBodyState
    );

    // 3. Recalculate Medical Analysis (if applicable)
    const medicalAnalysis = config.isMedicalMode
      ? analyzeMedicalData(newData.bloodTest, classification.primary, newData.student.gender)
      : undefined;

    // 4. Construct updated result
    const updatedResult: AssessmentResult = {
      ...newData,
      classificationResult: classification,
      brainBodyState: brainBodyState,
      analysisText: reportText, // Correct property name for report text
      careType: classification.primary,
      medicalAnalysis: medicalAnalysis,
      medicalNotes: result?.medicalNotes // Preserve existing notes
    };

    // 5. Update State
    setResult(updatedResult);
    console.log("Updated result:", updatedResult);
  };

  // 학생 검색 핸들러
  const handleSearchStudent = async () => {
    if (!student.name || student.name.trim().length === 0) {
      alert('이름을 입력해주세요.');
      return;
    }

    setIsSearching(true);
    try {
      const results = await DatabaseService.searchStudentsByName(student.name);
      setStudentSearchResults(results);
      setShowStudentSearch(true);
    } catch (error) {
      console.error('Failed to search students:', error);
      alert('검색 중 오류가 발생했습니다.');
    } finally {
      setIsSearching(false);
    }
  };

  // 검색된 학생 선택 핸들러
  const handleSelectSearchedStudent = (selectedStudent: StudentInfo) => {
    setStudent({
      ...selectedStudent,
      id: generateSerialID(), // 새 ID 생성
      testDate: getTodayStr() // 오늘 날짜로 설정
    });
    setShowStudentSearch(false);
    setStudentSearchResults([]);
  };


  const surveyScores = useMemo(() => {
    const bai = baiAnswers.reduce((a, b) => a + b, 0);
    const isi = isiAnswers.reduce((a, b) => a + b, 0);
    const concentration = concentrationAnswers.reduce((a, b) => a + b, 0);
    const adrenal = adrenalAnswers.reduce((a, b) => a + b, 0);
    const fatigueCount = fatigueSymptoms.filter(s => s).length;
    const snsCount = snsSymptomSelection.length;
    const pnsCount = pnsSymptomSelection.length;
    return { bai, isi, concentration, adrenal, fatigueCount, snsCount, pnsCount, isChronicFatigue: fatigueCore && fatigueCount >= 4 };
  }, [baiAnswers, isiAnswers, concentrationAnswers, adrenalAnswers, fatigueCore, fatigueSymptoms, snsSymptomSelection, pnsSymptomSelection]);

  // [P1-8] 제출/분석 중 누락 항목(확정 진단 가능성) 안내
  const assessmentReadiness = useMemo(
    () =>
      computeReadiness([
        { key: 'bai', label: '불안(BAI) 설문', answered: baiAnswers.filter((a) => a >= 0).length, total: BAI_QUESTIONS.length, required: true },
        { key: 'isi', label: '수면(ISI) 설문', answered: isiAnswers.filter((a) => a >= 0).length, total: ISI_QUESTIONS.length, required: true },
        { key: 'concentration', label: '집중력 설문', answered: concentrationAnswers.filter((a) => a >= 0).length, total: CONCENTRATION_QUESTIONS.length, required: true },
        { key: 'adrenal', label: '부신피로 설문', answered: adrenalAnswers.filter((a) => a >= 0).length, total: ADRENAL_QUESTIONS.length, required: true },
        { key: 'protocol', label: '학습 프로토콜', answered: protocol?.location ? 1 : 0, total: 1, required: false },
        { key: 'analytics', label: '학습 분석', answered: analytics?.isTested ? 1 : 0, total: 1, required: false },
        { key: 'cognitive', label: '인지 검사', answered: cognitiveResults ? 1 : 0, total: 1, required: false },
      ]),
    [baiAnswers, isiAnswers, concentrationAnswers, adrenalAnswers, protocol?.location, analytics?.isTested, cognitiveResults],
  );

  const baiEvaluation = useMemo(() => {
    const score = surveyScores.bai;
    const norm = getBaiNorm(score);
    if (score <= 9) return { text: `정상 범위 · ${norm.peerLabel}`, color: "text-emerald-600" };
    if (score <= 18) return { text: `경미한 수준의 불안 · ${norm.peerLabel}`, color: "text-blue-600" };
    if (score <= 29) return { text: `상당한 수준의 불안 (관심 필요) · ${norm.peerLabel}`, color: "text-orange-600" };
    return { text: `심한 수준의 불안 (전문가 상담 권고) · ${norm.peerLabel}`, color: "text-red-600" };
  }, [surveyScores.bai]);

  const isiEvaluation = useMemo(() => {
    const score = surveyScores.isi;
    const norm = getIsiNorm(score);
    if (score <= 7) return { text: `걱정할 만큼의 불면증이 없습니다. · ${norm.peerLabel}`, color: "text-emerald-600" };
    if (score <= 14) return { text: `약간의 불면경향이 있습니다. · ${norm.peerLabel}`, color: "text-blue-600" };
    if (score <= 21) return { text: `중등도의 불면증이 있습니다. · ${norm.peerLabel}`, color: "text-orange-600" };
    return { text: `심한 불면증이 있습니다. · ${norm.peerLabel}`, color: "text-red-600" };
  }, [surveyScores.isi]);

  const adrenalEvaluation = useMemo(() => {
    const score = surveyScores.adrenal;
    if (score < 10) return { text: "비교적 양호한 상태입니다. 규칙적인 생활을 유지하세요.", color: "text-emerald-600" };
    if (score <= 25) return { text: "초기 부신피로 단계입니다. 스트레스 관리와 충분한 휴식이 필요합니다.", color: "text-orange-600" };
    return { text: "심한 부신피로 상태일 가능성이 높습니다. 식단 개선과 영양 보충, 전문가 상담이 권장됩니다.", color: "text-red-600" };
  }, [surveyScores.adrenal]);

  // 최종 판정 계산 - 서비스 위임으로 슬림화 (상세 로직은 services/finalAssessmentService 참조)
  const handleFinalAssessment = async (overrideStudyEfficiencyResults?: any) => {
    if (isCalculatingRef.current) return;
    isCalculatingRef.current = true;
    if (overrideStudyEfficiencyResults) {
      setStudyEfficiencyResults(overrideStudyEfficiencyResults);
    }
    setStep('loading');
    try {
      const finalResult = await runFinalAssessment({
        config,
        portableHrv,
        hrv,
        studyEfficiencyResults,
        overrideStudyEfficiencyResults,
        surveyScores,
        fatigueSymptoms,
        snsSymptomSelection,
        pnsSymptomSelection,
        learningTraitsData,
        student,
        protocol,
        analytics,
        bloodTest,
        cognitiveResults: {
          ...(cognitiveResults || {}),
          workingMemory: cognitiveResults?.workingMemory || workingMemoryResults || undefined
        } as CognitivePerformanceResults,
        medicalNotes,
        logicConfig,
        existingSurvey: result?.survey,
      });
      setResult(finalResult);
      // [소프트 게이트] 무료(3분/10분) 진단 완료 시 무료체험 사용 처리
      if (isFreeStudent || isQuickMode) {
        markFreeTrialUsed();
      }
      // [PRO 요금제 1회 제한] PRO 이용자 검사 완료 시 1회 소진 처리
      if (effectiveTier === 'pro') {
        UserTierService.markProAssessmentUsed(student);
      }
      // 진단 완료 이벤트 기록 (광고 퍼널 전환율 측정)
      logFunnelEvent('diagnosis_complete', getStoredAttribution());
      const historyItem = { ...finalResult, date: new Date().toISOString() };
      // 저장 완료를 보장(await)하여 저장 실패/경쟁 상태로 인한 기록 유실을 방지합니다.
      try {
        await unifiedSyncService.saveHistory(finalResult);
      } catch (err) {
        console.error('Failed to save to DB:', err);
      }
      const updatedHistory = [historyItem, ...history].slice(0, 50);
      setHistory(updatedHistory);
      // 'sn1_history' localStorage 미러는 unifiedSyncService.saveHistory()가 단일 관리(SSOT)합니다.
    } catch (err) {
      console.error('Failed to complete final assessment:', err);
    } finally {
      isCalculatingRef.current = false;
      setStep('results');
    }
  };

  // Step === 'loading' 또는 'results' 시 자동 복구 및 계산 완료 보장
  useEffect(() => {
    if (step === 'loading') {
      handleFinalAssessment();
    } else if (step === 'results' && !result) {
      handleFinalAssessment();
    }
  }, [step, result]);

  // --- 학부모 관찰 진단 모드 (URL ?mode=parent) — 최우선 분기 ---
  if (isParentMode) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-6 px-4">
        <ParentAssessmentFlow
          onExit={() => {
            setIsParentMode(false);
            window.history.replaceState({}, document.title, window.location.pathname);
            window.location.href = '/';
          }}
        />
      </div>
    );
  }

  // --- 0. Landing Page (index.html) Default View ---
  if (isLandingMode) {
    const landingParams = new URLSearchParams();
    if (currentUserRole) landingParams.set('role', currentUserRole);
    if (currentUserEmail) landingParams.set('email', currentUserEmail);
    if (student?.name) landingParams.set('name', student.name);
    if (effectiveTier) landingParams.set('tier', effectiveTier);
    const queryString = landingParams.toString() ? `?${landingParams.toString()}` : '';

    return (
      <div className="w-screen h-screen m-0 p-0 overflow-hidden bg-slate-950">
        <iframe
          src={`/landing.html${queryString}`}
          title="NBASS Landing"
          className="w-full h-full border-0"
        />
      </div>
    );
  }

  // --- Role Views & Owner Dashboard ---
  if (step === 'owner_dashboard') {
    return (
      <OwnerDashboardView
        onBack={() => setStep('role_selection')}
        onGoToStudentMode={() => setStep('register')}
        config={config}
        onConfigChange={setConfig}
        strategies={strategies}
        onStrategiesChange={setStrategies}
        prescriptions={prescriptions}
        onPrescriptionsChange={setPrescriptions}
        editingStrategyType={editingStrategyType}
        onEditingStrategyTypeChange={setEditingStrategyType}
        selectedSubjectOptions={selectedSubjectOptions}
        onSelectedSubjectOptionsChange={setSelectedSubjectOptions}
        logicConfig={logicConfig}
        onLogicConfigChange={handleLogicConfigChange}
        onResetLogicConfig={() => setLogicConfig(resetLogicConfig())}
        productRecommendations={productRecommendations}
        onProductRecommendationsChange={handleProductRecommendationsChange}
        onResetProductRecommendations={() => setProductRecommendations(resetProductRecommendations())}
        predictionRules={predictionRules}
        onPredictionRulesChange={handlePredictionRulesChange}
        onResetPredictionRules={() => setPredictionRules(resetPredictionRules())}
        aiModels={aiModels}
        onAiModelsChange={handleAiModelsChange}
        isAdminUnlocked={isAdminUnlocked}
      />
    );
  }
  if (step === 'student_directory') {
    return (
      <>
        <StudentDirectoryView
          onBack={() => setStep('role_selection')}
          onViewReport={(record) => {
            if (record.student) setStudent(record.student);
            if (record.hrv) setHrv(record.hrv);
            if (record.protocol) setProtocol(record.protocol);
            if (record.analytics) setAnalytics(record.analytics);
            setStep('results');
          }}
          onTestWithStudent={(studentData) => {
            const completeStudent: StudentInfo = {
              ...defaultStudent,
              ...studentData,
              testDate: getTodayStr()
            };
            setStudent(completeStudent);
            saveStudentProfile(completeStudent, currentUserEmail);
            setStep('register');
          }}
          onFollowUpTest={(record) => handleStartFollowUp(record)}
        />
        {renderFollowUpModals()}
      </>
    );
  }
  if (step === 'parent_directory') {
    return (
      <ParentDirectoryView
        onBack={() => setStep('role_selection')}
        onOpenParentMonitor={(record) => {
          if (record.student) setStudent(record.student);
          if (record.hrv) setHrv(record.hrv);
          if (record.protocol) setProtocol(record.protocol);
          if (record.analytics) setAnalytics(record.analytics);
          setStep('parent_dashboard');
        }}
        onViewReport={(record) => {
          if (record.student) setStudent(record.student);
          if (record.hrv) setHrv(record.hrv);
          if (record.protocol) setProtocol(record.protocol);
          if (record.analytics) setAnalytics(record.analytics);
          setStep('results');
        }}
      />
    );
  }
  if (step === 'role_selection') {
    return (
      <RoleSelectionView
        onHomeClick={() => {
          // 랜딩 페이지(index/landing.html) 처음 화면으로 복귀
          window.history.pushState({}, '', window.location.pathname);
          setIsLandingMode(true);
        }}
        onBackToStudent={() => setStep('register')}
        onSelectRole={(role, email, studentName) => {
          setCurrentUserRole(role);
          try {
            sessionManager.markSessionActive();
            localStorage.setItem('nbass_current_role', role);
            if (email) {
              setCurrentUserEmail(email);
              localStorage.setItem('nbass_current_email', email);
            }
          } catch { }

          if (role === 'STUDENT_DIRECTORY') {
            setStep('student_directory');
          } else if (role === 'PARENT_DIRECTORY' || role === 'PARENT') {
            setStep('parent_directory');
          } else if (role === 'STUDENT') {
            const cleanEmail = (email || currentUserEmail)?.trim().toLowerCase();
            const effectiveName = studentName?.trim() || (cleanEmail ? cleanEmail.split('@')[0] : '');
            loadStudentProfile(cleanEmail, effectiveName);
            setStep('register');
          } else if (role === 'OWNER') {
            setStep('owner_dashboard');
          } else if (role === 'MEDICAL_EXPERT' || role === 'ACADEMY_EXPERT' || role === 'EXPERT') {
            setStep('expert_dashboard');
          } else {
            setStep('register');
          }
        }}
      />
    );
  }
  if (step === 'parent_dashboard') {
    const sortedHistory = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return (
      <ParentDashboard
        studentName={sortedHistory[0]?.student.name || '학생'}
        recentResult={sortedHistory[0] || null}
        onViewReport={(record) => {
          const target = record || sortedHistory[0];
          if (target) {
            if (target.student) setStudent(target.student);
            if (target.hrv) setHrv(target.hrv);
            if (target.protocol) setProtocol(target.protocol);
            if (target.analytics) setAnalytics(target.analytics);
          }
          setStep('results');
        }}
        onLogout={() => setStep('parent_directory')}
      />
    );
  }
  if (step === 'expert_dashboard') {
    return (
      <ExpertDashboard
        history={history}
        expertRole={currentUserRole as any}
        onStartNewAssessment={() => {
          setStep('register');
        }}
        onViewReport={(res) => {
          setResult(res);
          setStep('results');
        }}
        onLogout={() => setStep('role_selection')}
      />
    );
  }

  // Common View Detail / Report handler
  const handleViewDetail = (record: AssessmentResult) => {
    setResult(record);

    // 사용자 UX상 결과 확인에서 '뒤로가기'를 누르면 해당 시점의 데이터가 보여야 함
    setStudent(record.student);
    setHrv(record.hrv);
    setProtocol(record.protocol);
    setAnalytics(record.analytics);

    if ((record.hrv as any).portableHrv) {
      setPortableHrv((record.hrv as any).portableHrv);
    }

    if (record.bloodTest) setBloodTest(record.bloodTest);
    if (record.medicalNotes) setMedicalNotes(record.medicalNotes);
    if ((record as any).adminMemo) setAdminMemo((record as any).adminMemo);

    const recordDate = (record as any).date || '';
    if (record.survey) {
      setStudyEfficiencyResults(mapSurveyDataToResults(record.survey, recordDate) as any);
      setBaiAnswers(new Array(21).fill(0));
    }

    setStep('results');
    setActiveMenu('assessment');
  };

  // 조용한 복구 안내 배너 (팝업 알림창 대신 상단에 세련되게 노출)
  const draftBannerElement = pendingDraft ? (
    <div className="mb-6 p-4 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-sm animate-in fade-in">
      <div className="flex items-center gap-3">
        <span className="text-2xl">📋</span>
        <div>
          <p className="font-bold text-slate-900 dark:text-white">
            작성 중이던 <strong>{pendingDraft.student?.name || '수험생'}</strong>님의 설문/검사 데이터가 있습니다.
          </p>
          <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
            이전 저장 일시: {new Date(pendingDraft.timestamp).toLocaleString()} ({pendingDraft.step} 단계)
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        <button
          onClick={dismissDraft}
          className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-all cursor-pointer"
        >
          삭제
        </button>
        <button
          onClick={recoverDraft}
          className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1 active:scale-95"
        >
          <span>✨</span>
          <span>이어서 작성하기</span>
        </button>
      </div>
    </div>
  ) : null;

  // --- Menu Views ---
  if (activeMenu === 'dashboard') {
    return (
      <Layout onHomeClick={handleHomeClickWithCheck}
        activeMenu={activeMenu}
        onMenuChange={handleMenuChangeWithCheck}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        onAdminClick={() => requestAdminAccess('config')}
        onAdminPortalClick={() => requestAdminAccess('portal')}
        onOwnerClick={() => setAuthRoleModal('OWNER')}
        studentName={student.name}
        studentId={student.id}
        membershipTier={effectiveTier}
        {...subscriptionProps}
        draftRecoveryBanner={draftBannerElement}
        incompleteModal={
          <IncompleteAssessmentModal
            isOpen={showIncompleteWarningModal}
            currentStep={step}
            studentName={student.name}
            onContinue={handleContinueAssessment}
            onLeave={handleConfirmLeave}
          />
        }
      >
        <DashboardView
          onStartClick={handleStartPrecisionAssessment}
          onHistoryClick={() => setActiveMenu('history')}
          onTrendClick={() => setShowHistoryAnalysisModal(true)}
          onResourcesClick={() => setActiveMenu('resources')}
          onViewReport={handleViewDetail}
          history={displayHistory}
          config={config}
          analystConfig={(logicConfig as any).analystConfig}
          currentStudent={student}
          membershipTier={effectiveTier}
          isFreeStudent={isFreeStudent}
        />
        <AdminPasswordModal isOpen={showAdminPassword} password={adminPasswordInput} onPasswordChange={setAdminPasswordInput} onConfirm={handleAdminUnlock} onCancel={() => { setShowAdminPassword(false); setAdminPasswordInput(''); }} />
        <ConfigModal />
        <HistoryAnalysisManager
          isOpen={showHistoryAnalysisModal}
          onClose={() => setShowHistoryAnalysisModal(false)}
          history={displayHistory}
          selectedStudentId={selectedStudentId}
          currentResult={result}
        />
        {authRoleModal && (
          <AuthLoginModal
            isOpen={!!authRoleModal}
            targetRole={authRoleModal}
            onClose={() => setAuthRoleModal(null)}
            onSuccess={(role, email, _linkedId, studentName) => {
              setAuthRoleModal(null);
              setCurrentUserRole(role);
              try {
                sessionManager.markSessionActive();
                localStorage.setItem('nbass_current_role', role);
                if (email) {
                  setCurrentUserEmail(email);
                  localStorage.setItem('nbass_current_email', email);
                }
              } catch { }

              if (role === 'STUDENT') {
                const cleanEmail = (email || currentUserEmail)?.trim().toLowerCase();
                const effectiveName = studentName?.trim() || (cleanEmail ? cleanEmail.split('@')[0] : '');
                loadStudentProfile(cleanEmail, effectiveName);
                setStep('register');
              } else if (role === 'OWNER') {
                setStep('owner_dashboard');
              } else if (role === 'PARENT') {
                setStep('parent_dashboard');
              } else if (role === 'MEDICAL_EXPERT' || role === 'ACADEMY_EXPERT' || role === 'EXPERT') {
                setStep('expert_dashboard');
              }
            }}
          />
        )}
      </Layout>
    );
  }
  if (activeMenu === 'history') {
    const handleImportData = (data: (AssessmentResult & { date: string })[], merge: boolean) => {
      if (merge) {
        // 병합: 중복 제거 (날짜 기준)
        const existingDates = new Set(history.map(h => h.date));
        const newData = data.filter(d => !existingDates.has(d.date));
        const merged = [...history, ...newData].sort((a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
        ).slice(0, 50); // 최대 50건 유지
        setHistory(merged);
        safeStorage.saveJSON('sn1_history', merged.slice(0, 5));
      } else {
        // 덮어쓰기
        setHistory(data);
        safeStorage.saveJSON('sn1_history', data.slice(0, 5));
      }
    };

    const handleExportJSON = () => {
      const jsonStr = JSON.stringify(history, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `mind-body-history-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };

    const handleExportCSV = () => {
      if (history.length === 0) {
        alert('내보낼 데이터가 없습니다.');
        return;
      }

      const headers = ['날짜', '이름', '나이', '성별', '진단 유형', '점수', 'BAI', 'ISI', '집중력', 'Brain Score', 'SNS', 'PNS', '피로도', '활력도'];
      const rows = history.map(record => [
        new Date(record.date).toLocaleString('ko-KR'),
        record.student.name,
        record.student.age,
        record.student.gender === 'Male' ? '남성' : '여성',
        record.careType,
        record.score,
        record.survey.bai,
        record.survey.isi,
        record.survey.concentrationScore,
        record.hrv.brainScore,
        record.hrv.sns,
        record.hrv.pns,
        record.hrv.fatigue,
        record.hrv.vitality
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `mind-body-history-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };

    const handleDeleteHistory = async (id: number) => {
      try {
        await DatabaseService.deleteHistory(id);
        const updatedHistory = history.filter((h: any) => h.id !== id);
        setHistory(updatedHistory);
        // Also update local storage safely if mirrored
        safeStorage.saveJSON('sn1_history', updatedHistory.slice(0, 5));
      } catch (err) {
        console.error('Failed to delete history', err);
        alert('삭제에 실패했습니다.');
      }
    };

    return (
      <Layout
        onHomeClick={handleHomeClickWithCheck}
        activeMenu={activeMenu}
        onMenuChange={handleMenuChangeWithCheck}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        onAdminClick={() => requestAdminAccess('config')}
        onAdminPortalClick={() => requestAdminAccess('portal')}
        studentName={student.name}
        studentId={student.id}
        membershipTier={effectiveTier}
        {...subscriptionProps}
        incompleteModal={
          <IncompleteAssessmentModal
            isOpen={showIncompleteWarningModal}
            currentStep={step}
            studentName={student.name}
            onContinue={handleContinueAssessment}
            onLeave={handleConfirmLeave}
          />
        }
      >
        {/* History View: Accessible to All Roles (Students, Parents, Experts, Owners) */}
        <HistoryView
          history={displayHistory}
          selectedStudentId={selectedStudentId}
          onSelectStudent={setSelectedStudentId}
          onStartClick={handleStartPrecisionAssessment}
          onViewDetail={handleViewDetail}
          onImportData={handleImportData}
          onExportJSON={handleExportJSON}
          onExportCSV={handleExportCSV}
          onTrendClick={() => {
            console.log("📈 Global Trend Analysis Clicked!");
            setShowHistoryAnalysisModal(true);
          }}
          onDeleteRecord={handleDeleteHistory}
          isStudentRole={currentUserRole === 'STUDENT' || currentUserRole === 'PARENT'}
          isFreeStudent={(currentUserRole === 'STUDENT' || currentUserRole === 'PARENT') && (!effectiveTier || effectiveTier === 'free')}
          isExpertOrOwner={currentUserRole === 'MEDICAL_EXPERT' || currentUserRole === 'OWNER' || currentUserRole === 'ACADEMY_EXPERT'}
          studentName={student.name}
        />
        <AdminPasswordModal isOpen={showAdminPassword} password={adminPasswordInput} onPasswordChange={setAdminPasswordInput} onConfirm={handleAdminUnlock} onCancel={() => { setShowAdminPassword(false); setAdminPasswordInput(''); }} />
        <ConfigModal />
        <HistoryAnalysisManager
          isOpen={showHistoryAnalysisModal}
          onClose={() => setShowHistoryAnalysisModal(false)}
          history={displayHistory}
          selectedStudentId={selectedStudentId}
          currentResult={result}
        />
      </Layout>
    );
  }
  if (activeMenu === 'progress') {
    return (
      <Layout
        onHomeClick={handleHomeClickWithCheck}
        activeMenu={activeMenu}
        onMenuChange={handleMenuChangeWithCheck}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        onAdminClick={() => requestAdminAccess('config')}
        onAdminPortalClick={() => requestAdminAccess('portal')}
        studentName={student.name}
        studentId={student.id}
        membershipTier={effectiveTier}
        {...subscriptionProps}
        incompleteModal={
          <IncompleteAssessmentModal
            isOpen={showIncompleteWarningModal}
            currentStep={step}
            studentName={student.name}
            onContinue={handleContinueAssessment}
            onLeave={handleConfirmLeave}
          />
        }
      >
        <ProgressView
          history={displayHistory}
          selectedStudentId={selectedStudentId}
          onSelectStudent={setSelectedStudentId}
          onStartClick={handleStartPrecisionAssessment}
        />
        <AdminPasswordModal isOpen={showAdminPassword} password={adminPasswordInput} onPasswordChange={setAdminPasswordInput} onConfirm={handleAdminUnlock} onCancel={() => { setShowAdminPassword(false); setAdminPasswordInput(''); }} />
        <ConfigModal />
      </Layout>
    );
  }
  // ========== 성장 타임라인 통합 화면 (P1-5) ==========
  if (activeMenu === 'growth') {
    return (
      <Layout
        onHomeClick={handleHomeClickWithCheck}
        activeMenu={activeMenu}
        onMenuChange={handleMenuChangeWithCheck}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        onAdminClick={() => requestAdminAccess('config')}
        onAdminPortalClick={() => requestAdminAccess('portal')}
        studentName={student.name}
        studentId={student.id}
        membershipTier={effectiveTier}
        {...subscriptionProps}
        incompleteModal={
          <IncompleteAssessmentModal
            isOpen={showIncompleteWarningModal}
            currentStep={step}
            studentName={student.name}
            onContinue={handleContinueAssessment}
            onLeave={handleConfirmLeave}
          />
        }
      >
        <GrowthTimelineView
          history={displayHistory as never}
          studentName={student.name}
          birthDate={student.birthDate}
          studentId={student.id}
        />
        <AdminPasswordModal isOpen={showAdminPassword} password={adminPasswordInput} onPasswordChange={setAdminPasswordInput} onConfirm={handleAdminUnlock} onCancel={() => { setShowAdminPassword(false); setAdminPasswordInput(''); }} />
        <ConfigModal />
      </Layout>
    );
  }
  if (activeMenu === 'resources') {
    return (
      <Layout
        onHomeClick={handleHomeClickWithCheck}
        activeMenu={activeMenu}
        onMenuChange={handleMenuChangeWithCheck}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        onAdminClick={() => requestAdminAccess('config')}
        onAdminPortalClick={() => requestAdminAccess('portal')}
        studentName={student.name}
        studentId={student.id}
        membershipTier={effectiveTier}
        {...subscriptionProps}
        incompleteModal={
          <IncompleteAssessmentModal
            isOpen={showIncompleteWarningModal}
            currentStep={step}
            studentName={student.name}
            onContinue={handleContinueAssessment}
            onLeave={handleConfirmLeave}
          />
        }
      >
        <ResourcesView />
        <AdminPasswordModal isOpen={showAdminPassword} password={adminPasswordInput} onPasswordChange={setAdminPasswordInput} onConfirm={handleAdminUnlock} onCancel={() => { setShowAdminPassword(false); setAdminPasswordInput(''); }} />
        <ConfigModal />
      </Layout>
    );
  }
  if (activeMenu === 'schedule') {
    const isScheduleAllowed = effectiveTier === 'premium_plus' || effectiveTier === 'vip' || effectiveTier === 'expert' || currentUserRole === 'OWNER' || currentUserRole === 'MEDICAL_EXPERT' || currentUserRole === 'EXPERT';

    return (
      <Layout
        onHomeClick={handleHomeClickWithCheck}
        activeMenu={activeMenu}
        onMenuChange={handleMenuChangeWithCheck}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        onAdminClick={() => requestAdminAccess('config')}
        onAdminPortalClick={() => requestAdminAccess('portal')}
        studentName={student.name}
        studentId={student.id}
        membershipTier={effectiveTier}
        {...subscriptionProps}
        incompleteModal={
          <IncompleteAssessmentModal
            isOpen={showIncompleteWarningModal}
            currentStep={step}
            studentName={student.name}
            onContinue={handleContinueAssessment}
            onLeave={handleConfirmLeave}
          />
        }
      >
        {isScheduleAllowed ? (
          <ScheduleManagementView
            student={student}
            history={displayHistory}
            aiModels={aiModels}
            onBack={() => setActiveMenu('results')}
          />
        ) : (
          <div className="max-w-4xl mx-auto py-12 px-4 animate-in fade-in duration-500 text-center">
            <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-12 rounded-[2.5rem] border border-fuchsia-400/40 shadow-2xl relative overflow-hidden">
              <div className="w-20 h-20 bg-fuchsia-500/20 text-fuchsia-400 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 border border-fuchsia-400/30">
                📅
              </div>
              <div className="inline-block px-3 py-1 bg-fuchsia-500/20 border border-fuchsia-400/40 text-fuchsia-300 rounded-full text-xs font-black mb-3">
                PREMIUM PLUS EXCLUSIVE
              </div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white mb-3">
                스마트 케어 스케줄 관리
              </h2>
              <p className="text-slate-300 max-w-xl mx-auto text-sm sm:text-base leading-relaxed mb-8">
                학생의 뇌 피로도 및 자율신경 진단 결과와 연동되는
                <strong> 서큘러 24시간 시간표, 맞춤 뽀모도로 루틴, D-Day 시험 플래너</strong>는
                <strong> PREMIUM PLUS 이상 회원 전용</strong>으로 제공됩니다.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => setShowPricingModal(true)}
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-black rounded-2xl shadow-lg shadow-fuchsia-500/20 active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
                >
                  <span>✨</span>
                  <span>PREMIUM PLUS 이상으로 업그레이드하기</span>
                </button>
                <button
                  onClick={() => setActiveMenu('results')}
                  className="w-full sm:w-auto px-6 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl border border-slate-700 text-sm transition-all"
                >
                  검사결과로 돌아가기
                </button>
              </div>
            </div>
          </div>
        )}
        <AdminPasswordModal isOpen={showAdminPassword} password={adminPasswordInput} onPasswordChange={setAdminPasswordInput} onConfirm={handleAdminUnlock} onCancel={() => { setShowAdminPassword(false); setAdminPasswordInput(''); }} />
        <ConfigModal />
      </Layout>
    );
  }
  if (activeMenu === 'habits') {
    const isHabitsAllowed = effectiveTier === 'premium_plus' || effectiveTier === 'vip' || effectiveTier === 'expert' || currentUserRole === 'OWNER' || currentUserRole === 'MEDICAL_EXPERT' || currentUserRole === 'EXPERT';

    return (
      <Layout
        onHomeClick={handleHomeClickWithCheck}
        activeMenu={activeMenu}
        onMenuChange={handleMenuChangeWithCheck}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        onAdminClick={() => requestAdminAccess('config')}
        onAdminPortalClick={() => requestAdminAccess('portal')}
        studentName={student.name}
        studentId={student.id}
        membershipTier={effectiveTier}
        {...subscriptionProps}
        incompleteModal={
          <IncompleteAssessmentModal
            isOpen={showIncompleteWarningModal}
            currentStep={step}
            studentName={student.name}
            onContinue={handleContinueAssessment}
            onLeave={handleConfirmLeave}
          />
        }
      >
        {isHabitsAllowed ? (
          <HabitClinicView
            student={student}
            membershipTier={effectiveTier}
            onUpgradeClick={() => {
              setSubscriptionTriggerReason('수험생 공부습관 교정 클리닉(Habit Clinic)은 PREMIUM PLUS 등급 이상에서 이용 가능합니다.');
              setSubscriptionInitialTier('premium_plus');
              setShowSubscriptionModal(true);
            }}
            onBack={() => setActiveMenu('results')}
          />
        ) : (
          <div className="max-w-4xl mx-auto py-12 px-4 animate-in fade-in duration-500 text-center">
            <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-12 rounded-[2.5rem] border border-fuchsia-400/40 shadow-2xl relative overflow-hidden">
              <div className="w-20 h-20 bg-fuchsia-500/20 text-fuchsia-400 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 border border-fuchsia-400/30">
                🧬
              </div>
              <div className="inline-block px-3 py-1 bg-fuchsia-500/20 border border-fuchsia-400/40 text-fuchsia-300 rounded-full text-xs font-black mb-3">
                PREMIUM PLUS EXCLUSIVE
              </div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white mb-3">
                수험생 공부습관 교정 클리닉 (Habit Clinic)
              </h2>
              <p className="text-slate-300 max-w-xl mx-auto text-sm sm:text-base leading-relaxed mb-8">
                가짜 공부(Fake Study) 퇴치, 10대 뇌신경 행동 교정 프로토콜(Rx), IF-THEN 신경망 조건반사 스위치 및
                <strong> 3단계 물리적 차단 솔루션은 PREMIUM PLUS 이상 회원 전용</strong>으로 제공됩니다.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setSubscriptionTriggerReason('수험생 공부습관 교정 클리닉(Habit Clinic)은 PREMIUM PLUS 등급 이상에서 이용 가능합니다.');
                    setSubscriptionInitialTier('premium_plus');
                    setShowSubscriptionModal(true);
                  }}
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-black rounded-2xl shadow-lg shadow-fuchsia-500/20 active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
                >
                  <span>✨</span>
                  <span>PREMIUM PLUS(₩19,900/월)로 업그레이드하기</span>
                </button>
                <button
                  onClick={() => setActiveMenu('results')}
                  className="w-full sm:w-auto px-6 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl border border-slate-700 text-sm transition-all"
                >
                  검사결과로 돌아가기
                </button>
              </div>
            </div>
          </div>
        )}
        <AdminPasswordModal isOpen={showAdminPassword} password={adminPasswordInput} onPasswordChange={setAdminPasswordInput} onConfirm={handleAdminUnlock} onCancel={() => { setShowAdminPassword(false); setAdminPasswordInput(''); }} />
        <ConfigModal />
      </Layout>
    );
  }
  if (activeMenu === 'sleep') {
    const isSleepAllowed = effectiveTier === 'vip' || effectiveTier === 'expert' || currentUserRole === 'OWNER' || currentUserRole === 'MEDICAL_EXPERT' || currentUserRole === 'EXPERT';

    return (
      <Layout
        onHomeClick={handleHomeClickWithCheck}
        activeMenu={activeMenu}
        onMenuChange={handleMenuChangeWithCheck}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        onAdminClick={() => requestAdminAccess('config')}
        onAdminPortalClick={() => requestAdminAccess('portal')}
        studentName={student.name}
        studentId={student.id}
        membershipTier={effectiveTier}
        {...subscriptionProps}
        incompleteModal={
          <IncompleteAssessmentModal
            isOpen={showIncompleteWarningModal}
            currentStep={step}
            studentName={student.name}
            onContinue={handleContinueAssessment}
            onLeave={handleConfirmLeave}
          />
        }
      >
        {isSleepAllowed ? (
          <SleepManagementView
            student={student}
            onBack={() => setActiveMenu('results')}
            currentAssessment={result || undefined}
            aiModels={aiModels}
            membershipTier={effectiveTier}
          />
        ) : (
          <div className="max-w-4xl mx-auto py-12 px-4 animate-in fade-in duration-500 text-center">
            <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-12 rounded-[2.5rem] border border-amber-400/40 shadow-2xl relative overflow-hidden">
              <div className="w-20 h-20 bg-indigo-500/20 text-indigo-400 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 border border-indigo-400/30">
                🌙
              </div>
              <div className="inline-block px-3 py-1 bg-amber-400/20 border border-amber-400/40 text-amber-300 rounded-full text-xs font-black mb-3">
                VIP MEMBERSHIP EXCLUSIVE
              </div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white mb-3">
                맞춤형 수면 관리 & 서카디안 리듬
              </h2>
              <p className="text-slate-300 max-w-xl mx-auto text-sm sm:text-base leading-relaxed mb-8">
                크로노타입(MEQ 아침형/저녁형) 분석, 일주기 렘/논렘(NREM) 수면 주기 계산기 및
                <strong> 수면 부채 해소 솔루션은 VIP 회원 전용</strong>으로 제공됩니다.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => setShowPricingModal(true)}
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-2xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
                >
                  <span>💎</span>
                  <span>VIP 멤버십으로 업그레이드하기</span>
                </button>
                <button
                  onClick={() => setActiveMenu('results')}
                  className="w-full sm:w-auto px-6 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl border border-slate-700 text-sm transition-all"
                >
                  검사결과로 돌아가기
                </button>
              </div>
            </div>
          </div>
        )}
        <AdminPasswordModal isOpen={showAdminPassword} password={adminPasswordInput} onPasswordChange={setAdminPasswordInput} onConfirm={handleAdminUnlock} onCancel={() => { setShowAdminPassword(false); setAdminPasswordInput(''); }} />
        <ConfigModal />
      </Layout>
    );
  }
  if (activeMenu === 'wrongnotes') {
    const isWrongNotesAllowed = effectiveTier === 'vip' || effectiveTier === 'expert' || currentUserRole === 'OWNER' || currentUserRole === 'MEDICAL_EXPERT' || currentUserRole === 'EXPERT';

    return (
      <Layout
        onHomeClick={handleHomeClickWithCheck}
        activeMenu={activeMenu}
        onMenuChange={handleMenuChangeWithCheck}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        onAdminClick={() => requestAdminAccess('config')}
        onAdminPortalClick={() => requestAdminAccess('portal')}
        studentName={student.name}
        studentId={student.id}
        membershipTier={effectiveTier}
        {...subscriptionProps}
        incompleteModal={
          <IncompleteAssessmentModal
            isOpen={showIncompleteWarningModal}
            currentStep={step}
            studentName={student.name}
            onContinue={handleContinueAssessment}
            onLeave={handleConfirmLeave}
          />
        }
      >
        {isWrongNotesAllowed ? (
          <WrongNotes
            wrongNotes={wrongNotes}
            setWrongNotes={setWrongNotes}
            careType={result?.careType || CareType.HEALTHY}
          />
        ) : (
          <div className="max-w-4xl mx-auto py-12 px-4 animate-in fade-in duration-500 text-center">
            <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-12 rounded-[2.5rem] border border-amber-400/40 shadow-2xl relative overflow-hidden">
              <div className="w-20 h-20 bg-amber-400/20 text-amber-400 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 border border-amber-400/30">
                📝
              </div>
              <div className="inline-block px-3 py-1 bg-amber-400/20 border border-amber-400/40 text-amber-300 rounded-full text-xs font-black mb-3">
                VIP MEMBERSHIP EXCLUSIVE
              </div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white mb-3">
                뉴로바이오 오답노트 처방
              </h2>
              <p className="text-slate-300 max-w-xl mx-auto text-sm sm:text-base leading-relaxed mb-8">
                단순 오답 정리가 아닌 <strong>뇌 피로도 및 인지 오류 메커니즘 분석 기반 AI 오답 처방 솔루션은 VIP 회원 전용</strong>으로 제공됩니다.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => setShowPricingModal(true)}
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-2xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>💎</span>
                  <span>VIP 멤버십으로 업그레이드하기</span>
                </button>
                <button
                  onClick={() => setActiveMenu('results')}
                  className="w-full sm:w-auto px-6 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl border border-slate-700 text-sm transition-all cursor-pointer"
                >
                  검사결과로 돌아가기
                </button>
              </div>
            </div>
          </div>
        )}
        <AdminPasswordModal isOpen={showAdminPassword} password={adminPasswordInput} onPasswordChange={setAdminPasswordInput} onConfirm={handleAdminUnlock} onCancel={() => { setShowAdminPassword(false); setAdminPasswordInput(''); }} />
        <ConfigModal />
      </Layout>
    );
  }

  if (activeMenu === 'solutions') {
    const isVipAllowed = effectiveTier === 'vip' || effectiveTier === 'expert' || currentUserRole === 'OWNER' || currentUserRole === 'MEDICAL_EXPERT' || currentUserRole === 'EXPERT';

    return (
      <Layout
        onHomeClick={handleHomeClickWithCheck}
        activeMenu={activeMenu}
        onMenuChange={handleMenuChangeWithCheck}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        onAdminClick={() => requestAdminAccess('config')}
        onAdminPortalClick={() => requestAdminAccess('portal')}
        studentName={student.name}
        studentId={student.id}
        membershipTier={effectiveTier}
        {...subscriptionProps}
        incompleteModal={
          <IncompleteAssessmentModal
            isOpen={showIncompleteWarningModal}
            currentStep={step}
            studentName={student.name}
            onContinue={handleContinueAssessment}
            onLeave={handleConfirmLeave}
          />
        }
      >
        {isVipAllowed ? (
          <StressCareLabView student={student} history={displayHistory} />
        ) : (
          <div className="max-w-4xl mx-auto py-12 px-4 animate-in fade-in duration-500 text-center">
            <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-12 rounded-[2.5rem] border border-amber-400/40 shadow-2xl relative overflow-hidden">
              <div className="w-20 h-20 bg-amber-400/20 text-amber-400 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 border border-amber-400/30">
                👑
              </div>
              <div className="inline-block px-3 py-1 bg-amber-400/20 border border-amber-400/40 text-amber-300 rounded-full text-xs font-black mb-3">
                VIP MEMBERSHIP EXCLUSIVE
              </div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white mb-3">
                멘탈 가이드 (Stress Care Lab)
              </h2>
              <p className="text-slate-300 max-w-xl mx-auto text-sm sm:text-base leading-relaxed mb-8">
                신경계 맞춤 실전 타임라인 처방, 4-7-8 호흡 트레이너, 5-4-3-2-1 감각 앵커링 등
                <strong> 수험생 심층 멘탈 클리닉은 VIP 회원 전용</strong>으로 제공됩니다.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => setShowPricingModal(true)}
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-2xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
                >
                  <span>💎</span>
                  <span>VIP 멤버십으로 업그레이드하기</span>
                </button>
                <button
                  onClick={() => setActiveMenu('results')}
                  className="w-full sm:w-auto px-6 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl border border-slate-700 text-sm transition-all"
                >
                  검사결과로 돌아가기
                </button>
              </div>
            </div>
          </div>
        )}
        <AdminPasswordModal isOpen={showAdminPassword} password={adminPasswordInput} onPasswordChange={setAdminPasswordInput} onConfirm={handleAdminUnlock} onCancel={() => { setShowAdminPassword(false); setAdminPasswordInput(''); }} />
        <ConfigModal />
      </Layout>
    );
  }
  // ------------------

  if (step === 'register') {
    const canSearchStudent = currentUserRole === 'MEDICAL_EXPERT' || currentUserRole === 'ACADEMY_EXPERT' || currentUserRole === 'EXPERT' || currentUserRole === 'OWNER';

    return (
      <Layout
        onHomeClick={handleHomeClickWithCheck}
        activeMenu={activeMenu}
        onMenuChange={handleMenuChangeWithCheck}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        onAdminClick={() => requestAdminAccess('config')}
        onAdminPortalClick={() => requestAdminAccess('portal')}
        studentName={student.name}
        studentId={student.id}
        membershipTier={effectiveTier}
        {...subscriptionProps}
        incompleteModal={
          <IncompleteAssessmentModal
            isOpen={showIncompleteWarningModal}
            currentStep={step}
            studentName={student.name}
            onContinue={handleContinueAssessment}
            onLeave={handleConfirmLeave}
          />
        }
      >
        <StepProgressBar currentStep={step} isMedicalMode={config.isMedicalMode} isPortableMode={config.usePortable} onStepClick={setStep as any} studentInfo={student} />
        <div className="max-w-5xl mx-auto bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 mt-6">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white relative" style={{ background: 'linear-gradient(to right, #2563eb, #4338ca)', color: '#ffffff' }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-2xl font-black tracking-tight text-white">Student Registration</h2>
                  {/* 회원 등급 배지 (한눈에 확인) */}
                  <div className={`px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 shadow-md border ${effectiveTier === 'expert'
                    ? 'bg-purple-900/90 text-purple-200 border-purple-400'
                    : effectiveTier === 'vip'
                      ? 'bg-amber-400 text-slate-950 border-amber-300 font-black'
                      : effectiveTier === 'premium_plus'
                        ? 'bg-fuchsia-600 text-white border-fuchsia-400'
                        : effectiveTier === 'premium'
                          ? 'bg-indigo-600 text-white border-indigo-400'
                          : effectiveTier === 'pro'
                            ? 'bg-blue-500 text-white border-blue-300'
                            : 'bg-slate-800/80 text-slate-200 border-slate-600'
                    }`}>
                    <span>{TIER_INFO[effectiveTier]?.icon || '🌱'}</span>
                    <span>{TIER_INFO[effectiveTier]?.name || 'FREE (무료 회원)'}</span>
                  </div>
                </div>
                <p className="text-blue-100 text-xs sm:text-sm mt-1.5">
                  기본 정보를 입력하여 진단을 시작하십시오.
                  {effectiveTier === 'free' ? (
                    <span className="ml-1 text-amber-200 font-semibold">(🌱 무료 체험 모드 작동 중)</span>
                  ) : (
                    <span className="ml-1 text-emerald-200 font-semibold">(✨ {effectiveTier.toUpperCase()} 등급 파이프라인 적용)</span>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                {/* 등급 전환 (PREMIUM 이상) 버튼 */}
                <button
                  type="button"
                  onClick={() => setShowPricingModal(true)}
                  className="bg-gradient-to-r from-amber-400 via-rose-400 to-indigo-400 hover:brightness-105 text-slate-950 px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-md active:scale-95 border border-white/40"
                  title="PREMIUM 이상 요금제 및 회원 등급 전환"
                >
                  <span>💎</span>
                  <span>등급 전환 (PREMIUM 이상)</span>
                </button>

                {/* 관련기록 저장 버튼 (상단) */}
                <button
                  type="button"
                  onClick={handleSaveStudentRegistration}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-sm border active:scale-95 ${justSaved
                    ? 'bg-emerald-500 text-white border-emerald-300 ring-2 ring-emerald-300/40 animate-pulse'
                    : isRegistrationSaved
                      ? 'bg-emerald-500/80 hover:bg-emerald-500 text-white border-emerald-300'
                      : 'bg-white/20 hover:bg-white/30 text-white border-white/30'
                    }`}
                  title="학생 정보 및 과목 설정 저장 (언제든 추가 저장 가능)"
                >
                  <span>{justSaved ? '✓' : '💾'}</span>
                  <span>{justSaved ? '저장 완료!' : '관련기록 저장'}</span>
                </button>
              </div>
            </div>
          </div>
          <div className="p-8 space-y-6">
            {/* PRO 1회 스타터 패스 검사 완료 안내 배너 */}
            {isProCompleted && (
              <div className="p-5 bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-rose-500/15 border-2 border-amber-400/80 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-slate-900 dark:text-slate-100 shadow-md animate-in fade-in">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-2xl shrink-0 shadow-md">
                    ⚡
                  </div>
                  <div>
                    <h4 className="font-black text-sm sm:text-base text-amber-950 dark:text-amber-200">
                      PRO 1회 스타터 패스 정밀 검사가 완료되었습니다.
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      PRO 패스는 1회 정밀 진단 전용 상품입니다. 추가 정밀 검사는 <strong>정기구독(PREMIUM 등)</strong>으로 업그레이드 후 이용 가능합니다.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                  {result && (
                    <button
                      type="button"
                      onClick={() => setStep('results')}
                      className="flex-1 sm:flex-initial px-4 py-2.5 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all shadow-sm"
                    >
                      📊 기존 결과 보기
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setSubscriptionTriggerReason('PRO 1회 스타터 패스 검사가 이미 완료되었습니다. 추가 검사는 정기구독(PREMIUM 등)으로 업그레이드 후 이용 가능합니다.');
                      setSubscriptionInitialTier('premium');
                      setShowSubscriptionModal(true);
                    }}
                    className="flex-1 sm:flex-initial px-4 py-2.5 bg-gradient-to-r from-amber-500 to-rose-500 hover:brightness-105 text-white font-black text-xs rounded-xl transition-all shadow-md active:scale-95"
                  >
                    💎 정기구독 업그레이드
                  </button>
                </div>
              </div>
            )}

            {/* 이전 프로필 자동 복원 시 학년 확인 알림 배너 */}
            {isProfileLoadedFromPrevious && (
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl flex items-center justify-between text-xs text-blue-900 shadow-sm animate-in fade-in">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📋</span>
                  <div>
                    <p className="font-bold text-slate-800">이전 등록 정보가 자동으로 유지되었습니다.</p>
                    <p className="text-blue-700 text-[11px] mt-0.5">새 학년 진학 여부 등 <strong>현재 학년(Grade)이 맞는지</strong> 확인해 주세요.</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-amber-500 text-white rounded-lg font-bold text-[10px] shadow-sm shrink-0">
                  학년 확인 요망
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Serial ID (자동 생성)</label>
                <div className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-mono text-sm">{student.id}</div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">검사일자 (Test Date)</label>
                <input type="date" value={student.testDate} onChange={e => setStudent({ ...student, testDate: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" />
              </div>
              <div className="space-y-2 relative">
                <label className="text-sm font-bold text-slate-700">이름 (Full Name)</label>
                {canSearchStudent ? (
                  <>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="이름을 입력하세요"
                        value={student.name}
                        onChange={e => setStudent({ ...student, name: e.target.value })}
                        onKeyDown={e => e.key === 'Enter' && handleSearchStudent()}
                        className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                      />
                      <button
                        onClick={handleSearchStudent}
                        disabled={isSearching}
                        className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold flex items-center gap-2 disabled:opacity-50"
                      >
                        {isSearching ? '🔄' : '🔍'} 검색
                      </button>
                    </div>

                    {/* 검색 결과 팝업 */}
                    {showStudentSearch && (
                      <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden max-h-80 overflow-y-auto">
                        <div className="p-3 bg-slate-100 border-b flex justify-between items-center sticky top-0">
                          <span className="font-bold text-slate-700">🔍 검색 결과 ({studentSearchResults.length}명)</span>
                          <button onClick={() => setShowStudentSearch(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>
                        {studentSearchResults.length === 0 ? (
                          <div className="p-6 text-center text-slate-400">
                            <p className="text-lg mb-2">❌ 일치하는 학생이 없습니다</p>
                            <p className="text-sm">새 학생으로 등록을 진행하세요.</p>
                          </div>
                        ) : (
                          studentSearchResults.map((result, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSelectSearchedStudent(result.student)}
                              className="w-full p-4 text-left hover:bg-blue-50 border-b last:border-0 transition-all"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-bold text-slate-800">{result.student.name}</p>
                                  <p className="text-xs text-slate-500">
                                    {result.student.birthDate && `생년월일: ${result.student.birthDate}`}
                                    {result.student.grade && ` | ${result.student.grade}`}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-bold">
                                    검사 {result.count}회
                                  </span>
                                  <p className="text-[10px] text-slate-400 mt-1">
                                    마지막: {new Date(result.latestDate).toLocaleDateString('ko-KR')}
                                  </p>
                                </div>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="이름을 입력하세요 (예: 홍길동)"
                      value={student.name}
                      onChange={e => setStudent({ ...student, name: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all font-bold text-slate-800"
                    />
                    {isProfileLoadedFromPrevious && student.name?.trim() && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg font-medium border border-blue-100">
                        수정 가능
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-slate-700">학년 (Grade)</label>
                  {isProfileLoadedFromPrevious && (
                    <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      ⚡ 학년 확인 요망
                    </span>
                  )}
                </div>
                <select
                  value={normalizeGrade(student.grade)}
                  onChange={e => setStudent({ ...student, grade: e.target.value })}
                  className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all ${isProfileLoadedFromPrevious ? 'border-amber-400 ring-1 ring-amber-300' : 'border-slate-200'
                    }`}
                >
                  {GRADE_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-700">소속 학원 / 학교 (Academy / School)</label>
                  {currentUserRole === 'STUDENT' && (
                    <span className="text-[11px] text-slate-400">오너가 등록한 제휴 학원만 선택 가능</span>
                  )}
                </div>
                {(() => {
                  const academyNames = AffiliatedAcademyService.getNames();
                  return (
                    <select
                      value={student.academyName || ''}
                      onChange={e => setStudent({ ...student, academyName: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-sm"
                    >
                      <option value="">무소속 (독립 수험생)</option>
                      {academyNames.length === 0 ? (
                        <option disabled value="__none__">— 등록된 제휴 학원 없음 (오너 문의) —</option>
                      ) : (
                        academyNames.map(name => (
                          <option key={name} value={name}>{name}</option>
                        ))
                      )}
                    </select>
                  );
                })()}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">생년월일 (Birthdate)</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="YYYY"
                    value={getBirthParts().year}
                    onChange={e => handleBirthPartChange('year', e.target.value)}
                    className="w-24 px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-center font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  />
                  <span className="text-slate-400 font-bold">년</span>
                  <input
                    ref={birthMonthRef}
                    type="text"
                    inputMode="numeric"
                    maxLength={2}
                    placeholder="MM"
                    value={getBirthParts().month}
                    onChange={e => handleBirthPartChange('month', e.target.value)}
                    className="w-16 px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-center font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  />
                  <span className="text-slate-400 font-bold">월</span>
                  <input
                    ref={birthDayRef}
                    type="text"
                    inputMode="numeric"
                    maxLength={2}
                    placeholder="DD"
                    value={getBirthParts().day}
                    onChange={e => handleBirthPartChange('day', e.target.value)}
                    className="w-16 px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-center font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  />
                  <span className="text-slate-400 font-bold">일</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">나이 (Age)</label>
                <div className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-bold">{student.age} 세</div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-slate-700">성별 (Gender)</label>
                <div className="flex gap-4">
                  {['Male', 'Female'].map((g) => (
                    <button
                      key={g}
                      onClick={() => setStudent({ ...student, gender: g as any })}
                      className={`flex-1 py-3 rounded-xl font-bold transition-all border ${student.gender === g ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-slate-400 border-slate-200'}`}
                    >
                      {g === 'Male' ? '남성' : '여성'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 md:col-span-2 bg-slate-50 p-6 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
                  <h3 className="text-sm font-black text-indigo-600 uppercase tracking-wider">수능 과목 선택 (Subject Selection)</h3>
                  {isFreeStudent ? (
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">🌱 무료체험 (국/영/수 택1)</span>
                  ) : (
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">👑 {effectiveTier.toUpperCase()} 전과목 다중 선택 가능</span>
                  )}
                </div>

                <div className="space-y-6">
                  {/* 1. 공통/필수 영역 (기본 응시 + 가장 부담되는 과목 원클릭 다중/단일 선택) */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <label className="text-xs font-black text-slate-700 uppercase flex items-center gap-1.5">
                        <span>📚</span> 1. 공통/필수 과목 (기본 응시)
                      </label>
                      {isFreeStudent ? (
                        <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 flex items-center gap-1">
                          <span>⚡</span> 가장 부담되는 과목 1개를 선택하세요 (국·영·수 택1)
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 flex items-center gap-1">
                          <span>⚡</span> 가장 부담되는 과목을 클릭하세요 (다중 선택 가능)
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      수능 필수 4과목은 기본 포함됩니다. <strong>현재 가장 스트레스/불안을 느끼는 취약 과목</strong>을 선택하시면 AI 솔루션이 해당 과목에 집중 설계됩니다.
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                      {SUNEUNG_SUBJECTS.filter(s => s.category === 'common' || s.category === 'required').map(subj => {
                        const isFocused = isFreeStudent
                          ? ((student.focusSubjects && student.focusSubjects.length > 0)
                            ? student.focusSubjects[0] === subj.id
                            : student.weakSubject === subj.id)
                          : ((student.focusSubjects || []).includes(subj.id) || student.weakSubject === subj.id);
                        const isLocked = isFreeStudent && subj.id === 'korean_history';

                        return (
                          <button
                            key={subj.id}
                            type="button"
                            onClick={() => {
                              if (isLocked) {
                                showToast('한국사는 유료 회원(PRO 이상) 전용 과목입니다.');
                                return;
                              }

                              // Ensure common subjects are always in selectedSubjects
                              const commonIds = ['korean', 'math', 'english', 'korean_history'];
                              const baseSelected = Array.from(new Set([...(student.selectedSubjects || []), ...commonIds]));

                              let newFocus: string[];
                              if (isFreeStudent) {
                                if (isFocused) {
                                  // 이미 선택된 과목 재클릭 시 해제
                                  newFocus = [];
                                } else {
                                  // 무료체험: 국/영/수 중 1개만 단일 선택 (기존 선택 자동 대체)
                                  newFocus = [subj.id];
                                }
                              } else {
                                // Pro 이상: 자유로운 다중 선택 허용
                                newFocus = isFocused
                                  ? (student.focusSubjects || []).filter(id => id !== subj.id)
                                  : [...(student.focusSubjects || []), subj.id];
                              }

                              const newWeak = newFocus.length > 0 ? (newFocus[0] as any) : undefined;

                              setStudent({
                                ...student,
                                selectedSubjects: baseSelected,
                                focusSubjects: newFocus,
                                weakSubject: newWeak
                              });
                            }}
                            className={`p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between min-h-[78px] ${isLocked
                              ? 'opacity-40 cursor-not-allowed border-dashed bg-slate-100 text-slate-400'
                              : isFocused
                                ? 'bg-gradient-to-br from-rose-50 to-amber-50 border-rose-400 text-rose-950 shadow-md ring-2 ring-rose-400/40'
                                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400 shadow-sm'
                              }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-black text-sm">{subj.name}</span>
                              {isFocused ? (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-rose-500 text-white font-black shadow-xs">
                                  🚨 부담 과목
                                </span>
                              ) : (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 font-bold">
                                  응시 기본
                                </span>
                              )}
                            </div>
                            <span className={`text-[10px] font-medium mt-1 ${isFocused ? 'text-rose-700 font-bold' : 'text-slate-400'}`}>
                              {isFocused
                                ? '✓ 1순위 집중 케어'
                                : isFreeStudent
                                  ? '클릭 시 단일 선택'
                                  : '클릭 시 취약 지정'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. 사회/과학탐구 선택 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-700 uppercase flex items-center gap-1.5">
                        <span>🔬</span> 2. 사회/과학탐구 선택 (최대 2과목)
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {SUNEUNG_SUBJECTS.filter(s => s.category === 'social' || s.category === 'science').map(subj => {
                          const isSelected = (student.selectedSubjects || []).includes(subj.id);
                          const isLocked = isFreeStudent;

                          return (
                            <button
                              key={subj.id}
                              type="button"
                              onClick={() => {
                                if (isFreeStudent) {
                                  showToast('탐구 과목은 유료 회원 전용입니다.');
                                  return;
                                }
                                const newSelected = isSelected
                                  ? (student.selectedSubjects || []).filter(id => id !== subj.id)
                                  : [...(student.selectedSubjects || []), subj.id];
                                setStudent({ ...student, selectedSubjects: newSelected });
                              }}
                              className={`px-3 py-1.5 rounded-xl border transition-all text-xs font-bold ${isLocked
                                ? 'opacity-40 cursor-not-allowed border-dashed bg-slate-50 text-slate-400'
                                : isSelected
                                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                  : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                                }`}
                            >
                              {isLocked ? '🔒 ' : ''}{subj.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 3. 제2외국어/한문 */}
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-700 uppercase flex items-center gap-1.5">
                        <span>🌐</span> 3. 제2외국어 / 한문 (선택)
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {SUNEUNG_SUBJECTS.filter(s => s.category === 'foreign').map(subj => {
                          const isSelected = (student.selectedSubjects || []).includes(subj.id);
                          const isLocked = isFreeStudent;

                          return (
                            <button
                              key={subj.id}
                              type="button"
                              onClick={() => {
                                if (isFreeStudent) {
                                  showToast('제2외국어 과목은 유료 회원 전용입니다.');
                                  return;
                                }
                                const newSelected = isSelected
                                  ? (student.selectedSubjects || []).filter(id => id !== subj.id)
                                  : [...(student.selectedSubjects || []), subj.id];
                                setStudent({ ...student, selectedSubjects: newSelected });
                              }}
                              className={`px-3 py-1.5 rounded-xl border transition-all text-xs font-bold ${isLocked
                                ? 'opacity-40 cursor-not-allowed border-dashed bg-slate-50 text-slate-400'
                                : isSelected
                                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                                  : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                                }`}
                            >
                              {isLocked ? '🔒 ' : ''}{subj.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 🎯 [NEW] 공통/필수 4과목 3대 기준별 1, 2, 3, 4위 우선순위 정밀 설정 */}
                <div className="mt-6 pt-5 border-t border-slate-200 bg-white/80 p-5 rounded-2xl border shadow-sm">
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🎯</span>
                      <div>
                        <h4 className="text-xs font-black text-slate-800">
                          국·영·수·한국사 3대 기준별 우선순위 (1~4위 랭킹 설정)
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          3가지 기준별 순위를 토대로 AI 파이프라인에서 <strong>최적 공부시간 배분 및 맞춤형 공부방법</strong>을 산출합니다.
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                      ⚡ AI 학습 최적화 엔진 연동
                    </span>
                  </div>

                  {(() => {
                    const defaultPriorities: SubjectPriorities = student.subjectPriorities || {
                      importanceRank: { math: 1, korean: 2, english: 3, korean_history: 4 },
                      gradeRank: { math: 2, korean: 1, english: 3, korean_history: 4 },
                      currentFocusRank: { math: 1, korean: 2, english: 3, korean_history: 4 }
                    };

                    const criteria = [
                      {
                        key: 'importanceRank' as const,
                        label: '1) 내가 입시에서 중요시하는 과목',
                        badge: '목표/가중치 기준',
                        color: 'from-blue-600 to-indigo-600',
                        desc: '목표 대학 및 수능 전형상 가장 중요하게 반영되는 과목 순서'
                      },
                      {
                        key: 'gradeRank' as const,
                        label: '2) 내가 성적이 잘 나오는 과목',
                        badge: '현재 실력/자신감 기준',
                        color: 'from-emerald-600 to-teal-600',
                        desc: '현재 모의고사/내신에서 가장 점수가 안정적으로 나오는 과목 순서'
                      },
                      {
                        key: 'currentFocusRank' as const,
                        label: '3) 내가 지금 현재 중요시(집중투자)하는 과목',
                        badge: '현재 공부시간 우선순위',
                        color: 'from-amber-600 to-rose-600',
                        desc: '오늘과 이번 주에 가장 많은 순공 시간과 에너지를 쏟아야 하는 과목 순서'
                      }
                    ];

                    const subjects = [
                      { id: 'korean', name: '국어', color: 'text-rose-600 bg-rose-50 border-rose-200' },
                      { id: 'math', name: '수학', color: 'text-blue-600 bg-blue-50 border-blue-200' },
                      { id: 'english', name: '영어', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
                      { id: 'korean_history', name: '한국사', color: 'text-amber-600 bg-amber-50 border-amber-200' }
                    ] as const;

                    const handleRankChange = (criterionKey: 'importanceRank' | 'gradeRank' | 'currentFocusRank', subjectId: 'korean' | 'math' | 'english' | 'korean_history', newRank: number) => {
                      const currentCriterion = { ...(defaultPriorities[criterionKey] || { math: 1, korean: 2, english: 3, korean_history: 4 }) };

                      // Find which subject had this newRank and swap
                      const oldRank = currentCriterion[subjectId];
                      const otherSubj = (Object.keys(currentCriterion) as Array<keyof typeof currentCriterion>).find(k => k !== subjectId && currentCriterion[k] === newRank);

                      if (otherSubj && oldRank) {
                        currentCriterion[otherSubj] = oldRank;
                      }
                      currentCriterion[subjectId] = newRank;

                      const updatedPriorities: SubjectPriorities = {
                        ...defaultPriorities,
                        [criterionKey]: currentCriterion
                      };

                      setStudent({
                        ...student,
                        subjectPriorities: updatedPriorities,
                        weakSubject: updatedPriorities.currentFocusRank ? (
                          (Object.keys(updatedPriorities.currentFocusRank) as Array<'korean' | 'math' | 'english'>)
                            .filter(k => ['korean', 'math', 'english'].includes(k))
                            .sort((a, b) => (updatedPriorities.currentFocusRank![a] || 9) - (updatedPriorities.currentFocusRank![b] || 9))[0] || student.weakSubject
                        ) : student.weakSubject
                      });
                    };

                    return (
                      <div className="space-y-4 mt-3">
                        {criteria.map((crit) => {
                          const rankObj = defaultPriorities[crit.key] || { math: 1, korean: 2, english: 3, korean_history: 4 };
                          return (
                            <div key={crit.key} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 hover:border-indigo-300 transition-all">
                              <div className="flex items-center justify-between flex-wrap gap-1 mb-2">
                                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                  <span>{crit.label}</span>
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200 font-normal">
                                    {crit.badge}
                                  </span>
                                </span>
                                <span className="text-[10px] text-slate-400">{crit.desc}</span>
                              </div>

                              {/* 4 Subjects Rank Selector Grid */}
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                {subjects.map((sub) => {
                                  const currentRank = rankObj[sub.id] || 4;
                                  return (
                                    <div key={sub.id} className={`p-2.5 rounded-xl border flex items-center justify-between bg-white ${sub.color}`}>
                                      <span className="text-xs font-black">{sub.name}</span>
                                      <div className="flex items-center gap-1">
                                        <span className="text-[10px] font-bold text-slate-400">순위:</span>
                                        <select
                                          value={currentRank}
                                          onChange={(e) => handleRankChange(crit.key, sub.id, Number(e.target.value))}
                                          className="text-xs font-black bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                                        >
                                          <option value={1}>🥇 1위</option>
                                          <option value={2}>🥈 2위</option>
                                          <option value={3}>🥉 3위</option>
                                          <option value={4}>4위</option>
                                        </select>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Physical & Activity Section */}
              <div className="md:col-span-2 pt-4 border-t border-slate-100 mt-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-black text-blue-600 uppercase tracking-wider">신체 및 활동 정보 (Physical & Activity)</h3>
                  <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100 flex items-center gap-1">
                    <span>🧬</span> 학습 기질 정밀 진단은 다음 설문 단계에서 진행됩니다
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">키 (Height cm)</label>
                    <input type="number" value={student.height || ''} onChange={e => setStudent({ ...student, height: e.target.value ? parseInt(e.target.value, 10) || 0 : 0 })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold" placeholder="172" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">몸무게 (Weight kg)</label>
                    <input type="number" value={student.weight || ''} onChange={e => setStudent({ ...student, weight: e.target.value ? parseInt(e.target.value, 10) || 0 : 0 })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold" placeholder="62" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">BMI (자동계산)</label>
                    <div className="w-full px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg text-sm font-bold text-blue-700 flex justify-between items-center">
                      <span>{student.bmi || '-'}</span>
                      <span className="text-[10px] font-bold text-blue-500 bg-white px-2 py-0.5 rounded border border-blue-100">
                        {(student.bmi || 0) < 18.5 ? '저체중' : (student.bmi || 0) < 23 ? '정상' : (student.bmi || 0) < 25 ? '과체중' : '비만'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">평소 활동량 (Activity Level)</label>
                  <div className="flex gap-4">
                    {/* Activity Level Buttons */}
                    <div className="flex gap-2 flex-1">
                      {[1, 2, 3, 4].map(level => (
                        <button
                          key={level}
                          onClick={() => setStudent({ ...student, activityLevel: level })}
                          className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${student.activityLevel === level ? 'bg-slate-800 text-white border-slate-800 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
                        >
                          <span className="text-base">
                            {level === 1 ? '🪑' : level === 2 ? '🚶' : level === 3 ? '🏃' : '🏋️'}
                          </span>
                          <span className="block">Level {level}</span>
                          <span className="block text-[8px] font-normal opacity-70">
                            {level === 1 ? '최소' : level === 2 ? '보통' : level === 3 ? '활발' : '매우 활발'}
                          </span>
                        </button>
                      ))}
                    </div>
                    {/* Activity Level Description Card */}
                    <div className="w-48 p-3 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl text-xs transition-all">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">
                          {student.activityLevel === 1 ? '🪑' : student.activityLevel === 2 ? '🚶' : student.activityLevel === 3 ? '🏃' : '🏋️'}
                        </span>
                        <span className="font-bold text-blue-700">
                          Level {student.activityLevel || 1}
                        </span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">
                        {(student.activityLevel === 1 || !student.activityLevel) && (
                          <>
                            <span className="font-semibold text-slate-700">하루 대부분 앉아서 생활</span>
                            <br />
                            학생, 사무직 등. 주당 운동 거의 없음. 이동 외 신체 활동 최소.
                          </>
                        )}
                        {student.activityLevel === 2 && (
                          <>
                            <span className="font-semibold text-slate-700">가벼운 일상 활동</span>
                            <br />
                            가벼운 산책, 스트레칭 수준. 주 1-2회 30분 이하 가벼운 운동.
                          </>
                        )}
                        {student.activityLevel === 3 && (
                          <>
                            <span className="font-semibold text-slate-700">정기적인 운동</span>
                            <br />
                            주 3-5회 중강도 운동. 조깅, 수영, 자전거 등 30분-1시간.
                          </>
                        )}
                        {student.activityLevel === 4 && (
                          <>
                            <span className="font-semibold text-slate-700">고강도 활동</span>
                            <br />
                            주 6회 이상 운동 또는 육체노동. 운동선수, 체력 훈련 수준.
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* 멀티모니터 모드 표시 */}
            {isMultiMonitorMode && (
              <div className="p-4 bg-gradient-to-r from-cyan-50 to-teal-50 border-2 border-cyan-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🖥️</span>
                  <div>
                    <p className="font-bold text-cyan-900">멀티모니터 모드 활성화</p>
                    <p className="text-xs text-cyan-600">검사 시작 시 학생 설문 창이 별도로 열립니다. 모니터 2로 이동하세요.</p>
                  </div>
                </div>
                {syncSessionId && (
                  <div className="mt-2 p-2 bg-white rounded-lg text-xs text-slate-500">
                    세션 ID: <code className="text-cyan-700">{syncSessionId.substring(0, 8)}...</code>
                    {syncStudentReady && <span className="ml-2 text-emerald-600 font-bold">✓ 학생 연결됨</span>}
                  </div>
                )}
              </div>
            )}

            {/* 저장 완료 알림 메시지 */}
            {saveSuccessNotice && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 text-xs font-bold flex items-center justify-between shadow-sm animate-in fade-in">
                <span className="flex items-center gap-2">
                  <span className="text-base">✅</span>
                  <span>{saveSuccessNotice}</span>
                </span>
                <span className="text-[10px] text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                  언제든 수정 가능
                </span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              {/* 관련기록 저장 버튼 */}
              <button
                type="button"
                onClick={handleSaveStudentRegistration}
                className={`py-4 px-6 rounded-2xl font-black text-sm transition-all border flex items-center justify-center gap-2 shadow-sm active:scale-95 ${justSaved
                  ? 'bg-emerald-500 text-white border-emerald-400 shadow-md ring-2 ring-emerald-300/40'
                  : isRegistrationSaved
                    ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-800'
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                  }`}
              >
                <span>{justSaved ? '✓' : '💾'}</span>
                <span>{justSaved ? '저장 완료! (추가 저장 가능)' : '관련기록 저장 (추가/수정 가능)'}</span>
              </button>

              {/* 진단/검사 시작 버튼 */}
              <button
                type="button"
                onClick={() => {
                  if (isProCompleted) {
                    setSubscriptionTriggerReason('PRO 1회 스타터 패스(₩9,000) 검사가 이미 완료되었습니다. 추가 정밀 검사는 정기구독(PREMIUM 등)으로 업그레이드 후 이용 가능합니다.');
                    setSubscriptionInitialTier('premium');
                    setShowSubscriptionModal(true);
                    return;
                  }

                  if (!isRegistrationSaved) {
                    setShowSaveRequiredModal(true);
                    return;
                  }

                  // 회원 등급 파이프라인 동기화
                  setStudent(prev => ({
                    ...prev,
                    membershipTier: effectiveTier
                  }));

                  if (isMultiMonitorMode) {
                    syncOpenStudentWindow();
                    if (isFreeStudent) {
                      setActiveTab('bai');
                      setBaiSubPage(1);
                    }
                    setStep('surveys');
                  } else {
                    // 일반 모드: 설문 단계로 이동 (무료체험 시 불안 BAI부터 시작)
                    if (isFreeStudent) {
                      setActiveTab('bai');
                      setBaiSubPage(1);
                    }
                    setStep('surveys');
                  }
                }}
                disabled={
                  !isProCompleted && (
                    !student.name ||
                    (isFreeStudent
                      ? !((student.focusSubjects && student.focusSubjects[0]) || (student.selectedSubjects || [])[0])
                      : (student.selectedSubjects || []).length === 0)
                  )
                }
                className={`flex-1 py-4 font-black rounded-2xl shadow-lg transition-all text-white ${isProCompleted
                  ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:brightness-110 shadow-amber-500/25 ring-2 ring-amber-400/40'
                  : isFreeStudent
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/25'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                  } disabled:opacity-50 text-base md:text-lg flex items-center justify-center gap-2 active:scale-95`}
              >
                {isProCompleted
                  ? '⚡ PRO 1회 검사 완료 (정기구독으로 업그레이드하기) →'
                  : isMultiMonitorMode
                    ? '🖥️ 검사 시작 (학생 창 열기)'
                    : isFreeStudent
                      ? `🎯 3분 무료체험 검사 시작하기 (${(() => {
                        const sid = (student.focusSubjects && student.focusSubjects[0]) || (student.selectedSubjects || [])[0];
                        return sid ? (SUNEUNG_SUBJECTS.find(s => s.id === sid)?.name || '과목') : '과목 선택 필요';
                      })()}) →`
                      : '🚀 정밀 종합 진단 시작 (Start Assessment) →'}
              </button>

              {/* 무료 회원을 위한 PRO 정밀 진단 즉시 결제/업그레이드 버튼 */}
              {isFreeStudent && (
                <button
                  type="button"
                  onClick={() => {
                    setSubscriptionTriggerReason('정밀 검사는 PRO 이상(1회 스타터 패스 ₩9,000 또는 정기구독) 결제 후 이용 가능합니다.');
                    setSubscriptionInitialTier('pro');
                    setShowSubscriptionModal(true);
                  }}
                  className="py-4 px-6 rounded-2xl font-black text-sm md:text-base transition-all text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:brightness-105 active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 border border-amber-300 shrink-0"
                  title="PRO 이상 결제(₩9,000) 후 정밀 종합 진단 시작"
                >
                  <span>⚡ PRO 정밀 진단 전환 (₩9,000~)</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 저장 확인/안내 모달 (저장하지 않고 검사 시작 클릭 시) */}
        {showSaveRequiredModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-5 animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-2xl shrink-0">
                  💾
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">관련기록 저장 안내</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">검사 전 학생 기본 정보 및 과목 설정</p>
                </div>
              </div>

              <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 space-y-1.5 leading-relaxed">
                <p className="font-bold text-sm">⚠️ 학생 정보와 과목 설정이 아직 저장되지 않았습니다.</p>
                <p className="text-[12px] opacity-90">
                  지금 저장하고 진단을 시작하시겠습니까? <strong>(저장된 정보는 나중에도 언제든지 자유롭게 수정하실 수 있습니다.)</strong>
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    handleSaveStudentRegistration();
                    setShowSaveRequiredModal(false);

                    // 회원 등급 파이프라인 동기화 후 검사 시작
                    setStudent(prev => ({
                      ...prev,
                      membershipTier: effectiveTier
                    }));

                    if (isMultiMonitorMode) {
                      syncOpenStudentWindow();
                      if (isFreeStudent) {
                        setActiveTab('bai');
                        setBaiSubPage(1);
                      }
                      setStep('surveys');
                    } else {
                      if (isFreeStudent) {
                        setActiveTab('bai');
                        setBaiSubPage(1);
                      }
                      setStep('surveys');
                    }
                  }}
                  className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 text-sm"
                >
                  <span>💾 저장하고 진단 시작</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowSaveRequiredModal(false)}
                  className="px-4 py-3.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold rounded-xl transition-all text-xs"
                >
                  ✏️ 수정하러 가기
                </button>
              </div>
            </div>
          </div>
        )}

        <AdminPasswordModal isOpen={showAdminPassword} password={adminPasswordInput} onPasswordChange={setAdminPasswordInput} onConfirm={handleAdminUnlock} onCancel={() => { setShowAdminPassword(false); setAdminPasswordInput(''); }} />
      </Layout>
    );
  }

  if (step === 'surveys') {
    return (
      <SurveysStep
        onNext={() => setStep('protocol')}
        setStep={setStep}
        activeMenu={activeMenu}
        onMenuChange={handleMenuChangeWithCheck}
        onHomeClick={handleHomeClickWithCheck}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        onAdminClick={() => requestAdminAccess('config')}
        config={config}
        ConfigModal={ConfigModal}
        showAdminPassword={showAdminPassword}
        adminPasswordInput={adminPasswordInput}
        onAdminPasswordChange={setAdminPasswordInput}
        onAdminConfirm={handleAdminUnlock}
        onAdminCancel={() => { setShowAdminPassword(false); setAdminPasswordInput(''); }}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        is10MinMode={isFreeStudent || isQuickMode}
        baiSubPage={baiSubPage}
        setBaiSubPage={setBaiSubPage}
        surveyScores={surveyScores}
        baiAnswers={baiAnswers}
        setBaiAnswers={setBaiAnswers}
        isiAnswers={isiAnswers}
        setIsiAnswers={setIsiAnswers}
        concentrationAnswers={concentrationAnswers}
        setConcentrationAnswers={setConcentrationAnswers}
        adrenalAnswers={adrenalAnswers}
        setAdrenalAnswers={setAdrenalAnswers}
        fatigueCore={fatigueCore}
        setFatigueCore={setFatigueCore}
        fatigueSymptoms={fatigueSymptoms}
        setFatigueSymptoms={setFatigueSymptoms}
        snsSymptomSelection={snsSymptomSelection}
        setSnsSymptomSelection={setSnsSymptomSelection}
        pnsSymptomSelection={pnsSymptomSelection}
        setPnsSymptomSelection={setPnsSymptomSelection}
        baiEvaluation={baiEvaluation}
        isiEvaluation={isiEvaluation}
        adrenalEvaluation={adrenalEvaluation}
        learningTraitsAnswers={learningTraitsAnswers}
        setLearningTraitsAnswers={setLearningTraitsAnswers}
        learningTraitsData={learningTraitsData}
      />
    );
  }

  if (step === 'protocol') {
    return (
      <ProtocolStep
        onNext={() => {
          // [P1-6] 짧은 진단판: 선택 단계(분석·공부효율·인지)를 생략하고 바로 결과 산출
          if (isQuickMode) { handleFinalAssessment(); return; }
          setStep(isFreeStudent ? 'study_efficiency' : 'analytics');
        }}
        onBack={() => setStep('surveys')}
        is10MinMode={isFreeStudent || isQuickMode}
        onStepClick={setStep as any}
        activeMenu={activeMenu}
        onMenuChange={handleMenuChangeWithCheck}
        onHomeClick={handleHomeClickWithCheck}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        config={config}
        protocol={protocol}
        setProtocol={setProtocol}
        isCustomLoc={isCustomLoc}
        setIsCustomLoc={setIsCustomLoc}
      />
    );
  }

  if (step === 'analytics') {
    return (
      <AnalyticsStep
        onNext={() => setStep('study_efficiency')}
        onBack={() => setStep('protocol')}
        onStepClick={setStep as any}
        activeMenu={activeMenu}
        onMenuChange={handleMenuChangeWithCheck}
        onHomeClick={handleHomeClickWithCheck}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        config={config}
        analytics={analytics}
        setAnalytics={setAnalytics}
        student={student}
      />
    );
  }

  // ========== 공부 효율성 정밀 검사 Step ==========
  if (step === 'study_efficiency') {
    return (
      <StudyEfficiencyStep
        currentResult={result}
        onNext={(results) => {
          if (isFreeStudent || Boolean(result)) {
            handleFinalAssessment(results);
          } else {
            setStep('working_memory');
          }
        }}
        onBack={() => {
          if (result) {
            setStep('results');
          } else {
            setStep(isFreeStudent ? 'protocol' : 'analytics');
          }
        }}
        is10MinMode={isFreeStudent}
        onStepClick={setStep as any}
        activeMenu={activeMenu}
        onMenuChange={handleMenuChangeWithCheck}
        onHomeClick={handleHomeClickWithCheck}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        config={config}
        studyEfficiencyResults={studyEfficiencyResults}
        setStudyEfficiencyResults={setStudyEfficiencyResults}
        membershipTier={effectiveTier}
        isFreeStudent={isFreeStudent}
        onUpgradeTier={handleTierUpgrade}
      />
    );
  }

  // ========== 워킹 메모리 Step (새로 추가) ==========
  if (step === 'working_memory') {
    return (
      <WorkingMemoryStep
        onNext={() => setStep('cognitive_test')}
        onBack={() => setStep('study_efficiency')}
        onStepClick={setStep as any}
        activeMenu={activeMenu}
        onMenuChange={handleMenuChangeWithCheck}
        onHomeClick={handleHomeClickWithCheck}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        config={{
          isMedicalMode: config.isMedicalMode,
          useBrainBody: config.useBrainBody,
          usePortable: config.usePortable
        }}
        workingMemoryResults={workingMemoryResults}
        setWorkingMemoryResults={setWorkingMemoryResults}
        careType={CareType.HEALTHY}
      />
    );
  }

  // ========== 인지 성능 테스트 Step ==========
  if (step === 'cognitive_test') {
    const effectiveCognitiveResults: CognitivePerformanceResults = {
      ...(cognitiveResults || {}),
      workingMemory: cognitiveResults?.workingMemory || workingMemoryResults || undefined
    } as CognitivePerformanceResults;

    return (
      <CognitivePerformanceStep
        onNext={() => {
          handleFinalAssessment();
        }}
        onBack={() => setStep('working_memory')}
        onStepClick={setStep as any}
        activeMenu={activeMenu}
        onMenuChange={handleMenuChangeWithCheck}
        onHomeClick={handleHomeClickWithCheck}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        config={config}
        cognitiveResults={effectiveCognitiveResults}
        setCognitiveResults={setCognitiveResults}
      />
    );
  }

  if (step === 'hrv' || step === 'eeg' || step === 'bloodtest') {
    handleFinalAssessment();
    return null;
  }

  if (step === 'loading') {
    return (
      <Layout
        onHomeClick={handleHomeClickWithCheck}
        activeMenu={activeMenu}
        onMenuChange={handleMenuChangeWithCheck}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        onAdminPortalClick={() => requestAdminAccess('portal')}
        studentName={student.name}
        studentId={student.id}
        membershipTier={effectiveTier}
        {...subscriptionProps}
        incompleteModal={
          <IncompleteAssessmentModal
            isOpen={showIncompleteWarningModal}
            currentStep={step}
            studentName={student.name}
            onContinue={handleContinueAssessment}
            onLeave={handleConfirmLeave}
          />
        }
      >
        <StepProgressBar currentStep={step} isMedicalMode={config.isMedicalMode} studentInfo={student} />
        <div className="flex flex-col items-center justify-center min-h-[60vh] mt-4">
          <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-6"></div>
          <h2 className="text-2xl font-bold text-slate-800">종합 데이터 분석 중...</h2>
          <p className="text-slate-500 mt-2">유형 식별 및 맞춤 솔루션을 생성하고 있습니다.</p>
          {/* [P1-8] 누락 항목 안내 — 기존 로딩 UI는 그대로 두고 안내만 추가 */}
          <AssessmentReadinessNotice readiness={assessmentReadiness} />
        </div>
      </Layout>
    );
  }



  if (step === 'results' && result) {
    return (
      <>
        {/* @ts-ignore */}
        <ResultsView
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
          onMenuChange={handleMenuChangeWithCheck}
          onHomeClick={handleHomeClickWithCheck}
          isDarkMode={isDarkMode}
          onToggleDarkMode={toggleDarkMode}
          result={result}
          config={config}
          setConfig={setConfig}
          strategies={strategies}
          setStrategies={setStrategies}
          prescriptions={prescriptions}
          setPrescriptions={setPrescriptions}
          editingStrategyType={editingStrategyType}
          setEditingStrategyType={setEditingStrategyType}
          selectedSubjectOptions={selectedSubjectOptions}
          setSelectedSubjectOptions={setSelectedSubjectOptions}
          showConfig={showConfig}
          setShowConfig={setShowConfig}
          activeConfigTab={activeConfigTab}
          setActiveConfigTab={setActiveConfigTab}
          showAdminPassword={showAdminPassword}
          setShowAdminPassword={setShowAdminPassword}
          adminPasswordInput={adminPasswordInput}
          setAdminPasswordInput={setAdminPasswordInput}
          handleAdminUnlock={handleAdminUnlock}
          isAdminUnlocked={isAdminUnlocked}
          setIsAdminUnlocked={setIsAdminUnlocked}
          showNutritionalPrescription={showNutritionalPrescription}
          setShowNutritionalPrescription={setShowNutritionalPrescription}
          showDataEditor={showDataEditor}
          setShowDataEditor={setShowDataEditor}
          showHistoryAnalysisModal={showHistoryAnalysisModal}
          setShowHistoryAnalysisModal={setShowHistoryAnalysisModal}
          showZenMode={showZenMode}
          setShowZenMode={setShowZenMode}
          showSecretPoint={showSecretPoint}
          setShowSecretPoint={setShowSecretPoint}
          adminMemo={adminMemo}
          setAdminMemo={setAdminMemo}
          medicalNotes={medicalNotes}
          setMedicalNotes={setMedicalNotes}
          history={history}
          selectedStudentId={selectedStudentId}
          completedItems={completedItems}
          toggleCompleted={toggleCompleted}
          recommendedProducts={recommendedProducts}
          evaluatedSecretPoints={evaluatedSecretPoints}
          handleDataUpdate={handleDataUpdate}
          setStep={setStep as any}
          setProtocol={setProtocol}
          setIsCustomLoc={setIsCustomLoc}
          aiModels={aiModels}
          handleAiModelsChange={handleAiModelsChange}
          initialProtocol={initialProtocol}
          logicConfig={logicConfig}
          handleLogicConfigChange={setLogicConfig}
          resetLogicConfig={resetLogicConfig}
          productRecommendations={productRecommendations}
          handleProductRecommendationsChange={setProductRecommendations}
          resetProductRecommendations={resetProductRecommendations}
          predictionRules={predictionRules}
          handlePredictionRulesChange={setPredictionRules}
          resetPredictionRules={resetPredictionRules}
          studyEfficiencyResults={studyEfficiencyResults}
          currentUserRole={currentUserRole}
          onStartFollowUp={handleStartFollowUp}
        />
        <AIChatbotWidget contextData={result} aiModels={aiModels} />
        {renderFollowUpModals()}
        {/* 갭 분석 플로팅 버튼 + 모달 (자녀 초대 코드로 진단한 경우에만) */}
        {childInviteCode && (
          <>
            {!showGapAnalysis && (
              <button
                onClick={() => setShowGapAnalysis(true)}
                className="fixed bottom-24 right-5 z-40 px-4 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-blue-700 text-white text-xs font-black shadow-2xl shadow-indigo-500/40 hover:scale-105 transition-transform"
              >
                🔍 부모 관찰 비교
              </button>
            )}
            {showGapAnalysis && (
              <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm overflow-y-auto py-8 px-4">
                <div className="max-w-3xl mx-auto relative">
                  <button
                    onClick={() => setShowGapAnalysis(false)}
                    className="absolute -top-2 right-0 z-10 w-9 h-9 rounded-full bg-white dark:bg-slate-700 shadow-lg text-slate-600 dark:text-slate-300 font-black text-lg"
                    aria-label="닫기"
                  >
                    ×
                  </button>
                  <GapAnalysisReportView
                    inviteCode={childInviteCode}
                    childCategoryRatios={{
                      anxiety: Math.min(100, Math.round((surveyScores.bai / 63) * 100)),
                      sleep: Math.min(100, Math.round((surveyScores.isi / 28) * 100)),
                      fatigue: Math.min(100, Math.round((surveyScores.fatigueCount / 8) * 100)),
                      concentration: Math.min(100, Math.round((surveyScores.concentration / 21) * 100)),
                      appetite: Math.min(100, Math.round((surveyScores.adrenal / 42) * 100)),
                    }}
                    childOverallRatio={Math.min(100, Math.round((surveyScores.bai / 63) * 100))}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </>
    );
  }

  // 학습/성적/수면 관리 라우트 - 셸 위임 (상세는 components/AppShell/AppManagementRoutes 참조)
  if (step === 'study_management' || step === 'grade_management' || step === 'sleep_management') {
    return (
      <AppManagementRoutes
        step={step}
        student={student}
        hrv={hrv}
        result={result}
        protocol={protocol}
        analytics={analytics}
        aiModels={aiModels}
        effectiveTier={effectiveTier}
        onBackToResults={() => setStep('results')}
        onUpgradeClick={(targetTier) => {
          setSubscriptionTriggerReason(
            targetTier === 'premium_plus'
              ? 'PREMIUM PLUS 등급 이상에서 이용 가능합니다.'
              : targetTier === 'premium'
                ? '심층 성적 관리 시스템은 PREMIUM 등급 이상에서 이용 가능합니다.'
                : undefined
          );
          setSubscriptionInitialTier(targetTier || 'premium');
          setShowSubscriptionModal(true);
        }}
      />
    );
  }

  if (step === 'admin_expertise') {
    return (
      <Layout
        onHomeClick={handleHomeClickWithCheck}
        activeMenu={activeMenu}
        onMenuChange={handleMenuChangeWithCheck}
        isDarkMode={isDarkMode}
        onAdminClick={() => requestAdminAccess('config')}
        onAdminPortalClick={() => requestAdminAccess('portal')}
        studentName={student.name}
        studentId={student.id}
        membershipTier={effectiveTier}
        {...subscriptionProps}
        incompleteModal={
          <IncompleteAssessmentModal
            isOpen={showIncompleteWarningModal}
            currentStep={step}
            studentName={student.name}
            onContinue={handleContinueAssessment}
            onLeave={handleConfirmLeave}
          />
        }
      >
        <AdminExpertiseView
          onBack={() => { setStep('results'); setShowConfig(true); }}
          studentName={student.name}
          studentId={student.id}
        />

        <AdminPasswordModal isOpen={showAdminPassword} password={adminPasswordInput} onPasswordChange={setAdminPasswordInput} onConfirm={handleAdminUnlock} onCancel={() => { setShowAdminPassword(false); setAdminPasswordInput(''); }} />

        <AppConsultationLetterModal show={showLetterModal} result={result} onClose={() => setShowLetterModal(false)} />
        {/* Study Efficiency Assessment Modal - 셸 병합 헬퍼로 슬림화 */}
        {showStudyEfficiencyModal && result && (
          <StudyEfficiencyAssessment
            careType={result.careType}
            isPortableMode={config.usePortable && !config.useBrainBody}
            isFreeMode={isFreeStudent}
            membershipTier={effectiveTier}
            onUpgrade={() => {
              setShowStudyEfficiencyModal(false);
              setShowSubscriptionModal(true);
            }}
            onComplete={(assessmentResults) => {
              setStudyEfficiencyResults(assessmentResults);
              setShowStudyEfficiencyModal(false);
              setResult(mergeStudyEfficiencyIntoResult(result, assessmentResults));
              alert('공부 효율성 검사가 완료되었습니다! 결과가 리포트에 반영됩니다.');
            }}
            onClose={() => setShowStudyEfficiencyModal(false)}
          />
        )}
      </Layout>
    );
  }

  // Move component definitions to top or use directly.
  // Ideally, we should place them before return.
  // For now, let's keep the return at the end simple.

  // Show License Activation Screen if needed - 셸 위임
  if (showLicenseScreen && licenseChecked) {
    return (
      <AppLicenseGate
        showLicenseScreen={showLicenseScreen}
        licenseChecked={licenseChecked}
        setLicenseInfo={setLicenseInfo}
        setCurrentTier={setCurrentTier}
        setShowLicenseScreen={setShowLicenseScreen}
      />
    );
  }

  return (
    <Layout
      onHomeClick={handleHomeClickWithCheck}
      activeMenu={activeMenu}
      onMenuChange={handleMenuChangeWithCheck}
      isDarkMode={isDarkMode}
      onToggleDarkMode={toggleDarkMode}
      onAdminPortalClick={() => requestAdminAccess('portal')}
      onAdminClick={() => requestAdminAccess('config')}
      studentName={student.name}
      studentId={student.id}
      membershipTier={effectiveTier}
      {...subscriptionProps}
      incompleteModal={
        <IncompleteAssessmentModal
          isOpen={showIncompleteWarningModal}
          currentStep={step}
          studentName={student.name}
          onContinue={handleContinueAssessment}
          onLeave={handleConfirmLeave}
        />
      }
    >
      <AppEmptyState
        activeMenu={activeMenu}
        effectiveTier={effectiveTier}
        onStart={handleStartPrecisionAssessment}
        onShowLicense={() => setShowLicenseScreen(true)}
      />

      <AppGlobalOverlays
        showAdminPassword={showAdminPassword}
        adminPasswordInput={adminPasswordInput}
        setAdminPasswordInput={setAdminPasswordInput}
        handleAdminUnlock={handleAdminUnlock}
        setShowAdminPassword={setShowAdminPassword}
        showClassificationEditor={showClassificationEditor}
        setShowClassificationEditor={setShowClassificationEditor}
        showProductRuleEditor={showProductRuleEditor}
        setShowProductRuleEditor={setShowProductRuleEditor}
        logicConfig={logicConfig}
        setLogicConfig={setLogicConfig}
        showZenMode={showZenMode}
        setShowZenMode={setShowZenMode}
        result={result}
        prescriptions={prescriptions}
        showDataEditor={showDataEditor}
        setShowDataEditor={setShowDataEditor}
        handleDataUpdate={handleDataUpdate}
        showStudyEfficiencyModal={showStudyEfficiencyModal}
        setShowStudyEfficiencyModal={setShowStudyEfficiencyModal}
        setStudyEfficiencyResults={setStudyEfficiencyResults as (r: never) => void}
        setResult={setResult}
        usePortable={config.usePortable}
        useBrainBody={config.useBrainBody}
        membershipTier={effectiveTier}
        isFreeMode={isFreeStudent}
        onUpgrade={() => {
          setShowStudyEfficiencyModal(false);
          setShowSubscriptionModal(true);
        }}
      />

      {renderFollowUpModals()}
    </Layout>
  );
};
export default App;
