import React, { useState, useEffect } from 'react';

type Mood = 'GREAT' | 'NEUTRAL' | 'STRESSED';

interface MoodLog {
    date: string;
    mood: Mood;
}

export const MoodTracker: React.FC = () => {
    const [logs, setLogs] = useState<MoodLog[]>([]);
    const [todayMood, setTodayMood] = useState<Mood | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem('nbass_mood_logs');
        if (stored) {
            const parsed = JSON.parse(stored) as MoodLog[];
            setLogs(parsed);
            
            // Check if today is already logged
            const todayStr = new Date().toISOString().split('T')[0];
            const todayLog = parsed.find(l => l.date === todayStr);
            if (todayLog) {
                setTodayMood(todayLog.mood);
            }
        }
    }, []);

    const logMood = (mood: Mood) => {
        const todayStr = new Date().toISOString().split('T')[0];
        
        const newLog: MoodLog = { date: todayStr, mood };
        const updatedLogs = [...logs.filter(l => l.date !== todayStr), newLog];
        
        // Keep only last 14 days
        const recentLogs = updatedLogs.slice(-14);
        
        setLogs(recentLogs);
        setTodayMood(mood);
        localStorage.setItem('nbass_mood_logs', JSON.stringify(recentLogs));
    };

    // Calculate chart dots for last 7 days
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toISOString().split('T')[0];
    });

    const getMoodIcon = (m?: Mood) => {
        if (m === 'GREAT') return '😀';
        if (m === 'NEUTRAL') return '😐';
        if (m === 'STRESSED') return '😫';
        return '◽';
    };

    const getMoodColor = (m?: Mood) => {
        if (m === 'GREAT') return 'bg-emerald-500';
        if (m === 'NEUTRAL') return 'bg-amber-400';
        if (m === 'STRESSED') return 'bg-rose-500';
        return 'bg-slate-200';
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm w-full max-w-2xl mx-auto">
            <h3 className="font-bold text-lg mb-4 text-slate-800 dark:text-white flex items-center gap-2">
                <span>📝</span> 일일 감정 & 멘탈 캘린더
            </h3>
            
            <div className="flex flex-col md:flex-row gap-8 items-center">
                {/* Input Section */}
                <div className="flex-1 text-center md:text-left">
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">오늘의 기분과 스트레스는 어떠신가요?</p>
                    <div className="flex justify-center md:justify-start gap-4">
                        <button 
                            onClick={() => logMood('GREAT')}
                            className={`text-4xl transition-transform hover:scale-110 ${todayMood === 'GREAT' ? 'scale-110 drop-shadow-md' : 'opacity-50 hover:opacity-100'}`}
                        >
                            😀
                        </button>
                        <button 
                            onClick={() => logMood('NEUTRAL')}
                            className={`text-4xl transition-transform hover:scale-110 ${todayMood === 'NEUTRAL' ? 'scale-110 drop-shadow-md' : 'opacity-50 hover:opacity-100'}`}
                        >
                            😐
                        </button>
                        <button 
                            onClick={() => logMood('STRESSED')}
                            className={`text-4xl transition-transform hover:scale-110 ${todayMood === 'STRESSED' ? 'scale-110 drop-shadow-md' : 'opacity-50 hover:opacity-100'}`}
                        >
                            😫
                        </button>
                    </div>
                </div>

                {/* 7-day Mini Chart */}
                <div className="flex-1 w-full bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl">
                    <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider text-center">최근 7일 멘탈 흐름</p>
                    <div className="flex justify-between items-end h-12 gap-1">
                        {last7Days.map(dayStr => {
                            const log = logs.find(l => l.date === dayStr);
                            const height = log?.mood === 'GREAT' ? 'h-full' : log?.mood === 'NEUTRAL' ? 'h-2/3' : log?.mood === 'STRESSED' ? 'h-1/3' : 'h-2';
                            return (
                                <div key={dayStr} className="flex flex-col items-center flex-1 group relative">
                                    {/* Tooltip */}
                                    <div className="absolute -top-8 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                        {dayStr.slice(5)}: {getMoodIcon(log?.mood)}
                                    </div>
                                    <div className={`w-full max-w-[12px] rounded-full transition-all duration-500 ${height} ${getMoodColor(log?.mood)}`}></div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            {todayMood === 'STRESSED' && (
                <div className="mt-4 p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-sm rounded-xl flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
                    <span className="shrink-0">💡</span>
                    <p>스트레스가 높군요! 무리한 학습보다는 우측 하단의 <b>휴식(5분) 타이머</b>나 <b>백색소음</b>을 활용해 뇌를 잠시 식혀주는 것을 추천합니다.</p>
                </div>
            )}
        </div>
    );
};
