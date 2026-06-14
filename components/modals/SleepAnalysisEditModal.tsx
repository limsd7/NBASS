import React, { useState, useEffect } from 'react';

interface SleepAnalysisEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialText: string;
    onSave: (newText: string) => void;
}

export const SleepAnalysisEditModal: React.FC<SleepAnalysisEditModalProps> = ({ isOpen, onClose, initialText, onSave }) => {
    const [text, setText] = useState(initialText);

    useEffect(() => {
        setText(initialText);
    }, [initialText, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-3xl flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                            <span className="text-xl">✏️</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-800">수면 분석 결과 편집</h2>
                            <p className="text-sm text-slate-500 font-medium mt-0.5">상담 중 필요한 수면 분석 코멘트를 수정하세요.</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors">
                        <span className="text-xl">✖</span>
                    </button>
                </div>

                <div className="p-6 bg-slate-50 flex-1">
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="w-full h-96 p-4 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none resize-y text-slate-700 leading-relaxed font-mono"
                        placeholder="수면 분석 결과를 입력하세요. (마크다운 지원)"
                    />
                </div>

                <div className="flex justify-end gap-3 p-6 border-t border-slate-100 bg-white rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                        취소
                    </button>
                    <button
                        onClick={() => {
                            onSave(text);
                            onClose();
                        }}
                        className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-colors"
                    >
                        <span className="text-sm">💾</span>
                        <span>저장하기</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
