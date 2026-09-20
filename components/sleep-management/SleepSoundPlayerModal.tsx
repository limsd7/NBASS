import React, { useState, useEffect, useRef } from 'react';

interface SleepSoundPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  careTypeTitle?: string;
}

export const SleepSoundPlayerModal: React.FC<SleepSoundPlayerModalProps> = ({
  isOpen,
  onClose,
  careTypeTitle = '표준',
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [soundMode, setSoundMode] = useState<'delta' | 'alpha' | 'rain'>('delta');
  const [volume, setVolume] = useState<number>(0.5);
  const [timerMinutes, setTimerMinutes] = useState<number>(30);
  const [timeLeft, setTimeLeft] = useState<number>(30 * 60);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const leftOscRef = useRef<OscillatorNode | null>(null);
  const rightOscRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const noiseNodeRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    let interval: any = null;
    if (isPlaying && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            stopAudio();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, timeLeft]);

  // Adjust volume
  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(volume, audioCtxRef.current.currentTime);
    }
  }, [volume]);

  const stopAudio = () => {
    try {
      if (leftOscRef.current) {
        leftOscRef.current.stop();
        leftOscRef.current.disconnect();
        leftOscRef.current = null;
      }
      if (rightOscRef.current) {
        rightOscRef.current.stop();
        rightOscRef.current.disconnect();
        rightOscRef.current = null;
      }
      if (noiseNodeRef.current) {
        noiseNodeRef.current.stop();
        noiseNodeRef.current.disconnect();
        noiseNodeRef.current = null;
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    } catch (e) {
      console.error('Error stopping audio:', e);
    }
    setIsPlaying(false);
  };

  const startAudio = () => {
    stopAudio();

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();
    audioCtxRef.current = ctx;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume, ctx.currentTime);
    masterGain.connect(ctx.destination);
    gainNodeRef.current = masterGain;

    if (soundMode === 'rain') {
      // Pink Noise Generator for Rain Sound
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;
      whiteNoise.connect(masterGain);
      whiteNoise.start();
      noiseNodeRef.current = whiteNoise;
    } else {
      // Binaural Beats Generator
      const carrier = 196; // G3
      const beatFreq = soundMode === 'delta' ? 2.5 : 10.0; // Delta: 2.5Hz, Alpha: 10Hz

      // Stereo merger
      const merger = ctx.createChannelMerger(2);

      const leftOsc = ctx.createOscillator();
      leftOsc.type = 'sine';
      leftOsc.frequency.setValueAtTime(carrier - beatFreq / 2, ctx.currentTime);
      leftOsc.connect(merger, 0, 0);

      const rightOsc = ctx.createOscillator();
      rightOsc.type = 'sine';
      rightOsc.frequency.setValueAtTime(carrier + beatFreq / 2, ctx.currentTime);
      rightOsc.connect(merger, 0, 1);

      merger.connect(masterGain);

      leftOsc.start();
      rightOsc.start();

      leftOscRef.current = leftOsc;
      rightOscRef.current = rightOsc;
    }

    setIsPlaying(true);
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      startAudio();
    }
  };

  const handleModeChange = (mode: 'delta' | 'alpha' | 'rain') => {
    setSoundMode(mode);
    if (isPlaying) {
      setTimeout(() => {
        startAudio();
      }, 50);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 border border-indigo-500/30 rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl text-white relative">
        <div className="flex justify-between items-center pb-4 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-xl">
              🎧
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">델타파 수면 사운드 테라피</h3>
              <p className="text-xs text-indigo-200/80">[{careTypeTitle}] 맞춤 뇌파 동조 음원</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopAudio();
              onClose();
            }}
            className="text-slate-400 hover:text-white text-lg cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Sound Waves Animation Visualizer */}
        <div className="my-6 p-6 rounded-3xl bg-black/40 border border-indigo-500/20 text-center relative overflow-hidden">
          <div className="flex justify-center items-center gap-1.5 h-16 mb-3">
            {[40, 70, 95, 60, 85, 100, 75, 45, 90, 65, 50, 80].map((h, i) => (
              <div
                key={i}
                className={`w-1.5 rounded-full transition-all duration-300 ${
                  isPlaying ? 'bg-gradient-to-t from-indigo-500 to-cyan-400' : 'bg-slate-700'
                }`}
                style={{
                  height: isPlaying ? `${Math.max(15, (h * volume * (Math.sin(Date.now() / 200 + i) * 0.3 + 0.7)))}%` : '15%',
                }}
              />
            ))}
          </div>

          <div className="font-mono text-2xl font-black text-indigo-300">
            {formatTime(timeLeft)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {soundMode === 'delta' ? '🌊 2.5Hz 델타파 (서파수면 유도 & 전두엽 회복)' :
             soundMode === 'alpha' ? '🧘 10.0Hz 알파파 (취침 전 긴장 완화 & 불안 진정)' :
             '🌧️ 핑크 노이즈 (잡음 차단 수면 배경음)'}
          </p>
        </div>

        {/* Mode Selector */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          <button
            onClick={() => handleModeChange('delta')}
            className={`p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
              soundMode === 'delta'
                ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            <span className="block text-base mb-0.5">🌙</span>
            델타파 (깊은 수면)
          </button>
          <button
            onClick={() => handleModeChange('alpha')}
            className={`p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
              soundMode === 'alpha'
                ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            <span className="block text-base mb-0.5">🧘</span>
            알파파 (이완)
          </button>
          <button
            onClick={() => handleModeChange('rain')}
            className={`p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
              soundMode === 'rain'
                ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            <span className="block text-base mb-0.5">🌧️</span>
            수면 빗소리
          </button>
        </div>

        {/* Volume & Timer Controls */}
        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center text-xs text-slate-300">
            <span>🔊 볼륨 조절</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-36 accent-indigo-400 cursor-pointer"
            />
          </div>

          <div className="flex justify-between items-center text-xs text-slate-300">
            <span>⏱️ 타이머 설정</span>
            <div className="flex gap-1">
              {[15, 30, 60].map((mins) => (
                <button
                  key={mins}
                  onClick={() => {
                    setTimerMinutes(mins);
                    setTimeLeft(mins * 60);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                    timerMinutes === mins
                      ? 'bg-indigo-500/40 border-indigo-400 text-white'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  {mins}분
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Play / Pause Big Button */}
        <button
          onClick={handleTogglePlay}
          className={`w-full py-3.5 rounded-2xl font-bold text-sm shadow-xl flex items-center justify-center space-x-2 transition-all cursor-pointer ${
            isPlaying
              ? 'bg-rose-600 hover:bg-rose-700 text-white'
              : 'bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white'
          }`}
        >
          <span>{isPlaying ? '⏸️ 사운드 일시정지' : '▶️ 뇌파 테라피 시작 (이어폰 권장)'}</span>
        </button>

        <p className="text-[10px] text-center text-slate-400 mt-3 leading-relaxed">
          💡 바이노럴 비트 효과를 극대화하려면 <strong>이어폰 또는 헤드폰 착용</strong>을 권장합니다.
        </p>
      </div>
    </div>
  );
};
