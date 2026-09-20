
import { StudentInfo, HRVData, SurveyData, ProtocolData, LearningAnalyticsData, BloodTestData, CareType } from '../types';

interface ConsultationScriptData {
    student: StudentInfo;
    hrv: HRVData;
    survey: SurveyData;
    protocol: ProtocolData;
    analytics: LearningAnalyticsData;
    bloodTest?: BloodTestData;
}

// Helper to get CareType specific advice
const getCareTypeAdvice = (careType: CareType, strategy: 'truce' | 'sleep' | 'exam' | 'dopamine' | 'nutrition'): string => {
    // Basic mapping of CareType to specific advice nuances
    const ADVICE_MAP: Record<CareType, Record<string, string>> = {
        [CareType.BURNOUT]: {
            truce: "특히 학생은 '번아웃(Burnout)' 유형이라 에너지가 고갈되면 회복 탄력성이 현저히 떨어집니다. 억지 공부는 독입니다.",
            sleep: "번아웃 유형에게 잠은 단순 휴식이 아니라 '생명 유지 장치'입니다. 수면 시간을 줄이면 뇌 기능이 셧다운됩니다.",
            exam: "시험 중 멘탈 붕괴가 가장 쉽게 오는 유형입니다. ",
            dopamine: "번아웃 상태에서는 도파민 보상 회로가 망가져 있어 숏폼 중독에 더 취약합니다.",
            nutrition: "부신 기능 저하로 인한 만성 피로가 의심되므로 비타민C와 마그네슘 섭취가 필수입니다."
        },
        [CareType.ADRENAL]: {
            truce: "부신 기능이 저하된 상태라 '의지력'으로 버티는 데 한계가 있습니다.",
            sleep: "부신 피로 회복의 골든타임인 밤 10시-새벽 2시 수면을 놓치면 어떤 약도 소용없습니다.",
            exam: "시험 불안보다는 체력 저하로 인한 후반부 집중력 감소가 치명적입니다.",
            dopamine: "작은 자극에도 신경계가 과민 반응하므로 스마트폰 불빛 자체가 스트레스입니다.",
            nutrition: "카페인은 금물입니다. 대신 소금물과 양질의 단백질 섭취가 그 어떤 공부법보다 중요합니다."
        },
        [CareType.BRAIN_FATIGUE]: {
            truce: "뇌 피로도가 한계치입니다. 지금은 정보가 입력되는 게 아니라 뇌세포가 비명을 지르는 중입니다.",
            sleep: "잠자는 동안에만 뇌 척수액이 뇌의 노폐물을 청소합니다. 잠을 줄이면 뇌에 쓰레기가 쌓입니다.",
            exam: "시험 시작 전 호흡과 이완으로 자율신경과 집중 상태를 안정시키지 않으면 아는 문제도 틀립니다.",
            dopamine: "디지털 기기의 블루라이트는 뇌 피로를 가중시키는 주범입니다.",
            nutrition: "뇌 에너지원인 포도당 공급을 위해 아침 식사를 거르면 절대 안 됩니다."
        },
        [CareType.ANXIETY_TENSION]: {
            truce: "불안도가 높아 스스로를 혹사시키는 경향이 있습니다. 억지로라도 쉬게 해야 성적이 오릅니다.",
            sleep: "불안해서 잠을 못 자는 악순환을 끊어야 합니다. 수면 전 이완 훈련이 공부보다 중요합니다.",
            exam: "교감신경이 과항진되어 있어 시험 때 머리가 하얗게 질릴 위험이 큽니다(Blackout).",
            dopamine: "불안을 잊으려고 스마트폰에 집착하지만, 이는 불안을 증폭시킬 뿐입니다.",
            nutrition: "신경 안정을 돕는 칼슘과 마그네슘(천연 신경안정제) 섭취가 시급합니다."
        },
        // ... Default fallback for others
    } as any;

    const defaultAdvice = {
        truce: "학생의 현재 상태를 고려할 때, 무리한 학습보다는 전략적 휴식이 더 큰 성과를 가져옵니다.",
        sleep: "충분한 수면 없이는 학습 효율을 기대하기 어렵습니다.",
        exam: "시험 당일 컨디션 관리가 실력 발휘의 열쇠입니다.",
        dopamine: "스마트폰 사용을 줄여 뇌의 휴식 시간을 확보해야 합니다.",
        nutrition: "균형 잡힌 영양 섭취가 집중력 유지의 기본입니다."
    };

    return (ADVICE_MAP[careType] && ADVICE_MAP[careType][strategy]) || defaultAdvice[strategy];
};

