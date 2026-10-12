import React from 'react';

// Simple markdown renderer for Vitality/Fatigue section
export const renderSimpleMarkdown = (
    text: string, 
    isDark: boolean = false, 
    onOpenNutritionModal?: () => void
): React.ReactNode => {
    if (!text) return null;

    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let inTable = false;
    let tableRows: string[][] = [];
    let tableHeaders: string[] = [];

    let inRoutineBlock = false;
    let routineItems: React.ReactNode[] = [];
    let routineTitle = '';

    let blueBoxGroup: React.ReactNode[] = [];
    let inNutritionSection = false;

    const flushBlueBoxGroup = () => {
        if (blueBoxGroup.length > 0) {
            elements.push(
                <div key={`bb-group-${elements.length}`} className={`p-4 border-l-4 border-blue-400 ${isDark ? 'bg-slate-800' : 'bg-slate-50'} rounded-r-lg my-3 shadow-sm flex flex-col gap-1.5`}>
                    {blueBoxGroup}
                </div>
            );
            blueBoxGroup = [];
        }
    };

    const renderNutritionCta = (keyId: number | string) => (
        <div 
            key={`nutrition-cta-${keyId}`} 
            className="my-3.5 p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 dark:from-slate-800 dark:via-slate-800/95 dark:to-slate-850 rounded-2xl border border-emerald-200/90 dark:border-emerald-700/60 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 transition-all hover:border-emerald-300"
        >
            <div className="flex items-start sm:items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0 mt-0.5 sm:mt-0">
                    🔬
                </div>
                <div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-black text-slate-900 dark:text-white">
                            생체신호 연동 1:1 정밀 영양 가이드
                        </span>
                        <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-black rounded-full border border-emerald-200 dark:border-emerald-700/60">
                            Full Lineup (3-Tier 6종)
                        </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-snug">
                        닥터PNT 정품 맞춤 영양 설계 &amp; HL 스마트 부스터 풀 라인업을 스크롤 이동 없이 팝업으로 즉시 확인합니다.
                    </p>
                </div>
            </div>
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    onOpenNutritionModal?.();
                }}
                className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer active:scale-95 group"
            >
                <span>풀 라인업 바로보기</span>
                <span className="text-xs transition-transform group-hover:translate-x-0.5 font-bold">↗</span>
            </button>
        </div>
    );

    const textColor = isDark ? 'text-slate-200' : 'text-slate-600';
    const strongColor = isDark ? 'text-white' : 'text-slate-800';
    const headingColor = isDark ? 'text-cyan-400' : 'text-cyan-800';
    const subHeadingColor = isDark ? 'text-cyan-300' : 'text-cyan-700';
    const borderColor = isDark ? 'border-slate-700' : 'border-slate-200';
    const bgColor = isDark ? 'bg-slate-800' : 'bg-slate-100';

    const processInlineStyles = (line: string): React.ReactNode => {
        if (!line) return '';
        const cleanLine = line.replace(/<br\s*\/?>/gi, ' ');
        // Process **bold** text
        const parts = cleanLine.split(/(\*\*[^*]+\*\*)/g);
        return parts.map((part, idx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={idx} className={`font-bold ${strongColor}`}>{part.slice(2, -2)}</strong>;
            }
            return part;
        });
    };

    lines.forEach((line, idx) => {
        const trimmed = line.trim();

        // Check for table
        if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
            flushBlueBoxGroup();
            const cells = trimmed.split('|').filter(c => c.trim()).map(c => c.trim());
            if (cells.every(c => c.match(/^[-:]+$/))) {
                // Separator row - skip
                return;
            }
            if (!inTable) {
                inTable = true;
                tableHeaders = cells;
            } else {
                tableRows.push(cells);
            }
            return;
        } else if (inTable) {
            // End of table - render it
            elements.push(
                <div key={`table-${idx}`} className="overflow-x-auto my-4">
                    <table className="min-w-full text-sm border-collapse">
                        <thead>
                            <tr className={isDark ? 'bg-slate-800' : 'bg-slate-100'}>
                                {tableHeaders.map((h, i) => (
                                    <th key={i} className={`px-3 py-2 text-left font-bold border ${isDark ? 'text-slate-300' : 'text-slate-700'} ${borderColor}`}>{processInlineStyles(h)}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {tableRows.map((row, ri) => (
                                <tr key={ri} className={ri % 2 === 0 ? (isDark ? 'bg-slate-900' : 'bg-white') : (isDark ? 'bg-slate-800' : 'bg-slate-50')}>
                                    {row.map((cell, ci) => (
                                        <td key={ci} className={`px-3 py-2 border ${borderColor} ${textColor}`}>{processInlineStyles(cell)}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
            inTable = false;
            tableRows = [];
            tableHeaders = [];
        }

        // Headers
        if (trimmed.startsWith('💡') && trimmed.includes('루틴')) {
            flushBlueBoxGroup();
            inRoutineBlock = true;
            routineTitle = trimmed;
            return;
        }

        if (inRoutineBlock) {
            if (!trimmed || trimmed.startsWith('##') || trimmed.startsWith('---')) {
                // End of routine block
                elements.push(
                    <div key={`routine-${idx}`} className={`p-4 border-l-4 border-amber-400 bg-amber-50 dark:bg-amber-900/30 dark:border-amber-500 rounded-r-lg my-4 shadow-sm`}>
                        <div className={`font-bold text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-2`}>
                            <span className="text-lg">📌</span>
                            <span>{processInlineStyles(routineTitle.substring(1).trim())}</span>
                        </div>
                        <div className="space-y-1">
                            {routineItems}
                        </div>
                    </div>
                );
                inRoutineBlock = false;
                routineItems = [];
                // Proceed to process the empty line or new block normally
            } else {
                routineItems.push(
                    <div key={idx} className={`text-sm ${isDark ? 'text-amber-200/80' : 'text-amber-900/80'} ml-1 leading-relaxed`}>
                        {processInlineStyles(trimmed)}
                    </div>
                );
                return;
            }
        }

        if (trimmed.startsWith('## ')) {
            flushBlueBoxGroup();
            if (inNutritionSection && onOpenNutritionModal) {
                elements.push(renderNutritionCta(elements.length));
                inNutritionSection = false;
            }
            elements.push(<h3 key={idx} className={`text-lg font-black ${headingColor} mt-6 mb-3 flex items-center gap-2`}>{trimmed.substring(3)}</h3>);
        } else if (trimmed.startsWith('### ')) {
            flushBlueBoxGroup();
            if (inNutritionSection && onOpenNutritionModal) {
                elements.push(renderNutritionCta(elements.length));
                inNutritionSection = false;
            }
            if (trimmed.includes('영양') && (trimmed.includes('Nutrition') || trimmed.includes('가이드') || trimmed.includes('처방') || trimmed.includes('식단') || trimmed.includes('Strategy'))) {
                inNutritionSection = true;
            }
            elements.push(<h4 key={idx} className={`text-base font-bold ${subHeadingColor} mt-4 mb-2`}>{trimmed.substring(4)}</h4>);
        } else if (trimmed.startsWith('---')) {
            flushBlueBoxGroup();
            if (inNutritionSection && onOpenNutritionModal) {
                elements.push(renderNutritionCta(elements.length));
                inNutritionSection = false;
            }
            elements.push(<hr key={idx} className={`my-4 ${isDark ? 'border-slate-700' : 'border-cyan-200'}`} />);
        } else if (trimmed.startsWith('• ') || trimmed.startsWith('- ')) {
            const hasNutritionSolutionTag = trimmed.includes('💊 **[맞춤 영양 가이드]') || trimmed.includes('💊 **[영양 처방]') || trimmed.includes('💊 **[영양 가이드]');

            // Retroactive formatting for older reports that used bullets instead of blockquotes for diet/exercise
            if (trimmed.includes('추천 식단:') || trimmed.includes('운동 처방:') || trimmed.includes('티로신') || trimmed.includes('페닐알라닌') || trimmed.includes('단순당의') || trimmed.includes('철분') || trimmed.includes('기술 운동') || trimmed.includes('서서 공부') || trimmed.includes('학습 효율') || trimmed.includes('뽀모도로') || trimmed.includes('형광펜') || trimmed.includes('선생님처럼') || trimmed.includes('BMI 분석:')) {
                blueBoxGroup.push(
                    <div key={idx} className="mt-2 first:mt-0">
                        <p className={`text-sm ${textColor} leading-relaxed font-bold flex items-start gap-2`}><span className="text-blue-500 mt-0.5">•</span> {processInlineStyles(trimmed.substring(2))}</p>
                    </div>
                );
            } else {
                flushBlueBoxGroup();
                elements.push(
                    <div key={idx} className="flex items-start gap-2 ml-4 my-1 flex-wrap">
                        <div className="flex items-start gap-2">
                            <span className="text-cyan-500 mt-0.5">•</span>
                            <span className={`text-sm ${textColor}`}>{processInlineStyles(trimmed.substring(2))}</span>
                        </div>
                        {hasNutritionSolutionTag && onOpenNutritionModal && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenNutritionModal();
                                }}
                                className="ml-1 inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/80 dark:text-emerald-300 text-xs font-bold rounded-lg border border-emerald-200 dark:border-emerald-700/60 transition-all cursor-pointer shadow-xs active:scale-95"
                            >
                                <span>🔬 풀 라인업 보기 ↗</span>
                            </button>
                        )}
                    </div>
                );
            }
        } else if (trimmed.startsWith('> ')) {
            blueBoxGroup.push(
                <div key={idx} className={`ml-5 pl-3 py-1 border-l-2 ${isDark ? 'border-blue-500/30' : 'border-blue-200'} text-sm ${textColor} leading-relaxed font-medium`}>
                    {processInlineStyles(trimmed.substring(2))}
                </div>
            );
        } else if (trimmed.startsWith('💡') || trimmed.startsWith('📚') || trimmed.startsWith('⏱️') || trimmed.startsWith('📊') || trimmed.startsWith('📈') || trimmed.startsWith('📉')) {
            flushBlueBoxGroup();
            elements.push(
                <div key={idx} className={`p-3 ${isDark ? 'bg-slate-800/50' : 'bg-cyan-50/50'} rounded-lg my-2 text-sm ${textColor}`}>
                    {processInlineStyles(trimmed)}
                </div>
            );
        } else if (trimmed.startsWith('$$') && trimmed.endsWith('$$')) {
            // LaTeX formula - display as code block style
            elements.push(
                <div key={idx} className={`p-3 ${bgColor} rounded-lg my-2 font-mono text-xs ${textColor} overflow-x-auto`}>
                    {trimmed.slice(2, -2)}
                </div>
            );
        } else if (trimmed) {
            flushBlueBoxGroup();
            elements.push(<p key={idx} className={`text-sm ${textColor} my-1 leading-relaxed`}>{processInlineStyles(trimmed)}</p>);
        }
    });

    // Flush any remaining blue box group at EOF
    flushBlueBoxGroup();

    if (inNutritionSection && onOpenNutritionModal) {
        elements.push(renderNutritionCta(elements.length));
        inNutritionSection = false;
    }

    // Handle any remaining routine block at EOF
    if (inRoutineBlock) {
        elements.push(
            <div key="routine-final" className={`p-4 border-l-4 border-amber-400 bg-amber-50 dark:bg-amber-900/30 dark:border-amber-500 rounded-r-lg my-4 shadow-sm`}>
                <div className={`font-bold text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-2`}>
                    <span className="text-lg">📌</span>
                    <span>{processInlineStyles(routineTitle.substring(1).trim())}</span>
                </div>
                <div className="space-y-1">
                    {routineItems}
                </div>
            </div>
        );
    }

    // Handle any remaining table
    if (inTable && tableHeaders.length > 0) {
        elements.push(
            <div key="table-final" className="overflow-x-auto my-4">
                <table className="min-w-full text-sm border-collapse">
                    <thead>
                        <tr className={isDark ? 'bg-slate-800' : 'bg-slate-100'}>
                            {tableHeaders.map((h, i) => (
                                <th key={i} className={`px-3 py-2 text-left font-bold border ${isDark ? 'text-slate-300' : 'text-slate-700'} ${borderColor}`}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {tableRows.map((row, ri) => (
                            <tr key={ri} className={ri % 2 === 0 ? (isDark ? 'bg-slate-900' : 'bg-white') : (isDark ? 'bg-slate-800' : 'bg-slate-50')}>
                                {row.map((cell, ci) => (
                                    <td key={ci} className={`px-3 py-2 border ${borderColor} ${textColor}`}>{cell}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    return <div className="space-y-1">{elements}</div>;
};