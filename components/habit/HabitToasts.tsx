import React, { useCallback, useRef, useState } from 'react';

export interface HabitToast {
    id: number;
    text: string;
}

/** alert() 대체용 인라인 토스트 (블로킹 없음, 3.5초 후 자동 해제) */
export function useHabitToasts() {
    const [toasts, setToasts] = useState<HabitToast[]>([]);
    const idRef = useRef(0);
    const pushToast = useCallback((text: string) => {
        idRef.current += 1;
        const id = idRef.current;
        setToasts(prev => [...prev.slice(-2), { id, text }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3500);
    }, []);
    const dismissToast = useCallback((id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);
    return { toasts, pushToast, dismissToast };
}

export const HabitToastStack: React.FC<{ toasts: HabitToast[]; onDismiss: (id: number) => void }> = ({
    toasts,
    onDismiss,
}) => {
    if (toasts.length === 0) return null;
    return (
        <div className="print:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-[70] flex flex-col items-center gap-2 w-[min(92vw,28rem)] pointer-events-none">
            {toasts.map(t => (
                <button
                    key={t.id}
                    type="button"
                    onClick={() => onDismiss(t.id)}
                    className="pointer-events-auto w-full px-4 py-2.5 bg-slate-900/95 text-white text-xs font-bold rounded-2xl shadow-xl border border-white/10 text-center leading-relaxed animate-in fade-in slide-in-from-bottom-2 duration-200 cursor-pointer"
                >
                    {t.text}
                </button>
            ))}
        </div>
    );
};
