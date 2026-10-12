import React from 'react';
import { MathClinicController } from './useMathClinic';

interface Props {
    controller: MathClinicController;
}

/* ==================== A4 인쇄 전용 영역 (화면에서는 숨김) ==================== */
export const MathClinicPrintArea: React.FC<Props> = ({ controller }) => {
    const { isPrinting, currentDrill, student, targetGrade, getTrapLabel } = controller;

    if (!(isPrinting && currentDrill)) return null;

    return (
        <div className="hidden print:block fixed inset-0 bg-white text-black p-8 font-serif select-text z-[9999]">
            <div className="border-b-2 border-black pb-4 mb-6 flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-black">[NBASS 수능 수학 1분 AI 실전 클리닉]</h1>
                    <p className="text-xs text-gray-600 mt-1">학생명: {student.name} | 유형: {currentDrill.topicKeyword} | 목표: {targetGrade}등급 4점 준킬러</p>
                </div>
                <div className="text-xs text-gray-500 text-right">
                    출제엔진: Gemini 3.8 Flash<br />발행일자: {new Date().toLocaleDateString('ko-KR')}
                </div>
            </div>

            <div className="space-y-6">
                <div className="border border-gray-300 p-4 rounded bg-gray-50 text-sm whitespace-pre-wrap leading-relaxed font-mono">
                    {currentDrill.passage}
                </div>

                <div className="text-base font-bold">
                    Q. {currentDrill.question}
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm font-mono">
                    {currentDrill.options.map((opt, idx) => (
                        <div key={idx} className="p-2 border border-gray-200 rounded">
                            ①②③④[idx + 1] {opt}
                        </div>
                    ))}
                </div>

                {/* 세로 2단 줄맞춤 연습란 */}
                <div className="border-2 border-dashed border-gray-400 p-4 h-64 rounded">
                    <div className="grid grid-cols-2 gap-4 h-full">
                        <div className="border-r border-gray-300 pr-2">
                            <span className="text-xs text-gray-500 font-sans font-bold">[세로 1단] 조건 해석 & 도함수 분해</span>
                        </div>
                        <div className="pl-2">
                            <span className="text-xs text-gray-500 font-sans font-bold">[세로 2단] 줄맞춤 대입 연산</span>
                        </div>
                    </div>
                </div>

                <div className="border-t-2 border-gray-300 pt-4 text-xs text-gray-600 space-y-1">
                    <p><strong>[정답 및 해설]:</strong> 정답 {currentDrill.correctIndex + 1}번 (함정 유형: {getTrapLabel(currentDrill.trapType)})</p>
                    <p className="whitespace-pre-wrap">{currentDrill.strategyFeedback}</p>
                </div>
            </div>
        </div>
    );
};

export default MathClinicPrintArea;