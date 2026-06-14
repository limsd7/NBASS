import React, { useState, useEffect } from 'react';
import DatabaseService, { type ConsultationHistory } from '../../services/database';
import { CareType, type AssessmentResult } from '../../types';

interface ConsultationHistoryModalProps {
    isOpen: boolean;
    studentId?: string;
    onClose: () => void;
    currentAssessment?: AssessmentResult;
}

export const ConsultationHistoryModal: React.FC<ConsultationHistoryModalProps> = ({
    isOpen,
    studentId,
    onClose
}) => {
    const [consultations, setConsultations] = useState<ConsultationHistory[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedConsultation, setSelectedConsultation] = useState<ConsultationHistory | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (isOpen) {
            loadConsultations();
        }
    }, [isOpen, studentId]);

    const loadConsultations = async () => {
        setLoading(true);
        try {
            if (studentId) {
                const results = await DatabaseService.getConsultationsByStudent(studentId);
                setConsultations(results);
            } else {
                const results = await DatabaseService.getRecentConsultations(50);
                setConsultations(results);
            }
        } catch (error) {
            console.error('Failed to load consultations:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredConsultations = consultations.filter(c =>
        c.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.notes.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white p-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold">📋 상담 이력</h2>
                        <button
                            onClick={onClose}
                            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Search */}
                    <div className="mt-4">
                        <input
                            type="text"
                            placeholder="학생 이름 또는 메모 검색..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg text-gray-800 placeholder-gray-400"
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[70vh]">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600">로딩 중...</p>
                        </div>
                    ) : filteredConsultations.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">상담 이력이 없습니다.</p>
                        </div>
                    ) : selectedConsultation ? (
                        /* Detail View */
                        <div>
                            <button
                                onClick={() => setSelectedConsultation(null)}
                                className="mb-4 text-violet-600 hover:text-violet-700 font-semibold"
                            >
                                ← 목록으로
                            </button>

                            <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                                        {selectedConsultation.studentName}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {new Date(selectedConsultation.date).toLocaleString('ko-KR')}
                                    </p>
                                </div>

                                <div>
                                    <h4 className="font-semibold text-gray-700 mb-2">사용된 예측 규칙</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedConsultation.usedRules.map((rule, i) => (
                                            <span key={i} className="px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-sm">
                                                {rule}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-semibold text-gray-700 mb-2">상담 스크립트</h4>
                                    <div className="bg-white p-4 rounded-lg space-y-2">
                                        {selectedConsultation.usedScripts.map((script, i) => (
                                            <p key={i} className="text-sm text-gray-700 border-l-4 border-violet-300 pl-3">
                                                {script}
                                            </p>
                                        ))}
                                    </div>
                                </div>

                                {selectedConsultation.notes && (
                                    <div>
                                        <h4 className="font-semibold text-gray-700 mb-2">관리자 메모</h4>
                                        <p className="text-sm text-gray-700 bg-yellow-50 p-4 rounded-lg">
                                            {selectedConsultation.notes}
                                        </p>
                                    </div>
                                )}

                                {selectedConsultation.studentResponse && (
                                    <div>
                                        <h4 className="font-semibold text-gray-700 mb-2">학생 반응</h4>
                                        <p className="text-sm text-gray-700 bg-blue-50 p-4 rounded-lg">
                                            {selectedConsultation.studentResponse}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        /* List View */
                        <div className="space-y-3">
                            {filteredConsultations.map((consultation) => (
                                <div
                                    key={consultation.id}
                                    onClick={() => setSelectedConsultation(consultation)}
                                    className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-violet-400 cursor-pointer transition"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-800">{consultation.studentName}</h4>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {new Date(consultation.date).toLocaleString('ko-KR')}
                                            </p>
                                            {consultation.notes && (
                                                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                                    {consultation.notes}
                                                </p>
                                            )}
                                        </div>
                                        <div className="ml-4">
                                            <span className="inline-block px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-xs">
                                                {consultation.usedRules.length}개 규칙
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ConsultationHistoryModal;
