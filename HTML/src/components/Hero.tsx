import React from 'react';
import { Sparkles, Brain, Activity, Zap, ShieldCheck, ArrowRight, CheckCircle2, Award } from 'lucide-react';

interface HeroProps {
  onStartAssessment: () => void;
  onExploreFeatures: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartAssessment, onExploreFeatures }) => {
  return (
    <section id="intro-section" className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32 bg-slate-50">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-12 items-center">
          
          {/* Left Text Content */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="inline-block px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100 uppercase tracking-wider">
              Neuro-Bio Academic Strategy System
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
              나의 학습 성향을 분석해 <span className="text-blue-600">가장 효과적으로 공부</span>할 수 있도록 이끌어줍니다.
            </h1>

            <p className="text-base sm:text-lg text-slate-500 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              심리 성향을 정밀 분석하여 나에게 딱 맞는 최적의 학습 전략을 제공합니다. <span className="text-blue-600 font-semibold">(뇌파·심박검사는 프리미엄 이상 회원 전용)</span>
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onStartAssessment}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-full shadow-lg shadow-blue-500/25 active:scale-95 transition-all flex items-center justify-center gap-3 text-base cursor-pointer"
              >
                <span>검사 시작하기</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={onExploreFeatures}
                className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-700 font-bold px-7 py-4 rounded-full border border-slate-200 shadow-sm transition-all text-base cursor-pointer"
              >
                주요 기능 둘러보기
              </button>
            </div>

            <div className="flex gap-4 pt-4 justify-center lg:justify-start items-center">
              <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-700 shadow-sm">+1k</div>
                <div className="w-10 h-10 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-blue-600 font-bold shadow-sm">🎓</div>
              </div>
              <div className="text-sm text-slate-500">
                <span className="font-bold text-slate-800 mr-1">12,400+</span> 명의 수험생이 선택한 솔루션
              </div>
            </div>
          </div>

          {/* Right Feature Cards & Package Banner */}
          <div className="lg:col-span-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 transition-all">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl mb-4">📊</div>
                <h3 className="text-lg font-bold mb-2 text-slate-900">집중력 정밀 진단</h3>
                <p className="text-sm text-slate-500 leading-relaxed">뇌파(EEG) 분석을 통해 현재 당신의 집중 단계와 인지 부하를 실시간 측정합니다.</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-300 transition-all">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-2xl mb-4">🌱</div>
                <h3 className="text-lg font-bold mb-2 text-slate-900">바이오 최적화 처방</h3>
                <p className="text-sm text-slate-500 leading-relaxed">BMI와 수면 패턴을 고려한 개인별 맞춤 영양 및 운동 가이드를 제공합니다.</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-purple-300 transition-all">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl mb-4">🧠</div>
                <h3 className="text-lg font-bold mb-2 text-slate-900">학습 전략 매칭</h3>
                <p className="text-sm text-slate-500 leading-relaxed">5대 과학적 학습 기질과 생체 지표를 결합하여 가장 효율적인 맞춤 학습법을 제안합니다.</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-orange-300 transition-all">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-2xl mb-4">📉</div>
                <h3 className="text-lg font-bold mb-2 text-slate-900">스트레스 리포트</h3>
                <p className="text-sm text-slate-500 leading-relaxed">자율신경 밸런스 분석을 통해 번아웃 위험도를 체크하고 멘탈 케어 솔루션을 지원합니다.</p>
              </div>
            </div>

            <div 
              onClick={onStartAssessment}
              className="mt-4 flex items-center justify-between bg-blue-900 rounded-2xl p-6 text-white shadow-lg cursor-pointer hover:bg-blue-950 transition-all"
            >
              <div>
                <div className="text-blue-300 text-xs font-bold uppercase mb-1">Now Available</div>
                <div className="text-xl font-bold">전문가 집중력 분석 패키지</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black">₩49,000</div>
                <div className="text-xs opacity-60">최초 1회 검사비 포함</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
