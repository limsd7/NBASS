import React, { useState } from 'react';
import { MembershipTier, TIER_INFO } from '../../utils/featureGate';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier?: MembershipTier;
  onSelectTier: (tier: MembershipTier) => void;
  triggerReason?: string;
  initialTier?: MembershipTier;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  currentTier = 'free',
  onSelectTier,
  triggerReason,
  initialTier
}) => {
  const [selectedTier, setSelectedTier] = useState<MembershipTier>(() => {
    if (initialTier) return initialTier;
    if (triggerReason && triggerReason.includes('VIP')) return 'vip';
    if (triggerReason && triggerReason.includes('PREMIUM PLUS')) return 'premium_plus';
    if (triggerReason && triggerReason.includes('PREMIUM')) return 'premium';
    if (triggerReason && triggerReason.includes('PRO')) return 'pro';
    return 'premium';
  });
  const [isProcessing, setIsProcessing] = useState(false);

  React.useEffect(() => {
    if (initialTier) {
      setSelectedTier(initialTier);
    } else if (triggerReason && triggerReason.includes('VIP')) {
      setSelectedTier('vip');
    } else if (triggerReason && triggerReason.includes('PREMIUM PLUS')) {
      setSelectedTier('premium_plus');
    } else if (triggerReason && triggerReason.includes('PREMIUM')) {
      setSelectedTier('premium');
    } else if (triggerReason && triggerReason.includes('PRO')) {
      setSelectedTier('pro');
    }
  }, [isOpen, initialTier, triggerReason]);

  if (!isOpen) return null;

  const handleCheckout = (tier: MembershipTier) => {
    setIsProcessing(true);
    // Simulating Toss Payments / Supabase checkout flow
    setTimeout(() => {
      setIsProcessing(false);
      onSelectTier(tier);
      alert(`🎉 [${TIER_INFO[tier].name}] 신청/결제가 완료되었습니다!`);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-5xl w-full p-6 md:p-8 shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors"
        >
          ✕
        </button>

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            NBASS 학부모 & 수험생 멤버십
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-3">
            우리 아이 맞춤 학습 처방 리포트 열람하기
          </h2>
          {triggerReason ? (
            <p className="text-sm text-amber-400 mt-2 font-medium bg-amber-500/10 py-1.5 px-4 rounded-xl inline-block border border-amber-500/20">
              🔒 {triggerReason}
            </p>
          ) : (
            <p className="text-sm text-slate-400 mt-2">
              1회 건당 열람(₩9,000)부터 카카오톡 주간 알림 케어(월 ₩9,900)까지 선택하세요.
            </p>
          )}
        </div>

        {/* Pricing Cards Grid (PRO / PREMIUM / PREMIUM_PLUS / VIP) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          
          {/* 1. PRO (1회 스타터 패스 ₩9,000) */}
          <div 
            onClick={() => setSelectedTier('pro')}
            className={`rounded-2xl p-5 border transition-all flex flex-col justify-between cursor-pointer ${
            selectedTier === 'pro'
              ? 'bg-slate-800/90 border-blue-500 shadow-lg shadow-blue-500/10 scale-[1.01]'
              : 'bg-slate-950 border-slate-800 hover:border-slate-700'
          }`}>
            <div>
              <div className="flex justify-between items-start mb-3">
                <span className="text-2xl">⚡</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {TIER_INFO.pro.badge}
                </span>
              </div>
              <h3 className="text-base font-bold text-white">{TIER_INFO.pro.name}</h3>
              <p className="text-[11px] text-slate-400 mt-1 min-h-[30px]">{TIER_INFO.pro.description}</p>
              
              <div className="mt-3 mb-4">
                <span className="text-xl font-black text-white">{TIER_INFO.pro.price}</span>
                <span className="text-[10px] text-slate-400 ml-1">/ 1회 열람</span>
              </div>

              <div className="space-y-2 text-[11px] text-slate-300">
                {TIER_INFO.pro.highlightFeatures.map((feat, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <span className="text-blue-400 font-bold shrink-0">✓</span>
                    <span className="line-clamp-2">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCheckout('pro');
              }}
              disabled={isProcessing}
              className="mt-5 w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-900/20"
            >
              {TIER_INFO.pro.ctaText}
            </button>
          </div>

          {/* 2. PREMIUM (월 ₩9,900 - MOST POPULAR) */}
          <div 
            onClick={() => setSelectedTier('premium')}
            className={`rounded-2xl p-5 border-2 transition-all flex flex-col justify-between relative cursor-pointer ${
            selectedTier === 'premium'
              ? 'bg-gradient-to-b from-indigo-950/60 to-slate-900 border-indigo-500 shadow-xl shadow-indigo-500/20 scale-[1.02]'
              : 'bg-slate-950 border-slate-800 hover:border-slate-700'
          }`}>
            {selectedTier === 'premium' && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] font-black px-3 py-0.5 rounded-full shadow-lg whitespace-nowrap">
                🔥 최다 선택 (단 900원 차이!)
              </div>
            )}

            <div>
              <div className="flex justify-between items-start mb-3 mt-1">
                <span className="text-2xl">💎</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {TIER_INFO.premium.badge}
                </span>
              </div>
              <h3 className="text-base font-bold text-white">{TIER_INFO.premium.name}</h3>
              <p className="text-[11px] text-slate-400 mt-1 min-h-[30px]">{TIER_INFO.premium.description}</p>
              
              <div className="mt-3 mb-4">
                <span className="text-2xl font-black text-indigo-400">{TIER_INFO.premium.price}</span>
                <span className="text-[10px] text-slate-400 ml-1">/ 정기 케어</span>
              </div>

              <div className="space-y-2 text-[11px] text-slate-200">
                {TIER_INFO.premium.highlightFeatures.slice(0, 5).map((feat, i) => (
                  <div key={i} className="flex items-start gap-1.5 font-medium">
                    <span className="text-indigo-400 font-bold shrink-0">✓</span>
                    <span className="line-clamp-2">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCheckout('premium');
              }}
              disabled={isProcessing}
              className="mt-5 w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-extrabold rounded-xl transition-all shadow-lg shadow-indigo-900/30"
            >
              {TIER_INFO.premium.ctaText}
            </button>
          </div>

          {/* 3. PREMIUM PLUS (월 ₩19,900 - AI CLINIC & 14P MEDICAL BOOK) */}
          <div 
            onClick={() => setSelectedTier('premium_plus')}
            className={`rounded-2xl p-5 border-2 transition-all flex flex-col justify-between relative cursor-pointer ${
            selectedTier === 'premium_plus'
              ? 'bg-gradient-to-b from-purple-950/70 to-slate-900 border-purple-500 shadow-xl shadow-purple-500/25 scale-[1.02]'
              : 'bg-slate-950 border-purple-900/50 hover:border-purple-500/50'
          }`}>
            {selectedTier === 'premium_plus' && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-black px-3 py-0.5 rounded-full shadow-lg whitespace-nowrap">
                ✨ 1:1 AI 클리닉 추천
              </div>
            )}

            <div>
              <div className="flex justify-between items-start mb-3 mt-1">
                <span className="text-2xl">✨</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {TIER_INFO.premium_plus.badge}
                </span>
              </div>
              <h3 className="text-base font-bold text-white">{TIER_INFO.premium_plus.name}</h3>
              <p className="text-[11px] text-slate-400 mt-1 min-h-[30px]">{TIER_INFO.premium_plus.description}</p>
              
              <div className="mt-3 mb-4">
                <span className="text-2xl font-black text-purple-400">{TIER_INFO.premium_plus.price}</span>
                <span className="text-[10px] text-slate-400 ml-1">/ AI 클리닉</span>
              </div>

              <div className="space-y-2 text-[11px] text-purple-100">
                {TIER_INFO.premium_plus.highlightFeatures.map((feat, i) => (
                  <div key={i} className="flex items-start gap-1.5 font-medium">
                    <span className="text-purple-400 font-bold shrink-0">✓</span>
                    <span className="line-clamp-2">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCheckout('premium_plus');
              }}
              disabled={isProcessing}
              className="mt-5 w-full py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-extrabold rounded-xl transition-all shadow-lg shadow-purple-900/30"
            >
              {TIER_INFO.premium_plus.ctaText}
            </button>
          </div>

          {/* 4. VIP (월 ₩29,900 - 1:1 맞춤형 수면 & 멘탈 & 센서 마스터) */}
          <div 
            onClick={() => setSelectedTier('vip')}
            className={`rounded-2xl p-5 border-2 transition-all flex flex-col justify-between relative cursor-pointer ${
            selectedTier === 'vip'
              ? 'bg-gradient-to-b from-amber-950/70 via-slate-900 to-slate-950 border-amber-500 shadow-xl shadow-amber-500/25 scale-[1.02]'
              : 'bg-slate-950 border-amber-900/40 hover:border-amber-500/50'
          }`}>
            {selectedTier === 'vip' && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 text-[10px] font-black px-3 py-0.5 rounded-full shadow-lg whitespace-nowrap">
                👑 1:1 수면·멘탈 VIP 추천
              </div>
            )}
            <div>
              <div className="flex justify-between items-start mb-3 mt-1">
                <span className="text-2xl">👑</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {TIER_INFO.vip.badge}
                </span>
              </div>
              <h3 className="text-base font-bold text-white">{TIER_INFO.vip.name}</h3>
              <p className="text-[11px] text-slate-400 mt-1 min-h-[30px]">{TIER_INFO.vip.description}</p>
              
              <div className="mt-3 mb-4">
                <span className="text-2xl font-black text-amber-400">{TIER_INFO.vip.price}</span>
                <span className="text-[10px] text-slate-400 ml-1">/ 맞춤 케어</span>
              </div>

              <div className="space-y-2 text-[11px] text-amber-100">
                {TIER_INFO.vip.highlightFeatures.map((feat, i) => (
                  <div key={i} className="flex items-start gap-1.5 font-medium">
                    <span className="text-amber-400 font-bold shrink-0">✓</span>
                    <span className="line-clamp-2">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCheckout('vip');
              }}
              disabled={isProcessing}
              className="mt-5 w-full py-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 text-xs font-black rounded-xl transition-all shadow-lg shadow-amber-900/30"
            >
              {TIER_INFO.vip.ctaText}
            </button>
          </div>

        </div>

        {/* Footer info & Security badge */}
        <div className="pt-4 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <span>🔒 토스페이먼츠 안전 결제 & 언제든 클릭 한 번으로 해지 가능</span>
          <span>문의: support@nbass.io | 24시간 실시간 고객센터 가동 중</span>
        </div>

      </div>
    </div>
  );
};
