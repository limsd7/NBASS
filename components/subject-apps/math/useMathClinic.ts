import React, { useState, useEffect, useRef } from 'react';
import { StudentInfo, AIModelConfig, BankQuestion, TrapType, TrapDnaStats } from '../../../types';
import QuestionBankService from '../../../services/questionBankService';
import DatabaseService from '../../../services/database';

export type MathTabKey = 'drill' | 'cognitive' | 'bank' | 'trapDna';
export type MathBankFilter = 'all' | 'unsolved' | 'failed' | 'correct';

export interface MathClinicController {
    student: StudentInfo;
    currentGrade: number;
    targetGrade: number;
    initialStrategyTag: string;

    activeTab: MathTabKey;
    setActiveTab: React.Dispatch<React.SetStateAction<MathTabKey>>;

    // 실전 1분 준킬러 드릴
    currentDrill: BankQuestion | null;
    isLoadingDrill: boolean;
    selectedOption: number | null;
    setSelectedOption: React.Dispatch<React.SetStateAction<number | null>>;
    isSubmitted: boolean;
    feedbackResult: { isCorrect: boolean; fatigueNote: string } | null;
    solveSeconds: number;

    // 30초 인지 계산 & 줄맞춤 훈련
    cognitiveDrill: BankQuestion | null;
    leftColumnNote: string;
    setLeftColumnNote: React.Dispatch<React.SetStateAction<string>>;
    rightColumnNote: string;
    setRightColumnNote: React.Dispatch<React.SetStateAction<string>>;
    cognitiveSecondsLeft: number;
    isPassageBlinded: boolean;
    setIsPassageBlinded: React.Dispatch<React.SetStateAction<boolean>>;
    cognitiveSelectedOption: number | null;
    setCognitiveSelectedOption: React.Dispatch<React.SetStateAction<number | null>>;
    cognitiveSubmitted: boolean;

    // 문제은행
    bankList: BankQuestion[];
    bankFilter: MathBankFilter;
    setBankFilter: React.Dispatch<React.SetStateAction<MathBankFilter>>;
    isLoadingBank: boolean;

    // 함정 & 계산실수 DNA
    trapDna: TrapDnaStats | null;

    // 인쇄
    isPrinting: boolean;

    // 파생 값
    filteredBankList: BankQuestion[];
    getTrapLabel: (trap: TrapType) => string;

    // 핸들러
    refreshBankList: () => Promise<void>;
    refreshTrapDna: () => Promise<void>;
    loadOrCreateDrill: () => Promise<void>;
    loadOrCreateCognitiveDrill: () => Promise<void>;
    handleSubmitAnswer: () => Promise<void>;
    handleGenerateTwin: () => Promise<void>;
    handleCognitiveSubmit: () => Promise<void>;
    handleSelectBankQuestion: (q: BankQuestion) => void;
    handleDeleteQuestion: (id: string, e: React.MouseEvent) => Promise<void>;
    handlePrintExam: () => void;
}

