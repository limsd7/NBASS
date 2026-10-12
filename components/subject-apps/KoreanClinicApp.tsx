import React from 'react';
import { StudentInfo, AIModelConfig } from '../../types';
import { useKoreanClinic } from './korean/useKoreanClinic';
import { KoreanClinicDrillTab } from './korean/KoreanClinicDrillTab';
import { KoreanClinicCognitiveTab } from './korean/KoreanClinicCognitiveTab';
import { KoreanClinicBankTab } from './korean/KoreanClinicBankTab';
import { KoreanClinicTrapDnaTab } from './korean/KoreanClinicTrapDnaTab';
import { KoreanClinicPrintSheet } from './korean/KoreanClinicPrintSheet';

interface KoreanClinicAppProps {
  student: StudentInfo;
  aiConfig?: AIModelConfig | null;
  initialStrategyTag?: string;
  initialStrategyType?: 'grade_strategy' | 'cognitive_tip';
  currentGrade?: number;
  targetGrade?: number;
  onClose?: () => void;
  isStandalone?: boolean; // 새 창(window.open)으로 열렸는지 여부
}

export const KoreanClinicApp: React.FC<KoreanClinicAppProps> = ({
  student,
  aiConfig,
  initialStrategyTag = '독서 고난도 문단별 핵심 명제 연결 & 문학 미세 선지 판별',
  initialStrategyType = 'grade_strategy',
  currentGrade = 2,
  targetGrade = 1,
  onClose,
  isStandalone = false
}) => {
  const controller = useKoreanClinic(
    student,
    aiConfig,
    initialStrategyTag,
    initialStrategyType,
    currentGrade,
    targetGrade
  );

  const {
    activeTab,
    setActiveTab,
    cognitiveDrill,
    bankList,
    trapDna,
    loadOrCreateCognitiveDrill,
    loadTrapDna,
    handlePrintExam
  } = controller;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans select-text">
      {/* 1. 상단 앱 헤더 */}
      <header className={`bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4 ${isStandalone ? 'sticky top-0 z-50' : 'relative z-10'}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-xl shadow-lg shadow-blue-500/20">
            📘
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-white tracking-tight">수능 국어 AI 실전 클리닉</h1>
              <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Gemini 3.8 Flash
              </span>
              {isStandalone && (
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  독립 실행 창
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              학생: <strong className="text-slate-200">{student.name}</strong> | 현재 <span className="text-amber-400 font-bold">{currentGrade}등급</span> ➔ 수능 목표 <span className="text-emerald-400 font-bold">{targetGrade}등급</span> 핀포인트 집중 공략
            </p>
          </div>
        </div>

        {/* 우측 퀵 액션 */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrintExam}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-700 transition-all shadow-sm"
          >
            <span>🖨️</span>
            <span>A4 클리닉 시험지 인쇄</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-700 hover:border-rose-700/50 transition-all"
            >
              창 닫기 ✕
            </button>
          )}
        </div>
      </header>

      {/* 2. 서브 내비게이션 탭 */}
      <nav className="bg-slate-950/40 border-b border-slate-800/80 px-6 py-2.5 flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('drill')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${activeTab === 'drill'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
        >
          <span>🎯</span>
          <span>1분 실전 문제</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('cognitive');
            if (!cognitiveDrill) loadOrCreateCognitiveDrill();
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${activeTab === 'cognitive'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
        >
          <span>🧠</span>
          <span>30초 인지 메모 훈련 (블라인드)</span>
        </button>

        <button
          onClick={() => setActiveTab('bank')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${activeTab === 'bank'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
        >
          <span>📚</span>
          <span>AI 문제은행 저장소 ({bankList.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('trapDna');
            loadTrapDna();
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${activeTab === 'trapDna'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
        >
          <span>🧬</span>
          <span>내 함정 DNA 분석</span>
          {trapDna && trapDna.mostVulnerableTrap && (
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
          )}
        </button>
      </nav>

      {/* 3. 메인 콘텐츠 영역 */}
      <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
        {/* ==================== TAB 1: 1분 실전 문제 ==================== */}
        {activeTab === 'drill' && <KoreanClinicDrillTab controller={controller} />}

        {/* ==================== TAB 2: 30초 인지 메모 훈련 (블라인드) ==================== */}
        {activeTab === 'cognitive' && <KoreanClinicCognitiveTab controller={controller} />}

        {/* ==================== TAB 3: 문제은행 저장소 ==================== */}
        {activeTab === 'bank' && <KoreanClinicBankTab controller={controller} />}

        {/* ==================== TAB 4: 내 함정 DNA 분석 ==================== */}
        {activeTab === 'trapDna' && <KoreanClinicTrapDnaTab controller={controller} />}
      </main>

      {/* 4. 인쇄 전용 숨김 영역 (A4 시험지 워크시트) */}
      <KoreanClinicPrintSheet controller={controller} />
    </div>
  );
};

export default KoreanClinicApp;
