import React from 'react';
import { ProtocolData } from '../../../types';
import { InputField } from './EditorShared';

interface EditorTab_ProtocolProps {
    data: ProtocolData;
    onChange: (field: keyof ProtocolData, value: any) => void;
}

export const EditorTab_Protocol: React.FC<EditorTab_ProtocolProps> = ({ data, onChange }) => {
    return (
        <div className="grid grid-cols-2 gap-6">
            <InputField label="스트레스 수준 (Self)" value={data.stressLevel} onChange={(v: any) => onChange('stressLevel', v)} type="number" max={10} />
            <InputField label="소음 민감도" value={data.noiseLevel} onChange={(v: any) => onChange('noiseLevel', v)} type="number" max={10} />
            <InputField label="평균 수면 시간" value={data.avgSleep} onChange={(v: any) => onChange('avgSleep', v)} type="number" step={0.5} />
            <div className="mb-4">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">학습 장소</label>
                <input
                    type="text"
                    value={data.location}
                    onChange={(e) => onChange('location', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                />
            </div>
        </div>
    );
};
