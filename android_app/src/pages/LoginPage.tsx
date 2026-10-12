import React, { useState } from 'react';
import { UserProfile } from '../types';
import { authService } from '../services/authService';
import { Sparkles, ArrowRight, Loader2, UserPlus } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (user: UserProfile) => void;
  onParentMode?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onParentMode }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [studentId, setStudentId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [regId, setRegId] = useState('');
  const [regName, setRegName] = useState('');
  const [regSchool, setRegSchool] = useState('');
  const [regGrade, setRegGrade] = useState('');
  const [regError, setRegError] = useState<string | null>(null);

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId.trim() || isLoading) return;
    setIsLoading(true);
    setLoginError(null);
    try {
      const user = await authService.login(studentId.trim());
      onLoginSuccess(user);
    } catch (err: any) {
      setLoginError(err?.message || '로그인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setRegError(null);
    try {
      const user = await authService.signup({
        studentId: regId,
        name: regName,
        school: regSchool,
        grade: regGrade,
      });
      onLoginSuccess(user);
    } catch (err: any) {
      setRegError(err?.message || '회원가입에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 text-white flex flex-col justify-between p-6 select-none">
      {/* Top Brand Area */}
      <div className="pt-8 text-center max-w-sm mx-auto">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-500 to-purple-600 mx-auto flex items-center justify-center text-2xl font-black shadow-lg mb-4 ring-4 ring-indigo-500/20">
          N
        </div>
        <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-bold inline-flex items-center gap-1.5 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>모바일 &amp; 태블릿 통합 에디션</span>
        </span>
        <h2 className="text-2xl font-black tracking-tight">NBASS MindBody Connect</h2>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          PC 본체 앱과 실시간 클라우드로 연동되며,<br />
          검사, 보고서, 성적, 수면, 멘탈, 스케줄 관리를 지원합니다.
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-3xl p-6 shadow-2xl my-6 max-w-md w-full mx-auto space-y-5">
        {/* Login / Signup Tabs */}
        <div className="grid grid-cols-2 p-1 bg-white/10 rounded-2xl">
          <button
            onClick={() => setMode('login')}
            className={`py-2.5 rounded-xl text-xs font-black transition ${mode === 'login' ? 'bg-white text-indigo-700 shadow' : 'text-slate-300'}`}
          >
            로그인
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`py-2.5 rounded-xl text-xs font-black transition ${mode === 'signup' ? 'bg-white text-indigo-700 shadow' : 'text-slate-300'}`}
          >
            회원가입
          </button>
        </div>

        {mode === 'login' ? (
          <form onSubmit={handleManualLogin} className="space-y-3">
            <label className="block text-xs font-bold text-slate-200">
              가입한 학생 ID 입력
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="예: limsd7"
                disabled={isLoading}
                className="flex-1 bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-xs font-bold text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs flex items-center justify-center shadow-md active:scale-95 transition disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
            {loginError && (
              <p className="text-[11px] font-bold text-rose-300 bg-rose-500/10 border border-rose-400/30 rounded-xl px-3 py-2">
                {loginError}
              </p>
            )}
            <p className="text-[11px] text-slate-400 leading-relaxed">
              첫 방문이면 회원가입 탭에서 본인 ID를 만들어주세요. 첫 정밀진단 1회는 무료입니다.
            </p>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">학생 ID (영문·숫자·_- 4~20자)</label>
              <input
                type="text"
                value={regId}
                onChange={(e) => setRegId(e.target.value)}
                placeholder="예: limsd7"
                disabled={isLoading}
                className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-xs font-bold text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">이름</label>
              <input
                type="text"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="예: 홍길동"
                disabled={isLoading}
                className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-xs font-bold text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">학교 (선택)</label>
                <input
                  type="text"
                  value={regSchool}
                  onChange={(e) => setRegSchool(e.target.value)}
                  placeholder="일반고등학교"
                  disabled={isLoading}
                  className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-xs font-bold text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">학년 (선택)</label>
                <input
                  type="text"
                  value={regGrade}
                  onChange={(e) => setRegGrade(e.target.value)}
                  placeholder="고3 (수험생)"
                  disabled={isLoading}
                  className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-xs font-bold text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400"
                />
              </div>
            </div>
            {regError && (
              <p className="text-[11px] font-bold text-rose-300 bg-rose-500/10 border border-rose-400/30 rounded-xl px-3 py-2">
                {regError}
              </p>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-black text-xs shadow-md flex items-center justify-center gap-2 active:scale-98 transition disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              <span>무료 회원가입하고 1회 진단 시작</span>
            </button>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              본인인증(휴대폰·카카오·문자)은 준비 중이며, 현재는 ID 중복 확인만으로 가입됩니다.
            </p>
          </form>
        )}

        {/* Parent Mode */}
        {onParentMode && (
          <button
            onClick={onParentMode}
            className="w-full py-3 px-4 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 text-slate-200 font-black text-xs flex items-center justify-center gap-2 active:scale-98 transition"
          >
            <span>👪</span>
            <span>학부모 모드로 자녀 기록 보기 (읽기 전용)</span>
          </button>
        )}
      </div>

      {/* Footer Info */}
      <div className="text-center text-[10px] text-slate-500 pb-2">
        <p>© 2026 NBASS MindBody Connect · Realtime Cloud Synced with PC · v1.4</p>
      </div>
    </div>
  );
};
