import { useState, useCallback, useMemo } from 'react';
import {
  StudentInfo,
  HRVData,
  ProtocolData,
  LearningAnalyticsData,
  AssessmentResult,
  BloodTestData,
  PortableHRVData,
  ANSBalanceType
} from '../types';
import {
  generateSerialID,
  getTodayStr,
  initialStudent as defaultStudent,
  initialHRV,
  initialProtocol,
  initialAnalytics
} from '../utils/constants';
import {
  LogicEngineConfig,
  loadLogicConfig
} from '../logicEngine';
import { loadProductRecommendations } from '../data/productRecommendations';
import { loadPredictionRules } from '../data/predictionRules';
import { AnalystsStorage, loadAnalystsStorage } from '../utils/analystConfig';
import { StrategyMap } from '../types';
import { DEFAULT_STRATEGIES } from '../data/strategies';
import { CareType, Prescription } from '../types';
import { MENTAL_PRESCRIPTIONS } from '../data/prescriptions';
import { StudyEfficiencyResults } from '../services/studyEfficiencyService';
import { CognitivePerformanceResults } from '../components/CognitivePerformanceAssessment';

const initialStudent: StudentInfo = {
  ...defaultStudent,
  id: generateSerialID(),
  testDate: getTodayStr()
};

export function useAppState() {
  const [step, setStep] = useState<'register' | 'surveys' | 'protocol' | 'analytics' | 'study_efficiency' | 'working_memory' | 'cognitive_test' | 'hrv' | 'eeg' | 'bloodtest' | 'loading' | 'results' | 'admin_expertise' | 'study_management'>('register');
  const [activeMenu, setActiveMenu] = useState<'dashboard' | 'assessment' | 'history' | 'progress' | 'resources'>('dashboard');
  const [activeTab, setActiveTab] = useState<'ans' | 'bai' | 'isi' | 'concentration' | 'cfs' | 'adrenal'>('ans');
  
  const [student, setStudent] = useState<StudentInfo>(initialStudent);
  const [hrv, setHrv] = useState<HRVData>(initialHRV);
  const [protocol, setProtocol] = useState<ProtocolData>(initialProtocol);
  const [analytics, setAnalytics] = useState<LearningAnalyticsData>(initialAnalytics);
  const [isCustomLoc, setIsCustomLoc] = useState(false);

  const [result, setResult] = useState<AssessmentResult | null>(null);

  const [showConfig, setShowConfig] = useState(false);
  const [showNutritionalPrescription, setShowNutritionalPrescription] = useState(false);
  const [showDataEditor, setShowDataEditor] = useState(false);
  const [config, setConfig] = useState({
    isExamMode: true,
    showDetail: true,
    isMedicalMode: false,
    useBrainBody: false,
    usePortable: false
  });

  const [strategies, setStrategies] = useState<StrategyMap>(DEFAULT_STRATEGIES);
  const [selectedSubjectOptions, setSelectedSubjectOptions] = useState<Record<string, string[]>>({
    korean: ['kor_1'],
    math: [],
    english: ['eng_1']
  });
  const [completedItems, setCompletedItems] = useState<string[]>([]);

  const [history, setHistory] = useState<(AssessmentResult & { date: string })[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const [bloodTest, setBloodTest] = useState<BloodTestData>({
    wbc: 0, hemoglobin: 0, hematocrit: 0, mcv: 0, nkActivity: 0,
    vitaminD: 0, crp: 0, hba1c: 0,
    ast: 0, alt: 0, creatinine: 0, bun: 0,
    fastingHours: 0
  });
  const [medicalNotes, setMedicalNotes] = useState('');
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

  const [logicConfig, setLogicConfig] = useState<LogicEngineConfig>(() => loadLogicConfig());
  const [productRecommendations, setProductRecommendations] = useState<Record<string, string[]>>(() => loadProductRecommendations());
  const [predictionRules, setPredictionRules] = useState(() => loadPredictionRules());
  const [analystsStorage, setAnalystsStorage] = useState<AnalystsStorage>(() => loadAnalystsStorage());

  const [studyEfficiencyResults, setStudyEfficiencyResults] = useState<StudyEfficiencyResults | null>(null);
  const [cognitiveResults, setCognitiveResults] = useState<CognitivePerformanceResults | null>(null);
  const [workingMemoryResults, setWorkingMemoryResults] = useState<any>(null);

  const [isMultiMonitorMode, setIsMultiMonitorMode] = useState(false);

  // App UI/Modal States
  const [showStudentSearch, setShowStudentSearch] = useState(false);
  const [studentSearchResults, setStudentSearchResults] = useState<{ student: StudentInfo; latestDate: string; count: number }[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSecretPoint, setShowSecretPoint] = useState(false);
  const [adminMemo, setAdminMemo] = useState('');
  const [activeConfigTab, setActiveConfigTab] = useState<any>('general');
  const [showZenMode, setShowZenMode] = useState(false);
  const [showLetterModal, setShowLetterModal] = useState(false);
  const [editingStrategyType, setEditingStrategyType] = useState<CareType>(CareType.BURNOUT);
  const [prescriptions, setPrescriptions] = useState<Record<string, Prescription>>(MENTAL_PRESCRIPTIONS);
  const [showBreathingGuide, setShowBreathingGuide] = useState(false);
  const [showHistoryAnalysisModal, setShowHistoryAnalysisModal] = useState(false);
  const [showTrendModal, setShowTrendModal] = useState(false);
  const [adminMemos, setAdminMemos] = useState<string[]>([]);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [showClassificationEditor, setShowClassificationEditor] = useState(false);
  const [showProductRuleEditor, setShowProductRuleEditor] = useState(false);
  const [showStudyEfficiencyModal, setShowStudyEfficiencyModal] = useState(false);

  return {
    step, setStep,
    activeMenu, setActiveMenu,
    activeTab, setActiveTab,
    student, setStudent,
    hrv, setHrv,
    protocol, setProtocol,
    analytics, setAnalytics,
    isCustomLoc, setIsCustomLoc,
    result, setResult,
    showConfig, setShowConfig,
    showNutritionalPrescription, setShowNutritionalPrescription,
    showDataEditor, setShowDataEditor,
    config, setConfig,
    strategies, setStrategies,
    selectedSubjectOptions, setSelectedSubjectOptions,
    completedItems, setCompletedItems,
    history, setHistory,
    selectedStudentId, setSelectedStudentId,
    bloodTest, setBloodTest,
    medicalNotes, setMedicalNotes,
    portableHrv, setPortableHrv,
    logicConfig, setLogicConfig,
    productRecommendations, setProductRecommendations,
    predictionRules, setPredictionRules,
    analystsStorage, setAnalystsStorage,
    studyEfficiencyResults, setStudyEfficiencyResults,
    cognitiveResults, setCognitiveResults,
    workingMemoryResults, setWorkingMemoryResults,
    isMultiMonitorMode, setIsMultiMonitorMode,
    
    showStudentSearch, setShowStudentSearch,
    studentSearchResults, setStudentSearchResults,
    isSearching, setIsSearching,
    showSecretPoint, setShowSecretPoint,
    adminMemo, setAdminMemo,
    activeConfigTab, setActiveConfigTab,
    showZenMode, setShowZenMode,
    showLetterModal, setShowLetterModal,
    editingStrategyType, setEditingStrategyType,
    prescriptions, setPrescriptions,
    showBreathingGuide, setShowBreathingGuide,
    showHistoryAnalysisModal, setShowHistoryAnalysisModal,
    showTrendModal, setShowTrendModal,
    adminMemos, setAdminMemos,
    editingRuleId, setEditingRuleId,
    showClassificationEditor, setShowClassificationEditor,
    showProductRuleEditor, setShowProductRuleEditor,
    showStudyEfficiencyModal, setShowStudyEfficiencyModal
  };
}
