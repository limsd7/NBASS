import React from 'react';

/**
 * Grounding Guide Component
 * 그라운딩 (5-4-3-2-1) 상세 가이드 - 새 브라우저 창에서 표시
 */

export const openGroundingGuide = () => {
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
    <title>그라운딩 (Grounding) 5-4-3-2-1 - 완전 가이드</title>
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
            border-top: 8px solid #059669 !important; /* Emerald Green for Grounding */
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
                border-top: 8px solid #059669 !important;
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
            <div class="border-b-2 border-emerald-600 pb-4 mb-6">
                <div class="flex justify-between items-start">
                    <div>
                        <div class="text-emerald-700 font-bold text-xs tracking-widest uppercase mb-2">Mental Anchoring Strategy</div>
                        <h1 class="text-3xl font-black text-slate-800 mb-2">그라운딩 (Grounding) 5-4-3-2-1</h1>
                        <p class="text-slate-600 text-sm">불안과 공황을 즉시 차단하고 현실로 복귀하는 인지 행동 요령</p>
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
                <div class="bg-emerald-50 p-4 rounded-lg border-l-4 border-emerald-500 mb-6 italic text-sm text-emerald-900 leading-relaxed content-block">
                    그라운딩(Grounding) 5-4-3-2-1 기법은 불안이나 공황이 엄습할 때 뇌의 '비상벨'을 끄고 현재의 물리적 현실로 의식을 강제 소환하는 가장 대표적인 인지 행동 요령입니다.
                </div>

                <!-- Section 1 -->
                <h2 class="text-2xl font-bold text-slate-800 mb-4 flex items-center">
                    <span class="w-2 h-8 bg-blue-600 mr-3"></span>
                    1. 이론적 배경: 왜 효과적인가?
                </h2>
                
                <div class="space-y-4 mb-8">
                    <div class="bg-white border border-slate-200 p-5 rounded-lg shadow-sm content-block">
                        <h3 class="text-lg font-bold text-slate-800 mb-2">① 편도체 하이재킹 (Amygdala Hijacking) 차단</h3>
                        <p class="text-sm text-slate-600 leading-relaxed">
                            불안이 심해지면 뇌의 감정 센터인 편도체가 과활성화되어 이성적인 사고를 담당하는 전두엽을 마비시킵니다. 오감을 자극하는 것은 전두엽을 다시 활성화하여 <strong>"지금 여기는 안전하다"</strong>는 신호를 뇌에 강제로 주입하는 과정입니다.
                        </p>
                    </div>

                    <div class="bg-white border border-slate-200 p-5 rounded-lg shadow-sm content-block">
                        <h3 class="text-lg font-bold text-slate-800 mb-2">② 해리 (Dissociation) 방지</h3>
                        <p class="text-sm text-slate-600 leading-relaxed">
                            극도의 스트레스 상태에서는 정신이 현실과 동떨어져 미래의 최악의 시나리오에 매몰됩니다. 이를 '해리' 상태라고 하는데, 감각 자극은 의식을 육체라는 물리적 그릇 안으로 다시 잡아당기는 <strong>닻(Anchor)</strong> 역할을 합니다.
                        </p>
                    </div>
                    
                    <div class="bg-white border border-slate-200 p-5 rounded-lg shadow-sm content-block">
                        <h3 class="text-lg font-bold text-slate-800 mb-2">③ 주의 전환 (Attentional Shift)</h3>
                        <p class="text-sm text-slate-600 leading-relaxed">
                            뇌는 한 번에 처리할 수 있는 정보의 양이 제한적입니다. 5가지 감각 정보를 수집하는 정교한 작업에 집중하게 함으로써, 불안한 생각에 쓰이던 인지 자원을 <strong>'현실 파악'으로 강제 전환</strong>시킵니다.
                        </p>
                    </div>
                </div>

                <!-- Section 2: Steps -->
                <h2 class="text-2xl font-bold text-slate-800 mb-5 flex items-center">
                    <span class="w-2 h-8 bg-emerald-600 mr-3"></span>
                    2. 5-4-3-2-1 기법 실전 가이드
                </h2>
                <p class="text-sm text-slate-600 mb-4">불안이 느껴지는 순간, 심호흡을 한 번 크게 하고 주변을 둘러보며 다음 순서를 수행합니다.</p>

                <div class="grid gap-3 mb-6 content-block">
                    <!-- Step 5 -->
                    <div class="flex items-stretch bg-white border border-slate-200 rounded-lg overflow-hidden">
                        <div class="bg-slate-800 text-white w-12 flex items-center justify-center font-black text-2xl shrink-0">5</div>
                        <div class="p-3 flex-1">
                            <div class="font-bold text-slate-800 text-sm mb-1">Sight (시각): 눈에 보이는 것 5가지 찾기</div>
                            <p class="text-xs text-slate-600 leading-relaxed">단순히 사물을 보는 게 아니라 속성을 관찰합니다. (예: "저기 베이지색 책꽂이", "흔들리는 나뭇가지", "손톱의 초승달 모양")</p>
                        </div>
                    </div>
                    
                    <!-- Step 4 -->
                    <div class="flex items-stretch bg-white border border-slate-200 rounded-lg overflow-hidden">
                        <div class="bg-slate-700 text-white w-12 flex items-center justify-center font-black text-2xl shrink-0">4</div>
                        <div class="p-3 flex-1">
                            <div class="font-bold text-slate-800 text-sm mb-1">Touch (촉각): 몸에 닿는 감각 4가지 느끼기</div>
                            <p class="text-xs text-slate-600 leading-relaxed">질감과 온도에 집중합니다. (예: "엉덩이가 의자에 닿는 압력", "양말 속 발가락의 꼼지락", "손등의 서늘한 바람")</p>
                        </div>
                    </div>

                    <!-- Step 3 -->
                    <div class="flex items-stretch bg-white border border-slate-200 rounded-lg overflow-hidden">
                        <div class="bg-slate-600 text-white w-12 flex items-center justify-center font-black text-2xl shrink-0">3</div>
                        <div class="p-3 flex-1">
                            <div class="font-bold text-slate-800 text-sm mb-1">Hearing (청각): 들리는 소리 3가지 집중하기</div>
                            <p class="text-xs text-slate-600 leading-relaxed">평소 무시했던 배경음을 찾습니다. (예: "멀리 지나가는 차 소리", "컴퓨터 팬 소리", "나의 규칙적인 숨소리")</p>
                        </div>
                    </div>

                    <!-- Step 2 -->
                    <div class="flex items-stretch bg-white border border-slate-200 rounded-lg overflow-hidden">
                        <div class="bg-slate-500 text-white w-12 flex items-center justify-center font-black text-2xl shrink-0">2</div>
                        <div class="p-3 flex-1">
                            <div class="font-bold text-slate-800 text-sm mb-1">Smell (후각): 맡을 수 있는 냄새 2가지 찾기</div>
                            <p class="text-xs text-slate-600 leading-relaxed">주변의 향기를 찾거나 없다면 상상합니다. (예: "오래된 종이 냄새", "손등의 비누 향", "커피 잔의 잔향")</p>
                        </div>
                    </div>

                    <!-- Step 1 -->
                    <div class="flex items-stretch bg-white border border-slate-200 rounded-lg overflow-hidden">
                        <div class="bg-slate-400 text-white w-12 flex items-center justify-center font-black text-2xl shrink-0">1</div>
                        <div class="p-3 flex-1">
                            <div class="font-bold text-slate-800 text-sm mb-1">Taste (미각): 느낄 수 있는 맛 1가지 확인하기</div>
                            <p class="text-xs text-slate-600 leading-relaxed">지금 입안의 느낌에 집중합니다. (예: "민트 사탕 맛", "생수의 시원한 느낌", "좋아하는 음식 맛 상상하기")</p>
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

    <!-- Page 2: Tips & Simulation -->
    <div class="page">
        <div class="report-card">
            <div class="border-b-2 border-slate-200 pb-3 mb-6">
                <div class="text-emerald-700 font-bold text-xs tracking-widest uppercase">Mental Anchoring Strategy</div>
                <h1 class="text-2xl font-black text-slate-800">그라운딩 (Grounding) 5-4-3-2-1</h1>
            </div>

            <section class="flex-1">
                <!-- Section 3: Maximizing Effect -->
                <h2 class="text-2xl font-bold text-slate-800 mb-5 flex items-center">
                    <span class="w-2 h-8 bg-amber-500 mr-3"></span>
                    3. 효과를 극대화하는 팁 (수험생/전문가용)
                </h2>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                     <div class="bg-amber-50 p-4 rounded-xl border border-amber-100 content-block">
                        <h3 class="text-base font-bold text-amber-900 mb-2">🗣️ 언어화하기 (Labeling)</h3>
                        <p class="text-xs text-amber-800 leading-relaxed">
                            속으로만 생각하지 말고, 가능하다면 아주 작은 목소리로든 입 모양으로든 이름을 붙여 말하는 것이 전두엽 활성화에 훨씬 유리합니다.
                        </p>
                    </div>
                     <div class="bg-amber-50 p-4 rounded-xl border border-amber-100 content-block">
                        <h3 class="text-base font-bold text-amber-900 mb-2">🔍 세밀하게 관찰하기</h3>
                        <p class="text-xs text-amber-800 leading-relaxed">
                            단순히 '책상'이라고 하기보다 <strong>'책상의 나무 무늬 결'</strong>처럼 더 구체적으로 묘사할수록 불안 차단 효과가 강력해집니다.
                        </p>
                    </div>
                     <div class="bg-amber-50 p-4 rounded-xl border border-amber-100 content-block">
                        <h3 class="text-base font-bold text-amber-900 mb-2">🔮 그라운딩 오브제 활용</h3>
                        <p class="text-xs text-amber-800 leading-relaxed">
                            공부 중이라면 매끄러운 수정구슬, 피젯 토이, 시원한 핸드크림 등 감각을 즉시 깨우는 전용 도구를 책상에 두세요.
                        </p>
                    </div>
                </div>

                <!-- Section 4: Simulation -->
                <h2 class="text-2xl font-bold text-slate-800 mb-5 flex items-center">
                    <span class="w-2 h-8 bg-purple-600 mr-3"></span>
                    4. 실전 시뮬레이션: "수능 시험장, 1교시 시작 전"
                </h2>
                
                <div class="bg-slate-50 p-5 rounded-xl border border-slate-200 content-block mb-6 relative overflow-hidden">
                    <div class="absolute top-0 right-0 p-4 opacity-10 font-black text-9xl text-slate-300 pointer-events-none">Exam</div>
                    
                    <div class="grid gap-4 relative z-10">
                        <!-- 5 -->
                        <div class="flex items-start gap-4">
                            <div class="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-sm shrink-0">5</div>
                            <div>
                                <div class="text-sm font-bold text-slate-800 mb-1">시각 (Visual)</div>
                                <div class="text-sm text-slate-600 leading-relaxed italic border-l-2 border-slate-300 pl-3">
                                    "시험지 흰색 종이, 감독관의 노란색 타이, 내 수험표 사진, 시계 바늘, 책상의 낙서 자국."
                                </div>
                            </div>
                        </div>

                        <!-- 4 -->
                        <div class="flex items-start gap-4">
                            <div class="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-sm shrink-0">4</div>
                            <div>
                                <div class="text-sm font-bold text-slate-800 mb-1">촉각 (Tactile)</div>
                                <div class="text-sm text-slate-600 leading-relaxed italic border-l-2 border-slate-300 pl-3">
                                    "딱딱한 나무 의자의 느낌, 왼쪽 손등을 누르는 시계 스트랩, 바닥에 닿은 내 발바닥의 지지력, 시험지의 까슬까슬한 질감."
                                </div>
                            </div>
                        </div>

                        <!-- 3 -->
                        <div class="flex items-start gap-4">
                            <div class="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-sm shrink-0">3</div>
                            <div>
                                <div class="text-sm font-bold text-slate-800 mb-1">청각 (Auditory)</div>
                                <div class="text-sm text-slate-600 leading-relaxed italic border-l-2 border-slate-300 pl-3">
                                    "다른 학생들이 책장을 넘기는 소리, 감독관의 구두 굽 소리, 운동장에서 들리는 희미한 새소리."
                                </div>
                            </div>
                        </div>

                        <!-- 2 -->
                        <div class="flex items-start gap-4">
                            <div class="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-sm shrink-0">2</div>
                            <div>
                                <div class="text-sm font-bold text-slate-800 mb-1">후각 (Smell)</div>
                                <div class="text-sm text-slate-600 leading-relaxed italic border-l-2 border-slate-300 pl-3">
                                    "어제 바른 핸드크림 향기, 교실 안의 특유의 종이 냄새."
                                </div>
                            </div>
                        </div>

                        <!-- 1 -->
                        <div class="flex items-start gap-4">
                            <div class="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-sm shrink-0">1</div>
                            <div>
                                <div class="text-sm font-bold text-slate-800 mb-1">미각 (Taste)</div>
                                <div class="text-sm text-slate-600 leading-relaxed italic border-l-2 border-slate-300 pl-3">
                                    "아침에 마신 따뜻한 차의 쌉싸름한 맛."
                                </div>
                            </div>
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

    <!-- Page 3: Student Special Guide -->
    <div class="page">
        <div class="report-card">
            <div class="border-b-2 border-slate-200 pb-3 mb-6">
                <div class="text-emerald-700 font-bold text-xs tracking-widest uppercase">Mental Anchoring Strategy</div>
                <h1 class="text-2xl font-black text-slate-800">그라운딩 (Grounding) 5-4-3-2-1</h1>
            </div>

            <section class="flex-1">
                 <!-- Student Simulation -->
                 <div class="bg-indigo-50 border-l-4 border-indigo-500 shadow-sm rounded-r-xl p-5 mb-8 content-block">
                    <h3 class="text-lg font-bold text-indigo-900 mb-2">🎓 수험생을 위한 5-4-3-2-1 실전 가이드</h3>
                    <p class="text-sm text-indigo-800 mb-4">시험지 글자가 눈에 안 들어오고 심장이 두근거릴 때, 펜을 내려놓고 딱 1분만 실행하세요.</p>
                    
                    <div class="space-y-4">
                        <div class="bg-white p-3 rounded-lg border border-indigo-100">
                             <h4 class="font-bold text-indigo-800 text-sm mb-1">5 (Visual) - 터널 시야 해제</h4>
                             <p class="text-xs text-slate-600 mb-1">시험지 밖으로 시선을 돌려 뇌에 여유 공간을 줍니다.</p>
                             <ul class="list-disc list-inside text-xs text-slate-500 pl-1">
                                <li>내 수험표 숫자의 모양</li>
                                <li>앞자리 친구의 등 뒤 옷 주름</li>
                                <li>창문 틀의 금속 질감</li>
                             </ul>
                        </div>
                        
                        <div class="bg-white p-3 rounded-lg border border-indigo-100">
                             <h4 class="font-bold text-indigo-800 text-sm mb-1">4 (Tactile) - 신체적 지지감 확보</h4>
                             <p class="text-xs text-slate-600 mb-1">몸이 붕 뜬 기분을 물리적 마찰로 잡습니다.</p>
                             <ul class="list-disc list-inside text-xs text-slate-500 pl-1">
                                <li>발가락 꼼지락거리며 지면 느끼기</li>
                                <li>무광 샤프 펜슬의 매끄럽고 차가운 촉감</li>
                                <li>손바닥으로 허벅지 누르기</li>
                             </ul>
                        </div>

                         <div class="bg-white p-3 rounded-lg border border-indigo-100">
                             <h4 class="font-bold text-indigo-800 text-sm mb-1">3 (Auditory) - 소음을 배경음으로</h4>
                             <p class="text-xs text-slate-600 mb-1">소음이 공격이 아닌 '배경음'임을 인지합니다.</p>
                             <ul class="list-disc list-inside text-xs text-slate-500 pl-1">
                                <li>천장 에어컨/히터 소리</li>
                                <li>내 코끝의 작은 숨소리</li>
                             </ul>
                        </div>

                        <div class="grid grid-cols-2 gap-2">
                             <div class="bg-white p-3 rounded-lg border border-indigo-100">
                                <h4 class="font-bold text-indigo-800 text-sm mb-1">2 (Olfactory) - 강제 환기</h4>
                                <p class="text-xs text-slate-500">종이 냄새, 손등의 핸드크림 향</p>
                            </div>
                             <div class="bg-white p-3 rounded-lg border border-indigo-100">
                                <h4 class="font-bold text-indigo-800 text-sm mb-1">1 (Taste) - 뇌 깨우기</h4>
                                <p class="text-xs text-slate-500">입안의 느낌, 초콜릿 잔향 상상</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Theory Deep Dive -->
                <div class="bg-slate-800 text-white p-5 rounded-xl mb-6 content-block">
                    <h4 class="font-bold text-lg text-yellow-400 mb-3">🧠 수험생에게 이 기법이 유용한 이유 (심화)</h4>
                    <div class="space-y-4">
                        <div>
                            <h5 class="font-bold text-sm mb-1 text-slate-200">1. 전두엽 기능 복원</h5>
                            <p class="text-xs text-slate-300 leading-relaxed">
                                시험 중 불안은 '감정 뇌'가 '생각 뇌(전두엽)'를 마비시킨 상태입니다. 오감을 찾는 '탐색 작업'은 고차원적인 인지 활동이므로, 강제로 전두엽에 전원을 켭니다.
                            </p>
                        </div>
                        <div>
                            <h5 class="font-bold text-sm mb-1 text-slate-200">2. 터널 시야(Tunnel Vision) 해제</h5>
                            <p class="text-xs text-slate-300 leading-relaxed">
                                긴장하면 시야가 좁아져 문제의 핵심을 놓칩니다. 5가지를 찾는 동안 시야가 넓어지며 문제를 다시 거시적으로 볼 수 있게 됩니다.
                            </p>
                        </div>
                         <div>
                            <h5 class="font-bold text-sm mb-1 text-slate-200">3. 부교감 신경 활성화</h5>
                            <p class="text-xs text-slate-300 leading-relaxed">
                                오감에 집중하면 투쟁-도망 반응(교감 신경)이 진정되고 신체가 안정 상태(부교감 신경)로 돌아옵니다.
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Strategy Tip -->
                <div class="border-2 border-dashed border-slate-300 bg-slate-50 p-4 rounded-lg content-block text-center">
                    <h4 class="font-black text-slate-700 text-base mb-2">💡 수험생을 위한 한 끗 차이 전략</h4>
                    <p class="text-xs text-slate-600 mb-2">
                        <strong>'감각 명칭' 붙이기:</strong> 단순히 보는 것보다 "갈색 책상", "하얀 분필"처럼 색깔과 명칭을 결합해 인지하면 뇌 회복 속도가 훨씬 빠릅니다.
                    </p>
                     <p class="text-xs text-slate-600 mb-0">
                        <strong>루틴화:</strong> 집에서 공부가 안될 때 1회씩 연습해 보세요. 뇌에 "이 동작을 하면 나는 다시 공부 모드로 돌아간다"라는 신경 경로를 미리 만들어두는 것이 중요합니다.
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
