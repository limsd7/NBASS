import React, { useState } from 'react';
import { SleepRecord } from '../../types';

interface CircadianRetimingCardProps {
  records: SleepRecord[];
  currentBedtime?: string;
  currentWakeTime?: string;
}

export const CircadianRetimingCard: React.FC<CircadianRetimingCardProps> = ({
  records,
  currentBedtime = '00:30',
  currentWakeTime = '07:30',
}) => {
  const [dDayWeeks, setDDayWeeks] = useState<number>(3); // 3주 전 (D-21)
  const [examType, setExamType] = useState<'suneung' | 'mock' | 'school'>('suneung');

  // Exam target: Suneung 1st period starts at 08:40. Frontal lobe peak alertness takes ~2h 10m.
  const targetWake = '06:30';
  const targetBed = '23:00';

  // Calculate schedule steps based on weeks remaining
  const steps = [
    {
      week: '1단계 (D-21 ~ D-15)',
      desc: '생체 리듬 1차 전진 (기상 15분 단축)',
      bedtime: '00:15',
      wakeTime: '07:15',
      focus: '아침 기상 즉시 자연광 10분 쬐기 (멜라토닌 리셋)',
      status: dDayWeeks === 3 ? 'active' : dDayWeeks < 3 ? 'completed' : 'upcoming',
    },
    {
      week: '2단계 (D-14 ~ D-8)',
      desc: '생체 리듬 2차 전진 (기상 30분 단축)',
      bedtime: '23:45',
      wakeTime: '07:00',
      focus: '야간 22시 이후 블루라이트 100% 차단 & 카페인 금지',
      status: dDayWeeks === 2 ? 'active' : dDayWeeks < 2 ? 'completed' : 'upcoming',
    },
    {
      week: '3단계 (D-7 ~ D-1)',
      desc: '수능 실전 완벽 동기화 (최종 목표 달성)',
      bedtime: targetBed,
      wakeTime: targetWake,
      focus: '08:40 1교시 국어 지문 독해 전두엽 최고 각성 상태 유지',
      status: dDayWeeks === 1 ? 'active' : 'upcoming',
    },
  ];

  return (
    <div className="bg-gradient-to-br from-indigo-950/80 via-slate-900 to-blue-950/80 rounded-3xl p-6 md:p-8 border border-indigo-500/30 text-white shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-2xl border border-indigo-400/30">
            🎯
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-bold text-white">시험 당일 생체 시차 교정 (Circadian Retiming)</h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
                수능 08:40 1교시 최적화
              </span>
            </div>
            <p className="text-xs text-indigo-200/70 mt-0.5">
              전두엽이 최고 각성에 도달하는 2시간 10분을 확보하기 위한 3주 점진적 기상 스케줄러입니다.
            </p>
          </div>
        </div>

        {/* Weeks Selector */}
        <div className="flex items-center bg-black/40 p-1 rounded-2xl border border-white/10 text-xs shrink-0">
          <button
            onClick={() => setDDayWeeks(3)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              dDayWeeks === 3 ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            D-21 (3주)
          </button>
          <button
            onClick={() => setDDayWeeks(2)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              dDayWeeks === 2 ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            D-14 (2주)
          </button>
          <button
            onClick={() => setDDayWeeks(1)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              dDayWeeks === 1 ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            D-7 (1주)
          </button>
        </div>
      </div>

      {/* Target Comparison Display */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
          <span className="text-[11px] text-slate-400 block mb-1">현재 평균 생체 리듬</span>
          <div className="flex items-baseline space-x-2">
            <span className="font-mono text-xl font-bold text-amber-300">{currentBedtime} 취침</span>
            <span className="text-xs text-slate-400">➔</span>
            <span className="font-mono text-xl font-bold text-amber-300">{currentWakeTime} 기상</span>
          </div>
          <span className="text-[10px] text-amber-400/80 mt-1 block">⚠️ 08:40 시험 시작 시 뇌 각성 부족 위험</span>
        </div>

        <div className="p-4 rounded-2xl bg-indigo-600/20 border border-indigo-400/30">
          <span className="text-[11px] text-indigo-200 block mb-1">수능 D-Day 실전 목표 리듬</span>
          <div className="flex items-baseline space-x-2">
            <span className="font-mono text-xl font-bold text-cyan-300">{targetBed} 취침</span>
            <span className="text-xs text-indigo-300">➔</span>
            <span className="font-mono text-xl font-bold text-cyan-300">{targetWake} 기상</span>
          </div>
          <span className="text-[10px] text-cyan-200 mt-1 block">✨ 1교시 시작 2시간 10분 전 기상 완료</span>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-600/20 border border-emerald-400/30">
          <span className="text-[11px] text-emerald-200 block mb-1">기억 고착화 보장 시간</span>
          <div className="font-mono text-xl font-bold text-emerald-300">7.5 시간 (5 사이클)</div>
          <span className="text-[10px] text-emerald-200 mt-1 block">서파수면 22% + 렘수면 24% 확보</span>
        </div>
      </div>

      {/* Progressive Milestones */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          📅 단계별 생체 시차 적응 로드맵
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border transition-all ${
                step.status === 'active'
                  ? 'bg-indigo-600/30 border-indigo-400 shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-400/50'
                  : step.status === 'completed'
                  ? 'bg-emerald-950/30 border-emerald-500/30 opacity-70'
                  : 'bg-white/5 border-white/10 opacity-50'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-indigo-300">{step.week}</span>
                {step.status === 'active' && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-indigo-500 text-white animate-pulse">
                    현재 단계
                  </span>
                )}
              </div>
              <div className="font-mono text-sm font-bold text-white mb-2">
                🌙 {step.bedtime} ~ ☀️ {step.wakeTime}
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed mb-2">
                {step.desc}
              </p>
              <div className="text-[10px] text-indigo-200/80 bg-black/30 p-2 rounded-xl border border-white/5">
                💡 {step.focus}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
