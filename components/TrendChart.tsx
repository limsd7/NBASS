// TrendChart Component - History-based trend visualization
// Uses Recharts to display SNS, PNS, BAI, ISI, BrainScore trends

import React, { useMemo } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { AssessmentResult } from '../types';

interface TrendChartProps {
    history: AssessmentResult[];
    fields?: string[];
}

// Field configuration for chart display
const FIELD_CONFIG: Record<string, {
    label: string;
    color: string;
    domain: [number, number];
    inverted?: boolean; // true = lower is better
}> = {
    'sns': { label: 'SNS (%)', color: '#ef4444', domain: [0, 100], inverted: true },
    'pns': { label: 'PNS (%)', color: '#22c55e', domain: [0, 100] },
    'bai': { label: 'BAI', color: '#f59e0b', domain: [0, 63], inverted: true },
    'isi': { label: 'ISI', color: '#8b5cf6', domain: [0, 28], inverted: true },
    'brainScore': { label: '두뇌점수', color: '#3b82f6', domain: [0, 100] },
    'fatigue': { label: '피로도 (%)', color: '#ec4899', domain: [0, 100], inverted: true },
    'vitality': { label: '활력도 (%)', color: '#06b6d4', domain: [0, 100] }
};

// Default fields to display
const DEFAULT_FIELDS = ['sns', 'pns', 'bai', 'brainScore'];

export const TrendChart: React.FC<TrendChartProps> = ({ history, fields = DEFAULT_FIELDS }) => {
    // Transform history data for chart
    const chartData = useMemo(() => {
        if (!history || history.length === 0) return [];

        // Sort by test date (oldest first)
        const sorted = [...history].sort((a, b) =>
            new Date(a.student.testDate).getTime() - new Date(b.student.testDate).getTime()
        );

        return sorted.map((record, idx) => {
            const date = new Date(record.student.testDate);
            const formattedDate = `${date.getMonth() + 1}/${date.getDate()}`;

            return {
                date: formattedDate,
                index: idx + 1,
                sns: record.hrv?.sns ?? null,
                pns: record.hrv?.pns ?? null,
                bai: record.survey?.bai ?? null,
                isi: record.survey?.isi ?? null,
                brainScore: record.hrv?.brainScore ?? null,
                fatigue: record.hrv?.fatigue ?? null,
                vitality: record.hrv?.vitality ?? null
            };
        });
    }, [history]);

    // Custom tooltip
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-200 text-xs">
                    <p className="font-bold text-slate-700 mb-2">📅 {label}</p>
                    {payload.map((entry: any, idx: number) => {
                        const config = FIELD_CONFIG[entry.dataKey];
                        return (
                            <p key={idx} className="flex items-center gap-2" style={{ color: entry.color }}>
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
                                <span>{config?.label || entry.dataKey}: </span>
                                <span className="font-bold">{entry.value}</span>
                            </p>
                        );
                    })}
                </div>
            );
        }
        return null;
    };

    if (chartData.length < 2) {
        return (
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 text-center">
                <span className="text-3xl">📊</span>
                <p className="text-slate-600 font-bold mt-2">추세 차트</p>
                <p className="text-slate-500 text-sm mt-1">
                    2회 이상의 측정 기록이 필요합니다 (현재: {chartData.length}회)
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center gap-2">
                    <span className="text-xl">📈</span>
                    <div>
                        <h4 className="font-bold text-slate-800">추세 차트</h4>
                        <p className="text-xs text-slate-500">최근 {chartData.length}회 측정 데이터</p>
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="p-4">
                <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 11, fill: '#64748b' }}
                            axisLine={{ stroke: '#e2e8f0' }}
                        />
                        <YAxis
                            tick={{ fontSize: 11, fill: '#64748b' }}
                            axisLine={{ stroke: '#e2e8f0' }}
                            domain={[0, 100]}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            wrapperStyle={{ fontSize: '11px' }}
                            iconType="circle"
                            iconSize={8}
                        />
                        {fields.map(field => {
                            const config = FIELD_CONFIG[field];
                            if (!config) return null;
                            return (
                                <Line
                                    key={field}
                                    type="monotone"
                                    dataKey={field}
                                    name={config.label}
                                    stroke={config.color}
                                    strokeWidth={2}
                                    dot={{ fill: config.color, strokeWidth: 0, r: 4 }}
                                    activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                                    connectNulls
                                />
                            );
                        })}
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Legend Description */}
            <div className="px-4 pb-4">
                <div className="flex flex-wrap gap-2 text-[10px]">
                    {fields.map(field => {
                        const config = FIELD_CONFIG[field];
                        if (!config) return null;
                        return (
                            <div key={field} className="flex items-center gap-1 px-2 py-1 bg-slate-50 rounded-full">
                                <span
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: config.color }}
                                ></span>
                                <span className="text-slate-600">
                                    {config.label}
                                    {config.inverted && <span className="text-slate-400"> (↓좋음)</span>}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default TrendChart;
