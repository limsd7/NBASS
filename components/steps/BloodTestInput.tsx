import React, { useMemo } from 'react';
import { BloodTestData } from '../../types';
import { getBloodTestRanges } from '../../services/medicalEngine';

interface BloodTestInputProps {
    bloodTest: BloodTestData;
    onChange: (data: BloodTestData) => void;
    onNext: () => void;
    onBack: () => void;
    gender?: 'Male' | 'Female' | 'Other';
}

export const BloodTestInput: React.FC<BloodTestInputProps> = ({
    bloodTest,
    onChange,
    onNext,
    onBack,
    gender = 'Male' as 'Male' | 'Female' | 'Other'
}) => {
    const updateField = (field: keyof BloodTestData, value: number) => {
        onChange({ ...bloodTest, [field]: value });
    };

    const isComplete = () => {
        return bloodTest.hemoglobin > 0 && bloodTest.mcv > 0 && bloodTest.vitaminD > 0;
    };

    // 정상범위 가져오기
    const ranges = useMemo(() => getBloodTestRanges(gender), [gender]);

    // 값의 상태 판정 (정상/이상)
    const getValueStatus = (field: keyof typeof ranges, value: number): 'normal' | 'low' | 'high' | 'empty' => {
        if (!value || value === 0) return 'empty';
        const range = ranges[field];
        if (!range) return 'normal';
        if (value < range.min) return 'low';
        if (value > range.max) return 'high';
        return 'normal';
    };

    // 상태에 따른 테두리 색상 클래스
    const getBorderClass = (status: 'normal' | 'low' | 'high' | 'empty'): string => {
        switch (status) {
            case 'normal': return 'border-emerald-500 bg-emerald-50';
            case 'low': return 'border-blue-500 bg-blue-50';
            case 'high': return 'border-rose-500 bg-rose-50';
            default: return 'border-slate-200';
        }
    };

    // 상태 아이콘
    const getStatusIcon = (status: 'normal' | 'low' | 'high' | 'empty'): string => {
        switch (status) {
            case 'normal': return '✅';
            case 'low': return '⬇️';
            case 'high': return '⬆️';
            default: return '';
        }
    };

    return (
        <div className="w-full max-w-full animate-in fade-in duration-500">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-rose-600 to-pink-600 p-8 text-white">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">🩸</span>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest opacity-70">Medical Expert Mode</p>
                            <h2 className="text-2xl font-black">혈액검사 결과 입력</h2>
                        </div>
                    </div>
                    <p className="text-rose-100 text-sm mt-2">
                        정확한 분석을 위해 최근 혈액검사 결과를 입력해 주세요.
                    </p>
                </div>

                {/* Warning Banner */}
                <div className="bg-amber-50 border-b border-amber-200 px-6 py-4">
                    <div className="flex items-start gap-3">
                        <span className="text-xl">⚠️</span>
                        <div>
                            <p className="font-bold text-amber-800 text-sm">검사 전 주의사항</p>
                            <p className="text-amber-700 text-xs mt-1">
                                정확한 결과를 위해 <strong>8-12시간 금식</strong> 후 채혈한 결과를 입력해 주세요.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form Content */}
                <div className="p-8 space-y-8">
                    {/* CBC Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-1 h-6 bg-rose-500 rounded-full"></div>
                            <h3 className="font-bold text-slate-800">CBC (Complete Blood Count) - 혈구 분석</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className={`p-3 rounded-xl transition-all ${getValueStatus('wbc', bloodTest.wbc) !== 'empty' ? getBorderClass(getValueStatus('wbc', bloodTest.wbc)) : 'bg-slate-50'}`}>
                                <div className="flex justify-between items-start">
                                    <label className="block text-xs font-bold text-slate-600 mb-1">WBC (×10³/μL)</label>
                                    <span>{getStatusIcon(getValueStatus('wbc', bloodTest.wbc))}</span>
                                </div>
                                <p className="text-[10px] text-slate-400 mb-2">백혈구 수 - 감염/염증/스트레스 지표</p>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={bloodTest.wbc || ''}
                                    onChange={(e) => updateField('wbc', parseFloat(e.target.value) || 0)}
                                    placeholder="6.5"
                                    className={`w-full p-3 border-2 rounded-xl text-center font-bold text-lg outline-none transition-all bg-white ${getValueStatus('wbc', bloodTest.wbc) !== 'empty' ? getBorderClass(getValueStatus('wbc', bloodTest.wbc)) : 'border-slate-200 focus:border-rose-500'}`}
                                />
                                <p className="text-[10px] text-slate-400 mt-1 text-center">정상: 4.0-10.0</p>
                            </div>
                            <div className={`p-3 rounded-xl transition-all ${getValueStatus('hemoglobin', bloodTest.hemoglobin) !== 'empty' ? getBorderClass(getValueStatus('hemoglobin', bloodTest.hemoglobin)) : 'bg-slate-50'}`}>
                                <div className="flex justify-between items-start">
                                    <label className="block text-xs font-bold text-slate-600 mb-1">Hemoglobin (g/dL)</label>
                                    <span>{getStatusIcon(getValueStatus('hemoglobin', bloodTest.hemoglobin))}</span>
                                </div>
                                <p className="text-[10px] text-slate-400 mb-2">혈색소 - 산소운반/빈혈/피로 지표</p>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={bloodTest.hemoglobin || ''}
                                    onChange={(e) => updateField('hemoglobin', parseFloat(e.target.value) || 0)}
                                    placeholder="13.5"
                                    className={`w-full p-3 border-2 rounded-xl text-center font-bold text-lg outline-none transition-all bg-white ${getValueStatus('hemoglobin', bloodTest.hemoglobin) !== 'empty' ? getBorderClass(getValueStatus('hemoglobin', bloodTest.hemoglobin)) : 'border-slate-200 focus:border-rose-500'}`}
                                />
                                <p className="text-[10px] text-slate-400 mt-1 text-center">정상: 남 13-17 / 여 12-16</p>
                            </div>
                            <div className={`p-3 rounded-xl transition-all ${getValueStatus('hematocrit', bloodTest.hematocrit) !== 'empty' ? getBorderClass(getValueStatus('hematocrit', bloodTest.hematocrit)) : 'bg-slate-50'}`}>
                                <div className="flex justify-between items-start">
                                    <label className="block text-xs font-bold text-slate-600 mb-1">Hematocrit (%)</label>
                                    <span>{getStatusIcon(getValueStatus('hematocrit', bloodTest.hematocrit))}</span>
                                </div>
                                <p className="text-[10px] text-slate-400 mb-2">헤마토크리트 - 혈액농도/탈수 지표</p>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={bloodTest.hematocrit || ''}
                                    onChange={(e) => updateField('hematocrit', parseFloat(e.target.value) || 0)}
                                    placeholder="42"
                                    className={`w-full p-3 border-2 rounded-xl text-center font-bold text-lg outline-none transition-all bg-white ${getValueStatus('hematocrit', bloodTest.hematocrit) !== 'empty' ? getBorderClass(getValueStatus('hematocrit', bloodTest.hematocrit)) : 'border-slate-200 focus:border-rose-500'}`}
                                />
                                <p className="text-[10px] text-slate-400 mt-1 text-center">정상: 남 40-54 / 여 36-48</p>
                            </div>
                            <div className={`p-3 rounded-xl transition-all ${getValueStatus('mcv', bloodTest.mcv) !== 'empty' ? getBorderClass(getValueStatus('mcv', bloodTest.mcv)) : 'bg-slate-50'}`}>
                                <div className="flex justify-between items-start">
                                    <label className="block text-xs font-bold text-slate-600 mb-1">MCV (fL)</label>
                                    <span>{getStatusIcon(getValueStatus('mcv', bloodTest.mcv))}</span>
                                </div>
                                <p className="text-[10px] text-slate-400 mb-2">평균적혈구용적 - ≥100시 만성피로</p>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={bloodTest.mcv || ''}
                                    onChange={(e) => updateField('mcv', parseFloat(e.target.value) || 0)}
                                    placeholder="88"
                                    className={`w-full p-3 border-2 rounded-xl text-center font-bold text-lg outline-none transition-all bg-white ${getValueStatus('mcv', bloodTest.mcv) !== 'empty' ? getBorderClass(getValueStatus('mcv', bloodTest.mcv)) : 'border-slate-200 focus:border-rose-500'}`}
                                />
                                <p className="text-[10px] text-slate-400 mt-1 text-center">정상: 80-100</p>
                            </div>
                            <div className={`p-3 rounded-xl col-span-2 md:col-span-2 transition-all ${getValueStatus('nkActivity', bloodTest.nkActivity) !== 'empty' ? getBorderClass(getValueStatus('nkActivity', bloodTest.nkActivity)) : 'bg-slate-50'}`}>
                                <div className="flex justify-between items-start">
                                    <label className="block text-xs font-bold text-slate-600 mb-1">NK Cell 활성도 (%)</label>
                                    <span>{getStatusIcon(getValueStatus('nkActivity', bloodTest.nkActivity))}</span>
                                </div>
                                <p className="text-[10px] text-slate-400 mb-2">자연살해세포 - 면역력/암세포 제거능력</p>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={bloodTest.nkActivity || ''}
                                    onChange={(e) => updateField('nkActivity', parseFloat(e.target.value) || 0)}
                                    placeholder="30"
                                    className={`w-full p-3 border-2 rounded-xl text-center font-bold text-lg outline-none transition-all bg-white ${getValueStatus('nkActivity', bloodTest.nkActivity) !== 'empty' ? getBorderClass(getValueStatus('nkActivity', bloodTest.nkActivity)) : 'border-slate-200 focus:border-rose-500'}`}
                                />
                                <p className="text-[10px] text-slate-400 mt-1 text-center">정상: 15-40 (↓시 만성피로/면역저하)</p>
                            </div>
                        </div>
                    </div>

                    {/* Metabolic Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-1 h-6 bg-amber-500 rounded-full"></div>
                            <h3 className="font-bold text-slate-800">대사 지표 - 염증/당뇨/영양 상태</h3>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className={`p-3 rounded-xl transition-all ${getValueStatus('vitaminD', bloodTest.vitaminD) !== 'empty' ? getBorderClass(getValueStatus('vitaminD', bloodTest.vitaminD)) : 'bg-amber-50'}`}>
                                <div className="flex justify-between items-start">
                                    <label className="block text-xs font-bold text-amber-700 mb-1">비타민 D (ng/mL)</label>
                                    <span>{getStatusIcon(getValueStatus('vitaminD', bloodTest.vitaminD))}</span>
                                </div>
                                <p className="text-[10px] text-amber-600 mb-2">골대사/면역/정신건강 - ↓시 우울/피로</p>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={bloodTest.vitaminD || ''}
                                    onChange={(e) => updateField('vitaminD', parseFloat(e.target.value) || 0)}
                                    placeholder="32"
                                    className={`w-full p-3 border-2 rounded-xl text-center font-bold text-lg outline-none transition-all bg-white ${getValueStatus('vitaminD', bloodTest.vitaminD) !== 'empty' ? getBorderClass(getValueStatus('vitaminD', bloodTest.vitaminD)) : 'border-amber-200 focus:border-amber-500'}`}
                                />
                                <p className="text-[10px] text-amber-500 mt-1 text-center">&lt;20 결핍 / 20-30 부족 / 30+ 정상</p>
                            </div>
                            <div className={`p-3 rounded-xl transition-all ${getValueStatus('crp', bloodTest.crp) !== 'empty' ? getBorderClass(getValueStatus('crp', bloodTest.crp)) : 'bg-amber-50'}`}>
                                <div className="flex justify-between items-start">
                                    <label className="block text-xs font-bold text-amber-700 mb-1">CRP (mg/dL)</label>
                                    <span>{getStatusIcon(getValueStatus('crp', bloodTest.crp))}</span>
                                </div>
                                <p className="text-[10px] text-amber-600 mb-2">C반응성단백 - 급성/만성 염증 지표</p>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={bloodTest.crp || ''}
                                    onChange={(e) => updateField('crp', parseFloat(e.target.value) || 0)}
                                    placeholder="0.3"
                                    className={`w-full p-3 border-2 rounded-xl text-center font-bold text-lg outline-none transition-all bg-white ${getValueStatus('crp', bloodTest.crp) !== 'empty' ? getBorderClass(getValueStatus('crp', bloodTest.crp)) : 'border-amber-200 focus:border-amber-500'}`}
                                />
                                <p className="text-[10px] text-amber-500 mt-1 text-center">&lt;0.5 정상 / ↑ 염증/스트레스</p>
                            </div>
                            <div className={`p-3 rounded-xl transition-all ${getValueStatus('hba1c', bloodTest.hba1c) !== 'empty' ? getBorderClass(getValueStatus('hba1c', bloodTest.hba1c)) : 'bg-amber-50'}`}>
                                <div className="flex justify-between items-start">
                                    <label className="block text-xs font-bold text-amber-700 mb-1">HbA1c (%)</label>
                                    <span>{getStatusIcon(getValueStatus('hba1c', bloodTest.hba1c))}</span>
                                </div>
                                <p className="text-[10px] text-amber-600 mb-2">당화혈색소 - 2-3개월 평균 혈당</p>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={bloodTest.hba1c || ''}
                                    onChange={(e) => updateField('hba1c', parseFloat(e.target.value) || 0)}
                                    placeholder="5.4"
                                    className={`w-full p-3 border-2 rounded-xl text-center font-bold text-lg outline-none transition-all bg-white ${getValueStatus('hba1c', bloodTest.hba1c) !== 'empty' ? getBorderClass(getValueStatus('hba1c', bloodTest.hba1c)) : 'border-amber-200 focus:border-amber-500'}`}
                                />
                                <p className="text-[10px] text-amber-500 mt-1 text-center">&lt;5.7 정상 / 5.7-6.4 전당뇨 / ≥6.5 당뇨</p>
                            </div>
                        </div>
                    </div>

                    {/* Liver & Kidney Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-1 h-6 bg-emerald-500 rounded-full"></div>
                            <h3 className="font-bold text-slate-800">간/신장 기능</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-4 rounded-xl">
                                <p className="text-xs font-bold text-slate-500 mb-3">간기능 검사</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1">AST (U/L)</label>
                                        <input
                                            type="number"
                                            value={bloodTest.ast || ''}
                                            onChange={(e) => updateField('ast', parseFloat(e.target.value) || 0)}
                                            placeholder="25"
                                            className="w-full p-2 border border-slate-200 rounded-lg text-center font-bold focus:border-emerald-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1">ALT (U/L)</label>
                                        <input
                                            type="number"
                                            value={bloodTest.alt || ''}
                                            onChange={(e) => updateField('alt', parseFloat(e.target.value) || 0)}
                                            placeholder="22"
                                            className="w-full p-2 border border-slate-200 rounded-lg text-center font-bold focus:border-emerald-500 outline-none"
                                        />
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-2 text-center">정상: 0-40</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl">
                                <p className="text-xs font-bold text-slate-500 mb-3">신장기능 검사</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1">Creatinine (mg/dL)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={bloodTest.creatinine || ''}
                                            onChange={(e) => updateField('creatinine', parseFloat(e.target.value) || 0)}
                                            placeholder="0.9"
                                            className="w-full p-2 border border-slate-200 rounded-lg text-center font-bold focus:border-emerald-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1">BUN (mg/dL)</label>
                                        <input
                                            type="number"
                                            value={bloodTest.bun || ''}
                                            onChange={(e) => updateField('bun', parseFloat(e.target.value) || 0)}
                                            placeholder="15"
                                            className="w-full p-2 border border-slate-200 rounded-lg text-center font-bold focus:border-emerald-500 outline-none"
                                        />
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-2 text-center">Cr: 0.5-1.3 / BUN: 7-20</p>
                            </div>
                        </div>
                    </div>

                    {/* Fasting Hours */}
                    <div className="bg-blue-50 p-4 rounded-xl">
                        <label className="block text-xs font-bold text-blue-700 mb-2">
                            금식 시간 (선택사항)
                        </label>
                        <div className="flex items-center gap-3">
                            <input
                                type="number"
                                value={bloodTest.fastingHours || ''}
                                onChange={(e) => updateField('fastingHours', parseInt(e.target.value) || 0)}
                                placeholder="10"
                                className="w-24 p-2 border border-blue-200 rounded-lg text-center font-bold focus:border-blue-500 outline-none"
                            />
                            <span className="text-blue-600 text-sm">시간</span>
                            <span className="text-blue-400 text-xs">권장: 8-12시간</span>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-between">
                    <button
                        onClick={onBack}
                        className="px-6 py-3 text-slate-500 font-bold rounded-xl hover:bg-slate-100 transition-colors"
                    >
                        ← 이전 단계
                    </button>
                    <button
                        onClick={onNext}
                        disabled={!isComplete()}
                        className={`px-8 py-3 font-bold rounded-xl transition-all ${isComplete()
                            ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-100'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            }`}
                    >
                        분석 시작 →
                    </button>
                </div>
            </div>
        </div>
    );
};
