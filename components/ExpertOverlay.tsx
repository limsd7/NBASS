import React, { useState, useEffect } from 'react';
import { CareType, type AssessmentResult, PredictionResult, RiskPrediction, TrendAnalysis } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { generatePrediction } from '../services/predictionEngine';
import DatabaseService, { db } from '../services/database';
import ConsultationHistoryModal from './modals/ConsultationHistoryModal';
import { SelfCheckModal } from './resources/SelfCheckModal';
import { DailyRoutineTracker } from './resources/DailyRoutineTracker';
import { WorksheetModal } from './resources/WorksheetModal';
import { SELF_CHECK_DATA, DAILY_ROUTINE_DATA, WORKSHEET_DATA } from '../data/resourceContents';
import { openVisualCleanGuide } from './guides/VisualCleanGuide';
import { openDigitalDetoxGuide } from './guides/DigitalDetoxGuide';
import { openMicroGoalGuide } from './guides/MicroGoalGuide';
import { openWorryDumpGuide } from './guides/WorryDumpGuide';
import { openGroundingGuide } from './guides/GroundingGuide';
import { openDetachGuide } from './guides/DetachGuide';
import { openBoxBreathingGuide } from './guides/BoxBreathingGuide';
import { AIAssistantPanel } from './common/AIAssistantPanel';
import { AIModelConfig } from '../types';

