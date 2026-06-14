import React from 'react';

/**
 * Box Breathing Guide Component
 * 박스 브리딩 (Box Breathing) 상세 가이드 - 새 브라우저 창에서 표시
 */

export const openBoxBreathingGuide = () => {
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
    <title>박스 브리딩 (Box Breathing) - 완전 가이드</title>
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
            border-top: 8px solid #06b6d4 !important; /* Cyan for Breathing/Cooling */
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
                border-top: 8px solid #06b6d4 !important;
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
    
    <!-- Page 1: Theory & Method -->
    <div class="page">
        <div class="report-card">
            <!-- Header -->
            <div class="border-b-2 border-cyan-500 pb-4 mb-6">
                <div class="flex justify-between items-start">
                    <div>
                        <div class="text-cyan-700 font-bold text-xs tracking-widest uppercase mb-2">Physiological Bio-Hack</div>
                        <h1 class="text-3xl font-black text-slate-800 mb-2">박스 브리딩 (Box Breathing)</h1>
                        <p class="text-slate-600 text-sm">두뇌의 과열을 식히는 냉각수: 네이비 실(Navy SEALs) 전술 호흡법</p>
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
                <div class="bg-cyan-50 p-4 rounded-lg border-l-4 border-cyan-500 mb-6 italic text-sm text-cyan-900 leading-relaxed content-block">
                    <strong>박스 브리딩(Box Breathing)</strong>은 미 해군 특수부대인 네이비 실(Navy SEALs)이 생사가 오가는 전장에서 평정심을 유지하기 위해 사용하는 가장 검증된 생체 해킹 기법입니다. 수험생에게는 <strong>'두뇌의 과열을 식히는 냉각수'</strong> 역할을 합니다.
                </div>

                <!-- Section 1 -->
                <h2 class="text-2xl font-bold text-slate-800 mb-4 flex items-center">
                    <span class="w-2 h-8 bg-blue-600 mr-3"></span>
                    1. 왜 효과적인가? (이론적 근거)
                </h2>
                
                <div class="space-y-4 mb-8">
                    <div class="bg-white border border-slate-200 p-5 rounded-lg shadow-sm content-block">
                        <h3 class="text-lg font-bold text-slate-800 mb-2">① 자율신경계의 강제 리셋</h3>
                        <p class="text-sm text-slate-600 leading-relaxed">
                            인간의 자율신경 중 '호흡'은 유일하게 우리가 의식적으로 조절할 수 있는 영역입니다. 의도적으로 느리고 규칙적인 호흡을 하면, 뇌는 <strong>"지금은 싸우거나 도망칠 상황이 아니라 안전한 상태구나"</strong>라고 판단하여 부교감 신경을 즉각 활성화합니다.
                        </p>
                    </div>

                    <div class="bg-white border border-slate-200 p-5 rounded-lg shadow-sm content-block">
                        <h3 class="text-lg font-bold text-slate-800 mb-2">② 이산화탄소 수치 조절</h3>
                        <p class="text-sm text-slate-600 leading-relaxed">
                            불안하면 호흡이 얕고 빨라지면서 혈액 내 이산화탄소 농도가 너무 낮아져 어지러움이나 판단력 저하가 옵니다. 박스 브리딩의 '멈춤' 단계는 혈액 내 가스 농도를 정상화하여 <strong>뇌로 전달되는 산소 공급 효율</strong>을 높입니다.
                        </p>
                    </div>
                    
                    <div class="bg-white border border-slate-200 p-5 rounded-lg shadow-sm content-block">
                        <h3 class="text-lg font-bold text-slate-800 mb-2">③ 미주 신경(Vagus Nerve) 자극</h3>
                        <p class="text-sm text-slate-600 leading-relaxed">
                            횡격막을 크게 사용하는 심호흡은 뇌와 몸을 잇는 미주 신경을 자극하여 심박수를 낮추고 근육의 긴장을 이완합니다.
                        </p>
                    </div>
                </div>

                <!-- Section 2: Method -->
                <h2 class="text-2xl font-bold text-slate-800 mb-5 flex items-center">
                    <span class="w-2 h-8 bg-cyan-600 mr-3"></span>
                    2. 효과적인 수행 방법 (4-4-4-4 법칙)
                </h2>
                <p class="text-sm text-slate-600 mb-4">박스(정사각형)를 그린다고 상상하며 다음 4단계를 수행합니다.</p>

                <div class="grid grid-cols-2 gap-4 mb-6 content-block">
                    <!-- Step 1 -->
                    <div class="bg-white border border-cyan-200 rounded-xl p-4 flex flex-col items-center text-center shadow-sm">
                        <div class="w-12 h-12 rounded-full bg-cyan-100 text-cyan-600 font-black text-xl flex items-center justify-center mb-3">1</div>
                        <h3 class="font-bold text-cyan-900 mb-1">4초 흡입 (Inhale)</h3>
                        <p class="text-xs text-slate-600">코로 깊게 숨을 들이마시며<br>배가 팽창하는 것을 느낍니다.</p>
                    </div>

                    <!-- Step 2 -->
                    <div class="bg-white border border-cyan-200 rounded-xl p-4 flex flex-col items-center text-center shadow-sm">
                         <div class="w-12 h-12 rounded-full bg-cyan-600 text-white font-black text-xl flex items-center justify-center mb-3">2</div>
                        <h3 class="font-bold text-cyan-900 mb-1">4초 멈춤 (Hold)</h3>
                        <p class="text-xs text-slate-600">폐에 공기를 가득 채운 상태로<br>숨을 참습니다. (핵심 이완 지점)</p>
                    </div>

                    <!-- Step 4 (Order for Visual Layout: 1 2 / 4 3 to mimic circle? No, Z layout is better for reading) -->
                    <!-- Step 3 -->
                    <div class="bg-white border border-cyan-200 rounded-xl p-4 flex flex-col items-center text-center shadow-sm">
                         <div class="w-12 h-12 rounded-full bg-cyan-100 text-cyan-600 font-black text-xl flex items-center justify-center mb-3">3</div>
                        <h3 class="font-bold text-cyan-900 mb-1">4초 배출 (Exhale)</h3>
                        <p class="text-xs text-slate-600">입이나 코로 천천히<br>모든 공기를 내뱉습니다.</p>
                    </div>

                    <!-- Step 4 -->
                    <div class="bg-white border border-cyan-200 rounded-xl p-4 flex flex-col items-center text-center shadow-sm">
                         <div class="w-12 h-12 rounded-full bg-cyan-600 text-white font-black text-xl flex items-center justify-center mb-3">4</div>
                        <h3 class="font-bold text-cyan-900 mb-1">4초 비움 (Hold)</h3>
                        <p class="text-xs text-slate-600">폐가 비워진 상태에서 숨을 참으며<br>평온함을 유지합니다.</p>
                    </div>
                </div>
                <div class="text-center text-sm font-bold text-cyan-700 bg-cyan-50 py-2 rounded-lg">
                    🔄 이 과정을 3~4회 반복합니다.
                </div>

            </section>
            
            <!-- Footer -->
            <div class="mt-auto pt-4 border-t border-slate-200 flex justify-between text-[10px] text-slate-400 font-medium">
                <p>© 2026 Mind-Body Connect. Evidence-Based Learning Strategies.</p>
                <p class="uppercase tracking-widest">PAGE 1</p>
            </div>
        </div>
    </div>

    <!-- Page 2: Scenario & Simulation -->
    <div class="page">
        <div class="report-card">
            <div class="border-b-2 border-slate-200 pb-3 mb-6">
                <div class="text-cyan-700 font-bold text-xs tracking-widest uppercase">Physiological Bio-Hack</div>
                <h1 class="text-2xl font-black text-slate-800">박스 브리딩 (Box Breathing)</h1>
            </div>

            <section class="flex-1">
                <!-- Section 3: Scenarios -->
                <h2 class="text-2xl font-bold text-slate-800 mb-5 flex items-center">
                    <span class="w-2 h-8 bg-amber-500 mr-3"></span>
                    3. 수험생을 위한 실전 활용 시나리오
                </h2>

                <div class="space-y-4 mb-8 content-block">
                    <!-- Scenario A -->
                    <div class="flex items-start bg-red-50 border border-red-100 rounded-lg p-5">
                       <div class="bg-red-200 text-red-700 font-black text-lg w-10 h-10 rounded flex items-center justify-center shrink-0 mr-4">A</div>
                       <div>
                           <h3 class="font-bold text-red-900 text-base mb-1">시험 직전, 심장이 터질 것 같을 때</h3>
                           <p class="text-sm text-red-800 mb-2 font-medium">효과: 교감 신경의 과활성화를 억제하여 손떨림과 빈맥을 잡습니다.</p>
                           <div class="text-xs text-slate-600 bg-white bg-opacity-60 p-2 rounded inline-block">
                                💡 <strong>팁:</strong> 눈을 감고 박스 브리딩을 하면 시각적 자극이 차단되어 효과가 배가됩니다.
                           </div>
                       </div>
                    </div>

                    <!-- Scenario B -->
                    <div class="flex items-start bg-blue-50 border border-blue-100 rounded-lg p-5">
                       <div class="bg-blue-200 text-blue-700 font-black text-lg w-10 h-10 rounded flex items-center justify-center shrink-0 mr-4">B</div>
                       <div>
                           <h3 class="font-bold text-blue-900 text-base mb-1">공부 중 뇌가 멍해지는 '브레인 포그'가 올 때</h3>
                           <p class="text-sm text-blue-800 mb-2 font-medium">효과: 뇌에 혈액과 산소를 재공급하여 집중력과 인지 기능을 회복시킵니다.</p>
                           <div class="text-xs text-slate-600 bg-white bg-opacity-60 p-2 rounded inline-block">
                                💡 <strong>팁:</strong> 의자에 등을 기대고 어깨의 힘을 뺀 상태에서 수행하세요.
                           </div>
                       </div>
                    </div>
                </div>

                <!-- Section 4: Simulation -->
                <h2 class="text-2xl font-bold text-slate-800 mb-5 flex items-center">
                    <span class="w-2 h-8 bg-purple-600 mr-3"></span>
                    4. 수험생 시뮬레이션: "영어 듣기 평가 전"
                </h2>
                
                <div class="bg-slate-800 text-white rounded-xl p-6 shadow-lg relative overflow-hidden content-block">
                    <div class="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                        <svg width="120" height="120" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg>
                    </div>

                    <div class="relative z-10 space-y-6">
                        <div>
                            <span class="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded mb-2 inline-block">상황 배경</span>
                            <p class="text-sm font-medium leading-relaxed">듣기 평가 직전의 고요함이 오히려 압박감으로 다가오는 순간.</p>
                        </div>

                        <div class="border-t border-slate-700 pt-4">
                            <span class="bg-cyan-600 text-white text-xs px-2 py-1 rounded mb-2 inline-block font-bold">Action</span>
                            <p class="text-sm text-cyan-300 mb-3">책상 밑으로 손을 내리고 주먹을 가볍게 쥔 채 박스 브리딩을 시작합니다.</p>
                            
                            <div class="bg-slate-900 bg-opacity-50 p-4 rounded-lg border border-slate-700 space-y-2 font-mono text-sm">
                                <div class="flex items-center gap-3">
                                    <span class="text-cyan-400">Inhale</span> <span class="w-full bg-slate-700 h-1 rounded overflow-hidden"><div class="bg-cyan-400 h-full w-full animate-pulse"></div></span> <span>4s</span>
                                </div>
                                <div class="flex items-center gap-3">
                                    <span class="text-yellow-400">Hold&nbsp;</span> <span class="w-full bg-slate-700 h-1 rounded overflow-hidden"><div class="bg-yellow-400 h-full w-full"></div></span> <span>4s</span>
                                    <span class="text-xs text-yellow-200 ml-2">("나는 차분하다")</span>
                                </div>
                                <div class="flex items-center gap-3">
                                    <span class="text-cyan-400">Exhale</span> <span class="w-full bg-slate-700 h-1 rounded overflow-hidden"><div class="bg-cyan-400 h-full w-0"></div></span> <span>4s</span>
                                </div>
                                <div class="flex items-center gap-3">
                                    <span class="text-slate-400">Hold&nbsp;</span> <span class="w-full bg-slate-700 h-1 rounded overflow-hidden"><div class="bg-slate-500 h-full w-full"></div></span> <span>4s</span>
                                </div>
                            </div>
                        </div>

                        <div class="border-t border-slate-700 pt-4">
                            <span class="bg-emerald-600 text-white text-xs px-2 py-1 rounded mb-2 inline-block font-bold">Result</span>
                            <p class="text-sm text-emerald-200 leading-relaxed">
                                "3회 반복 후, 주변 소음이 멀어지고 오직 안내 방송 소리에만 고도로 집중할 수 있는 <strong>'최적의 각성 상태'</strong>에 진입합니다."
                            </p>
                        </div>
                    </div>
                </div>

            </section>

            <div class="mt-auto pt-4 border-t border-slate-200 flex justify-between text-[10px] text-slate-400 font-medium">
                <p>© 2026 Mind-Body Connect. Evidence-Based Learning Strategies.</p>
                <p class="uppercase tracking-widest">PAGE 2</p>
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
