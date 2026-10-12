import React from 'react';
import { KoreanClinicController } from './useKoreanClinic';

interface Props {
    controller: KoreanClinicController;
}

/* ==================== 인쇄 전용 숨김 영역 (A4 시험지 워크시트) ==================== */
export const KoreanClinicPrintSheet: React.FC<Props> = ({ controller }) => {
    const { student, targetGrade, bankList, getTrapLabel } = controller;

    return (
        <div id="korean-a4-print-sheet" className="hidden print:block fixed inset-0 bg-white text-black p-8 font-serif">
            <div className="border-b-2 border-black pb-4 mb-6 flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-black tracking-tight">[수능 국어] 1등급 도약 약점 클리닉 워크시트</h1>
                    <p className="text-xs text-gray-600 mt-1">학생명: {student.name} | 목표: {targetGrade}등급 | 출제: NBASS Korean AI Studio</p>
                </div>
                <div className="text-right text-xs">
                    <span>시험일자: {new Date().toLocaleDateString('ko-KR')}</span>
                </div>
            </div>

            <div className="space-y-8">
                {bankList.slice(0, 3).map((q, idx) => (
                    <div key={q.id} className="page-break-inside-avoid border-b border-gray-300 pb-6">
                        <div className="text-xs font-bold text-gray-500 mb-1">
                            [문항 {idx + 1}] {q.strategyTag} ({getTrapLabel(q.trapType)})
                        </div>
                        <div className="bg-gray-50 p-4 border border-gray-300 text-xs leading-relaxed mb-3 whitespace-pre-line">
                            {q.passage}
                        </div>
                        <h4 className="font-bold text-sm mb-2">{q.question}</h4>
                        <div className="space-y-1 text-xs">
                            {q.options.map((opt, oIdx) => (
                                <div key={oIdx} className="flex gap-2">
                                    <span>{'①②③④⑤'[oIdx] || `(${oIdx + 1})`}</span>
                                    <span>{opt}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default KoreanClinicPrintSheet;