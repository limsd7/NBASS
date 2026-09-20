import React from 'react';
import { UserProfile, AssessmentResult } from '../types';
import { Brain, Activity, Clock, Award, ArrowRight, ShieldCheck, Calendar, Sparkles } from 'lucide-react';

interface DashboardProps {
  user: UserProfile | null;
  results: AssessmentResult[];
  onStartAssessment: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, results, onStartAssessment }) => {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* User banner */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-2xl font-black shadow-lg shadow-blue-500/30">
                {user ? user.name.charAt(0) : 'G'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black tracking-tight">{user ? user.name : '게스트 회원'}님</h1>
                  <span className="px-2.5 py-0.5 bg-blue-500/30 text-blue-200 rounded-full text-xs font-bold border border-blue-400/30">
                    {user ? user.targetGroup : '체험 중'}
                  </span>
                </div>
                <p className="text-xs text-blue-200 mt-1">{user ? user.email : 'guest@nbass.io'}</p>
              </div>
            </div>

            <button
              onClick={onStartAssessment}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6 py-3.5 rounded-2xl font-extrabold text-sm shadow-lg shadow-blue-500/25 transition-all cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-blue-200" />
              <span>새로운 검사 시작하기</span>
            </button>
          </div>
        </div>

        {/* Results history section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <span>나의 정밀 진단 검사 히스토리</span>
            </h2>
            <span className="text-xs text-slate-500 font-semibold">총 {results.length}회 검사 완료</span>
          </div>

          {results.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <Brain className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-slate-600 text-sm font-semibold">아직 진행된 검사 기록이 없습니다.</p>
              <button
                onClick={onStartAssessment}
                className="px-6 py-3 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
              >
                첫 번째 뇌파·자율신경 검사 시작하기
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((res, idx) => (
                <div
                  key={res.id || idx}
                  className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-blue-300 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-md">
                        간이 스크리닝 #{res.id.slice(-6)}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> {res.date}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-2 text-xs font-semibold text-slate-700">
                      <span>반응속도: <strong className="text-amber-600">{res.reactionTimeAvg || 310}ms</strong></span>
                      <span>신체대사: <strong className="text-indigo-600">BMI {res.bmi || 22.2}</strong></span>
                      <span>체감피로: <strong className="text-rose-600">{res.fatigueLevel || '보통'}</strong></span>
                      <span className="text-slate-400 font-normal">| 🔒 정밀센서 미실시</span>
                    </div>
                  </div>

                  <button
                    onClick={onStartAssessment}
                    className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    스크리닝 요약 보기
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
