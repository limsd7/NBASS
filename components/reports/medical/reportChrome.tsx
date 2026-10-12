import React from 'react';
import type { AssessmentResult } from '../../../types';

// Page chrome (moved verbatim from MedicalReport.tsx; inner components hoisted
// with explicit props — identical DOM output, no remounts)
export const ReportHeader = ({
    tierBadgeStyle, tierDisplayLabel, examinerDisplay,
}: {
    tierBadgeStyle: string; tierDisplayLabel: string; examinerDisplay: string;
}) => (
    <div className="flex flex-row justify-between items-start border-b-2 border-slate-200 pb-2 mb-2">
        <div>
            <div className="text-blue-700 font-bold text-[11px] tracking-widest uppercase">Neuro-Bio Academic Strategy System</div>
            <div className="flex items-center gap-2 mt-0.5">
                <h1 className="text-xl font-black text-slate-800">NBASS 정밀 진단 보고서</h1>
                <span className={`px-2 py-0.5 rounded text-[11px] font-black border tracking-wider uppercase ${tierBadgeStyle}`}>
                    {tierDisplayLabel}
                </span>
            </div>
            <p className="text-slate-500 text-[10px] italic mt-0.5">Official Diagnostic &amp; Neuro-Insight Comprehensive Report</p>
        </div>
        <div className="text-right">
            <div className="inline-block bg-slate-100 px-2.5 py-0.5 rounded text-[10px] font-mono text-slate-600 mb-0.5">Ver 2.6.0-Precision</div>
            <div className="text-[11px] font-medium">분석책임자: <span className="text-blue-700 font-bold">{examinerDisplay}</span></div>
        </div>
    </div>
);

// Patient Info Grid
export const PatientInfoGrid = ({
    student, genderStr, age, today,
}: {
    student: AssessmentResult['student']; genderStr: string; age: number; today: string;
}) => (
    <div
        className="bg-slate-50 px-3 py-2 rounded-xl mb-3 border border-slate-200 text-xs"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '0.75rem' }}
    >
        <div>
            <label className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">피검자 성명</label>
            <div className="text-xs font-black text-slate-800">{student.name} <span className="text-[10px] font-normal text-slate-500">({genderStr} / {age}세)</span></div>
        </div>
        <div>
            <label className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">진단 코드</label>
            <div className="text-xs font-mono font-bold text-slate-700">ID-{today.replace(/-/g, '').substring(2)}-{student.id.substring(0, 4)}</div>
        </div>
        <div>
            <label className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">검사 일시</label>
            <div className="text-xs font-bold text-slate-700">{today}</div>
        </div>
        <div>
            <label className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">중점 분석 분야</label>
            <div className="text-xs font-black text-blue-700">{student.weakSubject ? student.weakSubject.toUpperCase() : 'GENERAL'} (학습 최적화)</div>
        </div>
    </div>
);

// Standardized Footer with page numbering
export const ReportFooter = ({ pageNum, title }: { pageNum: number, title: string }) => (
    <div className="mt-auto pt-2 border-t border-slate-200 flex flex-col md:flex-row justify-between text-[9px] text-slate-400 font-medium">
        <p>© 2026 NEURO-EDULAB. All data is encrypted and confidential.</p>
        <p className="mt-0.5 md:mt-0 uppercase tracking-widest font-bold text-slate-500">{title} : PAGE {String(pageNum).padStart(2, '0')}</p>
    </div>
);

export interface ReportPageProps {
    children: React.ReactNode;
    pageNum: number;
    footerTitle: string;
    breakBefore?: boolean;
    tierBadgeStyle: string;
    tierDisplayLabel: string;
    examinerDisplay: string;
    student: AssessmentResult['student'];
    genderStr: string;
    age: number;
    today: string;
}

// Page wrapper
export const ReportPage = ({ children, pageNum, footerTitle, breakBefore = true, tierBadgeStyle, tierDisplayLabel, examinerDisplay, student, genderStr, age, today }: ReportPageProps) => (
    <div className={`page ${breakBefore ? 'page-break-before' : ''}`}>
        <div className="report-card">
            <ReportHeader tierBadgeStyle={tierBadgeStyle} tierDisplayLabel={tierDisplayLabel} examinerDisplay={examinerDisplay} />
            <PatientInfoGrid student={student} genderStr={genderStr} age={age} today={today} />
            <div className="report-content-wrapper flex-1 flex flex-col justify-between">{children}</div>
            <ReportFooter pageNum={pageNum} title={footerTitle} />
        </div>
    </div>
);
