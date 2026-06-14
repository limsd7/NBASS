/**
 * 작업 기억 용량 테스트 컴포넌트
 * - Digit Span (숫자 따라하기): 순방향/역방향
 * - N-Back: 1-Back, 2-Back 테스트
 * 
 * StudyEfficiencyAssessment.tsx와 동일한 UI/UX 패턴
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

    // Digit 표시 애니메이션
    useEffect(() => {
        if (dsTestPhase !== 'showing' || currentTest !== 'digitSpan') return;

        if (dsShowingIndex < dsCurrentSequence.length) {
            const timer = setTimeout(() => {
                setDsShowingIndex(prev => prev + 1);
            }, DIGIT_SPAN_CONFIG.displayTimeMs);
            return () => clearTimeout(timer);
        } else {
            // 모든 숫자 표시 완료 → 입력 단계
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

        // 결과 기록
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

        // 피드백 표시
        setDsFeedbackMessage({
            correct: isCorrect,
            message: isCorrect
                ? `✅ 정답! ${dsCurrentLength}자리 성공`
                : `❌ 오답. 정답: ${expectedSequence}`
        });
        setDsTestPhase('feedback');

        // 다음 단계 결정
        setTimeout(() => {
            if (isCorrect) {
                setDsConsecutiveFails(0);
                if (dsCurrentLength < DIGIT_SPAN_CONFIG.maxLength) {
                    setDsCurrentLength(prev => prev + 1);
                    startNewDigitSequence(dsCurrentLength + 1);
                } else {
                    // 최대 길이 도달 → 다음 페이즈
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
                    // 2회 연속 실패 → 다음 페이즈
                    if (dsPhase === 'forward') {
                        setDsPhase('backward');
                        setDsCurrentLength(DIGIT_SPAN_CONFIG.minLength);
                        setDsConsecutiveFails(0);
                        startNewDigitSequence(DIGIT_SPAN_CONFIG.minLength);
                    } else {
                        finishDigitSpan();
                    }
                } else {
                    // 재시도
                    startNewDigitSequence(dsCurrentLength);
                }
            }
        }, 1500);
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

    // N-Back 자극 표시
    useEffect(() => {
        if (nBackTestPhase !== 'showing' || !['nBack1', 'nBack2'].includes(currentTest || '')) return;

        if (nBackIndex >= nBackSequence.length) {
            // 시퀀스 완료
            finishNBack();
            return;
        }

        // 자극 표시
        setNBackShowCurrent(true);
        setNBackUserResponded(false);
        nBackRespondedRef.current = false;

        const config = NBACK_CONFIG[nBackLevel];
        const displayTimer = setTimeout(() => {
            setNBackShowCurrent(false);
        }, config.displayTimeMs);

        const nextTimer = setTimeout(() => {
            // 무응답 처리
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

    // ========== 완료 처리 ==========
    const handleFinish = () => {
        const overallResult = calculateOverallLevel(results as WorkingMemoryResult);
        onComplete({
            ...results,
            overallLevel: overallResult.level,
            overallScore: overallResult.score,
            completedAt: new Date().toISOString()
        } as WorkingMemoryResult);
    };

    // ========== 렌더링 ==========
    const renderSelectionScreen = () => (
        <div className="p-6 space-y-6">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                    🧩 작업 기억 용량 테스트
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                    머리(RAM)의 크기를 측정하여 최적 학습 전략을 제안합니다.
                </p>
                {careType && careType !== CareType.UNASSESSED && (
                    <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                        <p className="text-sm text-purple-700 dark:text-purple-300">
                            💡 <strong>{careType}</strong> 유형에게 권장되는 검사:{' '}
                            {recommendedTests.map((t, i) => (
                                <span key={t}>
                                    {WORKING_MEMORY_TEST_INFO[t]?.title.split(' ')[0]}
                                    {i < recommendedTests.length - 1 ? ', ' : ''}
                                </span>
                            ))}
                        </p>
                    </div>
                )}

                {/* 완료 버튼 */}
                <div className="mt-4">
                    <button
                        onClick={handleFinish}
                        className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${completedTests.size > 0
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 hover:shadow-xl animate-pulse'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                        disabled={completedTests.size === 0}
                    >
                        {completedTests.size > 0
                            ? `✅ ${completedTests.size}개 검사 완료! 다음 단계로 →`
                            : '검사를 시작해 주세요'}
                    </button>
                    {completedTests.size > 0 && (
                        <p className="text-xs text-gray-500 mt-2">
                            ({completedTests.size}/{Object.keys(WORKING_MEMORY_TEST_INFO).length} 검사 완료)
                        </p>
                    )}
                </div>
            </div>

            <div className="grid gap-4">
                {(Object.keys(WORKING_MEMORY_TEST_INFO) as WorkingMemoryTestType[]).map(type => {
                    const info = WORKING_MEMORY_TEST_INFO[type];
                    const isCompleted = completedTests.has(type);
                    const isRecommended = recommendedTests.includes(type);

                    return (
                        <div
                            key={type}
                            className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${isCompleted
                                ? 'border-green-400 bg-green-50 dark:bg-green-900/20'
                                : isRecommended
                                    ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/20 hover:shadow-lg'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:shadow-md'
                                }`}
                            onClick={() => {
                                if (isCompleted) return;
                                setCurrentTest(type);
                                if (type === 'digitSpan') startDigitSpan();
                                else if (type === 'nBack1') startNBack(1);
                                else if (type === 'nBack2') startNBack(2);
                            }}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">{info.icon}</span>
                                    <div>
                                        <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                                            {info.title}
                                            {isRecommended && !isCompleted && (
                                                <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full">추천</span>
                                            )}
                                            {isCompleted && (
                                                <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">완료</span>
                                            )}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{info.description}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs text-gray-400">{info.time}</span>
                                    <div className="text-xs text-gray-400 mt-1">
                                        난이도: <span className={info.difficulty === '어려움' ? 'text-red-500' : info.difficulty === '보통' ? 'text-orange-500' : 'text-green-500'}>{info.difficulty}</span>
                                    </div>
                                    {!isCompleted && (
                                        <div className="mt-1 text-purple-500">
                                            <span className="text-sm">시작 →</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 완료된 검사 결과 미리보기 */}
                            {isCompleted && renderResultPreview(type)}
                        </div>
                    );
                })}
            </div>

            <div className="flex flex-col gap-3 pt-4 border-t dark:border-gray-700">
                <div className="flex justify-between">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300"
                    >
                        ← 이전 단계
                    </button>
                    <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                        완료: {completedTests.size}/{Object.keys(WORKING_MEMORY_TEST_INFO).length} 검사
                    </div>
                </div>
                <button
                    onClick={handleFinish}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${completedTests.size > 0
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 hover:shadow-xl'
                        : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                        }`}
                >
                    {completedTests.size > 0
                        ? `✅ 검사 완료 - 다음 단계로 →`
                        : '⚠️ 최소 1개 이상의 검사를 완료해 주세요'}
                </button>
            </div>
        </div>
    );

    const renderResultPreview = (type: WorkingMemoryTestType) => {
        if (type === 'digitSpan' && results.digitSpan) {
            return (
                <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
                    <p className="text-sm font-medium text-green-700 dark:text-green-400">
                        순방향: {results.digitSpan.forwardSpan}자리 • 역방향: {results.digitSpan.backwardSpan}자리
                    </p>
                </div>
            );
        }
        if (type === 'nBack1' && results.nBack1) {
            return (
                <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
                    <p className="text-sm font-medium text-green-700 dark:text-green-400">
                        정확도: {results.nBack1.accuracy}%
                    </p>
                </div>
            );
        }
        if (type === 'nBack2' && results.nBack2) {
            return (
                <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
                    <p className="text-sm font-medium text-green-700 dark:text-green-400">
                        정확도: {results.nBack2.accuracy}%
                    </p>
                </div>
            );
        }
        return null;
    };

    // Digit Span 테스트 UI
    const renderDigitSpanTest = () => (
        <div className="p-6 space-y-6">
            <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                    🔢 숫자 따라하기 ({dsPhase === 'forward' ? '순방향' : '역방향'})
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {dsPhase === 'forward'
                        ? '보이는 숫자를 순서대로 입력하세요'
                        : '보이는 숫자를 거꾸로 입력하세요'}
                </p>
                <div className="mt-2 text-lg font-bold text-purple-600">
                    현재: {dsCurrentLength}자리
                </div>
            </div>

            {/* 숫자 표시 영역 */}
            <div className="flex justify-center items-center h-40 bg-gray-100 dark:bg-gray-800 rounded-2xl">
                {dsTestPhase === 'showing' && dsShowingIndex < dsCurrentSequence.length && (
                    <div className="text-8xl font-bold text-purple-600 animate-pulse">
                        {dsCurrentSequence[dsShowingIndex]}
                    </div>
                )}
                {dsTestPhase === 'showing' && dsShowingIndex >= dsCurrentSequence.length && (
                    <div className="text-2xl text-gray-400">준비 중...</div>
                )}
                {dsTestPhase === 'input' && (
                    <div className="text-center">
                        <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
                            {dsPhase === 'forward' ? '순서대로' : '거꾸로'} 입력하세요
                        </p>
                        <input
                            ref={inputRef}
                            type="text"
                            inputMode="numeric"
                            value={dsUserInput}
                            onChange={e => setDsUserInput(e.target.value.replace(/\D/g, ''))}
                            onKeyDown={e => e.key === 'Enter' && handleDigitSubmit()}
                            className="w-48 text-center text-3xl py-3 border-2 border-purple-400 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            placeholder="숫자 입력"
                            autoFocus
                        />
                        <button
                            onClick={handleDigitSubmit}
                            className="block mx-auto mt-4 px-8 py-2 bg-purple-500 text-white rounded-lg font-bold hover:bg-purple-600"
                        >
                            확인
                        </button>
                    </div>
                )}
                {dsTestPhase === 'feedback' && dsFeedbackMessage && (
                    <div className={`text-2xl font-bold ${dsFeedbackMessage.correct ? 'text-green-500' : 'text-red-500'}`}>
                        {dsFeedbackMessage.message}
                    </div>
                )}
            </div>

            {/* 진행 상황 */}
            <div className="flex justify-between text-sm text-gray-500">
                <span>페이즈: {dsPhase === 'forward' ? '1/2 (순방향)' : '2/2 (역방향)'}</span>
                <span>연속 실패: {dsConsecutiveFails}/{DIGIT_SPAN_CONFIG.triesPerLength}</span>
            </div>

            <button
                onClick={() => {
                    setCurrentTest(null);
                    setDsTestPhase('idle');
                }}
                className="w-full py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg"
            >
                ← 돌아가기
            </button>
        </div>
    );

    // N-Back 테스트 UI
    const renderNBackTest = () => (
        <div className="p-6 space-y-6">
            <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                    {nBackLevel === 1 ? '1️⃣' : '2️⃣'} {nBackLevel}-Back 테스트
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {nBackLevel}개 전 문자와 같으면 버튼을 누르세요!
                </p>
            </div>

            {/* 자극 표시 영역 */}
            <div className="flex justify-center items-center h-48 bg-gray-100 dark:bg-gray-800 rounded-2xl relative">
                {nBackShowCurrent && nBackIndex < nBackSequence.length && (
                    <div className="text-9xl font-bold text-indigo-600 animate-bounce">
                        {nBackSequence[nBackIndex].value}
                    </div>
                )}
                {!nBackShowCurrent && nBackIndex < nBackSequence.length && (
                    <div className="text-4xl text-gray-300">+</div>
                )}
                {nBackIndex >= nBackSequence.length && (
                    <div className="text-2xl text-green-500 font-bold">테스트 완료!</div>
                )}
            </div>

            {/* 응답 버튼 */}
            <button
                onClick={handleNBackResponse}
                disabled={!nBackShowCurrent || nBackUserResponded || nBackIndex >= nBackSequence.length}
                className={`w-full py-6 rounded-xl font-bold text-2xl transition-all duration-200 ${
                    nBackUserResponded
                        ? 'bg-green-500 text-white scale-[0.98] shadow-inner'
                        : !nBackShowCurrent
                            ? 'bg-gray-200 text-gray-400'
                            : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-lg active:scale-95'
                }`}
            >
                {nBackUserResponded ? '✅ 선택 완료' : '🎯 같음!'}
            </button>

            {/* 진행 상황 */}
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                    className="bg-indigo-500 h-2 rounded-full transition-all"
                    style={{ width: `${(nBackIndex / nBackSequence.length) * 100}%` }}
                />
            </div>
            <p className="text-center text-sm text-gray-500">
                {nBackIndex} / {nBackSequence.length}
            </p>

            <button
                onClick={() => {
                    setCurrentTest(null);
                    setNBackTestPhase('idle');
                }}
                className="w-full py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg"
            >
                ← 돌아가기 (결과 저장 안됨)
            </button>
        </div>
    );

    // 메인 렌더링
    if (isInline) {
        return (
            <div className="bg-white dark:bg-gray-900 rounded-2xl w-full">
                {currentTest === null && renderSelectionScreen()}
                {currentTest === 'digitSpan' && renderDigitSpanTest()}
                {(currentTest === 'nBack1' || currentTest === 'nBack2') && renderNBackTest()}
            </div>
        );
    }

    // 모달 모드
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                {currentTest === null && renderSelectionScreen()}
                {currentTest === 'digitSpan' && renderDigitSpanTest()}
                {(currentTest === 'nBack1' || currentTest === 'nBack2') && renderNBackTest()}
            </div>
        </div>
    );
};

export default WorkingMemoryAssessment;
