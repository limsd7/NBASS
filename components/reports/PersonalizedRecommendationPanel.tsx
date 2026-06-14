import React from 'react';
import { PersonalizedRecommendation } from '../../types';

interface Props {
    recommendation: PersonalizedRecommendation;
}

export const PersonalizedRecommendationPanel: React.FC<Props> = ({ recommendation }) => {
    const isUrgent = recommendation.priority === 'URGENT';
    const isHigh = recommendation.priority === 'HIGH';
    
    const headerColor = isUrgent ? 'bg-rose-600' : isHigh ? 'bg-amber-600' : 'bg-emerald-600';
    const borderColor = isUrgent ? 'border-rose-200' : isHigh ? 'border-amber-200' : 'border-emerald-200';
    const badgeColor = isUrgent ? 'bg-rose-800 text-rose-100' : isHigh ? 'bg-amber-800 text-amber-100' : 'bg-emerald-800 text-emerald-100';

    return (
        <div className={`bg-white rounded-2xl shadow-sm border ${borderColor} overflow-hidden mt-8 mb-8`}>
            <div className={`${headerColor} text-white p-4 flex items-center justify-between`}>
                <h3 className="font-bold text-lg flex items-center gap-2">
                    <span className="text-2xl">🧬</span> 3계층 정밀 맞춤 처방 (Multi-layer Prescription)
                </h3>
                <div className={`text-xs font-bold px-3 py-1 rounded ${badgeColor}`}>
                    우선순위: {recommendation.priority}
                </div>
            </div>
            
            <div className="p-6">
                {/* 1. Consensus Section */}
                <div className="mb-6">
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">진단 일치점 (Consensus)</h4>
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2">
                        {recommendation.consensus.map((c, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                                <span className="text-blue-500 font-bold mt-0.5">↳</span>
                                <span className="text-slate-700 font-medium">{c}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. Detailed Prescriptions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Nutrition & Supplements */}
                    <div>
                        <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                            <span className="w-1.5 h-4 bg-emerald-500 rounded-full"></span> 
                            영양 및 보충제
                        </h4>
                        <ul className="text-sm text-slate-600 space-y-1 pl-3 border-l-2 border-slate-100 ml-1">
                            {recommendation.details.nutrition.map((n, idx) => <li key={`n-${idx}`}>• {n}</li>)}
                            {recommendation.details.supplement.map((s, idx) => <li key={`s-${idx}`}>• {s} (보충제)</li>)}
                        </ul>
                    </div>
                    
                    {/* Exercise & Timing */}
                    <div>
                        <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                            <span className="w-1.5 h-4 bg-blue-500 rounded-full"></span> 
                            운동 및 타이밍
                        </h4>
                        <ul className="text-sm text-slate-600 space-y-1 pl-3 border-l-2 border-slate-100 ml-1">
                            <li><span className="font-medium text-slate-700">추천 운동:</span> {recommendation.details.exercise}</li>
                            <li><span className="font-medium text-slate-700">적용 타이밍:</span> {recommendation.details.timing}</li>
                        </ul>
                    </div>

                    {/* Avoidance */}
                    {recommendation.details.avoidance.length > 0 && (
                        <div className="md:col-span-2 bg-rose-50 rounded-xl p-4 border border-rose-100 mt-2">
                            <h4 className="font-bold text-rose-800 mb-2 flex items-center gap-2">
                                <span>🚫</span> 금지/회피 사항
                            </h4>
                            <ul className="text-sm text-rose-700 space-y-1 pl-1">
                                {recommendation.details.avoidance.map((a, idx) => <li key={`a-${idx}`}>• {a}</li>)}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
