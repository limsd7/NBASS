import React, { useState, useEffect } from 'react';
import { AssessmentResult, HRVData, ProtocolData, SurveyData, StudentInfo, LearningAnalyticsData } from '../../types';
import { EditorTab_StudentInfo } from './editor/EditorTab_StudentInfo';
import { EditorTab_HRV } from './editor/EditorTab_HRV';
import { EditorTab_Protocol } from './editor/EditorTab_Protocol';
import { EditorTab_Survey } from './editor/EditorTab_Survey';
import { EditorTab_Analytics } from './editor/EditorTab_Analytics';
import { EditorTab_Medical } from './editor/EditorTab_Medical';
import { EditorTab_StudyEfficiency } from './editor/EditorTab_StudyEfficiency';
import { EditorTab_Cognitive } from './editor/EditorTab_Cognitive';

interface DataEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData: AssessmentResult;
    onSave: (newData: AssessmentResult) => void;
}

export const DataEditorModal: React.FC<DataEditorModalProps> = ({ isOpen, onClose, initialData, onSave }) => {
    const [data, setData] = useState<AssessmentResult | null>(null);
    const [activeTab, setActiveTab] = useState<'info' | 'hrv' | 'protocol' | 'survey' | 'efficiency' | 'analytics' | 'medical' | 'cognitive'>('info');

    useEffect(() => {
        if (isOpen && initialData) {
            setData(JSON.parse(JSON.stringify(initialData)));
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;
    if (!data) return null; // Show nothing until data is loaded

    const handleStudentChange = (field: keyof StudentInfo, value: any) => {
        setData(prev => prev ? ({
            ...prev,
            student: { ...prev.student, [field]: value }
        }) : null);
    };

    const handleHrvChange = (field: keyof HRVData, value: any) => {
        setData(prev => prev ? ({
            ...prev,
            hrv: { ...prev.hrv, [field]: value }
        }) : null);
    };

    const handlePortableHrvChange = (field: string, value: any) => {
        setData(prev => {
            if (!prev || !prev.hrv.portableHrv) return prev;
            return {
                ...prev,
                hrv: {
                    ...prev.hrv,
                    portableHrv: {
                        ...prev.hrv.portableHrv,
                        [field]: value
                    }
                }
            };
        });
    };

    const handleProtocolChange = (field: keyof ProtocolData, value: any) => {
        setData(prev => prev ? ({
            ...prev,
            protocol: { ...prev.protocol, [field]: value }
        }) : null);
    };

    const handleSurveyChange = (field: keyof SurveyData, value: any) => {
        setData(prev => prev ? ({
            ...prev,
            survey: { ...prev.survey, [field]: value }
        }) : null);
    };

    const handleAnalyticsChange = (field: keyof LearningAnalyticsData, value: any) => {
        setData(prev => prev ? ({
            ...prev,
            analytics: { ...prev.analytics, [field]: value }
        }) : null);
    };

    const handleBloodTestChange = (field: string, value: any) => {
        setData(prev => {
            if (!prev || !prev.bloodTest) return prev;
            return {
                ...prev,
                bloodTest: {
                    ...prev.bloodTest,
                    [field]: value
                }
            };
        });
    };

    const handleCognitiveChange = (path: string, value: any) => {
        const [category, field] = path.split('.');
        setData(prev => {
            if (!prev) return null;
            return {
                ...prev,
                cognitiveResults: {
                    ...prev.cognitiveResults,
                    [category]: {
                        ...prev.cognitiveResults?.[category],
                        [field]: value
                    }
                }
            };
        });
    };

    const handleSave = () => {
        if (data) {
            onSave(data);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-6 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-4xl h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-xl">📝</div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Raw Data Editor</h2>
                            <p className="text-xs text-slate-500 font-medium">검사 데이터 직접 수정</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Sidebar Tabs */}
                    <div className="w-48 bg-slate-50 border-r border-slate-100 p-4 shrink-0 overflow-y-auto">
                        <div className="space-y-1">
                            {[
                                { id: 'info', label: 'Student Info', icon: '👤' },
                                { id: 'hrv', label: '자율신경 지표 (ANS)', icon: '💓' },
                                { id: 'medical', label: 'Medical (Blood Test)', icon: '🩺', hidden: !data.bloodTest },
                                { id: 'protocol', label: 'Protocol', icon: '📋' },
                                { id: 'survey', label: 'Surveys', icon: '📝' },
                                { id: 'efficiency', label: 'Study Efficiency', icon: '⚡' },
                                { id: 'cognitive', label: 'Cognitive', icon: '🧩' },
                                { id: 'analytics', label: 'Analytics', icon: '📊' },
                            ].filter(tab => !tab.hidden).map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'text-slate-500 hover:bg-slate-200/50'}`}
                                >
                                    <span>{tab.icon}</span>
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-8 bg-white">
                        {activeTab === 'info' && (
                            <EditorTab_StudentInfo data={data.student} onChange={handleStudentChange} />
                        )}

                        {activeTab === 'hrv' && (
                            <EditorTab_HRV data={data.hrv} onChange={handleHrvChange} onPortableChange={handlePortableHrvChange} />
                        )}

                        {activeTab === 'protocol' && (
                            <EditorTab_Protocol data={data.protocol} onChange={handleProtocolChange} />
                        )}

                        {activeTab === 'survey' && (
                            <EditorTab_Survey data={data.survey} onChange={handleSurveyChange} />
                        )}

                        {activeTab === 'efficiency' && (
                            <EditorTab_StudyEfficiency data={data.survey} onChange={handleSurveyChange} />
                        )}

                        {activeTab === 'analytics' && (
                            <EditorTab_Analytics data={data.analytics} onChange={handleAnalyticsChange} />
                        )}

                        {activeTab === 'medical' && data.bloodTest && (
                            <EditorTab_Medical bloodTest={data.bloodTest} onChange={handleBloodTestChange} />
                        )}

                        {activeTab === 'cognitive' && (
                            <EditorTab_Cognitive data={data.cognitiveResults} onChange={handleCognitiveChange} />
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-slate-200 bg-white flex justify-end gap-3 shrink-0">
                    <button onClick={onClose} className="px-6 py-2.5 rounded-xl text-slate-500 font-bold hover:bg-slate-50 transition-colors text-sm">Cancel</button>
                    <button onClick={handleSave} className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 text-sm">
                        Save Changes & Recalculate
                    </button>
                </div>
            </div>
        </div>
    );
};
