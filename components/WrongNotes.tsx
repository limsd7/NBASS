import React, { useState, useMemo, useEffect, useRef } from "react";
import { WrongNote, WrongNoteErrorType, WrongNoteReviewMethod, CareType } from "../types";
import {
    Plus, CheckCircle2, AlertCircle, BookOpen, Search, Trash2,
    Check, X, Sparkles, RotateCcw, Timer, Camera, Upload,
    Loader2, Image as ImageIcon, Clipboard, Eye, EyeOff, RefreshCw, ZoomIn, BarChart3, ChevronDown
} from "lucide-react";
import {
    Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis
} from "recharts";
import {
    analyzeWrongNotesAndCareType,
    ERROR_TYPE_METAS,
    calculateNextReviewDate,
    todayLocalStr,
    checkReviewAnswer,
    buildRetentionSeries,
    DAILY_QUEUE_LIMIT
} from "../services/wrongNotePrescriptionEngine";
import {
    compressImageFile,
    scanWrongNoteWithAI,
    generateTwinProblemWithAI,
    TwinProblemResult
} from "../services/wrongNoteAIService";
import { ActiveRecallModal } from "./ActiveRecallModal";

interface WrongNotesProps {
    wrongNotes: WrongNote[];
    setWrongNotes: React.Dispatch<React.SetStateAction<WrongNote[]>>;
    careType?: CareType;
}

