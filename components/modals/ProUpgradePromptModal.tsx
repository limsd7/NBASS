import React from 'react';

interface ProUpgradePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewPreviousResults: () => void;
  onUpgradeToPremium: () => void;
  onStartFollowup?: () => void;
  studentName?: string;
  completedDate?: string;
  membershipTier?: string;
}

export const ProUpgradePromptModal: React.FC<ProUpgradePromptModalProps> = ({
  isOpen,
  onClose,
  onViewPreviousResults,
  onUpgradeToPremium,
  onStartFollowup,
  studentName,
  completedDate,
  membershipTier,
}) => {
  if (!isOpen) return null;

  const tier = (membershipTier || 'pro').toLowerCase();
  const isPremiumOrAbove = ['premium', 'expert'].includes(tier);

  // 2주(14일) 경과 계산
  const { diffDays, isTwoWeeksPassed, daysRemaining, effectiveDateStr } = React.useMemo(() => {
    let diff = 3;
    let passed = false;
    let rem = 11;
    let dateStr = completedDate;

    if (!dateStr && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('nbass_assessment_result');
        if (stored) {
          const parsed = JSON.parse(stored);
          dateStr = parsed.date || parsed.createdAt;
        }
      } catch {
        /* ignore */
      }
    }

    if (!dateStr && (studentName?.toLowerCase() === 'limsd7' || studentName === '임선동')) {
      dateStr = '2026-09-22';
    }

    if (dateStr) {
      const tDate = new Date(dateStr);
      if (!isNaN(tDate.getTime())) {
        const now = new Date();
        diff = Math.max(0, Math.floor((now.getTime() - tDate.getTime()) / (1000 * 60 * 60 * 24)));
        passed = diff >= 14;
        rem = Math.max(0, 14 - diff);
      }
    }

    return {
      diffDays: diff,
      isTwoWeeksPassed: passed,
      daysRemaining: rem,
      effectiveDateStr: dateStr || '최근',
    };
  }, [completedDate, studentName]);

  const handleStartFollowupClick = () => {
    if (onStartFollowup) {
      onStartFollowup();
    } else {
      onViewPreviousResults();
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-xl bg-slate-900 border border-indigo-500/30 rounded-3xl shadow-2xl overflow-hidden transform transition-all animate-scale-up text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 상단 비주얼 헤더 */}
        <div
          className={`relative p-6 pb-5 text-white overflow-hidden ${
            !isPremiumOrAbove
              ? 'bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-700'
              : isTwoWeeksPassed
              ? 'bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700'
              : 'bg-gradient-to-br from-indigo-600 via-purple-600 to-slate-800'
          }`}
        >
          <div className="absolute top-0 right-0 -mt-6 -mr-6 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-6 -ml-6 w-32 h-32 bg-amber-400/20 rounded-full blur-xl pointer-events-none" />

          {/* 닫기 버튼 */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/25 hover:bg-black/40 rounded-full p-2 transition-all cursor-pointer"
            aria-label="닫기"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* 등급별 / 2주 경과별 헤더 배지 */}
          {!isPremiumOrAbove ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-black text-amber-200 mb-2.5 border border-white/25">
              <span>⚡</span>
              <span>PRO 1회 스타터 패스 검사 완료</span>
            </div>
          ) : !isTwoWeeksPassed ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-black text-cyan-200 mb-2.5 border border-white/25">
              <span>✨</span>
              <span>{tier.toUpperCase()} 프리미엄 정기 케어 회원</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/30 backdrop-blur-md text-xs font-black text-emerald-200 mb-2.5 border border-emerald-400/40">
              <span>🔔</span>
              <span>{tier.toUpperCase()} 2주 정기 추적 검사 주기 도래</span>
            </div>
          )}

          {/* 헤더 제목 */}
          <h3 className="text-xl md:text-2xl font-black tracking-tight leading-snug">
            {!isPremiumOrAbove ? (
              `${studentName ? `${studentName} 님은` : '회원님은'} 이미 1회 정밀검사를 완료하셨습니다`
            ) : !isTwoWeeksPassed ? (
              `${studentName ? `${studentName} 님,` : '회원님,'} 다음 2주 정기검사까지 D-${daysRemaining}일 남았습니다`
            ) : (
              `${studentName ? `${studentName} 님,` : '회원님,'} 2주 정기 추적 검사를 시행할 시간입니다!`
            )}
          </h3>

          {/* 헤더 설명 */}
          <p className="mt-1.5 text-xs md:text-sm text-indigo-100/90 font-medium leading-relaxed">
            {!isPremiumOrAbove ? (
              <>
                1회 정밀 리포트(₩24,900) 진단 결과가 안전하게 영구 보관되어 있습니다.
                {effectiveDateStr && <span className="opacity-80 block text-xs mt-0.5">최근 시행일: {effectiveDateStr}</span>}
              </>
            ) : !isTwoWeeksPassed ? (
              <>
                첫 검사({effectiveDateStr})로부터 {diffDays}일이 경과하였습니다. 2주(14일) 주기로 검사를 시행할 때 뇌·신체 바이오마커 변화가 가장 정확하게 분석됩니다.
              </>
            ) : (
              <>
                첫 검사({effectiveDateStr})로부터 {diffDays}일이 경과하여 새로운 2주 바이오마커 추적 검사가 준비되었습니다.
              </>
            )}
          </p>
        </div>

        {/* 본문 영역 */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {!isPremiumOrAbove ? (
            /* ========================================================
               [옵션 1: FREE / 1회 리포트 회원]
               -> 정기결제 회원 혜택 상세 나열 & 전환 결제 옵션
               ======================================================== */
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2.5">
                <span className="text-xs font-black text-amber-400 tracking-wider uppercase flex items-center gap-1.5">
                  <span>⭐</span>
                  <span>정기결제 회원 전용 핵심 안심 혜택</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-sm">
                  <span>🎁 1회 결제 고객 5,000원 공제: 첫 달 14,900원 (이후 19,900원)</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* 혜택 1 */}
                <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-indigo-500/40 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">⚡</span>
                    <h4 className="text-xs font-bold text-white">추가 정기검사 & 2주 추적</h4>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    2주 타겟 추적 검사(Targeted Follow-up) 및 취약 과목 정밀 재진단을 무제한 시행하여 성적 향상 추이를 지속 모니터링
                  </p>
                </div>

                {/* 혜택 2 */}
                <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-indigo-500/40 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">📋</span>
                    <h4 className="text-xs font-bold text-white">1일 맞춤 To-Do 플래너 & 보고서</h4>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    아침/점심/저녁 루틴, 공부 전/중 집중 전략, 영양제 복용, 멘탈 케어 독립 체크박스 & 원클릭 To-Do 복사기 연동 및 종합 심층 보고서 제안
                  </p>
                </div>

                {/* 혜택 3 */}
                <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-indigo-500/40 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">📊</span>
                    <h4 className="text-xs font-bold text-white">성적 관리 & 학업 성취도 추이 분석</h4>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    모의고사 실전 성적 시뮬레이션, 수능 과목별 취약점 심층 상관분석 및 학업 성취도 & 성적 추이 연동 분석
                  </p>
                </div>

                {/* 혜택 4 */}
                <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-indigo-500/40 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">💊</span>
                    <h4 className="text-xs font-bold text-white">3-Tier 정밀 맞춤 영양 처방</h4>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    뇌 혈류 개선(엔오카디 징코), 신경 안정(글리시네이트 마그네슘), 각성 몰입(스마트 커피 부스터) 1:1 복용 가이드
                  </p>
                </div>

                {/* 혜택 5 */}
                <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-indigo-500/40 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">🔔</span>
                    <h4 className="text-xs font-bold text-white">카카오톡 주간 알림톡</h4>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    수험생의 주간 바이오리듬, 학습 진행률 및 달성도를 학부모 안심 케어 카카오톡 알림톡으로 자동 정기 발송
                  </p>
                </div>

                {/* 혜택 6 */}
                <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-indigo-500/40 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">📄</span>
                    <h4 className="text-xs font-bold text-white">14P 신경인지 솔루션 리포트북</h4>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    신경인지 6단계 종합 솔루션 리포트북 영구 보관 & 고화질 PDF 무제한 인쇄 및 열람
                  </p>
                </div>
              </div>
            </div>
          ) : !isTwoWeeksPassed ? (
            /* ========================================================
               [옵션 2-A: PREMIUM 이상 & 2주 이전 (2주 미경과)]
               -> 이전 검사결과 확인 중심 + 조기 재검사 옵션
               ======================================================== */
            <div className="space-y-3.5">
              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30">
                <div className="flex items-center gap-2 font-black text-indigo-300 text-sm mb-2">
                  <span>📅</span>
                  <span>2주 정기 추적 주기 (Follow-up Period) 안내</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  현재는 이전 검사결과 기반으로 제안된 맞춤 학습법, 수면 최적화, 영양 수칙을 일상에서 실천하는 집중 학습 주기입니다.
                  <br />
                  이전 리포트를 열람하여 To-Do 체크리스트와 처방 가이드를 확인해 보세요.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">📋</span>
                    <h4 className="text-xs font-bold text-white">맞춤 To-Do 루틴 실천</h4>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    아침/점심/저녁 루틴 및 과목별 취약 시간대 집중력 전략을 체크하며 체력을 안배하세요.
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">🎯</span>
                    <h4 className="text-xs font-bold text-white">D-{daysRemaining}일 후 바이오마커 재측정</h4>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    14일 주기로 재검사할 때 뇌 혈류와 자율신경 회복 추이가 가장 유의미하게 분석됩니다.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* ========================================================
               [옵션 2-B: PREMIUM 이상 & 2주 이후 (2주 경과)]
               -> 2주 정기검사 시행하기 (강조) 및 이전 결과보기
               ======================================================== */
            <div className="space-y-3.5">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                <div className="flex items-center gap-2 font-black text-emerald-300 text-sm mb-2">
                  <span>🎯</span>
                  <span>정기 추적 검사 (Targeted Follow-up) 효과</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  2주간의 학습 루틴 실천 후 신경인지 피로도와 자율신경 균형 상태가 어떻게 변화했는지 비교 분석합니다.
                  <br />
                  추적 검사를 완료하시면 이전 회차와의 종단적 성적·집중력 향상 비교 리포트가 자동 생성됩니다.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">📈</span>
                    <h4 className="text-xs font-bold text-white">종단적 변화 추이 분석</h4>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    1회차 대비 집중 유지 시간, 뇌 피로 회복도, 자율신경 안정화 지표를 직접 비교합니다.
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">⚡</span>
                    <h4 className="text-xs font-bold text-white">빠른 설문 & 간편 검사</h4>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    기존 기본 정보를 유지한 상태에서 2주간의 변화된 핵심 항목만 빠르게 재진단합니다.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 선택 버튼 영역: 등급 및 2주 경과 여부에 따라 분기 */}
          <div className="pt-2 space-y-2.5">
            {!isPremiumOrAbove ? (
              /* [FREE / PRO 등급 전용 버튼] */
              <>
                {/* 1. 정기결제 전환 버튼 */}
                <button
                  type="button"
                  onClick={onUpgradeToPremium}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white font-black text-sm md:text-base shadow-lg shadow-orange-500/30 transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <span>🎁</span>
                    <span>5,000원 할인받고 첫 달 ₩14,900원에 시작하기</span>
                  </span>
                  <span className="text-xs opacity-90 font-normal">(2회차부터 월 ₩19,900) →</span>
                </button>

                {/* 2. 업그레이드 없이 이전 검사결과 보기 버튼 */}
                <button
                  type="button"
                  onClick={onViewPreviousResults}
                  className="w-full py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-200 font-bold text-sm border border-white/15 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                >
                  <span>📋</span>
                  <span>업그레이드 없이 이전 검사결과 보기</span>
                  <span>→</span>
                </button>
              </>
            ) : !isTwoWeeksPassed ? (
              /* [PREMIUM 이상 & 2주 이전 전용 버튼] */
              <>
                {/* 1. 이전 검사결과 보기 (메인 버튼) */}
                <button
                  type="button"
                  onClick={onViewPreviousResults}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-black text-sm md:text-base shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                >
                  <span>📋</span>
                  <span>이전 검사결과 보기</span>
                  <span>→</span>
                </button>

                {/* 2. 2주 전이지만 조기 정기검사 시행하기 (보조 버튼) */}
                <button
                  type="button"
                  onClick={handleStartFollowupClick}
                  className="w-full py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-indigo-200 font-bold text-sm border border-indigo-400/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                >
                  <span>⚡</span>
                  <span>2주 전이지만 정기 추적 검사 조기 시행하기</span>
                  <span>→</span>
                </button>
              </>
            ) : (
              /* [PREMIUM 이상 & 2주 이후 전용 버튼] */
              <>
                {/* 1. 2주 정기검사 시행하기 (메인 강조 버튼) */}
                <button
                  type="button"
                  onClick={handleStartFollowupClick}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm md:text-base shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                >
                  <span>⚡</span>
                  <span>2주 정기검사 시행하기</span>
                  <span>→</span>
                </button>

                {/* 2. 이전 검사결과 보기 (보조 버튼) */}
                <button
                  type="button"
                  onClick={onViewPreviousResults}
                  className="w-full py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-200 font-bold text-sm border border-white/15 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                >
                  <span>📋</span>
                  <span>이전 검사결과 보기</span>
                  <span>→</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* 하단 푸터 안내 */}
        <div className="px-6 py-2.5 bg-black/40 border-t border-white/10 text-center space-y-1">
          <p className="text-[11px] text-slate-400">
            검사 결과는 안전하게 보관되어 있으며 언제든 대시보드와 진단 보고서에서 열람하실 수 있습니다.
          </p>
          <p className="text-[10px] text-slate-500">
            ※ NBASS는 인지과학·학습심리 기반 자기주도 학습 솔루션이며 의료법상 의료행위가 아닙니다.
          </p>
        </div>
      </div>
    </div>
  );
};
