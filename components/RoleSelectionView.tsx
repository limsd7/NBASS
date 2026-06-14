import React from 'react';

interface RoleSelectionViewProps {
    onSelectRole: (role: 'STUDENT' | 'PARENT' | 'EXPERT') => void;
}

export const RoleSelectionView: React.FC<RoleSelectionViewProps> = ({ onSelectRole }) => {
    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
            <h1 className="text-4xl font-black text-white mb-4">NBASS 진단 시스템</h1>
            <p className="text-slate-400 mb-12">사용자 유형을 선택해주세요.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
                
                {/* Student */}
                <button 
                    onClick={() => onSelectRole('STUDENT')}
                    className="flex flex-col items-center bg-slate-800 p-8 rounded-3xl border border-slate-700 hover:border-indigo-500 hover:bg-slate-800/80 transition-all group"
                >
                    <span className="text-6xl mb-6 group-hover:scale-110 transition-transform">👦</span>
                    <h2 className="text-xl font-bold text-white mb-2">학생 본인</h2>
                    <p className="text-slate-400 text-sm">정밀 인지·생체 진단 시작하기</p>
                </button>

                {/* Parent */}
                <button 
                    onClick={() => onSelectRole('PARENT')}
                    className="flex flex-col items-center bg-slate-800 p-8 rounded-3xl border border-slate-700 hover:border-emerald-500 hover:bg-slate-800/80 transition-all group"
                >
                    <span className="text-6xl mb-6 group-hover:scale-110 transition-transform">👨‍👩‍👧‍👦</span>
                    <h2 className="text-xl font-bold text-white mb-2">학부모</h2>
                    <p className="text-slate-400 text-sm">자녀의 진단 이력 및 상태 모니터링</p>
                </button>

                {/* Expert */}
                <button 
                    onClick={() => onSelectRole('EXPERT')}
                    className="flex flex-col items-center bg-slate-800 p-8 rounded-3xl border border-slate-700 hover:border-blue-500 hover:bg-slate-800/80 transition-all group"
                >
                    <span className="text-6xl mb-6 group-hover:scale-110 transition-transform">👩‍⚕️</span>
                    <h2 className="text-xl font-bold text-white mb-2">전문가</h2>
                    <p className="text-slate-400 text-sm">학생별 데이터 분석 및 처방 발급</p>
                </button>

            </div>
        </div>
    );
};
