import React, { useState, useEffect } from 'react';
import { WorkingMemoryAssessment } from './WorkingMemoryAssessment';
import { CareType } from '../types';
import { WorkingMemoryResult } from '../data/workingMemoryAssessments';

interface NBackLog {
    date: string;
    score: number;
    level: string;
}

export const NBackHistoryChart: React.FC = () => {
    const [logs, setLogs] = useState<NBackLog[]>([]);
    const [isTestOpen, setIsTestOpen] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('nbass_nback_logs');
        if (stored) {
            setLogs(JSON.parse(stored));
        } else {
            // Seed some dummy initial data to show the graph going up
            const dummy = [
                { date: '2026-06-01', score: 35, level: 'Level 1' },
                { date: '2026-06-05', score: 42, level: 'Level 2' },
                { date: '2026-06-10', score: 58, level: 'Level 3' }
            ];
            setLogs(dummy);
            localStorage.setItem('nbass_nback_logs', JSON.stringify(dummy));
        }
    }, []);

    const handleComplete = (result: WorkingMemoryResult) => {
        const todayStr = new Date().toISOString().split('T')[0];
        const newLog: NBackLog = {
            date: todayStr,
            score: result.overallScore || 50,
            level: result.overallLevel || 'Level 1'
        };
        
        // Remove existing log for today to prevent duplicates
        const updatedLogs = [...logs.filter(l => l.date !== todayStr), newLog];
        setLogs(updatedLogs);
        localStorage.setItem('nbass_nback_logs', JSON.stringify(updatedLogs));
        setIsTestOpen(false);
    };

    // Calculate chart dots
    const maxScore = 100;

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm w-full">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                    <span className="text-2xl">🧠</span> 작업 기억력(RAM) 성장 그래프
                </h3>
                <button 
                    onClick={() => setIsTestOpen(true)}
                    className="px-4 py-2 bg-indigo-100 text-indigo-700 font-bold rounded-lg hover:bg-indigo-200 transition-colors text-sm"
                >
                    훈련 시작하기
                </button>
            </div>
            
            <div className="h-48 flex items-end justify-between gap-2 relative bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl">
                {logs.length === 0 ? (
                    <div className="w-full text-center text-slate-400 text-sm py-10">
                        기록이 없습니다. 훈련을 시작해 보세요.
                    </div>
                ) : (
                    logs.map((log, i) => {
                        const heightPercent = Math.max(10, (log.score / maxScore) * 100);
                        return (
                            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full relative group">
                                {/* Tooltip */}
                                <div className="absolute -top-10 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 text-center">
                                    {log.date.slice(5)}<br/>{log.score}점 ({log.level})
                                </div>
                                <div 
                                    className="w-full max-w-[24px] bg-indigo-500 rounded-t-md transition-all duration-700 hover:bg-indigo-400"
                                    style={{ height: `${heightPercent}%` }}
                                ></div>
                                <span className="text-[10px] text-slate-400 mt-2 truncate w-full text-center">
                                    {log.date.slice(5)}
                                </span>
                            </div>
                        );
                    })
                )}
                {/* Trend line overlay could be added here */}
            </div>

            {/* Test Modal */}
            {isTestOpen && (
                <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex justify-center overflow-y-auto p-4 sm:p-8">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-4xl h-max min-h-[80vh] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 my-auto relative p-6">
                        <button 
                            onClick={() => setIsTestOpen(false)}
                            className="absolute top-4 right-4 w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 z-50 font-bold"
                        >
                            ✕
                        </button>
                        <WorkingMemoryAssessment
                            careType={CareType.HEALTHY}
                            isPortableMode={true}
                            isInline={false}
                            onComplete={handleComplete}
                            onClose={() => setIsTestOpen(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