export const generateConsultationScripts = (data: ConsultationScriptData, careType: CareType): Record<string, string> => {
    const { student, hrv, survey, protocol, analytics, bloodTest } = data;

    // Advice snippets based on CareType
    const truceAdvice = getCareTypeAdvice(careType, 'truce');
    const sleepAdvice = getCareTypeAdvice(careType, 'sleep');
    const examAdvice = getCareTypeAdvice(careType, 'exam');
    const dopamineAdvice = getCareTypeAdvice(careType, 'dopamine');
    const nutritionAdvice = getCareTypeAdvice(careType, 'nutrition');

    // 1. 데이터 기반 평화 협정 (Data-Driven Truce)
    const vitality = hrv.vitality || 50;
    let truceScript = "";
    if (vitality <= 40) {
        truceScript = `현재 ${student.name} 학생의 Vitality(뇌 활력도)는 **${vitality}%**입니다. 이는 의학적으로 '생리적 방전(Physiological Exhaustion)' 상태를 의미합니다. 이 수치에서는 아무리 책상에 오래 앉아 있어도 정보가 뇌에 입력되지 않고 튕겨 나갑니다. 지금 억지로 공부를 시키는 것은 효율이 '0'에 수렴하는 고문과 같습니다. ${truceAdvice} 

반대로 00아, 네가 이전에 측정한 ${vitality + 20}% 구간을 볼래? 이때는 뇌가 충분히 일할 수 있는 상태였어. 이때 집중하지 않은 것은 너의 책임이 맞아. 우리 딱 정합시다. 이 앱이 심판입니다. Vitality가 40 이하로 떨어지면, 어머님도 절대 공부 터치 금지. 대신 60 이상일 땐 학생은 무조건 책상에 앉아 100% 효율을 뽑아내야 합니다. 이것이 우리가 맺을 '데이터 기반 평화 협정'입니다.`;
    } else {
        truceScript = `현재 ${student.name} 학생의 Vitality(뇌 활력도)는 **${vitality}%**로, 아직은 에너지가 남아있는 '가동 가능' 상태입니다. 하지만 방심은 금물입니다. ${truceAdvice} 어머님, 학생이 "힘들다"고 할 때 감정적으로 받아들이지 마시고 이 앱의 수치를 보세요. Vitality가 40 이하로 떨어지면 그때는 정말 쉬어야 할 때입니다. 

00아, 지금 네 뇌는 충분히 공부할 준비가 되어 있어. 지금 힘들다고 느끼는 건 뇌의 착각일 수 있어. 데이터는 네가 아직 달릴 수 있다고 말해주고 있거든. 우리 딱 정하자. Vitality가 60 이상인 지금 같은 구간에서는 '힘들다'는 핑계는 대지 않기로. 대신 정말로 수치가 바닥을 칠 때는 선생님이 먼저 쉬라고 할게. 우리는 막연한 감정이 아니라, 이 정확한 데이터(Vitality ${vitality}%)를 기준으로 공부와 휴식의 규칙을 정하는 거야.`;
    }

    // 2. 수면 아키텍처 재설계 (Sleep Architecture)
    const sleepHours = analytics.avgSleepHours || protocol.avgSleep || 6;
    const fatigue = hrv.fatigue || 50;
    const isi = survey.isi || 0;
    const efficiency = fatigue > 70 ? 50 : 80;
    const effectiveHours = (10 * efficiency) / 100;

    const sleepScript = `많은 학생들이 "잠을 줄여야 공부를 많이 한다"는 위험한 착각을 합니다. ${student.name} 학생의 데이터를 보세요. 현재 평균 수면 시간은 **${sleepHours}시간**이며, 수면 효율 척도(ISI)는 **${isi}점**입니다. 이로 인해 신체 피로도(Fatigue)가 **${fatigue}%**까지 치솟았습니다. 뇌과학적으로 분석하면, 지금 수면 부족 상태에서 10시간 앉아 있어봤자 효율이 ${efficiency}% 미만이라 실제 공부량은 **${effectiveHours}시간**도 채 안 되는 셈입니다. 

${sleepAdvice} 멍한 머리로 10시간을 버티는 것보다, 차라리 7시간을 푹 자고 6시간을 '몰입(Flow)' 상태로 공부하는 것이 성적 향상에 훨씬 유리합니다. 이건 제 개인적인 의견이 아닙니다. 학생의 자율신경 데이터와 신체 피로 지표가 증명하는 팩트입니다. 잠을 줄이는 것은 '투혼'이 아니라, 뇌세포를 파괴하는 '자해'입니다. 잠은 '시간 낭비'가 아니라, 낮 동안 공부한 내용을 장기기억으로 저장하는 '필수 저장 시간'임을 명심해야 합니다.`;

    // 3. 모의고사 멘탈 시뮬레이션 (Exam Mental Simulation)
    const sns = hrv.sns || 50;
    const mentalScript = `많은 학생들이 "평소엔 잘하는데 실전에만 약해요"라고 호소합니다. 원인은 '멘탈'이 아니라 '자율신경'에 있습니다. ${student.name} 학생의 데이터를 보면, 특정 과목(예: 수학) 시험 직후나 난이도 높은 문제 풀이 시 교감신경(Stress) 수치가 **${sns}**까지 폭발합니다. ${examAdvice} 이렇게 과열된 신경은 점심시간이 지나도 쉽게 가라앉지 않습니다. 

이 상태가 지속되면 3교시 영어 듣기평가 때는 뇌가 '멍한(Brain Fog)' 상태가 되어 실수를 연발하게 됩니다. 지금 필요한 건 수학 문제를 더 푸는 게 아닙니다. 수학 시간이 끝나자마자 치솟은 교감신경을 강제로 끄는 '3분 호흡법' 훈련을 해야 영어 점수가 오릅니다. 이 앱의 'Exam Mode' 시뮬레이션을 통해, 실제 시험장과 똑같은 환경에서 자율신경과 긴장도가 어떻게 요동치는지 확인하고, 그 순간에 즉각적으로 진정시키는 바이오피드백 훈련이 필수입니다.`;

    // 4. 도파민 디톡스 처방 (Dopamine Detox)
    const distraction = analytics.distractionCount || 0;
    const dopamineScript = `공부하다가 잠깐 쉰다며 스마트폰(숏폼, 릴스)을 보나요? ${student.name} 학생의 산만도(Distraction) 지표가 **${distraction}회**로 잡히는데, 뇌 입장에서는 100m 전력질주보다 더 큰 자극을 받고 있는 셈입니다. 쉬었는데도 다시 공부하려면 머리가 더 아프고 집중이 안 되는 이유가 바로 그것입니다. ${dopamineAdvice}

진정한 휴식은 뇌에 입력을 차단하는 것입니다. 쉴 때는 '심심함'과 '지루함'을 견뎌야 뇌가 충전됩니다. 쉬는 시간에 스마트폰을 보는 건, 뇌를 24시간 쉬지 않고 혹사시키는 학대 행위입니다. 스마트폰을 뺏는 게 억울해? 이건 벌이 아니라, 네 뇌를 지키기 위한 '의학적 처방'이야. 스마트폰 대신 멍때리기나 가벼운 스트레칭을 할 때, 비로소 너의 뇌는 방금 공부한 내용을 정리하고 다음 공부를 준비할 수 있어.`;

    // 5. 영양 엔진 튜닝 (Nutrition Tuning)
    let nutritionScript = "";
    if (bloodTest) {
        const hb = bloodTest.hemoglobin;
        if (hb > 0 && hb < 13) {
            nutritionScript = `공부법 이전에 '몸'부터 점검해야 합니다. 혈액검사 결과를 보면 빈혈 수치(Hb)가 **${hb}**로 경계선에 있습니다. 이는 뇌에 산소 공급이 원활하지 않다는 뜻입니다. 산소가 없는데 뇌가 어떻게 집중을 합니까? ${student.name}이가 책상에서 자꾸 조는 건, 정신력이 약해서가 아니라 뇌가 숨을 못 쉬어서 기절하는 것에 가깝습니다. 이건 혼낼 문제가 아니라 치료할 문제입니다.`;
        } else {
            nutritionScript = `공부법 이전에 '몸'부터 점검해야 합니다. 현재 기본적인 빈혈 수치(Hb ${hb})는 양호하지만, 고강도 학습을 견디기엔 미네랄과 비타민 소모가 극심할 수 있습니다. 특히 뇌신경 전달물질을 만드는 비타민 B군과 뇌의 산소 운반을 돕는 철분 수치는 성적과 직결됩니다.`;
        }
    } else {
        nutritionScript = `공부법 이전에 '몸'을 최적화해야 성적이 오릅니다. 많은 학생들이 영양 결핍 상태로 억지로 뇌를 쥐어짜고 있습니다. 특히 철분(산소 공급)과 비타민D(뇌기능) 부족은 집중력 저하의 직접적인 원인입니다. ${student.name}이가 책상에서 자주 졸거나 멍하다면, 그건 정신력 문제가 아니라 '연료 부족'일 수 있습니다.`;
    }
    nutritionScript += ` ${nutritionAdvice} 철분제, 비타민B 컴플렉스 등 부족한 영양소를 챙겨 먹는 것만으로도, 책상에서 조는 횟수가 절반으로 줄어들 수 있습니다. 가장 쉽고, 가장 확실하며, 가장 과학적인 성적 향상 비법은 바로 '영양 엔진 튜닝'입니다.`;

    return {
        truce: customTrim(truceScript),
        sleep: customTrim(sleepScript),
        exam: customTrim(mentalScript),
        dopamine: customTrim(dopamineScript),
        nutrition: customTrim(nutritionScript)
    };
};

// Helper to clean up whitespace
const customTrim = (text: string) => text.split('\n').map(l => l.trim()).join('\n').trim();