interface ExpertOverlayProps {
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
type ExpertAssessment = {
    grade: string;
    keyword: string;
    description: string;
    parentScript: string;
    color: string;
};

// 점수 구간별 평가 로직
const getExpertAssessment = (score: number = 0): ExpertAssessment => {
    if (score >= 81) return {
        grade: '심각 (Severe)',
        keyword: '즉각 조치',
        description: '증상이 고착화되어 학습 효율이 현저히 저하된 상태입니다. 자력 회복이 어려우므로 전문가의 개입과 즉각적인 생활 습관 교정이 필수적입니다.',
        parentScript: '현재 학생의 상태는 단순히 쉬면 나아지는 단계를 지났습니다. 지금 개입하지 않으면 장기적인 번아웃으로 이어질 수 있으니, 오늘 당장 전문가 상담을 권해드립니다.',
        color: 'bg-red-500'
    };
    if (score >= 61) return {
        grade: '주의 (Warning)',
        keyword: '적극 개입',
        description: '자력 회복이 더딘 상태로, 방치 시 심각 단계로 진행될 위험이 높습니다. 적극적인 휴식과 영양 섭취, 수면 패턴 교정이 시급합니다.',
        parentScript: '학생이 스스로 힘들어하고 있습니다. 의지력 문제로 보시면 안 됩니다. 이번 주말에는 공부보다는 무조건적인 휴식과 영양 보충을 우선해주세요.',
        color: 'bg-orange-500'
    };
    if (score >= 41) return {
        grade: '중등도 (Moderate)',
        keyword: '집중 관리',
        description: '학습 효율 저하가 시작되는 단계입니다. 2주 이상의 꾸준한 패턴 교정과 스트레스 관리가 필요합니다.',
        parentScript: '최근 아이가 예민해지거나 집중을 힘들어했을 겁니다. 지금부터 2주 정도는 학습량을 조금 줄이더라도 컨디션 관리에 집중해야 성적이 오릅니다.',
        color: 'bg-yellow-500'
    };
    if (score >= 26) return {
        grade: '경미 (Mild)',
        keyword: '초기 관심',
        description: '증상이 간헐적으로 나타나는 초기 단계입니다. 환경적 요인을 점검하고 예방적 차원의 가벼운 휴식을 권장합니다.',
        parentScript: '큰 문제는 없지만, 가끔 피로해 보일 때가 있네요. 집에서 조금만 더 편안한 환경을 만들어주시면 금방 좋아질 겁니다.',
        color: 'bg-emerald-500'
    };
    return {
        grade: '정상 (Normal)',
        keyword: '안정/양호',
        description: '현재 해당 증상과 관련된 리스크가 거의 없는 안정적인 상태입니다. 현재의 좋은 루틴을 유지하도록 격려해주세요.',
        parentScript: '아주 건강하고 좋은 상태입니다. 지금처럼만 꾸준히 할 수 있도록 칭찬 많이 해주세요.',
        color: 'bg-blue-500'
    };
};

type GuideItem = {
    title: string;
    subTitle?: string;
    expertDesc?: string;
    rationale?: string;
    managerGuide: string;
    action: string;
    difficulty?: 'easy' | 'medium' | 'hard';  // 난이도: 쉬움, 보통, 어려움
};

type StrategySection = {
    title: string;
    intro?: string;
    guides: GuideItem[];
};

// Red Flag 타입 정의 (위험 신호)
type RedFlag = {
    severity: 'warning' | 'critical' | 'emergency';  // 경고 수준
    condition: string;  // 조건/증상
    action: string;  // 조치 사항
    referral?: string;  // 연계 기관 (옵션)
};

// 학부모 전달용 메시지 타입 정의
type ParentScript = {
    category: string;  // 카테고리 (수면, 영양, 운동 등)
    icon: string;  // 아이콘
    shortMessage: string;  // 짧은 메시지 (카톡용)
    detailedMessage: string;  // 상세 메시지 (이메일/문자용)
    tips: string[];  // 구체적인 실천 팁
};

// 성공 지표 (KPI) 타입 정의
type SuccessIndicator = {
    category: string;  // 카테고리 (수면, 정서, 학습 등)
    icon: string;  // 아이콘
    indicator: string;  // 지표 설명
    targetValue: string;  // 목표값
    timeframe: string;  // 기간 (1주, 2주, 1개월 등)
    measureMethod: string;  // 측정 방법
    priority: 'high' | 'medium' | 'low';  // 우선순위
};

// 보조 자료 타입 정의
type Resource = {
    title: string;  // 자료 제목
    type: 'video' | 'pdf' | 'link' | 'image' | 'app';  // 자료 유형
    icon: string;  // 아이콘
    description: string;  // 설명
    url: string;  // 링크 URL
    duration?: string;  // 영상 길이 (optional)
    category: string;  // 카테고리 (호흡, 수면, 운동 등)
};

// 주차별 로드맵 타입 정의
type WeeklyPlan = {
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
type CommonObjection = {
    category: string;  // 카테고리 (시간, 의지, 환경 등)
    icon: string;  // 아이콘
    objection: string;  // 학생의 반박/변명
    response: string;  // 상담사 대응 멘트
    tip?: string;  // 추가 팁 (optional)
};

type CareContent = {
    prestudy: StrategySection;
    learning: StrategySection;
    exercise: StrategySection;
    redFlags?: RedFlag[];  // 위험 신호 목록
};

export const EXPERT_CONTENTS: Record<string, CareContent> = {
    [CareType.HEALTHY]: {
        prestudy: {
            title: "⚡ Step 1. 학습 전 전략 (Pre-Study)",
            intro: "건강한 학생일수록 루틴을 통해 '초몰입' 상태로 진입하는 시간을 단축해야 합니다.",
            guides: [
                {
                    title: "데스크 셋업 (Visual Clean)",
                    expertDesc: "시각적 노이즈를 제거하여 뇌의 인지 부하를 최소화하는 과정입니다.",
                    rationale: "책상 위 잡동사니나 쌓여있는 문제집은 무의식적으로 뇌의 처리 용량을 잡아먹습니다. '지금 공부할 책 1권'만 남기는 행위가 뇌를 학습 모드로 전환시킵니다.",
                    managerGuide: "🗣️ 질문: \"책상 위에 문제집 몇 권 쌓여있나요? 주인공 외에는 다 무대에서 내리세요.\"",
                    action: "공부 과목이 바뀔 때마다 책상을 완전히 비우고 새로 세팅하는 '리셋 타임'을 가지게 하십시오.",
                    difficulty: 'easy'
                },
                {
                    title: "4-7-8 호흡 (Brain Reset)",
                    expertDesc: "부교감 신경을 즉각적으로 활성화하여 산만해진 뇌파(베타파)를 안정된 상태(알파파)로 전환합니다.",
                    rationale: "4초 흡입, 7초 멈춤, 8초 배출의 리듬은 강제적으로 심박수를 낮추고 신경계를 이완시켜, 공부 시작 전 불안감을 없애줍니다.",
                    managerGuide: "🗣️ 제안: \"시험 직전, 딱 1분만 눈 감고 이 호흡을 하면 머리가 맑아집니다.\"",
                    action: "공부 시작 전 3회 반복 실시.",
                    difficulty: 'easy'
                },
                {
                    title: "디지털 디톡스 (Dopamine Control)",
                    expertDesc: "스마트폰을 시야에서 차단하여 도파민 회로를 보호합니다.",
                    rationale: "스마트폰이 책상 위에 있다는 사실만으로도 인지 능력의 일부가 '알림 감지'에 할당되어 성능이 저하됩니다(Brain Drain Effect).",
                    managerGuide: "🗣️ 강조: \"의지력이 아니라 환경으로 이기세요. 폰은 거실에 두는 겁니다.\"",
                    action: "스마트폰을 '다른 방'에 격리하거나 잠금 파우치 사용 권장.",
                    difficulty: 'hard'
                },
                {
                    title: "마이크로 목표 설정 (Micro-Goal)",
                    expertDesc: "추상적인 목표를 구체적인 숫자로 치환하여 뇌를 움직이게 합니다.",
                    rationale: "뇌는 '열심히 하기'라는 명령어를 인식하지 못합니다. '30분간 5문제 풀기'처럼 마감과 분량이 명확할 때 도파민이 분비됩니다.",
                    managerGuide: "🗣️ 질문: \"오늘 목표가 뭐야? '수학 공부' 말고 '수1 20페이지까지 풉니다'라고 말해봐.\"",
                    action: "포스트잇에 종료 시간과 구체적 분량을 적어 눈앞에 부착.",
                    difficulty: 'medium'
                }
            ]
        },
        learning: {
            title: "🧠 Step 2. 학습 전략 (Learning)",
            intro: "최상의 컨디션에서는 'Deep Work' 강도를 높여야 합니다.",
            guides: [
                {
                    title: "포모도로 2.0 (50+10)",
                    expertDesc: "전두엽의 집중력 배터리 한계를 고려한 시간 관리입니다.",
                    rationale: "뇌의 신경전달물질은 무한하지 않습니다. 50분 집중 후 10분은 반드시 쉬어야 하며, 이때 스마트폰을 보면 뇌가 시각 정보를 처리하느라 쉬지 못합니다.",
                    managerGuide: "🗣️ 질문: \"쉬는 시간에 폰 보나요? 그건 뇌를 혹사시키는 겁니다.\"",
                    action: "10분 휴식 시 '멍때리기' 또는 '스트레칭'만 허용.",
                    difficulty: 'easy'
                },
                {
                    title: "백지 복습 (Active Recall)",
                    expertDesc: "메타인지(Meta-cognition)를 극대화하는 인출 학습법입니다.",
                    rationale: "강의를 '보는' 것은 수동적 입력일 뿐입니다. 책을 덮고 빈 종이에 인출해낼 때라야 비로소 단기 기억이 장기 기억으로 전환됩니다.",
                    managerGuide: "🗣️ 제안: \"오늘 배운 내용을 안 보고 엄마한테 설명할 수 있어요? 그게 진짜 앎입니다.\"",
                    action: "학습 직후 A4 용지에 핵심 키워드를 중심으로 마인드맵 그리기.",
                    difficulty: 'medium'
                },
                {
                    title: "The Big 3 우선순위 (Prioritization)",
                    expertDesc: "의사결정 피로(Decision Fatigue)를 줄이고 성취감을 높입니다.",
                    rationale: "가장 어렵고 하기 싫은 과제('개구리')를 뇌 에너지가 가장 충만한 아침에 처리해야 합니다.",
                    managerGuide: "🗣️ 조언: \"수학 킬러 문제부터 아침에 해치우세요. 오후엔 가벼운 마음으로 암기 과목을 하면 됩니다.\"",
                    action: "전날 밤, 내일 반드시 끝낼 가장 중요한 3가지를 미리 적어두기.",
                    difficulty: 'hard'
                },
                {
                    title: "간격 반복 (Spaced Repetition)",
                    expertDesc: "망각 곡선을 역이용하여 장기 기억 저장 효율을 높입니다.",
                    rationale: "뇌는 정보를 처음 입력했을 때보다, 잊어버릴 즈음 다시 꺼낼 때(인출) 가장 강력하게 기억 회로를 강화합니다. 1일-3일-7일 주기의 복습이 기억의 유통기한을 영구적으로 만듭니다.",
                    managerGuide: "🗣️ 체크: \"오늘 배운 거 3일 뒤에 다시 볼 계획 있어? 복습 스케줄이 없으면 공부 안 한 거나 마찬가지야.\"",
                    action: "플래너에 '복습 주기(1, 3, 7일)' 미리 표시하기.",
                    difficulty: 'easy'
                }
            ]
        },
        exercise: {
            title: "🏃 Step 3. 운동 전략 (Body)",
            intro: "신체 활력을 학습 에너지로 전환하는 루틴입니다.",
            guides: [
                {
                    title: "아침 공복 산책 (Morning Walk)",
                    expertDesc: "세로토닌 활성화 및 생체 시계 동기화.",
                    rationale: "기상 직후 햇볕을 보며 걷는 것은 뇌를 깨우는 가장 강력한 신호입니다. 밤에 멜라토닌 분비를 촉진하여 수면 질까지 개선합니다.",
                    managerGuide: "🗣️ 제안: \"아침에 눈 뜨면 바로 20분만 걸으세요. 하루 집중력이 달라집니다.\"",
                    action: "매일 아침 20분, 팔을 가볍게 흔들며 걷기.",
                    difficulty: 'medium'
                },
                {
                    title: "NEAT 운동 (Brain Pumping)",
                    expertDesc: "비운동성 활동 열 생성(NEAT)을 통한 뇌 혈류 공급.",
                    rationale: "오래 앉아 있으면 뇌 산소 공급이 줄어듭니다. 1시간마다 일어나서 움직여야 해마의 신경 생성이 촉진됩니다.",
                    managerGuide: "🗣️ 질문: \"한 번 앉으면 몇 시간 동안 안 일어나나요? 바보가 되는 지름길입니다.\"",
                    action: "쉬는 시간마다 스쿼트 15회 또는 제자리 걸음.",
                    difficulty: 'hard'
                },
                {
                    title: "취침 전 스트레칭 (Relaxation)",
                    expertDesc: "근육 이완을 통한 부교감 신경 활성화.",
                    rationale: "하루 종일 긴장된 승모근과 장요근을 풀어주면 뇌가 '휴식 모드'로 인지하여 깊은 잠에 들 수 있게 합니다.",
                    managerGuide: "🗣️ 조언: \"자기 전 10분, 폼롤러가 수면제보다 낫습니다.\"",
                    action: "취침 30분 전, 조명을 낮추고 정적인 스트레칭 실시.",
                    difficulty: 'easy'
                },
                {
                    title: "고강도 인터벌 (HIIT)",
                    expertDesc: "단시간에 심박수를 최대로 올려 BDNF(뇌 유래 신경영양인자)를 폭발시킵니다.",
                    rationale: "숨이 찰 정도의 고강도 운동은 해마의 신경 세포 생성을 촉진하여 기억력을 직접적으로 향상시키는 유일한 생물학적 방법입니다.",
                    managerGuide: "🗣️ 제안: \"일주일에 두 번은 심장이 터질 것처럼 뛰어봐. 그게 뇌를 업그레이드하는 시간이야.\"",
                    action: "주 2회, 20분간 고강도 인터벌 러닝/사이클.",
                    difficulty: 'medium'
                }
            ]
        }
    },
    [CareType.SLEEP]: {
        prestudy: {
            title: "⚡ Step 1. 수면부족 극복 (Pre-Study)",
            intro: "수면 부족과 불안을 이기는 5분의 기적, '뇌 예열' 루틴입니다.",
            guides: [
                {
                    title: "환경: 시각적 차단 (Visual Clean)",
                    expertDesc: "\"책상은 공부하는 무대입니다. 주인공 외에는 모두 퇴장시키세요.\"",
                    rationale: "쌓여 있는 다른 문제집은 뇌에게 '할 일이 이렇게나 많아'라는 압박감을 줍니다. 시각적 노이즈를 제거하는 것만으로도 뇌의 '인지 부하(Cognitive Load)'가 30% 이상 감소합니다.",
                    managerGuide: "🗣️ 처방: \"책상 위엔 지금 당장 풀 교재, 필기구, 타이머 딱 세 가지만 두세요.\"",
                    action: "공부 과목이 바뀔 때마다 책상을 완전히 비우고 새로 세팅하는 '리셋 타임'을 가지게 하십시오.",
                    difficulty: 'hard'
                },
                {
                    title: "청각: 백색 소음 vs 정적",
                    expertDesc: "\"가사가 있는 노래는 공부가 아니라 '멀티태스킹'을 하게 만듭니다.\"",
                    rationale: "수면이 부족할 때 뇌는 소리에 더 민감하게 반응(하이퍼 센서티브)합니다. 가사가 있는 음악은 뇌의 언어 처리 영역을 사용하므로 독해력을 떨어뜨립니다.",
                    managerGuide: "🗣️ 조언: \"시험장은 정적입니다. 정 힘들면 빗소리 같은 백색소음만 허용하세요.\"",
                    action: "가사 없는 클래식이나 핑크 노이즈(Pink Noise) 권장.",
                    difficulty: 'easy'
                },
                {
                    title: "목표: 메타인지 확립 (Micro-Goal)",
                    expertDesc: "\"막연한 계획은 뇌를 방황하게 하고, 구체적인 계획은 뇌를 달리게 합니다.\"",
                    rationale: "수면 장애가 있는 학생은 의지력이 약해진 상태입니다. '오늘 국어 공부하기' 같은 모호한 목표는 포기를 유발합니다. 마감 기한이 명시된 구체적 목표가 필요합니다.",
                    managerGuide: "🗣️ 강조: \"10시 30분까지, 영단어 50개, 오답노트 작성' 이렇게 적어서 책상 앞에 붙이세요.\"",
                    action: "포스트잇에 '종료 시간'과 '결과물'을 적어 눈앞에 부착.",
                    difficulty: 'medium'
                },
                {
                    title: "심리: 3분 명상 (Brain Reset)",
                    expertDesc: "\"공부 시작 전, 머릿속으로 '성공적인 1교시'를 미리 상영하세요.\"",
                    rationale: "불안은 뇌의 해마(기억 저장소) 활동을 억제합니다. 명상은 편도체를 안정시켜 기억력을 회복시킵니다. 수험생에게 이 루틴은 떨리는 마음을 잡는 데 가장 효과적입니다.",
                    managerGuide: "🗣️ 제안: \"눈을 감고, 내가 문제를 막힘없이 풀고 있는 모습을 1분만 상상해봐.\"",
                    action: "눈 감고 심호흡 3회 → 긍정적 시뮬레이션 → \"나는 준비되었다\" 속으로 외치기."
                }
            ]
        },
        learning: {
            title: "🧠 Step 2. 에너지 최적화 (Learning)",
            intro: "수면 부채(Sleep Debt) 상태의 뇌는 효율이 급락합니다. '선택과 집중'이 생명입니다.",
            guides: [
                {
                    title: "포모도로 기법: 뇌 과부하 방지",
                    expertDesc: "뇌의 '작업 기억' 용량이 줄어든 상태이므로 잦은 휴식이 필수입니다.",
                    rationale: "억지로 오래 앉아 있는 것은 뇌에 과부하를 걸어 정보 처리를 중단시키는 행위입니다. 50분 학습 후 10분 휴식은 '집중력 배터리'를 재충전하는 최소한의 물리적 시간입니다.",
                    managerGuide: "🗣️ 경고: \"쉬는 시간에 스마트폰을 보면 뇌는 시각 정보 처리를 계속하므로 쉬는 게 아닙니다.\"",
                    action: "10분간 자리에서 일어나 눈을 감고 '멍하게' 있기. (DMN 활성화)",
                    difficulty: 'hard'
                },
                {
                    title: "전략적 낮잠 (Power Nap)",
                    expertDesc: "뇌에 쌓인 피로 물질 '아데노신'을 청소하는 시간입니다.",
                    rationale: "15분 내외의 짧은 잠은 오후 학습 효율을 2배 이상 높입니다. 단, 20분이 넘어가면 깊은 잠에 빠져 깨어났을 때 더 몽롱한 '수면 관성'을 겪습니다.",
                    managerGuide: "🗣️ 제안: \"졸음을 참으며 1시간을 버리는 것보다, 15분 자고 45분을 완벽히 집중하는 것이 이득입니다.\"",
                    action: "알람을 20분 뒤로 맞추고, 책상에 엎드려 가볍게 눈 붙이기.",
                    difficulty: 'easy'
                },
                {
                    title: "취침 전 '골든 타임'",
                    expertDesc: "잠은 뇌가 기억을 장기 저장소로 옮기는 '기억 공고화(Consolidation)' 작업 시간입니다.",
                    rationale: "뇌는 취침 직전 마지막으로 입력된 정보를 가장 중요하게 인식하여, 수면 중에 반복 재생(Replay)합니다. 자기 전 폰을 보면 무의미한 영상 정보가 저장됩니다.",
                    managerGuide: "🗣️ 중요: \"네 앞날을 바꿀 지식을 뇌에 마지막으로 넣어라. 자기 전 20분은 복습만 해라.\"",
                    action: "취침 전 20분, 그날 외웠던 단어나 핵심 요약 노트 눈으로 훑기.",
                    difficulty: 'medium'
                },
                {
                    title: "생체 리듬 기반 과목 배치",
                    expertDesc: "무너진 일주기 리듬에 맞춰 뇌 효율이 높은 시간대에 중요 과목을 배치합니다.",
                    rationale: "오전: 코르티솔 수치가 높아 논리적 사고력 최고조 (수학/국어). 오후: 식곤증 및 주의력 저하 (영어듣기/단어/문제풀이).",
                    managerGuide: "🗣️ 전략: \"무식하게 하지 말고 영리하게 하자. 머리 아픈 수학은 오전에 끝내라.\"",
                    action: "오전: 수학/비문학, 오후: 영어/탐구/오답정리 로 스케줄 재조정.",
                    difficulty: 'hard'
                }
            ]
        },
        exercise: {
            title: "🏃 Step 3. 운동 처방 (Body)",
            intro: "\"공부할 시간을 빼서 운동하는 게 아니라, 공부 효율을 만들기 위해 몸을 쓰는 것입니다.\"",
            guides: [
                {
                    title: "햇볕 산책: 생체 시계 동기화",
                    expertDesc: "낮의 햇볕은 밤에 분비될 멜라토닌(수면 호르몬)의 총량을 결정합니다.",
                    rationale: "점심시간 15분 산책 시 눈으로 들어온 빛은 세로토닌을 만들고, 이는 밤에 멜라토닌으로 전환되어 '천연 수면제' 역할을 합니다.",
                    managerGuide: "🗣️ 처방: \"선글라스 벗고 걸으세요. 이게 밤에 널 재워줄 수면제 버튼입니다.\"",
                    action: "점심 식사 직후 운동장 2~3바퀴 돌며 햇볕 쬐기.",
                    difficulty: 'easy'
                },
                {
                    title: "고강도 스쿼트: 뇌 혈류 충전",
                    expertDesc: "오래 앉아 있으면 혈액이 하체에 쏠려 뇌 산소 공급이 부족해집니다.",
                    rationale: "하체는 제2의 심장입니다. 스쿼트는 정맥혈을 뇌로 강력하게 펌핑합니다. 단 3분만으로도 뇌 혈류량이 증가하여 인지 기능이 즉각 살아납니다.",
                    managerGuide: "🗣️ 자극: \"졸린 건 의지 부족이 아니라 뇌에 피가 안 돌아서 그래. 일어나서 스쿼트 해.\"",
                    action: "쉬는 시간마다 15회씩 3세트. (숨이 살짝 찰 정도)",
                    difficulty: 'medium'
                },
                {
                    title: "L자 다리: 부교감 신경 스위치",
                    expertDesc: "하루 종일 과활성된 교감 신경을 끄고, 뇌를 휴식 모드로 전환합니다.",
                    rationale: "벽에 다리를 올리면 심박수가 낮아지고 부교감 신경이 활성화됩니다. 뇌에게 '이제 전투(공부) 끝, 휴식 시작'이라는 신호를 주는 것입니다.",
                    managerGuide: "🗣️ 루틴: \"자기 전 스마트폰 대신 L자 다리를 하세요. 뇌가 식어야 잠이 옵니다.\"",
                    action: "자기 전 10분, 벽에 다리 올리고 복식 호흡 하기.",
                    difficulty: 'hard'
                },
                {
                    title: "복근 호흡 (Belly Breathing)",
                    expertDesc: "수면 뇌파(델타파)를 유도하는 횡경막 호흡법입니다.",
                    rationale: "누워서 배 위에 무거운 책을 올리고 호흡하면 자연스럽게 복식 호흡이 유도되어, 교감 신경을 끄고 수면 모드로 진입합니다.",
                    managerGuide: "🗣️ 제안: \"잠이 안 오면 배 위에 책을 올리고 그 책을 숨으로 들어올려봐.\"",
                    action: "취침 시 배 위에 책을 올리고 5분간 호흡 집중.",
                    difficulty: 'easy'
                }
            ]
        }
    },
    [CareType.BURNOUT]: {
        prestudy: {
            title: "⚡ Step 1. 학습 시작 및 심리 닻 내리기 (Pre-Study)",
            intro: "\"비우기, 다스리기, 각인하기, 선언하기.\" 번아웃 뇌는 예민한 상태입니다. 신경계의 강제 진정과 정서적 프라이밍이 시작의 핵심입니다.",
            guides: [
                {
                    title: "데스크 미니멀리즘 (Sensory Control)",
                    expertDesc: "뇌의 인지 자원 낭비를 원천 봉쇄하기 위해 시각적 노이즈를 완벽히 차단합니다.",
                    rationale: "시야에 여러 권의 책이나 플래너가 보이면 뇌는 남은 공부량을 계산하며 무의식적 피로를 느낍니다. '단일 목적지'를 설정해야 뇌가 안심합니다.",
                    managerGuide: "🗣️ 코칭: \"지금 네 뇌는 용량이 꽉 찬 상태야. 시야에는 지금 당장 할 '단 한 권'만 남기고 나머지는 모두 독이야.\"",
                    action: "공부할 책 한 권을 제외한 모든 물건을 서랍에 넣거나 시야 밖으로 치우기.",
                    difficulty: 'medium'
                },
                {
                    title: "박스 브리딩 & 3회 심호흡",
                    expertDesc: "네이비 실이 사용하는 4-4-4-4 호흡법으로 자율신경계를 즉각적으로 안정시킵니다.",
                    rationale: "번아웃은 교감 신경이 과활성화된 상태입니다. 호흡을 통해 심박수를 강제로 늦춤으로써 뇌에 '이제 안전하다'는 신호를 보낼 수 있습니다.",
                    managerGuide: "🗣️ 코칭: \"심장이 빨리 뛰는 건 네 의지가 아니야. 하지만 호흡으로 늦출 수는 있어. 4초씩 끊어서 숨을 쉬어보자.\"",
                    action: "4-4-4-4 호흡 3세트 실시 후 \"나는 차분하다\"라고 3번 확언하기."
                },
                {
                    title: "작은 성공의 시각화 (Micro-Visualizing)",
                    expertDesc: "방대한 목표 대신 '딱 하나'를 해결하는 자신의 활기찬 모습을 미리 그려봅니다.",
                    rationale: "거창한 목표는 회피 동기를 만듭니다. '딱 한 문제', '딱 한 페이지'의 성취감을 시각화하여 도파민 수치를 미세하게 끌어올려야 몰입 진입이 쉽습니다.",
                    managerGuide: "🗣️ 코칭: \"오늘 공부 다 끝낸 모습은 너무 멀어. 딱 하나, 이 단원 개념 하나만 이해하고 기쁘게 일어나는 네 모습을 그려봐.\"",
                    action: "성공적인 1교시의 모습을 1분간 상상하며 학습 효능감 회복하기.",
                    difficulty: 'hard'
                },
                {
                    title: "마이크로 목표 설정 (Small Wins)",
                    expertDesc: "가장 작은 단위의 성공을 설계하여 고갈된 성취감을 충전합니다.",
                    rationale: "번아웃 상태에서는 큰 목표가 오히려 독이 됩니다. '단어 5개 외우기'처럼 실패할 수 없는 목표를 달성하여 도파민 회로를 복구해야 합니다.",
                    managerGuide: "🗣️ 코칭: \"거창한 계획 필요 없어. 딱 10분만 앉아있는 것도, 단어 하나 외우는 것도 성공이야.\"",
                    action: "아주 쉬운 난이도의 '초소형 목표' 설정 및 달성 체크.",
                    difficulty: 'easy'
                }
            ]
        },
        learning: {
            title: "🧠 Step 2. '최소 기능' 회복 전략 (Learning)",
            intro: "\"완벽한 계획보다 위대한 것은 이어가는 흐름입니다.\" 번아웃 시에는 공부의 양보다 '공부의 관성'을 살리는 것이 최우선입니다.",
            guides: [
                {
                    title: "20:5 룰과 다크 룸 효과",
                    expertDesc: "뇌의 인지적 피로를 막기 위한 엄격한 '분리' 법칙입니다. 50:10보다 더 짧은 호흡이 필요합니다.",
                    rationale: "과열된 엔진은 짧게 자주 식혀야 합니다. 5분 휴식 시 눈을 감아 시각 정보를 차단(Dark Room)하는 것만으로 알파파 활성화와 회복 속도가 비약적으로 향상됩니다.",
                    managerGuide: "🗣️ 코칭: \"지금 너의 엔진은 과열 상태야. 20분만 짧게 끊고, 5분은 반드시 눈 감고 뇌를 완전히 쉬게 해주자.\"",
                    action: "20분 집중 후 5분 완전 휴식 (스마트폰 절대 금지 - 화면 보는 것은 노동입니다).",
                    difficulty: 'medium'
                },
                {
                    title: "유능감 회복: 난이도 하향",
                    expertDesc: "전체 학습 시간의 40%를 '아는 내용 복습'에 할당하여 심리적 자본을 확보합니다.",
                    rationale: "어려운 문제는 자괴감을 부릅니다. 정답률 80% 이상의 문제집을 선정하여 '맞히는 쾌감'이라는 도파민 성공 경험을 의도적으로 설계해야 합니다.",
                    managerGuide: "🗣️ 코칭: \"어려운 문제를 못 푸는 건 뇌에 에너지가 없어서야. 쉬운 문제로 '성공 경험'이라는 도파민을 먼저 채우자.\"",
                    action: "킬러 문항 중단, 개념서 및 기출 오답 위주의 '유능감 회복' 스케줄 편성.",
                    difficulty: 'hard'
                },
                {
                    title: "Input 중심 학습 (에너지 보존)",
                    expertDesc: "능동적 '출력'이 버거울 때는 수동적 '입력'으로 전환하여 학습 결손을 방지합니다.",
                    rationale: "문제 풀이는 에너지를 100 소모하지만, 인강 시청은 30만 씁니다. 상태가 나쁠 때는 흐름을 놓치지 않는 '연결' 자체에 목적을 둡니다.",
                    managerGuide: "🗣️ 코칭: \"직접 푸는 건 힘들 수 있어. 오늘은 펜 내려놓고 인강을 편하게 보거나 요약 노트를 소설처럼 읽어보자.\"",
                    action: "인강 1.2배속 시청 또는 기존 요약 노트 가벼운 훑어보기 중심 학습.",
                    difficulty: 'easy'
                },
                {
                    title: "밤 10시 이후 전략적 과목 배치",
                    expertDesc: "전두엽 기능이 저하되는 밤 시간에는 사고력보다 암기/단순 과목을 배치합니다.",
                    rationale: "밤에는 논리·추론보다 기억 유지가 유리합니다. 복잡한 수식 대신 단순 루틴을 선택하여 뇌의 인지 부하를 전략적으로 줄여야 합니다.",
                    managerGuide: "🗣️ 코칭: \"밤 10시부턴 머리 쓰는 수학은 그만. 단순 반복이나 단어 암기처럼 뇌 에너지가 적게 드는 걸로 마무리하자.\"",
                    action: "22:00 이후에는 사고력 과목 제외, 단순 암기 또는 체크리스트 정리로 변경.",
                    difficulty: 'medium'
                }
            ]
        },
        exercise: {
            title: "🏃 Step 3. 신체 정화 및 뇌 혈류 최적화 (Exercise)",
            intro: "\"수험생에게 운동은 몸을 만드는 게 아니라, 뇌를 비우고 채울 공간을 만드는 시간입니다.\" 근성장이 아닌 Wash-out이 목적입니다.",
            guides: [
                {
                    title: "Wash-out 산책 & 폼롤러",
                    expertDesc: "코르티솔 수치를 낮추고 부교감 신경을 활성화하는 저강도 정화 루틴입니다.",
                    rationale: "번아웃 시 고강도 운동은 독입니다. 저녁 20분 산책과 폼롤러 이완은 뇌에 '이제 안전하다'는 신호를 보내 근피로와 심리적 긴장을 동시에 해소합니다.",
                    managerGuide: "🗣️ 코칭: \"운동은 단순히 몸 쓰는 게 아니라 뇌 노폐물을 씻어내는 시간이야. 폼롤러가 수면제보다 낫단다.\"",
                    action: "저녁 식후 20분 산책, 자기 전 스트레칭 및 폼롤러 근막 이완.",
                    difficulty: 'hard'
                },
                {
                    title: "L자 다리 & 맥켄지 (뇌 산소 공급)",
                    expertDesc: "고인 혈액을 뇌로 되돌리고 물리적으로 막힌 혈류 통로를 뚫어주는 작업입니다.",
                    rationale: "L자 다리는 하체 정맥혈을 심장으로 가이드하며, 맥켄지 운동은 거북목으로 압박된 추골동맥을 해방시켜 즉각적으로 뇌를 맑게 만듭니다.",
                    managerGuide: "🗣️ 코칭: \"하체에 고인 피를 뇌로 보내야 집중력이 돌아와. 목 뒤를 열어줘야 뇌가 숨을 쉰다.\"",
                    action: "자기 전 L자 다리 10분, 학습 틈틈이 맥켄지 스트레칭 실시.",
                    difficulty: 'easy'
                },
                {
                    title: "광(光) 테라피: 점심 햇볕 산책",
                    expertDesc: "햇볕을 통해 세로토닌을 분비시키고 밤의 숙면(멜라토닌)을 예약하는 루틴입니다.",
                    rationale: "낮에 쬐는 15분의 햇볕은 천연 항우울제 비타민을 만들고, 밤에 뇌가 정보를 완벽히 정리할 수 있는 숙면 환경을 설계합니다.",
                    managerGuide: "🗣️ 코칭: \"점심 산책은 행복 알약을 먹는 시간이야. 낮에 걸어야 밤에 깊게 자고 뇌가 공부한 걸 저장해.\"",
                    action: "점심시간 최소 15분 이상, 선글라스 없이 야외 산책 수행.",
                    difficulty: 'medium'
                },
                {
                    title: "Drop & Release (과긴장 해소)",
                    expertDesc: "승모근 수축-이완을 통해 뇌에 '전투 종료' 신호를 보내는 즉각적 처방입니다.",
                    rationale: "어깨가 올라간 상태는 뇌가 비상 상황임을 뜻합니다. 어깨만 강제로 내려도 뇌는 스트레스가 끝났다고 인식하고 이완 모드로 전환합니다.",
                    managerGuide: "🗣️ 코칭: \"숨을 들이마시며 어깨를 귀까지 바짝 올렸다가, 내뱉으며 툭! 떨어뜨려 봐. 전투 모드를 끄는 스위치야.\"",
                    action: "매 교시 종료 후 또는 50분마다 'Drop & Release' 3회 반복.",
                    difficulty: 'hard'
                }
            ]
        }
    },
    [CareType.CIRCULATION]: {
        prestudy: {
            title: "⚡ Step 1. 브레인 오픈 루틴 (Pre-Study)",
            intro: "\"준비 운동 없이 전력 질주하면 근육이 놀라듯, 뇌도 예열 없이 공부하면 금방 지친다.\" 피로는 의지 부족이 아니라 산소 차단의 결과입니다.",
            guides: [
                {
                    title: "종아리 펌핑 (엔진 시동)",
                    expertDesc: "하체에 머물러 있는 70%의 혈액을 뇌로 쏘아 올리는 '역류 유도' 과정입니다.",
                    rationale: "종아리 근육(비복근)은 '제2의 심장'입니다. 까치발 운동은 정맥혈을 심장과 뇌 방향으로 강력하게 밀어 올려 전신 순환을 시작합니다.",
                    managerGuide: "🗣️ 코칭: \"지금 하는 까치발 운동이 네 뇌에 산소 공급을 시작하는 엔진 시동이야.\"",
                    action: "제자리에 서서 까치발 들기 30회 실시.",
                    difficulty: 'easy'
                },
                {
                    title: "경추 및 어깨 이완 (통로 개방)",
                    expertDesc: "목과 어깨의 경직을 풀어 뇌로 가는 경동맥의 '병목 현상'을 제거합니다.",
                    rationale: "풍지혈 자극과 경추 신전은 머리로 올라가는 혈류 저항을 즉각적으로 낮추어 두통 예방과 안구 건조 완화에 탁월합니다.",
                    managerGuide: "🗣️ 코칭: \"막힌 통로를 열지 않고 공부하는 것은 수도꼭지를 잠그고 물을 마시는 것과 같다.\"",
                    action: "풍지혈 지압과 동시에 고개를 뒤로 젖히는 신전 운동 (5초 유지).",
                    difficulty: 'medium'
                },
                {
                    title: "Box Breathing (정밀 조절)",
                    expertDesc: "심리적 안정과 뇌의 화학적 상태를 최적화하는 특수 호흡법입니다.",
                    rationale: "4-4-4-4 호흡법은 자율신경계를 안정시키고 뇌의 이산화탄소 농도를 최적화하여 즉각적으로 '몰입(Flow)' 상태에 진입하게 합니다.",
                    managerGuide: "🗣️ 코칭: \"이 5분간의 호흡이 네 뇌를 완벽한 '몰입 모드'로 세팅해 줄 거야.\"",
                    action: "4초 흡입 - 4초 멈춤 - 4초 배출 - 4초 멈춤 루틴 수행.",
                    difficulty: 'hard'
                },
                {
                    title: "환경 및 태도 점검 (Final Check)",
                    expertDesc: "물리적 순환 환경과 정서적 태도를 최종 점검합니다.",
                    rationale: "수분 보충은 혈액 점도를 낮추고, 흉곽을 여는 자세 교정은 호흡 효율을 확보합니다. 스마트폰 차단은 도파민 수치를 보호합니다.",
                    managerGuide: "🗣️ 강조: \"시원한 물 한 잔 마시고, 가슴을 펴라. 폰은 시야에서 완전히 치운다.\"",
                    action: "미온수 1잔 음용, 라운드 숄더 교정 확인, 스마트폰 격리.",
                    difficulty: 'easy'
                }
            ]
        },
        learning: {
            title: "🧠 Step 2. 전략적 혈행 관리 (Learning)",
            intro: "\"공부는 머리로 하는 것이 아니라 '순환하는 몸'으로 하는 것입니다.\" 혈액 정체는 인지 저하의 핵심 원인입니다.",
            guides: [
                {
                    title: "50/10 루틴과 하체 리커버리",
                    expertDesc: "학습 흐름을 깨지 않으면서 신체를 회복시키는 리셋 전략입니다.",
                    rationale: "L자 다리 자세는 중력으로 다리 정맥혈을 심장으로 되돌려 부종을 제거하고 머리를 맑게 합니다.",
                    managerGuide: "🗣️ 지시: \"지금 하체에 고인 혈액을 뇌로 보내야 집중력이 2배가 됩니다. L자 다리 3분 시작!\"",
                    action: "50분 집중 후 10분 휴식 강제 및 L자 다리(3분) 수행.",
                    difficulty: 'medium'
                },
                {
                    title: "산소 로딩 (Oxygen Loading)",
                    expertDesc: "환기와 호흡을 통해 이산화탄소 농도를 조절하고 뇌 기능을 깨웁니다.",
                    rationale: "실내 산소 농도가 낮아지면 뇌 기능이 멈춥니다. 심호흡은 뇌에 산소를 공급하는 '가장 빠른 각성제'입니다.",
                    managerGuide: "🗣️ 조언: \"졸음은 의지의 문제가 아니라 산소 부족입니다. 당장 창문을 열고 심호흡 10회 하세요.\"",
                    action: "매 교시 종료 후 창문 환기 및 졸음 시 심호흡 10회 실시.",
                    difficulty: 'hard'
                },
                {
                    title: "Active Recall Walking (동적 암기)",
                    expertDesc: "앉아서 외워지지 않는 내용을 '발바닥 자극'을 이용해 학습합니다.",
                    rationale: "걸을 때 발바닥에 가해지는 자극은 뇌세포를 활성화하며, 동적 암기는 장기 기억 전환에 훨씬 유리합니다.",
                    managerGuide: "🗣️ 교육: \"앉아서만 외우지 말고 복도를 걸으세요. 발바닥이 자극될 때 뇌는 더 잘 기억합니다.\"",
                    action: "암기 노트를 들고 복도를 천천히 걸으며 학습 수행.",
                    difficulty: 'easy'
                },
                {
                    title: "물리적 환경 최적화 (Equipment)",
                    expertDesc: "신체 압박을 최소화하여 원활한 순환을 유도하는 보조 도구 활용입니다.",
                    rationale: "발판은 하체 압박을 줄이고, 압박 스타킹은 정맥 순환을 보조합니다. 수분 섭취는 혈액 순환 속도를 유지합니다.",
                    managerGuide: "🗣️ 코칭: \"무릎을 골반보다 높게 두고, 다리가 저리면 압박 스타킹을 써라. 미온수는 시간당 한 잔이다.\"",
                    action: "발판 사용, 압박 스타킹 권장, 시간당 미온수 종이컵 1잔 섭취.",
                    difficulty: 'medium'
                }
            ]
        },
        exercise: {
            title: "🏃 Step 3. 신체 펌핑 시스템 (Exercise)",
            intro: "\"이것은 운동이 아니라, 뇌가 멈추지 않게 기름을 치는 '브레인 펌핑' 과정이다.\" 5분 투자로 50분 집중력을 사는 법입니다.",
            guides: [
                {
                    title: "모관 운동 (말초 혈관 각성)",
                    expertDesc: "기상 직후 경직된 사지의 혈관과 신경을 깨우는 전신 각성법입니다.",
                    rationale: "뇌를 깨우는 가장 과학적인 방법은 뇌 자체가 아니라 손끝, 발끝의 말초 신경을 흔드는 것입니다.",
                    managerGuide: "🗣️ 멘트: \"오늘 아침 손끝까지 피를 깨우고 왔나요? 모관 운동 1분이면 머리가 맑아집니다.\"",
                    action: "기상 직후 침대에서 팔다리를 들어 1분간 가볍게 떨기.",
                    difficulty: 'hard'
                },
                {
                    title: "마이크로 펌핑 (학습 중 루틴)",
                    expertDesc: "앉아 있는 시간을 방해하지 않으면서 집중력을 유지하는 실용 기술입니다.",
                    rationale: "뒤꿈치 들기는 하체의 피를 위로 올리는 펌프 역할을 하며, 주먹 쥐기는 뇌의 인지 영역을 활발하게 자극합니다.",
                    managerGuide: "🗣️ 강조: \"앉아만 있지 말고 뒤꿈치를 20번 드세요. 틈틈이 주먹을 쥐었다 펴는 게 뇌 활성화에 좋습니다.\"",
                    action: "발뒤꿈치 들기, 주먹 쥐고 펴기, 양치 시 스쿼트 20회.",
                    difficulty: 'easy'
                },
                {
                    title: "식후 파워 워킹 (Slump 방어)",
                    expertDesc: "식후 식곤증을 막고 오후 집중력 골든타임을 확보하는 산책 루틴입니다.",
                    rationale: "식사 후 빠른 걸음은 소화를 돕고 혈액을 뇌로 고루 분산시켜 오후 2~4시 집중력 하락을 방어합니다.",
                    managerGuide: "🗣️ 감독: \"식사 후 바로 앉지 마세요. 15분 걷기가 오후 1시간의 집중력을 결정합니다.\"",
                    action: "점심 식사 직후 15분간 빠른 걸음으로 산책.",
                    difficulty: 'medium'
                },
                {
                    title: "다운독 (뇌 혈류 리셋)",
                    expertDesc: "하루 동안 쌓인 척추 압박을 해소하고 뇌에 혈류를 공급하는 숙면 유도법입니다.",
                    rationale: "엉덩이를 높이 드는 자세는 뇌 혈류 공급을 돕고 목과 어깨의 긴장을 풀어 피로 물질 배출을 유도합니다.",
                    managerGuide: "🗣️ 교육: \"자기 전 다운독 1분은 내일 아침의 맑은 머리를 결정하는 투자입니다.\"",
                    action: "취침 전 'ㅅ'자 모양의 다운독 자세 1분간 유지.",
                    difficulty: 'hard'
                }
            ]
        }
    },
    [CareType.CONCENTRATION]: {
        prestudy: {
            title: "⚡ Step 1. 브레인 오픈 & 몰입 환경 조성 (Pre-Study)",
            intro: "\"공부 시작 전의 '심리적 저항'을 줄이고, 뇌가 외부 자극에 한눈을 팔지 못하도록 물리적·심리적 차단막을 형성해야 합니다.\"",
            guides: [
                {
                    title: "디지털 격리 의식 (Smartphone Isolation)",
                    expertDesc: "스마트폰을 시야에서 완전히 치우는 물리적 분리가 인지 부하를 줄이는 핵심입니다.",
                    rationale: "스마트폰이 시야에 있는 것만으로도 뇌의 인지 자원 일부가 '폰을 만지지 않으려는 노력'에 소모됩니다. 자제력이 필요 없는 환경을 만드는 것이 우선입니다.",
                    managerGuide: "🗣️ 확인: \"스마트폰은 방 밖에 두었니? 단순히 뒤집어 놓는 게 아니라 물리적 분리가 필요해.\"",
                    action: "스마트폰을 공부방 밖(물리적 분리)에 두기.",
                    difficulty: 'easy'
                },
                {
                    title: "시각적 미니멀리즘 (Desk Setup)",
                    expertDesc: "책상 위에는 '지금 당장 풀 교재 한 권'과 필기구 외에는 모두 치웁니다.",
                    rationale: "시각 정보가 많으면 뇌는 무의식적으로 다음에 할 일을 고민하며 에너지를 분산시킵니다. 단일 목적지 설정이 몰입의 시작입니다.",
                    managerGuide: "🗣️ 확인: \"책상 위에 지금 풀 문제집 외에 다른 게 있지는 않니? 시각적 노이즈를 싹 지우자.\"",
                    action: "교재 한 권 외 모든 물건을 서랍에 넣거나 시야 밖으로 치우기.",
                    difficulty: 'medium'
                },
                {
                    title: "5분 몰입 스위치 (Brain Dump & Masking)",
                    expertDesc: "잡생각을 비우고 청각 보호막을 켜는 뇌 가동 알고리즘입니다.",
                    rationale: "3분 브레인 덤프는 워킹 메모리의 쓰레기 데이터를 비워 학습 효율을 높이며, 백색 소음은 돌발 소음으로부터 주의력을 보호합니다.",
                    managerGuide: "🗣️ 조언: \"머릿속 잡생각을 종이에 다 적고 구겨버려. 그리고 백색소음으로 너만의 차단막을 켜자.\"",
                    action: "3분 브레인 덤프 및 메트로놈/백색소음 활용.",
                    difficulty: 'hard'
                },
                {
                    title: "D-Day 확언 (Affirmation)",
                    expertDesc: "오늘의 학습이 미래의 성취와 연결됨을 뇌에 각인시킵니다.",
                    rationale: "막연한 공부는 뇌를 지치게 합니다. 오늘 이 공부가 나의 어떤 목표(대학, 점수)를 달성하게 해주는지 언어화하면 동기부여 회로가 재가동됩니다.",
                    managerGuide: "🗣️ 질문: \"이거 풀면 대학 간다. 네가 가고 싶은 그곳을 딱 3번만 말하고 시작해.\"",
                    action: "학습 전 '나는 ~를 위해 오늘 ~를 정복한다' 한 줄 쓰기.",
                    difficulty: 'easy'
                }
            ]
        },
        learning: {
            title: "🧠 Step 2. 에너지 최적화 및 출력 학습 (Learning)",
            intro: "뇌 과학적 원리와 가용 에너지를 극대화하여 '단순 공부'를 '시험 합격'으로 연결하는 고밀도 학습 전략입니다.",
            guides: [
                {
                    title: "뽀모도로 기법 (25/5 루틴)",
                    expertDesc: "25분 집중 후 5분 휴식 세션을 통해 집중력 밀도를 높이고 도파민을 관리합니다.",
                    rationale: "의지력은 소모성 자원입니다. 휴식 시간에 스마트폰을 사용하지 않는 것이 다음 집중을 위한 뇌의 휴식 공간을 확보하는 길입니다.",
                    managerGuide: "🗣️ 가이드: \"25분만 딱 집중하고 5분은 폰 없이 쉬자. 도파민을 아껴야 다음 판도 이긴다.\"",
                    action: "25분 집중 / 5분 휴식 4회 반복 후 20분간 긴 휴식.",
                    difficulty: 'medium'
                },
                {
                    title: "골든 타임 배치 (Peak Performance)",
                    expertDesc: "에너지가 가장 높은 오전 10시에 가장 취약하거나 고난도인 과목을 배치합니다.",
                    rationale: "어려운 과제(개구리)를 아침에 먼저 처리해야 합니다. 저녁에는 의지력이 고갈되어 학습 효율이 급격히 떨어지기 때문입니다.",
                    managerGuide: "🗣️ 확인: \"오늘 오전 10시, 가장 에너지가 많이 필요한 과목(수학 등)을 끝냈니?\"",
                    action: "오전 중 취약 과목 또는 킬러 문항 집중 배치.",
                    difficulty: 'hard'
                },
                {
                    title: "백지 복습 & 실전 동기화",
                    expertDesc: "시험 시간표 동기화와 인출 학습으로 메타인지오류를 깨뜨립니다.",
                    rationale: "실제 시간표에 맞춘 컨디셔닝은 시험 당일 최대 성능을 보장하며, 백지 복습은 '안다'는 착각을 방지하는 가장 강력한 도구입니다.",
                    managerGuide: "🗣️ 확인: \"지금 공부한 내용을 책 안 보고 키워드 3개로 말해볼 수 있니? 실제 시간표에 맞췄지?\"",
                    action: "학습 직후 A4 백지 복습 및 실제 시험 시간표에 따른 과목 배치.",
                    difficulty: 'easy'
                },
                {
                    title: "교차 학습 & 오답 잔상",
                    expertDesc: "과목을 주기적으로 교체하여 뇌의 지루함을 방지하고 자기 전 오답을 복습합니다.",
                    rationale: "뇌는 새 자극을 받을 때 집중력이 상승합니다. 수면 중 뇌는 마지막 정보를 우선순위로 정리하므로 취침 전 오답은 장기 기억 전환율을 높입니다.",
                    managerGuide: "🗣️ 전략: \"과목을 2시간마다 바꿔서 뇌를 깨워라. 잠들기 전엔 오늘의 오답을 꼭 뇌에 남겨야 해.\"",
                    action: "1.5~2시간 단위 과목 교체 및 취침 전 15분 오답 잔상 공부.",
                    difficulty: 'medium'
                }
            ]
        },
        exercise: {
            title: "🏃 Step 3. 뇌 각성 및 공부 체력 (Exercise)",
            intro: "\"운동은 근육이 아니라 뇌에 신선한 산소를 주입하는 공부의 연장선입니다.\"",
            guides: [
                {
                    title: "뇌 각성 심박수 펌핑",
                    expertDesc: "학습 직전 유산소 활동으로 뇌를 즉각적인 '전투 모드'로 전환합니다.",
                    rationale: "심박수가 올라가면 뇌로 가는 혈류량이 증가하여 산소와 포도당이 원활히 공급됩니다. 뇌 기능을 깨우는 직접적인 피드백입니다.",
                    managerGuide: "🗣️ 제안: \"무기력할 땐 딱 30번만 제자리 뛰기 하고 시작하자. 뇌에 시동을 걸어주는 거야.\"",
                    action: "공부 시작 전 5분간 줄넘기 또는 팔벌려뛰기 실시.",
                    difficulty: 'hard'
                },
                {
                    title: "세로토닌 햇볕 산책",
                    expertDesc: "오전 시간의 햇볕은 세로토닌을 분비시켜 하루 집중력의 총량을 결정합니다.",
                    rationale: "낮의 세로토닌은 밤에 멜라토닌으로 변해 숙면을 돕습니다. 집중력 호르몬의 선순환을 만드는 기초 필수 루틴입니다.",
                    managerGuide: "🗣️ 권장: \"복도 끝 창가에서라도 햇볕을 쬐어라. 그게 오늘 너의 집중력 알약이 될 거야.\"",
                    action: "오전 등교 후 또는 쉬는 시간 활용 햇볕 쬐기 (10분).",
                    difficulty: 'easy'
                },
                {
                    title: "월 스트레칭 (정렬 유지)",
                    expertDesc: "거북목 방지가 곧 집중력 유지입니다. 신체 정렬을 통한 인지 효율 저하를 막습니다.",
                    rationale: "고개를 숙이는 각도가 커질수록 목과 뇌에 가해지는 하중이 급증합니다. 신체적 통증은 집중력을 갉아먹는 최대의 적입니다.",
                    managerGuide: "🗣️ 강조: \"몸이 굳으면 생각도 굳어. 어깨를 뒤로 젖히고 목을 펴야 다음 50분을 이길 수 있어.\"",
                    action: "매 교시 종료 후 1분간 벽 스트레칭 (턱 당기기, 어깨 펴기).",
                    difficulty: 'medium'
                },
                {
                    title: "주말 뇌 세척 (HIIT)",
                    expertDesc: "주말 중 1회 고강도 운동으로 기억력을 담당하는 해마의 기능을 강화합니다.",
                    rationale: "고강도 운동 시 분비되는 BDNF는 뇌를 세척하고 업데이트하는 영양 인자입니다. 한 주간 쌓인 뇌의 스트레스를 해소하는 시간입니다.",
                    managerGuide: "🗣️ 응원: \"주말엔 땀이 흠뻑 날 정도로 뛰자. 뇌를 다시 로딩하고 업데이트하는 필수의 시간이야.\"",
                    action: "주말 중 20~30분 고강도 인터벌 운동 수행.",
                    difficulty: 'hard'
                }
            ]
        }
    },
    [CareType.ADRENAL]: {
        prestudy: {
            title: "⚡ Step 1. 에너지 누수 차단 (Pre-Study)",
            intro: "\"부신이 지친 학생에게 '의지력'을 강요하는 것은 폭력입니다.\" 에너지를 쥐어짜지 않고 흐름을 타는 것이 핵심입니다.",
            guides: [
                {
                    title: "데스크 셋업 (Visual Clean)",
                    expertDesc: "시각적 자극을 최소화하여 뇌의 에너지 소모를 줄입니다.",
                    rationale: "부신 피로 상태에서는 작은 자극도 큰 스트레스로 다가옵니다. 시야에 '지금 할 것'만 남겨두는 것이 가장 강력한 에너지 보존법입니다.",
                    managerGuide: "🗣️ 코칭: \"책상 위에 이것저것 두지 마세요. 시야가 깨끗해야 뇌가 안 지칩니다.\"",
                    action: "책상 위 잡동사니 제거, 공부할 책 한 권만 배치.",
                    difficulty: 'easy'
                },
                {
                    title: "골든 타임 사수 (Sleep Hygiene)",
                    expertDesc: "부신 회복의 핵심인 밤 11시 취침을 목표로 합니다.",
                    rationale: "밤 11시가 넘으면 '세컨드 윈드' 현상으로 인해 오히려 각성되어 잠들기 어려워지고 부신은 더 고갈됩니다.",
                    managerGuide: "🗣️ 강력 권고: \"밤 11시 넘어서 공부하지 마세요. 그건 공부가 아니라 몸을 깎아먹는 겁니다.\"",
                    action: "밤 10시 30분 취침 준비, 11시 소등 및 수면.",
                    difficulty: 'medium'
                },
                {
                    title: "전자기기 차단 (Digital Detox)",
                    expertDesc: "취침 전 블루라이트 차단으로 코르티솔 분비를 억제합니다.",
                    rationale: "블루라이트는 뇌를 낮으로 착각하게 만들어 코르티솔 수치를 높입니다. 이는 부신을 쉬지 못하게 만듭니다.",
                    managerGuide: "🗣️ 약속: \"자기 전 1시간은 폰 금지입니다. 정 심심하면 종이책을 보세요.\"",
                    action: "취침 1시간 전 스마트폰 사용 금지 및 격리.",
                    difficulty: 'hard'
                },
                {
                    title: "D-Day 확언 (Positivity)",
                    expertDesc: "긍정적인 확언으로 심리적 스트레스를 낮춥니다.",
                    rationale: "부신 피로는 심리적 압박감에서 오는 경우가 많습니다. '나는 매일 조금씩 나아지고 있다'는 확언이 코르티솔 수치를 낮춥니다.",
                    managerGuide: "🗣️ 응원: \"너는 충분히 잘하고 있어. 오늘 하루도 고생했다고 스스로에게 말해주자.\"",
                    action: "학습 시작 전 긍정 확언 3회 낭독.",
                    difficulty: 'easy'
                }
            ]
        },
        learning: {
            title: "🧠 Step 2. 부신 친화적 영양 & 학습 (Nutrition)",
            intro: "\"잘 먹는 것이 곧 공부입니다.\" 혈당 롤러코스터를 막아야 부신을 지킬 수 있습니다.",
            guides: [
                {
                    title: "혈당 롤러코스터 방지",
                    expertDesc: "정제 탄수화물을 제한하여 급격한 혈당 변동을 막습니다.",
                    rationale: "혈당이 널뛰면 부신은 이를 조절하기 위해 계속 일해야 합니다. 아침에 단백질 위주 식사는 하루 에너지를 안정적으로 만듭니다.",
                    managerGuide: "🗣️ 식단: \"아침에 시리얼 말고 계란 드세요. 설탕은 부신의 적입니다.\"",
                    action: "기상 후 1시간 내 단백질(계란, 두부 등) 포함 아침 식사.",
                    difficulty: 'medium'
                },
                {
                    title: "카페인 컷오프 (No Caffeine)",
                    expertDesc: "부신을 채찍질하는 카페인 섭취를 엄격히 제한합니다.",
                    rationale: "커피는 고갈된 부신을 억지로 짜내는 채찍과 같습니다. 카페인 없이 견과류 등으로 에너지를 보충하세요.",
                    managerGuide: "🗣️ 경고: \"커피 마시면 당장은 깨는 것 같죠? 내일 쓸 에너지를 가불하는 겁니다.\"",
                    action: "오전 10시 이후 카페인 금지, 힘들면 오전 1잔만 허용.",
                    difficulty: 'hard'
                },
                {
                    title: "소금물/비타민C (Mineral Load)",
                    expertDesc: "고갈된 미네랄을 보충하여 부신 기능을 돕습니다.",
                    rationale: "부신 기능 저하 시 나트륨 손실이 큽니다. 질 좋은 소금과 비타민 C는 부신 회복의 필수 연료입니다.",
                    managerGuide: "🗣️ 팁: \"물 마실 때 소금 한 꼬집, 그리고 비타민 C 꼭 챙겨 드세요.\"",
                    action: "물 500ml에 죽염/천일염 약간 타서 섭취, 비타민 C 충분히 섭취.",
                    difficulty: 'easy'
                },
                {
                    title: "20분 컷 학습법 (Short Term)",
                    expertDesc: "짧게 끊어치는 학습으로 인지 피로를 최소화합니다.",
                    rationale: "긴 호흡의 학습은 부신 피로 환자에게 독입니다. 20분 학습 후 5분 휴식으로 뇌와 신체를 자주 리셋해야 합니다.",
                    managerGuide: "🗣️ 전략: \"길게 하려고 하지 마. 딱 20분만 하고 무조건 쉬어. 그게 더 빨라.\"",
                    action: "20분 집중 / 5분 완전 휴식 루틴 적용.",
                    difficulty: 'medium'
                }
            ]
        },
        exercise: {
            title: "🏃 Step 3. 에너지 보존 운동 (Rest & Restore)",
            intro: "\"열심히 운동하지 마세요.\" 지금은 에너지를 쓸 때가 아니라 채울 때입니다.",
            guides: [
                {
                    title: "고강도 운동 NO",
                    expertDesc: "과도한 운동은 코르티솔을 높여 부신을 더욱 고갈시킵니다.",
                    rationale: "숨이 턱까지 차는 운동은 현재 상태에서 회복을 방해합니다. 산책이나 요가 같은 이완 운동이 적합합니다.",
                    managerGuide: "🗣️ 조언: \"헬스장 가서 무리하지 마세요. 지금은 올림픽 나가는 게 아닙니다.\"",
                    action: "격렬한 달리기, 웨이트 대신 가벼운 걷기 권장.",
                    difficulty: 'hard'
                },
                {
                    title: "햇볕 쬐기 (Morning Light)",
                    expertDesc: "기상 후 햇볕으로 생체 리듬을 정상화합니다.",
                    rationale: "아침 햇볕은 생체 시계를 리셋하여 밤의 숙면을 유도하고, 세로토닌을 생성합니다.",
                    managerGuide: "🗣️ 루틴: \"눈 뜨면 바로 커튼 치고 베란다라도 나가세요. 햇빛이 약입니다.\"",
                    action: "기상 후 30분 이내 햇빛 샤워 (최소 10분).",
                    difficulty: 'easy'
                },
                {
                    title: "거절의 기술 (Say NO)",
                    expertDesc: "심리적 에너지 누수를 막기 위해 불필요한 일정을 거절합니다.",
                    rationale: "책임감 과잉은 부신의 적입니다. 자신의 한계를 인정하고 에너지를 비축하는 시기입니다.",
                    managerGuide: "🗣️ 멘탈: \"친구 부탁, 무리한 약속 다 거절하세요. 지금은 너만 생각해.\"",
                    action: "학습 외 불필요한 약속 및 부탁 정중히 거절하기.",
                    difficulty: 'medium'
                },
                {
                    title: "마그네슘 이완 (Relaxation)",
                    expertDesc: "천연 진정제로 불리는 마그네슘으로 근육과 신경을 이완합니다.",
                    rationale: "마그네슘은 긴장된 신경을 풀어주고 숙면을 돕습니다. 폼롤러 마사지와 병행하면 효과가 배가됩니다.",
                    managerGuide: "🗣️ 추천: \"자기 전에 마그네슘 먹고 스트레칭 좀 하다 자. 꿀잠 잘 거야.\"",
                    action: "저녁 식후 마그네슘 섭취 및 가벼운 스트레칭.",
                    difficulty: 'hard'
                }
            ]
        }
    },
    [CareType.ANXIETY_TENSION]: {
        prestudy: {
            title: "⚡ Step 1. 편도체 진정 (Calming)",
            intro: "\"불안은 뇌가 보내는 거짓 경보입니다.\" 과활성된 편도체를 진정시켜야 전두엽이 작동합니다.",
            guides: [
                {
                    title: "걱정 배출 (Worry Dump)",
                    expertDesc: "작업 기억 용량을 차지하는 '불안'을 종이에 쏟아냅니다.",
                    rationale: "불안한 생각은 뇌의 RAM(작업 기억)을 잡아먹습니다. 종이에 적는 행위만으로 뇌는 이를 '처리된 정보'로 인식하여 인지 부하를 30% 이상 줄입니다.",
                    managerGuide: "🗣️ 코칭: \"머릿속 걱정을 지금 종이에 다 적어봐. 그리고 구겨서 휴지통에 던져. 이제 뇌는 깨끗해졌어.\"",
                    action: "공부 시작 전 3분간, 방해되는 모든 걱정을 나열하고 찢어 버리기.",
                    difficulty: 'easy'
                },
                {
                    title: "그라운딩 (5-4-3-2-1)",
                    expertDesc: "오감을 자극하여 현재 시점으로 뇌를 강제 복귀시킵니다.",
                    rationale: "불안은 '미래'에 대한 공포입니다. 시각, 촉각 등 현재의 감각에 집중하면 뇌는 즉시 '안전한 현재'로 돌아와 도망치려는 반응을 멈춥니다.",
                    managerGuide: "🗣️ 제안: \"지금 눈에 보이는 빨간 물건 3개만 찾아볼래? 그리고 책상의 차가운 느낌에 집중해봐.\"",
                    action: "보이는 것 5개, 느껴지는 것 4개... 순으로 오감에 집중하기.",
                    difficulty: 'medium'
                },
                {
                    title: "결과와 과정 분리 (Detach)",
                    expertDesc: "통제 불가능한 '결과' 대신 통제 가능한 '행동'에 초점을 맞춥니다.",
                    rationale: "시험 결과는 신의 영역입니다. 뇌는 통제 불가능한 변수에 대해 스트레스를 받습니다. '오늘 3페이지 풀기'처럼 내가 할 수 있는 행동만이 불안을 잠재웁니다.",
                    managerGuide: "🗣️ 확언: \"1등급은 네가 정하는 게 아냐. 하지만 오늘 이 문제를 풀지 말지는 네가 정해. 넌 왕이야.\"",
                    action: "목표를 '100점 맞기'에서 '오늘 20문제 풀기'로 행동 중심 수정.",
                    difficulty: 'hard'
                },
                {
                    title: "4-7-8 호흡 (Vagus Nerve)",
                    expertDesc: "미주 신경을 자극하여 심박수를 강제로 안정시킵니다.",
                    rationale: "날숨을 길게 쉴 때 부교감 신경이 활성화됩니다. 신체적 긴장이 풀리면 뇌는 역으로 '상황이 안전하다'고 판단하여 학습 모드로 전환합니다.",
                    managerGuide: "🗣️ 지도: \"심장이 뛰는 건 뇌가 겁먹어서 그래. 숨을 천천히 내쉬어서 뇌를 속여보자.\"",
                    action: "4초 흡입, 7초 멈춤, 8초 배출 3세트 실시.",
                    difficulty: 'easy'
                }
            ]
        },
        learning: {
            title: "🧠 Step 2. 안정형 몰입 전략 (Safe Flow)",
            intro: "완벽주의는 불안의 다른 이름입니다. \"대충 시작해서 끝까지 가는 것\"이 승리 전략입니다.",
            guides: [
                {
                    title: "타임 박싱 (Time Boxing)",
                    expertDesc: "막연한 시간이 주는 공포를 없애기 위해 종료 시각을 못 박습니다.",
                    rationale: "끝이 보이지 않는 터널은 불안을 증폭시킵니다. '딱 30분만 하고 덮는다'는 확실한 마감은 뇌에게 안전감을 주어 몰입을 돕습니다.",
                    managerGuide: "🗣️ 약속: \"이거 언제 다 하냐고? 걱정 마, 딱 4시까지만 하고 무조건 덮을 거야.\"",
                    action: "타이머를 눈앞에 두고 정해진 시간에 강제 종료.",
                    difficulty: 'medium'
                },
                {
                    title: "개념 중심 학습 (Context First)",
                    expertDesc: "디테일에 집착하는 강박을 버리고 큰 그림부터 봅니다.",
                    rationale: "불안형 학생은 토씨 하나 놓치지 않으려다 지칩니다. 목차와 큰 흐름을 먼저 잡는 것이 뇌의 예측 불확실성을 줄여줍니다.",
                    managerGuide: "🗣️ 전략: \"나무를 보지 말고 숲을 봐. 목차부터 훑어서 지도를 머리에 넣고 시작하자.\"",
                    action: "학습 전 5분간 목차와 소제목만 읽으며 구조 파악.",
                    difficulty: 'hard'
                },
                {
                    title: "오답 노트 금지 (일시적)",
                    expertDesc: "자신의 부족함을 마주하는 고통을 일시적으로 줄여줍니다.",
                    rationale: "오답은 자존감을 깎아 불안을 가중시킬 수 있습니다. 컨디션이 저조할 땐 '맞은 문제'를 복습하며 '나도 할 수 있다'는 효능감을 먼저 채워야 합니다.",
                    managerGuide: "🗣️ 위로: \"오늘은 틀린 거 보지 마. 네가 잘 푼 문제 다시 보면서 기분 좋게 공부하자.\"",
                    action: "틀린 문제보다는 헷갈렸지만 맞춘 문제 위주로 복습.",
                    difficulty: 'easy'
                },
                {
                    title: "백색 소음 활용",
                    expertDesc: "적막함이 주는 긴장을 완화시킵니다.",
                    rationale: "완벽한 정적은 오히려 작은 소리에도 예민하게 만듭니다. 빗소리나 카페 소음은 청각적 파티고 효과를 통해 집중력을 높입니다.",
                    managerGuide: "🗣️ 환경: \"너무 조용하면 심장 소리만 들려. 빗소리 틀어놓고 편안하게 하자.\"",
                    action: "유튜브 등에서 'Rainy Cafe' 등 백색소음 재생.",
                    difficulty: 'medium'
                }
            ]
        },
        exercise: {
            title: "🏃 Step 3. 리듬 & 이완 (Rhythm)",
            intro: "규칙적인 리듬 운동은 세로토닌을 생성하여 천연 항불안제 역할을 합니다.",
            guides: [
                {
                    title: "리듬 워킹 (Serotonin Walk)",
                    expertDesc: "일정한 박자로 걷는 행위가 뇌파를 안정시킵니다.",
                    rationale: "하나-둘, 하나-둘. 규칙적인 리듬은 뇌간을 자극하여 세로토닌 분비를 촉진합니다. 이는 약물에 버금가는 정서 안정 효과가 있습니다.",
                    managerGuide: "🗣️ 제안: \"좋아하는 노래 비트에 맞춰서 20분만 걷자. 박자가 널 편안하게 해줄 거야.\"",
                    action: "BPM 100~120 정도의 음악을 들으며 박자에 맞춰 산책.",
                    difficulty: 'hard'
                },
                {
                    title: "점진적 근육 이완법 (PMR)",
                    expertDesc: "신체의 긴장을 의식적으로 풀어 뇌의 긴장도 풉니다.",
                    rationale: "불안하면 어깨가 굳습니다. 반대로 근육을 꽉 쥐었다가 확 풀 때의 이완 감각을 뇌에 전달하면 심리적 긴장도 같이 풀립니다.",
                    managerGuide: "🗣️ 코칭: \"주먹을 꽉 쥐어봐. 3초 뒤에 탁! 풀어. 그 시원한 느낌이 뇌에도 전해질 거야.\"",
                    action: "발끝부터 머리까지 근육을 차례로 긴장-이완 반복.",
                    difficulty: 'easy'
                },
                {
                    title: "따뜻한 차 & 족욕",
                    expertDesc: "체온 상승을 통해 부교감 신경을 활성화합니다.",
                    rationale: "신체 중심부 온도가 약간 오르면 편안함을 느끼는 신경 회로가 켜집니다. 따뜻한 물은 가장 쉬운 진정제입니다.",
                    managerGuide: "🗣️ 케어: \"공부 안 될 땐 족욕하면서 따뜻한 둥굴레차 한 잔 마셔. 그게 쉬는 거야.\"",
                    action: "자기 전 족욕 또는 따뜻한 허브티 섭취.",
                    difficulty: 'medium'
                },
                {
                    title: "요가 태양 경배 자세",
                    expertDesc: "전신을 늘려 갇혀 있던 에너지를 순환시킵니다.",
                    rationale: "몸을 웅크리는 것은 방어 자세입니다. 가슴을 활짝 여는 요가 동작은 자신감을 담당하는 테스토스테론을 미세하게 높여줍니다.",
                    managerGuide: "🗣️ 동작: \"가슴을 천장으로 활짝 열어봐. 세상이 넓어 보이고 겁날 게 없어질 거야.\"",
                    action: "아침 기상 후 태양 경배 자세 3회 실시.",
                    difficulty: 'hard'
                }
            ]
        }
    },
    [CareType.STRESS_OVERLOAD]: {
        prestudy: {
            title: "⚡ Step 1. 압력 낮추기 (Decompression)",
            intro: "\"뇌가 과열되었습니다.\" 지금 필요한 건 더 많은 연료가 아니라, 엔진을 식히는 냉각수입니다.",
            guides: [
                {
                    title: "모래주머니 버리기 (Prioritize)",
                    expertDesc: "해야 할 일의 80%를 과감히 버리고 핵심 20%만 남깁니다.",
                    rationale: "스트레스 과부하 상태에서 '다 하겠다'는 욕심은 시스템 셧다운을 부릅니다. '이것만 하면 오늘 성공'이라는 최저 기준선이 필요합니다.",
                    managerGuide: "🗣️ 결정: \"오늘 다 못 해. 딱 중요한 3개만 골라. 나머지는 과감하게 버려. 그래도 충분해.\"",
                    action: "오늘의 할 일 중 '상위 3개'만 남기고 나머지 삭제/연기.",
                    difficulty: 'easy'
                },
                {
                    title: "뇌파 쿨링 호흡 (Cooling)",
                    expertDesc: "코로 시원한 공기를 마셔 전두엽의 열을 식힙니다.",
                    rationale: "스트레스를 받으면 뇌 온도가 상승합니다. 천천히 깊게 들이마시는 시원한 공기는 물리적으로 뇌를 쿨링하여 이성적 판단을 돕습니다.",
                    managerGuide: "🗣️ 시각화: \"머리가 뜨겁지? 시원한 박하향 공기가 뇌로 들어간다고 상상하며 숨셔봐.\"",
                    action: "창문을 열고 시원한 공기를 뇌까지 보낸다는 느낌으로 심호흡 10회.",
                    difficulty: 'medium'
                },
                {
                    title: "감정 라벨링 (Naming)",
                    expertDesc: "현재 느끼는 압박감에 이름을 붙여 객관화합니다.",
                    rationale: "감정을 언어화하면 편도체의 활성도가 낮아집니다. '나는 지금 수학 때문에 짜증이 나 있구나'라고 인정하는 순간 통제권이 생깁니다.",
                    managerGuide: "🗣️ 질문: \"지금 기분이 어때? '짜증나', '답답해'라고 말해봐. 말하는 순간 별거 아니게 돼.\"",
                    action: "\"나는 지금 ~때문에 스트레스를 받는다\"라고 종이에 적기."
                },
                {
                    title: "단백질 섭취 (Energy)",
                    expertDesc: "스트레스로 소모된 뇌 에너지를 빠르게 보급합니다.",
                    rationale: "스트레스 상황에서는 뇌가 평소보다 많은 포도당과 아미노산을 소모합니다. 공복은 예민함을 증폭시키므로 양질의 단백질이 필수입니다.",
                    managerGuide: "🗣️ 처방: \"배고프면 더 화나. 계란 하나 먹고, 두유 한 잔 마시고 시작하자.\"",
                    action: "학습 전 삶은 계란이나 단백질 셰이크 가볍게 섭취.",
                    difficulty: 'hard'
                }
            ]
        },
        learning: {
            title: "🧠 Step 2. 부하 분산 전략 (Load Balancing)",
            intro: "뇌의 부하를 덜어주는 '외주화' 전략이 필요합니다. 머리로 기억하지 말고 손과 눈을 이용하세요.",
            guides: [
                {
                    title: "청킹 (Chunking)",
                    expertDesc: "방대한 정보를 작고 만만한 덩어리로 잘게 쪼갭니다.",
                    rationale: "뇌는 거대한 정보 덩어리 앞에서 압도당합니다. 전화번호처럼 3~4자리로 정보를 끊어서 입력하면 스트레스 없이 처리할 수 있습니다.",
                    managerGuide: "🗣️ 전략: \"100페이지를 언제 다 봐? 오늘은 딱 5페이지만, 그것도 3단락씩 나눠서 보자.\"",
                    action: "목표 범위를 3등분하여 한 번에 하나씩만 책상 위에 두기.",
                    difficulty: 'easy'
                },
                {
                    title: "손으로 쓰기 (Externalizing)",
                    expertDesc: "작업 기억의 부담을 손으로 덜어냅니다.",
                    rationale: "눈으로만 보면 뇌가 모든 정보를 붙들고 있어야 합니다. 손으로 쓰면 종이가 '보조 기억 장치'가 되어 뇌의 부담이 줄어듭니다.",
                    managerGuide: "🗣️ 코칭: \"머리로 외우려고 용쓰지 마. 그냥 깜지 쓰듯이 손을 움직여. 종이가 기억하게 해.\"",
                    action: "연습장을 적극 활용하여 내용을 무조건 쓰면서 공부.",
                    difficulty: 'medium'
                },
                {
                    title: "25분 컷 (Short Sprint)",
                    expertDesc: "짧고 굵게 끝낸다는 확신을 줍니다.",
                    rationale: "스트레스를 받을 땐 인내심이 바닥납니다. 50분은 너무 깁니다. 25분만 하고 무조건 쉰다는 규칙이 뇌를 달래줍니다.",
                    managerGuide: "🗣️ 타협: \"딱 25분이야. 그것도 못해? 그것만 하면 쉬게 해줄게.\"",
                    action: "포모도로 타이머를 25분으로 설정하고 철저히 준수.",
                    difficulty: 'hard'
                },
                {
                    title: "쉬운 과목 샌드위치",
                    expertDesc: "어려운 과목 사이에 좋아하는 과목을 끼워 넣습니다.",
                    rationale: "고통-고통-고통은 뇌를 파업하게 만듭니다. 가장 자신 있는 과목을 중간에 배치하여 성취감(도파민)을 수혈해야 합니다.",
                    managerGuide: "🗣️ 배치: \"수학 하다가 머리 터질 것 같으면, 바로 좋아하는 한국사 꺼내. 머리 식히고 다시 하면 돼.\"",
                    action: "취약 과목 공부 중간에 자신 있는 과목이나 단순 암기 배치.",
                    difficulty: 'easy'
                }
            ]
        },
        exercise: {
            title: "🏃 Step 3. 해소와 발산 (Release)",
            intro: "쌓인 스트레스 호르몬을 물리적으로 배출해야 합니다. 타격하거나 소리치는 것이 도움이 됩니다.",
            guides: [
                {
                    title: "코인 노래방 (Vocal Release)",
                    expertDesc: "소리를 지르며 횡경막을 자극하고 스트레스를 발산합니다.",
                    rationale: "샤우팅은 뇌의 답답함을 해소하는 가장 원초적이고 빠른 방법입니다. 노래는 호흡을 깊게 만들고 엔돌핀을 돌게 합니다.",
                    managerGuide: "🗣️ 추천: \"오늘 공부 끝나고 코노 가서 딱 3곡만 지르고 와. 소리 지르면 속이 뚫려.\"",
                    action: "주 1~2회 노래방 방문 또는 베개에 대고 소리 지르기.",
                    difficulty: 'medium'
                },
                {
                    title: "스트레스 볼/샌드백",
                    expertDesc: "물리적 타격감을 통해 공격성을 건강하게 해소합니다.",
                    rationale: "스트레스는 '투쟁-도피' 반응입니다. 무언가를 치거나 꽉 쥐는 행위는 뇌의 '싸움' 욕구를 충족시켜 안정을 줍니다.",
                    managerGuide: "🗣️ 도구: \"짜증 나면 펜 던지지 말고, 이 인형을 주먹으로 쳐. 힘껏 쳐도 돼.\"",
                    action: "책상 옆에 스트레스 볼이나 샌드백 두고 수시로 활용.",
                    difficulty: 'hard'
                },
                {
                    title: "자연 속 걷기 (Green Therapy)",
                    expertDesc: "초록색 시각 자극이 코르티솔 수치를 낮춥니다.",
                    rationale: "인간의 뇌는 자연 속에 있을 때 가장 편안함을 느낍니다. 공원이나 나무가 있는 곳을 걷는 것만으로도 회복 속도가 2배 빨라집니다.",
                    managerGuide: "🗣️ 산책: \"학원 가는 길에 공원 쪽으로 돌아서 가. 나무 좀 보고 숨 좀 쉬어.\"",
                    action: "하루 10분 이상 나무나 하늘을 보며 걷기.",
                    difficulty: 'easy'
                },
                {
                    title: "냉수 세수 (Diving Reflex)",
                    expertDesc: "찬물이 얼굴에 닿으면 심박수가 즉시 떨어집니다.",
                    rationale: "포유류 잠수 반사(Mammalian Diving Reflex)를 이용합니다. 찬물 자극은 강제로 심장 박동을 늦추고 신경계를 초기화합니다.",
                    managerGuide: "🗣️ 팁: \"열받으면 화장실 가서 찬물로 세수해. 얼굴만 식혀도 머리가 돌아가.\"",
                    action: "졸리거나 화날 때 찬물로 얼굴과 뒷목 씻기.",
                    difficulty: 'medium'
                }
            ]
        }
    },
    [CareType.LOW_ENERGY]: {
        prestudy: {
            title: "⚡ Step 1. 각성과 점화 (Ignition)",
            intro: "\"시동이 잘 안 걸리는 차일 뿐입니다.\" 예열 과정을 통해 뇌 온도를 높여야 합니다.",
            guides: [
                {
                    title: "업비트 음악 (BPM 130+)",
                    expertDesc: "빠른 템포의 음악으로 뇌파를 베타파로 끌어올립니다.",
                    rationale: "무기력한 뇌는 델타/세타파(수면/멍함) 상태입니다. 빠른 비트는 청각 피질을 자극하여 뇌 전체의 텐션을 강제로 높입니다.",
                    managerGuide: "🗣️ DJ: \"신나는 아이돌 노래, 록 음악 크게 틀어. 몸이 들썩거려야 뇌도 춤을 춘다.\"",
                    action: "공부 시작 전 3곡, 댄스곡이나 록 음악 듣기.",
                    difficulty: 'hard'
                },
                {
                    title: "스탠딩 스타트 (Standing)",
                    expertDesc: "서서 시작함으로써 신체 각성도를 높입니다.",
                    rationale: "앉으면 눕고 싶어집니다. 서 있는 자세는 뇌에게 '활동 중'이라는 신호를 줍니다. 서서 책을 보면 졸음이 오기 힘듭니다.",
                    managerGuide: "🗣️ 환경: \"처음 10분은 서서 소리 내어 읽어. 일단 몸을 일으켜야 머리도 깬다.\"",
                    action: "스탠딩 책상을 쓰거나 높은 선반에 책을 두고 서서 시작.",
                    difficulty: 'easy'
                },
                {
                    title: "차가운 물 한 잔 (Wake Up)",
                    expertDesc: "내장 기관을 깨워 교감 신경을 살짝 자극합니다.",
                    rationale: "공복의 냉수는 위장을 자극하여 신진대사를 깨웁니다. 뇌로 가는 혈류량도 일시적으로 증가합니다.",
                    managerGuide: "🗣️ 습관: \"눈 뜨면 냉수 한 잔 원샷. 그게 시동 버튼이야.\"",
                    action: "얼음물이나 아주 차가운 물 한 잔 마시기.",
                    difficulty: 'medium'
                },
                {
                    title: "조명 밝기 UP (Lux)",
                    expertDesc: "강한 빛으로 멜라토닌을 억제하고 각성 호르몬을 분비시킵니다.",
                    rationale: "어두운 방은 뇌를 재웁니다. 스탠드 밝기를 최대로 높이거나 청색광(Cool White) 조명을 사용하여 뇌를 낮 시간으로 착각하게 만드세요.",
                    managerGuide: "🗣️ 조명: \"방이 왜 이렇게 어두워? 불 다 켜. 환해야 뇌가 일할 시간인 줄 알아.\"",
                    action: "방 전체 등 + 스탠드 동시에 켜기, 쿨화이트 전구 사용.",
                    difficulty: 'hard'
                }
            ]
        },
        learning: {
            title: "🧠 Step 2. 도파민 펌핑 (Dopamine Booster)",
            intro: "지루함은 무기력의 먹이입니다. 공부를 게임처럼 만들어 도파민을 끊임없이 공급해야 합니다.",
            guides: [
                {
                    title: "타임 어택 (Gamification)",
                    expertDesc: "시간 제한을 두어 긴장감을 조성합니다.",
                    rationale: "느슨한 공부는 뇌를 끄게 만듭니다. '이 문제를 3분 안에 푼다'는 미션을 걸면 뇌는 비상 사태로 인지하고 집중력을 동원합니다.",
                    managerGuide: "🗣️ 게임: \"스톱워치 켜. 이 페이지 5분 안에 다 읽으면 승리, 못 읽으면 패배. 준비, 시작!\"",
                    action: "문제당 제한 시간을 설정하고 스톱워치로 카운트다운.",
                    difficulty: 'easy'
                },
                {
                    title: "퀴즈 쇼 (Active Interactions)",
                    expertDesc: "스스로 퀴즈를 내고 맞히며 뇌를 자극합니다.",
                    rationale: "단순 읽기는 지루합니다. 스스로 출제자가 되어 퀴즈를 만들고 맞히는 과정은 뇌의 보상 회로를 자극합니다.",
                    managerGuide: "🗣️ 놀이: \"네가 선생님이야. 이거 시험에 낼 문제 한번 만들어봐.\"",
                    action: "백지를 펴고 중요 내용을 괄호 채우기 문제로 변형.",
                    difficulty: 'medium'
                },
                {
                    title: "화려한 필기 (Visual Stimuli)",
                    expertDesc: "다양한 색깔 펜을 사용하여 시각적 지루함을 없앱니다.",
                    rationale: "무채색은 뇌를 졸리게 합니다. 형광펜, 색반전 등 시각적 자극을 다양하게 주면 뇌의 주의력이 유지됩니다.",
                    managerGuide: "🗣️ 도구: \"새 형광펜 샀어? 오늘 이거 다 써보자. 알록달록해야 눈에 들어오지.\"",
                    action: "3색 이상의 펜과 형광펜을 적극적으로 활용하여 필기.",
                    difficulty: 'hard'
                },
                {
                    title: "짧은 호흡 (Short Interval)",
                    expertDesc: "지치기 전에 쉬어서 에너지를 보존합니다.",
                    rationale: "에너지 탱크가 작으므로 자주 충전해야 합니다. 40분 공부, 20분 휴식처럼 휴식 비중을 높여 장기전을 대비합니다.",
                    managerGuide: "🗣️ 스케줄: \"무리하지 마. 조금만 하고 쉬어. 대신 쉴 땐 확실하게 쉬고.\"",
                    action: "40분 학습 / 20분 휴식 패턴 적용.",
                    difficulty: 'easy'
                }
            ]
        },
        exercise: {
            title: "🏃 Step 3. 에너지 생성 (Energy Generation)",
            intro: "에너지가 없어서 운동을 못 하는 게 아니라, 운동을 안 해서 에너지가 없는 것입니다.",
            guides: [
                {
                    title: "제자리 뛰기 (Jumping Jacks)",
                    expertDesc: "순간적으로 심박수를 높여 활력을 만듭니다.",
                    rationale: "가장 빠르게 에너지를 만드는 방법은 점프입니다. 중력을 거스르는 동작은 뇌와 신체를 순식간에 각성시킵니다.",
                    managerGuide: "🗣️ 액션: \"졸리면 벌떡 일어나서 팔벌려뛰기 20번만 해. 딱 1분이면 잠 다 깰걸?\"",
                    action: "쉬는 시간마다 1분간 제자리 뛰기.",
                    difficulty: 'medium'
                },
                {
                    title: "파워 포즈 (Wonder Woman)",
                    expertDesc: "자신감 있는 자세로 호르몬 변화를 유도합니다.",
                    rationale: "어깨를 펴고 허리에 손을 얹는 '원더우먼 자세'를 2분만 유지해도 테스토스테론(자신감)이 오르고 코르티솔(스트레스)이 내립니다.",
                    managerGuide: "🗣️ 자세: \"기지개 쫙 펴고, 슈퍼맨처럼 서 있어봐. 자세가 마음을 만든다.\"",
                    action: "거울 앞에서 당당한 포즈 취하고 2분간 유지.",
                    difficulty: 'hard'
                },
                {
                    title: "계단 오르기",
                    expertDesc: "하체 근육을 자극하여 전신 혈류를 돌립니다.",
                    rationale: "허벅지 근육은 신체 당분의 저장소입니다. 계단을 오르면 뇌로 가는 에너지 공급이 원활해집니다.",
                    managerGuide: "🗣️ 습관: \"엘리베이터 타지 말고 걸어 올라와. 그게 뇌를 충전하는 길이야.\"",
                    action: "이동 시 계단 적극 활용.",
                    difficulty: 'easy'
                },
                {
                    title: "박수 치기",
                    expertDesc: "손바닥 자극으로 뇌를 깨웁니다.",
                    rationale: "손바닥에는 수많은 신경이 연결되어 있습니다. 힘차게 박수를 치면 혈액 순환이 빨라지고 정신이 듭니다.",
                    managerGuide: "🗣️ 팁: \"집중 안 되면 박수 세 번 짝! 짝! 짝! 치고 '할 수 있다' 외쳐봐.\"",
                    action: "시작 전 박수 10번 힘차게 치기.",
                    difficulty: 'medium'
                }
            ]
        }
    },
    [CareType.DEPRESSION_AMOTIVATION]: {
        prestudy: {
            title: "⚡ Step 1. 문턱 낮추기 (Low Friction)",
            intro: "\"의욕은 행동한 뒤에 따라옵니다.\" 시작의 장벽을 바닥까지 낮춰야 합니다.",
            guides: [
                {
                    title: "5분 법칙 (Just 5 Mins)",
                    expertDesc: "뇌의 저항감을 최소화하기 위해 '딱 5분'만 한다고 속입니다.",
                    rationale: "시작이 가장 어렵습니다. '5분만 하고 마음에 안 들면 그만두자'는 생각은 뇌의 부담을 덜어주어 일단 시작하게 만듭니다. 대개는 5분을 넘겨 계속하게 됩니다.",
                    managerGuide: "🗣️ 협상: \"공부하지 마. 딱 5분만 책 펴놓고 멍때리자. 5분 뒤에 하기 싫으면 자도 돼.\"",
                    action: "타이머 5분 맞추고 일단 책상에 앉기.",
                    difficulty: 'hard'
                },
                {
                    title: "침대 탈출 (Bed Separation)",
                    expertDesc: "우울의 늪인 침대와 자신을 물리적으로 분리합니다.",
                    rationale: "침대에 누워 있으면 뇌는 무기력을 학습합니다. 일어나는 행위 자체가 첫 번째 승리입니다.",
                    managerGuide: "🗣️ 미션: \"눈 뜨면 좀비처럼 기어서라도 책상 의자에 앉아. 그게 오늘의 첫 성공이야.\"",
                    action: "기상 즉시 이불 개고 책상 의자에 앉기 (공부 안 해도 됨).",
                    difficulty: 'easy'
                },
                {
                    title: "햇볕 샤워 (Sunlight)",
                    expertDesc: "세로토닌을 생성하여 우울감을 걷어냅니다.",
                    rationale: "햇볕은 최고의 천연 항우울제입니다. 망막에 빛이 들어오면 기분을 좋게 하는 세로토닌이 분비되어 의욕 생성의 기초가 됩니다.",
                    managerGuide: "🗣️ 처방: \"커튼 활짝 걷어. 창문 열고 햇빛 5분만 봐. 기분이 한결 나아질 거야.\"",
                    action: "창가에서 햇볕 쬐며 양치하기.",
                    difficulty: 'medium'
                },
                {
                    title: "쉬운 목표 세분화",
                    expertDesc: "아주 작은 성취감으로 도파민 회로를 재가동합니다.",
                    rationale: "우울하면 '아무것도 못 한다'는 무력감에 빠집니다. '책 펴기', '필통 열기' 같은 사소한 성공을 체크하며 뇌에 '나도 할 수 있다'는 신호를 줍니다.",
                    managerGuide: "🗣️ 칭찬: \"와, 책 폈네? 대단해. 이번엔 펜 뚜껑 열어볼까? 잘했어!\"",
                    action: "체크리스트에 '노트 펴기', '제목 쓰기' 등 아주 사소한 것 적고 지우기.",
                    difficulty: 'hard'
                }
            ]
        },
        learning: {
            title: "🧠 Step 2. 의미 연결 (Connection)",
            intro: "공부의 이유를 잃어버린 상태입니다. 내가 좋아하는 것과 공부를 연결해야 합니다.",
            guides: [
                {
                    title: "좋아하는 과목부터",
                    expertDesc: "싫어하는 과목은 과감히 미루고 흥미 있는 것부터 합니다.",
                    rationale: "지금은 편식이 필요합니다. 뇌가 거부감을 느끼지 않는 과목으로 학습 궤도에 진입하는 것이 우선입니다.",
                    managerGuide: "🗣️ 허용: \"수학 싫으면 하지 마. 네가 좋아하는 역사 만화책부터 보자. 글자 읽는 게 어디야.\"",
                    action: "가장 부담 없는 과목이나 독서로 시작.",
                    difficulty: 'easy'
                },
                {
                    title: "의미 부여 (Why)",
                    expertDesc: "이 공부가 내 삶에 어떤 도움이 될지 이기적으로 생각합니다.",
                    rationale: "타인을 위한 공부는 동기가 생기지 않습니다. 이 공부가 나의 돈, 명예, 자유에 어떻게 기여할지 상상하면 도파민이 나옵니다.",
                    managerGuide: "🗣️ 질문: \"이거 배워서 어디다 써먹을까? 나중에 돈 많이 버는 데 도움 되나?\"",
                    action: "학습 전 '이 공부를 하면 나에게 좋은 점 1가지' 적기.",
                    difficulty: 'medium'
                },
                {
                    title: "카페인 & 초콜릿 (Reward)",
                    expertDesc: "즉각적인 보상으로 뇌를 달랩니다.",
                    rationale: "내적 동기가 부족할 땐 외적 보상이 필요합니다. 공부할 때만 먹을 수 있는 간식을 마련하면 뇌는 그 간식을 먹기 위해 책상에 앉습니다.",
                    managerGuide: "🗣️ 유혹: \"이 문제 다 풀면 초콜릿 하나 먹자. 공부할 때만 먹는 특별한 거야.\"",
                    action: "학습 분량 끝날 때마다 작은 간식 보상.",
                    difficulty: 'hard'
                },
                {
                    title: "친구와 함께 (Social)",
                    expertDesc: "고립감을 없애고 사회적 유대감으로 움직입니다.",
                    rationale: "혼자 하면 우울해집니다. 도서관이나 스터디 카페 등 남들이 열심히 하는 공간에 가면 거울 뉴런이 작동하여 덩달아 하게 됩니다.",
                    managerGuide: "🗣️ 제안: \"집에만 있지 말고 도서관 가자. 남들 공부하는 구경만 해도 자극 돼.\"",
                    action: "스터디 그룹 참여 또는 열린 공간에서 학습.",
                    difficulty: 'easy'
                }
            ]
        },
        exercise: {
            title: "🏃 Step 3. 행동 활성화 (Activation)",
            intro: "생각은 우울증을 키우지만, 몸의 움직임은 우울증을 죽입니다.",
            guides: [
                {
                    title: "무작정 걷기 (Just Walk)",
                    expertDesc: "생각할 틈을 주지 않고 다리를 움직입니다.",
                    rationale: "걸으면 뇌의 전두엽이 활성화되어 부정적인 반추(곱씹기)가 줄어듭니다. 목적지 없이 그냥 걷는 것만으로도 뇌는 긍정적으로 변합니다.",
                    managerGuide: "🗣️ 독려: \"생각하지 마. 그냥 운동화 신고 밖으로 나가. 10분만 걷고 오자.\"",
                    action: "매일 같은 시간 20분 산책.",
                    difficulty: 'medium'
                },
                {
                    title: "반려동물/식물 케어",
                    expertDesc: "타 대상을 돌보며 존재 가치를 확인합니다.",
                    rationale: "무언가를 돌보는 행위는 옥시토신을 분비시켜 정서적 안정을 줍니다. 나도 쓸모 있는 존재라는 느낌이 생명력을 줍니다.",
                    managerGuide: "🗣️ 부탁: \"강아지 산책 좀 시켜줄래? 너 아니면 안 돼.\"",
                    action: "강아지 산책시키기 또는 화분에 물 주기.",
                    difficulty: 'hard'
                },
                {
                    title: "자세 교정 (Upright)",
                    expertDesc: "구부정한 자세를 펴서 기분을 바꿉니다.",
                    rationale: "우울하면 등이 굽습니다. 반대로 등을 펴고 턱을 들면 뇌는 자신이 당당하다고 착각하게 됩니다. 신체 언어가 감정을 지배합니다.",
                    managerGuide: "🗣️ 교정: \"가슴 펴! 어깨 펴! 고개 들고! 자세가 바뀌면 마음도 바뀐다.\"",
                    action: "의식적으로 척추를 펴고 시선을 정면보다 약간 위로 두기.",
                    difficulty: 'easy'
                },
                {
                    title: "방 청소 (Environment)",
                    expertDesc: "혼란스러운 주변을 정리하여 마음의 질서를 잡습니다.",
                    rationale: "어지러운 방은 혼란스러운 마음을 대변합니다. 주변을 깨끗이 하면 통제감이 생기고 뇌가 맑아집니다.",
                    managerGuide: "🗣️ 시작: \"책상 위에 쓰레기만이라도 줍자. 방이 깨끗해지면 머리도 맑아져.\"",
                    action: "하루 10분 내 방 정리정돈.",
                    difficulty: 'medium'
                }
            ]
        }
    },
    [CareType.BRAIN_FATIGUE]: {
        prestudy: {
            title: "⚡ Step 1. 인지 부하 덜기 (Offloading)",
            intro: "\"뇌가 과부하로 파업 중입니다.\" 입력값은 줄이고 휴식값은 높여야 합니다.",
            guides: [
                {
                    title: "멍때리기 (DMN)",
                    expertDesc: "아무 정보도 입력하지 않는 뇌의 완전한 휴식입니다.",
                    rationale: "뇌는 아무것도 안 할 때 '디폴트 모드 네트워크(DMN)'가 켜지며 정보를 정리합니다. 스마트폰을 보지 않고 멍하니 있는 시간이 진짜 뇌 휴식입니다.",
                    managerGuide: "🗣️ 휴식: \"폰 내려놔. 눈 감고 아무 생각도 하지 마. 뇌도 숨 쉴 시간이 필요해.\"",
                    action: "학습 전 5분간 창밖 보며 멍때리기.",
                    difficulty: 'hard'
                },
                {
                    title: "단일 과제 수행 (Single Tasking)",
                    expertDesc: "멀티태스킹을 차단하여 정보 처리 비용을 아낍니다.",
                    rationale: "음악 들으며 공부하기, 친구와 톡 하며 숙제하기는 피로한 뇌에 치명타입니다. 한 번에 하나만 처리해야 뇌가 버팁니다.",
                    managerGuide: "🗣️ 규칙: \"음악 꺼. 폰도 꺼. 오직 책만 봐. 한 번에 하나만 하자.\"",
                    action: "멀티태스킹 절대 금지, 한 번에 한 과목만.",
                    difficulty: 'easy'
                },
                {
                    title: "당분 공급 (Glucose)",
                    expertDesc: "뇌의 유일한 에너지원인 포도당을 공급합니다.",
                    rationale: "뇌 피로는 실제 연료 부족일 수 있습니다. (적당량의) 사탕이나 포도당 캔디는 즉각적인 뇌 연료가 됩니다.",
                    managerGuide: "🗣️ 간식: \"머리 안 돌아가지? 포도당 캔디 하나 먹고 해.\"",
                    action: "학습 시작 전 포도당 캔디 1~2알 섭취.",
                    difficulty: 'medium'
                },
                {
                    title: "수분 충전 (Hydration)",
                    expertDesc: "뇌의 탈수를 막아 인지 속도를 유지합니다.",
                    rationale: "뇌의 75%는 물입니다. 2%만 부족해도 집중력과 기억력이 급감합니다. 물은 가장 싼 뇌 영양제입니다.",
                    managerGuide: "🗣️ 권유: \"물 한 잔 마셨어? 뇌가 말라 비틀어지면 생각이 안 나.\"",
                    action: "텀블러에 물 채워두고 수시로 마시기.",
                    difficulty: 'hard'
                }
            ]
        },
        learning: {
            title: "🧠 Step 2. 효율적 입력 (Efficient Input)",
            intro: "뇌 용량이 부족하므로, 고화질 동영상 대신 가벼운 텍스트 위주로 정보를 처리하세요.",
            guides: [
                {
                    title: "읽기 모드 (Reading)",
                    expertDesc: "수동적 시청보다 능동적 읽기가 뇌 피로를 덜 유발할 수 있습니다.",
                    rationale: "인강은 시각/청각을 동시에 처리해야 하므로 부하가 큽니다. 피로할 땐 차라리 줄글을 자신의 속도대로 읽는 것이 뇌에 여유를 줍니다.",
                    managerGuide: "🗣️ 전환: \"인강 소리가 시끄럽게 느껴지면 그냥 자습서 읽어. 네 속도대로 읽는 게 나아.\"",
                    action: "인강 비중 줄이고 텍스트 읽기 위주 학습.",
                    difficulty: 'easy'
                },
                {
                    title: "요약본 활용",
                    expertDesc: "정보의 압축본을 활용하여 처리 과정을 줄입니다.",
                    rationale: "처음부터 정리하려 하지 말고 남이 정리해 둔 요약본을 먼저 보고, 살을 붙이는 방식이 에너지를 아낍니다.",
                    managerGuide: "🗣️ 팁: \"교과서 정독 힘들지? 요약 노트부터 먼저 훑어보고 살을 붙이자.\"",
                    action: "요약집이나 마인드맵을 먼저 보고 세부 내용 학습.",
                    difficulty: 'medium'
                },
                {
                    title: "20분 법칙",
                    expertDesc: "짧은 집중 후 긴 휴식으로 뇌를 보호합니다.",
                    rationale: "피로한 뇌의 집중력 유지 시간은 짧습니다. 20분만 집중하고 10분 쉬는 방식으로 짧게 끊어 가야 합니다.",
                    managerGuide: "🗣️ 스케줄: \"욕심내지 마. 20분만 하고 10분 쉬어. 가늘고 길게 가자.\"",
                    action: "20분 학습 / 10분 눈 감고 휴식.",
                    difficulty: 'hard'
                },
                {
                    title: "수면 학습 (Sleep Learning)",
                    expertDesc: "자기 전 암기하고 잠의 뇌과학을 이용합니다.",
                    rationale: "무리해서 외우지 말고, 자기 전 한 번 읽고 자면 뇌가 잘 때 정리해 줍니다. 뇌의 자동 저장 기능을 믿으세요.",
                    managerGuide: "🗣️ 전략: \"안 외워지면 그냥 읽고 자. 자는 동안 뇌가 알아서 정리해 줄 거야.\"",
                    action: "자기 전 암기 과목 1번 읽고 바로 취침.",
                    difficulty: 'easy'
                }
            ]
        },
        exercise: {
            title: "🏃 Step 3. 회복과 충전 (Restoration)",
            intro: "운동보다는 휴식에 가까운 이완 동작이 필요합니다.",
            guides: [
                {
                    title: "NSDR (Non-Sleep Deep Rest)",
                    expertDesc: "깨어 있지만 깊은 휴식을 취하는 요가 니드라 기법입니다.",
                    rationale: "20분의 NSDR은 4시간의 수면 효과와 맞먹습니다. 유튜브 가이드를 들으며 뇌파를 델타파로 낮추세요.",
                    managerGuide: "🗣️ 추천: \"잠깐 누워서 이거 들어봐. 잠든 건 아닌데 머리가 엄청 개운해질 거야.\"",
                    action: "유튜브에서 '요가 니드라' 또는 'NSDR' 검색하여 따라 하기.",
                    difficulty: 'medium'
                },
                {
                    title: "눈 찜질 (Eye Care)",
                    expertDesc: "시신경의 피로를 풀어 뇌의 입력을 차단합니다.",
                    rationale: "뇌 정보의 80%는 눈으로 들어옵니다. 눈을 따뜻하게 하고 가려주는 것만으로도 뇌는 '퇴근'했다고 느낍니다.",
                    managerGuide: "🗣️ 케어: \"눈이 뻑뻑하면 머리도 안 돌아가. 따뜻한 수건으로 눈 좀 덮고 있어.\"",
                    action: "온열 안대나 따뜻한 수건으로 10분간 눈 찜질.",
                    difficulty: 'hard'
                },
                {
                    title: "맨발 걷기 (Earthing)",
                    expertDesc: "발바닥 자극을 통해 머리의 열을 내립니다.",
                    rationale: "맨발로 흙을 밟으면 활성산소가 제거되고 정서적 안정을 얻습니다. 두한족열(머리는 차게, 발은 뜨겁게)의 원리입니다.",
                    managerGuide: "🗣️ 산책: \"신발 벗고 흙 좀 밟아봐. 시원한 느낌이 머리까지 전해질 거야.\"",
                    action: "안전한 공원이나 운동장에서 맨발 걷기.",
                    difficulty: 'easy'
                },
                {
                    title: "낮잠 (Power Nap)",
                    expertDesc: "짧은 낮잠으로 뇌의 캐시 메모리를 삭제합니다.",
                    rationale: "20분 이내의 낮잠은 뇌에 쌓인 아데노신을 제거하여 오후의 집중력을 리셋합니다. (30분 넘기지 말 것)",
                    managerGuide: "🗣️ 허용: \"너무 졸리면 딱 15만 자. 알람 맞춰줄게. 그게 훨씬 효율적이야.\"",
                    action: "커피 한 잔 마시고(냅라떼) 20분 낮잠.",
                    difficulty: 'medium'
                }
            ]
        }
    },
    [CareType.HYPERSENSITIVE]: {
        prestudy: {
            title: "⚡ Step 1. 감각 차단 (Sensory Gating)",
            intro: "\"당신의 뇌는 필터가 없는 상태입니다.\" 불필요한 자극을 물리적으로 차단해야 합니다.",
            guides: [
                {
                    title: "노이즈 캔슬링 (Silence)",
                    expertDesc: "청각적 정보 처리를 0으로 만듭니다.",
                    rationale: "과민한 뇌는 옆 사람의 볼펜 소리도 천둥처럼 듣습니다. 노이즈 캔슬링 헤드폰이나 귀마개는 선택이 아니라 필수 생존 도구입니다.",
                    managerGuide: "🗣️ 장비: \"헤드폰 써. 세상 소리 다 끄고 너만의 우주로 들어가는 거야.\"",
                    action: "공부 시작 전 반드시 귀마개나 노캔 이어폰 착용.",
                    difficulty: 'hard'
                },
                {
                    title: "후드티/모자 (Tunnel Vision)",
                    expertDesc: "시야각을 좁혀 주변의 움직임을 차단합니다.",
                    rationale: "주변 시야에 들어오는 사람들의 움직임은 집중력을 끊습니다. 모자를 눌러써서 시야를 책으로 한정시키세요.",
                    managerGuide: "🗣️ 복장: \"모자 푹 눌러써. 옆에 누가 지나가든 안 보이게. 경주마처럼 앞만 봐.\"",
                    action: "모자나 후드티 착용 후 학습.",
                    difficulty: 'easy'
                },
                {
                    title: "옷감 확인 (Tactile)",
                    expertDesc: "거슬리는 촉각 자극을 미리 제거합니다.",
                    rationale: "까끌거리는 옷 택이나 꽉 끼는 바지는 지속적으로 뇌의 리소스를 잡아먹습니다. 가장 편안한 옷을 입으세요.",
                    managerGuide: "🗣️ 점검: \"옷 불편한 거 없어? 제일 편한 츄리닝 입고 해. 몸이 편해야 머리가 돈다.\"",
                    action: "부드럽고 헐렁한 옷 착용, 책상 모서리에 보호대 부착.",
                    difficulty: 'medium'
                },
                {
                    title: "정리 정돈 (Visual Noise)",
                    expertDesc: "시각적 잡음을 제거하여 뇌를 안정시킵니다.",
                    rationale: "책상이 지저분하면 과민한 뇌는 그 패턴을 분석하느라 피곤해집니다. 책상은 수술대처럼 깨끗해야 합니다.",
                    managerGuide: "🗣️ 정리: \"책상 위에 샤프심 하나도 없이 치워. 딱 책만 남겨.\"",
                    action: "모든 물건을 서랍에 넣고 '무균실' 상태 만들기.",
                    difficulty: 'hard'
                }
            ]
        },
        learning: {
            title: "🧠 Step 2. 몰입의 요새화 (Fortress)",
            intro: "외부 방해 없이 안전하게 몰입할 수 있는 환경과 루틴을 만드세요.",
            guides: [
                {
                    title: "1인실/구석 자리",
                    expertDesc: "등 뒤가 막힌 공간에서 심리적 안정감을 얻습니다.",
                    rationale: "본능적으로 등 뒤가 뚫려 있으면 뇌는 경계 태세를 갖춥니다. 벽을 등지거나 구석 자리를 확보하세요.",
                    managerGuide: "🗣️ 자리: \"독서실 구석 자리 잡아. 등 뒤가 든든해야 마음 놓고 공부하지.\"",
                    action: "가장 구석지거나 벽을 마주 보는 자리 선정.",
                    difficulty: 'easy'
                },
                {
                    title: "이해보다 암기 (Details)",
                    expertDesc: "예민한 디테일 감각을 암기에 활용합니다.",
                    rationale: "과민형 학생은 세부 사항을 잘 포착합니다. 전체 흐름보다는 디테일한 암기 과목에서 강점을 보일 수 있습니다.",
                    managerGuide: "🗣️ 강점: \"넌 남들이 못 보는 꼼꼼한 걸 잘 보잖아. 영어 단어나 디테일한 암기에 유리해.\"",
                    action: "섬세함이 필요한 과목(어학, 탐구 디테일) 위주 배치.",
                    difficulty: 'medium'
                },
                {
                    title: "자신만의 루틴 (Ritual)",
                    expertDesc: "예측 가능한 순서로 뇌를 안심시킵니다.",
                    rationale: "예측 불가능성은 스트레스입니다. 항상 같은 시간에, 같은 순서로, 같은 펜을 쓰는 루틴이 뇌를 편안하게 합니다.",
                    managerGuide: "🗣️ 습관: \"늘 하던 대로 해. 물 한 모금 마시고, 펜 잡고, 심호흡 하고. 루틴대로 하면 잘 될 거야.\"",
                    action: "공부 시작 전 3가지 고정 행동(물-안경-심호흡 등) 수행.",
                    difficulty: 'hard'
                },
                {
                    title: "혼자 공부하기",
                    expertDesc: "타인의 존재 자체가 주는 스트레스를 피합니다.",
                    rationale: "친구와 같이 있으면 상대방의 기분이나 행동을 신경 쓰느라 에너지가 샙니다. 철저히 혼자가 되세요.",
                    managerGuide: "🗣️ 조언: \"친구랑 같이 하지 마. 너 혼자 할 때가 제일 빨라.\"",
                    action: "스터디 그룹 비추천, 단독 학습 권장.",
                    difficulty: 'easy'
                }
            ]
        },
        exercise: {
            title: "🏃 Step 3. 내면 집중 (Inner Focus)",
            intro: "외부 자극을 차단하고 자신의 내면에 집중하는 운동이 좋습니다.",
            guides: [
                {
                    title: "요가/필라테스",
                    expertDesc: "자신의 호흡과 근육 움직임에 집중합니다.",
                    rationale: "경쟁적인 구기 종목은 예민한 사람에게 스트레스입니다. 내 몸의 감각에만 집중하는 운동이 신경계를 안정시킵니다.",
                    managerGuide: "🗣️ 추천: \"시끄러운 헬스장 말고, 조용한 방에서 요가 매트 펴고 스트레칭 하자.\"",
                    action: "집에서 조용히 요가나 스트레칭 수행.",
                    difficulty: 'medium'
                },
                {
                    title: "단독 러닝 (Running)",
                    expertDesc: "일정한 리듬으로 달리며 잡념을 없앱니다.",
                    rationale: "이어폰을 끼고 혼자 달리는 시간은 외부 자극으로부터 해방되는 시간입니다. 뇌가 비워집니다.",
                    managerGuide: "🗣️ 운동: \"이어폰 끼고 아무도 없는 길을 좀 뛰고 와. 바람 맞으면 시원할 거야.\"",
                    action: "밤이나 이른 아침, 사람 없는 시간에 조깅.",
                    difficulty: 'hard'
                },
                {
                    title: "폼롤러 마사지",
                    expertDesc: "긴장된 근막을 이완시켜 과민함을 낮춥니다.",
                    rationale: "예민한 사람은 근육이 항상 긴장되어 있습니다. 근막을 풀어주면 뇌의 경계 태세도 함께 풀립니다.",
                    managerGuide: "🗣️ 케어: \"몸이 딱딱하게 굳었네. 폼롤러로 문질러주면 잠도 잘 올 거야.\"",
                    action: "자기 전 10분 이상 꼼꼼하게 전신 이완.",
                    difficulty: 'easy'
                },
                {
                    title: "명상 (Meditation)",
                    expertDesc: "떠오르는 생각들을 판단 없이 흘려보냅니다.",
                    rationale: "명상은 자극에 대한 반응성을 낮추는 훈련입니다. 외부 소음이나 내부 잡념을 그냥 '지나가는 차'처럼 바라보세요.",
                    managerGuide: "🗣️ 멘탈: \"생각이 너무 많지? 그냥 구름처럼 흘러가게 둬. 잡으려고 하지 마.\"",
                    action: "하루 10분, 마음 챙김 명상 앱 활용.",
                    difficulty: 'medium'
                }
            ]
        }
    },
    [CareType.ATTENTION_DEFICIT]: {
        prestudy: {
            title: "⚡ Step 1. 도파민 점화 (Ignition)",
            intro: "\"흥미가 없으면 뇌가 켜지지 않습니다.\" 재미와 자극을 일부러 만들어야 합니다.",
            guides: [
                {
                    title: "피젯 토이 (Fidgeting)",
                    expertDesc: "손을 꼼지락거려 뇌의 각성도를 유지합니다.",
                    rationale: "ADHD 성향의 뇌는 가만히 있으면 잡니다. 손을 움직여 전두엽에 지속적인 자극을 주어야 집중이 유지됩니다.",
                    managerGuide: "🗣️ 도구: \"펜 돌려도 돼. 스피너 돌려도 돼. 손을 가만히 두지 마.\"",
                    action: "피젯 스피너, 큐브 등을 한 손으로 만지작거리며 공부.",
                    difficulty: 'hard'
                },
                {
                    title: "노동요 (Binaural Beats)",
                    expertDesc: "적절한 청각 자극으로 집중력 주파수를 맞춥니다.",
                    rationale: "완벽한 정적은 오히려 산만함을 유발합니다. 가사가 없는 비트감 있는 음악이나 바이노럴 비트가 뇌를 집중 모드로 묶어둡니다.",
                    managerGuide: "🗣️ 음악: \"게임 BGM 같은 거 들어. 비트가 있어야 뇌가 안 심심해해.\"",
                    action: "게임 사운드트랙이나 Lo-Fi 음악 재생.",
                    difficulty: 'easy'
                },
                {
                    title: "타이머 선언 (Challenge)",
                    expertDesc: "시간 제한을 두어 게임처럼 만듭니다.",
                    rationale: "마감이 닥쳐야 움직이는 뇌입니다. 인위적인 마감을 5분 단위로 만들어 긴장감을 조성하세요.",
                    managerGuide: "🗣️ 미션: \"지금부터 5분 안에 이 문제 다 풀면 승리! 준비, 시작!\"",
                    action: "타이머를 짧게(10~15분) 설정하고 타임 어택.",
                    difficulty: 'medium'
                },
                {
                    title: "카페인 전략적 사용",
                    expertDesc: "적당량의 카페인은 전두엽 자극제입니다.",
                    rationale: "카페인은 도파민 재흡수를 막아 집중력을 높여줍니다. (단, 오후 늦게는 피할 것)",
                    managerGuide: "🗣️ 아이템: \"집중 안 돼? 시원한 아이스 커피 한 잔 마시고 딱 1시간만 달리자.\"",
                    action: "학습 시작 전 소량의 카페인 섭취.",
                    difficulty: 'hard'
                }
            ]
        },
        learning: {
            title: "🧠 Step 2. 다이내믹 학습 (Activities)",
            intro: "눈으로만 보는 공부는 지옥입니다. 온몸을 사용하여 공부하세요.",
            guides: [
                {
                    title: "낭독과 강의 (Teaching)",
                    expertDesc: "입으로 떠들면서 공부해야 뇌가 딴생각을 안 합니다.",
                    rationale: "말하기는 고도의 인지 활동입니다. 내가 일타강사가 되어 설명하듯 떠들면 잡념이 끼어들 틈이 없습니다.",
                    managerGuide: "🗣️ 연기: \"네가 선생님이야. 인형들 앉혀놓고 이거 설명해봐.\"",
                    action: "서서 화이트보드에 설명하거나 중얼거리며 공부.",
                    difficulty: 'easy'
                },
                {
                    title: "스탠딩 워크 (Movement)",
                    expertDesc: "서서 왔다 갔다 하며 뇌 혈류를 공급합니다.",
                    rationale: "움직이면 전전두엽 기능이 향상됩니다. 제자리에 앉아있기 힘들면 차라리 걸어 다니면서 단어장을 보세요.",
                    managerGuide: "🗣️ 허용: \"산만해도 괜찮아. 그냥 서서 해. 돌아다니면서 외워.\"",
                    action: "스탠딩 책상 사용 또는 방 안을 걸어 다니며 암기.",
                    difficulty: 'medium'
                },
                {
                    title: "낙서와 마킹 (Doodling)",
                    expertDesc: "손을 바쁘게 하여 시각적 주의를 붙잡습니다.",
                    rationale: "책을 더럽히세요. 줄을 긋고, 동그라미를 치고, 그림을 그려야 뇌가 텍스트에 머뭅니다.",
                    managerGuide: "🗣️ 지시: \"책 깨끗하게 쓰지 마. 마구 낙서해. 중요하다고 생각하는 거 다 표시해.\"",
                    action: "형광펜과 색연필로 적극적으로 표시하며 읽기.",
                    difficulty: 'hard'
                },
                {
                    title: "장소 바꾸기 (Novelty)",
                    expertDesc: "장소를 바꿔 신선한 자극을 줍니다.",
                    rationale: "같은 장소는 지루합니다. 집, 카페, 도서관으로 2시간마다 장소를 옮기면 뇌는 새로운 곳에서 다시 긴장합니다.",
                    managerGuide: "🗣️ 전환: \"여기 지겹지? 짐 싸. 카페 가서 1시간만 더 하고 오자.\"",
                    action: "1~2시간마다 공부 장소 변경 (카페, 거실, 방).",
                    difficulty: 'easy'
                }
            ]
        },
        exercise: {
            title: "🏃 Step 3. 복잡한 움직임 (Skill)",
            intro: "단순 반복 운동보다는 기술이 필요한 운동이 뇌를 자극합니다.",
            guides: [
                {
                    title: "구기 종목/댄스",
                    expertDesc: "복잡한 동작은 소뇌와 전두엽을 연결합니다.",
                    rationale: "춤을 추거나 공을 다루는 것은 뇌의 타이밍 감각과 조절 능력을 훈련시킵니다. 집중력 회로를 강화하는 최고의 운동입니다.",
                    managerGuide: "🗣️ 추천: \"주말에 농구 한 판 하거나 방송 댄스 배워봐. 머리가 확 좋아질 거야.\"",
                    action: "테니스, 배드민턴, 댄스 등 기술 운동.",
                    difficulty: 'medium'
                },
                {
                    title: "인터벌 러닝",
                    expertDesc: "강약 조절이 있는 운동이 도파민을 뿜어냅니다.",
                    rationale: "그냥 뛰는 것보다 '1분 전력 질주, 2분 걷기'처럼 변화를 주면 뇌는 지루해하지 않고 각성 상태를 유지합니다.",
                    managerGuide: "🗣️ 미션: \"운동장 한 바퀴는 미친듯이 뛰고, 한 바퀴는 걷자. 딱 3번만 반복해.\"",
                    action: "고강도 인터벌 트레이닝 (HIIT) 20분.",
                    difficulty: 'hard'
                },
                {
                    title: "밸런스 운동",
                    expertDesc: "균형을 잡으려는 노력이 집중력을 기릅니다.",
                    rationale: "짐볼 위에 앉거나 한 발로 서기는 소뇌를 자극하여 주의 집중력을 높입니다.",
                    managerGuide: "🗣️ 놀이: \"한 발로 1분 버티기 해볼까? 흔들리면 지는 거야.\"",
                    action: "짐볼 운동, 외발 서기, 보드 타기.",
                    difficulty: 'easy'
                },
                {
                    title: "클라이밍",
                    expertDesc: "문제 해결 능력을 요하는 전신 운동입니다.",
                    rationale: "어느 홀드를 잡을지 고민하고 몸을 쓰는 클라이밍은 '몸으로 하는 체스'입니다. 두뇌 회전과 체력을 동시에 기릅니다.",
                    managerGuide: "🗣️ 도전: \"클라이밍 어때? 길을 찾아야 올라갈 수 있어. 엄청 재밌을걸?\"",
                    action: "실내 클라이밍 체험.",
                    difficulty: 'medium'
                }
            ]
        }
    }
};

// 🚨 위험 신호 (Red Flags) 데이터 - CareType별 전문 경고 기준
const RED_FLAGS: Record<string, RedFlag[]> = {
    [CareType.HEALTHY]: [
        {
            severity: 'warning',
            condition: '최근 2주 내 급격한 성적 하락 (20점 이상)',
            action: '스트레스 요인 파악을 위한 심층 면담 필요',
            referral: '학교 상담실'
        }
    ],
    [CareType.SLEEP]: [
        {
            severity: 'warning',
            condition: '수면 시간 5시간 미만이 2주 이상 지속',
            action: '수면 위생 교육 및 생활 패턴 점검',
            referral: '수면 클리닉'
        },
        {
            severity: 'critical',
            condition: '주간 졸음으로 인한 일상생활 불가 (수업 중 기절, 이동 중 졸음)',
            action: '즉시 학부모 상담 및 전문의 연계',
            referral: '수면의학과 / 신경과'
        },
        {
            severity: 'emergency',
            condition: '야간 공황 발작 또는 악몽으로 인한 수면 공포증',
            action: '즉각적인 전문 상담 연계 필요',
            referral: '정신건강의학과'
        }
    ],
    [CareType.BURNOUT]: [
        {
            severity: 'warning',
            condition: '무기력 및 학습 거부가 1주 이상 지속',
            action: '학업량 50% 감축 및 휴식 권고',
            referral: '학교 상담실'
        },
        {
            severity: 'critical',
            condition: '"다 때려치우고 싶다", "의미 없다" 등의 언급',
            action: '자해/자살 사고 여부 확인 필수, 보호자 즉시 연락',
            referral: '정신건강의학과 / 청소년상담복지센터 (1388)'
        },
        {
            severity: 'emergency',
            condition: '자해 흔적 발견 또는 자살 암시 언급',
            action: '⚠️ 즉시 보호자 연락, 전문기관 의뢰, 절대 혼자 두지 않기',
            referral: '자살예방상담전화 1393 / 정신건강위기상담 1577-0199'
        }
    ],
    [CareType.ANXIETY_TENSION]: [
        {
            severity: 'warning',
            condition: 'BAI 점수 26점 이상 (심한 불안)',
            action: '불안 관리 프로그램 집중 적용',
            referral: '학교 상담실 또는 Wee센터'
        },
        {
            severity: 'critical',
            condition: '시험 전 구토, 설사, 손 떨림 등 신체화 증상',
            action: '시험 불안 전문 상담 및 이완 기법 집중 훈련',
            referral: '소아청소년 정신건강의학과'
        },
        {
            severity: 'emergency',
            condition: '공황 발작 (과호흡, 심장 이상, 죽을 것 같은 공포)',
            action: '즉각적 진정 개입 후 전문 의료기관 연계',
            referral: '응급실 / 정신건강의학과'
        }
    ],
    [CareType.STRESS_OVERLOAD]: [
        {
            severity: 'warning',
            condition: '두통, 소화불량 등 스트레스성 신체 증상 호소',
            action: '스트레스 요인 분석 및 우선순위 조정 필요',
            referral: '학교 보건실 / 상담실'
        },
        {
            severity: 'critical',
            condition: '분노 폭발, 물건 파손, 폭력적 언행',
            action: '즉시 안정화 개입 후 분노 조절 프로그램 연계',
            referral: '청소년상담복지센터'
        },
        {
            severity: 'emergency',
            condition: '자해 욕구 표현 또는 "사라지고 싶다" 언급',
            action: '⚠️ 절대 혼자 두지 않기, 보호자 즉시 연락',
            referral: '자살예방상담전화 1393'
        }
    ],
    [CareType.LOW_ENERGY]: [
        {
            severity: 'warning',
            condition: '만성 피로가 3주 이상 지속',
            action: '신체 건강 점검 권고 (빈혈, 갑상선 등)',
            referral: '내과 / 가정의학과'
        },
        {
            severity: 'critical',
            condition: '아침에 일어나지 못해 지각/결석 반복',
            action: '기상 장애 원인 파악 및 생활 패턴 중재',
            referral: '수면의학과 / 정신건강의학과'
        }
    ],
    [CareType.DEPRESSION_AMOTIVATION]: [
        {
            severity: 'warning',
            condition: '우울감, 의욕 저하가 2주 이상 지속',
            action: 'PHQ-9 등 우울 선별검사 실시',
            referral: '학교 상담실 / Wee센터'
        },
        {
            severity: 'critical',
            condition: '사회적 고립, 식욕/수면 급변, 취미 상실',
            action: '우울증 가능성 평가 및 보호자 상담',
            referral: '소아청소년 정신건강의학과'
        },
        {
            severity: 'emergency',
            condition: '"죽고 싶다", "내가 없어져야" 등 자살 사고 표현',
            action: '⚠️ 즉각적 자살위험평가, 보호자 즉시 연락, 전문기관 의뢰',
            referral: '자살예방상담전화 1393 / 정신건강위기상담 1577-0199'
        }
    ],
    [CareType.ADRENAL]: [
        {
            severity: 'warning',
            condition: '오전에 극심한 피로, 오후에 반짝 회복 패턴',
            action: '부신 피로 특화 생활 교정 프로그램 적용',
            referral: '가정의학과 / 기능의학 클리닉'
        },
        {
            severity: 'critical',
            condition: '카페인 없이 일상 유지 불가, 혈압/혈당 불안정',
            action: '의료적 평가 필수, 학업량 대폭 조절',
            referral: '내분비내과'
        }
    ],
    [CareType.BRAIN_FATIGUE]: [
        {
            severity: 'warning',
            condition: '집중력 30분 미만, 브레인 포그 호소',
            action: '뇌 휴식 프로토콜 집중 적용',
            referral: '학교 상담실'
        },
        {
            severity: 'critical',
            condition: '심한 두통과 기억력 급감 동반',
            action: '신경과적 검진 권고',
            referral: '신경과 / 두통 클리닉'
        }
    ],
    [CareType.HYPERSENSITIVE]: [
        {
            severity: 'warning',
            condition: '소음, 빛에 과민 반응하여 학습 불가',
            action: '감각 조절 환경 구축 및 노이즈 캔슬링 도구 지원',
            referral: '학교 상담실 / 발달센터'
        },
        {
            severity: 'critical',
            condition: '감각 과부하로 인한 정서 폭발 (울음, 분노)',
            action: '즉각적 감각 통제 환경 제공, 전문 평가 의뢰',
            referral: '발달심리센터 / 정신건강의학과'
        }
    ],
    [CareType.ATTENTION_DEFICIT]: [
        {
            severity: 'warning',
            condition: '주의력 결핍으로 인한 학업 수행 불가',
            action: 'ADHD 선별검사 실시 권고',
            referral: '학교 상담실 / Wee센터'
        },
        {
            severity: 'critical',
            condition: 'ADHD 진단력 있으나 약물 중단 상태',
            action: '보호자 상담 후 전문의 재방문 권고',
            referral: '소아청소년 정신건강의학과'
        }
    ],
    [CareType.CONCENTRATION]: [
        {
            severity: 'warning',
            condition: '집중 시간이 15분 미만으로 급격히 감소',
            action: '디지털 디톡스 및 수면 패턴 점검',
            referral: '학교 상담실'
        }
    ],
    [CareType.CIRCULATION]: [
        {
            severity: 'warning',
            condition: '수족 냉증, 어지럼증 빈번',
            action: '혈액순환 개선 운동 강화 적용',
            referral: '가정의학과'
        },
        {
            severity: 'critical',
            condition: '실신(기절) 또는 실신 전조 증상',
            action: '즉시 의료 평가 필요',
            referral: '순환기내과 / 신경과'
        }
    ]
};

// 📝 학부모 전달용 메시지 템플릿 - CareType별 맞춤 안내
const PARENT_SCRIPTS: Record<string, ParentScript[]> = {
    [CareType.HEALTHY]: [
        {
            category: '학습 루틴',
            icon: '📚',
            shortMessage: '학생이 현재 좋은 컨디션을 유지하고 있습니다. 현재 생활 패턴을 꾸준히 유지해 주세요.',
            detailedMessage: '안녕하세요, 학부모님. 금일 상담 결과, 학생이 신체적·정서적으로 안정된 상태입니다. 현재의 좋은 습관을 유지하면서 시험 기간에도 무리하지 않도록 격려 부탁드립니다.',
            tips: ['기존 수면 시간(7-8시간) 유지', '주말에도 기상 시간 1시간 이내 유지', '주 1회 완전 휴식일 확보']
        },
        {
            category: '컨디션 유지',
            icon: '✨',
            shortMessage: '번아웃 예방을 위해 주말 하루는 완전히 쉬게 해주세요.',
            detailedMessage: '학생의 현재 컨디션이 좋지만, 지속적인 학습 스트레스는 번아웃으로 이어질 수 있습니다. 주말 중 하루는 학업에서 완전히 벗어나 취미 활동이나 가족 시간을 가지시길 권장드립니다.',
            tips: ['주말 오전은 충분히 휴식', '야외 활동이나 운동 권장', '성적 압박보다 과정 칭찬']
        }
    ],
    [CareType.SLEEP]: [
        {
            category: '수면 관리',
            icon: '😴',
            shortMessage: '이번 주는 수면 루틴에 집중하시고, 밤 11시 이전 취침을 도와주세요.',
            detailedMessage: '안녕하세요, 학부모님. 상담 결과, 학생의 수면 패턴이 불규칙하여 낮 시간 집중력에 영향을 주고 있습니다. 밤 11시 이전 취침, 기상 시간 고정을 2주간 집중적으로 실천해 주시면 학습 효율이 크게 개선될 것입니다.',
            tips: ['밤 10시 이후 스마트폰 수거', '침실에 TV/컴퓨터 없애기', '취침 1시간 전 조명 낮추기', '주말에도 같은 시간 기상']
        },
        {
            category: '디지털 디톡스',
            icon: '📵',
            shortMessage: '취침 전 1시간은 스마트폰 사용을 제한해 주세요. 블루라이트가 수면을 방해합니다.',
            detailedMessage: '스마트폰의 블루라이트는 멜라토닌 분비를 억제하여 잠들기 어렵게 만듭니다. 취침 1시간 전부터 스마트폰을 충전기(침실 밖)에 두는 규칙을 만들어 주시면 수면의 질이 향상됩니다.',
            tips: ['충전기를 거실에 두기', '알람은 일반 시계 사용', '필요시 블루라이트 차단 안경']
        },
        {
            category: '수면 환경',
            icon: '🛏️',
            shortMessage: '침실 온도를 18-20도로 유지하고, 암막 커튼 설치를 권장드립니다.',
            detailedMessage: '최적의 수면을 위해 침실 환경 조성이 중요합니다. 온도는 18-20도, 완전한 암막, 적절한 습도가 깊은 수면을 돕습니다.',
            tips: ['침실은 수면 전용 공간으로', '침대에서 공부/스마트폰 금지', '백색소음기 활용 가능']
        }
    ],
    [CareType.BURNOUT]: [
        {
            category: '휴식 우선',
            icon: '🔋',
            shortMessage: '학생의 에너지가 많이 소진된 상태입니다. 이번 주는 학습량을 50% 줄이고 충분한 휴식을 취하게 해주세요.',
            detailedMessage: '안녕하세요, 학부모님. 상담 결과, 학생이 번아웃 초기 증상을 보이고 있습니다. 지금 무리하면 회복에 더 오랜 시간이 걸릴 수 있으므로, 2주간 학습량을 절반으로 줄이고 충분한 수면과 휴식을 우선시해 주시기 바랍니다.',
            tips: ['하루 학습 시간 4-5시간으로 제한', '학원 일정 조정 검토', '좋아하는 취미 시간 확보', '성적 압박 최소화']
        },
        {
            category: '정서 지원',
            icon: '💚',
            shortMessage: '학생의 노력을 인정해 주시고, 결과보다 과정을 칭찬해 주세요.',
            detailedMessage: '번아웃 상태에서는 "더 열심히 해라"라는 말이 오히려 부담이 됩니다. "충분히 잘하고 있어", "힘들면 쉬어도 괜찮아"라는 메시지가 회복에 도움이 됩니다.',
            tips: ['매일 잘한 점 하나씩 칭찬', '비교하지 않기', '"힘들면 말해"라고 먼저 말하기', '함께 산책하며 대화']
        },
        {
            category: '생활 리듬',
            icon: '⏰',
            shortMessage: '규칙적인 생활 리듬이 회복의 핵심입니다. 기상-식사-취침 시간을 일정하게 유지해 주세요.',
            detailedMessage: '불규칙한 생활은 자율신경계를 더욱 피로하게 만듭니다. 주말 포함 같은 시간에 일어나고 자는 것만으로도 회복이 빨라집니다.',
            tips: ['주말에도 평일과 같은 기상 시간', '아침 식사 꼭 챙기기', '밤 11시 전 취침']
        }
    ],
    [CareType.ANXIETY_TENSION]: [
        {
            category: '불안 완화',
            icon: '🧘',
            shortMessage: '시험 불안이 높은 상태입니다. 시험 결과보다 "노력한 과정"을 칭찬해 주세요.',
            detailedMessage: '안녕하세요, 학부모님. 학생이 시험에 대한 불안이 높은 상태입니다. "잘 봐야 해"라는 압박보다 "네가 열심히 준비한 거 알아"라는 격려가 실제 수행에도 도움이 됩니다.',
            tips: ['"시험 결과와 상관없이 사랑해"라고 말해주기', '시험 전날 일찍 취침 유도', '시험 당일 아침 가볍게 대화']
        },
        {
            category: '신체 증상 관찰',
            icon: '👀',
            shortMessage: '불안이 높으면 두통, 복통, 소화불량이 나타날 수 있습니다. 이런 증상이 반복되면 알려주세요.',
            detailedMessage: '심리적 불안은 신체 증상으로 나타나기도 합니다. 시험 전 반복적인 복통, 두통, 구역감은 불안의 신호일 수 있으니 관찰해 주시고, 지속되면 상담을 요청해 주세요.',
            tips: ['증상을 무시하거나 꾀병 취급하지 않기', '따뜻한 음료나 손잡기로 안정', '필요시 전문 상담 연계']
        },
        {
            category: '이완 기법',
            icon: '🌬️',
            shortMessage: '긴장될 때 4-7-8 호흡법을 사용하도록 함께 연습해 주세요.',
            detailedMessage: '4초 들이마시고, 7초 멈추고, 8초 내뱉는 호흡법은 불안을 즉각적으로 낮춥니다. 가정에서 함께 연습해 주시면 학생이 시험장에서도 활용할 수 있습니다.',
            tips: ['하루 3회 함께 호흡법 연습', '자기 전 5분 명상 루틴', '불안할 때 "괜찮아, 심호흡해"라고 말하기']
        }
    ],
    [CareType.STRESS_OVERLOAD]: [
        {
            category: '스트레스 해소',
            icon: '💆',
            shortMessage: '스트레스가 과다한 상태입니다. 운동이나 취미 활동으로 발산할 시간을 확보해 주세요.',
            detailedMessage: '안녕하세요, 학부모님. 학생의 스트레스 지수가 높은 상태입니다. 공부만 강요하면 역효과가 날 수 있으니, 하루 30분 이상 운동이나 좋아하는 활동 시간을 확보해 주시기 바랍니다.',
            tips: ['매일 30분 운동 또는 산책', '주 1회 친구 만남 허용', '취미 활동 지지', '스트레스 원인에 대해 대화']
        },
        {
            category: '감정 소통',
            icon: '💬',
            shortMessage: '짜증이나 화를 표출하더라도, 먼저 들어주시고 공감해 주세요.',
            detailedMessage: '스트레스가 과다하면 예민해지고 짜증이 늘어납니다. 이때 "왜 그래"라고 다그치기보다 "뭐가 힘들어?"라고 물어봐 주세요. 감정을 표현할 수 있는 안전한 공간이 필요합니다.',
            tips: ['감정 표현 허용하기', '"힘들구나" 공감 먼저', '해결책보다 경청 우선', '함께 산책하며 대화']
        }
    ],
    [CareType.LOW_ENERGY]: [
        {
            category: '에너지 보충',
            icon: '⚡',
            shortMessage: '에너지가 낮은 상태입니다. 아침 식사를 꼭 챙기고, 햇볕을 쬐는 시간을 늘려주세요.',
            detailedMessage: '안녕하세요, 학부모님. 학생의 활력이 많이 떨어진 상태입니다. 단백질 위주의 아침 식사와 오전 햇볕 쬐기(15분)가 에너지 회복에 도움이 됩니다.',
            tips: ['아침에 계란, 두유 등 단백질', '등교 전 햇볕 쬐기', '점심 후 10분 산책', '규칙적인 기상 시간']
        },
        {
            category: '건강 체크',
            icon: '🩺',
            shortMessage: '만성 피로가 지속되면 빈혈, 갑상선 등 신체 검진을 고려해 주세요.',
            detailedMessage: '무기력이 2주 이상 지속되면 단순 피로가 아닐 수 있습니다. 빈혈, 갑상선 기능 저하, 비타민D 부족 등을 확인하기 위해 건강 검진을 권장드립니다.',
            tips: ['혈액검사(CBC, 갑상선, 비타민D)', '충분한 수면에도 피로 지속 시 내과 방문', '철분제/비타민 보충 고려']
        }
    ],
    [CareType.DEPRESSION_AMOTIVATION]: [
        {
            category: '정서적 지지',
            icon: '🤗',
            shortMessage: '우울 증상이 관찰됩니다. 비난보다 곁에 있어 주시고, 작은 성취도 칭찬해 주세요.',
            detailedMessage: '안녕하세요, 학부모님. 학생이 의욕 저하와 우울 증상을 보이고 있습니다. "왜 안 해?"라는 다그침보다 "옆에 있어"라는 존재감이 중요합니다. 작은 것도 "잘했어"라고 칭찬해 주세요.',
            tips: ['"잘했어, 오늘 일어났네" 등 작은 칭찬', '함께 밥 먹기, 산책하기', '혼자 두지 않기', '표정/언행 변화 관찰']
        },
        {
            category: '전문 도움',
            icon: '🏥',
            shortMessage: '우울 증상이 2주 이상 지속되면 전문 상담을 권장드립니다.',
            detailedMessage: '우울감이 2주 이상 지속되고 일상생활에 지장이 있다면, 전문 상담이나 정신건강의학과 방문을 고려해 주세요. 조기 개입이 회복을 빠르게 합니다.',
            tips: ['Wee센터, 청소년상담복지센터 활용', '정신건강의학과 편견 없이 방문', '약물 치료 필요 시 전문의 상담']
        },
        {
            category: '위험 신호 관찰',
            icon: '⚠️',
            shortMessage: '"죽고 싶다", "사라지고 싶다" 등의 언급이 있으면 즉시 연락 주세요.',
            detailedMessage: '자해나 자살에 대한 언급은 도움을 요청하는 신호입니다. 놀라지 마시고, 비난하지 마시고, 즉시 저에게 연락해 주세요. 함께 전문 도움을 연결해 드리겠습니다.',
            tips: ['자살 언급 시 절대 혼자 두지 않기', '자살예방상담전화 1393', '청소년상담 1388', '즉시 학교/상담사에 연락']
        }
    ],
    [CareType.ADRENAL]: [
        {
            category: '생활 교정',
            icon: '🌅',
            shortMessage: '부신 피로가 의심됩니다. 밤 10시 취침, 카페인 제한을 2주간 시도해 주세요.',
            detailedMessage: '안녕하세요, 학부모님. 상담 결과, 부신 피로 증상이 관찰됩니다. 밤 10시 이전 취침, 커피/에너지 드링크 제한, 아침 단백질 식사가 회복에 중요합니다.',
            tips: ['밤 10시 전 취침', '커피, 에너지 드링크 중단', '아침 단백질 섭취', '격렬한 운동 자제']
        },
        {
            category: '영양 보충',
            icon: '💊',
            shortMessage: '비타민C, 마그네슘, 비타민B군이 부신 회복에 도움이 됩니다.',
            detailedMessage: '부신은 비타민C를 가장 많이 소모하는 기관입니다. 비타민C, 마그네슘, 비타민B군 보충을 고려해 주세요. 기능의학 클리닉 방문도 방법입니다.',
            tips: ['비타민C 1000mg 이상', '마그네슘 취침 전 복용', '정제 설탕, 밀가루 줄이기']
        }
    ],
    [CareType.BRAIN_FATIGUE]: [
        {
            category: '뇌 휴식',
            icon: '🧠',
            shortMessage: '뇌 피로가 심한 상태입니다. 50분 공부 후 10분 휴식을 철저히 지키게 해주세요.',
            detailedMessage: '안녕하세요, 학부모님. 학생의 뇌 피로도가 높습니다. 연속 공부 시간을 50분으로 제한하고, 휴식 시간에는 스마트폰 대신 눈 감기나 스트레칭을 하도록 유도해 주세요.',
            tips: ['50분 공부 / 10분 휴식 철저', '휴식 시 스마트폰 금지', '눈 감고 쉬기, 스트레칭', '자연 속 산책 권장']
        },
        {
            category: '디지털 부하 감소',
            icon: '📴',
            shortMessage: '스마트폰, 게임 시간을 줄이고, 자연 속 시간을 늘려주세요.',
            detailedMessage: '디지털 기기는 뇌를 쉬지 못하게 만듭니다. 하루 스크린 타임을 2시간 이내로 제한하고, 대신 산책이나 독서 시간을 확보해 주세요.',
            tips: ['스크린 타임 하루 2시간 이내', '식사 중 스마트폰 금지', '취침 1시간 전 디지털 기기 반납']
        }
    ],
    [CareType.HYPERSENSITIVE]: [
        {
            category: '환경 조성',
            icon: '🔇',
            shortMessage: '소음과 자극에 예민한 상태입니다. 조용한 학습 환경을 만들어 주세요.',
            detailedMessage: '안녕하세요, 학부모님. 학생이 감각 자극에 예민한 상태입니다. 조용하고 정돈된 학습 공간, 노이즈 캔슬링 이어폰 등이 집중에 도움이 됩니다.',
            tips: ['조용한 공부 공간 확보', '노이즈 캔슬링 이어폰 지원', '시각적 자극 최소화', '학습 시간 외 혼자 있는 시간 확보']
        },
        {
            category: '정서 안정',
            icon: '💆',
            shortMessage: '갑작스러운 변화나 과도한 자극을 피하고, 예측 가능한 일과를 유지해 주세요.',
            detailedMessage: '예민한 학생에게는 일관된 일과와 예측 가능한 환경이 중요합니다. 갑작스러운 계획 변경을 피하고, 변화가 있을 때는 미리 알려주세요.',
            tips: ['일관된 일과 유지', '변화 있을 때 미리 공지', '과도한 사회적 일정 피하기', '충분한 혼자만의 시간']
        }
    ],
    [CareType.ATTENTION_DEFICIT]: [
        {
            category: '환경 설계',
            icon: '🎯',
            shortMessage: '집중을 돕기 위해 책상 위를 깔끔하게 유지하고, 스마트폰은 다른 방에 두게 해주세요.',
            detailedMessage: '안녕하세요, 학부모님. 주의력 관리가 필요한 학생입니다. 의지력보다 환경 설계가 중요합니다. 책상에는 공부할 책 한 권만, 스마트폰은 물리적으로 분리해 주세요.',
            tips: ['책상 위 최소화', '스마트폰 다른 방에 두기', '타이머 활용', '짧은 시간 집중, 자주 휴식']
        },
        {
            category: '루틴 고정',
            icon: '📋',
            shortMessage: '매일 같은 시간에 공부를 시작하는 루틴을 만들어 주세요.',
            detailedMessage: '일관된 루틴은 뇌가 자동으로 공부 모드로 전환되게 합니다. 매일 같은 시간, 같은 장소에서 공부를 시작하는 습관을 만들어 주세요.',
            tips: ['매일 같은 시간 공부 시작', '같은 장소에서 공부', '시작 전 5분 준비 루틴', '작은 목표로 성취감 느끼기']
        },
        {
            category: '전문 평가',
            icon: '🔬',
            shortMessage: '주의력 문제가 지속되면 ADHD 전문 평가를 고려해 주세요.',
            detailedMessage: '집중력 문제가 학업과 일상에 지속적으로 영향을 미친다면, ADHD 여부를 확인하는 전문 평가를 받아보시는 것을 권장드립니다. 적절한 지원을 받으면 크게 개선됩니다.',
            tips: ['Wee센터 선별검사', '소아청소년 정신건강의학과 방문', 'ADHD 진단 시 맞춤 학습 전략 적용']
        }
    ],
    [CareType.CONCENTRATION]: [
        {
            category: '집중력 강화',
            icon: '🎯',
            shortMessage: '집중력을 높이기 위해 25분 공부-5분 휴식 패턴을 적용해 주세요.',
            detailedMessage: '안녕하세요, 학부모님. 학생의 집중력 향상을 위해 뽀모도로 기법(25분 집중-5분 휴식)을 권장드립니다. 짧은 주기의 집중이 효율을 높입니다.',
            tips: ['25분 집중 / 5분 휴식', '휴식 시 스마트폰 금지', '시각적 타이머 활용', '가장 집중 잘 되는 시간대 파악']
        },
        {
            category: '디지털 관리',
            icon: '📱',
            shortMessage: '스마트폰 사용 시간을 하루 2시간 이내로 제한해 주세요.',
            detailedMessage: '스마트폰은 도파민을 과다 소비하여 공부에 대한 집중력을 떨어뜨립니다. 하루 스크린 타임을 2시간 이내로 제한하고, 공부 시간에는 완전히 분리해 주세요.',
            tips: ['스크린 타임 앱 활용', '공부 시간 비행기 모드', '알림 전면 차단', 'SNS 사용 시간 제한']
        }
    ],
    [CareType.CIRCULATION]: [
        {
            category: '혈액순환 개선',
            icon: '🩸',
            shortMessage: '장시간 앉아 있지 않도록 50분마다 일어나서 스트레칭하게 해주세요.',
            detailedMessage: '안녕하세요, 학부모님. 학생의 혈액순환이 원활하지 않은 상태입니다. 50분마다 반드시 일어나서 1분간 스트레칭이나 걷기를 하도록 지도해 주세요.',
            tips: ['50분마다 스트레칭', '물 충분히 마시기 (하루 2L)', '다리 꼬지 않기', '수족 냉증 시 따뜻하게 유지']
        },
        {
            category: '운동 권장',
            icon: '🚶',
            shortMessage: '하루 20분 걷기 운동을 꾸준히 하면 뇌 혈류가 개선됩니다.',
            detailedMessage: '규칙적인 유산소 운동은 뇌로 가는 혈류를 늘려 집중력과 기억력을 향상시킵니다. 하루 20분 빠르게 걷기를 권장드립니다.',
            tips: ['등하교 시 15-20분 걷기', '엘리베이터 대신 계단', '주말 가족 산책', '수영, 자전거도 좋음']
        }
    ]
};

// 📊 성공 지표 (KPI) 데이터 - CareType별 객관적 측정 기준
const SUCCESS_INDICATORS: Record<string, SuccessIndicator[]> = {
    [CareType.HEALTHY]: [
        {
            category: '컨디션 유지',
            icon: '✨',
            indicator: 'HRV 안정 상태 유지',
            targetValue: 'SDNN 50ms 이상 유지',
            timeframe: '매 측정 시',
            measureMethod: 'HRV 측정기 또는 앱 측정',
            priority: 'medium'
        },
        {
            category: '학습 효율',
            icon: '📚',
            indicator: '집중 시간 유지',
            targetValue: '50분 연속 집중 가능',
            timeframe: '1주 내',
            measureMethod: '자기 보고 / 학습 타이머 기록',
            priority: 'medium'
        },
        {
            category: '생활 습관',
            icon: '🌙',
            indicator: '수면 패턴 일정 유지',
            targetValue: '취침/기상 시간 편차 30분 이내',
            timeframe: '지속',
            measureMethod: '수면 일지 또는 스마트워치',
            priority: 'low'
        }
    ],
    [CareType.SLEEP]: [
        {
            category: '수면 시간',
            icon: '⏰',
            indicator: '총 수면 시간 증가',
            targetValue: '일주일 내 수면 시간 30분 증가',
            timeframe: '1주',
            measureMethod: '수면 일지 / 스마트워치 앱',
            priority: 'high'
        },
        {
            category: '수면 질',
            icon: '😴',
            indicator: '수면 효율 개선',
            targetValue: '누워서 30분 이내 입면',
            timeframe: '2주',
            measureMethod: '자기 보고 (입면 시간 체크)',
            priority: 'high'
        },
        {
            category: '주간 졸음',
            icon: '☀️',
            indicator: 'ESS 점수 감소',
            targetValue: 'ESS 점수 10점 이하',
            timeframe: '2주',
            measureMethod: 'Epworth 졸음 척도 재검사',
            priority: 'medium'
        },
        {
            category: '디지털 습관',
            icon: '📵',
            indicator: '취침 전 스마트폰 사용 감소',
            targetValue: '취침 1시간 전 사용 중단',
            timeframe: '1주',
            measureMethod: '스크린 타임 앱 확인',
            priority: 'medium'
        }
    ],
    [CareType.BURNOUT]: [
        {
            category: '휴식',
            icon: '🔋',
            indicator: '일일 학습량 조절',
            targetValue: '학습 시간 50% 감소 준수',
            timeframe: '2주',
            measureMethod: '학습 일지 / 학부모 확인',
            priority: 'high'
        },
        {
            category: '에너지',
            icon: '⚡',
            indicator: '주관적 에너지 레벨 상승',
            targetValue: '10점 만점 중 2점 이상 상승',
            timeframe: '2주',
            measureMethod: '상담 시 자기 보고 (0-10점)',
            priority: 'high'
        },
        {
            category: '정서',
            icon: '💚',
            indicator: '무력감/우울감 감소',
            targetValue: 'BDI 점수 5점 이상 감소',
            timeframe: '4주',
            measureMethod: 'Beck 우울 척도 재검사',
            priority: 'medium'
        },
        {
            category: '생활 리듬',
            icon: '🌅',
            indicator: '규칙적인 기상 시간',
            targetValue: '주말 포함 동일 시간 기상',
            timeframe: '2주',
            measureMethod: '기상 시간 기록',
            priority: 'medium'
        }
    ],
    [CareType.ANXIETY_TENSION]: [
        {
            category: '불안 수준',
            icon: '📉',
            indicator: 'BAI 점수 감소',
            targetValue: 'BAI 점수 5점 이상 하락',
            timeframe: '2주',
            measureMethod: 'Beck 불안 척도 재검사',
            priority: 'high'
        },
        {
            category: '신체 증상',
            icon: '🩺',
            indicator: '신체화 증상 감소',
            targetValue: '두통/복통 빈도 50% 감소',
            timeframe: '2주',
            measureMethod: '증상 일지 (빈도 기록)',
            priority: 'high'
        },
        {
            category: '이완 능력',
            icon: '🧘',
            indicator: '호흡법 숙달',
            targetValue: '4-7-8 호흡법 자발적 활용',
            timeframe: '1주',
            measureMethod: '자기 보고 (활용 횟수)',
            priority: 'medium'
        },
        {
            category: '시험 수행',
            icon: '📝',
            indicator: '시험 불안 감소',
            targetValue: '시험 중 신체 증상 감소',
            timeframe: '다음 시험',
            measureMethod: '시험 후 자기 보고',
            priority: 'medium'
        }
    ],
    [CareType.STRESS_OVERLOAD]: [
        {
            category: '스트레스',
            icon: '📊',
            indicator: 'PSS 점수 감소',
            targetValue: 'PSS 점수 5점 이상 하락',
            timeframe: '2주',
            measureMethod: '지각된 스트레스 척도 재검사',
            priority: 'high'
        },
        {
            category: '운동',
            icon: '🏃',
            indicator: '신체 활동 증가',
            targetValue: '주 3회 이상 운동',
            timeframe: '2주',
            measureMethod: '운동 일지 / 앱 기록',
            priority: 'high'
        },
        {
            category: '감정 조절',
            icon: '😤',
            indicator: '분노 폭발 빈도 감소',
            targetValue: '주간 폭발 횟수 50% 감소',
            timeframe: '2주',
            measureMethod: '자기 보고 / 학부모 확인',
            priority: 'medium'
        },
        {
            category: 'HRV',
            icon: '❤️',
            indicator: 'HRV 개선',
            targetValue: 'RMSSD 10ms 이상 증가',
            timeframe: '4주',
            measureMethod: 'HRV 측정기 재측정',
            priority: 'medium'
        }
    ],
    [CareType.LOW_ENERGY]: [
        {
            category: '에너지',
            icon: '⚡',
            indicator: '주관적 활력 상승',
            targetValue: '활력 점수 3점 이상 상승 (10점 만점)',
            timeframe: '2주',
            measureMethod: '상담 시 자기 보고',
            priority: 'high'
        },
        {
            category: '아침 각성',
            icon: '☀️',
            indicator: '기상 후 각성 시간 단축',
            targetValue: '기상 후 30분 이내 완전 각성',
            timeframe: '1주',
            measureMethod: '자기 보고',
            priority: 'high'
        },
        {
            category: '영양',
            icon: '🍳',
            indicator: '아침 식사 습관화',
            targetValue: '주 5일 이상 아침 식사',
            timeframe: '2주',
            measureMethod: '식사 일지',
            priority: 'medium'
        },
        {
            category: '건강',
            icon: '🩸',
            indicator: '혈액검사 정상화',
            targetValue: '빈혈/갑상선 수치 정상 범위',
            timeframe: '4주',
            measureMethod: '의료기관 혈액검사',
            priority: 'medium'
        }
    ],
    [CareType.DEPRESSION_AMOTIVATION]: [
        {
            category: '우울',
            icon: '📉',
            indicator: 'PHQ-9 점수 감소',
            targetValue: 'PHQ-9 5점 이상 하락',
            timeframe: '4주',
            measureMethod: 'PHQ-9 재검사',
            priority: 'high'
        },
        {
            category: '활동',
            icon: '🚶',
            indicator: '일상 활동 횟수 증가',
            targetValue: '외출/사회 활동 주 2회 이상',
            timeframe: '2주',
            measureMethod: '활동 일지',
            priority: 'high'
        },
        {
            category: '수면',
            icon: '🛏️',
            indicator: '침대 이탈 시간 준수',
            targetValue: '기상 후 10분 이내 침대 이탈',
            timeframe: '1주',
            measureMethod: '자기 보고',
            priority: 'medium'
        },
        {
            category: '즐거움',
            icon: '😊',
            indicator: '쾌감 회복 (Anhedonia 개선)',
            targetValue: '즐거움 느낀 활동 주 1회 이상',
            timeframe: '2주',
            measureMethod: '자기 보고',
            priority: 'medium'
        }
    ],
    [CareType.ADRENAL]: [
        {
            category: '피로',
            icon: '🔋',
            indicator: '오전 피로 감소',
            targetValue: '오전 에너지 3점 이상 상승 (10점)',
            timeframe: '2주',
            measureMethod: '오전 9시 에너지 레벨 자가 평가',
            priority: 'high'
        },
        {
            category: '카페인',
            icon: '☕',
            indicator: '카페인 의존도 감소',
            targetValue: '하루 커피 1잔 이하',
            timeframe: '2주',
            measureMethod: '카페인 섭취 일지',
            priority: 'high'
        },
        {
            category: '수면',
            icon: '🌙',
            indicator: '취침 시간 앞당기기',
            targetValue: '밤 10시 이전 취침',
            timeframe: '1주',
            measureMethod: '수면 일지',
            priority: 'high'
        },
        {
            category: '혈압',
            icon: '💓',
            indicator: '기립성 저혈압 개선',
            targetValue: '일어날 때 어지러움 감소',
            timeframe: '4주',
            measureMethod: '증상 자기 보고',
            priority: 'medium'
        }
    ],
    [CareType.BRAIN_FATIGUE]: [
        {
            category: '집중력',
            icon: '🎯',
            indicator: '연속 집중 시간 증가',
            targetValue: '30분 → 50분 연속 집중',
            timeframe: '2주',
            measureMethod: '학습 타이머 기록',
            priority: 'high'
        },
        {
            category: '브레인 포그',
            icon: '🌫️',
            indicator: '머리 맑음 정도 개선',
            targetValue: '뇌 안개 증상 50% 감소',
            timeframe: '2주',
            measureMethod: '자기 보고 (0-10점)',
            priority: 'high'
        },
        {
            category: '디지털',
            icon: '📱',
            indicator: '스크린 타임 감소',
            targetValue: '하루 스크린 타임 2시간 이내',
            timeframe: '1주',
            measureMethod: '스크린 타임 앱',
            priority: 'medium'
        },
        {
            category: '휴식',
            icon: '🧘',
            indicator: '50분 공부 후 반드시 휴식',
            targetValue: '휴식 규칙 준수율 80% 이상',
            timeframe: '1주',
            measureMethod: '자기 보고 / 타이머 앱',
            priority: 'medium'
        }
    ],
    [CareType.HYPERSENSITIVE]: [
        {
            category: '감각 조절',
            icon: '🔇',
            indicator: '감각 과부하 빈도 감소',
            targetValue: '과부하 에피소드 주 2회 이하',
            timeframe: '2주',
            measureMethod: '증상 일지',
            priority: 'high'
        },
        {
            category: '환경',
            icon: '🏠',
            indicator: '학습 환경 최적화',
            targetValue: '조용한 학습 공간 확보',
            timeframe: '1주',
            measureMethod: '학부모/본인 확인',
            priority: 'high'
        },
        {
            category: '정서',
            icon: '😌',
            indicator: '정서적 폭발 빈도 감소',
            targetValue: '감정 폭발 50% 감소',
            timeframe: '2주',
            measureMethod: '자기 보고 / 학부모 확인',
            priority: 'medium'
        },
        {
            category: '혼자 시간',
            icon: '🧘',
            indicator: '재충전 시간 확보',
            targetValue: '하루 30분 이상 혼자 시간',
            timeframe: '1주',
            measureMethod: '자기 보고',
            priority: 'medium'
        }
    ],
    [CareType.ATTENTION_DEFICIT]: [
        {
            category: '집중력',
            icon: '🎯',
            indicator: '지속 주의력 개선',
            targetValue: '25분 연속 집중 가능',
            timeframe: '2주',
            measureMethod: '포모도로 완료 횟수',
            priority: 'high'
        },
        {
            category: '과제 완수',
            icon: '✅',
            indicator: '과제 완료율 상승',
            targetValue: '과제 완료율 70% 이상',
            timeframe: '2주',
            measureMethod: '과제 체크리스트',
            priority: 'high'
        },
        {
            category: '환경',
            icon: '📚',
            indicator: '책상 정리 습관화',
            targetValue: '공부 시작 전 책상 정리',
            timeframe: '1주',
            measureMethod: '자기 보고',
            priority: 'medium'
        },
        {
            category: '스마트폰',
            icon: '📵',
            indicator: '공부 중 스마트폰 분리',
            targetValue: '공부 시간 100% 분리',
            timeframe: '1주',
            measureMethod: '자기 보고 / 앱 잠금',
            priority: 'high'
        }
    ],
    [CareType.CONCENTRATION]: [
        {
            category: '집중 시간',
            icon: '⏱️',
            indicator: '연속 집중 시간 증가',
            targetValue: '25분 → 50분 연속 집중',
            timeframe: '2주',
            measureMethod: '학습 타이머 기록',
            priority: 'high'
        },
        {
            category: '방해 요소',
            icon: '🚫',
            indicator: '방해 요소 제거',
            targetValue: '공부 중 스마트폰 확인 0회',
            timeframe: '1주',
            measureMethod: '자기 보고',
            priority: 'high'
        },
        {
            category: '학습 효율',
            icon: '📊',
            indicator: '단위 시간당 학습량 증가',
            targetValue: '동일 시간 대비 20% 효율 증가',
            timeframe: '2주',
            measureMethod: '문제 풀이 개수 비교',
            priority: 'medium'
        }
    ],
    [CareType.CIRCULATION]: [
        {
            category: '운동',
            icon: '🚶',
            indicator: '일일 걷기 시간 증가',
            targetValue: '하루 20분 이상 걷기',
            timeframe: '1주',
            measureMethod: '만보기 / 스마트워치',
            priority: 'high'
        },
        {
            category: '혈류',
            icon: '🩸',
            indicator: '수족 냉증 개선',
            targetValue: '손발 차가움 50% 감소',
            timeframe: '2주',
            measureMethod: '자기 보고 (0-10점)',
            priority: 'medium'
        },
        {
            category: '자세',
            icon: '🧍',
            indicator: '50분마다 스트레칭',
            targetValue: '스트레칭 습관 정착',
            timeframe: '1주',
            measureMethod: '자기 보고 / 알람 설정',
            priority: 'medium'
        },
        {
            category: '수분',
            icon: '💧',
            indicator: '수분 섭취량 증가',
            targetValue: '하루 2L 이상 물 마시기',
            timeframe: '1주',
            measureMethod: '물병 기록',
            priority: 'low'
        }
    ]
};


// 📚 보조 자료 링크 - CareType별 시각/다운로드 자료
const RESOURCES: Record<string, Resource[]> = {
    [CareType.HEALTHY]: [
        {
            title: '4-7-8 호흡법 가이드 영상',
            type: 'video',
            icon: '🎬',
            description: 'Dr. Andrew Weil의 4-7-8 호흡법 설명 영상. 불안 완화와 수면 유도에 효과적.',
            url: 'https://www.youtube.com/watch?v=YRPh_GaiL8s',
            duration: '2분 30초',
            category: '호흡법'
        },
        {
            title: '포모도로 타이머 앱',
            type: 'app',
            icon: '📱',
            description: 'Focus To-Do - 포모도로 기법을 적용한 집중 타이머 앱',
            url: 'https://www.focustodo.cn/',
            category: '학습 도구'
        },
        {
            title: '학습 플래너 템플릿',
            type: 'pdf',
            icon: '📄',
            description: '주간 학습 계획표와 일일 점검표 템플릿',
            url: '/resources/study_planner_template.pdf',
            category: '학습 도구'
        },
        {
            title: '마인드맵 작성 가이드',
            type: 'pdf',
            icon: '📄',
            description: '효과적인 마인드맵 작성법과 예시 (오프라인 지원)',
            url: '/resources/mind_map_guide.html',
            category: '학습 도구'
        }
    ],
    [CareType.SLEEP]: [
        {
            title: '수면 일기 템플릿',
            type: 'pdf',
            icon: '📄',
            description: '2주간 수면 패턴을 기록하는 수면 일기 양식',
            url: '/resources/sleep_diary_template.pdf',
            category: '수면'
        },
        {
            title: '수면 위생 체크리스트',
            type: 'pdf',
            icon: '📄',
            description: '좋은 수면을 위한 환경 점검 체크리스트',
            url: '/resources/sleep_hygiene_checklist.pdf',
            category: '수면'
        },
        {
            title: '블루라이트 차단 앱 - Flux',
            type: 'app',
            icon: '📱',
            description: '컴퓨터 화면의 블루라이트를 자동으로 조절하는 앱',
            url: 'https://justgetflux.com/',
            category: '수면'
        },
        {
            title: '수면 유도 명상 (10분)',
            type: 'video',
            icon: '🎬',
            description: '잠들기 전 듣는 가이드 명상 - 이완과 수면 유도',
            url: 'https://www.youtube.com/watch?v=aEqlQvczMJQ',
            duration: '10분',
            category: '명상'
        },
        {
            title: '백색소음 재생기',
            type: 'link',
            icon: '🔗',
            description: '수면에 도움되는 백색소음/자연음 사이트',
            url: 'https://mynoise.net/',
            category: '수면'
        }
    ],
    [CareType.BURNOUT]: [
        {
            title: '번아웃 자가진단 체크리스트',
            type: 'pdf',
            icon: '📄',
            description: 'MBI 기반 번아웃 증상 체크리스트',
            url: '/resources/burnout_checklist.pdf',
            category: '자가진단'
        },
        {
            title: '에너지 관리 워크시트',
            type: 'pdf',
            icon: '📄',
            description: '일일 에너지 수준 추적 및 회복 활동 계획표',
            url: '/resources/energy_management.pdf',
            category: '회복'
        },
        {
            title: '마음챙김 명상 (5분)',
            type: 'video',
            icon: '🎬',
            description: '짧은 마음챙김 명상 - 스트레스 해소용',
            url: 'https://www.youtube.com/watch?v=inpok4MKVLM',
            duration: '5분',
            category: '명상'
        },
        {
            title: '자기 돌봄 아이디어 50가지',
            type: 'pdf',
            icon: '📄',
            description: '번아웃 회복을 위한 다양한 자기 돌봄 활동 목록 (오프라인 지원)',
            url: '/resources/self_care_guide.html',
            category: '회복'
        }
    ],
    [CareType.ANXIETY_TENSION]: [
        {
            title: '4-7-8 호흡법 영상',
            type: 'video',
            icon: '🎬',
            description: '불안 완화를 위한 호흡법 가이드',
            url: 'https://www.youtube.com/watch?v=YRPh_GaiL8s',
            duration: '2분 30초',
            category: '호흡법'
        },
        {
            title: '점진적 근육 이완법',
            type: 'video',
            icon: '🎬',
            description: '전신 근육을 순차적으로 이완하는 기법 영상',
            url: 'https://www.youtube.com/watch?v=ihO02wUzgkc',
            duration: '15분',
            category: '이완'
        },
        {
            title: '불안 일지 템플릿',
            type: 'pdf',
            icon: '📄',
            description: '불안 상황, 생각, 감정을 기록하는 인지행동 워크시트',
            url: '/resources/anxiety_journal.pdf',
            category: '자기관찰'
        },
        {
            title: 'BAI 불안 척도 해석 가이드',
            type: 'pdf',
            icon: '📄',
            description: 'Beck 불안 척도 점수 해석 및 활용법',
            url: '/resources/bai_guide.pdf',
            category: '평가도구'
        },
        {
            title: '그라운딩 기법 카드',
            type: 'image',
            icon: '🖼️',
            description: '5-4-3-2-1 그라운딩 기법 설명 이미지',
            url: '/resources/grounding_card.png',
            category: '이완'
        }
    ],
    [CareType.STRESS_OVERLOAD]: [
        {
            title: '스트레스 관리 워크북',
            type: 'pdf',
            icon: '📄',
            description: '스트레스 원인 분석 및 대처 전략 워크시트',
            url: '/resources/stress_workbook.pdf',
            category: '자기관리'
        },
        {
            title: '운동 루틴 영상 (7분)',
            type: 'video',
            icon: '🎬',
            description: '집에서 할 수 있는 7분 스트레스 해소 운동',
            url: 'https://www.youtube.com/watch?v=mmq5zZfmIws',
            duration: '7분',
            category: '운동'
        },
        {
            title: '감정 일기 앱 - Daylio',
            type: 'app',
            icon: '📱',
            description: '매일 기분과 활동을 기록하는 간편한 감정 일기 앱',
            url: 'https://daylio.net/',
            category: '자기관찰'
        },
        {
            title: '심호흡 가이드 (GIF)',
            type: 'image',
            icon: '🖼️',
            description: '호흡 타이밍을 시각화한 움직이는 이미지',
            url: '/resources/breathing_guide.gif',
            category: '호흡법'
        }
    ],
    [CareType.LOW_ENERGY]: [
        {
            title: '에너지 부스팅 아침 루틴',
            type: 'video',
            icon: '🎬',
            description: '10분 아침 스트레칭 및 활력 운동',
            url: 'https://www.youtube.com/watch?v=4pKly2JojMw',
            duration: '10분',
            category: '운동'
        },
        {
            title: '식사 기록표',
            type: 'pdf',
            icon: '📄',
            description: '일주일 식사 및 간식 기록표',
            url: '/resources/meal_log.pdf',
            category: '영양'
        },
        {
            title: '비타민D 정보 가이드',
            type: 'pdf',
            icon: '📄',
            description: '비타민D 부족 증상과 보충 방법 (오프라인 지원)',
            url: '/resources/vitamin_d_guide.html',
            category: '영양'
        },
        {
            title: '아침 기상 알람 앱 - Alarmy',
            type: 'app',
            icon: '📱',
            description: '확실하게 깨울 수 있는 미션 알람 앱',
            url: 'https://alar.my/',
            category: '생활습관'
        }
    ],
    [CareType.DEPRESSION_AMOTIVATION]: [
        {
            title: 'PHQ-9 우울 척도 해석',
            type: 'pdf',
            icon: '📄',
            description: '우울 척도 점수별 의미와 다음 단계 안내',
            url: '/resources/phq9_guide.pdf',
            category: '평가도구'
        },
        {
            title: '행동 활성화 워크시트',
            type: 'pdf',
            icon: '📄',
            description: '즐거운 활동 목록과 일정 계획표',
            url: '/resources/behavioral_activation.pdf',
            category: '치료기법'
        },
        {
            title: '긍정 확언 오디오',
            type: 'video',
            icon: '🎬',
            description: '자존감 회복을 위한 긍정 확언 오디오',
            url: 'https://www.youtube.com/watch?v=2FV4mLR1A8E',
            duration: '10분',
            category: '정서지원'
        },
        {
            title: '위기 상담 핫라인 목록',
            type: 'pdf',
            icon: '📄',
            description: '전국 정신건강 상담 전화번호 모음',
            url: '/resources/crisis_hotlines.pdf',
            category: '위기지원'
        },
        {
            title: '감사 일기 템플릿',
            type: 'pdf',
            icon: '📄',
            description: '매일 감사한 것 3가지 기록하기',
            url: '/resources/gratitude_journal.pdf',
            category: '정서지원'
        }
    ],
    [CareType.ADRENAL]: [
        {
            title: '부신 피로 자가진단',
            type: 'pdf',
            icon: '📄',
            description: '부신 피로 증상 체크리스트',
            url: '/resources/adrenal_checklist.pdf',
            category: '자가진단'
        },
        {
            title: '항스트레스 식단 가이드',
            type: 'pdf',
            icon: '📄',
            description: '부신 회복을 위한 영양 가이드',
            url: '/resources/adrenal_diet.pdf',
            category: '영양'
        },
        {
            title: '아침 루틴 체크리스트',
            type: 'pdf',
            icon: '📄',
            description: '부신 피로 회복을 위한 아침 루틴',
            url: '/resources/morning_routine.pdf',
            category: '생활습관'
        },
        {
            title: '이완 명상 (20분)',
            type: 'video',
            icon: '🎬',
            description: '부교감신경 활성화를 위한 깊은 이완 명상',
            url: 'https://www.youtube.com/watch?v=O-6f5wQXSu8',
            duration: '20분',
            category: '명상'
        }
    ],
    [CareType.BRAIN_FATIGUE]: [
        {
            title: '뇌 휴식 타이머 앱',
            type: 'app',
            icon: '📱',
            description: '50-10 학습-휴식 사이클 타이머',
            url: 'https://www.forestapp.cc/',
            category: '학습 도구'
        },
        {
            title: '눈 스트레칭 영상',
            type: 'video',
            icon: '🎬',
            description: '눈 피로 해소를 위한 5분 눈 운동',
            url: 'https://www.youtube.com/watch?v=W10J2lv3Ufc',
            duration: '5분',
            category: '휴식'
        },
        {
            title: '디지털 디톡스 가이드',
            type: 'pdf',
            icon: '📄',
            description: '스크린 타임 줄이기 실천 가이드',
            url: '/resources/digital_detox.pdf',
            category: '생활습관'
        },
        {
            title: '목/어깨 스트레칭',
            type: 'video',
            icon: '🎬',
            description: '책상 앞에서 할 수 있는 스트레칭',
            url: 'https://www.youtube.com/watch?v=SedzswEwpPw',
            duration: '8분',
            category: '휴식'
        }
    ],
    [CareType.HYPERSENSITIVE]: [
        {
            title: '감각 과부하 대처 카드',
            type: 'pdf',
            icon: '📄',
            description: '감각 자극이 과할 때 사용하는 대처 카드',
            url: '/resources/sensory_coping.pdf',
            category: '대처전략'
        },
        {
            title: '노이즈 캔슬링 앱',
            type: 'app',
            icon: '📱',
            description: 'Krisp - 주변 소음 차단 앱',
            url: 'https://krisp.ai/',
            category: '환경조절'
        },
        {
            title: '자연 소리 재생기',
            type: 'link',
            icon: '🔗',
            description: '숲, 비, 파도 등 자연 소리',
            url: 'https://www.noisli.com/',
            category: '환경조절'
        },
        {
            title: '혼자 있는 시간의 힘',
            type: 'pdf',
            icon: '📄',
            description: '내향인을 위한 에너지 충전 가이드 (오프라인 지원)',
            url: '/resources/spending_time_alone_guide.html',
            category: '자기이해'
        }
    ],
    [CareType.ATTENTION_DEFICIT]: [
        {
            title: 'ADHD 선별 체크리스트',
            type: 'pdf',
            icon: '📄',
            description: 'ASRS 기반 주의력 자가점검표',
            url: '/resources/adhd_checklist.pdf',
            category: '평가도구'
        },
        {
            title: '포모도로 타이머 (25분)',
            type: 'app',
            icon: '📱',
            description: 'Tomato Timer - 웹 기반 간편 타이머',
            url: 'https://tomato-timer.com/',
            category: '학습 도구'
        },
        {
            title: '집중력 향상 음악',
            type: 'video',
            icon: '🎬',
            description: '학습용 집중력 향상 BGM (2시간)',
            url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
            duration: '2시간',
            category: '학습 도구'
        },
        {
            title: '책상 정리 체크리스트',
            type: 'pdf',
            icon: '📄',
            description: '집중 환경 만들기 위한 책상 정리 가이드',
            url: '/resources/desk_organization.pdf',
            category: '환경조절'
        },
        {
            title: '앱 차단기 - Freedom',
            type: 'app',
            icon: '📱',
            description: '집중을 방해하는 앱과 사이트 차단',
            url: 'https://freedom.to/',
            category: '학습 도구'
        }
    ],
    [CareType.CONCENTRATION]: [
        {
            title: '집중력 음악 (Lo-Fi)',
            type: 'video',
            icon: '🎬',
            description: 'Lo-Fi Hip Hop 24/7 스트리밍',
            url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
            duration: '라이브',
            category: '학습 도구'
        },
        {
            title: '마인드풀 스터디 가이드',
            type: 'pdf',
            icon: '📄',
            description: '마음챙김 기반 집중 학습법',
            url: '/resources/mindful_study.pdf',
            category: '학습법'
        },
        {
            title: 'Forest 앱 - 집중 타이머',
            type: 'app',
            icon: '📱',
            description: '나무를 키우며 집중하는 게이미피케이션 앱',
            url: 'https://www.forestapp.cc/',
            category: '학습 도구'
        },
        {
            title: '딥워크 전략 요약',
            type: 'pdf',
            icon: '📄',
            description: 'Cal Newport의 딥워크 핵심 정리',
            url: '/resources/deep_work_summary.pdf',
            category: '학습법'
        }
    ],
    [CareType.CIRCULATION]: [
        {
            title: '책상 스트레칭 영상',
            type: 'video',
            icon: '🎬',
            description: '5분 앉아서 하는 전신 스트레칭',
            url: 'https://www.youtube.com/watch?v=tAUf7aajBWE',
            duration: '5분',
            category: '운동'
        },
        {
            title: '스탠딩 데스크 가이드',
            type: 'pdf',
            icon: '📄',
            description: '서서 공부하기의 장점과 실전 가이드 (오프라인 지원)',
            url: '/resources/standing_desk_guide.html',
            category: '환경조절'
        },
        {
            title: '수분 섭취 추적 앱',
            type: 'app',
            icon: '📱',
            description: 'Water Reminder - 물 마시기 알림 앱',
            url: 'https://play.google.com/store/apps/details?id=com.northpark.drinkwater',
            category: '건강관리'
        },
        {
            title: '간단 스쿼트 영상',
            type: 'video',
            icon: '🎬',
            description: '쉬는 시간 3분 하체 운동',
            url: 'https://www.youtube.com/watch?v=aclHkVaku9U',
            duration: '3분',
            category: '운동'
        },
        {
            title: '혈액순환 촉진 음식',
            type: 'pdf',
            icon: '📄',
            description: '혈액순환에 좋은 음식 목록 (오프라인 지원)',
            url: '/resources/blood_flow_foods.html',
            category: '영양'
        }
    ]
};

// 📅 주차별 로드맵 데이터 - CareType별 장기 관리 계획
const WEEKLY_PLANS: Record<string, WeeklyPlan> = {
    [CareType.HEALTHY]: {
        totalWeeks: 4,
        goal: '최상의 컨디션 유지 및 학습 효율 극대화',
        weeks: [
            {
                week: 1,
                theme: '기본 루틴 점검',
                tasks: ['현재 학습 루틴 분석', '수면/기상 시간 기록', '하루 집중 시간 측정'],
                milestone: '현재 상태 베이스라인 확립'
            },
            {
                week: 2,
                theme: '루틴 최적화',
                tasks: ['포모도로 기법 적용', '아침 루틴 명확화', '휴식 시간 품질 개선'],
                milestone: '50분 집중 가능'
            },
            {
                week: 3,
                theme: '심화 전략 적용',
                tasks: ['간격 반복 학습 시작', '백지 복습 습관화', '수면 일정 일관성 유지'],
            },
            {
                week: 4,
                theme: '습관 고정화',
                tasks: ['전체 루틴 자동화', '주간 점검 시스템 구축', '목표 재설정'],
                milestone: '자기주도 학습 시스템 완성'
            }
        ]
    },
    [CareType.SLEEP]: {
        totalWeeks: 6,
        goal: '수면의 질 개선 및 적정 수면 시간 확보',
        weeks: [
            {
                week: 1,
                theme: '수면 패턴 파악',
                tasks: ['수면 일기 작성 시작', '취침/기상 시간 기록', '카페인 섭취 기록'],
                milestone: '수면 패턴 베이스라인 확립'
            },
            {
                week: 2,
                theme: '취침 환경 개선',
                tasks: ['침실 조명 조절', '취침 1시간 전 스마트폰 차단', '적정 실내 온도 유지'],
            },
            {
                week: 3,
                theme: '수면 루틴 구축',
                tasks: ['취침 30분 전 이완 루틴', '4-7-8 호흡법 연습', '동일 시간 기상'],
                milestone: '취침 루틴 정착'
            },
            {
                week: 4,
                theme: '수면 시간 조정',
                tasks: ['취침 시간 15분씩 앞당기기', '낮잠 제한 (20분 이내)', '주말 기상 시간 일정'],
            },
            {
                week: 5,
                theme: '수면 방해 요소 제거',
                tasks: ['늦은 저녁 식사 피하기', '침대 = 수면 연상 강화', '수면 환경 최적화'],
            },
            {
                week: 6,
                theme: '습관 고정화',
                tasks: ['수면 효율 90% 이상 달성', '일관된 수면 스케줄 유지', '스마트 알람 활용'],
                milestone: '건강한 수면 패턴 완성'
            }
        ]
    },
    [CareType.BURNOUT]: {
        totalWeeks: 8,
        goal: '완전한 에너지 회복 및 지속 가능한 페이스 찾기',
        weeks: [
            {
                week: 1,
                theme: '완전 휴식',
                tasks: ['학습량 50% 감소', '의무적 휴식 시간 확보', '즐거운 활동 1가지 시작'],
                milestone: '급성 피로 해소'
            },
            {
                week: 2,
                theme: '에너지 충전',
                tasks: ['수면 시간 1시간 증가', '가벼운 산책 시작', '스트레스 일지 작성'],
            },
            {
                week: 3,
                theme: '경계 설정',
                tasks: ['학습 시간 상한선 설정', '"아니요" 말하기 연습', '자기 돌봄 활동 추가'],
            },
            {
                week: 4,
                theme: '점진적 복귀',
                tasks: ['학습량 10% 증가', '우선순위 재정립', '완벽주의 완화'],
                milestone: '안정적 에너지 레벨 도달'
            },
            {
                week: 5,
                theme: '지속 가능한 페이스',
                tasks: ['80% 노력 원칙 적용', '주간 휴식일 고정', '취미 활동 유지'],
            },
            {
                week: 6,
                theme: '스트레스 관리',
                tasks: ['스트레스 신호 인식', '이완 기법 숙달', '지원 시스템 구축'],
            },
            {
                week: 7,
                theme: '균형 회복',
                tasks: ['학습/휴식 균형 점검', '사회적 활동 재개', '성취감 경험'],
            },
            {
                week: 8,
                theme: '새로운 습관 정착',
                tasks: ['지속 가능한 루틴 확립', '재발 방지 전략 수립', '장기 목표 재설정'],
                milestone: '번아웃 회복 완료'
            }
        ]
    },
    [CareType.ANXIETY_TENSION]: {
        totalWeeks: 6,
        goal: '불안 수준 감소 및 이완 능력 향상',
        weeks: [
            {
                week: 1,
                theme: '호흡법 습득',
                tasks: ['4-7-8 호흡법 배우기', '하루 3회 호흡 연습', '불안 일지 시작'],
                milestone: '호흡법 숙달'
            },
            {
                week: 2,
                theme: '이완 기법 확장',
                tasks: ['점진적 근육 이완 연습', '마음챙김 명상 시작', '불안 유발 상황 파악'],
            },
            {
                week: 3,
                theme: '인지 재구조화',
                tasks: ['부정적 생각 기록', '현실적 대안 생각 연습', '걱정 시간 제한'],
                milestone: '인지 왜곡 인식'
            },
            {
                week: 4,
                theme: '노출 연습',
                tasks: ['작은 불안 상황 직면', '성공 경험 기록', '회피 행동 감소'],
            },
            {
                week: 5,
                theme: '대처 전략 강화',
                tasks: ['그라운딩 기법 활용', '긍정적 자기 대화', '지지 체계 활용'],
            },
            {
                week: 6,
                theme: '자신감 회복',
                tasks: ['시험 불안 대처 연습', '불안 관리 도구 상자 완성', '독립적 대처 가능'],
                milestone: 'BAI 점수 50% 감소'
            }
        ]
    },
    [CareType.STRESS_OVERLOAD]: {
        totalWeeks: 6,
        goal: '스트레스 수준 정상화 및 적응력 향상',
        weeks: [
            {
                week: 1,
                theme: '스트레스 인식',
                tasks: ['스트레스 요인 목록화', '신체 반응 관찰', '이완 시간 확보'],
                milestone: '스트레스 원인 파악'
            },
            {
                week: 2,
                theme: '신체 활동 증가',
                tasks: ['매일 20분 운동', '스트레칭 루틴', '야외 활동 시간 확보'],
            },
            {
                week: 3,
                theme: '감정 조절',
                tasks: ['감정 표현 연습', '분노 관리 기법', '긍정적 대처 전략'],
                milestone: '감정 폭발 빈도 50% 감소'
            },
            {
                week: 4,
                theme: '인지적 유연성',
                tasks: ['부정적 생각 전환 연습', '감사 일기 시작', '완벽주의 내려놓기'],
            },
            {
                week: 5,
                theme: '회복력 강화',
                tasks: ['심호흡법 일상화', '거절 연습 (경계 설정)', '지지 체계 강화'],
            },
            {
                week: 6,
                theme: '장기 관리 전략',
                tasks: ['우선순위 재정립', '시간 관리 개선', '균형 잡힌 생활 패턴 정착'],
                milestone: '스트레스 저항력 강화'
            }
        ]
    },
    [CareType.LOW_ENERGY]: {
        totalWeeks: 6,
        goal: '에너지 수준 회복 및 활력 증진',
        weeks: [
            {
                week: 1,
                theme: '기본 점검',
                tasks: ['수면 시간 확보', '식사 규칙성 점검', '필요시 혈액검사'],
                milestone: '에너지 저하 원인 파악'
            },
            {
                week: 2,
                theme: '영양 개선',
                tasks: ['아침 식사 습관화', '철분/비타민D 보충', '수분 섭취 증가'],
            },
            {
                week: 3,
                theme: '활동량 증가',
                tasks: ['아침 햇볕 쬐기', '가벼운 운동 시작', '낮 활동 시간 확대'],
                milestone: '오전 에너지 개선'
            },
            {
                week: 4,
                theme: '신진대사 점화',
                tasks: ['단백질 중심 식단', '고강도 인터벌 운동 시도', '미토콘드리아 영양소'],
            },
            {
                week: 5,
                theme: '지구력 향상',
                tasks: ['유산소 운동 시간 확대', '피로 유발 인자 제거', '안정적 혈당 유지'],
            },
            {
                week: 6,
                theme: '활력 유지',
                tasks: ['규칙적 생활 리듬 정착', '에너지 관리 습관화', '지속 가능한 운동 루틴'],
                milestone: '에너지 레벨 정상화'
            }
        ]
    },
    [CareType.DEPRESSION_AMOTIVATION]: {
        totalWeeks: 8,
        goal: '우울감 완화 및 동기 회복',
        weeks: [
            {
                week: 1,
                theme: '안전망 구축',
                tasks: ['전문가 상담 연계', '위기 연락처 공유', '일상 유지'],
                milestone: '지지 체계 확보'
            },
            {
                week: 2,
                theme: '작은 활동 시작',
                tasks: ['침대 이탈 시간 준수', '매일 5분 외출', '샤워/세면 유지'],
            },
            {
                week: 3,
                theme: '행동 활성화',
                tasks: ['즐거웠던 활동 1가지 재개', '사회적 접촉 1회', '성취감 경험'],
                milestone: '활동 빈도 증가'
            },
            {
                week: 4,
                theme: '루틴 구축',
                tasks: ['규칙적 기상 시간', '식사 시간 고정', '간단한 운동 추가'],
            },
            {
                week: 5,
                theme: '긍정 경험 확대',
                tasks: ['감사 일기 시작', '자기 칭찬 연습', '작은 목표 달성'],
            },
            {
                week: 6,
                theme: '사회적 연결',
                tasks: ['친구/가족 만남', '그룹 활동 참여', '도움 요청 연습'],
                milestone: '사회적 활동 재개'
            },
            {
                week: 7,
                theme: '자기 효능감',
                tasks: ['작은 성공 경험 축적', '문제 해결 연습', '미래 계획 세우기'],
            },
            {
                week: 8,
                theme: '회복 유지',
                tasks: ['재발 징후 인식', '대처 전략 정리', '지속적 자기 관리'],
                milestone: 'PHQ-9 점수 50% 감소'
            }
        ]
    },
    [CareType.ADRENAL]: {
        totalWeeks: 8,
        goal: '부신 기능 회복 및 에너지 균형 달성',
        weeks: [
            {
                week: 1,
                theme: '완전 휴식',
                tasks: ['밤 10시 취침', '카페인 중단', '스트레스 활동 제한'],
                milestone: '수면 패턴 개선 시작'
            },
            {
                week: 2,
                theme: '영양 지원',
                tasks: ['항스트레스 식단 시작', '비타민C/마그네슘 보충', '저혈당 방지 식사'],
            },
            {
                week: 3,
                theme: '스트레스 감소',
                tasks: ['이완 활동 매일', '학습량 조절', '즐거운 활동 추가'],
                milestone: '오전 피로 감소'
            },
            {
                week: 4,
                theme: '점진적 활동',
                tasks: ['가벼운 산책 시작', '요가/스트레칭', '낮 휴식 시간 확보'],
            },
            {
                week: 5,
                theme: '생체 리듬 회복',
                tasks: ['기상 후 햇볕 쬐기', '규칙적 식사 시간', '낮잠 제한'],
            },
            {
                week: 6,
                theme: '에너지 관리',
                tasks: ['활동/휴식 균형', '에너지 저축 전략', '과로 방지'],
                milestone: '안정적 에너지 레벨'
            },
            {
                week: 7,
                theme: '점진적 복귀',
                tasks: ['학습량 점진적 증가', '운동 강도 조절', '사회 활동 재개'],
            },
            {
                week: 8,
                theme: '장기 관리',
                tasks: ['스트레스 관리 습관화', '경고 신호 인식', '지속 가능한 페이스'],
                milestone: '부신 기능 회복'
            }
        ]
    },
    [CareType.BRAIN_FATIGUE]: {
        totalWeeks: 6,
        goal: '뇌 피로 해소 및 인지 기능 회복',
        weeks: [
            {
                week: 1,
                theme: '디지털 디톡스',
                tasks: ['스크린 타임 2시간 제한', 'SNS 알림 차단', '종이책 읽기'],
                milestone: '디지털 자극 감소'
            },
            {
                week: 2,
                theme: '휴식 품질 개선',
                tasks: ['50분 공부-10분 휴식 철저', '멍때리기 연습', '자연 속 시간'],
            },
            {
                week: 3,
                theme: '뇌 회복 활동',
                tasks: ['충분한 수면 (7시간+)', '뇌 혈류 개선 운동', '창의적 활동 시도'],
                milestone: '집중 지속 시간 향상'
            },
            {
                week: 4,
                theme: '인지 부하 최적화',
                tasks: ['싱글 태스킹 훈련', '학습 자료 정리/단권화', '주의력 분산 요인 제거'],
            },
            {
                week: 5,
                theme: '브레인 트레이닝',
                tasks: ['기억력 강화 기법', '암기 루틴 구축', '메타인지 일기 작성'],
            },
            {
                week: 6,
                theme: '지속 가능한 학습',
                tasks: ['적정 학습량 유지', '정기적 뇌 휴식 습관', '최상의 뇌 컨디션 유지'],
                milestone: '브레인 포그 해소 및 집중력 회복'
            }
        ]
    },
    [CareType.HYPERSENSITIVE]: {
        totalWeeks: 6,
        goal: '감각 조절 능력 향상 및 환경 최적화',
        weeks: [
            {
                week: 1,
                theme: '환경 조절',
                tasks: ['조용한 학습 공간 확보', '조명 조절', '소음 차단 도구'],
                milestone: '최적 학습 환경 구축'
            },
            {
                week: 2,
                theme: '자기 조절',
                tasks: ['과부하 신호 인식', '휴식 공간 확보', '혼자 시간 보장'],
            },
            {
                week: 3,
                theme: '감각 탈감작',
                tasks: ['점진적 자극 노출', '이완 기법 적용', '민감도 기록'],
                milestone: '자극 저항성 향상'
            },
            {
                week: 4,
                theme: '에너지 관리',
                tasks: ['사회적 활동 후 충전 시간', '일정 여유 확보', '명확한 경계 설정'],
            },
            {
                week: 5,
                theme: '스트레스 방어',
                tasks: ['심리적 장벽 구축', '긍정적 자기 암시', '대처 카드 활용'],
            },
            {
                week: 6,
                theme: '강점 활용',
                tasks: ['집중력 강점 극대화', '섬세함의 가치 인식', '자기 수용 심화'],
                milestone: '민감성을 탁월한 성과로 전환'
            }
        ]
    },
    [CareType.ATTENTION_DEFICIT]: {
        totalWeeks: 6,
        goal: '집중력 향상 및 과제 완수율 증가',
        weeks: [
            {
                week: 1,
                theme: '환경 정비',
                tasks: ['책상 정리', '스마트폰 분리', '방해 요소 제거'],
                milestone: '집중 환경 조성'
            },
            {
                week: 2,
                theme: '시간 관리',
                tasks: ['포모도로 시작 (15분)', '타이머 사용 습관화', '작은 단위로 과제 분할'],
            },
            {
                week: 3,
                theme: '습관 형성',
                tasks: ['매일 같은 시간 공부', '시작 루틴 만들기', '체크리스트 활용'],
                milestone: '25분 연속 집중 가능'
            },
            {
                week: 4,
                theme: '보상 시스템',
                tasks: ['작은 성취 보상', '진행 상황 시각화', '자기 칭찬'],
            },
            {
                week: 5,
                theme: '과제 관리',
                tasks: ['우선순위 정하기', '마감 전 시작 습관', '부분 완성 인정'],
                milestone: '과제 완료율 70%'
            },
            {
                week: 6,
                theme: '장기 유지',
                tasks: ['자기 모니터링', '전략 조정', '지원 시스템 활용'],
                milestone: '독립적 집중 가능'
            }
        ]
    },
    [CareType.CONCENTRATION]: {
        totalWeeks: 4,
        goal: '심층 집중 능력 향상',
        weeks: [
            {
                week: 1,
                theme: '집중 기반 다지기',
                tasks: ['방해 요소 분석', '최적 시간대 파악', '집중 환경 조성'],
                milestone: '25분 연속 집중'
            },
            {
                week: 2,
                theme: '집중 시간 확장',
                tasks: ['포모도로 30분으로 증가', '휴식 품질 개선', '단일 과제 집중'],
            },
            {
                week: 3,
                theme: '딥워크 훈련',
                tasks: ['50분 집중 도전', '멀티태스킹 금지', '몰입 경험'],
                milestone: '50분 연속 집중'
            },
            {
                week: 4,
                theme: '습관 고정화',
                tasks: ['일일 딥워크 시간 확보', '집중력 유지 전략', '자기 점검 시스템'],
                milestone: '자유자재 집중 조절'
            }
        ]
    },
    [CareType.CIRCULATION]: {
        totalWeeks: 6,
        goal: '혈액순환 개선 및 신체 활력 증진',
        weeks: [
            {
                week: 1,
                theme: '움직임 시작',
                tasks: ['매 시간 일어서기', '간단한 스트레칭', '물 마시기 습관'],
                milestone: '좌식 시간 감소'
            },
            {
                week: 2,
                theme: '순환 루틴',
                tasks: ['매일 20분 걷기', '하체 운동 추가', '스탠딩 학습 시도'],
            },
            {
                week: 3,
                theme: '순환 촉진',
                tasks: ['따뜻한 물 마시기', '혈액순환 강화 음식', '족욕/반신욕 시도'],
                milestone: '손발 온도 상승 및 부종 감소'
            },
            {
                week: 4,
                theme: '심폐 기능 강화',
                tasks: ['숨찬 운동 주 3회', '깊은 흉곽 호흡', '계단 오르기'],
            },
            {
                week: 5,
                theme: '자세 정렬',
                tasks: ['거북목 교정 운동', '골반 정렬 스트레칭', '바른 자세 학습'],
            },
            {
                week: 6,
                theme: '활력 유지',
                tasks: ['규칙적 운동 습관 정착', '전신 순환 루틴 유지', '활동적 생활 양식'],
                milestone: '전신 활력 및 뇌 명료도 향상'
            }
        ]
    },
};

// 💬 FAQ / 예상 반박 데이터 - 학생들의 흔한 변명과 대응 멘트
const COMMON_OBJECTIONS: Record<string, CommonObjection[]> = {
    [CareType.HEALTHY]: [
        {
            category: '시간',
            icon: '⏰',
            objection: '"시간이 없어요"',
            response: '딱 3분이면 됩니다. 양치하는 시간에 호흡법 할 수 있어요. 시간이 없는 게 아니라 우선순위의 문제예요.',
            tip: '가장 작은 단위부터 시작하게 하세요.'
        },
        {
            category: '의지',
            icon: '😓',
            objection: '"의지력이 약해서요"',
            response: '의지력이 아니라 환경 설계의 문제입니다. 폰을 다른 방에 두면 의지력 없이도 집중할 수 있어요.',
            tip: '환경 변화로 해결할 수 있는 대안을 제시하세요.'
        },
        {
            category: '효과',
            icon: '🤔',
            objection: '"이거 해도 소용없을 것 같아요"',
            response: '일주일만 해보고 판단해요. 과학적으로 증명된 방법이에요. 안 되면 다른 방법 찾으면 되고요.',
            tip: '작은 실험 개념으로 접근하게 하세요.'
        },
        {
            category: '환경',
            icon: '🏠',
            objection: '"집이 시끄러워서요"',
            response: '노이즈 캔슬링 이어폰이나 도서관 활용해 봐요. 완벽한 환경을 기다리면 평생 못 해요.',
            tip: '환경을 바꿀 수 없다면 대안을 찾게 하세요.'
        },
        {
            category: '비교',
            icon: '👥',
            objection: '"친구들은 안 해도 잘하던데요"',
            response: '남들과 비교하지 마세요. 중요한 건 어제의 나보다 오늘의 내가 나아지는 거예요.',
            tip: '자기 성장에 집중하도록 유도하세요.'
        }
    ],
    [CareType.SLEEP]: [
        {
            category: '시간',
            icon: '⏰',
            objection: '"밤에 공부해야 해서요"',
            response: '밤샘 공부는 뇌 효율이 50% 이하예요. 같은 시간을 자고 아침에 하면 2배 효율이에요.',
            tip: '수면의 학습 효율 연구 결과를 공유하세요.'
        },
        {
            category: '습관',
            icon: '😴',
            objection: '"원래 올빼미형이에요"',
            response: '올빼미형은 대부분 만들어진 거예요. 3주만 일찍 자면 뇌가 적응합니다.',
            tip: '점진적으로 15분씩 앞당기게 하세요.'
        },
        {
            category: '핑계',
            icon: '📱',
            objection: '"폰 보다가 잠드는 게 편해요"',
            response: '블루라이트가 뇌를 깨워서 수면 질이 떨어져요. 책 읽기로 바꿔 보세요.',
            tip: '대체 활동을 구체적으로 제안하세요.'
        },
        {
            category: '효과',
            icon: '🤷',
            objection: '"어차피 잠이 안 와요"',
            response: '4-7-8 호흡법 3번이면 됩니다. 뇌과학적으로 부교감신경이 활성화돼요.',
            tip: '호흡법을 직접 시연해 보세요.'
        },
        {
            category: '저항',
            icon: '🙄',
            objection: '"주말에 몰아서 자면 되잖아요"',
            response: '수면 빚은 이자가 붙어요. 주말에 몰아서 자면 월요일 더 힘들어져요.',
            tip: '수면 빚 개념을 설명하세요.'
        }
    ],
    [CareType.BURNOUT]: [
        {
            category: '책임감',
            icon: '📚',
            objection: '"쉬면 뒤처져요"',
            response: '지금 쉬지 않으면 나중에 더 오래 쉬어야 해요. 전략적 휴식이에요.',
            tip: '휴식의 투자 수익률 개념을 설명하세요.'
        },
        {
            category: '죄책감',
            icon: '😣',
            objection: '"쉬면 죄책감 들어요"',
            response: '휴식도 실력이에요. 프로 운동선수도 쉬는 날이 있어요.',
            tip: '휴식을 훈련의 일부로 재정의하세요.'
        },
        {
            category: '부모',
            icon: '👨‍👩‍👧',
            objection: '"부모님이 공부 안 한다고 뭐라 하세요"',
            response: '부모님께는 제가 상태를 말씀드릴게요. 대신 약속한 시간만큼은 확실히 쉬고, 공부할 때 몰입합시다.',
            tip: '학원/관리자 중재 역할을 강조하세요.'
        },
        {
            category: '무기력',
            icon: '😶',
            objection: '"하고 싶은 게 아무것도 없어요"',
            response: '번아웃 상태에서는 당연한 반응이에요. 1%만 회복돼도 의욕이 생겨요. 아주 작은 것부터 합시다.',
            tip: '무기력을 상태 탓으로 돌려 죄책감을 줄여주세요.'
        },
        {
            category: '회피',
            icon: '🏃',
            objection: '"그냥 다 그만두고 싶어요"',
            response: '일단 3일만 쉬어보고 결정해요. 중대한 결정은 상태가 좋을 때 하는 거예요.',
            tip: '결정을 유보하게 하고 단기 휴식을 제안하세요.'
        },
        {
            category: '시험',
            icon: '📝',
            objection: '"시험이 코앞이에요"',
            response: '번아웃 상태로 시험 보는 것보다 하루 쉬고 보는 게 점수가 높아요.',
            tip: '시험 직전 휴식의 효과를 설명하세요.'
        },
        {
            category: '비교',
            icon: '🏆',
            objection: '"다들 힘들어도 해요"',
            response: '남들도 힘들다고 내가 쓰러져야 하는 건 아니에요. 내 몸은 내가 챙겨야 해요.',
            tip: '자기 돌봄의 중요성을 강조하세요.'
        }
    ],
    [CareType.ANXIETY_TENSION]: [
        {
            category: '효과',
            icon: '🧘',
            objection: '"호흡법으로 뭐가 달라져요?"',
            response: '호흡은 직접 신경계를 조절할 수 있는 유일한 방법이에요. 과학적으로 입증됐어요.',
            tip: '즉석에서 호흡법을 함께 해보세요.'
        },
        {
            category: '성격',
            icon: '😰',
            objection: '"원래 걱정이 많은 성격이에요"',
            response: '불안은 성격이 아니라 기술이에요. 배울 수 있어요. 같이 연습해 봐요.',
            tip: '불안을 관리 가능한 것으로 재정의하세요.'
        },
        {
            category: '통제',
            icon: '🌀',
            objection: '"생각을 멈출 수가 없어요"',
            response: '멈추려 하지 말고 관찰해 보세요. 생각은 구름처럼 지나가게 두면 돼요.',
            tip: '마음챙김 관점을 소개하세요.'
        },
        {
            category: '회피',
            icon: '🏃',
            objection: '"불안한 상황을 피하면 되잖아요"',
            response: '피하면 할수록 더 무서워져요. 조금씩 노출하면 뇌가 익숙해져요.',
            tip: '노출 치료의 원리를 설명하세요.'
        },
        {
            category: '시험',
            icon: '📋',
            objection: '"시험만 보면 머리가 하얘져요"',
            response: '시험 전 5분 그라운딩으로 뇌를 안정시켜요. 연습하면 자동화돼요.',
            tip: '시험 당일 루틴을 만들어 주세요.'
        }
    ],
    [CareType.STRESS_OVERLOAD]: [
        {
            category: '시간',
            icon: '⏰',
            objection: '"운동할 시간이 없어요"',
            response: '7분이면 충분해요. 유튜브에 7분 운동 검색하면 돼요.',
            tip: '초단시간 운동 루틴을 안내하세요.'
        },
        {
            category: '발산',
            icon: '😤',
            objection: '"스트레스 받으면 게임해야 풀려요"',
            response: '게임은 뇌를 더 흥분시켜요. 10분 걷기가 실제 스트레스 호르몬을 낮춰요.',
            tip: '건강한 스트레스 발산법을 제안하세요.'
        },
        {
            category: '무력감',
            icon: '😔',
            objection: '"뭘 해도 스트레스가 줄지 않아요"',
            response: '원인을 찾아서 하나씩 해결해 봐요. 안 되는 건 내려놓는 연습도 필요해요.',
            tip: '통제 가능/불가능을 구분하게 하세요.'
        },
        {
            category: '감정',
            icon: '😠',
            objection: '"화가 나면 참을 수가 없어요"',
            response: '화가 날 때 10초 세기를 해보세요. 뇌가 판단력을 되찾아요.',
            tip: '분노 관리 기법을 연습시키세요.'
        }
    ],
    [CareType.LOW_ENERGY]: [
        {
            category: '증상',
            icon: '🥱',
            objection: '"피곤한 게 당연한 거 아니에요?"',
            response: '아니요, 청소년은 에너지가 넘쳐야 정상이에요. 뭔가 원인이 있어요.',
            tip: '신체적 원인 점검을 권유하세요.'
        },
        {
            category: '수면',
            icon: '😴',
            objection: '"많이 자도 피곤해요"',
            response: '수면의 질이 문제일 수 있어요. 수면 일기 한 번 써볼래요?',
            tip: '수면 패턴 분석을 시작하세요.'
        },
        {
            category: '노력',
            icon: '😒',
            objection: '"움직이기 싫어요"',
            response: '5분만 걸어보세요. 움직이면 오히려 에너지가 생겨요.',
            tip: '역설적 효과를 설명하세요.'
        },
        {
            category: '식사',
            icon: '🍽️',
            objection: '"아침 먹을 시간 없어요"',
            response: '바나나 하나면 2분이에요. 뇌 연료 없이는 공부가 안 돼요.',
            tip: '간편한 아침 옵션을 제안하세요.'
        }
    ],
    [CareType.DEPRESSION_AMOTIVATION]: [
        {
            category: '무기력',
            icon: '😶',
            objection: '"아무것도 하기 싫어요"',
            response: '하기 싫어도 딱 1분만 해보세요. 시작하면 뇌가 움직이기 시작해요.',
            tip: '아주 작은 행동부터 시작하게 하세요.'
        },
        {
            category: '의미',
            icon: '❓',
            objection: '"해봤자 뭐해요"',
            response: '지금 힘든 건 뇌의 일시적 상태예요. 작은 성공 경험이 쌓이면 달라져요.',
            tip: '희망적 메시지를 전달하세요.'
        },
        {
            category: '사회',
            icon: '🚪',
            objection: '"사람 만나기 싫어요"',
            response: '5분만 밖에 나갔다 와보세요. 햇볕이 세로토닌을 만들어요.',
            tip: '사회적 접촉의 최소 단위를 제안하세요.'
        },
        {
            category: '수면',
            icon: '🛌',
            objection: '"계속 자고 싶어요"',
            response: '많이 자도 피로가 안 풀리죠? 가벼운 활동이 오히려 에너지를 줘요.',
            tip: '과수면의 역효과를 설명하세요.'
        },
        {
            category: '도움',
            icon: '🤝',
            objection: '"상담 받아도 달라지지 않아요"',
            response: '혼자 이겨내려 하지 마세요. 전문가의 도움은 지름길이에요.',
            tip: '전문 상담 연계를 고려하세요.'
        }
    ],
    [CareType.ADRENAL]: [
        {
            category: '피로',
            icon: '😫',
            objection: '"아침에 일어나는 게 죽을 것 같아요"',
            response: '부신 호르몬(코르티솔)이 아침에 안 나와서 그래요. 소금물 한 잔 마시면 한결 나아요.',
            tip: '생물학적 원인을 설명하고 즉각적인 팁을 주세요.'
        },
        {
            category: '카페인',
            icon: '☕',
            objection: '"커피 없으면 눈이 안 떠져요"',
            response: '커피는 미래의 에너지를 빌려 쓰는 거예요. 지금 끊어야 부신이 회복돼요.',
            tip: '카페인의 악순환을 경고하세요.'
        },
        {
            category: '식단',
            icon: '🍭',
            objection: '"단 게 자꾸 당겨요"',
            response: '혈당이 떨어져서 그래요. 사탕 대신 견과류나 단백질 바를 드세요.',
            tip: '혈당 스파이크의 위험을 인지시키세요.'
        },
        {
            category: '수면',
            icon: '🦉',
            objection: '"밤 11시 이후에 오히려 정신이 나요"',
            response: '부신피로 2단계의 특징이에요. 그때 자야 뇌와 부신이 재생돼요.',
            tip: '세컨드 윈드(Second Wind) 현상을 설명해 주세요.'
        },
        {
            category: '휴식',
            icon: '😴',
            objection: '"쉬면 불안해요"',
            response: '그 불안감이 바로 부신 피로 증상이에요. 쉬어야 회복돼요. 휴식도 영양소입니다.',
            tip: '증상 자체가 회복 필요성의 증거임을 설명하세요.'
        }
    ],
    [CareType.BRAIN_FATIGUE]: [
        {
            category: '휴식',
            icon: '📱',
            objection: '"쉬는 시간에 폰 봐야 해요"',
            response: '폰 보는 건 뇌가 쉬는 게 아니에요. 10분 멍 때리기가 진짜 휴식이에요.',
            tip: '뇌 휴식의 정의를 설명하세요.'
        },
        {
            category: '시간',
            icon: '⏰',
            objection: '"50분은 너무 짧아요"',
            response: '50분이 뇌의 집중력 한계예요. 그 이상은 효율이 급격히 떨어져요.',
            tip: '뇌과학 연구 결과를 공유하세요.'
        },
        {
            category: '습관',
            icon: '💻',
            objection: '"컴퓨터로 다 해야 해요"',
            response: '1시간마다 5분씩 눈 쉬게 해주세요. 눈 피로가 뇌 피로로 이어져요.',
            tip: '디지털 휴식 시간을 정하게 하세요.'
        }
    ],
    [CareType.ATTENTION_DEFICIT]: [
        {
            category: '집중',
            icon: '🧠',
            objection: '"원래 집중을 못해요"',
            response: '집중력은 근육처럼 훈련할 수 있어요. 5분부터 시작해 봐요.',
            tip: '점진적 집중 시간 확장을 안내하세요.'
        },
        {
            category: '환경',
            icon: '📚',
            objection: '"책상 정리가 귀찮아요"',
            response: '깨끗한 책상이 집중력 20% 올려줘요. 1분이면 돼요.',
            tip: '정리의 효과를 구체적 수치로 제시하세요.'
        },
        {
            category: '도구',
            icon: '⏱️',
            objection: '"타이머 쓰는 게 귀찮아요"',
            response: '타이머가 의지력을 대신해요. 뇌가 마감을 인식하면 집중해요.',
            tip: '타이머 앱 사용을 권장하세요.'
        },
        {
            category: '멀티태스킹',
            icon: '🔄',
            objection: '"여러 개 같이 해야 효율적이에요"',
            response: '멀티태스킹은 효율이 40% 떨어져요. 한 번에 하나만 하세요.',
            tip: '싱글태스킹의 효과를 설명하세요.'
        }
    ],
    [CareType.CONCENTRATION]: [
        {
            category: '방해',
            icon: '📱',
            objection: '"알림 오면 봐야 해요"',
            response: '공부 시간에는 비행기 모드로 하세요. 급한 건 없어요.',
            tip: '디지털 방해 차단 전략을 제안하세요.'
        },
        {
            category: '지루함',
            icon: '😩',
            objection: '"공부가 지루해요"',
            response: '25분만 하고 쉬면 지루할 틈이 없어요. 포모도로 해보세요.',
            tip: '시간 분할 학습의 장점을 설명하세요.'
        },
        {
            category: '환경',
            icon: '🎧',
            objection: '"음악 들으면서 해야 돼요"',
            response: '가사 있는 음악은 집중력을 뺏어요. 백색소음이나 클래식으로 바꿔 보세요.',
            tip: '집중에 도움 되는 음악을 추천하세요.'
        }
    ],
    [CareType.HYPERSENSITIVE]: [
        {
            category: '환경',
            icon: '🔊',
            objection: '"조용한 곳이 없어요"',
            response: '노이즈 캔슬링 이어폰이 게임 체인저예요. 투자 가치 있어요.',
            tip: '환경 조절 도구를 추천하세요.'
        },
        {
            category: '사회',
            icon: '👥',
            objection: '"사람 많은 데 가면 지쳐요"',
            response: '그게 정상이에요. 혼자 충전하는 시간을 미리 확보하세요.',
            tip: '에너지 관리 전략을 세우게 하세요.'
        },
        {
            category: '감정',
            icon: '😢',
            objection: '"감정 조절이 안 돼요"',
            response: '민감한 건 장점이에요. 감정을 인식하고 이름 붙이는 연습부터 해요.',
            tip: '감정 라벨링 기법을 가르치세요.'
        }
    ],
    [CareType.CIRCULATION]: [
        {
            category: '자세',
            icon: '🪑',
            objection: '"앉아 있는 게 편해요"',
            response: '오래 앉으면 뇌로 가는 피가 줄어요. 1시간마다 일어나야 해요.',
            tip: '정기적 기립의 중요성을 설명하세요.'
        },
        {
            category: '운동',
            icon: '🏃',
            objection: '"운동 싫어요"',
            response: '운동 아니어도 돼요. 그냥 걷기만 해도 뇌 혈류가 20% 늘어요.',
            tip: '걷기부터 시작하게 하세요.'
        },
        {
            category: '물',
            icon: '💧',
            objection: '"물 마시기 귀찮아요"',
            response: '탈수되면 집중력이 25% 떨어져요. 물병 책상에 두세요.',
            tip: '시각적 리마인더를 제안하세요.'
        }
    ]
};

export const ExpertOverlay: React.FC<ExpertOverlayProps> = ({
    careType = CareType.HEALTHY,
    adrenalFatigueScore = 0,
    currentData,
    studentId,
    score = 0, // score 기본값 0
    aiModels,
    isOpen = false,
    onClose
}) => {
    const [panelWidth, setPanelWidth] = useState(700); // 동적 너비 조절
    const [isResizing, setIsResizing] = useState(false);
    const [activeTab, setActiveTab] = useState<'prestudy' | 'learning' | 'exercise' | 'redflags' | 'parentscripts' | 'kpi' | 'resources' | 'roadmap' | 'faq' | 'prediction' | 'history'>('prestudy');
    const [expandedItem, setExpandedItem] = useState<number | null>(null);
    // Guide mode: 'original' shows the primary careType, 'adrenal' shows Adrenal Recovery
    const [guideMode, setGuideMode] = useState<'original' | 'adrenal'>('original');
    // Copy success message state
    const [copySuccess, setCopySuccess] = useState<string | null>(null);
    // Prediction data
    const [predictionData, setPredictionData] = useState<PredictionResult | null>(null);
    const [isLoadingPrediction, setIsLoadingPrediction] = useState(false);

    // Consultation Save State
    const [showConsultationModal, setShowConsultationModal] = useState(false);
    const [consultationNotes, setConsultationNotes] = useState('');
    const [studentResponse, setStudentResponse] = useState('');
    const [showConsultationHistory, setShowConsultationHistory] = useState(false);

    // Resource Modals State
    const [showSelfCheck, setShowSelfCheck] = useState(false);
    const [showRoutineTracker, setShowRoutineTracker] = useState(false);
    const [showWorksheet, setShowWorksheet] = useState(false);
    const [selectedResourceType, setSelectedResourceType] = useState<CareType | null>(null);

    // Determine if dual-mode is needed (adrenal >= 26 AND careType is not already ADRENAL)
    const showDualMode = adrenalFatigueScore >= 26 && careType !== CareType.ADRENAL;

    // Load prediction data when switching to prediction tab
    useEffect(() => {
        if (activeTab === 'prediction' && currentData) {
            setIsLoadingPrediction(true);

            // Load history from database - using the db method directly
            (async () => {
                try {
                    // Get recent history (last 100 records)
                    const recentHistory = await db.history.orderBy('date').reverse().limit(100).toArray();

                    // Filter history for current student if studentId is provided
                    const relevantHistory = studentId
                        ? recentHistory.filter(h => h.student.name === currentData?.student.name)
                        : recentHistory;

                    // Generate prediction
                    const prediction = generatePrediction(currentData, relevantHistory);
                    setPredictionData(prediction);
                } catch (err) {
                    console.error('Failed to load prediction data:', err);
                    setPredictionData(null);
                } finally {
                    setIsLoadingPrediction(false);
                }
            })();
        }
    }, [activeTab, currentData, studentId]);

    // Multi-select strategy print state
    const [selectedStrategies, setSelectedStrategies] = useState<{
        prestudy: number[];
        learning: number[];
        exercise: number[];
    }>({
        prestudy: [],
        learning: [],
        exercise: []
    });

    // Select content based on guideMode
    const effectiveCareType = (showDualMode && guideMode === 'adrenal') ? CareType.ADRENAL : careType;
    const content = EXPERT_CONTENTS[effectiveCareType] || EXPERT_CONTENTS[CareType.HEALTHY];

    useEffect(() => {
        if (currentData && currentData.completedExpertGuideItems && currentData.completedExpertGuideItems.length > 0) {
            const newSelected: { prestudy: number[], learning: number[], exercise: number[] } = { prestudy: [], learning: [], exercise: [] };
            (['prestudy', 'learning', 'exercise'] as const).forEach(tab => {
                if (content[tab] && content[tab].guides) {
                    content[tab].guides.forEach((g: any, idx: number) => {
                        if (currentData.completedExpertGuideItems!.includes(g.title)) {
                            newSelected[tab].push(idx);
                        }
                    });
                }
            });
            setSelectedStrategies(newSelected);
        }
    }, [currentData, content]);

    // Toggle strategy selection
    const toggleStrategySelection = (tab: 'prestudy' | 'learning' | 'exercise', index: number) => {
        setSelectedStrategies(prev => {
            const isSelected = prev[tab].includes(index);
            const newList = isSelected
                ? prev[tab].filter(i => i !== index)
                : [...prev[tab], index];
            
            // Sync with currentData for history saving
            if (currentData) {
                const itemTitle = content[tab].guides[index]?.title;
                if (itemTitle) {
                    const currentItems = currentData.completedExpertGuideItems || [];
                    if (isSelected) {
                        currentData.completedExpertGuideItems = currentItems.filter(t => t !== itemTitle);
                    } else {
                        currentData.completedExpertGuideItems = [...currentItems, itemTitle];
                    }
                }
            }

            return { ...prev, [tab]: newList };
        });
    };

    // Calculate total selected count
    const totalSelected = selectedStrategies.prestudy.length +
        selectedStrategies.learning.length +
        selectedStrategies.exercise.length;


    // Get Red Flags for current careType
    const currentRedFlags = RED_FLAGS[effectiveCareType] || RED_FLAGS[CareType.HEALTHY] || [];

    // Get Parent Scripts for current careType
    const currentParentScripts = PARENT_SCRIPTS[effectiveCareType] || PARENT_SCRIPTS[CareType.HEALTHY] || [];

    // Get Success Indicators (KPI) for current careType
    const currentSuccessIndicators = SUCCESS_INDICATORS[effectiveCareType] || SUCCESS_INDICATORS[CareType.HEALTHY] || [];

    // Get Resources for current careType
    const currentResources = RESOURCES[effectiveCareType] || RESOURCES[CareType.HEALTHY] || [];

    // Get Weekly Plan for current careType
    const currentWeeklyPlan = WEEKLY_PLANS[effectiveCareType] || WEEKLY_PLANS[CareType.HEALTHY];

    // Get Common Objections for current careType
    const currentObjections = COMMON_OBJECTIONS[effectiveCareType] || COMMON_OBJECTIONS[CareType.HEALTHY] || [];

    // Difficulty filter state
    const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
    const [sortByDifficulty, setSortByDifficulty] = useState(false);

    // Resize handler for panel width
    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing) return;
            const newWidth = window.innerWidth - e.clientX;
            setPanelWidth(Math.max(400, Math.min(1200, newWidth))); // 400px ~ 1200px 범위
        };

