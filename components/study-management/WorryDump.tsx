import React, { useState } from 'react';

export const WorryDump = () => {
    const [text, setText] = useState('');
    const [isDestroying, setIsDestroying] = useState(false);
    const [isCleared, setIsCleared] = useState(false);

    const handleDestroy = () => {
        if (!text.trim()) return;
        setIsDestroying(true);
        setTimeout(() => {
            setIsCleared(true);
            setText('');
            setIsDestroying(false);
        }, 1500); // Animation duration
    };

    const handleReset = () => {
        setIsCleared(false);
    };

    if (isCleared) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-10 animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-5xl mb-6 shadow-lg shadow-emerald-200">
                    ✨
                </div>
                <h3 className="text-3xl font-black text-slate-800 mb-3">Mental Space Cleared!</h3>
                <p className="text-slate-500 mb-8 max-w-md">
                    머릿속 잡념을 비워냈습니다. 확보된 작업 기억(Working Memory) 용량을 이제 공부에 온전히 쏟으세요.
                </p>
                <button
                    onClick={handleReset}
                    className="px-8 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-colors shadow-lg"
                >
                    다시 쓰기
                </button>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col p-8 bg-[#fdfbf7]">
            <div className="mb-6">
                <h3 className="text-2xl font-black text-slate-800 mb-2">Emotional Dump</h3>
                <p className="text-slate-500">
                    지금 머릿속을 맴도는 걱정, 할 일, 잡념을 모두 적어보세요. 다 적은 후엔 과감히 버리세요.
                </p>
            </div>

            <div className={`flex-1 relative transition-all duration-1000 ${isDestroying ? 'scale-0 opacity-0 rotate-12 translate-y-20 filter blur-sm' : 'scale-100 opacity-100'}`}>
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="예: 이번 수학 시험 망칠 것 같아 불안해, 집에 가서 빨래해야 하는데... (자유롭게 작성)"
                    className="w-full h-full p-6 bg-white border border-stone-200 rounded-xl shadow-sm resize-none focus:outline-none focus:ring-2 focus:ring-stone-300 text-slate-700 leading-relaxed font-serif text-lg placeholder:text-stone-300"
                    spellCheck={false}
                />

                {/* Paper Texture Overlay (Optional aesthetic) */}
                <div className="absolute top-0 right-0 p-4 pointer-events-none opacity-20">
                    📝
                </div>
            </div>

            <div className="mt-6 flex justify-end">
                <button
                    onClick={handleDestroy}
                    disabled={!text.trim() || isDestroying}
                    className={`px-8 py-4 rounded-xl font-bold text-white shadow-xl transition-all flex items-center gap-2
                        ${!text.trim()
                            ? 'bg-stone-300 cursor-not-allowed'
                            : 'bg-rose-500 hover:bg-rose-600 hover:scale-105 active:scale-95 shadow-rose-200'}`}
                >
                    {isDestroying ? '🔥 태우는 중...' : '🗑️ 휴지통으로 버리기'}
                </button>
            </div>
        </div>
    );
};
