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

    const [showGuide, setShowGuide] = React.useState<boolean>(true);

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                    과목 간 성적 변동의 <strong>상관관계(Pearson)</strong>를 분석하여, 학습 시간 배분의 불균형과 성적 연동 패턴을 진단합니다.
                </p>
                <button
                    onClick={() => setShowGuide(!showGuide)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors cursor-pointer self-start sm:self-auto shrink-0"
                >
                    <span>{showGuide ? '📖 가이드 접기' : '💡 사용법 & 해석 가이드'}</span>
                </button>
            </div>

            {/* 범례 (Legend) */}
            <div className="flex flex-wrap items-center gap-2 text-[11px] p-2.5 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="font-bold text-slate-600 dark:text-slate-400 mr-1">🔍 색상 범례:</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500 text-white font-bold">
                    +0.7 이상 (강한 동조화)
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-200 text-rose-900 font-medium">
                    +0.1 ~ +0.6 (동반 변동)
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-200 text-slate-600">
                    - / ? (무상관·데이터부족)
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-200 text-blue-900 font-medium">
                    -0.1 ~ -0.6 (역방향 변동)
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500 text-white font-bold">
                    -0.7 이하 (풍선효과·상충)
                </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-xs">
                <table className="w-full text-center border-collapse">                    <thead>
                        <tr>
                            <th className="p-2.5 border border-slate-200 bg-slate-100/80 text-xs font-bold text-slate-600">과목명</th>
                            {heatmapData.validSubjects.map(sub => (
                                <th key={`col-${sub}`} className="p-2.5 border border-slate-200 bg-slate-100/80 text-xs font-bold text-slate-700">
                                    {SUNEUNG_SUBJECTS.find(s => s.id === sub)?.name || sub}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {heatmapData.validSubjects.map(rowSub => (
                            <tr key={`row-${rowSub}`}>
                                <th className="p-2.5 border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 text-left">
                                    {SUNEUNG_SUBJECTS.find(s => s.id === rowSub)?.name || rowSub}
                                </th>
                                {heatmapData.validSubjects.map(colSub => {
                                    const val = heatmapData.matrix[rowSub][colSub];
                                    const displayVal = val === 1 ? '-' : val === 0 ? '?' : val.toFixed(2);
                                    return (
                                        <td key={`cell-${rowSub}-${colSub}`} className={`p-2.5 border border-white ${getColor(val)} transition-colors hover:opacity-80`}>
                                            <span className="text-xs">{displayVal}</span>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {records.length < 2 && (
                <p className="text-[11px] text-slate-400">
                    ※ 시험이 1회만 등록되어 있어 `?`로 표시됩니다. 2회 이상 누적되면 유의미한 상관 수치가 산출됩니다.
                </p>
            )}

            {/* 상세 사용법 & 실전 활용 가이드 (Collapsible Guide Card) */}
            {showGuide && (
                <div className="p-5 bg-gradient-to-br from-indigo-50/70 via-blue-50/50 to-purple-50/50 rounded-2xl border border-indigo-200/80 shadow-xs space-y-4 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
                        <h4 className="text-sm font-bold text-indigo-950 flex items-center gap-2">
                            <span>📘</span> 과목간 성적 상관관계 히트맵 사용법 &amp; 실전 전략 가이드
                        </h4>
                        <span className="text-[11px] font-semibold text-indigo-600 bg-white px-2.5 py-1 rounded-full border border-indigo-200 shadow-2xs">
                            피어슨 상관계수(r) 분석
                        </span>
                    </div>

                    {/* 핵심 해석표 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="p-3.5 bg-white rounded-xl border border-rose-200 shadow-2xs space-y-1.5">
                            <div className="font-bold text-rose-700 flex items-center gap-1.5 text-[13px]">
                                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
                                붉은색 계열 (양의 상관관계: r &gt; 0)
                            </div>
                            <p className="text-slate-600 leading-relaxed text-[11.5px]">
                                <strong>“두 과목이 함께 오르거나 함께 떨어지는 동조화 현상”</strong><br />
                                뇌 피로도, 시험 불안, 수면 부족 등 12대 CareType 두뇌 컨디션이나 전반적인 문제 해결 독해력이 두 과목에 공통으로 작용하고 있음을 의미합니다.
                            </p>
                            <div className="p-2 bg-rose-50 rounded-lg text-rose-800 text-[11px] font-medium">
                                💡 <strong>처방:</strong> 시험 당일 두뇌 프라이밍, 생체 리듬 유지, 기본 인지 피로 관리가 두 과목 성적을 동시에 견인합니다.
                            </div>
                        </div>

                        <div className="p-3.5 bg-white rounded-xl border border-blue-200 shadow-2xs space-y-1.5">
                            <div className="font-bold text-blue-700 flex items-center gap-1.5 text-[13px]">
                                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
                                푸른색 계열 (음의 상관관계: r &lt; 0)
                            </div>
                            <p className="text-slate-600 leading-relaxed text-[11.5px]">
                                <strong>“한 과목이 오르면 다른 과목이 떨어지는 풍선 효과 (Zero-Sum)”</strong><br />
                                특정 과목 점수를 올리기 위해 다른 과목의 공부 시간을 과도하게 뺏어 썼거나, 과목 간 학습 밸런스가 무너졌음을 나타냅니다.
                            </p>
                            <div className="p-2 bg-blue-50 rounded-lg text-blue-800 text-[11px] font-medium">
                                💡 <strong>처방:</strong> 취약 과목 집중 기간에도 상대 과목의 '일일 감각 유지 학습량(30~45분)'을 주간 플래너에 강제 편성해야 합니다.
                            </div>
                        </div>
                    </div>

                    {/* 3대 실전 학습 코칭 가이드 */}
                    <div className="bg-white/80 p-4 rounded-xl border border-indigo-100 space-y-2 text-xs">
                        <strong className="text-indigo-900 block text-xs flex items-center gap-1.5">
                            <span>🎯</span> 성적 상담 및 주간 학습 계획 시 활용 팁
                        </strong>
                        <ul className="space-y-1.5 text-slate-700 text-[11.5px] leading-relaxed pl-1">
                            <li className="flex items-start gap-1.5">
                                <span className="text-indigo-600 font-bold">1.</span>
                                <div><strong>학습 시간 몰아주기 차단:</strong> 특정 과목 모의고사 점수가 급상승했을 때, 파란색 음의 상관 과목의 등급이 하락하지 않았는지 히트맵으로 즉시 검증합니다.</div>
                            </li>
                            <li className="flex items-start gap-1.5">
                                <span className="text-indigo-600 font-bold">2.</span>
                                <div><strong>수능 직전 과목 방어선 구축:</strong> 수능 100일 전부터는 상충(파란색) 과목군을 '전 과목 균형 유지 모드'로 전환하여 실전 등급 붕괴를 예방합니다.</div>
                            </li>
                            <li className="flex items-start gap-1.5">
                                <span className="text-indigo-600 font-bold">3.</span>
                                <div><strong>필요 데이터:</strong> 최소 2개 과목 이상에서 2회 이상의 시험 성적이 누적되어야 유의미한 상관 분석 수치가 산출됩니다.</div>
                            </li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};
