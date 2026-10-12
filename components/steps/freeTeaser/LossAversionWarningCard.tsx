import React, { useState, useEffect } from 'react';
import { AssessmentResult, CareType } from '../../../types';

interface LossAversionWarningCardProps {
  result: AssessmentResult;
  onOpenUpgrade: (reason: string) => void;
}

export const LossAversionWarningCard: React.FC<LossAversionWarningCardProps> = ({
  result,
  onOpenUpgrade,
}) => {
  // 48시간 골든타임 카운트다운 (localStorage에 최초 진단 시점 저장)
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 47,
    minutes: 58,
    seconds: 40,
  });

  useEffect(() => {
    const storageKey = `nbass_golden_time_${result.student?.id || 'guest'}`;
    let expiry = localStorage.getItem(storageKey);
    if (!expiry) {
      const now = new Date();
      now.setHours(now.getHours() + 48);
      expiry = now.toISOString();
      localStorage.setItem(storageKey, expiry);
    }

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(expiry!).getTime();
      const diff = Math.max(0, target - now);

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, [result.student?.id]);

  // CareType 및 지표에 따른 맞춤형 손실 추정치
  const riskAnalysis = React.useMemo(() => {
    const careType = result.careType;
    let penaltyPoints = '-8 ~ -12점';
    let mistakeType = '아는 문제 계산 실수 및 지문 조건 오독';
    let fatigueRisk = '고위험 (78%)';
    let timeWindow = '시험 시작 40분 경과 후 집중 방전';

    if (careType === CareType.ATTENTION_DEFICIT) {
      penaltyPoints = '-10 ~ -15점';
      mistakeType = '작업기억 과부하로 인한 풀이 순서 오류 및 시간 배분 실패';
      fatigueRisk = '초고위험 (86%)';
      timeWindow = '시험 시작 25분 후 도파민 급락 및 집중 분산';
    } else if (careType === CareType.BRAIN_FATIGUE) {
      penaltyPoints = '-8 ~ -14점';
      mistakeType = '전두엽 정보처리 속도 저하로 인한 뒷부분 고난도 킬러 문항 시간 부족';
      fatigueRisk = '주의 (82%)';
      timeWindow = '3교시 이후 뇌 피로 누적으로 인한 인지 반응 지연';
    } else if (careType === CareType.ANXIETY_TENSION || careType === CareType.HYPERSENSITIVE) {
      penaltyPoints = '-6 ~ -10점';
      mistakeType = '자율신경 교감 긴장으로 인한 마킹 실수 및 1번 문항 긴장성 멍때림';
      fatigueRisk = '경계 (74%)';
      timeWindow = '시험 직전 10분 심박수 급상승 및 시야 협착';
    }

    return { penaltyPoints, mistakeType, fatigueRisk, timeWindow };
  }, [result.careType]);

  return (
    <div className="relative rounded-3xl p-6 md:p-8 bg-slate-950 bg-gradient-to-br from-slate-950 via-rose-950/25 to-slate-900 border-2 border-rose-500/40 shadow-2xl text-white overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-44 h-44 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar: Warning Badge & Live Countdown */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-rose-500/20">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-rose-500/20 border border-rose-500/40 text-rose-300 rounded-full text-xs font-black flex items-center gap-1.5 animate-pulse">
            <span>🚨</span>
            <span>성적 누수 위험 경고 (Loss Aversion Alert)</span>
          </span>
          <span className="text-xs text-rose-200 font-semibold hidden md:inline">
            두뇌 인지 피로 과부하 감지
          </span>
        </div>

        {/* 48시간 골든타임 실시간 타이머 */}
        <div className="flex items-center gap-2 bg-slate-900/90 px-3.5 py-1.5 rounded-xl border border-rose-500/30 self-start sm:self-auto">
          <span className="text-[11px] font-bold text-amber-300">⏱️ 교정 골든타임:</span>
          <span className="font-mono text-xs font-black text-white tracking-wider">
            {String(timeLeft.hours).padStart(2, '0')}시간 {String(timeLeft.minutes).padStart(2, '0')}분 {String(timeLeft.seconds).padStart(2, '0')}초
          </span>
        </div>
      </div>

      {/* Main Warning Title */}
      <div className="space-y-2 mb-6">
        <h3 className="text-xl md:text-2xl font-black tracking-tight text-white leading-snug">
          현재 두뇌 상태 방치 시, 이번 시험에서{' '}
          <span className="text-rose-400 underline decoration-rose-500/50 decoration-wavy underline-offset-4">
            최소 {riskAnalysis.penaltyPoints} 감점
          </span>
          이 예상됩니다
        </h3>
        <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-normal">
          {result.student?.name || '학생'} 님의 간이 검사 결과, 전두엽 인지 과부하 지수가{' '}
          <strong className="text-rose-300">{riskAnalysis.fatigueRisk}</strong> 수준입니다. 
          실력이 부족해서가 아니라, 두뇌 피로로 인해 아는 문제를 어이없게 틀리는 <strong>'가짜 실수'</strong>가 누적되는 패턴입니다.
        </p>
      </div>

      {/* 3대 정밀 누수 지표 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-rose-500/20 space-y-1">
          <div className="text-[11px] font-bold text-rose-300 flex items-center gap-1">
            <span>📉</span>
            <span>예상 실수 감점폭</span>
          </div>
          <div className="text-lg font-black text-white">{riskAnalysis.penaltyPoints}</div>
          <p className="text-[10px] text-slate-400 leading-tight">평균 2~3문항 어이없는 계산·마킹 실수</p>
        </div>

        <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-rose-500/20 space-y-1">
          <div className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
            <span>⚡</span>
            <span>주요 오답 발생 원인</span>
          </div>
          <div className="text-xs font-bold text-slate-200 line-clamp-2 leading-tight">{riskAnalysis.mistakeType}</div>
          <p className="text-[10px] text-slate-400 leading-tight">작업기억 인지 처리 용량 초과</p>
        </div>

        <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-rose-500/20 space-y-1">
          <div className="text-[11px] font-bold text-indigo-300 flex items-center gap-1">
            <span>⏰</span>
            <span>집중력 급락 취약 시간</span>
          </div>
          <div className="text-xs font-bold text-slate-200 line-clamp-2 leading-tight">{riskAnalysis.timeWindow}</div>
          <p className="text-[10px] text-slate-400 leading-tight">생체 서카디안 리듬 불일치</p>
        </div>
      </div>

      {/* Urgency Box & CTA Button */}
      <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="space-y-1 text-xs text-rose-200 leading-relaxed">
          <div className="font-bold flex items-center gap-1.5 text-rose-300">
            <span>⚠️</span>
            <span>두뇌 피로가 만성화되기 전 48시간 내 시간표 재배치 필수</span>
          </div>
          <p className="text-[11px] text-slate-300">
            단 14P 심층 솔루션 리포트북으로 골든타임 순공 시간표와 뇌 피로 회복법을 적용하면, 유실될 10점의 점수를 즉시 방어할 수 있습니다.
          </p>
        </div>

        <button
          onClick={() => onOpenUpgrade('성적 누수 위험(-8~12점) 긴급 방어: 14P 심층 처방 리포트북 확인')}
          className="px-6 py-3.5 bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-black text-xs md:text-sm rounded-xl transition-all shadow-lg shadow-rose-900/40 shrink-0 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <span>🛡️</span>
          <span>손실 점수 방어 14P 리포트 열기</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
};
