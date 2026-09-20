import React, { useEffect, useState } from 'react';
import { TrendService, ComprehensiveTrendData } from '../../services/trendEngine';
import { SummaryView, SurveyView, CognitiveView, AcademicView, PastPrescriptionsView, ManageHistoryView } from '../HistoryCharts';
import { AIAssistantPanel } from '../common/AIAssistantPanel';
import { AIModelConfig } from '../../types';

interface HistoryAnalysisModalProps {
    isOpen: boolean;
    onClose: () => void;
    studentName: string;
    studentBirthDate?: string;
    studentId?: string;
    aiModels?: AIModelConfig | null;
}

export const HistoryAnalysisModal: React.FC<HistoryAnalysisModalProps> = ({
    isOpen, onClose, studentName, studentBirthDate, studentId, aiModels
}) => {
    const [activeTab, setActiveTab] = useState<'summary' | 'cognitive' | 'survey' | 'academic' | 'prescriptions' | 'manage'>('summary');
    const [data, setData] = useState<ComprehensiveTrendData | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && (studentName || studentId)) {
            loadData();
        }
    }, [isOpen, studentName, studentId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const processedData = await TrendService.fetchAndProcessStudentHistory(studentName, studentBirthDate, studentId);
            setData(processedData);
        } catch (error) {
            console.error("Failed to load history data", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 w-full max-w-6xl h-[85vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden">

                {/* Header */}
                <div className="p-6 md:p-8 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                    <div>
                        <div className="flex items-center gap-3">
                            <span className="text-2xl sm:text-3xl">📈</span>
                            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                                {studentName} 수험생 성장 이력 분석
                            </h2>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                정기 성장 트래킹
                            </span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
                            누적된 인지 테스트, 심리·기질 설문, 공부 효율 변화 추이를 정밀 분석합니다.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2.5 bg-white dark:bg-slate-800 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm text-slate-500 hover:text-slate-800 font-bold"
                    >
                        ✕
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800 px-3 sm:px-6 bg-white dark:bg-slate-900 scrollbar-thin">
                    {[
                        { id: 'summary', label: '🌟 종합 성장' },
                        { id: 'cognitive', label: '🧠 인지·두뇌' },
                        { id: 'survey', label: '📝 심리·기질' },
                        { id: 'academic', label: '📚 학업·순공' },
                        { id: 'prescriptions', label: '📋 과거 처방' },
                        { id: 'manage', label: '⚙️ 데이터 관리' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 min-w-fit px-3 sm:px-4 py-3.5 font-bold text-xs sm:text-sm transition-all border-b-2 whitespace-nowrap cursor-pointer text-center ${activeTab === tab.id
                                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 font-black bg-blue-50/40 dark:bg-blue-950/20'
                                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/30'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/50 dark:bg-slate-900/50">
                    {loading ? (
                        <div className="h-full flex items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : !data || data.summary.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 py-16 text-center">
                            <span className="text-4xl mb-4">📭</span>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">분석할 과거 검사 데이터가 없습니다</h3>
                            <p className="max-w-md mx-auto mb-4 text-xs sm:text-sm">
                                현재 수험생의 이전 검사 기록이 저장되면 회차별 인지 테스트, 설문 지표, 학업 효율 성장 곡선이 자동으로 시각화됩니다.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                            {activeTab === 'summary' && <SummaryView data={data.summary} />}
                            {activeTab === 'cognitive' && <CognitiveView data={data.cognitive} />}
                            {activeTab === 'survey' && <SurveyView data={data.survey} />}
                            {activeTab === 'academic' && <AcademicView data={data.academic} />}
                            {activeTab === 'prescriptions' && <PastPrescriptionsView rawHistory={data.rawHistory} />}
                            {activeTab === 'manage' && <ManageHistoryView rawHistory={data.rawHistory} onDataChanged={loadData} />}
                            
                            {/* AI Assistant for History Analysis */}
                            {data && (
                                <AIAssistantPanel 
                                    contextData={data}
                                    systemPrompt="당신은 누적된 수험생 데이터를 분석하는 AI 학습 컨설턴트입니다. 학생의 변화 추이(설문 점수, 작업기억력 정답률/반응속도, 순공 효율)와 과거 처방을 바탕으로 긍정적인 성장 포인트와 앞으로 집중해야 할 학습 관리 제안을 3문단으로 명확히 요약해주세요."
                                    aiModels={aiModels || null}
                                    buttonLabel="✨ 누적 데이터 기반 AI 성장 분석 보고서 생성"
                                    membershipTier={data.rawHistory[0]?.student?.membershipTier || 'free'}
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
