import React from 'react';
import { PNT_PRODUCTS, PntProduct } from '../data/pntProducts';
import { RecommendedProduct } from '../logicEngine';

interface Props {
    recommendedProducts: RecommendedProduct[];
}

export const TargetedNutritionRecommendation: React.FC<Props> = ({ recommendedProducts }) => {
    // Group products by tier
    const productsByTier = {
        ESSENTIAL: recommendedProducts.filter(p => p.tier === 'ESSENTIAL').map(p => ({ ...p, ...PNT_PRODUCTS[p.productId] })).filter(p => p.name),
        RECOMMENDED: recommendedProducts.filter(p => p.tier === 'RECOMMENDED').map(p => ({ ...p, ...PNT_PRODUCTS[p.productId] })).filter(p => p.name),
        SUPPORTIVE: recommendedProducts.filter(p => p.tier === 'SUPPORTIVE').map(p => ({ ...p, ...PNT_PRODUCTS[p.productId] })).filter(p => p.name),
    };

    return (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm print-page-break print-avoid-break">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                <h3 className="text-xl font-bold text-slate-900">Targeted Nutrition Recommendation (3-Tier)</h3>
            </div>

            {recommendedProducts.length === 0 ? (
                <p className="text-slate-500 text-sm">현재 상태는 정상 범위로 필수 영양제만 권장합니다.</p>
            ) : (
                <div className="space-y-8">
                    {productsByTier.ESSENTIAL.length > 0 && (
                        <div>
                            <h4 className="text-lg font-bold text-rose-600 mb-4">🔴 핵심 영양제 (가장 시급합니다)</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {productsByTier.ESSENTIAL.map(product => <ProductCard key={product.id} product={product as PntProduct} />)}
                            </div>
                        </div>
                    )}
                    
                    {productsByTier.RECOMMENDED.length > 0 && (
                        <div>
                            <h4 className="text-lg font-bold text-amber-500 mb-4">🟡 추천 영양제 (같이 드시면 좋아요)</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {productsByTier.RECOMMENDED.map(product => <ProductCard key={product.id} product={product as PntProduct} />)}
                            </div>
                        </div>
                    )}

                    {productsByTier.SUPPORTIVE.length > 0 && (
                        <div>
                            <details className="group" open>
                                <summary className="text-md font-bold text-emerald-600 cursor-pointer mb-4 list-none flex items-center">
                                    <span>🟢 보조 영양제 (일반 컨디션 관리용)</span>
                                    <span className="ml-2 text-xs bg-slate-100 px-2 py-1 rounded text-slate-500 group-open:hidden">더보기 ▼</span>
                                    <span className="ml-2 text-xs bg-slate-100 px-2 py-1 rounded text-slate-500 hidden group-open:inline">접기 ▲</span>
                                </summary>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                                    {productsByTier.SUPPORTIVE.map(product => <ProductCard key={product.id} product={product as PntProduct} />)}
                                </div>
                            </details>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const ProductCard: React.FC<{ product: PntProduct }> = ({ product }) => (
    <div className="group block bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-lg hover:border-slate-200 transition-all duration-300 print:border-slate-300 print:rounded-lg">
        <div className="aspect-[4/3] print:aspect-[3/1] bg-slate-50 overflow-hidden relative">
            <img src={product.image} alt={product.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500 p-4" />
            <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                {product.targetSymptoms.slice(0, 3).map(tag => (
                    <span key={tag} className="px-2 py-1 bg-white/90 backdrop-blur text-[10px] font-bold text-slate-700 rounded-lg print:border print:border-slate-200">
                        #{tag}
                    </span>
                ))}
            </div>
        </div>
        <div className="p-5 print:p-3">
            <h4 className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors print:text-sm">{product.name}</h4>
            <p className="text-xs text-slate-500 mt-1 print:text-[10px]">{product.subName}</p>
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
);
