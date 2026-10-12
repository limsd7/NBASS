import React, { useState, useEffect } from 'react';
import { StudentInfo, GradeRecord, GradeGoal, AssessmentResult, AIModelConfig, LadderStageLevel } from '../../types';
import { unifiedSyncService as DatabaseService } from '../../services/unifiedSyncService';
import { resolveEffectiveStudentId } from '../../services/studentIdentity';
import { SUNEUNG_SUBJECTS } from '../../data/suneungSubjects';
import { GradeInputModal } from './GradeInputModal';
import { GradeSimulationView } from './GradeSimulationView';
import { CorrelationHeatmap } from './CorrelationHeatmap';
import { DDayRoadmap } from './DDayRoadmap';
import { ParentReportModal } from './ParentReportModal';
import { ActionPlanCalendar } from './ActionPlanCalendar';
import { PeerBenchmarkingChart } from './PeerBenchmarkingChart';
import { UniversityPredictionView } from './UniversityPredictionView';
import { GradeSimulationEngine } from '../../services/gradeSimulationEngine';
import { detectGradeDrop } from '../../services/gradeDropDetector';
import {
    parseCsv,
    rowsToGradeRecords,
    sameExamKey,
    buildExportCsv,
} from '../../services/gradeCsv';
import { PaywallOverlay } from '../ui/PaywallOverlay';
import { MembershipTier, normalizeTier } from '../../utils/featureGate';
import { GradeManualModal } from './GradeManualModal';
import { StudyDashboard } from './StudyDashboard';
import { StudyGradeManager } from './StudyGradeManager';
import { StudyGoalsAndAIPlan } from './StudyGoalsAndAIPlan';
import { NeuroStudyLadderModal } from './NeuroStudyLadderModal';
import { NeuroRoadmapStudio } from './NeuroRoadmapStudio';
import { NeuroStudyLadderCenter } from './NeuroStudyLadderCenter';

interface GradeManagementViewProps {
    student: StudentInfo;
    onBack: () => void;
    currentAssessment?: AssessmentResult;
    aiModels?: AIModelConfig | null;
    membershipTier?: MembershipTier;
    onUpgradeClick?: (targetTier?: MembershipTier) => void;
    onStartAssessment?: () => void;
}

