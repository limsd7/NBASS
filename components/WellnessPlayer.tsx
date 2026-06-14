import React, { useState, useEffect, useRef } from 'react';
import { CareType } from '../types';

interface WellnessPlayerProps {
    careType: CareType | null;
}

const GOOGLE_SOUNDS = {
    WAVES: 'https://actions.google.com/sounds/v1/water/waves_crashing_on_rocks.ogg',
    RAIN: 'https://actions.google.com/sounds/v1/water/rain_heavy_loud.ogg',
    CAFE: 'https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg',
    STREAM: 'https://actions.google.com/sounds/v1/water/stream_water.ogg',
    BIRDS: 'https://actions.google.com/sounds/v1/birds/dawn_chorus.ogg'
};

export const WellnessPlayer: React.FC<WellnessPlayerProps> = ({ careType }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const getTrackInfo = () => {
        switch (careType) {
            case CareType.BURNOUT: return { title: 'Deep Relaxation Theta Waves', desc: '번아웃 회복을 위한 파도 소리', url: GOOGLE_SOUNDS.WAVES };
            case CareType.SLEEP: return { title: 'Delta Sleep Induction', desc: '수면 진입을 돕는 빗소리', url: GOOGLE_SOUNDS.RAIN };
            case CareType.CONCENTRATION: return { title: 'Focus Alpha-Beta Mix', desc: '집중력을 높이는 카페 화이트노이즈', url: GOOGLE_SOUNDS.CAFE };
            case CareType.CIRCULATION: return { title: 'Binaural Beats for Circulation', desc: '혈액순환과 이완을 돕는 계곡 물소리', url: GOOGLE_SOUNDS.STREAM };
            default: return { title: 'Nature Balance', desc: '일상의 균형을 위한 자연의 소리', url: GOOGLE_SOUNDS.BIRDS };
        }
    };

    const track = getTrackInfo();

    useEffect(() => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.play().catch(e => {
                    console.error("Audio play failed:", e);
                    setIsPlaying(false);
                });
            } else {
                audioRef.current.pause();
            }
        }
    }, [isPlaying]);

    // When track url changes, reset and load new source
    useEffect(() => {
        setIsPlaying(false);
        if (audioRef.current) {
            audioRef.current.load();
        }
    }, [track.url]);

    return (
        <div className="fixed bottom-24 right-6 z-[60] animate-in slide-in-from-bottom duration-700 print:hidden">
            <audio ref={audioRef} src={track.url} loop hidden />

            <div className={`bg-slate-900 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-slate-700 transition-all cursor-pointer hover:border-slate-500 ${isPlaying ? 'w-80' : 'w-auto'}`}>
                <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 hover:scale-110 transition-transform shadow-lg ${isPlaying ? 'bg-rose-500 shadow-rose-500/30' : 'bg-emerald-500 shadow-emerald-500/30'}`}
                >
                    {isPlaying ? '⏸' : '▶'}
                </button>

                {isPlaying && (
                    <div className="flex-1 min-w-0" onClick={() => setIsPlaying(false)}>
                        <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Instant Therapy</p>
                        <h4 className="font-bold truncate text-sm">{track.title}</h4>
                        <p className="text-[10px] text-slate-400 truncate">{track.desc}</p>

                        {/* Animated Waveform */}
                        <div className="mt-2 flex items-end gap-0.5 h-3">
                            {[...Array(20)].map((_, i) => (
                                <div key={i}
                                    className="w-1 bg-emerald-500 rounded-t-sm animate-pulse"
                                    style={{
                                        height: `${Math.random() * 100}%`,
                                        animationDelay: `${i * 0.1}s`
                                    }}
                                ></div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
