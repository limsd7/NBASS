import React, { useState } from 'react';
import { AssessmentResult } from '../types';

interface DetailedAnalysisSectionProps {
    data?: AssessmentResult;
    analysisText?: string;
    careType?: string;
    brainScore?: number;
    onUpdateAnalysis?: (text: string) => void;
}

const renderFormattedText = (text: string) => {
    if (!text) return <p className="text-slate-400 italic">등록된 상세 분석 소견 데이터가 없습니다.</p>;

    const lines = text.split('\n');
    return (
        <div className="space-y-1.5">
            {lines.map((line, idx) => {
                const trimmed = line.trim();
                if (!trimmed) return <div key={idx} className="h-1.5" />;
                if (trimmed.startsWith('## ')) {
                    return (
                        <h4 key={idx} className="text-sm font-black text-indigo-900 mt-3 pt-2 border-t border-indigo-100/80 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                            {trimmed.replace(/^##\s*/, '')}
                        </h4>
                    );
                }
                if (trimmed.startsWith('### ')) {
                    return (
                        <h5 key={idx} className="text-xs font-bold text-slate-800 mt-2 flex items-center gap-1">
                            <span className="text-indigo-400 font-bold">▸</span>
                            {trimmed.replace(/^###\s*/, '')}
                        </h5>
                    );
                }
                if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
                    const content = trimmed.substring(2);
                    const parts = content.split(/(\*\*.*?\*\*)/g);
                    return (
                        <div key={idx} className="flex items-start gap-2 ml-2 text-xs text-slate-700 leading-relaxed">
                            <span className="text-indigo-500 mt-0.5">•</span>
                            <span>
                                {parts.map((part, pIdx) => {
                                    if (part.startsWith('**') && part.endsWith('**')) {
                                        return <strong key={pIdx} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
                                    }
                                    return part;
                                })}
                            </span>
                        </div>
                    );
                }
                if (trimmed.startsWith('> ')) {
                    return (
                        <div key={idx} className="p-2.5 bg-indigo-50/60 border-l-4 border-indigo-400 rounded-r-lg text-xs text-slate-700 leading-relaxed italic my-1">
                            {trimmed.substring(2)}
                        </div>
                    );
                }

                const parts = trimmed.split(/(\*\*.*?\*\*)/g);
                return (
                    <p key={idx} className="text-xs text-slate-700 leading-relaxed">
                        {parts.map((part, pIdx) => {
                            if (part.startsWith('**') && part.endsWith('**')) {
                                return <strong key={pIdx} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
                            }
                            return part;
                        })}
                    </p>
                );
            })}
        </div>
    );
};

export const DetailedAnalysisSection: React.FC<DetailedAnalysisSectionProps> = ({
    data,
    analysisText,
    careType,
    brainScore,
    onUpdateAnalysis
}) => {
    const rawText = analysisText ?? data?.analysisText ?? '';
    const rawCareType = careType ?? data?.careType ?? '맞춤형 관리';
    const rawBrainScore = brainScore ?? data?.hrv?.brainScore ?? 75;

    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(rawText);
    const [isExpanded, setIsExpanded] = useState(true);

    const handleSave = () => {
        if (onUpdateAnalysis) {
            onUpdateAnalysis(editText);
        }
        setIsEditing(false);
    };

    return (
        <div className="p-6 bg-gradient-to-br from-blue-50/80 to-indigo-50/60 rounded-3xl border border-blue-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                    <span className="p-2 bg-blue-600 text-white rounded-xl text-sm shadow-sm">🧠</span>
                    <div>
                        <h3 className="font-black text-slate-900 text-base sm:text-lg">심층 임상 신경인지 분석 소견</h3>
                        <p className="text-xs text-slate-500 font-medium">수험생 전용 AI 신경인지·생체 바이오마커 종합 분석</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                        {isExpanded ? '접기 ▲' : '펼치기 ▼'}
                    </button>
                    {onUpdateAnalysis && (
                        <button
                            onClick={() => {
                                if (isEditing) {
                                    handleSave();
                                } else {
                                    setEditText(rawText);
                                    setIsEditing(true);
                                    setIsExpanded(true);
                                }
                            }}
                            className="px-3.5 py-1.5 bg-white hover:bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                        >
                            {isEditing ? '저장 완료' : '✏️ 소견 수정'}
                        </button>
                    )}
                </div>
            </div>

            {isEditing ? (
                <div className="space-y-3">
                    <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        rows={10}
                        className="w-full p-4 text-sm text-slate-800 bg-white border border-blue-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium leading-relaxed"
                        placeholder="분석 소견 내용을 입력하세요..."
                    />
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-200 cursor-pointer"
                        >
                            취소
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 cursor-pointer"
                        >
                            저장
                        </button>
                    </div>
                </div>
            ) : isExpanded ? (
                <div className="p-5 bg-white/90 backdrop-blur-xs rounded-2xl border border-blue-100/80 shadow-xs max-h-[600px] overflow-y-auto">
                    {renderFormattedText(rawText)}
                </div>
            ) : null}

            <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Brain Score</p>
                    <p className="text-xl font-black text-indigo-600 mt-0.5">{rawBrainScore}점</p>
                </div>
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Care Type</p>
                    <p className="text-xl font-black text-rose-600 mt-0.5">{rawCareType}</p>
                </div>
            </div>

            <div className="mt-4 text-[10px] text-slate-400 text-right">
                Analysis Source: DetailedAnalysisSection.tsx (React Component)
            </div>
        </div>
    );
};
