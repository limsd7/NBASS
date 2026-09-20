import React, { memo, useMemo } from 'react';
import { ParentLinkService, analyzeGap, GapAnalysisReport } from '../services/parentLinkService';

/**
 * 갭 분석 리포트 — 학부모 관찰 vs 학생 자가 진단 비교
 *
 * 자녀가 초대 코드(?invite=XXXXXX)로 진단한 경우,
 * 학부모 관찰 결과와 본인 자가 진단의 불일치 지점을 시각화합니다.
 */

interface GapAnalysisReportProps {
    /** URL에서 읽은 초대 코드 (없으면 렌더링하지 않음) */
    inviteCode: string | null;
    /** 학생 자가 진단 카테고리 비율 (0~100) */
    childCategoryRatios: Record<string, number>;
    /** 학생 자가 진단 종합 위험 비율 (0~100) */
    childOverallRatio: number;
}

export const GapAnalysisReportView: React.FC<GapAnalysisReportProps> = memo(({
    inviteCode,
    childCategoryRatios,
    childOverallRatio,
}) => {
    const report: GapAnalysisReport = useMemo(() => {
        if (!inviteCode) return { hasParentData: false, items: [], summary: '', parentRecommendations: [] };
        const parentRecord = ParentLinkService.findByInviteCode(inviteCode);
        if (!parentRecord) return { hasParentData: false, items: [], summary: '', parentRecommendations: [] };
        // 자녀 완료 표시 (중복 호출 무해)
        ParentLinkService.attachChildResult(inviteCode, childOverallRatio);
        return analyzeGap(parentRecord, childCategoryRatios);
    }, [inviteCode, childCategoryRatios, childOverallRatio]);

    if (!report.hasParentData || report.items.length === 0) return null;

    const severityColor: Record<string, string> = {
        high: '#f87171',
        medium: '#f59e0b',
        low: '#10b981',
    };
    const severityBg: Record<string, string> = {
        high: 'bg-rose-50 border-rose-200 dark:bg-rose-900/20 dark:border-rose-800',
        medium: 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800',
        low: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800',
    };

    return (
        <div className="w-full max-w-3xl mx-auto mt-6 space-y-4">
            {/* 헤더 */}
            <div className="bg-gradient-to-r from-indigo-600 to-blue-700 rounded-2xl p-5 text-white">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">🔍</span>
                    <h3 className="text-base font-black">부모 관찰 vs 본인 진단 갭 분석</h3>
                </div>
                <p className="text-xs text-blue-100">{report.summary}</p>
            </div>

            {/* 카테고리별 비교 */}
            <div className="bg-white dark:bg-slate-800/95 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
                {report.items.map(item => (
                    <div key={item.category} className={`rounded-xl border p-4 ${severityBg[item.severity]}`}>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-black text-slate-800 dark:text-slate-100">{item.label}</span>
                            <span
                                className="text-xs font-black px-2 py-0.5 rounded-full text-white"
                                style={{ background: severityColor[item.severity] }}
                            >
                                {item.severity === 'high' ? '주의' : item.severity === 'medium' ? '관찰' : '양호'}
                            </span>
                        </div>

                        {/* 비교 바 */}
                        <div className="space-y-1.5 mb-2.5">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-slate-500 w-14 shrink-0">부모 관찰</span>
                                <div className="flex-1 h-2 bg-slate-200/60 dark:bg-slate-700/60 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full bg-rose-400" style={{ width: `${item.parentRatio}%` }} />
                                </div>
                                <span className="text-[10px] font-bold text-slate-500 w-8 text-right">{item.parentRatio}%</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-slate-500 w-14 shrink-0">본인 진단</span>
                                <div className="flex-1 h-2 bg-slate-200/60 dark:bg-slate-700/60 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full bg-blue-400" style={{ width: `${item.childRatio}%` }} />
                                </div>
                                <span className="text-[10px] font-bold text-slate-500">{item.childRatio}%</span>
                            </div>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{item.message}</p>
                    </div>
                ))}
            </div>

            <p className="text-center text-[11px] text-slate-400 px-6">
                갭 분석은 보호자 관찰과 본인 응답의 차이를 보여주는 참고 자료이며, 의료적 판단 근거가 아닙니다.
            </p>
        </div>
    );
});

export default GapAnalysisReportView;
