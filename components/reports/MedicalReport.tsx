import React from 'react';
import { AssessmentResult, CareType, StrategyMap } from '../../types';
import { AnalystConfig, getAnalystDisplayText, getSignatureImage } from '../../utils/analystConfig';
import { CARE_TYPE_LABELS } from '../../logicEngine';
import { SUBJECT_OPTIONS_MAP } from '../../data/subjectOptions';
import { EXPERT_CONTENTS } from '../ExpertOverlay';
import { BrainBodyDashboard } from './BrainBodyDashboard';
import CircularSchedule from '../ui/CircularSchedule';
import { evaluateBrainBodyCoherence } from '../../services/brainBodyEngine';

interface MedicalReportProps {
    result: AssessmentResult;
    analystConfig?: AnalystConfig;
    strategies?: StrategyMap;
    selectedSubjectOptions?: any;
    adminMemo?: string;
    config?: {
        useBrainBody?: boolean;
        usePortable?: boolean;
        isMedicalMode?: boolean;
        currentExaminerId?: string | null;
        examiners?: import('../../types').Examiner[];
    };
}

export const MedicalReport: React.FC<MedicalReportProps> = ({ result, strategies, selectedSubjectOptions, adminMemo, config }) => {
    const { student, hrv, classificationResult, protocol } = result;

    const brainBodyState = React.useMemo(() => {
        try {
            return evaluateBrainBodyCoherence(result.hrv, result.survey, result.careType);
        } catch (e) {
            console.error("BrainBodyEngine error in MedicalReport:", e);
            return null;
        }
    }, [result.hrv, result.survey, result.careType]);

    // Extract top 3 valid scores for the cards (matching NeuroInsightReport behavior)
    const validScores = classificationResult?.allScores?.filter(s => s.type !== CareType.UNASSESSED).slice(0, 3) || [];
    const primaryScoreData = validScores.length > 0 ? validScores[0] : null;
    const secondary1Data = validScores.length > 1 ? validScores[1] : null;
    const secondary2Data = validScores.length > 2 ? validScores[2] : null;

    // Examiner logic
    const getCurrentExaminer = () => {
        if (!config?.currentExaminerId || !config?.examiners) return null;
        return config.examiners.find(e => e.id === config.currentExaminerId);
    };
    const examiner = getCurrentExaminer();
    const examinerDisplay = examiner 
        ? `${examiner.id}${examiner.position ? ` (${examiner.position})` : ''}` 
        : (result.analystConfig ? getAnalystDisplayText(result.analystConfig) : 'Dr. Lim');

    // --- Data Calculation & Helper Logic ---
    // BMI
    const bmi = student.bmi || (student.weight && student.height ? student.weight / ((student.height / 100) ** 2) : 0);
    const bmiStatus = bmi > 25 ? '비만 (Obese)' : bmi > 23 ? '과체중 (Overweight)' : '정상 (Normal)';
    const bmiColor = bmi > 23 ? 'text-red-500' : 'text-blue-700';

    // Vitality & Fatigue
    const vitality = hrv.vitality ?? 50;
    const fatigue = hrv.fatigue ?? 50;
    const stress = protocol?.stressLevel ?? 50;

    // Golden Time
    const goldenStart = hrv.goldenTimeStart || "09:00";
    const goldenEnd = hrv.goldenTimeEnd || "12:00";

    // Date & Age
    const today = student.testDate || new Date().toISOString().split('T')[0];
    const age = student.age || (new Date().getFullYear() - new Date(student.birthDate).getFullYear());
    const genderStr = student.gender === 'Male' ? 'M' : 'F';

    // Assessment Checks
    const isHrvAssessed = hrv.sns > 0 || hrv.pns > 0 || hrv.tp > 0;
    const isEegAssessed = hrv.brainScore > 0 || hrv.eegAlpha > 0;

    // Formatting Helpers
    const getWidth = (val: number) => ({ width: `${Math.min(100, Math.max(0, val))}%` });

    // --- Shared Components for Layout Standardization ---

    // 1. Header (Identical on all pages)
    const ReportHeader = () => (
        <div className="flex flex-col md:flex-row justify-between items-start border-b-2 border-slate-200 pb-3 mb-4">
            <div>
                <div className="text-blue-700 font-bold text-xs tracking-widest uppercase">Neuro-Bio Academic Strategy System</div>
                <h1 className="text-2xl font-black text-slate-800">NBASS 정밀 진단 보고서</h1>
                <p className="text-slate-500 text-xs italic">Official Diagnostic & Neuro-Insight Report</p>
            </div>
            <div className="mt-2 md:mt-0 text-right">
                <div className="inline-block bg-slate-100 px-3 py-1 rounded text-xs font-mono text-slate-600 mb-1">Ver 2.5.0-Precision</div>
                <div className="text-xs font-medium">분석책임자: <span className="text-blue-700">{examinerDisplay}</span></div>
            </div>
        </div>
    );

    // 2. Patient Info Grid (Identical on all pages)
    const PatientInfoGrid = () => (
        <div className="grid grid-cols-4 gap-6 bg-slate-50 p-6 rounded-xl mb-8 border border-slate-100">
            <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">피검자 성명</label>
                <div className="text-lg font-bold">{student.name} <span className="text-sm font-normal text-slate-500">({genderStr} / {age}세)</span></div>
            </div>
            <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">진단 코드</label>
                <div className="text-base font-mono font-medium">ID-{today.replace(/-/g, '').substring(2)}-{student.id.substring(0, 4)}</div>
            </div>
            <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">검사 일시</label>
                <div className="text-base">{today}</div>
            </div>
            <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">중점 분석 분야</label>
                <div className="text-base font-bold text-blue-600">{student.weakSubject ? student.weakSubject.toUpperCase() : 'GENERAL'} (학습 최적화)</div>
            </div>
        </div>
    );

    // 3. Footer (Standardized with Page Number)
    const ReportFooter = ({ pageNum, title }: { pageNum: number, title: string }) => (
        <div className="mt-auto pt-6 border-t border-slate-100 flex flex-col md:flex-row justify-between text-[10px] text-slate-400 font-medium">
            <p>© 2026 NEURO-EDULAB. All data is encrypted and confidential.</p>
            <p className="mt-2 md:mt-0 uppercase tracking-widest">{title} : PAGE {String(pageNum).padStart(2, '0')}</p>
        </div>
    );

    // 4. Page Layout Wrapper (Flexible Content-Driven)
    const ReportPage = ({ children, pageNum, footerTitle, breakBefore = false, autoHeight = false }: { children: React.ReactNode, pageNum: number, footerTitle: string, breakBefore?: boolean, autoHeight?: boolean }) => (
        <div className={`page ${breakBefore ? 'page-break-before' : ''} ${autoHeight ? 'page-auto-height' : ''}`}>
            <div className={`report-card ${autoHeight ? 'report-card-auto-height' : ''}`}>
                <ReportHeader />
                <PatientInfoGrid />
                <div className="report-content-wrapper flex-1 flex flex-col">{children}</div>
                <ReportFooter pageNum={pageNum} title={footerTitle} />
            </div>
        </div>
    );

    return (
        <div className="medical-report-root bg-white text-slate-900 font-sans" style={{ width: '210mm', margin: '0 auto' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700;900&family=Roboto+Mono&display=swap');
                .medical-report-root { font-family: 'Noto Sans KR', sans-serif; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                
                /* --- A4 OPTIMIZED LAYOUT (Print-Ready Pagination) --- */
                
                .page { 
                    /* SHEET SETUP - Fixed A4 height for consistent pages */
                    width: 210mm !important;
                    min-height: 297mm !important; /* Allow growing */
                    height: auto !important;
                    margin: 0 auto 20mm; /* Add bottom margin between sections */
                    padding: 8mm !important; /* Reduced from 10mm to prevent clipping */
                    box-sizing: border-box;
                    
                    /* BACKGROUND */
                    background-color: #f1f5f9 !important;
                    
                    /* LAYOUT - Flex container to fill page */
                    display: flex !important;
                    flex-direction: column !important;
                    position: relative;
                    overflow: visible !important; /* Prevent content overflow cut off */
                    
                    /* PAGE BREAKS */
                    page-break-after: always !important;
                }
                
                /* Force page break before specific sections */
                .page-break-before {
                    page-break-before: always !important;
                    break-before: page !important;
                }

                /* Auto Height Modifiers */
                .page-auto-height {
                    height: auto !important;
                    min-height: 297mm !important;
                    overflow: visible !important;
                }
                .report-card-auto-height {
                    height: auto !important;
                    overflow: visible !important;
                }
                
                .report-card {
                    /* CARD VISUALS */
                    background-color: white !important;
                    border-radius: 0.75rem;
                    
                    /* SHADOW (The critical "Card" look) */
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1) !important;
                    
                    /* BORDERS (Only Top Blue Bar) */
                    border: none !important;
                    border-top: 8px solid #1e40af !important;
                    
                    /* SPACING */
                    padding: 1.75rem !important; /* Reduced from 2.5rem to prevent clipping */
                    
                    /* SIZING - Fill entire page */
                    min-height: 100% !important;
                    height: auto !important;
                    display: flex !important;
                    flex-direction: column !important;
                    overflow: visible !important;
                }

                .metric-bar {
                    height: 8px;
                    border-radius: 4px;
                    background: #e2e8f0;
                    overflow: hidden;
                }
                .metric-fill-red { background: #ef4444; }
                .metric-fill-blue { background: #3b82f6; }
                .metric-fill-green { background: #10b981; }
                .metric-fill-orange { background: #f97316; }

                /* --- PRINT SETUP (A4 Optimized) --- */
                @media print {
                    @page { size: A4; margin: 0; }
                    
                    html, body { margin: 0 !important; padding: 0 !important; background-color: #f1f5f9 !important; }
                    .medical-report-root { width: 210mm !important; margin: 0 auto !important; background-color: #f1f5f9 !important; }
                    
                    /* Pages are fixed A4 size */
                    .page { 
                        display: block !important;
                        margin: 0 !important; 
                        border: none !important; 
                        background-color: #f1f5f9 !important;
                        page-break-inside: auto !important; /* Allow splitting across pages if tall */
                        min-height: 297mm !important; /* Ensure at least A4 height */
                        height: auto !important;
                        overflow: visible !important;
                        page-break-after: always !important;
                    }
                    
                    .report-card { 
                        display: block !important;
                        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1) !important; 
                        background-color: white !important;
                        page-break-inside: auto !important;
                        min-height: 100% !important;
                        height: auto !important;
                        overflow: visible !important;
                    }

                    .report-content-wrapper {
                        display: block !important;
                        height: auto !important;
                        overflow: visible !important;
                    }
                    
                    /* Explicit page breaks only */
                    .page-break-before {
                        page-break-before: always !important;
                        break-before: page !important;
                    }
                    
                    /* Prevent minor element clipping */
                    h2, h3, h4 {
                        page-break-after: avoid !important;
                        page-break-inside: avoid !important;
                    }
                    
                    /* Auto Height overrides for print */
                    .page.page-auto-height {
                        height: auto !important;
                        min-height: 297mm !important;
                        overflow: visible !important;
                        page-break-inside: auto !important;
                    }
                    .report-card.report-card-auto-height {
                        height: auto !important;
                        overflow: visible !important;
                        page-break-inside: auto !important;
                    }

                    .print-avoid-break {
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                    }
                    
                    /* Table overrides for print */
                    .report-card-table {
                        background-color: white !important;
                        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1) !important;
                    }
                    
                    .grid-cols-3, .grid-cols-4 {
                        page-break-inside: avoid !important;
                    }
                    
                    .bg-slate-900, .bg-blue-900, .bg-indigo-50, .bg-emerald-50, .bg-blue-50 {
                        page-break-inside: avoid !important;
                    }
                    
                    .rounded-xl.border, .rounded-xl.p-4, .rounded-xl.p-5, .rounded-xl.p-6 {
                        page-break-inside: avoid !important;
                    }
                    
                    /* Force Grid Layout */
                    .grid { display: grid !important; }
                    .grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; }
                    .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
                    .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
                    .gap-6 { gap: 1.5rem !important; }
                    .gap-8 { gap: 2rem !important; }
                    
                    .bg-slate-50 { background-color: rgb(248 250 252) !important; }
                    .p-6 { padding: 1.5rem !important; }
                    .rounded-xl { border-radius: 0.75rem !important; }
                    .border { border-width: 1px !important; }
                    .border-slate-100 { border-color: rgb(241 245 249) !important; }
                    
                    .no-print { display: none !important; }
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                }
            `}</style>

            {/* --- PAGE 1: EXECUTIVE SUMMARY --- */}
            <ReportPage pageNum={1} footerTitle="DIAGNOSTIC EXECUTIVE SUMMARY">
                {brainBodyState && (
                    <BrainBodyDashboard brainBodyState={brainBodyState} careType={result.careType} />
                )}

                {(!isHrvAssessed || !isEegAssessed) && (
                    <div className="mb-6 bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between text-sm shadow-sm">
                        <div className="flex items-center gap-2 text-slate-700">
                            <span className="text-lg">📋</span>
                            <span><strong>본 보고서 검사 범위:</strong> 설문 기반 심리·행동 분석</span>
                            {!isHrvAssessed && <span className="line-through text-slate-400 mx-1">자율신경(HRV)</span>}
                            {!isEegAssessed && <span className="line-through text-slate-400 mx-1">뇌파(EEG)</span>}
                        </div>
                        <div className="text-xs text-blue-600 font-bold">기본 분석 모드</div>
                    </div>
                )}
                
                <div className="mb-10">
                    <h2 className="text-xl font-bold flex items-center mb-6 text-slate-800">
                        <span className="w-2 h-6 bg-blue-600 mr-3"></span>
                        1. 핵심 진단 및 일차 분류 (Primary Classification)
                    </h2>
                    <div className="grid grid-cols-3 gap-6">
                        {/* Primary */}
                        {primaryScoreData ? (
                            <div className="border border-red-100 bg-red-50/30 p-5 rounded-xl">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-sm font-bold text-red-700 truncate">{CARE_TYPE_LABELS[primaryScoreData.type]?.name || primaryScoreData.type}</span>
                                    <span className="text-2xl font-black text-red-600">{Math.round(primaryScoreData.score)}<span className="text-xs">/100</span></span>
                                </div>
                                <div className="metric-bar mb-3"><div className="h-full metric-fill-red" style={getWidth(primaryScoreData.score)}></div></div>
                                <p className="text-xs text-slate-600 leading-relaxed">{CARE_TYPE_LABELS[primaryScoreData.type]?.publicDescription || CARE_TYPE_LABELS[primaryScoreData.type]?.description}</p>
                            </div>
                        ) : (
                            <div className="border border-slate-100 bg-slate-50 p-5 rounded-xl flex items-center justify-center text-xs text-slate-400">데이터 미입력</div>
                        )}

                        {/* Secondary 1 */}
                        {secondary1Data ? (
                            <div className="border border-red-100 bg-red-50/30 p-5 rounded-xl">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-sm font-bold text-red-700 truncate">{CARE_TYPE_LABELS[secondary1Data.type]?.name || secondary1Data.type}</span>
                                    <span className="text-2xl font-black text-red-600">{Math.round(secondary1Data.score)}<span className="text-xs">/100</span></span>
                                </div>
                                <div className="metric-bar mb-3"><div className="h-full metric-fill-red" style={getWidth(secondary1Data.score)}></div></div>
                                <p className="text-xs text-slate-600 leading-relaxed">{CARE_TYPE_LABELS[secondary1Data.type]?.publicDescription || CARE_TYPE_LABELS[secondary1Data.type]?.description}</p>
                            </div>
                        ) : (
                            <div className="border border-slate-100 bg-slate-50 p-5 rounded-xl flex items-center justify-center text-xs text-slate-400">추가 위험 요인 없음</div>
                        )}

                        {/* Secondary 2 */}
                        {secondary2Data ? (
                            <div className="border border-green-100 bg-green-50/30 p-5 rounded-xl">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-sm font-bold text-green-700 truncate">{CARE_TYPE_LABELS[secondary2Data.type]?.name || secondary2Data.type}</span>
                                    <span className="text-2xl font-black text-green-600">{Math.round(secondary2Data.score)}<span className="text-xs">/100</span></span>
                                </div>
                                <div className="metric-bar mb-3"><div className="h-full metric-fill-green" style={getWidth(secondary2Data.score)}></div></div>
                                <p className="text-xs text-slate-600 leading-relaxed">{CARE_TYPE_LABELS[secondary2Data.type]?.publicDescription || CARE_TYPE_LABELS[secondary2Data.type]?.description}</p>
                            </div>
                        ) : (
                            <div className="border border-slate-100 bg-slate-50 p-5 rounded-xl flex items-center justify-center text-xs text-slate-400">추가 위험 요인 없음</div>
                        )}
                    </div>
                </div>

                {(!config || config.useBrainBody || config.usePortable) && (
                <div className="mb-8 flex-1">
                    <h2 className="text-xl font-bold flex items-center mb-6 text-slate-800">
                        <span className="w-2 h-6 bg-blue-600 mr-3"></span>
                        2. 생체-인지 지표 분석 (Bio-Cognitive Index)
                    </h2>
                    <div className="grid grid-cols-2 gap-8 h-[250px]">
                        {isHrvAssessed ? (
                            <div className="space-y-6 flex flex-col justify-center bg-white border border-slate-200 p-5 rounded-xl">
                                <h3 className="text-sm font-bold text-slate-700 mb-4 border-b pb-2">자율신경 및 활력 (ANS & Vitality)</h3>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span>자율신경 균형 (교감 {hrv.sns.toFixed(1)}% / 부교감 {hrv.pns.toFixed(1)}%)</span>
                                            <span className="font-bold text-blue-600 text-sm">양호</span>
                                        </div>
                                        <div className="metric-bar"><div className="h-full metric-fill-blue" style={getWidth(hrv.pns)}></div></div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span>활력 지수 (Vitality)</span>
                                            <span className="font-bold text-blue-600 text-sm">{vitality.toFixed(1)}%</span>
                                        </div>
                                        <div className="metric-bar"><div className="h-full metric-fill-blue" style={getWidth(vitality)}></div></div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span>피로 지수 (Fatigue)</span>
                                            <span className="font-bold text-orange-500 text-sm">{fatigue.toFixed(1)}%</span>
                                        </div>
                                        <div className="metric-bar"><div className="h-full bg-orange-400" style={getWidth(fatigue)}></div></div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl flex flex-col justify-center items-center text-center h-full">
                                <span className="text-3xl mb-3">🩺</span>
                                <h3 className="font-bold text-slate-700 mb-2">정밀 생체 측정 미진행</h3>
                                <p className="text-[11px] text-slate-500 leading-relaxed max-w-[80%]">HRV(자율신경) + EEG(뇌파) 정밀 검사를 추가하시면, 신체-두뇌 통합 분석을 통해 더욱 정확한 맞춤형 학습 전략을 제공받으실 수 있습니다.</p>
                            </div>
                        )}

                        <div className="bg-slate-900 text-white p-6 rounded-xl flex flex-col justify-center h-full">
                            <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">BMI 분석 결과</div>
                            <div className="text-4xl font-black mb-2">{bmi.toFixed(1)} <span className={`text-lg font-bold ${bmi > 23 ? 'text-red-400' : 'text-emerald-400'}`}>{bmiStatus}</span></div>
                            <p className="text-sm text-slate-300 leading-relaxed">
                                {bmi > 23 ? '현재 과체중 상태로 인한 뇌 혈류 순환 방해 가능성이 높습니다. 식사량 10% 감소 및 야식 제한 시 학습 효율이 25% 이상 향상될 것으로 예측됩니다.'
                                    : '정상 체중을 유지하고 있어 뇌 혈류 순환에 긍정적입니다. 규칙적인 유산소 운동으로 뇌 산소 공급을 최적화하십시오.'}
                            </p>
                        </div>
                    </div>
                </div>
                )}
            </ReportPage>

            {/* --- PAGE 2: BIO SIGNAL DETAIL --- */}
            {(!config || config.useBrainBody || config.usePortable) && isHrvAssessed && (
            <ReportPage pageNum={2} footerTitle="BIO-SIGNAL DETAIL" breakBefore={true}>
                <div className="mb-6">
                    <h2 className="text-xl font-bold flex items-center mb-6 text-slate-800">
                        <span className="w-2 h-6 bg-blue-600 mr-3"></span>
                        1. 생체 신호 정밀 분석 (Bio-Signal Detail)
                    </h2>

                    <div className="grid grid-cols-2 gap-6 mb-6">
                        <div>
                            <h3 className="text-sm font-bold text-slate-700 mb-4 border-l-4 border-slate-900 pl-3">자율신경계 균형 (ANS Balance)</h3>
                            <div className="bg-white border rounded-xl p-6">
                                <div className="flex justify-between mb-4">
                                    <span className="font-bold text-slate-600">교감신경 (긴장/Stress)</span>
                                    <span className="font-black text-red-500">{hrv.sns.toFixed(1)}</span>
                                </div>
                                <div className="metric-bar mb-6"><div className="h-full metric-fill-red" style={getWidth(hrv.sns)}></div></div>

                                <div className="flex justify-between mb-4">
                                    <span className="font-bold text-slate-600">부교감신경 (이완/Relax)</span>
                                    <span className="font-black text-blue-500">{hrv.pns.toFixed(1)}</span>
                                </div>
                                <div className="metric-bar mb-2"><div className="h-full metric-fill-blue" style={getWidth(hrv.pns)}></div></div>
                            </div>
                            <p className="mt-4 text-xs text-slate-500 leading-relaxed italic">
                                * 교감신경 항진 시 불안초조, 수면장애가 발생할 수 있으며 부교감신경 저하 시 소화불량 및 브레인포그 현상이 동반될 수 있습니다.
                            </p>
                        </div>

                        {/* NEW: ANS Balance Visualization */}
                        <div className="space-y-6">
                            <h3 className="text-sm font-bold text-slate-700 mb-4 border-l-4 border-blue-600 pl-3">균형 상태 시각화</h3>

                            {/* Balance Meter */}
                            <div className="bg-gradient-to-br from-slate-50 to-blue-50 border-2 border-blue-100 rounded-xl p-6">
                                <div className="text-center mb-6">
                                    <p className="text-xs font-bold text-slate-400 uppercase mb-2">ANS Balance Ratio</p>
                                    <div className="text-4xl font-black text-slate-800">
                                        {(hrv.pns / hrv.sns).toFixed(2)}
                                        <span className="text-sm text-slate-500 ml-2">
                                            {hrv.pns > hrv.sns ? '(이완 우세)' : hrv.pns < hrv.sns ? '(긴장 우세)' : '(균형)'}
                                        </span>
                                    </div>
                                </div>

                                {/* Visual Balance Bar */}
                                <div className="relative h-12 bg-slate-200 rounded-full overflow-hidden mb-4">
                                    <div className="absolute left-0 top-0 h-full bg-red-500 flex items-center justify-start px-4" style={{ width: `${hrv.sns}%` }}>
                                        <span className="text-white font-bold text-xs">교감 {hrv.sns.toFixed(0)}%</span>
                                    </div>
                                    <div className="absolute right-0 top-0 h-full bg-blue-500 flex items-center justify-end px-4" style={{ width: `${hrv.pns}%` }}>
                                        <span className="text-white font-bold text-xs">부교감 {hrv.pns.toFixed(0)}%</span>
                                    </div>
                                </div>

                                <div className="text-center">
                                    <p className="text-xs text-slate-600 leading-relaxed">
                                        {hrv.pns > 60 ? '✅ 이완 상태 우수 - 회복력이 높습니다' :
                                            hrv.sns > 60 ? '⚠️ 긴장 상태 - 이완 훈련이 필요합니다' :
                                                '✓ 균형 유지 중'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* NEW: Reference Guide Boxes */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3">
                            <h4 className="text-sm font-bold text-red-700 mb-3 flex items-center">
                                <span className="text-lg mr-2">⚡</span> 교감신경 과다 시
                            </h4>
                            <ul className="text-xs text-slate-700 space-y-2 leading-relaxed">
                                <li>• 심박수 증가</li>
                                <li>• 혈압 상승</li>
                                <li>• 수면 장애</li>
                                <li>• 소화 기능 저하</li>
                                <li>• 불안/초조감</li>
                            </ul>
                        </div>

                        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3">
                            <h4 className="text-sm font-bold text-blue-700 mb-3 flex items-center">
                                <span className="text-lg mr-2">🌊</span> 부교감신경 과다 시
                            </h4>
                            <ul className="text-xs text-slate-700 space-y-2 leading-relaxed">
                                <li>• 심박수 감소</li>
                                <li>• 혈압 저하</li>
                                <li>• 피로감 증가</li>
                                <li>• 집중력 저하</li>
                                <li>• 무기력증</li>
                            </ul>
                        </div>

                        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-3">
                            <h4 className="text-sm font-bold text-emerald-700 mb-3 flex items-center">
                                <span className="text-lg mr-2">✅</span> 이상적인 균형
                            </h4>
                            <ul className="text-xs text-slate-700 space-y-2 leading-relaxed">
                                <li>• 비율: 1.0 ~ 1.5</li>
                                <li>• 안정적 심박</li>
                                <li>• 양호한 회복력</li>
                                <li>• 최적의 학습 상태</li>
                                <li>• 스트레스 적응력 우수</li>
                            </ul>
                        </div>
                    </div>

                    {/* NEW: Quick Action Guide */}
                    <div className="bg-slate-900 text-white p-5 rounded-xl">
                        <h3 className="text-base font-black text-blue-300 mb-3 flex items-center">
                            <span className="text-2xl mr-3">💡</span> 자율신경 균형 개선 즉시 실천법
                        </h3>
                        <div className="grid grid-cols-2 gap-8 text-sm">
                            <div>
                                <p className="font-bold text-blue-400 mb-3 border-b border-slate-700 pb-2">교감신경 과다 시 (긴장 완화)</p>
                                <ul className="space-y-2 text-xs leading-relaxed opacity-90">
                                    <li>• <strong>호흡법:</strong> 4초 들이마시고 7초 참고 8초 내쉬기 (4-7-8)</li>
                                    <li>• <strong>온열 요법:</strong> 따뜻한 물로 샤워, 목욕</li>
                                    <li>• <strong>이완 활동:</strong> 요가, 명상, 가벼운 스트레칭</li>
                                    <li>• <strong>카페인 제한:</strong> 오후 2시 이후 커피/에너지 드링크 금지</li>
                                </ul>
                            </div>
                            <div>
                                <p className="font-bold text-red-400 mb-3 border-b border-slate-700 pb-2">부교감신경 과다 시 (각성 촉진)</p>
                                <ul className="space-y-2 text-xs leading-relaxed opacity-90">
                                    <li>• <strong>찬물 세수:</strong> 아침 기상 직후 찬물로 얼굴 세척</li>
                                    <li>• <strong>운동:</strong> 가벼운 조깅, 계단 오르기 등 유산소 운동</li>
                                    <li>• <strong>환기:</strong> 신선한 공기 쐬기, 창문 열어 환기</li>
                                    <li>• <strong>자극 증가:</strong> 밝은 조명, 경쾌한 음악으로 각성도 높이기</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </ReportPage>
            )}

            {/* ---PAGE 3: BRAIN ACTIVITY DETAIL --- */}
            {(!config || config.useBrainBody) && isEegAssessed && (
            <ReportPage pageNum={3} footerTitle="BRAIN ACTIVITY DETAIL" breakBefore={true}>
                <div className="mb-6">
                    <h2 className="text-xl font-bold flex items-center mb-6 text-slate-800">
                        <span className="w-2 h-6 bg-blue-600 mr-3"></span>
                        2. 세부 두뇌 활성도 및 통찰 (Brain Activity Detail)
                    </h2>

                    <div className="grid grid-cols-2 gap-6 mb-6">
                        <div>
                            <h3 className="text-sm font-bold text-slate-700 mb-4 border-l-4 border-slate-900 pl-3">두뇌 활성도 (Brain Activity)</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 rounded-xl text-center">
                                    <p className="text-xs font-bold text-slate-400 uppercase">Alpha</p>
                                    <p className="text-2xl font-black text-slate-700">{hrv.eegAlpha.toFixed(1)}</p>
                                    <p className="text-[10px] text-slate-400">안정/휴식</p>
                                </div>
                                <div className="p-4 bg-blue-50 rounded-xl text-center border border-blue-100">
                                    <p className="text-xs font-bold text-blue-400 uppercase">Mid-Beta</p>
                                    <p className="text-2xl font-black text-blue-600">{hrv.eegMBeta.toFixed(1)}</p>
                                    <p className="text-[10px] text-blue-400">몰입/집중</p>
                                </div>
                                <div className="p-4 bg-orange-50 rounded-xl text-center border border-orange-100">
                                    <p className="text-xs font-bold text-orange-400 uppercase">High-Beta</p>
                                    <p className="text-2xl font-black text-orange-600">{hrv.eegHBeta.toFixed(1)}</p>
                                    <p className="text-[10px] text-orange-400">긴장/스트레스</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl text-center">
                                    <p className="text-xs font-bold text-slate-400 uppercase">Theta</p>
                                    <p className="text-2xl font-black text-slate-700">{hrv.eegTheta.toFixed(1)}</p>
                                    <p className="text-[10px] text-slate-400">졸음/멍함</p>
                                </div>
                            </div>
                        </div>

                        {/* NEW: EEG Distribution Chart */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-700 mb-4 border-l-4 border-blue-600 pl-3">뇌파 분포 비교</h3>

                            {/* Bar Chart Visualization */}
                            <div className="bg-gradient-to-br from-slate-50 to-indigo-50 border-2 border-indigo-100 rounded-xl p-5">
                                <div className="space-y-3">
                                    {/* Alpha Bar */}
                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-xs font-bold text-slate-600">Alpha (안정)</span>
                                            <span className="text-xs font-black text-slate-700">{hrv.eegAlpha.toFixed(1)}</span>
                                        </div>
                                        <div className="h-4 bg-slate-200 rounded-full overflow-hidden">
                                            <div className="h-full bg-slate-500" style={{ width: `${(hrv.eegAlpha / 30) * 100}%` }}></div>
                                        </div>
                                    </div>

                                    {/* Mid-Beta Bar */}
                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-xs font-bold text-blue-600">Mid-Beta (집중)</span>
                                            <span className="text-xs font-black text-blue-700">{hrv.eegMBeta.toFixed(1)}</span>
                                        </div>
                                        <div className="h-4 bg-blue-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500" style={{ width: `${(hrv.eegMBeta / 30) * 100}%` }}></div>
                                        </div>
                                    </div>

                                    {/* High-Beta Bar */}
                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-xs font-bold text-orange-600">High-Beta (긴장)</span>
                                            <span className="text-xs font-black text-orange-700">{hrv.eegHBeta.toFixed(1)}</span>
                                        </div>
                                        <div className="h-4 bg-orange-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-orange-500" style={{ width: `${(hrv.eegHBeta / 30) * 100}%` }}></div>
                                        </div>
                                    </div>

                                    {/* Theta Bar */}
                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-xs font-bold text-slate-600">Theta (졸음)</span>
                                            <span className="text-xs font-black text-slate-700">{hrv.eegTheta.toFixed(1)}</span>
                                        </div>
                                        <div className="h-4 bg-slate-200 rounded-full overflow-hidden">
                                            <div className="h-full bg-slate-400" style={{ width: `${(hrv.eegTheta / 30) * 100}%` }}></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-indigo-200">
                                    <p className="text-xs text-slate-600 leading-relaxed text-center font-bold">
                                        {hrv.eegMBeta >= 15 && hrv.eegMBeta <= 18 ? '✅ 집중력 최적 - 학습에 가장 적합한 상태' :
                                            hrv.eegMBeta > 18 ? '⚠️ 과도한 긴장/각성 - 적절한 휴식 배분 필요' :
                                                hrv.eegTheta > 22 ? '⚠️ 각성도 매우 낮음 - 찬물 세수 등 뇌 깨우기 필수' :
                                                    hrv.eegHBeta > 20 ? '⚠️ 스트레스 지수 높음 - 즉각적인 이완 훈련 권장' :
                                                        '✓ 전반적으로 안정적인 두뇌 상태'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* NEW: Learning Mode Matching Table */}
                    <div className="mb-4">
                        <h3 className="text-sm font-bold text-slate-700 mb-4 border-l-4 border-emerald-600 pl-3">학습 모드별 최적 뇌파 상태 (새로운 기준 적용)</h3>
                        <div className="overflow-hidden border-2 border-slate-900 rounded-xl">
                            <table className="w-full text-xs">
                                <thead className="bg-slate-900 text-white">
                                    <tr>
                                        <th className="px-4 py-3 text-left border-r border-slate-700">학습 모드</th>
                                        <th className="px-4 py-3 text-left border-r border-slate-700">최적 뇌파 (정상 범위)</th>
                                        <th className="px-4 py-3 text-left border-r border-slate-700">권장 활동</th>
                                        <th className="px-4 py-3 text-left">현재 상태 분석</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y text-slate-700">
                                    <tr className="bg-blue-50/50">
                                        <td className="px-4 py-3 font-bold text-blue-700">깊은 집중 (Deep Work)</td>
                                        <td className="px-4 py-3">Mid-Beta (15-18%)</td>
                                        <td className="px-4 py-3">수학 문제풀이, 논리 추론</td>
                                        <td className="px-4 py-3 font-black">{hrv.eegMBeta >= 15 && hrv.eegMBeta <= 18 ? '✅ 최적' : hrv.eegMBeta > 18 ? '⚠️ 과긴장' : '△ 집중력 부족'}</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-3 font-bold text-slate-700">창의적 사고</td>
                                        <td className="px-4 py-3">Alpha (20-25%)</td>
                                        <td className="px-4 py-3">브레인스토밍, 글쓰기</td>
                                        <td className="px-4 py-3 font-black">{hrv.eegAlpha >= 20 && hrv.eegAlpha <= 25 ? '✅ 최적' : hrv.eegAlpha > 25 ? '⚠️ 과이완' : '△ 안정감 부족'}</td>
                                    </tr>
                                    <tr className="bg-slate-50">
                                        <td className="px-4 py-3 font-bold text-orange-700">시험 모드</td>
                                        <td className="px-4 py-3">M-Beta 정상, Theta &lt; 18%</td>
                                        <td className="px-4 py-3">모의고사, 빠른 판단</td>
                                        <td className="px-4 py-3 font-black">{hrv.eegTheta < 18 && hrv.eegMBeta >= 15 ? '✅ 적합' : '△ 뇌 각성 요망'}</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-3 font-bold text-emerald-700">암기/복습</td>
                                        <td className="px-4 py-3">Alpha 정상, H-Beta &lt; 15%</td>
                                        <td className="px-4 py-3">단어 암기, 개념 복습</td>
                                        <td className="px-4 py-3 font-black">{hrv.eegAlpha >= 20 && hrv.eegHBeta < 15 ? '✅ 적합' : '△ 이완/집중 요망'}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Enhanced Analyst Insight */}
                    <div className="bg-slate-900 text-white p-5 rounded-xl">
                        <h3 className="text-base font-black text-blue-300 mb-3 flex items-center">
                            <span className="text-2xl mr-3">🧠</span> 뇌파 분석 전문가 인사이트
                        </h3>
                        <div className="grid grid-cols-2 gap-8 text-sm">
                            <div>
                                <p className="font-bold text-slate-400 text-xs uppercase mb-3 tracking-widest">Current State Analysis</p>
                                <p className="leading-relaxed font-medium opacity-90 text-xs">
                                    {classificationResult?.primaryScore > 60
                                        ? "높은 생체 활성도가 관찰되나, 긴장도(High-Beta)가 함께 상승해 있어 에너지 소모가 큽니다. 학습 지속력을 위해 중간 휴식 전략이 필수적입니다."
                                        : "전반적으로 차분한 상태이나, 각성 수준이 다소 낮아(Theta 우세) 아웃풋 중심의 능동적 학습(말하기, 쓰기)으로 뇌를 깨우는 과정이 필요합니다."}
                                </p>
                            </div>
                            <div>
                                <p className="font-bold text-blue-400 text-xs uppercase mb-3 tracking-widest border-b border-slate-700 pb-2">Optimization Strategy</p>
                                <ul className="space-y-2 text-xs leading-relaxed opacity-90">
                                    <li>• <strong>최우선:</strong> {hrv.eegMBeta > 15 ? '현재 집중력 우수 - 고난도 학습 진행' : hrv.eegTheta > 10 ? '각성도 향상 - 찬물 세수, 가벼운 운동' : '긴장 완화 - 심호흡, 스트레칭'}</li>
                                    <li>• <strong>학습 시간:</strong> Mid-Beta가 높은 {hrv.eegMBeta > 15 ? '현재' : '오전 9-12시'} 시간대 활용</li>
                                    <li>• <strong>휴식 타이밍:</strong> {hrv.eegHBeta > 15 ? '긴장도 높음 - 즉시 5분 휴식' : '25분 학습 후 5분 휴식'}</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </ReportPage>
            )}

            {/* --- PAGE 4: PHYSICAL-LEARNING ANALYSIS --- */}
            <ReportPage pageNum={4} footerTitle="PHYSICAL-LEARNING ANALYSIS" breakBefore={true}>
                <div className="mb-6">
                    <h2 className="text-xl font-bold flex items-center mb-6 text-slate-800">
                        <span className="w-2 h-6 bg-blue-600 mr-3"></span>
                        1. 맞춤형 신체-학습 연결 리포트 (Physical-Learning Analysis)
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                        <div className="bg-slate-900 text-white p-5 rounded-xl flex flex-col justify-center relative overflow-hidden">
                            <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">BMI 분석 결과</div>
                            <div className="text-4xl font-black mb-4">{bmi.toFixed(1)} <span className={`text-lg font-bold ${bmi > 23 ? 'text-red-400' : 'text-emerald-400'}`}>{bmi > 23 ? 'Condition Management Required' : 'Optimal Physical Condition'}</span></div>
                            <p className="text-sm text-slate-300 leading-relaxed mb-4">
                                {bmi > 23 ? '몸을 가볍게, 머리는 맑게 유지하기 위한 컨디션 관리가 시급한 단계입니다.' : '뇌 활성화를 위한 최적의 신체 조건을 유지하고 있습니다.'}
                            </p>

                            {/* NEW: BMI Range Visualization */}
                            <div className="bg-slate-800 rounded-lg p-4 relative">
                                <div className="text-[10px] text-slate-400 mb-2">BMI 범위 (현재 위치)</div>
                                <div className="relative h-6 bg-slate-700 rounded-full overflow-hidden">
                                    <div className="absolute left-0 h-full bg-emerald-500 w-1/3"></div>
                                    <div className="absolute left-1/3 h-full bg-yellow-500 w-1/3"></div>
                                    <div className="absolute left-2/3 h-full bg-red-500 w-1/3"></div>
                                    <div className="absolute h-full flex items-center" style={{ left: `${Math.min(95, (bmi / 35) * 100)}%` }}>
                                        <div className="w-1 h-8 bg-white shadow-lg relative">
                                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-white font-bold text-xs whitespace-nowrap">
                                                {bmi.toFixed(1)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-between text-[9px] text-slate-400 mt-1">
                                    <span>18.5</span>
                                    <span>23</span>
                                    <span>25</span>
                                    <span>30</span>
                                </div>
                                <div className="flex justify-between text-[8px] text-slate-300 mt-1">
                                    <span>저체중</span>
                                    <span>정상</span>
                                    <span>과체중</span>
                                    <span>비만</span>
                                </div>
                            </div>

                            <div className="absolute right-[-20px] bottom-[-20px] opacity-10">
                                <svg width="120" height="120" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" /></svg>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <div className="p-5 bg-white border-2 border-slate-200 rounded-xl shadow-sm">
                                <h3 className="text-sm font-bold text-blue-700 mb-3 underline underline-offset-4 flex items-center">
                                    <span className="text-lg mr-2">🍽️</span> 식곤증 관리
                                </h3>
                                <p className="text-xs text-slate-600 leading-relaxed italic">
                                    "배부름은 집중력의 적입니다. 식사는 80%만 채우고 탄수화물을 줄여야 맑은 정신으로 오후 공부가 가능합니다. 야식을 끊고 식사량을 10%만 줄여도 효율이 비약적으로 상승합니다."
                                </p>
                            </div>
                            <div className="p-5 bg-white border-2 border-slate-200 rounded-xl shadow-sm">
                                <h3 className="text-sm font-bold text-blue-700 mb-3 underline underline-offset-4 flex items-center">
                                    <span className="text-lg mr-2">💨</span> 산소 공급과 뇌 깨우기
                                </h3>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    뇌가 몽롱할 때는 환기가 답입니다. 찬 바람을 쐬거나 찬물 세수를 하여 뇌 온도를 낮추면 즉각적인 각성 효과를 얻을 수 있습니다.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                        <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                            <h3 className="font-bold text-blue-900 mb-3 flex items-center text-sm">
                                <span className="mr-2 text-xl">🧠</span> 염증과 기억력
                            </h3>
                            <p className="text-xs text-blue-800 leading-relaxed">
                                {bmi > 23 ? ' 과체중은 뇌 혈류 순환을 방해합니다. 하루 30분 유산소 운동은 뇌 유래 신경영양인자(BDNF)를 생성해 기억력을 근본적으로 높여줍니다.' : '규칙적인 운동은 해마를 자극하여 장기 기억 형성 효율을 높여줍니다.'}
                            </p>
                        </div>
                        <div className="p-4 bg-indigo-50 border-2 border-indigo-200 rounded-xl">
                            <h3 className="font-bold text-indigo-900 mb-3 flex items-center text-sm">
                                <span className="mr-2 text-xl">🌙</span> 수면의 질 관리
                            </h3>
                            <p className="text-xs text-indigo-800 leading-relaxed">
                                낮 동안의 충분한 햇빛 쬐기는 밤에 멜라토닌 분비를 도와 숙면을 유도하고, 결과적으로 다음 날의 집중 유지력을 결정합니다.
                            </p>
                        </div>
                    </div>

                    {/* NEW: Weekly Health Checklist */}
                    <div className="bg-gradient-to-br from-emerald-50 to-blue-50 border-2 border-emerald-200 rounded-xl p-3 mb-2">
                        <h3 className="text-sm font-bold text-emerald-800 mb-2 flex items-center">
                            <span className="text-lg mr-2">✅</span> 일일 건강 체크리스트 (Daily Brain Health Checklist)
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-white rounded-lg p-2">
                                <p className="text-xs font-bold text-slate-700 mb-1 border-b pb-1">신체 활동</p>
                                <ul className="space-y-0.5 text-xs text-slate-600">
                                    <li>□ 아침 10분 스트레칭</li>
                                    <li>□ 30분 유산소 운동</li>
                                    <li>□ 계단 이용하기</li>
                                </ul>
                            </div>
                            <div className="bg-white rounded-lg p-2">
                                <p className="text-xs font-bold text-slate-700 mb-1 border-b pb-1">식습관</p>
                                <ul className="space-y-0.5 text-xs text-slate-600">
                                    <li>□ 물 2L 이상 섭취</li>
                                    <li>□ 식사 80% 채우기</li>
                                    <li>□ 오후 2시 이후 카페인 제한</li>
                                </ul>
                            </div>
                            <div className="bg-white rounded-lg p-2">
                                <p className="text-xs font-bold text-slate-700 mb-1 border-b pb-1">수면/휴식</p>
                                <ul className="space-y-0.5 text-xs text-slate-600">
                                    <li>□ 밤 11시 전 취침</li>
                                    <li>□ 7-8시간 수면</li>
                                    <li>□ 스마트폰 1시간 전 차단</li>
                                </ul>
                            </div>
                            <div className="bg-white rounded-lg p-2">
                                <p className="text-xs font-bold text-slate-700 mb-1 border-b pb-1">뇌 관리</p>
                                <ul className="space-y-0.5 text-xs text-slate-600">
                                    <li>□ 창문 열어 환기</li>
                                    <li>□ 햇빛 20분 이상</li>
                                    <li>□ 25:5 뽀모도로 실천</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </ReportPage>

            {/* --- PAGE 3B: NEURO-NUTRITION & EXERCISE --- */}
            <ReportPage pageNum={5} footerTitle="NEURO-NUTRITION & EXERCISE" breakBefore={true}>
                <div className="mb-10">
                    <h2 className="text-xl font-bold flex items-center mb-6 text-slate-800">
                        <span className="w-2 h-6 bg-emerald-600 mr-3"></span>
                        2. 전두엽 각성을 위한 '도파민 부스팅' 식단
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                            <h4 className="text-xs font-bold text-emerald-700 mb-1">티로신 (Tyrosine)</h4>
                            <p className="text-[11px] text-slate-600 leading-snug">도파민의 핵심 원료. 아침 식사 필수 권장.<br /><strong>추천: 계란, 아보카도, 소고기, 콩</strong></p>
                        </div>
                        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                            <h4 className="text-xs font-bold text-emerald-700 mb-1">페닐알라닌</h4>
                            <p className="text-[11px] text-slate-600 leading-snug">티로신 전환 및 도파민 생성 조력.<br /><strong>추천: 돼지고기, 오리고기, 견과류</strong></p>
                        </div>
                        <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                            <h4 className="text-xs font-bold text-amber-700 mb-1">단순당의 전략적 사용</h4>
                            <p className="text-[11px] text-slate-600 leading-snug">공부 시작 직전, 포도당 캔디 1알은 뇌 연료 시동에 도움을 줌. (과다 섭취 금물)</p>
                        </div>
                        <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                            <h4 className="text-xs font-bold text-blue-700 mb-1">철분 (Iron)</h4>
                            <p className="text-[11px] text-slate-600 leading-snug">체내 산소 운반 및 도파민 생성 관여. 부족 시 주의력 결핍 증상 심화.</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-4">
                    <div className="border-t-4 border-indigo-600 pt-4">
                        <h3 className="text-lg font-black text-slate-800 mb-4 tracking-tight uppercase">Neuro-Exercise Rx</h3>
                        <div className="space-y-4">
                            <div className="bg-indigo-50 p-4 rounded-xl">
                                <h4 className="text-sm font-bold text-indigo-900 mb-1">기술 운동 (주 2회 이상)</h4>
                                <p className="text-xs text-indigo-800 leading-relaxed italic">
                                    농구, 테니스, 배드민턴, 댄스 등 매 순간 판단이 필요한 운동은 '작업 기억(Working Memory)'과 '실행 기능'을 향상시킵니다.
                                </p>
                            </div>
                            <div className="bg-slate-100 p-4 rounded-xl">
                                <h4 className="text-sm font-bold text-slate-800 mb-1">서서 공부하기 / 걷기</h4>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    오래 앉기 힘들다면 서서 암기하십시오. 학습 효율이 앉아있을 때보다 최대 25%까지 향상된다는 연구 결과가 있습니다.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="border-t-4 border-blue-600 pt-4">
                        <h3 className="text-lg font-black text-slate-800 mb-4 tracking-tight uppercase">Learning Efficiency Strategy</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start">
                                <div className="w-5 h-5 rounded bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">01</div>
                                <div className="text-sm text-slate-700"><strong>뽀모도로 25:5 변형:</strong> 5분 휴식 시 제자리 뛰기 등 짧고 강한 신체활동으로 뇌 환기</div>
                            </li>
                            <li className="flex items-start">
                                <div className="w-5 h-5 rounded bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">02</div>
                                <div className="text-sm text-slate-700"><strong>시각적 자극 다변화:</strong> 다양한 색상의 펜/형광펜 사용으로 지루함 방지 및 주의력 유지</div>
                            </li>
                            <li className="flex items-start">
                                <div className="w-5 h-5 rounded bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">03</div>
                                <div className="text-sm text-slate-700"><strong>선생님 설명법:</strong> 소리 내어 설명하며 뇌의 다영역 동시 활성화 및 잡념 차단</div>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="bg-slate-100 p-8 rounded-2xl relative overflow-hidden mt-6">
                    <div className="absolute right-10 top-1/2 -translate-y-1/2 opacity-10 select-none">
                        <svg width="150" height="150" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" />
                            <text x="50" y="55" textAnchor="middle" fontWeight="bold" fontSize="12">NEURO-EDULAB</text>
                        </svg>
                    </div>

                    <h2 className="text-xl font-black text-slate-800 mb-4">분석 전문가 종합 소견</h2>
                    <div className="text-sm text-slate-700 leading-relaxed space-y-4 relative z-10">
                        <p>본 피검자는 <strong>BMI {bmi.toFixed(1)}</strong> 수준으로, {bmi > 23 ? '신체적 대사 저하가 학습 효율에 직접적인 영향을 미치고 있는 상태입니다. 과체중으로 인한 혈류 저하는 주의력 결핍 증상을 강화시키는 핵심 요인입니다.' : '양호한 신체 조건을 보이고 있습니다. 이를 바탕으로 고강도의 학습 스케줄을 소화할 기초 체력이 마련되어 있습니다.'}</p>
                        <p>따라서 단순한 정신력 강조보다는 <strong>'도파민 부스팅' 식단</strong>과 <strong>'기술 운동'</strong>을 통한 전두엽 물리적 자극이 선행되어야 합니다. 특히 학습 시 뽀모도로 기법과 기립 학습법을 병행하여 뇌의 각성 수준을 강제적으로 유지하는 전략을 강력히 권고합니다.</p>
                    </div>

                    <div className="mt-8 flex justify-end items-center space-x-6 relative z-10">
                        <div className="text-right">
                            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Chief Neuro-Analyst</p>
                            <div className="flex flex-col items-center">
                                {result.analystConfig?.signatureImage ? (
                                    <img
                                        src={getSignatureImage(result.analystConfig)}
                                        alt="Signature"
                                        className="h-16 object-contain mb-2"
                                    />
                                ) : (
                                    <div className="h-16 mb-2" />
                                )}
                                <p className="text-xl font-bold font-serif text-slate-800 italic">{examinerDisplay}</p>
                            </div>
                        </div>
                        <div className="w-16 h-16 border-4 border-red-600/30 rounded-full flex items-center justify-center text-red-600/40 font-black transform rotate-12 text-xs text-center leading-none">
                            OFFICIAL<br />CERTIFIED
                        </div>
                    </div>
                </div>
            </ReportPage>

            {/* --- PAGE 4: MBTI & SUBJECT STRATEGY --- */}
            <ReportPage pageNum={6} footerTitle="MBTI & SUBJECT STRATEGY" breakBefore={true}>
                <div className="mb-10">
                    <h2 className="text-xl font-bold flex items-center mb-6 text-slate-800">
                        <span className="w-2 h-6 bg-blue-600 mr-3"></span>
                        1. 성향 기반 학습 전략 (MBTI & Subject)
                    </h2>

                    <div className="mb-8 bg-slate-50 p-6 rounded-xl border border-slate-200">
                        <div className="flex items-center mb-6">
                            <div className="w-16 h-16 bg-blue-900 text-white rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg">
                                {student.mbti ? student.mbti.substring(0, 2).toUpperCase() : 'ST'}
                            </div>
                            <div className="ml-6">
                                <h3 className="text-xl font-black text-slate-800">Learning Style: 멀티 채널 자극형</h3>
                                <p className="text-sm text-slate-500 italic">지루함을 못 견디는 뇌를 위한 최적화 솔루션</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-8 text-sm leading-relaxed">
                            <div>
                                <strong className="text-blue-700 block mb-2 underline underline-offset-4">실천 방법</strong>
                                <p className="text-slate-600 italic">입으로 소리 내고, 손으로 쓰고, 귀로 듣는 등 오감을 동원하세요. 알록달록한 형광펜을 사용하고 타이머로 타임 어택을 하세요. 장소를 1시간마다 옮기는 것도 효과적입니다.</p>
                            </div>
                            <div>
                                <strong className="text-blue-700 block mb-2 underline underline-offset-4">기대 효율</strong>
                                <p className="text-slate-600 italic">끊임없이 새로운 자극을 주면 뇌의 도파민 회로가 켜져, 지루함 없이 장시간 공부를 지속할 수 있는 동력이 생깁니다.</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-6 mb-8">
                        <div className="border border-blue-100 bg-white p-5 rounded-xl">
                            <h4 className="font-black text-blue-700 border-b pb-2 mb-3">수학 공략 📐</h4>
                            <p className="text-[11px] text-slate-600 leading-relaxed mb-4">칠판에 강의하듯 설명하며 푸세요. 누군가에게 설명한다는 생각은 주의를 환기시킵니다. <strong>'한 문제당 3분 컷'</strong> 게임 모드를 적용하세요.</p>
                        </div>
                        <div className="border border-red-100 bg-white p-5 rounded-xl">
                            <h4 className="font-black text-red-700 border-b pb-2 mb-3">국어 공략 📖</h4>
                            <p className="text-[11px] text-slate-600 leading-relaxed mb-4">긴 지문 읽다 딴생각이 들면 <strong>'문단마다 제목 붙이기'</strong> 미션을 수행하세요. 낙서하듯 메모하며 읽는 적극적인 독해가 필요합니다.</p>
                        </div>
                        <div className="border border-emerald-100 bg-white p-5 rounded-xl">
                            <h4 className="font-black text-emerald-700 border-b pb-2 mb-3">영어 공략 🌐</h4>
                            <p className="text-[11px] text-slate-600 leading-relaxed mb-4">지루한 문법 강의보다는 예문 만들기나 작문 같은 능동적 활동을 늘리세요. 단어 카드를 섞어가며 게임하듯 암기하십시오.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div className="bg-blue-900 text-white p-6 rounded-xl">
                            <h4 className="font-bold text-blue-300 mb-2 underline">집중력 유지 및 멘탈 케어</h4>
                            <p className="text-xs leading-relaxed opacity-90">
                                책상 위에 <strong>'딴짓 노트'</strong>를 두세요. 생각난 잡념은 적어두고 나중에 처리하십시오. 이 방법만으로도 하루 2시간 이상의 순공 시간을 확보할 수 있습니다. <br /><br />
                                자신을 '호기심이 많은 천재형 뇌'라고 생각하십시오. 산만함은 창의성의 다른 이름입니다. 넘치는 에너지를 운동으로 발산하십시오.
                            </p>
                        </div>
                        <div className="bg-slate-100 p-6 rounded-xl border-2 border-dashed border-slate-300 flex flex-col justify-center text-center">
                            <p className="text-[11px] font-bold text-slate-400 uppercase mb-2">Cognitive Advantage</p>
                            <p className="text-sm font-black text-slate-800 leading-relaxed italic">
                                "다양한 분야를 연결하는 융합적 사고력이 뛰어납니다. 한 번 꽂히면 무서운 몰입력을 보여주는 잠재력이 있습니다."
                            </p>
                        </div>
                    </div>
                </div>
            </ReportPage>

            {/* --- PAGE 5: GOLDEN TIME & EXAM STRATEGY --- */}
            <ReportPage pageNum={7} footerTitle="BRAIN PEAK TIME" breakBefore={true}>
                <div className="mb-10">
                    <h2 className="text-xl font-bold flex items-center mb-6 text-slate-800">
                        <span className="w-2 h-6 bg-blue-600 mr-3"></span>
                        1. 최적 두뇌 가동 골든타임표 (Brain Peak Time)
                    </h2>

                    <div className="flex flex-col md:flex-row gap-8 mb-10 items-center">
                        <div className="flex-1 w-full flex justify-center print:hidden">
                            <CircularSchedule 
                                isDark={false}
                                periods={[
                                    { id: 'morning', start: 7, end: 9, label: '오전 루틴', color: '#1e40af', icon: '🌞' },
                                    { id: 'golden', start: parseInt(goldenStart.split(':')[0]), end: parseInt(goldenEnd.split(':')[0]), label: 'Golden Hour', color: '#2563eb', icon: '🔥' },
                                    { id: 'slump', start: 13, end: 14, label: '회복/슬럼프', color: '#94a3b8', icon: '💤' },
                                    { id: 'second', start: 16, end: 22, label: 'Second Wind', color: '#4f46e5', icon: '🚀' },
                                    { id: 'sleep', start: 23, end: 24, label: '수면', color: '#334155', icon: '🌙' },
                                    { id: 'sleep2', start: 0, end: 7, label: '수면', color: '#334155' }
                                ]}
                            />
                        </div>

                        <div className="space-y-4 flex-1 w-full">
                        {/* Rows */}
                        <div className="flex items-center bg-slate-50 border rounded-xl overflow-hidden">
                            <div className="bg-blue-800 text-white px-6 py-4 w-32 text-center flex-shrink-0">
                                <div className="text-[10px] font-bold opacity-60">오전 루틴</div>
                                <div className="text-lg font-black tracking-tighter">07:00-09:00</div>
                            </div>
                            <div className="p-4 flex-1 text-xs text-slate-700">
                                <strong className="text-blue-800 block mb-1">Morning Activation</strong>
                                기상 직후 미지근한 물 한 잔 + 가벼운 스트레칭. 국어 지문 읽기나 영어 듣기로 감각 예열.
                            </div>
                        </div>
                        <div className="flex items-center bg-blue-900 text-white border rounded-xl overflow-hidden shadow-xl">
                            <div className="bg-blue-600 px-6 py-4 w-32 text-center flex-shrink-0">
                                <div className="text-[10px] font-bold opacity-60 italic">Golden Hour</div>
                                <div className="text-lg font-black tracking-tighter">{goldenStart}-{goldenEnd}</div>
                            </div>
                            <div className="p-4 flex-1 text-xs">
                                <strong className="text-blue-300 block mb-1">오늘의 승부처 (Deep Work)</strong>
                                집중력(M-Beta)과 인지 능력(Gamma) 최고조. <strong>수학 킬러 문항 / 복합 추론</strong> 배치 권장. 휴대폰 완전 격리.
                            </div>
                        </div>
                        <div className="flex items-center bg-slate-100 border rounded-xl overflow-hidden opacity-60">
                            <div className="bg-slate-400 text-white px-6 py-4 w-32 text-center flex-shrink-0">
                                <div className="text-[10px] font-bold opacity-60">회복/슬럼프</div>
                                <div className="text-lg font-black tracking-tighter">13:00-14:00</div>
                            </div>
                            <div className="p-4 flex-1 text-xs text-slate-600">
                                <strong className="text-slate-800 block mb-1">브레인 포그 (Brain Fog)</strong>
                                부교감신경 항진으로 졸음 유발. <strong>15분 파워 낮잠</strong> 필수. 인강 시청이나 단순 오답 정리 권장.
                            </div>
                        </div>
                        <div className="flex items-center bg-indigo-50 border border-indigo-100 rounded-xl overflow-hidden">
                            <div className="bg-indigo-600 text-white px-6 py-4 w-32 text-center flex-shrink-0">
                                <div className="text-[10px] font-bold opacity-60 italic">Second Wind</div>
                                <div className="text-lg font-black tracking-tighter">16:00-22:00</div>
                            </div>
                            <div className="p-4 flex-1 text-xs text-indigo-900">
                                <strong className="text-indigo-700 block mb-1">Logical Thinking & Consolidation</strong>
                                체온 상승과 함께 각성도 회복. 영어 독해 및 취약 과목 보충. 20시 이후 해마 활성화(복습 위주).
                            </div>
                        </div>
                    </div>
                </div>

                    <div className="bg-slate-900 text-white p-8 rounded-xl border-t-8 border-red-600">
                        <h3 className="text-2xl font-black mb-6 flex justify-between items-center">
                            🎯 수험생 실전 전략 (Exam Strategy)
                            <span className="text-[10px] font-mono border border-slate-700 px-3 py-1 uppercase">Case {student.id.substring(0, 4)} Only</span>
                        </h3>
                        <div className="grid grid-cols-2 gap-8 text-sm leading-relaxed">
                            <div className="space-y-4">
                                <div>
                                    <p className="text-red-400 font-bold mb-1 underline">기상 및 조식</p>
                                    <p className="text-xs opacity-80 italic">9시 시험 기준 6시 기상. 7시 30분까지 단백질 위주 식사(단순당 금지). 아침 운동 10분 필수.</p>
                                </div>
                                <div>
                                    <p className="text-red-400 font-bold mb-1 underline">각성도 높이기</p>
                                    <p className="text-xs opacity-80 italic">시원한 물 세수. 시험장에서 <strong>손바닥을 강하게 문질러</strong> 신경 자극 유도.</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-blue-400 font-bold mb-1 underline">마인드 컨트롤</p>
                                    <p className="text-xs opacity-80 italic">"다른 생각이 들면 일단 적고 나중에 보자"라고 자기 암시. 주의 분산을 자책하지 마십시오.</p>
                                </div>
                                <div>
                                    <p className="text-blue-400 font-bold mb-1 underline">시험 직전 복습</p>
                                    <p className="text-xs opacity-80 italic">지루함을 방지하기 위해 <strong>핵심 키워드만 빠르게</strong> 훑어 전두엽을 가열하십시오.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </ReportPage>

            {/* --- PAGE 6: GAUGE BASED LEARNING --- */}
            {(!config || config.useBrainBody || config.usePortable) && (
            <ReportPage pageNum={8} footerTitle="GAUGE-BASED LEARNING" breakBefore={true}>
                <div className="mb-10">
                    <h2 className="text-xl font-bold flex items-center mb-6 text-slate-800">
                        <span className="w-2 h-6 bg-blue-600 mr-3"></span>
                        1. 지표 기반 맞춤형 공부법 (Gauge-Based Learning)
                    </h2>

                    <div className="mb-8">
                        <h3 className="text-sm font-bold text-slate-700 mb-3 border-l-4 border-slate-900 pl-3">자율신경 및 활력 지수(Vitality) 대응 전략</h3>
                        <div className="p-6 bg-slate-50 border rounded-xl flex items-start space-x-6">
                            <div className="text-center w-24 flex-shrink-0">
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Vitality</p>
                                <p className="text-3xl font-black text-blue-600">{vitality.toFixed(1)}%</p>
                            </div>
                            <div className="flex-1 space-y-3">
                                <strong className="text-sm font-bold text-slate-800">[Standard Mode] 추천 공부법: Structured Output</strong>
                                <p className="text-xs text-slate-600 leading-relaxed italic">
                                    {vitality < 40 ? '활력이 저하된 상태입니다. 과도한 학습보다는 휴식과 수면 보충을 우선시하십시오.' :
                                        vitality < 70 ? '상태가 완만하게 떨어지는 지점이므로 "강제적 휴식"이 관건입니다. 수학의 유형별 문제 풀이 등 구조화된 출력을 진행하십시오.' :
                                            '최상의 활력 상태입니다. 난이도가 높은 과목이나 약점 보완에 집중하십시오.'}
                                    <br />뽀모도로 25:5 기법 적용이 필수입니다.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-8">
                        <div className="border border-orange-200 bg-white p-5 rounded-xl">
                            <h4 className="font-bold text-orange-700 text-sm mb-3">피로 지수 대응 (Fatigue {fatigue.toFixed(1)}%)</h4>
                            <p className="text-[11px] text-slate-600 italic leading-relaxed">
                                상태: 문장을 반복 읽거나 잡생각 침투 시점. <br />
                                <strong>공부법: Active Learning (손과 입)</strong> <br />
                                영어 단어 암기, 배운 내용 복습, 탐구 과목 요약 노트 정리. 눈으로만 하는 공부는 금물입니다.
                            </p>
                        </div>
                        <div className="border border-red-200 bg-white p-5 rounded-xl">
                            <h4 className="font-bold text-red-700 text-sm mb-3">스트레스(긴장)/집중도 게이지 분석</h4>
                            <p className="text-[11px] text-slate-600 italic leading-relaxed">
                                분석: 스트레스 {stress > 70 ? '🔴높음' : '🟢보통'} / 집중도 {hrv.eegMBeta > 15 ? '🟢양호' : '🟡낮음'} <br />
                                <strong>대응: 오감 동원 학습</strong> <br />
                                지루함이 스트레스의 원인입니다. 타임어택으로 긴장감을 유지하고 15분 단위의 짧은 세션으로 집중력을 리셋하십시오.
                            </p>
                        </div>
                    </div>

                    <h3 className="text-sm font-bold text-slate-700 mb-3 border-l-4 border-slate-900 pl-3">📊 피로 지수별 과목 배치 최적화</h3>
                    <div className="overflow-hidden border rounded-xl mb-4">
                        <table className="w-full text-[11px] text-left">
                            <thead className="bg-slate-900 text-white uppercase">
                                <tr>
                                    <th className="px-4 py-3 border-r border-slate-700">지수</th>
                                    <th className="px-4 py-3 border-r border-slate-700">국어</th>
                                    <th className="px-4 py-3 border-r border-slate-700">수학</th>
                                    <th className="px-4 py-3">탐구/암기</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y text-slate-700">
                                <tr className="bg-blue-50/50">
                                    <td className="px-4 py-3 font-black text-blue-700">20%</td>
                                    <td className="px-4 py-3">신규 고난도 독해</td>
                                    <td className="px-4 py-3 font-bold">미해결 킬러 문항</td>
                                    <td className="px-4 py-3">생소한 개념 암기</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 font-black text-orange-600">50%</td>
                                    <td className="px-4 py-3">문학 지문 분석</td>
                                    <td className="px-4 py-3">아는 유형 반복 풀이</td>
                                    <td className="px-4 py-3">요약 노트 만들기</td>
                                </tr>
                                <tr className="bg-slate-50">
                                    <td className="px-4 py-3 font-black text-red-600">80%</td>
                                    <td className="px-4 py-3 italic">문학 영상 시청</td>
                                    <td className="px-4 py-3 italic">기본 연산 연습</td>
                                    <td className="px-4 py-3 italic">교과서 가볍게 읽기</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </ReportPage>
            )}

            {/* --- PAGE 7: COGNITIVE DIAGNOSIS --- */}
            <ReportPage pageNum={9} footerTitle="WORKING MEMORY DIAGNOSTIC" breakBefore={true}>
                <div className="mb-10">
                    <h2 className="text-xl font-bold flex items-center mb-6 text-slate-800">
                        <span className="w-2 h-6 bg-blue-600 mr-3"></span>
                        1. 통합 인지 진단 (Working Memory Diagnostic)
                    </h2>

                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div className="space-y-6">
                            <h3 className="text-sm font-bold text-slate-700 border-l-4 border-slate-900 pl-3">인지 기능 취약점 정밀 분석</h3>
                            <div className="p-6 bg-red-50 rounded-xl border border-red-100 text-xs leading-relaxed text-red-900">
                                충동성이 높아 즉각적인 보상을 선택하는 경향이 있습니다. 작업 기억의 <strong>'중앙 관리자(Central Executive)'</strong> 기능, 특히 억제(Inhibition) 능력이 부족하여 불필요한 자극을 걸러내지 못합니다. 이로 인해 우선순위 설정에 어려움을 겪고 계획만 거창하게 세우는 실행 기능의 저하가 관찰됩니다.
                            </div>
                            <div className="bg-blue-900 text-white p-6 rounded-xl shadow-lg">
                                <h4 className="font-black text-blue-300 mb-2">🚀 기대 효율 향상률</h4>
                                <div className="text-4xl font-black mb-2">약 {45 + (vitality > 60 ? 10 : 0)}% UP</div>
                                <p className="text-[10px] opacity-70 italic">현재의 취약점을 보완하고 맞춤형 훈련(스트룹/목차인출) 지속 시 기대되는 학습 효율 상승 지표입니다.</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-700 border-l-4 border-slate-900 pl-3">Working Memory 강화 훈련</h3>
                            <div className="p-4 border border-blue-200 rounded-xl bg-blue-50">
                                <strong className="text-sm text-blue-800 block mb-1">Pre-Study: 청기백기 변형 (3m)</strong>
                                <p className="text-[11px] text-slate-600 leading-relaxed italic">스트룹(Stroop) 훈련: 글자색과 의미가 다를 때 색을 말하는 연습. 전두엽 억제 회로를 강제 활성화.</p>
                            </div>
                            <div className="p-4 border border-emerald-200 rounded-xl bg-emerald-50">
                                <strong className="text-sm text-emerald-800 block mb-1">Post-Study: 목차 인출 훈련 (5m)</strong>
                                <p className="text-[11px] text-slate-600 leading-relaxed italic">학습 종료 직후 목차를 대-중-소단원 순으로 인출. 산만한 뇌의 정보를 체계적으로 구조화(Structuring).</p>
                            </div>
                            <div className="p-4 border border-slate-900 bg-slate-900 text-white rounded-xl">
                                <strong className="text-sm text-blue-400 block mb-1">데이터 상관관계 & 번아웃 알람</strong>
                                <p className="text-[11px] opacity-80 italic">수동적 학습보다 능동적 학습(Active Recall)에서 집중 유지가 더 잘 됩니다. ℹ️ 현재 번아웃 알람 가동: 흥미 요소 추가 및 짧은 세션 전략으로의 수정이 시급합니다.</p>
                            </div>
                        </div>
                    </div>

                    <h2 className="text-xl font-bold flex items-center mb-6 text-slate-800">
                        <span className="w-2 h-6 bg-slate-900 mr-3"></span>
                        2. 통합 학습 최적화 요약 (Optimization Summary)
                    </h2>
                    <div className="print-avoid-break overflow-hidden border-2 border-slate-900 rounded-xl">
                        <div className="grid grid-cols-2 bg-slate-50 border-b">
                            <div className="p-4 border-r">
                                <p className="text-[10px] font-bold text-slate-400 mb-1">Step 1. 신체 상태 (자율신경)</p>
                                <p className="text-sm font-black text-emerald-600">양호 (학습 최적화 상태)</p>
                            </div>
                            <div className="p-4">
                                <p className="text-[10px] font-bold text-slate-400 mb-1">Step 2. 정신 각성도 (뇌파/집중도)</p>
                                <p className="text-sm font-black text-blue-600">이완된 집중 (Alpha 우세형)</p>
                            </div>
                        </div>
                        <div className="p-6 bg-white text-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Final Step 3. 종합 판정</p>
                            <div className="text-2xl font-black text-slate-900 mb-2">📚 표준 학습 모드 (Standard Learning Mode)</div>
                            <p className="text-sm text-slate-600 leading-relaxed max-w-lg mx-auto italic">
                                "균형 잡힌 상태이나 집중 주기가 짧습니다. 수학 정규 학습부터 시작하되, 뽀모도로 기법(25:5)을 철저히 준수하며 개념-유형-심화 순으로 진행하십시오."
                            </p>
                        </div>
                    </div>
                </div>
            </ReportPage>

            {/* --- PAGE 8: ACTION PLAN --- */}
            <ReportPage pageNum={10} footerTitle="FINAL SOLUTION & KILLER TIPS" breakBefore={true}>
                <div className="mb-10">
                    <h2 className="text-xl font-bold flex items-center mb-6 text-slate-800">
                        <span className="w-2 h-6 bg-blue-600 mr-3"></span>
                        1. 최종 솔루션 제안 (Action Plan) 및 Killer Tips
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* 1. 영양 & 대사 솔루션 */}
                        <div className="print-avoid-break bg-emerald-50 border border-emerald-200 p-6 rounded-2xl shadow-sm">
                            <h4 className="text-emerald-900 font-black flex items-center mb-4 text-lg border-b border-emerald-200 pb-2">
                                <span className="text-2xl mr-2">💊</span> 정밀 영양 처방 (Nutrition)
                            </h4>
                            <ul className="text-xs text-emerald-900 space-y-3 list-disc pl-5 marker:text-emerald-500 font-medium">
                                {result.survey.adrenalFatigueScore >= 26 && (
                                    <li><strong className="text-emerald-950">부신 회복 집중:</strong> 아침 기상 직후 비타민C, 만성 피로 완화를 위한 홍경천 및 테아닌 섭취 권장.</li>
                                )}
                                {(result.hrv.pns < 30 || result.survey.bai >= 15) && (
                                    <li><strong className="text-emerald-950">신경 안정:</strong> 교감신경 항진 억제 및 안정적 수면 유도를 위한 마그네슘, 락티움 보충 요망.</li>
                                )}
                                {result.hrv.brainScore < 70 && (
                                    <li><strong className="text-emerald-950">두뇌 활성화:</strong> 은행잎 추출물 및 고순도 오메가-3로 뇌세포 혈류 공급 강화.</li>
                                )}
                                <li><strong className="text-emerald-950">필수 기반:</strong> 에너지 대사 효율을 극대화하기 위한 고함량 활성형 비타민 B군 복합체 상시 섭취.</li>
                            </ul>
                        </div>

                        {/* 2. 수면 & 회복 솔루션 */}
                        <div className="print-avoid-break bg-indigo-50 border border-indigo-200 p-6 rounded-2xl shadow-sm">
                            <h4 className="text-indigo-900 font-black flex items-center mb-4 text-lg border-b border-indigo-200 pb-2">
                                <span className="text-2xl mr-2">💤</span> 수면 및 회복 (Recovery)
                            </h4>
                            <ul className="text-xs text-indigo-900 space-y-3 list-disc pl-5 marker:text-indigo-500 font-medium">
                                {result.survey.isi >= 15 ? (
                                    <li><strong className="text-indigo-950 text-red-600">[최우선] 수면 구조 복구:</strong> 수면 부족이 단기기억의 장기기억 전환을 심각하게 방해 중입니다. 밤 11시 전 취침 필수.</li>
                                ) : (
                                    <li><strong className="text-indigo-950">기억 고착화 시간:</strong> 원활한 해마의 인지 통합을 위해 최소 7시간 이상의 절대 수면 시간을 확보하세요.</li>
                                )}
                                <li><strong className="text-indigo-950">디지털 차단:</strong> 취침 1시간 전 스마트폰 사용 전면 금지 (블루라이트 차단을 통한 멜라토닌 분비 정상화).</li>
                                <li><strong className="text-indigo-950">환경 통제:</strong> 수면 중 빛을 완전히 차단하고, 일정한 기상 시간을 유지해 생체 시계(Circadian Rhythm)를 동기화.</li>
                            </ul>
                        </div>

                        {/* 3. 환경 & 행동 통제 */}
                        <div className="print-avoid-break bg-orange-50 border border-orange-200 p-6 rounded-2xl shadow-sm">
                            <h4 className="text-orange-900 font-black flex items-center mb-4 text-lg border-b border-orange-200 pb-2">
                                <span className="text-2xl mr-2">🌍</span> 행동 및 환경 (Environment)
                            </h4>
                            <ul className="text-xs text-orange-900 space-y-3 list-disc pl-5 marker:text-orange-500 font-medium">
                                {result.protocol.stressLevel >= 7 && (
                                    <li><strong className="text-orange-950">작업 부하 하향 조정:</strong> 체감 스트레스가 임계점에 도달했습니다. 학습 목표량을 70%로 줄이고 성취감 회복을 우선시하세요.</li>
                                )}
                                <li><strong className="text-orange-950">시각적 노이즈 제거:</strong> 책상 위 불필요한 스마트폰/잡동사니를 제거하여 전전두엽의 주의력 분산(인지 자원 소모)을 차단.</li>
                                <li><strong className="text-orange-950">물리적 쾌적성:</strong> 뇌 기능 저하를 막기 위해 실내 온도 21~23도, 습도 50% 유지 및 1시간 단위 강제 환기(산소 공급).</li>
                            </ul>
                        </div>

                        {/* 4. 심리 & 멘탈 케어 */}
                        <div className="print-avoid-break bg-sky-50 border border-sky-200 p-6 rounded-2xl shadow-sm">
                            <h4 className="text-sky-900 font-black flex items-center mb-4 text-lg border-b border-sky-200 pb-2">
                                <span className="text-2xl mr-2">❤️</span> 심리 및 멘탈 (Mental)
                            </h4>
                            <ul className="text-xs text-sky-900 space-y-3 list-disc pl-5 marker:text-sky-500 font-medium">
                                {result.survey.gad7 >= 10 ? (
                                    <li><strong className="text-sky-950">불안 하향 조절:</strong> 완벽주의적 강박을 내려놓고, '틀려도 괜찮다'는 관대한 자기 인식과 이완 명상을 병행하세요.</li>
                                ) : (
                                    <li><strong className="text-sky-950">성취 보상 회로:</strong> 작은 단기 목표를 달성할 때마다 긍정적 강화를 통해 도파민 분비를 촉진하고 학습 동기를 유지하세요.</li>
                                )}
                                <li><strong className="text-sky-950">사전 긍정 루틴:</strong> 학습 시작 전 "나는 오늘 목표를 여유롭게 달성할 수 있다"고 3회 소리 내어 말하는 Self-Talk 의식.</li>
                                <li><strong className="text-sky-950">리셋 호흡법:</strong> 긴장과 조급함이 올라올 때마다 4-7-8 호흡(4초 흡기, 7초 정지, 8초 호기)으로 부교감을 활성화.</li>
                            </ul>
                        </div>
                    </div>

                    {/* Premium Killer Tips */}
                    <div className="print-avoid-break bg-slate-900 text-white p-8 rounded-3xl relative overflow-hidden shadow-2xl mb-10 border border-slate-700">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-300 via-yellow-500 to-orange-400"></div>
                        <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500 mb-6 flex items-center">
                            <span className="mr-3 text-3xl">🏆</span> 상위 1% Killer Tips (학습 효율 극대화)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-600 hover:border-amber-400 transition-colors">
                                <strong className="text-sm text-indigo-300 font-black mb-3 flex items-center">
                                    <span className="w-2 h-2 rounded-full bg-indigo-400 mr-2 shadow-[0_0_8px_rgba(129,140,248,0.8)]"></span> 생체-인지 리듬 동기화
                                </strong>
                                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                                    가장 높은 집중력이 필요한 취약 과목이나 킬러 문항 풀이는 뇌가 가장 맑은 <b>오전 10시~12시</b> 사이에 고정 배치하십시오. 오후 3~5시는 코르티솔 저하로 인지력이 떨어지므로 단순 암기나 문제 은행 풀기(양치기) 시간으로 활용하여 뇌의 부하를 지능적으로 분산시켜야 합니다.
                                </p>
                            </div>
                            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-600 hover:border-amber-400 transition-colors">
                                <strong className="text-sm text-emerald-300 font-black mb-3 flex items-center">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span> 감각-처리 속도 매칭
                                </strong>
                                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                                    단순히 눈으로만 글을 읽는 수동적 학습(Passive Reading)은 전두엽을 잠들게 합니다. <b>낭독하기, 키워드 마인드맵 그리기, 허공에 대고 타인에게 설명하기</b> 등 시각/청각/운동감각을 동시에 자극하여 전전두엽의 억제력을 최대로 끌어올리고 정보를 장기 기억으로 각인시키세요.
                                </p>
                            </div>
                            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-600 hover:border-amber-400 transition-colors">
                                <strong className="text-sm text-amber-300 font-black mb-3 flex items-center">
                                    <span className="w-2 h-2 rounded-full bg-amber-400 mr-2 shadow-[0_0_8px_rgba(251,191,36,0.8)]"></span> 텐션 스키핑 (Tension Skipping)
                                </strong>
                                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                                    채점과 오답 검토를 모든 과목 학습이 끝난 뒤로 미루는 것은 가장 안 좋은 습관입니다. <b>10문제~15문제 단위로 짧게 끊어서 바로 채점</b>하세요. 정답을 맞혔을 때의 즉각적인 도파민 분비가 뇌에 보상 기제로 작용하여 지루함을 차단하고 무한 동력을 만들어냅니다.
                                </p>
                            </div>
                        </div>
                        <div className="absolute -right-16 -bottom-16 opacity-5 rotate-12 pointer-events-none">
                            <span className="text-[250px]">🧠</span>
                        </div>
                    </div>

                    {adminMemo && (
                        <div className="bg-slate-50 border-2 border-indigo-100 rounded-xl p-8 shadow-sm">
                            <h3 className="text-lg font-bold text-indigo-900 mb-4 flex items-center border-b border-indigo-200 pb-3">
                                <span className="text-2xl mr-3">👨‍⚕️</span> 나의 전문 소견 (Expert Opinion)
                            </h3>
                            <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                                {adminMemo}
                            </div>
                        </div>
                    )}
                </div>
            </ReportPage>

            {/* --- PAGE 11: SUBJECT STRATEGY --- */}
            {selectedSubjectOptions && Object.entries(selectedSubjectOptions).filter(([_, strategies]: [string, any]) => Array.isArray(strategies) && strategies.length > 0).length > 0 && (
                <ReportPage pageNum={11} footerTitle="SUBJECT STRATEGY" breakBefore={true} autoHeight={true}>
                    <div>
                        <h2 className="text-xl font-bold flex items-center mb-8 text-slate-800">
                            <span className="w-2 h-6 bg-emerald-600 mr-3"></span>
                            과목별 학습 전략 (Subject Strategy)
                        </h2>

                        <div className="space-y-3">
                            {Object.entries(selectedSubjectOptions)
                                .filter(([_, strategies]: [string, any]) => Array.isArray(strategies) && strategies.length > 0)
                                .map(([subject, strategies]: [string, any], idx) => (
                                <div key={idx} className="border-l-4 border-emerald-600 bg-emerald-50/50 p-4 rounded-lg" style={{ pageBreakInside: 'avoid' }}>
                                    <h3 className="text-sm font-bold text-emerald-900 mb-2 flex items-center">
                                        <span className="text-lg mr-2">📚</span>
                                        {subject.toUpperCase()}
                                    </h3>
                                    <div className="space-y-2">
                                        {strategies.map((strategyId: any, sIdx: number) => {
                                            const subjectKey = subject.toLowerCase();
                                            const subjectOptions = SUBJECT_OPTIONS_MAP[subjectKey as keyof typeof SUBJECT_OPTIONS_MAP];
                                            const strategyObj = subjectOptions?.find(opt => opt.id === strategyId);
                                            const contentPreview = strategyObj?.content ? strategyObj.content.substring(0, 80) + (strategyObj.content.length > 80 ? '...' : '') : '';

                                            return (
                                                <div key={sIdx} className="border-l-2 border-emerald-400 pl-2 py-1">
                                                    <p className="font-bold text-emerald-800 text-[11px] mb-0.5">
                                                        {strategyObj?.title || strategyId}
                                                    </p>
                                                    {contentPreview && (
                                                        <p className="text-[10px] text-slate-600 leading-tight">{contentPreview}</p>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </ReportPage>
            )}

            {/* --- PAGE 12: PRE-STUDY ROUTINE --- */}
            {strategies && result.careType && strategies[result.careType]?.preStudyRoutine && (
                <ReportPage pageNum={12} footerTitle="PRE-STUDY ROUTINE" breakBefore={true} autoHeight={true}>
                    <div>
                        <h2 className="text-xl font-bold flex items-center mb-8 text-slate-800">
                            <span className="w-2 h-6 bg-blue-600 mr-3"></span>
                            ⚡ 시작 전 루틴 (Pre-Study Routine)
                        </h2>
                        <div className="p-6 bg-blue-50 border-2 border-blue-200 rounded-xl">
                            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                                {strategies[result.careType]?.preStudyRoutine}
                            </p>
                        </div>
                    </div>
                </ReportPage>
            )}

            {/* --- PAGE 13: STUDY STRATEGY --- */}
            {strategies && result.careType && strategies[result.careType]?.studyStrategy && (
                <ReportPage pageNum={13} footerTitle="STUDY STRATEGY" breakBefore={true} autoHeight={true}>
                    <div>
                        <h2 className="text-xl font-bold flex items-center mb-8 text-slate-800">
                            <span className="w-2 h-6 bg-purple-600 mr-3"></span>
                            🧠 학습 중 전략 (Study Strategy)
                        </h2>
                        <div className="p-6 bg-purple-50 border-2 border-purple-200 rounded-xl">
                            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                                {strategies[result.careType]?.studyStrategy}
                            </p>
                        </div>
                    </div>
                </ReportPage>
            )}

            {/* --- PAGE 14: EXERCISE GUIDE --- */}
            {strategies && result.careType && strategies[result.careType]?.exerciseGuide && (
                <ReportPage pageNum={14} footerTitle="EXERCISE GUIDE" breakBefore={true} autoHeight={true}>
                    <div>
                        <h2 className="text-xl font-bold flex items-center mb-8 text-slate-800">
                            <span className="w-2 h-6 bg-orange-600 mr-3"></span>
                            🏃 신체 활동 가이드 (Exercise Guide)
                        </h2>
                        <div className="p-6 bg-orange-50 border-2 border-orange-200 rounded-xl">
                            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                                {strategies[result.careType]?.exerciseGuide}
                            </p>
                        </div>
                    </div>
                </ReportPage>
            )}

            {/* --- PAGE 15: NUTRITION GUIDE --- */}
            {strategies && result.careType && strategies[result.careType]?.nutritionGuide && (
                <ReportPage pageNum={15} footerTitle="NUTRITION GUIDE" breakBefore={true} autoHeight={true}>
                    <div>
                        <h2 className="text-xl font-bold flex items-center mb-8 text-slate-800">
                            <span className="w-2 h-6 bg-green-600 mr-3"></span>
                            🍎 영양 가이드 (Nutrition Guide)
                        </h2>
                        <div className="p-6 bg-green-50 border-2 border-green-200 rounded-xl">
                            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                                {strategies[result.careType]?.nutritionGuide}
                            </p>
                        </div>
                    </div>
                </ReportPage>
            )}

            {/* --- PAGE 16: RECOVERY GUIDE --- */}
            {strategies && result.careType && strategies[result.careType]?.recoveryGuide && (
                <ReportPage pageNum={16} footerTitle="RECOVERY GUIDE" breakBefore={true} autoHeight={true}>
                    <div>
                        <h2 className="text-xl font-bold flex items-center mb-8 text-slate-800">
                            <span className="w-2 h-6 bg-indigo-600 mr-3"></span>
                            💤 회복 및 휴식 (Recovery Guide)
                        </h2>
                        <div className="p-6 bg-indigo-50 border-2 border-indigo-200 rounded-xl">
                            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                                {strategies[result.careType]?.recoveryGuide}
                            </p>
                        </div>
                    </div>
                </ReportPage>
            )}

            {/* --- PAGE 17: EXPERT GUIDE --- */}
            {result.completedExpertGuideItems && result.completedExpertGuideItems.length > 0 && result.careType && (
                <ReportPage pageNum={17} footerTitle="EXPERT GUIDE" breakBefore={true} autoHeight={true}>
                    <div>
                        <h2 className="text-xl font-bold flex items-center mb-8 text-slate-800">
                            <span className="text-2xl mr-3">👨‍⚕️</span>
                            전문가 맞춤 처방 (Expert Guide)
                        </h2>
                        
                        <div className="space-y-6">
                            {(['prestudy', 'learning', 'exercise'] as const).map(tab => {
                                const expertContent = EXPERT_CONTENTS[result.careType!] || EXPERT_CONTENTS[CareType.HEALTHY];
                                const section = expertContent?.[tab];
                                if (!section) return null;
                                
                                const matchedGuides = section.guides.filter((g: any) => result.completedExpertGuideItems!.includes(g.title));
                                if (matchedGuides.length === 0) return null;

                                return (
                                    <div key={tab} className="border border-slate-200 rounded-xl overflow-hidden mb-6" style={{ pageBreakInside: 'avoid' }}>
                                        <div className="bg-slate-100 p-4 border-b border-slate-200">
                                            <h3 className="font-bold text-slate-800">
                                                {tab === 'prestudy' ? '시작전 루틴' : 
                                                 tab === 'learning' ? '학습 중 전략 (Study Strategy)' : 
                                                 '신체 활동 가이드 (Exercise Guide)'}
                                            </h3>
                                        </div>
                                        <div className="p-4 space-y-4 bg-white">
                                            {matchedGuides.map((guide: any, idx: number) => {
                                                const getDifficultyDisplay = (difficulty: string) => {
                                                    switch (difficulty) {
                                                        case '쉬움': return { color: 'bg-green-100 text-green-700', emoji: '🟢' };
                                                        case '어려움': return { color: 'bg-red-100 text-red-700', emoji: '🔴' };
                                                        case '보통':
                                                        default: return { color: 'bg-amber-100 text-amber-700', emoji: '🟡' };
                                                    }
                                                };
                                                const diff = getDifficultyDisplay(guide.difficulty);
                                                
                                                return (
                                                    <div key={idx} className="bg-white border-2 border-slate-200 rounded-xl p-4 shadow-sm mb-4">
                                                        <div className="flex justify-between items-start mb-3 pb-2 border-b-2 border-slate-100">
                                                            <h3 className="text-base font-bold text-slate-800">{idx + 1}. {guide.title}</h3>
                                                            <span className={`px-2 py-1 text-xs font-bold rounded-full ${diff.color}`}>
                                                                {diff.emoji} {guide.difficulty || '보통'}
                                                            </span>
                                                        </div>
                                                        
                                                        <div className="mb-3">
                                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">전문가 설명</p>
                                                            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{guide.expertDesc}</p>
                                                        </div>
                                                        
                                                        <div className="mb-3">
                                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">과학적 근거</p>
                                                            <div className="bg-amber-50 border-l-4 border-amber-500 p-2 rounded text-xs text-amber-900 leading-relaxed">
                                                                {guide.rationale}
                                                            </div>
                                                        </div>
                                                        
                                                        {guide.managerGuide && (
                                                            <div className="mb-3">
                                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">상담사 가이드</p>
                                                                <div className="bg-indigo-50 border-l-4 border-indigo-600 p-2 rounded text-xs font-semibold text-indigo-900 leading-relaxed">
                                                                    {guide.managerGuide}
                                                                </div>
                                                            </div>
                                                        )}
                                                        
                                                        <div>
                                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">실천 방법</p>
                                                            <div className="bg-emerald-50 border-l-4 border-emerald-500 p-2 rounded flex gap-2 items-start">
                                                                <span className="text-emerald-600 text-lg font-bold flex-shrink-0">✓</span>
                                                                <p className="text-xs text-emerald-900 leading-relaxed">{guide.action}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </ReportPage>
            )}

        </div>
    );
};
