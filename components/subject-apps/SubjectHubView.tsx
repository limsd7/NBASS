import React, { useState } from 'react';
import { StudentInfo, AIModelConfig } from '../../types';
import { KoreanClinicApp } from './KoreanClinicApp';
import { MathClinicApp } from './MathClinicApp';
import { EnglishClinicApp } from './EnglishClinicApp';

interface SubjectHubViewProps {
  student: StudentInfo;
  aiConfig?: AIModelConfig | null;
  onBack?: () => void;
  initialSubject?: string;
  initialStrategyTag?: string;
  initialStrategyType?: 'grade_strategy' | 'cognitive_tip';
  currentGrade?: number;
  targetGrade?: number;
}

export const SubjectHubView: React.FC<SubjectHubViewProps> = ({
  student,
  aiConfig,
  onBack,
  initialSubject = 'korean',
  initialStrategyTag,
  initialStrategyType,
  currentGrade = 2,
  targetGrade = 1
}) => {
  // 소메뉴 상태: 'korean' | 'math' | 'english' | null (전체 허브)
  const [selectedSubject, setSelectedSubject] = useState<string | null>(initialSubject || 'korean');

  React.useEffect(() => {
    if (initialSubject) {
      setSelectedSubject(initialSubject);
    }
  }, [initialSubject]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-text">
      {/* ========================================================
          1. 과목클리닉 대메뉴 및 소메뉴 (국어 / 수학 / 영어) 내비게이션 바
          ======================================================== */}
      <div className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 relative z-20">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          <div className="flex items-center gap-1.5 shrink-0 pr-2 border-r border-slate-800 mr-1">
            <span className="text-base">🏛️</span>
            <span className="text-xs sm:text-sm font-black text-white tracking-tight">과목클리닉</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase hidden md:inline">Studio</span>
          </div>

          {/* 소메뉴 1: 국어 (가동 중) */}
          <button
            onClick={() => setSelectedSubject('korean')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedSubject === 'korean'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-1 ring-blue-400'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span>📘</span>
            <span>국어</span>
            <span className={`text-[9.5px] px-1.5 py-0.2 rounded-full font-bold ${
              selectedSubject === 'korean'
                ? 'bg-white/20 text-white'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}>
              가동 중
            </span>
          </button>

          {/* 소메뉴 2: 수학 (가동 중) */}
          <button
            onClick={() => setSelectedSubject('math')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedSubject === 'math'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/25 ring-1 ring-purple-400'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span>📐</span>
            <span>수학</span>
            <span className={`text-[9.5px] px-1.5 py-0.2 rounded-full font-bold ${
              selectedSubject === 'math'
                ? 'bg-white/20 text-white'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}>
              가동 중
            </span>
          </button>

          {/* 소메뉴 3: 영어 (가동 중) */}
          <button
            onClick={() => setSelectedSubject('english')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedSubject === 'english'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-500/25 ring-1 ring-amber-400'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span>🌍</span>
            <span>영어</span>
            <span className={`text-[9.5px] px-1.5 py-0.2 rounded-full font-bold ${
              selectedSubject === 'english'
                ? 'bg-white/20 text-white'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}>
              가동 중
            </span>
          </button>

          {/* 전체 허브 보기 */}
          <button
            onClick={() => setSelectedSubject(null)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
              selectedSubject === null
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <span>전체 보기</span>
          </button>
        </div>

        {onBack && (
          <button
            onClick={onBack}
            className="text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 transition-colors shrink-0 font-medium cursor-pointer"
          >
            ← 성적 관리로 복귀
          </button>
        )}
      </div>

      {/* ========================================================
          2. 국어 소메뉴 활성화: 수능 국어 AI 실전 클리닉 전체 탑재
          ======================================================== */}
      {selectedSubject === 'korean' && (
        <div className="flex-1">
          <KoreanClinicApp
            student={student}
            aiConfig={aiConfig}
            initialStrategyTag={initialStrategyTag}
            initialStrategyType={initialStrategyType}
            currentGrade={currentGrade}
            targetGrade={targetGrade}
            onClose={() => setSelectedSubject(null)}
            isStandalone={false}
          />
        </div>
      )}

      {/* ========================================================
          3. 수학 소메뉴 활성화: 수능 수학 AI 준킬러 실전 클리닉 전체 탑재
          ======================================================== */}
      {selectedSubject === 'math' && (
        <div className="flex-1">
          <MathClinicApp
            student={student}
            aiConfig={aiConfig}
            initialStrategyTag={initialStrategyTag}
            initialStrategyType={initialStrategyType}
            currentGrade={currentGrade}
            targetGrade={targetGrade}
            onClose={() => setSelectedSubject(null)}
            isStandalone={false}
          />
        </div>
      )}

      {/* ========================================================
          4. 영어 소메뉴 활성화: 영어 AI 클리닉 스튜디오
          ======================================================== */}
      {selectedSubject === 'english' && (
        <div className="flex-1 animate-in fade-in duration-200">
          <EnglishClinicApp
            student={student}
            aiConfig={aiConfig}
            initialStrategyTag={initialStrategyTag || '빈칸 추론(31~34번) 논리 전개도 & 재진술(Paraphrasing) 훈련'}
            initialStrategyType={initialStrategyType || 'grade_strategy'}
            currentGrade={currentGrade}
            targetGrade={targetGrade}
            onClose={() => setSelectedSubject(null)}
            isStandalone={false}
          />
        </div>
      )}

      {/* ========================================================
          5. 전체 과목 카드 그리드 (selectedSubject === null)
          ======================================================== */}
      {selectedSubject === null && (
        <div className="flex-1 p-6 sm:p-10 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-200">
          <div className="pb-4 border-b border-slate-800">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              과목별 AI 클리닉 전체 센터
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              수능 등급 도약을 위해 원하는 과목의 전용 AI 클리닉 앱을 선택하여 훈련을 시작하세요.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 국어 카드 */}
            <div className="bg-slate-900 border border-blue-500/50 rounded-3xl p-6 flex flex-col justify-between shadow-xl shadow-blue-500/10 hover:border-blue-400 transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl p-3 bg-slate-800 rounded-2xl border border-slate-700">📘</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                    가동 중
                  </span>
                </div>
                <h2 className="text-lg font-black text-white mb-2">국어 AI 클리닉</h2>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  문단별 핵심 명제 연결 훈련, 평가원 5대 미세 함정 선지 판별, 30초 블라인드 리콜 인지 메모 훈련.
                </p>
              </div>
              <button
                onClick={() => setSelectedSubject('korean')}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-blue-600/30"
              >
                국어 클리닉 실행 ➔
              </button>
            </div>

            {/* 수학 카드 */}
            <div className="bg-slate-900 border border-purple-500/50 rounded-3xl p-6 flex flex-col justify-between shadow-xl shadow-purple-500/10 hover:border-purple-400 transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl p-3 bg-slate-800 rounded-2xl border border-slate-700">📐</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                    가동 중
                  </span>
                </div>
                <h2 className="text-lg font-black text-white mb-2">수학 AI 클리닉</h2>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  4점 준킬러(9~14, 20~21) 발문 조건 분해 드릴, 세로 2단 줄맞춤 계산 실수 방지 루틴, 5대 함정 DNA 분석.
                </p>
              </div>
              <button
                onClick={() => setSelectedSubject('math')}
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-purple-600/30 cursor-pointer"
              >
                수학 클리닉 실행 ➔
              </button>
            </div>

            {/* 영어 카드 */}
            <div className="bg-slate-900 border border-amber-500/50 rounded-3xl p-6 flex flex-col justify-between shadow-xl shadow-amber-500/10 hover:border-amber-400 transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl p-3 bg-slate-800 rounded-2xl border border-slate-700">🌍</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                    가동 중
                  </span>
                </div>
                <h2 className="text-lg font-black text-white mb-2">영어 AI 클리닉</h2>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  빈칸 추론(31~34번) 재진술(Paraphrasing) 훈련, 순서·삽입 지시어 단서 스캐너, 5대 매력적 오답 함정 DNA 분석.
                </p>
              </div>
              <button
                onClick={() => setSelectedSubject('english')}
                className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-amber-600/30 cursor-pointer"
              >
                영어 클리닉 실행 ➔
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectHubView;
