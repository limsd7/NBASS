import React from 'react';

interface RoleSelectionViewProps {
    onSelectRole: (role: 'STUDENT' | 'PARENT' | 'EXPERT' | 'OWNER') => void;
}

export const RoleSelectionView: React.FC<RoleSelectionViewProps> = ({ onSelectRole }) => {
    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
            <h1 className="text-4xl font-black text-white mb-4">NBASS 진단 & 운영 시스템</h1>
            <p className="text-slate-400 mb-12">사용자 모드를 선택해주세요.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl w-full">
                
                {/* Student */}
                <button 
                    onClick={() => onSelectRole('STUDENT')}
                    className="flex flex-col items-center bg-slate-800 p-6 rounded-3xl border border-slate-700 hover:border-indigo-500 hover:bg-slate-800/80 transition-all group"
                >
                    <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">👦</span>
                    <h2 className="text-lg font-bold text-white mb-1">학생 본인</h2>
                    <p className="text-slate-400 text-xs">정밀 인지·생체 진단</p>
                </button>

                {/* Parent */}
                <button 
                    onClick={() => onSelectRole('PARENT')}
                    className="flex flex-col items-center bg-slate-800 p-6 rounded-3xl border border-slate-700 hover:border-emerald-500 hover:bg-slate-800/80 transition-all group"
                >
                    <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">👨‍👩‍👧‍👦</span>
                    <h2 className="text-lg font-bold text-white mb-1">학부모</h2>
                    <p className="text-slate-400 text-xs">자녀 진단 및 추이</p>
                </button>

                {/* Expert */}
                <button 
                    onClick={() => onSelectRole('EXPERT')}
                    className="flex flex-col items-center bg-slate-800 p-6 rounded-3xl border border-slate-700 hover:border-blue-500 hover:bg-slate-800/80 transition-all group"
                >
                    <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">👩‍⚕️</span>
                    <h2 className="text-lg font-bold text-white mb-1">전문가</h2>
                    <p className="text-slate-400 text-xs">상담 및 정밀 처방</p>
                </button>

                {/* Solopreneur Owner */}
                <button 
                    onClick={() => onSelectRole('OWNER')}
                    className="flex flex-col items-center bg-gradient-to-b from-indigo-950/60 to-slate-800 p-6 rounded-3xl border border-indigo-500/50 hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-500/20 transition-all group"
                >
                    <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">🚀</span>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <h2 className="text-lg font-bold text-indigo-300">오너 AI 관제</h2>
                    </div>
                    <p className="text-slate-400 text-xs">24h 자동화 & 1일 1h 피드백</p>
                </button>

            </div>
        </div>
    );
};
