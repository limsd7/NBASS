import React, { useState, useEffect } from 'react';
import { AssessmentResult } from '../../types';
import { unifiedSyncService as DatabaseService } from '../../services/unifiedSyncService';
import type { HistoryRecord } from '../../services/database';
import { BalanceChart } from '../Charts';
import { UserTierService } from '../../services/userTierService';
import { MembershipTier, TIER_INFO } from '../../utils/featureGate';

interface ParentDashboardProps {
  studentName?: string;
  recentResult?: AssessmentResult | null;
  onViewReport: (record?: AssessmentResult) => void;
  onLogout: () => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({
  studentName = '수험생',
  recentResult,
  onViewReport,
  onLogout
}) => {
  const [allRecords, setAllRecords] = useState<HistoryRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<AssessmentResult | null>(recentResult || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    DatabaseService.getAllHistory().then(records => {
      setAllRecords(records);
      if (!selectedRecord && records.length > 0) {
        setSelectedRecord(records[0]);
      }
    }).catch(err => {
      console.error('Failed to load history for parent dashboard:', err);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  const currentStudentName = selectedRecord?.student?.name || studentName;
  const currentTier: MembershipTier = selectedRecord?.student 
    ? UserTierService.getEffectiveTier(selectedRecord.student.id || selectedRecord.student.name, (selectedRecord.student.membershipTier as MembershipTier) || 'free')
    : 'free';
  const tierInfo = TIER_INFO[currentTier] || TIER_INFO.free;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-slate-900 border-b border-slate-800 p-4 md:px-8 flex flex-wrap justify-between items-center gap-4 shadow-xl sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={onLogout}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 shadow"
            title="관리자 포털로 돌아가기"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            <span>← 관리자 포털</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl">👨‍👩‍👧‍👦</span>
            <div>
              <h1 className="font-extrabold text-lg md:text-xl text-white">학부모 자녀 케어 관제 센터</h1>
              <p className="text-[11px] text-emerald-400 font-semibold">비밀번호 로그인 없이 전체 자녀 리포트 &amp; 주간 알림톡 즉시 열람</p>
            </div>
          </div>
        </div>

        {/* Student Selector Dropdown */}
        <div className="flex items-center gap-3">
          {allRecords.length > 0 && (
            <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-700">
              <span className="text-xs text-slate-400 font-bold">자녀 선택:</span>
              <select
                value={(selectedRecord as any)?.id || selectedRecord?.student?.name || ''}
                onChange={(e) => {
                  const found = allRecords.find(r => (r.id ? String(r.id) === e.target.value : r.student.name === e.target.value));
                  if (found) setSelectedRecord(found);
                }}
                className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer"
              >
                {allRecords.map((r, i) => (
                  <option key={r.id || i} value={r.id ? String(r.id) : r.student.name} className="bg-slate-900 text-white">
                    {r.student?.name || '학생'} ({r.date || r.student?.testDate || '최근'}) - {(r.careType as any)?.label || r.careType || (r as any).dominantCareType || '정상'}
                  </option>
                ))}
              </select>
            </div>
          )}
          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold">
            {tierInfo.icon} {tierInfo.name}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full space-y-6">
        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-indigo-950/60 p-6 md:p-8 rounded-3xl border border-emerald-500/30 shadow-2xl flex flex-wrap items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/60 text-emerald-300 text-xs font-bold border border-emerald-500/40 mb-3">
              <span>🌱 학부모 실시간 모니터링 모드</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white">
              <span className="text-emerald-400">{currentStudentName}</span> 수험생 자녀 안심 케어 현황
            </h2>
            <p className="text-slate-400 text-xs md:text-sm mt-2 max-w-2xl">
              자녀의 뇌-신체 스트레스 지수, 수면 패턴 및 맞춤 부모 코칭 대화법을 실시간으로 확인하여 최적의 입시 멘탈을 지켜주세요.
            </p>
          </div>

          {selectedRecord && (
            <button
              onClick={() => onViewReport(selectedRecord)}
              className="px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-emerald-600/20 flex items-center gap-2 transition-all"
            >
              <span>📄 24P 정밀 처방전 열람하기 →</span>
            </button>
          )}
        </div>

        {selectedRecord ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Summary & Care Type */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <h3 className="font-black text-white text-base flex items-center gap-2">
                    <span>🩺</span>
                    <span>최신 진단 케어타입 및 종합 소견</span>
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    검사일: {selectedRecord.student?.testDate || selectedRecord.date || '최근'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="text-2xl md:text-3xl font-black text-emerald-400 bg-emerald-950/40 px-4 py-2 rounded-2xl border border-emerald-500/30">
                    {(selectedRecord.careType as any)?.label || selectedRecord.careType || (selectedRecord as any).dominantCareType || '정상 상태'}
                  </div>
                  <div className="text-xs text-slate-400">
                    학습 성향 및 생체 리듬에 맞춘 1:1 맞춤 케어 전략이 수립되었습니다.
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-slate-300 text-xs leading-relaxed">
                  <p className="font-semibold text-slate-200 mb-1">💡 원장/전문가 핵심 코멘트:</p>
                  <p>{selectedRecord.analysisText?.split('\n')[0] || '최근 진단에 따른 맞춤형 처방 가이드가 적용되어 있습니다. 무리한 잔소리보다는 골든타임 수면과 균형 잡힌 영양 보충이 필요합니다.'}</p>
                </div>

                {/* Parent Coaching Do & Don't */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="bg-rose-950/30 border border-rose-500/30 p-3.5 rounded-2xl">
                    <div className="text-xs font-bold text-rose-300 flex items-center gap-1.5 mb-1.5">
                      <span>⚠️ 자녀에게 피해야 할 말 (금지)</span>
                    </div>
                    <ul className="text-[11px] text-slate-300 space-y-1 list-disc list-inside">
                      <li>"남들은 이 시간에 몇 시간 더 한다는데..."</li>
                      <li>"지금 이러면 나중에 목표 대학 못 가"</li>
                      <li>"공부 안 하고 핸드폰만 보지 마라"</li>
                    </ul>
                  </div>

                  <div className="bg-emerald-950/30 border border-emerald-500/30 p-3.5 rounded-2xl">
                    <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 mb-1.5">
                      <span>💚 힘이 되는 부모 코칭 대화법</span>
                    </div>
                    <ul className="text-[11px] text-slate-300 space-y-1 list-disc list-inside">
                      <li>"오늘 하루도 고생 많았어, 따뜻한 물 한잔 마셔"</li>
                      <li>"결과보다 네가 꾸준히 집중하는 모습이 자랑스러워"</li>
                      <li>"힘들 땐 언제든 쉬어가도 돼, 엄빠가 항상 응원해"</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* KakaoTalk Weekly Alert Preview */}
              <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🔔</span>
                    <h3 className="font-black text-white text-base">카카오톡 주간 안심 리포트 알림톡 (미리보기)</h3>
                  </div>
                  <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-500/30">
                    PREMIUM 케어
                  </span>
                </div>

                <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-4 text-xs space-y-2 text-slate-200">
                  <div className="font-bold text-amber-400 flex items-center gap-1">
                    <span>[NBASS 수험생 주간 컨디션 알림]</span>
                  </div>
                  <p>안녕하세요, <strong>{currentStudentName}</strong> 학부모님!</p>
                  <p>이번 주 자녀의 학습 집중 유지력은 <strong>상위 12%</strong> 수준을 유지하고 있으며, 스트레스 지수는 <strong>안정권</strong>에 진입했습니다.</p>
                  <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 space-y-1 text-[11px] text-slate-300">
                    <div>• 주간 순공 시간: 52시간 (목표 달성률 98%)</div>
                    <div>• 취침 골든타임: 23:30 ~ 06:30 (수면 부채 0분)</div>
                    <div>• 이번 주 추천 식단: 마그네슘 &amp; L-테아닌 풍부 견과류</div>
                  </div>
                  <p className="text-[10px] text-slate-400 pt-1">
                    * 매주 일요일 오후 8시 학부모님 카카오톡으로 자동 발송됩니다.
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Vitals & Action */}
            <div className="space-y-6">
              {/* Vitals Balance Chart */}
              <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
                <h3 className="font-black text-white text-base mb-4 flex items-center gap-2">
                  <span>📊</span>
                  <span>자율신경 &amp; 바이오 밸런스</span>
                </h3>
                <div className="h-48 w-full flex items-center justify-center">
                  <BalanceChart 
                    pns={selectedRecord.hrv?.pns || 45} 
                    sns={selectedRecord.hrv?.sns || 55} 
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4 text-center">
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400 font-bold">스트레스 지수</div>
                    <div className="text-base font-black text-rose-400 mt-0.5">
                      {selectedRecord.hrv?.stressIndex || 38}점
                    </div>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400 font-bold">집중력 지수</div>
                    <div className="text-base font-black text-blue-400 mt-0.5">
                      {selectedRecord.hrv?.concentrationLevel || 78}점
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-3">
                <h3 className="font-black text-white text-sm flex items-center gap-2">
                  <span>⚡</span>
                  <span>학부모 원클릭 액션</span>
                </h3>
                <button
                  onClick={() => onViewReport(selectedRecord)}
                  className="w-full py-3 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white rounded-xl border border-blue-500/40 text-xs font-bold transition-all"
                >
                  📄 24P 처방전 리포트 전체 보기
                </button>
                <button
                  onClick={() => alert('학부모 주간 카카오톡 알림톡이 정상 설정되어 있습니다.')}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 text-xs font-bold transition-all"
                >
                  🔔 카카오톡 알림 수신 설정 확인
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900 p-12 rounded-3xl border border-slate-800 text-center shadow-xl">
            <span className="text-5xl mb-4 block">📭</span>
            <h3 className="text-xl font-bold text-white mb-2">아직 검사 기록이 없습니다</h3>
            <p className="text-slate-400 text-xs">수험생 진단 화면에서 검사를 완료하면 이곳에 실시간 결과가 표시됩니다.</p>
          </div>
        )}
      </main>
    </div>
  );
};