export function WrongNotes({ wrongNotes, setWrongNotes, careType = CareType.HEALTHY }: WrongNotesProps) {
    const [selectedSubject, setSelectedSubject] = useState<string>("전체");
    const [statusFilter, setStatusFilter] = useState<string>("all"); // all, today_due, unresolved, resolved
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [viewMode, setViewMode] = useState<"list" | "card">("list");
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    // Blind Recall Mode State (블라인드 가림막 인출 모드)
    const [isBlindMode, setIsBlindMode] = useState<boolean>(false);
    const [revealedCardIds, setRevealedCardIds] = useState<Set<string>>(new Set());

    // AI Twin Problem Modal State (쌍둥이 유사 변형 문제)
    const [twinModalNote, setTwinModalNote] = useState<WrongNote | null>(null);
    const [isGeneratingTwin, setIsGeneratingTwin] = useState<boolean>(false);
    const [twinProblemData, setTwinProblemData] = useState<TwinProblemResult | null>(null);
    const [isTwinAnswerRevealed, setIsTwinAnswerRevealed] = useState<boolean>(false);

    // Active Recall Modal State
    const [activeRecallSubject, setActiveRecallSubject] = useState<string | null>(null);

    // 복습 검증 모달 (재풀이 확인: 정답 입력 채점, 미인증 시 자기확인 기록)
    const [verifyNoteId, setVerifyNoteId] = useState<string | null>(null);
    const [verifyInput, setVerifyInput] = useState<string>("");
    const [verifyOutcome, setVerifyOutcome] = useState<'idle' | 'correct' | 'wrong'>('idle');

    // 백지 인출 세션 ↔ 복습 큐 연동 (과목별 최근 인출 기록, 검증 모달 판정 재료)
    interface RecallSession {
        subject: string;
        date: string;
        durationMinutes: number;
        scorePercent: number;
        keywords: string[];
    }
    const RECALL_SESSION_KEY = 'nbass_recall_sessions';
    const [recallSessions, setRecallSessions] = useState<RecallSession[]>(() => {
        try {
            const raw = JSON.parse(localStorage.getItem(RECALL_SESSION_KEY) || '[]');
            return Array.isArray(raw) ? raw.filter(s => s && typeof s.subject === 'string').slice(0, 50) : [];
        } catch { return []; }
    });
    const [recallNotice, setRecallNotice] = useState<{ subject: string; score: number; matched: number; total: number } | null>(null);

    // 오늘 우선 큐 접기/펼치기 + 망각곡선 차트 접기/펼치기
    const [showAllDue, setShowAllDue] = useState<boolean>(false);
    const [showRetentionChart, setShowRetentionChart] = useState<boolean>(true);

    // AI & Image Scanning State
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState<boolean>(false);
    const [scanStatusMessage, setScanStatusMessage] = useState<string>("");
    const [previewImageModal, setPreviewImageModal] = useState<string | null>(null);
    const [isDragOver, setIsDragOver] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form state
    const [subject, setSubject] = useState<string>("수학");
    const [questionTitle, setQuestionTitle] = useState<string>("");
    const [wrongAnswer, setWrongAnswer] = useState<string>("");
    const [correctAnswer, setCorrectAnswer] = useState<string>("");
    const [explanation, setExplanation] = useState<string>("");
    const [difficulty, setDifficulty] = useState<"상" | "중" | "하">("중");
    const [errorType, setErrorType] = useState<WrongNoteErrorType>("CONCEPT");
    const [metacognitiveNote, setMetacognitiveNote] = useState<{
        misconception: string;
        trapKeyword: string;
        actionRule: string;
    }>({ misconception: "", trapKeyword: "", actionRule: "" });

    const subjects = ["전체", "국어", "수학", "영어", "한국사", "통합과학", "기타"];

    // 1. 오답노트 & CareType 정밀 처방 엔진 실행
    const report = useMemo(() => {
        return analyzeWrongNotesAndCareType(wrongNotes, careType);
    }, [wrongNotes, careType]);

    // 망각곡선 시각화: 최근 14일 복습 정답률 시리즈
    const retentionSeries = useMemo(() => buildRetentionSeries(wrongNotes, 14), [wrongNotes]);
    const retentionTotals = useMemo(() => {
        let total = 0, passed = 0, verified = 0;
        for (const d of retentionSeries) {
            total += d.total; passed += d.passed; verified += d.verified;
        }
        return {
            total, passed, verified,
            rate: total > 0 ? Math.round((passed / total) * 100) : null,
            verifiedRate: passed > 0 ? Math.round((verified / passed) * 100) : null,
        };
    }, [retentionSeries]);

    // 이미지 파일 처리 및 AI Vision OCR 분석
    const processImageFile = async (file: File | Blob) => {
        try {
            setIsScanning(true);
            setScanStatusMessage("📸 이미지 최적화 압축 중...");
            const compressed = await compressImageFile(file);
            setUploadedImage(compressed.dataUrl);

            setScanStatusMessage("✨ Gemini Vision AI가 문제·정답·해설·오답원인을 자동 분석 중입니다...");
            const aiResult = await scanWrongNoteWithAI(compressed.base64, compressed.mimeType);

            if (aiResult.subject) setSubject(aiResult.subject);
            if (aiResult.questionTitle) setQuestionTitle(aiResult.questionTitle);
            if (aiResult.wrongAnswer) setWrongAnswer(aiResult.wrongAnswer);
            if (aiResult.correctAnswer) setCorrectAnswer(aiResult.correctAnswer);
            if (aiResult.explanation) setExplanation(aiResult.explanation);
            if (aiResult.difficulty) setDifficulty(aiResult.difficulty);
            if (aiResult.errorType) setErrorType(aiResult.errorType);
            if (aiResult.metacognitiveNote) {
                setMetacognitiveNote({
                    misconception: aiResult.metacognitiveNote.misconception || "",
                    trapKeyword: aiResult.metacognitiveNote.trapKeyword || "",
                    actionRule: aiResult.metacognitiveNote.actionRule || "",
                });
            }
        } catch (err: any) {
            console.error("Image scan error:", err);
            alert("이미지 처리 중 오류가 발생했습니다: " + (err.message || "알 수 없는 오류"));
        } finally {
            setIsScanning(false);
            setScanStatusMessage("");
        }
    };

    // 전역 클립보드 붙여넣기 (Ctrl + V) 리스너
    useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            const items = e.clipboardData?.items;
            if (!items) return;
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf("image") !== -1) {
                    const file = items[i].getAsFile();
                    if (file) {
                        e.preventDefault();
                        setIsModalOpen(true);
                        processImageFile(file);
                        break;
                    }
                }
            }
        };

        window.addEventListener("paste", handlePaste);
        return () => window.removeEventListener("paste", handlePaste);
    }, []);

    const handleAddNote = (e: React.FormEvent) => {
        e.preventDefault();
        const todayStr = todayLocalStr();
        const hasMeta =
            metacognitiveNote.misconception.trim() ||
            metacognitiveNote.trapKeyword.trim() ||
            metacognitiveNote.actionRule.trim();

        const newNote: WrongNote = {
            id: `wn_${Date.now()}`,
            subject,
            questionTitle,
            wrongAnswer,
            correctAnswer,
            explanation,
            difficulty,
            errorType,
            reviewStage: 0,
            nextReviewDate: calculateNextReviewDate(0),
            isResolved: false,
            createdAt: todayStr,
            imageUrl: uploadedImage || undefined,
            metacognitiveNote: hasMeta ? metacognitiveNote : undefined,
        };
        setWrongNotes((prev) => [newNote, ...prev]);
        setIsModalOpen(false);
        // Reset
        setQuestionTitle("");
        setWrongAnswer("");
        setCorrectAnswer("");
        setExplanation("");
        setErrorType("CONCEPT");
        setUploadedImage(null);
        setMetacognitiveNote({ misconception: "", trapKeyword: "", actionRule: "" });
    };

    // 간격반복 단계 이동 (Pass / Retry)
    // - Retry는 전면 리셋 대신 한 단계 후퇴 (간격반복 표준: 미.Loader lapse → 재학습)
    // - 검증 수단 기록 (answer=정답 입력, twin=AI 변형, self=자기확인, recall=인출 연동)
    const handleReviewStep = (id: string, passed: boolean, opts?: { verified?: boolean; method?: WrongNoteReviewMethod }) => {
        const todayStr = todayLocalStr();
        setWrongNotes((prev) =>
            prev.map((n) => {
                if (n.id !== id) return n;
                const currentStage = n.reviewStage || 0;
                const newStage = passed ? Math.min(4, currentStage + 1) : Math.max(0, currentStage - 1);
                const nextDate = calculateNextReviewDate(newStage);
                const isMastered = newStage >= 4;

                return {
                    ...n,
                    reviewStage: newStage,
                    nextReviewDate: isMastered ? undefined : nextDate,
                    lastReviewedAt: todayStr,
                    isResolved: isMastered ? true : n.isResolved,
                    reviewHistory: [
                        ...(n.reviewHistory || []),
                        { date: todayStr, passed, verified: opts?.verified, method: opts?.method }
                    ]
                };
            })
        );
    };

    // AI 쌍둥이 유사 변형 문제 열기 및 생성 핸들러
    const handleOpenTwinProblem = async (note: WrongNote) => {
        setTwinModalNote(note);
        setIsTwinAnswerRevealed(false);

        if (note.twinProblem) {
            setTwinProblemData(note.twinProblem);
            return;
        }

        try {
            setIsGeneratingTwin(true);
            setTwinProblemData(null);
            const result = await generateTwinProblemWithAI(note);
            setTwinProblemData(result);

            // 캐싱하여 재방문 시 즉시 노출
            setWrongNotes((prev) => prev.map((n) => n.id === note.id ? {
                ...n,
                twinProblem: {
                    ...result,
                    generatedAt: todayLocalStr()
                }
            } : n));
        } catch (err) {
            console.error("Twin problem generation error:", err);
        } finally {
            setIsGeneratingTwin(false);
        }
    };

    const toggleCardReveal = (id: string) => {
        setRevealedCardIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    // 복습 검증 모달 열기 (재풀이 확인 — 정답 가림, 입력 채점)
    const openVerifyModal = (note: WrongNote) => {
        setVerifyNoteId(note.id);
        setVerifyInput("");
        setVerifyOutcome('idle');
    };

    const gradeVerifyInput = () => {
        const note = wrongNotes.find(n => n.id === verifyNoteId);
        if (!note) return;
        setVerifyOutcome(checkReviewAnswer(verifyInput, note.correctAnswer) ? 'correct' : 'wrong');
    };

    const recordVerifiedPass = (method: WrongNoteReviewMethod) => {
        if (!verifyNoteId) return;
        handleReviewStep(verifyNoteId, true, { verified: true, method });
        setVerifyNoteId(null);
    };

    // AI 변형 문제 풀이 결과 → 복습 단계에 검증 기록으로 반영 (twin ↔ 간격반복 연결)
    const recordTwinResult = (passed: boolean) => {
        if (!twinModalNote) return;
        handleReviewStep(twinModalNote.id, passed, { verified: passed, method: 'twin' });
        setTwinModalNote(null);
        setTwinProblemData(null);
    };

    // 백지 인출 저장 → 해당 과목의 오늘 복습 큐와 연동 (필터 이동 + 매칭 안내)
    const handleSaveRecall = (result: { subject: string; durationMinutes: number; scorePercent: number; keywords: string[] }) => {
        const session = { ...result, date: todayLocalStr() };
        setRecallSessions(prev => {
            const next = [session, ...prev].slice(0, 50);
            try { localStorage.setItem(RECALL_SESSION_KEY, JSON.stringify(next)); } catch { /* ignore */ }
            return next;
        });
        const dueOfSubject = report.dueTodayNotes.filter(d => d.note.subject === result.subject);
        const haystack = (n: WrongNote): string =>
            `${n.questionTitle} ${n.explanation} ${n.metacognitiveNote?.misconception || ''} ${n.metacognitiveNote?.trapKeyword || ''} ${n.metacognitiveNote?.actionRule || ''}`;
        const matched = dueOfSubject.filter(d =>
            result.keywords.some(k => k && k.length > 1 && haystack(d.note).includes(k))
        ).length;
        setSelectedSubject(result.subject);
        setStatusFilter("today_due");
        setShowAllDue(false);
        setRecallNotice({ subject: result.subject, score: result.scorePercent, matched, total: dueOfSubject.length });
    };

    // 과목별 최근 인출 세션 (검증 모달 판정 재료)
    const latestRecallFor = (subject: string): { date: string; scorePercent: number; keywords: string[] } | null => {
        const found = recallSessions.find(s => s.subject === subject);
        return found || null;
    };

    const toggleResolved = (id: string) => {
        setWrongNotes((prev) =>
            prev.map((n) => (n.id === id ? { ...n, isResolved: !n.isResolved } : n))
        );
    };

    const handleDelete = (id: string) => {
        if (confirm("이 오답노트를 삭제하시겠습니까?")) {
            setWrongNotes((prev) => prev.filter((n) => n.id !== id));
        }
    };

    const todayStr = todayLocalStr();

    const matchSearchText = (n: WrongNote): boolean =>
        n.questionTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.explanation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.subject.toLowerCase().includes(searchQuery.toLowerCase());

    // 오늘 복습 큐는 우선순위(반복실패→난이도→오래된 순) 정렬 + 상한 적용
    const dueQueueNotes: WrongNote[] = report.dueTodayNotes
        .filter(d => (selectedSubject === "전체" || d.note.subject === selectedSubject) && matchSearchText(d.note))
        .map(d => d.note);
    const visibleQueueNotes: WrongNote[] = showAllDue ? dueQueueNotes : dueQueueNotes.slice(0, DAILY_QUEUE_LIMIT);

    const filteredNotes: WrongNote[] = statusFilter === "today_due"
        ? visibleQueueNotes
        : wrongNotes.filter((n) => {
            const matchSubject = selectedSubject === "전체" || n.subject === selectedSubject;

            let matchStatus = true;
            if (statusFilter === "unresolved") {
                matchStatus = !n.isResolved;
            } else if (statusFilter === "resolved") {
                matchStatus = n.isResolved;
            }

            return matchSubject && matchStatus && matchSearchText(n);
        });

    return (
        <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg p-6 rounded-3xl border border-white/40 dark:border-slate-700/40 shadow-sm">
                <div>
                    <div className="flex items-center space-x-2">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">스마트 오답 노트 & 망각곡선 처방</h2>
                        <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/20 dark:border-rose-500/30">
                            CareType 연동 에빙하우스 간격반복
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        4대 오답 원인을 자동 분석하고, 1일 ➡️ 3일 ➡️ 7일 ➡️ 14일 망각곡선 주기에 맞춰 두뇌 신경인지 최적화 복습을 지원합니다.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setActiveRecallSubject(selectedSubject === "전체" ? "수학" : selectedSubject)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-2xl text-xs shadow-md shadow-indigo-500/20 flex items-center space-x-1.5 transition-colors cursor-pointer"
                    >
                        <Timer className="w-4 h-4" />
                        <span>백지 인출 (Active Recall)</span>
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-2xl text-xs shadow-md shadow-blue-500/20 flex items-center space-x-2 transition-colors cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        <span>오답노트 등록</span>
                    </button>
                </div>
            </div>

            {/* 🧠 CareType 맞춤 오답 처방 브리핑 카드 (3개 이상 누적 시 표시) */}
            {wrongNotes.length >= 3 && report.subjectPrescriptions.length > 0 && (
                <div className="bg-gradient-to-br from-indigo-900/90 to-slate-900 text-white p-6 rounded-3xl border border-indigo-500/30 shadow-xl space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-indigo-800/60 pb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center text-xl">
                                🧠
                            </div>
                            <div>
                                <h3 className="text-base font-black text-white flex items-center gap-2">
                                    <span>CareType 맞춤 오답 극복 처방 브리핑</span>
                                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 font-bold font-mono">
                                        {careType}
                                    </span>
                                </h3>
                                <p className="text-xs text-indigo-200">
                                    누적된 {wrongNotes.length}개의 오답 데이터를 신경인지 기전과 결합하여 맞춤 복습 프로토콜을 산출했습니다.
                                </p>
                            </div>
                        </div>
                        {report.dueTodayNotes.length > 0 && (
                            <button
                                type="button"
                                onClick={() => { setStatusFilter("today_due"); setShowAllDue(false); }}
                                title="오늘 복습 큐로 이동"
                                className="flex items-center gap-2 bg-rose-500/20 border border-rose-500/40 px-3.5 py-1.5 rounded-2xl text-xs text-rose-300 font-bold hover:bg-rose-500/30 transition cursor-pointer"
                            >
                                <AlertCircle size={15} />
                                <span>오늘 망각곡선 복습 대상: {report.dueTodayNotes.length}문항 →</span>
                            </button>
                        )}
                    </div>

                    {/* CareType Alert if exists */}
                    {report.careTypeAlert && (
                        <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-amber-200 leading-relaxed flex items-start gap-2.5">
                            <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                            <span>{report.careTypeAlert}</span>
                        </div>
                    )}

                    {/* Subject-Specific Prescription Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                        {report.subjectPrescriptions.slice(0, 2).map((sp) => (
                            <div key={sp.subject} className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-2xl space-y-2.5">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <span className="px-2.5 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
                                            {sp.subject}
                                        </span>
                                        <span className="text-xs font-bold text-slate-300">{sp.actionablePrescription.title}</span>
                                    </div>
                                    <span className="text-[11px] text-slate-400 font-mono">
                                        {sp.resolvedCount}/{sp.totalCount} 정복
                                    </span>
                                </div>
                                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                                    {sp.actionablePrescription.problemSolvingMethod}
                                </p>
                                <div className="space-y-1 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-400">
                                    {sp.actionablePrescription.recommendedStepRoutine.map((step, idx) => (
                                        <div key={idx} className="flex items-start gap-1.5">
                                            <span className="text-indigo-400 font-bold">•</span>
                                            <span>{step}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 인출 ↔ 복습 큐 연동 안내 (저장 직후 1회 노출) */}
            {recallNotice && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 p-4 rounded-3xl text-xs">
                    <div className="text-emerald-900 dark:text-emerald-200 leading-relaxed">
                        <strong>✍️ [{recallNotice.subject}] 백지 인출 기록 저장됨 (자가 채점 {recallNotice.score}%)</strong>
                        <span className="block text-emerald-700 dark:text-emerald-300 mt-0.5">
                            오늘 복습 큐 {recallNotice.total}문항 중 인출 키워드와 겹치는 {recallNotice.matched}문항이 있습니다.
                            아래 목록에서 우선 복습하세요.
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setRecallNotice(null)}
                        className="shrink-0 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition cursor-pointer"
                    >
                        확인
                    </button>
                </div>
            )}

            {/* 망각곡선 시각화: 최근 14일 복습 정답률 (기록이 있을 때만 표시) */}
            {retentionTotals.total > 0 && (
                <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg p-5 rounded-3xl border border-white/40 dark:border-slate-700/40 shadow-sm space-y-3">
                    <button
                        type="button"
                        onClick={() => setShowRetentionChart(v => !v)}
                        className="w-full flex items-center justify-between cursor-pointer"
                    >
                        <span className="flex items-center gap-2 text-sm font-black text-slate-800 dark:text-slate-100">
                            <BarChart3 className="w-4 h-4 text-indigo-600" />
                            <span>망각곡선 복습 리포트 (최근 14일)</span>
                        </span>
                        <span className="flex items-center gap-2 text-[11px] text-slate-500">
                            <span>총 {retentionTotals.total}회 · 정답률 {retentionTotals.rate}%{retentionTotals.verifiedRate !== null && ` · 검증 ${retentionTotals.verifiedRate}%`}</span>
                            <ChevronDown className={`w-4 h-4 transition-transform ${showRetentionChart ? 'rotate-180' : ''}`} />
                        </span>
                    </button>
                    {showRetentionChart && (
                        <div className="h-52">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={retentionSeries} margin={{ top: 5, right: 5, bottom: 0, left: -15 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={2} />
                                    <YAxis yAxisId="left" tick={{ fontSize: 10 }} allowDecimals={false} />
                                    <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 10 }} tickFormatter={(v: number) => `${v}%`} />
                                    <Tooltip
                                        formatter={(value, name) => {
                                            if (name === 'rate') return [`${value}%`, '정답률'] as [string, string];
                                            if (name === 'total') return [value, '복습 횟수'] as [typeof value, string];
                                            return [value, name] as [typeof value, typeof name];
                                        }}
                                        labelFormatter={(label) => `${label} 복습`}
                                    />
                                    <Bar yAxisId="left" dataKey="total" name="total" fill="#c7d2fe" radius={[4, 4, 0, 0]} maxBarSize={18} />
                                    <Line yAxisId="right" type="monotone" dataKey="rate" name="rate" stroke="#4f46e5" strokeWidth={2} dot={{ r: 2 }} connectNulls />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                    {showRetentionChart && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            막대=일일 복습 횟수, 선=정답률. 기록 없음(0회) 구간은 선이 끊깁니다. 검증(정답 입력·변형 풀이) 비율이 높을수록 데이터가 믿을 만합니다.
                        </p>
                    )}
                </div>
            )}

            {/* Filter and Search Bar */}
            <div className="flex flex-col lg:flex-row justify-between items-center gap-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg p-4 rounded-3xl border border-white/40 dark:border-slate-700/40 shadow-sm">
                <div className="flex items-center space-x-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 scrollbar-none">
                    {subjects.map((sub) => (
                        <button
                            key={sub}
                            onClick={() => setSelectedSubject(sub)}
                            className={`px-4 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${selectedSubject === sub
                                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 font-bold"
                                : "bg-white/60 text-slate-600 hover:bg-white/80 border border-white/60"
                                }`}
                        >
                            {sub}
                        </button>
                    ))}
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
                    <div className="flex items-center bg-white/60 backdrop-blur-md p-1 rounded-2xl border border-white/60 shadow-xs">
                        <button
                            onClick={() => setViewMode("list")}
                            className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer flex items-center space-x-1 ${viewMode === "list" ? "bg-blue-600 text-white shadow-sm font-bold" : "text-slate-600 hover:text-slate-800"
                                }`}
                        >
                            <span>일렬 정렬</span>
                        </button>
                        <button
                            onClick={() => setViewMode("card")}
                            className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer flex items-center space-x-1 ${viewMode === "card" ? "bg-blue-600 text-white shadow-sm font-bold" : "text-slate-600 hover:text-slate-800"
                                }`}
                        >
                            <span>카드형</span>
                        </button>
                    </div>

                    {/* 블라인드 인출 (Blind Active Recall) 모드 토글 */}
                    <div className="flex items-center bg-white/60 dark:bg-slate-700/50 backdrop-blur-md p-1 rounded-2xl border border-white/60 dark:border-slate-600 shadow-xs">
                        <button
                            type="button"
                            onClick={() => setIsBlindMode(prev => !prev)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer flex items-center space-x-1.5 transition ${isBlindMode
                                ? "bg-indigo-600 text-white shadow-sm font-bold"
                                : "text-slate-600 dark:text-slate-300 hover:text-indigo-600"
                                }`}
                            title="문제를 보고 정답과 해설, 3줄 메타인지를 스스로 먼저 떠올려보는 블라인드 인출 모드"
                        >
                            {isBlindMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            <span>{isBlindMode ? "블라인드 ON" : "블라인드 인출"}</span>
                        </button>
                    </div>

                    <div className="flex items-center bg-white/60 backdrop-blur-md p-1 rounded-2xl border border-white/60 shadow-xs">
                        <button
                            onClick={() => setStatusFilter("all")}
                            className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer ${statusFilter === "all" ? "bg-white text-slate-800 shadow-sm font-bold" : "text-slate-600"
                                }`}
                        >
                            전체 ({wrongNotes.length})
                        </button>
                        <button
                            onClick={() => setStatusFilter("today_due")}
                            className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer flex items-center gap-1 ${statusFilter === "today_due" ? "bg-rose-500 text-white shadow-sm font-bold" : "text-rose-600 font-bold"
                                }`}
                        >
                            <span>📅 오늘 복습</span>
                            {report.dueTodayNotes.length > 0 && (
                                <span className="px-1.5 py-0.2 bg-rose-600 text-white rounded-full text-[10px]">
                                    {report.dueTodayNotes.length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setStatusFilter("unresolved")}
                            className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer ${statusFilter === "unresolved" ? "bg-white text-rose-700 shadow-sm font-bold" : "text-slate-600"
                                }`}
                        >
                            미해결
                        </button>
                        <button
                            onClick={() => setStatusFilter("resolved")}
                            className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer ${statusFilter === "resolved" ? "bg-white text-emerald-700 shadow-sm font-bold" : "text-slate-600"
                                }`}
                        >
                            정복완료
                        </button>
                    </div>

                    <div className="relative w-full sm:w-52">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="문제 검색..."
                            className="w-full pl-9 pr-4 py-2 bg-white/65 backdrop-blur-md border border-white/60 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                        />
                    </div>
                </div>
            </div>

            {/* 오늘 우선 큐 헤더 (상한 초과 시 접기) */}
            {statusFilter === "today_due" && dueQueueNotes.length > 0 && (
                <div className="flex items-center justify-between px-1 text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                        🎯 오늘 우선 큐 {visibleQueueNotes.length}/{dueQueueNotes.length}문항
                        <span className="font-normal text-slate-500"> (반복실패 → 난이도 → 오래된 순)</span>
                    </span>
                    {dueQueueNotes.length > DAILY_QUEUE_LIMIT && (
                        <button
                            type="button"
                            onClick={() => setShowAllDue(v => !v)}
                            className="font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                        >
                            {showAllDue ? '접기' : `외 ${dueQueueNotes.length - DAILY_QUEUE_LIMIT}문항 더 보기`}
                        </button>
                    )}
                </div>
            )}

            {/* Wrong Notes Container (List or Card) */}
            <div className={viewMode === "card" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" : "space-y-4"}>
                {filteredNotes.map((note) => {
                    const errorMeta = ERROR_TYPE_METAS[note.errorType || "CONCEPT"];
                    const stage = note.reviewStage || 0;
                    const isDue = !note.isResolved && (!note.nextReviewDate || note.nextReviewDate <= todayStr);
                    const isCardRevealed = revealedCardIds.has(note.id);
                    const shouldBlind = isBlindMode && !isCardRevealed;

                    return (
                        <div
                            key={note.id}
                            className={`bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg rounded-3xl border p-5 shadow-sm transition-all ${viewMode === "card" ? "flex flex-col justify-between" : "flex flex-col md:flex-row md:items-center justify-between gap-4"
                                } ${note.isResolved
                                    ? "border-emerald-300/60 bg-emerald-50/20"
                                    : isDue
                                        ? "border-rose-400 bg-rose-50/10 shadow-md shadow-rose-500/5"
                                        : "border-white/40 hover:border-blue-300"
                                }`}
                        >
                            <div className={viewMode === "list" ? "flex-1 space-y-2.5" : "space-y-3"}>
                                <div className="flex flex-wrap justify-between items-center gap-2 mb-1">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-blue-500/10 text-blue-700 border border-blue-500/20">
                                            {note.subject}
                                        </span>
                                        <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold border flex items-center gap-1 ${errorMeta.badgeColor}`}>
                                            <span>{errorMeta.icon}</span>
                                            <span>{errorMeta.label.split(' ')[0]}</span>
                                        </span>
                                        <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-medium ${note.difficulty === "상" ? "bg-rose-100 text-rose-700" :
                                            note.difficulty === "중" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                                            }`}>
                                            {note.difficulty}
                                        </span>
                                        {!note.isResolved && (note.reviewHistory || []).filter(h => h?.passed === false).length >= 2 && (
                                            <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-orange-100 text-orange-700 border border-orange-300">
                                                🔁 반복 오답
                                            </span>
                                        )}
                                    </div>

                                    {/* Spaced Repetition Stage Badge & 회독수 뱃지 */}
                                    <div className="flex items-center gap-1.5 text-[11px] flex-wrap">
                                        {note.reviewHistory && note.reviewHistory.length > 0 && (
                                            <span className="px-2 py-0.5 rounded-full font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1 font-mono text-[10px]">
                                                <span>🔄</span>
                                                <span>{note.reviewHistory.length}회독</span>
                                            </span>
                                        )}
                                        <span className={`px-2.5 py-0.5 rounded-full font-bold border ${note.isResolved
                                            ? "bg-emerald-100 text-emerald-700 border-emerald-300"
                                            : isDue
                                                ? "bg-rose-500 text-white border-rose-600 animate-pulse font-mono"
                                                : "bg-slate-100 text-slate-600 border-slate-200"
                                            }`}>
                                            {note.isResolved ? "🎉 정복 완료" : isDue ? "🔥 오늘 복습 D-Day" : `${stage}단계 (${note.nextReviewDate} 복습)`}
                                        </span>
                                    </div>
                                </div>

                                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">{note.questionTitle}</h3>

                                {/* 문제 원본 사진 첨부 시 썸네일 표시 (타이핑 없이 사진으로 복습) */}
                                {note.imageUrl && (
                                    <div
                                        onClick={() => setPreviewImageModal(note.imageUrl!)}
                                        className="relative group cursor-pointer overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-900/5 max-h-44 flex items-center justify-center transition-all hover:border-blue-400"
                                    >
                                        <img
                                            src={note.imageUrl}
                                            alt="문제 원본 사진"
                                            className="w-full object-contain max-h-44 group-hover:scale-102 transition-transform duration-200"
                                        />
                                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold gap-1.5 transition-opacity backdrop-blur-xs">
                                            <ZoomIn className="w-4 h-4" />
                                            <span>문제 사진 크게 보기</span>
                                        </div>
                                    </div>
                                )}

                                {/* 정답, 해설, 3줄 메타인지 블라인드 가림막 컨테이너 */}
                                <div className="relative rounded-2xl overflow-hidden">
                                    <div className={`space-y-2.5 transition-all duration-300 ${shouldBlind ? 'filter blur-md select-none opacity-20 pointer-events-none' : ''}`}>
                                        <div className={viewMode === "list" ? "flex flex-wrap gap-4 text-xs bg-white/60 backdrop-blur-sm p-3 rounded-2xl border border-white/80" : "space-y-2 bg-white/60 backdrop-blur-sm p-3.5 rounded-2xl border border-white/80 text-xs shadow-xs"}>
                                            <div>
                                                <span className="font-semibold text-rose-600 mr-1.5">내 오답:</span>
                                                <span className="text-slate-700">{note.wrongAnswer}</span>
                                            </div>
                                            <div>
                                                <span className="font-semibold text-emerald-600 mr-1.5">정답:</span>
                                                <span className="text-slate-800 font-medium">{note.correctAnswer}</span>
                                            </div>
                                        </div>

                                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-blue-500/5 p-3.5 rounded-2xl border border-blue-500/10">
                                            <strong className="text-blue-900 dark:text-blue-300 block mb-1">💡 원인 분석 & 해설</strong>
                                            {note.explanation}
                                        </p>

                                        {/* 3줄 메타인지 처방 (No-Copying Rx) 표시 */}
                                        {note.metacognitiveNote && (note.metacognitiveNote.misconception || note.metacognitiveNote.trapKeyword || note.metacognitiveNote.actionRule) && (
                                            <div className="p-3 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 rounded-2xl text-[11px] space-y-1">
                                                <div className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5 mb-1">
                                                    <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                                                    <span>3줄 메타인지 처방 (No-Copying Rx)</span>
                                                </div>
                                                {note.metacognitiveNote.misconception && (
                                                    <div className="text-slate-700 dark:text-slate-300 flex items-start gap-1">
                                                        <span className="font-semibold text-rose-600 shrink-0">1. 착각 사고:</span>
                                                        <span>{note.metacognitiveNote.misconception}</span>
                                                    </div>
                                                )}
                                                {note.metacognitiveNote.trapKeyword && (
                                                    <div className="text-slate-700 dark:text-slate-300 flex items-start gap-1">
                                                        <span className="font-semibold text-amber-600 shrink-0">2. 출제 함정:</span>
                                                        <span>{note.metacognitiveNote.trapKeyword}</span>
                                                    </div>
                                                )}
                                                {note.metacognitiveNote.actionRule && (
                                                    <div className="text-slate-700 dark:text-slate-300 flex items-start gap-1">
                                                        <span className="font-semibold text-indigo-600 shrink-0">3. 행동 수칙:</span>
                                                        <span>{note.metacognitiveNote.actionRule}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* 블라인드 모드 시 노출되는 가림막 오버레이 */}
                                    {shouldBlind && (
                                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900/10 dark:bg-slate-900/50 backdrop-blur-[2px] p-4 text-center rounded-2xl border border-dashed border-indigo-400/50">
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
                                                <EyeOff className="w-4 h-4 text-indigo-500 animate-pulse" />
                                                <span>정답 & 메타인지 블라인드 가림막</span>
                                            </span>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2.5 max-w-xs">
                                                문제를 보고 머릿속에서 정답과 풀이 행동 수칙을 먼저 떠올려보세요.
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => toggleCardReveal(note.id)}
                                                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition cursor-pointer flex items-center gap-1.5"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                <span>클릭하여 정답·수칙 확인</span>
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* 블라인드 해제 상태일 때 다시 가리기 버튼 및 최근 복습 이력 */}
                                <div className="flex items-center justify-between gap-2 flex-wrap pt-0.5">
                                    {note.reviewHistory && note.reviewHistory.length > 0 ? (
                                        <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-slate-500 dark:text-slate-400">
                                            <span className="font-semibold text-slate-600 dark:text-slate-300">최근 복습 이력:</span>
                                            {note.reviewHistory.slice(-3).map((h, idx) => (
                                                <span
                                                    key={idx}
                                                    title={h.verified ? `검증됨 (${h.method === 'twin' ? 'AI 변형' : h.method === 'answer' ? '정답 입력' : h.method === 'recall' ? '인출 연동' : '확인'})` : '자기확인 기록'}
                                                    className={`px-1.5 py-0.5 rounded-md font-mono text-[10px] border font-bold ${h.passed
                                                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                                        : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                                                        }`}
                                                >
                                                    {h.date.slice(5)} {h.passed ? (h.verified ? '✅ 검증' : '✅ 자기확인') : '🔄 재도전'}
                                                </span>
                                            ))}
                                        </div>
                                    ) : <div />}

                                    {isBlindMode && isCardRevealed && (
                                        <button
                                            type="button"
                                            onClick={() => toggleCardReveal(note.id)}
                                            className="text-[11px] text-slate-400 hover:text-indigo-600 flex items-center gap-1 transition cursor-pointer"
                                        >
                                            <EyeOff className="w-3 h-3" />
                                            <span>다시 가리기</span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons with Spaced Repetition Stepping */}
                            <div className={viewMode === "list" ? "flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/60 flex-wrap" : "pt-4 mt-4 border-t border-white/40 flex items-center justify-between flex-wrap gap-2"}>
                                {!note.isResolved && (
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            onClick={() => openVerifyModal(note)}
                                            title="재풀이 검증 후 통과 기록 (정답 입력 채점)"
                                            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors cursor-pointer"
                                        >
                                            <Check className="w-3.5 h-3.5" />
                                            <span>복습 검증 ({stage + 1}단계로)</span>
                                        </button>
                                        <button
                                            onClick={() => handleReviewStep(note.id, false, { verified: false })}
                                            title="다시 틀림 (이전 단계로 이동 — 반복 실패 시 우선 복습 대상)"
                                            className="p-1.5 rounded-xl text-xs bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 transition-colors"
                                        >
                                            <RotateCcw className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                )}

                                <button
                                    type="button"
                                    onClick={() => handleOpenTwinProblem(note)}
                                    title="이 문제와 동일한 출제 원리의 AI 쌍둥이 유사 변형 문제 풀기"
                                    className="flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer"
                                >
                                    <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                                    <span>AI 변형 문제</span>
                                </button>

                                <button
                                    onClick={() => toggleResolved(note.id)}
                                    className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${note.isResolved
                                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                        : "bg-white/60 text-slate-600 hover:bg-blue-50 hover:text-blue-600 border border-white/60"
                                        }`}
                                >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>{note.isResolved ? "완료됨" : "마스터 처리"}</span>
                                </button>

                                <button
                                    onClick={() => handleDelete(note.id)}
                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    );
                })}

                {filteredNotes.length === 0 && (
                    <div className="col-span-full py-16 text-center bg-white/30 backdrop-blur-lg rounded-3xl border border-white/40">
                        <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h4 className="text-base font-bold text-slate-700">등록된 오답노트가 없습니다.</h4>
                        <p className="text-xs text-slate-400 mt-1">틀린 문제를 등록하여 CareType 맞춤 복습 처방과 간격반복 스케줄을 받아보세요.</p>
                    </div>
                )}
            </div>

            {/* Modal: New Wrong Note */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-white/60 dark:border-slate-700 w-full max-w-xl rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-700">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">새 오답노트 등록 & 원인 진단</h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* AI Photo Scan & Clipboard Paste Hero Banner */}
                        <div
                            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                            onDragLeave={() => setIsDragOver(false)}
                            onDrop={(e) => {
                                e.preventDefault();
                                setIsDragOver(false);
                                const file = e.dataTransfer.files?.[0];
                                if (file && file.type.startsWith("image/")) {
                                    processImageFile(file);
                                }
                            }}
                            className={`p-4.5 rounded-3xl border transition-all ${isDragOver
                                ? "border-indigo-400 bg-indigo-950/80 shadow-indigo-500/20 shadow-lg scale-[1.01]"
                                : "bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white border-indigo-500/30 shadow-md"
                                } relative overflow-hidden`}
                        >
                            <div className="relative z-10 space-y-3">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                                    <div>
                                        <div className="flex items-center space-x-1.5 text-amber-300 text-xs font-bold mb-1">
                                            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                                            <span>AI 문제 사진 & 스크린샷 자동 입력 (Zero-Typing)</span>
                                        </div>
                                        <p className="text-[11px] text-indigo-200 leading-snug">
                                            시험지 사진을 올리거나, 캡처(<kbd className="px-1.5 py-0.5 bg-indigo-900/80 border border-indigo-700 rounded text-[10px] text-white font-mono">Win+Shift+S</kbd>) 후 여기서 <kbd className="px-1.5 py-0.5 bg-indigo-900/80 border border-indigo-700 rounded text-[10px] text-amber-300 font-mono font-bold">Ctrl+V</kbd>를 누르면 AI가 전자동 분석합니다!
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) processImageFile(file);
                                                e.target.value = "";
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isScanning}
                                            className="bg-white hover:bg-indigo-50 text-indigo-950 font-bold px-3.5 py-2 rounded-2xl text-xs shadow-md transition-all cursor-pointer flex items-center space-x-1.5 disabled:opacity-50"
                                        >
                                            <Camera className="w-4 h-4 text-indigo-600" />
                                            <span>사진/파일 선택</span>
                                        </button>
                                    </div>
                                </div>

                                {/* 분석 중 인디케이터 */}
                                {isScanning && (
                                    <div className="p-3 bg-indigo-900/60 border border-indigo-400/40 rounded-2xl flex items-center space-x-2.5 text-xs text-amber-200 animate-pulse">
                                        <Loader2 className="w-4 h-4 animate-spin text-amber-400 shrink-0" />
                                        <span>{scanStatusMessage || "Gemini Vision AI가 문제 내용을 정밀 분석 중입니다..."}</span>
                                    </div>
                                )}

                                {/* 첨부된 이미지 미리보기 카드 */}
                                {uploadedImage && !isScanning && (
                                    <div className="flex items-center justify-between p-2.5 bg-slate-900/70 border border-indigo-400/30 rounded-2xl">
                                        <div className="flex items-center space-x-2.5">
                                            <img
                                                src={uploadedImage}
                                                alt="스캔된 문제"
                                                className="w-12 h-12 object-cover rounded-xl border border-white/20"
                                            />
                                            <div className="text-left">
                                                <div className="text-xs font-bold text-white flex items-center gap-1">
                                                    <span>📷 문제 사진 첨부됨</span>
                                                    <span className="text-[10px] text-emerald-400 font-mono">자동 압축 완료</span>
                                                </div>
                                                <div className="text-[10px] text-indigo-300">
                                                    오답노트 카드에 첨부되어 복습 시 사진으로 확인됩니다.
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (fileInputRef.current) fileInputRef.current.click();
                                                }}
                                                title="다른 사진으로 재스캔"
                                                className="p-1.5 bg-indigo-800/80 hover:bg-indigo-700 text-indigo-200 rounded-xl text-xs transition"
                                            >
                                                <RefreshCw className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setUploadedImage(null)}
                                                title="사진 삭제"
                                                className="p-1.5 bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 border border-rose-500/30 rounded-xl text-xs transition"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <form onSubmit={handleAddNote} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">과목</label>
                                    <select
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-white/60 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                                    >
                                        <option value="수학">수학</option>
                                        <option value="국어">국어</option>
                                        <option value="영어">영어</option>
                                        <option value="한국사">한국사</option>
                                        <option value="통합과학">통합과학</option>
                                        <option value="기타">기타</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">난이도</label>
                                    <select
                                        value={difficulty}
                                        onChange={(e) => setDifficulty(e.target.value as "상" | "중" | "하")}
                                        className="w-full px-3.5 py-2.5 bg-white/60 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                                    >
                                        <option value="상">상 (킬러 문항)</option>
                                        <option value="중">중 (응용 문제)</option>
                                        <option value="하">하 (기본 개념)</option>
                                    </select>
                                </div>
                            </div>

                            {/* 4대 오답 원인 유형 선택기 */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                    🔍 오답 원인 유형 분류 (CareType 매핑)
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {(Object.keys(ERROR_TYPE_METAS) as WrongNoteErrorType[]).map((k) => {
                                        const meta = ERROR_TYPE_METAS[k];
                                        const isSelected = errorType === k;
                                        return (
                                            <button
                                                key={k}
                                                type="button"
                                                onClick={() => setErrorType(k)}
                                                className={`p-2.5 rounded-2xl border text-left transition cursor-pointer ${isSelected
                                                    ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-900 dark:text-indigo-200 shadow-sm"
                                                    : "bg-white/60 dark:bg-slate-700/40 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                                                    }`}
                                            >
                                                <div className="flex items-center gap-1.5 text-xs font-bold">
                                                    <span>{meta.icon}</span>
                                                    <span>{meta.label.split(' ')[0]}</span>
                                                </div>
                                                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                                                    {meta.description}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">문제 제목 / 단원</label>
                                <input
                                    type="text"
                                    required
                                    value={questionTitle}
                                    onChange={(e) => setQuestionTitle(e.target.value)}
                                    placeholder="예: 삼각함수의 덧셈정리와 극한 활용"
                                    className="w-full px-3.5 py-2.5 bg-white/60 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">내가 적은 오답</label>
                                    <input
                                        type="text"
                                        required
                                        value={wrongAnswer}
                                        onChange={(e) => setWrongAnswer(e.target.value)}
                                        placeholder="예: -4"
                                        className="w-full px-3.5 py-2.5 bg-white/60 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">올바른 정답</label>
                                    <input
                                        type="text"
                                        required
                                        value={correctAnswer}
                                        onChange={(e) => setCorrectAnswer(e.target.value)}
                                        placeholder="예: 8"
                                        className="w-full px-3.5 py-2.5 bg-white/60 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">핵심 해설 및 문제 접근법</label>
                                <textarea
                                    required
                                    rows={3}
                                    value={explanation}
                                    onChange={(e) => setExplanation(e.target.value)}
                                    placeholder="틀린 이유와 정확한 풀이 과정을 적어주세요... (AI 스캔 시 자동 채움)"
                                    className="w-full px-3.5 py-2.5 bg-white/60 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none shadow-xs"
                                />
                            </div>

                            {/* 3줄 메타인지 처방 (No-Copying Rx) 필드 */}
                            <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/60 rounded-2xl space-y-3">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                                    <div className="flex items-center space-x-1.5">
                                        <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                        <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                                            3줄 메타인지 처방 (No-Copying Rx)
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-indigo-600 dark:text-indigo-300 font-medium">
                                        문제/해설 필사 금지 • 3줄로 핵심만 기록
                                    </span>
                                </div>

                                {/* 자주 발생하는 실수 퀵 칩 버튼 */}
                                <div>
                                    <div className="text-[10px] text-slate-500 mb-1 font-medium">자주 발생하는 실수 원인 원클릭 적용:</div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {[
                                            "부호/계산 실수",
                                            "발문 조건 누락",
                                            "공식 암기 누락",
                                            "시간 부족 찍음",
                                            "신유형 접근법 부재",
                                            "도형/그래프 해석 착각"
                                        ].map((chip) => (
                                            <button
                                                key={chip}
                                                type="button"
                                                onClick={() => {
                                                    setMetacognitiveNote((prev) => ({
                                                        ...prev,
                                                        misconception: prev.misconception ? `${prev.misconception}, ${chip}` : chip
                                                    }));
                                                }}
                                                className="px-2 py-0.5 rounded-lg text-[10px] bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700 hover:bg-indigo-50 cursor-pointer transition shadow-2xs"
                                            >
                                                + {chip}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div>
                                        <label className="block text-[11px] font-semibold text-rose-700 dark:text-rose-400 mb-0.5">
                                            1줄: 내가 시험장에서 착각한 잘못된 사고 경로
                                        </label>
                                        <input
                                            type="text"
                                            value={metacognitiveNote.misconception}
                                            onChange={(e) => setMetacognitiveNote({ ...metacognitiveNote, misconception: e.target.value })}
                                            placeholder="예: x가 양수라는 조건을 간과하고 음수 해까지 포함하여 계산함"
                                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 shadow-2xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-amber-700 dark:text-amber-400 mb-0.5">
                                            2줄: 출제자가 판 함정 키워드 또는 결정적 단서
                                        </label>
                                        <input
                                            type="text"
                                            value={metacognitiveNote.trapKeyword}
                                            onChange={(e) => setMetacognitiveNote({ ...metacognitiveNote, trapKeyword: e.target.value })}
                                            placeholder="예: '단, x > 0' 괄호 속 제약 조건"
                                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 shadow-2xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-indigo-700 dark:text-indigo-400 mb-0.5">
                                            3줄: 다음에 이 유형을 볼 때 떠올릴 첫 번째 행동 수칙
                                        </label>
                                        <input
                                            type="text"
                                            value={metacognitiveNote.actionRule}
                                            onChange={(e) => setMetacognitiveNote({ ...metacognitiveNote, actionRule: e.target.value })}
                                            placeholder="예: 로그/분수 문제는 정의역 범위부터 먼저 네모 박스 치고 시작하기"
                                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 shadow-2xs"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setUploadedImage(null);
                                    }}
                                    className="px-4 py-2.5 rounded-2xl text-xs font-medium bg-white/60 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-white/90 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 cursor-pointer"
                                >
                                    취소
                                </button>
                                <button
                                    type="submit"
                                    disabled={isScanning}
                                    className="px-5 py-2.5 rounded-2xl text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 cursor-pointer font-bold disabled:opacity-50"
                                >
                                    저장 & 망각곡선 큐 등록
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Lightbox Modal: 문제 원본 사진 전체보기 */}
            {previewImageModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in"
                    onClick={() => setPreviewImageModal(null)}
                >
                    <div
                        className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-3xl p-3 border border-slate-700 shadow-2xl overflow-hidden flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center px-4 py-2 border-b border-slate-800 text-white">
                            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                                <ImageIcon className="w-4 h-4 text-indigo-400" />
                                문제 원본 사진 확대보기
                            </span>
                            <button
                                onClick={() => setPreviewImageModal(null)}
                                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-2 overflow-auto max-h-[80vh] flex items-center justify-center bg-slate-950/50 rounded-2xl">
                            <img
                                src={previewImageModal}
                                alt="문제 원본 사진 확대"
                                className="max-w-full max-h-[78vh] object-contain rounded-xl"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* 복습 검증 모달 (재풀이 확인: 정답 가림 → 입력 채점 → 검증/자기확인 기록) */}
            {verifyNoteId && (() => {
                const note = wrongNotes.find(n => n.id === verifyNoteId);
                if (!note) return null;
                const recentRecall = latestRecallFor(note.subject);
                return (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
                        onClick={() => setVerifyNoteId(null)}
                    >
                        <div
                            className="relative max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                                    📝 복습 검증 — [{note.subject}] {note.questionTitle}
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setVerifyNoteId(null)}
                                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                정답을 가린 상태에서 다시 풀어 답을 입력하세요. 채점 결과에 따라 검증 통과 또는 재도전으로 기록됩니다.
                            </p>

                            {recentRecall && (
                                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-2xl text-[11px] text-indigo-900 dark:text-indigo-200">
                                    <strong>✍️ 최근 인출 기록 ({recentRecall.date} · 자가 채점 {recentRecall.scorePercent}%)</strong>
                                    {recentRecall.keywords.length > 0 && (
                                        <span className="block mt-1 text-indigo-700 dark:text-indigo-300">
                                            키워드: {recentRecall.keywords.slice(0, 8).join(', ')}
                                        </span>
                                    )}
                                </div>
                            )}

                            {verifyOutcome === 'idle' && (
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        value={verifyInput}
                                        onChange={(e) => setVerifyInput(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') gradeVerifyInput(); }}
                                        placeholder="다시 푼 답을 입력하세요"
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={gradeVerifyInput}
                                            disabled={!verifyInput.trim()}
                                            className="flex-1 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-black transition cursor-pointer"
                                        >
                                            채점하기
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => { handleReviewStep(note.id, true, { verified: false, method: 'self' }); setVerifyNoteId(null); }}
                                            title="검증 없이 다음 단계로 진행 (자기확인으로 기록)"
                                            className="flex-1 py-2.5 rounded-2xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
                                        >
                                            자기확인으로 기록
                                        </button>
                                    </div>
                                </div>
                            )}

                            {verifyOutcome === 'correct' && (
                                <div className="space-y-3">
                                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 rounded-2xl text-center">
                                        <div className="text-sm font-black text-emerald-700 dark:text-emerald-300">✅ 정답! 검증 통과</div>
                                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">다음 복습 간격으로 진행됩니다.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => recordVerifiedPass('answer')}
                                        className="w-full py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition cursor-pointer"
                                    >
                                        검증 통과로 기록하기
                                    </button>
                                </div>
                            )}

                            {verifyOutcome === 'wrong' && (
                                <div className="space-y-3">
                                    <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-700 rounded-2xl text-center space-y-1">
                                        <div className="text-sm font-black text-rose-700 dark:text-rose-300">❌ 오답 — 정답: {note.correctAnswer}</div>
                                        <p className="text-[11px] text-rose-600 dark:text-rose-400">해설을 다시 확인하고 재도전으로 기록됩니다 (이전 단계로 이동).</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => { handleReviewStep(note.id, false, { verified: false }); setVerifyNoteId(null); }}
                                            className="flex-1 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black transition cursor-pointer"
                                        >
                                            재도전으로 기록
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => { setVerifyInput(""); setVerifyOutcome('idle'); }}
                                            className="flex-1 py-2.5 rounded-2xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
                                        >
                                            다시 입력
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })()}

            {/* Active Recall Modal */}
            <ActiveRecallModal
                isOpen={!!activeRecallSubject}
                onClose={() => setActiveRecallSubject(null)}
                subject={activeRecallSubject || "수학"}
                careType={careType}
                onSaveRecall={handleSaveRecall}
            />

            {/* AI Twin Problem Modal (쌍둥이 유사 변형 문제 모달) */}
            {twinModalNote && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
                    onClick={() => {
                        setTwinModalNote(null);
                        setTwinProblemData(null);
                    }}
                >
                    <div
                        className="relative max-w-2xl w-full bg-slate-900 border border-slate-700/90 rounded-3xl p-6 shadow-2xl space-y-5 text-white max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-xl">
                                    ✨
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-white flex items-center gap-2">
                                        <span>AI 쌍둥이 유사 변형 문제</span>
                                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
                                            {twinModalNote.subject}
                                        </span>
                                    </h3>
                                    <p className="text-xs text-slate-400">
                                        정답 암기를 방지하고 동일한 사고 논리를 체화하기 위해 AI가 실시간 설계한 유사 문항입니다.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setTwinModalNote(null);
                                    setTwinProblemData(null);
                                }}
                                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        {isGeneratingTwin ? (
                            <div className="py-12 flex flex-col items-center justify-center space-y-3 text-center">
                                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                                <div className="text-sm font-bold text-slate-200">
                                    Gemini AI가 오답 원인을 분석하여 쌍둥이 변형 문제를 출제 중입니다...
                                </div>
                                <div className="text-xs text-slate-400">
                                    기존 문제: [{twinModalNote.questionTitle}] 의 개념과 함정을 계승합니다.
                                </div>
                            </div>
                        ) : twinProblemData ? (
                            <div className="space-y-4 animate-in fade-in duration-300">
                                {/* Problem Title & Description Card */}
                                <div className="bg-slate-950/70 border border-indigo-500/30 p-4.5 rounded-2xl space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                            <span>{twinProblemData.twinTitle}</span>
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-mono">
                                            난이도: {twinModalNote.difficulty}
                                        </span>
                                    </div>
                                    <div className="text-sm text-slate-100 font-medium leading-relaxed whitespace-pre-wrap font-sans bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
                                        {twinProblemData.question}
                                    </div>
                                </div>

                                {/* Answer & Explanation Accordion */}
                                <div className="space-y-3">
                                    {!isTwinAnswerRevealed ? (
                                        <button
                                            type="button"
                                            onClick={() => setIsTwinAnswerRevealed(true)}
                                            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-2xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                                        >
                                            <Eye className="w-4 h-4" />
                                            <span>직접 풀어본 후 정답 & 핵심 해설 확인하기</span>
                                        </button>
                                    ) : (
                                        <div className="bg-slate-950/80 border border-emerald-500/30 p-4 rounded-2xl space-y-2.5 animate-in fade-in duration-200">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                                    <span>정답 및 해결 결론</span>
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsTwinAnswerRevealed(false)}
                                                    className="text-[11px] text-slate-400 hover:text-slate-200 cursor-pointer"
                                                >
                                                    정답 가리기
                                                </button>
                                            </div>
                                            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs font-mono font-bold text-emerald-300">
                                                {twinProblemData.answer}
                                            </div>
                                            <div className="text-xs text-slate-300 leading-relaxed bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                                                <strong className="text-indigo-300 block mb-1">💡 풀이 원리 & 함정 극복 팁:</strong>
                                                {twinProblemData.explanation}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* 변형 풀이 결과 → 복습 검증 기록 (twin ↔ 간격반복 연결) */}
                                <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl space-y-2">
                                    <span className="text-[11px] font-bold text-emerald-300 block">
                                        변형을 직접 풀어보셨나요? 결과를 기록하면 복습 단계에 검증 완료로 반영됩니다.
                                    </span>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => recordTwinResult(true)}
                                            className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer"
                                        >
                                            ✅ 변형 맞음 (검증 통과)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => recordTwinResult(false)}
                                            className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-slate-200 text-xs font-bold transition cursor-pointer"
                                        >
                                            🔄 변형 틀림 (재도전 기록)
                                        </button>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-xs">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (twinModalNote) {
                                                // 강제 재출제
                                                setIsGeneratingTwin(true);
                                                setTwinProblemData(null);
                                                generateTwinProblemWithAI(twinModalNote)
                                                    .then(res => {
                                                        setTwinProblemData(res);
                                                        setWrongNotes(prev => prev.map(n => n.id === twinModalNote.id ? {
                                                            ...n,
                                                            twinProblem: { ...res, generatedAt: todayLocalStr() }
                                                        } : n));
                                                    })
                                                    .finally(() => setIsGeneratingTwin(false));
                                            }
                                        }}
                                        className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer transition"
                                    >
                                        <RefreshCw className="w-3.5 h-3.5" />
                                        <span>새로운 변형 문제 다시 출제</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setTwinModalNote(null);
                                            setTwinProblemData(null);
                                        }}
                                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold transition cursor-pointer"
                                    >
                                        닫기
                                    </button>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            )}
        </div>
    );
}
