import React, { useState, useEffect, useRef } from 'react';

type NoiseType = 'Rain' | 'Ocean';

interface LocalWhiteNoiseProps {
    type: NoiseType;
    title: string;
}

export const LocalWhiteNoise: React.FC<LocalWhiteNoiseProps> = ({ type, title }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);
    const noiseSourceRef = useRef<AudioBufferSourceNode | null>(null);

    // Audio clean up
    useEffect(() => {
        return () => {
            if (audioCtxRef.current) {
                audioCtxRef.current.close();
            }
        };
    }, []);

    const togglePlay = () => {
        if (isPlaying) {
            stopNoise();
        } else {
            playNoise();
        }
    };

    const playNoise = () => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const ctx = audioCtxRef.current;

        // Resume if suspended
        if (ctx.state === 'suspended') {
            ctx.resume();
        }

        const bufferSize = ctx.sampleRate * 5; // 5 seconds buffer
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        // Generate pure white noise
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = buffer;
        noiseSource.loop = true;

        const masterGain = ctx.createGain();
        masterGain.gain.value = 0.5;

        if (type === 'Rain') {
            // Rain: We need it to sound like "shhhh" (pink/brown noise) with some high-end sizzle for drops
            const lowpass = ctx.createBiquadFilter();
            lowpass.type = 'lowpass';
            lowpass.frequency.value = 1200; // Cut off harsh highs
            
            const highpass = ctx.createBiquadFilter();
            highpass.type = 'highpass';
            highpass.frequency.value = 300; // Cut off muddy lows

            // To make it sound like rain, we modulate the amplitude VERY quickly (audio rate noise)
            const rainLFO = ctx.createOscillator();
            rainLFO.type = 'sine';
            rainLFO.frequency.value = 50; // fast flutter

            const lfoGain = ctx.createGain();
            lfoGain.gain.value = 0.2;

            rainLFO.connect(lfoGain);
            // We can't directly modulate amplitude effectively like drops with sine, 
            // but this adds a "fluttering" texture to the static noise
            
            noiseSource.connect(lowpass);
            lowpass.connect(highpass);
            highpass.connect(masterGain);
            
            rainLFO.start();

        } else if (type === 'Ocean') {
            // Ocean: Multiple waves rolling in. 
            // Deep lowpass filter sweeping up and down.
            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 400; // Base frequency

            // LFO 1: Main wave swelling (12 seconds)
            const lfo1 = ctx.createOscillator();
            lfo1.type = 'sine';
            lfo1.frequency.value = 1 / 12;

            const lfo1GainFilter = ctx.createGain();
            lfo1GainFilter.gain.value = 800; // Modulate frequency by 800Hz
            lfo1.connect(lfo1GainFilter);
            lfo1GainFilter.connect(filter.frequency);

            const lfo1GainAmp = ctx.createGain();
            lfo1GainAmp.gain.value = 0.5; // Modulate volume
            lfo1.connect(lfo1GainAmp);
            lfo1GainAmp.connect(masterGain.gain);

            // LFO 2: Secondary distant wave (8 seconds)
            const lfo2 = ctx.createOscillator();
            lfo2.type = 'sine';
            lfo2.frequency.value = 1 / 8;
            
            const lfo2GainAmp = ctx.createGain();
            lfo2GainAmp.gain.value = 0.2;
            lfo2.connect(lfo2GainAmp);
            lfo2GainAmp.connect(masterGain.gain);

            noiseSource.connect(filter);
            filter.connect(masterGain);

            lfo1.start();
            lfo2.start();
            
            masterGain.gain.value = 0.2; // Base volume is lower so swells stand out
        }

        masterGain.connect(ctx.destination);
        noiseSource.start();

        noiseSourceRef.current = noiseSource;
        gainNodeRef.current = masterGain;

        setIsPlaying(true);
    };

    const stopNoise = () => {
        if (noiseSourceRef.current) {
            noiseSourceRef.current.stop();
            noiseSourceRef.current.disconnect();
            noiseSourceRef.current = null;
        }
        setIsPlaying(false);
    };

    return (
        <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all flex items-center p-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center flex-shrink-0 cursor-pointer hover:bg-indigo-100 transition-colors" onClick={togglePlay}>
                <span className="text-3xl">{isPlaying ? '⏸️' : '▶️'}</span>
            </div>
            <div className="ml-4 flex-1">
                <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900">{title}</h4>
                    {isPlaying && (
                        <div className="flex items-center gap-1">
                            <span className="w-1 h-3 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-1 h-4 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-1 h-3 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                    )}
                </div>
                <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded font-bold uppercase">
                    {type}
                </span>
                <p className="text-xs text-slate-400 mt-1">
                    {type === 'Rain' ? '집중력 강화에 좋은 백색소음' : '긴장 완화에 좋은 파도 소리'}
                </p>
            </div>
        </div>
    );
};
