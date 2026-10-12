import React, { useState } from 'react';
import { AssessmentResult } from '../../../types';

interface PrescriptionTasteCardProps {
  result: AssessmentResult;
  onOpenUpgrade: (reason: string) => void;
}

export const PrescriptionTasteCard: React.FC<PrescriptionTasteCardProps> = ({
  result,
  onOpenUpgrade,
}) => {
  const [isChecked1, setIsChecked1] = useState(false);
  const [isChecked2, setIsChecked2] = useState(false);

  const studentName = result.student?.name || '학생';
  const weakSubjectName = result.student?.weakSubject === 'math'
    ? '수학'
    : result.student?.weakSubject === 'korean'
    ? '국어'
    : result.student?.weakSubject === 'english'
    ? '영어'
    : '취약 과목';

  return (
    <div className="relative rounded-3xl p-6 md:p-8 bg-slate-900 border-2 border-indigo-500/30 shadow-2xl text-white overflow-hidden space-y-6">
      {/* Background visual highlight */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-black flex items-center gap-1.5">
            <span>🔓</span>
            <span>100% 무료 즉시 공개</span>
          </span>
          <span className="text-xs text-indigo-300 font-bold">
            {studentName} 님 맞춤 초정밀 1호 두뇌 처방
          </span>
        </div>
        <span className="text-[11px] text-slate-400 font-medium">
          Aha-Moment: 오늘 밤 당장 실천 가능한 1분 가이드
        </span>
      </div>

      {/* 1호 무료 처방 핵심 본문 */}
      <div className="space-y-3">
        <h3 className="text-xl md:text-2xl font-black text-white tracking-tight leading-snug">
          오늘 밤 바로 실천할 수 있는{' '}
          <span className="text-emerald-400">골든타임 수면 &amp; {weakSubjectName} 집중 처방</span>
        </h3>
        <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-normal">
          전체 14P 심층 솔루션 중, 오늘 당장 효과를 체감할 수 있는 <strong>가장 핵심적인 1단계 생활 습관 처방</strong>을 무료로 먼저 공개해 드립니다.
        </p>

        {/* 2가지 액션 체크리스트 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {/* Action 1: 90분 서카디안 취침 */}
          <div
            onClick={() => setIsChecked1(!isChecked1)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer select-none ${
              isChecked1
                ? 'bg-emerald-950/40 border-emerald-500/50 shadow-lg shadow-emerald-950/30'
                : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={isChecked1}
                onChange={() => setIsChecked1(!isChecked1)}
                className="w-4 h-4 mt-0.5 rounded text-emerald-500 focus:ring-0 cursor-pointer"
              />
              <div className="space-y-1">
                <div className="text-xs font-black text-white flex items-center gap-1.5">
                  <span>🌙</span>
                  <span>오늘 밤 권장 취침 시각: [밤 11시 45분]</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  90분 수면 사이클 5회 역산 시 내일 아침 07:15 기상할 때 렘수면(REM) 단계에서 개운하게 기상하여 전두엽 피로가 95% 회복됩니다.
                </p>
                {isChecked1 && (
                  <span className="inline-block text-[10px] text-emerald-400 font-bold mt-1">
                    ✓ 오늘 밤 실천 예약 완료!
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action 2: 취약과목 시작 전 1분 루틴 */}
          <div
            onClick={() => setIsChecked2(!isChecked2)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer select-none ${
              isChecked2
                ? 'bg-emerald-950/40 border-emerald-500/50 shadow-lg shadow-emerald-950/30'
                : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={isChecked2}
                onChange={() => setIsChecked2(!isChecked2)}
                className="w-4 h-4 mt-0.5 rounded text-emerald-500 focus:ring-0 cursor-pointer"
              />
              <div className="space-y-1">
                <div className="text-xs font-black text-white flex items-center gap-1.5">
                  <span>🎯</span>
                  <span>{weakSubjectName} 시작 전 4-7-8 이완 호흡법</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  문제집을 펴기 직전 4초 들이마시고 7초 멈추고 8초 길게 내쉬는 호흡을 3회 반복하세요. 편도체 불안을 진정시켜 오답률을 30% 낮춥니다.
                </p>
                {isChecked2 && (
                  <span className="inline-block text-[10px] text-emerald-400 font-bold mt-1">
                    ✓ 공부 전 1분 호흡 실천 체크 완료!
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Curiosity Gap: 14P 리포트북에 잠겨있는 5대 핵심 솔루션 리스트 */}
      <div className="p-5 bg-gradient-to-br from-indigo-950/60 to-slate-950 border border-indigo-500/30 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-black text-amber-300 flex items-center gap-1.5">
            <span>🔒</span>
            <span>14P 심층 솔루션 리포트북에 독점 수록된 5대 핵심 시스템 (잠김)</span>
          </div>
          <span className="text-[10px] bg-indigo-500/20 text-indigo-200 px-2.5 py-0.5 rounded-full font-bold border border-indigo-500/30">
            단건 ₩24,900 / 정기결제 포함
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-500">🔒</span>
            <span className="text-[11px] leading-tight">
              <strong>[7P]</strong> 전 과목 수능 실전 뽀모도로 시간표 &amp; 오후 졸림 퇴치법
            </span>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-500">🔒</span>
            <span className="text-[11px] leading-tight">
              <strong>[9P]</strong> 3-Tier 신경인지 맞춤 영양제 복용 가이드 (각성 vs 이완)
            </span>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-500">🔒</span>
            <span className="text-[11px] leading-tight">
              <strong>[11P]</strong> 수능 D-Day 멘탈 마인드셋 &amp; 미주신경 긴급 안정 루틴
            </span>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-500">🔒</span>
            <span className="text-[11px] leading-tight">
              <strong>[13P]</strong> 목표 대학 실전 합격 시뮬레이션 &amp; 성적 향상 추이
            </span>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 pt-1 leading-relaxed">
          💡 맛보기 1호 처방만으로도 이번 주 집중력이 살아납니다. 전체 14P 심층 솔루션으로 상위 1%의 공부 효율을 완성하세요.
        </p>

        <button
          onClick={() => onOpenUpgrade('14P 초정밀 신경인지 솔루션 리포트북 전체 잠금 해제')}
          className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs md:text-sm rounded-xl transition-all shadow-lg shadow-indigo-900/40 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
        >
          <span>✨</span>
          <span>14P 심층 솔루션 전체 잠금 해제하기 (₩24,900 / 정기결제 ₩19,900)</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
};
