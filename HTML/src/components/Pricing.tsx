import React from 'react';
import { CheckCircle2, Sparkles, Zap, ShieldCheck } from 'lucide-react';

interface PricingProps {
  onStartAssessment: () => void;
}

export const Pricing: React.FC<PricingProps> = ({ onStartAssessment }) => {
  const plans = [
    {
      name: "무료 베이직 체험",
      price: "0원",
      period: "평생 무료",
      description: "NBASS 핵심 뇌파 및 스트레스 간이 검사 체험",
      features: [
        "간이 집중도 및 스트레스 테스트",
        "일일 기본 학습 가이드 리포트",
        "기본 수면 습관 가이드 제공"
      ],
      cta: "무료로 시작하기",
      highlighted: false
    },
    {
      name: "수험생 정밀 마스터 패키지",
      price: "29,000원",
      period: "1개월 이용권",
      description: "수험생 및 고시생을 위한 정밀 생체 신호 분석 및 로드맵",
      features: [
        "무제한 EEG 뇌파 집중도 정밀 검사",
        "자율신경계 누적 스트레스 정밀 분석",
        "과목별 최적 시간대 학습 로드맵 처방",
        "두뇌 활성화 운동 & 영양 식단 가이드",
        "주간 성장 리포트 발급"
      ],
      cta: "마스터 패키지 시작",
      highlighted: true
    },
    {
      name: "프리미엄 1:1 컨설팅",
      price: "99,000원",
      period: "1회 집중 컨설팅",
      description: "전문 뉴로바이오 연구원의 1:1 맞춤형 컨설팅 및 정밀 솔루션",
      features: [
        "마스터 패키지 모든 기능 (1개월 포함)",
        "전문가 1:1 화상/대면 생체 데이터 분석",
        "개인별 수면·식단 100% 맞춤 처방전",
        "입시/취업 멘탈 집중 케어 프로그램"
      ],
      cta: "컨설팅 신청하기",
      highlighted: false
    }
  ];

  return (
    <section id="pricing-section" className="py-20 lg:py-32 bg-slate-50/80 border-y border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-bold bg-blue-100 text-blue-800 px-3 py-1 rounded-full uppercase tracking-wider">
            PRICING PLANS
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            합리적인 비용으로 시작하는 <span className="text-blue-600">두뇌·신체 최적화</span>
          </h2>
          <p className="text-slate-600 text-base">
            자신에게 가장 알맞은 플랜을 선택하고 지금 바로 학습 효율을 극대화하세요.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`rounded-3xl p-8 flex flex-col justify-between transition-all ${
                plan.highlighted
                  ? 'bg-slate-900 text-white shadow-2xl ring-4 ring-blue-500/30 lg:-translate-y-2'
                  : 'bg-white text-slate-900 border border-slate-200 shadow-sm hover:shadow-lg'
              }`}
            >
              <div>
                {plan.highlighted && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600 text-white text-[11px] font-extrabold mb-4 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>가장 인기있는 추천 플랜</span>
                  </div>
                )}

                <h3 className={`text-xl font-bold mb-2 ${plan.highlighted ? 'text-white' : 'text-slate-900'}`}>
                  {plan.name}
                </h3>
                <p className={`text-xs mb-6 ${plan.highlighted ? 'text-slate-300' : 'text-slate-500'}`}>
                  {plan.description}
                </p>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-black tracking-tight">{plan.price}</span>
                  <span className={`text-xs font-semibold ${plan.highlighted ? 'text-slate-400' : 'text-slate-500'}`}>
                    / {plan.period}
                  </span>
                </div>

                <div className="space-y-3 pt-6 border-t border-slate-200/20 mb-8">
                  {plan.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2.5 text-xs font-medium">
                      <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${plan.highlighted ? 'text-blue-400' : 'text-blue-600'}`} />
                      <span className={plan.highlighted ? 'text-slate-200' : 'text-slate-700'}>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={onStartAssessment}
                className={`w-full py-3.5 rounded-2xl font-extrabold text-sm transition-all cursor-pointer ${
                  plan.highlighted
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
