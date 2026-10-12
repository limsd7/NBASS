// 12대 CareType & 성적 연계 수능 1·2·3년 듀얼트랙 로드맵 생성 및 관리 엔진
import {
  StudentInfo,
  GradeRecord,
  RoadmapDuration,
  StudentRoadmap,
  RoadmapPhase,
  RoadmapMilestone,
  RoadmapInputSnapshot
} from '../types';
import { getCareTypeDetail, normalizeCareTypeCode } from '../data/careTypesData';
import { SUNEUNG_SUBJECTS } from '../data/suneungSubjects';

/**
 * 12대 CareType별 4분기 핵심 두뇌 케어 가이드라인 매트릭스
 */
const CARE_TYPE_ROADMAP_TRACKS: Record<string, {
  q1: { title: string; desc: string; hours: number };
  q2: { title: string; desc: string; hours: number };
  q3: { title: string; desc: string; hours: number };
  q4: { title: string; desc: string; hours: number };
}> = {
  BURNOUT: {
    q1: { title: '교감신경 감압 & 편도체 안정화 루틴', desc: '의자 등받이 깊숙이 기대고 생리적 한숨(5회) 습관화, 책상 착수 시 심박수 80bpm 이하 유지', hours: 3 },
    q2: { title: '6월 모의평가 전 두뇌 방전 방지 완충 주간', desc: '무리한 철야 금지, 50분 공부 후 10분 먼 산 응시, 뇌압 상승 시 목·어깨 이완 스트레칭', hours: 4 },
    q3: { title: '여름 슬럼프 극복 딥워크 & 도파민 재충전', desc: '낮 시간 멍때림 없는 순공 4시간 확보, 카페인 음료 감축 및 마그네슘/비타민B 섭취', hours: 4 },
    q4: { title: '수능 당일 편도체 과열 차단 & 실전 바이오리듬', desc: '수능 시간표(08:40 시작)에 맞춰 기상 후 2시간 뒤 뇌 각성 피크가 오도록 수면 패턴 고정', hours: 5 }
  },
  ANXIETY_TENSION: {
    q1: { title: '시험 불안(Freezing) 방어 4-7-8 호흡 체화', desc: '취약단원 문제 풀기 전 미주신경 자극 호흡 3세트 실시, "틀려도 뇌 신경망이 자란다" 자기 확언', hours: 3 },
    q2: { title: '실전 압박 노출 훈련 & 심박 안정화', desc: '주 1회 OMR 카드 마킹 및 소음 환경 모의고사 풀이로 시험장 불안 뇌파(High-Beta) 완화', hours: 4 },
    q3: { title: '9월 모평 멘탈 디버깅 & 오답 자책 차단', desc: '실수 문항을 인지적 재구성으로 분석하여 편도체 흥분 가라앉히기, 조건 밑줄 긋기 습관화', hours: 4 },
    q4: { title: '수능 1교시 국어 멘붕 방지 멘탈 앵커링', desc: '시험지 배부 직후 30초 눈감고 심호흡 루틴, 킬러 문항 앞에서 패닉 없이 넘기는 인지 유연성', hours: 5 }
  },
  LOW_ENERGY: {
    q1: { title: '도파민 마이크로 부스팅 & 착수 저항 제로화', desc: '책상에 앉자마자 A단계 3초 문제 1개 풀기로 시작 쾌감 유도, 기립 스트레칭 30초', hours: 3 },
    q2: { title: '기초 신체 활력도 증진 & 유산소 루틴', desc: '매일 오후 15분 햇빛 쬐며 빠른 걸음 산책, 부교감 우세 무기력 탈출을 위한 심박수 자극', hours: 4 },
    q3: { title: '주간 초소형 퀘스트 달성 & 시각 보상 누적', desc: '일일 스터디 플래너 달성 스티커 부착으로 뇌의 보상 회로(복측선조체) 가동률 극대화', hours: 4 },
    q4: { title: '수능 100분 연속 인지 스태미나 완성', desc: '당일 포도당 캔디 준비, 4교시 탐구까지 집중력이 꺼지지 않는 포도당 대사 리듬 유지', hours: 5 }
  },
  ATTENTION_DEFICIT: {
    q1: { title: '15분 타임어택 인터벌 & 시각 노이즈 차단', desc: '책상 위 스마트폰 격리, 15분 스톱워치로 잡생각 차단 훈련 및 백지 복습 인출', hours: 3 },
    q2: { title: '작업기억 과부하 방지 메모 습관 정착', desc: '긴 문장제 수학/비문학 문제 풀 때 조건 번호 매기기(1, 2, 3) 및 계산 암산 금지', hours: 4 },
    q3: { title: '집중 지속 시간 점진적 확장 (25분 ➔ 50분)', desc: '사다리 5문항 완수 블록을 연달아 2세트 수행하며 주의력 유지 시간 주당 5분씩 증대', hours: 4 },
    q4: { title: '수능 마킹 실수 제로 & 검토 정밀 모드', desc: '시험 종료 10분 전 반드시 마킹 검토 루틴 체화, 문제의 "옳지 않은 것" 강조 확인', hours: 5 }
  },
  BRAIN_FATIGUE: {
    q1: { title: '글림프 뇌 대사 청소 & 스크린 타임 격리', desc: '취침 1시간 전 스마트폰 끄기, 50분 공부 후 10분 눈 감기(절대 릴스/쇼츠 금지)', hours: 3 },
    q2: { title: '안구 도약 운동(Saccades) & Brain Fog 해소', desc: '멍할 때 벽 모서리 시선 이동 운동으로 전두엽 안야(FEF) 자극, 미온수 하루 1.5L 음용', hours: 4 },
    q3: { title: '작업기억 최적화 & 단순 계산 실수 클리닉', desc: '풀이 과정을 여백에 줄 맞춰 적기, 뇌 피로 시간대(오후 3~5시) 가벼운 오답 정리 배치', hours: 4 },
    q4: { title: '수능 전날 최적 뇌 휴식 & 두뇌 명료화', desc: '전날 무리한 암기 지양, 뇌 림프 순환을 돕는 깊은 8시간 숙면으로 인출 회로 100% 가동', hours: 5 }
  },
  SLEEP: {
    q1: { title: '수면 골든타임(23시~06시) 사수 & 조명 조절', desc: '야간 공부 금지, 아침 7시 기상 후 15분 햇빛 쬐기로 멜라토닌 분비 주기 정상화', hours: 3 },
    q2: { title: '낮 졸음(EDS) 극복 20분 파워냅 루틴', desc: '점심 식사 후 20분 의자 낮잠으로 오후 학습 각성도 30% 증진, 고카페인 음료 차단', hours: 4 },
    q3: { title: '수면 NREM 깊은 수면 25% 확보', desc: '자기 전 따뜻한 족욕 및 4-7-8 호흡, 침실 온도 19~21도 유지로 뇌 피로 완전 회복', hours: 4 },
    q4: { title: '수능 기상 시간 완벽 동기화 (기상 6시)', desc: '수능 한 달 전부터 6시 기상 습관화, 8시 40분 1교시 시작 시점에 뇌가 완전히 깨어있도록 세팅', hours: 5 }
  },
  ADRENAL: {
    q1: { title: '코르티솔 리듬 회복 & 카페인 단계적 감량', desc: '기상 후 30분 이내 햇빛 10분, 오후 2시 이후 카페인 금지, 밤 10시 취침 고정으로 아침 각성 복원', hours: 3 },
    q2: { title: '오후 방전 대비 에너지 분할 배치', desc: '오후 4시 전후 고난도 학습 금지, 가벼운 오답 정리와 10분 파워냅으로 방전 구간 완충', hours: 4 },
    q3: { title: '부신 회복기 학습량 파도타기', desc: '컨디션 좋은 오전에 핵심 진도, 오후는 복습 위주로 배치하여 누적 피로 없이 진도 유지', hours: 4 },
    q4: { title: '수능 당일 각성 피크 오전 고정', desc: '시험 2주 전부터 6시 30분 기상·밤 11시 취침 리듬으로 1교시 각성 피크 동기화', hours: 5 }
  },
  STRESS_OVERLOAD: {
    q1: { title: '자극 차단 학습 환경 셋업 & 긴장 이완', desc: '독립 공간·백색소음 확보, 학습 전 1분 어깨·목 스트레칭으로 교감신경 과항진 완화', hours: 3 },
    q2: { title: '6월 모평 대비 압박 분산 루틴', desc: '모의고사는 실전 80% 강도로 주 1회만, 나머지는 단원별 분할 풀이로 스트레스 노출량 조절', hours: 4 },
    q3: { title: '여름철 예민도 관리 & 휴식 처방', desc: '50분 집중 후 무조건 10분 휴식(화면 금지), 짜증·산만 신호 시 즉시 장소 전환 규칙', hours: 4 },
    q4: { title: '수능 당일 긴장 안정화 앵커', desc: '교시 사이 3분 복식호흡 루틴 고정, 쉬는 시간 스마트폰 확인 금지로 자극 누수 차단', hours: 5 }
  },
  DEPRESSION_AMOTIVATION: {
    q1: { title: '초소형 성취 퀘스트 & 도파민 재가동', desc: '하루 15분·문제 5개 같은 최소 과제로 매일 달성 체크, 달성 스티커로 보상 회로 자극', hours: 3 },
    q2: { title: '성취 기록 누적 & 학습 의미 연결', desc: '주간 오답 감소량·맞힌 개수 그래프화로 "늘고 있다"는 증거를 눈에 보이게 축적', hours: 4 },
    q3: { title: '9월 모평 대비 작은 승리 설계', desc: '목표를 등급이 아닌 "취약 1순위 오답률 절반" 같은 통제 가능 지표로 재설정', hours: 4 },
    q4: { title: '수능 당일 "할 수 있는 것만" 전략', desc: '킬러 집착 금지·아는 문제 무감점 루틴으로 실전 성취감을 최대화하는 운영 전략', hours: 5 }
  },
  HYPERSENSITIVE: {
    q1: { title: '시각·청각 노이즈 제로 책상 & 감각 차단', desc: '책상 위 교재 1권만, 귀마개·가림막 활용, 알림 전면 차단으로 주의 자원 보호', hours: 3 },
    q2: { title: '단일 과제 몰입 블록 & 전환 의식', desc: '과목 전환 시 2분 정리 루틴(책상 리셋+심호흡)으로 잔여 자극을 끊고 다음 블록 진입', hours: 4 },
    q3: { title: '고자극 시기(9모 전후) 자극 다이어트', desc: '학원·스터디카페 대신 1인실 위주, SNS·쇼츠 시청 시간을 절반으로 제한', hours: 4 },
    q4: { title: '수능장 감각 과부하 대비 루틴', desc: '예비 마킹·시험지 넘김 등 손 루틴을 고정하여 낯선 환경 자극에도 자동 조종 유지', hours: 5 }
  },
  CIRCULATION: {
    q1: { title: '1시간마다 3분 혈류 펌프 루틴', desc: '발목 펌프·제자리 걷기·따뜻한 온수 섭취로 뇌 혈류 공급 유지, 장시간 앉아있기 금지', hours: 3 },
    q2: { title: '6월 모평 대비 두뇌 산소 루틴', desc: '모의고사 전 가벼운 스트레칭과 수분 500mL 섭취로 후반 집중력 저하 방지', hours: 4 },
    q3: { title: '여름철 냉방·수분 밸런스 관리', desc: '과도한 냉방 자제·수시 수분 보충, 손발 저림 신호 시 즉시 기립 스트레칭', hours: 4 },
    q4: { title: '수능 당일 컨디션 유지 프로토콜', desc: '교시 사이 가벼운 목 돌리기와 온수 섭취, 점심 과식 금지로 식곤증·뇌 무거움 차단', hours: 5 }
  },
  HEALTHY: {
    q1: { title: '최적 딥플로우 셋업 & 심화 개념 완주', desc: '흔들림 없는 자율신경 균형 유지, 하루 순공 8시간 몰입 루틴 체화', hours: 4 },
    q2: { title: '수능 실전 100분 연속 풀블록 지구력 훈련', desc: '수학 100분, 국어 80분 시험 시간 동안 지치지 않고 킬러를 공략하는 뇌 신경망 강화', hours: 5 },
    q3: { title: '고난도 킬러 2가지 이상 풀이법 탐색', desc: '준킬러/킬러 문항을 다각도로 분석하여 전두엽의 창의적 문제 해결 알고리즘 극대화', hours: 5 },
    q4: { title: '수능 만점 피크 퍼포먼스 마인드셋', desc: '최상의 컨디션으로 실전 수능 100% 역량 발휘, 흔들림 없는 멘탈 챔피언 유지', hours: 6 }
  }
};

