import React from 'react';
import { SleepRecord } from '../../types';

interface MemoryConsolidationCardProps {
  latestRecord?: SleepRecord;
}

export const MemoryConsolidationCard: React.FC<MemoryConsolidationCardProps> = ({ latestRecord }) => {
  const deepRatio = latestRecord?.stages?.deep ?? 20;
  const remRatio = latestRecord?.stages?.rem ?? 22;
  const lightRatio = latestRecord?.stages?.light ?? 58;

  // Calculate Memory Consolidation Scores
  const mathScienceConsolidation = Math.min(100, Math.round((deepRatio / 22) * 95));
  const languageConsolidation = Math.min(100, Math.round((remRatio / 23) * 95));

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center text-2xl font-bold">
            🧠
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">수면 단계별 기억 고착화 (Memory Consolidation) 분석</h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                뇌과학 연동
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              서파수면(논리·수학)과 렘수면(언어·독해)의 비율에 따른 과목별 장기기억 저장 효율 분석입니다.
            </p>
          </div>
        </div>
      </div>

      {/* Stage Ratio Visual Bar */}
      <div>
        <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
          <span>수면 구조 분포 (어젯밤 실측)</span>
          <span>서파 {deepRatio}% · 렘 {remRatio}% · 얕은수면 {lightRatio}%</span>
        </div>
        <div className="h-4 w-full rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-800">
          <div
            style={{ width: `${deepRatio}%` }}
            className="bg-indigo-600 h-full transition-all"
            title={`서파수면(Deep): ${deepRatio}%`}
          />
          <div
            style={{ width: `${remRatio}%` }}
            className="bg-purple-500 h-full transition-all"
            title={`렘수면(REM): ${remRatio}%`}
          />
          <div
            style={{ width: `${lightRatio}%` }}
            className="bg-slate-300 dark:bg-slate-600 h-full transition-all"
            title={`얕은수면(Light): ${lightRatio}%`}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 mt-1.5">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-600"></span> 서파수면 (목표 20~25%)</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500"></span> 렘수면 (목표 20~25%)</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-400"></span> 얕은수면 (50~55%)</span>
        </div>
      </div>

      {/* 2 Core Memory Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Deep Sleep: Math & Science */}
        <div className="p-5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
              <span>📐</span>
              <span>수학·과학 개념 기억 고착화 지수</span>
            </span>
            <span className="text-base font-black text-indigo-600 dark:text-indigo-400 font-mono">
              {mathScienceConsolidation}%
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            <strong>서파수면(NREM 3단계)</strong> 동안 해마에서 대뇌피질로 <b>수학 공식 및 과학 법칙</b>이 장기기억으로 전이됩니다.
          </p>
          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 text-[11px] text-indigo-700 dark:text-indigo-300 font-medium border border-indigo-100 dark:border-indigo-800/60">
            {mathScienceConsolidation >= 80 ? (
              '✨ 어젯밤 서파수면이 충분하여 오늘 수학 킬러문항 및 과학 심화 문제 풀이에 최적 상태입니다.'
            ) : (
              '⚠️ 서파수면 부족으로 복합 계산 피로도가 발생할 수 있습니다. 킬러문항 풀이 전 15분 파워 낮잠을 권장합니다.'
            )}
          </div>
        </div>

        {/* REM Sleep: Korean & English */}
        <div className="p-5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/50 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
              <span>📖</span>
              <span>국어·영어 언어 이해 및 어휘 통합 지수</span>
            </span>
            <span className="text-base font-black text-purple-600 dark:text-purple-400 font-mono">
              {languageConsolidation}%
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            <strong>렘수면(REM)</strong> 단계에서는 <b>국어 비문학 지문 독해 패턴과 영어 어휘 연상</b>이 뇌 신경망에 통합됩니다.
          </p>
          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 text-[11px] text-purple-700 dark:text-purple-300 font-medium border border-purple-100 dark:border-purple-800/60">
            {languageConsolidation >= 80 ? (
              '✨ 렘수면 비율이 우수하여 국어 비문학 구조 독해 및 영어 빈칸 추론 문제 몰입에 유리합니다.'
            ) : (
              '⚠️ 렘수면이 다소 부족합니다. 장문 독해 시 단락별 키워드를 직접 필기하며 작업기억 부하를 분산시키세요.'
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
