
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Layout } from './components/Layout';
import { DashboardView, HistoryView, ResourcesView, ProgressView } from './components/MenuViews';
import { AdminExpertiseView } from './components/AdminExpertiseView';
import { ExpertOverlay } from './components/ExpertOverlay';
import { PrescriptionZenMode } from './components/PrescriptionZenMode';
import { BalanceChart, VitalityBarChart, RRVPhasePlot, BrainRadarChart, StressGaugeChart, TrendChart } from './components/Charts';
import { BreathingGuide } from './components/BreathingGuide';
import { NeuroInsightReport } from './components/NeuroInsightReport';
import { PRODUCTS } from './data/products';
import { DEFAULT_STRATEGIES } from './data/strategies';
import { SUBJECT_OPTIONS_MAP, StrategyOption } from './data/subjectOptions';
import { CareType, HRVData, SurveyData, ProtocolData, LearningAnalyticsData, AssessmentResult, StudentInfo, StrategyMap, Prescription, BloodTestData, PortableHRVData, ANSBalanceType, getStressLevel, STRESS_LEVEL_DESCRIPTIONS, ANS_BALANCE_DESCRIPTIONS, BrainBodyState } from './types';
import { SOLUTIONS } from './constants';
import { generateClinicalAnalysis } from './services/clinicalEngine';
import { evaluateBrainBodyCoherence } from './services/brainBodyEngine';
import { DETAILED_INSIGHTS } from './data/detailedInsights';
import { generateStudyEfficiencyAnalysis } from './services/simulationEngine';
import { generateAISchedule, ScheduleItem } from './services/schedulingEngine';
import { generatePrediction } from './services/predictionEngine';
import { PredictionReport } from './components/PredictionReport';
import { ConsultantTabs } from './components/ConsultantTabs';
import { StudyManagementView } from './components/study-management/StudyManagementView';
import { GradeManagementView } from './components/grade-management/GradeManagementView';
import { SleepManagementView } from './components/sleep-management/SleepManagementView';
import { StressCareLabView } from './components/StressCareLabView';
import { MENTAL_PRESCRIPTIONS } from './data/prescriptions';
import { SUNEUNG_SUBJECTS } from './data/suneungSubjects';
import { getLearningExplanation, getLearningRecommendations, CARETYPE_SPECIFIC_RECOMMENDATIONS } from './data/learningAnalyticsInsights';
import { PomodoroTimer } from './components/PomodoroTimer';
import { DatabaseService } from './services/database';
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

import { useAssessmentDraft } from './hooks/useAssessmentDraft'; // [NEW] Autosave Hook
import { AdminPasswordModal } from './components/modals/AdminPasswordModal';
import { DataEditorModal } from './components/modals/DataEditorModal';
import { RegisterStep } from './components/steps/RegisterStep';
import { LoadingStep } from './components/steps/LoadingStep';
import { BloodTestInput } from './components/steps/BloodTestInput';
// Step components (available for future use)
import { SurveysStep } from './components/steps/SurveysStep';
import { ProtocolStep } from './components/steps/ProtocolStep';
import { AnalyticsStep } from './components/steps/AnalyticsStep';
import { StudyEfficiencyStep } from './components/steps/StudyEfficiencyStep';
import { CognitivePerformanceStep } from './components/steps/CognitivePerformanceStep';
import { HRVStep } from './components/steps/HRVStep';
import { VitalityStressChart } from './components/VitalityStressChart';
import { EEGStep } from './components/steps/EEGStep';
import { WorkingMemoryStep } from './components/steps/WorkingMemoryStep';
import { ResultsView } from './components/steps/ResultsView';
import { AIChatbotWidget } from './components/common/AIChatbotWidget';
import { RoleSelectionView } from './components/RoleSelectionView';
import { ParentDashboard } from './components/dashboards/ParentDashboard';
import { ExpertDashboard } from './components/dashboards/ExpertDashboard';
import { OwnerDashboardView } from './components/dashboards/OwnerDashboardView';

