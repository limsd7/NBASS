import React, { useMemo, useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Label } from 'recharts';
import { GradeRecord, GradeGoal, SubjectGrade } from '../../types';
import { SUNEUNG_SUBJECTS } from '../../data/suneungSubjects';

interface GradeTrendChartProps {
    records: GradeRecord[];
    goals: GradeGoal[];
    selectedSubjectIds: string[];
}

export const GradeTrendChart: React.FC<GradeTrendChartProps> = ({ records, goals, selectedSubjectIds }) => {
    const [visibleSubjects, setVisibleSubjects] = useState<string[]>([...selectedSubjectIds, 'average']);

    useEffect(() => {
        setVisibleSubjects(prev => [...new Set([...prev, ...selectedSubjectIds])]);
    }, [selectedSubjectIds]);

    const chartData = useMemo(() => {
        // Sort records by date ascending
        const sortedRecords = [...records].sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime());
        
        return sortedRecords.map(record => {
            const dataPoint: any = {
                name: record.examName,
                date: record.examDate,
                label: `${record.examName}\n(${record.examDate.substring(5, 10)})`
            };
            
            let sum = 0;
            let count = 0;

            record.subjects.forEach(sub => {
                if (selectedSubjectIds.includes(sub.subjectId) && sub.grade) {
                    dataPoint[sub.subjectId] = sub.grade;
                    sum += sub.grade;
                    count++;
                }
            });
            
            if (count > 0) {
                dataPoint.average = Number((sum / count).toFixed(1));
            }
            
            return dataPoint;
        });
    }, [records, selectedSubjectIds]);

    const colors = ['#2563eb', '#16a34a', '#dc2626', '#d97706', '#7c3aed', '#0891b2', '#be123c'];

    if (records.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-slate-500">입력된 성적 데이터가 없습니다.</p>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col gap-4">
            <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis reversed domain={[1, 9]} ticks={[1, 2, 3, 4, 5, 6, 7, 8, 9]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} label={{ value: '등급', angle: -90, position: 'insideLeft', fill: '#64748b' }} />
                    <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: number, name: string) => {
                            if (name === 'average') return [`${value}등급`, '전체 평균'];
                            const subj = SUNEUNG_SUBJECTS.find(s => s.id === name);
                            return [`${value}등급`, subj?.name || name];
                        }}
                    />
                    <Legend iconType="circle" formatter={(value) => {
                        if (value === 'average') return '전체 평균';
                        return SUNEUNG_SUBJECTS.find(s => s.id === value)?.name || value;
                    }} />
                    
                    {goals.map((goal) => {
                        const subjectIndex = selectedSubjectIds.indexOf(goal.subjectId);
                        if (subjectIndex === -1 || !visibleSubjects.includes(goal.subjectId)) return null;
                        const color = colors[subjectIndex % colors.length];
                        return (
                            <ReferenceLine
                                key={`goal-${goal.subjectId}`}
                                y={goal.tier3Target}
                                stroke={color}
                                strokeDasharray="3 3"
                                strokeOpacity={0.5}
                            >
                                <Label value={`${SUNEUNG_SUBJECTS.find(s => s.id === goal.subjectId)?.name || ''} 목표`} position="insideTopRight" fill={color} fontSize={10} />
                            </ReferenceLine>
                        );
                    })}
                    
                    {selectedSubjectIds.map((subjectId, index) => {
                        const subjectInfo = SUNEUNG_SUBJECTS.find(s => s.id === subjectId);
                        if (!subjectInfo) return null;
                        
                        // Check if subject has data in records
                        const hasData = records.some(r => r.subjects.some(s => s.subjectId === subjectId && s.grade));
                        if (!hasData || !visibleSubjects.includes(subjectId)) return null;
                        
                        return (
                            <Line 
                                key={subjectId}
                                type="monotone" 
                                dataKey={subjectId} 
                                name={subjectInfo.name} 
                                stroke={colors[index % colors.length]} 
                                strokeWidth={3}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                                connectNulls
                            />
                        );
                    })}

                    {visibleSubjects.includes('average') && (
                        <Line 
                            key="average"
                            type="monotone"
                            dataKey="average"
                            name="average"
                            stroke="#1e293b"
                            strokeWidth={3}
                            strokeDasharray="5 5"
                            activeDot={{ r: 6, strokeWidth: 0 }}
                            connectNulls
                        />
                    )}
                </LineChart>
            </ResponsiveContainer>
            </div>
            
            <div className="flex flex-wrap gap-4 justify-center items-center pt-2 border-t border-slate-100">
                {selectedSubjectIds.map((subjectId, index) => {
                    const info = SUNEUNG_SUBJECTS.find(s => s.id === subjectId);
                    if (!info) return null;
                    const hasData = records.some(r => r.subjects.some(s => s.subjectId === subjectId && s.grade));
                    if (!hasData) return null;
                    
                    const color = colors[index % colors.length];
                    const isVisible = visibleSubjects.includes(subjectId);
                    
                    return (
                        <label key={subjectId} className="flex items-center gap-2 cursor-pointer text-sm font-bold transition-opacity hover:opacity-80">
                            <input 
                                type="checkbox" 
                                checked={isVisible}
                                onChange={(e) => {
                                    if (e.target.checked) setVisibleSubjects([...visibleSubjects, subjectId]);
                                    else setVisibleSubjects(visibleSubjects.filter(id => id !== subjectId));
                                }}
                                className="w-4 h-4 rounded border-slate-300"
                                style={{ accentColor: color }}
                            />
                            <span style={{ color: isVisible ? color : '#94a3b8' }}>{info.name}</span>
                        </label>
                    );
                })}
                <label className="flex items-center gap-2 cursor-pointer text-sm font-bold transition-opacity hover:opacity-80">
                    <input 
                        type="checkbox" 
                        checked={visibleSubjects.includes('average')}
                        onChange={(e) => {
                            if (e.target.checked) setVisibleSubjects([...visibleSubjects, 'average']);
                            else setVisibleSubjects(visibleSubjects.filter(id => id !== 'average'));
                        }}
                        className="w-4 h-4 rounded border-slate-300"
                        style={{ accentColor: '#1e293b' }}
                    />
                    <span style={{ color: visibleSubjects.includes('average') ? '#1e293b' : '#94a3b8' }}>전체 평균</span>
                </label>
            </div>
        </div>
    );
};
