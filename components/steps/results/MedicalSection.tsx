import React from 'react';
import { AssessmentResult, CareType, BloodTestData } from '../../../types';

interface MedicalSectionProps {
    result: AssessmentResult;
    config: {
        isMedicalMode: boolean;
    };
}

export const MedicalSection: React.FC<MedicalSectionProps> = ({ result, config }) => {
    // Only show if medical mode is enabled and analysis exists
    if (!(config.isMedicalMode || result.medicalAnalysis) || !result.medicalAnalysis) {
        return null;
    }

    const bloodTestItems = [
        { name: 'Hemoglobin (Hg)', key: 'hemoglobin', unit: 'g/dL' },
        { name: 'MCV', key: 'mcv', unit: 'fL' },
        { name: 'NK 활성도', key: 'nkActivity', unit: '%' },
        { name: '비타민 D', key: 'vitaminD', unit: 'ng/mL' },
        { name: 'CRP', key: 'crp', unit: 'mg/L' },
        { name: 'HbA1c', key: 'hba1c', unit: '%' },
        { name: 'AST', key: 'ast', unit: 'U/L' },
        { name: 'ALT', key: 'alt', unit: 'U/L' },
        { name: 'Creatinine', key: 'creatinine', unit: 'mg/dL' },
        { name: 'BUN', key: 'bun', unit: 'mg/dL' }
    ];

    return (
        <div className="mt-12 p-8 bg-rose-50/50 rounded-3xl border-2 border-rose-100 print:bg-white print:border-slate-200">
            <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">🩺</span>
                <div>
                    <h3 className="text-xl font-black text-rose-900">의학적 정밀 분석 (Medical Expert Analysis)</h3>
                    <p className="text-xs text-rose-600 font-bold">혈액검사 결과 기반 생체 지표 분석</p>
                </div>
            </div>

            <div className="prose prose-rose max-w-none">
                <div className="overflow-x-auto mb-8">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="border-b-2 border-rose-200 bg-rose-100/50">
                                <th className="py-2 px-4 text-left font-black text-rose-900">검사항목</th>
                                <th className="py-2 px-4 text-center font-black text-rose-900">측정값</th>
                                <th className="py-2 px-4 text-center font-black text-rose-900">정상범위</th>
                                <th className="py-2 px-4 text-center font-black text-rose-900">판정</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bloodTestItems.map(item => {
                                const finding = result.medicalAnalysis?.abnormalFindings.find(f => f.item === item.key);
                                const value = (result.bloodTest as any)?.[item.key];
                                const statusIcon = finding
                                    ? (finding.status === 'critical' ? '🚨' : finding.status === 'high' ? '⬆️' : finding.status === 'low' ? '⬇️' : '✅')
                                    : '✅';
                                const statusColor = finding ? (finding.status === 'critical' ? 'text-red-600' : 'text-amber-600') : 'text-emerald-600';

                                return (
                                    <tr key={item.key} className="border-b border-rose-100 hover:bg-rose-50/50 transition-colors">
                                        <td className="py-2 px-4 font-bold text-slate-700">{item.name}</td>
                                        <td className="py-2 px-4 text-center font-black">{value} <span className="text-[10px] text-slate-400 font-normal">{item.unit}</span></td>
                                        <td className="py-2 px-4 text-center text-slate-500 text-xs">{finding?.normalRange || '-'}</td>
                                        <td className={`py-2 px-4 text-center text-lg ${statusColor}`}>{statusIcon}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="space-y-6">
                    <section>
                        <h4 className="flex items-center gap-2 text-rose-800 font-bold text-sm mb-2">
                            <span className="w-1 h-4 bg-rose-500 rounded-full"></span>
                            CareType 연관 분석
                        </h4>
                        <div className="bg-white p-4 rounded-xl border border-rose-100 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap italic">
                            {result.medicalAnalysis.careTypeCorrelation}
                        </div>
                    </section>

                    <section>
                        <h4 className="flex items-center gap-2 text-rose-800 font-bold text-sm mb-2">
                            <span className="w-1 h-4 bg-rose-500 rounded-full"></span>
                            의학적 권고사항
                        </h4>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {result.medicalAnalysis.recommendations.map((rec, i) => (
                                <li key={i} className="bg-rose-100/30 p-2 rounded-lg text-xs font-bold text-rose-900 flex items-center gap-2">
                                    <span>📍</span> {rec}
                                </li>
                            ))}
                        </ul>
                    </section>

                    <div className={`p-4 rounded-xl border-2 flex items-center gap-4 ${result.medicalAnalysis.followUpAdvice.includes('🚨') ? 'bg-red-50 border-red-200' : 'bg-rose-50 border-rose-100'}`}>
                        <span className="text-2xl">👨‍⚕️</span>
                        <div>
                            <p className="text-[10px] font-black uppercase text-rose-500">Expert Follow-up Advice</p>
                            <p className="text-sm font-bold text-slate-800">{result.medicalAnalysis.followUpAdvice}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
