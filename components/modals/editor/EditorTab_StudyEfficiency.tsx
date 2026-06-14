import React from 'react';
import { SurveyData } from '../../../types';
import { InputField } from './EditorShared';

interface EditorTab_StudyEfficiencyProps {
    data: SurveyData;
    onChange: (field: keyof SurveyData, value: any) => void;
}

export const EditorTab_StudyEfficiency: React.FC<EditorTab_StudyEfficiencyProps> = ({ data, onChange }) => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
                <div className="mb-4">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Chronotype (아침/저녁형)</label>
                    <select
                        value={data.chronotypeResult || 'neutral'}
                        onChange={(e) => onChange('chronotypeResult', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                    >
                        <option value="morning">Morning</option>
                        <option value="moderate_morning">Moderate Morning</option>
                        <option value="neutral">Neutral</option>
                        <option value="moderate_evening">Moderate Evening</option>
                        <option value="evening">Evening</option>
                    </select>
                </div>
                <InputField label="Chronotype Score" value={data.chronotypeScore} onChange={(v: any) => onChange('chronotypeScore', v)} type="number" />

                <div className="mb-4">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">VARK (학습유형)</label>
                    <select
                        value={data.varkPrimary || 'multi'}
                        onChange={(e) => onChange('varkPrimary', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                    >
                        <option value="V">Visual</option>
                        <option value="A">Aural</option>
                        <option value="R">Read/Write</option>
                        <option value="K">Kinesthetic</option>
                        <option value="multi">Multimodal</option>
                    </select>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-6 mt-4">
                <InputField label="시험불안 (인지적)" value={data.testAnxietyCognitive} onChange={(v: any) => onChange('testAnxietyCognitive', v)} type="number" />
                <InputField label="시험불안 (신체적)" value={data.testAnxietySomatic} onChange={(v: any) => onChange('testAnxietySomatic', v)} type="number" />
                <InputField label="디지털 중독 점수" value={data.digitalAddictionScore} onChange={(v: any) => onChange('digitalAddictionScore', v)} type="number" />
            </div>
        </div>
    );
};
