import React from 'react';
import { Layout } from '../Layout';
import { StepProgressBar } from '../ui/StepProgressBar';
import { ProtocolData } from '../../types';
import { getNoiseDescription, getStressDescription } from '../../utils/constants';

interface ProtocolStepProps {
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
    };

    // Protocol State
    protocol: ProtocolData;
    setProtocol: React.Dispatch<React.SetStateAction<ProtocolData>>;

    // Custom Location
    isCustomLoc: boolean;
    setIsCustomLoc: React.Dispatch<React.SetStateAction<boolean>>;

    // Progress Bar
    onStepClick?: (stepId: string) => void;
}

export const ProtocolStep: React.FC<ProtocolStepProps> = ({
    onNext,
    onBack,
    activeMenu,
    onMenuChange,
    isDarkMode,
    onToggleDarkMode,
    config,
    protocol,
    setProtocol,
    isCustomLoc,
    setIsCustomLoc,
    onStepClick
}) => {
    return (
        <Layout activeMenu={activeMenu} onMenuChange={onMenuChange} isDarkMode={isDarkMode} onToggleDarkMode={onToggleDarkMode}>
            <StepProgressBar currentStep="protocol" isMedicalMode={config.isMedicalMode} onStepClick={onStepClick} />
            <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-20 mt-4">
                <div className="flex flex-col items-center text-center gap-4">
                    <img src="./학습 집중력 분석 프로토콜 logo.jpg" alt="Logo" className="w-24 h-24 object-contain" />
                    <div>
                        <h2 className="text-3xl font-extrabold text-slate-900">학습 집중력 분석 프로토콜 검사</h2>
                        <p className="text-slate-500 mt-2">단순 설문을 넘어 본질적인 집중력 요인을 확인 분석합니다.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8">
                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
                        <div className="flex items-center gap-3">
                            <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">1</span>
                            <h3 className="text-xl font-bold text-slate-800">사전 준비 (Setting the Baseline)</h3>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-3">주로 공부하는 장소 (Place)</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {['학교 (School)', '학원 (Academy)', '도서관 (Library)', '카페 (Cafe)', '집 (Home)', '독서실 (Study Room)', '기타'].map(loc => (
                                        <button
                                            key={loc}
                                            onClick={() => {
                                                if (loc === '기타') {
                                                    setIsCustomLoc(true);
                                                    setProtocol({ ...protocol, location: '' });
                                                } else {
                                                    setIsCustomLoc(false);
                                                    setProtocol({ ...protocol, location: loc });
                                                }
                                            }}
                                            className={`p-3 text-xs font-bold rounded-xl border transition-all ${(!isCustomLoc && protocol.location === loc) || (loc === '기타' && isCustomLoc) ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-slate-50 text-slate-600 border-slate-200'}`}
                                        >
                                            {loc}
                                        </button>
                                    ))}
                                </div>
                                {isCustomLoc && (
                                    <input
                                        type="text"
                                        placeholder="공부하는 장소를 직접 입력하세요"
                                        value={protocol.location}
                                        onChange={e => setProtocol({ ...protocol, location: e.target.value })}
                                        className="mt-4 w-full px-4 py-3 bg-white border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-sm"
                                        autoFocus
                                    />
                                )}
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500">주변 소음 수준 (Noise)</label>
                                    <p className="text-[10px] text-slate-400">공부하는 장소에서 평소 느끼는 소음의 정도를 선택하세요.</p>
                                    <input type="range" min="1" max="10" value={protocol.noiseLevel} onChange={e => setProtocol({ ...protocol, noiseLevel: parseInt(e.target.value) })} className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                                    <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-1">
                                        <span>1 (고요함)</span>
                                        <span>5 (보통)</span>
                                        <span>10 (매우 시끄러움)</span>
                                    </div>
                                    <p className="text-xs font-bold text-indigo-600 mt-1">{protocol.noiseLevel}: {getNoiseDescription(protocol.noiseLevel)}</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500">현재 스트레스 정도 (Stress)</label>
                                    <p className="text-[10px] text-slate-400">공부하는 장소에서 공부할 때 받는 스트레스 정도를 선택하세요.</p>
                                    <input type="range" min="1" max="10" value={protocol.stressLevel} onChange={e => setProtocol({ ...protocol, stressLevel: parseInt(e.target.value) })} className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                                    <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-1">
                                        <span>1 (매우 편안)</span>
                                        <span>5 (약간 긴장)</span>
                                        <span>10 (극심한 스트레스)</span>
                                    </div>
                                    <p className="text-xs font-bold text-indigo-600 mt-1">{protocol.stressLevel}: {getStressDescription(protocol.stressLevel)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
                        <div className="flex items-center gap-3">
                            <span className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold text-sm">2</span>
                            <h3 className="text-xl font-bold text-slate-800">심층 집중력 측정 (Detailed Assessment)</h3>
                        </div>
                        <div className="space-y-8">
                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                                <div className="flex justify-between items-start mb-4">
                                    <p className="text-sm font-bold text-slate-700 uppercase tracking-wider">A. 심리/전략적 요인</p>
                                    <span className="text-[10px] bg-white px-2 py-1 rounded border border-slate-200 text-slate-400 font-bold">1(전혀 아님) ~ 5(매우 그러함)</span>
                                </div>
                                <div className="space-y-6">
                                    {[
                                        {
                                            label: "심리적 요인 (불안/우울)",
                                            key: "emotionalFactor",
                                            low: "매우 안정",
                                            high: "매우 불안",
                                            question: "평소에 걱정이 많거나, 기분이 자주 가라앉나요?",
                                            descriptions: [
                                                "1점: 마음이 편안하고 안정적",
                                                "2점: 가끔 걱정되는 일이 있음",
                                                "3점: 보통 수준의 스트레스",
                                                "4점: 자주 불안하거나 우울함",
                                                "5점: 늘 걱정되고 기분이 가라앉음"
                                            ]
                                        },
                                        {
                                            label: "동기적 요인 (목표 의식)",
                                            key: "motivationalFactor",
                                            low: "의욕 없음",
                                            high: "목표 명확",
                                            question: "공부하는 이유와 목표가 분명한가요?",
                                            descriptions: [
                                                "1점: 왜 공부하는지 모르겠음",
                                                "2점: 막연히 해야 할 것 같아서",
                                                "3점: 어느 정도 목표가 있음",
                                                "4점: 목표가 꽤 분명함",
                                                "5점: 확실한 목표와 의욕이 넘침"
                                            ]
                                        },
                                        {
                                            label: "행동적 요인 (산만함)",
                                            key: "behavioralFactor",
                                            low: "매우 산만",
                                            high: "매우 차분",
                                            question: "공부할 때 집중이 잘 되는 편인가요?",
                                            descriptions: [
                                                "1점: 자꾸 딴 생각, 폰 확인",
                                                "2점: 집중이 자주 흐트러짐",
                                                "3점: 보통 수준으로 집중",
                                                "4점: 대체로 잘 집중함",
                                                "5점: 오래 집중할 수 있음"
                                            ]
                                        }
                                    ].map(item => (
                                        <div key={item.key} className="space-y-2 p-4 bg-white rounded-xl border border-slate-100">
                                            <div className="flex justify-between items-start">
                                                <label className="text-xs font-bold text-slate-600">{item.label}</label>
                                            </div>
                                            <p className="text-[11px] text-amber-700 bg-amber-50 px-2 py-1 rounded-lg inline-block">💡 {item.question}</p>
                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4, 5].map(v => (
                                                    <button key={v} onClick={() => setProtocol({ ...protocol, [item.key]: v })} className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${protocol[item.key as keyof ProtocolData] === v ? 'bg-amber-500 text-white border-amber-500 shadow-sm' : 'bg-white text-slate-400 border-slate-200 hover:border-amber-200'}`}>{v}</button>
                                                ))}
                                            </div>
                                            <div className="flex justify-between text-[10px] text-slate-400 font-medium px-1">
                                                <span>{item.low} (1점)</span>
                                                <span>{item.high} (5점)</span>
                                            </div>
                                            {protocol[item.key as keyof ProtocolData] && (
                                                <div className="mt-2 p-2 bg-amber-50 rounded-lg border border-amber-100">
                                                    <p className="text-[10px] text-amber-700 font-medium">
                                                        ✓ {item.descriptions[(protocol[item.key as keyof ProtocolData] as number) - 1]}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
                                <div className="flex justify-between items-start mb-4">
                                    <p className="text-sm font-bold text-indigo-800 uppercase tracking-wider">B. 학습 몰입도</p>
                                    <span className="text-[10px] bg-white px-2 py-1 rounded border border-indigo-200 text-indigo-300 font-bold">1(전혀 아님) ~ 5(매우 그러함)</span>
                                </div>
                                <div className="space-y-6">
                                    {[
                                        {
                                            label: "과제 난이도 적합성",
                                            key: "taskDifficulty",
                                            low: "매우 쉬움",
                                            high: "매우 어려움",
                                            question: "지금 공부하는 내용이 나에게 얼마나 어려운가요?",
                                            descriptions: [
                                                "1점: 이미 다 아는 내용이라 너무 쉬움",
                                                "2점: 대부분 이해했고 복습 수준",
                                                "3점: 노력하면 이해할 수 있는 수준",
                                                "4점: 꽤 어렵고 시간이 많이 걸림",
                                                "5점: 개념 자체가 이해가 안 됨"
                                            ]
                                        },
                                        {
                                            label: "시간 왜곡 경험 (몰입도)",
                                            key: "timeDistortion",
                                            low: "시간이 느림",
                                            high: "순식간에 지남",
                                            question: "공부할 때 시간이 어떻게 느껴지나요?",
                                            descriptions: [
                                                "1점: 시간이 너무 안 가고 지루함",
                                                "2점: 시계를 자주 확인하게 됨",
                                                "3점: 보통으로 시간이 흐름",
                                                "4점: 시간이 꽤 빨리 감",
                                                "5점: 순식간에 지나가서 놀람 (몰입 상태)"
                                            ],
                                            note: "5점에 가까울수록 '몰입(Flow)' 상태를 경험하는 것입니다"
                                        }
                                    ].map(item => (
                                        <div key={item.key} className="space-y-2 p-4 bg-white rounded-xl border border-indigo-100">
                                            <div className="flex justify-between items-start">
                                                <label className="text-xs font-bold text-indigo-600">{item.label}</label>
                                            </div>
                                            <p className="text-[11px] text-indigo-700 bg-indigo-50 px-2 py-1 rounded-lg inline-block">💡 {item.question}</p>
                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4, 5].map(v => (
                                                    <button key={v} onClick={() => setProtocol({ ...protocol, [item.key]: v })} className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${protocol[item.key as keyof ProtocolData] === v ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white text-indigo-400 border-indigo-200 hover:border-indigo-300'}`}>{v}</button>
                                                ))}
                                            </div>
                                            <div className="flex justify-between text-[10px] text-indigo-400 font-medium px-1">
                                                <span>{item.low} (1점)</span>
                                                <span>{item.high} (5점)</span>
                                            </div>
                                            {protocol[item.key as keyof ProtocolData] && (
                                                <div className="mt-2 p-2 bg-indigo-50 rounded-lg border border-indigo-100">
                                                    <p className="text-[10px] text-indigo-700 font-medium">
                                                        ✓ {item.descriptions[(protocol[item.key as keyof ProtocolData] as number) - 1]}
                                                    </p>
                                                </div>
                                            )}
                                            {(item as any).note && (
                                                <p className="text-[9px] text-indigo-400 italic mt-1">* {(item as any).note}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button onClick={onBack} className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all">Back</button>
                    <button onClick={onNext} className="flex-[2] py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg hover:bg-blue-700 transition-all">Next: 학습 분석 (Analytics)</button>
                </div>
            </div>
        </Layout>
    );
};