/**
 * 적응형 로드맵 생성 옵션 (규칙 뼈대 개인화 입력)
 */
export interface RoadmapGenOptions {
  primaryScore?: number;       // CareType 주분류 점수 (0-100, neuro 강도 조절용)
  focusSubjectIds?: string[];  // 집중 취약 과목 ID (시간 가중용)
}

// 과목별 적응 계획 (등급 궤적 + 페이스 + 시간 계수)
export interface SubjectAdaptivePlan {
  subjectId: string;
  current: number;
  finalTarget: number;
  pace: 'maintain' | 'step' | 'foundation'; // 유지·심화 / 단계적 / 기초재건
  hourFactor: number; // 0.8 ~ 1.4
  trend: 'improving' | 'stable' | 'declining';
}

const clampGrade9 = (v: unknown): number | null => {
  const n = typeof v === 'number' ? v : Number(v);
  if (!Number.isFinite(n)) return null;
  const r = Math.round(n);
  return r >= 1 && r <= 9 ? r : null;
};

const scaleHours = (base: number, factor: number): number => {
  const b = Number.isFinite(base) ? base : 4;
  const f = Number.isFinite(factor) ? Math.max(0.8, Math.min(1.4, factor)) : 1;
  return Math.max(2, Math.min(10, Math.round(b * f * 2) / 2));
};

