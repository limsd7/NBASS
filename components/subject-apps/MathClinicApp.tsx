import React from 'react';
import { StudentInfo, AIModelConfig } from '../../types';
import { useMathClinic } from './math/useMathClinic';
import { MathClinicDrillTab } from './math/MathClinicDrillTab';
import { MathClinicCognitiveTab } from './math/MathClinicCognitiveTab';
import { MathClinicBankTab } from './math/MathClinicBankTab';
import { MathClinicTrapDnaTab } from './math/MathClinicTrapDnaTab';
import { MathClinicPrintArea } from './math/MathClinicPrintArea';

interface MathClinicAppProps {
  student: StudentInfo;
  aiConfig?: AIModelConfig | null;
  initialStrategyTag?: string;
  initialStrategyType?: 'grade_strategy' | 'cognitive_tip';
  currentGrade?: number;
  targetGrade?: number;
  onClose?: () => void;
  isStandalone?: boolean; // 새 창(window.open)으로 열렸는지 여부
}

export const MathClinicApp: React.FC<MathClinicAppProps> = ({
  student,
  aiConfig,
  initialStrategyTag = '준킬러(9~14번, 20~21번) 다빈출 유형 테마별 완전 정복 & 발문 조건 분해',
  initialStrategyType = 'grade_strategy',
  currentGrade = 3,
  targetGrade = 1,
  onClose,
  isStandalone = false
}) => {
  const controller = useMathClinic(
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
    handlePrintExam,
    loadOrCreateCognitiveDrill,
    refreshBankList,
    refreshTrapDna
  } = controller;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans select-text">
      {/* 1. 상단 앱 헤더 */}
      <header className={`bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4 ${isStandalone ? 'sticky top-0 z-50' : 'relative z-10'}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-xl shadow-lg shadow-purple-500/20">
            📐
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-white tracking-tight">수능 수학 AI 준킬러 실전 클리닉</h1>
              <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Gemini 3.8 Flash
              </span>
              {isStandalone && (
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  독립 실행 창
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              학생: <strong className="text-slate-200">{student.name}</strong> | 현재 <span className="text-amber-400 font-bold">{currentGrade}등급</span> ➔ 수능 목표 <span className="text-emerald-400 font-bold">{targetGrade}등급</span> 4점 준킬러 집중 돌파
            </p>
          </div>
        </div>

        {/* 우측 퀵 액션 */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrintExam}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-700 transition-all shadow-sm cursor-pointer"
          >
            <span>🖨️</span>
            <span>A4 수학 클리닉 시험지 인쇄</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-700 hover:border-rose-700/50 transition-all cursor-pointer"
            >
              창 닫기 ✕
            </button>
          )}
        </div>
      </header>

      {/* 2. 서브 내비게이션 탭 */}
      <nav className="bg-slate-950/40 border-b border-slate-800/80 px-6 py-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('drill')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${activeTab === 'drill'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 ring-1 ring-purple-400'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
        >
          <span>🎯</span>
          <span>1분 준킬러 실전 드릴</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('cognitive');
            if (!cognitiveDrill) loadOrCreateCognitiveDrill();
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${activeTab === 'cognitive'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
        >
          <span>🧠</span>
          <span>30초 인지 계산·줄맞춤 훈련</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('bank');
            refreshBankList();
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${activeTab === 'bank'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-400'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
        >
          <span>📚</span>
          <span>수학 AI 문제은행 저장소</span>
          {bankList.length > 0 && (
            <span className="bg-slate-800 text-purple-300 text-[10px] px-2 py-0.5 rounded-full font-bold">
              {bankList.length}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            setActiveTab('trapDna');
            refreshTrapDna();
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${activeTab === 'trapDna'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 ring-1 ring-rose-400'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
        >
          <span>🧬</span>
          <span>내 계산 실수 & 함정 DNA</span>
        </button>
      </nav>

      {/* 3. 메인 콘텐츠 뷰 */}
      <main className="flex-1 p-4 sm:p-8 max-w-6xl w-full mx-auto">
        {/* ==================== TAB 1: 1분 준킬러 실전 드릴 ==================== */}
        {activeTab === 'drill' && <MathClinicDrillTab controller={controller} />}

        {/* ==================== TAB 2: 30초 인지 계산 & 줄맞춤 훈련 ==================== */}
        {activeTab === 'cognitive' && <MathClinicCognitiveTab controller={controller} />}

        {/* ==================== TAB 3: 수학 AI 문제은행 저장소 ==================== */}
        {activeTab === 'bank' && <MathClinicBankTab controller={controller} />}

        {/* ==================== TAB 4: 내 계산 실수 & 함정 DNA ==================== */}
        {activeTab === 'trapDna' && <MathClinicTrapDnaTab controller={controller} />}
      </main>

      {/* ==================== A4 인쇄 전용 영역 (화면에서는 숨김) ==================== */}
      <MathClinicPrintArea controller={controller} />
    </div>
  );
};

export default MathClinicApp;
