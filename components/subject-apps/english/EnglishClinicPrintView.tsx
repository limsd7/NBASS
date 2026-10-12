import React from 'react';
import { EnglishClinicController } from './useEnglishClinic';

interface Props {
    controller: EnglishClinicController;
}

/* ==========================================
   A4 단면 인쇄 모드 렌더링
   ========================================== */
export const EnglishClinicPrintView: React.FC<Props> = ({ controller }) => {
    const { currentDrill, student, currentGrade, targetGrade } = controller;

    if (!currentDrill) return null;

    return (
        <div className="bg-white text-slate-900 p-8 max-w-4xl mx-auto print:m-0 print:p-6 font-sans">
            <div className="border-b-2 border-slate-900 pb-3 mb-6 flex justify-between items-end">
                <div>
                    <span className="text-xs font-black text-amber-700 tracking-wider">NBASS 수능 영어 AI 킬러 클리닉 시험지</span>
                    <h1 className="text-2xl font-black mt-1">수능 영어 1등급 도약 [빈칸·순서·삽입] 마이크로 실전 드릴</h1>
                </div>
                <div className="text-right text-xs text-slate-500">
                    <p>수험생: <strong>{student.name}</strong> ({currentGrade}등급 ➔ {targetGrade}등급 목표)</p>
                    <p>출제 엔진: Gemini 3.8 Flash</p>
                </div>
            </div>

            <div className="border border-slate-300 rounded-xl p-5 mb-6 bg-slate-50">
                <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-md">
                        유형: {currentDrill.topicKeyword}
                    </span>
                    <span className="text-xs text-slate-500">배점: 3점 킬러 타겟</span>
                </div>
                <div className="text-sm leading-relaxed whitespace-pre-wrap font-serif text-slate-800 mt-3 p-4 bg-white border border-slate-200 rounded-lg">
                    {currentDrill.passage}
                </div>
            </div>

            <div className="mb-6">
                <h2 className="text-base font-bold mb-4">[발문] {currentDrill.question}</h2>
                <div className="space-y-3 pl-2">
                    {currentDrill.options.map((opt, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-sm">
                            <span className="w-5 h-5 rounded-full border border-slate-400 flex items-center justify-center font-bold text-xs shrink-0">
                                {i + 1}
                            </span>
                            <span className="leading-snug">{opt}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="border-t border-slate-300 pt-4 mt-8">
                <h3 className="font-bold text-xs text-slate-700 mb-2">🧠 [정답 및 킬러 함정 간파 해설]</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-2">정답: {currentDrill.correctIndex + 1}번</p>
                <p className="text-xs text-slate-700 leading-relaxed bg-amber-50 p-3 rounded-lg border border-amber-200">
                    {currentDrill.strategyFeedback}
                </p>
            </div>
        </div>
    );
};

export default EnglishClinicPrintView;