import { StudentInfo, HRVData, SurveyData, ProtocolData, LearningAnalyticsData, BloodTestData } from "../types";

export interface ConsultingResult {
    energyLeakage: string;
    brainMatching: string;
    anxietyTrigger: string;
    metabolicEfficiency: string;
    envControl: string;
}

// ----------------------------------------------------------------------
// 1. 학습 에너지 누수 (Energy Leakage)
// ----------------------------------------------------------------------
const getEnergyLeakageReport = (hrv: HRVData, survey: SurveyData, student: StudentInfo): string => {
    const parts: string[] = [];

    // [진단]
    const isSleepDeprived = survey.isi >= 15; // 수면 문제
    const isLowVitality = hrv.vitality < 40;

    if (isSleepDeprived && isLowVitality) {
        parts.push(`🚨 [진단: 심각한 에너지 누수] 현재 학생은 '수면 빚(Sleep Debt)'이 한계치에 도달하여, 깨진 독에 물 붓기 식으로 에너지가 줄줄 새고 있습니다. 수면의 질과 양 모두 붕괴된 상태로, 이는 단순 피로가 아니라 '뇌 기능 부전'에 가깝습니다.`);
    } else if (isSleepDeprived) {
        parts.push(`⚠️ [진단: 수면 효율 저하] 학습 의욕은 있으나 '가성 수면' 상태가 지속되고 있습니다. 잠을 자도 뇌가 쉬지 못해, 아침에 일어나도 개운하지 않고 오전 내내 멍한 상태(Brain Fog)가 이어집니다.`);
    } else if (isLowVitality) {
        parts.push(`⚠️ [진단: 만성 활력 고갈] 수면 시간은 확보되었으나, 깨어있는 동안의 에너지 효율이 극도로 낮습니다. 마치 배터리 효율이 떨어진 스마트폰처럼, 1시간만 공부해도 3시간 한 것 같은 피로를 느낍니다.`);
    } else {
        parts.push(`✅ [진단: 에너지 보존 양호] 현재 학습 에너지의 누수가 크지 않고 관리가 잘 되고 있습니다. 현재의 리듬을 유지하되, 고강도 학습 기간에 대비한 예비 전력 확보가 필요합니다.`);
    }

    // [원리]
    parts.push(`\n🧠 [과학적 원리] 뇌는 수면 중 '글림프 시스템(Glymphatic System)'을 통해 낮 동안 쌓인 독소(베타 아밀로이드 등)를 청소합니다. 특히 전두엽은 수면 부족 시 가장 먼저 기능이 저하되어, 의지력과 판단력을 상실하게 만듭니다. 지금 국영수 학원 하나 더 보내는 것보다, 30분의 양질의 수면이 성적 상승의 지름길임은 과학적 팩트입니다.`);

    // [증거]
    parts.push(`\n📊 [데이터 증거] 실제로 생체 데이터를 보면, 신체 활력도(Vitality)가 ${hrv.vitality}%로 또래 평균 대비 ${hrv.vitality < 50 ? '하위권' : '양호한 수준'}입니다. 불면 심각도(ISI) 역시 ${survey.isi}점으로 ${survey.isi >= 10 ? '관리가 필요한' : '안정적인'} 수준입니다.`);

    // [처방]
    if (isSleepDeprived || isLowVitality) {
        parts.push(`\n💊 [핵심 처방] 
1. **'커피 냅(Coffee Nap)' 활용**: 오후 2~3시 사이, 커피 한 잔을 마시고 바로 20분간 낮잠을 잡니다. 아데노신 제거와 카페인 각성 효과가 동시에 나타나 오후 학습 효율을 2배로 높입니다.
2. **수면의 골든타임 사수**: 밤 11시~새벽 2시는 성장호르몬과 멜라토닌이 피크를 치는 시간입니다. 이 시간대에는 반드시 잠들어 있어야 뇌가 '포맷'되고 기억이 저장됩니다.
3. **블루라이트 차단**: 자기 전 1시간 스마트폰 금지는 선택이 아니라 필수입니다. 뇌에게 '밤'이라는 신호를 주세요.`);
    } else {
        parts.push(`\n💊 [핵심 처방] 현재의 좋은 흐름을 이어가기 위해, 주말에는 평소보다 90분(수면 사이클 1주기)만 더 자는 '보상 수면' 전략을 추천합니다. 무리하게 잠을 줄이기보다 깨어있는 시간의 밀도를 높이는 '초몰입 전략'을 구사하세요.`);
    }

    // [효과]
    parts.push(`\n🌟 [기대 효과] 이 처방대로 2주만 관리하면, 아침 기상 시 머리가 맑아지는 것을 체감할 것입니다. 맑은 정신의 1시간은 몽롱한 정신의 3시간을 압도합니다.`);

    return parts.join('\n');
};

