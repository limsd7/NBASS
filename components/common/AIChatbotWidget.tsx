import React, { useState, useRef, useEffect } from 'react';
import { generateAIResponse } from '../../services/aiService';
import { AIModelConfig } from '../../types';

interface AIChatbotWidgetProps {
    contextData: any;
    aiModels: AIModelConfig | null;
    membershipTier?: 'free' | 'pro' | 'premium' | 'expert';
}

export const AIChatbotWidget: React.FC<AIChatbotWidgetProps> = ({ contextData, aiModels, membershipTier = 'free' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // If no AI models are configured, don't show the widget at all
    if (!aiModels || (!aiModels.geminiKey && !aiModels.sonnetKey && !aiModels.localModelUrl)) {
        return null;
    }

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsLoading(true);

        try {
            // Build conversation history
            const historyText = messages.map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`).join('\n');
            const systemContext = `당신은 뇌과학, 자율신경계, 학생 건강 및 학습 전략 분석 전문가(NBASS AI)입니다.
현재 환자/학생의 데이터는 다음과 같습니다. 이 데이터를 바탕으로 학부모나 상담사의 질문에 친절하고 명확하게 답변하세요.
환자 데이터: ${JSON.stringify(contextData)}

이전 대화 내역:
${historyText}`;

            const res = await generateAIResponse(userMsg, systemContext, aiModels, membershipTier);
            
            if (res.error) {
                setMessages(prev => [...prev, { role: 'ai', content: `[오류] ${res.error}` }]);
            } else {
                setMessages(prev => [...prev, { role: 'ai', content: res.text }]);
            }
        } catch (err) {
            setMessages(prev => [...prev, { role: 'ai', content: '[오류] 응답을 생성하는 중 문제가 발생했습니다.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {isOpen && (
                <div className="bg-white border shadow-2xl rounded-2xl w-80 sm:w-96 mb-4 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300 h-[500px]">
                    <div className="bg-indigo-600 p-4 text-white flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <span className="text-xl">🤖</span>
                            <div>
                                <h3 className="font-bold text-sm">NBASS AI 어시스턴트</h3>
                                <p className="text-xs text-indigo-200">현재 화면의 데이터를 분석합니다.</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-indigo-200 hover:text-white transition-colors">
                            ✕
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
                        {messages.length === 0 && (
                            <div className="text-center text-slate-400 text-sm py-10">
                                <span className="text-4xl mb-2 block">👋</span>
                                궁금한 점을 질문해주세요!<br/>예: "BAI 점수가 높은데 어떻게 해야하나요?"
                            </div>
                        )}
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                                    msg.role === 'user' 
                                        ? 'bg-indigo-600 text-white rounded-br-none' 
                                        : 'bg-white border border-slate-100 text-slate-700 rounded-bl-none'
                                }`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-slate-100 text-slate-500 rounded-2xl rounded-bl-none px-4 py-3 text-sm shadow-sm flex items-center gap-2">
                                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-3 bg-white border-t flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="메시지를 입력하세요..."
                            className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 ring-indigo-100"
                        />
                        <button 
                            onClick={handleSend}
                            disabled={isLoading || !input.trim()}
                            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl w-10 h-10 flex items-center justify-center transition-colors"
                        >
                            ↑
                        </button>
                    </div>
                </div>
            )}

            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg flex items-center justify-center text-2xl transition-transform hover:scale-110 active:scale-95 animate-bounce-slow"
                >
                    🤖
                </button>
            )}
        </div>
    );
};
