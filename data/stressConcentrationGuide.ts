/**
 * Stress & Concentration Gauge 기반 공부법 가이드
 * 
 * Stress Gauge: H-Beta(긴장) 파동과 연관, 자율신경 균형도 기반
 * Concentration Gauge: M-Beta(몰입) 및 Gamma(인지) 파동과 연관
 * 
 * 12가지 CareType과 매칭되어 HRV모드 / 의학적 모드에서 모두 적용
 */

import { CareType } from '../types';

export interface StressConcentrationGuide {
    // Stress Gauge 관련
    stressGaugeExplanation: string;
    highStressStudyMethod: string;
    lowStressStudyMethod: string;

    // Concentration Gauge 관련
    concentrationGaugeExplanation: string;
    highConcentrationStudyMethod: string;
    lowConcentrationStudyMethod: string;

    // 과목별 공부법 (Stress Gauge 기준)
    stressBasedSubjects: {
        korean: string;
        math: string;
        english: string;
    };

    // 과목별 공부법 (Concentration Gauge 기준)
    concentrationBasedSubjects: {
        korean: string;
        math: string;
        english: string;
    };
}

export const STRESS_CONCENTRATION_GUIDES: Record<CareType, StressConcentrationGuide> = {
    [CareType.BURNOUT]: {
        stressGaugeExplanation: `📊 **Stress Gauge 분석 (번아웃 상태)**

스트레스 게이지는 뇌의 **H-Beta(긴장) 파동**과 밀접합니다. 번아웃 상태에서는 자율신경 균형도가 심각하게 무너져 있으며, 혈관 건강 지수가 위험 단계에 있어 신체적 압박이 극심합니다. 코르티솔이 만성적으로 과다 분비되어 뇌가 '비상 모드'에 고착되어 있습니다.

**현재 상태**: 스트레스 게이지가 **만성적으로 높음** (H-Beta 지속 과활성)
- 교감신경 과활성으로 심박수가 빠르고 호흡이 얕음
- 에너지가 이미 고갈되어 '높은 긴장 + 낮은 활력'의 최악 조합
- 수면 중에도 완전한 이완이 어려워 회복이 안 됨`,

        highStressStudyMethod: `🔥 **높은 스트레스 시 공부법 (번아웃)**

**상태**: 불안감이 높고 잡념이 많아 문장이 눈에 들어오지 않음

**공부법: '단순 반복형 인출'**
• 복잡한 사고보다는 **영어 단어 암기**나 **단순 문법 문제** 풀이
• 손을 빠르게 움직이는 **'백지 복습'**으로 뇌의 과잉 에너지 배출
• 한 번에 15분 이상 집중하지 말고 **10분 학습-10분 완전 휴식**

**신체 조언**: 
• 5분간 가벼운 스트레칭으로 긴장 해소
• 따뜻한 물을 마셔 혈액 순환 촉진
• 카페인은 절대 금지 (이미 교감신경 과활성 상태)`,

        lowStressStudyMethod: `😌 **낮은 스트레스 시 공부법 (번아웃 회복기)**

**상태**: 심신이 일시적으로 안정되어 장기 기억 저장에 최적화된 상태

**공부법: '개념 구조화 및 감상'**
• 문학 작품을 깊이 있게 감상하며 텍스트에 대한 거부감 줄이기
• 배운 내용을 **마인드맵으로 시각화**
• 암기 효율이 극대화되는 시간이므로 **핵심 개념 정리**에 집중

**활용 팁**: 이 상태가 오면 놓치지 말고 30분 이내로 집중 학습하세요. 번아웃 상태에서는 이런 '컨디션 좋은 순간'이 드물기 때문입니다.`,

        concentrationGaugeExplanation: `🎯 **Concentration Gauge 분석 (번아웃 상태)**

집중도 게이지는 **M-Beta(몰입)** 및 **Gamma(인지)** 파동에 해당합니다. 번아웃 상태에서는 뇌가 에너지 절약 모드로 전환되어 집중 게이지가 **극도로 불안정**합니다.

**현재 상태**: 집중도 게이지 **불안정/낮음**
- Theta파(졸음)가 자주 증가하여 멍한 상태 반복
- M-Beta파가 간헐적으로만 활성화되어 집중이 오래 지속되지 않음
- 짧은 집중 후 급격한 피로감으로 '집중-탈진' 사이클 반복`,

        highConcentrationStudyMethod: `⚡ **높은 집중력 시 공부법 (번아웃 - 드문 상태)**

**상태**: 'Deep Work'가 가능한 순간 (번아웃에서는 매우 드묾)

**공부법: '기회 포착형 집중'**
• 이 순간을 놓치지 말고 **가장 중요한 과목**을 공략
• 단, 50분을 넘기지 마세요 - 번아웃 상태에서 과집중은 역효과
• **오답 노트 정리**나 **취약 단원 복습**에 활용

**주의**: 집중이 잘 된다고 무리하면 다음 며칠간 더 심한 탈진이 옵니다.`,

        lowConcentrationStudyMethod: `😴 **낮은 집중력 시 공부법 (번아웃 - 기본 상태)**

**상태**: 뇌가 지쳐 멍한 상태 (Theta파 우세, 졸음 지수 상승)

**공부법: '강제 각성 및 예열'**
• 어려운 문제를 풀면 자책감만 늘어남 - **서서 공부하기**
• **15분 파워냅(낮잠)** 권장 - 20분 넘기면 더 피곤함
• 단순 복습(암기 카드 넘기기, 공식 베껴쓰기)으로 뇌 예열

**회복 루틴**: 창가에서 햇빛 5분 + 물 한 잔 + 가벼운 스트레칭`,

        stressBasedSubjects: {
            korean: `📖 **국어 (스트레스 게이지 기준) - 번아웃**

**[높은 스트레스 시]**
• 긴 비문학 지문 분석은 뇌에 부담 → **기출 문학 감상 위주**
• 지문 1개만 깊이 분석, **해설지 먼저 읽고 지문 보는 '역순 학습'**
• 뇌의 예측 부담 줄여 피로도 30% 저하

**[낮은 스트레스 시]**
• 작품 감상에 집중하며 **문맥 파악 훈련**
• 마인드맵으로 작품 구조 시각화
• 선지 분석력 강화 (근거 찾기 연습)`,

            math: `📐 **수학 (스트레스 게이지 기준) - 번아웃**

**[높은 스트레스 시]**
• 새로운 개념(인풋)보다 **이미 아는 쉬운 문제(아웃풋)** 위주
• '내가 할 수 있다'는 **효능감 회복**이 목표
• 킬러 문항은 패스, **기본 예제 하루 10문제**
• 계산만 나열하는 '눈풀이'도 휴식에 도움

**[낮은 스트레스 시]**
• 오답 노트 다시 풀어보며 정리
• 공식 유도 과정을 백지에 써보기`,

            english: `🌐 **영어 (스트레스 게이지 기준) - 번아웃**

**[높은 스트레스 시]**
• 단어 암기는 에너지 소모 큼 → **억지로 외우지 말기**
• 좋아하는 **팝송 가사 해석, 미드 쉐도잉**으로 흥미 위주 노출
• EBS 지문 **한글 해석본 먼저** 읽어 배경지식 쌓기

**[낮은 스트레스 시]**
• 구문 분석 연습
• 빈칸 추론 기출 가볍게 풀기
• 쉬운 듣기 흘려듣기`
        },

        concentrationBasedSubjects: {
            korean: `📖 **국어 (집중도 게이지 기준) - 번아웃**

**[높은 집중력 시]** (드묾)
• **고난도 비문학** 1지문 집중 공략
• 선지 분석 + 근거 찾기 심화 훈련
• 단, 30분 넘기지 말 것

**[낮은 집중력 시]** (기본)
• 소리 내어 읽기로 졸음 방지
• 문학 작품 줄거리만 가볍게 훑기
• 펜으로 문장 짚으며 읽어 뇌 각성`,

            math: `📐 **수학 (집중도 게이지 기준) - 번아웃**

**[높은 집중력 시]** (드묾)
• 평소 못 풀던 **3점 문제** 도전
• 오답 노트 어려운 문제 재도전
• 풀이 과정 꼼꼼히 기록

**[낮은 집중력 시]** (기본)
• 쉬운 연산 문제로 손만 움직이기
• 공식 베껴쓰기
• 서서 문제 풀어 각성 유지`,

            english: `🌐 **영어 (집중도 게이지 기준) - 번아웃**

**[높은 집중력 시]** (드묾)
• 구문 분석 집중 연습
• 빈칸 추론 기출 풀이
• 모르는 단어 정리

**[낮은 집중력 시]** (기본)
• 영어 듣기 흘려듣기
• 플래시카드 넘기기
• 소리 내어 단어 읽기`
        }
    },

    [CareType.ADRENAL]: {
        stressGaugeExplanation: `📊 **Stress Gauge 분석 (부신피로 상태)**

부신피로 상태에서는 코르티솔 리듬이 교란되어 스트레스 게이지가 **불규칙하게 변동**합니다. 아침에 낮고 저녁에 오히려 높아지는 역전 패턴이 나타납니다.

**현재 상태**: 스트레스 게이지 **불규칙/리듬 교란**
- 아침: 코르티솔 부족으로 스트레스 반응 둔화
- 오후: 혈당 불안정으로 스트레스 급등
- 저녁: 부신 과각성으로 스트레스 상승`,

        highStressStudyMethod: `🔥 **높은 스트레스 시 공부법 (부신피로)**

**상태**: 오후~저녁에 갑자기 스트레스가 급등하는 상태

**공부법: '혈당 안정화 학습'**
• 스트레스 급등 시 **견과류나 단백질 바** 섭취
• 2시간마다 소량 간식으로 혈당 스파이크 방지
• 복잡한 문제보다 **단순 암기나 정리 작업**

**신체 조언**: 소금을 약간 첨가한 음식이 부신 기능에 도움`,

        lowStressStudyMethod: `😌 **낮은 스트레스 시 공부법 (부신피로)**

**상태**: 오전 10-12시, 오후 5-7시 에너지가 상대적으로 높은 시간

**공부법: '에너지 서핑'**
• 이 시간대에 **핵심 과목 집중 배치**
• 개념 이해나 문제 풀이 등 인지 부하가 높은 과제 수행
• 에너지 리듬을 타며 학습량 극대화`,

        concentrationGaugeExplanation: `🎯 **Concentration Gauge 분석 (부신피로 상태)**

부신피로 상태에서는 집중도 게이지가 **에너지 레벨에 연동**됩니다. 혈당이 안정적일 때만 집중이 가능합니다.

**현재 상태**: 집중도 게이지 **에너지 의존형**
- 혈당 안정 시: M-Beta파 활성화, 집중 가능
- 혈당 불안정 시: Theta파 증가, 멍한 상태`,

        highConcentrationStudyMethod: `⚡ **높은 집중력 시 공부법 (부신피로)**

• 에너지가 있을 때 **가장 어려운 과목** 배치
• 짧은 호흡으로 끝낼 수 있는 **3점 문제 타임어택**
• 성취감으로 도파민 분비 유도`,

        lowConcentrationStudyMethod: `😴 **낮은 집중력 시 공부법 (부신피로)**

• **15분 파워냅** 또는 명상
• 단순 작업(노트 정리, 암기 카드)
• 자연광 아래 가벼운 복습`,

        stressBasedSubjects: {
            korean: `📖 **국어 (스트레스 게이지 기준) - 부신피로**

**[높은 스트레스 시]**
• 화작/언매처럼 짧은 호흡 영역 배치
• 한 문단씩 끊어서 요약하는 '분절 독해'

**[낮은 스트레스 시]**
• 긴 비문학 지문 도전
• 구조 분석 심화 학습`,

            math: `📐 **수학 (스트레스 게이지 기준) - 부신피로**

**[높은 스트레스 시]**
• 3점짜리 문제 타임어택
• 한 문제 풀고 스트레칭

**[낮은 스트레스 시]**
• 4점 킬러 문항 도전
• 새로운 유형 탐색`,

            english: `🌐 **영어 (스트레스 게이지 기준) - 부신피로**

**[높은 스트레스 시]**
• 듣기 평가 활용 (눈 피로 분산)
• 소리 내어 읽기로 하루 마무리

**[낮은 스트레스 시]**
• 독해 지문 구조 분석
• 어휘 심화 학습`
        },

        concentrationBasedSubjects: {
            korean: `📖 **국어** - 에너지 높을 때 비문학, 낮을 때 문학 감상`,
            math: `📐 **수학** - 에너지 높을 때 신유형 도전, 낮을 때 기본 연산`,
            english: `🌐 **영어** - 에너지 높을 때 구문 분석, 낮을 때 듣기 흘려듣기`
        }
    },

    [CareType.STRESS_OVERLOAD]: {
        stressGaugeExplanation: `📊 **Stress Gauge 분석 (스트레스 과부하)**

스트레스 과부하 상태에서는 H-Beta파가 **지속적으로 높게** 유지됩니다. 번아웃 전 단계로, 지금 개입하면 회복 가능합니다.

**현재 상태**: 스트레스 게이지 **높음 (경계 수준)**`,

        highStressStudyMethod: `🔥 **높은 스트레스 시 공부법 (스트레스 과부하)**

**공부법: '단순화 전략'**
• 책상 위에 지금 볼 책 **단 한 권만** 남기기
• 플래너에 가장 중요한 **3가지만** 기록
• **싱글 태스킹** 고수 - 한 번에 하나씩`,

        lowStressStudyMethod: `😌 **낮은 스트레스 시 공부법 (스트레스 과부하)**

• 개념 정리 및 구조화
• 취약 단원 집중 공략
• 마인드맵 작성`,

        concentrationGaugeExplanation: `🎯 **Concentration Gauge 분석 (스트레스 과부하)**

작업 기억 용량이 감소하여 복잡한 문제 해결이 어렵습니다.`,

        highConcentrationStudyMethod: `⚡ **높은 집중력 시** - 고난도 문제 도전, 취약 유형 공략`,
        lowConcentrationStudyMethod: `😴 **낮은 집중력 시** - 5분 마음챙김 명상, 걱정 일지 작성 후 학습`,

        stressBasedSubjects: {
            korean: `📖 **국어** - 높을 때: 사실 일치 문제 위주 / 낮을 때: 추론 문제 도전`,
            math: `📐 **수학** - 높을 때: 오답 노트 복습 / 낮을 때: 신유형 도전`,
            english: `🌐 **영어** - 높을 때: 구문 독해 위주 / 낮을 때: 빈칸 추론`
        },
        concentrationBasedSubjects: {
            korean: `📖 **국어** - 집중 높을 때 비문학 분석`,
            math: `📐 **수학** - 집중 높을 때 킬러 문항 도전`,
            english: `🌐 **영어** - 집중 높을 때 정확한 해석 연습`
        }
    },

    [CareType.SLEEP]: {
        stressGaugeExplanation: `📊 **Stress Gauge 분석 (수면 부족)**

수면 부족 시 스트레스 반응이 과민해지고 코르티솔이 불규칙하게 분비됩니다.`,

        highStressStudyMethod: `🔥 **높은 스트레스 시** - 서서 공부, 소리 내어 읽기로 각성 유지`,
        lowStressStudyMethod: `😌 **낮은 스트레스 시** - 암기 효율 극대화, 자기 전 핵심 복습`,

        concentrationGaugeExplanation: `🎯 **Concentration Gauge 분석 (수면 부족)**

Theta파가 낮에도 나타나 '마이크로 슬립' 발생 가능.`,

        highConcentrationStudyMethod: `⚡ **높은 집중력 시** - 놓치지 말고 핵심 과목 집중`,
        lowConcentrationStudyMethod: `😴 **낮은 집중력 시** - 15분 카페인 냅, 서서/걸으며 학습`,

        stressBasedSubjects: {
            korean: `📖 **국어** - 오전에 비문학, 졸릴 때 낭독 학습`,
            math: `📐 **수학** - 계산 복잡한 문제 피하고 개념 정리`,
            english: `🌐 **영어** - 서서 단어 암기, 받아쓰기로 졸음 방지`
        },
        concentrationBasedSubjects: {
            korean: `📖 **국어** - 능동적 읽기로 졸음 방지`,
            math: `📐 **수학** - 손 움직이며 풀기`,
            english: `🌐 **영어** - 쉐도잉으로 각성 유지`
        }
    },

    [CareType.ANXIETY_TENSION]: {
        stressGaugeExplanation: `📊 **Stress Gauge 분석 (불안-긴장)**

불안 상태에서는 H-Beta파가 과활성화되어 스트레스 게이지가 **높게** 유지됩니다.`,

        highStressStudyMethod: `🔥 **높은 스트레스 시** - 4-7-8 호흡, 과정 중심 목표 설정`,
        lowStressStudyMethod: `😌 **낮은 스트레스 시** - 이 기회에 취약 단원 공략`,

        concentrationGaugeExplanation: `🎯 **Concentration Gauge 분석 (불안-긴장)**

불안으로 작업 기억 용량 감소, 복잡한 문제 해결 어려움.`,

        highConcentrationStudyMethod: `⚡ **높은 집중력 시** - 고난도 추론 문제 도전`,
        lowConcentrationStudyMethod: `😴 **낮은 집중력 시** - 자신 있는 문제로 자신감 회복`,

        stressBasedSubjects: {
            korean: `📖 **국어** - 시간 제한 타임어택으로 실전 불안 낮추기`,
            math: `📐 **수학** - 쉬운 문제부터 '동그라미' 늘리기`,
            english: `🌐 **영어** - 키워드 찾기 집중, 모르는 문장은 넘기기`
        },
        concentrationBasedSubjects: {
            korean: `📖 **국어** - <보기> 먼저 읽어 기준점 잡기`,
            math: `📐 **수학** - 조건에 동그라미, 실수 방지`,
            english: `🌐 **영어** - 구조 분석으로 정확성 높이기`
        }
    },

    [CareType.LOW_ENERGY]: {
        stressGaugeExplanation: `📊 **Stress Gauge 분석 (무기력)**

스트레스 반응 시스템이 둔화되어 게이지가 전반적으로 **낮음**.`,

        highStressStudyMethod: `🔥 **높은 스트레스 시** (드묾) - 이 에너지를 활용해 도전적 학습`,
        lowStressStudyMethod: `😌 **낮은 스트레스 시** (기본) - 게임화 전략으로 동기 부여`,

        concentrationGaugeExplanation: `🎯 **Concentration Gauge 분석 (무기력)**

Theta파 우세로 각성 수준이 낮음. 뇌에 자극이 필요.`,

        highConcentrationStudyMethod: `⚡ **높은 집중력 시** - 어려운 과목 집중`,
        lowConcentrationStudyMethod: `😴 **낮은 집중력 시** - 스탠딩 책상, 껌 씹기로 각성`,

        stressBasedSubjects: {
            korean: `📖 **국어** - 흥미로운 소재 비문학부터`,
            math: `📐 **수학** - 친구와 문제 내기 게임`,
            english: `🌐 **영어** - 유튜브 영상으로 워밍업`
        },
        concentrationBasedSubjects: {
            korean: `📖 **국어** - 소리 내어 읽기`,
            math: `📐 **수학** - 화려한 색깔 펜 사용`,
            english: `🌐 **영어** - 쉐도잉으로 입 움직이기`
        }
    },

    [CareType.DEPRESSION_AMOTIVATION]: {
        stressGaugeExplanation: `📊 **Stress Gauge 분석 (우울-무동기)**

스트레스 반응 시스템이 억제되어 게이지가 **둔화**.`,

        highStressStudyMethod: `🔥 **높은 스트레스 시** - 함께 공부하기로 연대감 형성`,
        lowStressStudyMethod: `😌 **낮은 스트레스 시** - 작은 목표 달성으로 성취감`,

        concentrationGaugeExplanation: `🎯 **Concentration Gauge 분석 (우울-무동기)**

뇌의 보상 시스템이 둔화되어 집중 동기가 낮음.`,

        highConcentrationStudyMethod: `⚡ **높은 집중력 시** - 기회를 놓치지 말고 중요 과목`,
        lowConcentrationStudyMethod: `😴 **낮은 집중력 시** - 햇빛 창가에서 공부, 10분 산책`,

        stressBasedSubjects: {
            korean: `📖 **국어** - 문학 작품 감정 이입 활용`,
            math: `📐 **수학** - 단순 연산으로 명쾌함 느끼기`,
            english: `🌐 **영어** - 희망적 내용 지문 선택`
        },
        concentrationBasedSubjects: {
            korean: `📖 **국어** - 필사로 마음 정화`,
            math: `📐 **수학** - 답 맞추는 쾌감 추구`,
            english: `🌐 **영어** - TED 연설문 독해`
        }
    },

    [CareType.BRAIN_FATIGUE]: {
        stressGaugeExplanation: `📊 **Stress Gauge 분석 (뇌피로)**

인지 과부하로 스트레스 게이지가 **불규칙**.`,

        highStressStudyMethod: `🔥 **높은 스트레스 시** - 디지털 디톡스, 종이 교재만 사용`,
        lowStressStudyMethod: `😌 **낮은 스트레스 시** - 시각화 훈련으로 정보 정리`,

        concentrationGaugeExplanation: `🎯 **Concentration Gauge 분석 (뇌피로)**

정보 처리 과부하로 집중이 산발적.`,

        highConcentrationStudyMethod: `⚡ **높은 집중력 시** - 핵심 개념만 빠르게`,
        lowConcentrationStudyMethod: `😴 **낮은 집중력 시** - 3분 멍때리기로 뇌 리셋`,

        stressBasedSubjects: {
            korean: `📖 **국어** - 밑줄/동그라미로 손 사용`,
            math: `📐 **수학** - 풀이 과정 정갈하게 정리`,
            english: `🌐 **영어** - 종이 사전 활용`
        },
        concentrationBasedSubjects: {
            korean: `📖 **국어** - 구조도 그리기`,
            math: `📐 **수학** - 오답 아날로그 정리`,
            english: `🌐 **영어** - 단어장 직접 만들기`
        }
    },

    [CareType.HYPERSENSITIVE]: {
        stressGaugeExplanation: `📊 **Stress Gauge 분석 (과민성)**

작은 자극에도 스트레스 게이지가 **급등**하는 패턴.`,

        highStressStudyMethod: `🔥 **높은 스트레스 시** - 완벽한 환경 통제 (소음 차단 이어폰 필수)`,
        lowStressStudyMethod: `😌 **낮은 스트레스 시** - 섬세함을 활용한 디테일 분석`,

        concentrationGaugeExplanation: `🎯 **Concentration Gauge 분석 (과민성)**

환경이 통제되면 **초집중** 가능, 그렇지 않으면 집중 불가.`,

        highConcentrationStudyMethod: `⚡ **높은 집중력 시** - 남들 3시간 분량을 1시간에`,
        lowConcentrationStudyMethod: `😴 **낮은 집중력 시** - 환경 점검 후 재시작`,

        stressBasedSubjects: {
            korean: `📖 **국어** - 미세한 뉘앙스 캐치 능력 활용`,
            math: `📐 **수학** - 검산 루틴화로 불안 해소`,
            english: `🌐 **영어** - 어휘 뉘앙스 비교 학습`
        },
        concentrationBasedSubjects: {
            korean: `📖 **국어** - 작가 의도 깊이 파고들기`,
            math: `📐 **수학** - 함정 찾기 능력 활용`,
            english: `🌐 **영어** - 발음/문법 디테일 파악`
        }
    },

    [CareType.ATTENTION_DEFICIT]: {
        stressGaugeExplanation: `📊 **Stress Gauge 분석 (주의력 산만)**

지루함이 스트레스를 유발, 적절한 자극이 필요.`,

        highStressStudyMethod: `🔥 **높은 스트레스 시** - 오감 동원 학습으로 에너지 분산`,
        lowStressStudyMethod: `😌 **낮은 스트레스 시** - 타임어택으로 긴장감 유지`,

        concentrationGaugeExplanation: `🎯 **Concentration Gauge 분석 (주의력 산만)**

Theta파 높고 Beta파 불안정. 지속 집중 어려움.`,

        highConcentrationStudyMethod: `⚡ **높은 집중력 시** - '꽂히면 무섭다' 활용`,
        lowConcentrationStudyMethod: `😴 **낮은 집중력 시** - 15분 세션, 능동적 학습`,

        stressBasedSubjects: {
            korean: `📖 **국어** - 문단마다 제목 붙이기 미션`,
            math: `📐 **수학** - 칠판 강의하듯 설명하며 풀기`,
            english: `🌐 **영어** - 단어 카드 게임, 작문 활동`
        },
        concentrationBasedSubjects: {
            korean: `📖 **국어** - 적극적 메모하며 읽기`,
            math: `📐 **수학** - 타이머로 압박감 주기`,
            english: `🌐 **영어** - 예문 만들기 활동`
        }
    },

    [CareType.CONCENTRATION]: {
        stressGaugeExplanation: `📊 **Stress Gauge 분석 (집중력 저하)**

복합적 원인으로 스트레스와 집중 모두 불안정.`,

        highStressStudyMethod: `🔥 **높은 스트레스 시** - 걱정 노트 작성 후 학습`,
        lowStressStudyMethod: `😌 **낮은 스트레스 시** - 몰입 조건 만들기`,

        concentrationGaugeExplanation: `🎯 **Concentration Gauge 분석 (집중력 저하)**

수면, 스트레스, 영양 등 복합 요인 점검 필요.`,

        highConcentrationStudyMethod: `⚡ **높은 집중력 시** - 골든타임 활용해 핵심 학습`,
        lowConcentrationStudyMethod: `😴 **낮은 집중력 시** - 포모도로 기법으로 관리`,

        stressBasedSubjects: {
            korean: `📖 **국어** - 쉬운 문학으로 워밍업 후 비문학`,
            math: `📐 **수학** - 자신 있는 단원부터 RPM 올리기`,
            english: `🌐 **영어** - 약간 빠른 속도로 독해`
        },
        concentrationBasedSubjects: {
            korean: `📖 **국어** - 워밍업 후 고난도 도전`,
            math: `📐 **수학** - 몰입 시 난이도 상향`,
            english: `🌐 **영어** - 집중 시 정확한 해석 연습`
        }
    },

    [CareType.CIRCULATION]: {
        stressGaugeExplanation: `📊 **Stress Gauge 분석 (순환 저하)**

혈류 감소로 뇌 기능 저하, 스트레스 저항력 약화.`,

        highStressStudyMethod: `🔥 **높은 스트레스 시** - 즉시 일어나 스트레칭`,
        lowStressStudyMethod: `😌 **낮은 스트레스 시** - 움직이면서 학습`,

        concentrationGaugeExplanation: `🎯 **Concentration Gauge 분석 (순환 저하)**

뇌 산소 공급 부족으로 Theta파 증가, 멍함.`,

        highConcentrationStudyMethod: `⚡ **높은 집중력 시** - 혈류 좋을 때 핵심 학습`,
        lowConcentrationStudyMethod: `😴 **낮은 집중력 시** - 50분마다 일어나기`,

        stressBasedSubjects: {
            korean: `📖 **국어** - 독서대로 바른 자세, 거북목 방지`,
            math: `📐 **수학** - 중간중간 발목 돌리기`,
            english: `🌐 **영어** - 소리 내어 읽기로 호흡 유도`
        },
        concentrationBasedSubjects: {
            korean: `📖 **국어** - 서서 또는 걸으며 읽기`,
            math: `📐 **수학** - 서서 문제 풀기`,
            english: `🌐 **영어** - 걸으며 단어 암기`
        }
    },

    [CareType.HEALTHY]: {
        stressGaugeExplanation: `📊 **Stress Gauge 분석 (건강 균형)**

스트레스 게이지가 **안정적**으로 유지됩니다. 현재 상태를 유지하세요.`,

        highStressStudyMethod: `🔥 **높은 스트레스 시** - 한계 돌파, 목표 20% 상향`,
        lowStressStudyMethod: `😌 **낮은 스트레스 시** - 취약 과목/킬러 문항 도전`,

        concentrationGaugeExplanation: `🎯 **Concentration Gauge 분석 (건강 균형)**

M-Beta와 Gamma파가 안정적. Deep Work 가능.`,

        highConcentrationStudyMethod: `⚡ **높은 집중력 시** - 최고난도 문제 정면 돌파`,
        lowConcentrationStudyMethod: `😴 **낮은 집중력 시** - 가벼운 복습으로 리듬 유지`,

        stressBasedSubjects: {
            korean: `📖 **국어** - 철학/경제/과학 고난도 비문학`,
            math: `📐 **수학** - 해설 안 보고 끝까지 고민`,
            english: `🌐 **영어** - 빈칸/순서 오답률 높은 유형 파기`
        },
        concentrationBasedSubjects: {
            korean: `📖 **국어** - 심화 추론 문제 도전`,
            math: `📐 **수학** - 킬러 문항 집중 공략`,
            english: `🌐 **영어** - 원서 읽기, 고급 어휘`
        }
    },

    [CareType.UNASSESSED]: {
        stressGaugeExplanation: `📊 **Stress Gauge 분석** - 데이터 부족으로 정확한 분석 불가`,
        highStressStudyMethod: `🔥 **높은 스트레스 시** - 4-7-8 호흡 후 단순 작업`,
        lowStressStudyMethod: `😌 **낮은 스트레스 시** - 규칙적 루틴 학습`,
        concentrationGaugeExplanation: `🎯 **Concentration Gauge 분석** - 데이터 보완 필요`,
        highConcentrationStudyMethod: `⚡ **높은 집중력 시** - 중요 과목 집중`,
        lowConcentrationStudyMethod: `😴 **낮은 집중력 시** - 25분 집중-5분 휴식`,
        stressBasedSubjects: {
            korean: `📖 **국어** - 매일 비문학 3지문 분석`,
            math: `📐 **수학** - 개념서 정독, 기본 유형`,
            english: `🌐 **영어** - 단어 30개, 듣기 1회`
        },
        concentrationBasedSubjects: {
            korean: `📖 **국어** - 펜으로 짚으며 읽기`,
            math: `📐 **수학** - 풀이 과정 기록`,
            english: `🌐 **영어** - 끊어 읽기`
        }
    }
};

