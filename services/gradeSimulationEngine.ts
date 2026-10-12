import { GradeRecord, GradeGoal, AssessmentResult, SubjectGrade, StudentInfo } from '../types';
import { SUNEUNG_SUBJECTS } from '../data/suneungSubjects';
import { getCareTypeDetail, normalizeCareTypeCode } from '../data/careTypesData';
import { getMockExamCutoffs, generateMockCurve } from '../data/gradeCutoffs';

export interface SimulationResult {
    months: string[]; // ["현재", "1개월 후", "2개월 후", "3개월 후", "6개월 후", "수능(목표)"]
    projections: {
        subjectId: string;
        subjectName: string;
        currentGrade: number;
        targetGrade: number;
        trajectory: number[]; // [current, month1, month2, month3, month6, final]
        probability: number; // 0-100 달성 확률
        bottlenecks: string[];
        recommendations: string[];
        efficiencyApplied?: boolean; // 평가 반영 여부 (미검사 시 false, 확률 불변)
        gradeEstimated?: boolean; // 원점수 기반 도출 등급 여부 (컷오프/일반곡선 추정치)
    }[];
    // 2개 이상 과목에 동일 등장하여 공통으로 승격된 항목 (과목별 목록에서는 제거됨)
    commonBottlenecks: CommonAnalysisItem[];
    commonRecommendations: CommonAnalysisItem[];
    // 등급 미입력 등으로 시뮬레이션에서 제외된 과목 (필터 정책: 침묵 제외 금지, 사유 고지)
    excludedSubjects: ExcludedSubject[];
    overallAdvice: string;
    globalStrategies: string[];
    careTypeSummary?: {
        code: string;
        title: string;
        emoji: string;
        subtitle: string;
        prescription: string;
        secondaryTitle?: string;
        secondaryEmoji?: string;
        secondaryPrescription?: string;
    };
}

function getGradeBandStrategy(subjectId: string, category: string, subjectName: string, currentGrade: number, targetGrade: number): string {
    if (subjectId === 'korean') {
        if (currentGrade <= 2) {
            return "독서 고난도(과학·철학) 지문 정보량 처리 시 문단별 핵심 명제 연결 훈련 및 문학 미세 선지 판별(과장·인과 왜곡 검증)에 집중하세요.";
        } else if (currentGrade <= 4) {
            return "문학과 선택과목(화작/언매)에서 감점 0점을 확보하여 35분 내 완파하고, 독서 4지문 중 3지문을 완벽 장악하는 실전 시간 안배를 훈련하세요.";
        } else {
            return "EBS 연계 문학 작품의 줄거리·갈래별 필수 개념어를 완벽 숙지하고, 독서는 한 문단 읽고 핵심 3단어를 여백에 요약하는 기초 독해력을 세우세요.";
        }
    }

    if (subjectId === 'math') {
        if (currentGrade <= 2) {
            return "공통 15번/22번, 선택 30번 킬러의 발문 조건 분해 및 케이스 분류(Case-by-Case) 논리 전개력을 기르고 쉬운 4점 40분 컷을 확보하세요.";
        } else if (currentGrade <= 4) {
            return "준킬러(9~14번, 20~21번) 다빈출 유형을 테마별로 완전 정복하고, 6단계 오답 사다리 훈련으로 '어떤 발문 조건에서 막혔는지' 원인 노트를 정립하세요.";
        } else {
            return "3점 문항과 쉬운 4점 문항(총 50~60점) 무조건 만점 전략. 교과서 핵심 공식 유도와 기본서 필수 예제를 막힘없이 풀 때까지 반복하세요.";
        }
    }

    if (subjectId === 'english') {
        if (currentGrade <= 2) {
            return "31~34번 빈칸추론과 36~39번 순서·삽입 3점 킬러 집중 분석. 글 전체의 논리적 대립쌍(Contrast)과 재진술(Paraphrasing) 원리를 파악하세요.";
        } else if (currentGrade <= 4) {
            return "듣기 17문항 100% 만점 확보 + 18~28번 대의파악/실용문 20분 내 완파 후, 주제·제목·어휘 등 3등급 안정권 문항을 먼저 확실히 확보하세요.";
        } else {
            return "매일 수능 필수 단어 40개 암기(누적 복습)와 함께 주어-동사-수식어구 끊어 읽기(구문독해 100문장)로 문해력을 우선 복원하세요.";
        }
    }

    if (category === 'social') {
        if (currentGrade <= 2) {
            return "평가원 특유의 말장난 선지 함정과 사상가/개념의 미세한 공통점·차이점 비교표를 백지에 직접 그리는 정밀 훈련에 집중하세요.";
        } else if (currentGrade <= 4) {
            return "단원별 개념 체계도 구조화 및 역대 수능/평가원 기출 도표·통계 자료 해석 공식을 테마별로 정리하세요.";
        } else {
            return "교과서 목차 흐름에 따라 핵심 키워드 마인드맵을 완성하고, 개념 기본서의 단원별 확인 문제를 2회독하세요.";
        }
    }

    if (category === 'science') {
        if (currentGrade <= 2) {
            return "킬러(유전/역학/양적관계 등) 문항 30분 모의고사 실전 훈련. 비킬러 16문항을 12분 내에 주파하는 초스피드 루틴을 구축하세요.";
        } else if (currentGrade <= 4) {
            return "비킬러 개념 문항 실수를 0개로 줄이고, 준킬러 계산 문제의 정형화된 풀이 알고리즘(도표화, 미지수 설정법)을 공식화하세요.";
        } else {
            return "자주 출제되는 탐구 실험의 설계 과정, 변인 통제, 기본 핵심 공식을 암기 카드화하여 매일 복습하세요.";
        }
    }

    if (category === 'required') {
        return "시대별 핵심 사건 연표 정리 및 인과관계 흐름 파악을 통해 절대평가 3등급 이상을 안정적으로 방어하세요.";
    }

    return "기본 어휘와 빈출 문법 패턴을 매일 15분씩 반복 학습하고, 기출 유형 풀이로 실전 감각을 유지하세요.";
}