import { CognitivePerformanceResults } from './components/CognitivePerformanceAssessment';
import { StepProgressBar } from './components/ui/StepProgressBar';
import { analyzeMedicalData, generateMedicalReportSection } from './services/medicalEngine';
import {
  generateSerialID,
  getTodayStr,
  calculateAge,
  calculateBMI,
  GRADE_OPTIONS,
  MBTI_OPTIONS,
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
import { LicenseActivation } from './components/ui/LicenseActivation';
import { MembershipBadge } from './components/ui/MembershipBadge';
import { LicenseInfo, getLicenseInfo, checkLicenseValidity } from './utils/licenseManager';
import { MembershipTier } from './utils/featureGate';

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
import { StudentSurveyBundle, ProtocolBundle, AnalyticsBundle } from './services/syncService';


// Initialize with fresh ID
const initialStudent: StudentInfo = {
  ...defaultStudent,
  id: generateSerialID(),
  testDate: getTodayStr()
};


type SurveyTab = 'ans' | 'bai' | 'isi' | 'concentration' | 'cfs' | 'adrenal';


const App: React.FC = () => {
  const [step, setStep] = useState<'role_selection' | 'parent_dashboard' | 'expert_dashboard' | 'owner_dashboard' | 'register' | 'surveys' | 'protocol' | 'analytics' | 'study_efficiency' | 'cognitive_test' | 'working_memory' | 'hrv' | 'eeg' | 'bloodtest' | 'loading' | 'results' | 'admin_expertise' | 'study_management' | 'grade_management' | 'sleep_management'>('role_selection');
  const [activeMenu, setActiveMenu] = useState<'dashboard' | 'assessment' | 'history' | 'progress' | 'resources' | 'solutions'>('dashboard');
  const [activeTab, setActiveTab] = useState<SurveyTab>('ans');
  const [student, setStudent] = useState<StudentInfo>(initialStudent);
  const [hrv, setHrv] = useState<HRVData>(initialHRV);
  const [protocol, setProtocol] = useState<ProtocolData>(initialProtocol);
  const [analytics, setAnalytics] = useState<LearningAnalyticsData>(initialAnalytics);
  const [isCustomLoc, setIsCustomLoc] = useState(false);

  // Survey States
  const [snsSymptomSelection, setSnsSymptomSelection] = useState<string[]>([]);
  const [pnsSymptomSelection, setPnsSymptomSelection] = useState<string[]>([]);
  const [baiAnswers, setBaiAnswers] = useState<number[]>(new Array(21).fill(0));
  const [isiAnswers, setIsiAnswers] = useState<number[]>(new Array(7).fill(0));
  const [concentrationAnswers, setConcentrationAnswers] = useState<number[]>(new Array(7).fill(0));
  const [adrenalAnswers, setAdrenalAnswers] = useState<number[]>(new Array(15).fill(0));
  const [fatigueCore, setFatigueCore] = useState<boolean>(false);
  const [fatigueSymptoms, setFatigueSymptoms] = useState<boolean[]>(new Array(8).fill(false));

  // BAI specific sub-tab state
  const [baiSubPage, setBaiSubPage] = useState<1 | 2>(1);

  // Student Search State
  const [showStudentSearch, setShowStudentSearch] = useState(false);
  const [studentSearchResults, setStudentSearchResults] = useState<{ student: StudentInfo; latestDate: string; count: number }[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [result, setResult] = useState<AssessmentResult | null>(null);

  // Configuration State
  const [showConfig, setShowConfig] = useState(false);
  const [showNutritionalPrescription, setShowNutritionalPrescription] = useState(false);
  const [showDataEditor, setShowDataEditor] = useState(false); // Data Editor Modal State
  const [config, setConfig] = useState(() => {
    const defaultCfg = {
      isExamMode: true,
      showDetail: true,
      isMedicalMode: false,
      useBrainBody: false,
      usePortable: false,
      expertModePassword: '3123',
      examiners: [] as import('./types').Examiner[],
      currentExaminerId: ''
    };
    try {
      const saved = localStorage.getItem('sn1_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        // 강제로 앱 시작시에는 설문만 진행하도록 (Brain-Body 등 하드웨어 연동 끔)
        parsed.useBrainBody = false;
        parsed.usePortable = false;
        parsed.isMedicalMode = false;
        return { ...defaultCfg, ...parsed };
      }
    } catch {}
    return defaultCfg;
  });

  useEffect(() => {
    localStorage.setItem('sn1_config', JSON.stringify(config));
  }, [config]);

  // AI Models State
  const [aiModels, setAiModels] = useState<import('./types').AIModelConfig>(() => {
    try {
      const saved = localStorage.getItem('sn1_ai_models');
      return saved ? JSON.parse(saved) : { geminiKey: '', sonnetKey: '', localModelUrl: '' };
    } catch {
      return { geminiKey: '', sonnetKey: '', localModelUrl: '' };
    }
  });

  const handleAiModelsChange = useCallback((models: import('./types').AIModelConfig) => {
    setAiModels(models);
    localStorage.setItem('sn1_ai_models', JSON.stringify(models));
  }, []);

  // Strategy State needed for customization
  const [strategies, setStrategies] = useState<StrategyMap>(DEFAULT_STRATEGIES);

  // 과목별 전략 선택 State (Checkbox IDs)
  const [selectedSubjectOptions, setSelectedSubjectOptions] = useState<Record<string, string[]>>({
    korean: ['kor_1'],
    math: [],
    english: ['eng_1']
  });

  // Student Checklist State (학생의 추천 항목 체크)
  const [completedItems, setCompletedItems] = useState<string[]>([]);

  // Secret Point State (관리자 전용)
  const [showSecretPoint, setShowSecretPoint] = useState(false);
  const [adminMemo, setAdminMemo] = useState('');


  // History State
  const [history, setHistory] = useState<(AssessmentResult & { date: string })[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const [activeConfigTab, setActiveConfigTab] = useState<string>('general');
  const [showZenMode, setShowZenMode] = useState(false);
  const [showLetterModal, setShowLetterModal] = useState(false);
  const [editingStrategyType, setEditingStrategyType] = useState<CareType>(CareType.BURNOUT);
  const [prescriptions, setPrescriptions] = useState<Record<string, Prescription>>(MENTAL_PRESCRIPTIONS);

  const [showBreathingGuide, setShowBreathingGuide] = useState(false);
  const [showHistoryAnalysisModal, setShowHistoryAnalysisModal] = useState(false);
  const [showTrendModal, setShowTrendModal] = useState(false);
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

  // License & Membership State
  const [licenseChecked, setLicenseChecked] = useState(false);
  const [licenseInfo, setLicenseInfo] = useState<LicenseInfo | null>(null);
  const [currentTier, setCurrentTier] = useState<MembershipTier>('free');
  const [showLicenseScreen, setShowLicenseScreen] = useState(false);

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

      // Consistently load all history from the database
      const dbHistory = await DatabaseService.getAllHistory();
      setHistory(dbHistory);

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

  // [REFACTORED] Autosave & Recovery Logic moved to useAssessmentDraft hook
  useAssessmentDraft({
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
        localStorage.setItem('sn1_history', JSON.stringify(updated));
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

  const handleAdminUnlock = () => {
    if (adminPasswordInput === '3123') {
      setShowAdminPassword(false);
      setIsAdminUnlocked(true); // Admin 권한 활성화
      setShowConfig(true);
      setAdminPasswordInput('');
    } else {
      alert('Password Incorrect');
    }
  };


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
    setStudent(prev => ({
      ...prev,
      birthDate: date,
      age: calculateAge(date)
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
    const useBrainBodyForEval = isPortableMode ? false : config.useBrainBody;

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
      classification.primary
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

  const baiEvaluation = useMemo(() => {
    const score = surveyScores.bai;
    if (score <= 9) return { text: "정상 범위", color: "text-emerald-600" };
    if (score <= 18) return { text: "경미한 수준의 불안", color: "text-blue-600" };
    if (score <= 29) return { text: "상당한 수준의 불안 (관심 필요)", color: "text-orange-600" };
    return { text: "심한 수준의 불안 (전문가 상담 권고)", color: "text-red-600" };
  }, [surveyScores.bai]);

  const isiEvaluation = useMemo(() => {
    const score = surveyScores.isi;
    if (score <= 7) return { text: "걱정할 만큼의 불면증이 없습니다.", color: "text-emerald-600" };
    if (score <= 14) return { text: "약간의 불면경향이 있습니다.", color: "text-blue-600" };
    if (score <= 21) return { text: "중등도의 불면증이 있습니다.", color: "text-orange-600" };
    return { text: "심한 불면증이 있습니다.", color: "text-red-600" };
  }, [surveyScores.isi]);

  const adrenalEvaluation = useMemo(() => {
    const score = surveyScores.adrenal;
    if (score < 10) return { text: "비교적 양호한 상태입니다. 규칙적인 생활을 유지하세요.", color: "text-emerald-600" };
    if (score <= 25) return { text: "초기 부신피로 단계입니다. 스트레스 관리와 충분한 휴식이 필요합니다.", color: "text-orange-600" };
    return { text: "심한 부신피로 상태일 가능성이 높습니다. 식단 개선과 영양 보충, 전문가 상담이 권장됩니다.", color: "text-red-600" };
  }, [surveyScores.adrenal]);

  const handleFinalAssessment = async () => {
    setStep('loading');

    // Portable 모드일 때 portableHrv 데이터로 완전히 대체 (BrainBody 값 무시)
    // FIX: useBrainBody 여부와 상관없이 Portable 모드가 켜져 있으면 Portable 데이터 우선 사용
    const finalHrv: HRVData = (config.usePortable)
      ? {
        // BrainBody 전용 필드는 중립/기본값으로 설정하되, 핵심 지표는 Portable 데이터로 매핑
        sns: portableHrv.stressPercent,  // 스트레스 비율을 SNS(교감)로 매핑
        pns: 100 - portableHrv.stressPercent, // 나머지를 PNS로
        ansAge: 0,
        fatigue: 0,                 // Chart 컴포넌트에서 physicalStress로 대체됨
        vitality: Math.min(100, portableHrv.sdnn), // SDNN(신체활력도)을 Vitality로 매핑
        vlf: 0,
        tp: 0,
        hrvIndex: 0,
        ppgLevel: hrv.ppgLevel,     // APG는 공용 가능
        brainScore: Math.min(100, portableHrv.sdnn + 10), // BrainScore도 SDNN 기반 추정 (+보정)
        dominantEEG: [],
        eegGamma: 0,
        goldenTimeStart: "10:00",
        goldenTimeEnd: "12:00",
        eegHBeta: 0,
        eegMBeta: 0,
        eegLBeta: 0,
        eegAlpha: 0,
        eegTheta: 0,
        brainBalanceL: 50,
        brainBalanceR: 50,
        brainStressCategory: '보통',
        concentrationLevel: 50,
        concentrationCategory: '중간',
        attentionLevel: 50,
        attentionCategory: '중간',
        // Portable 데이터로 실제 분석에 사용될 필드 설정
        lf: portableHrv.lf,
        hf: portableHrv.hf,
        meanHr: portableHrv.meanBpm,
        physicalStress: portableHrv.stressIndex,
        // Portable 전용 데이터 추가
        portableHrv: portableHrv
      }
      : {
        ...hrv,
        // BrainBody 모드에서도 Vitality/Fatigue가 0이면 SNS/PNS 값으로 자동 매핑
        // 이를 통해 차트가 항상 동적으로 작동하도록 보장 (Universal Support)
        fatigue: hrv.fatigue || hrv.sns,
        vitality: hrv.vitality || hrv.pns,
        physicalStress: hrv.physicalStress || hrv.sns,

        // BrainScore가 0이면 HRV 수치 기반으로 추정
        brainScore: hrv.brainScore || Math.min(100, hrv.pns + 10)
      };

    const surveyData: SurveyData = {
      gad7: 5,
      bai: surveyScores.bai,
      isi: surveyScores.isi,
      concentrationScore: surveyScores.concentration,
      adrenalFatigueScore: surveyScores.adrenal,
      chronicFatigue: surveyScores.isChronicFatigue,
      fatigueSymptomsCount: surveyScores.fatigueCount,
      symptoms: FATIGUE_SYMPTOMS.filter((_, i) => fatigueSymptoms[i]),
      sympatheticSymptoms: snsSymptomSelection,
      parasympatheticSymptoms: pnsSymptomSelection,
      ...mapResultsToSurveyData(studyEfficiencyResults)
    };

    // UX를 위한 의도적인 대기 (분석 느낌)
    await new Promise(resolve => setTimeout(resolve, 6500));

    // 점수 기반 분류 실행
    const classificationResult = evaluateClassificationWithScores(
      logicConfig.classificationRules,
      finalHrv,
      surveyData,
      protocol,
      analytics,
      config.isMedicalMode ? bloodTest : undefined,
      config.useBrainBody !== false
    );

    const type = classificationResult.primary;
    const strategy = CARE_STRATEGIES[type] || CARE_STRATEGIES[CareType.HEALTHY];

    const brainBodyState = evaluateBrainBodyCoherence(
      finalHrv,
      surveyData,
      type
    );

    let analysis: string;
    if (type === CareType.UNASSESSED) {
      analysis = "## [1] 분석 불가\n- 주요 데이터(HRV, 설문 등)가 충분히 입력되지 않아 정확한 분석을 수행할 수 없습니다.\n- 진단을 다시 시작하여 모든 단계를 완료해주세요.";
    } else {
      // 기존 generateClinicalAnalysis 호출 (주분류 사용)
      analysis = generateClinicalAnalysis(
        student,
        finalHrv,
        surveyData,
        protocol,
        analytics,
        type,
        logicConfig,
        config.isMedicalMode ? bloodTest : undefined,
        cognitiveResults,
        brainBodyState
      );
    }

    // Fetch previous result for Coherence Timeline tracking
    let prevAssessmentResult: AssessmentResult | null = null;
    try {
      const history = await DatabaseService.getHistoryByStudentInfo(student.name, student.birthDate);
      if (history && history.length > 0) {
        // Sort by date descending (most recent first)
        const sortedHistory = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        // Find the most recent record that has a careType and isn't the one we are creating right now
        // Assuming we haven't saved the current one yet
        const lastRecord = sortedHistory[0];
        
        // Reconstruct a partial AssessmentResult enough for dashboard
        if (lastRecord) {
           prevAssessmentResult = {
             student: { ...student },
             careType: lastRecord.careType as CareType,
             hrv: lastRecord.hrv as HRVData,
             survey: lastRecord.survey as SurveyData,
             brainBodyState: evaluateBrainBodyCoherence(
               lastRecord.hrv as HRVData, 
               lastRecord.survey as SurveyData, 
               lastRecord.careType as CareType
             ),
             protocol: {} as any,
             analytics: {} as any,
             nutrition: [],
             careGuide: [],
             analysisText: '',
             score: lastRecord.score || 0,
             scoreLevel: ''
           };
        }
      }
    } catch (e) {
      console.warn('Failed to fetch previous history for timeline', e);
    }

    // Generate medical analysis if in Medical Mode
    const medicalAnalysisResult = config.isMedicalMode && bloodTest.hemoglobin > 0
      ? analyzeMedicalData(bloodTest, type, student.gender)
      : undefined;

    const scoreLevel = finalHrv.brainScore >= 80 ? 'Excellent' :
      finalHrv.brainScore >= 60 ? 'Good' :
        finalHrv.brainScore >= 40 ? 'Fair' : 'Needs Attention';

    const finalResult: AssessmentResult = {
      student,
      careType: type,
      classificationResult, // 상세 분류 결과 저장
      hrv: finalHrv,
      survey: surveyData,
      protocol,
      analytics: {
        ...analytics,
        preferredLocation: protocol.location || analytics.preferredLocation // 사용자 선택 장소 반영
      },
      nutrition: [strategy.nutritionGuide], // 배열 형태로 변환
      careGuide: [ // 케어 가이드 통합
        `학습 전략: ${strategy.studyStrategy}`,
        `운동 가이드: ${strategy.exerciseGuide}`,
        `회복 루틴: ${strategy.recoveryGuide}`,
        `사전 루틴: ${strategy.preStudyRoutine}`,
        ...(strategy.lifestyleGuide ? [`생활 수칙: ${strategy.lifestyleGuide}`] : [])
      ],
      analysisText: analysis,
      score: finalHrv.brainScore,
      scoreLevel,
      // Medical Expert Mode fields - 혈액검사 값이 있으면 저장 (제품 추천에 활용)
      bloodTest: (config.isMedicalMode || bloodTest.hemoglobin > 0 || bloodTest.vitaminD > 0 || bloodTest.crp > 0)
        ? bloodTest
        : undefined,
      medicalAnalysis: medicalAnalysisResult,
      medicalNotes: config.isMedicalMode ? medicalNotes : undefined,
      previousResult: prevAssessmentResult,
      brainBodyState,
      cognitiveResults,
      studyEfficiencyResults,
      workingMemoryResults: (surveyScores as any).workingMemoryScore !== undefined ? { score: (surveyScores as any).workingMemoryScore } : undefined,
      completedExpertGuideItems: []
    };

    setResult(finalResult);

    // [AUTO SAVE] Save to History & LocalStorage & IndexedDB
    const historyItem = { ...finalResult, date: new Date().toISOString() };

    // 1. IndexedDB 저장 (비동기 처리)
    DatabaseService.addHistory(finalResult).then(() => {
      console.log('✅ Assessment Saved to IndexedDB');
    }).catch(err => console.error('Failed to save to DB:', err));

    // 2. React State & LocalStorage 업데이트 (기존 로직 유지 leading to visual update)
    const updatedHistory = [historyItem, ...history].slice(0, 50); // Keep last 50
    setHistory(updatedHistory);
    localStorage.setItem('sn1_history', JSON.stringify(updatedHistory));

    setStep('results');
  };

  // --- Role Views & Owner Dashboard ---
  if (step === 'owner_dashboard') {
    return <OwnerDashboardView onBack={() => setStep('register')} />;
  }
  if (step === 'role_selection') {
    return (
      <RoleSelectionView
        onSelectRole={(role) => {
          if (role === 'OWNER') {
            setStep('owner_dashboard');
          } else if (role === 'PARENT') {
            setStep('parent_dashboard');
          } else if (role === 'EXPERT') {
            setStep('expert_dashboard');
          } else {
            setStep('register');
          }
        }}
      />
    );
  }
  if (step === 'parent_dashboard') {
    return <ParentDashboard onBack={() => setStep('role_selection')} />;
  }
  if (step === 'expert_dashboard') {
    return <ExpertDashboard onBack={() => setStep('role_selection')} />;
  }

  // --- Menu Views ---
  if (activeMenu === 'dashboard') {
    return <Layout activeMenu={activeMenu} onMenuChange={setActiveMenu} isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} onAdminClick={() => setShowAdminPassword(true)} onOwnerClick={() => setStep('owner_dashboard')}><DashboardView onStartClick={() => { setActiveMenu('assessment'); setStep('register'); }} onHistoryClick={() => setActiveMenu('history')} onResourcesClick={() => setActiveMenu('resources')} history={history} config={config} analystConfig={(logicConfig as any).analystConfig} /><AdminPasswordModal isOpen={showAdminPassword} password={adminPasswordInput} onPasswordChange={setAdminPasswordInput} onConfirm={handleAdminUnlock} onCancel={() => { setShowAdminPassword(false); setAdminPasswordInput(''); }} /><ConfigModal /></Layout>;
  }
  if (activeMenu === 'history') {
    const handleViewDetail = (record: AssessmentResult) => {
      setResult(record);

      // 사용자 UX상 결과 확인에서 '뒤로가기'를 누르면 해당 시점의 데이터가 보여야 함
      // 따라서 History 기록을 현재 입력 스테이트에 복원합니다.
      setStudent(record.student);
      setHrv(record.hrv);
      setProtocol(record.protocol);
      setAnalytics(record.analytics);

      // Restore Portable HRV if available (or derive from record if structure allows)
      // Note: record.hrv might differ structure-wise from portableHrv state, but we do our best.
      if ((record.hrv as any).portableHrv) {
        setPortableHrv((record.hrv as any).portableHrv);
      }

      // Restore Strategies & Prescriptions if available
      // (These might be re-derived on the fly, but good to ensure consistency if saved)
      // Note: Strategies are usually derived, but if we have saved edits, we'd need them.
      // Current AssessmentResult structure might not save strategies explicitly in root.
      // If not, they are re-calculated in ResultsView based on careType.

      // Restore medical mode states if they exist in history
      if (record.bloodTest) setBloodTest(record.bloodTest);
      if (record.medicalNotes) setMedicalNotes(record.medicalNotes);
      if ((record as any).adminMemo) setAdminMemo((record as any).adminMemo);

      // Restore Study Efficiency results from survey data
      const recordDate = (record as any).date || '';
      if (record.survey) {
        setStudyEfficiencyResults(mapSurveyDataToResults(record.survey, recordDate) as any);

        // Restore Survey State variables from survey data for consistency
        // (This allows SurveyStep to show correct answers if revisited)
        setBaiAnswers(new Array(21).fill(0)); // Reset first, or map if we stored individual answers
        // Note: Unless we stored individual answers array in record.survey, we can't fully restore the checkboxes.
        // But we can verify if record.survey has them. 
        // type SurveyData generally aggregates them. 
        // If exact restoring is critical, SurveyData needs to store raw answers. 
        // For now, restoring the 'results' is key. The input steps might be empty if raw answers weren't saved.
        // However, user asked for "Data persistence". 
        // *Short-term fix*: Restore what we can. Main Protocol/Analytics/Student/HRV are fully restorable.
      }

      // Fix for Cognitive Results restore
      // Assuming cognitive results might be derived or stored? 
      // If we don't have them in record, we might skip. 
      // But typically they are part of the flow.

      setStep('results');
      setActiveMenu('assessment');
    };

    const handleImportData = (data: (AssessmentResult & { date: string })[], merge: boolean) => {
      if (merge) {
        // 병합: 중복 제거 (날짜 기준)
        const existingDates = new Set(history.map(h => h.date));
        const newData = data.filter(d => !existingDates.has(d.date));
        const merged = [...history, ...newData].sort((a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
        ).slice(0, 50); // 최대 50건 유지
        setHistory(merged);
        localStorage.setItem('sn1_history', JSON.stringify(merged));
      } else {
        // 덮어쓰기
        setHistory(data);
        localStorage.setItem('sn1_history', JSON.stringify(data));
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
        // Also update local storage if it's mirrored there
        localStorage.setItem('sn1_history', JSON.stringify(updatedHistory));
      } catch (err) {
        console.error('Failed to delete history', err);
        alert('삭제에 실패했습니다.');
      }
    };

    return (
      <Layout activeMenu={activeMenu} onMenuChange={setActiveMenu} isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} onAdminClick={() => setShowAdminPassword(true)}>
        <HistoryView
          history={history}
          selectedStudentId={selectedStudentId}
          onSelectStudent={setSelectedStudentId}
          onStartClick={() => { setActiveMenu('assessment'); setStep('register'); }}
          onViewDetail={handleViewDetail}
          onImportData={handleImportData}
          onExportJSON={handleExportJSON}
          onExportCSV={handleExportCSV}
          onTrendClick={() => {
            console.log("📈 Global Trend Analysis Clicked!");
            setShowHistoryAnalysisModal(true);
          }}
          onDeleteRecord={handleDeleteHistory}
        />
        {history.length > 0 && <ProgressAnalytics history={history} />}
        <AdminPasswordModal isOpen={showAdminPassword} password={adminPasswordInput} onPasswordChange={setAdminPasswordInput} onConfirm={handleAdminUnlock} onCancel={() => { setShowAdminPassword(false); setAdminPasswordInput(''); }} />
        <ConfigModal />
        <HistoryAnalysisManager
          isOpen={showHistoryAnalysisModal}
          onClose={() => setShowHistoryAnalysisModal(false)}
          history={history}
          selectedStudentId={selectedStudentId}
          currentResult={result}
        />
      </Layout>
    );
  }
  if (activeMenu === 'progress') {
    return (
      <Layout activeMenu={activeMenu} onMenuChange={setActiveMenu} isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} onAdminClick={() => setShowAdminPassword(true)}>
        <ProgressView
          history={history}
          selectedStudentId={selectedStudentId}
          onSelectStudent={setSelectedStudentId}
          onStartClick={() => { setActiveMenu('assessment'); setStep('register'); }}
        />
        <AdminPasswordModal isOpen={showAdminPassword} password={adminPasswordInput} onPasswordChange={setAdminPasswordInput} onConfirm={handleAdminUnlock} onCancel={() => { setShowAdminPassword(false); setAdminPasswordInput(''); }} />
        <ConfigModal />
      </Layout>
    );
  }
  if (activeMenu === 'resources') {
    return <Layout activeMenu={activeMenu} onMenuChange={setActiveMenu} isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} onAdminClick={() => setShowAdminPassword(true)}><ResourcesView /><AdminPasswordModal isOpen={showAdminPassword} password={adminPasswordInput} onPasswordChange={setAdminPasswordInput} onConfirm={handleAdminUnlock} onCancel={() => { setShowAdminPassword(false); setAdminPasswordInput(''); }} /><ConfigModal /></Layout>;
  }
  if (activeMenu === 'solutions') {
    return <Layout activeMenu={activeMenu} onMenuChange={setActiveMenu} isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} onAdminClick={() => setShowAdminPassword(true)}><StressCareLabView student={student} history={history} /><AdminPasswordModal isOpen={showAdminPassword} password={adminPasswordInput} onPasswordChange={setAdminPasswordInput} onConfirm={handleAdminUnlock} onCancel={() => { setShowAdminPassword(false); setAdminPasswordInput(''); }} /><ConfigModal /></Layout>;
  }
  // ------------------

  if (step === 'register') {
    return (
      <Layout activeMenu={activeMenu} onMenuChange={setActiveMenu} isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} onAdminClick={() => setShowAdminPassword(true)}>
        <StepProgressBar currentStep={step} isMedicalMode={config.isMedicalMode} isPortableMode={config.usePortable} onStepClick={setStep as any} />
        <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 mt-4">
          <div className="bg-blue-600 p-8 text-white relative">
            {config.currentExaminerId && (
                <div className="absolute top-6 right-8 bg-blue-700/50 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-inner">
                    <span className="text-blue-200">👨‍⚕️ 검사자 ID:</span>
                    <span>{(() => {
                        const ex = config.examiners?.find(e => e.id === config.currentExaminerId);
                        return ex ? `${ex.id}${ex.position ? ` (${ex.position})` : ''}` : config.currentExaminerId;
                    })()}</span>
                </div>
            )}
            <h2 className="text-2xl font-bold">Student Registration</h2>
            <p className="text-blue-100 mt-1">기본 정보를 입력하여 진단을 시작하십시오.</p>
          </div>
          <div className="p-8 space-y-6">
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
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">학년 (Grade)</label>
                <select value={student.grade} onChange={e => setStudent({ ...student, grade: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all">
                  {GRADE_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
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
                <h3 className="text-sm font-black text-indigo-600 uppercase tracking-wider mb-2">수능 과목 선택 (Subject Selection)</h3>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">공통/필수 (국어, 수학, 영어, 한국사)</label>
                    <div className="flex flex-wrap gap-2">
                      {SUNEUNG_SUBJECTS.filter(s => s.category === 'common' || s.category === 'required').map(subj => {
                        const isSelected = (student.selectedSubjects || []).includes(subj.id);
                        const isFocused = (student.focusSubjects || []).includes(subj.id) || student.weakSubject === subj.id;
                        return (
                          <div key={subj.id} className="relative group">
                            <button
                              onClick={() => {
                                const newSelected = isSelected 
                                  ? (student.selectedSubjects || []).filter(id => id !== subj.id)
                                  : [...(student.selectedSubjects || []), subj.id];
                                let newWeakSubject = student.weakSubject;
                                if (!isSelected && ['korean', 'math', 'english'].includes(subj.id)) {
                                    newWeakSubject = subj.id as 'korean' | 'math' | 'english';
                                }
                                setStudent({ ...student, selectedSubjects: newSelected, weakSubject: newWeakSubject });
                              }}
                              className={`px-4 py-2 rounded-lg font-bold border transition-all text-sm ${isSelected ? 'bg-white border-blue-400 text-blue-700 shadow-sm' : 'bg-white text-slate-400 border-slate-200 hover:border-blue-300'}`}
                            >
                              {subj.name}
                            </button>
                            {isSelected && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const newFocus = isFocused
                                    ? (student.focusSubjects || []).filter(id => id !== subj.id)
                                    : [...(student.focusSubjects || []), subj.id];
                                  let newWeakSubject = student.weakSubject;
                                  if (!isFocused && ['korean', 'math', 'english'].includes(subj.id)) {
                                    newWeakSubject = subj.id as 'korean' | 'math' | 'english';
                                  } else if (isFocused && student.weakSubject === subj.id) {
                                    newWeakSubject = undefined;
                                  }
                                  setStudent({ ...student, focusSubjects: newFocus, weakSubject: newWeakSubject });
                                }}
                                className={`absolute -top-2 -right-2 w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-black shadow-sm transition-all z-10 ${isFocused ? 'bg-rose-500 text-white' : 'bg-slate-200 text-slate-400 hover:bg-rose-200'}`}
                                title="가장 부담되는 과목(Focus Subject)으로 지정"
                              >
                                !
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">사회/과학탐구 (Social/Science)</label>
                      <div className="flex flex-wrap gap-2">
                        {SUNEUNG_SUBJECTS.filter(s => s.category === 'social' || s.category === 'science').map(subj => {
                          const isSelected = (student.selectedSubjects || []).includes(subj.id);
                          const isFocused = (student.focusSubjects || []).includes(subj.id);
                          return (
                            <div key={subj.id} className="relative">
                              <button
                                onClick={() => {
                                  const newSelected = isSelected 
                                    ? (student.selectedSubjects || []).filter(id => id !== subj.id)
                                    : [...(student.selectedSubjects || []), subj.id];
                                  setStudent({ ...student, selectedSubjects: newSelected });
                                }}
                                className={`px-3 py-1.5 rounded-lg border transition-all text-[11px] font-bold ${isSelected ? 'bg-white border-blue-400 text-blue-700 shadow-sm' : 'bg-white text-slate-400 border-slate-200 hover:border-blue-300'}`}
                              >
                                {subj.name}
                              </button>
                              {isSelected && (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const newFocus = isFocused
                                      ? (student.focusSubjects || []).filter(id => id !== subj.id)
                                      : [...(student.focusSubjects || []), subj.id];
                                    setStudent({ ...student, focusSubjects: newFocus });
                                  }}
                                  className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-[8px] flex items-center justify-center font-black shadow-sm transition-all z-10 ${isFocused ? 'bg-rose-500 text-white' : 'bg-slate-200 text-slate-400 hover:bg-rose-200'}`}
                                >
                                  !
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">제2외국어/한문 (Foreign)</label>
                      <div className="flex flex-wrap gap-2">
                        {SUNEUNG_SUBJECTS.filter(s => s.category === 'foreign').map(subj => {
                          const isSelected = (student.selectedSubjects || []).includes(subj.id);
                          const isFocused = (student.focusSubjects || []).includes(subj.id);
                          return (
                            <div key={subj.id} className="relative">
                              <button
                                onClick={() => {
                                  const newSelected = isSelected 
                                    ? (student.selectedSubjects || []).filter(id => id !== subj.id)
                                    : [...(student.selectedSubjects || []), subj.id];
                                  setStudent({ ...student, selectedSubjects: newSelected });
                                }}
                                className={`px-3 py-1.5 rounded-lg border transition-all text-[11px] font-bold ${isSelected ? 'bg-white border-blue-400 text-blue-700 shadow-sm' : 'bg-white text-slate-400 border-slate-200 hover:border-blue-300'}`}
                              >
                                {subj.name}
                              </button>
                              {isSelected && (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const newFocus = isFocused
                                      ? (student.focusSubjects || []).filter(id => id !== subj.id)
                                      : [...(student.focusSubjects || []), subj.id];
                                    setStudent({ ...student, focusSubjects: newFocus });
                                  }}
                                  className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-[8px] flex items-center justify-center font-black shadow-sm transition-all z-10 ${isFocused ? 'bg-rose-500 text-white' : 'bg-slate-200 text-slate-400 hover:bg-rose-200'}`}
                                >
                                  !
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-blue-100/50 rounded-lg text-xs text-blue-800 flex items-start gap-2">
                  <span>💡</span>
                  <p>과목을 클릭하여 응시 과목으로 선택하고, 선택된 과목 우측 상단의 <span className="inline-block w-4 h-4 rounded-full bg-slate-200 text-slate-400 text-center font-bold text-[8px] leading-4">!</span> 버튼을 눌러 <strong>가장 부담되는 과목 (Focus Subject)</strong>으로 지정하세요. (다중 지정 가능)</p>
                </div>
              </div>

              {/* NEW Physical & Personality Section */}
              <div className="md:col-span-2 pt-4 border-t border-slate-100 mt-2">
                <h3 className="text-sm font-black text-blue-600 uppercase tracking-wider mb-4">신체 및 성향 정보 (Physical & Personality)</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">키 (Height cm)</label>
                    <input type="number" value={student.height || ''} onChange={e => setStudent({ ...student, height: e.target.value ? parseInt(e.target.value, 10) || 0 : 0 })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">몸무게 (Weight kg)</label>
                    <input type="number" value={student.weight || ''} onChange={e => setStudent({ ...student, weight: e.target.value ? parseInt(e.target.value, 10) || 0 : 0 })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">BMI (자동계산)</label>
                    <div className="w-full px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg text-sm font-bold text-blue-700">{student.bmi}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">MBTI</label>
                      <a href="https://www.16personalities.com/ko/%EB%AC%B4%EB%A3%8C-%EC%84%B1%EA%B2%A9-%EC%9C%A0%ED%98%95-%EA%B2%80%EC%82%AC" target="_blank" rel="noreferrer" className="text-[10px] font-bold text-indigo-500 hover:text-indigo-700 hover:underline">
                        모르시나요? 검사하기 ↗
                      </a>
                    </div>
                    <select value={student.mbti} onChange={e => setStudent({ ...student, mbti: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm">
                      {['ISTJ', 'ISFJ', 'INFJ', 'INTJ', 'ISTP', 'ISFP', 'INFP', 'INTP', 'ESTP', 'ESFP', 'ENFP', 'ENTP', 'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ'].map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
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

            <button
              onClick={async () => {
                if (isMultiMonitorMode) {
                  // 멀티모니터 모드: 세션 생성 후 학생 창 열기
                  const sessionId = await syncCreateSession(student.id, student.name);
                  if (sessionId) {
                    // 학생 창 열기
                    const studentWin = syncOpenStudentWindow();
                    setStudentWindowRef(studentWin);

                    // HRV 입력 단계로 바로 이동 (설문은 학생 창에서)
                    setStep('hrv');
                  }
                } else {
                  // 일반 모드: 기존대로 설문 단계로 이동
                  setStep('surveys');
                }
              }}
              disabled={!student.name}
              className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg hover:bg-blue-700 disabled:opacity-50 transition-all mt-4"
            >
              {isMultiMonitorMode ? '🖥️ 검사 시작 (학생 창 열기)' : '검사 시작 (Start Assessment)'}
            </button>
          </div>
        </div>
        <AdminPasswordModal isOpen={showAdminPassword} password={adminPasswordInput} onPasswordChange={setAdminPasswordInput} onConfirm={handleAdminUnlock} onCancel={() => { setShowAdminPassword(false); setAdminPasswordInput(''); }} />
      </Layout>
    );
  }

  // [NEW] Role Selection View
  if (step === 'role_selection') {
    return (
      <RoleSelectionView 
        onSelectRole={(role) => {
          if (role === 'STUDENT') setStep('register');
          else if (role === 'PARENT') setStep('parent_dashboard');
          else if (role === 'EXPERT') setStep('expert_dashboard');
        }}
      />
    );
  }

  // [NEW] Parent Dashboard View
  if (step === 'parent_dashboard') {
    // get most recent history
    const sortedHistory = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return (
      <ParentDashboard 
        studentName={sortedHistory[0]?.student.name || '학생'}
        recentResult={sortedHistory[0] || null}
        onViewReport={() => setStep('results')}
        onLogout={() => setStep('role_selection')}
      />
    );
  }

  // [NEW] Expert Dashboard View
  if (step === 'expert_dashboard') {
    return (
      <ExpertDashboard 
        history={history}
        onStartNewAssessment={() => setStep('register')}
        onViewReport={(res) => {
          setResult(res);
          setStep('results');
        }}
        onLogout={() => setStep('role_selection')}
      />
    );
  }

  if (step === 'surveys') {
    return (
      <SurveysStep
        onNext={() => setStep('protocol')}
        setStep={setStep}
        activeMenu={activeMenu}
        onMenuChange={setActiveMenu}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        onAdminClick={() => setShowAdminPassword(true)}
        config={config}
        ConfigModal={ConfigModal}
        showAdminPassword={showAdminPassword}
        adminPasswordInput={adminPasswordInput}
        onAdminPasswordChange={setAdminPasswordInput}
        onAdminConfirm={handleAdminUnlock}
        onAdminCancel={() => { setShowAdminPassword(false); setAdminPasswordInput(''); }}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
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
      />
    );
  }

  if (step === 'protocol') {
    return (
      <ProtocolStep
        onNext={() => setStep('analytics')}
        onBack={() => setStep('surveys')}
        onStepClick={setStep as any}
        activeMenu={activeMenu}
        onMenuChange={setActiveMenu}
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
        onMenuChange={setActiveMenu}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        config={config}
        analytics={analytics}
        setAnalytics={setAnalytics}
      />
    );
  }

  // ========== 공부 효율성 정밀 검사 Step ==========
  if (step === 'study_efficiency') {
    return (
      <StudyEfficiencyStep
        onNext={() => setStep('working_memory')}
        onBack={() => setStep('analytics')}
        onStepClick={setStep as any}
        activeMenu={activeMenu}
        onMenuChange={setActiveMenu}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        config={config}
        studyEfficiencyResults={studyEfficiencyResults}
        setStudyEfficiencyResults={setStudyEfficiencyResults}
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
        onMenuChange={setActiveMenu}
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
    return (
      <CognitivePerformanceStep
        onNext={() => {
          if (!config.useBrainBody && !config.usePortable) {
            if (config.isMedicalMode) setStep('bloodtest');
            else handleFinalAssessment();
          } else {
            setStep('hrv');
          }
        }}
        onBack={() => setStep('working_memory')}
        onStepClick={setStep as any}
        activeMenu={activeMenu}
        onMenuChange={setActiveMenu}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        config={config}
        cognitiveResults={cognitiveResults}
        setCognitiveResults={setCognitiveResults}
      />
    );
  }

  if (step === 'hrv') {
    return (
      <HRVStep
        onNext={() => {
          if (config.usePortable && !config.useBrainBody) {
            if (config.isMedicalMode) setStep('bloodtest');
            else handleFinalAssessment();
          } else {
            setStep('eeg');
          }
        }}
        onBack={() => setStep('cognitive_test')}
        onStepClick={setStep as any}
        handleFinalAssessment={handleFinalAssessment}
        activeMenu={activeMenu}
        onMenuChange={setActiveMenu}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        config={config}
        student={student}
        hrv={hrv}
        setHrv={setHrv}
        portableHrv={portableHrv}
        setPortableHrv={setPortableHrv}
        showBreathingGuide={false}
        setShowBreathingGuide={() => { }}
        isMultiMonitorMode={false}
        syncSessionId={null}
        syncStudentReady={false}
        syncStudentData={{}}
        syncOpenStudentWindow={() => null}
        setStudentWindowRef={() => { }}
      />
    );
  }

  if (step === 'eeg') {
    return (
      <EEGStep
        onNext={() => {
          if (config.isMedicalMode) setStep('bloodtest');
          else handleFinalAssessment();
        }}
        onBack={() => setStep('hrv')}
        handleFinalAssessment={handleFinalAssessment}
        activeMenu={activeMenu}
        onMenuChange={setActiveMenu}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        config={config}
        hrv={hrv}
        setHrv={setHrv}
      />
    );
  }

  // Blood Test Step (Medical Expert Mode only)
  if (step === 'bloodtest') {
    return (
      <Layout activeMenu={activeMenu} onMenuChange={setActiveMenu} isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode}>
        <StepProgressBar currentStep={step} isMedicalMode={config.isMedicalMode} isPortableMode={config.usePortable} />
        <div className="mt-4">
          <BloodTestInput
            bloodTest={bloodTest}
            onChange={setBloodTest}
            onBack={() => {
              if (config.usePortable && !config.useBrainBody) setStep('hrv');
              else setStep('eeg');
            }}
            onNext={handleFinalAssessment}
            gender={student.gender}
          />
        </div>
      </Layout>
    );
  }

  if (step === 'loading') {
    return (
      <Layout activeMenu={activeMenu} onMenuChange={setActiveMenu} isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode}>
        <StepProgressBar currentStep={step} isMedicalMode={config.isMedicalMode} />
        <div className="flex flex-col items-center justify-center min-h-[60vh] mt-4">
          <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-6"></div>
          <h2 className="text-2xl font-bold text-slate-800">종합 데이터 분석 중...</h2>
          <p className="text-slate-500 mt-2">유형 식별 및 맞춤 솔루션을 생성하고 있습니다.</p>
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
      />
      <AIChatbotWidget contextData={result} aiModels={aiModels} />
      </>
    );
  }

  if (step === 'grade_management') {
    return (
      <GradeManagementView 
        student={student}
        onBack={() => setStep('results')}
        currentAssessment={result || undefined}
        aiModels={aiModels}
      />
    );
  }

  if (step === 'sleep_management') {
    return (
      <SleepManagementView 
        student={student}
        onBack={() => setStep('results')}
        currentAssessment={result || undefined}
        aiModels={aiModels}
      />
    );
  }

  if (step === 'admin_expertise') {
    return (
      <Layout activeMenu={activeMenu} onMenuChange={setActiveMenu} isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} onAdminClick={() => setShowAdminPassword(true)}>
        <AdminExpertiseView
          onBack={() => { setStep('results'); setShowConfig(true); }}
          studentName={student.name}
          studentId={student.id}
        />

        <AdminPasswordModal isOpen={showAdminPassword} password={adminPasswordInput} onPasswordChange={setAdminPasswordInput} onConfirm={handleAdminUnlock} onCancel={() => { setShowAdminPassword(false); setAdminPasswordInput(''); }} />

        {/* Consultation Letter Modal (Feature 1) */}
        {showLetterModal && result && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-indigo-950/40 backdrop-blur-md p-4 animate-in zoom-in duration-300">
            <div className="bg-white w-full max-w-xl rounded-[40px] shadow-[0_50px_100px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col max-h-[90vh]">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-8 text-white relative">
                <button onClick={() => setShowLetterModal(false)} className="absolute top-6 right-6 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors">✕</button>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-70 mb-2">Automated Report Generator</p>
                <h3 className="text-3xl font-black">학부모 발송용 상담 레터</h3>
              </div>
              <div className="p-10 flex-1 overflow-y-auto">
                <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 font-medium text-slate-700 leading-relaxed whitespace-pre-wrap selection:bg-emerald-100">
                  {generateConsultationLetter(result)}
                </div>
              </div>
              <div className="p-8 pt-0 flex gap-4">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generateConsultationLetter(result));
                    alert('텍스트가 복사되었습니다. 카카오톡이나 메시지에 붙여넣으세요.');
                  }}
                  className="flex-1 py-5 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 active:scale-95 flex items-center justify-center gap-2"
                >
                  요약문 복사하기
                </button>
                <button onClick={() => setShowLetterModal(false)} className="px-8 py-5 border-2 border-slate-200 text-slate-500 font-bold rounded-2xl hover:bg-slate-50 transition-colors">닫기</button>
              </div>
            </div>
          </div>
        )}
        {/* Study Efficiency Assessment Modal (공부 효율성 정밀 검사) - 결과 화면 내부 */}
        {(() => { console.log('DEBUG RENDER: showStudyEfficiencyModal=', showStudyEfficiencyModal, 'result=', !!result); return null; })()}
        {showStudyEfficiencyModal && result && (
          <StudyEfficiencyAssessment
            careType={result.careType}
            isPortableMode={config.usePortable && !config.useBrainBody}
            onComplete={(assessmentResults) => {
              setStudyEfficiencyResults(assessmentResults);
              setShowStudyEfficiencyModal(false);
              // 결과를 survey 데이터에 업데이트
              const updatedResult = {
                ...result,
                survey: {
                  ...result.survey,
                  chronotypeScore: assessmentResults.chronotype?.score,
                  chronotypeResult: assessmentResults.chronotype?.result,
                  varkPrimary: assessmentResults.vark?.primary,
                  varkScores: assessmentResults.vark ? { V: assessmentResults.vark.V, A: assessmentResults.vark.A, R: assessmentResults.vark.R, K: assessmentResults.vark.K } : undefined,
                  testAnxietyCognitive: assessmentResults.testAnxiety?.cognitiveScore,
                  testAnxietySomatic: assessmentResults.testAnxiety?.somaticScore,
                  testAnxietyType: assessmentResults.testAnxiety?.dominantType,
                  digitalAddictionScore: assessmentResults.digitalAddiction?.totalScore,
                  digitalAddictionLevel: assessmentResults.digitalAddiction?.level,
                  metacognitionLevel: assessmentResults.metacognition?.learnerLevel,
                  metacognitionScores: assessmentResults.metacognition ? {
                    rehearsal: assessmentResults.metacognition.rehearsalScore,
                    elaboration: assessmentResults.metacognition.elaborationScore,
                    organization: assessmentResults.metacognition.organizationScore,
                    metacognitive: assessmentResults.metacognition.metacognitiveScore
                  } : undefined
                }
              };
              setResult(updatedResult);
              alert('✅ 공부 효율성 검사가 완료되었습니다! 결과가 리포트에 반영됩니다.');
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

  // Show License Activation Screen if needed
  if (showLicenseScreen && licenseChecked) {
    return (
      <LicenseActivation
        onActivated={(info) => {
          setLicenseInfo(info);
          setCurrentTier(info.tier);
          setShowLicenseScreen(false);
        }}
        onSkip={() => {
          setCurrentTier('free');
          setShowLicenseScreen(false);
        }}
      />
    );
  }

  return (
    <Layout activeMenu={activeMenu} onMenuChange={setActiveMenu} isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} onAdminClick={() => setShowAdminPassword(true)}>
      <div className="w-full max-w-full space-y-8 animate-in fade-in duration-500 min-h-screen pb-20 pt-6 text-center">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-center gap-3 mb-4">
            <h2 className="text-3xl font-black text-slate-900">YES_YOU Assessment</h2>
            <MembershipBadge tier={currentTier} size="md" onClick={() => setShowLicenseScreen(true)} />
          </div>
          <p className="text-slate-500 mb-8">새로운 진단을 시작시겠습니까?</p>
          <button onClick={() => { setActiveMenu('assessment'); setStep('register'); }} className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition">
            Start New Assessment
          </button>
        </div>
      </div>

      <AdminPasswordModal isOpen={showAdminPassword} password={adminPasswordInput} onPasswordChange={setAdminPasswordInput} onConfirm={handleAdminUnlock} onCancel={() => { setShowAdminPassword(false); setAdminPasswordInput(''); }} />

      {/* Rule Editors */}
      {showClassificationEditor && (
        <RuleEditor
          type="classification"
          rules={logicConfig.classificationRules}
          onSave={(rules) => {
            const newConfig = { ...logicConfig, classificationRules: rules };
            setLogicConfig(newConfig);
            saveLogicConfig(newConfig);
          }}
          onClose={() => setShowClassificationEditor(false)}
        />
      )}

      {showProductRuleEditor && (
        <RuleEditor
          type="product"
          rules={logicConfig.productRules}
          onSave={(rules) => {
            const newConfig = { ...logicConfig, productRules: rules };
            setLogicConfig(newConfig);
            saveLogicConfig(newConfig);
          }}
          onClose={() => setShowProductRuleEditor(false)}
        />
      )}

      {/* Zen Mode Overlay */}
      {showZenMode && result && (
        <PrescriptionZenMode
          careType={result.careType}
          prescription={prescriptions[result.careType] || prescriptions[CareType.BURNOUT]}
          onClose={() => setShowZenMode(false)}
        />
      )}
      {result && (
        <DataEditorModal
          isOpen={showDataEditor}
          onClose={() => setShowDataEditor(false)}
          initialData={result}
          onSave={handleDataUpdate}
        />
      )}
      {/* Study Efficiency Assessment Modal (공부 효율성 정밀 검사) */}
      {showStudyEfficiencyModal && result && (
        <StudyEfficiencyAssessment
          careType={result.careType}
          isPortableMode={config.usePortable && !config.useBrainBody}
          onComplete={(results) => {
            setStudyEfficiencyResults(results);
            setShowStudyEfficiencyModal(false);
            // 결과를 survey 데이터에 업데이트
            if (result) {
              const updatedResult = {
                ...result,
                survey: {
                  ...result.survey,
                  chronotypeScore: results.chronotype?.score,
                  chronotypeResult: results.chronotype?.result,
                  varkPrimary: results.vark?.primary,
                  varkScores: results.vark ? { V: results.vark.V, A: results.vark.A, R: results.vark.R, K: results.vark.K } : undefined,
                  testAnxietyCognitive: results.testAnxiety?.cognitiveScore,
                  testAnxietySomatic: results.testAnxiety?.somaticScore,
                  testAnxietyType: results.testAnxiety?.dominantType,
                  digitalAddictionScore: results.digitalAddiction?.totalScore,
                  digitalAddictionLevel: results.digitalAddiction?.level,
                  metacognitionLevel: results.metacognition?.learnerLevel,
                  metacognitionScores: results.metacognition ? {
                    rehearsal: results.metacognition.rehearsalScore,
                    elaboration: results.metacognition.elaborationScore,
                    organization: results.metacognition.organizationScore,
                    metacognitive: results.metacognition.metacognitiveScore
                  } : undefined
                }
              };
              setResult(updatedResult);
            }
            alert('✅ 공부 효율성 검사가 완료되었습니다! 결과가 리포트에 반영됩니다.');
          }}
          onClose={() => setShowStudyEfficiencyModal(false)}
        />
      )}

      {/* Global Pomodoro Timer connected to student CareType diagnosis */}
      <PomodoroTimer careType={result?.careType} />

    </Layout>
  );
};
export default App;
