import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

interface Props {
    trendData: { examName: string; averageGrade: number; examDate: string }[];
    subjectBarData: { subject: string; grade: number }[];
    COLORS: string[];
}

export const StudyDashboardCharts: React.FC<Props> = ({ trendData, subjectBarData, COLORS }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Trend Line Chart */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <span className="text-lg">📈</span>
                        <h3 className="font-bold text-slate-800 text-base">시험별 평균 등급 추이</h3>
                    </div>
                    <span className="text-xs text-slate-400 font-medium">낮을수록 우수 (1등급 목표)</span>
                </div>

                <div className="h-64 w-full min-w-0">
                    {trendData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={240}>
                            <LineChart data={trendData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="examName" stroke="#94a3b8" fontSize={11} />
                                <YAxis reversed domain={[1, 9]} stroke="#94a3b8" fontSize={11} ticks={[1, 3, 5, 7, 9]} />
                                <Tooltip
                                    contentStyle={{ borderRadius: "1rem", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                                    formatter={(val: any) => [`${val}등급`, "평균 등급"]}
                                />
                                <Line type="monotone" dataKey="averageGrade" stroke="#2563eb" strokeWidth={3} dot={{ r: 5, fill: "#2563eb" }} activeDot={{ r: 7 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-xs text-slate-400">
                            성적 데이터가 입력되면 추이 그래프가 표시됩니다.
                        </div>
                    )}
                </div>
            </div>

            {/* Subject Breakdown Bar Chart */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <span className="text-lg">📊</span>
                        <h3 className="font-bold text-slate-800 text-base">최근 과목별 등급 현황</h3>
                    </div>
                    <span className="text-xs text-slate-400 font-medium">최신 시험 기준</span>
                </div>

                <div className="h-64 w-full min-w-0">
                    {subjectBarData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={240}>
                            <BarChart data={subjectBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="subject" stroke="#94a3b8" fontSize={11} />
                                <YAxis reversed domain={[1, 9]} stroke="#94a3b8" fontSize={11} ticks={[1, 3, 5, 7, 9]} />
                                <Tooltip
                                    contentStyle={{ borderRadius: "1rem", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                                    formatter={(val: any) => [`${val}등급`, "등급"]}
                                />
                                <Bar dataKey="grade" radius={[8, 8, 0, 0]}>
                                    {subjectBarData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-xs text-slate-400">
                            과목별 성적 데이터가 없습니다.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudyDashboardCharts;