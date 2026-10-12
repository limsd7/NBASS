import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { AssessmentResult } from '../../types';
import { evaluateBrainBodyCoherence } from '../../services/brainBodyEngine';

interface CoherenceTimelineChartProps {
    history: (AssessmentResult & { date: string })[];
}

export const CoherenceTimelineChart: React.FC<CoherenceTimelineChartProps> = ({ history }) => {
    // Process history to extract coherence
    const data = React.useMemo(() => {
        if (!history || history.length === 0) return [];

        // Sort history by date ascending
        const sortedHistory = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        return sortedHistory.map(item => {
            const state = evaluateBrainBodyCoherence(item.hrv, item.survey, item.careType, item.protocol, item.cognitiveResults);
            return {
                date: item.date,
                coherence: state.coherence,
                level: state.coherenceLevel,
                label: new Date(item.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
            };
        });
    }, [history]);

    if (data.length < 2) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 min-h-[250px]">
                <span className="text-3xl mb-2">📉</span>
                <span className="text-sm font-medium">데이터가 부족합니다.</span>
                <span className="text-xs mt-1">타임라인 추이를 분석하려면 2회 이상의 검사 기록이 필요합니다.</span>
            </div>
        );
    }

    const latestCoherence = data[data.length - 1].coherence;
    const initialCoherence = data[0].coherence;
    const isImproved = latestCoherence > initialCoherence;

    return (
        <div className="bg-white rounded-xl border border-slate-100 p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h4 className="text-sm font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                        <span>📈</span> Coherence Timeline
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">시간에 따른 진단 신뢰도(일치도) 변화 추이</p>
                </div>
                <div className="text-right">
                    <div className="text-xs text-slate-500">전체 변화</div>
                    <div className={`font-black text-lg ${isImproved ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {isImproved ? '+' : ''}{latestCoherence - initialCoherence}%
                    </div>
                </div>
            </div>

            <div className="w-full h-64 min-w-0">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={240}>
                    <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorCoherence" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="label"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: '#94a3b8' }}
                            dy={10}
                        />
                        <YAxis
                            domain={[0, 100]}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: '#94a3b8' }}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                            labelStyle={{ color: '#64748b', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}
                            formatter={(value: number) => [`${value}%`, 'Coherence']}
                        />
                        <ReferenceLine y={80} stroke="#10b981" strokeDasharray="3 3" strokeOpacity={0.5} />
                        <ReferenceLine y={50} stroke="#f59e0b" strokeDasharray="3 3" strokeOpacity={0.5} />

                        <Line
                            type="monotone"
                            dataKey="coherence"
                            stroke="#8b5cf6"
                            strokeWidth={4}
                            dot={{ r: 6, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }}
                            activeDot={{ r: 8, strokeWidth: 0 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