// ----------------------------------------------------------------------
// 2. 과목별 두뇌 매칭 분석 (Brain-Subject Matching)
// ----------------------------------------------------------------------
const getBrainMatchingReport = (student: StudentInfo, survey: SurveyData, hrv: HRVData): string => {
    const parts: string[] = [];
    const weakSubject = student.weakSubject === 'math' ? '수학' : student.weakSubject === 'korean' ? '국어' : '영어';
    const chronotype = survey.chronotypeResult || 'neutral';

    // [진단]
    let isMismatch = false;
    if ((chronotype === 'evening' || chronotype === 'moderate_evening') && student.weakSubject === 'math') {
        isMismatch = true;
        parts.push(`🚨 [진단: 최악의 미스매치] 학생은 전형적인 '**저녁형 두뇌(Owl Type)**'를 가졌는데, 뇌 각성도가 가장 낮은 아침 시간에 논리적 사고가 필요한 '${weakSubject}'을 배치하고 있을 가능성이 높습니다. 이는 엔진이 예열되지 않은 상태에서 풀악셀을 밟는 것과 같아 뇌에 엄청난 부하를 줍니다.`);
    } else if ((chronotype === 'morning' || chronotype === 'moderate_morning') && student.weakSubject !== 'math') {
        parts.push(`⚠️ [진단: 시간대 활용 비효율] 학생은 '**아침형 두뇌(Lark Type)**'입니다. 뇌 효율이 가장 좋은 오전 시간에는 암기보다는 고도의 사고력이 필요한 취약 과목(${weakSubject})을 배치해야 합니다.`);
    } else {
        parts.push(`✅ [진단: 생체 리듬 적합] 자신의 크로노타입(${chronotype === 'evening' ? '저녁형' : '아침형'})에 맞게 학습 스케줄을 잘 운용하고 있는 것으로 보입니다.`);
    }

    // [원리]
    parts.push(`\n🧠 [과학적 원리] 사람마다 고유한 생체 시계(Circadian Rhythm)가 있습니다. 저녁형 인간은 기상 후 1~2시간이 아닌, 10~11시간 뒤에 인지 능력이 정점을 찍습니다. 반면 아침형 인간은 기상 직후 3~4시간이 골든타임입니다. 싫어하는 과목일수록 '가장 머리가 좋을 때' 공부해야 고통이 덜하고 효율이 오릅니다.`);

    // [증거]
    parts.push(`\n📊 [데이터 증거] 학생의 크로노타입 분석 결과 '**${chronotype}**' 성향이 뚜렷하며, 현재 집중도 레벨은 **Level ${hrv.concentrationLevel}**입니다. 취약 과목인 **${weakSubject}**을(를) 단순한 의지 부족으로 못하는 것이 아니라, 생체 리듬과 어긋난 시간에 억지로 하고 있기 때문에 성과가 안 날 확률이 ${isMismatch ? '90% 이상' : '높'}습니다.`);

    // [처방]
    if (isMismatch) {
        parts.push(`\n💊 [핵심 처방] 
1. **과목 배치 전면 수정**: 당장 수학 공부 시간을 저녁 8시 이후로 옮기세요. 이때가 학생의 뇌가 수학적 논리를 받아들일 준비가 된 최적의 시간입니다.
2. **오전 루틴 변경**: 아침 자습 시간에는 복잡한 문제 풀이 대신, 단순 암기(영단어)나 인터넷 강의 시청 같은 수동적 학습(Passive Learning)으로 뇌를 서서히 깨우세요.
3. **조명 활용**: 저녁 공부 시에는 청색광(Cool White) 스탠드를 사용하여 인위적으로 각성 상태를 연장하세요.`);
    } else {
        parts.push(`\n💊 [핵심 처방] 현재의 시간표를 유지하되, 취약 과목(${weakSubject})을 하루 중 **컨디션이 가장 좋은 시간대(Golden Time)**에 '알박기' 하듯 고정배치하세요. 싫어하는 과목을 먼저 끝내야 도파민 보상 심리가 작동하여 나머지 공부가 수월해집니다.`);
    }

    // [효과]
    parts.push(`\n🌟 [기대 효과] 시간대만 바꿔도 같은 시간 공부했을 때 문제 풀이 정확도가 20% 이상 상승할 것입니다. 뇌를 이기려 하지 말고 뇌의 흐름에 올라타세요.`);

    return parts.join('\n');
};