// 과목 ID → 수능 카테고리 (단원 오분류 방지용, SUNEUNG_SUBJECTS 기준)
const subjectCategoryOf = (subjectId: string): string => {
  const found = SUNEUNG_SUBJECTS.find(s => s.id === subjectId);
  return found ? found.category : 'common';
};

// 성적 기록에서 과목군별 취약단원 추출 (탐구는 inquiry 버킷으로 분리)
export function extractWeakUnitsByBucket(records: GradeRecord[]): {
  korean: string[]; math: string[]; english: string[]; inquiry: string[];
} {
  const buckets: { korean: string[]; math: string[]; english: string[]; inquiry: string[] } =
    { korean: [], math: [], english: [], inquiry: [] };
  if (!Array.isArray(records)) return buckets;
  const push = (arr: string[], u: unknown) => {
    if (typeof u !== 'string' || !u.trim()) return;
    if (!arr.includes(u)) arr.push(u);
  };
  for (const r of records) {
    if (!r || !Array.isArray((r as any).subjects)) continue;
    for (const s of (r as any).subjects) {
      const units = (s as any)?.weakUnits;
      if (!Array.isArray(units) || units.length === 0) continue;
      const cat = subjectCategoryOf((s as any)?.subjectId || '');
      const sid = String((s as any)?.subjectId || '');
      const bucket =
        sid === 'korean' || cat === 'required' ? buckets.korean :
        sid === 'math' ? buckets.math :
        sid === 'english' ? buckets.english :
        (cat === 'social' || cat === 'science') ? buckets.inquiry :
        sid === 'korean' ? buckets.korean :
        sid === 'english' ? buckets.english : buckets.math;
      for (const u of units) push(bucket, u);
    }
  }
  return buckets;
}

// 과목별 최근 등급 추세 (숫자 상승=악화 기준 가중 추세선)
const gradeTrendOf = (records: GradeRecord[], subjectId: string): 'improving' | 'stable' | 'declining' => {
  if (!Array.isArray(records)) return 'stable';
  const timeOf = (d: unknown): number => {
    const t = new Date(d as string).getTime();
    return Number.isFinite(t) ? t : Number.NEGATIVE_INFINITY;
  };
  const past = [...records]
    .filter(r => Number.isFinite(new Date((r as any)?.examDate as string).getTime()))
    .sort((a, b) => timeOf((b as any).examDate) - timeOf((a as any).examDate))
    .map(r => clampGrade9((r.subjects || []).find(s => s?.subjectId === subjectId)?.grade))
    .filter((g): g is number => g !== null)
    .slice(0, 5);
  if (past.length < 2) return 'stable';
  let total = 0; let wSum = 0;
  for (let i = 0; i < past.length - 1; i++) {
    const w = past.length - 1 - i;
    total += (past[i] - past[i + 1]) * w;
    wSum += w;
  }
  const slope = wSum > 0 ? total / wSum : 0;
  if (!Number.isFinite(slope)) return 'stable';
  if (slope > 0.5) return 'declining';
  if (slope < -0.5) return 'improving';
  return 'stable';
};

// 등급 갭 기반 페이스 결정 (유지·심화 / 단계적 / 기초재건)
const paceOf = (current: number): SubjectAdaptivePlan['pace'] => {
  const gap = current - 1;
  if (gap <= 1) return 'maintain';
  if (gap <= 3) return 'step';
  return 'foundation';
};

const PACE_LABEL: Record<SubjectAdaptivePlan['pace'], string> = {
  maintain: '유지·킬러 심화',
  step: '단계적 등급 상승',
  foundation: '기초 재건 우선'
};

// 과목별 적응 계획 생성 (목표치·시간계수 일괄 산출)
export function planSubjectAdaptive(
  subjectId: string,
  currentGrade: number,
  records: GradeRecord[],
  duration: RoadmapDuration,
  focusSubjectIds: string[] = []
): SubjectAdaptivePlan {
  const current = clampGrade9(currentGrade) ?? 3;
  const pace = paceOf(current);
  const steps = duration === '1year' ? 1 : 2;
  const finalTarget = pace === 'maintain' ? current : Math.max(1, current - Math.min(steps, current - 1));
  const trend = gradeTrendOf(records, subjectId);
  const gap = current - finalTarget;
  let factor = 1 + 0.1 * Math.min(3, gap) + (trend === 'declining' ? 0.2 : trend === 'improving' ? -0.1 : 0);
  if (focusSubjectIds.includes(subjectId)) factor += 0.15;
  if (pace === 'foundation') factor += 0.1;
  factor = Math.max(0.8, Math.min(1.4, factor));
  return { subjectId, current, finalTarget, pace, hourFactor: factor, trend };
}

export const paceLabelOf = (pace: SubjectAdaptivePlan['pace']): string => PACE_LABEL[pace];

// 생성 입력 스냅샷 (stale 감지용)
export function buildRoadmapSnapshot(
  careTypeCode: string,
  primaryScore: number | undefined,
  records: GradeRecord[],
  latestGrades: Map<string, number>
): RoadmapInputSnapshot {
  const validDates = (Array.isArray(records) ? records : [])
    .map(r => new Date((r as any)?.examDate as string).getTime())
    .filter(t => Number.isFinite(t))
    .sort((a, b) => a - b);
  const g = (k: string): number | null => {
    const v = latestGrades?.get(k);
    return typeof v === 'number' && Number.isFinite(v) ? v : null;
  };
  return {
    careTypeCode: String(careTypeCode || 'HEALTHY'),
    primaryScore: typeof primaryScore === 'number' && Number.isFinite(primaryScore) ? primaryScore : undefined,
    recordCount: Array.isArray(records) ? records.length : 0,
    latestExamDate: validDates.length > 0 ? new Date(validDates[validDates.length - 1]).toISOString().slice(0, 10) : undefined,
    gradesKey: `${g('korean') ?? '-'}/${g('math') ?? '-'}/${g('english') ?? '-'}`
  };
}

// 스냅샷 비교 (하나라도 다르면 재생성 대상)
export function isRoadmapSnapshotStale(prev: RoadmapInputSnapshot | undefined, next: RoadmapInputSnapshot): boolean {
  if (!prev) return true;
  return prev.careTypeCode !== next.careTypeCode ||
    (prev.primaryScore ?? -1) !== (next.primaryScore ?? -1) ||
    prev.recordCount !== next.recordCount ||
    (prev.latestExamDate || '') !== (next.latestExamDate || '') ||
    prev.gradesKey !== next.gradesKey;
}

