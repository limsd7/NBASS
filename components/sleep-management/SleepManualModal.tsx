import React from 'react';

interface SleepManualModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SleepManualModal: React.FC<SleepManualModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-700 max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>🌙</span> 수면 관리 프로그램 매뉴얼
          </h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg">✕</button>
        </div>

        <div className="space-y-6 text-sm text-slate-600 dark:text-slate-300">
          <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-2xl border border-purple-100 dark:border-purple-800">
            <h4 className="font-bold text-purple-900 dark:text-purple-300 text-base mb-2">💡 크로노타입 & 수면 빚 관리</h4>
            <p className="leading-relaxed">
              수면 시간, 기상 시간, 수면의 질을 일별로 기록하여 크로노타입(아침형/저녁형) 분석 및 누적 수면 빚(Sleep Debt)을 산출합니다.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-slate-800 dark:text-white text-base">핵심 가이드</h4>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>취침/기상 고정:</strong> 주말에도 취침/기상 시간 편차를 1시간 이내로 유지</li>
              <li><strong>수면 빚 청산:</strong> 누적된 피로는 주말 1시간 낮잠(Power Nap)으로 회복</li>
              <li><strong>블루라이트 차단:</strong> 취침 1시간 전 스마트폰 사용 제한 및 마그네슘 섭취</li>
            </ul>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end">
            <button onClick={onClose} className="px-6 py-2.5 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors">
              확인
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
