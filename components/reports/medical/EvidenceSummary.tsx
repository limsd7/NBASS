import React from 'react';
import type { AssessmentResult } from '../../../types';

interface EvidenceSummaryProps {
    result: AssessmentResult;
}

// 입력 근거 요약 (리포트 1장 선두, 아래 분류가 이 값들에서 산출됐음을 명시)
export const EvidenceSummary: React.FC<EvidenceSummaryProps> = ({ result }) => {
    const survey = result.survey || ({} as any);
    const sleepHours = result.protocol?.sleepHours ?? result.analytics?.avgSleepHours;
    const symptomCount =
        (survey.fatigueSymptomsCount || 0) +
        (survey.sympatheticSymptomsCount || (survey.sympatheticSymptoms?.length || 0)) +
        (survey.parasympatheticSymptomsCount || (survey.parasympatheticSymptoms?.length || 0)) +
        (survey.circulationSymptomsCount || 0);
    const items: { label: string; value: string }[] = [
        { label: '불안(BAI)', value: survey.bai !== undefined && survey.bai !== null ? `${survey.bai}점` : '미입력' },
        { label: '불면(ISI)', value: survey.isi !== undefined && survey.isi !== null ? `${survey.isi}점` : '미입력' },
        { label: '수면시간', value: sleepHours ? `${sleepHours}시간` : '미입력' },
        { label: '체크 증상', value: `${symptomCount}개` },
        { label: '집중 설문', value: survey.concentrationScore !== undefined && survey.concentrationScore !== null ? `${survey.concentrationScore}점` : '미입력' },
    ];
    return (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl mb-3">
            <div className="text-[11px] font-black text-slate-700 mb-2">📋 입력 근거 (이 값들로 아래 분류가 산출됐습니다)</div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {items.map(item => (
                    <div key={item.label} className="bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-center">
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</div>
                        <div className="text-xs font-black text-slate-800 mt-0.5">{item.value}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};
