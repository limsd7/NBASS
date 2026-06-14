import React from 'react';

/**
 * Micro-Goal Guide Component
 * 마이크로 목표 설정 상세 가이드 - 새 브라우저 창에서 표시
 */

export const openMicroGoalGuide = () => {
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
    <title>마이크로 목표 설정 (Micro-Goal Setting) - 완전 가이드</title>
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
            border-top: 8px solid #1e40af !important;
            padding: 2rem !important;
            flex: 1;
            display: flex;
            flex-direction: column;
        }
        
        .page-break-before {
            page-break-before: always !important;
            break-before: page !important;
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
                border-top: 8px solid #1e40af !important;
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
    
    <!-- Page 1: Theory & Setup -->
    <div class="page">
        <div class="report-card">
            <!-- Header -->
            <div class="border-b-2 border-blue-600 pb-4 mb-6">
                <div class="flex justify-between items-start">
                    <div>
                        <div class="text-blue-700 font-bold text-xs tracking-widest uppercase mb-2">Learning Strategy Guide</div>
                        <h1 class="text-3xl font-black text-slate-800 mb-2">마이크로 목표 설정 (Micro-Goal Setting)</h1>
                        <p class="text-slate-600 text-sm">거대하고 추상적인 목표를 '뇌가 저항감을 느끼지 못할 정도'의 아주 작은 단위로 쪼개는 기술</p>
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
                <div class="bg-slate-50 p-4 rounded-lg border-l-4 border-slate-400 mb-6 italic text-sm text-slate-700 leading-relaxed content-block">
                    공부나 업무를 시작하기 전 느끼는 막연한 불안감과 미루는 습관을 치료하는 데 가장 강력한 도구입니다.
                </div>

                <!-- Section 1 -->
                <h2 class="text-2xl font-bold text-slate-800 mb-4 flex items-center">
                    <span class="w-2 h-8 bg-blue-600 mr-3"></span>
                    1. 이론적 배경: 왜 마이크로 목표가 유용한가?
                </h2>
                
                <div class="space-y-4 mb-8">
                    <div class="bg-indigo-50 border-l-4 border-indigo-600 p-5 rounded-lg content-block">
                        <h3 class="text-lg font-bold text-indigo-900 mb-2">🧠 편도체 하이재킹 방지</h3>
                        <p class="text-sm text-indigo-800 leading-relaxed">
                            뇌의 편도체는 크고 새로운 변화를 '위협'으로 간주합니다. "오늘 수학 한 단원 끝내기" 같은 목표는 뇌에 스트레스를 주어 회피 반응(미루기)을 일으키지만, 아주 작은 목표는 편도체의 감시망을 유유히 통과합니다.
                        </p>
                    </div>

                    <div class="bg-emerald-50 border-l-4 border-emerald-600 p-5 rounded-lg content-block">
                        <h3 class="text-lg font-bold text-emerald-900 mb-2">⚡ 즉각적인 도파민 피드백</h3>
                        <p class="text-sm text-emerald-800 leading-relaxed">
                            뇌는 목표를 완수했을 때 도파민을 분비합니다. 큰 목표는 보상을 얻기까지 시간이 오래 걸려 지치지만, 마이크로 목표는 짧은 간격으로 성취감을 주어 뇌를 '승리 모드'로 유지시킵니다.
                        </p>
                    </div>
                    
                    <div class="bg-amber-50 border-l-4 border-amber-600 p-5 rounded-lg content-block">
                        <h3 class="text-lg font-bold text-amber-900 mb-2">💪 자아 효능감(Self-Efficacy)의 축적</h3>
                        <p class="text-sm text-amber-800 leading-relaxed">
                            "나는 한다면 하는 사람이다"라는 믿음은 작은 성공들이 쌓여 만들어집니다. 이 믿음이 두터워질수록 나중에 더 큰 도전에도 직면할 힘이 생깁니다.
                        </p>
                    </div>
                </div>

                <!-- Section 2 -->
                <h2 class="text-2xl font-bold text-slate-800 mb-5 flex items-center">
                    <span class="w-2 h-8 bg-blue-600 mr-3"></span>
                    2. 마이크로 목표의 구체적인 설정 방법 (치환 공식)
                </h2>

                <div class="bg-white border-2 border-slate-200 rounded-xl p-5 shadow-sm content-block mb-6">
                    <p class="text-sm text-slate-700 mb-4">
                        추상적인 언어를 <strong class="text-blue-600">'동사'</strong>와 <strong class="text-blue-600">'숫자'</strong>가 포함된 구체적인 행동으로 바꿉니다.
                    </p>
                    
                    <table class="w-full text-sm border-collapse">
                        <thead>
                            <tr class="bg-slate-100 text-slate-700 uppercase text-xs font-bold">
                                <th class="p-3 text-left w-1/2 border-b-2 border-slate-200">❌ 추상적 목표 (Abstract)</th>
                                <th class="p-3 text-left w-1/2 border-b-2 border-slate-200">⭕ 마이크로 목표 (Micro-Goal)</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            <tr>
                                <td class="p-3 text-slate-500">"오늘 영어 공부 열심히 하기"</td>
                                <td class="p-3 font-bold text-blue-700">"영어 단어 5개 암기하고 테스트하기"</td>
                            </tr>
                            <tr>
                                <td class="p-3 text-slate-500">"수학 문제집 풀기"</td>
                                <td class="p-3 font-bold text-blue-700">"수학 문제 2개 풀고 오답 확인하기"</td>
                            </tr>
                            <tr>
                                <td class="p-3 text-slate-500">"집중력 유지하기"</td>
                                <td class="p-3 font-bold text-blue-700">"딱 15분만 스마트폰 없이 책상에 앉아 있기"</td>
                            </tr>
                            <tr>
                                <td class="p-3 text-slate-500">"비문학 지문 분석하기"</td>
                                <td class="p-3 font-bold text-blue-700">"지문 1개의 첫 번째 문단 핵심 키워드 찾기"</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
            
            <!-- Footer -->
            <div class="mt-auto pt-4 border-t border-slate-200 flex justify-between text-[10px] text-slate-400 font-medium">
                <p>© 2026 Mind-Body Connect. Evidence-Based Learning Strategies.</p>
                <p class="uppercase tracking-widest">PAGE 1</p>
            </div>
        </div>
    </div>

    <!-- Page 2: Strategies & Practical Examples -->
    <div class="page">
        <div class="report-card">
            <div class="border-b-2 border-slate-200 pb-3 mb-6">
                <div class="text-blue-700 font-bold text-xs tracking-widest uppercase">Learning Strategy Guide</div>
                <h1 class="text-2xl font-black text-slate-800">마이크로 목표 설정 (Micro-Goal Setting)</h1>
            </div>

            <section class="flex-1">
                <!-- Section 3 -->
                <h2 class="text-2xl font-bold text-slate-800 mb-5 flex items-center">
                    <span class="w-2 h-8 bg-purple-600 mr-3"></span>
                    3. 효과적으로 수행하기 위한 전략
                </h2>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                     <div class="bg-purple-50 p-4 rounded-xl border border-purple-100 content-block">
                        <h3 class="text-base font-bold text-purple-900 mb-2">[1] '2분 법칙' 적용</h3>
                        <p class="text-xs text-purple-800 leading-relaxed">
                            어떤 일이든 시작하는 데 2분 이상 걸리지 않게 설계하세요. 책을 펴는 행위 자체가 목표가 됩니다. 일단 시작하면 '작업 흥분(Work Excitement)'으로 관성이 생깁니다.
                        </p>
                    </div>
                     <div class="bg-purple-50 p-4 rounded-xl border border-purple-100 content-block">
                        <h3 class="text-base font-bold text-purple-900 mb-2">[2] 체크리스트 시각화</h3>
                        <p class="text-xs text-purple-800 leading-relaxed">
                            반드시 완료 즉시 'V' 표시를 하거나 선을 그어 지우세요. 이 시각적 피드백이 뇌에 "보상을 받을 시간이야!"라는 신호를 보냅니다.
                        </p>
                    </div>
                     <div class="bg-purple-50 p-4 rounded-xl border border-purple-100 content-block">
                        <h3 class="text-base font-bold text-purple-900 mb-2">[3] '더 적게' 전략</h3>
                        <p class="text-xs text-purple-800 leading-relaxed">
                            "최소 이 정도는 한다"는 하한선을 정하세요. 컨디션이 최악인 날에도 할 수 있을 정도여야 합니다. (예: "수학 문제 딱 1개만")
                        </p>
                    </div>
                </div>

                <!-- Section 4 -->
                <h2 class="text-2xl font-bold text-slate-800 mb-5 flex items-center">
                    <span class="w-2 h-8 bg-amber-600 mr-3"></span>
                    4. 마이크로 목표의 실전 예시 (수험생용)
                </h2>

                <div class="bg-white border-2 border-slate-200 rounded-xl p-5 shadow-sm content-block mb-8">
                     <ul class="space-y-4">
                        <li class="flex items-center gap-3">
                            <span class="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-bold w-24 text-center shrink-0">오전 기상 직후</span>
                            <span class="text-sm text-slate-700">"물 한 잔 마시고 영어 단어 딱 3개만 눈에 바르기"</span>
                        </li>
                        <li class="flex items-center gap-3">
                            <span class="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-bold w-24 text-center shrink-0">공부 시작 전</span>
                            <span class="text-sm text-slate-700">"플래너에 오늘 할 일 3가지만 적기"</span>
                        </li>
                        <li class="flex items-center gap-3">
                            <span class="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-bold w-24 text-center shrink-0">졸음이 올 때</span>
                            <span class="text-sm text-slate-700">"서서 영어 지문 한 문장만 소리 내어 읽기"</span>
                        </li>
                     </ul>
                     <p class="mt-4 text-xs text-slate-500 text-center font-bold bg-slate-50 p-2 rounded">
                        마이크로 목표는 '실패하기 어려울 정도로 작게' 만드는 것이 핵심입니다.
                     </p>
                </div>
            </section>

            <div class="mt-auto pt-4 border-t border-slate-200 flex justify-between text-[10px] text-slate-400 font-medium">
                <p>© 2026 Mind-Body Connect. Evidence-Based Learning Strategies.</p>
                <p class="uppercase tracking-widest">PAGE 2</p>
            </div>
        </div>
    </div>

    <!-- Page 3: Subject Specific Strategies -->
    <div class="page">
        <div class="report-card">
            <div class="border-b-2 border-slate-200 pb-3 mb-6">
                <div class="text-blue-700 font-bold text-xs tracking-widest uppercase">Learning Strategy Guide</div>
                <h1 class="text-2xl font-black text-slate-800">마이크로 목표 설정 (Micro-Goal Setting)</h1>
            </div>

            <section class="flex-1">
                <!-- Introduction -->
                <p class="text-sm text-slate-700 mb-6 font-medium">
                    국어, 영어, 수학은 과목별로 뇌를 사용하는 방식이 다르기 때문에, '심리적 문턱'을 낮추는 쪼개기 전략도 달라야 합니다. 각 과목을 시작하기 직전, 뇌가 "이 정도면 껌이지!"라고 느낄 수 있는 예시입니다.
                </p>

                <!-- 1. Korean -->
                <div class="bg-white border-l-4 border-rose-500 shadow-sm rounded-r-xl p-5 mb-5 content-block">
                    <h3 class="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
                        <span class="text-rose-600">📖</span> 1. 국어 (지문 읽기의 두려움 없애기)
                    </h3>
                    <p class="text-xs text-slate-600 mb-3">국어는 긴 지문을 읽어야 한다는 압박감이 가장 큽니다. '읽기' 자체를 아주 작게 쪼개는 것이 핵심입니다.</p>
                    
                    <div class="bg-rose-50 p-3 rounded-lg space-y-2 mb-2">
                        <div class="flex gap-2 text-xs">
                            <span class="font-bold text-rose-700 shrink-0 w-12">Level 1</span>
                            <span>비문학 지문 첫 문단만 읽고 핵심 단어 1개에 동그라미 치기</span>
                        </div>
                        <div class="flex gap-2 text-xs">
                            <span class="font-bold text-rose-700 shrink-0 w-12">Level 2</span>
                            <span>문제 1번의 선지 5개 중 확실히 아닌 것 2개만 지우기</span>
                        </div>
                        <div class="flex gap-2 text-xs">
                            <span class="font-bold text-rose-700 shrink-0 w-12">Level 3</span>
                            <span>고전 시가 한 작품의 제목과 작가 이름만 확인하고 시대상 떠올리기</span>
                        </div>
                    </div>
                    <p class="text-[10px] text-slate-500 font-bold text-right">💡 효과: 텍스트에 대한 거부감을 줄이고 뇌의 '읽기 스위치'를 부드럽게 켭니다.</p>
                </div>

                <!-- 2. English -->
                <div class="bg-white border-l-4 border-indigo-500 shadow-sm rounded-r-xl p-5 mb-5 content-block">
                    <h3 class="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
                        <span class="text-indigo-600">🔤</span> 2. 영어 (휘발성 암기 극복하기)
                    </h3>
                    <p class="text-xs text-slate-600 mb-3">영어는 반복과 암기가 필수적입니다. 한꺼번에 외우려 하지 말고 '노출 빈도'를 높이는 방향으로 쪼갭니다.</p>
                    
                    <div class="bg-indigo-50 p-3 rounded-lg space-y-2 mb-2">
                        <div class="flex gap-2 text-xs">
                            <span class="font-bold text-indigo-700 shrink-0 w-12">Level 1</span>
                            <span>영어 단어장 딱 5개만 소리 내어 읽어보기 (외우지 않아도 됨)</span>
                        </div>
                        <div class="flex gap-2 text-xs">
                            <span class="font-bold text-indigo-700 shrink-0 w-12">Level 2</span>
                            <span>영어 듣기 평가 딱 1문제만 듣고 받아쓰기 한 문장 하기</span>
                        </div>
                        <div class="flex gap-2 text-xs">
                            <span class="font-bold text-indigo-700 shrink-0 w-12">Level 3</span>
                            <span>영어 지문에서 모르는 단어 3개 찾아 밑줄만 긋기</span>
                        </div>
                    </div>
                    <p class="text-[10px] text-slate-500 font-bold text-right">💡 효과: 암기에 대한 압박을 없애고 뇌가 영어를 '친숙한 정보'로 인식하게 합니다.</p>
                </div>

                <!-- 3. Math -->
                <div class="bg-white border-l-4 border-emerald-500 shadow-sm rounded-r-xl p-5 mb-5 content-block">
                    <h3 class="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
                        <span class="text-emerald-600">📐</span> 3. 수학 (풀이 과정의 막막함 해소)
                    </h3>
                    <p class="text-xs text-slate-600 mb-3">수학은 문제 전체를 풀어야 한다는 부담감이 미루기의 주범입니다. '풀이의 시작'만 목표로 잡습니다.</p>
                    
                    <div class="bg-emerald-50 p-3 rounded-lg space-y-2 mb-2">
                        <div class="flex gap-2 text-xs">
                            <span class="font-bold text-emerald-700 shrink-0 w-12">Level 1</span>
                            <span>수학 문제 1개의 조건(주어진 숫자, 공식)만 여백에 옮겨 적기</span>
                        </div>
                        <div class="flex gap-2 text-xs">
                            <span class="font-bold text-emerald-700 shrink-0 w-12">Level 2</span>
                            <span>해설지 첫 줄만 보고 어떻게 시작하는지 아이디어만 확인하기</span>
                        </div>
                        <div class="flex gap-2 text-xs">
                            <span class="font-bold text-emerald-700 shrink-0 w-12">Level 3</span>
                            <span>가장 쉬운 계산 문제 딱 3개만 풀고 채점하기</span>
                        </div>
                    </div>
                    <p class="text-[10px] text-slate-500 font-bold text-right">💡 효과: 손을 움직여 '작업 흥분' 상태로 유도하며, 풀이의 실마리를 찾는 데 집중하게 합니다.</p>
                </div>

                <!-- Tip -->
                <div class="bg-gradient-to-r from-slate-800 to-slate-700 text-white p-5 rounded-xl text-center content-block">
                    <h4 class="font-bold text-yellow-400 mb-1">💡 실천을 위한 Tip: "연쇄 반응(Chain Reaction)"</h4>
                    <p class="text-sm opacity-90 leading-relaxed">
                        마이크로 목표의 진짜 목적은 <strong>'시작'</strong>입니다. "수학 문제 조건을 적기"라는 목표를 달성하면, 뇌는 이미 그 문제에 몰입한 상태가 되어 "적은 김에 그냥 풀어버릴까?"라는 생각을 하게 됩니다.
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
