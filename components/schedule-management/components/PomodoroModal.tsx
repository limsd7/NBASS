import React, { useState, useEffect } from 'react';
import { CareType, ScheduleBlock } from '../types';
import { Play, Pause, RotateCcw, X, Sparkles, CheckCircle2, Coffee } from 'lucide-react';

interface PomodoroModalProps {
  isOpen: boolean;
  onClose: () => void;
  block: ScheduleBlock | null;
  careType: CareType;
  onCompleteBlock: (id: string) => void;
}

export const PomodoroModal: React.FC<PomodoroModalProps> = ({
  isOpen,
  onClose,
  block,
  careType,
  onCompleteBlock
}) => {
  const defaultWorkMinutes = careType.pomodoroWork || 25;
  const [timeLeft, setTimeLeft] = useState<number>(defaultWorkMinutes * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isBreakMode, setIsBreakMode] = useState<boolean>(false);

  useEffect(() => {
    if (block) {
      setTimeLeft((careType.pomodoroWork || 25) * 60);
      setIsRunning(false);
      setIsBreakMode(false);
    }
  }, [block, careType]);

  useEffect(() => {
    let timer: any = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      if (!isBreakMode) {
        alert('집중 세션이 완료되었습니다! 이제 맞춤 휴식/스트레칭을 시작하세요.');
        setIsBreakMode(true);
        setTimeLeft((careType.pomodoroBreak || 10) * 60);
      } else {
        alert('휴식 시간이 종료되었습니다! 다음 세션으로 집중을 이어가세요.');
        if (block) {
          onCompleteBlock(block.id);
        }
        onClose();
      }
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, isBreakMode, block, careType, onCompleteBlock, onClose]);

  if (!isOpen || !block) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const totalDuration = isBreakMode ? (careType.pomodoroBreak || 10) * 60 : (careType.pomodoroWork || 25) * 60;
  const progressPercent = ((totalDuration - timeLeft) / totalDuration) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/70 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-6 text-center relative overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isBreakMode ? '🧘 맞춤 휴식 타임' : `🔥 뽀모도로 집중 (${careType.title})`}</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <h3 className="text-xl font-extrabold text-stone-900">{block.title}</h3>
          <p className="text-xs text-stone-500 mt-1">
            {isBreakMode ? careType.breakGuide.title : careType.solution}
          </p>
        </div>

        {/* Circular / Big Timer Display */}
        <div className="relative w-48 h-48 mx-auto flex items-center justify-center rounded-full bg-stone-50 border-8 border-stone-100 shadow-inner">
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl sm:text-5xl font-black text-stone-900 tracking-tight">{formattedTime}</span>
            <span className="text-xs font-semibold text-stone-500 mt-1">
              {isBreakMode ? '휴식 남은 시간' : '집중 남은 시간'}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${isBreakMode ? 'bg-emerald-500' : 'bg-indigo-600'}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-center space-x-4 pt-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-8 py-3.5 rounded-2xl font-bold text-white shadow-md flex items-center space-x-2 transition ${
              isRunning ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5" />
                <span>일시정지</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-white" />
                <span>타이머 시작</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              setIsRunning(false);
              setTimeLeft((isBreakMode ? (careType.pomodoroBreak || 10) : (careType.pomodoroWork || 25)) * 60);
            }}
            className="p-3.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Complete Task Early Button */}
        <div className="pt-2 border-t border-stone-100 flex justify-between items-center text-xs text-stone-500">
          <button
            onClick={() => {
              onCompleteBlock(block.id);
              onClose();
            }}
            className="text-indigo-600 font-bold hover:underline flex items-center gap-1 mx-auto"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>이 학습 블록 완료 처리하기</span>
          </button>
        </div>
      </div>
    </div>
  );
};
