import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { hasRequiredTier } from '../services/featureGate';
import { LockedCard } from '../components/tiered-features/LockedCard';
import { Heart, Wind, Volume2, Sparkles, Play, Pause } from 'lucide-react';

interface WellnessPageProps {
  user: UserProfile;
  onUpgradeClick: () => void;
}

export const WellnessPage: React.FC<WellnessPageProps> = ({ user, onUpgradeClick }) => {
  const isProOrAbove = hasRequiredTier(user.tier, 'pro');
  const isPremiumOrAbove = hasRequiredTier(user.tier, 'premium');

  // 호흡 가이드 인터랙션 (4초 들이쉬기, 7초 멈추기, 8초 내쉬기)
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathSeconds, setBreathSeconds] = useState(4);
  const [isBreathingActive, setIsBreathingActive] = useState(false);

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

  // 사운드 믹서 볼륨 (PREMIUM)
  const [rainVol, setRainVol] = useState(60);
  const [waveVol, setWaveVol] = useState(40);
  const [cafeVol, setCafeVol] = useState(50);
  const [isPlayingSound, setIsPlayingSound] = useState(false);

  return (
    <div className="p-4 space-y-4 pb-20 max-w-md mx-auto">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 mb-1 text-xs font-bold text-emerald-600">
          <Heart className="w-4 h-4" />
          <span>자율신경계 안정 &amp; 힐링</span>
        </div>
        <h2 className="text-xl font-black text-slate-900">멘탈 &amp; 웰니스 케어</h2>
        <p className="text-xs text-slate-500 mt-1">
          시험 불안과 긴장도를 낮추고 뇌파를 알파(Alpha)파 상태로 안정화합니다.
        </p>
      </div>

      {/* 1. 4-7-8 신경계 이완 호흡법 (전체 회원 무료 제공) */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
            <Wind className="w-4 h-4 text-emerald-500" />
            <span>4-7-8 자율신경 리셋 호흡</span>
          </h3>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
            무료 제공
          </span>
        </div>

        <div className="text-center py-6 bg-gradient-to-b from-emerald-50/50 to-teal-50/50 rounded-2xl border border-emerald-100 flex flex-col items-center justify-center">
          {/* Breathing Circle */}
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

          <p className="text-xs text-slate-600 mt-4 max-w-xs">
            {breathPhase === 'inhale' && '코로 깊고 천천히 폐 가득 숨을 들이쉽니다.'}
            {breathPhase === 'hold' && '가슴을 펴고 편안하게 호흡을 멈춥니다.'}
            {breathPhase === 'exhale' && '입으로 가볍게 후- 소리를 내며 완전히 비워냅니다.'}
          </p>

          <button
            onClick={() => setIsBreathingActive(!isBreathingActive)}
            className={`mt-4 px-6 py-2 rounded-xl text-xs font-bold transition active:scale-95 shadow-sm ${
              isBreathingActive
                ? 'bg-slate-800 text-white'
                : 'bg-emerald-600 text-white hover:bg-emerald-500'
            }`}
          >
            {isBreathingActive ? '호흡 멈추기' : '호흡 가이드 시작'}
          </button>
        </div>
      </div>

      {/* 2. 몰입 백색소음 사운드 믹서 (PREMIUM 전용) */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
            <Volume2 className="w-4 h-4 text-indigo-600" />
            <span>집중력 백색소음 사운드 믹서</span>
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
                  <span>🌧️ 숲속 빗소리 (Pink Noise)</span>
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
                  <span>☕ 잔잔한 카페 소음 (Ambient)</span>
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
            description="빗소리, 파도, 카페 앰비언스를 원하는 볼륨으로 믹싱해 잡념을 차단하는 사운드 믹서는 PREMIUM 등급부터 이용 가능합니다."
            onUpgradeClick={onUpgradeClick}
          />
        )}
      </div>
    </div>
  );
};
