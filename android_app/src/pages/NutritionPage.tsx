import React, { useState } from 'react';
import { UserProfile, NutritionProduct } from '../types';
import { MOCK_NUTRITION_PRODUCTS } from '../services/mockData';
import { hasRequiredTier } from '../services/featureGate';
import { LockedCard } from '../components/tiered-features/LockedCard';
import { Coffee, Sparkles, ExternalLink, Clock, Droplets, Flame, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface NutritionPageProps {
  user: UserProfile;
  onUpgradeClick: () => void;
}

export const NutritionPage: React.FC<NutritionPageProps> = ({ user, onUpgradeClick }) => {
  const isProOrAbove = hasRequiredTier(user.tier, 'pro');
  const isPremiumOrAbove = hasRequiredTier(user.tier, 'premium');
  const isPlusOrAbove = hasRequiredTier(user.tier, 'premium_plus');

  const hlCoffee = MOCK_NUTRITION_PRODUCTS.find(p => p.isHlCoffee)!;
  const coreProduct = MOCK_NUTRITION_PRODUCTS.find(p => p.tier === 'ESSENTIAL')!;
  const recProduct = MOCK_NUTRITION_PRODUCTS.find(p => p.tier === 'RECOMMENDED')!;
  const supProduct = MOCK_NUTRITION_PRODUCTS.find(p => p.tier === 'SUPPORTIVE')!;

  const [showHlModal, setShowHlModal] = useState(false);

  return (
    <div className="p-4 space-y-4 pb-20 max-w-md mx-auto">
      {/* Header */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 mb-1 text-xs font-bold text-amber-600">
          <Coffee className="w-4 h-4" />
          <span>두뇌 혈류 &amp; 1:1 맞춤 뉴로 영양 처방</span>
        </div>
        <h2 className="text-xl font-black text-slate-900">영양 &amp; HL COFFEE</h2>
        <p className="text-xs text-slate-500 mt-1">
          신경계 회복과 전두엽 에너지 대사를 위한 과학적 처방 라인업입니다.
        </p>
      </div>

      {/* ☕ 1. HL COFFEE 스마트 부스터 (FREE부터 100% 전면 무료 개방!) */}
      <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-white p-5 rounded-3xl shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="px-2.5 py-0.5 rounded-full bg-black/20 backdrop-blur-xs text-white text-[10px] font-black border border-white/20 flex items-center gap-1">
            <span>☕</span>
            <span>전 회원 무료 지원</span>
          </span>
          <span className="text-[10px] font-bold bg-white text-amber-800 px-2 py-0.5 rounded-full shadow-xs">
            ⚡ 뇌혈류 NO 부스터
          </span>
        </div>

        <h3 className="text-lg font-black leading-tight mt-1">
          {hlCoffee.name}
        </h3>
        <p className="text-xs text-amber-100 font-bold mt-1">
          아르기닌 2,600mg · 카르니틴 1,200mg · 시트룰린 · 마일드 카페인
        </p>
        <p className="text-[11px] text-amber-100/90 mt-2 leading-relaxed">
          산화질소(NO)로 뇌 모세혈관을 확장해 산소 공급을 극대화하고, 아데노신 피로를 씻어내는 수험생 전용 스마트 아메리카노입니다.
        </p>

        {/* Action Button */}
        <div className="mt-4 pt-3 border-t border-white/20 flex items-center gap-2">
          <button
            onClick={() => setShowHlModal(true)}
            className="flex-1 py-2 px-3 rounded-xl bg-white text-slate-950 font-black text-xs shadow-md active:scale-95 transition"
          >
            복용 골든타임 &amp; 가이드 보기
          </button>
          <a
            href={hlCoffee.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-black/20 hover:bg-black/30 text-white transition active:scale-95"
            title="공식몰 바로가기"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* 2. 3-Tier 맞춤 영양제 라인업 */}
      <div className="space-y-3">
        <h3 className="text-sm font-black text-slate-900 px-1 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>신경계 케어타입별 맞춤 영양 처방</span>
        </h3>

        {/* 🔴 핵심 영양제 (PRO 이상) */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-rose-600 flex items-center gap-1">
              <span>🔴</span> <span>핵심 영양제 (1순위 시급)</span>
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-50 text-rose-700 rounded-md">
              PRO 개방
            </span>
          </div>

          {isProOrAbove ? (
            <div>
              <p className="text-sm font-bold text-slate-900">{coreProduct.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">{coreProduct.subName}</p>
              <div className="mt-2.5 p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-700 space-y-1 border border-slate-100">
                <p>⏱️ <strong>복용:</strong> {coreProduct.timing} ({coreProduct.dosageMethod})</p>
                <p>🧪 <strong>주성분:</strong> {coreProduct.mainIngredients.join(', ')}</p>
              </div>
            </div>
          ) : (
            <LockedCard
              requiredTier="pro"
              featureTitle="핵심 영양제 세부 처방 잠금"
              description="케어타입 시급성 1순위 핵심 영양제 세부 복용법은 PRO 등급부터 제공됩니다."
              onUpgradeClick={onUpgradeClick}
            />
          )}
        </div>

        {/* 🟡 추천 영양제 (PREMIUM 이상) */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-amber-600 flex items-center gap-1">
              <span>🟡</span> <span>추천 영양제 (집중/시너지)</span>
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md">
              PREMIUM 개방
            </span>
          </div>

          {isPremiumOrAbove ? (
            <div>
              <p className="text-sm font-bold text-slate-900">{recProduct.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">{recProduct.subName}</p>
              <div className="mt-2.5 p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-700 space-y-1 border border-slate-100">
                <p>⏱️ <strong>복용:</strong> {recProduct.timing} ({recProduct.dosageMethod})</p>
                <p>🧪 <strong>주성분:</strong> {recProduct.mainIngredients.join(', ')}</p>
              </div>
            </div>
          ) : (
            <LockedCard
              requiredTier="premium"
              featureTitle="추천 영양제 3-Tier 세트 잠금"
              description="긴장 완화 및 숙면 시너지를 내는 추천 영양제는 PREMIUM 등급부터 확인 가능합니다."
              onUpgradeClick={onUpgradeClick}
            />
          )}
        </div>

        {/* 🟢 보조 영양제 (PREMIUM+ 이상) */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-emerald-600 flex items-center gap-1">
              <span>🟢</span> <span>보조 영양제 (체력/세포막)</span>
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md">
              PREMIUM+ 개방
            </span>
          </div>

          {isPlusOrAbove ? (
            <div>
              <p className="text-sm font-bold text-slate-900">{supProduct.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">{supProduct.subName}</p>
              <div className="mt-2.5 p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-700 space-y-1 border border-slate-100">
                <p>⏱️ <strong>복용:</strong> {supProduct.timing} ({supProduct.dosageMethod})</p>
                <p>🧪 <strong>주성분:</strong> {supProduct.mainIngredients.join(', ')}</p>
              </div>
            </div>
          ) : (
            <LockedCard
              requiredTier="premium_plus"
              featureTitle="생체신호 연동 보조 영양제 잠금"
              description="해마 장기기억 고착용 보조 영양제는 PREMIUM+ 등급에서 개방됩니다."
              onUpgradeClick={onUpgradeClick}
            />
          )}
        </div>
      </div>

      {/* HL Coffee Modal Guide */}
      {showHlModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-black text-amber-700 flex items-center gap-1">
                <span>☕</span> <span>HL COFFEE 맞춤 복용 가이드</span>
              </span>
              <button
                onClick={() => setShowHlModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mt-3 space-y-3 text-xs">
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200">
                <p className="font-bold text-amber-900 flex items-center gap-1 mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>골든타임: 언제 마시나요?</span>
                </p>
                <p className="text-slate-700 leading-snug">
                  아침 기상 직후(07:00~08:30) 또는 오전 공부 시작 30분 전 <strong>공복</strong>에 음용하세요. 밤 수면을 위해 <strong>오후 2시 이전</strong>에 마시는 것이 좋습니다.
                </p>
              </div>

              <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200">
                <p className="font-bold text-blue-900 flex items-center gap-1 mb-1">
                  <Droplets className="w-3.5 h-3.5" />
                  <span>음용법: 500ml 이상 시원한 물 희석</span>
                </p>
                <p className="text-slate-700 leading-snug">
                  1포를 <strong>냉수 또는 미온수 500ml 이상</strong>에 타서 연하게 드세요. 아이스티처럼 깔끔하게 마실 수 있습니다.
                  <br />
                  <strong className="text-rose-600">⚠️ 60℃ 이상 뜨거운 물은 유효성분이 파괴되므로 피하세요.</strong>
                </p>
              </div>

              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                <p className="font-bold text-emerald-900 flex items-center gap-1 mb-1">
                  <Flame className="w-3.5 h-3.5" />
                  <span>수험생 효과: 저자극 각성 &amp; 체지방 분해</span>
                </p>
                <p className="text-slate-700 leading-snug">
                  두근거림 없는 청정 각성과 함께 장시간 좌식 생활 중 체지방 연소를 촉진합니다.
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
    </div>
  );
};
