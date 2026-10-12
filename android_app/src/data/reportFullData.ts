// ============================================================================
// NBASS 17-Chapter Full Medical ReportBook Data Source
// (PC 본체 앱 data/detailedInsights.ts, pntProducts.ts, learningStrategies.ts 동기화)
// ============================================================================

export interface ChapterMeta {
  pageNum: number;
  id: string;
  title: string;
  subTitle: string;
  icon: string;
}

export const REPORT_CHAPTERS: ChapterMeta[] = [
  { pageNum: 1, id: 'ch1', title: '1장. 핵심 진단 및 1차 케어타입 분류', subTitle: 'Primary Diagnostic Summary', icon: '🎯' },
  { pageNum: 2, id: 'ch2', title: '2장. 자율신경계(ANS) & 생체 신호 바이오마커', subTitle: 'ANS & Neuro-Cognitive Detail', icon: '📊' },
  { pageNum: 3, id: 'ch3', title: '3장. 서카디언 피크타임 & 24시간 골든타임 시간표', subTitle: 'Circadian Peak Time & Schedule', icon: '⏰' },
  { pageNum: 4, id: 'ch4', title: '4장. 학습 밀도 분석 & 스마트폰 방해 요인', subTitle: 'Study Density & Analytics', icon: '📱' },
  { pageNum: 5, id: 'ch5', title: '5장. 12대 케어타입 뇌과학 메커니즘 & 취약시간 돌파', subTitle: 'Learning Traits & Neuro-Mechanism', icon: '🧠' },
  { pageNum: 6, id: 'ch6', title: '6장. 국어·수학·영어·탐구 4대 과목별 전략 로드맵', subTitle: '4-Subject Strategy Roadmap', icon: '📚' },
  { pageNum: 7, id: 'ch7', title: '7장. 공부 효율성 I (크로노타입 & VARK 감각 채널)', subTitle: 'Study Efficiency Assessments I', icon: '👁️' },
  { pageNum: 8, id: 'ch8', title: '8장. 공부 효율성 II (시험불안 TAI & 디지털 디톡스)', subTitle: 'Study Efficiency Assessments II', icon: '🧘' },
  { pageNum: 9, id: 'ch9', title: '9장. 전두엽 인지 기능 실측 (작업기억 & 억제제어)', subTitle: 'Cognitive & Working Memory', icon: '⚡' },
  { pageNum: 10, id: 'ch10', title: '10장. 생활습관 & 서카디언 수면 & 브레인 푸드', subTitle: 'Lifestyle & Nutrition Prescription', icon: '🥗' },
  { pageNum: 11, id: 'ch11', title: '11장. 실전 시험 전략 & 킬러 문항 멘탈 해킹', subTitle: 'Exam Strategy & Killer Hacks', icon: '👑' },
  { pageNum: 12, id: 'ch12', title: '12장. 전문가 임상 소견서 & 학부모 상담 매트릭스', subTitle: 'Expert Clinical Opinion & Matrix', icon: '📝' },
  { pageNum: 13, id: 'ch13', title: '13장. 임상 처방 프로토콜 개요', subTitle: 'Clinical Protocol Overview', icon: '📋' },
  { pageNum: 14, id: 'ch14', title: '14장. PNT 메디컬 뉴트라슈티컬 서플리먼트 라인업', subTitle: 'Nutraceutical Regimen', icon: '💊' },
  { pageNum: 15, id: 'ch15', title: '15장. 1:1 AI 맞춤 코칭 임상 프로토콜 (Part 1)', subTitle: 'AI Expert Coaching - Part 1', icon: '🤖' },
  { pageNum: 16, id: 'ch16', title: '16장. 1:1 AI 맞춤 코칭 로드맵 & KPI 목표 (Part 2)', subTitle: 'AI Expert Coaching - Part 2', icon: '📈' },
  { pageNum: 17, id: 'ch17', title: '17장. 일일 두뇌 루틴 액션 체크리스트 (부록)', subTitle: 'Daily Neuro-Routine Checklist', icon: '✅' },
];

