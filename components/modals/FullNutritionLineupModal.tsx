import React, { useEffect } from 'react';
import { TargetedNutritionRecommendation } from '../TargetedNutritionRecommendation';
import { RecommendedProduct } from '../../logicEngine';
import { MembershipTier } from '../../utils/featureGate';
import { X, Sparkles, ArrowLeft, ShieldCheck } from 'lucide-react';

export interface FullNutritionLineupModalProps {
    isOpen: boolean;
    onClose: () => void;
    recommendedProducts: RecommendedProduct[];
    membershipTier?: MembershipTier;
    hasBioSignals?: boolean;
    onUpgradeClick?: () => void;
}

export const FullNutritionLineupModal: React.FC<FullNutritionLineupModalProps> = ({
    isOpen,
    onClose,
    recommendedProducts,
    membershipTier = 'free',
    hasBioSignals = false,
    onUpgradeClick
}) => {
    // ESC key closes modal
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 md:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div 
                className="relative w-full max-w-5xl max-h-[92vh] bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Top Accent Line */}
                <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500 w-full shrink-0" />

                {/* Header */}
                <div className="px-6 py-4 bg-white dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                            🔬
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                                    생체신호 연동 1:1 정밀 영양 가이드 (Full Lineup)
                                </h2>
                                <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-black rounded-full border border-emerald-200 dark:border-emerald-700">
                                    인라인 오버레이
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                수험생 맞춤 3-Tier 영양 설계 • Dr.PNT 정품몰 &amp; HL 공식몰 직접 연계
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                        title="모달 닫기 (방금 읽던 리포트 위치로 복귀)"
                    >
                        <X className="w-4 h-4" />
                        <span className="hidden sm:inline">닫기</span>
                    </button>
                </div>

                {/* Scrollable Body */}
                <div className="overflow-y-auto p-4 sm:p-6 space-y-4 flex-1 overscroll-contain">
                    {/* Seamless UX Notice Banner */}
                    <div className="p-3.5 bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 rounded-2xl flex items-center justify-between gap-3 text-xs text-emerald-900 dark:text-emerald-200">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>
                                <strong>화면 스크롤 보호 적용:</strong> 이 창을 닫으시면 읽고 계시던 리포트 본문 위치로 즉시 복귀합니다.
                            </span>
                        </div>
                        <span className="hidden md:inline-block text-[11px] text-emerald-700 dark:text-emerald-300 bg-white/80 dark:bg-slate-800/80 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-700/60 font-semibold">
                            ESC 키로 닫기 가능
                        </span>
                    </div>

                    {/* Full Lineup Component */}
                    <div className="[&>div]:border-0 [&>div]:shadow-none [&>div]:p-0 sm:[&>div]:p-2">
                        <TargetedNutritionRecommendation
                            recommendedProducts={recommendedProducts}
                            membershipTier={membershipTier}
                            hasBioSignals={hasBioSignals}
                            onUpgradeClick={onUpgradeClick}
                        />
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="px-6 py-3.5 bg-white dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Dr.PNT 공식 정품 인증 병원 코드 연동 • HL coffee 공식몰 직접 구매 지원</span>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full sm:w-auto px-5 py-2 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>리포트 본문으로 복귀</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
