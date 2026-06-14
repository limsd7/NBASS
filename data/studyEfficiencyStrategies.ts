/**
 * 공부 효율성 검사 결과에 따른 CareType별 맞춤 학습 전략
 * 5가지 검사 결과를 12가지 CareType과 연동하여 통합 솔루션 제공
 */

import { CareType } from '../types';
import {
    ChronotypeResult,
    VARKResult,
    TAIResult,
    DigitalAddictionResult,
    MetacognitionResult,
    CHRONOTYPE_DESCRIPTIONS,
    VARK_DESCRIPTIONS,
    TAI_INTERVENTIONS,
    DIGITAL_DETOX_PROTOCOLS,
    METACOGNITION_RECOMMENDATIONS
} from './studyEfficiencyAssessments';

// 크로노타입 + CareType 통합 전략
export const getChronotypeStrategyByCareType = (
    chronotype: ChronotypeResult,
    careType: CareType
): { schedule: string; warning: string; optimization: string } => {
    const baseInfo = CHRONOTYPE_DESCRIPTIONS[chronotype];

    const careTypeModifiers: Record<CareType, { scheduleNote: string; warningNote: string }> = {
        [CareType.BURNOUT]: {
            scheduleNote: '골든타임에 고난도 과목을 배치하되, 1시간 이상 연속 학습은 피하세요.',
            warningNote: '에너지 고갈 상태에서는 골든타임도 짧아질 수 있습니다. 컨디션에 따라 유연하게 조정하세요.'
        },
        [CareType.ADRENAL]: {
            scheduleNote: '코르티솔 리듬이 불안정하므로 오전 10-12시 사이가 가장 안전합니다.',
            warningNote: '아침형이어도 기상 직후 2시간은 힘들 수 있습니다. 억지로 새벽 공부하지 마세요.'
        },
        [CareType.STRESS_OVERLOAD]: {
            scheduleNote: '스트레스가 높은 시간대를 파악하여 그 시간은 휴식에 할애하세요.',
            warningNote: '저녁 시간 불안이 높다면 새로운 학습 대신 복습을 배치하세요.'
        },
        [CareType.SLEEP]: {
            scheduleNote: '수면 부족 시에는 원래 골든타임보다 1-2시간 늦게 집중력이 올라옵니다.',
            warningNote: '오후 2-4시 졸음이 극심하면 15분 파워냅 후 재개하세요.'
        },
        [CareType.ANXIETY_TENSION]: {
            scheduleNote: '불안이 낮은 시간대에 어려운 과목을 배치하세요.',
            warningNote: '시험 직전 시간대는 새로운 학습보다 아는 것 확인에 쓰세요.'
        },
        [CareType.LOW_ENERGY]: {
            scheduleNote: '에너지 피크 시간에 핵심 학습, 나머지는 가벼운 복습으로.',
            warningNote: '저에너지 상태에서는 10분 단위로 시작해 점진적으로 늘리세요.'
        },
        [CareType.DEPRESSION_AMOTIVATION]: {
            scheduleNote: '동기가 조금이라도 있는 시간에 집중하고, 나머지는 루틴 유지에 쓰세요.',
            warningNote: '혼자 있는 시간에 공부하기 어려우면 카페/도서관을 활용하세요.'
        },
        [CareType.BRAIN_FATIGUE]: {
            scheduleNote: '뇌가 가장 회복된 시간(주로 기상 후 2-3시간)에 핵심 학습.',
            warningNote: '뇌피로 상태에서는 골든타임이 평소보다 짧습니다. 40분 단위로 휴식하세요.'
        },
        [CareType.HYPERSENSITIVE]: {
            scheduleNote: '주변 자극이 적은 시간대에 집중 학습을 배치하세요.',
            warningNote: '저녁형이어도 밤 11시 이후는 과민 반응이 증가할 수 있습니다.'
        },
        [CareType.ATTENTION_DEFICIT]: {
            scheduleNote: '약물 복용자라면 약효가 최대인 시간에 맞춰 핵심 학습.',
            warningNote: '산만함이 심한 시간대에는 짧은 세션(15-20분)으로 운영하세요.'
        },
        [CareType.CIRCULATION]: {
            scheduleNote: '혈류가 좋은 시간(가벼운 운동 후)에 학습 효율이 높아집니다.',
            warningNote: '오래 앉아있으면 순환이 떨어지므로 50분마다 움직이세요.'
        },
        [CareType.HEALTHY]: {
            scheduleNote: '골든타임에 고난도, 저효율 시간에 복습을 배치하면 최적화됩니다.',
            warningNote: '현재 상태를 유지하면서 수면 패턴 일관성을 지키세요.'
        },
        [CareType.CONCENTRATION]: {
            scheduleNote: '집중력이 가장 높은 시간에 어려운 과목을 몰아서 배치하세요.',
            warningNote: '집중력 저하 시간에는 억지로 하지 말고 휴식 후 재개하세요.'
        },
        [CareType.UNASSESSED]: {
            scheduleNote: '먼저 2주간 학습 시간대별 효율을 기록해보세요.',
            warningNote: '데이터 수집 후 맞춤 전략을 수립할 수 있습니다.'
        }
    };

    const modifier = careTypeModifiers[careType] || careTypeModifiers[CareType.HEALTHY];

    return {
        schedule: `**${baseInfo.label}** 골든타임: ${baseInfo.goldenTime}\n\n${modifier.scheduleNote}`,
        warning: modifier.warningNote,
        optimization: baseInfo.studyAdvice
    };
};

