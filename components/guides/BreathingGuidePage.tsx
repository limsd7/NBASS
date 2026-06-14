import React from 'react';
import { BreathingCore } from '../BreathingGuide';

export const BreathingGuidePage: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-indigo-100 selection:text-indigo-900">
            {/* Header / Hero */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
                <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-200">
                            B
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 leading-none">4-7-8 호흡법</h1>
                            <p className="text-xs text-slate-500 font-medium mt-1">Brain Reset 완벽 가이드</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">

                {/* Intro Section with Widget */}
                <section className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold tracking-wide">
                            NERVOUS SYSTEM CALMING
                        </div>
                        <h2 className="text-4xl font-extrabold text-slate-900 leading-tight">
                            신경계의 <span className="text-indigo-600">천연 진정제</span>,<br />
                            4-7-8 호흡법
                        </h2>
                        <p className="text-lg text-slate-600 leading-relaxed">
                            세계적인 통합의학 전문가 앤드류 웨일(Andrew Weil) 박사가 대중화시킨 기법으로,
                            뇌를 안정시키고 스트레스 수치를 즉각적으로 낮추는 데 매우 효과적입니다.
                        </p>
                    </div>
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200 border border-slate-100">
                        <BreathingCore />
                    </div>
                </section>

                <hr className="border-slate-200" />

                {/* 1. How-to */}
                <section className="space-y-8">
                    <h3 className="text-2xl font-bold flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-sm font-bold">1</span>
                        단계별 수행 방법 (How-to)
                    </h3>

                    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                        <p className="text-slate-600 mb-6 font-medium text-center">
                            가장 중요한 것은 <span className="text-indigo-600 font-bold">'입으로 숨을 내뱉는 소리'</span>와 <span className="text-indigo-600 font-bold">'일정한 박자'</span>입니다.
                        </p>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Step 0</span>
                                <h4 className="font-bold text-slate-900 mb-2">준비</h4>
                                <p className="text-sm text-slate-600">편안한 자세로 앉거나 눕습니다. 혀끝을 윗니 뒤쪽 잇몸 조직에 살짝 댑니다. (수행 내내 유지)</p>
                            </div>
                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Step 0-1</span>
                                <h4 className="font-bold text-slate-900 mb-2">비우기</h4>
                                <p className="text-sm text-slate-600">입을 통해 "쉿~" 소리를 내며 폐의 공기를 완전히 내뱉습니다.</p>
                            </div>
                        </div>

                        <div className="mt-4 grid gap-4 md:grid-cols-3">
                            <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-6xl text-blue-900 group-hover:scale-110 transition-transform">4</div>
                                <h4 className="font-bold text-blue-900 mb-1 text-lg">코로 흡입</h4>
                                <p className="text-xs font-bold text-blue-600 mb-3 uppercase tracking-wider">4초</p>
                                <p className="text-sm text-blue-800 leading-snug">입을 다물고 코를 통해 천천히, 깊게 숨을 들이마십니다.</p>
                            </div>

                            <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-6xl text-amber-900 group-hover:scale-110 transition-transform">7</div>
                                <h4 className="font-bold text-amber-900 mb-1 text-lg">멈춤</h4>
                                <p className="text-xs font-bold text-amber-600 mb-3 uppercase tracking-wider">7초</p>
                                <p className="text-sm text-amber-800 leading-snug">숨을 참습니다. 이 단계에서 산소가 혈액으로 충분히 전달됩니다.</p>
                            </div>

                            <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-6xl text-emerald-900 group-hover:scale-110 transition-transform">8</div>
                                <h4 className="font-bold text-emerald-900 mb-1 text-lg">입으로 배출</h4>
                                <p className="text-xs font-bold text-emerald-600 mb-3 uppercase tracking-wider">8초</p>
                                <p className="text-sm text-emerald-800 leading-snug">입을 통해 "쉿~" 소리를 내며 길게 숨을 내뱉습니다.</p>
                            </div>
                        </div>

                        <div className="mt-6 flex items-start gap-3 p-4 bg-indigo-50 rounded-xl">
                            <span className="text-indigo-500 mt-0.5">💡</span>
                            <p className="text-sm text-indigo-800 font-medium">
                                Tip: 처음에는 7초간 숨을 참는 것이 힘들 수 있습니다. 박자의 절대적인 시간보다 <span className="font-bold underline">4:7:8의 비율을 유지하는 것</span>에 집중하세요.
                            </p>
                        </div>
                    </div>
                </section>

                {/* 2. Theory */}
                <section className="space-y-8">
                    <h3 className="text-2xl font-bold flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-sm font-bold">2</span>
                        이론적 유용성: 왜 'Brain Reset'인가?
                    </h3>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-xl flex items-center justify-center mb-4 text-2xl">🧘‍♀️</div>
                            <h4 className="font-bold text-slate-900 mb-2">부교감 신경계 활성화</h4>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                현대인은 스트레스로 인해 '투쟁-도피' 반응이 과도하게 활성화되어 있습니다. 4-7-8 호흡은 강제로 부교감 신경을 자극하여 심박수를 낮추고 이완합니다.
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4 text-2xl">🧠</div>
                            <h4 className="font-bold text-slate-900 mb-2">CO₂와 O₂의 균형</h4>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                숨을 참는 7초 동안 혈액 내 이산화탄소 농도가 미세하게 상승하며, 이는 뇌 혈관을 확장시켜 산소 공급을 원활하게 합니다.
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4 text-2xl">⚡</div>
                            <h4 className="font-bold text-slate-900 mb-2">미주 신경 자극</h4>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                횡격막을 깊게 사용하는 호흡은 뇌와 장기를 잇는 미주 신경을 자극하여, 신체에 "이제 안전하니 휴식하라"는 신호를 보냅니다.
                            </p>
                        </div>
                    </div>
                </section>

                {/* 3. Routine Table */}
                <section className="space-y-8">
                    <h3 className="text-2xl font-bold flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-sm font-bold">3</span>
                        메디컬 & 몰입형 데일리 루틴
                    </h3>

                    <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                                    <th className="p-4 font-bold">구분</th>
                                    <th className="p-4 font-bold">시간대</th>
                                    <th className="p-4 font-bold">주요 활동</th>
                                    <th className="p-4 font-bold">4-7-8 호흡 활용법</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                <tr className="hover:bg-slate-50/50">
                                    <td className="p-4 font-bold text-indigo-600">AM: 시동</td>
                                    <td className="p-4 text-slate-600">기상 직후</td>
                                    <td className="p-4 text-slate-800">암막 커튼 걷기, 미지근한 물 한 잔</td>
                                    <td className="p-4 bg-indigo-50/30 text-indigo-900 font-medium">3세트: 수면 모드에서 활동 모드로 뇌 깨우기</td>
                                </tr>
                                <tr className="hover:bg-slate-50/50">
                                    <td className="p-4 font-bold text-blue-600">AM: 집중</td>
                                    <td className="p-4 text-slate-600">진료 전</td>
                                    <td className="p-4 text-slate-800">당일 수술 스케줄 및 중요 차트 리뷰</td>
                                    <td className="p-4 bg-blue-50/30 text-blue-900 font-medium">2세트: 진료 전 평온한 심박수 유지 및 집중력 향상</td>
                                </tr>
                                <tr className="hover:bg-slate-50/50">
                                    <td className="p-4 font-bold text-amber-600">PM: 전환점</td>
                                    <td className="p-4 text-slate-600">점심 직후</td>
                                    <td className="p-4 text-slate-800">15분 짧은 휴식 또는 산책</td>
                                    <td className="p-4 bg-amber-50/30 text-amber-900 font-medium">4세트: 오전의 피로를 씻어내는 'Brain Reset'</td>
                                </tr>
                                <tr className="hover:bg-slate-50/50">
                                    <td className="p-4 font-bold text-purple-600">PM: 창의</td>
                                    <td className="p-4 text-slate-600">진료 종료 후</td>
                                    <td className="p-4 text-slate-800">AI 개발 연구 및 EMR 로직 설계</td>
                                    <td className="p-4 bg-purple-50/30 text-purple-900 font-medium">3세트: '의사' 모드에서 '개발자' 모드로 사고 전환</td>
                                </tr>
                                <tr className="hover:bg-slate-50/50">
                                    <td className="p-4 font-bold text-slate-600">PM: 종료</td>
                                    <td className="p-4 text-slate-600">취침 20분 전</td>
                                    <td className="p-4 text-slate-800">스마트폰 차단, 수납/배치 정리</td>
                                    <td className="p-4 bg-slate-100/50 text-slate-900 font-medium">4-8세트: 부교감 신경 활성화를 통한 깊은 숙면 유도</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* 4. Tips & Caution */}
                <div className="grid md:grid-cols-2 gap-8">
                    <section className="space-y-6">
                        <h3 className="text-xl font-bold text-slate-900">💡 효과 높이는 3가지 디테일</h3>
                        <div className="space-y-4">
                            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
                                <h4 className="font-bold text-slate-900 mb-1">1. 환경적 트리거 설정</h4>
                                <p className="text-sm text-slate-600">전용 의자나 구역을 정하세요. 그곳에 앉는 것만으로도 뇌가 이완 신호를 받습니다.</p>
                            </div>
                            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
                                <h4 className="font-bold text-slate-900 mb-1">2. 뽀모도로 결합</h4>
                                <p className="text-sm text-slate-600">50분 집중 후 10분 휴식의 시작을 이 호흡법 2회로 시작하세요. 거북목 예방에도 좋습니다.</p>
                            </div>
                            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
                                <h4 className="font-bold text-slate-900 mb-1">3. 감정적 평온 유지</h4>
                                <p className="text-sm text-slate-600">스트레스 상황 발생 시 즉시 3번 반복하세요. 편도체 과활성화를 막아줍니다.</p>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-6">
                        <h3 className="text-xl font-bold text-rose-600">⚠️ 주의사항</h3>
                        <div className="bg-rose-50 p-6 rounded-3xl border border-rose-100 space-y-4">
                            <div>
                                <h4 className="font-bold text-rose-900 mb-1">과호흡 주의</h4>
                                <p className="text-sm text-rose-800">처음에는 어지러울 수 있습니다. 한번에 4회 이상 하지 마세요. 익숙해지면 8회까지 늘리세요.</p>
                            </div>
                            <div className="w-full h-px bg-rose-200 my-2"></div>
                            <div>
                                <h4 className="font-bold text-rose-900 mb-1">억지로 참지 않기</h4>
                                <p className="text-sm text-rose-800">7초가 고통스럽다면 박자를 빠르게 세어 본인에게 맞는 속도를 찾으세요.</p>
                            </div>
                        </div>
                        <div className="bg-slate-900 text-white p-6 rounded-3xl mt-4">
                            <p className="font-serif italic text-center opacity-80">
                                "호흡은 몸과 마음을 연결하는<br />가장 강력한 도구입니다."
                            </p>
                        </div>
                    </section>
                </div>

            </div>
        </div>
    );
};
