import React, { useState } from 'react';
import { SelfCheckData } from '../../data/resourceContents';
import DatabaseService from '../../services/unifiedSyncService';

interface SelfCheckModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: SelfCheckData;
    studentId?: string;
    careType?: string;
    onSave?: (score: number, answers: Record<string, boolean>) => void;
}

export const SelfCheckModal: React.FC<SelfCheckModalProps> = ({
    isOpen,
    onClose,
    data,
    studentId,
    careType,
    onSave
}) => {
    const [answers, setAnswers] = useState<Record<string, boolean>>({});
    const [showResult, setShowResult] = useState(false);

    if (!isOpen) return null;

    const score = Object.values(answers).filter(Boolean).length;
    const result = data.scoring.ranges.find(r => score >= r.min && score <= r.max);

    const handleSubmit = async () => {
        setShowResult(true);

        // Save to database if studentId is provided
        if (studentId && careType) {
            try {
                await DatabaseService.addSelfCheckResult({
                    studentId,
                    careType,
                    date: new Date().toISOString().split('T')[0],
                    score,
                    answers,
                    createdAt: new Date().toISOString()
                });
            } catch (error) {
                console.error('Failed to save self-check result:', error);
            }
        }

        if (onSave) {
            onSave(score, answers);
        }
    };

    const handleReset = () => {
        setAnswers({});
        setShowResult(false);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-slate-200 bg-blue-50">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-lg text-blue-900">{data.title}</h3>
                            <p className="text-xs text-blue-600 mt-1">{data.description}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-600 text-xl"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {!showResult ? (
                        <div className="space-y-3">
                            {data.questions.map((q) => (
                                <label
                                    key={q.id}
                                    className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition ${answers[q.id]
                                        ? 'bg-blue-50 border-blue-300'
                                        : 'bg-white border-slate-200 hover:border-slate-300'
                                        }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={answers[q.id] || false}
                                        onChange={(e) =>
                                            setAnswers({ ...answers, [q.id]: e.target.checked })
                                        }
                                        className="mt-1 w-5 h-5 accent-blue-600"
                                    />
                                    <div className="flex-1">
                                        <p className="text-sm text-slate-800">{q.text}</p>
                                        {q.category && (
                                            <span className="text-xs text-slate-500 mt-1">
                                                {q.category}
                                            </span>
                                        )}
                                    </div>
                                </label>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center space-y-6">
                            <div className="text-6xl mb-4">
                                {result?.color === 'green' && '✅'}
                                {result?.color === 'yellow' && '⚠️'}
                                {result?.color === 'orange' && '🔶'}
                                {result?.color === 'red' && '🔴'}
                            </div>
                            <div>
                                <h4 className="font-bold text-2xl text-slate-800 mb-2">
                                    점수: {score}/{data.questions.length}
                                </h4>
                                <div
                                    className={`inline-block px-6 py-2 rounded-full font-bold text-lg ${result?.color === 'green'
                                        ? 'bg-green-100 text-green-800'
                                        : result?.color === 'yellow'
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : result?.color === 'orange'
                                                ? 'bg-orange-100 text-orange-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}
                                >
                                    {result?.level}
                                </div>
                            </div>
                            <p className="text-slate-700 text-lg">{result?.description}</p>
                            <div className="bg-slate-50 p-4 rounded-xl text-left">
                                <p className="font-bold text-sm text-slate-700 mb-2">체크된 항목:</p>
                                <ul className="text-xs text-slate-600 space-y-1">
                                    {data.questions
                                        .filter((q) => answers[q.id])
                                        .map((q) => (
                                            <li key={q.id}>• {q.text}</li>
                                        ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-2">
                    {!showResult ? (
                        <>
                            <button
                                onClick={onClose}
                                className="px-6 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-medium"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                            >
                                결과 확인
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={handleReset}
                                className="px-6 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-medium"
                            >
                                다시 하기
                            </button>
                            <button
                                onClick={onClose}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                            >
                                닫기
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
