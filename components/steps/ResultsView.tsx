import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout';
import { ConfigModal as ConfigModalComponent } from '../../components/modals/ConfigModal';
import { NutritionalPrescriptionModal } from '../../components/modals/NutritionalPrescriptionModal';
import { DataEditorModal } from '../../components/modals/DataEditorModal';
import { HistoryAnalysisManager } from '../../components/HistoryAnalysisManager';
import { ErrorBoundary } from '../../components/common/ErrorBoundary';
import { NeuroInsightReport } from '../../components/NeuroInsightReport';
import { ExpertOverlay } from '../../components/ExpertOverlay';
import { ManualModal } from '../../components/modals/ManualModal';
import { WellnessPlayer } from '../../components/WellnessPlayer';
import { PrescriptionZenMode } from '../../components/PrescriptionZenMode';
import { ConsultantTabs } from '../../components/ConsultantTabs';
import { SleepDashboard } from '../../components/sleep/SleepDashboard';
import { TargetedNutritionRecommendation } from '../../components/TargetedNutritionRecommendation';
import { DetailedAnalysisSection } from '../../components/DetailedAnalysisSection';
import { AIAssistantPanel } from '../../components/common/AIAssistantPanel';
import { StepProgressBar } from '../../components/ui/StepProgressBar';
import { PortalWindow } from '../../components/common/PortalWindow';
import { PsychologicalAssessment } from '../../components/PsychologicalAssessment';
import { ReportNavigator } from '../../components/reports/ReportNavigator';
import { BrainBodyDashboard } from '../../components/reports/BrainBodyDashboard';
import { MedicalReport } from '../reports/MedicalReport';
import { PromptModal } from '../../components/modals/PromptModal';
import { SubscriptionModal } from '../modals/SubscriptionModal';
import { MembershipBadge } from '../ui/MembershipBadge';
import { MembershipTier } from '../../utils/featureGate';
import { UserTierService } from '../../services/userTierService';
import { FreeSummaryTeaser } from './FreeSummaryTeaser';
import { mapSurveyDataToResults } from '../../services/studyEfficiencyService';

import { BalanceChart, StressGaugeChart, VitalityBarChart } from '../../components/Charts';
import { VitalityStressChart } from '../../components/VitalityStressChart';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ComposedChart, Bar, Area, CartesianGrid, Legend } from 'recharts';

import { unifiedSyncService as DatabaseService } from '../../services/unifiedSyncService';
import { AssessmentResult, CareType, StrategyMap, StudentInfo, HRVData, SurveyData, ProtocolData, LearningAnalyticsData, GradeRecord, GradeGoal } from '../../types';
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
import { analyzeMedicalData } from '../../services/medicalEngine';
import { isLearningAnalyticsTested } from '../../utils/constants';
import CircularSchedule from '../ui/CircularSchedule';
import { getSubjectCircadianPlan } from '../../services/chronobiologyEngine';
import { generateSleepPrescription } from '../../utils/sleepLogic';

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

