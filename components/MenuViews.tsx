import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { CareType, AssessmentResult } from '../types';
import { BreathingGuide } from './BreathingGuide';
import { DropdownSearch } from './DropdownSearch';
import { AnalystConfig } from '../utils/analystConfig';
import { StretchingGuide } from './StretchingGuide';
import { LocalWhiteNoise } from './LocalWhiteNoise';
import { MoodTracker } from './MoodTracker';
import { NBackHistoryChart } from './NBackHistoryChart';

import { SleepCalculator } from './resources/SleepCalculator';
import { EyeCareRoutine } from './resources/EyeCareRoutine';
import { ExamPomodoroTimer } from './resources/ExamPomodoroTimer';
import { EnhancedWhiteNoise } from './resources/EnhancedWhiteNoise';
import { useWellnessGamification } from '../hooks/useWellnessGamification';
import { TrendService, ComprehensiveTrendData } from '../services/trendEngine';
import { SummaryView, CognitiveView, SurveyView, AcademicView, PastPrescriptionsView } from './HistoryCharts';
import { MedicalReport } from './reports/MedicalReport';
import { MembershipTier } from '../utils/featureGate';

export { ProgressView } from './ProgressView';

interface DashboardViewProps {
    onStartClick: () => void;
    onHistoryClick: () => void;
    onTrendClick?: () => void;
    onResourcesClick: () => void;
    onViewReport?: (record: AssessmentResult) => void;
    history: (AssessmentResult & { date: string })[];
    config: { isMedicalMode?: boolean; usePortable?: boolean; useBrainBody?: boolean; isExamMode: boolean };
    analystConfig: AnalystConfig;
    currentStudent?: { id?: string; name?: string };
    membershipTier?: MembershipTier;
    isFreeStudent?: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ 
    onStartClick, 
    onHistoryClick, 
    onTrendClick, 
    onResourcesClick, 
    onViewReport, 
    history, 
    config, 
    analystConfig, 
    currentStudent,
    membershipTier,
    isFreeStudent
}) => {
    // 현재 검사자(학생) 기록만 필터링
    const targetStudentId = currentStudent?.id?.trim();
    const targetStudentName = currentStudent?.name?.trim().toLowerCase();

    const filteredHistory = React.useMemo(() => {
        let baseList = history;
        if (targetStudentId || targetStudentName) {
            baseList = history.filter(h => {
                const hId = h.student?.id?.trim();
                const hName = h.student?.name?.trim().toLowerCase();
                const matchId = Boolean(targetStudentId && hId && targetStudentId === hId);
                const matchName = Boolean(targetStudentName && hName && targetStudentName === hName);
                return matchId || matchName;
            });
        }

        // 동일 날짜(YYYY-MM-DD) 검사는 시간을 제외하고 1개로 통합
        const dateMap = new Map<string, AssessmentResult & { date: string }>();
        baseList.forEach(record => {
            const studentKey = record.student?.id || record.student?.name || 'unknown';
            const d = new Date(record.date);
            const dateStr = !isNaN(d.getTime())
                ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
                : record.date.slice(0, 10);

            const groupKey = `${studentKey}_${dateStr}`;
            if (!dateMap.has(groupKey) || new Date(record.date).getTime() > new Date(dateMap.get(groupKey)!.date).getTime()) {
                dateMap.set(groupKey, record);
            }
        });

        return Array.from(dateMap.values()).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [history, targetStudentId, targetStudentName]);

    const latestResult = filteredHistory[0] || null;

    return (
        <div className="w-full max-w-full space-y-8 animate-in fade-in duration-700">
            {/* Slim Hero & Quick Start Bar */}
            <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[2rem] border border-blue-100 dark:border-slate-700 shadow-xl shadow-blue-500/5 relative overflow-hidden transition-colors">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4.5">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center shrink-0">
                            <img
                                src="./NBASS logo.jpg"
                                alt="NBASS Logo"
                                className="w-full h-full object-contain rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700"
                            />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                    Neuro-Bio Academic Strategy System
                                </h2>
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                                    [ NBASS ]
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
                                신경인지·자율신경 정밀 지표와 5대 학습 기질을 통합 분석하여 개인 최적화 로드맵과 멘탈 솔루션을 처방합니다.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap">
                        {/* Mode Indicator Badges */}
                        <div className="hidden lg:flex items-center gap-2">
                            {config.isMedicalMode ? (
                                <div className="px-3 py-1 bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-bold border border-rose-200 dark:border-rose-800 flex items-center gap-1.5">
                                    <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
                                    Medical Expert
                                </div>
                            ) : config.usePortable ? (
                                <div className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
                                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                    Portable Lite
                                </div>
                            ) : (
                                <div className="px-3 py-1 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-xl text-xs font-bold border border-blue-200 dark:border-blue-800 flex items-center gap-1.5">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                    Standard Mode
                                </div>
                            )}
                        </div>

                        <button
                            onClick={onStartClick}
                            className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-black text-sm sm:text-base shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2"
                        >
                            <span>⚡ 정밀 검사 시작</span>
                            {(isFreeStudent || membershipTier === 'free') && (
                                <span className="px-2 py-0.5 bg-amber-400 text-slate-950 rounded-lg text-xs font-black shadow-xs">
                                    PRO+
                                </span>
                            )}
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </button>
                    </div>
                </div>

                {/* Decorative Blur Backgrounds */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/40 dark:bg-blue-600/10 rounded-full filter blur-3xl pointer-events-none"></div>
                <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-indigo-100/40 dark:bg-indigo-600/10 rounded-full filter blur-3xl pointer-events-none"></div>
            </div>

            {/* 🌟 핵심 정기권 유도: NBASS Continuous Growth Protocol (강화형 프로토콜 카드) */}
            <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/40 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden text-white">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="space-y-4 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 text-xs font-black shadow-inner">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            <span>NBASS Continuous Growth Protocol (정기 구독 & 케어 패스)</span>
                        </div>
                        <h3 className="text-2xl md:text-3xl font-black tracking-tight leading-snug">
                            "진단은 1회성이 아닙니다. <br className="hidden sm:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-300 to-indigo-300">2~4주 정기 성장 추적</span>으로 점수를 완성합니다."
                        </h3>
                        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                            수험생의 자율신경 및 인지 집중도는 맞춤 솔루션 실천 시 <strong>2~4주 만에 유의미한 생체 변화</strong>가 일어납니다. 정기적인 재검진을 통해 불안 완화도, 스트레스 회복탄력성, 작업기억력 향상 수치를 직접 확인하고 최신 맞춤 전략으로 업데이트하세요.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3.5 shrink-0 min-w-[280px]">
                        <div className="bg-slate-800/90 border border-slate-700/90 hover:border-indigo-400/50 transition-all rounded-2xl p-4 flex items-center gap-4 shadow-md">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white flex items-center justify-center font-black text-base shadow-sm shrink-0">
                                2W
                            </div>
                            <div>
                                <div className="text-xs font-black text-white flex items-center gap-1.5">
                                    <span>2주차 퀵 피드백</span>
                                    <span className="text-[9px] px-1.5 py-0.2 bg-blue-500/30 text-cyan-300 rounded font-bold">Fast Care</span>
                                </div>
                                <div className="text-[11px] text-slate-400 mt-0.5">자율신경 피로도 & 스트레스 1차 개선 추적</div>
                            </div>
                        </div>

                        <div className="bg-slate-800/90 border border-slate-700/90 hover:border-purple-400/50 transition-all rounded-2xl p-4 flex items-center gap-4 shadow-md">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center font-black text-base shadow-sm shrink-0">
                                4W
                            </div>
                            <div>
                                <div className="text-xs font-black text-white flex items-center gap-1.5">
                                    <span>4주차 종합 성장 리포트</span>
                                    <span className="text-[9px] px-1.5 py-0.2 bg-purple-500/30 text-purple-300 rounded font-bold">Full Report</span>
                                </div>
                                <div className="text-[11px] text-slate-400 mt-0.5">전후 비교 성장 분석 및 과목별 전략 갱신</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-indigo-500/25 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-xs text-indigo-200">
                        <span className="text-base">💡</span>
                        <span>정기 케어 패스를 이용 시 <strong>학습 몰입도 최대 3.2배 향상</strong> 및 시험 불안 42% 감소 효과</span>
                    </div>
                    <button
                        onClick={onStartClick}
                        className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl text-xs font-black transition-all shadow-md flex items-center gap-2 active:scale-95"
                    >
                        <span>정기 점검 검사 진행하기</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </button>
                </div>
            </div>

            {/* Previous Reports & Wellness Resources Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 1. Previous Assessment Reports (현재 검사자의 기록만 정밀 노출) */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-sm space-y-5">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                            <span className="w-11 h-11 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-xl shrink-0">📋</span>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-black text-slate-900 dark:text-slate-100 text-lg sm:text-xl">
                                        이전 검사 결과 리포트
                                    </h3>
                                    {currentStudent?.name && (
                                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                            {currentStudent.name} 수험생
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {currentStudent?.name ? `${currentStudent.name} 님의 검사 기록만 표시됩니다.` : '과거 검사 기록을 클릭하여 정밀 리포트를 다시 확인하세요.'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={onTrendClick || onHistoryClick}
                                className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                            >
                                <span>📈</span>
                                <span>성장 이력 분석 바로보기</span>
                            </button>
                            <button
                                onClick={onHistoryClick}
                                className="text-xs font-bold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300 flex items-center gap-0.5 px-2 py-1"
                            >
                                전체 기록 →
                            </button>
                        </div>
                    </div>

                    {filteredHistory.length > 0 ? (
                        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                            {filteredHistory.slice(0, 6).map((h, i) => (
                                <div
                                    key={i}
                                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-700/40 hover:bg-white dark:hover:bg-slate-700/80 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3.5"
                                >
                                    <div className="flex items-start sm:items-center gap-3.5">
                                        <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-black text-xs flex items-center justify-center shrink-0">
                                            #{i + 1}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-black text-sm text-slate-900 dark:text-white">
                                                    {h.student?.name || currentStudent?.name || '학생'}
                                                </span>
                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                                    {h.careType}
                                                </span>
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                    종합 {h.score}점
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-slate-400 mt-1 font-medium">
                                                검사일자: {new Date(h.date).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (onViewReport) {
                                                onViewReport(h);
                                            } else {
                                                onHistoryClick();
                                            }
                                        }}
                                        className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 shrink-0 active:scale-95"
                                    >
                                        <span>📄</span>
                                        <span>결과 리포트 열람</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center bg-slate-50 dark:bg-slate-700/30 rounded-2xl border border-dashed border-slate-300 dark:border-slate-600 space-y-3">
                            <span className="text-3xl block">📋</span>
                            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">
                                {currentStudent?.name ? `${currentStudent.name} 님의 등록된 검사 기록이 없습니다.` : '아직 저장된 검사 결과 리포트가 없습니다.'}
                            </p>
                            <button
                                onClick={onStartClick}
                                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md transition-all"
                            >
                                첫 정밀 검사 시작하기 →
                            </button>
                        </div>
                    )}
                </div>

                {/* 2. Wellness Resources Card */}
                <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between" onClick={onResourcesClick}>
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-black text-slate-900 dark:text-slate-100 text-lg flex items-center gap-2.5">
                                <span className="w-11 h-11 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">🧘</span>
                                수험생 웰니스 자료실
                            </h3>
                            <span className="text-blue-500 group-hover:translate-x-1 transition-transform font-bold">→</span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed mb-6">
                            컨디션 최적화를 위한 3분 호흡 가이드, 스트레칭 루틴, 포모도로 집중 타이머 등 즉시 실행 가능한 Wellness 솔루션을 활용하세요.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-4 border-t border-slate-100 dark:border-slate-700">
                        <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-[10px] font-bold">🫁 3분 호흡</span>
                        <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-[10px] font-bold">⏱️ 포모도로</span>
                        <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-[10px] font-bold">🎧 백색소음</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const HistoryView: React.FC<{
    history: (AssessmentResult & { date: string })[],
    selectedStudentId?: string | null,
    onSelectStudent?: (id: string | null) => void,
    onStartClick: () => void,
    onViewDetail: (result: AssessmentResult) => void,
    onImportData: (data: (AssessmentResult & { date: string })[], merge: boolean) => void,
    onExportJSON: () => void,
    onExportCSV: () => void,
    onTrendClick?: () => void,
    onDeleteRecord?: (id: number) => void,
    isStudentRole?: boolean,
    isFreeStudent?: boolean,
    isExpertOrOwner?: boolean,
    studentName?: string
}> = ({ history, selectedStudentId, onSelectStudent, onStartClick, onViewDetail, onImportData, onExportJSON, onExportCSV, onTrendClick, onDeleteRecord, isStudentRole, isFreeStudent, isExpertOrOwner, studentName }) => {
    const [showImportModal, setShowImportModal] = React.useState(false);
    const [importFile, setImportFile] = React.useState<File | null>(null);
    const [importMode, setImportMode] = React.useState<'merge' | 'replace'>('merge');
    const [activeTrendTab, setActiveTrendTab] = React.useState<'summary' | 'cognitive' | 'survey' | 'academic' | 'records'>('summary');
    const [trendData, setTrendData] = React.useState<ComprehensiveTrendData | null>(null);
    const [loadingTrend, setLoadingTrend] = React.useState(false);
    const [previewPrintRecord, setPreviewPrintRecord] = React.useState<AssessmentResult | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleDirectPrintReport = (record: AssessmentResult) => {
        // 즉시 새창 브라우저로 인쇄용 미리보기 및 PDF 뷰어 오픈
        const reportHtml = ReactDOMServer.renderToString(
            <div className="w-full max-w-4xl mx-auto bg-white p-6 sm:p-10 text-slate-900">
                <MedicalReport
                    result={record}
                    isPremiumOrAbove={true}
                    membershipTier={(record.student?.membershipTier as any) || 'premium'}
                />
            </div>
        );

        const printStyle = `
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=Roboto+Mono&display=swap');
            @page { size: A4; margin: 0; }
            body { margin: 0; padding: 20px 0; background: #f1f5f9; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; font-family: 'Noto Sans KR', sans-serif; }
            .no-print { display: none !important; }
            @media print {
                body { background: white; padding: 0; }
                .floating-print-btn, .top-nav-bar { display: none !important; }
            }
            .floating-print-btn {
                position: fixed; top: 20px; right: 24px;
                background: linear-gradient(135deg, #4f46e5, #2563eb); color: white; padding: 12px 24px;
                border-radius: 9999px; font-weight: bold; cursor: pointer; font-size: 14px;
                box-shadow: 0 10px 25px -3px rgba(79, 70, 229, 0.4); border: none; z-index: 1000;
                transition: all 0.2s; display: flex; align-items: center; gap: 8px;
            }
            .floating-print-btn:hover { transform: translateY(-2px); box-shadow: 0 14px 28px -3px rgba(79, 70, 229, 0.5); }
            .top-nav-bar {
                position: sticky; top: 0; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(8px);
                border-bottom: 1px solid #e2e8f0; padding: 12px 24px; z-index: 999;
                display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;
            }
        `;

        const tailwindStyles = Array.from(document.styleSheets)
            .map(styleSheet => {
                try {
                    return Array.from(styleSheet.cssRules).map(rule => rule.cssText).join('');
                } catch (e) {
                    return '';
                }
            }).join('');

        const printWindow = window.open('', '_blank', 'width=1200,height=900,scrollbars=yes,resizable=yes');
        if (printWindow) {
            printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="ko">
          <head>
            <title>NBASS 정밀 진단 보고서 : 등급표시 - ${record.student?.name || '학생'}</title>
            <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
            <style>
              ${tailwindStyles}
              ${printStyle}
            </style>
          </head>
          <body>
            <div class="top-nav-bar">
                <div style="font-weight: 800; font-size: 15px; color: #1e293b; display: flex; align-items: center; gap: 8px;">
                    <span>📄</span>
                    <span>NBASS 정밀 진단 보고서 : 등급표시 [인쇄용 미리보기]</span>
                    <span style="font-size: 12px; font-weight: normal; color: #64748b; background: #e2e8f0; padding: 2px 8px; border-radius: 6px;">
                        ${new Date(record.date).toLocaleDateString('ko-KR')}
                    </span>
                </div>
                <button class="floating-print-btn" onclick="window.print()">
                    <span>🖨️</span>
                    <span>인쇄 / PDF 다운로드</span>
                </button>
            </div>
            <div id="print-root" style="display: flex; justify-content: center;">
              ${reportHtml}
            </div>
          </body>
        </html>
      `);
            printWindow.document.close();
            printWindow.focus();
        }
    };

    const handleOpenPrintWindow = () => {
        if (previewPrintRecord) {
            handleDirectPrintReport(previewPrintRecord);
        } else {
            window.print();
        }
    };

    // Extract unique students
    const uniqueStudents = Array.from(new Map(history.map(h => [h.student.id, h.student])).values()) as any[];

    // Filtered history & Group by Date (동일 날짜는 시간을 제외하고 1개로 통합)
    const filteredHistory = React.useMemo(() => {
        const baseList = selectedStudentId
            ? history.filter(h => h.student.id === selectedStudentId)
            : history;

        // 학생별 + 날짜별(YYYY-MM-DD)로 최신 1건만 남기도록 통합 그룹화
        const dateMap = new Map<string, AssessmentResult & { date: string }>();
        baseList.forEach(record => {
            const studentKey = record.student?.id || record.student?.name || 'unknown';
            const d = new Date(record.date);
            const dateStr = !isNaN(d.getTime())
                ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
                : record.date.slice(0, 10);

            const groupKey = `${studentKey}_${dateStr}`;
            if (!dateMap.has(groupKey) || new Date(record.date).getTime() > new Date(dateMap.get(groupKey)!.date).getTime()) {
                dateMap.set(groupKey, record);
            }
        });

        return Array.from(dateMap.values()).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [history, selectedStudentId]);

    // 대상 학생의 성장 트렌드 데이터 로드
    const activeTargetStudent = React.useMemo(() => {
        if (selectedStudentId) {
            const found = uniqueStudents.find(s => s.id === selectedStudentId);
            if (found) return found;
        }
        if (filteredHistory.length > 0) {
            return filteredHistory[0].student;
        }
        return { name: studentName || '학생', id: selectedStudentId };
    }, [selectedStudentId, uniqueStudents, filteredHistory, studentName]);

    React.useEffect(() => {
        const loadTrend = async () => {
            setLoadingTrend(true);
            try {
                const sName = activeTargetStudent?.name || studentName || '';
                const sBirth = activeTargetStudent?.birthDate || '';
                const sId = activeTargetStudent?.id || selectedStudentId || undefined;
                const data = await TrendService.fetchAndProcessStudentHistory(sName, sBirth, sId);
                setTrendData(data);
            } catch (err) {
                console.error("Failed to load trend in HistoryView", err);
            } finally {
                setLoadingTrend(false);
            }
        };
        loadTrend();
    }, [activeTargetStudent, selectedStudentId, studentName, history.length]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImportFile(file);
            setShowImportModal(true);
        }
    };

    const handleImportConfirm = async () => {
        if (!importFile) return;
        try {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const content = e.target?.result as string;
                    const data = JSON.parse(content);
                    if (!Array.isArray(data)) {
                        alert('올바른 형식이 아닙니다.');
                        return;
                    }
                    onImportData(data, importMode === 'merge');
                    setShowImportModal(false);
                    setImportFile(null);
                    alert(`${data.length}개의 기록을 ${importMode === 'merge' ? '병합' : '가져오기'}했습니다.`);
                } catch (error) {
                    alert('파일을 읽을 수 없습니다. JSON 형식을 확인해주세요.');
                }
            };
            reader.readAsText(importFile);
        } catch (error) {
            alert('파일 가져오기에 실패했습니다.');
        }
    };

    return (
        <div className="w-full max-w-full animate-in fade-in duration-500 space-y-6">
            {/* Free Tier Student 1-Week Retention Banner */}
            {isFreeStudent && (
                <div className="p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-300 shadow-sm">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">⏳</span>
                        <div>
                            <p className="font-bold">무료 회원(FREE) 검사 기록 보관 정책 (최근 1주일 제한)</p>
                            <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                                무료 회원은 <strong>최근 1주일(7일)</strong> 이내의 검사 기록만 조회 가능합니다.
                            </p>
                        </div>
                    </div>
                    <span className="px-3 py-1.5 bg-amber-500 text-white rounded-xl font-bold text-[11px] shrink-0 shadow-sm">
                        유료 등급 업그레이드 시 무제한 열람
                    </span>
                </div>
            )}

            {/* Header Toolbar */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-sm">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                        <span className="text-3xl">📈</span>
                        <span>{activeTargetStudent?.name || '수험생'} 성장 트렌드 및 검사 이력</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                        누적된 인지 테스트, 설문 지표, 학업 효율의 시계열 변화 곡선과 일자별 검사 결과를 확인합니다.
                    </p>
                </div>

                {/* Patient Selector & Data Tools */}
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                    {isStudentRole ? (
                        <div className="flex items-center gap-2 px-3.5 py-2 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-xl text-indigo-800 dark:text-indigo-300 font-bold text-xs shadow-sm">
                            <span>👤</span>
                            <span>{activeTargetStudent?.name || '학생'} 전용 ({filteredHistory.length}회차 기록)</span>
                        </div>
                    ) : (
                        <DropdownSearch
                            uniqueStudents={uniqueStudents}
                            selectedStudentId={selectedStudentId}
                            onSelectStudent={onSelectStudent}
                            historyData={history}
                        />
                    )}

                    <div className="flex gap-2">
                        {!isStudentRole && (
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="px-3.5 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-xl font-bold text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                                title="데이터 가져오기"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
                                <span>가져오기</span>
                            </button>
                        )}

                        <div className="relative group">
                            <button className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                                <span>내보내기</span>
                            </button>
                            <div className="absolute right-0 top-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 min-w-[140px]">
                                <button onClick={onExportJSON} className="w-full px-4 py-2 text-left text-xs hover:bg-slate-50 dark:hover:bg-slate-700 rounded-t-lg font-bold text-slate-700 dark:text-slate-300">JSON 내보내기</button>
                                <button onClick={onExportCSV} className="w-full px-4 py-2 text-left text-xs hover:bg-slate-50 dark:hover:bg-slate-700 rounded-b-lg font-bold text-slate-700 dark:text-slate-300">CSV 내보내기</button>
                            </div>
                        </div>
                    </div>
                </div>

                <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileSelect} className="hidden" />
            </div>

            {/* Growth Trend Tabs Bar */}
            <div className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-700 px-3 sm:px-6 bg-slate-50/50 dark:bg-slate-900/40 scrollbar-thin">
                    {[
                        { id: 'summary', label: '🌟 종합 성장' },
                        { id: 'cognitive', label: '🧠 인지·두뇌' },
                        { id: 'survey', label: '📝 심리·기질' },
                        { id: 'academic', label: '📚 학업·순공' },
                        { id: 'records', label: `📋 검사 기록 (${filteredHistory.length}건)` }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTrendTab(tab.id as any)}
                            className={`flex-1 min-w-fit px-3 sm:px-4 py-3.5 font-bold text-xs sm:text-sm transition-all border-b-2 whitespace-nowrap cursor-pointer text-center ${activeTrendTab === tab.id
                                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 font-black bg-blue-50/40 dark:bg-blue-950/20'
                                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/30'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content Section */}
                <div className="p-6 md:p-8">
                    {loadingTrend ? (
                        <div className="py-20 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                        </div>
                    ) : activeTrendTab === 'records' ? (
                        /* 일자별 검사 목록 (동일 날짜는 시간 제외 1개로 통합) */
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                                    <span>📅</span> 일자별 정밀 검사 이력 목록
                                </h3>
                                <span className="text-xs text-slate-400">동일 날짜 최신 검사 통합 기준</span>
                            </div>

                            {filteredHistory.length > 0 ? (
                                <div className="space-y-3.5">
                                    {filteredHistory.map((record, idx) => (
                                        <div key={idx} className="bg-slate-50/70 dark:bg-slate-700/40 hover:bg-white dark:hover:bg-slate-700/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                            <div className="flex items-start sm:items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-black text-sm flex items-center justify-center shrink-0">
                                                    #{idx + 1}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                                                        <span className="font-black text-slate-900 dark:text-white text-base">
                                                            {record.student?.name || '학생'}
                                                        </span>
                                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${record.careType === CareType.BURNOUT ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' :
                                                            record.careType === CareType.SLEEP ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' :
                                                                'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                                                            }`}>{record.careType}</span>
                                                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                                            종합 {record.score}점
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                                        📅 검사일자: {new Date(record.date).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 self-end md:self-center">
                                                {/* 삭제 버튼: 오너 / 의료전문가 / 학원전문가 로그인 시에만 노출 */}
                                                {isExpertOrOwner && onDeleteRecord && (record as any).id !== undefined && (
                                                    <button
                                                        onClick={() => {
                                                            if (window.confirm('이 기록을 삭제하시겠습니까? (삭제 후 복구 불가)')) {
                                                                onDeleteRecord((record as any).id);
                                                            }
                                                        }}
                                                        className="px-3.5 py-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl font-bold transition-colors cursor-pointer"
                                                        title="전문가/오너 전용 검사 기록 삭제"
                                                    >
                                                        삭제
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDirectPrintReport(record)}
                                                    className="px-4 py-2 text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                                                    title="인쇄용 미리보기 리포트 및 PDF 바로보기"
                                                >
                                                    <span>📄</span>
                                                    <span>결과 리포트 열람 (PDF)</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16 bg-slate-50 dark:bg-slate-700/30 rounded-2xl border border-dashed border-slate-300 dark:border-slate-600">
                                    <p className="text-slate-400 text-sm mb-3">저장된 검사 기록이 없습니다.</p>
                                    <button onClick={onStartClick} className="px-5 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-all">
                                        지금 첫 분석 시작하기
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : trendData && trendData.summary.length > 0 ? (
                        /* 성장 트렌드 분석 뷰 (Summary / Cognitive / Survey / Academic) */
                        <div className="animate-in fade-in duration-300">
                            {activeTrendTab === 'summary' && <SummaryView data={trendData.summary} />}
                            {activeTrendTab === 'cognitive' && <CognitiveView data={trendData.cognitive} />}
                            {activeTrendTab === 'survey' && <SurveyView data={trendData.survey} />}
                            {activeTrendTab === 'academic' && <AcademicView data={trendData.academic} />}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-slate-50 dark:bg-slate-700/30 rounded-2xl border border-dashed border-slate-300 dark:border-slate-600">
                            <span className="text-4xl block mb-2">📈</span>
                            <p className="text-slate-600 dark:text-slate-300 font-bold text-sm mb-1">성장 트렌드를 분석할 데이터가 부족합니다</p>
                            <p className="text-slate-400 text-xs mb-4">최소 1회 이상의 검사 결과가 저장되면 성장 곡선 그래프가 자동 생성됩니다.</p>
                            <button onClick={onStartClick} className="px-5 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-all">
                                정밀 검사 진행하기
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Import Modal */}
            {showImportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700">
                        <h3 className="font-bold text-lg mb-4 text-slate-800 dark:text-white">데이터 가져오기</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                            파일: <span className="font-bold">{importFile?.name}</span>
                        </p>
                        <div className="space-y-3 mb-6">
                            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700">
                                <input
                                    type="radio"
                                    name="importMode"
                                    checked={importMode === 'merge'}
                                    onChange={() => setImportMode('merge')}
                                    className="w-4 h-4 accent-blue-600"
                                />
                                <div>
                                    <p className="font-bold text-sm text-slate-800 dark:text-white">기존 데이터와 병합</p>
                                    <p className="text-xs text-slate-500">중복 제거 후 합치기</p>
                                </div>
                            </label>
                            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700">
                                <input
                                    type="radio"
                                    name="importMode"
                                    checked={importMode === 'replace'}
                                    onChange={() => setImportMode('replace')}
                                    className="w-4 h-4 accent-red-600"
                                />
                                <div>
                                    <p className="font-bold text-sm text-slate-800 dark:text-white">기존 데이터 덮어쓰기</p>
                                    <p className="text-xs text-slate-500">기존 데이터 삭제 후 가져오기</p>
                                </div>
                            </label>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setShowImportModal(false);
                                    setImportFile(null);
                                }}
                                className="flex-1 px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-lg"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleImportConfirm}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
                            >
                                가져오기
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Print Preview Report Modal & Hidden Print Root */}
            {previewPrintRecord && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-6 animate-in fade-in duration-300">
                    <div className="bg-slate-100 dark:bg-slate-900 w-full max-w-5xl h-[92vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700">
                        {/* Header Bar */}
                        <div className="p-4 sm:p-5 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">📄</span>
                                <div>
                                    <h3 className="font-black text-slate-900 dark:text-white text-base sm:text-lg flex items-center gap-2">
                                        <span>{previewPrintRecord.student?.name || '학생'} 인쇄용 종합 진단 결과 리포트</span>
                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                            {new Date(previewPrintRecord.date).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                                        </span>
                                    </h3>
                                    <p className="text-xs text-slate-400">
                                        A4 인쇄 규격에 최적화된 고해상도 PDF 리포트입니다.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleOpenPrintWindow}
                                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                                >
                                    <span>🖨️</span>
                                    <span>인쇄 / PDF 다운로드</span>
                                </button>
                                <button
                                    onClick={() => setPreviewPrintRecord(null)}
                                    className="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        {/* Scrollable Preview Body */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-200/60 dark:bg-slate-950 flex justify-center">
                            <div className="w-full max-w-4xl bg-white shadow-xl rounded-2xl overflow-hidden p-6 sm:p-10 border border-slate-200 text-slate-900">
                                <MedicalReport
                                    result={previewPrintRecord}
                                    isPremiumOrAbove={true}
                                    membershipTier="premium"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Hidden container for Browser Native Print Popup */}
            {previewPrintRecord && (
                <div id="history-print-report-container" className="hidden">
                    <MedicalReport
                        result={previewPrintRecord}
                        isPremiumOrAbove={true}
                        membershipTier="premium"
                    />
                </div>
            )}
        </div>
    );
};

const AFFIRMATIONS = [
    "오늘의 노력이 내일의 실력이 된다.",
    "나는 매일 성장하고 있다.",
    "힘든 순간은 지나가고, 결과는 남는다.",
    "충분히 잘하고 있고, 앞으로 더 잘할 것이다.",
    "휴식도 훌륭한 전략이다."
];

export const ResourcesView: React.FC = () => {
    const [showBreathingGuide, setShowBreathingGuide] = React.useState(false);
    const [isNutritionModalOpen, setIsNutritionModalOpen] = React.useState(false);
    const [isMentalModalOpen, setIsMentalModalOpen] = React.useState(false);

    const [activeFilter, setActiveFilter] = React.useState<string | null>(null);
    const { stats, showConfetti, recentAchievement, completeActivity } = useWellnessGamification();
    const [dailyAffirmation, setDailyAffirmation] = React.useState('');

    React.useEffect(() => {
        setDailyAffirmation(AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)]);
    }, []);

    const filterMatches = (tags: string[]) => {
        if (!activeFilter) return true;
        return tags.includes(activeFilter);
    };

    return (
        <div className="w-full max-w-full animate-in fade-in duration-300 space-y-8 relative">
            {showConfetti && (
                <div className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center">
                    <div className="text-6xl animate-bounce">🎉</div>
                    <div className="absolute top-1/4 bg-white/90 backdrop-blur px-6 py-3 rounded-full shadow-2xl font-black text-rose-600 animate-in fade-in slide-in-from-bottom-10">
                        {recentAchievement}
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <span className="text-3xl">📚</span> 수험생 자료실 (Wellness Center)
                </h2>

                {/* 감정 상태 필터링 */}
                <div className="flex gap-2 bg-slate-100 p-1.5 rounded-xl">
                    <button onClick={() => setActiveFilter(null)} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${!activeFilter ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>전체보기</button>
                    <button onClick={() => setActiveFilter('졸려요')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeFilter === '졸려요' ? 'bg-white shadow text-amber-600' : 'text-slate-500 hover:text-slate-700'}`}>😴 졸려요</button>
                    <button onClick={() => setActiveFilter('불안해요')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeFilter === '불안해요' ? 'bg-white shadow text-rose-600' : 'text-slate-500 hover:text-slate-700'}`}>😰 불안해요</button>
                    <button onClick={() => setActiveFilter('집중이 안돼요')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeFilter === '집중이 안돼요' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>😵 집중 안됨</button>
                </div>
            </div>

            {/* 긍정 확언 배너 */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-4 rounded-2xl text-center shadow-sm">
                <p className="text-blue-800 font-bold text-lg flex items-center justify-center gap-2">
                    <span>✨</span> "{dailyAffirmation}" <span>✨</span>
                </p>
            </div>

            {/* 호흡/명상 가이드 */}
            {filterMatches(['불안해요', '집중이 안돼요']) && (
                <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-4 right-4 bg-white/20 px-3 py-1 rounded-full text-xs font-bold">
                        완료: {stats.breathing}회
                    </div>
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                                🧘 실시간 호흡 가이드
                            </h3>
                            <p className="text-indigo-100 mb-4">
                                4-7-8 호흡법으로 불안을 완화하고 집중력을 높이세요
                            </p>
                            <button
                                onClick={() => setShowBreathingGuide(true)}
                                className="px-6 py-3 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-all shadow-lg"
                            >
                                호흡 가이드 시작하기 →
                            </button>
                        </div>
                        <div className="text-6xl opacity-20">🌬️</div>
                    </div>
                </div>
            )}

            {/* 수면 계산기 */}
            {filterMatches(['졸려요']) && (
                <SleepCalculator />
            )}

            {/* 오프라인 스트레칭 및 안구 운동 */}
            {filterMatches(['졸려요', '집중이 안돼요']) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center justify-between">
                            <span className="flex items-center gap-2"><span className="text-2xl">🤸‍♀️</span> 1분 스트레칭</span>
                            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-full">완료: {stats.stretching}회</span>
                        </h3>
                        <div onClick={() => completeActivity('stretching')}>
                            <StretchingGuide />
                        </div>
                    </div>
                    <div>
                        <EyeCareRoutine />
                    </div>
                </div>
            )}

            {/* 뽀모도로 및 백색 소음 */}
            {filterMatches(['집중이 안돼요']) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ExamPomodoroTimer />
                    <EnhancedWhiteNoise />
                </div>
            )}

            {/* 영양 및 멘탈 가이드 */}
            {filterMatches(['졸려요', '불안해요']) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all">
                        <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                            <span className="text-2xl">🍎</span> 수험생 영양 및 카페인 가이드
                        </h3>
                        <p className="text-slate-500 text-sm mb-4">
                            식단표, 두뇌 간식, 그리고 최적의 카페인 섭취법
                        </p>
                        <button
                            onClick={() => setIsNutritionModalOpen(true)}
                            className="inline-block px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-700 transition-colors"
                        >
                            가이드 보기 →
                        </button>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all">
                        <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                            <span className="text-2xl">🧠</span> 멘탈 관리 칼럼
                        </h3>
                        <p className="text-slate-500 text-sm mb-4">
                            시험 불안을 다스리는 심리학적 기법과 마인드셋 관리법
                        </p>
                        <button
                            onClick={() => setIsMentalModalOpen(true)}
                            className="inline-block px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            칼럼 읽기 →
                        </button>
                    </div>
                </div>
            )}

            {/* 호흡 가이드 모달 */}
            {showBreathingGuide && (
                <BreathingGuide onClose={() => {
                    setShowBreathingGuide(false);
                    completeActivity('breathing');
                }} />
            )}

            {/* 영양 가이드 모달 */}
            {isNutritionModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto overflow-x-hidden relative">
                        <button
                            onClick={() => setIsNutritionModalOpen(false)}
                            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-rose-100 hover:text-rose-600 transition-colors"
                        >
                            ✕
                        </button>

                        <div className="p-8">
                            <h2 className="text-3xl font-black text-slate-900 mb-2 flex items-center gap-3">
                                <span>🍎</span> 수험생 두뇌 영양 가이드
                            </h2>
                            <p className="text-slate-500 mb-8">
                                하루 종일 최고의 집중력과 체력을 유지하기 위한 시간대별 맞춤 식단 및 간식 추천입니다.
                            </p>

                            <div className="space-y-8">
                                {/* 아침 */}
                                <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100">
                                    <h3 className="text-xl font-bold text-amber-900 flex items-center gap-2 mb-3">
                                        🌅 아침 (Breakfast): 뇌를 깨우는 에너지
                                    </h3>
                                    <p className="text-amber-800 text-sm mb-4 leading-relaxed">
                                        아침 식사는 수면 중에 소비된 뇌의 에너지원(포도당)을 보충하는 가장 중요한 시간입니다.
                                        급격한 혈당 상승을 피하기 위해 <strong>복합 탄수화물</strong>과 <strong>단백질</strong> 위주로 구성하세요.
                                    </p>
                                    <ul className="space-y-2 text-amber-900 text-sm">
                                        <li className="flex items-start gap-2"><span>✅</span> <strong>추천 메뉴:</strong> 현미밥/잡곡밥, 계란 프라이/계란말이, 두부 조림, 맑은 국</li>
                                        <li className="flex items-start gap-2"><span>✅</span> <strong>간편식:</strong> 통밀 식빵 1~2장 + 삶은 계란 + 무가당 두유, 오트밀 + 바나나</li>
                                        <li className="flex items-start gap-2"><span>⚠️</span> <strong>피해야 할 음식:</strong> 시리얼, 빵 등 단순 당이 많은 음식 (식곤증 유발 및 집중력 저하)</li>
                                    </ul>
                                </div>

                                {/* 점심 */}
                                <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                                    <h3 className="text-xl font-bold text-emerald-900 flex items-center gap-2 mb-3">
                                        ☀️ 점심 (Lunch): 졸음 방지와 활력 유지
                                    </h3>
                                    <p className="text-emerald-800 text-sm mb-4 leading-relaxed">
                                        오후의 식곤증을 예방하려면 과식을 피하고, 위장에 부담이 적은 <strong>단백질과 비타민, 미네랄</strong> 위주로 섭취해야 합니다.
                                    </p>
                                    <ul className="space-y-2 text-emerald-900 text-sm">
                                        <li className="flex items-start gap-2"><span>✅</span> <strong>추천 메뉴:</strong> 닭가슴살 샐러드, 생선 구이(연어, 고등어), 비빔밥(밥 양은 적게, 나물 듬뿍)</li>
                                        <li className="flex items-start gap-2"><span>✅</span> <strong>간편식:</strong> 닭가슴살/연어 샌드위치 (통밀빵), 닭가슴살 소시지</li>
                                        <li className="flex items-start gap-2"><span>⚠️</span> <strong>피해야 할 음식:</strong> 돈까스, 짜장면 등 기름지고 탄수화물이 과도한 배달 음식</li>
                                    </ul>
                                </div>

                                {/* 저녁 */}
                                <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
                                    <h3 className="text-xl font-bold text-blue-900 flex items-center gap-2 mb-3">
                                        🌙 저녁 (Dinner): 소화 촉진 및 숙면 준비
                                    </h3>
                                    <p className="text-blue-800 text-sm mb-4 leading-relaxed">
                                        야간 자율학습과 숙면을 위해 위에 부담이 없고 소화가 잘 되는 식단이 필요합니다.
                                        취침 전 위장이 쉴 수 있도록 식사는 취침 3~4시간 전에 마치는 것이 좋습니다.
                                    </p>
                                    <ul className="space-y-2 text-blue-900 text-sm">
                                        <li className="flex items-start gap-2"><span>✅</span> <strong>추천 메뉴:</strong> 소고기 무국, 미역국, 두부 샐러드, 생선 구이, 상추쌈(적당량)</li>
                                        <li className="flex items-start gap-2"><span>✅</span> <strong>야식(필요시):</strong> 따뜻한 우유 반 잔, 바나나 반 개, 방울토마토 (맵고 짠 라면, 치킨 절대 금지)</li>
                                        <li className="flex items-start gap-2"><span>⚠️</span> <strong>피해야 할 음식:</strong> 매운 떡볶이, 기름진 야식 (수면 질을 극도로 저하시키고 다음날 피로도 증가)</li>
                                    </ul>
                                </div>

                                {/* 두뇌 영양 간식 */}
                                <div className="p-6 bg-purple-50 rounded-2xl border border-purple-100">
                                    <h3 className="text-xl font-bold text-purple-900 flex items-center gap-2 mb-3">
                                        🧠 집중력 부스터: 두뇌 영양 간식
                                    </h3>
                                    <p className="text-purple-800 text-sm mb-4 leading-relaxed">
                                        공부 중 당이 떨어지거나 출출할 때, 뇌세포를 보호하고 집중력을 단숨에 끌어올리는 간식입니다.
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-white p-4 rounded-xl shadow-sm border border-purple-100/50">
                                            <h4 className="font-bold text-purple-900 mb-1">견과류 (호두, 아몬드)</h4>
                                            <p className="text-xs text-purple-700">오메가-3와 비타민 E가 풍부해 인지 기능 향상. 하루 한 줌(약 30g) 권장.</p>
                                        </div>
                                        <div className="bg-white p-4 rounded-xl shadow-sm border border-purple-100/50">
                                            <h4 className="font-bold text-purple-900 mb-1">다크 초콜릿 (카카오 70% 이상)</h4>
                                            <p className="text-xs text-purple-700">플라보노이드 성분이 뇌 혈류량을 증가시켜 집중력과 기억력 단기 향상.</p>
                                        </div>
                                        <div className="bg-white p-4 rounded-xl shadow-sm border border-purple-100/50">
                                            <h4 className="font-bold text-purple-900 mb-1">블루베리</h4>
                                            <p className="text-xs text-purple-700">강력한 항산화 작용으로 뇌세포 노화를 막고 학업 스트레스로 인한 뇌 피로 회복.</p>
                                        </div>
                                        <div className="bg-white p-4 rounded-xl shadow-sm border border-purple-100/50">
                                            <h4 className="font-bold text-purple-900 mb-1">그릭 요거트</h4>
                                            <p className="text-xs text-purple-700">장 건강(제2의 뇌)을 지키고 단백질을 공급해 포만감을 오래 유지.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* 카페인 및 영양제 가이드 */}
                                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-3">
                                        ☕ 카페인 및 영양제 최적화 가이드
                                    </h3>
                                    <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                                        피로를 쫓기 위해 무심코 마시는 카페인, 전략적으로 섭취해야 부작용을 막을 수 있습니다.
                                    </p>
                                    <ul className="space-y-4 text-slate-700 text-sm">
                                        <li className="bg-white p-4 rounded-xl shadow-sm">
                                            <strong className="text-blue-600">💡 커피 냅 (Coffee Nap) 활용법:</strong><br />
                                            커피를 마신 직후 20분간 짧은 낮잠을 자고 일어나면, 뇌의 피로 물질(아데노신)이 씻겨나간 자리에 카페인이 작용하여 최고의 각성 효과를 냅니다.
                                        </li>
                                        <li className="bg-white p-4 rounded-xl shadow-sm">
                                            <strong className="text-rose-600">⚠️ 카페인 크래시 예방:</strong><br />
                                            기상 직후(코르티솔 수치가 가장 높을 때) 커피를 마시면 효과가 떨어지고 부작용이 큽니다. 기상 후 1.5~2시간 뒤에 첫 커피를 마시는 것이 좋습니다. 오후 3시 이후에는 수면을 위해 카페인을 피하세요.
                                        </li>
                                        <li className="bg-white p-4 rounded-xl shadow-sm">
                                            <strong className="text-emerald-600">💊 필수 영양제 추천:</strong><br />
                                            - <strong className="text-slate-900">오메가3:</strong> 뇌 혈류 개선 및 안구 건조증 완화 (식후 섭취)<br />
                                            - <strong className="text-slate-900">비타민 B군 (고함량):</strong> 에너지 대사 촉진 및 피로 회복 (아침 식후 섭취)<br />
                                            - <strong className="text-slate-900">마그네슘:</strong> 눈떨림 방지 및 신경 안정, 숙면 유도 (저녁 식후 또는 취침 전 섭취)
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 멘탈 관리 칼럼 모달 */}
            {isMentalModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto overflow-x-hidden relative">
                        <button
                            onClick={() => setIsMentalModalOpen(false)}
                            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-rose-100 hover:text-rose-600 transition-colors"
                        >
                            ✕
                        </button>

                        <div className="p-8">
                            <h2 className="text-3xl font-black text-slate-900 mb-2 flex items-center gap-3">
                                <span>🧠</span> 시험 불안을 다스리는 심리학
                            </h2>
                            <p className="text-slate-500 mb-8">
                                인지행동치료(CBT)와 스포츠 심리학에 기반한 실전 멘탈 관리 및 마인드셋 기법입니다.
                            </p>

                            <div className="space-y-8">
                                {/* Section 1 */}
                                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-3">
                                        💡 1. 불안의 재평가 (Reappraisal)
                                    </h3>
                                    <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                                        심장이 빠르게 뛰고 손에 땀이 나는 것은 '내가 시험을 망칠 것 같다'는 신호가 아니라,
                                        <strong>'내 뇌가 최고의 성능을 내기 위해 혈액과 산소를 펌프질하며 전투 준비를 하고 있다'</strong>는 생리적 증거입니다.
                                    </p>
                                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                                        <p className="text-sm font-bold text-blue-600 mb-1">적용 방법:</p>
                                        <p className="text-sm text-slate-700">"나는 지금 너무 긴장돼" 라고 말하는 대신, <strong>"나는 지금 엄청나게 흥분(설렘)되고 준비된 상태야"</strong> 라고 소리 내어 말해보세요. 뇌는 이 두 감정을 생리적으로 똑같이 인식합니다.</p>
                                    </div>
                                </div>

                                {/* Section 2 */}
                                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-3">
                                        ⚓ 2. 5-4-3-2-1 그라운딩 (Grounding) 기법
                                    </h3>
                                    <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                                        극도의 불안감이나 패닉(블랙아웃)이 올 때, 과부하가 걸린 뇌의 주의력을 '미래의 걱정'에서 '현재의 감각'으로 강제로 끌어오는 기법입니다.
                                    </p>
                                    <ul className="space-y-2 text-slate-700 text-sm bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                                        <li><strong>👁️ 5개:</strong> 지금 내 눈에 보이는 것 5가지 (책상, 시계, 연필 등)</li>
                                        <li><strong>🖐️ 4개:</strong> 내 피부에 닿는 느낌 4가지 (의자의 촉감, 발바닥, 옷의 감촉 등)</li>
                                        <li><strong>👂 3개:</strong> 지금 들리는 소리 3가지 (에어컨 소리, 숨소리, 멀리서 나는 차 소리)</li>
                                        <li><strong>👃 2개:</strong> 지금 맡을 수 있는 냄새 2가지</li>
                                        <li><strong>👅 1개:</strong> 입 안의 맛 1가지 (또는 긍정적인 확언 한 마디)</li>
                                    </ul>
                                </div>

                                {/* Section 3 */}
                                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-3">
                                        ⏱️ 3. 걱정 시간 지정하기 (Worry Time)
                                    </h3>
                                    <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                                        공부 중에 자꾸 '수능 망치면 어떡하지?', '이거 다 못 끝내면 어떡하지?'라는 꼬리 무는 생각이 들 때 유용합니다.
                                    </p>
                                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                                        <p className="text-sm font-bold text-rose-600 mb-1">적용 방법:</p>
                                        <p className="text-sm text-slate-700">"이 걱정은 <strong>오늘 밤 10시에 딱 15분 동안만</strong> 치열하게 하자"라고 마음속으로 상자에 담아 미룹니다. 막상 밤 10시가 되면 그 걱정은 더 이상 위협적이지 않은 경우가 많습니다.</p>
                                    </div>
                                </div>

                                {/* Section 4 */}
                                <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
                                    <h3 className="text-xl font-bold text-blue-900 flex items-center gap-2 mb-3">
                                        🌱 4. 성장 마인드셋 (Growth Mindset)
                                    </h3>
                                    <p className="text-blue-800 text-sm mb-4 leading-relaxed">
                                        시험의 목적은 '내 지능을 평가받는 것'이 아니라 '내가 모르는 것을 찾아내어 수능 전까지 메꾸기 위함'입니다.
                                    </p>
                                    <ul className="space-y-3 text-sm">
                                        <li className="flex items-start gap-2">
                                            <span className="text-rose-500 font-bold">❌ 완벽주의:</span>
                                            <span className="text-blue-900">"100점을 맞아야 해. 하나라도 틀리면 끝이야."</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-emerald-600 font-bold">✅ 최적주의:</span>
                                            <span className="text-blue-900">"내가 지금까지 공부하고 아는 것은 무조건 다 맞히고 온다."</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