// 케어타입별 심층 뇌과학적 해석 데이터셋 (PC detailedInsights.ts 1:1 매핑)
export interface DetailedCareInsight {
  overviewAnalysis: string;
  ansInterpretation: string;
  stressInterpretation: string;
  studyDensityAnalysis: string;
  vulnerableTimeStrategy: string;
  examDayStrategy: string;
  neuroMechanism: string;
  killerHacks: string;
  clinicalOpinion: string;
}

export const FULL_CARETYPE_INSIGHTS: Record<string, DetailedCareInsight> = {
  BURNOUT: {
    overviewAnalysis: `현재 검사 결과는 '과긴장 번아웃(Hyper-Tension Burnout)' 상태로 판정됩니다. 이는 장기간 누적된 학업 스트레스와 만성 수면 부채로 인해 전두엽의 에너지 공급선이 고갈된 상태를 의미합니다. 번아웃은 단순 피로와 달리 휴식만으로 쉽게 회복되지 않으며, 동기 저하, 성취감 상실, 인지 반응 지연이 동반됩니다. 뇌-신체 연결 시스템이 과부하 상태에 있어 입력 시간 대비 실질적인 학습 인출 효율이 급격히 저하되어 있습니다. 코르티솔 분비 패턴의 교란으로 아침 기상이 극도로 힘들고 오후 3~5시경 극심한 탈진을 겪습니다.`,
    ansInterpretation: `자율신경계 분석 결과, 교감신경(SNS)이 지속적으로 과활성화되어 있어 신체가 24시간 비상 경계 태세를 유지하고 있습니다. 이로 인해 부교감신경(PNS)의 야간 뇌세포 이완 및 해마 기억 고정 기능이 심각하게 억제되어 있습니다. 수면 중에도 미세 각성이 지속되어 피로 물질(아데노신)이 뇌에서 청소되지 못하고 누적됩니다.`,
    stressInterpretation: `생체 스트레스 지수가 위험 임계치를 초과했습니다. 높은 스트레스 수치는 만성 코르티솔 과다 분비를 초래하여 뇌의 해마(기억 중추) 부피를 위축시키고 전두엽 작업기억 용량을 최대 40%까지 잠식합니다. 맥박 변이도(HRV)가 경직되어 스트레스에 유연하게 대처하지 못하고 사소한 실수에도 멘탈이 무너집니다.`,
    studyDensityAnalysis: `순공 비율 분석 결과, 책상에 앉아있는 8시간 중 뇌가 실제로 고밀도 몰입을 유지한 순공 시간은 3.2시간(40% 미만)에 불과합니다. 전두엽 실행기능 저하로 인해 문제를 풀기 시작하는 착수 지연(Procrastination)이 빈번하며, 형식적으로 페이지만 넘기는 가짜 공부가 발생하고 있습니다.`,
    vulnerableTimeStrategy: `오후 1시~3시(식후 급락)와 오후 4시~5시(코르티솔 방전)가 가장 치명적인 취약 구간입니다. 이 시간대에는 절대로 킬러 문항을 풀지 말고, 15분 단위 뽀모도로와 가벼운 오답 복습, 영어 단어 카드 인출 등 저부하 작업으로 뇌를 보호해야 합니다.`,
    examDayStrategy: `D-Day 아침 6시 30분 기상 후 자연광을 10분간 쬐어 세로토닌을 분비시키세요. 세수는 미지근한 물로 하여 교감신경 폭주를 막고, 시험 시작 15분 전 4-7-8 호흡(4초 흡기-7초 정지-8초 호기)을 3세트 실시하여 심박수를 75bpm 이하로 안정시키세요.`,
    neuroMechanism: `전두엽 피질(PFC)과 편도체(Amygdala) 사이의 억제성 GABA 회로가 약화되어 감정 조절 실패와 뇌 과열이 발생합니다. 도파민 수용체의 민감도가 떨어져 학습 보상 체계가 붕괴된 상태이므로, 초소형 성취 단위(Micro-Goal)를 통한 단계적 신경 회복이 필수적입니다.`,
    killerHacks: `시험 중 뇌가 멍해지는 프리징(Freezing)이 오면 펜을 내려놓고 10초간 양손을 깍지 껴 손바닥을 지압하세요. 문제 발문의 모든 조건을 (1), (2), (3)으로 넘버링하여 시각적으로 해체한 후 단계별 접근을 시도하세요.`,
    clinicalOpinion: `수험 생활의 완주를 위해 즉각적인 학습량 재조정(양보다 질)과 취침 전 블루라이트 완전 차단, L-테아닌 및 마그네슘 보충을 통한 자율신경 안정화 프로토콜을 강력히 권고합니다.`
  },
  HYPERSENSITIVE: {
    overviewAnalysis: `현재 검사 결과는 '과민성 학습장애형 (Hypersensitive Learning)'으로 판정됩니다. 주변의 사소한 시각적 움직임, 필기 소리, 책장 넘기는 소리, 조명 반사 등 미세 환경 자극에 감각 신경계가 극도로 예민하게 반응하여 공부 몰입 흐름이 빈번히 단절되는 유형입니다.`,
    ansInterpretation: `감각 수용기(Sensory Receptor)와 연결된 교감신경계의 역치가 매우 낮아져 있습니다. 외부 자극이 감지될 때마다 투쟁-도피(Fight-or-Flight) 반응이 유발되어 심박수가 급등하고 집중 시야각이 좁아지는 감각 과부하를 겪습니다.`,
    stressInterpretation: `환경 유발성 스트레스 부하가 매우 높습니다. 자습실이나 독서실에서 타인의 시선이나 작은 소음에 신경을 곤두세우느라 순수한 학습 뇌 에너지가 주변 감시(Vigilance)에 낭비되고 있습니다.`,
    studyDensityAnalysis: `집중 지속 시간(Attention Span)이 15분 단위로 분절되어 있습니다. 한 번 끊긴 집중 흐름을 다시 궤도에 올리는 데 평균 8분 이상의 예열 시간이 소요되어 전체 공부 밀도가 50% 이하로 감소합니다.`,
    vulnerableTimeStrategy: `주변 유동 인구가 많아지는 오후 5시~7시 및 밤 10시 이후가 가장 취약합니다. 이 시간대에는 1인 독서실이나 노이즈 캔슬링 헤드폰을 착용하고 시야각을 15도로 제한하는 가림판 독서대를 반드시 활용하세요.`,
    examDayStrategy: `실전 시험장에서는 귀마개(소음 차단 폼) 사용 승인을 사전 신청하고, 책상 위에는 현재 풀고 있는 문제지 외의 모든 소지품을 치워 시각적 간섭을 제로화하세요.`,
    neuroMechanism: `감각 정보를 걸러주는 시상 망상핵(Thalamic Reticular Nucleus)의 게이팅 기능이 일시적으로 저하되어 불필요한 배경 잡음이 전두엽으로 그대로 유입되는 상태입니다.`,
    killerHacks: `고난도 지문 독해 시 지문 전체를 보지 말고 자(Ruler)나 가림 종이로 읽는 줄만 노출시키는 '시각적 차단 윈도우 기법'을 적용하여 안구 도약 실수를 방지하세요.`,
    clinicalOpinion: `환경 통제(독서실 1인실, 백색소음, 노이즈캔슬링)가 성적 향상의 최우선 열쇠입니다. 신경 안정에 기여하는 마그네슘 트레온산 및 이노시톨 복용을 병행하면 감각 예민도가 35% 이상 완화됩니다.`
  },
  ANXIETY_TENSION: {
    overviewAnalysis: `현재 검사 결과는 '불안-긴장형 (Anxiety-Tension)'으로 판정됩니다. 평소 모의고사 대비 실전에서 성적이 큰 폭으로 하락하거나, 시험지를 마주했을 때 손떨림, 가슴 두근거림, 호흡 곤란을 겪는 전형적인 시험 상황 압박 취약군입니다.`,
    ansInterpretation: `시험 압박이 인지되는 즉시 아드레날린성 교감신경 폭주가 일어나며, 뇌로 가는 혈류가 근육으로 쏠려 전두엽 혈류 저하(Hypofrontality)가 발생합니다. 이로 인해 평소 잘 풀던 문제도 백지상태가 됩니다.`,
    stressInterpretation: `수행 불안(Performance Anxiety) 점수가 상위 5% 고위험군입니다. '실수하면 망한다'는 파국적 인지 왜곡이 뇌의 작업기억을 점유하여 수학 복합 계산 및 국어 추론 문제에서 치명적인 오답을 만듭니다.`,
    studyDensityAnalysis: `공부 중에도 결과에 대한 염려로 인해 딴생각(Worrying)에 빠지는 시간이 하루 평균 90분 이상 발생합니다. 책상 앞에 오래 앉아 있어도 실제 머리에 남는 지식량이 부족합니다.`,
    vulnerableTimeStrategy: `시험 3일 전부터 시험 당일 아침까지가 최고 위험 구간입니다. 이 시기에는 새로운 킬러 문제 풀이를 전면 중단하고 오답노트의 확실히 맞힌 문제만을 복습하여 뇌의 도파민 효능감을 극대화해야 합니다.`,
    examDayStrategy: `1교시 국어 시험지 배부 직전, 의도적으로 어깨를 으쓱 올려 3초간 쥐어짠 후 툭 떨어뜨리는 점진적 근이완법(PMR)을 실시하세요. 손끝 체온을 유지하기 위해 핫팩을 쥐고 계세요.`,
    neuroMechanism: `노르에피네프린(NE) 과다 분비로 인해 전두엽의 작업기억 버퍼가 오버플로우된 상태입니다. 세로토닌 합성 전구물질과 테아닌을 통해 신경 흥분도를 낮춰야 합니다.`,
    killerHacks: `모르는 문제가 나왔을 때는 1분 이상 고민하지 말고 즉시 별표 치고 2회독으로 넘기는 '쿨다운 타임아웃 룰'을 기계적으로 실천하세요.`,
    clinicalOpinion: `호흡 기반 미주신경 자극 훈련(Vagus Nerve Stimulation)과 시험 불안 인지 재구조화 상담이 강력히 추천됩니다.`
  }
};