export const GradeManagementView: React.FC<GradeManagementViewProps> = ({ student, onBack, currentAssessment, aiModels, membershipTier, onUpgradeClick, onStartAssessment }) => {
    const [records, setRecords] = useState<GradeRecord[]>([]);
    const [goals, setGoals] = useState<GradeGoal[]>([]);
    const [isInputModalOpen, setIsInputModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<GradeRecord | null>(null);
    const [activeTab, setActiveTab] = useState<'study_dashboard' | 'ladder_training' | 'study_grades' | 'study_goals' | 'roadmap' | 'simulation' | 'analysis' | 'university'>('study_dashboard');
    const [isParentReportOpen, setIsParentReportOpen] = useState(false);
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);
    const [latestAssessment, setLatestAssessment] = useState<AssessmentResult | undefined>(currentAssessment);

    // 진단 미완료 시 CareType 맞춤으로 보이지 않게 (미검사 HEALTHY 가정 금지)
    const hasAssessment = Boolean(latestAssessment?.careType) &&
        (latestAssessment?.careType as any) !== 'Unassessed' &&
        (latestAssessment?.careType as any) !== 'UNASSESSED' &&
        (latestAssessment?.careType as any) !== '알 수 없음';

    // 성적 하락 감지 → 컨디션 재검사 권고 (P2 루프 닫기)
    const gradeDrop = React.useMemo(() => detectGradeDrop(records), [records]);

    const [ladderModalData, setLadderModalData] = useState<{
        isOpen: boolean;
        subjectName: string;
        unitName: string;
        weakPriority: number;
        initialStage?: LadderStageLevel;
        startReason?: string;
    } | null>(null);

    // 사다리 시작 단계 개인화 (작업기억 점수 기반, 추정치 명시)
    const ladderEntry = React.useMemo(() => {
        const wm: any = (latestAssessment as any)?.workingMemoryResults;
        const score = wm?.score ?? wm?.overallScore;
        if (typeof score === 'number') {
            if (score >= 85) return { stage: 'C' as LadderStageLevel, reason: `작업기억 ${score}점 기반 C단계 시작` };
            if (score >= 70) return { stage: 'B' as LadderStageLevel, reason: `작업기억 ${score}점 기반 B단계 시작` };
        }
        return { stage: 'A' as LadderStageLevel, reason: 'A단계(기본)부터 시작' };
    }, [latestAssessment]);

    const handleOpenLadderModal = (subjectName: string, unitName: string, weakPriority: number = 1) => {
        setLadderModalData({
            isOpen: true,
            subjectName,
            unitName,
            weakPriority,
            initialStage: ladderEntry.stage,
            startReason: ladderEntry.reason
        });
    };

    const selectedSubjectIds = student.selectedSubjects || [];
    const focusSubjectIds = student.focusSubjects || (student.weakSubject ? [student.weakSubject] : []);
    const sortedRecords = [...records].sort((a, b) => new Date(b.examDate).getTime() - new Date(a.examDate).getTime());

    // 목표 관리 및 시뮬레이션에서 사용할 전체 과목 목록:
    // 기본 3과목(국/수/영) + 학생이 선택한 과목 + 성적 기록에 존재하는 과목
    const allRelevantSubjectIds = React.useMemo(() => {
        const baseSubjects = ['korean', 'math', 'english'];
        const recordSubjectIds = records.flatMap(r => r.subjects.map(s => s.subjectId));
        return Array.from(new Set([...baseSubjects, ...selectedSubjectIds, ...recordSubjectIds]));
    }, [selectedSubjectIds, records]);

    const effectiveStudentId = resolveEffectiveStudentId(student);

    const safeUUID = () => {
        if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
            return crypto.randomUUID();
        }
        return `id_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    };

    useEffect(() => {
        loadData();
    }, [student.id, effectiveStudentId]);

    useEffect(() => {
        if (currentAssessment) {
            setLatestAssessment(currentAssessment);
        }
    }, [currentAssessment]);

    const loadData = async () => {
        try {
            const targetId = effectiveStudentId;
            const loadedRecords = await DatabaseService.getGradeRecords(targetId);
            setRecords(loadedRecords);

            const loadedGoals = await DatabaseService.getGradeGoals(targetId);
            setGoals(loadedGoals);

            if (!currentAssessment) {
                const history = await DatabaseService.getHistoryByStudent(targetId);
                if (history && history.length > 0) {
                    setLatestAssessment(history[0]);
                }
            }
        } catch (error) {
            console.error('Failed to load grade data:', error);
        }
    };

    const handleSaveRecord = async (record: GradeRecord) => {
        const recordToSave: GradeRecord = {
            ...record,
            studentId: record.studentId || effectiveStudentId
        };

        if (records.some(r => r.id === recordToSave.id)) {
            await DatabaseService.updateGradeRecord(recordToSave);
        } else {
            await DatabaseService.addGradeRecord(recordToSave);
        }

        // 역피드백: 최신 성적 이력을 AssessmentResult.gradeHistory에 주입 및 HistoryRecord 업데이트
        try {
            const updatedRecords = await DatabaseService.getGradeRecords(effectiveStudentId);
            const history = await DatabaseService.getHistoryByStudent(effectiveStudentId);
            if (history && history.length > 0) {
                const latestHistory = history[0];
                latestHistory.gradeHistory = updatedRecords;
                await DatabaseService.updateHistory(latestHistory);
                setLatestAssessment(latestHistory);
            }
        } catch (e) {
            console.error('Failed to sync gradeHistory into assessment history:', e);
        }

        // Clear AI Study Guide Cache (단건 저장·CSV 반입 공통 헬퍼)
        clearAiCaches();

        await loadData();
        alert('성적이 저장되었습니다. (진단 리포트 연동 및 AI 분석 캐시가 갱신되었습니다)');
    };

    const handleDeleteRecord = async (id: string) => {
        if (confirm('이 성적 기록을 삭제하시겠습니까?')) {
            await DatabaseService.deleteGradeRecord(id);
            try {
                const updatedRecords = await DatabaseService.getGradeRecords(effectiveStudentId);
                const history = await DatabaseService.getHistoryByStudent(effectiveStudentId);
                if (history && history.length > 0) {
                    const latestHistory = history[0];
                    latestHistory.gradeHistory = updatedRecords;
                    await DatabaseService.updateHistory(latestHistory);
                    setLatestAssessment(latestHistory);
                }
            } catch (e) {
                console.error('Failed to sync gradeHistory after delete:', e);
            }
            await loadData();
        }
    };

    // Calculate latest grades
    const latestGrades = new Map<string, number>();
    for (let i = sortedRecords.length - 1; i >= 0; i--) {
        const record = sortedRecords[i];
        record.subjects.forEach(sub => {
            if (sub.grade) latestGrades.set(sub.subjectId, sub.grade);
        });
    }

    // AI 분석 캐시 무효화 (단건 저장·CSV 반입 공통)
    const clearAiCaches = () => {
        localStorage.removeItem(`ai_report_${student.id}_grade_simulation`);
        localStorage.removeItem(`ai_report_${effectiveStudentId}_grade_simulation`);
        const studentIds = Array.from(new Set([student.id, effectiveStudentId]));
        const allKeys: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) allKeys.push(key);
        }
        for (const sid of studentIds) {
            for (const subjectId of allRelevantSubjectIds) {
                const prefix = `ai_plan_${sid}_${subjectId}_`;
                for (const key of allKeys) {
                    if (key.startsWith(prefix)) {
                        localStorage.removeItem(key);
                    }
                }
            }
        }
    };

    const handleExportCSV = () => {
        const { content, filename } = buildExportCsv(sortedRecords, student.name);
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const text = evt.target?.result as string;
                const { records: parsed, imported, skipped, error } = rowsToGradeRecords(
                    parseCsv(text),
                    () => safeUUID(),
                    effectiveStudentId
                );
                if (error) {
                    alert(error);
                    return;
                }
                const existing = await DatabaseService.getGradeRecords(effectiveStudentId);
                for (const p of parsed) {
                    // upsert: 동일 날짜+시험명이면 기존 레코드 갱신 (중복 복제 방지)
                    const dup = existing.find(r => sameExamKey(r, p));
                    if (dup) {
                        const merged = new Map(dup.subjects.map(s => [s.subjectId, s]));
                        for (const s of p.subjects) merged.set(s.subjectId, { ...(merged.get(s.subjectId) || {}), ...s });
                        await DatabaseService.updateGradeRecord({
                            ...dup,
                            examType: p.examType as any,
                            memo: p.memo || dup.memo,
                            subjects: Array.from(merged.values()) as any
                        });
                    } else {
                        const newRecord = {
                            id: safeUUID(),
                            studentId: effectiveStudentId,
                            examName: p.examName,
                            examType: (p.examType as any) || 'other',
                            examDate: p.examDate,
                            memo: p.memo,
                            subjects: p.subjects,
                            createdAt: new Date().toISOString()
                        };
                        await DatabaseService.addGradeRecord(newRecord as any);
                        existing.push(newRecord as any);
                    }
                }
                alert(`CSV 가져오기가 완료되었습니다. (반영 ${imported}건${skipped > 0 ? `, 건너뜀 ${skipped}건` : ''})`);
                clearAiCaches();
                loadData();
            } catch (err) {
                alert('CSV 파일을 처리하는 중 오류가 발생했습니다. 양식을 확인해주세요.');
            }
        };
        reader.readAsText(file, 'utf-8');
        e.target.value = '';
    };

    return (
        <div className="w-full flex flex-col animate-in fade-in duration-500">
            {/* Sub Header Card */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-sm px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onBack}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                        title="검사결과로 돌아가기"
                    >
                        <span>←</span>
                        <span>검사결과로</span>
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-black text-slate-900 dark:text-white">성적 관리 시스템</h1>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">PREMIUM</span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">{student.name} 학생 ({student.grade}) · 목표 대학 및 신경인지 성적 연동 트래킹</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                    <button
                        onClick={() => setIsManualModalOpen(true)}
                        className="px-3.5 py-2 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                        <span>📖</span> 사용매뉴얼
                    </button>
                    <label className="px-3.5 py-2 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs sm:text-sm font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors border border-slate-200 dark:border-slate-600 cursor-pointer flex items-center gap-1.5">
                        <span>📥</span> CSV 가져오기
                        <input type="file" accept=".csv" className="hidden" onChange={handleImportCSV} />
                    </label>
                    <button
                        onClick={handleExportCSV}
                        className="px-3.5 py-2 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs sm:text-sm font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors border border-slate-200 dark:border-slate-600 cursor-pointer flex items-center gap-1.5"
                    >
                        <span>📤</span> CSV 내보내기
                    </button>
                    <button
                        onClick={() => setIsInputModalOpen(true)}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs sm:text-sm font-black shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                        <span>+</span> 성적 수동 입력
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="w-full space-y-6">
                <PaywallOverlay currentTier={membershipTier || (student.membershipTier as MembershipTier) || 'free'} requiredFeature="grade_management" onUpgradeClick={onUpgradeClick}>

                    {/* Tabs — 고대비 & 선명한 프리미엄 네비게이션 */}
                    <div className="bg-white rounded-2xl p-1.5 border border-slate-300 shadow-md flex gap-1.5 overflow-x-auto mb-6">
                        <button
                            onClick={() => setActiveTab('study_dashboard')}
                            className={`flex-1 min-w-[120px] py-3 px-3.5 font-black text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${activeTab === 'study_dashboard'
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-600'
                                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100 font-bold'
                                }`}
                        >
                            <span className="text-base">📊</span>
                            <span>대시보드</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('study_grades')}
                            className={`flex-1 min-w-[120px] py-3 px-3.5 font-black text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${activeTab === 'study_grades'
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-600'
                                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100 font-bold'
                                }`}
                        >
                            <span className="text-base">📝</span>
                            <span>성적 관리</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('study_goals')}
                            className={`flex-1 min-w-[140px] py-3 px-3.5 font-black text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${activeTab === 'study_goals'
                                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25 ring-2 ring-indigo-600'
                                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100 font-bold'
                                }`}
                        >
                            <span className="text-base">🎯</span>
                            <span>목표 &amp; AI 플랜</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('roadmap')}
                            className={`flex-1 min-w-[155px] py-3 px-3.5 font-black text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${activeTab === 'roadmap'
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-600'
                                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100 font-bold'
                                }`}
                        >
                            <span className="text-base">🎓</span>
                            <span>수능 1·2·3년 로드맵</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('ladder_training')}
                            className={`flex-1 min-w-[185px] py-3 px-4 font-black text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${activeTab === 'ladder_training'
                                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25 ring-2 ring-indigo-600'
                                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100 font-bold'
                                }`}
                        >
                            <span className="text-base">🪜</span>
                            <span>국·수·영 6단계 AI 사다리</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('university')}
                            className={`flex-1 min-w-[115px] py-3 px-3.5 font-black text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${activeTab === 'university'
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-600'
                                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100 font-bold'
                                }`}
                        >
                            <span className="text-base">🏫</span>
                            <span>합격 예측</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('simulation')}
                            className={`flex-1 min-w-[125px] py-3 px-3.5 font-black text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${activeTab === 'simulation'
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-600'
                                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100 font-bold'
                                }`}
                        >
                            <span className="text-base">🔮</span>
                            <span>AI 시뮬레이션</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('analysis')}
                            className={`flex-1 min-w-[115px] py-3 px-3.5 font-black text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${activeTab === 'analysis'
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-600'
                                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100 font-bold'
                                }`}
                        >
                            <span className="text-base">📈</span>
                            <span>상세 분석</span>
                        </button>
                    </div>

                    {!hasAssessment && (
                        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 leading-relaxed">
                            <span className="font-black">진단 미완료 안내:</span> 성적 기록은 가능하지만, 신경인지 진단이 없어 CareType 맞춤 분석은 제공되지 않습니다.
                            기본 플랜으로 표시되며, 진단 완료 후 맞춤으로 전환됩니다.
                        </div>
                    )}

                    {gradeDrop.dropped && (
                        <div className="mt-4 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-900 leading-relaxed flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <span className="font-black">📉 성적 하락 감지:</span> {gradeDrop.prevName}(평균 {gradeDrop.prevAvg?.toFixed(1)}등급) → {gradeDrop.latestName}(평균 {gradeDrop.latestAvg?.toFixed(1)}등급), {gradeDrop.delta.toFixed(1)}등급 하락.
                                컨디션 변화가 원인일 수 있습니다.
                            </div>
                            {onStartAssessment && (
                                <button
                                    type="button"
                                    onClick={onStartAssessment}
                                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl transition-colors shrink-0 cursor-pointer"
                                >
                                    컨디션 재검사 받기 →
                                </button>
                            )}
                        </div>
                    )}

                    {activeTab === 'study_dashboard' && (
                        <StudyDashboard
                            student={student}
                            records={records}
                            goals={goals}
                            latestAssessment={latestAssessment}
                            onNavigateTab={(tab) => setActiveTab(tab as any)}
                            onOpenInputModal={() => setIsInputModalOpen(true)}
                            onOpenLadderModal={handleOpenLadderModal}
                        />
                    )}

                    {activeTab === 'ladder_training' && (
                        <NeuroStudyLadderCenter
                            student={student}
                            records={records}
                            careTypeCode={latestAssessment?.careType || 'HEALTHY'}
                            hasAssessment={hasAssessment}
                            onOpenLadderModal={handleOpenLadderModal}
                            onOpenInputModal={() => setIsInputModalOpen(true)}
                        />
                    )}

                    {activeTab === 'study_grades' && (
                        <StudyGradeManager
                            student={student}
                            records={records}
                            onRefresh={loadData}
                            onOpenManualInput={() => setIsInputModalOpen(true)}
                            onOpenLadderModal={handleOpenLadderModal}
                            onEditRecord={(recordId) => {
                                const target = records.find(r => r.id === recordId);
                                if (!target) return;
                                setEditingRecord(target);
                                setIsInputModalOpen(true);
                            }}
                        />
                    )}

                    {activeTab === 'study_goals' && (
                        <StudyGoalsAndAIPlan
                            student={{ ...student, id: effectiveStudentId }}
                            records={records}
                            goals={goals}
                            latestAssessment={latestAssessment}
                            membershipTier={normalizeTier(membershipTier || (student.membershipTier as MembershipTier) || 'free')}
                            onRefreshGoals={loadData}
                        />
                    )}

                    {activeTab === 'roadmap' && (
                        <NeuroRoadmapStudio
                            student={student}
                            careTypeCode={latestAssessment?.careType || 'HEALTHY'}
                            carePrimaryScore={latestAssessment?.classificationResult?.primaryScore}
                            focusSubjectIds={focusSubjectIds}
                            hasAssessment={hasAssessment}
                            records={records}
                            latestGrades={latestGrades}
                            onOpenLadderModal={handleOpenLadderModal}
                        />
                    )}


                    {activeTab === 'simulation' && (
                        <div className="animate-in fade-in duration-300">
                            <PaywallOverlay currentTier={membershipTier || (student.membershipTier as MembershipTier) || 'free'} requiredFeature="grade_simulation" onUpgradeClick={onUpgradeClick || (() => alert('업그레이드가 필요합니다. 관리자에게 문의하세요.'))}>
                                <GradeSimulationView
                                    student={{ ...student, id: effectiveStudentId, selectedSubjects: allRelevantSubjectIds }}
                                    records={sortedRecords}
                                    goals={goals}
                                    assessment={latestAssessment}
                                    aiModels={aiModels}
                                    onOpenInputModal={() => setIsInputModalOpen(true)}
                                />
                            </PaywallOverlay>
                        </div>
                    )}

                    {activeTab === 'university' && (
                        <div className="animate-in fade-in duration-300">
                            <UniversityPredictionView
                                student={student}
                                records={sortedRecords}
                                currentAssessment={latestAssessment}
                            />
                        </div>
                    )}

                    {activeTab === 'analysis' && (
                        <div className="space-y-6 animate-in slide-in-from-bottom-4">
                            <div className="flex justify-between items-end">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800">심층 분석 및 리포트</h2>
                                    <p className="text-sm text-slate-500 mt-1">성적 상관관계, 수능 로드맵 및 학부모 리포트를 제공합니다.</p>
                                </div>
                                <button
                                    onClick={() => setIsParentReportOpen(true)}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm transition-colors flex items-center gap-2"
                                >
                                    <span>📄</span> 학부모 요약 리포트 생성
                                </button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-1">
                                    <DDayRoadmap student={student} />
                                </div>
                                <div className="lg:col-span-2 flex flex-col gap-6">
                                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                        <h3 className="text-lg font-bold text-slate-800 mb-4">과목간 성적 상관관계 히트맵</h3>
                                        <CorrelationHeatmap records={records} selectedSubjectIds={allRelevantSubjectIds} />
                                    </div>
                                    <PeerBenchmarkingChart latestRecord={sortedRecords[0] || null} />
                                </div>
                            </div>
                            <div className="mt-8">
                                <ActionPlanCalendar
                                    simulationResults={GradeSimulationEngine.simulate(
                                        sortedRecords,
                                        goals,
                                        latestAssessment,
                                        student.focusSubjects || [],
                                        allRelevantSubjectIds,
                                        student
                                    )?.projections || []}
                                    student={{ ...student, id: effectiveStudentId }}
                                />
                            </div>
                        </div>
                    )}
                </PaywallOverlay>
            </div>

            <ParentReportModal
                isOpen={isParentReportOpen}
                onClose={() => setIsParentReportOpen(false)}
                student={student}
                records={sortedRecords}
                latestGrades={latestGrades}
                currentAssessment={latestAssessment}
                selectedSubjectIds={allRelevantSubjectIds}
            />

            <GradeManualModal
                isOpen={isManualModalOpen}
                onClose={() => setIsManualModalOpen(false)}
            />

            <GradeInputModal
                isOpen={isInputModalOpen}
                studentId={effectiveStudentId}
                studentGrade={student.grade}
                selectedSubjectIds={allRelevantSubjectIds}
                existingRecord={editingRecord || undefined}
                records={records}
                onClose={() => {
                    setIsInputModalOpen(false);
                    setEditingRecord(null);
                }}
                onSave={handleSaveRecord}
            />

            {ladderModalData?.isOpen && (
                <NeuroStudyLadderModal
                    isOpen={ladderModalData.isOpen}
                    student={student}
                    careTypeCode={latestAssessment?.careType || 'HEALTHY'}
                    hasAssessment={hasAssessment}
                    subjectName={ladderModalData.subjectName}
                    unitName={ladderModalData.unitName}
                    weakPriority={ladderModalData.weakPriority}
                    initialStage={ladderModalData.initialStage}
                    startReason={ladderModalData.startReason}
                    onClose={() => setLadderModalData(null)}
                />
            )}
        </div>
    );
};