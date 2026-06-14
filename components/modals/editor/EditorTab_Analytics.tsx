import React from 'react';
import { LearningAnalyticsData } from '../../../types';
import { InputField } from './EditorShared';

interface EditorTab_AnalyticsProps {
    data: LearningAnalyticsData;
    onChange: (field: keyof LearningAnalyticsData, value: any) => void;
}

export const EditorTab_Analytics: React.FC<EditorTab_AnalyticsProps> = ({ data, onChange }) => {
    return (
        <div className="grid grid-cols-2 gap-6">
            <InputField label="순공 시간 비율 (%)" value={data.pureStudyRatio} onChange={(v: any) => onChange('pureStudyRatio', v)} type="number" max={100} />
            <InputField label="목표 달성률 (%)" value={data.goalAchievementRate} onChange={(v: any) => onChange('goalAchievementRate', v)} type="number" max={100} />
            <InputField label="평균 집중 시간 (분)" value={data.avgFocusDuration} onChange={(v: any) => onChange('avgFocusDuration', v)} type="number" />
            <div className="mb-4">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">골든타임 시작</label>
                <input
                    type="time"
                    value={data.goldenTimeStart}
                    onChange={(e) => onChange('goldenTimeStart', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                />
            </div>
            <div className="mb-4">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">골든타임 종료</label>
                <input
                    type="time"
                    value={data.goldenTimeEnd}
                    onChange={(e) => onChange('goldenTimeEnd', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                />
            </div>
            <InputField label="Study Streak (일)" value={data.studyStreak} onChange={(v: any) => onChange('studyStreak', v)} type="number" />
        </div>
    );
};