// VARK + CareType 통합 전략
export const getVARKStrategyByCareType = (
    vark: VARKResult,
    careType: CareType,
    subject: 'korean' | 'math' | 'english'
): { method: string; careTypeNote: string } => {
    const baseInfo = VARK_DESCRIPTIONS[vark.primary];
    const subjectTip = baseInfo.subjectTips[subject];

    const careTypeNotes: Record<CareType, string> = {
        [CareType.BURNOUT]: '에너지가 부족하므로 가장 편한 학습 방식에 집중하세요. 새로운 방법을 시도할 여력이 없습니다.',
        [CareType.ADRENAL]: '에너지 변동이 크므로 활력이 있을 때 능동적 방법, 없을 때 수동적 방법을 사용하세요.',
        [CareType.STRESS_OVERLOAD]: '손을 움직이는 학습(쓰기, 문제풀이)이 불안 분산에 효과적입니다.',
        [CareType.SLEEP]: '졸음이 올 때는 능동적 방법(서서 공부, 소리내어 읽기)으로 전환하세요.',
        [CareType.ANXIETY_TENSION]: '불안할 때는 손으로 쓰면서 공부하면 집중이 잘 됩니다.',
        [CareType.LOW_ENERGY]: '가장 적은 에너지로 효과적인 방법을 선택하세요. 무리한 방법 전환은 피로를 가중시킵니다.',
        [CareType.DEPRESSION_AMOTIVATION]: '혼자 읽기보다 강의 듣기, 함께 공부하기가 동기 유지에 도움됩니다.',
        [CareType.BRAIN_FATIGUE]: '복잡한 방법보다 단순한 방법(반복 읽기, 듣기)으로 부담을 줄이세요.',
        [CareType.HYPERSENSITIVE]: '자극이 적은 방법(조용히 읽기)이 과민 반응을 줄입니다.',
        [CareType.ATTENTION_DEFICIT]: '여러 감각을 동시에 사용하면 집중 유지에 도움됩니다.',
        [CareType.CIRCULATION]: '앉아서 읽기보다 걸으면서 듣기, 서서 쓰기가 순환에 좋습니다.',
        [CareType.HEALTHY]: '주요 학습 방식을 유지하면서 부족한 영역을 보완하세요.',
        [CareType.CONCENTRATION]: '가장 집중이 잘 되는 방식에 올인하세요.',
        [CareType.UNASSESSED]: '다양한 방법을 시도해보고 효과적인 것을 찾으세요.'
    };

    return {
        method: `**${baseInfo.label}**\n\n**${subject === 'korean' ? '국어' : subject === 'math' ? '수학' : '영어'} 공부법:**\n${subjectTip}`,
        careTypeNote: careTypeNotes[careType] || careTypeNotes[CareType.HEALTHY]
    };
};

