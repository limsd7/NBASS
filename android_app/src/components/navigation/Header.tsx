import React, { useState } from 'react';
import { UserProfile, MembershipTier } from '../../types';
import { TIER_BADGE_STYLES, TIER_NAMES, TIER_PRICES } from '../../services/featureGate';
import { authService } from '../../services/authService';
import { dataSyncService } from '../../services/dataSyncService';
import { MOCK_NUTRITION_PRODUCTS } from '../../services/mockData';
import { Coffee, Award, Sparkles, ExternalLink, Clock, Droplets, Flame, Check, X, RefreshCw, LogOut } from 'lucide-react';

interface HeaderProps {
  user: UserProfile;
  onUserUpdated: (user: UserProfile) => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onUserUpdated, onLogout }) => {
  const [showHlModal, setShowHlModal] = useState(false);
  const [showTierModal, setShowTierModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const hlCoffee = MOCK_NUTRITION_PRODUCTS.find(p => p.isHlCoffee)!;
  const tiers: MembershipTier[] = ['free', 'pro', 'premium', 'premium_plus', 'vip', 'expert'];

  // 등급 변경은 PC 오너 승인(실시간 동기화)으로만 적용됩니다. 앱에서는 안내만 표시합니다.

  const handleManualSync = async () => {
    setIsSyncing(true);
    await dataSyncService.syncAllFromCloud(user.studentId);
    setTimeout(() => setIsSyncing(false), 600);
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-3 py-2.5 flex items-center justify-between shadow-xs select-none">
        {/* Left: Brand */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-sm">
            N
          </div>
          <div>
            <h1 className="text-xs font-black tracking-tight text-slate-900 leading-none">NBASS Mobile</h1>
            <p className="text-[9px] text-slate-400 font-medium mt-0.5">Mind-Body Connect</p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          {/* Cloud Sync Button */}
          <button
            onClick={handleManualSync}
            title="PC 클라우드 데이터 동기화"
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-indigo-600' : ''}`} />
          </button>

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

          {onLogout && (
            <button
              onClick={onLogout}
              title="로그아웃"
              className="p-1.5 rounded-full hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
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
                  고농도 아르기닌과 시트룰린의 흡수를 극대화하기 위해 <strong>시원한 물 500ml 이상</strong>에 타서 천천히 마십니다.
                </p>
              </div>
              <p className="text-[10px] leading-relaxed text-slate-500 bg-slate-50 rounded-xl px-3 py-2 border border-slate-200">
                ※ 건강기능식품은 질병의 진단·치료 목적이 아니며, 안내 내용은 도움을 줄 수 있음 수준입니다. (전문가 검수 진행 중)
              </p>
              {hlCoffee.url && (
                <button
                  onClick={() => window.open(hlCoffee.url, '_blank', 'noopener')}
                  className="w-full py-2.5 rounded-xl bg-amber-500 text-white text-xs font-black flex items-center justify-center gap-1.5 active:scale-95 transition"
                >
                  <span>공식몰에서 보기 (외부 사이트)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
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
              현재 등급이，请选择 아래 이용권 안내를 확인하세요. 등급 변경은 PC 오너 승인 후 실시간으로 적용됩니다.
            </p>

            <div className="space-y-2">
              {tiers.map((t) => {
                const isSelected = user.tier === t;
                const priceInfo = TIER_PRICES[t];
                return (
                  <div
                    key={t}
                    className={`w-full p-3 rounded-2xl text-left flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-slate-50 text-slate-800 border border-slate-200'
                    }`}
                  >
                    <div className="flex-1 pr-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-black">{TIER_NAMES[t]}</span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-black ${isSelected ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'}`}>
                          {priceInfo.billing}
                        </span>
                      </div>
                      <p className={`text-[10px] mt-1 line-clamp-1 ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
                        {priceInfo.desc}
                      </p>
                    </div>
                    {isSelected && <Check className="w-4 h-4 shrink-0 stroke-[3]" />}
                  </div>
                );
              })}
            </div>

            <p className="text-[10px] text-slate-400 mt-3 leading-relaxed">
              온라인 결제는 준비 중입니다. 1회권·정기권 이용을 원하시면 PC 오너에게 등급 승인을 요청하세요.
            </p>
          </div>
        </div>
      )}
    </>
  );
};
