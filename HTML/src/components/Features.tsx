import React, { useState } from 'react';
import { Brain, Activity, Moon, Utensils, Dumbbell, BarChart3, X, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';

interface FeatureItem {
  icon: React.ReactNode;
  title: string;
  description: string;
  detailTitle: string;
  scientificBasis: string;
  keyBenefits: string[];
  recommendedAction: string;
  isPremiumOnly?: boolean;
}

export const Features: React.FC = () => {
  const [selectedFeature, setSelectedFeature] = useState<FeatureItem | null>(null);

  const featureList: FeatureItem[] = [
    {
      icon: <Brain className="w-6 h-6 text-blue-600" />,
      title: "실시간 뇌파 및 자율신경 모니터링",
      description: "신경인지 및 자율신경(교감·부교감) 지표를 바탕으로 현재 몰입 상태와 신체 피로 패턴을 실시간으로 추정하고 웰니스 스코어를 제공합니다.",
      detailTitle: "뇌파 및 자율신경 기반 몰입 상태 & 스트레스 분석 가이드",
      scientificBasis: "▶ 1. EEG 기반 몰입 상태 추정\n" +
        "• 주의력 지표: 집중 상태에서는 베타파(13~30Hz)가, 이완 및 졸림 상태에서는 알파파(8~12Hz)·세타파(4~8Hz)가 우세해집니다. 세타/베타 비율 등을 통해 현재 주의 집중도를 추정합니다.\n\n" +
        "▶ 2. 자율신경계 기반 스트레스 및 피로 추정\n" +
        "• 자율신경계 균형: 부교감신경(PNS)이 우세하면 신체 이완 및 회복, 교감신경(SNS, 스트레스 반응)이 우세하면 긴장과 각성이 상승합니다.\n" +
        "• 신체 회복 모니터링: 설문 및 생체 신호 연구에서 검증된 자율신경계 지표를 활용합니다.\n\n" +
        "▶ 3. 두 지표의 결합과 폐루프(Closed-Loop) 시스템\n" +
        "• EEG는 '지금 뇌가 얼마나 각성·집중 상태인지', 자율신경 지표는 '지금 몸이 얼마나 스트레스·회복 상태인지'를 동시에 보여줍니다 (예: 집중은 하나 번아웃 전조인 고스트레스 상태 포착).\n" +
        "• 시간표 예측 → 자율신경/인지 분석 검증 → 차이 발생 시 영양·수면 데이터 재조정 → 2주 주기 로드맵 반영으로 이어지는 완벽한 피드백 루프를 완성합니다.\n\n" +
        "※ 본 기능은 의료기기가 아니며 질병의 진단·치료를 목적으로 하지 않는 웰니스·피트니스 분석 가이드입니다.",
      keyBenefits: [
        "현재 나의 뇌 각성 상태 및 신체 스트레스 수준 실시간 모니터링",
        "단순 피로와 번아웃 전조 증상(고스트레스-고집중 불균형) 조기 포착",
        "학습 시간표의 예측 결과와 실측 생체 데이터의 검증 및 피드백 루프 완성",
        "개인별 리듬에 맞춘 최적의 휴식 및 회복 타이밍 도출"
      ],
      recommendedAction: "학습 세션 전후로 웨어러블 연동 또는 체크인을 통해 몰입도와 스트레스 패턴을 확인하고, 예측 결과와 비교하여 컨디션을 관리하세요.",
      isPremiumOnly: true
    },
    {
      icon: <Activity className="w-6 h-6 text-indigo-600" />,
      title: "개인 맞춤형 학습 전략 추천",
      description: "생체 리듬(크로노타입)과 5대 과학적 학습 기질(Big 5, TCI, MSLQ, Grit 기반) 분석을 바탕으로, 과목별 인지 부하에 최적화된 시간대별 맞춤 학습 로드맵을 설계합니다.",
      detailTitle: "생체 리듬 & 5대 학습 기질 기반 과학적 맞춤형 학습 로드맵",
      scientificBasis: "▶ 들어가며\n" +
        "'의지가 부족해서'가 아니라 '타이밍과 기질의 문제'일 수 있습니다.\n" +
        "서카디안 리듬(circadian rhythm)에 따른 호르몬, 체온, 신경전달물질의 변화와 개인의 기질적 특성이 집중력과 기억력에 미치는 영향.\n\n" +
        "▶ 1. 뇌를 깨우는 스위치 (코르티솔 각성 반응, CAR)\n" +
        "• 기상 직후 30~45분 사이 코르티솔이 급격히 상승하며 전전두엽이 활성화됩니다.\n" +
        "• 기상 후 2~4시간은 논리적 사고와 새로운 개념 이해에 가장 유리한 골든타임입니다.\n\n" +
        "▶ 2. 체온이 만드는 두 번의 집중 파도\n" +
        "• 체온이 낮을 때(새벽~기상 직후): 정확도가 높고 실수가 적음\n" +
        "• 체온이 오를 때(오전 후반~늦은 오후): 반응 속도와 각성 수준 상승 (암기·문제 풀이 적합)\n\n" +
        "▶ 3. 점심 먹고 나면 졸린 이유 (포스트프란디얼 딥)\n" +
        "• 서카디안 리듬에 내재된 자연스러운 각성 저하 패턴입니다.\n" +
        "• 이 구간에는 새로운 학습보다 복습이나 단순 암기를 배치하는 것이 현명합니다.\n\n" +
        "▶ 4. 모두에게 같은 시간표가 통하지 않는 이유 (크로노타입)\n" +
        "• 아침형 (라크): 오전 6시~10시 피크\n" +
        "• 중간형 (베어): 오전 9시~12시 피크\n" +
        "• 저녁형 (아울): 오후 2시~6시, 저녁 피크\n" +
        "개인별 리듬 위상에 따라 최적 피크 타임이 최대 3~4시간 차이가 납니다.\n\n" +
        "▶ 5. 공부는 잠든 뒤에도 계속된다 (기억 응고화)\n" +
        "• 서파수면 및 렘수면 중 해마의 단기 기억이 대뇌피질로 옮겨져 장기기억으로 자리 잡습니다.\n" +
        "• 벼락치기는 응고화 시간을 빼앗으며, 취침 전 가벼운 복습이 효과적입니다.\n\n" +
        "▶ 5대 과학적 학습 기질 및 전략 분석\n" +
        "• 실행력(Grit), 멘탈 회복탄력성, 탐구 기질, 메타인지, 내재동기의 5개 축을 다각도로 진단하여 학생 고유의 최적화된 공부 프로파일을 구축합니다.",
      keyBenefits: [
        "기상 후 2~4시간: 코르티솔 피크 & 전전두엽 활성 최고조 (새로운 개념, 논리·수리 문제)",
        "오전 후반: 심부체온 상승 및 각성 지속 (독해 및 응용 문제 풀이)",
        "점심 직후 (포스트프란디얼 딥): 자연적 각성 저하 구간 (복습 및 단순 암기)",
        "늦은 오후: 체온 재상승 두 번째 집중 파도 (반복 훈련 및 어휘 암기)",
        "취침 전 1시간: 기억 응고화 준비 (오늘 학습 내용 요약 및 복습)",
        "크로노타입 반영 및 2주 주기 자기 데이터 수집·적응형 루프 적용"
      ],
      recommendedAction: "1~2주간 시간대별 집중도와 컨디션을 직접 기록하고, 앱의 적응형 알고리즘을 통해 2주마다 최적의 학습 로드맵을 재조정하세요. (본 콘텐츠는 일반적인 생리학·인지과학 연구 기반 참고 정보이며, 건강 상태에 따라 전문가 상담을 권장합니다.)"
    },
    {
      icon: <Utensils className="w-6 h-6 text-emerald-600" />,
      title: "뉴로-뉴트리션 뇌 기능 영양 가이드",
      description: "신경전달물질별 영양소 매핑과 혈당 안정성 원리를 바탕으로, 오랜 집중력을 유지하고 뇌 포그(Brain Fog)를 예방하는 맞춤형 식단 및 루틴을 제안합니다.",
      detailTitle: "뉴로-뉴트리션 (Neuro-Nutrition) 뇌 기능 영양 코칭 및 루틴 설계",
      scientificBasis: "▶ 1. 신경전달물질 기능별 영양소 매핑\n" +
        "• 도파민 (동기부여·집중): 티로신·페닐알라닌 (달걀, 아몬드, 아보카도)\n" +
        "• 아세틸콜린 (기억 형성·학습 속도): 콜린 (달걀노른자, 대두, 브로콜리)\n" +
        "• 세로토닌 (정서 안정·충동 조절): 트립토판 + 비타민B6 (바나나, 견과류)\n" +
        "• 노르에피네프린 (각성·주의력): 티로신 + 비타민C (감귤류, 시금치)\n" +
        "• GABA (불안 완화·과각성 진정): 글루타민 + 마그네슘 (현미, 발효식품)\n\n" +
        "▶ 2. 혈당 스파이크-크래시 방지\n" +
        "• 단순당 위주 식사는 인슐린 반응 후 30~60분 뒤 혈당 급락(졸음·집중 저하)을 유발합니다.\n" +
        "• 저GI 탄수화물 + 단백질 + 지방 조합으로 3~4시간 동안 안정적인 인지 성능을 유지합니다.\n\n" +
        "▶ 3. 보충제 가이드 및 주의사항\n" +
        "• 오메가-3, 카페인+L-테아닌, 비타민B군, 마그네슘 등 연구 기반 성분 위주로 다루며, 2~4주 누적 효과와 일관성을 중시합니다.\n\n" +
        "※ 본 콘텐츠는 의학적 처방이 아니며, 질환이 있거나 약물 복용 중인 경우 전문의와 상담하시기 바랍니다.",
      keyBenefits: [
        "기상 후 각성 전환: 단백질 위주 아침 식사 및 수분 보충 (공복 카페인은 코르티솔 리듬과 주의)",
        "학습 피크 전 30~60분: 도파민/노르에피네프린 지원 간식(견과류, 달걀 등)",
        "점심 및 오후 슬럼프 구간: 정제 탄수화물 과다 섭취를 피하고 저GI 간식(사과+견과류)으로 혈당 유지",
        "저녁 학습 전: 과각성 방지를 위한 카페인 컷오프(개인 대사 속도 반영)",
        "취침 전: 마그네슘 함유 식품 및 과식 방지를 통한 수면 중 기억 응고화 지원"
      ],
      recommendedAction: "오후 2~3시 슬럼프 구간에 혈당을 안정시키는 저GI 간식과 마그네슘 루틴을 적용하고, 2주 이상 일관되게 실천하여 컨디션 변화를 모니터링하세요."
    },
    {
      icon: <Dumbbell className="w-6 h-6 text-purple-600" />,
      title: "브레인 스트레칭 및 순환 가이드",
      description: "장시간 착석으로 인한 정맥혈 순환 저하와 근육 긴장을 해소하고, 5분간의 가벼운 움직임으로 뇌 혈류와 인지 기능을 회복시키는 브레인 스트레칭 루틴을 안내합니다.",
      detailTitle: "뇌 혈류 촉진 및 코어 활성화 브레인 스트레칭 루틴",
      scientificBasis: "▶ 1. 핵심 메커니즘 (왜 5분 스트레칭이 뇌 피로를 푸는가)\n" +
        "• 정적 착석과 뇌 혈류 감소: 장시간 앉아있으면 하체 근육 펌프 작용이 멈추고 정맥혈 순환이 느려져 뇌로 가는 산소·포도당 공급이 감소합니다 (머리가 멍해지는 생리적 원인).\n" +
        "• 짧은 움직임의 즉각적 효과: 가벼운 유산소성 움직임(제자리 걷기, 스트레칭)은 심박수를 소폭 상승시켜 뇌 혈류량을 증가시키고 실행기능(작업기억·주의 전환)을 일시적으로 개선합니다.\n" +
        "• 자세 피로 및 신경 압박 해소: 목·어깨·척추 주변의 긴장을 완화하여 경추 신경 압박 및 긴장성 두통 유발 요인을 줄입니다.\n\n" +
        "▶ 2. 목적별 스트레칭 구성 로직 (목적 → 동작 → 효과 근거)\n" +
        "• 혈류 재분배: 제자리 걷기, 스쿼트 3~5회 (하체 근육 펌프 작동으로 정맥환류 촉진)\n" +
        "• 경추 압박 해소: 목 좌우/앞뒤 스트레칭 (후두하근 긴장 완화 및 두통 완화)\n" +
        "• 어깨·흉곽 이완: 어깨 돌리기, 가슴 펴기 (호흡 깊이 회복으로 산소 공급 개선)\n" +
        "• 각성 전환: 팔 크게 휘두르기, 가벼운 점프 (교감신경 활성화로 순간 각성도 상승)\n" +
        "• 시각 피로 해소: 20-20-20 룰 (20분마다 20초간 20피트 밖 응시로 모양체근 긴장 완화)\n\n" +
        "▶ 3. 타이밍 설계 및 실천 전략\n" +
        "• 포스트프란디얼 딥 직전/직후 (점심 후): 각성 저하를 상쇄하는 보조 트리거로 활용\n" +
        "• 깊은 집중 구간 사이 (50~90분마다): 뽀모도로 사이클과 결합하여 '쉬는 시간 = 브레인 스트레칭 시간'으로 포지셔닝\n" +
        "• 늦은 오후 슬럼프 구간: 체온 재상승을 앞당겨 피로 극복\n\n" +
        "※ 본 콘텐츠는 즉각적 IQ 상승 같은 과장된 효과가 아닌, 일시적 각성도 및 혈류 개선을 통한 집중력 회복에 초점을 맞추며, 매일 누적되는 습관 형성을 지향합니다.",
      keyBenefits: [
        "장시간 의자 착석으로 인한 거북목 및 근육 긴장 완화",
        "5분이라는 부담 없는 시간으로 뇌 혈류 재분배 및 산소 공급 증대",
        "휴식 시간 동안 뇌를 빠르게 리프레시하여 다음 세션 집중력 극대화",
        "도파민 및 엔도르핀 분비로 학습 의욕 고취 및 번아웃 예방"
      ],
      recommendedAction: "90분 집중 학습 후 쉬는 시간이나 점심 식사 직후, 알람을 맞춰두고 5분 브레인 스트레칭 루틴을 실천하여 누적된 피로를 해소하세요."
    },
    {
      icon: <Moon className="w-6 h-6 text-teal-600" />,
      title: "수면 주기 및 렘(REM) 관리",
      description: "기억 정착과 인지 회복의 핵심인 수면 구조를 분석하고, 수면 부채(Sleep Debt) 해소와 역산 취침 시간 제안을 통해 일일 컨디션을 극대화합니다.",
      detailTitle: "렘(REM) 수면 최적화 및 기억 정착 솔루션",
      scientificBasis: "▶ 1. 왜 수면이 '기억 정착'의 핵심인가 (기억 응고화)\n" +
        "• 서파수면 (깊은 잠, Slow-Wave Sleep): 해마에서 대뇌피질로 정보가 전이되며, 특히 사실적·서술적 기억(개념, 공식, 단어)의 응고화가 일어납니다.\n" +
        "• REM 수면: 정보 간 연결과 통합, 창의적 문제 해결 및 절차적 기억(패턴 인식, 응용력)에 관여합니다.\n" +
        "• '무엇을 얼마나 외웠는가'보다 '그날 밤 얼마나 잘 잤는가'가 다음 날 기억 인출 성공률을 좌우합니다.\n\n" +
        "▶ 2. 수면 부채(Sleep Debt)와 인지 저하\n" +
        "• 수면 부족이 누적되면 실행기능, 작업기억, 감정 조절 능력이 점진적으로 저하됩니다.\n" +
        "• 주관적 피로도와 실제 인지 저하 사이에 괴리가 발생하여, 본인은 능력이 떨어졌음을 쉽게 자각하지 못합니다.\n\n" +
        "▶ 3. 수면의 질을 결정하는 요인 (수면 구조)\n" +
        "• 수면 사이클: 약 90분 주기로 얕은 잠-깊은 잠-REM이 반복됩니다 (하룻밤 4~6사이클).\n" +
        "• 사이클 완결성: 중간에 깨면 수면 관성(sleep inertia)으로 인해 개운함이 크게 저하됩니다.\n" +
        "• 취침 전 요인: 블루라이트(멜라토닌 억제), 각성 활동(카페인, 스트레스)은 서파수면 비중을 감소시킵니다.\n\n" +
        "▶ 4. 나머지 3대 기능과의 통합 (배율기 역할)\n" +
        "• 수면의 질 → 다음 날 코르티솔 각성 반응의 세기 결정 (학습 시간표 기능과 직결)\n" +
        "• 수면 부족 → 도파민 수용체 민감도 저하 → 영양 가이드 효과 반감\n" +
        "• 수면 부채 → 낮 시간 브레인 스트레칭 필요 빈도 증가\n\n" +
        "※ 수면 관리는 나머지 모든 학습·영양·운동 솔루션의 효과를 극대화하는 핵심 배율기입니다.",
      keyBenefits: [
        "90분 주기 사이클 완결성 분석으로 자고 일어났을 때 개운함 극대화",
        "목표 기상 시간에서 역산한 최적의 취침 시간 제안",
        "블루라이트 차단 및 카페인 컷오프 시간 등 수면 방해 요인 맞춤 코칭",
        "기억 응고화 촉진 및 수면 부채 해소를 통한 다음 날 학습 능률 향상"
      ],
      recommendedAction: "목표 기상 시간을 설정하고 90분 사이클에 맞춘 역산 취침 시간을 확인하세요. 취침 1시간 전 전자기기 사용을 줄이고 가벼운 복습으로 수면 중 기억 정착을 유도하세요."
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-blue-700" />,
      title: "실시간 진행 분석 리포트",
      description: "주간·월간 변화 추이를 그래프로 시각화하여 학습 효율의 성장 곡선을 한눈에 확인할 수 있습니다.",
      detailTitle: "AI 생체 데이터 기반 성장 곡선 & 피드백 리포트",
      scientificBasis: "매일 수집된 생체 신호와 학습 완료 데이터를 다변량 분석(Multivariate Analysis)하여 개선 포인트를 도출합니다.",
      keyBenefits: [
        "내 학습 능력이 어떻게 향상되고 있는지 객관적 지표 확인",
        "번아웃 징후가 보일 때 선제적 휴식 권고 알림",
        "월간 종합 분석 리포트를 통한 학습 전략 수정"
      ],
      recommendedAction: "매주 일요일 저녁 주간 리포트를 확인하고 다음 주 목표 집중 시간을 설정하세요."
    }
  ];

  return (
    <section id="features-section" className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-bold bg-blue-100 text-blue-800 px-3 py-1 rounded-full uppercase tracking-wider">
            CORE FEATURES
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            성공적인 학습을 위한 <span className="text-blue-600">6대 핵심 솔루션</span>
          </h2>
          <p className="text-slate-600 text-base">
            단순히 오래 앉아 있는 공부에서 벗어나, 뇌과학과 생체 데이터에 기반한 스마트한 학습 생태계를 경험하세요. 각 카드를 클릭하면 상세한 설명을 확인할 수 있습니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featureList.map((feature, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedFeature(feature)}
              className="bg-slate-50/80 hover:bg-white border border-slate-200/80 hover:border-blue-300 rounded-3xl p-8 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 group cursor-pointer flex flex-col justify-between relative overflow-hidden"
            >
              {feature.isPremiumOnly && (
                <div className="absolute top-0 right-0 bg-amber-500 text-white text-[11px] font-black px-4 py-1.5 rounded-bl-2xl shadow-sm flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> 프리미엄 전용
                </div>
              )}
              <div>
                <div className="w-14 h-14 rounded-2xl bg-white shadow-md border border-slate-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 mb-3 tracking-tight group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  {feature.description}
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-blue-600 pt-4 border-t border-slate-200/60 group-hover:translate-x-1 transition-transform">
                <span>상세 설명 보기</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Explanation Modal */}
      {selectedFeature && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedFeature(null)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                {selectedFeature.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">NBASS Solution Detail</span>
                  {selectedFeature.isPremiumOnly && (
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-600" /> 프리미엄 이상 회원 전용
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{selectedFeature.detailTitle}</h3>
              </div>
            </div>

            <div className="space-y-4 text-slate-700 text-sm">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" /> 개요 및 설명
                </h4>
                <p className="text-slate-600 leading-relaxed">{selectedFeature.description}</p>
              </div>

              <div className="bg-blue-50/60 p-6 rounded-2xl border border-blue-100 shadow-sm space-y-3">
                <h4 className="font-extrabold text-blue-950 flex items-center gap-2 text-base">
                  <Brain className="w-5 h-5 text-blue-600" /> 과학적 원리 및 메커니즘
                </h4>
                <div className="text-blue-950/90 leading-relaxed text-sm whitespace-pre-line space-y-4 font-normal">
                  {selectedFeature.scientificBasis}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 주요 기대 효과
                </h4>
                <ul className="space-y-2">
                  {selectedFeature.keyBenefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0"></span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100">
                <h4 className="font-bold text-emerald-900 mb-1 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" /> 추천 활용 가이드
                </h4>
                <p className="text-emerald-900/80 leading-relaxed">{selectedFeature.recommendedAction}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedFeature(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-md cursor-pointer"
              >
                확인 완료
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

