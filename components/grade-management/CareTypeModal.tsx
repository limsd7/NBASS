import React from "react";
import { CARE_TYPES, CareTypeDetail, normalizeCareTypeCode } from "../../data/careTypesData";

interface CareTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCode?: string;
  onSelectCareType?: (code: string) => void;
}

export const CareTypeModal: React.FC<CareTypeModalProps> = ({
  isOpen,
  onClose,
  currentCode,
  onSelectCareType,
}) => {
  if (!isOpen) return null;
  const activeCode = normalizeCareTypeCode(currentCode);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-slate-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-md text-xl">
              🧠
            </div>
            <div>
              <h2 className="text-xl font-bold">12대 맞춤 Care Type 상세 안내</h2>
              <p className="text-xs text-blue-200 mt-0.5">
                신체 생체 데이터 및 자율신경·신경인지 검진을 기반으로 도출된 12가지 유형별 특징 및 처방
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 bg-slate-50/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CARE_TYPES.map((care: CareTypeDetail) => {
              const isSelected = care.code === activeCode;
              return (
                <div
                  key={care.code}
                  className={`p-5 rounded-2xl border transition-all ${
                    isSelected
                      ? "bg-blue-50/70 border-blue-500 shadow-md ring-2 ring-blue-500/20"
                      : "bg-white border-slate-200 hover:border-blue-200 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{care.emoji}</span>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-bold text-slate-800 text-base">{care.title}</h3>
                          {isSelected && (
                            <span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded-full">
                              현재 유형
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">{care.subtitle}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mt-3 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <strong className="text-slate-700 block mb-0.5 flex items-center gap-1">
                        <span>⚡</span> 생리적 특징 및 학업 영향
                      </strong>
                      <p className="text-slate-600 leading-relaxed">{care.physiology}</p>
                    </div>

                    <div className="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100">
                      <strong className="text-emerald-800 block mb-0.5 flex items-center gap-1">
                        <span>✓</span> 전문가 맞춤 솔루션
                      </strong>
                      <p className="text-emerald-700 leading-relaxed">{care.prescription}</p>
                    </div>
                  </div>

                  {onSelectCareType && (
                    <button
                      onClick={() => onSelectCareType(care.code)}
                      className={`mt-3 w-full py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600"
                      }`}
                    >
                      {isSelected ? "선택됨" : "이 유형으로 변경"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-white flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
