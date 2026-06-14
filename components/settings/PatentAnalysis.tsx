import React from 'react';

export const PatentAnalysis: React.FC = () => {
    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-200 shadow-sm">
                <h3 className="text-xl font-bold text-emerald-900 mb-2 flex items-center gap-2">
                    <span className="text-2xl">📜</span> NBASS 앱 특허 가능성 분석 (Patent Analysis)
                </h3>
                <p className="text-emerald-700 text-sm">
                    생체 데이터(HRV, EEG)와 인지 검사, 환경/심리 데이터를 융합하여 개인 맞춤형 학습 전략을 도출하는 본 시스템의 특허 등록 가능성 및 전략 분석입니다.
                </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h4 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">1. 특허 가능성 종합 판단: "가능성 매우 높음 (High Probability)"</h4>
                <p className="text-slate-600 text-sm leading-relaxed">
                    단순히 생체 데이터를 측정하거나 학습법을 제안하는 개별 기술은 이미 존재할 수 있으나, NBASS는 <strong>(1) HRV/EEG 기반 자율신경계/뇌파 상태 분석, (2) 인지/심리 설문 결과 병합, (3) LAPS/BCI 등의 독자적 로직 엔진을 통한 맞춤형 솔루션(영양, 수면, 학습법) 자동 도출</strong>이라는 구체적인 프로세스를 결합한 '비즈니스 모델(BM) 및 데이터 처리 방법' 측면에서 신규성과 진보성을 인정받을 가능성이 매우 높습니다.
                </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h4 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">2. 핵심 특허 청구항(Claim) 설계 방향</h4>
                <ul className="space-y-3 text-sm text-slate-600 list-disc pl-5">
                    <li>
                        <strong>데이터 수집부:</strong> 사용자의 생체 신호(HRV, 뇌파 등)와 환경/심리적 입력 데이터(수면 시간, 스트레스, BAI/GAD-7 등)를 실시간 또는 주기적으로 수집하는 단계.
                    </li>
                    <li>
                        <strong>융합 분석부:</strong> 수집된 생체 신호의 LF/HF 비율, 교감/부교감 활성도와 심리 데이터를 매핑하여 사용자의 현재 상태를 'CareType(예: 만성 피로형, 과민성 학습장애 등)'으로 매핑하는 BCI(Bio-Cognitive Index) 산출 단계.
                    </li>
                    <li>
                        <strong>솔루션 제공부:</strong> 산출된 CareType에 기반하여 AI 연동(Ollama/Gemini/Claude) 및 룰베이스 엔진을 통해 개인 맞춤형 영양 처방, 생활 습관 개선, 수면 및 학습 스케줄링 가이드를 자동 생성하여 출력하는 단계.
                    </li>
                </ul>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h4 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">3. 극복해야 할 도전 과제 (도출 전략)</h4>
                <div className="space-y-3 text-sm text-slate-600">
                    <p>
                        <strong>의료기기법 저촉 회피:</strong> 특허 명세서 작성 시 '질병의 진단 및 치료' 목적이 아닌 '학습 효율 향상 및 스트레스 관리' 목적의 <strong>'비의료용 웰니스(Wellness) 및 교육 보조 기기/방법'</strong>으로 명확히 한정해야 합니다. (의료기기법 위반 소지 및 진단 방법 특허 불인정 문제 회피)
                    </p>
                    <p>
                        <strong>알고리즘의 구체화:</strong> '단순히 AI를 썼다'는 것만으로는 진보성이 부족할 수 있습니다. <code>HRV 데이터 → 분류 트리 → 구체적 영양/학습 전략 매핑</code>으로 이어지는 시스템의 내부 로직(Logic Engine) 데이터를 흐름도(Flow Chart)로 명확하게 제시해야 합니다.
                    </p>
                </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 shadow-sm">
                <h4 className="text-lg font-bold text-blue-900 mb-2">전문 변리사 상담 제언</h4>
                <p className="text-blue-800 text-sm leading-relaxed">
                    본 시스템은 BM 특허(영업방법 특허) 및 시스템 특허로 진행하기에 훌륭한 구조를 갖추고 있습니다. 핵심 화면 설계도와 로직 엔진 설정(Rule-based System)을 캡처하여 변리사에게 제공하면, <strong>'생체-인지 융합 기반 맞춤형 학습/라이프스타일 가이드 시스템'</strong> 명칭으로 성공적인 출원이 가능할 것으로 판단됩니다.
                </p>
            </div>
        </div>
    );
};
