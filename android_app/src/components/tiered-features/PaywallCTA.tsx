import React from 'react';

interface PaywallCTAProps {
  title: string;
  description: string;
  onUpgradeClick?: () => void;
  onceLabel?: string;
  monthlyLabel?: string;
}

/** 무료 모드 결제 유도 CTA — 1회 이용권 / 월 정기권 2버튼 (결제 연동 전, 안내로 연결) */
export const PaywallCTA: React.FC<PaywallCTAProps> = ({
  title,
  description,
  onUpgradeClick,
  onceLabel = 'PRO 1회 이용권(₩24,900)으로 열람',
  monthlyLabel = '월 정기권(₩19,900)으로 열람',
}) => {
  return (
    <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200 text-center">
      <p className="text-xs font-black text-slate-900 mb-1">🔒 {title}</p>
      <p className="text-[11px] text-slate-600 mb-3 leading-relaxed">{description}</p>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onUpgradeClick}
          className="py-2.5 px-2 rounded-xl bg-indigo-600 text-white text-[11px] font-black active:scale-95 transition"
        >
          {onceLabel}
        </button>
        <button
          onClick={onUpgradeClick}
          className="py-2.5 px-2 rounded-xl bg-white border border-indigo-300 text-indigo-700 text-[11px] font-black active:scale-95 transition"
        >
          {monthlyLabel}
        </button>
      </div>
      <p className="text-[10px] text-slate-400 mt-2">* 온라인 결제는 준비 중이며, 버튼을 누르면 업그레이드 안내로 연결됩니다</p>
    </div>
  );
};

export default PaywallCTA;
