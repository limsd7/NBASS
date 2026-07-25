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

type SurveyTab = 'ans' | 'bai' | 'isi' | 'concentration' | 'cfs' | 'adrenal';

interface SurveysStepProps {
    // Navigation
    onNext: () => void;
    setStep: (step: any) => void;

    // Layout props
    activeMenu: 'dashboard' | 'assessment' | 'history' | 'progress' | 'resources';
    onMenuChange: (menu: any) => void;
    isDarkMode: boolean;
    onToggleDarkMode: () => void;
    onAdminClick: () => void;

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
    config,
    activeTab,
    setActiveTab,
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

    return (
        <Layout activeMenu={activeMenu} onMenuChange={onMenuChange} isDarkMode={isDarkMode} onToggleDarkMode={onToggleDarkMode} onAdminClick={onAdminClick}>
            <StepProgressBar currentStep="surveys" isMedicalMode={config.isMedicalMode} onStepClick={setStep} />
            <AdminPasswordModal isOpen={showAdminPassword} password={adminPasswordInput} onPasswordChange={onAdminPasswordChange} onConfirm={onAdminConfirm} onCancel={onAdminCancel} />
            <ConfigModal />
            <div className="w-full max-w-full space-y-6 pb-20 mt-4">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-20 z-40 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src="./psychological_logo.jpg" alt="Logo" className="w-8 h-8 object-contain" />
                        <h3 className="text-lg font-bold text-slate-900">Psychological Assessment</h3>
                        <button
                            onClick={() => window.open('survey-form-student.html', 'StudentSurvey', 'width=900,height=800,scrollbars=yes')}
                            className="ml-4 px-3 py-1.5 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-700 transition-all flex items-center gap-1"
                        >
                            <span>📋</span>
                            <span>학생 창 열기</span>
                        </button>
                    </div>

                    <div className="flex gap-4 overflow-x-auto pb-1">
                        <div className="text-right">
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Sym</p>
                            <p className="text-lg font-bold text-red-600">{surveyScores.snsCount}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Para</p>
                            <p className="text-lg font-bold text-blue-600">{surveyScores.pnsCount}</p>
                        </div>
                        <div className="text-right border-l pl-4">
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Focus</p>
                            <p className="text-lg font-bold text-amber-600">{surveyScores.concentration}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-slate-400 uppercase font-bold">BAI</p>
                            <p className="text-lg font-bold text-indigo-600">{surveyScores.bai}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-slate-400 uppercase font-bold">ISI</p>
                            <p className="text-lg font-bold text-emerald-600">{surveyScores.isi}</p>
                        </div>
                    </div>
                </div>

                <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
                    {['ans', 'bai', 'isi', 'concentration', 'adrenal', 'cfs'].map(t => (
                        <button key={t} onClick={() => setActiveTab(t as SurveyTab)} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === t ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-50'}`}>
                            {t === 'bai' ? '불안 (BAI)' : t === 'isi' ? '수면 (ISI)' : t === 'concentration' ? '집중력' : t === 'adrenal' ? '부신피로' : t.toUpperCase()}
                        </button>
                    ))}
                </div>

                <div className="animate-in fade-in duration-300">
                    {activeTab === 'ans' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
                                <div className="p-4 bg-red-600 text-white font-bold text-center">Sympathetic (교감신경)</div>
                                <div className="p-6 grid gap-2 bg-slate-50">
                                    {SYMPATHETIC_SYMPTOMS.map(s => (
                                        <label key={s.label} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${snsSymptomSelection.includes(s.label) ? 'bg-red-50 border-red-500' : 'bg-white hover:border-red-200'}`}>
                                            <input type="checkbox" checked={snsSymptomSelection.includes(s.label)} onChange={() => toggleSnsSymptom(s.label)} className="accent-red-600 mt-1" />
                                            <div>
                                                <span className="text-sm font-bold text-slate-800">{s.label}</span>
                                                <p className="text-xs text-slate-500 mt-0.5">{s.desc}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
                                <div className="p-4 bg-blue-700 text-white font-bold text-center">Parasympathetic (부교감신경)</div>
                                <div className="p-6 grid gap-2 bg-slate-50">
                                    {PARASYMPATHETIC_SYMPTOMS.map(s => (
                                        <label key={s.label} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${pnsSymptomSelection.includes(s.label) ? 'bg-blue-50 border-blue-500' : 'bg-white hover:border-blue-200'}`}>
                                            <input type="checkbox" checked={pnsSymptomSelection.includes(s.label)} onChange={() => togglePnsSymptom(s.label)} className="accent-blue-700 mt-1" />
                                            <div>
                                                <span className="text-sm font-bold text-slate-800">{s.label}</span>
                                                <p className="text-xs text-slate-500 mt-0.5">{s.desc}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'bai' && (
                        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                            <div className="p-6 border-b border-slate-100 flex gap-1">
                                {([1, 2] as const).map(p => (
                                    <button key={p} onClick={() => setBaiSubPage(p)} className={`px-4 py-1.5 text-xs font-bold rounded-t-lg border-x border-t transition-all ${baiSubPage === p ? 'bg-white border-slate-200 -mb-[25px] z-10 text-slate-900' : 'bg-slate-50 border-transparent text-slate-400'}`}>페이지{p === 2 ? '2' : ''}</button>
                                ))}
                            </div>

                            <div className="p-8 space-y-6">
                                <h2 className="text-2xl font-bold text-slate-800">Beck 불안 척도 Beck Anxiety Inventory : BAI</h2>

                                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 leading-relaxed">
                                    각 문장을 자세히 읽어보시고 오늘을 포함해서 지난 1주일 동안 당신의 상태가 어떠했는지 가장 잘 나타낸다고 생각하는 번호를 표시하여 주십시오. 응답방식은 다음과 같습니다.
                                </div>

                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-[11px] md:text-xs font-bold text-slate-500 uppercase">
                                            <th className="pb-4 font-bold text-slate-900">질문 내용</th>
                                            {["전혀 느끼지 않았다(0점)", "조금 느꼈다(1점)", "상당히 느꼈다(2점)", "심하게 느꼈다(3점)"].map((h, i) => (
                                                <th key={i} className="pb-4 text-center px-2 w-20 leading-tight">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {BAI_QUESTIONS.map((q, idx) => {
                                            const startIdx = baiSubPage === 1 ? 0 : 10;
                                            const endIdx = baiSubPage === 1 ? 10 : 21;
                                            if (idx < startIdx || idx >= endIdx) return null;

                                            return (
                                                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                                    <td className="py-4 pr-4 text-sm font-medium text-slate-700">
                                                        {idx + 1}. {q}
                                                    </td>
                                                    {[0, 1, 2, 3].map(score => (
                                                        <td key={score} className="py-4 text-center">
                                                            <div className="flex justify-center">
                                                                <button
                                                                    onClick={() => { const a = [...baiAnswers]; a[idx] = score; setBaiAnswers(a); }}
                                                                    className={`w-6 h-6 rounded-md border-2 transition-all flex items-center justify-center ${baiAnswers[idx] === score ? 'bg-blue-600 border-blue-600 shadow-sm' : 'bg-white border-slate-200 hover:border-blue-200'}`}
                                                                >
                                                                    {baiAnswers[idx] === score && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                                                </button>
                                                            </div>
                                                        </td>
                                                    ))}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>

                                <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">총점 (Total Score)</p>
                                        <p className="text-2xl font-black text-blue-600">{surveyScores.bai} <span className="text-sm font-bold text-slate-400">/ 63</span></p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">상태 평가 (Evaluation)</p>
                                        <p className={`text-lg font-bold ${baiEvaluation.color}`}>{baiEvaluation.text}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'isi' && (
                        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                            <div className="p-8 space-y-6">
                                <h2 className="text-2xl font-bold text-slate-800">ISI <span className="text-base font-normal text-slate-500 ml-2">Insomnia Severity Index</span></h2>
                                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 leading-relaxed">
                                    지난 2주간 동안 귀하의 불면증 문제에 해당하는 정도를 선택해 주시기 바랍니다.
                                </div>

                                <div className="space-y-8">
                                    {ISI_QUESTIONS.map((q, idx) => (
                                        <div key={idx} className="space-y-4">
                                            <p className="text-sm font-bold text-slate-800">{idx + 1}. {q.label}</p>
                                            <div className="grid grid-cols-5 gap-2">
                                                {q.options.map((option, score) => (
                                                    <button
                                                        key={score}
                                                        onClick={() => { const a = [...isiAnswers]; a[idx] = score; setIsiAnswers(a); }}
                                                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${isiAnswers[idx] === score ? 'bg-violet-600 border-violet-600 shadow-md scale-[1.02]' : 'bg-white border-slate-100 hover:bg-slate-50'}`}
                                                    >
                                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isiAnswers[idx] === score ? 'bg-white border-white' : 'border-slate-300'}`}>
                                                            {isiAnswers[idx] === score && <div className="w-2 h-2 bg-violet-600 rounded-full"></div>}
                                                        </div>
                                                        <span className={`text-[10px] md:text-xs font-bold text-center leading-tight ${isiAnswers[idx] === score ? 'text-white' : 'text-slate-500'}`}>{option}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8 pt-6 border-t border-slate-100 bg-slate-50 p-6 rounded-2xl">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                        <div className="space-y-1 text-xs text-slate-400 font-medium">
                                            <p>0-7점: 정상적인 불면증이 아닙니다.</p>
                                            <p>8-14점: 경미한 불면경향이 있습니다.</p>
                                            <p>15-21점: 중등도의 불면증이 있습니다.</p>
                                            <p>22점 이상: 심한 불면증이 있습니다.</p>
                                        </div>
                                        <div className="text-right flex items-center justify-end gap-6">
                                            <span className="text-2xl font-black text-slate-800">총합</span>
                                            <div className="px-8 py-3 bg-white border border-slate-200 rounded-xl shadow-inner text-4xl font-black text-violet-600">{surveyScores.isi}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'concentration' && (
                        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                            <div className="p-8 space-y-6">
                                <h2 className="text-2xl font-bold text-slate-800">학습 집중력 자가진단</h2>
                                <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg text-sm text-amber-900 leading-relaxed">
                                    수업 비집중력을 유발시키는 요인들과 최소 한 달간의 경험을 바탕으로 체크해 주세요.
                                </div>

                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-[11px] md:text-xs font-bold text-slate-500 uppercase">
                                            <th className="pb-4 font-bold text-slate-900">질문 내용</th>
                                            {["전혀 그렇지 않다", "가끔 그렇다", "자주 그렇다", "매우 자주 그렇다", "항상 그렇다"].map((h, i) => (
                                                <th key={i} className="pb-4 text-center px-2 w-20 leading-tight">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {CONCENTRATION_QUESTIONS.map((q, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                                <td className="py-4 pr-4 text-sm font-medium text-slate-700">{idx + 1}. {q}</td>
                                                {[0, 1, 2, 3, 4].map(score => (
                                                    <td key={score} className="py-4 text-center">
                                                        <div className="flex justify-center">
                                                            <button
                                                                onClick={() => { const a = [...concentrationAnswers]; a[idx] = score; setConcentrationAnswers(a); }}
                                                                className={`w-6 h-6 rounded-md border-2 transition-all flex items-center justify-center ${concentrationAnswers[idx] === score ? 'bg-amber-600 border-amber-600 shadow-sm' : 'bg-white border-slate-200 hover:border-amber-200'}`}
                                                            >
                                                                {concentrationAnswers[idx] === score && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                                            </button>
                                                        </div>
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end items-center gap-6">
                                    <span className="text-sm font-bold text-slate-400">학습 집중력 지수 (Concentration Score)</span>
                                    <div className="text-3xl font-black text-amber-600">{surveyScores.concentration} <span className="text-base font-bold text-slate-300">/ 28</span></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'adrenal' && (
                        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                            <div className="p-8 space-y-6">
                                <h2 className="text-2xl font-bold text-slate-800">부신피로 자가 진단</h2>
                                <div className="p-4 bg-orange-50 border border-orange-100 rounded-lg text-sm text-orange-900 leading-relaxed">
                                    각 항목에 대해 점수를 매겨보세요: 전혀 그렇지 않다(0점) / 가끔 그렇다(1점) / 자주 그렇다(2점) / 항상 그렇다(3점)
                                </div>

                                <div className="space-y-8">
                                    {ADRENAL_QUESTIONS.map((category, catIdx) => {
                                        let startIdx = 0;
                                        for (let i = 0; i < catIdx; i++) startIdx += ADRENAL_QUESTIONS[i].questions.length;

                                        return (
                                            <div key={catIdx}>
                                                <h3 className="text-lg font-bold text-slate-800 mb-4">{category.category}</h3>
                                                <table className="w-full text-left">
                                                    <tbody className="divide-y divide-slate-100">
                                                        {category.questions.map((q, qIdx) => {
                                                            const globalIdx = startIdx + qIdx;
                                                            return (
                                                                <tr key={globalIdx} className="hover:bg-slate-50 transition-colors">
                                                                    <td className="py-3 pr-4 text-sm font-medium text-slate-700">{q}</td>
                                                                    <td className="py-3 w-40">
                                                                        <div className="flex justify-end gap-1">
                                                                            {[0, 1, 2, 3].map(score => (
                                                                                <button
                                                                                    key={score}
                                                                                    onClick={() => { const a = [...adrenalAnswers]; a[globalIdx] = score; setAdrenalAnswers(a); }}
                                                                                    className={`w-8 h-8 rounded-lg text-xs font-bold border transition-all ${adrenalAnswers[globalIdx] === score ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-slate-400 border-slate-200 hover:border-orange-200'}`}
                                                                                >
                                                                                    {score}
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
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
                                        <div className="text-3xl font-black text-slate-800">{surveyScores.adrenal} <span className="text-base font-bold text-slate-300">/ 45</span></div>
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

                    {activeTab === 'cfs' && (
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
                </div>

                <div className="flex gap-4">
                    {activeTab !== 'ans' && <button onClick={() => { const t: SurveyTab[] = ['ans', 'bai', 'isi', 'concentration', 'adrenal', 'cfs']; setActiveTab(t[t.indexOf(activeTab) - 1]); }} className="flex-1 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all">Previous</button>}
                    <button
                        onClick={() => {
                            if (activeTab === 'ans') setActiveTab('bai');
                            else if (activeTab === 'bai') setActiveTab('isi');
                            else if (activeTab === 'isi') setActiveTab('concentration');
                            else if (activeTab === 'concentration') setActiveTab('adrenal');
                            else if (activeTab === 'adrenal') setActiveTab('cfs');
                            else setStep('protocol');
                        }}
                        className="flex-[2] py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-lg hover:bg-slate-800 transition-all"
                    >
                        {activeTab === 'cfs' ? 'Go to Learning Protocol' : 'Next Step'}
                    </button>
                </div>
            </div>
        </Layout>
    );
};
