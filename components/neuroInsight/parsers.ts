// Section parsers & config (moved verbatim; no logic change)

export const parseSection = (text: string, sectionId: string): { items: string[]; subItems: string[]; rawContent?: string } => {
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

export const parseAnsContent = (rawContent: string): { intro: string; subsections: { title: string; content: string }[] } => {
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

export const sections = [
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

export const colorClasses: Record<string, { bg: string; border: string; icon: string; title: string; badge: string; itemBg: string }> = {
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

export const parseItem = (item: string): { label: string; value: string; icon?: string; isWarning: boolean; isSuccess: boolean; isDanger: boolean } => {
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
export const buildParsedSections = (analysisText: string, assessmentResult: any) => {
    return sections.map(section => {
        const { items, subItems, rawContent } = parseSection(analysisText, section.id);

        // Merge sleepAnalysisText for Section 8 if available
        let finalRawContent = rawContent;
        if (section.id === '8' && assessmentResult?.sleepAnalysisText) {
            finalRawContent = assessmentResult.sleepAnalysisText;
        }

        return { ...section, items, subItems, rawContent: finalRawContent };
    });
};