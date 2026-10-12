import React from 'react';
import { SimulationResult } from '../../../services/gradeSimulationEngine';
import { StudentInfo, AIModelConfig } from '../../../types';

interface Props {
    selectedSubjectDetail: string;
    simulationResult: SimulationResult;
    isGeneratingSubject: Record<string, boolean>;
    subjectAiReports: Record<string, string>;
    aiModels?: AIModelConfig | null;
    availableDates: string[];
    viewingDate: string | null;
    latestDate: string;
    student: StudentInfo;
    onViewingDateChange: (date: string) => void;
    onGenerateSubjectReport: (subjectId: string, forceRegenerate?: boolean) => void;
    renderSimpleMarkdown: (text: string) => React.ReactNode;
    onClose: () => void;
}

export const SubjectDetailModal: React.FC<Props> = ({
    selectedSubjectDetail,
    simulationResult,
    isGeneratingSubject,
    subjectAiReports,
    aiModels,
    availableDates,
    viewingDate,
    latestDate,
    student,
    onViewingDateChange,
    onGenerateSubjectReport,
    renderSimpleMarkdown,
    onClose
}) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl max-h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                {(() => {
                    const proj = simulationResult.projections.find(p => p.subjectId === selectedSubjectDetail);
                    if (!proj) return null;
                    const isGeneratingThis = isGeneratingSubject[selectedSubjectDetail];
                    const reportData = subjectAiReports[selectedSubjectDetail];
                    const hasAiConfig = aiModels && (aiModels.localModelUrl || aiModels.geminiKey || aiModels.sonnetKey);

                    const handlePrint = () => {
                        // Import printElement dynamically or assume it's imported (need to add import at top)
                        // Actually better to just use window.print on a new window for pure text or import printElement
                        // Let's just import printElement at the top.
                    };

                    return (
                        <>
                            <div id="subject-detail-modal-content" className="flex flex-col flex-1 min-h-0">
                                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 text-xl font-black">
                                            📘
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800 text-xl flex items-center gap-2">
                                                [{proj.subjectName}] 상세 공부법
                                                {availableDates.length > 0 && (
                                                    <select
                                                        value={viewingDate || latestDate}
                                                        onChange={(e) => onViewingDateChange(e.target.value)}
                                                        className="text-xs ml-2 font-normal border border-slate-200 rounded-md bg-white px-2 py-1 text-slate-600 focus:outline-none focus:border-blue-400"
                                                    >
                                                        {availableDates.map(d => (
                                                            <option key={d} value={d}>
                                                                {d === 'no-date' ? '기본 (날짜 없음)' : d}
                                                                {d === latestDate ? ' (최신)' : ' (과거)'}
                                                            </option>
                                                        ))}
                                                        {!availableDates.includes(latestDate) && (
                                                            <option value={latestDate}>{latestDate} (최신)</option>
                                                        )}
                                                    </select>
                                                )}
                                            </h3>
                                            <p className="text-sm text-slate-500 mt-0.5">현재 {proj.currentGrade}등급{proj.gradeEstimated ? ' (추정)' : ''} → 수능 목표 {proj.targetGrade}등급 달성을 위한 맞춤 플랜</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {reportData && !isGeneratingThis && viewingDate === latestDate && (
                                            <button
                                                onClick={() => {
                                                    const printWindow = window.open('', '_blank');
                                                    if (printWindow) {
                                                        const todayStr = new Date().toISOString().slice(0, 10);
                                                        const diagnosisCode = `ID-${todayStr.replace(/-/g, '')}-ID-${student.id.slice(0, 4)}`;

                                                        printWindow.document.write(`
                                <html><head><title>${proj.subjectName} 성적 향상 솔루션</title>
                                <meta charset="utf-8">
                                <style>
                                    \${Array.from(document.styleSheets).map(s => { try { return Array.from(s.cssRules).map(r => r.cssText).join(''); } catch(e) { return ''; } }).join('\\n')}
                                </style>
                                <style>
                                    @media print {
                                        @page { margin: 10mm; }
                                        body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                                    }
                                    .markdown-body p { margin-bottom: 0.75em; line-height: 1.6; }
                                    .markdown-body strong { font-weight: 800; background-color: #eff6ff; padding: 2px 6px; border-radius: 4px; color: #1e40af; }
                                </style>
                                </head><body class="bg-slate-100 p-8">

                                <div class="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200">
                                    <!-- Header -->
                                    <div class="p-8 border-b-4 border-blue-800">
                                        <div class="flex justify-between items-start mb-6">
                                            <div>
                                                <h4 class="text-blue-600 font-bold tracking-widest text-xs mb-1 uppercase">Neuro-Bio Academic Strategy System</h4>
                                                <h1 class="text-3xl font-black text-slate-900">NBASS 정밀 진단 보고서</h1>
                                                <p class="text-slate-400 text-sm italic mt-1 font-serif">Official Diagnostic & Neuro-Insight Report</p>
                                            </div>
                                            <div class="text-right">
                                                <span class="bg-slate-100 text-slate-600 text-[11px] px-2 py-1 rounded font-mono">Ver 2.5.0-Precision</span>
                                                <p class="text-sm font-bold text-slate-700 mt-2">분석책임자: <span class="text-blue-600">Dr. Lim</span></p>
                                            </div>
                                        </div>

                                        <!-- Info Box -->
                                        <div class="bg-slate-50 border border-slate-200 rounded-xl p-5 flex justify-between">
                                            <div>
                                                <p class="text-[11px] text-slate-400 font-bold mb-1">피검자 성명</p>
                                                <p class="text-lg font-black text-slate-800">${student.name} <span class="text-xs text-slate-400 font-normal">(${student.gender === 'Male' ? 'M' : 'F'} / ${student.age}세)</span></p>
                                            </div>
                                            <div>
                                                <p class="text-[11px] text-slate-400 font-bold mb-1">진단 코드</p>
                                                <p class="text-sm font-mono text-slate-700 font-bold">${diagnosisCode}</p>
                                            </div>
                                            <div>
                                                <p class="text-[11px] text-slate-400 font-bold mb-1">기준 시험 일시</p>
                                                <p class="text-sm text-slate-700 font-bold">${viewingDate === 'no-date' ? todayStr : viewingDate}</p>
                                            </div>
                                            <div>
                                                <p class="text-[11px] text-slate-400 font-bold mb-1">중점 분석 분야</p>
                                                <p class="text-sm text-blue-600 font-bold">${proj.subjectName} (학습 최적화)</p>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Body Title -->
                                    <div class="bg-slate-900 text-white px-8 py-4 flex justify-between items-center">
                                        <h2 class="text-lg font-bold flex items-center gap-2"><span>🧠</span> Brain-Body 통합 진단 기반 상세 플랜</h2>
                                        <span class="bg-slate-800 text-slate-300 text-[10px] px-2 py-1 rounded-md font-mono border border-slate-700">3-Layer Verification</span>
                                    </div>

                                    <!-- Content -->
                                    <div class="p-8">
                                        <div class="flex items-center gap-4 border-b border-slate-100 pb-5 mb-6">
                                            <div class="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center text-2xl">📘</div>
                                            <div>
                                                <h3 class="text-2xl font-black text-slate-800">${proj.subjectName} 성적 향상 솔루션</h3>
                                                <p class="text-slate-500 mt-1 text-sm">현재 <strong class="text-slate-800 font-bold">${proj.currentGrade}등급</strong>에서 목표 <strong class="text-blue-600 font-bold">${proj.targetGrade}등급</strong> 달성을 위한 맞춤형 인지/학습 플랜</p>
                                            </div>
                                        </div>
                                        <div class="markdown-body text-slate-700 text-sm">
                                            ${reportData.split('\n').map(line => {
                                                            if (line.trim() === '') return '<div class="h-2"></div>';
                                                            let htmlLine = line;
                                                            // Bold
                                                            htmlLine = htmlLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                                                            // Lists
                                                            if (htmlLine.trim().startsWith('- ')) {
                                                                return `<li class="ml-4 mb-1">${htmlLine.substring(2)}</li>`;
                                                            }
                                                            if (htmlLine.trim().match(/^\d+\./)) {
                                                                return `<div class="font-bold text-slate-800 mt-4 mb-2 text-base">${htmlLine}</div>`;
                                                            }
                                                            return `<p>${htmlLine}</p>`;
                                                        }).join('')}
                                        </div>
                                    </div>

                                    <!-- Footer -->
                                    <div class="bg-slate-50 p-6 text-center border-t border-slate-200">
                                        <p class="text-[11px] text-slate-400">💡 본 상세 공부법 리포트는 현재 검사 결과를 기준으로 생성되었습니다.</p>
                                        <p class="text-[10px] text-slate-300 mt-1">Generated by NBASS AI Engine</p>
                                    </div>
                                </div>
                                <script>window.onload = () => { setTimeout(() => { window.print(); }, 800); }</script>
                                </body></html>
                            `);
                                                        printWindow.document.close();
                                                    }
                                                }}
                                                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg shadow-sm transition-colors"
                                                title="인쇄 및 PDF 저장"
                                            >
                                                <span>🖨️</span> 인쇄
                                            </button>
                                        )}
                                        <button
                                            onClick={onClose}
                                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                                    {!hasAiConfig && !reportData ? (
                                        <div className="text-center py-12">
                                            <p className="text-slate-500 mb-4">설정에서 AI 모델을 먼저 연동해주세요.</p>
                                        </div>
                                    ) : isGeneratingThis ? (
                                        <div className="flex flex-col items-center justify-center py-16">
                                            <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-6"></div>
                                            <p className="text-lg font-bold text-slate-700">AI가 학생 데이터를 바탕으로</p>
                                            <p className="text-lg font-bold text-slate-700 mb-2">상세 공부법을 작성 중입니다...</p>
                                            <p className="text-sm text-slate-400">약 10~20초 정도 소요될 수 있습니다.</p>
                                        </div>
                                    ) : reportData ? (
                                        <div className="text-slate-700 leading-relaxed space-y-4">
                                            {renderSimpleMarkdown(reportData)}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <button
                                                onClick={() => onGenerateSubjectReport(selectedSubjectDetail)}
                                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-colors"
                                            >
                                                상세 공부법 생성하기
                                            </button>
                                        </div>
                                    )}
                                </div>
                                {reportData && !isGeneratingThis && (
                                    <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                                        <p className="text-xs text-slate-400">💡 본 상세 공부법 인쇄 기능은 차후 <strong className="text-indigo-500">유료 회원 전용</strong>으로 제공될 예정입니다.</p>
                                        <button
                                            onClick={() => onGenerateSubjectReport(selectedSubjectDetail, true)}
                                            className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-2"
                                        >
                                            <span>🔄</span> 다시 생성
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    );
                })()}
            </div>
        </div>
    );
};

export default SubjectDetailModal;