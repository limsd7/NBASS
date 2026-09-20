import React, { memo } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, ZAxis,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
  BarChart, Bar, Legend, Radar, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, LineChart, Line, CartesianGrid
} from 'recharts';


interface HRVChartsProps {
  sns: number;
  pns: number;
  vitality: number;
  fatigue: number;
}

export const BalanceChart: React.FC<{ sns: number; pns: number }> = memo(({ sns, pns }) => {
  const data = [
    { name: 'SNS (Sympathetic)', value: sns },
    { name: 'PNS (Parasympathetic)', value: pns },
  ];
  const COLORS = ['#ef4444', '#3b82f6'];

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
});

BalanceChart.displayName = 'BalanceChart';

export const VitalityBarChart: React.FC<{ vitality: number; fatigue: number }> = memo(({ vitality, fatigue }) => {
  const data = [
    { name: 'Index', Vitality: vitality, Fatigue: fatigue },
  ];

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="name" hide />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Legend />
          <Bar dataKey="Vitality" fill="#10b981" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Fatigue" fill="#f59e0b" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});

VitalityBarChart.displayName = 'VitalityBarChart';

export const RRVPhasePlot: React.FC = memo(() => {
  // Generate random scatter points for visualization demo
  const data = Array.from({ length: 40 }, () => ({
    x: 600 + Math.random() * 200,
    y: 600 + Math.random() * 200,
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart>
          <XAxis type="number" dataKey="x" name="RR_n" unit="ms" hide />
          <YAxis type="number" dataKey="y" name="RR_n+1" unit="ms" hide />
          <ZAxis type="number" range={[10, 10]} />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Scatter name="RR Intervals" data={data} fill="#6366f1" />
        </ScatterChart>
      </ResponsiveContainer>
      <p className="text-xs text-center text-slate-500 mt-2">RRV Phase Plot: Distribution indicates physical flexibility.</p>
    </div>
  );
});

RRVPhasePlot.displayName = 'RRVPhasePlot';

// NEW: Brain Balance Radar Chart
export const BrainRadarChart: React.FC<{
  gamma: number; hBeta: number; mBeta: number;
  lBeta: number; alpha: number; theta: number;
  isPortable?: boolean; // Added isPortable prop
}> = memo(({ gamma, hBeta, mBeta, lBeta, alpha, theta, isPortable }) => {
  const data = isPortable ? [
    { subject: '집중 (Concentration)', A: mBeta || 0, fullMark: 100 },
    { subject: '안정 (Relaxation)', A: alpha || 0, fullMark: 100 },
    { subject: '활력 (Vitality)', A: gamma || 0, fullMark: 100 },
  ] : [
    { subject: 'Gamma (인지)', A: gamma, fullMark: 100 },
    { subject: 'H-Beta (긴장)', A: hBeta, fullMark: 100 },
    { subject: 'M-Beta (몰입)', A: mBeta, fullMark: 100 },
    { subject: 'L-Beta (주의)', A: lBeta, fullMark: 100 },
    { subject: 'Alpha (이완)', A: alpha, fullMark: 100 },
    { subject: 'Theta (졸음)', A: theta, fullMark: 100 },
  ];

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
          <PolarRadiusAxis angle={30} domain={[0, 50]} />
          <Radar name="Brain Waves" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
});

BrainRadarChart.displayName = 'BrainRadarChart';

// NEW: Trend Analysis Chart
export const TrendChart: React.FC<{ history: any[] }> = memo(({ history }) => {
  // 날짜 오름차순 정렬 및 데이터 가공
  const data = [...history].reverse().map(h => ({
    date: new Date(h.date).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' }),
    score: h.score || 0,
    stress: h.hrv?.physicalStress || h.hrv?.stressScore || 50,
    vitality: h.hrv?.vitality || 50
  }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
          <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
          <Legend />
          <Line type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={2} name="종합 점수" activeDot={{ r: 6 }} />
          <Line type="monotone" dataKey="stress" stroke="#ef4444" strokeWidth={2} name="스트레스" dot={{ strokeWidth: 0, r: 4 }} />
          <Line type="monotone" dataKey="vitality" stroke="#10b981" strokeWidth={2} name="활력도" dot={{ strokeWidth: 0, r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

TrendChart.displayName = 'TrendChart';

// NEW: Stress Gauge Chart (Simple Bar)
export const StressGaugeChart: React.FC<{
  stress: number;
  label: string;
  color: string;
  badge?: string;
  description?: string;
}> = memo(({ stress, label, color, badge, description }) => {
  const rawVal = Number(stress) || 0;
  const normalizedVal = rawVal > 10 ? Math.round(rawVal / 10) : rawVal;
  const clampedVal = Math.min(10, Math.max(0, normalizedVal));
  const percentage = Math.min(100, Math.max(0, clampedVal * 10));

  // Determine solid background color class
  const getBgClass = (c: string) => {
    if (c.includes('red') || c.includes('rose')) return 'bg-rose-500';
    if (c.includes('emerald') || c.includes('green')) return 'bg-emerald-500';
    if (c.includes('blue') || c.includes('indigo')) return 'bg-blue-500';
    if (c.includes('amber') || c.includes('yellow')) return 'bg-amber-500';
    if (c.includes('violet') || c.includes('purple')) return 'bg-violet-500';
    return 'bg-indigo-500';
  };

  const bgClass = getBgClass(color);

  return (
    <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">{label}</span>
          {badge && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              {badge}
            </span>
          )}
        </div>
        <span className={`text-sm font-black ${color}`}>{clampedVal}/10</span>
      </div>
      <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${bgClass}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      {description && (
        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 leading-tight">{description}</p>
      )}
    </div>
  );
});

StressGaugeChart.displayName = 'StressGaugeChart';
