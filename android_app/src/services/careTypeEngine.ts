import { CareType, MobileAssessmentResult, CareScore, Prescriptions } from '../types';

export interface AssessmentRawInput {
  student: {
    id: string;
    name: string;
    school: string;
    grade: string;
    age: number;
    gender: string;
    targetUniversity?: string;
    targetMajor?: string;
    birthDate?: string;
    weakSubject?: string;
    focusSubjects?: string[];
    region?: string;
    height?: number;        // 키 (cm, PC StudentInfo.height 대응)
    weight?: number;        // 몸무게 (kg, PC StudentInfo.weight 대응)
    activityLevel?: number; // 활동량 1~4 (PC StudentInfo.activityLevel 대응)
    testDate?: string;      // 검사일자 (PC StudentInfo.testDate 대응)
    subjectPriorities?: {
      importanceRank?: Record<string, number>;
      gradeRank?: Record<string, number>;
      currentFocusRank?: Record<string, number>;
    };
  };
  survey: {
    bai: number;          // 불안 (0~63)
    isi: number;          // 불면 (0~28)
    cfs: number;          // 만성피로 (0~20)
    snsCount: number;      // 교감신경 항진 증상수 (0~8)
    pnsCount: number;      // 부교감/무기력 증상수 (0~8)
    concentration: number;// 집중력 저하도 (0~20)
    adrenal: number;      // 부신피로 (0~20)
    // PC logicEngine 분류 코어용 확장 (선택)
    symptoms?: string[];
    sympatheticSymptoms?: string[];
    parasympatheticSymptoms?: string[];
    circulationSymptoms?: string[];
    circulationScore?: number;
    circulationSymptomsCount?: number;
    chronicFatigue?: boolean;
    fatigueSymptomsCount?: number;
    testAnxietyCognitive?: number;
    testAnxietySomatic?: number;
    digitalAddictionScore?: number;
    chronotypeScore?: number;
    varkPrimary?: string;
    varkScores?: { V: number; A: number; R: number; K: number };
    metacognitionScores?: { rehearsal: number; elaboration: number; organization: number; metacognitive: number };
  };
  studyEfficiency: {
    chronotype: 'morning' | 'evening' | 'intermediate';
    varkStyle: string;
    taiScore: number;     // 시험불안 정규화 점수 (0~30, TAI 합산 0~42를 환산)
    digitalDistraction: number; // 디지털 중독 정규화 점수 (0~20, 합산 0~48을 환산)
    meqScore?: number;    // MEQ 원점수 (7~32)
    meqResult?: string;   // morning | moderate_morning | neutral | moderate_evening | evening
    varkScores?: { V: number; A: number; R: number; K: number };
    varkPrimary?: string;
    taiCognitive?: number; // TAI 인지적 걱정 (0~21)
    taiSomatic?: number;   // TAI 신체적 긴장 (0~21)
    taiSeverity?: string;
    taiTotal?: number; // TAI 합산 원점수 (0~42)
    digitalLevel?: string; // healthy | caution | risk | addiction
    digitalTotal?: number; // 디지털 합산 원점수 (0~48)
    learningTraits?: {   // 5대 학습기질 (각 0~100)
      grit: number;
      resilience: number;
      temperament: number;
      metacognition: number;
      motivation: number;
    };
    metacognitionScore?: number; // 메타인지 정규화 점수 (0~100)
    learningTraitAnswers?: number[]; // 기질 15문항 원응답 (PC rawAnswers 대응)
    metacognitionResult?: {
      rehearsalScore: number;
      elaborationScore: number;
      organizationScore: number;
      metacognitiveScore: number;
      dominantStrategy: string;
      learnerLevel: string;
    };
  };
  protocol?: { // 학습 환경 프로토콜 (PC ProtocolData 대응, 전부 선택)
    location?: string;
    noiseLevel?: number;
    stressLevel?: number;
    sleepHours?: number;
    emotionalFactor?: number;
    motivationalFactor?: number;
    behavioralFactor?: number;
    taskDifficulty?: number;
    timeDistortion?: number;
  };
  analytics?: { // 학습 분석 (PC LearningAnalyticsData 대응, 전부 선택)
    isTested?: boolean; // PC isLearningAnalyticsTested 공식 플래그
    testDate?: string;  // 검사 시행일 (PC analytics.testDate 대응)
    pureStudyRatio?: number;
    avgFocusDuration?: number;
    distractionCount?: number;
    goldenTimeStart?: string;
    goldenTimeEnd?: string;
    lowEfficiencyTime?: string;
    weekdayWeekendGap?: number;
    subjectRatios?: { korean: number; math: number; english: number; science: number; social: number; other: number };
    goalAchievementRate?: number;
    perceivedDifficulty?: number;
    avgSleepHours?: number;
    sleepQuality?: number;
    preferredLocation?: string;
    studyStreak?: number;
    breakAdequacy?: number;
    burnoutCycle?: number;
    energyPattern?: string;
  };
  cognitive: {
    workingMemorySpan: number; // 숫자 거꾸로 외우기 (3~9)
    goNoGoAccuracy: number;    // 주의력 억제 정확도 (0~100%)
    reactionTimeMs: number;    // 반응속도 ms (200~800)
    nbackAccuracy?: number;    // N-Back 정답률 (0~100, 미실시 undefined)
    nbackLevel?: number;       // N-Back 도달 레벨 (1~3)
    digitPlayed?: boolean;     // Digit Span 실측 여부 (미실시 데이터 전달 방지)
    goNoGoPlayed?: boolean;    // Go/No-Go 실측 여부
    falseAlarms?: number;      // Go/No-Go 충동 오답 수
  };
}

