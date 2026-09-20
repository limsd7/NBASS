import React, { useState, useEffect } from 'react';
import { StudentInfo, GradeRecord, GradeGoal, AssessmentResult, AIModelConfig } from '../../types';
import { unifiedSyncService as DatabaseService } from '../../services/unifiedSyncService';
import { SUNEUNG_SUBJECTS } from '../../data/suneungSubjects';
import { GradeInputModal } from './GradeInputModal';
import { GradeTrendChart } from './GradeTrendChart';
import { GradeGoalSetting } from './GradeGoalSetting';
import { GradeSimulationView } from './GradeSimulationView';
import { CorrelationHeatmap } from './CorrelationHeatmap';
import { DDayRoadmap } from './DDayRoadmap';
import { ParentReportModal } from './ParentReportModal';
import { ActionPlanCalendar } from './ActionPlanCalendar';
import { PeerBenchmarkingChart } from './PeerBenchmarkingChart';
import { UniversityPredictionView } from './UniversityPredictionView';
import { GradeSimulationEngine } from '../../services/gradeSimulationEngine';
import { useUniversities } from '../../hooks/useUniversities';
import { SearchableSelect } from '../ui/SearchableSelect';
import { PaywallOverlay } from '../ui/PaywallOverlay';
import { MembershipTier } from '../../utils/featureGate';
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
}

