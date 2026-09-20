import React, { useState, useEffect } from 'react';
import { UserProfile, SleepLogItem } from '../types';
import { dataSyncService } from '../services/dataSyncService';
import { hasRequiredTier } from '../services/featureGate';
import { LockedCard } from '../components/tiered-features/LockedCard';
import { Moon, Sun, Wind, Volume2, Sparkles, Clock, AlertTriangle, CheckCircle2, Play, Pause } from 'lucide-react';

interface SleepMentalPageProps {
  user: UserProfile;
  onUpgradeClick: () => void;
}

export const SleepMentalPage: React.FC<SleepMentalPageProps> = ({ user, onUpgradeClick }) => {
  const isVipOrAbove = hasRequiredTier(user.tier, 'vip');
  const isPremiumOrAbove = hasRequiredTier(user.tier, 'premium');

  // 수면 입력 상태
  const [bedTime, setBedTime] = useState('01:30');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [sleepLogs, setSleepLogs] = useState<SleepLogItem[]>(() => dataSyncService.getSleepLogs(user.studentId));

  // 호흡 가이드 상태 (4-7-8)
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathSeconds, setBreathSeconds] = useState(4);
  const [isBreathingActive, setIsBreathingActive] = useState(false);

  // 사운드 믹서 (PREMIUM)
  const [rainVol, setRainVol] = useState(60);
  const [waveVol, setWaveVol] = useState(40);
  const [cafeVol, setCafeVol] = useState(50);
  const [isPlayingSound, setIsPlayingSound] = useState(false);

  useEffect(() => {
    setSleepLogs(dataSyncService.getSleepLogs(user.studentId));
  }, [user.studentId]);

  // 호흡 타이머
  useEffect(() => {
    let timer: any = null;
    if (isBreathingActive) {
      timer = setInterval(() => {
        setBreathSeconds(prev => {
          if (prev <= 1) {
            if (breathPhase === 'inhale') {
              setBreathPhase('hold');
              return 7;
            } else if (breathPhase === 'hold') {
              setBreathPhase('exhale');
              return 8;
            } else {
              setBreathPhase('inhale');
              return 4;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setBreathPhase('inhale');
      setBreathSeconds(4);
    }
    return () => clearInterval(timer);
  }, [isBreathingActive, breathPhase]);

  // 수면 시간 계산
  const calculateHours = (bed: string, wake: string) => {
    const [bH, bM] = bed.split(':').map(Number);
    const [wH, wM] = wake.split(':').map(Number);
    let bedMinutes = bH * 60 + bM;
    let wakeMinutes = wH * 60 + wM;
    if (wakeMinutes < bedMinutes) {
      wakeMinutes += 24 * 60;
    }
    const diffHours = (wakeMinutes - bedMinutes) / 60;
    return Math.round(diffHours * 10) / 10;
  };

  const currentSleepHours = calculateHours(bedTime, wakeTime);
  const sleepDebt = Math.max(0, Math.round((7.5 - currentSleepHours) * 10) / 10);

  const handleSaveSleep = async (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: SleepLogItem = {
      id: 'slp-' + Date.now(),
      studentId: user.studentId,
      date: new Date().toISOString().split('T')[0],
      bedTime,
      wakeTime,
      totalHours: currentSleepHours,
      sleepDebtHours: sleepDebt,
      quality: currentSleepHours >= 7 ? 'GOOD' : currentSleepHours >= 5.5 ? 'NORMAL' : 'POOR',
      memo: sleepDebt > 1.5 ? '수면 부채 1.5시간 초과 → 오후 1:30 커피 냅 및 HL 커피 권장' : '양호한 수면 회복'
    };

    await dataSyncService.saveSleepLog(newLog);
    setSleepLogs(dataSyncService.getSleepLogs(user.studentId));
    alert('✅ 수면시간이 기록되었으며 PC 앱과 실시간 동기화되었습니다!');
  };

  return (
    <div className="p-4 space-y-4 pb-20 max-w-md mx-auto">
      {/* Header */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1 text-xs font-bold text-indigo-600">
            <Moon className="w-4 h-4" />
            <span>서카디안 생체시계 &amp; 수면 부채 관리</span>
          </div>
          <h2 className="text-xl font-black text-slate-900">수면 &amp; 멘탈 케어</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            취침과 기상 시간을 변경하면 수면 부채 지수가 실시간으로 계산됩니다.
          </p>
        </div>
      </div>

      {/* 1. 수면시간 기입 & 수면 부채 계산기 (VIP / 전 회원 기입 지원) */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-5 rounded-3xl shadow-md border border-indigo-800/40">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
            <Moon className="w-4 h-4" />
            <span>오늘의 수면시간 기입 &amp; 수면 부채</span>
          </span>
          <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-slate-300">
            PC 실시간 동기화
          </span>
        </div>

        <form onSubmit={handleSaveSleep} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
              <label className="text-slate-400 text-[10px] block mb-1">🌙 어제 취침 시간</label>
              <input
                type="time"
                value={bedTime}
                onChange={(e) => setBedTime(e.target.value)}
                className="bg-transparent text-white font-mono font-black text-base w-full focus:outline-hidden"
              />
            </div>
            <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
              <label className="text-slate-400 text-[10px] block mb-1">☀️ 오늘 기상 시간</label>
              <input
                type="time"
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
                className="bg-transparent text-white font-mono font-black text-base w-full focus:outline-hidden"
              />
            </div>
          </div>

          {/* Real-time Calculation Result */}
          <div className="p-3 bg-white/10 rounded-2xl border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-slate-300 text-[11px] block">총 수면 시간: <strong>{currentSleepHours}시간</strong></span>
              <span className="text-amber-300 font-black text-xs block mt-0.5">
                수면 부채: {sleepDebt > 0 ? `-${sleepDebt}시간 부족` : '충분 (수면 부채 없음)'}
              </span>
            </div>
            {sleepDebt > 1.5 && (
              <span className="text-[10px] bg-rose-500 text-white font-bold px-2 py-1 rounded-lg">
                ☕ 커피 냅 필수
              </span>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-black text-xs active:scale-98 transition shadow-sm"
          >
            수면시간 기록 &amp; PC 동기화 저장
          </button>
        </form>
      </div>

      {/* 2. 4-7-8 자율신경 이완 호흡법 (전 회원 무료) */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
            <Wind className="w-4 h-4 text-emerald-500" />
            <span>4-7-8 자율신경 리셋 호흡 가이드</span>
          </h3>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
            무료 제공
          </span>
        </div>

        <div className="text-center py-6 bg-gradient-to-b from-emerald-50/50 to-teal-50/50 rounded-2xl border border-emerald-100 flex flex-col items-center justify-center">
          <div
            className={`w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-1000 ${
              breathPhase === 'inhale'
                ? 'scale-110 bg-emerald-100 border-emerald-400 text-emerald-900'
                : breathPhase === 'hold'
                ? 'scale-110 bg-amber-100 border-amber-400 text-amber-900'
                : 'scale-90 bg-blue-100 border-blue-400 text-blue-900'
            }`}
          >
            <span className="text-xs font-black">
              {breathPhase === 'inhale' ? '숨 들이쉬기' : breathPhase === 'hold' ? '숨 멈추기' : '천천히 내쉬기'}
            </span>
            <span className="text-2xl font-black mt-1 font-mono">
              {breathSeconds}초
            </span>
          </div>

          <button
            onClick={() => setIsBreathingActive(!isBreathingActive)}
            className={`mt-4 px-6 py-2 rounded-xl text-xs font-bold transition active:scale-95 shadow-sm ${
              isBreathingActive
                ? 'bg-slate-800 text-white'
                : 'bg-emerald-600 text-white hover:bg-emerald-500'
            }`}
          >
            {isBreathingActive ? '호흡 정지' : '호흡 가이드 시작'}
          </button>
        </div>
      </div>

      {/* 3. 집중 백색소음 사운드 믹서 (PREMIUM 전용) */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
            <Volume2 className="w-4 h-4 text-indigo-600" />
            <span>집중 백색소음 사운드 믹서</span>
          </h3>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
            PREMIUM 전용
          </span>
        </div>

        {isPremiumOrAbove ? (
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>🌧️ 빗소리 (Pink Noise)</span>
                  <span className="text-indigo-600">{rainVol}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={rainVol}
                  onChange={(e) => setRainVol(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>🌊 파도 소리 (Alpha Rhythm)</span>
                  <span className="text-indigo-600">{waveVol}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={waveVol}
                  onChange={(e) => setWaveVol(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>☕ 카페 앰비언스</span>
                  <span className="text-indigo-600">{cafeVol}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={cafeVol}
                  onChange={(e) => setCafeVol(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>
            </div>

            <button
              onClick={() => setIsPlayingSound(!isPlayingSound)}
              className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition"
            >
              {isPlayingSound ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlayingSound ? '사운드 정지' : '사운드 믹스 재생'}</span>
            </button>
          </div>
        ) : (
          <LockedCard
            requiredTier="premium"
            featureTitle="3-Channel 사운드 믹서 잠금"
            description="빗소리, 파도, 카페 소음을 조합하는 몰입 백색소음 믹서는 PREMIUM 등급부터 이용 가능합니다."
            onUpgradeClick={onUpgradeClick}
          />
        )}
      </div>
    </div>
  );
};
