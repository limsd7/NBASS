import React from 'react';
import { MembershipBadge } from '../ui/MembershipBadge';
import { MembershipTier } from '../../utils/featureGate';

interface AppEmptyStateProps {
    activeMenu: string;
    effectiveTier: MembershipTier;
    onStart: () => void;
    onShowLicense: () => void;
}

export const AppEmptyState: React.FC<AppEmptyStateProps> = ({
    activeMenu,
    effectiveTier,
    onStart,
    onShowLicense,
}) => {
    return (
        <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20 pt-6 text-center">
            <div className="bg-white dark:bg-slate-800 p-8 sm:p-12 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-950/60 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 shadow-inner">
                    📊
                </div>
                <div className="flex items-center justify-center gap-3 mb-2 flex-wrap">
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                        {activeMenu === 'results' ? '최근 종합진단 결과가 없습니다' : 'NBASS 종합진단평가'}
                    </h2>
                    <MembershipBadge tier={effectiveTier} size="md" onClick={onShowLicense} />
                </div>
                <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto text-sm leading-relaxed">
                    {activeMenu === 'results'
                        ? '아직 완료된 검사 결과가 없습니다. 먼저 종합진단검사를 진행하시면 정밀 뉴로 인사이트 리포트와 솔루션 가이드가 생성됩니다.'
                        : '새로운 종합진단을 시작하여 나만의 맞춤 멘탈 케어와 학습 전략을 확인하세요.'}
                </p>
                <button
                    onClick={onStart}
                    className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-black rounded-2xl hover:brightness-110 transition-all shadow-lg shadow-indigo-600/20 active:scale-95 flex items-center justify-center gap-2 mx-auto"
                >
                    <span>📝</span>
                    <span>종합진단검사 시작하기</span>
                </button>
            </div>
        </div>
    );
};