// 완료상태·커스텀 보존 병합 재생성 (같은 id는 완료 유지, 커스텀은 이관)
export function mergeRoadmapProgress(prev: StudentRoadmap, fresh: StudentRoadmap): StudentRoadmap {
  const doneIds = new Set<string>();
  const customByPhase = new Map<string, RoadmapMilestone[]>();
  for (const p of prev.phases || []) {
    for (const m of p.milestones || []) {
      if (m.isCompleted) doneIds.add(m.id);
      if (m.isCustom) {
        const arr = customByPhase.get(p.id) || [];
        arr.push({ ...m, isCompleted: false });
        customByPhase.set(p.id, arr);
      }
    }
  }
  const phases = fresh.phases.map(p => {
    const milestones = p.milestones.map(m => (doneIds.has(m.id) ? { ...m, isCompleted: true } : m));
    const customs = (customByPhase.get(p.id) || []).filter(c => !milestones.some(m => m.id === c.id));
    // 동일 제목 커스텀 중복 방지
    const titles = new Set(milestones.map(m => m.title));
    const merged = [...milestones];
    for (const c of customs) {
      if (!titles.has(c.title)) {
        merged.push(c);
        titles.add(c.title);
      }
    }
    return { ...p, milestones: merged };
  });
  // 기존에만 있던 phase의 커스텀 마일스톤은 첫 phase에 이관하지 않고 그대로 두지 않음 (id 체계 변경 시 유실 방지용으로 fresh 기준 유지)
  let total = 0; let done = 0;
  for (const p of phases) for (const m of p.milestones) { total++; if (m.isCompleted) done++; }
  return {
    ...fresh,
    id: prev.id,
    createdAt: prev.createdAt,
    phases,
    customNotes: fresh.customNotes ?? prev.customNotes,
    overallProgress: total > 0 ? Math.round((done / total) * 100) : 0,
    updatedAt: new Date().toISOString()
  };
}

// 시간 가중 후처리 (분기 템플릿 골격 유지, 시간만 개인화)
function applyAdaptiveHours(
  phases: RoadmapPhase[],
  factors: Record<string, number>,
  neuroBoost: number
): RoadmapPhase[] {
  return phases.map(p => ({
    ...p,
    milestones: p.milestones.map(m => {
      if (m.track === 'neuro') {
        const base = typeof m.targetHoursPerWeek === 'number' ? m.targetHoursPerWeek : 3;
        return { ...m, targetHoursPerWeek: scaleHours(base + neuroBoost, 1) };
      }
      const f = factors[m.subjectId || ''] ?? 1;
      const base = typeof m.targetHoursPerWeek === 'number' ? m.targetHoursPerWeek : 4;
      return { ...m, targetHoursPerWeek: scaleHours(base, f) };
    })
  }));
}

// (선택) LLM 문구 다듬기: 구조·시간·ID 불변, phase 목표 문구만 개선. 실패 시 원본 반환.
export async function polishRoadmapWithAI(
  roadmap: StudentRoadmap,
  aiModels: unknown,
  generateFn?: (prompt: string, system: string) => Promise<string>
): Promise<StudentRoadmap> {
  try {
    if (!roadmap || !Array.isArray(roadmap.phases)) return roadmap;
    const input = roadmap.phases.map(p => ({
      phaseNumber: p.phaseNumber,
      academicGoal: p.academicGoal,
      neuroCareGoal: p.neuroCareGoal
    }));
    const prompt = `다음 수능 로드맵 분기 목표 문구를 학생·학부모가 읽기 쉽도록 다듬어주세요. 분기 수와 순서를 바꾸지 말고, 각 분기의 academicGoal/neuroCareGoal만 1~2문장으로 다듬어 JSON 배열로 반환하세요(키는 phaseNumber, academicGoal, neuroCareGoal만).\n${JSON.stringify(input)}`;
    let text = '';
    if (generateFn) {
      text = await generateFn(prompt, '당신은 입시 학습 컨설턴트입니다. JSON 배열만 반환하세요.');
    } else {
      const { generateAIResponse } = await import('./aiService');
      const res: any = await generateAIResponse(prompt, '당신은 입시 학습 컨설턴트입니다. JSON 배열만 반환하세요.', aiModels as any, 'premium');
      text = res?.text || '';
    }
    const start = text.indexOf('[');
    const end = text.lastIndexOf(']');
    if (start < 0 || end <= start) return roadmap;
    const parsed = JSON.parse(text.slice(start, end + 1));
    if (!Array.isArray(parsed)) return roadmap;
    const byPhase = new Map<number, any>(parsed.map((p: any) => [Number(p?.phaseNumber), p]));
    return {
      ...roadmap,
      phases: roadmap.phases.map(p => {
        const polished = byPhase.get(p.phaseNumber);
        if (!polished) return p;
        return {
          ...p,
          academicGoal: typeof polished.academicGoal === 'string' && polished.academicGoal.trim() ? polished.academicGoal.trim() : p.academicGoal,
          neuroCareGoal: typeof polished.neuroCareGoal === 'string' && polished.neuroCareGoal.trim() ? polished.neuroCareGoal.trim() : p.neuroCareGoal
        };
      }),
      updatedAt: new Date().toISOString()
    };
  } catch {
    return roadmap;
  }
}

/**
 * 1년, 2년, 3년 수능 준비 기간별 AI 맞춤 듀얼트랙 로드맵 템플릿 생성기
 */
