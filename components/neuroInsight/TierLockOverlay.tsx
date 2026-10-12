import React from 'react';

export interface TierLockOverlayProps {
    requiredTier: 'pro' | 'premium';
    title: string;
    description?: string;
    onUnlockClick?: () => void;
}

export const TierLockOverlay: React.FC<TierLockOverlayProps> = ({ requiredTier, title, description, onUnlockClick }) => {
    const tierBadge = requiredTier === 'pro'
        ? { name: 'PRO', bg: 'from-blue-600 to-indigo-600', text: 'PRO 등급 이상' }
        : { name: 'PREMIUM', bg: 'from-purple-600 to-indigo-600', text: 'PREMIUM 등급 이상' };

    return (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl text-center">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${tierBadge.bg} text-white flex items-center justify-center text-xl shadow-lg mb-3 animate-pulse`}>
                🔒
            </div>
            <div className={`inline-block px-3 py-1 rounded-full text-[11px] font-black text-white bg-gradient-to-r ${tierBadge.bg} shadow-sm mb-2`}>
                {tierBadge.text} 잠금 기능
            </div>
            <h4 className="text-base font-black text-white drop-shadow-sm mb-1">{title}</h4>
            {description && <p className="text-xs text-slate-200 font-medium max-w-md mb-4 leading-relaxed">{description}</p>}
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (onUnlockClick) onUnlockClick();
                }}
                className={`px-5 py-2.5 rounded-xl font-black text-xs text-white bg-gradient-to-r ${tierBadge.bg} hover:brightness-110 shadow-lg transition-all transform hover:scale-105 flex items-center gap-2 cursor-pointer`}
            >
                <span>⚡ 지금 잠금 해제하기</span>
                <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-bold">업그레이드</span>
            </button>
        </div>
    );
};