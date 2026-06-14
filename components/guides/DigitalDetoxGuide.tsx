import React from 'react';

/**
 * Digital Detox Guide Component
 * 디지털 디톡스 상세 가이드 - 새 브라우저 창에서 표시
 */

export const openDigitalDetoxGuide = () => {
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
    <title>디지털 디톡스 (Dopamine Control) - 완전 가이드</title>
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
    
    <!-- Page 1: Theory & Steps 1-2 -->
    <div class="page">
        <div class="report-card">
            <!-- Header -->
            <div class="border-b-2 border-blue-600 pb-4 mb-6">
                <div class="flex justify-between items-start">
                    <div>
                        <div class="text-blue-700 font-bold text-xs tracking-widest uppercase mb-2">Learning Strategy Guide</div>
                        <h1 class="text-3xl font-black text-slate-800 mb-2">디지털 디톡스 (Dopamine Control)</h1>
                        <p class="text-slate-600 text-sm">도파민 회로를 정상화하여 삶의 주도권과 몰입력을 되찾는 과학적 전략</p>
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
                    디지털 디톡스는 단순한 '스마트폰 멀리하기'를 넘어, 뇌의 보상 체계인 도파민 회로를 정상화하는 과정입니다. 끊임없는 자극에 노출된 현대인의 뇌는 작은 자극에는 반응하지 않는 '도파민 내성' 상태에 빠지기 쉬우며, 이를 관리함으로써 삶의 주도권을 되찾을 수 있습니다.
                </div>

                <!-- Section 1 -->
                <h2 class="text-2xl font-bold text-slate-800 mb-4 flex items-center">
                    <span class="w-2 h-8 bg-blue-600 mr-3"></span>
                    1. 이론적 배경: 왜 도파민을 관리해야 하는가?
                </h2>
                
                <div class="space-y-4 mb-8">
                    <div class="bg-indigo-50 border-l-4 border-indigo-600 p-5 rounded-lg content-block">
                        <h3 class="text-lg font-bold text-indigo-900 mb-3">항상성(Homeostasis)과 대립 과정 이론</h3>
                        <p class="text-sm text-indigo-800 leading-relaxed mb-3">
                            도파민은 무언가를 '할 때'보다 그것을 '기대할 때' 더 많이 분비됩니다. 스마트폰의 알림, 숏폼 영상의 무한 스크롤은 뇌에 지속적인 '보상 예측 오류'를 일으켜 뇌를 과부하 상태로 만듭니다.
                        </p>
                        <p class="text-xs text-indigo-700 bg-white/50 p-2 rounded">
                            뇌는 쾌락(도파민)이 커지면 반대로 고통의 무게추를 달아 평형을 맞추려 합니다. 과도한 자극 후 찾아오는 공허함과 무기력은 이 평형 작용의 결과입니다.
                        </p>
                    </div>

                    <div class="bg-emerald-50 border-l-4 border-emerald-600 p-5 rounded-lg content-block">
                        <h3 class="text-lg font-bold text-emerald-900 mb-2">전두엽 기능의 회복</h3>
                        <p class="text-sm text-emerald-800 leading-relaxed">
                            끊임없는 자극은 인지 통제력을 담당하는 전두엽 기능을 약화시킵니다. 디톡스를 통해 자극과 반응 사이의 '공간'을 확보하면 집중력과 의사결정 능력이 향상됩니다.
                        </p>
                    </div>
                </div>

                <!-- Section 2 -->
                <h2 class="text-2xl font-bold text-slate-800 mb-5 flex items-center">
                    <span class="w-2 h-8 bg-blue-600 mr-3"></span>
                    2. 단계별 실천 방법 (Dopamine Fasting)
                </h2>

                <div class="space-y-5">
                    <!-- Step 1 -->
                    <div class="bg-white border-2 border-slate-200 rounded-xl p-5 shadow-sm content-block">
                        <h3 class="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <span class="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">1단계</span>
                            물리적 환경 설정 (가장 중요)
                        </h3>
                        <ul class="space-y-2 text-sm text-slate-700">
                            <li class="flex items-start">
                                <span class="text-blue-600 mr-2 font-bold">✓</span>
                                <div><strong>침대 위 스마트폰 금지:</strong> 잠들기 1시간 전과 기상 후 1시간은 스마트폰을 물리적으로 다른 방에 둡니다.</div>
                            </li>
                            <li class="flex items-start">
                                <span class="text-blue-600 mr-2 font-bold">✓</span>
                                <div><strong>알림의 최소화:</strong> 필수 연락(전화, 문자)을 제외한 모든 앱의 푸시 알림을 끕니다.</div>
                            </li>
                            <li class="flex items-start">
                                <span class="text-blue-600 mr-2 font-bold">✓</span>
                                <div><strong>흑백 모드 설정:</strong> 스마트폰 화면을 흑백(Grayscale)으로 변경하세요. 시각적 자극이 줄어들어 사용 시간이 급감합니다.</div>
                            </li>
                        </ul>
                    </div>

                    <!-- Step 2 -->
                    <div class="bg-white border-2 border-slate-200 rounded-xl p-5 shadow-sm content-block">
                        <h3 class="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <span class="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">2단계</span>
                            시간적 제한 설정
                        </h3>
                        <div class="grid grid-cols-2 gap-4">
                            <div class="bg-slate-50 p-3 rounded-lg">
                                <div class="font-bold text-slate-700 mb-1">디지털 프리 존 (Free Zone)</div>
                                <p class="text-xs text-slate-600">식사 시간, 화장실, 산책 시에는 스마트폰을 지참하지 않습니다.</p>
                            </div>
                            <div class="bg-slate-50 p-3 rounded-lg">
                                <div class="font-bold text-slate-700 mb-1">앱 타이머 활용</div>
                                <p class="text-xs text-slate-600">SNS나 유튜브 사용 시간을 하루 30분~1시간으로 시스템적으로 제한합니다.</p>
                            </div>
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

    <!-- Page 2: Strategies & Student Guide -->
    <div class="page">
        <div class="report-card">
            <div class="border-b-2 border-slate-200 pb-3 mb-6">
                <div class="text-blue-700 font-bold text-xs tracking-widest uppercase">Learning Strategy Guide</div>
                <h1 class="text-2xl font-black text-slate-800">디지털 디톡스 (Dopamine Control)</h1>
            </div>

            <section class="flex-1">
                <!-- Step 3 from previous section (moved to fit layout) -->
                <div class="bg-white border-2 border-slate-200 rounded-xl p-5 shadow-sm mb-8 content-block">
                    <h3 class="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <span class="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">3단계</span>
                        대체 보상 찾기 (느린 도파민)
                    </h3>
                    <p class="text-sm text-slate-700 mb-3">도파민을 아예 분비시키지 않는 것이 아니라, 건강한 <strong>'느린 도파민(Slow Dopamine)'</strong>으로 교체해야 합니다.</p>
                    <div class="flex gap-4">
                        <div class="flex-1 bg-red-50 p-3 rounded-lg border border-red-100">
                            <div class="text-xs font-bold text-red-500 uppercase mb-1">🚫 피해야 할 것 (즉각적 보상)</div>
                            <p class="text-sm font-bold text-red-800">릴스, 쇼츠, 게임, 배달 음식</p>
                        </div>
                        <div class="flex-1 bg-green-50 p-3 rounded-lg border border-green-100">
                            <div class="text-xs font-bold text-green-500 uppercase mb-1">✅ 권장하는 것 (지연된 보상)</div>
                            <p class="text-sm font-bold text-green-800">독서, 운동, 악기 연주, 요리, 명상</p>
                        </div>
                    </div>
                </div>

                <!-- Section 3 -->
                <h2 class="text-2xl font-bold text-slate-800 mb-4 flex items-center">
                    <span class="w-2 h-8 bg-purple-600 mr-3"></span>
                    3. 효과적으로 수행하기 위한 심리적 전략
                </h2>
                
                <div class="overflow-x-auto content-block mb-8">
                    <table class="w-full border-collapse bg-white shadow-sm rounded-lg overflow-hidden">
                        <thead>
                            <tr class="bg-slate-800 text-white">
                                <th class="p-3 text-left text-sm font-bold w-1/4">전략</th>
                                <th class="p-3 text-left text-sm font-bold">내용</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="border-b border-slate-200">
                                <td class="p-3 text-sm font-semibold text-slate-700">마찰력 높이기</td>
                                <td class="p-3 text-sm text-slate-700">앱을 폴더 깊숙이 숨기거나, 사용할 때마다 로그아웃하여 접속 과정을 번거롭게 만듭니다.</td>
                            </tr>
                            <tr class="border-b border-slate-200 bg-slate-50">
                                <td class="p-3 text-sm font-semibold text-slate-700">결핍의 즐거움</td>
                                <td class="p-3 text-sm text-slate-700">심심함(Boredom)을 견디세요. 뇌가 쉴 때 창의적인 '디폴트 모드 네트워크'가 활성화됩니다.</td>
                            </tr>
                            <tr>
                                <td class="p-3 text-sm font-semibold text-slate-700">20분 법칙</td>
                                <td class="p-3 text-sm text-slate-700">충동이 들 때 딱 20분만 참아보세요. 충동의 파도는 대개 15~20분 내에 잦아듭니다.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Section 4 -->
                <h2 class="text-2xl font-bold text-slate-800 mb-5 flex items-center">
                    <span class="w-2 h-8 bg-amber-600 mr-3"></span>
                    4. 수험생을 위한 집중력 최적화 전략
                </h2>

                <div class="space-y-4 mb-4">
                    <div class="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 content-block">
                        <h3 class="text-base font-bold text-amber-900 mb-2">① 물리적 격리: "눈에서 멀어지면 마음에서도 멀어진다"</h3>
                        <p class="text-xs text-amber-800 mb-2">의지력을 소모하지 않는 것이 핵심입니다. 공부 시작 전 의지력을 '참기'에 쓰면 공부할 에너지가 고갈됩니다.</p>
                        <div class="grid grid-cols-3 gap-2 text-xs">
                            <div class="bg-white/60 p-2 rounded"><strong>타임 락 박스:</strong> 설정 시간 동안 절대 열리지 않음</div>
                            <div class="bg-white/60 p-2 rounded"><strong>외출 시 미지참:</strong> 독서실 갈 때 집에 두고 가기</div>
                            <div class="bg-white/60 p-2 rounded"><strong>충전 장소 분리:</strong> 책상 대신 거실에서 충전</div>
                        </div>
                    </div>

                    <div class="bg-emerald-50 border-2 border-emerald-300 rounded-xl p-4 content-block">
                        <h3 class="text-base font-bold text-emerald-900 mb-2">② 기기 설정: "재미없는 돌덩이로 만들기"</h3>
                        <div class="space-y-2 text-xs text-emerald-800">
                             <div class="flex items-start gap-2">
                                <span class="text-emerald-600 font-bold">▸</span>
                                <div><strong>화면 흑백 모드:</strong> 인스타그램의 화려한 색감이 무채색이 되는 순간, 뇌는 즉시 흥미를 잃습니다.</div>
                             </div>
                             <div class="flex items-start gap-2">
                                <span class="text-emerald-600 font-bold">▸</span>
                                <div><strong>모든 알림 끄기:</strong> 재난 문자를 제외한 카톡, 인스타, 유튜브 알림을 차단하세요.</div>
                             </div>
                             <div class="flex items-start gap-2">
                                <span class="text-emerald-600 font-bold">▸</span>
                                <div><strong>공부 전용 태블릿:</strong> 엔터테인먼트 앱 미설치 또는 스크린 타임으로 특정 시간대 차단.</div>
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

    <!-- Page 3: App Specific & Tools -->
    <div class="page">
        <div class="report-card">
            <div class="border-b-2 border-slate-200 pb-3 mb-6">
                <div class="text-blue-700 font-bold text-xs tracking-widest uppercase">Learning Strategy Guide</div>
                <h1 class="text-2xl font-black text-slate-800">디지털 디톡스 (Dopamine Control)</h1>
            </div>

            <section class="flex-1">
                <div class="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-4 mb-8 content-block">
                    <h3 class="text-base font-bold text-indigo-900 mb-3">③ 심리적 전략: "도파민 보상 체계 재설계"</h3>
                    <div class="space-y-3 text-xs text-indigo-900">
                        <div class="flex gap-2">
                            <span class="font-bold bg-indigo-200 px-2 py-0.5 rounded text-indigo-800 h-fit">뽀모도로+아날로그</span>
                            <span>쉬는 시간에 폰 대신 스트레칭, 물 마시기, 창밖 보기를 하세요. 폰을 보면 뇌는 쉬지 못합니다.</span>
                        </div>
                        <div class="flex gap-2">
                            <span class="font-bold bg-indigo-200 px-2 py-0.5 rounded text-indigo-800 h-fit">성취 기록</span>
                            <span>앱 대신 종이 플래너에 공부량을 체크하고 형광펜으로 지워나가는 시각적 피드백을 활용하세요.</span>
                        </div>
                        <div class="flex gap-2">
                            <span class="font-bold bg-indigo-200 px-2 py-0.5 rounded text-indigo-800 h-fit">아침 노 폰</span>
                            <span>기상 직후 최소 2시간은 아날로그 상태를 유지하여 하루의 도파민 기준치를 낮게 유지하세요.</span>
                        </div>
                    </div>
                </div>

                <!-- Section 5: App Specific -->
                <h2 class="text-2xl font-bold text-slate-800 mb-5 flex items-center">
                    <span class="w-2 h-8 bg-red-600 mr-3"></span>
                    5. 상황별 맞춤 행동 처방
                </h2>

                <div class="grid grid-cols-2 gap-4 mb-8">
                    <div class="bg-white border-2 border-slate-200 rounded-xl p-4 shadow-sm content-block">
                        <h3 class="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
                            <span class="text-pink-600">📸</span> 인스타그램
                        </h3>
                        <p class="text-xs text-slate-500 mb-3 font-semibold">공부 시작 전 / 집중력 흐트러질 때</p>
                        <ul class="text-xs text-slate-700 space-y-2">
                            <li><strong>The 5-Minute Rule:</strong> 목적 없는 접속이면 5분 눈 감고 호흡하기</li>
                            <li><strong>물리적 마찰:</strong> 앱 삭제 후 웹으로만 접속 (매번 로그인)</li>
                            <li><strong>피드 교체:</strong> 탐색 탭 유도 계정은 팔로우 취소</li>
                        </ul>
                    </div>
                    
                    <div class="bg-white border-2 border-slate-200 rounded-xl p-4 shadow-sm content-block">
                        <h3 class="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
                            <span class="text-red-600">▶️</span> 유튜브
                        </h3>
                        <p class="text-xs text-slate-500 mb-3 font-semibold">모르는 내용 검색 / 휴식 시간</p>
                        <ul class="text-xs text-slate-700 space-y-2">
                            <li><strong>Search Only:</strong> 'Unhook' 확장 프로그램으로 추천 영상 숨기기</li>
                            <li><strong>기기 분리:</strong> 인강은 태블릿/PC, 폰은 다른 방</li>
                            <li><strong>소리만 이용:</strong> 휴식 땐 영상 대신 음악/팟캐스트</li>
                        </ul>
                    </div>
                    
                    <div class="bg-white border-2 border-slate-200 rounded-xl p-4 shadow-sm col-span-2 content-block">
                        <h3 class="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
                            <span class="text-green-600">🎨</span> 웹툰
                        </h3>
                        <p class="text-xs text-slate-500 mb-2 font-semibold">"딱 한 편만 더" (밤, 휴식 직후)</p>
                        <div class="flex gap-4 text-xs">
                             <div class="flex-1 space-y-1">
                                <div><strong>흑백 모드:</strong> 색감이 사라지면 몰입도가 70% 급감합니다.</div>
                                <div><strong>결제 중단:</strong> 쿠키/코인 충전 금지로 장애물 만들기.</div>
                             </div>
                             <div class="flex-1 space-y-1">
                                <div><strong>대체 서사:</strong> 짧은 수필이나 비문학 읽기로 대체.</div>
                                <div><strong>Cliffhanger:</strong> 다음 화 궁금증을 텍스트로 대체하여 해소.</div>
                             </div>
                        </div>
                    </div>
                </div>

                <!-- Section 6: Tools -->
                <h2 class="text-2xl font-bold text-slate-800 mb-4 flex items-center">
                    <span class="w-2 h-8 bg-slate-600 mr-3"></span>
                    6. 추천 도구 (App & Item)
                </h2>

                 <div class="overflow-x-auto content-block mb-4">
                    <table class="w-full border-collapse bg-white shadow-sm rounded-lg overflow-hidden">
                        <thead>
                            <tr class="bg-slate-700 text-white">
                                <th class="p-2 text-left text-xs font-bold">구분</th>
                                <th class="p-2 text-left text-xs font-bold">도구</th>
                                <th class="p-2 text-left text-xs font-bold">효과</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="border-b border-slate-200">
                                <td class="p-2 text-xs font-semibold text-slate-700 bg-slate-50">차단 앱</td>
                                <td class="p-2 text-xs text-slate-700 font-bold">열품타, Forest</td>
                                <td class="p-2 text-xs text-slate-700">다른 앱 사용 제한, 참는 재미(나무 키우기) 부여</td>
                            </tr>
                            <tr class="border-b border-slate-200">
                                <td class="p-2 text-xs font-semibold text-slate-700 bg-slate-50">물리 도구</td>
                                <td class="p-2 text-xs text-slate-700 font-bold">스톱워치, 타임락박스</td>
                                <td class="p-2 text-xs text-slate-700">폰 타이머 대체, 시선 분산 방지, 물리적 강제</td>
                            </tr>
                           <tr>
                                <td class="p-2 text-xs font-semibold text-slate-700 bg-slate-50">대체품</td>
                                <td class="p-2 text-xs text-slate-700 font-bold">MP3, PMP</td>
                                <td class="p-2 text-xs text-slate-700">통신 기능 없는 기기로 음악/인강 청취</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="bg-slate-800 text-white p-4 rounded-xl text-center content-block">
                    <p class="text-sm font-medium opacity-90 mb-1">"의지력은 한정된 자원입니다."</p>
                    <p class="text-lg font-bold">의지로 참지 말고, 환경을 바꿔 뇌를 편안하게 해주세요.</p>
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
