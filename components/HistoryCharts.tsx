import React from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    ComposedChart, Area, Bar, BarChart
} from 'recharts';
import { TrendDataPoint } from '../services/trendEngine';
import { CareType } from '../types';
import { unifiedSyncService as DatabaseService } from '../services/unifiedSyncService';
import type { HistoryRecord } from '../services/database';

// === 1. SummaryView (종합 성장 스코어보드) ===
export const SummaryView: React.FC<{ data: TrendDataPoint[] }> = ({ data }) => {
    const latest = data[data.length - 1];
    const previous = data.length > 1 ? data[data.length - 2] : null;
    const scoreDiff = previous ? latest.score - previous.score : 0;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="text-xs font-bold text-slate-400 uppercase mb-2">현재 진단 유형 (Care Type)</div>
                    <div className="text-xl font-black text-blue-600 dark:text-blue-400">
                        {latest.careType}
                    </div>
                    {previous && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1">
                            <span>이전:</span> <span className="font-bold">{previous.careType}</span>
                        </div>
                    )}
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="text-xs font-bold text-slate-400 uppercase mb-2">최신 종합 점수 (Score)</div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-slate-900 dark:text-white">{latest.score}</span>
                        <span className="text-xs font-bold text-slate-400">/ 100</span>
                        {previous && (
                            <span className={`text-xs font-black px-2 py-0.5 rounded-full ${scoreDiff >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                {scoreDiff >= 0 ? `+${scoreDiff}점 향상 ↑` : `${scoreDiff}점 ↓`}
                            </span>
                        )}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="text-xs font-bold text-slate-400 uppercase mb-2">누적 검사 횟수</div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{data.length}회차</span>
                        <span className="text-xs font-medium text-slate-400">정기 성장 추적 진행 중</span>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 h-[380px]">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
                        <span>📈</span> 종합 성장 점수 및 진단 일치도 변화 곡선
                    </h3>
                    <span className="text-xs text-slate-400 font-medium">과거 → 최신 추이</span>
                </div>
                <ResponsiveContainer width="100%" height="88%">
                    <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                        <YAxis stroke="#94a3b8" domain={[0, 100]} tick={{ fontSize: 12 }} />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Legend />
                        <Line type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={3.5} activeDot={{ r: 7 }} name="종합 스코어" />
                        <Line type="monotone" dataKey="coherence" stroke="#10b981" strokeWidth={2.5} strokeDasharray="4 4" name="진단 일치도" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

// === 2. CognitiveView (인지 & 두뇌 테스트 추이) ===
export const CognitiveView: React.FC<{ data: TrendDataPoint[] }> = ({ data }) => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. 작업기억력 정답률 & RAM 레벨 */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 h-[360px]">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                            <span>🧠</span> 작업 기억력(RAM) 정답률 & 난이도
                        </h3>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold">N-Back Test</span>
                    </div>
                    <ResponsiveContainer width="100%" height="85%">
                        <ComposedChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="date" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" domain={[0, 100]} />
                            <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                            <Legend />
                            <Bar dataKey="accuracy" fill="#6366f1" name="정답률 (%)" radius={[4, 4, 0, 0]} barSize={24} />
                            <Line type="monotone" dataKey="spanScore" stroke="#06b6d4" strokeWidth={3} name="기억 용량 스코어" />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>

                {/* 2. 두뇌 인지 처리 반응속도 (ms) */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 h-[360px]">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                            <span>⚡</span> 인지 처리 반응속도 (Reaction Time)
                        </h3>
                        <span className="text-[11px] text-slate-400">낮을수록 빠른 두뇌 회전</span>
                    </div>
                    <ResponsiveContainer width="100%" height="85%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="date" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" domain={['auto', 'auto']} unit="ms" />
                            <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                            <Legend />
                            <Line type="monotone" dataKey="responseTime" stroke="#f59e0b" strokeWidth={3} name="평균 반응시간 (ms)" activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

// === 3. SurveyView (심리 & 5대 기질 설문 추이) ===
export const SurveyView: React.FC<{ data: TrendDataPoint[] }> = ({ data }) => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. 시험불안(BAI) & 수면장애(ISI) 완화 곡선 */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 h-[360px]">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                            <span>😰</span> 시험불안(BAI) & 수면피로(ISI) 완화 추이
                        </h3>
                        <span className="text-[11px] text-emerald-600 font-bold">하향 시 멘탈 안정</span>
                    </div>
                    <ResponsiveContainer width="100%" height="85%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="date" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                            <Legend />
                            <Line type="monotone" dataKey="bai" stroke="#ef4444" strokeWidth={3} name="시험불안 (BAI)" />
                            <Line type="monotone" dataKey="isi" stroke="#f97316" strokeWidth={2.5} name="수면장애 (ISI)" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* 2. 자율신경 신체화 증상 수 (교감 vs 부교감) - 설문 기반 추정 */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 h-[360px] flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                                <span>⚖️</span> 자율신경 자각 증상 추정 (설문 기반)
                            </h3>
                            <span className="text-[10px] bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                                📝 설문 문항 응답 집계
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-2">
                            * HRV 센서 직접 측정값이 아니며, 설문지(가슴 두근거림, 긴장, 소화불량, 무기력 등) 자각 증상 개수 기준 추정 지표입니다.
                        </p>
                    </div>
                    <div className="flex-1 w-full min-h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="date" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" allowDecimals={false} unit="개" />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                                    formatter={(value: any, name: any) => [`${value}개 증상 체크`, `${name} (설문 추정)`]}
                                />
                                <Legend />
                                <Bar dataKey="sns" fill="#ef4444" name="교감 긴장 자각 증상 (설문)" radius={[4, 4, 0, 0]} barSize={20} />
                                <Bar dataKey="pns" fill="#3b82f6" name="부교감 저하 자각 증상 (설문)" radius={[4, 4, 0, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* 3. 집중력 지속성 및 피로도 */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 h-[340px]">
                <h3 className="font-bold text-base text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <span>🎯</span> 학습 집중력 & 만성 피로도 지수
                </h3>
                <ResponsiveContainer width="100%" height="85%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="date" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" domain={[0, 100]} />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                        <Legend />
                        <Line type="monotone" dataKey="concentration" stroke="#2563eb" strokeWidth={3} name="학습 몰입·집중력" />
                        <Line type="monotone" dataKey="adrenal" stroke="#eab308" strokeWidth={2.5} name="부신 피로도" />
                        <Line type="monotone" dataKey="cfs" stroke="#a855f7" strokeWidth={2} strokeDasharray="4 4" name="만성 피로 증상 수" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

// === 4. AcademicView (학습 효율 & 순공 관리 추이) ===
export const AcademicView: React.FC<{ data: TrendDataPoint[] }> = ({ data }) => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. 순공 시간 비율 & 목표 달성률 */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 h-[360px]">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                            <span>📚</span> 순공 집중 비율 & 목표 달성률 (%)
                        </h3>
                        <span className="text-[11px] text-blue-600 font-bold">시간 활용 효율</span>
                    </div>
                    <ResponsiveContainer width="100%" height="85%">
                        <ComposedChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="date" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" domain={[0, 100]} unit="%" />
                            <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                            <Legend />
                            <Area type="monotone" dataKey="pureStudyRatio" fill="#e0e7ff" stroke="#4f46e5" strokeWidth={2} name="순공 시간 비율" />
                            <Line type="monotone" dataKey="goalAchievementRate" stroke="#10b981" strokeWidth={3} name="목표 달성률" />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>

                {/* 2. 평균 연속 집중 시간 (분) */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 h-[360px]">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                            <span>⏱️</span> 1회 연속 집중 유지 시간 (분)
                        </h3>
                        <span className="text-[11px] text-slate-400">지속력 향상 지표</span>
                    </div>
                    <ResponsiveContainer width="100%" height="85%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="date" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" unit="분" />
                            <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                            <Legend />
                            <Bar dataKey="avgFocusDuration" fill="#0ea5e9" name="평균 집중 지속(분)" radius={[4, 4, 0, 0]} barSize={24} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

// === 5. PastPrescriptionsView ===
export const PastPrescriptionsView: React.FC<{ rawHistory: any[] }> = ({ rawHistory }) => {
    const recentWithPrescriptions = rawHistory.find(h => 
        h.completedExpertGuideItems?.length > 0 || 
        Object.keys(h.selectedSubjectOptions || {}).some((k: string) => h.selectedSubjectOptions[k]?.length > 0) ||
        Object.keys(h.selectedStrategies || {}).length > 0
    );

    if (!recentWithPrescriptions) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 py-20">
                <span className="text-4xl mb-4">📭</span>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">과거 처방 내역이 없습니다</h3>
                <p>이 학생에 대해 이전에 저장된 Expert Guide 항목이나 학습 전략 내역이 없습니다.</p>
            </div>
        );
    }

    const { date, careType, completedExpertGuideItems, selectedSubjectOptions } = recentWithPrescriptions;
    const formattedDate = new Date(date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800 p-6 rounded-2xl border border-blue-100 dark:border-slate-700 mb-6">
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="text-2xl">📋</span> 최근 처방 기준일: {formattedDate}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    당시 진단 유형: <span className="font-bold text-blue-600">{careType}</span>
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <h4 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                        <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
                        Expert Guide 처방 항목
                    </h4>
                    {completedExpertGuideItems?.length > 0 ? (
                        <ul className="space-y-2">
                            {completedExpertGuideItems.map((item: string, idx: number) => (
                                <li key={idx} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl text-sm flex items-center gap-2">
                                    <span className="text-emerald-500">✓</span> {item}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-slate-400">완료된 Expert Guide 항목이 없습니다.</p>
                    )}
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <h4 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                        <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
                        취약 과목 맞춤 옵션
                    </h4>
                    {selectedSubjectOptions && Object.keys(selectedSubjectOptions).length > 0 ? (
                        <div className="space-y-3">
                            {Object.entries(selectedSubjectOptions).map(([subj, opts]: [string, any]) => (
                                <div key={subj} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                                    <span className="font-bold text-xs text-indigo-600 block mb-1">{subj.toUpperCase()}</span>
                                    <p className="text-sm">{Array.isArray(opts) ? opts.join(', ') : opts}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400">지정된 과목 옵션이 없습니다.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

// === 6. ManageHistoryView ===
export const ManageHistoryView: React.FC<{ 
    rawHistory: HistoryRecord[], 
    onDataChanged: () => void 
}> = ({ rawHistory, onDataChanged }) => {
    const [editingId, setEditingId] = React.useState<number | null>(null);
    const [editDate, setEditDate] = React.useState<string>('');

    const handleDelete = async (id: number | undefined) => {
        if (!id) return;
        if (window.confirm("이 측정 기록을 완전히 삭제하시겠습니까?\n삭제 후에는 복구할 수 없습니다.")) {
            try {
                await DatabaseService.deleteHistory(id);
                onDataChanged();
            } catch (err) {
                alert("삭제에 실패했습니다.");
            }
        }
    };

    const startEditing = (record: HistoryRecord) => {
        if (!record.id) return;
        setEditingId(record.id);
        const d = new Date(record.date);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        setEditDate(`${yyyy}-${mm}-${dd}`);
    };

    const saveEdit = async (record: HistoryRecord) => {
        if (!record.id) return;
        try {
            const updatedRecord = { ...record, date: new Date(editDate).toISOString() };
            await DatabaseService.updateHistory(updatedRecord);
            setEditingId(null);
            onDataChanged();
        } catch (err) {
            alert("수정에 실패했습니다.");
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditDate('');
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-lg mb-6 text-slate-900 dark:text-white flex items-center gap-2">
                <span>⚙️</span> 측정 히스토리 관리
            </h3>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-sm">
                            <th className="pb-3 font-bold">측정일 (Date)</th>
                            <th className="pb-3 font-bold">진단 (Care Type)</th>
                            <th className="pb-3 font-bold">점수 (Score)</th>
                            <th className="pb-3 font-bold text-right">관리 (Actions)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rawHistory.map((record) => (
                            <tr key={record.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                                <td className="py-4">
                                    {editingId === record.id ? (
                                        <input 
                                            type="date" 
                                            value={editDate}
                                            onChange={(e) => setEditDate(e.target.value)}
                                            className="px-2 py-1 border border-slate-300 rounded text-sm outline-none focus:border-blue-500"
                                        />
                                    ) : (
                                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                                            {new Date(record.date).toLocaleDateString()}
                                        </span>
                                    )}
                                </td>
                                <td className="py-4 text-slate-600 dark:text-slate-400">
                                    {record.careType || 'Unknown'}
                                </td>
                                <td className="py-4 font-bold text-blue-600 dark:text-blue-400">
                                    {record.score || 0}점
                                </td>
                                <td className="py-4 text-right">
                                    {editingId === record.id ? (
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={() => saveEdit(record)}
                                                className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded"
                                            >
                                                저장
                                            </button>
                                            <button 
                                                onClick={cancelEdit}
                                                className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded"
                                            >
                                                취소
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={() => startEditing(record)}
                                                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 text-xs font-bold rounded transition-colors"
                                            >
                                                날짜수정
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(record.id)}
                                                className="px-3 py-1 bg-rose-100 hover:bg-rose-200 text-rose-600 text-xs font-bold rounded transition-colors"
                                            >
                                                삭제
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {rawHistory.length === 0 && (
                            <tr>
                                <td colSpan={4} className="py-8 text-center text-slate-500">
                                    기록이 없습니다.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
