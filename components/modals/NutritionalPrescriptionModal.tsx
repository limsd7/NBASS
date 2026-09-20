
import React, { useState, useEffect } from 'react';
import { AssessmentResult } from '../../types';
import { generateNutritionalPrescription, PrescriptionResult } from '../../services/prescriptionEngine';
import { PNT_PRODUCTS, PntProduct } from '../../data/pntProducts';
import { printElement } from '../../utils/printUtils';
import { AnalystConfig, getAnalystDisplayText } from '../../utils/analystConfig';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    data: AssessmentResult;
    recommendedProducts: any[];
    analystConfig?: AnalystConfig;
}

import { ProductSelector } from './ProductSelector';

export const NutritionalPrescriptionModal: React.FC<Props> = ({ isOpen, onClose, data, recommendedProducts, analystConfig }) => {
    const [prescription, setPrescription] = useState<PrescriptionResult | null>(null);
    const [extraProducts, setExtraProducts] = useState<PntProduct[]>([]);
    const [isSelectorOpen, setIsSelectorOpen] = useState(false);

    useEffect(() => {
        if (isOpen) {
            try {
                // Ensure 3-Tier order matching Dashboard: 1st ESSENTIAL, 2nd HL BOOSTER, 3rd RECOMMENDED, 4th SUPPORTIVE
                const essentialItem = recommendedProducts.find(p => p.tier === 'ESSENTIAL' && p.productId !== 'hl_focus_booster');
                const recommendedItem = recommendedProducts.find(p => p.tier === 'RECOMMENDED' && p.productId !== 'hl_focus_booster');
                const supportiveItem = recommendedProducts.find(p => p.tier === 'SUPPORTIVE' && p.productId !== 'hl_focus_booster');

                const p1 = essentialItem ? PNT_PRODUCTS[essentialItem.productId] : (PNT_PRODUCTS['1000000021'] || PNT_PRODUCTS['active_b_complex']);
                const p2 = PNT_PRODUCTS['hl_focus_booster'];
                const p3 = recommendedItem ? PNT_PRODUCTS[recommendedItem.productId] : (PNT_PRODUCTS['calm_sleep'] || PNT_PRODUCTS['active_b_complex']);
                const p4 = supportiveItem ? PNT_PRODUCTS[supportiveItem.productId] : PNT_PRODUCTS['1000000001'];
                const p5 = PNT_PRODUCTS['1000000008'] || PNT_PRODUCTS['active_b_complex'];
                const p6 = PNT_PRODUCTS['1000000003'] || PNT_PRODUCTS['1000000002'];

                const logicBasedProducts = [p1, p2, p3, p4, p5, p6].filter(Boolean) as PntProduct[];

                const result = generateNutritionalPrescription(data, logicBasedProducts);
                setPrescription(result);
                setExtraProducts([]);
            } catch (error) {
                console.error("Failed to generate prescription:", error);
                setPrescription({
                    recommendedProducts: [],
                    symptomTags: [],
                    healthScore: 0,
                    counselorScript: "데이터 처리 중 오류가 발생했습니다. 입력된 데이터를 확인해주세요.",
                    lifestyleGuide: []
                });
            }
        }
    }, [isOpen, data, recommendedProducts]);

    if (!isOpen || !prescription) return null;

    const finalProducts = [
        ...prescription.recommendedProducts,
        ...extraProducts.filter(ep => !prescription.recommendedProducts.find(rp => rp.id === ep.id))
    ];

    const handleAddProduct = (product: PntProduct) => {
        setExtraProducts(prev => [...prev, product]);
        setIsSelectorOpen(false);
    };

    const handleRemoveProduct = (productId: string) => {
        if (prescription.recommendedProducts.find(p => p.id === productId)) {
            setPrescription(prev => prev ? ({
                ...prev,
                recommendedProducts: prev.recommendedProducts.filter(p => p.id !== productId)
            }) : null);
        } else {
            setExtraProducts(prev => prev.filter(p => p.id !== productId));
        }
    };

    // Helper function to categorize products
    const categorizeProducts = () => {
        const categories: Record<string, PntProduct[]> = {
            '뇌 기능 개선': [],
            '스트레스 관리': [],
            '신체 건강': [],
            '기타': []
        };

        finalProducts.forEach(product => {
            // Match actual PntProduct category values: Brain, Sleep, Fatigue, Immunity, etc.
            if (product.category === 'Brain') {
                categories['뇌 기능 개선'].push(product);
            } else if (product.category === 'Sleep' || product.category === 'Fatigue') {
                categories['스트레스 관리'].push(product);
            } else if (product.category === 'Immunity' || product.category === 'Circulation' || product.category === 'Liver' || product.category === 'Gut') {
                categories['신체 건강'].push(product);
            } else {
                categories['기타'].push(product);
            }
        });

        return categories;
    };

    const today = data.student.testDate || new Date().toISOString().split('T')[0];
    const age = data.student.age || (new Date().getFullYear() - new Date(data.student.birthDate).getFullYear());
    const genderStr = data.student.gender === 'Male' ? 'M' : 'F';
    const categories = categorizeProducts();

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <ProductSelector
                isOpen={isSelectorOpen}
                onClose={() => setIsSelectorOpen(false)}
                onSelect={handleAddProduct}
                selectedIds={finalProducts.map(p => p.id)}
            />

            <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
                {/* Top Control Bar (Non-printable) */}
                <div className="flex justify-between items-center p-4 border-b border-slate-200 bg-slate-50 print:hidden">
                    <div className="flex items-center gap-3">
                        <span className="bg-blue-600 text-white p-2 rounded-lg">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                        </span>
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">NBASS 영양처방전 미리보기</h2>
                            <p className="text-xs text-slate-500">인쇄용 전문 의학 문서</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsSelectorOpen(true)}
                            className="text-sm bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-100 font-bold transition-colors flex items-center gap-1"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            영양제 추가
                        </button>
                        <button
                            onClick={() => printElement('nutrition-prescription-print', `NBASS영양처방전_${data.student.name}`)}
                            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors shadow-lg flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                            인쇄
                        </button>
                        <button
                            onClick={onClose}
                            className="p-1.5 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Printable Content */}
                <div id="nutrition-prescription-print" className="flex-1 overflow-y-auto prescription-print-root">
                    <style>{`
                        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700;900&family=Roboto+Mono&display=swap');
                        .prescription-print-root { 
                            font-family: 'Noto Sans KR', sans-serif; 
                            -webkit-print-color-adjust: exact !important; 
                            print-color-adjust: exact !important; 
                        }
                        
                        .prescription-page { 
                            width: 210mm !important;
                            min-height: 297mm !important;
                            max-height: 297mm !important;
                            margin: 0 auto;
                            padding: 8mm !important;
                            box-sizing: border-box;
                            background-color: #f1f5f9 !important;
                            page-break-after: always !important;
                            position: relative;
                        }
                        
                        .prescription-card {
                            background-color: white !important;
                            border-radius: 0.75rem;
                            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1) !important;
                            border-top: 8px solid #1e40af !important;
                            padding: 1.5rem !important;
                            height: 100%;
                            display: flex;
                            flex-direction: column;
                        }
                        
                        @media print {
                            @page { size: A4; margin: 0; }
                            html, body { margin: 0 !important; padding: 0 !important; }
                            .prescription-page { 
                                margin: 0 !important; 
                                page-break-inside: avoid !important;
                                height: 297mm !important;
                            }
                            .prescription-card { 
                                box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1) !important;
                                page-break-inside: avoid !important;
                            }
                            .print\\:hidden { display: none !important; }
                        }
                    `}</style>

                    {/* PAGE 1 */}
                    <div className="prescription-page font-sans text-slate-800">
                        <div className="prescription-card">
                            {/* Clinical Header */}
                            <div className="border-b-2 border-slate-900 pb-2 mb-2 flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-900 text-white rounded-lg flex items-center justify-center font-serif text-2xl font-black italic tracking-tighter">
                                        ℞
                                    </div>
                                    <div>
                                        <div className="text-[8.5px] font-black tracking-widest text-slate-500 uppercase">Neuro-Endocrine Clinical Nutrition Protocol</div>
                                        <h1 className="text-xl font-black text-slate-900 tracking-tight">NBASS 정밀 영양 처방전</h1>
                                        <p className="text-[9px] text-slate-500 font-mono">CLINICAL NUTRACEUTICAL PRESCRIPTION & BIO-TARGETING</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="inline-block bg-slate-100 border border-slate-300 px-2 py-0.5 rounded text-[8.5px] font-mono text-slate-700 font-bold mb-0.5">
                                        DOC-ID: RX-{today.replace(/-/g, '').substring(2)}-{data.student.id.substring(0, 4)}
                                    </div>
                                    <div className="text-[9px] text-slate-600">처방 책임의: <strong className="text-slate-900 font-bold">{analystConfig ? getAnalystDisplayText(analystConfig) : 'Dr. Lim'}</strong></div>
                                </div>
                            </div>

                            {/* Patient Clinical Master Box */}
                            <div className="border border-slate-300 rounded-lg bg-slate-50/70 p-2 mb-2 text-xs">
                                <div className="grid grid-cols-5 gap-2">
                                    <div className="border-r border-slate-200 pr-2">
                                        <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">피검자 성명</span>
                                        <div className="text-xs font-black text-slate-900 mt-0.5">{data.student.name} <span className="text-[9px] font-normal text-slate-500">({genderStr}/{age}세)</span></div>
                                    </div>
                                    <div className="border-r border-slate-200 pr-2">
                                        <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">처방 일자</span>
                                        <div className="text-[10px] font-medium text-slate-800 mt-0.5">{today}</div>
                                    </div>
                                    <div className="border-r border-slate-200 pr-2">
                                        <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">임상 케어 축</span>
                                        <div className="text-[10px] font-bold text-indigo-700 mt-0.5">{data.careType || '자율신경 조절'}</div>
                                    </div>
                                    <div className="border-r border-slate-200 pr-2">
                                        <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">생체신호 상태</span>
                                        <div className="text-[10px] font-bold text-emerald-700 mt-0.5">자율신경 정밀연동</div>
                                    </div>
                                    <div>
                                        <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">뉴로 헬스 스코어</span>
                                        <div className="text-xs font-black text-blue-700 mt-0.5">{prescription.healthScore || 85} <span className="text-[9px] text-slate-500 font-normal">/ 100 pt</span></div>
                                    </div>
                                </div>
                            </div>

                            {/* Clinical Target Symptoms */}
                            <div className="mb-2">
                                <div className="text-[8.5px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                                    <span>임상 진단 바이오마커 및 개선 목표 (Target Indications)</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {(() => {
                                        const symptomTagMap: Record<string, string> = {
                                            'MEMORY_LOSS': '기억력 감퇴',
                                            'POOR_CIRCULATION': '혈액순환 불량',
                                            'BRAIN_FATIGUE': '뇌 피로',
                                            'STUDENT_FOCUS': '집중력 저하',
                                            'MUSCLE_TENSION': '근육 긴장',
                                            'SLEEP_DISORDER': '수면 장애',
                                            'ANXIETY': '불안',
                                            'ADRENAL_FATIGUE': '부신 피로',
                                            'BURNOUT': '번아웃',
                                            'HOMOCYSTEINE': '호모시스테인 상승',
                                            'IBS': '과민성 대장',
                                            'CONSTIPATION': '변비',
                                            'SENSITIVE_GUT': '민감성 장',
                                            'DRY_EYE': '안구 건조',
                                            'HIGH_LIPID': '고지혈증',
                                            'EYE_FATIGUE': '눈 피로',
                                            'IMMUNITY_LOW': '면역력 저하',
                                            'THYROID': '갑상선 기능 저하',
                                            'HASHIMOTO': '하시모토병',
                                            'OBESITY': '비만',
                                            'VITAMIN_C_MEGADOSE': '비타민C 메가도즈',
                                            'VITAMIN_C_SENSITIVE': '비타민C 민감',
                                            'FATIGUE_CHRONIC': '만성 피로',
                                            'LIVER_DYSFUNCTION': '간 기능 저하',
                                            'OXIDATIVE_STRESS': '산화 스트레스',
                                            'METABOLIC_SYNDROME': '대사 증후군',
                                            'DIGESTION_POOR': '소화 불량'
                                        };
                                        const translatedTags = (prescription.symptomTags || [])
                                            .map(tag => symptomTagMap[tag] || tag.replace(/_/g, ' '))
                                            .slice(0, 5);
                                        return translatedTags.map((tag, idx) => (
                                            <span key={idx} className="px-2 py-0.5 bg-white border border-rose-200 text-rose-800 text-[8.5px] font-bold rounded shadow-sm">
                                                #{tag}
                                            </span>
                                        ));
                                    })()}
                                </div>
                            </div>

                            {/* Clinical Opinion & Rationale Card */}
                            <div className="border border-blue-200 rounded-lg p-2.5 bg-gradient-to-b from-blue-50/40 to-slate-50 mb-2">
                                <div className="flex items-center justify-between border-b border-blue-200/80 pb-1 mb-1.5">
                                    <h3 className="text-[10px] font-black text-blue-950 uppercase flex items-center gap-1.5">
                                        <span className="text-blue-600 font-serif">📋</span> 임상 소견서 (Clinical Assessment & Strategy)
                                    </h3>
                                    <span className="text-[8px] font-mono text-blue-600 font-bold">NBASS PROTOCOL-2026</span>
                                </div>
                                <div className="bg-white border border-blue-100 rounded p-2 mb-2">
                                    <p className="text-slate-800 leading-relaxed text-[9px] font-medium whitespace-pre-wrap">
                                        {prescription.counselorScript}
                                    </p>
                                </div>

                                {/* 3-Axis Therapeutic Rationale */}
                                <div className="grid grid-cols-3 gap-1.5">
                                    {Object.entries(categories).map(([category, products]) => {
                                        if (products.length === 0) return null;

                                        let rationale = '';
                                        let targetMarker = '';

                                        switch (category) {
                                            case '뇌 기능 개선':
                                                rationale = '신경전달물질(ACh/GABA) 균형 및 뇌혈류 최적화';
                                                targetMarker = '작업기억 및 집중 지속력';
                                                break;
                                            case '스트레스 관리':
                                                rationale = 'HPA 축 조절 및 교감신경 긴장 이완, 수면 회복';
                                                targetMarker = '자율신경 균형도 및 코티솔';
                                                break;
                                            case '신체 건강':
                                                rationale = '만성 피로 해소, 세포 에너지(ATP) 대사 촉진';
                                                targetMarker = '부신 피로 및 미토콘드리아 활성';
                                                break;
                                        }

                                        return (
                                            <div key={category} className="bg-white rounded border border-slate-200 p-1.5 flex flex-col justify-between">
                                                <div>
                                                    <div className="flex items-center justify-between mb-0.5">
                                                        <span className="text-[9px] font-black text-slate-900">{category}</span>
                                                        <span className="text-[7.5px] px-1 bg-blue-50 text-blue-700 font-bold rounded">{products.length}종</span>
                                                    </div>
                                                    <p className="text-[8px] text-slate-600 leading-tight mb-1">{rationale}</p>
                                                </div>
                                                <div className="text-[7.5px] text-slate-400 border-t border-slate-100 pt-0.5">
                                                    <strong className="text-slate-600">지표:</strong> {targetMarker}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Clinical Administration & Lifestyle Guidance */}
                            <div className="border border-slate-200 rounded-lg p-2 bg-slate-900 text-white mb-2">
                                <div className="flex items-center justify-between border-b border-slate-700 pb-1 mb-1.5">
                                    <h3 className="text-[9.5px] font-bold text-emerald-400 flex items-center gap-1.5">
                                        <span>🩺</span> 임상 복용 지침 및 주의사항 (Administration Protocol)
                                    </h3>
                                    <span className="text-[8px] text-slate-400 font-mono">RX-GUIDE</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-[8.5px] text-slate-300">
                                    <div className="bg-slate-800/80 p-1.5 rounded border border-slate-700/60">
                                        <strong className="block text-emerald-300 font-bold mb-0.5">1. 복용 방법</strong>
                                        <p>충분한 미온수와 함께 복용하며 위장 민감 시 식후 30분 내 섭취</p>
                                    </div>
                                    <div className="bg-slate-800/80 p-1.5 rounded border border-slate-700/60">
                                        <strong className="block text-emerald-300 font-bold mb-0.5">2. 상호 작용</strong>
                                        <p>고카페인 음료와 2시간 이상 간격을 두고 복용 권장</p>
                                    </div>
                                    <div className="bg-slate-800/80 p-1.5 rounded border border-slate-700/60">
                                        <strong className="block text-emerald-300 font-bold mb-0.5">3. 모니터링</strong>
                                        <p>3개월 주기 재검사를 통해 생체 지표 개선도 추적 평가</p>
                                    </div>
                                </div>
                            </div>

                            {/* Official Verification Footer */}
                            <div className="mt-auto pt-2 border-t border-slate-200 flex justify-between items-end text-[8px] text-slate-400 font-mono">
                                <div>
                                    <p>ISSUED BY: NBASS NEURO-BIOMEDICAL RESEARCH CLINIC</p>
                                    <p>CONFIDENTIAL MEDICAL DATA • VERIFICATION CODE: NBASS-RX-{today.replace(/-/g, '')}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-sans font-bold text-slate-600">PAGE 01 OF 02</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* PAGE 2 - Product Details */}
                    <div className="prescription-page font-sans text-slate-800">
                        <div className="prescription-card">
                            {/* Header */}
                            <div className="border-b-2 border-slate-900 pb-2 mb-2 flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-900 text-white rounded-lg flex items-center justify-center font-serif text-2xl font-black italic tracking-tighter">
                                        ℞
                                    </div>
                                    <div>
                                        <div className="text-[8.5px] font-black tracking-widest text-slate-500 uppercase">Itemized Nutraceutical Regimen Specification</div>
                                        <h1 className="text-xl font-black text-slate-900 tracking-tight">처방 성분 및 복용 일정 상세표</h1>
                                        <p className="text-[9px] text-slate-500 font-mono">CLINICAL SPECIFICATIONS & ADMINISTRATION SCHEDULE</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="inline-block bg-slate-100 border border-slate-300 px-2 py-0.5 rounded text-[8.5px] font-mono text-slate-800 font-bold mb-0.5">
                                        TOTAL ITEMS: {finalProducts.length}
                                    </div>
                                    <div className="text-[9px] text-slate-600">처방의: <strong className="text-slate-900 font-bold">{analystConfig ? getAnalystDisplayText(analystConfig) : 'Dr. Lim'}</strong></div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                                    <span className="w-2 h-2 bg-blue-700 rounded-sm"></span>
                                    <span>맞춤 처방 제품군 상세 규격 ({finalProducts.length}종 전 품목)</span>
                                </h2>
                                <span className="text-[8px] text-slate-500 font-mono">DOSAGE & BIO-ACTIVE COMPOSITION</span>
                            </div>

                            {/* 6 Products Grid (2 cols x 3 rows) */}
                            <div className="grid grid-cols-2 gap-2 flex-1">
                                {finalProducts.slice(0, 6).map((product, index) => (
                                    <div key={`${product.id}-${index}`} className="border border-slate-300 bg-white rounded-lg p-2 flex items-start gap-2 text-[9px] shadow-sm relative overflow-hidden group">
                                        {/* Remove button - only visible on screen */}
                                        <button
                                            onClick={() => handleRemoveProduct(product.id)}
                                            className="absolute top-1.5 right-1.5 p-1 bg-white/80 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded opacity-0 group-hover:opacity-100 transition-all print:hidden"
                                            title="목록에서 제외"
                                        >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>

                                        <div className="flex-shrink-0 flex flex-col items-center gap-1">
                                            <div className="w-5 h-5 bg-slate-900 text-white rounded flex items-center justify-center font-mono font-black text-[10px]">
                                                0{index + 1}
                                            </div>
                                            <div className="w-12 h-12 rounded border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden p-0.5">
                                                <img
                                                    src={product.id === 'HL-COFFEE-001' ? '/hl_coffee_circle.png' : product.image}
                                                    alt={product.name}
                                                    className={`w-full h-full object-contain ${product.id === 'HL-COFFEE-001' ? 'p-0.5' : 'mix-blend-multiply'}`}
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                    }}
                                                />
                                            </div>
                                            <span className="text-[7px] px-1 py-0.2 bg-slate-100 text-slate-700 rounded font-bold uppercase font-mono border border-slate-200">
                                                {product.category}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="border-b border-slate-100 pb-0.5 mb-1">
                                                <h3 className="text-[10px] font-black text-slate-900 truncate leading-tight">{product.name}</h3>
                                                <p className="text-[8px] text-indigo-700 font-bold truncate">{product.subName}</p>
                                            </div>
                                            <div className="space-y-0.5 text-[8px]">
                                                <div>
                                                    <strong className="text-slate-500 font-bold">주요 성분: </strong>
                                                    <span className="text-slate-800 font-medium">{product.mainIngredients?.slice(0, 3).join(', ')}</span>
                                                </div>
                                                <div>
                                                    <strong className="text-slate-500 font-bold">표적 증상: </strong>
                                                    <span className="text-slate-700">{product.targetSymptoms?.slice(0, 2).join(', ')}</span>
                                                </div>
                                                <div className="bg-blue-50/80 border border-blue-200 rounded px-1.5 py-0.5 mt-1 flex justify-between items-center text-[7.5px]">
                                                    <span className="font-bold text-blue-900">권장 복용: <strong>{product.timing || '식후 30분 1회'}</strong></span>
                                                    <span className="text-blue-700 font-mono font-bold">1일 1회</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Important Notice */}
                            <div className="border border-amber-300 bg-amber-50/70 rounded-lg p-2 mt-2 text-[8px]">
                                <div className="flex items-center gap-1 text-amber-900 font-bold text-[8.5px] mb-0.5">
                                    <span>⚠️</span>
                                    <span>임상 복약 지도 및 안내사항 (Medical Advisory)</span>
                                </div>
                                <ul className="text-[8px] text-amber-900 space-y-0.5 leading-tight">
                                    <li>• 본 처방전은 신경생리학적 데이터 분석을 기반으로 작성된 맞춤 영양 관리 프로토콜입니다.</li>
                                    <li>• 기저질환이 있거나 전문의약품을 복용 중인 경우 주치의 또는 담당 약사와 사전 상담 후 섭취하십시오.</li>
                                    <li>• 권장 복용량과 복용 타이밍을 준수하며 이상 반응 발생 시 즉시 복용을 중단하십시오.</li>
                                </ul>
                            </div>

                            {/* Footer & Official Seal */}
                            <div className="mt-auto pt-2 border-t border-slate-200 flex justify-between items-end text-[8.5px]">
                                <div className="text-slate-500 font-mono text-[8px]">
                                    <p>ISSUING CENTER: NBASS ADVANCED NEURO-NUTRITION CENTER</p>
                                    <p>VALIDATION: NBASS-VERIFIED-OFFICIAL • CONFIDENTIAL</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-slate-500 font-medium mb-0.5 text-[8.5px]">처방 책임 전문위원 (Doctor in Charge)</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-black text-slate-900">{analystConfig ? getAnalystDisplayText(analystConfig) : 'Dr. Lim'}</span>
                                        <span className="inline-block w-7 h-7 rounded-full border-2 border-red-600 text-red-600 font-black text-[8.5px] flex items-center justify-center rotate-[-12deg] shadow-sm">
                                            (처방인)
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

