import React, { useState } from 'react';
import { UserProfile, MembershipTier } from '../../types';
import { TIER_BADGE_STYLES, TIER_NAMES } from '../../services/featureGate';
import { authService } from '../../services/authService';
import { MOCK_NUTRITION_PRODUCTS } from '../../services/mockData';
import { Coffee, Award, Sparkles, ExternalLink, Clock, Droplets, Flame, Check, X } from 'lucide-react';

interface HeaderProps {
  user: UserProfile;
  onUserUpdated: (user: UserProfile) => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onUserUpdated }) => {
  const [showHlModal, setShowHlModal] = useState(false);
  const [showTierModal, setShowTierModal] = useState(false);
  const hlCoffee = MOCK_NUTRITION_PRODUCTS.find(p => p.isHlCoffee)!;
  const tiers: MembershipTier[] = ['free', 'pro', 'premium', 'premium_plus', 'vip', 'expert'];

  const handleTierChange = (newTier: MembershipTier) => {
    const updated = authService.updateTier(newTier);
    onUserUpdated(updated);
    setShowTierModal(false);
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-3 py-2.5 flex items-center justify-between shadow-xs">
        {/* Left: Brand */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-sm">
            N
          </div>
          <div>
            <h1 className="text-xs font-black tracking-tight text-slate-900 leading-none">NBASS Mobile</h1>
            <p className="text-[9px] text-slate-400 font-medium mt-0.5">MindBody Connect</p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          {/* ☕ HL Coffee Quick Button */}
          <button
            onClick={() => setShowHlModal(true)}
            className="px-2 py-1 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-800 text-[10px] font-black flex items-center gap-1 transition active:scale-95"
          >
            <span>☕</span>
            <span>HL 커피</span>
          </button>

          {/* User & Tier Badge */}
          <button
            onClick={() => setShowTierModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-slate-200 hover:bg-slate-50 transition active:scale-95"
          >
            <span className="text-[11px] font-bold text-slate-800">{user.name}</span>
            <span className={`text-[8.5px] font-black px-1.5 py-0.2 rounded-full border ${TIER_BADGE_STYLES[user.tier]}`}>
              {TIER_NAMES[user.tier].split(' ')[0]}
            </span>
          </button>
        </div>
      </header>

      {/* ☕ HL Coffee Modal */}
      {showHlModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
              <span className="text-xs font-black text-amber-700 flex items-center gap-1">
                <span>☕</span> <span>HL COFFEE 두뇌 혈류 처방 가이드</span>
              </span>
              <button onClick={() => setShowHlModal(false)} className="text-slate-400 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl text-white mb-3">
              <span className="text-[10px] font-bold bg-white text-amber-800 px-2 py-0.5 rounded-full shadow-xs">
                전 회원 무료 지원
              </span>
              <h4 className="text-sm font-black mt-1">{hlCoffee.name}</h4>
              <p className="text-[10px] text-amber-100 mt-0.5 font-bold">
                아르기닌 2,600mg · 카르니틴 1,200mg · 시트룰린 · 마일드 카페인
              </p>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200">
                <p className="font-bold text-amber-900 flex items-center gap-1 mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>골든타임: 언제 마시나요?</span>
                </p>
                <p className="text-slate-700 leading-snug text-[11px]">
                  아침 기상 직후(07:00~08:30) 또는 오전 공부 시작 30분 전 <strong>공복</strong>에 음용하세요. 밤 수면을 위해 <strong>오후 2시 이전</strong> 섭취를 완료하세요.
                </p>
              </div>

              <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200">
                <p className="font-bold text-blue-900 flex items-center gap-1 mb-1">
                  <Droplets className="w-3.5 h-3.5" />
                  <span>희석법: 500ml 이상 시원한 물 필수</span>
                </p>
                <p className="text-slate-700 leading-snug text-[11px]">
                  1포를 <strong>냉수 500ml 이상</strong>에 타서 연하게 아이스티처럼 마십니다.
                  <br />
                  <strong className="text-rose-600">⚠️ 60℃ 이상 뜨거운 물은 유효성분이 파괴되므로 피하세요.</strong>
                </p>
              </div>

              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                <p className="font-bold text-emerald-900 flex items-center gap-1 mb-1">
                  <Flame className="w-3.5 h-3.5" />
                  <span>수험생 효과: 저자극 각성 &amp; 체지방 분해</span>
                </p>
                <p className="text-slate-700 leading-snug text-[11px]">
                  두근거림 없는 맑은 각성과 함께 장시간 좌식 생활 중 체지방 대사를 돕습니다.
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
              <button
                onClick={() => setShowHlModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs"
              >
                닫기
              </button>
              <a
                href={hlCoffee.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs text-center shadow-xs flex items-center justify-center gap-1"
              >
                <span>공식몰 가기</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 👑 Tier Switcher Modal */}
      {showTierModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
              <span className="text-xs font-black text-indigo-700 flex items-center gap-1">
                <Award className="w-4 h-4 text-indigo-600" />
                <span>멤버십 등급 전환 시뮬레이터</span>
              </span>
              <button onClick={() => setShowTierModal(false)} className="text-slate-400 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              원하는 등급을 선택하면 앱의 모든 권한이 즉시 전환됩니다.
            </p>

            <div className="grid grid-cols-2 gap-2">
              {tiers.map((t) => {
                const isSelected = user.tier === t;
                return (
                  <button
                    key={t}
                    onClick={() => handleTierChange(t)}
                    className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition flex items-center justify-between active:scale-95 ${
                      isSelected
                        ? 'bg-indigo-600 text-white font-black shadow-md'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    <span>{t.toUpperCase()}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
