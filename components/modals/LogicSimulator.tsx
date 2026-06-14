import React, { useState, useEffect } from 'react';
import { CareType } from '../../types';
import { PRODUCTS } from '../../constants';
import { LogicEngineConfig, ProductRecommendationRule, SecretPointRule, RecommendedProduct, evaluateClassificationRules, evaluateProductRules, evaluateSecretPointRules } from '../../logicEngine';

interface LogicSimulatorProps {
    config: LogicEngineConfig;
}

export const LogicSimulator: React.FC<LogicSimulatorProps> = ({ config }) => {
    const [inputs, setInputs] = useState({
        hrv: {
            sns: 50, pns: 50, brainScore: 70, ppgLevel: 3,
            stressResistance: 50, dominantEEG: 'Alpha', tp: 1000,
            eegGamma: 10, eegHBeta: 10, eegMBeta: 10, eegLBeta: 10, eegAlpha: 30, eegTheta: 30
        },
        survey: {
            bai: 10, isi: 5, gad7: 3, concentrationScore: 15,
            chronicFatigue: false, fatigueSymptomsCount: 1
        }
    });

    const [result, setResult] = useState<{
        careType: CareType | null;
        products: RecommendedProduct[];
        secretPoints: any[];
    } | null>(null);

    useEffect(() => {
        const careType = evaluateClassificationRules(config.classificationRules, inputs.hrv, inputs.survey);
        const products = evaluateProductRules(config.productRules, inputs.hrv, inputs.survey, careType || CareType.BURNOUT);
        const secretPoints = evaluateSecretPointRules(config.secretPointRules, inputs.hrv, inputs.survey);

        setResult({ careType, products, secretPoints });
    }, [inputs, config]);

    const updateHrv = (key: string, val: any) =>
        setInputs(prev => ({ ...prev, hrv: { ...prev.hrv, [key]: val } }));

    const updateSurvey = (key: string, val: any) =>
        setInputs(prev => ({ ...prev, survey: { ...prev.survey, [key]: val } }));

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full p-4 bg-slate-100 rounded-xl">
            <div className="space-y-4 overflow-y-auto max-h-[500px]">
                <h4 className="font-bold text-slate-700 flex items-center gap-2">
                    <span>🎚️</span> Input Simulator
                    <button onClick={() => setInputs({
                        hrv: { ...inputs.hrv, sns: 80, bai: 20 } as any,
                        survey: { ...inputs.survey, bai: 20 } as any
                    })} className="text-[10px] px-2 py-1 bg-white border rounded shadow-sm hover:bg-slate-50">High Stress</button>
                    <button onClick={() => setInputs({
                        hrv: { ...inputs.hrv, pns: 10, isi: 18 } as any,
                        survey: { ...inputs.survey, isi: 18 } as any
                    })} className="text-[10px] px-2 py-1 bg-white border rounded shadow-sm hover:bg-slate-50">Insomnia</button>
                </h4>

                <div className="space-y-2 bg-white p-4 rounded-xl border border-slate-200">
                    <p className="font-bold text-xs text-slate-500 uppercase">Biometrics (HRV/EEG)</p>
                    {['sns', 'pns', 'brainScore', 'stressResistance'].map(key => (
                        <div key={key}>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="font-semibold text-slate-600">{key}</span>
                                <span className="font-mono font-bold text-indigo-600">{(inputs.hrv as any)[key]}</span>
                            </div>
                            <input
                                type="range" min="0" max="100"
                                value={(inputs.hrv as any)[key]}
                                onChange={e => updateHrv(key, Number(e.target.value))}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                        </div>
                    ))}
                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="font-semibold text-slate-600">dominantEEG</span>
                        </div>
                        <select
                            value={inputs.hrv.dominantEEG}
                            onChange={e => updateHrv('dominantEEG', e.target.value)}
                            className="w-full text-xs p-2 rounded border bg-slate-50"
                        >
                            {['Alpha', 'H-Beta', 'Theta', 'Delta'].map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    </div>
                </div>

                <div className="space-y-2 bg-white p-4 rounded-xl border border-slate-200">
                    <p className="font-bold text-xs text-slate-500 uppercase">Psychometrics</p>
                    {['bai', 'isi', 'gad7', 'concentrationScore'].map(key => (
                        <div key={key}>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="font-semibold text-slate-600">{key}</span>
                                <span className="font-mono font-bold text-emerald-600">{(inputs.survey as any)[key]}</span>
                            </div>
                            <input
                                type="range" min="0" max={key === 'bai' ? 63 : key === 'isi' ? 28 : key === 'gad7' ? 21 : 30}
                                value={(inputs.survey as any)[key]}
                                onChange={e => updateSurvey(key, Number(e.target.value))}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-slate-800 text-white rounded-2xl p-6 shadow-xl space-y-6 overflow-y-auto max-h-[500px] border border-slate-700">
                <h4 className="font-bold text-emerald-400 flex items-center gap-2">
                    <span>⚡</span> Real-time Output
                </h4>

                {result && (
                    <div className="space-y-6">
                        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Diagnosed Type</p>
                            <div className="flex justify-between items-center">
                                <p className="text-2xl font-black mt-1 text-white">{result.careType || 'Unclassified'}</p>
                                {result.careType && <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded border border-emerald-500/30">MATCHED</span>}
                            </div>
                        </div>

                        <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-2">Reflected Products</p>
                            <div className="flex flex-wrap gap-2">
                                {result.products.map(p => (
                                    <span key={p.productId} className="px-2 py-1.5 bg-indigo-500/20 rounded-lg text-xs font-bold text-indigo-200 border border-indigo-500/30">
                                        {PRODUCTS[p.productId]?.name || p.productId} ({p.tier})
                                    </span>
                                ))}
                                {result.products.length === 0 && <span className="text-slate-600 text-xs italic">(No products matched)</span>}
                            </div>
                        </div>

                        <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-2">Secret Points</p>
                            <div className="space-y-2">
                                {result.secretPoints.map((sp: SecretPointRule) => (
                                    <div key={sp.id} className={`p-3 rounded-xl border text-xs flex gap-2 ${sp.severity === 'critical' ? 'bg-rose-500/10 border-rose-500/30 text-rose-200' :
                                        sp.severity === 'warning' ? 'bg-orange-500/10 border-orange-500/30 text-orange-200' :
                                            'bg-blue-500/10 border-blue-500/30 text-blue-200'
                                        }`}>
                                        <span>{sp.severity === 'critical' ? '🚨' : sp.severity === 'warning' ? '⚠️' : 'ℹ️'}</span>
                                        <span>{sp.message}</span>
                                    </div>
                                ))}
                                {result.secretPoints.length === 0 && <span className="text-slate-600 text-xs italic">(No hidden alerts)</span>}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