// 시험 불안 + CareType 통합 전략
export const getTestAnxietyStrategyByCareType = (
    tai: TAIResult,
    careType: CareType
): { intervention: string; examDayTip: string } => {
    const baseInfo = TAI_INTERVENTIONS[tai.dominantType];

    const careTypeExamTips: Record<CareType, string> = {
        [CareType.BURNOUT]: '시험 당일 80% 컨디션으로 충분합니다. 완벽 포기가 오히려 좋은 결과를 가져옵니다.',
        [CareType.ADRENAL]: '혈당 안정을 위해 시험 중간 간식(견과류)을 준비하세요.',
        [CareType.STRESS_OVERLOAD]: '그라운딩 기법(발바닥 감각 집중)으로 현재에 머무르세요.',
        [CareType.SLEEP]: '수면 부족 시 시험 직전 5분간 눈을 감고 휴식하세요.',
        [CareType.ANXIETY_TENSION]: '손바닥 합장 10초 힘주기로 긴장 에너지를 방출하세요.',
        [CareType.LOW_ENERGY]: '시험장 도착 후 가볍게 몸을 움직여 각성도를 높이세요.',
        [CareType.DEPRESSION_AMOTIVATION]: '시험장에 온 것 자체가 성공입니다. 스스로를 격려하세요.',
        [CareType.BRAIN_FATIGUE]: '어려운 문제는 과감히 넘기고 아는 문제에 집중하세요.',
        [CareType.HYPERSENSITIVE]: '시험장 소음이 신경 쓰이면 귀마개 사용을 고려하세요.',
        [CareType.ATTENTION_DEFICIT]: '시험 시작 전 문제 전체를 훑어 계획을 세우세요.',
        [CareType.CIRCULATION]: '시험 중간 발끝 움직이기로 혈류를 유지하세요.',
        [CareType.HEALTHY]: '평소 연습한 루틴을 그대로 실행하세요.',
        [CareType.CONCENTRATION]: '첫 문제에 너무 오래 매달리지 말고 흐름을 타세요.',
        [CareType.UNASSESSED]: '차분하게 호흡하고 아는 문제부터 푸세요.'
    };

    return {
        intervention: `**${baseInfo.label}**\n\n${baseInfo.description}\n\n**대처 전략:**\n${baseInfo.strategies.map(s => `• ${s}`).join('\n')}`,
        examDayTip: `**시험 당일 팁:** ${careTypeExamTips[careType] || careTypeExamTips[CareType.HEALTHY]}\n\n${baseInfo.examDayTips.map(t => `• ${t}`).join('\n')}`
    };
};

