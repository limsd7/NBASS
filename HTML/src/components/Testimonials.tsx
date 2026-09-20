import React, { useState } from 'react';
import { Star, Quote, Award } from 'lucide-react';

export const Testimonials: React.FC = () => {
  const [filter, setFilter] = useState<'all' | '수험생' | '대학생' | '직장인'>('all');

  const reviews = [
    {
      name: "김민수",
      role: "수험생 (재수생)",
      category: "수험생",
      text: "매일 독서실에 앉아만 있어도 집중이 안 됐는데, NBASS 검사로 내 집중력 피크 타임이 오전 9시~11시라는 걸 알게 됐습니다. 스케줄을 그에 맞춰 바꿨더니 성적이 크게 올랐어요!",
      rating: 5,
      scoreImprovement: "집중도 +42%"
    },
    {
      name: "이지영",
      role: "대학생 (의예과 본과)",
      category: "대학생",
      text: "방대한 암기량을 소화하느라 번아웃이 왔었는데, 영양 및 뇌 활성화 운동 처방이 정말 큰 도움이 되었습니다. 특히 수면 사이클 분석이 수험 생활의 질을 바꿨습니다.",
      rating: 5,
      scoreImprovement: "수면 효율 최적화"
    },
    {
      name: "박준호",
      role: "직장인 (대기업 기획팀)",
      category: "직장인",
      text: "퇴근 후 자격증 공부를 병행하느라 지쳐있었죠. 자율신경 스트레스 진단 후 피로도를 확인하고 맞춤 휴식법을 적용하니 공부 효율이 두 배로 늘었습니다.",
      rating: 5,
      scoreImprovement: "학습 효율 2배"
    },
    {
      name: "오서연",
      role: "고3 수험생 학부모",
      category: "수험생",
      text: "아이가 공부는 오래 하는데 성적이 안 나와 속상해했어요. NBASS 정밀 진단 후 아이에게 맞는 영양 식단과 멘탈 관리법을 적용하니 훨씬 안정적으로 공부합니다.",
      rating: 5,
      scoreImprovement: "스트레스 50% 감소"
    }
  ];

  const filteredReviews = filter === 'all' ? reviews : reviews.filter(r => r.category === filter);

  return (
    <section id="reviews-section" className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <span className="text-xs font-bold bg-blue-100 text-blue-800 px-3 py-1 rounded-full uppercase tracking-wider">
            SUCCESS STORIES
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            NBASS를 경험한 사용자들의 <span className="text-blue-600">진짜 후기</span>
          </h2>
          <p className="text-slate-600 text-base">
            수험생, 대학생, 직장인들이 직접 검증한 과학적 학습 혁신을 확인하세요.
          </p>

          {/* Filter Tabs */}
          <div className="flex items-center justify-center gap-2 pt-4">
            {(['all', '수험생', '대학생', '직장인'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  filter === tab
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab === 'all' ? '전체 보기' : tab}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredReviews.map((review, idx) => (
            <div
              key={idx}
              className="bg-slate-50 border border-slate-200/80 rounded-3xl p-8 relative flex flex-col justify-between shadow-xs hover:shadow-md transition-all"
            >
              <div className="absolute top-6 right-8 text-blue-200">
                <Quote className="w-10 h-10 opacity-60" />
              </div>

              <div>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="text-slate-700 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                  "{review.text}"
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-200/60">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">{review.name}</h4>
                  <p className="text-xs text-slate-500">{review.role}</p>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">
                  {review.scoreImprovement}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
