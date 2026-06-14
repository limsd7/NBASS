import React, { useState } from 'react';
import { WorksheetData } from '../../data/resourceContents';

interface WorksheetModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: WorksheetData;
    onSave?: (responses: Record<string, string>, date: string) => void;
}

export const WorksheetModal: React.FC<WorksheetModalProps> = ({
    isOpen,
    onClose,
    data,
    onSave
}) => {
    const [responses, setResponses] = useState<Record<string, string>>({});
    const today = new Date().toISOString().split('T')[0];

    if (!isOpen) return null;

    const handleSave = () => {
        if (onSave) {
            onSave(responses, today);
        }
        alert('워크시트가 저장되었습니다!');
        onClose();
    };

    const filledCount = Object.values(responses).filter((v: string) => v.trim()).length;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-slate-200 bg-purple-50">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-lg text-purple-900">{data.title}</h3>
                            <p className="text-xs text-purple-600 mt-1">{data.description}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-600 text-xl"
                        >
                            ✕
                        </button>
                    </div>
                    <div className="mt-2 text-xs text-purple-700">
                        {filledCount}/{data.prompts.length} 항목 작성됨
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-4">
                        {data.prompts.map((prompt, index) => (
                            <div key={index} className="space-y-2">
                                <label className="block">
                                    <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold">
                                            {index + 1}
                                        </span>
                                        {prompt}
                                    </span>
                                    <textarea
                                        value={responses[`prompt_${index}`] || ''}
                                        onChange={(e) =>
                                            setResponses({
                                                ...responses,
                                                [`prompt_${index}`]: e.target.value
                                            })
                                        }
                                        placeholder="여기에 작성하세요..."
                                        className="mt-2 w-full p-3 border border-slate-200 rounded-lg text-sm resize-none focus:ring-2 ring-purple-200 outline-none"
                                        rows={3}
                                    />
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-medium"
                    >
                        취소
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={filledCount === 0}
                        className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        저장
                    </button>
                </div>
            </div>
        </div>
    );
};
