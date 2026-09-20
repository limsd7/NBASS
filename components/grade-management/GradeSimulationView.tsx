import React, { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { GradeSimulationEngine, SimulationResult } from '../../services/gradeSimulationEngine';
import { GradeRecord, GradeGoal, AssessmentResult, StudentInfo, AIModelConfig } from '../../types';
import { generateAIResponse } from '../../services/aiService';
import { getCareTypeDetail } from '../../data/careTypesData';

interface GradeSimulationViewProps {
    student: StudentInfo;
    records: GradeRecord[];
    goals: GradeGoal[];
    assessment?: AssessmentResult;
    aiModels?: AIModelConfig | null;
}

export const GradeSimulationView: React.FC<GradeSimulationViewProps> = ({ student, records, goals, assessment, aiModels }) => {
    
    const [aiReport, setAiReport] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    // Subject Detail Modal States
    const [selectedSubjectDetail, setSelectedSubjectDetail] = useState<string | null>(null);
    const [subjectAiReports, setSubjectAiReports] = useState<Record<string, string>>({});
    const [isGeneratingSubject, setIsGeneratingSubject] = useState<Record<string, boolean>>({});
    const [viewingDate, setViewingDate] = useState<string | null>(null);
    const [availableDates, setAvailableDates] = useState<string[]>([]);
    
    const latestDate = records.length > 0 ? records[0].examDate : 'no-date';

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
        return (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center">
                <div className="text-4xl mb-4">📈</div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">성적 시뮬레이션 불가</h3>
                <p className="text-slate-500">시뮬레이션을 실행하려면 최소 1개 이상의 성적 기록이 필요합니다.</p>
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
        
        const projectionsText = simulationResult.projections.map(p => 
            `- ${p.subjectName}: 현재 ${p.currentGrade}등급 -> 목표 ${p.targetGrade}등급 (달성확률: ${p.probability}%)
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
        
        const systemContext = `당신은 ${student.name} 학생의 전담 입시/학습 컨설턴트입니다. 항상 따뜻하고 전문적인 어조로 조언해 주세요.`;
        const prompt = `다음은 ${student.name} 학생의 ${proj.subjectName} 과목 분석 결과입니다.

[학생 및 과목 분석 결과]
- 신체/심리 상태(CareType): ${careType}
- 생리적 특징 및 학업 영향: ${careDetail.physiology} / ${careDetail.studyImpact}
- 맞춤 처방: ${careDetail.prescription}
- ${proj.subjectName} 현재 ${proj.currentGrade}등급 -> 목표 ${proj.targetGrade}등급 (목표 달성 확률: ${proj.probability}%)
- 기존 앱이 도출한 예상 병목 요인: ${proj.bottlenecks.join(', ')}
- 기존 앱이 도출한 추천 전략 방향: ${proj.recommendations.join(' / ')}

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

                {/* AI 브리핑 버튼 및 결과 영역 */}
                <div className="mt-6">
                    {!aiReport && !isGenerating && (
                        <button 
                            onClick={handleGenerateReport}
                            disabled={!aiModels?.localModelUrl && !aiModels?.geminiKey && !aiModels?.sonnetKey}
                            className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold transition ${
                                (aiModels?.localModelUrl || aiModels?.geminiKey || aiModels?.sonnetKey) 
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
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-6">수능까지의 예상 성적 궤적</h3>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                            <YAxis reversed domain={[1, 9]} ticks={[1, 2, 3, 4, 5, 6, 7, 8, 9]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} label={{ value: '예상 등급', angle: -90, position: 'insideLeft', fill: '#64748b' }} />
                            <Tooltip 
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                formatter={(value: number, name: string) => {
                                    const proj = simulationResult.projections.find(p => p.subjectId === name);
                                    return [`${value}등급`, proj?.subjectName || name];
                                }}
                            />
                            <Legend iconType="circle" formatter={(value) => simulationResult.projections.find(p => p.subjectId === value)?.subjectName || value} />
                            
                            {simulationResult.projections.map((proj, index) => (
                                <Line 
                                    key={proj.subjectId}
                                    type="monotone" 
                                    dataKey={proj.subjectId} 
                                    name={proj.subjectId} 
                                    stroke={colors[index % colors.length]} 
                                    strokeWidth={3}
                                    activeDot={{ r: 6 }}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Per-subject Analysis */}
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
                                    현재 <strong className="text-slate-700">{proj.currentGrade}등급</strong> → 수능 목표 <strong className="text-blue-600">{proj.targetGrade}등급</strong>
                                </p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <button 
                                    onClick={() => openSubjectDetail(proj.subjectId)}
                                    className="flex items-center gap-1 text-[11px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-md transition-colors"
                                >
                                    <span>📘</span> 상세 공부법
                                </button>
                                <div className="text-right">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase mb-0.5 block">목표 달성 확률</span>
                                    <div className="text-xl font-black leading-none" style={{ color: proj.probability >= 80 ? '#10b981' : proj.probability >= 50 ? '#f59e0b' : '#ef4444' }}>
                                        {proj.probability}%
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 space-y-4">
                            {proj.bottlenecks.length > 0 && (
                                <div className="space-y-2">
                                    <h5 className="text-xs font-bold text-rose-500 uppercase flex items-center gap-1">
                                        <span>⚠️</span> 예상 병목 요인
                                    </h5>
                                    <ul className="text-sm text-slate-600 space-y-1 ml-4 list-disc marker:text-rose-300">
                                        {proj.bottlenecks.map((b, i) => <li key={i}>{b}</li>)}
                                    </ul>
                                </div>
                            )}

                            <div className="space-y-2">
                                <h5 className="text-xs font-bold text-blue-500 uppercase flex items-center gap-1">
                                    <span>💡</span> AI 맞춤 추천 전략
                                </h5>
                                <ul className="text-sm text-slate-600 space-y-1 ml-4 list-disc marker:text-blue-300">
                                    {proj.recommendations.map((r, i) => <li key={i}>{r}</li>)}
                                </ul>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* 과목 상세 공부법 모달 */}
            {selectedSubjectDetail && (
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
                                                                onChange={(e) => handleViewingDateChange(e.target.value)}
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
                                                    <p className="text-sm text-slate-500 mt-0.5">현재 {proj.currentGrade}등급 → 수능 목표 {proj.targetGrade}등급 달성을 위한 맞춤 플랜</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {reportData && !isGeneratingThis && viewingDate === latestDate && (
                                                    <button 
                                                        onClick={() => {
                                                            const printWindow = window.open('', '_blank');
                                                            if (printWindow) {
                                                                const todayStr = new Date().toISOString().slice(0,10);
                                                                const diagnosisCode = `ID-${todayStr.replace(/-/g,'')}-ID-${student.id.slice(0,4)}`;
                                                                
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
                                                                            <p class="text-[11px] text-slate-400">💡 본 상세 공부법 리포트는 차후 유료 회원 전용 프리미엄 기능으로 제공될 예정입니다.</p>
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
                                                        title="인쇄 및 PDF 저장 (추후 유료회원 전용)"
                                                    >
                                                        <span>🖨️</span> 인쇄
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => setSelectedSubjectDetail(null)}
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
                                                    onClick={() => handleGenerateSubjectReport(selectedSubjectDetail)}
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
                                                onClick={() => handleGenerateSubjectReport(selectedSubjectDetail, true)}
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
            )}
        </div>
    );
};
