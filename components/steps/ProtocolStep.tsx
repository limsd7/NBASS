import React from 'react';
import { Layout } from '../Layout';
import { StepProgressBar } from '../ui/StepProgressBar';
import { ProtocolData } from '../../types';
import { getNoiseDescription, getStressDescription } from '../../utils/constants';

interface ProtocolStepProps {
    // Navigation
    onNext: () => void;
    onBack: () => void;

    // 10-Min Mode
    is10MinMode?: boolean;

    // Layout props
    activeMenu: any;
    onMenuChange: (menu: any) => void;
    isDarkMode: boolean;
    onToggleDarkMode: () => void;
    onHomeClick?: () => void;

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
    is10MinMode = false,
    activeMenu,
    onMenuChange,
    isDarkMode,
    onToggleDarkMode,
    onHomeClick,
    config,
    protocol,
    setProtocol,
    isCustomLoc,
    setIsCustomLoc,
    onStepClick
}) => {
    return (
        <Layout onHomeClick={onHomeClick} activeMenu={activeMenu} onMenuChange={onMenuChange} isDarkMode={isDarkMode} onToggleDarkMode={onToggleDarkMode}>
            <StepProgressBar currentStep="protocol" isMedicalMode={config.isMedicalMode} is10MinMode={is10MinMode} onStepClick={onStepClick} />
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-24 mt-6 px-4">
                {is10MinMode && (
                    <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-800 p-4 rounded-2xl text-white shadow-md flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">⚡</span>
                            <div>
                                <h4 className="text-base font-black">3분 무료체험 핵심 코스 [2단계 / 총 3단계]</h4>
                                <p className="text-xs text-blue-100 font-medium">공부 장소, 소음, 스트레스 및 몰입 요인을 분석합니다.</p>
                            </div>
                        </div>
                        <span className="px-3 py-1 bg-white/20 rounded-xl text-xs font-black backdrop-blur-sm">Fast-Track</span>
                    </div>
                )}
                <div className="flex flex-col items-center text-center gap-4">
                    <img src="./학습 집중력 분석 프로토콜 logo.jpg" alt="Logo" className="w-24 h-24 object-contain drop-shadow-sm" />
                    <div>
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">학습 집중력 분석 프로토콜 검사</h2>
                        <p className="text-base md:text-lg font-semibold text-slate-500 mt-2">단순 설문을 넘어 본질적인 집중력 및 환경 요인을 정밀 분석합니다.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8">
                    {/* 1. 사전 준비 (Baseline) */}
                    <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-md space-y-8">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                            <span className="w-9 h-9 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-black text-base shadow-sm">1</span>
                            <h3 className="text-2xl font-black text-slate-900">사전 환경 준비 (Setting the Baseline)</h3>
                        </div>

                        <div className="space-y-8">
                            <div>
                                <label className="block text-lg font-black text-slate-800 mb-3">📍 주로 공부하는 장소 (Study Place)</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {['학교 (School)', '학원 (Academy)', '도서관 (Library)', '카페 (Cafe)', '집 (Home)', '독서실 (Study Room)', '기타'].map(loc => (
                                        <button
                                            key={loc}
                                            type="button"
                                            onClick={() => {
                                                if (loc === '기타') {
                                                    setIsCustomLoc(true);
                                                    setProtocol({ ...protocol, location: '' });
                                                } else {
                                                    setIsCustomLoc(false);
                                                    setProtocol({ ...protocol, location: loc });
                                                }
                                            }}
                                            className={`p-4 text-sm md:text-base font-bold rounded-2xl border transition-all ${(!isCustomLoc && protocol.location === loc) || (loc === '기타' && isCustomLoc)
                                                    ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-105'
                                                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-blue-50 hover:border-blue-200'
                                                }`}
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
                                        className="mt-4 w-full px-5 py-3.5 bg-white border-2 border-blue-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-base font-bold"
                                        autoFocus
                                    />
                                )}
                            </div>

                            <div className="space-y-6 pt-2 border-t border-slate-100">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <label className="text-base font-black text-slate-800">🔊 주변 소음 수준 (Noise Level)</label>
                                        <span className="text-sm font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-xl">
                                            {protocol.noiseLevel}점 : {getNoiseDescription(protocol.noiseLevel)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500 font-medium">공부하는 장소에서 평소 느끼는 소음의 정도를 슬라이더로 조절하세요.</p>
                                    <input
                                        type="range"
                                        min="1"
                                        max="10"
                                        value={protocol.noiseLevel}
                                        onChange={e => setProtocol({ ...protocol, noiseLevel: parseInt(e.target.value) })}
                                        className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                    />
                                    <div className="flex justify-between text-xs font-bold text-slate-500">
                                        <span>1 (고요함)</span>
                                        <span>5 (보통)</span>
                                        <span>10 (매우 시끄러움)</span>
                                    </div>
                                </div>

                                <div className="space-y-3 pt-4 border-t border-slate-100">
                                    <div className="flex justify-between items-center">
                                        <label className="text-base font-black text-slate-800">⚡ 현재 학습 스트레스 정도 (Stress Level)</label>
                                        <span className="text-sm font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-xl">
                                            {protocol.stressLevel}점 : {getStressDescription(protocol.stressLevel)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500 font-medium">공부할 때 직접 느끼는 체감 스트레스 강도를 선택하세요.</p>
                                    <input
                                        type="range"
                                        min="1"
                                        max="10"
                                        value={protocol.stressLevel}
                                        onChange={e => setProtocol({ ...protocol, stressLevel: parseInt(e.target.value) })}
                                        className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                    />
                                    <div className="flex justify-between text-xs font-bold text-slate-500">
                                        <span>1 (매우 편안)</span>
                                        <span>5 (약간 긴장)</span>
                                        <span>10 (극심한 스트레스)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. 심층 집중력 측정 */}
                    <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-md space-y-8">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                            <span className="w-9 h-9 bg-amber-500 text-white rounded-2xl flex items-center justify-center font-black text-base shadow-sm">2</span>
                            <h3 className="text-2xl font-black text-slate-900">심층 집중력 측정 (Detailed Assessment)</h3>
                        </div>

                        <div className="space-y-8">
                            {/* A. 심리/전략적 요인 */}
                            <div className="p-6 md:p-8 bg-amber-50/40 rounded-3xl border border-amber-200/80 space-y-6">
                                <div className="flex justify-between items-center flex-wrap gap-2">
                                    <p className="text-lg font-black text-amber-900 uppercase tracking-wider">A. 심리 & 동기 요인</p>
                                    <span className="text-xs bg-white px-3 py-1.5 rounded-xl border border-amber-200 text-amber-800 font-bold shadow-sm">1(전혀 아님) ~ 5(매우 그러함)</span>
                                </div>

                                <div className="space-y-5">
                                    {[
                                        {
                                            label: "심리적 요인 (불안/우울)",
                                            key: "emotionalFactor",
                                            low: "매우 안정",
                                            high: "매우 불안",
                                            question: "평소에 시험이나 성적에 대한 걱정이 많거나, 기분이 자주 가라앉나요?",
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
                                            question: "공부하는 이유와 목표가 마음속에 분명하게 자리잡고 있나요?",
                                            descriptions: [
                                                "1점: 왜 공부하는지 모르겠음",
                                                "2점: 막연히 해야 할 것 같아서",
                                                "3점: 어느 정도 목표가 있음",
                                                "4점: 목표가 꽤 분명함",
                                                "5점: 확실한 목표와 의욕이 넘침"
                                            ]
                                        },
                                        {
                                            label: "행동적 요인 (산만함 / 몰입)",
                                            key: "behavioralFactor",
                                            low: "매우 산만",
                                            high: "매우 차분",
                                            question: "공부할 때 딴생각이나 스마트폰 유혹 없이 집중이 잘 유지되나요?",
                                            descriptions: [
                                                "1점: 자꾸 딴 생각, 폰 확인",
                                                "2점: 집중이 자주 흐트러짐",
                                                "3점: 보통 수준으로 집중",
                                                "4점: 대체로 잘 집중함",
                                                "5점: 오래 집중할 수 있음"
                                            ]
                                        }
                                    ].map(item => (
                                        <div key={item.key} className="p-5 md:p-6 bg-white rounded-2xl border border-amber-200/60 shadow-sm space-y-3">
                                            <div className="flex justify-between items-center">
                                                <label className="text-base md:text-lg font-black text-slate-900">{item.label}</label>
                                            </div>
                                            <p className="text-sm md:text-base text-amber-900 bg-amber-50/80 px-3.5 py-2 rounded-xl inline-block font-semibold">
                                                💡 {item.question}
                                            </p>
                                            <div className="flex gap-2 pt-1">
                                                {[1, 2, 3, 4, 5].map(v => (
                                                    <button
                                                        key={v}
                                                        type="button"
                                                        onClick={() => setProtocol({ ...protocol, [item.key]: v })}
                                                        className={`flex-1 py-3 text-base md:text-lg font-black rounded-xl border transition-all ${protocol[item.key as keyof ProtocolData] === v
                                                                ? 'bg-amber-500 text-white border-amber-500 shadow-md scale-105'
                                                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-amber-300 hover:bg-amber-50/50'
                                                            }`}
                                                    >
                                                        {v}점
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="flex justify-between text-xs text-slate-400 font-bold px-1">
                                                <span>{item.low} (1점)</span>
                                                <span>{item.high} (5점)</span>
                                            </div>
                                            {protocol[item.key as keyof ProtocolData] && (
                                                <div className="mt-2 p-3 bg-amber-50 rounded-xl border border-amber-100">
                                                    <p className="text-sm text-amber-900 font-bold">
                                                        ✓ 선택한 상태: {item.descriptions[(protocol[item.key as keyof ProtocolData] as number) - 1]}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* B. 학습 몰입도 */}
                            <div className="p-6 md:p-8 bg-indigo-50/50 rounded-3xl border border-indigo-200/80 space-y-6">
                                <div className="flex justify-between items-center flex-wrap gap-2">
                                    <p className="text-lg font-black text-indigo-900 uppercase tracking-wider">B. 학습 몰입도 & 과제 난이도</p>
                                    <span className="text-xs bg-white px-3 py-1.5 rounded-xl border border-indigo-200 text-indigo-800 font-bold shadow-sm">1(전혀 아님) ~ 5(매우 그러함)</span>
                                </div>

                                <div className="space-y-5">
                                    {[
                                        {
                                            label: "과제 난이도 적합성",
                                            key: "taskDifficulty",
                                            low: "너무 쉬움",
                                            high: "매우 어려움",
                                            question: "지금 공부하는 내용이 본인에게 얼마나 어렵게 느껴지나요?",
                                            descriptions: [
                                                "1점: 이미 다 아는 내용이라 너무 쉬움",
                                                "2점: 대부분 이해했고 복습 수준",
                                                "3점: 노력하면 이해할 수 있는 적정 수준",
                                                "4점: 꽤 어렵고 시간이 많이 걸림",
                                                "5점: 개념 자체가 이해가 안 됨"
                                            ]
                                        },
                                        {
                                            label: "시간 왜곡 경험 (몰입 상태 Flow)",
                                            key: "timeDistortion",
                                            low: "시간이 안 감",
                                            high: "순식간에 지남",
                                            question: "공부할 때 시간이 어떻게 느껴지나요?",
                                            descriptions: [
                                                "1점: 시간이 너무 안 가고 지루함",
                                                "2점: 시계를 자주 확인하게 됨",
                                                "3점: 보통으로 시간이 흐름",
                                                "4점: 시간이 꽤 빨리 감",
                                                "5점: 순식간에 지나가서 놀람 (최고 몰입 상태)"
                                            ],
                                            note: "5점에 가까울수록 뇌가 깊은 '몰입(Flow)' 상태를 경험하는 것입니다."
                                        }
                                    ].map(item => (
                                        <div key={item.key} className="p-5 md:p-6 bg-white rounded-2xl border border-indigo-200/60 shadow-sm space-y-3">
                                            <div className="flex justify-between items-center">
                                                <label className="text-base md:text-lg font-black text-slate-900">{item.label}</label>
                                            </div>
                                            <p className="text-sm md:text-base text-indigo-900 bg-indigo-50/80 px-3.5 py-2 rounded-xl inline-block font-semibold">
                                                💡 {item.question}
                                            </p>
                                            <div className="flex gap-2 pt-1">
                                                {[1, 2, 3, 4, 5].map(v => (
                                                    <button
                                                        key={v}
                                                        type="button"
                                                        onClick={() => setProtocol({ ...protocol, [item.key]: v })}
                                                        className={`flex-1 py-3 text-base md:text-lg font-black rounded-xl border transition-all ${protocol[item.key as keyof ProtocolData] === v
                                                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md scale-105'
                                                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                                                            }`}
                                                    >
                                                        {v}점
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="flex justify-between text-xs text-slate-400 font-bold px-1">
                                                <span>{item.low} (1점)</span>
                                                <span>{item.high} (5점)</span>
                                            </div>
                                            {protocol[item.key as keyof ProtocolData] && (
                                                <div className="mt-2 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                                                    <p className="text-sm text-indigo-900 font-bold">
                                                        ✓ 선택한 상태: {item.descriptions[(protocol[item.key as keyof ProtocolData] as number) - 1]}
                                                    </p>
                                                </div>
                                            )}
                                            {(item as any).note && (
                                                <p className="text-xs text-indigo-600 font-semibold italic mt-1.5">* {(item as any).note}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button onClick={onBack} className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all shadow-sm">Previous</button>
                    <button onClick={onNext} className="flex-[2] py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg hover:bg-blue-700 transition-all text-base md:text-lg">
                        {is10MinMode ? 'Next: 3단계 공부 효율성 정밀 검사 →' : 'Next: 학습 분석 (Analytics) →'}
                    </button>
                </div>
            </div>
        </Layout>
    );
};
