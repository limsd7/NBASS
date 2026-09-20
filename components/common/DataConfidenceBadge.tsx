import React from 'react';
import { AssessmentConfidence } from '../../types';

interface DataConfidenceBadgeProps {
    confidence?: AssessmentConfidence;
    className?: string;
}

/**
 * 진단 데이터 신뢰도 배지 (P0-3)
 *
 * - 기존 리포트 UI/본문을 변경하지 않고, 실측/추정 상태를 "덧붙여" 표기합니다.
 * - overall: 실측 중심 / 추정 중심 / 실측+추정 혼합
 * - domains: 자율신경·뇌파·심리설문·인지검사·학습분석·의학검사별 실측/추정 라벨
 */
export const DataConfidenceBadge: React.FC<DataConfidenceBadgeProps> = ({ confidence, className }) => {
    if (!confidence) return null;

    const overallLabel =
        confidence.overall === 'measured' ? '실측 중심' : confidence.overall === 'estimated' ? '추정 중심' : '실측+추정 혼합';
    const overallTone =
        confidence.overall === 'measured'
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : confidence.overall === 'estimated'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-indigo-50 text-indigo-700 border-indigo-200';

    return (
        <div role="group" aria-label="데이터 신뢰도(실측/추정)" className={`flex flex-wrap items-center gap-1.5 ${className || ''}`}>
            <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${overallTone}`}
                title="데이터 신뢰도: 실측/추정 도메인 요약"
            >
                데이터 신뢰도: {overallLabel} (실측 {confidence.measuredCount} · 추정 {confidence.estimatedCount})
            </span>
            {confidence.domains.map((d) => (
                <span
                    key={d.key}
                    className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${d.status === 'measured'
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        : 'bg-amber-50 text-amber-600 border-amber-100'
                        }`}
                    title={d.note}
                >
                    {d.label} · {d.status === 'measured' ? '실측' : '추정'}
                </span>
            ))}
        </div>
    );
};