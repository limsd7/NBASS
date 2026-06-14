/**
 * 통합 학습 최적화 엔진 (Integrated Study Optimization Engine)
 * 
 * 4가지 지표를 종합하여 국어/수학/영어 최적 공부법을 선택:
 * 1. Autonomic Balance (ANS) - 자율신경 균형
 * 2. Vitality & Fatigue Index - 활력 및 피로 지수
 * 3. Brain Balance Radar - 뇌파 균형 (HRV/의학적 모드만)
 * 4. Stress & Concentration Gauge - 스트레스 및 집중도 게이지
 * 
 * 12가지 CareType과 매칭
 * HRV모드 / 의학적 모드 / Portable 모드 모두 지원
 */

import { CareType, HRVData, ANSBalanceType } from '../types';
import { determineDominantEEGType, DominantEEGType } from './brainBalanceRadarInsights';
import { analyzeCurrentState } from './stressConcentrationGuide';

// ========== 타입 정의 ==========

export type PhysicalState = 'sympathetic_dominant' | 'parasympathetic_dominant' | 'balanced';
export type MentalArousal = 'high_arousal' | 'standard_arousal' | 'low_arousal' | 'emergency';
export type SubjectRecommendation = 'deep_work' | 'structured_output' | 'active_input' | 'passive_exposure' | 'recovery';

export interface IntegratedAssessment {
    // 신체 상태 (Step 1)
    physicalState: PhysicalState;
    physicalStateDescription: string;

    // 정신 각성도 (Step 2)
    mentalArousal: MentalArousal;
    mentalArousalDescription: string;

    // 4개 지표 통합 점수
    ansScore: number;           // ANS 균형 점수 (0-100, 높을수록 균형)
    vitalityScore: number;      // 활력 점수 (0-100)
    fatigueScore: number;       // 피로 점수 (0-100, 낮을수록 좋음)
    stressScore: number;        // 스트레스 점수 (0-100, 낮을수록 좋음)
    concentrationScore: number; // 집중도 점수 (0-100, 높을수록 좋음)
    eegType?: DominantEEGType;  // 뇌파 패턴 (EEG 모드만)

    // 과목별 추천 모드
    koreanRecommendation: SubjectRecommendation;
    mathRecommendation: SubjectRecommendation;
    englishRecommendation: SubjectRecommendation;

    // 상세 전략
    koreanStrategy: string;
    mathStrategy: string;
    englishStrategy: string;

    // 종합 요약
    overallSummary: string;
    prioritySubject: 'korean' | 'math' | 'english';
    warningMessage?: string;
}

export interface IntegratedStudyRecommendation {
    title: string;
    mode: SubjectRecommendation;
    method: string;
    reason: string;
    tips: string[];
}

// ========== 신체-정신-인지 3단계 필터 로직 ==========

/**
 * Step 1: 신체 상태 체크 (자율신경 및 피로도 필터)
 */
export const analyzePhysicalState = (
    hrv: HRVData,
    isPortable: boolean
): { state: PhysicalState; description: string; score: number } => {
    if (isPortable && hrv.portableHrv) {
        const p = hrv.portableHrv;
        // Portable 모드: 스트레스 지수와 ANS 균형으로 판단
        if (p.ansBalanceType === ANSBalanceType.OVERWORK_CHRONIC ||
            p.ansBalanceType === ANSBalanceType.CHRONIC ||
            p.stressIndex >= 50) {
            return {
                state: 'sympathetic_dominant',
                description: '교감신경 우세 - 심박수가 빠르고 호흡이 얕음. 긴장 상태로 에너지를 빠르게 소모 중.',
                score: Math.max(0, 100 - p.stressIndex)
            };
        } else if (p.pulseVariability <= 25 ||
            p.ansBalanceType === ANSBalanceType.DISEASE_CHRONIC) {
            return {
                state: 'parasympathetic_dominant',
                description: '부교감 우세/피로 - 몸이 처지고 눈꺼풀이 무거움. 각성이 필요한 상태.',
                score: Math.max(0, p.pulseVariability * 2)
            };
        }
        return {
            state: 'balanced',
            description: '자율신경 균형 양호 - 학습에 최적화된 신체 상태.',
            score: Math.min(100, 50 + p.pulseVariability)
        };
    } else {
        // HRV/의학적 모드: SNS/PNS 비율로 판단
        const snsRatio = hrv.sns;
        const pnsRatio = hrv.pns;

        if (snsRatio > 60 || (snsRatio > pnsRatio && snsRatio > 50)) {
            return {
                state: 'sympathetic_dominant',
                description: '교감신경 우세 - 심박수가 빠르고 호흡이 얕음. 에너지가 높지만 지속하기 어려움.',
                score: Math.max(0, 100 - snsRatio)
            };
        } else if (pnsRatio > 60 || hrv.fatigue > 60) {
            return {
                state: 'parasympathetic_dominant',
                description: '부교감 우세/피로 - 나른하고 무기력함. 뇌를 깨워야 함.',
                score: Math.max(0, 100 - hrv.fatigue)
            };
        }
        return {
            state: 'balanced',
            description: '자율신경 균형 양호 - 학습에 최적화된 신체 상태.',
            score: Math.min(100, hrv.vitality)
        };
    }
};

