import React, { useState, useEffect } from 'react';
import { UserProfile, ScheduleItem } from '../types';
import { dataSyncService } from '../services/dataSyncService';
import { hasRequiredTier } from '../services/featureGate';
import { LockedCard } from '../components/tiered-features/LockedCard';
import { Calendar, Clock, Plus, Play, Pause, RotateCcw, CheckCircle2, Sparkles, Trash2, X } from 'lucide-react';

interface SchedulePageProps {
  user: UserProfile;
  onUpgradeClick: () => void;
}

export const SchedulePage: React.FC<SchedulePageProps> = ({ user, onUpgradeClick }) => {
  const isPlusOrAbove = hasRequiredTier(user.tier, 'premium_plus');
  const [schedules, setSchedules] = useState<ScheduleItem[]>(() => dataSyncService.getSchedules(user.studentId));
  const [isFormOpen, setIsFormOpen] = useState(false);

  // 스케줄 추가 폼
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');
  const [subject, setSubject] = useState('수학 (몰입)');
  const [activity, setActivity] = useState('');

  // 뽀모도로 타이머 상태
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    setSchedules(dataSyncService.getSchedules(user.studentId));
  }, [user.studentId]);

  useEffect(() => {
    let timer: any = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      alert('🎉 25분 몰입 완료! 5분간 휴식을 취하세요.');
      setTimeLeft(25 * 60);
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activity.trim()) {
      alert('세부 학습 내용을 입력해주세요.');
      return;
    }

    const newItem: ScheduleItem = {
      id: 'sch-' + Date.now(),
      studentId: user.studentId,
      startTime,
      endTime,
      subject,
      activity: activity.trim(),
      color: subject.includes('수학')
        ? 'bg-indigo-100 text-indigo-900 border-indigo-300'
        : subject.includes('국어')
        ? 'bg-blue-100 text-blue-900 border-blue-300'
        : subject.includes('영어')
        ? 'bg-purple-100 text-purple-900 border-purple-300'
        : 'bg-emerald-100 text-emerald-900 border-emerald-300'
    };

    const updated = [...schedules, newItem].sort((a, b) => a.startTime.localeCompare(b.startTime));
    await dataSyncService.saveSchedules(user.studentId, updated);
    setSchedules(updated);
    setActivity('');
    setIsFormOpen(false);
    alert('✅ 오늘 공부 스케줄이 수정 및 저장되었으며 PC 앱과 실시간 동기화되었습니다!');
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm('이 스케줄을 삭제하시겠습니까?')) return;
    const updated = schedules.filter(s => s.id !== id);
    await dataSyncService.saveSchedules(user.studentId, updated);
    setSchedules(updated);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="p-4 space-y-4 pb-20 max-w-md mx-auto">
      {/* Header */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1 text-xs font-bold text-indigo-600">
            <Calendar className="w-4 h-4" />
            <span>24시간 서큘러 &amp; 실시간 시간표 편집</span>
          </div>
          <h2 className="text-xl font-black text-slate-900">스마트 스케줄 관리</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            오늘 공부 시간표를 변경하면 PC 대시보드와 실시간으로 동기화됩니다.
          </p>
        </div>
      </div>

      {isPlusOrAbove ? (
        <div className="space-y-4">
          {/* 1. 뽀모도로 몰입 타이머 위젯 */}
          <div className="bg-slate-900 text-white p-5 rounded-3xl shadow-md border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-indigo-300 flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>25분 초집중 뽀모도로 타이머</span>
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold">
                실시간 가동
              </span>
            </div>

            <div className="text-center py-2">
              <div className="text-4xl font-black tracking-widest font-mono text-emerald-400 my-2">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </div>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setIsRunning(!isRunning)}
                  className={`px-5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm active:scale-95 transition ${
                    isRunning ? 'bg-amber-400 text-slate-950' : 'bg-emerald-500 text-white'
                  }`}
                >
                  {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isRunning ? '일시정지' : '집중 시작'}</span>
                </button>
                <button
                  onClick={() => { setIsRunning(false); setTimeLeft(25 * 60); }}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* 2. Schedule Edit Button & Form */}
          {!isFormOpen ? (
            <button
              onClick={() => setIsFormOpen(true)}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md active:scale-98 transition"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>오늘 공부 스케줄 추가 / 변경하기</span>
            </button>
          ) : (
            <div className="bg-white p-5 rounded-3xl border-2 border-indigo-300 shadow-lg space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span>새 공부 스케줄 블록 추가</span>
                </h3>
                <button onClick={() => setIsFormOpen(false)} className="text-slate-400 p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddSchedule} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">시작 시간</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">종료 시간</label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">과목 / 활동 구분</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                  >
                    <option value="수학 (몰입)">수학 (몰입)</option>
                    <option value="국어 (비문학)">국어 (비문학)</option>
                    <option value="영어 (독해)">영어 (독해)</option>
                    <option value="탐구 (개념)">탐구 (개념)</option>
                    <option value="휴식 (커피 냅)">휴식 (커피 냅 20분)</option>
                    <option value="각성 & 루틴">각성 &amp; HL 커피 부스터</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">세부 학습 목표 *</label>
                  <input
                    type="text"
                    value={activity}
                    onChange={(e) => setActivity(e.target.value)}
                    placeholder="예: 수능 기출 미적분 4문항 집중 분석"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                    required
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
                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black shadow-sm"
                  >
                    스케줄 저장 &amp; PC 동기화
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 3. Today's Timetable Cards */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-black text-slate-900">오늘의 스케줄 타임라인</h3>
              <span className="text-[10px] text-indigo-600 font-bold">PC 화면 실시간 연동</span>
            </div>

            {schedules.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border shadow-xs flex items-center justify-between gap-3 ${item.color}`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-center font-mono font-black text-xs min-w-[50px]">
                    <span className="block">{item.startTime}</span>
                    <span className="text-[9px] text-slate-500 block">~ {item.endTime}</span>
                  </div>
                  <div className="border-l border-slate-300 pl-3">
                    <span className="text-xs font-black block">{item.subject}</span>
                    <p className="text-[11px] text-slate-700 mt-0.5">{item.activity}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteSchedule(item.id)}
                  className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition"
                  title="삭제"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <LockedCard
          requiredTier="premium_plus"
          featureTitle="스마트 스케줄 관리 &amp; 뽀모도로 잠금"
          description="원형 24시간 시간표를 직접 변경하고 뽀모도로 타이머와 연동하는 기능은 PREMIUM PLUS (PLUS+) 등급 전용입니다."
          onUpgradeClick={onUpgradeClick}
        />
      )}
    </div>
  );
};
