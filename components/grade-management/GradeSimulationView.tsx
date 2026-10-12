import React, { useMemo, useState } from 'react';
import { GradeSimulationEngine, SimulationResult } from '../../services/gradeSimulationEngine';
import { GradeRecord, GradeGoal, AssessmentResult, StudentInfo, AIModelConfig } from '../../types';
import { generateAIResponse } from '../../services/aiService';
import { getCareTypeDetail } from '../../data/careTypesData';
import { SimulationTrajectoryChart } from './simulation/SimulationTrajectoryChart';
import { SubjectSimulationCards } from './simulation/SubjectSimulationCards';
import { SubjectDetailModal } from './simulation/SubjectDetailModal';
import { ClinicFullscreenModals } from './simulation/ClinicFullscreenModals';

interface GradeSimulationViewProps {
    student: StudentInfo;
    records: GradeRecord[];
    goals: GradeGoal[];
    assessment?: AssessmentResult;
    aiModels?: AIModelConfig | null;
    onOpenInputModal?: () => void; // 제외 과목 등급 입력 유도용 (미전달 시 버튼 미표시)
}

export const GradeSimulationView: React.FC<GradeSimulationViewProps> = ({ student, records, goals, assessment, aiModels, onOpenInputModal }) => {

    const [aiReport, setAiReport] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    // Subject Detail Modal States
    const [selectedSubjectDetail, setSelectedSubjectDetail] = useState<string | null>(null);
    const [subjectAiReports, setSubjectAiReports] = useState<Record<string, string>>({});
    const [isGeneratingSubject, setIsGeneratingSubject] = useState<Record<string, boolean>>({});
    const [viewingDate, setViewingDate] = useState<string | null>(null);
    const [availableDates, setAvailableDates] = useState<string[]>([]);

    // 과목 전용 AI 클리닉 앱 뷰 상태 (새 창 열기 + 폴백 모달 지원)
    const [openClinicSubject, setOpenClinicSubject] = useState<{
        subjectId: string;
        strategyTag?: string;
        strategyType?: 'grade_strategy' | 'cognitive_tip';
        currentGrade?: number;
        targetGrade?: number;
    } | null>(null);

    // 최신 시험일 (정렬 보장 + 날짜 정규화 — 미정렬 records[0] 의존 금지)
    const latestDate = useMemo(() => {
        const sorted = [...records]
            .filter(r => r && Number.isFinite(new Date(r.examDate as string).getTime()))
            .sort((a, b) => new Date(b.examDate).getTime() - new Date(a.examDate).getTime());
        const top = sorted[0]?.examDate;
        if (typeof top === 'string' && /^\d{4}-\d{2}-\d{2}/.test(top)) return top.slice(0, 10);
        if (top) {
            const t = new Date(top).toISOString().slice(0, 10);
            return t;
        }
        return 'no-date';
    }, [records]);

    const handleOpenClinic = (
        subjectId: string,
        strategyTag?: string,
        strategyType: 'grade_strategy' | 'cognitive_tip' = 'grade_strategy',
        currentGrade: number = 2,
        targetGrade: number = 1
    ) => {
        // 새 창 열기 시도
        try {
            const appName = subjectId === 'math' ? 'math_clinic' : subjectId === 'english' ? 'english_clinic' : 'korean_clinic';
            const params = new URLSearchParams({
                view: 'app',
                app: appName,
                subjectId,
                strategyTag: strategyTag || '',
                strategyType,
                currentGrade: String(currentGrade),
                targetGrade: String(targetGrade)
            });
            const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
            const newWin = window.open(url, '_blank', 'width=1280,height=880,menubar=no,toolbar=no,location=no');

            // 팝업이 브라우저에서 차단되었거나 실패한 경우 내부 풀스크린 모달로 즉시 전환
            if (!newWin || newWin.closed || typeof newWin.closed === 'undefined') {
                setOpenClinicSubject({
                    subjectId,
                    strategyTag,
                    strategyType,
                    currentGrade,
                    targetGrade
                });
            }
        } catch (e) {
            setOpenClinicSubject({
                subjectId,
                strategyTag,
                strategyType,
                currentGrade,
                targetGrade
            });
        }
    };

    const simulationResult = useMemo(() => {
        return GradeSimulationEngine.simulate(
            records,
            goals,
            assessment,
            student.focusSubjects || (student.weakSubject ? [student.weakSubject] : []),
            student.selectedSubjects || ['korean', 'math', 'english'],
            student
        );
    }, [records, goals, assessment, student]);

    if (!simulationResult || simulationResult.projections.length === 0) {
        const excluded = simulationResult?.excludedSubjects || [];
        return (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center">
                <div className="text-4xl mb-4">📈</div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">성적 시뮬레이션 불가</h3>
                <p className="text-slate-500">
                    {excluded.length > 0
                        ? '모든 과목이 등급 미입력 등으로 제외되었습니다. 아래 과목에 등급을 입력하면 시뮬레이션이 실행됩니다.'
                        : '시뮬레이션을 실행하려면 최소 1개 이상의 성적 기록이 필요합니다.'}
                </p>
                {excluded.length > 0 && (
                    <div className="mt-4 inline-block text-left text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                        {excluded.map(e => (
                            <div key={e.subjectId} className="py-0.5">
                                <span className="font-bold">{e.subjectName}</span>
                                <span className="text-slate-400"> — {e.reason}</span>
                            </div>
                        ))}
                    </div>
                )}
                {onOpenInputModal && (
                    <div className="mt-4">
                        <button
                            onClick={onOpenInputModal}
                            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
                        >
                            성적 입력하기 →
                        </button>
                    </div>
                )}
            </div>
        );
    }

    // Prepare chart data
    const chartData = simulationResult.months.map((month, index) => {
        const point: any = { month };
        simulationResult.projections.forEach(proj => {
            point[proj.subjectId] = proj.trajectory[index];
        });
        return point;
    });

    const handleGenerateReport = async () => {
        if (!aiModels || isGenerating) return;
        setIsGenerating(true);
        setAiReport(null);

        const careDetail = getCareTypeDetail(assessment?.careType);
        const careType = assessment?.careType ? `${careDetail.emoji} ${careDetail.title} (${careDetail.subtitle})` : '알 수 없음';

        const nameOf = (subjectId: string) =>
            simulationResult.projections.find(p => p.subjectId === subjectId)?.subjectName || subjectId;
        const commonSection = [
            ...(simulationResult.commonBottlenecks || []).map(c =>
                `- (공통 병목) ${c.text} [해당: ${c.subjectIds.map(nameOf).join(', ')}]`),
            ...(simulationResult.commonRecommendations || []).map(c =>
                `- (공통 전략) ${c.text} [해당: ${c.subjectIds.map(nameOf).join(', ')}]`),
        ].join('\n');

        const projectionsText = simulationResult.projections.map(p =>
            `- ${p.subjectName}: 현재 ${p.currentGrade}등급${p.gradeEstimated ? '(원점수 기반 추정치)' : ''} -> 목표 ${p.targetGrade}등급 (달성확률: ${p.probability}%)
              보완점: ${p.bottlenecks.join(', ')}
              전략: ${p.recommendations.join(' / ')}`
        ).join('\n');

        const systemContext = `당신은 ${student.name} 학생의 전담 입시/학습 컨설턴트입니다. 항상 따뜻하고 전문적인 어조로 학부모님께 브리핑을 해주세요.`;
        const prompt = `다음은 ${student.name} 학생의 성적 시뮬레이션 결과입니다.

[학생 정보]
- 신체/심리 상태(CareType): ${careType}
- 임상 처방: ${careDetail.prescription}
- 전체 의견: ${simulationResult.overallAdvice}
- 공통 전략: ${simulationResult.globalStrategies.join(', ')}

[과목별 예측]
${projectionsText}
${commonSection ? `\n[전 과목 공통 분석 (중복 제거됨)]\n${commonSection}\n` : ''}
위 데이터를 바탕으로 학부모님이 읽기 좋은 '종합 브리핑 리포트'를 3~4문단으로 작성해 주세요. 전문적인 분석과 따뜻한 격려를 포함하고, CareType(현재 상태)을 고려한 맞춤형 조언을 꼭 넣어주세요.`;

        const response = await generateAIResponse(prompt, systemContext, aiModels, student.membershipTier || 'free');
        setAiReport(response.text || response.error || '리포트 생성에 실패했습니다.');
        setIsGenerating(false);
    };

    const handleGenerateSubjectReport = async (subjectId: string, forceRegenerate = false) => {
        if (!aiModels) return;
        if (isGeneratingSubject[subjectId] && !forceRegenerate) return;
        if (subjectAiReports[subjectId] && !forceRegenerate) return;

        setIsGeneratingSubject(prev => ({ ...prev, [subjectId]: true }));

        const proj = simulationResult.projections.find(p => p.subjectId === subjectId);
        if (!proj) return;

        const careDetail = getCareTypeDetail(assessment?.careType);
        const careType = assessment?.careType ? `${careDetail.emoji} ${careDetail.title} (${careDetail.subtitle})` : '알 수 없음';

        const subjectCommon = [
            ...(simulationResult.commonBottlenecks || [])
                .filter(c => c.subjectIds.includes(subjectId))
                .map(c => `(공통 병목) ${c.text}`),
            ...(simulationResult.commonRecommendations || [])
                .filter(c => c.subjectIds.includes(subjectId))
                .map(c => `(공통 전략) ${c.text}`),
        ];

        const systemContext = `당신은 ${student.name} 학생의 전담 입시/학습 컨설턴트입니다. 항상 따뜻하고 전문적인 어조로 조언해 주세요.`;
        const prompt = `다음은 ${student.name} 학생의 ${proj.subjectName} 과목 분석 결과입니다.

[학생 및 과목 분석 결과]
- 신체/심리 상태(CareType): ${careType}
- 생리적 특징 및 학업 영향: ${careDetail.physiology} / ${careDetail.studyImpact}
- 맞춤 처방: ${careDetail.prescription}
- ${proj.subjectName} 현재 ${proj.currentGrade}등급 -> 목표 ${proj.targetGrade}등급 (목표 달성 확률: ${proj.probability}%)
- 기존 앱이 도출한 예상 병목 요인: ${proj.bottlenecks.join(', ')}
- 기존 앱이 도출한 추천 전략 방향: ${proj.recommendations.join(' / ')}
${subjectCommon.length > 0 ? `- 전 과목 공통 분석 (해당 과목 포함): ${subjectCommon.join(' / ')}` : ''}

위 분석 결과를 바탕으로, 해당 학생이 당장 실천할 수 있는 가장 효과적이고 구체적인 [${proj.subjectName} 상세 공부법]을 작성해 주세요. 
반드시 다음 목차를 포함하여 작성해 주세요:
1. 현재 문제점 분석 (병목 요인 기반)
2. 주간 공부 루틴 및 구체적 학습법
3. 인지/심리적 상태(CareType)를 고려한 멘탈 관리 및 시험 당일 팁

줄바꿈과 글머리 기호(볼드 등)를 적절히 사용하여 가독성 있게 3~4문단 길이로 작성해 주세요.`;

        const response = await generateAIResponse(prompt, systemContext, aiModels, student.membershipTier || 'free');
        const text = response.text || response.error || '리포트 생성에 실패했습니다.';
        setSubjectAiReports(prev => ({ ...prev, [subjectId]: text }));

        // 로컬 스토리지에 캐싱하여 다음에도 바로 볼 수 있도록 저장 (시험 날짜 기준)
        if (!response.error) {
            localStorage.setItem(`ai_plan_${student.id}_${subjectId}_${latestDate}`, text);
            setAvailableDates(prev => {
                if (prev.includes(latestDate)) return prev;
                return [latestDate, ...prev].sort((a, b) => b.localeCompare(a));
            });
        }

        setIsGeneratingSubject(prev => ({ ...prev, [subjectId]: false }));
    };

    const openSubjectDetail = (subjectId: string) => {
        setSelectedSubjectDetail(subjectId);
        setViewingDate(latestDate);

        // 로컬 스토리지에서 이전 기록 날짜들 탐색
        const prefix = `ai_plan_${student.id}_${subjectId}_`;
        const dates: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(prefix)) {
                dates.push(key.substring(prefix.length));
            }
        }
        dates.sort((a, b) => b.localeCompare(a));
        setAvailableDates(dates);

        let reportData = subjectAiReports[subjectId];
        // 메모리에 없으면 로컬 스토리지에서 먼저 확인 (최신 시험 날짜 기준)
        if (!reportData) {
            const cached = localStorage.getItem(`${prefix}${latestDate}`);
            if (cached) {
                reportData = cached;
                setSubjectAiReports(prev => ({ ...prev, [subjectId]: cached }));
            }
        }

        // 열 때 아직 리포트가 없고 모델이 설정되어 있다면 자동 생성
        if (!reportData && aiModels && (aiModels.localModelUrl || aiModels.geminiKey || aiModels.sonnetKey)) {
            handleGenerateSubjectReport(subjectId);
        }
    };

    const handleViewingDateChange = (date: string) => {
        if (!selectedSubjectDetail) return;
        setViewingDate(date);
        const prefix = `ai_plan_${student.id}_${selectedSubjectDetail}_`;
        const cached = localStorage.getItem(`${prefix}${date}`);
        if (cached) {
            setSubjectAiReports(prev => ({ ...prev, [selectedSubjectDetail]: cached }));
        } else {
            // 캐시 미스 시 이전 날짜 본문 잔류 금지 — 비우고 AI 설정이 있으면 재생성
            setSubjectAiReports(prev => {
                const next = { ...prev };
                delete next[selectedSubjectDetail];
                return next;
            });
            if (aiModels && (aiModels.localModelUrl || aiModels.geminiKey || aiModels.sonnetKey)) {
                handleGenerateSubjectReport(selectedSubjectDetail);
            }
        }
    };

    const renderSimpleMarkdown = (text: string) => {
        return text.split('\n').map((line, i) => {
            if (line.trim() === '') return <br key={i} />;
            let formattedLine = line;
            // 간단한 볼드 처리
            const parts = formattedLine.split(/(\*\*.*?\*\*)/g);
            return (
                <p key={i} className="mb-2">
                    {parts.map((part, j) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={j} className="font-bold text-white bg-blue-900/30 px-1 rounded">{part.slice(2, -2)}</strong>;
                        }
                        return part;
                    })}
                </p>
            );
        });
    };

    const colors = ['#2563eb', '#16a34a', '#dc2626', '#d97706', '#7c3aed', '#0891b2', '#be123c'];

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
                <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                    <span>🎯</span> AI 성적 향상 시뮬레이션
                </h2>
                <p className="text-blue-100 text-sm">
                    학생의 인지 성능, 학습 효율성, 그리고 목표 설정 데이터를 종합하여 수능까지의 성적 변화를 예측합니다.
                </p>
                <p className="text-[11px] text-blue-200/80 mt-1">
                    ※ 달성 확률(%)은 목표·검사 데이터 기반 추정치이며 실제 결과를 보장하지 않습니다.
                </p>
                {simulationResult.excludedSubjects && simulationResult.excludedSubjects.length > 0 && (
                    <div className="mt-4 bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20">
                        <p className="text-xs text-blue-100 leading-relaxed">
                            <span className="font-bold text-amber-200">📋 시뮬레이션 제외 과목:</span>{' '}
                            {simulationResult.excludedSubjects.map(e => `${e.subjectName}(${e.reason})`).join(', ')} — 등급이 입력된 과목만 분석됩니다.
                            {onOpenInputModal && (
                                <button
                                    onClick={onOpenInputModal}
                                    className="ml-2 px-2.5 py-1 bg-white text-blue-700 text-[11px] font-bold rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                                >
                                    성적 입력하기 →
                                </button>
                            )}
                        </p>
                    </div>
                )}
                <div className="mt-4 bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20">
                    <p className="font-bold">{simulationResult.overallAdvice}</p>
                </div>
                {simulationResult.globalStrategies && simulationResult.globalStrategies.length > 0 && (
                    <div className="mt-4 bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20">
                        <h3 className="text-sm font-black text-blue-100 uppercase mb-2 flex items-center gap-2">
                            <span>💡</span> 공통 맞춤 전략 (Global Strategy)
                        </h3>
                        <ul className="text-sm text-white space-y-1 ml-4 list-disc marker:text-blue-300">
                            {simulationResult.globalStrategies.map((strategy, idx) => (
                                <li key={idx}>{strategy}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {simulationResult.careTypeSummary && (
                    <div className="mt-4 bg-white/15 rounded-xl p-4 backdrop-blur-md border border-white/30 text-white">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-black text-amber-200 uppercase flex items-center gap-2">
                                <span>🧠</span> 12대 두뇌·신체 맞춤 케어 처방 (CareType 솔루션)
                            </h3>
                            <span className="text-[11px] bg-amber-400/25 text-amber-100 border border-amber-300/40 px-2.5 py-0.5 rounded-full font-bold">
                                {simulationResult.careTypeSummary.emoji} {simulationResult.careTypeSummary.title}
                            </span>
                        </div>
                        <p className="text-xs text-blue-100 mb-2 font-medium">
                            {simulationResult.careTypeSummary.subtitle}
                        </p>
                        <div className="bg-slate-900/40 rounded-lg p-3 text-xs sm:text-sm text-slate-100 border border-white/10 leading-relaxed">
                            <strong className="text-amber-300 font-bold">[주요 임상 처방]</strong> {simulationResult.careTypeSummary.prescription}
                            {simulationResult.careTypeSummary.secondaryTitle && (
                                <div className="mt-2 pt-2 border-t border-white/10">
                                    <strong className="text-cyan-300 font-bold">[{simulationResult.careTypeSummary.secondaryEmoji || '🔄'} {simulationResult.careTypeSummary.secondaryTitle} 복합 처방]</strong> {simulationResult.careTypeSummary.secondaryPrescription}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* AI 브리핑 버튼 및 결과 영역 */}
                <div className="mt-6">
                    {!aiReport && !isGenerating && (
                        <button
                            onClick={handleGenerateReport}
                            disabled={!aiModels?.localModelUrl && !aiModels?.geminiKey && !aiModels?.sonnetKey}
                            className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold transition ${(aiModels?.localModelUrl || aiModels?.geminiKey || aiModels?.sonnetKey)
                                    ? 'bg-white text-blue-700 hover:bg-blue-50 shadow'
                                    : 'bg-white/20 text-blue-200 cursor-not-allowed border border-white/20'
                                }`}
                        >
                            <span>🤖</span> 학부모를 위한 AI 종합 브리핑 리포트 생성 (Gemma/LLM)
                        </button>
                    )}

                    {isGenerating && (
                        <div className="flex flex-col items-center justify-center py-8 bg-white/5 rounded-xl border border-white/10">
                            <div className="w-8 h-8 border-4 border-blue-200 border-t-white rounded-full animate-spin mb-4"></div>
                            <p className="text-sm font-bold text-blue-100">AI가 학생의 데이터를 종합하여 리포트를 작성하고 있습니다...</p>
                        </div>
                    )}

                    {aiReport && !isGenerating && (
                        <div className="bg-slate-900/60 backdrop-blur-md rounded-xl p-6 border border-blue-400/30 shadow-inner">
                            <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
                                <h3 className="text-lg font-black text-blue-300 flex items-center gap-2">
                                    <span>🤖</span> 학부모 종합 브리핑 리포트
                                </h3>
                                <button onClick={() => setAiReport(null)} className="text-xs px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg transition">다시 생성</button>
                            </div>
                            <div className="text-sm text-blue-50 leading-relaxed">
                                {renderSimpleMarkdown(aiReport)}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Chart */}
            <SimulationTrajectoryChart chartData={chartData} simulationResult={simulationResult} colors={colors} />

            {/* Per-subject Analysis */}
            <SubjectSimulationCards
                simulationResult={simulationResult}
                student={student}
                handleOpenClinic={handleOpenClinic}
                onOpenSubjectDetail={openSubjectDetail}
            />

            {/* 과목 상세 공부법 모달 */}
            {selectedSubjectDetail && (
                <SubjectDetailModal
                    selectedSubjectDetail={selectedSubjectDetail}
                    simulationResult={simulationResult}
                    isGeneratingSubject={isGeneratingSubject}
                    subjectAiReports={subjectAiReports}
                    aiModels={aiModels}
                    availableDates={availableDates}
                    viewingDate={viewingDate}
                    latestDate={latestDate}
                    student={student}
                    onViewingDateChange={handleViewingDateChange}
                    onGenerateSubjectReport={handleGenerateSubjectReport}
                    renderSimpleMarkdown={renderSimpleMarkdown}
                    onClose={() => setSelectedSubjectDetail(null)}
                />
            )}

            {/* 국어/수학/영어 과목 전용 AI 클리닉 앱 풀스크린 모달 */}
            <ClinicFullscreenModals
                openClinicSubject={openClinicSubject}
                student={student}
                aiModels={aiModels}
                onClose={() => setOpenClinicSubject(null)}
            />
        </div>
    );
};