// ----------------------------------------------------------------------
// 3. 시험 불안 유발 요인 파악 (Anxiety Trigger Analysis)
// ----------------------------------------------------------------------
const getAnxietyReport = (survey: SurveyData, hrv: HRVData): string => {
    const parts: string[] = [];
    const isHighBeta = (hrv.eegHBeta && hrv.eegHBeta > 20) || hrv.sns > 70; // 뇌 과각성 여부
    const isHighAnxiety = survey.bai >= 20;

    // [진단]
    if (isHighAnxiety && isHighBeta) {
        parts.push(`🚨 [진단: 과각성형 불안] 학생은 실력이 없는 게 아니라, 시험장에서 제 실력을 발휘 못하는 전형적인 '**유리 멘탈(Glass Mind)**' 상태입니다. 신경계 과각성 상태가 과도하게 지속되고 있습니다. 이는 뇌가 항상 '전투 모드'로 켜져 있어, 시험지라는 자극을 보자마자 '백지화(Freezing)' 현상을 일으키는 유형입니다.`);
    } else if (isHighAnxiety && !isHighBeta) {
        parts.push(`⚠️ [진단: 인지적 불안] 신체적인 긴장도보다는 '실수하면 어떡하지?', '망치면 끝장이다'라는 부정적인 생각(Intrusive Thoughts)이 꼬리에 꼬리를 물어 집중력을 갉아먹는 유형입니다. 몸은 차분한데 머릿속이 시끄러운 상태입니다.`);
    } else {
        parts.push(`✅ [진단: 적정 긴장 유지] 적당한 긴장감은 오히려 집중력을 높여주는 '각성제' 역할을 합니다. 현재의 불안 수준은 수행 능력을 돕는 최적의 구간(Optimal Zone)에 있습니다.`);
    }

    // [원리]
    parts.push(`\n🧠 [과학적 원리] 극도의 긴장 상태에서는 감정을 관장하는 '편도체(Amygdala)'가 폭주하여, 이성을 담당하는 '전두엽(Prefrontal Cortex)'의 회로를 끊어버립니다. 아는 문제도 실수하고, 계산이 안 되는 것은 전두엽이 마비되었기 때문입니다. 이를 해결하려면 편도체를 진정시키는 '생리적 개입'이 필수입니다.`);

    // [증거]
    parts.push(`\n📊 [데이터 증거] BAI(불안척도) 점수가 ${survey.bai}점으로 나타났으며, 특히 교감신경 활성도(SNS)가 ${hrv.sns}%로 ${hrv.sns > 60 ? '높아 신체가 항상 긴장 상태임' : '안정적임'}을 보여줍니다.`);

    // [처방]
    if (isHighBeta) {
        parts.push(`\n💊 [핵심 처방: 신체적 개입] 
1. **'4-7-8 호흡법'**: 시험지를 받자마자 바로 풀지 말고, 4초간 들이마시고 7초 멈추고 8초 내뱉는 호흡을 3번만 하세요. 강제로 부교감신경을 켜서 편도체를 끄는 가장 빠른 스위치입니다.
2. **이완 훈련**: 평소 공부할 때도 어깨가 귀에 붙어있지 않나요? 의식적으로 어깨를 툭 떨어뜨리는 '신체 스캔'을 습관화하세요. 몸이 풀리면 뇌도 풀립니다.`);
    } else {
        parts.push(`\n💊 [핵심 처방: 인지적 개입] 
1. **'걱정 시간(Worry Time)' 설정**: 불안한 생각이 들 때 "이 걱정은 밤 10시에 몰아서 하자"고 미뤄두세요.
2. **시험 시뮬레이션**: 실제 시험장과 똑같은 소음(백색소음), 똑같은 필기구, 똑같은 옷차림으로 모의고사를 보며 '상황'에 뇌를 둔감화(Desensitization)시키세요.`);
    }

    // [효과]
    parts.push(`\n🌟 [기대 효과] 멘탈은 타고나는 것이 아니라 기술입니다. 위 훈련을 통해 자신의 실력을 100% 발휘할 수 있는 '강철 멘탈'을 만들 수 있습니다.`);

    return parts.join('\n');
};

