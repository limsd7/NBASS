import React from 'react';
import { Layout } from '../../Layout';
import { ConfigModal } from '../../modals/ConfigModal';
import { DataEditorModal } from '../../modals/DataEditorModal';
import { ExpertOverlay } from '../../ExpertOverlay';
import { WellnessPlayer } from '../../WellnessPlayer';
import { NeuroInsightReport } from '../../NeuroInsightReport';
import { AssessmentResult, CareType, StrategyMap, ProtocolData } from '../../../types';
import {
    ResultsHeader,
    MedicalSection,
    SecretPointSection,
    MindPrescriptionCard,
    ExamStrategySection,
    AdminMemoSection
} from './index';
import { MedicalReport } from '../../reports/MedicalReport'; // [NEW] Import Medical Report
import { DIGITAL_DETOX_PROTOCOLS, METACOGNITION_RECOMMENDATIONS } from '../../../data/studyEfficiencyAssessments';
import { AIAssistantPanel } from '../../common/AIAssistantPanel';
import { AIModelConfig } from '../../../types';
import { BrainBodyDashboard } from '../../reports/BrainBodyDashboard';
import { evaluateBrainBodyCoherence } from '../../../services/brainBodyEngine';

interface ResultsStepProps {
    // Result data
    result: AssessmentResult;

    // Navigation
    onNewAssessment: () => void;
    initialProtocol: ProtocolData;
    setStep: (step: string) => void;
    setProtocol: React.Dispatch<React.SetStateAction<ProtocolData>>;
    setIsCustomLoc: React.Dispatch<React.SetStateAction<boolean>>;

    // Layout props
    activeMenu: 'dashboard' | 'assessment' | 'history' | 'progress' | 'resources';
    onMenuChange: (menu: any) => void;
    isDarkMode: boolean;
    onToggleDarkMode: () => void;

    // Config
    config: {
        isMedicalMode: boolean;
        isExamMode: boolean;
        usePortable: boolean;
        useBrainBody: boolean;
        expertModePassword?: string;
    };
    showConfig: boolean;

    // Strategies
    strategies: StrategyMap;

    // Admin modal states
    showAdminPassword: boolean;
    setShowAdminPassword: React.Dispatch<React.SetStateAction<boolean>>;
    adminPasswordInput: string;
    setAdminPasswordInput: React.Dispatch<React.SetStateAction<string>>;
    handleAdminUnlock: () => void;

    // Data editor
    showDataEditor: boolean;
    setShowDataEditor: React.Dispatch<React.SetStateAction<boolean>>;
    handleDataUpdate: (data: AssessmentResult) => void;

    // Study efficiency modal
    showStudyEfficiencyModal: boolean;
    setShowStudyEfficiencyModal: React.Dispatch<React.SetStateAction<boolean>>;
    studyEfficiencyResults: any;
    setStudyEfficiencyResults: React.Dispatch<React.SetStateAction<any>>;

    // Secret point
    showSecretPoint: boolean;
    setShowSecretPoint: React.Dispatch<React.SetStateAction<boolean>>;


    // Admin memo
    adminMemo: string;
    setAdminMemo: React.Dispatch<React.SetStateAction<string>>;
    adminMemos: string[];
    setAdminMemos: React.Dispatch<React.SetStateAction<string[]>>;

    // Subject options
    selectedSubjectOptions: Record<string, string[]>;
    completedItems: string[];
    toggleCompleted: (id: string) => void;

    // AI Models
    aiModels: AIModelConfig | null;
}

