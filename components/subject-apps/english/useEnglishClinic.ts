import React, { useState, useEffect, useRef } from 'react';
import { StudentInfo, AIModelConfig, BankQuestion, TrapType, TrapDnaStats } from '../../../types';
import QuestionBankService from '../../../services/questionBankService';
import DatabaseService from '../../../services/database';

export type EnglishTabKey = 'drill' | 'cognitive' | 'bank' | 'trapDna';
export type EnglishBankFilter = 'all' | 'unsolved' | 'failed' | 'correct';

export interface EnglishTrapMeta {
    label: string;
    desc: string;
    icon: string;
}

export interface EnglishClinicController {
    student: StudentInfo;
    currentGrade: number;
    targetGrade: number;
    initialStrategyTag: string;

    activeTab: EnglishTabKey;
    setActiveTab: React.Dispatch<React.SetStateAction<EnglishTabKey>>;

    // 실전 1분 킬러 드릴
    currentDrill: BankQuestion | null;
    isLoadingDrill: boolean;
    selectedOption: number | null;
    setSelectedOption: React.Dispatch<React.SetStateAction<number | null>>;
    isSubmitted: boolean;
    feedbackResult: { isCorrect: boolean; fatigueNote: string } | null;
    solveSeconds: number;

    // 30초 인지 시그널 스캐너
    cognitiveDrill: BankQuestion | null;
    keyword1: string;
    setKeyword1: React.Dispatch<React.SetStateAction<string>>;
    keyword2: string;
    setKeyword2: React.Dispatch<React.SetStateAction<string>>;
    keyword3: string;
    setKeyword3: React.Dispatch<React.SetStateAction<string>>;
    cognitiveSecondsLeft: number;
    isPassageBlinded: boolean;
    setIsPassageBlinded: React.Dispatch<React.SetStateAction<boolean>>;
    cognitiveSelectedOption: number | null;
    setCognitiveSelectedOption: React.Dispatch<React.SetStateAction<number | null>>;
    cognitiveSubmitted: boolean;

    // 문제은행
    bankList: BankQuestion[];
    bankFilter: EnglishBankFilter;
    setBankFilter: React.Dispatch<React.SetStateAction<EnglishBankFilter>>;
    isLoadingBank: boolean;

    // 함정 & 오답 DNA
    trapDna: TrapDnaStats | null;

    // 인쇄
    isPrinting: boolean;

    // 상수
    ENGLISH_TRAP_META: Record<string, EnglishTrapMeta>;

    // 핸들러
    loadOrCreateDrill: (forceNew?: boolean, trapOverride?: TrapType) => Promise<void>;
    loadOrCreateCognitiveDrill: () => Promise<void>;
    refreshBankList: () => Promise<void>;
    refreshTrapDna: () => Promise<void>;
    handleSubmitDrill: () => Promise<void>;
    handleCognitiveSubmit: () => Promise<void>;
    handleCreateTwin: () => Promise<void>;
    handleReSolveFromBank: (q: BankQuestion) => void;
    handleDeleteFromBank: (id: string) => Promise<void>;
    handleTriggerPrint: () => void;
}

