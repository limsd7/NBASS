import React, { useState, useEffect } from 'react';
import { CareType, ClassificationResult } from '../../types';
import { PRODUCTS } from '../../constants';
import { 
    LogicEngineConfig, 
    ProductRecommendationRule, 
    SecretPointRule, 
    RecommendedProduct, 
    evaluateClassificationRules, 
    evaluateClassificationWithScores,
    evaluateProductRules, 
    evaluateSecretPointRules,
    CARE_TYPE_LABELS
} from '../../logicEngine';

interface LogicSimulatorProps {
    config: LogicEngineConfig;
}

export const LogicSimulator: React.FC<LogicSimulatorProps> = ({ config }) => {
    const [inputs, setInputs] = useState({
        hrv: {
            sns: 50, pns: 50, brainScore: 70, ppgLevel: 3, fatigue: 30, vitality: 60,
            stressResistance: 50, dominantEEG: 'Alpha', tp: 1000, vlf: 150,
            eegGamma: 10, eegHBeta: 10, eegMBeta: 10, eegLBeta: 10, eegAlpha: 30, eegTheta: 30,
            concentrationLevel: 60, attentionLevel: 60
        },
        survey: {
            bai: 10, isi: 5, gad7: 3, concentrationScore: 15, adrenalFatigueScore: 15,
            chronicFatigue: false, fatigueSymptomsCount: 1
        },
        protocol: {
            stressLevel: 4, avgSleep: 7, emotionalFactor: 5, motivationalFactor: 4, taskDifficulty: 5
        },
        analytics: {
            pureStudyRatio: 65, avgFocusDuration: 45, distractionCount: 3, energyPattern: 'stable'
        }
    });

    const [result, setResult] = useState<{
        careType: CareType | null;
        scoreClassification: ClassificationResult;
        products: RecommendedProduct[];
        secretPoints: any[];
    } | null>(null);

    useEffect(() => {
        const careType = evaluateClassificationRules(
            config.classificationRules, 
            inputs.hrv, 
            inputs.survey, 
            inputs.protocol, 
            inputs.analytics
        );
        const scoreClassification = evaluateClassificationWithScores(
            config.classificationRules,
            inputs.hrv,
            inputs.survey,
            inputs.protocol,
            inputs.analytics,
            undefined,
            true
        );
        const products = evaluateProductRules(
            config.productRules, 
            inputs.hrv, 
            inputs.survey, 
            scoreClassification.primary || careType || CareType.BURNOUT
        );
        const secretPoints = evaluateSecretPointRules(
            config.secretPointRules, 
            inputs.hrv, 
            inputs.survey,
            inputs.protocol,
            inputs.analytics
        );

        setResult({ careType, scoreClassification, products, secretPoints });
    }, [inputs, config]);

    const updateHrv = (key: string, val: any) =>
        setInputs(prev => ({ ...prev, hrv: { ...prev.hrv, [key]: val } }));

    const updateSurvey = (key: string, val: any) =>
        setInputs(prev => ({ ...prev, survey: { ...prev.survey, [key]: val } }));

    const updateProtocol = (key: string, val: any) =>
        setInputs(prev => ({ ...prev, protocol: { ...prev.protocol, [key]: val } }));

    const updateAnalytics = (key: string, val: any) =>
        setInputs(prev => ({ ...prev, analytics: { ...prev.analytics, [key]: val } }));

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full p-4 bg-slate-100 rounded-xl">
            <div className="space-y-4 overflow-y-auto max-h-[550px] pr-1">
                <h4 className="font-bold text-slate-700 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-sm">🎚️ Input Simulator</span>
                    <div className="flex gap-1">
                        <button onClick={() => setInputs({
                            hrv: { ...inputs.hrv, sns: 80, fatigue: 75, dominantEEG: 'H-Beta' },
                            survey: { ...inputs.survey, bai: 24 },
                            protocol: { ...inputs.protocol, stressLevel: 8 },
                            analytics: { ...inputs.analytics, pureStudyRatio: 35 }
                        })} className="text-[10px] px-2 py-1 bg-white border border-slate-300 rounded shadow-sm hover:bg-slate-50 font-medium">🔥 번아웃</button>
                        <button onClick={() => setInputs({
                            hrv: { ...inputs.hrv, sns: 48, pns: 52, brainScore: 82, fatigue: 20 },
                            survey: { ...inputs.survey, bai: 5, isi: 4 },
                            protocol: { ...inputs.protocol, stressLevel: 3, avgSleep: 7.5 },
                            analytics: { ...inputs.analytics, pureStudyRatio: 75, energyPattern: 'stable' }
                        })} className="text-[10px] px-2 py-1 bg-white border border-slate-300 rounded shadow-sm hover:bg-slate-50 font-medium text-emerald-600">💚 건강형</button>
                        <button onClick={() => setInputs({
                            hrv: { ...inputs.hrv, pns: 15 },
                            survey: { ...inputs.survey, isi: 19 },
                            protocol: { ...inputs.protocol, avgSleep: 5 },
                            analytics: { ...inputs.analytics }
                        })} className="text-[10px] px-2 py-1 bg-white border border-slate-300 rounded shadow-sm hover:bg-slate-50 font-medium">🌙 수면장애</button>
                    </div>
                </h4>

                {/* 1. 자율신경 밸런스 (ANS) */}
                <div className="space-y-2 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                    <p className="font-bold text-xs text-slate-500 uppercase tracking-wider">1. 자율신경 밸런스 (ANS)</p>
                    {['sns', 'pns', 'brainScore', 'fatigue', 'stressResistance'].map(key => (
                        <div key={key}>
                            <div className="flex justify-between text-xs mb-0.5">
                                <span className="font-semibold text-slate-600">{key}</span>
                                <span className="font-mono font-bold text-indigo-600">{(inputs.hrv as any)[key]}</span>
                            </div>
                            <input
                                type="range" min="0" max="100"
                                value={(inputs.hrv as any)[key]}
                                onChange={e => updateHrv(key, Number(e.target.value))}
                                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                        </div>
                    ))}
                    <div>
                        <div className="flex justify-between text-xs mb-0.5">
                            <span className="font-semibold text-slate-600">dominantEEG</span>
                        </div>
                        <select
                            value={inputs.hrv.dominantEEG}
                            onChange={e => updateHrv('dominantEEG', e.target.value)}
                            className="w-full text-xs p-1.5 rounded border bg-slate-50"
                        >
                            {['Alpha', 'H-Beta', 'Mid-Beta', 'Low-Beta', 'Theta', 'Gamma'].map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    </div>
                </div>

                {/* 2. Psychometrics */}
                <div className="space-y-2 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                    <p className="font-bold text-xs text-slate-500 uppercase tracking-wider">2. Psychometrics</p>
                    {['bai', 'isi', 'gad7', 'concentrationScore', 'adrenalFatigueScore'].map(key => (
                        <div key={key}>
                            <div className="flex justify-between text-xs mb-0.5">
                                <span className="font-semibold text-slate-600">{key}</span>
                                <span className="font-mono font-bold text-emerald-600">{(inputs.survey as any)[key]}</span>
                            </div>
                            <input
                                type="range" min="0" max={key === 'bai' ? 63 : key === 'isi' ? 28 : key === 'adrenalFatigueScore' ? 60 : 30}
                                value={(inputs.survey as any)[key]}
                                onChange={e => updateSurvey(key, Number(e.target.value))}
                                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                            />
                        </div>
                    ))}
                </div>

                {/* 3. Protocol & Study Analytics */}
                <div className="space-y-2 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                    <p className="font-bold text-xs text-slate-500 uppercase tracking-wider">3. Protocol & Study Analytics</p>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <div className="flex justify-between text-[11px] mb-0.5">
                                <span className="text-slate-600">stressLevel</span>
                                <span className="font-mono font-bold text-amber-600">{inputs.protocol.stressLevel}/10</span>
                            </div>
                            <input
                                type="range" min="1" max="10"
                                value={inputs.protocol.stressLevel}
                                onChange={e => updateProtocol('stressLevel', Number(e.target.value))}
                                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                            />
                        </div>
                        <div>
                            <div className="flex justify-between text-[11px] mb-0.5">
                                <span className="text-slate-600">avgSleep</span>
                                <span className="font-mono font-bold text-amber-600">{inputs.protocol.avgSleep}h</span>
                            </div>
                            <input
                                type="range" min="3" max="12" step="0.5"
                                value={inputs.protocol.avgSleep}
                                onChange={e => updateProtocol('avgSleep', Number(e.target.value))}
                                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <div className="flex justify-between text-[11px] mb-0.5">
                                <span className="text-slate-600">motivationalFactor</span>
                                <span className="font-mono font-bold text-amber-600">{inputs.protocol.motivationalFactor}/5</span>
                            </div>
                            <input
                                type="range" min="1" max="5"
                                value={inputs.protocol.motivationalFactor}
                                onChange={e => updateProtocol('motivationalFactor', Number(e.target.value))}
                                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                            />
                        </div>
                        <div>
                            <div className="flex justify-between text-[11px] mb-0.5">
                                <span className="text-slate-600">pureStudyRatio</span>
                                <span className="font-mono font-bold text-amber-600">{inputs.analytics.pureStudyRatio}%</span>
                            </div>
                            <input
                                type="range" min="0" max="100"
                                value={inputs.analytics.pureStudyRatio}
                                onChange={e => updateAnalytics('pureStudyRatio', Number(e.target.value))}
                                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Output Panel */}
            <div className="bg-slate-800 text-white rounded-2xl p-5 shadow-xl space-y-5 overflow-y-auto max-h-[550px] border border-slate-700">
                <h4 className="font-bold text-emerald-400 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5">⚡ Real-time Output & Diagnostic Validation</span>
                    <span className="text-[10px] text-slate-400 font-normal">Hybrid 2-Tier Engine</span>
                </h4>

                {result && (
                    <div className="space-y-4">
                        {/* 1. 점수 기반 주분류 (Primary Diagnosis) */}
                        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                            <div className="flex justify-between items-center mb-1">
                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                                    Primary Diagnosis (점수 기반 진단)
                                </p>
                                <span className="text-xs font-mono font-black text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                                    {result.scoreClassification.primaryScore}점
                                </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-2xl">{CARE_TYPE_LABELS[result.scoreClassification.primary]?.icon || '✨'}</span>
                                <div>
                                    <p className="text-lg font-black text-white">
                                        {CARE_TYPE_LABELS[result.scoreClassification.primary]?.name || result.scoreClassification.primary}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        {CARE_TYPE_LABELS[result.scoreClassification.primary]?.description}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* 2. 부분류 (Secondary Diagnoses with Confidence Label) */}
                        {result.scoreClassification.secondaryDetails && result.scoreClassification.secondaryDetails.length > 0 && (
                            <div className="bg-white/5 p-3.5 rounded-xl border border-white/10 space-y-2">
                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                                    Secondary Diagnoses (부분류 & 신뢰도)
                                </p>
                                <div className="space-y-1.5">
                                    {result.scoreClassification.secondaryDetails.map(sec => (
                                        <div key={sec.type} className="flex justify-between items-center bg-white/5 px-3 py-1.5 rounded-lg text-xs">
                                            <div className="flex items-center gap-2">
                                                <span>{CARE_TYPE_LABELS[sec.type]?.icon || '📌'}</span>
                                                <span className="font-semibold text-slate-200">{CARE_TYPE_LABELS[sec.type]?.name || sec.type}</span>
                                                <span className="font-mono text-slate-400">({sec.score}점)</span>
                                            </div>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                                sec.confidence === 'confirmed'
                                                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                                                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                            }`}>
                                                {sec.confidenceLabelKr}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 3. 규칙 기반 매칭 결과 (Fallback / First-Match) */}
                        <div className="bg-white/5 p-3 rounded-xl border border-white/10 flex justify-between items-center text-xs">
                            <span className="text-slate-400 font-medium">1단계 규칙 기반 Fallback 결과:</span>
                            <span className="font-bold text-slate-200">
                                {result.careType ? CARE_TYPE_LABELS[result.careType]?.name : '매칭 규칙 없음'}
                            </span>
                        </div>

                        {/* 4. 제품 추천 */}
                        <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1.5">Reflected Products</p>
                            <div className="flex flex-wrap gap-1.5">
                                {result.products.map(p => (
                                    <span key={p.productId} className="px-2 py-1 bg-indigo-500/20 rounded-lg text-xs font-bold text-indigo-200 border border-indigo-500/30">
                                        {PRODUCTS[p.productId]?.name || p.productId} <span className="text-[10px] opacity-75">({p.tier})</span>
                                    </span>
                                ))}
                                {result.products.length === 0 && <span className="text-slate-500 text-xs italic">(No products matched)</span>}
                            </div>
                        </div>

                        {/* 5. Secret Points */}
                        <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1.5">Secret Points (임상 경고)</p>
                            <div className="space-y-1.5">
                                {result.secretPoints.map((sp: SecretPointRule) => (
                                    <div key={sp.id} className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                                        sp.severity === 'critical' ? 'bg-rose-500/10 border-rose-500/30 text-rose-200' :
                                        sp.severity === 'warning' ? 'bg-orange-500/10 border-orange-500/30 text-orange-200' :
                                        'bg-blue-500/10 border-blue-500/30 text-blue-200'
                                    }`}>
                                        <span>{sp.severity === 'critical' ? '🚨' : sp.severity === 'warning' ? '⚠️' : 'ℹ️'}</span>
                                        <span>{sp.message}</span>
                                    </div>
                                ))}
                                {result.secretPoints.length === 0 && <span className="text-slate-500 text-xs italic">(No hidden alerts)</span>}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
