import React, { useState, useEffect, useRef } from 'react';
import { StudentInfo, AIModelConfig, BankQuestion, TrapType, TrapDnaStats } from '../../../types';
import QuestionBankService from '../../../services/questionBankService';
import DatabaseService from '../../../services/database';

export type KoreanTabKey = 'drill' | 'cognitive' | 'bank' | 'trapDna';
export type KoreanBankFilter = 'all' | 'unsolved' | 'failed' | 'correct';

export interface KoreanClinicController {
    student: StudentInfo;
    currentGrade: number;
    targetGrade: number;
    initialStrategyTag: string;

    activeTab: KoreanTabKey;
    setActiveTab: React.Dispatch<React.SetStateAction<KoreanTabKey>>;

    // 실전 1분 문제
    currentDrill: BankQuestion | null;
    isLoadingDrill: boolean;
    selectedOption: number | null;
    setSelectedOption: React.Dispatch<React.SetStateAction<number | null>>;
    isSubmitted: boolean;
    feedbackResult: { isCorrect: boolean; fatigueNote: string } | null;
    solveSeconds: number;

    // 30초 인지 메모 훈련
    cognitiveDrill: BankQuestion | null;
    memoryInputs: string[];
    setMemoryInputs: React.Dispatch<React.SetStateAction<string[]>>;
    cognitiveSecondsLeft: number;
    isPassageBlinded: boolean;
    setIsPassageBlinded: React.Dispatch<React.SetStateAction<boolean>>;
    cognitiveSelectedOption: number | null;
    setCognitiveSelectedOption: React.Dispatch<React.SetStateAction<number | null>>;
    cognitiveSubmitted: boolean;

    // 문제은행
    bankList: BankQuestion[];
    bankFilter: KoreanBankFilter;
    setBankFilter: React.Dispatch<React.SetStateAction<KoreanBankFilter>>;
    isLoadingBank: boolean;

    // 함정 DNA
    trapDna: TrapDnaStats | null;

    // 인쇄
    isPrinting: boolean;

    // 파생 값
    filteredBankList: BankQuestion[];
    getTrapLabel: (trap: TrapType) => string;

    // 핸들러
    loadBankQuestions: () => Promise<void>;
    loadTrapDna: () => Promise<void>;
    loadOrCreateDrill: (strategyTag?: string) => Promise<void>;
    loadOrCreateCognitiveDrill: () => Promise<void>;
    handleSubmitDrill: () => Promise<void>;
    handleGenerateTwin: () => Promise<void>;
    handleCognitiveSubmit: () => Promise<void>;
    handleSelectFromBank: (q: BankQuestion) => void;
    handlePrintExam: () => void;
}

