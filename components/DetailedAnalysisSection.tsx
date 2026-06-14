import React from 'react';
import { AssessmentResult } from '../types';

interface DetailedAnalysisSectionProps {
    data: AssessmentResult;
}

export const DetailedAnalysisSection: React.FC<DetailedAnalysisSectionProps> = ({ data }) => {
    return (
        <div className="p-4 bg-blue-50 rounded-xl">
            <h3 className="font-bold">Data Loaded Successfully</h3>
            <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                {data.analysisText || "분석 데이터가 존재하지 않습니다."}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <p className="text-xs text-slate-500 font-bold uppercase">Brain Score</p>
                    <p className="text-xl font-black text-indigo-600">{data.hrv.brainScore}점</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <p className="text-xs text-slate-500 font-bold uppercase">Care Type</p>
                    <p className="text-xl font-black text-rose-600">{data.careType}</p>
                </div>
            </div>

            {/* 
        This section is replacing the previous script-injected component.
        It strictly maintains the UI/UX content as it was defined (or intended) in the original code.
        If further detailed visualization is required similar to the popup, 
        it should be implemented here, but for now we follow the exact existing logic.
      */}
            <div className="mt-4 text-[10px] text-slate-400 text-right">
                Analysis Source: DetailedAnalysisSection.tsx (React Component)
            </div>
        </div>
    );
};
