import React, { useState, useEffect, useRef, useMemo } from 'react';
import { StudentInfo, LadderStageLevel, LadderQuestion, ConceptCheckItem } from '../../types';
import { getCareTypeDetail } from '../../data/careTypesData';
import {
  LADDER_STAGES,
  getBrainPrimingGuide,
  getAdaptiveTimerConfig,
  getMetacognitiveConceptCheck,
  shuffleConceptCheckOptions,
  getNeuroErrorFeedback
} from '../../services/neuroStudyEngine';
import { getQuestionsForUnit, shuffleLadderOptions } from '../../data/ladderQuestions';
import { recordLadderAttempt, getQuestionAttemptCount } from '../../services/ladderQuality';
import { detectSubjectKey, getCachedOrGenerateStageQuestions } from '../../services/ladderAiGeneratorService';
import { SUBJECT_LADDER_AI_CONFIG } from '../../services/aiModelConfig';
import { BreathingCore } from '../BreathingGuide';
import { recommendBreathingProtocols } from '../../services/breathingEngine';

interface NeuroStudyLadderModalProps {
  isOpen: boolean;
  student: StudentInfo;
  careTypeCode?: string;
  subjectName: string;
  unitName: string;
  weakPriority?: number; // 1, 2, 3순위
  initialStage?: LadderStageLevel; // 작업기억 기반 시작 단계 (없으면 A)
  startReason?: string; // 시작 단계 선정 사유 표시용
  hasAssessment?: boolean; // false면 진단 상태 표기를 중립화
  onClose: () => void;
}

