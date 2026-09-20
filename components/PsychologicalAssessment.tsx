import React, { useMemo } from 'react';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
    BarChart, Bar, XAxis, YAxis, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { AssessmentResult, CareType, Prescription } from '../types';
import { MENTAL_PRESCRIPTIONS } from '../data/prescriptions';
import { CARE_STRATEGIES } from '../data/careStrategies';
import { generateAISchedule, ScheduleItem } from '../services/schedulingEngine';
import { CARE_TYPE_LABELS } from '../logicEngine';
import { isLearningAnalyticsTested } from '../utils/constants';
import { calculateRecommendedSubjectRatios } from '../services/studyStrategyEngine';

interface PsychologicalAssessmentProps {
    result: AssessmentResult;
    previousResult?: AssessmentResult;
}

// Progress Tracker Component - Before & After Comparison
const ProgressTracker: React.FC<{ result: AssessmentResult; previousResult?: AssessmentResult }> = ({ result, previousResult }) => {
    const assessmentDate = result.student.testDate || new Date().toISOString();

    const metrics = [
        {
            icon: '🧠',
            label: 'BRAIN SCORE',
            before: previousResult?.hrv?.brainScore ?? result.hrv.brainScore,
            after: result.hrv.brainScore,
            unit: '점',
            color: 'rose'
        },
        {
            icon: '⚡',
            label: 'VITALITY INDEX',
            before: previousResult?.hrv?.vitality ?? result.hrv.vitality,
            after: result.hrv.vitality,
            unit: '%',
            color: 'amber'
        },
        {
            icon: '😫',
            label: 'FATIGUE LEVEL',
            before: previousResult?.hrv?.fatigue ?? result.hrv.fatigue,
            after: result.hrv.fatigue,
            unit: '%',
            color: 'emerald',
            inverse: true
        },
        {
            icon: '💪',
            label: 'STRESS RESISTANCE',
            before: previousResult?.hrv?.physicalStress ? 100 - previousResult.hrv.physicalStress : 100 - result.hrv.physicalStress,
            after: 100 - result.hrv.physicalStress,
            unit: '',
            color: 'violet'
        },
        {
            icon: '🌙',
            label: 'SLEEP QUALITY (ISI)',
            before: previousResult?.survey?.isi ?? result.survey.isi,
            after: result.survey.isi,
            unit: '점',
            color: 'indigo',
            inverse: true
        },
        {
            icon: '🎯',
            label: 'CONCENTRATION',
            before: previousResult?.hrv?.concentrationLevel ?? result.hrv.concentrationLevel,
            after: result.hrv.concentrationLevel,
            unit: 'Lv',
            color: 'pink'
        }
    ];

    const getChangeStatus = (before: number, after: number, inverse: boolean = false) => {
        const diff = after - before;
        if (Math.abs(diff) < 0.5) return { status: 'No Change', color: 'bg-slate-500/20 text-slate-400' };
        if (inverse) {
            return diff > 0
                ? { status: 'Needs Attention', color: 'bg-rose-500/20 text-rose-400' }
                : { status: 'Improved', color: 'bg-emerald-500/20 text-emerald-400' };
        }
        return diff > 0
            ? { status: 'Improved', color: 'bg-emerald-500/20 text-emerald-400' }
            : { status: 'Needs Attention', color: 'bg-rose-500/20 text-rose-400' };
    };

    // Get diagnosis info
    const careTypeLabel = CARE_TYPE_LABELS[result.careType];

    return (
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 text-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <span className="text-2xl">📊</span>
                    </div>
                    <div>
                        <h3 className="text-2xl font-black tracking-tight">Progress Tracker</h3>
                        <p className="text-slate-400 text-sm">Before & After Comparison</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">Previous Assessment</p>
                    <p className="text-slate-300 text-sm font-mono">{assessmentDate}</p>
                </div>
            </div>

            {/* Primary Diagnosis Banner */}
            <div className="mb-6 p-4 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-2xl border border-indigo-500/30">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">{careTypeLabel?.icon || '🔬'}</span>
                        <div>
                            <p className="text-[10px] text-indigo-300 uppercase tracking-widest">Primary Diagnosis</p>
                            <p className="text-lg font-bold text-white">{careTypeLabel?.name || result.careType}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-slate-400">Classification Score</p>
                        <p className="text-2xl font-black text-indigo-400">{result.classificationResult?.primaryScore || result.score}점</p>
                    </div>
                </div>
                <p className="text-xs text-slate-400 mt-2">{careTypeLabel?.description}</p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-4">
                {metrics.map((metric, idx) => {
                    const change = getChangeStatus(metric.before, metric.after, metric.inverse);

                    return (
                        <div key={idx} className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-5 border border-slate-700/50">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-lg">{metric.icon}</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{metric.label}</span>
                            </div>

                            <div className="flex items-center justify-between mb-3">
                                <div className="text-center">
                                    <p className="text-[10px] text-slate-500 uppercase mb-1">Before</p>
                                    <p className="text-2xl font-black text-slate-300">{metric.before}{metric.unit}</p>
                                </div>
                                <div className="text-slate-600 text-2xl">—</div>
                                <div className="text-center">
                                    <p className="text-[10px] text-slate-500 uppercase mb-1">After</p>
                                    <p className="text-2xl font-black text-white">{metric.after}{metric.unit}</p>
                                </div>
                            </div>

                            <div className={`text-center py-2 rounded-full text-xs font-bold ${change.color}`}>
                                {change.status}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-700/50">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-emerald-500 rounded-full"></span>
                        <span className="text-xs text-slate-400">Improved</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-rose-500 rounded-full"></span>
                        <span className="text-xs text-slate-400">Needs Attention</span>
                    </div>
                </div>
                <p className="text-[10px] text-slate-500">Based on previous record(s) for {result.student.id}</p>
            </div>
        </div>
    );
};

// Learning Analytics Dashboard Component
const LearningAnalyticsDashboard: React.FC<{ result: AssessmentResult }> = ({ result }) => {
    const { analytics } = result;

    return (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
            {/* Header */}
            <div className="flex items-center gap-2 mb-6">
                <div className="w-1.5 h-8 bg-indigo-500 rounded-full"></div>
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-wide">Learning Analytics Dashboard</h3>
            </div>

            {/* Focus & Goal Achievement */}
            <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-2">Focus Quality</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-indigo-600">{analytics.pureStudyRatio}%</span>
                        <span className="text-sm text-slate-400">순공 비율</span>
                    </div>
                    <div className="mt-3 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000"
                            style={{ width: `${analytics.pureStudyRatio}%` }}
                        ></div>
                    </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-2">Goal Achievement</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-emerald-600">{analytics.goalAchievementRate}%</span>
                        <span className="text-sm text-slate-400">목표 달성</span>
                    </div>
                    <div className="mt-3 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-1000"
                            style={{ width: `${analytics.goalAchievementRate}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Time & Location Info */}
            <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <span className="font-bold text-slate-700">Golden Time</span>
                    <span className="text-indigo-600 font-mono font-bold">{analytics.goldenTimeStart} ~ {analytics.goldenTimeEnd}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <span className="font-bold text-slate-700">Preferred Location</span>
                    <span className="text-slate-600 font-bold">{analytics.preferredLocation}</span>
                </div>
                <div className="flex items-center justify-between py-3">
                    <span className="font-bold text-slate-700">Study Streak</span>
                    <span className="text-emerald-600 font-bold">🔥 {analytics.studyStreak} Days</span>
                </div>
            </div>
        </div>
    );
};

// Subject Time Distribution Component
const SubjectTimeDistribution: React.FC<{ result: AssessmentResult }> = ({ result }) => {
    const { analytics, student } = result;
    const isTested = isLearningAnalyticsTested(analytics);
    const ratios = (analytics.subjectRatios && Object.values(analytics.subjectRatios).some(v => Number(v) > 0))
        ? analytics.subjectRatios
        : calculateRecommendedSubjectRatios(student);

    const subjects = [
        { name: 'KOR', label: '국어', value: ratios.korean, color: '#f43f5e' },
        { name: 'MAT', label: '수학', value: ratios.math, color: '#3b82f6' },
        { name: 'ENG', label: '영어', value: ratios.english, color: '#10b981' },
        { name: 'SCI', label: '과탐', value: ratios.science, color: '#a855f7' },
        { name: 'SOC', label: '사탐', value: ratios.social, color: '#f59e0b' },
        { name: 'OTH', label: '기타', value: ratios.other, color: '#64748b' }
    ];

    const weakSubjectLabel = student.weakSubject === 'math' ? '수학' : student.weakSubject === 'korean' ? '국어' : student.weakSubject === 'english' ? '영어' : '';

    return (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-6">
                <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                    {isTested ? 'Subject Time Distribution (%)' : 'Recommended Subject Distribution (%)'}
                </p>
                {!isTested ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md border border-blue-200">
                        🎯 {weakSubjectLabel ? `등록 취약과목 [${weakSubjectLabel}]` : '등록 우선순위'} 기반 AI 추천
                    </span>
                ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                        검사 실측치
                    </span>
                )}
            </div>

            <div className="flex items-end justify-between gap-4">
                {subjects.map((subject, idx) => (
                    <div key={idx} className="flex-1 text-center">
                        <p className="text-lg font-black text-slate-800 mb-2">{subject.value}%</p>
                        <div className="h-3 rounded-full overflow-hidden mb-2" style={{ backgroundColor: `${subject.color}20` }}>
                            <div
                                className="h-full rounded-full transition-all duration-1000"
                                style={{ width: '100%', backgroundColor: subject.color }}
                            ></div>
                        </div>
                        <p className="text-xs font-bold text-slate-700">{subject.name}</p>
                        <p className="text-[10px] text-slate-400">{subject.label}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

// AI Optimal Learning Schedule Component - Connected to schedulingEngine
const AILearningSchedule: React.FC<{ result: AssessmentResult }> = ({ result }) => {
    // Generate schedule dynamically using schedulingEngine
    const scheduleItems = useMemo(() => {
        return generateAISchedule(result.analytics, result.student, result.careType);
    }, [result.analytics, result.student, result.careType]);

    const intensityColors: Record<string, string> = {
        'Low': 'text-amber-500',
        'Medium': 'text-blue-500',
        'High': 'text-rose-500'
    };

    const intensityLabels: Record<string, string> = {
        'Low': 'LOW ENERGY',
        'Medium': 'MEDIUM ENERGY',
        'High': 'HIGH ENERGY'
    };

    return (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-8 bg-slate-800 rounded-full"></div>
                    <h3 className="text-lg font-black text-slate-800">AI 최적 학습 스케줄링</h3>
                </div>
                <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-full uppercase">Bio-Rhythm Logic V1.2</span>
            </div>

            {/* Schedule Items */}
            <div className="space-y-6">
                {scheduleItems.map((item, idx) => (
                    <div key={idx} className="flex gap-6 pb-6 border-b border-slate-100 last:border-0 last:pb-0">
                        <div className="w-28 shrink-0">
                            <p className="font-mono font-bold text-slate-800 text-sm">{item.time}</p>
                            <p className={`text-[10px] font-bold uppercase mt-1 ${intensityColors[item.intensity]}`}>
                                {intensityLabels[item.intensity]}
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800 mb-1">{item.activity}</h4>
                            <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Mental Health Prescription Component - Connected to careType and prescriptions
const MentalHealthPrescription: React.FC<{ result: AssessmentResult }> = ({ result }) => {
    // Get prescription based on diagnosis careType
    const prescription = useMemo(() => {
        return MENTAL_PRESCRIPTIONS[result.careType] || MENTAL_PRESCRIPTIONS[CareType.HEALTHY];
    }, [result.careType]);

    const careTypeLabel = CARE_TYPE_LABELS[result.careType];

    return (
        <div className="bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 rounded-3xl p-8 border border-indigo-100">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{careTypeLabel?.icon || '🧠'}</span>
                    <p className="text-[10px] text-indigo-400 uppercase tracking-widest">{prescription.activity}</p>
                </div>
                <h3 className="text-2xl font-black text-slate-800">{prescription.title}</h3>
                <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center gap-1 text-slate-500 text-sm">
                        <span>⏱</span>
                        <span>소요 시간: {prescription.duration}</span>
                    </div>
                    {prescription.audioTag && (
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-600 text-[10px] font-bold rounded-full">
                            Recommended: {prescription.audioTag}
                        </span>
                    )}
                </div>
            </div>

            {/* Guide Steps */}
            <div className="space-y-4 mb-8">
                {prescription.guide.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                        <span className="w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">{idx + 1}</span>
                        <p className="text-slate-600 leading-relaxed">{step}</p>
                    </div>
                ))}
            </div>

            {/* CareType Strategy Summary */}
            <div className="p-4 bg-white/60 rounded-2xl border border-indigo-100 mb-6">
                <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest mb-2">진단 연계 전략</p>
                <p className="text-sm text-slate-600 leading-relaxed">
                    {CARE_STRATEGIES[result.careType]?.studyStrategy || '맞춤형 학습 전략을 제공합니다.'}
                </p>
            </div>

            {/* Action Button */}
            <button className="w-full py-4 bg-slate-800 text-white font-bold rounded-2xl hover:bg-slate-900 transition-colors">
                처방 가이드 시작하기
            </button>
        </div>
    );
};

// Expert Care Strategy Component - Connected to careStrategies
const ExpertCareStrategy: React.FC<{ result: AssessmentResult }> = ({ result }) => {
    const strategy = useMemo(() => {
        return CARE_STRATEGIES[result.careType] || CARE_STRATEGIES[CareType.HEALTHY];
    }, [result.careType]);

    const careTypeLabel = CARE_TYPE_LABELS[result.careType];

    const strategyItems = [
        { icon: '📚', label: '학습 전략', content: strategy.studyStrategy },
        { icon: '🥗', label: '영양 가이드', content: strategy.nutritionGuide },
        { icon: '🏃', label: '운동 가이드', content: strategy.exerciseGuide },
        { icon: '🧘', label: '학습 전 루틴', content: strategy.preStudyRoutine },
        { icon: '💤', label: '회복 가이드', content: strategy.recoveryGuide },
        { icon: '📱', label: '라이프스타일', content: strategy.lifestyleGuide }
    ];

    return (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-2xl text-white shadow-lg">
                        {careTypeLabel?.icon || '🎯'}
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-800">Expert Care Strategy</h3>
                        <p className="text-xs text-slate-400">{careTypeLabel?.name || result.careType} 맞춤 전략</p>
                    </div>
                </div>
            </div>

            {/* Strategy Grid */}
            <div className="grid grid-cols-2 gap-4">
                {strategyItems.map((item, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">{item.icon}</span>
                            <span className="text-xs font-bold text-slate-600 uppercase">{item.label}</span>
                        </div>
                        <p className="text-sm text-slate-500 leading-relaxed line-clamp-3">{item.content}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ANS Balance Chart Component
const ANSBalanceChart: React.FC<{ result: AssessmentResult }> = ({ result }) => {
    const { hrv } = result;
    const data = [
        { name: 'PNS (Parasympathetic)', value: hrv.pns },
        { name: 'SNS (Sympathetic)', value: hrv.sns }
    ];
    const COLORS = ['#3b82f6', '#ef4444'];

    // Diagnosis correlation message
    const getANSInterpretation = () => {
        if (hrv.sns > 65) return '교감신경 과활성화 상태 - 만성 긴장 패턴이 관찰됩니다.';
        if (hrv.sns < 35) return '부교감신경 우세 상태 - 에너지 저하 가능성이 있습니다.';
        return '정상 범위 내 균형을 유지하고 있습니다.';
    };

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <h4 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-4">Autonomic Balance (ANS)</h4>
            <div className="h-72" style={{ minHeight: '288px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <p className="text-xs text-slate-500 text-center mt-2">{getANSInterpretation()}</p>
        </div>
    );
};

// Vitality & Fatigue Index Component
const VitalityFatigueChart: React.FC<{ result: AssessmentResult }> = ({ result }) => {
    const { hrv } = result;
    const data = [{ name: 'Index', Fatigue: hrv.fatigue, Vitality: hrv.vitality }];

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Vitality & Fatigue Index</h4>
            <div className="h-72" style={{ minHeight: '288px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <XAxis dataKey="name" hide />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="Fatigue" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Vitality" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};



// Stress & Concentration Gauge Component
const StressConcentrationGauge: React.FC<{ result: AssessmentResult }> = ({ result }) => {
    const { protocol, hrv, survey } = result;

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-6">Stress & Concentration Gauge</h4>

            <div className="space-y-6">
                {/* Self-Reported Stress */}
                <div>
                    <div className="flex justify-between mb-2">
                        <span className="text-sm font-bold text-slate-600">Self-Reported Stress</span>
                        <span className="font-black text-rose-500">{protocol.stressLevel}/10</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-rose-400 to-rose-500 rounded-full transition-all duration-1000"
                            style={{ width: `${protocol.stressLevel * 10}%` }}
                        ></div>
                    </div>
                </div>

                {/* Clinical Concentration */}
                <div>
                    <div className="flex justify-between mb-2">
                        <span className="text-sm font-bold text-slate-600">Clinical Concentration</span>
                        <span className="font-black text-amber-500">{hrv.concentrationLevel}/10</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-1000"
                            style={{ width: `${hrv.concentrationLevel * 10}%` }}
                        ></div>
                    </div>
                </div>

                {/* BAI Score */}
                <div>
                    <div className="flex justify-between mb-2">
                        <span className="text-sm font-bold text-slate-600">Anxiety Level (BAI)</span>
                        <span className="font-black text-indigo-500">{survey.bai}/63</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-indigo-400 to-indigo-500 rounded-full transition-all duration-1000"
                            style={{ width: `${(survey.bai / 63) * 100}%` }}
                        ></div>
                    </div>
                </div>

                {/* ISI Score */}
                <div>
                    <div className="flex justify-between mb-2">
                        <span className="text-sm font-bold text-slate-600">Sleep Quality (ISI)</span>
                        <span className="font-black text-purple-500">{survey.isi}/28</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-purple-400 to-purple-500 rounded-full transition-all duration-1000"
                            style={{ width: `${(survey.isi / 28) * 100}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Main Psychological Assessment Component
export const PsychologicalAssessment: React.FC<PsychologicalAssessmentProps> = ({ result, previousResult }) => {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-4 mb-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm print:shadow-none print:border-slate-100">
                <img src="./psychological_logo.jpg" alt="Logo" className="w-16 h-16 object-contain" />
                <div className="flex-1">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Psychological Assessment</h1>
                    <p className="text-sm font-bold text-blue-600 uppercase tracking-widest">Neuro-Bio Comprehensive Report</p>
                </div>
                <button
                    onClick={() => window.open('survey-form-student.html', 'StudentSurvey', 'width=900,height=800,scrollbars=yes')}
                    className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex items-center gap-2 print:hidden"
                >
                    <span>📋</span>
                    <span>학생 설문 실행</span>
                </button>
            </div>
            {/* Progress Tracker - Full Width Dark Card */}
            <ProgressTracker result={result} previousResult={previousResult} />

            {/* Learning Analytics + Subject Distribution Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LearningAnalyticsDashboard result={result} />
                <SubjectTimeDistribution result={result} />
            </div>

            {/* AI Schedule + Mental Health Prescription Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AILearningSchedule result={result} />
                <MentalHealthPrescription result={result} />
            </div>

            {/* Expert Care Strategy - Full Width */}
            <ExpertCareStrategy result={result} />

            {/* Charts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[300px]">
                <ANSBalanceChart result={result} />
                <VitalityFatigueChart result={result} />
                <StressConcentrationGauge result={result} />
            </div>
        </div>
    );
};

export default PsychologicalAssessment;
