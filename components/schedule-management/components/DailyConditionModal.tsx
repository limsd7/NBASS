import React, { useState } from 'react';
import { CareType } from '../types';
import { CARE_TYPES } from '../data/careTypes';
import { X, Sparkles, Heart, Moon, Zap, Smile } from 'lucide-react';

interface DailyConditionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCareType: (care: CareType) => void;
}

export const DailyConditionModal: React.FC<DailyConditionModalProps> = ({
  isOpen,
  onClose,
  onSelectCareType
}) => {
  const [sleepHours, setSleepHours] = useState<number>(6);
  const [stressLevel, setStressLevel] = useState<number>(3); // 1 (low) to 5 (high)
  const [brainFog, setBrainFog] = useState<string>('normal'); // 'clear' | 'normal' | 'foggy'
  const [suggestedCare, setSuggestedCare] = useState<CareType | null>(null);

  if (!isOpen) return null;

  const handleAnalyze = () => {
    // Determine suggested care type based on simple rules
    let matched = CARE_TYPES[11]; // default balanced
    if (sleepHours < 5) {
      matched = CARE_TYPES.find(c => c.id === 'sleep_disorder') || CARE_TYPES[9];
    } else if (stressLevel >= 4 && brainFog === 'foggy') {
      matched = CARE_TYPES.find(c => c.id === 'brain_fog') || CARE_TYPES[6];
    } else if (stressLevel >= 4) {
      matched = CARE_TYPES.find(c => c.id === 'burnout') || CARE_TYPES[0];
    } else if (sleepHours >= 7 && stressLevel <= 2) {
      matched = CARE_TYPES.find(c => c.id === 'balanced') || CARE_TYPES[11];
    }
    setSuggestedCare(matched);
  };

  const handleApply = () => {
    if (suggestedCare) {
      onSelectCareType(suggestedCare);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🩺</span>
            <h3 className="text-lg font-extrabold text-stone-900">오늘의 컨디션 & 뇌 피로도 체크인</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-stone-400 hover:text-stone-700 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-stone-500">
          오늘 아침 수면 시간과 스트레스 상태를 입력하시면 AI가 오늘의 최적 케어 타입을 즉시 추천해 드립니다.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center gap-1.5">
              <Moon className="w-4 h-4 text-indigo-600" />
              <span>지난밤 수면 시간: <strong className="text-indigo-600">{sleepHours}시간</strong></span>
            </label>
            <input
              type="range"
              min={3}
              max={10}
              step={0.5}
              value={sleepHours}
              onChange={e => setSleepHours(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>오늘의 스트레스/긴장도 (1: 평온 ~ 5: 극도 긴장)</span>
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map(lvl => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setStressLevel(lvl)}
                  className={`py-2 rounded-xl font-bold text-xs transition ${
                    stressLevel === lvl
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {lvl}단계
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center gap-1.5">
              <Smile className="w-4 h-4 text-emerald-600" />
              <span>두뇌 회전 상태 (Brain State)</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'clear', label: '맑고 집중 잘됨 🧠' },
                { id: 'normal', label: '보통 / 평범 😌' },
                { id: 'foggy', label: '멍하고 안개 낀 듯 ☁️' }
              ].map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setBrainFog(item.id)}
                  className={`p-2.5 rounded-xl text-xs font-semibold border transition ${
                    brainFog === item.id
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                      : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {!suggestedCare ? (
          <button
            onClick={handleAnalyze}
            className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-2xl shadow-md hover:bg-indigo-700 transition flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>맞춤 케어 타입 진단하기</span>
          </button>
        ) : (
          <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-3">
            <div className="flex items-center space-x-3">
              <span className="text-3xl p-2 bg-white rounded-xl shadow-xs">{suggestedCare.emoji}</span>
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase">AI 추천 진단 결과</span>
                <h4 className="font-extrabold text-stone-900 text-base">{suggestedCare.title}</h4>
              </div>
            </div>
            <p className="text-xs text-stone-700 leading-relaxed">{suggestedCare.solution}</p>
            <button
              onClick={handleApply}
              className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl text-xs shadow-xs hover:bg-indigo-700 transition"
            >
              이 케어 타입으로 즉시 시간표 적용하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