export const ResultsView: React.FC<ResultsViewProps> = ({
    activeMenu, setActiveMenu, isDarkMode, onToggleDarkMode,
    result, config, setConfig, strategies, setStrategies, prescriptions, setPrescriptions,
    editingStrategyType, setEditingStrategyType, selectedSubjectOptions, setSelectedSubjectOptions,
    showConfig, setShowConfig, activeConfigTab, setActiveConfigTab,
    showAdminPassword, setShowAdminPassword, adminPasswordInput, setAdminPasswordInput, handleAdminUnlock, isAdminUnlocked, setIsAdminUnlocked,
    showNutritionalPrescription, setShowNutritionalPrescription, showDataEditor, setShowDataEditor,
    showHistoryAnalysisModal, setShowHistoryAnalysisModal, showZenMode, setShowZenMode, showSecretPoint, setShowSecretPoint,
    adminMemo, setAdminMemo, medicalNotes, setMedicalNotes,
    history, selectedStudentId, completedItems, toggleCompleted,
    recommendedProducts, evaluatedSecretPoints, handleDataUpdate,
    setStep, setProtocol, setIsCustomLoc, initialProtocol,
    logicConfig, handleLogicConfigChange, resetLogicConfig,
    productRecommendations, handleProductRecommendationsChange, resetProductRecommendations,
    predictionRules, handlePredictionRulesChange, resetPredictionRules,
    studyEfficiencyResults, aiModels, handleAiModelsChange,
    currentUserRole, onMenuChange, onHomeClick, onStartFollowUp
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

    const userTier: MembershipTier = UserTierService.getEffectiveTier(
        { id: result.student.id, name: result.student.name, email: result.student.email },
        (result.student.membershipTier as MembershipTier) || 'free',
        result.student.name,
        result.student.email
    );

    const isExpertUser = currentUserRole === 'MEDICAL_EXPERT' || currentUserRole === 'ACADEMY_EXPERT' || currentUserRole === 'EXPERT' || currentUserRole === 'OWNER' || localStorage.getItem('nbass_current_role') === 'MEDICAL_EXPERT' || localStorage.getItem('nbass_current_role') === 'ACADEMY_EXPERT' || localStorage.getItem('nbass_current_role') === 'EXPERT' || localStorage.getItem('nbass_current_role') === 'OWNER' || isAdminUnlocked;
    const isPaidUser = userTier === 'pro' || userTier === 'premium' || userTier === 'premium_plus' || userTier === 'vip' || userTier === 'expert' || isExpertUser || (result?.student?.membershipTier && result.student.membershipTier !== 'free');
    const isVipOrAbove = userTier === 'vip' || userTier === 'expert' || isExpertUser;

    const isPremiumOrAbove = userTier === 'premium' || userTier === 'premium_plus' || userTier === 'vip' || userTier === 'expert' || isExpertUser;

    const [showAssessmentWindow, setShowAssessmentWindow] = useState(false);
    const [isExpertOverlayOpen, setIsExpertOverlayOpen] = useState(false);
    const [showExpertModePrompt, setShowExpertModePrompt] = useState(false);
    const [showManualModal, setShowManualModal] = useState(false);
    const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
    const [subscriptionReason, setSubscriptionReason] = useState<string>('');

    // Dual View Mode: 'dashboard' (심층 분석 인터랙티브 대시보드 - 기본) vs 'comprehensive' (인쇄본 24P 전문 일치)
    const [viewMode, setViewMode] = useState<'comprehensive' | 'dashboard'>('dashboard');
    const [adminMemosList, setAdminMemosList] = useState<string[]>([
        "수면 불규칙으로 인한 피로 누적이 관찰됩니다.",
        "오전 카페인 섭취를 자제하고 수분 섭취를 늘리세요.",
        "가벼운 유산소 운동(걷기 30분)을 권장합니다.",
        "취침 전 스마트폰 사용을 줄여 뇌 휴식을 유도하세요.",
        "학습 중간에 4-7-8 호흡법으로 긴장을 완화하세요."
    ]);

    // 의학 분석 결과 자동 연산 (기존 결과 또는 혈액검사 입력치 기반)
    const effectiveMedicalAnalysis = React.useMemo(() => {
        if (result.medicalAnalysis) return result.medicalAnalysis;
        if (result.bloodTest) {
            try {
                return analyzeMedicalData(result.bloodTest, result.careType, result.student?.gender);
            } catch (e) {
                console.error("MedicalEngine analysis error:", e);
                return null;
            }
        }
        return null;
    }, [result.medicalAnalysis, result.bloodTest, result.careType, result.student?.gender]);

    // Grade Management Reverse Pipeline (성적 이력 로드)
    const [gradeRecords, setGradeRecords] = useState<GradeRecord[]>([]);
    const [gradeGoals, setGradeGoals] = useState<GradeGoal[]>([]);
    // 시험 시점별 실측 지표 매칭용 검사 이력 (HistoryRecord extends AssessmentResult)
    const [assessmentHistory, setAssessmentHistory] = useState<AssessmentResult[]>([]);

    useEffect(() => {
        if (result?.student?.id) {
            DatabaseService.getGradeRecords(result.student.id).then(records => {
                setGradeRecords(records);
                // [Fix] 직접 변이(mutate) 대신 handleDataUpdate로 불변 갱신
                if (records.length > 0 && !result.gradeHistory) {
                    handleDataUpdate({ ...result, gradeHistory: records });
                }
            }).catch(err => console.error('Failed to load grade records in ResultsView:', err));

            DatabaseService.getGradeGoals(result.student.id).then(goals => {
                setGradeGoals(goals);
            }).catch(err => console.error('Failed to load grade goals in ResultsView:', err));

            // [Fix] 선형 보간 추정 제거: 시험 시점 매칭에 사용할 실제 검사 이력 로드
            DatabaseService.getHistoryByStudent(result.student.id).then(history => {
                setAssessmentHistory((history || []) as AssessmentResult[]);
            }).catch(err => console.error('Failed to load assessment history in ResultsView:', err));
        }
    }, [result?.student?.id]);

    // [NEW] Evaluate BrainBodyState for dynamic rendering
    const brainBodyState = React.useMemo(() => {
        try {
            return evaluateBrainBodyCoherence(result.hrv, result.survey, result.careType, result.protocol, result.cognitiveResults);
        } catch (e) {
            console.error("BrainBodyEngine error:", e);
            return null;
        }
    }, [result.hrv, result.survey, result.careType, result.protocol, result.cognitiveResults]);

    // [NEW Phase 1-1] Grade × Bio-Cognitive Correlation Data Modeling
    // [Fix] 선형 보간 추정치(variation) 제거: 각 시험 시점에 실측 검사 이력을 매칭하여 사용
    const gradeCorrelationData = React.useMemo(() => {
        if (!gradeRecords || gradeRecords.length === 0) return [];
        const sorted = [...gradeRecords].sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime());

        // 검사 이력을 날짜 오름차순 정렬
        const sortedHistory = [...assessmentHistory]
            .filter(h => h?.date)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // 시험일 기준 실측 지표 매칭: 시험일 이전에 실시한 가장 최근 검사 사용
        const findMetricsForDate = (examDate: string) => {
            const examTime = new Date(examDate).getTime();
            const prior = sortedHistory.filter(h => new Date(h.date).getTime() <= examTime);
            if (prior.length > 0) {
                const m = prior[prior.length - 1];
                return {
                    stress: m.hrv?.physicalStress,
                    focus: m.hrv?.concentrationLevel ?? m.analytics?.pureStudyRatio,
                    memory: m.workingMemoryResults?.overallScore,
                    measured: true, // 시험 시점에 실측된 검사 이력 기반
                };
            }
            // 시험 이전 검사 이력이 없으면 현재 진단 결과의 실측값으로 대체 (추정 표시)
            return {
                stress: result?.hrv?.physicalStress,
                focus: result?.hrv?.concentrationLevel ?? result?.analytics?.pureStudyRatio,
                memory: result?.workingMemoryResults?.overallScore,
                measured: false, // 현재 기준값으로의 추정
            };
        };

        return sorted.map((r) => {
            const validGrades = r.subjects.filter(s => s.grade !== undefined).map(s => s.grade as number);
            const avgGrade = validGrades.length > 0 ? parseFloat((validGrades.reduce((a, b) => a + b, 0) / validGrades.length).toFixed(1)) : 4.0;
            const weakSub = r.subjects.find(s => s.subjectId === result?.student?.weakSubject);
            const weakGrade = weakSub?.grade !== undefined ? weakSub.grade : avgGrade;

            const metrics = findMetricsForDate(r.examDate);
            const hrvIndex = Math.max(15, Math.min(95, Math.round(100 - (metrics.stress ?? 50))));
            const focusIndex = Math.max(15, Math.min(98, Math.round(metrics.focus ?? 70)));
            const memoryScore = Math.max(0, Math.min(100, Math.round(metrics.memory ?? 65)));

            return {
                examName: r.examName,
                examDate: r.examDate,
                avgGrade,
                weakGrade,
                hrvResistance: hrvIndex,
                focusCapacity: focusIndex,
                memoryScore,
                isMeasured: metrics.measured,
            };
        });
    }, [gradeRecords, assessmentHistory, result]);

    const handlePrintWindow = () => {
        // [변경] 인쇄/PDF 저장은 유료 전용이 아니라 '심층 분석 대시보드'를 인쇄물로 보는 기능 → Free 모드에서도 허용
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
            <title>NBASS 정밀 진단 보고서 : 등급표시 - ${result.student.name}</title>
            <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
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
        <Layout
            activeMenu={activeMenu}
            onMenuChange={onMenuChange || setActiveMenu}
            onHomeClick={onHomeClick}
            isDarkMode={isDarkMode}
            onToggleDarkMode={onToggleDarkMode}
            onAdminClick={() => setShowAdminPassword(true)}
            isExpertMode={isExpertUser || isPaidUser}
            expertGuideAction={isExpertUser ? () => setIsExpertOverlayOpen(true) : undefined}
            studentName={result.student.name}
            studentId={result.student.id}
            membershipTier={userTier}
        >
            {/* Step Progress Bar with Integrated Action Toolbar (Inside the SAME single container) */}
            <StepProgressBar
                currentStep="results"
                isMedicalMode={config.isMedicalMode}
                isPortableMode={config.usePortable}
                onStepClick={setStep}
                studentInfo={result.student ? {
                    grade: result.student.grade,
                    age: result.student.age,
                    gender: result.student.gender,
                    testDate: result.student.testDate,
                    weakSubject: result.student.weakSubject
                } : undefined}
                bottomContent={
                    <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2.5 no-print w-full py-0.5">
                        {(currentUserRole === 'OWNER' || localStorage.getItem('nbass_current_role') === 'OWNER' || isAdminUnlocked) && (
                            <button
                                onClick={() => {
                                    setActiveConfigTab('general');
                                    setShowConfig(true);
                                }}
                                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl transition-all shadow-sm border border-amber-500/30 flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                                title="⚙️ 시스템 및 알고리즘 환경설정 (오너/관리자 전용)"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0-.73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
                                <span>설정</span>
                            </button>
                        )}

                        {/* Study Mode */}
                        <button
                            onClick={() => {
                                if (userTier === 'free') {
                                    setSubscriptionReason('Study Mode (학습 관리 및 5대 심층 검사 - PRO 이상 전용)');
                                    setIsSubscriptionModalOpen(true);
                                    return;
                                }
                                setStep('study_management');
                            }}
                            className={`px-3 py-1.5 font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 whitespace-nowrap text-xs ${userTier === 'free'
                                ? 'bg-slate-800 text-slate-300 border border-slate-700'
                                : 'bg-slate-900 text-white hover:bg-slate-800'
                                }`}
                        >
                            <svg className="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            <span>{userTier === 'free' ? '🔒 Study Mode' : 'Study Mode'}</span>
                        </button>

                        {/* Mental Management (VIP Only) */}
                        <button
                            onClick={() => {
                                if (!isVipOrAbove) {
                                    setSubscriptionReason('1:1 맞춤형 수면관리 & 심층 멘탈관리 솔루션 (VIP 전용)');
                                    setIsSubscriptionModalOpen(true);
                                    return;
                                }
                                setShowZenMode(true);
                            }}
                            className={`px-3 py-1.5 font-bold text-xs rounded-xl transition-colors shadow-sm flex items-center gap-1.5 whitespace-nowrap ${!isVipOrAbove
                                ? 'bg-slate-800 text-purple-300 border border-purple-500/30 hover:bg-slate-700'
                                : 'bg-purple-600 hover:bg-purple-700 text-white'
                                }`}
                        >
                            <span>🧠</span>
                            <span>{!isVipOrAbove ? '🔒 멘탈 관리' : '멘탈 관리'}</span>
                        </button>

                        {/* Psychological Assessment */}
                        <button
                            onClick={() => {
                                if (userTier === 'free') {
                                    setSubscriptionReason('Psychological Assessment (심리 정밀 인지 평가 - PRO 이상)');
                                    setIsSubscriptionModalOpen(true);
                                    return;
                                }
                                setShowAssessmentWindow(true);
                            }}
                            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 font-bold text-xs shadow-sm whitespace-nowrap ${userTier === 'free'
                                ? 'bg-slate-800 text-purple-300 border border-purple-500/30'
                                : 'bg-purple-600 text-white hover:bg-purple-700 shadow-purple-200'
                                }`}
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            <span>{userTier === 'free' ? '🔒 심리 인지 평가' : '심리 인지 평가'}</span>
                        </button>

                        {/* Nutritional Prescription - Premium Tier Only */}
                        <button
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs shadow-sm transition-colors flex items-center gap-1.5 whitespace-nowrap ${!isPremiumOrAbove
                                ? 'bg-slate-800 text-emerald-300 border border-emerald-500/30 hover:bg-slate-700'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                }`}
                            onClick={() => {
                                if (!isPremiumOrAbove) {
                                    setSubscriptionReason('1:1 맞춤 영양 처방전 발급 (PREMIUM 전용)');
                                    setIsSubscriptionModalOpen(true);
                                    return;
                                }
                                setShowNutritionalPrescription(true);
                            }}
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                            <span>{!isPremiumOrAbove ? '🔒 영양 처방전 발급' : '영양 처방전 발급'}</span>
                        </button>

                        {/* Edit Data */}
                        <button
                            onClick={() => {
                                if (userTier === 'free') {
                                    setSubscriptionReason('검사 데이터 직접 수정 (PRO 이상 전용)');
                                    setIsSubscriptionModalOpen(true);
                                    return;
                                }
                                setShowDataEditor(true);
                            }}
                            className={`px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 font-bold text-xs border no-print whitespace-nowrap ${userTier === 'free'
                                ? 'bg-slate-100 text-slate-400 border-slate-200'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-300'
                                }`}
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            <span>{userTier === 'free' ? '🔒 수정' : '수정'}</span>
                        </button>

                        {/* Save PDF / Print */}
                        <button
                            onClick={() => {
                                if (userTier === 'free') {
                                    setSubscriptionReason('의학 정밀 리포트북 인쇄 및 PDF 저장 (PRO 이상 전용)');
                                    setIsSubscriptionModalOpen(true);
                                    return;
                                }
                                handlePrintWindow();
                            }}
                            className={`px-3 py-1.5 font-bold rounded-xl transition-all shadow-sm whitespace-nowrap text-xs flex items-center gap-1.5 ${userTier === 'free'
                                ? 'bg-slate-800 text-blue-300 border border-blue-500/30'
                                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
                                }`}
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                            <span>{userTier === 'free' ? '🔒 저장 / 인쇄' : '저장 / 인쇄'}</span>
                        </button>

                        {/* 2-Week Follow-up Assessment */}
                        <button
                            onClick={() => {
                                if (onStartFollowUp) {
                                    onStartFollowUp(result);
                                }
                            }}
                            className="px-3.5 py-1.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm shadow-emerald-500/20 flex items-center gap-1.5 whitespace-nowrap cursor-pointer active:scale-95 ring-2 ring-emerald-500/20"
                            title="비정상 항목만 3분 내 집중 재평가하는 2주 정기 추적 검사"
                        >
                            <span>⚡</span>
                            <span>2주 추적 검사 (3분)</span>
                        </button>

                        {/* New Assessment */}
                        <button
                            onClick={() => {
                                const isProUsed = userTier === 'pro' && !isExpertUser && UserTierService.isProAssessmentUsed(result.student, history);
                                if (isProUsed) {
                                    setSubscriptionReason('PRO 1회 스타터 패스(₩9,000) 검사가 이미 완료되었습니다. 새로운 정밀 진단 검사는 정기구독(PREMIUM 등)으로 업그레이드 후 이용 가능합니다.');
                                    setIsSubscriptionModalOpen(true);
                                    return;
                                }
                                setStep('register');
                                setProtocol(initialProtocol);
                                setIsCustomLoc(false);
                            }}
                            className="px-3 py-1.5 bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs rounded-xl hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors shadow-sm whitespace-nowrap cursor-pointer"
                        >
                            New Assessment
                        </button>

                        {/* Manual (매뉴얼) */}
                        <button
                            onClick={() => setShowManualModal(true)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-colors border border-slate-300 dark:border-slate-700 shadow-sm flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                            title="NBASS 시스템 사용 매뉴얼"
                        >
                            <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                            <span>매뉴얼</span>
                        </button>

                        {/* Expert Guide (학원 / 의료전문가 / 오너 전용) */}
                        {isExpertUser && (
                            <button
                                onClick={() => setIsExpertOverlayOpen(true)}
                                className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm shadow-indigo-500/20 flex items-center gap-1.5 whitespace-nowrap cursor-pointer active:scale-95"
                                title="전문가 가이드 열기"
                            >
                                <svg className="w-3.5 h-3.5 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                <span>Expert Guide</span>
                            </button>
                        )}
                    </div>
                }
            />

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

            {/* View Mode Switcher Toolbar */}
            <div className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm no-print mt-4">
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
                    <button
                        onClick={() => setViewMode('dashboard')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${viewMode === 'dashboard'
                            ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                    >
                        <span>📊</span>
                        <span>심층 분석 인터랙티브 대시보드</span>
                        <span className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 text-[10px] rounded font-bold">기본 보기</span>
                    </button>
                    {/* [변경] 인쇄본 보기는 유료 전용이 아니라 '심층 분석 대시보드'를 인쇄물 형태로 보는 기능 → Free 모드에서도 사용 가능 */}
                    <button
                        onClick={() => setViewMode('comprehensive')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${viewMode === 'comprehensive'
                            ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                    >
                        <span>📋</span>
                        <span>정밀 종합 리포트 (인쇄본 16P 전문)</span>
                        <span className="px-1.5 py-0.5 text-[10px] rounded font-bold bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300">
                            인쇄 일치
                        </span>
                    </button>
                </div>

                <div className="flex items-center justify-end gap-3 text-xs font-medium px-2">
                    <span className="text-slate-500">
                        현재 보기:{' '}
                        <strong className="text-slate-800 dark:text-slate-200">
                            {viewMode === 'comprehensive' ? '인쇄본 전체 열람 (16-Page 전문)' : '섹션별 인터랙티브 대시보드'}
                        </strong>
                    </span>
                    <button
                        onClick={() => handlePrintWindow()}
                        className="px-3.5 py-1.5 font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all cursor-pointer bg-blue-600 hover:bg-blue-700 text-white"
                        title="리포트북 출력 및 PDF 저장"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                        <span>인쇄 / PDF 저장</span>
                    </button>
                </div>
            </div>

            {viewMode === 'comprehensive' ? (
                /* Mode 1: Comprehensive 16-Page Medical Report (Direct On-Screen Viewing) */
                <div id="medical-report-container" className="w-full max-w-5xl mx-auto bg-white shadow-2xl rounded-3xl p-4 sm:p-10 border border-slate-200 text-slate-900 transition-all duration-300 pb-20">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 mb-8 border-b border-slate-200 gap-4 no-print">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-black rounded-full">
                                    📋 16-Page 정밀 진단 종합 리포트북
                                </span>
                                <span className="text-xs text-slate-500 font-bold">인쇄물 100% 동일 표시</span>
                            </div>
                            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                                {result.student.name} 학생 정밀 의학·신경인지 진단 보고서
                            </h2>
                            <p className="text-xs text-slate-500 mt-1">
                                인쇄(출력)물과 동일한 모든 16개 정밀 챕터(생체신호, 신경인지, 자율신경계, 학습효율, 인지작업기억, 시험전략, 임상소견, 영양처방, AI 코칭 로드맵)가 화면에 순차적으로 완벽히 렌더링됩니다.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                onClick={handlePrintWindow}
                                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                <span>인쇄 / PDF 저장</span>
                            </button>
                            <button
                                onClick={() => setViewMode('dashboard')}
                                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                            >
                                대시보드 뷰로 보기 →
                            </button>
                        </div>
                    </div>

                    <MedicalReport
                        result={{
                            ...result,
                            studyEfficiencyResults: studyEfficiencyResults || result.studyEfficiencyResults || (result.survey ? mapSurveyDataToResults(result.survey, (result as any).date || '') as any : undefined),
                            cognitiveResults: result.cognitiveResults,
                            gradeHistory: result.gradeHistory || gradeRecords
                        }}
                        config={config}
                        strategies={strategies}
                        selectedSubjectOptions={selectedSubjectOptions}
                        adminMemo={medicalNotes || adminMemo}
                        recommendedProducts={recommendedProducts}
                        isPremiumOrAbove={isPremiumOrAbove}
                        membershipTier={userTier}
                    />
                </div>
            ) : (
                /* Mode 2: Interactive In-Depth Dashboard View */
                <>
                    {/* Hidden Medical Report for handlePrintWindow when in dashboard view */}
                    <div id="medical-report-container" className="hidden">
                        <MedicalReport
                            result={{
                                ...result,
                                studyEfficiencyResults: studyEfficiencyResults || result.studyEfficiencyResults || (result.survey ? mapSurveyDataToResults(result.survey, (result as any).date || '') as any : undefined),
                                cognitiveResults: result.cognitiveResults,
                                gradeHistory: result.gradeHistory || gradeRecords
                            }}
                            config={config}
                            strategies={strategies}
                            selectedSubjectOptions={selectedSubjectOptions}
                            adminMemo={medicalNotes || adminMemo}
                            recommendedProducts={recommendedProducts}
                            isPremiumOrAbove={isPremiumOrAbove}
                            membershipTier={userTier}
                        />
                    </div>

                    <div className="flex flex-col xl:flex-row gap-6 relative">
                        <div className="flex-1 min-w-0">
                            <div id="report-section" className="space-y-8 animate-in fade-in duration-500 pb-20 relative">
                                {/* Watermark for Print */}
                                <div className="report-watermark hidden print:block">NBASS</div>

                                {/* Official Report Header (Style 3) - Visible in Screen & Print */}
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

                                {/* Student Info Header Card */}
                                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-bold text-xl">
                                            {result.student.gender === 'Male' ? 'M' : 'F'}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-slate-900">
                                                {result.student.name} <span className="text-sm font-normal text-slate-400">ID: {result.student.id}</span>
                                            </h2>
                                            <p className="text-sm text-slate-500">
                                                {result.student.grade} / {result.student.age}세 / {result.student.gender === 'Male' ? '남성' : '여성'} / 검사일: {result.student.testDate}
                                            </p>
                                            {result.student.weakSubject && (
                                                <span className="inline-block mt-1 px-2.5 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full">
                                                    취약 과목 Focus: {result.student.weakSubject.toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3 no-print">
                                        <span className="px-3.5 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl font-bold text-xs border border-indigo-100">
                                            CareType: <strong className="text-indigo-800">{result.careType || '표준'}</strong>
                                        </span>
                                        <span className="px-3.5 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-xs border border-emerald-100">
                                            Brain Score: <strong className="text-emerald-800">{result.hrv?.brainScore ?? 75}점</strong>
                                        </span>
                                    </div>
                                </div>

                                {/* Scientific Framework Section (Compact) */}
                                <div className="space-y-2.5 my-3">
                                    <div className="flex items-center gap-3 px-1">
                                        <div className="h-px flex-1 bg-slate-200" />
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Scientific Framework</h3>
                                        <div className="h-px flex-1 bg-slate-200" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div className="bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-sm border border-slate-800">
                                            <h4 className="text-xs font-bold text-white mb-1 flex items-center gap-1.5">
                                                <span>NEURO-EDULAB</span>
                                                <span className="text-xs">🧠</span>
                                            </h4>
                                            <p className="text-slate-400 text-[11px] leading-snug">신경학적 분석을 통해 학습의 해답을 찾는 정밀 연구 시스템</p>
                                        </div>
                                        <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl shadow-sm">
                                            <h4 className="text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                                                <span>BIO-COGNITIVE INDEX</span>
                                                <span className="text-xs">📊</span>
                                            </h4>
                                            <p className="text-slate-500 text-[11px] leading-snug">자율신경(교감·부교감)과 인지 수치를 통합 분석하여 객관적 지표(BCI)로 산출</p>
                                        </div>
                                        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white px-4 py-3 rounded-2xl shadow-sm">
                                            <h4 className="text-xs font-bold text-white mb-1 flex items-center gap-1.5">
                                                <span>L.A.P.S</span>
                                                <span className="text-xs">⚙️</span>
                                            </h4>
                                            <p className="text-indigo-100/90 text-[11px] leading-snug">Learning Analytics &amp; Physiology System</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Dynamic Efficiency Boost Logic */}
                                {config.isExamMode && result.student.weakSubject && (() => {
                                    let boostValue = 10;
                                    if (result.analytics?.goldenTimeStart) boostValue += 20;
                                    if ((result.hrv?.brainScore ?? 0) >= 80) boostValue += 10;
                                    if (result.hrv?.concentrationCategory === '높음') boostValue += 5;

                                    const isHigh = boostValue > 40;
                                    const isMid = boostValue >= 21 && boostValue <= 40;
                                    const tierName = isHigh ? "HIGH" : isMid ? "MID" : "LOW";
                                    const tierColor = isHigh ? "text-rose-500" : isMid ? "text-amber-500" : "text-blue-500";
                                    const tierBg = isHigh ? "bg-rose-50" : isMid ? "bg-amber-50" : "bg-blue-50";
                                    const tierBorder = isHigh ? "border-rose-200" : isMid ? "border-amber-200" : "border-blue-200";

                                    return (
                                        <div className={`${tierBg} border ${tierBorder} p-4 rounded-2xl flex items-center justify-between mb-4 animate-in fade-in slide-in-from-top-4 duration-500 no-print`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-12 h-12 rounded-full ${isHigh ? 'bg-rose-100' : isMid ? 'bg-amber-100' : 'bg-blue-100'} flex items-center justify-center text-2xl`}>
                                                    {isHigh ? '🚀' : isMid ? '⚡' : '🌱'}
                                                </div>
                                                <div>
                                                    <p className={`text-[10px] font-bold uppercase tracking-widest ${tierColor}`}>
                                                        {tierName} Efficiency Status
                                                    </p>
                                                    <p className={`text-sm font-medium ${isHigh ? 'text-rose-900' : isMid ? 'text-amber-900' : 'text-blue-900'}`}>
                                                        {isHigh ? (
                                                            <>현재 <b>초몰입 임계 단계</b>입니다. 고난도 과제 수행의 최적기입니다.</>
                                                        ) : isMid ? (
                                                            <>현재 <b>전략적 가속 단계</b>입니다. 학습 효율이 상승 중입니다.</>
                                                        ) : (
                                                            <>현재 <b>기초 최적화 단계</b>입니다. 루틴 정착에 집중하십시오.</>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="text-right relative group">
                                                <div className="cursor-help flex flex-col items-end">
                                                    <p className={`text-[10px] font-bold uppercase flex items-center gap-1 ${tierColor}`}>
                                                        Efficiency Boost
                                                        <span className={`w-3 h-3 rounded-full flex items-center justify-center text-[8px] border ${isHigh ? 'border-rose-300 text-rose-500' : isMid ? 'border-amber-300 text-amber-500' : 'border-blue-300 text-blue-500'}`}>?</span>
                                                    </p>
                                                    <p className={`text-2xl font-black ${tierColor}`}>+{boostValue}%</p>
                                                </div>

                                                {/* Consultant Secret Manual */}
                                                <div className="absolute right-0 top-full mt-3 w-[380px] p-6 bg-slate-900 text-white text-[11px] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-[60] border border-slate-700 no-print">
                                                    <div className="absolute top-[-6px] right-8 w-3 h-3 bg-slate-900 rotate-45 border-l border-t border-slate-700"></div>

                                                    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/10">
                                                        <span className="text-xl">🧠</span>
                                                        <p className="font-bold text-amber-400 text-sm uppercase tracking-tight">Consultant Master Guide</p>
                                                    </div>

                                                    <div className="space-y-3 mb-5">
                                                        <div className={`p-2 rounded-lg border ${!isHigh && !isMid ? 'bg-blue-500/30 border-blue-400' : 'bg-white/5 border-transparent opacity-40'}`}>
                                                            <p className="font-black text-blue-400 text-[10px]">LOW: 기초 최적화 (Base Level)</p>
                                                            <p className="text-slate-300 leading-tight">인지 기능 초기 단계. 루틴 형성에 집중.</p>
                                                        </div>
                                                        <div className={`p-2 rounded-lg border ${isMid ? 'bg-amber-500/30 border-amber-400' : 'bg-white/5 border-transparent opacity-40'}`}>
                                                            <p className="font-black text-amber-400 text-[10px]">MID: 전략적 가속 (Strategic Boost)</p>
                                                            <p className="text-slate-300 leading-tight">골든타임-취약과목 매칭 성공 상태.</p>
                                                        </div>
                                                        <div className={`p-2 rounded-lg border ${isHigh ? 'bg-rose-500/30 border-rose-400' : 'bg-white/5 border-transparent opacity-40'}`}>
                                                            <p className="font-black text-rose-400 text-[10px]">HIGH: 초몰입 임계 (Peak Performance)</p>
                                                            <p className="text-slate-300 leading-tight">심리·신체·환경의 완벽한 앙상블.</p>
                                                        </div>
                                                    </div>

                                                    <div className="bg-white/5 p-4 rounded-xl space-y-3 border border-white/10">
                                                        <p className="text-amber-300 font-bold border-b border-white/10 pb-1 underline decoration-amber-500/50">Efficiency Boost 심화 상세 매뉴얼</p>

                                                        <div>
                                                            <p className="text-slate-100 font-bold mb-1">1. 지표의 본질 (Core Definition)</p>
                                                            <p className="text-slate-400 leading-relaxed">
                                                                수험생의 생체 리듬 분석으로 도출된 <b>'골든타임(집중력 정점 시간)'</b>에 취약 과목을 배치했을 때 발생하는 추가적인 효율 상승분입니다.
                                                            </p>
                                                        </div>

                                                        <div>
                                                            <p className="text-slate-100 font-bold mb-1">2. 뇌 과학적 근거 (Scientific Rationale)</p>
                                                            <p className="text-slate-400 leading-relaxed">
                                                                에너지가 가장 충만한 시간에 고난도 과제를 수행함으로써, <b>에너지 소모는 줄이고 정보 처리 속도는 높이는 '학습 경제성'</b>의 원리를 따릅니다.
                                                            </p>
                                                        </div>

                                                        <div className="pt-2">
                                                            <p className="text-slate-100 font-bold mb-1 underline decoration-indigo-400">학부모 설득용 멘트 (Key Script)</p>
                                                            <p className="text-blue-200 italic leading-snug bg-blue-500/10 p-2 rounded">
                                                                "이 수치는 단순히 열심히 하는 것을 넘어, 뇌가 가장 잘 돌아갈 때 가장 무거운 공부를 함으로써 얻는 <b>'보너스 공부 시간'</b>입니다. 만약 +40%라면 매일 남들보다 2시간 이상의 시간을 벌고 있는 셈입니다."
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="mt-4 text-[10px] text-slate-500 text-right italic">
                                                        * 본 가이드는 관리자 전용이며 인쇄물에는 포함되지 않습니다.
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* Free User Summary Teaser */}
                                <FreeSummaryTeaser
                                    result={result}
                                    userTier={userTier}
                                    onUpgradeTier={(tier) => {
                                        handleDataUpdate({
                                            ...result,
                                            student: {
                                                ...result.student,
                                                membershipTier: tier
                                            }
                                        });
                                    }}
                                    onStartAdditionalTest={() => {
                                        setStep('study_efficiency');
                                    }}
                                />

                                {/* Selected Environment & Core Metrics Bar (Horizontal Single-Row, Low Height) */}
                                <div className="w-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl px-5 py-2.5 text-white shadow-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border border-slate-700/80">
                                    <div className="flex items-center gap-3 shrink-0">
                                        <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-base">
                                            🏠
                                        </div>
                                        <div>
                                            <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">Selected Environment</p>
                                            <h3 className="text-base font-black text-blue-400 leading-tight">{result.protocol.location || '집(Home)'}</h3>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1 md:max-w-3xl">
                                        <div className="bg-white/5 hover:bg-white/10 px-3.5 py-1.5 rounded-xl border border-white/10 flex items-center justify-between transition-colors">
                                            <span className="text-[10px] text-slate-400 uppercase font-bold whitespace-nowrap">Brain Score</span>
                                            <span className="text-xs font-black text-emerald-400 ml-2">{result.hrv?.brainScore ?? 75} pts</span>
                                        </div>
                                        <div className="bg-white/5 hover:bg-white/10 px-3.5 py-1.5 rounded-xl border border-white/10 flex items-center justify-between transition-colors">
                                            <span className="text-[10px] text-slate-400 uppercase font-bold whitespace-nowrap">Focus Index</span>
                                            <span className="text-xs font-black text-indigo-300 ml-2">
                                                {result.hrv?.concentrationLevel ? `${result.hrv.concentrationLevel * 10}점` : '75점'}
                                            </span>
                                        </div>
                                        <div className="bg-white/5 hover:bg-white/10 px-3.5 py-1.5 rounded-xl border border-white/10 flex items-center justify-between transition-colors">
                                            <span className="text-[10px] text-slate-400 uppercase font-bold whitespace-nowrap">Anxiety (BAI)</span>
                                            <span className="text-xs font-black text-amber-300 ml-2">{result.survey?.bai ?? 0} / 63</span>
                                        </div>
                                        <div className="bg-white/5 hover:bg-white/10 px-3.5 py-1.5 rounded-xl border border-white/10 flex items-center justify-between transition-colors">
                                            <span className="text-[10px] text-slate-400 uppercase font-bold whitespace-nowrap">Insomnia (ISI)</span>
                                            <span className="text-xs font-black text-purple-300 ml-2">{result.survey?.isi ?? 0} / 28</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                                            <h3 className="text-xl font-bold text-slate-900">Expert Integrated Neuro-Insight</h3>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-200">
                                                ✓ Verified by YES_YOU | Dr Lim's Choice
                                            </div>
                                            <ErrorBoundary componentName="NutritionalPrescriptionModal">
                                                <NutritionalPrescriptionModal
                                                    isOpen={showNutritionalPrescription}
                                                    onClose={() => setShowNutritionalPrescription(false)}
                                                    data={result}
                                                    recommendedProducts={recommendedProducts}
                                                />
                                            </ErrorBoundary>
                                        </div>
                                    </div>

                                    {/* Subject Strategy Card (Conditional) */}
                                    {config.isExamMode && result.student.weakSubject && (
                                        <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 p-6 rounded-2xl mb-6 shadow-sm">
                                            <h4 className="font-bold text-indigo-900 flex items-center gap-2 mb-4 text-base">
                                                <span className="text-xl">🎯</span>
                                                {result.student.weakSubject === 'korean' ? '국어' : result.student.weakSubject === 'math' ? '수학' : '영어'} 시간/멘탈 관리 공략
                                            </h4>

                                            <div className="space-y-4">
                                                {(() => {
                                                    const subj = result.student.weakSubject!;
                                                    const selectedIds = selectedSubjectOptions?.[subj] || [];
                                                    const options = (SUBJECT_OPTIONS_MAP[subj] || []).filter(o => selectedIds.includes(o.id));

                                                    if (options.length === 0) return <p className="text-xs text-slate-400">선택된 전략이 없습니다.</p>;

                                                    const categories = Array.from(new Set(options.map(o => o.category))).sort();

                                                    return categories.map(cat => (
                                                        <div key={cat} className="bg-white/70 p-4 rounded-xl border border-indigo-50">
                                                            <h5 className="font-bold text-indigo-600 text-xs mb-2 uppercase tracking-wide border-b border-indigo-100 pb-1">{cat}</h5>
                                                            <ul className="space-y-2">
                                                                {options.filter(o => o.category === cat).map(opt => (
                                                                    <li key={opt.id} className="flex gap-2.5 text-xs text-slate-700 leading-relaxed cursor-pointer group" onClick={() => toggleCompleted && toggleCompleted(opt.id)}>
                                                                        <div className={`mt-0.5 min-w-[16px] h-4 rounded border flex items-center justify-center transition-colors ${completedItems?.includes(opt.id) ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300 bg-white group-hover:border-indigo-400'}`}>
                                                                            {completedItems?.includes(opt.id) && <span className="text-white text-[10px]">✓</span>}
                                                                        </div>
                                                                        <div className={`${completedItems?.includes(opt.id) ? 'opacity-50 line-through decoration-slate-400' : ''}`}>
                                                                            <span className="font-bold text-slate-900 block mb-0.5">{opt.title}</span>
                                                                            <span className="text-slate-600">{opt.content}</span>
                                                                        </div>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    ));
                                                })()}
                                            </div>
                                        </div>
                                    )}

                                    {/* Brain-Body Dashboard */}
                                    <div id="section-brain-body" className="mb-6 space-y-6">
                                        <BrainBodyDashboard
                                            brainBodyState={brainBodyState}
                                            careType={result.careType}
                                            previousResult={result.previousResult}
                                            isExpertMode={isExpertUser || isPaidUser}
                                            studentName={result.student?.name}
                                            membershipTier={userTier}
                                        />
                                    </div>

                                    {/* NeuroInsightReport */}
                                    <NeuroInsightReport
                                        analysisText={result.analysisText}
                                        classificationResult={result.classificationResult}
                                        assessmentResult={{ ...result, studyEfficiencyResults }}
                                        onUpdateAssessmentResult={handleDataUpdate}
                                        onUpgradeClick={(tier, reason) => {
                                            setSubscriptionReason(reason);
                                            setIsSubscriptionModalOpen(true);
                                        }}
                                    />

                                    {/* DetailedAnalysisSection if text exists */}
                                    {result.analysisText && (
                                        <div className="mt-6">
                                            <DetailedAnalysisSection
                                                data={result}
                                                analysisText={result.analysisText}
                                                careType={result.careType}
                                                brainScore={result.hrv?.brainScore}
                                                onUpdateAnalysis={(text) => handleDataUpdate({ ...result, analysisText: text })}
                                            />
                                        </div>
                                    )}
                                </div>



                                {/* Mind Prescription Card - Pro or higher */}
                                {userTier === 'free' ? (
                                    <div id="section-mind-prescription" className="bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-white rounded-3xl border-2 border-indigo-500/40 p-6 md:p-8 relative overflow-hidden shadow-xl no-print">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="px-3 py-1 bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 rounded-full text-xs font-bold">
                                                        🔒 PRO 이상 전용
                                                    </span>
                                                    <h4 className="text-xl font-black">오늘의 마음 처방전 & Zen 케어</h4>
                                                </div>
                                                <p className="text-xs text-indigo-200 leading-relaxed max-w-xl">
                                                    심리 긴장 완화, 알파파 유도 사운드테라피 및 맞춤형 Zen 호흡/명상 가이드가 포함된 실시간 마음 처방전은 <b>Pro 이상 회원</b>에게 제공됩니다.
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setSubscriptionReason('오늘의 마음 처방전 & Zen 케어 (PRO 전용)');
                                                    setIsSubscriptionModalOpen(true);
                                                }}
                                                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold rounded-2xl shadow-lg transition-all transform hover:scale-105 shrink-0"
                                            >
                                                Pro 업그레이드 해제 (월 9,900원)
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div id="section-mind-prescription" className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50 rounded-2xl border border-indigo-100 p-6 no-print">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div>
                                                <h4 className="text-lg font-bold text-slate-800">오늘의 마음 처방전</h4>
                                                <p className="text-xs text-slate-500 mt-1">긴장 완화 및 심리 안정을 위한 1:1 맞춤형 Zen 처방전입니다.</p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    const prescription = MENTAL_PRESCRIPTIONS[result.careType];
                                                    const prescriptionData = encodeURIComponent(JSON.stringify(prescription));
                                                    window.open(`prescription-guide.html?data=${prescriptionData}`, '_blank', 'width=1400,height=900');
                                                }}
                                                className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shrink-0"
                                            >
                                                Zen 모드로 열기
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Learning Analytics Visual Dashboard */}
                                {isLearningAnalyticsTested(result.analytics) ? (
                                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 print-avoid-break">
                                        <div className="flex items-center justify-between mb-6">
                                            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                <span className="w-1 h-4 bg-indigo-500 rounded-full"></span>
                                                Learning Analytics Visual Dashboard
                                            </h4>
                                            <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-200/60">
                                                검사 완료
                                            </span>
                                        </div>
                                        <div className="space-y-6">
                                            {/* 1. Focus & Goals */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                                                    <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Focus Quality</p>
                                                    <div className="flex items-end gap-2">
                                                        <span className="text-3xl font-black text-indigo-600">{result.analytics?.pureStudyRatio ?? 0}%</span>
                                                        <span className="text-xs text-slate-400 mb-1">순공 집중 비율</span>
                                                    </div>
                                                    <div className="w-full h-2 bg-slate-100 rounded-full mt-3 overflow-hidden">
                                                        <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${result.analytics?.pureStudyRatio ?? 0}%` }}></div>
                                                    </div>
                                                </div>
                                                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                                                    <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Goal Achievement</p>
                                                    <div className="flex items-end gap-2">
                                                        <span className="text-3xl font-black text-emerald-600">{result.analytics?.goalAchievementRate ?? 0}%</span>
                                                        <span className="text-xs text-slate-400 mb-1">일일 목표 달성도</span>
                                                    </div>
                                                    <div className="w-full h-2 bg-slate-100 rounded-full mt-3 overflow-hidden">
                                                        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${result.analytics?.goalAchievementRate ?? 0}%` }}></div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 2. Chronotype & Location */}
                                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="font-bold text-slate-600">골든 타임 (Golden Time)</span>
                                                    <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full font-bold text-xs border border-amber-200/50">
                                                        {result.analytics?.goldenTimeStart || '19:00'} ~ {result.analytics?.goldenTimeEnd || '22:00'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm border-t border-slate-50 pt-3">
                                                    <span className="font-bold text-slate-600">선호 학습 공간</span>
                                                    <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full font-bold text-xs">
                                                        {result.analytics?.preferredLocation || result.protocol.location || '스터디카페'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm border-t border-slate-50 pt-3">
                                                    <span className="font-bold text-slate-600">연속 학습 일수 (Study Streak)</span>
                                                    <span className="flex items-center gap-1 font-bold text-orange-600">
                                                        🔥 {result.analytics?.studyStreak ?? 1} Days
                                                    </span>
                                                </div>
                                            </div>

                                            {/* 3. Subject Balance Mini Charts */}
                                            {result.analytics?.subjectRatios && Object.values(result.analytics.subjectRatios).some(v => Number(v) > 0) && (
                                                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">과목별 학습시간 배분율 (%)</p>
                                                        <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-200/60">
                                                            검사 실측치
                                                        </span>
                                                    </div>
                                                    <div className="flex items-end gap-3 h-28">
                                                        {Object.entries(result.analytics.subjectRatios).map(([key, val]) => {
                                                            const colors: Record<string, string> = {
                                                                korean: 'bg-rose-500', math: 'bg-blue-600', english: 'bg-emerald-500',
                                                                science: 'bg-violet-500', social: 'bg-amber-500', other: 'bg-slate-500'
                                                            };
                                                            const labels: Record<string, string> = {
                                                                korean: '국어', math: '수학', english: '영어',
                                                                science: '과탐', social: '사탐', other: '기타'
                                                            };
                                                            const displayVal = Number(val) || 0;
                                                            const barHeight = Math.max(displayVal * 0.9, 8);
                                                            return (
                                                                <div key={key} className="flex-1 flex flex-col items-center gap-2 group relative">
                                                                    <span className="text-[10px] font-black text-slate-700">{displayVal}%</span>
                                                                    <div
                                                                        className={`${colors[key] || 'bg-slate-400'} w-full rounded-lg transition-all duration-500 shadow-md group-hover:shadow-lg group-hover:scale-105`}
                                                                        style={{ height: `${barHeight}%`, minHeight: '12px' }}
                                                                    ></div>
                                                                    <div className="text-center">
                                                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">{key.slice(0, 3)}</span>
                                                                        <span className="text-[9px] text-slate-400 block">{labels[key]}</span>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                    <p className="text-[10px] text-slate-400 mt-3 text-right">
                                                        * 학습 밀도 검사 실측 데이터 기반 과목별 순공 투자 비율입니다. 취약 과목 보완 권장 비율과 비교하여 일일 계획을 최적화하세요.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    /* Learning Analytics Visual Dashboard - Untested State (Screen only, hidden in print) */
                                    <div className="bg-gradient-to-br from-slate-50 to-indigo-50/40 p-6 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 shadow-sm print-avoid-break no-print">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800 pb-4 mb-5">
                                            <div className="flex items-center gap-2.5">
                                                <span className="w-1.5 h-4 bg-slate-400 rounded-full"></span>
                                                <h4 className="text-sm font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">
                                                    Learning Analytics Visual Dashboard
                                                </h4>
                                            </div>
                                            <span className="px-2.5 py-1 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[11px] font-bold rounded-full">
                                                검사 미시행
                                            </span>
                                        </div>

                                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 py-2">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-black text-base">
                                                    <span className="text-xl">🔒</span>
                                                    <span>당일 학습 밀도 및 패턴 정밀 분석 검사가 미시행되었습니다.</span>
                                                </div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
                                                    착석 대비 실제 몰입도인 <strong>순공 집중 비율(Focus Quality)</strong>, <strong>일일 목표 달성도</strong>,
                                                    24시간 생체리듬 기반 <strong>골든 타임</strong> 및 <strong>연속 학습 일수</strong>를 측정하려면 학습 밀도 검사를 완료해 주세요.
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => setStep && setStep('analytics')}
                                                className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-black text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
                                            >
                                                <span>📝 학습 밀도 검사 시작하기</span>
                                                <span>→</span>
                                            </button>
                                        </div>

                                        {/* 과목별 권장 학습시간 배분율 (등록 우선순위 및 취약과목 기반 AI 맞춤 배분) */}
                                        {result.analytics?.subjectRatios && Object.values(result.analytics.subjectRatios).some(v => Number(v) > 0) && (
                                            <div className="mt-5 pt-5 border-t border-slate-200/80 dark:border-slate-800">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-black text-slate-700 dark:text-slate-200">
                                                            📊 과목별 권장 학습시간 배분율 (%)
                                                        </span>
                                                        <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-md border border-blue-200 dark:border-blue-800">
                                                            AI 맞춤 추천
                                                        </span>
                                                    </div>
                                                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                                        {result.student?.weakSubject
                                                            ? `등록 취약과목 [${result.student.weakSubject === 'math' ? '수학' : result.student.weakSubject === 'korean' ? '국어' : '영어'}] 집중 보완 모델 적용`
                                                            : '등록 우선순위 프로필 기반 최적 배분'}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
                                                    {/* 좌측: 과목별 배분 막대 그래프 */}
                                                    <div className="lg:col-span-5 bg-white dark:bg-slate-900/70 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
                                                        <div className="flex items-end gap-3 h-28 pt-2">
                                                            {Object.entries(result.analytics.subjectRatios).map(([key, val]) => {
                                                                const colors: Record<string, string> = {
                                                                    korean: 'bg-rose-500', math: 'bg-blue-600', english: 'bg-emerald-500',
                                                                    science: 'bg-violet-500', social: 'bg-amber-500', other: 'bg-slate-500'
                                                                };
                                                                const labels: Record<string, string> = {
                                                                    korean: '국어', math: '수학', english: '영어',
                                                                    science: '과탐', social: '사탐', other: '기타'
                                                                };
                                                                const displayVal = Number(val) || 0;
                                                                const barHeight = Math.max(displayVal * 0.9, 8);
                                                                return (
                                                                    <div key={key} className="flex-1 flex flex-col items-center gap-1.5 group relative">
                                                                        <span className="text-[11px] font-black text-slate-700 dark:text-slate-300">{displayVal}%</span>
                                                                        <div
                                                                            className={`${colors[key] || 'bg-slate-400'} w-full rounded-lg transition-all duration-500 shadow-sm group-hover:shadow-md group-hover:scale-105`}
                                                                            style={{ height: `${barHeight}%`, minHeight: '12px' }}
                                                                        ></div>
                                                                        <div className="text-center">
                                                                            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block uppercase">{key.slice(0, 3)}</span>
                                                                            <span className="text-[9px] text-slate-400 dark:text-slate-500 block">{labels[key]}</span>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-3 text-right">
                                                            * 정밀 학습 밀도 검사 미시행 상태로, 학생의 등록 프로필에 따른 AI 최적 추천 배분율이 표시됩니다.
                                                        </p>
                                                    </div>

                                                    {/* 우측: 그래프 의미 및 권장 활용 가이드 */}
                                                    <div className="lg:col-span-7 bg-white dark:bg-slate-900/70 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-3">
                                                        <div>
                                                            <div className="flex items-center gap-1.5 mb-1.5">
                                                                <span className="text-xs">💡</span>
                                                                <h5 className="text-xs font-black text-slate-800 dark:text-slate-100">이 그래프의 의미</h5>
                                                            </div>
                                                            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                                                                학생이 등록한 <strong>취약 과목({result.student?.weakSubject === 'math' ? '수학' : result.student?.weakSubject === 'korean' ? '국어' : result.student?.weakSubject === 'english' ? '영어' : '주요과목'}) 보완 가중치</strong>와
                                                                <strong> 입시 영역별 중요도(국·수·영·탐)</strong>를 종합 분석하여 도출된 <strong>일일 자율학습(순공) 최적 시간 배분 모델</strong>입니다.
                                                            </p>
                                                        </div>

                                                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                                                            <div className="flex items-center gap-1.5 mb-1.5">
                                                                <span className="text-xs">🎯</span>
                                                                <h5 className="text-xs font-black text-indigo-600 dark:text-indigo-400">실전 활용 권고사항</h5>
                                                            </div>
                                                            <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                                                                <li className="flex items-start gap-1.5">
                                                                    <span className="text-indigo-500 font-bold shrink-0">1.</span>
                                                                    <span><strong>일일 플래너 순공 배분:</strong> 하루 총 자율학습 시간(예: 6시간) 중 위 권장 비율에 맞춰 과목별 공부 시간(예: 최우선 과목 35~40% = 약 2시간 20분)을 먼저 확정하고 집중 골든타임에 우선 배치하세요.</span>
                                                                </li>
                                                                <li className="flex items-start gap-1.5">
                                                                    <span className="text-indigo-500 font-bold shrink-0">2.</span>
                                                                    <span><strong>과목 편식 및 회피 방지:</strong> 선호 과목에 시간이 과도하게 쏠리고 취약 과목을 미루는 현상을 예방하기 위한 <strong>학습 균형 가이드라인(±5% 이내)</strong>으로 삼으세요.</span>
                                                                </li>
                                                                <li className="flex items-start gap-1.5">
                                                                    <span className="text-indigo-500 font-bold shrink-0">3.</span>
                                                                    <span><strong>주간 결산 및 피드백:</strong> 주말 플래너 점검 시 실제 학습에 투입한 과목별 시간 비율과 본 권장 배분율을 비교 분석하여 다음 주 계획에 반영하세요.</span>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Expanded Chart Grid & Nutrition (Always Visible) */}
                                {(() => {
                                    const hasHRV = Boolean(
                                        result.hrv?.isHrvTested ?? (
                                            (config?.usePortable && result.hrv?.portableHrv && result.hrv.portableHrv.pulseVariability > 0) ||
                                            Boolean((result.hrv?.hrvIndex || 0) > 0 || (result.hrv?.meanHr || 0) > 0)
                                        )
                                    );
                                    const hasEEG = Boolean(
                                        result.hrv?.isEegTested ?? (
                                            (result.hrv?.eegGamma || 0) > 0 || (result.hrv?.eegAlpha || 0) > 0 || (result.hrv?.dominantEEG && result.hrv.dominantEEG.length > 0)
                                        )
                                    );
                                    const hasBioSignals = Boolean(result.hrv?.isSensorMeasured ?? (hasHRV || hasEEG));

                                    return (
                                        <>
                                            <div id="section-charts" className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div className="bg-white dark:bg-slate-900/70 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm h-80">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h4 className="text-sm font-bold text-slate-500 uppercase">자율신경계 밸런스 (ANS)</h4>
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${hasBioSignals ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
                                                            {hasBioSignals ? '센서 실측' : '설문·신체화 추정'}
                                                        </span>
                                                    </div>
                                                    <BalanceChart sns={result.hrv?.sns || 50} pns={result.hrv?.pns || 50} />
                                                </div>
                                                <div className="bg-white dark:bg-slate-900/70 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm h-80">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h4 className="text-sm font-bold text-slate-500 uppercase">활력도 & 피로도 지수</h4>
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${hasBioSignals ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
                                                            {hasBioSignals ? '센서 실측' : '수면·피로도 기반'}
                                                        </span>
                                                    </div>
                                                    <VitalityBarChart vitality={result.hrv?.vitality || 70} fatigue={result.hrv?.fatigue || 30} />
                                                </div>
                                                <div className="bg-white dark:bg-slate-900/70 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm h-80 flex flex-col justify-between">
                                                    <div>
                                                        <div className="flex items-center justify-between mb-4">
                                                            <h4 className="text-sm font-bold text-slate-500 uppercase">스트레스 & 집중도 게이지</h4>
                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${hasBioSignals ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'}`}>
                                                                {hasBioSignals ? '생체신호 연동' : '설문·행동 기반'}
                                                            </span>
                                                        </div>
                                                        <div className="space-y-3 pt-1">
                                                            <StressGaugeChart
                                                                stress={result.protocol?.stressLevel || 5}
                                                                label="자기보고 스트레스"
                                                                color="text-red-600"
                                                                badge="설문 실측"
                                                                description="학생이 프로토콜 단계에서 직접 입력한 체감 스트레스 강도"
                                                            />
                                                            <StressGaugeChart
                                                                stress={result.hrv?.concentrationLevel || 5}
                                                                label={hasBioSignals ? "임상 집중도" : "행동 집중도"}
                                                                color="text-emerald-600"
                                                                badge={hasBioSignals ? "센서 실측" : "설문·행동 추정"}
                                                                description={hasBioSignals ? "뇌파(EEG) 및 생체 센서 기반 임상 집중 유지력" : "프로토콜 행동 몰입도 설문 및 순공 지표 기반 산출"}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 dark:text-slate-500 text-right">
                                                        {hasBioSignals ? '* 센서 측정 실측치 연동' : '* 센서 미측정 상태: 설문 및 행동 지표 반영'}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Targeted Nutrition Recommendation */}
                                            <div id="section-nutrition">
                                                <TargetedNutritionRecommendation
                                                    recommendedProducts={recommendedProducts}
                                                    isPremiumOrAbove={isPremiumOrAbove}
                                                    membershipTier={userTier}
                                                    hasBioSignals={hasBioSignals}
                                                    onUpgradeClick={() => {
                                                        setSubscriptionReason('1:1 맞춤 영양제 3-Tier 추천 및 처방전 발급');
                                                        setIsSubscriptionModalOpen(true);
                                                    }}
                                                />
                                            </div>
                                        </>
                                    );
                                })()}

                                {/* AI Schedule & Mental Prescription */}
                                {(() => {
                                    const sleepPrescription = generateSleepPrescription(result.careType, result.analytics);
                                    const parseTimeHour = (timeStr: string) => parseInt(timeStr.split(':')[0], 10);
                                    const bedHour = parseTimeHour(sleepPrescription.recommendedBedtime) || 23;
                                    const wakeHour = parseTimeHour(sleepPrescription.recommendedWakeTime) || 7;

                                    const isMorningType = wakeHour <= 7;
                                    let goldenStartNum = isMorningType ? 10 : 14;
                                    if (result.analytics?.goldenTimeStart) {
                                        const parsed = parseInt(result.analytics.goldenTimeStart.split(':')[0], 10);
                                        if (!isNaN(parsed)) goldenStartNum = parsed;
                                    }
                                    let goldenEndNum = goldenStartNum + 2;
                                    if (result.hrv?.brainScore && result.hrv.brainScore > 70) {
                                        goldenEndNum += 1;
                                    }

                                    const slumpStartNum = goldenStartNum + 4;
                                    const slumpEndNum = slumpStartNum + 1;
                                    const secondStartNum = slumpEndNum + 2;
                                    const secondEndNum = 22;

                                    const formatHour = (h: number) => `${h.toString().padStart(2, '0')}:00`;
                                    const goldenStart = formatHour(goldenStartNum);
                                    const goldenEnd = formatHour(goldenEndNum);

                                    const subjectKey = result.student?.weakSubject || result.student?.focusSubjects?.[0] || result.student?.selectedSubjects?.[0] || 'general';
                                    const subjectPlan = getSubjectCircadianPlan(subjectKey);

                                    return (
                                        <div className="space-y-8">
                                            <div id="section-ai-schedule" className="bg-white dark:bg-slate-900/70 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                                                {/* Header */}
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                                                    <div className="flex items-center gap-2.5">
                                                        <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                                                        <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white">
                                                            1. 24시간 생체 시계 &amp; 일일 두뇌 골든타임 스케줄
                                                        </h3>
                                                    </div>
                                                    <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-full border border-blue-200 dark:border-blue-800 w-fit">
                                                        표준 서카디안 생체 리듬 모델
                                                    </span>
                                                </div>

                                                {/* Banner Callout */}
                                                <div className="p-3.5 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 rounded-2xl text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed font-medium">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="font-bold text-xs md:text-sm text-indigo-900 dark:text-indigo-100">
                                                            💡 생체 서카디안 리듬(24-Hour Circadian Rhythm) 기반 시간대별 과목 배치
                                                        </span>
                                                        <span className="text-blue-600 dark:text-blue-400 font-black text-[10px] tracking-wider">BIO-CHRONO LOGIC</span>
                                                    </div>
                                                    <p className="text-slate-600 dark:text-slate-300">
                                                        수험생의 인지 활성도 및 자율신경 상태를 기반으로 도출된 <strong>하루 중 뇌 효율이 가장 높은 골든타임</strong>과 <strong>브레인 슬럼프</strong> 시간대입니다.
                                                    </p>
                                                    <p className="text-blue-700 dark:text-blue-300 font-bold mt-1 text-[11px]">
                                                        ※ Free 모드는 기상 시각 기준 생체 상대 시간(+n시간)으로 제공되며(오전 7시 기상 표준 기준 예시 병기), 실제 본인의 기상 시각에 맞춰 1:1 적용하세요.
                                                    </p>
                                                </div>

                                                {/* Morning & Pre-Sleep Routine Cards */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl">
                                                        <span className="font-black text-amber-900 dark:text-amber-300 block text-xs md:text-sm mb-1.5">
                                                            🌞 오전 활성화 루틴 (Morning Activation)
                                                        </span>
                                                        <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1 leading-relaxed">
                                                            <li>• <strong>[기상 직후] (표준 07:00~08:00경)</strong>: 코르티솔 각성 반응(CAR) 유도. 자연광 노출 + 미지근한 물 한 잔으로 뇌 혈류 공급.</li>
                                                            <li>• <strong>[기상 후 1~2.5h] (표준 08:00~09:30경)</strong>: 예열 학습(Warm-up). {subjectPlan.subjectName} 개념/어휘 등 가벼운 워밍업으로 감각 활성화.</li>
                                                        </ul>
                                                    </div>
                                                    <div className="p-3.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-2xl">
                                                        <span className="font-black text-slate-800 dark:text-slate-200 block text-xs md:text-sm mb-1.5">
                                                            🌙 수면 전 회복 루틴 (Pre-Sleep Routine)
                                                        </span>
                                                        <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1 leading-relaxed">
                                                            <li>• <strong>[취침 1~2h 전] (표준 22:00~23:00경)</strong>: 멜라토닌 분비 보호. 스마트폰 블루라이트 100% 차단 및 뇌 이완 모드 전환.</li>
                                                            <li>• <strong>[취침 직전 20분]</strong>: 오늘 학습한 핵심 단어·공식을 가볍게 훑으면 수면 중 해마(Hippocampus) 장기기억 고착 극대화.</li>
                                                        </ul>
                                                    </div>
                                                </div>

                                                {/* Clock & 3 Peak Cards */}
                                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center pt-2">
                                                    {/* 원형 시계 */}
                                                    <div className="lg:col-span-5 flex flex-col items-center justify-center p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
                                                        <span className="text-xs font-black text-slate-700 dark:text-slate-200 mb-1">
                                                            ⏰ 24시간 서카디안 표준 생체 시계
                                                        </span>
                                                        <div className="w-[280px] h-[280px] flex items-center justify-center overflow-hidden">
                                                            <div className="transform scale-[0.82] origin-center">
                                                                <CircularSchedule
                                                                    isDark={isDarkMode}
                                                                    hideLegend={true}
                                                                    periods={[
                                                                        { id: 'morning', start: 7, end: 9, label: '오전 루틴', color: '#1e40af', icon: '🌞' },
                                                                        { id: 'golden', start: goldenStartNum, end: goldenEndNum, label: 'Golden Hour', color: '#2563eb', icon: '🔥' },
                                                                        { id: 'slump', start: slumpStartNum, end: slumpEndNum, label: '회복/슬럼프', color: '#94a3b8', icon: '💤' },
                                                                        { id: 'second', start: secondStartNum, end: secondEndNum, label: 'Second Wind', color: '#4f46e5', icon: '🚀' },
                                                                        { id: 'sleep', start: bedHour, end: 24, label: '수면', color: '#334155', icon: '🌙' },
                                                                        { id: 'sleep2', start: 0, end: wakeHour, label: '수면', color: '#334155' }
                                                                    ]}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-wrap justify-center gap-2 text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                                                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-600"></span>골든(기상+3h / 표준 {goldenStartNum}~{goldenEndNum}시)</span>
                                                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-600"></span>세컨드(기상+10h / 표준 {secondStartNum}~{secondEndNum}시)</span>
                                                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-700"></span>수면권장(표준 {bedHour}:00~0{wakeHour}:00)</span>
                                                        </div>
                                                    </div>

                                                    {/* 3 Peak Cards */}
                                                    <div className="lg:col-span-7 flex flex-col justify-between gap-3">
                                                        <div className="p-3.5 bg-red-50/80 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-2xl">
                                                            <span className="font-black text-red-700 dark:text-red-400 block text-xs md:text-sm mb-1">
                                                                🔥 1차 골든 아워 [기상 후 2.5~4.5h / 표준 {goldenStart}~{goldenEnd}] - 당일 최고 승부처
                                                            </span>
                                                            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                                                                <strong className="text-slate-900 dark:text-white">{subjectPlan.goldenTitle}</strong>: {subjectPlan.goldenDesc}
                                                            </p>
                                                        </div>

                                                        <div className="p-3.5 bg-orange-50/80 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/50 rounded-2xl">
                                                            <span className="font-black text-orange-700 dark:text-orange-400 block text-xs md:text-sm mb-1">
                                                                ☁️ 서카디안 딥 &amp; 브레인 슬럼프 [기상 후 6.5~8h / 표준 {formatHour(slumpStartNum)}~{formatHour(slumpEndNum)}]
                                                            </span>
                                                            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                                                                <strong className="text-slate-900 dark:text-white">{subjectPlan.slumpTitle}</strong>: {subjectPlan.slumpDesc}
                                                            </p>
                                                        </div>

                                                        <div className="p-3.5 bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 rounded-2xl">
                                                            <span className="font-black text-indigo-700 dark:text-indigo-400 block text-xs md:text-sm mb-1">
                                                                🚀 2차 골든 아워 / 세컨드 윈드 [기상 후 10~14h / 표준 {formatHour(secondStartNum)}~{formatHour(secondEndNum)}]
                                                            </span>
                                                            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                                                                <strong className="text-slate-900 dark:text-white">{subjectPlan.secondTitle}</strong>: {subjectPlan.secondDesc}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Schedule Table */}
                                                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm pt-1">
                                                    <table className="w-full text-xs text-left">
                                                        <thead className="bg-slate-900 text-white">
                                                            <tr>
                                                                <th className="px-3.5 py-2.5 w-36 text-xs font-bold">생체 시간대 (표준 시각)</th>
                                                                <th className="px-3.5 py-2.5 w-36 text-xs font-bold">생체 생리 컨디션</th>
                                                                <th className="px-3.5 py-2.5 w-44 text-xs font-bold">권장 과목 ({subjectPlan.subjectName} 맞춤)</th>
                                                                <th className="px-3.5 py-2.5 text-xs font-bold">의학적 학습 및 행동 실천 전략</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 text-xs">
                                                            <tr className="bg-red-50/30 dark:bg-red-950/20">
                                                                <td className="px-3.5 py-2.5 font-bold text-red-600 dark:text-red-400">
                                                                    기상+2.5~4.5h ({goldenStart}~{goldenEnd})
                                                                </td>
                                                                <td className="px-3.5 py-2.5 font-bold">골든타임 (최고 각성·인지속도)</td>
                                                                <td className="px-3.5 py-2.5 font-bold text-blue-600 dark:text-blue-400">{subjectPlan.goldenTableSubject}</td>
                                                                <td className="px-3.5 py-2.5 leading-relaxed">{subjectPlan.goldenTableAction}</td>
                                                            </tr>
                                                            <tr className="bg-orange-50/30 dark:bg-orange-950/20">
                                                                <td className="px-3.5 py-2.5 font-bold text-orange-600 dark:text-orange-400">
                                                                    기상+6.5~8h ({formatHour(slumpStartNum)}~{formatHour(slumpEndNum)})
                                                                </td>
                                                                <td className="px-3.5 py-2.5 font-bold text-orange-600">슬럼프 (식곤증·아데노신 축적)</td>
                                                                <td className="px-3.5 py-2.5">{subjectPlan.slumpTableSubject}</td>
                                                                <td className="px-3.5 py-2.5 leading-relaxed">{subjectPlan.slumpTableAction}</td>
                                                            </tr>
                                                            <tr className="bg-indigo-50/30 dark:bg-indigo-950/20">
                                                                <td className="px-3.5 py-2.5 font-bold text-indigo-600 dark:text-indigo-400">
                                                                    기상+10~14h ({formatHour(secondStartNum)}~{formatHour(secondEndNum)})
                                                                </td>
                                                                <td className="px-3.5 py-2.5 font-bold text-indigo-600">세컨드 윈드 (2차 몰입·각성 회복)</td>
                                                                <td className="px-3.5 py-2.5">{subjectPlan.secondTableSubject}</td>
                                                                <td className="px-3.5 py-2.5 leading-relaxed">{subjectPlan.secondTableAction}</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                            {/* 증상 맞춤형 정신건강 처방전 */}
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
                                                                    className="w-full py-4 mt-auto bg-white text-indigo-900 font-bold rounded-2xl hover:bg-slate-100 transition-all shadow-lg active:scale-[0.98] cursor-pointer"
                                                                >
                                                                    처방 가이드 열기
                                                                </button>
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}

                                {showZenMode && result.careType && MENTAL_PRESCRIPTIONS[result.careType] && (
                                    <PrescriptionZenMode prescription={MENTAL_PRESCRIPTIONS[result.careType]} onClose={() => setShowZenMode(false)} />
                                )}

                                {/* Before & After Comparison Tracker (Progress Tracker) */}
                                {(() => {
                                    const previousRecords = (history || []).filter(
                                        h => h?.student?.name === result.student.name && h?.date !== result.student.testDate
                                    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                                    const prev = previousRecords[0];
                                    if (!prev || !prev.hrv) return null;

                                    const getChange = (current: number, previous: number) => {
                                        const diff = current - previous;
                                        const percent = previous !== 0 ? ((diff / previous) * 100).toFixed(1) : '0';
                                        return { diff, percent, isPositive: diff > 0 };
                                    };

                                    const metrics = [
                                        { label: 'Brain Score', current: result.hrv?.brainScore || 0, prev: prev.hrv?.brainScore || 0, unit: '점', icon: '🧠', goodIfUp: true },
                                        { label: 'Vitality Index', current: result.hrv?.vitality || 0, prev: prev.hrv?.vitality || 0, unit: '%', icon: '⚡', goodIfUp: true },
                                        { label: 'Fatigue Level', current: result.hrv?.fatigue || 0, prev: prev.hrv?.fatigue || 0, unit: '%', icon: '😴', goodIfUp: false },
                                        { label: 'Stress Resistance', current: result.hrv?.sns || 0, prev: prev.hrv?.sns || 0, unit: '', icon: '🛡️', goodIfUp: false },
                                        { label: 'Sleep Quality (ISI)', current: 21 - (result.survey?.isi || 0), prev: 21 - (prev.survey?.isi || 0), unit: '점', icon: '🌙', goodIfUp: true },
                                        { label: 'Concentration', current: result.hrv?.concentrationLevel || 5, prev: prev.hrv?.concentrationLevel || 5, unit: 'Lv', icon: '🎯', goodIfUp: true }
                                    ];

                                    return (
                                        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-8 rounded-3xl shadow-2xl text-white print-avoid-break">
                                            <div className="flex items-center justify-between mb-8">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg">
                                                        📊
                                                    </div>
                                                    <div>
                                                        <h3 className="text-2xl font-black tracking-tight">Progress Tracker</h3>
                                                        <p className="text-white/50 text-sm font-medium">Before & After 정기 추적 비교 분석</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">직전 검사 일자</p>
                                                    <p className="text-lg font-bold text-white/80">{prev.date}</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                {metrics.map((m, idx) => {
                                                    const change = getChange(m.current, m.prev);
                                                    const isImproved = m.goodIfUp ? change.isPositive : !change.isPositive;

                                                    return (
                                                        <div
                                                            key={idx}
                                                            className={`p-5 rounded-2xl border transition-all duration-300 ${isImproved
                                                                ? 'bg-emerald-500/10 border-emerald-500/30'
                                                                : change.diff === 0
                                                                    ? 'bg-white/5 border-white/10'
                                                                    : 'bg-rose-500/10 border-rose-500/30'
                                                                }`}
                                                        >
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <span className="text-xl">{m.icon}</span>
                                                                <span className="text-xs font-bold text-white/60 uppercase tracking-wider">{m.label}</span>
                                                            </div>

                                                            <div className="flex items-end justify-between">
                                                                <div>
                                                                    <p className="text-[10px] text-white/30 font-bold mb-0.5">BEFORE</p>
                                                                    <p className="text-lg font-bold text-white/50">{m.prev}{m.unit}</p>
                                                                </div>

                                                                <div className={`text-2xl font-black ${isImproved ? 'text-emerald-400' : change.diff === 0 ? 'text-white/40' : 'text-rose-400'}`}>
                                                                    {change.diff > 0 ? '↑' : change.diff < 0 ? '↓' : '—'}
                                                                </div>

                                                                <div className="text-right">
                                                                    <p className="text-[10px] text-white/30 font-bold mb-0.5">AFTER</p>
                                                                    <p className="text-lg font-black text-white">{m.current}{m.unit}</p>
                                                                </div>
                                                            </div>

                                                            <div className={`mt-3 text-center text-xs font-bold py-1 rounded-lg ${isImproved
                                                                ? 'bg-emerald-500/20 text-emerald-300'
                                                                : change.diff === 0
                                                                    ? 'bg-white/5 text-white/30'
                                                                    : 'bg-rose-500/20 text-rose-300'
                                                                }`}>
                                                                {change.diff === 0 ? 'No Change' : `${change.isPositive ? '+' : ''}${change.percent}%`}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* Multi-Session Analysis Trend */}
                                {(() => {
                                    const studentHistory = (history || [])
                                        .filter(h => h?.student?.name === result.student.name)
                                        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

                                    if (studentHistory.length < 2) return null;

                                    return (
                                        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm print-avoid-break overflow-hidden">
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
                                                    <div>
                                                        <h3 className="text-xl font-bold text-slate-900">Multi-Session Analysis Trend</h3>
                                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">누적 검사 기반 시계열 추이 분석</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="h-72 w-full pt-4">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <LineChart data={studentHistory}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                                                        <XAxis
                                                            dataKey="date"
                                                            tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }}
                                                            axisLine={false}
                                                            tickLine={false}
                                                        />
                                                        <YAxis
                                                            domain={[0, 100]}
                                                            tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }}
                                                            axisLine={false}
                                                            tickLine={false}
                                                        />
                                                        <Tooltip
                                                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontSize: '11px', padding: '12px' }}
                                                        />
                                                        <Legend />
                                                        <Line
                                                            type="monotone"
                                                            dataKey="hrv.brainScore"
                                                            name="Brain Score"
                                                            stroke="#6366f1"
                                                            strokeWidth={3}
                                                            dot={{ r: 5, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                                                        />
                                                        <Line
                                                            type="monotone"
                                                            dataKey="hrv.vitality"
                                                            name="Vitality Index"
                                                            stroke="#10b981"
                                                            strokeWidth={3}
                                                            strokeDasharray="5 5"
                                                        />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* Personalized Exam Strategy Section (6 Cards) */}
                                {config.isExamMode && result.careType && strategies && strategies[result.careType] && (
                                    <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden print-avoid-break">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-[100px] opacity-20 transform translate-x-1/2 -translate-y-1/2 no-print"></div>
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-3 mb-8">
                                                <div className="w-1.5 h-6 bg-blue-400 rounded-full"></div>
                                                <div>
                                                    <h3 className="text-xl font-bold">Personalized Exam Strategy</h3>
                                                    <p className="text-slate-400 text-sm">유형별 최적화 수험 전략 : {result.careType}</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {/* 1. Nutrition */}
                                                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/15 transition-colors">
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <span className="text-2xl">💊</span>
                                                        <h4 className="font-bold text-blue-300">Nutrition Routine</h4>
                                                    </div>
                                                    <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">{strategies[result.careType]?.nutritionGuide || '-'}</p>
                                                </div>
                                                {/* 2. Study */}
                                                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/15 transition-colors">
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <span className="text-2xl">⏱</span>
                                                        <h4 className="font-bold text-indigo-300">Study Strategy</h4>
                                                    </div>
                                                    <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">{strategies[result.careType]?.studyStrategy || '-'}</p>
                                                </div>
                                                {/* 3. Exercise */}
                                                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/15 transition-colors">
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <span className="text-2xl">🧘</span>
                                                        <h4 className="font-bold text-emerald-300">Exercise Guide</h4>
                                                    </div>
                                                    <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">{strategies[result.careType]?.exerciseGuide || '-'}</p>
                                                </div>
                                                {/* 4. Ritual */}
                                                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/15 transition-colors">
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <span className="text-2xl">🧠</span>
                                                        <h4 className="font-bold text-amber-300">Pre-Study Ritual</h4>
                                                    </div>
                                                    <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">{strategies[result.careType]?.preStudyRoutine || '-'}</p>
                                                </div>
                                                {/* 5. Recovery */}
                                                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/15 transition-colors">
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <span className="text-2xl">💤</span>
                                                        <h4 className="font-bold text-purple-300">Recovery Guide</h4>
                                                    </div>
                                                    <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">{strategies[result.careType]?.recoveryGuide || '-'}</p>
                                                </div>
                                                {/* 6. Lifestyle */}
                                                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/15 transition-colors">
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <span className="text-2xl">📱</span>
                                                        <h4 className="font-bold text-rose-300">Lifestyle Guide</h4>
                                                    </div>
                                                    <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">{strategies[result.careType]?.lifestyleGuide || '-'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Secret Point - Expert Clinical Remarks */}
                                <div id="section-expert-memo" className="no-print">
                                    <button
                                        onClick={() => setShowSecretPoint(!showSecretPoint)}
                                        className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${showSecretPoint
                                            ? 'bg-slate-900 border-slate-900 text-white shadow-lg'
                                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl">{showSecretPoint ? '🔓' : '🔒'}</span>
                                            <div className="text-left">
                                                <p className="font-bold text-sm">전문가 소견 (Secret Point & 임상 해석)</p>
                                                <p className={`text-[10px] ${showSecretPoint ? 'text-slate-300' : 'text-slate-400'}`}>
                                                    자율신경·신경인지·심리 설문 3중 복합 분석 기반 전문가 전용 임상 소견
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`text-sm font-bold transition-transform ${showSecretPoint ? 'rotate-180' : ''}`}>
                                            ▼
                                        </span>
                                    </button>

                                    {showSecretPoint && (
                                        <div className="mt-4 p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl border border-slate-700 text-white animate-in fade-in slide-in-from-top-2 duration-300">
                                            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
                                                <span className="text-xl">🔐</span>
                                                <h4 className="font-bold text-amber-400 uppercase tracking-wider text-sm">SECRET POINT - 전문가 전용 임상 분석</h4>
                                            </div>

                                            <div className="space-y-4 mb-6">
                                                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                                    <p className="text-amber-300 font-bold text-xs mb-2">📊 임상적 해석</p>
                                                    <ul className="text-[11px] text-slate-300 space-y-1.5 leading-relaxed">
                                                        <li>• <strong>SNS/PNS 균형:</strong> {result.hrv?.sns ?? 50}% / {result.hrv?.pns ?? 50}% — {
                                                            (result.hrv?.sns ?? 50) > 65 ? '교감신경 과활성화 상태, 만성 긴장 패턴 관찰' :
                                                                (result.hrv?.sns ?? 50) < 35 ? '부교감신경 우세, 에너지 저하 가능성' :
                                                                    '정상 범위 내 균형 유지'
                                                        }</li>
                                                        <li>• <strong>BAI 점수:</strong> {result.survey?.bai ?? 0}점 — {
                                                            (result.survey?.bai ?? 0) >= 30 ? '심한 불안 수준, 임상적 개입 권고' :
                                                                (result.survey?.bai ?? 0) >= 20 ? '상당한 불안 수준, 전문 상담 고려' :
                                                                    (result.survey?.bai ?? 0) >= 10 ? '경미한 불안 경향' :
                                                                        '정상 범위'
                                                        }</li>
                                                        <li>• <strong>ISI 점수:</strong> {result.survey?.isi ?? 0}점 — {
                                                            (result.survey?.isi ?? 0) >= 22 ? '심한 불면증, 수면 클리닉 연계 권고' :
                                                                (result.survey?.isi ?? 0) >= 15 ? '중등도 불면증, 수면 위생 교육 필요' :
                                                                    (result.survey?.isi ?? 0) >= 8 ? '경미한 불면 경향' :
                                                                        '정상적인 수면'
                                                        }</li>
                                                        <li>• <strong>뇌 건강점수:</strong> {result.hrv?.brainScore ?? 75}점 — {
                                                            (result.hrv?.brainScore ?? 75) >= 80 ? '우수한 인지 기능 상태' :
                                                                (result.hrv?.brainScore ?? 75) >= 60 ? '양호하나 최적화 여지 있음' :
                                                                    (result.hrv?.brainScore ?? 75) >= 40 ? '인지 피로 누적, 회복 필요' :
                                                                        '심각한 두뇌 피로, 즉각적 개입 필요'
                                                        }</li>
                                                    </ul>
                                                </div>

                                                <div className="p-4 bg-orange-500/10 rounded-xl border border-orange-500/20">
                                                    <p className="text-orange-300 font-bold text-xs mb-2">⚠️ 추가 스크리닝 권고</p>
                                                    <ul className="text-[11px] text-slate-300 space-y-1">
                                                        {(result.survey?.bai ?? 0) >= 15 && <li>• GAD-7 (범불안장애 선별) 실시 고려</li>}
                                                        {(result.survey?.isi ?? 0) >= 15 && <li>• PSQI (피츠버그 수면 질 지수) 실시 권고</li>}
                                                        {(result.survey?.concentrationScore ?? 0) >= 20 && <li>• ADHD 스크리닝 검사 고려</li>}
                                                        {(result.hrv?.sns ?? 0) > 70 && <li>• 스트레스 호르몬(코티솔) 검사 권고</li>}
                                                        {result.survey?.chronicFatigue && <li>• 만성피로증후군 정밀 평가 필요</li>}
                                                        {(result.survey?.bai ?? 0) < 15 && (result.survey?.isi ?? 0) < 15 && (result.hrv?.sns ?? 0) <= 70 && (
                                                            <li>• 현재 특별한 추가 스크리닝 필요 없음</li>
                                                        )}
                                                    </ul>
                                                </div>

                                                {evaluatedSecretPoints && evaluatedSecretPoints.length > 0 && (
                                                    <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20 space-y-2">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <p className="text-blue-300 font-bold text-xs">🔔 실시간 조건 평가 소견</p>
                                                            <button
                                                                onClick={() => {
                                                                    const text = evaluatedSecretPoints.map(p => `[${p.severity.toUpperCase()}] ${p.message}`).join('\n');
                                                                    setAdminMemo(prev => prev ? prev + '\n\n' + text : text);
                                                                    alert('전문가 소견이 종합 소견 메모에 복사되었습니다.');
                                                                }}
                                                                className="text-xs font-bold text-blue-400 hover:text-blue-200 hover:underline cursor-pointer"
                                                            >
                                                                + 메모에 복사
                                                            </button>
                                                        </div>
                                                        {evaluatedSecretPoints.map(point => (
                                                            <div key={point.id} className="p-3 rounded-lg bg-white/5 border border-white/10 text-xs">
                                                                <p className="font-bold text-slate-200">{point.message}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Section: 나의 전문소견 & AI 보조 어시스턴트 (Expert Opinion & AI Assistant) - 학원/오너/의료전문가 모드 전용 */}
                                {isExpertUser && (
                                    <div id="section-ai-assistant" className="mt-8 space-y-6 print-avoid-break">
                                        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-8 rounded-3xl border border-indigo-500/30 text-white shadow-xl">
                                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-2xl shadow-inner">
                                                        👨‍⚕️
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="text-xl font-black text-white">나의 전문소견 &amp; AI 보조 어시스턴트</h3>
                                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                                                7대 AI 컨설팅 스위트
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-slate-300 mt-1">
                                                            자율신경(교감·부교감)과 신경인지·심리검사 데이터를 융합한 전문가 맞춤 소견 및 7대 심층 AI 컨설팅 리포트
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* ConsultantTabs 7대 AI 분석 및 전문소견 편집기 */}
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

                                            {/* AI Assistant Panel for interactive LLM summary */}
                                            <div className="mt-6">
                                                <AIAssistantPanel
                                                    contextData={result}
                                                    systemPrompt="당신은 신경인지, 자율신경 밸런스, 심리설문 결과를 종합 분석하는 NBASS 시스템의 전문 AI입니다. 학생의 상태를 분석하고 학부모가 이해하기 쉽게 3~4문단으로 친절하게 종합 평가를 요약해 주세요."
                                                    aiModels={aiModels}
                                                    buttonLabel="✨ 종합 결과 AI 분석하기"
                                                    membershipTier={result.student?.membershipTier || 'free'}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Sleep & Mental Dashboard */}
                                {!isVipOrAbove ? (
                                    <div id="section-sleep-dashboard" className="bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-white rounded-3xl border-2 border-amber-500/40 p-6 md:p-8 shadow-2xl no-print">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-black">
                                                        👑 VIP 회원 전용
                                                    </span>
                                                    <h4 className="text-xl font-black">맞춤형 수면 &amp; 멘탈 관리 프로그램</h4>
                                                </div>
                                                <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                                                    크로노타입(MEQ)과 일주기 렘/논렘(NREM) 수면 주기 및 심층 마인드셋 케어를 연동하여 수면 부채 해소 및 최적 멘탈 루틴을 자동 처방하는 <b>VIP 전용 솔루션</b>입니다.
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setSubscriptionReason('1:1 맞춤형 수면관리 & 심층 멘탈관리 솔루션 (VIP 전용)');
                                                    setIsSubscriptionModalOpen(true);
                                                }}
                                                className="px-6 py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-700 text-white font-black rounded-2xl shadow-lg transition-all transform hover:scale-105 shrink-0 cursor-pointer"
                                            >
                                                VIP 패키지 안내 (월 29,900원)
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <SleepDashboard careType={result.careType} analytics={result.analytics} studentId={result.student.id} />
                                        <div className="flex justify-end">
                                            <button
                                                onClick={() => onMenuChange?.('sleep')}
                                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-indigo-500/25 transition-all transform hover:scale-[1.02] text-sm cursor-pointer"
                                            >
                                                <span>🌙</span>
                                                <span>심층 수면 관리 &amp; 목표 설정 시스템 바로가기</span>
                                                <span>→</span>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Grade & Academic Achievement Dashboard Integration */}
                                <div id="section-grade-analytics" className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-2xl font-bold">
                                                📈
                                            </div>
                                            <div>
                                                <div className="flex items-center space-x-2">
                                                    <h4 className="text-xl font-bold text-slate-800 dark:text-white">학업 성취도 &amp; 성적 추이 연동 분석</h4>
                                                    <span className="px-2.5 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-full">
                                                        실시간 연동
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                    진단된 인지 기능(집중력/작업기억) 및 생체 리듬과 실제 수능·내신 성적의 상관관계 분석입니다.
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => onMenuChange ? onMenuChange('grade') : setStep('grade_management')}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-md hover:shadow-blue-500/20 text-xs transition-all transform hover:scale-[1.02] shrink-0 cursor-pointer"
                                        >
                                            <span>📊</span>
                                            <span>성적 관리 &amp; AI 시뮬레이터</span>
                                            <span>→</span>
                                        </button>
                                    </div>

                                    {gradeRecords.length > 0 ? (
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60">
                                                    <span className="text-xs text-slate-500 font-medium">최근 등록 시험</span>
                                                    <p className="text-base font-bold text-slate-800 dark:text-white mt-1">
                                                        {gradeRecords[0].examName}
                                                    </p>
                                                    <span className="text-[11px] text-slate-400">{gradeRecords[0].examDate}</span>
                                                </div>
                                                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60">
                                                    <span className="text-xs text-slate-500 font-medium">최근 평균 등급</span>
                                                    <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
                                                        {(gradeRecords[0].subjects.reduce((a, b) => a + (b.grade || 5), 0) / Math.max(1, gradeRecords[0].subjects.length)).toFixed(1)}
                                                        <span className="text-xs font-normal text-slate-500 ml-1">등급</span>
                                                    </p>
                                                </div>
                                                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60">
                                                    <span className="text-xs text-slate-500 font-medium">인지 지표 ↔ 성적 상관도</span>
                                                    <p className="text-sm font-bold text-slate-800 dark:text-white mt-1">
                                                        {result.analytics?.pureStudyRatio !== undefined && result.analytics.pureStudyRatio < 60
                                                            ? '⚠️ 순공 집중 비율 저하로 인한 실수 주의'
                                                            : '✨ 인지 자원 기반 성적 상승 여력 충분'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Overlay ComposedChart */}
                                            {gradeCorrelationData.length > 0 && (
                                                <div className="bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/60 space-y-4">
                                                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                                                        <div>
                                                            <h5 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
                                                                <span>📊</span>
                                                                <span>성적 변동 ↔ 뇌-신체 컨디션 시계열 오버레이 차트</span>
                                                                {gradeCorrelationData.length > 0 && (
                                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${gradeCorrelationData.every(d => d.isMeasured)
                                                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                                                                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
                                                                        }`}>
                                                                        {gradeCorrelationData.every(d => d.isMeasured) ? '실측 데이터 매칭' : '일부 기준값 추정'}
                                                                    </span>
                                                                )}
                                                            </h5>
                                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                                                좌측 축: 시험 등급(1등급이 상단) / 우측 축: 스트레스 저항도 &amp; 집중력 유지도(%)
                                                            </p>
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-medium">
                                                            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> 평균 등급</span>
                                                            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> 취약 과목</span>
                                                            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> 스트레스 저항도</span>
                                                        </div>
                                                    </div>

                                                    <div className="h-64 w-full">
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <ComposedChart data={gradeCorrelationData} margin={{ top: 10, right: 20, bottom: 0, left: -10 }}>
                                                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                                                                <XAxis dataKey="examName" tick={{ fontSize: 11 }} />
                                                                <YAxis yAxisId="left" domain={[1, 9]} reversed tick={{ fontSize: 11 }} unit="등급" />
                                                                <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                                                                <Tooltip
                                                                    contentStyle={{ borderRadius: '1rem', border: '1px solid #cbd5e1', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                                                    formatter={(val: any, name: string) => {
                                                                        if (name === 'avgGrade') return [`${val}등급`, '평균 등급'];
                                                                        if (name === 'weakGrade') return [`${val}등급`, '취약 과목 등급'];
                                                                        if (name === 'hrvResistance') return [`${val}%`, '스트레스 저항도'];
                                                                        if (name === 'focusCapacity') return [`${val}%`, '집중력 유지도'];
                                                                        return [val, name];
                                                                    }}
                                                                />
                                                                <Bar yAxisId="right" dataKey="hrvResistance" name="hrvResistance" fill="#10b981" opacity={0.25} radius={[6, 6, 0, 0]} barSize={24} />
                                                                <Line yAxisId="left" type="monotone" dataKey="avgGrade" name="avgGrade" stroke="#2563eb" strokeWidth={3} dot={{ r: 5, fill: '#2563eb' }} activeDot={{ r: 7 }} />
                                                                <Line yAxisId="left" type="monotone" dataKey="weakGrade" name="weakGrade" stroke="#f43f5e" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 4, fill: '#f43f5e' }} />
                                                            </ComposedChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-2xl text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                                                💡 <strong>신경인지 연동 시계열 분석</strong>: 현재 진단된 <b>{result.careType || '표준'}</b> 상태에서는
                                                {result.careType === CareType.BURNOUT ? ' 과도한 문제 풀이보다 뇌 회복 수면을 확보해야 수학·국어 킬러 문항 집중력이 향상됩니다.' :
                                                    result.careType === CareType.ATTENTION_DEFICIT ? ' 짧은 블록형 집중 훈련(25분 집중 + 5분 휴식)으로 작업기억 부하를 줄이는 것이 급선무입니다.' :
                                                        ' 인지 효율성과 수면 주기가 안정적이며, 취약 과목 타겟 학습 플랜을 집중 실행할 것을 권장합니다.'}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-6 bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-center space-y-3">
                                            <div className="text-3xl">📝</div>
                                            <h5 className="font-bold text-slate-800 dark:text-white text-sm">등록된 성적 데이터가 없습니다</h5>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                                                모의고사 또는 내신 성적을 등록하시면 신경인지 평가 데이터와 결합된 1:1 맞춤형 성적 향상 확률 및 과목별 AI 학습 로드맵이 제공됩니다.
                                            </p>
                                            <button
                                                onClick={() => onMenuChange ? onMenuChange('grade') : setStep('grade_management')}
                                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
                                            >
                                                + 성적 데이터 등록하기
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Admin Memo Section (Quick Presets & Comment) */}
                                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm print-avoid-break">
                                    <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                        <span>📝</span> 종합 소견 (Consultant's Comment)
                                    </h3>

                                    {/* 프리셋 버튼 */}
                                    <div className="flex flex-wrap gap-2 mb-4 no-print">
                                        {adminMemosList.map((memo, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setAdminMemo(prev => prev ? prev + '\n' + memo : memo)}
                                                className="px-3 py-2 bg-slate-50 text-slate-600 text-xs font-bold rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors text-left cursor-pointer"
                                            >
                                                {memo.length > 20 ? memo.substring(0, 20) + '...' : memo}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => {
                                                const newMemo = prompt("새로운 상용구를 입력하세요:");
                                                if (newMemo) setAdminMemosList([...adminMemosList, newMemo]);
                                            }}
                                            className="px-3 py-2 border border-dashed border-slate-300 text-slate-400 text-xs font-bold rounded-xl hover:border-slate-500 transition-colors cursor-pointer"
                                        >
                                            + 추가
                                        </button>
                                    </div>

                                    <textarea
                                        className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-sm leading-relaxed"
                                        placeholder="종합적인 상담 소견을 입력하세요..."
                                        value={adminMemo}
                                        onChange={e => setAdminMemo(e.target.value)}
                                    />
                                </div>

                            </div>
                        </div>

                        {/* Navigator Sidebar */}
                        <div className="xl:w-64 flex-shrink-0 order-1 xl:order-2 hidden xl:block">
                            <ReportNavigator isExpertUser={isExpertUser} />
                        </div>
                    </div>
                </>
            )}

            {
                !showConfig && (
                    <button
                        onClick={() => {
                            if (isAdminUnlocked || currentUserRole === 'OWNER' || localStorage.getItem('nbass_current_role') === 'OWNER') {
                                setShowConfig(true);
                            } else {
                                setShowAdminPassword(true);
                            }
                        }}
                        className="fixed bottom-6 left-6 z-50 w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center opacity-30 hover:opacity-100 shadow-xl border border-slate-700 transition-opacity cursor-pointer"
                        title="관리자 / 오너 설정"
                    >
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
                title="학원 및 의료 전문가 인증 (암호 입력)"
                isPassword={true}
                onConfirm={(pwd) => {
                    setShowExpertModePrompt(false);
                    // [보안] 기본 비밀번호 제거: 설정된 오너 비밀번호가 있을 때만 통과
                    if (config.expertModePassword && pwd === config.expertModePassword) {
                        if (setIsAdminUnlocked) setIsAdminUnlocked(true);
                    } else {
                        alert("전문가 인증 암호가 일치하지 않습니다.");
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

            {result && isExpertUser && (
                <ExpertOverlay
                    careType={result?.careType}
                    adrenalFatigueScore={result?.survey.adrenalFatigueScore ?? 0}
                    currentData={result}
                    studentId={result?.student?.id}
                    isOpen={isExpertOverlayOpen}
                    onClose={() => setIsExpertOverlayOpen(false)}
                />
            )}

            <ManualModal
                isOpen={showManualModal}
                onClose={() => setShowManualModal(false)}
            />

            <SubscriptionModal
                isOpen={isSubscriptionModalOpen}
                onClose={() => setIsSubscriptionModalOpen(false)}
                currentTier={userTier}
                onSelectTier={(tier) => {
                    handleDataUpdate({
                        ...result,
                        student: {
                            ...result.student,
                            membershipTier: tier
                        }
                    });
                    setIsSubscriptionModalOpen(false);
                }}
                triggerReason={subscriptionReason}
            />
        </Layout >
    );
};
