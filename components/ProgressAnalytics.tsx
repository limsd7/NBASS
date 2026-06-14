import React from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { AssessmentResult } from '../types';

interface ProgressAnalyticsProps {
    history: (AssessmentResult & { date: string })[];
}

export const ProgressAnalytics: React.FC<ProgressAnalyticsProps> = ({ history }) => {
    const data = [...history]
        .filter(h => h.hrv && h.hrv.brainScore !== undefined)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (data.length < 2) {
        return (
            <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-200 animate-in fade-in">
                <p className="mb-2 text-2xl">📉</p>
                <p className="font-bold text-slate-600">데이터 부족</p>
                <p className="text-sm mt-1">최소 2회 이상의 검사 데이터가 축적되면<br />학생의 성장 추이가 그래프로 표시됩니다.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">📈</span>
                <h3 className="font-bold text-slate-800 text-lg">Growth Analytics (Beta)</h3>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-80">
                <h4 className="text-sm font-bold text-slate-500 uppercase mb-4">Brain Health Trend</h4>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="date" tickFormatter={d => new Date(d).toLocaleDateString()} style={{ fontSize: '10px' }} stroke="#94a3b8" />
                        <YAxis domain={[0, 100]} style={{ fontSize: '10px' }} stroke="#94a3b8" />
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="hrv.brainScore" name="Brain Score" stroke="#4F46E5" strokeWidth={3} dot={{ r: 4, fill: '#4F46E5', stroke: '#fff', strokeWidth: 2 }} />
                        <Line type="monotone" dataKey="hrv.stressResistance" name="Stress Resistance" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-80">
                <h4 className="text-sm font-bold text-slate-500 uppercase mb-4">ANS Balance Trend (SNS vs PNS)</h4>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="date" tickFormatter={d => new Date(d).toLocaleDateString()} style={{ fontSize: '10px' }} stroke="#94a3b8" />
                        <YAxis domain={[0, 100]} style={{ fontSize: '10px' }} stroke="#94a3b8" />
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="hrv.sns" name="SNS (Stress)" stroke="#EF4444" strokeWidth={2} dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="hrv.pns" name="PNS (Relax)" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
