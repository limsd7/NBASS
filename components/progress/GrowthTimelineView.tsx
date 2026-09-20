import React, { useEffect, useState } from 'react';
import { AssessmentResult } from '../../types';
import { TrendChart } from '../TrendChart';
import { ProgressAnalytics } from '../ProgressAnalytics';
import { NBackHistoryChart } from '../NBackHistoryChart';
import { SummaryView, CognitiveView, SurveyView, AcademicView } from '../HistoryCharts';
import { TrendService, ComprehensiveTrendData } from '../../services/trendEngine';
import { buildGrowthTimeline, summarizeGrowth, GrowthEntry } from '../../services/growthTimeline';

interface GrowthTimelineViewProps {
    history: (AssessmentResult & { date: string })[];
    studentName?: string;
    birthDate?: string;
    studentId?: string;
}

/**
 * 성장 타임라인 통합  (P1-5)
 *
 * 기존에 분산되어 있던 시각화를 하나의 화면으로 통합합니다.
 * - HistoryCharts의 성장 스코어보드/인지/설문/학업 뷰 (TrendDataPoint 기반)
 * - TrendChart(추세), ProgressAnalytics(진행 분석), NBackHistoryChart(인지 로그)
 * - 이력 기반 단일 성장 타임라인(점수 변화·델타)
 */
export const GrowthTimelineView: React.FC<GrowthTimelineViewProps> = ({
    history,
    studentName,
    birthDate,
    studentId,
}) => {
    const [trend, setTrend] = useState<ComprehensiveTrendData | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!studentName) return;
        let cancelled = false;
        setIsLoading(true);
        TrendService.fetchAndProcessStudentHistory(studentName, birthDate, studentId)
            .then((data) => {
                if (!cancelled) setTrend(data);
            })
            .catch(() => {
                if (!cancelled) setTrend(null);
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [studentName, birthDate, studentId]);

    const timeline: GrowthEntry[] = buildGrowthTimeline(history as never);
    const summary = summarizeGrowth(timeline);

    const trendTone = summary.trend === 'up' ? 'text-emerald-600' : summary.trend === 'down' ? 'text-rose-600' : 'text-slate-600';

    return (
        <div className="space-y-8 pb-24">
            {/* 성장 요약 */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                    <p className="text-xs font-bold text-slate-400">진단 횟수</p>
                    <p className="text-2xl font-black text-slate-800 mt-1">{summary.count}회</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                    <p className="text-xs font-bold text-slate-400">최근 점수</p>
                    <p className="text-2xl font-black text-slate-800 mt-1">{summary.lastScore ?? '-'}</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                    <p className="text-xs font-bold text-slate-400">첫 대비 향상</p>
                    <p className={`text-2xl font-black mt-1 ${trendTone}`}>
                        {summary.improvement === null ? '-' : `${summary.improvement > 0 ? '+' : ''}${summary.improvement}`}
                    </p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                    <p className="text-xs font-bold text-slate-400">최고 점수</p>
                    <p className="text-2xl font-black text-slate-800 mt-1">{summary.bestScore ?? '-'}</p>
                </div>
            </section>

            {/* 단일 성장 타임라인 */}
            <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-4">성장 타임라인</h3>
                {timeline.length === 0 ? (
                    <p className="text-sm text-slate-400">아직 진단 이력이 없습니다. 정밀 진단을 시작해 보세요.</p>
                ) : (
                    <ol className="relative border-l border-slate-200 ml-3 space-y-5">
                        {timeline.map((entry, idx) => (
                            <li key={`${entry.date}-${idx}`} className="ml-5">
                                <span className="absolute -left-1.5 mt-1 w-3 h-3 rounded-full bg-indigo-500"></span>
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-xs font-mono text-slate-500">{entry.date.slice(0, 10)}</span>
                                    <span className="text-sm font-bold text-slate-800">{entry.careType || '미분류'}</span>
                                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                                        점수 {entry.score}
                                    </span>
                                    {entry.delta !== null && (
                                        <span
                                            className={`text-xs font-bold ${entry.delta > 0 ? 'text-emerald-600' : entry.delta < 0 ? 'text-rose-600' : 'text-slate-400'
                                                }`}
                                        >
                                            {entry.delta > 0 ? `▲ +${entry.delta}` : entry.delta < 0 ? `▼ ${entry.delta}` : '—'}
                                        </span>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ol>
                )}
            </section>

            {/* HistoryCharts 통합 (성장 스코어보드/인지/설문/학업) */}
            {trend && (
                <section className="space-y-6">
                    <h3 className="text-lg font-bold text-slate-800">종합 성장 스코어보드</h3>
                    <SummaryView data={trend.summary} />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <CognitiveView data={trend.cognitive} />
                        <SurveyView data={trend.survey} />
                    </div>
                    <AcademicView data={trend.academic} />
                </section>
            )}
            {isLoading && !trend && (
                <p className="text-xs text-slate-400">추세 데이터를 불러오는 중입니다...</p>
            )}

            {/* 기존 추세/진행/인지 로그 통합 */}
            <section className="space-y-6">
                <h3 className="text-lg font-bold text-slate-800">추세 · 진행 · 인지 로그</h3>
                <TrendChart history={history as never} />
                <ProgressAnalytics history={history as never} />
                <NBackHistoryChart />
            </section>
        </div>
    );
};