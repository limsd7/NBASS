import React from 'react';

interface ReportManualModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ReportManualModal: React.FC<ReportManualModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                            <span className="text-blue-600">📘</span> 결과보고서 매뉴얼
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">결과 화면의 버튼 및 기능 활용 가이드</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors">
                        ✕
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto space-y-8 bg-slate-50/50">
                    <div className="space-y-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4">⚙️ 설정 및 기본 기능</h3>
                        
                        <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
                            <div className="p-3 bg-slate-100 rounded-lg shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0-.73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 mb-1">톱니바퀴 (설정) 버튼</h4>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    <strong>과목별 전략 설정 및 앱 시스템 환경설정</strong>을 담당합니다. 관리자 비밀번호를 입력해야 접근 가능하며, 여기서 특정 과목에 대한 세부 전략 체크, 로직 엔진 알고리즘 수정, 예측 규칙 조정, 그리고 로컬 AI(Ollama 등) 연동을 위한 <span className="font-semibold text-sky-600">AI Model 탭</span>과 <span className="font-semibold text-emerald-600">특허 분석 탭</span>을 확인할 수 있습니다.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
                            <div className="px-4 py-2 bg-slate-900 text-white font-bold rounded-lg shrink-0 flex items-center gap-2">
                                <span className="text-lg">🧬</span> Study Mode
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 mb-1">Study Mode 버튼</h4>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    학생이 매일 수행해야 할 <strong>실전 학습 스케줄과 훈련 프로그램</strong> 화면으로 전환합니다. 자율신경 밸런스 및 인지 데이터를 기반으로 맞춤형 휴식 타임과 루틴을 관리할 수 있습니다.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4">📄 보기 모드 및 출력 기능</h3>
                        
                        <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
                            <div className="flex bg-slate-200 p-1 rounded-lg shrink-0">
                                <span className="px-3 py-1 bg-white shadow-sm rounded font-bold text-sm text-indigo-700">전문가용</span>
                                <span className="px-3 py-1 text-slate-500 font-medium text-sm">학생용</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 mb-1">리포트 모드 (전문가용 / 학생용) 스위치</h4>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    보고서의 정보량을 조절합니다. <strong>전문가용</strong>은 자율신경계 및 신경인지에 대한 전문 의학/심리학적 분석이 모두 노출되며, <strong>학생용</strong>은 심리적 부담을 줄 수 있는 심각성 지표나 복잡한 전문 용어를 숨기고 순수하게 학습 전략에 집중한 내용만 보여줍니다.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
                            <div className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg border border-slate-200 shrink-0">
                                🖨️ 인쇄 / PDF 저장
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 mb-1">인쇄 / PDF 저장 버튼</h4>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    현재 분석된 결과를 <strong>A4 최적화된 형식의 PDF 보고서</strong>로 출력하거나 종이로 인쇄합니다. 클릭 시 브라우저 내장 인쇄 대화창이 뜨며, 여백 없이 '배경 그래픽 포함' 옵션을 체크해야 스타일이 정상적으로 인쇄됩니다.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4">🔍 심화 분석 기능</h3>
                        
                        <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
                            <div className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg shrink-0 font-bold text-sm">
                                📊 누적 트렌드 분석
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 mb-1">누적 트렌드 분석 버튼</h4>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    과거부터 현재까지 측정된 <strong>학생의 시계열 데이터(자율신경 밸런스, 피로도 등) 추이를 그래프로 확인</strong>하는 기능입니다. 훈련을 통해 자율신경 균형이나 스트레스 지수가 개선되고 있는지를 객관적으로 파악할 수 있으며, 이 데이터를 기반으로 한 AI 분석도 제공됩니다.
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
                            <div className="px-3 py-1 bg-violet-50 text-violet-700 border border-violet-200 rounded-lg shrink-0 font-bold text-sm">
                                🧬 영양 처방
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 mb-1">영양 처방 버튼</h4>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    학생의 두뇌 상태(부신 피로, 뇌피로, 수면장애 등)에 맞춘 <strong>맞춤형 영양제 및 건강보조식품</strong>을 추천하는 모달을 띄웁니다.
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
                            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center shrink-0 shadow-lg">
                                <span className="text-white text-xl">✨</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 mb-1">AI 챗봇 어시스턴트 (화면 우측 하단 둥근 버튼)</h4>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    분석 결과 전반에 대해 <strong>로컬 AI 또는 클라우드 AI에게 직접 질의응답</strong>을 할 수 있는 플로팅 챗봇입니다. "이 학생에게 이번 주 가장 중요한 조언을 한마디로 요약해줘" 같은 질문을 입력할 수 있습니다.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <button onClick={onClose} className="px-6 py-2 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-700 transition-colors">
                        확인
                    </button>
                </div>
            </div>
        </div>
    );
};
