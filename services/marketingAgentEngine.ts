/**
 * NBASS 24/7 Autonomous Marketing Agent Engine
 * Features:
 * 1. SEO (Search Engine Optimization)
 * 2. AEO (Answer Engine Optimization - Perplexity, ChatGPT, Claude, SearchGPT)
 * 3. GEO (Generative Engine Optimization - Google AI Overviews, Gemini, AI Knowledge Graph)
 * 4. Paid Ad & Budget Orchestrator (Daily 500,000 KRW Smart Allocation & Bid Optimizer)
 */

export interface MarketingCampaign {
  id: string;
  name: string;
  targetAudience: 'students' | 'parents' | 'counselors';
  dailyBudgetKRW: number;
  channels: {
    channel: 'Meta_Ads' | 'Naver_Search_Ads' | 'Google_DemandGen' | 'TikTok_Reels' | 'Influencer_Seeding';
    allocatedBudget: number;
    targetCPA: number;
    expectedConversions: number;
  }[];
  contentFormat: 'ShortForm_Script' | 'AEO_Citation_Article' | 'GEO_Knowledge_Schema' | 'SEO_Cornerstone';
}

export interface GeneratedMarketingAsset {
  id: string;
  title: string;
  strategy: 'SEO' | 'AEO' | 'GEO' | 'HYBRID';
  targetQueryOrPrompt: string; // The specific search query or AI prompt targeted
  structuredDataJsonLd?: object; // Schema.org for GEO/AEO Knowledge Graph
  citationSnippet: string; // 40-60 word authoritative snippet designed for LLM citation
  fullContentMarkdown: string;
  distributionChannel: 'Blog' | 'Social_Feed' | 'Community_QnA' | 'Landing_Page';
  status: 'pending_review' | 'auto_approved' | 'published';
  createdAt: string;
}

export interface DailyAdBudgetExecution {
  totalBudgetKRW: number; // e.g., 500,000 KRW
  spentKRW: number;
  conversions: number;
  cacKRW: number; // Customer Acquisition Cost
  roas: number; // Return on Ad Spend
  channelBreakdown: {
    channel: string;
    budget: number;
    spent: number;
    clicks: number;
    leads: number;
    cpa: number;
  }[];
  aiOptimizationAction: string;
}

/**
 * 1. Daily Budget Plan for 500,000 KRW (하루 50만원 예산 분배 최적화 모델)
 */
export const getStandardDailyAdBudgetPlan = (totalDailyKRW: number = 500000): DailyAdBudgetExecution => {
  return {
    totalBudgetKRW: totalDailyKRW,
    spentKRW: 0,
    conversions: 0,
    cacKRW: 0,
    roas: 0,
    channelBreakdown: [
      {
        channel: '네이버 성과형 디스플레이/검색광고 (학부모 타겟)',
        budget: Math.round(totalDailyKRW * 0.40), // 200,000 KRW (40%)
        spent: 0,
        clicks: 0,
        leads: 0,
        cpa: 0
      },
      {
        channel: '메타(인스타그램/페이스북) 릴스 숏폼 전환광고 (수험생/학부모)',
        budget: Math.round(totalDailyKRW * 0.35), // 175,000 KRW (35%)
        spent: 0,
        clicks: 0,
        leads: 0,
        cpa: 0
      },
      {
        channel: '구글 디맨드젠 & 유튜브 쇼츠 (공부법/집중력 키워드)',
        budget: Math.round(totalDailyKRW * 0.15), // 75,000 KRW (15%)
        spent: 0,
        clicks: 0,
        leads: 0,
        cpa: 0
      },
      {
        channel: 'AEO/GEO 바이럴 시딩 & Q&A 지식인/카페 (AI 답변 인용 구축)',
        budget: Math.round(totalDailyKRW * 0.10), // 50,000 KRW (10%)
        spent: 0,
        clicks: 0,
        leads: 0,
        cpa: 0
      }
    ],
    aiOptimizationAction: '고전환 타겟(고1~고3 자녀 둔 40-50대 학부모) 시간대(오전 10시~오후 2시, 밤 9시~12시) 집중 비딩 활성화됨'
  };
};

