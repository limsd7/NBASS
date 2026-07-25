import React, { useEffect, useState } from 'react';
import { MembershipTier } from '../../utils/featureGate';

interface LicenseExpiryBannerProps {
    daysRemaining: number;
    tier: MembershipTier;
    onRenew?: () => void;
}

export const LicenseExpiryBanner: React.FC<LicenseExpiryBannerProps> = ({ daysRemaining, tier, onRenew }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger slide down animation after mount
        const timer = setTimeout(() => setIsVisible(true), 50);
        return () => clearTimeout(timer);
    }, []);

    if (daysRemaining > 7) {
        return null;
    }

    const isExpired = daysRemaining <= 0;
    const bgColor = isExpired ? 'bg-red-500' : 'bg-amber-500';
    const message = isExpired 
        ? '🔒 라이선스가 만료되었습니다. 일부 기능이 제한됩니다.' 
        : `⏰ 라이선스 만료 ${daysRemaining}일 전 — 갱신하세요`;
    const btnText = isExpired ? '지금 갱신' : '갱신하기';

    return (
        <div 
            className={`sticky top-0 z-50 w-full ${bgColor} text-white px-4 py-2 transition-all duration-300 ease-in-out transform ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'} shadow-md`}
        >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="font-bold text-[13px]">{message}</div>
                <button 
                    onClick={onRenew}
                    className="ml-4 px-3 py-1 bg-white text-slate-800 text-xs font-bold rounded hover:bg-slate-100 transition-colors shadow-sm"
                >
                    {btnText}
                </button>
            </div>
        </div>
    );
};
