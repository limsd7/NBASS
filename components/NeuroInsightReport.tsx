import React, { useMemo, useState } from 'react';
import { ClassificationResult, CareType } from '../types';
import { CARE_TYPE_LABELS } from '../logicEngine';
import { ExpertOverlay } from './ExpertOverlay';
import { UserTierService } from '../services/userTierService';
import { generateDeepInsight, DeepInsight } from '../services/deepInsightEngine';
import {
    getChronotypeAdvice,
    getVARKAdvice,
    getTestAnxietyAdvice,
    getDigitalAddictionAdvice,
    getMetacognitionAdvice
} from '../data/studyEfficiencyAdvice';
import CircularSchedule from './ui/CircularSchedule';
import { generateBrainPeakTimeSchedule } from '../services/chronobiologyEngine';
import { EXPERT_CONTENTS, WEEKLY_PLANS, SUCCESS_INDICATORS } from './ExpertOverlay';
import { DETAILED_CARETYPE_STRATEGIES } from '../data/learningStrategies';
import { getDynamicSubjectRoadmap } from '../services/studyStrategyEngine';
import { generateCognitiveStudyAdaptations } from '../services/cognitiveStudyMappingEngine';
import { mapSurveyDataToResults } from '../services/studyEfficiencyService';
import { inferLearningTraitsFromProfile } from '../data/learningTraitsData';

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


import { SleepAnalysisEditModal } from './modals/SleepAnalysisEditModal';

interface TierLockOverlayProps {
    requiredTier: 'pro' | 'premium' | 'vip';
    title: string;
    description?: string;
    onUnlockClick?: () => void;
}

const TierLockOverlay: React.FC<TierLockOverlayProps> = ({ requiredTier, title, description, onUnlockClick }) => {
    const tierBadge = requiredTier === 'pro'
        ? { name: 'PRO', bg: 'from-blue-600 to-indigo-600', text: 'PRO 등급 이상' }
        : requiredTier === 'premium'
            ? { name: 'PREMIUM', bg: 'from-purple-600 to-indigo-600', text: 'PREMIUM 등급 이상' }
            : { name: 'VIP', bg: 'from-amber-500 to-orange-600', text: 'VIP 전용' };

    return (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl text-center">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${tierBadge.bg} text-white flex items-center justify-center text-xl shadow-lg mb-3 animate-pulse`}>
                🔒
            </div>
            <div className={`inline-block px-3 py-1 rounded-full text-[11px] font-black text-white bg-gradient-to-r ${tierBadge.bg} shadow-sm mb-2`}>
                {tierBadge.text} 잠금 기능
            </div>
            <h4 className="text-base font-black text-white drop-shadow-sm mb-1">{title}</h4>
            {description && <p className="text-xs text-slate-200 font-medium max-w-md mb-4 leading-relaxed">{description}</p>}
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (onUnlockClick) onUnlockClick();
                }}
                className={`px-5 py-2.5 rounded-xl font-black text-xs text-white bg-gradient-to-r ${tierBadge.bg} hover:brightness-110 shadow-lg transition-all transform hover:scale-105 flex items-center gap-2 cursor-pointer`}
            >
                <span>⚡ 지금 잠금 해제하기</span>
                <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-bold">업그레이드</span>
            </button>
        </div>
    );
};

export interface NeuroInsightReportProps {
    analysisText: string;
    classificationResult?: ClassificationResult;
    assessmentResult: any; // Add assessmentResult prop to access full data
    reportMode?: 'expert' | 'student';
    customSubjectStrategy?: string; // New prop for custom overriding strategy
    aiModels?: any; // To pass down to ExpertOverlay
    showExpertGuide?: boolean;
    onCloseExpertGuide?: () => void;
    onUpdateAssessmentResult?: (updatedData: any) => void;
    onUpgradeClick?: (tier: 'pro' | 'premium' | 'vip', reason: string) => void;
}