export const useKoreanClinic = (
    student: StudentInfo,
    aiConfig: AIModelConfig | null | undefined,
    initialStrategyTag: string,
    initialStrategyType: 'grade_strategy' | 'cognitive_tip',
    currentGrade: number,
    targetGrade: number
): KoreanClinicController => {
    // 탭 상태: drill (1분 실전 문제), cognitive (30초 인지 메모), bank (문제은행), trapDna (함정 DNA), print (A4 인쇄)
    const [activeTab, setActiveTab] = useState<KoreanTabKey>('drill');

    // 실전 1분 문제 상태
    const [currentDrill, setCurrentDrill] = useState<BankQuestion | null>(null);
    const [isLoadingDrill, setIsLoadingDrill] = useState<boolean>(false);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
    const [feedbackResult, setFeedbackResult] = useState<{ isCorrect: boolean; fatigueNote: string } | null>(null);
    const [solveSeconds, setSolveSeconds] = useState<number>(0);
    const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // 30초 인지 메모 훈련 상태
    const [cognitiveDrill, setCognitiveDrill] = useState<BankQuestion | null>(null);
    const [memoryInputs, setMemoryInputs] = useState<string[]>(['', '', '']);
    const [cognitiveSecondsLeft, setCognitiveSecondsLeft] = useState<number>(30);
    const [isPassageBlinded, setIsPassageBlinded] = useState<boolean>(false);
    const [cognitiveSelectedOption, setCognitiveSelectedOption] = useState<number | null>(null);
    const [cognitiveSubmitted, setCognitiveSubmitted] = useState<boolean>(false);
    const cognitiveTimerRef = useRef<NodeJS.Timeout | null>(null);

    // 문제은행 상태
    const [bankList, setBankList] = useState<BankQuestion[]>([]);
    const [bankFilter, setBankFilter] = useState<KoreanBankFilter>('all');
    const [isLoadingBank, setIsLoadingBank] = useState<boolean>(false);

    // 함정 DNA 상태
    const [trapDna, setTrapDna] = useState<TrapDnaStats | null>(null);

    // 인쇄 모드 상태
    const [isPrinting, setIsPrinting] = useState<boolean>(false);

    // 최초 로드 시 초기 전략에 따라 문제 생성/불러오기
    useEffect(() => {
        if (initialStrategyType === 'cognitive_tip') {
            setActiveTab('cognitive');
            loadOrCreateCognitiveDrill();
        } else {
            loadOrCreateDrill(initialStrategyTag);
        }
        loadBankQuestions();
        loadTrapDna();
    }, []);

    // 타이머 로직 (실전 1분 문제)
    useEffect(() => {
        if (isTimerRunning) {
            timerRef.current = setInterval(() => {
                setSolveSeconds(prev => prev + 1);
            }, 1000);
        } else if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isTimerRunning]);

    // 카운트다운 타이머 로직 (30초 인지 메모)
    useEffect(() => {
        if (activeTab === 'cognitive' && cognitiveSecondsLeft > 0 && !isPassageBlinded) {
            cognitiveTimerRef.current = setInterval(() => {
                setCognitiveSecondsLeft(prev => {
                    if (prev <= 1) {
                        setIsPassageBlinded(true); // 30초 종료 시 자동 블라인드
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else if (cognitiveTimerRef.current) {
            clearInterval(cognitiveTimerRef.current);
        }
        return () => {
            if (cognitiveTimerRef.current) clearInterval(cognitiveTimerRef.current);
        };
    }, [activeTab, cognitiveSecondsLeft, isPassageBlinded]);

    // 문제은행 로드
    const loadBankQuestions = async () => {
        setIsLoadingBank(true);
        try {
            const list = await DatabaseService.getBankQuestions({ studentId: student.id, subjectId: 'korean' });
            setBankList(list);
        } catch (err) {
            console.error('문제은행 로드 실패:', err);
        } finally {
            setIsLoadingBank(false);
        }
    };

    // 함정 DNA 로드
    const loadTrapDna = async () => {
        try {
            const stats = await QuestionBankService.getStudentTrapDna(student.id, 'korean');
            setTrapDna(stats);
        } catch (err) {
            console.error('함정 DNA 로드 실패:', err);
        }
    };

    // 실전 1분 문제 불러오기 또는 AI 신규 생성
    const loadOrCreateDrill = async (strategyTag: string = initialStrategyTag) => {
        setIsLoadingDrill(true);
        setSelectedOption(null);
        setIsSubmitted(false);
        setFeedbackResult(null);
        setSolveSeconds(0);
        setIsTimerRunning(false);

        try {
            // 1. 문제은행에서 해당 전략의 미풀이 문제가 있는지 우선 확인 (0초 로딩)
            const existing = await DatabaseService.getBankQuestions({
                studentId: student.id,
                subjectId: 'korean',
                strategyType: 'grade_strategy',
                strategyTag,
                isSolved: false
            });

            if (existing.length > 0) {
                setCurrentDrill(existing[0]);
                setIsTimerRunning(true);
            } else {
                // 2. 없으면 Gemini Flash로 실시간 생성 (중복 주제 자동 제외)
                const newDrill = await QuestionBankService.generateDrill({
                    studentId: student.id,
                    subjectId: 'korean',
                    targetGrade,
                    currentGrade,
                    strategyType: 'grade_strategy',
                    strategyTag,
                    aiConfig
                });
                setCurrentDrill(newDrill);
                setIsTimerRunning(true);
            }
            loadBankQuestions();
        } catch (err) {
            console.error('문제 생성 오류:', err);
        } finally {
            setIsLoadingDrill(false);
        }
    };

    // 30초 인지 메모 훈련 불러오기 또는 생성
    const loadOrCreateCognitiveDrill = async () => {
        setIsLoadingDrill(true);
        setMemoryInputs(['', '', '']);
        setCognitiveSecondsLeft(30);
        setIsPassageBlinded(false);
        setCognitiveSelectedOption(null);
        setCognitiveSubmitted(false);

        try {
            const drill = await QuestionBankService.generateDrill({
                studentId: student.id,
                subjectId: 'korean',
                targetGrade,
                currentGrade,
                strategyType: 'cognitive_tip',
                strategyTag: '여백에 핵심 키워드 3개 메모하며 시각적 주의 집중',
                aiConfig
            });
            setCognitiveDrill(drill);
            loadBankQuestions();
        } catch (err) {
            console.error('인지 훈련 생성 오류:', err);
        } finally {
            setIsLoadingDrill(false);
        }
    };

    // 1분 실전 문제 정답 제출
    const handleSubmitDrill = async () => {
        if (selectedOption === null || !currentDrill) return;
        setIsTimerRunning(false);

        try {
            const res = await QuestionBankService.submitAnswer({
                questionId: currentDrill.id,
                chosenIndex: selectedOption,
                solveDurationSec: solveSeconds
            });
            setFeedbackResult({ isCorrect: res.isCorrect, fatigueNote: res.fatigueNote });
            setIsSubmitted(true);
            setCurrentDrill(res.updatedQuestion);
            loadBankQuestions();
            loadTrapDna();
        } catch (err) {
            console.error('답안 제출 오류:', err);
        }
    };

    // [🔄 쌍둥이 유사 문제 1개 더 풀기]
    const handleGenerateTwin = async () => {
        if (!currentDrill) return;
        setIsLoadingDrill(true);
        setSelectedOption(null);
        setIsSubmitted(false);
        setFeedbackResult(null);
        setSolveSeconds(0);
        setIsTimerRunning(false);

        try {
            const twin = await QuestionBankService.generateTwinDrill(currentDrill, aiConfig);
            setCurrentDrill(twin);
            setIsTimerRunning(true);
            loadBankQuestions();
        } catch (err) {
            console.error('쌍둥이 문제 생성 실패:', err);
        } finally {
            setIsLoadingDrill(false);
        }
    };

    // 30초 인지 메모 훈련 정답 제출
    const handleCognitiveSubmit = async () => {
        if (cognitiveSelectedOption === null || !cognitiveDrill) return;
        try {
            await QuestionBankService.submitAnswer({
                questionId: cognitiveDrill.id,
                chosenIndex: cognitiveSelectedOption,
                solveDurationSec: 30 - cognitiveSecondsLeft,
                memoryKeywords: memoryInputs.filter(Boolean)
            });
            setCognitiveSubmitted(true);
            loadBankQuestions();
        } catch (err) {
            console.error('인지 훈련 제출 실패:', err);
        }
    };

    // 문제은행에서 특정 문제 선택하여 풀기
    const handleSelectFromBank = (q: BankQuestion) => {
        if (q.strategyType === 'cognitive_tip') {
            setCognitiveDrill(q);
            setMemoryInputs(q.memoryKeywords || ['', '', '']);
            setIsPassageBlinded(false);
            setCognitiveSecondsLeft(30);
            setCognitiveSubmitted(false);
            setCognitiveSelectedOption(null);
            setActiveTab('cognitive');
        } else {
            setCurrentDrill(q);
            setSelectedOption(q.chosenIndex !== undefined ? q.chosenIndex : null);
            setIsSubmitted(q.isSolved);
            setSolveSeconds(q.solveDurationSec || 0);
            setFeedbackResult(q.isSolved ? {
                isCorrect: !!q.isCorrect,
                fatigueNote: q.cognitiveFatigueNote || ''
            } : null);
            setIsTimerRunning(!q.isSolved);
            setActiveTab('drill');
        }
    };

    // A4 원클릭 인쇄 실행
    const handlePrintExam = () => {
        window.print();
    };

    // 함정 라벨 한글 매핑
    const getTrapLabel = (trap: TrapType) => {
        switch (trap) {
            case 'causal_distortion': return '인과 왜곡 (시간선후 ➔ 인과로 왜곡)';
            case 'subject_object_inversion': return '주객 전도 / 범주 오류';
            case 'exaggeration': return '과장·확대해석 / 침소봉대';
            case 'unsupported_inference': return '자의적 억측 / 본문 무관';
            case 'fact_mismatch': return '단순 사실 불일치';
            default: return trap;
        }
    };

    // 문제은행 필터링 목록
    const filteredBankList = bankList.filter(q => {
        if (bankFilter === 'unsolved') return !q.isSolved;
        if (bankFilter === 'failed') return q.isSolved && q.isCorrect === false;
        if (bankFilter === 'correct') return q.isSolved && q.isCorrect === true;
        return true;
    });

    return {
        student,
        currentGrade,
        targetGrade,
        initialStrategyTag,

        activeTab,
        setActiveTab,

        currentDrill,
        isLoadingDrill,
        selectedOption,
        setSelectedOption,
        isSubmitted,
        feedbackResult,
        solveSeconds,

        cognitiveDrill,
        memoryInputs,
        setMemoryInputs,
        cognitiveSecondsLeft,
        isPassageBlinded,
        setIsPassageBlinded,
        cognitiveSelectedOption,
        setCognitiveSelectedOption,
        cognitiveSubmitted,

        bankList,
        bankFilter,
        setBankFilter,
        isLoadingBank,

        trapDna,

        isPrinting: isPrinting,

        filteredBankList,
        getTrapLabel,

        loadBankQuestions,
        loadTrapDna,
        loadOrCreateDrill,
        loadOrCreateCognitiveDrill,
        handleSubmitDrill,
        handleGenerateTwin,
        handleCognitiveSubmit,
        handleSelectFromBank,
        handlePrintExam
    };
};