// 디지털 중독 + CareType 통합 전략
export const getDigitalDetoxStrategyByCareType = (
    digital: DigitalAddictionResult,
    careType: CareType
): { protocol: string; studyMethod: string } => {
    const baseInfo = DIGITAL_DETOX_PROTOCOLS[digital.level];

    const careTypeStudyMethods: Record<CareType, string> = {
        [CareType.BURNOUT]: '에너지 부족으로 폰 유혹에 더 취약합니다. 물리적으로 격리하고 10분 단위 학습.',
        [CareType.ADRENAL]: '도파민 조절이 회복의 핵심입니다. 숏폼 앱 삭제를 강력히 권장합니다.',
        [CareType.STRESS_OVERLOAD]: '스트레스 해소를 폰에 의존하지 마세요. 산책이나 호흡법으로 대체.',
        [CareType.SLEEP]: '취침 1시간 전 폰 금지가 수면 개선의 시작입니다.',
        [CareType.ANXIETY_TENSION]: '불안할 때 폰을 찾으면 일시적 안도 후 더 불안해집니다. 호흡법으로 대체.',
        [CareType.LOW_ENERGY]: '에너지 없을 때 폰이 "휴식"처럼 느껴지지만 실제로는 뇌를 더 피로하게 합니다.',
        [CareType.DEPRESSION_AMOTIVATION]: 'SNS 비교가 우울을 악화시킵니다. 사람과 직접 만나는 것이 회복에 효과적.',
        [CareType.BRAIN_FATIGUE]: '뇌가 지쳤을 때 폰은 추가 피로를 줍니다. 눈 감고 휴식이 진짜 휴식.',
        [CareType.HYPERSENSITIVE]: '알림 소리와 진동이 과민을 자극합니다. 방해금지 모드 상시 사용.',
        [CareType.ATTENTION_DEFICIT]: '디지털 자극이 주의력을 더 산만하게 만듭니다. 앱 타이머 강제 설정.',
        [CareType.CIRCULATION]: '폰 사용 = 오래 앉아있기. 폰 사용 시간만큼 움직이기.',
        [CareType.HEALTHY]: '현재 통제력을 유지하면서 공부 시간에는 폰 격리 습관화.',
        [CareType.CONCENTRATION]: '집중하려면 폰을 다른 방에 두세요. 눈에 보이면 신경 쓰입니다.',
        [CareType.UNASSESSED]: '먼저 1주일간 스크린 타임을 기록해보세요.'
    };

    return {
        protocol: `**${baseInfo.label}**\n\n${baseInfo.description}\n\n${digital.dopamineStatus}\n\n**디톡스 프로토콜:**\n${baseInfo.protocols.map(p => `• ${p}`).join('\n')}`,
        studyMethod: `**맞춤 학습법:** ${baseInfo.studyMethod}\n\n**유형별 추가 조언:** ${careTypeStudyMethods[careType] || careTypeStudyMethods[CareType.HEALTHY]}`
    };
};

// 메타인지 + CareType 통합 전략
export const getMetacognitionStrategyByCareType = (
    meta: MetacognitionResult,
    careType: CareType
): { upgrade: string; immediateAction: string } => {
    const baseInfo = METACOGNITION_RECOMMENDATIONS[meta.learnerLevel];

    const careTypeActions: Record<CareType, string> = {
        [CareType.BURNOUT]: '지금은 새로운 학습법 도전보다 기존 방법 유지가 우선입니다. 회복 후 업그레이드.',
        [CareType.ADRENAL]: '에너지가 있을 때 정교화/조직화 전략, 없을 때 단순 복습.',
        [CareType.STRESS_OVERLOAD]: '복잡한 전략보다 "아는 것 확인"에 집중하세요.',
        [CareType.SLEEP]: '수면 부족 시 새로운 전략 실행이 어렵습니다. 기본에 충실.',
        [CareType.ANXIETY_TENSION]: '완벽한 전략보다 "시작하기"가 더 중요합니다.',
        [CareType.LOW_ENERGY]: '가장 적은 노력으로 효과적인 전략만 사용하세요.',
        [CareType.DEPRESSION_AMOTIVATION]: '전략보다 "매일 조금이라도 하기"가 핵심입니다.',
        [CareType.BRAIN_FATIGUE]: '인지 부하를 줄이는 방향으로 전략을 단순화하세요.',
        [CareType.HYPERSENSITIVE]: '조용한 환경에서 깊은 사고 전략이 효과적입니다.',
        [CareType.ATTENTION_DEFICIT]: '체계적 조직화 전략이 산만함을 줄이는 데 핵심입니다.',
        [CareType.CIRCULATION]: '움직이면서 공부하는 전략(서서 설명하기 등)이 효과적.',
        [CareType.HEALTHY]: '현재 수준에서 한 단계 업그레이드에 도전하세요.',
        [CareType.CONCENTRATION]: '메타인지 점검 루틴을 도입해 집중 여부를 스스로 확인.',
        [CareType.UNASSESSED]: '다양한 학습 전략을 시도해보고 효과를 기록하세요.'
    };

    return {
        upgrade: `**${baseInfo.label}**\n\n${baseInfo.description}\n\n**업그레이드 전략:**\n${baseInfo.upgradeStrategies.map(s => `• ${s}`).join('\n')}`,
        immediateAction: `**즉시 실천:**\n${baseInfo.immediateActions.map(a => `• ${a}`).join('\n')}\n\n**유형별 조언:** ${careTypeActions[careType] || careTypeActions[CareType.HEALTHY]}`
    };
};