export const useMathClinic = (
    student: StudentInfo,
    aiConfig: AIModelConfig | null | undefined,
    initialStrategyTag: string,
    initialStrategyType: 'grade_strategy' | 'cognitive_tip',
    currentGrade: number,
    targetGrade: number
): MathClinicController => {
    // 탭 상태: drill (1분 준킬러 드릴), cognitive (30초 인지 계산 줄맞춤), bank (문제은행), trapDna (계산실수 DNA)
    const [activeTab, setActiveTab] = useState<MathTabKey>('drill');

    // 실전 1분 준킬러 드릴 상태
    const [currentDrill, setCurrentDrill] = useState<BankQuestion | null>(null);
    const [isLoadingDrill, setIsLoadingDrill] = useState<boolean>(false);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
    const [feedbackResult, setFeedbackResult] = useState<{ isCorrect: boolean; fatigueNote: string } | null>(null);
    const [solveSeconds, setSolveSeconds] = useState<number>(0);
    const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // 30초 인지 계산 & 줄맞춤 훈련 상태
    const [cognitiveDrill, setCognitiveDrill] = useState<BankQuestion | null>(null);
    const [leftColumnNote, setLeftColumnNote] = useState<string>('');
    const [rightColumnNote, setRightColumnNote] = useState<string>('');
    const [cognitiveSecondsLeft, setCognitiveSecondsLeft] = useState<number>(30);
    const [isPassageBlinded, setIsPassageBlinded] = useState<boolean>(false);
    const [cognitiveSelectedOption, setCognitiveSelectedOption] = useState<number | null>(null);
    const [cognitiveSubmitted, setCognitiveSubmitted] = useState<boolean>(false);
    const cognitiveTimerRef = useRef<NodeJS.Timeout | null>(null);

    // 문제은행 상태
    const [bankList, setBankList] = useState<BankQuestion[]>([]);
    const [bankFilter, setBankFilter] = useState<MathBankFilter>('all');
    const [isLoadingBank, setIsLoadingBank] = useState<boolean>(false);

    // 함정 & 계산실수 DNA 상태
    const [trapDna, setTrapDna] = useState<TrapDnaStats | null>(null);

    // 인쇄 모드 상태
    const [isPrinting, setIsPrinting] = useState<boolean>(false);

    // 최초 로드 시 초기 전략에 따라 문제 생성/불러오기
    useEffect(() => {
        if (initialStrategyType === 'cognitive_tip') {
            setActiveTab('cognitive');
            loadOrCreateCognitiveDrill();
        } else {
            setActiveTab('drill');
            loadOrCreateDrill();
        }
        refreshBankList();
        refreshTrapDna();
    }, [initialStrategyTag, initialStrategyType]);

    // 타이머 작동
    useEffect(() => {
        if (isTimerRunning) {
            timerRef.current = setInterval(() => {
                setSolveSeconds(prev => prev + 1);
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isTimerRunning]);

    // 30초 인지 계산 줄맞춤 타이머
    useEffect(() => {
        if (activeTab === 'cognitive' && cognitiveDrill && !isPassageBlinded && !cognitiveSubmitted) {
            cognitiveTimerRef.current = setInterval(() => {
                setCognitiveSecondsLeft(prev => {
                    if (prev <= 1) {
                        setIsPassageBlinded(true);
                        if (cognitiveTimerRef.current) clearInterval(cognitiveTimerRef.current);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            if (cognitiveTimerRef.current) clearInterval(cognitiveTimerRef.current);
        }
        return () => {
            if (cognitiveTimerRef.current) clearInterval(cognitiveTimerRef.current);
        };
    }, [activeTab, cognitiveDrill, isPassageBlinded, cognitiveSubmitted]);

    // 문제은행 목록 갱신
    const refreshBankList = async () => {
        setIsLoadingBank(true);
        try {
            const list = await DatabaseService.getBankQuestions({ studentId: student.id, subjectId: 'math' });
            setBankList(list);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoadingBank(false);
        }
    };

    // 함정 DNA 통계 갱신
    const refreshTrapDna = async () => {
        try {
            const stats = await QuestionBankService.getStudentTrapDna(student.id, 'math');
            setTrapDna(stats);
        } catch (e) {
            console.error(e);
        }
    };

    // 1분 준킬러 실전 드릴 문제 로드 또는 AI 생성
    const loadOrCreateDrill = async () => {
        setIsLoadingDrill(true);
        setSelectedOption(null);
        setIsSubmitted(false);
        setFeedbackResult(null);
        setSolveSeconds(0);
        setIsTimerRunning(false);

        try {
            const question = await QuestionBankService.generateDrill({
                studentId: student.id,
                subjectId: 'math',
                targetGrade,
                currentGrade,
                strategyType: 'grade_strategy',
                strategyTag: initialStrategyTag,
                aiConfig
            });
            setCurrentDrill(question);
            setIsTimerRunning(true);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoadingDrill(false);
            refreshBankList();
        }
    };

    // 30초 인지 계산 줄맞춤 드릴 로드 또는 AI 생성
    const loadOrCreateCognitiveDrill = async () => {
        setIsLoadingDrill(true);
        setLeftColumnNote('');
        setRightColumnNote('');
        setCognitiveSecondsLeft(30);
        setIsPassageBlinded(false);
        setCognitiveSelectedOption(null);
        setCognitiveSubmitted(false);

        try {
            const question = await QuestionBankService.generateDrill({
                studentId: student.id,
                subjectId: 'math',
                targetGrade,
                currentGrade,
                strategyType: 'cognitive_tip',
                strategyTag: initialStrategyTag.includes('계산') || initialStrategyTag.includes('줄맞춤')
                    ? initialStrategyTag
                    : '계산 실수 방지를 위해 풀이 공간을 세로 2단으로 나누고, 단계별 수식을 줄맞춤 정렬하여 작성',
                aiConfig
            });
            setCognitiveDrill(question);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoadingDrill(false);
            refreshBankList();
        }
    };

    // 1분 실전 준킬러 정답 제출
    const handleSubmitAnswer = async () => {
        if (selectedOption === null || !currentDrill || isSubmitted) return;
        setIsTimerRunning(false);

        try {
            const result = await QuestionBankService.submitAnswer({
                questionId: currentDrill.id,
                chosenIndex: selectedOption,
                solveDurationSec: solveSeconds
            });
            setIsSubmitted(true);
            setFeedbackResult(result);
            setCurrentDrill(result.updatedQuestion);
            refreshBankList();
            refreshTrapDna();
        } catch (e) {
            console.error(e);
        }
    };

    // [🔄 쌍둥이 유사 문제 1개 더] 즉시 생성
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
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoadingDrill(false);
            refreshBankList();
        }
    };

    // 30초 인지 계산 줄맞춤 정답 제출
    const handleCognitiveSubmit = async () => {
        if (cognitiveSelectedOption === null || !cognitiveDrill || cognitiveSubmitted) return;

        try {
            const combinedNotes = [leftColumnNote ? `[좌측단: 식분해] ${leftColumnNote}` : '', rightColumnNote ? `[우측단: 대입연산] ${rightColumnNote}` : ''].filter(Boolean);
            const result = await QuestionBankService.submitAnswer({
                questionId: cognitiveDrill.id,
                chosenIndex: cognitiveSelectedOption,
                solveDurationSec: 30 - cognitiveSecondsLeft,
                memoryKeywords: combinedNotes
            });
            setCognitiveSubmitted(true);
            setFeedbackResult(result);
            setCognitiveDrill(result.updatedQuestion);
            refreshBankList();
            refreshTrapDna();
        } catch (e) {
            console.error(e);
        }
    };

    // 문제은행에서 특정 문제 다시 풀기
    const handleSelectBankQuestion = (q: BankQuestion) => {
        if (q.strategyType === 'cognitive_tip') {
            setCognitiveDrill(q);
            setActiveTab('cognitive');
            setIsPassageBlinded(false);
            setCognitiveSubmitted(false);
            setCognitiveSelectedOption(q.chosenIndex ?? null);
            setCognitiveSecondsLeft(30);
        } else {
            setCurrentDrill(q);
            setActiveTab('drill');
            setIsSubmitted(false);
            setSelectedOption(q.chosenIndex ?? null);
            setSolveSeconds(0);
            setIsTimerRunning(true);
            setFeedbackResult(null);
        }
    };

    // 문제은행 문제 삭제
    const handleDeleteQuestion = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('이 문제를 문제은행에서 삭제하시겠습니까?')) return;
        try {
            await DatabaseService.deleteBankQuestion(id);
            refreshBankList();
            refreshTrapDna();
        } catch (err) {
            console.error(err);
        }
    };

    // A4 클리닉 시험지 인쇄
    const handlePrintExam = () => {
        setIsPrinting(true);
        setTimeout(() => {
            window.print();
            setIsPrinting(false);
        }, 200);
    };

    // 문제은행 필터링 목록
    const filteredBankList = bankList.filter(q => {
        if (bankFilter === 'unsolved') return !q.isSolved;
        if (bankFilter === 'failed') return q.isSolved && q.isCorrect === false;
        if (bankFilter === 'correct') return q.isSolved && q.isCorrect === true;
        return true;
    });

    // 함정 라벨 한글 변환
    const getTrapLabel = (trap: TrapType) => {
        const labels: Record<string, string> = {
            sign_flip: '부호/이항 실수 (Sign Flip)',
            boundary_value: '경계값/등호 누락 (Boundary Trap)',
            condition_omission: '발문 조건 [가],[나] 간과 (Omission Trap)',
            calc_overload: '계산 과부하 / 비효율 연산 (Calc Overload)',
            graph_misassumption: '그래프 개형 임의 단정 (Graph Trap)',
            causal_distortion: '인과 왜곡',
            subject_object_inversion: '주객 전도',
            exaggeration: '과장·비약',
            unsupported_inference: '자의적 억측',
            fact_mismatch: '단순 계산/사실 불일치'
        };
        return labels[trap] || trap;
    };

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
        leftColumnNote,
        setLeftColumnNote,
        rightColumnNote,
        setRightColumnNote,
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

        isPrinting,

        filteredBankList,
        getTrapLabel,

        refreshBankList,
        refreshTrapDna,
        loadOrCreateDrill,
        loadOrCreateCognitiveDrill,
        handleSubmitAnswer,
        handleGenerateTwin,
        handleCognitiveSubmit,
        handleSelectBankQuestion,
        handleDeleteQuestion,
        handlePrintExam
    };
};