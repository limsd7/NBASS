import React from 'react';

interface GradeManualModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GradeManualModal: React.FC<GradeManualModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-700 max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>📖</span> 성적 및 입시 전략 매뉴얼
          </h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg">✕</button>
        </div>

        <div className="space-y-6 text-sm text-slate-600 dark:text-slate-300">
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-blue-100 dark:border-indigo-800">
            <h4 className="font-bold text-indigo-900 dark:text-indigo-300 text-base mb-1.5 flex items-center gap-1.5">
              <span>🧠</span> 12대 CareType 연계 성적 관리 &amp; 6단계 AI 사다리 훈련
            </h4>
            <p className="leading-relaxed text-xs text-slate-600 dark:text-slate-300">
              단순한 점수 누적을 넘어, 학생의 두뇌 신경인지 상태(번아웃, 시험불안, 저활력, 뇌피로 등)와 국·수·영 취약단원을 연계하여 수능 1·2·3년 듀얼트랙 로드맵과 6단계 사다리 문제를 제공하는 프리미엄 학습 케어 시스템입니다.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-slate-800 dark:text-white text-base flex items-center gap-1.5">
              <span>📌</span> 8대 핵심 메뉴별 상세 기능
            </h4>
            <div className="grid grid-cols-1 gap-2.5 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-700">
                <span className="font-bold text-blue-600 dark:text-blue-400">1. 📊 대시보드 (Dashboard):</span> 전 과목 최근 성적 추이 차트, OCR 성적표 인식, 12대 CareType 맞춤 국·수·영 사다리 훈련 3분할 밸런스 카드(국어 1위, 수학 1위, 영어 1위) 및 과목별 TOP 3 전환 기능.
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-700">
                <span className="font-bold text-slate-700 dark:text-slate-300">2. 📝 성적 관리 (Grades):</span> 모의고사/학평/내신 성적표 테이블, 취약단원 TOP 1·2·3순위 지정 뱃지, 미지정 시에도 원클릭 사다리 훈련 지원.
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-700">
                <span className="font-bold text-indigo-600 dark:text-indigo-400">3. 🎯 목표 &amp; AI 플랜 (Goals &amp; Plan):</span> 3단계 등급 목표(Tier 1~3), 목표 대학 정시 컷 자동 연동, 뽀모도로 탄력 타이머 기반 주간 순공 시간 배분.
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-700">
                <span className="font-bold text-purple-600 dark:text-purple-400">4. 🎓 수능 1·2·3년 로드맵 (Roadmap):</span> 고1(3년/12분기), 고2(2년/8분기), 고3·N수(1년/4분기) 전 분기 국·수·영 교과 플랜과 12대 CareType 두뇌 케어 마일스톤의 듀얼트랙 편성 및 자유로운 커스텀 편집.
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-700">
                <span className="font-bold text-rose-600 dark:text-rose-400">5. 🪜 국·수·영 6단계 AI 사다리 (Ladder):</span> 두뇌 프라이밍 ➔ 필수 개념 메타점검 ➔ A(기본 5문항)부터 F(수능 킬러 5문항)까지 30문항 사다리 돌파, 수능 킬러 18대 단원 라이브러리 및 임의 단원 실시간 AI 생성기 탑재.
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-700">
                <span className="font-bold text-teal-600 dark:text-teal-400">6. 🏫 합격 예측 (University):</span> 전국 주요 대학/학과의 최신 수능 환산점수 및 백분위 기준 안정/적정/소신/상향 예측.
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-700">
                <span className="font-bold text-amber-600 dark:text-amber-400">7. 🔮 AI 시뮬레이션 (Simulation):</span> 목표 등급 향상에 따른 전국 백분위 상승 및 합격 가능 대학 군 변동 시뮬레이션.
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-700">
                <span className="font-bold text-cyan-600 dark:text-cyan-400">8. 📈 상세 분석 (Analysis):</span> 과목간 성적 상관관계 피어슨 히트맵, 누적 시험 편차 통계, 과목별 취약 영역 상관도, 단원 정복률 심층 분석.
              </div>
            </div>
          </div>

          {/* 과목간 성적 상관관계 히트맵 특별 가이드 섹션 */}
          <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 space-y-3">
            <h4 className="font-bold text-indigo-900 dark:text-indigo-300 text-sm flex items-center gap-2">
              <span>📊</span> [심층 가이드] 과목간 성적 상관관계 히트맵 사용 및 분석법
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              히트맵은 여러 시험 동안 <strong>과목 간 성적 변동의 피어슨 상관계수(r)</strong>를 계산하여 과목 간 학습 밸런스와 시간 배분 문제를 진단합니다.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-rose-200 dark:border-rose-900/40">
                <strong className="text-rose-600 dark:text-rose-400 block mb-1">🔴 붉은색 (양의 상관관계 r &gt; 0)</strong>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  <strong>동조화 현상:</strong> 두 과목이 함께 오르거나 함께 하락합니다. 뇌 피로도, 시험 불안, 독해력 등 두뇌 신경인지 상태가 두 과목에 공통 작용함을 의미합니다. (두뇌 루틴 관리 필수)
                </p>
              </div>
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-blue-200 dark:border-blue-900/40">
                <strong className="text-blue-600 dark:text-blue-400 block mb-1">🔵 푸른색 (음의 상관관계 r &lt; 0)</strong>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  <strong>트레이드오프 (풍선 효과):</strong> 한 과목이 오르면 다른 과목이 떨어집니다. 한 과목에 시간을 몰아주느라 다른 과목을 방치했을 때 발생합니다. (최소 유지시간 40분 강제 배분)
                </p>
              </div>
            </div>
            <div className="p-2.5 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-xl text-[11px] text-indigo-900 dark:text-indigo-300">
              📌 <strong>실전 코칭 팁:</strong> 수능 100일 전부터는 푸른색(상충) 과목군을 '상호 방어선'으로 전환하여, 특정 과목의 일시적 상승보다 전 과목 등급 밸런스를 지키는 시간표를 수립하세요.
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end">
            <button onClick={onClose} className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors cursor-pointer">
              확인
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
