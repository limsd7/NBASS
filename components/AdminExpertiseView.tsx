import React, { useState } from 'react';

interface AdminExpertiseViewProps {
    onBack: () => void;
    studentName?: string;
    studentId?: string;
}

export const AdminExpertiseView: React.FC<AdminExpertiseViewProps> = ({ onBack, studentName = "", studentId = "" }) => {
    const [activeTab, setActiveTab] = useState<'intro' | 'prestudy' | 'strategy' | 'exercise' | 'summary'>('intro');

    const tabs = [
        { id: 'intro', label: '🗣️ Opening', color: 'bg-slate-800 text-white' },
        { id: 'prestudy', label: '⚡ 1. 학습 전(Pre-Study)', color: 'bg-emerald-600 text-white' },
        { id: 'strategy', label: '🧠 2. 학습 전략(Main)', color: 'bg-blue-600 text-white' },
        { id: 'exercise', label: '🏃 3. 운동 전략(Body)', color: 'bg-orange-500 text-white' },
        { id: 'summary', label: '💎 Summary', color: 'bg-slate-700 text-white' },
    ] as const;

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500 min-h-screen">
            {/* Top Navigation Bar - Sticky for easy access */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 py-4 -mx-4 px-4 md:-mx-8 md:px-8 no-print flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto hidescroll">
                    <button onClick={onBack} className="flex-shrink-0 flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold transition-colors pr-4 border-r border-slate-200 mr-2">
                        <span>←</span> Back
                    </button>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all shadow-sm ${activeTab === tab.id ? tab.color + ' ring-2 ring-offset-1 ring-slate-300 scale-105' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                <button onClick={() => window.print()} className="flex-shrink-0 px-4 py-2 bg-slate-900 text-white rounded-lg font-bold shadow hover:bg-slate-800 transition-all text-sm">
                    🖨️ Print All
                </button>
            </div>

            {/* Global Header (Compact) */}
            <div className="text-center space-y-2 no-print">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-black tracking-widest uppercase">
                    <span>Expert Consultant Only</span>
                    <span className="w-1 h-1 bg-indigo-400 rounded-full"></span>
                    <span>{studentName}</span>
                </div>
            </div>

            {/* Print Only Header */}
            <div className="hidden print:block text-center space-y-4 mb-8">
                <div className="inline-block px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-black tracking-widest uppercase mb-2">
                    Expert Consultant Only
                </div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">수험생 3-Step 전문 컨설팅 매뉴얼</h2>
                <p className="text-slate-500 max-w-2xl mx-auto">
                    본 자료는 NBASS 관리자 전용 상담 가이드입니다. 학생({studentName})에게 [학습 전 - 학습 중 - 신체 관리]의 3단계 전문 솔루션을 제공하십시오.
                </p>
            </div>

            {/* Content Sections - Controlled by Tabs but ALL visible on print */}

            {/* 1. Opening Ment */}
            <div className={activeTab === 'intro' ? 'block animate-in fade-in slide-in-from-bottom-4 duration-300' : 'hidden print:block'}>
                <div className="bg-slate-900 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden print-avoid-break">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-20"></div>
                    <div className="relative z-10">
                        <h3 className="text-indigo-400 font-black text-sm uppercase tracking-widest mb-6">Opening Ment</h3>
                        <blockquote className="text-2xl font-bold leading-relaxed italic">
                            "{studentName} 학생, 성적의 차이는 '시간'이 아니라 <span className="text-indigo-400">'뇌를 사용하는 밀도'</span>에서 결정됩니다. <br />
                            무조건 열심히 하는 것이 아니라, <span className="text-indigo-400 underline decoration-indigo-500 underline-offset-8">뇌가 공부할 수 있는 최적의 상태</span>를 만들어야 합니다. <br />
                            오늘, 당신의 뇌를 100% 활용할 수 있는 <span className="text-indigo-400 text-3xl font-black not-italic">**'뇌과학 기반 3-Step 솔루션'**</span>을 제안합니다."
                        </blockquote>
                    </div>
                </div>
                <div className="text-center mt-8 text-slate-400 text-sm no-print">
                    👇 탭을 눌러 다음 단계로 진행하세요.
                </div>
            </div>

            {/* 2. Step 1: Pre-Study Routine */}
            <div className={activeTab === 'prestudy' ? 'block animate-in fade-in slide-in-from-bottom-4 duration-300' : 'hidden print:block'}>
                <div className="print-page-break space-y-8 bg-white p-10 rounded-3xl border-2 border-slate-100 shadow-xl">
                    <div className="flex items-center justify-between border-b pb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-8 bg-emerald-600 rounded-full"></div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">⚡ [Step 1] 학습 전 전략: 뇌를 깨우는 5분 예열</h3>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Brain Reset Protocol</p>
                            <p className="text-sm font-black text-emerald-600">5-Minute Miracle</p>
                        </div>
                    </div>

                    <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                        <h4 className="font-bold text-emerald-800 mb-2">💡 왜 '시작 전 5분'인가?</h4>
                        <p className="text-sm text-emerald-700">
                            학습 시작 전 5분은 그날의 집중력 밀도를 결정하는 <b>'골든 타임'</b>입니다. 뇌는 예열 없이 고도의 흐름(Flow)에 진입할 수 없습니다.
                            이 루틴의 목적은 <b>전두엽을 활성화</b>하여 학습에만 자원을 집중시키는 것입니다.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                <h4 className="font-black text-slate-900 mb-2 text-lg flex items-center gap-2">
                                    <span className="bg-slate-200 text-slate-700 w-6 h-6 rounded flex items-center justify-center text-xs">1</span>
                                    데스크 셋업 (1분): 시각적 노이즈 제거
                                </h4>
                                <div className="text-sm text-slate-600 space-y-3">
                                    <p className="font-bold text-emerald-600">"책상은 공부하는 무대입니다."</p>
                                    <ul className="space-y-2 list-disc pl-4 text-xs">
                                        <li><b>학생:</b> 지금 공부할 책 1권, 노트, 필기구, 물 외엔 전부 치우세요. (Single-Tasking)</li>
                                        <li><b>학부모:</b> 아이가 앉기 전 간식 그릇이나 장난감을 정리하도록 격려해 주세요. 정돈된 환경은 정서적 안정과 직결됩니다.</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                <h4 className="font-black text-slate-900 mb-2 text-lg flex items-center gap-2">
                                    <span className="bg-slate-200 text-slate-700 w-6 h-6 rounded flex items-center justify-center text-xs">2</span>
                                    4-7-8 심호흡 (2분): 자율신경 조절
                                </h4>
                                <div className="text-sm text-slate-600 space-y-3">
                                    <p className="font-bold text-emerald-600">"과각성 긴장에서 안정 이완 상태로 전환"</p>
                                    <ul className="space-y-2 list-disc pl-4 text-xs">
                                        <li><b>방법:</b> 코로 4초 흡입 → 7초 정지 → 입으로 8초 배출.</li>
                                        <li><b>효과:</b> 뇌로 산소 공급량 증가, 부교감 신경 활성화로 기억력 향상.</li>
                                        <li><b>학부모:</b> 시험 전 긴장한 아이와 함께 1분만 호흡해 보세요. 부모의 차분함이 아이의 지지대가 됩니다.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                <h4 className="font-black text-slate-900 mb-2 text-lg flex items-center gap-2">
                                    <span className="bg-slate-200 text-slate-700 w-6 h-6 rounded flex items-center justify-center text-xs">3</span>
                                    마이크로 목표 설정 (1분): 실행 의도 구체화
                                </h4>
                                <div className="text-sm text-slate-600 space-y-3">
                                    <p className="font-bold text-emerald-600">"목표를 잘게 쪼개면 게임이 됩니다."</p>
                                    <ul className="space-y-2 list-disc pl-4 text-xs">
                                        <li><b>학생:</b> "영어 공부" (X) → "20분간 단어 15개 외우고 시험 보기" (O). 구체적이어야 뇌가 움직입니다.</li>
                                        <li><b>학부모:</b> "오늘 뭐 하니?" (X) → "오늘 가장 먼저 끝낼 '작은 목표' 하나는 뭐니?" (O).</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                <h4 className="font-black text-slate-900 mb-2 text-lg flex items-center gap-2">
                                    <span className="bg-slate-200 text-slate-700 w-6 h-6 rounded flex items-center justify-center text-xs">4</span>
                                    디지털 디톡스 (필수): 환경 통제
                                </h4>
                                <div className="text-sm text-slate-600 space-y-3">
                                    <p className="font-bold text-emerald-600">"의지력이 아닌 환경으로 이기세요."</p>
                                    <ul className="space-y-2 list-disc pl-4 text-xs">
                                        <li><b>학생:</b> 스마트폰은 '다른 방'이나 거실에. 물리적 격리가 답입니다.</li>
                                        <li><b>학부모:</b> '집중 시간'에는 가족 모두가 스마트폰 사용을 자제하는 분위기를 만들어 주세요.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-emerald-900 text-white p-6 rounded-2xl mt-8 text-center italic border border-emerald-800 shadow-inner">
                        <span className="text-2xl mr-2">💡</span>
                        "습관은 의지력이 아니라 **'반복되는 루틴'**에서 나옵니다. 이번 일주일은 공부 양보다 **'책상에 앉아 5분 루틴을 지켰는가'**에만 집중해 보세요."
                    </div>
                </div>
            </div>

            {/* 3. Step 2: Learning Strategy (Main) */}
            <div className={activeTab === 'strategy' ? 'block animate-in fade-in slide-in-from-bottom-4 duration-300' : 'hidden print:block'}>
                <div className="print-page-break space-y-8 bg-white p-10 rounded-3xl border-2 border-slate-100 shadow-xl">
                    <div className="flex items-center gap-3 border-b pb-6">
                        <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">🧠 [Step 2] 학습 전략: 뇌 과학 기반 초집중법</h3>
                    </div>

                    <div className="space-y-8">
                        {/* Section 1 */}
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                            <h4 className="flex items-center gap-2 text-lg font-black text-blue-700 mb-4">
                                <span className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center text-sm">1</span>
                                포모도로 2.0: 몰입과 회복의 메커니즘
                            </h4>
                            <p className="text-slate-600 mb-4 text-sm">단순히 시간을 끊는 것이 아니라, 뇌의 고도의 집중력을 유지하는 '리듬'을 만드는 과정입니다.</p>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="bg-white p-4 rounded-xl border border-slate-100">
                                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Student Guide</p>
                                    <h5 className="font-bold text-slate-800 text-sm mb-2">50분 몰입 + 10분 Brain-Off</h5>
                                    <p className="text-xs text-slate-600 leading-relaxed">
                                        타이머를 보되 남은 시간을 확인하지 마세요. 10분 휴식 때는 스마트폰(숏폼, 게임) 절대 금지!
                                        창밖 보기, 멍때리기만 허용됩니다. (뇌가 정보를 정리할 시간)
                                    </p>
                                </div>
                                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                                    <p className="text-xs font-bold text-blue-400 uppercase mb-1">Parent Guide</p>
                                    <p className="text-xs text-blue-800 leading-relaxed">
                                        휴식 시간에 아이에게 말을 걸거나 심부름을 시키지 마세요. 뇌의 <b>'디폴트 모드 네트워크(DMN)'</b>가 활성화되어야 기억이 저장됩니다.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Section 2 */}
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                            <h4 className="flex items-center gap-2 text-lg font-black text-blue-700 mb-4">
                                <span className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center text-sm">2</span>
                                능동적 회상 (Active Recall): 인출 효과 극대화
                            </h4>
                            <p className="text-slate-600 mb-4 text-sm">"공부했다"는 기분과 "실제로 안다"는 사실을 엄격히 구분하는 훈련입니다.</p>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="bg-white p-4 rounded-xl border border-slate-100">
                                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Student Guide</p>
                                    <h5 className="font-bold text-slate-800 text-sm mb-2">백지 복습법 & 페이먼 기법</h5>
                                    <p className="text-xs text-slate-600 leading-relaxed">
                                        책을 덮고 A4 용지에 핵심을 그리세요. 초등학생 동생에게 설명하듯 말해보세요. 막히는 부분이 진짜 공부할 곳입니다.
                                    </p>
                                </div>
                                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                                    <p className="text-xs font-bold text-blue-400 uppercase mb-1">Parent Guide</p>
                                    <p className="text-xs text-blue-800 leading-relaxed">
                                        "공부 다 했니?" 대신 <b>"오늘 배운 것 중 딱 하나만 엄마에게 쉽게 설명해 줄래?"</b>라고 요청하세요. 최고의 복습입니다.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Section 3 */}
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                            <h4 className="flex items-center gap-2 text-lg font-black text-blue-700 mb-4">
                                <span className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center text-sm">3</span>
                                간격 반복 (Spaced Repetition): 망각 곡선 이기기
                            </h4>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="bg-white p-4 rounded-xl border border-slate-100">
                                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Student Guide</p>
                                    <h5 className="font-bold text-slate-800 text-sm mb-2">1-3-7-30 법칙</h5>
                                    <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4">
                                        <li>당일(10분): 가볍게 훑기</li>
                                        <li>3일 후(20분): 문제 풀기</li>
                                        <li>1주일 후(30분): 오답 노트</li>
                                        <li>한 달 후: 전체 구조 재확인</li>
                                    </ul>
                                </div>
                                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                                    <p className="text-xs font-bold text-blue-400 uppercase mb-1">Parent Guide</p>
                                    <p className="text-xs text-blue-800 leading-relaxed">
                                        진도 체크보다 <b>"지난주 어려워했던 단원은 이제 좀 익숙해졌니?"</b>라며 누적 복습을 챙겨주세요.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Section 4 */}
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                            <h4 className="flex items-center gap-2 text-lg font-black text-blue-700 mb-4">
                                <span className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center text-sm">4</span>
                                우선순위 3법칙 (The Big 3)
                            </h4>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="bg-white p-4 rounded-xl border border-slate-100">
                                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Student Guide</p>
                                    <h5 className="font-bold text-slate-800 text-sm mb-2">Eat that Frog (개구리 먹기)</h5>
                                    <p className="text-xs text-slate-600 leading-relaxed">
                                        가장 하기 싫고 머리 아픈 과제를 첫 번째 루틴으로 처리하세요. 핵심 3가지만 완수해도 성공입니다.
                                    </p>
                                </div>
                                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                                    <p className="text-xs font-bold text-blue-400 uppercase mb-1">Parent Guide</p>
                                    <p className="text-xs text-blue-800 leading-relaxed">
                                        3가지를 마쳤다면 진심으로 인정해 주세요. 더 시키려는 유혹을 참아야 아이가 '성취감'을 느낍니다.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-blue-900 text-white p-6 rounded-2xl mt-8 text-center italic border border-blue-800 shadow-inner">
                        <span className="text-2xl mr-2">💡</span>
                        "공부는 엉덩이로 하는 것이 아니라, 전두엽의 관리 능력으로 하는 것입니다. 이 매뉴얼대로 2주일만 실천하면 뇌가 '공부 최적화 상태'로 재배선됩니다."
                    </div>
                </div>
            </div>

            {/* 4. Step 3: Exercise Strategy (Body) */}
            <div className={activeTab === 'exercise' ? 'block animate-in fade-in slide-in-from-bottom-4 duration-300' : 'hidden print:block'}>
                <div className="print-page-break space-y-8 bg-white p-10 rounded-3xl border-2 border-slate-100 shadow-xl">
                    <div className="flex items-center gap-3 border-b pb-6">
                        <div className="w-2 h-8 bg-orange-500 rounded-full"></div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">🏃 [Step 3] 운동 전략: 뇌를 깨우는 신체 최적화</h3>
                    </div>

                    <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100 mb-6">
                        <h4 className="font-bold text-orange-800 mb-2">💡 운동은 뇌를 위한 최고의 영양제</h4>
                        <p className="text-sm text-orange-700">
                            운동은 몸을 만드는 것이 아니라, 뇌세포를 생성하고 집중력을 유지하는 '에너지 탱크'를 확장하는 과정입니다. 성적은 엉덩이가 아니라 체력에서 나옵니다.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Ex 1 */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-orange-100 rounded-bl-full -mr-4 -mt-4"></div>
                            <h4 className="font-black text-slate-900 mb-2 text-lg relative z-10">1. 아침 공복 산책 (20분)</h4>
                            <p className="text-xs font-bold text-orange-500 mb-3 relative z-10">Circadian Rhythm Setting</p>
                            <ul className="text-sm text-slate-600 space-y-2 list-disc pl-4 relative z-10">
                                <li><b>학생:</b> 기상 후 1시간 이내에 20분만 걸으세요. 세로토닌이 분비되어 낮 집중력을 높이고 밤에는 멜라토닌이 되어 숙면을 부릅니다.</li>
                                <li><b>학부모:</b> 깨우려 싸우지 말고 "함께 15분만 걷자"고 하세요. 가장 효과적인 우울감 방지 처방전입니다.</li>
                            </ul>
                        </div>

                        {/* Ex 2 */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-orange-100 rounded-bl-full -mr-4 -mt-4"></div>
                            <h4 className="font-black text-slate-900 mb-2 text-lg relative z-10">2. NEAT 운동 (1시간 1분)</h4>
                            <p className="text-xs font-bold text-orange-500 mb-3 relative z-10">Brain Blood Flow Pumping</p>
                            <ul className="text-sm text-slate-600 space-y-2 list-disc pl-4 relative z-10">
                                <li><b>학생:</b> 1시간마다 일어나서 스쿼트 15회! 하체 근육이 혈액을 뇌로 밀어 올려 '브레인 포그'를 없앱니다.</li>
                                <li><b>학부모:</b> 오래 앉아만 있다고 좋아하지 마세요. 1시간마다 물을 마시거나 스트레칭을 하도록 유도해야 뇌가 숨을 쉽니다.</li>
                            </ul>
                        </div>

                        {/* Ex 3 */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-orange-100 rounded-bl-full -mr-4 -mt-4"></div>
                            <h4 className="font-black text-slate-900 mb-2 text-lg relative z-10">3. 고강도 인터벌 HIIT (주 3회)</h4>
                            <p className="text-xs font-bold text-orange-500 mb-3 relative z-10">BDNF (Brain Fertilizer)</p>
                            <ul className="text-sm text-slate-600 space-y-2 list-disc pl-4 relative z-10">
                                <li><b>학생:</b> 딱 15분, 숨이 찰 정도로 뛰세요(1분) + 걷기(1분). 운동 직후 2시간은 뇌가 가장 유연한 상태라 어려운 과목 공부에 딱입니다.</li>
                                <li><b>학부모:</b> 15분의 고강도 운동은 시간 낭비가 아닙니다. 이후 3시간의 효율을 결정하는 투자입니다.</li>
                            </ul>
                        </div>

                        {/* Ex 4 */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-orange-100 rounded-bl-full -mr-4 -mt-4"></div>
                            <h4 className="font-black text-slate-900 mb-2 text-lg relative z-10">4. 정적 스트레칭 (취침 전)</h4>
                            <p className="text-xs font-bold text-orange-500 mb-3 relative z-10">Relaxation & Pain Relief</p>
                            <ul className="text-sm text-slate-600 space-y-2 list-disc pl-4 relative z-10">
                                <li><b>학생:</b> 잠들기 10분 전, 승모근과 장요근을 풀어주세요. 부교감 신경이 활성화되어 '꿀잠'을 잡니다.</li>
                                <li><b>학부모:</b> 아이의 자세가 무너지면 잔소리 대신 폼롤러를 건네세요. 통증이 없어야 짜증이 줄어듭니다.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* 5. Summary (4 Commandments) */}
            <div className={activeTab === 'summary' ? 'block animate-in fade-in slide-in-from-bottom-4 duration-300' : 'hidden print:block'}>
                <div className="print-page-break bg-gradient-to-br from-indigo-900 to-indigo-800 p-12 rounded-[3rem] text-white shadow-2xl space-y-8">
                    <div className="text-center space-y-2">
                        <h3 className="text-3xl font-black">⚡ [요약] 고효율 공부법 4계명</h3>
                        <p className="text-indigo-200">"졸린 눈 비비며 3시간 앉아있는 것보다, 이 방법으로 1시간 하는 게 낫습니다."</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white/10 p-6 rounded-3xl border border-white/10 backdrop-blur-md">
                            <h4 className="font-bold text-lg mb-2">1. 50분 공부 + 10분 '뇌 휴식'</h4>
                            <p className="text-sm text-indigo-100">휴식 땐 폰 금지! 멍때려야 뇌가 기억합니다.</p>
                        </div>
                        <div className="bg-white/10 p-6 rounded-3xl border border-white/10 backdrop-blur-md">
                            <h4 className="font-bold text-lg mb-2">2. 오후 15분 '커피 냅'</h4>
                            <p className="text-sm text-indigo-100">커피 마시고 15분 쪽잠 = 천연 각성제.</p>
                        </div>
                        <div className="bg-white/10 p-6 rounded-3xl border border-white/10 backdrop-blur-md">
                            <h4 className="font-bold text-lg mb-2">3. 자기 전 20분 암기</h4>
                            <p className="text-sm text-indigo-100">침대맡에 단어장 두기. 최고의 암기 시간. </p>
                        </div>
                        <div className="bg-white/10 p-6 rounded-3xl border border-white/10 backdrop-blur-md">
                            <h4 className="font-bold text-lg mb-2">4. 바이오리듬 과목 배치</h4>
                            <p className="text-sm text-indigo-100">오전은 논리(수학), 오후는 단순(암기/듣기).</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
