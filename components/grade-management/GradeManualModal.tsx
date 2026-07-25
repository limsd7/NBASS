import React from 'react';

interface GradeManualModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GradeManualModal: React.FC<GradeManualModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-700 max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>📖</span> 성적 및 입시 전략 매뉴얼
          </h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg">✕</button>
        </div>

        <div className="space-y-6 text-sm text-slate-600 dark:text-slate-300">
          <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-2xl border border-blue-100 dark:border-blue-800">
            <h4 className="font-bold text-blue-900 dark:text-blue-300 text-base mb-2">💡 성적 시뮬레이션 활용법</h4>
            <p className="leading-relaxed">
              학생의 현재 원점수/표준점수/백분위/등급 이력을 바탕으로 수능 목표 등급 달성을 위한 영역별 전략을 계산합니다.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-slate-800 dark:text-white text-base">주요 기능</h4>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>성적 입력/추이:</strong> 중간/기말/모의고사 등급 추이를 시각적 그래프로 분석</li>
              <li><strong>목표 설정 (Tier 1~3):</strong> 단계별 현실적 목표와 최종 정복 목표 설정</li>
              <li><strong>수능 D-Day 로드맵:</strong> D-Day별 일별/주별 뽀모도로 및 과목 밸런스 제안</li>
              <li><strong>학부모 리포트:</strong> 성적 종합 상황판 및 인쇄용 브리핑 생성</li>
            </ul>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end">
            <button onClick={onClose} className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">
              확인
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
