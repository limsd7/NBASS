import React from 'react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 text-slate-100 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block mb-1">
              PRIVACY COMPLIANCE
            </span>
            <h3 className="text-xl font-extrabold text-white">NBASS 개인정보처리방침</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition"
          >
            ✕
          </button>
        </div>

        {/* Policy Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300 leading-relaxed custom-scrollbar">
          <div className="p-4 bg-indigo-950/30 border border-indigo-500/20 rounded-2xl text-[11px] text-indigo-200">
            주식회사 엔베이스(이하 '회사')는 「개인정보 보호법」 제30조에 따라 정보주체의 개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 하기 위하여 다음과 같이 개인정보 처리방침을 수립·공개합니다.
            <div className="mt-1 font-semibold text-amber-300">
              시행일자: 2026년 3월 1일 (최신 개정)
            </div>
          </div>

          <section className="space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>1.</span> 개인정보의 처리 목적
            </h4>
            <p>회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며 이용 목적이 변경되는 경우에는 「개인정보 보호법」 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.</p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-slate-400">
              <li><strong>회원 가입 및 관리:</strong> 회원 가입의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증, 회원자격 유지·관리, 만 14세 이상 확인, 서비스 부정이용 방지</li>
              <li><strong>신경인지 학습 분석 및 솔루션 제공:</strong> 12종 케어타입 분류, 두뇌 인지 성향 분석, AI 골든타임 시간표 재배치, 14P 심층 리포트북 발행</li>
              <li><strong>유료 서비스 및 정기결제 처리:</strong> 유료 콘텐츠(1회 리포트, 월정액 안심 케어) 제공, 대금 결제·정산 및 환불 처리, 청구서 발송</li>
              <li><strong>학부모 안심 연동 서비스:</strong> 매주 일요일 밤 자녀 학습 컨디션 및 시간표 카카오톡 알림톡 자동 브리핑</li>
              <li><strong>고객 상담 및 민원 처리:</strong> 이용자 문의 접수 및 사실 확인, 처리 결과 통보</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>2.</span> 처리하는 개인정보의 항목
            </h4>
            <div className="border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead className="bg-slate-800 text-slate-200">
                  <tr>
                    <th className="p-2.5 border-b border-slate-700">구분</th>
                    <th className="p-2.5 border-b border-slate-700">수집 항목</th>
                    <th className="p-2.5 border-b border-slate-700">수집 목적</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  <tr>
                    <td className="p-2.5 font-bold text-slate-200">학생 회원 (필수)</td>
                    <td className="p-2.5 text-slate-400">이름, 아이디(이메일), 비밀번호, 학년, 생년월일, 성별, 수능 응시과목</td>
                    <td className="p-2.5 text-slate-400">학생 본인인증, 연령별 인지 표준점수 산출, 과목별 취약점 분석</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-slate-200">학생 회원 (선택)</td>
                    <td className="p-2.5 text-slate-400">소속 학원/학교명, 신장(키), 체중(몸무게), 일상 활동량</td>
                    <td className="p-2.5 text-slate-400">바이오리듬 및 뉴로-영양 섭취 기준점 정밀 계산</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-slate-200">학부모 회원 (필수)</td>
                    <td className="p-2.5 text-slate-400">학부모 성함, 아이디(이메일), 비밀번호, 휴대전화번호, 연계 자녀 정보</td>
                    <td className="p-2.5 text-slate-400">학부모 계정 연동 및 매주 카카오톡 주간 안심 브리핑 발송</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-slate-200">유료 결제 시</td>
                    <td className="p-2.5 text-slate-400">카드사명, 결제 승인번호, 거래 일시 (카드번호 등 금융정보는 전자지급결제대행사(PG)에서 암호화 처리)</td>
                    <td className="p-2.5 text-slate-400">전자상거래 결제 승인, 정기결제 처리 및 환불</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-slate-200">서비스 이용 시 자동생성</td>
                    <td className="p-2.5 text-slate-400">접속 IP 주소, 쿠키(Cookie), 서비스 이용 기록, 접속 로그, 기기 정보</td>
                    <td className="p-2.5 text-slate-400">부정 이용 방지, 통계 분석, 시스템 안정성 확보</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>3.</span> 개인정보의 처리 및 보유 기간
            </h4>
            <p>회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보 수집 시에 동의받은 보유·이용기간 내에서 개인정보를 처리·보유합니다.</p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-slate-400">
              <li><strong>회원 정보:</strong> 회원 탈퇴 시까지 (단, 관계 법령 위반에 따른 수사·조사 시 해당 수사 종료 시까지)</li>
              <li><strong>계약 또는 청약철회 등에 관한 기록:</strong> 5년 (전자상거래 등에서의 소비자보호에 관한 법률)</li>
              <li><strong>대금결제 및 재화 등의 공급에 관한 기록:</strong> 5년 (전자상거래 등에서의 소비자보호에 관한 법률)</li>
              <li><strong>소비자의 불만 또는 분쟁처리에 관한 기록:</strong> 3년 (전자상거래 등에서의 소비자보호에 관한 법률)</li>
              <li><strong>서비스 접속 및 로그 기록:</strong> 3개월 (통신비밀보호법)</li>
              <li><strong>파기 절차 및 방법:</strong> 보유기간 경과 또는 처리 목적 달성 시 지체 없이 파기합니다. 전자적 파일은 복구 불가능한 방법으로 영구 삭제하고, 종이 문서는 분쇄 또는 소각합니다. 회원 탈퇴 요청 시 법령상 보관 의무가 있는 기록을 제외한 모든 개인정보를 즉시 파기합니다.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>4.</span> 개인정보의 제3자 제공 및 위탁
            </h4>
            <p>회사는 원칙적으로 정보주체의 개인정보를 제1조에서 명시한 범위 내에서만 처리하며, 정보주체의 사전 동의 없이 제3자에게 제공하지 않습니다. 원활한 서비스 이행을 위해 다음과 같이 개인정보 처리 업무를 위탁하고 있습니다.</p>
            <div className="border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead className="bg-slate-800 text-slate-200">
                  <tr>
                    <th className="p-2.5 border-b border-slate-700">수탁업체</th>
                    <th className="p-2.5 border-b border-slate-700">위탁 업무 내용</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  <tr>
                    <td className="p-2.5 font-bold text-slate-200">카카오(주)</td>
                    <td className="p-2.5 text-slate-400">학부모 카카오톡 알림톡(주간 안심 브리핑) 발송 서비스</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-slate-200">토스페이먼츠(주) / 나이스페이먼츠</td>
                    <td className="p-2.5 text-slate-400">신용카드 등 결제 승인 및 정기결제 대행</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-slate-200">Supabase Inc. / Amazon Web Services</td>
                    <td className="p-2.5 text-slate-400">클라우드 데이터 저장소 및 보안 인프라 운영</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>5.</span> 정보주체 및 법정대리인의 권리·의무 및 행사방법
            </h4>
            <ul className="list-disc list-inside space-y-1 pl-2 text-slate-400">
              <li>정보주체는 회사에 대해 언제든지 개인정보 열람, 정정, 삭제, 처리정지 요구 등의 권리를 행사할 수 있습니다.</li>
              <li>만 14세 미만 아동의 경우, 법정대리인은 아동의 개인정보에 대한 열람, 정정, 삭제, 처리정지를 요구할 권리를 가집니다.</li>
              <li>권리 행사는 고객센터 또는 개인정보 보호책임자에게 서면, 전자우편(privacy@nbass.io) 등을 통하여 하실 수 있으며 회사는 이에 대해 지체 없이 조치합니다.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>6.</span> 개인정보의 안전성 확보 조치
            </h4>
            <ul className="list-disc list-inside space-y-1 pl-2 text-slate-400">
              <li><strong>비밀번호 일방향 암호화:</strong> 회원의 비밀번호는 단방향 암호화(Hash)되어 저장 및 관리되므로 오너를 포함한 관리자도 열람할 수 없습니다.</li>
              <li><strong>전송 구간 암호화:</strong> 네트워크상에서 개인정보를 안전하게 전송할 수 있도록 SSL 256-bit 보안 통신 프로토콜을 적용하고 있습니다.</li>
              <li><strong>접근 권한 관리:</strong> 개인정보를 처리하는 데이터베이스 시스템에 대한 접근권한의 부여, 변경, 말소를 통하여 권한을 최소화하고 있습니다.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>7.</span> 의료법 및 비의료 행위 고지 (의무 면책 조항)
            </h4>
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-200">
              <strong>[필독 고지]</strong> 본 NBASS 시스템의 설문·인지검사 기반 학습 성향 분류, 골든타임 시간표 및 솔루션 리포트는 <strong>인지과학 및 학습코칭에 기반한 자기주도 학습 보조 콘텐츠</strong>입니다. 
              의료법상 의료기관의 진료, 질병의 예방·진단·치료 또는 의학적 처방을 대신하지 않으며, 의료행위로 오인될 수 있는 어떠한 의학적 효능도 보증하지 않습니다.
              영양·수면 가이드에 언급되는 식품·영양성분은 질병의 치료·예방 효능을 의미하지 않으며, 복용 중인 약이 있거나 질환이 있는 경우 반드시 의사·약사와 상담하십시오.
            </div>
          </section>

          <section className="space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>8.</span> 개인정보 보호책임자
            </h4>
            <div className="p-3 bg-slate-800/80 rounded-xl text-slate-300">
              <div><strong>개인정보 보호책임자:</strong> 정보보호최고책임관 (CPO)</div>
              <div><strong>소속 부서:</strong> 정보보호팀 / 고객지원센터</div>
              <div><strong>문의 이메일:</strong> privacy@nbass.io</div>
              <div><strong>대표 번호:</strong> 02-555-0192</div>
            </div>
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