export const GradeManagementView: React.FC<GradeManagementViewProps> = ({ student, onBack, currentAssessment, aiModels, membershipTier, onUpgradeClick }) => {
    const [records, setRecords] = useState<GradeRecord[]>([]);
    const [goals, setGoals] = useState<GradeGoal[]>([]);
    const [isInputModalOpen, setIsInputModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<GradeRecord | null>(null);
    const [selectedSubjectForGoal, setSelectedSubjectForGoal] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'study_dashboard' | 'ladder_training' | 'study_grades' | 'study_goals' | 'roadmap' | 'overview' | 'goals' | 'simulation' | 'analysis' | 'university'>('study_dashboard');
    const [isParentReportOpen, setIsParentReportOpen] = useState(false);
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);
    const [latestAssessment, setLatestAssessment] = useState<AssessmentResult | undefined>(currentAssessment);

    const [ladderModalData, setLadderModalData] = useState<{
        isOpen: boolean;
        subjectName: string;
        unitName: string;
        weakPriority: number;
    } | null>(null);

    const handleOpenLadderModal = (subjectName: string, unitName: string, weakPriority: number = 1) => {
        setLadderModalData({
            isOpen: true,
            subjectName,
            unitName,
            weakPriority
        });
    };

    const { universities, isUpdating, lastUpdated, updateUniversities } = useUniversities();

    const [globalUnivId, setGlobalUnivId] = useState<string>('');
    const [globalDeptName, setGlobalDeptName] = useState<string>('');

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

    useEffect(() => {
        loadData();
    }, [student.id]);

    useEffect(() => {
        if (currentAssessment) {
            setLatestAssessment(currentAssessment);
        }
    }, [currentAssessment]);

    const loadData = async () => {
        try {
            const loadedRecords = await DatabaseService.getGradeRecords(student.id);
            setRecords(loadedRecords);

            const loadedGoals = await DatabaseService.getGradeGoals(student.id);
            setGoals(loadedGoals);

            if (!currentAssessment) {
                const history = await DatabaseService.getHistoryByStudent(student.id);
                if (history && history.length > 0) {
                    setLatestAssessment(history[0]);
                }
            }
        } catch (error) {
            console.error('Failed to load grade data:', error);
        }
    };

    const handleSaveRecord = async (record: GradeRecord) => {
        if (records.some(r => r.id === record.id)) {
            await DatabaseService.updateGradeRecord(record);
        } else {
            await DatabaseService.addGradeRecord(record);
        }

        // 역피드백: 최신 성적 이력을 AssessmentResult.gradeHistory에 주입 및 HistoryRecord 업데이트
        try {
            const updatedRecords = await DatabaseService.getGradeRecords(student.id);
            const history = await DatabaseService.getHistoryByStudent(student.id);
            if (history && history.length > 0) {
                const latestHistory = history[0];
                latestHistory.gradeHistory = updatedRecords;
                await DatabaseService.updateHistory(latestHistory);
                setLatestAssessment(latestHistory);
            }
        } catch (e) {
            console.error('Failed to sync gradeHistory into assessment history:', e);
        }

        // Clear AI Study Guide Cache
        localStorage.removeItem(`ai_report_${student.id}_grade_simulation`);
        allRelevantSubjectIds.forEach(subjectId => {
            const prefix = `ai_plan_${student.id}_${subjectId}_`;
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(prefix)) {
                    localStorage.removeItem(key);
                }
            }
        });

        await loadData();
        alert('성적이 저장되었습니다. (진단 리포트 연동 및 AI 분석 캐시가 갱신되었습니다)');
    };

    const handleDeleteRecord = async (id: string) => {
        if (confirm('이 성적 기록을 삭제하시겠습니까?')) {
            await DatabaseService.deleteGradeRecord(id);
            try {
                const updatedRecords = await DatabaseService.getGradeRecords(student.id);
                const history = await DatabaseService.getHistoryByStudent(student.id);
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

    const handleSaveGoal = async (goal: GradeGoal) => {
        await DatabaseService.upsertGradeGoal(goal);
        setSelectedSubjectForGoal(null);
        await loadData();
    };

    const handleDeleteGoal = async (id: string) => {
        if (confirm('이 과목의 목표를 삭제하시겠습니까?')) {
            await DatabaseService.deleteGradeGoal(id);
            setSelectedSubjectForGoal(null);
            await loadData();
        }
    };

    const handleApplyGlobalUniversityGoals = async () => {
        if (!globalUnivId || !globalDeptName) return;
        const univ = universities.find(u => u.id === globalUnivId);
        if (!univ) return;
        const dept = univ.departments.find(d => d.name === globalDeptName);
        if (!dept) return;

        const promises = allRelevantSubjectIds.map(async subjectId => {
            const targetGrade = dept.targetGrades[subjectId] || dept.targetGrades['korean'] || 3;
            const existingGoal = goals.find(g => g.subjectId === subjectId);

            const newGoal: GradeGoal = {
                id: existingGoal?.id || crypto.randomUUID(),
                studentId: student.id,
                subjectId,
                tier3Target: targetGrade,
                tier2Target: Math.max(1, targetGrade + 1),
                tier1Target: Math.max(1, targetGrade + 2),
                currentGrade: latestGrades.get(subjectId),
                memo: `${univ.name} ${dept.name} 진학 목표`
            };
            return DatabaseService.upsertGradeGoal(newGoal);
        });

        await Promise.all(promises);
        await loadData();
        alert(`선택하신 ${univ.name} ${dept.name}의 과목별 목표 등급컷이 모든 과목에 일괄 적용되었습니다.`);
    };

    // Calculate latest grades
    const latestGrades = new Map<string, number>();
    for (let i = sortedRecords.length - 1; i >= 0; i--) {
        const record = sortedRecords[i];
        record.subjects.forEach(sub => {
            if (sub.grade) latestGrades.set(sub.subjectId, sub.grade);
        });
    }

    const handleExportCSV = () => {
        const headers = ['ID', '시험명', '시험유형', '날짜', '메모', ...SUNEUNG_SUBJECTS.map(s => s.name)];
        const rows = sortedRecords.map(r => {
            const baseInfo = [r.id, r.examName, r.examType, r.examDate, (r.memo || '').replace(/,/g, ' ')];
            const subjectGrades = SUNEUNG_SUBJECTS.map(s => {
                const sub = r.subjects.find(sub => sub.subjectId === s.id);
                return sub ? (sub.grade || '') : '';
            });
            return [...baseInfo, ...subjectGrades].join(',');
        });

        const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `성적기록_${student.name}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const text = evt.target?.result as string;
                const lines = text.split('\n');
                if (lines.length <= 1) return;

                const headers = lines[0].split(',');
                for (let i = 1; i < lines.length; i++) {
                    const row = lines[i].split(',');
                    if (row.length < 5 || !row[1]) continue;

                    const subjectsToSave = [];
                    for (let j = 5; j < headers.length; j++) {
                        const subjectName = headers[j]?.trim();
                        const gradeVal = parseInt(row[j]);
                        if (!isNaN(gradeVal) && gradeVal >= 1 && gradeVal <= 9) {
                            const subjId = SUNEUNG_SUBJECTS.find(s => s.name === subjectName)?.id;
                            if (subjId) subjectsToSave.push({ subjectId: subjId, grade: gradeVal });
                        }
                    }

                    if (subjectsToSave.length > 0) {
                        await DatabaseService.addGradeRecord({
                            id: crypto.randomUUID(),
                            studentId: student.id,
                            examName: row[1],
                            examType: (row[2] as any) || 'other',
                            examDate: row[3] || new Date().toISOString().slice(0, 10),
                            memo: row[4] || '',
                            subjects: subjectsToSave,
                            createdAt: new Date().toISOString()
                        });
                    }
                }
                alert('CSV 가져오기가 완료되었습니다.');
                localStorage.removeItem(`ai_report_${student.id}_grade_simulation`);
                loadData();
            } catch (err) {
                alert('CSV 파일을 처리하는 중 오류가 발생했습니다. 양식을 확인해주세요.');
            }
        };
        reader.readAsText(file, 'utf-8');
        e.target.value = '';
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        ←
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">성적 관리 시스템</h1>
                        <p className="text-sm text-slate-500">{student.name} 학생 ({student.grade})</p>
                    </div>
                </div>
                <div className="flex gap-2 items-center">
                    <button
                        onClick={() => setIsManualModalOpen(true)}
                        className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg font-bold shadow-sm transition-colors flex items-center gap-2"
                    >
                        <span>📖</span> 사용매뉴얼
                    </button>
                    <label className="px-4 py-2 bg-white text-slate-700 rounded-lg font-bold shadow-sm hover:bg-slate-50 transition-colors border border-slate-200 cursor-pointer">
                        <span>📥</span> CSV 가져오기
                        <input type="file" accept=".csv" className="hidden" onChange={handleImportCSV} />
                    </label>
                    <button
                        onClick={handleExportCSV}
                        className="px-4 py-2 bg-white text-slate-700 rounded-lg font-bold shadow-sm hover:bg-slate-50 transition-colors border border-slate-200"
                    >
                        <span>📤</span> CSV 내보내기
                    </button>
                    <button
                        onClick={() => setIsInputModalOpen(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold shadow-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <span>+</span> 성적 수동 입력
                    </button>
                </div>
            </div>

            {/* Content — 좌우여백 제거 및 유연한 전체 폭 적용 */}
            <div className="flex-1 px-4 sm:px-6 md:px-8 py-6 w-full space-y-6">
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
                        />
                    )}

                    {activeTab === 'study_goals' && (
                        <StudyGoalsAndAIPlan
                            student={student}
                            records={records}
                            goals={goals}
                            latestAssessment={latestAssessment}
                            membershipTier={membershipTier || (student.membershipTier as MembershipTier) || 'premium'}
                            onRefreshGoals={loadData}
                        />
                    )}

                    {activeTab === 'roadmap' && (
                        <NeuroRoadmapStudio
                            student={student}
                            careTypeCode={latestAssessment?.careType || 'HEALTHY'}
                            records={records}
                            latestGrades={latestGrades}
                            onOpenLadderModal={handleOpenLadderModal}
                        />
                    )}

                    {activeTab === 'overview' && (
                        <div className="space-y-6 animate-in slide-in-from-bottom-4">
                            {/* Chart Section */}
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                <h2 className="text-lg font-bold text-slate-800 mb-6">수능 과목 성적 추이</h2>
                                <GradeTrendChart
                                    records={records}
                                    goals={goals}
                                    selectedSubjectIds={allRelevantSubjectIds}
                                />
                            </div>

                            {/* Recent Exams List */}
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                <h2 className="text-lg font-bold text-slate-800 mb-6">최근 시험 기록</h2>
                                {records.length === 0 ? (
                                    <p className="text-slate-500 text-center py-8">아직 입력된 성적이 없습니다.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {sortedRecords.map(record => (
                                            <div key={record.id} className="border border-slate-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h3 className="font-bold text-slate-800">{record.examName}</h3>
                                                        <p className="text-xs text-slate-500">{record.examDate} · {record.examType}</p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setEditingRecord(record);
                                                                setIsInputModalOpen(true);
                                                            }}
                                                            className="text-xs text-blue-500 hover:text-blue-700 px-2 py-1 bg-blue-50 rounded"
                                                        >
                                                            수정
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteRecord(record.id)}
                                                            className="text-xs text-rose-500 hover:text-rose-700 px-2 py-1 bg-rose-50 rounded"
                                                        >
                                                            삭제
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {record.subjects.map(sub => {
                                                        const info = SUNEUNG_SUBJECTS.find(s => s.id === sub.subjectId);
                                                        if (!info) return null;
                                                        return (
                                                            <div key={sub.subjectId} className="bg-slate-50 px-3 py-2 rounded-lg text-sm border border-slate-100 flex flex-col gap-1.5">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-bold text-slate-700">{info.name}</span>
                                                                    {sub.grade && <span className="text-blue-600 font-bold">{sub.grade}등급</span>}
                                                                    {sub.percentile && <span className="text-slate-400 text-xs">({sub.percentile}%)</span>}
                                                                </div>
                                                                {sub.weakUnits && sub.weakUnits.length > 0 && (
                                                                    <div className="flex flex-wrap items-center gap-1 mt-0.5">
                                                                        <span className="text-[10px] text-slate-400 font-bold">취약:</span>
                                                                        {sub.weakUnits.map((u, uIdx) => (
                                                                            <button
                                                                                key={u}
                                                                                type="button"
                                                                                onClick={() => handleOpenLadderModal(info.name, u, uIdx + 1)}
                                                                                className="px-1.5 py-0.5 rounded bg-white hover:bg-amber-50 text-[10px] font-bold border border-slate-200 hover:border-amber-300 text-slate-700 cursor-pointer flex items-center gap-1 transition-all"
                                                                                title={`${u} 6단계 AI 사다리 훈련 시작`}
                                                                            >
                                                                                <span>{uIdx === 0 ? '🥇1위' : uIdx === 1 ? '🥈2위' : '🥉3위'}</span>
                                                                                <span>{u}</span>
                                                                                <span className="text-amber-500 font-normal">⚡</span>
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                {record.memo && (
                                                    <p className="mt-3 text-sm text-slate-600 bg-slate-50 p-2 rounded">{record.memo}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'goals' && (
                        <div className="space-y-6 animate-in slide-in-from-bottom-4">
                            {selectedSubjectForGoal ? (
                                <GradeGoalSetting
                                    studentId={student.id}
                                    subjectId={selectedSubjectForGoal}
                                    currentGoal={goals.find(g => g.subjectId === selectedSubjectForGoal)}
                                    currentGrade={latestGrades.get(selectedSubjectForGoal)}
                                    onSave={handleSaveGoal}
                                    onDelete={handleDeleteGoal}
                                    onCancel={() => setSelectedSubjectForGoal(null)}
                                />
                            ) : (
                                <div className="space-y-6">
                                    {/* Global University Target Setter */}
                                    <div className="bg-blue-50 p-5 rounded-2xl border border-blue-200 shadow-sm flex flex-col md:flex-row gap-4 items-end">
                                        <div className="flex-1 space-y-2 w-full">
                                            <div className="flex items-center justify-between">
                                                <label className="text-sm font-bold text-blue-800 flex items-center gap-2">
                                                    <span>🎓 목표 대학/학과 기반 자동 설정 (전체 과목 일괄 적용)</span>
                                                </label>
                                                <button
                                                    onClick={updateUniversities}
                                                    disabled={isUpdating}
                                                    className="text-xs flex items-center gap-1 bg-white/60 hover:bg-white text-blue-700 px-2 py-1 rounded-lg border border-blue-200 transition-colors"
                                                >
                                                    {isUpdating ? '🔄 업데이트 중...' : '🔄 대학 DB 최신화'}
                                                </button>
                                            </div>
                                            {lastUpdated && <p className="text-xs text-blue-500">최근 업데이트: {lastUpdated}</p>}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 relative z-50">
                                                <SearchableSelect
                                                    value={globalUnivId}
                                                    onChange={(val) => { setGlobalUnivId(val); setGlobalDeptName(''); }}
                                                    options={universities.map(u => ({ value: u.id, label: u.name }))}
                                                    placeholder="대학 검색..."
                                                />
                                                <SearchableSelect
                                                    value={globalDeptName}
                                                    onChange={setGlobalDeptName}
                                                    options={
                                                        globalUnivId
                                                            ? (universities.find(u => u.id === globalUnivId)?.departments.map(d => ({ value: d.name, label: d.name })) || [])
                                                            : []
                                                    }
                                                    placeholder="학과 검색..."
                                                    disabled={!globalUnivId}
                                                />
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleApplyGlobalUniversityGoals}
                                            disabled={!globalUnivId || !globalDeptName}
                                            className="px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap transition-colors"
                                        >
                                            모든 과목 일괄 적용하기
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {allRelevantSubjectIds.map(subjectId => {
                                            const info = SUNEUNG_SUBJECTS.find(s => s.id === subjectId);
                                            if (!info) return null;

                                            const goal = goals.find(g => g.subjectId === subjectId);
                                            const currentGrade = latestGrades.get(subjectId);
                                            const isFocused = focusSubjectIds.includes(subjectId);

                                            return (
                                                <div key={subjectId} className={`bg-white p-5 rounded-2xl border ${isFocused ? 'border-rose-300 shadow-md' : 'border-slate-200 shadow-sm'} flex flex-col`}>
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="font-bold text-slate-800 text-lg">{info.name}</h3>
                                                            {isFocused && <span className="bg-rose-100 text-rose-600 text-[10px] font-black px-2 py-0.5 rounded uppercase">Focus</span>}
                                                        </div>
                                                        <button
                                                            onClick={() => setSelectedSubjectForGoal(subjectId)}
                                                            className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded"
                                                        >
                                                            목표 {goal ? '수정' : '설정'}
                                                        </button>
                                                    </div>

                                                    <div className="flex-1 space-y-4">
                                                        <div className="flex justify-between items-end border-b border-slate-100 pb-2">
                                                            <span className="text-sm text-slate-500">현재 등급</span>
                                                            <span className="font-bold text-slate-700">{currentGrade ? `${currentGrade}등급` : '데이터 없음'}</span>
                                                        </div>

                                                        {goal ? (
                                                            <div className="space-y-2">
                                                                <div className="flex justify-between items-center text-sm">
                                                                    <span className="text-slate-500">1차 목표</span>
                                                                    <span className="font-bold text-blue-600">{goal.tier1Target}등급</span>
                                                                </div>
                                                                <div className="flex justify-between items-center text-sm">
                                                                    <span className="text-slate-500">2차 목표</span>
                                                                    <span className="font-bold text-indigo-600">{goal.tier2Target}등급</span>
                                                                </div>
                                                                <div className="flex justify-between items-center text-sm">
                                                                    <span className="text-slate-500">최종 목표</span>
                                                                    <span className="font-bold text-emerald-600">{goal.tier3Target}등급</span>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="flex-1 flex items-center justify-center py-4">
                                                                <p className="text-sm text-slate-400 text-center">아직 설정된 목표가 없습니다.<br />우측 상단에서 목표를 설정하세요.</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {allRelevantSubjectIds.length === 0 && (
                                            <div className="col-span-full p-8 text-center bg-white rounded-2xl border border-slate-200">
                                                <p className="text-slate-500">학생 정보에서 응시할 수능 과목을 먼저 선택하거나, 성적을 입력해주세요.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'simulation' && (
                        <div className="animate-in fade-in duration-300">
                            <PaywallOverlay currentTier={membershipTier || (student.membershipTier as MembershipTier) || 'free'} requiredFeature="grade_simulation" onUpgradeClick={onUpgradeClick || (() => alert('업그레이드가 필요합니다. 관리자에게 문의하세요.'))}>
                                <GradeSimulationView
                                    student={{ ...student, selectedSubjects: allRelevantSubjectIds }}
                                    records={sortedRecords}
                                    goals={goals}
                                    assessment={latestAssessment}
                                    aiModels={aiModels}
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
                                    student={student}
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
                studentId={student.id}
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
                    subjectName={ladderModalData.subjectName}
                    unitName={ladderModalData.unitName}
                    weakPriority={ladderModalData.weakPriority}
                    onClose={() => setLadderModalData(null)}
                />
            )}
        </div>
    );
};