/**
 * Step 2: 정신 각성도 체크 (뇌파 및 집중도 필터)
 */
export const analyzeMentalArousal = (
    hrv: HRVData,
    isPortable: boolean
): { arousal: MentalArousal; description: string; score: number } => {
    if (isPortable) {
        // Portable 모드: 활력도와 스트레스로 추정
        const vitality = hrv.vitality || 50;
        const p = hrv.portableHrv;
        const stressIndex = p ? p.stressIndex : 50;

        if (vitality >= 70 && stressIndex < 40) {
            return {
                arousal: 'high_arousal',
                description: '높은 각성도 - 뇌의 연산 장치가 풀가동 중. 고난도 문제 해결에 적합.',
                score: vitality
            };
        } else if (vitality >= 50) {
            return {
                arousal: 'standard_arousal',
                description: '표준 각성도 - 일반적인 학습 상태. 규칙적인 학습이 적합.',
                score: vitality
            };
        } else if (vitality >= 30) {
            return {
                arousal: 'low_arousal',
                description: '낮은 각성도 - 정보 처리 여력 부족. 감상/암기 위주로 전환 필요.',
                score: vitality
            };
        }
        return {
            arousal: 'emergency',
            description: '응급 상태 - 뇌가 완전히 지침. 즉각적인 휴식이 필요.',
            score: vitality
        };
    } else {
        // HRV/의학적 모드: 뇌파와 집중도로 판단
        const concentrationLevel = hrv.concentrationLevel || 50;
        const brainScore = hrv.brainScore || 50;
        const dominantEEG = hrv.dominantEEG || [];

        // 고각성: M-Beta, Gamma 우세
        if (dominantEEG.includes('M-Beta') || dominantEEG.includes('Gamma')) {
            if (concentrationLevel >= 70) {
                return {
                    arousal: 'high_arousal',
                    description: '최고 각성 상태 - M-Beta/Gamma 우세로 딥워크 가능.',
                    score: concentrationLevel
                };
            }
        }

        // Theta 우세 = 졸음
        if (dominantEEG.includes('Theta')) {
            return {
                arousal: 'low_arousal',
                description: '졸음 상태 - Theta파 우세로 집중 유지 어려움.',
                score: Math.min(40, concentrationLevel)
            };
        }

        // Alpha 우세 = 이완된 집중
        if (dominantEEG.includes('Alpha')) {
            return {
                arousal: 'standard_arousal',
                description: '이완된 집중 - Alpha파 우세로 암기/복습에 최적.',
                score: Math.min(70, concentrationLevel)
            };
        }

        // 기본값
        if (concentrationLevel >= 60) {
            return {
                arousal: 'standard_arousal',
                description: '표준 각성 상태 - 일반적인 학습 가능.',
                score: concentrationLevel
            };
        }

        return {
            arousal: 'low_arousal',
            description: '낮은 각성 상태 - 뇌에 휴식이 필요.',
            score: concentrationLevel
        };
    }
};

/**
 * Step 3: 과목별 최상 공부법 결정
 * 신체 상태 + 정신 각성도 + Stress/Concentration Gauge를 종합
 */
