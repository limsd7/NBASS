import React, { useState } from 'react';
import { PNT_PRODUCTS, PntProduct } from '../data/pntProducts';
import { RecommendedProduct } from '../logicEngine';
import { MembershipTier } from '../utils/featureGate';
import { Lock, Sparkles, CheckCircle2, ChevronDown, ChevronUp, ExternalLink, Clock, Flame, Droplets, AlertTriangle, Activity } from 'lucide-react';

interface Props {
    recommendedProducts: RecommendedProduct[];
    isPremiumOrAbove?: boolean;
    membershipTier?: MembershipTier;
    hasBioSignals?: boolean;
    onUpgradeClick?: () => void;
}

export const TargetedNutritionRecommendation: React.FC<Props> = ({ 
    recommendedProducts, 
    membershipTier = 'free',
    hasBioSignals = false,
    onUpgradeClick 
}) => {
    const tier = membershipTier || 'free';
    const isFree = tier === 'free';
    const isPro = tier === 'pro';
    const isPremium = tier === 'premium';
    const isPremiumPlusOrAbove = tier === 'premium_plus' || tier === 'vip' || tier === 'expert';

    // 팝업 상태 관리 (HL 부스터 전용 맞춤 복용 가이드 모달)
    const [selectedHlModal, setSelectedHlModal] = useState<boolean>(false);

    // Group products by tier
    const rawEssential = recommendedProducts.filter(p => p.tier === 'ESSENTIAL').map(p => ({ ...p, ...PNT_PRODUCTS[p.productId] })).filter(p => p.name && p.id !== 'HL-COFFEE-001');
    const rawRecommended = recommendedProducts.filter(p => p.tier === 'RECOMMENDED').map(p => ({ ...p, ...PNT_PRODUCTS[p.productId] })).filter(p => p.name && p.id !== 'HL-COFFEE-001');
    const rawSupportive = recommendedProducts.filter(p => p.tier === 'SUPPORTIVE').map(p => ({ ...p, ...PNT_PRODUCTS[p.productId] })).filter(p => p.name && p.id !== 'HL-COFFEE-001');

    // ☕ HL 스마트 아르기닌-카르니틴 부스터 객체 (항상 핵심 영양제의 마지막에 위치)
    const hlProduct = { productId: 'hl_focus_booster', tier: 'ESSENTIAL' as const, ...PNT_PRODUCTS['hl_focus_booster'] };

    // 🔴 핵심 영양제: 기존 핵심 영양제들 + 마지막에 HL 커피 부스터 배치
    const essentialList = [...rawEssential, hlProduct];
    const recommendedList = rawRecommended;
    const supportiveList = rawSupportive;

    // 차등 추천 개수 계산:
    // 1. FREE (무료): HL 스마트 커피 부스터 1종은 무료부터 전체 회원에게 100% 개방 & 추천! (나머지 잠금 배너)
    // 2. PRO: 🔴 핵심 영양제 전체 (기존 핵심 1종 + HL 부스터)
    // 3. PREMIUM / PLUS+: 🔴 핵심 + 🟡 추천 + 🟢 보조 영양제 최대 3종 추천 (깔끔한 3열 그리드)
    const visibleProducts = {
        ESSENTIAL: isFree ? [hlProduct] : (isPremiumPlusOrAbove ? essentialList : [essentialList[0], hlProduct].filter((v, i, a) => a.findIndex(t => t.id === v.id) === i)),
        RECOMMENDED: isFree || isPro ? [] : (isPremiumPlusOrAbove ? recommendedList : recommendedList.slice(0, 2)),
        SUPPORTIVE: isFree || isPro ? [] : supportiveList.slice(0, 3),
    };

    const handleProductClick = (product: PntProduct) => {
        if (product.id === 'HL-COFFEE-001') {
            setSelectedHlModal(true);
        } else if (product.url) {
            window.open(product.url, '_blank');
        }
    };

    return (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm print-page-break print-avoid-break relative overflow-hidden">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-7 bg-emerald-500 rounded-full shrink-0"></div>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-xl font-bold text-slate-900">
                                {isPremiumPlusOrAbove 
                                    ? '생체신호 연동 1:1 정밀 영양제 처방 (Full Lineup)' 
                                    : isPremium 
                                    ? '두뇌 활력 3-Tier 기본 맞춤 영양제 (3-Tier Balanced)' 
                                    : isPro 
                                    ? '두뇌 활력 1순위 핵심 영양제 처방 (Core Essential)' 
                                    : '두뇌 활력 1:1 맞춤 영양제 & 뇌혈류 부스터 추천'}
                            </h3>
                            {isPremiumPlusOrAbove ? (
                                <span className="px-2.5 py-0.5 bg-fuchsia-100 text-fuchsia-800 border border-fuchsia-200 text-xs font-black rounded-full">
                                    🌟 PLUS+ 전면 개방
                                </span>
                            ) : isPremium ? (
                                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-black rounded-full">
                                    🌿 PREMIUM 3-Tier 세트
                                </span>
                            ) : isPro ? (
                                <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 border border-blue-200 text-xs font-black rounded-full">
                                    ⚡ PRO 핵심 처방
                                </span>
                            ) : (
                                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-black rounded-full">
                                    ☕ 스마트 부스터 무료 지원
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                            {isPremiumPlusOrAbove
                                ? '12대 신경인지 케어타입 및 대사·피로도 분석 기반의 정밀 뉴로 영양 처방 전 제품을 확인합니다.'
                                : isPremium
                                ? '8대 신경계 케어타입 진단에 따른 [핵심 영양제 + 스마트 부스터 + 추천 + 보조] 균형 라인업입니다.'
                                : isPro
                                ? '피검자에게 가장 시급한 1순위 핵심 처방 및 두뇌 부스터입니다. (추천/보조 영양제는 PREMIUM 이상 개방)'
                                : '무료 진단 회원에게도 뇌 혈류 확장 및 저자극 각성을 위한 스마트 커피 부스터가 기본 추천됩니다.'}
                        </p>
                    </div>
                </div>
            </div>

            {/* 1. FREE 등급: ☕ HL 스마트 부스터는 선명하게 노출 + 정밀 3-Tier 잠금 업그레이드 배너 */}
            {isFree && (
                <div className="space-y-6">
                    {/* 🔴 핵심 영양제: HL 스마트 부스터 무료 개방 */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-bold text-rose-600 flex items-center gap-2">
                                <span>🔴</span>
                                <span>핵심 추천 (무료 개방)</span>
                                <span className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200 font-bold">
                                    FREE 체험 제공
                                </span>
                            </h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <ProductCard 
                                product={hlProduct as PntProduct} 
                                onClick={() => handleProductClick(hlProduct as PntProduct)}
                            />
                        </div>
                    </div>

                    {/* PRO / PREMIUM 정밀 처방 잠금 안내 배너 */}
                    <div className="p-6 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl text-white border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                                <span className="px-2.5 py-0.5 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black rounded-md text-[11px]">
                                    UPGRADE PASS
                                </span>
                                <h5 className="text-base font-bold text-indigo-200">
                                    나에게 꼭 맞는 8대 케어타입 3-Tier 정밀 영양 처방전 잠금
                                </h5>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                                피검자의 자율신경계/피로 지표에 기반한 <strong>1:1 비타민B·마그네슘·테아닌 등 심층 맞춤 영양제</strong>와 <strong>정식 처방전(PDF) 발급</strong>은 <strong>PRO / PREMIUM 회원</strong>에서 개방됩니다.
                            </p>
                        </div>
                        {onUpgradeClick && (
                            <button
                                onClick={onUpgradeClick}
                                className="px-5 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 text-white font-black text-xs rounded-xl shadow-md shrink-0 transition-all active:scale-95 whitespace-nowrap"
                            >
                                ⚡ PRO(₩9,000) 이상으로 전체 확인하기
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* 2. PRO 등급: 🔴 핵심 영양제 (기존 핵심 + HL 부스터) 노출 + 🟡, 🟢 티어 잠금 안내 */}
            {isPro && (
                <div className="space-y-8">
                    {/* 🔴 핵심 영양제 (기존 핵심 + HL 부스터) */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-bold text-rose-600 flex items-center gap-2">
                                <span>🔴</span>
                                <span>핵심 영양제 (가장 시급합니다 &bull; 2종)</span>
                                <span className="text-xs px-2 py-0.5 bg-rose-50 text-rose-700 rounded-md border border-rose-200 font-bold">
                                    PRO 제공
                                </span>
                            </h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {visibleProducts.ESSENTIAL.map(product => (
                                <ProductCard 
                                    key={product.id} 
                                    product={product as PntProduct} 
                                    onClick={() => handleProductClick(product as PntProduct)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* 🟡 추천 & 🟢 보조 영양제 잠금 안내 배너 */}
                    <div className="p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-2xl text-white border border-amber-400/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 bg-amber-400 text-slate-950 font-black rounded text-[10px]">
                                    PREMIUM UPGRADE
                                </span>
                                <h5 className="text-sm sm:text-base font-bold text-amber-200">
                                    🟡 추천 영양제 & 🟢 보조 영양제 3-Tier 세트 잠금
                                </h5>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                                핵심 영양제와 함께 복용 시 두뇌 집중력과 스트레스 완화 시너지를 내는 <strong>추천/보조 영양제 3종 세트</strong>는 <strong>PREMIUM 회원 이상</strong>에서 개방됩니다.
                            </p>
                        </div>
                        {onUpgradeClick && (
                            <button
                                onClick={onUpgradeClick}
                                className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-md shrink-0 transition-all active:scale-95"
                            >
                                PREMIUM(월 ₩9,900)으로 3-Tier 전체 보기
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* 3. PREMIUM 등급: 🔴 핵심(기존1+HL부스터), 🟡 추천 1개, 🟢 보조 1개 (총 4개 풍성한 3-Tier 노출) */}
            {isPremium && (
                <div className="space-y-8">
                    {/* 🔴 핵심 영양제 (기존 1종 + 마지막에 HL 부스터) */}
                    {visibleProducts.ESSENTIAL.length > 0 && (
                        <div>
                            <h4 className="text-lg font-bold text-rose-600 mb-4">🔴 핵심 영양제 (시급성 1순위)</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {visibleProducts.ESSENTIAL.map(product => (
                                    <ProductCard 
                                        key={product.id} 
                                        product={product as PntProduct} 
                                        onClick={() => handleProductClick(product as PntProduct)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 🟡 추천 영양제 1개 */}
                    {visibleProducts.RECOMMENDED.length > 0 && (
                        <div>
                            <h4 className="text-lg font-bold text-amber-500 mb-4">🟡 추천 영양제 (집중/시너지 지원)</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {visibleProducts.RECOMMENDED.map(product => (
                                    <ProductCard 
                                        key={product.id} 
                                        product={product as PntProduct} 
                                        onClick={() => handleProductClick(product as PntProduct)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 🟢 보조 영양제 1개 */}
                    {visibleProducts.SUPPORTIVE.length > 0 && (
                        <div>
                            <h4 className="text-lg font-bold text-emerald-600 mb-4">🟢 보조 영양제 (기초 체력 &amp; 컨디션 관리)</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {visibleProducts.SUPPORTIVE.map(product => (
                                    <ProductCard 
                                        key={product.id} 
                                        product={product as PntProduct} 
                                        onClick={() => handleProductClick(product as PntProduct)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* PLUS+ 전체 영양제 풀 라인업 안내 카드 */}
                    <div className="p-5 bg-gradient-to-r from-fuchsia-50 via-purple-50 to-indigo-50 border border-fuchsia-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-fuchsia-600 text-white flex items-center justify-center text-xl shrink-0">
                                ✨
                            </div>
                            <div>
                                <h5 className="text-xs font-bold text-fuchsia-900">
                                    12대 신경인지 케어타입 연동 정밀 뉴로 처방 전 품목 풀 라인업
                                </h5>
                                <p className="text-[11px] text-fuchsia-700">
                                    더 다양한 맞춤 영양제 대체재 및 전문 처방전 PDF 발급은 <strong>PREMIUM PLUS 이상</strong>에서 지원됩니다.
                                </p>
                            </div>
                        </div>
                        {onUpgradeClick && (
                            <button
                                onClick={onUpgradeClick}
                                className="px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white text-xs font-bold rounded-xl shadow-xs shrink-0 transition"
                            >
                                PLUS+ 플랜 안내
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* 4. PREMIUM PLUS+ / VIP / EXPERT: 모든 영양제 전면 개방 (풀 라인업) */}
            {isPremiumPlusOrAbove && (
                <div className="space-y-8">
                    {visibleProducts.ESSENTIAL.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-bold text-rose-600 flex items-center gap-2">
                                    <span>🔴</span>
                                    <span>핵심 영양제 &amp; 스마트 부스터 (가장 시급합니다 &bull; {visibleProducts.ESSENTIAL.length}종)</span>
                                </h4>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {visibleProducts.ESSENTIAL.map(product => (
                                    <ProductCard 
                                        key={product.id} 
                                        product={product as PntProduct} 
                                        onClick={() => handleProductClick(product as PntProduct)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {visibleProducts.RECOMMENDED.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-bold text-amber-500 flex items-center gap-2">
                                    <span>🟡</span>
                                    <span>추천 영양제 (시너지 및 집중 지원 &bull; {visibleProducts.RECOMMENDED.length}종)</span>
                                </h4>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {visibleProducts.RECOMMENDED.map(product => (
                                    <ProductCard 
                                        key={product.id} 
                                        product={product as PntProduct} 
                                        onClick={() => handleProductClick(product as PntProduct)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {visibleProducts.SUPPORTIVE.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-bold text-emerald-600 flex items-center gap-2">
                                    <span>🟢</span>
                                    <span>보조 영양제 (일반 컨디션 관리용)</span>
                                </h4>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {visibleProducts.SUPPORTIVE.map(product => (
                                    <ProductCard 
                                        key={product.id} 
                                        product={product as PntProduct} 
                                        onClick={() => handleProductClick(product as PntProduct)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ========================================================================= */}
            {/* HL 스마트 아르기닌-카르니틴 부스터 전용 복용 가이드 & 구매 확인 모달 팝업 */}
            {/* ========================================================================= */}
            {selectedHlModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto">
                        
                        {/* Close button */}
                        <button
                            onClick={() => setSelectedHlModal(false)}
                            className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 dark:hover:text-white p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            ✕
                        </button>

                        {/* Top Header Badge */}
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-3 py-1 bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-black rounded-full flex items-center gap-1.5">
                                <span>☕</span>
                                <span>NBASS x HL COFFEE 두뇌 혈류 처방 가이드</span>
                            </span>
                        </div>

                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
                            HL 아르기닌·카르니틴 스마트 아메리카노
                        </h3>
                        <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-1">
                            아르기닌 2,600mg · 카르니틴 1,200mg + 시트룰린(수박추출물) · 마일드 카페인
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            뇌 모세혈관 확장(NO 산화질소) &bull; L-카르니틴 지방 연소 &bull; 저자극 고효율 두뇌 각성
                        </p>

                        {/* Guide Content Cards */}
                        <div className="mt-6 space-y-3.5 text-xs">
                            {/* 1. 섭취 시간 및 타이밍 */}
                            <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-2xl border border-indigo-100 dark:border-indigo-900/50">
                                <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200 font-bold text-sm mb-1.5">
                                    <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                    <span>언제 먹고 몇 시까지 마셔야 하나요? (섭취 골든타임)</span>
                                </div>
                                <ul className="space-y-1 text-slate-700 dark:text-slate-300 leading-relaxed pl-1">
                                    <li>&bull; <strong>추천 시간:</strong> <strong>아침 기상 직후(07:00~08:30)</strong> 또는 <strong>오전 공부 시작 30분 전</strong></li>
                                    <li>&bull; <strong>공복 섭취 원칙:</strong> 아르기닌은 다른 단백질과 흡수 경쟁을 하므로 <strong>공복에 섭취할 때 흡수율이 가장 극대화</strong>됩니다.</li>
                                    <li>&bull; <strong>마감 시간:</strong> 밤 수면의 질 유지를 위해 <strong>오후 2시(14:00) 이전</strong>에 섭취를 완료하는 것을 권장합니다.</li>
                                </ul>
                            </div>

                            {/* 2. 희석 방법 (500ml 이상 & 뜨거운 물 금지) */}
                            <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-2xl border border-emerald-100 dark:border-emerald-900/50">
                                <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200 font-bold text-sm mb-1.5">
                                    <Droplets className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                    <span>얼마나 어떻게 희석해서 마시나요? (500ml 이상 필수)</span>
                                </div>
                                <ul className="space-y-1 text-slate-700 dark:text-slate-300 leading-relaxed pl-1">
                                    <li>&bull; <strong>희석 비율:</strong> 1포를 <strong>미온수 또는 시원한 냉수 500ml 이상</strong>에 넉넉히 타서 연하게 드세요.</li>
                                    <li>&bull; <strong>맛과 향 개선:</strong> 아르기닌 특유의 쌉싸름함과 아민취를 깔끔하게 잡아주어 <strong>산뜻한 아이스 아메리카노 티</strong>처럼 맛있게 마실 수 있습니다.</li>
                                    <li>&bull; <strong className="text-rose-600 dark:text-rose-400">⚠️ 뜨거운 물(60℃ 이상) 절대 금지:</strong> 열에 의해 아르기닌 유효 성분이 열 변성되므로 반드시 미온수나 냉수를 사용하세요.</li>
                                </ul>
                            </div>

                            {/* 3. 저자극 뇌 각성 & 카르니틴 지방 연소 시너지 */}
                            <div className="p-4 bg-amber-50/70 dark:bg-amber-950/40 rounded-2xl border border-amber-100 dark:border-amber-900/50">
                                <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-sm mb-1.5">
                                    <Flame className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                    <span>왜 수험생에게 최적인가요? (저자극 각성 &amp; 지방 분해)</span>
                                </div>
                                <ul className="space-y-1 text-slate-700 dark:text-slate-300 leading-relaxed pl-1">
                                    <li>&bull; <strong>두근거림 없는 맑은 각성:</strong> 일반 고카페인 음료의 부작용 없이, <strong>스타벅스 Tall 수준의 적정 카페인 + 뇌 혈류 확장 시너지</strong>로 그란데 이상의 집중력을 지속합니다.</li>
                                    <li>&bull; <strong>L-카르니틴 체지방 분해:</strong> 장시간 앉아있는 수험생의 체지방 축적을 방지하고 미토콘드리아 ATP 에너지를 생성합니다.</li>
                                    <li>&bull; <strong>가벼운 보행 시너지:</strong> 섭취 후 <strong>5~10분 가벼운 걷기나 스트레칭</strong>을 병행하면 전두엽 산소 공급과 지방 연소 효율이 배가됩니다.</li>
                                </ul>
                            </div>
                        </div>

                        {/* Purchase Confirmation Callout */}
                        <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="text-center sm:text-left">
                                <p className="text-xs font-bold text-slate-900 dark:text-white">
                                    지금 공식 구매 페이지로 이동하시겠습니까?
                                </p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                    HL COFFEE 공식 직영몰에서 1:1 맞춤 주문이 진행됩니다.
                                </p>
                            </div>

                            <div className="flex items-center gap-2.5 w-full sm:w-auto">
                                <button
                                    onClick={() => setSelectedHlModal(false)}
                                    className="flex-1 sm:flex-none px-4 py-2.5 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                >
                                    닫기
                                </button>
                                <a
                                    href="https://www.hl-coffee.com/category/coffee/29/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => setSelectedHlModal(false)}
                                    className="flex-1 sm:flex-none px-6 py-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                                >
                                    <span>☕ 공식몰에서 구매하기</span>
                                    <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

const ProductCard: React.FC<{ 
    product: PntProduct;
    onClick?: () => void;
}> = ({ product, onClick }) => {
    const isHlCoffee = product.id === 'HL-COFFEE-001';
    const imgSrc = isHlCoffee ? '/hl_coffee_circle.png' : product.image;

    return (
        <div 
            onClick={onClick}
            className="group block bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-lg hover:border-slate-200 transition-all duration-300 print:border-slate-300 print:rounded-lg flex flex-col justify-between cursor-pointer"
        >
            <div>
                <div className="aspect-[4/3] print:aspect-[3/1] bg-slate-50 overflow-hidden relative flex items-center justify-center">
                    <img 
                        src={imgSrc} 
                        alt={product.name} 
                        className={`w-full h-full object-contain ${isHlCoffee ? 'p-2' : 'mix-blend-multiply p-4'} group-hover:scale-105 transition-transform duration-500`}
                    />
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1 z-10">
                        {product.targetSymptoms.slice(0, 3).map(tag => (
                            <span key={tag} className="px-2 py-1 bg-white/90 backdrop-blur text-[10px] font-bold text-slate-700 rounded-lg print:border print:border-slate-200 shadow-2xs">
                                #{tag}
                            </span>
                        ))}
                    </div>
                    {isHlCoffee && (
                        <div className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow-sm z-10">
                            ⚡ 뇌혈류 NO 부스터
                        </div>
                    )}
                </div>
                <div className="p-5 print:p-3">
                    <h4 className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors print:text-sm">{product.name}</h4>
                    <p className="text-xs text-slate-500 mt-1 print:text-[10px]">{product.subName}</p>
                    
                    {product.dosageMethod && (
                        <div className="mt-3 p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100 text-[11px] text-emerald-950">
                            <div className="font-bold flex items-center gap-1 text-emerald-800">
                                <span>⏱️ 권장 섭취:</span>
                                <span>{product.timing || '아침 식후'}</span>
                            </div>
                            <p className="text-[10px] text-emerald-700 mt-0.5">{product.dosageMethod}</p>
                        </div>
                    )}

                    {product.caution && (
                        <p className="text-[10px] text-amber-700 mt-2 bg-amber-50 p-2 rounded-lg border border-amber-200 leading-tight">
                            {product.caution}
                        </p>
                    )}

                    <div className="mt-4 pt-4 border-t border-slate-50 print:mt-2 print:pt-2">
                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Key Ingredients</p>
                        <div className="flex flex-wrap gap-y-1 gap-x-2">
                            {product.mainIngredients.map((ing, i) => (
                                <span key={i} className="text-xs text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded print:bg-transparent print:p-0 print:text-slate-500">
                                    {ing}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {product.url && (
                <div className="p-4 pt-0">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onClick) onClick();
                        }}
                        className="w-full py-2 bg-slate-900 hover:bg-emerald-600 text-white text-[11px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                    >
                        <span>{product.id === 'HL-COFFEE-001' ? '☕ 복용 가이드 확인 & 공식몰 주문' : '처방 제품 상세정보'}</span>
                        <span>↗</span>
                    </button>
                </div>
            )}
        </div>
    );
};
