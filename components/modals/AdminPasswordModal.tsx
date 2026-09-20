import React, { memo, useEffect, useRef } from 'react';

interface AdminPasswordModalProps {
    isOpen: boolean;
    password: string;
    onPasswordChange: (value: string) => void;
    onConfirm: () => void;
    onCancel: () => void;
}

export const AdminPasswordModal: React.FC<AdminPasswordModalProps> = memo(({
    isOpen,
    password,
    onPasswordChange,
    onConfirm,
    onCancel
}) => {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-xs">
                <h3 className="font-bold text-lg mb-4 text-slate-800">Admin Access Required</h3>
                <input
                    ref={inputRef}
                    type="password"
                    autoComplete="new-password"
                    className="w-full p-3 border rounded-xl mb-4 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Enter Password"
                    value={password}
                    onChange={e => onPasswordChange(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && onConfirm()}
                />
                <div className="flex justify-end gap-2">
                    <button onClick={onCancel} className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-lg">Cancel</button>
                    <button onClick={onConfirm} className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700">Confirm</button>
                </div>
            </div>
        </div>
    );
});

AdminPasswordModal.displayName = 'AdminPasswordModal';
