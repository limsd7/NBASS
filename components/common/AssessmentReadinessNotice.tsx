import React from 'react';
import { ReadinessStatus } from '../../services/assessmentReadiness';

interface AssessmentReadinessNoticeProps {
    readiness: ReadinessStatus;
    className?: string;
}

/**
 * 진단 준비도(누락 항목) 안내 (P1-8)
 *
 * - 기존 로딩/제출 UI를 변경하지 않고, 누락 항목이 있을 때만 "안내"를 추가로 표시합니다.
 * - 모두 완료된 경우 아무것도 렌더하지 않아 평상시 UI는 그대로입니다.
 */
export const AssessmentReadinessNotice: React.FC<AssessmentReadinessNoticeProps> = ({ readiness, className }) => {
    if (readiness.ready && readiness.incomplete.length === 0) return null;

    return (
        <div role="status" aria-live="polite" className={`mt-6 max-w-xl w-full ${className || ''}`}>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-left">
                <p className="text-xs font-black text-amber-800">
                    {readiness.ready ? '일부 선택 항목이 미입력 상태입니다.' : '필수 항목이 누락되어 확정 진단이 어려울 수 있습니다.'}
                </p>
                <p className="text-[11px] text-amber-700 mt-0.5">
                    전체 응답 완성도 {readiness.completionRate}% · 누락/일부 항목 {readiness.incomplete.length}개
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                    {readiness.incomplete.map((item) => (
                        <span
                            key={item.key}
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${item.required && item.answered === 0
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-white text-amber-700 border-amber-200'
                                }`}
                        >
                            {item.label} · {item.partial ? `일부(${item.answered}/${item.total})` : '미입력'}
                            {item.required && item.answered === 0 ? ' · 필수' : ''}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};