// Parse the analysis text and render it as structured cards
export const NeuroInsightReport: React.FC<NeuroInsightReportProps> = ({
    analysisText,
    classificationResult,
    assessmentResult,
    reportMode = 'expert',
    customSubjectStrategy,
    aiModels,
    showExpertGuide,
    onCloseExpertGuide,
    onUpdateAssessmentResult,
    onUpgradeClick
}) => {
    const [showDeepInsight, setShowDeepInsight] = useState(false);
    const [showSleepEditModal, setShowSleepEditModal] = useState(false);

    // User Tier Checks
    const userTier = UserTierService.getEffectiveTier(
        { id: assessmentResult?.student?.id, name: assessmentResult?.student?.name, email: assessmentResult?.student?.email },
        assessmentResult?.student?.membershipTier || 'free',
        assessmentResult?.student?.name,
        assessmentResult?.student?.email
    );
    const isProOrAbove = userTier === 'pro' || userTier === 'premium' || userTier === 'premium_plus' || userTier === 'vip' || userTier === 'expert';
    const isPremiumOrAbove = userTier === 'premium' || userTier === 'premium_plus' || userTier === 'vip' || userTier === 'expert';
    const isVipOrAbove = userTier === 'premium_plus' || userTier === 'vip' || userTier === 'expert';

    // All 3 scores are visualized: Card 1 is sharp, Cards 2 & 3 are blurred for Free users
    const allTopScores = useMemo(() => {
        if (!classificationResult?.allScores) return [];
        return classificationResult.allScores.slice(0, 3);
    }, [classificationResult]);

    // Check for valid EEG data
    const hasEegData = useMemo(() => {
        if (!assessmentResult?.hrv) return false;
        const { eegAlpha, eegLBeta, eegMBeta, eegHBeta, eegTheta, eegGamma } = assessmentResult.hrv;
        // Check if any of the main waves have non-zero values
        return (eegAlpha > 0 || eegLBeta > 0 || eegMBeta > 0 || eegHBeta > 0 || eegTheta > 0 || eegGamma > 0);
    }, [assessmentResult]);

    // Check for valid HRV data (actually measured)
    const hasHrvData = useMemo(() => {
        if (!assessmentResult?.hrv) return false;
        const { sns, pns, tp } = assessmentResult.hrv;
        const isNotDefaultZero = (sns > 0 || pns > 0 || tp > 0);
        const isAssessedCareType = assessmentResult.careType && assessmentResult.careType !== CareType.UNASSESSED;
        return isNotDefaultZero && isAssessedCareType;
    }, [assessmentResult]);

    // Check for valid Golden Time / Chronotype data
    const hasGoldenTimeData = useMemo(() => {
        if (!assessmentResult) return false;
        const isAssessedCareType = assessmentResult.careType && assessmentResult.careType !== CareType.UNASSESSED;
        return Boolean(isAssessedCareType);
    }, [assessmentResult]);

    // Parse sections from the markdown-style text
    const parseSection = (text: string, sectionId: string): { items: string[]; subItems: string[]; rawContent?: string } => {
        // ANS section (5), Vitality/Fatigue section (5-2), Stress/Concentration (5-4), Integrated (5-5), Cognitive (5-6), Peak Time (4-2), Action Plan (7), Sleep Management (8) need special handling
        const isSpecialSection = ['1', '5', '5-2', '5-4', '5-5', '5-6', '4-2', '7', '8'].includes(sectionId);
        const escapedId = sectionId.replace('-', '\\s*-\\s*');

        // Sections with internal separators need careful regex
        const regexPattern = ['1', '5', '5-2', '5-4', '5-5', '5-6', '4-2', '7', '8'].includes(sectionId)
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
            icon: '🧬',
            title: '과학적 학습 기질 & 맞춤 전략',
            subtitle: 'Learning Traits & Strategy',
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
        },
        {
            id: '8',
            icon: '🌙',
            title: '수면 패턴 분석 및 처방',
            subtitle: 'Sleep Management & Analysis',
            color: 'indigo'
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

        // Merge sleepAnalysisText for Section 8 if available
        let finalRawContent = rawContent;
        if (section.id === '8' && assessmentResult?.sleepAnalysisText) {
            finalRawContent = assessmentResult.sleepAnalysisText;
        }

        return { ...section, items, subItems, rawContent: finalRawContent };
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
                    {/* 전문가 가이드 오버레이 */}
                    <ExpertOverlay
                        careType={classificationResult?.primary}
                        // TODO: Adrenal score needs to be passed here if available
                        adrenalFatigueScore={0}
                        score={allTopScores.length > 0 ? allTopScores[0].score : 0}
                        aiModels={aiModels}
                        isOpen={showExpertGuide}
                        onClose={onCloseExpertGuide}
                    />
                    <div className="p-6">
                        <div className="space-y-6">
                            {/* Card 1: Primary Classification (Always Sharp & Visible) */}
                            {allTopScores.length > 0 && (() => {
                                const score = allTopScores[0];
                                const label = CARE_TYPE_LABELS[score.type];
                                let severityColor = score.score <= 25 ? 'bg-emerald-500' : score.score <= 50 ? 'bg-amber-500' : 'bg-rose-500';
                                let severityText = score.score <= 25 ? '정상' : score.score <= 50 ? '주의' : '심각';

                                return (
                                    <div key={score.type} className="flex flex-col md:flex-row gap-6 p-4 rounded-xl hover:bg-slate-50 transition-colors print-avoid-break">
                                        {/* Left: Identity */}
                                        <div className="md:w-48 flex-shrink-0 flex flex-row md:flex-col items-center md:items-start md:justify-center gap-2 md:gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl">{label?.icon}</span>
                                                <span className="font-bold text-indigo-900 text-lg">
                                                    {label?.name}
                                                </span>
                                            </div>
                                            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] rounded-full font-bold">PRIMARY (1차)</span>
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
                                                    <span className="font-bold text-indigo-600">{score.score}점</span>
                                                </div>
                                            </div>

                                            {/* Score Bar with Zones */}
                                            <div className="relative pt-6 pb-1">
                                                <div className="absolute top-0 left-0 right-0 flex h-1.5 text-xs font-bold text-slate-300">
                                                    <div className="w-[25%] border-r border-slate-200 text-emerald-400 text-center relative"><span className="absolute -top-5 left-0 right-0">정상</span></div>
                                                    <div className="w-[25%] border-r border-slate-200 text-amber-400 text-center relative"><span className="absolute -top-5 left-0 right-0">주의</span></div>
                                                    <div className="w-[50%] text-rose-400 text-center relative"><span className="absolute -top-5 left-0 right-0">심각</span></div>
                                                </div>

                                                <div className="h-3 bg-slate-100 rounded-full overflow-hidden relative z-10">
                                                    <div className="absolute inset-0 flex opacity-20">
                                                        <div className="w-[25%] bg-emerald-200"></div>
                                                        <div className="w-[25%] bg-amber-200"></div>
                                                        <div className="w-[50%] bg-rose-200"></div>
                                                    </div>
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
                            })()}

                            {/* Cards 2 & 3: Secondary & Tertiary Classifications */}
                            {allTopScores.length > 1 && (
                                <div className="relative">
                                    <div className={`space-y-6 ${!isProOrAbove ? 'blur-md opacity-25 select-none pointer-events-none filter' : ''}`}>
                                        {allTopScores.slice(1, 3).map((score, subIdx) => {
                                            const label = CARE_TYPE_LABELS[score.type];
                                            let severityColor = score.score <= 25 ? 'bg-emerald-500' : score.score <= 50 ? 'bg-amber-500' : 'bg-rose-500';
                                            let severityText = score.score <= 25 ? '정상' : score.score <= 50 ? '주의' : '심각';

                                            return (
                                                <div key={score.type} className="flex flex-col md:flex-row gap-6 p-4 rounded-xl hover:bg-slate-50 transition-colors print-avoid-break border-t border-slate-100">
                                                    {/* Left: Identity */}
                                                    <div className="md:w-48 flex-shrink-0 flex flex-row md:flex-col items-center md:items-start md:justify-center gap-2 md:gap-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-2xl">{label?.icon}</span>
                                                            <span className="font-bold text-slate-700">
                                                                {label?.name}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded-full font-bold">
                                                                {subIdx === 0 ? 'SECONDARY (2차)' : 'TERTIARY (3차)'}
                                                            </span>
                                                            <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold border ${score.score >= 70
                                                                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                                                }`}>
                                                                {score.score >= 70 ? '확정 진단' : '근접 추정'}
                                                            </span>
                                                        </div>
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
                                                                <span className="font-bold text-slate-500">{score.score}점</span>
                                                            </div>
                                                        </div>

                                                        {/* Score Bar with Zones */}
                                                        <div className="relative pt-6 pb-1">
                                                            <div className="absolute top-0 left-0 right-0 flex h-1.5 text-xs font-bold text-slate-300">
                                                                <div className="w-[25%] border-r border-slate-200 text-emerald-400 text-center relative"><span className="absolute -top-5 left-0 right-0">정상</span></div>
                                                                <div className="w-[25%] border-r border-slate-200 text-amber-400 text-center relative"><span className="absolute -top-5 left-0 right-0">주의</span></div>
                                                                <div className="w-[50%] text-rose-400 text-center relative"><span className="absolute -top-5 left-0 right-0">심각</span></div>
                                                            </div>

                                                            <div className="h-3 bg-slate-100 rounded-full overflow-hidden relative z-10">
                                                                <div className="absolute inset-0 flex opacity-20">
                                                                    <div className="w-[25%] bg-emerald-200"></div>
                                                                    <div className="w-[25%] bg-amber-200"></div>
                                                                    <div className="w-[50%] bg-rose-200"></div>
                                                                </div>
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

                                    {/* Lock Overlay for Free Users */}
                                    {!isProOrAbove && (
                                        <TierLockOverlay
                                            requiredTier="pro"
                                            title="2·3차 복합 케어타입 정밀 분석"
                                            description="1차 주성향 외에 잠재된 2·3차 뇌-신체 취약 패턴을 정밀하게 분석합니다."
                                            onUnlockClick={() => onUpgradeClick?.('pro', '2·3차 복합 케어타입 정밀 분석 (PRO 이상)')}
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {parsedSections.map((section) => {
                const colors = colorClasses[section.color];

                // Skip if no items and no rawContent (for ANS section)
                const isStudyEfficiencySection = section.id === '4';
                if (section.items.length === 0 && !section.rawContent && !isStudyEfficiencySection) return null;

                // Determine Tier requirement for each section
                const isPremiumSection = ['5-5', '5-6', '7', '8'].includes(section.id);
                const isSectionLocked = isPremiumSection
                    ? !isPremiumOrAbove
                    : !isProOrAbove;

                const requiredTier: 'pro' | 'premium' = isPremiumSection ? 'premium' : 'pro';
                const lockTitle = `${section.title} (${requiredTier.toUpperCase()} 전용)`;
                const lockDesc = isPremiumSection
                    ? '통합 공부법 매트릭스, 인지 작업기억 평가, 주간 실천 계획 및 수면/일상 관리 가이드를 확인하세요.'
                    : '6대 생체 지표 정밀 연동, 서카디안 골든타임표 및 4과목 학습 전략 로드맵을 확인하세요.';

                return (
                    <div
                        key={section.id}
                        id={`section-${section.id}`}
                        className={`relative ${colors.bg} ${colors.border} border-2 rounded-3xl overflow-hidden print-page-break print-avoid-break transition-all duration-300 hover:shadow-xl`}
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
                                        {isSectionLocked && (
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-900/80 text-amber-300 border border-amber-400/30 flex items-center gap-1 shadow-sm">
                                                🔒 {requiredTier.toUpperCase()} 전용
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1 ml-4">
                                        {section.subtitle}
                                    </p>
                                </div>
                                <div className={`w-10 h-10 ${colors.badge} text-white rounded-xl flex items-center justify-center text-lg font-black shadow-lg`}>
                                    {section.id}
                                </div>
                                {section.id === '8' && isProOrAbove && (
                                    <button
                                        onClick={() => setShowSleepEditModal(true)}
                                        className="ml-2 w-10 h-10 bg-white text-indigo-600 border border-indigo-200 rounded-xl flex items-center justify-center shadow-sm hover:bg-indigo-50 transition-colors cursor-pointer print:hidden"
                                        title="수면 분석 편집"
                                    >
                                        ✏️
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Section Content Wrapper with Conditional Blur */}
                        <div className={`relative ${isSectionLocked ? 'max-h-[380px] overflow-hidden' : ''}`}>
                            <div className={`p-5 ${isSectionLocked ? 'blur-md opacity-25 select-none pointer-events-none filter' : ''}`}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {/* Special rendering for Section 1 (Physical-Learning) */}
                                    {section.id === '1' && section.rawContent && (
                                        <div className="col-span-full">
                                            <div className="p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-blue-100">
                                                {renderSimpleMarkdown(section.rawContent)}
                                            </div>
                                        </div>
                                    )}

                                    {/* Special rendering for Section 2 (Learning Traits & Subject Strategy) */}
                                    {section.id === '2' && (() => {
                                        const currentCareType = classificationResult?.primary || assessmentResult?.careType || CareType.HEALTHY;
                                        const strategy = DETAILED_CARETYPE_STRATEGIES[currentCareType] || DETAILED_CARETYPE_STRATEGIES[CareType.UNASSESSED];
                                        const rawTraits = assessmentResult?.student?.learningTraits || assessmentResult?.survey?.learningTraits;
                                        const isDefaultFlat50 = !rawTraits || !rawTraits.scores || (
                                            rawTraits.scores.gritPlan === 50 &&
                                            rawTraits.scores.mentalResilience === 50 &&
                                            rawTraits.scores.temperament === 50 &&
                                            rawTraits.scores.metaCognition === 50 &&
                                            rawTraits.scores.internalMotivation === 50
                                        );
                                        const traits = isDefaultFlat50
                                            ? inferLearningTraitsFromProfile({
                                                careType: currentCareType,
                                                survey: assessmentResult?.survey,
                                                studyEfficiency: (assessmentResult as any)?.studyEfficiencyResults,
                                                student: assessmentResult?.student
                                            })
                                            : rawTraits;
                                        const studentData = assessmentResult?.student;
                                        const dynamicRoadmap = studentData ? getDynamicSubjectRoadmap(studentData, currentCareType, assessmentResult?.gradeHistory) : null;

                                        return (
                                            <div className="col-span-full space-y-6">
                                                {/* 1. 5대 과학적 학습 기질 종합 분석 카드 */}
                                                {traits && traits.scores ? (
                                                    <div className="bg-gradient-to-br from-purple-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl border-2 border-purple-500/30 relative overflow-hidden">
                                                        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
                                                        <div className="relative z-10 space-y-5">
                                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-800/60 pb-4">
                                                                <div className="flex items-center gap-3">
                                                                    <span className="text-3xl p-2.5 bg-purple-500/20 rounded-2xl border border-purple-500/30">🧬</span>
                                                                    <div>
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-[11px] font-bold text-purple-300 uppercase tracking-widest">Big 5 &middot; TCI &middot; MSLQ &middot; Grit 기반</span>
                                                                            <span className="px-2.5 py-0.5 bg-purple-500 text-white text-[10px] font-black rounded-full">5대 학습 기질</span>
                                                                        </div>
                                                                        <h4 className="text-xl md:text-2xl font-black text-white mt-0.5">{traits.archetypeBadge || '심층 학습 기질 프로파일'}</h4>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-2 self-start sm:self-auto bg-purple-500/20 px-4 py-2 rounded-2xl border border-purple-500/40">
                                                                    <span className="text-xs text-purple-200">종합 평균 점수</span>
                                                                    <span className="text-lg font-black text-amber-300">{traits.totalAverage || '4.2'} / 5.0점</span>
                                                                </div>
                                                            </div>

                                                            {/* 5-Axis Dimension Score Bars */}
                                                            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                                                                {[
                                                                    { name: '끈기 & 실행력', score: traits.scores.gritPlan ?? traits.scores.persistenceAndExecution ?? 50, icon: '🎯', desc: '계획 준수 & 목표 완주', color: 'from-emerald-400 to-teal-500' },
                                                                    { name: '멘탈 & 회복력', score: traits.scores.mentalResilience ?? traits.scores.mentalAndResilience ?? 50, icon: '🛡️', desc: '오답 불안 & 슬럼프 극복', color: 'from-blue-400 to-indigo-500' },
                                                                    { name: '탐구 & 도전심', score: traits.scores.temperament ?? traits.scores.curiosityAndChallenge ?? 50, icon: '⚡', desc: '고난도 킬러 & 호기심', color: 'from-purple-400 to-pink-500' },
                                                                    { name: '메타인지 전략', score: traits.scores.metaCognition ?? traits.scores.metaCognitiveStrategy ?? 50, icon: '🔍', desc: '오답 분석 & 지식 점검', color: 'from-indigo-400 to-cyan-500' },
                                                                    { name: '내재동기 몰입', score: traits.scores.internalMotivation ?? traits.scores.intrinsicMotivation ?? 50, icon: '🔥', desc: '성취 희열 & 자기주도', color: 'from-amber-400 to-orange-500' }
                                                                ].map(dim => (
                                                                    <div key={dim.name} className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 shadow-sm flex flex-col justify-between">
                                                                        <div>
                                                                            <div className="flex items-center justify-between text-xs font-bold text-purple-200 mb-1">
                                                                                <span>{dim.icon} {dim.name}</span>
                                                                                <span className="font-black text-white">{dim.score}점</span>
                                                                            </div>
                                                                            <p className="text-[10px] text-slate-300 mb-2">{dim.desc}</p>
                                                                        </div>
                                                                        <div className="w-full bg-black/30 rounded-full h-2 overflow-hidden">
                                                                            <div className={`bg-gradient-to-r ${dim.color} h-full rounded-full transition-all duration-700`} style={{ width: `${Math.min(100, Math.max(5, dim.score > 5 ? dim.score : (dim.score / 5) * 100))}%` }} />
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>

                                                            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-xs text-purple-100 leading-relaxed space-y-2">
                                                                <p className="font-medium">{traits.archetypeDescription}</p>
                                                                {(traits.coreStrength || traits.cautionPoint) && (
                                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-2 border-t border-white/10 text-[11px]">
                                                                        <div className="bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-500/30">
                                                                            <span className="font-bold text-emerald-300 block mb-0.5">🌟 핵심 인지 강점</span>
                                                                            <span className="text-slate-200">{traits.coreStrength}</span>
                                                                        </div>
                                                                        <div className="bg-rose-950/40 p-2.5 rounded-xl border border-rose-500/30">
                                                                            <span className="font-bold text-rose-300 block mb-0.5">⚠️ 주의 & 병목 요인</span>
                                                                            <span className="text-slate-200">{traits.cautionPoint}</span>
                                                                        </div>
                                                                        <div className="bg-blue-950/40 p-2.5 rounded-xl border border-blue-500/30">
                                                                            <span className="font-bold text-blue-300 block mb-0.5">🏰 기질별 최적 환경</span>
                                                                            <span className="text-slate-200">{traits.recommendedEnvironment}</span>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border-2 border-purple-200 rounded-3xl p-6 shadow-sm">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-2xl p-2 bg-purple-100 rounded-xl">🧬</span>
                                                            <div>
                                                                <span className="text-[10px] font-bold text-purple-600 uppercase tracking-widest">5대 과학적 학습 기질 &amp; CareType 연동</span>
                                                                <h4 className="text-lg font-black text-slate-900">{strategy.careTypeName} 맞춤 학습 솔루션</h4>
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                                                            자율신경(교감·부교감) 및 피로도 상태를 5대 인지 기질 척도와 융합하여 도출된 초개인화 학습 최적화 프로토콜입니다.
                                                        </p>
                                                    </div>
                                                )}

                                                {/* 2. CareType 연계 신경인지 기전 & 학습 병목 분석 (Neuro-Cognitive Mechanism Banner) */}
                                                <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
                                                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                                        <div className="flex items-center gap-3">
                                                            <span className="w-2.5 h-7 bg-indigo-600 rounded-full"></span>
                                                            <div>
                                                                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Neuro-Cognitive Mechanism</span>
                                                                <h4 className="text-lg md:text-xl font-black text-slate-900">케어타입 신경인지 기전 &amp; 학습 병목 정밀 분석</h4>
                                                            </div>
                                                        </div>
                                                        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-200 shrink-0">
                                                            {strategy.summaryBadge}
                                                        </span>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        {/* 뇌 신경생리학적 기전 */}
                                                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-3">
                                                            <div className="space-y-1.5">
                                                                <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs">
                                                                    <span>🧠</span>
                                                                    <span>두뇌 신경생리 메커니즘</span>
                                                                </div>
                                                                <p className="text-xs text-slate-700 leading-relaxed">
                                                                    {strategy.neuroCognitiveProfile.brainMechanism}
                                                                </p>
                                                            </div>
                                                            <span className="text-[10px] text-slate-400 font-medium">전두엽 &middot; 해마 &middot; 자율신경 연동</span>
                                                        </div>

                                                        {/* 학습 시 핵심 병목 */}
                                                        <div className="bg-rose-50/60 p-5 rounded-2xl border border-rose-200 flex flex-col justify-between space-y-3">
                                                            <div className="space-y-1.5">
                                                                <div className="flex items-center gap-2 text-rose-700 font-bold text-xs">
                                                                    <span>⚠️</span>
                                                                    <span>학습 시 핵심 병목 (Bottleneck)</span>
                                                                </div>
                                                                <p className="text-xs text-rose-900 leading-relaxed font-medium">
                                                                    {strategy.neuroCognitiveProfile.learningBottleneck}
                                                                </p>
                                                            </div>
                                                            <span className="text-[10px] text-rose-400 font-medium">인지 과부하 및 정보 이탈 방지 요망</span>
                                                        </div>

                                                        {/* 잠재 인지 강점 */}
                                                        <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-200 flex flex-col justify-between space-y-3">
                                                            <div className="space-y-1.5">
                                                                <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                                                                    <span>🌟</span>
                                                                    <span>잠재 인지 강점 &amp; 돌파구</span>
                                                                </div>
                                                                <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                                                                    {strategy.neuroCognitiveProfile.coreCognitiveStrength}
                                                                </p>
                                                            </div>
                                                            <span className="text-[10px] text-emerald-500 font-medium">맞춤 전략 적용 시 폭발적 성장</span>
                                                        </div>
                                                    </div>

                                                    {/* 세션 아키텍처 & 스타트 루틴 바 */}
                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                                                        <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                                                            <span className="text-[10px] font-bold text-indigo-500 block mb-1">⏱️ 권장 세션 사이클</span>
                                                            <p className="text-xs font-black text-indigo-950">{strategy.timeArchitecture.recommendedCycle}</p>
                                                        </div>
                                                        <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100">
                                                            <span className="text-[10px] font-bold text-purple-500 block mb-1">🚀 착석 3단계 스타트 루틴</span>
                                                            <p className="text-xs text-purple-950 leading-relaxed font-medium">{strategy.timeArchitecture.startRitual}</p>
                                                        </div>
                                                        <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                                                            <span className="text-[10px] font-bold text-blue-500 block mb-1">⚖️ 인풋 vs 아웃풋 황금 비율</span>
                                                            <p className="text-xs font-black text-blue-950">{strategy.timeArchitecture.inputOutputRatio}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* 3. 4대 과목별 초정밀 학습법 로드맵 (Subject-Specific Cognitive Protocols) */}
                                                <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
                                                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                                                        <span className="w-2.5 h-7 bg-purple-600 rounded-full"></span>
                                                        <div>
                                                            <span className="text-[10px] font-bold text-purple-600 uppercase tracking-widest">Subject-Specific Cognitive Protocols</span>
                                                            <h4 className="text-lg md:text-xl font-black text-slate-900">4대 영역별 초정밀 맞춤 학습법 로드맵</h4>
                                                        </div>
                                                    </div>

                                                    {/* PRO 실측 성적 연동 및 3단계 자동 승격 인터랙티브 배너 */}
                                                    <div className="p-4 bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border border-purple-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                                                        <div className="flex items-start gap-3">
                                                            <span className={`px-2.5 py-1 text-white font-black rounded-lg text-xs tracking-wide shrink-0 ${isProOrAbove ? 'bg-indigo-600' : 'bg-purple-600'}`}>
                                                                {isProOrAbove ? 'PRO 성적 연동 완료' : '💡 PRO 등급 자동 연동'}
                                                            </span>
                                                            <div className="text-xs text-slate-700 leading-relaxed">
                                                                {isProOrAbove ? (
                                                                    <p>수험생의 실제 내신·모의고사 성적을 기반으로 4대 영역이 <strong>3단계(최상위 킬러 · 빈출 준킬러 · 기본 개념)</strong> 맞춤형으로 1:1 정밀 배정되었습니다.</p>
                                                                ) : (
                                                                    <p>
                                                                        현재는 <strong>기본 진단 기준(3~4등급 도약형)</strong>입니다. <strong>PRO 정밀 진단에서 실제 내신·모의고사 성적을 등록</strong>하시면, 4대 과목이 <strong>실측 등급별 3단계(최상위 킬러 · 빈출 준킬러 · 기본 개념)</strong>로 자동 정밀 승격·재설계됩니다.
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {!isProOrAbove && (
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    if (onUpgradeClick) {
                                                                        onUpgradeClick('pro', '4대 영역 실측 성적 연동 및 3단계 등급별 맞춤 로드맵 해금');
                                                                    }
                                                                }}
                                                                className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-black shrink-0 shadow-sm transition-all transform hover:scale-105 flex items-center gap-1.5 cursor-pointer self-end sm:self-auto"
                                                            >
                                                                <span>⚡ 1:1 성적 연동 해금</span>
                                                                <span>➜</span>
                                                            </button>
                                                        )}
                                                    </div>

                                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                        {(['korean', 'math', 'english', 'inquiry'] as const).map((key) => {
                                                            const dyn = dynamicRoadmap?.[key];
                                                            const baseProtocol = strategy.subjectProtocols[key];
                                                            const isFocus = dyn?.isFocus ?? false;

                                                            const title = dyn?.strategyTitle || baseProtocol?.strategyTitle || '';
                                                            const actionPlan = dyn?.actionPlan || baseProtocol?.actionPlan || '';
                                                            const readLabel = dyn?.readingOrConceptLabel || (key === 'korean' ? '🔍 독해 및 개념 체화' : key === 'math' ? '🔍 개념 체화 & 백지 유도' : key === 'english' ? '🔍 어휘 인출 & 구문 독해' : '🔍 파인만 백지 인출 & 마인드맵');
                                                            const readMethod = dyn?.readingOrConceptMethod || baseProtocol?.readingOrConceptMethod || '';
                                                            const probLabel = dyn?.problemSolvingLabel || (key === 'korean' ? '⚡ 문제 풀이 & 인출' : key === 'math' ? '⚡ 문제 풀이 & 타임어택' : key === 'english' ? '⚡ 대의 파악 & 논리 소거법' : '⚡ 기출 선지 단권화 & 타임 리허설');
                                                            const probMethod = dyn?.problemSolvingMethod || baseProtocol?.problemSolvingMethod || '';
                                                            const killerTips = dyn?.killerTips || baseProtocol?.killerTips || '';

                                                            const metaColors = {
                                                                korean: { gradient: 'from-slate-50 to-blue-50/40', border: 'border-blue-100', text: 'text-blue-600', badge: 'bg-blue-600', icon: '📖', subBadge: '1교시 최적화', code: 'KOREAN PROTOCOL' },
                                                                math: { gradient: 'from-slate-50 to-emerald-50/40', border: 'border-emerald-100', text: 'text-emerald-600', badge: 'bg-emerald-600', icon: '📐', subBadge: '킬러 정복', code: 'MATHEMATICS PROTOCOL' },
                                                                english: { gradient: 'from-slate-50 to-purple-50/40', border: 'border-purple-100', text: 'text-purple-600', badge: 'bg-purple-600', icon: '🔤', subBadge: '절대평가 1등급', code: 'ENGLISH PROTOCOL' },
                                                                inquiry: { gradient: 'from-slate-50 to-amber-50/40', border: 'border-amber-100', text: 'text-amber-600', badge: 'bg-amber-600', icon: '⚡', subBadge: '단권화 만점', code: 'INQUIRY PROTOCOL' }
                                                            }[key];

                                                            return (
                                                                <div
                                                                    key={key}
                                                                    className={`rounded-2xl p-5 space-y-4 hover:shadow-md transition-all ${isFocus
                                                                            ? 'bg-gradient-to-br from-rose-50/80 via-amber-50/40 to-purple-50/50 border-2 border-rose-400 ring-2 ring-rose-400/20 shadow-sm'
                                                                            : `bg-gradient-to-br ${metaColors.gradient} border-2 ${metaColors.border}`
                                                                        }`}
                                                                >
                                                                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                                                        <div className="flex items-center gap-2.5">
                                                                            <span className="text-2xl p-2 bg-white/80 rounded-xl shadow-xs">{metaColors.icon}</span>
                                                                            <div>
                                                                                <div className="flex items-center gap-1.5">
                                                                                    <span className="text-[10px] font-black text-slate-500 uppercase">{metaColors.code}</span>
                                                                                    {isFocus && (
                                                                                        <span className="text-[10px] font-black px-2 py-0.2 rounded-full bg-rose-600 text-white animate-pulse">
                                                                                            🔥 취약 집중 공략
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                                <h5 className={`text-base font-black ${isFocus ? 'text-rose-950' : 'text-slate-900'}`}>{title}</h5>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex flex-col items-end gap-1">
                                                                            <span className={`text-[11px] px-2.5 py-1 text-white font-bold rounded-lg ${isFocus ? 'bg-rose-600' : metaColors.badge}`}>
                                                                                {metaColors.subBadge}
                                                                            </span>
                                                                            {dyn?.allocatedRatio && (
                                                                                <span className="text-[10px] font-bold text-slate-500">
                                                                                    권장 비중: {dyn.allocatedRatio.split(' ')[0]}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    <div className="space-y-2.5 text-xs text-slate-700">
                                                                        <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-xs">
                                                                            <strong className="text-slate-900 block mb-0.5">📌 실행 지침</strong>
                                                                            {actionPlan}
                                                                        </div>
                                                                        <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-xs">
                                                                            <strong className="text-slate-900 block mb-0.5">{readLabel}</strong>
                                                                            {readMethod}
                                                                        </div>
                                                                        <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-xs">
                                                                            <strong className="text-slate-900 block mb-0.5">{probLabel}</strong>
                                                                            {probMethod}
                                                                        </div>
                                                                        <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-900 shadow-xs">
                                                                            <strong className="text-amber-800 block mb-0.5">💡 킬러 문항 &amp; 멘탈 방어 팁</strong>
                                                                            {killerTips}
                                                                        </div>
                                                                        {isFocus && dyn?.goldenHourFit && (
                                                                            <div className="bg-rose-100/70 p-2.5 rounded-xl border border-rose-200 text-rose-900 text-[11px] font-bold">
                                                                                {dyn.goldenHourFit}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                {/* 4. 멘탈 회복 탄력성 & 학습 환경 최적화 (Mindset & Environment) */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {/* 멘탈 & 슬럼프 케어 */}
                                                    <div className="bg-gradient-to-br from-indigo-950 to-slate-900 text-white rounded-3xl p-6 border-2 border-indigo-500/30 shadow-xl space-y-4">
                                                        <div className="flex items-center gap-2.5 border-b border-indigo-800/60 pb-3">
                                                            <span className="text-2xl">🛡️</span>
                                                            <h4 className="text-lg font-black text-white">실전 시험 멘탈 &amp; 슬럼프 회복 처방전</h4>
                                                        </div>
                                                        <div className="space-y-3 text-xs text-indigo-100 leading-relaxed">
                                                            <div className="bg-white/10 p-3.5 rounded-2xl border border-white/10">
                                                                <strong className="text-indigo-300 block mb-1">🫁 1분 생체 긴급 이완 호흡 (Emergency Reset)</strong>
                                                                <p>{strategy.mentalSlumpCare.emergencyReset}</p>
                                                            </div>
                                                            <div className="bg-white/10 p-3.5 rounded-2xl border border-white/10">
                                                                <strong className="text-indigo-300 block mb-1">🔄 오답/실패 시 인지 재구조화 (Reframing)</strong>
                                                                <p>{strategy.mentalSlumpCare.cognitiveReframing}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* 환경 및 유혹 차단 */}
                                                    <div className="bg-gradient-to-br from-slate-900 to-purple-950 text-white rounded-3xl p-6 border-2 border-purple-500/30 shadow-xl space-y-4">
                                                        <div className="flex items-center gap-2.5 border-b border-purple-800/60 pb-3">
                                                            <span className="text-2xl">🏰</span>
                                                            <h4 className="text-lg font-black text-white">최적 공부 공간 &amp; 디지털 유혹 차단</h4>
                                                        </div>
                                                        <div className="space-y-3 text-xs text-purple-100 leading-relaxed">
                                                            <div className="bg-white/10 p-3.5 rounded-2xl border border-white/10">
                                                                <strong className="text-purple-300 block mb-1">💡 최적 공간 &amp; 조명/소음 세팅</strong>
                                                                <p>{strategy.concentrationEnvironment.environmentSetup}</p>
                                                            </div>
                                                            <div className="bg-white/10 p-3.5 rounded-2xl border border-white/10">
                                                                <strong className="text-purple-300 block mb-1">🚫 디지털 &amp; 시각 유혹 차단 수칙</strong>
                                                                <p>{strategy.concentrationEnvironment.distractionBlocker}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-4 bg-purple-100/80 border border-purple-200 rounded-2xl text-xs text-purple-950 leading-relaxed flex items-start gap-3 shadow-sm">
                                                    <span className="text-lg shrink-0">ℹ️</span>
                                                    <div>
                                                        <span className="font-bold text-purple-950">[NBASS 과학적 성향 분석 안내]</span> 본 학습 로드맵은 피검자의 <strong>{strategy.careTypeName}</strong> 생체 리듬 및 <strong>5대 학습 기질(Grit, Resilience, Exploration, Metacognition, Motivation)</strong> 진단 결과를 유기적으로 결합하여 생성된 1:1 맞춤형 임상 교육 솔루션입니다.
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    {/* Special rendering for Study Efficiency section (4) */}
                                    {section.id === '4' && (() => {
                                        const rawEff = assessmentResult?.studyEfficiencyResults;
                                        const survey = assessmentResult?.survey;
                                        const eff = (rawEff && (rawEff.chronotype || rawEff.vark || rawEff.testAnxiety || rawEff.digitalAddiction || rawEff.metacognition))
                                            ? rawEff
                                            : (survey ? mapSurveyDataToResults(survey, assessmentResult?.date || '') : rawEff);
                                        const analytics = assessmentResult?.analytics;
                                        const careType = classificationResult?.primary || assessmentResult?.careType || CareType.HEALTHY;

                                        // 5대 학습 효율성 검사 시행 여부 판별
                                        const isChronoTested = Boolean(eff?.chronotype?.result);
                                        const isVarkTested = Boolean(eff?.vark?.primary || eff?.vark?.primaryStyle);
                                        const isTaiTested = Boolean(eff?.testAnxiety?.totalScore !== undefined || eff?.testAnxiety?.result || eff?.testAnxiety?.severity || eff?.tai?.totalScore !== undefined);
                                        const isDigitalTested = Boolean(eff?.digitalAddiction?.level);
                                        const isMetaTested = Boolean(eff?.metacognition?.learnerLevel || eff?.metacognition?.level);
                                        const completedCount = [isChronoTested, isVarkTested, isTaiTested, isDigitalTested, isMetaTested].filter(Boolean).length;

                                        // 1. Chronotype
                                        const rawChrono = eff?.chronotype?.result;
                                        const chronoLabel = rawChrono === 'definite_morning' ? '확실한 아침형' :
                                            rawChrono === 'moderate_morning' ? '다소 아침형' :
                                                rawChrono === 'intermediate' ? '중간형' :
                                                    rawChrono === 'moderate_evening' ? '다소 저녁형' :
                                                        rawChrono === 'definite_evening' ? '확실한 저녁형' : '미검사';
                                        const chronoKey = (rawChrono === 'definite_morning' ? 'morning' : rawChrono === 'definite_evening' ? 'evening' : rawChrono === 'moderate_morning' ? 'moderate_morning' : rawChrono === 'moderate_evening' ? 'moderate_evening' : 'neutral') as any;

                                        // 2. VARK
                                        const rawVark = eff?.vark?.primary || eff?.vark?.primaryStyle;
                                        const varkLabel = rawVark === 'V' ? '시각형 (Visual)' :
                                            rawVark === 'A' ? '청각형 (Auditory)' :
                                                rawVark === 'R' ? '읽기쓰기형 (Read/Write)' :
                                                    rawVark === 'K' ? '운동감각형 (Kinesthetic)' :
                                                        rawVark === 'multi' ? '복합형 (Multimodal)' : '미검사';
                                        const varkObj = {
                                            primary: rawVark || 'V',
                                            scores: eff?.vark?.scores || { V: 0, A: 0, R: 0, K: 0 }
                                        };

                                        // 3. Test Anxiety (TAI)
                                        const rawTaiSeverity = eff?.testAnxiety?.severity || (eff?.testAnxiety?.result as any);
                                        const rawTaiDominant = eff?.testAnxiety?.dominantType;
                                        const taiObj = {
                                            totalScore: eff?.testAnxiety?.totalScore ?? eff?.tai?.totalScore ?? 0,
                                            severity: rawTaiSeverity || 'moderate',
                                            dominantType: rawTaiDominant || 'mixed',
                                            cognitiveScore: eff?.testAnxiety?.cognitiveScore ?? 0,
                                            somaticScore: eff?.testAnxiety?.somaticScore ?? 0
                                        };

                                        // 4. Digital Balance
                                        const rawDigitalLevel = eff?.digitalAddiction?.level;
                                        const digitalScore = eff?.digitalAddiction?.totalScore ?? 0;
                                        const digitalObj = {
                                            totalScore: digitalScore,
                                            level: rawDigitalLevel || 'caution',
                                            dailyUsageHours: eff?.digitalAddiction?.dailyUsageHours ?? 0
                                        };

                                        // 5. Metacognition
                                        const rawMetaLevel = eff?.metacognition?.learnerLevel || eff?.metacognition?.level;
                                        const metaScore = eff?.metacognition?.totalScore ?? 0;
                                        const metaObj = {
                                            totalScore: metaScore,
                                            learnerLevel: rawMetaLevel || 'developing',
                                            knowledgeScore: eff?.metacognition?.knowledgeScore ?? 0,
                                            regulationScore: eff?.metacognition?.regulationScore ?? 0
                                        };

                                        return (
                                            <div className="col-span-full space-y-4">
                                                {/* 상태 안내 배너 */}
                                                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 p-3 bg-violet-50/80 border border-violet-200 rounded-2xl text-xs text-violet-900">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-base">📌</span>
                                                        <span><strong>실제 시행한 검사 결과만 표시됩니다.</strong> 미시행 검사는 '미검사'로 처리되며 가짜 점수가 생성되지 않습니다.</span>
                                                    </div>
                                                    <span className="self-start sm:self-auto px-2.5 py-1 rounded-full font-bold text-[11px] bg-violet-200 text-violet-800 shrink-0">
                                                        시행 완료 {completedCount}/5종
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {/* 1. 크로노타입 */}
                                                    <div className={`p-4 rounded-2xl border shadow-sm transition-colors ${isChronoTested ? 'bg-white/80 border-violet-100' : 'bg-slate-50/60 border-dashed border-slate-200'
                                                        }`}>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xl">🌅</span>
                                                                <h5 className={`font-bold text-sm ${isChronoTested ? 'text-slate-800' : 'text-slate-400'}`}>CHRONOTYPE</h5>
                                                            </div>
                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${isChronoTested ? 'bg-violet-100 text-violet-700' : 'bg-slate-200 text-slate-500'}`}>
                                                                {isChronoTested ? '검사 완료' : '미검사'}
                                                            </span>
                                                        </div>
                                                        {isChronoTested ? (
                                                            <>
                                                                <p className="text-lg font-black text-violet-600">
                                                                    {chronoLabel}
                                                                </p>
                                                                <details className="mt-3 group" open>
                                                                    <summary className="text-xs font-bold text-violet-500 cursor-pointer hover:text-violet-700 flex items-center gap-1 list-none">
                                                                        <span className="group-open:rotate-90 transition-transform">▶</span> 맞춤 솔루션 보기
                                                                    </summary>
                                                                    <div className="mt-2 text-xs text-slate-600 leading-relaxed bg-violet-50 p-3 rounded-lg">
                                                                        {getChronotypeAdvice(chronoKey, careType)}
                                                                    </div>
                                                                </details>
                                                            </>
                                                        ) : (
                                                            <div className="mt-3 py-4 text-center text-xs text-slate-400">
                                                                🔒 해당 설문 미시행<br />
                                                                <span className="text-[10px] text-slate-400 font-normal">수면 생체리듬 평가 데이터 없음</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* 2. VARK */}
                                                    <div className={`p-4 rounded-2xl border shadow-sm transition-colors ${isVarkTested ? 'bg-white/80 border-violet-100' : 'bg-slate-50/60 border-dashed border-slate-200'
                                                        }`}>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xl">🎯</span>
                                                                <h5 className={`font-bold text-sm ${isVarkTested ? 'text-slate-800' : 'text-slate-400'}`}>LEARNING STYLE</h5>
                                                            </div>
                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${isVarkTested ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-500'}`}>
                                                                {isVarkTested ? '검사 완료' : '미검사'}
                                                            </span>
                                                        </div>
                                                        {isVarkTested ? (
                                                            <>
                                                                <p className="text-lg font-black text-indigo-600">
                                                                    {varkLabel}
                                                                </p>
                                                                <details className="mt-3 group" open>
                                                                    <summary className="text-xs font-bold text-indigo-500 cursor-pointer hover:text-indigo-700 flex items-center gap-1 list-none">
                                                                        <span className="group-open:rotate-90 transition-transform">▶</span> 맞춤 솔루션 보기
                                                                    </summary>
                                                                    <div className="mt-2 text-xs text-slate-600 leading-relaxed bg-indigo-50 p-3 rounded-lg">
                                                                        {getVARKAdvice(varkObj as any, careType)}
                                                                    </div>
                                                                </details>
                                                            </>
                                                        ) : (
                                                            <div className="mt-3 py-4 text-center text-xs text-slate-400">
                                                                🔒 해당 설문 미시행<br />
                                                                <span className="text-[10px] text-slate-400 font-normal">VARK 4대 감각 수용 채널 데이터 없음</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* 3. 시험 불안 (TAI) */}
                                                    <div className={`p-4 rounded-2xl border shadow-sm transition-colors ${isTaiTested ? 'bg-white/80 border-violet-100' : 'bg-slate-50/60 border-dashed border-slate-200'
                                                        }`}>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xl">😰</span>
                                                                <h5 className={`font-bold text-sm ${isTaiTested ? 'text-slate-800' : 'text-slate-400'}`}>TEST ANXIETY</h5>
                                                            </div>
                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${isTaiTested ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-500'}`}>
                                                                {isTaiTested ? '검사 완료' : '미검사'}
                                                            </span>
                                                        </div>
                                                        {isTaiTested ? (
                                                            <>
                                                                <p className={`text-lg font-black ${rawTaiSeverity === 'low' ? 'text-emerald-600' :
                                                                    rawTaiSeverity === 'moderate' ? 'text-amber-600' : 'text-red-600'
                                                                    }`}>
                                                                    {rawTaiSeverity === 'low' ? '낮음 (안정)' :
                                                                        rawTaiSeverity === 'moderate' ? '중등도 (주의)' : '높음 (집중 케어)'}
                                                                    {rawTaiDominant && (
                                                                        <span className="text-xs text-slate-500 ml-2">
                                                                            ({rawTaiDominant === 'cognitive' ? '인지적 걱정형' :
                                                                                rawTaiDominant === 'somatic' ? '신체적 긴장형' : '복합형'})
                                                                        </span>
                                                                    )}
                                                                </p>
                                                                <details className="mt-3 group" open>
                                                                    <summary className="text-xs font-bold text-orange-500 cursor-pointer hover:text-orange-700 flex items-center gap-1 list-none">
                                                                        <span className="group-open:rotate-90 transition-transform">▶</span> 맞춤 솔루션 보기
                                                                    </summary>
                                                                    <div className="mt-2 text-xs text-slate-600 leading-relaxed bg-orange-50 p-3 rounded-lg">
                                                                        {getTestAnxietyAdvice(taiObj as any, careType)}
                                                                    </div>
                                                                </details>
                                                            </>
                                                        ) : (
                                                            <div className="mt-3 py-4 text-center text-xs text-slate-400">
                                                                🔒 해당 설문 미시행<br />
                                                                <span className="text-[10px] text-slate-400 font-normal">시험 불안 척도 및 긴장도 데이터 없음</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* 4. 디지털 의존도 */}
                                                    <div className={`p-4 rounded-2xl border shadow-sm transition-colors ${isDigitalTested ? 'bg-white/80 border-violet-100' : 'bg-slate-50/60 border-dashed border-slate-200'
                                                        }`}>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xl">📱</span>
                                                                <h5 className={`font-bold text-sm ${isDigitalTested ? 'text-slate-800' : 'text-slate-400'}`}>DIGITAL BALANCE</h5>
                                                            </div>
                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${isDigitalTested ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-500'}`}>
                                                                {isDigitalTested ? '검사 완료' : '미검사'}
                                                            </span>
                                                        </div>
                                                        {isDigitalTested ? (
                                                            <>
                                                                <p className={`text-lg font-black ${rawDigitalLevel === 'healthy' || rawDigitalLevel === 'low' ? 'text-emerald-600' :
                                                                    rawDigitalLevel === 'caution' || rawDigitalLevel === 'moderate' ? 'text-yellow-600' :
                                                                        rawDigitalLevel === 'risk' || rawDigitalLevel === 'high' ? 'text-orange-600' : 'text-red-600'
                                                                    }`}>
                                                                    {rawDigitalLevel === 'healthy' || rawDigitalLevel === 'low' ? '건강 (안전)' :
                                                                        rawDigitalLevel === 'caution' || rawDigitalLevel === 'moderate' ? '주의 (관리)' :
                                                                            rawDigitalLevel === 'risk' || rawDigitalLevel === 'high' ? '위험 (디톡스)' : '심각 (즉시 차단)'}
                                                                    {digitalScore > 0 && <span className="text-xs text-slate-500 ml-2">(점수: {digitalScore}점)</span>}
                                                                </p>
                                                                <details className="mt-3 group" open>
                                                                    <summary className="text-xs font-bold text-pink-500 cursor-pointer hover:text-pink-700 flex items-center gap-1 list-none">
                                                                        <span className="group-open:rotate-90 transition-transform">▶</span> 맞춤 솔루션 보기
                                                                    </summary>
                                                                    <div className="mt-2 text-xs text-slate-600 leading-relaxed bg-pink-50 p-3 rounded-lg">
                                                                        {getDigitalAddictionAdvice(digitalObj as any, careType)}
                                                                    </div>
                                                                </details>
                                                            </>
                                                        ) : (
                                                            <div className="mt-3 py-4 text-center text-xs text-slate-400">
                                                                🔒 해당 설문 미시행<br />
                                                                <span className="text-[10px] text-slate-400 font-normal">디지털 도파민 중독 척도 데이터 없음</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* 5. 메타인지 */}
                                                    <div className={`p-4 rounded-2xl border shadow-sm transition-colors ${isMetaTested ? 'bg-white/80 border-violet-100' : 'bg-slate-50/60 border-dashed border-slate-200'
                                                        }`}>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xl">🧠</span>
                                                                <h5 className={`font-bold text-sm ${isMetaTested ? 'text-slate-800' : 'text-slate-400'}`}>METACOGNITION</h5>
                                                            </div>
                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${isMetaTested ? 'bg-purple-100 text-purple-700' : 'bg-slate-200 text-slate-500'}`}>
                                                                {isMetaTested ? '검사 완료' : '미검사'}
                                                            </span>
                                                        </div>
                                                        {isMetaTested ? (
                                                            <>
                                                                <p className="text-lg font-black text-purple-600">
                                                                    {rawMetaLevel === 'beginner' || rawMetaLevel === 'low' ? '초보 학습자' :
                                                                        rawMetaLevel === 'developing' || rawMetaLevel === 'moderate' ? '발전중 학습자' :
                                                                            rawMetaLevel === 'proficient' || rawMetaLevel === 'high' ? '숙련 학습자' : '전문 학습자'}
                                                                </p>
                                                                <details className="mt-3 group" open>
                                                                    <summary className="text-xs font-bold text-purple-500 cursor-pointer hover:text-purple-700 flex items-center gap-1 list-none">
                                                                        <span className="group-open:rotate-90 transition-transform">▶</span> 맞춤 솔루션 보기
                                                                    </summary>
                                                                    <div className="mt-2 text-xs text-slate-600 leading-relaxed bg-purple-50 p-3 rounded-lg">
                                                                        {getMetacognitionAdvice(metaObj as any, careType)}
                                                                    </div>
                                                                </details>
                                                            </>
                                                        ) : (
                                                            <div className="mt-3 py-4 text-center text-xs text-slate-400">
                                                                🔒 해당 설문 미시행<br />
                                                                <span className="text-[10px] text-slate-400 font-normal">메타인지 및 자가점검 역량 데이터 없음</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* PRO 미시행 검사 안내 */}
                                                {completedCount < 5 && (
                                                    <div className="p-3 bg-gradient-to-r from-violet-50 via-indigo-50 to-blue-50 border border-violet-200 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                                                        <div className="text-slate-700">
                                                            💡 5종 학습 효율성 검사 중 <strong>{5 - completedCount}개 검사</strong>가 미시행 상태입니다. <strong>PRO 정밀 진단</strong>에서 추가 설문을 완료하시면 모든 영역의 심층 임상 분석과 솔루션이 제공됩니다.
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })()}

                                    {/* Special rendering for Golden Time section (4-2) */}
                                    {section.id === '4-2' && (
                                        <div className="col-span-full">
                                            {isProOrAbove ? (() => {
                                                const goldenStart = assessmentResult?.hrv?.goldenTimeStart || "09:00";
                                                const goldenEnd = assessmentResult?.hrv?.goldenTimeEnd || "12:00";
                                                const startHour = parseInt(goldenStart.split(':')[0], 10) || 9;
                                                const endHour = parseInt(goldenEnd.split(':')[0], 10) || 12;
                                                const scheduleText = section.rawContent || generateBrainPeakTimeSchedule(
                                                    assessmentResult.student,
                                                    assessmentResult.hrv,
                                                    assessmentResult.survey,
                                                    assessmentResult.protocol,
                                                    assessmentResult.analytics,
                                                    assessmentResult.careType,
                                                    assessmentResult.bloodTest
                                                );

                                                return (
                                                    <div className="flex flex-col xl:flex-row gap-6">
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
                                                            {renderSimpleMarkdown(scheduleText)}
                                                        </div>
                                                    </div>
                                                );
                                            })() : (
                                                <div className="p-8 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-900 rounded-3xl border-2 border-indigo-500/40 text-center py-10 text-white shadow-xl no-print">
                                                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-2xl mx-auto mb-3">
                                                        🔒
                                                    </div>
                                                    <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-bold inline-block mb-2">
                                                        PRO 이상 유료 회원 전용
                                                    </span>
                                                    <h4 className="text-xl font-black text-white">최적 두뇌 가동 골든타임표 (24시간 집중 피크 스케줄)</h4>
                                                    <p className="text-xs text-slate-300 mt-2 max-w-lg mx-auto leading-relaxed">
                                                        개인별 일주기 생체리듬과 크로노타입(MEQ) 정밀 분석에 따른 24시간 두뇌 골든 아워 및 브레인 포그 회복 시간표는 <b>PRO 이상 유료 회원</b> 전용 정밀 처방 항목입니다.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Special rendering for Vitality/Fatigue section (5-2) with Markdown */}
                                    {section.id === '5-2' && (
                                        <div className="col-span-full">
                                            {section.rawContent ? (
                                                <div className="p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-cyan-100">
                                                    {renderSimpleMarkdown(section.rawContent)}
                                                </div>
                                            ) : (
                                                <div className="p-8 bg-white/80 backdrop-blur-sm rounded-2xl border border-cyan-100 text-center py-10">
                                                    <span className="text-3xl grayscale opacity-50 block mb-2">🔋</span>
                                                    <p className="text-slate-700 font-bold">활력도 및 신체 피로도 지수</p>
                                                    <p className="text-xs text-slate-400 mt-1">설문 및 생활 리듬 데이터를 종합하여 활력도와 피로도를 산출합니다.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Special rendering for ANS section (5) with subsections */}
                                    {section.id === '5' && (
                                        <div className="col-span-full">
                                            {section.rawContent ? (() => {
                                                const ansData = parseAnsContent(section.rawContent);
                                                return (
                                                    <div className="space-y-4">
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
                                            })() : (
                                                <div className="p-8 bg-white/80 backdrop-blur-sm rounded-2xl border border-teal-100 text-center py-10">
                                                    <span className="text-3xl grayscale opacity-50 block mb-2">⚡</span>
                                                    <p className="text-slate-700 font-bold">자율신경 균형에 따른 공부법</p>
                                                    <p className="text-xs text-slate-400 mt-1">설문 및 교감·부교감 자율신경 균형도에 따른 맞춤형 학습 처방입니다.</p>
                                                </div>
                                            )}
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

                                    {/* Special rendering for Integrated Cognitive Diagnosis section (5-6) with Cognitive-Subject Mapping */}
                                    {section.id === '5-6' && (
                                        <div className="col-span-full space-y-4">
                                            {section.rawContent && (
                                                <div className="p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-fuchsia-100">
                                                    {renderSimpleMarkdown(section.rawContent)}
                                                </div>
                                            )}

                                            {/* 인지검사 ↔ 과목별 실전 공부법 동적 매핑 카드 (Cognitive-Subject Adaptation) */}
                                            {(() => {
                                                // [정합성] 인지검사 미시행(Free 모드 등) 시 인지 매핑 카드를 노출하지 않습니다.
                                                if (!assessmentResult?.cognitiveResults) {
                                                    return (
                                                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-500 font-medium">
                                                            🧠 인지검사(작업기억·억제통제)를 시행하지 않아 과목별 인지 매핑 처방은 제공되지 않습니다. 정밀 검사 시 인지 지표 기반 처방이 추가됩니다.
                                                        </div>
                                                    );
                                                }
                                                const cogSummary = generateCognitiveStudyAdaptations(
                                                    assessmentResult.cognitiveResults,
                                                    classificationResult?.primary || CareType.HEALTHY
                                                );

                                                return (
                                                    <div className="bg-gradient-to-br from-fuchsia-900/90 to-indigo-950 text-white p-6 rounded-3xl border border-fuchsia-500/30 shadow-xl space-y-4">
                                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-fuchsia-800/60 pb-3">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-2xl bg-fuchsia-500/30 border border-fuchsia-400/40 flex items-center justify-center text-xl">
                                                                    🎯
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-base font-black text-white flex items-center gap-2">
                                                                        <span>인지검사 결과 기반 과목별 맞춤 공부법 (Cognitive-Subject Adaptation)</span>
                                                                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-fuchsia-400/20 text-fuchsia-300 border border-fuchsia-400/30 font-bold font-mono">
                                                                            Precision Mapping
                                                                        </span>
                                                                    </h4>
                                                                    <p className="text-xs text-fuchsia-200">
                                                                        작업기억({cogSummary.workingMemory.score}점), 억제통제({cogSummary.inhibitoryControl.score}점), 인지속도({cogSummary.cognitiveFlexibility.score}점)를 과목별 실행 지침에 직접 매핑했습니다.
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Adaptation Cards by Subject */}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {cogSummary.subjectAdaptations.map((adapt) => {
                                                                const domainName = adapt.cognitiveDomain === 'workingMemory'
                                                                    ? '🧠 작업기억 (Working Memory) 처방'
                                                                    : adapt.cognitiveDomain === 'inhibitoryControl'
                                                                        ? '⚡ 억제통제 (Inhibitory Control) 처방'
                                                                        : '🔄 인지유연성 (Cognitive Flexibility) 처방';

                                                                return (
                                                                    <div key={adapt.cognitiveDomain} className="bg-slate-900/80 border border-fuchsia-500/20 p-4 rounded-2xl space-y-3">
                                                                        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                                                                            <span className="text-xs font-black text-fuchsia-300">{domainName}</span>
                                                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${adapt.level === 'OPTIMAL'
                                                                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                                                                    : adapt.level === 'MODERATE'
                                                                                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                                                                        : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                                                                                }`}>
                                                                                {adapt.domainScore}점 ({adapt.level})
                                                                            </span>
                                                                        </div>

                                                                        <div className="space-y-2 text-xs">
                                                                            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                                                                                <strong className="text-blue-300 block mb-0.5">📐 수학 (Math) — {adapt.subjectProtocols.math.actionName}</strong>
                                                                                <p className="text-slate-300 text-[11px] leading-relaxed">{adapt.subjectProtocols.math.technique}</p>
                                                                            </div>

                                                                            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                                                                                <strong className="text-indigo-300 block mb-0.5">📖 국어 (Korean) — {adapt.subjectProtocols.korean.actionName}</strong>
                                                                                <p className="text-slate-300 text-[11px] leading-relaxed">{adapt.subjectProtocols.korean.technique}</p>
                                                                            </div>

                                                                            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                                                                                <strong className="text-emerald-300 block mb-0.5">🌐 영어 (English) — {adapt.subjectProtocols.english.actionName}</strong>
                                                                                <p className="text-slate-300 text-[11px] leading-relaxed">{adapt.subjectProtocols.english.technique}</p>
                                                                            </div>
                                                                        </div>

                                                                        <div className="p-2.5 bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-xl text-[11px] text-fuchsia-200">
                                                                            <strong>💡 시험 실전 팁</strong>: {adapt.examRoutineAdvice}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                );
                                            })()}
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

                                    {/* Special rendering for Sleep Management section (8) with Markdown */}
                                    {section.id === '8' && (
                                        <div className="col-span-full">
                                            <div className="p-6 bg-white/90 backdrop-blur-sm rounded-3xl border-2 border-indigo-200 shadow-lg shadow-indigo-100/50">
                                                <div className="flex items-center justify-between mb-4 pb-3 border-b border-indigo-100">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-2xl">🌙</span>
                                                        <div>
                                                            <h4 className="font-bold text-slate-800 text-sm">개인 맞춤형 수면 리듬 &amp; 취침·기상 바이오 사이클 처방</h4>
                                                            <p className="text-xs text-slate-500">일주기 리듬(Circadian Rhythm) 및 자율신경·심박 안정화 수면 프로토콜</p>
                                                        </div>
                                                    </div>
                                                    {onUpdateAssessmentResult && (
                                                        <button
                                                            onClick={() => setShowSleepEditModal(true)}
                                                            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer no-print"
                                                        >
                                                            <span>✏️</span>
                                                            <span>수면 소견 편집</span>
                                                        </button>
                                                    )}
                                                </div>
                                                {section.rawContent ? (
                                                    renderSimpleMarkdown(section.rawContent, false)
                                                ) : (
                                                    <div className="text-sm text-slate-600 space-y-2">
                                                        <p>• <strong>권장 취침 및 기상:</strong> 밤 11:30 취침 ~ 오전 06:30 기상 (총 7시간 90분 주기 최적화)</p>
                                                        <p>• <strong>취침 전 블루라이트 차단:</strong> 취침 1시간 전 스마트폰 조작을 금하고 멜라토닌 분비를 촉진하세요.</p>
                                                        <p>• <strong>기상 직후 햇빛 노출:</strong> 기상 후 15분 이내에 자연광을 쬐어 체내 생체 시계를 리셋하세요.</p>
                                                    </div>
                                                )}
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
                                        section.id !== '7' && section.id !== '8' && section.id !== '2' && section.items.map((item, itemIdx) => {
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
                                {section.id !== '2' && section.subItems.length > 0 && (
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

                            {/* Lock Overlay */}
                            {isSectionLocked && (
                                <TierLockOverlay
                                    requiredTier={requiredTier}
                                    title={lockTitle}
                                    description={lockDesc}
                                    onUnlockClick={() => onUpgradeClick?.(requiredTier, lockTitle)}
                                />
                            )}
                        </div>
                    </div>
                );
            })}

            {/* Exam Strategy Section - PREMIUM Tier */}
            {hasExamStrategy && (examDayContent || vulnerableTimeContent) && (
                <div id="section-exam-strategy" className="relative bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-300 rounded-3xl overflow-hidden print-avoid-break shadow-lg shadow-amber-100/50">
                    <div className="p-6 border-b border-amber-100 backdrop-blur-sm">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg text-white">
                                📈
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-3">
                                    <span className="w-1.5 h-7 bg-amber-500 rounded-full"></span>
                                    <h4 className="text-xl font-black text-amber-900 tracking-tight">수험생 실전 수능 전략</h4>
                                    {!isPremiumOrAbove && (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-900/80 text-amber-300 border border-amber-400/30 flex items-center gap-1 shadow-sm">
                                            🔒 PREMIUM 전용
                                        </span>
                                    )}
                                </div>
                                <p className="text-[10px] text-amber-600 font-bold uppercase tracking-[0.2em] mt-1 ml-4">
                                    Exam Strategy - D-Day Guide
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className={`relative ${!isPremiumOrAbove ? 'max-h-[380px] overflow-hidden' : ''}`}>
                        <div className={`p-5 space-y-6 ${!isPremiumOrAbove ? 'blur-md opacity-25 select-none pointer-events-none filter' : ''}`}>
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
                        {!isPremiumOrAbove && (
                            <TierLockOverlay
                                requiredTier="premium"
                                title="수험생 실전 수능 전략 & 시간대별 대응법"
                                description="D-Day 컨디션 조절 프로토콜 및 교시별 실전 타임어택 전략을 잠금 해제하세요."
                                onUnlockClick={() => onUpgradeClick?.('premium', '수험생 실전 수능 전략 (PREMIUM 이상)')}
                            />
                        )}
                    </div>
                </div>
            )}

            {/* [SECRET] Integrated Killer Tips Section - PREMIUM Tier */}
            {analysisText.match(/##\s*\[SECRET\]/) && (() => {
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
                                        {!isPremiumOrAbove && (
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-950/80 text-amber-300 border border-amber-400/30 flex items-center gap-1 shadow-sm">
                                                🔒 PREMIUM 전용
                                            </span>
                                        )}
                                    </h4>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">
                                        Integrated Bio-Cognitive Solution
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className={`relative ${!isPremiumOrAbove ? 'max-h-[380px] overflow-hidden' : ''}`}>
                            <div className={`p-6 space-y-4 ${!isPremiumOrAbove ? 'blur-md opacity-25 select-none pointer-events-none filter' : ''}`}>
                                <div className="prose prose-sm prose-invert max-w-none leading-relaxed">
                                    {renderSimpleMarkdown(secretContent, true)}
                                </div>
                            </div>
                            {!isPremiumOrAbove && (
                                <TierLockOverlay
                                    requiredTier="premium"
                                    title="상위 1% 킬러 문항 공략 시크릿 팁"
                                    description="뇌 인지 과부하 방지 및 킬러 문항 3단계 정복 알고리즘을 확인하세요."
                                    onUnlockClick={() => onUpgradeClick?.('premium', '상위 1% 킬러 문항 공략 시크릿 팁 (PREMIUM 이상)')}
                                />
                            )}
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

            {showSleepEditModal && (
                <SleepAnalysisEditModal
                    isOpen={showSleepEditModal}
                    onClose={() => setShowSleepEditModal(false)}
                    initialText={assessmentResult?.sleepAnalysisText || ''}
                    onSave={(newText) => {
                        if (onUpdateAssessmentResult) {
                            onUpdateAssessmentResult({
                                ...assessmentResult,
                                sleepAnalysisText: newText
                            });
                        }
                    }}
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

                    {/* 6. 1:1 AI 전문 코칭 (Expert Guide - 시작전, 학습중, 신체, Management, 로드맵, KPI) */}
                    {(() => {
                        const careKey = CareType.HEALTHY;
                        const expertData = EXPERT_CONTENTS[careKey] || EXPERT_CONTENTS[CareType.HEALTHY];
                        const weeklyPlan = WEEKLY_PLANS[careKey] || WEEKLY_PLANS[CareType.HEALTHY];
                        const kpiList = SUCCESS_INDICATORS[careKey] || SUCCESS_INDICATORS[CareType.HEALTHY] || [];

                        return (
                            <div className="pt-6 border-t-2 border-indigo-200 mt-6 space-y-6">
                                <div className="bg-gradient-to-r from-indigo-900 to-purple-900 text-white p-5 rounded-2xl shadow-md flex justify-between items-center">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-500 text-white">
                                                PREMIUM PLUS 1:1 AI 전문 코칭
                                            </span>
                                            <span className="text-xs text-indigo-200 font-bold">진단 유형: {CARE_TYPE_LABELS[careKey]?.name || careKey}</span>
                                        </div>
                                        <h3 className="text-xl font-black flex items-center gap-2">
                                            <span>👨‍⚕️</span> 1:1 AI 맞춤형 전문 코칭 가이드 (Expert Guide)
                                        </h3>
                                    </div>
                                    <span className="text-xs text-indigo-200 bg-white/10 px-3 py-1.5 rounded-xl font-mono hidden sm:inline">
                                        CLINICAL AI PROTOCOL
                                    </span>
                                </div>

                                {/* ⚡ 시작 전 (Pre-Study) */}
                                <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-bold text-emerald-950 text-base flex items-center gap-2">
                                            <span>⚡</span> [시작 전] 뇌 예열 및 인지 부하 차단 전략
                                        </h4>
                                        <span className="text-xs text-emerald-700 font-bold bg-emerald-100 px-2.5 py-1 rounded-full">Pre-Study Protocol</span>
                                    </div>
                                    <p className="text-xs text-emerald-800 mb-3 italic">{expertData.prestudy.intro}</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {expertData.prestudy.guides.map((g, idx) => (
                                            <div key={idx} className="bg-white p-3.5 rounded-xl border border-emerald-100 shadow-sm text-xs space-y-1.5">
                                                <div className="flex justify-between items-center font-black text-emerald-900">
                                                    <span>✓ {g.title}</span>
                                                    <span className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded">{g.difficulty}</span>
                                                </div>
                                                <p className="text-slate-700 font-medium">{g.expertDesc}</p>
                                                <p className="text-slate-500 text-[11px]"><strong className="text-emerald-700">근거:</strong> {g.rationale}</p>
                                                <p className="text-indigo-950 bg-indigo-50 p-2 rounded text-[11px] font-semibold"><strong className="text-indigo-600">실천:</strong> {g.action}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* 🧠 학습 중 (Learning) */}
                                <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-bold text-blue-950 text-base flex items-center gap-2">
                                            <span>🧠</span> [학습 중] 전두엽 몰입 및 메타인지 인출 전략
                                        </h4>
                                        <span className="text-xs text-blue-700 font-bold bg-blue-100 px-2.5 py-1 rounded-full">Learning Protocol</span>
                                    </div>
                                    <p className="text-xs text-blue-800 mb-3 italic">{expertData.learning.intro}</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {expertData.learning.guides.map((g, idx) => (
                                            <div key={idx} className="bg-white p-3.5 rounded-xl border border-blue-100 shadow-sm text-xs space-y-1.5">
                                                <div className="flex justify-between items-center font-black text-blue-900">
                                                    <span>✓ {g.title}</span>
                                                    <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded">{g.difficulty}</span>
                                                </div>
                                                <p className="text-slate-700 font-medium">{g.expertDesc}</p>
                                                <p className="text-slate-500 text-[11px]"><strong className="text-blue-700">근거:</strong> {g.rationale}</p>
                                                <p className="text-indigo-950 bg-indigo-50 p-2 rounded text-[11px] font-semibold"><strong className="text-indigo-600">실천:</strong> {g.action}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* 🏃 신체 (Body & Physiology) */}
                                <div className="p-5 rounded-2xl bg-orange-50/60 border border-orange-200">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-bold text-orange-950 text-base flex items-center gap-2">
                                            <span>🏃</span> [신체] 자율신경 활력 및 두뇌 생체 동기화
                                        </h4>
                                        <span className="text-xs text-orange-700 font-bold bg-orange-100 px-2.5 py-1 rounded-full">Body & Physiology</span>
                                    </div>
                                    <p className="text-xs text-orange-800 mb-3 italic">{expertData.exercise.intro}</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {expertData.exercise.guides.map((g, idx) => (
                                            <div key={idx} className="bg-white p-3.5 rounded-xl border border-orange-100 shadow-sm text-xs space-y-1.5">
                                                <div className="flex justify-between items-center font-black text-orange-900">
                                                    <span>✓ {g.title}</span>
                                                    <span className="text-[10px] px-2 py-0.5 bg-orange-50 text-orange-600 rounded">{g.difficulty}</span>
                                                </div>
                                                <p className="text-slate-700 font-medium">{g.expertDesc}</p>
                                                <p className="text-slate-500 text-[11px]"><strong className="text-orange-700">근거:</strong> {g.rationale}</p>
                                                <p className="text-indigo-950 bg-indigo-50 p-2 rounded text-[11px] font-semibold"><strong className="text-indigo-600">실천:</strong> {g.action}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* 📅 주차별 로드맵 (Roadmap) */}
                                <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-200">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">📅</span>
                                            <h4 className="font-bold text-indigo-950 text-base">
                                                주차별 단계 로드맵 ({weeklyPlan.totalWeeks}주 프로그램)
                                            </h4>
                                        </div>
                                        <span className="text-xs font-black text-white bg-indigo-600 px-3 py-1 rounded-full">
                                            목표: {weeklyPlan.goal}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
                                        {weeklyPlan.weeks.map((w, idx) => (
                                            <div key={idx} className={`p-3.5 rounded-xl border flex flex-col justify-between ${w.milestone ? 'bg-indigo-50 border-indigo-300 shadow-sm' : 'bg-white border-slate-200'}`}>
                                                <div>
                                                    <div className="flex items-center justify-between mb-1.5">
                                                        <span className="font-black text-indigo-700 text-sm">Week {w.week}</span>
                                                        {w.milestone && <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded font-bold">마일스톤</span>}
                                                    </div>
                                                    <p className="font-bold text-slate-800 text-xs mb-2">{w.theme}</p>
                                                    <ul className="space-y-1 text-slate-600 text-xs">
                                                        {w.tasks.map((t, tidx) => (
                                                            <li key={tidx} className="flex items-start gap-1.5">
                                                                <span className="text-indigo-500 font-bold shrink-0">•</span>
                                                                <span>{t}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                {w.milestone && (
                                                    <p className="mt-3 pt-2 border-t border-indigo-200 font-bold text-indigo-900 text-xs">
                                                        🎯 {w.milestone}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* 📊 핵심 성공 지표 (KPI) */}
                                <div className="p-5 rounded-2xl bg-teal-50/60 border border-teal-200">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-bold text-teal-950 text-base flex items-center gap-2">
                                            <span>📊</span> [KPI] 데이터 기반 핵심 관리 지표 &amp; 개선 목표
                                        </h4>
                                        <span className="text-xs text-teal-700 font-bold bg-teal-100 px-2.5 py-1 rounded-full">Objective Metrics</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {kpiList.map((kpi, idx) => (
                                            <div key={idx} className="bg-white p-3.5 rounded-xl border border-teal-100 shadow-sm text-xs flex items-start gap-3">
                                                <span className="text-2xl shrink-0 p-2 bg-teal-50 rounded-xl">{kpi.icon}</span>
                                                <div className="space-y-1 flex-1">
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-black text-slate-800">{kpi.indicator}</span>
                                                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${kpi.priority === 'high' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                                                            {kpi.priority === 'high' ? '최우선' : '보통'}
                                                        </span>
                                                    </div>
                                                    <p className="text-teal-700 font-bold text-xs">🎯 목표치: {kpi.targetValue}</p>
                                                    <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                                                        <span>측정주기: {kpi.timeframe}</span>
                                                        <span>측정방법: {kpi.measureMethod}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* 💡 Management 사후 관리 요약 바 */}
                                <div className="bg-slate-900 text-white rounded-2xl p-4 flex items-center justify-between text-xs">
                                    <div>
                                        <p className="font-black text-amber-400 flex items-center gap-2 text-sm">
                                            <span>💡</span> Management 사후 관리 및 1:1 AI 코칭 연동 완료
                                        </p>
                                        <p className="text-slate-300 text-xs mt-1">
                                            본 리포트에 수록된 6대 영역(시작 전/학습 중/신체/Management/로드맵/KPI)의 전 항목과 상세 내용이 검진 결과에 영구 보존됩니다.
                                        </p>
                                    </div>
                                    <span className="shrink-0 text-slate-400 font-mono text-xs ml-4">VERIFIED</span>
                                </div>
                            </div>
                        );
                    })()}

                </div>
            </div>
        </div>
    );
};
