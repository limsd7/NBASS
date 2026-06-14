import React from 'react';
import { StudentInfo, AssessmentResult } from '../../types';
import { BalanceChart } from '../Charts';

interface ParentDashboardProps {
    studentName: string;
    recentResult: AssessmentResult | null;
    onViewReport: () => void;
    onLogout: () => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({ studentName, recentResult, onViewReport, onLogout }) => {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <header className="bg-indigo-600 text-white p-4 flex justify-between items-center shadow-md">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">👨‍👩‍👧‍👦</span>
                    <h1 className="font-bold text-xl">학부모 대시보드</h1>
                </div>
                <button onClick={onLogout} className="text-indigo-200 hover:text-white transition-colors text-sm">
                    로그아웃
                </button>
            </header>

            <main className="flex-1 p-6 max-w-4xl mx-auto w-full">
                <div className="mb-8">
                    <h2 className="text-2xl font-black text-slate-800">환영합니다!</h2>
                    <p className="text-slate-500 mt-1">우리 아이 <strong>{studentName}</strong>의 최신 상태를 확인하세요.</p>
                </div>

                {recentResult ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                                <span className="text-xl">🩺</span> 최신 진단 결과 요약
                            </h3>
                            <div className="text-sm text-slate-600 mb-2">검사일: {new Date(recentResult.student.testDate).toLocaleDateString('ko-KR')}</div>
                            <div className="text-3xl font-black text-indigo-600 mb-4">{recentResult.careType}</div>
                            <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-3">
                                {recentResult.analysisText.split('\n')[0] || '최근 진단에 따른 맞춤형 처방 가이드가 준비되어 있습니다.'}
                            </p>
                            <button 
                                onClick={onViewReport}
                                className="w-full py-3 bg-indigo-50 text-indigo-700 font-bold rounded-xl hover:bg-indigo-100 transition-colors"
                            >
                                상세 리포트 보기
                            </button>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                                <span className="text-xl">📊</span> 자율신경 밸런스
                            </h3>
                            <div className="h-48 w-full flex items-center justify-center">
                                <BalanceChart pns={recentResult.hrv.pns} sns={recentResult.hrv.sns} />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200 text-center">
                        <span className="text-5xl mb-4 block">📭</span>
                        <h3 className="text-xl font-bold text-slate-700 mb-2">아직 검사 기록이 없습니다</h3>
                        <p className="text-slate-500">자녀의 검사가 완료되면 이곳에서 결과를 확인할 수 있습니다.</p>
                    </div>
                )}
            </main>
        </div>
    );
};
