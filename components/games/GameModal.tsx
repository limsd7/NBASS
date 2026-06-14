import React, { useState } from 'react';
import { DualNBack } from './DualNBack';
import { DigitSpan } from './DigitSpan';
import { StroopTest } from './StroopTest';

interface GameModalProps {
    isOpen: boolean;
    onClose: () => void;
    gameType: 'DUAL_N_BACK' | 'DIGIT_SPAN' | 'STROOP' | null;
}

export const GameModal: React.FC<GameModalProps> = ({ isOpen, onClose, gameType }) => {
    if (!isOpen || !gameType) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <span className="text-xl">🎮</span> 
                        {gameType === 'DUAL_N_BACK' ? '듀얼 N-Back 훈련' : 
                         gameType === 'DIGIT_SPAN' ? '숫자 기억력(Digit Span) 훈련' : 
                         '스트룹(Stroop) 인지 유연성 훈련'}
                    </h3>
                    <button 
                        onClick={onClose}
                        className="text-slate-400 hover:text-rose-500 transition-colors p-2 rounded-full hover:bg-rose-50"
                    >
                        ✕
                    </button>
                </div>
                
                <div className="p-8 flex-1 overflow-y-auto bg-slate-900">
                    {gameType === 'DUAL_N_BACK' && <DualNBack />}
                    {gameType === 'DIGIT_SPAN' && <DigitSpan />}
                    {gameType === 'STROOP' && <StroopTest />}
                </div>
            </div>
        </div>
    );
};
