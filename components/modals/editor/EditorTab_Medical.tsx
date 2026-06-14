import React from 'react';
import { MedicalAnalysis, BloodTestData } from '../../../types';
import { InputField } from './EditorShared';

interface EditorTab_MedicalProps {
    bloodTest: BloodTestData;
    onChange: (field: string, value: any) => void;
}

export const EditorTab_Medical: React.FC<EditorTab_MedicalProps> = ({ bloodTest, onChange }) => {
    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-2 mb-4">혈액 검사 지표 (Lab Results)</h3>
                <div className="grid grid-cols-3 gap-4">
                    <InputField label="WBC (백혈구)" value={bloodTest.wbc} onChange={(v: any) => onChange('wbc', v)} type="number" />
                    <InputField label="Hemoglobin (Hb)" value={bloodTest.hemoglobin} onChange={(v: any) => onChange('hemoglobin', v)} type="number" />
                    <InputField label="Hematocrit (Hct)" value={bloodTest.hematocrit} onChange={(v: any) => onChange('hematocrit', v)} type="number" />
                    <InputField label="Vitamin D" value={bloodTest.vitaminD} onChange={(v: any) => onChange('vitaminD', v)} type="number" />
                    <InputField label="CRP (염증)" value={bloodTest.crp} onChange={(v: any) => onChange('crp', v)} type="number" />
                    <InputField label="HbA1c (당화혈색소)" value={bloodTest.hba1c} onChange={(v: any) => onChange('hba1c', v)} type="number" />
                    <InputField label="AST" value={bloodTest.ast} onChange={(v: any) => onChange('ast', v)} type="number" />
                    <InputField label="ALT" value={bloodTest.alt} onChange={(v: any) => onChange('alt', v)} type="number" />
                    <InputField label="NK Activity" value={bloodTest.nkActivity} onChange={(v: any) => onChange('nkActivity', v)} type="number" />
                    <InputField label="Creatinine" value={bloodTest.creatinine} onChange={(v: any) => onChange('creatinine', v)} type="number" />
                    <InputField label="BUN" value={bloodTest.bun} onChange={(v: any) => onChange('bun', v)} type="number" />
                </div>
            </div>
        </div>
    );
};
