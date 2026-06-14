
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
                const logicBasedProducts = recommendedProducts
                    .map(p => PNT_PRODUCTS[p.productId])
                    .filter(p => p !== undefined);

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
                    <div className="prescription-page">
                        <div className="prescription-card">
                            {/* Header */}
                            <div className="flex flex-col md:flex-row justify-between items-start border-b-2 border-slate-200 pb-2 mb-2">
                                <div>
                                    <div className="text-blue-700 font-bold text-xs tracking-widest uppercase">Neuro-Bio Academic Strategy System</div>
                                    <h1 className="text-2xl font-black text-slate-800">NBASS 영양처방전</h1>
                                    <p className="text-slate-500 text-xs italic">Personalized Nutritional Prescription</p>
                                </div>
                                <div className="mt-2 md:mt-0 text-right">
                                    <div className="inline-block bg-slate-100 px-3 py-1 rounded text-xs font-mono text-slate-600 mb-1">Ver 2.5.0-Precision</div>
                                    <div className="text-xs font-medium">처방책임자: <span className="text-blue-700">{analystConfig ? getAnalystDisplayText(analystConfig) : 'Dr. Lim'}</span></div>
                                </div>
                            </div>

                            {/* Patient Info */}
                            <div className="grid grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl mb-2 border border-slate-100">
                                <div>
                                    <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">피검자 성명</label>
                                    <div className="text-base font-bold">{data.student.name} <span className="text-sm font-normal text-slate-500">({genderStr} / {age}세)</span></div>
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">처방 코드</label>
                                    <div className="text-sm font-mono font-medium">RX-{today.replace(/-/g, '').substring(2)}-{data.student.id.substring(0, 4)}</div>
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">처방 일시</label>
                                    <div className="text-sm">{today}</div>
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">건강 점수</label>
                                    <div className="text-sm font-bold text-blue-600">{prescription.healthScore}/100</div>
                                </div>
                            </div>

                            {/* Symptoms Tags - Korean Translation */}
                            <div className="mb-2">
                                <h3 className="text-xs font-bold text-slate-400 uppercase mb-1 tracking-wider">주요 증상 및 개선 목표</h3>
                                <div className="flex flex-wrap gap-2">
                                    {(() => {
                                        // Korean translation map
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

                                        // Translate and limit to top 5
                                        const translatedTags = prescription.symptomTags
                                            .map(tag => symptomTagMap[tag] || tag.replace(/_/g, ' '))
                                            .slice(0, 5);

                                        return translatedTags.map((tag, idx) => (
                                            <span key={idx} className="px-2 py-1 bg-red-50 text-red-600 text-xs font-bold rounded border border-red-100">
                                                {tag}
                                            </span>
                                        ));
                                    })()}
                                </div>
                            </div>

                            {/* Expert Consultation Guide - Detailed */}
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-xl border-2 border-blue-200 mb-2">
                                <h3 className="text-xs font-black text-blue-800 uppercase mb-2 flex items-center gap-2 border-b-2 border-blue-300 pb-1">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    전문가 소견 및 처방 근거
                                </h3>
                                <div className="bg-white/70 rounded-lg p-2 mb-2">
                                    <p className="text-slate-800 leading-relaxed text-xs font-medium whitespace-pre-wrap">
                                        {prescription.counselorScript}
                                    </p>
                                </div>

                                {/* Why These Supplements - Category-based explanation */}
                                <div className="space-y-2">
                                    {Object.entries(categories).map(([category, products]) => {
                                        if (products.length === 0) return null;

                                        let rationale = '';
                                        let benefits: string[] = [];

                                        switch (category) {
                                            case '뇌 기능 개선':
                                                rationale = '뇌파 분석 결과 집중력/기억력 지표 이탈. 신경전달물질 균형 회복 필요.';
                                                benefits = [
                                                    '아세틸콜린 생성으로 기억력 향상',
                                                    '뇌 혈류 증가로 영양소 공급 최적화'
                                                ];
                                                break;
                                            case '스트레스 관리':
                                                rationale = 'HRV 분석상 교감신경 과항진, 코티솔 상승 추정. 수면 개선 시급.';
                                                benefits = [
                                                    'GABA 활성화로 신경 흥분 억제',
                                                    '수면 주기 정상화 및 스트레스 적응력 향상'
                                                ];
                                                break;
                                            case '신체 건강':
                                                rationale = '신체 지표상 만성 염증 또는 면역 저하 의심. 전신 건강 회복 필요.';
                                                benefits = [
                                                    '항산화 작용으로 세포 손상 방지',
                                                    '면역 활성화 및 혈액순환 개선'
                                                ];
                                                break;
                                        }

                                        return (
                                            <div key={category} className="bg-white rounded-lg p-2 border border-slate-200">
                                                <h4 className="text-xs font-black text-slate-700 mb-1 flex items-center gap-1.5">
                                                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                                                    {category} ({products.length}개 제품)
                                                </h4>
                                                <p className="text-[11px] text-slate-600 leading-relaxed">
                                                    <strong className="text-blue-700">처방 근거:</strong> {rationale}
                                                </p>
                                                <div className="text-[11px] text-slate-700">
                                                    <strong className="text-emerald-700">기대 효과:</strong>
                                                    <ul className="list-disc list-inside ml-2">
                                                        {benefits.map((benefit, idx) => (
                                                            <li key={idx}>{benefit}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Lifestyle Guide */}
                            <div className="bg-slate-900 text-white p-2 rounded-xl mb-2">
                                <h3 className="text-xs font-bold text-blue-300 mb-1 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" /></svg>
                                    복용 지도 및 생활 습관 개선
                                </h3>
                                <ul className="text-[11px] space-y-0.5 text-slate-300">
                                    {prescription.lifestyleGuide.map((guide, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <span className="text-blue-400 mt-0.5">•</span>
                                            <span>{guide}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Footer */}
                            <div className="mt-auto pt-3 border-t border-slate-100 flex justify-between text-[10px] text-slate-400 font-medium">
                                <p>© 2026 NEURO-EDULAB. 본 처방전은 의료법에 따라 기밀로 취급됩니다.</p>
                                <p className="uppercase tracking-widest">PRESCRIPTION : PAGE 01</p>
                            </div>
                        </div>
                    </div>

                    {/* PAGE 2 - Product Details */}
                    <div className="prescription-page">
                        <div className="prescription-card">
                            {/* Header (Repeated) */}
                            <div className="flex flex-col md:flex-row justify-between items-start border-b-2 border-slate-200 pb-3 mb-4">
                                <div>
                                    <div className="text-blue-700 font-bold text-xs tracking-widest uppercase">Neuro-Bio Academic Strategy System</div>
                                    <h1 className="text-2xl font-black text-slate-800">NBASS 영양처방전</h1>
                                    <p className="text-slate-500 text-xs italic">Personalized Nutritional Prescription</p>
                                </div>
                                <div className="mt-2 md:mt-0 text-right">
                                    <div className="inline-block bg-slate-100 px-3 py-1 rounded text-xs font-mono text-slate-600 mb-1">Ver 2.5.0-Precision</div>
                                    <div className="text-xs font-medium">처방책임자: <span className="text-blue-700">{analystConfig ? getAnalystDisplayText(analystConfig) : 'Dr. Lim'}</span></div>
                                </div>
                            </div>

                            {/* Product Details */}
                            <div className="flex-1 overflow-hidden">
                                <h2 className="text-sm font-black text-slate-800 mb-3 border-l-4 border-blue-600 pl-2">처방 제품 상세 ({finalProducts.length}개)</h2>

                                {finalProducts.length === 0 ? (
                                    <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                                        현재 처방된 제품이 없습니다.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-2">
                                        {finalProducts.map((product, index) => (
                                            <div key={`${product.id}-${index}`} className="bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-lg p-3 relative group print:break-inside-avoid">
                                                {/* Remove button - only visible on screen */}
                                                <button
                                                    onClick={() => handleRemoveProduct(product.id)}
                                                    className="absolute top-2 right-2 p-1 bg-white/80 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded opacity-0 group-hover:opacity-100 transition-all print:hidden"
                                                    title="목록에서 제외"
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>

                                                <div className="flex items-start gap-3">
                                                    <div className="flex-shrink-0 flex items-center gap-2">
                                                        <div className="w-6 h-6 bg-blue-600 text-white rounded flex items-center justify-center font-black text-xs">
                                                            {index + 1}
                                                        </div>
                                                        <img
                                                            src={product.image}
                                                            alt={product.name}
                                                            className="w-12 h-12 rounded-lg border border-slate-200 object-cover"
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = 'none';
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-baseline gap-2 mb-1">
                                                            <h3 className="text-sm font-black text-slate-800">{product.name}</h3>
                                                            <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-bold">{product.category}</span>
                                                        </div>
                                                        <p className="text-[11px] text-slate-600 leading-relaxed mb-1.5">{product.subName}</p>

                                                        {/* Key Ingredients */}
                                                        <div className="mb-1.5">
                                                            <span className="text-[10px] font-bold text-emerald-700 uppercase">주요 성분:</span>
                                                            <div className="flex flex-wrap gap-1 mt-1">
                                                                {product.mainIngredients?.map((ing, i) => (
                                                                    <span key={i} className="text-[10px] px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-200 font-medium">
                                                                        {ing}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Target Symptoms */}
                                                        <div>
                                                            <span className="text-[10px] font-bold text-blue-700 uppercase">목표 증상:</span>
                                                            <ul className="text-[10px] text-slate-700 mt-0.5 grid grid-cols-2 gap-x-4">
                                                                {product.targetSymptoms?.slice(0, 4).map((symptom, i) => (
                                                                    <li key={i} className="flex items-start gap-1">
                                                                        <span className="text-blue-500">•</span>
                                                                        <span>{symptom}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Important Notice */}
                                <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-3 mt-4">
                                    <h4 className="text-xs font-black text-amber-800 mb-1.5 flex items-center gap-1.5">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm0 3.5L19.5 19h-15L12 5.5zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z" /></svg>
                                        중요 안내사항
                                    </h4>
                                    <ul className="text-[10px] text-amber-900 space-y-0.5 leading-relaxed">
                                        <li>• 본 처방전은 신경생리학적 데이터 분석을 기반으로 작성되었으며, 의학적 진단을 대체하지 않습니다.</li>
                                        <li>• 기저질환이 있거나 약물 복용 중인 경우 반드시 의사와 상담 후 섭취하시기 바랍니다.</li>
                                        <li>• 권장 복용량을 준수하며, 이상 반응 발생 시 즉시 복용을 중단하고 전문가와 상담하십시오.</li>
                                        <li>• 영양제는 균형 잡힌 식사와 규칙적인 생활습관을 보조하는 수단이며, 이를 대체할 수 없습니다.</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="mt-auto pt-3 border-t border-slate-100 flex justify-between text-[10px] text-slate-400 font-medium">
                                <p>© 2026 NEURO-EDULAB. 본 처방전은 의료법에 따라 기밀로 취급됩니다.</p>
                                <p className="uppercase tracking-widest">PRESCRIPTION : PAGE 02</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

