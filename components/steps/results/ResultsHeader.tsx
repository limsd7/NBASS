import React from 'react';
import { AssessmentResult, CareType, StrategyMap } from '../../../types';
import { PortalWindow } from '../../common/PortalWindow';
import { PsychologicalAssessment } from '../../PsychologicalAssessment';
import { useState } from 'react';
import { PromptModal } from '../../modals/PromptModal';

interface ResultsHeaderProps {
  result: AssessmentResult;
  config: {
    isMedicalMode: boolean;
    isExamMode: boolean;
    usePortable: boolean;
    useBrainBody: boolean;
    expertModePassword?: string;
    currentExaminerId?: string | null;
    examiners?: import('../../../types').Examiner[];
  };
  onPrintWindow: () => void;
  onShowDataEditor: () => void;
  onShowStudyEfficiencyModal: () => void;
  onNewAssessment: () => void;
  showStudyEfficiencyModal: boolean;
  reportMode: 'expert' | 'student';
  setReportMode: (mode: 'expert' | 'student') => void;
  isAdminUnlocked?: boolean;
}

export const ResultsHeader: React.FC<ResultsHeaderProps> = ({
  result,
  config,
  onPrintWindow,
  onShowDataEditor,
  onShowStudyEfficiencyModal,
  onNewAssessment,
  showStudyEfficiencyModal,
  reportMode,
  setReportMode,
  isAdminUnlocked
}) => {
  const [showAssessmentWindow, setShowAssessmentWindow] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);

  // Print style extraction for new window
  const printStyle = typeof document !== 'undefined'
    ? Array.from(document.styleSheets)
      .map(styleSheet => {
        try {
          return Array.from(styleSheet.cssRules).map(rule => rule.cssText).join('');
        } catch (e) {
          return '';
        }
      }).join('')
    : '';

  const handlePsychologicalAssessment = () => {
    setShowAssessmentWindow(true);
  };

  return (
    <>
      {/* Official Report Header */}
      <div className="report-official-header flex justify-between items-end bg-slate-50/50 p-4 rounded-t-2xl border-b-2 border-slate-200">
        <div>
          <h1 className="text-xl font-black text-slate-800 tracking-tighter flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
            Neuro-Bio Academic Strategy System <span className="text-indigo-600 font-bold">[NBASS]</span>
          </h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 ml-4">뉴로바이오 학습전략시스템</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] text-slate-400 font-bold tracking-widest uppercase">Official Diagnostic Report</p>
          <div className="flex flex-col items-end gap-0.5 mt-1">
            <p className="text-[10px] text-slate-500 font-mono">Date: {result.student.testDate}</p>
            {config.currentExaminerId && (
              <p className="text-[10px] text-slate-500 font-mono">
                Examiner ID: {(() => {
                    const ex = config.examiners?.find(e => e.id === config.currentExaminerId);
                    return ex ? `${ex.id}${ex.position ? ` (${ex.position})` : ''}` : config.currentExaminerId;
                })()}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Button Controls */}
      <div className="flex flex-wrap items-center gap-3 bg-slate-100 p-4 rounded-b-2xl mb-6 no-print">
        <button
          onClick={handlePsychologicalAssessment}
          className="px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors flex items-center gap-2 font-bold shadow-lg shadow-purple-200"
        >
          <img src="./psychological_logo.jpg" alt="Logo" className="w-6 h-6 object-contain" />
          Psychological Assessment
        </button>

        {/* Report Mode Toggle */}
        <div className="flex bg-slate-200 p-1 rounded-xl items-center no-print">
          <button
            onClick={() => {
              if (reportMode === 'expert') return;
              if (isAdminUnlocked) {
                  setReportMode('expert');
              } else if (config.expertModePassword) {
                  setShowPasswordPrompt(true);
              } else {
                  setReportMode('expert');
              }
            }}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${reportMode === 'expert'
              ? 'bg-white text-indigo-700 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            전문가용
          </button>
          <button
            onClick={() => setReportMode('student')}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${reportMode === 'student'
              ? 'bg-white text-teal-700 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            학생용
          </button>
        </div>

        <button
          onClick={onPrintWindow}
          className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-1 font-bold shadow-lg shadow-indigo-200"
        >
          저장(PDF) / 인쇄
        </button>
        <button
          onClick={onShowDataEditor}
          className="px-6 py-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors flex items-center gap-2 font-bold border border-slate-300 no-print"
        >
          <span>📝</span> 수정
        </button>
        <button
          onClick={onShowStudyEfficiencyModal}
          className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all flex items-center gap-2 font-bold shadow-lg shadow-emerald-200 no-print"
        >
          <span>📊</span> 공부 효율성 정밀 검사
        </button>
        <button
          onClick={onNewAssessment}
          className="px-6 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors border border-slate-700"
        >
          New Assessment
        </button>
      </div >


      {/* Psychological Assessment Portal Window */}
      {
        showAssessmentWindow && (
          <PortalWindow
            title={`Psychological Assessment - ${result.student.name}`}
            onClose={() => setShowAssessmentWindow(false)}
          >
            <div className="p-8 bg-slate-50 min-h-screen">
              <PsychologicalAssessment result={result} />
            </div>
          </PortalWindow>
        )}

      <PromptModal
        isOpen={showPasswordPrompt}
        title="전문가용 진입 암호를 입력하세요"
        isPassword={true}
        onConfirm={(pwd) => {
            if (pwd === config.expertModePassword) {
                setReportMode('expert');
                setShowPasswordPrompt(false);
            } else {
                alert("암호가 일치하지 않습니다.");
            }
        }}
        onCancel={() => setShowPasswordPrompt(false)}
      />
    </>
  );
};
