import React, { useState, useEffect, useRef } from 'react';

interface PromptModalProps {
    isOpen: boolean;
    title: string;
    placeholder?: string;
    onConfirm: (value: string) => void;
    onCancel: () => void;
    isPassword?: boolean;
}

export const PromptModal: React.FC<PromptModalProps> = ({
    isOpen, title, placeholder, onConfirm, onCancel, isPassword = false
}) => {
    const [value, setValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setValue('');
            // Use setTimeout to ensure the modal is fully rendered before focusing
            // This fixes the issue in Electron where autoFocus sometimes fails
            const timer = setTimeout(() => {
                inputRef.current?.focus();
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onMouseDown={(e) => e.stopPropagation()} // Prevent focus loss to underlying elements
            onClick={(e) => e.stopPropagation()}
        >
            <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm">
                <h3 className="font-bold text-lg mb-4 text-slate-800">{title}</h3>
                <input
                    ref={inputRef}
                    type={isPassword ? "password" : "text"}
                    className="w-full p-3 border rounded-xl mb-4 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder={placeholder || ""}
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    autoFocus
                    onKeyDown={e => {
                        if (e.key === 'Enter') onConfirm(value);
                        if (e.key === 'Escape') onCancel();
                    }}
                />
                <div className="flex justify-end gap-2">
                    <button onClick={onCancel} className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-lg">취소</button>
                    <button onClick={() => onConfirm(value)} className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700">확인</button>
                </div>
            </div>
        </div>
    );
};
