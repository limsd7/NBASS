import React from 'react';

/**
 * Visual Clean Guide Component
 * 비주얼 클린 상세 가이드 - 새 브라우저 창에서 표시
 */

export const openVisualCleanGuide = () => {
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
    <title>데스크 셋업 (Visual Clean) - 완전 가이드</title>
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
        
        /* Page Layout (Similar to MedicalReport) */
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
                border-top: 8px solid #1e40af !important; /* Keep top border for style */
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
    
    <!-- Page 1: Theory & Steps 1-2 -->
    <div class="page">
        <div class="report-card">
            <!-- Header -->
            <div class="border-b-2 border-blue-600 pb-4 mb-6">
                <div class="flex justify-between items-start">
                    <div>
                        <div class="text-blue-700 font-bold text-xs tracking-widest uppercase mb-2">Learning Strategy Guide</div>
                        <h1 class="text-4xl font-black text-slate-800 mb-2">데스크 셋업 (Visual Clean)</h1>
                        <p class="text-slate-600 text-sm">시각적 노이즈를 제거하여 뇌의 인지 부하를 최소화하고 업무 효율을 극대화하는 과학적 전략</p>
                    </div>
                    <div class="text-right">
                        <div class="text-xs text-slate-500">작성일</div>
                        <div class="text-sm font-bold text-slate-700">${today}</div>
                    </div>
                </div>
            </div>

            <!-- Content -->
            <section class="flex-1">
                <!-- Section 1 -->
                <h2 class="text-2xl font-bold text-slate-800 mb-4 flex items-center">
                    <span class="w-2 h-8 bg-blue-600 mr-3"></span>
                    1. 비주얼 클린의 이론적 배경
                </h2>
                
                <div class="bg-indigo-50 border-l-4 border-indigo-600 p-5 rounded-lg mb-5 content-block">
                    <h3 class="text-lg font-bold text-indigo-900 mb-3">뇌의 '인지 부하(Cognitive Load)' 감소</h3>
                    <p class="text-sm text-indigo-800 leading-relaxed mb-4">
                        우리 뇌의 시각 피질은 눈앞에 보이는 모든 사물을 무의식적으로 스캔하고 처리합니다. 
                        책상 위에 어질러진 전선, 포스트잇, 필기구 등은 뇌에 계속해서 "처리해야 할 신호"를 보내는 시각적 노이즈가 됩니다.
                    </p>
                    <div class="grid grid-cols-2 gap-3">
                        <div class="bg-white p-3 rounded shadow-sm">
                            <div class="text-blue-600 font-bold mb-2 text-sm">✓ 주의력 자원 보존</div>
                            <p class="text-xs text-slate-700">노이즈가 사라지면 뇌는 주변 환경을 무시하는 데 드는 에너지를 아껴 핵심 작업에만 집중할 수 있습니다.</p>
                        </div>
                        <div class="bg-white p-3 rounded shadow-sm">
                            <div class="text-blue-600 font-bold mb-2 text-sm">✓ 작업 기억 공간 확보</div>
                            <p class="text-xs text-slate-700">시각적으로 단순한 환경은 단기 기억 장치의 과부하를 막아 복잡한 문제 해결 능력을 향상시킵니다.</p>
                        </div>
                    </div>
                </div>

                <div class="bg-emerald-50 border-l-4 border-emerald-600 p-5 rounded-lg mb-8 content-block">
                    <h3 class="text-lg font-bold text-emerald-900 mb-3">심리적 통제감과 스트레스 완화</h3>
                    <p class="text-sm text-emerald-800 leading-relaxed">
                        환경이 정돈되어 있다는 느낌은 사용자에게 심리적 안정감과 상황에 대한 통제감을 줍니다. 
                        이는 <strong>코티솔(스트레스 호르몬)</strong> 수치를 낮추고 창의적인 사고를 돕는 <strong>도파민 체계</strong>를 활성화합니다.
                    </p>
                </div>

                <!-- Section 2 (Part 1) -->
                <h2 class="text-2xl font-bold text-slate-800 mb-5 flex items-center">
                    <span class="w-2 h-8 bg-blue-600 mr-3"></span>
                    2. 비주얼 클린 셋업을 위한 4단계 방법
                </h2>

                <div class="space-y-5">
                    <!-- Step 1 -->
                    <div class="bg-white border-2 border-slate-200 rounded-xl p-5 shadow-sm content-block">
                        <h3 class="text-xl font-bold text-slate-800 mb-3">1단계: 선 정리 (The Zero-Cable Approach)</h3>
                        <p class="text-sm text-slate-700 mb-3">비주얼 클린의 80%는 케이블 관리에서 결정됩니다. 전선은 뇌가 가장 복잡하다고 느끼는 선형 노이즈입니다.</p>
                        <ul class="space-y-2 text-sm text-slate-700">
                            <li class="flex items-start">
                                <span class="text-blue-600 mr-2">▸</span>
                                <span><strong>언더 데스크 매니지먼트:</strong> 멀티탭과 어댑터를 책상 아래 트레이에 숨기세요.</span>
                            </li>
                            <li class="flex items-start">
                                <span class="text-blue-600 mr-2">▸</span>
                                <span><strong>무선화(Wireless):</strong> 마우스, 키보드, 헤드셋 등을 무선으로 교체하여 책상 위 가로지르는 선을 제거합니다.</span>
                            </li>
                            <li class="flex items-start">
                                <span class="text-blue-600 mr-2">▸</span>
                                <span><strong>모니터 암 사용:</strong> 모니터 스탠드가 차지하는 바닥 면적을 없애 '공중에 떠 있는' 느낌을 줍니다.</span>
                            </li>
                        </ul>
                    </div>

                    <!-- Step 2 -->
                    <div class="bg-white border-2 border-slate-200 rounded-xl p-5 shadow-sm content-block">
                        <h3 class="text-xl font-bold text-slate-800 mb-3">2단계: 색상 및 톤의 통일 (Monochromatic Setup)</h3>
                        <p class="text-sm text-slate-700 mb-3">색상의 대비가 심하면 시선이 분산됩니다.</p>
                        <ul class="space-y-2 text-sm text-slate-700">
                            <li class="flex items-start">
                                <span class="text-blue-600 mr-2">▸</span>
                                <span><strong>데스크 패드 활용:</strong> 책상 상판과 대비가 적은 대형 데스크 패드를 깔아 시각적 영역을 하나로 묶어줍니다.</span>
                            </li>
                            <li class="flex items-start">
                                <span class="text-blue-600 mr-2">▸</span>
                                <span><strong>3색 규칙:</strong> 화이트/그레이/블랙 또는 우드/화이트 등 3가지 이상의 색상이 섞이지 않도록 주변 기기를 맞춥니다.</span>
                            </li>
                        </ul>
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

    <!-- Page 2: Steps 3-4, Tips, Student Strategy -->
    <div class="page">
        <div class="report-card">
            <div class="border-b-2 border-slate-200 pb-3 mb-6">
                <div class="text-blue-700 font-bold text-xs tracking-widest uppercase">Learning Strategy Guide</div>
                <h1 class="text-2xl font-black text-slate-800">데스크 셋업 (Visual Clean)</h1>
            </div>

            <section class="flex-1">
                <div class="space-y-5 mb-8">
                    <!-- Step 3 -->
                    <div class="bg-white border-2 border-slate-200 rounded-xl p-5 shadow-sm content-block">
                        <h3 class="text-xl font-bold text-slate-800 mb-3">3단계: 수납의 은폐 (Hidden Storage)</h3>
                        <p class="text-sm text-slate-700 mb-3">"보이지 않으면 존재하지 않는 것"으로 간주하는 뇌의 특성을 이용합니다.</p>
                        <ul class="space-y-2 text-sm text-slate-700">
                            <li class="flex items-start">
                                <span class="text-blue-600 mr-2">▸</span>
                                <span><strong>서랍 활용:</strong> 자주 쓰지 않는 필기구, USB, 약품 샘플 등은 모두 서랍 안으로 넣습니다.</span>
                            </li>
                            <li class="flex items-start">
                                <span class="text-blue-600 mr-2">▸</span>
                                <span><strong>트레이 시스템:</strong> 꼭 필요한 물건만 일정한 위치(Fixed Point)에 두어 시선이 헤매지 않게 합니다.</span>
                            </li>
                        </ul>
                    </div>

                    <!-- Step 4 -->
                    <div class="bg-white border-2 border-slate-200 rounded-xl p-5 shadow-sm content-block">
                        <h3 class="text-xl font-bold text-slate-800 mb-3">4단계: 여백의 미 (Negative Space)</h3>
                        <p class="text-sm text-slate-700">책상 상판의 <strong class="text-blue-600">60% 이상</strong>은 비워두는 것이 좋습니다. 빈 공간은 뇌에게 '휴식'의 신호를 보냅니다.</p>
                    </div>
                </div>

                <!-- Section 3 -->
                <h2 class="text-2xl font-bold text-slate-800 mb-4 flex items-center">
                    <span class="w-2 h-8 bg-blue-600 mr-3"></span>
                    3. 효과적으로 수행하기 위한 팁
                </h2>
                
                <div class="overflow-x-auto content-block mb-8">
                    <table class="w-full border-collapse bg-white shadow-sm rounded-lg overflow-hidden">
                        <thead>
                            <tr class="bg-slate-800 text-white">
                                <th class="p-3 text-left text-sm font-bold">구분</th>
                                <th class="p-3 text-left text-sm font-bold">전략</th>
                                <th class="p-3 text-left text-sm font-bold">기대 효과</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="border-b border-slate-200">
                                <td class="p-3 text-sm font-semibold text-slate-700">정리 루틴</td>
                                <td class="p-3 text-sm text-slate-700">퇴근 전 5분 '리셋' 타임</td>
                                <td class="p-3 text-sm text-slate-700">익일 업무 시 즉각 집중 모드</td>
                            </tr>
                            <tr class="border-b border-slate-200 bg-slate-50">
                                <td class="p-3 text-sm font-semibold text-slate-700">도구 선택</td>
                                <td class="p-3 text-sm text-slate-700">멀티 기능 장치 (올인원 독)</td>
                                <td class="p-3 text-sm text-slate-700">시각적 파편화 방지</td>
                            </tr>
                            <tr>
                                <td class="p-3 text-sm font-semibold text-slate-700">조명 활용</td>
                                <td class="p-3 text-sm text-slate-700">모니터 라이트바 사용</td>
                                <td class="p-3 text-sm text-slate-700">작업 영역만 시선 고정</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Section 4 -->
                <h2 class="text-2xl font-bold text-slate-800 mb-5 flex items-center">
                    <span class="w-2 h-8 bg-amber-600 mr-3"></span>
                    4. 수험생을 위한 핵심 전략
                </h2>

                <div class="space-y-4">
                    <div class="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 content-block">
                        <h3 class="text-base font-bold text-amber-900 mb-2">① '공부 외 요소'의 시각적 차단</h3>
                        <div class="text-xs text-amber-900 grid grid-cols-2 gap-2">
                             <div><strong>스마트폰 격리:</strong> 불투명 보관함 사용</div>
                             <div><strong>벽면 단순화:</strong> 포스트잇 최소화</div>
                        </div>
                    </div>

                    <div class="bg-emerald-50 border-2 border-emerald-300 rounded-xl p-4 content-block">
                        <h3 class="text-base font-bold text-emerald-900 mb-2">② '단일 작업' 환경 조성</h3>
                        <div class="text-xs text-emerald-800 grid grid-cols-2 gap-2">
                            <div><strong>과목 전환:</strong> 한 번에 한 과목 책만 책상 위에</div>
                            <div><strong>필기구:</strong> 펜 2~3개만 꺼내두기</div>
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

    <!-- Page 3: Location Strategy, Simulation, Summary -->
    <div class="page">
        <div class="report-card">
            <div class="border-b-2 border-slate-200 pb-3 mb-6">
                <div class="text-blue-700 font-bold text-xs tracking-widest uppercase">Learning Strategy Guide</div>
                <h1 class="text-2xl font-black text-slate-800">데스크 셋업 (Visual Clean)</h1>
            </div>

            <section class="flex-1">
                <!-- Section 5 -->
                <h2 class="text-2xl font-bold text-slate-800 mb-5 flex items-center">
                    <span class="w-2 h-8 bg-blue-600 mr-3"></span>
                    5. 장소별 맞춤 전략
                </h2>

                <div class="grid grid-cols-2 gap-5 mb-8">
                    <div class="bg-white border-2 border-blue-200 rounded-xl p-5 shadow-sm content-block">
                        <h3 class="text-lg font-bold text-blue-900 mb-4">🏫 도서실 (좁은 공간)</h3>
                        <div class="space-y-3 text-sm text-slate-700">
                            <div>
                                <div class="font-bold text-blue-700 mb-1">불투명 세로형 파일 꽂이</div>
                                <p class="text-xs">책 등(Spine)의 화려한 디자인이 보이지 않게 안쪽으로 돌려서 꽂으세요.</p>
                            </div>
                            <div>
                                <div class="font-bold text-blue-700 mb-1">펜 트레이 (서랍형)</div>
                                <p class="text-xs">지금 쓰는 펜 딱 하나만 책상에 올립니다.</p>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white border-2 border-emerald-200 rounded-xl p-5 shadow-sm content-block">
                        <h3 class="text-lg font-bold text-emerald-900 mb-4">🏠 집 (개방적 공간)</h3>
                        <div class="space-y-3 text-sm text-slate-700">
                            <div>
                                <div class="font-bold text-emerald-700 mb-1">데스크 패드 (대형)</div>
                                <p class="text-xs">'여기서부터 여기까지가 공부 영역'이라는 시각적 경계를 만듭니다.</p>
                            </div>
                            <div>
                                <div class="font-bold text-emerald-700 mb-1">이동식 트레이</div>
                                <p class="text-xs">책상 위에는 아무것도 두지 않고, 필요한 책만 트롤리에서 꺼냅니다.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Section 6 -->
                <h2 class="text-2xl font-bold text-slate-800 mb-4 flex items-center">
                    <span class="w-2 h-8 bg-red-600 mr-3"></span>
                    6. 수능 실전 시험장 시뮬레이션
                </h2>

                <div class="bg-red-50 border-2 border-red-300 rounded-xl p-5 mb-8 content-block">
                    <p class="text-sm text-red-900 mb-3">
                        <strong>수능 100일 전부터는</strong> 집이나 도서실 책상을 수능 시험장 책상(가로 60cm × 세로 40cm) 크기에 맞춰 비주얼 클린을 유지해야 합니다.
                    </p>
                    <div class="space-y-2 text-sm text-red-900 grid grid-cols-2">
                        <div class="flex items-start">
                            <span class="text-red-600 mr-2 font-bold">📏</span>
                            <span><strong>영역 제한:</strong> 마스킹 테이프로 크기 표시</span>
                        </div>
                        <div class="flex items-start">
                            <span class="text-red-600 mr-2 font-bold">⏰</span>
                            <span><strong>아날로그 시계:</strong> 정해진 위치 배치</span>
                        </div>
                    </div>
                </div>

                <!-- Section 7 -->
                <h2 class="text-2xl font-bold text-slate-800 mb-4 flex items-center">
                    <span class="w-2 h-8 bg-purple-600 mr-3"></span>
                    7. 이론적 요약: 환경적 넛지
                </h2>

                <div class="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-300 rounded-xl p-5 content-block">
                    <div class="flex items-center gap-4">
                        <div class="flex-1">
                             <p class="text-sm text-purple-900 leading-relaxed mb-2">
                                비주얼 클린은 뇌에게 <strong class="text-purple-700">"지금은 공부 외에 다른 선택지는 없다"</strong>는 강력한 신호를 보내는 환경적 넛지입니다.
                            </p>
                            <p class="text-xs text-purple-800 leading-relaxed">
                                물건을 치우는 행위 자체가 공부 시작을 알리는 <strong>의식(Ritual)</strong>이 되어 공부 모드로의 전환 속도를 높여줍니다.
                            </p>
                        </div>
                        <div class="bg-white p-3 rounded shadow-sm min-w-[150px]">
                            <div class="text-xs font-bold text-slate-700 mb-1">핵심 요약 5</div>
                            <ul class="text-[10px] text-slate-600 space-y-1">
                                <li>1. 선 정리 (80%)</li>
                                <li>2. 3색 규칙</li>
                                <li>3. 서랍/트레이 수납</li>
                                <li>4. 60% 여백</li>
                                <li>5. 단일 작업 환경</li>
                            </ul>
                        </div>
                    </div>
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
