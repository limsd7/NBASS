import React from 'react';
import { GradeRecord, StudentInfo, AssessmentResult } from '../../types';
import { SUNEUNG_SUBJECTS } from '../../data/suneungSubjects';
import { getCareTypeDetail } from '../../data/careTypesData';

interface ParentReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: StudentInfo;
    records: GradeRecord[];
    latestGrades: Map<string, number>;
    currentAssessment?: AssessmentResult;
    selectedSubjectIds: string[];
}

export const ParentReportModal: React.FC<ParentReportModalProps> = ({ 
    isOpen, onClose, student, records, latestGrades, currentAssessment, selectedSubjectIds
}) => {
    if (!isOpen) return null;

    const handlePrint = () => {
        window.print();
    };

    const getCareTypeKor = (type?: string) => {
        if (!type) return '진단되지 않음';
        const care = getCareTypeDetail(type);
        return `${care.emoji} ${care.title} (${care.subtitle})`;
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:p-0 print:bg-white print:block overflow-y-auto">
            <div className="bg-white rounded-3xl w-full max-w-[210mm] min-h-[297mm] my-auto print:m-0 print:w-full print:h-full print:rounded-none shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col relative">
                
                {/* 비인쇄 영역: 헤더 바 */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-800 text-white print:hidden rounded-t-3xl sticky top-0 z-10">
                    <h2 className="text-xl font-bold">학부모 요약 보고서 (인쇄용)</h2>
                    <div className="flex gap-2">
                        <button onClick={handlePrint} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition-colors">
                            🖨️ 인쇄하기
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            ✕
                        </button>
                    </div>
                </div>

                {/* 실제 인쇄될 보고서 영역 (A4 사이즈 타겟) */}
                <div className="p-10 print:p-8 flex-1 flex flex-col space-y-8 text-slate-800" id="print-area">
                    {/* 타이틀 */}
                    <div className="text-center border-b-2 border-slate-800 pb-6">
                        <h1 className="text-3xl font-black mb-2">AI 성적 진단 및 학습 관리 보고서</h1>
                        <p className="text-lg text-slate-500">생성일: {new Date().toLocaleDateString()}</p>
                    </div>

                    {/* 학생 기본 정보 */}
                    <section>
                        <h2 className="text-xl font-bold border-l-4 border-blue-600 pl-3 mb-4">학생 기본 정보 및 진단</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <p className="text-sm text-slate-500 mb-1">학생 이름</p>
                                <p className="text-lg font-bold">{student.name} ({student.grade})</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <p className="text-sm text-slate-500 mb-1">인지/신체 상태 진단 (CareType)</p>
                                <p className="text-lg font-bold text-rose-600">{getCareTypeKor(currentAssessment?.careType)}</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <p className="text-sm text-slate-500 mb-1">인지 성능 지표</p>
                                <div className="flex justify-between items-center">
                                    <span>두뇌 집중력 (Focus)</span>
                                    <span className="font-bold">{currentAssessment?.hrv?.concentrationLevel || 0}%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>작업기억 (WM)</span>
                                    <span className="font-bold">{currentAssessment?.workingMemoryResults?.overallScore || currentAssessment?.hrv?.attentionLevel || 0}%</span>
                                </div>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <p className="text-sm text-slate-500 mb-1">취약 집중 과목</p>
                                <p className="text-lg font-bold text-blue-600">
                                    {SUNEUNG_SUBJECTS.find(s => s.id === student.weakSubject)?.name || '없음'}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* 현재 성적 요약 */}
                    <section>
                        <h2 className="text-xl font-bold border-l-4 border-blue-600 pl-3 mb-4">현재 과목별 등급 요약 (최근 성적 기준)</h2>
                        <table className="w-full border-collapse border border-slate-200 text-center">
                            <thead>
                                <tr className="bg-slate-100">
                                    <th className="p-3 border border-slate-200 font-bold">과목</th>
                                    <th className="p-3 border border-slate-200 font-bold">최근 등급</th>
                                    <th className="p-3 border border-slate-200 font-bold">응시 횟수</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedSubjectIds.map(subjectId => {
                                    const info = SUNEUNG_SUBJECTS.find(s => s.id === subjectId);
                                    if (!info) return null;
                                    const currentGrade = latestGrades.get(subjectId);
                                    if (!currentGrade) return null;
                                    
                                    const examCount = records.filter(r => r.subjects.some(s => s.subjectId === subjectId)).length;
                                    
                                    return (
                                        <tr key={subjectId}>
                                            <td className="p-3 border border-slate-200 font-bold text-slate-700">{info.name}</td>
                                            <td className="p-3 border border-slate-200 font-black text-blue-600 text-lg">{currentGrade}</td>
                                            <td className="p-3 border border-slate-200 text-slate-500">{examCount}회</td>
                                        </tr>
                                    );
                                })}
                                {selectedSubjectIds.filter(id => latestGrades.has(id)).length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="p-6 text-slate-500">입력된 성적 기록이 없습니다.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </section>

                    {/* AI 종합 의견 */}
                    <section className="flex-1">
                        <h2 className="text-xl font-bold border-l-4 border-indigo-600 pl-3 mb-4">AI 종합 조언 및 학부모 가이드</h2>
                        <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-xl space-y-4 text-indigo-900 leading-relaxed">
                            <p><strong>[인지 및 신체 상태]</strong><br/>
                            학생은 현재 <strong>{getCareTypeKor(currentAssessment?.careType)}</strong> 상태로 분석됩니다. 
                            이는 단순한 의지력의 문제가 아니며, 신체적/인지적 과부하가 원인일 수 있습니다. 
                            학습 시간을 무리하게 늘리기보다는 규칙적인 수면과 짧은 휴식(예: 뽀모도로 테크닉)을 병행하여 뇌 피로도를 낮추는 것이 가장 중요합니다.</p>
                            
                            <p><strong>[학습 전략 방향]</strong><br/>
                            취약 과목({SUNEUNG_SUBJECTS.find(s => s.id === student.weakSubject)?.name || '없음'})에 전체 자율 학습 시간의 추가 15~20%를 투자하여 
                            단기 목표를 먼저 달성하는 성취감을 맛보게 하는 것이 좋습니다. 
                            오답 노트를 작성할 때 '왜 틀렸는지'를 스스로 설명하도록 유도해주세요.</p>
                            
                            <p><strong>[가정 내 지원]</strong><br/>
                            결과(등급)에 대한 직접적인 압박보다는 과정(오늘 계획한 것을 했는지)에 대해 칭찬해주세요. 
                            양질의 수면 환경을 조성하고, 소화가 잘 되는 식단으로 신체적 컨디션을 끌어올리는 것이 성적 향상의 든든한 밑거름이 됩니다.</p>
                        </div>
                    </section>

                    <footer className="pt-6 border-t border-slate-200 text-center text-sm text-slate-400">
                        본 리포트는 성적 관리 시스템 AI 모델에 의해 분석 및 생성되었습니다.
                    </footer>
                </div>
            </div>
            
            <style dangerouslySetInnerHTML={{__html: `
                @media print {
                    @page { margin: 0; size: A4; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background-color: white; }
                }
            `}} />
        </div>
    );
};