// 기본 폴백 데이터 (그 외 케어타입 공통)
export const DEFAULT_CARE_INSIGHT: DetailedCareInsight = {
  overviewAnalysis: `현재 검사 결과는 뇌신체 생체 균형 및 인지 활력 지표가 복합적으로 작용하고 있는 상태입니다. 입력된 설문과 인지 실측 데이터를 교차 검증하여 도출된 세부 영역별 처방전을 충실히 이행할 때 최상의 수험 컨디션을 확보할 수 있습니다.`,
  ansInterpretation: `자율신경계 조절력 점검 결과, 주간 집중 시간대와 야간 수면 이완 주기 간의 리듬 동기화가 요구됩니다. 교감신경의 건강한 각성과 부교감신경의 깊은 회복이 유기적으로 순환해야 합니다.`,
  stressInterpretation: `생체 스트레스 지수가 수험 스트레스로 인해 주의 단계에 위치해 있습니다. 호르몬 리듬과 규칙적인 영양 섭취로 스트레스 저항성을 보강하세요.`,
  studyDensityAnalysis: `순공 학습 시간과 집중 밀도를 유지하기 위해 50분 집중 / 10분 이완의 규칙적인 블록 스케줄링이 필요합니다.`,
  vulnerableTimeStrategy: `오후 에너지 급락 시간대에 가벼운 산책이나 스트레칭, 커피냅(20분) 루틴을 적용하여 두뇌 각성도를 재부팅하세요.`,
  examDayStrategy: `시험 당일 일정한 기상 시간과 따뜻한 아침 식사, 심호흡 이완을 통해 최고의 뇌파 밸런스를 유지하세요.`,
  neuroMechanism: `전두엽 도파민/노르에피네프린 대사를 최적화하기 위해 비타민 B군과 고단백 아침 식단을 유지하는 것이 인지 지구력의 핵심입니다.`,
  killerHacks: `고난도 문항 접근 시 발문의 조건을 분해하여 시각화하고 최단 풀이 경로를 설정한 후 접근하세요.`,
  clinicalOpinion: `정기적인 바이오리듬 체크와 수면 골든타임 준수를 통해 수능 당일까지 흔들리지 않는 멘탈을 완성하세요.`
};

export function getFullCareInsight(careType: string): DetailedCareInsight {
  return FULL_CARETYPE_INSIGHTS[careType] || FULL_CARETYPE_INSIGHTS['BURNOUT'] || DEFAULT_CARE_INSIGHT;
}
