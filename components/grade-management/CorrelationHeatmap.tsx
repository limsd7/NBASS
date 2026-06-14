import React, { useMemo } from 'react';
import { GradeRecord } from '../../types';
import { SUNEUNG_SUBJECTS } from '../../data/suneungSubjects';

interface CorrelationHeatmapProps {
    records: GradeRecord[];
    selectedSubjectIds: string[];
}

export const CorrelationHeatmap: React.FC<CorrelationHeatmapProps> = ({ records, selectedSubjectIds }) => {
    // Pearson 상관계수 계산 함수
    const calculateCorrelation = (x: number[], y: number[]) => {
        if (x.length !== y.length || x.length === 0) return 0;
        const n = x.length;
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumX2 = x.reduce((a, b) => a + b * b, 0);
        const sumY2 = y.reduce((a, b) => a + b * b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);

        const numerator = n * sumXY - sumX * sumY;
        const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
        if (denominator === 0) return 0;
        return numerator / denominator;
    };

    const heatmapData = useMemo(() => {
        const matrix: { [key: string]: { [key: string]: number } } = {};
        
        // 대상 과목 필터링 (기록이 있는 과목만)
        const validSubjects = selectedSubjectIds.filter(subjectId => 
            records.some(r => r.subjects.some(s => s.subjectId === subjectId && s.grade))
        );

        validSubjects.forEach(sub1 => {
            matrix[sub1] = {};
            validSubjects.forEach(sub2 => {
                if (sub1 === sub2) {
                    matrix[sub1][sub2] = 1;
                    return;
                }
                
                // 두 과목 모두 응시한 시험의 성적(등급) 추출
                const grades1: number[] = [];
                const grades2: number[] = [];
                
                records.forEach(record => {
                    const g1 = record.subjects.find(s => s.subjectId === sub1)?.grade;
                    const g2 = record.subjects.find(s => s.subjectId === sub2)?.grade;
                    if (g1 !== undefined && g2 !== undefined) {
                        grades1.push(g1);
                        grades2.push(g2);
                    }
                });

                if (grades1.length < 2) {
                    matrix[sub1][sub2] = 0; // 데이터 부족
                } else {
                    matrix[sub1][sub2] = calculateCorrelation(grades1, grades2);
                }
            });
        });

        return { validSubjects, matrix };
    }, [records, selectedSubjectIds]);

    const getColor = (value: number) => {
        if (value === 1) return 'bg-slate-200 text-slate-500'; // 동일 과목
        if (value === 0) return 'bg-slate-50 text-slate-400'; // 데이터 부족 또는 상관없음
        
        // 등급이므로 양의 상관관계(같이 떨어지거나 같이 오름)가 일반적
        if (value > 0.7) return 'bg-rose-500 text-white font-bold';
        if (value > 0.4) return 'bg-rose-300 text-rose-900';
        if (value > 0) return 'bg-rose-100 text-rose-800';
        
        // 음의 상관관계 (하나는 오르고 하나는 떨어짐)
        if (value < -0.7) return 'bg-blue-500 text-white font-bold';
        if (value < -0.4) return 'bg-blue-300 text-blue-900';
        return 'bg-blue-100 text-blue-800';
    };

    if (heatmapData.validSubjects.length < 2) {
        return (
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center text-sm text-slate-500">
                비교할 수 있는 과목 성적 데이터가 충분하지 않습니다. 최소 2과목 이상의 성적 기록이 필요합니다.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <p className="text-sm text-slate-600 mb-2">
                과목 간 성적 변동의 <strong>상관관계(Pearson)</strong>를 분석합니다. 붉은색일수록 성적이 함께 변동(동조화)하고, 푸른색일수록 반대로 변동(트레이드오프)하는 경향이 있습니다.
            </p>
            <div className="overflow-x-auto">
                <table className="w-full text-center border-collapse">
                    <thead>
                        <tr>
                            <th className="p-2 border border-slate-200 bg-slate-50"></th>
                            {heatmapData.validSubjects.map(sub => (
                                <th key={`col-${sub}`} className="p-2 border border-slate-200 bg-slate-50 text-sm font-bold text-slate-700">
                                    {SUNEUNG_SUBJECTS.find(s => s.id === sub)?.name || sub}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {heatmapData.validSubjects.map(rowSub => (
                            <tr key={`row-${rowSub}`}>
                                <th className="p-2 border border-slate-200 bg-slate-50 text-sm font-bold text-slate-700 text-left">
                                    {SUNEUNG_SUBJECTS.find(s => s.id === rowSub)?.name || rowSub}
                                </th>
                                {heatmapData.validSubjects.map(colSub => {
                                    const val = heatmapData.matrix[rowSub][colSub];
                                    const displayVal = val === 1 ? '-' : val === 0 ? '?' : val.toFixed(2);
                                    return (
                                        <td key={`cell-${rowSub}-${colSub}`} className={`p-2 border border-white ${getColor(val)} transition-colors hover:opacity-80`}>
                                            <span className="text-xs">{displayVal}</span>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
