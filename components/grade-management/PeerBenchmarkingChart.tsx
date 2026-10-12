import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { GradeRecord } from '../../types';
import { SUNEUNG_SUBJECTS } from '../../data/suneungSubjects';

interface PeerBenchmarkingChartProps {
    latestRecord: GradeRecord | null;
}

export const PeerBenchmarkingChart: React.FC<PeerBenchmarkingChartProps> = ({ latestRecord }) => {
    if (!latestRecord) {
        return (
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center text-sm text-slate-500">
                성적 기록이 입력되면 과목별 원점수 분포 차트가 표시됩니다.
            </div>
        );
    }

    // 원점수가 실제로 입력된 과목만 표시 (추정치·가짜 비교값 금지)
    const data = latestRecord.subjects
        .filter(s => s.rawScore !== undefined)
        .map(s => {
            const info = SUNEUNG_SUBJECTS.find(sub => sub.id === s.subjectId);
            return {
                subject: info?.name || s.subjectId,
                '나의 원점수': s.rawScore as number,
                fullMark: 100
            };
        });

    if (data.length < 3) {
        return (
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center text-sm text-slate-500">
                과목별 원점수 분포 차트는 원점수가 입력된 과목이 3개 이상일 때 표시됩니다.
                유사 그룹 벤치마킹은 비교 데이터가 쌓이는 대로 열립니다.
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <div>
                <h3 className="text-xl font-black text-slate-800">과목별 원점수 분포 (My Scores)</h3>
                <p className="text-sm text-slate-500 mt-1">
                    입력된 원점수 기준 분포입니다. 유사 그룹 벤치마킹은 비교 데이터가 확보되는 대로 제공됩니다.
                </p>
            </div>

            <div className="h-[300px] w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={300}>
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 12, fontWeight: 'bold' }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar
                            name="나의 원점수"
                            dataKey="나의 원점수"
                            stroke="#3b82f6"
                            fill="#3b82f6"
                            fillOpacity={0.6}
                        />
                        <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
