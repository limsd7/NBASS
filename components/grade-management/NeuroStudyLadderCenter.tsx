import React, { useState } from 'react';
import { StudentInfo, GradeRecord } from '../../types';
import { getCareTypeDetail } from '../../data/careTypesData';

interface NeuroStudyLadderCenterProps {
  student: StudentInfo;
  records: GradeRecord[];
  careTypeCode?: string;
  onOpenLadderModal: (subjectName: string, unitName: string, weakPriority: number) => void;
  onOpenInputModal?: () => void;
}

export const NeuroStudyLadderCenter: React.FC<NeuroStudyLadderCenterProps> = ({
  student,
  records,
  careTypeCode = 'HEALTHY',
  onOpenLadderModal,
  onOpenInputModal,
}) => {
  const [selectedSubjectTab, setSelectedSubjectTab] = useState<'all' | 'korean' | 'math' | 'english'>('all');
  const [customSubject, setCustomSubject] = useState<'국어' | '수학' | '영어'>('수학');
  const [customUnitInput, setCustomUnitInput] = useState('');

  const currentCare = getCareTypeDetail(careTypeCode);

  // 1. 학생 성적 기록에서 과목별 취약단원 자동 추출
  const koreanCollected: { subjectName: string; unitName: string; priority: number }[] = [];
  const mathCollected: { subjectName: string; unitName: string; priority: number }[] = [];
  const englishCollected: { subjectName: string; unitName: string; priority: number }[] = [];

  records.forEach((r) => {
    r.subjects.forEach((s) => {
      const subId = (s.subjectId || '').toLowerCase();
      if (s.weakUnits && s.weakUnits.length > 0) {
        s.weakUnits.forEach((u, uIdx) => {
          if (subId.includes('kor') || subId.includes('국어') || u.includes('독서') || u.includes('문학') || u.includes('문법') || u.includes('화작') || u.includes('언매')) {
            if (!koreanCollected.some((c) => c.unitName === u)) {
              koreanCollected.push({ subjectName: '국어', unitName: u, priority: uIdx + 1 });
            }
          } else if (subId.includes('eng') || subId.includes('영어') || u.includes('빈칸') || u.includes('순서') || u.includes('어법') || u.includes('삽입') || u.includes('대의')) {
            if (!englishCollected.some((c) => c.unitName === u)) {
              englishCollected.push({ subjectName: '영어', unitName: u, priority: uIdx + 1 });
            }
          } else {
            if (!mathCollected.some((c) => c.unitName === u)) {
              mathCollected.push({ subjectName: '수학', unitName: u, priority: uIdx + 1 });
            }
          }
        });
      }
    });
  });

  // 추천 기본 취약단원
  const defaultKoreanUnits = [
    { subjectName: '국어', unitName: '[독서] 과학·기술 복합 지문 인과/비례 추론', priority: 1 },
    { subjectName: '국어', unitName: '[문학] 고전시가 고어 어휘 & 갈래 복합 독해', priority: 2 },
    { subjectName: '국어', unitName: '[언어와매체] 수능 실전 문법 5문항 체계', priority: 3 },
  ];

  const defaultMathUnits = [
    { subjectName: '수학', unitName: '[수학I] 등차수열과 등비수열의 일반항 & 합', priority: 1 },
    { subjectName: '수학', unitName: '[수학II] 도함수의 활용 (접선·극값·변곡점)', priority: 2 },
    { subjectName: '수학', unitName: '[미적분/수II] 부정적분과 정적분의 계산 및 넓이', priority: 3 },
  ];

  const defaultEnglishUnits = [
    { subjectName: '영어', unitName: '[수능 킬러] 빈칸추론 31~34번', priority: 1 },
    { subjectName: '영어', unitName: '[수능 킬러] 글의 순서 배열(36~37번) & 문장 삽입(38~39번)', priority: 2 },
    { subjectName: '영어', unitName: '[어법·어휘] 29번 어법 & 30번 밑줄 어휘', priority: 3 },
  ];

  const korWeakList = koreanCollected.length > 0 ? koreanCollected : defaultKoreanUnits;
  const mathWeakList = mathCollected.length > 0 ? mathCollected : defaultMathUnits;
  const engWeakList = englishCollected.length > 0 ? englishCollected : defaultEnglishUnits;

  // 2. 전체 교육과정 단원별 사다리 라이브러리
  const CURRICULUM_LADDER_CATALOG = [
    // 국어
    {
      subject: '국어',
      subjectIcon: '📖',
      category: '독서 (비문학)',
      unitName: '[독서] 과학·기술 복합 지문 인과/비례 추론',
      difficulty: '최상',
      targetKiller: '수능 14~17번 킬러',
      badgeColor: 'rose',
      neuroFocus: '작동 원리 단계화 및 1교시 편도체 Freezing 방어'
    },
    {
      subject: '국어',
      subjectIcon: '📖',
      category: '문학 (고전시가)',
      unitName: '[문학] 고전시가 고어 어휘 & 갈래 복합 독해',
      difficulty: '상',
      targetKiller: '수능 21~24번',
      badgeColor: 'rose',
      neuroFocus: '필수 고어 어휘 50선 연상 및 공간·화자 태도 도식화'
    },
    {
      subject: '국어',
      subjectIcon: '📖',
      category: '언어와 매체',
      unitName: '[언어와매체] 수능 실전 문법 5문항 체계',
      difficulty: '상',
      targetKiller: '수능 35~39번',
      badgeColor: 'rose',
      neuroFocus: '중세국어 주격조사 판별 및 형태소 분석 실수 차단'
    },
    {
      subject: '국어',
      subjectIcon: '📖',
      category: '독서 (경제/법률)',
      unitName: '[독서] 사회·경제·법률 복합 지문',
      difficulty: '최상',
      targetKiller: '수능 10~13번 킬러',
      badgeColor: 'rose',
      neuroFocus: '경제 변수 비례·반비례 화살표 메모 및 요건-효과 분류'
    },
    {
      subject: '국어',
      subjectIcon: '📖',
      category: '문학 (현대문학)',
      unitName: '[문학] 현대시·현대소설 심층 독해',
      difficulty: '중상',
      targetKiller: '수능 28~31번',
      badgeColor: 'rose',
      neuroFocus: '<보기> 외적 준거와 선지 1:1 대조 메타인지'
    },
    {
      subject: '국어',
      subjectIcon: '📖',
      category: '화법과 작문',
      unitName: '[화법과작문] 담화 구조 및 작문 전략',
      difficulty: '중',
      targetKiller: '수능 40~45번',
      badgeColor: 'rose',
      neuroFocus: '선지 조건 1:1 체크로 15분 내 만점 컷 확보'
    },

    // 수학
    {
      subject: '수학',
      subjectIcon: '📐',
      category: '수학I',
      unitName: '[수학I] 등차수열과 등비수열의 일반항 & 합',
      difficulty: '상',
      targetKiller: '수능 15번 / 21번 킬러',
      badgeColor: 'blue',
      neuroFocus: '수열의 규칙성 인출 및 축차대입 끈기 훈련'
    },
    {
      subject: '수학',
      subjectIcon: '📐',
      category: '수학II',
      unitName: '[수학II] 도함수의 활용 (접선·극값·변곡점)',
      difficulty: '최상',
      targetKiller: '수능 14번 / 22번 킬러',
      badgeColor: 'blue',
      neuroFocus: '삼차함수 비율 관계(2:1) 직관화 및 케이스 분류'
    },
    {
      subject: '수학',
      subjectIcon: '📐',
      category: '수학II / 미적분',
      unitName: '[미적분/수II] 부정적분과 정적분의 계산 및 넓이',
      difficulty: '최상',
      targetKiller: '수능 20번 / 22번',
      badgeColor: 'blue',
      neuroFocus: '정적분으로 정의된 함수 x=a 대입 & 미분 루틴'
    },
    {
      subject: '수학',
      subjectIcon: '📐',
      category: '선택 미적분',
      unitName: '[미적분] 초월함수의 미적분 & 음함수/역함수',
      difficulty: '극상',
      targetKiller: '수능 미적 28~30번',
      badgeColor: 'blue',
      neuroFocus: '합성함수 체인룰 및 역함수 미분 공식 완벽 암기'
    },
    {
      subject: '수학',
      subjectIcon: '📐',
      category: '선택 미적분',
      unitName: '[미적분] 수열의 극한과 등비급수 프랙탈',
      difficulty: '상',
      targetKiller: '수능 미적 27~29번',
      badgeColor: 'blue',
      neuroFocus: '닮음비 제곱 공식 및 첫째항 도형 기하적 추출'
    },
    {
      subject: '수학',
      subjectIcon: '📐',
      category: '선택 확률과 통계',
      unitName: '[확률과통계] 중복조합(nHr) & 조건부확률',
      difficulty: '상',
      targetKiller: '수능 확통 28~30번',
      badgeColor: 'blue',
      neuroFocus: '바구니 모델(구분 상자 vs 같은 공) 조건 분류'
    },
    {
      subject: '수학',
      subjectIcon: '📐',
      category: '선택 기하',
      unitName: '[기하] 이차곡선의 접선 & 공간도형·벡터 내적',
      difficulty: '최상',
      targetKiller: '수능 기하 28~30번',
      badgeColor: 'blue',
      neuroFocus: '초점 정의선 긋기 및 삼수선의 정리 직각 표시'
    },

    // 영어
    {
      subject: '영어',
      subjectIcon: '🔤',
      category: '수능 킬러',
      unitName: '[수능 킬러] 빈칸추론 31~34번',
      difficulty: '극상',
      targetKiller: '수능 31~34번 (3점 킬러)',
      badgeColor: 'amber',
      neuroFocus: '대주제 패러프레이징 및 빈칸 문장 부정어 유의'
    },
    {
      subject: '영어',
      subjectIcon: '🔤',
      category: '수능 킬러',
      unitName: '[수능 킬러] 글의 순서 배열 & 문장 삽입',
      difficulty: '최상',
      targetKiller: '수능 36~39번 (3점 킬러)',
      badgeColor: 'amber',
      neuroFocus: '3대 Signal Words(지시사·연결사·대명사) 논리 단절 탐색'
    },
    {
      subject: '영어',
      subjectIcon: '🔤',
      category: '어법·어휘',
      unitName: '[어법·어휘] 29번 어법 & 30번 밑줄 어휘',
      difficulty: '상',
      targetKiller: '수능 29~30번',
      badgeColor: 'amber',
      neuroFocus: '동사 자리 vs 준동사 자리 및 반의어 문맥 충돌 판별'
    },
    {
      subject: '영어',
      subjectIcon: '🔤',
      category: '대의 파악',
      unitName: '[대의 파악] 주제, 제목, 요지, 필자의 주장',
      difficulty: '중상',
      targetKiller: '수능 20~24번',
      badgeColor: 'amber',
      neuroFocus: '첫 2문장에서 토픽과 필자의 태도 추출 및 오답 제거'
    },
    {
      subject: '영어',
      subjectIcon: '🔤',
      category: '장문 독해',
      unitName: '[장문 독해] 41~42번 복합 장문 독해',
      difficulty: '중상',
      targetKiller: '수능 41~42번',
      badgeColor: 'amber',
      neuroFocus: '3교시 식곤증 극복 및 7분 내 스피드 정확도 배분'
    }
  ];

  const filteredCatalog = CURRICULUM_LADDER_CATALOG.filter((item) => {
    if (selectedSubjectTab === 'all') return true;
    if (selectedSubjectTab === 'korean') return item.subject === '국어';
    if (selectedSubjectTab === 'math') return item.subject === '수학';
    if (selectedSubjectTab === 'english') return item.subject === '영어';
    return true;
  });

  const handleStartCustomUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUnitInput.trim()) {
      alert('훈련하고자 하는 단원명 또는 키워드를 입력해주세요.');
      return;
    }
    onOpenLadderModal(customSubject, customUnitInput.trim(), 1);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 w-full">
      {/* 1. Header Hero Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-blue-950 rounded-3xl p-6 md:p-8 text-white border border-indigo-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-3xl">🪜</span>
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                국·수·영 6단계 AI 문항 사다리 훈련 센터
              </h2>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/30 text-blue-200 border border-blue-400/30">
                {currentCare.title} 특화
              </span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              취약단원의 긴장도를 낮추는 <b>두뇌 프라이밍</b> ➔ 개념 공백을 메우는 <b>메타인지 3문항 점검</b> ➔ 
              <b>A단계(기본 5문항)부터 F단계(수능 킬러 5문항)까지 30문항 사다리 돌파</b>로 취약점을 완전 정복합니다.
            </p>
            <div className="flex items-center gap-2 pt-2 text-xs text-indigo-300 font-bold flex-wrap">
              <span className="bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">🌱 A 기본(5문항)</span>
              <span>➔</span>
              <span className="bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">🌿 B 응용(5문항)</span>
              <span>➔</span>
              <span className="bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">🌳 C 심화(5문항)</span>
              <span>➔</span>
              <span className="bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">⚡ D 기출(5문항)</span>
              <span>➔</span>
              <span className="bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">🔥 E 준킬러(5문항)</span>
              <span>➔</span>
              <span className="bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">👑 F 수능킬러(5문항)</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
            {onOpenInputModal && (
              <button
                type="button"
                onClick={onOpenInputModal}
                className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-2xl border border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:scale-[1.02]"
              >
                <span>📝</span>
                <span>취약단원 성적표 관리</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Top Weak Units Matrix (국·수·영 3대 과목 취약단원 현황 카드) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span>🎯</span>
            <span>{student.name} 학생 맞춤 국·수·영 취약단원 TOP 사다리</span>
          </h3>
          <span className="text-xs text-slate-500 font-medium">카드를 클릭하면 해당 과목의 사다리 스터디룸으로 즉시 입장합니다</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 국어 취약단원 */}
          <div className="bg-white rounded-2xl p-5 border border-rose-100 shadow-sm hover:border-rose-300 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs font-black flex items-center gap-1.5">
                  <span>📖</span>
                  <span>국어 영역</span>
                </span>
                <span className="text-[11px] font-bold text-slate-400">비문학·문학·문법</span>
              </div>

              <div className="space-y-2">
                {korWeakList.slice(0, 3).map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onOpenLadderModal(item.subjectName, item.unitName, item.priority)}
                    className="w-full text-left p-2.5 rounded-xl border border-slate-100 hover:border-rose-300 hover:bg-rose-50/50 transition-all group flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                        idx === 0 ? 'bg-rose-500 text-white' : idx === 1 ? 'bg-amber-500 text-white' : 'bg-slate-500 text-white'
                      }`}>
                        {idx + 1}위
                      </span>
                      <span className="text-xs font-bold text-slate-800 group-hover:text-rose-700 truncate">
                        {item.unitName}
                      </span>
                    </div>
                    <span className="text-xs text-rose-500 group-hover:translate-x-1 transition-transform shrink-0 font-bold">⚡➔</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>A단계부터 F단계까지 30문항</span>
              <button
                type="button"
                onClick={() => onOpenLadderModal('국어', korWeakList[0]?.unitName || '[독서] 과학·기술 복합 지문', 1)}
                className="text-xs font-bold text-rose-600 hover:text-rose-800 cursor-pointer"
              >
                1순위 사다리 ➔
              </button>
            </div>
          </div>

          {/* 수학 취약단원 */}
          <div className="bg-white rounded-2xl p-5 border border-blue-100 shadow-sm hover:border-blue-300 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-xs font-black flex items-center gap-1.5">
                  <span>📐</span>
                  <span>수학 영역</span>
                </span>
                <span className="text-[11px] font-bold text-slate-400">수I·수II·선택</span>
              </div>

              <div className="space-y-2">
                {mathWeakList.slice(0, 3).map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onOpenLadderModal(item.subjectName, item.unitName, item.priority)}
                    className="w-full text-left p-2.5 rounded-xl border border-slate-100 hover:border-blue-300 hover:bg-blue-50/50 transition-all group flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                        idx === 0 ? 'bg-rose-500 text-white' : idx === 1 ? 'bg-amber-500 text-white' : 'bg-slate-500 text-white'
                      }`}>
                        {idx + 1}위
                      </span>
                      <span className="text-xs font-bold text-slate-800 group-hover:text-blue-700 truncate">
                        {item.unitName}
                      </span>
                    </div>
                    <span className="text-xs text-blue-500 group-hover:translate-x-1 transition-transform shrink-0 font-bold">⚡➔</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>A단계부터 F단계까지 30문항</span>
              <button
                type="button"
                onClick={() => onOpenLadderModal('수학', mathWeakList[0]?.unitName || '[수학I] 등차수열과 등비수열', 1)}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                1순위 사다리 ➔
              </button>
            </div>
          </div>

          {/* 영어 취약단원 */}
          <div className="bg-white rounded-2xl p-5 border border-amber-100 shadow-sm hover:border-amber-300 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 text-xs font-black flex items-center gap-1.5">
                  <span>🔤</span>
                  <span>영어 영역</span>
                </span>
                <span className="text-[11px] font-bold text-slate-400">빈칸·순서·어법</span>
              </div>

              <div className="space-y-2">
                {engWeakList.slice(0, 3).map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onOpenLadderModal(item.subjectName, item.unitName, item.priority)}
                    className="w-full text-left p-2.5 rounded-xl border border-slate-100 hover:border-amber-300 hover:bg-amber-50/50 transition-all group flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                        idx === 0 ? 'bg-rose-500 text-white' : idx === 1 ? 'bg-amber-500 text-white' : 'bg-slate-500 text-white'
                      }`}>
                        {idx + 1}위
                      </span>
                      <span className="text-xs font-bold text-slate-800 group-hover:text-amber-700 truncate">
                        {item.unitName}
                      </span>
                    </div>
                    <span className="text-xs text-amber-500 group-hover:translate-x-1 transition-transform shrink-0 font-bold">⚡➔</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>A단계부터 F단계까지 30문항</span>
              <button
                type="button"
                onClick={() => onOpenLadderModal('영어', engWeakList[0]?.unitName || '[수능 킬러] 빈칸추론 31~34번', 1)}
                className="text-xs font-bold text-amber-600 hover:text-amber-800 cursor-pointer"
              >
                1순위 사다리 ➔
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Custom Topic Real-time AI Ladder Generator */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-lg">
        <form onSubmit={handleStartCustomUnit} className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <span className="text-xl">✨</span>
              <h4 className="text-base font-bold text-white">원하는 단원 실시간 AI 사다리 훈련 생성</h4>
            </div>
            <p className="text-xs text-slate-400">
              목록에 없는 단원도 입력 즉시 AI가 A부터 F까지 30문항과 메타점검 3문항을 자동 생성합니다.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={customSubject}
              onChange={(e) => setCustomSubject(e.target.value as any)}
              className="px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="국어">📖 국어</option>
              <option value="수학">📐 수학</option>
              <option value="영어">🔤 영어</option>
            </select>

            <input
              type="text"
              value={customUnitInput}
              onChange={(e) => setCustomUnitInput(e.target.value)}
              placeholder="예: 지수로그함수의 그래프, 사씨남정기, 문장삽입"
              className="flex-1 md:w-72 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none"
            />

            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shrink-0 shadow-md flex items-center gap-1.5"
            >
              <span>🚀</span>
              <span>사다리 시작</span>
            </button>
          </div>
        </form>
      </div>

      {/* 4. Full Curriculum Ladder Catalog by Subject */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">📚</span>
            <h3 className="text-lg font-bold text-slate-800">
              수능 필수 킬러 &amp; 빈출 단원 사다리 라이브러리
            </h3>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
              총 {filteredCatalog.length}개 단원 완비
            </span>
          </div>

          {/* Subject Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setSelectedSubjectTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedSubjectTab === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <span>🌟</span>
              <span>전 과목</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedSubjectTab('korean')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedSubjectTab === 'korean'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <span>📖</span>
              <span>국어</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedSubjectTab('math')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedSubjectTab === 'math'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <span>📐</span>
              <span>수학</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedSubjectTab('english')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedSubjectTab === 'english'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <span>🔤</span>
              <span>영어</span>
            </button>
          </div>
        </div>

        {/* Catalog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCatalog.map((item, idx) => {
            const isRose = item.badgeColor === 'rose';
            const isAmber = item.badgeColor === 'amber';
            const badgeBg = isRose ? 'bg-rose-50 text-rose-700 border-rose-200' : isAmber ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200';
            const btnBg = isRose ? 'bg-rose-600 hover:bg-rose-700' : isAmber ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700';

            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className={`px-2 py-0.5 rounded-md border text-[11px] font-bold flex items-center gap-1 ${badgeBg}`}>
                      <span>{item.subjectIcon}</span>
                      <span>{item.subject} · {item.category}</span>
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                      {item.targetKiller}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 min-h-[42px]">
                    {item.unitName}
                  </h4>

                  <p className="text-[11.5px] text-slate-500 mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-snug">
                    <span className="font-bold text-slate-700">🧠 인지 포커스:</span> {item.neuroFocus}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400 font-medium">
                    A~F 사다리 (30문항)
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenLadderModal(item.subject, item.unitName, 1)}
                    className={`px-3 py-1.5 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1 cursor-pointer ${btnBg}`}
                  >
                    <span>사다리 훈련</span>
                    <span>⚡</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
