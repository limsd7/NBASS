import type React from 'react';
import type { AssessmentResult, CareType, ProtocolData, StrategyMap } from '../../../types';

// Moved verbatim from ResultsView.tsx (only `export` added; no UI change)
export interface ResultsViewProps {
    activeMenu: any;
    setActiveMenu: (menu: any) => void;
    isDarkMode: boolean;
    onToggleDarkMode: () => void;

    result: AssessmentResult;
    config: any;
    setConfig: (config: any) => void;
    strategies: StrategyMap;
    setStrategies: (strategies: StrategyMap) => void;
    prescriptions: any;
    setPrescriptions: (p: any) => void;
    editingStrategyType: CareType;
    setEditingStrategyType: (type: CareType) => void;
    selectedSubjectOptions: any;
    setSelectedSubjectOptions: (opts: any) => void;

    showConfig: boolean;
    [key: string]: any;
    setShowConfig: (show: boolean) => void;
    activeConfigTab: string;
    setActiveConfigTab: (tab: any) => void;

    showAdminPassword: boolean;
    setShowAdminPassword: (show: boolean) => void;
    adminPasswordInput: string;
    setAdminPasswordInput: (input: string) => void;
    handleAdminUnlock: () => void;
    isAdminUnlocked: boolean;
    setIsAdminUnlocked?: (unlocked: boolean) => void;

    showNutritionalPrescription: boolean;
    setShowNutritionalPrescription: (show: boolean) => void;
    showDataEditor: boolean;
    setShowDataEditor: (show: boolean) => void;
    showHistoryAnalysisModal: boolean;
    setShowHistoryAnalysisModal: (show: boolean) => void;
    showZenMode: boolean;
    setShowZenMode: (show: boolean) => void;
    showSecretPoint: boolean;
    setShowSecretPoint: (show: boolean) => void;

    adminMemo: string;
    setAdminMemo: React.Dispatch<React.SetStateAction<string>>;
    medicalNotes: string;
    setMedicalNotes: (notes: string) => void;

    history: any[];
    selectedStudentId: string | null;
    completedItems: string[];
    toggleCompleted: (id: string) => void;
    recommendedProducts: any[];
    evaluatedSecretPoints: any[];
    handleDataUpdate: (data: AssessmentResult) => void;

    setStep: (step: string) => void;
    setProtocol: (protocol: ProtocolData) => void;
    setIsCustomLoc: (isCustom: boolean) => void;
    initialProtocol: ProtocolData;

    logicConfig: any;
    handleLogicConfigChange: any;
    resetLogicConfig: any;
    productRecommendations: any;
    handleProductRecommendationsChange: any;
    resetProductRecommendations: any;
    predictionRules: any;
    handlePredictionRulesChange: any;
    resetPredictionRules: any;

    // New prop for sync studyEfficiencyResults
    studyEfficiencyResults: any;
    aiModels: any;
    handleAiModelsChange: any;
    currentUserRole?: any;
    onStartFollowUp?: (result: AssessmentResult) => void;
}
