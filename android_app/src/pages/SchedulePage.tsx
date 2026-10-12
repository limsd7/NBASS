import React, { useState, useEffect } from 'react';
import { UserProfile, ScheduleItem, GamificationProgress } from '../types';
import { dataSyncService } from '../services/dataSyncService';
import { useNbassRemoteRefresh } from '../hooks/useNbassRemoteRefresh';
import { hasRequiredTier } from '../services/featureGate';
import { LockedCard } from '../components/tiered-features/LockedCard';
import {
  Calendar,
  Clock,
  Plus,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Trash2,
  X,
  Zap,
  Award,
  Flame,
  CheckSquare,
  Square
} from 'lucide-react';

interface SchedulePageProps {
  user: UserProfile;
  onUpgradeClick: () => void;
}

export const SchedulePage: React.FC<SchedulePageProps> = ({ user, onUpgradeClick }) => {
  const isPlusOrAbove = hasRequiredTier(user.tier, 'premium');
  const [schedules, setSchedules] = useState<ScheduleItem[]>(() =>
    dataSyncService.getSchedules(user.studentId)
  );
  const [gamification, setGamification] = useState<GamificationProgress>(() =>
    dataSyncService.getGamificationProgress(user.studentId)
  );
  const [isFormOpen, setIsFormOpen] = useState(false);

  // 스케줄 추가 폼
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');
  const [subject, setSubject] = useState('수학 (몰입)');
  const [activity, setActivity] = useState('');

  // 뽀모도로 타이머 상태
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreakMode, setIsBreakMode] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      setSchedules(dataSyncService.getSchedules(user.studentId));
      setGamification(dataSyncService.getGamificationProgress(user.studentId));
    };
    window.addEventListener('nbass_data_updated', handleUpdate);
    return () => window.removeEventListener('nbass_data_updated', handleUpdate);
  }, [user.studentId]);

  // 원격(PC 등) 변경 실시간 반영
  useNbassRemoteRefresh(() => setSchedules(dataSyncService.getSchedules(user.studentId)));

  useEffect(() => {
    let timer: any = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      if (!isBreakMode) {
        alert('🎉 25분 몰입 완료! +20 EXP를 획득했습니다. 5분간 휴식하세요.');
        handleGainExp(20);
        setIsBreakMode(true);
        setTimeLeft(5 * 60);
      } else {
        alert('🔔 5분 휴식 종료! 다시 집중 세션을 시작하세요.');
        setIsBreakMode(false);
        setTimeLeft(25 * 60);
      }
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, isBreakMode]);

  const handleGainExp = async (amount: number) => {
    const newExp = gamification.exp + amount;
    const newLevel = Math.floor(newExp / 100) + 1;
    const updated: GamificationProgress = {
      ...gamification,
      exp: newExp,
      level: newLevel
    };
    await dataSyncService.saveGamificationProgress(updated);
    setGamification(updated);
  };

  const handleToggleComplete = async (id: string) => {
    const updated = schedules.map(s => {
      if (s.id === id) {
        const nextState = !s.isCompleted;
        if (nextState) handleGainExp(15);
        return { ...s, isCompleted: nextState };
      }
      return s;
    });
    await dataSyncService.saveSchedules(user.studentId, updated);
    setSchedules(updated);
  };

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
        : 'bg-emerald-100 text-emerald-900 border-emerald-300',
      isCompleted: false
    };

    const updated = [...schedules, newItem].sort((a, b) => a.startTime.localeCompare(b.startTime));
    await dataSyncService.saveSchedules(user.studentId, updated);
    setSchedules(updated);
    setActivity('');
    setIsFormOpen(false);
  };

  const handleDeleteSchedule = async (id: string) => {
    const updated = schedules.filter(s => s.id !== id);
    await dataSyncService.saveSchedules(user.studentId, updated);
    setSchedules(updated);
  };

  // AI 골든타임 시간표 자동 생성 (기본 템플릿 — 빈 시간표일 때 시작용)
  const handleGenerateAISchedule = async () => {
    if (schedules.length > 0 && !confirm('현재 시간표를 기본 템플릿으로 덮어쓰시겠습니까?')) {
      return;
    }
    const aiTimetable: ScheduleItem[] = [
      { id: 'ai-1', studentId: user.studentId, startTime: '06:45', endTime: '07:30', subject: '각성 & 루틴', activity: '기상 직후 햇빛 15분 쬐기 & 냉수 500ml 음용', color: 'bg-amber-100 text-amber-900 border-amber-300' },
      { id: 'ai-2', studentId: user.studentId, startTime: '08:30', endTime: '11:30', subject: '수학 (킬러 골든타임)', activity: '전두엽 최고 각성 시간대 미적분 킬러 3문항 딥포커스', color: 'bg-indigo-100 text-indigo-900 border-indigo-300' },
      { id: 'ai-3', studentId: user.studentId, startTime: '13:30', endTime: '14:00', subject: '휴식 (파워 냅)', activity: '식후 식곤증 방지 20분 낮잠 (커피 냅)', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
      { id: 'ai-4', studentId: user.studentId, startTime: '14:30', endTime: '17:30', subject: '국어 (독서 비문학)', activity: '경제/철학 고난도 지문 문장 구조도 분석', color: 'bg-blue-100 text-blue-900 border-blue-300' },
      { id: 'ai-5', studentId: user.studentId, startTime: '19:30', endTime: '22:00', subject: '영어 & 탐구 영역', activity: '빈칸추론 5문항 + 탐구 핵심 개념 백지 복습', color: 'bg-purple-100 text-purple-900 border-purple-300' },
      { id: 'ai-6', studentId: user.studentId, startTime: '23:00', endTime: '23:30', subject: '정리 & 멘탈 이완', activity: '오늘 오답 3분 인출 + 4-7-8 복식호흡 후 취침', color: 'bg-slate-100 text-slate-900 border-slate-300' },
    ];

    await dataSyncService.saveSchedules(user.studentId, aiTimetable);
    setSchedules(aiTimetable);
    handleGainExp(30);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="p-4 space-y-4 pb-24 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1 text-xs font-bold text-indigo-600">
            <Calendar className="w-4 h-4" />
            <span>24시간 서큘러 &amp; AI 시간표 동기화</span>
          </div>
          <h2 className="text-xl font-black text-slate-900">스마트 스케줄 &amp; 뽀모도로</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            PC 본체 앱과 실시간 동기화되며, 할 일 완료 시 EXP 레벨업이 적용됩니다.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerateAISchedule}
            className="py-2.5 px-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI 골든타임 시간표 자동 생성</span>
          </button>
          {!isFormOpen && (
            <button
              onClick={() => setIsFormOpen(true)}
              className="py-2.5 px-3.5 rounded-2xl bg-slate-900 text-white font-black text-xs flex items-center gap-1 active:scale-95 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>추가</span>
            </button>
          )}
        </div>
      </div>

      {/* Schedule Form */}
      {isFormOpen && (
        <div className="bg-white p-5 rounded-3xl border-2 border-indigo-400 shadow-lg space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>새 공부 시간표 블록 추가</span>
            </h3>
            <button onClick={() => setIsFormOpen(false)} className="text-slate-400 p-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleAddSchedule} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">시작 시각</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-center"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">종료 시각</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-center"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">과목 / 영역</label>
                <select
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold"
                >
                  <option value="수학 (몰입)">수학 (킬러/개념)</option>
                  <option value="국어 (비문학/문학)">국어 (비문학/문학)</option>
                  <option value="영어">영어 (구문/독해)</option>
                  <option value="탐구 영역">탐구 영역</option>
                  <option value="각성 & 루틴">각성 &amp; 루틴</option>
                  <option value="휴식 (파워 냅)">휴식 (커피 냅)</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">학습 내용</label>
                <input
                  type="text"
                  value={activity}
                  onChange={e => setActivity(e.target.value)}
                  placeholder="예: 미적분 킬러 3문항 분석"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold"
                  required
                />
              </div>
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
                className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-black text-xs shadow-md"
              >
                저장 및 동기화
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Responsive Grid: Tablet 2 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: 오늘의 시간표 타임라인 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>오늘의 타임블록 스케줄</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-bold">
              {schedules.filter(s => s.isCompleted).length} / {schedules.length} 완료
            </span>
          </div>

          <div className="space-y-2.5">
            {schedules.map(item => (
              <div
                key={item.id}
                className={`p-4 rounded-3xl border transition shadow-xs flex items-center justify-between ${
                  item.isCompleted
                    ? 'bg-slate-100 border-slate-200 opacity-60'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggleComplete(item.id)}
                    className="text-indigo-600 hover:scale-110 transition"
                  >
                    {item.isCompleted ? (
                      <CheckSquare className="w-5 h-5 text-indigo-600" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-400" />
                    )}
                  </button>

                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[11px] font-black text-indigo-700">
                        {item.startTime} ~ {item.endTime}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.color}`}>
                        {item.subject}
                      </span>
                    </div>
                    <p className={`text-xs font-bold ${item.isCompleted ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                      {item.activity}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteSchedule(item.id)}
                  className="text-slate-300 hover:text-rose-500 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right: 뽀모도로 타이머 & 게이미피케이션 현황 */}
        <div className="space-y-4">
          {/* 게이미피케이션 상태 카드 */}
          <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-5 rounded-3xl shadow-sm border border-indigo-800/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400" />
                <span className="text-xs font-black">레벨 {gamification.level} 수험생</span>
              </div>
              <span className="text-[10px] bg-amber-400/20 text-amber-300 font-black px-2.5 py-0.5 rounded-full border border-amber-400/30">
                연속 {gamification.streak}일 달성 중
              </span>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-slate-300">경험치 (EXP)</span>
                <span className="text-amber-300 font-black">{gamification.exp % 100} / 100 EXP</span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-400 to-orange-400 h-full rounded-full transition-all"
                  style={{ width: `${(gamification.exp % 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* 뽀모도로 타이머 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs text-center space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>25분 몰입 뽀모도로 타이머</span>
              </h3>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                isBreakMode ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
              }`}>
                {isBreakMode ? '5분 휴식 세션' : '25분 몰입 세션'}
              </span>
            </div>

            <div className="py-2">
              <div className="text-5xl font-black font-mono text-slate-900 tracking-wider">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                완료 시 +20 EXP가 적립되며 집중력이 극대화됩니다.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className={`py-3 px-8 rounded-2xl font-black text-xs shadow-md transition flex items-center gap-1.5 ${
                  isRunning
                    ? 'bg-rose-500 text-white'
                    : 'bg-indigo-600 text-white active:scale-95'
                }`}
              >
                {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                <span>{isRunning ? '일시정지' : '집중 시작'}</span>
              </button>

              <button
                onClick={() => {
                  setIsRunning(false);
                  setIsBreakMode(false);
                  setTimeLeft(25 * 60);
                }}
                className="p-3 rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
