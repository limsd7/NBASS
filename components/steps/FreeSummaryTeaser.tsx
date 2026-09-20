import React, { useState } from 'react';
import { CareType, AssessmentResult, SurveyData } from '../../types';
import { MembershipTier, TIER_INFO } from '../../utils/featureGate';
import { SubscriptionModal } from '../modals/SubscriptionModal';

interface FreeSummaryTeaserProps {
  result: AssessmentResult;
  userTier?: MembershipTier;
  onUpgradeTier?: (tier: MembershipTier) => void;
  onStartAdditionalTest?: () => void;
}

export const FreeSummaryTeaser: React.FC<FreeSummaryTeaserProps> = ({
  result,
  userTier = 'free',
  onUpgradeTier,
  onStartAdditionalTest
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalReason, setModalReason] = useState<string>('');

  const isFree = userTier === 'free';

  const handleOpenUpgrade = (reason: string) => {
    setModalReason(reason);
    setIsModalOpen(true);
  };

  // 5대 공부 효율성 검사 완료 상태 계산
  const { completedCount, remainingCount, isAllCompleted, completedTestNames, remainingTestNames } = React.useMemo(() => {
    const survey = (result.survey || {}) as Partial<SurveyData>;
    const completedList: string[] = [];
    const remainingList: string[] = [];

    if (survey.chronotypeResult || survey.chronotypeScore !== undefined) {
      completedList.push('크로노타입(MEQ)');
    } else {
      remainingList.push('크로노타입(MEQ)');
    }

    if (survey.varkPrimary || survey.varkScores) {
      completedList.push('학습유형(VARK)');
    } else {
      remainingList.push('학습유형(VARK)');
    }

    if (survey.testAnxietyType || survey.testAnxietyCognitive !== undefined) {
      completedList.push('시험불안(TAI)');
    } else {
      remainingList.push('시험불안(TAI)');
    }

    if (survey.digitalAddictionLevel || survey.digitalAddictionScore !== undefined) {
      completedList.push('디지털 밸런스');
    } else {
      remainingList.push('디지털 밸런스');
    }

    if (survey.metacognitionLevel || survey.metacognitionScores) {
      completedList.push('메타인지');
    } else {
      remainingList.push('메타인지');
    }

    const count = completedList.length;
    return {
      completedCount: count,
      remainingCount: Math.max(0, 5 - count),
      isAllCompleted: count >= 5,
      completedTestNames: completedList,
      remainingTestNames: remainingList
    };
  }, [result.survey]);

  return (
    <div className="space-y-6 my-6">
      {/* 1. 10분 무료체험 간편 진단 리포트 공개 영역 */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl text-white relative overflow-hidden">
        
        {/* Top Official Certificate Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              NBASS 공식 간이 진단서
            </span>
            <span className="text-xs text-slate-400 font-medium">수험생: <strong className="text-white">{result.student.name}</strong> ({result.student.grade})</span>
          </div>
          
          <div className="text-[11px] font-mono text-slate-400 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
            Serial: NB-2026-{Math.abs((result.student.name.charCodeAt(0) || 123) * 789).toString().padStart(6, '0')}
          </div>
        </div>

        {/* Diagnosis Header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2 space-y-4">
            <div>
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">주요 학습 스트레스 성향 (CareType)</span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-1 flex items-center gap-2.5">
                <span className="text-blue-400">[{result.careType}]</span>
                <span className="text-base md:text-lg text-slate-300 font-medium">유형으로 판정</span>
              </h2>
              {/* CareType Disclaimer */}
              <div className="mt-3 p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400 leading-relaxed flex items-start gap-2.5">
                <svg className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <span>
                  <strong className="text-slate-300">안내:</strong> 무료체험에 의한 CareType 판단은 간이 문진 기반 약식 결과이며, <b>유료회원에서 시행하는 정밀 다각도 검사(자율신경·신경인지·심리 5대 심층 종합 검사)</b>를 통해 성향 진단 및 맞춤 솔루션이 달라질 수 있습니다.
                </span>
              </div>
            </div>
            
            {/* 1줄 요약 진단 */}
            <div className="p-4 bg-slate-950/90 border border-slate-800 rounded-2xl">
              <div className="text-xs font-bold text-blue-400 flex items-center gap-1.5 mb-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>간이 진단 소견</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                {result.careType === CareType.DEPRESSION_AMOTIVATION && "신경 전달 물질의 활성도가 낮아 학습 착수 시 저항감이 크고 동기 부여 자극이 필요합니다."}
                {result.careType === CareType.HYPERSENSITIVE && "외부 소음 및 수면 환경에 집중 리듬이 쉽게 흔들려 환경 교정이 우선입니다."}
                {result.careType === CareType.ATTENTION_DEFICIT && "작업기억 및 집중 유지 지속시간이 짧아 골든타임 25분 몰입 스케줄 적용이 필요합니다."}
                {result.careType === CareType.BRAIN_FATIGUE && "전두엽 뇌 피로도가 높아 정보 처리 속도가 저하되어 있어 충분한 뇌 휴식이 필요합니다."}
                {![CareType.ANXIETY_TENSION, CareType.BURNOUT, CareType.DEPRESSION_AMOTIVATION, CareType.HYPERSENSITIVE, CareType.ATTENTION_DEFICIT, CareType.BRAIN_FATIGUE].includes(result.careType) &&
                  "학습 환경 및 생체 리듬의 불균형으로 인해 잠재력 대비 공부 효율이 저하되어 있는 상태입니다."}
              </p>
            </div>
          </div>

          {/* Quick Score Circle */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 text-center flex flex-col items-center justify-center shadow-inner">
            <span className="text-xs text-slate-400 font-bold mb-1">10분 종합 학습 건강도</span>
            <div className="text-4xl font-extrabold text-blue-400">{result.score || 74}<span className="text-sm text-slate-500 font-normal">/100</span></div>
            <span className="text-xs text-blue-300 mt-2 font-semibold px-3 py-0.5 bg-blue-500/10 rounded-full border border-blue-500/20">
              {result.scoreLevel || 'Care Required'}
            </span>
          </div>
        </div>

        {/* 10-Minute 3 Core Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800">
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
            <div className="text-xs text-slate-400 font-medium mb-1">1. 수험생 불안 지수 (BAI)</div>
            <div className="text-2xl font-bold text-white">
              {result.survey?.bai || 14}점 
              <span className="text-xs font-normal text-slate-400 ml-2">
                {(result.survey?.bai || 14) >= 22 ? '경고 (주의)' : (result.survey?.bai || 14) >= 10 ? '경도 불안' : '안정적'}
              </span>
            </div>
          </div>
          
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
            <div className="text-xs text-slate-400 font-medium mb-1">2. 수면 회복 지수 (ISI)</div>
            <div className="text-2xl font-bold text-white">
              {result.survey?.isi || 12}점 
              <span className="text-xs font-normal text-slate-400 ml-2">
                {(result.survey?.isi || 12) >= 15 ? '수면부족' : (result.survey?.isi || 12) >= 8 ? '주의 필요' : '양호'}
              </span>
            </div>
          </div>

          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
            <div className="text-xs text-slate-400 font-medium mb-1">3. 공부 환경 적합도</div>
            <div className="text-2xl font-bold text-white">
              {result.protocol?.location || '독서실/학습공간'}
              <span className="text-xs font-normal text-slate-400 ml-2">
                스트레스 {result.protocol?.stressLevel || 3}/5
              </span>
            </div>
          </div>
        </div>

        {/* 1순위 핵심 솔루션 (무료 공개) */}
        <div className="mt-6 p-4 rounded-2xl bg-slate-950 border border-slate-800">
          <h4 className="text-xs font-bold text-blue-400 flex items-center gap-1.5 mb-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            오늘 즉시 실천할 1순위 맞춤 솔루션
          </h4>
          <ul className="text-xs text-slate-300 space-y-1.5 font-normal leading-relaxed">
            <li>• <b>골든타임 집중법:</b> 취약 과목은 하루 중 가장 맑은 시간대에 40분 학습 + 10분 무화면 뇌휴식을 적용하세요.</li>
            <li>• <b>수면-불안 완화 루틴:</b> 취침 30분 전 스마트폰 블루라이트를 끄고 4초 들이마시고 6초 내쉬는 호흡을 5회 실시하세요.</li>
          </ul>
        </div>

      </div>

      {/* 2. FREE 사용자 대상 블러(Blur) & 업셀 잠금 영역 */}
      {isFree && (
        <div className="relative rounded-3xl border border-slate-800 p-6 md:p-8 bg-slate-950 overflow-hidden shadow-2xl">
          
          {/* Blur Background Content Preview */}
          <div className="filter blur-md select-none pointer-events-none opacity-30 space-y-6">
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
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center bg-slate-950/85 backdrop-blur-md">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-3 shadow-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            
            <h3 className="text-xl md:text-2xl font-extrabold text-white">
              24P 종합 정밀 처방 & 인지 테스트 리포트 잠김
            </h3>
            
            <p className="text-xs md:text-sm text-slate-400 max-w-lg mt-2 mb-6 leading-relaxed">
              취약 과목별 초정밀 맞춤 시간표, 작업기억 용량(Working Memory), 자율신경 생체 신호, 영양·수면 처방 전문 리포트를 즉시 잠금 해제하세요.
            </p>

            {/* Direct 2-Button Action Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
              
              {/* Option 1: 1회 스타터 패스 ₩9,000 */}
              <button
                onClick={() => handleOpenUpgrade('1회 학생용 정밀 리포트 열람')}
                className="w-full sm:w-1/2 py-3.5 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs md:text-sm rounded-xl transition-all border border-slate-700 flex flex-col items-center justify-center"
              >
                <span>1회 정밀 리포트 열기</span>
                <span className="text-[11px] font-normal text-slate-400">₩9,000 (1회성)</span>
              </button>

              {/* Option 2: PREMIUM 정기구독 ₩9,900 + 카톡 알림 */}
              <button
                onClick={() => handleOpenUpgrade('전문가 심층 리포트 + 카톡 주간 알림 구독')}
                className="w-full sm:w-1/2 py-3.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs md:text-sm rounded-xl transition-all shadow-lg shadow-blue-600/30 flex flex-col items-center justify-center border border-blue-500 relative overflow-hidden"
              >
                <span>💎 정기 케어 구독</span>
                <span className="text-[11px] font-normal text-blue-100">
                  월 ₩9,900 + 카톡 알림
                </span>
              </button>

            </div>

            <p className="text-[11px] text-slate-400 mt-4">
              💡 1회권(9,000원)에 단 900원만 더하면 매주 카톡 케어 알림과 무제한 정밀 리포트가 제공됩니다.
            </p>

          </div>

        </div>
      )}

      {/* 3. 유료 회원(Pro/Premium vs VIP) 추가 검사 진행 배너 */}
      {!isFree && (
        <div className={`border-2 rounded-3xl p-6 md:p-8 shadow-xl text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
          isAllCompleted
            ? 'bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border-emerald-500/40'
            : completedCount > 0
              ? 'bg-gradient-to-r from-indigo-950 via-slate-900 to-blue-950 border-blue-500/50'
              : userTier === 'vip' 
                ? 'bg-gradient-to-r from-amber-950 via-slate-900 to-indigo-950 border-amber-500/50' 
                : 'bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 border-emerald-500/50'
        }`}>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {isAllCompleted ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  ✅ 5종 정밀 검사 100% 완료 (5/5 완료)
                </span>
              ) : completedCount > 0 ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border bg-blue-500/20 text-blue-300 border-blue-500/30">
                  <span className="w-2 h-2 rounded-full animate-pulse bg-blue-400" />
                  🎯 5종 정밀 검사 진행 중 ({completedCount}/5 완료 · {remainingCount}개 남음)
                </span>
              ) : (
                <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border ${
                  userTier === 'vip'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                }`}>
                  <span className={`w-2 h-2 rounded-full animate-pulse ${userTier === 'vip' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                  🔓 정밀 진단 모드 활성화 ({TIER_INFO[userTier].name})
                </span>
              )}
              <span className="text-xs text-slate-300">기존 검사 데이터 보존됨</span>
            </div>

            {isAllCompleted ? (
              <>
                <h4 className="text-lg md:text-xl font-black text-white mt-1">
                  ✅ [공부 효율성 5대 정밀 검사] 5종 전체 완료
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                  크로노타입(MEQ), 학습유형(VARK), 시험불안(TAI), 디지털 밸런스, 메타인지 5대 심층 검사가 모두 완료되었습니다. <b>초정밀 24P 맞춤 솔루션 리포트</b>에 100% 반영되어 있습니다.
                </p>
              </>
            ) : completedCount > 0 ? (
              <>
                <h4 className="text-lg md:text-xl font-black text-white mt-1">
                  🎯 더 자세한 정밀 분석을 위해 남은 {remainingCount}개 검사를 진행해주세요!
                </h4>
                <div className="text-xs text-slate-300 leading-relaxed max-w-2xl space-y-1">
                  <p>
                    현재 <b>5개 중 {completedCount}개 완료</b>: <span className="text-emerald-400 font-semibold">{completedTestNames.join(', ')}</span>
                  </p>
                  <p>
                    더 정확하고 자세한 맞춤 처방 솔루션을 위해 남은 <b>[{remainingTestNames.join(', ')}] {remainingCount}개 검사</b>를 완료하시면 <b>즉시 24P 리포트에 반영</b>됩니다.
                  </p>
                </div>
              </>
            ) : userTier === 'vip' ? (
              <>
                <h4 className="text-lg md:text-xl font-black text-white mt-1">
                  👑 VIP 전용: [심층 신경인지 5대 정밀 검사 및 1:1 맞춤형 솔루션]을 이어서 진행하시겠습니까?
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                  크로노타입(MEQ), 학습유형(VARK), 시험불안(TAI), 디지털 밸런스 및 인지 제어 역량을 결합하여 <b>상위 1% 정밀 24P 종합 처방 리포트가 즉시 재산출</b>됩니다.
                </p>
              </>
            ) : (
              <>
                <h4 className="text-lg md:text-xl font-black text-white mt-1">
                  🎯 [공부 효율성 5대 정밀 검사]를 이어서 진행하시겠습니까?
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                  크로노타입(MEQ), 학습유형(VARK), 시험불안(TAI), 디지털 밸런스, 메타인지 5대 심층 검사를 통해 <b>초정밀 24P 맞춤 솔루션 리포트가 즉시 재산출</b>됩니다.
                </p>
              </>
            )}
          </div>
          
          {onStartAdditionalTest && (
            <button
              onClick={onStartAdditionalTest}
              className={`px-6 py-3.5 font-extrabold text-xs md:text-sm rounded-2xl shadow-lg transition-all transform hover:scale-105 shrink-0 flex items-center gap-2 cursor-pointer ${
                isAllCompleted
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 shadow-slate-900/40'
                  : completedCount > 0
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-900/40 animate-pulse'
                    : userTier === 'vip'
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black shadow-amber-900/30'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-emerald-900/30'
              }`}
            >
              <span>
                {isAllCompleted
                  ? '✅ 5종 검사 완료됨 (재검사 / 수정)'
                  : completedCount > 0
                    ? `🎯 남은 ${remainingCount}개 검사 이어하기 (${completedCount}/5 완료)`
                    : userTier === 'vip'
                      ? '🧠 VIP 심층 5종 정밀 검사 시작'
                      : '🎯 공부 효율성 5종 정밀 검사 시작'}
              </span>
              <span>→</span>
            </button>
          )}
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
