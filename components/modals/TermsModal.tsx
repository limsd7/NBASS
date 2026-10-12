import React from 'react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 text-slate-100 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block mb-1">
              TERMS OF SERVICE
            </span>
            <h3 className="text-xl font-extrabold text-white">NBASS 서비스 이용약관</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition"
          >
            ✕
          </button>
        </div>

        {/* Terms Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300 leading-relaxed custom-scrollbar">
          <div className="p-4 bg-indigo-950/30 border border-indigo-500/20 rounded-2xl text-[11px] text-indigo-200">
            본 약관은 주식회사 엔베이스(이하 '회사')가 제공하는 NBASS 신경인지 학습 최적화 플랫폼(이하 '서비스')의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
            <div className="mt-1 font-semibold text-amber-300">
              시행일자: 2026년 3월 1일 (최신 개정)
            </div>
          </div>

          <section className="space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>제1조</span> (목적 및 정의)
            </h4>
            <p>1. '서비스'란 회사가 웹 또는 애플리케이션을 통해 제공하는 신경인지 성향 진단, 14P 심층 리포트북, AI 골든타임 시간표, 학부모 주간 카카오톡 브리핑 등을 의미합니다.</p>
            <p>2. '회원'이란 본 약관에 동의하고 계정을 등록하여 서비스를 이용하는 자(학생 회원 및 학부모 회원)를 말합니다.</p>
          </section>

          <section className="space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>제2조</span> (이용계약의 성립 및 연령 제한)
            </h4>
            <p>1. 이용계약은 회원이 되고자 하는 자가 본 약관 및 개인정보처리방침에 동의한 후 회원가입 신청을 하고, 회사가 이를 승낙함으로써 체결됩니다.</p>
            <p>2. 본 서비스는 만 14세 이상을 대상으로 하며, 만 14세 미만의 아동이 가입을 원할 경우 개인정보보호법에 따라 법정대리인의 명시적 동의 절차를 거쳐야 합니다.</p>
          </section>

          <section className="space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>제3조</span> (유료 서비스 및 결제 체계)
            </h4>
            <p>1. 회사는 다음과 같은 멤버십 플랜을 제공합니다.</p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-slate-400">
              <li><strong>무료 회원 (FREE):</strong> ₩0, 3분 간이 진단 및 12종 케어타입 1줄 소견 제공</li>
              <li><strong>1회 리포트 회원 (단건):</strong> ₩24,900, 14P 신경인지 솔루션 리포트북 PDF 1회 영구 열람권 제공</li>
              <li><strong>정기결제 회원 (주간 안심 케어):</strong> 월 ₩19,900 (VAT 포함), 매주 일요일 밤 엄마 전용 카카오톡 주간 브리핑, AI 골든타임 시간표 주간 갱신, 14P 심층 리포트북 상시 무료 제공</li>
            </ul>
            <p>2. <strong>[1회 리포트 구매자 정기결제 전환 특별 혜택]</strong> 1회 리포트(₩24,900)를 결제한 회원이 정기결제로 전환할 경우, 기존 결제에 대한 감사 혜택으로 5,000원을 즉시 차감하여 <strong>첫 결제 회차에 한하여 ₩14,900원</strong>이 결제되며, 익월부터는 정상 월 구독료(₩19,900)로 자동 정기결제됩니다.</p>
          </section>

          <section className="space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>제4조</span> (청약철회 및 환불 규정)
            </h4>
            <p>1. 「전자상거래 등에서의 소비자보호에 관한 법률」 제17조에 따라 결제 후 7일 이내에 디지털 리포트북을 열람하거나 다운로드하지 않은 경우 전액 환불이 가능합니다.</p>
            <p>2. 단, 전자상거래법 제17조 제2항 제5호에 따라 회원이 1회 리포트북을 열람하거나 PDF 다운로드를 개시한 경우, 디지털 콘텐츠의 제공이 개시된 것으로 보아 단순 변심에 의한 청약철회가 제한됩니다.</p>
            <p>3. 월 정기결제의 경우 회원은 언제든지 다음 결제 주기의 자동 갱신을 해지할 수 있으며, 해지 시 이미 결제된 해당 월의 잔여 이용 기간까지 서비스를 정상 이용할 수 있습니다.</p>
          </section>

          <section className="space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>제5조</span> (의료행위 부인 및 법적 면책)
            </h4>
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-200">
              <strong>[중요 면책 조항]</strong> 본 서비스는 학습과학 및 인지심리 기반의 교육 보조 솔루션으로, <strong>의료법상의 의료행위나 질병의 진단, 예방, 치료 또는 의학적 처방이 아닙니다.</strong> 
              이용자가 필요로 하는 의학적 판단 및 치료는 반드시 전문 의료기관 및 의사의 진료를 통해 진행되어야 하며, 회사는 서비스 이용으로 발생한 학습 결과나 성적 변화에 대해 법적 책임을 부담하지 않습니다.
            </div>
          </section>

          <section className="space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>제6조</span> (분쟁 해결 및 관할 법원)
            </h4>
            <p>회사와 회원 간 발생한 분쟁에 관하여는 대한민국 법을 적용하며, 소송이 제기될 경우 민사소송법상의 관할 법원을 제1심 전속 관할 법원으로 합니다.</p>
          </section>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 flex justify-end bg-slate-950/70">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition"
          >
            확인 및 닫기
          </button>
        </div>

      </div>
    </div>
  );
};
