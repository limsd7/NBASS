import React, { useState } from 'react';
import { HRVData, StudentInfo } from '../types';
import { OCRCorrectionModal } from './modals/OCRCorrectionModal';

interface OCRImportButtonProps {
    onImportComplete: (hrvData: Partial<HRVData>, studentInfo: Partial<StudentInfo>) => void;
}

export const OCRImportButton: React.FC<OCRImportButtonProps> = ({ onImportComplete }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="flex flex-col items-center">
            <button
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-3 font-bold rounded-full text-sm transition-colors flex items-center gap-2 shadow-sm bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
            >
                <span>📥</span> 
                BrainBody 결과지 OCR 자동 입력 (PDF/이미지)
            </button>
            <OCRCorrectionModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSave={onImportComplete} 
            />
        </div>
    );
};
