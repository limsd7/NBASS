import React, { useState } from 'react';
import { AuthLoginModal, UserRole } from './modals/AuthLoginModal';

interface RoleSelectionViewProps {
    onSelectRole: (role: UserRole, userEmail?: string, studentName?: string) => void;
    onBackToStudent?: () => void;
    onHomeClick?: () => void;
}

export const RoleSelectionView: React.FC<RoleSelectionViewProps> = ({ onSelectRole, onBackToStudent, onHomeClick }) => {
    const [selectedModalRole, setSelectedModalRole] = useState<UserRole | null>(null);

    const handleCardClick = (role: UserRole) => {
        setSelectedModalRole(role);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
            
            {/* Top Navigation Buttons */}
            <div className="absolute top-6 left-6 z-20 flex items-center gap-3">
                {onHomeClick && (
                    <button
                        onClick={onHomeClick}
                        className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 hover:text-white rounded-xl border border-blue-500/40 hover:border-blue-400 text-xs font-bold transition-all flex items-center gap-2 shadow-lg backdrop-blur-sm"
                        title="홈페이지 인트로로 이동"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span>🏠 홈페이지 인트로</span>
                    </button>
                )}
                {onBackToStudent && (
                    <button
                        onClick={onBackToStudent}
                        className="px-4 py-2 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-800 hover:border-slate-700 text-xs font-bold transition-all flex items-center gap-2 shadow-lg backdrop-blur-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        <span>← 수험생 진단 화면으로 돌아가기</span>
                    </button>
                )}
            </div>

            {/* Background High-Tech Subtle Glow */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b10_1px,transparent_1px),linear-gradient(to_bottom,#1e293b10_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

            <div className="relative z-10 max-w-5xl w-full">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-blue-400 mb-4 shadow-inner">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>🛡️ NBASS 관리자 관제 센터 (Admin Mode)</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-extrabold text-white mt-1 mb-3 tracking-tight">
                    NBASS 관리자 관제 포털
                </h1>
                <p className="text-slate-400 mb-10 text-sm md:text-base font-normal max-w-2xl mx-auto">
                    관리자 인증이 완료되었습니다. 관리하실 모듈 또는 사용자 권한을 선택하시면 해당 시스템으로 즉시 연결됩니다.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 max-w-6xl w-full">
                    
                    {/* 1. Student Directory & Tier Control */}
                    <button 
                        onClick={() => onSelectRole('STUDENT_DIRECTORY')}
                        className="flex flex-col items-center bg-slate-900/90 hover:bg-slate-850 p-6 rounded-2xl border-2 border-blue-500/50 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/20 hover:-translate-y-1 transition-all group text-center relative overflow-hidden"
                    >
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-105 transition-transform">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        </div>
                        <h2 className="text-base font-bold text-white mb-1">수험생 전체 DB</h2>
                        <p className="text-slate-400 text-xs mb-5">전체 자료 열람 &amp; 등급 관제</p>
                        <span className="mt-auto px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all w-full shadow">
                            수험생 통합 DB 열람 →
                        </span>
                    </button>

                    {/* 2. Parent Directory */}
                    <button 
                        onClick={() => onSelectRole('PARENT_DIRECTORY')}
                        className="flex flex-col items-center bg-slate-900/90 hover:bg-slate-850 p-6 rounded-2xl border-2 border-emerald-500/40 hover:border-emerald-400 hover:shadow-xl hover:shadow-emerald-500/20 hover:-translate-y-1 transition-all group text-center relative overflow-hidden"
                    >
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-105 transition-transform">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        </div>
                        <h2 className="text-base font-bold text-white mb-1">학부모 전체 DB</h2>
                        <p className="text-slate-400 text-xs mb-5">자녀 연계 &amp; 주간 알림 관제</p>
                        <span className="mt-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all w-full shadow">
                            학부모 통합 DB 열람 →
                        </span>
                    </button>

                    {/* 3. Medical Expert (Owner Preview) */}
                    <button 
                        onClick={() => onSelectRole('MEDICAL_EXPERT')}
                        className="flex flex-col items-center bg-slate-900/90 hover:bg-slate-850 p-6 rounded-2xl border-2 border-indigo-500/40 hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-500/20 hover:-translate-y-1 transition-all group text-center relative overflow-hidden"
                    >
                        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-105 transition-transform">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
                        </div>
                        <h2 className="text-base font-bold text-white mb-1">의료전문가 관제</h2>
                        <p className="text-slate-400 text-xs mb-5">임상 바이오데이터 &amp; 처방</p>
                        <span className="mt-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all w-full shadow">
                            의료 관제 (프리뷰) →
                        </span>
                    </button>

                    {/* 4. Academy Expert (Owner Preview) */}
                    <button 
                        onClick={() => onSelectRole('ACADEMY_EXPERT')}
                        className="flex flex-col items-center bg-slate-900/90 hover:bg-slate-850 p-6 rounded-2xl border-2 border-cyan-500/40 hover:border-cyan-400 hover:shadow-xl hover:shadow-cyan-500/20 hover:-translate-y-1 transition-all group text-center relative overflow-hidden"
                    >
                        <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-105 transition-transform">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>
                        </div>
                        <h2 className="text-base font-bold text-white mb-1">학원·컨설턴트</h2>
                        <p className="text-slate-400 text-xs mb-5">원생 학습 모니터링 &amp; 상담</p>
                        <span className="mt-auto px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl transition-all w-full shadow">
                            학원 관제 (프리뷰) →
                        </span>
                    </button>

                    {/* 5. Solopreneur Owner */}
                    <button 
                        onClick={() => onSelectRole('OWNER')}
                        className="flex flex-col items-center bg-slate-900/90 hover:bg-slate-850 p-6 rounded-2xl border-2 border-amber-500/40 hover:border-amber-400 hover:shadow-xl hover:shadow-amber-500/20 hover:-translate-y-1 transition-all group text-center relative overflow-hidden"
                    >
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-105 transition-transform">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </div>
                        <h2 className="text-base font-bold text-white mb-1">오너 총괄 관제</h2>
                        <p className="text-slate-400 text-xs mb-5">전문가 계정 발급 &amp; AI 마케팅</p>
                        <span className="mt-auto px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition-all w-full shadow">
                            오너 관제 센터 진입 →
                        </span>
                    </button>

                </div>
            </div>

            {/* Auth / Password Modal */}
            {selectedModalRole && (
                <AuthLoginModal
                    isOpen={!!selectedModalRole}
                    targetRole={selectedModalRole}
                    onClose={() => setSelectedModalRole(null)}
                    onSuccess={(role, email, _studentId, studentName) => {
                        setSelectedModalRole(null);
                        onSelectRole(role, email, studentName);
                    }}
                />
            )}

        </div>
    );
};
