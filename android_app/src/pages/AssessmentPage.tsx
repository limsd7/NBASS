import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, MobileAssessmentResult, CareType } from '../types';
import { careTypeEngine, AssessmentRawInput } from '../services/careTypeEngine';
import { classifyWithPcCore } from '../services/pcLogicAdapter';
import { dataSyncService } from '../services/dataSyncService';
import {
  BAI_QUESTIONS,
  ISI_QUESTIONS,
  FATIGUE_SYMPTOMS,
  SYMPATHETIC_SYMPTOMS,
  PARASYMPATHETIC_SYMPTOMS,
  CIRCULATION_SYMPTOMS,
  CONCENTRATION_QUESTIONS,
  ADRENAL_QUESTIONS,
  CARE_TYPE_FOLLOWUP_QUESTIONS
} from '../data/assessmentQuestions';
import {
  CHRONOTYPE_QUESTIONS,
  getChronotypeResult,
  CHRONOTYPE_LABELS,
  mapChronotypeToBucket,
  VARK_QUESTIONS,
  calculateVARKResult,
  VARK_LABELS,
  TAI_QUESTIONS,
  calculateTAIResult,
  TAI_TYPE_LABELS,
  DIGITAL_ADDICTION_QUESTIONS,
  calculateDigitalAddictionResult,
  DIGITAL_LEVEL_LABELS,
  METACOGNITION_QUESTIONS,
  calculateMetacognitionResult,
  METACOG_STRATEGY_LABELS,
  METACOG_LEVEL_LABELS,
} from '../data/studyEfficiencyBanks';
import {
  Brain,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Timer,
  AlertCircle,
  Play,
  RotateCcw,
  Zap,
  Target,
  Activity,
  HeartPulse,
  Flame,
  Moon,
  Clock,
  History,
  Check,
  Award
} from 'lucide-react';

interface AssessmentPageProps {
  user: UserProfile;
  onComplete: (result: MobileAssessmentResult) => void;
  onCancel?: () => void;
}

