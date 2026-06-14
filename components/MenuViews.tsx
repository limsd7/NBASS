
import React from 'react';
import { CareType, AssessmentResult } from '../types';
import { BreathingGuide } from './BreathingGuide';
import { DropdownSearch } from './DropdownSearch';
import { AnalystConfig } from '../utils/analystConfig';

export { ProgressView } from './ProgressView';

interface DashboardViewProps {
    onStartClick: () => void;
    onHistoryClick: () => void;
    onResourcesClick: () => void;
    history: (AssessmentResult & { date: string })[];
    config: { isMedicalMode?: boolean; usePortable?: boolean; useBrainBody?: boolean; isExamMode: boolean };
    analystConfig: AnalystConfig;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onStartClick, onHistoryClick, onResourcesClick, history, config, analystConfig }) => {
    return (
        <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700">
            {/* Hero Section */}
            <div className="bg-white dark:bg-slate-800 p-8 md:p-12 rounded-[2.5rem] border border-blue-100 dark:border-slate-700 shadow-2xl shadow-blue-500/5 text-center relative overflow-hidden transition-colors">
                <div className="relative z-10 flex flex-col items-center">
                    {/* Main Logo */}
                    <div className="mb-6 w-24 h-24 flex items-center justify-center shrink-0">
                        <img
                            src="./NBASS logo.jpg"
                            alt="NBASS Logo"
                            className="w-full h-full object-contain rounded-2xl shadow-sm"
                        />
                    </div>

                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight leading-tight">
                        Neuro-Bio Academic Strategy System <br />
                        <span className="text-blue-600 dark:text-blue-400 font-extrabold">[ NBASS ]</span>
                    </h2>

                    {/* Mode Indicator */}
                    <div className="mb-8 flex items-center justify-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                        {config.isMedicalMode ? (
                            <div className="px-4 py-1.5 bg-rose-100 text-rose-700 rounded-full text-sm font-bold border border-rose-200 shadow-sm flex items-center gap-2">
                                <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
                                Medical Expert Mode
                            </div>
                        ) : config.usePortable ? (
                            <div className="px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold border border-emerald-200 shadow-sm flex items-center gap-2">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                Portable Lite Mode
                            </div>
                        ) : (
                            <div className="px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-bold border border-blue-200 shadow-sm flex items-center gap-2">
                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                Standard Clinical Mode
                            </div>
                        )}
                        {config.isExamMode && (
                            <div className="px-4 py-1.5 bg-amber-100 text-amber-700 rounded-full text-sm font-bold border border-amber-200 shadow-sm">
                                ⚡ Exam Strategy Active
                            </div>
                        )}
                        {/* Analyst Display */}
                        {analystConfig && (
                            <div className="px-4 py-1.5 bg-slate-100 text-slate-700 rounded-full text-sm font-bold border border-slate-200 shadow-sm flex items-center gap-2">
                                <span className="text-blue-600">👨‍⚕️</span>
                                {analystConfig.analystDisplayText || analystConfig.analystName}
                            </div>
                        )}
                    </div>
                    <p className="max-w-3xl mx-auto text-slate-600 dark:text-slate-400 mb-10 text-lg md:text-xl leading-relaxed">
                        NBASS는 뇌파·자율신경 정밀 지표와 수험생 고유의 신체 프로파일(BMI), 인지 성향(MBTI)을 다각도로 통합 분석합니다. <br className="hidden md:block" />
                        개인의 생체 생태계(Eco-system)에 최적화된 학습 로드맵과 멘탈 솔루션을 처방합니다.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <button onClick={onStartClick} className="px-10 py-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl font-black text-xl hover:shadow-2xl hover:shadow-blue-500/40 transition-all transform hover:-translate-y-1 active:scale-95">
                            검사 시작하기
                        </button>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-100/50 dark:bg-blue-600/10 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse"></div>
                <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-100/50 dark:bg-indigo-600/10 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse delay-700"></div>
            </div>

            {/* Professional Framework Section */}
            {(config.useBrainBody || config.usePortable) && (
                <div className="space-y-6">
                    <div className="flex items-center gap-4 px-2">
                        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                        <h3 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Scientific Framework</h3>
                        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                    </div>

                    <div className={`grid grid-cols-1 md:grid-cols-${(config.useBrainBody && config.usePortable) ? '3' : (config.useBrainBody || config.usePortable) ? '2' : '3'} gap-6`}>
                        {/* Neuro-Science (BrainBody Only) */}
                        {config.useBrainBody && !config.usePortable && (
                            <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl hover:scale-[1.02] transition-transform">
                                <div className="text-blue-400 text-xs font-bold mb-3 tracking-widest uppercase">Neuro-Science Focus</div>
                                <h4 className="text-xl font-bold mb-3 flex items-center justify-between">
                                    NEURO-EDULAB
                                    <span className="text-lg">🧠</span>
                                </h4>
                                <p className="text-slate-400 text-sm leading-relaxed">신경학적 분석을 통해 학습의 해답을 찾는 정밀 연구 시스템</p>
                                <div className="mt-4 pt-4 border-t border-slate-800 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">SYNAPSE CORE PROTOCOL</span>
                                </div>
                            </div>
                        )}

                        {/* Bio-Data (BrainBody & Portable) */}
                        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-6 rounded-3xl shadow-lg hover:scale-[1.02] transition-transform">
                            <div className="text-emerald-500 dark:text-emerald-400 text-xs font-bold mb-3 tracking-widest uppercase">Bio-Data Focus</div>
                            <h4 className="text-xl font-bold mb-3 text-slate-900 dark:text-white flex items-center justify-between">
                                {config.usePortable ? 'PORTABLE BIO-INDEX' : 'BIO-COGNITIVE INDEX'}
                                <span className="text-lg">📊</span>
                            </h4>
                            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                                {config.usePortable ? 'uBioMacpa 측정을 통한 자율신경계 피로도와 스트레스 분석' : 'HRV와 인지 수치를 통합 분석하여 객관적 지표(BCI)로 산출'}
                            </p>
                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center gap-2">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                    {config.usePortable ? 'UBIO MACPA SOLUTIONS' : 'METRI-BRAIN SOLUTIONS'}
                                </span>
                            </div>
                        </div>

                        {/* Integrated System (BrainBody Only) */}
                        {config.useBrainBody && !config.usePortable && (
                            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-6 rounded-3xl shadow-xl hover:scale-[1.02] transition-transform md:col-span-1">
                                <div className="text-indigo-100 text-xs font-bold mb-3 tracking-widest uppercase">System Integration</div>
                                <h4 className="text-xl font-bold mb-3 flex items-center justify-between">
                                    L.A.P.S
                                    <span className="text-lg">⚙️</span>
                                </h4>
                                <p className="text-indigo-100/80 text-sm leading-relaxed">Learning Analytics & Physiology System: 학습과 생리학의 통합 관리</p>
                                <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-white rounded-full"></span>
                                    <span className="text-[10px] font-bold text-indigo-100 uppercase tracking-tighter">NEURO-OPTIMIZER ENGINE</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all cursor-pointer group" onClick={onHistoryClick}>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-black text-slate-800 dark:text-slate-100 text-xl flex items-center gap-3">
                            <span className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">📊</span>
                            최근 분석 기록
                        </h3>
                        <span className="text-slate-400 group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                    {history.length > 0 ? (
                        <div className="space-y-3">
                            {history.slice(0, 3).map((h, i) => (
                                <div key={i} className="flex justify-between items-center p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-900 dark:text-white uppercase text-xs tracking-wider">{h.careType}</span>
                                        <span className="text-[10px] text-slate-400">{new Date(h.date).toLocaleDateString()}</span>
                                    </div>
                                    <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 rounded-full font-bold text-xs">{h.score}점</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-400 text-sm py-4">아직 분석 기록이 없습니다.</p>
                    )}
                </div>

                <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all cursor-pointer group" onClick={onResourcesClick}>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-black text-slate-800 dark:text-slate-100 text-xl flex items-center gap-3">
                            <span className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🧘</span>
                            수험생 자료실
                        </h3>
                        <span className="text-blue-500 group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
                        학생의 컨디션 최적화를 위한 스트레칭 가이드, 백색소음, 영양 처방 등 Wellness 솔루션을 확인하세요.
                    </p>
                    <div className="flex gap-2">
                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 rounded-lg text-[10px] font-bold">STRETCHING</span>
                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 rounded-lg text-[10px] font-bold">NUTRITION</span>
                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 rounded-lg text-[10px] font-bold">MENTAL</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const HistoryView: React.FC<{
    history: (AssessmentResult & { date: string })[],
    selectedStudentId?: string | null,
    onSelectStudent?: (id: string | null) => void,
    onStartClick: () => void,
    onViewDetail: (result: AssessmentResult) => void,
    onImportData: (data: (AssessmentResult & { date: string })[], merge: boolean) => void,
    onExportJSON: () => void,
    onExportCSV: () => void,
    onTrendClick?: () => void,
    onDeleteRecord?: (id: number) => void
}> = ({ history, selectedStudentId, onSelectStudent, onStartClick, onViewDetail, onImportData, onExportJSON, onExportCSV, onTrendClick, onDeleteRecord }) => {
    const [showImportModal, setShowImportModal] = React.useState(false);
    const [importFile, setImportFile] = React.useState<File | null>(null);
    const [importMode, setImportMode] = React.useState<'merge' | 'replace'>('merge');
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Extract unique students
    const uniqueStudents = Array.from(new Map(history.map(h => [h.student.id, h.student])).values()) as any[];

    // Filtered history
    const filteredHistory = selectedStudentId
        ? history.filter(h => h.student.id === selectedStudentId)
        : history;

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImportFile(file);
            setShowImportModal(true);
        }
    };

    const handleImportConfirm = async () => {
        if (!importFile) return;

        try {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const content = e.target?.result as string;
                    const data = JSON.parse(content);

                    if (!Array.isArray(data)) {
                        alert('올바른 형식이 아닙니다.');
                        return;
                    }

                    onImportData(data, importMode === 'merge');
                    setShowImportModal(false);
                    setImportFile(null);
                    alert(`${data.length}개의 기록을 ${importMode === 'merge' ? '병합' : '가져오기'}했습니다.`);
                } catch (error) {
                    alert('파일을 읽을 수 없습니다. JSON 형식을 확인해주세요.');
                }
            };
            reader.readAsText(importFile);
        } catch (error) {
            alert('파일 가져오기에 실패했습니다.');
        }
    };

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <span className="text-3xl">📜</span> 분석 히스토리
                </h2>

                {/* Patient Selector (Search & Dropdown) */}
                <div className="flex flex-wrap items-center gap-3">
                    <DropdownSearch
                        uniqueStudents={uniqueStudents}
                        selectedStudentId={selectedStudentId}
                        onSelectStudent={onSelectStudent}
                        historyData={history}
                    />

                    <div className="flex gap-2">
                        {/* Trend Analysis Button */}
                        <button
                            onClick={onTrendClick}
                            className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center p-2.5"
                            title="트렌드 분석"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></svg>
                        </button>

                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-2 bg-slate-600 text-white rounded-xl font-bold text-sm hover:bg-slate-700 transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center p-2.5"
                            title="데이터 가져오기"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
                        </button>

                        <div className="relative group">
                            <button className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center p-2.5">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                            </button>
                            <div className="absolute right-0 top-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 min-w-[150px]">
                                <button onClick={onExportJSON} className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 rounded-t-lg font-medium text-slate-700 dark:text-slate-300">JSON 형식</button>
                                <button onClick={onExportCSV} className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 rounded-b-lg font-medium text-slate-700 dark:text-slate-300">CSV 형식</button>
                            </div>
                        </div>
                    </div>
                </div>

                <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileSelect} className="hidden" />
            </div>

            {/* Import Modal */}
            {showImportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md">
                        <h3 className="font-bold text-lg mb-4 text-slate-800">데이터 가져오기</h3>
                        <p className="text-sm text-slate-600 mb-4">
                            파일: <span className="font-bold">{importFile?.name}</span>
                        </p>
                        <div className="space-y-3 mb-6">
                            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                                <input
                                    type="radio"
                                    name="importMode"
                                    checked={importMode === 'merge'}
                                    onChange={() => setImportMode('merge')}
                                    className="w-4 h-4 accent-blue-600"
                                />
                                <div>
                                    <p className="font-bold text-sm">기존 데이터와 병합</p>
                                    <p className="text-xs text-slate-500">중복 제거 후 합치기</p>
                                </div>
                            </label>
                            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                                <input
                                    type="radio"
                                    name="importMode"
                                    checked={importMode === 'replace'}
                                    onChange={() => setImportMode('replace')}
                                    className="w-4 h-4 accent-red-600"
                                />
                                <div>
                                    <p className="font-bold text-sm">기존 데이터 덮어쓰기</p>
                                    <p className="text-xs text-slate-500">기존 데이터 삭제 후 가져오기</p>
                                </div>
                            </label>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setShowImportModal(false);
                                    setImportFile(null);
                                }}
                                className="flex-1 px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-lg"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleImportConfirm}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
                            >
                                가져오기
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {filteredHistory.length > 0 ? (
                <div className="space-y-4">
                    {filteredHistory.map((record, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${record.careType === CareType.BURNOUT ? 'bg-red-100 text-red-700' :
                                        record.careType === CareType.SLEEP ? 'bg-purple-100 text-purple-700' :
                                            'bg-blue-100 text-blue-700'
                                        }`}>{record.careType}</span>
                                    <span className="text-slate-400 text-sm">{new Date(record.date).toLocaleString()}</span>
                                </div>
                                <p className="font-bold text-slate-800 text-lg">{record.student.name}님 분석 결과 (점수: {record.score}점)</p>
                            </div>
                            <div className="flex gap-2">
                                {onDeleteRecord && (record as any).id !== undefined && (
                                    <button 
                                        onClick={() => {
                                            if (window.confirm('이 기록을 삭제하시겠습니까?')) {
                                                onDeleteRecord((record as any).id);
                                            }
                                        }}
                                        className="px-4 py-2 text-sm text-red-600 font-bold hover:bg-red-50 border border-red-100 rounded-lg transition-colors">
                                        삭제
                                    </button>
                                )}
                                <button
                                    onClick={() => onViewDetail(record)}
                                    className="px-4 py-2 text-sm text-blue-600 font-bold hover:bg-blue-50 border border-blue-100 rounded-lg transition-colors">
                                    상세 보기
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (

                <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
                    <p className="text-slate-400 mb-4">저장된 기록이 없습니다.</p>
                    <button onClick={onStartClick} className="text-blue-600 font-bold hover:underline">지금 첫 분석 시작하기</button>
                </div>
            )}
        </div>
    );
};

export const ResourcesView: React.FC = () => {
    const [showBreathingGuide, setShowBreathingGuide] = React.useState(false);
    const [activeVideo, setActiveVideo] = React.useState<string | null>(null);

    const stretchingVideos = [
        { id: '1', title: '목/어깨 스트레칭', url: 'https://www.youtube.com/embed/RqcOCBb4arc', duration: '5분' },
        { id: '2', title: '허리 스트레칭', url: 'https://www.youtube.com/embed/4BOTvaRaDjI', duration: '7분' },
        { id: '3', title: '눈 운동', url: 'https://www.youtube.com/embed/WNzHwOe5F8k', duration: '3분' },
    ];

    const whitenoise = [
        { id: '1', title: '빗소리', url: 'https://www.youtube.com/embed/mPZkdNFkNps', type: 'Rain' },
        { id: '2', title: '도서관 소음', url: 'https://www.youtube.com/embed/3oKMa2d6Ue8', type: 'Library' },
        { id: '3', title: '카페 소음', url: 'https://www.youtube.com/embed/gaGltwHXRK0', type: 'Cafe' },
        { id: '4', title: '파도 소리', url: 'https://www.youtube.com/embed/WHPEKLQID4U', type: 'Ocean' },
    ];

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in duration-300 space-y-8">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <span className="text-3xl">📚</span> 수험생 자료실 (Wellness Center)
            </h2>

            {/* 호흡/명상 가이드 */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-8 rounded-3xl text-white shadow-xl">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                            🧘 실시간 호흡 가이드
                        </h3>
                        <p className="text-indigo-100 mb-4">
                            4-7-8 호흡법으로 불안을 완화하고 집중력을 높이세요
                        </p>
                        <button
                            onClick={() => setShowBreathingGuide(true)}
                            className="px-6 py-3 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-all shadow-lg"
                        >
                            호흡 가이드 시작하기 →
                        </button>
                    </div>
                    <div className="text-6xl opacity-20">🌬️</div>
                </div>
            </div>

            {/* 스트레칭 가이드 */}
            <div>
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <span className="text-2xl">🧘</span> 5분 스트레칭 가이드
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {stretchingVideos.map(video => (
                        <div key={video.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-lg transition-all">
                            <div className="aspect-video bg-slate-100 relative group cursor-pointer" onClick={() => setActiveVideo(video.url)}>
                                {activeVideo === video.url ? (
                                    <iframe
                                        src={video.url}
                                        className="w-full h-full"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-500">
                                        <div className="text-white text-center">
                                            <div className="text-4xl mb-2">▶️</div>
                                            <p className="text-sm font-bold">영상 재생</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="p-4">
                                <h4 className="font-bold text-slate-900">{video.title}</h4>
                                <p className="text-xs text-slate-500 mt-1">소요 시간: {video.duration}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 집중력 향상 백색소음 */}
            <div>
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <span className="text-2xl">🎵</span> 집중력 향상 백색소음
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {whitenoise.map(sound => (
                        <div key={sound.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-lg transition-all">
                            <div className="aspect-video bg-slate-100">
                                <iframe
                                    src={sound.url}
                                    className="w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                            <div className="p-4">
                                <h4 className="font-bold text-slate-900">{sound.title}</h4>
                                <span className="inline-block mt-2 px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded font-bold">
                                    {sound.type}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 영양 가이드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all">
                    <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                        <span className="text-2xl">🍎</span> 수험생 영양 가이드북
                    </h3>
                    <p className="text-slate-500 text-sm mb-4">
                        아침, 점심, 저녁 식단표 및 두뇌 영양 간식 추천 리스트
                    </p>
                    <a
                        href="https://www.mfds.go.kr/brd/m_99/view.do?seq=43892"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                        가이드 다운로드 →
                    </a>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all">
                    <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                        <span className="text-2xl">🧠</span> 멘탈 관리 칼럼
                    </h3>
                    <p className="text-slate-500 text-sm mb-4">
                        시험 불안을 다스리는 심리학적 기법과 마인드셋 관리법
                    </p>
                    <a
                        href="https://www.youthcenter.go.kr/youngPlazaOvr/youngPlazaOvrList.do"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        칼럼 읽기 →
                    </a>
                </div>
            </div>

            {/* 호흡 가이드 모달 */}
            {showBreathingGuide && (
                <BreathingGuide onClose={() => setShowBreathingGuide(false)} />
            )}
        </div>
    );
};