function getSubjectCareTip(careCode: string, subjectId: string, category: string): string {
    const norm = normalizeCareTypeCode(careCode);

    // 미평가 시 건강 오진 문구 노출 금지: 표준 루틴 안내로 대체 (기존 CareType별 문구 불변)
    if (norm === 'UNASSESSED' || !careCode) {
        return "[두뇌·인지 팁] 진단 미완료 상태이므로 표준 학습 루틴(25~50분 집중 블록·취약 단원 우선)을 유지하고 정밀 검진 후 맞춤 팁을 적용하세요.";
    }

    if (norm === 'ATTENTION_DEFICIT') {
        if (subjectId === 'korean') {
            return "[두뇌·인지 팁] 긴 지문 읽기 시 문단마다 여백에 핵심 키워드 3개를 메모하며 시각적 주의 집중을 유지하세요.";
        } else if (subjectId === 'math') {
            return "[두뇌·인지 팁] 계산 실수 방지를 위해 풀이 공간을 세로 2단으로 나누고, 단계별 수식을 줄맞춤 정렬하여 작성하세요.";
        } else if (subjectId === 'english') {
            return "[두뇌·인지 팁] 듣기 1~17번 도중 주의 분산을 막기 위해 문제 시작 전 보기 키워드에 미리 동그라미를 치는 선제 루틴을 실행하세요.";
        } else if (category === 'social' || category === 'science') {
            return "[두뇌·인지 팁] 문제 풀기 전 발문의 핵심 조건과 단위에 형광펜을 긋는 3초 루틴으로 집중 스위치를 켜세요.";
        }
        return "[두뇌·인지 팁] 20분 단위 타이머를 설정하고 한 번에 한 문제 유형씩 끝내는 타임어택 방식으로 주의력을 집중시키세요.";
    }

    if (norm === 'BURNOUT') {
        if (subjectId === 'korean' || subjectId === 'english') {
            return "[두뇌·인지 팁] 지문 전체를 완벽히 외우려 하지 말고, 2지문 풀이 후 30초 눈감기 리셋 호흡으로 뇌 피로를 낮추세요.";
        } else if (subjectId === 'math') {
            return "[두뇌·인지 팁] 킬러 문항에 10분 이상 막히면 에너지가 방전되므로 즉시 별표 치고 다음 문제로 넘어가는 탈출 규칙을 세우세요.";
        } else if (category === 'social' || category === 'science') {
            return "[두뇌·인지 팁] 한 번에 전체 단원을 복습하려 하지 말고 하루에 1개 핵심 테마씩 가볍게 구조화하세요.";
        }
        return "[두뇌·인지 팁] 25분 집중 후 5분 완전 휴식(화면 보지 않기) 뽀모도로 루틴을 반드시 지키세요.";
    }

    if (norm === 'ANXIETY_TENSION') {
        if (subjectId === 'korean') {
            return "[두뇌·인지 팁] 시험 시작 직후 가장 자신 있는 문학이나 선택과목부터 풀어 초기 긴장도를 완화하고 뇌를 안정시키세요.";
        } else if (subjectId === 'math') {
            return "[두뇌·인지 팁] 문제 접근이 막혀 머리가 하얘질 때는 30초 심호흡 후 '발문에 적힌 조건 3개'를 여백에 다시 적으며 뇌 동결을 푸세요.";
        } else if (subjectId === 'english') {
            return "[두뇌·인지 팁] 시간 부족 공포를 줄이기 위해 듣기 평가 방송 중 풀 수 있는 쉬운 독해(도표/안내문) 2~3문항을 먼저 선점하세요.";
        } else if (category === 'social' || category === 'science') {
            return "[두뇌·인지 팁] 5문제 풀 때마다 OMR을 중간 마킹하여 시험 종료 직전 마킹 실수 불안을 사전 차단하세요.";
        }
        return "[두뇌·인지 팁] 시험 시작 전 4-7-8 호흡(4초 들이쉬고 7초 멈추고 8초 내쉬기) 3회로 교감신경을 안정시키세요.";
    }

    if (norm === 'STRESS_OVERLOAD') {
        if (subjectId === 'korean' || subjectId === 'english') {
            return "[두뇌·인지 팁] 주변 작은 소음에 방해받지 않도록 귀마개나 백색소음 환경에서 활자에 시선을 밀착시키세요.";
        } else if (subjectId === 'math') {
            return "[두뇌·인지 팁] 막힌 풀이를 억지로 잡고 있기보다 다른 번호 문제를 먼저 풀며 뇌의 긴장도를 이완시키세요.";
        }
        return "[두뇌·인지 팁] 정숙한 독립 공간에서 학습하고, 학습 시작 전 어깨와 목의 긴장을 풀어주는 1분 스트레칭을 하세요.";
    }

    if (norm === 'BRAIN_FATIGUE') {
        if (subjectId === 'korean') {
            return "[두뇌·인지 팁] 활자가 튕기듯 눈에 안 들어올 때는 펜 끝으로 문장의 주어·서술어를 짚어가며 시각적 가이드를 유지하세요.";
        } else if (subjectId === 'math') {
            return "[두뇌·인지 팁] 작업기억 과부하를 막기 위해 암산하지 말고 공식과 계산 과정을 꼼꼼히 적어가며 푸세요.";
        } else if (subjectId === 'english') {
            return "[두뇌·인지 팁] 복잡한 문장은 접속사와 관계사 앞에서 빗금(/)을 그어 문장을 3단어 이하 단위로 쪼개어 이해하세요.";
        } else if (category === 'social' || category === 'science') {
            return "[두뇌·인지 팁] 도표·그래프 분석 시 x축, y축, 단위를 속으로 읊으며 시각 정보를 청각 정보로 변환해 처리하세요.";
        }
        return "[두뇌·인지 팁] 50분 학습 후 10분간 먼 곳을 바라보며 눈을 감고 뇌의 글림프 림프 순환을 돕는 휴식을 취하세요.";
    }

    if (norm === 'CIRCULATION') {
        if (subjectId === 'math' || category === 'science') {
            return "[두뇌·인지 팁] 손끝 혈류가 부족하면 펜 터치와 연산 속도가 저하되므로, 문제 풀이 전 손가락 깍지 스트레칭을 해주세요.";
        }
        return "[두뇌·인지 팁] 1시간마다 3분 발목 펌프 운동 및 따뜻한 온수 섭취로 뇌 혈류 공급을 원활하게 유지하세요.";
    }

    if (norm === 'SLEEP') {
        if (subjectId === 'korean' || subjectId === 'math') {
            return "[두뇌·인지 팁] 오전 수능 시간표(국어 8:40, 수학 10:30)에 뇌 각성이 최고조가 되도록 아침 기상 2시간 후 풀이 루틴을 만드세요.";
        }
        return "[두뇌·인지 팁] 밤 11시 이후 블루라이트를 차단하고 기상 직후 햇빛을 15분 쬐어 학습 집중 일주기 리듬을 회복하세요.";
    }

    if (norm === 'LOW_ENERGY') {
        return "[두뇌·인지 팁] 공부 시작 직후 가장 쉬운 기본 문제 3개를 연속으로 풀어 도파민을 활성화한 후 본 학습에 들어가세요.";
    }

    if (norm === 'DEPRESSION_AMOTIVATION') {
        return "[두뇌·인지 팁] 거창한 분량 대신 '하루 15분 필수 문제 5개' 같은 초소형 과제를 완료 체크하여 성취감을 누적하세요.";
    }

    if (norm === 'ADRENAL') {
        return "[두뇌·인지 팁] 오후 4시 전후 급격한 집중력 방전이 올 때는 카페인 대신 미온수 섭취와 10분 파워냅(낮잠)으로 뇌를 리프레시하세요.";
    }

    if (norm === 'HYPERSENSITIVE') {
        return "[두뇌·인지 팁] 책상 위에 현재 풀고 있는 문제집 1권만 남기고 모든 시각적 방해 요소를 시야에서 격리하세요.";
    }

    return "[두뇌·인지 팁] 최적의 두뇌 인지 상태이므로 실전과 동일한 연속 모의고사 풀이로 실전 감각을 극대화하세요.";
}

