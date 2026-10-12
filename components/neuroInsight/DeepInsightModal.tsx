import React from 'react';
import { CareType } from '../../types';
import { CARE_TYPE_LABELS } from '../../logicEngine';
import { EXPERT_CONTENTS, WEEKLY_PLANS, SUCCESS_INDICATORS } from '../ExpertOverlay';
import type { DeepInsight } from '../../services/deepInsightEngine';

export const DeepInsightModal = ({ isOpen, onClose, data }: { isOpen: boolean, onClose: () => void, data: DeepInsight }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-slate-900 p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">🕵️‍♂️</span>
                        <div>
                            <h2 className="text-xl font-bold text-white">Deep Insight Inspector</h2>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Expert Clinical Analysis System</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">✕</button>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto space-y-8 bg-slate-50">

                    {/* 1. Core Correlation (인과관계 분석) */}
                    <div>
                        <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 mb-4">
                            <span className="text-indigo-600">🔗</span> Core Correlation Logic
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {data.coreCorrelation.map((group, idx) => (
                                <div key={idx} className="col-span-1 md:col-span-3 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                    <h4 className="font-bold text-indigo-700 mb-4 border-b border-indigo-50 pb-2 flex justify-between items-center">
                                        {group.title}
                                        <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full uppercase tracking-wider">Primary Driver</span>
                                    </h4>
                                    <div className="grid grid-cols-3 gap-4">
                                        {group.items.map((item, i) => (
                                            <div key={i} className={`p-3 rounded-lg border ${item.severity === 'high' ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'}`}>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">{item.label}</p>
                                                <p className={`text-xl font-black mb-2 ${item.severity === 'high' ? 'text-red-600' : 'text-slate-700'}`}>{item.value}</p>
                                                <p className={`text-xs font-bold ${item.severity === 'high' ? 'text-red-500' : 'text-slate-400'}`}>
                                                    {item.severity === 'high' ? '⚠ ' : '✓ '}{item.impact}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 2. Hidden Risk & Mechanism (숨겨진 위험) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 mb-4">
                                <span className="text-amber-600">⚠</span> Hidden Risk Factor
                            </h3>
                            <div className="bg-amber-50 rounded-xl p-5 border border-amber-100 h-full">
                                {data.hiddenRisks.map((risk, idx) => (
                                    <div key={idx} className="mb-4 last:mb-0">
                                        <p className="font-bold text-amber-800 text-sm mb-2">"{risk.description}"</p>
                                        <div className="bg-white/60 rounded-lg p-3 text-xs text-amber-900 leading-relaxed font-medium">
                                            <span className="text-amber-500 font-bold mr-1">MECHANISM:</span>
                                            {risk.mechanism}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 3. Killer Script (결정적 조언) */}
                        <div>
                            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 mb-4">
                                <span className="text-emerald-600">💬</span> Killer Script
                            </h3>
                            <div className="bg-emerald-600 rounded-xl p-6 shadow-lg h-full flex items-center relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                                <p className="text-white font-medium text-lg italic leading-relaxed relative z-10">
                                    "{data.killerScript}"
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 4. Prescription Hierarchy (단계별 처방) */}
                    <div>
                        <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 mb-4">
                            <span className="text-blue-600">🪜</span> Prescription Hierarchy
                        </h3>
                        <div className="space-y-3">
                            {data.prescriptionHierarchy.map((step, idx) => (
                                <div key={idx} className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-blue-400 to-indigo-500"></div>
                                    <div className="min-w-[3rem] h-12 rounded-lg bg-slate-100 flex items-center justify-center font-black text-slate-300 text-xl">0{step.stage}</div>
                                    <div className="flex-1">
                                        <p className="font-bold text-slate-800 text-sm">{step.action}</p>
                                    </div>
                                    <div className="flex-1 text-right">
                                        <p className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full inline-block">
                                            기대효과: {step.effect}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 5. NEW: Personalized Body-Study Connection Report */}
                    {data.personalizedReport && (
                        <div>
                            <h3 className="flex items-center gap-3 text-lg font-bold text-slate-800 mb-4 pt-4 border-t border-slate-200">
                                <span className="text-xl">🌿</span> 맞춤형 신체-학습 연결 리포트
                            </h3>
                            <div className="space-y-4">
                                {/* BMI Analysis */}
                                <div className="p-5 rounded-xl bg-white border border-slate-200">
                                    <h4 className="font-bold text-gray-800 text-base mb-2">💪 BMI 분석: {data.personalizedReport.bmi.title}</h4>
                                    <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{data.personalizedReport.bmi.advice}</p>
                                    {data.personalizedReport.bmi.detail && (
                                        <p className="text-sm text-blue-700 font-medium mt-3 bg-blue-50 border border-blue-100 p-3 rounded-lg">
                                            {data.personalizedReport.bmi.detail}
                                        </p>
                                    )}
                                </div>

                                {/* Recommended Diet */}
                                <div className="p-5 rounded-xl bg-white border border-slate-200">
                                    <h4 className="font-bold text-gray-800 text-base mb-2">🥗 추천 식단: {data.personalizedReport.diet.title}</h4>
                                    <div className="text-sm text-slate-600" style={{ whiteSpace: 'pre-wrap' }}>
                                        {data.personalizedReport.diet.advice}
                                    </div>
                                </div>

                                {/* Exercise Prescription */}
                                <div className="p-5 rounded-xl bg-white border border-slate-200">
                                    <h4 className="font-bold text-gray-800 text-base mb-2">🏃‍♀️ 운동 처방: {data.personalizedReport.exercise.title}</h4>
                                    <div className="text-sm text-slate-600" style={{ whiteSpace: 'pre-wrap' }}>
                                        {data.personalizedReport.exercise.advice}
                                    </div>
                                </div>

                                {/* Learning Efficiency */}
                                <div className="p-5 rounded-xl bg-white border border-slate-200">
                                    <h4 className="font-bold text-gray-800 text-base mb-2">🎓 학습 효율: {data.personalizedReport.learning.title}</h4>
                                    <div className="text-sm text-slate-600" style={{ whiteSpace: 'pre-wrap' }}>
                                        {data.personalizedReport.learning.advice}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 6. 1:1 AI 전문 코칭 (Expert Guide - 시작전, 학습중, 신체, Management, 로드맵, KPI) */}
                    {(() => {
                        const careKey = CareType.HEALTHY;
                        const expertData = EXPERT_CONTENTS[careKey] || EXPERT_CONTENTS[CareType.HEALTHY];
                        const weeklyPlan = WEEKLY_PLANS[careKey] || WEEKLY_PLANS[CareType.HEALTHY];
                        const kpiList = SUCCESS_INDICATORS[careKey] || SUCCESS_INDICATORS[CareType.HEALTHY] || [];

                        return (
                            <div className="pt-6 border-t-2 border-indigo-200 mt-6 space-y-6">
                                <div className="bg-gradient-to-r from-indigo-900 to-purple-900 text-white p-5 rounded-2xl shadow-md flex justify-between items-center">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-500 text-white">
                                                PREMIUM 1:1 AI 전문 코칭
                                            </span>
                                            <span className="text-xs text-indigo-200 font-bold">진단 유형: {CARE_TYPE_LABELS[careKey]?.name || careKey}</span>
                                        </div>
                                        <h3 className="text-xl font-black flex items-center gap-2">
                                            <span>👨‍⚕️</span> 1:1 AI 맞춤형 전문 코칭 가이드 (Expert Guide)
                                        </h3>
                                    </div>
                                    <span className="text-xs text-indigo-200 bg-white/10 px-3 py-1.5 rounded-xl font-mono hidden sm:inline">
                                        CLINICAL AI PROTOCOL
                                    </span>
                                </div>

                                {/* ⚡ 시작 전 (Pre-Study) */}
                                <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-bold text-emerald-950 text-base flex items-center gap-2">
                                            <span>⚡</span> [시작 전] 뇌 예열 및 인지 부하 차단 전략
                                        </h4>
                                        <span className="text-xs text-emerald-700 font-bold bg-emerald-100 px-2.5 py-1 rounded-full">Pre-Study Protocol</span>
                                    </div>
                                    <p className="text-xs text-emerald-800 mb-3 italic">{expertData.prestudy.intro}</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {expertData.prestudy.guides.map((g, idx) => (
                                            <div key={idx} className="bg-white p-3.5 rounded-xl border border-emerald-100 shadow-sm text-xs space-y-1.5">
                                                <div className="flex justify-between items-center font-black text-emerald-900">
                                                    <span>✓ {g.title}</span>
                                                    <span className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded">{g.difficulty}</span>
                                                </div>
                                                <p className="text-slate-700 font-medium">{g.expertDesc}</p>
                                                <p className="text-slate-500 text-[11px]"><strong className="text-emerald-700">근거:</strong> {g.rationale}</p>
                                                <p className="text-indigo-950 bg-indigo-50 p-2 rounded text-[11px] font-semibold"><strong className="text-indigo-600">실천:</strong> {g.action}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* 🧠 학습 중 (Learning) */}
                                <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-bold text-blue-950 text-base flex items-center gap-2">
                                            <span>🧠</span> [학습 중] 전두엽 몰입 및 메타인지 인출 전략
                                        </h4>
                                        <span className="text-xs text-blue-700 font-bold bg-blue-100 px-2.5 py-1 rounded-full">Learning Protocol</span>
                                    </div>
                                    <p className="text-xs text-blue-800 mb-3 italic">{expertData.learning.intro}</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {expertData.learning.guides.map((g, idx) => (
                                            <div key={idx} className="bg-white p-3.5 rounded-xl border border-blue-100 shadow-sm text-xs space-y-1.5">
                                                <div className="flex justify-between items-center font-black text-blue-900">
                                                    <span>✓ {g.title}</span>
                                                    <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded">{g.difficulty}</span>
                                                </div>
                                                <p className="text-slate-700 font-medium">{g.expertDesc}</p>
                                                <p className="text-slate-500 text-[11px]"><strong className="text-blue-700">근거:</strong> {g.rationale}</p>
                                                <p className="text-indigo-950 bg-indigo-50 p-2 rounded text-[11px] font-semibold"><strong className="text-indigo-600">실천:</strong> {g.action}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* 🏃 신체 (Body & Physiology) */}
                                <div className="p-5 rounded-2xl bg-orange-50/60 border border-orange-200">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-bold text-orange-950 text-base flex items-center gap-2">
                                            <span>🏃</span> [신체] 자율신경 활력 및 두뇌 생체 동기화
                                        </h4>
                                        <span className="text-xs text-orange-700 font-bold bg-orange-100 px-2.5 py-1 rounded-full">Body & Physiology</span>
                                    </div>
                                    <p className="text-xs text-orange-800 mb-3 italic">{expertData.exercise.intro}</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {expertData.exercise.guides.map((g, idx) => (
                                            <div key={idx} className="bg-white p-3.5 rounded-xl border border-orange-100 shadow-sm text-xs space-y-1.5">
                                                <div className="flex justify-between items-center font-black text-orange-900">
                                                    <span>✓ {g.title}</span>
                                                    <span className="text-[10px] px-2 py-0.5 bg-orange-50 text-orange-600 rounded">{g.difficulty}</span>
                                                </div>
                                                <p className="text-slate-700 font-medium">{g.expertDesc}</p>
                                                <p className="text-slate-500 text-[11px]"><strong className="text-orange-700">근거:</strong> {g.rationale}</p>
                                                <p className="text-indigo-950 bg-indigo-50 p-2 rounded text-[11px] font-semibold"><strong className="text-indigo-600">실천:</strong> {g.action}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* 📅 주차별 로드맵 (Roadmap) */}
                                <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-200">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">📅</span>
                                            <h4 className="font-bold text-indigo-950 text-base">
                                                주차별 단계 로드맵 ({weeklyPlan.totalWeeks}주 프로그램)
                                            </h4>
                                        </div>
                                        <span className="text-xs font-black text-white bg-indigo-600 px-3 py-1 rounded-full">
                                            목표: {weeklyPlan.goal}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
                                        {weeklyPlan.weeks.map((w, idx) => (
                                            <div key={idx} className={`p-3.5 rounded-xl border flex flex-col justify-between ${w.milestone ? 'bg-indigo-50 border-indigo-300 shadow-sm' : 'bg-white border-slate-200'}`}>
                                                <div>
                                                    <div className="flex items-center justify-between mb-1.5">
                                                        <span className="font-black text-indigo-700 text-sm">Week {w.week}</span>
                                                        {w.milestone && <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded font-bold">마일스톤</span>}
                                                    </div>
                                                    <p className="font-bold text-slate-800 text-xs mb-2">{w.theme}</p>
                                                    <ul className="space-y-1 text-slate-600 text-xs">
                                                        {w.tasks.map((t, tidx) => (
                                                            <li key={tidx} className="flex items-start gap-1.5">
                                                                <span className="text-indigo-500 font-bold shrink-0">•</span>
                                                                <span>{t}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                {w.milestone && (
                                                    <p className="mt-3 pt-2 border-t border-indigo-200 font-bold text-indigo-900 text-xs">
                                                        🎯 {w.milestone}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* 📊 핵심 성공 지표 (KPI) */}
                                <div className="p-5 rounded-2xl bg-teal-50/60 border border-teal-200">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-bold text-teal-950 text-base flex items-center gap-2">
                                            <span>📊</span> [KPI] 데이터 기반 핵심 관리 지표 &amp; 개선 목표
                                        </h4>
                                        <span className="text-xs text-teal-700 font-bold bg-teal-100 px-2.5 py-1 rounded-full">Objective Metrics</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {kpiList.map((kpi, idx) => (
                                            <div key={idx} className="bg-white p-3.5 rounded-xl border border-teal-100 shadow-sm text-xs flex items-start gap-3">
                                                <span className="text-2xl shrink-0 p-2 bg-teal-50 rounded-xl">{kpi.icon}</span>
                                                <div className="space-y-1 flex-1">
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-black text-slate-800">{kpi.indicator}</span>
                                                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${kpi.priority === 'high' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                                                            {kpi.priority === 'high' ? '최우선' : '보통'}
                                                        </span>
                                                    </div>
                                                    <p className="text-teal-700 font-bold text-xs">🎯 목표치: {kpi.targetValue}</p>
                                                    <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                                                        <span>측정주기: {kpi.timeframe}</span>
                                                        <span>측정방법: {kpi.measureMethod}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* 💡 Management 사후 관리 요약 바 */}
                                <div className="bg-slate-900 text-white rounded-2xl p-4 flex items-center justify-between text-xs">
                                    <div>
                                        <p className="font-black text-amber-400 flex items-center gap-2 text-sm">
                                            <span>💡</span> Management 사후 관리 및 1:1 AI 코칭 연동 완료
                                        </p>
                                        <p className="text-slate-300 text-xs mt-1">
                                            본 리포트에 수록된 6대 영역(시작 전/학습 중/신체/Management/로드맵/KPI)의 전 항목과 상세 내용이 검진 결과에 영구 보존됩니다.
                                        </p>
                                    </div>
                                    <span className="shrink-0 text-slate-400 font-mono text-xs ml-4">VERIFIED</span>
                                </div>
                            </div>
                        );
                    })()}

                </div>
            </div>
        </div>
    );
};