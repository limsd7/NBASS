import React from 'react';
import { Layout } from '../Layout';
import { StepProgressBar } from '../ui/StepProgressBar';
import { AdminPasswordModal } from '../modals/AdminPasswordModal';
import {
    BAI_QUESTIONS,
    ISI_QUESTIONS,
    FATIGUE_SYMPTOMS,
    SYMPATHETIC_SYMPTOMS,
    PARASYMPATHETIC_SYMPTOMS,
    CONCENTRATION_QUESTIONS,
    ADRENAL_QUESTIONS
} from '../../data/questions';
import {
    LEARNING_TRAITS_QUESTIONS,
    LEARNING_TRAITS_CATEGORIES,
    calculateLearningTraits,
    ARCHETYPES
} from '../../data/learningTraitsData';
import { SurveyTab, LearningTraitsData } from '../../types';

interface SurveysStepProps {
    // Navigation
    onNext: () => void;
    setStep: (step: any) => void;

    // Layout props
    activeMenu: any;
    onMenuChange: (menu: any) => void;
    isDarkMode: boolean;
    onToggleDarkMode: () => void;
    onAdminClick: () => void;
    onHomeClick?: () => void;

    // Config
    config: {
        isMedicalMode: boolean;
        isExamMode: boolean;
        showDetail: boolean;
        useBrainBody: boolean;
        usePortable: boolean;
    };

    // Survey Tab State
    activeTab: SurveyTab;
    setActiveTab: (tab: SurveyTab) => void;

    // Learning Traits
    learningTraitsAnswers?: number[];
    setLearningTraitsAnswers?: React.Dispatch<React.SetStateAction<number[]>>;
    learningTraitsData?: LearningTraitsData;

    // BAI Sub-page
    baiSubPage: 1 | 2;
    setBaiSubPage: (page: 1 | 2) => void;

    // ANS Symptoms
    snsSymptomSelection: string[];
    setSnsSymptomSelection: React.Dispatch<React.SetStateAction<string[]>>;
    pnsSymptomSelection: string[];
    setPnsSymptomSelection: React.Dispatch<React.SetStateAction<string[]>>;

    // Survey Answers
    baiAnswers: number[];
    setBaiAnswers: React.Dispatch<React.SetStateAction<number[]>>;
    isiAnswers: number[];
    setIsiAnswers: React.Dispatch<React.SetStateAction<number[]>>;
    concentrationAnswers: number[];
    setConcentrationAnswers: React.Dispatch<React.SetStateAction<number[]>>;
    adrenalAnswers: number[];
    setAdrenalAnswers: React.Dispatch<React.SetStateAction<number[]>>;

    // CFS
    fatigueCore: boolean;
    setFatigueCore: React.Dispatch<React.SetStateAction<boolean>>;
    fatigueSymptoms: boolean[];
    setFatigueSymptoms: React.Dispatch<React.SetStateAction<boolean[]>>;

    // Scores (computed)
    surveyScores: {
        bai: number;
        isi: number;
        concentration: number;
        adrenal: number;
        fatigueCount: number;
        snsCount: number;
        pnsCount: number;
        isChronicFatigue: boolean;
    };

    // Evaluations (computed)
    baiEvaluation: { text: string; color: string };
    isiEvaluation: { text: string; color: string };
    adrenalEvaluation: { text: string; color: string };

    // Admin Modal
    showAdminPassword: boolean;
    adminPasswordInput: string;
    onAdminPasswordChange: (value: string) => void;
    onAdminConfirm: () => void;
    onAdminCancel: () => void;

    // 10-Minute Trial Mode Flag
    is10MinMode?: boolean;

    // ConfigModal component
    ConfigModal: React.FC;
}

