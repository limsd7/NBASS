
import React, { useEffect, useState, useMemo } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    ComposedChart, Area, Bar, BarChart
} from 'recharts';
import { TrendService, ComprehensiveTrendData, TrendDataPoint } from '../../services/trendEngine';
import { AssessmentResult, CareType } from '../../types';

import { SummaryView, SurveyView, HrvView, EegView, PastPrescriptionsView, ManageHistoryView } from '../HistoryCharts';
import { AIAssistantPanel } from '../common/AIAssistantPanel';
import { AIModelConfig } from '../../types';

interface HistoryAnalysisModalProps {
    isOpen: boolean;
    onClose: () => void;
    studentName: string;
    studentBirthDate?: string;
    studentId?: string; // Fallback용 ID
    aiModels?: AIModelConfig | null;
}

export const HistoryAnalysisModal: React.FC<HistoryAnalysisModalProps> = ({
    isOpen, onClose, studentName, studentBirthDate, studentId, aiModels
}) => {
    const [activeTab, setActiveTab] = useState<'summary' | 'survey' | 'hrv' | 'eeg' | 'prescriptions' | 'manage'>('summary');
    const [data, setData] = useState<ComprehensiveTrendData | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        console.log(`[HistoryModal] Open: ${isOpen}, Name: ${studentName}, BirthDate: ${studentBirthDate}, ID: ${studentId}`);
        if (isOpen && (studentName || studentId)) {
            console.log("[HistoryModal] Triggering loadData...");
            loadData();
        } else {
            console.log("[HistoryModal] Not loading data (Missing name/ID or closed)");
        }
    }, [isOpen, studentName]);

    const loadData = async () => {
        setLoading(true);
        try {
            const processedData = await TrendService.fetchAndProcessStudentHistory(studentName, studentBirthDate, studentId);
            console.log(`[HistoryModal] Data loaded:`, processedData);
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
                <div className="p-8 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                            <span className="text-3xl">📈</span>
                            {studentName}님 히스토리 분석
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                            누적된 검사 데이터를 기반으로 변화 추이를 분석합니다.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 bg-white dark:bg-slate-800 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm"
                    >
                        ❌
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-200 dark:border-slate-800 px-8 bg-white dark:bg-slate-900">
                    {['summary', 'survey', 'hrv', 'eeg', 'prescriptions', 'manage'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-6 py-4 font-bold text-sm transition-all border-b-2 ${activeTab === tab
                                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
                                }`}
                        >
                            {tab === 'summary' && '종합 분석 (Score)'}
                            {tab === 'survey' && '설문 변화 (Psychology)'}
                            {tab === 'hrv' && 'Clinical Biometrics (HRV)'}
                            {tab === 'eeg' && 'EEG Biometrics'}
                            {tab === 'prescriptions' && '과거 처방 내역'}
                            {tab === 'manage' && '데이터 관리 (Manage)'}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50 dark:bg-slate-900/50">
                    {loading ? (
                        <div className="h-full flex items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : !data || data.summary.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 py-20 text-center">
                            <span className="text-4xl mb-4">📭</span>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">분석할 과거 데이터가 부족합니다</h3>
                            <p className="max-w-md mx-auto mb-6">
                                이전 검사 기록이 없거나, 이름/생년월일 정보가 일치하지 않아 트렌드를 분석할 수 없습니다.
                            </p>

                            {/* Diagnostic Info (Debug Mode) */}
                            <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-2xl text-left text-xs font-mono text-slate-600 dark:text-slate-400 mb-4 w-full max-w-lg border border-slate-200 dark:border-slate-700 shadow-inner">
                                <p className="font-bold text-red-500 mb-3 flex items-center gap-2">
                                    <span className="text-lg">🔍</span> [데이터 진단 분석기]
                                </p>
                                <div className="space-y-1.5 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                                    <p><span className="text-blue-500">▶ Name:</span> "{studentName}"</p>
                                    <p><span className="text-blue-500">▶ BirthDate:</span> "{studentBirthDate || 'N/A'}"</p>
                                    <p><span className="text-blue-500">▶ ID:</span> "{studentId || 'N/A'}"</p>
                                    <p><span className="text-red-500">▶ Records Found:</span> 0</p>
                                </div>
                                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
                                    <button
                                        onClick={async () => {
                                            const { DatabaseService } = await import('../../services/database');
                                            const dbRecords = await DatabaseService.getAllHistory();
                                            const names = dbRecords.map(r => `"${r.student.name}"`).join(', ');
                                            alert(`[DB 레포트]\n\n• 총 기록 수: ${dbRecords.length}\n• DB 내 학생 이름들: ${names || '없음'}\n\n콘솔(F12)에서 상세 데이터를 확인하세요.`);
                                            console.log("Full DB Data:", dbRecords);
                                        }}
                                        className="w-full py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                                    >
                                        📡 DB 데이터 무결성 검사
                                    </button>
                                    <button
                                        onClick={() => {
                                            const mockData: ComprehensiveTrendData = {
                                                summary: [
                                                    { date: '1/1', timestamp: Date.now() - 2000000, score: 70, careType: CareType.BURNOUT },
                                                    { date: '1/10', timestamp: Date.now() - 1000000, score: 85, careType: CareType.HEALTHY }
                                                ],
                                                survey: [], hrv: [], eeg: [], rawHistory: []
                                            };
                                            setData(mockData);
                                            alert("임시 데이터를 로드했습니다. 차트가 나타나는지 확인해주세요.");
                                        }}
                                        className="w-full py-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl font-bold hover:bg-blue-100 transition-all"
                                    >
                                        🧪 테스트 데이터로 차트 강제 호출
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                            {activeTab === 'summary' && <SummaryView data={data.summary} />}
                            {activeTab === 'survey' && <SurveyView data={data.survey} />}
                            {activeTab === 'hrv' && <HrvView data={data.hrv} />}
                            {activeTab === 'eeg' && <EegView data={data.eeg} />}
                            {activeTab === 'prescriptions' && <PastPrescriptionsView rawHistory={data.rawHistory} />}
                            {activeTab === 'manage' && <ManageHistoryView rawHistory={data.rawHistory} onDataChanged={loadData} />}
                            
                            {/* AI Assistant for History Analysis */}
                            {data && (
                                <AIAssistantPanel 
                                    contextData={data}
                                    systemPrompt="당신은 누적된 히스토리 데이터를 분석하는 AI입니다. 학생의 변화 추이(설문, HRV, EEG)와 과거 처방을 바탕으로 긍정적인 변화나 주의해야 할 점을 3문단으로 요약해주세요."
                                    aiModels={aiModels || null}
                                    buttonLabel="✨ 누적 데이터 통합 AI 분석"
                                    membershipTier={data.rawHistory[0]?.student?.membershipTier || 'standard'}
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
