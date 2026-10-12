import React, { useState } from 'react';
import { MembershipTier, TIER_INFO } from '../../utils/featureGate';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier?: MembershipTier;
  onSelectTier: (tier: MembershipTier) => void;
  triggerReason?: string;
  initialTier?: MembershipTier;
  // 단일 등급만 표시 (예: 습관교정 게이트에서는 정기결제만 노출)
  onlyTier?: MembershipTier;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  currentTier = 'free',
  onSelectTier,
  triggerReason,
  initialTier,
  onlyTier
}) => {
  const [selectedTier, setSelectedTier] = useState<MembershipTier>(() => {
    if (onlyTier) return onlyTier;
    if (initialTier) return initialTier;
    if (triggerReason && (triggerReason.includes('1회') || triggerReason.includes('단건'))) return 'pro';
    return 'premium'; // 기본값은 항상 정기결제(월 19,900원) 추천
  });
  const [isProcessing, setIsProcessing] = useState(false);

  React.useEffect(() => {
    if (onlyTier) {
      setSelectedTier(onlyTier);
    } else if (initialTier) {
      setSelectedTier(initialTier);
    } else if (triggerReason && (triggerReason.includes('1회') || triggerReason.includes('단건'))) {
      setSelectedTier('pro');
    } else {
      setSelectedTier('premium');
    }
  }, [isOpen, initialTier, triggerReason, onlyTier]);

  if (!isOpen) return null;

  // onlyTier 지정 시 다른 등급 카드는 숨김 (DOM 유지, 표시만 제외)
  const hideFor = (t: MembershipTier): string => (onlyTier && onlyTier !== t ? ' hidden' : '');

  const handleCheckout = (tier: MembershipTier) => {
    setIsProcessing(true);
    // 모의 결제 완료 처리
    setTimeout(() => {
      setIsProcessing(false);
      onSelectTier(tier);
      alert(`🎉 [${TIER_INFO[tier].name}] 신청 및 결제가 완료되었습니다!`);
      onClose();
    }, 600);
  };

  const handleFreeStart = () => {
    onSelectTier('free');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-800 rounded-3xl max-w-6xl w-full p-6 md:p-8 shadow-2xl relative overflow-hidden max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >

        {/* 닫기 버튼 (스크롤과 무관하게 항상 표시) */}
        <button
          onClick={onClose}
          aria-label="닫기"
          className="fixed top-5 right-5 z-[60] w-10 h-10 flex items-center justify-center rounded-full bg-slate-800/90 hover:bg-slate-700 text-white text-lg font-black shadow-xl border border-slate-600 transition-colors cursor-pointer"
        >
          ✕
        </button>

        {/* 헤더 */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            NBASS 학부모 & 수험생 멤버십 안내
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-3">
            우리 아이 맞춤 학습 처방 리포트 & 지속 케어
          </h2>
          {triggerReason ? (
            <p className="text-xs md:text-sm text-amber-400 mt-2 font-medium bg-amber-500/10 py-1.5 px-4 rounded-xl inline-block border border-amber-500/20">
              🔒 {triggerReason}
            </p>
          ) : (
            <p className="text-xs md:text-sm text-slate-400 mt-2">
              3분 무료 진단부터 1회 리포트, 매주 카톡으로 케어받는 정기구독까지 선택하세요.
            </p>
          )}
        </div>

        {/* 3단계 요금제 카드 그리드 (무료 0원 vs 1회 ₩24,900 vs 정기결제 월 ₩19,900) */}
        <div className={`grid gap-6 mb-8 ${onlyTier ? 'grid-cols-1 max-w-md mx-auto' : 'grid-cols-1 md:grid-cols-3'}`}>

          {/* 1. 무료 회원 (0원) */}
          <div
            onClick={() => setSelectedTier('free')}
            className={`rounded-3xl p-6 border-2 transition-all flex flex-col justify-between cursor-pointer${hideFor('free')} ${
            selectedTier === 'free'
              ? 'bg-slate-800/90 border-emerald-500 shadow-xl shadow-emerald-500/15 scale-[1.01]'
              : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
          }`}>
            <div>
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  FREE
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-emerald-400">무료 회원 (FREE)</h3>
              <p className="text-xs text-slate-400 mt-1.5 min-h-[34px] leading-relaxed">
                3분 뇌-신체 공부 성향 진단 및 12종 케어타입 분류를 즉시 확인합니다.
              </p>

              <div className="mt-4 mb-5 p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
                <div className="text-2xl font-black text-white">
                  0원
                </div>
                <div className="text-[11px] text-slate-400 mt-1">평생 무료 · 카드 등록 불필요</div>
              </div>

              <div className="text-xs font-bold text-slate-200 mb-2">⏱️ 3분 간이 진단</div>
              <div className="text-xs font-bold text-slate-200 mb-3">12종 케어타입 분류 + 1줄 소견 요약</div>

              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
                  <span className="leading-snug">3분 뇌-신체 공부 성향 기본 진단</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
                  <span className="leading-snug">12종 케어타입(정서불안/뇌피로/집중저하 등) 분류</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
                  <span className="leading-snug">핵심 1줄 진단 소견 무료 열람</span>
                </div>
                <div className="flex items-start gap-2 text-slate-500">
                  <span className="font-bold shrink-0 mt-0.5">✗</span>
                  <span className="leading-snug">14P 초정밀 신경인지 리포트북 PDF</span>
                </div>
                <div className="flex items-start gap-2 text-slate-500">
                  <span className="font-bold shrink-0 mt-0.5">✗</span>
                  <span className="leading-snug">카카오톡 주간 안심 알림톡 연동</span>
                </div>
                <div className="flex items-start gap-2 text-slate-500">
                  <span className="font-bold shrink-0 mt-0.5">✗</span>
                  <span className="leading-snug">AI 맞춤 골든타임 시간표 주간 갱신</span>
                </div>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleFreeStart();
              }}
              disabled={isProcessing}
              className="mt-6 w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-white text-xs md:text-sm font-bold rounded-2xl transition-all border border-slate-700 shadow-md cursor-pointer"
            >
              무료 진단 시작하기
            </button>
          </div>

          {/* 2. 1회 리포트 회원 (₩24,900) */}
          <div
            onClick={() => setSelectedTier('pro')}
            className={`rounded-3xl p-6 border-2 transition-all flex flex-col justify-between cursor-pointer${hideFor('pro')} ${
            selectedTier === 'pro'
              ? 'bg-slate-800/90 border-blue-500 shadow-xl shadow-blue-500/15 scale-[1.01]'
              : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
          }`}>
            <div>
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  1회 영구 소장
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-white">1회 리포트 회원</h3>
              <p className="text-xs text-slate-400 mt-1.5 min-h-[34px] leading-relaxed">
                14P 초정밀 전두엽 활성 & 두뇌 케어 솔루션 리포트북 1회 영구 발급 및 평생 소장.
              </p>

              <div className="mt-4 mb-3 p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
                <div className="text-2xl font-black text-white">
                  {TIER_INFO.pro.price}
                  <span className="text-xs font-normal text-slate-400 ml-1.5">/ 1회 영구 소장</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">책 1권 가격 · 단건 결제</div>
              </div>

              <div className="mb-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-300 font-bold leading-relaxed">
                🎁 정기결제 전환 시 5,000원 즉시 할인 (첫 달 14,900원)
              </div>

              <div className="text-xs font-bold text-slate-200 mb-1">📄 14P 정밀 솔루션 리포트북 PDF</div>
              <div className="text-xs font-bold text-slate-200 mb-3">전두엽 활성도 & 작업기억 상세표</div>

              <div className="space-y-2.5 text-xs text-slate-300">
                {TIER_INFO.pro.highlightFeatures.map((feat, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-blue-400 font-bold shrink-0 mt-0.5">✓</span>
                    <span className="leading-snug">{feat}</span>
                  </div>
                ))}
                <div className="flex items-start gap-2 text-slate-500">
                  <span className="font-bold shrink-0 mt-0.5">✗</span>
                  <span className="leading-snug">매주 일요일 카톡 주간 브리핑</span>
                </div>
                <div className="flex items-start gap-2 text-slate-500">
                  <span className="font-bold shrink-0 mt-0.5">✗</span>
                  <span className="leading-snug">목표 대학 시뮬레이션 상시 갱신</span>
                </div>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCheckout('pro');
              }}
              disabled={isProcessing}
              className="mt-6 w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-white text-xs md:text-sm font-bold rounded-2xl transition-all border border-slate-700 shadow-md cursor-pointer"
            >
              {TIER_INFO.pro.ctaText}
            </button>
          </div>

          {/* 3. 정기결제 회원 (월 ₩19,900 - 강력 추천) */}
          <div
            onClick={() => setSelectedTier('premium')}
            className={`rounded-3xl p-6 border-2 transition-all flex flex-col justify-between relative cursor-pointer${hideFor('premium')} ${
            selectedTier === 'premium'
              ? 'bg-gradient-to-b from-indigo-950/80 via-slate-900 to-slate-950 border-indigo-500 shadow-2xl shadow-indigo-500/25 scale-[1.02]'
              : 'bg-slate-950/80 border-indigo-900/50 hover:border-indigo-600/50'
          }`}>
            {/* 상단 강력 추천 뱃지 */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 via-indigo-500 to-purple-600 text-white text-[11px] font-black px-4 py-1 rounded-full shadow-lg whitespace-nowrap flex items-center gap-1.5">
              <span>🔥 학부모 87% 선택 / 강력 추천</span>
            </div>

            <div>
              <div className="flex justify-between items-start mb-3 mt-1">
                <span className="text-xs font-black px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  주간 안심 케어
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                <span>정기결제 회원 (주간 케어)</span>
              </h3>
              <p className="text-xs text-slate-300 mt-1.5 min-h-[34px] leading-relaxed">
                매주 엄마 카톡 브리핑 + AI 골든타임 시간표 + 14P 리포트북 상시 무료.
              </p>

              <div className="mt-4 mb-3 p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30">
                {currentTier === 'pro' ? (
                  <div>
                    <div className="flex items-baseline justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-amber-400">첫 달 ₩14,900</span>
                        <span className="text-xs text-slate-500 line-through">₩19,900</span>
                      </div>
                      <span className="text-[10px] text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        5,000원 즉시 할인
                      </span>
                    </div>
                    <div className="text-[11px] text-amber-200 mt-1">
                      ⚡ 1회 리포트 결제 감사: 첫 달 ₩14,900 (2회차부터 월 ₩19,900 정기결제)
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-baseline gap-2">
                      <div className="text-2xl font-black text-indigo-400">
                        {TIER_INFO.premium.price}
                      </div>
                    </div>
                    <div className="text-[11px] text-amber-300 font-bold mt-1">
                      하루 660원꼴 · 14P 리포트북 상시 무료 포함
                    </div>
                  </div>
                )}
              </div>

              <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200 font-bold leading-relaxed">
                ⚡ 1회 리포트 구매자: 5,000원 즉시 차감 → 첫 달 ₩14,900 (2회차부터 ₩19,900)
              </div>

              <div className="text-xs font-bold text-slate-200 mb-1">💎 매주 카톡 주간 알림톡 + AI 시간표</div>
              <div className="text-xs font-bold text-slate-200 mb-3">성적 시뮬레이션 & 1:1 오답 클리닉</div>

              {/* 정기결제만의 독점 혜택 리스트 */}
              <div className="space-y-2.5 text-xs text-slate-200">
                {TIER_INFO.premium.highlightFeatures.map((feat, i) => (
                  <div key={i} className="flex items-start gap-2 font-medium">
                    <span className="text-indigo-400 font-black shrink-0 mt-0.5">✓</span>
                    <span className="leading-snug">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCheckout('premium');
              }}
              disabled={isProcessing}
              className="mt-6 w-full py-3.5 bg-gradient-to-r from-amber-500 via-indigo-600 to-purple-600 hover:from-amber-400 hover:to-indigo-500 text-white text-xs md:text-sm font-extrabold rounded-2xl transition-all shadow-xl shadow-indigo-900/40 cursor-pointer"
            >
              {currentTier === 'pro'
                ? '⭐ 5,000원 할인받고 첫 달 ₩14,900원에 시작하기 →'
                : TIER_INFO.premium.ctaText}
            </button>
          </div>

        </div>

        {/* 📋 멤버십 등급별 기능 및 권한 한눈에 비교 테이블 (단독 표시 모드에서는 생략) */}
        {!onlyTier && (
        <div className="bg-slate-950/70 border border-slate-800 rounded-3xl p-6 md:p-8 mb-8 shadow-xl">
          <div className="flex items-center gap-2.5 mb-6">
            <span className="text-xl">📋</span>
            <h3 className="text-base md:text-lg font-extrabold text-white">
              멤버십 등급별 기능 및 권한 한눈에 비교
            </h3>
          </div>

          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse min-w-[640px]">
              <thead>
                <tr className="border-b border-slate-800 text-xs">
                  <th className="py-3.5 px-4 font-bold text-slate-400 w-[40%]">주요 제공 기능 & 혜택</th>
                  <th className="py-3.5 px-4 font-extrabold text-center text-emerald-400 w-[20%]">
                    <div>무료 회원</div>
                    <div className="text-[10px] font-normal text-emerald-300 mt-0.5">FREE (₩0)</div>
                  </th>
                  <th className="py-3.5 px-4 font-extrabold text-center text-blue-400 w-[20%]">
                    <div>1회 리포트 회원</div>
                    <div className="text-[10px] font-bold text-blue-300 mt-0.5">단건 ₩24,900</div>
                  </th>
                  <th className="py-3.5 px-4 font-extrabold text-center text-indigo-300 bg-indigo-950/40 rounded-t-2xl border-t border-x border-indigo-500/20 w-[20%]">
                    <div>정기결제 회원</div>
                    <div className="text-[10px] font-bold text-amber-300 mt-0.5">월 ₩19,900 (추천)</div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-xs">
                {/* 1. 3분 뇌-신체 성향 간이 진단 */}
                <tr className="hover:bg-slate-800/20 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-slate-200 flex items-center gap-2">
                    <span>🌱</span>
                    <span>3분 뇌-신체 성향 간이 진단</span>
                  </td>
                  <td className="py-3.5 px-4 text-center text-cyan-400 font-bold text-base">✓</td>
                  <td className="py-3.5 px-4 text-center text-cyan-400 font-bold text-base">✓</td>
                  <td className="py-3.5 px-4 text-center text-cyan-400 font-bold text-base bg-indigo-950/20 border-x border-indigo-500/10">✓</td>
                </tr>

                {/* 2. 12종 케어타입 분류 & 1줄 소견 */}
                <tr className="hover:bg-slate-800/20 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-slate-200 flex items-center gap-2">
                    <span>🎯</span>
                    <span>12종 케어타입 분류 & 1줄 소견</span>
                  </td>
                  <td className="py-3.5 px-4 text-center text-cyan-400 font-bold text-base">✓</td>
                  <td className="py-3.5 px-4 text-center text-cyan-400 font-bold text-base">✓</td>
                  <td className="py-3.5 px-4 text-center text-cyan-400 font-bold text-base bg-indigo-950/20 border-x border-indigo-500/10">✓</td>
                </tr>

                {/* 3. 14P 초정밀 신경인지 솔루션 리포트북 PDF */}
                <tr className="hover:bg-slate-800/20 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-slate-200 flex items-center gap-2">
                    <span>📄</span>
                    <span>14P 초정밀 신경인지 솔루션 리포트북 PDF</span>
                  </td>
                  <td className="py-3.5 px-4 text-center text-slate-600 font-bold text-base">—</td>
                  <td className="py-3.5 px-4 text-center text-blue-300 font-bold text-xs">1회 영구 소장</td>
                  <td className="py-3.5 px-4 text-center text-amber-300 font-bold text-xs bg-indigo-950/20 border-x border-indigo-500/10">상시 무료 포함</td>
                </tr>

                {/* 4. 전두엽 활성도 & 작업기억(Memory) 인지 분석 */}
                <tr className="hover:bg-slate-800/20 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-slate-200 flex items-center gap-2">
                    <span>🧠</span>
                    <span>전두엽 활성도 & 작업기억(Memory) 인지 분석</span>
                  </td>
                  <td className="py-3.5 px-4 text-center text-slate-600 font-bold text-base">—</td>
                  <td className="py-3.5 px-4 text-center text-cyan-400 font-bold text-base">✓</td>
                  <td className="py-3.5 px-4 text-center text-cyan-400 font-bold text-base bg-indigo-950/20 border-x border-indigo-500/10">✓</td>
                </tr>

                {/* 5. 매주 일요일 밤 엄마 전용 "카카오톡 주간 브리핑" */}
                <tr className="hover:bg-slate-800/20 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-slate-200 flex items-center gap-2">
                    <span>📱</span>
                    <span>매주 일요일 밤 엄마 전용 "카카오톡 주간 브리핑"</span>
                  </td>
                  <td className="py-3.5 px-4 text-center text-slate-600 font-bold text-base">—</td>
                  <td className="py-3.5 px-4 text-center text-slate-600 font-bold text-base">—</td>
                  <td className="py-3.5 px-4 text-center text-amber-300 font-black text-xs md:text-sm bg-indigo-950/20 border-x border-indigo-500/10">✓ 무제한</td>
                </tr>

                {/* 6. 매주 월요일 아침 "AI 맞춤 시간표" 자동 갱신 */}
                <tr className="hover:bg-slate-800/20 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-slate-200 flex items-center gap-2">
                    <span>📅</span>
                    <span>매주 월요일 아침 "AI 맞춤 시간표" 자동 갱신</span>
                  </td>
                  <td className="py-3.5 px-4 text-center text-slate-600 font-bold text-base">—</td>
                  <td className="py-3.5 px-4 text-center text-slate-600 font-bold text-base">—</td>
                  <td className="py-3.5 px-4 text-center text-amber-300 font-black text-xs md:text-sm bg-indigo-950/20 border-x border-indigo-500/10">✓ 무제한</td>
                </tr>

                {/* 7. 성적 추이 & 목표 대학 합격 시뮬레이션 */}
                <tr className="hover:bg-slate-800/20 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-slate-200 flex items-center gap-2">
                    <span>📈</span>
                    <span>성적 추이 & 목표 대학 합격 시뮬레이션</span>
                  </td>
                  <td className="py-3.5 px-4 text-center text-slate-600 font-bold text-base">—</td>
                  <td className="py-3.5 px-4 text-center text-slate-600 font-bold text-base">—</td>
                  <td className="py-3.5 px-4 text-center text-amber-300 font-black text-xs md:text-sm bg-indigo-950/20 border-x border-indigo-500/10">✓ 무제한</td>
                </tr>

                {/* 8. 1:1 실시간 AI 수험생 학습 클리닉 & 오답 처방 */}
                <tr className="hover:bg-slate-800/20 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-slate-200 flex items-center gap-2">
                    <span>🤖</span>
                    <span>1:1 실시간 AI 수험생 학습 클리닉 & 오답 처방</span>
                  </td>
                  <td className="py-3.5 px-4 text-center text-slate-600 font-bold text-base">—</td>
                  <td className="py-3.5 px-4 text-center text-slate-600 font-bold text-base">—</td>
                  <td className="py-3.5 px-4 text-center text-amber-300 font-black text-xs md:text-sm bg-indigo-950/20 border-x border-indigo-500/10">✓ 무제한</td>
                </tr>

                {/* 9. 수험생 1:1 맞춤 영양 가이드 & 미주신경 이완 루틴 */}
                <tr className="hover:bg-slate-800/20 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-slate-200 flex items-center gap-2">
                    <span>💊</span>
                    <span>수험생 1:1 맞춤 영양 가이드 & 미주신경 이완 루틴</span>
                  </td>
                  <td className="py-3.5 px-4 text-center text-slate-600 font-bold text-base">—</td>
                  <td className="py-3.5 px-4 text-center text-cyan-400 font-bold text-xs">1회분</td>
                  <td className="py-3.5 px-4 text-center text-amber-300 font-black text-xs md:text-sm bg-indigo-950/20 border-x border-indigo-500/10">상시 갱신</td>
                </tr>

                {/* 10. 서카디안 수면 관리 & D-Day 멘탈 케어 */}
                <tr className="hover:bg-slate-800/20 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-slate-200 flex items-center gap-2">
                    <span>🌙</span>
                    <span>서카디안 수면 관리 & D-Day 멘탈 케어</span>
                  </td>
                  <td className="py-3.5 px-4 text-center text-slate-600 font-bold text-base">—</td>
                  <td className="py-3.5 px-4 text-center text-slate-600 font-bold text-base">—</td>
                  <td className="py-3.5 px-4 text-center text-amber-300 font-black text-xs md:text-sm bg-indigo-950/20 border-x border-b border-indigo-500/10 rounded-b-2xl">✓ 무제한</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        )}
        <div className="pt-4 border-t border-slate-800 space-y-2 text-xs text-slate-500">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2">
            <span>🔒 토스페이먼츠 안전 암호화 결제 & 언제든 마이페이지에서 클릭 한 번으로 해지 가능</span>
            <span>고객지원: support@nbass.io</span>
          </div>
          <div className="text-[10px] text-slate-500 text-center md:text-left">
            ※ NBASS는 인지과학·학습과학 기반의 교육 보조 솔루션이며 의료법상의 의료기관 진료나 질병의 예방·치료, 의학적 처방을 대신하지 않습니다.
          </div>
        </div>

      </div>
    </div>
  );
};