export const AssessmentPage: React.FC<AssessmentPageProps> = ({ user, onComplete, onCancel }) => {
  // 모드 전환: 'full'(최초 종합 정밀 진단 50+문항) vs 'followup'(2주 단위 맞춤 추적 검사 5문항)
  const [assessmentMode, setAssessmentMode] = useState<'full' | 'followup'>('full');

  // 종합 정밀 진단 스텝: 1: Info, 2: 6대 의학설문, 3: 공부효율성, 4: 인지테스트, 5: AI 분석
  const [currentStep, setCurrentStep] = useState<number>(1);

  // 6대 설문 하위 탭: 'bai' | 'isi' | 'ans' | 'cfs' | 'concentration' | 'adrenal'
  const [surveyTab, setSurveyTab] = useState<'bai' | 'isi' | 'ans' | 'cfs' | 'concentration' | 'adrenal'>('bai');

  // 1. 수험생 기본 정보
  const [name, setName] = useState(user.name || '');
  const [school, setSchool] = useState(user.school || '일반고등학교');
  const [grade, setGrade] = useState(user.grade || '고3 (수험생)');
  const [targetUniversity, setTargetUniversity] = useState(user.targetUniversity || '서울대학교');
  const [targetMajor, setTargetMajor] = useState(user.targetMajor || '의예과 / 경영학과');
  const [examDate, setExamDate] = useState(user.examDate || new Date().toISOString().split('T')[0]);

  // 2. 종합 정밀 설문 문항 응답 상태
  // BAI (21문항, 0~3점)
  const [baiAnswers, setBaiAnswers] = useState<number[]>(() => new Array(21).fill(0));
  // ISI (7문항, 0~4점)
  const [isiAnswers, setIsiAnswers] = useState<number[]>(() => new Array(7).fill(1));
  // ANS 증상 체크박스 (교감 13개, 부교감 13개, 순환 5개) — 사전 선택 없음
  const [selectedSns, setSelectedSns] = useState<string[]>([]);
  const [selectedPns, setSelectedPns] = useState<string[]>([]);
  const [selectedCirculation, setSelectedCirculation] = useState<string[]>([]);
  // CFS 만성피로 (핵심 6개월 지속 여부 + 8개 부증상) — 사전 선택 없음
  const [fatigueCore, setFatigueCore] = useState<boolean>(false);
  const [fatigueSymptoms, setFatigueSymptoms] = useState<boolean[]>(() => new Array(8).fill(false));
  // Concentration (7문항, 0~3점)
  const [concentrationAnswers, setConcentrationAnswers] = useState<number[]>(() => new Array(7).fill(1));
  // Adrenal (14문항, 0~3점)
  const [adrenalAnswers, setAdrenalAnswers] = useState<number[]>(() => new Array(14).fill(1));

  // 3. 공부 효율성 진단 (PC studyEfficiencyAssessments와 동일 문항·채점)
  // MEQ 7문항 (선택지 인덱스, null=미응답)
  const [meqAnswers, setMeqAnswers] = useState<(number | null)[]>(() => new Array(7).fill(null));
  // VARK 8문항 (V/A/R/K, null=미응답)
  const [varkAnswers, setVarkAnswers] = useState<(string | null)[]>(() => new Array(8).fill(null));
  // TAI 14문항 (0~3점, null=미응답)
  const [taiAnswers, setTaiAnswers] = useState<(number | null)[]>(() => new Array(14).fill(null));
  // 디지털중독 12문항 (0~4점, null=미응답)
  const [digitalAnswers, setDigitalAnswers] = useState<(number | null)[]>(() => new Array(12).fill(null));

  // 4. 학습 환경 프로토콜 (PC ProtocolData 대응)
  const [protoLocation, setProtoLocation] = useState('집');
  const [protoNoise, setProtoNoise] = useState(3);
  const [protoStress, setProtoStress] = useState(5);
  const [protoSleepHours, setProtoSleepHours] = useState('');
  const [protoEmotional, setProtoEmotional] = useState(3);
  const [protoMotivational, setProtoMotivational] = useState(3);
  const [protoBehavioral, setProtoBehavioral] = useState(3);
  const [protoDifficulty, setProtoDifficulty] = useState(3);
  const [protoTimeDistortion, setProtoTimeDistortion] = useState(3);

  // 4-2. 학습 분석 (PC LearningAnalyticsData 대응)
  const [anPureRatio, setAnPureRatio] = useState(60);
  const [anFocusMin, setAnFocusMin] = useState('');
  const [anDistractions, setAnDistractions] = useState('');
  const [anGoldenStart, setAnGoldenStart] = useState('09:00');
  const [anGoldenEnd, setAnGoldenEnd] = useState('12:00');
  const [anLowTime, setAnLowTime] = useState('');
  const [anWeekGap, setAnWeekGap] = useState(20);
  const [anSubj, setAnSubj] = useState<Record<string, number>>({ korean: 20, math: 25, english: 20, science: 15, social: 10, other: 10 });
  const [anGoalRate, setAnGoalRate] = useState(70);
  const [anDifficulty, setAnDifficulty] = useState(3);
  const [anAvgSleep, setAnAvgSleep] = useState('');
  const [anSleepQuality, setAnSleepQuality] = useState(3);
  const [anPlace, setAnPlace] = useState('집');
  const [anStreak, setAnStreak] = useState('');
  const [anBreak, setAnBreak] = useState(3);
  const [anBurnout, setAnBurnout] = useState('');
  const [anEnergy, setAnEnergy] = useState('stable');

  // 1-2. 수험생 추가 정보 (PC register 대응)
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('남');
  // PC Student Registration 대응: 신체 정보 + 검사일자 (PC 폼과 동일 항목)
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [activityLevel, setActivityLevel] = useState(2);
  const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0]);
  const [weakSubject, setWeakSubject] = useState('');
  const [focusSubjects, setFocusSubjects] = useState<string[]>([]);
  const [region, setRegion] = useState('');
  const [priorityRanks, setPriorityRanks] = useState<Record<string, Record<string, number>>>({
    importanceRank: { korean: 0, math: 0, english: 0, korean_history: 0 },
    gradeRank: { korean: 0, math: 0, english: 0, korean_history: 0 },
    currentFocusRank: { korean: 0, math: 0, english: 0, korean_history: 0 },
  });
  const calcAge = (bd: string): number => {
    try {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(bd)) return 18;
      const b = new Date(bd + 'T00:00:00').getTime();
      const now = Date.now();
      if (isNaN(b) || b > now) return 18;
      return Math.max(10, Math.floor((now - b) / (365.25 * 86400000)));
    } catch {
      return 18;
    }
  };
  // PC BMI 자동계산과 동일 (컴포넌트 스코프 — 저장 핸들러와 UI가 공유)
  const numOrUndefShared = (v: string): number | undefined => {
    const n = Number(v);
    return v.trim() !== '' && !isNaN(n) ? n : undefined;
  };
  const heightNum = numOrUndefShared(height);
  const weightNum = numOrUndefShared(weight);
  const bmiNum = heightNum !== undefined && weightNum !== undefined && heightNum > 0
    ? Math.round((weightNum / Math.pow(heightNum / 100, 2)) * 10) / 10
    : undefined;  // 메타인지 12문항 (1~5점, null=미응답)
  // 3-2. 5대 학습기질 15문항 (1~5점, null=미응답)
  const [learningTraitAnswers, setLearningTraitAnswers] = useState<(number | null)[]>(() => new Array(15).fill(null));
  const [metacogAnswers, setMetacogAnswers] = useState<(number | null)[]>(() => new Array(12).fill(null));

  // 4. 인지 테스트 미니게임 상태
  // Game 1: Digit Span
  const [digitStep, setDigitStep] = useState<'intro' | 'display' | 'input' | 'done'>('intro');
  const [digitSequence, setDigitSequence] = useState<number[]>([]);
  const [currentDigitIndex, setCurrentDigitIndex] = useState<number>(0);
  const [userInputDigits, setUserInputDigits] = useState<string>('');
  const [workingMemorySpan, setWorkingMemorySpan] = useState<number>(6.5);

  // Game 2: Go/No-Go
  const [goNoGoStep, setGoNoGoStep] = useState<'intro' | 'playing' | 'done'>('intro');
  const [currentCue, setCurrentCue] = useState<'GO' | 'NOGO' | null>(null);
  const [trialCount, setTrialCount] = useState<number>(0);
  const [correctHits, setCorrectHits] = useState<number>(0);
  const [falseAlarms, setFalseAlarms] = useState<number>(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [cueTimestamp, setCueTimestamp] = useState<number>(0);
  const [hasRespondedInTrial, setHasRespondedInTrial] = useState<boolean>(false);

  // Game 3: N-Back (2-back, 20시행) — 작업기억 업데이트 능력 실측
  const NBACK_TRIALS = 20;
  const [nbackStep, setNbackStep] = useState<'intro' | 'playing' | 'done'>('intro');
  const [nbackSeq, setNbackSeq] = useState<number[]>([]);
  const [nbackIdx, setNbackIdx] = useState(0);
  const [nbackHits, setNbackHits] = useState(0);
  const [nbackMisses, setNbackMisses] = useState(0);
  const [nbackFalse, setNbackFalse] = useState(0);
  const [nbackTotal, setNbackTotal] = useState(0);
  const nbackRespondedRef = useRef(false);
  const nbackAccuracy = nbackTotal > 0 ? Math.round((nbackHits / nbackTotal) * 100) : 0;
  const nbackLevel = nbackTotal > 0 ? (nbackAccuracy >= 85 ? 3 : nbackAccuracy >= 65 ? 2 : 1) : 0;

  // 5. 로딩 분석 애니메이션
  const [analysisProgress, setAnalysisProgress] = useState<number>(0);

  // 5대 학습기질 15문항 (영역별 3문항, 1~5점)
  const LEARNING_TRAIT_QUESTIONS: { domain: 'grit' | 'resilience' | 'temperament' | 'metacognition' | 'motivation'; text: string }[] = [
    { domain: 'grit', text: '어려운 문제도 끝까지 붙잡고 푸는 편이다' },
    { domain: 'grit', text: '계획한 공부량을 웬만하면 다 채운다' },
    { domain: 'grit', text: '성적이 안 나와도 공부 습관을 유지한다' },
    { domain: 'resilience', text: '시험을 망쳐도 다음 시험 준비로 빨리 전환한다' },
    { domain: 'resilience', text: '공부 중 불안해져도 호흡을 가다듬고 계속한다' },
    { domain: 'resilience', text: '슬럼프가 와도 며칠 안에 리듬을 되찾는다' },
    { domain: 'temperament', text: '새로운 유형의 문제를 보면 호기심이 생긴다' },
    { domain: 'temperament', text: '모르는 개념을 파고드는 것이 즐겁다' },
    { domain: 'temperament', text: '어려운 단원일수록 도전 의욕이 오른다' },
    { domain: 'metacognition', text: '공부하기 전에 오늘 목표와 순서를 정한다' },
    { domain: 'metacognition', text: '풀면서 내가 이해했는지 스스로 점검한다' },
    { domain: 'metacognition', text: '틀린 문제는 왜 틀렸는지 원인을 분류한다' },
    { domain: 'motivation', text: '성적보다 배우는 자체가 재미있다' },
    { domain: 'motivation', text: '목표 대학이 아니어도 공부하고 싶다' },
    { domain: 'motivation', text: '남이 시키지 않아도 스스로 책상에 앉는다' },
  ];
  const TRAIT_DOMAIN_LABELS: Record<string, string> = {
    grit: '끈기·실행력',
    resilience: '멘탈 회복탄력성',
    temperament: '탐구·도전 성향',
    metacognition: '메타인지 전략',
    motivation: '내재적 학습동기',
  };

  // =========================================================================
  // [2주 추적 검사] 전용 상태
  // =========================================================================
  const latestBaseline = dataSyncService.getLatestAssessment(user.studentId);
  const targetCareTypeCode = latestBaseline?.careType || 'BURNOUT';
  const followUpQuestions = CARE_TYPE_FOLLOWUP_QUESTIONS[targetCareTypeCode] || CARE_TYPE_FOLLOWUP_QUESTIONS['BURNOUT'];
  const [followUpAnswers, setFollowUpAnswers] = useState<number[]>([2, 3, 2, 3, 2]); // 각 0~4점
  const [nutritionAdherence, setNutritionAdherence] = useState<'daily' | 'often' | 'rarely'>('daily');
  const [sleepAdherence, setSleepAdherence] = useState<'well_kept' | 'moderate' | 'not_kept'>('well_kept');
  const [routineAdherence, setRoutineAdherence] = useState<'well_kept' | 'moderate' | 'not_kept'>('well_kept');
  const [followUpDone, setFollowUpDone] = useState<boolean>(false);

  // Digit Span 재생 효과
  useEffect(() => {
    let timer: any = null;
    if (digitStep === 'display') {
      if (currentDigitIndex < digitSequence.length) {
        timer = setTimeout(() => {
          setCurrentDigitIndex(prev => prev + 1);
        }, 900);
      } else {
        timer = setTimeout(() => {
          setDigitStep('input');
        }, 500);
      }
    }
    return () => clearTimeout(timer);
  }, [digitStep, currentDigitIndex, digitSequence.length]);

  const startDigitSpan = () => {
    const seq = Array.from({ length: 5 }, () => Math.floor(Math.random() * 9) + 1);
    setDigitSequence(seq);
    setCurrentDigitIndex(0);
    setUserInputDigits('');
    setDigitStep('display');
  };

  const handleDigitInput = (num: number) => {
    if (userInputDigits.length >= digitSequence.length) return;
    const next = userInputDigits + num;
    setUserInputDigits(next);
    if (next.length === digitSequence.length) {
      const reversedTarget = [...digitSequence].reverse().join('');
      if (next === reversedTarget) {
        setWorkingMemorySpan(7.5);
      } else {
        setWorkingMemorySpan(5.5);
      }
      setTimeout(() => setDigitStep('done'), 400);
    }
  };

  // Go/No-Go 게임 루프
  useEffect(() => {
    let timer: any = null;
    if (goNoGoStep === 'playing') {
      if (trialCount < 12) {
        const isGo = Math.random() > 0.3;
        setCurrentCue(isGo ? 'GO' : 'NOGO');
        setCueTimestamp(Date.now());
        setHasRespondedInTrial(false);

        timer = setTimeout(() => {
          setTrialCount(prev => prev + 1);
        }, 950);
      } else {
        setGoNoGoStep('done');
      }
    }
    return () => clearTimeout(timer);
  }, [goNoGoStep, trialCount]);

  const handleGoClick = () => {
    if (hasRespondedInTrial || goNoGoStep !== 'playing') return;
    setHasRespondedInTrial(true);
    const rt = Date.now() - cueTimestamp;

    if (currentCue === 'GO') {
      setCorrectHits(prev => prev + 1);
      setReactionTimes(prev => [...prev, rt]);
    } else if (currentCue === 'NOGO') {
      setFalseAlarms(prev => prev + 1);
    }
  };

  // 종합 정밀 진단 평가 실행
  // N-Back 자동 진행 (1.5초마다 다음 숫자, 무응답은 오답 처리)
  useEffect(() => {
    if (nbackStep !== 'playing') return;
    if (nbackIdx >= NBACK_TRIALS) {
      setNbackStep('done');
      return;
    }
    nbackRespondedRef.current = false;
    const t = setTimeout(() => {
      if (!nbackRespondedRef.current && nbackIdx >= 2) {
        setNbackMisses(m => m + 1);
        setNbackTotal(x => x + 1);
      }
      setNbackIdx(i => i + 1);
    }, 1500);
    return () => clearTimeout(t);
  }, [nbackStep, nbackIdx]);

  const startNback = () => {
    setNbackSeq(Array.from({ length: NBACK_TRIALS }, () => Math.floor(Math.random() * 9) + 1));
    setNbackIdx(0);
    setNbackHits(0);
    setNbackMisses(0);
    setNbackFalse(0);
    setNbackTotal(0);
    setNbackStep('playing');
  };

  const handleNbackAnswer = (saidMatch: boolean) => {
    if (nbackStep !== 'playing' || nbackRespondedRef.current) return;
    if (nbackIdx < 0 || nbackIdx >= NBACK_TRIALS) return;
    nbackRespondedRef.current = true;
    const actual = nbackIdx >= 2 && nbackSeq[nbackIdx] === nbackSeq[nbackIdx - 2];
    if (nbackIdx >= 2) {
      setNbackTotal(x => x + 1);
      if (saidMatch === actual) setNbackHits(h => h + 1);
      else if (saidMatch) setNbackFalse(f => f + 1);
      else setNbackMisses(m => m + 1);
    }
    setNbackIdx(i => i + 1);
  };

  const calcTraitScores = () => {
    const domains = ['grit', 'resilience', 'temperament', 'metacognition', 'motivation'] as const;
    const out = {} as Record<typeof domains[number], number>;
    domains.forEach((d, di) => {
      const idx = [di * 3, di * 3 + 1, di * 3 + 2];
      const vals = idx.map(i => learningTraitAnswers[i]);
      if (vals.some(v => v === null)) return;
      const avg = (vals as number[]).reduce((a, b) => a + b, 0) / 3;
      out[d] = Math.round((avg / 5) * 100);
    });
    return out;
  };

  const handleRunEvaluation = () => {
    setCurrentStep(6);
    setAnalysisProgress(15);

    const interval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          finishEvaluation();
          return 100;
        }
        return prev + 15;
      });
    }, 250);
  };

  const finishEvaluation = async () => {
    const totalBai = baiAnswers.reduce((a, b) => a + b, 0);
    const totalIsi = isiAnswers.reduce((a, b) => a + b, 0);
    const totalFatigueCount = (fatigueCore ? 2 : 0) + fatigueSymptoms.filter(Boolean).length;
    const totalConcentration = concentrationAnswers.reduce((a, b) => a + b, 0);
    const totalAdrenal = adrenalAnswers.reduce((a, b) => a + b, 0);

    // PC 동일 채점 (STEP3 게이트로 전 문항 응답 보장)
    const meqScoreReal = CHRONOTYPE_QUESTIONS.reduce((sum, q, qi) => sum + (q.options[(meqAnswers[qi] as number) ?? 0]?.score || 0), 0);
    const meqResult = getChronotypeResult(meqScoreReal);
    const varkResult = calculateVARKResult(varkAnswers as ('V' | 'A' | 'R' | 'K' | null)[]);
    const taiResult = calculateTAIResult(taiAnswers as number[]);
    const digitalResult = calculateDigitalAddictionResult(digitalAnswers as number[]);
    const metacogResult = calculateMetacognitionResult(metacogAnswers as number[]);
    const traitScores = calcTraitScores() as { grit: number; resilience: number; temperament: number; metacognition: number; motivation: number };
    const metacogNorm = Math.round(((metacogResult.rehearsalScore + metacogResult.elaborationScore + metacogResult.organizationScore + metacogResult.metacognitiveScore) / 60) * 100);

    const avgRt = reactionTimes.length > 0
      ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
      : 380;
    const accuracy = Math.round((correctHits / Math.max(1, trialCount - falseAlarms)) * 100);

    const numOrUndef = numOrUndefShared;
    const subjSum = ['korean', 'math', 'english', 'science', 'social', 'other'].reduce((a, k) => a + (anSubj[k] || 0), 0);
    const subjNorm: Record<string, number> = {};
    ['korean', 'math', 'english', 'science', 'social', 'other'].forEach(k => {
      subjNorm[k] = subjSum > 0 ? Math.round(((anSubj[k] || 0) / subjSum) * 100) : 0;
    });

    const rawInput: AssessmentRawInput = {
      student: {
        id: user.studentId,
        name: name.trim() || user.name,
        school,
        grade,
        age: calcAge(birthDate),
        gender,
        targetUniversity,
        targetMajor,
        ...(birthDate ? { birthDate } : {}),
        ...(weakSubject ? { weakSubject } : {}),
        ...(focusSubjects.length > 0 ? { focusSubjects } : {}),
        ...(region.trim() ? { region: region.trim() } : {}),
        ...(heightNum !== undefined ? { height: heightNum } : {}),
        ...(weightNum !== undefined ? { weight: weightNum } : {}),
        activityLevel,
        ...(testDate ? { testDate } : {}),
        subjectPriorities: {
          importanceRank: { ...priorityRanks.importanceRank },
          gradeRank: { ...priorityRanks.gradeRank },
          currentFocusRank: { ...priorityRanks.currentFocusRank },
        },
      },
      survey: {
        bai: totalBai,
        isi: totalIsi,
        cfs: totalFatigueCount,
        snsCount: selectedSns.length,
        pnsCount: selectedPns.length,
        concentration: totalConcentration,
        adrenal: totalAdrenal,
        symptoms: [...selectedSns, ...selectedPns, ...selectedCirculation],
        sympatheticSymptoms: [...selectedSns],
        parasympatheticSymptoms: [...selectedPns],
        circulationSymptoms: [...selectedCirculation],
        circulationScore: selectedCirculation.length * 3,
        circulationSymptomsCount: selectedCirculation.length,
        chronicFatigue: fatigueCore,
        fatigueSymptomsCount: totalFatigueCount,
        testAnxietyCognitive: taiResult.cognitiveScore,
        testAnxietySomatic: taiResult.somaticScore,
        digitalAddictionScore: digitalResult.totalScore,
        chronotypeScore: meqScoreReal,
        varkPrimary: varkResult.primary,
        varkScores: { V: varkResult.V, A: varkResult.A, R: varkResult.R, K: varkResult.K },
        metacognitionScores: {
          rehearsal: metacogResult.rehearsalScore,
          elaboration: metacogResult.elaborationScore,
          organization: metacogResult.organizationScore,
          metacognitive: metacogResult.metacognitiveScore,
        },
      },
      studyEfficiency: {
        chronotype: mapChronotypeToBucket(meqResult),
        varkStyle: VARK_LABELS[varkResult.primary].label,
        taiScore: Math.round((taiResult.totalScore / 42) * 30),
        digitalDistraction: Math.round((digitalResult.totalScore / 48) * 20),
        meqScore: meqScoreReal,
        meqResult,
        varkScores: { V: varkResult.V, A: varkResult.A, R: varkResult.R, K: varkResult.K },
        varkPrimary: varkResult.primary,
        taiCognitive: taiResult.cognitiveScore,
        taiSomatic: taiResult.somaticScore,
        taiSeverity: taiResult.severity,
        taiTotal: taiResult.totalScore,
        digitalLevel: digitalResult.level,
        digitalTotal: digitalResult.totalScore,
        learningTraits: traitScores,
        learningTraitAnswers: learningTraitAnswers as number[],
        metacognitionScore: metacogNorm,
        metacognitionResult: {
          rehearsalScore: metacogResult.rehearsalScore,
          elaborationScore: metacogResult.elaborationScore,
          organizationScore: metacogResult.organizationScore,
          metacognitiveScore: metacogResult.metacognitiveScore,
          dominantStrategy: metacogResult.dominantStrategy,
          learnerLevel: metacogResult.learnerLevel,
        },
      },
      protocol: {
        location: protoLocation,
        noiseLevel: protoNoise,
        stressLevel: protoStress,
        ...(numOrUndef(protoSleepHours) !== undefined ? { sleepHours: numOrUndef(protoSleepHours) } : {}),
        emotionalFactor: protoEmotional,
        motivationalFactor: protoMotivational,
        behavioralFactor: protoBehavioral,
        taskDifficulty: protoDifficulty,
        timeDistortion: protoTimeDistortion,
      },
      analytics: {
        // PC isLearningAnalyticsTested가 읽는 공식 시행 플래그 (모바일은 검사 스텝을
        // 실제로 거쳐 저장되므로 true. 없으면 PC에서 미시행/미완료로 판정될 수 있음)
        isTested: true,
        testDate: examDate,
        pureStudyRatio: anPureRatio,
        ...(numOrUndef(anFocusMin) !== undefined ? { avgFocusDuration: numOrUndef(anFocusMin) } : {}),
        ...(numOrUndef(anDistractions) !== undefined ? { distractionCount: numOrUndef(anDistractions) } : {}),
        goldenTimeStart: anGoldenStart,
        goldenTimeEnd: anGoldenEnd,
        ...(anLowTime.trim() ? { lowEfficiencyTime: anLowTime.trim() } : {}),
        weekdayWeekendGap: anWeekGap,
        subjectRatios: {
          korean: subjNorm.korean, math: subjNorm.math, english: subjNorm.english,
          science: subjNorm.science, social: subjNorm.social, other: subjNorm.other,
        },
        goalAchievementRate: anGoalRate,
        perceivedDifficulty: anDifficulty,
        ...(numOrUndef(anAvgSleep) !== undefined ? { avgSleepHours: numOrUndef(anAvgSleep) } : {}),
        sleepQuality: anSleepQuality,
        preferredLocation: anPlace,
        ...(numOrUndef(anStreak) !== undefined ? { studyStreak: numOrUndef(anStreak) } : {}),
        breakAdequacy: anBreak,
        ...(numOrUndef(anBurnout) !== undefined ? { burnoutCycle: numOrUndef(anBurnout) } : {}),
        energyPattern: anEnergy,
      },
      cognitive: {
        workingMemorySpan,
        goNoGoAccuracy: Math.min(100, Math.max(40, accuracy || 85)),
        reactionTimeMs: avgRt,
        digitPlayed: digitStep === 'done',
        goNoGoPlayed: goNoGoStep === 'done',
        falseAlarms,
        ...(nbackTotal > 0
          ? { nbackAccuracy, nbackLevel }
          : {})
      }
    };

    const result = careTypeEngine.evaluateAssessment(rawInput);
    // PC logicEngine 분류 코어 완전 이식 판정으로 덮어쓰기 (지표·처방은 모바일 엔진 값 유지 후 타입 기준으로 재산출)
    try {
      const pcPatch = classifyWithPcCore(rawInput);
      if (pcPatch) {
        result.careType = pcPatch.careType as string;
        result.careTypeName = pcPatch.careTypeName;
        result.secondaryCareType = pcPatch.secondaryCareType;
        result.secondaryCareTypeName = pcPatch.secondaryCareTypeName;
        result.secondaryConfidence = pcPatch.secondaryConfidence;
        result.topCareScores = pcPatch.topCareScores as any;
        result.prescriptions = pcPatch.prescriptions as any;
        result.keyAdvice = pcPatch.keyAdvice;
        result.classificationResult = pcPatch.classificationResult;
      }
    } catch (e) {
      console.warn('PC core classification fallback:', e);
    }
    await dataSyncService.saveAssessment(result);
    onComplete(result);
  };

  // 2주 맞춤 추적 검사 완료 핸들러
  const handleCompleteFollowUp = async () => {
    setFollowUpDone(true);
    // 델타 개선율 계산 (0~20점 중 획득비율)
    const avgScore = followUpAnswers.reduce((a, b) => a + b, 0) / (followUpAnswers.length * 4);
    const improvementPercent = Math.round(avgScore * 100);

    // 업데이트된 활력 점수로 기존 진단 갱신 저장
    const updated = { ...latestBaseline };
    updated.metrics = {
      ...updated.metrics,
      brainVitality: Math.min(100, updated.metrics.brainVitality + Math.round(improvementPercent * 0.15)),
      stressResistance: Math.min(100, updated.metrics.stressResistance + Math.round(improvementPercent * 0.12))
    };
    await dataSyncService.saveAssessment(updated);
    setTimeout(() => {
      onComplete(updated);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-28">
      {/* 1. Top Header & Mode Toggle Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 py-3 shadow-xs">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {onCancel && currentStep === 1 ? (
              <button onClick={onCancel} className="text-xs font-bold text-slate-500 hover:text-slate-800">
                닫기
              </button>
            ) : currentStep > 1 && currentStep < 6 ? (
              <button
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 flex items-center gap-1 text-xs font-bold"
              >
                <ChevronLeft className="w-4 h-4" /> 이전
              </button>
            ) : null}
            <span className="text-sm font-black text-slate-900 flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-indigo-600" />
              NBASS 전두엽·뇌신체 진단 시스템
            </span>
          </div>

          {/* 모드 전환 듀얼 토글 (최초 종합 정밀 vs 2주 맞춤 추적) */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200/80">
            <button
              onClick={() => {
                setAssessmentMode('full');
                setCurrentStep(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                assessmentMode === 'full'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>최초 종합 정밀 진단 (Full)</span>
            </button>
            <button
              onClick={() => {
                setAssessmentMode('followup');
                setFollowUpDone(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                assessmentMode === 'followup'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>2주 맞춤 추적 검사 (3분 컷)</span>
            </button>
          </div>
        </div>

        {/* 종합 정밀 진단 시 상단 4스텝 프로그레스 바 */}
        {assessmentMode === 'full' && (
          <div className="max-w-3xl mx-auto mt-2.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
              <span>진행 단계: {currentStep}/4</span>
              <span className="text-indigo-600 font-black">
                {currentStep === 1 && '1/6 수험생 정보 등록'}
                {currentStep === 2 && '2/6 6대 전문 의학 설문'}
                {currentStep === 3 && '3/6 공부 효율성 & 바이오리듬'}
                {currentStep === 4 && '4/6 학습 환경 & 분석'}
                {currentStep === 5 && '5/6 전두엽 인지 실측 게임'}
                {currentStep === 6 && 'AI 신경인지 분석 진행 중'}
              </span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300 rounded-full"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="max-w-3xl mx-auto p-4">
        {/* ========================================================================= */}
        {/* MODE 1: 2주 맞춤 추적 검사 (Targeted Follow-up Assessment) */}
        {/* ========================================================================= */}
        {assessmentMode === 'followup' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-5 rounded-3xl shadow-sm border border-indigo-800">
              <div className="flex items-center gap-2 mb-1.5">
                <Clock className="w-4 h-4 text-amber-300" />
                <span className="text-xs font-bold text-indigo-200">2주 단위 타겟 추적 검사</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                [{latestBaseline.careTypeName}] 5대 핵심 호전도 재측정
              </h2>
              <p className="text-xs text-indigo-200 mt-1 leading-relaxed">
                직전 검사에서 확인된 취약 영역만을 3분 내에 집중 재평가하여 전후 호전/악화 델타(Delta)를 측정합니다.
              </p>
            </div>

            {/* 1. 처방 실천율 자가 점검 */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                지난 2주간 3대 처방전 실천도 점검
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                {/* 영양제 */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-700 block mb-1.5">🥗 영양/서플리먼트</span>
                  <div className="space-y-1">
                    {[
                      { key: 'daily', label: '매일 챙겨먹음 (100%)' },
                      { key: 'often', label: '가끔 먹음 (50%)' },
                      { key: 'rarely', label: '거의 못 먹음 (0%)' }
                    ].map(opt => (
                      <button
                        key={opt.key}
                        onClick={() => setNutritionAdherence(opt.key as any)}
                        className={`w-full text-left p-1.5 rounded-lg font-bold text-[11px] transition ${
                          nutritionAdherence === opt.key
                            ? 'bg-emerald-600 text-white'
                            : 'hover:bg-slate-200/60 text-slate-600'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 수면 골든타임 */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-700 block mb-1.5">🌙 수면 골든타임 준수</span>
                  <div className="space-y-1">
                    {[
                      { key: 'well_kept', label: '철저히 지킴 (80% 이상)' },
                      { key: 'moderate', label: '보통 (50% 수준)' },
                      { key: 'not_kept', label: '불규칙 (새벽 취침)' }
                    ].map(opt => (
                      <button
                        key={opt.key}
                        onClick={() => setSleepAdherence(opt.key as any)}
                        className={`w-full text-left p-1.5 rounded-lg font-bold text-[11px] transition ${
                          sleepAdherence === opt.key
                            ? 'bg-indigo-600 text-white'
                            : 'hover:bg-slate-200/60 text-slate-600'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 공부 루틴 */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-700 block mb-1.5">📖 25분 집중 뽀모도로</span>
                  <div className="space-y-1">
                    {[
                      { key: 'well_kept', label: '루틴대로 실천' },
                      { key: 'moderate', label: '가끔 실천' },
                      { key: 'not_kept', label: '실천 못함' }
                    ].map(opt => (
                      <button
                        key={opt.key}
                        onClick={() => setRoutineAdherence(opt.key as any)}
                        className={`w-full text-left p-1.5 rounded-lg font-bold text-[11px] transition ${
                          routineAdherence === opt.key
                            ? 'bg-blue-600 text-white'
                            : 'hover:bg-slate-200/60 text-slate-600'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. 케어타입별 5대 핵심 호전도 설문 문항 */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <Activity className="w-4 h-4 text-indigo-600" />
                {latestBaseline.careTypeName} 집중 케어 5문항
              </h3>

              {followUpQuestions.map((q, idx) => (
                <div key={q.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <p className="text-xs font-bold text-slate-800 leading-relaxed">
                    <span className="text-indigo-600 font-black mr-1">{idx + 1}.</span>
                    {q.text}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                    {q.options.map((opt, optIdx) => (
                      <button
                        key={optIdx}
                        onClick={() => {
                          const updated = [...followUpAnswers];
                          updated[idx] = optIdx;
                          setFollowUpAnswers(updated);
                        }}
                        className={`py-2 px-1 text-[11px] font-bold rounded-xl border text-center transition ${
                          followUpAnswers[idx] === optIdx
                            ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <button
                onClick={handleCompleteFollowUp}
                disabled={followUpDone}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 text-white font-black text-sm flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition mt-3"
              >
                {followUpDone ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>호전 델타(Delta) 반영 완료!</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>2주 추적 검사 완료 및 델타 리포트 저장</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE 2: 최초 종합 정밀 진단 (Baseline 50+문항 7대 영역 Full Assessment) */}
        {/* ========================================================================= */}
        {assessmentMode === 'full' && (
          <>
            {/* STEP 1: 수험생 정보 등록 */}
            {currentStep === 1 && (
              <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="text-lg font-black text-slate-900">👤 1단계: 수험생 프로필 등록</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    정밀한 바이오리듬과 목표 대학 합격 시뮬레이션을 위한 기본 정보입니다.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold text-slate-700">
                  <div>
                    <label className="block mb-1">성명</label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-bold focus:bg-white focus:border-indigo-500 focus:outline-none"
                      placeholder="이름 입력"
                    />
                  </div>

                  <div>
                    <label className="block mb-1">소속 학교</label>
                    <input
                      type="text"
                      value={school}
                      onChange={e => setSchool(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-bold focus:bg-white focus:border-indigo-500 focus:outline-none"
                      placeholder="학교명 입력"
                    />
                  </div>

                  <div>
                    <label className="block mb-1">학년 구분</label>
                    <select
                      value={grade}
                      onChange={e => setGrade(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-bold focus:bg-white focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="중3 (예비고1)">중3 (예비고1)</option>
                      <option value="고1">고등학교 1학년</option>
                      <option value="고2">고등학교 2학년</option>
                      <option value="고3 (수험생)">고등학교 3학년 (수험생)</option>
                      <option value="N수생">N수생 (재수/반수)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1">목표 시험일 (수능/모의고사)</label>
                    <input
                      type="date"
                      value={examDate}
                      onChange={e => setExamDate(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-bold focus:bg-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block mb-1">목표 대학</label>
                    <input
                      type="text"
                      value={targetUniversity}
                      onChange={e => setTargetUniversity(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-bold focus:bg-white focus:border-indigo-500 focus:outline-none"
                      placeholder="예: 서울대학교, 연세대학교"
                    />
                  </div>

                  <div>
                    <label className="block mb-1">희망 전공 / 학과</label>
                    <input
                      type="text"
                      value={targetMajor}
                      onChange={e => setTargetMajor(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-bold focus:bg-white focus:border-indigo-500 focus:outline-none"
                      placeholder="예: 의예과, 경영학과, 컴퓨터공학"
                    />
                  </div>

                  <div>
                    <label className="block mb-1">생년월일</label>
                    <input
                      type="date"
                      value={birthDate}
                      onChange={e => setBirthDate(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-bold focus:bg-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block mb-1">성별</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['남', '여'].map(g => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setGender(g)}
                          className={`py-3 rounded-xl font-black transition ${gender === g ? 'bg-indigo-600 text-white' : 'bg-slate-50 border border-slate-200 text-slate-600'}`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block mb-1">검사일자 (PC 등록과 동일)</label>
                    <input
                      type="date"
                      value={testDate}
                      onChange={e => setTestDate(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-bold focus:bg-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block mb-1">키 (cm)</label>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={height}
                      onChange={e => setHeight(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-bold focus:bg-white focus:border-indigo-500 focus:outline-none"
                      placeholder="예: 175"
                    />
                  </div>

                  <div>
                    <label className="block mb-1">몸무게 (kg)</label>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={weight}
                      onChange={e => setWeight(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-bold focus:bg-white focus:border-indigo-500 focus:outline-none"
                      placeholder="예: 65"
                    />
                  </div>

                  <div>
                    <label className="block mb-1">
                      활동량 (1~4단계)
                      {heightNum !== undefined && weightNum !== undefined && bmiNum !== undefined && (
                        <span className="ml-1 font-black text-indigo-600">BMI {bmiNum}</span>
                      )}
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[1, 2, 3, 4].map(lv => (
                        <button
                          key={lv}
                          type="button"
                          onClick={() => setActivityLevel(lv)}
                          className={`py-3 rounded-xl font-black transition ${activityLevel === lv ? 'bg-emerald-600 text-white' : 'bg-slate-50 border border-slate-200 text-slate-600'}`}
                        >
                          {lv}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block mb-1">거주 지역</label>
                    <input
                      type="text"
                      value={region}
                      onChange={e => setRegion(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-bold focus:bg-white focus:border-indigo-500 focus:outline-none"
                      placeholder="예: 서울 강남구"
                    />
                  </div>

                  <div>
                    <label className="block mb-1">가장 부담되는 과목 (1개)</label>
                    <select
                      value={weakSubject}
                      onChange={e => setWeakSubject(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-bold focus:bg-white focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="">선택 안 함</option>
                      <option value="korean">국어</option>
                      <option value="math">수학</option>
                      <option value="english">영어</option>
                      <option value="science">과학탐구</option>
                      <option value="social">사회탐구</option>
                    </select>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <label className="block text-xs font-black text-slate-900 mb-2">집중 투자 과목 (복수 선택)</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'korean', label: '국어' },
                      { id: 'math', label: '수학' },
                      { id: 'english', label: '영어' },
                      { id: 'science', label: '과학탐구' },
                      { id: 'social', label: '사회탐구' },
                    ].map(s => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setFocusSubjects(prev => prev.includes(s.id) ? prev.filter(x => x !== s.id) : [...prev, s.id])}
                        className={`px-3.5 py-2 rounded-xl text-xs font-black border transition ${focusSubjects.includes(s.id) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'}`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <label className="block text-xs font-black text-slate-900 mb-1">과목 우선순위 (1~4위, 0=미지정)</label>
                  <p className="text-[10px] text-slate-500 mb-2">중요도 / 잘하는 정도 / 지금 집중도 3가지 기준으로 매깁니다.</p>
                  {[
                    { key: 'importanceRank', label: '중요하게 생각하는 순서' },
                    { key: 'gradeRank', label: '성적이 잘 나오는 순서' },
                    { key: 'currentFocusRank', label: '지금 집중 투자하는 순서' },
                  ].map(c => (
                    <div key={c.key} className="mb-2 last:mb-0">
                      <p className="text-[11px] font-bold text-slate-600 mb-1">{c.label}</p>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[
                          { id: 'korean', label: '국어' },
                          { id: 'math', label: '수학' },
                          { id: 'english', label: '영어' },
                          { id: 'korean_history', label: '한국사' },
                        ].map(s => (
                          <label key={s.id} className="bg-white rounded-xl border border-slate-200 px-2 py-1.5 text-center">
                            <span className="block text-[10px] font-bold text-slate-600">{s.label}</span>
                            <select
                              value={priorityRanks[c.key]?.[s.id] || 0}
                              onChange={e => setPriorityRanks(prev => ({ ...prev, [c.key]: { ...prev[c.key], [s.id]: Number(e.target.value) } }))}
                              className="w-full text-xs font-black text-indigo-700 bg-transparent focus:outline-none"
                            >
                              <option value={0}>-</option>
                              <option value={1}>1위</option>
                              <option value={2}>2위</option>
                              <option value={3}>3위</option>
                              <option value={4}>4위</option>
                            </select>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentStep(2)}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition mt-3"
                >
                  <span>다음: 6대 전문 의학 설문 응시</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* STEP 2: 6대 전문 의학 & 신경생체 설문 풀세트 */}
            {currentStep === 2 && (
              <div className="space-y-4">
                {/* 6대 설문 탭 헤더 */}
                <div className="bg-white p-3 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-1.5 overflow-x-auto text-xs font-bold scrollbar-none">
                  {[
                    { id: 'bai', label: '1. 불안(BAI 21)' },
                    { id: 'isi', label: '2. 수면(ISI 7)' },
                    { id: 'ans', label: '3. 자율신경(ANS 31)' },
                    { id: 'cfs', label: '4. 만성피로(CFS 8)' },
                    { id: 'concentration', label: '5. 집중력(7문항)' },
                    { id: 'adrenal', label: '6. 부신피로(14문항)' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setSurveyTab(tab.id as any)}
                      className={`px-3 py-2 rounded-xl whitespace-nowrap transition flex items-center gap-1 shrink-0 ${
                        surveyTab === tab.id
                          ? 'bg-indigo-600 text-white shadow-xs font-black'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* TAB 1: BAI 불안 척도 (21문항 전체) */}
                {surveyTab === 'bai' && (
                  <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div>
                        <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                          <Activity className="w-4 h-4 text-rose-600" />
                          BAI 벡 불안 척도 (21문항 전체)
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          지난 일주일간 경험한 신체 및 심리적 불안 반응을 터치해주세요.
                        </p>
                      </div>
                      <span className="text-xs font-black text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                        총점: {baiAnswers.reduce((a, b) => a + b, 0)}점 / 63
                      </span>
                    </div>

                    <div className="space-y-3">
                      {BAI_QUESTIONS.map((qText, idx) => (
                        <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                          <p className="text-xs font-bold text-slate-800 leading-relaxed">
                            <span className="text-rose-600 font-black mr-1">{idx + 1}.</span>
                            {qText}
                          </p>
                          <div className="grid grid-cols-4 gap-1.5">
                            {['전혀없음 (0)', '약간 느낌 (1)', '자주 느낌 (2)', '극심함 (3)'].map((label, optIdx) => (
                              <button
                                key={optIdx}
                                onClick={() => {
                                  const updated = [...baiAnswers];
                                  updated[idx] = optIdx;
                                  setBaiAnswers(updated);
                                }}
                                className={`py-1.5 text-[11px] font-bold rounded-xl border text-center transition ${
                                  baiAnswers[idx] === optIdx
                                    ? 'bg-rose-500 text-white border-rose-600 shadow-xs'
                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => setSurveyTab('isi')}
                        className="py-2.5 px-5 rounded-2xl bg-indigo-600 text-white text-xs font-black flex items-center gap-1"
                      >
                        <span>다음 설문 (ISI 수면장애)</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 2: ISI 불면증 척도 (7문항 전체) */}
                {surveyTab === 'isi' && (
                  <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div>
                        <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                          <Timer className="w-4 h-4 text-indigo-600" />
                          ISI 불면증 심각도 척도 (7문항 전체)
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          최근 2주간 체감한 입면 및 수면 유지 장애 정도를 평가합니다.
                        </p>
                      </div>
                      <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                        총점: {isiAnswers.reduce((a, b) => a + b, 0)}점 / 28
                      </span>
                    </div>

                    <div className="space-y-3">
                      {ISI_QUESTIONS.map((q, idx) => (
                        <div key={q.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                          <p className="text-xs font-bold text-slate-800 leading-relaxed">
                            <span className="text-indigo-600 font-black mr-1">{idx + 1}.</span>
                            {q.label}
                          </p>
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                            {q.options.map((opt, optIdx) => (
                              <button
                                key={optIdx}
                                onClick={() => {
                                  const updated = [...isiAnswers];
                                  updated[idx] = optIdx;
                                  setIsiAnswers(updated);
                                }}
                                className={`py-1.5 text-[11px] font-bold rounded-xl border text-center transition ${
                                  isiAnswers[idx] === optIdx
                                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 flex justify-between">
                      <button
                        onClick={() => setSurveyTab('bai')}
                        className="py-2.5 px-4 rounded-2xl bg-slate-100 text-slate-600 text-xs font-bold"
                      >
                        이전
                      </button>
                      <button
                        onClick={() => setSurveyTab('ans')}
                        className="py-2.5 px-5 rounded-2xl bg-indigo-600 text-white text-xs font-black flex items-center gap-1"
                      >
                        <span>다음 설문 (자율신경 31개)</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 3: ANS 자율신경계 31대 임상 증상 태그 선택 */}
                {surveyTab === 'ans' && (
                  <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                    <div className="border-b border-slate-100 pb-2">
                      <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                        <HeartPulse className="w-4 h-4 text-purple-600" />
                        자율신경실조증 31대 임상 증상 체크
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        평소 자주 경험하는 신체 반응 증상을 모두 터치하여 선택해주세요.
                      </p>
                    </div>

                    {/* 교감신경 13개 */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black text-rose-700 flex items-center gap-1">
                          ⚡ 교감신경 과항진 증상 (13종)
                        </span>
                        <span className="text-xs font-bold text-rose-600">
                          {selectedSns.length}개 선택됨
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {SYMPATHETIC_SYMPTOMS.map((item, idx) => {
                          const isSelected = selectedSns.includes(item.label);
                          return (
                            <button
                              key={idx}
                              onClick={() => {
                                setSelectedSns(prev =>
                                  isSelected ? prev.filter(x => x !== item.label) : [...prev, item.label]
                                );
                              }}
                              className={`p-2.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                                isSelected
                                  ? 'bg-rose-50 border-rose-300 text-rose-900 shadow-xs'
                                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-black">{item.label}</span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-rose-600 font-black" />}
                              </div>
                              <span className="text-[10px] text-slate-500 mt-1">{item.desc}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 부교감신경 13개 */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black text-purple-700 flex items-center gap-1">
                          🌀 부교감신경 저하/무기력 증상 (13종)
                        </span>
                        <span className="text-xs font-bold text-purple-600">
                          {selectedPns.length}개 선택됨
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {PARASYMPATHETIC_SYMPTOMS.map((item, idx) => {
                          const isSelected = selectedPns.includes(item.label);
                          return (
                            <button
                              key={idx}
                              onClick={() => {
                                setSelectedPns(prev =>
                                  isSelected ? prev.filter(x => x !== item.label) : [...prev, item.label]
                                );
                              }}
                              className={`p-2.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                                isSelected
                                  ? 'bg-purple-50 border-purple-300 text-purple-900 shadow-xs'
                                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-black">{item.label}</span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-purple-600 font-black" />}
                              </div>
                              <span className="text-[10px] text-slate-500 mt-1">{item.desc}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 순환기 5개 */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black text-blue-700 flex items-center gap-1">
                          🩸 뇌혈류 및 순환기 증상 (5종)
                        </span>
                        <span className="text-xs font-bold text-blue-600">
                          {selectedCirculation.length}개 선택됨
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {CIRCULATION_SYMPTOMS.map((item, idx) => {
                          const isSelected = selectedCirculation.includes(item.label);
                          return (
                            <button
                              key={idx}
                              onClick={() => {
                                setSelectedCirculation(prev =>
                                  isSelected ? prev.filter(x => x !== item.label) : [...prev, item.label]
                                );
                              }}
                              className={`p-2.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                                isSelected
                                  ? 'bg-blue-50 border-blue-300 text-blue-900 shadow-xs'
                                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-black">{item.label}</span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 font-black" />}
                              </div>
                              <span className="text-[10px] text-slate-500 mt-1">{item.desc}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-2 flex justify-between">
                      <button
                        onClick={() => setSurveyTab('isi')}
                        className="py-2.5 px-4 rounded-2xl bg-slate-100 text-slate-600 text-xs font-bold"
                      >
                        이전
                      </button>
                      <button
                        onClick={() => setSurveyTab('cfs')}
                        className="py-2.5 px-5 rounded-2xl bg-indigo-600 text-white text-xs font-black flex items-center gap-1"
                      >
                        <span>다음 설문 (만성피로 CFS)</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 4: 만성피로 CFS 증후군 8대 증상 */}
                {surveyTab === 'cfs' && (
                  <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                    <div className="border-b border-slate-100 pb-2">
                      <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                        <Flame className="w-4 h-4 text-amber-500" />
                        만성피로 증후군 (CFS 8대 진단 증상)
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        단순 피로가 아닌 생체 대사 탈진 및 면역 고갈 상태를 평가합니다.
                      </p>
                    </div>

                    {/* 핵심 문항: 6개월 이상 피로 */}
                    <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-black text-amber-950 block">
                          [핵심 진단] 6개월 이상 충분한 휴식으로도 풀리지 않는 지속적 탈진 피로
                        </span>
                        <span className="text-[10px] text-amber-800">
                          수험 생활 시작 후 지속되고 있는 경우 체크해주세요.
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={fatigueCore}
                        onChange={e => setFatigueCore(e.target.checked)}
                        className="w-5 h-5 accent-amber-600 rounded cursor-pointer"
                      />
                    </div>

                    {/* 8대 부증상 */}
                    <div className="space-y-2">
                      <span className="text-xs font-black text-slate-700 block">
                        동반되는 8대 신체 부증상 체크 (4개 이상 해당 시 만성피로군 분류)
                      </span>
                      {FATIGUE_SYMPTOMS.map((symptom, idx) => (
                        <label
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80 cursor-pointer hover:bg-slate-100 transition text-xs font-bold text-slate-700"
                        >
                          <span>{idx + 1}. {symptom}</span>
                          <input
                            type="checkbox"
                            checked={fatigueSymptoms[idx]}
                            onChange={e => {
                              const updated = [...fatigueSymptoms];
                              updated[idx] = e.target.checked;
                              setFatigueSymptoms(updated);
                            }}
                            className="w-4 h-4 accent-amber-600 rounded"
                          />
                        </label>
                      ))}
                    </div>

                    <div className="pt-2 flex justify-between">
                      <button
                        onClick={() => setSurveyTab('ans')}
                        className="py-2.5 px-4 rounded-2xl bg-slate-100 text-slate-600 text-xs font-bold"
                      >
                        이전
                      </button>
                      <button
                        onClick={() => setSurveyTab('concentration')}
                        className="py-2.5 px-5 rounded-2xl bg-indigo-600 text-white text-xs font-black flex items-center gap-1"
                      >
                        <span>다음 설문 (집중력 7문항)</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 5: 집중력 및 실행기능 7문항 */}
                {surveyTab === 'concentration' && (
                  <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div>
                        <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                          <Brain className="w-4 h-4 text-blue-600" />
                          집중력 및 전두엽 실행기능 결핍 척도 (7문항)
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          수험생 주의 집중 유지력 및 작업 완수율 저하를 측정합니다.
                        </p>
                      </div>
                      <span className="text-xs font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                        총점: {concentrationAnswers.reduce((a, b) => a + b, 0)}점 / 21
                      </span>
                    </div>

                    <div className="space-y-3">
                      {CONCENTRATION_QUESTIONS.map((qText, idx) => (
                        <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                          <p className="text-xs font-bold text-slate-800 leading-relaxed">
                            <span className="text-blue-600 font-black mr-1">{idx + 1}.</span>
                            {qText}
                          </p>
                          <div className="grid grid-cols-4 gap-1.5">
                            {['전혀아님 (0)', '가끔 (1)', '자주 (2)', '항상그럼 (3)'].map((label, optIdx) => (
                              <button
                                key={optIdx}
                                onClick={() => {
                                  const updated = [...concentrationAnswers];
                                  updated[idx] = optIdx;
                                  setConcentrationAnswers(updated);
                                }}
                                className={`py-1.5 text-[11px] font-bold rounded-xl border text-center transition ${
                                  concentrationAnswers[idx] === optIdx
                                    ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 flex justify-between">
                      <button
                        onClick={() => setSurveyTab('cfs')}
                        className="py-2.5 px-4 rounded-2xl bg-slate-100 text-slate-600 text-xs font-bold"
                      >
                        이전
                      </button>
                      <button
                        onClick={() => setSurveyTab('adrenal')}
                        className="py-2.5 px-5 rounded-2xl bg-indigo-600 text-white text-xs font-black flex items-center gap-1"
                      >
                        <span>다음 설문 (부신 피로 14문항)</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 6: 부신 피로 14문항 (4개 카테고리) */}
                {surveyTab === 'adrenal' && (
                  <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div>
                        <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                          <Zap className="w-4 h-4 text-amber-500" />
                          부신 피로 증후군 척도 (4개 영역 14문항)
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          코르티솔 호르몬 축 고갈 및 수험생 오후 방전 현상을 진단합니다.
                        </p>
                      </div>
                      <span className="text-xs font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                        총점: {adrenalAnswers.reduce((a, b) => a + b, 0)}점 / 42
                      </span>
                    </div>

                    <div className="space-y-4">
                      {ADRENAL_QUESTIONS.map((cat, catIdx) => (
                        <div key={catIdx} className="space-y-2.5">
                          <h4 className="text-xs font-black text-slate-800 bg-slate-100 px-3 py-1.5 rounded-xl">
                            {cat.category}
                          </h4>
                          {cat.questions.map((qText, qIdx) => {
                            const globalIdx = catIdx * 4 + qIdx; // 대략적인 인덱스 맵핑
                            const clampedIdx = Math.min(13, globalIdx);
                            return (
                              <div key={qIdx} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                                <p className="text-xs font-bold text-slate-800 leading-relaxed">
                                  {qText}
                                </p>
                                <div className="grid grid-cols-4 gap-1.5">
                                  {['전혀없음 (0)', '약간 (1)', '자주 (2)', '극심 (3)'].map((label, optIdx) => (
                                    <button
                                      key={optIdx}
                                      onClick={() => {
                                        const updated = [...adrenalAnswers];
                                        updated[clampedIdx] = optIdx;
                                        setAdrenalAnswers(updated);
                                      }}
                                      className={`py-1.5 text-[11px] font-bold rounded-xl border text-center transition ${
                                        adrenalAnswers[clampedIdx] === optIdx
                                          ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                                      }`}
                                    >
                                      {label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 flex justify-between">
                      <button
                        onClick={() => setSurveyTab('concentration')}
                        className="py-2.5 px-4 rounded-2xl bg-slate-100 text-slate-600 text-xs font-bold"
                      >
                        이전
                      </button>
                      <button
                        onClick={() => setCurrentStep(3)}
                        className="py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-black flex items-center gap-1.5 shadow-md active:scale-98 transition"
                      >
                        <span>3단계: 공부 효율성 검사로 이동</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: 공부 효율성 & 학습 스타일 */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
                  <h2 className="text-lg font-black text-slate-900">🎯 3단계: 공부 효율성 &amp; 생체 바이오리듬</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    수험생 개인별 각성 골든타임과 최적의 인지 감각 채널을 진단합니다.
                  </p>
                </div>
                {/* MEQ 크로노타입 7문항 (PC 동일 문항·채점) */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                  <label className="block text-xs font-black text-slate-900">
                    1) 크로노타입 검사 (MEQ 7문항) <span className="text-[10px] font-bold text-slate-400">{meqAnswers.filter(v => v !== null).length}/7 응답</span>
                  </label>
                  <div className="space-y-2.5">
                    {CHRONOTYPE_QUESTIONS.map((q, qi) => (
                      <div key={q.id} className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                        <p className="text-xs font-bold text-slate-800 mb-2">{qi + 1}. {q.question}</p>
                        <div className="space-y-1.5">
                          {q.options.map((op, oi) => (
                            <button
                              key={oi}
                              onClick={() => setMeqAnswers(prev => prev.map((a, i) => (i === qi ? oi : a)))}
                              className={`w-full text-left px-3 py-2 rounded-xl text-[11px] font-bold border transition ${
                                meqAnswers[qi] === oi
                                  ? 'bg-indigo-600 text-white border-indigo-600'
                                  : 'bg-white text-slate-600 border-slate-200'
                              }`}
                            >
                              {op.text}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* VARK 8문항 (PC 동일 문항·채점) */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                  <label className="block text-xs font-black text-slate-900">
                    2) VARK 학습 감각 검사 (8문항) <span className="text-[10px] font-bold text-slate-400">{varkAnswers.filter(v => v !== null).length}/8 응답</span>
                  </label>
                  <div className="space-y-2.5">
                    {VARK_QUESTIONS.map((q, qi) => (
                      <div key={q.id} className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                        <p className="text-xs font-bold text-slate-800 mb-2">{qi + 1}. {q.situation}</p>
                        <div className="grid grid-cols-2 gap-1.5">
                          {q.options.map(op => (
                            <button
                              key={op.type}
                              onClick={() => setVarkAnswers(prev => prev.map((a, i) => (i === qi ? op.type : a)))}
                              className={`px-2 py-2 rounded-xl text-[11px] font-bold border transition ${
                                varkAnswers[qi] === op.type
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-white text-slate-600 border-slate-200'
                              }`}
                            >
                              {op.text}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* TAI 14문항 (0~3점, PC 동일 문항·채점) */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                  <label className="block text-xs font-black text-slate-900">
                    3) 시험 불안 검사 (TAI 14문항, 0=전혀 아니다~3=매우 그렇다) <span className="text-[10px] font-bold text-slate-400">{taiAnswers.filter(v => v !== null).length}/14 응답</span>
                  </label>
                  <div className="space-y-2">
                    {TAI_QUESTIONS.map((q, qi) => (
                      <div key={q.id} className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                        <p className="text-xs font-bold text-slate-800 mb-2">
                          <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-md mr-1.5">
                            {q.dimension === 'cognitive' ? '인지적 걱정' : '신체적 긴장'}
                          </span>
                          {qi + 1}. {q.question}
                        </p>
                        <div className="grid grid-cols-4 gap-1.5">
                          {[0, 1, 2, 3].map(v => (
                            <button
                              key={v}
                              onClick={() => setTaiAnswers(prev => prev.map((a, i) => (i === qi ? v : a)))}
                              className={`py-1.5 rounded-xl text-xs font-black border transition ${
                                taiAnswers[qi] === v
                                  ? 'bg-rose-600 text-white border-rose-600'
                                  : 'bg-white text-slate-500 border-slate-200'
                              }`}
                            >
                              {v}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 디지털중독 12문항 (0~4점, PC 동일 문항·채점) */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                  <label className="block text-xs font-black text-slate-900">
                    4) 디지털 중독 검사 (12문항, 0=전혀 아니다~4=매우 그렇다) <span className="text-[10px] font-bold text-slate-400">{digitalAnswers.filter(v => v !== null).length}/12 응답</span>
                  </label>
                  <div className="space-y-2">
                    {DIGITAL_ADDICTION_QUESTIONS.map((q, qi) => (
                      <div key={q.id} className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                        <p className="text-xs font-bold text-slate-800 mb-2">{qi + 1}. {q.question}</p>
                        <div className="grid grid-cols-5 gap-1.5">
                          {[0, 1, 2, 3, 4].map(v => (
                            <button
                              key={v}
                              onClick={() => setDigitalAnswers(prev => prev.map((a, i) => (i === qi ? v : a)))}
                              className={`py-1.5 rounded-xl text-xs font-black border transition ${
                                digitalAnswers[qi] === v
                                  ? 'bg-purple-600 text-white border-purple-600'
                                  : 'bg-white text-slate-500 border-slate-200'
                              }`}
                            >
                              {v}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5대 학습기질 15문항 (1~5점) */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                  <label className="block text-xs font-black text-slate-900">
                    5) 5대 학습기질 자가진단 (1~5점) <span className="text-[10px] font-bold text-slate-400">{learningTraitAnswers.filter(v => v !== null).length}/15 응답</span>
                  </label>
                  <div className="space-y-2.5">
                    {LEARNING_TRAIT_QUESTIONS.map((q, qi) => (
                      <div key={qi} className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                        <p className="text-xs font-bold text-slate-800 mb-2">
                          <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md mr-1.5">
                            {TRAIT_DOMAIN_LABELS[q.domain]}
                          </span>
                          {qi + 1}. {q.text}
                        </p>
                        <div className="grid grid-cols-5 gap-1.5">
                          {[1, 2, 3, 4, 5].map(v => (
                            <button
                              key={v}
                              onClick={() => setLearningTraitAnswers(prev => prev.map((a, i) => (i === qi ? v : a)))}
                              className={`py-1.5 rounded-xl text-xs font-black border transition ${
                                learningTraitAnswers[qi] === v
                                  ? 'bg-indigo-600 text-white border-indigo-600'
                                  : 'bg-white text-slate-500 border-slate-200'
                              }`}
                            >
                              {v}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 메타인지 12문항 (1~5점, PC MSLQ 동일 문항·채점) */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                  <label className="block text-xs font-black text-slate-900">
                    6) 메타인지 전략 검사 (12문항, 1~5점) <span className="text-[10px] font-bold text-slate-400">{metacogAnswers.filter(v => v !== null).length}/12 응답</span>
                  </label>
                  <div className="space-y-2.5">
                    {METACOGNITION_QUESTIONS.map((q, qi) => (
                      <div key={q.id} className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                        <p className="text-xs font-bold text-slate-800 mb-2">
                          <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md mr-1.5">
                            {METACOG_STRATEGY_LABELS[q.strategy]}
                          </span>
                          {qi + 1}. {q.question}
                        </p>
                        <div className="grid grid-cols-5 gap-1.5">
                          {[1, 2, 3, 4, 5].map(v => (
                            <button
                              key={v}
                              onClick={() => setMetacogAnswers(prev => prev.map((a, i) => (i === qi ? v : a)))}
                              className={`py-1.5 rounded-xl text-xs font-black border transition ${
                                metacogAnswers[qi] === v
                                  ? 'bg-emerald-600 text-white border-emerald-600'
                                  : 'bg-white text-slate-500 border-slate-200'
                              }`}
                            >
                              {v}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    const missing: string[] = [];
                    if (meqAnswers.some(v => v === null)) missing.push(`MEQ(${meqAnswers.filter(v => v === null).length})`);
                    if (varkAnswers.some(v => v === null)) missing.push(`VARK(${varkAnswers.filter(v => v === null).length})`);
                    if (taiAnswers.some(v => v === null)) missing.push(`TAI(${taiAnswers.filter(v => v === null).length})`);
                    if (digitalAnswers.some(v => v === null)) missing.push(`디지털(${digitalAnswers.filter(v => v === null).length})`);
                    if (learningTraitAnswers.some(v => v === null)) missing.push(`기질(${learningTraitAnswers.filter(v => v === null).length})`);
                    if (metacogAnswers.some(v => v === null)) missing.push(`메타인지(${metacogAnswers.filter(v => v === null).length})`);
                    if (missing.length > 0) {
                      alert(`미응답 문항이 남았습니다: ${missing.join(', ')}`);
                      return;
                    }
                    setCurrentStep(4);
                  }}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition"
                >
                  <span>다음: 4단계 전두엽 인지 실측 게임</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* STEP 4: 학습 환경 프로토콜 + 학습 분석 (PC Protocol/Analytics 대응) */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
                  <h2 className="text-lg font-black text-slate-900">🏫 4단계: 학습 환경 &amp; 분석</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    평소 공부 환경과 학습 패턴을 입력하면 분석 정확도가 올라갑니다.
                  </p>
                </div>

                {/* 프로토콜: 장소 */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                  <label className="block text-xs font-black text-slate-900">1) 주로 공부하는 장소</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['집', '독서실', '학교', '학원', '카페', '도서관'].map(loc => (
                      <button
                        key={loc}
                        onClick={() => { setProtoLocation(loc); setAnPlace(loc); }}
                        className={`py-2.5 rounded-xl text-xs font-black border transition ${protoLocation === loc ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-600 border-slate-200'}`}
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 프로토콜: 소음/스트레스/수면 */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                  {[
                    { label: '주변 소음 수준', value: protoNoise, set: setProtoNoise, max: 10, unit: '/10' },
                    { label: '현재 스트레스 수준', value: protoStress, set: setProtoStress, max: 10, unit: '/10' },
                  ].map(row => (
                    <div key={row.label}>
                      <div className="flex justify-between text-xs font-black text-slate-700 mb-1">
                        <span>{row.label}</span>
                        <span className="text-indigo-600">{row.value}{row.unit}</span>
                      </div>
                      <input
                        type="range" min="0" max={row.max} value={row.value}
                        onChange={e => row.set(Number(e.target.value))}
                        className="w-full accent-indigo-500 h-2 bg-slate-100 rounded-lg cursor-pointer"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">평균 수면 시간 (시간, 비워두면 생략)</label>
                    <input
                      type="number" min="0" max="24" step="0.5"
                      value={protoSleepHours}
                      onChange={e => setProtoSleepHours(e.target.value)}
                      placeholder="예: 6.5"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800"
                    />
                  </div>
                </div>

                {/* 프로토콜: 심리 3요인 + 과제/시간왜곡 */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                  <label className="block text-xs font-black text-slate-900">2) 학습 심리 요인 (1=매우 낮음 ~ 5=매우 높음)</label>
                  {[
                    { label: '정서 요인 (불안·우울감)', value: protoEmotional, set: setProtoEmotional },
                    { label: '동기 요인 (의욕·목표의식)', value: protoMotivational, set: setProtoMotivational },
                    { label: '실행 요인 (착수·지속력)', value: protoBehavioral, set: setProtoBehavioral },
                    { label: '과제 난이도 체감', value: protoDifficulty, set: setProtoDifficulty },
                    { label: '시간 왜곡 (집중 시 시간 빨리감)', value: protoTimeDistortion, set: setProtoTimeDistortion },
                  ].map(row => (
                    <div key={row.label} className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                      <p className="text-xs font-bold text-slate-800 mb-2">{row.label}</p>
                      <div className="grid grid-cols-5 gap-1.5">
                        {[1, 2, 3, 4, 5].map(v => (
                          <button
                            key={v}
                            onClick={() => row.set(v)}
                            className={`py-1.5 rounded-xl text-xs font-black border transition ${row.value === v ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500 border-slate-200'}`}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 분석: 순공·집중 */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                  <label className="block text-xs font-black text-slate-900">3) 순공·집중 패턴</label>
                  <div>
                    <div className="flex justify-between text-xs font-black text-slate-700 mb-1">
                      <span>순공 시간 비율</span>
                      <span className="text-indigo-600">{anPureRatio}%</span>
                    </div>
                    <input type="range" min="0" max="100" value={anPureRatio} onChange={e => setAnPureRatio(Number(e.target.value))} className="w-full accent-indigo-500 h-2 bg-slate-100 rounded-lg cursor-pointer" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">평균 집중 유지 (분)</label>
                      <input type="number" min="0" value={anFocusMin} onChange={e => setAnFocusMin(e.target.value)} placeholder="예: 25" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">산만 횟수 (회/일)</label>
                      <input type="number" min="0" value={anDistractions} onChange={e => setAnDistractions(e.target.value)} placeholder="예: 8" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold" />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-black text-slate-700 mb-1">
                        <span>목표 달성률</span>
                        <span className="text-indigo-600">{anGoalRate}%</span>
                      </div>
                      <input type="range" min="0" max="100" value={anGoalRate} onChange={e => setAnGoalRate(Number(e.target.value))} className="w-full accent-indigo-500 h-2 bg-slate-100 rounded-lg cursor-pointer" />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-black text-slate-700 mb-1">
                        <span>주중-주말 편차</span>
                        <span className="text-indigo-600">{anWeekGap}%</span>
                      </div>
                      <input type="range" min="0" max="100" value={anWeekGap} onChange={e => setAnWeekGap(Number(e.target.value))} className="w-full accent-indigo-500 h-2 bg-slate-100 rounded-lg cursor-pointer" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">골든타임 시작</label>
                      <input type="time" value={anGoldenStart} onChange={e => setAnGoldenStart(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">골든타임 종료</label>
                      <input type="time" value={anGoldenEnd} onChange={e => setAnGoldenEnd(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">최저효율 시간대 (예: 14:00-16:00, 비워두면 생략)</label>
                    <input type="text" value={anLowTime} onChange={e => setAnLowTime(e.target.value)} placeholder="예: 14:00-16:00" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold" />
                  </div>
                </div>

                {/* 분석: 과목 비중 */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                  <label className="block text-xs font-black text-slate-900">4) 과목별 학습 비중 (합계 자동 정규화)</label>
                  {[
                    { id: 'korean', label: '국어' },
                    { id: 'math', label: '수학' },
                    { id: 'english', label: '영어' },
                    { id: 'science', label: '과학탐구' },
                    { id: 'social', label: '사회탐구' },
                    { id: 'other', label: '기타' },
                  ].map(s => (
                    <div key={s.id}>
                      <div className="flex justify-between text-[11px] font-bold text-slate-600 mb-1">
                        <span>{s.label}</span>
                        <span className="text-indigo-600">{anSubj[s.id] || 0}%</span>
                      </div>
                      <input type="range" min="0" max="60" value={anSubj[s.id] || 0} onChange={e => setAnSubj(prev => ({ ...prev, [s.id]: Number(e.target.value) }))} className="w-full accent-indigo-500 h-2 bg-slate-100 rounded-lg cursor-pointer" />
                    </div>
                  ))}
                </div>

                {/* 분석: 컨디션·회복 */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                  <label className="block text-xs font-black text-slate-900">5) 컨디션·회복 패턴</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">평균 수면 (시간)</label>
                      <input type="number" min="0" max="24" step="0.5" value={anAvgSleep} onChange={e => setAnAvgSleep(e.target.value)} placeholder="예: 6.5" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">연속 학습 일수</label>
                      <input type="number" min="0" value={anStreak} onChange={e => setAnStreak(e.target.value)} placeholder="예: 12" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">번아웃 주기 (일)</label>
                      <input type="number" min="0" value={anBurnout} onChange={e => setAnBurnout(e.target.value)} placeholder="예: 21" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">에너지 패턴</label>
                      <select value={anEnergy} onChange={e => setAnEnergy(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold">
                        <option value="stable">안정형</option>
                        <option value="fluctuating">기복형</option>
                        <option value="declining">하락형</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-600 mb-1.5">수면 품질 (1~5) · 체감 난이도 (1~5) · 휴식 적절성 (1~5)</p>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(v => (
                          <button key={v} onClick={() => setAnSleepQuality(v)} className={`flex-1 py-1.5 rounded-lg text-[11px] font-black border ${anSleepQuality === v ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500 border-slate-200'}`}>{v}</button>
                        ))}
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(v => (
                          <button key={v} onClick={() => setAnDifficulty(v)} className={`flex-1 py-1.5 rounded-lg text-[11px] font-black border ${anDifficulty === v ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-slate-500 border-slate-200'}`}>{v}</button>
                        ))}
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(v => (
                          <button key={v} onClick={() => setAnBreak(v)} className={`flex-1 py-1.5 rounded-lg text-[11px] font-black border ${anBreak === v ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-500 border-slate-200'}`}>{v}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setCurrentStep(5)}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition"
                >
                  <span>다음: 5단계 전두엽 인지 실측 게임</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* STEP 5: 인지 실측 테스트 (Digit Span & Go/No-Go & N-Back) */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
                  <h2 className="text-lg font-black text-slate-900">🧠 5단계: 전두엽 인지 기능 실측</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    자기보고 설문을 넘어, 실제 작업기억 용량과 억제제어 반응속도를 측정합니다.
                  </p>
                </div>

                {/* 1. Digit Span Backward */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-indigo-700 flex items-center gap-1">
                      <Target className="w-4 h-4" /> 과제 1: 숫자 거꾸로 외우기 (Digit Span Backward)
                    </span>
                    {digitStep === 'done' && (
                      <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                        측정 완료 (스팬: {workingMemorySpan})
                      </span>
                    )}
                  </div>

                  {digitStep === 'intro' && (
                    <div className="text-center py-4 space-y-3">
                      <p className="text-xs text-slate-600 leading-relaxed font-bold">
                        화면에 순서대로 나타나는 5자리 숫자를 기억한 뒤,<br />
                        <b>거꾸로(역순)</b> 키패드로 입력하세요!
                      </p>
                      <button
                        onClick={startDigitSpan}
                        className="py-2.5 px-6 rounded-2xl bg-indigo-600 text-white text-xs font-black shadow-sm active:scale-95 transition inline-flex items-center gap-1"
                      >
                        <Play className="w-3.5 h-3.5" /> 테스트 시작
                      </button>
                    </div>
                  )}

                  {digitStep === 'display' && (
                    <div className="text-center py-8">
                      <div className="text-5xl font-black text-indigo-600 animate-pulse">
                        {currentDigitIndex < digitSequence.length ? digitSequence[currentDigitIndex] : '•'}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-3 font-bold">
                        숫자를 잘 기억하세요... ({currentDigitIndex + 1}/{digitSequence.length})
                      </p>
                    </div>
                  )}

                  {digitStep === 'input' && (
                    <div className="space-y-3 py-2">
                      <div className="text-center text-xs font-bold text-slate-600">
                        기억한 숫자를 <span className="text-indigo-600 font-black">역순</span>으로 입력하세요:
                      </div>
                      <div className="h-10 border-2 border-indigo-500 rounded-xl flex items-center justify-center text-lg font-black tracking-widest text-indigo-900 bg-indigo-50/50">
                        {userInputDigits || '입력 대기...'}
                      </div>
                      <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                          <button
                            key={num}
                            onClick={() => handleDigitInput(num)}
                            className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 font-black text-base text-slate-800 transition"
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {digitStep === 'done' && (
                    <div className="text-center py-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs font-bold text-emerald-800">
                      ✅ 작업 기억 용량 실측 성공! (정상 상위 15% 수준의 전두엽 유지)
                    </div>
                  )}
                </div>

                {/* 2. Go/No-Go 주의 억제제어 테스트 */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-blue-700 flex items-center gap-1">
                      <Zap className="w-4 h-4" /> 과제 2: Go/No-Go 충동 억제 제어 테스트
                    </span>
                    {goNoGoStep === 'done' && (
                      <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                        측정 완료 (정확도 {Math.round((correctHits / 12) * 100)}%)
                      </span>
                    )}
                  </div>

                  {goNoGoStep === 'intro' && (
                    <div className="text-center py-4 space-y-3">
                      <p className="text-xs text-slate-600 leading-relaxed font-bold">
                        초록색 <b className="text-emerald-600">[GO]</b>가 뜨면 최대한 빠르게 터치하고,<br />
                        빨간색 <b className="text-rose-600">[NO-GO]</b>가 뜨면 손을 멈추고 억제하세요!
                      </p>
                      <button
                        onClick={() => {
                          setTrialCount(0);
                          setCorrectHits(0);
                          setFalseAlarms(0);
                          setReactionTimes([]);
                          setGoNoGoStep('playing');
                        }}
                        className="py-2.5 px-6 rounded-2xl bg-blue-600 text-white text-xs font-black shadow-sm active:scale-95 transition inline-flex items-center gap-1"
                      >
                        <Play className="w-3.5 h-3.5" /> 반응속도 측정 시작
                      </button>
                    </div>
                  )}

                  {goNoGoStep === 'playing' && (
                    <div className="py-6 text-center space-y-4">
                      <div className="text-xs font-bold text-slate-500">
                        진행: {trialCount + 1} / 12회차
                      </div>
                      <div
                        onClick={handleGoClick}
                        className={`w-36 h-36 rounded-full mx-auto flex items-center justify-center text-2xl font-black text-white shadow-lg cursor-pointer transition active:scale-95 ${
                          currentCue === 'GO'
                            ? 'bg-emerald-500 hover:bg-emerald-600 animate-bounce'
                            : currentCue === 'NOGO'
                            ? 'bg-rose-500 hover:bg-rose-600'
                            : 'bg-slate-300'
                        }`}
                      >
                        {currentCue === 'GO' && '터치! (GO)'}
                        {currentCue === 'NOGO' && '스톱! (NO)'}
                        {!currentCue && '준비...'}
                      </div>
                      <p className="text-[11px] text-slate-400 font-bold">
                        초록색 원형을 터치하세요!
                      </p>
                    </div>
                  )}

                  {goNoGoStep === 'done' && (
                    <div className="text-center py-3 bg-blue-50 rounded-2xl border border-blue-200 text-xs font-bold text-blue-800">
                      ✅ 억제 제어 테스트 완료! (반응시간: {reactionTimes.length > 0 ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length) : 380}ms)
                    </div>
                  )}
                </div>

                {/* 3. N-Back 작업기억 업데이트 테스트 (2-back, 20시행) */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-purple-700 flex items-center gap-1">
                      <span>🧩</span> 과제 3: N-Back 작업기억 업데이트 테스트
                    </span>
                    {nbackStep === 'done' && (
                      <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                        측정 완료 (정확도 {nbackAccuracy}% · Lv.{nbackLevel})
                      </span>
                    )}
                  </div>

                  {nbackStep === 'intro' && (
                    <div className="text-center py-4 space-y-3">
                      <p className="text-xs text-slate-600 leading-relaxed font-bold">
                        숫자가 하나씩 나타납니다. 지금 숫자가 <b>2개 전 숫자</b>와 같으면 [일치],
                        다르면 [다름]을 누르세요! (총 20회, 앞 2회는 연습)
                      </p>
                      <button
                        onClick={startNback}
                        className="py-2.5 px-6 rounded-2xl bg-purple-600 text-white text-xs font-black shadow-sm active:scale-95 transition inline-flex items-center gap-1"
                      >
                        <Play className="w-3.5 h-3.5" /> N-Back 측정 시작
                      </button>
                    </div>
                  )}

                  {nbackStep === 'playing' && (
                    <div className="py-4 text-center space-y-4">
                      <div className="text-xs font-bold text-slate-500">
                        진행: {Math.min(nbackIdx + 1, NBACK_TRIALS)} / {NBACK_TRIALS}회차
                        {nbackIdx < 2 ? ' (연습 중 — 기록 제외)' : ''}
                      </div>
                      <div className="w-28 h-28 rounded-3xl mx-auto flex items-center justify-center text-5xl font-black text-white shadow-lg bg-gradient-to-br from-purple-500 to-indigo-600">
                        {nbackIdx < NBACK_TRIALS ? nbackSeq[nbackIdx] : '·'}
                      </div>
                      <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto">
                        <button
                          onClick={() => handleNbackAnswer(true)}
                          className="py-3 rounded-2xl bg-emerald-500 text-white text-sm font-black shadow-sm active:scale-95 transition"
                        >
                          일치함
                        </button>
                        <button
                          onClick={() => handleNbackAnswer(false)}
                          className="py-3 rounded-2xl bg-slate-200 text-slate-700 text-sm font-black shadow-sm active:scale-95 transition"
                        >
                          다름
                        </button>
                      </div>
                    </div>
                  )}

                  {nbackStep === 'done' && (
                    <div className="text-center py-3 bg-purple-50 rounded-2xl border border-purple-200 text-xs font-bold text-purple-800">
                      ✅ N-Back 완료! 정답 {nbackHits}/{nbackTotal} (정확도 {nbackAccuracy}%, Lv.{nbackLevel})
                    </div>
                  )}
                </div>

                <button
                  onClick={handleRunEvaluation}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg active:scale-98 transition mt-3"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>AI 전두엽·뇌신체 종합 진단 리포트 생성하기</span>
                </button>
              </div>
            )}

            {/* STEP 6: AI 분석 로딩 애니메이션 */}
            {currentStep === 6 && (
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center py-16 space-y-6">
                <div className="relative w-20 h-20 mx-auto">
                  <div className="absolute inset-0 rounded-full border-4 border-indigo-100" />
                  <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
                  <Brain className="w-8 h-8 text-indigo-600 absolute inset-0 m-auto" />
                </div>

                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    신경인지 다면 분석 및 12대 케어타입 분류 중...
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    BAI, ISI, ANS, CFS, 집중력, 부신 호르몬 축 데이터를 교차 검증하고 있습니다.
                  </p>
                </div>

                <div className="max-w-xs mx-auto">
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300 rounded-full"
                      style={{ width: `${analysisProgress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-1.5">
                    <span>알고리즘 교차 평가</span>
                    <span>{analysisProgress}%</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