export const SurveysStep: React.FC<SurveysStepProps> = ({
    onNext,
    setStep,
    activeMenu,
    onMenuChange,
    isDarkMode,
    onToggleDarkMode,
    onAdminClick,
    onHomeClick,
    config,
    activeTab,
    setActiveTab,
    is10MinMode = false,
    baiSubPage,
    setBaiSubPage,
    snsSymptomSelection,
    setSnsSymptomSelection,
    pnsSymptomSelection,
    setPnsSymptomSelection,
    baiAnswers,
    setBaiAnswers,
    isiAnswers,
    setIsiAnswers,
    concentrationAnswers,
    setConcentrationAnswers,
    adrenalAnswers,
    setAdrenalAnswers,
    fatigueCore,
    setFatigueCore,
    fatigueSymptoms,
    setFatigueSymptoms,
    surveyScores,
    baiEvaluation,
    isiEvaluation,
    adrenalEvaluation,
    // Learning Traits
    learningTraitsAnswers = new Array(15).fill(3),
    setLearningTraitsAnswers,
    learningTraitsData,
    showAdminPassword,
    adminPasswordInput,
    onAdminPasswordChange,
    onAdminConfirm,
    onAdminCancel,
    ConfigModal
}) => {
    const toggleSnsSymptom = (s: string) => {
        setSnsSymptomSelection(prev => prev.includes(s) ? prev.filter(i => i !== s) : [...prev, s]);
    };

    const togglePnsSymptom = (s: string) => {
        setPnsSymptomSelection(prev => prev.includes(s) ? prev.filter(i => i !== s) : [...prev, s]);
    };

    const traits = learningTraitsData || calculateLearningTraits(learningTraitsAnswers);

    const effectiveTab: SurveyTab = is10MinMode ? (activeTab === 'isi' ? 'isi' : 'bai') : activeTab;

    React.useEffect(() => {
        if (is10MinMode && activeTab !== 'bai' && activeTab !== 'isi') {
            setActiveTab('bai');
            setBaiSubPage(1);
        }
    }, [is10MinMode, activeTab, setActiveTab, setBaiSubPage]);

    // [변경] '학생 창 열기'는 학원/의료전문가/오너(및 EXPERT)에게만 제공합니다.
    const canOpenStudentWindow = (() => {
        try {
            const role = (localStorage.getItem('nbass_current_role') || '').toUpperCase();
            return ['OWNER', 'MEDICAL_EXPERT', 'ACADEMY_EXPERT', 'EXPERT'].includes(role);
        } catch {
            return false;
        }
    })();

    return (
        <Layout onHomeClick={onHomeClick} activeMenu={activeMenu} onMenuChange={onMenuChange} isDarkMode={isDarkMode} onToggleDarkMode={onToggleDarkMode} onAdminClick={onAdminClick}>
            <StepProgressBar currentStep="surveys" isMedicalMode={config.isMedicalMode} is10MinMode={is10MinMode} onStepClick={setStep} />
            <AdminPasswordModal isOpen={showAdminPassword} password={adminPasswordInput} onPasswordChange={onAdminPasswordChange} onConfirm={onAdminConfirm} onCancel={onAdminCancel} />
            <ConfigModal />
            <div className="max-w-4xl mx-auto space-y-6 pb-24 mt-6 px-4">
                {is10MinMode && (
                    <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-800 p-4 rounded-2xl text-white shadow-md flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">⚡</span>
                            <div>
                                <h4 className="text-base font-black">3분 무료체험 핵심 코스 [1단계 / 총 3단계: 심리 & 수면 설문]</h4>
                                <p className="text-xs text-blue-100 font-medium">1. 불안 척도 (BAI) ➔ 2. 수면 지수 (ISI) 설문 후 곧바로 2단계로 진행됩니다.</p>
                            </div>
                        </div>
                        <span className="px-3 py-1 bg-white/20 rounded-xl text-xs font-black backdrop-blur-sm">Fast-Track</span>
                    </div>
                )}

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-20 z-40 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src="./psychological_logo.jpg" alt="Logo" className="w-8 h-8 object-contain" />
                        <h3 className="text-xl font-black text-slate-900">Psychological Assessment</h3>
                        {canOpenStudentWindow && (
                            <button
                                onClick={() => {
                                    // [변경] 이전 학생의 입력이 남지 않도록 학생용 설문 임시 데이터를 초기화하고, 매번 새 창으로 엽니다.
                                    try { localStorage.removeItem('surveyFormData'); } catch { /* ignore */ }
                                    const winName = `StudentSurvey_${Date.now()}`;
                                    window.open(`survey-form-student.html?v=${Date.now()}`, winName, 'width=900,height=800,scrollbars=yes');
                                }}
                                className="ml-4 px-3.5 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-all flex items-center gap-1.5 shadow-sm"
                            >
                                <span>📋</span>
                                <span>학생 창 열기</span>
                            </button>
                        )}
                    </div>

                    <div className="flex gap-4 overflow-x-auto pb-1">
                        {!is10MinMode && (
                            <>
                                <div className="text-right">
                                    <p className="text-[10px] text-slate-400 uppercase font-bold">Sym</p>
                                    <p className="text-xl font-black text-red-600">{surveyScores.snsCount}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-slate-400 uppercase font-bold">Para</p>
                                    <p className="text-xl font-black text-blue-600">{surveyScores.pnsCount}</p>
                                </div>
                                <div className="text-right border-l pl-4">
                                    <p className="text-[10px] text-slate-400 uppercase font-bold">Focus</p>
                                    <p className="text-xl font-black text-amber-600">{surveyScores.concentration}</p>
                                </div>
                                <div className="text-right border-l pl-4">
                                    <p className="text-[10px] text-purple-500 uppercase font-bold">기질 유형</p>
                                    <p className="text-sm font-black text-purple-700 whitespace-nowrap">{traits.archetypeName}</p>
                                </div>
                            </>
                        )}
                        <div className="text-right border-l pl-4">
                            <p className="text-[10px] text-slate-400 uppercase font-bold">BAI (불안)</p>
                            <p className="text-xl font-black text-indigo-600">{surveyScores.bai}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-slate-400 uppercase font-bold">ISI (수면)</p>
                            <p className="text-xl font-black text-emerald-600">{surveyScores.isi}</p>
                        </div>
                    </div>
                </div>

                <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto gap-1">
                    {(is10MinMode ? ['bai', 'isi'] : ['ans', 'bai', 'isi', 'concentration', 'adrenal', 'cfs', 'learning_traits']).map(t => (
                        <button key={t} onClick={() => setActiveTab(t as SurveyTab)} className={`flex-1 py-3 text-xs md:text-sm font-black rounded-xl transition-all whitespace-nowrap px-3 ${effectiveTab === t ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}>
                            {t === 'ans' ? '자율신경 (ANS)' : t === 'bai' ? '1. 불안 (BAI)' : t === 'isi' ? '2. 수면 (ISI)' : t === 'concentration' ? '집중력' : t === 'adrenal' ? '부신피로' : t === 'cfs' ? '만성피로' : '🧬 학습 기질 및 전략'}
                        </button>
                    ))}
                </div>

                <div className="animate-in fade-in duration-300">
                    {effectiveTab === 'ans' && !is10MinMode && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                                <div className="p-4 bg-red-600 text-white font-bold text-center text-base">Sympathetic (교감신경)</div>
                                <div className="p-6 grid gap-3 bg-slate-50">
                                    {SYMPATHETIC_SYMPTOMS.map(s => (
                                        <label key={s.label} className={`flex items-start gap-3.5 p-4 rounded-2xl border cursor-pointer transition-all ${snsSymptomSelection.includes(s.label) ? 'bg-red-50 border-red-500 shadow-sm' : 'bg-white hover:border-red-200'}`}>
                                            <input type="checkbox" checked={snsSymptomSelection.includes(s.label)} onChange={() => toggleSnsSymptom(s.label)} className="w-5 h-5 accent-red-600 mt-0.5 rounded" />
                                            <div>
                                                <span className="text-base font-bold text-slate-800">{s.label}</span>
                                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{s.desc}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                                <div className="p-4 bg-blue-700 text-white font-bold text-center text-base">Parasympathetic (부교감신경)</div>
                                <div className="p-6 grid gap-3 bg-slate-50">
                                    {PARASYMPATHETIC_SYMPTOMS.map(s => (
                                        <label key={s.label} className={`flex items-start gap-3.5 p-4 rounded-2xl border cursor-pointer transition-all ${pnsSymptomSelection.includes(s.label) ? 'bg-blue-50 border-blue-500 shadow-sm' : 'bg-white hover:border-blue-200'}`}>
                                            <input type="checkbox" checked={pnsSymptomSelection.includes(s.label)} onChange={() => togglePnsSymptom(s.label)} className="w-5 h-5 accent-blue-700 mt-0.5 rounded" />
                                            <div>
                                                <span className="text-base font-bold text-slate-800">{s.label}</span>
                                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{s.desc}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {effectiveTab === 'bai' && (
                        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-md">
                            <div className="p-6 md:p-8 space-y-6">
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-black text-slate-900">BAI 불안 척도 (Beck Anxiety Inventory)</h2>
                                    <p className="text-sm font-bold text-slate-500 mt-1">최근 1주일 동안 경험한 신체적/심리적 불안 증상 정도</p>
                                </div>
                                <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-2xl text-base text-blue-950 font-medium leading-relaxed">
                                    지난 1주일간(오늘 포함) 다음과 같은 증상에 <strong>얼마나 시달렸는지</strong> 해당하는 점수를 선택해 주십시오.
                                </div>

                                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-4">
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => { setBaiSubPage(1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${baiSubPage === 1 ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                        >
                                            페이지 1 (1~10번)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => { setBaiSubPage(2); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${baiSubPage === 2 ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                        >
                                            페이지 2 (11~21번)
                                        </button>
                                    </div>
                                    <span className="text-xs font-bold text-slate-400">
                                        {baiSubPage === 1 ? '1~10번 문항 표시 중' : '11~21번 문항 표시 중'}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {BAI_QUESTIONS.filter((_, idx) => (baiSubPage === 1 ? idx < 10 : idx >= 10)).map((q, idx) => {
                                        const actualIdx = baiSubPage === 1 ? idx : idx + 10;
                                        const currentScore = baiAnswers[actualIdx];

                                        return (
                                            <div
                                                key={actualIdx}
                                                className={`p-4 md:p-5 rounded-2xl border transition-all flex flex-col justify-between gap-3.5 ${currentScore > 0
                                                    ? 'bg-blue-50/30 border-blue-200 shadow-sm'
                                                    : 'bg-white border-slate-200 hover:border-blue-300'
                                                    }`}
                                            >
                                                <div className="text-base md:text-lg font-extrabold text-slate-800 leading-snug flex items-start gap-2.5">
                                                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-black text-xs shrink-0 mt-0.5">
                                                        {actualIdx + 1}
                                                    </span>
                                                    <span className="pt-0.5">{q}</span>
                                                </div>

                                                <div className="grid grid-cols-4 gap-1.5 pt-1">
                                                    {[
                                                        { score: 0, label: '0점', desc: '전혀 없음' },
                                                        { score: 1, label: '1점', desc: '조금 느낌' },
                                                        { score: 2, label: '2점', desc: '상당히' },
                                                        { score: 3, label: '3점', desc: '심하게' }
                                                    ].map(({ score, label, desc }) => {
                                                        const isSelected = currentScore === score;
                                                        return (
                                                            <button
                                                                key={score}
                                                                type="button"
                                                                onClick={() => {
                                                                    const a = [...baiAnswers];
                                                                    a[actualIdx] = score;
                                                                    setBaiAnswers(a);
                                                                }}
                                                                className={`px-1.5 py-2 rounded-xl text-center font-bold transition-all flex flex-col items-center border ${isSelected
                                                                    ? 'bg-blue-600 border-blue-600 text-white shadow-md scale-105'
                                                                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-blue-50 hover:border-blue-200'
                                                                    }`}
                                                            >
                                                                <span className="text-sm font-black">{label}</span>
                                                                <span className={`text-[10px] font-semibold mt-0.5 whitespace-nowrap ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>{desc}</span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">총점 (Total Score)</p>
                                        <p className="text-3xl font-black text-blue-600">{surveyScores.bai} <span className="text-base font-bold text-slate-400">/ 63</span></p>
                                    </div>
                                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">상태 평가 (Evaluation)</p>
                                        <p className={`text-xl font-black ${baiEvaluation.color}`}>{baiEvaluation.text}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {effectiveTab === 'isi' && (
                        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-md">
                            <div className="p-6 md:p-8 space-y-6">
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-black text-slate-900">ISI 불면증 지수 (Insomnia Severity Index)</h2>
                                    <p className="text-sm font-bold text-slate-500 mt-1">수면 상태 및 수면 장애 중증도 자가평가</p>
                                </div>
                                <div className="p-4 bg-purple-50/60 border border-purple-100 rounded-2xl text-base text-purple-950 font-medium leading-relaxed">
                                    지난 2주간 동안 귀하의 <strong>수면/불면증 상태</strong>에 해당하는 정도를 선택해 주시기 바랍니다.
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {ISI_QUESTIONS.map((q, idx) => (
                                        <div key={idx} className={`p-4 md:p-5 rounded-2xl border border-slate-200 bg-white hover:border-purple-300 transition-all flex flex-col justify-between gap-3 shadow-sm ${idx === ISI_QUESTIONS.length - 1 ? 'md:col-span-2' : ''}`}>
                                            <p className="text-base md:text-lg font-extrabold text-slate-900 leading-snug flex items-start gap-2.5">
                                                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-purple-100 text-purple-700 font-black text-xs shrink-0 mt-0.5">
                                                    {idx + 1}
                                                </span>
                                                <span className="pt-0.5">{q.label}</span>
                                            </p>
                                            <div className="grid grid-cols-5 gap-1.5 pt-1">
                                                {q.options.map((option, score) => (
                                                    <button
                                                        key={score}
                                                        type="button"
                                                        onClick={() => { const a = [...isiAnswers]; a[idx] = score; setIsiAnswers(a); }}
                                                        className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl border transition-all ${isiAnswers[idx] === score ? 'bg-purple-600 border-purple-600 shadow-md scale-[1.02] text-white' : 'bg-slate-50 border-slate-200 hover:bg-purple-50 hover:border-purple-200 text-slate-700'}`}
                                                    >
                                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${isiAnswers[idx] === score ? 'bg-white border-white' : 'border-slate-300'}`}>
                                                            {isiAnswers[idx] === score && <div className="w-1.5 h-1.5 bg-purple-600 rounded-full"></div>}
                                                        </div>
                                                        <span className={`text-[10px] md:text-xs font-bold text-center leading-tight ${isiAnswers[idx] === score ? 'text-white' : 'text-slate-700'}`}>{option}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8 pt-6 border-t border-slate-100 bg-slate-50 p-6 rounded-2xl">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                        <div className="space-y-1 text-xs text-slate-500 font-medium">
                                            <p>• 0-7점: 정상 수면 상태</p>
                                            <p>• 8-14점: 경미한 불면 경향</p>
                                            <p>• 15-21점: 중등도 불면증 (주의 필요)</p>
                                            <p>• 22점 이상: 심한 불면증 (집중 관리 필요)</p>
                                        </div>
                                        <div className="text-right flex items-center justify-end gap-6">
                                            <span className="text-xl font-bold text-slate-700">총합 점수</span>
                                            <div className="px-8 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm text-3xl font-black text-purple-600">{surveyScores.isi} <span className="text-base text-slate-400">/ 28</span></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {effectiveTab === 'concentration' && !is10MinMode && (
                        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-md">
                            <div className="p-6 md:p-8 space-y-6">
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-black text-slate-900">학습 집중력 설문</h2>
                                    <p className="text-sm font-bold text-slate-500 mt-1">공부 몰입도 및 비집중 유발 요인 점검</p>
                                </div>
                                <div className="p-4 bg-amber-50/60 border border-amber-100 rounded-2xl text-base text-amber-950 font-medium leading-relaxed">
                                    수업 및 자습 중 비집중을 유발하는 요인들과 <strong>최근 한 달간의 학습 경험</strong>을 바탕으로 체크해 주세요.
                                </div>

                                <div className="space-y-4">
                                    {CONCENTRATION_QUESTIONS.map((q, idx) => (
                                        <div key={idx} className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-amber-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                                            <div className="text-lg md:text-xl font-extrabold text-slate-900 leading-snug flex items-start gap-3">
                                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-black text-sm shrink-0 mt-0.5">
                                                    {idx + 1}
                                                </span>
                                                <span className="pt-0.5">{q}</span>
                                            </div>
                                            <div className="grid grid-cols-5 gap-1.5 shrink-0">
                                                {[
                                                    { score: 0, label: '전혀 아님' },
                                                    { score: 1, label: '가끔' },
                                                    { score: 2, label: '자주' },
                                                    { score: 3, label: '매우 자주' },
                                                    { score: 4, label: '항상' }
                                                ].map(({ score, label }) => {
                                                    const isSelected = concentrationAnswers[idx] === score;
                                                    return (
                                                        <button
                                                            key={score}
                                                            type="button"
                                                            onClick={() => { const a = [...concentrationAnswers]; a[idx] = score; setConcentrationAnswers(a); }}
                                                            className={`px-2.5 py-2 rounded-xl text-center font-bold transition-all flex flex-col items-center min-w-[56px] border ${isSelected
                                                                ? 'bg-amber-500 border-amber-500 text-white shadow-md scale-105'
                                                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-amber-50'
                                                                }`}
                                                        >
                                                            <span className="text-sm font-black">{score}점</span>
                                                            <span className={`text-[10px] font-semibold mt-0.5 ${isSelected ? 'text-amber-100' : 'text-slate-400'}`}>{label}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center bg-slate-50 p-5 rounded-2xl">
                                    <span className="text-base font-bold text-slate-600">학습 집중력 지수 (Concentration Score)</span>
                                    <div className="text-3xl font-black text-amber-600">{surveyScores.concentration} <span className="text-base font-bold text-slate-400">/ 28</span></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {effectiveTab === 'adrenal' && !is10MinMode && (
                        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-md">
                            <div className="p-6 md:p-8 space-y-6">
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-black text-slate-900">부신피로 (Adrenal Fatigue) 자가 진단</h2>
                                    <p className="text-sm font-bold text-slate-500 mt-1">스트레스 저항력 및 호르몬 피로도 분석</p>
                                </div>
                                <div className="p-4 bg-orange-50/60 border border-orange-100 rounded-2xl text-base text-orange-950 font-medium leading-relaxed">
                                    각 항목에 대해 점수를 선택하세요: 전혀 없음(0점) / 가끔(1점) / 자주(2점) / 항상(3점)
                                </div>

                                <div className="space-y-8">
                                    {ADRENAL_QUESTIONS.map((category, catIdx) => {
                                        let startIdx = 0;
                                        for (let i = 0; i < catIdx; i++) startIdx += ADRENAL_QUESTIONS[i].questions.length;

                                        return (
                                            <div key={catIdx} className="space-y-3">
                                                <h3 className="text-lg font-black text-orange-900 bg-orange-50 px-4 py-2 rounded-xl border border-orange-100 inline-block">{category.category}</h3>
                                                <div className="space-y-3">
                                                    {category.questions.map((q, qIdx) => {
                                                        const globalIdx = startIdx + qIdx;
                                                        const currentScore = adrenalAnswers[globalIdx];
                                                        return (
                                                            <div key={globalIdx} className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-orange-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
                                                                <span className="text-base md:text-lg font-bold text-slate-800 leading-snug">{q}</span>
                                                                <div className="grid grid-cols-4 gap-2 shrink-0">
                                                                    {[0, 1, 2, 3].map(score => (
                                                                        <button
                                                                            key={score}
                                                                            type="button"
                                                                            onClick={() => { const a = [...adrenalAnswers]; a[globalIdx] = score; setAdrenalAnswers(a); }}
                                                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${currentScore === score ? 'bg-orange-500 text-white border-orange-500 shadow-md scale-105' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-orange-200'}`}
                                                                        >
                                                                            {score}점
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="mt-8 pt-6 border-t border-slate-100 space-y-6">
                                    <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase mb-1">총점 (Total Score)</p>
                                            <p className={`text-lg font-bold ${adrenalEvaluation.color}`}>{adrenalEvaluation.text}</p>
                                        </div>
                                        <div className="text-3xl font-black text-slate-800">{surveyScores.adrenal} <span className="text-base font-bold text-slate-300">/ 42</span></div>
                                    </div>

                                    <div className="bg-amber-50 p-5 rounded-xl border border-amber-100">
                                        <h4 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
                                            <span>💡</span> 부신 건강을 돕는 생활 수칙
                                        </h4>
                                        <ul className="space-y-2 text-sm text-amber-800">
                                            <li className="flex gap-2">
                                                <span className="font-bold">•</span>
                                                <span><strong>밤 11시 이전 취침</strong>: 부신 호르몬이 가장 많이 재생되는 시간입니다.</span>
                                            </li>
                                            <li className="flex gap-2">
                                                <span className="font-bold">•</span>
                                                <span><strong>비타민 C와 마그네슘 섭취</strong>: 부신이 호르몬을 만들 때 가장 많이 소모하는 영양소입니다.</span>
                                            </li>
                                            <li className="flex gap-2">
                                                <span className="font-bold">•</span>
                                                <span><strong>단순 당류 줄이기</strong>: 설탕과 밀가루는 혈당을 롤러코스터처럼 움직이게 하여 부신에 큰 부담을 줍니다.</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {effectiveTab === 'cfs' && !is10MinMode && (
                        <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-6 shadow-sm">
                            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                                <p className="text-sm font-bold text-emerald-800">6개월 이상 지속되는 만성 피로를 경험하고 있나요?</p>
                                <p className="text-xs text-emerald-600 mt-1">일상생활에 지장을 줄 정도의 피로감이 반년 이상 계속되는 경우를 말합니다.</p>
                                <div className="flex gap-4 mt-3">
                                    <button onClick={() => setFatigueCore(true)} className={`px-6 py-2 rounded-lg font-bold transition-all ${fatigueCore ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white border border-emerald-200 text-emerald-600'}`}>예</button>
                                    <button onClick={() => setFatigueCore(false)} className={`px-6 py-2 rounded-lg font-bold transition-all ${!fatigueCore ? 'bg-slate-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600'}`}>아니오</button>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {FATIGUE_SYMPTOMS.map((s, i) => (
                                    <label key={i} className={`p-4 rounded-xl border cursor-pointer transition-all ${fatigueSymptoms[i] ? 'bg-emerald-50 border-emerald-500 shadow-sm' : 'bg-white border-slate-200'}`}>
                                        <input type="checkbox" checked={fatigueSymptoms[i]} onChange={() => { const a = [...fatigueSymptoms]; a[i] = !a[i]; setFatigueSymptoms(a); }} className="mr-3" />
                                        <span className="text-sm font-medium">{s}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {effectiveTab === 'learning_traits' && !is10MinMode && (
                        <div className="space-y-6">
                            {/* Header Banner */}
                            <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 p-6 rounded-3xl text-white shadow-lg">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl">🧬</span>
                                            <h4 className="text-xl font-black">5대 과학적 학습 기질 &amp; 전략 진단</h4>
                                            <span className="px-2.5 py-0.5 bg-white/20 rounded-full text-xs font-bold backdrop-blur-sm">Big5 · TCI · MSLQ · Grit 기반</span>
                                        </div>
                                        <p className="text-xs text-purple-100 max-w-2xl leading-relaxed">
                                            실제 공부 행동과 가장 일치하는 점수를 선택해 주세요. 15개 문항 응답에 따라 고유의 학습 기질 프로파일과 맞춤형 전략이 생성됩니다.
                                        </p>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 text-center shrink-0">
                                        <p className="text-[10px] text-purple-200 uppercase font-bold tracking-wider">현재 진단 유형</p>
                                        <p className="text-base font-black text-white">{traits.archetypeBadge}</p>
                                        <p className="text-[11px] text-purple-200 mt-0.5">평균 {traits.totalAverage} / 5.0점</p>
                                    </div>
                                </div>

                                {/* 5-Dimension Mini Progress Gauges */}
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mt-5 pt-4 border-t border-white/15">
                                    {LEARNING_TRAITS_CATEGORIES.map(cat => {
                                        const score = traits.scores[cat.key];
                                        return (
                                            <div key={cat.key} className="bg-black/20 p-2.5 rounded-xl border border-white/10">
                                                <div className="flex items-center justify-between text-[11px] font-bold text-purple-100 mb-1">
                                                    <span>{cat.icon} {cat.name}</span>
                                                    <span className="text-white font-black">{score}점</span>
                                                </div>
                                                <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
                                                    <div className="bg-white rounded-full h-full transition-all duration-300" style={{ width: `${score}%` }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* 15 Questions Grouped by Category */}
                            <div className="space-y-6">
                                {LEARNING_TRAITS_CATEGORIES.map(cat => {
                                    const categoryQuestions = LEARNING_TRAITS_QUESTIONS.filter(q => q.category === cat.key);
                                    return (
                                        <div key={cat.key} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                                            <div className="p-4 px-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                                <div className="flex items-center gap-2.5">
                                                    <span className="text-xl">{cat.icon}</span>
                                                    <div>
                                                        <h4 className="text-sm font-black text-slate-800">{cat.name} ({cat.englishName})</h4>
                                                        <p className="text-[11px] text-slate-400 font-medium">{cat.description}</p>
                                                    </div>
                                                </div>
                                                <span className="text-xs font-bold px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
                                                    {traits.scores[cat.key]}점
                                                </span>
                                            </div>

                                            <div className="p-6 space-y-5 divide-y divide-slate-100">
                                                {categoryQuestions.map(q => {
                                                    const currentAnswer = (learningTraitsAnswers && learningTraitsAnswers[q.id - 1]) ?? 3;
                                                    return (
                                                        <div key={q.id} className={q.id % 3 === 1 ? '' : 'pt-5'}>
                                                            <div className="mb-3">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-black flex items-center justify-center">
                                                                        {q.id}
                                                                    </span>
                                                                    <span className="text-sm md:text-base font-bold text-slate-800">{q.question}</span>
                                                                </div>
                                                                <p className="text-xs text-slate-400 pl-7">{q.detail}</p>
                                                            </div>

                                                            {/* 1-5 Point Buttons */}
                                                            <div className="grid grid-cols-5 gap-2 pl-0 md:pl-7">
                                                                {[
                                                                    { val: 1, label: '전혀 아님' },
                                                                    { val: 2, label: '그렇지 않음' },
                                                                    { val: 3, label: '보통이다' },
                                                                    { val: 4, label: '그러하다' },
                                                                    { val: 5, label: '매우 그러함' }
                                                                ].map(opt => {
                                                                    const isSelected = currentAnswer === opt.val;
                                                                    return (
                                                                        <button
                                                                            key={opt.val}
                                                                            type="button"
                                                                            onClick={() => {
                                                                                if (setLearningTraitsAnswers) {
                                                                                    setLearningTraitsAnswers(prev => {
                                                                                        const updated = [...(prev || new Array(15).fill(3))];
                                                                                        updated[q.id - 1] = opt.val;
                                                                                        return updated;
                                                                                    });
                                                                                }
                                                                            }}
                                                                            className={`py-2.5 px-1 rounded-xl text-xs font-bold border transition-all flex flex-col items-center justify-center gap-0.5 ${isSelected
                                                                                ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-[1.02]'
                                                                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                                                                                }`}
                                                                        >
                                                                            <span className="text-sm font-black">{opt.val}</span>
                                                                            <span className="text-[10px] font-medium opacity-80 whitespace-nowrap">{opt.label}</span>
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Bottom Comprehensive Archetype Card */}
                            <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 p-6 rounded-3xl border border-indigo-100 shadow-sm space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">🏆</span>
                                        <div>
                                            <h4 className="text-base font-black text-slate-900">학습 기질 종합 진단 결과</h4>
                                            <p className="text-xs text-slate-500">15개 문항 응답을 실시간 종합 분석한 학생의 대표 학습 성향입니다.</p>
                                        </div>
                                    </div>
                                    <span className="px-3.5 py-1.5 bg-indigo-600 text-white font-black text-xs rounded-xl shadow-sm">
                                        {traits.archetypeBadge}
                                    </span>
                                </div>

                                <div className="bg-white p-5 rounded-2xl border border-indigo-100 space-y-3">
                                    <p className="text-sm text-slate-700 leading-relaxed font-medium">
                                        {traits.archetypeDescription}
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
                                        <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                                            <p className="font-bold text-emerald-800 mb-1">💪 핵심 강점</p>
                                            <p className="text-emerald-700">{traits.coreStrength}</p>
                                        </div>
                                        <div className="bg-amber-50 p-3 rounded-xl border border-amber-100">
                                            <p className="font-bold text-amber-800 mb-1">⚠️ 유의 및 보완점</p>
                                            <p className="text-amber-700">{traits.cautionPoint}</p>
                                        </div>
                                        <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                                            <p className="font-bold text-indigo-800 mb-1">🎧 추천 몰입 환경</p>
                                            <p className="text-indigo-700">{traits.recommendedEnvironment}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex gap-4">
                    {((!is10MinMode && effectiveTab !== 'ans') || (is10MinMode && (effectiveTab !== 'bai' || baiSubPage === 2))) && (
                        <button
                            onClick={() => {
                                if (effectiveTab === 'bai' && baiSubPage === 2) {
                                    setBaiSubPage(1);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                    return;
                                }
                                if (is10MinMode) {
                                    if (effectiveTab === 'isi') {
                                        setActiveTab('bai');
                                        setBaiSubPage(2);
                                    }
                                } else {
                                    const t: SurveyTab[] = ['ans', 'bai', 'isi', 'concentration', 'adrenal', 'cfs', 'learning_traits'];
                                    const prevIdx = t.indexOf(effectiveTab) - 1;
                                    if (prevIdx >= 0) {
                                        const prevTab = t[prevIdx];
                                        setActiveTab(prevTab);
                                        if (prevTab === 'bai') {
                                            setBaiSubPage(2);
                                        }
                                    }
                                }
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="flex-1 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
                        >
                            {effectiveTab === 'bai' && baiSubPage === 2 ? 'Previous (페이지 1로 이동)' : 'Previous'}
                        </button>
                    )}
                    <button
                        onClick={() => {
                            if (is10MinMode) {
                                if (effectiveTab === 'bai') {
                                    if (baiSubPage === 1) {
                                        setBaiSubPage(2);
                                    } else {
                                        setActiveTab('isi');
                                    }
                                } else if (effectiveTab === 'isi') {
                                    setStep('protocol');
                                } else {
                                    setStep('protocol');
                                }
                            } else {
                                if (effectiveTab === 'ans') {
                                    setActiveTab('bai');
                                    setBaiSubPage(1);
                                } else if (effectiveTab === 'bai') {
                                    if (baiSubPage === 1) {
                                        setBaiSubPage(2);
                                    } else {
                                        setActiveTab('isi');
                                    }
                                } else if (effectiveTab === 'isi') {
                                    setActiveTab('concentration');
                                } else if (effectiveTab === 'concentration') {
                                    setActiveTab('adrenal');
                                } else if (effectiveTab === 'adrenal') {
                                    setActiveTab('cfs');
                                } else if (effectiveTab === 'cfs') {
                                    setActiveTab('learning_traits');
                                } else {
                                    setStep('protocol');
                                }
                            }
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="flex-[2] py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-lg hover:bg-slate-800 transition-all text-base md:text-lg"
                    >
                        {is10MinMode
                            ? (effectiveTab === 'isi'
                                ? 'Next: 2단계 학습 집중력 프로토콜 검사 →'
                                : (effectiveTab === 'bai' && baiSubPage === 1)
                                    ? 'Next: 1단계-2 불안 검사 계속 (페이지 2) →'
                                    : 'Next: 1단계-3 수면 지수 검사(ISI) →')
                            : (effectiveTab === 'learning_traits'
                                ? 'Go to Learning Protocol (2단계 환경) →'
                                : effectiveTab === 'cfs'
                                    ? 'Next: 🧬 학습 기질 & 전략 진단 →'
                                    : (activeTab === 'bai' && baiSubPage === 1)
                                        ? 'Next Step (페이지 2로 이동) →'
                                        : 'Next Step →')}
                    </button>
                </div>
            </div>
        </Layout>
    );
};
