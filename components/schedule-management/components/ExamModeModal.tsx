import React, { useState, useEffect } from 'react';
import { ExamModeItem, ExamStrategyStep } from '../types';
import { X, Plus, Trash2, Sparkles, Calendar, Award, Check, Clock, BookOpen, Shield } from 'lucide-react';

interface ExamModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (mode: ExamModeItem) => void;
  editingMode?: ExamModeItem | null;
}

const EMOJI_OPTIONS = [
  '🎯', '📚', '📝', '🔥', '🏆', '⚡', '🎓', '💡',
  '🛡️', '🚀', '🌟', '⏱️', '📊', '🔬', '🧩', '✍️',
  '📖', '🧠', '🌿', '💯'
];

const PRESET_STRATEGY_BADGES = [
  '타임어택 훈련',
  '교과서 백지복습',
  '기출 변형 정복',
  '오답 노트 단권화',
  '서술형 만점 대비',
  '수능 생체리듬',
  '개념 3회독 마스터',
  '고난도 킬러 문항',
  '실전 모의평가'
];

const THEME_COLORS = [
  { key: 'indigo', label: '인디고', bgClass: 'bg-indigo-500', textClass: 'text-indigo-600', ringClass: 'ring-indigo-400' },
  { key: 'amber', label: '앰버/오렌지', bgClass: 'bg-amber-500', textClass: 'text-amber-600', ringClass: 'ring-amber-400' },
  { key: 'purple', label: '퍼플/바이올렛', bgClass: 'bg-purple-500', textClass: 'text-purple-600', ringClass: 'ring-purple-400' },
  { key: 'blue', label: '스카이블루', bgClass: 'bg-blue-500', textClass: 'text-blue-600', ringClass: 'ring-blue-400' },
  { key: 'rose', label: '로즈/레드', bgClass: 'bg-rose-500', textClass: 'text-rose-600', ringClass: 'ring-rose-400' },
  { key: 'emerald', label: '에메랄드/그린', bgClass: 'bg-emerald-500', textClass: 'text-emerald-600', ringClass: 'ring-emerald-400' }
];

