import React from 'react';
import { AssessmentResult } from '../../types';
import { generateConsultationLetter } from '../../utils/consultationUtils';

interface AppConsultationLetterModalProps {
    show: boolean;
    result: AssessmentResult | null;
    onClose: () => void;
}

export const AppConsultationLetterModal: React.FC<AppConsultationLetterModalProps> = ({
    show,
    result,
    onClose,
}) => {
    if (!show || !result) return null;
    const letter = generateConsultationLetter(result);
    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-indigo-950/40 backdrop-blur-md p-4 animate-in zoom-in duration-300">
            <div className="bg-white w-full max-w-xl rounded-[40px] shadow-[0_50px_100px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col max-h-[90vh]">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-8 text-white relative">
                    <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors">✕</button>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-70 mb-2">Automated Report Generator</p>
                    <h3 className="text-3xl font-black">학부모 발송용 상담 레터</h3>
                </div>
                <div className="p-10 flex-1 overflow-y-auto">
                    <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 font-medium text-slate-700 leading-relaxed whitespace-pre-wrap selection:bg-emerald-100">
                        {letter}
                    </div>
                </div>
                <div className="p-8 pt-0 flex gap-4">
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(letter);
                            alert('텍스트가 복사되었습니다. 카카오톡이나 메시지에 붙여넣으세요.');
                        }}
                        className="flex-1 py-5 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 active:scale-95 flex items-center justify-center gap-2"
                    >
                        요약문 복사하기
                    </button>
                    <button onClick={onClose} className="px-8 py-5 border-2 border-slate-200 text-slate-500 font-bold rounded-2xl hover:bg-slate-50 transition-colors">닫기</button>
                </div>
            </div>
        </div>
    );
};