export const CARE_TYPE_METADATA: Record<CareType, {
  nameKr: string;
  summary: string;
  badgeColor: string;
  prescriptions: Prescriptions;
}> = {
  [CareType.BURNOUT]: {
    nameKr: '과긴장 번아웃형 (Hyper-Tension Burnout)',
    summary: '교감신경이 만성적으로 과열되어 뇌 피로와 근육 긴장이 최고조에 달한 상태입니다. 긴장을 강제로 낮추는 신경 이완과 골든타임 재설정이 시급합니다.',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    prescriptions: {
      nutrition: ['테아닌 200mg (교감신경 진정)', '마그네슘 비스글리시네이트 (근육 긴장 완화)', '비타민B군 고함량 (스트레스 소모 보충)'],
      study: ['오후 4시 이후 카페인 섭취 중단', '90분 집중 후 의무 15분 완전 암전 휴식', '킬러문항 집착 중단 및 10분 강제 패스 룰'],
      sleep: ['취침 1시간 전 스마트폰 전원 차단', '미온수 샤워로 심부체온 하강 유도', '서카디안 골든타임: 밤 11:30 ~ 아침 06:30 고정'],
      mental: ['4-7-8 자율신경 이완 복식호흡 하루 3회', '점진적 근육이완법 (PMR) 취침 전 5분', '브라운 노이즈를 활용한 전두엽 진정']
    }
  },
  [CareType.ANXIETY_TENSION]: {
    nameKr: '불안-긴장형 (Anxiety-Tension)',
    summary: '시험과 성적 압박으로 편도체가 과잉 활성화되어 시험장에서 실전 기억 인출이 차단되는 유형입니다.',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    prescriptions: {
      nutrition: ['가바(GABA) 500mg (신경 억제성 전달물질 강화)', '캐모마일/레몬밤 추출물', '오메가-3 EPA 1000mg'],
      study: ['타이머 기반 실전 모의고사 노출 훈련', '오답 시 자기 비하 중단 일기 작성', '불안 유발 시험 당일 사전 루틴 확립'],
      sleep: ['취침 전 브레인 덤프(걱정거리 종이에 모두 적기)', '라벤더 아로마 테라피', '취침 2시간 전 소화 부담 최소화'],
      mental: ['박스 브리딩 (4초 들이쉼-4초 멈춤-4초 내쉼-4초 멈춤)', '시험장 불안 시 손바닥 지압 및 앵커링 기법', '안정화 심상화 훈련']
    }
  },
  [CareType.STRESS_OVERLOAD]: {
    nameKr: '스트레스 과부하형 (Stress Overload)',
    summary: '학습량과 감정적 스트레스가 전두엽 처리 용량을 초과하여 기억력 저하와 잦은 실수가 누적되는 유형입니다.',
    badgeColor: 'bg-red-100 text-red-800 border-red-300',
    prescriptions: {
      nutrition: ['홍경천(Rhodiola) 추출물 (코르티솔 조절)', '아연 + 비타민C 복합제', '유산균 (장-뇌 축 건강)'],
      study: ['학습 우선순위 3대 과제 외 과감한 삭제', '멀티태스킹 완전 금지 및 단일 작업 집중', '주간 1회 완전 리셋 반일 휴식'],
      sleep: ['규칙적인 기상 시간 고정 (오차 30분 이내)', '낮잠 20분 커피 냅 루틴', '7시간 이상 필수 수면 확보'],
      mental: ['산책 및 햇빛 쬐기 하루 20분', '감정 환기 저널링', '백색소음(빗소리) 환경 조성']
    }
  },
  [CareType.LOW_ENERGY]: {
    nameKr: '무기력 피로형 (Low-Energy Fatigue)',
    summary: '도파민 분비가 저하되고 신체 활력이 바닥나 책상에 앉아도 뇌에 정보가 입력되지 않는 에너지 고갈 상태입니다.',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
    prescriptions: {
      nutrition: ['코엔자임 Q10 100mg (세포 미토콘드리아 ATP 생성)', '비타민B12 고함량', 'L-티로신 (도파민 전구체)'],
      study: ['2분 착수 트리거: 첫 1문장만 읽기', '25분 몰입 뽀모도로 세션 분할', '작은 성공 경험 체크리스트로 도파민 보상'],
      sleep: ['기상 직후 즉시 전신 스트레칭 및 냉수 섭취', '아침 햇빛 15분 망막 노출 (코르티솔 각성 유도)', '낮잠 30분 초과 금지'],
      mental: ['경쾌한 비트 음악으로 기상 텐션 확보', '부정적 완벽주의 내려놓기', '스몰 스텝 목표 설정']
    }
  },
  [CareType.DEPRESSION_AMOTIVATION]: {
    nameKr: '우울-무동기형 (Depression-Amotivation)',
    summary: '성적 정체감과 자존감 저하로 공부에 대한 흥미와 목적의식이 약화된 상태로, 정서적 지지와 뇌신경 회복이 필요합니다.',
    badgeColor: 'bg-violet-100 text-violet-800 border-violet-300',
    prescriptions: {
      nutrition: ['비타민 D3 5000IU (세로토닌 합성 필수)', '오메가-3 고순도 EPA', '세인트존스워트 또는 사프란 추출물'],
      study: ['자신 있는 전략 과목부터 공부 착수', '일일 공부 분량 30% 감축 및 성공률 100% 만들기', '경쟁 비교 차단'],
      sleep: ['침대 위 스마트폰 사용 엄격 금지', '규칙적 기상 후 가벼운 유산소', '수면 리듬 정상화'],
      mental: ['전문가/멘토 정기 상담 스크립트 적용', '감사 일기 3줄 작성', '자책감 방지 마인드셋']
    }
  },
  [CareType.ADRENAL]: {
    nameKr: '부신피로 증후군 (Adrenal Fatigue)',
    summary: '장기간 수면부족과 고카페인 의존으로 부신 호르몬(코르티솔) 분비 리듬이 역전되어 아침 기상이 극도로 힘든 상태입니다.',
    badgeColor: 'bg-orange-100 text-orange-800 border-orange-300',
    prescriptions: {
      nutrition: ['비타민 C 메가도스 3000mg 분복 (부신 조직 핵심 원료)', '판토텐산 (B5) 500mg', '아슈와간다(Ashwagandha)'],
      study: ['에너지 피크 시간대(주로 오후/저녁) 킬러 과목 배치', '카페인 음료 단계적 디카페인 대체', '식간 저혈당 방지 단백질 간식'],
      sleep: ['밤 11시 이전 취침 시도', '천연 암막 커튼 설치', '기상 시 소금물 1잔 음용 (전해질 균형)'],
      mental: ['복식호흡으로 부신 자극 완화', '온열 찜질로 복부/신장 부위 이완', '과도한 신체 혹사 금지']
    }
  },
  [CareType.BRAIN_FATIGUE]: {
    nameKr: '뇌피로 집중곤란형 (Brain Fatigue)',
    summary: '전두엽 대뇌피질에 아데노신과 대사 노폐물이 누적되어 글을 읽어도 머리에 남지 않는 브레인포그 상태입니다.',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    prescriptions: {
      nutrition: ['포스파티딜세린 (PS) 300mg (인지력 개선)', '은행잎 추출물 징코 120mg (뇌혈류 개선)', '콜린 & 이노시톨'],
      study: ['오답노트 작성 시 3단계 점진적 인출 기법', '개념 읽기보다 백지 복습(Active Recall) 위주', '40분 공부 5분 눈 휴식'],
      sleep: ['깊은 서파수면(Slow-wave sleep) 확보로 글림프 시스템 활성화', '취침 3시간 전 식사 완료', '수면 안대 착용'],
      mental: ['눈 피로 해소 안구 스트레칭', '뇌 쿨링 냉각 패치 활용', '알파파 유도 바이노럴 비트']
    }
  },
  [CareType.HYPERSENSITIVE]: {
    nameKr: '과민성 학습장애형 (Hypersensitive Learning)',
    summary: '주변 소음, 시선, 환경 변화에 신경계가 극도로 예민하게 반응하여 공부 몰입 환경 유지가 어려운 유형입니다.',
    badgeColor: 'bg-pink-100 text-pink-800 border-pink-300',
    prescriptions: {
      nutrition: ['마그네슘 트레온산 (뇌 장벽 통과 마그네슘)', 'L-테아닌 고순도', '비타민 B6 P-5-P'],
      study: ['독서실 1인실 또는 노이즈 캔슬링 헤드폰 필수', '시야 차단 가림판 및 시야각 15도 유지', '환경 자극 최소화'],
      sleep: ['완전 소음 차단 실리콘 귀마개', '백색소음 배경 재생', '실내 온도 20도 항온 유지'],
      mental: ['감각 차단 명상 5분', '촉각 진정 스트레스 볼 활용', '외부 자극 둔감화 훈련']
    }
  },
  [CareType.ATTENTION_DEFICIT]: {
    nameKr: '주의력 산만형 (Attention Deficit)',
    summary: '전두엽 억제 제어 기능이 일시적으로 저하되어 스마트폰, 잡념, 딴짓으로 주의가 5분마다 분산되는 유형입니다.',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-300',
    prescriptions: {
      nutrition: ['오메가-3 DHA 고함량 (뇌세포막 유동성)', 'L-티로신 500mg', '징코빌로바'],
      study: ['스마트폰 물리적 금고 보관 (타임락 컨테이너)', '책상 위 오직 현재 푸는 1권만 올려두기', '15분 초단위 마이크로 타임어택'],
      sleep: ['규칙적인 수면 패턴 확립', '잠들기 전 스크린 타임 제로화', '아침 단백질 식단으로 각성 유지'],
      mental: ['잡념 메모장 (딴생각 나면 종이에 적고 즉시 복귀)', '신체 기립 스탠딩 데스크 병행', '도파민 디톡스 주말']
    }
  },
  [CareType.SLEEP]: {
    nameKr: '수면 장애형 (Sleep Dysfunction)',
    summary: '입면 지연, 잦은 깸, 수면 부채 누적으로 인해 낮 시간대 전두엽 작업기억 용량이 절반 이하로 감소한 상태입니다.',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    prescriptions: {
      nutrition: ['멜라토닌 전구체 타트체리 추출물', '트립토판 풍부 식품 (바나나, 견과류)', '글리신 3g (수면 체온 조절)'],
      study: ['오후 2시 이후 수면 빚 해소용 20분 커피 냅', '밤샘 공부 절대 금지 (기억 공고화 차단 방지)', '오전 시간대 햇빛 학습'],
      sleep: ['침대는 오직 수면 공간으로만 인식화 (침대 위 공부 금지)', '취침 2시간 전 블루라이트 100% 차단', '수면 일지 매일 기록'],
      mental: ['수면 유도 4-7-8 호흡', '몸 이완 바디스캔 음원 청취', '수면 불안 인지 재구조화']
    }
  },
  [CareType.CIRCULATION]: {
    nameKr: '혈액순환 저하형 (Poor Circulation)',
    summary: '장시간 부동 자세로 인해 뇌와 말초로의 산소/포도당 공급이 저하되어 멍함, 두통, 하체 부종이 나타나는 유형입니다.',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    prescriptions: {
      nutrition: ['은행잎 추출물 (말초 및 뇌혈관 확장)', '피크노제놀 (항산화 및 혈류 개선)', '비타민 E 토코페롤'],
      study: ['50분 공부 후 5분 의무 기립 스트레칭 및 발목 펌핑', '독서대 사용하여 거북목 자세 예방', '온수 텀블러 상시 음용'],
      sleep: ['족욕 15분 후 취침 (심부체온 발산)', '다리 베개 받쳐 하체 혈류 환류', '가벼운 밤 산책'],
      mental: ['전신 기지개 및 흉곽 확장 호흡', '손발 마사지', '혈류 순환 이완 가이드']
    }
  },
  [CareType.HEALTHY]: {
    nameKr: '건강 균형형 (Healthy Balance)',
    summary: '자율신경계와 인지 기능이 양호한 균형을 유지하고 있습니다. 현재 상태를 수능일까지 유지하는 페이스 조절이 핵심입니다.',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
    prescriptions: {
      nutrition: ['종합비타민 & 미네랄', '오메가-3 유지 용량', '유산균'],
      study: ['고난도 킬러문항 심화 훈련 유지', '주간 학습 밸런스 유지', '실전 시뮬레이션 감각 극대화'],
      sleep: ['현재 수면 패턴 7시간 엄격 유지', '수면 골든타임 준수', '주말 몰아자기 방지'],
      mental: ['긍정적 마인드셋 유지', '주 2회 가벼운 스포츠/유산소', '슬럼프 사전 예방 모니터링']
    }
  }
};

