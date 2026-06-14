import React, { useState, useEffect } from 'react';
import DatabaseService, { type RoutineTracking } from '../../services/database';

interface RoutineCalendarModalProps {
    isOpen: boolean;
    studentId?: string;
    careType?: string;
    onClose: () => void;
}

export const RoutineCalendarModal: React.FC<RoutineCalendarModalProps> = ({
    isOpen,
    studentId,
    careType,
    onClose
}) => {
    const [trackingData, setTrackingData] = useState<RoutineTracking[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    useEffect(() => {
        if (isOpen && studentId) {
            loadTrackingData();
        }
    }, [isOpen, studentId, careType]);

    const loadTrackingData = async () => {
        if (!studentId) return;

        setLoading(true);
        try {
            const data = await DatabaseService.getRoutineByStudent(studentId, careType);
            setTrackingData(data);
        } catch (error) {
            console.error('Failed to load routine tracking:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    // Calendar helpers
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const getCompletionForDate = (day: number): RoutineTracking | undefined => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return trackingData.find(t => t.date === dateStr);
    };

    const getColorByRate = (rate: number) => {
        if (rate >= 100) return 'bg-green-500 text-white';
        if (rate >= 80) return 'bg-green-400 text-white';
        if (rate >= 60) return 'bg-yellow-400 text-gray-800';
        if (rate >= 40) return 'bg-yellow-300 text-gray-700';
        if (rate > 0) return 'bg-gray-300 text-gray-600';
        return 'bg-gray-100 text-gray-400';
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold">📅 루틴 추적 캘린더</h2>
                            <p className="text-sm text-emerald-100 mt-1">월간 루틴 달성률을 확인하세요</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Month Navigator */}
                    <div className="flex items-center justify-between mt-4">
                        <button
                            onClick={() => setCurrentMonth(new Date(year, month - 1))}
                            className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition"
                        >
                            ← 이전
                        </button>
                        <span className="text-xl font-bold">
                            {year}년 {month + 1}월
                        </span>
                        <button
                            onClick={() => setCurrentMonth(new Date(year, month + 1))}
                            className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition"
                        >
                            다음 →
                        </button>
                    </div>
                </div>

                {/* Calendar Content */}
                <div className="p-6">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600">로딩 중...</p>
                        </div>
                    ) : (
                        <>
                            {/* Calendar Grid */}
                            <div className="grid grid-cols-7 gap-2">
                                {/* Weekday Headers */}
                                {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
                                    <div key={day} className="text-center font-bold text-gray-600 text-sm pb-2">
                                        {day}
                                    </div>
                                ))}

                                {/* Empty cells for first week */}
                                {Array(firstDay).fill(0).map((_, i) => (
                                    <div key={`empty-${i}`} className="aspect-square"></div>
                                ))}

                                {/* Day cells */}
                                {Array(daysInMonth).fill(0).map((_, i) => {
                                    const day = i + 1;
                                    const completion = getCompletionForDate(day);
                                    const rate = completion?.completionRate || 0;

                                    return (
                                        <div
                                            key={day}
                                            className={`aspect-square rounded-lg flex flex-col items-center justify-center cursor-pointer transition-transform hover:scale-110 ${completion ? getColorByRate(rate) : 'bg-gray-50 hover:bg-gray-100'
                                                }`}
                                            title={completion ? `${rate.toFixed(0)}% 완료` : '기록 없음'}
                                        >
                                            <span className="text-lg font-bold">{day}</span>
                                            {completion && (
                                                <span className="text-[10px] font-semibold">
                                                    {rate.toFixed(0)}%
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Legend */}
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <h3 className="text-sm font-bold text-gray-700 mb-3">달성률 범례</h3>
                                <div className="flex flex-wrap gap-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded bg-green-500"></div>
                                        <span className="text-xs text-gray-600">100%</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded bg-green-400"></div>
                                        <span className="text-xs text-gray-600">80-99%</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded bg-yellow-400"></div>
                                        <span className="text-xs text-gray-600">60-79%</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded bg-yellow-300"></div>
                                        <span className="text-xs text-gray-600">40-59%</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded bg-gray-300"></div>
                                        <span className="text-xs text-gray-600">1-39%</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded bg-gray-100 border border-gray-200"></div>
                                        <span className="text-xs text-gray-600">기록 없음</span>
                                    </div>
                                </div>
                            </div>

                            {/* Stats */}
                            {trackingData.length > 0 && (
                                <div className="mt-6 grid grid-cols-3 gap-4">
                                    <div className="bg-emerald-50 rounded-lg p-4 text-center">
                                        <p className="text-2xl font-bold text-emerald-600">{trackingData.length}일</p>
                                        <p className="text-xs text-emerald-700 mt-1">총 기록일</p>
                                    </div>
                                    <div className="bg-green-50 rounded-lg p-4 text-center">
                                        <p className="text-2xl font-bold text-green-600">
                                            {trackingData.filter(t => t.completionRate === 100).length}일
                                        </p>
                                        <p className="text-xs text-green-700 mt-1">완벽한 날</p>
                                    </div>
                                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                                        <p className="text-2xl font-bold text-blue-600">
                                            {(trackingData.reduce((sum, t) => sum + t.completionRate, 0) / trackingData.length).toFixed(0)}%
                                        </p>
                                        <p className="text-xs text-blue-700 mt-1">평균 달성률</p>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RoutineCalendarModal;
