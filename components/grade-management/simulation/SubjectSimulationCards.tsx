import React from 'react';
import { SimulationResult } from '../../../services/gradeSimulationEngine';
import { StudentInfo } from '../../../types';

interface Props {
    simulationResult: SimulationResult;
    student: StudentInfo;
    handleOpenClinic: (
        subjectId: string,
        strategyTag?: string,
        strategyType?: 'grade_strategy' | 'cognitive_tip',
        currentGrade?: number,
        targetGrade?: number
    ) => void;
    onOpenSubjectDetail: (subjectId: string) => void;
}

export const SubjectSimulationCards: React.FC<Props> = ({ simulationResult, student, handleOpenClinic, onOpenSubjectDetail }) => {
    const nameOf = (subjectId: string) =>
        simulationResult.projections.find(p => p.subjectId === subjectId)?.subjectName || subjectId;
    const commonBottlenecks = simulationResult.commonBottlenecks || [];
    const commonRecommendations = simulationResult.commonRecommendations || [];
    const hasCommon = commonBottlenecks.length > 0 || commonRecommendations.length > 0;

    const recTagStyle = (tag: string) => {
        let tagStyle = "bg-blue-100 text-blue-700 border-blue-200";
        const isCognitive = tag.includes('두뇌') || tag.includes('인지') || tag.includes('케어') || tag.includes('메모') || tag.includes('스캔');
        if (tag.includes('취약')) tagStyle = "bg-amber-100 text-amber-800 border-amber-200";
        if (isCognitive) tagStyle = "bg-purple-100 text-purple-800 border-purple-200";
        if (tag.includes('1등급') || tag.includes('유지')) tagStyle = "bg-emerald-100 text-emerald-800 border-emerald-200";
        return tagStyle;
    };

    return (
        <>
            {hasCommon && (
                <div id="common-analysis-block" className="bg-white p-5 rounded-2xl border border-indigo-200 shadow-sm mb-4 scroll-mt-4">
                    <h4 className="font-bold text-slate-800 text-base flex items-center gap-2 mb-1">
                        <span>🧩</span> 전 과목 공통 분석
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">중복 제거됨</span>
                    </h4>
                    <p className="text-xs text-slate-500 mb-4">여러 과목에 동일하게 나타난 항목은 한곳에 모아 표시합니다.</p>
                    {commonBottlenecks.length > 0 && (
                        <div className="space-y-2 mb-4">
                            <h5 className="text-xs font-bold text-rose-500 uppercase flex items-center gap-1">
                                <span>⚠️</span> 공통 병목 요인
                            </h5>
                            <ul className="text-xs sm:text-sm text-slate-600 space-y-1.5">
                                {commonBottlenecks.map((c, i) => {
                                    const match = c.text.match(/^\[(.*?)\]\s*(.*)$/);
                                    return (
                                        <li key={i} className="flex items-start gap-1.5">
                                            <span className="text-rose-500 font-bold shrink-0">·</span>
                                            <span>
                                                {match && (
                                                    <strong className="text-slate-800 font-bold">[{match[1]}]</strong>
                                                )}{' '}
                                                {match ? match[2] : c.text}{' '}
                                                <span className="inline-block text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-1.5 py-0 rounded ml-1">
                                                    적용: {c.subjectIds.map(nameOf).join('·')}
                                                </span>
                                            </span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    )}
                    {commonRecommendations.length > 0 && (
                        <div className="space-y-2">
                            <h5 className="text-xs font-bold text-blue-500 uppercase flex items-center gap-1">
                                <span>💡</span> 공통 추천 전략
                            </h5>
                            <ul className="space-y-2.5">
                                {commonRecommendations.map((c, i) => {
                                    const match = c.text.match(/^\[(.*?)\]\s*(.*)$/);
                                    const tag = match ? match[1] : '';
                                    const content = match ? match[2] : c.text;
                                    return (
                                        <li key={i} className="bg-slate-50 p-3 rounded-2xl border border-slate-100 leading-relaxed text-xs sm:text-sm">
                                            {match && (
                                                <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded border mr-1.5 ${recTagStyle(tag)}`}>
                                                    {tag}
                                                </span>
                                            )}
                                            <span className="text-slate-700">{content}</span>
                                            <div className="mt-1.5">
                                                <span className="inline-block text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-1.5 py-0 rounded">
                                                    적용: {c.subjectIds.map(nameOf).join('·')}
                                                </span>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {simulationResult.projections.map(proj => (
                <div key={proj.subjectId} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full">
                    <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-4">
                        <div>
                            <h4 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                                {proj.subjectName}
                                {(student.focusSubjects || []).includes(proj.subjectId) && (
                                    <span className="bg-rose-100 text-rose-600 text-[10px] font-black px-2 py-0.5 rounded uppercase">Focus</span>
                                )}
                            </h4>
                            <p className="text-sm text-slate-500 mt-1">
                                현재 <strong className="text-slate-700">{proj.currentGrade}등급</strong>
                                {proj.gradeEstimated && (
                                    <span className="ml-1.5 inline-block text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200" title="원점수를 등급컷 기준으로 환산한 추정치입니다">
                                        추정
                                    </span>
                                )}
                                {' '}→ 수능 목표 <strong className="text-blue-600">{proj.targetGrade}등급</strong>
                            </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <button
                                onClick={() => onOpenSubjectDetail(proj.subjectId)}
                                className="flex items-center gap-1 text-[11px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-md transition-colors"
                            >
                                <span>📘</span> 상세 공부법
                            </button>
                            <div className="text-right">
                                <span className="text-[10px] text-slate-400 font-bold uppercase mb-0.5 block" title="목표·검사 데이터 기반 추정치이며 실제 결과를 보장하지 않습니다">목표 달성 확률(추정)</span>
                                <div className="text-xl font-black leading-none" style={{ color: proj.probability >= 80 ? '#10b981' : proj.probability >= 50 ? '#f59e0b' : '#ef4444' }}>
                                    {proj.probability}%
                                </div>
                                {proj.efficiencyApplied && (
                                    <span className="inline-block mt-1 text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200" title="검사 효율 점수를 ±10%p 범위로 반영한 확률입니다">
                                        컨디션 반영
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 space-y-4">
                        {proj.bottlenecks.length === 0 && proj.recommendations.length === 0 ? (
                            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs text-slate-600 leading-relaxed">
                                <span className="font-bold text-indigo-700">🧩 공통 분석에 통합됨</span> — 이 과목의 병목·전략이
                                다른 과목과 동일하여 <a href="#common-analysis-block" className="font-bold text-indigo-600 underline underline-offset-2">상단 공통 분석</a>에
                                한 번만 표시됩니다. 과목 고유 항목이 생기면 이 카드에 표시됩니다.
                            </div>
                        ) : (
                            <>
                        {proj.bottlenecks.length > 0 && (
                            <div className="space-y-2">
                                <h5 className="text-xs font-bold text-rose-500 uppercase flex items-center gap-1">
                                    <span>⚠️</span> 예상 병목 요인
                                </h5>
                                <ul className="text-xs sm:text-sm text-slate-600 space-y-1.5">
                                    {proj.bottlenecks.map((b, i) => {
                                        const match = b.match(/^\[(.*?)\]\s*(.*)$/);
                                        if (match) {
                                            return (
                                                <li key={i} className="flex items-start gap-1.5">
                                                    <span className="text-rose-500 font-bold shrink-0">·</span>
                                                    <span>
                                                        <strong className="text-slate-800 font-bold">[{match[1]}]</strong> {match[2]}
                                                    </span>
                                                </li>
                                            );
                                        }
                                        return (
                                            <li key={i} className="flex items-start gap-1.5">
                                                <span className="text-rose-500 font-bold shrink-0">·</span>
                                                <span>{b}</span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <h5 className="text-xs font-bold text-blue-500 uppercase flex items-center gap-1">
                                    <span>💡</span> AI 맞춤 추천 전략
                                </h5>
                                {proj.subjectId === 'korean' && (
                                    <button
                                        onClick={() => handleOpenClinic('korean', undefined, 'grade_strategy', proj.currentGrade, proj.targetGrade)}
                                        className="text-[11px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2 py-0.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                                    >
                                        <span>📘</span> 국어 AI 앱 열기 (새 창)
                                    </button>
                                )}
                                {proj.subjectId === 'math' && (
                                    <button
                                        onClick={() => handleOpenClinic('math', undefined, 'grade_strategy', proj.currentGrade, proj.targetGrade)}
                                        className="text-[11px] font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-2 py-0.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                                    >
                                        <span>📐</span> 수학 AI 앱 열기 (새 창)
                                    </button>
                                )}
                                {proj.subjectId === 'english' && (
                                    <button
                                        onClick={() => handleOpenClinic('english', undefined, 'grade_strategy', proj.currentGrade, proj.targetGrade)}
                                        className="text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                                    >
                                        <span>🌍</span> 영어 AI 앱 열기 (새 창)
                                    </button>
                                )}
                            </div>
                            <ul className="space-y-2.5">
                                {proj.recommendations.length > 0 && proj.recommendations.map((r, i) => {
                                    const match = r.match(/^\[(.*?)\]\s*(.*)$/);
                                    if (match) {
                                        const tag = match[1];
                                        const content = match[2];
                                        let tagStyle = "bg-blue-100 text-blue-700 border-blue-200";
                                        const isCognitive = tag.includes('두뇌') || tag.includes('인지') || tag.includes('케어') || tag.includes('메모') || tag.includes('스캔');
                                        if (tag.includes('취약')) tagStyle = "bg-amber-100 text-amber-800 border-amber-200";
                                        if (isCognitive) tagStyle = "bg-purple-100 text-purple-800 border-purple-200";
                                        if (tag.includes('1등급') || tag.includes('유지')) tagStyle = "bg-emerald-100 text-emerald-800 border-emerald-200";

                                        return (
                                            <li key={i} className="bg-slate-50 p-3 rounded-2xl border border-slate-100 leading-relaxed text-xs sm:text-sm flex flex-col gap-2">
                                                <div>
                                                    <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded border mr-1.5 ${tagStyle}`}>
                                                        {tag}
                                                    </span>
                                                    <span className="text-slate-700">{content}</span>
                                                </div>

                                                {/* 국어 과목 전용 실전 문제 & 인지 훈련 딥링크 버튼 */}
                                                {proj.subjectId === 'korean' && (
                                                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-200/60">
                                                        {isCognitive ? (
                                                            <button
                                                                onClick={() => handleOpenClinic('korean', content, 'cognitive_tip', proj.currentGrade, proj.targetGrade)}
                                                                className="flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-2.5 py-1 rounded-lg transition-all shadow-xs cursor-pointer"
                                                            >
                                                                <span>🧠</span>
                                                                <span>30초 인지 메모 훈련 (새 창)</span>
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleOpenClinic('korean', content, 'grade_strategy', proj.currentGrade, proj.targetGrade)}
                                                                className="flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-lg transition-all shadow-xs cursor-pointer"
                                                            >
                                                                <span>🎯</span>
                                                                <span>1분 실전 문제 풀기 (새 창)</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                )}

                                                {/* 수학 과목 전용 준킬러 실전 문제 & 줄맞춤 인지 훈련 딥링크 버튼 */}
                                                {proj.subjectId === 'math' && (
                                                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-200/60">
                                                        {isCognitive ? (
                                                            <button
                                                                onClick={() => handleOpenClinic('math', content, 'cognitive_tip', proj.currentGrade, proj.targetGrade)}
                                                                className="flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2.5 py-1 rounded-lg transition-all shadow-xs cursor-pointer"
                                                            >
                                                                <span>🧠</span>
                                                                <span>30초 인지 계산·줄맞춤 훈련 (새 창)</span>
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleOpenClinic('math', content, 'grade_strategy', proj.currentGrade, proj.targetGrade)}
                                                                className="flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-2.5 py-1 rounded-lg transition-all shadow-xs cursor-pointer"
                                                            >
                                                                <span>🎯</span>
                                                                <span>1분 준킬러 실전 문제 풀기 (새 창)</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                )}

                                                {/* 영어 과목 전용 킬러 실전 문제 & 시그널 스캐너 인지 훈련 딥링크 버튼 */}
                                                {proj.subjectId === 'english' && (
                                                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-200/60">
                                                        {isCognitive ? (
                                                            <button
                                                                onClick={() => handleOpenClinic('english', content, 'cognitive_tip', proj.currentGrade, proj.targetGrade)}
                                                                className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-lg transition-all shadow-xs cursor-pointer"
                                                            >
                                                                <span>🧠</span>
                                                                <span>30초 인지 시그널 스캐너 (새 창)</span>
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleOpenClinic('english', content, 'grade_strategy', proj.currentGrade, proj.targetGrade)}
                                                                className="flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-lg transition-all shadow-xs cursor-pointer"
                                                            >
                                                                <span>🎯</span>
                                                                <span>1분 킬러 실전 문제 풀기 (새 창)</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </li>
                                        );
                                    }
                                    return (
                                        <li key={i} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed text-xs sm:text-sm text-slate-700">
                                            {r}
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                            </>
                        )}
                    </div>
                </div>
            ))}
        </div>
        </>
    );
};

export default SubjectSimulationCards;