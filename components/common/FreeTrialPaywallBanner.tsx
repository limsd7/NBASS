import React from 'react';
import { getFreeTrialStatus, requestUpgradePrompt } from '../../services/freeTrialGate';

interface FreeTrialPaywallBannerProps {
    className?: string;
    /** 커스텀 업그레이드 핸들러 (미지정 시 전역 업그레이드 이벤트 발생) */
    onUpgrade?: () => void;
}

/**
 * 무료 진단(1회) 사용 후 정밀 검사 업그레이드를 유도하는 소프트 페이월 배너.
 * - 무료체험을 1회 사용한 뒤에만 노출됩니다(그 전에는 아무것도 렌더하지 않음).
 * - 기존 UI를 변경하지 않고 "추가"만 합니다.
 */
export const FreeTrialPaywallBanner: React.FC<FreeTrialPaywallBannerProps> = ({ className, onUpgrade }) => {
    const status = getFreeTrialStatus();
    if (!status.used) return null;

    const handleUpgrade = () => {
        if (onUpgrade) onUpgrade();
        else requestUpgradePrompt();
    };

    return (
        <div
            role="status"
            className={`rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 flex flex-wrap items-center gap-3 ${className || ''}`}
        >
            <span className="text-lg">🔒</span>
            <div className="flex-1 min-w-[200px]">
                <p className="text-xs font-black text-amber-800">3분 무료 진단은 1회 제공됩니다.</p>
                <p className="text-[11px] text-amber-700 mt-0.5">
                    정밀 종합 검사(Pro/Premium)로 심층 리포트 · 성장 추이 · 주간 케어를 확인하세요.
                </p>
            </div>
            <button
                onClick={handleUpgrade}
                className="text-[11px] font-bold bg-amber-600 text-white px-3 py-1.5 rounded-lg hover:bg-amber-700 transition-colors"
            >
                정밀 검사 업그레이드 →
            </button>
        </div>
    );
};