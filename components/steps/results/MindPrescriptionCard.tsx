import React from 'react';
import { AssessmentResult, CareType } from '../../../types';
import { MENTAL_PRESCRIPTIONS } from '../../../data/prescriptions';

interface MindPrescriptionCardProps {
    result: AssessmentResult;
}

export const MindPrescriptionCard: React.FC<MindPrescriptionCardProps> = ({ result }) => {
    const handleOpenZenMode = () => {
        const prescription = MENTAL_PRESCRIPTIONS[result.careType];
        const prescriptionData = encodeURIComponent(JSON.stringify(prescription));
        window.open(`prescription-guide.html?data=${prescriptionData}`, '_blank', 'width=1400,height=900');
    };

    return (
        <div className="mt-8 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 rounded-2xl border border-indigo-100 p-6 no-print transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm border border-indigo-50">
                        🗝️
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-slate-800">오늘의 마음 처방전</h4>
                        <p className="text-xs text-slate-500">당신의 마음을 위한 특별한 위로와 솔루션</p>
                    </div>
                </div>
                <button
                    onClick={handleOpenZenMode}
                    className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 transition-all flex items-center gap-2"
                >
                    <span>🧘‍♀️ Zen 모드로 열기</span>
                </button>
            </div>
        </div>
    );
};
