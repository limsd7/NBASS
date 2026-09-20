import React, { useState } from 'react';
import { X, Mail, Lock, User, ArrowRight, ShieldCheck, Sparkles, Database, CheckCircle2 } from 'lucide-react';
import { UserProfile } from '../types';
import { createSupabaseClient, isSupabaseConfigured, saveSupabaseConfig } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [targetGroup, setTargetGroup] = useState<'수험생' | '대학생' | '직장인' | '기타'>('수험생');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [configSaved, setConfigSaved] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const client = createSupabaseClient();

      if (client && isSupabaseConfigured()) {
        if (isSignUp) {
          const { data, error: signUpError } = await client.auth.signUp({
            email,
            password,
            options: {
              data: { name, target_group: targetGroup }
            }
          });
          if (signUpError) throw signUpError;
          
          const newUser: UserProfile = {
            id: data.user?.id || Date.now().toString(),
            email,
            name: name || email.split('@')[0],
            targetGroup,
            createdAt: new Date().toISOString()
          };
          onLoginSuccess(newUser);
          onClose();
        } else {
          const { data, error: signInError } = await client.auth.signInWithPassword({
            email,
            password
          });
          if (signInError) throw signInError;

          const meta = data.user?.user_metadata;
          const user: UserProfile = {
            id: data.user.id,
            email: data.user.email || email,
            name: meta?.name || email.split('@')[0],
            targetGroup: meta?.target_group || '수험생',
            createdAt: data.user.created_at
          };
          onLoginSuccess(user);
          onClose();
        }
      } else {
        // Fallback demo mode simulation for instantaneous testing
        await new Promise(r => setTimeout(r, 600));
        if (!email) {
          throw new Error('이메일을 입력해주세요.');
        }
        const demoUser: UserProfile = {
          id: 'demo_' + Date.now(),
          email,
          name: name || email.split('@')[0],
          targetGroup,
          createdAt: new Date().toISOString()
        };
        localStorage.setItem('nbass_demo_user', JSON.stringify(demoUser));
        onLoginSuccess(demoUser);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || '인증 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseConfig(supabaseUrl, supabaseKey);
    setConfigSaved(true);
    setTimeout(() => setConfigSaved(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-blue-100 overflow-hidden">
        {/* Header gradient */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-white/80 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-white/20 text-white rounded-md text-[11px] font-bold">
              NBASS SECURITY
            </span>
          </div>
          <h3 className="text-2xl font-extrabold tracking-tight">
            {isSignUp ? '회원가입 및 맞춤 프로파일' : '로그인 & 검사 시작'}
          </h3>
          <p className="text-blue-100 text-xs mt-1">
            뇌파 및 자율신경 데이터와 통합 진단을 위한 안전한 계정 시스템
          </p>
        </div>

        {/* Content body */}
        <div className="p-6">
          {!isSupabaseConfigured() && !showConfig && (
            <div className="mb-5 bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-start gap-3">
              <Database className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800">
                <span className="font-bold">데모 모드 실행 중:</span> Supabase 연동 없이도 바로 체험할 수 있습니다. 자체 Supabase를 연동하려면 아래 설정을 열어주세요.
                <button 
                  onClick={() => setShowConfig(true)}
                  className="block mt-1 text-blue-600 font-bold underline hover:text-blue-800"
                >
                  Supabase 연동 설정 열기
                </button>
              </div>
            </div>
          )}

          {showConfig && (
            <form onSubmit={handleSaveConfig} className="mb-5 bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-blue-600" /> Supabase 자격증명 설정
                </h4>
                <button type="button" onClick={() => setShowConfig(false)} className="text-xs text-slate-400 hover:text-slate-600">닫기</button>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Supabase URL</label>
                <input
                  type="text"
                  placeholder="https://xyz.supabase.co"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Supabase Anon Key</label>
                <input
                  type="password"
                  placeholder="eyJhbGci..."
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>
              <div className="flex items-center justify-between pt-1">
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  설정 저장
                </button>
                {configSaved && (
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 저장됨
                  </span>
                )}
              </div>
            </form>
          )}

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">이름 (닉네임)</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="홍길동"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">타겟 그룹 선택</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['수험생', '대학생', '직장인'] as const).map((group) => (
                      <button
                        type="button"
                        key={group}
                        onClick={() => setTargetGroup(group)}
                        className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                          targetGroup === group
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {group}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">이메일 주소</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="name@nbass.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">비밀번호</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
            >
              {loading ? (
                <span>처리 중...</span>
              ) : (
                <>
                  <span>{isSignUp ? '가입 완료 및 검사 시작' : '로그인하고 검사 시작'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              {isSignUp ? '이미 계정이 있으신가요?' : '아직 계정이 없으신가요?'}{' '}
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="font-bold text-blue-600 hover:underline ml-1"
              >
                {isSignUp ? '로그인하기' : '회원가입하기'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