function clampScore01(v: unknown, fallback = 50): number {
    const n = typeof v === 'number' ? v : Number(v);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(0, Math.min(100, n));
}

function clampGrade(v: unknown): number | null {
    const n = typeof v === 'number' ? v : Number(v);
    if (!Number.isFinite(n)) return null;
    const r = Math.round(n);
    if (r < 1 || r > 9) return null;
    return r;
}

// 원점수 → 등급 도출 (컷오프 DB 우선, 없으면 만점 비례 일반곡선; 추정치로 명시)
// - 실측 등급이 없을 때만 사용하며, 호출측은 gradeEstimated 배지를 표시한다
export interface DerivedGrade {
    grade: number;
    basis: 'cutoff' | 'generic';
    examName?: string;
}

export function deriveGradeFromRawScore(
    subjectId: string,
    rawScore: unknown,
    maxScore?: number
): DerivedGrade | null {
    const raw = typeof rawScore === 'number' ? rawScore : Number(rawScore);
    const info = SUNEUNG_SUBJECTS.find(s => s.id === subjectId);
    const max = Number.isFinite(Number(maxScore)) ? Number(maxScore) : (info?.maxScore ?? 100);
    if (!Number.isFinite(raw) || raw < 0 || raw > max) return null;
    const rounded = Math.round(raw);

    // 1) 컷오프 DB에서 해당 과목 곡선 탐색 (최신 시험 우선)
    try {
        const exams = getMockExamCutoffs();
        for (const exam of exams) {
            const curve = exam?.subjects?.[subjectId];
            if (Array.isArray(curve)) {
                const hit = curve.find(c => c.rawScore === rounded);
                if (hit && Number.isFinite(hit.grade)) {
                    const g = clampGrade(hit.grade);
                    if (g !== null) return { grade: g, basis: 'cutoff', examName: exam.examName };
                }
            }
        }
    } catch { /* DB 조회 실패 시 일반곡선으로 폴백 */ }

    // 2) 일반곡선 폴백 (1등급컷 = 만점의 90%)
    try {
        const curve = generateMockCurve(Math.round(max * 0.9), max >= 100 ? 130 : 70);
        const hit = curve.find(c => c.rawScore === rounded);
        if (hit) {
            const g = clampGrade(hit.grade);
            if (g !== null) return { grade: g, basis: 'generic' };
        }
    } catch { /* ignore */ }
    return null;
}

