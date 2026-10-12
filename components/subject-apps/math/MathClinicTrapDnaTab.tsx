import React from 'react';
import { TrapType } from '../../../types';
import { MathClinicController } from './useMathClinic';

interface Props {
    controller: MathClinicController;
}

/* ==================== TAB 4: 내 계산 실수 & 함정 DNA ==================== */
export const MathClinicTrapDnaTab: React.FC<Props> = ({ controller }) => {
    const { trapDna, student } = controller;

    return (
        <div className="space-y-6">
            <div className="pb-4 border-b border-slate-800">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <span>🧬</span>
                    <span>내 수학 계산 실수 & 함정 DNA 분석 (Trap DNA)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                    수능 4점 준킬러 풀이 시 학생이 반복해서 무너지는 '계산 및 발문 인지 오류 패턴'을 진단합니다.
                </p>
            </div>

            {/* 핵심 지표 3종 카드 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800">
                    <span className="text-xs text-slate-400 font-bold">누적 준킬러 정답률</span>
                    <div className="text-2xl font-black text-white mt-1">
                        {trapDna?.accuracyRate ?? 0}%
                    </div>
                    <span className="text-[10px] text-slate-500 mt-0.5 block">총 {trapDna?.totalAttempts ?? 0}회 풀이 중 {trapDna?.correctCount ?? 0}문항 정답</span>
                </div>

                <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800">
                    <span className="text-xs text-slate-400 font-bold">평균 준킬러 소요 시간</span>
                    <div className="text-2xl font-black text-purple-400 mt-1">
                        {trapDna?.avgSolveSec ?? 0}초
                    </div>
                    <span className="text-[10px] text-slate-500 mt-0.5 block">이상적인 실전 목표: 60~90초 이내</span>
                </div>

                <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800">
                    <span className="text-xs text-slate-400 font-bold">인지 과부하 (120초 초과)</span>
                    <div className="text-2xl font-black text-rose-400 mt-1">
                        {trapDna?.cognitiveOverloadCount ?? 0}회
                    </div>
                    <span className="text-[10px] text-slate-500 mt-0.5 block">발문 조건 해석 지연 및 연산 정체 횟수</span>
                </div>
            </div>

            {/* 수학 5대 함정별 오답률 프로파일 */}
            <div className="bg-slate-950/80 p-6 rounded-3xl border border-slate-800 space-y-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    수학 5대 인지 계산 실수 유형별 취약도
                </h4>

                <div className="space-y-3">
                    {[
                        { key: 'sign_flip' as TrapType, name: '1. 부호 실수 / 이항 전개 오류', desc: '이항 시 부호 반전 누락, 전개 시 마이너스 부호 분배 실수' },
                        { key: 'boundary_value' as TrapType, name: '2. 경계값 / 등호 누락 / 정수 조건', desc: '닫힌구간 끝점 미확인, 부등식 등호 성립 여부, 자연수 조건 간과' },
                        { key: 'condition_omission' as TrapType, name: '3. 발문 조건 [가], [나] 간과', desc: '주어진 조건 3개 중 마지막 1개를 쓰지 않고 섣불리 답 도출' },
                        { key: 'calc_overload' as TrapType, name: '4. 계산 과부하 / 무리한 식 전개', desc: '비율 관계나 대칭성을 보지 못하고 3~4차 전개를 무식하게 밀고 나가는 오류' },
                        { key: 'graph_misassumption' as TrapType, name: '5. 그래프 개형 임의 단정', desc: '극값의 유무나 대칭성 조건을 확인하지 않고 특정 개형으로 확정해 오답 유발' }
                    ].map(item => {
                        const data = trapDna?.trapBreakdown?.[item.key] || { attempts: 0, failedCount: 0, failRate: 0 };
                        const isMostVulnerable = trapDna?.mostVulnerableTrap === item.key;

                        return (
                            <div key={item.key} className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                                <div className="flex items-center justify-between text-xs font-bold">
                                    <span className="text-white flex items-center gap-2">
                                        <span>{item.name}</span>
                                        {isMostVulnerable && (
                                            <span className="bg-rose-500/20 text-rose-300 text-[10px] px-2 py-0.2 rounded-full border border-rose-500/40">
                                                최대 취약 Trap
                                            </span>
                                        )}
                                    </span>
                                    <span className="text-slate-400">
                                        오답률 <strong className={data.failRate > 40 ? 'text-rose-400' : 'text-slate-200'}>{data.failRate}%</strong> ({data.failedCount}/{data.attempts})
                                    </span>
                                </div>
                                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${isMostVulnerable ? 'bg-rose-500' : 'bg-purple-600'
                                            }`}
                                        style={{ width: `${data.failRate}%` }}
                                    />
                                </div>
                                <p className="text-[11px] text-slate-500">{item.desc}</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* AI 맞춤 처방 솔루션 */}
            <div className="p-5 bg-gradient-to-r from-purple-950/60 to-indigo-950/60 rounded-3xl border border-purple-500/40 space-y-2">
                <span className="text-xs font-black text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span>💡</span>
                    <span>AI 수학 맞춤 처방전 (3등급 ➔ 1등급)</span>
                </span>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    현재 <strong>{student.name}</strong> 학생의 목표 1등급 달성을 위한 최대 핵심은 <strong>"발문 조건을 3단계로 먼저 쪼개어 적고, 세로 2단 줄맞춤으로 연산 실수를 차단하는 것"</strong>입니다.
                    풀이 공간을 가로로 길게 쓰지 말고 세로 2단으로 구획하여 좌측단에 식 정리, 우측단에 대입 계산을 전개하는 습관만 들이면 계산 실수로 잃는 8~12점(4점 준킬러 2~3문항)을 온전히 회수할 수 있습니다.
                </p>
            </div>
        </div>
    );
};

export default MathClinicTrapDnaTab;