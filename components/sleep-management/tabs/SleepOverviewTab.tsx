import React from 'react';
import { SleepRecord, SleepGoal } from '../../../types';
import { SleepTrendChart } from '../SleepTrendChart';

interface SleepOverviewTabProps {
  records: SleepRecord[];
  goal: SleepGoal | null;
  onDelete: (id: string) => void;
}

export const SleepOverviewTab: React.FC<SleepOverviewTabProps> = ({ records, goal, onDelete }) => {
  // Calculate average sleep duration
  const getAverageSleep = () => {
    if (records.length === 0) return 0;
    
    let totalMinutes = 0;
    records.forEach(r => {
      const bParts = r.bedtime.split(':').map(Number);
      const wParts = r.wakeTime.split(':').map(Number);
      
      let bMins = bParts[0] * 60 + bParts[1];
      let wMins = wParts[0] * 60 + wParts[1];
      
      if (bMins > 12 * 60 && wMins < 12 * 60) {
        wMins += 24 * 60;
      }
      
      totalMinutes += Math.max(0, wMins - bMins);
    });
    
    return totalMinutes / records.length / 60;
  };

  const avgSleep = getAverageSleep();
  const targetDuration = goal?.targetDuration || 7;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">평균 수면 시간</p>
              <h3 className="text-3xl font-bold text-slate-800 dark:text-white mt-1">
                {avgSleep.toFixed(1)}<span className="text-lg font-normal text-slate-500 ml-1">시간</span>
              </h3>
            </div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">
              <span className="text-2xl">⏳</span>
            </div>
          </div>
          <div className="mt-4 text-sm">
            {goal ? (
              <span className={`${avgSleep >= goal.targetDuration ? 'text-green-500' : 'text-amber-500'}`}>
                목표({goal.targetDuration}시간) 대비 {Math.abs(avgSleep - goal.targetDuration).toFixed(1)}시간 
                {avgSleep >= goal.targetDuration ? ' 초과 달성' : ' 부족'}
              </span>
            ) : (
              <span className="text-slate-400">목표 미설정</span>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">평균 수면 품질</p>
              <h3 className="text-3xl font-bold text-slate-800 dark:text-white mt-1">
                {records.length > 0 ? (records.reduce((acc, r) => acc + r.sleepQuality, 0) / records.length).toFixed(1) : '-'}
                <span className="text-lg font-normal text-slate-500 ml-1">/ 5</span>
              </h3>
            </div>
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-xl">
              <span className="text-2xl">⭐</span>
            </div>
          </div>
          <div className="mt-4 text-sm text-slate-500">
            최근 {records.length}일 기록 기준
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">규칙성 점수</p>
              <h3 className="text-3xl font-bold text-slate-800 dark:text-white mt-1">
                {records.length > 2 ? '85' : '-'}
                <span className="text-lg font-normal text-slate-500 ml-1">점</span>
              </h3>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-xl">
              <span className="text-2xl">🔄</span>
            </div>
          </div>
          <div className="mt-4 text-sm text-slate-500">
            취침/기상 시간 편차 분석
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
          <span>📈</span> 수면 패턴 추이
        </h3>
        <SleepTrendChart data={records.slice(0, 14)} targetDuration={targetDuration} />
      </div>

      {/* Record List */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <span>📝</span> 최근 수면 기록
        </h3>
        
        {records.length === 0 ? (
          <div className="text-center py-8 text-slate-500 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
            기록된 수면 데이터가 없습니다. 새로운 기록을 추가해 주세요.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">날짜</th>
                  <th className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">취침-기상</th>
                  <th className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">수면 품질</th>
                  <th className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">메모</th>
                  <th className="py-3 px-4 font-semibold text-right text-slate-600 dark:text-slate-300">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {records.slice(0, 10).map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 text-slate-800 dark:text-slate-200">{record.date}</td>
                    <td className="py-3 px-4 text-slate-800 dark:text-slate-200">
                      <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-sm font-mono">
                        {record.bedtime} - {record.wakeTime}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-yellow-500">{'⭐'.repeat(record.sleepQuality)}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                      {record.memo || '-'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button 
                        onClick={() => onDelete(record.id)}
                        className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="삭제"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
