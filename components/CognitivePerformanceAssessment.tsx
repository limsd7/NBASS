/**
 * 인지 성능 테스트 통합 컴포넌트 (Cognitive Performance Assessment)
 * 
 * 학생의 주관이 개입할 수 없는 반응형 테스트들:
 * 1. 작업 기억 용량 테스트 (Working Memory) - Digit Span, N-Back
 * 2. 도파민 보상 지연 테스트 (Delay Discounting)
 * 3. 문해력/처리 속도 테스트 (Processing Speed & Literacy)
 * 
 * StudyEfficiencyAssessment와 동일한 UI/UX 패턴으로 구현
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CareType } from '../types';
import { now as highResNow, calibratedReactionMs, haptic } from '../utils/mobileTestUtils';

// Working Memory imports
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
    NBackItem
} from '../data/workingMemoryAssessments';

// Delay Discounting imports
import {
    DELAY_DISCOUNTING_SCENARIOS,
    DELAY_DISCOUNTING_CONFIG,
    calculateDelayDiscountingResult,
    IMPULSIVITY_DESCRIPTIONS,
    CARETYPE_DELAY_RECOMMENDATIONS,
    DelayDiscountingResult,
    DelayChoice
} from '../data/delayDiscountingAssessments';

// Processing Speed imports
import {
    READING_PASSAGES,
    PROCESSING_SPEED_CONFIG,
    calculateProcessingSpeedResult,
    calculateOverallProcessingSpeed,
    PROCESSING_SPEED_DESCRIPTIONS,
    ProcessingSpeedResult,
    ProcessingSpeedOverallResult,
    ReadingPassage
} from '../data/processingSpeedAssessments';

// Resilience imports
import {
    RESILIENCE_PROBLEMS,
    RESILIENCE_CONFIG,
    calculateResilienceResult,
    RESILIENCE_DESCRIPTIONS,
    ResilienceTrialResult,
    ResilienceOverallResult,
    ResilienceProblem
} from '../data/resilienceAssessments';

// Reaction Time imports
import {
    REACTION_TIME_CONFIG,
    getReactionTimeLevel,
    REACTION_TIME_DESCRIPTIONS,
    ReactionTimeResult
} from '../data/reactionTimeAssessments';

// Attention imports
import {
    ATTENTION_TEST_CONFIG,
    getAttentionLevel,
    ATTENTION_DESCRIPTIONS,
    AttentionResult
} from '../data/attentionAssessments';

// ========== 결과 타입 ==========
export interface CognitivePerformanceResults {
    workingMemory?: WorkingMemoryResult;
    delayDiscounting?: DelayDiscountingResult;
    processingSpeed?: ProcessingSpeedOverallResult;
    resilience?: ResilienceOverallResult;
    reaction?: ReactionTimeResult;
    attention?: AttentionResult;
    completedAt: string;
}
type CognitiveTestType = 'workingMemory' | 'delayDiscounting' | 'processingSpeed' | 'resilience' | 'reactionTime' | 'attention';

const COGNITIVE_TEST_INFO: Record<CognitiveTestType, {
    title: string;
    description: string;
    icon: string;
    time: string;
    subTests: string[];
}> = {
    workingMemory: {
        title: '작업기억력 테스트 (Working Memory)',
        description: '정보를 일시적으로 유지하고 조작하는 단기 뇌 용량을 측정합니다.',
        icon: '🧠',
        time: '약 3-5분',
        subTests: ['숫자 기억 (Digit Span)', 'N-Back 테스트']
    },
    delayDiscounting: {
        title: '도파민 보상 지연 테스트',
        description: '생물학적 인내심을 측정합니다. 즉각 보상 vs 지연 보상 선호도를 분석합니다.',
        icon: '🎯',
        time: '약 3-5분',
        subTests: ['밸런스 게임 (12가지 시나리오)']
    },
    processingSpeed: {
        title: '문해력/처리 속도 테스트',
        description: '정보 습득의 "엔진 출력"을 확인합니다. 읽기 속도와 이해력을 측정합니다.',
        icon: '📚',
        time: '약 5-7분',
        subTests: ['제한 시간 읽기', 'O/X 이해도 체크']
    },
    resilience: {
        title: '회복 탄력성 지수 (Grit)',
        description: '"틀려도 멘탈이 안 나가는" 능력을 측정합니다. 좌절 후 회복 속도를 시뮬레이션합니다.',
        icon: '💪',
        time: '약 5-8분',
        subTests: ['도전 문제', '불가능 문제 (포기 측정)', '회복 문제']
    },
    reactionTime: {
        title: '반응 속도 테스트',
        description: '뇌의 기본 정보 처리 속도를 측정합니다. 각성도와 신경 효율성을 확인합니다.',
        icon: '⚡',
        time: '약 1분',
        subTests: ['신호 반응 속도 (5회)']
    },
    attention: {
        title: '주의력 및 억제력 (Go/No-Go)',
        description: '충동 조절 능력과 선택적 주의력을 측정합니다.',
        icon: '🛑',
        time: '약 2분',
        subTests: ['선택적 반응 테스트']
    }
};

interface CognitivePerformanceAssessmentProps {
    careType?: CareType;
    isPortableMode?: boolean;
    isInline?: boolean;
    initialData?: Partial<CognitivePerformanceResults> | null;
    onProgress?: (results: Partial<CognitivePerformanceResults>) => void;
    onComplete: (results: CognitivePerformanceResults) => void;
    onClose?: () => void;
}

type TestPhase = 'idle' | 'showing' | 'input' | 'feedback' | 'complete';

export const CognitivePerformanceAssessment: React.FC<CognitivePerformanceAssessmentProps> = ({
    careType,
    isPortableMode = false,
    isInline = false,
    initialData,
    onProgress,
    onComplete,
    onClose
}) => {
    // 테스트 선택 상태
    const [currentTest, setCurrentTest] = useState<CognitiveTestType | null>(null);
    const [currentSubTest, setCurrentSubTest] = useState<string | null>(null);

    // 복원 로직: results 및 completedTests 초기화
    const [results, setResults] = useState<Partial<CognitivePerformanceResults>>(initialData || {});
    const [completedTests, setCompletedTests] = useState<Set<CognitiveTestType>>(() => {
        const completed = new Set<CognitiveTestType>();
        if (initialData) {
            if (initialData.workingMemory) completed.add('workingMemory');
            if (initialData.delayDiscounting) completed.add('delayDiscounting');
            if (initialData.processingSpeed) completed.add('processingSpeed');
            if (initialData.resilience) completed.add('resilience');
            if (initialData.reaction) completed.add('reactionTime');
            if (initialData.attention) completed.add('attention');
        }
        return completed;
    });

    // 진행 상황 상위 컴포넌트에 알림 (Autosave용)
    useEffect(() => {
        if (onProgress) {
            onProgress(results);
        }
    }, [results, onProgress]);

    // ========== Working Memory States ==========
    const [wmSubTest, setWmSubTest] = useState<'digitSpan' | 'nBack' | null>(null);
    // Digit Span
    const [dsPhase, setDsPhase] = useState<'forward' | 'backward'>('forward');
    const [dsTestPhase, setDsTestPhase] = useState<TestPhase>('idle');
    const [dsCurrentLength, setDsCurrentLength] = useState(DIGIT_SPAN_CONFIG.minLength);
    const [dsCurrentSequence, setDsCurrentSequence] = useState<number[]>([]);
    const [dsUserInput, setDsUserInput] = useState<string>('');
    const [dsShowingIndex, setDsShowingIndex] = useState(0);
    const [dsForwardTrials, setDsForwardTrials] = useState<boolean[][]>([]);
    const [dsBackwardTrials, setDsBackwardTrials] = useState<boolean[][]>([]);
    const [dsConsecutiveFails, setDsConsecutiveFails] = useState(0);
    const [dsFeedbackMessage, setDsFeedbackMessage] = useState<{ correct: boolean; message: string } | null>(null);
    const [dsCompleted, setDsCompleted] = useState(false);
    // N-Back
    const [nBackLevel, setNBackLevel] = useState<1 | 2>(1);
    const [nBackSequence, setNBackSequence] = useState<NBackItem[]>([]);
    const [nBackIndex, setNBackIndex] = useState(0);
    const [nBackResponses, setNBackResponses] = useState<{ isTarget: boolean; userResponse: boolean }[]>([]);
    const [nBackTestPhase, setNBackTestPhase] = useState<TestPhase>('idle');
    const [nBackShowCurrent, setNBackShowCurrent] = useState(false);
    const [nBackUserResponded, setNBackUserResponded] = useState(false);
    const [nBack1Result, setNBack1Result] = useState<any>(null);
    const [nBack2Result, setNBack2Result] = useState<any>(null);
    const [dsResult, setDsResult] = useState<any>(null);

    // ========== Delay Discounting States ==========
    const [ddScenarios, setDdScenarios] = useState<DelayChoice[]>([]);
    const [ddCurrentIndex, setDdCurrentIndex] = useState(0);
    const [ddResponses, setDdResponses] = useState<{ choiceId: string; choseImmediate: boolean; responseTimeMs: number }[]>([]);
    const [ddStartTime, setDdStartTime] = useState<number>(0);
    const [ddTestPhase, setDdTestPhase] = useState<TestPhase>('idle');

    // ========== Processing Speed States ==========
    const [psPassages, setPsPassages] = useState<ReadingPassage[]>([]);
    const [psCurrentPassageIndex, setPsCurrentPassageIndex] = useState(0);
    const [psTestPhase, setPsTestPhase] = useState<'idle' | 'reading' | 'questions' | 'complete'>('idle');
    const [psReadingStartTime, setPsReadingStartTime] = useState<number>(0);
    const [psReadingTime, setPsReadingTime] = useState<number>(0);
    const [psCurrentQuestionIndex, setPsCurrentQuestionIndex] = useState(0);
    const [psUserAnswers, setPsUserAnswers] = useState<boolean[]>([]);
    const [psPassageResults, setPsPassageResults] = useState<ProcessingSpeedResult[]>([]);
    const [psTimerDisplay, setPsTimerDisplay] = useState<string>('00:00');

    // ========== Resilience States ==========
    const [rsProblems, setRsProblems] = useState<ResilienceProblem[]>([]);
    const [rsCurrentIndex, setRsCurrentIndex] = useState(0);
    const [rsTestPhase, setRsTestPhase] = useState<'idle' | 'problem' | 'complete'>('idle');
    const [rsProblemStartTime, setRsProblemStartTime] = useState<number>(0);
    const [rsElapsedTime, setRsElapsedTime] = useState<number>(0);
    const [rsTrialResults, setRsTrialResults] = useState<ResilienceTrialResult[]>([]);
    const [rsShowGiveUp, setRsShowGiveUp] = useState(false);
    const [rsTimerDisplay, setRsTimerDisplay] = useState<string>('00:00');

    // ========== Reaction Time States ==========
    const [rtPhase, setRtPhase] = useState<'idle' | 'waiting' | 'ready' | 'clicked' | 'complete'>('idle');
    const [rtTrial, setRtTrial] = useState(0);
    const [rtStartTime, setRtStartTime] = useState(0);
    const [rtTimes, setRtTimes] = useState<number[]>([]);
    const [rtMessage, setRtMessage] = useState('화면을 클릭하여 시작하세요');

    // ========== Attention States ==========
    const [atPhase, setAtPhase] = useState<'idle' | 'test' | 'complete'>('idle');
    const [atTrial, setAtTrial] = useState(0);
    const [atScore, setAtScore] = useState({ correct: 0, commission: 0, omission: 0 }); // commission: No-Go 클릭, omission: Go 놓침
    const [atCurrentStimulus, setAtCurrentStimulus] = useState<'go' | 'nogo' | null>(null);
    const [atStimulusStartTime, setAtStimulusStartTime] = useState(0);
    const [atReactionTimes, setAtReactionTimes] = useState<number[]>([]);

    const inputRef = useRef<HTMLInputElement>(null);

    // 권장 테스트
    const recommendedTests = careType && careType !== CareType.UNASSESSED
        ? ['workingMemory', 'delayDiscounting', 'processingSpeed', 'resilience']
        : ['workingMemory', 'delayDiscounting', 'processingSpeed', 'resilience'];

    // ========== Digit Span Logic ==========
    const startDigitSpan = useCallback(() => {
        setWmSubTest('digitSpan');
        setDsPhase('forward');
        setDsCurrentLength(DIGIT_SPAN_CONFIG.minLength);
        setDsForwardTrials([]);
        setDsBackwardTrials([]);
        setDsConsecutiveFails(0);
        setDsCompleted(false);
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
        if (dsTestPhase !== 'showing' || wmSubTest !== 'digitSpan') return;

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
    }, [dsTestPhase, dsShowingIndex, dsCurrentSequence, wmSubTest]);

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
            message: isCorrect ? `✅ 정답! ${dsCurrentLength}자리 성공` : `❌ 오답. 정답: ${expectedSequence}`
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
        }, 1500);
    };

    const finishDigitSpan = () => {
        const result = calculateDigitSpanResult(dsForwardTrials, dsBackwardTrials);
        setDsResult(result);
        setDsCompleted(true);
        setDsTestPhase('idle');
        setWmSubTest(null);
    };

    // ========== N-Back Logic ==========
    const nBackRespondedRef = useRef(false);

    const startNBack = (level: 1 | 2) => {
        setWmSubTest('nBack');
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
        if (nBackTestPhase !== 'showing' || wmSubTest !== 'nBack') return;

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
    }, [nBackTestPhase, nBackIndex, nBackSequence, wmSubTest, nBackLevel]);

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
            setNBack1Result(result);
        } else {
            setNBack2Result(result);
        }

        setNBackTestPhase('idle');
        setWmSubTest(null);
    };

    // Working Memory 완료 처리
    const finishWorkingMemory = () => {
        const wmResult = calculateOverallLevel({
            digitSpan: dsResult,
            nBack1: nBack1Result,
            nBack2: nBack2Result,
            completedAt: new Date().toISOString()
        } as WorkingMemoryResult);

        const fullResult: WorkingMemoryResult = {
            digitSpan: dsResult,
            nBack1: nBack1Result,
            nBack2: nBack2Result,
            overallLevel: wmResult.level,
            overallScore: wmResult.score,
            completedAt: new Date().toISOString()
        };

        setResults(prev => ({ ...prev, workingMemory: fullResult }));
        setCompletedTests(prev => new Set([...prev, 'workingMemory']));
        setCurrentTest(null);
    };

    // ========== Delay Discounting Logic ==========
    const startDelayDiscounting = () => {
        const shuffled = [...DELAY_DISCOUNTING_SCENARIOS]
            .sort(() => Math.random() - 0.5)
            .slice(0, DELAY_DISCOUNTING_CONFIG.maxTrials);
        setDdScenarios(shuffled);
        setDdCurrentIndex(0);
        setDdResponses([]);
        setDdTestPhase('showing');
        setDdStartTime(Date.now());
    };

    const handleDelayChoice = (choseImmediate: boolean) => {
        const responseTime = Date.now() - ddStartTime;
        const currentScenario = ddScenarios[ddCurrentIndex];

        setDdResponses(prev => [...prev, {
            choiceId: currentScenario.id,
            choseImmediate,
            responseTimeMs: responseTime
        }]);

        if (ddCurrentIndex < ddScenarios.length - 1) {
            setDdCurrentIndex(prev => prev + 1);
            setDdStartTime(Date.now());
        } else {
            finishDelayDiscounting();
        }
    };

    const finishDelayDiscounting = () => {
        const result = calculateDelayDiscountingResult(ddResponses);
        setResults(prev => ({ ...prev, delayDiscounting: result }));
        setCompletedTests(prev => new Set([...prev, 'delayDiscounting']));
        setCurrentTest(null);
        setDdTestPhase('idle');
    };

    // ========== Processing Speed Logic ==========
    const startProcessingSpeed = () => {
        const shuffled = [...READING_PASSAGES]
            .sort(() => Math.random() - 0.5)
            .slice(0, PROCESSING_SPEED_CONFIG.maxPassages);
        setPsPassages(shuffled);
        setPsCurrentPassageIndex(0);
        setPsPassageResults([]);
        setPsTestPhase('idle');
    };

    const startReading = () => {
        setPsTestPhase('reading');
        setPsReadingStartTime(Date.now());
        setPsTimerDisplay('00:00');
    };

    // Reading timer effect
    useEffect(() => {
        if (psTestPhase !== 'reading') return;

        const interval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - psReadingStartTime) / 1000);
            const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
            const seconds = (elapsed % 60).toString().padStart(2, '0');
            setPsTimerDisplay(`${minutes}:${seconds}`);
        }, 1000);

        return () => clearInterval(interval);
    }, [psTestPhase, psReadingStartTime]);

    const finishReading = () => {
        const readingTime = Math.floor((Date.now() - psReadingStartTime) / 1000);
        setPsReadingTime(readingTime);
        setPsTestPhase('questions');
        setPsCurrentQuestionIndex(0);
        setPsUserAnswers([]);
    };

    const handleQuestionAnswer = (answer: boolean) => {
        const newAnswers = [...psUserAnswers, answer];
        setPsUserAnswers(newAnswers);

        const currentPassage = psPassages[psCurrentPassageIndex];

        if (psCurrentQuestionIndex < currentPassage.questions.length - 1) {
            setPsCurrentQuestionIndex(prev => prev + 1);
        } else {
            // 현재 지문 완료 → 결과 계산
            const passageResult = calculateProcessingSpeedResult(
                currentPassage,
                psReadingTime,
                newAnswers
            );
            const newResults = [...psPassageResults, passageResult];
            setPsPassageResults(newResults);

            if (psCurrentPassageIndex < psPassages.length - 1) {
                // 다음 지문으로
                setPsCurrentPassageIndex(prev => prev + 1);
                setPsTestPhase('idle');
                setPsCurrentQuestionIndex(0);
                setPsUserAnswers([]);
            } else {
                // 모든 지문 완료
                finishProcessingSpeed(newResults);
            }
        }
    };

    const finishProcessingSpeed = (passageResults: ProcessingSpeedResult[]) => {
        const overallResult = calculateOverallProcessingSpeed(passageResults);
        setResults(prev => ({ ...prev, processingSpeed: overallResult }));
        setCompletedTests(prev => new Set([...prev, 'processingSpeed']));
        setCurrentTest(null);
        setPsTestPhase('idle');
    };

    // ========== Resilience Logic ==========
    const startResilience = () => {
        // 문제 순서: 워밍업 → 불가능 → 회복 반복
        const warmUp = RESILIENCE_PROBLEMS.filter(p => p.type === 'solvable' && p.difficulty === 'easy');
        const impossible = RESILIENCE_PROBLEMS.filter(p => p.type === 'impossible');
        const recovery = RESILIENCE_PROBLEMS.filter(p => p.type === 'recovery');
        const medium = RESILIENCE_PROBLEMS.filter(p => p.type === 'solvable' && p.difficulty === 'medium');

        // 전략적 순서: 웜업 → 불가능1 → 회복1 → 불가능2 → 회복2 → ...
        const orderedProblems: ResilienceProblem[] = [
            ...warmUp.slice(0, RESILIENCE_CONFIG.warmUpProblems),
            ...impossible.slice(0, 1),
            ...recovery.slice(0, 1),
            ...impossible.slice(1, 2),
            ...recovery.slice(1, 2),
            ...medium.slice(0, 1),
            ...impossible.slice(2, 3)
        ];

        setRsProblems(orderedProblems);
        setRsCurrentIndex(0);
        setRsTrialResults([]);
        setRsTestPhase('idle');
    };

    const startRsProblem = () => {
        setRsTestPhase('problem');
        setRsProblemStartTime(Date.now());
        setRsElapsedTime(0);
        setRsShowGiveUp(false);
        setRsTimerDisplay('00:00');
    };

    // Resilience timer effect
    useEffect(() => {
        if (rsTestPhase !== 'problem') return;

        const interval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - rsProblemStartTime) / 1000);
            const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
            const seconds = (elapsed % 60).toString().padStart(2, '0');
            setRsTimerDisplay(`${minutes}:${seconds}`);
            setRsElapsedTime(elapsed);

            // 포기 버튼 활성화
            if (elapsed >= RESILIENCE_CONFIG.giveUpButtonDelay) {
                setRsShowGiveUp(true);
            }

            // 최대 시간 초과 시 자동 진행 (불가능 문제만)
            const currentProblem = rsProblems[rsCurrentIndex];
            if (currentProblem?.type === 'impossible' && elapsed >= RESILIENCE_CONFIG.maxTimePerImpossible) {
                handleRsAnswer(undefined, true);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [rsTestPhase, rsProblemStartTime, rsCurrentIndex, rsProblems]);

    const handleRsAnswer = (selectedAnswer?: number, isGiveUp: boolean = false) => {
        const currentProblem = rsProblems[rsCurrentIndex];
        const timeSpent = Math.floor((Date.now() - rsProblemStartTime) / 1000);

        const isCorrect = selectedAnswer !== undefined && selectedAnswer === currentProblem.correctAnswer;

        const trialResult: ResilienceTrialResult = {
            problemId: currentProblem.id,
            problemType: currentProblem.type,
            timeSpentSeconds: timeSpent,
            didGiveUp: isGiveUp,
            gaveUpAtSeconds: isGiveUp ? timeSpent : undefined,
            selectedAnswer,
            isCorrect: currentProblem.type !== 'impossible' ? isCorrect : undefined,
            attemptsBeforeGiveUp: isGiveUp ? 1 : 0
        };

        const newResults = [...rsTrialResults, trialResult];
        setRsTrialResults(newResults);

        if (rsCurrentIndex < rsProblems.length - 1) {
            setRsCurrentIndex(prev => prev + 1);
            setRsTestPhase('idle');
        } else {
            finishResilience(newResults);
        }
    };

    const handleRsGiveUp = () => {
        handleRsAnswer(undefined, true);
    };

    const finishResilience = (trialResults: ResilienceTrialResult[]) => {
        const overallResult = calculateResilienceResult(trialResults);
        setResults(prev => ({ ...prev, resilience: overallResult }));
        setCompletedTests(prev => new Set([...prev, 'resilience']));
        setCurrentTest(null);
        setRsTestPhase('idle');
    };

    // ========== Reaction Time Logic ==========
    const startReactionTime = () => {
        setRtPhase('waiting');
        setRtTrial(0);
        setRtTimes([]);
        setRtMessage('초록색으로 바뀌면 즉시 클릭하세요!');
        scheduleReactionStimulus();
    };

    const scheduleReactionStimulus = () => {
        const delay = Math.random() * (REACTION_TIME_CONFIG.maxDelayMs - REACTION_TIME_CONFIG.minDelayMs) + REACTION_TIME_CONFIG.minDelayMs;
        setRtPhase('waiting');

        setTimeout(() => {
            setRtPhase('ready'); // Green
            setRtStartTime(highResNow());
        }, delay);
    };

    const handleReactionClick = (e?: React.PointerEvent | React.MouseEvent) => {
        if (e) e.preventDefault();
        if (rtPhase === 'waiting') {
            // 부정 출발 (초록색 전 클릭)
            haptic(40);
            setRtMessage('너무 빨랐습니다! 다시 시도하세요.');
            // 페널티 로직은 복잡해지므로 단순 경고 후 재시작
            setRtPhase('idle');
            return;
        }

        if (rtPhase === 'ready') {
            const reactionTime = calibratedReactionMs(rtStartTime, e as { timeStamp?: number });
            haptic(10);
            const newTimes = [...rtTimes, reactionTime];
            setRtTimes(newTimes);
            setRtPhase('clicked');

            setRtMessage(`${reactionTime}ms!`);

            if (newTimes.length < REACTION_TIME_CONFIG.totalTrials) {
                setTimeout(() => {
                    setRtTrial(prev => prev + 1);
                    setRtMessage('준비...');
                    scheduleReactionStimulus();
                }, 1000);
            } else {
                setTimeout(() => finishReactionTime(newTimes), 1000);
            }
        }
    };

    const finishReactionTime = (times: number[]) => {
        const avgTime = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
        const bestTime = Math.min(...times);

        const result: ReactionTimeResult = {
            avgTime,
            bestTime,
            trials: times,
            completedAt: new Date().toISOString()
        };

        setResults(prev => ({ ...prev, reaction: result }));
        setCompletedTests(prev => new Set([...prev, 'reactionTime']));
        setCurrentTest(null);
        setRtPhase('idle');
    };

    // ========== Attention (Go/No-Go) Logic ==========
    const [atFeedbackText, setAtFeedbackText] = useState<string | null>(null);
    const atTimeoutsRef = useRef<NodeJS.Timeout[]>([]);

    const clearAtTimeouts = () => {
        atTimeoutsRef.current.forEach(t => clearTimeout(t));
        atTimeoutsRef.current = [];
    };

    const startAttention = () => {
        clearAtTimeouts();
        setAtPhase('test');
        setAtTrial(0);
        setAtScore({ correct: 0, commission: 0, omission: 0 });
        setAtReactionTimes([]);
        setAtFeedbackText(null);
        scheduleAttentionStimulus(0);
    };

    const scheduleAttentionStimulus = (trialNum: number) => {
        if (trialNum >= ATTENTION_TEST_CONFIG.totalTrials) {
            finishAttention();
            return;
        }

        // Random delay before stimulus (700ms ~ 1200ms)
        const delay = 700 + Math.random() * 500;
        const preTimer = setTimeout(() => {
            if (document.hidden) return;
            const isNoGo = Math.random() < ATTENTION_TEST_CONFIG.noGoProbability;
            setAtCurrentStimulus(isNoGo ? 'nogo' : 'go');
            setAtStimulusStartTime(highResNow());
            atClickedRef.current = false;

            // Stimulus display time
            const displayTimer = setTimeout(() => {
                if (isNoGo === false && !atClickedRef.current) {
                    setAtScore(prev => ({ ...prev, omission: prev.omission + 1 }));
                }
                setAtCurrentStimulus(null);

                // Wait for Inter-Stimulus Interval then next trial
                const isiTimer = setTimeout(() => {
                    setAtFeedbackText(null);
                    setAtTrial(trialNum + 1);
                    if (trialNum + 1 >= ATTENTION_TEST_CONFIG.totalTrials) {
                        finishAttention();
                    } else {
                        scheduleAttentionStimulus(trialNum + 1);
                    }
                }, ATTENTION_TEST_CONFIG.interStimulusInterval);
                atTimeoutsRef.current.push(isiTimer);

            }, ATTENTION_TEST_CONFIG.displayTimeMs);
            atTimeoutsRef.current.push(displayTimer);

        }, delay);
        atTimeoutsRef.current.push(preTimer);
    };

    const atClickedRef = useRef(false);

    const handleAttentionClick = (e?: React.PointerEvent | React.MouseEvent) => {
        if (e) { e.stopPropagation(); e.preventDefault(); }
        if (!atCurrentStimulus || atClickedRef.current) return;

        atClickedRef.current = true;
        const reactionTime = calibratedReactionMs(atStimulusStartTime, e as { timeStamp?: number });
        haptic(10);

        if (atCurrentStimulus === 'go') {
            setAtScore(prev => ({ ...prev, correct: prev.correct + 1 }));
            setAtReactionTimes(prev => [...prev, reactionTime]);
            setAtFeedbackText(`✅ 잘 눌렀습니다! (${reactionTime}ms)`);
        } else {
            // No-Go Clicked -> Commission Error
            setAtScore(prev => ({ ...prev, commission: prev.commission + 1 }));
            setAtFeedbackText(`⚠️ No-Go 신호(빨간색)는 클릭하면 안 됩니다!`);
        }

        setAtCurrentStimulus(null); // Immediate disappearance
    };

    const finishAttention = () => {
        clearAtTimeouts();
        const total = Math.max(atTrial + 1, ATTENTION_TEST_CONFIG.totalTrials);
        const noGoCount = Math.round(total * ATTENTION_TEST_CONFIG.noGoProbability);
        const correctRejection = Math.max(0, noGoCount - atScore.commission);
        const finalAccuracy = Math.min(100, Math.max(0, Math.round(((atScore.correct + correctRejection) / total) * 100)));

        const avgReactionTime = atReactionTimes.length > 0
            ? Math.round(atReactionTimes.reduce((a, b) => a + b, 0) / atReactionTimes.length)
            : 0;

        const result: AttentionResult = {
            accuracy: finalAccuracy,
            avgReactionTime,
            mistakes: {
                commission: atScore.commission,
                omission: atScore.omission
            },
            totalTrials: total,
            completedAt: new Date().toISOString()
        };

        setResults(prev => ({ ...prev, attention: result }));
        setCompletedTests(prev => new Set([...prev, 'attention']));
        setAtPhase('complete');
    };

    // ========== 전체 완료 ==========
    const handleFinish = () => {
        onComplete({
            ...results,
            completedAt: new Date().toISOString()
        } as CognitivePerformanceResults);
    };

    // ========== 렌더링 ==========
    const renderSelectionScreen = () => (
        <div className="p-6 space-y-6">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                    🧠 인지 성능 테스트
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                    주관이 개입할 수 없는 반응형 테스트로 실제 인지 능력을 측정합니다.
                </p>
                {careType && careType !== CareType.UNASSESSED && (
                    <div className="mt-3 p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                        <p className="text-sm text-indigo-700 dark:text-indigo-300">
                            💡 <strong>{careType}</strong> 유형에게 모든 테스트를 권장합니다.
                        </p>
                    </div>
                )}

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
                </div>
            </div>

            <div className="grid gap-4">
                {(Object.keys(COGNITIVE_TEST_INFO) as CognitiveTestType[]).map(type => {
                    const info = COGNITIVE_TEST_INFO[type];
                    const isCompleted = completedTests.has(type);

                    return (
                        <div
                            key={type}
                            className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${isCompleted
                                ? 'border-green-400 bg-green-50 dark:bg-green-900/20'
                                : 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:shadow-lg'
                                }`}
                            onClick={() => {
                                if (isCompleted) return;
                                setCurrentTest(type);
                            }}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">{info.icon}</span>
                                    <div>
                                        <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                                            {info.title}
                                            {isCompleted && (
                                                <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">완료</span>
                                            )}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{info.description}</p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            포함: {info.subTests.join(', ')}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs text-gray-400">{info.time}</span>
                                    {!isCompleted && (
                                        <div className="mt-1 text-indigo-500">
                                            <span className="text-sm">시작 →</span>
                                        </div>
                                    )}
                                </div>
                            </div>

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
                        완료: {completedTests.size}/{Object.keys(COGNITIVE_TEST_INFO).length} 검사
                    </div>
                </div>
                <button
                    onClick={handleFinish}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${completedTests.size > 0
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl'
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

    const renderResultPreview = (type: CognitiveTestType) => {
        if (type === 'workingMemory' && results.workingMemory) {
            const wm = results.workingMemory;
            const desc = wm.overallLevel ? WORKING_MEMORY_DESCRIPTIONS[wm.overallLevel] : null;
            return (
                <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
                    <p className="text-sm font-medium text-green-700 dark:text-green-400">
                        {desc?.label || '검사 완료'} • 점수: {wm.overallScore ?? '-'}점
                    </p>
                </div>
            );
        }
        if (type === 'delayDiscounting' && results.delayDiscounting) {
            const dd = results.delayDiscounting;
            const desc = IMPULSIVITY_DESCRIPTIONS[dd.impulsivityLevel];
            return (
                <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
                    <p className="text-sm font-medium text-green-700 dark:text-green-400">
                        {desc.label} • 즉시보상 선택률: {dd.immediateRate}%
                    </p>
                </div>
            );
        }
        if (type === 'processingSpeed' && results.processingSpeed) {
            const ps = results.processingSpeed;
            const desc = PROCESSING_SPEED_DESCRIPTIONS[ps.overallLevel];
            return (
                <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
                    <p className="text-sm font-medium text-green-700 dark:text-green-400">
                        {desc.label} • {ps.averageWPM} WPM • 이해도 {ps.averageAccuracy}%
                    </p>
                </div>
            );
        }
        if (type === 'resilience' && results.resilience) {
            const rs = results.resilience;
            const desc = RESILIENCE_DESCRIPTIONS[rs.gradeLevel];
            return (
                <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
                    <p className="text-sm font-medium text-green-700 dark:text-green-400">
                        {desc.label} • 회복: {rs.mentalRecoverySpeed === 'fast' ? '빠름' : rs.mentalRecoverySpeed === 'slow' ? '느림' : '보통'}
                    </p>
                </div>
            );
        }
        return null;
    };

    // Working Memory 테스트 메인 화면
    const renderWorkingMemoryMain = () => (
        <div className="p-6 space-y-6">
            <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                    🧩 작업 기억 용량 테스트
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    아래 테스트들을 완료해 주세요. (순서 무관)
                </p>
            </div>

            <div className="grid gap-4">
                {/* Digit Span */}
                <div
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${dsCompleted
                        ? 'border-green-400 bg-green-50 dark:bg-green-900/20'
                        : 'border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20 hover:shadow-lg'
                        }`}
                    onClick={() => !dsCompleted && startDigitSpan()}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">🔢</span>
                            <div>
                                <h4 className="font-semibold text-gray-800 dark:text-white">숫자 따라하기 (Digit Span)</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">순방향/역방향 숫자 기억</p>
                            </div>
                        </div>
                        {dsCompleted ? (
                            <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">완료 ✓</span>
                        ) : (
                            <span className="text-purple-500 font-medium">시작 →</span>
                        )}
                    </div>
                    {dsResult && (
                        <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                            순방향: {dsResult.forwardSpan}자리 | 역방향: {dsResult.backwardSpan}자리
                        </p>
                    )}
                </div>

                {/* N-Back 1 */}
                <div
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${nBack1Result
                        ? 'border-green-400 bg-green-50 dark:bg-green-900/20'
                        : 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 hover:shadow-lg'
                        }`}
                    onClick={() => !nBack1Result && startNBack(1)}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">1️⃣</span>
                            <div>
                                <h4 className="font-semibold text-gray-800 dark:text-white">1-Back 테스트</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">직전 문자와 일치 여부 판단</p>
                            </div>
                        </div>
                        {nBack1Result ? (
                            <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">완료 ✓</span>
                        ) : (
                            <span className="text-blue-500 font-medium">시작 →</span>
                        )}
                    </div>
                    {nBack1Result && (
                        <p className="mt-2 text-sm text-green-600 dark:text-green-400">정확도: {nBack1Result.accuracy}%</p>
                    )}
                </div>

                {/* N-Back 2 (선택) */}
                <div
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${nBack2Result
                        ? 'border-green-400 bg-green-50 dark:bg-green-900/20'
                        : 'border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/20 hover:shadow-lg'
                        }`}
                    onClick={() => !nBack2Result && startNBack(2)}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">2️⃣</span>
                            <div>
                                <h4 className="font-semibold text-gray-800 dark:text-white">2-Back 테스트 <span className="text-xs text-orange-500">(어려움)</span></h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">2개 전 문자와 일치 여부 판단</p>
                            </div>
                        </div>
                        {nBack2Result ? (
                            <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">완료 ✓</span>
                        ) : (
                            <span className="text-indigo-500 font-medium">시작 →</span>
                        )}
                    </div>
                    {nBack2Result && (
                        <p className="mt-2 text-sm text-green-600 dark:text-green-400">정확도: {nBack2Result.accuracy}%</p>
                    )}
                </div>
            </div>

            <div className="flex gap-3 pt-4">
                <button
                    onClick={() => setCurrentTest(null)}
                    className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                    ← 돌아가기
                </button>
                <button
                    onClick={finishWorkingMemory}
                    disabled={!dsCompleted && !nBack1Result}
                    className={`flex-1 py-3 rounded-xl font-bold ${(dsCompleted || nBack1Result)
                        ? 'bg-green-500 text-white hover:bg-green-600 shadow-md'
                        : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        }`}
                >
                    {(dsCompleted || nBack1Result) ? '검사 완료 ✓' : '최소 1개 완료 필요'}
                </button>
            </div>
        </div>
    );

    // Digit Span 실행 UI
    const renderDigitSpanTest = () => (
        <div className="p-6 space-y-6">
            <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                    🔢 숫자 따라하기 ({dsPhase === 'forward' ? '순방향' : '역방향'})
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {dsPhase === 'forward' ? '보이는 숫자를 순서대로 입력하세요' : '보이는 숫자를 거꾸로 입력하세요'}
                </p>
                <div className="mt-2 text-lg font-bold text-purple-600 dark:text-purple-400">현재: {dsCurrentLength}자리</div>
            </div>

            <div className="flex justify-center items-center h-40 bg-gray-100 dark:bg-gray-800 rounded-2xl">
                {dsTestPhase === 'showing' && dsShowingIndex < dsCurrentSequence.length && (
                    <div className="text-8xl font-bold text-purple-600 dark:text-purple-400 animate-pulse">
                        {dsCurrentSequence[dsShowingIndex]}
                    </div>
                )}
                {dsTestPhase === 'showing' && dsShowingIndex >= dsCurrentSequence.length && (
                    <div className="text-2xl text-gray-400 dark:text-gray-500">준비 중...</div>
                )}
                {dsTestPhase === 'input' && (
                    <div className="text-center">
                        <input
                            ref={inputRef}
                            type="text"
                            inputMode="numeric"
                            value={dsUserInput}
                            onChange={e => setDsUserInput(e.target.value.replace(/\D/g, ''))}
                            onKeyDown={e => e.key === 'Enter' && handleDigitSubmit()}
                            className="w-48 text-center text-3xl py-3 border-2 border-purple-400 dark:border-purple-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            placeholder="숫자 입력"
                            autoFocus
                        />
                        <button
                            onClick={handleDigitSubmit}
                            className="block mx-auto mt-4 px-8 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-bold transition-colors"
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

            <button
                onClick={() => {
                    setDsTestPhase('idle');
                    setWmSubTest(null);
                }}
                className="w-full py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium text-sm rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
                ← 돌아가기
            </button>
        </div>
    );

    // N-Back 실행 UI
    const renderNBackTest = () => (
        <div className="p-6 space-y-6">
            <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                    {nBackLevel}-Back 테스트
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {nBackLevel}개 전 문자와 같으면 버튼을 누르세요!
                </p>
            </div>

            <div className="flex justify-center items-center h-48 bg-gray-100 dark:bg-gray-800 rounded-2xl">
                {nBackShowCurrent && nBackIndex < nBackSequence.length && (
                    <div className="text-9xl font-bold text-indigo-600 animate-bounce">
                        {nBackSequence[nBackIndex].value}
                    </div>
                )}
                {!nBackShowCurrent && nBackIndex < nBackSequence.length && (
                    <div className="text-4xl text-gray-300 dark:text-gray-600">+</div>
                )}
                {nBackIndex >= nBackSequence.length && (
                    <div className="text-2xl text-green-500 font-bold">테스트 완료!</div>
                )}
            </div>

            <button
                onClick={handleNBackResponse}
                disabled={!nBackShowCurrent || nBackUserResponded || nBackIndex >= nBackSequence.length}
                className={`w-full py-6 rounded-xl font-bold text-2xl transition-all ${nBackShowCurrent && !nBackUserResponded
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-lg'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                    }`}
            >
                {nBackUserResponded ? '✅ 응답함' : '🎯 같음!'}
            </button>

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                    className="bg-indigo-500 h-2 rounded-full transition-all"
                    style={{ width: `${(nBackIndex / nBackSequence.length) * 100}%` }}
                />
            </div>

            <button
                onClick={() => {
                    setNBackTestPhase('idle');
                    setWmSubTest(null);
                }}
                className="w-full py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium text-sm rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
                ← 중단하고 돌아가기
            </button>
        </div>
    );

    // Delay Discounting 메인 화면
    const renderDelayDiscountingMain = () => (
        <div className="p-6 space-y-6">
            <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                    🎯 도파민 보상 지연 테스트
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    다양한 시나리오에서 즉시 보상과 지연 보상 중 하나를 선택하세요.
                </p>
                <p className="text-xs text-indigo-500 mt-2">
                    정답이 없습니다. 솔직하게 선택해 주세요!
                </p>
            </div>

            {ddTestPhase === 'idle' ? (
                <div className="space-y-4">
                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">
                        <h4 className="font-bold text-indigo-700 dark:text-indigo-300 mb-2">테스트 안내</h4>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            <li>• 총 {DELAY_DISCOUNTING_CONFIG.maxTrials}개의 시나리오가 제시됩니다</li>
                            <li>• 각 시나리오에서 두 가지 보상 중 하나를 선택합니다</li>
                            <li>• 솔직한 선택이 정확한 결과로 이어집니다</li>
                        </ul>
                    </div>

                    <button
                        onClick={startDelayDiscounting}
                        className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-indigo-600 hover:to-purple-700 shadow-lg"
                    >
                        🎯 테스트 시작하기
                    </button>

                    <button
                        onClick={() => setCurrentTest(null)}
                        className="w-full py-2 bg-gray-200 text-gray-700 rounded-lg"
                    >
                        ← 돌아가기
                    </button>
                </div>
            ) : (
                renderDelayDiscountingTest()
            )}
        </div>
    );

    // Delay Discounting 테스트 실행 UI
    const renderDelayDiscountingTest = () => {
        if (ddCurrentIndex >= ddScenarios.length) return null;
        const scenario = ddScenarios[ddCurrentIndex];

        return (
            <div className="space-y-6">
                <div className="text-center">
                    <span className="text-xs text-gray-400">
                        {ddCurrentIndex + 1} / {ddScenarios.length}
                    </span>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                            className="bg-indigo-500 h-2 rounded-full transition-all"
                            style={{ width: `${((ddCurrentIndex) / ddScenarios.length) * 100}%` }}
                        />
                    </div>
                </div>

                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <span className="text-lg font-bold text-gray-700 dark:text-gray-200">
                        💭 {scenario.scenario}
                    </span>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <button
                        onClick={() => handleDelayChoice(true)}
                        className="p-6 bg-gradient-to-r from-orange-400 to-red-400 text-white rounded-xl shadow-lg hover:from-orange-500 hover:to-red-500 transition-all transform hover:scale-[1.02]"
                    >
                        <div className="text-3xl mb-2">⚡</div>
                        <div className="text-xl font-bold">{scenario.immediateLabel}</div>
                        <div className="text-sm opacity-80 mt-1">지금 바로!</div>
                    </button>

                    <div className="text-center text-gray-400 font-bold">VS</div>

                    <button
                        onClick={() => handleDelayChoice(false)}
                        className="p-6 bg-gradient-to-r from-blue-400 to-indigo-500 text-white rounded-xl shadow-lg hover:from-blue-500 hover:to-indigo-600 transition-all transform hover:scale-[1.02]"
                    >
                        <div className="text-3xl mb-2">⏳</div>
                        <div className="text-xl font-bold">{scenario.delayedLabel}</div>
                        <div className="text-sm opacity-80 mt-1">{scenario.delayDays}일 후</div>
                    </button>
                </div>
            </div>
        );
    };

    // Processing Speed 메인 화면
    const renderProcessingSpeedMain = () => {
        const currentPassage = psPassages[psCurrentPassageIndex];

        // 아직 시작 안함
        if (psPassages.length === 0) {
            return (
                <div className="p-6 space-y-6">
                    <div className="text-center mb-4">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                            📚 문해력/처리 속도 테스트
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            정보 습득의 "엔진 출력"을 측정합니다.
                        </p>
                    </div>

                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl">
                        <h4 className="font-bold text-emerald-700 dark:text-emerald-300 mb-2">테스트 안내</h4>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            <li>• {PROCESSING_SPEED_CONFIG.maxPassages}개의 지문을 읽습니다</li>
                            <li>• 각 지문 읽기 후 O/X 이해도 문제 4개</li>
                            <li>• 자연스러운 속도로 읽되, 내용을 이해하세요</li>
                        </ul>
                    </div>

                    <button
                        onClick={() => {
                            startProcessingSpeed();
                        }}
                        className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold text-lg hover:from-emerald-600 hover:to-teal-700 shadow-lg"
                    >
                        📖 테스트 시작하기
                    </button>

                    <button
                        onClick={() => setCurrentTest(null)}
                        className="w-full py-2 bg-gray-200 text-gray-700 rounded-lg"
                    >
                        ← 돌아가기
                    </button>
                </div>
            );
        }

        // 지문 읽기 대기 상태
        if (psTestPhase === 'idle') {
            return (
                <div className="p-6 space-y-6">
                    <div className="text-center">
                        <span className="text-xs text-gray-400">
                            지문 {psCurrentPassageIndex + 1} / {psPassages.length}
                        </span>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div
                                className="bg-emerald-500 h-2 rounded-full transition-all"
                                style={{ width: `${(psCurrentPassageIndex / psPassages.length) * 100}%` }}
                            />
                        </div>
                    </div>

                    <div className="text-center">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                            📖 {currentPassage.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                            난이도: <span className={
                                currentPassage.difficulty === 'easy' ? 'text-green-500' :
                                    currentPassage.difficulty === 'medium' ? 'text-orange-500' : 'text-red-500'
                            }>
                                {currentPassage.difficulty === 'easy' ? '쉬움' : currentPassage.difficulty === 'medium' ? '보통' : '어려움'}
                            </span>
                            {' '} | {currentPassage.wordCount}자
                        </p>
                    </div>

                    <button
                        onClick={startReading}
                        className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold text-lg hover:from-emerald-600 hover:to-teal-700 shadow-lg"
                    >
                        📖 지문 읽기 시작
                    </button>
                </div>
            );
        }

        // 지문 읽기 중
        if (psTestPhase === 'reading') {
            return (
                <div className="p-6 space-y-6">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">지문 {psCurrentPassageIndex + 1}/{psPassages.length}</span>
                        <div className="flex items-center gap-2 bg-emerald-100 px-4 py-2 rounded-full">
                            <span className="text-2xl">⏱️</span>
                            <span className="text-xl font-mono font-bold text-emerald-700">{psTimerDisplay}</span>
                        </div>
                    </div>

                    <div className="text-center">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                            {currentPassage.title}
                        </h3>
                    </div>

                    <div className="p-5 bg-gray-50 dark:bg-gray-800 rounded-xl leading-relaxed text-lg text-gray-700 dark:text-gray-300">
                        {currentPassage.content}
                    </div>

                    <button
                        onClick={finishReading}
                        className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-bold text-lg hover:from-blue-600 hover:to-indigo-700 shadow-lg"
                    >
                        ✅ 다 읽었습니다
                    </button>
                </div>
            );
        }

        // 질문 단계
        if (psTestPhase === 'questions') {
            const currentQuestion = currentPassage.questions[psCurrentQuestionIndex];
            return (
                <div className="p-6 space-y-6">
                    <div className="text-center">
                        <span className="text-xs text-gray-400">
                            문제 {psCurrentQuestionIndex + 1} / {currentPassage.questions.length}
                        </span>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div
                                className="bg-blue-500 h-2 rounded-full transition-all"
                                style={{ width: `${((psCurrentQuestionIndex + 1) / currentPassage.questions.length) * 100}%` }}
                            />
                        </div>
                    </div>

                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                        <p className="text-sm text-gray-500 mb-2">"{currentPassage.title}" 관련 문제</p>
                        <p className="text-lg font-medium text-gray-800 dark:text-white">
                            {currentQuestion.question}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => handleQuestionAnswer(true)}
                            className="p-6 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-xl shadow-lg hover:from-green-500 hover:to-emerald-600 transition-all transform hover:scale-[1.02]"
                        >
                            <div className="text-4xl mb-2">⭕</div>
                            <div className="text-xl font-bold">맞다</div>
                        </button>

                        <button
                            onClick={() => handleQuestionAnswer(false)}
                            className="p-6 bg-gradient-to-r from-red-400 to-rose-500 text-white rounded-xl shadow-lg hover:from-red-500 hover:to-rose-600 transition-all transform hover:scale-[1.02]"
                        >
                            <div className="text-4xl mb-2">❌</div>
                            <div className="text-xl font-bold">틀리다</div>
                        </button>
                    </div>
                </div>
            );
        }

        return null;
    };

    // Resilience 메인 화면
    const renderResilienceMain = () => {
        const currentProblem = rsProblems[rsCurrentIndex];

        // 아직 시작 안함
        if (rsProblems.length === 0) {
            return (
                <div className="p-6 space-y-6">
                    <div className="text-center mb-4">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                            💪 회복 탄력성 지수 (Grit)
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            "틀려도 멘탈이 안 나가는" 능력을 측정합니다.
                        </p>
                    </div>

                    <div className="p-4 bg-orange-50 dark:bg-orange-900/30 rounded-xl">
                        <h4 className="font-bold text-orange-700 dark:text-orange-300 mb-2">테스트 안내</h4>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            <li>• 다양한 난이도의 문제가 제시됩니다</li>
                            <li>• 일부 문제는 매우 어렵거나 풀 수 없을 수 있습니다</li>
                            <li>• <strong>포기 버튼</strong>을 누르는 시점과 그 후 회복력을 측정합니다</li>
                            <li>• 정답/오답보다 <strong>포기 패턴</strong>이 더 중요합니다</li>
                        </ul>
                    </div>

                    <button
                        onClick={startResilience}
                        className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold text-lg hover:from-orange-600 hover:to-red-600 shadow-lg"
                    >
                        💪 테스트 시작하기
                    </button>

                    <button
                        onClick={() => setCurrentTest(null)}
                        className="w-full py-2 bg-gray-200 text-gray-700 rounded-lg"
                    >
                        ← 돌아가기
                    </button>
                </div>
            );
        }

        // 문제 풀기 대기 상태
        if (rsTestPhase === 'idle' && currentProblem) {
            const difficultyLabel = {
                easy: '쉬움',
                medium: '보통',
                hard: '어려움',
                impossible: '❓'
            }[currentProblem.difficulty];

            const typeLabel = {
                solvable: '일반 문제',
                impossible: '도전 문제',
                recovery: '회복 문제'
            }[currentProblem.type];

            return (
                <div className="p-6 space-y-6">
                    <div className="text-center">
                        <span className="text-xs text-gray-400">
                            문제 {rsCurrentIndex + 1} / {rsProblems.length}
                        </span>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div
                                className="bg-orange-500 h-2 rounded-full transition-all"
                                style={{ width: `${(rsCurrentIndex / rsProblems.length) * 100}%` }}
                            />
                        </div>
                        <p className="text-xs mt-2 text-gray-500">
                            {typeLabel} • 난이도: <span className={
                                currentProblem.difficulty === 'easy' ? 'text-green-500' :
                                    currentProblem.difficulty === 'medium' ? 'text-orange-500' :
                                        currentProblem.difficulty === 'hard' ? 'text-red-500' : 'text-purple-500'
                            }>{difficultyLabel}</span>
                        </p>
                    </div>

                    <button
                        onClick={startRsProblem}
                        className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold text-lg hover:from-orange-600 hover:to-red-600 shadow-lg"
                    >
                        📝 문제 풀기 시작
                    </button>
                </div>
            );
        }

        // 문제 풀기 중
        if (rsTestPhase === 'problem' && currentProblem) {
            return (
                <div className="p-6 space-y-6">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">문제 {rsCurrentIndex + 1}/{rsProblems.length}</span>
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${rsElapsedTime > 60 ? 'bg-red-100' : 'bg-orange-100'
                            }`}>
                            <span className="text-2xl">⏱️</span>
                            <span className={`text-xl font-mono font-bold ${rsElapsedTime > 60 ? 'text-red-700' : 'text-orange-700'
                                }`}>{rsTimerDisplay}</span>
                        </div>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                        <p className="text-lg font-medium text-gray-800 dark:text-white whitespace-pre-line">
                            {currentProblem.question}
                        </p>
                    </div>

                    <div className="grid gap-3">
                        {currentProblem.options.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => handleRsAnswer(index)}
                                className="w-full p-4 text-left bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all"
                            >
                                <span className="font-bold text-orange-500 mr-3">{String.fromCharCode(65 + index)}.</span>
                                <span className="text-gray-800 dark:text-white">{option}</span>
                            </button>
                        ))}
                    </div>

                    {rsShowGiveUp && (
                        <button
                            onClick={handleRsGiveUp}
                            className="w-full py-3 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 transition-all flex items-center justify-center gap-2"
                        >
                            <span>🏳️</span> 포기하고 다음 문제로
                        </button>
                    )}

                    {!rsShowGiveUp && (
                        <p className="text-center text-xs text-gray-400">
                            {RESILIENCE_CONFIG.giveUpButtonDelay - rsElapsedTime}초 후 포기 버튼 활성화
                        </p>
                    )}
                </div>
            );
        }

        return null;
    };

    // 메인 렌더링 로직
    const renderContent = () => {
        // 선택 화면
        if (currentTest === null) {
            return renderSelectionScreen();
        }

        // Working Memory
        if (currentTest === 'workingMemory') {
            if (wmSubTest === 'digitSpan') {
                return renderDigitSpanTest();
            }
            if (wmSubTest === 'nBack') {
                return renderNBackTest();
            }
            return renderWorkingMemoryMain();
        }

        // Delay Discounting
        if (currentTest === 'delayDiscounting') {
            return renderDelayDiscountingMain();
        }

        // Processing Speed
        if (currentTest === 'processingSpeed') {
            return renderProcessingSpeedMain();
        }

        // Resilience
        if (currentTest === 'resilience') {
            return renderResilienceMain();
        }

        // Reaction Time
        if (currentTest === 'reactionTime') {
            return renderReactionTimeTest();
        }

        // Attention
        if (currentTest === 'attention') {
            return renderAttentionTest();
        }

        return null;
    };

    // ========== Reaction Time Render ==========
    const renderReactionTimeTest = () => {
        // 시작 전 안내
        if (rtPhase === 'idle' || rtPhase === 'complete') {
            return (
                <div className="p-6 space-y-6">
                    <div className="text-center mb-4">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                            ⚡ 반응 속도 테스트
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            신호가 나타나면 최대한 빠르게 반응하세요.
                        </p>
                    </div>

                    <div className="p-6 bg-yellow-50 dark:bg-yellow-900/30 rounded-xl text-center">
                        <p className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">
                            사용 방법
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                            화면이 <span className="text-green-600 font-bold">초록색</span>으로 바뀌면<br />
                            즉시 화면을 클릭하세요!
                        </p>
                        <p className="text-xs text-gray-500 mt-2">(총 5회 측정)</p>
                    </div>

                    <button
                        onClick={startReactionTime}
                        className="w-full py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl font-bold text-lg hover:from-yellow-500 hover:to-orange-600 shadow-lg"
                    >
                        ⚡ 테스트 시작하기
                    </button>

                    <button
                        onClick={() => setCurrentTest(null)}
                        className="w-full py-2 bg-gray-200 text-gray-700 rounded-lg"
                    >
                        ← 돌아가기
                    </button>
                </div>
            );
        }

        // 테스트 진행 중
        let bgColor = 'bg-gray-100 dark:bg-gray-800';
        let content = <p className="text-xl text-gray-500">준비...</p>;

        if (rtPhase === 'waiting') {
            bgColor = 'bg-red-500';
            content = <p className="text-3xl font-bold text-white">기다리세요...</p>;
        } else if (rtPhase === 'ready') {
            bgColor = 'bg-green-500';
            content = <p className="text-4xl font-bold text-white">클릭!!!</p>;
        } else if (rtPhase === 'clicked') {
            bgColor = 'bg-blue-500';
            content = (
                <div className="text-center text-white">
                    <p className="text-4xl font-bold mb-2">{rtTimes[rtTimes.length - 1]}ms</p>
                    <p>{rtTrial + 1} / {REACTION_TIME_CONFIG.totalTrials}</p>
                </div>
            );
        }

        return (
            <div
                className={`fixed inset-0 z-[60] flex flex-col items-center justify-center cursor-pointer transition-colors duration-100 touch-none select-none [-webkit-tap-highlight-color:transparent] ${bgColor}`}
                onPointerDown={handleReactionClick}
            >
                {content}
                {rtPhase === 'waiting' && (
                    <p className="absolute bottom-10 text-white/70 text-sm">
                        초록색이 되면 클릭하세요
                    </p>
                )}
            </div>
        );
    };

    // ========== Attention Render ==========
    const renderAttentionTest = () => {
        // 시작 전
        if (atPhase === 'idle') {
            return (
                <div className="p-6 space-y-6">
                    <div className="text-center mb-4">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                            🛑 주의력 (Go/No-Go) 테스트
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            충동을 조절하고 필요한 자극에만 반응하세요.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-xl text-center border-2 border-green-200">
                            <span className="text-4xl block mb-2">🟢</span>
                            <p className="font-bold text-green-700">Go 신호</p>
                            <p className="text-xs text-gray-500">클릭하세요!</p>
                        </div>
                        <div className="p-4 bg-red-50 dark:bg-red-900/30 rounded-xl text-center border-2 border-red-200">
                            <span className="text-4xl block mb-2">🔴</span>
                            <p className="font-bold text-red-700">No-Go 신호</p>
                            <p className="text-xs text-gray-500">클릭 금지!</p>
                        </div>
                    </div>

                    <button
                        onClick={startAttention}
                        className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg hover:from-purple-600 hover:to-pink-600 shadow-lg"
                    >
                        🛑 테스트 시작하기
                    </button>

                    <button
                        onClick={() => setCurrentTest(null)}
                        className="w-full py-2 bg-gray-200 text-gray-700 rounded-lg"
                    >
                        ← 돌아가기
                    </button>
                </div>
            );
        }

        // 테스트 중
        return (
            <div
                className="fixed inset-0 z-[60] bg-gray-950 flex flex-col items-center justify-center cursor-pointer select-none touch-none [-webkit-tap-highlight-color:transparent]"
                onPointerDown={handleAttentionClick}
            >
                {/* 상단 진행 상태 및 조기 종료 버튼 */}
                <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10 pointer-events-auto">
                    <div className="text-white/80 font-mono text-sm bg-black/40 px-4 py-2 rounded-xl border border-white/10">
                        진행 횟수: <span className="text-emerald-400 font-bold">{Math.min(atTrial + 1, ATTENTION_TEST_CONFIG.totalTrials)}</span> / {ATTENTION_TEST_CONFIG.totalTrials}회
                    </div>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            finishAttention();
                        }}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-1.5"
                    >
                        <span>⏹️</span>
                        <span>검사 즉시 종료 및 결과 확인</span>
                    </button>
                </div>

                {/* 중앙 자극 영역 */}
                <div className="flex flex-col items-center justify-center min-h-[250px]">
                    {atCurrentStimulus === 'go' && (
                        <div className="w-52 h-52 rounded-full bg-green-500 shadow-[0_0_60px_rgba(34,197,94,0.8)] flex flex-col items-center justify-center animate-pulse border-4 border-white">
                            <span className="text-5xl font-black text-white">Go!</span>
                            <span className="text-xs text-green-100 font-bold mt-1">클릭하세요!</span>
                        </div>
                    )}

                    {atCurrentStimulus === 'nogo' && (
                        <div className="w-52 h-52 rounded-2xl bg-red-600 shadow-[0_0_60px_rgba(239,68,68,0.8)] flex flex-col items-center justify-center border-4 border-white">
                            <span className="text-5xl font-black text-white">STOP</span>
                            <span className="text-xs text-red-100 font-bold mt-1">누르지 마세요!</span>
                        </div>
                    )}

                    {!atCurrentStimulus && (
                        <div className="text-gray-600 text-6xl font-light">+</div>
                    )}
                </div>

                {/* 하단 피드백 멘트 */}
                <div className="absolute bottom-12 text-center h-12 flex items-center justify-center">
                    {atFeedbackText ? (
                        <div className="px-6 py-2.5 bg-white/90 text-slate-900 rounded-full font-bold text-sm shadow-xl animate-in fade-in zoom-in-95 border border-slate-300">
                            {atFeedbackText}
                        </div>
                    ) : (
                        <p className="text-white/40 text-xs font-medium">초록색 Go 신호가 나오면 화면 아무 곳이나 빠르게 클릭하세요.</p>
                    )}
                </div>
            </div>
        );
    };

    if (isInline) {
        return (
            <div className="bg-white dark:bg-gray-900 rounded-2xl w-full">
                {renderContent()}
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden overflow-y-auto">
                {renderContent()}
            </div>
        </div>
    );
};

export default CognitivePerformanceAssessment;
