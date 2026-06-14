import React, { useState, useEffect } from 'react';
import { GradeRecord, ExamType, SubjectGrade } from '../../types';
import { SUNEUNG_SUBJECTS } from '../../data/suneungSubjects';
import { MOCK_EXAM_CUTOFFS, getCutoffData } from '../../data/gradeCutoffs';

interface GradeInputModalProps {
    isOpen: boolean;
    studentId: string;
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
    isOpen, studentId, selectedSubjectIds, existingRecord, records = [], onClose, onSave 
}) => {
    const [examName, setExamName] = useState('');
    const [examType, setExamType] = useState<ExamType>('mock_exam');
    const [examDate, setExamDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedExamCutoffId, setSelectedExamCutoffId] = useState<string>('');
    const [memo, setMemo] = useState('');
    const [subjectsData, setSubjectsData] = useState<SubjectGrade[]>([]);

    useEffect(() => {
        if (isOpen) {
            const baseSubjects = ['korean', 'math', 'english'];
            const allSubjectIds = Array.from(new Set([...baseSubjects, ...selectedSubjectIds]));

            if (existingRecord) {
                setExamName(existingRecord.examName);
                setExamType(existingRecord.examType);
                setExamDate(existingRecord.examDate);
                setMemo(existingRecord.memo || '');
                
                const initialData = allSubjectIds.map(id => {
                    const existingSub = existingRecord.subjects.find(s => s.subjectId === id);
                    return existingSub ? { ...existingSub } : {
                        subjectId: id,
                        grade: undefined,
                        rawScore: undefined,
                        standardScore: undefined,
                        percentile: undefined
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
                    percentile: undefined
                }));
                setSubjectsData(initialData);
            }
        }
    }, [isOpen, selectedSubjectIds, existingRecord]);

    if (!isOpen) return null;

    const handleSubjectChange = (subjectId: string, field: keyof SubjectGrade, value: string) => {
        const numValue = value === '' ? undefined : Number(value);
        
        setSubjectsData(prev => prev.map(s => {
            if (s.subjectId === subjectId) {
                const updated = { ...s, [field]: numValue };
                
                // Feature 4: Auto-fill from Cutoff DB if rawScore is updated
                if (field === 'rawScore' && numValue !== undefined && selectedExamCutoffId) {
                    const cutoff = getCutoffData(selectedExamCutoffId, subjectId, numValue);
                    if (cutoff) {
                        updated.grade = cutoff.grade;
                        updated.percentile = cutoff.percentile;
                        updated.standardScore = cutoff.standardScore;
                    }
                }
                
                return updated;
            }
            return s;
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

        const subjectsToSave = subjectsData.filter(s => s.grade !== undefined || s.rawScore !== undefined || s.standardScore !== undefined || s.percentile !== undefined);

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
                                            const mock = MOCK_EXAM_CUTOFFS.find(m => m.examId === e.target.value);
                                            if (mock) {
                                                setExamName(mock.examName);
                                            }
                                        }}
                                        className="w-full px-3 py-2 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-blue-50 text-blue-800"
                                    >
                                        <option value="">직접 입력 (자동완성 안함)</option>
                                        {MOCK_EXAM_CUTOFFS.map(mock => (
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
                        </div>
                    </div>

                    {/* 과목별 성적 입력 */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                        <h3 className="text-sm font-black text-slate-500 uppercase">과목별 성적 (선택한 수능 과목 기준)</h3>
                        
                        {selectedSubjectIds.length === 0 ? (
                            <div className="p-4 bg-amber-50 text-amber-800 rounded-xl border border-amber-200 text-sm">
                                선택된 과목이 없습니다. 학생 등록/설정 화면에서 응시 과목을 먼저 선택해주세요.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {subjectsData.map(subject => {
                                    const info = SUNEUNG_SUBJECTS.find(s => s.id === subject.subjectId);
                                    if (!info) return null;
                                    
                                    return (
                                        <div key={subject.subjectId} className="grid grid-cols-12 gap-3 items-center p-3 hover:bg-slate-50 rounded-xl border border-transparent hover:border-slate-200 transition-colors">
                                            <div className="col-span-12 md:col-span-3 font-bold text-slate-800 flex flex-col">
                                                <span>{info.name}</span>
                                                <span className="text-[10px] text-slate-400 font-normal">만점: {info.maxScore}점</span>
                                            </div>
                                            
                                            <div className="col-span-6 md:col-span-2 space-y-1">
                                                <label className="text-[10px] font-bold text-slate-500 md:hidden">등급</label>
                                                <input 
                                                    type="number" min="1" max="9" placeholder="등급 (1-9)"
                                                    value={subject.grade || ''}
                                                    onChange={e => handleSubjectChange(subject.subjectId, 'grade', e.target.value)}
                                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white"
                                                />
                                            </div>
                                            
                                            <div className="col-span-6 md:col-span-2 space-y-1">
                                                <label className="text-[10px] font-bold text-slate-500 md:hidden">백분위</label>
                                                <input 
                                                    type="number" min="0" max="100" placeholder="백분위"
                                                    value={subject.percentile || ''}
                                                    onChange={e => handleSubjectChange(subject.subjectId, 'percentile', e.target.value)}
                                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white"
                                                />
                                            </div>
                                            
                                            <div className="col-span-6 md:col-span-2 space-y-1">
                                                <label className="text-[10px] font-bold text-slate-500 md:hidden">표준점수</label>
                                                <input 
                                                    type="number" placeholder="표준점수"
                                                    value={subject.standardScore || ''}
                                                    onChange={e => handleSubjectChange(subject.subjectId, 'standardScore', e.target.value)}
                                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white"
                                                />
                                            </div>
                                            
                                            <div className="col-span-6 md:col-span-3 space-y-1">
                                                <label className="text-[10px] font-bold text-slate-500 md:hidden">원점수</label>
                                                <input 
                                                    type="number" min="0" max={info.maxScore} placeholder={`원점수 (/${info.maxScore})`}
                                                    value={subject.rawScore || ''}
                                                    onChange={e => handleSubjectChange(subject.subjectId, 'rawScore', e.target.value)}
                                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white"
                                                />
                                            </div>

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
