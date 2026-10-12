import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, SleepLogItem } from '../types';
import { dataSyncService } from '../services/dataSyncService';
import { newRecordId } from '../utils/ids';
import { hasRequiredTier } from '../services/featureGate';
import { LockedCard } from '../components/tiered-features/LockedCard';
import {
  Moon,
  Sun,
  Wind,
  Volume2,
  Sparkles,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Play,
  Pause,
  Coffee,
  HeartPulse,
  RotateCcw,
  Plus,
  Trash2,
  Smile,
  ShieldCheck
} from 'lucide-react';

interface SleepMentalPageProps {
  user: UserProfile;
  onUpgradeClick: () => void;
}

export const SleepMentalPage: React.FC<SleepMentalPageProps> = ({ user, onUpgradeClick }) => {
  const isPremiumOrAbove = hasRequiredTier(user.tier, 'premium');

  // 1. 수면 기록 상태
  const [bedTime, setBedTime] = useState('00:30');
  const [wakeTime, setWakeTime] = useState('06:45');
  const [sleepQuality, setSleepQuality] = useState<'GOOD' | 'NORMAL' | 'POOR'>('GOOD');
  const [sleepMemo, setSleepMemo] = useState('');
  const [sleepLogs, setSleepLogs] = useState<SleepLogItem[]>(() =>
    dataSyncService.getSleepLogs(user.studentId)
  );
  const [sleepGoal, setSleepGoal] = useState<any | null>(() => dataSyncService.getSleepGoal(user.studentId));

  // 2. 호흡 가이드 상태 (4-7-8)
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathSeconds, setBreathSeconds] = useState(4);
  const [isBreathingActive, setIsBreathingActive] = useState(false);

  // 3. 커피냅 20분 타이머
  const [coffeeNapSeconds, setCoffeeNapSeconds] = useState(20 * 60);
  const [isCoffeeNapActive, setIsCoffeeNapActive] = useState(false);

  // 4. 웹 오디오 화이트 노이즈 사운드 믹서
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [rainVolume, setRainVolume] = useState(60);
  const [waveVolume, setWaveVolume] = useState(40);
  const audioContextRef = useRef<AudioContext | null>(null);
  const rainGainRef = useRef<GainNode | null>(null);
  const waveGainRef = useRef<GainNode | null>(null);

  // 5. 오늘 멘탈 & 컨디션 체크
  const [todayCondition, setTodayCondition] = useState<number>(7); // 1~10

  useEffect(() => {
    const handleUpdate = () => {
      setSleepLogs(dataSyncService.getSleepLogs(user.studentId));
    setSleepGoal(dataSyncService.getSleepGoal(user.studentId));
    };
    window.addEventListener('nbass_data_updated', handleUpdate);
    return () => window.removeEventListener('nbass_data_updated', handleUpdate);
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

  // 커피냅 타이머
  useEffect(() => {
    let timer: any = null;
    if (isCoffeeNapActive && coffeeNapSeconds > 0) {
      timer = setInterval(() => setCoffeeNapSeconds(prev => prev - 1), 1000);
    } else if (coffeeNapSeconds === 0) {
      setIsCoffeeNapActive(false);
      alert('⏰ 20분 커피 냅 완료! 전두엽 아데노신이 리셋되었습니다.');
      setCoffeeNapSeconds(20 * 60);
    }
    return () => clearInterval(timer);
  }, [isCoffeeNapActive, coffeeNapSeconds]);

  // Web Audio 백색소음 합성 엔진
  const toggleWhiteNoise = () => {
    if (isPlayingAudio) {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      setIsPlayingAudio(false);
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      // 빗소리 노이즈 버퍼 생성 (Pink Noise Filtered)
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        output[i] = (b0 + b1 + b2 + white * 0.5362) * 0.11;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Filter for rain sound
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, ctx.currentTime);

      const rainGain = ctx.createGain();
      rainGain.gain.setValueAtTime(rainVolume / 100, ctx.currentTime);
      rainGainRef.current = rainGain;

      whiteNoise.connect(filter);
      filter.connect(rainGain);
      rainGain.connect(ctx.destination);
      whiteNoise.start();

      setIsPlayingAudio(true);
    } catch (e) {
      console.warn('Web Audio start failed:', e);
    }
  };

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
      id: newRecordId('slp'),
      studentId: user.studentId,
      date: new Date().toISOString().split('T')[0],
      bedTime,
      wakeTime,
      totalHours: currentSleepHours,
      sleepDebtHours: sleepDebt,
      quality: sleepQuality,
      memo: sleepMemo.trim() || (sleepDebt > 1.5 ? '수면 부채 주의' : '양호한 수면 회복')
    };

    await dataSyncService.saveSleepLog(newLog);
    setSleepLogs(dataSyncService.getSleepLogs(user.studentId));
    setSleepMemo('');
  };

  const handleDeleteLog = async (id: string) => {
    await dataSyncService.deleteSleepLog(user.studentId, id);
    setSleepLogs(dataSyncService.getSleepLogs(user.studentId));
  };

  return (
    <div className="p-4 space-y-4 pb-24 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1 text-xs font-bold text-indigo-600">
            <Moon className="w-4 h-4" />
            <span>서카디안 리듬 &amp; 자율신경 멘탈 케어</span>
          </div>
          <h2 className="text-xl font-black text-slate-900">수면 &amp; 멘탈 케어 랩</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            기상/취침 리듬을 관리하고, 4-7-8 호흡과 사운드 믹서로 전두엽 피로를 즉시 회복하세요.
          </p>
        </div>
      </div>

      {/* 두뇌 피크 시간대 (진단 크로노타입 + 기상시간 기반) */}
      {(() => {
        try {
          const r = dataSyncService.getLatestAssessment(user.studentId);
          const chrono = r?.cognitiveProfile?.chronotype;
          if (!chrono) return null;
          const [h, m] = wakeTime.split(':').map(Number);
          if (isNaN(h) || isNaN(m)) return null;
          const fmt = (d: number) => {
            const tot = ((h * 60 + m + d * 60) % 1440 + 1440) % 1440;
            return `${String(Math.floor(tot / 60)).padStart(2, '0')}:${String(tot % 60).padStart(2, '0')}`;
          };
          const range = chrono === 'morning' ? [2, 5] : chrono === 'evening' ? [8, 11] : [4, 7];
          const label = chrono === 'morning' ? '아침형' : chrono === 'evening' ? '저녁형' : '중간형';
          return (
            <div className="bg-white p-5 rounded-3xl border border-amber-200 shadow-xs">
              <h3 className="text-sm font-black text-slate-900 mb-1">⚡ 두뇌 피크 시간대 <span className="text-[10px] font-bold text-slate-400">{label} · 진단 기반</span></h3>
              <p className="text-xs text-slate-700 font-bold">오늘 {fmt(range[0])} ~ {fmt(range[1])} — 가장 어려운 과목을 이 구간에 배치하세요.</p>
            </div>
          );
        } catch {
          return null;
        }
      })()}

      {/* PC 연동: 수면 목표 (읽기 전용) */}      {sleepGoal && (sleepGoal.targetBedtime || sleepGoal.targetWakeTime || sleepGoal.targetDuration) && (
        <div className="bg-white p-5 rounded-3xl border border-indigo-200 shadow-xs">
          <h3 className="text-sm font-black text-slate-900 mb-2">🌙 수면 목표 <span className="text-[10px] font-bold text-emerald-600">PC 연동</span></h3>
          <div className="flex items-center gap-2 text-xs">
            <span className="bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2 font-bold text-slate-700">
              취침 {sleepGoal.targetBedtime || '--:--'}
            </span>
            <span className="bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2 font-bold text-slate-700">
              기상 {sleepGoal.targetWakeTime || '--:--'}
            </span>
            {sleepGoal.targetDuration ? (
              <span className="bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2 font-bold text-slate-700">
                {sleepGoal.targetDuration}시간
              </span>
            ) : null}
          </div>
          {sleepGoal.memo ? <p className="text-[11px] text-slate-500 mt-2">{sleepGoal.memo}</p> : null}
        </div>
      )}

      {/* Responsive Grid: Tablet 2 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ================= LEFT: 수면 관리 섹션 ================= */}
        <div className="space-y-4">
          {/* 수면 입력 폼 */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span>오늘의 수면 기록 및 부채 측정</span>
              </h3>
              <span className="text-[11px] font-black text-indigo-600">
                총 {currentSleepHours}시간
              </span>
            </div>

            <form onSubmit={handleSaveSleep} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                    <Moon className="w-3.5 h-3.5 text-indigo-500" /> 취침 시각
                  </label>
                  <input
                    type="time"
                    value={bedTime}
                    onChange={e => setBedTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-black text-center"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                    <Sun className="w-3.5 h-3.5 text-amber-500" /> 기상 시각
                  </label>
                  <input
                    type="time"
                    value={wakeTime}
                    onChange={e => setWakeTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-black text-center"
                    required
                  />
                </div>
              </div>

              {/* 수면 부채 게이지 */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="flex justify-between text-xs font-black">
                  <span className="text-slate-700">실시간 수면 부채 (기준 7.5시간)</span>
                  <span className={sleepDebt > 1.5 ? 'text-rose-600' : 'text-emerald-600'}>
                    {sleepDebt > 0 ? `-${sleepDebt}시간 누적` : '충분한 수면 확보'}
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      sleepDebt > 1.5 ? 'bg-rose-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, (currentSleepHours / 7.5) * 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">수면 만족도</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['GOOD', 'NORMAL', 'POOR'] as const).map(q => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setSleepQuality(q)}
                      className={`py-2 text-[11px] font-black rounded-xl border transition ${
                        sleepQuality === q
                          ? 'bg-indigo-600 text-white border-indigo-700'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      {q === 'GOOD' ? '상쾌함' : q === 'NORMAL' ? '보통' : '피곤함'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <input
                  type="text"
                  value={sleepMemo}
                  onChange={e => setSleepMemo(e.target.value)}
                  placeholder="특이사항 메모 (예: 입면 지연, 커피 섭취 등)"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-indigo-600 text-white font-black text-xs shadow-md active:scale-95 transition"
              >
                오늘 수면 일지 저장 및 PC 동기화
              </button>
            </form>
          </div>

          {/* 최근 수면 일지 목록 */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-black text-slate-900 flex items-center justify-between">
              <span>최근 수면 히스토리</span>
              <span className="text-[10px] text-slate-400 font-bold">최신 {sleepLogs.length}건</span>
            </h3>

            <div className="space-y-2 max-h-56 overflow-y-auto">
              {sleepLogs.map(log => (
                <div
                  key={log.id}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-800">{log.date}</span>
                      <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                        {log.totalHours}시간 수면
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {log.bedTime} ~ {log.wakeTime} {log.memo && `· ${log.memo}`}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteLog(log.id)}
                    className="text-slate-400 hover:text-rose-500 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ================= RIGHT: 멘탈 이완 & 호흡 & 사운드 ================= */}
        <div className="space-y-4">
          {/* 4-7-8 자율신경 이완 호흡 가이드 */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4 text-center">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <Wind className="w-4 h-4 text-emerald-600" />
                <span>4-7-8 자율신경 안정화 호흡기</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-bold">의학 이완 프로토콜</span>
            </div>

            {/* Breathing Animation Circle */}
            <div className="py-6 flex flex-col items-center justify-center">
              <div
                className={`w-36 h-36 rounded-full flex flex-col items-center justify-center transition-all duration-1000 shadow-lg ${
                  breathPhase === 'inhale'
                    ? 'bg-blue-500 text-white scale-110'
                    : breathPhase === 'hold'
                    ? 'bg-amber-500 text-white scale-105 ring-8 ring-amber-300/40'
                    : 'bg-emerald-500 text-white scale-95'
                }`}
              >
                <span className="text-3xl font-black">{breathSeconds}</span>
                <span className="text-xs font-black tracking-wider uppercase mt-1">
                  {breathPhase === 'inhale' && '들이쉬기 (코)'}
                  {breathPhase === 'hold' && '숨 멈추기 (정지)'}
                  {breathPhase === 'exhale' && '내쉬기 (입)'}
                </span>
              </div>

              <p className="text-xs text-slate-500 mt-4 leading-relaxed">
                4초간 코로 깊게 들이쉬고, 7초간 숨을 멈추고, 8초간 천천히 내쉽니다.
              </p>
            </div>

            <button
              onClick={() => setIsBreathingActive(!isBreathingActive)}
              className={`w-full py-3 rounded-2xl font-black text-xs shadow-md transition flex items-center justify-center gap-1.5 ${
                isBreathingActive
                  ? 'bg-rose-500 text-white'
                  : 'bg-emerald-600 text-white active:scale-95'
              }`}
            >
              {isBreathingActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
              <span>{isBreathingActive ? '호흡 멈추기' : '호흡 가이드 시작'}</span>
            </button>
          </div>

          {/* Web Audio 백색소음 사운드 믹서 */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-purple-600" />
                <span>수험생 전두엽 집중 사운드 (Web Audio)</span>
              </h3>
              <button
                onClick={toggleWhiteNoise}
                className={`px-3 py-1 rounded-xl text-xs font-black transition flex items-center gap-1 ${
                  isPlayingAudio
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {isPlayingAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlayingAudio ? '소리 끄기' : '빗소리 재생'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-500">
              네트워크 없이 즉시 동작하는 핑크노이즈 기반의 뇌파 안정화 사운드입니다.
            </p>

            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>🌧️ 차분한 빗소리 볼륨</span>
                <span>{rainVolume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={rainVolume}
                onChange={e => {
                  const val = Number(e.target.value);
                  setRainVolume(val);
                  if (rainGainRef.current && audioContextRef.current) {
                    rainGainRef.current.gain.setValueAtTime(val / 100, audioContextRef.current.currentTime);
                  }
                }}
                className="w-full accent-purple-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* 20분 커피 냅 타이머 */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-3xl border border-amber-200 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-800">
                <Coffee className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-black text-amber-900 block">20분 커피 냅 (Power Nap)</span>
                <span className="text-[11px] text-amber-700 font-medium">
                  {Math.floor(coffeeNapSeconds / 60)}분 {String(coffeeNapSeconds % 60).padStart(2, '0')}초 남음
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsCoffeeNapActive(!isCoffeeNapActive)}
              className="py-2 px-3.5 rounded-xl bg-amber-600 text-white font-black text-xs shadow-xs active:scale-95 transition"
            >
              {isCoffeeNapActive ? '일시정지' : '낮잠 시작'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
