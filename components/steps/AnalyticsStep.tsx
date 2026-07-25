import React from 'react';
import { Layout } from '../Layout';
import { StepProgressBar } from '../ui/StepProgressBar';
import { LearningAnalyticsData } from '../../types';

interface AnalyticsStepProps {
    // Navigation
    onNext: () => void;
    onBack: () => void;

    // Layout props
    activeMenu: 'dashboard' | 'assessment' | 'history' | 'progress' | 'resources';
    onMenuChange: (menu: any) => void;
    isDarkMode: boolean;
    onToggleDarkMode: () => void;

    // Config
    config: {
        isMedicalMode: boolean;
        usePortable: boolean;
    };

    // Analytics State
    analytics: LearningAnalyticsData;
    setAnalytics: React.Dispatch<React.SetStateAction<LearningAnalyticsData>>;

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
    config,
    analytics,
    setAnalytics,
    onStepClick
}) => {
    return (
        <Layout activeMenu={activeMenu} onMenuChange={onMenuChange} isDarkMode={isDarkMode} onToggleDarkMode={onToggleDarkMode}>
            <StepProgressBar currentStep="analytics" isMedicalMode={config.isMedicalMode} isPortableMode={config.usePortable} onStepClick={onStepClick} />
            <div className="w-full max-w-full space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-20 mt-4">
                <div className="flex flex-col items-center text-center gap-4">
                    <img src="./학습밀도 및 패턴 logo.JPG" alt="Logo" className="w-24 h-24 object-contain" />
                    <div>
                        <h2 className="text-3xl font-extrabold text-slate-900">학습 밀도 및 패턴 분석 검사</h2>
                        <p className="text-slate-500 mt-2">단순 투입 시간보다 중요한 실제 학습의 질을 분석합니다.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* 1. 학습 밀도 분석 */}
                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                            <div className="w-2 h-6 bg-blue-600 rounded-full"></div>
                            <h3 className="font-bold text-slate-800 text-xl">1. 학습 밀도 및 집중력</h3>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <label className="text-sm font-bold text-slate-700">순공 시간 비율 (%)</label>
                                    <span className="text-blue-600 font-bold">{analytics.pureStudyRatio}%</span>
                                </div>
                                <p className="text-[10px] text-slate-400 leading-relaxed">
                                    * 전체 공부 시간 중 스마트폰 확인, 잡념, 단순 착석 시간 등을 제외하고 <b>온전하게 몰입한 실질적인 시간</b>의 비중을 선택하세요. (예: 1시간 공부 중 실제 공부 시간 %)
                                </p>
                                <input type="range" min="0" max="100" value={analytics.pureStudyRatio} onChange={e => setAnalytics({ ...analytics, pureStudyRatio: Number(e.target.value) })} className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500">평균 집중 시간 (분)</label>
                                    <input type="number" placeholder="60분 기준 집중 시간" value={analytics.avgFocusDuration || ''} onChange={e => setAnalytics({ ...analytics, avgFocusDuration: e.target.value ? parseInt(e.target.value, 10) || 0 : 0 })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500">산만도 (시간당 주의분산 횟수)</label>
                                    <input type="number" placeholder="예: 스마트폰, 잡생각 등" value={analytics.distractionCount || ''} onChange={e => setAnalytics({ ...analytics, distractionCount: e.target.value ? parseInt(e.target.value, 10) || 0 : 0 })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. 시간대별 효율성 */}
                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                            <div className="w-2 h-6 bg-amber-500 rounded-full"></div>
                            <h3 className="font-bold text-slate-800 text-xl">2. 시간대별 효율성</h3>
                        </div>
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500">골든타임 시작 (가장 공부가 잘 되는 시간)</label>
                                    <input type="time" value={analytics.goldenTimeStart} onChange={e => setAnalytics({ ...analytics, goldenTimeStart: e.target.value })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500">골든타임 종료</label>
                                    <input type="time" value={analytics.goldenTimeEnd} onChange={e => setAnalytics({ ...analytics, goldenTimeEnd: e.target.value })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-slate-700">일주기 유형 (Chronotype)</label>
                                <p className="text-[10px] text-amber-600 bg-amber-50 p-2 rounded-lg">💡 외부 자극 없이 본능적으로 뇌의 각성이 가장 높은 시간대를 선택하세요. 아침에 잘 일어나고 오전에 집중이 잘 되나요? 아니면 밤에 더 머리가 맑아지나요?</p>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        {
                                            id: 'morning',
                                            label: '아침형 🌅',
                                            desc: '07-09시 최고',
                                            detail: '이른 아침에 자연스럽게 일어남. 오전 시간에 집중력이 가장 높고, 밤이 되면 좀림. 비교적 규칙적인 수면 패턴.',
                                            color: 'amber'
                                        },
                                        {
                                            id: 'neutral',
                                            label: '중간형 ☀️',
                                            desc: '10-14시 최고',
                                            detail: '아침형과 저녁형의 중간. 늘잖잠을 자도 기상이 힘들지 않음. 오전 늦게서 오후 이른 시간에 기능이 최적화.',
                                            color: 'blue'
                                        },
                                        {
                                            id: 'evening',
                                            label: '저녁형 🌙',
                                            desc: '20-24시 최고',
                                            detail: '아침에 일어나기 힘들고 오전엔 멍함. 오후 늦게서 밤에 집중력이 정점. 월요병이 심함.',
                                            color: 'indigo'
                                        }
                                    ].map(t => (
                                        <button
                                            key={t.id}
                                            onClick={() => setAnalytics({ ...analytics, chronotype: t.id as any })}
                                            className={`flex flex-col items-center p-3 rounded-xl border transition-all ${analytics.chronotype === t.id ? `bg-${t.color}-500 text-white border-${t.color}-500 shadow-md` : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'}`}
                                            style={analytics.chronotype === t.id ? { backgroundColor: t.color === 'amber' ? '#f59e0b' : t.color === 'blue' ? '#3b82f6' : '#6366f1' } : {}}
                                        >
                                            <span className="text-sm font-bold">{t.label}</span>
                                            <span className={`text-[9px] ${analytics.chronotype === t.id ? 'text-white/80' : 'text-slate-400'}`}>{t.desc}</span>
                                        </button>
                                    ))}
                                </div>
                                {analytics.chronotype && (
                                    <div className={`p-3 rounded-xl border ${analytics.chronotype === 'morning' ? 'bg-amber-50 border-amber-200' : analytics.chronotype === 'neutral' ? 'bg-blue-50 border-blue-200' : 'bg-indigo-50 border-indigo-200'}`}>
                                        <p className={`text-[11px] font-medium ${analytics.chronotype === 'morning' ? 'text-amber-700' : analytics.chronotype === 'neutral' ? 'text-blue-700' : 'text-indigo-700'}`}>
                                            ✓ {
                                                analytics.chronotype === 'morning'
                                                    ? '이른 아침에 자연스럽게 일어남. 오전 시간에 집중력이 가장 높고, 밤이 되면 좀림. 비교적 규칙적인 수면 패턴.'
                                                    : analytics.chronotype === 'neutral'
                                                        ? '아침형과 저녁형의 중간. 늦잠을 자도 기상이 힘들지 않음. 오전 늦게서 오후 이른 시간에 기능이 최적화.'
                                                        : '아침에 일어나기 힘들고 오전엔 멍함. 오후 늦게서 밤에 집중력이 정점. 월요병이 심함.'
                                            }
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 3. 과목별 균형 */}
                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 md:col-span-2">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                            <div className="w-2 h-6 bg-indigo-600 rounded-full"></div>
                            <h3 className="font-bold text-slate-800 text-xl">3. 과목별 균형 및 취약점</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="space-y-4 md:col-span-2">
                                <label className="text-sm font-bold text-slate-700">과목별 시간 배분 (%)</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {Object.entries(analytics.subjectRatios).map(([key, val]) => {
                                        const labels: Record<string, string> = {
                                            korean: '국어', math: '수학', english: '영어', science: '과학', social: '사회', other: '기타'
                                        };
                                        return (
                                            <div key={key} className="space-y-1">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase">{labels[key] || key}</label>
                                                <input type="number" value={val || ''} onChange={e => setAnalytics({ ...analytics, subjectRatios: { ...analytics.subjectRatios, [key]: e.target.value ? parseInt(e.target.value, 10) || 0 : 0 } })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold text-sm" />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <label className="text-sm font-bold text-slate-700">목표 달성률</label>
                                        <span className="text-indigo-600 font-bold">{analytics.goalAchievementRate}%</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400">* 계획한 분량(페이지/문제) 단순 끝내기가 아닌 <b>'완벽한 복습과 이해'</b>가 이루어진 정도를 포함하세요.</p>
                                    <input type="range" min="0" max="100" value={analytics.goalAchievementRate} onChange={e => setAnalytics({ ...analytics, goalAchievementRate: Number(e.target.value) })} className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-start">
                                        <label className="text-sm font-bold text-slate-700">체감 학습 난이도 (Difficulty)</label>
                                    </div>
                                    <p className="text-[10px] text-indigo-600 bg-indigo-50 p-2 rounded-lg">💡 지금 공부하는 내용이 나에게 얼마나 어렵게 느껴지나요? 너무 쉽거나 너무 어려우면 몰입이 어렵습니다.</p>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map(v => (
                                            <button key={v} onClick={() => setAnalytics({ ...analytics, perceivedDifficulty: v })} className={`flex-1 py-2 rounded-lg font-bold border transition-all ${analytics.perceivedDifficulty === v ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-400 border-slate-200 hover:border-indigo-200'}`}>{v}</button>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-5 gap-1 text-[8px] text-slate-400 text-center leading-tight">
                                        <span>1: 매우 쉬움<br />(단순 복습)</span>
                                        <span>2: 쉬움<br />(이해 완료)</span>
                                        <span>3: 보통<br />(적정 자극)</span>
                                        <span>4: 어려움<br />(심화 단계)</span>
                                        <span>5: 매우 어려움<br />(개념 생소)</span>
                                    </div>
                                    {analytics.perceivedDifficulty && (
                                        <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                                            <p className="text-[10px] text-indigo-700 font-medium">
                                                ✓ {
                                                    analytics.perceivedDifficulty === 1 ? '이미 다 아는 내용이라 쉽습니다. 새로운 내용이나 심화 학습이 필요할 수 있습니다.' :
                                                        analytics.perceivedDifficulty === 2 ? '대부분 이해했으며 복습 수준입니다. 학습 효율이 높은 상태입니다.' :
                                                            analytics.perceivedDifficulty === 3 ? '노력하면 충분히 이해할 수 있는 적정 난이도입니다. 몰입에 가장 좋은 상태!' :
                                                                analytics.perceivedDifficulty === 4 ? '난이도가 높아 시간이 많이 걸립니다. 기초 복습이 도움이 될 수 있습니다.' :
                                                                    '개념 자체가 생소하여 이해가 어렵습니다. 기본 개념부터 다시 학습하는 것을 권장합니다.'
                                                }
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 4. 환경 및 피로도 */}
                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                            <div className="w-2 h-6 bg-emerald-600 rounded-full"></div>
                            <h3 className="font-bold text-slate-800 text-xl">4. 환경 및 컨디션</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500">평균 수면 시간</label>
                                <input type="number" value={analytics.avgSleepHours || ''} onChange={e => setAnalytics({ ...analytics, avgSleepHours: e.target.value ? parseFloat(e.target.value) || 0 : 0 })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500">연속 학습 일수 (Study Streak)</label>
                                <p className="text-[10px] text-slate-400 leading-tight">하루 4시간 이상 학습을 쉬지 않고 이어온 기간입니다. (번아웃 예측용)</p>
                                <input type="number" value={analytics.studyStreak || ''} onChange={e => setAnalytics({ ...analytics, studyStreak: e.target.value ? parseInt(e.target.value, 10) || 0 : 0 })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                            <div className="w-2 h-6 bg-red-600 rounded-full"></div>
                            <h3 className="font-bold text-slate-800 text-xl">5. 피로도 및 휴식</h3>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-slate-700">휴식 적절성 (Break Quality)</label>
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <p className="text-[10px] text-slate-500 leading-relaxed">
                                        💡 <b>의미:</b> 학습 후 뇌의 인지적 과부하가 해소되고('머리가 맑아짐'), 다음 공부를 시작할 에너지가 충분히 충전되었는지 평가합니다.
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    {[
                                        { v: 1, l: '매우부족' },
                                        { v: 2, l: '부족' },
                                        { v: 3, l: '적당' },
                                        { v: 4, l: '충분' },
                                        { v: 5, l: '과다(루즈함)' }
                                    ].map(item => (
                                        <button key={item.v} onClick={() => setAnalytics({ ...analytics, breakAdequacy: item.v })} className={`flex-1 py-2 rounded-lg text-[10px] font-bold border transition-all ${analytics.breakAdequacy === item.v ? 'bg-red-600 text-white border-red-600 shadow-sm' : 'bg-white text-slate-400 border-slate-200'}`}>
                                            {item.l}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-slate-700">집중력 에너지 패턴 (Daily Pattern)</label>
                                <p className="text-[10px] text-slate-400">하루 전체를 통틀어 집중력이 유지되는 흐름을 선택하세요.</p>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { id: 'stable', label: '안정적', desc: '기복 없이 꾸준한 상태' },
                                        { id: 'fluctuating', label: '기복있음', desc: '집중이 잘 되다 안되다 함' },
                                        { id: 'declining', label: '하락형', desc: '오후/저녁에 급격히 지침' }
                                    ].map(p => (
                                        <button key={p.id} onClick={() => setAnalytics({ ...analytics, energyPattern: p.id as any })} className={`flex flex-col items-center py-2.5 rounded-xl border transition-all ${analytics.energyPattern === p.id ? 'bg-red-600 text-white border-red-600' : 'bg-white text-slate-400 border-slate-200'}`}>
                                            <span className="text-[11px] font-bold">{p.label}</span>
                                            <span className={`text-[8px] ${analytics.energyPattern === p.id ? 'text-red-100' : 'text-slate-400'}`}>{p.desc}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button onClick={onBack} className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all">Back</button>
                    <button
                        onClick={onNext}
                        className="flex-[2] py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg hover:bg-blue-700 transition-all"
                    >
                        Next: 공부 효율성 검사
                    </button>
                </div>
            </div>
        </Layout>
    );
};
