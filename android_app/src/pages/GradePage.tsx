import React, { useState, useEffect } from 'react';
import { UserProfile, MobileGradeRecord, SubjectScore } from '../types';
import { dataSyncService } from '../services/dataSyncService';
import { newRecordId } from '../utils/ids';
import { hasRequiredTier } from '../services/featureGate';
import { LockedCard } from '../components/tiered-features/LockedCard';
import {
  TrendingUp,
  Plus,
  Award,
  Calendar,
  ChevronRight,
  CheckCircle2,
  X,
  Target,
  BarChart2,
  HelpCircle,
  Sparkles
} from 'lucide-react';

interface GradePageProps {
  user: UserProfile;
  onUpgradeClick: () => void;
  onNavigateToSubjectClinic?: () => void;
}

export const GradePage: React.FC<GradePageProps> = ({ user, onUpgradeClick, onNavigateToSubjectClinic }) => {
  const isProOrAbove = hasRequiredTier(user.tier, 'pro');
  const [records, setRecords] = useState<MobileGradeRecord[]>(() =>
    dataSyncService.getGradeRecords(user.studentId)
  );
  const [gradeGoals, setGradeGoals] = useState<any[]>(() => dataSyncService.getGradeGoals(user.studentId));
  const [isFormOpen, setIsFormOpen] = useState(false);

  // 성적 입력 폼 상태
  const [examName, setExamName] = useState('2026학년도 9월 모의평가');
  const [examDate, setExamDate] = useState(new Date().toISOString().split('T')[0]);
  const [examType, setExamType] = useState<'MOCK' | 'INTERNAL' | 'CSAT'>('MOCK');

  const [koreanScore, setKoreanScore] = useState('86');
  const [koreanGrade, setKoreanGrade] = useState('2');
  const [koreanPercentile, setKoreanPercentile] = useState('89');

  const [mathScore, setMathScore] = useState('88');
  const [mathGrade, setMathGrade] = useState('2');
  const [mathPercentile, setMathPercentile] = useState('88');

  const [engScore, setEngScore] = useState('92');
  const [engGrade, setEngGrade] = useState('1');

  const [inq1Score, setInq1Score] = useState('44');
  const [inq1Grade, setInq1Grade] = useState('2');
  const [inq1Percentile, setInq1Percentile] = useState('88');

  const [inq2Score, setInq2Score] = useState('42');
  const [inq2Grade, setInq2Grade] = useState('2');
  const [inq2Percentile, setInq2Percentile] = useState('85');

  const [memo, setMemo] = useState('');

  useEffect(() => {
    const handleUpdate = () => {
      setRecords(dataSyncService.getGradeRecords(user.studentId));
      setGradeGoals(dataSyncService.getGradeGoals(user.studentId));
    };
    window.addEventListener('nbass_data_updated', handleUpdate);
    return () => window.removeEventListener('nbass_data_updated', handleUpdate);
  }, [user.studentId]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const scores: SubjectScore[] = [
      {
        subject: '국어',
        score: Number(koreanScore) || 0,
        grade: Number(koreanGrade) || 1,
        percentile: Number(koreanPercentile) || 0
      },
      {
        subject: '수학',
        score: Number(mathScore) || 0,
        grade: Number(mathGrade) || 1,
        percentile: Number(mathPercentile) || 0
      },
      {
        subject: '영어',
        score: Number(engScore) || 0,
        grade: Number(engGrade) || 1
      },
      {
        subject: '탐구1',
        score: Number(inq1Score) || 0,
        grade: Number(inq1Grade) || 1,
        percentile: Number(inq1Percentile) || 0
      },
      {
        subject: '탐구2',
        score: Number(inq2Score) || 0,
        grade: Number(inq2Grade) || 1,
        percentile: Number(inq2Percentile) || 0
      },
    ];

    const newRecord: MobileGradeRecord = {
      id: newRecordId('grd'),
      studentId: user.studentId,
      examName: examName.trim(),
      examDate,
      examType,
      scores,
      memo: memo.trim(),
      createdAt: new Date().toISOString().split('T')[0]
    };

    await dataSyncService.saveGradeRecord(newRecord);
    setRecords(dataSyncService.getGradeRecords(user.studentId));
    setIsFormOpen(false);
  };

  // 최근 시험 백분위 평균 계산 (기록 없으면 null — 목업 수치 표시 금지)
  const latestRecord = records[0];
  const pcts = latestRecord
    ? latestRecord.scores.filter(s => s.percentile !== undefined).map(s => s.percentile || 0)
    : [];
  const avgPercentile: number | null = pcts.length > 0
    ? Math.round(pcts.reduce((acc, cur) => acc + cur, 0) / pcts.length)
    : null;

  // 실데이터 기반 등급 추이 (오래된 순 최대 5회, 국어/수학)
  const trendData = [...records].reverse().slice(-5);
  const gradeToY = (g: number) => 20 + (Math.min(4, Math.max(1, g)) - 1) * 30;
  const xFor = (i: number, n: number) => (n <= 1 ? 150 : 40 + (i * 220) / (n - 1));
  const trendLine = (subj: string) =>
    trendData
      .map((r, i) => {
        const s = r.scores.find(x => x.subject === subj);
        return s?.grade ? `${i === 0 ? 'M' : 'L'} ${xFor(i, trendData.length)} ${gradeToY(s.grade)}` : null;
      })
      .filter(Boolean)
      .join(' ');
  const trendDots = (subj: string) =>
    trendData.flatMap((r, i) => {
      const s = r.scores.find(x => x.subject === subj);
      return s?.grade ? [{ x: xFor(i, trendData.length), y: gradeToY(s.grade) }] : [];
    });
  const hasTrend = trendData.length >= 2 && (trendLine('국어') !== '' || trendLine('수학') !== '');

  return (
    <div className="p-4 space-y-4 pb-24 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1 text-xs font-bold text-blue-600">
            <TrendingUp className="w-4 h-4" />
            <span>모의고사 &amp; 내신 성적 트래커</span>
          </div>
          <h2 className="text-xl font-black text-slate-900">성적 관리 &amp; 목표 시뮬레이션</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            PC 본체 앱의 성적 관리 데이터와 실시간 양방향으로 동기화됩니다.
          </p>
        </div>

        {isProOrAbove && !isFormOpen && (
          <button
            onClick={() => setIsFormOpen(true)}
            className="py-2.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>새 시험 성적 입력</span>
          </button>
        )}
      </div>

      {/* PC 연동: 과목별 목표 등급 (읽기 전용) */}
      {gradeGoals.length > 0 && (
        <div className="bg-white p-5 rounded-3xl border border-amber-200 shadow-xs">
          <h3 className="text-sm font-black text-slate-900 mb-2">🎯 과목별 목표 등급 <span className="text-[10px] font-bold text-emerald-600">PC 연동</span></h3>
          <div className="space-y-1.5">
            {gradeGoals.map((g: any) => (
              <div key={g.id} className="flex items-center justify-between text-xs bg-amber-50/60 border border-amber-100 rounded-xl px-3 py-2">
                <span className="font-black text-slate-800">{g.subjectId}</span>
                <span className="text-slate-600">
                  현재 {g.currentGrade ?? '-'}등급 → 목표 <strong className="text-amber-700">{g.tier1Target ?? '-'}등급</strong>
                  {g.tier3Target ? <span className="text-slate-400"> (최종 {g.tier3Target})</span> : null}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grade Entry Form Modal / Section */}
      {isFormOpen && (
        <div className="bg-white p-5 rounded-3xl border-2 border-blue-400 shadow-lg space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-blue-600" />
              <span>시험 성적 정밀 기입</span>
            </h3>
            <button
              onClick={() => setIsFormOpen(false)}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">시험 명칭</label>
                <input
                  type="text"
                  value={examName}
                  onChange={e => setExamName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold focus:bg-white focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">시험 일자</label>
                <input
                  type="date"
                  value={examDate}
                  onChange={e => setExamDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold focus:bg-white focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">시험 유형</label>
                <select
                  value={examType}
                  onChange={e => setExamType(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold focus:bg-white focus:outline-none"
                >
                  <option value="MOCK">모의평가 / 학평</option>
                  <option value="INTERNAL">학교 내신</option>
                  <option value="CSAT">수능 실전</option>
                </select>
              </div>
            </div>

            {/* 과목별 입력 그리드 */}
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-black text-slate-700 block">과목별 성적 (원점수 / 등급 / 백분위)</span>

              {/* 국어 */}
              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80">
                <div>
                  <span className="text-[10px] font-black text-blue-600 block mb-0.5">국어 원점수</span>
                  <input
                    type="number"
                    value={koreanScore}
                    onChange={e => setKoreanScore(e.target.value)}
                    className="w-full p-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-center"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-600 block mb-0.5">등급 (1~9)</span>
                  <input
                    type="number"
                    min="1"
                    max="9"
                    value={koreanGrade}
                    onChange={e => setKoreanGrade(e.target.value)}
                    className="w-full p-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-center"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-600 block mb-0.5">백분위 (%)</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={koreanPercentile}
                    onChange={e => setKoreanPercentile(e.target.value)}
                    className="w-full p-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-center"
                  />
                </div>
              </div>

              {/* 수학 */}
              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80">
                <div>
                  <span className="text-[10px] font-black text-indigo-600 block mb-0.5">수학 원점수</span>
                  <input
                    type="number"
                    value={mathScore}
                    onChange={e => setMathScore(e.target.value)}
                    className="w-full p-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-center"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-600 block mb-0.5">등급 (1~9)</span>
                  <input
                    type="number"
                    min="1"
                    max="9"
                    value={mathGrade}
                    onChange={e => setMathGrade(e.target.value)}
                    className="w-full p-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-center"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-600 block mb-0.5">백분위 (%)</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={mathPercentile}
                    onChange={e => setMathPercentile(e.target.value)}
                    className="w-full p-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-center"
                  />
                </div>
              </div>

              {/* 영어 */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80">
                <div>
                  <span className="text-[10px] font-black text-purple-600 block mb-0.5">영어 원점수</span>
                  <input
                    type="number"
                    value={engScore}
                    onChange={e => setEngScore(e.target.value)}
                    className="w-full p-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-center"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-600 block mb-0.5">등급 (1~9)</span>
                  <input
                    type="number"
                    min="1"
                    max="9"
                    value={engGrade}
                    onChange={e => setEngGrade(e.target.value)}
                    className="w-full p-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-center"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">시험 총평 / 오답 원인 메모</label>
              <textarea
                value={memo}
                onChange={e => setMemo(e.target.value)}
                rows={2}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold focus:bg-white focus:outline-none"
                placeholder="예: 수학 킬러문항 시간 부족, 오후 집중력 저하 체감"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs"
              >
                취소
              </button>
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-black text-xs shadow-md"
              >
                저장 및 PC 동기화
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Responsive Layout: Tablet 2 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: 성적 기록 목록 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>누적 성적 히스토리</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-bold">
              총 {records.length}회 기록
            </span>
          </div>

          <div className="space-y-2.5">
            {records.length === 0 && (
              <div className="bg-white p-6 rounded-3xl border border-dashed border-slate-300 text-center">
                <p className="text-xs font-bold text-slate-500">아직 기록된 성적이 없습니다.<br />새 시험 성적을 기입하면 추이와 컷 비교가 표시됩니다.</p>
              </div>
            )}
            {records.map(rec => (
              <div
                key={rec.id}
                className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black text-slate-900 block">{rec.examName}</span>
                    <span className="text-[10px] text-slate-400 font-semibold">{rec.examDate}</span>
                  </div>
                  <span className="text-[10px] font-black bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-200">
                    {rec.examType === 'MOCK' ? '모의평가' : rec.examType === 'INTERNAL' ? '내신' : '수능'}
                  </span>
                </div>

                {/* Score Badges */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {rec.scores.map((sc, sIdx) => (
                    <div
                      key={sIdx}
                      className="px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-center"
                    >
                      <span className="text-[10px] text-slate-500 font-semibold block">{sc.subject}</span>
                      <span className="text-xs font-black text-slate-800">
                        {sc.grade}등급 <span className="text-[10px] text-slate-400">({sc.score}점)</span>
                      </span>
                    </div>
                  ))}
                </div>

                {rec.memo && (
                  <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-xl font-medium leading-relaxed">
                    💡 {rec.memo}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: 성적 추이 & 목표 대학 컷비교 */}
        <div className="space-y-4">
          {avgPercentile !== null ? (
          <>
          {/* 목표 대학 커트라인 비교 */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-rose-500" />
                <span>목표 대학 백분위 컷 비교</span>
              </h3>
              <span className="text-xs font-black text-blue-600">
                내 평균 백분위: {avgPercentile}%
              </span>
            </div>

            <div className="space-y-2 pt-1">
              {[
                { name: '의약학 계열 (전국 최상위)', cutoff: 98, color: 'bg-rose-500' },
                { name: 'SKY (서울·고려·연세)', cutoff: 95, color: 'bg-indigo-500' },
                { name: '주요 15개 대학 (인서울 상위)', cutoff: 87, color: 'bg-blue-500' },
                { name: '수도권 주요 대학', cutoff: 78, color: 'bg-emerald-500' },
              ].map((uni, uIdx) => {
                const isPassed = (avgPercentile as number) >= uni.cutoff;
                return (
                  <div key={uIdx} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-slate-700">{uni.name}</span>
                      <span className={isPassed ? 'text-emerald-600 font-black' : 'text-slate-400'}>
                        {isPassed ? '✅ 안정권' : `격차 -${uni.cutoff - (avgPercentile as number)}%p`}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`${uni.color} h-full rounded-full transition-all`}
                        style={{ width: `${Math.min(100, ((avgPercentile as number) / uni.cutoff) * 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SVG 성적 추이 꺾은선 차트 (실데이터) */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-indigo-600" />
                <span>주요 과목 등급 추이 (1등급이 최상단)</span>
              </h3>
            </div>

            {hasTrend ? (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col items-center">
              <svg viewBox="0 0 300 120" className="w-full h-32 overflow-visible">
                <line x1="20" y1="20" x2="280" y2="20" stroke="#e2e8f0" strokeDasharray="3 3" />
                <text x="5" y="24" fontSize="8" fill="#94a3b8">1등</text>
                <line x1="20" y1="50" x2="280" y2="50" stroke="#e2e8f0" strokeDasharray="3 3" />
                <text x="5" y="54" fontSize="8" fill="#94a3b8">2등</text>
                <line x1="20" y1="80" x2="280" y2="80" stroke="#e2e8f0" strokeDasharray="3 3" />
                <text x="5" y="84" fontSize="8" fill="#94a3b8">3등</text>
                <line x1="20" y1="110" x2="280" y2="110" stroke="#e2e8f0" strokeDasharray="3 3" />
                <text x="5" y="114" fontSize="8" fill="#94a3b8">4등</text>

                {trendLine('국어') !== '' && (
                  <>
                    <path d={trendLine('국어')} fill="none" stroke="#3b82f6" strokeWidth="2.5" />
                    {trendDots('국어').map((p, i) => (
                      <circle key={`k${i}`} cx={p.x} cy={p.y} r="4" fill="#3b82f6" />
                    ))}
                  </>
                )}
                {trendLine('수학') !== '' && (
                  <>
                    <path d={trendLine('수학')} fill="none" stroke="#6366f1" strokeWidth="2.5" />
                    {trendDots('수학').map((p, i) => (
                      <circle key={`m${i}`} cx={p.x} cy={p.y} r="4" fill="#6366f1" />
                    ))}
                  </>
                )}
              </svg>

              <div className="flex items-center gap-4 mt-2 text-[10px] font-bold">
                <span className="flex items-center gap-1 text-blue-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> 국어
                </span>
                <span className="flex items-center gap-1 text-indigo-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" /> 수학
                </span>
              </div>
            </div>
            ) : (
              <p className="text-[11px] text-slate-400 font-bold">2회 이상 성적을 기록하면 등급 추이가 표시됩니다.</p>
            )}
          </div>
          </>
          ) : (
            <div className="bg-white p-6 rounded-3xl border border-dashed border-slate-300 text-center">
              <p className="text-xs font-bold text-slate-500">성적을 입력하면 백분위 컷 비교와 등급 추이가 표시됩니다.</p>
            </div>
          )}

          {/* 🏛️ 과목 클리닉 바로가기 연동 배너 (PC 본체 앱 동일) */}
          {onNavigateToSubjectClinic && (
            <div
              onClick={onNavigateToSubjectClinic}
              className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white p-5 rounded-3xl shadow-sm border border-purple-800/60 cursor-pointer hover:shadow-md transition active:scale-98 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-xl">
                  🏛️
                </div>
                <div>
                  <h4 className="text-xs font-black text-amber-300">
                    약점 과목 성적 돌파 클리닉
                  </h4>
                  <p className="text-[11px] text-purple-200 mt-0.5">
                    수학 4점 준킬러 함정 DNA / 국어 비문학 뇌피로 방어 ➔
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-purple-300" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
