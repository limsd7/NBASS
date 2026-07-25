import React from 'react';
import { PntProduct } from '../data/pntProducts';

interface ProductCardProps {
    product: PntProduct;
    index: number;
    onRemove?: (id: string) => void; // Optional remove handler if needed in future, currently handled by parent relative wrapping
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, index }) => {
    // Note: onError handler removed to verify "real photos" as seen in ProductSelector. 
    // If images are valid, they will load. 

    return (
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow duration-200">
            <div className="w-full md:w-32 h-32 flex-shrink-0 bg-slate-50 rounded-lg border border-slate-100 p-2 flex items-center justify-center overflow-hidden">
                <img
                    src={product.image}
                    alt={product.name}
                    className="max-w-full max-h-full object-contain mix-blend-multiply"
                />
            </div>

            <div className="flex-1 flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wide">
                            {product.category} Care
                        </span>
                        <span className="text-lg font-bold text-slate-800 tracking-tight">
                            {product.price.toLocaleString()}원
                        </span>
                    </div>
                    <h4 className="text-lg font-bold text-slate-800 mb-1">{product.name}</h4>
                    <p className="text-sm text-slate-500 mb-3">{product.subName}</p>

                    <div className="flex flex-wrap gap-2 mb-3">
                        {product.mainIngredients.map((ing, i) => (
                            <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                                {ing}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <div>
                                <div className="text-xs text-slate-400 font-bold">복용 시간</div>
                                <div className="text-sm font-bold text-slate-700">{product.timing}</div>
                            </div>
                        </div>
                        <div className="w-px h-8 bg-slate-100"></div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                            </div>
                            <div>
                                <div className="text-xs text-slate-400 font-bold">복용량</div>
                                <div className="text-sm font-bold text-slate-700">{product.dosageMethod}</div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <a 
                            href={product.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-slate-500 hover:text-slate-700 font-medium transition-colors"
                        >
                            💊 상세 정보
                        </a>
                        <a
                            href={product.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-sm font-bold rounded-lg shadow-sm hover:shadow-md hover:from-emerald-600 hover:to-green-600 transition-all duration-200 transform hover:-translate-y-0.5"
                        >
                            구매하기
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};
