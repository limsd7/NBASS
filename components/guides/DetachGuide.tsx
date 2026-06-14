import React from 'react';

/**
 * Detach Guide Component
 * 결과와 과정 분리 (Detach) 상세 가이드 - 새 브라우저 창에서 표시
 */

export const openDetachGuide = () => {
    const today = new Date().toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const guideHTML = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>결과와 과정 분리 (Detach) - 완전 가이드</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700;900&display=swap');
        
        body { 
            font-family: 'Noto Sans KR', sans-serif; 
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important;
            margin: 0;
            padding: 0;
            background: #f1f5f9;
        }
        
        /* Page Layout */
        .page {
            width: 210mm !important;
            min-height: 297mm !important;
            margin: 0 auto 20mm;
            padding: 10mm !important;
            box-sizing: border-box;
            background-color: #f1f5f9 !important;
            display: flex !important;
            flex-direction: column !important;
            position: relative;
            page-break-after: always !important;
        }
        
        .report-card {
            background-color: white !important;
            border-radius: 0.75rem;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1) !important;
            border-top: 8px solid #be123c !important; /* Rose Red for Detach */
            padding: 2rem !important;
            flex: 1;
            display: flex;
            flex-direction: column;
        }
        
        /* Print Optimization */
        @media print {
            @page {
                size: A4;
                margin: 0;
            }
            
            html, body {
                margin: 0 !important;
                padding: 0 !important;
                background-color: white !important;
            }
            
            .page {
                margin: 0 !important;
                padding: 0 !important;
                border: none !important;
                background-color: white !important;
                page-break-inside: avoid !important;
                min-height: 297mm !important;
                page-break-after: always !important;
            }
            
            .report-card {
                box-shadow: none !important;
                border: none !important;
                border-top: 8px solid #be123c !important;
                background-color: white !important;
                padding: 10mm !important;
                min-height: 297mm !important;
                page-break-inside: avoid !important;
            }
            
            .no-print {
                display: none !important;
            }
            
            h2, h3, h4, .content-block {
                page-break-inside: avoid !important;
                page-break-after: avoid !important;
            }
            
            * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
        }
        
        .floating-print-btn {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #1e293b;
            color: white;
            padding: 12px 24px;
            border-radius: 9999px;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
            border: none;
            z-index: 1000;
            transition: all 0.2s;
        }
        
        .floating-print-btn:hover {
            transform: scale(1.05);
            background: #0f172a;
        }
    </style>