// ----------------------------------------------------------------------
// 4. 영양 및 대사 효율 코칭 (Metabolic Efficiency)
// ----------------------------------------------------------------------
const getMetabolicReport = (bloodTest: BloodTestData | undefined, survey: SurveyData): string => {
    const parts: string[] = [];
    const hasAdrenalFatigue = survey.adrenalFatigueScore && survey.adrenalFatigueScore >= 10;

    // [진단]
    if (hasAdrenalFatigue) {
        parts.push(`🚨 [진단: 대사 시스템 붕괴] "차가 휘발유 없이 달릴 수 없듯, 뇌도 영양 없이 돌아가지 않습니다." 현재 학생은 의지의 문제가 아니라 '연료(Fuel)' 자체가 부족합니다. 특히 오후 4시만 되면 급격히 무기력해지는 '부신 피로(Adrenal Fatigue)' 징후가 뚜렷합니다.`);
    } else {
        parts.push(`✅ [진단: 양호한 대사] 기본적인 에너지 대사 기능은 양호해 보입니다. 다만 장기 레이스를 위해 뇌 영양 공급을 최적화할 필요는 있습니다.`);
    }

    // [원리]
    parts.push(`\n🧠 [과학적 원리] 뇌는 우리 몸무게의 2%에 불과하지만, 전체 에너지의 20%를 사용하는 '대식가'입니다. 특히 혈당이 급격히 오르내리는 '혈당 스파이크'가 발생하면, 인슐린이 과다 분비되어 저혈당 상태가 오고, 뇌는 즉각적인 졸음과 집중력 저하로 반응합니다.`);

    // [증거]
    const bloodFindings: string[] = [];
    if (bloodTest) {
        if (bloodTest.vitaminD < 30) bloodFindings.push("비타민D 결핍(우울감/기억력 저하 원인)");
        if (bloodTest.hemoglobin < 13) bloodFindings.push("헤모글로빈 부족(산소 공급 저하로 인한 빈혈/피로)");
        if (bloodTest.hba1c >= 5.7) bloodFindings.push("혈당 관리 주의(식곤증 유발)");
    }
    if (bloodFindings.length > 0) {
        parts.push(`\n📊 [데이터 증거] 혈액검사 결과가 이를 증명합니다: ${bloodFindings.join(', ')}. 이 수치로는 아무리 정신력을 강조해도 생물학적인 한계에 부딪힐 수밖에 없습니다.`);
    } else {
        parts.push(`\n📊 [데이터 증거] 부신 피로 자가 진단 점수가 ${survey.adrenalFatigueScore || 0}점으로 관찰됩니다. 눈에 보이지 않는 호르몬 불균형이 학습 지구력을 갉아먹고 있을 수 있습니다.`);
    }

    // [영양 가이드]
    parts.push(`\n💊 [핵심 영양 가이드] 
1. **'거꾸로 식사법'**: 채소 -> 단백질 -> 탄수화물 순서로 식사하세요. 혈당 스파이크를 막아 식곤증을 원천 차단합니다. 점심에 면, 빵, 떡볶이는 최악입니다.
2. **필수 영양 성분 보충**: 뇌도 하드웨어입니다. ${bloodTest && bloodTest.vitaminD < 30 ? '내과 전문의 상담을 통한 비타민D 보충을 권장하며, ' : ''}비타민B군(에너지 대사)과 마그네슘(신경 이완)을 섭취하여 뇌의 '배터리 용량'을 늘리세요.
3. **단순 당류 제한**: 공부하다 당 떨어진다고 초콜릿 먹지 마세요. 30분 반짝하고 2시간 무기력해집니다. 견과류나 다크 초콜릿으로 대체하세요.`);

    // [효과]
    parts.push(`\n🌟 [기대 효과] 영양 채우기는 가장 적은 노력으로 가장 확실하게 성적을 올리는 '가성비' 최고의 투자입니다. 뇌가 쌩쌩 돌아가는 경험을 하게 될 것입니다.`);

    return parts.join('\n');
};

