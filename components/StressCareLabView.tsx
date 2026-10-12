import React, { useState, useEffect, useMemo } from 'react';
import { CareType, StudentInfo } from '../types';
import { 
  CARE_TYPE_STRESS_ADVICE, 
  SUBJECT_PHASE_ADVICE, 
  getCombinedStressAdvice, 
  SOS_SITUATIONS 
} from '../data/stressCareData';
import { CARE_TYPE_LABELS } from '../logicEngine';
import { BreathingCore } from './BreathingGuide';
import { recommendBreathingProtocols } from '../services/breathingEngine';
import { BREATH_SAFETY_NOTICE } from '../data/breathingProtocols';

const SUBJECT_LABELS: Record<string, { label: string; icon: string; desc: string }> = {
  'korean': { label: '국어', icon: '📖', desc: '1교시 언어 예열 & 지문 난독 방지' },
  'math': { label: '수학', icon: '📐', desc: '2교시 킬러 뇌정지 극복 & 계산 안정' },
  'english': { label: '영어', icon: '🌍', desc: '3교시 식곤증 타파 & 지문 흐름 장악' },
  'science': { label: '과탐', icon: '🔬', desc: '4교시 타임어택 & 그래프 함정 돌파' },
  'social': { label: '사탐', icon: '🗺️', desc: '4교시 개념 정밀 판별 & 말장난 극복' }
};

interface StressCareLabViewProps {
  student?: StudentInfo;
  history?: any[];
}

