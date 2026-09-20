import React from 'react';
import { CareType, RoutineInput } from '../types';
import { Sparkles, X, Link, CheckCircle, ExternalLink, Bot } from 'lucide-react';

interface AICoachModalProps {
  isOpen: boolean;
  onClose: () => void;
  careType: CareType;
  routine: RoutineInput;
  initialContext?: string;
}

export const AICoachModal: React.FC<AICoachModalProps> = ({
  isOpen,
  onClose,
  careType,
  routine
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-stone-200 text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Icon */}
        <div className="mx-auto w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
          <Sparkles className="w-8 h-8" />
        </div>

        {/* Title & Description */}
        <div>
          <div className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-extrabold border border-indigo-200 mb-2">
            <Link className="w-3.5 h-3.5" />
            <span>외부 앱 연동 준비 중</span>
          </div>
          <h3 className="text-xl font-extrabold text-stone-900">
            AI 학습 코치
          </h3>
          <p className="text-xs text-stone-600 mt-2 leading-relaxed max-w-xs mx-auto">
            현재 <strong>AI 학습 코치</strong>는 향후 전용 코칭 앱 및 외부 AI 서비스와의 연동을 위해 연동 인터페이스(API)를 준비 중입니다.
          </p>
        </div>

        {/* Integration Spec Card */}
        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-left space-y-2.5">
          <div className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
            <Bot className="w-4 h-4 text-indigo-600" />
            <span>연동 예정 데이터</span>
          </div>
          <ul className="text-xs text-stone-600 space-y-1.5 pl-1">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>현재 케어 타입: <strong className="text-stone-800">{careType.title} ({careType.emoji})</strong></span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>과목 우선순위 및 주간 목표 시간표</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>D-Day 시험 모드 및 취약점 분석 데이터</span>
            </li>
          </ul>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md transition"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};