export const ExamModeModal: React.FC<ExamModeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingMode
}) => {
  const [name, setName] = useState('');
  const [iconEmoji, setIconEmoji] = useState('🎯');
  const [description, setDescription] = useState('');
  const [strategyBadge, setStrategyBadge] = useState('타임어택 훈련');
  const [solutionDetail, setSolutionDetail] = useState('');
  const [examDate, setExamDate] = useState('');
  const [themeColor, setThemeColor] = useState('indigo');
  const [step1Title, setStep1Title] = useState('');
  const [step1Desc, setStep1Desc] = useState('');
  const [step2Title, setStep2Title] = useState('');
  const [step2Desc, setStep2Desc] = useState('');

  useEffect(() => {
    if (editingMode) {
      setName(editingMode.name || '');
      setIconEmoji(editingMode.iconEmoji || '🎯');
      setDescription(editingMode.description || '');
      setStrategyBadge(editingMode.strategyBadge || '타임어택 훈련');
      setSolutionDetail(editingMode.solutionDetail || '');
      setExamDate(editingMode.examDate || '');
      setThemeColor(editingMode.themeColor || 'indigo');
      setStep1Title(editingMode.steps?.[0]?.title || '');
      setStep1Desc(editingMode.steps?.[0]?.desc || '');
      setStep2Title(editingMode.steps?.[1]?.title || '');
      setStep2Desc(editingMode.steps?.[1]?.desc || '');
    } else {
      // Defaults for new mode
      setName('');
      setIconEmoji('📝');
      setDescription('단원별 핵심 개념 및 기출 문제 집중 훈련');
      setStrategyBadge('기출 변형 정복');
      setSolutionDetail('시험 전 취약한 단원을 우선 정리하고 실전 문제풀이 감각을 극대화합니다.');
      setExamDate('');
      setThemeColor('indigo');
      setStep1Title('1단계: 핵심 개념 및 오답 단권화');
      setStep1Desc('틀린 문제와 필수 공식을 한 권에 모아 빠르게 복습할 수 있도록 정리');
      setStep2Title('2단계: 실전 타임어택 풀이');
      setStep2Desc('실제 시험 시간에 맞추어 타이머를 켜고 긴장감 속에서 집중 풀이');
    }
  }, [editingMode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('시험 모드 이름을 입력해주세요.');
      return;
    }

    const steps: ExamStrategyStep[] = [];
    if (step1Title.trim()) {
      steps.push({
        title: step1Title.trim(),
        desc: step1Desc.trim() || '핵심 학습 목표 실천',
        iconType: 'clock'
      });
    }
    if (step2Title.trim()) {
      steps.push({
        title: step2Title.trim(),
        desc: step2Desc.trim() || '실전 복습 및 점검',
        iconType: 'check'
      });
    }

    const newMode: ExamModeItem = {
      id: editingMode?.id || `custom-exam-${Date.now()}`,
      name: name.trim(),
      iconEmoji,
      description: description.trim() || `${name} 맞춤 집중 대비`,
      strategyBadge: strategyBadge.trim() || '맞춤 전략',
      solutionDetail: solutionDetail.trim() || `${name} 목표 달성을 위한 특별 집중 훈련과 컨디션 관리 솔루션`,
      steps: steps.length > 0 ? steps : [
        { title: '1단계: 집중 복습', desc: '핵심 개념 및 공식 리콜', iconType: 'book' },
        { title: '2단계: 오답 분석', desc: '틀린 문제 원인 분석 및 재풀이', iconType: 'check' }
      ],
      examName: name.trim(),
      examDate: examDate || '',
      isCustom: true,
      themeColor
    };

    onSave(newMode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-stone-200 my-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 text-xl font-bold">
              {iconEmoji}
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-stone-900">
                {editingMode ? '시험 모드 수정' : '새 시험 모드 추가'}
              </h3>
              <p className="text-xs text-stone-500">
                원하는 시험 일정과 맞춤 학습 전략을 자유롭게 등록할 수 있습니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name and Emoji */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-stone-700 mb-1">
                시험 모드 명칭 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="예: 1학기 중간고사, 9월 모의평가, 토익 850+, 한국사"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">아이콘 선택</label>
              <div className="relative">
                <select
                  value={iconEmoji}
                  onChange={e => setIconEmoji(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-base bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  {EMOJI_OPTIONS.map(em => (
                    <option key={em} value={em}>{em}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Quick Emoji Bar */}
          <div>
            <div className="text-[11px] font-semibold text-stone-500 mb-1.5">추천 아이콘 빠른 선택</div>
            <div className="flex flex-wrap gap-1.5">
              {EMOJI_OPTIONS.slice(0, 10).map(em => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setIconEmoji(em)}
                  className={`w-8 h-8 rounded-lg text-sm flex items-center justify-center transition border ${
                    iconEmoji === em
                      ? 'bg-indigo-100 border-indigo-400 ring-2 ring-indigo-300'
                      : 'bg-stone-50 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          {/* Strategy Tag & D-Day Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">전략 태그</label>
              <input
                type="text"
                value={strategyBadge}
                onChange={e => setStrategyBadge(e.target.value)}
                placeholder="예: 타임어택 훈련, 백지복습, 기출 변형"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-semibold"
              />
              <div className="flex flex-wrap gap-1 mt-1.5">
                {PRESET_STRATEGY_BADGES.slice(0, 4).map(b => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setStrategyBadge(b)}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 hover:bg-stone-200 font-medium"
                  >
                    +{b}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                시험 D-Day 날짜 (선택)
              </label>
              <input
                type="date"
                value={examDate}
                onChange={e => setExamDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-semibold"
              />
              <p className="text-[11px] text-stone-500 mt-1">
                설정 시 대시보드와 시간표에 D-Day 카운트다운이 표시됩니다.
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">모드 핵심 설명</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="예: 취약 과목 기출 문제 3개년 회독 및 오답 단권화 정리"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm"
            />
          </div>

          {/* Detailed Solution / Psychological Tip */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              상세 맞춤 솔루션 및 마인드셋 팁
            </label>
            <textarea
              rows={2}
              value={solutionDetail}
              onChange={e => setSolutionDetail(e.target.value)}
              placeholder="예: 긴장으로 인한 실수를 줄이기 위해 매 세트 시작 전 3번의 심호흡을 실시하고 문제를 끝까지 정독합니다."
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs leading-relaxed"
            />
          </div>

          {/* Step 1 & Step 2 Strategy Guidance */}
          <div className="space-y-2 pt-2 border-t border-stone-100">
            <div className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-indigo-600" />
              <span>실행 2단계 집중 가이드 설정 (선택)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1.5">
                <div className="text-[11px] font-bold text-indigo-700">1단계 가이드</div>
                <input
                  type="text"
                  placeholder="제목 (예: 1단계: 교과서 단권화)"
                  value={step1Title}
                  onChange={e => setStep1Title(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs font-semibold"
                />
                <input
                  type="text"
                  placeholder="내용 (예: 필기와 프린트를 교과서에 모으기)"
                  value={step1Desc}
                  onChange={e => setStep1Desc(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-[11px]"
                />
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1.5">
                <div className="text-[11px] font-bold text-emerald-700">2단계 가이드</div>
                <input
                  type="text"
                  placeholder="제목 (예: 2단계: 백지 복습)"
                  value={step2Title}
                  onChange={e => setStep2Title(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs font-semibold"
                />
                <input
                  type="text"
                  placeholder="내용 (예: 빈 종이에 핵심 공식 스스로 적기)"
                  value={step2Desc}
                  onChange={e => setStep2Desc(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-[11px]"
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-stone-300 text-xs font-bold text-stone-700 hover:bg-stone-50 transition"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-sm transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{editingMode ? '변경사항 저장하기' : '시험 모드 생성하기'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