export const determineSubjectStrategy = (
    physicalState: PhysicalState,
    mentalArousal: MentalArousal,
    stressState: 'high' | 'low',
    concentrationState: 'high' | 'low',
    careType: CareType
): { korean: IntegratedStudyRecommendation; math: IntegratedStudyRecommendation; english: IntegratedStudyRecommendation } => {

    // 수학 전략 결정
    let math: IntegratedStudyRecommendation;
    if (stressState === 'low' && mentalArousal === 'high_arousal') {
        math = {
            title: '수학 딥워크 (Deep Work)',
            mode: 'deep_work',
            method: '외부 자극을 100% 차단하고 한 문제에 30분 이상 몰입합니다.',
            reason: '수학은 논리적 인과관계가 끊기면 안 되므로, 뇌파가 가장 안정적이고 강력할 때 해야 합니다.',
            tips: [
                '킬러 문항/4점짜리 고난도 문제 정면 돌파',
                '새로운 유형에 도전하여 뇌에 강한 자극',
                '답지 안 보고 끝까지 고민',
                '풀이 과정을 "생각의 흐름" 단위로 상세 기록'
            ]
        };
    } else if (physicalState === 'sympathetic_dominant' && stressState === 'high') {
        math = {
            title: '수학 타임어택 (Speed Practice)',
            mode: 'structured_output',
            method: '쉬운 문제 위주로 빠르게 풀어 에너지를 배출합니다.',
            reason: '긴장 상태의 높은 에너지를 생산적으로 활용하여 성취감을 쌓습니다.',
            tips: [
                '3점 문제 10분 타임어택',
                '이미 아는 유형 반복으로 효능감 회복',
                '계산 과정 반드시 기록 (암산 실수 방지)',
                '풀이 후 펜 내려놓고 30초 호흡'
            ]
        };
    } else if (physicalState === 'parasympathetic_dominant' || mentalArousal === 'low_arousal') {
        math = {
            title: '수학 워밍업 (Warm-up)',
            mode: 'active_input',
            method: '서서 기초 연산부터 시작하여 뇌를 예열합니다.',
            reason: '나른한 상태에서 복잡한 문제는 좌절감만 가져옵니다. 손을 움직여 뇌를 깨우세요.',
            tips: [
                '단순 연산 10문제로 손 예열',
                '공식 베껴쓰기로 촉각 자극',
                '서서 또는 걸으며 풀기',
                '15분 후 고난도 도전 가능'
            ]
        };
    } else if (mentalArousal === 'emergency') {
        math = {
            title: '수학 휴식 (Recovery)',
            mode: 'recovery',
            method: '15분 파워냅 후 재진단을 권장합니다.',
            reason: '현재 상태에서 수학은 효율이 10% 이하입니다. 휴식 후 다시 도전하세요.',
            tips: [
                '15분 파워냅 (20분 초과 금지)',
                '시원한 물 한 잔',
                '가벼운 스트레칭 후 재시작',
                '억지로 풀지 말 것'
            ]
        };
    } else {
        math = {
            title: '수학 정규 학습 (Standard)',
            mode: 'structured_output',
            method: '유형별 문제 풀이와 오답 분석을 진행합니다.',
            reason: '표준적인 상태에서는 규칙적인 학습이 가장 효과적입니다.',
            tips: [
                '뽀모도로 25분 집중/5분 휴식',
                '오답 노트 정리',
                '개념-유형-심화 순서',
                '3문제 풀고 1문제 복습'
            ]
        };
    }

    // 국어 전략 결정
    let korean: IntegratedStudyRecommendation;
    if (physicalState === 'sympathetic_dominant' && concentrationState === 'high') {
        korean = {
            title: '국어 비문학 뽀모도로 (Non-fiction Sprint)',
            mode: 'structured_output',
            method: '25분간 지문의 정보를 "사냥하듯" 구조도를 그리며 읽습니다.',
            reason: '적당한 긴장(H-Beta)은 정보의 우선순위를 가려내는 속도를 높여줍니다.',
            tips: [
                '펜 끝으로 문장 짚으며 읽기',
                '접속어/정의/인과관계에 표시',
                '한 단락마다 핵심 단어 요약',
                '선지 분석 후 근거 찾기'
            ]
        };
    } else if (mentalArousal === 'high_arousal' && stressState === 'low') {
        korean = {
            title: '국어 고난도 비문학 (Advanced Reading)',
            mode: 'deep_work',
            method: '철학/경제/과학 등 정보 밀도가 높은 지문을 집중 분석합니다.',
            reason: '최고 각성 상태에서는 복잡한 논리 구조도 해석 가능합니다.',
            tips: [
                '구조도(Structure Map) 그리며 읽기',
                '문단 간 유기적 연결 찾기',
                '30분 이상 한 지문에 몰입',
                '선지별 근거를 지문에서 표시'
            ]
        };
    } else if (physicalState === 'parasympathetic_dominant' || mentalArousal === 'low_arousal') {
        korean = {
            title: '국어 문학 감상 (Literature Appreciation)',
            mode: 'active_input',
            method: '소설의 장면을 상상하거나 시의 운율을 느끼며 읽습니다.',
            reason: 'Alpha파(이완) 상태에서는 시각화와 장기 기억 인출이 더 원활해집니다.',
            tips: [
                '장면을 영화처럼 시각화',
                '소리 내어 읽기',
                '인물 심리에 공감하며 읽기',
                '펜으로 짚으며 집중 유지'
            ]
        };
    } else if (mentalArousal === 'emergency') {
        korean = {
            title: '국어 가벼운 복습 (Light Review)',
            mode: 'passive_exposure',
            method: '이미 학습한 작품 줄거리만 가볍게 훑습니다.',
            reason: '새로운 지문은 부담됩니다. 익숙한 내용으로 뇌를 유지하세요.',
            tips: [
                '문학 작품 요약본 읽기',
                '암기 카드 넘기기',
                '인강 가볍게 시청',
                '무리하지 말고 휴식 고려'
            ]
        };
    } else {
        korean = {
            title: '국어 균형 학습 (Balanced Study)',
            mode: 'structured_output',
            method: '문학 1지문 + 비문학 1지문 교차 학습합니다.',
            reason: '표준 상태에서는 다양한 유형을 균형있게 학습하세요.',
            tips: [
                '문학으로 워밍업 후 비문학',
                '25분 단위 세션',
                '선지 분석력 훈련',
                '오답 근거 정리'
            ]
        };
    }

    // 영어 전략 결정
    let english: IntegratedStudyRecommendation;
    if (physicalState === 'sympathetic_dominant') {
        english = {
            title: '영어 스피드 암기 (Speed Vocabulary)',
            mode: 'structured_output',
            method: '단어를 1초 내로 인출하는 스피드 퀴즈 형식으로 진행합니다.',
            reason: '긴장 상태의 에너지를 빠른 암기로 배출합니다.',
            tips: [
                '가리고 맞히기 1초 인출',
                '소리 내어 강하게 발음',
                '못 맞추면 체크 후 넘기기',
                '듣기 1.2배속으로 집중'
            ]
        };
    } else if (mentalArousal === 'high_arousal' && concentrationState === 'high') {
        english = {
            title: '영어 구문 분석 딥워크 (Syntax Deep Work)',
            mode: 'deep_work',
            method: '복잡한 문장 구조를 꼼꼼히 분석하며 정확한 해석력을 기릅니다.',
            reason: '최고 집중 상태에서 복잡한 구문 분석이 가장 효과적입니다.',
            tips: [
                '주어/동사/수식어 사선으로 끊기',
                '핵심 동사 동그라미',
                '관계대명사/분사구문 집중',
                '논리 연결어 표시'
            ]
        };
    } else if (physicalState === 'parasympathetic_dominant' || mentalArousal === 'low_arousal') {
        english = {
            title: '영어 듣기/쉐도잉 (Listening & Shadowing)',
            mode: 'active_input',
            method: '쉐도잉과 듣기 흘려듣기로 뇌를 각성시킵니다.',
            reason: '입과 귀를 사용하면 나른한 뇌가 활성화됩니다.',
            tips: [
                '원어민 따라 0.5초 뒤 말하기',
                '배속 1.1-1.2배로 긴장감',
                '크게 발음하며 낭독',
                '플래시카드 앱으로 단어'
            ]
        };
    } else if (mentalArousal === 'emergency') {
        english = {
            title: '영어 흘려듣기 (Passive Listening)',
            mode: 'passive_exposure',
            method: '영어 라디오나 팟캐스트를 배경음악처럼 틀어놓습니다.',
            reason: '무의식적 노출도 학습입니다. 무리하지 마세요.',
            tips: [
                '영어 뉴스 틀어놓기',
                '팝송 가사 흘려듣기',
                '쉬운 미드 자막 없이',
                '에너지 회복이 우선'
            ]
        };
    } else {
        english = {
            title: '영어 통합 학습 (Integrated Study)',
            mode: 'structured_output',
            method: '단어 암기 + 독해 + 듣기 균형있게 진행합니다.',
            reason: '표준 상태에서는 다양한 영역을 교차 학습하세요.',
            tips: [
                '단어 15분 → 독해 20분 → 듣기 15분',
                '끊어 읽기 연습',
                '모르는 단어 표시 후 진행',
                '해설 확인 전 스스로 해석'
            ]
        };
    }

    return { korean, math, english };
};

