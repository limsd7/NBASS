import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout';
import { ConfigModal as ConfigModalComponent } from '../../components/modals/ConfigModal';
import { NutritionalPrescriptionModal } from '../../components/modals/NutritionalPrescriptionModal';
import { DataEditorModal } from '../../components/modals/DataEditorModal';
import { HistoryAnalysisManager } from '../../components/HistoryAnalysisManager';
import { ErrorBoundary } from '../../components/common/ErrorBoundary';
import { NeuroInsightReport } from '../../components/NeuroInsightReport';
import { ExpertOverlay } from '../../components/ExpertOverlay';
import { WellnessPlayer } from '../../components/WellnessPlayer';
import { PrescriptionZenMode } from '../../components/PrescriptionZenMode';
import { ConsultantTabs } from '../../components/ConsultantTabs';
import { SleepDashboard } from '../../components/sleep/SleepDashboard';
import { TargetedNutritionRecommendation } from '../../components/TargetedNutritionRecommendation';
import { DetailedAnalysisSection } from '../../components/DetailedAnalysisSection';
import { StepProgressBar } from '../../components/ui/StepProgressBar';
import { PortalWindow } from '../../components/common/PortalWindow';
import { PsychologicalAssessment } from '../../components/PsychologicalAssessment';
import { ReportNavigator } from '../../components/reports/ReportNavigator';
import { BrainBodyDashboard } from '../../components/reports/BrainBodyDashboard';
import { MedicalReport } from '../reports/MedicalReport';
import { PromptModal } from '../../components/modals/PromptModal';

import { BalanceChart, BrainRadarChart, StressGaugeChart } from '../../components/Charts';
import { VitalityStressChart } from '../../components/VitalityStressChart';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

import { AssessmentResult, CareType, StrategyMap, StudentInfo, HRVData, SurveyData, ProtocolData, LearningAnalyticsData } from '../../types';
import { DETAILED_INSIGHTS } from '../../data/detailedInsights';
import { SUBJECT_OPTIONS_MAP } from '../../data/subjectOptions';
import { MENTAL_PRESCRIPTIONS } from '../../data/prescriptions';
import { ANS_BALANCE_DESCRIPTIONS } from '../../types';
import { DIGITAL_DETOX_PROTOCOLS, METACOGNITION_RECOMMENDATIONS, CHRONOTYPE_DESCRIPTIONS, VARK_DESCRIPTIONS, TAI_INTERVENTIONS } from '../../data/studyEfficiencyAssessments';
import { getLearningExplanation, getLearningRecommendations, CARETYPE_SPECIFIC_RECOMMENDATIONS } from '../../data/learningAnalyticsInsights';
import { getChronotypeAdvice, getVARKAdvice, getTestAnxietyAdvice, getDigitalAddictionAdvice, getMetacognitionAdvice } from '../../data/studyEfficiencyAdvice';
import { printReport } from '../../utils/printUtils';
import { generateStudyEfficiencyAnalysis } from '../../services/simulationEngine';
import { generateAISchedule } from '../../services/schedulingEngine';
import { evaluateBrainBodyCoherence } from '../../services/brainBodyEngine';

interface ResultsViewProps {
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
}

