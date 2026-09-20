import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "NBASS 검사는 어떻게 진행되나요?",
      answer: "웹 브라우저와 PC/모바일 카메라 및 오디오를 활용하여 비대면으로 간편하게 진행됩니다. 뇌파 집중도 반응 테스트와 자율신경계 설문, 신체 프로파일 입력을 거쳐 약 5~10분 내에 완료됩니다."
    },
    {
      question: "의학적 진단이나 병원 치료를 대신할 수 있나요?",
      answer: "NBASS는 학습 효율 극대화와 일상 컨디션 관리를 위한 과학적 전략 및 바이오피드백 시스템입니다. 전문 의료 기관의 진단이나 치료를 대체하지 않으며, 학습자 자기 관리 보조 도구로 설계되었습니다."
    },
    {
      question: "회원가입과 로그인 과정은 어떻게 되나요?",
      answer: "상단 메뉴의 '검사시작' 버튼을 누르시면 회원가입 및 로그인 모달이 팝업됩니다. 이메일과 비밀번호 입력만으로 즉시 가입 및 로그인이 가능하며, Supabase 연동 데이터베이스로 안전하게 보호됩니다."
    },
    {
      question: "어떤 연령대와 타겟 고객이 주로 사용하나요?",
      answer: "수능 및 공무원·임용 등 고난도 시험을 준비하는 수험생, 학업 집중력이 필요한 대학생, 퇴근 후 자기계발을 하는 직장인들까지 학습 효율과 멘탈 관리가 필요한 모든 분께 최적화되어 있습니다."
    },
    {
      question: "결제 후 환불이 가능한가요?",
      answer: "서비스 이용 전(검사 미실시 상태)에는 7일 이내 100% 환불이 가능합니다. 단, 리포트가 발급되었거나 컨설팅이 진행된 경우 전자상거래법에 따라 일부 제한될 수 있습니다."
    }
  ];

  return (
    <section id="faq-section" className="py-20 lg:py-32 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <span className="text-xs font-bold bg-blue-100 text-blue-800 px-3 py-1 rounded-full uppercase tracking-wider">
            FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            자주 묻는 <span className="text-blue-600">질문과 답변</span>
          </h2>
          <p className="text-slate-600 text-base">
            NBASS 서비스 이용에 관해 궁금하신 점을 확인하세요.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full px-6 py-5 text-left font-bold text-slate-900 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-100/60 transition-colors"
                >
                  <span className="flex items-center gap-3 text-sm sm:text-base">
                    <HelpCircle className="w-5 h-5 text-blue-600 shrink-0" />
                    {faq.question}
                  </span>
                  {isOpen ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 pt-2 text-slate-600 text-sm leading-relaxed border-t border-slate-200/60 bg-white">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