// 2개 이상 과목에 동일 문자열로 등장한 항목을 공통으로 승격
// (동일 내용 반복 표시로 인한 신뢰도 저하 방지, 과목별 목록에서는 제거)
export interface CommonAnalysisItem {
    text: string;
    subjectIds: string[]; // 적용 과목 (projection 등장 순서)
}

// 시뮬레이션 제외 과목 (필터 사유 고지용)
export interface ExcludedSubject {
    subjectId: string;
    subjectName: string;
    reason: '성적 미입력' | '등급 미입력' | '과목 정보 없음';
}

type ProjectionItem = SimulationResult['projections'][number];

function hoistCommonTexts(
    projections: ProjectionItem[],
    get: (p: ProjectionItem) => string[],
    set: (p: ProjectionItem, rest: string[]) => void
): CommonAnalysisItem[] {
    if (!Array.isArray(projections) || projections.length < 2) return [];
    const owners = new Map<string, number[]>();
    const order: string[] = [];
    projections.forEach((p, i) => {
        const items = get(p) || [];
        const seen = new Set<string>();
        for (const t of items) {
            if (typeof t !== 'string' || !t || seen.has(t)) continue;
            seen.add(t);
            if (!owners.has(t)) {
                owners.set(t, []);
                order.push(t);
            }
            owners.get(t)!.push(i);
        }
    });
    const commons: CommonAnalysisItem[] = [];
    for (const t of order) {
        const idxs = owners.get(t) || [];
        if (idxs.length >= 2) {
            commons.push({ text: t, subjectIds: idxs.map(i => projections[i].subjectId) });
            for (const i of idxs) {
                set(projections[i], get(projections[i]).filter(x => x !== t));
            }
        }
    }
    return commons;
}

function getSubjectBottlenecks(
    subjectId: string,
    category: string,
    currentGrade: number,
    targetGrade: number,
    actualWeakUnits: string[],
    trendSlope: number,
    isWeakSubject: boolean,
    improvementRate: number
): string[] {
    const bottlenecks: string[] = [];

    // 1. Weak units bottleneck
    if (actualWeakUnits.length > 0) {
        bottlenecks.push(`[세부 취약 단원] 등록된 핵심 취약 파트 [${actualWeakUnits.join(', ')}]에서의 오답 누수가 목표 등급 진입을 가로막고 있습니다.`);
    }

    // 2. Grade band & subject specific bottleneck
    if (subjectId === 'korean') {
        if (currentGrade <= 2) {
            bottlenecks.push("[고난도 판별] 독서 고난도 킬러 추론 문항의 미세 함정 선지와 80분 실전 시간 안배 압박.");
        } else if (currentGrade <= 4) {
            bottlenecks.push("[독해 안정성] 문학 선지 판별에서의 주관적 오독 및 독서 고난도 지문 1개 시간 부족 리스크.");
        } else {
            bottlenecks.push("[기초 어휘·개념] 수능 필수 개념어 미숙지 및 긴 문맥 독해 시 어휘력 부족으로 인한 지체.");
        }
    } else if (subjectId === 'math') {
        if (currentGrade <= 2) {
            bottlenecks.push("[킬러 조건 분해] 공통 22번/선택 30번 킬러의 숨은 조건 분류 누락 및 쉬운 4점 계산 착오.");
        } else if (currentGrade <= 4) {
            bottlenecks.push("[준킬러 유형 정복] 4점 준킬러(9~14번, 20~21번)의 정형화된 풀이 알고리즘 미확립.");
        } else {
            bottlenecks.push("[연산·기초 결손] 기본 교과서 공식 유도 미흡 및 3점 문항에서의 잦은 감점.");
        }
    } else if (subjectId === 'english') {
        if (currentGrade <= 2) {
            bottlenecks.push("[3점 킬러 문항] 31~34번 빈칸추론 및 36~39번 순서/삽입 3점 문항 1~2개 오답으로 인한 등급 강등 위험.");
        } else if (currentGrade <= 4) {
            bottlenecks.push("[구문 독해 불안] 감(feeling)에 의존한 독해 습관 및 듣기 평가에서의 간헐적 오답.");
        } else {
            bottlenecks.push("[기본 어휘 부족] 필수 수능 영단어 암기량 부족 및 복합 문장 구조 분석 불가.");
        }
    } else if (category === 'social') {
        if (currentGrade <= 2) {
            bottlenecks.push("[초고난도 함정 선지] 1등급 컷 48~50점 체제에서 사상가/개념의 미세 차이 판별 실수 1개가 치명적.");
        } else if (currentGrade <= 4) {
            bottlenecks.push("[자료 해석 지체] 복합 도표/그래프 분석 시 시간 지연으로 인한 후반부 문항 풀이 압박.");
        } else {
            bottlenecks.push("[핵심 개념 체계도 부재] 단원별 핵심 개념의 시대적·구조적 흐름 미정리.");
        }
    } else if (category === 'science') {
        if (currentGrade <= 2) {
            bottlenecks.push("[30분 타임어택 한계] 킬러 2~3문항(유전/역학 등) 복합 계산에서의 극단적 시간 부족.");
        } else if (currentGrade <= 4) {
            bottlenecks.push("[비킬러 감점 누수] 비킬러 개념 문제의 잦은 실수와 준킬러 계산 스피드 저하.");
        } else {
            bottlenecks.push("[실험 변인 및 공식 미달] 필수 탐구 실험의 조작·통제 변인 해석 미숙 및 기본 공식 암기 부족.");
        }
    } else {
        bottlenecks.push("[유형 적응도] 기출 문제 풀이량 부족 및 제한 시간 내 오답 검토 시간 부족.");
    }

    // 3. Gap & Weak subject & Trend
    const gradeGap = currentGrade - targetGrade;
    if (gradeGap >= 3) {
        bottlenecks.push(`[목표 격차] 현재 등급과 목표 등급 간의 격차가 ${gradeGap}등급으로 커서 학습량 배분이 필수적입니다.`);
    }

    if (isWeakSubject) {
        bottlenecks.push("[취약 과목 부담] 학생 지정 집중 취약 과목으로 개념 보완에 타 과목 대비 더 많은 시간이 소요됩니다.");
    }

    if (improvementRate < 0.85) {
        bottlenecks.push("[학습 효율 저하] 인지 피로도 또는 학습 효율 저하로 성적 향상 속도가 더딜 수 있습니다.");
    }

    if (trendSlope > 0.5) {
        bottlenecks.push("[하락 추세 경고] 최근 모의고사에서 연속 하락 추세가 확인되어 학습 루틴 재점검이 시급합니다.");
    } else if (trendSlope < -0.5) {
        bottlenecks.push("[상승 모멘텀] 최근 성적이 뚜렷한 상승 곡선을 그리고 있어 현재의 공부 페이스 유지가 중요합니다.");
    }

    if (bottlenecks.length === 0) {
        bottlenecks.push("[안정적 흐름] 특별한 병목 요인 없이 목표 등급을 향한 안정적인 성적 향상이 기대됩니다.");
    }

    return bottlenecks;
}

