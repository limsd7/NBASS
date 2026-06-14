import React from 'react';
import { Layout } from '../Layout';
import { StepProgressBar } from '../ui/StepProgressBar';
import { HRVData, StudentInfo } from '../../types';
import { OCRImportButton } from '../OCRImportButton';

interface EEGStepProps {
    // Navigation
    onNext: () => void;
    onBack: () => void;
    handleFinalAssessment: () => void;

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

    // HRV State (EEG fields are part of HRV)
    hrv: HRVData;
    setHrv: React.Dispatch<React.SetStateAction<HRVData>>;

    // Progress Bar
    onStepClick?: (stepId: string) => void;
}

const evaluateEEG = (label: string, value: number) => {
    if (!value || value <= 0) return null;
    let min = 0, max = 0;
    if (label === 'Gamma') { min = 3; max = 8; }
    else if (label === 'H-Beta') { min = 15; max = 20; }
    else if (label === 'M-Beta') { min = 15; max = 18; }
    else if (label === 'L-Beta') { min = 8; max = 12; }
    else if (label === 'Alpha') { min = 20; max = 25; }
    else if (label === 'Theta') { min = 18; max = 22; }

    if (value < min) return { status: '낮음', color: 'text-blue-600 bg-blue-50 border-blue-200', icon: '🔵' };
    if (value > max) {
        if (label === 'Gamma') return { status: '상위', color: 'text-yellow-700 bg-yellow-50 border-yellow-200', icon: '🟡' };
        return { status: '높음', color: 'text-red-600 bg-red-50 border-red-200', icon: '🔴' };
    }
    return { status: '정상', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', icon: '🟢' };
};

export const EEGStep: React.FC<EEGStepProps> = ({
    onNext,
    onBack,
    handleFinalAssessment,
    activeMenu,
    onMenuChange,
    isDarkMode,
    onToggleDarkMode,
    config,
    hrv,
    setHrv,
    onStepClick
}) => {
    const handleImportComplete = (newHrvData: Partial<HRVData>, newStudentInfo: Partial<StudentInfo>) => {
        setHrv(prev => ({ ...prev, ...newHrvData }));
    };

    return (
        <Layout activeMenu={activeMenu} onMenuChange={onMenuChange} isDarkMode={isDarkMode} onToggleDarkMode={onToggleDarkMode}>
            <StepProgressBar currentStep="eeg" isMedicalMode={config.isMedicalMode} isPortableMode={config.usePortable} onStepClick={onStepClick} />
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20 mt-4">
                <div className="flex flex-col items-center text-center gap-4">
                    <img src="./EEG logo.JPG" alt="EEG Logo" className="w-24 h-24 object-contain" />
                    <div>
                        <h2 className="text-3xl font-extrabold text-slate-900">Step 5: EEG Biometrics</h2>
                        <p className="text-slate-500 mt-2">종합 뇌파 분석 리포트의 데이터를 입력하십시오.</p>
                    </div>
                    <div className="flex justify-center mt-4">
                        <OCRImportButton onImportComplete={handleImportComplete} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* 종합 뇌파 분석 */}
                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                            <div className="w-2 h-6 bg-violet-600 rounded-full"></div>
                            <h3 className="font-bold text-slate-800 text-xl">종합 뇌파 분석</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-violet-50 p-6 rounded-2xl border border-violet-100">
                                <label className="block text-sm font-bold text-violet-800 mb-2">뇌 건강점수 (Brain Score)</label>
                                <div className="flex items-center gap-4">
                                    <input type="number" value={hrv.brainScore || ''} onChange={e => setHrv({ ...hrv, brainScore: e.target.value ? parseInt(e.target.value, 10) || 0 : 0 })} className="flex-1 p-4 bg-white border border-violet-200 rounded-xl font-black text-2xl text-violet-600 text-center" />
                                    <span className="font-bold text-violet-400 text-xl">점</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-sm font-bold text-slate-700">뇌파 비율 (%) 및 우세 유형 선택</label>
                                <p className="text-[10px] text-violet-600 bg-violet-50 p-2 rounded-lg">💡 PPG/EEG 검사 결과에서 각 뇌파의 비율(%)을 입력하고, 가장 우세한 뇌파를 선택하세요.</p>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { label: 'Gamma', key: 'eegGamma', freq: '3-8% 정상', state: '불안, 흥분시 우세', color: 'rose', emoji: '⚡' },
                                        { label: 'H-Beta', key: 'eegHBeta', freq: '15-20% 정상', state: '긴장, 스트레스시 우세', color: 'orange', emoji: '😰' },
                                        { label: 'M-Beta', key: 'eegMBeta', freq: '15-18% 정상', state: '집중, 몰입시 우세', color: 'emerald', emoji: '🎯' },
                                        { label: 'L-Beta', key: 'eegLBeta', freq: '8-12% 정상', state: '주변인식시 우세', color: 'blue', emoji: '👀' },
                                        { label: 'Alpha', key: 'eegAlpha', freq: '20-25% 정상', state: '안정시 우세', color: 'green', emoji: '😌' },
                                        { label: 'Theta', key: 'eegTheta', freq: '18-22% 정상', state: '수면시 우세', color: 'indigo', emoji: '😴' }
                                    ].map(item => {
                                        const val = hrv[item.key as keyof HRVData] as number;
                                        const isSelected = hrv.dominantEEG.includes(item.label);
                                        const evaluation = evaluateEEG(item.label, val);
                                        
                                        return (
                                            <div key={item.key} className={`p-4 rounded-2xl border transition-all flex flex-col gap-2 relative ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-lg">{item.emoji}</span>
                                                        <div>
                                                            <span className="text-xs font-bold uppercase tracking-wider">{item.label}</span>
                                                            <p className={`text-[9px] ${isSelected ? 'text-white/70' : 'text-slate-400'}`}>{item.freq}</p>
                                                        </div>
                                                    </div>
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => {
                                                            const current = hrv.dominantEEG;
                                                            const newSelection = current.includes(item.label)
                                                                ? current.filter(t => t !== item.label)
                                                                : [...current, item.label];
                                                            setHrv({ ...hrv, dominantEEG: newSelection });
                                                        }}
                                                        className="accent-white h-4 w-4"
                                                    />
                                                </div>
                                                <p className={`text-[10px] font-medium ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>{item.state}</p>
                                                
                                                <div className="flex gap-2 items-center mt-1">
                                                    <input
                                                        type="number"
                                                        step="0.1"
                                                        value={val || ''}
                                                        onChange={e => setHrv({ ...hrv, [item.key]: Number(e.target.value) })}
                                                        className={`w-full p-2 border rounded-lg text-sm font-bold focus:outline-none ${isSelected ? 'text-white bg-white/10 border-white/20' : 'text-slate-900 bg-white border-slate-200'}`}
                                                        placeholder="%"
                                                    />
                                                    {evaluation && !isSelected && (
                                                        <div className={`flex items-center gap-1 px-2 py-1.5 rounded-lg border whitespace-nowrap text-[10px] font-bold ${evaluation.color}`}>
                                                            <span>{evaluation.icon}</span>
                                                            <span>{evaluation.status}</span>
                                                        </div>
                                                    )}
                                                    {evaluation && isSelected && (
                                                        <div className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-white/30 bg-white/20 whitespace-nowrap text-[10px] font-bold text-white">
                                                            <span>{evaluation.icon}</span>
                                                            <span>{evaluation.status}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                {hrv.dominantEEG.length > 0 && (
                                    <div className="space-y-2">
                                        {hrv.dominantEEG.map(type => (
                                            <div key={type} className={`p-4 rounded-xl border ${type === 'M-Beta' || type === 'Alpha' ? 'bg-emerald-50 border-emerald-200' :
                                                type === 'L-Beta' ? 'bg-blue-50 border-blue-200' :
                                                    type === 'Theta' ? 'bg-indigo-50 border-indigo-200' :
                                                        'bg-orange-50 border-orange-200'
                                                }`}>
                                                <p className={`text-[11px] font-medium ${type === 'M-Beta' || type === 'Alpha' ? 'text-emerald-700' :
                                                    type === 'L-Beta' ? 'text-blue-700' :
                                                        type === 'Theta' ? 'text-indigo-700' :
                                                            'text-orange-700'
                                                    }`}>
                                                    ✓ 우세 뇌파: <strong>{type}</strong> — {
                                                        type === 'Gamma' ? '불안하거나 흥분 상태일 때 우세합니다. 과도한 경우 스트레스 관리가 필요합니다.' :
                                                            type === 'H-Beta' ? '긴장하거나 스트레스 상태일 때 우세합니다. 이완 훈련이 도움이 됩니다.' :
                                                                type === 'M-Beta' ? '집중하고 몰입할 때 우세합니다. 학습에 가장 적합한 상태입니다! 👍' :
                                                                    type === 'L-Beta' ? '주변 환경을 인식하고 경계할 때 우세합니다. 주의력이 분산될 수 있습니다.' :
                                                                        type === 'Alpha' ? '편안하고 안정된 상태일 때 우세합니다. 휴식과 창의성에 좋습니다.' :
                                                                            '졸리거나 수면 상태에 가까울 때 우세합니다. 충분한 수면이 필요할 수 있습니다.'
                                                    }
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 뇌 균형 및 스트레스 */}
                    <div className="space-y-8">
                        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                                <div className="w-2 h-6 bg-red-500 rounded-full"></div>
                                <h3 className="font-bold text-slate-800 text-xl">뇌 균형 및 스트레스</h3>
                            </div>

                            <div className="space-y-6">
                                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
                                    <label className="block text-sm font-bold text-slate-700 mb-4">뇌 균형도(%)</label>
                                    <div className="flex items-center gap-6">
                                        <div className="flex-1 space-y-2">
                                            <p className="text-[10px] font-bold text-slate-400 text-center uppercase">Left (좌측)</p>
                                            <input type="number" step="0.1" value={hrv.brainBalanceL || ''} onChange={e => setHrv({ ...hrv, brainBalanceL: e.target.value ? parseFloat(e.target.value) || 0 : 0, brainBalanceR: e.target.value ? parseFloat((100 - (parseFloat(e.target.value) || 0)).toFixed(1)) : 100 })} className="w-full p-3 bg-white border rounded-xl text-center font-bold" />
                                        </div>
                                        <div className="text-slate-300 font-bold">:</div>
                                        <div className="flex-1 space-y-2">
                                            <p className="text-[10px] font-bold text-slate-400 text-center uppercase">Right (우측)</p>
                                            <input type="number" step="0.1" value={hrv.brainBalanceR || ''} onChange={e => setHrv({ ...hrv, brainBalanceR: e.target.value ? parseFloat(e.target.value) || 0 : 0, brainBalanceL: e.target.value ? parseFloat((100 - (parseFloat(e.target.value) || 0)).toFixed(1)) : 100 })} className="w-full p-3 bg-white border rounded-xl text-center font-bold" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-sm font-bold text-slate-700">뇌 스트레스</label>
                                    <div className="grid grid-cols-5 gap-2">
                                        {['매우 높음', '높음', '적정', '낮음', '매우 낮음'].map(cat => (
                                            <button
                                                key={cat}
                                                onClick={() => setHrv({ ...hrv, brainStressCategory: cat })}
                                                className={`py-3 rounded-xl text-xs font-bold border transition-all ${hrv.brainStressCategory === cat ? 'bg-red-500 text-white border-red-500' : 'bg-white text-slate-400 border-slate-200'}`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                                <div className="w-2 h-6 bg-amber-500 rounded-full"></div>
                                <h3 className="font-bold text-slate-800 text-xl">뇌 기능 평가</h3>
                            </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center"><label className="text-sm font-bold text-slate-700">집중력(Concentration)</label></div>
                                    <div className="flex gap-4">
                                        <div className="flex-1 grid grid-cols-5 gap-2">
                                            {['매우 높음', '높음', '적정', '낮음', '매우 낮음'].map(cat => (
                                                <button key={cat} onClick={() => setHrv({ ...hrv, concentrationCategory: cat })} className={`py-3 rounded-lg text-xs font-bold border transition-all ${hrv.concentrationCategory === cat ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-slate-400 border-slate-200'}`}>{cat}</button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center"><label className="text-sm font-bold text-slate-700">주의력(Attention)</label></div>
                                    <div className="flex gap-4">
                                        <div className="flex-1 grid grid-cols-5 gap-2">
                                            {['매우 높음', '높음', '적정', '낮음', '매우 낮음'].map(cat => (
                                                <button key={cat} onClick={() => setHrv({ ...hrv, attentionCategory: cat })} className={`py-3 rounded-lg text-xs font-bold border transition-all ${hrv.attentionCategory === cat ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-400 border-slate-200'}`}>{cat}</button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                <div className="flex gap-4">
                    <button onClick={onBack} className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all">Back</button>
                    {config.isMedicalMode ? (
                        <button onClick={onNext} className="flex-[2] py-4 bg-rose-600 text-white font-bold rounded-2xl shadow-lg hover:bg-rose-700 transition-all flex items-center justify-center gap-2">
                            <span>🩸</span> Next: 혈액검사 입력
                        </button>
                    ) : (
                        <button onClick={handleFinalAssessment} className="flex-[2] py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-lg hover:bg-slate-800 transition-all">Generate Integrated Report</button>
                    )}
                </div>
            </div>
        </Layout>
    );
};