export const useEnglishClinic = (
    student: StudentInfo,
    aiConfig: AIModelConfig | null | undefined,
    initialStrategyTag: string,
    initialStrategyType: 'grade_strategy' | 'cognitive_tip',
    currentGrade: number,
    targetGrade: number
): EnglishClinicController => {
    // 탭 상태: drill (1분 킬러 실전 드릴), cognitive (30초 시그널 스캐너), bank (문제은행), trapDna (매력적 오답 DNA)
    const [activeTab, setActiveTab] = useState<EnglishTabKey>('drill');

    // 실전 1분 킬러 드릴 상태
    const [currentDrill, setCurrentDrill] = useState<BankQuestion | null>(null);
    const [isLoadingDrill, setIsLoadingDrill] = useState<boolean>(false);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
    const [feedbackResult, setFeedbackResult] = useState<{ isCorrect: boolean; fatigueNote: string } | null>(null);
    const [solveSeconds, setSolveSeconds] = useState<number>(0);
    const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // 30초 인지 시그널 스캐너 & 메모 훈련 상태
    const [cognitiveDrill, setCognitiveDrill] = useState<BankQuestion | null>(null);
    const [keyword1, setKeyword1] = useState<string>('');
    const [keyword2, setKeyword2] = useState<string>('');
    const [keyword3, setKeyword3] = useState<string>('');
    const [cognitiveSecondsLeft, setCognitiveSecondsLeft] = useState<number>(30);
    const [isPassageBlinded, setIsPassageBlinded] = useState<boolean>(false);
    const [cognitiveSelectedOption, setCognitiveSelectedOption] = useState<number | null>(null);
    const [cognitiveSubmitted, setCognitiveSubmitted] = useState<boolean>(false);
    const cognitiveTimerRef = useRef<NodeJS.Timeout | null>(null);

    // 문제은행 상태
    const [bankList, setBankList] = useState<BankQuestion[]>([]);
    const [bankFilter, setBankFilter] = useState<EnglishBankFilter>('all');
    const [isLoadingBank, setIsLoadingBank] = useState<boolean>(false);

    // 함정 & 오답 DNA 상태
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

    // 30초 카운트다운 타이머 작동
    useEffect(() => {
        if (activeTab === 'cognitive' && cognitiveSecondsLeft > 0 && !isPassageBlinded) {
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
        }
        return () => {
            if (cognitiveTimerRef.current) clearInterval(cognitiveTimerRef.current);
        };
    }, [activeTab, cognitiveSecondsLeft, isPassageBlinded]);

    // 문제 로드 또는 신규 생성 (Tab 1)
    const loadOrCreateDrill = async (forceNew: boolean = false, trapOverride?: TrapType) => {
        setIsLoadingDrill(true);
        setSelectedOption(null);
        setIsSubmitted(false);
        setFeedbackResult(null);
        setSolveSeconds(0);
        setIsTimerRunning(false);

        try {
            if (!forceNew) {
                // 기존 미풀이 영어 문제가 있으면 먼저 제공
                const unsolved = await DatabaseService.getBankQuestions({
                    studentId: student.id,
                    subjectId: 'english',
                    isSolved: false,
                    strategyType: 'grade_strategy'
                });
                if (unsolved.length > 0) {
                    setCurrentDrill(unsolved[0]);
                    setIsTimerRunning(true);
                    setIsLoadingDrill(false);
                    return;
                }
            }

            // 신규 Gemini 3.8 Flash 동적 생성
            const newQuestion = await QuestionBankService.generateDrill({
                studentId: student.id,
                subjectId: 'english',
                targetGrade,
                currentGrade,
                strategyType: 'grade_strategy',
                strategyTag: initialStrategyTag,
                aiConfig,
                specificTrapType: trapOverride
            });

            setCurrentDrill(newQuestion);
            setIsTimerRunning(true);
            await refreshBankList();
        } catch (e) {
            console.error('[EnglishClinic] 문제 로드 실패:', e);
        } finally {
            setIsLoadingDrill(false);
        }
    };

    // 30초 인지 시그널 문제 로드 또는 생성 (Tab 2)
    const loadOrCreateCognitiveDrill = async () => {
        setCognitiveSecondsLeft(30);
        setIsPassageBlinded(false);
        setKeyword1('');
        setKeyword2('');
        setKeyword3('');
        setCognitiveSelectedOption(null);
        setCognitiveSubmitted(false);

        try {
            const q = await QuestionBankService.generateDrill({
                studentId: student.id,
                subjectId: 'english',
                targetGrade,
                currentGrade,
                strategyType: 'cognitive_tip',
                strategyTag: '순서 배열·문장 삽입 지시어·관사 단서 스캐너 & 어휘 패러프레이징',
                aiConfig
            });
            setCognitiveDrill(q);
        } catch (e) {
            console.error('[EnglishClinic] 인지 시그널 문제 로드 실패:', e);
        }
    };

    // 문제은행 새로고침
    const refreshBankList = async () => {
        setIsLoadingBank(true);
        try {
            const list = await DatabaseService.getBankQuestions({
                studentId: student.id,
                subjectId: 'english'
            });
            setBankList(list);
        } finally {
            setIsLoadingBank(false);
        }
    };

    // 함정 DNA 통계 새로고침
    const refreshTrapDna = async () => {
        const stats = await QuestionBankService.getStudentTrapDna(student.id, 'english');
        setTrapDna(stats);
    };

    // 실전 드릴 정답 제출 (Tab 1)
    const handleSubmitDrill = async () => {
        if (selectedOption === null || !currentDrill || isSubmitted) return;
        setIsTimerRunning(false);

        try {
            const result = await QuestionBankService.submitAnswer({
                questionId: currentDrill.id,
                chosenIndex: selectedOption,
                solveDurationSec: solveSeconds
            });

            setFeedbackResult({
                isCorrect: result.isCorrect,
                fatigueNote: result.fatigueNote
            });
            setIsSubmitted(true);
            setCurrentDrill(result.updatedQuestion);

            await refreshBankList();
            await refreshTrapDna();
        } catch (e) {
            console.error('[EnglishClinic] 제출 실패:', e);
        }
    };

    // 30초 인지 시그널 정답 검증 제출 (Tab 2)
    const handleCognitiveSubmit = async () => {
        if (cognitiveSelectedOption === null || !cognitiveDrill || cognitiveSubmitted) return;
        const keywords = [keyword1, keyword2, keyword3].filter(k => k.trim().length > 0);

        try {
            const result = await QuestionBankService.submitAnswer({
                questionId: cognitiveDrill.id,
                chosenIndex: cognitiveSelectedOption,
                solveDurationSec: 30 - cognitiveSecondsLeft,
                memoryKeywords: keywords
            });

            setCognitiveSubmitted(true);
            setCognitiveDrill(result.updatedQuestion);
            await refreshBankList();
            await refreshTrapDna();
        } catch (e) {
            console.error('[EnglishClinic] 인지 제출 실패:', e);
        }
    };

    // 쌍둥이 문제 생성 (Tab 1 오답 복습용)
    const handleCreateTwin = async () => {
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
            await refreshBankList();
        } catch (e) {
            console.error('[EnglishClinic] 쌍둥이 문제 생성 실패:', e);
        } finally {
            setIsLoadingDrill(false);
        }
    };

    // 문제은행에서 특정 문제 재도전
    const handleReSolveFromBank = (q: BankQuestion) => {
        setCurrentDrill(q);
        setSelectedOption(null);
        setIsSubmitted(false);
        setFeedbackResult(null);
        setSolveSeconds(0);
        setIsTimerRunning(true);
        setActiveTab('drill');
    };

    // 문제은행 문제 삭제
    const handleDeleteFromBank = async (id: string) => {
        if (!window.confirm('이 문제를 문제은행에서 삭제하시겠습니까?')) return;
        await DatabaseService.deleteBankQuestion(id);
        await refreshBankList();
        await refreshTrapDna();
    };

    // 인쇄 다이얼로그 실행
    const handleTriggerPrint = () => {
        setIsPrinting(true);
        setTimeout(() => {
            window.print();
            setIsPrinting(false);
        }, 500);
    };

    // 영어 5대 함정 라벨 및 설명 매핑
    const ENGLISH_TRAP_META: Record<string, EnglishTrapMeta> = {
        word_match_distortion: {
            label: '단어 일치 왜곡형 (Word-Match Distortion)',
            desc: '지문의 단어를 그대로 재활용하여 그럴듯하게 유혹하지만 전체 요지와 상충되는 31~34번 전형적 킬러 선지',
            icon: '🪤'
        },
        discourse_signpost_miss: {
            label: '지시어·연결사 단서 간과 (Discourse Signpost Miss)',
            desc: 'However, In contrast, Such, This 등 논리적 전환점이나 지시 대명사 단서를 놓쳐 순서·삽입 오판',
            icon: '🧭'
        },
        scope_overgeneralization: {
            label: '지나친 일반화·비약 (Scope Overgeneralization)',
            desc: 'All, Always, Completely, Solely 등 본문에서 허용하지 않은 극단적 절대 수식어로 범위를 확대한 오답',
            icon: '🔍'
        },
        opposite_causality: {
            label: '인과 역전·주객 전도 (Opposite Causality)',
            desc: '원인과 결과, 행위자와 대상의 관계를 교묘하게 반대로 뒤집어 놓은 선지',
            icon: '🔄'
        },
        irrelevant_theme: {
            label: '주제 이탈·부분적 참 (Irrelevant Theme)',
            desc: '상식적으로는 맞거나 본문 세부 내용과 일부 겹치지만 글 전체의 대의 및 요지에서 벗어난 선지',
            icon: '❌'
        }
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
        keyword1,
        setKeyword1,
        keyword2,
        setKeyword2,
        keyword3,
        setKeyword3,
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

        ENGLISH_TRAP_META,

        loadOrCreateDrill,
        loadOrCreateCognitiveDrill,
        refreshBankList,
        refreshTrapDna,
        handleSubmitDrill,
        handleCognitiveSubmit,
        handleCreateTwin,
        handleReSolveFromBank,
        handleDeleteFromBank,
        handleTriggerPrint
    };
};