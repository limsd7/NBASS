import React from 'react';
import { UserProfile, MobileAssessmentResult } from '../types';
import { MOCK_ASSESSMENT_RESULT } from '../services/mockData';
import { hasRequiredTier, TIER_NAMES } from '../services/featureGate';
import { LockedCard } from '../components/tiered-features/LockedCard';
import { Activity, Flame, Moon, Sparkles, Brain, ShieldAlert, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface ResultDashboardProps {
  user: UserProfile;
  onUpgradeClick: () => void;
}

export const ResultDashboard: React.FC<ResultDashboardProps> = ({ user, onUpgradeClick }) => {
  const result: MobileAssessmentResult = MOCK_ASSESSMENT_RESULT;
  const isProOrAbove = hasRequiredTier(user.tier, 'pro');
  const isPremiumOrAbove = hasRequiredTier(user.tier, 'premium');

  return (
    <div className="p-4 space-y-4 pb-20 max-w-md mx-auto">
      {/* 1. Student Summary Banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-4 rounded-3xl shadow-sm border border-indigo-800/40 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-indigo-300 font-semibold">{result.student.school} {result.student.grade}</span>
              <span className="text-[10px] bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded-full border border-indigo-400/20">
                {result.examDate} 진단
              </span>
            </div>
            <h2 className="text-xl font-black">{user.name} 님의 정밀 진단 결과</h2>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
          <span className="text-slate-300">현재 회원 등급</span>
          <span className="font-black text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/30">
            {TIER_NAMES[user.tier]}
          </span>
        </div>
      </div>

      {/* 2. Care Type Diagnosis Card */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
            <Brain className="w-4 h-4 text-indigo-600" />
            <span>8대 신경계 케어타입 판정</span>
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${result.careTypeBadgeColor}`}>
            최우선 케어
          </span>
        </div>

        <h3 className="text-base font-black text-slate-900 leading-tight mb-2">
          {result.careTypeName}
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
          {result.careTypeSummary}
        </p>
      </div>

      {/* 3. 5대 생체 & 인지 지표 카드 (FREE는 2개, PRO 이상 전체 5개 개방) */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-emerald-600" />
            <span>두뇌 &amp; 신체 핵심 활력 지표</span>
          </h3>
          {!isProOrAbove && (
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
              PRO에서 5대 지표 전면 개방
            </span>
          )}
        </div>

        <div className="space-y-3">
          {/* 1. 두뇌 활력도 (항상 공개) */}
          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-slate-700">🧠 두뇌 활력도 (Brain Vitality)</span>
              <span className="text-indigo-600">{result.metrics.brainVitality}점 / 100</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all"
                style={{ width: `${result.metrics.brainVitality}%` }}
              />
            </div>
          </div>

          {/* 2. 스트레스 저항도 (항상 공개) */}
          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-slate-700">🛡️ 스트레스 저항도 (Stress Resistance)</span>
              <span className="text-emerald-600">{result.metrics.stressResistance}점 / 100</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-400 to-teal-500 h-full rounded-full transition-all"
                style={{ width: `${result.metrics.stressResistance}%` }}
              />
            </div>
          </div>

          {/* PRO 이상 전용 지표 3개 */}
          {isProOrAbove ? (
            <>
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-700">🎯 집중 유지력 (Focus Capacity)</span>
                  <span className="text-amber-600">{result.metrics.focusCapacity}점 / 100</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-400 to-orange-500 h-full rounded-full"
                    style={{ width: `${result.metrics.focusCapacity}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-700">🌙 수면 회복력 (Sleep Efficiency)</span>
                  <span className="text-blue-600">{result.metrics.sleepEfficiency}점 / 100</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-400 to-indigo-500 h-full rounded-full"
                    style={{ width: `${result.metrics.sleepEfficiency}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-700">⚡ 뇌-신체 조화도 (Brain-Body Coherence)</span>
                  <span className="text-purple-600">{result.metrics.coherence}점 / 100</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-400 to-pink-500 h-full rounded-full"
                    style={{ width: `${result.metrics.coherence}%` }}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="pt-2">
              <LockedCard
                requiredTier="pro"
                featureTitle="집중 유지력 · 수면 회복력 · 뇌신체 조화도 잠금"
                description="PRO 회원으로 업그레이드하시면 디지털 인지 반응속도 및 5대 정밀 신경계 분석 지표를 모두 확인하실 수 있습니다."
                onUpgradeClick={onUpgradeClick}
              />
            </div>
          )}
        </div>
      </div>

      {/* 4. 영역별 세부 권고사항 (Key Advice) */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
        <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>맞춤 솔루션 핵심 가이드</span>
        </h3>

        {/* 1. 학습 전략 */}
        <div className="p-3.5 bg-indigo-50/60 rounded-2xl border border-indigo-100">
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 mb-1">
            <span>📚</span>
            <span>최적 집중 학습 전략</span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            {result.keyAdvice.study}
          </p>
        </div>

        {/* 2. 서카디안 수면 (PRO 이상) */}
        {isProOrAbove ? (
          <div className="p-3.5 bg-blue-50/60 rounded-2xl border border-blue-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 mb-1">
              <span>🌙</span>
              <span>서카디안 생체 시계 &amp; 수면</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {result.keyAdvice.circadian}
            </p>
          </div>
        ) : (
          <div className="p-3 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-center">
            <p className="text-xs text-slate-500 font-medium">
              🔒 서카디안 수면 가이드는 <strong>PRO 회원</strong>부터 제공됩니다.
            </p>
          </div>
        )}

        {/* 3. 스트레스 완화 (PREMIUM 이상) */}
        {isPremiumOrAbove ? (
          <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 mb-1">
              <span>🧘</span>
              <span>자율신경계 이완 &amp; 멘탈 케어</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {result.keyAdvice.stress}
            </p>
          </div>
        ) : (
          <div className="p-3 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-center">
            <p className="text-xs text-slate-500 font-medium">
              🔒 심층 멘탈 이완 솔루션은 <strong>PREMIUM 회원</strong>부터 제공됩니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
