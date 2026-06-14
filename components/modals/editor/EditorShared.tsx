import React from 'react';

interface InputFieldProps {
    label: string;
    value: any;
    onChange: (value: any) => void;
    type?: string;
    min?: number;
    max?: number;
    step?: number;
    className?: string;
}

export const InputField: React.FC<InputFieldProps> = ({ label, value, onChange, type = 'text', min, max, step, className }) => (
    <div className={`mb-4 ${className || ''}`}>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{label}</label>
        <input
            type={type}
            value={value}
            onChange={(e) => {
                const val = type === 'number' ? parseFloat(e.target.value) : e.target.value;
                onChange(val);
            }}
            min={min}
            max={max}
            step={step}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
        />
    </div>
);
