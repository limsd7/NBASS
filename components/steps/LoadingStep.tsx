import React, { memo } from 'react';

interface LoadingStepProps { }

export const LoadingStep: React.FC<LoadingStepProps> = memo(() => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-6"></div>
            <h2 className="text-2xl font-bold text-slate-800">종합 데이터 분석 중...</h2>
            <p className="text-slate-500 mt-2">유형 식별 및 맞춤 솔루션을 생성하고 있습니다.</p>
        </div>
    );
});

LoadingStep.displayName = 'LoadingStep';
