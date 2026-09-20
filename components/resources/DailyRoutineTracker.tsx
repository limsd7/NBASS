import React, { useState, useEffect } from 'react';
import { DailyRoutineData } from '../../data/resourceContents';
import DatabaseService from '../../services/unifiedSyncService';
import { RoutineCalendarModal } from '../modals/RoutineCalendarModal';

interface DailyRoutineTrackerProps {
    isOpen: boolean;
    onClose: () => void;
    data: DailyRoutineData;
    studentId?: string;
    careType?: string;
    onSave?: (completedIds: string[], date: string) => void;
}

export const DailyRoutineTracker: React.FC<DailyRoutineTrackerProps> = ({
    isOpen,
    onClose,
    data,
    studentId,
    careType,
    onSave
}) => {
    const [completed, setCompleted] = useState<Set<string>>(new Set());
    const [showCalendar, setShowCalendar] = useState(false);
    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        // Load today's progress from localStorage
        const saved = localStorage.getItem(`routine_${today}`);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    setCompleted(new Set(parsed as string[]));
                }
            } catch (e) {
                console.error("Failed to parse saved routines", e);
            }
        }
    }, [today]);

    if (!isOpen) return null;

    const toggleComplete = async (id: string) => {
        const newCompleted = new Set(completed);
        if (newCompleted.has(id)) {
            newCompleted.delete(id);
        } else {
            newCompleted.add(id);
        }
        setCompleted(newCompleted);

        // Save to localStorage
        localStorage.setItem(`routine_${today}`, JSON.stringify(Array.from(newCompleted)));

        // Save to database if studentId is provided
        if (studentId && careType) {
            const completionRate = Math.round((newCompleted.size / data.routines.length) * 100);
            try {
                await DatabaseService.addRoutineTracking({
                    studentId,
                    careType,
                    date: today,
                    completedIds: Array.from(newCompleted) as string[],
                    completionRate,
                    createdAt: new Date().toISOString()
                });
            } catch (error) {
                console.error('Failed to save routine tracking:', error);
            }
        }

        // Callback
        if (onSave) {
            onSave(Array.from(newCompleted) as string[], today);
        }
    };

    const completionRate = Math.round((completed.size / data.routines.length) * 100);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-slate-200 bg-emerald-50">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-lg text-emerald-900">{data.title}</h3>
                            <p className="text-xs text-emerald-600 mt-1">{data.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowCalendar(true)}
                                className="px-3 py-1.5 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-700 transition flex items-center gap-1"
                            >
                                📅 캘린더
                            </button>
                            <button
                                onClick={onClose}
                                className="text-slate-400 hover:text-slate-600 text-xl"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                    <div className="mt-3">
                        <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-emerald-700 font-medium">오늘의 진행률</span>
                            <span className="text-emerald-900 font-bold">{completionRate}%</span>
                        </div>
                        <div className="w-full bg-emerald-200 rounded-full h-2">
                            <div
                                className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${completionRate}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-3">
                        {data.routines.map((routine) => (
                            <div
                                key={routine.id}
                                className={`p-4 rounded-lg border-2 transition ${completed.has(routine.id)
                                    ? 'bg-emerald-50 border-emerald-300'
                                    : 'bg-white border-slate-200'
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <button
                                        onClick={() => toggleComplete(routine.id)}
                                        className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${completed.has(routine.id)
                                            ? 'bg-emerald-600 border-emerald-600'
                                            : 'border-slate-300 hover:border-emerald-400'
                                            }`}
                                    >
                                        {completed.has(routine.id) && (
                                            <span className="text-white text-sm">✓</span>
                                        )}
                                    </button>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                                                {routine.time}
                                            </span>
                                            {routine.duration && (
                                                <span className="text-xs text-slate-500">
                                                    {routine.duration}
                                                </span>
                                            )}
                                        </div>
                                        <h4
                                            className={`font-bold text-sm mb-1 ${completed.has(routine.id)
                                                ? 'text-emerald-900 line-through'
                                                : 'text-slate-800'
                                                }`}
                                        >
                                            {routine.title}
                                        </h4>
                                        <p className="text-xs text-slate-600">{routine.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-200 bg-slate-50">
                    {completionRate === 100 && (
                        <div className="bg-emerald-100 text-emerald-900 p-3 rounded-lg mb-3 text-center font-bold">
                            🎉 오늘의 루틴을 모두 완료했습니다!
                        </div>
                    )}
                    <button
                        onClick={onClose}
                        className="w-full py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700"
                    >
                        닫기
                    </button>
                </div>
            </div>

            {/* Calendar Modal */}
            <RoutineCalendarModal
                isOpen={showCalendar}
                studentId={studentId}
                careType={careType}
                onClose={() => setShowCalendar(false)}
            />
        </div>
    );
};
