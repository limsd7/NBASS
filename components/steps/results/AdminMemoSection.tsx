import React, { useState } from 'react';
import { PromptModal } from '../../modals/PromptModal';

interface AdminMemoSectionProps {
    adminMemo: string;
    setAdminMemo: React.Dispatch<React.SetStateAction<string>>;
    adminMemos: string[];
    setAdminMemos: React.Dispatch<React.SetStateAction<string[]>>;
}

export const AdminMemoSection: React.FC<AdminMemoSectionProps> = ({
    adminMemo,
    setAdminMemo,
    adminMemos,
    setAdminMemos
}) => {
    const [showMemoPrompt, setShowMemoPrompt] = useState(false);

    return (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm print-avoid-break mt-6 max-w-4xl mx-auto">
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span>📝</span> 종합 소견 (Consultant's Comment)
            </h3>

            {/* 프리셋 버튼 (화면 출력 시 숨김) */}
            <div className="flex flex-wrap gap-2 mb-4 print:hidden">
                {adminMemos.map((memo, idx) => (
                    <button
                        key={idx}
                        onClick={() => setAdminMemo(prev => prev ? prev + '\n' + memo : memo)}
                        className="px-3 py-2 bg-slate-50 text-slate-600 text-xs font-bold rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors text-left"
                    >
                        {memo.length > 20 ? memo.substring(0, 20) + '...' : memo}
                    </button>
                ))}
                <button
                    onClick={() => setShowMemoPrompt(true)}
                    className="px-3 py-2 border border-dashed border-slate-300 text-slate-400 text-xs font-bold rounded-lg hover:border-slate-500 transition-colors"
                >
                    + 추가
                </button>
            </div>

            <textarea
                className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-sm leading-relaxed"
                placeholder="종합적인 상담 소견을 입력하세요..."
                value={adminMemo}
                onChange={e => setAdminMemo(e.target.value)}
            />

            <PromptModal
                isOpen={showMemoPrompt}
                title="새로운 상용구를 입력하세요"
                placeholder="상용구 내용..."
                onConfirm={(newMemo) => {
                    if (newMemo) setAdminMemos([...adminMemos, newMemo]);
                    setShowMemoPrompt(false);
                }}
                onCancel={() => setShowMemoPrompt(false)}
            />
        </div>
    );
};