export function generateAdaptiveRoadmap(
  student: StudentInfo,
  duration: RoadmapDuration = '1year',
  careTypeCode: string = 'HEALTHY',
  records: GradeRecord[] = [],
  latestGrades: Map<string, number> = new Map(),
  options: RoadmapGenOptions = {}
): StudentRoadmap {
  // CareType 정규화 (enum 한글명·코드 모두 코드로 통일, 미상→UNASSESSED→HEALTHY 트랙)
  const normalized = normalizeCareTypeCode(careTypeCode);
  const trackKey = normalized === 'UNASSESSED' ? 'HEALTHY' : normalized;
  const careTracks = CARE_TYPE_ROADMAP_TRACKS[trackKey] || CARE_TYPE_ROADMAP_TRACKS['HEALTHY'];
  const careDetail = getCareTypeDetail(trackKey);
  const primaryScore = typeof options.primaryScore === 'number' && Number.isFinite(options.primaryScore)
    ? Math.max(0, Math.min(100, options.primaryScore))
    : undefined;
  const focusIds = Array.isArray(options.focusSubjectIds) ? options.focusSubjectIds : [];

  // 1. 학생의 등록된 과목별 취약단원 추출 (카테고리 기준, 탐구 분리)
  const buckets = extractWeakUnitsByBucket(records);
  const koreanWeakUnits = buckets.korean;
  const mathWeakUnits = buckets.math;
  const englishWeakUnits = buckets.english;
  const inquiryWeakUnits = buckets.inquiry;

  const korWeak1 = koreanWeakUnits[0] || '[독서] 과학·기술 고난도 메커니즘 지문';
  const korWeak2 = koreanWeakUnits[1] || '[문학] 고전시가·고전산문 융합';
  const korWeak3 = koreanWeakUnits[2] || '[독서] 사회·경제·법률 복합 지문';

  const mathWeak1 = mathWeakUnits[0] || '[수학I] 등차수열과 등비수열의 일반항 & 합';
  const mathWeak2 = mathWeakUnits[1] || '[수학II] 도함수의 활용 (접선, 극대·극소)';
  const mathWeak3 = mathWeakUnits[2] || '[수학II] 부정적분과 정적분의 계산';

  const engWeak1 = englishWeakUnits[0] || '[수능 킬러] 빈칸추론 31~34번';
  const engWeak2 = englishWeakUnits[1] || '[수능 킬러] 글의 순서 배열 & 문장 삽입';
  const engWeak3 = englishWeakUnits[2] || '[어법·어휘] 29번 어법 & 30번 밑줄 어휘';

  const currentKorGrade = clampGrade9(latestGrades.get('korean')) ?? 3;
  const currentMathGrade = clampGrade9(latestGrades.get('math')) ?? 3;
  const currentEngGrade = clampGrade9(latestGrades.get('english')) ?? 2;

  // 과목별 적응 계획 (목표·페이스·시간계수)
  const korPlan = planSubjectAdaptive('korean', currentKorGrade, records, duration, focusIds);
  const mathPlan = planSubjectAdaptive('math', currentMathGrade, records, duration, focusIds);
  const engPlan = planSubjectAdaptive('english', currentEngGrade, records, duration, focusIds);

  const targetKorGrade = korPlan.finalTarget;
  const targetMathGrade = mathPlan.finalTarget;
  const targetEngGrade = engPlan.finalTarget;

  // 분기 목표 등급 보간 (1년 4분기 / 2년 8분기 / 3년 12분기 공용)
  const totalPhaseCount = duration === '1year' ? 4 : duration === '2year' ? 8 : 12;
  const phaseTargetOf = (plan: SubjectAdaptivePlan, phaseIdx: number): number => {
    if (plan.pace === 'maintain') return plan.current;
    const steps = plan.current - plan.finalTarget;
    if (steps <= 0) return plan.current;
    const done = Math.min(phaseIdx + 1, totalPhaseCount);
    const drop = Math.round((steps * done) / totalPhaseCount);
    return Math.max(plan.finalTarget, plan.current - drop);
  };

  const currentYear = new Date().getFullYear();
  let phases: RoadmapPhase[] = [];

  // =========================================================================
  // 1. 수능 1년 준비 로드맵 (고3 / N수생, 4개 분기) - 국·수·영 전 과목 듀얼트랙
  // =========================================================================
  if (duration === '1year') {
    phases = [
      {
        id: `p_1y_1`,
        phaseNumber: 1,
        title: '1분기: 기초 체화 & 국·수·영 취약 1순위 단원 사다리 돌파',
        periodLabel: '겨울방학 (12월 ~ 2월)',
        targetDDay: 'D-300',
        academicGoal: `국어('${korWeak1}') 구조독해, 수학('${mathWeak1}') A~C단계 정복, 영어('${engWeak1}') 구문 완성`,
        neuroCareGoal: `${careDetail.title}: ${careTracks.q1.title}`,
        milestones: [
          {
            id: `m_1y_1_kor`,
            phaseId: `p_1y_1`,
            track: 'academic',
            subjectId: 'korean',
            title: `[국어] 취약 1순위 '${korWeak1}' 문단 구조독해 & A·B단계 사다리 완수`,
            description: '정보량이 많은 비문학/문학에서 중심 문장과 인과관계를 맵핑하며 지문 독해 스태미나 30% 증대',
            targetUnit: korWeak1,
            targetHoursPerWeek: 4,
            isCompleted: false,
            dueDate: '1월 20일'
          },
          {
            id: `m_1y_1_math`,
            phaseId: `p_1y_1`,
            track: 'academic',
            subjectId: 'math',
            title: `[수학] 취약 1순위 '${mathWeak1}' 기본·진행 사다리 10문항 완수`,
            description: 'A단계(개념 5문항)와 B단계(진행 5문항)를 오답 없이 완주하여 4점 진입 기초 알고리즘 완성',
            targetUnit: mathWeak1,
            targetHoursPerWeek: 6,
            isCompleted: false,
            dueDate: '1월 31일'
          },
          {
            id: `m_1y_1_eng`,
            phaseId: `p_1y_1`,
            track: 'academic',
            subjectId: 'english',
            title: `[영어] 취약 1순위 '${engWeak1}' 구문 분석 & 핵심 기출 패턴 10문항`,
            description: '복잡한 3줄 이상 긴 문장의 주어-동사 축을 식별하고 수능 빈출 어휘 1,000단어 마스터',
            targetUnit: engWeak1,
            targetHoursPerWeek: 4,
            isCompleted: false,
            dueDate: '2월 15일'
          },
          {
            id: `m_1y_1_neuro`,
            phaseId: `p_1y_1`,
            track: 'neuro',
            subjectId: 'all',
            title: `[두뇌 케어] ${careTracks.q1.title}`,
            description: careTracks.q1.desc,
            targetHoursPerWeek: careTracks.q1.hours,
            isCompleted: false,
            dueDate: '상시 실천'
          }
        ]
      },
      {
        id: `p_1y_2`,
        phaseNumber: 2,
        title: '2분기: EBS 수특 연계 & 6월 모의평가 전 과목 목표 등급 진입',
        periodLabel: '1학기 및 6모 (3월 ~ 6월)',
        targetDDay: 'D-200',
        academicGoal: `평가원 5개년 기출 코드 체화: 국어 ${targetKorGrade}등급, 수학 ${targetMathGrade}등급, 영어 ${targetEngGrade}등급 진입`,
        neuroCareGoal: `${careDetail.title}: ${careTracks.q2.title}`,
        milestones: [
          {
            id: `m_1y_2_kor`,
            phaseId: `p_1y_2`,
            track: 'academic',
            subjectId: 'korean',
            title: `[국어] EBS 수능특강 연계 문학 총정리 & 6모 대비 80분 타임어택`,
            description: '연계 교재 현대시/고전시가 주제의식 100% 숙지 및 실전 80분 시간 배분 전략 완성',
            targetUnit: korWeak2,
            targetHoursPerWeek: 5,
            isCompleted: false,
            dueDate: '5월 10일'
          },
          {
            id: `m_1y_2_math`,
            phaseId: `p_1y_2`,
            track: 'academic',
            subjectId: 'math',
            title: `[수학] D단계 기출 변형 5문항 마스터 & 4점 기출 3회독`,
            description: '수능 빈출 유형을 직관적으로 파악하고 정형화된 풀이 시간 15% 단축',
            targetUnit: mathWeak2,
            targetHoursPerWeek: 7,
            isCompleted: false,
            dueDate: '5월 25일'
          },
          {
            id: `m_1y_2_eng`,
            phaseId: `p_1y_2`,
            track: 'academic',
            subjectId: 'english',
            title: `[영어] 취약 2순위 '${engWeak2}' 순서/삽입 논리 Gap 탐색 & 1등급 안정화`,
            description: '지시어(This, Such)와 연결사(However, Instead) 단절 추적으로 비연계 고난도 문항 극복',
            targetUnit: engWeak2,
            targetHoursPerWeek: 4,
            isCompleted: false,
            dueDate: '6월 모평 전'
          },
          {
            id: `m_1y_2_neuro`,
            phaseId: `p_1y_2`,
            track: 'neuro',
            subjectId: 'all',
            title: `[두뇌 케어] ${careTracks.q2.title}`,
            description: careTracks.q2.desc,
            targetHoursPerWeek: careTracks.q2.hours,
            isCompleted: false,
            dueDate: '6월 말까지'
          }
        ]
      },
      {
        id: `p_1y_3`,
        phaseNumber: 3,
        title: '3분기: E단계 준킬러 정복 & 9월 모의평가 실전 1등급 스퍼트',
        periodLabel: '여름방학 및 9모 (7월 ~ 9월)',
        targetDDay: 'D-100',
        academicGoal: '고난도 비문학·준킬러 수학·3점 킬러 영어의 3대 허들 극복 및 9모 1등급 확보',
        neuroCareGoal: `${careDetail.title}: ${careTracks.q3.title}`,
        milestones: [
          {
            id: `m_1y_3_kor`,
            phaseId: `p_1y_3`,
            track: 'academic',
            subjectId: 'korean',
            title: `[국어] 고난도 비문학(경제/과학) E단계 <보기> 추론 & 킬러 지문 정복`,
            description: '변수 간의 상관관계(비례/반비례) 표 메모 및 3점 킬러 문항 5분 내 정확 풀이',
            targetUnit: korWeak3,
            targetHoursPerWeek: 5,
            isCompleted: false,
            dueDate: '8월 20일'
          },
          {
            id: `m_1y_3_math`,
            phaseId: `p_1y_3`,
            track: 'academic',
            subjectId: 'math',
            title: `[수학] E단계 준킬러 5문항 사다리 완수 및 오답 디버깅`,
            description: '숨겨진 제약 조건과 분기 케이스를 빠짐없이 탐색하는 전두엽 추론력 배양',
            targetUnit: mathWeak3,
            targetHoursPerWeek: 7,
            isCompleted: false,
            dueDate: '8월 30일'
          },
          {
            id: `m_1y_3_eng`,
            phaseId: `p_1y_3`,
            track: 'academic',
            subjectId: 'english',
            title: `[영어] 3점 킬러 빈칸추론(31~34번) 패러프레이징 치환 공식 체화`,
            description: '대주제의 역발상 및 반의어 함정 선지를 완벽히 소거하여 95점 이상 1등급 고정',
            targetUnit: engWeak1,
            targetHoursPerWeek: 4,
            isCompleted: false,
            dueDate: '9월 모평 전'
          },
          {
            id: `m_1y_3_neuro`,
            phaseId: `p_1y_3`,
            track: 'neuro',
            subjectId: 'all',
            title: `[두뇌 케어] ${careTracks.q3.title}`,
            description: careTracks.q3.desc,
            targetHoursPerWeek: careTracks.q3.hours,
            isCompleted: false,
            dueDate: '9월 말까지'
          }
        ]
      },
      {
        id: `p_1y_4`,
        phaseNumber: 4,
        title: '4분기: 전 과목 실전 봉투 모의고사 풀셋 & 수능 당일 바이오리듬',
        periodLabel: '수능 파이널 (10월 ~ 11월 수능일)',
        targetDDay: 'D-Day',
        academicGoal: '수능 전 영역(국어 80분 ➔ 수학 100분 ➔ 영어 70분 ➔ 탐구 60분) 실전 시간표 10회 완주',
        neuroCareGoal: `${careDetail.title}: ${careTracks.q4.title}`,
        milestones: [
          {
            id: `m_1y_4_kor`,
            phaseId: `p_1y_4`,
            track: 'academic',
            subjectId: 'korean',
            title: `[국어 1교시] 08:40 시작 실전 모의고사 10회분 & 멘붕 방지 앵커링`,
            description: '비문학 첫 지문 Freezing 차단 호흡 루틴 실전 적용 및 45문항 OMR 마킹 검토',
            targetUnit: korWeak1,
            targetHoursPerWeek: 5,
            isCompleted: false,
            dueDate: '10월 25일'
          },
          {
            id: `m_1y_4_math`,
            phaseId: `p_1y_4`,
            track: 'academic',
            subjectId: 'math',
            title: `[수학 2교시] 100분 연속 집중 킬러 E·F단계 풀이 및 계산 실수 제로화`,
            description: '10:30~12:10 수학 타임어택 시뮬레이션 및 여백 계산 줄 맞추기 정착',
            targetUnit: mathWeak1,
            targetHoursPerWeek: 6,
            isCompleted: false,
            dueDate: '11월 5일'
          },
          {
            id: `m_1y_4_eng`,
            phaseId: `p_1y_4`,
            track: 'academic',
            subjectId: 'english',
            title: `[영어 3교시] 13:10 점심 후 식곤증 극복 듣기평가 17문항 + 독해 완주`,
            description: '점심 식사 후 인지 각성 스트레칭 및 70분 내 45문항 안정적 완주 루틴 체화',
            targetUnit: engWeak2,
            targetHoursPerWeek: 4,
            isCompleted: false,
            dueDate: '수능 1주 전'
          },
          {
            id: `m_1y_4_neuro`,
            phaseId: `p_1y_4`,
            track: 'neuro',
            subjectId: 'all',
            title: `[두뇌 케어] ${careTracks.q4.title}`,
            description: careTracks.q4.desc,
            targetHoursPerWeek: careTracks.q4.hours,
            isCompleted: false,
            dueDate: '수능 당일'
          }
        ]
      }
    ];
  }

  // =========================================================================
  // 2. 수능 2년 준비 로드맵 (고2, 8개 분기) - 국·수·영 균형 발전
  // =========================================================================
  else if (duration === '2year') {
    const quarters = [
      { num: 1, label: '고2 1학기 봄 (3~4월)', dday: 'D-650', title: '고2 내신 수학I 개념 완성과 국·영 수능 기초', mathU: mathWeak1, korU: '국어 문법과 음운 변동', engU: '고1·2 구문 독해 축' },
      { num: 2, label: '고2 1학기 기말 (5~6월)', dday: 'D-580', title: '수학I 삼각함수와 국어 현대문학 심화', mathU: '삼각함수의 그래프와 주기성', korU: '현대시·현대소설 심층 감상', engU: '대의파악 주제·요지 추론' },
      { num: 3, label: '고2 여름방학 (7~8월)', dday: 'D-500', title: '수학II 함수의 극한 선행 & 비문학 독해 훈련', mathU: mathWeak2, korU: '학술 독서 인과 추론', engU: '어법 어휘 빈출 5대 포인트' },
      { num: 4, label: '고2 2학기 (9~11월)', dday: 'D-400', title: '수학II 도함수의 활용과 영어 빈칸추론 기초', mathU: mathWeak3, korU: '고전시가 필수 어휘 50선', engU: engWeak1 },
      { num: 5, label: '고3 겨울방학 (12~2월)', dday: 'D-300', title: '선택과목 완강 & 수능 전과목 기출 분석 1회독', mathU: mathWeak1, korU: korWeak1, engU: engWeak2 },
      { num: 6, label: '고3 1학기 (3~6월)', dday: 'D-200', title: '6월 모평 실전 및 D단계 기출 변형 체화', mathU: mathWeak2, korU: korWeak2, engU: engWeak1 },
      { num: 7, label: '고3 여름방학 (7~8월)', dday: 'D-100', title: 'E단계 준킬러 조건 추론 및 9모 1등급 대비', mathU: mathWeak3, korU: korWeak3, engU: engWeak2 },
      { num: 8, label: '고3 파이널 (9~11월)', dday: 'D-Day', title: 'F단계 수능 킬러 & 전 과목 실전 시뮬레이션', mathU: mathWeak1, korU: korWeak1, engU: engWeak1 }
    ];

    phases = quarters.map(q => ({
      id: `p_2y_${q.num}`,
      phaseNumber: q.num,
      title: `${q.num}분기: ${q.title}`,
      periodLabel: q.label,
      targetDDay: q.dday,
      academicGoal: `수학('${q.mathU}'), 국어('${q.korU}'), 영어('${q.engU}') 융합 마일스톤 완수`,
      neuroCareGoal: `${careDetail.title}: ${q.num <= 4 ? careTracks.q1.title : careTracks.q3.title}`,
      milestones: [
        {
          id: `m_2y_${q.num}_math`,
          phaseId: `p_2y_${q.num}`,
          track: 'academic',
          subjectId: 'math',
          title: `[수학] '${q.mathU}' 개념·응용 사다리 완수`,
          description: `핵심 단원인 '${q.mathU}'의 문제해결력 체계화`,
          targetUnit: q.mathU,
          targetHoursPerWeek: 6,
          isCompleted: false,
          dueDate: q.label
        },
        {
          id: `m_2y_${q.num}_kor`,
          phaseId: `p_2y_${q.num}`,
          track: 'academic',
          subjectId: 'korean',
          title: `[국어] '${q.korU}' 심화 분석 및 사다리 훈련`,
          description: `'${q.korU}' 파트의 기출 및 핵심 문항 오답률 0% 달성`,
          targetUnit: q.korU,
          targetHoursPerWeek: 4,
          isCompleted: false,
          dueDate: q.label
        },
        {
          id: `m_2y_${q.num}_eng`,
          phaseId: `p_2y_${q.num}`,
          track: 'academic',
          subjectId: 'english',
          title: `[영어] '${q.engU}' 논리 독해 및 구문 강화`,
          description: `'${q.engU}' 유형별 문제풀이 공식 체화 및 어휘 암기`,
          targetUnit: q.engU,
          targetHoursPerWeek: 3,
          isCompleted: false,
          dueDate: q.label
        },
        {
          id: `m_2y_${q.num}_neuro`,
          phaseId: `p_2y_${q.num}`,
          track: 'neuro',
          subjectId: 'all',
          title: `[두뇌 케어] ${q.num % 2 === 1 ? careTracks.q1.title : careTracks.q2.title}`,
          description: q.num % 2 === 1 ? careTracks.q1.desc : careTracks.q2.desc,
          targetHoursPerWeek: 3,
          isCompleted: false,
          dueDate: '상시 실천'
        }
      ]
    }));
  }

  // =========================================================================
  // 3. 수능 3년 준비 로드맵 (고1, 12개 분기) - 고1 기초부터 수능 1등급까지
  // =========================================================================
  else {
    const quarters3Y = [
      { num: 1, label: '고1 1학기 봄 (3~4월)', dday: 'D-1000', title: '공통수학 다항식과 국어 문법 기초 체화', mathU: '다항식의 연산', korU: '국어 문법 (음운 변동, 맞춤법)', engU: '고1 구문 독해 (분사구문, 도치)' },
      { num: 2, label: '고1 1학기 기말 (5~6월)', dday: 'D-920', title: '이차방정식과 국어 현대문학 감상법', mathU: '이차방정식과 이차함수', korU: '현대문학 (현대시/현대소설)', engU: '전국연합학력평가 유형별 독해' },
      { num: 3, label: '고1 여름방학 (7~8월)', dday: 'D-850', title: '도형의 방정식과 학술 독서 인과 추론', mathU: '원의 방정식', korU: '학술 독서 (인문/사회/과학)', engU: '어법 어휘 빈출 5대 포인트' },
      { num: 4, label: '고1 2학기 (9~11월)', dday: 'D-780', title: '집합과 명제 & 고전문학 필수 어휘', mathU: '함수와 유리함수·무리함수', korU: '고전문학 (고전시가/고전산문)', engU: '빈칸추론 기초 논리 치환' },
      { num: 5, label: '고1 겨울방학 (12~2월)', dday: 'D-700', title: '수학I 지수로그 선행 & 수능 독서 기초', mathU: '지수함수와 로그함수', korU: korWeak1, engU: engWeak1 },
      { num: 6, label: '고2 1학기 (3~6월)', dday: 'D-580', title: '수학I 수열과 국어 문학 심화 1등급', mathU: mathWeak1, korU: korWeak2, engU: engWeak2 },
      { num: 7, label: '고2 여름방학 (7~8월)', dday: 'D-500', title: '수학II 도함수의 활용 체화 & 고난도 독서', mathU: mathWeak2, korU: korWeak3, engU: engWeak1 },
      { num: 8, label: '고2 2학기 (9~11월)', dday: 'D-400', title: '수학II 적분과 선택과목 및 영어 빈칸', mathU: mathWeak3, korU: korWeak1, engU: engWeak2 },
      { num: 9, label: '고3 겨울방학 (12~2월)', dday: 'D-300', title: '수능 전과목 기출 3회독 & D단계 마스터', mathU: mathWeak1, korU: korWeak2, engU: engWeak1 },
      { num: 10, label: '고3 1학기 (3~6월)', dday: 'D-200', title: '6월 모평 전 과목 1등급 실전 돌파', mathU: mathWeak2, korU: korWeak1, engU: engWeak2 },
      { num: 11, label: '고3 여름방학 (7~8월)', dday: 'D-100', title: '준킬러 E단계 정복 및 9모 1등급 확보', mathU: mathWeak3, korU: korWeak3, engU: engWeak1 },
      { num: 12, label: '고3 파이널 (9~11월)', dday: 'D-Day', title: 'F단계 수능 킬러 & 전 과목 수능 만점 완성', mathU: mathWeak1, korU: korWeak1, engU: engWeak1 }
    ];

    phases = quarters3Y.map(q => ({
      id: `p_3y_${q.num}`,
      phaseNumber: q.num,
      title: `${q.num}분기: ${q.title}`,
      periodLabel: q.label,
      targetDDay: q.dday,
      academicGoal: `수학('${q.mathU}'), 국어('${q.korU}'), 영어('${q.engU}') 3개년 완성`,
      neuroCareGoal: `${careDetail.title}: ${q.num <= 4 ? careTracks.q1.title : q.num <= 8 ? careTracks.q2.title : careTracks.q4.title}`,
      milestones: [
        {
          id: `m_3y_${q.num}_math`,
          phaseId: `p_3y_${q.num}`,
          track: 'academic',
          subjectId: 'math',
          title: `[수학] '${q.mathU}' 사다리 단계별 완수`,
          description: `'${q.mathU}'의 기초부터 응용까지 체계적 훈련`,
          targetUnit: q.mathU,
          targetHoursPerWeek: 5,
          isCompleted: false,
          dueDate: q.label
        },
        {
          id: `m_3y_${q.num}_kor`,
          phaseId: `p_3y_${q.num}`,
          track: 'academic',
          subjectId: 'korean',
          title: `[국어] '${q.korU}' 개념 완성 및 지문 분석`,
          description: `'${q.korU}'의 핵심 개념과 문제 접근법 체화`,
          targetUnit: q.korU,
          targetHoursPerWeek: 4,
          isCompleted: false,
          dueDate: q.label
        },
        {
          id: `m_3y_${q.num}_eng`,
          phaseId: `p_3y_${q.num}`,
          track: 'academic',
          subjectId: 'english',
          title: `[영어] '${q.engU}' 구문 독해 및 어휘 축적`,
          description: `'${q.engU}'의 빈출 구문과 독해 알고리즘 숙달`,
          targetUnit: q.engU,
          targetHoursPerWeek: 3,
          isCompleted: false,
          dueDate: q.label
        },
        {
          id: `m_3y_${q.num}_neuro`,
          phaseId: `p_3y_${q.num}`,
          track: 'neuro',
          subjectId: 'all',
          title: `[두뇌 케어] ${careTracks.q1.title}`,
          description: careTracks.q1.desc,
          targetHoursPerWeek: 3,
          isCompleted: false,
          dueDate: '상시 실천'
        }
      ]
    }));
  }

  const targetExamYear = duration === '1year' ? currentYear + 1 : duration === '2year' ? currentYear + 2 : currentYear + 3;

  // 시간 가중 후처리 (템플릿 골격 유지, 주당 시간만 개인화)
  // neuro 강도: 주분류 점수 70점 이상이면 회복 우선 +1h
  const neuroBoost = primaryScore !== undefined && primaryScore >= 70 ? 1 : 0;
  const factors: Record<string, number> = {
    korean: korPlan.hourFactor,
    math: mathPlan.hourFactor,
    english: engPlan.hourFactor,
    inquiry: Math.max(korPlan.hourFactor, mathPlan.hourFactor, engPlan.hourFactor)
  };
  phases = applyAdaptiveHours(phases, factors, neuroBoost);

  // 탐구 취약단원이 있으면 첫 분기에 탐구 마일스톤 추가 (국·수·영 구조 불변)
  if (inquiryWeakUnits.length > 0 && phases.length > 0) {
    const first = phases[0];
    const unit = inquiryWeakUnits[0];
    if (!first.milestones.some(m => m.subjectId === 'inquiry')) {
      first.milestones.push({
        id: `${first.id}_inquiry`,
        phaseId: first.id,
        track: 'academic',
        subjectId: 'inquiry',
        title: `[탐구] 취약 1순위 '${unit}' 개념 체계도 & 기출 자료해석 훈련`,
        description: `핵심 파트인 '${unit}'의 개념 구조화와 평가원 기출 도표·자료 해석 공식을 정리합니다.`,
        targetUnit: unit,
        targetHoursPerWeek: scaleHours(3, factors.inquiry),
        isCompleted: false,
        dueDate: first.milestones[0]?.dueDate
      });
      first.academicGoal = `${first.academicGoal} + 탐구('${unit}') 병행`;
    }
  }

  // 1년차 2분기 목표 등급을 궤적 보간값으로 갱신 (유지 페이스는 현재 등급 유지 명시)
  if (duration === '1year' && phases[1]) {
    const q = phases[1];
    q.academicGoal = `평가원 5개년 기출 코드 체화: 국어 ${phaseTargetOf(korPlan, 1)}등급(${paceLabelOf(korPlan.pace)}), 수학 ${phaseTargetOf(mathPlan, 1)}등급(${paceLabelOf(mathPlan.pace)}), 영어 ${phaseTargetOf(engPlan, 1)}등급(${paceLabelOf(engPlan.pace)}) 진입`;
  }

  const inputSnapshot = buildRoadmapSnapshot(trackKey, primaryScore, records, latestGrades);

  return {
    id: `roadmap_${student.id}_${duration}`,
    studentId: student.id,
    durationType: duration,
    targetExamYear,
    phases,
    overallProgress: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    inputSnapshot
  };
}

/**
 * 전체 로드맵 마일스톤 달성률(%) 계산
 */
export function calculateRoadmapProgress(roadmap: StudentRoadmap): number {
  let total = 0;
  let completed = 0;

  roadmap.phases.forEach(p => {
    p.milestones.forEach(m => {
      total++;
      if (m.isCompleted) completed++;
    });
  });

  return total > 0 ? Math.round((completed / total) * 100) : 0;
}

/**
 * LocalStorage 로드/저장 헬퍼
 */
export function getStudentRoadmap(studentId: string, duration: RoadmapDuration): StudentRoadmap | null {
  try {
    const raw = localStorage.getItem(`roadmap_${studentId}_${duration}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load student roadmap from localStorage:', e);
  }
  return null;
}

export function saveStudentRoadmap(roadmap: StudentRoadmap): void {
  try {
    roadmap.overallProgress = calculateRoadmapProgress(roadmap);
    roadmap.updatedAt = new Date().toISOString();
    localStorage.setItem(`roadmap_${roadmap.studentId}_${roadmap.durationType}`, JSON.stringify(roadmap));
  } catch (e) {
    console.error('Failed to save student roadmap to localStorage:', e);
  }
}
