import React from 'react';
import { AssessmentResult, StrategyMap } from '../../../types';

interface ExamStrategySectionProps {
    result: AssessmentResult;
    strategies: StrategyMap;
    config: {
        isExamMode: boolean;
    };
}

export const ExamStrategySection: React.FC<ExamStrategySectionProps> = ({
    result,
    strategies,
    config
}) => {
    if (!config.isExamMode || !result.careType || !strategies[result.careType]) {
        return null;
    }

    const strategy = strategies[result.careType];

    return (
        <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden mt-8 print-avoid-break">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-[100px] opacity-20 transform translate-x-1/2 -translate-y-1/2 no-print"></div>
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-1.5 h-6 bg-blue-400 rounded-full"></div>
                    <div>
                        <h3 className="text-xl font-bold">Personalized Exam Strategy</h3>
                        <p className="text-slate-400 text-sm">Type-Based Optimization : {result.careType}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 1. Nutrition */}
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/15 transition-colors print-avoid-break">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-2xl">💊</span>
                            <h4 className="font-bold text-blue-300">Nutrition Routine</h4>
                        </div>
                        <p className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">{strategy.nutritionGuide}</p>
                    </div>

                    {/* 2. Study */}
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/15 transition-colors print-avoid-break">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-2xl">⏱</span>
                            <h4 className="font-bold text-indigo-300">Study Strategy</h4>
                        </div>
                        <p className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">{strategy.studyStrategy}</p>
                    </div>

                    {/* 3. Exercise */}
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/15 transition-colors print-avoid-break">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-2xl">🧘</span>
                            <h4 className="font-bold text-emerald-300">Exercise Guide</h4>
                        </div>
                        <p className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">{strategy.exerciseGuide}</p>
                    </div>

                    {/* 4. Ritual */}
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/15 transition-colors print-avoid-break">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-2xl">🧠</span>
                            <h4 className="font-bold text-amber-300">Pre-Study Ritual</h4>
                        </div>
                        <p className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">{strategy.preStudyRoutine}</p>
                    </div>

                    {/* 5. Recovery */}
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/15 transition-colors print-avoid-break">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-2xl">💤</span>
                            <h4 className="font-bold text-purple-300">Recovery Guide</h4>
                        </div>
                        <p className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">{strategy.recoveryGuide}</p>
                    </div>

                    {/* 6. Lifestyle */}
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/15 transition-colors print-avoid-break">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-2xl">📱</span>
                            <h4 className="font-bold text-rose-300">Lifestyle Guide</h4>
                        </div>
                        <p className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">{strategy.lifestyleGuide}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
