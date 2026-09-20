import React, { useState, useEffect } from 'react';
import { ConsultingResult, generateConsultingReport } from '../services/consultingEngine';
import { generateConsultationScripts } from '../services/consultationScriptEngine';
import { StudentInfo, HRVData, SurveyData, ProtocolData, LearningAnalyticsData, BloodTestData, CareType } from '../types';
import { evaluateClassificationRules, DEFAULT_CLASSIFICATION_RULES } from '../logicEngine';

interface ConsultantTabsProps {
    student: StudentInfo;
    hrv: HRVData;
    survey: SurveyData;
    protocol: ProtocolData;
    analytics: LearningAnalyticsData;
    bloodTest?: BloodTestData;
    // 기존의 관리자 메모 상태 (Tab 1)
    adminMemo: string;
    setAdminMemo: (val: string) => void;
    // 새로운 분석 결과 저장 (Tabs 2-6) - 부모 컴포넌트나 로컬 스토리지 연동 가능
    // 현재는 내부 상태로 관리하되, 필요 시 상위로 끌어올림
}

export const ConsultantTabs: React.FC<ConsultantTabsProps> = ({
    student, hrv, survey, protocol, analytics, bloodTest,
    adminMemo, setAdminMemo
}) => {
    const [activeTab, setActiveTab] = useState<number>(0);
    const [analysis, setAnalysis] = useState<ConsultingResult | null>(null);

    // 각 탭별 편집 가능한 텍스트 상태
    const [texts, setTexts] = useState<string[]>(['', '', '', '', '', '', '']);

    // 상담 시나리오 서브 탭 상태
    const [activeScriptTab, setActiveScriptTab] = useState<string>('truce');
    const [scriptData, setScriptData] = useState<Record<string, string> | null>(null);

    // 최초 로드 시 분석 엔진 실행
    useEffect(() => {
        const result = generateConsultingReport(student, hrv, survey, protocol, analytics, bloodTest);

        // CareType 계산 (App.tsx에서 전달받지 못했을 경우를 대비한 로컬 계산)
        const calculatedCareType = evaluateClassificationRules(DEFAULT_CLASSIFICATION_RULES, hrv, survey, protocol, analytics, bloodTest) || CareType.HEALTHY;

        const scripts = generateConsultationScripts({ student, hrv, survey, protocol, analytics, bloodTest }, calculatedCareType);
        setScriptData(scripts);
        setAnalysis(result);

        // 초기값 세팅 (사용자가 이미 수정한 내용이 있다면 덮어쓰지 않도록 로직 추가 가능)
        // 여기서는 탭 1은 adminMemo, 나머지는 분석 결과로 초기화
        setTexts(prev => [
            adminMemo, // Tab 1: Admin Memo
            prev[1] || result.energyLeakage,
            prev[2] || result.brainMatching,
            prev[3] || result.anxietyTrigger,
            prev[4] || result.metabolicEfficiency,
            prev[5] || result.envControl,
            // 7번째 탭은 현재 선택된 서브 탭의 내용으로 초기화 (최초: truce)
            prev[6] || scripts['truce']
        ]);
    }, [student, hrv, survey, protocol, analytics, bloodTest]);

    // 서브 탭 변경 핸들러
    const handleScriptTabChange = (key: string) => {
        setActiveScriptTab(key);
        if (scriptData) {
            const newTexts = [...texts];
            newTexts[6] = scriptData[key];
            setTexts(newTexts);
        }
    };

    // Tab 1(Admin Memo) 변경 시 상위 상태 업데이트
    const handleTextChange = (index: number, val: string) => {
        const newTexts = [...texts];
        newTexts[index] = val;
        setTexts(newTexts);

        if (index === 0) {
            setAdminMemo(val);
        }
    };

    const tabs = [
        { title: "👨‍⚕️ 나의 전문 소견", color: "text-blue-600", bg: "bg-blue-50" },
        { title: "🔋 에너지 누수 탐지", color: "text-rose-600", bg: "bg-rose-50" },
        { title: "🧠 두뇌 매칭 분석", color: "text-indigo-600", bg: "bg-indigo-50" },
        { title: "😨 불안 유발 요인", color: "text-amber-600", bg: "bg-amber-50" },
        { title: "💊 대사 효율 코칭", color: "text-emerald-600", bg: "bg-emerald-50" },
        { title: "🎧 환경 통제 전략", color: "text-slate-600", bg: "bg-slate-50" },
        { title: "🗣️ 상담 시나리오", color: "text-purple-600", bg: "bg-purple-50" },
    ];

    const copyToClipboard = () => {
        const currentContent = texts[activeTab];
        navigator.clipboard.writeText(currentContent);
        alert(`${tabs[activeTab].title} 내용이 복사되었습니다.`);
    };

    const printContent = () => {
        const currentContent = texts[activeTab];
        const tabTitle = tabs[activeTab].title.replace(/[^가-힣a-zA-Z0-9\s]/g, '').trim();
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>${tabTitle} 인쇄</title>
                        <style>
                            body { font-family: 'Malgun Gothic', 'Noto Sans KR', sans-serif; padding: 40px; line-height: 1.6; }
                            h2 { color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 20px; }
                            pre { white-space: pre-wrap; font-family: inherit; font-size: 14px; color: #334155; }
                            @media print {
                                @page { margin: 20mm; }
                            }
                        </style>
                    </head>
                    <body>
                        <h2>${tabTitle}</h2>
                        <pre>${currentContent}</pre>
                        <script>
                            window.onload = () => {
                                window.print();
                            };
                        </script>
                    </body>
                </html>
            `);
            printWindow.document.close();
        }
    };

    const sendToExpertOpinion = () => {
        const currentContent = texts[activeTab];
        const tabTitle = tabs[activeTab].title.replace(/[^가-힣a-zA-Z0-9\s]/g, '').trim();
        const header = `\n\n--- [${tabTitle}]에서 추가됨 ---\n`;
        const newTexts = [...texts];
        newTexts[0] = newTexts[0] + header + currentContent;
        setTexts(newTexts);
        setAdminMemo(newTexts[0]);
        alert(`'${tabTitle}' 내용이 '나의 전문 소견'으로 복사되었습니다.`);
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            {/* Tabs Header */}
            <div className="flex border-b border-white/10 overflow-x-auto">
                {tabs.map((tab, idx) => (
                    <button
                        key={idx}
                        onClick={() => setActiveTab(idx)}
                        className={`px-4 py-3 text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-2
              ${activeTab === idx
                                ? 'bg-slate-800 text-white border-b-2 border-blue-500'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                            }`}
                    >
                        {/* 아이콘만 색상 적용 */}
                        <span>{tab.title.split(' ')[0]}</span>
                        <span className={activeTab === idx ? 'text-white' : ''}>{tab.title.split(' ').slice(1).join(' ')}</span>
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="p-4 bg-slate-900/50 min-h-[300px]">
                <div className="flex justify-between items-center mb-2">
                    <h4 className={`text-sm font-bold flex items-center gap-2 ${activeTab === 0 ? 'text-blue-400' : 'text-amber-400'}`}>
                        {tabs[activeTab].title}
                        {activeTab !== 0 && <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded ml-2">AI Draft</span>}
                    </h4>
                    <div className="flex gap-2">
                        {activeTab !== 0 && (
                            <button
                                onClick={sendToExpertOpinion}
                                className="px-3 py-1 text-[10px] bg-blue-600/20 hover:bg-blue-600/40 rounded border border-blue-500/30 text-blue-300 transition-colors"
                            >
                                📤 나의 전문소견으로 보내기
                            </button>
                        )}
                        <button
                            onClick={printContent}
                            className="px-3 py-1 text-[10px] bg-white/10 hover:bg-white/20 rounded border border-white/10 text-slate-300 transition-colors"
                        >
                            🖨️ 인쇄
                        </button>
                        <button
                            onClick={copyToClipboard}
                            className="px-3 py-1 text-[10px] bg-white/10 hover:bg-white/20 rounded border border-white/10 text-slate-300 transition-colors"
                        >
                            📋 복사
                        </button>
                    </div>
                </div>

                {/* Sub-tabs for Consultation Scripts */}
                {activeTab === 6 && (
                    <div className="flex gap-2 mb-3 overflow-x-auto pb-1 no-scrollbar">
                        {[
                            { key: 'truce', label: '🤝 평화협정' },
                            { key: 'sleep', label: '💤 수면설계' },
                            { key: 'exam', label: '💯 실전멘탈' },
                            { key: 'dopamine', label: '📵 도파민' },
                            { key: 'nutrition', label: '💊 영양튜닝' },
                        ].map(st => (
                            <button
                                key={st.key}
                                onClick={() => handleScriptTabChange(st.key)}
                                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border whitespace-nowrap
                        ${activeScriptTab === st.key
                                        ? 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-900/50'
                                        : 'bg-slate-800 text-slate-400 border-white/5 hover:bg-slate-700 hover:text-slate-200'
                                    }`}
                            >
                                {st.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* Quick Presets for Tab 0 (나의 전문 소견) */}
                {activeTab === 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 mb-3">
                        <span className="text-xs text-blue-300 font-bold mr-1">⚡ 상용구 추가:</span>
                        {[
                            "수면 불규칙으로 인한 피로 누적이 관찰됩니다.",
                            "오전 카페인 섭취를 자제하고 수분 섭취를 늘리세요.",
                            "가벼운 유산소 운동(걷기 30분)을 권장합니다.",
                            "취침 전 스마트폰 사용을 줄여 뇌 휴식을 유도하세요.",
                            "학습 중간에 4-7-8 호흡법으로 긴장을 완화하세요.",
                            "시험 직전 신체화 불안 완화를 위한 호흡 이완 요법 권고."
                        ].map((memo, mIdx) => (
                            <button
                                key={mIdx}
                                onClick={() => {
                                    const newContent = texts[0] ? texts[0] + '\n• ' + memo : '• ' + memo;
                                    handleTextChange(0, newContent);
                                }}
                                className="px-2.5 py-1 bg-white/10 hover:bg-blue-600/30 border border-white/10 text-slate-300 hover:text-white text-[11px] rounded-lg transition-colors cursor-pointer"
                            >
                                + {memo.length > 18 ? memo.substring(0, 18) + '...' : memo}
                            </button>
                        ))}
                    </div>
                )}

                <textarea
                    value={texts[activeTab]}
                    onChange={(e) => handleTextChange(activeTab, e.target.value)}
                    placeholder={activeTab === 0 ? "학생의 행동 패턴이나 상담 시 특이사항을 기록하세요..." : "분석 결과가 생성됩니다..."}
                    className="w-full h-64 p-4 bg-black/20 border border-white/10 rounded-xl text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none leading-relaxed"
                    spellCheck={false}
                />

                <p className="text-[10px] text-slate-500 mt-2 text-right">
                    * 내용은 자유롭게 수정 가능하며, 수정 후 다른 탭으로 이동해도 유지됩니다. (단, 새로고침 시 초기화될 수 있음)
                </p>
            </div>
        </div>
    );
};
