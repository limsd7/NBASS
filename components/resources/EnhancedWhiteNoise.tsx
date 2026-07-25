import React, { useState } from 'react';

export const EnhancedWhiteNoise: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [soundType, setSoundType] = useState<'rain' | 'wave' | 'fire' | 'cafe'>('rain');

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
          <span>🎧</span> 뇌파 안정 핑크/브라운 백색소음
        </h3>
        <button
          onClick={togglePlay}
          className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${isPlaying ? 'bg-rose-500 text-white shadow-md' : 'bg-blue-600 text-white shadow-md'}`}
        >
          {isPlaying ? '일시정지 ⏸️' : '재생하기 ▶️'}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { id: 'rain', name: '🌧️ 빗소리', desc: '집중력 강화' },
          { id: 'wave', name: '🌊 파도소리', desc: '불안 완화' },
          { id: 'fire', name: '모닥불', desc: '알파파 유도' },
          { id: 'cafe', name: '☕ 백색소음', desc: '몰입 환경' }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setSoundType(item.id as any)}
            className={`p-3 rounded-2xl border text-center transition-all ${soundType === item.id ? 'bg-blue-50 border-blue-300 dark:bg-blue-900/30 dark:border-blue-700 text-blue-700 dark:text-blue-300 font-bold' : 'bg-slate-50 border-slate-200 dark:bg-slate-700/50 dark:border-slate-600 text-slate-600 dark:text-slate-300'}`}
          >
            <div className="text-sm font-bold">{item.name}</div>
            <div className="text-[10px] opacity-75">{item.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
};
