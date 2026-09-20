import React from 'react';
import { RoutineInput } from '../types';
import { RoutineInputView } from './RoutineInput';
import { Sparkles, X, Lightbulb, CheckCircle2 } from 'lucide-react';

interface ScheduleSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  routine: RoutineInput;
  onSaveRoutine: (newRoutine: RoutineInput) => void;
  onGenerate: () => void;
  studentName?: string;
  isFirstTime?: boolean;
}

export const ScheduleSetupModal: React.FC<ScheduleSetupModalProps> = ({
  isOpen,
  onClose,
  routine,
  onSaveRoutine,
  onGenerate,
  studentName = '수험생',
  isFirstTime = false
}) => {
  if (!isOpen) return null;

  const handleFinishAndGenerate = () => {
    onGenerate();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white flex items-start justify-between gap-4 border-b border-white/10 shrink-0">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 text-xs font-black flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                {isFirstTime ? '스마트 온보딩 가이드' : '일과 & 학원 스케줄 설정'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-bold">
                {studentName} 학생 맞춤
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {isFirstTime ? '🚀 요일별 & 학원 맞춤 일과 설정' : '⚙️ 요일별 일과 & 학원 일정 수정'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              등하교 및 학원 일정을 설정하면, AI가 비어있는 <strong>최적의 뇌파 골든타임</strong>에 맞춤 자습·뽀모도로 루틴을 자동 편성합니다.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-2xl transition-colors cursor-pointer shrink-0"
            title="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Tip Banner */}
        <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200/60 dark:border-amber-900/40 px-6 py-2.5 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 text-xs text-amber-900 dark:text-amber-200 font-medium">
            <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>💡 10초 퀵 완성 팁:</strong> 월요일 등하교 및 학원 시간을 입력한 후 <strong>[월요일 → 평일 일괄복사]</strong>를 누르면 평일 일과가 즉시 완성됩니다!
            </span>
          </div>
        </div>

        {/* Modal Scrollable Body: RoutineInputView Embedded */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-900/50">
          <RoutineInputView
            routine={routine}
            onSaveRoutine={onSaveRoutine}
            onGenerate={handleFinishAndGenerate}
          />
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>설정된 일과는 브라우저에 안전하게 자동 저장됩니다.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {isFirstTime && (
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                기본 템플릿으로 먼저 보기 (스킵)
              </button>
            )}
            <button
              type="button"
              onClick={handleFinishAndGenerate}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>✨ 내 맞춤 AI 시간표 생성 &amp; 적용</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
