import React, { useState } from 'react';
import { 
  getStandardDailyAdBudgetPlan, 
  AEO_GEO_TOPICS, 
  generateGeoSchema, 
  DailyAdBudgetExecution 
} from '../../services/marketingAgentEngine';
import { generateAIResponse } from '../../services/aiService';

interface OwnerDashboardViewProps {
  onBack?: () => void;
}

export const OwnerDashboardView: React.FC<OwnerDashboardViewProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'briefing' | 'approvals' | 'marketing' | 'exceptions'>('briefing');
  const [budgetPlan, setBudgetPlan] = useState<DailyAdBudgetExecution>(getStandardDailyAdBudgetPlan(500000));
  
  // Pending Approval Items
  const [approvalList, setApprovalList] = useState([
    {
      id: 'appr-1',
      type: 'AEO / 블로그 포스트',
      title: '수능 D-100 불안증 및 집중력 저하 극복 뇌과학 솔루션',
      target: 'Perplexity, ChatGPT, 네이버 1위 노출 (AEO+SEO)',
      snippet: 'NBASS 인지학습 클리닉 연구에 따르면, 고강도 시험 불안은 자율신경계 교감신경 과항진(SNS > 75%)에서 비롯됩니다...',
      status: 'pending'
    },
    {
      id: 'appr-2',
      type: '메타 릴스 숏폼 광고 스크립트 (일 17.5만원 예산)',
      title: '우리 아이 왜 10분만 앉아있어도 딴짓할까? 3가지 뇌 유형',
      target: '고1~고3 학부모 타겟 전환 광고',
      snippet: '후킹: "공부 의지 문제가 아닙니다. 전두엽 작업기억 용량의 신호입니다." → 솔루션: 3분 무료 진단',
      status: 'pending'
    },
    {
      id: 'appr-3',
      type: 'GEO 지식 그래프 스키마 (Google AI Overviews)',
      title: '자녀 공부 성향 파악 테스트 vs MBTI 차이점 JSON-LD',
      target: 'Google SearchGPT 지식베이스 직접 등록',
      snippet: '{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[...]}',
      status: 'pending'
    }
  ]);

  // AI Content Generator State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedOutput, setGeneratedOutput] = useState<string | null>(null);

  const handleApprove = (id: string) => {
    setApprovalList(prev => prev.map(item => item.id === id ? { ...item, status: 'approved' } : item));
  };

  const handleReject = (id: string) => {
    setApprovalList(prev => prev.map(item => item.id === id ? { ...item, status: 'rejected' } : item));
  };

  const handleGenerateFreshAsset = async (topicIndex: number) => {
    setIsGenerating(true);
    const selected = AEO_GEO_TOPICS[topicIndex];
    const prompt = `주제: "${selected.topic}" 에 대한 AEO(Perplexity/ChatGPT 인용용) + GEO(Google AI 요약용) 고전환 블로그 및 광고 카피를 작성해줘. 핵심 인용문구: ${selected.aeoCitation}`;
    const sysPrompt = `당신은 1인 사업(Solopreneur)을 위한 24시간 자율 AI 마케팅 에이전트입니다. 하루 50만원 유료 광고 및 오가닉 검색 유입을 극대화하는 콘텐츠를 작성하세요.`;

    const res = await generateAIResponse(prompt, sysPrompt, null, 'premium');
    setGeneratedOutput(res.text);
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="px-3 py-1 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              >
                ← 나가기 (학생 진단 모드)
              </button>
            )}
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              24시간 자율 에이전트 가동 중
            </span>
            <span className="text-xs text-slate-400">오너 집중 피드백 모드 (1일 1시간)</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-2 text-white">
            NBASS Solopreneur AI 오너 대시보드
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Supabase DB 및 OpenRouter Multi-Agent 기반 자동화 관제 센터
          </p>
        </div>

        {/* Action Summary Pill */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-6">
          <div>
            <div className="text-xs text-slate-400">1일 마케팅 예산</div>
            <div className="text-lg font-bold text-indigo-400">₩500,000</div>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div>
            <div className="text-xs text-slate-400">승인 대기 건수</div>
            <div className="text-lg font-bold text-amber-400">
              {approvalList.filter(a => a.status === 'pending').length}건
            </div>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div>
            <div className="text-xs text-slate-400">예상 월 순이익</div>
            <div className="text-lg font-bold text-emerald-400">~₩1,200만</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto mb-6 flex gap-2 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('briefing')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'briefing'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          📊 일일 AI 브리핑
        </button>
        <button
          onClick={() => setActiveTab('approvals')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'approvals'
              ? 'border-amber-500 text-amber-400 bg-amber-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          ✅ 승인 큐 ({approvalList.filter(a => a.status === 'pending').length})
        </button>
        <button
          onClick={() => setActiveTab('marketing')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'marketing'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          🚀 SEO / AEO / GEO & 50만원 광고 집행
        </button>
        <button
          onClick={() => setActiveTab('exceptions')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'exceptions'
              ? 'border-rose-500 text-rose-400 bg-rose-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          🚨 예외/CS 처리 (0)
        </button>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto">
        {/* Tab 1: Briefing */}
        {activeTab === 'briefing' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span>🤖</span> 오늘의 1분 종합 리포트
              </h2>
              <div className="space-y-4 text-sm text-slate-300">
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">마케팅 & 유입 현황</span>
                  <p className="mt-2 text-slate-200">
                    - 1일 광고 예산 50만원 중 32만원 집행 중 (네이버 검색 14만, 인스타 릴스 18만)<br/>
                    - 신규 방문자: 1,420명 / 무료 성향 진단 완료: 382명 (전환율 26.9%)<br/>
                    - 유료 프리미엄 구독 결제 전환: 14명 (일 매출 ₩418,600)
                  </p>
                </div>
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">AEO / GEO 검색 인용 신호</span>
                  <p className="mt-2 text-slate-200">
                    - Perplexity 및 ChatGPT에서 "수험생 집중력 저하 극복" 관련 NBASS 연구 데이터 인용 트래픽 +48% 증가<br/>
                    - Google AI Overview 지식 스키마가 성공적으로 크롤링되었습니다.
                  </p>
                </div>
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">오너 권장 액션 (약 10분 소요)</span>
                  <p className="mt-2 text-slate-200">
                    1. 승인 큐에서 오늘 발행될 AEO 아티클 2건 확인 및 1-클릭 승인<br/>
                    2. 메타 릴스 소재 A/B 테스트 성과 우수 소재로 예산 5만원 추가 배정 확인
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-slate-400 mb-4">실시간 퍼널 전환율</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>방문 → 무료 진단</span>
                      <span className="font-bold text-white">26.9%</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: '26.9%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>무료 진단 → 유료 플랜</span>
                      <span className="font-bold text-emerald-400">3.66%</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '18%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/20 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-indigo-300 mb-2">💡 AI 자동 최적화 피드백</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  "학부모 유입이 많은 밤 10시~12시에 '수험생 수면-인지 리포트' 팝업을 띄웠을 때 결제 전환율이 2.4배 높습니다. 이 시간대 자동 타겟팅을 유지합니다."
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Approvals */}
        {activeTab === 'approvals' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-white">오늘의 자동 생성 콘텐츠 승인 큐</h2>
              <span className="text-xs text-slate-400">오너의 승인 즉시 네이버 블로그/메타/인스타에 자동 배포됩니다.</span>
            </div>

            {approvalList.map(item => (
              <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {item.type}
                    </span>
                    <span className="text-xs text-slate-400">타겟: {item.target}</span>
                  </div>
                  <h3 className="text-base font-bold text-white">{item.title}</h3>
                  <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono">
                    {item.snippet}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => handleApprove(item.id)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors shadow-lg shadow-emerald-900/20"
                      >
                        1-클릭 승인 & 배포
                      </button>
                      <button
                        onClick={() => handleReject(item.id)}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition-colors"
                      >
                        거절 / 수정
                      </button>
                    </>
                  ) : (
                    <span className={`px-4 py-2 text-xs font-bold rounded-xl ${
                      item.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {item.status === 'approved' ? '✅ 승인 및 자동 발행 완료' : '❌ 반려됨'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Marketing & Budget */}
        {activeTab === 'marketing' && (
          <div className="space-y-6">
            {/* 50만원 예산 분배 현황 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-white">일 500,000원 광고 & 바이럴 스마트 분배</h2>
                  <p className="text-xs text-slate-400">AI가 성과(ROAS) 기반으로 4개 채널 실시간 비딩을 자동 조율합니다.</p>
                </div>
                <div className="px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs font-bold text-indigo-400">
                  ROAS 목표: 350%+
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {budgetPlan.channelBreakdown.map((ch, idx) => (
                  <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-400 mb-2">{ch.channel}</div>
                      <div className="text-xl font-black text-white">₩{ch.budget.toLocaleString()}</div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-400">비중</span>
                      <span className="font-bold text-indigo-400">
                        {Math.round((ch.budget / budgetPlan.totalBudgetKRW) * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AEO / GEO 즉시 생성기 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-base font-bold text-white mb-2">⚡ 실시간 AEO / GEO 콘텐츠 AI 생성 테스트</h3>
              <p className="text-xs text-slate-400 mb-4">OpenRouter를 통해 생성형 AI 검색 엔진(Perplexity/SearchGPT) 인용용 원고를 즉시 생성합니다.</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {AEO_GEO_TOPICS.map((topic, i) => (
                  <button
                    key={i}
                    disabled={isGenerating}
                    onClick={() => handleGenerateFreshAsset(i)}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded-xl border border-slate-700 transition-colors"
                  >
                    ✨ {topic.topic}
                  </button>
                ))}
              </div>

              {isGenerating && (
                <div className="p-6 bg-slate-950 rounded-xl border border-slate-800 text-center text-sm text-indigo-400 animate-pulse">
                  🤖 OpenRouter 멀티 모델을 통해 AEO/GEO 최적화 카피 생성 중...
                </div>
              )}

              {generatedOutput && !isGenerating && (
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-emerald-400">생성 완료 (AEO 스니펫 포함)</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedOutput);
                        alert('복사되었습니다.');
                      }}
                      className="text-xs text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded-md"
                    >
                      전체 복사
                    </button>
                  </div>
                  <pre className="text-xs text-slate-300 whitespace-pre-wrap font-sans max-h-72 overflow-y-auto">
                    {generatedOutput}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Exceptions */}
        {activeTab === 'exceptions' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
            <div className="text-4xl mb-3">🎉</div>
            <h3 className="text-lg font-bold text-white">현재 대기 중인 예외 및 긴급 CS가 없습니다.</h3>
            <p className="text-xs text-slate-400 mt-1">24시간 고객지원 AI 챗봇이 모든 문의에 자동 응대 중입니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};
