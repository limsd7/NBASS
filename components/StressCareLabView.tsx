import React, { useState, useEffect } from 'react';
import { CareType, StudentInfo } from '../types';
import { CARE_TYPE_STRESS_ADVICE, SUBJECT_STRESS_ADVICE, getCombinedStressAdvice, SOS_SITUATIONS } from '../data/stressCareData';
import { CARE_TYPE_LABELS } from '../logicEngine';
import { BreathingCore } from './BreathingGuide';

const SUBJECT_LABELS: Record<string, string> = {
  'korean': '국어',
  'math': '수학',
  'english': '영어',
  'science': '과학탐구',
  'social': '사회탐구'
};

interface StressCareLabViewProps {
  student?: StudentInfo;
  history?: any[];
}

export const StressCareLabView: React.FC<StressCareLabViewProps> = ({ student, history }) => {
  const [selectedCareType, setSelectedCareType] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedSOS, setSelectedSOS] = useState<string>('');

  // 컴포넌트 마운트 시 최근 진단 결과 자동 로드
  useEffect(() => {
    if (history && history.length > 0) {
      // Find the most recent record with a classification result
      const sortedHistory = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const latestRecord = sortedHistory.find(r => r.classificationResult?.primary);
      
      if (latestRecord && latestRecord.classificationResult?.primary) {
        setSelectedCareType(latestRecord.classificationResult.primary);
      }
    }
  }, [history]);

  const careAdvice = selectedCareType ? CARE_TYPE_STRESS_ADVICE[selectedCareType] : null;
  const subjectAdvice = selectedSubject ? SUBJECT_STRESS_ADVICE[selectedSubject] : null;
  const combinedAdvice = (selectedCareType && selectedSubject) 
    ? getCombinedStressAdvice(selectedCareType, selectedSubject) 
    : [];
  const sosAdvice = selectedSOS ? SOS_SITUATIONS[selectedSOS] : null;

  const handlePrint = () => {
    window.print();
  };

  const isBreathingNeeded = [CareType.ANXIETY_TENSION, CareType.STRESS_OVERLOAD, CareType.HYPERSENSITIVE, CareType.BURNOUT].includes(selectedCareType as CareType);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Print Specific Styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #prescription-area, #prescription-area * { visibility: visible; }
          #prescription-area { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 20px; box-shadow: none; border: none; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <span className="text-4xl">💡</span> 솔루션 연구소 (Stress Care Lab)
          </h1>
          <p className="text-slate-500 mt-2 text-lg">진단 결과와 수능 과목을 선택하여 나에게 딱 맞는 멘탈 관리법을 확인하세요.</p>
        </div>
        <button 
          onClick={handlePrint}
          className="px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 no-print"
        >
          <span className="text-xl">🖨️</span> 내 처방전 인쇄하기
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Panel: Selectors */}
        <div className="lg:col-span-1 space-y-6 no-print">
          
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span>🩺</span> 1. 나의 진단 상태 선택
            </h2>
            <select 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
              value={selectedCareType}
              onChange={(e) => { setSelectedCareType(e.target.value); setSelectedSOS(''); }}
            >
              <option value="">-- 진단 유형을 선택하세요 --</option>
              {Object.entries(CARE_TYPE_LABELS)
                .filter(([key]) => key !== CareType.UNASSESSED && key !== CareType.CONCENTRATION)
                .map(([key, labelData]) => (
                <option key={key} value={key}>{labelData.name}</option>
              ))}
            </select>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span>📚</span> 2. 공부할 과목 선택
            </h2>
            <div className="flex flex-wrap gap-2">
              {Object.entries(SUBJECT_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => { setSelectedSubject(key); setSelectedSOS(''); }}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    selectedSubject === key 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-rose-50 p-6 rounded-3xl shadow-sm border border-rose-200">
            <h2 className="text-lg font-bold text-rose-800 mb-4 flex items-center gap-2">
              <span>🚨</span> 3. SOS 응급 상황 (선택)
            </h2>
            <select 
              className="w-full p-3 bg-white border border-rose-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition-shadow text-rose-800 font-medium"
              value={selectedSOS}
              onChange={(e) => { 
                setSelectedSOS(e.target.value); 
                if(e.target.value) {
                  setSelectedSubject('');
                }
              }}
            >
              <option value="">-- 긴급 상황을 선택하세요 --</option>
              {Object.entries(SOS_SITUATIONS).map(([key, data]) => (
                <option key={key} value={key}>{data.title.replace('🚨 ', '')}</option>
              ))}
            </select>
            {selectedSOS && <p className="text-xs text-rose-500 mt-3">※ 응급 상황 선택 시 기존 과목 솔루션 대신 응급 처치법이 표시됩니다.</p>}
          </div>
          
        </div>

        {/* Right Panel: Report */}
        <div className="lg:col-span-2 space-y-6">
          {(!careAdvice && !subjectAdvice && !sosAdvice) ? (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50 text-slate-400">
              <span className="text-6xl mb-4 opacity-20">🧪</span>
              <p className="text-lg font-medium">나만의 맞춤 솔루션을 배합 중입니다...</p>
              <p className="text-sm">좌측에서 유형과 과목을 선택해 주세요.</p>
            </div>
          ) : (
            <div id="prescription-area" className="space-y-6 bg-slate-50/30 p-2 md:p-6 rounded-3xl">
              
              {/* Prescription Header (Visible on print) */}
              <div className="hidden print:block mb-8 text-center border-b-2 border-slate-800 pb-6">
                <h2 className="text-3xl font-black tracking-widest text-slate-800">MENTAL PRESCRIPTION</h2>
                <p className="text-slate-500 font-bold mt-2">나만의 맞춤 멘탈 케어 처방전</p>
                <div className="mt-4 flex justify-between text-sm font-bold text-slate-600 bg-slate-100 p-3 rounded-lg">
                  <span>Name: {student?.name || '학생'}</span>
                  <span>Date: {new Date().toLocaleDateString()}</span>
                  <span>Primary Care: {selectedCareType ? CARE_TYPE_LABELS[selectedCareType as CareType]?.name : '-'}</span>
                </div>
              </div>

              {/* SOS Advice */}
              {sosAdvice && (
                <div className="bg-rose-500 p-6 md:p-8 rounded-3xl shadow-lg border border-rose-600 text-white animate-in zoom-in-95 duration-300">
                  <h3 className="text-2xl font-black mb-4 flex items-center gap-2">
                    <span className="bg-white text-rose-600 p-2 rounded-lg text-sm shadow-sm">응급 처방</span>
                    {sosAdvice.title}
                  </h3>
                  <ul className="space-y-4">
                    {sosAdvice.advice.map((text, idx) => (
                      <li key={idx} className="flex gap-3 font-medium text-lg">
                        <span className="text-rose-200 mt-1">✓</span>
                        <span className="leading-relaxed">{text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Care Type Advice */}
              {!selectedSOS && careAdvice && (
                <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border-t-4 border-indigo-500 relative overflow-hidden">
                  <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2 relative z-10">
                    <span className="bg-indigo-100 text-indigo-600 p-2 rounded-lg text-sm">신체/심리 솔루션</span>
                    {careAdvice.title}
                  </h3>
                  <ul className="space-y-3 relative z-10">
                    {careAdvice.advice.map((text, idx) => (
                      <li key={idx} className="flex gap-3 text-slate-700">
                        <span className="text-indigo-500 mt-1">✓</span>
                        <span className="leading-relaxed">{text}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Breathing Guide Embed for Anxiety/Burnout Types */}
                  {isBreathingNeeded && (
                    <div className="mt-8 pt-6 border-t border-slate-100 no-print">
                      <p className="text-sm font-bold text-slate-400 mb-4">현재 상태에 도움이 되는 호흡 가이드</p>
                      <div className="bg-slate-50 rounded-2xl p-4 flex justify-center scale-90 origin-top">
                        <BreathingCore />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Subject Advice */}
              {!selectedSOS && subjectAdvice && (
                <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border-t-4 border-blue-500">
                  <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-600 p-2 rounded-lg text-sm">과목 멘탈 관리</span>
                    {subjectAdvice.title}
                  </h3>
                  <ul className="space-y-3">
                    {subjectAdvice.advice.map((text, idx) => (
                      <li key={idx} className="flex gap-3 text-slate-700">
                        <span className="text-blue-500 mt-1">✓</span>
                        <span className="leading-relaxed">{text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Combined Synergy Advice */}
              {(!selectedSOS && selectedCareType && selectedSubject && combinedAdvice.length > 0) && (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 md:p-8 rounded-3xl shadow-sm border border-orange-200 relative overflow-hidden print:border-2 print:border-orange-400">
                  <div className="absolute top-0 right-0 p-4 opacity-10 text-8xl pointer-events-none">🔥</div>
                  <h3 className="text-xl font-black text-orange-800 mb-4 flex items-center gap-2">
                    <span className="bg-orange-500 text-white p-2 rounded-lg text-sm shadow-sm print:bg-orange-100 print:text-orange-800">특급 결합 솔루션</span>
                    시너지 멘탈 케어
                  </h3>
                  <div className="space-y-4 relative z-10">
                    {combinedAdvice.map((text, idx) => (
                      <div key={idx} className="bg-white/60 print:bg-white backdrop-blur-sm p-4 rounded-2xl border border-orange-100 text-slate-800 font-medium leading-relaxed">
                        {text}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