/**
 * 통합 학습 최적화 분석 메인 함수
 */
export const generateIntegratedAssessment = (
    hrv: HRVData,
    careType: CareType,
    isPortable: boolean
): IntegratedAssessment => {
    // Step 1: 신체 상태 체크
    const physical = analyzePhysicalState(hrv, isPortable);

    // Step 2: 정신 각성도 체크
    const mental = analyzeMentalArousal(hrv, isPortable);

    // Stress & Concentration 상태 분석
    const stressIndex = isPortable && hrv.portableHrv ? hrv.portableHrv.stressIndex : hrv.physicalStress || 50;
    const concentrationLevel = !isPortable ? hrv.concentrationLevel || 50 : 50;
    const dominantEEG = !isPortable ? hrv.dominantEEG : [];
    const currentState = analyzeCurrentState(stressIndex, concentrationLevel, dominantEEG);

    // EEG 타입 결정 (HRV/의학적 모드만)
    let eegType: DominantEEGType | undefined;
    if (!isPortable) {
        eegType = determineDominantEEGType(
            hrv.eegGamma || 0,
            hrv.eegHBeta || 0,
            hrv.eegMBeta || 0,
            hrv.eegLBeta || 0,
            hrv.eegAlpha || 0,
            hrv.eegTheta || 0
        );
    }

    // Step 3: 과목별 전략 결정
    const strategies = determineSubjectStrategy(
        physical.state,
        mental.arousal,
        currentState.stressState,
        currentState.concentrationState,
        careType
    );

    // 점수 계산
    const vitalityScore = hrv.vitality || 50;
    const fatigueScore = hrv.fatigue || 50;
    const stressScore = stressIndex;
    const concentrationScore = concentrationLevel;

    // 우선순위 과목 결정
    let prioritySubject: 'korean' | 'math' | 'english';
    if (mental.arousal === 'high_arousal' && currentState.stressState === 'low') {
        prioritySubject = 'math'; // 최고 상태에서 수학 추천
    } else if (physical.state === 'sympathetic_dominant') {
        prioritySubject = 'korean'; // 긴장 상태에서 국어 비문학 추천
    } else if (physical.state === 'parasympathetic_dominant') {
        prioritySubject = 'english'; // 나른할 때 영어 듣기/쉐도잉
    } else {
        prioritySubject = 'math'; // 기본값
    }

    // 경고 메시지
    let warningMessage: string | undefined;
    if (mental.arousal === 'emergency') {
        warningMessage = '🚨 현재 에너지가 심각하게 부족합니다. 15분 휴식 또는 낮잠 후 다시 진단받으세요.';
    } else if (fatigueScore >= 80) {
        warningMessage = '⚠️ 피로도가 매우 높습니다. 무리한 학습은 역효과를 낳습니다.';
    } else if (stressScore >= 70 && mental.arousal === 'low_arousal') {
        warningMessage = '⚠️ 스트레스가 높지만 에너지가 부족합니다. 복잡한 학습보다 가벼운 복습을 권장합니다.';
    }

    // 종합 요약 생성
    let overallSummary: string;
    if (mental.arousal === 'high_arousal' && currentState.stressState === 'low') {
        overallSummary = `🎯 **최적 학습 상태!** 뇌가 가장 활발한 지금, **${strategies.math.title}**로 킬러 문항에 도전하세요. 외부 자극을 차단하고 50분 이상 딥워크에 집중하면 최고의 성과를 낼 수 있습니다.`;
    } else if (physical.state === 'sympathetic_dominant') {
        overallSummary = `⚡ **에너지 활용 모드!** 긴장 상태의 높은 에너지를 생산적으로 활용하세요. **${strategies.korean.title}**가 가장 적합하며, 25분 뽀모도로로 빠르게 성과를 내세요.`;
    } else if (physical.state === 'parasympathetic_dominant') {
        overallSummary = `🌙 **각성 필요!** 나른한 상태에서는 먼저 뇌를 깨워야 합니다. **${strategies.english.title}**로 입과 귀를 사용해 각성한 후 다른 과목에 도전하세요.`;
    } else if (mental.arousal === 'emergency') {
        overallSummary = `💤 **휴식 권장!** 현재 상태에서 학습은 비효율적입니다. 15분 파워냅 후 다시 시작하거나, 가벼운 정리 작업만 하세요.`;
    } else {
        overallSummary = `📚 **표준 학습 모드!** 균형 잡힌 상태입니다. **${strategies[prioritySubject].title}**부터 시작해 뽀모도로 기법(25분 집중/5분 휴식)으로 규칙적인 학습을 진행하세요.`;
    }

    return {
        physicalState: physical.state,
        physicalStateDescription: physical.description,
        mentalArousal: mental.arousal,
        mentalArousalDescription: mental.description,
        ansScore: physical.score,
        vitalityScore,
        fatigueScore,
        stressScore,
        concentrationScore,
        eegType,
        koreanRecommendation: strategies.korean.mode,
        mathRecommendation: strategies.math.mode,
        englishRecommendation: strategies.english.mode,
        koreanStrategy: formatStrategy(strategies.korean),
        mathStrategy: formatStrategy(strategies.math),
        englishStrategy: formatStrategy(strategies.english),
        overallSummary,
        prioritySubject,
        warningMessage
    };
};

