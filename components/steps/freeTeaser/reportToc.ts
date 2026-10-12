// 리포트 목차 데이터 (MedicalReport 페이지 구성과 1:1 대응, 내용 변경 없음)
// 무료 공개: 1장(핵심 진단 근거). 나머지는 잠금.
export interface ReportTocItem {
    page: number;
    title: string;
    subtitle: string;
    free: boolean;
    reason: string;
}

const PRO_REASON = '14P 초정밀 신경인지 솔루션 리포트북 1회 영구 열람';

export const REPORT_TOC: ReportTocItem[] = [
    { page: 1, title: '핵심 진단 및 일차 케어타입 분류', subtitle: 'Primary Classification', free: true, reason: '' },
    { page: 2, title: '자율신경·신경인지 상세', subtitle: 'ANS & Neuro-Cognitive Detail', free: false, reason: PRO_REASON },
    { page: 3, title: '서카디안 골든타임표', subtitle: 'Circadian Peak Time & Schedule', free: false, reason: PRO_REASON },
    { page: 4, title: '학습 밀도 분석', subtitle: 'Study Density & Analytics', free: false, reason: PRO_REASON },
    { page: 5, title: '학습 기질·신경 메커니즘', subtitle: 'Learning Traits & Neuro-Mechanism', free: false, reason: PRO_REASON },
    { page: 6, title: '4과목 전략 로드맵', subtitle: '4-Subject Strategy Roadmap', free: false, reason: PRO_REASON },
    { page: 7, title: '공부 효율성 검사 I', subtitle: 'Study Efficiency Assessments I', free: false, reason: PRO_REASON },
    { page: 8, title: '공부 효율성 검사 II', subtitle: 'Study Efficiency Assessments II', free: false, reason: PRO_REASON },
    { page: 9, title: '인지·작업기억', subtitle: 'Cognitive & Working Memory', free: false, reason: PRO_REASON },
    { page: 10, title: '생활·영양 처방', subtitle: 'Lifestyle & Nutrition Prescription', free: false, reason: PRO_REASON },
    { page: 11, title: '실전 전략·킬러핵', subtitle: 'Exam Strategy & Killer Hacks', free: false, reason: PRO_REASON },
    { page: 12, title: '전문가 임상 소견·상담 매트릭스', subtitle: 'Expert Clinical Opinion', free: false, reason: PRO_REASON },
    { page: 13, title: '임상 처방전 개요', subtitle: 'Clinical Prescription Overview', free: false, reason: PRO_REASON },
    { page: 14, title: '영양제 처방전', subtitle: 'Nutraceutical Regimen', free: false, reason: PRO_REASON },
    { page: 15, title: '1:1 코칭 1부', subtitle: 'AI Expert Coaching Part 1', free: false, reason: PRO_REASON },
    { page: 16, title: '1:1 코칭 2부·로드맵', subtitle: 'Roadmap & KPI Part 2', free: false, reason: PRO_REASON },
    { page: 17, title: '데일리 체크리스트', subtitle: 'Daily Neuro-Routine Appendix', free: false, reason: PRO_REASON },
];
