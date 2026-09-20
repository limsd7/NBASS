import React from 'react';
import { Layout } from '../Layout';
import { StepProgressBar } from '../ui/StepProgressBar';
import { LearningAnalyticsData, StudentInfo } from '../../types';
import { calculateRecommendedSubjectRatios } from '../../services/studyStrategyEngine';

interface AnalyticsStepProps {
    // Navigation
    onNext: () => void;
    onBack: () => void;

    // Layout props
    activeMenu: any;
    onMenuChange: (menu: any) => void;
    isDarkMode: boolean;
    onToggleDarkMode: () => void;
    onHomeClick?: () => void;

    // Config
    config: {
        isMedicalMode: boolean;
        usePortable: boolean;
    };

    // Analytics State
    analytics: LearningAnalyticsData;
    setAnalytics: React.Dispatch<React.SetStateAction<LearningAnalyticsData>>;
    student?: StudentInfo;

    // Progress Bar
    onStepClick?: (stepId: string) => void;
}

export const AnalyticsStep: React.FC<AnalyticsStepProps> = ({
    onNext,
    onBack,
    activeMenu,
    onMenuChange,
    isDarkMode,
    onToggleDarkMode,
    onHomeClick,
    config,
    analytics,
    setAnalytics,
    student,
    onStepClick
}) => {
    // 처음 검사 단계에 진입했을 때 조절하기 편한 기준값 제안 (완료 전까지는 isTested: false 유지)
    React.useEffect(() => {
        if (!analytics.isTested && !analytics.goldenTimeStart) {
            setAnalytics(prev => ({
                ...prev,
                pureStudyRatio: prev.pureStudyRatio || 65,
                avgFocusDuration: prev.avgFocusDuration || 50,
                distractionCount: prev.distractionCount || 3,
                goldenTimeStart: prev.goldenTimeStart || "19:00",
                goldenTimeEnd: prev.goldenTimeEnd || "22:00",
                lowEfficiencyTime: prev.lowEfficiencyTime || "14:00-16:00",
                chronotype: prev.chronotype || 'neutral',
                subjectRatios: (prev.subjectRatios && Object.values(prev.subjectRatios).some(v => v > 0))
                    ? prev.subjectRatios
                    : calculateRecommendedSubjectRatios(student),
                goalAchievementRate: prev.goalAchievementRate || 75,
                avgSleepHours: prev.avgSleepHours || 6.5,
                preferredLocation: prev.preferredLocation || '독서실',
                studyStreak: prev.studyStreak || 3,
                energyPattern: prev.energyPattern || 'stable'
            }));
        }
    }, []);

    const handleNext = () => {
        setAnalytics(prev => ({
            ...prev,
            isTested: true,
            testDate: prev.testDate || new Date().toISOString().split('T')[0]
        }));
        onNext();
    };
    return (
        <Layout onHomeClick={onHomeClick} activeMenu={activeMenu} onMenuChange={onMenuChange} isDarkMode={isDarkMode} onToggleDarkMode={onToggleDarkMode}>
            <StepProgressBar currentStep="analytics" isMedicalMode={config.isMedicalMode} isPortableMode={config.usePortable} onStepClick={onStepClick} />
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-24 mt-6 px-4">
                <div className="flex flex-col items-center text-center gap-4">
                    <img src="./학습밀도 및 패턴 logo.JPG" alt="Logo" className="w-24 h-24 object-contain drop-shadow-sm" />
                    <div>
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">학습 밀도 및 패턴 분석 검사</h2>
                        <p className="text-base md:text-lg font-semibold text-slate-500 mt-2">단순 공부 시간을 넘어 본질적인 학습의 질과 몰입 패턴을 정밀 분석합니다.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8">
                    {/* 1. 학습 밀도 분석 */}
                    <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-md space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                            <div className="w-3 h-7 bg-blue-600 rounded-full"></div>
                            <h3 className="text-2xl font-black text-slate-900">1. 학습 밀도 및 순공 집중력</h3>
                        </div>
                        <div className="space-y-6">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <label className="text-base md:text-lg font-black text-slate-800">📊 순공 시간 비율 (Pure Study Ratio)</label>
                                        <span className="text-xl md:text-2xl font-black text-blue-600 bg-blue-50 px-3.5 py-1 rounded-xl">{analytics.pureStudyRatio}%</span>
                                    </div>
                                    <div className="text-xs md:text-sm text-slate-600 leading-relaxed font-medium bg-blue-50/80 p-4 rounded-2xl border border-blue-200/80 space-y-2">
                                        <p className="font-bold text-slate-800">
                                            * 전체 착석 시간 중 스마트폰 확인, 잡념, 단순 필기 등을 제외하고 <span className="text-blue-700 font-extrabold">온전하게 뇌를 몰입하여 공부한 실질적 시간 비율</span>을 조절하세요.
                                        </p>
                                        <div className="bg-white/80 p-3 rounded-xl border border-blue-100 text-xs text-slate-700 space-y-1">
                                            <span className="font-extrabold text-blue-700 block">💡 쉽게 계산하고 입력하는 팁:</span>
                                            <p>• <b>100분 기준:</b> 100분 동안 책상에 앉아 70분을 온전히 집중했다면 <b>70%</b>로 설정하시면 쉽습니다.</p>
                                            <p>• <b>1시간(60분) 기준:</b> 50분 수업(공부) + 10분 휴식 중 40분을 실질적으로 집중했다면 50분 중 40분이므로 약 <b>80%</b>(40/50)입니다.</p>
                                        </div>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max="100" 
                                        value={analytics.pureStudyRatio} 
                                        onChange={e => setAnalytics({ ...analytics, pureStudyRatio: Number(e.target.value) })} 
                                        className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" 
                                    />
                                <div className="flex justify-between text-xs font-bold text-slate-400">
                                    <span>0% (집중 불가)</span>
                                    <span>50% (절반 집중)</span>
                                    <span>100% (완전 몰입)</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                                <div className="space-y-2">
                                    <label className="text-sm md:text-base font-black text-slate-800">⏱️ 1회 평균 연속 집중 시간 (분)</label>
                                    <input 
                                        type="number" 
                                        placeholder="예: 50" 
                                        value={analytics.avgFocusDuration || ''} 
                                        onChange={e => setAnalytics({ ...analytics, avgFocusDuration: e.target.value ? parseInt(e.target.value, 10) || 0 : 0 })} 
                                        className="w-full p-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-base focus:border-blue-500 focus:outline-none" 
                                    />
                                    <p className="text-xs text-slate-400">중간에 쉬지 않고 한 번에 집중 가능한 분 단위</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm md:text-base font-black text-slate-800">⚠️ 시간당 주의분산 횟수 (산만도)</label>
                                    <input 
                                        type="number" 
                                        placeholder="예: 3" 
                                        value={analytics.distractionCount || ''} 
                                        onChange={e => setAnalytics({ ...analytics, distractionCount: e.target.value ? parseInt(e.target.value, 10) || 0 : 0 })} 
                                        className="w-full p-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-base focus:border-blue-500 focus:outline-none" 
                                    />
                                    <p className="text-xs text-slate-400">1시간 동안 폰 확인, 잡생각 등으로 흐트러지는 횟수</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. 시간대별 효율성 */}
                    <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-md space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                            <div className="w-3 h-7 bg-amber-500 rounded-full"></div>
                            <h3 className="text-2xl font-black text-slate-900">2. 골든타임 & 일주기 생체리듬</h3>
                        </div>
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm md:text-base font-black text-slate-800">🌅 골든타임 시작 (가장 공부 잘 되는 시간)</label>
                                    <input 
                                        type="time" 
                                        value={analytics.goldenTimeStart} 
                                        onChange={e => setAnalytics({ ...analytics, goldenTimeStart: e.target.value })} 
                                        className="w-full p-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-base focus:border-amber-500 focus:outline-none" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm md:text-base font-black text-slate-800">🌇 골든타임 종료</label>
                                    <input 
                                        type="time" 
                                        value={analytics.goldenTimeEnd} 
                                        onChange={e => setAnalytics({ ...analytics, goldenTimeEnd: e.target.value })} 
                                        className="w-full p-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-base focus:border-amber-500 focus:outline-none" 
                                    />
                                </div>
                            </div>
                            <div className="space-y-3 pt-2 border-t border-slate-100">
                                <label className="text-base md:text-lg font-black text-slate-800">🧬 일주기 크로노타입 유형 (Chronotype)</label>
                                <p className="text-xs md:text-sm text-amber-900 bg-amber-50 p-3 rounded-2xl font-semibold leading-relaxed">
                                    💡 뇌의 각성과 두뇌 회전이 본능적으로 가장 활발한 시간대를 선택하세요.
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {[
                                        {
                                            id: 'morning',
                                            label: '아침형 🌅',
                                            desc: '07~12시 집중 정점',
                                            detail: '이른 아침에 맑은 정신으로 기상하며, 오전에 학습 효율이 가장 높음.',
                                            color: '#f59e0b'
                                        },
                                        {
                                            id: 'neutral',
                                            label: '주간/중간형 ☀️',
                                            desc: '11~17시 집중 정점',
                                            detail: '낮 시간대와 오후에 뇌 기능이 안정적이며 규칙적인 일과에 최적화.',
                                            color: '#3b82f6'
                                        },
                                        {
                                            id: 'evening',
                                            label: '저녁/올빼미형 🌙',
                                            desc: '19~24시 집중 정점',
                                            detail: '오전엔 멍하지만 오후 늦게와 심야에 두뇌 회전과 몰입이 극대화.',
                                            color: '#6366f1'
                                        }
                                    ].map(t => (
                                        <button
                                            key={t.id}
                                            type="button"
                                            onClick={() => setAnalytics({ ...analytics, chronotype: t.id as any })}
                                            className={`flex flex-col items-center p-4 rounded-2xl border transition-all ${
                                                analytics.chronotype === t.id 
                                                    ? 'text-white shadow-md scale-105' 
                                                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                            }`}
                                            style={analytics.chronotype === t.id ? { backgroundColor: t.color, borderColor: t.color } : {}}
                                        >
                                            <span className="text-base font-black">{t.label}</span>
                                            <span className={`text-xs font-bold mt-1 ${analytics.chronotype === t.id ? 'text-white/90' : 'text-slate-500'}`}>{t.desc}</span>
                                        </button>
                                    ))}
                                </div>
                                {analytics.chronotype && (
                                    <div className="p-3.5 rounded-2xl border bg-amber-50 border-amber-200 text-sm font-bold text-amber-900">
                                        ✓ {
                                            analytics.chronotype === 'morning'
                                                ? '이른 아침에 자연스럽게 기상하며, 오전 시간에 집중력이 가장 높습니다.'
                                                : analytics.chronotype === 'neutral'
                                                    ? '중간형 생체리듬으로, 오전 늦게부터 오후 시간에 최적의 두뇌 기능을 발휘합니다.'
                                                    : '저녁형으로, 오후 늦게부터 밤 시간에 두뇌 회전과 고도의 몰입이 극대화됩니다.'
                                        }
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 3. 과목별 시간 배분 및 목표 달성률 */}
                    <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-md space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                            <div className="w-3 h-7 bg-indigo-600 rounded-full"></div>
                            <h3 className="text-2xl font-black text-slate-900">3. 과목별 균형 & 목표 달성률</h3>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-base md:text-lg font-black text-slate-800">📚 주요 과목별 학습 시간 배분 비중 (%)</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                                    {Object.entries(analytics.subjectRatios).map(([key, val]) => {
                                        const labels: Record<string, string> = {
                                            korean: '국어', math: '수학', english: '영어', science: '탐구(과)', social: '탐구(사)', other: '기타/외국어'
                                        };
                                        return (
                                            <div key={key} className="space-y-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                                                <label className="text-xs font-black text-slate-600 uppercase block">{labels[key] || key}</label>
                                                <input 
                                                    type="number" 
                                                    value={val || ''} 
                                                    onChange={e => setAnalytics({ ...analytics, subjectRatios: { ...analytics.subjectRatios, [key]: e.target.value ? parseInt(e.target.value, 10) || 0 : 0 } })} 
                                                    className="w-full p-2 bg-white border border-slate-300 rounded-xl text-center font-black text-base focus:border-indigo-500 focus:outline-none" 
                                                    placeholder="0"
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <label className="text-base font-black text-slate-800">🎯 일일 계획 목표 달성률</label>
                                        <span className="text-xl font-black text-indigo-600 bg-indigo-50 px-3.5 py-1 rounded-xl">{analytics.goalAchievementRate}%</span>
                                    </div>
                                    <div className="p-3.5 bg-indigo-50/80 rounded-2xl border border-indigo-200/80 text-xs md:text-sm text-slate-700 leading-relaxed font-medium space-y-1.5">
                                        <p className="text-indigo-900 font-bold">
                                            💡 하루 공부 계획량을 100%라고 세웠을 때, 대략 몇 % 정도의 분량을 달성하고 있나요?
                                        </p>
                                        <p className="text-slate-600 text-xs">
                                            * 계획한 분량의 단순 끝내기가 아닌 <span className="text-rose-600 font-extrabold text-sm underline decoration-rose-400 decoration-2 underline-offset-2">'완전한 이해와 복습'</span>이 이루어진 실질적 달성 비율을 선택하세요.
                                        </p>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max="100" 
                                        value={analytics.goalAchievementRate} 
                                        onChange={e => setAnalytics({ ...analytics, goalAchievementRate: Number(e.target.value) })} 
                                        className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-base font-black text-slate-800">📈 체감 학습 난이도 (Difficulty)</label>
                                    <p className="text-xs text-indigo-900 bg-indigo-50 p-2.5 rounded-xl font-semibold">
                                        💡 현재 공부하는 교재와 문제의 체감 난이도입니다.
                                    </p>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map(v => (
                                            <button 
                                                key={v} 
                                                type="button"
                                                onClick={() => setAnalytics({ ...analytics, perceivedDifficulty: v })} 
                                                className={`flex-1 py-2.5 rounded-xl font-black text-sm border transition-all ${
                                                    analytics.perceivedDifficulty === v 
                                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md scale-105' 
                                                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-indigo-300'
                                                }`}
                                            >
                                                {v}점
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex justify-between text-[11px] text-slate-400 font-bold px-1">
                                        <span>1 (너무 쉬움)</span>
                                        <span>3 (적정 자극)</span>
                                        <span>5 (매우 어려움)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 4. 수면 & 피로도 관리 */}
                    <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-md space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                            <div className="w-3 h-7 bg-emerald-600 rounded-full"></div>
                            <h3 className="text-2xl font-black text-slate-900">4. 수면 및 일일 피로도</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-base font-black text-slate-800">💤 하루 평균 수면 시간 (시간)</label>
                                <input 
                                    type="number" 
                                    step="0.5" 
                                    placeholder="예: 6.5" 
                                    value={analytics.avgSleepHours || ''} 
                                    onChange={e => setAnalytics({ ...analytics, avgSleepHours: e.target.value ? parseFloat(e.target.value) || 0 : 0 })} 
                                    className="w-full p-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-base focus:border-emerald-500 focus:outline-none" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-base font-black text-slate-800">🔥 연속 고강도 학습 일수 (Streak)</label>
                                <input 
                                    type="number" 
                                    placeholder="예: 14" 
                                    value={analytics.studyStreak || ''} 
                                    onChange={e => setAnalytics({ ...analytics, studyStreak: e.target.value ? parseInt(e.target.value, 10) || 0 : 0 })} 
                                    className="w-full p-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-base focus:border-emerald-500 focus:outline-none" 
                                />
                                <p className="text-xs text-slate-400">하루 5시간 이상 휴일 없이 연속 공부한 일수 (번아웃 예측 지표)</p>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 space-y-3">
                            <label className="text-base font-black text-slate-800">🔋 일과 중 집중력 에너지 패턴</label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {[
                                    { id: 'stable', label: '안정형 ⚡', desc: '아침부터 밤까지 기복 없이 꾸준함' },
                                    { id: 'fluctuating', label: '기복형 🌊', desc: '집중이 잘 되다 안 되다 오르내림' },
                                    { id: 'declining', label: '하락형 📉', desc: '오후/저녁 이후 급격히 피로해짐' }
                                ].map(p => (
                                    <button 
                                        key={p.id} 
                                        type="button"
                                        onClick={() => setAnalytics({ ...analytics, energyPattern: p.id as any })} 
                                        className={`flex flex-col items-center p-3.5 rounded-2xl border transition-all ${
                                            analytics.energyPattern === p.id 
                                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-105' 
                                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50'
                                        }`}
                                    >
                                        <span className="text-base font-black">{p.label}</span>
                                        <span className={`text-xs font-semibold mt-0.5 ${analytics.energyPattern === p.id ? 'text-emerald-100' : 'text-slate-400'}`}>{p.desc}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button onClick={onBack} className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all shadow-sm">Previous</button>
                    <button
                        onClick={handleNext}
                        className="flex-[2] py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg hover:bg-blue-700 transition-all"
                    >
                        Next: 공부 효율성 검사 →
                    </button>
                </div>
            </div>
        </Layout>
    );
};
