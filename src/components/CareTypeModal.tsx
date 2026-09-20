import React, { useState } from "react";
import { StudentProfile } from "../types";
import { CARE_TYPES, CareTypeDetail } from "../data/careTypesData";
import { Activity, X, Sparkles, CheckCircle, ShieldAlert, HeartPulse, Brain, Zap } from "lucide-react";

interface CareTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
  setProfile: React.Dispatch<React.SetStateAction<StudentProfile>>;
}

export function CareTypeModal({ isOpen, onClose, profile, setProfile }: CareTypeModalProps) {
  const [selectedCode, setSelectedCode] = useState<string>(profile.careType || "BRAIN_FATIGUE");
  const [activeTab, setActiveTab] = useState<"all" | "selected">("all");

  if (!isOpen) return null;

  const currentCare = CARE_TYPES.find((c) => c.code === selectedCode) || CARE_TYPES[6];

  const handleSave = () => {
    setProfile((prev) => ({
      ...prev,
      careType: selectedCode as any,
    }));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-white/90 backdrop-blur-2xl rounded-3xl max-w-4xl w-full p-6 md:p-8 shadow-2xl border border-white/60 max-h-[90vh] flex flex-col my-auto animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex justify-between items-start pb-4 border-b border-slate-200/80">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-2xl bg-blue-500/10 text-blue-700 border border-blue-500/20">
                <Brain className="w-5 h-5" />
              </span>
              <h3 className="text-xl font-bold text-slate-800">12대 바이오/뇌파 Care Type 진단 및 처방</h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              현재 나의 신체적·자율신경·뇌파 상태를 진단하고, 성적 향상과 학습 효율을 극대화하는 맞춤형 컨디셔닝 솔루션을 확인하세요.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Selected Banner */}
        <div className="my-5 p-5 rounded-2xl bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white shadow-lg space-y-3 relative overflow-hidden">
          <div className="absolute right-2 bottom-2 opacity-10">
            <Activity className="w-48 h-48" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{currentCare.emoji}</span>
                <span className="text-lg font-bold">{currentCare.title}</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/30 text-blue-200 border border-blue-400/30">
                  현재 설정된 Care Type
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-1 font-medium">{currentCare.subtitle}</p>
            </div>
            <button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2.5 rounded-2xl text-xs shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>이 Care Type으로 적용하기</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs relative z-10">
            <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/10">
              <span className="font-bold text-amber-300 block mb-1">🔍 학업 영향 분석</span>
              <p className="text-slate-100">{currentCare.studyImpact}</p>
            </div>
            <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/10">
              <span className="font-bold text-emerald-300 block mb-1">💡 맞춤형 학습 처방</span>
              <p className="text-slate-100">{currentCare.prescription}</p>
            </div>
          </div>
        </div>

        {/* Grid of 12 Types */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
            12대 Care Type 전체 목록 (클릭하여 상세 확인 및 선택)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {CARE_TYPES.map((type) => {
              const isSelected = selectedCode === type.code;
              return (
                <div
                  key={type.code}
                  onClick={() => setSelectedCode(type.code)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "bg-blue-50/80 border-blue-500 shadow-md ring-2 ring-blue-500/20"
                      : "bg-white/60 hover:bg-white border-slate-200/80 shadow-xs"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">{type.emoji}</span>
                        <h5 className="font-bold text-slate-800 text-sm">{type.title}</h5>
                      </div>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                          ✓
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-medium text-slate-600 mb-2">{type.subtitle}</p>
                  </div>
                  <div className="text-[10px] text-slate-500 border-t border-slate-100 pt-2 line-clamp-2">
                    {type.prescription}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 mt-4 border-t border-slate-200/80 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl text-xs font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer transition-colors"
          >
            닫기
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-2xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 cursor-pointer transition-all"
          >
            선택한 Care Type 저장
          </button>
        </div>
      </div>
    </div>
  );
}
