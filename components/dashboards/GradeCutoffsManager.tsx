import React, { useState, useEffect } from 'react';
import { 
    ExamCutoff, 
    getMockExamCutoffs, 
    saveMockExamCutoffs, 
    resetMockExamCutoffs, 
    generateMockCurve,
    DEFAULT_MOCK_EXAM_CUTOFFS 
} from '../../data/gradeCutoffs';
import { useUniversities } from '../../hooks/useUniversities';

export const GradeCutoffsManager: React.FC = () => {
    const [cutoffs, setCutoffs] = useState<ExamCutoff[]>(() => getMockExamCutoffs());
    const [jsonText, setJsonText] = useState<string>(() => JSON.stringify(getMockExamCutoffs(), null, 2));
    const [jsonError, setJsonError] = useState<string | null>(null);
    const [activeSubTab, setActiveSubTab] = useState<'visual' | 'json' | 'add' | 'guide'>('visual');
    const [selectedExamId, setSelectedExamId] = useState<string>(() => cutoffs[0]?.examId || '');
    const [selectedSubjectKey, setSelectedSubjectKey] = useState<string>('korean');
    const [notice, setNotice] = useState<string | null>(null);

    // 대학 DB 훅
    const { universities, isUpdating, lastUpdated, updateUniversities } = useUniversities();

    // 새 시험 빠른 등록 폼 상태
    const [newExamId, setNewExamId] = useState('');
    const [newExamName, setNewExamName] = useState('');
    const [newExamYear, setNewExamYear] = useState<number>(new Date().getFullYear());
    const [newExamDesc, setNewExamDesc] = useState('');
    const [koreanCut1, setKoreanCut1] = useState(88);
    const [koreanMaxStd, setKoreanMaxStd] = useState(136);
    const [mathCut1, setMathCut1] = useState(84);
    const [mathMaxStd, setMathMaxStd] = useState(142);
    const [socialCut1, setSocialCut1] = useState(46);
    const [socialMaxStd, setSocialMaxStd] = useState(72);
    const [sciCut1, setSciCut1] = useState(44);
    const [sciMaxStd, setSciMaxStd] = useState(72);

    const showNotice = (msg: string) => {
        setNotice(msg);
        setTimeout(() => setNotice(null), 3500);
    };

    // JSON 텍스트 동기화
    useEffect(() => {
        setJsonText(JSON.stringify(cutoffs, null, 2));
        if (cutoffs.length > 0 && !cutoffs.some(c => c.examId === selectedExamId)) {
            setSelectedExamId(cutoffs[0].examId);
        }
    }, [cutoffs]);

    // JSON 저장 핸들러
    const handleSaveJson = () => {
        try {
            const parsed = JSON.parse(jsonText);
            if (!Array.isArray(parsed)) {
                throw new Error('데이터는 최상위 배열(Array) 형태여야 합니다.');
            }
            for (const item of parsed) {
                if (!item.examId || !item.examName || !item.subjects) {
                    throw new Error(`각 시험 객체에는 examId, examName, subjects 속성이 필수입니다. (오류 항목: ${item.examId || '미지정'})`);
                }
            }
            saveMockExamCutoffs(parsed);
            setCutoffs(parsed);
            setJsonError(null);
            showNotice('✅ 등급컷 JSON 데이터가 성공적으로 저장 및 시스템 전체에 즉시 반영되었습니다!');
        } catch (err: any) {
            setJsonError(err.message || '유효하지 않은 JSON 형식입니다.');
        }
    };

    // 기본값 초기화
    const handleResetDefaults = () => {
        if (!confirm('경고: 현재 등록된 등급컷 DB를 기본 평가원 공시 데이터(2025 수능, 2024년 6/9월)로 되돌리시겠습니까?')) {
            return;
        }
        const defaults = resetMockExamCutoffs();
        setCutoffs(defaults);
        setJsonText(JSON.stringify(defaults, null, 2));
        setJsonError(null);
        showNotice('🔄 기본 평가원 등급컷 데이터로 복원되었습니다.');
    };

    // JSON 클립보드 복사
    const handleCopyJson = () => {
        navigator.clipboard.writeText(jsonText).then(() => {
            showNotice('📋 클립보드에 등급컷 JSON이 복사되었습니다.');
        }).catch(() => {
            showNotice('복사에 실패했습니다.');
        });
    };

    // 시험 삭제
    const handleDeleteExam = (examId: string) => {
        if (cutoffs.length <= 1) {
            alert('최소 1개 이상의 시험 등급컷 데이터가 유지되어야 합니다.');
            return;
        }
        if (!confirm(`'${cutoffs.find(c => c.examId === examId)?.examName}' 등급컷을 삭제하시겠습니까?`)) {
            return;
        }
        const updated = cutoffs.filter(c => c.examId !== examId);
        saveMockExamCutoffs(updated);
        setCutoffs(updated);
        showNotice('🗑️ 선택한 시험 등급컷이 삭제되었습니다.');
    };

    // 새 시험 빠른 자동 생성 등록
    const handleCreateFastExam = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newExamId.trim() || !newExamName.trim()) {
            alert('시험 ID와 시험명을 입력해주세요.');
            return;
        }

        if (cutoffs.some(c => c.examId === newExamId.trim())) {
            alert('이미 존재하는 시험 ID입니다. 다른 ID를 입력하세요.');
            return;
        }

        const newExam: ExamCutoff = {
            examId: newExamId.trim(),
            examName: newExamName.trim(),
            examYear: newExamYear,
            description: newExamDesc.trim() || `${newExamYear}학년도 평가원/수능 등급컷`,
            subjects: {
                'korean': generateMockCurve(koreanCut1, koreanMaxStd),
                'math': generateMockCurve(mathCut1, mathMaxStd),
                'english': generateMockCurve(90, 100), // 영어 절대평가
                'social_culture': generateMockCurve(socialCut1, socialMaxStd),
                'life_science_1': generateMockCurve(sciCut1, sciMaxStd)
            }
        };

        const updated = [newExam, ...cutoffs];
        saveMockExamCutoffs(updated);
        setCutoffs(updated);
        setSelectedExamId(newExam.examId);
        setActiveSubTab('visual');
        showNotice(`🎉 [${newExam.examName}] 시험 등급컷이 성공적으로 자동 생성 및 등록되었습니다!`);

        // 폼 리셋
        setNewExamId('');
        setNewExamName('');
        setNewExamDesc('');
    };

    const currentExam = cutoffs.find(c => c.examId === selectedExamId) || cutoffs[0];
    const currentSubjectCutoffs = currentExam?.subjects?.[selectedSubjectKey] || [];

    // 주요 등급 (1, 2, 3, 4, 5) 컷라인 요약
    const gradeSummary = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(grade => {
        const item = currentSubjectCutoffs.find(c => c.grade === grade);
        return {
            grade,
            minRaw: item?.rawScore ?? '-',
            std: item?.standardScore ?? '-',
            percentile: item?.percentile ?? '-'
        };
    });

    return (
        <div className="space-y-6">
            {/* Header Card */}
            <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute -right-6 -bottom-6 opacity-10 text-9xl">📊</div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-3 py-1 text-xs font-black uppercase tracking-wider rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30">
                                대입 합격 예측 & 수능 등급컷 관제
                            </span>
                            <span className="text-xs text-blue-300">NBASS Solopreneur Auto-Engine</span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                            연도별 등급컷 JSON 데이터 & 대입 기준선 직접 관리
                        </h2>
                        <p className="text-sm text-blue-200 mt-2 max-w-2xl leading-relaxed">
                            한국교육과정평가원(suneung.re.kr) 및 대입정보포털 어디가(adiga.kr) 공시 데이터를 오너가 직접 JSON으로 등록·수정·관리합니다. 변경된 등급컷은 학생 모의지원 및 합격 예측에 즉시 실시간 반영됩니다.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={handleResetDefaults}
                            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all flex items-center gap-1.5 shadow-sm"
                            title="초기 평가원 기본 데이터로 복원"
                        >
                            <span>🔄</span> 기본값 복원
                        </button>
                        <button
                            onClick={handleCopyJson}
                            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-md hover:shadow-lg"
                        >
                            <span>📋</span> 전체 JSON 복사
                        </button>
                    </div>
                </div>

                {/* Status Pills */}
                <div className="mt-6 pt-6 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                        <div className="text-blue-300 text-[11px] mb-0.5">등록된 시험 수</div>
                        <div className="text-xl font-black text-white">{cutoffs.length}개 시험 DB</div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                        <div className="text-blue-300 text-[11px] mb-0.5">최신 기준 시험</div>
                        <div className="text-sm font-bold text-emerald-400 truncate">{cutoffs[0]?.examName || '-'}</div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                        <div className="text-blue-300 text-[11px] mb-0.5">연계 대학/학과 DB</div>
                        <div className="text-xl font-black text-white">{universities.length}개교 탑재</div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                        <div className="text-blue-300 text-[11px] mb-0.5">저장소 연동 상태</div>
                        <div className="text-sm font-bold text-cyan-300 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            로컬스토리지 영구 보존
                        </div>
                    </div>
                </div>
            </div>

            {/* Alert / Notice Toast */}
            {notice && (
                <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl text-xs font-bold shadow-sm flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-2">
                        <span className="text-base">📢</span>
                        <span>{notice}</span>
                    </div>
                    <button onClick={() => setNotice(null)} className="text-emerald-700 hover:text-emerald-900">✕</button>
                </div>
            )}

            {/* Sub Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <button
                    onClick={() => setActiveSubTab('visual')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        activeSubTab === 'visual'
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                >
                    <span>📊</span> 시험별 등급컷 시각적 조회
                </button>
                <button
                    onClick={() => setActiveSubTab('json')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        activeSubTab === 'json'
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                >
                    <span>⚙️</span> JSON 직접 편집기
                </button>
                <button
                    onClick={() => setActiveSubTab('add')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        activeSubTab === 'add'
                            ? 'bg-emerald-600 text-white shadow-md'
                            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                >
                    <span>➕</span> 새 시험 등급컷 추가
                </button>
                <button
                    onClick={() => setActiveSubTab('guide')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        activeSubTab === 'guide'
                            ? 'bg-amber-600 text-white shadow-md'
                            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                >
                    <span>🏛️</span> 평가원/어디가 데이터 출처 안내
                </button>
            </div>

            {/* SUB-TAB 1: 시각적 조회 & 시험 목록 */}
            {activeSubTab === 'visual' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* 시험 선택 목록 */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                                <span>📚</span> 등록된 시험 목록 ({cutoffs.length})
                            </h3>
                            <button
                                onClick={() => setActiveSubTab('add')}
                                className="text-xs text-blue-600 font-bold hover:underline"
                            >
                                + 새 시험 추가
                            </button>
                        </div>

                        <div className="space-y-2.5">
                            {cutoffs.map(exam => {
                                const isSelected = exam.examId === selectedExamId;
                                return (
                                    <div
                                        key={exam.examId}
                                        onClick={() => setSelectedExamId(exam.examId)}
                                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                                            isSelected
                                                ? 'bg-blue-50/80 border-blue-500 shadow-sm'
                                                : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                                                    <span>{exam.examName}</span>
                                                    {exam.examYear && (
                                                        <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-semibold">
                                                            {exam.examYear}년
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-[11px] text-slate-500 mt-1 font-mono">
                                                    ID: {exam.examId}
                                                </div>
                                                {exam.description && (
                                                    <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                                                        {exam.description}
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteExam(exam.examId);
                                                }}
                                                className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                                                title="시험 삭제"
                                            >
                                                🗑️
                                            </button>
                                        </div>

                                        <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center gap-1.5 flex-wrap">
                                            {Object.keys(exam.subjects || {}).map(sub => (
                                                <span key={sub} className="text-[9.5px] px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600 font-medium">
                                                    {sub}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* 선택된 시험 세부 등급컷 뷰어 */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                        {currentExam ? (
                            <>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                                    <div>
                                        <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                                            <span>🎯</span> {currentExam.examName}
                                        </h3>
                                        <p className="text-xs text-slate-500 mt-0.5">{currentExam.description || '등록된 등급컷 데이터 곡선'}</p>
                                    </div>

                                    {/* 과목 선택 탭 */}
                                    <div className="flex items-center gap-1.5 overflow-x-auto">
                                        {Object.keys(currentExam.subjects || {}).map(subKey => (
                                            <button
                                                key={subKey}
                                                onClick={() => setSelectedSubjectKey(subKey)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                                    selectedSubjectKey === subKey
                                                        ? 'bg-slate-900 text-white shadow-sm'
                                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                }`}
                                            >
                                                {subKey === 'korean' ? '국어' :
                                                 subKey === 'math' ? '수학' :
                                                 subKey === 'english' ? '영어' :
                                                 subKey === 'social_culture' ? '사문' :
                                                 subKey === 'life_science_1' ? '생명1' : subKey}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* 등급별 구분 기준 테이블 */}
                                <div>
                                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                                        <span>📌</span> {selectedSubjectKey.toUpperCase()} 1~9등급 등급컷 요약표
                                    </h4>
                                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                                        <table className="w-full text-center text-xs">
                                            <thead className="bg-slate-50 text-[11px] font-bold text-slate-600 border-b border-slate-200">
                                                <tr>
                                                    <th className="py-2.5 px-3">등급</th>
                                                    <th className="py-2.5 px-3">원점수 컷라인</th>
                                                    <th className="py-2.5 px-3">표준점수</th>
                                                    <th className="py-2.5 px-3">백분위</th>
                                                    <th className="py-2.5 px-3">누적 비율</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {gradeSummary.map(row => (
                                                    <tr key={row.grade} className="hover:bg-slate-50/80 transition-colors">
                                                        <td className="py-2.5 px-3 font-bold">
                                                            <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-black ${
                                                                row.grade === 1 ? 'bg-emerald-100 text-emerald-800' :
                                                                row.grade === 2 ? 'bg-blue-100 text-blue-800' :
                                                                row.grade === 3 ? 'bg-indigo-100 text-indigo-800' :
                                                                row.grade === 4 ? 'bg-amber-100 text-amber-800' :
                                                                'bg-slate-100 text-slate-700'
                                                            }`}>
                                                                {row.grade}등급
                                                            </span>
                                                        </td>
                                                        <td className="py-2.5 px-3 font-bold text-slate-900">{row.minRaw}점 이상</td>
                                                        <td className="py-2.5 px-3 text-slate-700 font-semibold">{row.std}</td>
                                                        <td className="py-2.5 px-3 text-slate-700 font-semibold">{row.percentile}%</td>
                                                        <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                                                            {row.grade === 1 ? '상위 4%' :
                                                             row.grade === 2 ? '상위 11%' :
                                                             row.grade === 3 ? '상위 23%' :
                                                             row.grade === 4 ? '상위 40%' :
                                                             row.grade === 5 ? '상위 60%' :
                                                             row.grade === 6 ? '상위 77%' :
                                                             row.grade === 7 ? '상위 89%' :
                                                             row.grade === 8 ? '상위 96%' : '상위 100%'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-2">
                                        * 전체 0~100점 원점수별 정밀 매핑 곡선이 시스템 내부 캐시에 탑재되어 성적 입력 시 실시간으로 연동됩니다.
                                    </p>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-12 text-slate-400 text-sm">
                                선택된 시험 데이터가 없습니다.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* SUB-TAB 2: JSON 직접 편집기 */}
            {activeSubTab === 'json' && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                        <div>
                            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                <span>🛠️</span> 등급컷 JSON 직접 편집기 (Direct JSON Editor)
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                연도별 등급컷 전체 배열 데이터를 JSON 형식으로 직접 수정하거나 신규 항목을 추가할 수 있습니다.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleSaveJson}
                                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-sm flex items-center gap-1.5"
                            >
                                <span>💾</span> JSON 저장 및 즉시 반영
                            </button>
                        </div>
                    </div>

                    {jsonError && (
                        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                            <span>❌ JSON 오류:</span>
                            <span>{jsonError}</span>
                        </div>
                    )}

                    <div className="relative">
                        <textarea
                            value={jsonText}
                            onChange={(e) => {
                                setJsonText(e.target.value);
                                setJsonError(null);
                            }}
                            rows={20}
                            className="w-full font-mono text-xs p-4 bg-slate-900 text-emerald-400 rounded-2xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
                            placeholder="JSON 데이터를 입력하세요..."
                            spellCheck={false}
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
                        <div>
                            💡 <strong>팁:</strong> 저장 즉시 `nbass_exam_cutoffs_db` 로컬스토리지에 저장되어 모든 학생 성적 입력창과 합격 예측 화면에 동기화됩니다.
                        </div>
                        <button
                            onClick={() => setJsonText(JSON.stringify(cutoffs, null, 2))}
                            className="text-xs text-slate-600 hover:text-slate-900 font-semibold underline self-start sm:self-auto"
                        >
                            현재 저장된 상태로 되돌리기
                        </button>
                    </div>
                </div>
            )}

            {/* SUB-TAB 3: 새 시험 빠른 추가 */}
            {activeSubTab === 'add' && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                    <div>
                        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <span>➕</span> 신규 평가원/모의고사 등급컷 간편 등록
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                            평가원 공시 자료에서 발표된 <strong>1등급 컷라인(원점수)</strong>과 <strong>최고 표준점수</strong>만 입력하면 0~100점 전체 곡선이 AI 알고리즘으로 자동 계산되어 즉시 등록됩니다.
                        </p>
                    </div>

                    <form onSubmit={handleCreateFastExam} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700">시험 고유 ID *</label>
                                <input
                                    type="text"
                                    value={newExamId}
                                    onChange={e => setNewExamId(e.target.value)}
                                    placeholder="예: 2026_06_mock"
                                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                />
                                <span className="text-[10px] text-slate-400">영문, 숫자, 언더스코어(_) 권장</span>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700">시험 명칭 *</label>
                                <input
                                    type="text"
                                    value={newExamName}
                                    onChange={e => setNewExamName(e.target.value)}
                                    placeholder="예: 2026년 6월 평가원 모의고사"
                                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700">시행 연도</label>
                                <input
                                    type="number"
                                    value={newExamYear}
                                    onChange={e => setNewExamYear(Number(e.target.value))}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">설명 / 비고</label>
                            <input
                                type="text"
                                value={newExamDesc}
                                onChange={e => setNewExamDesc(e.target.value)}
                                placeholder="예: 한국교육과정평가원 공시 2026학년도 6월 모의평가 실채점 등급 구분 표준점수 기준"
                                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        {/* 과목별 기준선 파라미터 */}
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                📊 주요 영역별 1등급 컷 및 최고 표준점수 (평가원 보도자료 수치)
                            </h4>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                                    <div className="font-bold text-xs text-blue-700">국어 영역</div>
                                    <div>
                                        <label className="text-[10px] text-slate-500 block">1등급 컷 (원점수)</label>
                                        <input
                                            type="number"
                                            value={koreanCut1}
                                            onChange={e => setKoreanCut1(Number(e.target.value))}
                                            className="w-full px-2 py-1 border border-slate-200 rounded-lg text-xs font-bold"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-slate-500 block">최고 표준점수</label>
                                        <input
                                            type="number"
                                            value={koreanMaxStd}
                                            onChange={e => setKoreanMaxStd(Number(e.target.value))}
                                            className="w-full px-2 py-1 border border-slate-200 rounded-lg text-xs"
                                        />
                                    </div>
                                </div>

                                <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                                    <div className="font-bold text-xs text-indigo-700">수학 영역</div>
                                    <div>
                                        <label className="text-[10px] text-slate-500 block">1등급 컷 (원점수)</label>
                                        <input
                                            type="number"
                                            value={mathCut1}
                                            onChange={e => setMathCut1(Number(e.target.value))}
                                            className="w-full px-2 py-1 border border-slate-200 rounded-lg text-xs font-bold"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-slate-500 block">최고 표준점수</label>
                                        <input
                                            type="number"
                                            value={mathMaxStd}
                                            onChange={e => setMathMaxStd(Number(e.target.value))}
                                            className="w-full px-2 py-1 border border-slate-200 rounded-lg text-xs"
                                        />
                                    </div>
                                </div>

                                <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                                    <div className="font-bold text-xs text-amber-700">사회탐구 (사문 기준)</div>
                                    <div>
                                        <label className="text-[10px] text-slate-500 block">1등급 컷 (원점수)</label>
                                        <input
                                            type="number"
                                            value={socialCut1}
                                            onChange={e => setSocialCut1(Number(e.target.value))}
                                            className="w-full px-2 py-1 border border-slate-200 rounded-lg text-xs font-bold"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-slate-500 block">최고 표준점수</label>
                                        <input
                                            type="number"
                                            value={socialMaxStd}
                                            onChange={e => setSocialMaxStd(Number(e.target.value))}
                                            className="w-full px-2 py-1 border border-slate-200 rounded-lg text-xs"
                                        />
                                    </div>
                                </div>

                                <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                                    <div className="font-bold text-xs text-emerald-700">과학탐구 (생명1 기준)</div>
                                    <div>
                                        <label className="text-[10px] text-slate-500 block">1등급 컷 (원점수)</label>
                                        <input
                                            type="number"
                                            value={sciCut1}
                                            onChange={e => setSciCut1(Number(e.target.value))}
                                            className="w-full px-2 py-1 border border-slate-200 rounded-lg text-xs font-bold"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-slate-500 block">최고 표준점수</label>
                                        <input
                                            type="number"
                                            value={sciMaxStd}
                                            onChange={e => setSciMaxStd(Number(e.target.value))}
                                            className="w-full px-2 py-1 border border-slate-200 rounded-lg text-xs"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setActiveSubTab('visual')}
                                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                            >
                                취소
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-md flex items-center gap-1.5"
                            >
                                <span>🚀</span> 새 시험 등급컷 즉시 생성 및 등록
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* SUB-TAB 4: 공식 데이터 출처 및 연 1회 갱신 가이드 */}
            {activeSubTab === 'guide' && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                    <div className="border-b border-slate-100 pb-4">
                        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <span>🏛️</span> 공식 등급컷 데이터 출처 및 연 1회 갱신 실무 가이드
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                            오너가 신뢰성 높은 데이터를 확보하여 NBASS 시스템을 유지관리하는 실무 프로세스입니다.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-blue-50/70 rounded-2xl p-5 border border-blue-200/80 space-y-3">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">📑</span>
                                <div>
                                    <h4 className="font-bold text-sm text-blue-950">한국교육과정평가원</h4>
                                    <a 
                                        href="https://www.suneung.re.kr" 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="text-[11px] text-blue-600 hover:underline font-semibold"
                                    >
                                        suneung.re.kr ↗
                                    </a>
                                </div>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                매년 <strong>12월 초(수능 채점 결과 발표일)</strong>와 <strong>6월·9월 모의평가 채점 결과</strong> 보도자료를 배포합니다.
                            </p>
                            <ul className="text-[11px] text-slate-700 space-y-1 list-disc pl-4">
                                <li>과목별 등급 구분 표준점수 (1~9등급)</li>
                                <li>만점자 표준점수 (최고 표준점수)</li>
                                <li>PDF 파일 내 표 데이터를 위 등록 폼에 기입</li>
                            </ul>
                        </div>

                        <div className="bg-emerald-50/70 rounded-2xl p-5 border border-emerald-200/80 space-y-3">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">🎓</span>
                                <div>
                                    <h4 className="font-bold text-sm text-emerald-950">대입정보포털 어디가</h4>
                                    <a 
                                        href="https://www.adiga.kr" 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="text-[11px] text-emerald-600 hover:underline font-semibold"
                                    >
                                        adiga.kr ↗
                                    </a>
                                </div>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                교육부·대교협이 매년 5~6월에 전국 대학별 <strong>전년도 정시/수시 최종 등록자 70% Cut</strong>을 공시합니다.
                            </p>
                            <ul className="text-[11px] text-slate-700 space-y-1 list-disc pl-4">
                                <li>대학/모집단위별 국·수·탐 백분위 평균</li>
                                <li>학생부 교과 등급 컷라인</li>
                                <li>합격 예측의 `targetGrades` 기준선으로 활용</li>
                            </ul>
                        </div>

                        <div className="bg-indigo-50/70 rounded-2xl p-5 border border-indigo-200/80 space-y-3">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">⚡</span>
                                <div>
                                    <h4 className="font-bold text-sm text-indigo-950">EBSi 수능 풀서비스</h4>
                                    <a 
                                        href="https://www.ebsi.co.kr" 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="text-[11px] text-indigo-600 hover:underline font-semibold"
                                    >
                                        ebs.co.kr ↗
                                    </a>
                                </div>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                시험 당일 저녁 <strong>실시간 가채점 등급컷</strong>을 가장 빠르게 제공하며, 확정 등급컷과 거의 일치합니다.
                            </p>
                            <ul className="text-[11px] text-slate-700 space-y-1 list-disc pl-4">
                                <li>모의고사/수능 당일 즉시 등록 가능</li>
                                <li>선택과목별 원점수 컷라인 실시간 제공</li>
                            </ul>
                        </div>
                    </div>

                    {/* 대학 DB 현황 및 갱신 섹션 */}
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                                    <span>🏫</span> 전국 주요 대학 합격 기준선 DB 현황
                                </h4>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                    현재 {universities.length}개 주요 대학(서울대, 연세대, 고려대, 의치한약수 등) 및 400+개 학과 데이터 로드됨 (최근 업데이트: {lastUpdated || '기본 탑재'} · 자동 갱신 미지원)
                                </p>
                            </div>
                            <button
                                onClick={async () => {
                                    const ok = await updateUniversities();
                                    if (!ok) {
                                        alert('원격 갱신 서버가 연결되어 있지 않습니다. 현재 로컬 탑재본을 사용 중입니다.');
                                    }
                                }}
                                disabled={isUpdating}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50 self-start sm:self-auto"
                            >
                                <span>{isUpdating ? '⏳ 갱신 중...' : '🔄 대학 DB 캐시 갱신'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
