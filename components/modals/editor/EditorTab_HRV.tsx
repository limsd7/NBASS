import React from 'react';
import { HRVData } from '../../../types';
import { InputField } from './EditorShared';

interface EditorTab_HRVProps {
    data: HRVData;
    onChange: (field: keyof HRVData, value: any) => void;
    onPortableChange: (field: string, value: any) => void;
}

export const EditorTab_HRV: React.FC<EditorTab_HRVProps> = ({ data, onChange, onPortableChange }) => {
    return (
        <div className="space-y-8">
            {data.portableHrv ? (
                <>
                    <div>
                        <h3 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-2 mb-4">uBioMacpa Portable Data</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <InputField label="스트레스 지수 (Stress Index)" value={data.portableHrv.stressIndex} onChange={(v: any) => onPortableChange('stressIndex', v)} type="number" />
                            <InputField label="맥박 변화도 (Pulse Variability)" value={data.portableHrv.pulseVariability} onChange={(v: any) => onPortableChange('pulseVariability', v)} type="number" />
                            <InputField label="혈관 건강지수 (Vascular Index)" value={data.portableHrv.vascularHealthIndex} onChange={(v: any) => onPortableChange('vascularHealthIndex', v)} type="number" />
                            <div className="mb-4">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">자율신경 유형 (ANS Balance)</label>
                                <select
                                    value={data.portableHrv.ansBalanceType}
                                    onChange={(e) => onPortableChange('ansBalanceType', e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                                >
                                    <option value="normal">정상 (Normal)</option>
                                    <option value="acute">급성 (Acute)</option>
                                    <option value="chronic">만성 (Chronic)</option>
                                    <option value="overwork_chronic">과로형 만성 (Overwork)</option>
                                    <option value="disease_chronic">질병형 만성 (Disease)</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-4">
                            <InputField label="LF" value={data.portableHrv.lf} onChange={(v: any) => onPortableChange('lf', v)} type="number" />
                            <InputField label="HF" value={data.portableHrv.hf} onChange={(v: any) => onPortableChange('hf', v)} type="number" />
                            <InputField label="SDNN" value={data.portableHrv.sdnn} onChange={(v: any) => onPortableChange('sdnn', v)} type="number" />
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <div>
                        <h3 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-2 mb-4">Autonomic Nervous System (ANS)</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <InputField label="SNS (교감신경)" value={data.sns} onChange={(v: any) => onChange('sns', v)} type="number" />
                            <InputField label="PNS (부교감신경)" value={data.pns} onChange={(v: any) => onChange('pns', v)} type="number" />
                            <InputField label="평균 심박수" value={data.meanHr} onChange={(v: any) => onChange('meanHr', v)} type="number" />
                            <InputField label="피로 지수" value={data.fatigue} onChange={(v: any) => onChange('fatigue', v)} type="number" />
                            <InputField label="활력 지수" value={data.vitality} onChange={(v: any) => onChange('vitality', v)} type="number" />
                            <InputField label="신체 스트레스" value={data.physicalStress} onChange={(v: any) => onChange('physicalStress', v)} type="number" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-2 mb-4">EEG (Brainwaves)</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <InputField label="뇌 건강 점수" value={data.brainScore} onChange={(v: any) => onChange('brainScore', v)} type="number" />
                            <InputField label="집중도 (Level)" value={data.concentrationLevel} onChange={(v: any) => onChange('concentrationLevel', v)} type="number" max={10} />
                            <InputField label="Alpha (이완)" value={data.eegAlpha} onChange={(v: any) => onChange('eegAlpha', v)} type="number" />
                            <InputField label="M-Beta (몰입)" value={data.eegMBeta} onChange={(v: any) => onChange('eegMBeta', v)} type="number" />
                            <InputField label="H-Beta (긴장)" value={data.eegHBeta} onChange={(v: any) => onChange('eegHBeta', v)} type="number" />
                            <InputField label="Theta (졸음)" value={data.eegTheta} onChange={(v: any) => onChange('eegTheta', v)} type="number" />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
