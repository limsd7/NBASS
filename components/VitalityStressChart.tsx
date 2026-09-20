import React, { memo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

interface VitalityStressChartProps {
    vitality: number;
    fatigue: number;
    physicalStress?: number;
}

/**
 * Vitality & Fatigue Index Chart (Refactored)
 * 
 * [Universal Support]
 * - Portable Mode: Uses 'physicalStress' (Stress Index) for the Fatigue bar if 'fatigue' is 0.
 * - HRV/Medical Mode: Uses original 'fatigue' value.
 * - Maintains exact UI/UX from original App.tsx.
 */
export const VitalityStressChart: React.FC<VitalityStressChartProps> = memo(({ vitality, fatigue, physicalStress = 0 }) => {
    // Logic: Use physicalStress if fatigue is 0 (typical in Portable mode), otherwise use fatigue
    // This ensures the chart is never empty for Portable users while preserving HRV mode accuracy.

    // 1. Determine Fatigue Value
    // - If we have explicit fatigue (HRV/Medical), use it.
    // - If fatigue is 0, we fallback to physicalStress (Portable).
    // 1. Determine Fatigue Value
    const displayFatigue = (fatigue > 0) ? fatigue : (physicalStress > 0 ? physicalStress : 0);

    // 2. Determine Vitality Value
    const displayVitality = (vitality > 0) ? vitality : 0;

    // Data structure for Recharts
    const data = [
        { name: 'Index', Vitality: displayVitality, Fatigue: displayFatigue },
    ];

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-80 print-avoid-break">
            <h4 className="text-sm font-bold text-slate-500 uppercase mb-4">Vitality & Fatigue Index</h4>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} barSize={40}>
                        <XAxis dataKey="name" hide />
                        <YAxis domain={[0, 100]} padding={{ top: 20 }} />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{
                                borderRadius: '12px',
                                border: 'none',
                                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                fontSize: '12px',
                                fontWeight: 'bold'
                            }}
                        />
                        <Legend iconType="square" wrapperStyle={{ paddingTop: '10px' }} />
                        <Bar
                            dataKey="Fatigue"
                            name="Fatigue"
                            fill="#f59e0b" // amber-500
                            radius={[6, 6, 0, 0]}
                        />
                        <Bar
                            dataKey="Vitality"
                            name="Vitality"
                            fill="#10b981" // emerald-500
                            radius={[6, 6, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
});

VitalityStressChart.displayName = 'VitalityStressChart';