export const ResultsStep: React.FC<ResultsStepProps> = ({
    result,
    onNewAssessment,
    initialProtocol,
    setStep,
    setProtocol,
    setIsCustomLoc,
    activeMenu,
    onMenuChange,
    isDarkMode,
    onToggleDarkMode,
    config,
    showConfig,
    strategies,
    showAdminPassword,
    setShowAdminPassword,
    adminPasswordInput,
    setAdminPasswordInput,
    handleAdminUnlock,
    showDataEditor,
    setShowDataEditor,
    handleDataUpdate,
    showStudyEfficiencyModal,
    setShowStudyEfficiencyModal,
    studyEfficiencyResults,
    setStudyEfficiencyResults,
    showSecretPoint,
    setShowSecretPoint,
    adminMemo,
    setAdminMemo,
    adminMemos,
    setAdminMemos,
    selectedSubjectOptions,
    completedItems,
    toggleCompleted,
    aiModels
}) => {
    // Report Mode State (expert vs student)
    const [reportMode, setReportMode] = React.useState<'expert' | 'student'>(
        config.expertModePassword ? 'student' : 'expert'
    );

    const brainBodyState = evaluateBrainBodyCoherence(result.hrv, result.survey, result.careType);

    // Print window handler
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
            // Optional: Give time for styles/fonts to load
            printWindow.focus();
        }
    };

    const handleNewAssessmentLocal = () => {
        setStep('register');
        setProtocol(initialProtocol);
        setIsCustomLoc(false);
    };

    return (
        <Layout
            activeMenu={activeMenu}
            onMenuChange={onMenuChange}
            isDarkMode={isDarkMode}
            onToggleDarkMode={onToggleDarkMode}
            onAdminClick={() => setShowAdminPassword(true)}
        >
            {/* Config Modal */}
            {/* <ConfigModal /> */}

            <div id="report-section" className="space-y-8 animate-in fade-in duration-500 pb-20 relative">
                {/* [NEW] Hidden Medical Report container for Print Logic */}
                <div id="medical-report-container" className="hidden">
                    <MedicalReport result={result} config={config} />
                </div>

                {/* Watermark for Print */}
                <div className="report-watermark hidden print:block">NBASS</div>

                {/* Results Header */}
                <ResultsHeader
                    result={result}
                    config={config}
                    onPrintWindow={handlePrintWindow}
                    onShowDataEditor={() => setShowDataEditor(true)}
                    onShowStudyEfficiencyModal={() => setShowStudyEfficiencyModal(true)}
                    onNewAssessment={handleNewAssessmentLocal}
                    showStudyEfficiencyModal={showStudyEfficiencyModal}
                    reportMode={reportMode}
                    setReportMode={setReportMode}
                />

                {/* Structured Neuro-Insight Report */}
                <NeuroInsightReport
                    analysisText={result.analysisText}
                    classificationResult={result.classificationResult}
                    assessmentResult={result}
                    reportMode={reportMode}
                />

                {/* Brain-Body Dashboard */}
                <div id="section-brain-body" className="mb-8">
                    <BrainBodyDashboard brainBodyState={brainBodyState} careType={result.careType} previousResult={result.previousResult} />
                </div>

                {/* Medical Section */}
                <MedicalSection result={result} config={config} />

                {/* Mind Prescription Card */}
                <MindPrescriptionCard result={result} />

                {/* Secret Point Section */}
                <SecretPointSection
                    result={result}
                    showSecretPoint={showSecretPoint}
                    setShowSecretPoint={setShowSecretPoint}
                />

                {/* Study Efficiency Results Display */}
                {studyEfficiencyResults && Object.keys(studyEfficiencyResults).length > 0 && (
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-3xl p-6 mt-8">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="text-2xl">📊</span>
                            <div>
                                <h3 className="text-xl font-black text-emerald-900">공부 효율성 정밀 검사 결과</h3>
                                <p className="text-xs text-emerald-600 font-bold">Study Efficiency Assessment Results</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Results cards will be rendered here based on studyEfficiencyResults */}
                            {studyEfficiencyResults.digitalAddiction && (
                                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">📱</span>
                                            <div>
                                                <p className="text-xs font-bold text-slate-400 uppercase">Digital Detox</p>
                                                <p className="font-bold text-slate-800">{DIGITAL_DETOX_PROTOCOLS[studyEfficiencyResults.digitalAddiction.level]?.label || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {studyEfficiencyResults.metacognition && (
                                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">🧠</span>
                                            <div>
                                                <p className="text-xs font-bold text-slate-400 uppercase">Metacognition</p>
                                                <p className="font-bold text-slate-800">{METACOGNITION_RECOMMENDATIONS[studyEfficiencyResults.metacognition.learnerLevel]?.label || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Exam Strategy Section */}
                <ExamStrategySection result={result} strategies={strategies} config={config} />

                {/* AI Assistant Panel for Overall Analysis */}
                <AIAssistantPanel 
                    contextData={result}
                    systemPrompt="당신은 뇌파, 심박변이도, 심리설문 결과를 종합 분석하는 NBASS 시스템의 전문 AI입니다. 학생의 상태를 분석하고 학부모가 이해하기 쉽게 3~4문단으로 친절하게 종합 평가를 요약해 주세요."
                    aiModels={aiModels}
                    buttonLabel="✨ 종합 결과 AI 분석하기"
                    membershipTier={result.student?.membershipTier || 'free'}
                />
            </div>

            {/* Expert Overlay */}
            {result && (
                <ExpertOverlay
                    careType={result?.careType}
                    adrenalFatigueScore={result?.survey.adrenalFatigueScore ?? 0}
                    currentData={result}
                    studentId={result?.student?.id}
                />
            )}

            {/* Wellness Player */}
            <WellnessPlayer careType={result.careType} />

            {/* Admin Memo Section */}
            <AdminMemoSection
                adminMemo={adminMemo}
                setAdminMemo={setAdminMemo}
                adminMemos={adminMemos}
                setAdminMemos={setAdminMemos}
            />

            {/* Global Admin Components */}
            {!showConfig && (
                <button
                    onClick={() => setShowAdminPassword(true)}
                    className="fixed bottom-6 left-6 z-50 w-12 h-12 bg-slate-900 text-white rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center print:hidden opacity-30 hover:opacity-100"
                    title="Admin Settings"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                </button>
            )}

            {/* Admin Password Modal */}
            {showAdminPassword && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-xs">
                        <h3 className="font-bold text-lg mb-4 text-slate-800">Admin Access Required</h3>
                        <input
                            type="password"
                            className="w-full p-3 border rounded-xl mb-4 focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="Enter Password"
                            value={adminPasswordInput}
                            onChange={e => setAdminPasswordInput(e.target.value)}
                            autoFocus
                            onKeyDown={e => e.key === 'Enter' && handleAdminUnlock()}
                        />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => { setShowAdminPassword(false); setAdminPasswordInput(''); }} className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-lg">Cancel</button>
                            <button onClick={handleAdminUnlock} className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700">Confirm</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Data Editor Modal */}
            {result && (
                <DataEditorModal
                    isOpen={showDataEditor}
                    onClose={() => setShowDataEditor(false)}
                    initialData={result}
                    onSave={handleDataUpdate}
                />
            )}
        </Layout>
    );
};
