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

        const bufferSize = ctx.sampleRate * 2; // 2 seconds buffer
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        // Pink/Brown noise state variables
        let lastOut = 0;
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;

            if (type === 'Rain') {
                // Brown Noise approximation for Rain
                lastOut = (lastOut + (0.02 * white)) / 1.02;
                data[i] = lastOut * 3.5; // Compensate gain
            } else {
                // Pink Noise approximation for Ocean
                b0 = 0.99886 * b0 + white * 0.0555179;
                b1 = 0.99332 * b1 + white * 0.0750759;
                b2 = 0.96900 * b2 + white * 0.1538520;
                b3 = 0.86650 * b3 + white * 0.3104856;
                b4 = 0.55000 * b4 + white * 0.5329522;
                b5 = -0.7616 * b5 - white * 0.0168980;
                data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
                data[i] *= 0.11; // Compensate gain
                b6 = white * 0.115926;
            }
        }

        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = buffer;
        noiseSource.loop = true;

        const masterGain = ctx.createGain();
        masterGain.gain.value = 0.5;

        // For Ocean, add an LFO to simulate waves (volume swelling)
        if (type === 'Ocean') {
            const lfo = ctx.createOscillator();
            lfo.type = 'sine';
            lfo.frequency.value = 0.1; // 10 seconds per wave cycle

            const lfoGain = ctx.createGain();
            lfoGain.gain.value = 0.3; // Depth of the wave
            masterGain.gain.value = 0.4; // Base volume

            lfo.connect(lfoGain);
            lfoGain.connect(masterGain.gain);
            lfo.start();

            // Additional lowpass filter to make it sound more like deep water
            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 400; // Hz
            
            noiseSource.connect(filter);
            filter.connect(masterGain);
        } else if (type === 'Rain') {
            // Rain (Brown Noise) also needs a bit of high freq shaping
            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 1000; // Hz
            
            noiseSource.connect(filter);
            filter.connect(masterGain);
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
