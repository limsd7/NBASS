import React from 'react';
import { PaywallCTA } from './PaywallCTA';

interface LockedFeatureProps {
  title: string;
  description: string;
  onceLabel?: string;
  monthlyLabel?: string;
  onUpgradeClick?: () => void;
  exhaustedFree?: boolean;
}

/** 요금제 잠금 풀스크린 — 무료/1회권이 기능 탭 진입 시 표시 */
export const LockedFeature: React.FC<LockedFeatureProps> = ({
  title,
  description,
  onceLabel,
  monthlyLabel,
  onUpgradeClick,
  exhaustedFree,
}) => {
  return (
    <div className="p-4 space-y-4 pb-24 max-w-md mx-auto">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs text-center">
        <p className="text-3xl mb-3">🔒</p>
        <h2 className="text-base font-black text-slate-900 mb-1">{title}</h2>
        <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
        {exhaustedFree && (
          <p className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mt-3">
            무료 1회 진단을 사용했습니다. 추가 이용은 아래 이용권을 확인해주세요.
          </p>
        )}
      </div>
      <PaywallCTA
        title={`${title} 이용하기`}
        description="자세한 리포트는 1회권으로, 전체 기능 사용은 정기결제로 열립니다."
        onceLabel={onceLabel}
        monthlyLabel={monthlyLabel}
        onUpgradeClick={onUpgradeClick}
      />
    </div>
  );
};

export default LockedFeature;
