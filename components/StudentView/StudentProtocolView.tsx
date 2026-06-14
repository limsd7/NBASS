/**
 * StudentProtocolView
 * 학생 전용 창에서 표시되는 학습 프로토콜 & 분석 화면
 * - 학습 환경 프로토콜
 * - 학습 밀도 및 패턴 분석
 */

import React, { useState, useCallback } from 'react';
import { ProtocolBundle, AnalyticsBundle } from '../../services/syncService';

interface StudentProtocolViewProps {
    studentName: string;
    onComplete: (protocol: ProtocolBundle, analytics: AnalyticsBundle) => void;
    onBack?: () => void;
}

type ProtocolStep = 'protocol' | 'analytics' | 'complete';

// 학습 장소 옵션
const LOCATION_OPTIONS = ['자기 방', '독서실', '도서관', '학원', '카페', '학교', '기타'];

// 시간대 옵션
const TIME_OPTIONS = ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'];

export const StudentProtocolView: React.FC<StudentProtocolViewProps> = ({
    studentName,
    onComplete,
    onBack
}) => {
    const [currentStep, setCurrentStep] = useState<ProtocolStep>('protocol');

    // 프로토콜 데이터
    const [protocol, setProtocol] = useState<ProtocolBundle>({
        location: '자기 방',
        noiseLevel: 3,
        stressLevel: 5,
        avgSleep: 7,
        emotionalFactor: 3,
        motivationalFactor: 3,
        behavioralFactor: 3,
        taskDifficulty: 5,
        timeDistortion: 3
    });

    // 분석 데이터
    const [analytics, setAnalytics] = useState<AnalyticsBundle>({
        pureStudyRatio: 60,
        avgFocusDuration: 25,
        distractionCount: 5,
        goldenTimeStart: '09:00',
        goldenTimeEnd: '12:00',
        lowEfficiencyTime: '14:00-16:00',
        chronotype: 'neutral',
        weekdayWeekendGap: 20,
        subjectRatios: { korean: 20, math: 30, english: 25, science: 15, social: 5, other: 5 },
        goalAchievementRate: 70,
        perceivedDifficulty: 3,
        avgSleepHours: 7,
        sleepQuality: 3,
        preferredLocation: '자기 방',
        studyStreak: 14,
        breakAdequacy: 3,
        burnoutCycle: 21,
        energyPattern: 'stable'
    });

    // 진행률
    const steps: ProtocolStep[] = ['protocol', 'analytics'];
    const currentIndex = steps.indexOf(currentStep);
    const progress = ((currentIndex + 1) / steps.length) * 100;

    // 다음 단계
    const goToNext = useCallback(() => {
        if (currentStep === 'protocol') {
            setCurrentStep('analytics');
        } else if (currentStep === 'analytics') {
            onComplete(protocol, analytics);
            setCurrentStep('complete');
        }
    }, [currentStep, protocol, analytics, onComplete]);

    // 이전 단계
    const goToPrevious = useCallback(() => {
        if (currentStep === 'analytics') {
            setCurrentStep('protocol');
        } else if (onBack) {
            onBack();
        }
    }, [currentStep, onBack]);

    // 완료 화면
    if (currentStep === 'complete') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-8">
                <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-lg">
                    <div className="text-6xl mb-6">🎉</div>
                    <h2 className="text-3xl font-black text-emerald-800 mb-4">모든 응답 완료!</h2>
                    <p className="text-lg text-slate-600 mb-2">{studentName}님, 수고하셨습니다.</p>
                    <p className="text-slate-500">상담사가 결과를 분석 중입니다.</p>
                    <div className="mt-8 p-4 bg-emerald-50 rounded-xl">
                        <p className="text-sm text-emerald-700">분석이 완료되면 상담사가 안내해 드립니다.</p>
                    </div>
                </div>
            </div>
        );
    }

    // 슬라이더 컴포넌트
    const Slider = ({ label, value, onChange, min = 1, max = 10, labels }: {
        label: string;
        value: number;
        onChange: (v: number) => void;
        min?: number;
        max?: number;
        labels?: string[];
    }) => (
        <div className="p-4 bg-slate-50 rounded-xl">
            <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-slate-700">{label}</span>
                <span className="text-lg font-bold text-indigo-600">{value}</span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            {labels && (
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                    {labels.map((l, i) => <span key={i}>{l}</span>)}
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50">
            {/* 헤더 */}
            <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-black text-slate-800">📚 학습 환경 분석</h1>
                            <p className="text-sm text-slate-500">{studentName}님</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-slate-400">진행률</p>
                            <p className="text-lg font-bold text-teal-600">{Math.round(progress)}%</p>
                        </div>
                    </div>

                    <div className="mt-4 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </header>

            {/* 메인 컨텐츠 */}
            <main className="max-w-4xl mx-auto px-6 py-8">
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white p-6">
                        <h2 className="text-2xl font-black flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center p-1.5 shadow-sm">
                                <img
                                    src={currentStep === 'protocol' ? '/학습 집중력 분석 프로토콜 logo.jpg' : '/학습밀도 및 패턴 logo.JPG'}
                                    alt="Logo"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            {currentStep === 'protocol' ? '학습 집중력 분석 프로토콜' : '학습 밀도 및 패턴 분석 검사'}
                        </h2>
                        <p className="text-teal-100 mt-1 text-sm">
                            {currentStep === 'protocol'
                                ? '학습 환경과 상태에 대해 응답해 주세요.'
                                : '학습 패턴과 시간 활용을 평가해 주세요.'}
                        </p>
                    </div>

                    <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
                        {/* 프로토콜 입력 */}
                        {currentStep === 'protocol' && (
                            <>
                                <div className="p-4 bg-slate-50 rounded-xl">
                                    <label className="font-medium text-slate-700 block mb-2">주 학습 장소</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {LOCATION_OPTIONS.map((loc) => (
                                            <button
                                                key={loc}
                                                onClick={() => setProtocol(p => ({ ...p, location: loc }))}
                                                className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${protocol.location === loc
                                                    ? 'bg-teal-600 text-white shadow-lg'
                                                    : 'bg-white border border-slate-200 text-slate-600 hover:border-teal-300'
                                                    }`}
                                            >
                                                {loc}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <Slider
                                    label="학습 환경 소음 레벨"
                                    value={protocol.noiseLevel}
                                    onChange={(v) => setProtocol(p => ({ ...p, noiseLevel: v }))}
                                    labels={['조용함', '', '', '', '보통', '', '', '', '', '시끄러움']}
                                />

                                <Slider
                                    label="현재 느끼는 스트레스 수준"
                                    value={protocol.stressLevel}
                                    onChange={(v) => setProtocol(p => ({ ...p, stressLevel: v }))}
                                    labels={['낮음', '', '', '', '보통', '', '', '', '', '높음']}
                                />

                                <Slider
                                    label="평균 수면 시간 (시간)"
                                    value={protocol.avgSleep}
                                    onChange={(v) => setProtocol(p => ({ ...p, avgSleep: v }))}
                                    min={4}
                                    max={12}
                                    labels={['4시간', '', '', '', '8시간', '', '', '', '12시간']}
                                />

                                <Slider
                                    label="정서적 안정감"
                                    value={protocol.emotionalFactor}
                                    onChange={(v) => setProtocol(p => ({ ...p, emotionalFactor: v }))}
                                    min={1}
                                    max={5}
                                    labels={['불안정', '', '보통', '', '안정']}
                                />

                                <Slider
                                    label="학습 동기 수준"
                                    value={protocol.motivationalFactor}
                                    onChange={(v) => setProtocol(p => ({ ...p, motivationalFactor: v }))}
                                    min={1}
                                    max={5}
                                    labels={['낮음', '', '보통', '', '높음']}
                                />

                                <Slider
                                    label="체감 학습 난이도"
                                    value={protocol.taskDifficulty}
                                    onChange={(v) => setProtocol(p => ({ ...p, taskDifficulty: v }))}
                                    labels={['쉬움', '', '', '', '보통', '', '', '', '', '어려움']}
                                />
                            </>
                        )}

                        {/* 분석 입력 */}
                        {currentStep === 'analytics' && (
                            <>
                                <Slider
                                    label="순수 학습 시간 비율 (%)"
                                    value={analytics.pureStudyRatio}
                                    onChange={(v) => setAnalytics(a => ({ ...a, pureStudyRatio: v }))}
                                    min={10}
                                    max={100}
                                    labels={['10%', '', '', '', '', '55%', '', '', '', '100%']}
                                />

                                <Slider
                                    label="평균 집중 유지 시간 (분)"
                                    value={analytics.avgFocusDuration}
                                    onChange={(v) => setAnalytics(a => ({ ...a, avgFocusDuration: v }))}
                                    min={5}
                                    max={90}
                                    labels={['5분', '', '', '', '', '45분', '', '', '', '90분']}
                                />

                                <Slider
                                    label="산만도 (스마트폰 확인 횟수/시간)"
                                    value={analytics.distractionCount}
                                    onChange={(v) => setAnalytics(a => ({ ...a, distractionCount: v }))}
                                    min={0}
                                    max={20}
                                    labels={['0회', '', '', '', '', '10회', '', '', '', '20회']}
                                />

                                <div className="p-4 bg-slate-50 rounded-xl">
                                    <label className="font-medium text-slate-700 block mb-2">골든타임 (집중 최고 시간대)</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs text-slate-500">시작</label>
                                            <select
                                                value={analytics.goldenTimeStart}
                                                onChange={(e) => setAnalytics(a => ({ ...a, goldenTimeStart: e.target.value }))}
                                                className="w-full mt-1 p-2 border border-slate-200 rounded-lg"
                                            >
                                                {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-500">종료</label>
                                            <select
                                                value={analytics.goldenTimeEnd}
                                                onChange={(e) => setAnalytics(a => ({ ...a, goldenTimeEnd: e.target.value }))}
                                                className="w-full mt-1 p-2 border border-slate-200 rounded-lg"
                                            >
                                                {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-50 rounded-xl">
                                    <label className="font-medium text-slate-700 block mb-2">크로노타입 (생체리듬 유형)</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { value: 'morning', label: '🌅 아침형', desc: '일찍 일어나 오전에 집중' },
                                            { value: 'neutral', label: '⚖️ 중간형', desc: '일정한 패턴' },
                                            { value: 'evening', label: '🌙 저녁형', desc: '늦게 자고 오후에 집중' }
                                        ].map((opt) => (
                                            <button
                                                key={opt.value}
                                                onClick={() => setAnalytics(a => ({ ...a, chronotype: opt.value as any }))}
                                                className={`p-3 rounded-xl text-center transition-all ${analytics.chronotype === opt.value
                                                    ? 'bg-teal-600 text-white shadow-lg'
                                                    : 'bg-white border border-slate-200 text-slate-600 hover:border-teal-300'
                                                    }`}
                                            >
                                                <div className="text-lg">{opt.label}</div>
                                                <div className="text-xs mt-1 opacity-80">{opt.desc}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <Slider
                                    label="목표 달성률 (%)"
                                    value={analytics.goalAchievementRate}
                                    onChange={(v) => setAnalytics(a => ({ ...a, goalAchievementRate: v }))}
                                    min={0}
                                    max={100}
                                    labels={['0%', '', '', '', '', '50%', '', '', '', '100%']}
                                />

                                <div className="p-4 bg-slate-50 rounded-xl">
                                    <label className="font-medium text-slate-700 block mb-2">에너지 패턴</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { value: 'stable', label: '📈 안정적', color: 'emerald' },
                                            { value: 'fluctuating', label: '📊 변동적', color: 'amber' },
                                            { value: 'declining', label: '📉 하락 추세', color: 'red' }
                                        ].map((opt) => (
                                            <button
                                                key={opt.value}
                                                onClick={() => setAnalytics(a => ({ ...a, energyPattern: opt.value as any }))}
                                                className={`py-3 px-4 rounded-xl font-medium transition-all ${analytics.energyPattern === opt.value
                                                    ? `bg-${opt.color}-600 text-white shadow-lg`
                                                    : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                                                    }`}
                                                style={analytics.energyPattern === opt.value ? {
                                                    backgroundColor: opt.color === 'emerald' ? '#059669' : opt.color === 'amber' ? '#d97706' : '#dc2626'
                                                } : {}}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <Slider
                                    label="평균 수면 시간 (시간)"
                                    value={analytics.avgSleepHours}
                                    onChange={(v) => setAnalytics(a => ({ ...a, avgSleepHours: v }))}
                                    min={4}
                                    max={12}
                                    labels={['4시간', '', '', '', '8시간', '', '', '', '12시간']}
                                />
                            </>
                        )}
                    </div>

                    {/* 네비게이션 */}
                    <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between">
                        <button
                            onClick={goToPrevious}
                            className="px-6 py-3 rounded-xl font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all"
                        >
                            ← 이전
                        </button>
                        <button
                            onClick={goToNext}
                            className="px-8 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all"
                        >
                            {currentStep === 'analytics' ? '제출 완료 →' : '다음 →'}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default StudentProtocolView;
