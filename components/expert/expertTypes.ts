// ExpertOverlay types (moved verbatim, only `export` added; no UI change)
import type { AssessmentResult, AIModelConfig } from '../../types';

export interface ExpertOverlayProps {

    careType?: string;

    adrenalFatigueScore?: number;

    currentData?: AssessmentResult;

    studentId?: string;

    score?: number; // Added score prop

    aiModels?: AIModelConfig | null;

    isOpen?: boolean;

    onClose?: () => void;

}

// 전문가 평가 데이터 구조

export type ExpertAssessment = {

    grade: string;

    keyword: string;

    description: string;

    parentScript: string;

    color: string;

};

export type GuideItem = {

    title: string;

    subTitle?: string;

    expertDesc?: string;

    rationale?: string;

    managerGuide: string;

    action: string;

    difficulty?: 'easy' | 'medium' | 'hard';  // 난이도: 쉬움, 보통, 어려움

};



export type StrategySection = {

    title: string;

    intro?: string;

    guides: GuideItem[];

};



// Red Flag 타입 정의 (위험 신호)

export type RedFlag = {

    severity: 'warning' | 'critical' | 'emergency';  // 경고 수준

    condition: string;  // 조건/증상

    action: string;  // 조치 사항

    referral?: string;  // 연계 기관 (옵션)

};



// 학부모 전달용 메시지 타입 정의

export type ParentScript = {

    category: string;  // 카테고리 (수면, 영양, 운동 등)

    icon: string;  // 아이콘

    shortMessage: string;  // 짧은 메시지 (카톡용)

    detailedMessage: string;  // 상세 메시지 (이메일/문자용)

    tips: string[];  // 구체적인 실천 팁

};



// 성공 지표 (KPI) 타입 정의

export type SuccessIndicator = {

    category: string;  // 카테고리 (수면, 정서, 학습 등)

    icon: string;  // 아이콘

    indicator: string;  // 지표 설명

    targetValue: string;  // 목표값

    timeframe: string;  // 기간 (1주, 2주, 1개월 등)

    measureMethod: string;  // 측정 방법

    priority: 'high' | 'medium' | 'low';  // 우선순위

};



// 보조 자료 타입 정의

export type Resource = {

    title: string;  // 자료 제목

    type: 'video' | 'pdf' | 'link' | 'image' | 'app';  // 자료 유형

    icon: string;  // 아이콘

    description: string;  // 설명

    url: string;  // 링크 URL

    duration?: string;  // 영상 길이 (optional)

    category: string;  // 카테고리 (호흡, 수면, 운동 등)

};



// 주차별 로드맵 타입 정의

export type WeeklyPlan = {

    totalWeeks: number;  // 총 주차 수

    goal: string;  // 전체 목표

    weeks: {

        week: number;  // 주차

        theme: string;  // 주간 테마

        tasks: string[];  // 실천 과제들

        milestone?: string;  // 주요 마일스톤 (optional)

    }[];

};



// FAQ / 예상 반박 타입 정의

export type CommonObjection = {

    category: string;  // 카테고리 (시간, 의지, 환경 등)

    icon: string;  // 아이콘

    objection: string;  // 학생의 반박/변명

    response: string;  // 상담사 대응 멘트

    tip?: string;  // 추가 팁 (optional)

};



export type CareContent = {

    prestudy: StrategySection;

    learning: StrategySection;

    exercise: StrategySection;

    redFlags?: RedFlag[];  // 위험 신호 목록

};
