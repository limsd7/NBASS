
import React, { useState, useMemo } from 'react';
import { PNT_PRODUCTS, PntProduct } from '../../data/pntProducts';

interface Props {
    onSelect: (product: PntProduct) => void;
    selectedIds: string[];
    isOpen: boolean;
    onClose: () => void;
}

export const ProductSelector: React.FC<Props> = ({ onSelect, selectedIds, isOpen, onClose }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState<string>('All');

    const products = useMemo(() => Object.values(PNT_PRODUCTS), []);
    const categories = ['All', 'Fatigue', 'Brain', 'Immunity', 'Liver', 'Gut', 'Sleep', 'Circulation'];

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.includes(searchTerm) || p.subName.includes(searchTerm) || p.targetSymptoms.some(t => t.includes(searchTerm));
        const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col overflow-hidden border border-slate-200">

                {/* Header */}
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">영양제 추가 처방</h3>
                        <p className="text-xs text-slate-500">필요한 영양제를 직접 검색하여 추가할 수 있습니다.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Search & Filter */}
                <div className="p-4 border-b border-slate-100 bg-white space-y-3">
                    <input
                        type="text"
                        placeholder="제품명, 증상, 성분 검색..."
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${activeCategory === cat
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Product List */}
                <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-3">
                    {filteredProducts.map(product => {
                        const isSelected = selectedIds.includes(product.id);
                        return (
                            <div key={product.id} className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${isSelected ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-200 hover:border-indigo-300'}`}>
                                <img src={product.image} alt={product.name} className="w-12 h-12 object-contain bg-white rounded-md border border-slate-100" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-slate-800 text-sm truncate">{product.name}</h4>
                                        <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-center whitespace-nowrap">{product.category}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 truncate">{product.subName}</p>
                                </div>
                                <button
                                    onClick={() => onSelect(product)}
                                    disabled={isSelected}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isSelected
                                            ? 'bg-green-500 text-white cursor-default'
                                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow'
                                        }`}
                                >
                                    {isSelected ? '추가됨' : '선택'}
                                </button>
                            </div>
                        );
                    })}

                    {filteredProducts.length === 0 && (
                        <div className="text-center py-12 text-slate-400">
                            <p>검색 결과가 없습니다.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};
