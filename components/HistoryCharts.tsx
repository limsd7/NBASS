import React from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    ComposedChart, Area, Bar, BarChart
} from 'recharts';
import { TrendDataPoint, ComprehensiveTrendData } from '../services/trendEngine';
import { CareType } from '../types';
import { DatabaseService, HistoryRecord } from '../services/database';

// === SummaryView ===
export const SummaryView: React.FC<{ data: TrendDataPoint[] }> = ({ data }) => {
    // 가장 최근 데이터
    const latest = data[data.length - 1];
    const previous = data.length > 1 ? data[data.length - 2] : null;

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="text-xs font-bold text-slate-400 uppercase mb-2">Current Care Type</div>
                    <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
                        {latest.careType}
                    </div>
                    {previous && (
                        <div className="text-xs text-slate-500 mt-2">
                            Prev: {previous.careType}
                        </div>
                    )}
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="text-xs font-bold text-slate-400 uppercase mb-2">Total Score Trend</div>
                    <div className="flex items-end gap-2">
                        <span className="text-4xl font-black text-slate-900 dark:text-white">{latest.score}</span>
                        <span className="text-sm font-bold text-slate-500 mb-2">/ 100</span>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 h-[400px]">
                <h3 className="font-bold text-lg mb-6 text-slate-900 dark:text-white">종합 점수 변화 추이</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                        <YAxis stroke="#94a3b8" domain={[0, 100]} tick={{ fontSize: 12 }} />
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={4} activeDot={{ r: 8 }} name="종합 점수" />
                        <Line type="monotone" dataKey="coherence" stroke="#10b981" strokeWidth={3} strokeDasharray="5 5" name="진단 일치도(Coherence)" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

// === SurveyView (Updated) ===
export const SurveyView: React.FC<{ data: TrendDataPoint[] }> = ({ data }) => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. 불안/수면 */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 h-[350px]">
                    <h3 className="font-bold text-lg mb-4">심리 불안/수면 (BAI & ISI)</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="date" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                            <Legend />
                            <Line type="monotone" dataKey="bai" stroke="#ef4444" strokeWidth={3} name="불안(BAI)" />
                            <Line type="monotone" dataKey="isi" stroke="#fbbf24" strokeWidth={3} name="수면(ISI)" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* 2. 자율신경 증상 수 */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 h-[350px]">
                    <h3 className="font-bold text-lg mb-4">자율신경 증상 수 (SNS vs PNS)</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="date" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                            <Legend />
                            <Bar dataKey="sns" fill="#ef4444" name="교감신경 증상" radius={[4, 4, 0, 0]} barSize={20} />
                            <Bar dataKey="pns" fill="#3b82f6" name="부교감신경 증상" radius={[4, 4, 0, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* 3. 집중력, 부신피로, CFS (New) */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 h-[350px]">
                <h3 className="font-bold text-lg mb-4">집중력 및 피로도 상세 (Concentration, Adrenal, CFS)</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="date" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                        <Legend />
                        <Line type="monotone" dataKey="concentration" stroke="#3b82f6" strokeWidth={3} name="집중력" />
                        <Line type="monotone" dataKey="adrenal" stroke="#f59e0b" strokeWidth={3} name="부신피로" />
                        <Line type="monotone" dataKey="cfs" stroke="#8b5cf6" strokeWidth={3} name="CFS (만성피로)" strokeDasharray="5 5" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

// === HrvView (Updated) ===
export const HrvView: React.FC<{ data: TrendDataPoint[] }> = ({ data }) => {
    return (
        <div className="space-y-6">
            {/* 1. 활력/스트레스 (기존) */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 h-[400px]">
                <h3 className="font-bold text-lg mb-6">신체 활력도 및 스트레스 변화</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="date" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" domain={[0, 100]} />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                        <Legend />
                        <Area type="monotone" dataKey="vitality" fill="#d1fae5" stroke="#10b981" strokeWidth={2} name="활력도" />
                        <Line type="monotone" dataKey="stressIndex" stroke="#ef4444" strokeWidth={3} name="스트레스" />
                        <Line type="monotone" dataKey="fatigue" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" name="피로도" />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 2. HRV-Index (New) */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 h-[350px]">
                    <h3 className="font-bold text-lg mb-4">HRV-Index</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="date" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                            <Legend />
                            <Line type="monotone" dataKey="hrvIndex" stroke="#6366f1" strokeWidth={3} name="HRV Index" activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* 3. Frequency Domain Analysis (New) */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 h-[350px]">
                    <h3 className="font-bold text-lg mb-4">주파수 영역 분석 (Frequency Domain)</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="date" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                            <Legend />
                            <Bar dataKey="tp" fill="#94a3b8" name="TP" stackId="a" />
                            <Bar dataKey="vlf" fill="#cbd5e1" name="VLF" stackId="a" />
                            <Bar dataKey="lf" fill="#f87171" name="LF" stackId="a" />
                            <Bar dataKey="hf" fill="#60a5fa" name="HF" stackId="a" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

// === EegView (Updated) ===
export const EegView: React.FC<{ data: TrendDataPoint[] }> = ({ data }) => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. 두뇌 건강 점수 (Brain Score) */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 h-[350px]">
                    <h3 className="font-bold text-lg mb-4">뇌 건강점수 (Brain Score)</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="date" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" domain={[0, 100]} />
                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                            <Legend />
                            <Line type="monotone" dataKey="brainScore" stroke="#8b5cf6" strokeWidth={4} name="Brain Score" activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* 2. 뇌파 비율 (New) */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 h-[350px]">
                    <h3 className="font-bold text-lg mb-4">뇌파 비율 (%)</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="date" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                            <Legend />
                            <Bar dataKey="gamma" fill="#dc2626" name="Gamma" stackId="a" />
                            <Bar dataKey="hBeta" fill="#ea580c" name="H-Beta" stackId="a" />
                            <Bar dataKey="mBeta" fill="#f59e0b" name="M-Beta" stackId="a" />
                            <Bar dataKey="lBeta" fill="#fbbf24" name="L-Beta" stackId="a" />
                            <Bar dataKey="alpha" fill="#10b981" name="Alpha" stackId="a" />
                            <Bar dataKey="theta" fill="#3b82f6" name="Theta" stackId="a" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

// === PastPrescriptionsView (New) ===
export const PastPrescriptionsView: React.FC<{ rawHistory: any[] }> = ({ rawHistory }) => {
    // 가장 최근의 처방 내역을 가져옵니다.
    const recentWithPrescriptions = rawHistory.find(h => 
        h.completedExpertGuideItems?.length > 0 || 
        Object.keys(h.selectedSubjectOptions || {}).some(k => h.selectedSubjectOptions[k]?.length > 0) ||
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
                                <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                                    <span className="text-emerald-500 mt-0.5">✓</span> {item}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-slate-400 italic">체크된 항목이 없습니다.</p>
                    )}
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <h4 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                        <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
                        과목별 학습 전략 (Subject Strategy)
                    </h4>
                    {selectedSubjectOptions && Object.keys(selectedSubjectOptions).some(k => selectedSubjectOptions[k]?.length > 0) ? (
                        <div className="space-y-4">
                            {Object.entries(selectedSubjectOptions).map(([subj, items]: [string, any]) => {
                                if (!items || items.length === 0) return null;
                                const subjName = subj === 'korean' ? '국어' : subj === 'math' ? '수학' : '영어';
                                return (
                                    <div key={subj}>
                                        <h5 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-2 bg-indigo-50 dark:bg-indigo-900/30 inline-block px-2 py-1 rounded">
                                            {subjName}
                                        </h5>
                                        <ul className="space-y-1">
                                            {items.map((item: string, idx: number) => (
                                                <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300 pl-2">
                                                    <span className="text-indigo-400 text-[10px] mt-1">●</span> {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400 italic">선택된 과목별 전략이 없습니다.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

// === ManageHistoryView ===
export const ManageHistoryView: React.FC<{ 
    rawHistory: HistoryRecord[], 
    onDataChanged: () => void 
}> = ({ rawHistory, onDataChanged }) => {
    const [editingId, setEditingId] = React.useState<number | null>(null);
    const [editDate, setEditDate] = React.useState<string>('');

    const handleDelete = async (id: number | undefined) => {
        if (!id) return;
        if (window.confirm("이 측정 기록을 완전히 삭제하시겠습니까?\\n삭제 후에는 복구할 수 없습니다.")) {
            try {
                await DatabaseService.deleteHistory(id);
                onDataChanged(); // 부모 컴포넌트에 알림
            } catch (err) {
                alert("삭제에 실패했습니다.");
            }
        }
    };

    const startEditing = (record: HistoryRecord) => {
        if (!record.id) return;
        setEditingId(record.id);
        // 날짜 포맷팅 (YYYY-MM-DD)
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
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
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
                                    {record.classificationResult?.primary || 'Unknown'}
                                </td>
                                <td className="py-4 font-bold text-blue-600 dark:text-blue-400">
                                    {record.summaryScore}
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
