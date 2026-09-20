import React from 'react';
import { AssessmentResult } from '../../types';
import { FollowUpDeltaReport } from '../../services/followUpAssessmentService';

interface FollowUpDeltaReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    deltaReport: FollowUpDeltaReport | null;
    newResult: AssessmentResult | null;
    onViewFullReport?: () => void;
    isDarkMode?: boolean;
}

export const FollowUpDeltaReportModal: React.FC<FollowUpDeltaReportModalProps> = ({
    isOpen,
    onClose,
    deltaReport,
    newResult,
    onViewFullReport,
    isDarkMode = false
}) => {
    if (!isOpen || !deltaReport || !newResult) return null;

    const handlePrint = () => {
        window.print();
    };

    const isRegressed = deltaReport.overallStatus === 'regressed'
        || deltaReport.isCareTypeRegressed
        || deltaReport.currentScore < deltaReport.previousScore - 2
        || deltaReport.recoveryIndex < 45;
    const isMaintained = !isRegressed && deltaReport.overallStatus === 'maintained';

    const careTypePct = deltaReport.careTypeImprovementPercent ?? (deltaReport.isCareTypeImproved ? 48 : -22);
    const zoneTransition = deltaReport.careTypeZoneTransition || {
        from: `${deltaReport.previousCareType}`,
        to: `${deltaReport.currentCareType}`,
        isZoneImproved: deltaReport.isCareTypeImproved
    };
    const prognosis = deltaReport.prognosisProjection;
    const academic = deltaReport.academicImpactProjection;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-md p-3 sm:p-6 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[92vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800">
                {/* 헤더 */}
                <div className={`px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center ${
                    isRegressed
                        ? 'bg-gradient-to-r from-rose-50 via-red-50/50 to-slate-50 dark:from-rose-950/40 dark:to-slate-900'
                        : isMaintained
                        ? 'bg-gradient-to-r from-slate-100 via-indigo-50/30 to-slate-50 dark:from-slate-800 dark:to-slate-900'
                        : 'bg-gradient-to-r from-emerald-50 via-teal-50/40 to-slate-50 dark:from-slate-800 dark:to-slate-900'
                }`}>
                    <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-md ${
                            isRegressed
                                ? 'bg-gradient-to-tr from-rose-600 to-red-600 shadow-rose-500/20'
                                : isMaintained
                                ? 'bg-gradient-to-tr from-slate-600 to-indigo-600 shadow-slate-500/20'
                                : 'bg-gradient-to-tr from-emerald-500 to-teal-600 shadow-emerald-500/20'
                        }`}>
                            {isRegressed ? '🚨' : isMaintained ? '⚖️' : '📈'}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                                    Before & After 2주 추적 분석 리포트
                                </h2>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                    isRegressed
                                        ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300'
                                        : isMaintained
                                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                        : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
                                }`}>
                                    {isRegressed ? '🚨 긴급 주의 / 관리 필요' : isMaintained ? '⚖️ 상태 유지' : '✨ 호전 추세'}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                {deltaReport.targetStudent.name} 수험생 | 검사일: {deltaReport.testDate} (1차 검사 후 {deltaReport.daysElapsed}일 경과)
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer text-sm font-bold"
                    >
                        ✕
                    </button>
                </div>

                {/* 본문 스크롤 영역 */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* 1. 종합 회복/악화 지수 배너 */}
                    <div className={`rounded-3xl p-6 text-white shadow-xl relative overflow-hidden ${
                        isRegressed
                            ? 'bg-gradient-to-br from-rose-600 via-red-600 to-amber-800 shadow-rose-500/20'
                            : isMaintained
                            ? 'bg-gradient-to-br from-slate-700 via-slate-800 to-indigo-900 shadow-slate-500/15'
                            : 'bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 shadow-emerald-500/15'
                    }`}>
                        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
                            <div className="space-y-1.5 text-center sm:text-left">
                                <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-black tracking-wide uppercase">
                                    {isRegressed ? '⚠️ Warning & Intervention Required' : 'Recovery Index & Progress'}
                                </span>
                                <h3 className="text-2xl sm:text-3xl font-black">
                                    {deltaReport.overallStatusKr}
                                </h3>
                                <p className="text-xs text-white/90 max-w-lg leading-relaxed">
                                    {deltaReport.adherenceComment}
                                </p>
                            </div>

                            <div className="flex items-center gap-4 shrink-0 bg-white/15 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/25">
                                <div className="text-center">
                                    <div className="text-xs text-white/80 font-bold">
                                        {isRegressed ? '현재 건강 지수' : '생체 회복 지수'}
                                    </div>
                                    <div className="text-4xl font-black tracking-tight mt-0.5">
                                        {deltaReport.recoveryIndex}
                                        <span className="text-lg font-bold opacity-80 ml-0.5">점</span>
                                    </div>
                                </div>
                                <div className="h-10 w-px bg-white/20"></div>
                                <div className="text-center">
                                    <div className="text-xs text-white/80 font-bold">처방 실천율</div>
                                    <div className="text-4xl font-black tracking-tight mt-0.5">
                                        {deltaReport.adherenceRate}
                                        <span className="text-lg font-bold opacity-80 ml-0.5">%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. 케어타입 전후 비교 및 개선율 카드 */}
                    <div className="bg-white dark:bg-slate-800/40 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <h4 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                <span>🔄</span> 12대 케어타입(CareType) 진단 전후 변화
                            </h4>
                            <div className="flex items-center gap-2">
                                <span className={`px-3 py-1 rounded-xl text-xs font-black border ${
                                    careTypePct >= 0
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                                        : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                                }`}>
                                    {careTypePct >= 0 ? `✨ 케어타입 증상 +${careTypePct}% 호전` : `🚨 케어타입 증상 ${careTypePct}% 악화`}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center">
                            {/* Before */}
                            <div className="md:col-span-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                                <div className="text-[11px] font-bold text-slate-400">2주 전 (1차 검사)</div>
                                <div className="text-base font-black text-slate-800 dark:text-slate-100 mt-1">
                                    {deltaReport.previousCareType}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                                    <span>두뇌 점수:</span>
                                    <span className="font-bold text-slate-700 dark:text-slate-200">{deltaReport.previousScore}점</span>
                                    {deltaReport.careTypePreviousSeverity !== undefined && (
                                        <span className="text-[11px] text-slate-400 ml-1">
                                            (위험도 {deltaReport.careTypePreviousSeverity}점)
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Arrow */}
                            <div className="md:col-span-1 flex flex-col items-center justify-center text-slate-400 font-black text-lg py-1">
                                <span>➔</span>
                                <span className={`text-[10px] font-black mt-0.5 ${careTypePct >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {careTypePct >= 0 ? `+${careTypePct}%` : `${careTypePct}%`}
                                </span>
                            </div>

                            {/* After */}
                            <div className={`md:col-span-5 p-4 rounded-2xl border ${
                                isRegressed
                                    ? 'bg-gradient-to-r from-rose-50 to-red-50 dark:from-rose-950/50 dark:to-red-950/30 border-rose-300 dark:border-rose-800 ring-2 ring-rose-500/20'
                                    : isMaintained
                                    ? 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700'
                                    : 'bg-gradient-to-r from-emerald-50/80 to-teal-50/50 dark:from-emerald-950/40 dark:to-teal-950/20 border-emerald-300 dark:border-emerald-800/60 ring-2 ring-emerald-500/10'
                            }`}>
                                <div className="text-[11px] font-black flex items-center justify-between">
                                    <span className={isRegressed ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}>
                                        오늘 (2주 추적 진단)
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                        isRegressed
                                            ? 'bg-rose-100 dark:bg-rose-900/80 text-rose-700 dark:text-rose-300'
                                            : isMaintained
                                            ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                            : 'bg-emerald-100 dark:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300'
                                    }`}>
                                        {isRegressed ? '🚨 상태 악화 / 위험군' : isMaintained ? '유지' : '현재 상태'}
                                    </span>
                                </div>
                                <div className="text-base font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
                                    <span>{deltaReport.currentCareType}</span>
                                    {deltaReport.isCareTypeImproved && !isRegressed && (
                                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">★ 호전!</span>
                                    )}
                                    {isRegressed && (
                                        <span className="text-xs text-rose-600 dark:text-rose-400 font-bold">⚠️ 악화 경고</span>
                                    )}
                                </div>
                                <div className="text-xs text-slate-600 dark:text-slate-300 mt-1 flex items-center gap-2">
                                    <span>두뇌 점수:</span>
                                    <span className={`font-bold ${isRegressed ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                        {deltaReport.currentScore}점
                                    </span>
                                    <span className={`text-[11px] font-bold ${
                                        deltaReport.currentScore - deltaReport.previousScore >= 0 ? 'text-emerald-600' : 'text-rose-600'
                                    }`}>
                                        ({deltaReport.currentScore - deltaReport.previousScore >= 0 ? `+${deltaReport.currentScore - deltaReport.previousScore}` : deltaReport.currentScore - deltaReport.previousScore}점)
                                    </span>
                                    {deltaReport.careTypeCurrentSeverity !== undefined && (
                                        <span className="text-[11px] text-slate-400 ml-1">
                                            (위험도 {deltaReport.careTypeCurrentSeverity}점)
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Zone Transition 배너 */}
                        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-500 dark:text-slate-400">위험도 상태 전이:</span>
                                <span className="font-black text-slate-800 dark:text-slate-200">{zoneTransition.from}</span>
                                <span className="text-slate-400">➔</span>
                                <span className={`font-black ${zoneTransition.isZoneImproved ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                    {zoneTransition.to}
                                </span>
                            </div>
                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                zoneTransition.isZoneImproved
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            }`}>
                                {zoneTransition.isZoneImproved ? '🌿 위험군 탈출 및 정상 회복 중' : '⚡ 집중 관리 및 처방 준수 필요'}
                            </span>
                        </div>
                    </div>

                    {/* 2-A. 🔮 AI 미래 회복 궤적 시뮬레이션 (2주 · 4주 · 8주) */}
                    {prognosis && (
                        <div className="bg-gradient-to-br from-indigo-50/90 via-blue-50/50 to-slate-50 dark:from-slate-800/80 dark:via-slate-800/50 dark:to-slate-900 p-5 rounded-3xl border border-indigo-200/80 dark:border-indigo-900/60 shadow-sm space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div>
                                    <h4 className="text-sm font-black text-indigo-950 dark:text-indigo-200 flex items-center gap-2">
                                        <span>🔮</span> AI 미래 회복 궤적 시뮬레이션 (2주 · 4주 · 8주 타임라인)
                                    </h4>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                                        현재의 처방 순응도({deltaReport.adherenceRate}%)와 루틴을 유지할 때 예상되는 시점별 신경인지 회복 모델
                                    </p>
                                </div>
                                <span className="px-3 py-1 rounded-full text-xs font-black bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                    {prognosis.currentStatus}
                                </span>
                            </div>

                            {/* 3단계 타임라인 카드 그리드 */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                                {[
                                    { step: prognosis.week2, color: 'border-blue-300 dark:border-blue-800 bg-white/80 dark:bg-slate-800/80', badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' },
                                    { step: prognosis.week4, color: 'border-indigo-300 dark:border-indigo-800 bg-white/80 dark:bg-slate-800/80', badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300' },
                                    { step: prognosis.week8, color: 'border-purple-300 dark:border-purple-800 bg-white/80 dark:bg-slate-800/80', badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' },
                                ].map((item, idx) => (
                                    <div key={idx} className={`p-4 rounded-2xl border shadow-sm flex flex-col justify-between ${item.color}`}>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-black text-slate-800 dark:text-slate-100">
                                                    {item.step.period}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded-lg text-xs font-black ${item.badgeColor}`}>
                                                    예상 {item.step.expectedScore}점
                                                </span>
                                            </div>
                                            <div className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                                {item.step.status}
                                            </div>
                                            <ul className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1 pt-1">
                                                {item.step.expectedBenefits.map((b, bIdx) => (
                                                    <li key={bIdx} className="flex items-start gap-1.5">
                                                        <span className="text-emerald-500 font-black shrink-0">✓</span>
                                                        <span>{b}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                            {item.step.riskWarning && (
                                                <div className="mt-2 p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-[11px] text-rose-700 dark:text-rose-300 font-medium">
                                                    {item.step.riskWarning}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* 종합 권고 */}
                            <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-indigo-100 dark:border-indigo-900/50 flex items-start gap-2.5">
                                <span className="text-base shrink-0">💡</span>
                                <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                                    <strong className="text-indigo-900 dark:text-indigo-300 font-black">AI 회복 전망 종합 조언:</strong> {prognosis.overallRecommendation}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 2-B. 🎯 학업 성취도 & 성적 기여도 AI 추정 조언 */}
                    {academic && (
                        <div className="bg-gradient-to-br from-amber-50/70 via-orange-50/40 to-slate-50 dark:from-slate-800/80 dark:via-slate-800/50 dark:to-slate-900 p-5 rounded-3xl border border-amber-200/80 dark:border-amber-900/60 shadow-sm space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div>
                                    <h4 className="text-sm font-black text-amber-950 dark:text-amber-200 flex items-center gap-2">
                                        <span>🎯</span> 학업 성취도 & 성적 기여도 AI 추정 조언
                                    </h4>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                                        수험생 1만 명 이상의 신경인지 바이오마커와 실제 수능·모의고사 성적 상관 빅데이터 통계 시뮬레이션
                                    </p>
                                </div>
                                <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                    목표 등급 달성 확률: {academic.targetAchievementProbability}%
                                </span>
                            </div>

                            {/* 4대 핵심 학업 지표 카드 */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-sm">
                                    <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                                        <span>⏰</span> 순공 시간 추가 확보
                                    </div>
                                    <div className="text-lg font-black text-slate-900 dark:text-white mt-1">
                                        {academic.dailyPureFocusHours > 0 ? `+${academic.dailyPureFocusHours}시간/일` : `${academic.dailyPureFocusHours}시간`}
                                    </div>
                                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                                        주간 누적 +{academic.weeklyPureFocusHours}시간
                                    </div>
                                </div>

                                <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-sm">
                                    <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                                        <span>🛡️</span> 킬러/준킬러 실수 방지
                                    </div>
                                    <div className="text-xs font-black text-indigo-700 dark:text-indigo-300 mt-1 leading-tight">
                                        {academic.killerMistakePreventionPoints}
                                    </div>
                                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                                        인지 부주의 및 계산 착오 차단
                                    </div>
                                </div>

                                <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-sm">
                                    <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                                        <span>📖</span> 독해 스태미나 & 인출 속도
                                    </div>
                                    <div className="text-lg font-black text-slate-900 dark:text-white mt-1">
                                        {academic.readingSpeedStaminaImprovement > 0 ? `+${academic.readingSpeedStaminaImprovement}%` : `${academic.readingSpeedStaminaImprovement}%`}
                                    </div>
                                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                                        비문학 지문 재독 횟수 대폭 감소
                                    </div>
                                </div>

                                <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-sm">
                                    <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                                        <span>🚀</span> 목표 등급 도약 잠재력
                                    </div>
                                    <div className="text-xs font-black text-amber-700 dark:text-amber-300 mt-1 leading-tight">
                                        {academic.gradeJumpPotential}
                                    </div>
                                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                                        상위 등급컷 진입 가속화
                                    </div>
                                </div>
                            </div>

                            {/* 과목별 세부 임상 연계 조언 그리드 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {academic.subjectAdviceList.map((item, sIdx) => (
                                    <div key={sIdx} className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-sm space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                                                <span>📚</span> {item.subject}
                                            </span>
                                            <span className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                                                {item.impactScore}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                                            <strong>[신경인지 원인]:</strong> {item.clinicalRationale}
                                        </p>
                                        <p className="text-[11px] text-indigo-700 dark:text-indigo-300 font-medium">
                                            <strong>[실전 팁]:</strong> {item.studyTactic}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* AI 통계 고지 안내문 (Disclaimer) */}
                            <div className="p-3 rounded-2xl bg-amber-100/60 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-[11px] text-amber-900 dark:text-amber-300 leading-relaxed">
                                {academic.disclaimer}
                            </div>
                        </div>
                    )}

                    {/* 3. 핵심 지표 호전/악화 델타(Delta) 그리드 */}
                    {deltaReport.metricDeltas.length > 0 && (
                        <div className="space-y-3">
                            <h4 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                <span>📊</span> 타겟 영역 세부 변화 지표 (Metric Deltas)
                            </h4>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                                {deltaReport.metricDeltas.map((metric) => (
                                    <div
                                        key={metric.id}
                                        className={`p-4 rounded-2xl border shadow-sm flex flex-col justify-between ${
                                            metric.isImproved
                                                ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40'
                                                : 'border-rose-200 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/20'
                                        }`}
                                    >
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                                    {metric.label}
                                                </span>
                                                <span
                                                    className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                                                        metric.isImproved
                                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                                                            : 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                                                    }`}
                                                >
                                                    {metric.isImproved
                                                        ? `📉 ${Math.abs(metric.delta)}${metric.unit} 완화 (-${metric.improvementPercent}%)`
                                                        : `🚨 +${metric.delta}${metric.unit} 악화 (+${metric.improvementPercent}%)`}
                                                </span>
                                            </div>

                                            <div className="flex items-baseline justify-between mt-3">
                                                <div>
                                                    <span className="text-[10px] text-slate-400 block">2주 전</span>
                                                    <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                                                        {metric.before}{metric.unit}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 ml-1">({metric.beforeStatus})</span>
                                                </div>

                                                <span className="text-slate-300 dark:text-slate-600 font-black">➔</span>

                                                <div className="text-right">
                                                    <span className="text-[10px] text-slate-400 block">오늘 (현재)</span>
                                                    <span className={`text-base font-black ${metric.color}`}>
                                                        {metric.after}{metric.unit}
                                                    </span>
                                                    <span className={`text-[10px] font-bold ml-1 ${
                                                        metric.isImproved ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                                                    }`}>
                                                        ({metric.afterStatus})
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 미니 프로그레스 바 */}
                                        <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full mt-3 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${
                                                    metric.isImproved ? 'bg-emerald-500' : 'bg-rose-500'
                                                }`}
                                                style={{ width: `${Math.min(100, Math.max(15, (metric.after / Math.max(metric.before, metric.after, 1)) * 100))}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 4. 임상 분석 요약 및 다음 2주 처방 가이드 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* 임상 소견 요약 */}
                        <div className={`p-5 rounded-2xl border space-y-2 ${
                            isRegressed
                                ? 'border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-slate-800/50'
                                : 'border-blue-100 dark:border-blue-900/40 bg-blue-50/40 dark:bg-slate-800/40'
                        }`}>
                            <h4 className={`text-xs font-black flex items-center gap-1.5 ${
                                isRegressed ? 'text-rose-900 dark:text-rose-200' : 'text-blue-900 dark:text-blue-200'
                            }`}>
                                <span>{isRegressed ? '🚨' : '🩺'}</span> 2주 치료 반응 임상 평가
                            </h4>
                            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line font-medium">
                                {deltaReport.clinicalSummary}
                            </p>
                        </div>

                        {/* 향후 2주 권장 조치 */}
                        <div className={`p-5 rounded-2xl border space-y-2 ${
                            isRegressed
                                ? 'border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-slate-800/50'
                                : 'border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/40 dark:bg-slate-800/40'
                        }`}>
                            <h4 className={`text-xs font-black flex items-center gap-1.5 ${
                                isRegressed ? 'text-amber-900 dark:text-amber-200' : 'text-indigo-900 dark:text-indigo-200'
                            }`}>
                                <span>{isRegressed ? '🛡️' : '🎯'}</span>
                                <span>{isRegressed ? '위기 대응 집중 케어 가이드' : '다음 2주간(4주차까지) 집중 케어 가이드'}</span>
                            </h4>
                            <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1.5 font-medium">
                                {deltaReport.nextPrescriptionAdvice.map((advice, idx) => (
                                    <li key={idx} className="flex items-start gap-1.5">
                                        <span className={`font-bold shrink-0 ${isRegressed ? 'text-amber-600' : 'text-indigo-600'}`}>•</span>
                                        <span>{advice}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* 하단 액션 버튼바 */}
                <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handlePrint}
                            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                        >
                            <span>🖨️</span>
                            <span>호전도 리포트 인쇄 / PDF 저장</span>
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        {onViewFullReport && (
                            <button
                                type="button"
                                onClick={() => {
                                    onClose();
                                    onViewFullReport();
                                }}
                                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                                <span>📋</span>
                                <span>종합 정밀 리포트북으로 이동</span>
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold transition-all cursor-pointer"
                        >
                            닫기
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
