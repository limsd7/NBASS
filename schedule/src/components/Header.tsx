import React from 'react';
import { CareType } from '../types';
import { Sparkles, Calendar, BookOpen, BarChart2, ShieldAlert } from 'lucide-react';

interface HeaderProps {
  currentCareType: CareType;
  onOpenCareModal: () => void;
  onOpenConditionCheck: () => void;
  onOpenAICoach: () => void;
  onOpenUserManual: () => void;
  activeTab: 'schedule' | 'dashboard' | 'exam' | 'input';
  setActiveTab: (tab: 'schedule' | 'dashboard' | 'exam' | 'input') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentCareType,
  onOpenCareModal,
  onOpenConditionCheck,
  onOpenAICoach,
  onOpenUserManual,
  activeTab,
  setActiveTab
}) => {
  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-xs">
      <div className="w-full px-3 sm:px-5 lg:px-6">
        <div className="flex justify-between items-center h-16 sm:h-18">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 font-bold text-xl">
              학
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight">스마트 케어 시간관리</h1>
              <p className="text-xs text-stone-500 hidden sm:block">뇌피로·자율신경 연계 맞춤 스케줄러</p>
            </div>
          </div>

          {/* Navigation Tabs (Primary First: 오늘의 시간표 맨 앞) */}
          <nav className="hidden lg:flex items-center space-x-1.5">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-sm font-bold transition ${
                activeTab === 'schedule'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>오늘의 시간표</span>
            </button>
            <button
              onClick={() => setActiveTab('input')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition ${
                activeTab === 'input'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>일과 & 과목 설정</span>
            </button>
            <button
              onClick={() => setActiveTab('exam')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition ${
                activeTab === 'exam'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>시험 대비 플래너</span>
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              <span>통계 & 노하우</span>
            </button>
          </nav>

          {/* Right Action Group: Manual, Condition Check, Care Type, AI Coach */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={onOpenUserManual}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-extrabold transition border border-amber-300 shadow-2xs"
              title="처음 사용자 가이드 & 사용 설명서"
            >
              <span className="text-sm">📖</span>
              <span>사용 설명서</span>
            </button>
            <button
              onClick={onOpenConditionCheck}
              className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition border border-indigo-200 shadow-2xs"
            >
              <span>🩺 컨디션 체크인</span>
            </button>
            <button
              onClick={onOpenCareModal}
              className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium transition border border-stone-200"
            >
              <span className="text-base">{currentCareType.emoji}</span>
              <span className="font-semibold text-stone-900">{currentCareType.title}</span>
              <span className="text-indigo-600 font-semibold underline ml-0.5">변경</span>
            </button>
            <button
              onClick={onOpenAICoach}
              className="flex items-center space-x-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-xs hover:opacity-95 transition"
            >
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>AI 학습 코치</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bar - 오늘의 시간표 맨 앞 배치 */}
      <div className="flex lg:hidden overflow-x-auto bg-stone-50 border-t border-stone-200 px-3 py-2 space-x-2 scrollbar-none">
        <button
          onClick={onOpenUserManual}
          className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-amber-100 text-amber-900 text-xs font-extrabold border border-amber-300 shrink-0"
        >
          <span>📖 사용법</span>
        </button>
        <button
          onClick={() => setActiveTab('schedule')}
          className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition ${
            activeTab === 'schedule'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-stone-700 border border-stone-200'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>오늘의 시간표</span>
        </button>
        <button
          onClick={onOpenConditionCheck}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200 shrink-0"
        >
          <span>🩺 컨디션 체크인</span>
        </button>
        <button
          onClick={onOpenCareModal}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-white text-stone-700 text-xs font-medium border border-stone-200 shrink-0"
        >
          <span>{currentCareType.emoji}</span>
          <span>{currentCareType.title}</span>
        </button>
        <button
          onClick={() => setActiveTab('input')}
          className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition ${
            activeTab === 'input'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-stone-700 border border-stone-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>일과·과목 설정</span>
        </button>
        <button
          onClick={() => setActiveTab('exam')}
          className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition ${
            activeTab === 'exam'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-stone-700 border border-stone-200'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>시험대비</span>
        </button>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition ${
            activeTab === 'dashboard'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-stone-700 border border-stone-200'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          <span>통계·노하우</span>
        </button>
      </div>
    </header>
  );
};