export const NeuroStudyLadderModal: React.FC<NeuroStudyLadderModalProps> = ({
  isOpen,
  student,
  careTypeCode = 'HEALTHY',
  subjectName,
  unitName,
  weakPriority = 1,
  initialStage,
  startReason,
  hasAssessment = true,
  onClose
}) => {
  // Navigation Phases: 1: Brain Priming ➔ 2: Metacognitive Concept Check ➔ 3: 6-Stage Ladder ➔ 4: Completion Summary
  const [currentPhase, setCurrentPhase] = useState<1 | 2 | 3 | 4>(1);

  // 과목별 특화 2026 SOTA AI 모델 판별 (국어: Claude 5.5 / 수학: DeepSeek V4.1 / 영어: Gemini 3.8)
  const subjectKey = detectSubjectKey(subjectName, unitName);
  const aiConfig = SUBJECT_LADDER_AI_CONFIG[subjectKey];

  // AI 실시간 출제 모드 및 상태 관리
  const [isAiMode, setIsAiMode] = useState<boolean>(true);
  const [aiQuestionsMap, setAiQuestionsMap] = useState<Record<string, LadderQuestion[]>>({});
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);
  const [aiGenerationNotice, setAiGenerationNotice] = useState<string | null>(null);

  // CareType & Engine Data
  const currentCare = getCareTypeDetail(careTypeCode);
  const primingGuide = getBrainPrimingGuide(careTypeCode, unitName);
  const timerConfig = getAdaptiveTimerConfig(careTypeCode);
  const conceptChecks = useMemo(
    // 진입 시 선지 1회 셔플 (정답 1번 고정 악용 차단, 풀이 중 순서 고정)
    () => shuffleConceptCheckOptions(getMetacognitiveConceptCheck(unitName, subjectName)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [unitName, subjectName]
  );
  const allLadderQuestions = useMemo(
    // 단원 진입 시 선지 1회 셔플 (정답 위치 암기·패턴 공략 차단, 풀이 중 순서 고정)
    () => shuffleLadderOptions(getQuestionsForUnit(unitName, subjectName)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [unitName, subjectName]
  );

  // Phase 1: Priming Timer State
  const [primingSecondsLeft, setPrimingSecondsLeft] = useState<number>(primingGuide.recommendedDurationMinutes * 60);
  const [isPrimingRunning, setIsPrimingRunning] = useState<boolean>(true);
  const [showPrimingBreath, setShowPrimingBreath] = useState<boolean>(false);
  const primingBreath = useMemo(
    () => recommendBreathingProtocols(careTypeCode, 'pre_study'),
    [careTypeCode]
  );

  // Phase 2: Concept Check State
  const [conceptAnswers, setConceptAnswers] = useState<Record<number, number>>({});
  const [showConceptExplanations, setShowConceptExplanations] = useState<Record<number, boolean>>({});

  // Phase 3: Ladder Study State
  const [currentStage, setCurrentStage] = useState<LadderStageLevel>(initialStage || 'A');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0); // 0 ~ 4 (5 questions per stage)
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [userAnswers, setUserAnswers] = useState<Record<string, { selected: string; isCorrect: boolean }>>({});
  const [completedStages, setCompletedStages] = useState<LadderStageLevel[]>([]);
  const [showStageSuccessModal, setShowStageSuccessModal] = useState<boolean>(false);

  // Adaptive Timer State
  const [studySecondsLeft, setStudySecondsLeft] = useState<number>(timerConfig.defaultMinutes * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(timerConfig.defaultMinutes > 0);

  // Filter questions for current stage (AI 모드 활성화 시 AI 생성 문항 우선, 미생성/오프라인 시 표준 기출)
  const currentStageAiList = aiQuestionsMap[currentStage];
  const stageQuestions = (isAiMode && currentStageAiList && currentStageAiList.length > 0)
    ? currentStageAiList
    : allLadderQuestions.filter(q => q.stage === currentStage);

  // 뱅크에 실제 존재하는 단계만 탭/진행에 사용 (라이트 뱅크 A/B/C 3단계 지원)
  const availableStages = useMemo<LadderStageLevel[]>(() => {
    const order: LadderStageLevel[] = ['A', 'B', 'C', 'D', 'E', 'F'];
    const present = order.filter(s => allLadderQuestions.some(q => q.stage === s));
    return present.length > 0 ? present : order;
  }, [allLadderQuestions]);
  const isLightBank = availableStages.length === 3;

  const activeQuestion: LadderQuestion | undefined = stageQuestions[currentQuestionIndex];

  // Priming Countdown
  useEffect(() => {
    let interval: any = null;
    if (isOpen && currentPhase === 1 && isPrimingRunning && primingSecondsLeft > 0) {
      interval = setInterval(() => {
        setPrimingSecondsLeft(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, currentPhase, isPrimingRunning, primingSecondsLeft]);

  // Flow Timer Countdown
  useEffect(() => {
    let interval: any = null;
    if (isOpen && currentPhase === 3 && isTimerRunning && studySecondsLeft > 0) {
      interval = setInterval(() => {
        setStudySecondsLeft(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, currentPhase, isTimerRunning, studySecondsLeft]);

  // Reset states when modal re-opens with new unit
  useEffect(() => {
    if (isOpen) {
      setCurrentPhase(1);
      setPrimingSecondsLeft(primingGuide.recommendedDurationMinutes * 60);
      setIsPrimingRunning(true);
      setConceptAnswers({});
      setShowConceptExplanations({});
      setCurrentStage('A');
      setCurrentQuestionIndex(0);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setShowHint(false);
      setUserAnswers({});
      setCompletedStages([]);
      setShowStageSuccessModal(false);
      setStudySecondsLeft(timerConfig.defaultMinutes * 60);
      setIsTimerRunning(timerConfig.defaultMinutes > 0);
    }
  }, [isOpen, unitName, careTypeCode]);

  // AI 문항 로드 및 신규 생성 핸들러
  const loadAiQuestions = async (stage: LadderStageLevel, forceRegen = false) => {
    if (!isAiMode) return;
    setIsAiGenerating(true);
    setAiGenerationNotice(`${aiConfig.modelDisplayName} (${aiConfig.specialtyBadge})가 ${stage}단계 5문항을 출제 중입니다...`);
    try {
      const res = await getCachedOrGenerateStageQuestions(
        subjectName,
        unitName,
        stage,
        careTypeCode,
        null,
        forceRegen
      );
      if (res.questions && res.questions.length > 0) {
        setAiQuestionsMap(prev => ({
          ...prev,
          [stage]: res.questions
        }));
        setAiGenerationNotice(res.isAiGenerated ? `✨ ${aiConfig.modelDisplayName} 맞춤 출제 완료` : '기본 기출 문항으로 준비되었습니다.');
      }
    } catch (e) {
      console.warn('AI question generation error:', e);
    } finally {
      setIsAiGenerating(false);
      setTimeout(() => setAiGenerationNotice(null), 3000);
    }
  };

  // Phase 3 진입 시 또는 단계 전환 시 AI 문항 로드
  useEffect(() => {
    if (isOpen && currentPhase === 3 && isAiMode && !aiQuestionsMap[currentStage]) {
      loadAiQuestions(currentStage, false);
    }
  }, [isOpen, currentPhase, currentStage, isAiMode]);

  if (!isOpen) return null;

  // Formatting helpers
  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Submit Answer in Phase 3
  const handleAnswerSubmit = () => {
    if (!selectedOption || !activeQuestion || isAnswerSubmitted) return;

    const isCorrect = selectedOption === String(activeQuestion.answer);
    setUserAnswers(prev => ({
      ...prev,
      [activeQuestion.id]: { selected: selectedOption, isCorrect }
    }));
    setIsAnswerSubmitted(true);

    // [P2-10] 문항 품질(오답률) 기록 — 난이도 보정 통계용 (실패해도 UX 영향 없음)
    try {
      recordLadderAttempt({
        questionId: activeQuestion.id,
        unitKey: `${subjectName}::${unitName}`,
        stage: String(activeQuestion.stage ?? currentStage),
        correct: isCorrect,
      });
    } catch {
      /* 품질 기록 실패는 무시 */
    }
  };

  // Next Question or Next Stage
  const handleNextQuestion = () => {
    if (currentQuestionIndex < stageQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setShowHint(false);
    } else {
      // Stage Completed!
      const nextCompleted = Array.from(new Set([...completedStages, currentStage]));
      setCompletedStages(nextCompleted);
      setShowStageSuccessModal(true);
    }
  };

  // Move to next stage ladder
  const handleAdvanceToNextStage = () => {
    setShowStageSuccessModal(false);
    const currentIndex = availableStages.indexOf(currentStage);

    if (currentIndex >= 0 && currentIndex < availableStages.length - 1) {
      const nextStage = availableStages[currentIndex + 1];
      setCurrentStage(nextStage);
      setCurrentQuestionIndex(0);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setShowHint(false);
    } else {
      // All Available Stages Completed!
      setCurrentPhase(4);
    }
  };

  // Scores Summary
  const totalQuestionsSolved = Object.keys(userAnswers).length;
  const totalCorrectCount = Object.values(userAnswers).filter(a => a.isCorrect).length;
  const accuracyPct = totalQuestionsSolved > 0 ? Math.round((totalCorrectCount / totalQuestionsSolved) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl text-slate-100 animate-in fade-in zoom-in-95 duration-200">

        {/* Modal Top Header */}
        <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{currentCare.emoji}</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white">
                  {unitName} <span className="text-blue-400">신경인지 {availableStages.length}단계 사다리 훈련</span>
                </h2>
                <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${weakPriority === 1 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                    weakPriority === 2 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                      'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                  }`}>
                  취약 {weakPriority}순위 공략
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {student.name} 학생 · 신경인지 상태: {hasAssessment ? (
                  <span className="text-emerald-400 font-bold">{currentCare.title} ({currentCare.code})</span>
                ) : (
                  <span className="text-slate-300 font-bold">미측정 (기본 프로그램)</span>
                )}
              </p>
            </div>
          </div>

          {/* Phase Indicators */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 text-xs">
            <button
              onClick={() => setCurrentPhase(1)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${currentPhase === 1 ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
            >
              1. 뇌 프라이밍
            </button>
            <button
              onClick={() => setCurrentPhase(2)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${currentPhase === 2 ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
            >
              2. 개념 메타점검 (3)
            </button>
            <button
              onClick={() => setCurrentPhase(3)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${currentPhase === 3 ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
            >
              3. 6단계 사다리
            </button>
            <button
              onClick={() => setCurrentPhase(4)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${currentPhase === 4 ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
            >
              4. 훈련 리포트
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Main Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-gradient-to-b from-slate-900 to-slate-950">

          {/* ========================================================================= */}
          {/* PHASE 1: BRAIN PRIMING                                                    */}
          {/* ========================================================================= */}
          {currentPhase === 1 && (
            <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300 py-4">
              <div className="text-center space-y-2">
                <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold border border-blue-500/30">
                  STEP 1 : 뇌 신경 프라이밍
                </span>
                <h3 className="text-2xl font-black text-white">{primingGuide.prepTitle}</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {primingGuide.description}
                </p>
              </div>

              {/* Breathing / Technique Interactive Card */}
              <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-6 text-center space-y-5 shadow-xl relative overflow-hidden">
                <div className="w-36 h-36 mx-auto rounded-full bg-gradient-to-tr from-blue-600/30 to-teal-400/20 border-2 border-blue-400/50 flex flex-col items-center justify-center shadow-inner relative">
                  <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-blue-500" />
                  <span className="text-3xl font-black text-blue-300 font-mono">
                    {formatSeconds(primingSecondsLeft)}
                  </span>
                  <span className="text-[11px] text-slate-400 mt-1 font-semibold">
                    {isPrimingRunning ? '호흡 조절 중...' : '일시정지됨'}
                  </span>
                </div>

                <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-700/80 text-left space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <span>🫁</span>
                    <span>추천 신경 호흡 기법</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">
                    {primingGuide.breathingTechnique}
                  </p>
                </div>

                <div className="bg-blue-950/40 p-4 rounded-2xl border border-blue-900/60 text-left space-y-1">
                  <div className="flex items-center gap-1.5 text-blue-400 font-bold text-xs">
                    <span>🔬</span>
                    <span>{currentCare.title} 전용 뇌 과학 처방</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {primingGuide.neuroScienceTip}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => setIsPrimingRunning(!isPrimingRunning)}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-xs font-bold text-slate-200 transition-colors cursor-pointer"
                  >
                    {isPrimingRunning ? '⏸️ 일시 정지' : '▶️ 호흡 타이머 재개'}
                  </button>
                  <button
                    onClick={() => setShowPrimingBreath(v => !v)}
                    className="px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 rounded-xl text-xs font-bold text-indigo-300 transition-colors cursor-pointer"
                    title={`${primingBreath.primary.name} 가이드 타이머`}
                  >
                    {primingBreath.primary.emoji} {primingBreath.primary.name.split(' (')[0]} 타이머 {showPrimingBreath ? '닫기' : '열기'}
                  </button>
                  <button
                    onClick={() => setCurrentPhase(2)}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-sm font-black shadow-lg hover:shadow-blue-500/25 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <span>두뇌 세팅 완료! 필수 개념 자가진단 ➔</span>
                  </button>
                </div>
                {showPrimingBreath && (
                  <div className="bg-white rounded-3xl p-5 text-slate-900 animate-in fade-in duration-200">
                    <p className="text-xs font-bold text-slate-500 mb-3">
                      {primingBreath.primary.oneLiner} · 약 {primingBreath.primary.estMinutes}분
                    </p>
                    <BreathingCore key={primingBreath.primary.id} pattern={primingBreath.primary.pattern} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PHASE 2: METACOGNITIVE CONCEPT CHECK                                      */}
          {/* ========================================================================= */}
          {currentPhase === 2 && (
            <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300 py-2">
              <div className="space-y-1">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                  STEP 2 : 필수 개념 메타인지 자가진단 (3문항)
                </span>
                <h3 className="text-xl font-black text-white">
                  '{unitName}' 문제 풀기 전, 핵심 공식과 원리를 완벽히 알고 있는지 체크!
                </h3>
                <p className="text-xs text-slate-400">
                  문제를 풀기 전에 필수 공식을 정확히 뇌에서 꺼낼 수 있는지 3가지 핵심 질문을 점검합니다.
                </p>
              </div>

              <div className="space-y-4">
                {conceptChecks.map((item, idx) => {
                  const selectedIdx = conceptAnswers[idx];
                  const hasAnswered = selectedIdx !== undefined;
                  const isCorrect = selectedIdx === item.correctIndex;
                  const showExp = showConceptExplanations[idx] || hasAnswered;

                  return (
                    <div key={item.id} className="bg-slate-800/70 border border-slate-700/80 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20">
                          Q{idx + 1}. {item.conceptName}
                        </span>
                        {hasAnswered && (
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${isCorrect ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                            }`}>
                            {isCorrect ? '⭕ 완벽한 메타인지 인출' : '⚠️ 공식 재점검 필요'}
                          </span>
                        )}
                      </div>

                      <p className="text-sm font-bold text-slate-100 leading-snug">
                        {item.question}
                      </p>

                      <div className="space-y-2 pt-1">
                        {item.options.map((opt, optIdx) => {
                          const isThisSelected = selectedIdx === optIdx;
                          const isThisCorrect = optIdx === item.correctIndex;

                          let btnStyle = 'bg-slate-900/60 border-slate-700/60 text-slate-300 hover:border-slate-500 hover:bg-slate-800';
                          if (hasAnswered) {
                            if (isThisCorrect) {
                              btnStyle = 'bg-emerald-950/40 border-emerald-500 text-emerald-200 font-bold';
                            } else if (isThisSelected) {
                              btnStyle = 'bg-rose-950/40 border-rose-500 text-rose-200';
                            } else {
                              btnStyle = 'bg-slate-900/30 border-slate-800 text-slate-500 opacity-60';
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              disabled={hasAnswered}
                              onClick={() => {
                                setConceptAnswers(prev => ({ ...prev, [idx]: optIdx }));
                                setShowConceptExplanations(prev => ({ ...prev, [idx]: true }));
                              }}
                              className={`w-full text-left p-3 rounded-xl border text-xs leading-relaxed transition-all cursor-pointer flex items-start gap-2.5 ${btnStyle}`}
                            >
                              <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                                {optIdx + 1}
                              </span>
                              <span>{opt}</span>
                            </button>
                          );
                        })}
                      </div>

                      {showExp && (
                        <div className="p-3 bg-blue-950/30 border border-blue-900/40 rounded-xl text-xs text-slate-300 space-y-1">
                          <span className="text-[11px] font-bold text-blue-400">💡 뇌인지 해설 &amp; 핵심 공식:</span>
                          <p className="leading-relaxed">{item.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Advance Button */}
              <div className="pt-4 flex justify-between items-center">
                <button
                  onClick={() => setCurrentPhase(1)}
                  className="text-xs text-slate-400 hover:text-white font-bold cursor-pointer"
                >
                  ◀ 1단계 호흡 프라이밍으로
                </button>
                <button
                  onClick={() => setCurrentPhase(3)}
                  disabled={Object.keys(conceptAnswers).length < conceptChecks.length}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-black shadow-lg transition-all cursor-pointer flex items-center gap-2"
                >
                  <span>🪜 6단계 문항 사다리 훈련 시작! (A to F) ➔</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PHASE 3: 6-STAGE LADDER STUDY ROOM                                        */}
          {/* ========================================================================= */}
          {currentPhase === 3 && (
            <div className="space-y-6 animate-in fade-in duration-300">

              {/* 🌟 2026 SOTA 과목별 특화 AI 실시간 출제 컨트롤러 바 */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 p-3.5 rounded-2xl border border-indigo-500/30 text-xs shadow-md">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="flex items-center gap-1.5 bg-slate-800/90 px-3 py-1 rounded-xl border border-indigo-400/30">
                    <span className="text-sm">
                      {subjectKey === 'korean' ? '📖' : subjectKey === 'math' ? '🧮' : subjectKey === 'inquiry' ? '🔬' : '⚡'}
                    </span>
                    <span className="font-black text-white">{aiConfig.modelDisplayName}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                      {aiConfig.specialtyBadge}
                    </span>
                  </div>
                  <span className="text-slate-400 text-[11px] hidden md:inline">
                    {aiConfig.description}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* 모드 선택 (표준 기출 vs AI 실시간 생성) */}
                  <div className="flex items-center bg-slate-950 p-0.5 rounded-xl border border-slate-800 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setIsAiMode(false)}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        !isAiMode ? 'bg-slate-700 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      표준 기출
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAiMode(true);
                        if (!aiQuestionsMap[currentStage]) {
                          loadAiQuestions(currentStage, false);
                        }
                      }}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        isAiMode ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span>✨ AI 실시간 출제</span>
                    </button>
                  </div>

                  {/* 🔄 신규 문항 다시 출제 (재도전/답 암기 방지용) */}
                  {isAiMode && (
                    <button
                      type="button"
                      disabled={isAiGenerating}
                      onClick={() => {
                        loadAiQuestions(currentStage, true);
                        setCurrentQuestionIndex(0);
                        setSelectedOption(null);
                        setIsAnswerSubmitted(false);
                        setShowHint(false);
                      }}
                      className="px-2.5 py-1 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 rounded-xl font-bold flex items-center gap-1 text-[11px] transition-all cursor-pointer disabled:opacity-50"
                      title="현재 단계의 문제를 AI로 완전히 새로운 변형/신유형으로 다시 출제합니다"
                    >
                      <span className={isAiGenerating ? 'animate-spin' : ''}>🔄</span>
                      <span>새 문항 출제</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Stage Ladder Bar (A to F Tabs) */}
              {startReason && (
                <div className="mb-2 text-[11px] font-bold text-indigo-300">
                  🧠 {startReason} (추정치, 단계 이동 자유)
                </div>
              )}
              <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${availableStages.length}, minmax(0, 1fr))` }}>
                {availableStages.map(stageKey => {
                  const sInfo = LADDER_STAGES[stageKey];
                  const isCurrent = currentStage === stageKey;
                  const isCompleted = completedStages.includes(stageKey);

                  return (
                    <button
                      key={stageKey}
                      onClick={() => {
                        setCurrentStage(stageKey);
                        setCurrentQuestionIndex(0);
                        setSelectedOption(null);
                        setIsAnswerSubmitted(false);
                        setShowHint(false);
                      }}
                      className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 relative ${isCurrent
                          ? 'bg-blue-600/30 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                          : isCompleted
                            ? 'bg-emerald-950/20 border-emerald-600/40 text-emerald-300'
                            : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                        }`}
                    >
                      <span className="text-base">{sInfo.icon}</span>
                      <span className="text-xs font-black">{stageKey}단계</span>
                      <span className="text-[10px] truncate max-w-full font-medium">
                        {isLightBank
                          ? (stageKey === 'A' ? '개념' : stageKey === 'B' ? '자료해석' : '킬러')
                          : (stageKey === 'A' ? '기본' : stageKey === 'B' ? '진행' : stageKey === 'C' ? '심화' : stageKey === 'D' ? '기출' : stageKey === 'E' ? '준킬러' : '수능킬러')}
                      </span>
                      {isCompleted && (
                        <span className="absolute top-1.5 right-1.5 text-[9px] font-black text-emerald-400">✓</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Flow Timer & CareType Advice Banner */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/80 text-xs">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                    ⏱️ {timerConfig.modeName}
                  </span>
                  <span className="text-slate-300 hidden md:inline">
                    {timerConfig.neuroAdvice}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {studySecondsLeft > 0 ? (
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-black text-amber-400 bg-slate-900 px-3 py-1 rounded-lg border border-slate-700">
                        {formatSeconds(studySecondsLeft)}
                      </span>
                      <button
                        onClick={() => setIsTimerRunning(!isTimerRunning)}
                        className="text-slate-400 hover:text-white font-bold cursor-pointer"
                      >
                        {isTimerRunning ? '일시정지' : '재개'}
                      </button>
                    </div>
                  ) : (
                    <span className="text-slate-400 font-semibold">노타이머(자유 플로우)</span>
                  )}
                </div>
              </div>

              {/* AI 출제 중 로딩 인디케이터 */}
              {isAiGenerating ? (
                <div className="bg-slate-800/90 border border-indigo-500/40 rounded-3xl p-12 text-center space-y-4 shadow-2xl animate-pulse">
                  <div className="w-12 h-12 border-3 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto" />
                  <div className="space-y-1">
                    <h4 className="text-base font-black text-white flex items-center justify-center gap-2">
                      <span>✨</span>
                      <span>{aiConfig.modelDisplayName} 맞춤 출제 진행 중</span>
                    </h4>
                    <p className="text-xs text-indigo-200">
                      {aiGenerationNotice || `${aiConfig.modelDisplayName} (${aiConfig.specialtyBadge})가 ${currentStage}단계 5문항을 생성하고 있습니다.`}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      평가원 출제 원리 및 수식 무결성 검증을 거쳐 출제됩니다. 잠시만 기다려주세요.
                    </p>
                  </div>
                </div>
              ) : activeQuestion ? (
                /* Question Card */
                <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-6 space-y-6 shadow-xl">

                  {/* Stage Header */}
                  <div className="flex items-center justify-between border-b border-slate-700/80 pb-4">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{LADDER_STAGES[currentStage].icon}</span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-black text-blue-400 uppercase tracking-wider">
                            {LADDER_STAGES[currentStage].title}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-700 text-slate-300">
                            {currentQuestionIndex + 1} / {stageQuestions.length} 문항
                          </span>
                          {isAiMode && currentStageAiList ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                              <span>✨</span>
                              <span>{aiConfig.modelDisplayName} 출제</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-700/80 text-slate-300">
                              표준 기출
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {LADDER_STAGES[currentStage].targetFocus}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowHint(!showHint)}
                      className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                    >
                      <span>💡 뇌과학 힌트</span>
                      <span>{showHint ? '닫기' : '보기'}</span>
                    </button>
                  </div>

                {/* Hint Box (Collapsible) */}
                {showHint && (
                  <div className="p-3.5 bg-amber-950/30 border border-amber-800/50 rounded-2xl text-xs text-amber-200 space-y-1 animate-in fade-in duration-200">
                    <span className="font-bold flex items-center gap-1">
                      <span>🔑</span> 핵심 발상 &amp; 공식 힌트:
                    </span>
                    <p className="leading-relaxed">{activeQuestion.hint}</p>
                  </div>
                )}

                {/* Question Text */}
                <div className="space-y-3">
                  <h4 className="text-sm font-black text-slate-300">
                    {activeQuestion.title}
                  </h4>
                  <div className="p-5 bg-slate-900/90 rounded-2xl border border-slate-700/80 text-sm md:text-base font-semibold leading-relaxed text-white whitespace-pre-line shadow-inner">
                    {activeQuestion.question}
                  </div>
                </div>

                {/* Options (Multiple Choice) */}
                <div className="space-y-2.5">
                  <label className="text-xs font-bold text-slate-400">보기 선택</label>
                  <div className="grid grid-cols-1 gap-2.5">
                    {activeQuestion.options?.map((opt, oIdx) => {
                      const isThisSelected = selectedOption === opt;
                      const isThisCorrect = opt === String(activeQuestion.answer);

                      let optClasses = 'bg-slate-900/60 border-slate-700/80 text-slate-200 hover:bg-slate-700/60 hover:border-slate-600';
                      if (isAnswerSubmitted) {
                        if (isThisCorrect) {
                          optClasses = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-bold shadow-sm shadow-emerald-500/20';
                        } else if (isThisSelected) {
                          optClasses = 'bg-rose-950/60 border-rose-500 text-rose-200 font-bold';
                        } else {
                          optClasses = 'bg-slate-900/30 border-slate-800 text-slate-500 opacity-50';
                        }
                      } else if (isThisSelected) {
                        optClasses = 'bg-blue-600/30 border-blue-500 text-white font-bold ring-2 ring-blue-500/30';
                      }

                      return (
                        <button
                          key={oIdx}
                          disabled={isAnswerSubmitted}
                          onClick={() => setSelectedOption(opt)}
                          className={`w-full text-left p-3.5 rounded-2xl border text-sm transition-all cursor-pointer flex items-center justify-between ${optClasses}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">
                              {oIdx + 1}
                            </span>
                            <span>{opt}</span>
                          </div>
                          {isAnswerSubmitted && isThisCorrect && (
                            <span className="text-xs font-black text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded">
                              정답 ✓
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Submit & Navigation Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-700/80">
                  <div className="text-xs text-slate-400 font-medium">
                    {isAnswerSubmitted ? (
                      userAnswers[activeQuestion.id]?.isCorrect ? (
                        <span className="text-emerald-400 font-bold">🎉 완벽한 정답! 도파민 보상 포인트 획득</span>
                      ) : (
                        <span className="text-rose-400 font-bold">⚠️ 오답 발생 - 아래 뇌 과학 해설을 확인하세요</span>
                      )
                    ) : (
                      '정답을 선택하고 [정답 제출]을 누르세요.'
                    )}
                  </div>

                  {!isAnswerSubmitted ? (
                    <button
                      onClick={handleAnswerSubmit}
                      disabled={!selectedOption}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-black shadow-lg transition-all cursor-pointer"
                    >
                      정답 제출
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <span>
                        {currentQuestionIndex < stageQuestions.length - 1 ? '다음 문제 풀기 ➔' : `${currentStage}단계 완수 & 배지 획득! ➔`}
                      </span>
                    </button>
                  )}
                </div>

                {/* Solution & Neuro-Feedback Card (Displayed upon submission) */}
                {isAnswerSubmitted && (
                  <div className="space-y-3 pt-3 border-t border-slate-700/60 animate-in fade-in duration-300">
                    {/* Neuro Error Feedback if wrong */}
                    {!userAnswers[activeQuestion.id]?.isCorrect && (
                      <div className="p-3.5 bg-rose-950/40 border border-rose-800/60 rounded-2xl text-xs text-rose-200 leading-relaxed font-medium">
                        {getNeuroErrorFeedback(careTypeCode, currentStage, unitName)}
                      </div>
                    )}

                    {/* Mathematical Solution */}
                    <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-700/80 text-xs text-slate-200 space-y-2">
                      <div className="flex items-center justify-between text-blue-400 font-bold">
                        <span>📝 상세 풀이 및 도출 과정:</span>
                        <span className="text-slate-400 text-[11px]">정답: {activeQuestion.answer}</span>
                      </div>
                      <p className="whitespace-pre-line leading-relaxed text-slate-300 font-mono">
                        {activeQuestion.solution}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
            </div>
          )}

          {/* ========================================================================= */}
          {/* STAGE SUCCESS MODAL POPUP (Triggered after 5 questions)                   */}
          {/* ========================================================================= */}
          {showStageSuccessModal && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-60 flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-md w-full text-center space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="w-20 h-20 mx-auto rounded-full bg-blue-600/20 border-2 border-blue-400 flex items-center justify-center text-4xl shadow-lg">
                  {LADDER_STAGES[currentStage].icon}
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">
                    STAGE CLEARED!
                  </span>
                  <h3 className="text-2xl font-black text-white">
                    {LADDER_STAGES[currentStage].badgeName} 획득!
                  </h3>
                  <p className="text-xs text-slate-300">
                    {currentStage}단계 5문항을 완주하여 뇌 회로 신경망을 성공적으로 강화했습니다.
                  </p>
                </div>

                <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 text-xs text-slate-300 space-y-1 text-left">
                  <div className="flex justify-between">
                    <span>이 단계 정답 문항:</span>
                    <span className="font-bold text-white">
                      {stageQuestions.filter(q => userAnswers[q.id]?.isCorrect).length} / 5개
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>신경인지 적응도:</span>
                    <span className="font-bold text-emerald-400">최상위 몰입 유지</span>
                  </div>
                </div>

                <button
                  onClick={handleAdvanceToNextStage}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-black text-sm shadow-xl transition-all cursor-pointer"
                >
                  {currentStage === 'F' ? '최종 훈련 종합 리포트 보기 ➔' : '다음 단계 사다리 오르기 ➔'}
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PHASE 4: FINAL COMPLETION SUMMARY                                         */}
          {/* ========================================================================= */}
          {currentPhase === 4 && (
            <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300 py-4">
              <div className="text-center space-y-2">
                <span className="text-4xl">👑</span>
                <h3 className="text-2xl font-black text-white">
                  '{unitName}' {availableStages.length}단계 사다리 훈련 종합 리포트
                </h3>
                <p className="text-xs text-slate-300">
                  {student.name} 학생의 신경인지 상태({currentCare.title})에 맞춘 훈련이 성공적으로 기록되었습니다.
                </p>
              </div>

              {/* Badges Collection */}
              <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-6 space-y-4 shadow-xl">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider text-center">
                  획득한 {availableStages.length}단계 사다리 배지 컬렉션
                </h4>
                <div className="grid grid-cols-3 gap-2" style={{ gridTemplateColumns: `repeat(${availableStages.length}, minmax(0, 1fr))` }}>
                  {availableStages.map(stageKey => {
                    const sInfo = LADDER_STAGES[stageKey];
                    const isPassed = completedStages.includes(stageKey);

                    return (
                      <div
                        key={stageKey}
                        className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1 ${isPassed
                            ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200'
                            : 'bg-slate-900/40 border-slate-800 text-slate-600 opacity-50'
                          }`}
                      >
                        <span className="text-2xl">{sInfo.icon}</span>
                        <span className="text-xs font-black">{stageKey}단계</span>
                        <span className="text-[10px] truncate max-w-full font-bold">
                          {isPassed ? '클리어 ✓' : '미완'}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Score Stats */}
                <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-700/80">
                  <div className="p-3 bg-slate-900/80 rounded-xl text-center">
                    <span className="text-[10px] text-slate-400 block font-bold">총 도전 문항</span>
                    <span className="text-lg font-black text-white">{totalQuestionsSolved}문항</span>
                  </div>
                  <div className="p-3 bg-slate-900/80 rounded-xl text-center">
                    <span className="text-[10px] text-slate-400 block font-bold">정답 개수</span>
                    <span className="text-lg font-black text-emerald-400">{totalCorrectCount}개</span>
                  </div>
                  <div className="p-3 bg-slate-900/80 rounded-xl text-center">
                    <span className="text-[10px] text-slate-400 block font-bold">정답률</span>
                    <span className="text-lg font-black text-blue-400">{accuracyPct}%</span>
                  </div>
                </div>
                {/* 🌟 2026 SOTA 특화 AI 출제 검증 인증 배너 */}
                <div className="mt-3 pt-3 border-t border-slate-700/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🤖</span>
                    <span className="text-slate-300">
                      출제 엔진: <strong className="text-white">{aiConfig.modelDisplayName}</strong> ({aiConfig.specialtyBadge})
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-300 bg-indigo-500/20 px-2.5 py-0.5 rounded-full border border-indigo-500/30">
                    2026 SOTA 특화 AI 출제 검증 완료
                  </span>
                </div>
              </div>

              {/* CareType Specific Next Advice */}
              <div className="bg-gradient-to-r from-blue-950/50 to-indigo-950/50 border border-blue-800/60 rounded-3xl p-5 space-y-2">
                <div className="flex items-center gap-2 text-blue-300 font-bold text-xs">
                  <span>🧠</span>
                  <span>신경인지 기반 향후 학업 권고</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  방금 훈련을 통해 '{unitName}' 단원의 취약 고리가 A단계부터 고난도 사다리로 연결되었습니다.
                  {currentCare.title} 상태에서는 연속 100문항 양치기보다 오늘처럼 <b>5문항 단위의 단계적 난이도 사다리</b>를 매일 1개 단원씩 정복하는 것이 수능 당일 뇌의 Freezing(머리 하얘짐) 완화에 도움이 됩니다.
                </p>
              </div>

              <div className="flex justify-center pt-2">
                <button
                  onClick={onClose}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-sm shadow-xl transition-all cursor-pointer"
                >
                  훈련 완료 및 성적 대시보드로 복귀
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
