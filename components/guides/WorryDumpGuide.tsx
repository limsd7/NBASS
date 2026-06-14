import React from 'react';

/**
 * Worry Dump Guide Component
 * 걱정 배출 (Worry Dump) 상세 가이드 - 새 브라우저 창에서 표시
 */

export const openWorryDumpGuide = () => {
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
    <title>걱정 배출 (Worry Dump) - 완전 가이드</title>
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
    
    <!-- Page 1: Theory & Step 1 -->
    <div class="page">
        <div class="report-card">
            <!-- Header -->
            <div class="border-b-2 border-blue-600 pb-4 mb-6">
                <div class="flex justify-between items-start">
                    <div>
                        <div class="text-blue-700 font-bold text-xs tracking-widest uppercase mb-2">Mental Care Strategy</div>
                        <h1 class="text-3xl font-black text-slate-800 mb-2">걱정 배출 (Worry Dump)</h1>
                        <p class="text-slate-600 text-sm">브레인 덤프(Brain Dump) 기법을 활용한 인지 부하 감소 및 불안 해소 가이드</p>
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
                <div class="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-500 mb-6 italic text-sm text-indigo-800 leading-relaxed content-block">
                    걱정 배출(Worry Dump)은 심리학적으로 <strong>'브레인 덤프(Brain Dump)'</strong>의 일종으로, 머릿속을 부유하며 에너지를 갉아먹는 '미완결된 생각'들을 외부 저장소(종이)로 옮기는 아주 강력한 도구입니다.
                </div>

                <!-- Section 1 -->
                <h2 class="text-2xl font-bold text-slate-800 mb-4 flex items-center">
                    <span class="w-2 h-8 bg-blue-600 mr-3"></span>
                    1. 이론적 배경: 왜 효과적인가?
                </h2>
                
                <div class="space-y-4 mb-8">
                    <div class="bg-white border border-slate-200 p-5 rounded-lg shadow-sm content-block">
                        <h3 class="text-lg font-bold text-slate-800 mb-2">① 인지 부하 이론 (Cognitive Load Theory)</h3>
                        <p class="text-sm text-slate-600 leading-relaxed">
                            인간의 작업 기억(Working Memory) 용량은 한계가 있습니다. 해결되지 않은 걱정은 뇌에서 '백그라운드 프로세스'처럼 계속 실행되며 에너지를 소모합니다. 이를 글로 적는 순간, 뇌는 정보를 유지해야 한다는 압박에서 벗어나 <strong>'외부 저장소로 이관됨'</strong>으로 인식하고 여유 공간을 확보합니다.
                        </p>
                    </div>

                    <div class="bg-white border border-slate-200 p-5 rounded-lg shadow-sm content-block">
                        <h3 class="text-lg font-bold text-slate-800 mb-2">② 자이가르닉 효과 (Zeigarnik Effect)</h3>
                        <p class="text-sm text-slate-600 leading-relaxed">
                            뇌는 완결되지 않은 일이나 해결되지 않은 문제를 더 오랫동안 기억하려는 성질이 있습니다. 걱정을 글로 적어 목록화하면, 뇌는 이를 하나의 <strong>'완료된 인지 단계'</strong>로 받아들여 집착을 멈춥니다.
                        </p>
                    </div>
                    
                    <div class="bg-white border border-slate-200 p-5 rounded-lg shadow-sm content-block">
                        <h3 class="text-lg font-bold text-slate-800 mb-2">③ 객관화 및 탈중심화 (Decentering)</h3>
                        <p class="text-sm text-slate-600 leading-relaxed">
                            머릿속에 있을 때는 '나'와 '걱정'이 하나처럼 느껴지지만, 종이 위에 적힌 글자를 보는 순간 걱정은 관찰의 대상이 됩니다. "나는 이 문제가 걱정된다"라는 주관적 감정에서 <strong class="text-blue-600">"이런 문제가 존재한다"</strong>라는 객관적 사실로 시점이 전환됩니다.
                        </p>
                    </div>
                </div>

                <!-- Section 2 -->
                <h2 class="text-2xl font-bold text-slate-800 mb-5 flex items-center">
                    <span class="w-2 h-8 bg-emerald-600 mr-3"></span>
                    2. 효과적인 수행 방법 (Step-by-Step)
                </h2>

                <div class="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-5 mb-6 content-block">
                    <h3 class="text-xl font-bold text-emerald-900 mb-3 flex items-center gap-2">
                        <span class="bg-white text-emerald-800 text-xs px-2 py-1 rounded border border-emerald-200">Step 1</span>
                        무조건 쏟아내기 (Unfiltered Dump)
                    </h3>
                    <ul class="space-y-2 text-sm text-emerald-900">
                        <li class="flex items-start gap-2">
                            <span class="font-bold text-emerald-600">▸</span>
                            <div><strong>형식 무시:</strong> 문법, 맞춤법, 논리를 따지지 말고 머릿속에 떠오르는 모든 불안 요소를 적습니다. (예: "내일 발표 망치면 어떡하지?", "냉장고에 우유 유통기한 지났나?")</div>
                        </li>
                        <li class="flex items-start gap-2">
                            <span class="font-bold text-emerald-600">▸</span>
                            <div><strong>제한 시간:</strong> 5~10분 정도 타이머를 맞추고 펜을 멈추지 않는 것이 중요합니다.</div>
                        </li>
                    </ul>
                </div>

            </section>
            
            <!-- Footer -->
            <div class="mt-auto pt-4 border-t border-slate-200 flex justify-between text-[10px] text-slate-400 font-medium">
                <p>© 2026 Mind-Body Connect. Evidence-Based Learning Strategies.</p>
                <p class="uppercase tracking-widest">PAGE 1</p>
            </div>
        </div>
    </div>

    <!-- Page 2: Steps 2-3 & Simulation -->
    <div class="page">
        <div class="report-card">
            <div class="border-b-2 border-slate-200 pb-3 mb-6">
                <div class="text-blue-700 font-bold text-xs tracking-widest uppercase">Mental Care Strategy</div>
                <h1 class="text-2xl font-black text-slate-800">걱정 배출 (Worry Dump)</h1>
            </div>

            <section class="flex-1">
                <!-- Step 2 -->
                <div class="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-5 mb-4 content-block">
                    <h3 class="text-xl font-bold text-emerald-900 mb-3 flex items-center gap-2">
                        <span class="bg-white text-emerald-800 text-xs px-2 py-1 rounded border border-emerald-200">Step 2</span>
                        통제 가능 여부 분류 (Categorization)
                    </h3>
                    <p class="text-sm text-emerald-800 mb-3">적어낸 목록 옆에 두 가지 기호를 표시합니다.</p>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="bg-white p-3 rounded-lg border border-emerald-100">
                            <div class="font-black text-emerald-600 text-lg mb-1">C (Control)</div>
                            <div class="text-xs text-slate-600 font-bold mb-1">내가 노력해서 해결할 수 있는 일</div>
                            <div class="text-[10px] text-slate-500">예: 시험 공부 하기, 세금 내기</div>
                        </div>
                        <div class="bg-white p-3 rounded-lg border border-emerald-100">
                            <div class="font-black text-rose-500 text-lg mb-1">U (Uncontrollable)</div>
                            <div class="text-xs text-slate-600 font-bold mb-1">내 힘으로 어쩔 수 없는 일</div>
                            <div class="text-[10px] text-slate-500">예: 날씨, 타인의 시선, 이미 일어난 과거</div>
                        </div>
                    </div>
                </div>

                 <!-- Step 3 -->
                 <div class="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-5 mb-8 content-block">
                    <h3 class="text-xl font-bold text-emerald-900 mb-3 flex items-center gap-2">
                        <span class="bg-white text-emerald-800 text-xs px-2 py-1 rounded border border-emerald-200">Step 3</span>
                        실행 계획 vs 수용 (Action or Acceptance)
                    </h3>
                    <div class="space-y-3 text-sm text-emerald-900">
                        <div class="flex gap-3">
                            <span class="font-bold bg-emerald-200 px-2 py-0.5 rounded text-emerald-800 h-fit text-xs">C 항목</span>
                            <span>바로 할 수 있는 <strong>'아주 작은 첫 단계'</strong>를 적습니다. (예: '보고서 쓰기' → '노트북 켜고 제목 적기')</span>
                        </div>
                        <div class="flex gap-3">
                            <span class="font-bold bg-rose-200 px-2 py-0.5 rounded text-rose-800 h-fit text-xs">U 항목</span>
                            <span>"이것은 내 통제 밖의 일이다"라고 소리 내어 읽거나, 선을 그어 지워버림으로써 인지적으로 수용합니다.</span>
                        </div>
                    </div>
                </div>

                <!-- Section 3: Simulation -->
                <h2 class="text-2xl font-bold text-slate-800 mb-5 flex items-center">
                    <span class="w-2 h-8 bg-purple-600 mr-3"></span>
                    3. 수험생 버전 '걱정 배출' 시뮬레이션
                </h2>
                
                <div class="bg-slate-50 p-5 rounded-xl border border-slate-200 content-block mb-6">
                    <p class="text-sm text-slate-700 mb-4 italic">
                        "수험생의 뇌는 '미완결된 태스크'와 '막연한 공포'로 인해 CPU 점유율이 100%에 도달한 상태입니다."
                    </p>

                    <div class="space-y-6">
                        <!-- Stage 1 -->
                        <div>
                            <div class="text-xs font-bold text-slate-500 uppercase mb-2">1단계: 10분간 무제한 배출 (Raw Dump)</div>
                            <div class="bg-white p-4 rounded-lg border border-slate-200 text-sm text-slate-600 grid grid-cols-2 gap-2 italic">
                                <div>"6평 때보다 등급 떨어지면 어떡하지?"</div>
                                <div>"오늘 비문학 하나도 못 했어."</div>
                                <div>"옆자리 애 다리 떠는 거 신경 쓰여."</div>
                                <div>"대학 못 가면 부모님 얼굴 어떻게 봐..."</div>
                                <div>"수학 킬러 문항 나오면 머리 하얘져."</div>
                                <div>"어제 먹은 점심 소화 안 돼."</div>
                            </div>
                        </div>

                        <!-- Stage 2 & 3 -->
                        <div>
                            <div class="text-xs font-bold text-slate-500 uppercase mb-2">2단계 & 3단계: 분류 및 재정의</div>
                            <div class="overflow-hidden rounded-lg border border-slate-200">
                                <table class="w-full text-sm">
                                    <thead class="bg-slate-100 text-slate-700 font-bold text-xs">
                                        <tr>
                                            <th class="p-2 text-left w-1/4">구분</th>
                                            <th class="p-2 text-left w-2/4">내용 (예시)</th>
                                            <th class="p-2 text-left w-1/4">처리 원칙</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-slate-100 bg-white">
                                        <tr>
                                            <td class="p-2 font-bold text-rose-500">통제 불가능 (U)</td>
                                            <td class="p-2 text-slate-600">수능 난이도, 타인의 시선, 이미 지나간 점수</td>
                                            <td class="p-2 text-slate-800 font-bold bg-rose-50">'관조와 방치'<br><span class="text-[10px] font-normal">적어두는 것만으로 끝내기</span></td>
                                        </tr>
                                        <tr>
                                            <td class="p-2 font-bold text-emerald-600">통제 가능 (C)</td>
                                            <td class="p-2 text-slate-600">오늘 공부 분량, 오답 정리, 수면 시간 조절</td>
                                            <td class="p-2 text-slate-800 font-bold bg-emerald-50">'작은 실행'<br><span class="text-[10px] font-normal">구체적인 행동으로 전환</span></td>
                                        </tr>
                                    </tbody>
                                </table>
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

    <!-- Page 3: Tips & Action Guide -->
    <div class="page">
        <div class="report-card">
            <div class="border-b-2 border-slate-200 pb-3 mb-6">
                <div class="text-blue-700 font-bold text-xs tracking-widest uppercase">Mental Care Strategy</div>
                <h1 class="text-2xl font-black text-slate-800">걱정 배출 (Worry Dump)</h1>
            </div>

            <section class="flex-1">
                 <!-- Section: Anxiety Refinement -->
                 <div class="bg-white border-l-4 border-purple-500 shadow-sm rounded-r-xl p-5 mb-8 content-block">
                    <h3 class="text-lg font-bold text-slate-800 mb-2">💡 불안의 실체 파악 (Refinement)</h3>
                    <p class="text-sm text-slate-600 mb-3">단순한 불안을 <strong>'해결해야 할 과제'</strong>로 치환합니다.</p>
                    <div class="flex flex-col gap-2 text-sm">
                        <div class="flex gap-2 items-center text-rose-600 bg-rose-50 p-2 rounded">
                            <span class="font-bold shrink-0 w-16">불안 (Before)</span>
                            <span>"대학 못 가면 내 인생은 끝이야." (막연한 공포)</span>
                        </div>
                        <div class="flex justify-center text-slate-400 text-xs">▼</div>
                        <div class="flex gap-2 items-start text-emerald-800 bg-emerald-50 p-2 rounded">
                            <span class="font-bold shrink-0 w-16">재정의 (After)</span>
                            <span>"나는 현재 내 성적으로 갈 수 있는 대학 정보가 부족해서 불안해하고 있구나. 수능 끝나고 입시 컨설팅을 활용하자. 지금은 문제집 한 장 더 푸는 게 내 점수를 바꾸는 유일한 길이다."</span>
                        </div>
                    </div>
                </div>

                <!-- Section 4: Tips -->
                <h2 class="text-2xl font-bold text-slate-800 mb-5 flex items-center">
                    <span class="w-2 h-8 bg-amber-500 mr-3"></span>
                    4. 더 효과적으로 수행하는 팁
                </h2>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                     <div class="bg-amber-50 p-4 rounded-xl border border-amber-100 content-block">
                        <h3 class="text-base font-bold text-amber-900 mb-2">✍️ 아날로그 방식 추천</h3>
                        <p class="text-xs text-amber-800 leading-relaxed">
                            키보드 타이핑보다 손으로 직접 쓰는 것이 뇌의 신경망을 더 자극하여 정서적 해소 효과(Catharsis)가 큽니다.
                        </p>
                    </div>
                     <div class="bg-amber-50 p-4 rounded-xl border border-amber-100 content-block">
                        <h3 class="text-base font-bold text-amber-900 mb-2">🌙 잠들기 전 루틴</h3>
                        <p class="text-xs text-amber-800 leading-relaxed">
                            밤에 생각이 많아 잠을 설친다면, 침대 옆에 노트를 두고 '걱정 배출'을 해보세요. 내일의 나에게 걱정을 맡기고 뇌를 '오프라인' 상태로 전환하세요.
                        </p>
                    </div>
                     <div class="bg-amber-50 p-4 rounded-xl border border-amber-100 content-block">
                        <h3 class="text-base font-bold text-amber-900 mb-2">💓 감정 단어 포함</h3>
                        <p class="text-xs text-amber-800 leading-relaxed">
                            "회사 일"이라고 적기보다 "무시당할까 봐 두렵다"처럼 감정의 본질을 적으면 불안의 실체가 더 명확히 드러납니다.
                        </p>
                    </div>
                </div>

                <!-- Theory Tip -->
                <div class="bg-slate-800 text-white p-5 rounded-xl mb-6 content-block">
                    <h4 class="font-bold text-lg text-yellow-400 mb-3">🎓 수험생에게 주는 이론적 팁</h4>
                    <div class="space-y-4">
                        <div>
                            <h5 class="font-bold text-sm mb-1 text-slate-200">1. 작업 기억 공간(Working Memory) 확보</h5>
                            <p class="text-xs text-slate-300 leading-relaxed">
                                공부 중에 잡생각이 떠오르면 "나중에 생각하자"라고 억누르지 마세요. 포스트잇에 한 줄 적어 옆에 붙여두는 것만으로도 뇌는 그 정보를 '임시 저장소'에 보관했다고 믿고, 다시 공부에 집중할 수 있게 해줍니다.
                            </p>
                        </div>
                        <div>
                            <h5 class="font-bold text-sm mb-1 text-slate-200">2. 부정적 편향 극복</h5>
                            <p class="text-xs text-slate-300 leading-relaxed">
                                뇌는 생존을 위해 부정적인 것에 5배 더 민감합니다. 글자로 적어서 눈으로 직접 보면, 그 걱정이 생각보다 '별거 아니거나' 혹은 <strong>'생각보다 가짓수가 적다'</strong>는 것을 깨닫게 됩니다.
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Action Guide Box -->
                <div class="border-2 border-dashed border-slate-300 bg-slate-50 p-4 rounded-lg text-center content-block">
                    <h4 class="font-black text-slate-700 text-lg mb-2">💡 실천 가이드: '걱정 수거함' 만들기</h4>
                    <p class="text-sm text-slate-600 mb-0">
                        독서실 책상 한구석에 <strong>'걱정 수거함(작은 메모지)'</strong>을 하나 두세요.<br>
                        공부하다 불안이 엄습할 때마다 딱 한 문장씩 적어서 던져 넣으세요.<br>
                        일과가 끝날 때 훑어보며 <strong>'통제 가능한 것'</strong>만 스케줄러에 옮기고 나머지는 휴지통에 버리세요.
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