/**
 * CareType에 따른 Stress & Concentration Gauge 가이드 가져오기
 */
export const getStressConcentrationGuide = (careType: CareType): StressConcentrationGuide => {
    return STRESS_CONCENTRATION_GUIDES[careType] || STRESS_CONCENTRATION_GUIDES[CareType.UNASSESSED];
};

/**
 * HRV 데이터를 기반으로 현재 스트레스/집중 상태 판단
 */
export const analyzeCurrentState = (
    stressIndex?: number,
    concentrationLevel?: number,
    dominantEEG?: string[]
): { stressState: 'high' | 'low'; concentrationState: 'high' | 'low' } => {
    // 스트레스 상태 판단
    const stressState = (stressIndex && stressIndex >= 45) ||
        (dominantEEG && dominantEEG.includes('H-Beta')) ? 'high' : 'low';

    // 집중 상태 판단 (1~10 척도 또는 0~100 척도 자동 호환)
    const normalizedConcScore = concentrationLevel !== undefined
        ? (concentrationLevel <= 10 ? concentrationLevel * 10 : concentrationLevel)
        : 50;
    const concentrationState = (normalizedConcScore >= 60) ||
        (dominantEEG && (dominantEEG.includes('M-Beta') || dominantEEG.includes('Gamma'))) ? 'high' : 'low';

    return { stressState, concentrationState };
};
