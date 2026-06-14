import React from 'react';
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { SleepRecord } from '../../types';

interface SleepTrendChartProps {
  data: SleepRecord[];
  targetDuration: number;
}

export const SleepTrendChart: React.FC<SleepTrendChartProps> = ({ data, targetDuration }) => {
  // Process data for the chart
  const chartData = [...data].reverse().map(record => {
    // Calculate sleep duration in hours
    const bedtimeParts = record.bedtime.split(':').map(Number);
    const wakeParts = record.wakeTime.split(':').map(Number);
    
    let bedMins = bedtimeParts[0] * 60 + bedtimeParts[1];
    let wakeMins = wakeParts[0] * 60 + wakeParts[1];
    
    // Handle overnight sleep (bedtime before midnight)
    if (bedMins > 12 * 60 && wakeMins < 12 * 60) {
      wakeMins += 24 * 60;
    }
    
    // If it's a daytime nap or daytime sleep, just calculate difference
    // This is a simple approximation
    const durationHours = Math.max(0, (wakeMins - bedMins) / 60);
    
    const dateStr = record.date.substring(5); // MM-DD
    
    return {
      date: dateStr,
      fullDate: record.date,
      duration: parseFloat(durationHours.toFixed(1)),
      quality: record.sleepQuality,
      bedtime: record.bedtime,
      wakeTime: record.wakeTime,
      target: targetDuration
    };
  });

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
        <p className="text-slate-400">데이터가 없습니다.</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-slate-800 p-4 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg">
          <p className="font-bold text-slate-800 dark:text-white mb-2">{data.fullDate}</p>
          <div className="space-y-1 text-sm">
            <p className="text-slate-600 dark:text-slate-300">
              <span className="inline-block w-16">수면 시간:</span> 
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">{data.duration}시간</span>
            </p>
            <p className="text-slate-600 dark:text-slate-300">
              <span className="inline-block w-16">취침-기상:</span> 
              <span className="font-semibold">{data.bedtime} ~ {data.wakeTime}</span>
            </p>
            <p className="text-slate-600 dark:text-slate-300">
              <span className="inline-block w-16">수면 품질:</span> 
              <span className="font-semibold text-yellow-500">{'⭐'.repeat(data.quality)}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }} 
            dy={10}
          />
          <YAxis 
            yAxisId="left"
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }}
            domain={[0, 'auto']}
            dx={-10}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          
          <Bar 
            yAxisId="left"
            dataKey="duration" 
            name="수면 시간 (시간)" 
            fill="#6366f1" 
            radius={[4, 4, 0, 0]} 
            barSize={24}
          />
          
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="target" 
            name="목표 시간" 
            stroke="#10b981" 
            strokeWidth={2}
            strokeDasharray="5 5" 
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