// 통합 리포트 생성
export const generateIntegratedStudyEfficiencyReport = (
    results: {
        chronotype?: { score: number; result: ChronotypeResult };
        vark?: VARKResult;
        testAnxiety?: TAIResult;
        digitalAddiction?: DigitalAddictionResult;
        metacognition?: MetacognitionResult;
    },
    careType: CareType,
    isPortableMode: boolean = false
): string => {
    const sections: string[] = [];

    sections.push(`## 📊 공부 효율성 정밀 분석 리포트\n`);
    sections.push(`**진단 유형:** ${careType}\n`);

    if (results.chronotype) {
        const strategy = getChronotypeStrategyByCareType(results.chronotype.result, careType);
        sections.push(`\n### 🌅 크로노타입 (생체 리듬)\n`);
        sections.push(strategy.schedule);
        sections.push(`\n⚠️ ${strategy.warning}`);
        sections.push(`\n✅ ${strategy.optimization}`);
    }

    if (results.vark) {
        sections.push(`\n### 🎯 학습 감각 유형 (VARK)\n`);
        const koreanStrategy = getVARKStrategyByCareType(results.vark, careType, 'korean');
        const mathStrategy = getVARKStrategyByCareType(results.vark, careType, 'math');
        const englishStrategy = getVARKStrategyByCareType(results.vark, careType, 'english');
        sections.push(`**주요 유형:** ${VARK_DESCRIPTIONS[results.vark.primary].label}\n`);
        sections.push(`\n📖 **국어:** ${VARK_DESCRIPTIONS[results.vark.primary].subjectTips.korean}`);
        sections.push(`\n📐 **수학:** ${VARK_DESCRIPTIONS[results.vark.primary].subjectTips.math}`);
        sections.push(`\n🌐 **영어:** ${VARK_DESCRIPTIONS[results.vark.primary].subjectTips.english}`);
        sections.push(`\n💡 ${koreanStrategy.careTypeNote}`);
    }

    if (results.testAnxiety) {
        const strategy = getTestAnxietyStrategyByCareType(results.testAnxiety, careType);
        sections.push(`\n### 😰 시험 불안 분석\n`);
        sections.push(strategy.intervention);
        sections.push(`\n${strategy.examDayTip}`);
    }

    if (results.digitalAddiction) {
        const strategy = getDigitalDetoxStrategyByCareType(results.digitalAddiction, careType);
        sections.push(`\n### 📱 디지털 의존도\n`);
        sections.push(strategy.protocol);
        sections.push(`\n${strategy.studyMethod}`);
    }

    if (results.metacognition) {
        const strategy = getMetacognitionStrategyByCareType(results.metacognition, careType);
        sections.push(`\n### 🧠 메타인지 학습 전략\n`);
        sections.push(strategy.upgrade);
        sections.push(`\n${strategy.immediateAction}`);
    }

    return sections.join('\n');
};
