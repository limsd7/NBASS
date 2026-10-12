import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SimulationResult } from '../../../services/gradeSimulationEngine';

interface Props {
    chartData: any[];
    simulationResult: SimulationResult;
    colors: string[];
}

export const SimulationTrajectoryChart: React.FC<Props> = ({ chartData, simulationResult, colors }) => {
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6">수능까지의 예상 성적 궤적</h3>
            <div className="h-80 w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={300}>
                    <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                        <YAxis reversed domain={[1, 9]} ticks={[1, 2, 3, 4, 5, 6, 7, 8, 9]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} label={{ value: '예상 등급', angle: -90, position: 'insideLeft', fill: '#64748b' }} />
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            formatter={(value: number, name: string) => {
                                const proj = simulationResult.projections.find(p => p.subjectId === name);
                                return [`${value}등급`, proj?.subjectName || name];
                            }}
                        />
                        <Legend iconType="circle" formatter={(value) => simulationResult.projections.find(p => p.subjectId === value)?.subjectName || value} />

                        {simulationResult.projections.map((proj, index) => (
                            <Line
                                key={proj.subjectId}
                                type="monotone"
                                dataKey={proj.subjectId}
                                name={proj.subjectId}
                                stroke={colors[index % colors.length]}
                                strokeWidth={3}
                                activeDot={{ r: 6 }}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default SimulationTrajectoryChart;