export class GradeSimulationEngine {
    static simulate(
        records: GradeRecord[],
        goals: GradeGoal[],
        assessment: AssessmentResult | undefined,
        focusSubjects: string[],
        selectedSubjects: string[],
        student: StudentInfo
    ): SimulationResult | null {
        if (!records || records.length === 0) return null;
        const safeGoals = Array.isArray(goals) ? goals : [];
        const safeFocus = Array.isArray(focusSubjects) ? focusSubjects : [];
        // selectedSubjects가 비어 있으면 기록에 존재하는 과목으로 대체 (출력 형태 불변)
        const rawSelected = Array.isArray(selectedSubjects) && selectedSubjects.length > 0
            ? selectedSubjects
            : Array.from(new Set(records.flatMap(r => (r?.subjects || []).map(s => s?.subjectId).filter(Boolean)))) as string[];
        if (rawSelected.length === 0) return null;

        // Get latest record (유효 날짜 우선, 무효 날짜는 뒤로)
        const timeOf = (d: unknown): number => {
            const t = new Date(d as string).getTime();
            return Number.isFinite(t) ? t : Number.NEGATIVE_INFINITY;
        };
        const sortedRecords = [...records].sort((a, b) => timeOf(b?.examDate) - timeOf(a?.examDate));
        const latestRecord = sortedRecords.find(r => Number.isFinite(new Date(r?.examDate as string).getTime())) || sortedRecords[0];
        if (!latestRecord) return null;

        // Base factors from assessment (비수치/범위 밖 입력 방어, 기존 50점 폴백 유지)
        let learningEfficiency = 1.0; // 0.5 to 1.5
        let focusCapacity = 1.0;
        let memoryCapacity = 1.0;

        if (assessment) {
            // study efficiency
            const effScore = clampScore01((assessment as any).studyEfficiencyResults?.totalScore, 50);
            learningEfficiency = 0.5 + (effScore / 100);

            // cognitive performance (focus)
            const cogScore = clampScore01((assessment as any).cognitiveResults?.totalScore, 50);
            focusCapacity = 0.5 + (cogScore / 100);

            // working memory
            const memScore = clampScore01((assessment as any).workingMemoryResults?.totalScore, 50);
            memoryCapacity = 0.5 + (memScore / 100);
        }

        const overallMultiplier = (learningEfficiency * 0.4) + (focusCapacity * 0.3) + (memoryCapacity * 0.3);

        // 12대 CareType 주분류 + 부분류(Secondary) 상단 종합 요약 생성
        // 미평가(UNASSESSED)는 요약 미노출 (HEALTHY와 동일하게 취급, 기존 UI 불변)
        const primaryCare = getCareTypeDetail(assessment?.careType);
        const secondaryCareTypes = assessment?.classificationResult?.secondary || [];
        let careTypeSummary: SimulationResult['careTypeSummary'] = undefined;

        if (assessment?.careType && primaryCare.code !== 'HEALTHY' && primaryCare.code !== 'UNASSESSED') {
            careTypeSummary = {
                code: primaryCare.code,
                title: primaryCare.title,
                emoji: primaryCare.emoji,
                subtitle: primaryCare.subtitle,
                prescription: primaryCare.prescription,
            };

            if (secondaryCareTypes.length > 0) {
                const secCare = getCareTypeDetail(secondaryCareTypes[0]);
                if (secCare.code !== primaryCare.code && secCare.code !== 'HEALTHY' && secCare.code !== 'UNASSESSED') {
                    careTypeSummary.secondaryTitle = secCare.title;
                    careTypeSummary.secondaryEmoji = secCare.emoji;
                    careTypeSummary.secondaryPrescription = secCare.prescription;
                }
            }
        }

        const projections: SimulationResult['projections'] = [];
        const excludedSubjects: ExcludedSubject[] = [];
        const months = ["현재", "1개월 후", "2개월 후", "3개월 후", "6개월 후", "수능(목표)"];

        for (const subjectId of rawSelected) {
            // Find the most recent record that contains this subject (손상 데이터 방어)
            const subjectData = sortedRecords
                .flatMap(r => Array.isArray(r?.subjects) ? r.subjects : [])
                .find(s => s?.subjectId === subjectId && clampGrade(s?.grade) !== null);
            const goalData = safeGoals.find(g => g?.subjectId === subjectId);
            const subjectInfo = SUNEUNG_SUBJECTS.find(s => s.id === subjectId);

            const validatedGrade = clampGrade(subjectData?.grade);
            let activeData = subjectData;
            let currentGrade: number | null = validatedGrade;
            let gradeEstimated = false;
            if (currentGrade === null) {
                // 등급 미입력 + 원점수 존재 시 컷오프/일반곡선으로 등급 도출 (추정치 명시)
                const rawEntry = sortedRecords
                    .flatMap(r => Array.isArray(r?.subjects) ? r.subjects : [])
                    .find(s => s?.subjectId === subjectId && Number.isFinite(Number(s?.rawScore)));
                const derived = rawEntry ? deriveGradeFromRawScore(subjectId, rawEntry.rawScore) : null;
                if (derived !== null) {
                    currentGrade = derived.grade;
                    gradeEstimated = true;
                    activeData = rawEntry;
                }
            }
            if (!activeData || currentGrade === null || !subjectInfo) {
                // 필터 정책: 침묵 제외 금지 — 사유를 기록하고 UI에 고지
                const anyEntry = sortedRecords
                    .flatMap(r => Array.isArray(r?.subjects) ? r.subjects : [])
                    .find(s => s?.subjectId === subjectId);
                excludedSubjects.push({
                    subjectId,
                    subjectName: subjectInfo?.name || subjectId,
                    reason: !subjectInfo ? '과목 정보 없음' : !anyEntry ? '성적 미입력' : '등급 미입력'
                });
                continue;
            }
            // Default target is 1 grade higher if no goal set (목표치 1~9 검증)
            const rawTarget = goalData?.tier3Target;
            const validTarget = clampGrade(rawTarget);
            const targetGrade = validTarget ?? Math.max(1, currentGrade - 1);

            // Extract weak units for this subject across records (손상 subunit 방어)
            let actualWeakUnits: string[] = [];
            if (activeData.weakUnits && activeData.weakUnits.length > 0) {
                actualWeakUnits = [...activeData.weakUnits].filter(u => typeof u === 'string' && u.trim().length > 0);
            } else if (activeData.subunits) {
                actualWeakUnits = Object.entries(activeData.subunits)
                    .filter(([_, data]: [string, any]) => {
                        const sc = Number(data?.score);
                        const mx = Number(data?.maxScore) || 100;
                        if (!Number.isFinite(sc) || !Number.isFinite(mx) || mx <= 0) return false;
                        return sc / mx < 0.6;
                    })
                    .map(([name]) => name);
            }
            if (actualWeakUnits.length === 0) {
                for (const r of sortedRecords) {
                    const s = r.subjects.find(sub => sub.subjectId === subjectId);
                    if (s?.weakUnits && s.weakUnits.length > 0) {
                        actualWeakUnits = [...s.weakUnits];
                        break;
                    }
                }
            }

            const careCode = primaryCare.code;

            if (currentGrade <= targetGrade) {
                const isRegression = targetGrade > currentGrade;
                if (isRegression) {
                    // 퇴보 목표(목표가 현재보다 낮음): 달성 취급 금지, 재설정 권고
                    projections.push({
                        subjectId,
                        subjectName: subjectInfo.name,
                        currentGrade,
                        targetGrade,
                        trajectory: [currentGrade, currentGrade, currentGrade, currentGrade, currentGrade, currentGrade],
                        probability: 50,
                        bottlenecks: ["[목표 재설정 권고] 목표 등급이 현재 등급보다 낮게 설정되어 있습니다. 1차≥2차≥최종 순으로 목표를 다시 설정해주세요."],
                        recommendations: [`[등급 맞춤 전략] ${getGradeBandStrategy(subjectId, subjectInfo.category, subjectInfo.name, currentGrade, currentGrade)}`],
                        efficiencyApplied: assessment !== undefined && assessment !== null,
                        gradeEstimated
                    });
                    continue;
                }
                // Already achieved or no improvement needed
                const achievedRecs: string[] = [
                    `[1등급 달성/유지] ${getGradeBandStrategy(subjectId, subjectInfo.category, subjectInfo.name, currentGrade, targetGrade)}`,
                    `[실전 감각 유지] 실전 모의고사 풀이로 실수 0개(무감점) 루틴과 마킹 안정성을 확보하세요.`
                ];
                if (careCode && careCode !== 'HEALTHY' && careCode !== 'UNASSESSED') {
                    achievedRecs.push(getSubjectCareTip(careCode, subjectId, subjectInfo.category));
                }

                projections.push({
                    subjectId,
                    subjectName: subjectInfo.name,
                    currentGrade,
                    targetGrade,
                    trajectory: [currentGrade, currentGrade, currentGrade, currentGrade, currentGrade, currentGrade],
                    probability: 95,
                    bottlenecks: ["[안정권 유지] 현재 1등급 또는 목표 등급을 이미 달성하였으므로 실전 실수 방지에 집중하세요."],
                    recommendations: achievedRecs,
                    efficiencyApplied: assessment !== undefined && assessment !== null,
                    gradeEstimated
                });
                continue;
            }

            const gradeGap = currentGrade - targetGrade;
            
            // 1. Focus subjects multiplier
            const isFocused = safeFocus.includes(subjectId);
            const focusMultiplier = isFocused ? 1.2 : 1.0;

            // 2. Subject category difficulty multiplier
            let difficultyMultiplier = 1.0;
            if (subjectInfo.category === 'common' && subjectId === 'math') difficultyMultiplier = 0.7;
            if (subjectInfo.category === 'common' && subjectId === 'korean') difficultyMultiplier = 0.8;
            if (subjectInfo.category === 'social' || subjectInfo.category === 'science') difficultyMultiplier = 1.1;

            // 3. Grade band scaling (1~2등급 킬러 vs 7~9등급 기초)
            let gradeBandMultiplier = 1.0;
            if (currentGrade <= 2) gradeBandMultiplier = 0.65;
            else if (currentGrade <= 4) gradeBandMultiplier = 0.9;
            else if (currentGrade <= 6) gradeBandMultiplier = 1.15;
            else gradeBandMultiplier = 1.35;

            // 4. Exam type weighting
            let examTypeMultiplier = 1.0;
            if (latestRecord.examType === 'suneung') examTypeMultiplier = 0.85;
            else if (latestRecord.examType === 'midterm' || latestRecord.examType === 'final') examTypeMultiplier = 1.15;

            // improvementRate 폭주 방지 클램프 (출력 스케일 불변, 기존 가중치 유지)
            const rawImprovement = overallMultiplier * focusMultiplier * difficultyMultiplier * gradeBandMultiplier * examTypeMultiplier;
            const improvementRate = Number.isFinite(rawImprovement)
                ? Math.max(0.3, Math.min(1.8, rawImprovement))
                : 1.0;

            // Calculate trajectory (NaN 방어, 목표 하한 유지)
            const trajectory = [currentGrade];
            let currentTempGrade = currentGrade;

            // Decay model towards target
            const timeSteps = [1, 1, 1, 3, 4]; // months per step
            
            for (const step of timeSteps) {
                const improvement = (currentTempGrade - targetGrade) * 0.15 * improvementRate * step;
                const next = Number.isFinite(improvement) ? currentTempGrade - improvement : currentTempGrade;
                currentTempGrade = Math.max(targetGrade, Math.min(9, next));
                const rounded = Number(currentTempGrade.toFixed(1));
                trajectory.push(Number.isFinite(rounded) ? rounded : currentGrade);
            }

            // Calculate trend from last records (손상 등급 제외)
            const pastGrades = sortedRecords
                .map(r => (Array.isArray(r?.subjects) ? r.subjects.find(s => s?.subjectId === subjectId)?.grade : undefined))
                .map(g => clampGrade(g))
                .filter((g): g is number => g !== null) as number[];
            
            const recentGrades = pastGrades.slice(0, 5);
            let trendSlope = 0;
            if (recentGrades.length >= 2) {
                let totalSlope = 0;
                let weightSum = 0;
                for (let i = 0; i < recentGrades.length - 1; i++) {
                    const weight = recentGrades.length - 1 - i;
                    totalSlope += (recentGrades[i] - recentGrades[i + 1]) * weight;
                    weightSum += weight;
                }
                trendSlope = weightSum > 0 && Number.isFinite(totalSlope) ? totalSlope / weightSum : 0;
                if (!Number.isFinite(trendSlope)) trendSlope = 0;
            }

            // Calculate probability based on gap, time, efficiency, and grade band
            let probability = 50;
            if (improvementRate > 1.2) probability += 20;
            if (improvementRate < 0.8) probability -= 20;
            if (gradeGap >= 4) probability -= 30;
            if (gradeGap <= 1) probability += 20;
            if (currentGrade <= 2) probability -= 10; // 1~2등급 도달 난이도 보정
            
            // Adjust probability based on trend
            if (trendSlope < -0.5) probability += 15;
            else if (trendSlope > 0.5) probability -= 15;
            
            probability = Math.max(10, Math.min(95, Math.round(probability)));

            // P1. 평가 연동: 효율 계수로 확률 보정 (±10%p 상한, 산식 공개)
            // eff01 0~1 → 계수 0.9~1.1. 미검사 시 세 용량 모두 1.0 → eff01 정확히 0.5 → 계수 1.0 (숫자 불변)
            const eff01 = Math.max(0, Math.min(1, ((learningEfficiency + focusCapacity + memoryCapacity) / 3 - 0.5)));
            const efficiencyFactor = 0.9 + 0.2 * eff01;
            const efficiencyApplied = assessment !== undefined && assessment !== null;
            if (efficiencyApplied) {
                probability = Math.max(5, Math.min(98, Math.round(probability * efficiencyFactor)));
            }

            // Differentiated Bottlenecks
            const bottlenecks = getSubjectBottlenecks(
                subjectId,
                subjectInfo.category,
                currentGrade,
                targetGrade,
                actualWeakUnits,
                trendSlope,
                student.weakSubject === subjectInfo.id,
                improvementRate
            );

            // 컨디션 연계 병목 1줄 (평가 있을 때만, 처방 원문 그대로)
            if (efficiencyApplied && careTypeSummary?.prescription) {
                bottlenecks.unshift(`[컨디션 연계] ${careTypeSummary.title} — ${careTypeSummary.prescription}`);
            }

            // Differentiated Recommendations
            const recommendations: string[] = [];
            recommendations.push(`[등급 맞춤 전략] ${getGradeBandStrategy(subjectId, subjectInfo.category, subjectInfo.name, currentGrade, targetGrade)}`);

            if (actualWeakUnits.length > 0) {
                recommendations.push(`[취약 단원 클리닉] 등록된 취약 파트 [${actualWeakUnits.join(', ')}]의 평가원 기출 3개년을 집중 분석하고 6단계 문항 사다리 훈련을 병행하세요.`);
            }

            if (careCode && careCode !== 'HEALTHY' && careCode !== 'UNASSESSED') {
                recommendations.push(getSubjectCareTip(careCode, subjectId, subjectInfo.category));
            }

            projections.push({
                subjectId,
                subjectName: subjectInfo.name,
                currentGrade,
                targetGrade,
                trajectory,
                probability,
                bottlenecks,
                recommendations,
                efficiencyApplied,
                gradeEstimated
            });
        }

        let overallAdvice = "";
        if (overallMultiplier >= 1.2) {
            overallAdvice = "인지 성능과 학습 효율성이 매우 우수합니다. 현재의 학습 패턴을 유지하면서 고난도 문항에 도전하여 상위권 도약을 노려볼 수 있습니다.";
        } else if (overallMultiplier >= 0.9) {
            overallAdvice = "전반적인 학습 기반이 안정적입니다. 가장 부담되는 과목(Focus Subject)에 시간 투자를 15~20% 늘리면 목표 달성 확률이 크게 상승합니다.";
        } else {
            overallAdvice = "단순한 학습 시간 늘리기보다는 '학습 효율성' 개선이 우선되어야 합니다. 수면 관리, 스트레스 조절 및 뇌 피로도 관리를 병행하세요.";
        }

        // 공통 승격: 2개 이상 과목에 동일 등장한 병목·전략은 공통으로 묶어 중복 표시 방지
        const commonBottlenecks = hoistCommonTexts(projections, p => p.bottlenecks, (p, v) => { p.bottlenecks = v; });
        const commonRecommendations = hoistCommonTexts(projections, p => p.recommendations, (p, v) => { p.recommendations = v; });

        const globalStrategiesSet = new Set<string>();
        // Add grade strategies to global
        projections.forEach(p => {
            if (p.currentGrade >= 7) {
                globalStrategiesSet.add("[7~9등급 공통] 기초가 부족한 상태이므로 기출문제 풀이보다는 교과서와 기본서 위주의 기초 개념 확립에 집중하세요.");
            } else if (p.currentGrade >= 4) {
                globalStrategiesSet.add("[4~6등급 공통] 자주 틀리는 취약 유형과 빈출 유형을 파악하여 집중적으로 보완하는 학습이 필요합니다.");
            } else {
                globalStrategiesSet.add("[1~3등급 공통] 실수를 줄이고 고난도(킬러) 문항 대비 및 실전 모의고사를 통한 시간 안배 연습에 집중하세요.");
            }
        });

        // Add cognitive strategies to global
        if (focusCapacity < 0.8) {
            globalStrategiesSet.add("[집중력 보완] 뽀모도로 테크닉(25분 집중, 5분 휴식) 등 짧은 주기의 집중 훈련이 필요합니다.");
        }
        if (memoryCapacity < 0.8) {
            globalStrategiesSet.add("[작업기억 보완] 개념을 청크(Chunk) 단위로 묶어서 암기하고, 마인드맵을 활용하세요.");
        }
        if (learningEfficiency < 0.8) {
            globalStrategiesSet.add("[메타인지 보완] 오답노트를 반드시 작성하고, '왜 틀렸는지' 원인을 분석하는 훈련이 필요합니다.");
        }

        const globalStrategies = Array.from(globalStrategiesSet);

        return {
            months,
            projections,
            commonBottlenecks,
            commonRecommendations,
            excludedSubjects,
            overallAdvice,
            globalStrategies,
            careTypeSummary
        };
    }
}
