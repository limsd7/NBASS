import React, { useState } from 'react';
import { UserProfile } from '../types';
import { authService } from '../services/authService';
import { DEMO_STUDENTS } from '../services/mockData';
import { TIER_BADGE_STYLES, TIER_NAMES } from '../services/featureGate';
import { Sparkles, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [studentId, setStudentId] = useState('');

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId.trim()) return;
    const user = authService.login(studentId.trim());
    onLoginSuccess(user);
  };

  const handleSelectDemo = (student: UserProfile) => {
    const user = authService.login(student.studentId);
    onLoginSuccess(user);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-slate-900 to-slate-950 text-white flex flex-col justify-between p-6">
      {/* Top Brand Area */}
      <div className="pt-10 text-center">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-500 to-purple-500 mx-auto flex items-center justify-center text-2xl font-black shadow-lg mb-4">
          N
        </div>
        <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-bold inline-flex items-center gap-1.5 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>안드로이드 모바일 전용</span>
        </span>
        <h2 className="text-2xl font-black tracking-tight">NBASS MindBody</h2>
        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
          모바일에서는 검사를 진행하지 않으며, 기존 진단 결과 조회 및 등급별 맞춤 기능을 바로 이용하실 수 있습니다.
        </p>
      </div>

      {/* Login Card */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-3xl p-6 shadow-2xl my-6">
        <form onSubmit={handleManualLogin} className="space-y-3">
          <label className="block text-xs font-bold text-slate-200">
            학생 코드 또는 이름 입력
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="예: STD-2026-001 또는 김민준"
              className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-hidden focus:border-indigo-400"
            />
            <button
              type="submit"
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm flex items-center justify-center shadow-md active:scale-95 transition"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Quick Demo Selector */}
        <div className="mt-6 pt-5 border-t border-white/10">
          <p className="text-[11px] font-bold text-slate-300 mb-3 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>등급별 체험 데모 학생 바로 선택</span>
          </p>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_STUDENTS.map((demo) => (
              <button
                key={demo.studentId}
                onClick={() => handleSelectDemo(demo)}
                className="p-3 bg-white/5 hover:bg-white/15 border border-white/10 rounded-2xl text-left transition active:scale-98 flex flex-col justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-white">{demo.name}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{demo.grade}</p>
                </div>
                <span className={`inline-block text-[9px] font-black mt-2 px-2 py-0.5 rounded-md border w-fit ${TIER_BADGE_STYLES[demo.tier]}`}>
                  {TIER_NAMES[demo.tier].split(' ')[0]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center text-[10px] text-slate-500 pb-2">
        <p>© 2026 NBASS MindBody Connect &bull; All Rights Reserved</p>
      </div>
    </div>
  );
};
