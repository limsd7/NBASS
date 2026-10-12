import React from 'react';
import { StudentInfo, AIModelConfig } from '../../types';
import { useEnglishClinic } from './english/useEnglishClinic';
import { EnglishClinicPrintView } from './english/EnglishClinicPrintView';
import { EnglishClinicDrillTab } from './english/EnglishClinicDrillTab';
import { EnglishClinicCognitiveTab } from './english/EnglishClinicCognitiveTab';
import { EnglishClinicBankTab } from './english/EnglishClinicBankTab';
import { EnglishClinicTrapDnaTab } from './english/EnglishClinicTrapDnaTab';

interface EnglishClinicAppProps {
  student: StudentInfo;
  aiConfig?: AIModelConfig | null;
  initialStrategyTag?: string;
  initialStrategyType?: 'grade_strategy' | 'cognitive_tip';
  currentGrade?: number;
  targetGrade?: number;
  onClose?: () => void;
  isStandalone?: boolean; // 새 창(window.open)으로 열렸는지 여부
}

export const EnglishClinicApp: React.FC<EnglishClinicAppProps> = ({
  student,
  aiConfig,
  initialStrategyTag = '빈칸 추론(31~34번) 논리 전개도 & 재진술(Paraphrasing) 훈련',
  initialStrategyType = 'grade_strategy',
  currentGrade = 2,
  targetGrade = 1,
  onClose,
  isStandalone = false
}) => {
  const controller = useEnglishClinic(
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
    isPrinting,
    currentDrill,
    loadOrCreateCognitiveDrill,
    handleTriggerPrint
  } = controller;

  // ==========================================
  // A4 단면 인쇄 모드 렌더링
  // ==========================================
  if (isPrinting && currentDrill) {
    return <EnglishClinicPrintView controller={controller} />;
  }

  // ==========================================
  // 일반 스튜디오 대시보드 렌더링
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* 1. 최상단 헤더 바 */}
      <header className={`bg-slate-900/90 border-b border-slate-800 px-4 sm:px-6 py-3.5 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 shadow-lg ${isStandalone ? 'sticky top-0 z-50' : 'relative z-10'}`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-white font-black text-lg shadow-md shadow-amber-600/30">
            🌍
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-white tracking-tight">
                수능 영어 AI 킬러 실전 클리닉
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Gemini 3.8 Flash
              </span>
              {isStandalone && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  독립 실행 창
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              학생: <strong className="text-slate-200">{student.name}</strong> | 현재 <span className="text-amber-400 font-bold">{currentGrade}등급</span> ➔ 수능 목표 <span className="text-emerald-400 font-bold">{targetGrade}등급</span> 킬러(31~39번) 집중 공략
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleTriggerPrint}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="A4 클리닉 시험지 인쇄"
          >
            <span>🖨️</span>
            <span className="hidden sm:inline">A4 영어 클리닉 시험지 인쇄</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-800 hover:bg-rose-900/50 hover:text-rose-300 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
            >
              창 닫기 ✕
            </button>
          )}
        </div>
      </header>

      {/* 2. 메인 탭 내비게이션 */}
      <nav className="bg-slate-900/60 border-b border-slate-800/80 px-4 sm:px-6 py-2 flex items-center gap-2 overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setActiveTab('drill')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${activeTab === 'drill'
              ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-amber-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
        >
          <span>🎯</span>
          <span>1분 킬러 실전 드릴</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('cognitive');
            if (!cognitiveDrill) loadOrCreateCognitiveDrill();
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${activeTab === 'cognitive'
              ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-amber-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
        >
          <span>🧠</span>
          <span>30초 인지 시그널 스캐너</span>
        </button>

        <button
          onClick={() => setActiveTab('bank')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${activeTab === 'bank'
              ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-amber-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
        >
          <span>📚</span>
          <span>영어 AI 문제은행 저장소</span>
          <span className="text-[10px] bg-slate-800 text-amber-300 px-1.5 py-0.2 rounded-full border border-slate-700">
            {bankList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('trapDna')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${activeTab === 'trapDna'
              ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-amber-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
        >
          <span>🧬</span>
          <span>내 매력적 오답 & 함정 DNA</span>
        </button>
      </nav>

      {/* 3. 본문 뷰 영역 */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
        {/* ========================================================
            TAB 1: 1분 킬러 실전 드릴
            ======================================================== */}
        {activeTab === 'drill' && <EnglishClinicDrillTab controller={controller} />}

        {/* ========================================================
            TAB 2: 30초 인지 시그널 스캐너
            ======================================================== */}
        {activeTab === 'cognitive' && <EnglishClinicCognitiveTab controller={controller} />}

        {/* ========================================================
            TAB 3: 영어 AI 문제은행 저장소
            ======================================================== */}
        {activeTab === 'bank' && <EnglishClinicBankTab controller={controller} />}

        {/* ========================================================
            TAB 4: 내 매력적 오답 & 함정 DNA
            ======================================================== */}
        {activeTab === 'trapDna' && <EnglishClinicTrapDnaTab controller={controller} />}
      </main>
    </div>
  );
};

export default EnglishClinicApp;
