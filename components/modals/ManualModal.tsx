import React, { useState } from 'react';

interface ManualModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ManualModal: React.FC<ManualModalProps> = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState<'buttons' | 'guide'>('buttons');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700">
                
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 shrink-0">
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                        <span className="text-3xl">📖</span> 
                        NBASS 시스템 매뉴얼
                    </h2>
                    <button 
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex px-6 pt-4 bg-slate-50 dark:bg-slate-800 shrink-0 border-b border-slate-200 dark:border-slate-700 gap-4">
                    <button 
                        onClick={() => setActiveTab('buttons')}
                        className={`px-4 py-3 font-bold text-sm border-b-2 transition-colors ${activeTab === 'buttons' ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                    >
                        1. 메뉴 및 버튼 설명
                    </button>
                    <button 
                        onClick={() => setActiveTab('guide')}
                        className={`px-4 py-3 font-bold text-sm border-b-2 transition-colors ${activeTab === 'guide' ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                    >
                        2. 초보자 사용 가이드 (Step-by-Step)
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                    {activeTab === 'buttons' && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">메인 네비게이션 버튼</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-2xl">🏠</span>
                                        <h4 className="font-bold text-lg">Dashboard (대시보드)</h4>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                        앱을 실행하면 가장 먼저 나타나는 메인 화면입니다. 최신 검사 기록 요약과 시스템 전반의 상태를 보여줍니다. 새로운 학생을 등록하고 검사를 시작하는 진입점 역할을 합니다.
                                    </p>
                                </div>
                                
                                <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-2xl">🧪</span>
                                        <h4 className="font-bold text-lg">Assessment (분석 및 처방)</h4>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                        핵심 작업 공간입니다. 학생의 생체 데이터(자율신경/뇌파)와 설문 결과를 입력하면, AI가 이를 종합하여 현재 뇌-신체 상태(Care Type)를 도출하고 최적의 학습 및 멘탈 관리 솔루션을 제공합니다.
                                    </p>
                                </div>
                                
                                <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-2xl">📜</span>
                                        <h4 className="font-bold text-lg">History (기록 및 트렌드)</h4>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                        과거에 측정했던 모든 학생의 기록을 검색하고 열람할 수 있습니다. 특정 학생을 선택하면 과거부터 현재까지 상태가 어떻게 호전되고 있는지(Trend Analysis) 그래프로 확인할 수 있습니다.
                                    </p>
                                </div>
                                
                                <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-2xl">📚</span>
                                        <h4 className="font-bold text-lg">Resources (자료실)</h4>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                        상담에 필요한 각종 레퍼런스, 학부모 안내 자료, 맞춤형 영양제 정보 및 추가 학술 문헌 등을 열람할 수 있는 공간입니다. 상담 중 언제든 참고할 수 있습니다.
                                    </p>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">기타 주요 컨트롤</h3>
                            
                            <div className="space-y-4">
                                <div className="flex items-start gap-4 p-4 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30">
                                    <span className="text-2xl">👨‍⚕️</span>
                                    <div>
                                        <h4 className="font-bold text-indigo-900 dark:text-indigo-300">Expert Guide (전문가용 가이드 팝업)</h4>
                                        <p className="text-sm text-indigo-800 dark:text-indigo-400/80 mt-1">
                                            결과 화면(Assessment) 하단에 플로팅되는 버튼입니다. 누르면 원장님께서 학생/학부모 상담 시 사용할 세부 지침과 체크리스트(과목별 전략 포함)가 표시되며, 체크한 항목들은 인쇄 및 히스토리 저장이 가능합니다.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                                    <span className="text-2xl mt-1">🔒 / ⚙️</span>
                                    <div>
                                        <h4 className="font-bold">설정 버튼 (Admin Config)</h4>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                            우측 상단(자물쇠) 또는 결과지 화면(톱니바퀴)에 위치합니다. 비밀번호(기본: admin)를 입력하여 접근하며, 진단 알고리즘의 민감도를 조절하거나 '과목별 전략' 프리셋을 추가/수정할 수 있는 시스템 코어 설정입니다.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'guide' && (
                        <div className="space-y-8">
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 p-4 rounded-xl">
                                <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">
                                    이 가이드는 NBASS 앱을 처음 접하시는 원장님과 전문가 선생님을 위해, 가장 표준적인 상담 워크플로우를 안내합니다.
                                </p>
                            </div>

                            {/* Steps */}
                            <div className="relative border-l-2 border-indigo-200 dark:border-indigo-800 ml-3 md:ml-6 space-y-10 pb-4">
                                
                                {/* Step 1 */}
                                <div className="relative pl-8">
                                    <div className="absolute w-8 h-8 bg-indigo-600 text-white font-bold rounded-full flex items-center justify-center -left-[17px] top-0 shadow-lg border-4 border-white dark:border-slate-900">
                                        1
                                    </div>
                                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">학생 등록 및 검사 시작</h4>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 mb-3">
                                        가장 먼저 <b>Dashboard</b>에서 <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded font-bold text-xs">Start New Assessment</span> 버튼을 누릅니다.
                                    </p>
                                    <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-400 space-y-1 ml-2">
                                        <li>학생의 이름과 나이를 입력합니다.</li>
                                        <li>원내에 구비된 장비 환경에 따라 <b>BrainBody</b>(뇌파+자율신경) 모드인지 <b>Portable</b>(맥파 전용) 모드인지 선택하세요.</li>
                                    </ul>
                                </div>

                                {/* Step 2 */}
                                <div className="relative pl-8">
                                    <div className="absolute w-8 h-8 bg-indigo-600 text-white font-bold rounded-full flex items-center justify-center -left-[17px] top-0 shadow-lg border-4 border-white dark:border-slate-900">
                                        2
                                    </div>
                                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">생체 데이터 입력</h4>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 mb-3">
                                        기기를 통해 측정된 결과를 화면의 입력 폼에 기입합니다.
                                    </p>
                                    <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-400 space-y-1 ml-2">
                                        <li><b>HRV(자율신경):</b> 교감/부교감 신경 수치, 스트레스 및 피로도 수치를 입력합니다.</li>
                                        <li><b>EEG(뇌파):</b> BrainBody 모드의 경우, 뇌파 대역별 점수(알파, 베타 등)를 입력합니다.</li>
                                        <li>보다 정밀한 진단이 필요하다면 설문 탭(부신피로도, 수면의 질 등)도 함께 진행하시면 결과의 정확도가 크게 올라갑니다.</li>
                                    </ul>
                                </div>

                                {/* Step 3 */}
                                <div className="relative pl-8">
                                    <div className="absolute w-8 h-8 bg-indigo-600 text-white font-bold rounded-full flex items-center justify-center -left-[17px] top-0 shadow-lg border-4 border-white dark:border-slate-900">
                                        3
                                    </div>
                                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">결과 확인 (Assessment View)</h4>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 mb-3">
                                        데이터 입력 후 'Next(결과 보기)'를 누르면 AI가 학생의 상태를 분류합니다.
                                    </p>
                                    <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-400 space-y-1 ml-2">
                                        <li>레이더 차트와 스트레스 게이지를 통해 현재 상태의 시각적 밸런스를 확인합니다.</li>
                                        <li>AI가 도출한 <b>기본 처방전(AI 학습 스케줄, 마음 처방전 등)</b>을 학부모님께 설명해 드립니다.</li>
                                    </ul>
                                </div>

                                {/* Step 4 */}
                                <div className="relative pl-8">
                                    <div className="absolute w-8 h-8 bg-indigo-600 text-white font-bold rounded-full flex items-center justify-center -left-[17px] top-0 shadow-lg border-4 border-white dark:border-slate-900">
                                        4
                                    </div>
                                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">전문가 심층 가이드 활용</h4>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 mb-3">
                                        우측 하단의 <b>👨‍⚕️ Expert Guide</b> 버튼을 누르면 전문가 전용 인터페이스가 열립니다.
                                    </p>
                                    <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-400 space-y-1 ml-2">
                                        <li>해당 학생의 유형(예: 번아웃, 수면부족)에 맞는 디테일한 코칭 방법론과 상담 멘트를 제공합니다.</li>
                                        <li>가이드 항목 중 해당 학생에게 적용할 항목의 좌측 <b>체크박스</b>를 선택합니다.</li>
                                        <li>과목별 디테일한 전략이 필요하다면 체크리스트 중 '과목별 전략 설정' 등을 활용하세요.</li>
                                        <li>선택한 항목은 자동으로 시스템(History)에 저장되어 <b>다음 검사 시 [이전 처방] 뱃지</b>로 표시되므로 추적 관리가 매우 용이합니다.</li>
                                    </ul>
                                </div>

                                {/* Step 5 */}
                                <div className="relative pl-8">
                                    <div className="absolute w-8 h-8 bg-indigo-600 text-white font-bold rounded-full flex items-center justify-center -left-[17px] top-0 shadow-lg border-4 border-white dark:border-slate-900">
                                        5
                                    </div>
                                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">리포트 인쇄 및 관리</h4>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                                        상담이 성공적으로 마무리되었다면 화면 최상단의 <b>[인쇄 및 PDF 저장]</b> 버튼을 눌러 결과지를 제공합니다.
                                        또한 <b>History</b> 메뉴로 이동하시면 방금 진행한 학생의 데이터를 언제든지 불러오고 <b>과거 처방 내역</b>과 <b>건강 호전 트렌드</b>를 분석할 수 있습니다.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
