import React, { useState, useRef } from 'react';
import { AnalystConfig, AnalystsStorage, imageToBase64 } from '../../utils/analystConfig';

interface AnalystSettingsProps {
    storage: AnalystsStorage;
    onChange: (storage: AnalystsStorage) => void;
    onReset: () => void;
}

interface AnalystFormData {
    analystId: string;
    analystName: string;
    analystTitle: string;
    analystDisplayText: string;
    signatureImage?: string;
}

export const AnalystSettings: React.FC<AnalystSettingsProps> = ({ storage, onChange, onReset }) => {
    const [showModal, setShowModal] = useState(false);
    const [editingAnalyst, setEditingAnalyst] = useState<AnalystConfig | null>(null);
    const [formData, setFormData] = useState<AnalystFormData>({
        analystId: '',
        analystName: '',
        analystTitle: '',
        analystDisplayText: '',
        signatureImage: '/default_stamp.png'
    });
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleOpenAddModal = () => {
        setEditingAnalyst(null);
        setFormData({
            analystId: '',
            analystName: '',
            analystTitle: '',
            analystDisplayText: '',
            signatureImage: '/default_stamp.png'
        });
        setShowModal(true);
    };

    const handleOpenEditModal = (analyst: AnalystConfig) => {
        setEditingAnalyst(analyst);
        setFormData({
            analystId: analyst.analystId,
            analystName: analyst.analystName,
            analystTitle: analyst.analystTitle,
            analystDisplayText: analyst.analystDisplayText,
            signatureImage: analyst.signatureImage
        });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingAnalyst(null);
    };

    const handleSave = () => {
        if (!formData.analystName.trim() || !formData.analystId.trim()) {
            alert('이름과 ID는 필수 항목입니다.');
            return;
        }

        if (editingAnalyst) {
            // Update existing
            const updatedStorage: AnalystsStorage = {
                ...storage,
                analysts: storage.analysts.map(a =>
                    a.id === editingAnalyst.id
                        ? { ...a, ...formData }
                        : a
                )
            };
            onChange(updatedStorage);
        } else {
            // Add new
            const newAnalyst: AnalystConfig = {
                id: `analyst-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                ...formData
            };
            const updatedStorage: AnalystsStorage = {
                ...storage,
                analysts: [...storage.analysts, newAnalyst]
            };
            onChange(updatedStorage);
        }

        handleCloseModal();
    };

    const handleDelete = (analystId: string) => {
        if (storage.analysts.length <= 1) {
            alert('마지막 책임자는 삭제할 수 없습니다.');
            return;
        }

        const filtered = storage.analysts.filter(a => a.id !== analystId);
        const newActiveId = storage.activeAnalystId === analystId
            ? filtered[0].id
            : storage.activeAnalystId;

        onChange({
            analysts: filtered,
            activeAnalystId: newActiveId
        });

        setDeleteConfirm(null);
    };

    const handleSetActive = (analystId: string) => {
        onChange({
            ...storage,
            activeAnalystId: analystId
        });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('이미지 파일만 업로드할 수 있습니다.');
            return;
        }

        // Validate file size (2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert('파일 크기는 2MB를 초과할 수 없습니다.');
            return;
        }

        try {
            const base64 = await imageToBase64(file);
            setFormData({ ...formData, signatureImage: base64 });
        } catch (error) {
            alert('이미지 업로드에 실패했습니다.');
            console.error(error);
        }
    };

    const handleRemoveImage = () => {
        setFormData({ ...formData, signatureImage: '/default_stamp.png' });
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-slate-800 mb-1">분석 책임자 관리</h3>
                    <p className="text-xs text-slate-500">클릭하여 활성 책임자를 선택하세요</p>
                </div>
                <button
                    onClick={handleOpenAddModal}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition flex items-center gap-2"
                >
                    ➕ 책임자 추가
                </button>
            </div>

            {/* Analyst Cards */}
            <div className="space-y-2">
                {storage.analysts.map(analyst => {
                    const isActive = analyst.id === storage.activeAnalystId;
                    return (
                        <div
                            key={analyst.id}
                            onClick={() => handleSetActive(analyst.id)}
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${isActive
                                    ? 'border-blue-500 bg-blue-50 shadow-md'
                                    : 'border-slate-200 bg-white hover:border-slate-300'
                                }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        {isActive && (
                                            <span className="text-blue-600 text-lg">⭐</span>
                                        )}
                                        <h4 className="font-bold text-slate-900">{analyst.analystName}</h4>
                                        <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                                            {analyst.analystId}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600">{analyst.analystTitle}</p>
                                    <p className="text-xs text-slate-500 mt-1">표시명: {analyst.analystDisplayText}</p>
                                </div>
                                <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                                    <button
                                        onClick={() => handleOpenEditModal(analyst)}
                                        className="px-3 py-1 text-xs bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition font-bold"
                                    >
                                        ✏️ 편집
                                    </button>
                                    {storage.analysts.length > 1 && (
                                        <button
                                            onClick={() => setDeleteConfirm(analyst.id)}
                                            className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-bold"
                                        >
                                            🗑️
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm">
                        <h3 className="font-bold text-lg mb-2">삭제 확인</h3>
                        <p className="text-sm text-slate-600 mb-4">
                            이 책임자를 삭제하시겠습니까?
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold hover:bg-slate-200 transition"
                            >
                                취소
                            </button>
                            <button
                                onClick={() => handleDelete(deleteConfirm)}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition"
                            >
                                삭제
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <h3 className="font-bold text-lg mb-4">
                            {editingAnalyst ? '책임자 편집' : '새 책임자 추가'}
                        </h3>

                        <div className="space-y-4">
                            {/* Analyst ID */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    책임자 ID *
                                </label>
                                <input
                                    type="text"
                                    value={formData.analystId}
                                    onChange={e => setFormData({ ...formData, analystId: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="DR001"
                                />
                            </div>

                            {/* Name */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    이름 *
                                </label>
                                <input
                                    type="text"
                                    value={formData.analystName}
                                    onChange={e => setFormData({ ...formData, analystName: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Dr. Lim"
                                />
                            </div>

                            {/* Title */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    직위
                                </label>
                                <input
                                    type="text"
                                    value={formData.analystTitle}
                                    onChange={e => setFormData({ ...formData, analystTitle: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="분석 책임자"
                                />
                            </div>

                            {/* Display Text */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    보고서 표시명
                                </label>
                                <input
                                    type="text"
                                    value={formData.analystDisplayText}
                                    onChange={e => setFormData({ ...formData, analystDisplayText: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Dr. Lim"
                                />
                            </div>

                            {/* Signature Image */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-2">
                                    서명/도장 이미지
                                </label>
                                <div className="flex gap-3">
                                    <div className="w-24 h-24 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center bg-slate-50 overflow-hidden">
                                        {formData.signatureImage ? (
                                            <img
                                                src={formData.signatureImage}
                                                alt="Signature"
                                                className="max-w-full max-h-full object-contain"
                                            />
                                        ) : (
                                            <span className="text-slate-400 text-xs">미리보기</span>
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-bold"
                                            >
                                                📁 업로드
                                            </button>
                                            {formData.signatureImage && formData.signatureImage !== '/default_stamp.png' && (
                                                <button
                                                    onClick={handleRemoveImage}
                                                    className="px-3 py-1.5 text-xs bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition font-bold"
                                                >
                                                    🗑️ 기본 사용
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-slate-400">
                                            PNG, JPG 파일 (최대 2MB)
                                        </p>
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-2 mt-6">
                            <button
                                onClick={handleCloseModal}
                                className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold hover:bg-slate-200 transition"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition"
                            >
                                저장
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reset Button */}
            <button
                onClick={onReset}
                className="w-full px-4 py-2 bg-slate-100 text-slate-600 rounded-lg font-bold text-sm hover:bg-slate-200 transition"
            >
                🔄 기본값으로 초기화
            </button>
        </div>
    );
};
