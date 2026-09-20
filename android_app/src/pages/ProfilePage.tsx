import React from 'react';
import { UserProfile, MembershipTier } from '../types';
import { authService } from '../services/authService';
import { TIER_NAMES, TIER_BADGE_STYLES } from '../services/featureGate';
import { Award, Check, Sparkles, LogOut, ArrowRightCircle, ShieldCheck } from 'lucide-react';

interface ProfilePageProps {
  user: UserProfile;
  onUserUpdated: (updatedUser: UserProfile) => void;
  onLogout: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ user, onUserUpdated, onLogout }) => {
  const tiers: MembershipTier[] = ['free', 'pro', 'premium', 'premium_plus', 'vip', 'expert'];

  const handleTierChange = (newTier: MembershipTier) => {
    const updated = authService.updateTier(newTier);
    onUserUpdated(updated);
  };

  const featureTable = [
    { name: '진단 결과 요약 & 케어타입 판정', free: true, pro: true, premium: true, plus: true, vip: true },
    { name: 'HL COFFEE 두뇌 혈류 처방 가이드 (100% 무료)', free: true, pro: true, premium: true, plus: true, vip: true },
    { name: '4-7-8 자율신경 리셋 호흡 가이드', free: true, pro: true, premium: true, plus: true, vip: true },
    { name: '5대 정밀 신경계 활력 지표 (인지/집중/수면)', free: false, pro: true, premium: true, plus: true, vip: true },
    { name: '🔴 1순위 핵심 영양제 처방', free: false, pro: true, premium: true, plus: true, vip: true },
    { name: '3-Channel 몰입 백색소음 사운드 믹서', free: false, pro: false, premium: true, plus: true, vip: true },
    { name: '🟡 추천 & 🟢 보조 영양제 3-Tier 세트', free: false, pro: false, premium: true, plus: true, vip: true },
    { name: '📅 스마트 케어 스케줄 관리 (시간표 & 뽀모도로)', free: false, pro: false, premium: false, plus: true, vip: true },
    { name: 'AI 오답노트 원인 분석 & 성적 시뮬레이터', free: false, pro: false, premium: false, plus: true, vip: true },
    { name: '심층 멘탈 관리 & 수면 바이오피드백', free: false, pro: false, premium: false, plus: false, vip: true },
  ];

  return (
    <div className="p-4 space-y-4 pb-20 max-w-md mx-auto">
      {/* 1. User Info Card */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-black text-lg shadow-md">
            {user.name.slice(0, 1)}
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900">{user.name} 님</h2>
            <p className="text-xs text-slate-500">{user.school || '수험생'} &bull; {user.grade || '고교'}</p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">현재 멤버십 등급</span>
          <span className={`px-3 py-1 rounded-full text-xs font-black border ${TIER_BADGE_STYLES[user.tier]}`}>
            {TIER_NAMES[user.tier]}
          </span>
        </div>
      </div>

      {/* 2. 등급 즉석 변경 시뮬레이터 (동적 권한 테스트 및 즉시 전환) */}
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-5 rounded-3xl shadow-sm border border-indigo-800/40">
        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 mb-2">
          <Sparkles className="w-4 h-4" />
          <span>등급별 권한 전환 시뮬레이터</span>
        </div>
        <p className="text-xs text-slate-300 mb-3">
          아래 버튼을 누르면 즉시 해당 등급의 권한이 활성화되어 앱 내 모든 기능이 실시간으로 열립니다.
        </p>

        <div className="grid grid-cols-3 gap-2">
          {tiers.map((t) => {
            const isSelected = user.tier === t;
            return (
              <button
                key={t}
                onClick={() => handleTierChange(t)}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 active:scale-95 ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                    : 'bg-white/10 hover:bg-white/20 text-slate-200'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                <span>{t.toUpperCase()}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. 등급별 기능 비교표 */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5 mb-3">
          <Award className="w-4 h-4 text-indigo-600" />
          <span>멤버십 등급별 개방 기능 비교</span>
        </h3>

        <div className="overflow-x-auto text-[11px]">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold">
                <th className="py-2">기능</th>
                <th className="text-center">Free</th>
                <th className="text-center">Pro</th>
                <th className="text-center">Prem</th>
                <th className="text-center text-purple-600 font-black">PLUS+</th>
                <th className="text-center">VIP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {featureTable.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-2 pr-1 font-medium text-[10px] leading-tight">{item.name}</td>
                  <td className="text-center">{item.free ? '✅' : '🔒'}</td>
                  <td className="text-center">{item.pro ? '✅' : '🔒'}</td>
                  <td className="text-center">{item.premium ? '✅' : '🔒'}</td>
                  <td className="text-center">{item.plus ? '✅' : '🔒'}</td>
                  <td className="text-center">{item.vip ? '✅' : '🔒'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Logout / Switch Student */}
      <div className="pt-2">
        <button
          onClick={onLogout}
          className="w-full py-3 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-rose-600 font-bold text-xs flex items-center justify-center gap-2 shadow-xs active:scale-98 transition"
        >
          <LogOut className="w-4 h-4" />
          <span>다른 학생 코드로 로그인 / 로그아웃</span>
        </button>
      </div>
    </div>
  );
};
