import React, { useState, useMemo } from 'react';
import { PNT_PRODUCTS, PntProduct, PNT_HOSPITAL_CONFIG, getStandard6ProductLineup } from '../data/pntProducts';
import { RecommendedProduct } from '../logicEngine';
import { MembershipTier } from '../utils/featureGate';
import { Lock, Sparkles, CheckCircle2, ChevronDown, ChevronUp, ExternalLink, Clock, Flame, Droplets, AlertTriangle, Activity, Copy, Check } from 'lucide-react';

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
    const isPremiumPlusOrAbove = tier === 'premium' || tier === 'expert';

    // 팝업 상태 관리 (HL 부스터 전용 맞춤 복용 가이드 모달)
    const [selectedHlModal, setSelectedHlModal] = useState<boolean>(false);
    // 🏥 PNTmall 구매 & 제휴 병원코드 안내 모달
    const [selectedPntProduct, setSelectedPntProduct] = useState<PntProduct | null>(null);
    const [codeCopied, setCodeCopied] = useState<boolean>(false);

    // 📊 심층 분석 대시보드와 📋 16P 전문 종합 리포트 간 100% 동일한 6종 표준 라인업 동기화
    const standardLineup = useMemo(() => getStandard6ProductLineup(recommendedProducts), [recommendedProducts]);
    const hlProduct = standardLineup.p2;

    // 차등 추천 개수 계산 (보고서와 100% 동일한 3-Tier 6종 라인업 동기화):
    // 1. FREE (무료): HL 스마트 커피 부스터 1종은 무료부터 전체 회원에게 100% 개방 & 추천! (나머지 잠금 배너)
    // 2. PRO / PREMIUM / PLUS+: 16P 정밀 종합 리포트와 100% 동일한 6종 (🔴 핵심 2종 + 🟡 추천 2종 + 🟢 보조 2종)
    const visibleProducts = {
        ESSENTIAL: isFree ? [hlProduct] : standardLineup.byTier.ESSENTIAL,
        RECOMMENDED: isFree ? [] : standardLineup.byTier.RECOMMENDED,
        SUPPORTIVE: isFree ? [] : standardLineup.byTier.SUPPORTIVE,
    };

    const handleProductClick = (product: PntProduct) => {
        if (product.id === 'HL-COFFEE-001') {
            setSelectedHlModal(true);
        } else {
            setSelectedPntProduct(product);
            setCodeCopied(false);
        }
    };

    const handleCopyHospitalCode = () => {
        const code = PNT_HOSPITAL_CONFIG.hospitalCode;
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(code).then(() => {
                setCodeCopied(true);
                setTimeout(() => setCodeCopied(false), 2500);
            }).catch(() => {
                setCodeCopied(true);
                setTimeout(() => setCodeCopied(false), 2500);
            });
        } else {
            setCodeCopied(true);
            setTimeout(() => setCodeCopied(false), 2500);
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
                                    ? '생체신호 연동 1:1 정밀 영양 가이드 (Full Lineup)' 
                                    : (isPremium || isPro)
                                    ? '두뇌 활력 3-Tier 맞춤 영양 가이드 (3-Tier Precision)' 
                                    : '두뇌 활력 1:1 맞춤 영양 성분 & 뇌혈류 부스터 추천'}
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
                                    ⚡ PRO 3-Tier 맞춤 세트
                                </span>
                            ) : (
                                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-black rounded-full">
                                    ☕ 스마트 부스터 무료 지원
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                            {isPremiumPlusOrAbove
                                ? '12대 신경인지 케어타입 및 대사·피로도 분석 기반의 수험생 맞춤 영양 설계 및 추천 라인업입니다.'
                                : (isPremium || isPro)
                                ? '12대 신경계 케어타입 분석에 따른 [핵심 권장 성분 + 스마트 부스터 + 추천(엔오카디징코 등) + 보조] 균형 라인업입니다.'
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

                    {/* PRO / PREMIUM 정밀 영양 설계 잠금 안내 배너 */}
                    <div className="p-6 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl text-white border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                                <span className="px-2.5 py-0.5 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black rounded-md text-[11px]">
                                    UPGRADE PASS
                                </span>
                                <h5 className="text-base font-bold text-indigo-200">
                                    나에게 꼭 맞는 12대 케어타입 3-Tier 맞춤 영양 설계 가이드 잠금
                                </h5>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                                피검자의 자율신경계/피로 지표에 기반한 <strong>1:1 비타민B·마그네슘·테아닌 등 심층 맞춤 영양 성분 설계</strong>와 <strong>정식 영양 프로토콜(PDF) 발급</strong>은 <strong>PRO / PREMIUM 회원</strong>에서 개방됩니다.
                            </p>
                        </div>
                        {onUpgradeClick && (
                            <button
                                onClick={onUpgradeClick}
                                className="px-5 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 text-white font-black text-xs rounded-xl shadow-md shrink-0 transition-all active:scale-95 whitespace-nowrap"
                            >
                                ⚡ 1회 리포트 / 정기결제로 전체 확인하기
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* 2. PRO & PREMIUM 등급: 🔴 핵심(기존1+HL부스터), 🟡 추천(엔오카디징코 등), 🟢 보조 (보고서와 100% 동일한 3-Tier 맞춤 세트 노출) */}
            {(isPro || isPremium) && (
                <div className="space-y-8">
                    {/* 🔴 핵심 권장 성분 (기존 1종 + 마지막에 HL 부스터) */}
                    {visibleProducts.ESSENTIAL.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-bold text-rose-600 flex items-center gap-2">
                                    <span>🔴</span>
                                    <span>핵심 권장 성분 &amp; 부스터 (집중 보충 1순위 &bull; {visibleProducts.ESSENTIAL.length}종)</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-md border font-bold ${isPro ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                                        {isPro ? 'PRO 맞춤' : 'PREMIUM'}
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
                    )}

                    {/* 🟡 추천 영양 성분 (엔오카디징코 등 보고서와 동일) */}
                    {visibleProducts.RECOMMENDED.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-bold text-amber-500 flex items-center gap-2">
                                    <span>🟡</span>
                                    <span>추천 영양 성분 (시너지 &amp; 집중 지원 &bull; {visibleProducts.RECOMMENDED.length}종)</span>
                                    <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md border border-amber-200 font-bold">
                                        보고서 연동
                                    </span>
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

                    {/* 🟢 보조 영양 성분 */}
                    {visibleProducts.SUPPORTIVE.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-bold text-emerald-600 flex items-center gap-2">
                                    <span>🟢</span>
                                    <span>보조 영양 성분 (기초 체력 &amp; 컨디션 관리)</span>
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

                    {/* PLUS+ 전체 영양 성분 풀 라인업 안내 카드 */}
                    <div className="p-5 bg-gradient-to-r from-fuchsia-50 via-purple-50 to-indigo-50 border border-fuchsia-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-fuchsia-600 text-white flex items-center justify-center text-xl shrink-0">
                                ✨
                            </div>
                            <div>
                                <h5 className="text-xs font-bold text-fuchsia-900">
                                    12대 신경인지 케어타입 연동 정밀 뉴로 영양 설계 풀 라인업
                                </h5>
                                <p className="text-[11px] text-fuchsia-700">
                                    더 다양한 맞춤 영양 성분 대체재 및 전문 영양 설계서 PDF 발급은 <strong>PREMIUM 이상</strong>에서 지원됩니다.
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

            {/* 4. PREMIUM / EXPERT: 모든 영양 성분 전면 개방 (풀 라인업) */}
            {isPremiumPlusOrAbove && (
                <div className="space-y-8">
                    {visibleProducts.ESSENTIAL.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-bold text-rose-600 flex items-center gap-2">
                                    <span>🔴</span>
                                    <span>핵심 권장 성분 &amp; 스마트 부스터 (집중 보충 1순위 &bull; {visibleProducts.ESSENTIAL.length}종)</span>
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
                                    <span>추천 영양 성분 (시너지 및 집중 지원 &bull; {visibleProducts.RECOMMENDED.length}종)</span>
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
                                    <span>보조 영양 성분 (일반 컨디션 관리용)</span>
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
            {/* 🏥 Dr.PNT 공식몰 구매 및 제휴 병원코드 안내 모달 팝업 */}
            {/* ========================================================================= */}
            {selectedPntProduct && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto">
                        
                        {/* Close button */}
                        <button
                            onClick={() => setSelectedPntProduct(null)}
                            className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 dark:hover:text-white p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            ✕
                        </button>

                        {/* Top Header Badge */}
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-black rounded-full flex items-center gap-1.5">
                                <span>🏥</span>
                                <span>녹십자웰빙 Dr.PNT 병의원 전용 라인</span>
                            </span>
                        </div>

                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
                            {selectedPntProduct.name}
                        </h3>
                        <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                            {selectedPntProduct.subName}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            정가: {selectedPntProduct.price.toLocaleString()}원 ({selectedPntProduct.capacity}) &bull; {selectedPntProduct.timing || '식후 권장'}
                        </p>

                        {/* Product Quick Info Card */}
                        <div className="mt-5 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-4">
                            <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-xl p-2 shrink-0 border border-slate-100 dark:border-slate-800 flex items-center justify-center">
                                {selectedPntProduct.image ? (
                                    <img 
                                        src={selectedPntProduct.image} 
                                        alt={selectedPntProduct.name} 
                                        className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal"
                                    />
                                ) : (
                                    <span className="text-2xl">💊</span>
                                )}
                            </div>
                            <div className="text-xs space-y-1">
                                <p className="font-bold text-slate-800 dark:text-slate-200">
                                    주요 기능성 원료: {selectedPntProduct.mainIngredients.join(', ')}
                                </p>
                                <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                                    섭취 방법: {selectedPntProduct.dosageMethod}
                                </p>
                            </div>
                        </div>

                        {/* 🏥 제휴 병원코드 등록 안내 카드 */}
                        <div className="mt-5 p-5 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl text-white shadow-md border border-indigo-500/30">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-base">📋</span>
                                <h4 className="text-sm font-bold text-indigo-200">PNTmall 제휴 병원코드 등록 안내</h4>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed mb-4">
                                Dr.PNT 제품은 병의원 전용 건강기능식품으로, 녹십자웰빙 공식몰(<strong>PNTmall</strong>) 회원가입 시 <strong>제휴 병원코드</strong>를 등록하셔야 구매가 가능합니다.
                            </p>

                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20 flex items-center justify-between gap-3">
                                <div>
                                    <span className="text-[10px] text-indigo-300 block font-semibold">제휴 병원코드</span>
                                    <span className="text-base font-black tracking-wider text-emerald-400">{PNT_HOSPITAL_CONFIG.hospitalCode}</span>
                                </div>
                                <button
                                    onClick={handleCopyHospitalCode}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 ${
                                        codeCopied 
                                            ? 'bg-emerald-500 text-white font-black scale-95' 
                                            : 'bg-white text-slate-900 hover:bg-slate-100 active:scale-95'
                                    }`}
                                >
                                    {codeCopied ? (
                                        <>
                                            <Check className="w-3.5 h-3.5" />
                                            <span>복사 완료!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-3.5 h-3.5" />
                                            <span>코드 복사</span>
                                        </>
                                    )}
                                </button>
                            </div>
                            {codeCopied && (
                                <p className="text-[11px] text-emerald-400 mt-2 font-bold animate-in fade-in">
                                    ✓ 병원코드가 클립보드에 복사되었습니다. 공식몰 회원가입 시 붙여넣기 하세요.
                                </p>
                            )}
                        </div>

                        {/* 📢 구매 채널 & 할인 혜택 안내 (예스유웰빙 예고) */}
                        <div className="mt-4 p-4 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl text-xs space-y-1.5 text-amber-950 dark:text-amber-200">
                            <div className="font-bold flex items-center gap-1.5 text-amber-900 dark:text-amber-300">
                                <span>💡</span>
                                <span>구매 채널 및 할인 혜택 안내</span>
                            </div>
                            <ul className="space-y-1 text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed pl-1">
                                <li>• <strong>공식 PNTmall:</strong> 제휴 병원코드 등록 후 정가로 즉시 구매 가능합니다.</li>
                                <li>• <strong>예스유웰빙 단독 할인 채널:</strong> 공식 유통 파트너사 [예스유웰빙]을 통한 <strong>수험생 특별 할인가 공급 채널이 구축 준비 중</strong>입니다. (구축 완료 시 별도 할인 링크가 제공됩니다.)</li>
                            </ul>
                        </div>

                        {/* Modal Bottom Actions */}
                        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                            <p className="text-[10px] leading-relaxed text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-700">
                                ※ 건강기능식품은 질병의 진단·치료 목적이 아니며, 안내 내용은 건강 유지에 도움을 줄 수 있음 수준입니다. 복용 전 전문가와 상담하세요. (전문가 검수 진행 중)
                            </p>
                            <div className="flex items-center justify-between gap-3">
                            <button
                                onClick={() => setSelectedPntProduct(null)}
                                className="px-4 py-2.5 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            >
                                닫기
                            </button>
                            <button
                                onClick={() => {
                                    window.open(selectedPntProduct.url, '_blank');
                                    setSelectedPntProduct(null);
                                }}
                                className="flex-1 sm:flex-none px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                            >
                                <span>🏥 PNTmall 공식몰 바로가기 (외부 사이트)</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                            </div>
                        </div>
                </div>
                    </div>
            )}
            {/* ========================================================================= */}
            {/* HL 스마트 아르기닌-카르니틴 부스터 전용 복용 가이드 & 구매 확인 모달 팝업 */}
            {/* ========================================================================= */}
            {selectedHlModal && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
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
                                <span>NBASS x HL COFFEE 두뇌 혈류 뉴로 가이드</span>
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

            {/* Legal Advisory / Disclaimer Card */}
            <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-500 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-700 text-xs mb-0.5">
                    <span>⚖️</span>
                    <span>수험생 맞춤 영양 설계 가이드 법적 고지 (Legal Advisory)</span>
                </div>
                <p>• 본 맞춤 영양 가이드는 신경인지 성향 및 자가 설문 데이터를 기반으로 한 일반적인 건강 증진 및 피로 회복 목적의 영양 성분 정보이며, 의료법상 의사의 처방전(Prescription)이나 진단서가 아닙니다.</p>
                <p>• 특정 질병의 예방 및 치료를 목적으로 하지 않으며, 기저 질환이 있거나 복용 중인 의약품이 있는 경우 반드시 전문의사 또는 약사와 상담하십시오.</p>
                <p>• 안내된 영양 성분은 식품의약품안전처(MFDS) 기준 기능성 원료 정보를 준수합니다.</p>
            </div>
        </div>
    );
};

const getCategoryNutrientLabel = (product: PntProduct): string => {
    if (product.id === 'HL-COFFEE-001') return '두뇌 혈류 & 저자극 집중 각성 부스터';
    if (product.id === '1000000095' || product.name.includes('마그네슘')) return '신경 안정 & 근육 이완 원료';
    if (product.id === '1000000100' || product.name.includes('캄 슬립')) return '수면 질 & 스트레스 완화 원료';
    if (product.id === '1000000077' || product.name.includes('아르기닌 6000')) return '에너지 대사 & 피로 회복 원료';
    if (product.id === '1000000044' || product.name.includes('비타민B') || product.name.includes('액티브 B')) return '두뇌 활력 & 신경 대사 원료';
    if (product.id === '1000000035' || product.name.includes('엔오카디')) return '기억력 & 뇌혈류 활성 원료';
    if (product.id === '1000000047' || product.name.includes('오메가3')) return '신경망 보호 & 혈행 개선 원료';
    
    switch (product.category) {
        case 'Sleep': return '수면 질 & 신경 이완 원료';
        case 'Fatigue': return '에너지 대사 & 피로 회복 원료';
        case 'Brain': return '기억력 & 뇌혈류 활성 원료';
        case 'Immunity': return '면역 체계 & 세포 항산화 원료';
        case 'Circulation': return '신경망 보호 & 혈행 개선 원료';
        case 'Gut': return '장내 미생물 & 장-뇌 축 안정 원료';
        case 'Liver': return '간 대사 & 피로 물질 해독 원료';
        case 'Bone': return '골격 형성 & 비타민 D 보충 원료';
        default: return '수험생 집중 맞춤 영양 원료';
    }
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
                    {imgSrc ? (
                        <img 
                            src={imgSrc} 
                            alt={product.name} 
                            className={`w-full h-full object-contain ${isHlCoffee ? 'p-2' : 'mix-blend-multiply p-4'} group-hover:scale-105 transition-transform duration-500`}
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const fallback = e.currentTarget.parentElement?.querySelector('.fallback-icon');
                                if (fallback) fallback.classList.remove('hidden');
                            }}
                        />
                    ) : null}
                    <span className={`text-5xl fallback-icon ${imgSrc ? 'hidden' : ''}`}>💊</span>
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1 z-10">
                        {product.targetSymptoms.slice(0, 3).map(tag => (
                            <span key={tag} className="px-2 py-1 bg-white/90 backdrop-blur text-[10px] font-bold text-slate-700 rounded-lg print:border print:border-slate-200 shadow-2xs">
                                #{tag}
                            </span>
                        ))}
                    </div>
                    {isHlCoffee ? (
                        <div className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow-sm z-10">
                            ⚡ 뇌혈류 NO 부스터
                        </div>
                    ) : (
                        <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur text-white text-[9px] font-bold px-2 py-0.5 rounded-md shadow-sm z-10">
                            🏥 Dr.PNT 정품
                        </div>
                    )}
                </div>
                <div className="p-5 print:p-3">
                    <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-md border border-emerald-200/60">
                            🎯 {getCategoryNutrientLabel(product)}
                        </span>
                    </div>

                    <h4 className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors print:text-sm flex items-center justify-between gap-1">
                        <span className="truncate">{product.name}</span>
                        {isHlCoffee ? (
                            <span className="text-[10px] font-black text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 shrink-0">HL 공식몰</span>
                        ) : (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 shrink-0">Dr.PNT</span>
                        )}
                    </h4>
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
                        className={`w-full py-2.5 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs ${
                            isHlCoffee 
                                ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black shadow-amber-500/20' 
                                : 'bg-slate-900 hover:bg-emerald-600 text-white'
                        }`}
                    >
                        <span>{isHlCoffee ? '☕ 섭취 가이드 확인 & 공식몰 주문' : '🏥 공식몰 구매 안내 & 병원코드'}</span>
                        <span>↗</span>
                    </button>
                </div>
            )}
        </div>
    );
};
