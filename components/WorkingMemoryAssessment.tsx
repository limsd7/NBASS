/**
 * 작업 기억 용량 테스트 컴포넌트 (WorkingMemoryAssessment)
 * - Digit Span (숫자 따라하기): 순방향/역방향
 * - N-Back: 1-Back, 2-Back 테스트
 * 
 * 디자인 시스템 토큰 및 다크모드 완벽 대응, 뉴로 피드백 UI 적용
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    DIGIT_SPAN_CONFIG,
    NBACK_CONFIG,
    generateDigitSequence,
    generateNBackSequence,
    calculateDigitSpanResult,
    calculateNBackResult,
    calculateOverallLevel,
    WORKING_MEMORY_DESCRIPTIONS,
    WORKING_MEMORY_TEST_INFO,
    CARETYPE_WORKING_MEMORY_RECOMMENDATIONS,
    WorkingMemoryResult,
    WorkingMemoryTestType,
    DigitSpanResult,
    NBackResult,
    NBackItem
} from '../data/workingMemoryAssessments';
import { CareType } from '../types';

interface WorkingMemoryAssessmentProps {
    careType?: CareType;
    isPortableMode?: boolean;
    isInline?: boolean;
    onComplete: (results: WorkingMemoryResult) => void;
    onClose?: () => void;
}

type DigitSpanPhase = 'forward' | 'backward';
type TestPhase = 'idle' | 'showing' | 'input' | 'feedback' | 'complete';

export const WorkingMemoryAssessment: React.FC<WorkingMemoryAssessmentProps> = ({
    careType,
    isPortableMode = false,
    isInline = false,
    onComplete,
    onClose
}) => {
    const [currentTest, setCurrentTest] = useState<WorkingMemoryTestType | null>(null);
    const [completedTests, setCompletedTests] = useState<Set<WorkingMemoryTestType>>(new Set());
    const [results, setResults] = useState<Partial<WorkingMemoryResult>>({});

    // Digit Span State
    const [dsPhase, setDsPhase] = useState<DigitSpanPhase>('forward');
    const [dsTestPhase, setDsTestPhase] = useState<TestPhase>('idle');
    const [dsCurrentLength, setDsCurrentLength] = useState(DIGIT_SPAN_CONFIG.minLength);
    const [dsCurrentSequence, setDsCurrentSequence] = useState<number[]>([]);
    const [dsUserInput, setDsUserInput] = useState<string>('');
    const [dsShowingIndex, setDsShowingIndex] = useState(0);
    const [dsForwardTrials, setDsForwardTrials] = useState<boolean[][]>([]);
    const [dsBackwardTrials, setDsBackwardTrials] = useState<boolean[][]>([]);
    const [dsConsecutiveFails, setDsConsecutiveFails] = useState(0);
    const [dsFeedbackMessage, setDsFeedbackMessage] = useState<{ correct: boolean; message: string } | null>(null);

    // N-Back State
    const [nBackLevel, setNBackLevel] = useState<1 | 2>(1);
    const [nBackSequence, setNBackSequence] = useState<NBackItem[]>([]);
    const [nBackIndex, setNBackIndex] = useState(0);
    const [nBackResponses, setNBackResponses] = useState<{ isTarget: boolean; userResponse: boolean }[]>([]);
    const [nBackTestPhase, setNBackTestPhase] = useState<TestPhase>('idle');
    const [nBackShowCurrent, setNBackShowCurrent] = useState(false);
    const [nBackUserResponded, setNBackUserResponded] = useState(false);

    // Simulation State
    const [simulationType, setSimulationType] = useState<WorkingMemoryTestType | null>(null);
    const [simulationStep, setSimulationStep] = useState(0);

    const inputRef = useRef<HTMLInputElement>(null);

    // 권장 테스트 목록
    const recommendedTests = careType && careType !== CareType.UNASSESSED
        ? CARETYPE_WORKING_MEMORY_RECOMMENDATIONS[careType]?.priority || ['digitSpan']
        : ['digitSpan', 'nBack1'];

    // ========== Digit Span Logic ==========
    const startDigitSpan = useCallback(() => {
        setDsPhase('forward');
        setDsCurrentLength(DIGIT_SPAN_CONFIG.minLength);
        setDsForwardTrials([]);
        setDsBackwardTrials([]);
        setDsConsecutiveFails(0);
        startNewDigitSequence(DIGIT_SPAN_CONFIG.minLength);
    }, []);

    const startNewDigitSequence = (length: number) => {
        const sequence = generateDigitSequence(length);
        setDsCurrentSequence(sequence);
        setDsUserInput('');
        setDsShowingIndex(0);
        setDsTestPhase('showing');
        setDsFeedbackMessage(null);
    };

    useEffect(() => {
        if (dsTestPhase !== 'showing' || currentTest !== 'digitSpan') return;

        if (dsShowingIndex < dsCurrentSequence.length) {
            const timer = setTimeout(() => {
                setDsShowingIndex(prev => prev + 1);
            }, DIGIT_SPAN_CONFIG.displayTimeMs);
            return () => clearTimeout(timer);
        } else {
            const timer = setTimeout(() => {
                setDsTestPhase('input');
                setTimeout(() => inputRef.current?.focus(), 100);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [dsTestPhase, dsShowingIndex, dsCurrentSequence, currentTest]);

    const handleDigitSubmit = () => {
        const expectedSequence = dsPhase === 'forward'
            ? dsCurrentSequence.join('')
            : dsCurrentSequence.slice().reverse().join('');

        const isCorrect = dsUserInput === expectedSequence;

        const lengthIndex = dsCurrentLength - DIGIT_SPAN_CONFIG.minLength;
        if (dsPhase === 'forward') {
            setDsForwardTrials(prev => {
                const newTrials = [...prev];
                if (!newTrials[lengthIndex]) newTrials[lengthIndex] = [];
                newTrials[lengthIndex] = [...(newTrials[lengthIndex] || []), isCorrect];
                return newTrials;
            });
        } else {
            setDsBackwardTrials(prev => {
                const newTrials = [...prev];
                if (!newTrials[lengthIndex]) newTrials[lengthIndex] = [];
                newTrials[lengthIndex] = [...(newTrials[lengthIndex] || []), isCorrect];
                return newTrials;
            });
        }

        setDsFeedbackMessage({
            correct: isCorrect,
            message: isCorrect
                ? `정답! ${dsCurrentLength}자리 성공`
                : `오답. 정답: ${expectedSequence}`
        });
        setDsTestPhase('feedback');

        setTimeout(() => {
            if (isCorrect) {
                setDsConsecutiveFails(0);
                if (dsCurrentLength < DIGIT_SPAN_CONFIG.maxLength) {
                    setDsCurrentLength(prev => prev + 1);
                    startNewDigitSequence(dsCurrentLength + 1);
                } else {
                    if (dsPhase === 'forward') {
                        setDsPhase('backward');
                        setDsCurrentLength(DIGIT_SPAN_CONFIG.minLength);
                        setDsConsecutiveFails(0);
                        startNewDigitSequence(DIGIT_SPAN_CONFIG.minLength);
                    } else {
                        finishDigitSpan();
                    }
                }
            } else {
                const newFails = dsConsecutiveFails + 1;
                setDsConsecutiveFails(newFails);

                if (newFails >= DIGIT_SPAN_CONFIG.triesPerLength) {
                    if (dsPhase === 'forward') {
                        setDsPhase('backward');
                        setDsCurrentLength(DIGIT_SPAN_CONFIG.minLength);
                        setDsConsecutiveFails(0);
                        startNewDigitSequence(DIGIT_SPAN_CONFIG.minLength);
                    } else {
                        finishDigitSpan();
                    }
                } else {
                    startNewDigitSequence(dsCurrentLength);
                }
            }
        }, 1400);
    };

    const finishDigitSpan = () => {
        const result = calculateDigitSpanResult(dsForwardTrials, dsBackwardTrials);
        setResults(prev => ({ ...prev, digitSpan: result }));
        setCompletedTests(prev => new Set([...prev, 'digitSpan']));
        setCurrentTest(null);
        setDsTestPhase('idle');
    };

    // ========== N-Back Logic ==========
    const nBackRespondedRef = useRef(false);

    const startNBack = (level: 1 | 2) => {
        setNBackLevel(level);
        const sequence = generateNBackSequence(level);
        setNBackSequence(sequence);
        setNBackIndex(0);
        setNBackResponses([]);
        setNBackTestPhase('showing');
        setNBackShowCurrent(false);
        setNBackUserResponded(false);
        nBackRespondedRef.current = false;
    };

    useEffect(() => {
        if (nBackTestPhase !== 'showing' || !['nBack1', 'nBack2'].includes(currentTest || '')) return;

        if (nBackIndex >= nBackSequence.length) {
            finishNBack();
            return;
        }

        setNBackShowCurrent(true);
        setNBackUserResponded(false);
        nBackRespondedRef.current = false;

        const config = NBACK_CONFIG[nBackLevel];
        const displayTimer = setTimeout(() => {
            setNBackShowCurrent(false);
        }, config.displayTimeMs);

        const nextTimer = setTimeout(() => {
            if (!nBackRespondedRef.current) {
                setNBackResponses(prev => [...prev, {
                    isTarget: nBackSequence[nBackIndex].isTarget,
                    userResponse: false
                }]);
            }
            setNBackIndex(prev => prev + 1);
        }, config.displayTimeMs + config.interStimulusMs);

        return () => {
            clearTimeout(displayTimer);
            clearTimeout(nextTimer);
        };
    }, [nBackTestPhase, nBackIndex, nBackSequence, currentTest, nBackLevel]);

    const handleNBackResponse = () => {
        if (nBackRespondedRef.current || nBackIndex >= nBackSequence.length) return;

        setNBackUserResponded(true);
        nBackRespondedRef.current = true;

        setNBackResponses(prev => [...prev, {
            isTarget: nBackSequence[nBackIndex].isTarget,
            userResponse: true
        }]);
    };

    const finishNBack = () => {
        const result = calculateNBackResult(nBackLevel, nBackResponses);

        if (nBackLevel === 1) {
            setResults(prev => ({ ...prev, nBack1: result }));
            setCompletedTests(prev => new Set([...prev, 'nBack1']));
        } else {
            setResults(prev => ({ ...prev, nBack2: result }));
            setCompletedTests(prev => new Set([...prev, 'nBack2']));
        }

        setCurrentTest(null);
        setNBackTestPhase('idle');
    };

    const handleFinish = () => {
        const overallResult = calculateOverallLevel(results as WorkingMemoryResult);
        onComplete({
            ...results,
            overallLevel: overallResult.level,
            overallScore: overallResult.score,
            completedAt: new Date().toISOString()
        } as WorkingMemoryResult);
    };

    // ========== Simulation Modal ==========
    const renderSimulationModal = () => {
        if (!simulationType) return null;

        const demoData: Record<WorkingMemoryTestType, { title: string; steps: { num: number; stimulus: string; desc: string; action: string; badge: string }[] }> = {
            nBack1: {
                title: '1-Back 테스트 시뮬레이션',
                steps: [
                    { num: 1, stimulus: 'A', desc: '첫 번째 글자입니다. (기억해 둡니다)', action: '직전 글자가 없으므로 [대기]', badge: '대기 단계' },
                    { num: 2, stimulus: 'A', desc: '두 번째 글자입니다. 직전 글자(A)와 같습니다!', action: '[같음!] 버튼 클릭!', badge: '정답 (클릭)' },
                    { num: 3, stimulus: 'C', desc: '세 번째 글자입니다. 직전 글자(A)와 다릅니다.', action: '버튼을 누르지 않고 대기', badge: '정답 (통과)' }
                ]
            },
            nBack2: {
                title: '2-Back 테스트 시뮬레이션',
                steps: [
                    { num: 1, stimulus: 'B', desc: '첫 번째 문자입니다.', action: '2개 전 글자가 없으므로 [대기]', badge: '대기 단계' },
                    { num: 2, stimulus: 'D', desc: '두 번째 문자입니다.', action: '2개 전 글자가 없으므로 [대기]', badge: '대기 단계' },
                    { num: 3, stimulus: 'B', desc: '세 번째 문자입니다. 2개 전 문자(1번째 B)와 일치합니다!', action: '[같음!] 버튼 클릭!', badge: '정답 (클릭)' }
                ]
            },
            digitSpan: {
                title: '숫자 따라하기 (Digit Span) 시뮬레이션',
                steps: [
                    { num: 1, stimulus: '4 → 8 → 2', desc: '숫자가 1초 간격으로 한 자리씩 깜빡입니다.', action: '화면의 숫자를 기억합니다.', badge: '기억 단계' },
                    { num: 2, stimulus: '입력: 4 8 2', desc: '순방향인 경우 순서대로 입력합니다.', action: '키보드로 "482" 입력 후 [확인]', badge: '순방향' },
                    { num: 3, stimulus: '입력: 2 8 4', desc: '역방향인 경우 뒤에서부터 역순으로 입력합니다.', action: '키보드로 "284" 입력 후 [확인]', badge: '역방향' }
                ]
            }
        };

        const currentDemo = demoData[simulationType];
        const stepInfo = currentDemo.steps[simulationStep];

        return (
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-md animate-in fade-in">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6">
                    <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /></svg>
                            </div>
                            <div>
                                <h3 className="text-base font-black text-slate-900 dark:text-white">{currentDemo.title}</h3>
                                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">예시 {simulationStep + 1} / 3</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setSimulationType(null)}
                            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 text-center space-y-4">
                        <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">화면 표시 시뮬레이션</div>
                        <div className="h-28 flex items-center justify-center bg-white dark:bg-slate-900 rounded-2xl shadow-inner border border-slate-200 dark:border-slate-700">
                            <span className="text-4xl md:text-5xl font-black text-indigo-600 dark:text-indigo-400 tracking-wider">
                                {stepInfo.stimulus}
                            </span>
                        </div>
                        <div className="space-y-1.5 text-left bg-indigo-50 dark:bg-indigo-950/40 p-4 rounded-xl border border-indigo-200 dark:border-indigo-800/60">
                            <p className="text-xs font-bold text-indigo-900 dark:text-indigo-300">설명: {stepInfo.desc}</p>
                            <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">행동: {stepInfo.action}</p>
                        </div>
                    </div>

                    <div className="flex justify-between items-center gap-3">
                        {simulationStep < 2 ? (
                            <button
                                onClick={() => setSimulationStep(prev => prev + 1)}
                                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                            >
                                다음 예시 ({simulationStep + 2}/3) →
                            </button>
                        ) : (
                            <button
                                onClick={() => {
                                    const t = simulationType;
                                    setSimulationType(null);
                                    setCurrentTest(t);
                                    if (t === 'digitSpan') startDigitSpan();
                                    else if (t === 'nBack1') startNBack(1);
                                    else if (t === 'nBack2') startNBack(2);
                                }}
                                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                            >
                                이해 완료! 검사 시작하기 →
                            </button>
                        )}
                        <button
                            onClick={() => {
                                const t = simulationType;
                                setSimulationType(null);
                                setCurrentTest(t);
                                if (t === 'digitSpan') startDigitSpan();
                                else if (t === 'nBack1') startNBack(1);
                                else if (t === 'nBack2') startNBack(2);
                            }}
                            className="px-3.5 py-3 text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 text-xs font-bold"
                        >
                            건너뛰기
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderResultPreview = (type: WorkingMemoryTestType) => {
        if (type === 'digitSpan' && results.digitSpan) {
            return (
                <div className="mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-800/60">
                    <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        순방향: {results.digitSpan.forwardSpan}자리 • 역방향: {results.digitSpan.backwardSpan}자리
                    </p>
                </div>
            );
        }
        if (type === 'nBack1' && results.nBack1) {
            return (
                <div className="mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-800/60">
                    <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        1-Back 정확도: {results.nBack1.accuracy}%
                    </p>
                </div>
            );
        }
        if (type === 'nBack2' && results.nBack2) {
            return (
                <div className="mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-800/60">
                    <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        2-Back 정확도: {results.nBack2.accuracy}%
                    </p>
                </div>
            );
        }
        return null;
    };

    const renderSelectionScreen = () => (
        <div className="p-6 md:p-8 space-y-6 relative">
            {renderSimulationModal()}

            <div className="text-center mb-6 max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 font-bold text-xs mb-3">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    <span>Cognitive Capacity Assessment</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                    작업 기억 용량 검사 (Working Memory)
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    전두엽의 정보 처리 용량(RAM)을 정밀 측정하여 최적의 시험 시간 분배 및 복합 사고 전략을 도출합니다.
                </p>

                {/* 권장 가이드 카드 */}
                <div className="mt-4 p-4 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 rounded-2xl text-left space-y-1.5 shadow-sm">
                    <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-300 font-black text-xs">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span>검사 가이드라인</span>
                    </div>
                    <p className="text-xs text-indigo-950 dark:text-indigo-200 font-medium leading-relaxed">
                        <b>1-Back</b>과 <b>2-Back</b> 검사를 진행하시는 것을 권장하며, 1개 이상 완료 시 다음 단계로 진행하실 수 있습니다. 실수하셨다면 언제든 [재도전] 가능합니다.
                    </p>
                </div>

                {/* 다음 단계 진행 버튼 */}
                <div className="mt-5">
                    <button
                        onClick={handleFinish}
                        className={`w-full py-3.5 rounded-2xl font-black text-sm md:text-base transition-all shadow-md ${completedTests.size > 0
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 shadow-emerald-200 dark:shadow-none'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                            }`}
                        disabled={completedTests.size === 0}
                    >
                        {completedTests.size > 0
                            ? `${completedTests.size}개 검사 완료 • 다음 단계로 진행 →`
                            : '아래 검사 항목 중 하나를 선택해 주세요'}
                    </button>
                </div>
            </div>

            <div className="grid gap-3.5 max-w-2xl mx-auto">
                {(Object.keys(WORKING_MEMORY_TEST_INFO) as WorkingMemoryTestType[]).map(type => {
                    const info = WORKING_MEMORY_TEST_INFO[type];
                    const isCompleted = completedTests.has(type);
                    const isRecommended = recommendedTests.includes(type);

                    return (
                        <div
                            key={type}
                            className={`p-5 rounded-2xl border transition-all ${isCompleted
                                ? 'border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/50 dark:bg-emerald-950/20'
                                : isRecommended
                                    ? 'border-indigo-300 dark:border-indigo-800/80 bg-indigo-50/30 dark:bg-indigo-950/20 hover:shadow-md'
                                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                                }`}
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-start gap-3.5">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold shrink-0">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>
                                    </div>
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <h3 className="font-black text-sm md:text-base text-slate-900 dark:text-white">
                                                {info.title}
                                            </h3>
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                                                {info.badge || info.difficulty}
                                            </span>
                                            {isCompleted && (
                                                <span className="text-[10px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-md">완료됨</span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{info.description}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSimulationType(type);
                                            setSimulationStep(0);
                                        }}
                                        className="px-3 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold shadow-sm transition-all"
                                    >
                                        3문제 시뮬레이션
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setCurrentTest(type);
                                            if (type === 'digitSpan') startDigitSpan();
                                            else if (type === 'nBack1') startNBack(1);
                                            else if (type === 'nBack2') startNBack(2);
                                        }}
                                        className={`px-3.5 py-2 text-white font-bold rounded-xl text-xs shadow-sm transition-all ${isCompleted
                                            ? 'bg-slate-700 hover:bg-slate-800'
                                            : 'bg-indigo-600 hover:bg-indigo-700'
                                            }`}
                                    >
                                        {isCompleted ? '재도전' : '검사 시작'}
                                    </button>
                                </div>
                            </div>

                            {isCompleted && renderResultPreview(type)}
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-800 max-w-2xl mx-auto">
                <button
                    onClick={onClose}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 font-bold text-xs transition-colors"
                >
                    ← 이전 단계
                </button>
                <div className="text-xs text-slate-500 font-semibold">
                    완료 항목: {completedTests.size}/{Object.keys(WORKING_MEMORY_TEST_INFO).length}
                </div>
            </div>
        </div>
    );

    // Digit Span 테스트 UI
    const renderDigitSpanTest = () => (
        <div className="p-6 md:p-8 space-y-6 max-w-lg mx-auto">
            <div className="text-center mb-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 font-bold text-xs mb-2">
                    <span>Digit Span Test</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    숫자 기억 검사 ({dsPhase === 'forward' ? '순방향' : '역방향'})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {dsPhase === 'forward'
                        ? '화면에 표시된 숫자를 처음 순서대로 입력하세요'
                        : '화면에 표시된 숫자를 거꾸로 역순으로 입력하세요'}
                </p>
                <div className="mt-3 font-mono font-black text-indigo-600 dark:text-indigo-400 text-sm">
                    현재 길이: {dsCurrentLength}자리
                </div>
            </div>

            <div className="flex justify-center items-center h-44 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-inner">
                {dsTestPhase === 'showing' && dsShowingIndex < dsCurrentSequence.length && (
                    <div className="text-7xl md:text-8xl font-black text-indigo-600 dark:text-indigo-400 animate-pulse">
                        {dsCurrentSequence[dsShowingIndex]}
                    </div>
                )}
                {dsTestPhase === 'showing' && dsShowingIndex >= dsCurrentSequence.length && (
                    <div className="text-sm font-bold text-slate-400">준비 중...</div>
                )}
                {dsTestPhase === 'input' && (
                    <div className="text-center w-full px-6">
                        <p className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-3">
                            {dsPhase === 'forward' ? '순서대로' : '거꾸로(역순)'} 입력 후 엔터를 누르세요
                        </p>
                        <input
                            ref={inputRef}
                            type="text"
                            inputMode="numeric"
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="off"
                            spellCheck={false}
                            value={dsUserInput}
                            onChange={e => setDsUserInput(e.target.value.replace(/\D/g, '').slice(0, 12))}
                            onKeyDown={e => e.key === 'Enter' && handleDigitSubmit()}
                            className="w-48 text-center font-mono font-bold py-3 bg-white dark:bg-slate-900 border-2 border-indigo-500 rounded-xl focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-950 focus:outline-none touch-manipulation"
                            style={{ fontSize: '18px' }}
                            placeholder="숫자 입력"
                            autoFocus
                        />
                        <button
                            onPointerDown={(e) => { e.preventDefault(); handleDigitSubmit(); }}
                            className="block mx-auto mt-3 px-6 min-h-[44px] min-w-[88px] py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 active:scale-95 shadow-sm touch-manipulation select-none"
                        >
                            확인
                        </button>
                    </div>
                )}
                {dsTestPhase === 'feedback' && dsFeedbackMessage && (
                    <div className={`text-base font-black ${dsFeedbackMessage.correct ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {dsFeedbackMessage.message}
                    </div>
                )}
            </div>

            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
                <span>페이즈: {dsPhase === 'forward' ? '1/2 (순방향)' : '2/2 (역방향)'}</span>
                <span>오답 카운트: {dsConsecutiveFails}/{DIGIT_SPAN_CONFIG.triesPerLength}</span>
            </div>

            <button
                onClick={() => {
                    setCurrentTest(null);
                    setDsTestPhase('idle');
                }}
                className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-200"
            >
                ← 검사 목록으로
            </button>
        </div>
    );

    // N-Back 테스트 UI
    const renderNBackTest = () => (
        <div className="p-6 md:p-8 space-y-6 max-w-lg mx-auto">
            <div className="text-center mb-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 font-bold text-xs mb-2">
                    <span>N-Back Protocol</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    {nBackLevel}-Back 실시간 인지 검사
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    지금 나오는 글자가 <span className="font-bold text-indigo-600 dark:text-indigo-400">{nBackLevel}개 전</span> 문자와 일치하면 버튼을 누르세요.
                </p>
            </div>

            <div className="flex justify-center items-center h-48 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl relative shadow-inner">
                {nBackShowCurrent && nBackIndex < nBackSequence.length && (
                    <div className="text-8xl font-black text-indigo-600 dark:text-indigo-400 scale-100 animate-in zoom-in-50 duration-150">
                        {nBackSequence[nBackIndex].value}
                    </div>
                )}
                {!nBackShowCurrent && nBackIndex < nBackSequence.length && (
                    <div className="text-4xl text-slate-300 dark:text-slate-600">+</div>
                )}
                {nBackIndex >= nBackSequence.length && (
                    <div className="text-lg text-emerald-500 font-black">검사 완료!</div>
                )}
            </div>

            <button
                onPointerDown={(e) => { e.preventDefault(); handleNBackResponse(); }}
                disabled={!nBackShowCurrent || nBackUserResponded || nBackIndex >= nBackSequence.length}
                className={`w-full py-4 min-h-[56px] rounded-2xl font-black text-lg transition-all duration-150 touch-none select-none [-webkit-tap-highlight-color:transparent] ${nBackUserResponded
                    ? 'bg-emerald-600 text-white shadow-inner scale-[0.98]'
                    : !nBackShowCurrent
                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                        : 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-700 hover:to-blue-700 shadow-lg shadow-indigo-200 dark:shadow-none active:scale-95'
                    }`}
            >
                {nBackUserResponded ? '선택 완료' : '일치! (Target)'}
            </button>

            <div className="space-y-2">
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                        className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${(nBackIndex / Math.max(1, nBackSequence.length)) * 100}%` }}
                    />
                </div>
                <p className="text-center text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                    진행: {nBackIndex} / {nBackSequence.length}
                </p>
            </div>

            <button
                onClick={() => {
                    setCurrentTest(null);
                    setNBackTestPhase('idle');
                }}
                className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-200"
            >
                ← 검사 중단 및 목록으로
            </button>
        </div>
    );

    if (isInline) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-3xl w-full border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                {currentTest === null && renderSelectionScreen()}
                {currentTest === 'digitSpan' && renderDigitSpanTest()}
                {(currentTest === 'nBack1' || currentTest === 'nBack2') && renderNBackTest()}
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800">
                {currentTest === null && renderSelectionScreen()}
                {currentTest === 'digitSpan' && renderDigitSpanTest()}
                {(currentTest === 'nBack1' || currentTest === 'nBack2') && renderNBackTest()}
            </div>
        </div>
    );
};

export default WorkingMemoryAssessment;
