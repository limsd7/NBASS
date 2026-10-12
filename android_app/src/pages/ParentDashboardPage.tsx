import React, { useState, useEffect } from 'react';
import { dataSyncService } from '../services/dataSyncService';
import { supabase } from '../lib/supabase';
import { pullSupabaseToLocal, startSupabaseRealtime, stopSupabaseRealtime } from '../services/supabaseRealtime';

interface ParentDashboardPageProps {
  initialChildId?: string;
  onExit: () => void;
}

interface ChildData {
  summaries: any[];
  grades: any[];
  sleeps: any[];
  schedules: any[];
  wrongNotes: any[];
  tier: string | null;
}

/** 학부모 읽기 전용 대시보드 — 자녀 ID로 동기화된 기록만 조회 (수정 불가) */
export const ParentDashboardPage: React.FC<ParentDashboardPageProps> = ({ initialChildId, onExit }) => {
  const [childId, setChildId] = useState(initialChildId || '');
  const [data, setData] = useState<ChildData | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [subscribedId, setSubscribedId] = useState<string | null>(null);

  // 조회 중인 자녀 채널 실시간 구독 (종료 시 해제)
  useEffect(() => {
    if (!subscribedId) return;
    startSupabaseRealtime(subscribedId);
    const reload = () => {
      const id = subscribedId;
      try {
        setData((prev) => {
          if (!prev) return prev;
          const summaries = dataSyncService.getAssessmentSummaries(id);
          const grades = dataSyncService.getGradeRecords(id);
          const sleeps = dataSyncService.getSleepLogs(id);
          return { ...prev, summaries, grades, sleeps };
        });
      } catch { /* ignore */ }
    };
    const handler = (e: Event) => {
      const t = (e as CustomEvent)?.detail?.type;
      if (t === 'grade' || t === 'sleep' || t === 'assessment' || t === 'remote') reload();
    };
    window.addEventListener('nbass_data_updated', handler);
    return () => {
      window.removeEventListener('nbass_data_updated', handler);
      stopSupabaseRealtime();
    };
  }, [subscribedId]);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const id = childId.trim();
    if (!id) return;
    setLoading(true);
    try {
      // 자녀 클라우드 데이터를 먼저 내려받아 저장 후 조회 (학부모 기기에 기록이 없을 수 있음)
      await pullSupabaseToLocal(id).catch(() => undefined);
      // 조회 중 실시간 구독 (열람 중 변경 반영)
      stopSupabaseRealtime();
      startSupabaseRealtime(id);
      // 로컬 + Pull된 클라우드 데이터 조회 (읽기 전용, 저장 없음)
      const summaries = dataSyncService.getAssessmentSummaries(id);
      const grades = dataSyncService.getGradeRecords(id);
      const sleeps = dataSyncService.getSleepLogs(id);
      let schedules: any[] = [];
      let wrongNotes: any[] = [];
      try {
        const s = localStorage.getItem('nbass_schedules_' + id);
        schedules = s ? JSON.parse(s) : [];
        if (!Array.isArray(schedules)) schedules = [];
      } catch { schedules = []; }
      try {
        const w = localStorage.getItem('nbass_wrong_notes_' + id);
        wrongNotes = w ? JSON.parse(w) : [];
        if (!Array.isArray(wrongNotes)) wrongNotes = [];
      } catch { wrongNotes = []; }
      let tier: string | null = null;
      try {
        const { data: rows } = await (supabase.from('user_tiers' as any) as any)
          .select('tier')
          .ilike('student_id', id)
          .limit(1);
        if (Array.isArray(rows) && rows[0]?.tier) tier = String(rows[0].tier);
      } catch { /* ignore */ }
      setData({ summaries, grades, sleeps, schedules, wrongNotes, tier });
      setSearched(true);
      setSubscribedId(id);
    } finally {
      setLoading(false);
    }
  };

  const latest = data?.summaries?.[0];
  const avgSleep = data && data.sleeps.length > 0
    ? (data.sleeps.reduce((a: number, l: any) => a + (l.totalHours || 0), 0) / data.sleeps.length).toFixed(1)
    : null;

  return (
    <div className="p-4 space-y-4 pb-24 max-w-4xl mx-auto">
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-black text-slate-900">👪 학부모 자녀 조회</h2>
          <button onClick={onExit} className="text-[11px] font-bold text-slate-500 hover:text-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-200">
            나가기
          </button>
        </div>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={childId}
            onChange={(e) => setChildId(e.target.value)}
            placeholder="자녀 로그인 ID 입력 (예: limsd7)"
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black disabled:opacity-50"
          >
            {loading ? '조회 중...' : '조회'}
          </button>
        </form>
        <p className="text-[11px] text-slate-400 mt-2">동기화된 기록만 표시됩니다. 수정은 자녀 기기에서 해주세요.</p>
      </div>

      {searched && !data?.summaries.length && data?.grades.length === 0 && data?.sleeps.length === 0 && (
        <div className="bg-white p-6 rounded-3xl border border-dashed border-slate-300 text-center">
          <p className="text-xs font-bold text-slate-500">해당 ID의 동기화된 기록이 없습니다.<br />자녀 기기에서 한 번 이상 동기화(저장)되어야 표시됩니다.</p>
        </div>
      )}

      {latest && (
        <div className="bg-white p-5 rounded-3xl border border-indigo-200 shadow-xs">
          <h3 className="text-sm font-black text-slate-900 mb-1">최근 정밀 진단 — {latest.careType || '종합 진단'}</h3>
          <p className="text-[11px] text-slate-400 mb-2">{String(latest.createdAt || '').slice(0, 10)}</p>
          <p className="text-xs text-slate-700">종합 점수 {latest.careScore}점{data?.tier ? ` · 등급 ${data.tier.toUpperCase()}` : ''}</p>
          {latest.analysisText && (
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100 mt-2">
              {String(latest.analysisText).slice(0, 200)}
            </p>
          )}
        </div>
      )}

      {data && data.grades.length > 0 && (
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <h3 className="text-sm font-black text-slate-900 mb-2">📊 성적 기록 ({data.grades.length}건)</h3>
          <div className="space-y-1.5">
            {data.grades.slice(0, 5).map((g: any) => (
              <div key={g.id} className="flex items-center justify-between text-xs bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
                <span className="font-bold text-slate-800">{g.examName} <span className="text-slate-400 font-medium">{g.examDate}</span></span>
                <span className="text-slate-600">{(g.scores || []).map((s: any) => `${s.subject} ${s.score}점`).join(' · ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-white p-3 rounded-2xl border border-slate-200">
          <p className="text-[10px] font-bold text-slate-500">평균 수면</p>
          <p className="text-sm font-black text-indigo-600">{avgSleep ? `${avgSleep}h` : '-'}</p>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-slate-200">
          <p className="text-[10px] font-bold text-slate-500">스케줄</p>
          <p className="text-sm font-black text-indigo-600">{data ? data.schedules.length : '-'}건</p>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-slate-200">
          <p className="text-[10px] font-bold text-slate-500">오답노트</p>
          <p className="text-sm font-black text-indigo-600">{data ? data.wrongNotes.length : '-'}건</p>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboardPage;
