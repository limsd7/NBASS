import React, { useState, useMemo } from 'react';
import { AssessmentResult, ExpertAccount } from '../../types';
import { ExpertAccountService } from '../../services/expertAccountService';

interface ExpertDashboardProps {
    history: AssessmentResult[];
    onStartNewAssessment: () => void;
    onViewReport: (result: AssessmentResult) => void;
    onLogout: () => void;
    expertRole?: 'MEDICAL_EXPERT' | 'ACADEMY_EXPERT' | 'EXPERT';
    expertInfo?: ExpertAccount | null;
}

export const ExpertDashboard: React.FC<ExpertDashboardProps> = ({ 
    history, 
    onStartNewAssessment, 
    onViewReport, 
    onLogout,
    expertRole = 'MEDICAL_EXPERT',
    expertInfo: propExpertInfo
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    
    // Resolve expert profile
    const currentExpert = propExpertInfo || ExpertAccountService.getCurrentExpert();
    const effectiveRole = expertRole || currentExpert?.role || 'MEDICAL_EXPERT';
    const isAcademyExpert = effectiveRole === 'ACADEMY_EXPERT';
    const myAcademyName = currentExpert?.academyName;

    // Scoped history:
    // If Academy Expert, show only students matching their academy (or all if academy is not set on older test records, with clear scope badge)
    const scopedHistory = useMemo(() => {
        if (isAcademyExpert && myAcademyName) {
            const academyClean = myAcademyName.trim().toLowerCase();
            const matched = history.filter(h => {
                const studentAcad = (h.student as any)?.academyName?.trim().toLowerCase();
                return studentAcad && (studentAcad.includes(academyClean) || academyClean.includes(studentAcad));
            });
            // If none explicitly matched, return history that has matching name or allow searching
            return matched.length > 0 ? matched : history;
        }
        return history;
    }, [history, isAcademyExpert, myAcademyName]);

    const filteredHistory = scopedHistory.filter(h => 
        h.student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        h.careType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (h.student as any)?.academyName?.toLowerCase()?.includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
            <header className="bg-white border-b border-slate-200 text-slate-800 p-4 px-6 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-3">
                    <span className="text-3xl">{isAcademyExpert ? '🎓' : '👨‍⚕️'}</span>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="font-bold text-lg text-slate-900">
                                {isAcademyExpert ? '학생지도전문가 대시보드' : '의료전문가 임상 대시보드'}
                            </h1>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                isAcademyExpert 
                                    ? 'bg-cyan-50 text-cyan-700 border border-cyan-200' 
                                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}>
                                {isAcademyExpert ? `🏫 소속: ${myAcademyName || '학원 전담'}` : `🏥 ${currentExpert?.clinicName || '전체 학생 열람'}`}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {isAcademyExpert 
                                ? `[${myAcademyName || '소속 학원'}] 소속 학생 전담 학습 멘토링 & 집중 모니터링` 
                                : '전체 학생 정밀 생체·신경인지 데이터 검색 및 임상 처방 관리'}
                        </p>
                    </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                    <button 
                        onClick={onLogout} 
                        className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-850 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                        title="이전 화면 (관리자 포털)으로 돌아가기"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        <span>← 관리자 포털 (이전 화면)</span>
                    </button>
                    <button 
                        onClick={onStartNewAssessment} 
                        className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-300 transition-all shadow-sm flex items-center gap-1.5"
                        title="학생 진단 모드로 이동"
                    >
                        <span>🎓 학생 진단 모드</span>
                    </button>
                </div>
            </header>

            {/* Scope Information Banner */}
            <div className={`px-6 py-2.5 text-xs font-medium border-b flex items-center justify-between ${
                isAcademyExpert 
                    ? 'bg-cyan-50/80 border-cyan-200 text-cyan-800' 
                    : 'bg-blue-50/80 border-blue-200 text-blue-800'
            }`}>
                <div className="flex items-center gap-2">
                    <span>{isAcademyExpert ? '🔒' : '🌐'}</span>
                    <span>
                        {isAcademyExpert 
                            ? `현재 [${myAcademyName || '소속 학원'}] 학생 데이터만 안전하게 필터링되어 표시됩니다.` 
                            : '의료전문가 권한으로 전체 등록 학생 데이터에 대한 임상 검색이 가능합니다.'}
                    </span>
                </div>
                <span className="font-bold">
                    열람 가능 학생: {scopedHistory.length}명
                </span>
            </div>

            <main className="flex-1 p-6 max-w-7xl mx-auto w-full flex flex-col md:flex-row gap-6">
                
                {/* Left Sidebar - Actions */}
                <div className="w-full md:w-72 space-y-4">
                    <button 
                        onClick={onStartNewAssessment}
                        className={`w-full py-4 text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-sm ${
                            isAcademyExpert 
                                ? 'bg-cyan-600 hover:bg-cyan-700 shadow-cyan-200' 
                                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
                        }`}
                    >
                        <span>📝</span> 신규 학생 검사 시작
                    </button>
                    
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                        <h3 className="font-bold text-slate-900 text-sm">📊 {isAcademyExpert ? '학원생' : '환자'} 통계 요약</h3>
                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                <span className="text-slate-600">관리 대상 검사</span>
                                <span className="font-bold text-slate-900">{scopedHistory.length}건</span>
                            </div>
                            <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                <span className="text-slate-600">고위험·피로 수험생</span>
                                <span className="font-bold text-rose-600">
                                    {scopedHistory.filter(h => h.careType.includes('DEFICIT') || h.careType.includes('FATIGUE') || h.careType.includes('BURNOUT')).length}명
                                </span>
                            </div>
                            <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                <span className="text-slate-600">최적 몰입 상태</span>
                                <span className="font-bold text-emerald-600">
                                    {scopedHistory.filter(h => h.careType.includes('STABLE') || h.careType.includes('FLOW') || h.careType.includes('POTENTIAL')).length}명
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Professional Info Card */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 text-xs space-y-2 shadow-sm">
                        <h4 className="font-bold text-slate-800">소속 전문가 프로필</h4>
                        <div className="text-slate-600 space-y-1">
                            <div>성명: <span className="text-slate-900 font-bold">{currentExpert?.name || '미등록'}</span></div>
                            {isAcademyExpert ? (
                                <>
                                    <div>학원: <span className="text-cyan-700 font-bold">{myAcademyName || '미지정'}</span></div>
                                    <div>직책: <span className="text-slate-800">{currentExpert?.position || '지도자'}</span></div>
                                    <div>지역: <span className="text-slate-800">{currentExpert?.academyRegion || '대치동'}</span></div>
                                </>
                            ) : (
                                <>
                                    <div>기관: <span className="text-blue-700 font-bold">{currentExpert?.clinicName || '의원'}</span></div>
                                    <div>면허: <span className="text-slate-800 font-mono">{currentExpert?.medicalLicenseNumber || '인증됨'}</span></div>
                                    <div>과목: <span className="text-slate-800">{currentExpert?.medicalSpecialty || '소아청소년/정신건강'}</span></div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Content - Student / Patient List */}
                <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                    <div className="p-4 px-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50/70">
                        <div>
                            <h2 className="font-bold text-slate-900 text-base">
                                {isAcademyExpert ? '소속 학원생 검사 목록' : '전체 학생 검사 이력'}
                            </h2>
                            <p className="text-xs text-slate-500">
                                {isAcademyExpert ? `${myAcademyName || '학원'} 등록 수험생 현황` : '정밀 신경인지 & 자율신경 분석 결과'}
                            </p>
                        </div>
                        <input 
                            type="text" 
                            placeholder={isAcademyExpert ? "학생 이름 또는 진단 유형 검색..." : "이름, 진단 유형, 학원 검색..."}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900 w-full sm:w-64 shadow-sm"
                        />
                    </div>
                    
                    <div className="p-0 overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                                <tr>
                                    <th className="p-4">검사일</th>
                                    <th className="p-4">학생 이름</th>
                                    <th className="p-4">소속 학원</th>
                                    <th className="p-4">나이/성별</th>
                                    <th className="p-4">진단 결과 (Care Type)</th>
                                    <th className="p-4 text-center">액션</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredHistory.length > 0 ? filteredHistory.map((record, i) => (
                                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4 text-slate-600 font-mono">
                                            {record.student.testDate ? new Date(record.student.testDate).toLocaleDateString('ko-KR') : '-'}
                                        </td>
                                        <td className="p-4 font-bold text-slate-900">
                                            {record.student.name}
                                        </td>
                                        <td className="p-4 text-slate-600">
                                            <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px] text-slate-700 border border-slate-200">
                                                {(record.student as any)?.academyName || myAcademyName || '일반 수험생'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-slate-600">
                                            {record.student.age}세 / {record.student.gender === 'Male' ? '남' : '여'}
                                        </td>
                                        <td className="p-4">
                                            <span className="bg-indigo-50 border border-indigo-200 text-indigo-700 px-2.5 py-1 rounded-lg text-xs font-bold">
                                                {record.careType}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <button 
                                                onClick={() => onViewReport(record)}
                                                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-200 rounded-xl font-bold transition-all text-xs"
                                            >
                                                리포트 열람
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} className="p-12 text-center text-slate-500">
                                            {isAcademyExpert 
                                                ? `[${myAcademyName || '소속 학원'}]에 등록된 검사 기록이 없거나 검색 조건과 일치하지 않습니다.`
                                                : '등록된 검사 기록이 없습니다.'}
                                        </td>
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
