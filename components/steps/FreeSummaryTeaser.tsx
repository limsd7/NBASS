import React, { useState } from 'react';
import { CareType, AssessmentResult } from '../../types';
import { MembershipTier, TIER_INFO } from '../../utils/featureGate';
import { SubscriptionModal } from '../modals/SubscriptionModal';

interface FreeSummaryTeaserProps {
  result: AssessmentResult;
  userTier?: MembershipTier;
  onUpgradeTier?: (tier: MembershipTier) => void;
}

export const FreeSummaryTeaser: React.FC<FreeSummaryTeaserProps> = ({
  result,
  userTier = 'free',
  onUpgradeTier
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalReason, setModalReason] = useState<string>('');

  const isFree = userTier === 'free';

  const handleOpenUpgrade = (reason: string) => {
    setModalReason(reason);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 my-6">
      {/* 1. FREE 공개 영역: 3분 뇌-신체 성향 분류 + 1줄 요약 */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-900 border-2 border-indigo-500/40 rounded-3xl p-6 md:p-8 shadow-2xl text-white relative overflow-hidden">
        
        {/* Top Badge */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              무료 진단 분석 완료
            </span>
            <span className="text-xs text-slate-400">수험생: {result.student.name} ({result.student.grade})</span>
          </div>
          
          <div className="text-xs font-bold text-indigo-300 bg-indigo-500/10 px-3 py-1 rounded-xl border border-indigo-500/20">
            신뢰도 89.4% (뇌파·자율신경 통합 인덱스)
          </div>
        </div>

        {/* Diagnosis Header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">주요 학습 성향 유형 (CareType)</span>
            <h2 className="text-2xl md:text-4xl font-black text-white mt-1 mb-3 flex items-center gap-3">
              <span className="text-indigo-400">[{result.careType}]</span>
              <span className="text-lg md:text-xl text-slate-300 font-medium">유형으로 판정되었습니다.</span>
            </h2>
            
            {/* 1줄 요약 진단 */}
            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1 mb-1">
                💡 뇌-신체 핵심 상태 요약
              </span>
              <p className="text-sm text-slate-200 leading-relaxed font-medium">
                {result.careType === CareType.ANXIETY && "자율신경계 교감신경 긴장도가 높아 시험 직전 불안과 집중력 기복이 발생하는 상태입니다."}
                {result.careType === CareType.BURNOUT && "학습 피로도가 누적되어 전두엽 에너지 소모가 크며, 뇌 피로 회복 루틴이 시급합니다."}
                {result.careType === CareType.MOTIVATION && "신경 전달 물질의 활성도가 낮아 학습 착수 시 저항감이 크고 동기 부여 자극이 필요합니다."}
                {result.careType === CareType.ENVIRONMENT && "외부 소음 및 수면 환경에 뇌파 리듬이 쉽게 흔들려 집중 환경 교정이 우선입니다."}
                {result.careType === CareType.IMMERSION && "작업기억 및 집중 유지 지속시간이 짧아 골든타임 25분 몰입 스케줄 적용이 필요합니다."}
                {![CareType.ANXIETY, CareType.BURNOUT, CareType.MOTIVATION, CareType.ENVIRONMENT, CareType.IMMERSION].includes(result.careType) &&
                  "학습 환경 및 생체 리듬의 불균형으로 인해 잠재력 대비 공부 효율이 저하되어 있는 상태입니다."}
              </p>
            </div>
          </div>

          {/* Quick Score Circle */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-6 text-center flex flex-col items-center justify-center">
            <span className="text-xs text-slate-400 font-bold mb-1">생체-인지 건강 지수</span>
            <div className="text-4xl font-black text-indigo-400">{result.score || 72}<span className="text-base text-slate-500">/100</span></div>
            <span className="text-xs text-emerald-400 mt-2 font-medium">
              {result.scoreLevel || 'Care Required'}
            </span>
          </div>
        </div>

      </div>

      {/* 2. FREE 사용자 대상 블러(Blur) & 업셀 잠금 영역 */}
      {isFree && (
        <div className="relative rounded-3xl border-2 border-dashed border-indigo-500/40 p-6 md:p-8 bg-slate-950 overflow-hidden shadow-2xl">
          
          {/* Blur Background Content Preview */}
          <div className="filter blur-md select-none pointer-events-none opacity-40 space-y-6">
            <div className="h-6 w-1/3 bg-slate-700 rounded-md"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-28 bg-slate-800 rounded-2xl"></div>
              <div className="h-28 bg-slate-800 rounded-2xl"></div>
            </div>
            <div className="h-4 bg-slate-700 rounded w-full"></div>
            <div className="h-4 bg-slate-700 rounded w-5/6"></div>
            <div className="h-4 bg-slate-700 rounded w-4/6"></div>
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="h-32 bg-slate-800 rounded-2xl"></div>
              <div className="h-32 bg-slate-800 rounded-2xl"></div>
              <div className="h-32 bg-slate-800 rounded-2xl"></div>
            </div>
          </div>

          {/* Locked Paywall Overlay Box */}
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center bg-slate-950/75 backdrop-blur-sm">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-2xl mb-3 shadow-lg shadow-indigo-500/20">
              🔒
            </div>
            
            <h3 className="text-xl md:text-2xl font-black text-white">
              구체적인 맞춤 처방 & 공부 솔루션이 잠겨 있습니다
            </h3>
            
            <p className="text-xs md:text-sm text-slate-300 max-w-lg mt-2 mb-6 leading-relaxed">
              취약 과목 골든타임 시간표, 영양/수면 처방, 뇌파·인지 상세 리포트를 확인하고 성적 향상 루틴을 시작하세요.
            </p>

            {/* Direct 2-Button Action Bar (Anchor Strategy) */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
              
              {/* Option 1: 1회 스타터 패스 ₩9,000 */}
              <button
                onClick={() => handleOpenUpgrade('1회 학생용 정밀 리포트 열람')}
                className="w-full sm:w-1/2 py-3.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs md:text-sm rounded-2xl transition-all shadow-lg shadow-blue-900/30 flex flex-col items-center justify-center"
              >
                <span>1회 리포트만 열기</span>
                <span className="text-[11px] font-normal text-blue-200">₩9,000원 (1회성)</span>
              </button>

              {/* Option 2: PREMIUM 정기구독 ₩9,900 + 카톡 알림 */}
              <button
                onClick={() => handleOpenUpgrade('전문가 심층 리포트 + 카톡 주간 알림 구독')}
                className="w-full sm:w-1/2 py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs md:text-sm rounded-2xl transition-all shadow-xl shadow-indigo-900/40 flex flex-col items-center justify-center border border-indigo-400/40 relative overflow-hidden"
              >
                <span className="flex items-center gap-1">
                  <span>💎 정기 케어 구독</span>
                </span>
                <span className="text-[11px] font-medium text-indigo-200">
                  월 ₩9,900 + 🔔카톡 알림
                </span>
              </button>

            </div>

            <p className="text-[11px] text-slate-400 mt-4">
              💡 1회권(9,000원)에 단 900원만 더하면 매주 카톡 알림과 무제한 전문가 리포트가 제공됩니다.
            </p>

          </div>

        </div>
      )}

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentTier={userTier}
        onSelectTier={(tier) => {
          if (onUpgradeTier) onUpgradeTier(tier);
        }}
        triggerReason={modalReason}
      />
    </div>
  );
};
