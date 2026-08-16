import React, { useState } from 'react';
import { AuthLoginModal, UserRole } from './modals/AuthLoginModal';

interface RoleSelectionViewProps {
    onSelectRole: (role: UserRole, userEmail?: string) => void;
}

export const RoleSelectionView: React.FC<RoleSelectionViewProps> = ({ onSelectRole }) => {
    const [selectedModalRole, setSelectedModalRole] = useState<UserRole | null>(null);

    const handleCardClick = (role: UserRole) => {
        setSelectedModalRole(role);
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
            
            {/* Background Glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-5xl w-full">
                <span className="px-3.5 py-1 text-xs font-bold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    NBASS Secure Access Portal
                </span>
                <h1 className="text-3xl md:text-5xl font-black text-white mt-4 mb-2 tracking-tight">
                    NBASS 인지·생체 진단 & 운영 포털
                </h1>
                <p className="text-slate-400 mb-12 text-sm md:text-base">
                    이용하실 사용자 권한을 선택하시면 보안 로그인 / 인증 창이 열립니다.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl w-full">
                    
                    {/* 1. Student */}
                    <button 
                        onClick={() => handleCardClick('STUDENT')}
                        className="flex flex-col items-center bg-slate-900/90 p-6 rounded-3xl border border-slate-800 hover:border-indigo-500 hover:bg-slate-800/80 transition-all group text-center shadow-lg"
                    >
                        <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">👦</span>
                        <h2 className="text-lg font-bold text-white mb-1">학생 본인</h2>
                        <p className="text-slate-400 text-xs mb-4">정밀 인지·생체 진단</p>
                        <span className="mt-auto px-3 py-1 bg-indigo-600/20 text-indigo-400 text-[11px] font-bold rounded-lg border border-indigo-500/30">
                            학생 로그인 ➔
                        </span>
                    </button>

                    {/* 2. Parent */}
                    <button 
                        onClick={() => handleCardClick('PARENT')}
                        className="flex flex-col items-center bg-slate-900/90 p-6 rounded-3xl border border-slate-800 hover:border-emerald-500 hover:bg-slate-800/80 transition-all group text-center shadow-lg"
                    >
                        <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">👨‍👩‍👧‍👦</span>
                        <h2 className="text-lg font-bold text-white mb-1">학부모</h2>
                        <p className="text-slate-400 text-xs mb-4">자녀 진단 및 주간 알림</p>
                        <span className="mt-auto px-3 py-1 bg-emerald-600/20 text-emerald-400 text-[11px] font-bold rounded-lg border border-emerald-500/30">
                            학부모 로그인 ➔
                        </span>
                    </button>

                    {/* 3. Expert */}
                    <button 
                        onClick={() => handleCardClick('EXPERT')}
                        className="flex flex-col items-center bg-slate-900/90 p-6 rounded-3xl border border-slate-800 hover:border-blue-500 hover:bg-slate-800/80 transition-all group text-center shadow-lg"
                    >
                        <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">👩‍⚕️</span>
                        <h2 className="text-lg font-bold text-white mb-1">전문가</h2>
                        <p className="text-slate-400 text-xs mb-4">임상 분석 및 정밀 처방</p>
                        <span className="mt-auto px-3 py-1 bg-blue-600/20 text-blue-400 text-[11px] font-bold rounded-lg border border-blue-500/30">
                            전문가 로그인 ➔
                        </span>
                    </button>

                    {/* 4. Solopreneur Owner */}
                    <button 
                        onClick={() => handleCardClick('OWNER')}
                        className="flex flex-col items-center bg-gradient-to-b from-indigo-950/80 to-slate-900 p-6 rounded-3xl border-2 border-indigo-500/60 hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-500/20 transition-all group text-center"
                    >
                        <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">🚀</span>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                          <h2 className="text-lg font-black text-indigo-300">오너 AI 관제</h2>
                        </div>
                        <p className="text-slate-400 text-xs mb-4">24h 자동화 & 1일 1h 피드백</p>
                        <span className="mt-auto px-3 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[11px] font-black rounded-lg shadow-md shadow-indigo-900/30">
                            🔒 보안 인증 접속 ➔
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
                    onSuccess={(role, email) => {
                        setSelectedModalRole(null);
                        onSelectRole(role, email);
                    }}
                />
            )}

        </div>
    );
};