/**
 * 전략을 마크다운 형식으로 포맷
 */
const formatStrategy = (recommendation: IntegratedStudyRecommendation): string => {
    return `### ${recommendation.title}

**방법**: ${recommendation.method}

**이유**: ${recommendation.reason}

**실천 팁**:
${recommendation.tips.map(tip => `• ${tip}`).join('\n')}`;
};

/**
 * 통합 공부법 선택 매트릭스 생성
 */
export const generateStudyMatrix = (): string => {
    return `## 📊 통합 공부법 선택 매트릭스

| 신체 에너지 | 정신 각성도 | 추천 과목 | 추천 공부법 |
|------------|-----------|----------|------------|
| High (교감) | High | 수학 킬러 / 과학 | 50분 딥 워크 (논리 정면 돌파) |
| High (긴장) | Medium | 국어 비문학 / 영어 | 25분 뽀모도로 (구조 분석) |
| Low (나른) | High | 국어 문학 / 탐구 암기 | 시각화 및 백지 복습 (이미지화) |
| Low (지침) | Low | 단순 연산 / 필사 | 서서 하기 또는 15분 낮잠 후 재진단 |`;
};

/**
 * 3분 예열 법칙 가이드 생성
 */
export const generateWarmupGuide = (): string => {
    return `## 💡 3분 예열 법칙

어떤 상태인지 잘 모르겠다면 **3분 동안 테스트**해보세요:

**수학 테스트**: 공식 3개를 백지에 증명해보기
**국어 테스트**: 지문 한 문단을 3줄로 요약해보기

**결과 해석**:
- ✅ 막힘없이 써진다 → **수학 킬러로 바로 진입!**
- ⚠️ 펜 끝이 머뭇거린다 → **암기나 요약부터 시작해 뇌를 가열하세요**
- ❌ 아무 생각이 안 난다 → **15분 휴식 후 재시도**`;
};
