import React from 'react';

interface AssessmentCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  badge?: string;
  accentColor?: 'indigo' | 'blue' | 'purple' | 'emerald' | 'rose' | 'amber';
  className?: string;
}

export const AssessmentCard: React.FC<AssessmentCardProps> = ({
  children,
  title,
  subtitle,
  badge,
  accentColor = 'indigo',
  className = ''
}) => {
  const accentGlowColors: Record<string, string> = {
    indigo: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
    blue: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    purple: 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    rose: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800',
    amber: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  };

  const accentBgBlurs: Record<string, { top: string; bottom: string }> = {
    indigo: {
      top: 'bg-indigo-200/40 dark:bg-indigo-900/20',
      bottom: 'bg-blue-200/40 dark:bg-blue-900/20',
    },
    blue: {
      top: 'bg-blue-200/40 dark:bg-blue-900/20',
      bottom: 'bg-cyan-200/40 dark:bg-cyan-900/20',
    },
    purple: {
      top: 'bg-purple-200/40 dark:bg-purple-900/20',
      bottom: 'bg-indigo-200/40 dark:bg-indigo-900/20',
    },
    emerald: {
      top: 'bg-emerald-200/40 dark:bg-emerald-900/20',
      bottom: 'bg-teal-200/40 dark:bg-teal-900/20',
    },
    rose: {
      top: 'bg-rose-200/40 dark:bg-rose-900/20',
      bottom: 'bg-pink-200/40 dark:bg-pink-900/20',
    },
    amber: {
      top: 'bg-amber-200/40 dark:bg-amber-900/20',
      bottom: 'bg-orange-200/40 dark:bg-orange-900/20',
    },
  };

  const currentBlur = accentBgBlurs[accentColor] || accentBgBlurs.indigo;
  const currentGlow = accentGlowColors[accentColor] || accentGlowColors.indigo;

  return (
    <div className={`bg-white dark:bg-slate-800/95 p-8 md:p-12 rounded-[2.5rem] border border-slate-200/80 dark:border-slate-700 shadow-2xl shadow-indigo-500/5 relative overflow-hidden transition-all duration-300 ${className}`}>
      {/* Dynamic Background Blur Accents */}
      <div className={`absolute -top-24 -right-24 w-80 h-80 ${currentBlur.top} rounded-full mix-blend-multiply filter blur-3xl opacity-60 pointer-events-none`} />
      <div className={`absolute -bottom-24 -left-24 w-80 h-80 ${currentBlur.bottom} rounded-full mix-blend-multiply filter blur-3xl opacity-60 pointer-events-none`} />

      {/* Header if title or badge is present */}
      {(title || badge) && (
        <div className="relative z-10 text-center mb-8">
          {badge && (
            <div className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-3 border shadow-sm backdrop-blur-sm ${currentGlow}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              <span>{badge}</span>
            </div>
          )}
          {title && (
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Card Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
