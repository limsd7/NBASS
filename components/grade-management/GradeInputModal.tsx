import React, { useState, useEffect, useRef } from 'react';
import { GradeRecord, ExamType, SubjectGrade } from '../../types';
import { SUNEUNG_SUBJECTS } from '../../data/suneungSubjects';
import { getMockExamCutoffs, getCutoffData, ExamCutoff } from '../../data/gradeCutoffs';
import { getUnitsByGradeAndSubject } from '../../data/curriculumUnits';
import { recognizeGradeImage, parseGradeScores, OcrGradeCandidate } from '../../services/gradeOcrService';
import { deriveGradeFromRawScore } from '../../services/gradeSimulationEngine';

interface GradeInputModalProps {
    isOpen: boolean;
    studentId: string;
    studentGrade?: string;
    selectedSubjectIds: string[];
    existingRecord?: GradeRecord;
    records?: GradeRecord[];
    onClose: () => void;
    onSave: (record: GradeRecord) => void;
}

const EXAM_TYPES: { value: ExamType; label: string }[] = [
    { value: 'mock_exam', label: '모의고사' },
    { value: 'midterm', label: '1학기/2학기 중간고사' },
    { value: 'final', label: '1학기/2학기 기말고사' },
    { value: 'suneung', label: '수능' },
    { value: 'practice', label: '자체 모의 평가' },
    { value: 'other', label: '기타' }
];

