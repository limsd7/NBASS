import React, { useState } from 'react';
import { generateAIResponse } from '../../services/aiService';
import { AIModelConfig } from '../../types';

interface AIAssistantPanelProps {
    contextData: any;
    systemPrompt: string;
    buttonLabel?: string;
    aiModels: AIModelConfig | null;
    membershipTier?: 'standard' | 'premium';
}

export const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({ 
    contextData, 
    systemPrompt, 
    buttonLabel = '✨ AI 해석 요약',
    aiModels,
    membershipTier = 'standard'
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [response, setResponse] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // If no AI models are configured, don't show the panel at all
    if (!aiModels || (!aiModels.geminiKey && !aiModels.sonnetKey && !aiModels.localModelUrl)) {
        return null;
    }

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const prompt = `현재 환자/학생의 데이터입니다:\n${JSON.stringify(contextData, null, 2)}`;
            const res = await generateAIResponse(prompt, systemPrompt, aiModels, membershipTier);
            if (res.error) {
                setError(res.error);
            } else {
                setResponse(res.text);
            }
        } catch (err) {
            setError('분석 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mt-6 bg-indigo-50/50 border border-indigo-100 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <span className="text-xl">🤖</span>
                    <h3 className="font-bold text-indigo-900">AI 보조 어시스턴트</h3>
                </div>
                {!response && !isLoading && (
                    <button 
                        onClick={handleGenerate}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md transition-all active:scale-95 flex items-center gap-2"
                    >
                        <span>{buttonLabel}</span>
                    </button>
                )}
            </div>

            {isLoading && (
                <div className="flex flex-col items-center justify-center py-8 text-indigo-400">
                    <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
                    <p className="text-sm font-medium animate-pulse">AI가 데이터를 분석하고 있습니다...</p>
                </div>
            )}

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
                    {error}
                </div>
            )}

            {response && !isLoading && (
                <div className="bg-white p-4 rounded-lg border border-indigo-100 shadow-sm prose prose-sm max-w-none text-slate-700">
                    {/* Basic Markdown rendering for lines */}
                    {response.split('\n').map((line, i) => {
                        if (line.startsWith('## ')) return <h3 key={i} className="text-indigo-800 font-bold mt-3 mb-1">{line.replace('## ', '')}</h3>;
                        if (line.startsWith('# ')) return <h2 key={i} className="text-indigo-900 font-extrabold mt-4 mb-2">{line.replace('# ', '')}</h2>;
                        if (line.startsWith('- ')) return <li key={i} className="ml-4 list-disc marker:text-indigo-400">{line.replace('- ', '')}</li>;
                        if (line.startsWith('* ')) return <li key={i} className="ml-4 list-disc marker:text-indigo-400">{line.replace('* ', '')}</li>;
                        if (line.trim() === '') return <br key={i} />;
                        
                        // Parse bold text
                        const parts = line.split(/(\*\*.*?\*\*)/g);
                        return (
                            <p key={i} className="my-1 leading-relaxed">
                                {parts.map((part, j) => {
                                    if (part.startsWith('**') && part.endsWith('**')) {
                                        return <strong key={j} className="text-indigo-900">{part.slice(2, -2)}</strong>;
                                    }
                                    return part;
                                })}
                            </p>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
