import { CareType } from '../types';

export interface CareTypeInsight {
    overallAnalysis: string;
    ansDeepAnalysis: string;
    eegInterpretation: string;
    densityAnalysis: string;
}

export const CARE_TYPE_INSIGHTS: Record<CareType, CareTypeInsight> = {
    [CareType.BURNOUT]: {
        overallAnalysis: "번아웃 단계에 진입하여 뇌의 보상 회로가 무뎌진 상태입니다. 단순한 집중력 문제가 아닌 '심리적/생체적 고갈'이 핵심입니다.",
        ansDeepAnalysis: "교감신경이 극도로 항진되어 있거나, 오히려 너무 지쳐서 반응을 멈춘 상태입니다. 신체가 휴식 모드로 전환되지 못해 만성 피로가 쌓여 있습니다.",
        eegInterpretation: "과도한 긴장 상태로 인해 두뇌가 충분히 이완되지 못하고 있음을 나타냅니다. 깊은 피로의 누적은 뇌의 정보 처리 과부하를 의미합니다.",
        densityAnalysis: "공부 시간 대비 성취도가 급격히 떨어지는 단계입니다. 무리한 계획보다는 '완전한 휴식'이 오히려 성적 향상의 지름길입니다."
    },
    [CareType.ANXIETY_TENSION]: {
        overallAnalysis: "과도한 긴장이 인지 기능을 잠식하고 있습니다. 실패에 대한 두려움이 전두엽의 논리적 사고를 방해하는 '질식(Choking)' 현상이 우려됩니다.",
        ansDeepAnalysis: "자율신경 조절력이 저하되어 있으며, 작은 자극에도 교감신경이 민감하게 요동칩니다. 긴장으로 인해 호흡이 얕아져 뇌 산소 공급이 부족할 수 있습니다.",
        eegInterpretation: "불안을 반영하는 과각성 긴장 반응이 우세합니다. 이완과 집중의 전환이 매끄럽지 않아 시험 시 불안감이 높아지기 쉽습니다.",
        densityAnalysis: "불안감 때문에 한 문제에 너무 오래 매달리거나, 아는 내용을 반복해서 확인하느라 진도가 나가지 않는 양상을 보입니다."
    },
    [CareType.STRESS_OVERLOAD]: {
        overallAnalysis: "현재 수용 가능한 한계치를 넘은 스트레스가 뇌를 압박하고 있습니다. 단기 기억을 장기 기억으로 전환하는 해마 기능이 일시적으로 저하될 수 있습니다.",
        ansDeepAnalysis: "SNS(교감) 수치가 정상 범위를 크게 벗어나 '과각성' 상태를 유지하고 있습니다. 이는 뇌 피로 물질인 아데노신 축적을 가속화합니다.",
        eegInterpretation: "스트레스 지표가 '높음'으로 나타나며, 전전두엽의 혈류량이 감소하여 판단력과 계획 세우기 능력이 떨어져 있습니다.",
        densityAnalysis: "학습 밀도는 높으나 휘발성이 강합니다. 스트레스로 인해 깊은 사고가 어려워 단순 암기 위주의 학습에 치중될 위험이 있습니다."
    },
    [CareType.LOW_ENERGY]: {
        overallAnalysis: "생체 에너지가 바닥나 학습 의욕 자체가 생성되지 않는 상태입니다. 이는 의지의 문제가 아닌 '연료 부족'의 문제입니다.",
        ansDeepAnalysis: "부교감신경이 우세하나 이는 편안함이 아닌 '무기력'을 동반합니다. 심박수가 낮고 전반적인 신체 활성도가 떨어져 있습니다.",
        eegInterpretation: "각성도가 낮고 두뇌 활력이 저하되어 있습니다. 뇌가 충분히 깨어나지 않아 정보를 입력해도 '멍한 상태'가 지속됩니다.",
        densityAnalysis: "공부 시작까지 걸리는 시간이 매우 길고, 조금만 공부해도 급격한 피로를 느껴 지속 시간이 짧은 것이 특징입니다."
    },
    [CareType.DEPRESSION_AMOTIVATION]: {
        overallAnalysis: "학습의 목적을 잃고 감정 가라앉음이 심한 상태입니다. 뇌의 도파민 수용체가 저하되어 있을 가능성이 높습니다.",
        ansDeepAnalysis: "정서적 위축으로 인해 자율신경계가 매우 경직되어 있습니다. 신체 활력이 낮아져 소화 불량이나 무거운 몸 상태가 지속될 수 있습니다.",
        eegInterpretation: "두뇌가 안정 상태라기보다 침체된 저활성 상태입니다. 인지적 명료함과 능동적인 몰입 동기가 떨어져 있습니다.",
        densityAnalysis: "계획 자체를 세우지 못하거나 실행 의지가 매우 낮습니다. 결과에 대한 무관심이 성적 하락의 원인이 될 수 있습니다."
    },
    [CareType.ADRENAL]: {
        overallAnalysis: "만성적인 피로가 부신 기능을 저하시킨 상태입니다. 아침 각성이 힘들고 오후에 급격히 에너지가 소진되는 패턴을 보입니다.",
        ansDeepAnalysis: "부신 호르몬(코르티솔) 분비 리듬이 깨져 있어 자율신경 균형이 불안정합니다. 스트레스에 대응하는 탄력성이 매우 낮아진 상태입니다.",
        eegInterpretation: "뇌 피로도가 매우 높게 나타납니다. 집중을 유지해주는 인지 통제력이 유지되지 못하고 쉽게 피로 상태로 변동됩니다.",
        densityAnalysis: "시간당 학습량의 편차가 매우 큽니다. 에너지가 있을 때는 몰입하나 금방 고갈되어 장기전(수험)에 취약한 상태입니다."
    },
    [CareType.BRAIN_FATIGUE]: {
        overallAnalysis: "휴식 없는 과도한 입력으로 인해 뇌가 정보를 정렬하지 못하는 '정체 상태'입니다. 머리가 무겁고 안개가 낀 듯한 느낌(Brain Fog)을 받을 수 있습니다.",
        ansDeepAnalysis: "교감신경과 부교감신경 모두 활성도가 낮아져 '저활성' 상태입니다. 뇌의 대사 기능이 원활하지 못해 노폐물 배출이 늦어지고 있습니다.",
        eegInterpretation: "전반적인 신경인지 활성도가 낮고 비효율적인 양상을 보입니다. 정보 처리 능력을 나타내는 지수들이 전반적으로 하락해 있습니다.",
        densityAnalysis: "책을 읽어도 눈에 들어오지 않는 '난독' 현상이 나타날 수 있습니다. 무조건적인 휴식과 수면이 공부보다 우선되어야 합니다."
    },
    [CareType.HYPERSENSITIVE]: {
        overallAnalysis: "신경계가 너무 예민하여 외부 환경 자극에 지나치게 반응합니다. 완벽주의적 성향이 강해 작은 실수에도 큰 스트레스를 받습니다.",
        ansDeepAnalysis: "자율신경이 매우 예민하여 작은 소음이나 온도의 변화에도 PNS(부교감)가 위축되고 SNS(교감)가 즉각 반응합니다.",
        eegInterpretation: "감각 처리 신경계가 외부 자극에 민감하게 반응합니다. 전두엽의 선택적 주의 필터링 기능이 약해져 있습니다.",
        densityAnalysis: "주변 환경에 따라 성과 차이가 극심합니다. 공부 장소와 조명, 소음 환경이 완벽하지 않으면 집중을 시작하지 못하는 경향이 있습니다."
    },
    [CareType.ATTENTION_DEFICIT]: {
        overallAnalysis: "주의력을 유지하는 시스템이 약화되어 있습니다. 지능의 문제가 아닌 '전두엽의 실행 제어' 기능이 일시적으로 저하된 상태입니다.",
        ansDeepAnalysis: "자율신경의 변동 폭이 매우 큽니다. 흥분과 이완의 주기가 너무 빨라 한 가지 상태를 일정하게 유지하지 못합니다.",
        eegInterpretation: "주의 제어 반응성이 떨어져 있습니다. 뇌의 능동적 각성도가 충분히 올라오지 않아 외부로부터 강한 자극(스마트폰 등)을 계속 찾게 됩니다.",
        densityAnalysis: "한 과목을 오래 공부하지 못하고 계속 과목을 바꾸거나, 공부 중 자주 자리를 뜨게 됩니다. 실질적인 공부 시간이 매우 부족합니다."
    },
    [CareType.SLEEP]: {
        overallAnalysis: "수면의 질 저하가 뇌 기능을 직접적으로 마비시키고 있습니다. 지식의 저장(Consolidation) 과정이 원활하지 못해 공부한 내용이 쉽게 잊혀집니다.",
        ansDeepAnalysis: "야간 자율신경 회복이 이루어지지 않아 아침 시간에도 SNS(교감)가 비정상적으로 높거나 낮습니다. 신체 바이오리듬이 깨진 상태입니다.",
        eegInterpretation: "주간 피로 및 졸음 상태가 강하게 지속됩니다. 뇌의 노폐물 정화 작용(Glymphatic system) 기능 저하가 인지 피로로 이어지고 있습니다.",
        densityAnalysis: "오후 시간대의 졸음과 집중력 하락이 고질적입니다. 아무리 열심히 공부해도 잠이 부족하면 성적이 오르지 않는 병목 현상에 갇혀 있습니다."
    },
    [CareType.CIRCULATION]: {
        overallAnalysis: "신체적 컨디션 저하(순환 장애, 소화 등)가 인지 기능을 방해합니다. 몸의 불편함이 뇌의 집중력을 계속해서 뺏어가는 구조입니다.",
        ansDeepAnalysis: "말초 혈류 순환 지표가 낮으며 수족냉증이나 소화 불량이 자율신경 긴장을 유발합니다. 뇌로 가는 혈류량 부족이 집중력 저하의 원인입니다.",
        eegInterpretation: "두뇌의 인지 활성도가 전반적으로 낮습니다. 산소 공급과 영양 공급의 부족으로 인해 뇌세포의 대사 에너지가 충분히 생성되지 못하고 있습니다.",
        densityAnalysis: "오래 앉아 있는 것 자체가 신체적 고역입니다. 체력이 급격히 소진되어 공부 중반 이후부터는 효율이 거의 없습니다."
    },
    [CareType.HEALTHY]: {
        overallAnalysis: "뇌와 신체의 조화가 아주 훌륭합니다. 공부하는 만큼 성적이 나올 수 있는 최적의 '그릇'을 갖춘 상태입니다.",
        ansDeepAnalysis: "교감과 부교감신경의 균형이 이상적입니다. 스트레스를 받아도 금방 회복하는 탄력성(Resilience)이 매우 높습니다.",
        eegInterpretation: "주의 집중 상태와 능동적 몰입도가 안정적으로 유지됩니다. 외부 자극을 차단하고 공부에 몰입할 때의 인지 리듬성도 우수합니다.",
        densityAnalysis: "공부한 시간과 성과가 비례합니다. 현재의 리듬을 잃지 않도록 규칙적인 생활을 유지하며 고난도 문제에 도전하기 가장 좋은 시기입니다."
    },
    [CareType.CONCENTRATION]: { // Legacy mapping to BRAIN_FATIGUE style or general
        overallAnalysis: "전반적인 집중 유지력이 저하된 상태입니다. 뇌의 에너지가 정보 처리에 효율적으로 집중되지 못하고 분산되고 있습니다.",
        ansDeepAnalysis: "자율신경의 안정도가 떨어져 있어 학습 중 작은 잡생각에도 쉽게 긴장하거나 이완되는 양상을 보입니다.",
        eegInterpretation: "학습에 필요한 능동 집중도가 약하고, 인지적 압박을 받을 때 안정적인 주의 집중이 급격히 흔들립니다.",
        densityAnalysis: "공부 시간은 길지만 막상 끝내놓고 보면 머리에 남는 것이 부족합니다. '집중의 질'을 높이는 훈련이 시급합니다."
    },
    [CareType.UNASSESSED]: {
        overallAnalysis: "정확한 진단을 위해 추가적인 데이터 입력이 필요합니다.",
        ansDeepAnalysis: "자율신경 데이터 수집 중입니다.",
        eegInterpretation: "신경인지 데이터 분석 중입니다.",
        densityAnalysis: "학습 데이터 수집 중입니다."
    }
};