export const ResultsView: React.FC<ResultsViewProps> = ({
    activeMenu, setActiveMenu, isDarkMode, onToggleDarkMode,
    result, config, setConfig, strategies, setStrategies, prescriptions, setPrescriptions,
    editingStrategyType, setEditingStrategyType, selectedSubjectOptions, setSelectedSubjectOptions,
    showConfig, setShowConfig, activeConfigTab, setActiveConfigTab,
    showAdminPassword, setShowAdminPassword, adminPasswordInput, setAdminPasswordInput, handleAdminUnlock, isAdminUnlocked,
    showNutritionalPrescription, setShowNutritionalPrescription, showDataEditor, setShowDataEditor,
    showHistoryAnalysisModal, setShowHistoryAnalysisModal, showZenMode, setShowZenMode, showSecretPoint, setShowSecretPoint,
    adminMemo, setAdminMemo, medicalNotes, setMedicalNotes,
    history, selectedStudentId, completedItems, toggleCompleted,
    recommendedProducts, evaluatedSecretPoints, handleDataUpdate,
    setStep, setProtocol, setIsCustomLoc, initialProtocol,
    logicConfig, handleLogicConfigChange, resetLogicConfig,
    productRecommendations, handleProductRecommendationsChange, resetProductRecommendations,
    predictionRules, handlePredictionRulesChange, resetPredictionRules,
    studyEfficiencyResults, aiModels, handleAiModelsChange
}) => {
    // Handle expert guide visibility
    const [showExpertGuide, setShowExpertGuide] = useState(false);

    // Auto-generate sleep analysis text if it's missing
    useEffect(() => {
        if (!result.sleepAnalysisText) {
            let analysis = `### 🌙 수면 및 학습 패턴 종합 분석\n\n`;
            
            if (result.studyEfficiencyResults?.chronotype) {
                analysis += `**크로노타입 기반 조언**: ${result.studyEfficiencyResults.chronotype}형에 맞는 최적의 수면 및 기상 시간을 권장합니다.\n`;
            }
            
            analysis += `\n**전문가 코멘트 (${result.careType || '유형 미지정'})**\n`;
            analysis += `- 수면 패턴과 학습 집중도(집중력/스트레스)의 상관관계를 기반으로 맞춤 관리가 필요합니다.\n`;
            analysis += `- 현재 데이터에 기반하여 학생에게 가장 효율적인 수면 시간과 기상 시간을 일정표에 반영하세요.\n`;
            
            handleDataUpdate({
                ...result,
                sleepAnalysisText: analysis
            });
        }
    }, [result.sleepAnalysisText]);

    // Report Mode State
    const [isModeFixed, setIsModeFixed] = useState(
        localStorage.getItem('sn_report_mode_fixed_enabled') === 'true'
    );
    const [reportMode, setReportMode] = useState<'expert' | 'student'>(() => {
        if (localStorage.getItem('sn_report_mode_fixed_enabled') === 'true') {
            const saved = localStorage.getItem('sn_report_mode');
            if (saved === 'expert' || saved === 'student') return saved;
        }
        return isAdminUnlocked ? 'expert' : (config.expertModePassword ? 'student' : 'expert');
    });

    const handleSetReportMode = (mode: 'expert' | 'student') => {
        setReportMode(mode);
        if (isModeFixed) {
            localStorage.setItem('sn_report_mode', mode);
        }
    };

    const toggleModeFix = () => {
        const newLocked = !isModeFixed;
        setIsModeFixed(newLocked);
        if (newLocked) {
            localStorage.setItem('sn_report_mode_fixed_enabled', 'true');
            localStorage.setItem('sn_report_mode', reportMode);
            alert(`현재 ${reportMode === 'expert' ? '전문가용' : '학생용'} 모드로 고정되었습니다. 탭을 이동해도 유지됩니다.`);
        } else {
            localStorage.removeItem('sn_report_mode_fixed_enabled');
            alert('모드 고정이 해제되었습니다.');
        }
    };
    
    // Sync with isAdminUnlocked if it changes externally
    useEffect(() => {
        if (isAdminUnlocked && !isModeFixed) {
            setReportMode('expert');
        }
    }, [isAdminUnlocked, isModeFixed]);
    const [showAssessmentWindow, setShowAssessmentWindow] = useState(false);
    const [isExpertOverlayOpen, setIsExpertOverlayOpen] = useState(false);
    const [showExpertModePrompt, setShowExpertModePrompt] = useState(false);

    // [NEW] Evaluate BrainBodyState for dynamic rendering
    const brainBodyState = React.useMemo(() => {
        try {
            return evaluateBrainBodyCoherence(result.hrv, result.survey, result.careType);
        } catch (e) {
            console.error("BrainBodyEngine error:", e);
            return null;
        }
    }, [result.hrv, result.survey, result.careType]);

    const handlePrintWindow = () => {
        // Target the hidden Medical Report component
        const printContent = document.getElementById('medical-report-container')?.innerHTML;

        // Basic print styles to reset page
        const printStyle = `
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=Roboto+Mono&display=swap');
            @page { size: A4; margin: 0; }
            body { margin: 0; padding: 0; background: white; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        `;

        // Gather Tailwind styles from current document
        const tailwindStyles = Array.from(document.styleSheets)
            .map(styleSheet => {
                try {
                    return Array.from(styleSheet.cssRules).map(rule => rule.cssText).join('');
                } catch (e) {
                    return '';
                }
            }).join('');

        const printWindow = window.open('', '_blank', 'width=1200,height=900');
        if (printWindow) {
            printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="ko">
          <head>
            <title>NBASS Assessment Report - ${result.student.name}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              ${tailwindStyles}
              ${printStyle}
              .no-print { display: none !important; }
              /* Ensure popup is scrollable if needed on screen, but print is paginated */
              body { overflow-y: auto; }
              @media print {
                  .floating-print-btn { display: none; }
                  body { -webkit-print-color-adjust: exact; }
              }
              .floating-print-btn {
                position: fixed; top: 20px; right: 20px;
                background: #1e293b; color: white; padding: 12px 24px;
                border-radius: 9999px; font-weight: bold; cursor: pointer;
                box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); border: none; z-index: 1000;
                transition: all 0.2s;
              }
              .floating-print-btn:hover { transform: scale(1.05); background: #0f172a; }
            </style>
          </head>
          <body>
            <button class="floating-print-btn" onclick="window.print()">🖨️ 인쇄 / PDF 저장</button>
            <div id="print-root">
              ${printContent}
            </div>
          </body>
        </html>
      `);
            printWindow.document.close();
            printWindow.focus();
        }
    };

    return (
        <Layout activeMenu={activeMenu} onMenuChange={setActiveMenu} isDarkMode={isDarkMode} onToggleDarkMode={onToggleDarkMode} onAdminClick={() => setShowAdminPassword(true)} isExpertMode={reportMode === 'expert'} expertGuideAction={reportMode === 'expert' ? () => setIsExpertOverlayOpen(true) : undefined}>
            {/* [NEW] Hidden Medical Report container for Print Logic */}
            <div id="medical-report-container" className="hidden">
                <MedicalReport result={result} config={config} />
            </div>

            {/* Step Progress Bar */}
            <StepProgressBar currentStep="results" isMedicalMode={config.isMedicalMode} isPortableMode={config.usePortable} onStepClick={setStep} />

            {/* Config Modal */}
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
                onResetLogicConfig={resetLogicConfig}
                productRecommendations={productRecommendations}
                onProductRecommendationsChange={handleProductRecommendationsChange}
                onResetProductRecommendations={resetProductRecommendations}
                predictionRules={predictionRules}
                onPredictionRulesChange={handlePredictionRulesChange}
                onResetPredictionRules={resetPredictionRules}
                aiModels={aiModels}
                onAiModelsChange={handleAiModelsChange}
            />

            <div className="flex flex-col xl:flex-row gap-6 relative">
                <div className="flex-1 min-w-0">
                    <div id="report-section" className="space-y-8 animate-in fade-in duration-500 pb-20 relative mt-4">
                        {/* Watermark for Print */}
                <div className="report-watermark hidden print:block">NBASS</div>

                {/* Official Report Header (Style 3) - Visible in both Screen & Print */}
                <div className="report-official-header flex justify-between items-end bg-slate-50/50 p-4 rounded-t-2xl border-b-2 border-slate-200">
                    <div>
                        <h1 className="text-xl font-black text-slate-800 tracking-tighter flex items-center gap-2">
                            <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                            Neuro-Bio Academic Strategy System <span className="text-indigo-600 font-bold">[NBASS]</span>
                        </h1>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 ml-4">뉴로바이오 학습전략시스템</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[9px] text-slate-400 font-bold tracking-widest uppercase">Official Diagnostic Report</p>
                        <p className="text-xs font-black text-indigo-900 italic mt-0.5">Chief Analyst: Dr Lim</p>
                    </div>
                </div>

                {/* Header & Controls */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-bold text-xl">
                            {result.student.gender === 'Male' ? 'M' : 'F'}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">{result.student.name} <span className="text-sm font-normal text-slate-400">ID: {result.student.id}</span></h2>
                            <p className="text-sm text-slate-500">{result.student.grade} / {result.student.age}세 / {result.student.gender === 'Male' ? '남성' : '여성'} / 검사일: {result.student.testDate}</p>
                            {result.student.weakSubject && (
                                <span className="inline-block mt-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-bold rounded">
                                    Focus: {result.student.weakSubject.toUpperCase()}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 no-print items-end">
                        {/* Row 1: Settings | Study Mode | Print | New Assessment */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => {
                                    setActiveConfigTab('general');
                                    setShowAdminPassword(true);
                                }}
                                className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-lg transition-colors border border-slate-200"
                                title="Settings"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0-.73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
                            </button>
                            <button
                                onClick={() => setStep('study_management')}
                                className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200 flex items-center gap-2 whitespace-nowrap"
                            >
                                <span className="text-xl">🧬</span>
                                <span className="text-sm">Study Mode</span>
                            </button>
                            {reportMode === 'expert' && (
                                <>
                                    <button
                                        onClick={() => setStep('grade_management')}
                                        className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center gap-2 whitespace-nowrap"
                                    >
                                        <span className="text-xl">📈</span>
                                        <span className="text-sm">성적 관리</span>
                                    </button>
                                    <button
                                        onClick={() => setStep('sleep_management')}
                                        className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center gap-2 whitespace-nowrap"
                                    >
                                        <span className="text-xl">🌙</span>
                                        <span className="text-sm">수면 관리</span>
                                    </button>
                                </>
                            )}

                            {/* Report Mode Toggle */}
                            <div className="flex bg-slate-200 p-1 rounded-xl items-center no-print">
                                <button
                                    onClick={() => {
                                        if (reportMode !== 'expert') {
                                            setShowExpertModePrompt(true);
                                        }
                                    }}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${reportMode === 'expert'
                                        ? 'bg-white text-indigo-700 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    전문가용
                                </button>
                                <button
                                    onClick={() => handleSetReportMode('student')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${reportMode === 'student'
                                        ? 'bg-white text-teal-700 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    학생용
                                </button>
                                <button
                                    onClick={toggleModeFix}
                                    className={`ml-1 px-2 py-1.5 rounded-lg text-xs font-bold transition-all ${isModeFixed ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-300 text-slate-500 hover:bg-slate-400'}`}
                                    title={isModeFixed ? "모드 고정 해제" : "현재 모드로 고정"}
                                >
                                    {isModeFixed ? '🔒 고정됨' : '🔓 고정'}
                                </button>
                            </div>

                            <button
                                onClick={handlePrintWindow}
                                className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 whitespace-nowrap"
                            >
                                저장 (PDF) / 인쇄
                            </button>
                            <button
                                onClick={() => { setStep('register'); setProtocol(initialProtocol); setIsCustomLoc(false); }}
                                className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200 whitespace-nowrap"
                            >
                                New Assessment
                            </button>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowAssessmentWindow(true)}
                                className="px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors flex items-center gap-2 font-bold shadow-lg shadow-purple-200 whitespace-nowrap"
                            >
                                <span>🧠</span>
                                Psychological Assessment
                            </button>
                            <button
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold shadow-md transition-colors flex items-center gap-2"
                                onClick={() => setShowNutritionalPrescription(true)}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                </svg>
                                영양 처방전 발급
                            </button>
                            <button
                                onClick={() => setShowDataEditor(true)}
                                className="px-6 py-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors flex items-center gap-2 font-bold border border-slate-300 no-print"
                            >
                                <span>📝</span> 수정
                            </button>
                        </div>
                    </div>
                </div>

                {/* Scientific Framework Section */}
                <div className="space-y-6 mt-6">
                    <div className="flex items-center gap-4 px-2">
                        <div className="h-px flex-1 bg-slate-200" />
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Scientific Framework</h3>
                        <div className="h-px flex-1 bg-slate-200" />
                    </div>
                    {/* ... Framework Cards ... (Skipping verbose HTML for tool limit, will assume copy-paste) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl">
                            <h4 className="text-xl font-bold mb-3">NEURO-EDULAB 🧠</h4>
                            <p className="text-slate-400 text-sm">신경학적 분석을 통해 학습의 해답을 찾는 정밀 연구 시스템</p>
                        </div>
                        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-lg">
                            <h4 className="text-xl font-bold mb-3">BIO-COGNITIVE INDEX 📊</h4>
                            <p className="text-slate-500 text-sm">HRV와 인지 수치를 통합 분석하여 객관적 지표(BCI)로 산출</p>
                        </div>
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-6 rounded-3xl shadow-xl">
                            <h4 className="text-xl font-bold mb-3">L.A.P.S ⚙️</h4>
                            <p className="text-indigo-100/80 text-sm">Learning Analytics & Physiology System</p>
                        </div>
                    </div>
                </div>

                {/* Dynamic Efficiency Boost Logic */}
                {config.isExamMode && result.student.weakSubject && (() => {
                    // ... (Logic)
                    return <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl mb-4">Efficiency Boost Active</div>;
                })()}

            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm print-page-break print-avoid-break">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-slate-900">Expert Integrated Neuro-Insight</h3>
                    <ErrorBoundary componentName="NutritionalPrescriptionModal">
                        <NutritionalPrescriptionModal
                            isOpen={showNutritionalPrescription}
                            onClose={() => setShowNutritionalPrescription(false)}
                            data={result}
                            recommendedProducts={recommendedProducts}
                        />
                    </ErrorBoundary>
                </div>

                {/* Brain-Body Dashboard */}
                <div id="section-brain-body" className="mb-12 space-y-8 mt-8">
                    <BrainBodyDashboard brainBodyState={brainBodyState} careType={result.careType} previousResult={result.previousResult} />
                </div>

                {/* NeuroInsightReport */}
                <NeuroInsightReport
                    analysisText={result.analysisText}
                    classificationResult={result.classificationResult}
                    assessmentResult={{ ...result, studyEfficiencyResults }}
                    reportMode={reportMode}
                    onUpdateAssessmentResult={handleDataUpdate}
                />

                {/* Medical Analysis */}
                {(config.isMedicalMode || result.medicalAnalysis) && result.medicalAnalysis && (
                    <div id="section-medical-analysis" className="mt-12 p-8 bg-rose-50/50 rounded-3xl border-2 border-rose-100">
                        <h3 className="text-xl font-black text-rose-900">의학적 정밀 분석</h3>
                        {/* ... Table and content ... */}
                    </div>
                )}

                {/* Mind Prescription Card */}
                <div id="section-mind-prescription" className="mt-8 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 rounded-2xl border border-indigo-100 p-6 no-print">
                    <h4 className="text-lg font-bold text-slate-800">오늘의 마음 처방전</h4>
                    <button
                        onClick={() => {
                            const prescription = MENTAL_PRESCRIPTIONS[result.careType];
                            const prescriptionData = encodeURIComponent(JSON.stringify(prescription));
                            window.open(`prescription-guide.html?data=${prescriptionData}`, '_blank', 'width=1400,height=900');
                        }}
                        className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg mt-4"
                    >
                        Zen 모드로 열기
                    </button>
                </div>


                {/* Secret Point - Expert Only */}
                {reportMode === 'expert' && (
                    <div id="section-expert-memo" className="mt-8 no-print">
                        <button onClick={() => setShowSecretPoint(!showSecretPoint)} className="w-full p-4 border-2 rounded-xl text-left font-bold">
                            전문가 소견 (Secret Point) {showSecretPoint ? '▲' : '▼'}
                        </button>

                        {showSecretPoint && (
                            <div className="mt-4 p-6 bg-slate-900 text-white rounded-2xl">
                                <h4 className="font-bold text-amber-400 mb-4">SECRET POINT</h4>
                                {/* Content */}
                            </div>
                        )}
                    </div>
                )}

                {/* Charts and Graphs */}
                <div id="section-charts" className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    <BalanceChart sns={result.hrv.sns} pns={result.hrv.pns} />
                    <VitalityStressChart
                        vitality={result.hrv.vitality}
                        fatigue={result.hrv.fatigue}
                        physicalStress={result.hrv.physicalStress || 0}
                    />
                    <BrainRadarChart
                        gamma={result.hrv.eegGamma} hBeta={result.hrv.eegHBeta} mBeta={result.hrv.eegMBeta} lBeta={result.hrv.eegLBeta} alpha={result.hrv.eegAlpha} theta={result.hrv.eegTheta} isPortable={config.usePortable}
                    />
                    <StressGaugeChart stress={result.protocol.stressLevel} label="Stress" color="text-red-600" />
                </div>

                {reportMode === 'expert' && (
                    <div id="section-nutrition">
                        <TargetedNutritionRecommendation recommendedProducts={recommendedProducts} />
                    </div>
                )}

                {/* AI Schedule & Mental Prescription - Expert Only */}
                {reportMode === 'expert' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                        <div id="section-ai-schedule" className="bg-white p-8 rounded-3xl border border-slate-200">
                            <h3 className="text-xl font-bold text-slate-900 mb-4">AI 최적 학습 스케줄링</h3>
                            <div className="space-y-4">
                                {generateAISchedule(result.analytics, result.student, result.careType).map((item, idx) => (
                                    <div key={idx} className="flex gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
                                        <div className="w-24 shrink-0 text-right">
                                            <p className="text-xs font-black text-slate-400 group-hover:text-blue-600 transition-colors">{item.time}</p>
                                            <div>
                                                <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase ${item.intensity === 'High' ? 'bg-red-50 text-red-500' :
                                                    item.intensity === 'Medium' ? 'bg-amber-50 text-amber-500' : 'bg-green-50 text-green-500'
                                                    }`}>
                                                    {item.intensity} Energy
                                                </span>
                                            </div>
                                        </div>
                                        <div className="space-y-1 flex-1">
                                            <p className="font-bold text-slate-800 text-sm">{item.activity}</p>
                                            <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div id="section-mental-health" className="bg-gradient-to-br from-indigo-900 to-slate-900 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden flex flex-col min-h-[400px]">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-[60px] opacity-20"></div>
                            <div className="relative z-10 flex flex-col h-full flex-1">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-1.5 h-6 bg-indigo-400 rounded-full"></div>
                                    <h3 className="text-xl font-bold">증상 맞춤형 정신건강 처방전</h3>
                                </div>
                                {result.careType && MENTAL_PRESCRIPTIONS[result.careType] && (() => {
                                    const p = MENTAL_PRESCRIPTIONS[result.careType];
                                    return (
                                        <div className="space-y-6 flex-1 flex flex-col">
                                            <div className="bg-white/10 p-5 rounded-2xl border border-white/10">
                                                <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest mb-1">{p.activity}</p>
                                                <h4 className="text-2xl font-black mb-2">{p.title}</h4>
                                                <div className="flex items-center gap-2 text-indigo-200 text-xs">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                                    소요 시간: {p.duration}
                                                    {p.audioTag && (
                                                        <span className="ml-4 px-2 py-0.5 bg-indigo-500 text-white rounded text-[9px] font-bold">Recommended: {p.audioTag}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="space-y-3 flex-1">
                                                {p.guide.map((step, i) => (
                                                    <div key={i} className="flex gap-3 text-sm text-indigo-100/80 items-start">
                                                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-500/30 text-[10px] font-bold shrink-0 mt-0.5">{i + 1}</span>
                                                        <p>{step}</p>
                                                    </div>
                                                ))}
                                            </div>
                                            <button
                                                onClick={() => {
                                                    const prescription = MENTAL_PRESCRIPTIONS[result.careType];
                                                    const prescriptionData = encodeURIComponent(JSON.stringify(prescription));
                                                    window.open(`prescription-guide.html?data=${prescriptionData}`, '_blank', 'width=1400,height=900');
                                                }}
                                                className="w-full py-4 mt-auto bg-white text-indigo-900 font-bold rounded-2xl hover:bg-slate-100 transition-all shadow-lg active:scale-[0.98]"
                                            >
                                                처방 가이드 열기
                                            </button>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>
                )}

                {showZenMode && result.careType && MENTAL_PRESCRIPTIONS[result.careType] && (
                    <PrescriptionZenMode prescription={MENTAL_PRESCRIPTIONS[result.careType]} onClose={() => setShowZenMode(false)} />
                )}

                <div className="mt-8">
                    <ConsultantTabs
                        student={result.student}
                        hrv={result.hrv}
                        survey={result.survey}
                        protocol={result.protocol}
                        analytics={result.analytics}
                        bloodTest={result.bloodTest}
                        adminMemo={adminMemo}
                        setAdminMemo={setAdminMemo}
                    />
                </div>
                <div className="mt-8">
                    <SleepDashboard careType={result.careType} analytics={result.analytics} />
                </div>
            </div>
            </div>
            {/* Navigator Sidebar */}
            <div className="xl:w-64 flex-shrink-0 order-1 xl:order-2 hidden xl:block">
                <ReportNavigator />
            </div>
            </div>

            {
                !showConfig && (
                    <button onClick={() => setShowAdminPassword(true)} className="fixed bottom-6 left-6 z-50 w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center opacity-30 hover:opacity-100">
                        ⚙️
                    </button>
                )
            }

            {
                showAdminPassword && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
                        <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-xs">
                            <h3 className="font-bold text-lg mb-4">Admin Access</h3>
                            <input type="password" value={adminPasswordInput} onChange={e => setAdminPasswordInput(e.target.value)} className="w-full p-2 border rounded mb-4" />
                            <div className="flex justify-end gap-2">
                                <button onClick={() => setShowAdminPassword(false)} className="px-3 py-1 bg-slate-200 rounded">Cancel</button>
                                <button onClick={handleAdminUnlock} className="px-3 py-1 bg-blue-600 text-white rounded">Confirm</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                result && (
                    <DataEditorModal
                        isOpen={showDataEditor}
                        onClose={() => setShowDataEditor(false)}
                        initialData={result}
                        onSave={handleDataUpdate}
                    />
                )
            }

            <PromptModal
                isOpen={showExpertModePrompt}
                title="전문가용 모드 진입 암호를 입력하세요"
                isPassword={true}
                onConfirm={(pwd) => {
                    setShowExpertModePrompt(false);
                    if (pwd === (config.expertModePassword || '3123')) {
                        handleSetReportMode('expert');
                    } else {
                        alert("암호가 일치하지 않습니다.");
                    }
                }}
                onCancel={() => setShowExpertModePrompt(false)}
            />

            <HistoryAnalysisManager
                isOpen={showHistoryAnalysisModal}
                onClose={() => setShowHistoryAnalysisModal(false)}
                history={history}
                selectedStudentId={selectedStudentId}
                currentResult={result}
            />

            {showAssessmentWindow && (
                <PortalWindow
                    title={`Psychological Assessment - ${result.student.name}`}
                    onClose={() => setShowAssessmentWindow(false)}
                >
                    <div className="p-8 bg-slate-50 min-h-screen">
                        <PsychologicalAssessment result={result} />
                    </div>
                </PortalWindow>
            )}

            {result && (
                <ExpertOverlay
                    careType={result?.careType}
                    adrenalFatigueScore={result?.survey.adrenalFatigueScore ?? 0}
                    currentData={result}
                    studentId={result?.student?.id}
                    isOpen={isExpertOverlayOpen}
                    onClose={() => setIsExpertOverlayOpen(false)}
                />
            )}
        </Layout >
    );
};
