import React from 'react';
import { Lock, Sparkles, ChevronRight } from 'lucide-react';
import { MembershipTier } from '../../types';
import { TIER_NAMES } from '../../services/featureGate';

interface LockedCardProps {
  requiredTier: MembershipTier;
  featureTitle: string;
  description: string;
  onUpgradeClick?: () => void;
}

export const LockedCard: React.FC<LockedCardProps> = ({
  requiredTier,
  featureTitle,
  description,
  onUpgradeClick,
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-5 text-white shadow-md my-4">
      <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 rounded-full bg-indigo-500/20 blur-2xl pointer-events-none" />
      
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
          <Lock className="w-4 h-4" />
        </div>
        <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-black border border-amber-400/30">
          {TIER_NAMES[requiredTier]} 전용
        </span>
      </div>

      <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-1.5">
        <span>{featureTitle}</span>
      </h4>
      <p className="text-xs text-slate-300 leading-relaxed mb-4">
        {description}
      </p>

      {onUpgradeClick && (
        <button
          onClick={onUpgradeClick}
          className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-98 transition"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>등급 업그레이드하고 기능 열기</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
