import React from 'react';
import { Activity, Brain, Clock, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

export const AssessmentTypes: React.FC = () => {
  const tests = [
    {
      badge: "EEG Brainwave",
      title: "뇌파 정밀 집중도 테스트",
      duration: "약 5분 소요",
      target: "수험생·고시생 추천",
      description: "알파파(α)와 베타파(β)의 비율을 분석하여 순간 집중력, 지속 집중력, 뇌 피로도를 정밀 측정합니다.",
      features: ["집중 유지 시간 측정", "뇌 활성도 밸런스 분석", "멘탈 이완 상태 진단"]
    },
    {
      badge: "ANS Autonomic",
      title: "자율신경계 밸런스 & 스트레스 진단",
      duration: "약 3분 소요",
      target: "직장인·대학생 추천",
      description: "심층 설문을 통해 교감·부교감 신경의 균형 상태와 누적 스트레스 지수를 정밀 분석합니다.",
      features: ["자율신경 균형도 평가", "번아웃 위험군 선별", "스트레스 저항 지수 계산"]
    },
    {
      badge: "Cognitive & Sleep",
      title: "인지 성향 및 수면 리듬 진단",
      duration: "약 7분 소요",
      target: "전체 회원 대상",
      description: "학습 성향(시각/청각/체감각형)과 수면의 질(렘 수면 사이클)을 진단하여 최적의 공부 환경을 제안합니다.",
      features: ["개인별 학습 스타일 분류", "수면 효율 리포트", "생체 시계 맞춤형 스케줄"]
    }
  ];

  return (
    <section id="tests-section" className="py-20 lg:py-32 bg-slate-50/80 border-y border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-bold bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full uppercase tracking-wider">
            DIAGNOSTIC SUITE
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            과학적 데이터 수집을 위한 <span className="text-indigo-600">3대 정밀 검사</span>
          </h2>
          <p className="text-slate-600 text-base">
            비대면 웹 환경에서도 간편하게 진행할 수 있는 인공지능 기반 생체 신호 및 심리 문진 시스템입니다.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {tests.map((test, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200/90 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-extrabold rounded-lg border border-blue-100">
                    {test.badge}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {test.duration}
                  </span>
                </div>

                <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">
                  {test.title}
                </h3>
                <p className="text-xs font-bold text-blue-600 mb-4">{test.target}</p>

                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  {test.description}
                </p>

                <div className="space-y-2.5 pt-4 border-t border-slate-100 mb-6">
                  {test.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2 text-xs font-medium text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-3 text-center text-xs font-bold text-slate-600">
                검사 완료 시 즉시 맞춤 리포트 발급
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
