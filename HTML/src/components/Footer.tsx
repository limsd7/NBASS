import React from 'react';
import { Brain, Mail, Phone, Globe, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-16 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                <Brain className="w-5 h-5" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">NBASS</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              뇌파(EEG)·자율신경 밸런스·심리검사로 학습 집중력을 분석하고 맞춤 솔루션을 제공하는 과학적 학습·뇌-신체 최적화 시스템.
            </p>
            <div className="text-xs text-slate-500">
              © 2026 NBASS Inc. All rights reserved.
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">서비스 메뉴</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#intro-section" className="hover:text-white transition-colors">앱 소개</a></li>
              <li><a href="#features-section" className="hover:text-white transition-colors">주요 기능</a></li>
              <li><a href="#tests-section" className="hover:text-white transition-colors">검사 종류</a></li>
              <li><a href="#reviews-section" className="hover:text-white transition-colors">이용 후기</a></li>
            </ul>
          </div>

          {/* Pricing & FAQ */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">고객 지원</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#pricing-section" className="hover:text-white transition-colors">가격 안내</a></li>
              <li><a href="#faq-section" className="hover:text-white transition-colors">자주 묻는 질문 (FAQ)</a></li>
              <li className="hover:text-white transition-colors cursor-pointer">개인정보처리방침</li>
              <li className="hover:text-white transition-colors cursor-pointer">이용약관</li>
            </ul>
          </div>

          {/* Contact info */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">연락 및 브랜드 정보</h4>
            <div className="space-y-2 text-xs text-slate-400">
              <p className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-500 shrink-0" />
                <span>도메인: nbass.io</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                <span>지원: support@nbass.io</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-500 shrink-0" />
                <span>연락처: 02-555-0192</span>
              </p>
            </div>
          </div>

        </div>

        <div className="pt-8 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>NBASS 시스템은 학습 효율 향상을 위한 보조 바이오피드백 도구입니다.</p>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>SSL Secured & Supabase Encrypted</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
