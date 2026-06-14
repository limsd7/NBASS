// 상담 이력 컴포넌트 (Consultation History)
// 상담 내용, 사용한 스크립트, 학생 반응을 시계열로 기록

import React, { useState, useMemo, useCallback } from 'react';
import { CareType } from '../types';
import {
    ConsultationEntry,
    CONSULT_TYPE_LABELS,
    REACTION_LABELS,
    loadConsultationHistory,
    addConsultationEntry,
    updateConsultationEntry,
    deleteConsultationEntry,
    getStudentConsultations
} from '../data/consultationHistory';

interface ConsultationHistoryProps {
    studentId: string;
    studentName: string;
    careType: CareType;
    onScriptUsed?: (script: string) => void; // 예측 분석에서 스크립트 사용 시 호출
}

export const ConsultationHistory: React.FC<ConsultationHistoryProps> = ({
    studentId,
    studentName,
    careType,
    onScriptUsed
}) => {
    const [consultations, setConsultations] = useState<ConsultationEntry[]>(() =>
        getStudentConsultations(studentId)
    );
    const [showAddForm, setShowAddForm] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    // 새 상담 기록 폼 상태
    const [newEntry, setNewEntry] = useState({
        consultType: 'general' as ConsultationEntry['consultType'],
        scriptUsed: '',
        notes: '',
        studentReaction: 'neutral' as ConsultationEntry['studentReaction'],
        actionItems: [] as string[],
        followUpNotes: ''
    });
    const [newActionItem, setNewActionItem] = useState('');

    // 상담 목록 새로고침
    const refreshConsultations = useCallback(() => {
        setConsultations(getStudentConsultations(studentId));
    }, [studentId]);

    // 새 상담 기록 추가
    const handleAddEntry = useCallback(() => {
        if (!newEntry.notes.trim()) return;

        addConsultationEntry({
            studentId,
            studentName,
            careType,
            consultType: newEntry.consultType,
            scriptUsed: newEntry.scriptUsed || undefined,
            notes: newEntry.notes,
            studentReaction: newEntry.studentReaction,
            actionItems: newEntry.actionItems.length > 0 ? newEntry.actionItems : undefined,
            followUpNotes: newEntry.followUpNotes || undefined
        });

        // 폼 초기화
        setNewEntry({
            consultType: 'general',
            scriptUsed: '',
            notes: '',
            studentReaction: 'neutral',
            actionItems: [],
            followUpNotes: ''
        });
        setShowAddForm(false);
        refreshConsultations();
    }, [studentId, studentName, careType, newEntry, refreshConsultations]);

    // 조치 항목 추가
    const handleAddActionItem = () => {
        if (newActionItem.trim()) {
            setNewEntry(prev => ({
                ...prev,
                actionItems: [...prev.actionItems, newActionItem.trim()]
            }));
            setNewActionItem('');
        }
    };

    // 조치 항목 삭제
    const handleRemoveActionItem = (index: number) => {
        setNewEntry(prev => ({
            ...prev,
            actionItems: prev.actionItems.filter((_, i) => i !== index)
        }));
    };

    // 상담 기록 삭제
    const handleDelete = useCallback((id: string) => {
        if (window.confirm('이 상담 기록을 삭제하시겠습니까?')) {
            deleteConsultationEntry(id);
            refreshConsultations();
        }
    }, [refreshConsultations]);

    // 날짜 포맷
    const formatDate = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-4">
            {/* 헤더 */}
            <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-700 flex items-center gap-2">
                    <span>📝</span> 상담 이력
                    <span className="text-xs font-normal text-slate-500">
                        ({consultations.length}건)
                    </span>
                </h4>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-bold transition ${showAddForm
                            ? 'bg-slate-200 text-slate-600'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                >
                    {showAddForm ? '✕ 취소' : '➕ 새 상담 기록'}
                </button>
            </div>

            {/* 새 상담 기록 폼 */}
            {showAddForm && (
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200 space-y-4 animate-in fade-in slide-in-from-top-2">
                    <h5 className="font-bold text-indigo-800 text-sm">새 상담 기록 작성</h5>

                    {/* 상담 유형 */}
                    <div>
                        <label className="text-xs font-bold text-slate-600 block mb-2">상담 유형</label>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(CONSULT_TYPE_LABELS).map(([key, { label, emoji }]) => (
                                <button
                                    key={key}
                                    onClick={() => setNewEntry(prev => ({ ...prev, consultType: key as any }))}
                                    className={`text-xs px-3 py-1.5 rounded-lg border transition ${newEntry.consultType === key
                                            ? 'bg-indigo-600 text-white border-indigo-600'
                                            : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                                        }`}
                                >
                                    {emoji} {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 사용한 스크립트 */}
                    <div>
                        <label className="text-xs font-bold text-slate-600 block mb-2">
                            사용한 스크립트 (선택)
                        </label>
                        <textarea
                            value={newEntry.scriptUsed}
                            onChange={(e) => setNewEntry(prev => ({ ...prev, scriptUsed: e.target.value }))}
                            placeholder="예측 분석에서 사용한 상담 스크립트를 붙여넣기..."
                            className="w-full p-3 text-sm border rounded-lg bg-white focus:ring-2 ring-indigo-200 outline-none resize-none h-20"
                        />
                    </div>

                    {/* 상담 메모 */}
                    <div>
                        <label className="text-xs font-bold text-slate-600 block mb-2">
                            상담 내용 <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={newEntry.notes}
                            onChange={(e) => setNewEntry(prev => ({ ...prev, notes: e.target.value }))}
                            placeholder="상담 내용, 학생과의 대화 요약, 관찰 사항 등..."
                            className="w-full p-3 text-sm border rounded-lg bg-white focus:ring-2 ring-indigo-200 outline-none resize-none h-28"
                        />
                    </div>

                    {/* 학생 반응 */}
                    <div>
                        <label className="text-xs font-bold text-slate-600 block mb-2">학생 반응</label>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(REACTION_LABELS).map(([key, { label, emoji, color }]) => (
                                <button
                                    key={key}
                                    onClick={() => setNewEntry(prev => ({ ...prev, studentReaction: key as any }))}
                                    className={`text-xs px-3 py-1.5 rounded-lg border transition ${newEntry.studentReaction === key
                                            ? 'bg-slate-800 text-white border-slate-800'
                                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                                        }`}
                                >
                                    {emoji} {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 후속 조치 항목 */}
                    <div>
                        <label className="text-xs font-bold text-slate-600 block mb-2">후속 조치 항목</label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={newActionItem}
                                onChange={(e) => setNewActionItem(e.target.value)}
                                placeholder="조치 항목 입력..."
                                className="flex-1 p-2 text-sm border rounded-lg bg-white focus:ring-2 ring-indigo-200 outline-none"
                                onKeyDown={(e) => e.key === 'Enter' && handleAddActionItem()}
                            />
                            <button
                                onClick={handleAddActionItem}
                                className="px-3 py-2 bg-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-300 transition"
                            >
                                추가
                            </button>
                        </div>
                        {newEntry.actionItems.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {newEntry.actionItems.map((item, idx) => (
                                    <span
                                        key={idx}
                                        className="text-xs px-2 py-1 bg-white border border-slate-200 rounded flex items-center gap-1"
                                    >
                                        {item}
                                        <button
                                            onClick={() => handleRemoveActionItem(idx)}
                                            className="text-red-400 hover:text-red-600"
                                        >
                                            ✕
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 저장 버튼 */}
                    <button
                        onClick={handleAddEntry}
                        disabled={!newEntry.notes.trim()}
                        className="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        💾 상담 기록 저장
                    </button>
                </div>
            )}

            {/* 상담 이력 타임라인 */}
            {consultations.length > 0 ? (
                <div className="space-y-3">
                    {consultations.map((entry) => {
                        const typeInfo = CONSULT_TYPE_LABELS[entry.consultType] || CONSULT_TYPE_LABELS.general;
                        const reactionInfo = entry.studentReaction ? REACTION_LABELS[entry.studentReaction] : null;
                        const isExpanded = expandedId === entry.id;

                        return (
                            <div
                                key={entry.id}
                                className="border border-slate-200 rounded-xl overflow-hidden bg-white"
                            >
                                {/* 헤더 */}
                                <div
                                    className="p-3 cursor-pointer hover:bg-slate-50 transition"
                                    onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg">{typeInfo.emoji}</span>
                                            <div>
                                                <p className="font-bold text-slate-800 text-sm">{typeInfo.label}</p>
                                                <p className="text-[10px] text-slate-500">{formatDate(entry.timestamp)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {reactionInfo && (
                                                <span className={`text-xs ${reactionInfo.color}`}>
                                                    {reactionInfo.emoji}
                                                </span>
                                            )}
                                            <span className="text-slate-400">{isExpanded ? '▼' : '▶'}</span>
                                        </div>
                                    </div>
                                    {!isExpanded && (
                                        <p className="text-xs text-slate-600 mt-2 line-clamp-1">
                                            {entry.notes}
                                        </p>
                                    )}
                                </div>

                                {/* 상세 내용 */}
                                {isExpanded && (
                                    <div className="px-3 pb-3 space-y-3 border-t border-slate-100">
                                        {/* 상담 내용 */}
                                        <div className="pt-3">
                                            <p className="text-xs font-bold text-slate-600 mb-1">📋 상담 내용</p>
                                            <p className="text-sm text-slate-700 whitespace-pre-wrap">{entry.notes}</p>
                                        </div>

                                        {/* 사용한 스크립트 */}
                                        {entry.scriptUsed && (
                                            <div className="bg-indigo-50 p-3 rounded-lg">
                                                <p className="text-xs font-bold text-indigo-700 mb-1">💬 사용한 스크립트</p>
                                                <p className="text-sm text-indigo-800 italic">"{entry.scriptUsed}"</p>
                                            </div>
                                        )}

                                        {/* 학생 반응 */}
                                        {reactionInfo && (
                                            <div>
                                                <p className="text-xs font-bold text-slate-600 mb-1">😊 학생 반응</p>
                                                <span className={`text-sm ${reactionInfo.color}`}>
                                                    {reactionInfo.emoji} {reactionInfo.label}
                                                </span>
                                            </div>
                                        )}

                                        {/* 후속 조치 */}
                                        {entry.actionItems && entry.actionItems.length > 0 && (
                                            <div>
                                                <p className="text-xs font-bold text-slate-600 mb-1">✅ 후속 조치</p>
                                                <ul className="space-y-1">
                                                    {entry.actionItems.map((item, idx) => (
                                                        <li key={idx} className="text-sm text-slate-700 flex items-center gap-2">
                                                            <span className="text-green-500">•</span> {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* 삭제 버튼 */}
                                        <div className="pt-2 border-t border-slate-100">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(entry.id);
                                                }}
                                                className="text-xs text-red-500 hover:text-red-700 transition"
                                            >
                                                🗑️ 삭제
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-3xl">📋</span>
                    <p className="text-slate-600 font-bold mt-2">상담 이력이 없습니다</p>
                    <p className="text-slate-500 text-sm mt-1">
                        첫 상담 기록을 작성해 보세요
                    </p>
                </div>
            )}
        </div>
    );
};

export default ConsultationHistory;