        const handleMouseUp = () => {
            setIsResizing(false);
        };

        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing]);

    const toggleExpand = (idx: number) => {
        setExpandedItem(expandedItem === idx ? null : idx);
    };

    // Get difficulty display text and color
    const getDifficultyDisplay = (difficulty?: 'easy' | 'medium' | 'hard') => {
        switch (difficulty) {
            case 'easy': return { text: '쉬움', color: 'bg-green-100 text-green-700 border-green-200', emoji: '🟢' };
            case 'medium': return { text: '보통', color: 'bg-amber-100 text-amber-700 border-amber-200', emoji: '🟡' };
            case 'hard': return { text: '어려움', color: 'bg-red-100 text-red-700 border-red-200', emoji: '🔴' };
            default: return { text: '미정', color: 'bg-slate-100 text-slate-500 border-slate-200', emoji: '⚪' };
        }
    };

    // Filter and sort guides by difficulty
    const getFilteredGuides = (guides: GuideItem[]) => {
        let filtered = [...guides];

        // Apply filter
        if (difficultyFilter !== 'all') {
            filtered = filtered.filter(g => g.difficulty === difficultyFilter);
        }

        // Apply sort (easy → medium → hard)
        if (sortByDifficulty) {
            const order = { 'easy': 0, 'medium': 1, 'hard': 2, undefined: 3 };
            filtered.sort((a, b) => (order[a.difficulty as keyof typeof order] ?? 3) - (order[b.difficulty as keyof typeof order] ?? 3));
        }

        return filtered;
    };

    // Copy to clipboard function
    const copyToClipboard = async (text: string, label: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopySuccess(label);
            setTimeout(() => setCopySuccess(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    // Print checklist function
    const printChecklist = () => {
        const careTypeName = {
            [CareType.HEALTHY]: '학습 밸런스',
            [CareType.SLEEP]: '수면 케어',
            [CareType.BURNOUT]: '번아웃 회복',
            [CareType.ANXIETY_TENSION]: '불안 완화',
            [CareType.STRESS_OVERLOAD]: '스트레스 해소',
            [CareType.LOW_ENERGY]: '무기력 극복',
            [CareType.DEPRESSION_AMOTIVATION]: '우울 회복',
            [CareType.ADRENAL]: '부신 회복',
            [CareType.BRAIN_FATIGUE]: '뇌 피로 회복',
            [CareType.HYPERSENSITIVE]: '과민감 컨트롤',
            [CareType.ATTENTION_DEFICIT]: '주의력 강화',
            [CareType.CONCENTRATION]: '집중력 강화',
            [CareType.CIRCULATION]: '혈류 순환'
        }[effectiveCareType] || '맞춤 케어';

        const today = new Date().toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const selectedPrestudy = selectedStrategies.prestudy || [];
        const selectedLearning = selectedStrategies.learning || [];
        const selectedExercise = selectedStrategies.exercise || [];

        const easyTasks = (currentWeeklyPlan as any)?.weeks?.[0]?.tasks?.easy || [];
        const weeklyTasks = (currentWeeklyPlan as any)?.weeks?.[0]?.tasks?.core || [];
        const priorityKPIs = (currentSuccessIndicators as any[])?.slice(0, 3).map(kpi => kpi.title) || [];

        const printContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>학습 케어 체크리스트</title>
    <style>
        @page { margin: 1.5cm; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif; 
            font-size: 12pt;
            line-height: 1.6;
            color: #1a1a1a;
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #4F46E5;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }
        .header h1 {
            font-size: 22pt;
            color: #4F46E5;
            margin-bottom: 5px;
        }
        .header .subtitle {
            font-size: 14pt;
            color: #666;
        }
        .header .date {
            font-size: 10pt;
            color: #999;
            margin-top: 10px;
        }
        .section {
            margin-bottom: 25px;
            page-break-inside: avoid;
        }
        .section-title {
            font-size: 14pt;
            font-weight: bold;
            color: #4F46E5;
            border-left: 4px solid #4F46E5;
            padding-left: 10px;
            margin-bottom: 12px;
        }
        .checklist {
            list-style: none;
        }
        .checklist li {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            margin-bottom: 10px;
            padding: 8px 12px;
            background: #F8F9FA;
            border-radius: 6px;
        }
        .checkbox {
            width: 18px;
            height: 18px;
            border: 2px solid #4F46E5;
            border-radius: 4px;
            flex-shrink: 0;
            margin-top: 2px;
        }
        .task-text {
            flex: 1;
        }
        .goal-box {
            background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
            color: white;
            padding: 15px;
            border-radius: 10px;
            text-align: center;
            margin-bottom: 20px;
        }
        .goal-box .label {
            font-size: 10pt;
            opacity: 0.9;
        }
        .goal-box .goal {
            font-size: 14pt;
            font-weight: bold;
            margin-top: 5px;
        }
        .note-box {
            border: 2px dashed #DDD;
            padding: 15px;
            border-radius: 8px;
            min-height: 80px;
        }
        .note-box .label {
            font-size: 10pt;
            color: #666;
            margin-bottom: 10px;
        }
        .footer {
            text-align: center;
            font-size: 9pt;
            color: #999;
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #DDD;
        }
        .two-columns {
            display: flex;
            gap: 20px;
        }
        .two-columns > div {
            flex: 1;
        }
        @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>📋 ${careTypeName} 체크리스트</h1>
        <div class="subtitle">이번 주 실천 과제</div>
        <div class="date">작성일: ${today}</div>
    </div>

    <div class="goal-box">
        <div class="label">🎯 이번 주 목표</div>
        <div class="goal">${currentWeeklyPlan?.weeks[0]?.theme || '건강한 학습 습관 만들기'}</div>
    </div>

    <div class="two-columns">
        <div class="section">
            <div class="section-title">📚 학습 전략</div>
            <ul class="checklist">
                ${easyTasks.length > 0
                ? easyTasks.map(task => `
                        <li>
                            <div class="checkbox"></div>
                            <span class="task-text">${task}</span>
                        </li>
                    `).join('')
                : '<li><div class="checkbox"></div><span class="task-text">오늘의 목표 세우기</span></li>'
            }
            </ul>
        </div>

        <div class="section">
            <div class="section-title">✅ 일일 과제</div>
            <ul class="checklist">
                ${weeklyTasks.map(task => `
                    <li>
                        <div class="checkbox"></div>
                        <span class="task-text">${task}</span>
                    </li>
                `).join('')}
            </ul>
        </div>
    </div>

    ${priorityKPIs.length > 0 ? `
    <div class="section">
        <div class="section-title">📊 성공 지표</div>
        <ul class="checklist">
            ${priorityKPIs.map(kpi => `
                <li>
                    <div class="checkbox"></div>
                    <span class="task-text">${kpi}</span>
                </li>
            `).join('')}
        </ul>
    </div>
    ` : ''}

    <div class="section">
        <div class="section-title">📝 메모 / 다음 상담 시 확인 사항</div>
        <div class="note-box">
            <div class="label">여기에 메모하세요:</div>
        </div>
    </div>

    <div class="footer">
        Mind-Body Connect 학습 케어 시스템 | 다음 상담 때 이 체크리스트를 가져오세요!
    </div>
</body>
</html>
        `;

        const printWindow = window.open('', '_blank', 'width=800,height=600');
        if (printWindow) {
            printWindow.document.write(printContent);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => {
                printWindow.print();
            }, 250);
        }
    };



    // Print selected strategies function (Report-style format)
    const printSelectedStrategies = () => {
        const careTypeName = {
            [CareType.HEALTHY]: '학습 밸런스',
            [CareType.SLEEP]: '수면 케어',
            [CareType.BURNOUT]: '번아웃 회복',
            [CareType.ANXIETY_TENSION]: '불안 완화',
            [CareType.STRESS_OVERLOAD]: '스트레스 해소',
            [CareType.LOW_ENERGY]: '무기력 극복',
            [CareType.DEPRESSION_AMOTIVATION]: '우울 회복',
            [CareType.ADRENAL]: '부신 회복',
            [CareType.BRAIN_FATIGUE]: '뇌 피로 회복',
            [CareType.HYPERSENSITIVE]: '과민감 컨트롤',
            [CareType.ATTENTION_DEFICIT]: '주의력 강화',
            [CareType.CONCENTRATION]: '집중력 강화',
            [CareType.CIRCULATION]: '혈류 순환'
        }[effectiveCareType] || '맞춤 케어';

        const today = new Date().toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Collect selected strategies by section
        const sections = [
            {
                key: 'prestudy',
                title: '⚡ 시작전 루틴',
                indices: selectedStrategies.prestudy,
                guides: content.prestudy.guides
            },
            {
                key: 'learning',
                title: '🧠 학습 중 전략 (Study Strategy)',
                indices: selectedStrategies.learning,
                guides: content.learning.guides
            },
            {
                key: 'exercise',
                title: '🏃 신체 활동 가이드 (Exercise Guide)',
                indices: selectedStrategies.exercise,
                guides: content.exercise.guides
            }
        ];

        // Generate HTML for sections
        const headerHTML = `
            <div class="page-header">
                <div class="flex flex-col md:flex-row justify-between items-start border-b-2 border-slate-200 pb-4 mb-6">
                    <div>
                        <div class="text-blue-700 font-bold text-xs tracking-widest uppercase">Neuro-Bio Academic Strategy System</div>
                        <h1 class="text-3xl font-black text-slate-800">전문가 가이드</h1>
                        <p class="text-slate-500 text-sm italic">선택한 학습 전략 - ${careTypeName}</p>
                    </div>
                    <div class="mt-2 md:mt-0 text-right">
                        <div class="inline-block bg-slate-100 px-3 py-1 rounded text-xs font-mono text-slate-600 mb-1">${careTypeName}</div>
                        <div class="text-xs font-medium text-slate-600">작성일: ${today}</div>
                    </div>
                </div>
            </div>
        `;

        let sectionsHTML = '';
        let strategyCount = 0;

        sections.filter(section => section.indices.length > 0).forEach((section, sectionIdx) => {
            // Add page break and header only between sections (not each strategy)
            if (sectionIdx > 0) {
                sectionsHTML += `
                    <div class="page-break"></div>
                    ${headerHTML}
                `;
            }

            section.indices.forEach((idx, strategyNum) => {
                const guide = section.guides[idx];
                const difficulty = getDifficultyDisplay(guide.difficulty);

                sectionsHTML += `
                    <div class="strategy-page mb-4">
                        <h2 class="text-base font-bold flex items-center mb-3 text-slate-700">
                            <span class="w-2 h-4 bg-blue-600 mr-2"></span>
                            ${section.title}
                        </h2>
                        
                        <div class="bg-white border-2 border-slate-200 rounded-xl p-4 shadow-sm">
                            <div class="flex justify-between items-start mb-3 pb-2 border-b-2 border-slate-100">
                                <h3 class="text-base font-bold text-slate-800">${strategyNum + 1}. ${guide.title}</h3>
                                <span class="px-2 py-1 text-xs font-bold rounded-full ${difficulty.color}">
                                    ${difficulty.emoji} ${difficulty.text}
                                </span>
                            </div>
                            
                            <div class="mb-3">
                                <p class="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">전문가 설명</p>
                                <p class="text-xs text-slate-700 leading-relaxed">${guide.expertDesc}</p>
                            </div>
                            
                            <div class="mb-3">
                                <p class="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">과학적 근거</p>
                                <div class="bg-amber-50 border-l-4 border-amber-500 p-2 rounded text-xs text-amber-900 leading-relaxed">
                                    ${guide.rationale}
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <p class="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">상담사 가이드</p>
                                <div class="bg-indigo-50 border-l-4 border-indigo-600 p-2 rounded text-xs font-semibold text-indigo-900 leading-relaxed">
                                    ${guide.managerGuide}
                                </div>
                            </div>
                            
                            <div>
                                <p class="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">실천 방법</p>
                                <div class="bg-emerald-50 border-l-4 border-emerald-500 p-2 rounded flex gap-2 items-start">
                                    <span class="text-emerald-600 text-lg font-bold flex-shrink-0">✓</span>
                                    <p class="text-xs text-emerald-900 leading-relaxed">${guide.action}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                `;

                strategyCount++;
            });
        });

        // Basic print styles to reset page (Same as Medical Report)
        const printStyle = `
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=Roboto+Mono&display=swap');
            @page { 
                size: A4; 
                margin: 15mm 10mm;
            }
            body { 
                margin: 0; 
                padding: 0; 
                background: #f1f5f9; 
                -webkit-print-color-adjust: exact !important; 
                print-color-adjust: exact !important; 
            }
            
            /* Repeating Header on Every Page */
            .page-header {
                display: none;
            }
            
            @media print {
                .page-header {
                    display: block;
                    position: running(header);
                }
                
                @page {
                    @top-center {
                        content: element(header);
                    }
                }
                
                /* Alternative: Use table header approach for better browser support */
                thead { display: table-header-group; }
                tfoot { display: table-footer-group; }
            }
        `;

        // Gather Tailwind styles from current document (Same as Medical Report)
        const tailwindStyles = Array.from(document.styleSheets)
            .map(styleSheet => {
                try {
                    return Array.from(styleSheet.cssRules).map(rule => rule.cssText).join('');
                } catch (e) {
                    return '';
                }
            }).join('');

        const printWindow = window.open('', '_blank', 'width=1200,height=900');
        if (printWindow) {
            printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="ko">
      <head>
        <title>전문가 가이드 - 선택한 학습 전략 - ${careTypeName}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          ${tailwindStyles}
          ${printStyle}
          .no-print { display: none !important; }
          body { overflow-y: auto; }
          
          /* Page break styling */
          .page-break {
              page-break-before: always;
              break-before: page;
              height: 0;
              margin: 0;
              padding: 0;
          }
          
          .strategy-page {
              page-break-inside: avoid;
          }
          
          @media print {
              .floating-print-btn { display: none; }
              body { -webkit-print-color-adjust: exact; }
              
              .page-break {
                  page-break-before: always !important;
                  break-before: page !important;
                  display: block;
                  height: 0 !important;
              }
              
              .page-header {
                  page-break-after: avoid !important;
              }
              
              .strategy-page {
                  page-break-inside: avoid !important;
              }
          }
          
          .floating-print-btn {
            position: fixed; top: 20px; right: 20px;
            background: #1e293b; color: white; padding: 12px 24px;
            border-radius: 9999px; font-weight: bold; cursor: pointer;
            box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); border: none; z-index: 1000;
            transition: all 0.2s;
          }
          .floating-print-btn:hover { transform: scale(1.05); background: #0f172a; }
        </style>
      </head>
      <body>
        <button class="floating-print-btn" onclick="window.print()">🖨️ 인쇄 / PDF 저장</button>
        
        <div class="max-w-[210mm] mx-auto p-10 bg-white my-8 rounded-lg shadow-2xl border-t-8 border-blue-700">
          <!-- First page header -->
          ${headerHTML}
          
          <!-- All strategies with headers repeated on new pages -->
          ${sectionsHTML}
          
          <!-- Footer -->
          <div class="mt-10 pt-6 border-t border-slate-200 flex justify-between text-[10px] text-slate-400 font-medium no-print">
            <p>© 2026 Mind-Body Connect. All strategies are evidence-based.</p>
            <p class="uppercase tracking-widest">LEARNING STRATEGY GUIDE</p>
          </div>
        </div>
      </body>
    </html>
  `);
            printWindow.document.close();
            printWindow.focus();
        }
    };

    return (
        <>
            {/* Sidebar Overlay (Expanded Width for detailed content) */}
            {isOpen && (
                <div
                    style={{ width: `${panelWidth}px` }}
                    className="fixed inset-y-0 right-0 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col border-l border-slate-200 print:hidden"
                >
                    {/* Resize Handle */}
                    <div
                        onMouseDown={handleMouseDown}
                        className={`absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-indigo-400 transition-colors ${isResizing ? 'bg-indigo-500' : 'bg-transparent hover:bg-indigo-200'}`}
                        title="드래그하여 너비 조절"
                    />
                    {/* Header */}
                    <div className="p-5 bg-slate-900 text-white flex justify-between items-center shadow-md shrink-0">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`w-2 h-2 rounded-full ${careType === CareType.SLEEP ? 'bg-indigo-400' : 'bg-emerald-400'}`}></span>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Consultant Scripter</p>
                            </div>
                            <h3 className="font-bold text-xl">{
                                {
                                    [CareType.SLEEP]: '수면 부족 케어 가이드',
                                    [CareType.BURNOUT]: '번아웃 회복 솔루션',
                                    [CareType.CONCENTRATION]: '초몰입 집중 전략',
                                    [CareType.CIRCULATION]: '뇌 혈류 순환 솔루션',
                                    [CareType.HEALTHY]: '학습 밸런스 가이드',
                                    [CareType.ADRENAL]: '부신 기능 회복 가이드',
                                    [CareType.ANXIETY_TENSION]: '불안-긴장 완화 가이드',
                                    [CareType.STRESS_OVERLOAD]: '스트레스 과부하 해소',
                                    [CareType.LOW_ENERGY]: '무기력 극복 솔루션',
                                    [CareType.DEPRESSION_AMOTIVATION]: '우울-무동기 회복',
                                    [CareType.BRAIN_FATIGUE]: '뇌 피로 회복 가이드',
                                    [CareType.HYPERSENSITIVE]: '과민감 학습 컨트롤',
                                    [CareType.ATTENTION_DEFICIT]: '주의력 집중 강화'
                                }[effectiveCareType] || '학습 밸런스 가이드'
                            }</h3>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={printChecklist}
                                className="text-slate-400 hover:text-white transition-colors p-2 flex items-center gap-1"
                                title="체크리스트 인쇄"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                </svg>
                            </button>
                            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                    </div>

                    {/* Previous Prescription Banner */}
                    {currentData?.previousResult?.completedExpertGuideItems && currentData.previousResult.completedExpertGuideItems.length > 0 && (
                        <div className="bg-blue-50 border-b border-blue-200 p-3 shrink-0 flex items-center justify-between">
                            <p className="text-xs font-bold text-blue-800 flex items-center gap-2">
                                <span>💡 이전 처방 전략이 있습니다 ({currentData.previousResult.completedExpertGuideItems.length}개)</span>
                            </p>
                            <span className="text-[10px] text-blue-600">체크리스트의 [이전 처방] 뱃지를 확인하세요.</span>
                        </div>
                    )}

                    {/* Dual-Mode Switcher (Original CareType vs Adrenal) */}
                    {showDualMode && (
                        <div className="flex border-b-2 border-slate-300 shrink-0 bg-gradient-to-r from-slate-100 to-slate-50">
                            <button
                                onClick={() => { setGuideMode('original'); setActiveTab('prestudy'); setExpandedItem(null); }}
                                className={`flex-1 py-3 text-xs font-black text-center transition-all ${guideMode === 'original' ? 'bg-white text-slate-800 shadow-sm border-b-2 border-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                📋 {{
                                    [CareType.SLEEP]: '수면 케어',
                                    [CareType.BURNOUT]: '번아웃 회복',
                                    [CareType.CONCENTRATION]: '집중력 강화',
                                    [CareType.CIRCULATION]: '혈류 순환',
                                    [CareType.HEALTHY]: '밸런스 가이드',
                                    [CareType.ADRENAL]: '부신 회복',
                                    [CareType.ANXIETY_TENSION]: '불안 완화',
                                    [CareType.STRESS_OVERLOAD]: '스트레스 해소',
                                    [CareType.LOW_ENERGY]: '무기력 극복',
                                    [CareType.DEPRESSION_AMOTIVATION]: '우울 회복',
                                    [CareType.BRAIN_FATIGUE]: '뇌 피로 회복',
                                    [CareType.HYPERSENSITIVE]: '과민감 컨트롤',
                                    [CareType.ATTENTION_DEFICIT]: '주의력 강화'
                                }[careType] || '기본 가이드'}
                            </button>
                            <button
                                onClick={() => { setGuideMode('adrenal'); setActiveTab('prestudy'); setExpandedItem(null); }}
                                className={`flex-1 py-3 text-xs font-black text-center transition-all ${guideMode === 'adrenal' ? 'bg-amber-50 text-amber-700 shadow-sm border-b-2 border-amber-500' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                ⚡ 부신 회복 가이드
                            </button>
                        </div>
                    )}

                    {/* Sub-menu Tabs (3x3 Grouped Grid) */}
                    <div className="bg-white border-b border-slate-200 shrink-0">
                        {/* Group 1: Student Strategy */}
                        <div className="px-3 pt-3 flex items-center gap-1.5 overflow-hidden">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter whitespace-nowrap bg-slate-100 px-1.5 py-0.5 rounded">Strategy</span>
                            <div className="h-[1px] bg-slate-100 flex-1"></div>
                        </div>
                        <div className="grid grid-cols-3 p-2 gap-1">
                            <button
                                onClick={() => { setActiveTab('prestudy'); setExpandedItem(null); }}
                                className={`py-2 text-[12px] font-bold text-center rounded-lg transition-all ${activeTab === 'prestudy' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-100' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                            >
                                ⚡ 시작 전
                            </button>
                            <button
                                onClick={() => { setActiveTab('learning'); setExpandedItem(null); }}
                                className={`py-2 text-[12px] font-bold text-center rounded-lg transition-all ${activeTab === 'learning' ? 'bg-blue-600 text-white shadow-md shadow-blue-100' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                            >
                                🧠 학습 중
                            </button>
                            <button
                                onClick={() => { setActiveTab('exercise'); setExpandedItem(null); }}
                                className={`py-2 text-[12px] font-bold text-center rounded-lg transition-all ${activeTab === 'exercise' ? 'bg-orange-600 text-white shadow-md shadow-orange-100' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                            >
                                🏃 신체
                            </button>
                        </div>

                        {/* Group 2: Management Tools */}
                        <div className="px-3 pt-1 flex items-center gap-1.5">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter whitespace-nowrap bg-slate-100 px-1.5 py-0.5 rounded">Management</span>
                            <div className="h-[1px] bg-slate-100 flex-1"></div>
                        </div>
                        <div className="grid grid-cols-3 p-2 gap-1">
                            <button
                                onClick={() => { setActiveTab('roadmap'); setExpandedItem(null); }}
                                className={`py-2 text-[12px] font-bold text-center rounded-lg transition-all ${activeTab === 'roadmap' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                            >
                                📅 로드맵
                            </button>
                            <button
                                onClick={() => { setActiveTab('resources'); setExpandedItem(null); }}
                                className={`py-2 text-[12px] font-bold text-center rounded-lg transition-all ${activeTab === 'resources' ? 'bg-cyan-600 text-white shadow-md shadow-cyan-100' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                            >
                                📚 자료
                            </button>
                            <button
                                onClick={() => { setActiveTab('kpi'); setExpandedItem(null); }}
                                className={`py-2 text-[12px] font-bold text-center rounded-lg transition-all ${activeTab === 'kpi' ? 'bg-teal-600 text-white shadow-md shadow-teal-100' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                            >
                                📊 KPI
                            </button>
                        </div>

                        {/* Group 3: Counseling Support */}
                        <div className="px-3 pt-1 flex items-center gap-1.5">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter whitespace-nowrap bg-slate-100 px-1.5 py-0.5 rounded">Counseling</span>
                            <div className="h-[1px] bg-slate-100 flex-1"></div>
                        </div>
                        <div className="grid grid-cols-4 p-2 gap-1 mb-2">
                            <button
                                onClick={() => { setActiveTab('faq'); setExpandedItem(null); }}
                                className={`py-2 text-[12px] font-bold text-center rounded-lg transition-all ${activeTab === 'faq' ? 'bg-rose-600 text-white shadow-md shadow-rose-100' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>
                                💬 대응
                            </button>
                            <button
                                onClick={() => { setActiveTab('parentscripts'); setExpandedItem(null); }}
                                className={`py-2 text-[12px] font-bold text-center rounded-lg transition-all ${activeTab === 'parentscripts' ? 'bg-purple-600 text-white shadow-md shadow-purple-100' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                            >
                                👪 학부모
                            </button>
                            <button
                                onClick={() => { setActiveTab('redflags'); setExpandedItem(null); }}
                                className={`py-2 text-[12px] font-bold text-center rounded-lg transition-all ${activeTab === 'redflags' ? 'bg-red-600 text-white shadow-md shadow-red-100' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                            >
                                🚨 위험신호
                            </button>
                            <button
                                onClick={() => { setActiveTab('prediction'); setExpandedItem(null); }}
                                className={`py-2 text-[12px] font-bold text-center rounded-lg transition-all ${activeTab === 'prediction' ? 'bg-violet-600 text-white shadow-md shadow-violet-100' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                                disabled={!currentData}
                                title={!currentData ? '진단 데이터가 필요합니다' : ''}
                            >
                                📊 예측
                            </button>
                            <button
                                onClick={() => { setActiveTab('history'); setExpandedItem(null); }}
                                className={`py-2 text-[12px] font-bold text-center rounded-lg transition-all ${activeTab === 'history' ? 'bg-gray-600 text-white shadow-md shadow-gray-100' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                            >
                                🕒 기록
                            </button>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto bg-slate-50/50 custom-scrollbar">
                        <div className="p-6 pb-20 animate-in fade-in slide-in-from-right-4 duration-300">
                            {/* History Content */}
                            {activeTab === 'history' ? (
                                <ConsultationHistoryModal
                                    studentId={studentId || ''}
                                    isOpen={true} // Always open when tab is active
                                    onClose={() => setActiveTab('prestudy')} // Switch tab on close
                                    currentAssessment={currentData}
                                />
                            ) : activeTab === 'redflags' ? (
                                <>
                                    <div className="mb-6">
                                        <h4 className="font-black text-2xl mb-2 text-red-800">
                                            🚨 위험 신호 (Red Flags)
                                        </h4>
                                        <p className="text-sm text-slate-600 leading-relaxed border-l-4 border-red-300 pl-3 italic">
                                            아래 증상이 관찰될 경우 즉시 조치가 필요합니다. 위험 수준에 따라 적절한 전문기관에 연계하십시오.
                                        </p>
                                    </div>

                                    {/* Emergency Contact Info */}
                                    <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-4">
                                        <h5 className="font-bold text-red-800 text-sm mb-2">📞 긴급 연락처</h5>
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div className="bg-white p-2 rounded-lg">
                                                <span className="font-bold text-red-700">자살예방상담전화:</span>
                                                <span className="ml-1 font-mono">1393</span>
                                            </div>
                                            <div className="bg-white p-2 rounded-lg">
                                                <span className="font-bold text-red-700">청소년상담:</span>
                                                <span className="ml-1 font-mono">1388</span>
                                            </div>
                                            <div className="bg-white p-2 rounded-lg">
                                                <span className="font-bold text-red-700">정신건강위기:</span>
                                                <span className="ml-1 font-mono">1577-0199</span>
                                            </div>
                                            <div className="bg-white p-2 rounded-lg">
                                                <span className="font-bold text-red-700">학교폭력신고:</span>
                                                <span className="ml-1 font-mono">117</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Red Flags List */}
                                    <div className="space-y-4">
                                        {currentRedFlags.map((flag, idx) => (
                                            <div
                                                key={idx}
                                                className={`rounded-xl border-2 overflow-hidden transition-all duration-300 ${flag.severity === 'emergency'
                                                    ? 'border-red-400 bg-red-50'
                                                    : flag.severity === 'critical'
                                                        ? 'border-orange-400 bg-orange-50'
                                                        : 'border-amber-400 bg-amber-50'
                                                    }`}
                                            >
                                                {/* Severity Header */}
                                                <div className={`px-4 py-2 flex items-center gap-2 ${flag.severity === 'emergency'
                                                    ? 'bg-red-500 text-white'
                                                    : flag.severity === 'critical'
                                                        ? 'bg-orange-500 text-white'
                                                        : 'bg-amber-500 text-white'
                                                    }`}>
                                                    <span className="text-lg">
                                                        {flag.severity === 'emergency' ? '🆘' : flag.severity === 'critical' ? '⚠️' : '⚡'}
                                                    </span>
                                                    <span className="font-bold text-sm uppercase tracking-wider">
                                                        {flag.severity === 'emergency' ? '긴급 (EMERGENCY)' : flag.severity === 'critical' ? '위험 (CRITICAL)' : '주의 (WARNING)'}
                                                    </span>
                                                </div>

                                                {/* Content */}
                                                <div className="p-4 space-y-3">
                                                    {/* Condition */}
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">증상/조건</p>
                                                        <p className={`text-sm font-bold leading-relaxed ${flag.severity === 'emergency' ? 'text-red-800' : flag.severity === 'critical' ? 'text-orange-800' : 'text-amber-800'
                                                            }`}>
                                                            {flag.condition}
                                                        </p>
                                                    </div>

                                                    {/* Action */}
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">조치 사항</p>
                                                        <div className={`p-3 rounded-lg ${flag.severity === 'emergency' ? 'bg-red-100' : flag.severity === 'critical' ? 'bg-orange-100' : 'bg-amber-100'
                                                            }`}>
                                                            <p className="text-sm text-slate-800 font-medium">
                                                                {flag.action}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Referral */}
                                                    {flag.referral && (
                                                        <div>
                                                            <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">연계 기관</p>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-lg">🏥</span>
                                                                <span className="text-sm font-bold text-slate-700">{flag.referral}</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}

                                        {/* If no red flags */}
                                        {currentRedFlags.length === 0 && (
                                            <div className="text-center py-12 text-slate-400">
                                                <span className="text-4xl">✅</span>
                                                <p className="mt-2 font-bold">현재 유형에 대한 특별 위험 신호가 없습니다.</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* General Warning */}
                                    <div className="mt-6 bg-slate-100 border border-slate-200 rounded-xl p-4">
                                        <h5 className="font-bold text-slate-700 text-sm mb-2">💡 상담사 유의사항</h5>
                                        <ul className="text-xs text-slate-600 space-y-1">
                                            <li>• 위험 신호 발견 시 반드시 기록을 남기고 관리자에게 보고하십시오.</li>
                                            <li>• 학생의 동의 없이도 생명이 위험한 경우 보호자 연락이 가능합니다.</li>
                                            <li>• 자해/자살 언급 시 절대 혼자 두지 마시고 즉시 전문 도움을 요청하십시오.</li>
                                            <li>• 모든 상담 내용은 비밀 보장 원칙을 따르되, 생명 위험 상황은 예외입니다.</li>
                                        </ul>
                                    </div>
                                </>
                            ) : activeTab === 'parentscripts' ? (
                                /* Parent Scripts Content */
                                <>
                                    <div className="mb-6">
                                        <h4 className="font-black text-2xl mb-2 text-purple-800">
                                            👪 학부모 전달용 메시지
                                        </h4>
                                        <p className="text-sm text-slate-600 leading-relaxed border-l-4 border-purple-300 pl-3 italic">
                                            상담 후 학부모에게 전달할 맞춤형 메시지입니다. 복사 버튼을 눌러 카톡/문자/이메일로 전송하세요.
                                        </p>
                                    </div>

                                    {/* Copy Success Toast */}
                                    {copySuccess && (
                                        <div className="fixed top-4 right-4 z-[60] bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
                                            ✅ "{copySuccess}" 복사 완료!
                                        </div>
                                    )}

                                    {/* Message Templates */}
                                    <div className="space-y-6">
                                        {currentParentScripts.map((script, idx) => (
                                            <div key={idx} className="bg-white rounded-xl border-2 border-purple-100 shadow-sm overflow-hidden">
                                                {/* Category Header */}
                                                <div className="bg-purple-50 px-4 py-3 flex items-center gap-2 border-b border-purple-100">
                                                    <span className="text-2xl">{script.icon}</span>
                                                    <span className="font-bold text-purple-800">{script.category}</span>
                                                </div>

                                                <div className="p-4 space-y-4">
                                                    {/* Short Message (카톡용) */}
                                                    <div>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <p className="text-[10px] font-bold text-purple-500 uppercase flex items-center gap-1">
                                                                💬 짧은 메시지 (카톡/문자용)
                                                            </p>
                                                            <button
                                                                onClick={() => copyToClipboard(script.shortMessage, script.category + ' 짧은 메시지')}
                                                                className="text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 px-2 py-1 rounded-lg transition-colors font-bold"
                                                            >
                                                                📋 복사
                                                            </button>
                                                        </div>
                                                        <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                                                            <p className="text-sm text-purple-900 leading-relaxed font-medium">
                                                                {script.shortMessage}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Detailed Message (이메일용) */}
                                                    <div>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <p className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                                                                📧 상세 메시지 (이메일용)
                                                            </p>
                                                            <button
                                                                onClick={() => copyToClipboard(script.detailedMessage, script.category + ' 상세 메시지')}
                                                                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-lg transition-colors font-bold"
                                                            >
                                                                📋 복사
                                                            </button>
                                                        </div>
                                                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                                                            <p className="text-sm text-slate-700 leading-relaxed">
                                                                {script.detailedMessage}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Tips */}
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">
                                                            ✅ 실천 팁 (학부모 전달용)
                                                        </p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {script.tips.map((tip, tipIdx) => (
                                                                <span
                                                                    key={tipIdx}
                                                                    className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg border border-emerald-100"
                                                                >
                                                                    {tip}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Copy All Button */}
                                                    <button
                                                        onClick={() => copyToClipboard(
                                                            `[${script.category}]\n\n${script.detailedMessage}\n\n📌 실천 팁:\n${script.tips.map(t => '• ' + t).join('\n')}`,
                                                            script.category + ' 전체'
                                                        )}
                                                        className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors text-sm"
                                                    >
                                                        📋 전체 메시지 복사
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Quick Message Generator */}
                                    <div className="mt-6 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-4">
                                        <h5 className="font-bold text-purple-800 text-sm mb-3">📱 빠른 전송 가이드</h5>
                                        <div className="grid grid-cols-2 gap-3 text-xs">
                                            <div className="bg-white p-3 rounded-lg border border-purple-100">
                                                <p className="font-bold text-purple-700 mb-1">카카오톡</p>
                                                <p className="text-slate-600">짧은 메시지를 복사하여 전송</p>
                                            </div>
                                            <div className="bg-white p-3 rounded-lg border border-purple-100">
                                                <p className="font-bold text-purple-700 mb-1">문자/SMS</p>
                                                <p className="text-slate-600">짧은 메시지 + 핵심 팁 1개</p>
                                            </div>
                                            <div className="bg-white p-3 rounded-lg border border-purple-100">
                                                <p className="font-bold text-purple-700 mb-1">이메일</p>
                                                <p className="text-slate-600">전체 메시지 복사하여 전송</p>
                                            </div>
                                            <div className="bg-white p-3 rounded-lg border border-purple-100">
                                                <p className="font-bold text-purple-700 mb-1">알림장</p>
                                                <p className="text-slate-600">실천 팁 위주로 전달</p>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : activeTab === 'kpi' ? (
                                /* KPI / Success Indicators Content */
                                <>
                                    <div className="mb-6">
                                        <h4 className="font-black text-2xl mb-2 text-teal-800">
                                            📊 성공 지표 (KPI)
                                        </h4>
                                        <p className="text-sm text-slate-600 leading-relaxed border-l-4 border-teal-300 pl-3 italic">
                                            다음 상담 시 확인할 객관적 측정 기준입니다. 우선순위가 높은 항목부터 체크하세요.
                                        </p>
                                    </div>

                                    {/* Priority Legend */}
                                    <div className="mb-4 flex gap-3">
                                        <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 font-bold">🔴 높음</span>
                                        <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 font-bold">🟡 중간</span>
                                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-bold">🟢 낮음</span>
                                    </div>

                                    {/* KPI Cards */}
                                    <div className="space-y-4">
                                        {currentSuccessIndicators
                                            .sort((a, b) => {
                                                const priorityOrder = { high: 0, medium: 1, low: 2 };
                                                return priorityOrder[a.priority] - priorityOrder[b.priority];
                                            })
                                            .map((kpi, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`bg-white rounded-xl border-2 overflow-hidden shadow-sm ${kpi.priority === 'high'
                                                        ? 'border-red-200'
                                                        : kpi.priority === 'medium'
                                                            ? 'border-amber-200'
                                                            : 'border-green-200'
                                                        }`}
                                                >
                                                    {/* Header */}
                                                    <div className={`px-4 py-3 flex items-center justify-between ${kpi.priority === 'high'
                                                        ? 'bg-red-50'
                                                        : kpi.priority === 'medium'
                                                            ? 'bg-amber-50'
                                                            : 'bg-green-50'
                                                        }`}>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-2xl">{kpi.icon}</span>
                                                            <span className="font-bold text-slate-800">{kpi.category}</span>
                                                        </div>
                                                        <span className={`text-xs px-2 py-1 rounded-full font-bold ${kpi.priority === 'high'
                                                            ? 'bg-red-200 text-red-800'
                                                            : kpi.priority === 'medium'
                                                                ? 'bg-amber-200 text-amber-800'
                                                                : 'bg-green-200 text-green-800'
                                                            }`}>
                                                            {kpi.priority === 'high' ? '높음' : kpi.priority === 'medium' ? '중간' : '낮음'}
                                                        </span>
                                                    </div>

                                                    {/* Content */}
                                                    <div className="p-4 space-y-3">
                                                        {/* Indicator */}
                                                        <div>
                                                            <p className="text-[10px] font-bold text-teal-600 uppercase mb-1">📈 측정 지표</p>
                                                            <p className="text-sm font-bold text-slate-800">{kpi.indicator}</p>
                                                        </div>

                                                        {/* Target & Timeframe */}
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div className="bg-teal-50 p-3 rounded-lg">
                                                                <p className="text-[10px] font-bold text-teal-600 uppercase mb-1">🎯 목표값</p>
                                                                <p className="text-sm font-bold text-teal-800">{kpi.targetValue}</p>
                                                            </div>
                                                            <div className="bg-slate-50 p-3 rounded-lg">
                                                                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">⏱️ 기간</p>
                                                                <p className="text-sm font-bold text-slate-700">{kpi.timeframe}</p>
                                                            </div>
                                                        </div>

                                                        {/* Measure Method */}
                                                        <div>
                                                            <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">📋 측정 방법</p>
                                                            <p className="text-sm text-slate-600 bg-slate-50 p-2 rounded-lg">{kpi.measureMethod}</p>
                                                        </div>

                                                        {/* Check Button */}
                                                        <div className="flex items-center gap-2 pt-2">
                                                            <span className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer ${kpi.priority === 'high' ? 'border-red-400' : kpi.priority === 'medium' ? 'border-amber-400' : 'border-green-400'
                                                                }`}>
                                                            </span>
                                                            <span className="text-xs text-slate-500">다음 상담 시 확인</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>

                                    {/* Copy Checklist */}
                                    <div className="mt-6">
                                        <button
                                            onClick={() => copyToClipboard(
                                                `📊 [${effectiveCareType}] 성공 지표 체크리스트\n\n${currentSuccessIndicators
                                                    .sort((a, b) => {
                                                        const priorityOrder = { high: 0, medium: 1, low: 2 };
                                                        return priorityOrder[a.priority] - priorityOrder[b.priority];
                                                    })
                                                    .map((kpi, i) => `${i + 1}. [${kpi.priority === 'high' ? '🔴' : kpi.priority === 'medium' ? '🟡' : '🟢'}] ${kpi.indicator}\n   목표: ${kpi.targetValue}\n   기간: ${kpi.timeframe}\n   측정: ${kpi.measureMethod}`)
                                                    .join('\n\n')}`,
                                                'KPI 체크리스트'
                                            )}
                                            className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
                                        >
                                            📋 체크리스트 전체 복사
                                        </button>
                                    </div>

                                    {/* Tips */}
                                    <div className="mt-6 bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-xl p-4">
                                        <h5 className="font-bold text-teal-800 text-sm mb-2">💡 KPI 활용 가이드</h5>
                                        <ul className="text-xs text-slate-600 space-y-1">
                                            <li>• <strong>높음</strong> 우선순위 항목은 다음 상담 시 반드시 확인하세요.</li>
                                            <li>• 목표 미달 시 원인을 파악하고 전략을 수정하세요.</li>
                                            <li>• 학생과 함께 목표를 공유하면 동기 부여에 효과적입니다.</li>
                                            <li>• 측정 결과를 기록하여 추이를 분석하세요.</li>
                                        </ul>
                                    </div>
                                </>
                            ) : activeTab === 'resources' ? (
                                /* Resources Content */
                                <>
                                    <div className="mb-6">
                                        <h4 className="font-black text-2xl mb-2 text-cyan-800">
                                            📚 보조 자료
                                        </h4>
                                        <p className="text-sm text-slate-600 leading-relaxed border-l-4 border-cyan-300 pl-3 italic">
                                            상담 중 보여주거나 학생에게 공유할 수 있는 자료입니다. 클릭하면 새 창에서 열립니다.
                                        </p>
                                    </div>

                                    {/* Resource Type Legend */}
                                    <div className="mb-4 flex flex-wrap gap-2">
                                        <span className="text-xs px-2 py-1 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center gap-1">🎬 영상</span>
                                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center gap-1">📄 PDF</span>
                                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-bold flex items-center gap-1">📱 앱</span>
                                        <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center gap-1">🔗 링크</span>
                                        <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center gap-1">🖼️ 이미지</span>
                                    </div>

                                    {/* Resources Grid */}
                                    <div className="grid grid-cols-1 gap-3">
                                        {currentResources.map((resource, idx) => {
                                            const typeStyles: Record<string, { bg: string, border: string, badge: string }> = {
                                                video: { bg: 'bg-rose-50 hover:bg-rose-100', border: 'border-rose-200', badge: 'bg-rose-500 text-white' },
                                                pdf: { bg: 'bg-blue-50 hover:bg-blue-100', border: 'border-blue-200', badge: 'bg-blue-500 text-white' },
                                                app: { bg: 'bg-green-50 hover:bg-green-100', border: 'border-green-200', badge: 'bg-green-500 text-white' },
                                                link: { bg: 'bg-amber-50 hover:bg-amber-100', border: 'border-amber-200', badge: 'bg-amber-500 text-white' },
                                                image: { bg: 'bg-purple-50 hover:bg-purple-100', border: 'border-purple-200', badge: 'bg-purple-500 text-white' }
                                            };
                                            const style = typeStyles[resource.type];

                                            return (
                                                <a
                                                    key={idx}
                                                    href={resource.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`block rounded-xl border-2 ${style.border} ${style.bg} p-4 transition-all duration-200 transform hover:scale-[1.01] hover:shadow-md`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <span className="text-3xl">{resource.icon}</span>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                                <h5 className="font-bold text-slate-800">{resource.title}</h5>
                                                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${style.badge}`}>
                                                                    {resource.type === 'video' ? '영상' :
                                                                        resource.type === 'pdf' ? 'PDF' :
                                                                            resource.type === 'app' ? '앱' :
                                                                                resource.type === 'link' ? '링크' : '이미지'}
                                                                </span>
                                                                {resource.duration && (
                                                                    <span className="text-[10px] text-slate-500 font-bold">⏱️ {resource.duration}</span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-slate-600 line-clamp-2">{resource.description}</p>

                                                            {/* Interactive App Button - Only for specific resources */}
                                                            {(() => {
                                                                const careTypeValue = careType as CareType;
                                                                let interactiveButton = null;

                                                                // Self-check resources
                                                                if (resource.url.includes('adrenal_checklist.pdf') && SELF_CHECK_DATA[CareType.ADRENAL]) {
                                                                    interactiveButton = (
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.preventDefault();
                                                                                e.stopPropagation();
                                                                                setSelectedResourceType(CareType.ADRENAL);
                                                                                setShowSelfCheck(true);
                                                                            }}
                                                                            className="text-[10px] font-bold px-3 py-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
                                                                        >
                                                                            📱 앱에서 열기
                                                                        </button>
                                                                    );
                                                                } else if (resource.url.includes('burnout_checklist.pdf') && SELF_CHECK_DATA[CareType.BURNOUT]) {
                                                                    interactiveButton = (
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.preventDefault();
                                                                                e.stopPropagation();
                                                                                setSelectedResourceType(CareType.BURNOUT);
                                                                                setShowSelfCheck(true);
                                                                            }}
                                                                            className="text-[10px] font-bold px-3 py-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
                                                                        >
                                                                            📱 앱에서 열기
                                                                        </button>
                                                                    );
                                                                } else if (resource.url.includes('sleep_diary') && WORKSHEET_DATA[CareType.SLEEP]) {
                                                                    interactiveButton = (
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.preventDefault();
                                                                                e.stopPropagation();
                                                                                setSelectedResourceType(CareType.SLEEP);
                                                                                setShowWorksheet(true);
                                                                            }}
                                                                            className="text-[10px] font-bold px-3 py-1.5 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition"
                                                                        >
                                                                            📱 앱에서 열기
                                                                        </button>
                                                                    );
                                                                } else if (resource.url.includes('morning_routine.pdf') && DAILY_ROUTINE_DATA[CareType.ADRENAL]) {
                                                                    interactiveButton = (
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.preventDefault();
                                                                                e.stopPropagation();
                                                                                setSelectedResourceType(CareType.ADRENAL);
                                                                                setShowRoutineTracker(true);
                                                                            }}
                                                                            className="text-[10px] font-bold px-3 py-1.5 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition"
                                                                        >
                                                                            📱 앱에서 열기
                                                                        </button>
                                                                    );
                                                                } else if (resource.url.includes('gratitude_journal.pdf') && WORKSHEET_DATA[CareType.DEPRESSION_AMOTIVATION]) {
                                                                    interactiveButton = (
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.preventDefault();
                                                                                e.stopPropagation();
                                                                                setSelectedResourceType(CareType.DEPRESSION_AMOTIVATION);
                                                                                setShowWorksheet(true);
                                                                            }}
                                                                            className="text-[10px] font-bold px-3 py-1.5 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition"
                                                                        >
                                                                            📱 앱에서 열기
                                                                        </button>
                                                                    );
                                                                } else if (resource.url.includes('anxiety_journal.pdf') && WORKSHEET_DATA[CareType.ANXIETY_TENSION]) {
                                                                    interactiveButton = (
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.preventDefault();
                                                                                e.stopPropagation();
                                                                                setSelectedResourceType(CareType.ANXIETY_TENSION);
                                                                                setShowWorksheet(true);
                                                                            }}
                                                                            className="text-[10px] font-bold px-3 py-1.5 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition"
                                                                        >
                                                                            📱 앱에서 열기
                                                                        </button>
                                                                    );
                                                                } else if (resource.url.includes('stress_workbook.pdf') && WORKSHEET_DATA[CareType.STRESS_OVERLOAD]) {
                                                                    interactiveButton = (
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.preventDefault();
                                                                                e.stopPropagation();
                                                                                setSelectedResourceType(CareType.STRESS_OVERLOAD);
                                                                                setShowWorksheet(true);
                                                                            }}
                                                                            className="text-[10px] font-bold px-3 py-1.5 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition"
                                                                        >
                                                                            📱 앱에서 열기
                                                                        </button>
                                                                    );
                                                                } else if (resource.url.includes('meal_log.pdf') && WORKSHEET_DATA[CareType.LOW_ENERGY]) {
                                                                    interactiveButton = (
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.preventDefault();
                                                                                e.stopPropagation();
                                                                                setSelectedResourceType(CareType.LOW_ENERGY);
                                                                                setShowWorksheet(true);
                                                                            }}
                                                                            className="text-[10px] font-bold px-3 py-1.5 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition"
                                                                        >
                                                                            📱 앱에서 열기
                                                                        </button>
                                                                    );
                                                                } else if (resource.url.includes('adhd_checklist.pdf') && SELF_CHECK_DATA[CareType.ATTENTION_DEFICIT]) {
                                                                    interactiveButton = (
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.preventDefault();
                                                                                e.stopPropagation();
                                                                                setSelectedResourceType(CareType.ATTENTION_DEFICIT);
                                                                                setShowSelfCheck(true);
                                                                            }}
                                                                            className="text-[10px] font-bold px-3 py-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
                                                                        >
                                                                            📱 앱에서 열기
                                                                        </button>
                                                                    );
                                                                }

                                                                return interactiveButton;
                                                            })()}

                                                            <div className="flex items-center justify-between mt-2">
                                                                <span className="text-[10px] text-cyan-600 font-bold bg-cyan-100 px-2 py-0.5 rounded-full">
                                                                    #{resource.category}
                                                                </span>
                                                                <span className="text-xs text-cyan-600 font-bold flex items-center gap-1">
                                                                    열기 →
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </a>
                                            );
                                        })}
                                    </div>

                                    {/* Resource Tips */}
                                    <div className="mt-6 bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-xl p-4">
                                        <h5 className="font-bold text-cyan-800 text-sm mb-3">💡 보조 자료 활용 팁</h5>
                                        <ul className="text-xs text-slate-600 space-y-1">
                                            <li>• <strong>영상 자료</strong>: 상담 중 학생과 함께 시청하거나 과제로 제공</li>
                                            <li>• <strong>PDF 자료</strong>: 출력하여 학생에게 제공하거나 이메일로 전송</li>
                                            <li>• <strong>앱 추천</strong>: 학생/학부모에게 설치 권장</li>
                                            <li>• <strong>참고 링크</strong>: 심화 정보가 필요한 경우 공유</li>
                                        </ul>
                                    </div>
                                </>
                            ) : activeTab === 'roadmap' ? (
                                /* Weekly Roadmap Content */
                                <>
                                    <div className="mb-6">
                                        <h4 className="font-black text-2xl mb-2 text-indigo-800">
                                            📅 주차별 로드맵
                                        </h4>
                                        <p className="text-sm text-slate-600 leading-relaxed border-l-4 border-indigo-300 pl-3 italic">
                                            장기 관리가 필요한 학생을 위한 {currentWeeklyPlan.totalWeeks}주 단계별 계획입니다.
                                        </p>
                                    </div>

                                    {/* Goal Banner */}
                                    <div className="mb-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl p-4">
                                        <div className="flex items-center gap-3">
                                            <span className="text-3xl">🎯</span>
                                            <div>
                                                <p className="text-xs font-bold opacity-80 uppercase">최종 목표</p>
                                                <p className="text-lg font-black">{currentWeeklyPlan.goal}</p>
                                            </div>
                                        </div>
                                        <div className="mt-3 flex items-center gap-2">
                                            <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold">
                                                📊 총 {currentWeeklyPlan.totalWeeks}주 프로그램
                                            </span>
                                        </div>
                                    </div>

                                    {/* Timeline */}
                                    <div className="relative">
                                        {/* Timeline Line */}
                                        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-indigo-200"></div>

                                        {/* Weekly Cards */}
                                        <div className="space-y-4">
                                            {currentWeeklyPlan.weeks.map((week, idx) => (
                                                <div key={idx} className="relative pl-14">
                                                    {/* Week Circle */}
                                                    <div className={`absolute left-3 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${week.milestone
                                                        ? 'bg-indigo-600 text-white ring-4 ring-indigo-100'
                                                        : 'bg-indigo-100 text-indigo-700'
                                                        }`}>
                                                        {week.week}
                                                    </div>

                                                    {/* Week Card */}
                                                    <div className={`bg-white rounded-xl border-2 overflow-hidden transition-all ${week.milestone ? 'border-indigo-300 shadow-md' : 'border-slate-200'
                                                        }`}>
                                                        {/* Header */}
                                                        <div className={`px-4 py-3 ${week.milestone ? 'bg-indigo-50' : 'bg-slate-50'
                                                            }`}>
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-slate-500 uppercase">Week {week.week}</p>
                                                                    <p className="font-bold text-slate-800">{week.theme}</p>
                                                                </div>
                                                                {week.milestone && (
                                                                    <span className="px-2 py-1 text-[10px] font-bold bg-indigo-600 text-white rounded-full">
                                                                        🏆 마일스톤
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Tasks */}
                                                        <div className="p-4">
                                                            <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">📋 실천 과제</p>
                                                            <ul className="space-y-2">
                                                                {week.tasks.map((task, tidx) => (
                                                                    <li key={tidx} className="flex items-start gap-2 text-sm text-slate-700">
                                                                        <span className="w-5 h-5 rounded border-2 border-indigo-300 flex items-center justify-center shrink-0 mt-0.5"></span>
                                                                        {task}
                                                                    </li>
                                                                ))}
                                                            </ul>

                                                            {/* Milestone */}
                                                            {week.milestone && (
                                                                <div className="mt-4 bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                                                                    <p className="text-xs font-bold text-indigo-800 flex items-center gap-1">
                                                                        🎯 목표: {week.milestone}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Copy Roadmap */}
                                    <div className="mt-6">
                                        <button
                                            onClick={() => copyToClipboard(
                                                `📅 [${effectiveCareType}] ${currentWeeklyPlan.totalWeeks}주 로드맵\n\n🎯 목표: ${currentWeeklyPlan.goal}\n\n${currentWeeklyPlan.weeks.map(w =>
                                                    `[Week ${w.week}] ${w.theme}\n${w.tasks.map(t => `  ☐ ${t}`).join('\n')}${w.milestone ? `\n  🏆 마일스톤: ${w.milestone}` : ''}`
                                                ).join('\n\n')}`,
                                                '주차별 로드맵'
                                            )}
                                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
                                        >
                                            📋 로드맵 전체 복사
                                        </button>
                                    </div>

                                    {/* Tips */}
                                    <div className="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-4">
                                        <h5 className="font-bold text-indigo-800 text-sm mb-2">💡 로드맵 활용 가이드</h5>
                                        <ul className="text-xs text-slate-600 space-y-1">
                                            <li>• 매 상담 시 해당 주차의 <strong>과제 완료 여부</strong>를 확인하세요.</li>
                                            <li>• <strong>마일스톤</strong>이 있는 주차는 특히 중요한 점검 포인트입니다.</li>
                                            <li>• 학생 상태에 따라 주차를 <strong>늘리거나 줄일</strong> 수 있습니다.</li>
                                            <li>• 로드맵을 <strong>학부모와 공유</strong>하면 가정에서의 협조를 얻기 쉽습니다.</li>
                                        </ul>
                                    </div>
                                </>
                            ) : activeTab === 'faq' ? (
                                /* FAQ / Common Objections Content */
                                <>
                                    <div className="mb-6">
                                        <h4 className="font-black text-2xl mb-2 text-rose-800">
                                            💬 학생 반론 대응 (FAQ)
                                        </h4>
                                        <p className="text-sm text-slate-600 leading-relaxed border-l-4 border-rose-300 pl-3 italic">
                                            학생들이 흔히 하는 변명과 거부감에 대한 유연한 대응 가이드입니다. 학생의 저항을 낮추고 동기를 부여하세요.
                                        </p>
                                    </div>

                                    <div className="space-y-6">
                                        {currentObjections.map((obj, idx) => (
                                            <div key={idx} className="bg-white rounded-2xl border-2 border-rose-100 shadow-sm overflow-hidden">
                                                {/* Category Header */}
                                                <div className="bg-rose-50 px-4 py-2 border-b border-rose-100 flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-bold text-rose-700 uppercase tracking-wider">{obj.category}</span>
                                                    </div>
                                                    <span className="text-xl">{obj.icon}</span>
                                                </div>

                                                <div className="p-5 space-y-4">
                                                    {/* Objection */}
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">학생의 반박/변명</p>
                                                        <div className="bg-slate-50 p-3 rounded-2xl rounded-tl-none border border-slate-200 relative">
                                                            <p className="text-sm font-bold text-slate-700 italic">
                                                                {obj.objection}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Response */}
                                                    <div>
                                                        <p className="text-[10px] font-bold text-rose-500 uppercase mb-2">상담사 대응 멘트</p>
                                                        <div className="bg-rose-50 p-4 rounded-2xl rounded-tr-none border border-rose-100">
                                                            <p className="text-sm font-bold text-rose-900 leading-relaxed">
                                                                {obj.response}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Tip */}
                                                    {obj.tip && (
                                                        <div className="flex items-start gap-2 pt-2 border-t border-slate-50">
                                                            <span className="text-sm shadow-sm bg-rose-100 rounded-full w-5 h-5 flex items-center justify-center text-[10px]">💡</span>
                                                            <p className="text-xs text-slate-500 font-medium">
                                                                <span className="font-bold text-rose-600">Tip:</span> {obj.tip}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Copy Button */}
                                                <button
                                                    onClick={() => copyToClipboard(obj.response, obj.objection + ' 대응')}
                                                    className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors border-t border-rose-100"
                                                >
                                                    📋 대응 멘트 복사
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Counseling Tips */}
                                    <div className="mt-8 bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-2xl p-5 shadow-lg">
                                        <h5 className="font-bold text-rose-400 text-sm mb-3 flex items-center gap-2">
                                            <span>✨</span> 유연한 상담을 위한 팁
                                        </h5>
                                        <ul className="text-xs space-y-2 opacity-90">
                                            <li className="flex gap-2">
                                                <span className="text-rose-400 font-bold">01.</span>
                                                <p>변명 뒤에 있는 <strong>진짜 두려움</strong>을 공감해 주세요. "맞아, 시간이 부족하다고 느낄 수 있어."</p>
                                            </li>
                                            <li className="flex gap-2">
                                                <span className="text-rose-400 font-bold">02.</span>
                                                <p><strong>작은 실험</strong>으로 제안해 보세요. "일주일만 이 방법으로 해보고 효과 없으면 바로 그만두자."</p>
                                            </li>
                                            <li className="flex gap-2">
                                                <span className="text-rose-400 font-bold">03.</span>
                                                <p>학생이 스스로 <strong>대안</strong>을 찾게 질문하세요. "그럼 너는 어느 시간에 하는 게 가장 편할 것 같아?"</p>
                                            </li>
                                        </ul>
                                    </div>
                                </>
                            ) : activeTab === 'prediction' ? (
                                /* Prediction & Trend Analysis Content */
                                <>
                                    <div className="mb-6">
                                        <h4 className="font-black text-2xl mb-2 text-violet-800">
                                            📊 위험 예측 분석 (Predictive Analytics)
                                        </h4>
                                        <p className="text-sm text-slate-600 leading-relaxed border-l-4 border-violet-300 pl-3 italic">
                                            로직 엔진 기반으로 학생의 현재 상태와 히스토리 데이터를 분석하여 미래 위험을 예측하고 선제적 조언을 제공합니다.
                                        </p>
                                    </div>

                                    {isLoadingPrediction ? (
                                        <div className="text-center py-12">
                                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-violet-200 border-t-violet-600"></div>
                                            <p className="mt-4 text-sm text-slate-500">예측 데이터 로딩 중...</p>
                                        </div>
                                    ) : !predictionData ? (
                                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
                                            <span className="text-4xl mb-2 block">⚠️</span>
                                            <p className="font-bold text-amber-900 mb-2">예측 데이터가 없습니다</p>
                                            <p className="text-sm text-amber-700">진단 데이터가 없거나 데이터 로딩에 실패했습니다.</p>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Overall Summary */}
                                            <div className={`mb-6 rounded-xl p-5 border-2 ${predictionData.overallSeverity === 'critical' ? 'bg-red-50 border-red-300' :
                                                predictionData.overallSeverity === 'warning' ? 'bg-orange-50 border-orange-300' :
                                                    predictionData.overallSeverity === 'caution' ? 'bg-yellow-50 border-yellow-300' :
                                                        'bg-emerald-50 border-emerald-300'
                                                }`}>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-2xl">{
                                                        predictionData.overallSeverity === 'critical' ? '🔴' :
                                                            predictionData.overallSeverity === 'warning' ? '⚠️' :
                                                                predictionData.overallSeverity === 'caution' ? '⚡' : '✅'
                                                    }</span>
                                                    <h5 className="font-bold text-slate-800">종합 가이드</h5>
                                                </div>
                                                <p className="text-sm text-slate-700 leading-relaxed">{predictionData.overallGuide}</p>
                                                <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                                                    <span>📅 데이터 포인트: {predictionData.dataPointsUsed}개</span>
                                                    <span>•</span>
                                                    <span>{predictionData.hasTrendData ? '📈 추세 분석 가능' : '📊 단일 데이터 분석'}</span>
                                                </div>
                                            </div>

                                            {/* Risk Predictions */}
                                            {predictionData.risks.length > 0 && (
                                                <div className="mb-6">
                                                    <h5 className="font-bold text-lg text-slate-800 mb-3">⚠️ 주요 위험 예측</h5>
                                                    <div className="space-y-4">
                                                        {predictionData.risks.map((risk, idx) => (
                                                            <div key={idx} className={`bg-white rounded-xl border-2 shadow-sm overflow-hidden ${risk.severity === 'critical' ? 'border-red-200' :
                                                                risk.severity === 'high' ? 'border-orange-200' :
                                                                    risk.severity === 'medium' ? 'border-yellow-200' :
                                                                        'border-slate-200'
                                                                }`}>
                                                                {/* Risk Header */}
                                                                <div className={`px-4 py-3 flex items-center justify-between ${risk.severity === 'critical' ? 'bg-red-50 border-b border-red-100' :
                                                                    risk.severity === 'high' ? 'bg-orange-50 border-b border-orange-100' :
                                                                        risk.severity === 'medium' ? 'bg-yellow-50 border-b border-yellow-100' :
                                                                            'bg-slate-50 border-b border-slate-100'
                                                                    }`}>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-lg">{
                                                                            risk.severity === 'critical' ? '🔴' :
                                                                                risk.severity === 'high' ? '🔴' :
                                                                                    risk.severity === 'medium' ? '🟡' : '🟢'
                                                                        }</span>
                                                                        <h6 className="font-bold text-slate-800">{risk.ruleNameKr}</h6>
                                                                        {risk.isTrendBased && (
                                                                            <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-bold">
                                                                                📈 추세기반
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <span className={`text-xs font-bold ${risk.severity === 'critical' ? 'text-red-700' :
                                                                            risk.severity === 'high' ? 'text-orange-700' :
                                                                                risk.severity === 'medium' ? 'text-yellow-700' :
                                                                                    'text-slate-700'
                                                                            }`}>확률: {risk.probability}%</span>
                                                                    </div>
                                                                </div>

                                                                <div className="p-4 space-y-3">
                                                                    {/* Consultation Script */}
                                                                    <div>
                                                                        <p className="text-[10px] font-bold text-violet-500 uppercase mb-2">💬 상담 스크립트</p>
                                                                        <div className="bg-violet-50 p-3 rounded-lg border border-violet-100">
                                                                            <p className="text-sm text-violet-900 font-medium leading-relaxed">
                                                                                {risk.consultScript}
                                                                            </p>
                                                                        </div>
                                                                        <button
                                                                            onClick={() => copyToClipboard(risk.consultScript, risk.ruleNameKr + ' 상담 스크립트')}
                                                                            className="mt-2 text-xs bg-violet-100 hover:bg-violet-200 text-violet-700 px-3 py-1 rounded-lg transition-colors font-bold"
                                                                        >
                                                                            📋 스크립트 복사
                                                                        </button>
                                                                    </div>

                                                                    {/* Recommendations */}
                                                                    <div>
                                                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">✅ 권장 조치</p>
                                                                        <ul className="space-y-1">
                                                                            {risk.recommendations.map((rec, recIdx) => (
                                                                                <li key={recIdx} className="text-sm text-slate-700 flex items-start gap-2">
                                                                                    <span className="text-emerald-500 mt-0.5">•</span>
                                                                                    {rec}
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>

                                                                    {/* Matched Conditions */}
                                                                    <div className="pt-2 border-t border-slate-100">
                                                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">📌 매칭된 조건</p>
                                                                        <div className="flex flex-wrap gap-1">
                                                                            {risk.matchedConditions.map((cond, condIdx) => (
                                                                                <span key={condIdx} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                                                                                    {cond}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    </div>

                                                                    {/* Timeframe & Severity */}
                                                                    <div className="flex items-center gap-4 pt-2 text-xs text-slate-500">
                                                                        <span>⏱️ 기간: {risk.timeframe}</span>
                                                                        <span>•</span>
                                                                        <span>⚠️ 심각도: {
                                                                            risk.severity === 'critical' ? '매우 높음' :
                                                                                risk.severity === 'high' ? '높음' :
                                                                                    risk.severity === 'medium' ? '보통' : '낮음'
                                                                        }</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Trend Analysis */}
                                            {predictionData.trends.length > 0 && (
                                                <div className="mb-6">
                                                    <h5 className="font-bold text-lg text-slate-800 mb-3">📈 추세 분석</h5>
                                                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                                        <table className="w-full text-sm">
                                                            <thead className="bg-slate-50 border-b border-slate-200">
                                                                <tr>
                                                                    <th className="px-4 py-2 text-left font-bold text-slate-700">지표</th>
                                                                    <th className="px-4 py-2 text-center font-bold text-slate-700">변화</th>
                                                                    <th className="px-4 py-2 text-right font-bold text-slate-700">분석</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {predictionData.trends.map((trend, idx) => (
                                                                    <tr key={idx} className="border-b border-slate-100 last:border-0">
                                                                        <td className="px-4 py-3 font-medium text-slate-700">{trend.fieldLabel}</td>
                                                                        <td className="px-4 py-3 text-center">
                                                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${trend.direction === 'up' ? 'bg-blue-100 text-blue-700' :
                                                                                trend.direction === 'down' ? 'bg-red-100 text-red-700' :
                                                                                    'bg-slate-100 text-slate-600'
                                                                                }`}>
                                                                                {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'}
                                                                                {Math.abs(trend.deltaPercent).toFixed(1)}%
                                                                            </span>
                                                                        </td>
                                                                        <td className="px-4 py-3 text-right text-slate-600">{trend.interpretation}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>

                                                    {/* Trend Chart Visualization */}
                                                    {predictionData.hasTrendData && (
                                                        <div className="mt-6 bg-white rounded-xl border border-slate-200 p-4">
                                                            <h6 className="font-bold text-sm text-slate-700 mb-4">📈 시계열 추세 차트</h6>
                                                            <ResponsiveContainer width="100%" height={250}>
                                                                <LineChart data={(() => {
                                                                    // Prepare chart data from history
                                                                    const historyData = predictionData.trends.length > 0
                                                                        ? Array.from({ length: predictionData.dataPointsUsed }, (_, i) => {
                                                                            const idx = predictionData.dataPointsUsed - 1 - i;
                                                                            return {
                                                                                name: `T-${idx}`,
                                                                                date: idx === 0 ? '현재' : `${idx}회 전`
                                                                            };
                                                                        }).reverse()
                                                                        : [];

                                                                    // Add trend values if available
                                                                    predictionData.trends.forEach(trend => {
                                                                        if (trend.field.includes('sns') || trend.field.includes('pns') ||
                                                                            trend.field.includes('bai') || trend.field.includes('isi') ||
                                                                            trend.field.includes('brainScore')) {
                                                                            const key = trend.fieldLabel;
                                                                            // Simulate historical data (in real implementation, use actual history)
                                                                            historyData.forEach((point, idx) => {
                                                                                if (idx === historyData.length - 1) {
                                                                                    point[key] = trend.currentValue;
                                                                                } else if (idx === historyData.length - 2) {
                                                                                    point[key] = trend.previousValue;
                                                                                }
                                                                            });
                                                                        }
                                                                    });

                                                                    return historyData;
                                                                })()}>
                                                                    <Line type="monotone" dataKey="교감신경(SNS)" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} />
                                                                    <Line type="monotone" dataKey="부교감신경(PNS)" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 4 }} />
                                                                    <Line type="monotone" dataKey="불안지수(BAI)" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444', r: 4 }} />
                                                                    <Line type="monotone" dataKey="수면장애(ISI)" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6', r: 4 }} />
                                                                    <Line type="monotone" dataKey="뇌건강점수" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 4 }} />
                                                                    <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: '11px' }} />
                                                                    <YAxis stroke="#64748b" style={{ fontSize: '11px' }} />
                                                                    <Tooltip
                                                                        contentStyle={{
                                                                            backgroundColor: '#fff',
                                                                            border: '1px solid #e2e8f0',
                                                                            borderRadius: '8px',
                                                                            fontSize: '12px'
                                                                        }}
                                                                    />
                                                                    <Legend
                                                                        wrapperStyle={{ fontSize: '11px' }}
                                                                        iconType="line"
                                                                    />
                                                                </LineChart>
                                                            </ResponsiveContainer>
                                                            <p className="text-xs text-slate-500 mt-3 text-center">
                                                                💡 각 지표의 변화 추이를 시각화한 차트입니다
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* No Risks Message */}
                                            {predictionData.risks.length === 0 && (
                                                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
                                                    <span className="text-4xl mb-2 block">✅</span>
                                                    <p className="font-bold text-emerald-900 mb-2">특별한 위험 신호가 감지되지 않았습니다</p>
                                                    <p className="text-sm text-emerald-700">현재 상태를 유지하면서 꾸준히 관리해 주세요.</p>
                                                </div>
                                            )}

                                            {/* Save Consultation Button */}
                                            {predictionData && currentData && (
                                                <div className="mt-6 grid grid-cols-2 gap-3">
                                                    <button
                                                        onClick={() => setShowConsultationModal(true)}
                                                        className="py-3 bg-violet-600 text-white rounded-xl font-bold hover:bg-violet-700 transition flex items-center justify-center gap-2"
                                                    >
                                                        <span>📝</span>
                                                        상담 이력 저장
                                                    </button>
                                                    <button
                                                        onClick={() => setShowConsultationHistory(true)}
                                                        className="py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                                                    >
                                                        <span>📋</span>
                                                        상담 이력 보기
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {/* Consultation Save Modal */}
                                    {showConsultationModal && predictionData && currentData && (
                                        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                                            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
                                                <div className="p-4 border-b border-slate-200 bg-violet-50">
                                                    <div className="flex justify-between items-center">
                                                        <h3 className="font-bold text-lg text-violet-900">📝 상담 이력 저장</h3>
                                                        <button
                                                            onClick={() => {
                                                                setShowConsultationModal(false);
                                                                setConsultationNotes('');
                                                                setStudentResponse('');
                                                            }}
                                                            className="text-slate-400 hover:text-slate-600 text-xl"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="p-6 space-y-4">
                                                    <div>
                                                        <label className="text-xs font-bold text-slate-600 block mb-1">관리자 메모</label>
                                                        <textarea
                                                            value={consultationNotes}
                                                            onChange={(e) => setConsultationNotes(e.target.value)}
                                                            placeholder="상담 내용, 특이사항 등을 기록하세요..."
                                                            className="w-full h-24 p-3 border rounded-lg text-sm resize-none focus:ring-2 ring-violet-200 outline-none"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-bold text-slate-600 block mb-1">학생 반응</label>
                                                        <textarea
                                                            value={studentResponse}
                                                            onChange={(e) => setStudentResponse(e.target.value)}
                                                            placeholder="학생의 피드백, 반응 등을 기록하세요..."
                                                            className="w-full h-24 p-3 border rounded-lg text-sm resize-none focus:ring-2 ring-violet-200 outline-none"
                                                        />
                                                    </div>
                                                    <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-600">
                                                        <p className="font-bold mb-1">자동 저장되는 정보:</p>
                                                        <ul className="list-disc list-inside space-y-1">
                                                            <li>사용된 예측 규칙 ({predictionData.risks.length}개)</li>
                                                            <li>상담 스크립트</li>
                                                            <li>예측 결과 스냅샷</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                                <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setShowConsultationModal(false);
                                                            setConsultationNotes('');
                                                            setStudentResponse('');
                                                        }}
                                                        className="px-6 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-medium"
                                                    >
                                                        취소
                                                    </button>
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                await DatabaseService.addConsultation({
                                                                    studentId: currentData.student.id,
                                                                    studentName: currentData.student.name,
                                                                    date: new Date().toISOString(),
                                                                    usedRules: predictionData.risks.map(r => r.ruleId),
                                                                    usedScripts: predictionData.risks.map(r => r.consultScript),
                                                                    notes: consultationNotes,
                                                                    studentResponse: studentResponse,
                                                                    predictions: predictionData
                                                                });
                                                                alert('상담 이력이 저장되었습니다.');
                                                                setShowConsultationModal(false);
                                                                setConsultationNotes('');
                                                                setStudentResponse('');
                                                            } catch (error) {
                                                                alert('저장 실패: ' + error);
                                                            }
                                                        }}
                                                        className="px-6 py-2 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700"
                                                    >
                                                        저장
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                /* Original Content for prestudy/learning/exercise */
                                <>
                                    <div className="mb-6">
                                        <h4 className={`font-black text-2xl mb-2 ${activeTab === 'prestudy' ? 'text-emerald-800' :
                                            activeTab === 'learning' ? 'text-blue-800' : 'text-orange-800'
                                            }`}>
                                            {content[activeTab as 'prestudy' | 'learning' | 'exercise'].title}
                                        </h4>
                                        {content[activeTab as 'prestudy' | 'learning' | 'exercise'].intro && (
                                            <p className="text-sm text-slate-600 leading-relaxed border-l-4 border-slate-300 pl-3 italic">
                                                {content[activeTab as 'prestudy' | 'learning' | 'exercise'].intro}
                                            </p>
                                        )}
                                    </div>

                                    {/* Difficulty Filter & Sort Controls */}
                                    <div className="mb-4 bg-white rounded-xl border border-slate-200 p-3">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className="text-xs font-bold text-slate-500">난이도:</span>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => setDifficultyFilter('all')}
                                                    className={`px-3 py-1 text-xs rounded-full font-bold transition-colors ${difficultyFilter === 'all' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                                >
                                                    전체
                                                </button>
                                                <button
                                                    onClick={() => setDifficultyFilter('easy')}
                                                    className={`px-3 py-1 text-xs rounded-full font-bold transition-colors ${difficultyFilter === 'easy' ? 'bg-green-600 text-white' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                                                >
                                                    🟢 쉬움
                                                </button>
                                                <button
                                                    onClick={() => setDifficultyFilter('medium')}
                                                    className={`px-3 py-1 text-xs rounded-full font-bold transition-colors ${difficultyFilter === 'medium' ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}`}
                                                >
                                                    🟡 보통
                                                </button>
                                                <button
                                                    onClick={() => setDifficultyFilter('hard')}
                                                    className={`px-3 py-1 text-xs rounded-full font-bold transition-colors ${difficultyFilter === 'hard' ? 'bg-red-600 text-white' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                                                >
                                                    🔴 어려움
                                                </button>
                                            </div>
                                            <div className="border-l border-slate-200 pl-3 ml-auto">
                                                <button
                                                    onClick={() => setSortByDifficulty(!sortByDifficulty)}
                                                    className={`px-3 py-1 text-xs rounded-full font-bold transition-colors flex items-center gap-1 ${sortByDifficulty ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'}`}
                                                >
                                                    ↑↓ {sortByDifficulty ? '난이도순 ON' : '난이도순'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Multi-Select Print Button */}
                                    {totalSelected > 0 && (
                                        <div className="mb-4">
                                            <button
                                                onClick={printSelectedStrategies}
                                                className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg flex items-center justify-center gap-2"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                                </svg>
                                                <span>선택한 전략 인쇄 ({totalSelected}개)</span>
                                            </button>
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        {getFilteredGuides(content[activeTab as 'prestudy' | 'learning' | 'exercise'].guides).map((item, idx) => (
                                            <div key={idx} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300">
                                                {/* Card Header (Always Visible) */}
                                                <button
                                                    onClick={() => toggleExpand(idx)}
                                                    className="w-full text-left p-5 flex items-start justify-between gap-4 hover:bg-slate-50 transition-colors"
                                                >
                                                    <div className="flex items-start gap-3 flex-1">
                                                        {/* Checkbox for multi-select */}
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedStrategies[activeTab as 'prestudy' | 'learning' | 'exercise'].includes(idx)}
                                                            onChange={(e) => {
                                                                e.stopPropagation();
                                                                toggleStrategySelection(activeTab as 'prestudy' | 'learning' | 'exercise', idx);
                                                            }}
                                                            className="w-5 h-5 mt-1 rounded border-2 border-indigo-300 cursor-pointer accent-indigo-600 shrink-0"
                                                        />
                                                        <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0 mt-0.5 ${activeTab === 'prestudy' ? 'bg-emerald-100 text-emerald-700' :
                                                            activeTab === 'learning' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                                                            }`}>
                                                            {idx + 1}
                                                        </span>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h5
                                                                    className={`font-bold text-slate-800 text-lg leading-tight ${(item.title === "데스크 셋업 (Visual Clean)" || item.title.includes("4-7-8 호흡") || item.title.includes("디지털 디톡스") || item.title.includes("마이크로 목표") || item.title.includes("걱정 배출") || item.title.includes("그라운딩") || item.title.includes("결과와 과정 분리") || item.title.includes("박스 브리딩"))
                                                                        ? "cursor-pointer hover:text-blue-600 transition-colors underline decoration-dotted decoration-blue-400"
                                                                        : ""
                                                                        }`}
                                                                    onClick={(e) => {
                                                                        if (item.title === "데스크 셋업 (Visual Clean)") {
                                                                            e.stopPropagation();
                                                                            openVisualCleanGuide();
                                                                        } else if (item.title.includes("4-7-8 호흡")) {
                                                                            e.stopPropagation();
                                                                            window.open('/breathing', '_blank');
                                                                        } else if (item.title.includes("디지털 디톡스")) {
                                                                            e.stopPropagation();
                                                                            openDigitalDetoxGuide();
                                                                        } else if (item.title.includes("마이크로 목표")) {
                                                                            e.stopPropagation();
                                                                            openMicroGoalGuide();
                                                                        } else if (item.title.includes("걱정 배출")) {
                                                                            e.stopPropagation();
                                                                            openWorryDumpGuide();
                                                                        } else if (item.title.includes("그라운딩")) {
                                                                            e.stopPropagation();
                                                                            openGroundingGuide();
                                                                        } else if (item.title.includes("결과와 과정 분리")) {
                                                                            e.stopPropagation();
                                                                            openDetachGuide();
                                                                        } else if (item.title.includes("박스 브리딩")) {
                                                                            e.stopPropagation();
                                                                            openBoxBreathingGuide();
                                                                        }
                                                                    }}
                                                                    title={(item.title === "데스크 셋업 (Visual Clean)" || item.title.includes("4-7-8 호흡") || item.title.includes("디지털 디톡스") || item.title.includes("마이크로 목표") || item.title.includes("걱정 배출") || item.title.includes("그라운딩") || item.title.includes("결과와 과정 분리") || item.title.includes("박스 브리딩")) ? "클릭하여 상세 가이드 보기" : ""}
                                                                >
                                                                    {item.title}
                                                                </h5>
                                                                {/* Previous Prescription Badge */}
                                                                {currentData?.previousResult?.completedExpertGuideItems?.includes(item.title) && (
                                                                    <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200 rounded-full shrink-0">
                                                                        이전 처방
                                                                    </span>
                                                                )}
                                                                {/* Difficulty Badge */}
                                                                {item.difficulty && (
                                                                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${getDifficultyDisplay(item.difficulty).color}`}>
                                                                        {getDifficultyDisplay(item.difficulty).emoji} {getDifficultyDisplay(item.difficulty).text}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-slate-500 line-clamp-1">{item.expertDesc}</p>
                                                        </div>
                                                    </div>
                                                    <span className={`transform transition-transform duration-300 ${expandedItem === idx ? 'rotate-180' : ''}`}>
                                                        ▼
                                                    </span>
                                                </button>

                                                {/* Expanded Content */}
                                                {expandedItem === idx && (
                                                    <div className="px-5 pb-5 pt-0 bg-slate-50/30 border-t border-slate-100 animate-in slide-in-from-top-2 duration-200">
                                                        {/* Manager's Script (Highlighted) */}
                                                        <div className="mt-4 bg-indigo-50 border border-indigo-100 p-4 rounded-lg relative">
                                                            <div className="absolute -left-1 top-4 w-1 h-8 bg-indigo-500 rounded-r"></div>
                                                            <p className="text-sm font-bold text-indigo-900 leading-relaxed font-sans">
                                                                {item.managerGuide}
                                                            </p>
                                                        </div>

                                                        {/* Details */}
                                                        <div className="mt-4 space-y-4">
                                                            <div>
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Expert Explanation</p>
                                                                <p className="text-sm text-slate-700 leading-relaxed">{item.expertDesc}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Scientific Rationale</p>
                                                                <p className="text-sm text-slate-600 bg-slate-100 p-3 rounded-lg leading-relaxed text-justify">
                                                                    {item.rationale}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Action Item</p>
                                                                <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                                                                    <span className="text-red-500">✓</span>
                                                                    {item.action}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div >
            )}

            {/* AI Assistant Panel for Strategy Analysis */}
            {currentData && (
                <div className="mt-8 px-6 pb-6">
                    <AIAssistantPanel 
                        contextData={{ careType: effectiveCareType, score, selectedStrategies: currentData.selectedStrategies }}
                        systemPrompt="당신은 NBASS의 전문가 가이드 AI입니다. 현재 학생의 careType과 선택된 전략을 바탕으로 학부모 상담 시 유용한 멘트나 추가 조언을 3문단으로 요약해주세요."
                        aiModels={aiModels || null}
                        buttonLabel="✨ 전략 가이드 AI 통합 요약"
                        membershipTier={currentData?.student?.membershipTier || 'standard'}
                    />
                </div>
            )}

            {/* Resource Modals */}
            {selectedResourceType && (
                <>
                    {showSelfCheck && SELF_CHECK_DATA[selectedResourceType] && (
                        <SelfCheckModal
                            isOpen={showSelfCheck}
                            onClose={() => {
                                setShowSelfCheck(false);
                                setSelectedResourceType(null);
                            }}
                            data={SELF_CHECK_DATA[selectedResourceType]!}
                            studentId={studentId}
                            careType={selectedResourceType}
                        />
                    )}

                    {showRoutineTracker && DAILY_ROUTINE_DATA[selectedResourceType] && (
                        <DailyRoutineTracker
                            isOpen={showRoutineTracker}
                            onClose={() => {
                                setShowRoutineTracker(false);
                                setSelectedResourceType(null);
                            }}
                            data={DAILY_ROUTINE_DATA[selectedResourceType]!}
                            studentId={studentId}
                            careType={selectedResourceType}
                        />
                    )}

                    {showWorksheet && WORKSHEET_DATA[selectedResourceType] && (
                        <WorksheetModal
                            isOpen={showWorksheet}
                            onClose={() => {
                                setShowWorksheet(false);
                                setSelectedResourceType(null);
                            }}
                            data={WORKSHEET_DATA[selectedResourceType]!}
                        />
                    )}
                </>
            )}

            {/* Consultation History Modal */}
            <ConsultationHistoryModal
                isOpen={showConsultationHistory}
                studentId={studentId}
                onClose={() => setShowConsultationHistory(false)}
            />
        </>
    );
};