// ----------------------------------------------------------------------
// 5. 환경 통제 전략 (Environmental Control)
// ----------------------------------------------------------------------
const getEnvControlReport = (protocol: ProtocolData): string => {
    const parts: string[] = [];
    const isNoiseSensitive = protocol.noiseLevel >= 7;
    const isHighStressLoc = protocol.stressLevel >= 7;

    // [진단]
    if (isNoiseSensitive) {
        parts.push(`🚨 [진단: 청각 과빈감형] 학생은 '개방형' 공간보다 '폐쇄형' 공간에서 효율이 2배 오르는 타입입니다. 친구들과 함께 가는 스터디카페나 오픈형 도서관은 최악입니다. 백색소음도 소음으로 인식하여 뇌의 처리 용량(Working Memory)을 잡아먹고 있습니다.`);
    } else if (isHighStressLoc) {
        parts.push(`⚠️ [진단: 장소 부적합] 현재 공부하는 장소(${protocol.location})에 대한 뇌의 스트레스 반응이 높습니다. 몸은 앉아있지만 뇌는 '여기를 탈출하고 싶다'는 신호를 계속 보내고 있어 집중이 될 리가 없습니다.`);
    } else {
        parts.push(`✅ [진단: 환경 적응력 우수] 어느 장소에서나 무난하게 집중할 수 있는 유연한 뇌를 가졌습니다. 하지만 '초몰입'을 위해서는 약간의 환경 통제가 더해지면 금상첨화입니다.`);
    }

    // [원리]
    parts.push(`\n🧠 [과학적 원리] 인간의 주의력은 한정된 자원입니다. 주변의 소음, 시각적 자극(스마트폰 알림, 지나가는 사람)을 무시하는 데에 에너지를 쓰면, 정작 공부에 쓸 에너지가 남지 않습니다. 환경 통제는 '참는 것'이 아니라, 참을 필요가 없게 '차단'하는 것입니다.`);

    // [증거]
    parts.push(`\n📊 [데이터 증거] 프로토콜 분석 결과, 소음 민감도가 ${protocol.noiseLevel}/10로 ${isNoiseSensitive ? '매우 높습' : '보통입'}니다. 현재 장소에서의 스트레스 레벨은 ${protocol.stressLevel}/10입니다. 이는 환경이 학습을 방해하는 '역치'를 넘어섰음을 시사합니다.`);

    // [처방]
    if (isNoiseSensitive) {
        parts.push(`\n💊 [핵심 처방] 
1. **완벽한 차단**: 노이즈 캔슬링 이어폰이나 3M 귀마개를 필수로 착용하세요. '완벽한 정적'이 이 학생에게는 최고의 집중력 엠씨스퀘어입니다.
2. **시각적 차단**: 독서실 책상의 양옆 가림막(윙)이 있는 1인실을 사용하고, 책상 위에는 지금 공부할 책 한 권만 남기고 다 치우세요. 시선이 닿는 곳에 스마트폰이 있으면 뇌는 무의식적으로 계속 신경 씁니다.`);
    } else {
        parts.push(`\n💊 [핵심 처방] 
1. **장소 분리(Context Dependent Learning)**: 집은 '휴식', 독서실은 '공부', 카페는 '가벼운 독서' 등 장소별로 목적을 뇌에 각인시키세요. 침대에서 공부하는 것은 불면증과 성적 하락의 지름길입니다.
2. **적절한 환기**: 50분 공부 후에는 반드시 장소를 이탈하여 뇌에 새로운 산소를 공급하고 분위기를 환기하세요.`);
    }

    // [효과]
    parts.push(`\n🌟 [기대 효과] 맹모삼천지교는 옛말이 아닙니다. 환경만 바꿔도 학생의 표정이 달라지고 학습 지속 시간이 획기적으로 늘어납니다.`);

    return parts.join('\n');
};


// Main Generator Function
export const generateConsultingReport = (
    student: StudentInfo,
    hrv: HRVData,
    survey: SurveyData,
    protocol: ProtocolData,
    analytics: LearningAnalyticsData,
    bloodTest?: BloodTestData
): ConsultingResult => {
    return {
        energyLeakage: getEnergyLeakageReport(hrv, survey, student),
        brainMatching: getBrainMatchingReport(student, survey, hrv),
        anxietyTrigger: getAnxietyReport(survey, hrv),
        metabolicEfficiency: getMetabolicReport(bloodTest, survey),
        envControl: getEnvControlReport(protocol)
    };
};
