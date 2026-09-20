import React, { useState, useEffect } from 'react';
import { UserProfile, MobileGradeRecord, SubjectScore } from '../types';
import { dataSyncService } from '../services/dataSyncService';
import { hasRequiredTier } from '../services/featureGate';
import { LockedCard } from '../components/tiered-features/LockedCard';
import { TrendingUp, Plus, Award, Calendar, ChevronRight, CheckCircle2, X } from 'lucide-react';

interface GradePageProps {
  user: UserProfile;
  onUpgradeClick: () => void;
}

export const GradePage: React.FC<GradePageProps> = ({ user, onUpgradeClick }) => {
  const isProOrAbove = hasRequiredTier(user.tier, 'pro');
  const [records, setRecords] = useState<MobileGradeRecord[]>(() => dataSyncService.getGradeRecords(user.studentId));
  const [isFormOpen, setIsFormOpen] = useState(false);

  // 성적 입력 폼 상태
  const [examName, setExamName] = useState('2026학년도 9월 모의평가');
  const [examDate, setExamDate] = useState(new Date().toISOString().split('T')[0]);
  const [examType, setExamType] = useState<'MOCK' | 'INTERNAL'>('MOCK');
  const [koreanScore, setKoreanScore] = useState('86');
  const [koreanGrade, setKoreanGrade] = useState('2');
  const [mathScore, setMathScore] = useState('88');
  const [mathGrade, setMathGrade] = useState('2');
  const [engScore, setEngScore] = useState('92');
  const [engGrade, setEngGrade] = useState('1');
  const [memo, setMemo] = useState('');

  useEffect(() => {
    setRecords(dataSyncService.getGradeRecords(user.studentId));
  }, [user.studentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const scores: SubjectScore[] = [
      { subject: '국어', score: Number(koreanScore) || 0, grade: Number(koreanGrade) || 1 },
      { subject: '수학', score: Number(mathScore) || 0, grade: Number(mathGrade) || 1 },
      { subject: '영어', score: Number(engScore) || 0, grade: Number(engGrade) || 1 },
    ];

    const newRecord: MobileGradeRecord = {
      id: 'grd-' + Date.now(),
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
    alert('✅ 성적이 등록되었으며 PC 앱과 실시간 동기화되었습니다!');
  };

  return (
    <div className="p-4 space-y-4 pb-20 max-w-md mx-auto">
      {/* Header */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 mb-1 text-xs font-bold text-blue-600">
          <TrendingUp className="w-4 h-4" />
          <span>모의고사 &amp; 내신 성적 트래커</span>
        </div>
        <h2 className="text-xl font-black text-slate-900">성적 관리 &amp; 시뮬레이션</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          성적을 기입하면 두뇌 활력도와 결합된 입체적인 성적 추이 분석이 제공됩니다.
        </p>
      </div>

      {isProOrAbove ? (
        <div className="space-y-4">
          {/* Add Grade Button */}
          {!isFormOpen && (
            <button
              onClick={() => setIsFormOpen(true)}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md active:scale-98 transition"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>새 시험 성적 기입하기</span>
            </button>
          )}

          {/* Form */}
          {isFormOpen && (
            <div className="bg-white p-5 rounded-3xl border-2 border-blue-300 shadow-lg space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-blue-600" />
                  <span>시험 성적 간편 기입</span>
                </h3>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">시험 명칭 *</label>
                  <input
                    type="text"
                    value={examName}
                    onChange={(e) => setExamName(e.target.value)}
                    placeholder="예: 2026학년도 9월 모의평가"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">응시 일자</label>
                    <input
                      type="date"
                      value={examDate}
                      onChange={(e) => setExamDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">시험 유형</label>
                    <select
                      value={examType}
                      onChange={(e) => setExamType(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                    >
                      <option value="MOCK">전국 모의평가</option>
                      <option value="INTERNAL">학교 내신</option>
                    </select>
                  </div>
                </div>

                {/* 과목별 성적 기입 (국어, 수학, 영어) */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                  <p className="font-black text-slate-800 text-xs">과목별 원점수 및 등급</p>
                  
                  {/* 국어 */}
                  <div className="flex items-center gap-2">
                    <span className="w-12 font-bold text-slate-700">국어</span>
                    <input
                      type="number"
                      value={koreanScore}
                      onChange={(e) => setKoreanScore(e.target.value)}
                      placeholder="원점수"
                      className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-center text-xs"
                    />
                    <select
                      value={koreanGrade}
                      onChange={(e) => setKoreanGrade(e.target.value)}
                      className="w-20 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(g => (
                        <option key={g} value={g}>{g}등급</option>
                      ))}
                    </select>
                  </div>

                  {/* 수학 */}
                  <div className="flex items-center gap-2">
                    <span className="w-12 font-bold text-slate-700">수학</span>
                    <input
                      type="number"
                      value={mathScore}
                      onChange={(e) => setMathScore(e.target.value)}
                      placeholder="원점수"
                      className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-center text-xs"
                    />
                    <select
                      value={mathGrade}
                      onChange={(e) => setMathGrade(e.target.value)}
                      className="w-20 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(g => (
                        <option key={g} value={g}>{g}등급</option>
                      ))}
                    </select>
                  </div>

                  {/* 영어 */}
                  <div className="flex items-center gap-2">
                    <span className="w-12 font-bold text-slate-700">영어</span>
                    <input
                      type="number"
                      value={engScore}
                      onChange={(e) => setEngScore(e.target.value)}
                      placeholder="원점수"
                      className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-center text-xs"
                    />
                    <select
                      value={engGrade}
                      onChange={(e) => setEngGrade(e.target.value)}
                      className="w-20 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(g => (
                        <option key={g} value={g}>{g}등급</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">응시 소감 / 컨디션 메모</label>
                  <input
                    type="text"
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    placeholder="예: 4교시 집중력 저하로 수학 시간 부족"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black shadow-sm"
                  >
                    성적 저장 &amp; PC 실시간 동기화
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Records List */}
          <div className="space-y-3">
            <h3 className="text-sm font-black text-slate-900 px-1">
              누적 시험 성적 목록 ({records.length}회차)
            </h3>

            {records.map((rec) => {
              const avgGrade = (rec.scores.reduce((sum, s) => sum + s.grade, 0) / rec.scores.length).toFixed(1);
              return (
                <div
                  key={rec.id}
                  className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div>
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md mr-2">
                        {rec.examType === 'MOCK' ? '전국모평' : '내신'}
                      </span>
                      <span className="text-xs text-slate-400">{rec.examDate}</span>
                      <h4 className="text-sm font-black text-slate-900 mt-0.5">{rec.examName}</h4>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">평균 등급</span>
                      <span className="text-base font-black text-blue-600 font-mono">{avgGrade}등급</span>
                    </div>
                  </div>

                  {/* Scores Grid */}
                  <div className="grid grid-cols-3 gap-2">
                    {rec.scores.map((s, idx) => (
                      <div key={idx} className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100 text-center">
                        <span className="text-[10px] text-slate-500 font-bold block">{s.subject}</span>
                        <span className="text-sm font-black text-slate-900 font-mono block mt-0.5">{s.score}점</span>
                        <span className="text-[10px] font-bold text-indigo-600 bg-white px-1.5 py-0.2 rounded border border-slate-200 inline-block mt-0.5">
                          {s.grade}등급
                        </span>
                      </div>
                    ))}
                  </div>

                  {rec.memo && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100">
                      💡 {rec.memo}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <LockedCard
          requiredTier="pro"
          featureTitle="성적 관리 &amp; 등급 추이 잠금"
          description="모의고사 및 내신 시험 성적을 직접 기입하고 입체적인 성적 추이를 확인하는 기능은 PRO 등급부터 이용하실 수 있습니다."
          onUpgradeClick={onUpgradeClick}
        />
      )}
    </div>
  );
};
