import React, { useMemo, useState } from 'react';
import { ClassificationResult, CareType } from '../types';
import { CARE_TYPE_LABELS } from '../logicEngine';
import { ExpertOverlay } from './ExpertOverlay';
import { generateDeepInsight, DeepInsight } from '../services/deepInsightEngine';
import {
    getChronotypeAdvice,
    getVARKAdvice,
    getTestAnxietyAdvice,
    getDigitalAddictionAdvice,
    getMetacognitionAdvice
} from '../data/studyEfficiencyAdvice';
import CircularSchedule from './ui/CircularSchedule';

// Simple markdown renderer for Vitality/Fatigue section
const renderSimpleMarkdown = (text: string, isDark: boolean = false): React.ReactNode => {
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

    const textColor = isDark ? 'text-slate-200' : 'text-slate-600';
    const strongColor = isDark ? 'text-white' : 'text-slate-800';
    const headingColor = isDark ? 'text-cyan-400' : 'text-cyan-800';
    const subHeadingColor = isDark ? 'text-cyan-300' : 'text-cyan-700';
    const borderColor = isDark ? 'border-slate-700' : 'border-slate-200';
    const bgColor = isDark ? 'bg-slate-800' : 'bg-slate-100';

    const processInlineStyles = (line: string): React.ReactNode => {
        // Process **bold** text
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
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
            elements.push(<h3 key={idx} className={`text-lg font-black ${headingColor} mt-6 mb-3 flex items-center gap-2`}>{trimmed.substring(3)}</h3>);
        } else if (trimmed.startsWith('### ')) {
            flushBlueBoxGroup();
            elements.push(<h4 key={idx} className={`text-base font-bold ${subHeadingColor} mt-4 mb-2`}>{trimmed.substring(4)}</h4>);
        } else if (trimmed.startsWith('---')) {
            flushBlueBoxGroup();
            elements.push(<hr key={idx} className={`my-4 ${isDark ? 'border-slate-700' : 'border-cyan-200'}`} />);
        } else if (trimmed.startsWith('• ') || trimmed.startsWith('- ')) {
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
                    <div key={idx} className="flex items-start gap-2 ml-4 my-1">
                        <span className="text-cyan-500 mt-0.5">•</span>
                        <span className={`text-sm ${textColor}`}>{processInlineStyles(trimmed.substring(2))}</span>
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


interface NeuroInsightReportProps {
    analysisText: string;
    classificationResult?: ClassificationResult;
    assessmentResult: any; // Add assessmentResult prop to access full data
    reportMode?: 'expert' | 'student';
    customSubjectStrategy?: string; // New prop for custom overriding strategy
    aiModels?: any; // To pass down to ExpertOverlay
    showExpertGuide?: boolean;
    onCloseExpertGuide?: () => void;
}

// Parse the analysis text and render it as structured cards
export const NeuroInsightReport: React.FC<NeuroInsightReportProps> = ({ analysisText, classificationResult, assessmentResult, reportMode = 'expert', customSubjectStrategy, aiModels, showExpertGuide, onCloseExpertGuide }) => {
    const [showDeepInsight, setShowDeepInsight] = useState(false);

    // Student Mode Sections Whitelist
    const STUDENT_SECTIONS = ['1', '2', '4', '4-2', '5', '5-6', '7'];

    // Top 3 Scores Visualization using useMemo based on reportMode
    const topScores = useMemo(() => {
        if (!classificationResult?.allScores) return [];
        // Student Mode: Show only top 1 (Primary) to reduce distraction
        if (reportMode === 'student') {
            return classificationResult.allScores.slice(0, 1);
        }
        return classificationResult.allScores.slice(0, 3);
    }, [classificationResult, reportMode]);

    // Check for valid EEG data
    const hasEegData = useMemo(() => {
        if (!assessmentResult?.hrv) return false;
        const { eegAlpha, eegLBeta, eegMBeta, eegHBeta, eegTheta, eegGamma } = assessmentResult.hrv;
        // Check if any of the main waves have non-zero values
        return (eegAlpha > 0 || eegLBeta > 0 || eegMBeta > 0 || eegHBeta > 0 || eegTheta > 0 || eegGamma > 0);
    }, [assessmentResult]);

    // Parse sections from the markdown-style text
    const parseSection = (text: string, sectionId: string): { items: string[]; subItems: string[]; rawContent?: string } => {
        // ANS section (5), Vitality/Fatigue section (5-2), Brain Balance Radar (5-3), Stress/Concentration (5-4), Integrated (5-5), Cognitive (5-6), Peak Time (4-2), Action Plan (7) need special handling
        const isSpecialSection = ['1', '5', '5-2', '5-3', '5-4', '5-5', '5-6', '4-2', '7'].includes(sectionId);
        const escapedId = sectionId.replace('-', '\\s*-\\s*');

        // Sections with internal separators need careful regex
        const regexPattern = ['1', '5', '5-2', '5-3', '5-4', '5-5', '5-6', '4-2', '7'].includes(sectionId)
            ? `##\\s*\\[${escapedId}\\][^\\r\\n]*[\\r\\n]+([\\s\\S]*?)(?=##\\s*\\[|$)`
            : isSpecialSection
                ? `##\\s*\\[${escapedId}\\][^\\r\\n]*[\\r\\n]+([\\s\\S]*?)(?=##\\s*\\[|---|$)`
                : `##\\s*\\[${escapedId}\\][^\\r\\n]*[\\r\\n]+([\\s\\S]*?)(?=##\\s*\\[|### |---|$)`;

        const regex = new RegExp(regexPattern, 'g');
        const match = regex.exec(text);
        if (!match) return { items: [], subItems: [] };

        // For special sections, return raw content
        if (isSpecialSection) {
            return { items: [], subItems: [], rawContent: match[1].trim() };
        }

        const content = match[1];
        const items: string[] = [];
        const subItems: string[] = [];

        content.split('\n').forEach(line => {
            const trimmed = line.trim();
            if (trimmed.startsWith('- ')) {
                items.push(trimmed.substring(2));
            } else if (trimmed.startsWith('> ')) {
                subItems.push(trimmed.substring(2));
            }
        });

        return { items, subItems };
    };

    // Parse ANS section content into subsections
    const parseAnsContent = (rawContent: string): { intro: string; subsections: { title: string; content: string }[] } => {
        const lines = rawContent.split('\n');
        let intro = '';
        const subsections: { title: string; content: string }[] = [];
        let currentSubsection: { title: string; content: string[] } | null = null;

        for (const line of lines) {
            if (line.startsWith('### ')) {
                if (currentSubsection) {
                    subsections.push({ title: currentSubsection.title, content: currentSubsection.content.join('\n').trim() });
                }
                currentSubsection = { title: line.substring(4).trim(), content: [] };
            } else if (currentSubsection) {
                currentSubsection.content.push(line);
            } else {
                intro += line + '\n';
            }
        }

        if (currentSubsection) {
            subsections.push({ title: currentSubsection.title, content: currentSubsection.content.join('\n').trim() });
        }

        return { intro: intro.trim(), subsections };
    };

    // Section configurations
    const sections = [
        {
            id: '1',
            icon: '💪',
            title: '맞춤형 신체-학습 연결 리포트',
            subtitle: 'Physical-Learning Analysis',
            color: 'blue'
        },
        {
            id: '2',
            icon: '🧠',
            title: '성향 기반 학습 전략',
            subtitle: 'MBTI & Subject Strategy',
            color: 'purple'
        },
        {
            id: '3',
            icon: '📊',
            title: '정밀 데이터 분석',
            subtitle: 'Data Insight',
            color: 'indigo'
        },
        {
            id: '4',
            icon: '📈',
            title: '공부 효율성 정밀 검사',
            subtitle: 'Study Efficiency Assessment',
            color: 'violet',
            isStudyEfficiency: true  // Special flag for custom rendering
        },
        {
            id: '4-2',
            icon: '🕒',
            title: '최적 두뇌 가동 골든타임표',
            subtitle: 'Brain Peak Time Schedule',
            color: 'indigo'
        },
        {
            id: '5',
            icon: '🧠',
            title: '자율신경 균형에 따른 공부법',
            subtitle: 'ANS-Based Study Method',
            color: 'teal'
        },
        {
            id: '5-2',
            icon: '🔋',
            title: 'Vitality & Fatigue Index 기반 학습법',
            subtitle: 'Energy-Based Study Method',
            color: 'cyan'
        },
        {
            id: '5-3',
            icon: '🧠',
            title: 'Brain Balance Radar 분석',
            subtitle: 'EEG-Based Study Method',
            color: 'violet'
        },
        {
            id: '5-4',
            icon: '📊',
            title: 'Stress & Concentration Gauge 공부법',
            subtitle: 'Gauge-Based Subject Study Method',
            color: 'rose'
        },
        {
            id: '5-5',
            icon: '🎯',
            title: '통합 학습 최적화 요약',
            subtitle: 'Integrated Study Optimization Summary',
            color: 'amber'
        },
        {
            id: '5-6',
            icon: '🧠',
            title: '통합 인지 진단',
            subtitle: 'Working Memory Diagnostic Results',
            color: 'fuchsia'
        },
        {
            id: '6',
            icon: '📈',
            title: '데이터 상관관계 & 번아웃 알람',
            subtitle: 'Correlation & Burnout Alert',
            color: 'orange'
        },
        {
            id: '7',
            icon: '🎯',
            title: '최종 솔루션 제안',
            subtitle: 'Action Plan',
            color: 'emerald'
        }
    ];

    const colorClasses: Record<string, { bg: string; border: string; icon: string; title: string; badge: string; itemBg: string }> = {
        blue: { bg: 'bg-gradient-to-br from-blue-50 to-sky-50', border: 'border-blue-200', icon: 'bg-blue-100 text-blue-600', title: 'text-blue-900', badge: 'bg-blue-500', itemBg: 'hover:bg-blue-50' },
        purple: { bg: 'bg-gradient-to-br from-purple-50 to-fuchsia-50', border: 'border-purple-200', icon: 'bg-purple-100 text-purple-600', title: 'text-purple-900', badge: 'bg-purple-500', itemBg: 'hover:bg-purple-50' },
        indigo: { bg: 'bg-gradient-to-br from-indigo-50 to-violet-50', border: 'border-indigo-200', icon: 'bg-indigo-100 text-indigo-600', title: 'text-indigo-900', badge: 'bg-indigo-500', itemBg: 'hover:bg-indigo-50' },
        teal: { bg: 'bg-gradient-to-br from-teal-50 to-cyan-50', border: 'border-teal-200', icon: 'bg-teal-100 text-teal-600', title: 'text-teal-900', badge: 'bg-teal-500', itemBg: 'hover:bg-teal-50' },
        cyan: { bg: 'bg-gradient-to-br from-cyan-50 to-sky-50', border: 'border-cyan-200', icon: 'bg-cyan-100 text-cyan-600', title: 'text-cyan-900', badge: 'bg-cyan-500', itemBg: 'hover:bg-cyan-50' },
        violet: { bg: 'bg-gradient-to-br from-violet-50 to-purple-50', border: 'border-violet-200', icon: 'bg-violet-100 text-violet-600', title: 'text-violet-900', badge: 'bg-violet-500', itemBg: 'hover:bg-violet-50' },
        rose: { bg: 'bg-gradient-to-br from-rose-50 to-pink-50', border: 'border-rose-200', icon: 'bg-rose-100 text-rose-600', title: 'text-rose-900', badge: 'bg-rose-500', itemBg: 'hover:bg-rose-50' },
        amber: { bg: 'bg-gradient-to-br from-amber-50 to-yellow-50', border: 'border-amber-200', icon: 'bg-amber-100 text-amber-600', title: 'text-amber-900', badge: 'bg-amber-500', itemBg: 'hover:bg-amber-50' },
        orange: { bg: 'bg-gradient-to-br from-orange-50 to-amber-50', border: 'border-orange-200', icon: 'bg-orange-100 text-orange-600', title: 'text-orange-900', badge: 'bg-orange-500', itemBg: 'hover:bg-orange-50' },
        emerald: { bg: 'bg-gradient-to-br from-emerald-50 to-teal-50', border: 'border-emerald-200', icon: 'bg-emerald-100 text-emerald-600', title: 'text-emerald-900', badge: 'bg-emerald-500', itemBg: 'hover:bg-emerald-50' },
        fuchsia: { bg: 'bg-gradient-to-br from-fuchsia-50 to-pink-50', border: 'border-fuchsia-200', icon: 'bg-fuchsia-100 text-fuchsia-600', title: 'text-fuchsia-900', badge: 'bg-fuchsia-500', itemBg: 'hover:bg-fuchsia-50' }
    };

    // Parse item into label and value
    const parseItem = (item: string): { label: string; value: string; icon?: string; isWarning: boolean; isSuccess: boolean; isDanger: boolean } => {
        // Check for warning/success indicators
        const isWarning = item.includes('⚠️');
        const isSuccess = item.includes('✅');
        const isDanger = item.includes('🚨') || item.includes('[심각]') || item.includes('[경고]');

        // Extract leading emoji if exists
        const emojiMatch = item.match(/^([⚡🏥💊🎓📍🎯💪🌅💤📱🏆🧠]+)\s*/);
        const icon = emojiMatch ? emojiMatch[1] : undefined;
        const cleanedItem = emojiMatch ? item.substring(emojiMatch[0].length) : item;

        // Try to parse label: value format
        const match = cleanedItem.match(/^\*\*(.+?)\*\*:\s*(.+)$/);
        if (match) {
            return { label: match[1], value: match[2], icon, isWarning, isSuccess, isDanger };
        }

        // Check for bracketed prefix like [부신케어]
        const bracketMatch = cleanedItem.match(/^\[(.+?)\]\s*(.+)$/);
        if (bracketMatch) {
            return { label: bracketMatch[1], value: bracketMatch[2], icon, isWarning, isSuccess, isDanger };
        }

        return { label: '', value: cleanedItem, icon, isWarning, isSuccess, isDanger };
    };

    // Parse all sections
    const parsedSections = sections.map(section => {
        const { items, subItems, rawContent } = parseSection(analysisText, section.id);

        // DEBUG: Force visible content for 4-2 if missing
        if (section.id === '4-2' && !rawContent) {
            return {
                ...section,
                items,
                subItems,
                rawContent: "### 🕒 데이터 로딩 실패 또는 파싱 오류\n\n분석 데이터가 리포트 텍스트에 포함되지 않았거나 헤더 형식이 일치하지 않습니다.\n\n[진단 가이드]\n- Clinical Engine에서 `brainPeakTimeSchedule`이 정상 생성되었는지 확인\n- Section Header가 `## [4-2]` 형식인지 확인"
            };
        }

        return { ...section, items, subItems, rawContent };
    });

    // Check for exam strategy section (새로운 형식: ## 📈 수험생 실전 전략)
    const hasExamStrategy = analysisText.includes('## 📈 수험생 실전 전략');
    let examDayContent = '';
    let vulnerableTimeContent = '';

    if (hasExamStrategy) {
        // Extract the entire exam strategy section
        // 정규식 수정: 다음 섹션 헤더(##) 또는 구분선(---) 또는 끝($)까지 캡처
        const examMatch = analysisText.match(/##\s*📈\s*수험생\s*실전\s*전략[^\n]*\n([\s\S]*?)(?=##|---| \n\n\n|$)/);
        if (examMatch) {
            const fullContent = examMatch[1];

            // D-Day 전략 추출
            const dayMatch = fullContent.match(/🎯 \*\*시험 당일 전략[^\n]*\*\*\n([\s\S]*?)(?=⏰ |$)/);
            if (dayMatch) {
                examDayContent = dayMatch[0].trim();
            }

            // 취약 시간대 전략 추출
            const timeMatch = fullContent.match(/⏰ \*\*취약 시간대[^\n]*\*\*\n([\s\S]*)/);
            if (timeMatch) {
                vulnerableTimeContent = timeMatch[0].trim();
            }
        }
    }

    return (
        <div className="space-y-6 mt-8">
            {/* Professional Laboratory Header */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 print:border-none print:shadow-none">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center p-2">
                        <div className="text-white text-[8px] font-bold text-center leading-tight">
                            L.A.P.S<br />LAB
                        </div>
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tighter">NEURO-EDULAB</h3>
                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.3em]">Learning Analytics & Physiology System</p>
                    </div>
                </div>
                <div className="text-right border-l-2 border-slate-100 pl-6 hidden md:block">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Authenticated by</p>
                    <p className="text-sm font-bold text-slate-700">SYNAPSE CORE PROTOCOL</p>
                    <p className="text-[10px] text-slate-400">Ver 2.5.0-Precision</p>
                </div>
            </div>

            {/* Comprehensive Classification Analysis (New) */}
            {classificationResult && (
                <div id="section-overview" className="bg-white rounded-3xl overflow-hidden border-2 border-slate-200 shadow-sm">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50 print-avoid-break">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-indigo-200">
                                    📊
                                </div>
                                <div>
                                    <h4 className="text-xl font-black text-slate-800 tracking-tight">종합 진단 분석</h4>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Diagnostic Overview</p>
                                </div>
                            </div>
                            {/* Deep Insight Hidden Button */}
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    console.log("Deep Insight button clicked");
                                    setShowDeepInsight(true);
                                }}
                                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors ml-2 cursor-pointer relative z-[100] print:hidden"
                                type="button"
                                title="전문가용 심층 분석 (Deep Insight)"
                                style={{ pointerEvents: 'auto' }}
                            >
                                <span className="text-sm font-bold pointer-events-none">?</span>
                            </button>
                            <div className="hidden md:block text-right">
                                <p className="text-xs font-bold text-slate-500">Primary Classification</p>
                                <p className="text-lg font-black text-indigo-600">{CARE_TYPE_LABELS[classificationResult.primary]?.name}</p>
                            </div>
                        </div>
                    </div>
                    {/* 전문가 가이드 오버레이 (Expert Only) */}
                    {reportMode === 'expert' && (
                        <ExpertOverlay
                            careType={classificationResult?.primary}
                            // TODO: Adrenal score needs to be passed here if available
                            adrenalFatigueScore={0}
                            score={topScores.length > 0 ? topScores[0].score : 0}
                            aiModels={aiModels}
                            isOpen={showExpertGuide}
                            onClose={onCloseExpertGuide}
                        />
                    )}
                    <div className="p-6">
                        <div className="space-y-6">
                            {topScores.map((score, idx) => {
                                const isPrimary = idx === 0;
                                const label = CARE_TYPE_LABELS[score.type];

                                // Severity Logic
                                let severityColor = 'bg-rose-500'; // Default High
                                let severityText = '심각';
                                if (score.score <= 25) {
                                    severityColor = 'bg-emerald-500';
                                    severityText = '정상';
                                } else if (score.score <= 50) {
                                    severityColor = 'bg-amber-500';
                                    severityText = '주의';
                                }

                                return (
                                    <div key={score.type} className="flex flex-col md:flex-row gap-6 p-4 rounded-xl hover:bg-slate-50 transition-colors print-avoid-break">
                                        {/* Left: Identity */}
                                        <div className="md:w-48 flex-shrink-0 flex flex-row md:flex-col items-center md:items-start md:justify-center gap-2 md:gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl">{label?.icon}</span>
                                                <span className={`font-bold ${isPrimary ? 'text-indigo-900 text-lg' : 'text-slate-700'}`}>
                                                    {label?.name}
                                                </span>
                                            </div>
                                            {isPrimary && <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] rounded-full font-bold">PRIMARY</span>}
                                        </div>

                                        {/* Right: Visualization & Content */}
                                        <div className="flex-1 w-full space-y-3">
                                            <div className="flex justify-between items-end mb-1">
                                                <div className="flex-1"></div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${score.score <= 25 ? 'bg-emerald-100 text-emerald-700' :
                                                        score.score <= 50 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                                                        }`}>
                                                        {severityText}
                                                    </span>
                                                    <span className={`font-bold ${isPrimary ? 'text-indigo-600' : 'text-slate-500'}`}>{score.score}점</span>
                                                </div>
                                            </div>

                                            {/* Score Bar with Zones */}
                                            <div className="relative pt-6 pb-1">
                                                {/* Zone Background Indicators */}
                                                <div className="absolute top-0 left-0 right-0 flex h-1.5 text-xs font-bold text-slate-300">
                                                    <div className="w-[25%] border-r border-slate-200 text-emerald-400 text-center relative"><span className="absolute -top-5 left-0 right-0">정상</span></div>
                                                    <div className="w-[25%] border-r border-slate-200 text-amber-400 text-center relative"><span className="absolute -top-5 left-0 right-0">주의</span></div>
                                                    <div className="w-[50%] text-rose-400 text-center relative"><span className="absolute -top-5 left-0 right-0">심각</span></div>
                                                </div>

                                                {/* Bar Track */}
                                                <div className="h-3 bg-slate-100 rounded-full overflow-hidden relative z-10">
                                                    {/* Severity Zones Background (Subtle) */}
                                                    <div className="absolute inset-0 flex opacity-20">
                                                        <div className="w-[25%] bg-emerald-200"></div>
                                                        <div className="w-[25%] bg-amber-200"></div>
                                                        <div className="w-[50%] bg-rose-200"></div>
                                                    </div>

                                                    {/* Active Score Bar */}
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-1000 relative z-20 ${severityColor}`}
                                                        style={{ width: `${score.score}%` }}
                                                    ></div>
                                                </div>
                                            </div>

                                            {/* Descriptions */}
                                            <div className="space-y-1">
                                                <p className="text-xs text-slate-400 font-medium">{label?.description}</p>
                                                {label?.publicDescription && (
                                                    <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                                                        <span className="mr-1.5">💡</span>
                                                        {label.publicDescription}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {parsedSections.map((section) => {
                // Student Mode Filtering
                if (reportMode === 'student' && !STUDENT_SECTIONS.includes(section.id)) {
                    return null;
                }

                const colors = colorClasses[section.color];

                // Skip if no items and no rawContent (for ANS section)
                const isStudyEfficiencySection = section.id === '4' && assessmentResult?.studyEfficiencyResults;
                if (section.items.length === 0 && !section.rawContent && !isStudyEfficiencySection) return null;

                return (
                    <div
                        key={section.id}
                        id={`section-${section.id}`}
                        className={`${colors.bg} ${colors.border} border-2 rounded-3xl overflow-hidden print-page-break print-avoid-break transition-all duration-300 hover:shadow-xl`}
                    >
                        {/* Section Header */}
                        <div className="p-6 border-b border-white/50 backdrop-blur-sm">
                            <div className="flex items-center gap-4">
                                <div className={`w-14 h-14 ${colors.icon} rounded-2xl flex items-center justify-center text-2xl shadow-sm font-bold`}>
                                    {section.icon}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <span className={`w-1.5 h-7 ${colors.badge} rounded-full`}></span>
                                        <h4 className={`text-xl font-black ${colors.title} tracking-tight`}>{section.title}</h4>
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1 ml-4">
                                        {section.subtitle}
                                    </p>
                                </div>
                                <div className={`w-10 h-10 ${colors.badge} text-white rounded-xl flex items-center justify-center text-lg font-black shadow-lg`}>
                                    {section.id}
                                </div>
                            </div>
                        </div>

                        {/* Section Content */}
                        <div className="p-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {/* Special rendering for Section 1 (Physical-Learning) */}
                                {section.id === '1' && section.rawContent && (
                                    <div className="col-span-full">
                                        <div className="p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-blue-100">
                                            {renderSimpleMarkdown(section.rawContent)}
                                        </div>
                                    </div>
                                )}

                                {/* Special rendering for Study Efficiency section (4) */}
                                {section.id === '4' && assessmentResult?.studyEfficiencyResults && (
                                    <div className="col-span-full">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {/* 크로노타입 */}
                                            {assessmentResult.studyEfficiencyResults.chronotype && (
                                                <div className="bg-white/80 p-4 rounded-2xl border border-violet-100">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-xl">🌅</span>
                                                        <h5 className="font-bold text-slate-800 text-sm">CHRONOTYPE</h5>
                                                    </div>
                                                    <p className="text-lg font-black text-violet-600">
                                                        {assessmentResult.studyEfficiencyResults.chronotype.result === 'definite_morning' ? '확실한 아침형' :
                                                            assessmentResult.studyEfficiencyResults.chronotype.result === 'moderate_morning' ? '다소 아침형' :
                                                                assessmentResult.studyEfficiencyResults.chronotype.result === 'intermediate' ? '중간형' :
                                                                    assessmentResult.studyEfficiencyResults.chronotype.result === 'moderate_evening' ? '다소 저녁형' : '확실한 저녁형'}
                                                    </p>
                                                    <details className="mt-3 group">
                                                        <summary className="text-xs font-bold text-violet-500 cursor-pointer hover:text-violet-700 flex items-center gap-1 list-none">
                                                            <span className="group-open:rotate-90 transition-transform">▶</span> 맞춤 솔루션 보기
                                                        </summary>
                                                        <div className="mt-2 text-xs text-slate-600 leading-relaxed bg-violet-50 p-3 rounded-lg">
                                                            {getChronotypeAdvice(assessmentResult.studyEfficiencyResults.chronotype.result, classificationResult?.primary || CareType.HEALTHY)}
                                                        </div>
                                                    </details>
                                                </div>
                                            )}

                                            {/* VARK */}
                                            {assessmentResult.studyEfficiencyResults.vark && (
                                                <div className="bg-white/80 p-4 rounded-2xl border border-violet-100">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-xl">🎯</span>
                                                        <h5 className="font-bold text-slate-800 text-sm">LEARNING STYLE</h5>
                                                    </div>
                                                    <p className="text-lg font-black text-indigo-600">
                                                        {assessmentResult.studyEfficiencyResults.vark.primary === 'V' ? '시각형 (Visual)' :
                                                            assessmentResult.studyEfficiencyResults.vark.primary === 'A' ? '청각형 (Auditory)' :
                                                                assessmentResult.studyEfficiencyResults.vark.primary === 'R' ? '읽기쓰기형 (Read/Write)' : '운동감각형 (Kinesthetic)'}
                                                    </p>
                                                    <details className="mt-3 group">
                                                        <summary className="text-xs font-bold text-indigo-500 cursor-pointer hover:text-indigo-700 flex items-center gap-1 list-none">
                                                            <span className="group-open:rotate-90 transition-transform">▶</span> 맞춤 솔루션 보기
                                                        </summary>
                                                        <div className="mt-2 text-xs text-slate-600 leading-relaxed bg-indigo-50 p-3 rounded-lg">
                                                            {getVARKAdvice(assessmentResult.studyEfficiencyResults.vark, classificationResult?.primary || CareType.HEALTHY)}
                                                        </div>
                                                    </details>
                                                </div>
                                            )}

                                            {/* 시험 불안 */}
                                            {assessmentResult.studyEfficiencyResults.testAnxiety && (
                                                <div className="bg-white/80 p-4 rounded-2xl border border-violet-100">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-xl">😰</span>
                                                        <h5 className="font-bold text-slate-800 text-sm">TEST ANXIETY</h5>
                                                    </div>
                                                    <p className={`text-lg font-black ${assessmentResult.studyEfficiencyResults.testAnxiety.severity === 'low' ? 'text-emerald-600' :
                                                        assessmentResult.studyEfficiencyResults.testAnxiety.severity === 'moderate' ? 'text-amber-600' : 'text-red-600'
                                                        }`}>
                                                        {assessmentResult.studyEfficiencyResults.testAnxiety.severity === 'low' ? '낮음' :
                                                            assessmentResult.studyEfficiencyResults.testAnxiety.severity === 'moderate' ? '중등도' : '높음'}
                                                        <span className="text-xs text-slate-500 ml-2">
                                                            ({assessmentResult.studyEfficiencyResults.testAnxiety.dominantType === 'cognitive' ? '인지적 걱정형' :
                                                                assessmentResult.studyEfficiencyResults.testAnxiety.dominantType === 'somatic' ? '신체적 긴장형' : '복합형'})
                                                        </span>
                                                    </p>
                                                    <details className="mt-3 group">
                                                        <summary className="text-xs font-bold text-orange-500 cursor-pointer hover:text-orange-700 flex items-center gap-1 list-none">
                                                            <span className="group-open:rotate-90 transition-transform">▶</span> 맞춤 솔루션 보기
                                                        </summary>
                                                        <div className="mt-2 text-xs text-slate-600 leading-relaxed bg-orange-50 p-3 rounded-lg">
                                                            {getTestAnxietyAdvice(assessmentResult.studyEfficiencyResults.testAnxiety, classificationResult?.primary || CareType.HEALTHY)}
                                                        </div>
                                                    </details>
                                                </div>
                                            )}

                                            {/* 디지털 의존도 */}
                                            {assessmentResult.studyEfficiencyResults.digitalAddiction && (
                                                <div className="bg-white/80 p-4 rounded-2xl border border-violet-100">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-xl">📱</span>
                                                        <h5 className="font-bold text-slate-800 text-sm">DIGITAL BALANCE</h5>
                                                    </div>
                                                    <p className={`text-lg font-black ${assessmentResult.studyEfficiencyResults.digitalAddiction.level === 'healthy' ? 'text-emerald-600' :
                                                        assessmentResult.studyEfficiencyResults.digitalAddiction.level === 'caution' ? 'text-yellow-600' :
                                                            assessmentResult.studyEfficiencyResults.digitalAddiction.level === 'risk' ? 'text-orange-600' : 'text-red-600'
                                                        }`}>
                                                        {assessmentResult.studyEfficiencyResults.digitalAddiction.level === 'healthy' ? '건강' :
                                                            assessmentResult.studyEfficiencyResults.digitalAddiction.level === 'caution' ? '주의' :
                                                                assessmentResult.studyEfficiencyResults.digitalAddiction.level === 'risk' ? '위험' : '심각'}
                                                        <span className="text-xs text-slate-500 ml-2">(점수: {assessmentResult.studyEfficiencyResults.digitalAddiction.totalScore}점)</span>
                                                    </p>
                                                    <details className="mt-3 group">
                                                        <summary className="text-xs font-bold text-pink-500 cursor-pointer hover:text-pink-700 flex items-center gap-1 list-none">
                                                            <span className="group-open:rotate-90 transition-transform">▶</span> 맞춤 솔루션 보기
                                                        </summary>
                                                        <div className="mt-2 text-xs text-slate-600 leading-relaxed bg-pink-50 p-3 rounded-lg">
                                                            {getDigitalAddictionAdvice(assessmentResult.studyEfficiencyResults.digitalAddiction, classificationResult?.primary || CareType.HEALTHY)}
                                                        </div>
                                                    </details>
                                                </div>
                                            )}

                                            {/* 메타인지 */}
                                            {assessmentResult.studyEfficiencyResults.metacognition && (
                                                <div className="bg-white/80 p-4 rounded-2xl border border-violet-100">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-xl">🧠</span>
                                                        <h5 className="font-bold text-slate-800 text-sm">METACOGNITION</h5>
                                                    </div>
                                                    <p className="text-lg font-black text-purple-600">
                                                        {assessmentResult.studyEfficiencyResults.metacognition.learnerLevel === 'beginner' ? '초보 학습자' :
                                                            assessmentResult.studyEfficiencyResults.metacognition.learnerLevel === 'developing' ? '발전중 학습자' :
                                                                assessmentResult.studyEfficiencyResults.metacognition.learnerLevel === 'proficient' ? '숙련 학습자' : '전문 학습자'}
                                                    </p>
                                                    <details className="mt-3 group">
                                                        <summary className="text-xs font-bold text-purple-500 cursor-pointer hover:text-purple-700 flex items-center gap-1 list-none">
                                                            <span className="group-open:rotate-90 transition-transform">▶</span> 맞춤 솔루션 보기
                                                        </summary>
                                                        <div className="mt-2 text-xs text-slate-600 leading-relaxed bg-purple-50 p-3 rounded-lg">
                                                            {getMetacognitionAdvice(assessmentResult.studyEfficiencyResults.metacognition, classificationResult?.primary || CareType.HEALTHY)}
                                                        </div>
                                                    </details>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {section.id === '4-2' && section.rawContent && (() => {
                                    const goldenStart = assessmentResult?.hrv?.goldenTimeStart || "09:00";
                                    const goldenEnd = assessmentResult?.hrv?.goldenTimeEnd || "12:00";
                                    const startHour = parseInt(goldenStart.split(':')[0]);
                                    const endHour = parseInt(goldenEnd.split(':')[0]);
                                    
                                    return (
                                        <div className="col-span-full flex flex-col xl:flex-row gap-6">
                                            <div className="flex-1 p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-indigo-100 flex items-center justify-center min-h-[400px]">
                                                <CircularSchedule 
                                                    isDark={false}
                                                    periods={[
                                                        { id: 'morning', start: 7, end: 9, label: '오전 루틴', color: '#1e40af', icon: '🌞' },
                                                        { id: 'golden', start: startHour, end: endHour, label: 'Golden Hour', color: '#2563eb', icon: '🔥' },
                                                        { id: 'slump', start: 13, end: 14, label: '회복/슬럼프', color: '#94a3b8', icon: '💤' },
                                                        { id: 'second', start: 16, end: 22, label: 'Second Wind', color: '#4f46e5', icon: '🚀' },
                                                        { id: 'sleep', start: 23, end: 24, label: '수면', color: '#334155', icon: '🌙' },
                                                        { id: 'sleep2', start: 0, end: 7, label: '수면', color: '#334155' }
                                                    ]}
                                                />
                                            </div>
                                            <div className="flex-1 p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-indigo-100">
                                                {renderSimpleMarkdown(section.rawContent)}
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* Special rendering for Vitality/Fatigue section (5-2) with Markdown */}
                                {section.id === '5-2' && section.rawContent && (
                                    <div className="col-span-full">
                                        <div className="p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-cyan-100">
                                            {renderSimpleMarkdown(section.rawContent)}
                                        </div>
                                    </div>
                                )}

                                {/* Special rendering for ANS section (5) with subsections */}
                                {section.id === '5' && section.rawContent && (() => {
                                    const ansData = parseAnsContent(section.rawContent);
                                    return (
                                        <div className="col-span-full space-y-4">
                                            {/* ANS Intro */}
                                            {ansData.intro && (
                                                <div className="p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100">
                                                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{ansData.intro}</p>
                                                </div>
                                            )}
                                            {/* ANS Subsections */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {ansData.subsections.map((sub, idx) => {
                                                    let mainContent = sub.content;
                                                    let routineContent = '';
                                                    const routineIndex = sub.content.indexOf('💡 루틴:');
                                                    const altRoutineIndex = sub.content.indexOf('💡 즉시 실천:');
                                                    const matchIndex = routineIndex !== -1 ? routineIndex : altRoutineIndex !== -1 ? altRoutineIndex : -1;
                                                    
                                                    if (matchIndex !== -1) {
                                                        mainContent = sub.content.substring(0, matchIndex).trim();
                                                        routineContent = sub.content.substring(matchIndex).trim();
                                                    } else {
                                                        const justIdeaIndex = sub.content.indexOf('💡');
                                                        if (justIdeaIndex !== -1 && sub.content.substring(justIdeaIndex).includes('루틴')) {
                                                            mainContent = sub.content.substring(0, justIdeaIndex).trim();
                                                            routineContent = sub.content.substring(justIdeaIndex).trim();
                                                        }
                                                    }

                                                    return (
                                                        <div key={idx} className="p-4 bg-white/90 backdrop-blur-sm rounded-2xl border border-teal-100 hover:shadow-lg transition-all flex flex-col h-full">
                                                            <h5 className="font-black text-teal-800 text-sm mb-2">{sub.title}</h5>
                                                            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap flex-1">{mainContent}</p>
                                                            {routineContent && (
                                                                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 rounded-r-lg shadow-sm">
                                                                    <p className="text-xs font-bold text-amber-800 dark:text-amber-300 whitespace-pre-wrap leading-relaxed">
                                                                        {routineContent}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* Special rendering for Brain Balance Radar section (5-3) with EEG Data Check */}
                                {section.id === '5-3' && (
                                    <div className="col-span-full">
                                        <div className="p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-violet-100">
                                            {hasEegData ? (
                                                section.rawContent ? renderSimpleMarkdown(section.rawContent) : <p className="text-sm text-slate-500">분석 내용이 없습니다.</p>
                                            ) : (
                                                <div className="text-center py-8">
                                                    <span className="text-3xl grayscale opacity-50 block mb-2">🧠</span>
                                                    <p className="text-slate-500 font-bold">Brain Balance Radar 분석 데이터가 없습니다.</p>
                                                    <p className="text-xs text-slate-400 mt-1">이 분석은 뇌파(EEG) 측정이 필요합니다. (Medical/Standard Mode only)</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Special rendering for Stress & Concentration Gauge section (5-4) with Markdown */}
                                {section.id === '5-4' && section.rawContent && (
                                    <div className="col-span-full">
                                        <div className="p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-rose-100">
                                            {renderSimpleMarkdown(section.rawContent)}
                                        </div>
                                    </div>
                                )}

                                {/* Special rendering for Integrated Study Optimization section (5-5) with Markdown */}
                                {section.id === '5-5' && section.rawContent && (
                                    <div className="col-span-full">
                                        <div className="p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-amber-100">
                                            {renderSimpleMarkdown(section.rawContent)}
                                        </div>
                                    </div>
                                )}

                                {/* Special rendering for Integrated Cognitive Diagnosis section (5-6) with Markdown */}
                                {section.id === '5-6' && section.rawContent && (
                                    <div className="col-span-full">
                                        <div className="p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-fuchsia-100">
                                            {renderSimpleMarkdown(section.rawContent)}
                                        </div>
                                    </div>
                                )}
                                {/* Special rendering for Action Plan section (7) with Markdown */}
                                {section.id === '7' && section.rawContent && (
                                    <div className="col-span-full">
                                        <div className="p-6 bg-white/90 backdrop-blur-sm rounded-3xl border-2 border-emerald-200 shadow-lg shadow-emerald-100/50">
                                            {renderSimpleMarkdown(section.rawContent, false)}
                                        </div>
                                    </div>
                                )}
                                
                                {/* Handle Custom Subject Strategy Overlay */}
                                {section.id === '2' && customSubjectStrategy ? (
                                    <div className="col-span-full">
                                        <div className="p-5 bg-purple-50/80 backdrop-blur-sm rounded-2xl border border-purple-200">
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="text-xl">🎯</span>
                                                <h5 className="font-bold text-slate-800 text-sm">학생 맞춤형 과목 전략</h5>
                                            </div>
                                            <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                                                {customSubjectStrategy}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    section.id !== '7' && section.items.map((item, itemIdx) => {
                                        const parsed = parseItem(item);

                                    return (
                                        <div
                                            key={itemIdx}
                                            className={`p-4 rounded-2xl transition-all duration-200 border ${parsed.isDanger
                                                ? 'bg-gradient-to-r from-red-100 to-rose-50 border-red-300 shadow-red-100'
                                                : parsed.isWarning
                                                    ? 'bg-gradient-to-r from-amber-100 to-yellow-50 border-amber-300 shadow-amber-100'
                                                    : parsed.isSuccess
                                                        ? 'bg-gradient-to-r from-emerald-100 to-green-50 border-emerald-300 shadow-emerald-100'
                                                        : `bg-white/80 backdrop-blur-sm border-slate-100 ${colors.itemBg}`
                                                } hover:shadow-lg group`}
                                        >
                                            {parsed.icon && (
                                                <span className="text-lg mb-2 block">{parsed.icon}</span>
                                            )}
                                            {parsed.label ? (
                                                <div className="space-y-1">
                                                    <span className={`font-black text-sm block ${parsed.isDanger ? 'text-red-800' : parsed.isWarning ? 'text-amber-800' : parsed.isSuccess ? 'text-emerald-800' : 'text-slate-800'
                                                        }`}>
                                                        {parsed.label}
                                                    </span>
                                                    <span className={`text-sm leading-relaxed block ${parsed.isDanger ? 'text-red-700' : parsed.isWarning ? 'text-amber-700' : parsed.isSuccess ? 'text-emerald-700' : 'text-slate-600'
                                                        }`}>
                                                        {parsed.value.replace(/\*\*/g, '')}
                                                    </span>
                                                </div>
                                            ) : (
                                                <p className={`text-sm leading-relaxed ${parsed.isDanger ? 'text-red-700 font-bold' : parsed.isWarning ? 'text-amber-700 font-medium' : parsed.isSuccess ? 'text-emerald-700 font-medium' : 'text-slate-700'
                                                    }`}>
                                                    {parsed.value.replace(/\*\*/g, '')}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })
                                )}
                            </div>

                            {/* Sub-items (quoted content like 생활 수칙) */}
                            {section.subItems.length > 0 && (
                                <div className="mt-4 p-5 bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-100">
                                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">💡 상세 가이드</p>
                                    <ul className="space-y-2">
                                        {section.subItems.map((subItem, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                                                <span className="text-blue-500 mt-0.5">▸</span>
                                                <span>{subItem.replace(/\*\*/g, '')}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}

            {/* Exam Strategy Section (새로운 상세 전략) - Expert Only */}
            {reportMode === 'expert' && hasExamStrategy && (examDayContent || vulnerableTimeContent) && (
                <div id="section-exam-strategy" className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-300 rounded-3xl overflow-hidden print-avoid-break shadow-lg shadow-amber-100/50">
                    <div className="p-6 border-b border-amber-100 backdrop-blur-sm">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg text-white">
                                📈
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-3">
                                    <span className="w-1.5 h-7 bg-amber-500 rounded-full"></span>
                                    <h4 className="text-xl font-black text-amber-900 tracking-tight">수험생 실전 전략</h4>
                                </div>
                                <p className="text-[10px] text-amber-600 font-bold uppercase tracking-[0.2em] mt-1 ml-4">
                                    Exam Strategy - D-Day Guide
                                </p>
                            </div>
                            <span className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-black rounded-xl shadow-lg uppercase tracking-wider">
                                DETAILED
                            </span>
                        </div>
                    </div>
                    <div className="p-5 space-y-6">
                        {/* D-Day 컨디션 */}
                        {examDayContent && (
                            <div className="bg-white/80 backdrop-blur-sm border border-amber-100 rounded-2xl p-5">
                                <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed whitespace-pre-line">
                                    {examDayContent.replace(/\*\*/g, '')}
                                </div>
                            </div>
                        )}

                        {/* 취약 시간대 */}
                        {vulnerableTimeContent && (
                            <div className="bg-white/80 backdrop-blur-sm border border-orange-100 rounded-2xl p-5">
                                <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed whitespace-pre-line">
                                    {vulnerableTimeContent.replace(/\*\*/g, '')}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* [SECRET] Integrated Killer Tips Section - Expert Only */}
            {reportMode === 'expert' && analysisText.match(/##\s*\[SECRET\]/) && (() => {
                const secretMatch = analysisText.match(/##\s*\[SECRET\][^\n]*\n([\s\S]*?)(?=---|$)/);
                if (!secretMatch) return null;
                const secretContent = secretMatch[1].trim();

                return (
                    <div className="relative group overflow-hidden rounded-3xl border-2 border-slate-900 bg-slate-900 shadow-2xl print-avoid-break mt-8">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/20 blur-[100px] rounded-full pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/20 blur-[100px] rounded-full pointer-events-none"></div>

                        <div className="relative p-6 border-b border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-fuchsia-600 to-purple-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-fuchsia-900/50 text-white">
                                    🏆
                                </div>
                                <div>
                                    <h4 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                                        SECRET KILLER TIPS
                                        <span className="px-2 py-0.5 bg-fuchsia-500/20 text-fuchsia-300 text-[10px] rounded border border-fuchsia-500/30">TOP 1%</span>
                                    </h4>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">
                                        Integrated Bio-Cognitive Solution
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="relative p-6 space-y-4">
                            <div className="prose prose-sm prose-invert max-w-none leading-relaxed">
                                {renderSimpleMarkdown(secretContent, true)}
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* Footer Note */}
            <div className="text-center py-4">
                <p className="text-[10px] text-slate-400 italic">
                    본 리포트는 마인드-바디 커넥트 통합 알고리즘에 의해 생성되었습니다.
                </p>
            </div>

            {/* Deep Insight Modal */}
            {assessmentResult && (
                <DeepInsightModal
                    isOpen={showDeepInsight}
                    onClose={() => setShowDeepInsight(false)}
                    data={generateDeepInsight(assessmentResult)}
                />
            )}
        </div>
    );
};

export default NeuroInsightReport;

const DeepInsightModal = ({ isOpen, onClose, data }: { isOpen: boolean, onClose: () => void, data: DeepInsight }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-slate-900 p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">🕵️‍♂️</span>
                        <div>
                            <h2 className="text-xl font-bold text-white">Deep Insight Inspector</h2>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Expert Clinical Analysis System</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">✕</button>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto space-y-8 bg-slate-50">

                    {/* 1. Core Correlation (인과관계 분석) */}
                    <div>
                        <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 mb-4">
                            <span className="text-indigo-600">🔗</span> Core Correlation Logic
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {data.coreCorrelation.map((group, idx) => (
                                <div key={idx} className="col-span-1 md:col-span-3 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                    <h4 className="font-bold text-indigo-700 mb-4 border-b border-indigo-50 pb-2 flex justify-between items-center">
                                        {group.title}
                                        <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full uppercase tracking-wider">Primary Driver</span>
                                    </h4>
                                    <div className="grid grid-cols-3 gap-4">
                                        {group.items.map((item, i) => (
                                            <div key={i} className={`p-3 rounded-lg border ${item.severity === 'high' ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'}`}>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">{item.label}</p>
                                                <p className={`text-xl font-black mb-2 ${item.severity === 'high' ? 'text-red-600' : 'text-slate-700'}`}>{item.value}</p>
                                                <p className={`text-xs font-bold ${item.severity === 'high' ? 'text-red-500' : 'text-slate-400'}`}>
                                                    {item.severity === 'high' ? '⚠ ' : '✓ '}{item.impact}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 2. Hidden Risk & Mechanism (숨겨진 위험) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 mb-4">
                                <span className="text-amber-600">⚠</span> Hidden Risk Factor
                            </h3>
                            <div className="bg-amber-50 rounded-xl p-5 border border-amber-100 h-full">
                                {data.hiddenRisks.map((risk, idx) => (
                                    <div key={idx} className="mb-4 last:mb-0">
                                        <p className="font-bold text-amber-800 text-sm mb-2">"{risk.description}"</p>
                                        <div className="bg-white/60 rounded-lg p-3 text-xs text-amber-900 leading-relaxed font-medium">
                                            <span className="text-amber-500 font-bold mr-1">MECHANISM:</span>
                                            {risk.mechanism}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 3. Killer Script (결정적 조언) */}
                        <div>
                            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 mb-4">
                                <span className="text-emerald-600">💬</span> Killer Script
                            </h3>
                            <div className="bg-emerald-600 rounded-xl p-6 shadow-lg h-full flex items-center relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                                <p className="text-white font-medium text-lg italic leading-relaxed relative z-10">
                                    "{data.killerScript}"
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 4. Prescription Hierarchy (단계별 처방) */}
                    <div>
                        <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 mb-4">
                            <span className="text-blue-600">🪜</span> Prescription Hierarchy
                        </h3>
                        <div className="space-y-3">
                            {data.prescriptionHierarchy.map((step, idx) => (
                                <div key={idx} className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-blue-400 to-indigo-500"></div>
                                    <div className="min-w-[3rem] h-12 rounded-lg bg-slate-100 flex items-center justify-center font-black text-slate-300 text-xl">0{step.stage}</div>
                                    <div className="flex-1">
                                        <p className="font-bold text-slate-800 text-sm">{step.action}</p>
                                    </div>
                                    <div className="flex-1 text-right">
                                        <p className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full inline-block">
                                            기대효과: {step.effect}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 5. NEW: Personalized Body-Study Connection Report */}
                    {data.personalizedReport && (
                        <div>
                            <h3 className="flex items-center gap-3 text-lg font-bold text-slate-800 mb-4 pt-4 border-t border-slate-200">
                                <span className="text-xl">🌿</span> 맞춤형 신체-학습 연결 리포트
                            </h3>
                            <div className="space-y-4">
                                {/* BMI Analysis */}
                                <div className="p-5 rounded-xl bg-white border border-slate-200">
                                    <h4 className="font-bold text-gray-800 text-base mb-2">💪 BMI 분석: {data.personalizedReport.bmi.title}</h4>
                                    <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{data.personalizedReport.bmi.advice}</p>
                                    {data.personalizedReport.bmi.detail && (
                                        <p className="text-sm text-blue-700 font-medium mt-3 bg-blue-50 border border-blue-100 p-3 rounded-lg">
                                            {data.personalizedReport.bmi.detail}
                                        </p>
                                    )}
                                </div>

                                {/* Recommended Diet */}
                                <div className="p-5 rounded-xl bg-white border border-slate-200">
                                    <h4 className="font-bold text-gray-800 text-base mb-2">🥗 추천 식단: {data.personalizedReport.diet.title}</h4>
                                    <div className="text-sm text-slate-600" style={{ whiteSpace: 'pre-wrap' }}>
                                        {data.personalizedReport.diet.advice}
                                    </div>
                                </div>

                                {/* Exercise Prescription */}
                                <div className="p-5 rounded-xl bg-white border border-slate-200">
                                    <h4 className="font-bold text-gray-800 text-base mb-2">🏃‍♀️ 운동 처방: {data.personalizedReport.exercise.title}</h4>
                                    <div className="text-sm text-slate-600" style={{ whiteSpace: 'pre-wrap' }}>
                                        {data.personalizedReport.exercise.advice}
                                    </div>
                                </div>

                                {/* Learning Efficiency */}
                                <div className="p-5 rounded-xl bg-white border border-slate-200">
                                    <h4 className="font-bold text-gray-800 text-base mb-2">🎓 학습 효율: {data.personalizedReport.learning.title}</h4>
                                    <div className="text-sm text-slate-600" style={{ whiteSpace: 'pre-wrap' }}>
                                        {data.personalizedReport.learning.advice}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};