export const careTypeEngine = {
  evaluateAssessment(input: AssessmentRawInput): MobileAssessmentResult {
    const { survey, studyEfficiency, cognitive, student, protocol, analytics } = input;
    // 환경 보정치 (미입력 시 0 — 기존 기록과 동일 점수 유지)
    const envStress = protocol?.stressLevel !== undefined || protocol?.noiseLevel !== undefined
      ? (protocol?.stressLevel ?? 0) * 1.5 + (protocol?.noiseLevel ?? 0) * 0.5
      : 0;
    const sleepDebt = analytics?.avgSleepHours !== undefined && analytics.avgSleepHours < 6
      ? (6 - analytics.avgSleepHours) * 4
      : 0;
    const pureStudyAdj = analytics?.pureStudyRatio !== undefined
      ? (analytics.pureStudyRatio - 50) * 0.1
      : 0;
    const nbackAdj = cognitive.nbackAccuracy !== undefined
      ? (cognitive.nbackAccuracy - 70) * 0.05
      : 0;

    // 1. 유형별 점수 산출
    const scores: Record<CareType, number> = {
      [CareType.BURNOUT]: Math.min(100, Math.round(survey.snsCount * 6 + survey.cfs * 2.5 + survey.bai * 0.8)),
      [CareType.ANXIETY_TENSION]: Math.min(100, Math.round(survey.bai * 1.3 + studyEfficiency.taiScore * 1.5 + survey.snsCount * 3)),
      [CareType.STRESS_OVERLOAD]: Math.min(100, Math.round(survey.bai * 0.8 + survey.isi * 1.2 + studyEfficiency.digitalDistraction * 2)),
      [CareType.LOW_ENERGY]: Math.min(100, Math.round(survey.pnsCount * 6 + survey.cfs * 2.5 + (100 - cognitive.goNoGoAccuracy) * 0.3)),
      [CareType.DEPRESSION_AMOTIVATION]: Math.min(100, Math.round(survey.cfs * 3 + survey.pnsCount * 5 + survey.concentration * 1.5)),
      [CareType.ADRENAL]: Math.min(100, Math.round(survey.adrenal * 3.5 + survey.cfs * 2 + (survey.isi > 12 ? 15 : 0))),
      [CareType.BRAIN_FATIGUE]: Math.min(100, Math.round((9 - cognitive.workingMemorySpan) * 12 + survey.concentration * 2.5)),
      [CareType.HYPERSENSITIVE]: Math.min(100, Math.round(studyEfficiency.taiScore * 2 + survey.snsCount * 5 + survey.concentration * 1.5)),
      [CareType.ATTENTION_DEFICIT]: Math.min(100, Math.round((100 - cognitive.goNoGoAccuracy) * 0.7 + studyEfficiency.digitalDistraction * 2.5)),
      [CareType.SLEEP]: Math.min(100, Math.round(survey.isi * 3.2 + (survey.cfs > 10 ? 15 : 0))),
      [CareType.CIRCULATION]: Math.min(100, Math.round(survey.pnsCount * 4 + survey.cfs * 1.8 + 20)),
      [CareType.HEALTHY]: 0
    };

    // 건강형 계산: 모든 부정 지표가 낮을 때 상승
    const averageNegative = (survey.bai + survey.isi + survey.cfs + survey.concentration) / 4;
    scores[CareType.HEALTHY] = Math.max(0, Math.min(100, Math.round(100 - averageNegative * 2.5)));

    // 순위 정렬
    const sortedTypes = (Object.keys(scores) as CareType[])
      .filter(t => t !== CareType.HEALTHY)
      .sort((a, b) => scores[b] - scores[a]);

    let primaryType: CareType = sortedTypes[0];
    // 만약 최고점이 40점 미만이고 건강 점수가 65 이상이면 건강형으로 배정
    if (scores[primaryType] < 45 && scores[CareType.HEALTHY] >= 65) {
      primaryType = CareType.HEALTHY;
    }

    const secondaryType = sortedTypes.find(t => t !== primaryType) || sortedTypes[1];
    const secondaryScore = scores[secondaryType] || 0;
    const secondaryConfidence = secondaryScore >= 65 ? 'CONFIRMED' : 'PROVISIONAL';

    // 2. 5대 핵심 지표 산출
    const brainVitality = Math.max(20, Math.min(100, Math.round(
      cognitive.workingMemorySpan * 8 + (100 - survey.concentration * 3.5) * 0.3
    )));

    const stressResistance = Math.max(15, Math.min(100, Math.round(
      100 - (survey.bai * 1.1 + studyEfficiency.taiScore * 1.2 + envStress)
    )));

    const focusCapacity = Math.max(25, Math.min(100, Math.round(
      cognitive.goNoGoAccuracy * 0.7 + (20 - studyEfficiency.digitalDistraction) * 1.5 + pureStudyAdj + nbackAdj
    )));

    const sleepEfficiency = Math.max(20, Math.min(100, Math.round(
      100 - survey.isi * 3.0 - sleepDebt
    )));

    const coherence = Math.max(30, Math.min(100, Math.round(
      (brainVitality + stressResistance + focusCapacity + sleepEfficiency) / 4
    )));

    const meta = CARE_TYPE_METADATA[primaryType];
    const secondaryMeta = CARE_TYPE_METADATA[secondaryType];

    const topCareScores: CareScore[] = sortedTypes.slice(0, 5).map(t => ({
      type: t,
      name: CARE_TYPE_METADATA[t].nameKr,
      score: scores[t],
      description: CARE_TYPE_METADATA[t].summary
    }));

    return {
      id: 'asm-' + Date.now(),
      student: {
        id: student.id,
        name: student.name,
        school: student.school,
        grade: student.grade,
        age: student.age || 18,
        gender: student.gender || '남',
        targetUniversity: student.targetUniversity,
        targetMajor: student.targetMajor,
        ...(student.birthDate ? { birthDate: student.birthDate } : {}),
        ...(student.weakSubject ? { weakSubject: student.weakSubject } : {}),
        ...(student.focusSubjects ? { focusSubjects: student.focusSubjects } : {}),
        ...(student.region ? { region: student.region } : {}),
        // PC Student Registration 대응 신체·검사일자 (PC history.student에 그대로 전달됨)
        ...(student.height !== undefined ? { height: student.height } : {}),
        ...(student.weight !== undefined ? { weight: student.weight } : {}),
        ...(student.height !== undefined && student.weight !== undefined && student.height > 0
          ? { bmi: Math.round((student.weight / Math.pow(student.height / 100, 2)) * 10) / 10 }
          : {}),
        ...(student.activityLevel !== undefined ? { activityLevel: student.activityLevel } : {}),
        ...(student.testDate ? { testDate: student.testDate } : {}),
        ...(student.subjectPriorities ? { subjectPriorities: student.subjectPriorities } : {}),
      },
      examDate: new Date().toISOString().split('T')[0],
      careType: primaryType,
      careTypeName: meta.nameKr,
      secondaryCareType: secondaryType,
      secondaryCareTypeName: secondaryMeta.nameKr,
      secondaryConfidence,
      careTypeBadgeColor: meta.badgeColor,
      careTypeSummary: meta.summary,
      metrics: {
        brainVitality,
        stressResistance,
        focusCapacity,
        sleepEfficiency,
        coherence
      },
      keyAdvice: {
        study: meta.prescriptions.study[0] || '취약 과목 오전 골든타임 배치',
        circadian: meta.prescriptions.sleep[0] || '서카디안 리듬 밤 11시 반 취침 고정',
        stress: meta.prescriptions.mental[0] || '4-7-8 자율신경 이완 복식호흡'
      },
      prescriptions: meta.prescriptions,
      cognitiveProfile: {
        workingMemorySpan: cognitive.workingMemorySpan,
        goNoGoAccuracy: cognitive.goNoGoAccuracy,
        reactionTimeMs: cognitive.reactionTimeMs,
        chronotype: studyEfficiency.chronotype,
        varkStyle: studyEfficiency.varkStyle,
        ...(cognitive.nbackAccuracy !== undefined ? { nbackAccuracy: cognitive.nbackAccuracy } : {}),
        ...(cognitive.nbackLevel !== undefined ? { nbackLevel: cognitive.nbackLevel } : {}),
        ...(studyEfficiency.learningTraits ? { learningTraits: studyEfficiency.learningTraits } : {}),
        ...(studyEfficiency.metacognitionScore !== undefined ? { metacognitionScore: studyEfficiency.metacognitionScore } : {}),
        ...(studyEfficiency.metacognitionResult ? { metacognitionResult: studyEfficiency.metacognitionResult } : {}),
        ...(studyEfficiency.meqScore !== undefined ? { meqScore: studyEfficiency.meqScore, meqResult: studyEfficiency.meqResult } : {}),
        ...(studyEfficiency.varkScores ? { varkScores: studyEfficiency.varkScores, varkPrimary: studyEfficiency.varkPrimary } : {}),
        ...(studyEfficiency.taiCognitive !== undefined ? { taiCognitive: studyEfficiency.taiCognitive, taiSomatic: studyEfficiency.taiSomatic, taiSeverity: studyEfficiency.taiSeverity } : {}),
        ...(studyEfficiency.digitalLevel ? { digitalLevel: studyEfficiency.digitalLevel } : {}),
      },
      ...(protocol ? { protocolData: protocol } : {}),
      ...(analytics ? { analyticsData: analytics } : {}),
      surveyScores: {
        bai: survey.bai,
        isi: survey.isi,
        cfs: survey.cfs,
        concentration: survey.concentration,
        adrenal: survey.adrenal,
        // PC 정식 키 별칭 (logicEngine 분류규칙·clinicalEngine·SecretPoint·F3 근거가 이 키를 읽음.
        // 미전송 시 PC에서 모바일 검사가 규칙 미매칭 → UNASSESSED/미완료로 표시되는 원인)
        // ※ 스케일 주의: 모바일 concentration 0~21(저하도, 높을수록 나쁨) ≒ PC concentrationScore,
        //    모바일 adrenal 0~42 ≒ PC adrenalFatigueScore (방향 동일, 임계값 구간 호환)
        concentrationScore: survey.concentration,
        adrenalFatigueScore: survey.adrenal,
        ...(survey.snsCount !== undefined ? { snsCount: survey.snsCount } : {}),
        ...(survey.pnsCount !== undefined ? { pnsCount: survey.pnsCount } : {}),
        // PC 정식 키 별칭 (F3 numEvidence가 이 키를 읽음)
        ...(survey.snsCount !== undefined ? { sympatheticSymptomsCount: survey.snsCount } : {}),
        ...(survey.pnsCount !== undefined ? { parasympatheticSymptomsCount: survey.pnsCount } : {}),
        ...(survey.circulationSymptomsCount !== undefined ? { circulationSymptomsCount: survey.circulationSymptomsCount } : {}),
      },
      topCareScores
    };
  }
};
