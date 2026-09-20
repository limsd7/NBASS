import React, { useState } from 'react';
import { 
  Brain, Activity, Clock, ArrowRight, ArrowLeft, CheckCircle2, 
  Sparkles, RefreshCw, Award, Zap, Utensils, Dumbbell, Moon, Save, 
  Lock, AlertCircle, ShieldCheck, Heart, User, Scale, Flame
} from 'lucide-react';
import { UserProfile, AssessmentResult } from '../types';

interface AssessmentAppProps {
  user: UserProfile | null;
  onOpenAuth: () => void;
  onSaveResult: (result: AssessmentResult) => void;
}

export const AssessmentApp: React.FC<AssessmentAppProps> = ({ user, onOpenAuth, onSaveResult }) => {
  const [step, setStep] = useState(1); // 1: Profile, 2: EEG Reaction Simulation, 3: Stress Questionnaire, 4: Processing, 5: Result Report
  
  // Profile state
  const [height, setHeight] = useState('175');
  const [weight, setWeight] = useState('68');
  const [studyHours, setStudyHours] = useState('8');
  const [sleepHours, setSleepHours] = useState('6.5');
  const [cognitiveStyle, setCognitiveStyle] = useState('시각적 집중형 (Visual-Dominant)');

  // EEG Reaction simulation state
  const [reactionClicks, setReactionClicks] = useState(0);
  const [reactionTime, setReactionTime] = useState<number[]>([]);
  const [gameActive, setGameActive] = useState(false);
  const [targetVisible, setTargetVisible] = useState(false);
  const [startTime, setStartTime] = useState(0);

  // Questionnaire state
  const [mentalFatigue, setMentalFatigue] = useState('보통');
  const [caffeineIntake, setCaffeineIntake] = useState('하루 1~2잔');
  const [anxietyLevel, setAnxietyLevel] = useState('보통');

  // Result state
  const [result, setResult] = useState<AssessmentResult | null>(null);

  // Start EEG reaction game
  const startEegGame = () => {
    setReactionClicks(0);
    setReactionTime([]);
    setGameActive(true);
    nextTarget();
  };

  const nextTarget = () => {
    if (reactionClicks >= 5) {
      setGameActive(false);
      setTargetVisible(false);
      return;
    }
    setTargetVisible(false);
    const delay = Math.random() * 1200 + 600;
    setTimeout(() => {
      setTargetVisible(true);
      setStartTime(Date.now());
    }, delay);
  };

  const handleTargetClick = () => {
    if (!targetVisible) return;
    const elapsed = Date.now() - startTime;
    setReactionTime(prev => [...prev, elapsed]);
    setReactionClicks(prev => prev + 1);
    setTargetVisible(false);
    nextTarget();
  };

  // Process assessment and generate result
  const handleGenerateResult = () => {
    setStep(4); // Processing step
    setTimeout(() => {
      // 1. 신체 데이터 계산
      const hNum = parseFloat(height) || 175;
      const wNum = parseFloat(weight) || 68;
      const calcBmi = parseFloat((wNum / ((hNum / 100) ** 2)).toFixed(1));
      const calcBmiStatus = calcBmi < 18.5 ? '저체중' : calcBmi < 23 ? '정상 체중' : calcBmi < 25 ? '과체중' : '비만 경향';

      const sHours = parseFloat(studyHours) || 8;
      const slHours = parseFloat(sleepHours) || 6.5;

      // 2. 반응속도 실측 데이터 계산
      const times = reactionTime.length > 0 ? reactionTime : [320, 310, 295, 330, 305];
      const avgReaction = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
      const minReaction = Math.min(...times);
      const maxReaction = Math.max(...times);
      const reactionDiff = maxReaction - minReaction;
      const stability = reactionDiff < 70 ? '매우 안정적 (High Consistency)' : reactionDiff < 140 ? '보통 (Moderate)' : '기복 있음 (Fluctuating)';
      const grade = avgReaction < 280 ? '최상위 (Top 5%)' : avgReaction < 330 ? '우수 (Top 20%)' : avgReaction < 390 ? '보통 (Average)' : '주의 (Slow)';

      // 3. 간이 환산 지수
      const focusCalc = Math.min(98, Math.max(50, Math.round(100 - (avgReaction - 200) / 7)));
      const stressCalc = mentalFatigue === '높음' ? 78 : mentalFatigue === '보통' ? 48 : 24;
      const sleepCalc = slHours >= 7.5 ? 88 : slHours >= 6 ? 72 : 52;

      // 4. 실측 기반 1순위 긴급 팁
      const tips: string[] = [];
      if (caffeineIntake === '3잔 이상') {
        tips.push('오후 2시 이후 카페인 섭취를 중단하여 수면 뇌파 분절을 방지하세요.');
      } else {
        tips.push('학습 착수 전 5분간 집중 목표를 시각적으로 메모하여 인지 부하를 분산하세요.');
      }
      if (slHours < 6.5) {
        tips.push(`현재 수면(${slHours}시간)이 부족하여 뇌 피로 회복이 지연될 수 있으니 최소 7시간 수면을 확보하세요.`);
      } else {
        tips.push('50분 집중 학습 후 10분간 화면을 보지 않는 무화면 뇌휴식(Brain Rest) 루틴을 적용하세요.');
      }
      if (anxietyLevel === '높음') {
        tips.push('시험이나 자습 시작 전 4초 흡기 - 6초 호기의 복식호흡을 5회 실시하여 긴장을 완화하세요.');
      }

      const generated: AssessmentResult = {
        id: 'res_' + Date.now(),
        date: new Date().toLocaleDateString('ko-KR'),
        bmi: calcBmi,
        bmiStatus: calcBmiStatus,
        studyHours: sHours,
        sleepHours: slHours,
        cognitiveStyle,
        reactionTimeAvg: avgReaction,
        reactionTimeMin: minReaction,
        reactionTimeMax: maxReaction,
        reactionStability: stability,
        reactionTimes: times,
        reactionGrade: grade,
        fatigueLevel: mentalFatigue,
        caffeineIntake,
        anxietyLevel,
        focusScore: focusCalc,
        stressScore: stressCalc,
        sleepScore: sleepCalc,
        quickTips: tips
      };

      setResult(generated);
      onSaveResult(generated);
      setStep(5); // Result report view
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Top Header progress */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-[11px] font-extrabold">무료체험 모드</span>
                  <h1 className="text-lg font-black text-slate-900">간이 두뇌·학습 스크리닝 검사</h1>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {user ? `${user.name} (${user.targetGroup}) 회원님 간이 검사` : '게스트 10분 무료체험'}
                </p>
              </div>
            </div>
            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100">
              Step {step} / 5
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full transition-all duration-500"
              style={{ width: `${(step / 5) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* STEP 1: Profile & Target */}
        {step === 1 && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200 space-y-6 animate-fadeIn">
            <div>
              <div className="inline-block px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg mb-2">
                1단계 / 기초 데이터
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">신체 프로파일 및 수면·학습 패턴 입력</h2>
              <p className="text-sm text-slate-600">신체 대사량(BMI)과 일일 생체 리듬 밸런스를 계산하기 위한 기본 정보를 입력해주세요.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">신장 (cm)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">체중 (kg)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">일일 평균 학습 시간 (시간)</label>
                <input
                  type="number"
                  value={studyHours}
                  onChange={(e) => setStudyHours(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">일일 평균 수면 시간 (시간)</label>
                <input
                  type="number"
                  step="0.5"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-700 mb-2">인지 성향 및 학습 스타일 선호</label>
              <select
                value={cognitiveStyle}
                onChange={(e) => setCognitiveStyle(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
              >
                <option value="시각적 집중형 (Visual-Dominant)">시각적 집중형 (다이어그램, 마인드맵, 도표 선호)</option>
                <option value="청각적 몰입형 (Auditory-Dominant)">청각적 몰입형 (강의 청취, 소리내어 암기 선호)</option>
                <option value="체감각/실습형 (Kinesthetic-Dominant)">체감각/실습형 (직접 쓰고 풀며 체득하는 유형)</option>
              </select>
            </div>

            <div className="flex justify-end pt-6 border-t border-slate-100">
              <button
                onClick={() => setStep(2)}
                className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>다음 단계 (순발력 반응속도 테스트)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Reaction Simulator */}
        {step === 2 && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200 space-y-6 animate-fadeIn">
            <div>
              <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-lg mb-2">
                2단계 / 인지 순발력 실측
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">순간 집중 반응속도 실측 테스트</h2>
              <p className="text-sm text-slate-600">화면에 파란색 원이 나타날 때 최대한 신속하게 클릭해주세요. (총 5회 실측)</p>
            </div>

            <div className="bg-slate-900 rounded-3xl p-8 text-center min-h-[300px] flex flex-col items-center justify-center relative overflow-hidden">
              {!gameActive && reactionClicks === 0 && (
                <div className="space-y-4">
                  <Brain className="w-16 h-16 text-blue-400 mx-auto animate-pulse" />
                  <h3 className="text-xl font-bold text-white">반응속도 테스트 준비</h3>
                  <p className="text-xs text-slate-400 max-w-sm">시작 버튼을 누른 뒤 파란색 원이 뜨면 즉시 클릭하세요.</p>
                  <button
                    onClick={startEegGame}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg cursor-pointer"
                  >
                    테스트 시작하기
                  </button>
                </div>
              )}

              {gameActive && (
                <div className="w-full h-full flex flex-col items-center justify-center min-h-[220px]">
                  {targetVisible ? (
                    <button
                      onClick={handleTargetClick}
                      className="w-24 h-24 rounded-full bg-blue-500 hover:bg-blue-400 text-white font-extrabold shadow-lg shadow-blue-500/50 animate-ping cursor-pointer flex items-center justify-center"
                    >
                      클릭!
                    </button>
                  ) : (
                    <p className="text-slate-400 text-sm animate-pulse">원 출현 대기 중...</p>
                  )}
                  <p className="text-xs text-slate-500 mt-6">진행 상황: {reactionClicks} / 5 회 완료</p>
                </div>
              )}

              {!gameActive && reactionClicks >= 5 && (
                <div className="space-y-4">
                  <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto" />
                  <h3 className="text-xl font-bold text-white">5회 실측 완료!</h3>
                  <p className="text-sm text-emerald-300">
                    평균 반응 속도: {Math.round(reactionTime.reduce((a,b)=>a+b,0)/reactionTime.length)}ms
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-between pt-6 border-t border-slate-100">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>이전</span>
              </button>

              <button
                onClick={() => setStep(3)}
                disabled={reactionClicks < 5}
                className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>다음 단계 (자가 스트레스 문진)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Stress Questionnaire */}
        {step === 3 && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200 space-y-6 animate-fadeIn">
            <div>
              <div className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-lg mb-2">
                3단계 / 주관적 체감 문진
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">피로도 및 생활 습관 간이 문진</h2>
              <p className="text-sm text-slate-600">현재 느끼고 계신 신체 피로와 학업 스트레스 수준을 선택해주세요.</p>
            </div>

            <div className="space-y-6 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">1. 최근 일주일간 느끼는 정신적·육체적 피로도</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['낮음', '보통', '높음'] as const).map((lvl) => (
                    <button
                      type="button"
                      key={lvl}
                      onClick={() => setMentalFatigue(lvl)}
                      className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all ${
                        mentalFatigue === lvl
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">2. 하루 커피 및 고카페인 음료 섭취량</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['안 마심', '하루 1~2잔', '3잔 이상'] as const).map((caf) => (
                    <button
                      type="button"
                      key={caf}
                      onClick={() => setCaffeineIntake(caf)}
                      className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all ${
                        caffeineIntake === caf
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {caf}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">3. 시험/학업 관련 불안감 또는 초조함 수준</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['낮음', '보통', '높음'] as const).map((anx) => (
                    <button
                      type="button"
                      key={anx}
                      onClick={() => setAnxietyLevel(anx)}
                      className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all ${
                        anxietyLevel === anx
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {anx}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-6 border-t border-slate-100">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>이전</span>
              </button>

              <button
                onClick={handleGenerateResult}
                className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>간이 스크리닝 리포트 확인하기</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Processing Animation */}
        {step === 4 && (
          <div className="bg-white rounded-3xl p-12 shadow-sm border border-slate-200 text-center space-y-6 animate-fadeIn">
            <div className="w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center mx-auto text-blue-600 shadow-inner">
              <RefreshCw className="w-10 h-10 animate-spin" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900">실측 데이터 집계 및 스크리닝 분석 중...</h2>
              <p className="text-sm text-slate-500">
                입력하신 신체 대사 지표와 반응속도 실측치를 집계하여 간이 스크리닝 요약을 생성하고 있습니다.
              </p>
            </div>
            <div className="max-w-xs mx-auto bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full animate-pulse w-3/4"></div>
            </div>
          </div>
        )}

        {/* STEP 5: Lightened & Truthful Screening Report */}
        {step === 5 && result && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200 space-y-8 animate-fadeIn">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-6 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">
                    ⚡ 10분 무료체험 간이 스크리닝 완료
                  </span>
                  <span className="text-xs text-slate-400 font-mono">#{result.id.slice(-6)}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                  {user ? user.name : '회원'}님의 <span className="text-blue-600">간이 두뇌·학습 스크리닝 요약서</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  검사일: {result.date} | 구분: 1차 간이 스크리닝 (Web Rapid Test)
                </p>
              </div>

              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer w-fit"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>재검사 하기</span>
              </button>
            </div>

            {/* Notice Alert */}
            <div className="bg-blue-50/80 border border-blue-200/70 rounded-2xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-xs text-blue-900 leading-relaxed font-medium">
                <span className="font-bold">안내:</span> 본 리포트는 <b>웹 간이 반응속도 실측치(5회)</b> 및 <b>자가 문진</b>에 기초한 1차 스크리닝 결과입니다. 실제 뇌파 및 심층 자율신경계(교감·부교감) 24P 정밀 분석은 <b>정밀 종합진단</b>에서 제공됩니다.
              </div>
            </div>

            {/* SECTION 1: 3 Measured Data Sections (1:1 매칭 실측 결과) */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                <h3 className="text-base font-extrabold text-slate-900">1. 실측 데이터 기반 핵심 지표</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* 1. Body & Rhythm */}
                <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                      <Scale className="w-4 h-4 text-indigo-500" /> 신체 대사 & 리듬
                    </span>
                    <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      실측
                    </span>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-slate-900">
                      BMI {result.bmi}
                      <span className="text-xs font-bold text-slate-500 ml-1.5">({result.bmiStatus})</span>
                    </div>
                    <div className="mt-3 space-y-1 text-xs text-slate-600">
                      <p>• 일일 학습: <b>{result.studyHours}시간</b></p>
                      <p>• 일일 수면: <b>{result.sleepHours}시간</b></p>
                      <p className="text-[11px] text-slate-500 pt-1">• 선호: {result.cognitiveStyle.split(' ')[0]}</p>
                    </div>
                  </div>
                </div>

                {/* 2. Reaction Time (Measured) */}
                <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-500" /> 인지 순발력 실측
                    </span>
                    <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                      5회 실측
                    </span>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-amber-600">
                      {result.reactionTimeAvg}<span className="text-sm font-normal text-slate-500">ms</span>
                      <span className="text-xs font-bold text-slate-600 ml-2">({result.reactionGrade})</span>
                    </div>
                    <div className="mt-3 space-y-1 text-xs text-slate-600">
                      <p>• 최속 반응: <b>{result.reactionTimeMin}ms</b> / 최저: <b>{result.reactionTimeMax}ms</b></p>
                      <p>• 반응 안정도: <b>{result.reactionStability}</b></p>
                      {/* Simple visual bar */}
                      <div className="flex items-center gap-1 pt-1.5">
                        {result.reactionTimes.map((t, idx) => (
                          <div key={idx} className="flex-1 bg-slate-200 h-1.5 rounded-full overflow-hidden" title={`${idx+1}회: ${t}ms`}>
                            <div 
                              className="bg-amber-500 h-full rounded-full" 
                              style={{ width: `${Math.min(100, Math.max(20, 100 - (t - 200) / 3))}%` }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Subjective Questionnaire (Measured) */}
                <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-rose-500" /> 체감 피로 & 스트레스
                    </span>
                    <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                      문진
                    </span>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-slate-900">
                      피로도 <span className={result.fatigueLevel === '높음' ? 'text-rose-600' : 'text-slate-700'}>{result.fatigueLevel}</span>
                    </div>
                    <div className="mt-3 space-y-1 text-xs text-slate-600">
                      <p>• 카페인 섭취: <b>{result.caffeineIntake}</b></p>
                      <p>• 학업 불안감: <b>{result.anxietyLevel}</b></p>
                      <p>• 추정 스트레스 체감도: <b>{result.stressScore}점</b></p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* SECTION 2: Quick Action Recommendations (실측 기반 1순위 행동 요령) */}
            <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-6 space-y-3">
              <h3 className="text-sm font-extrabold text-indigo-950 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>2. 오늘 즉시 실천할 1순위 핵심 요령</span>
              </h3>
              <ul className="space-y-2">
                {result.quickTips.map((tip, idx) => (
                  <li key={idx} className="text-xs sm:text-sm text-slate-700 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* SECTION 3: Locked Precision Diagnostic Areas (Teaser) */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                  <h3 className="text-base font-extrabold text-slate-900">3. 정밀 종합진단 항목 (센서 및 심층 검사)</h3>
                </div>
                <span className="text-xs font-bold text-slate-400">🔒 정밀 검사 시 제공</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                <div className="border border-dashed border-slate-300 rounded-2xl p-5 bg-slate-50/50 space-y-2 opacity-80">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>2채널 EEG 뇌파 정밀 분석</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    알파파/베타파 집중 활성도 비율, 전두엽 뇌 피로도, 인지 과부하 상태 정밀 분석
                  </p>
                  <span className="inline-block text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                    ※ 뇌파 센서 헤드셋 측정 필요
                  </span>
                </div>

                <div className="border border-dashed border-slate-300 rounded-2xl p-5 bg-slate-50/50 space-y-2 opacity-80">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>자율신경계 밸런스 & 스트레스 진단</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    교감·부교감 신경 균형비, 자율신경 조절력, 누적 번아웃 위험도 정밀 분석
                  </p>
                  <span className="inline-block text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                    ※ 심층 설문 기반 자율신경 분석
                  </span>
                </div>

                <div className="border border-dashed border-slate-300 rounded-2xl p-5 bg-slate-50/50 space-y-2 opacity-80">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>24P 종합 처방 & 취약과목 시간표</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    작업기억 용량 측정, 두뇌 골든타임 과목 배치, 맞춤 영양·수면 전문 처방
                  </p>
                  <span className="inline-block text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                    ※ 심층 종합 진단서 제공
                  </span>
                </div>

              </div>

              {/* Upgrade / Consultation Banner */}
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
                <div>
                  <h4 className="text-base font-black text-white flex items-center gap-2">
                    <span>💎</span> 정밀 생체 신호 측정 및 24P 종합 솔루션이 필요하신가요?
                  </h4>
                  <p className="text-xs text-slate-300 mt-1">
                    정밀 센서 검사를 통해 수험생 개인별 최적의 뇌파 피크 타임과 맞춤형 입시 학습 전략을 수립하세요.
                  </p>
                </div>
                <button
                  onClick={() => alert('정밀 종합진단 신청 및 전문가 상담 안내 페이지로 연결됩니다.')}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-lg transition-all whitespace-nowrap cursor-pointer"
                >
                  전문가 정밀 종합진단 신청
                </button>
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
              <p className="text-xs text-slate-500">간이 스크리닝 결과가 대시보드에 안전하게 저장되었습니다.</p>
              <button
                onClick={() => alert('간이 스크리닝 리포트가 저장되었습니다.')}
                className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>리포트 저장 완료</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

