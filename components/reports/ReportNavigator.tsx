import React, { useState, useEffect } from 'react';

interface NavGroup {
    title: string;
    links: { id: string; label: string; icon?: string }[];
}

interface ReportNavigatorProps {
    isExpertUser?: boolean;
}

export const ReportNavigator: React.FC<ReportNavigatorProps> = ({ isExpertUser = false }) => {
    const [activeId, setActiveId] = useState<string>('');

    const expertLinks = [
        { id: "section-medical-analysis", label: "의학적 정밀 분석" },
        { id: "section-mind-prescription", label: "오늘의 마음 처방전" },
        { id: "section-gamification", label: "인지 훈련 (Gamification)" },
        { id: "section-expert-memo", label: "전문가 소견 (Secret Point)" },
        { id: "section-charts", label: "생체 데이터 차트 분석" },
        { id: "section-nutrition", label: "맞춤형 영양 처방 (Nutrition)" },
        { id: "section-ai-schedule", label: "AI 최적 학습 스케줄링" },
        { id: "section-mental-health", label: "정신건강 처방전" },
        ...(isExpertUser ? [{ id: "section-ai-assistant", label: "나의 전문소견 & AI 보조 어시스턴트" }] : [])
    ];

    const navGroups: NavGroup[] = [
        {
            title: "핵심 요약 & 대시보드",
            links: [
                { id: "section-brain-body", label: "Brain-Body 통합 진단 리포트" },
                { id: "section-overview", label: "종합 진단 분석" }
            ]
        },
        {
            title: "맞춤형 학습 매핑",
            links: [
                { id: "section-1", label: "맞춤형 신체-학습 연결 리포트" },
                { id: "section-2", label: "성향 기반 학습 전략" }
            ]
        },
        {
            title: "심층 생체 데이터 분석",
            links: [
                { id: "section-3", label: "정밀 데이터 분석" },
                { id: "section-4", label: "공부 효율성 정밀 검사" },
                { id: "section-4-2", label: "최적 두뇌 가동 골든타임표" },
                { id: "section-5", label: "자율신경 균형에 따른 공부법" },
                { id: "section-5-2", label: "Vitality & Fatigue Index" },
                { id: "section-5-4", label: "Stress & Concentration Gauge" },
                { id: "section-5-5", label: "통합 학습 최적화 요약" },
                { id: "section-5-6", label: "통합 인지 진단" },
                { id: "section-6", label: "데이터 상관관계 & 번아웃 알람" },
                { id: "section-7", label: "최종 솔루션 제안" },
                { id: "section-exam-strategy", label: "수험생 실전 전략" }
            ]
        },
        {
            title: "전문가 심층 처방 (Expert)",
            links: expertLinks
        }
    ];

    useEffect(() => {
        const handleScroll = () => {
            const sections = navGroups.flatMap(g => g.links.map(l => l.id));
            let current = '';
            for (const id of sections) {
                const element = document.getElementById(id);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    // If element top is above the middle of viewport
                    if (rect.top <= window.innerHeight / 2) {
                        current = id;
                    }
                }
            }
            if (current) {
                setActiveId(current);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        // Initial check
        setTimeout(handleScroll, 500);

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollTo = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            // Account for possible sticky headers
            const y = element.getBoundingClientRect().top + window.scrollY - 210;
            window.scrollTo({ top: y, behavior: 'smooth' });
            setActiveId(id);
        } else {
            console.warn(`Element with id ${id} not found.`);
        }
    };

    return (
        <div className="sticky top-[200px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm max-h-[calc(100vh-14rem)] overflow-y-auto no-print">
            <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2">
                <span className="text-indigo-600">📑</span> Report Navigator
            </h3>
            <div className="space-y-6">
                {navGroups.map((group, gIdx) => (
                    <div key={gIdx} className="space-y-2">
                        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-2">
                            {group.title}
                        </h4>
                        <div className="flex flex-col gap-1 border-l-2 border-slate-100 ml-3">
                            {group.links.map((link, lIdx) => {
                                const isActive = activeId === link.id;
                                return (
                                    <button
                                        key={lIdx}
                                        onClick={() => scrollTo(link.id)}
                                        className={`text-left text-xs py-1.5 pl-3 -ml-[2px] border-l-2 transition-all ${
                                            isActive 
                                                ? 'border-indigo-600 text-indigo-700 font-bold bg-indigo-50/50 rounded-r-lg' 
                                                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                                        }`}
                                    >
                                        {link.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
