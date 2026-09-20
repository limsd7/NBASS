import React from 'react';
import { SubjectPriority, CareType } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Trophy, Zap, BookOpen, Lightbulb, TrendingUp, CheckCircle, Award } from 'lucide-react';

interface DashboardStatsProps {
  subjects: SubjectPriority[];
  careType: CareType;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ subjects, careType }) => {
  // Mock weekly study distribution data based on subjects
  const weeklyData = subjects.map(s => ({
    name: s.name,
    시간: s.weeklyTargetHours,
    숙달도: s.currentMastery
  }));

  const COLORS = ['#4f46e5', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

  const knowhowTips = [
    {
      title: '뽀모도로 시간 관리법의 핵심',
      category: '시간 관리 노하우',
      desc: `${careType.title}에게 최적화된 ${careType.pomodoroWork}분 집중 + ${careType.pomodoroBreak}분 휴식 리듬을 엄수하세요. 타이머를 눈에 보이지 않게 두어 스마트폰 유혹을 차단합니다.`
    },
    {
      title: '시험 불안 해소를 위한 4-7-8 호흡',
      category: '멘탈 및 자율신경',
      desc: '모의고사나 시험 직전 심장이 빨리 뛰고 머리가 하얘질 때, 4초간 들이쉬고 7초간 멈춘 뒤 8초간 내쉬는 호흡법으로 부교감신경을 즉각 활성화하세요.'
    },
    {
      title: '취침 1시간 전 디지털 디톡스',
      category: '수면 및 회복',
      desc: '블루라이트는 멜라토닌 분비를 억제하여 다음 날 뇌 피로를 가중시킵니다. 밤 10시 이후 스마트폰을 거실에 두고 숙면 골든타임을 지키세요.'
    },
    {
      title: '초소형 성취 과제로 도파민 회로 재활',
      category: '동기 부여',
      desc: "공부가 막막할 때는 '오늘 단어 10개 외우기', '수학 문제 딱 1개 풀기'처럼 실패할 수 없는 아주 작은 단위로 쪼개어 성취감을 누적하세요."
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-stone-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-medium mb-3">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>학습 성취도 및 시간 관리 대시보드</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">목표 달성률 및 과목별 분석</h2>
          <p className="text-stone-300 text-sm mt-1">입력된 과목 우선순위와 주간 학습 목표를 시각적으로 분석하고 전문가 노하우를 확인하세요.</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center space-x-4">
          <Award className="w-10 h-10 text-amber-400 shrink-0" />
          <div>
            <div className="text-xs text-stone-300">현재 케어 타입 달성 지수</div>
            <div className="text-xl font-extrabold text-white">상위 15% 컨디션</div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Target Hours Bar Chart */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-bold text-stone-900">과목별 주간 목표 학습 시간</h3>
            </div>
            <span className="text-xs text-stone-500">단위: 시간(h)</span>
          </div>
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <XAxis dataKey="name" stroke="#78716c" fontSize={12} />
                <YAxis stroke="#78716c" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1c1917', borderRadius: '12px', color: '#fff', border: 'none' }}
                />
                <Bar dataKey="시간" fill="#4f46e5" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subject Mastery Donut Chart */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <h3 className="text-lg font-bold text-stone-900">과목별 현재 숙달도 현황</h3>
            </div>
            <span className="text-xs text-stone-500">단위: %</span>
          </div>
          <div className="h-72 w-full pt-4 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={weeklyData}
                  dataKey="숙달도"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={50}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {weeklyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1c1917', borderRadius: '12px', color: '#fff', border: 'none' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Time Management Know-how Section */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-6">
        <div className="flex items-center space-x-2 pb-4 border-b border-stone-100">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          <h3 className="text-lg font-bold text-stone-900">전문가 추천 시간 관리 및 뇌 피로 회복 노하우</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {knowhowTips.map((tip, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                  {tip.category}
                </span>
                <Zap className="w-4 h-4 text-amber-500" />
              </div>
              <h4 className="font-bold text-stone-900 text-base">{tip.title}</h4>
              <p className="text-xs text-stone-600 leading-relaxed">{tip.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