</head>
<body>
    <button class="floating-print-btn no-print" onclick="window.print()">🖨️ 인쇄 / PDF 저장</button>
    
    <!-- Page 1: Theory & Step 1 -->
    <div class="page">
        <div class="report-card">
            <!-- Header -->
            <div class="border-b-2 border-rose-700 pb-4 mb-6">
                <div class="flex justify-between items-start">
                    <div>
                        <div class="text-rose-700 font-bold text-xs tracking-widest uppercase mb-2">Performance Goal Strategy</div>
                        <h1 class="text-3xl font-black text-slate-800 mb-2">결과와 과정 분리 (Detach)</h1>
                        <p class="text-slate-600 text-sm">불안을 원천 차단하는 스포츠 심리학의 '수행 목표 집중' 전략</p>
                    </div>
                    <div class="text-right">
                        <div class="text-xs text-slate-500">작성일</div>
                        <div class="text-sm font-bold text-slate-700">${today}</div>
                    </div>
                </div>
            </div>

            <!-- Content -->
            <section class="flex-1">
                <!-- Introduction -->
                <div class="bg-rose-50 p-4 rounded-lg border-l-4 border-rose-500 mb-6 italic text-sm text-rose-900 leading-relaxed content-block">
                    <strong>결과와 과정의 분리(Detachment from Outcomes)</strong>는 스포츠 심리학에서 프로 선수들이 극심한 압박감을 이겨내기 위해 사용하는 <strong>'수행 목표(Performance Goal) 집중 전략'</strong>입니다. 수험생에게는 '어려움' 등급인 만큼 심리적 근력이 필요하지만, 마스터하면 불안을 원천 차단할 수 있는 가장 강력한 무기가 됩니다.
                </div>

                <!-- Section 1 -->
                <h2 class="text-2xl font-bold text-slate-800 mb-4 flex items-center">
                    <span class="w-2 h-8 bg-blue-600 mr-3"></span>
                    1. 왜 효과적인가? (이론적 근거)
                </h2>
                
                <div class="space-y-4 mb-8">
                    <div class="bg-white border border-slate-200 p-5 rounded-lg shadow-sm content-block">
                        <h3 class="text-lg font-bold text-slate-800 mb-2">① 통제 소재 (Locus of Control)</h3>
                        <p class="text-sm text-slate-600 leading-relaxed">
                            인간은 상황을 스스로 통제하고 있다고 느낄 때 스트레스가 낮아집니다. '수능 점수'나 '합격'은 타인의 성적, 난이도 등 외부 요인에 좌우되지만, <strong>'지금 3문제를 푸는 것'은 100% 내 의지로 결정</strong>할 수 있습니다. 통제 가능한 것에 집중할 때 뇌의 불안 회로가 안정됩니다.
                        </p>
                    </div>

                    <div class="bg-white border border-slate-200 p-5 rounded-lg shadow-sm content-block">
                        <h3 class="text-lg font-bold text-slate-800 mb-2">② 프로세스 지향적 사고 (Process-Oriented Thinking)</h3>
                        <p class="text-sm text-slate-600 leading-relaxed">
                            뇌가 '결과'라는 먼 미래에 가 있으면 현재의 학습 효율은 떨어집니다. 이를 현재의 '작업'으로 가져오면 뇌는 멀티태스킹(공부+걱정)을 중단하고 <strong>단일 작업(공부)에만 몰입(Flow)</strong>하게 됩니다.
                        </p>
                    </div>
                    
                    <div class="bg-white border border-slate-200 p-5 rounded-lg shadow-sm content-block">
                        <h3 class="text-lg font-bold text-slate-800 mb-2">③ 자기 효능감 (Self-Efficacy)</h3>
                        <p class="text-sm text-slate-600 leading-relaxed">
                            결과는 성공과 실패라는 두 가지 선택지만 주지만, 과정은 매 순간 '성공'의 경험을 줍니다. "오늘 계획한 10페이지를 다 읽었다"는 작은 성취감이 쌓여 <strong>"나는 할 수 있다"는 강력한 내적 확신</strong>을 만듭니다.
                        </p>
                    </div>
                </div>

                <!-- Section 2: Implementation -->
                <h2 class="text-2xl font-bold text-slate-800 mb-5 flex items-center">
                    <span class="w-2 h-8 bg-rose-600 mr-3"></span>
                    2. 효과적으로 수행하는 방법 (The Implementation)
                </h2>
                <p class="text-sm text-slate-600 mb-4">결과에서 과정을 분리하기 위해서는 <strong>'언어의 전환'</strong>과 <strong>'목표의 파편화'</strong>가 필요합니다.</p>

                <div class="space-y-4 mb-6 content-block">
                    <!-- Step 1 -->
                    <div class="bg-white border-l-4 border-rose-400 p-4 shadow-sm rounded-r-lg">
                        <h3 class="text-lg font-bold text-rose-800 mb-2">Step 1: 결과 중심 목표를 과정 중심 목표로 번역하기</h3>
                        <p class="text-xs text-rose-700 mb-3">단순히 "열심히 하자"가 아니라, 명사형 목표를 동사형 행동으로 바꿉니다.</p>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div class="bg-rose-50 p-3 rounded opacity-70">
                                <div class="font-bold text-rose-800">❌ 결과 (Outcome)</div>
                                <div class="text-xs text-rose-900">"이번 모의고사에서 수학 1등급 받기"</div>
                                <div class="text-[10px] text-rose-500 font-bold mt-1">(통제 불가)</div>
                            </div>
                            <div class="bg-emerald-50 p-3 rounded">
                                <div class="font-bold text-emerald-800">✅ 과정 (Process)</div>
                                <div class="text-xs text-emerald-900">"오늘 수학 킬러 문항 3개를 풀고 오답 논리를 한 줄로 정리하기"</div>
                                <div class="text-[10px] text-emerald-500 font-bold mt-1">(통제 가능)</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Step 2 -->
                    <div class="bg-white border-l-4 border-amber-400 p-4 shadow-sm rounded-r-lg">
                        <h3 class="text-lg font-bold text-amber-800 mb-2">Step 2: '이프 덴(If-Then)' 플래닝</h3>
                        <p class="text-xs text-amber-700 mb-3">불안이 엄습할 때를 대비한 행동 매뉴얼을 만듭니다.</p>
                        <div class="bg-amber-50 p-3 rounded text-sm text-amber-900 font-medium">
                            "만약 '시험 망치면 어떡하지?'라는 생각이 들면(If), <br>
                            즉시 '지금 보고 있는 단어 5개 외우기'에 집중한다(Then)."
                        </div>
                    </div>

                    <!-- Step 3 -->
                    <div class="bg-white border-l-4 border-purple-400 p-4 shadow-sm rounded-r-lg">
                        <h3 class="text-lg font-bold text-purple-800 mb-2">Step 3: 결과에 대한 '유예' 선언</h3>
                        <p class="text-xs text-purple-700 mb-3">결과에 대한 평가는 특정 시점으로 미뤄버립니다.</p>
                        <div class="bg-purple-50 p-3 rounded text-sm text-purple-900 font-medium">
                            "내 성적이 어떻게 될지는 수능 날 오후 5시에 고민하자. <br>
                            그전까지 성적에 대한 고민은 내 업무 범위가 아니다."
                        </div>
                    </div>
                </div>

            </section>
            
            <!-- Footer -->
            <div class="mt-auto pt-4 border-t border-slate-200 flex justify-between text-[10px] text-slate-400 font-medium">
                <p>© 2026 Mind-Body Connect. Evidence-Based Learning Strategies.</p>
                <p class="uppercase tracking-widest">PAGE 1</p>
            </div>
        </div>
    </div>

    <!-- Page 2: Simulation & Paradox -->
    <div class="page">
        <div class="report-card">
            <div class="border-b-2 border-slate-200 pb-3 mb-6">
                <div class="text-rose-700 font-bold text-xs tracking-widest uppercase">Mental Anchoring Strategy</div>
                <h1 class="text-2xl font-black text-slate-800">결과와 과정 분리 (Detach)</h1>
            </div>

            <section class="flex-1">
                <!-- Section 3: Simulation -->
                <h2 class="text-2xl font-bold text-slate-800 mb-5 flex items-center">
                    <span class="w-2 h-8 bg-purple-600 mr-3"></span>
                    3. 수험생을 위한 시뮬레이션: "독서실 책상 앞"
                </h2>
                
                <div class="bg-slate-50 p-6 rounded-xl border border-slate-200 content-block mb-8">
                    <div class="space-y-6">
                        <!-- Phase 1 -->
                        <div class="flex gap-4">
                            <div class="w-8 h-8 rounded-full bg-rose-100 text-rose-600 font-bold flex items-center justify-center shrink-0">1</div>
                            <div>
                                <h4 class="font-bold text-rose-700 text-sm mb-1">불안 발동</h4>
                                <p class="text-sm text-slate-700 italic">"옆자리 애는 벌써 이 문제집 다 풀었네? 난 왜 이렇게 느리지? 이러다 대학 못 가는 거 아냐?"</p>
                                <p class="text-xs text-rose-400 mt-1">➔ 결과와 비교에 매몰됨</p>
                            </div>
                        </div>

                        <div class="flex justify-center -my-2">
                             <div class="h-6 w-0.5 bg-slate-200"></div>
                        </div>

                        <!-- Phase 2 -->
                        <div class="flex gap-4">
                            <div class="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-bold flex items-center justify-center shrink-0">2</div>
                            <div>
                                <h4 class="font-bold text-indigo-700 text-sm mb-1">분리(Detach) 시도</h4>
                                <p class="text-sm text-slate-700 italic">"대학 합격 여부는 지금 결정되는 게 아니다. 내가 지금 결정할 수 있는 건 <strong>'다음 지문의 첫 문장을 읽느냐 마느냐'</strong>뿐이다."</p>
                            </div>
                        </div>

                        <div class="flex justify-center -my-2">
                             <div class="h-6 w-0.5 bg-slate-200"></div>
                        </div>

                        <!-- Phase 3 -->
                        <div class="flex gap-4">
                            <div class="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 font-bold flex items-center justify-center shrink-0">3</div>
                            <div>
                                <h4 class="font-bold text-emerald-700 text-sm mb-1">행동 전환</h4>
                                <p class="text-sm text-slate-700 italic">"지금부터 25분간은 '합격'이라는 단어를 머릿속에서 삭제한다. 오직 <strong>'이 지문의 핵심 키워드 3개 찾기'</strong>만 내 세상의 유일한 목표다."</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Section 4: Anxiety Paradox -->
                <h2 class="text-2xl font-bold text-slate-800 mb-5 flex items-center">
                    <span class="w-2 h-8 bg-amber-500 mr-3"></span>
                    4. 이론적 유용함: '불안의 역설' 해결
                </h2>
                
                <div class="bg-amber-50 rounded-xl p-5 border border-amber-100 content-block mb-6">
                    <p class="text-sm text-amber-900 leading-relaxed mb-4">
                        결과에 집착할수록 역설적으로 그 결과를 얻을 확률은 낮아집니다. 이를 <strong>'여키스-도드슨 법칙(Yerkes-Dodson Law)'</strong>으로 설명할 수 있는데, 각성 수준(불안)이 너무 높으면 수행 능력이 급격히 저하되기 때문입니다.
                    </p>
                    <div class="bg-white p-4 rounded-lg border border-amber-200 text-center">
                        <p class="font-bold text-amber-800 text-sm">
                            "과정을 분리하는 것은 각성 수준을 최적의 상태로 유지하여,<br>
                            역설적으로 <span class="text-rose-600">가장 좋은 결과(Outcome)</span>를 낼 수 있는 최상의 컨디션을 만드는 전략입니다."
                        </p>
                    </div>
                </div>

                <div class="bg-slate-800 text-slate-300 p-5 rounded-xl content-block text-sm italic border-l-4 border-yellow-400">
                    "수험생에게 '결과와 과정의 분리'가 가장 어려운 이유는 수능이라는 거대한 '결과'가 인생을 결정지을 것 같은 압박감 때문입니다. 하지만 아이러니하게도 그 압박에서 벗어나 <strong>'오늘의 벽돌 한 장'</strong>에 집중하는 학생이 결국 승리합니다."
                </div>

            </section>

            <div class="mt-auto pt-4 border-t border-slate-200 flex justify-between text-[10px] text-slate-400 font-medium">
                <p>© 2026 Mind-Body Connect. Evidence-Based Learning Strategies.</p>
                <p class="uppercase tracking-widest">PAGE 2</p>
            </div>
        </div>
    </div>

    <!-- Page 3: Student Scenarios -->
    <div class="page">
        <div class="report-card">
            <div class="border-b-2 border-slate-200 pb-3 mb-6">
                <div class="text-rose-700 font-bold text-xs tracking-widest uppercase">Mental Anchoring Strategy</div>
                <h1 class="text-2xl font-black text-slate-800">결과와 과정 분리 (Detach)</h1>
            </div>

            <section class="flex-1">
                 <!-- Student Scenarios -->
                 <h2 class="text-xl font-bold text-slate-800 mb-4 flex items-center">
                    <span class="w-2 h-6 bg-slate-600 mr-3"></span>
                    수험생의 하루에 녹이는 구체적 시나리오
                </h2>

                 <div class="space-y-6 mb-8 content-block">
                    <!-- 1. Re-labeling -->
                    <div class="bg-white border text-sm border-slate-200 rounded-lg p-5 shadow-sm">
                        <h3 class="font-bold text-lg text-indigo-700 mb-3">1. 목표의 언어를 바꾸기 (Re-labeling)</h3>
                        <p class="text-slate-600 mb-3">불안은 '명사'에서 오고, 평온은 '동사'에서 옵니다.</p>
                        
                        <div class="flex flex-col gap-3">
                            <div class="flex gap-3 items-start p-3 bg-red-50 rounded">
                                <span class="bg-red-200 text-red-800 text-xs font-bold px-2 py-1 rounded shrink-0">나쁜 예</span>
                                <div>
                                    <div class="font-bold text-red-800">"수학 1등급 만들기", "비문학 다 맞기"</div>
                                    <div class="text-xs text-red-600 mt-1">문제점: 내 의지만으로 100% 보장할 수 없으므로, 조금만 막혀도 "안 되면 어떡하지?"라는 불안이 즉각 침투합니다.</div>
                                </div>
                            </div>
                            <div class="flex gap-3 items-start p-3 bg-green-50 rounded">
                                <span class="bg-green-200 text-green-800 text-xs font-bold px-2 py-1 rounded shrink-0">좋은 예</span>
                                <div>
                                    <div class="font-bold text-green-800">"기출문제 5개 풀고 오답 근거 적기", "휴대폰 끄기"</div>
                                    <div class="text-xs text-green-600 mt-1">효과: 수행 여부를 내가 100% 통제할 수 있습니다. 체크 표시를 할 때마다 뇌는 <strong>'성공 경험'</strong>을 적립합니다.</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 2. Simulation -->
                    <div class="bg-white border text-sm border-slate-200 rounded-lg p-5 shadow-sm">
                        <h3 class="font-bold text-lg text-indigo-700 mb-3">2. 수험생을 위한 '분리' 시뮬레이션</h3>
                        <div class="space-y-3">
                            <div>
                                <span class="font-bold text-slate-700 block mb-1">상황</span>
                                <p class="text-slate-600 bg-slate-50 p-2 rounded">모의고사 도중, 수학 22번 문제가 도저히 안 풀려 손이 떨릴 때</p>
                            </div>
                            <div>
                                <span class="font-bold text-red-600 block mb-1">결과 인식 (불안)</span>
                                <p class="text-slate-600 bg-red-50 p-2 rounded">"이거 못 풀면 1등급 날아간다. 그러면 원하는 대학 못 가는데..." (뇌가 미래로 도망)</p>
                            </div>
                            <div>
                                <span class="font-bold text-blue-600 block mb-1">강제 소환 (Detaching)</span>
                                <p class="text-slate-600 bg-blue-50 p-2 rounded">"멈춰. 대학 합격은 내 영역이 아니다. 지금 내 영역은 <strong>'이 문제의 조건 3개를 종이에 받아 적는 것'</strong>뿐이다."</p>
                            </div>
                        </div>
                    </div>

                    <!-- 3. Energy Theory -->
                    <div class="bg-slate-100 p-4 rounded-lg">
                        <h3 class="font-bold text-slate-800 mb-2">3. 이론적 유용함: '인지 자원 보존'</h3>
                        <div class="grid grid-cols-2 gap-4 text-xs text-center">
                            <div class="bg-white p-3 rounded shadow-sm">
                                <div class="font-bold text-red-600 mb-1">결과 집착 시</div>
                                <div>에너지 = 공부 50% + <span class="text-red-600 font-bold">걱정 50%</span></div>
                                <div class="text-[10px] text-slate-400 mt-1">효율 반토막</div>
                            </div>
                            <div class="bg-white p-3 rounded shadow-sm">
                                <div class="font-bold text-green-600 mb-1">과정 집중 시</div>
                                <div>에너지 = <span class="text-green-600 font-bold">공부 100%</span> + 걱정 0%</div>
                                <div class="text-[10px] text-slate-400 mt-1">완전 몰입 (Flow)</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Actionable Routine -->
                <div class="border-2 border-dashed border-indigo-300 bg-indigo-50 p-4 rounded-lg text-center content-block">
                    <h4 class="font-black text-indigo-800 text-lg mb-2">💡 실천 연습: '결과 유예' 루틴</h4>
                    <p class="text-sm text-indigo-900 font-bold mb-2">"걱정 시간(Worry Time)을 따로 배정하세요."</p>
                    <p class="text-xs text-indigo-800 mb-0 leading-relaxed">
                        공부 중 걱정이 들면 포스트잇에 적어두고,<br>
                        "이 걱정에 대한 평가는 <strong>오늘 밤 11시, 씻으면서 딱 10분만 한다</strong>"고<br>
                        뇌에게 '예약'을 걸어두세요.
                    </p>
                </div>

            </section>

            <div class="mt-auto pt-4 border-t border-slate-200 flex justify-between text-[10px] text-slate-400 font-medium">
                <p>© 2026 Mind-Body Connect. Evidence-Based Learning Strategies.</p>
                <p class="uppercase tracking-widest">PAGE 3</p>
            </div>
        </div>
    </div>
</body>
</html>
    `;

    const guideWindow = window.open('', '_blank', 'width=1200,height=900,scrollbars=yes');
    if (guideWindow) {
        guideWindow.document.write(guideHTML);
        guideWindow.document.close();
        guideWindow.focus();
    }
};