export const StressCareLabView: React.FC<StressCareLabViewProps> = ({ student, history }) => {
  // Navigation Tabs: 'timeline' (타임라인 솔루션) | 'sos' (긴급 안심 룸) | 'prescription' (처방전 & 데일리 플래너)
  const [activeTab, setActiveTab] = useState<'timeline' | 'sos' | 'prescription'>('timeline');
  
  // Selection States
  const [selectedCareType, setSelectedCareType] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('korean');
  const [selectedSOS, setSelectedSOS] = useState<string>('panic_attack');
  
  // Interactive Routine Checklist State
  const [completedRoutines, setCompletedRoutines] = useState<Record<string, boolean>>({});
  
  // Interactive Grounding Step
  const [groundingStep, setGroundingStep] = useState<number>(0);

  // CareType 연동 호흡 프로토콜 (급성 진정 상황 기준, 수동 전환 가능)
  const breathReco = useMemo(
    () => recommendBreathingProtocols(selectedCareType || undefined, 'acute_anxiety'),
    [selectedCareType]
  );
  const [breathProtocolId, setBreathProtocolId] = useState<string | null>(null);
  const allBreathOptions = useMemo(() => [breathReco.primary, ...breathReco.alternatives], [breathReco]);
  const activeBreath = allBreathOptions.find(p => p.id === breathProtocolId) || breathReco.primary;

  // 최근 진단 기록 및 Top 분류 추출 (오직 진단 결과에 나타난 유형만 추출)
  const latestAssessment = useMemo(() => {
    if (!history || history.length === 0) return null;
    const sortedHistory = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return sortedHistory.find(r => r.classificationResult?.primary) || sortedHistory[0];
  }, [history]);

  // 학생의 실제 종합 진단 분석에 도출된 Top 유형 목록 (1순위, 2순위, 3순위)
  const diagnosedTypes = useMemo<{ type: string; rankLabel: string; score?: number; confidenceLabel?: string; isPrimary: boolean }[]>(() => {
    if (!latestAssessment || !latestAssessment.classificationResult) {
      // 진단 결과가 없을 경우 기본값
      return [
        { type: CareType.ANXIETY_TENSION, rankLabel: '1순위 (주분류)', score: 85, confidenceLabel: '확정 진단', isPrimary: true },
        { type: CareType.BRAIN_FATIGUE, rankLabel: '2순위 (부분류)', score: 72, confidenceLabel: '확정 진단', isPrimary: false },
        { type: CareType.SLEEP, rankLabel: '3순위 (부분류)', score: 64, confidenceLabel: '근접 추정', isPrimary: false },
      ];
    }

    const cr = latestAssessment.classificationResult;
    const results: { type: string; rankLabel: string; score?: number; confidenceLabel?: string; isPrimary: boolean }[] = [];

    // 1순위 (Primary)
    if (cr.primary && cr.primary !== CareType.UNASSESSED) {
      results.push({
        type: cr.primary,
        rankLabel: '1순위 (주 진단)',
        score: cr.primaryScore || 0,
        isPrimary: true
      });
    }

    // 2순위, 3순위 (allScores 또는 secondaryScores 활용)
    if (cr.allScores && cr.allScores.length > 0) {
      cr.allScores
        .filter((s: any) => s.type !== cr.primary && s.type !== CareType.UNASSESSED && s.type !== CareType.CONCENTRATION)
        .slice(0, 2)
        .forEach((s: any, idx: number) => {
          const confidenceLabel = (s.score || 0) >= 70 ? '확정 진단' : '근접 추정';
          results.push({
            type: s.type,
            rankLabel: `${idx + 2}순위 (${confidenceLabel})`,
            score: s.score || 0,
            confidenceLabel,
            isPrimary: false
          });
        });
    } else if (cr.secondary && cr.secondary.length > 0) {
      cr.secondary.forEach((st: string, idx: number) => {
        if (st !== cr.primary && results.length < 3) {
          const score = cr.secondaryScores?.[idx]?.score || 0;
          const confidenceLabel = score >= 70 ? '확정 진단' : '근접 추정';
          results.push({
            type: st,
            rankLabel: `${idx + 2}순위 (${confidenceLabel})`,
            score,
            confidenceLabel,
            isPrimary: false
          });
        }
      });
    }

    return results;
  }, [latestAssessment]);

  // 마운트 시 1순위(주분류)로 기본 선택
  useEffect(() => {
    if (diagnosedTypes.length > 0) {
      setSelectedCareType(diagnosedTypes[0].type);
    }
  }, [diagnosedTypes]);

  const activeDiagnosedItem = diagnosedTypes.find(d => d.type === selectedCareType) || diagnosedTypes[0];
  const careAdvice = selectedCareType ? (CARE_TYPE_STRESS_ADVICE[selectedCareType] || CARE_TYPE_STRESS_ADVICE[CareType.ANXIETY_TENSION]) : null;
  const subjectPhaseData = selectedSubject ? SUBJECT_PHASE_ADVICE[selectedSubject] : null;
  const combinedAdvice = (selectedCareType && selectedSubject) 
    ? getCombinedStressAdvice(selectedCareType, selectedSubject) 
    : [];
  const sosAdvice = selectedSOS ? SOS_SITUATIONS[selectedSOS] : null;

  const toggleRoutine = (id: string) => {
    setCompletedRoutines(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  const groundingSteps = [
    { step: '5', label: '눈에 보이는 것 5가지', desc: '주변에서 시각적으로 편안함을 주는 사물 5개를 마음속으로 세어보세요.', icon: '👀' },
    { step: '4', label: '손끝에 닿는 것 4가지', desc: '책상 표면, 옷감, 펜의 촉감 등 손에 닿는 느낌 4가지를 느껴보세요.', icon: '✋' },
    { step: '3', label: '귀에 들리는 소리 3가지', desc: '시계 초침 소리, 숨소리, 멀리서 들리는 백색 소음 3가지에 귀 기울이세요.', icon: '👂' },
    { step: '2', label: '코로 맡아지는 냄새 2가지', desc: '방 안의 공기, 책 종이 냄새 등 냄새 2가지를 맡아보세요.', icon: '👃' },
    { step: '1', label: '나를 칭찬하는 한마디', desc: '“나는 지금 잘해내고 있고, 이 순간을 지나 더 단단해진다”고 속으로 외치세요.', icon: '❤️' }
  ];

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Print Specific Styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #prescription-area, #prescription-area * { visibility: visible; }
          #prescription-area { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100% !important; 
            margin: 0; 
            padding: 24px !important; 
            box-shadow: none !important; 
            border: 1px solid #cbd5e1 !important; 
            background: #ffffff !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Main Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 md:p-10 mb-8 shadow-2xl border border-indigo-900/50">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-8 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs sm:text-sm font-bold mb-3 tracking-wide">
              <span>🧠</span> {student?.name ? `${student.name} 학생을 위한 ` : ''}맞춤 신경계 솔루션 연구소
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              솔루션 연구소 <span className="text-indigo-400 font-light text-xl sm:text-2xl">| Stress Care Lab</span>
            </h1>
            <p className="text-slate-300 mt-2 text-sm sm:text-base max-w-2xl leading-relaxed">
              종합 진단 결과에서 도출된 <strong className="text-indigo-300 font-semibold">핵심 신경계 유형</strong>에 맞춰,
              수능 영역별 행동 루틴과 긴급 진정 툴킷을 제공합니다.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto no-print">
            <button 
              onClick={() => { setActiveTab('prescription'); setTimeout(handlePrint, 300); }}
              className="flex-1 md:flex-initial px-5 py-3 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
            >
              <span className="text-lg">🖨️</span> 처방전 인쇄 / PDF
            </button>
          </div>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-wrap gap-2 sm:gap-3 no-print">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-5 py-2.5 rounded-xl font-extrabold text-sm sm:text-base transition-all flex items-center gap-2.5 ${
              activeTab === 'timeline'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span>⏱️</span> 1. 타임라인 실전 솔루션
          </button>
          <button
            onClick={() => setActiveTab('sos')}
            className={`px-5 py-2.5 rounded-xl font-extrabold text-sm sm:text-base transition-all flex items-center gap-2.5 ${
              activeTab === 'sos'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 ring-2 ring-rose-400'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span>🚨</span> 2. SOS 긴급 안심 룸 (호흡/그라운딩)
          </button>
          <button
            onClick={() => setActiveTab('prescription')}
            className={`px-5 py-2.5 rounded-xl font-extrabold text-sm sm:text-base transition-all flex items-center gap-2.5 ${
              activeTab === 'prescription'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 ring-2 ring-emerald-400'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span>📋</span> 3. 멘탈 처방전 & 데일리 플래너
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ⏱️ 타임라인 실전 솔루션 */}
      {/* ========================================================================= */}
      {activeTab === 'timeline' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* Top Selectors Bar: 학생의 진단 결과에 나타난 유형만 카드로 노출 */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-sm border border-slate-200 space-y-5">
            
            {/* 1) 학생 맞춤 진단 유형 선택기 (다른 불필요한 유형은 완전히 제거) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-black tracking-wider text-slate-500 uppercase flex items-center gap-1.5">
                  <span className="text-base">🩺</span> 나의 종합 진단 분석 결과 ({diagnosedTypes.length}개 핵심 지표)
                </label>
                <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                  ※ 진단 결과에 감지된 유형만 활성화됩니다
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {diagnosedTypes.map((item) => {
                  const isSelected = selectedCareType === item.type;
                  const labelInfo = CARE_TYPE_LABELS[item.type as CareType];
                  const titleName = labelInfo?.name || item.type;
                  
                  return (
                    <button
                      key={item.type}
                      onClick={() => setSelectedCareType(item.type)}
                      className={`p-4 rounded-2xl text-left transition-all border flex flex-col justify-between relative overflow-hidden ${
                        isSelected
                          ? 'bg-gradient-to-br from-indigo-900 to-slate-900 text-white shadow-lg shadow-indigo-950/20 border-indigo-500 ring-2 ring-indigo-500'
                          : 'bg-slate-50/80 hover:bg-slate-100/80 text-slate-800 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-black ${
                          item.isPrimary 
                            ? (isSelected ? 'bg-amber-400 text-slate-950' : 'bg-amber-100 text-amber-900')
                            : (isSelected ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700')
                        }`}>
                          {item.isPrimary ? '👑 ' : ''}{item.rankLabel}
                        </span>
                        {item.score ? (
                          <span className={`text-xs font-black ${isSelected ? 'text-indigo-300' : 'text-indigo-600'}`}>
                            {item.score}점
                          </span>
                        ) : null}
                      </div>

                      <div>
                        <h4 className={`text-base font-black tracking-tight ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                          {titleName}
                        </h4>
                        <p className={`text-xs mt-1 line-clamp-1 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                          {CARE_TYPE_STRESS_ADVICE[item.type]?.subtitle || '신경계 맞춤 케어'}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2) 과목 선택기 */}
            <div className="pt-4 border-t border-slate-100">
              <label className="text-xs font-black tracking-wider text-slate-500 uppercase flex items-center gap-1.5 mb-3">
                <span className="text-base">📚</span> 공부 / 시험 영역 선택
              </label>
              <div className="grid grid-cols-5 gap-2">
                {Object.entries(SUBJECT_LABELS).map(([key, item]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedSubject(key)}
                    className={`p-2.5 sm:p-3 rounded-2xl text-center transition-all flex flex-col items-center justify-center gap-1 ${
                      selectedSubject === key 
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-black ring-2 ring-indigo-500 ring-offset-1' 
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold border border-slate-200'
                    }`}
                  >
                    <span className="text-lg sm:text-xl">{item.icon}</span>
                    <span className="text-xs sm:text-sm">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Physiological Overview Box */}
          {careAdvice && (
            <div className="bg-gradient-to-br from-indigo-50/80 via-white to-blue-50/50 p-6 rounded-3xl border border-indigo-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-extrabold">
                  <span>🧬</span> {activeDiagnosedItem?.rankLabel || '진단'} 생리적 신경 메커니즘
                </div>
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  {careAdvice.title} <span className="text-sm font-semibold text-indigo-600">({careAdvice.subtitle})</span>
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
                  {careAdvice.physioSummary}
                </p>
              </div>
              <button 
                onClick={() => setActiveTab('sos')}
                className="shrink-0 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all"
              >
                <span>🚨</span> 불안 심할 때 긴급 모드 ➔
              </button>
            </div>
          )}

          {/* Combined Synergy Alert */}
          {combinedAdvice.length > 0 && (
            <div className="bg-amber-50/80 border border-amber-200/80 p-5 rounded-3xl shadow-sm">
              <h4 className="text-sm font-black text-amber-900 mb-2 flex items-center gap-2">
                <span>🎯</span> [{careAdvice?.title}] × [{SUBJECT_LABELS[selectedSubject]?.label}] 결합 특별 솔루션
              </h4>
              <ul className="space-y-2">
                {combinedAdvice.map((adviceText, idx) => (
                  <li key={idx} className="text-sm font-medium text-amber-950 flex items-start gap-2.5 leading-relaxed">
                    <span className="text-amber-500 font-bold mt-0.5">•</span>
                    <span>{adviceText}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 4-Stage Timeline Grid */}
          {subjectPhaseData && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                  <span>⏱️</span> {subjectPhaseData.subjectName} 4단계 실전 타임라인 액션
                </h3>
                <span className="text-xs font-bold text-slate-400">행동 요령을 클릭하여 숙지하세요</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Stage 1: 착석 직후 */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-700 text-xs font-black">STEP 1</span>
                      <span className="text-2xl group-hover:scale-110 transition-transform">🧘‍♂️</span>
                    </div>
                    <h4 className="font-black text-slate-800 text-base mb-1">{subjectPhaseData.phases.beforeStudy.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed mb-4">{subjectPhaseData.phases.beforeStudy.desc}</p>
                  </div>
                  <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-100 text-xs font-bold text-blue-900">
                    <span className="text-blue-600 block text-[11px] font-black uppercase mb-0.5">Key Point</span>
                    {subjectPhaseData.phases.beforeStudy.keyPoint}
                  </div>
                </div>

                {/* Stage 2: 문제 풀이 중 */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-1 rounded-lg bg-purple-100 text-purple-700 text-xs font-black">STEP 2</span>
                      <span className="text-2xl group-hover:scale-110 transition-transform">⚡</span>
                    </div>
                    <h4 className="font-black text-slate-800 text-base mb-1">{subjectPhaseData.phases.duringSolving.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed mb-4">{subjectPhaseData.phases.duringSolving.desc}</p>
                  </div>
                  <div className="p-3 bg-purple-50/70 rounded-2xl border border-purple-100 text-xs font-bold text-purple-900">
                    <span className="text-purple-600 block text-[11px] font-black uppercase mb-0.5">Key Point</span>
                    {subjectPhaseData.phases.duringSolving.keyPoint}
                  </div>
                </div>

                {/* Stage 3: 쉬는 시간 */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-black">STEP 3</span>
                      <span className="text-2xl group-hover:scale-110 transition-transform">🍵</span>
                    </div>
                    <h4 className="font-black text-slate-800 text-base mb-1">{subjectPhaseData.phases.breakTime.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed mb-4">{subjectPhaseData.phases.breakTime.desc}</p>
                  </div>
                  <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-100 text-xs font-bold text-emerald-900">
                    <span className="text-emerald-600 block text-[11px] font-black uppercase mb-0.5">Key Point</span>
                    {subjectPhaseData.phases.breakTime.keyPoint}
                  </div>
                </div>

                {/* Stage 4: 시험 당일 */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-700 text-xs font-black">STEP 4</span>
                      <span className="text-2xl group-hover:scale-110 transition-transform">🎯</span>
                    </div>
                    <h4 className="font-black text-slate-800 text-base mb-1">{subjectPhaseData.phases.examDay.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed mb-4">{subjectPhaseData.phases.examDay.desc}</p>
                  </div>
                  <div className="p-3 bg-rose-50/70 rounded-2xl border border-rose-100 text-xs font-bold text-rose-900">
                    <span className="text-rose-600 block text-[11px] font-black uppercase mb-0.5">Key Point</span>
                    {subjectPhaseData.phases.examDay.keyPoint}
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: 🚨 SOS 긴급 안심 룸 (호흡/그라운딩/원포인트) */}
      {/* ========================================================================= */}
      {activeTab === 'sos' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* Top Quick Emergency Selector */}
          <div className="bg-rose-50/80 p-5 sm:p-6 rounded-3xl border border-rose-200 shadow-sm">
            <h3 className="text-sm font-black text-rose-900 uppercase tracking-wide mb-3 flex items-center gap-2">
              <span className="text-lg">🚨</span> 지금 겪고 있는 긴급 상황을 선택하세요
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {Object.entries(SOS_SITUATIONS).map(([key, item]) => (
                <button
                  key={key}
                  onClick={() => setSelectedSOS(key)}
                  className={`p-3.5 rounded-2xl text-left font-bold text-sm transition-all flex items-start gap-3 ${
                    selectedSOS === key
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20 ring-2 ring-rose-500'
                      : 'bg-white text-rose-950 hover:bg-rose-100/70 border border-rose-200'
                  }`}
                >
                  <span className={`px-2 py-0.5 rounded-md text-[11px] font-black shrink-0 mt-0.5 ${
                    selectedSOS === key ? 'bg-rose-700 text-white' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {item.badge}
                  </span>
                  <span className="line-clamp-2 leading-snug">{item.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Emergency Protocol Card */}
          {sosAdvice && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-rose-200 shadow-md">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-lg text-xs font-black">1분 응급 처치 프로토콜</span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">{sosAdvice.title}</h2>
                </div>
                <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-200 max-w-md">
                  <span className="text-xs font-black text-rose-700 block mb-1">⚡ 즉시 실천 행동 (1-Minute Action)</span>
                  <p className="text-xs sm:text-sm font-bold text-rose-950 leading-relaxed">{sosAdvice.oneMinuteAction}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
                
                {/* Left: Advice List */}
                <div className="space-y-4">
                  <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
                    <span>💡</span> 멘탈 진정 핵심 지침
                  </h4>
                  <div className="space-y-3">
                    {sosAdvice.advice.map((item, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="text-sm text-slate-700 font-medium leading-relaxed">{item}</p>
                      </div>
                    ))}
                  </div>

                  {/* Grounding Exercise Mini Banner */}
                  <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-200">
                    <span className="text-xs font-black text-indigo-700 block mb-1">🧘 오감 그라운딩 (Grounding) 팁</span>
                    <p className="text-xs sm:text-sm text-indigo-950 font-medium">{sosAdvice.groundingExercise}</p>
                  </div>
                </div>

                {/* Right: Interactive CareType 맞춤 호흡 트레이너 */}
                <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl flex flex-col items-center justify-center">
                  <div className="w-full flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{activeBreath.emoji}</span>
                      <h4 className="font-black text-sm text-slate-200">{activeBreath.name}</h4>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-bold">자율신경 안정</span>
                  </div>
                  <p className="w-full text-[11px] text-slate-400 mb-3 leading-relaxed">{activeBreath.oneLiner} · 약 {activeBreath.estMinutes}분</p>
                  <div className="w-full flex flex-wrap gap-1.5 mb-4">
                    {allBreathOptions.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setBreathProtocolId(p.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                          activeBreath.id === p.id
                            ? 'bg-indigo-600 text-white border-indigo-500'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500'
                        }`}
                      >
                        {p.emoji} {p.name.split(' (')[0]}
                      </button>
                    ))}
                  </div>

                  <BreathingCore
                    key={activeBreath.id}
                    pattern={activeBreath.pattern}
                  />
                  {activeBreath.holdCaution && (
                    <p className="w-full mt-3 text-[10px] text-amber-300/90 leading-relaxed">
                      ⚠️ 숨 참기 포함: 어지러우면 바로 멈추세요. 임신 중·심혈관/호흡기 질환 시 무리 금지.
                    </p>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* 5-4-3-2-1 Grounding Technique Interactive Widget */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <span>🖐️</span> 5-4-3-2-1 감각 앵커링 (Grounding) 인터랙티브
                </h3>
                <p className="text-xs text-slate-500">패닉이나 극심한 잡념이 몰려올 때 현실의 오감에 주의를 고정하는 심리학 기법입니다.</p>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-600 rounded-full">
                단계: {groundingStep + 1} / 5
              </span>
            </div>

            <div className="p-6 bg-gradient-to-r from-slate-50 to-indigo-50/40 rounded-3xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-3xl font-black shadow-lg shadow-indigo-600/30 shrink-0">
                  {groundingSteps[groundingStep].icon}
                </div>
                <div>
                  <span className="text-xs font-black text-indigo-600 uppercase tracking-wider">Step {groundingSteps[groundingStep].step}</span>
                  <h4 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">{groundingSteps[groundingStep].label}</h4>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">{groundingSteps[groundingStep].desc}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
                <button
                  disabled={groundingStep === 0}
                  onClick={() => setGroundingStep(prev => Math.max(0, prev - 1))}
                  className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 bg-white hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none"
                >
                  이전
                </button>
                <button
                  onClick={() => setGroundingStep(prev => (prev + 1) % 5)}
                  className="flex-1 md:flex-initial px-6 py-2.5 rounded-xl font-black text-xs text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20"
                >
                  {groundingStep === 4 ? '처음부터 다시' : '다음 감각 확인 ➔'}
                </button>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: 📋 멘탈 처방전 & 데일리 플래너 (인쇄 최적화) */}
      {/* ========================================================================= */}
      {activeTab === 'prescription' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 no-print">
            <div>
              <h3 className="text-lg font-black text-slate-900">🖨️ 수험생 맞춤 멘탈 처방전 (Print Preview)</h3>
              <p className="text-xs text-slate-500">책상이나 플래너에 부착하여 매일 실천할 수 있는 1-Page 프리미엄 처방전입니다.</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={handlePrint}
                className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-2xl shadow-lg transition-all flex items-center gap-2 text-sm"
              >
                <span>🖨️</span> 바로 인쇄하기
              </button>
            </div>
          </div>

          {/* Printable Prescription Card */}
          <div id="prescription-area" className="bg-white p-8 sm:p-12 rounded-3xl border-2 border-slate-300 shadow-xl space-y-8 max-w-4xl mx-auto">
            
            {/* Header Header */}
            <div className="border-b-2 border-slate-900 pb-6 text-center">
              <div className="inline-block px-3 py-1 bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest rounded-md mb-2">
                OFFICIAL MENTAL HEALTH PRESCRIPTION
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
                수능 맞춤 멘탈 케어 처방전
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-bold mt-1">
                신경생리학적 진단 기반 수험생 자율신경 최적화 루틴
              </p>

              {/* Student Metadata Table */}
              <div className="grid grid-cols-3 gap-2 mt-6 text-left text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200 font-bold">
                <div>
                  <span className="text-slate-400 block text-[10px]">수험생 성명</span>
                  <span className="text-slate-900 text-sm font-black">{student?.name || '수험생'} 학생</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">처방 일자</span>
                  <span className="text-slate-900 text-sm">{new Date().toLocaleDateString('ko-KR')}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">핵심 주 진단 (1순위)</span>
                  <span className="text-indigo-600 text-sm font-black">
                    {diagnosedTypes[0] ? (CARE_TYPE_LABELS[diagnosedTypes[0].type as CareType]?.name || diagnosedTypes[0].type) : '일반 케어'}
                  </span>
                </div>
              </div>

              {/* Secondary Diagnosed Types Pills (동반 위험군 요약) */}
              {diagnosedTypes.length > 1 && (
                <div className="mt-3 flex items-center justify-center gap-2 text-xs">
                  <span className="text-slate-500 font-bold">동반 관리 지표:</span>
                  {diagnosedTypes.slice(1).map(d => (
                    <span key={d.type} className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-black">
                      {d.rankLabel}: {CARE_TYPE_LABELS[d.type as CareType]?.name || d.type}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Section 1: 신경계 진단 상태 및 처방 가이드 */}
            {careAdvice && (
              <div className="space-y-3">
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span> 1. 신경계 상태 진단 및 핵심 솔루션
                </h4>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <p className="text-xs text-slate-700 font-bold mb-3 leading-relaxed">
                    💡 <strong className="text-slate-900">{careAdvice.title}:</strong> {careAdvice.physioSummary}
                  </p>
                  <ul className="space-y-2">
                    {careAdvice.advice.map((text, idx) => (
                      <li key={idx} className="text-xs text-slate-700 flex items-start gap-2 leading-relaxed">
                        <span className="text-indigo-600 font-black">✓</span>
                        <span>{text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Section 2: 과목별 실전 멘탈 전술 */}
            {subjectPhaseData && (
              <div className="space-y-3">
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> 2. [{subjectPhaseData.subjectName}] 실전 멘탈 전술
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="font-black text-blue-700 block mb-1">📌 문제 풀이 전 (워밍업)</span>
                    <p className="text-slate-600">{subjectPhaseData.phases.beforeStudy.keyPoint}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="font-black text-purple-700 block mb-1">⚡ 킬러/난문 막힐 때 (위기 탈출)</span>
                    <p className="text-slate-600">{subjectPhaseData.phases.duringSolving.keyPoint}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="font-black text-emerald-700 block mb-1">🍵 쉬는 시간 (뇌 피로 리셋)</span>
                    <p className="text-slate-600">{subjectPhaseData.phases.breakTime.keyPoint}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="font-black text-rose-700 block mb-1">🎯 시험 당일 (마인드셋)</span>
                    <p className="text-slate-600">{subjectPhaseData.phases.examDay.keyPoint}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Section 3: 오늘의 3대 실천 루틴 (체크박스) */}
            {careAdvice && (
              <div className="space-y-3">
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> 3. 오늘 반드시 실천할 3대 데일리 멘탈 루틴
                </h4>
                <div className="space-y-2">
                  {careAdvice.recommendedRoutines.map((routine, idx) => {
                    const routineId = `${selectedCareType}-${idx}`;
                    const isChecked = !!completedRoutines[routineId];
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleRoutine(routineId)}
                        className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                          isChecked 
                            ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-bold' 
                            : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3 text-xs sm:text-sm">
                          <div className={`w-5 h-5 rounded-lg border flex items-center justify-center text-xs font-black transition-all ${
                            isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                          }`}>
                            {isChecked ? '✓' : ''}
                          </div>
                          <span className={isChecked ? 'line-through opacity-70' : ''}>{routine}</span>
                        </div>
                        <span className="text-[11px] font-bold text-slate-400">루틴 {idx + 1}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Footer Seal */}
            <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-400 font-bold">
              <span>수험생 스트레스 케어 랩 • SN멘탈케어</span>
              <span>“불안은 성장의 신호이며, 준비된 당신은 이미 강합니다.”</span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
