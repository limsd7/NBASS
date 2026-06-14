import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { GradeRecord } from '../../types';
import { SUNEUNG_SUBJECTS } from '../../data/suneungSubjects';

interface PeerBenchmarkingChartProps {
    latestRecord: GradeRecord | null;
}

export const PeerBenchmarkingChart: React.FC<PeerBenchmarkingChartProps> = ({ latestRecord }) => {
    if (!latestRecord) return null;

    // Convert latest record into radar chart data
    const data = latestRecord.subjects.map(s => {
        const info = SUNEUNG_SUBJECTS.find(sub => sub.id === s.subjectId);
        // Fallback to average score logic for Top 10%
        const top10Score = s.subjectId === 'math' ? 92 : s.subjectId === 'korean' ? 95 : 94;
        
        // Use rawScore if available, else convert percentile or grade to a fake score for visualization
        let myScore = s.rawScore;
        if (myScore === undefined) {
            if (s.percentile !== undefined) myScore = s.percentile;
            else if (s.grade !== undefined) myScore = 100 - (s.grade * 10);
            else myScore = 50;
        }

        return {
            subject: info?.name || s.subjectId,
            '나의 성적': myScore,
            '목표 대학 평균': top10Score,
            fullMark: 100
        };
    });

    if (data.length < 3) {
        return (
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center text-sm text-slate-500">
                유사 그룹 벤치마킹 레이더 차트는 최소 3과목 이상 성적이 입력되어야 표시됩니다.
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <div>
                <h3 className="text-xl font-black text-slate-800">유사 그룹 벤치마킹 (Peer Comparison)</h3>
                <p className="text-sm text-slate-500 mt-1">
                    목표 대학 합격생 그룹(상위 10%)과 나의 최신 성적을 비교합니다.
                </p>
            </div>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 12, fontWeight: 'bold' }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar
                            name="목표 대학 평균"
                            dataKey="목표 대학 평균"
                            stroke="#94a3b8"
                            fill="#cbd5e1"
                            fillOpacity={0.4}
                        />
                        <Radar
                            name="나의 성적"
                            dataKey="나의 성적"
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
