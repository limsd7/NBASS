import React from 'react';
import { SurveyData } from '../../../types';
import { InputField } from './EditorShared';

interface EditorTab_SurveyProps {
    data: SurveyData;
    onChange: (field: keyof SurveyData, value: any) => void;
}

export const EditorTab_Survey: React.FC<EditorTab_SurveyProps> = ({ data, onChange }) => {
    return (
        <div className="grid grid-cols-2 gap-6">
            <InputField label="불안 척도 (BAI)" value={data.bai} onChange={(v: any) => onChange('bai', v)} type="number" />
            <InputField label="불면 척도 (ISI)" value={data.isi} onChange={(v: any) => onChange('isi', v)} type="number" />
            <InputField label="집중력 점수" value={data.concentrationScore} onChange={(v: any) => onChange('concentrationScore', v)} type="number" />
            <InputField label="만성피로 점수 (Symptoms)" value={data.fatigueSymptomsCount} onChange={(v: any) => onChange('fatigueSymptomsCount', v)} type="number" />
            <InputField label="부신피로 점수" value={data.adrenalFatigueScore} onChange={(v: any) => onChange('adrenalFatigueScore', v)} type="number" />
        </div>
    );
};
