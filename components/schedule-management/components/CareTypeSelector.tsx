import React, { useState } from 'react';
import { CareType } from '../types';
import { CARE_TYPES } from '../data/careTypes';
import { X, CheckCircle, Zap, Shield, Heart } from 'lucide-react';

interface CareTypeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  currentCareType: CareType;
  onSelectCareType: (care: CareType) => void;
}

export const CareTypeSelector: React.FC<CareTypeSelectorProps> = ({
  isOpen,
  onClose,
  currentCareType,
  onSelectCareType
}) => {
  const [selected, setSelected] = useState<CareType>(currentCareType);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: '전체 케어 타입' },
    { id: 'burnout', label: '번아웃·의욕' },
    { id: 'anxiety', label: '불안·긴장' },
    { id: 'fatigue', label: '피로·체력' },
    { id: 'focus', label: '집중·산만' },
    { id: 'sleep', label: '수면·부신' },
    { id: 'balanced', label: '균형·최상' },
  ];

  const filteredTypes = activeCategory === 'all'
    ? CARE_TYPES
    : CARE_TYPES.filter(c => c.category === activeCategory);

  const handleApply = () => {
    onSelectCareType(selected);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-stone-200">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between bg-stone-50">
          <div>
            <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
              <Heart className="w-5 h-5 text-indigo-600 fill-indigo-100" />
              <span>나의 케어 타입 진단 및 선택</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">현재 나의 생리적 상태와 뇌 피로도에 맞는 최적의 학습 솔루션을 선택하세요.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filter */}
        <div className="px-6 py-3 border-b border-stone-100 flex gap-2 overflow-x-auto bg-stone-50/50">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                activeCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Care Types Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
          {filteredTypes.map(care => {
            const isSelected = selected.id === care.id;
            return (
              <div
                key={care.id}
                onClick={() => setSelected(care)}
                className={`p-4 rounded-xl border-2 transition cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/40 shadow-sm'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl p-2 bg-stone-100 rounded-xl">{care.emoji}</span>
                      <div>
                        <h3 className="font-bold text-stone-900 text-base">{care.title}</h3>
                        <p className="text-xs text-indigo-700 font-medium">{care.subtitle}</p>
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle className="w-6 h-6 text-indigo-600 fill-indigo-100" />
                    )}
                  </div>

                  <div className="mt-3 space-y-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-100 text-stone-700">
                      <span className="font-semibold text-stone-900 block mb-0.5">⚡ 생리적 특징 및 영향</span>
                      {care.traits}
                    </div>
                    <div className="p-2.5 rounded-lg bg-indigo-50/50 border border-indigo-100 text-indigo-900">
                      <span className="font-semibold text-indigo-950 block mb-0.5">✓ 전문가 맞춤 솔루션</span>
                      {care.solution}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                  <span className="flex items-center gap-1 font-medium">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    뽀모도로: 집중 {care.pomodoroWork}분 / 휴식 {care.pomodoroBreak}분
                  </span>
                  <span className="text-stone-400">쉬는 시간 가이드 제공</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
          <div className="text-xs text-stone-500">
            선택된 케어 타입은 시간표 생성 및 AI 학습 코칭에 실시간 반영됩니다.
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 text-sm font-medium hover:bg-stone-100 transition"
            >
              취소
            </button>
            <button
              onClick={handleApply}
              className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 shadow-sm transition"
            >
              이 케어 타입으로 적용하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