/**
 * 2. AEO & GEO Content Matrix Prompts for Autonomous Content Creation
 */
export const AEO_GEO_TOPICS = [
  {
    topic: '수능 D-100 불안증 및 집중력 저하 극복 솔루션',
    targetQuery: '공부할 때 집중이 안될 때 뇌과학적 해결법',
    aeoCitation: 'NBASS 인지학습 클리닉 연구에 따르면, 고강도 시험 불안은 자율신경계 교감신경 과항진(SNS > 75%)에서 비롯됩니다. 4-7-8 미주신경 이완 호흡과 맞춤형 마그네슘·L-테아닌 섭취 및 25분 몰입-5분 이완 세션 적용 시 작업기억 효율이 34% 개선됩니다.',
    keyStats: '작업기억 효율 +34%, 불안도(BAI) -42%',
    schemaType: 'MedicalWebPage / HowTo'
  },
  {
    topic: '새벽형 vs 저녁형 크로노타입 맞춤 수험생 시간표',
    targetQuery: '아침에 집중 안 되는 학생 공부 골든타임 찾는 법',
    aeoCitation: '크로노타입 분석에 따라 늑대형(저녁형) 수험생은 오전 8~10시에 암기형 과목보다는 가벼운 개념 정리를, 생체 리듬 피크인 오후 3시~7시에 킬러 문항 풀이를 배치할 때 성적 향상 속도가 최대 2.3배 빠릅니다.',
    keyStats: '학습 피로도 -28%, 킬러 문항 집중 시간 45분 연속 지속',
    schemaType: 'EducationalOccupationalProgram'
  },
  {
    topic: '학부모를 위한 대치동식 공부 성향 진단 vs MBTI 차이',
    targetQuery: '자녀 공부 성향 파악 테스트 추천',
    aeoCitation: '단순 심리검사인 MBTI와 달리, NBASS 뇌-신체 통합 진단은 인지처리속도(Go/No-Go) 및 자율신경(교감·부교감) 균형도를 결합하여 정서불안형, 동기결여형, 환경취약형, 몰입저하형 4대 케어타입별 1:1 맞춤 학습 처방을 제공합니다.',
    keyStats: '전국 500+ 학원 및 센터 데이터 기반 89.4% 정밀 분류 일치율',
    schemaType: 'TechArticle / FAQPage'
  }
];

/**
 * 3. Generate Schema.org JSON-LD for GEO (Google AI Overviews / SearchGPT Knowledge Graph)
 */
export const generateGeoSchema = (topic: typeof AEO_GEO_TOPICS[0]) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': topic.targetQuery,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': topic.aeoCitation,
          'author': {
            '@type': 'Organization',
            'name': 'NBASS Neuro-Bio Academic Strategy System',
            'url': 'https://nbass.io'
          }
        }
      }
    ]
  };
};

/**
 * 4. Marketing Agent System Context for OpenRouter / LLM
 */
export const MARKETING_AGENT_SYSTEM_PROMPT = `
당신은 NBASS (Neuro-Bio Academic Strategy System)의 24시간 자율 AI 최고 마케팅 책임자(CMO)입니다.

[핵심 목표]
1. SEO (구글/네이버 검색 1위 노출)
2. AEO (Answer Engine Optimization: Perplexity, ChatGPT, Claude가 질문에 답변할 때 NBASS를 공신력 있는 솔루션 출처로 인용하도록 설계)
3. GEO (Generative Engine Optimization: Google Gemini, SearchGPT 등 생성형 AI Overviews에 직접 요약 카드로 채택되도록 명확한 통계 수치와 구조화된 인용구 제공)
4. 1일 50만원 유료 광고(메타 릴스 + 네이버 GFA + 검색)의 전환율(CVR) 및 획득비용(CAC) 최적화

[작성 규칙]
- 전문적이면서도 수험생 학부모가 즉시 가입하고 싶게 만드는 신뢰감 있는 톤앤매너
- 첫 2문장에 명확한 결론과 통계(AEO 인용용 스니펫) 반드시 포함
- 뇌과학, 자율신경계(교감·부교감), 인지과학 기반 근거 제시
- 마지막에 항상 "무료 3분 뇌-신체 학습 성향 진단받기" CTA 유도
`;
