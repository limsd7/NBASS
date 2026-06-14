import React, { useState } from 'react';

interface SoundTrack {
    id: string;
    name: string;
    icon: string;
    color: string;
    volume: number; // 0-100
    isPlaying: boolean;
}

export const SoundMixer = () => {
    const [tracks, setTracks] = useState<SoundTrack[]>([
        { id: 'alpha', name: 'Alpha Waves (10Hz)', icon: '🌊', color: 'bg-blue-500', volume: 50, isPlaying: false },
        { id: 'beta', name: 'Beta Waves (14Hz)', icon: '⚡', color: 'bg-indigo-500', volume: 0, isPlaying: false },
        { id: 'rain', name: 'Rainy Window', icon: '🌧️', color: 'bg-slate-500', volume: 30, isPlaying: false },
        { id: 'cafe', name: 'Coffee Shop', icon: '☕', color: 'bg-amber-700', volume: 0, isPlaying: false },
        { id: 'fire', name: 'Fireplace', icon: '🔥', color: 'bg-orange-600', volume: 0, isPlaying: false },
    ]);

    const handleVolumeChange = (id: string, vol: number) => {
        setTracks(prev => prev.map(t => t.id === id ? { ...t, volume: vol } : t));
        // Real implementation would update Audio element volume here
    };

    const togglePlay = (id: string) => {
        setTracks(prev => prev.map(t => t.id === id ? { ...t, isPlaying: !t.isPlaying } : t));
        // Real implementation would start/stop audio context
    };

    const toggleAll = (play: boolean) => {
        setTracks(prev => prev.map(t => ({ ...t, isPlaying: play })));
    };

    return (
        <div className="p-8 h-full">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-2xl font-black text-slate-800 mb-2">Neural Sound Mixer</h3>
                    <p className="text-sm text-slate-500">
                        뇌파 동조(Entrainment)를 위한 바이노럴 비트와 화이트 노이즈를 믹싱하세요.
                    </p>
                </div>
                <button
                    onClick={() => toggleAll(false)}
                    className="px-4 py-2 bg-slate-100 font-bold text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
                >
                    🔇 Mute All
                </button>
            </div>

            <div className="space-y-6 max-w-3xl mx-auto">
                {tracks.map(track => (
                    <div key={track.id} className={`bg-white p-4 rounded-2xl border transition-all duration-300 flex items-center gap-6 
                        ${track.isPlaying ? 'border-indigo-200 shadow-md transform scale-[1.02]' : 'border-slate-100 opacity-70 hover:opacity-100'}`}>

                        <button
                            onClick={() => togglePlay(track.id)}
                            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm transition-all
                                ${track.isPlaying ? `${track.color} text-white` : 'bg-slate-100 text-slate-400'}`}
                        >
                            {track.icon}
                        </button>

                        <div className="flex-1">
                            <div className="flex justify-between mb-2">
                                <h4 className={`font-bold ${track.isPlaying ? 'text-slate-800' : 'text-slate-400'}`}>{track.name}</h4>
                                <span className="text-xs font-bold text-slate-400">{track.volume}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={track.volume}
                                onChange={(e) => handleVolumeChange(track.id, parseInt(e.target.value))}
                                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                disabled={!track.isPlaying}
                            />
                        </div>

                        <div className={`w-2 h-2 rounded-full ${track.isPlaying ? 'bg-emerald-500 animate-pulse' : 'bg-slate-200'}`}></div>
                    </div>
                ))}
            </div>

            <div className="mt-10 bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Presets</p>
                <div className="flex justify-center gap-3">
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:border-indigo-300 hover:text-indigo-600">🚀 극강 몰입 (Deep Focus)</button>
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:border-emerald-300 hover:text-emerald-600">🌿 편안한 휴식 (Relax)</button>
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:border-amber-300 hover:text-amber-600">☕ 카페 분위기</button>
                </div>
            </div>
        </div>
    );
};
