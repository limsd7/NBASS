import React, { useState } from 'react';
import { CareType } from '../types';
import { CARE_TYPES } from '../data/careTypes';
import {
  BookOpen,
  X,
  Sparkles,
  Brain,
  Calendar,
  ShieldAlert,
  Clock,
  CheckCircle2,
  ArrowRight,
  Sun,
  Moon,
  Zap,
  HelpCircle,
  Award,
  Layers,
  Palmtree,
  Copy,
  Flame,
  Coffee,
  Check,
  Compass
} from 'lucide-react';

interface UserManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab?: (tab: 'schedule' | 'dashboard' | 'exam' | 'input') => void;
  onOpenCareModal?: () => void;
  onOpenConditionCheck?: () => void;
}

export const UserManualModal: React.FC<UserManualModalProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onOpenCareModal,
  onOpenConditionCheck
}) => {
  const [activeManualTab, setActiveManualTab] = useState<'quickstart' | 'caretypes' | 'scheduler' | 'exam' | 'pomodoro' | 'faq'>('quickstart');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200 overflow-hidden my-auto">
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-violet-900 to-stone-900 text-white p-5 sm:p-6 shrink-0 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-amber-300 text-2xl font-bold shadow-lg">
                📖
              </div>
              <div>
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-violet-200 text-[11px] font-bold mb-1 border border-white/10">
                  <Compass className="w-3 h-3 text-amber-300" />
                  <span>스마트 케어 시간관리 공식 사용자 매뉴얼</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                  처음 사용자를 위한 완벽 가이드
                </h2>
                <p className="text-xs text-violet-200 mt-0.5 hidden sm:block">
                  심리·두뇌 케어, 24시간 원형 계획표, 요일·방학 스케줄, 시험 D-Day 플래너 100% 활용법
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition self-start"
              aria-label="닫기"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex items-center space-x-1 overflow-x-auto pt-4 mt-2 border-t border-white/10 scrollbar-none">
            <button
              onClick={() => setActiveManualTab('quickstart')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center space-x-1.5 ${
                activeManualTab === 'quickstart'
                  ? 'bg-amber-400 text-stone-900 shadow-xs'
                  : 'text-violet-200 hover:bg-white/10'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>3단계 퀵 스타트</span>
            </button>
            <button
              onClick={() => setActiveManualTab('caretypes')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center space-x-1.5 ${
                activeManualTab === 'caretypes'
                  ? 'bg-amber-400 text-stone-900 shadow-xs'
                  : 'text-violet-200 hover:bg-white/10'
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
              <span>5대 두뇌 케어 타입</span>
            </button>
            <button
              onClick={() => setActiveManualTab('scheduler')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center space-x-1.5 ${
                activeManualTab === 'scheduler'
                  ? 'bg-amber-400 text-stone-900 shadow-xs'
                  : 'text-violet-200 hover:bg-white/10'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>24시간 스마트 시간표</span>
            </button>
            <button
              onClick={() => setActiveManualTab('exam')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center space-x-1.5 ${
                activeManualTab === 'exam'
                  ? 'bg-amber-400 text-stone-900 shadow-xs'
                  : 'text-violet-200 hover:bg-white/10'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>시험 D-Day 모드</span>
            </button>
            <button
              onClick={() => setActiveManualTab('pomodoro')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center space-x-1.5 ${
                activeManualTab === 'pomodoro'
                  ? 'bg-amber-400 text-stone-900 shadow-xs'
                  : 'text-violet-200 hover:bg-white/10'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>뽀모도로 몰입 타이머</span>
            </button>
            <button
              onClick={() => setActiveManualTab('faq')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center space-x-1.5 ${
                activeManualTab === 'faq'
                  ? 'bg-amber-400 text-stone-900 shadow-xs'
                  : 'text-violet-200 hover:bg-white/10'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>자주 묻는 질문 (FAQ)</span>
            </button>
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-6 text-stone-800">
          {/* TAB 1: 3단계 퀵 스타트 */}
          {activeManualTab === 'quickstart' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-start space-x-3">
                <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-sm text-indigo-950">단 3분 만에 완성하는 나만의 최적 몰입 루틴</h4>
                  <p className="text-xs text-indigo-800 mt-1 leading-relaxed">
                    본 앱은 단순한 일정 관리가 아니라, 학습자의 <strong>두뇌 집중 상태 및 신경학적 피로도</strong>에 맞추어 최적의 공부 시간과 휴식 시간을 자동으로 계산해 주는 맞춤형 스케줄러입니다.
                  </p>
                </div>
              </div>

              {/* 3 Steps Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Step 1 */}
                <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center mb-2 shadow-2xs">
                      1단계
                    </div>
                    <h5 className="font-extrabold text-sm text-stone-900 flex items-center gap-1.5">
                      <Brain className="w-4 h-4 text-indigo-600" />
                      <span>내 두뇌 케어 타입 진단</span>
                    </h5>
                    <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                      과긴장 번아웃, 스마트폰 도파민 산만, 오후 브레인포그 등 현재 본인의 집중 방해 상태를 진단합니다.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenConditionCheck();
                    }}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-2xs flex items-center justify-center gap-1"
                  >
                    <span>🩺 컨디션 체크인 열기</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Step 2 */}
                <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="w-8 h-8 rounded-xl bg-purple-600 text-white font-extrabold text-xs flex items-center justify-center mb-2 shadow-2xs">
                      2단계
                    </div>
                    <h5 className="font-extrabold text-sm text-stone-900 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-purple-600" />
                      <span>일과 & 과목 설정 입력</span>
                    </h5>
                    <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                      기상/취침 시간, 등교 여부, 학원 일정, 그리고 이번 주 집중할 과목별 목표 시간을 지정합니다.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onSelectTab('input');
                    }}
                    className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition shadow-2xs flex items-center justify-center gap-1"
                  >
                    <span>✏️ 일과 & 과목 설정하기</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Step 3 */}
                <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center mb-2 shadow-2xs">
                      3단계
                    </div>
                    <h5 className="font-extrabold text-sm text-stone-900 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-emerald-600" />
                      <span>24시간 시간표 & 뽀모도로</span>
                    </h5>
                    <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                      오전/오후/저녁 3단 컬러로 자동 생성된 24시간 원형 계획표를 확인하고 뽀모도로 타이머로 즉시 실천합니다.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onSelectTab('schedule');
                    }}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-2xs flex items-center justify-center gap-1"
                  >
                    <span>📅 오늘의 시간표 확인</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 5대 두뇌 & 심리 케어 타입 */}
          {activeManualTab === 'caretypes' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-200">
                <div>
                  <h4 className="text-base font-extrabold text-stone-900">5대 두뇌 & 심리 케어 타입 안내</h4>
                  <p className="text-xs text-stone-500">선택한 케어 타입에 따라 뽀모도로 집중/휴식 주기 및 두뇌 완화 솔루션이 자동 연동됩니다.</p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onOpenCareModal();
                  }}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-extrabold transition border border-indigo-200 self-start sm:self-auto"
                >
                  케어 타입 직접 변경하기
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {CARE_TYPES.map((type) => (
                  <div key={type.id} className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{type.emoji}</span>
                        <span className="font-extrabold text-sm text-stone-900">{type.title}</span>
                      </div>
                      <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                        {type.pomodoroWork}분 몰입 / {type.pomodoroBreak}분 휴식
                      </span>
                    </div>

                    <p className="text-xs text-stone-600 leading-relaxed font-medium">
                      <strong>특징:</strong> {type.subtitle} — {type.traits}
                    </p>

                    <div className="p-2.5 rounded-xl bg-white border border-stone-200/80 text-[11px] text-stone-700 leading-relaxed">
                      <div className="font-bold text-indigo-900 mb-0.5">💡 맞춤 회복 솔루션</div>
                      {type.solution}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: 24시간 스마트 시간표 */}
          {activeManualTab === 'scheduler' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h4 className="text-base font-extrabold text-stone-900">24시간 원형 계획표 & 블록 대시보드 100% 활용법</h4>
                <p className="text-xs text-stone-500 mt-0.5">하루의 리듬을 직관적으로 시각화하고 유연하게 스케줄을 실천할 수 있습니다.</p>
              </div>

              {/* 3 Core Features */}
              <div className="space-y-4">
                {/* 1: 시간대별 3단 색상 구분 */}
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Sun className="w-4 h-4 text-amber-500" />
                    <h5 className="font-extrabold text-sm text-stone-900">1. 시간대별 선명한 3단 테마 색상</h5>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    시간표 블록과 원형 시계가 시간대에 따라 선명하게 구분되어 하루의 리듬을 빠르게 인식할 수 있습니다.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-semibold">
                      🌅 오전 (00:00~12:00)<br />
                      <span className="text-[11px] font-normal text-amber-700">황금빛 앰버 테마 (기상/등교/오전학습)</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 font-semibold">
                      ☀️ 오후 (12:00~18:00)<br />
                      <span className="text-[11px] font-normal text-sky-700">스카이블루 테마 (점심/방과후/학원)</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 font-semibold">
                      🌙 저녁 (18:00~24:00)<br />
                      <span className="text-[11px] font-normal text-purple-700">로열퍼플 테마 (저녁자습/취침)</span>
                    </div>
                  </div>
                </div>

                {/* 2: 요일별 독립 설정 & 평일 일괄 복사 */}
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Copy className="w-4 h-4 text-indigo-600" />
                    <h5 className="font-extrabold text-sm text-stone-900">2. 요일별·공휴일 독립 일과 & 일괄 복사</h5>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    상단의 <code>[월] [화] [수] [목] [금] [토] [일] [🔴 공휴일]</code> 탭을 클릭하여 각 요일마다 다른 등교 여부와 학원 일정을 설정할 수 있습니다.
                    매번 입력할 필요 없이 <strong>'월요일 ➔ 평일 일괄복사'</strong> 또는 <strong>'토요일 ➔ 일요일 복사'</strong> 버튼을 클릭하면 1초 만에 완성됩니다.
                  </p>
                </div>

                {/* 3: 방학 모드 스위치 */}
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Palmtree className="w-4 h-4 text-emerald-600" />
                    <h5 className="font-extrabold text-sm text-stone-900">3. 방학 모드(Vacation Mode) 원클릭 전환</h5>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    방학이 시작되면 상단의 <strong>방학 모드 스위치</strong>를 켜기만 하면 됩니다. 학교 수업 블록이 자동으로 사라지고, 방학 전용 오전/오후/저녁 집중 자습 플랜으로 즉시 전환됩니다.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: 시험 D-Day 플래너 */}
          {activeManualTab === 'exam' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-200">
                <div>
                  <h4 className="text-base font-extrabold text-stone-900">시험 D-Day 모드 & 무제한 맞춤 추가</h4>
                  <p className="text-xs text-stone-500">모의고사, 기말고사뿐만 아니라 원하는 모든 시험을 등록하고 실전 압박을 극복하세요.</p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onSelectTab('exam');
                  }}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold transition shadow-2xs self-start sm:self-auto"
                >
                  시험 D-Day 플래너 이동
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                  <div className="text-xs font-bold text-indigo-700 flex items-center gap-1">
                    <Award className="w-4 h-4" />
                    <span>자유로운 시험 모드 생성</span>
                  </div>
                  <h5 className="font-extrabold text-sm text-stone-900">+ 새 시험 모드 추가</h5>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    <strong>1학기 중간고사, 9월 모평, 수능 파이널, 토익, 한국사</strong> 등 원하는 명칭, 아이콘, D-Day 날짜, 전략 태그를 자유롭게 입력하여 등록할 수 있습니다.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                  <div className="text-xs font-bold text-purple-700 flex items-center gap-1">
                    <Zap className="w-4 h-4" />
                    <span>시간표 블록 자동 연동</span>
                  </div>
                  <h5 className="font-extrabold text-sm text-stone-900">실전 타임어택 & 백지 복습 블록</h5>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    시험 모드를 적용하면 시간표 상단에 D-Day 카운트다운이 표시되고, 모든 자습 블록에 <code>[모의고사 타임어택]</code>, <code>[중간고사 암기]</code> 등의 접두사와 집중 가이드가 자동 배정됩니다.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: 뽀모도로 몰입 타이머 */}
          {activeManualTab === 'pomodoro' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h4 className="text-base font-extrabold text-stone-900">두뇌 맞춤 뽀모도로 몰입 타이머</h4>
                <p className="text-xs text-stone-500 mt-0.5">시간표의 블록 우측 `⏱️ 뽀모도로` 버튼을 클릭하여 즉시 실행할 수 있습니다.</p>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-stone-900 text-white space-y-4 shadow-md">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-900 flex items-center justify-center font-bold text-lg">
                    ⏱️
                  </div>
                  <div>
                    <h5 className="font-extrabold text-sm text-amber-400">맞춤 몰입 & 신경 안정 이완 루틴</h5>
                    <p className="text-xs text-stone-300">내 케어 타입에 최적화된 공부/휴식 주기가 자동 적용됩니다.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white/10 border border-white/10 space-y-1">
                    <div className="font-bold text-amber-300">🎯 몰입 세션</div>
                    <p className="text-stone-300 leading-relaxed">
                      스마트폰 알림을 끄고 과목 우선순위에 따라 잡념 없이 타이머 시간 동안만 몰입합니다.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/10 border border-white/10 space-y-1">
                    <div className="font-bold text-emerald-300">🌿 두뇌 회복 휴식 세션</div>
                    <p className="text-stone-300 leading-relaxed">
                      4-7-8 이완 호흡법, 안구 스트레칭, 수분 섭취를 통해 뇌 피로를 즉시 방전시키고 다음 세트를 준비합니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: 자주 묻는 질문 (FAQ) */}
          {activeManualTab === 'faq' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <h4 className="text-base font-extrabold text-stone-900">자주 묻는 질문 (FAQ)</h4>
                <p className="text-xs text-stone-500 mt-0.5">사용 중 궁금한 점을 빠르게 확인하세요.</p>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                  <div className="font-extrabold text-xs text-stone-900 flex items-center gap-1.5">
                    <span className="text-indigo-600 font-black">Q.</span>
                    <span>요일별 시간표는 어떻게 확인하나요?</span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed pl-4">
                    <code>오늘의 시간표</code> 상단의 요일 선택 바(<code>[월] [화] [수] [목] [금] [토] [일] [🔴 공휴일]</code>)에서 원하는 요일을 누르면 해당 요일의 24시간 원형 계획표와 목록으로 즉시 전환됩니다.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                  <div className="font-extrabold text-xs text-stone-900 flex items-center gap-1.5">
                    <span className="text-indigo-600 font-black">Q.</span>
                    <span>학기 중과 방학 시간표를 번갈아 사용하고 싶어요.</span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed pl-4">
                    시간표 상단 우측의 <strong>방학 모드 스위치</strong>를 켜고 끄는 것만으로 학기 중 등교 시간표와 방학 중 종일 자습 시간표를 1초 만에 스위칭할 수 있습니다.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                  <div className="font-extrabold text-xs text-stone-900 flex items-center gap-1.5">
                    <span className="text-indigo-600 font-black">Q.</span>
                    <span>완료한 일정은 어떻게 체크하나요?</span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed pl-4">
                    시간표 블록 좌측의 원형 체크 버튼을 클릭하면 완료 처리되며, 상단 진행률 바에 오늘의 실시간 달성률(%)이 반영됩니다.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                  <div className="font-extrabold text-xs text-stone-900 flex items-center gap-1.5">
                    <span className="text-indigo-600 font-black">Q.</span>
                    <span>나만의 새로운 시험 일정을 추가하고 싶어요.</span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed pl-4">
                    <code>시험 대비 플래너</code> 탭에서 <strong>`+ 새 시험 모드 추가`</strong>를 눌러 시험 이름, D-Day 날짜, 전략 가이드를 입력하면 언제든 새 시험 모드를 등록하고 시간표에 연동할 수 있습니다.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="p-4 sm:p-5 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-stone-500">
            도움이 더 필요하신가요? 상단 <strong>🩺 컨디션 체크인</strong>이나 <strong>일과 설정</strong>을 언제든 이용하세요.
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
