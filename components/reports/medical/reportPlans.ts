import { CareType, type AssessmentResult } from '../../../types';
import { DETAILED_INSIGHTS } from '../../../data/detailedInsights';
import { getSubjectCircadianPlan } from '../../../services/chronobiologyEngine';

// Subject theme mapping for circadian & focus learning
export const resolveSubjectPlan = (student: AssessmentResult['student']) => {
    const key = student.weakSubject || student.focusSubjects?.[0] || student.selectedSubjects?.[0] || 'general';
    return getSubjectCircadianPlan(key);
};

// Parsed Vulnerable Time Strategy from DETAILED_INSIGHTS (100% CareType synchronized)
export const resolveVulnerableStrategy = (careType: CareType) => {
    const insight = DETAILED_INSIGHTS[careType as CareType] || DETAILED_INSIGHTS[CareType.BURNOUT];
    const raw = insight?.vulnerableTimeStrategy || '';
    const sectionRegex = /\*\*\[(.*?)\]\*\*\s*([\s\S]*?)(?=(?:\*\*\[|$))/g;
    const matches: { title: string; text: string }[] = [];
    let m;
    while ((m = sectionRegex.exec(raw)) !== null) {
        matches.push({
            title: m[1].trim(),
            text: m[2].replace(/\*\*/g, '').replace(/\n+/g, ' ').trim()
        });
    }

    if (matches.length >= 4) {
        return {
            vulnerableTime: { title: matches[0].title, text: matches[0].text },
            correlation: { title: matches[1].title, text: matches[1].text },
            mindset: { title: matches[2].title, text: matches[2].text },
            recommendation: { title: matches[3].title, text: matches[3].text },
        };
    }

    return {
        vulnerableTime: { title: '취약 구간 분석', text: '오후 1시~3시(식후 슬럼프) 및 기상 직후 에너지 저하 구간에 집중적인 주의가 필요합니다.' },
        correlation: { title: '학습 상관관계', text: '에너지가 고갈된 구간에 고난도 문제를 풀면 학습 회피 반응이 강화되므로 가벼운 학습으로 전환하세요.' },
        mindset: { title: '마인드셋', text: '"지금은 뇌가 회복하는 시간"으로 재정의하고 자책 대신 15분 파워냅이나 가벼운 스트레칭을 취하세요.' },
        recommendation: { title: '추천 공부법', text: '인지 부하가 낮은 어휘 복습, 암기 카드 넘기기, 인강 복습 등 수동적 학습을 배치하세요.' },
    };
};