export const GradeInputModal: React.FC<GradeInputModalProps> = ({ 
    isOpen, studentId, studentGrade, selectedSubjectIds, existingRecord, records = [], onClose, onSave 
}) => {
    const [examName, setExamName] = useState('');
    const [examType, setExamType] = useState<ExamType>('mock_exam');
    const [examDate, setExamDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedExamCutoffId, setSelectedExamCutoffId] = useState<string>('');
    const [availableCutoffs, setAvailableCutoffs] = useState<ExamCutoff[]>(() => getMockExamCutoffs());
    const [targetGradeLevel, setTargetGradeLevel] = useState<string>(studentGrade || '고등학교 3학년');
    const [memo, setMemo] = useState('');
    const [subjectsData, setSubjectsData] = useState<SubjectGrade[]>([]);
    const [ocrStatus, setOcrStatus] = useState<'idle' | 'working' | 'done' | 'error'>('idle');
    const [ocrProgress, setOcrProgress] = useState(0);
    const [ocrCandidates, setOcrCandidates] = useState<(OcrGradeCandidate & { selected: boolean })[]>([]);
    const [ocrError, setOcrError] = useState('');
    const ocrFileRef = useRef<HTMLInputElement>(null);
    // 자동완성된 등급/백분위/표준점수 추적 (컷오프 변경 시 재계산·stale 무효화용, 수동 입력과 구분)
    const autoFilledRef = useRef<Set<string>>(new Set());

    // 원점수 → 등급/백분위/표준점수 파생 (컷오프 DB 우선, 없으면 일반곡선 추정치)
    const deriveFromRawScore = (subjectId: string, rawScore: number): { grade?: number; percentile?: number; standardScore?: number; auto: boolean } => {
        if (selectedExamCutoffId) {
            const cutoff = getCutoffData(selectedExamCutoffId, subjectId, rawScore, availableCutoffs);
            if (cutoff) {
                return { grade: cutoff.grade, percentile: cutoff.percentile, standardScore: cutoff.standardScore, auto: true };
            }
        }
        const derived = deriveGradeFromRawScore(subjectId, rawScore);
        if (derived) {
            return { grade: derived.grade, auto: true };
        }
        return { auto: false };
    };

    useEffect(() => {
        if (isOpen) {
            autoFilledRef.current = new Set();
            setAvailableCutoffs(getMockExamCutoffs());
            const baseSubjects = ['korean', 'math', 'english'];
            const recordSubjectIds = existingRecord ? existingRecord.subjects.map(s => s.subjectId) : [];
            const allSubjectIds = Array.from(new Set([...baseSubjects, ...selectedSubjectIds, ...recordSubjectIds]));

            if (studentGrade) {
                setTargetGradeLevel(studentGrade);
            }

            if (existingRecord) {
                setExamName(existingRecord.examName);
                setExamType(existingRecord.examType);
                setExamDate(existingRecord.examDate);
                setMemo(existingRecord.memo || '');
                
                const initialData = allSubjectIds.map(id => {
                    const existingSub = existingRecord.subjects.find(s => s.subjectId === id);
                    return existingSub ? { ...existingSub, weakUnits: existingSub.weakUnits || [] } : {
                        subjectId: id,
                        grade: undefined,
                        rawScore: undefined,
                        standardScore: undefined,
                        percentile: undefined,
                        weakUnits: []
                    };
                });
                setSubjectsData(initialData);
            } else {
                setExamName('');
                setExamType('mock_exam');
                setExamDate(new Date().toISOString().split('T')[0]);
                setMemo('');
                
                const initialData = allSubjectIds.map(id => ({
                    subjectId: id,
                    grade: undefined,
                    rawScore: undefined,
                    standardScore: undefined,
                    percentile: undefined,
                    weakUnits: []
                }));
                setSubjectsData(initialData);
            }
        }
    }, [isOpen, selectedSubjectIds, existingRecord, studentGrade]);

    if (!isOpen) return null;

    const handleSubjectChange = (subjectId: string, field: keyof SubjectGrade, value: string) => {
        const parsed = value === '' ? undefined : Number(value);
        const numValue = parsed !== undefined && Number.isFinite(parsed) ? parsed : undefined;

        setSubjectsData(prev => prev.map(s => {
            if (s.subjectId === subjectId) {
                const updated = { ...s, [field]: numValue };

                // Feature 4: Auto-fill from Cutoff DB if rawScore is updated
                if (field === 'rawScore' && numValue !== undefined) {
                    const derived = deriveFromRawScore(subjectId, numValue);
                    if (derived.auto) {
                        if (derived.grade !== undefined) updated.grade = derived.grade;
                        if (derived.percentile !== undefined) updated.percentile = derived.percentile;
                        if (derived.standardScore !== undefined) updated.standardScore = derived.standardScore;
                        autoFilledRef.current.add(subjectId);
                    } else if (autoFilledRef.current.has(subjectId)) {
                        // 파생 불가 + 이전 자동완성값 존재 → stale 등급 방치 금지
                        updated.grade = undefined;
                        updated.percentile = undefined;
                        updated.standardScore = undefined;
                        autoFilledRef.current.delete(subjectId);
                    }
                }
                // 수동으로 등급 계열을 고치면 자동완성 추적에서 제외 (덮어쓰기 보호)
                if ((field === 'grade' || field === 'percentile' || field === 'standardScore') && numValue !== undefined) {
                    autoFilledRef.current.delete(subjectId);
                }

                return updated;
            }
            return s;
        }));
    };

    // 컷오프 시험 변경 시: 자동완성분이거나 등급이 비어 있는 과목만 재계산 (수동 입력 보호)
    const recalcAutoFilledGrades = (cutoffId: string) => {
        setSubjectsData(prev => prev.map(s => {
            const raw = s.rawScore;
            if (raw === undefined) return s;
            if (s.grade !== undefined && !autoFilledRef.current.has(s.subjectId)) return s;
            let grade: number | undefined;
            let percentile: number | undefined;
            let standardScore: number | undefined;
            if (cutoffId) {
                const cutoff = getCutoffData(cutoffId, s.subjectId, raw, availableCutoffs);
                if (cutoff) {
                    grade = cutoff.grade;
                    percentile = cutoff.percentile;
                    standardScore = cutoff.standardScore;
                }
            }
            if (grade === undefined) {
                const derived = deriveGradeFromRawScore(s.subjectId, raw);
                if (derived) grade = derived.grade;
            }
            if (grade === undefined) {
                autoFilledRef.current.delete(s.subjectId);
                return s;
            }
            autoFilledRef.current.add(s.subjectId);
            // 일반곡선 폴백 시 컷오프 전용 백분위/표준점수는 비움 (stale 방지)
            return { ...s, grade, percentile, standardScore };
        }));
    };

    const handleSubunitChange = (subjectId: string, subunitName: string, score: number) => {
        setSubjectsData(prev => prev.map(s => {
            if (s.subjectId === subjectId) {
                const updatedSubunits = { ...(s.subunits || {}) };
                if (score === undefined || isNaN(score)) {
                    delete updatedSubunits[subunitName];
                } else {
                    updatedSubunits[subunitName] = { score, maxScore: 100 }; // dummy max score
                }
                return { ...s, subunits: updatedSubunits };
            }
            return s;
        }));
    };

    const toggleWeakUnit = (subjectId: string, unitName: string) => {
        setSubjectsData(prev => prev.map(s => {
            if (s.subjectId === subjectId) {
                const currentWeak = s.weakUnits || [];
                if (currentWeak.includes(unitName)) {
                    return { ...s, weakUnits: currentWeak.filter(u => u !== unitName) };
                } else {
                    if (currentWeak.length >= 3) {
                        alert('취약단원은 최대 3개(1, 2, 3순위)까지 지정할 수 있습니다. 기존 단원을 클릭하여 해제한 후 다시 선택해주세요.');
                        return s;
                    }
                    return { ...s, weakUnits: [...currentWeak, unitName] };
                }
            }
            return s;
        }));
    };

    const handleSave = () => {
        if (!examName.trim()) {
            alert('시험명을 입력해주세요.');
            return;
        }

        // Duplicate Check
        if (!existingRecord) {
            const isDuplicate = records.some(r => r.examDate === examDate && r.examName === examName.trim());
            if (isDuplicate) {
                const proceed = confirm('동일한 날짜와 이름의 시험 기록이 이미 존재합니다. 계속 저장하시겠습니까?');
                if (!proceed) return;
            }
        }

        const subjectsToSave = subjectsData.filter(s =>
            s.grade !== undefined ||
            s.rawScore !== undefined ||
            s.standardScore !== undefined ||
            s.percentile !== undefined ||
            (s.weakUnits && s.weakUnits.length > 0)
        );

        if (subjectsToSave.length === 0) {
            alert('저장할 성적 내용이 없습니다. 최소 1개 과목의 점수·등급·취약단원 중 하나를 입력해주세요.');
            return;
        }

        const parsedDate = new Date(examDate);
        if (!examDate || !Number.isFinite(parsedDate.getTime())) {
            alert('시험 날짜가 올바르지 않습니다. 날짜를 다시 선택해주세요.');
            return;
        }

        for (const s of subjectsToSave) {
            if (s.grade !== undefined && (s.grade < 1 || s.grade > 9)) {
                alert('등급은 1에서 9 사이의 값이어야 합니다.');
                return;
            }
            if (s.percentile !== undefined && (s.percentile < 0 || s.percentile > 100)) {
                alert('백분위는 0에서 100 사이의 값이어야 합니다.');
                return;
            }
            if (s.standardScore !== undefined && (s.standardScore < 0 || s.standardScore > 200)) {
                alert('표준점수는 0에서 200 사이의 값이어야 합니다.');
                return;
            }
            if (s.rawScore !== undefined) {
                const maxScore = SUNEUNG_SUBJECTS.find(sub => sub.id === s.subjectId)?.maxScore || 100;
                if (s.rawScore < 0 || s.rawScore > maxScore) {
                    alert(`원점수는 0에서 ${maxScore} 사이의 값이어야 합니다.`);
                    return;
                }
            }
        }

        const newRecord: GradeRecord = {
            id: existingRecord ? existingRecord.id : crypto.randomUUID(),
            studentId,
            examName,
            examType,
            examDate,
            subjects: subjectsToSave,
            memo,
            createdAt: existingRecord ? existingRecord.createdAt : new Date().toISOString()
        };

        onSave(newRecord);
        onClose();
    };
    const availableSubjects = SUNEUNG_SUBJECTS.filter(s => !subjectsData.some(sd => sd.subjectId === s.id));

    const handleAddSubject = (subjectId: string) => {
        if (!subjectId) return;
        setSubjectsData(prev => [...prev, {
            subjectId,
            grade: undefined,
            rawScore: undefined,
            standardScore: undefined,
            percentile: undefined
        }]);
    };

    const handleOcrFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        setOcrStatus('working');
        setOcrProgress(0);
        setOcrError('');
        setOcrCandidates([]);
        try {
            const text = await recognizeGradeImage(file, setOcrProgress);
            const parsed = parseGradeScores(text);
            if (parsed.length === 0) {
                setOcrStatus('error');
                setOcrError('인식된 과목 점수가 없습니다. 글자가 선명한 사진으로 다시 시도해주세요.');
                return;
            }
            setOcrCandidates(parsed.map(c => ({ ...c, selected: true })));
            setOcrStatus('done');
        } catch (err) {
            console.error('Grade OCR failed:', err);
            setOcrStatus('error');
            setOcrError('사진 인식 중 오류가 발생했습니다. 직접 입력으로 진행해주세요.');
        }
    };

    const applyOcrCandidates = () => {
        const picked = ocrCandidates.filter(c => c.selected);
        if (picked.length === 0) {
            alert('반영할 과목을 1개 이상 선택해주세요.');
            return;
        }
        // 기존 수동 입력값과 충돌 시 덮어쓰기 확인 (OCR 오인식 파괴 방지)
        const conflicts = picked.filter(c => {
            const existing = subjectsData.find(s => s.subjectId === c.subjectId);
            return existing && (
                (existing.rawScore !== undefined && existing.rawScore !== c.rawScore) ||
                existing.grade !== undefined || existing.percentile !== undefined || existing.standardScore !== undefined
            );
        });
        if (conflicts.length > 0) {
            const names = conflicts.map(c => {
                const info = SUNEUNG_SUBJECTS.find(s => s.id === c.subjectId);
                return info?.name || c.subjectId;
            }).join(', ');
            if (!confirm(`다음 과목에 이미 입력된 값이 있습니다: ${names}\nOCR 결과로 덮어쓰시겠습니까? (취소하면 해당 과목은 건너뜁니다)`)) {
                return;
            }
        }
        setSubjectsData(prev => {
            let next = [...prev];
            for (const c of picked) {
                let idx = next.findIndex(s => s.subjectId === c.subjectId);
                if (idx < 0) {
                    next = [...next, {
                        subjectId: c.subjectId,
                        grade: undefined,
                        rawScore: undefined,
                        standardScore: undefined,
                        percentile: undefined,
                        weakUnits: []
                    }];
                    idx = next.length - 1;
                }
                const updated: SubjectGrade = { ...next[idx], rawScore: c.rawScore };
                // 컷오프 DB 우선, 없으면 일반곡선 추정치로 등급 파생 (저장 전 확인 단계라 추정치 표시와 동등)
                const derived = deriveFromRawScore(c.subjectId, c.rawScore);
                if (derived.grade !== undefined) {
                    updated.grade = derived.grade;
                }
                if (derived.percentile !== undefined) updated.percentile = derived.percentile;
                if (derived.standardScore !== undefined) updated.standardScore = derived.standardScore;
                next[idx] = updated;
            }
            return next;
        });
        for (const c of picked) {
            autoFilledRef.current.add(c.subjectId);
        }
        setOcrCandidates([]);
        setOcrStatus('idle');
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-blue-600 text-white">
                    <h2 className="text-xl font-bold">{existingRecord ? '성적 수정' : '새로운 성적 입력'}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        ✕
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 space-y-8 bg-slate-50">
                    {/* 기본 정보 */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                        <h3 className="text-sm font-black text-slate-500 uppercase">시험 정보</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700">시험명 *</label>
                                <input 
                                    type="text" 
                                    value={examName} 
                                    onChange={e => setExamName(e.target.value)}
                                    placeholder="예: 6월 모의평가"
                                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700">유형</label>
                                <select 
                                    value={examType} 
                                    onChange={e => setExamType(e.target.value as ExamType)}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                >
                                    {EXAM_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </select>
                            </div>
                            
                            {examType === 'mock_exam' && (
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 text-blue-600">📊 등급컷 자동완성 대상 시험 (선택)</label>
                                    <select 
                                        value={selectedExamCutoffId} 
                                        onChange={e => {
                                            setSelectedExamCutoffId(e.target.value);
                                            // Automatically update exam name if selecting a known mock
                                            const mock = availableCutoffs.find(m => m.examId === e.target.value);
                                            if (mock) {
                                                setExamName(mock.examName);
                                            }
                                            // 컷오프 변경 시 자동완성분 재계산 (수동 입력은 보호)
                                            recalcAutoFilledGrades(e.target.value);
                                        }}
                                        className="w-full px-3 py-2 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-blue-50 text-blue-800"
                                    >
                                        <option value="">직접 입력 (자동완성 안함)</option>
                                        {availableCutoffs.map(mock => (
                                            <option key={mock.examId} value={mock.examId}>{mock.examName}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700">응시 일자</label>
                                <input 
                                    type="date" 
                                    value={examDate} 
                                    onChange={e => setExamDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-indigo-700 flex items-center gap-1">
                                    <span>📚 교육과정 학년 기준 (단원 자동 로드)</span>
                                </label>
                                <select 
                                    value={targetGradeLevel} 
                                    onChange={e => setTargetGradeLevel(e.target.value)}
                                    className="w-full px-3 py-2 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-indigo-50 text-indigo-900 font-bold text-xs"
                                >
                                    <option value="중학교 (중1~중3 공통/심화)">중학교 (중1~중3 공통/심화)</option>
                                    <option value="고등학교 1학년 (공통수학1 / 공통수학2)">고등학교 1학년 (공통수학1 / 공통수학2)</option>
                                    <option value="고등학교 2~3학년 (수I·수II·미적·확통·기하)">고등학교 2~3학년 (수I·수II·미적·확통·기하)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* 과목별 성적 입력 */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <h3 className="text-sm font-black text-slate-700 uppercase">과목별 성적 (선택한 수능 과목 기준)</h3>
                            <button
                                type="button"
                                onClick={() => ocrFileRef.current?.click()}
                                disabled={ocrStatus === 'working'}
                                className="px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50 cursor-pointer"
                            >
                                {ocrStatus === 'working' ? `📷 인식 중... ${ocrProgress}%` : '📷 성적표 사진 인식'}
                            </button>
                            <input
                                ref={ocrFileRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleOcrFile}
                            />
                        </div>

                        {(ocrStatus === 'error' || ocrCandidates.length > 0) && (
                            <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-2">
                                {ocrStatus === 'error' ? (
                                    <p className="text-xs text-rose-600 font-bold">{ocrError}</p>
                                ) : (
                                    <>
                                        <p className="text-xs font-bold text-indigo-900">
                                            인식 결과 ({ocrCandidates.filter(c => c.selected).length}개 선택) — 반드시 확인 후 반영하세요
                                        </p>
                                        <div className="space-y-1.5">
                                            {ocrCandidates.map(c => (
                                                <label key={c.subjectId} className="flex items-center gap-2 text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={c.selected}
                                                        onChange={() => setOcrCandidates(prev => prev.map(p => p.subjectId === c.subjectId ? { ...p, selected: !p.selected } : p))}
                                                        className="w-4 h-4 accent-indigo-600"
                                                    />
                                                    <span className="font-black text-slate-800">{c.subjectName}</span>
                                                    <span className="font-mono font-bold text-indigo-700">{c.rawScore}점</span>
                                                    <span className="text-slate-400 truncate">/{c.maxScore} · {c.context}</span>
                                                </label>
                                            ))}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={applyOcrCandidates}
                                            className="w-full py-2 text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
                                        >
                                            선택 항목 반영하기
                                        </button>
                                    </>
                                )}
                            </div>
                        )}

                        {/* 4가지 중 1가지 입력 안내 멘트 */}
                        <div className="flex items-start sm:items-center gap-2.5 p-3.5 bg-blue-50/90 border border-blue-200 rounded-xl text-xs text-blue-900 leading-relaxed shadow-sm">
                            <span className="text-base flex-shrink-0">💡</span>
                            <div>
                                <strong className="font-bold text-blue-950">입력 안내:</strong> 등급, 백분위, 표준점수, 원점수 4가지 중 <strong className="text-blue-700 underline underline-offset-2">1가지만 입력해도</strong> 정상 저장됩니다. (모두 채우실 필요 없이 보유하고 계신 점수만 입력하시면 됩니다.)
                            </div>
                        </div>
                        
                        {selectedSubjectIds.length === 0 ? (
                            <div className="p-4 bg-amber-50 text-amber-800 rounded-xl border border-amber-200 text-sm">
                                선택된 과목이 없습니다. 학생 등록/설정 화면에서 응시 과목을 먼저 선택해주세요.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {/* 데스크톱 컬럼 헤더 */}
                                <div className="hidden md:grid grid-cols-12 gap-3 px-3 py-1.5 text-[11px] font-bold text-slate-500 border-b border-slate-100">
                                    <div className="col-span-3">과목</div>
                                    <div className="col-span-2 text-center">등급 (1~9)</div>
                                    <div className="col-span-2 text-center">백분위 (0~100)</div>
                                    <div className="col-span-2 text-center">표준점수</div>
                                    <div className="col-span-3 text-center">원점수</div>
                                </div>
                                {subjectsData.map(subject => {
                                    const info = SUNEUNG_SUBJECTS.find(s => s.id === subject.subjectId)
                                        || { id: subject.subjectId, name: subject.subjectId, maxScore: 100 };
                                    const isCustomId = !SUNEUNG_SUBJECTS.some(s => s.id === subject.subjectId);
                                    
                                    return (
                                        <div key={subject.subjectId} className="grid grid-cols-12 gap-3 items-center p-3 hover:bg-slate-50 rounded-xl border border-transparent hover:border-slate-200 transition-colors">
                                            <div className="col-span-12 md:col-span-3 font-bold text-slate-800 flex flex-col">
                                                <span className="flex items-center gap-2">
                                                    <span>{info.name}</span>
                                                    {isCustomId && (
                                                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">직접 입력</span>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (!confirm(`'${info.name}' 과목을 이 시험 기록에서 제거하시겠습니까?`)) return;
                                                            setSubjectsData(prev => prev.filter(s => s.subjectId !== subject.subjectId));
                                                        }}
                                                        className="ml-auto text-slate-300 hover:text-red-500 text-xs font-bold cursor-pointer"
                                                        title="과목 제거"
                                                    >
                                                        ✕
                                                    </button>
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-normal">만점: {info.maxScore}점</span>
                                            </div>
                                            
                                            <div className="col-span-6 md:col-span-2 space-y-1">
                                                <label className="text-[10px] font-bold text-slate-500 md:hidden">등급</label>
                                                <input 
                                                    type="number" min="1" max="9" placeholder="등급 (1-9)"
                                                    value={subject.grade ?? ''}
                                                    onChange={e => handleSubjectChange(subject.subjectId, 'grade', e.target.value)}
                                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white"
                                                />
                                            </div>
                                            
                                            <div className="col-span-6 md:col-span-2 space-y-1">
                                                <label className="text-[10px] font-bold text-slate-500 md:hidden">백분위</label>
                                                <input 
                                                    type="number" min="0" max="100" placeholder="백분위"
                                                    value={subject.percentile ?? ''}
                                                    onChange={e => handleSubjectChange(subject.subjectId, 'percentile', e.target.value)}
                                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white"
                                                />
                                            </div>
                                            
                                            <div className="col-span-6 md:col-span-2 space-y-1">
                                                <label className="text-[10px] font-bold text-slate-500 md:hidden">표준점수</label>
                                                <input 
                                                    type="number" placeholder="표준점수"
                                                    value={subject.standardScore ?? ''}
                                                    onChange={e => handleSubjectChange(subject.subjectId, 'standardScore', e.target.value)}
                                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white"
                                                />
                                            </div>
                                            
                                            <div className="col-span-6 md:col-span-3 space-y-1">
                                                <label className="text-[10px] font-bold text-slate-500 md:hidden">원점수</label>
                                                <input 
                                                    type="number" min="0" max={info.maxScore} placeholder={`원점수 (/${info.maxScore})`}
                                                    value={subject.rawScore ?? ''}
                                                    onChange={e => handleSubjectChange(subject.subjectId, 'rawScore', e.target.value)}
                                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white"
                                                />
                                            </div>

                                            {/* Feature: 취약단원 TOP 1, 2, 3 선택 영역 */}
                                            {(() => {
                                                const curUnits = getUnitsByGradeAndSubject(targetGradeLevel, subject.subjectId);
                                                if (curUnits.length === 0) return null;
                                                const currentWeak = subject.weakUnits || [];

                                                return (
                                                    <div className="col-span-12 mt-2.5 bg-gradient-to-r from-amber-50/70 to-rose-50/70 p-3.5 rounded-xl border border-amber-200/80">
                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs font-black text-amber-900 flex items-center gap-1">
                                                                    <span>🎯</span> {info.name} 취약 단원 TOP 1·2·3순위 지정
                                                                </span>
                                                                <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full font-bold">
                                                                    선택: {currentWeak.length}/3개
                                                                </span>
                                                            </div>
                                                            <span className="text-[10.5px] text-slate-500">
                                                                클릭 순서대로 <b className="text-rose-600">🥇1순위</b> ➔ <b className="text-amber-600">🥈2순위</b> ➔ <b className="text-blue-600">🥉3순위</b> 지정
                                                            </span>
                                                        </div>

                                                        {/* 단원 칩 선택 목록 */}
                                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                                            {curUnits.map(unit => {
                                                                const rankIndex = currentWeak.indexOf(unit.name);
                                                                const isSelected = rankIndex !== -1;
                                                                const rankNum = rankIndex + 1;

                                                                return (
                                                                    <button
                                                                        key={unit.id}
                                                                        type="button"
                                                                        onClick={() => toggleWeakUnit(subject.subjectId, unit.name)}
                                                                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 border cursor-pointer ${
                                                                            isSelected
                                                                                ? rankNum === 1
                                                                                    ? 'bg-rose-600 text-white border-rose-600 shadow-sm shadow-rose-200'
                                                                                    : rankNum === 2
                                                                                    ? 'bg-amber-500 text-white border-amber-500 shadow-sm shadow-amber-200'
                                                                                    : 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-200'
                                                                                : 'bg-white text-slate-700 border-slate-200 hover:border-amber-300 hover:bg-amber-50/40'
                                                                        }`}
                                                                    >
                                                                        {isSelected && (
                                                                            <span className="text-[10px] font-black px-1 rounded bg-black/20 text-white">
                                                                                {rankNum === 1 ? '🥇 1위' : rankNum === 2 ? '🥈 2위' : '🥉 3위'}
                                                                            </span>
                                                                        )}
                                                                        <span>{unit.name}</span>
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>

                                                        {/* 현재 선택된 취약단원 요약 안내 */}
                                                        {currentWeak.length > 0 && (
                                                            <div className="mt-2.5 pt-2 border-t border-amber-200/60 flex items-center gap-2 flex-wrap text-xs">
                                                                <span className="text-slate-600 font-bold text-[11px]">지정된 우선순위:</span>
                                                                {currentWeak.map((unitName, idx) => (
                                                                    <span key={unitName} className="inline-flex items-center gap-1 font-bold bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-xs">
                                                                        <span className={idx === 0 ? 'text-rose-600' : idx === 1 ? 'text-amber-600' : 'text-blue-600'}>
                                                                            {idx === 0 ? '🥇 1순위' : idx === 1 ? '🥈 2순위' : '🥉 3순위'}
                                                                        </span>
                                                                        <span className="text-slate-800">{unitName}</span>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => toggleWeakUnit(subject.subjectId, unitName)}
                                                                            className="text-slate-400 hover:text-rose-600 ml-0.5 font-bold"
                                                                        >
                                                                            ✕
                                                                        </button>
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })()}

                                            {/* Subunits input for Feature 1 (Collapsible) */}
                                            <div className="col-span-12 mt-2">
                                                <details className="group">
                                                    <summary className="text-xs text-blue-600 cursor-pointer font-bold select-none list-none">
                                                        + 단원별 세부 점수 입력 (선택)
                                                    </summary>
                                                    <div className="text-[10.5px] text-slate-600 bg-blue-50 p-2.5 rounded-md mt-2 border border-blue-100 leading-tight">
                                                        💡 <b>입력 가이드</b>: 해당 단원의 <b>정답률(성취도)</b>을 입력해주세요.<br/>
                                                        <span className="text-slate-500 block mt-1">예) 미적분 파트가 총 30점 만점인데 15점을 획득했다면 👉 <b>50</b> 입력</span>
                                                    </div>
                                                    <div className="pt-2 pl-2 border-l-2 border-blue-200 mt-2 grid grid-cols-2 gap-2">
                                                        <input 
                                                            type="text" 
                                                            placeholder="단원명 (예: 미적분)" 
                                                            className="px-2 py-1 border border-slate-200 rounded text-xs"
                                                            onBlur={(e) => {
                                                                const val = e.target.value;
                                                                if(val && !subject.subunits?.[val]) {
                                                                    handleSubunitChange(subject.subjectId, val, 0);
                                                                    e.target.value = '';
                                                                }
                                                            }}
                                                        />
                                                        <div className="flex gap-2 flex-wrap">
                                                            {Object.entries(subject.subunits || {}).map(([unitName, data]) => (
                                                                <div key={unitName} className="flex items-center gap-1.5 bg-slate-100 px-2 py-1.5 rounded-md text-xs border border-slate-200">
                                                                    <span className="font-bold text-slate-700">{unitName}</span>
                                                                    <div className="flex items-center gap-1 bg-white border border-blue-300 rounded px-1 py-0.5 shadow-inner">
                                                                        <input 
                                                                            type="number" 
                                                                            value={data.score || ''} 
                                                                            onChange={e => handleSubunitChange(subject.subjectId, unitName, parseInt(e.target.value))}
                                                                            className="w-10 text-center bg-transparent outline-none font-bold text-blue-600" 
                                                                            placeholder="0"
                                                                        />
                                                                        <span className="text-[10px] text-slate-400 font-bold">%</span>
                                                                    </div>
                                                                    <button onClick={() => handleSubunitChange(subject.subjectId, unitName, NaN)} className="text-rose-400 hover:text-rose-600 font-bold ml-0.5 transition-colors">✕</button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </details>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {availableSubjects.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center gap-3">
                                <label className="text-xs font-bold text-slate-500 uppercase whitespace-nowrap">과목 추가</label>
                                <select 
                                    onChange={e => {
                                        handleAddSubject(e.target.value);
                                        e.target.value = '';
                                    }}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white outline-none"
                                    defaultValue=""
                                >
                                    <option value="" disabled>추가할 과목을 선택하세요...</option>
                                    {availableSubjects.map(s => (
                                        <option key={s.id} value={s.id}>
                                            [{s.category === 'social' ? '사탐' : s.category === 'science' ? '과탐' : s.category === 'foreign' ? '제2외' : s.category === 'required' ? '필수' : '공통'}] {s.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700">메모 / 특이사항</label>
                        <textarea 
                            value={memo} 
                            onChange={e => setMemo(e.target.value)}
                            placeholder="이번 시험의 특징이나 아쉬운 점 등을 자유롭게 남겨주세요."
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl h-24 resize-none focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>

                <div className="p-6 border-t border-slate-100 flex gap-4 bg-white">
                    <button onClick={onClose} className="flex-1 py-3 font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">
                        취소
                    </button>
                    <button onClick={handleSave} className="flex-1 py-3 font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-lg">
                        성적 저장하기
                    </button>
                </div>
            </div>
        </div>
    );
};
