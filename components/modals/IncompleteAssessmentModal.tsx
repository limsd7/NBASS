import React from 'react';

interface IncompleteAssessmentModalProps {
  isOpen: boolean;
  currentStep: string;
  studentName?: string;
  onContinue: () => void;
  onLeave: () => void;
}

export const IncompleteAssessmentModal: React.FC<IncompleteAssessmentModalProps> = ({
  isOpen,
  currentStep,
  studentName,
  onContinue,
  onLeave
}) => {
  if (!isOpen) return null;

  const stepNameMap: Record<string, string> = {
    register: '수험생 기본 정보 입력',
    survey: '자율신경 & 심리 설문 진단 (BAI/ISI/부신피로)',
    studyEfficiency: '학습 효율성 & 취약 과목 진단',
    cognitive: '인지 작업기억 (N-Back) 테스트',
    hrv: '자율신경계(교감·부교감) 평가',
    eeg: '인지 활성도 평가',
    protocol: '학습 환경 & 골든타임 프로토콜'
  };

  const currentStepName = stepNameMap[currentStep] || '정밀 진단 검사';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border-2 border-amber-500/50 rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl shadow-amber-500/10 text-center relative overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Warning Icon Badge */}
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/20">
          ⚠️
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold mb-3">
          <span>👦</span>
          <span>수험생 검사 진행 중단 주의</span>
        </div>

        <h3 className="text-xl font-black text-white mb-2 tracking-tight">
          검사가 아직 완료되지 않았습니다!
        </h3>

        <p className="text-xs text-slate-300 mb-6 leading-relaxed">
          {studentName ? <strong className="text-indigo-300">{studentName} 학생</strong> : '학생'}님의 
          정밀 자율신경 및 신경인지 학습 진단이 진행 중입니다.
        </p>

        {/* Current Step Status Pill */}
        <div className="p-4 bg-slate-950/90 rounded-2xl border border-slate-800 text-left mb-6 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">현재 진행 중인 단계</span>
            <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded font-bold text-[11px] animate-pulse">
              미완료 상태
            </span>
          </div>
          <div className="text-sm font-extrabold text-white flex items-center gap-2">
            <span>📍</span>
            <span>{currentStepName}</span>
          </div>
          <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80 leading-normal">
            지금 검사를 중단하고 이동하시면, 최종 맞춤형 인지 분석 리포트 및 AI 솔루션이 발급되지 않습니다.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={onContinue}
            autoFocus
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm rounded-xl shadow-lg shadow-indigo-900/40 transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2"
          >
            <span>🚀</span> 이어서 계속 검사하기
          </button>
          
          <button
            onClick={onLeave}
            className="w-full py-2.5 bg-slate-800/80 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 hover:border-rose-500/30 border border-slate-700/60 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>🚪</span>
            <span>검사 중단하고 나가기</span>
            <span className="text-[11px] text-slate-400 font-normal">(이전 검사결과로 이동)</span>
          </button>
        </div>

      </div>
    </div>
  );
};
