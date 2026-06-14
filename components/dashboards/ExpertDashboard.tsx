import React, { useState } from 'react';
import { AssessmentResult } from '../../types';

interface ExpertDashboardProps {
    history: AssessmentResult[];
    onStartNewAssessment: () => void;
    onViewReport: (result: AssessmentResult) => void;
    onLogout: () => void;
}

export const ExpertDashboard: React.FC<ExpertDashboardProps> = ({ history, onStartNewAssessment, onViewReport, onLogout }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredHistory = history.filter(h => 
        h.student.name.includes(searchTerm) || 
        h.careType.includes(searchTerm)
    );

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <header className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-md">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">👩‍⚕️</span>
                    <h1 className="font-bold text-xl">전문가 대시보드</h1>
                </div>
                <button onClick={onLogout} className="text-slate-400 hover:text-white transition-colors text-sm">
                    로그아웃
                </button>
            </header>

            <main className="flex-1 p-6 max-w-6xl mx-auto w-full flex flex-col md:flex-row gap-6">
                
                {/* Left Sidebar - Actions */}
                <div className="w-full md:w-64 space-y-4">
                    <button 
                        onClick={onStartNewAssessment}
                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
                    >
                        <span>📝</span> 신규 검사 시작
                    </button>
                    
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-slate-700 mb-2">통계 요약</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-500">총 검사 건수</span>
                                <span className="font-bold text-slate-800">{history.length}건</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">주의 필요 환자</span>
                                <span className="font-bold text-rose-600">
                                    {history.filter(h => h.careType.includes('DEFICIT') || h.careType.includes('FATIGUE')).length}명
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Content - Patient List */}
                <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h2 className="font-bold text-slate-800">환자 검사 이력</h2>
                        <input 
                            type="text" 
                            placeholder="이름 또는 Care Type 검색..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                        />
                    </div>
                    <div className="p-0 overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500 font-medium">
                                <tr>
                                    <th className="p-4 border-b border-slate-100">검사일</th>
                                    <th className="p-4 border-b border-slate-100">이름</th>
                                    <th className="p-4 border-b border-slate-100">나이/성별</th>
                                    <th className="p-4 border-b border-slate-100">진단결과 (Care Type)</th>
                                    <th className="p-4 border-b border-slate-100">액션</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredHistory.length > 0 ? filteredHistory.map((record, i) => (
                                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4 text-slate-600">{new Date(record.student.testDate).toLocaleDateString('ko-KR')}</td>
                                        <td className="p-4 font-bold text-slate-800">{record.student.name}</td>
                                        <td className="p-4 text-slate-500">{record.student.age}세 / {record.student.gender === 'Male' ? '남' : '여'}</td>
                                        <td className="p-4">
                                            <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-bold">
                                                {record.careType}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <button 
                                                onClick={() => onViewReport(record)}
                                                className="text-indigo-600 hover:text-indigo-800 font-medium text-xs border border-indigo-200 hover:bg-indigo-50 px-3 py-1.5 rounded"
                                            >
                                                리포트 보기
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-slate-400">검색 결과가 없거나 이력이 없습니다.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </main>
        </div>
    );
};
