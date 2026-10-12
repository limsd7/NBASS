import React from 'react';
import type { AssessmentResult } from '../../../types';
import { REPORT_TOC } from './reportToc';

interface ReportTocPreviewProps {
    result: AssessmentResult;
    onOpenUpgrade: (reason: string) => void;
}

// 리포트 목차 미리보기 (잠금 박스 내부 블러 영역용, 기존 오버레이·버튼은 그대로)
export const ReportTocPreview: React.FC<ReportTocPreviewProps> = ({ result, onOpenUpgrade }) => {
    return (
        <div className="space-y-2 text-left">
            <div className="text-xs font-black text-slate-300 tracking-widest uppercase px-1">
                Report Contents · 총 {REPORT_TOC.length}장
            </div>
            {REPORT_TOC.map(item => (
                <div key={item.page}>
                    {item.free ? (
                        <div className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <span className="text-[10px] font-mono font-bold text-emerald-400 shrink-0">P.{item.page}</span>
                                <div className="min-w-0">
                                    <div className="text-xs font-black text-white truncate">{item.title}</div>
                                    <div className="text-[10px] text-slate-400 truncate">{item.subtitle}</div>
                                </div>
                            </div>
                            <div className="text-right shrink-0">
                                <div className="text-[10px] font-black text-emerald-400">공개중</div>
                                <div className="text-[10px] text-slate-300 font-bold">{result.careType} · {Math.round(result.score || 0)}점</div>
                            </div>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => onOpenUpgrade(item.reason)}
                            className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-slate-500 transition-colors cursor-pointer"
                        >
                            <div className="flex items-center gap-2.5 min-w-0">
                                <span className="text-[10px] font-mono font-bold text-slate-500 shrink-0">P.{item.page}</span>
                                <div className="min-w-0">
                                    <div className="text-xs font-bold text-slate-200 truncate">{item.title}</div>
                                    <div className="text-[10px] text-slate-500 truncate">{item.subtitle}</div>
                                </div>
                            </div>
                            <span className="text-sm shrink-0" aria-hidden>🔒</span>
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
};
