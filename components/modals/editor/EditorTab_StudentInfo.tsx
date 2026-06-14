import React from 'react';
import { StudentInfo } from '../../../types';
import { InputField } from './EditorShared';

interface EditorTab_StudentInfoProps {
    data: StudentInfo;
    onChange: (field: keyof StudentInfo, value: any) => void;
}

export const EditorTab_StudentInfo: React.FC<EditorTab_StudentInfoProps> = ({ data, onChange }) => {
    return (
        <div className="grid grid-cols-2 gap-6">
            <InputField label="이름" value={data.name} onChange={(v: any) => onChange('name', v)} />
            <InputField label="나이" value={data.age} onChange={(v: any) => onChange('age', v)} type="number" />
            <div className="mb-4">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">성별</label>
                <select
                    value={data.gender}
                    onChange={(e) => onChange('gender', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                >
                    <option value="Male">남성</option>
                    <option value="Female">여성</option>
                    <option value="Other">기타</option>
                </select>
            </div>
            <div className="mb-4">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">취약 과목</label>
                <select
                    value={data.weakSubject}
                    onChange={(e) => onChange('weakSubject', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                >
                    <option value="korean">국어</option>
                    <option value="math">수학</option>
                    <option value="english">영어</option>
                    <option value="science">과학</option>
                </select>
            </div>
            <div className="mb-4 col-span-2">
                <label className="block text-xs font-bold text-amber-600 uppercase mb-1">멤버십 등급</label>
                <select
                    value={data.membershipTier || 'standard'}
                    onChange={(e) => onChange('membershipTier', e.target.value)}
                    className="w-full px-3 py-2 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-sm font-bold"
                >
                    <option value="standard">Standard (일반)</option>
                    <option value="premium">Premium (클라우드 LLM)</option>
                </select>
            </div>
        </div>
    );
};
