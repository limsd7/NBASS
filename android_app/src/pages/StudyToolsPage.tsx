import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { hasRequiredTier } from '../services/featureGate';
import { LockedCard } from '../components/tiered-features/LockedCard';
import { Play, Pause, RotateCcw, Clock, Sparkles, BookOpen, CheckCircle, AlertCircle } from 'lucide-react';

interface StudyToolsPageProps {
  user: UserProfile;
  onUpgradeClick: () => void;
}

export const StudyToolsPage: React.FC<StudyToolsPageProps> = ({ user, onUpgradeClick }) => {
  const isProOrAbove = hasRequiredTier(user.tier, 'pro');
  const isPremiumPlusOrAbove = hasRequiredTier(user.tier, 'premium_plus');

  // 뽀모도로 타이머 상태 (25분 = 1500초)
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<'study' | 'break'>('study');

  useEffect(() => {
    let timer: any = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      if (mode === 'study') {
        alert('🎉 25분 몰입 완료! 5분간 뇌를 쉬어주세요 (가벼운 스트레칭 추천).');
        setMode('break');
        setTimeLeft(5 * 60);
      } else {
        alert('☕ 5분 휴식 종료! 다시 집중을 시작해볼까요?');
        setMode('study');
        setTimeLeft(25 * 60);
      }
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, mode]);

  const toggleTimer = () => setIsRunning(!isRunning);
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(mode === 'study' ? 25 * 60 : 5 * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="p-4 space-y-4 pb-20 max-w-md mx-auto">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 mb-1 text-xs font-bold text-indigo-600">
          <BookOpen className="w-4 h-4" />
          <span>두뇌 몰입 &amp; 학습 관리</span>
        </div>
        <h2 className="text-xl font-black text-slate-900">학습 도구 스위트</h2>
        <p className="text-xs text-slate-500 mt-1">
          수험생의 전두엽 집중 리듬을 극대화하는 시간표와 타이머 솔루션입니다.
        </p>
      </div>

      {/* 1. 뽀모도로 몰입 타이머 (PREMIUM PLUS 이상 사용 가능) */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-rose-500" />
            <span>25분 초집중 뽀모도로 타이머</span>
          </h3>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700">
            PLUS+ 전용
          </span>
        </div>

        {isPremiumPlusOrAbove ? (
          <div className="text-center py-4 bg-slate-900 text-white rounded-2xl shadow-inner my-2">
            <div className="text-5xl font-black tracking-widest font-mono mb-4 text-emerald-400">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={toggleTimer}
                className={`px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition active:scale-95 ${
                  isRunning ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500 text-white'
                }`}
              >
                {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isRunning ? '일시정지' : '집중 시작'}</span>
              </button>
              <button
                onClick={resetTimer}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 transition active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-3">
              💡 25분 집중 후 5분간 짧은 호흡과 수분 섭취로 아데노신을 배출하세요.
            </p>
          </div>
        ) : (
          <LockedCard
            requiredTier="premium_plus"
            featureTitle="뽀모도로 몰입 타이머 잠금"
            description="전두엽 피로도를 실시간 제어하는 뽀모도로 타이머는 PREMIUM PLUS (PLUS+) 등급부터 이용하실 수 있습니다."
            onUpgradeClick={onUpgradeClick}
          />
        )}
      </div>

      {/* 2. 24시간 원형 생체 시간표 가이드 (PREMIUM PLUS 이상) */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>스마트 케어 스케줄 (24시간 서큘러 시간표)</span>
          </h3>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700">
            PLUS+ 전용
          </span>
        </div>

        {isPremiumPlusOrAbove ? (
          <div className="space-y-2.5 text-xs">
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2.5">
              <span className="text-base">☕</span>
              <div>
                <p className="font-black text-amber-900">07:00 ~ 08:30 | 각성 골든아워</p>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  기상 직후 햇빛 쬐기 &amp; <strong>HL 커피 부스터 500ml 음용</strong>으로 뇌혈류를 확장하고 잠을 깨웁니다.
                </p>
              </div>
            </div>

            <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200 flex items-start gap-2.5">
              <span className="text-base">🧠</span>
              <div>
                <p className="font-black text-indigo-900">09:00 ~ 12:00 | 초고도 몰입 타임</p>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  수학/추론 등 가장 뇌 에너지를 많이 소모하는 고난도 과목을 집중 학습합니다.
                </p>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start gap-2.5">
              <span className="text-base">💤</span>
              <div>
                <p className="font-black text-emerald-900">13:30 ~ 14:00 | 커피 냅(Coffee Nap)</p>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  식후 식곤증 타이밍에 20분 짧은 수면으로 오후 전두엽 활력을 100% 회복합니다.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <LockedCard
            requiredTier="premium_plus"
            featureTitle="스마트 케어 스케줄 관리 잠금"
            description="서큘러 24시간 생체 시간표와 골든아워 플래너는 PREMIUM PLUS (PLUS+) 등급부터 제공됩니다."
            onUpgradeClick={onUpgradeClick}
          />
        )}
      </div>

      {/* 3. AI 오답노트 & 성적 시뮬레이션 (PREMIUM+ 이상) */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5 mb-2">
          <BookOpen className="w-4 h-4 text-purple-600" />
          <span>AI 심층 오답 원인 분석 &amp; 처방</span>
        </h3>
        {isPremiumPlusOrAbove ? (
          <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 text-xs text-purple-950">
            <p className="font-bold mb-1">✨ 최근 취약 단원 분석 (수학II - 미분계수)</p>
            <p className="text-slate-600 text-[11px]">
              단순 계산 실수가 아닌, 25분 초과 시점의 인지 피로도로 인한 문제 조건 오독 패턴이 감지되었습니다. 풀이 순서를 1번으로 조정하세요.
            </p>
          </div>
        ) : (
          <LockedCard
            requiredTier="premium_plus"
            featureTitle="AI 오답 정밀 처방 잠금"
            description="인지 피로도와 연계된 오답 원인 진단 및 성적 시뮬레이터는 PREMIUM+ 등급 전용입니다."
            onUpgradeClick={onUpgradeClick}
          />
        )}
      </div>
    </div>
  );
};
