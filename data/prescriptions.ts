
import { CareType, Prescription } from "../types";

export const MENTAL_PRESCRIPTIONS: Partial<Record<CareType, Prescription>> = {
    // === ANS 축: 긴장/불안/스트레스 ===
    [CareType.BURNOUT]: {
        title: "진정한 멈춤의 미학 (Pause)",
        activity: "뇌 신경 휴식 & 4-7-8 호흡",
        duration: "10분",
        guide: [
            "치열했던 당신의 노력은 이미 충분합니다. 잠시 멈춤 버튼을 누르세요.",
            "코로 4초 들이마시고, 7초 멈추고, 8초간 길게 내뱉으며 부교감신경을 깨웁니다.",
            "지금 이 순간은 아무것도 성취하지 않아도 괜찮은 안전한 시간입니다.",
            "나를 태우며 얻은 빛보다, 나를 지키며 은은하게 빛나는 것이 더 오래갑니다."
        ],
        audioTag: "Alpha Waves (Relax)"
    },
    [CareType.ANXIETY_TENSION]: {
        title: "불안을 안아주는 용기 (Calm)",
        activity: "나비 포옹 & 안정화 기법",
        duration: "5분",
        guide: [
            "불안은 당신이 그만큼 잘하고 싶다는 열정의 다른 이름입니다.",
            "양팔을 교차해 스스로를 안고 토닥이는 '나비 포옹'으로 나를 위로해 주세요.",
            "내쉬는 숨마다 몸 안에 쌓인 긴장이 검은 연기처럼 빠져나간다고 상상합니다.",
            "당신은 안전하며, 이 파도 또한 결국 지나갈 것입니다."
        ],
        audioTag: "Theta Waves (Meditation)"
    },
    [CareType.STRESS_OVERLOAD]: {
        title: "나를 비우는 시간 (Release)",
        activity: "마음의 짐 내려놓기 시각화",
        duration: "7분",
        guide: [
            "짊어지고 있는 마음의 짐들을 잠시 땅에 내려놓는 상상을 해봅니다.",
            "어깨를 귀까지 올렸다가 '툭' 떨어뜨리며 물리적 무게감을 해소하세요.",
            "내가 통제할 수 없는 일들은 흘려보내고, 오늘 나에게 주어진 평온함만 취합니다.",
            "복잡한 생각의 고리들을 끊고, 텅 빈 뇌의 공간을 느껴보세요."
        ],
        audioTag: "Rain Sound (Nature)"
    },

    // === 에너지/대사 축: 무기력/우울/부신 ===
    [CareType.LOW_ENERGY]: {
        title: "작은 불씨 살리기 (Spark)",
        activity: "에너지 호흡 & 척추 펴기",
        duration: "3분",
        guide: [
            "가슴을 활짝 펴고 척추를 바로 세워 에너지의 통로를 엽니다.",
            "빠르고 깊게 30번 호흡하며 세포 하나하나에 산소를 공급하세요.",
            "오늘 할 수 있는 가장 작은 행동 하나를 떠올리고, 그것만으로 충분하다고 말해주세요.",
            "당신의 에너지는 고갈된 것이 아니라 잠시 잠들어 있을 뿐입니다."
        ],
        audioTag: "Upbeat Flow (Energy)"
    },
    [CareType.DEPRESSION_AMOTIVATION]: {
        title: "내 안의 빛 찾기 (Hope)",
        activity: "긍정 확언 & 미소 짓기",
        duration: "5분",
        guide: [
            "거울 속의 나에게, 혹은 마음 속의 나에게 억지로라도 미소를 지어 보입니다.",
            "나는 소중한 사람이며, 나의 잠재력은 여전히 유효하다고 소리 내어 말하세요.",
            "어두운 터널 같지만, 당신은 그 터널을 지나고 있는 중입니다. 끝은 반드시 있습니다.",
            "오늘 있었던 아주 사소한 감사한 일 하나만 찾아보세요."
        ],
        audioTag: "Bright Morning"
    },
    [CareType.ADRENAL]: {
        title: "에너지 통장 채우기 (Recharge)",
        activity: "완전한 이완 (바디 스캔)",
        duration: "15분",
        guide: [
            "지금은 방전된 배터리를 충전기에 꽂아야 할 골든 타임입니다.",
            "머리 끝부터 발끝까지 신체 부위 하나하나의 힘을 완전히 빼는 바디 스캔을 수행합니다.",
            "마치 물 위에 둥둥 떠 있는 것처럼 중력에 몸을 온전히 맡기세요.",
            "아무것도 하지 않는 것이 지금 당신이 할 수 있는 가장 생산적인 일입니다."
        ],
        audioTag: "Delta Waves (Deep Sleep)"
    },

    // === 뇌파/인지 축 ===
    [CareType.BRAIN_FATIGUE]: {
        title: "뇌를 씻어내는 멍 (Brain Wash)",
        activity: "멍때리기 & 시각 차단",
        duration: "10분",
        guide: [
            "과열된 뇌를 식히기 위해 잠시 눈을 감고 모든 시각 정보를 차단합니다.",
            "생각이 떠오르면 잡으려 하지 말고 구름처럼 흘러가게 두세요.",
            "뇌 속의 노폐물이 맑은 물에 씻겨 내려가는 상쾌한 상상을 합니다.",
            "비워낸 공간만큼 새로운 지혜가 채워질 것입니다."
        ],
        audioTag: "Forest Stream"
    },
    [CareType.HYPERSENSITIVE]: {
        title: "고요한 내면의 방 (Sanctuary)",
        activity: "감각 닫기 & 내면 주시",
        duration: "5분",
        guide: [
            "외부의 소란스러운 소음을 차단하고, 내면의 고요한 방으로 들어갑니다.",
            "나를 둘러싼 투명한 보호막을 상상하며 외부 자극으로부터 거리를 둡니다.",
            "예민함은 섬세함이라는 재능입니다. 그 재능을 나를 돌보는 데 쓰세요.",
            "지금 이 순간, 당신의 내면은 호수처럼 평화롭습니다."
        ],
        audioTag: "White Noise"
    },
    [CareType.ATTENTION_DEFICIT]: {
        title: "몰입의 즐거움 (Focus)",
        activity: "촛불 응시 & 한 점 집중",
        duration: "3분",
        guide: [
            "눈앞에 촛불이 타오르고 있다고 상상하고, 그 불꽃의 움직임만 바라보세요.",
            "흩어진 마음의 조각들을 하나로 모아 돋보기로 햇빛을 모으듯 집중시킵니다.",
            "나는 내가 원할 때 언제든 깊게 몰입할 수 있는 힘이 있습니다.",
            "지금 당장 해야 할 단 하나에만 온 마음을 쏟아붓습니다."
        ],
        audioTag: "Binaural Beats (Focus)"
    },

    // === 신체/기타 ===
    [CareType.SLEEP]: {
        title: "달콤한 꿈의 항해 (Sleep)",
        activity: "수면 암시 & 근육 이완",
        duration: "20분",
        guide: [
            "오늘의 모든 걱정과 할 일은 내일의 나에게 맡겨두세요.",
            "따뜻한 모래사장 위에 누워있는 듯한 포근함을 느낍니다.",
            "눈꺼풀이 무거워지고, 손발이 따뜻해지며 깊은 잠의 세계로 빠져듭니다.",
            "당신의 잠재의식은 당신이 자는 동안 내일의 에너지를 완벽히 준비할 것입니다."
        ],
        audioTag: "Night Ambience"
    },
    [CareType.CIRCULATION]: {
        title: "흐르는 강물처럼 (Flow)",
        activity: "순환 기체조 & 기지개",
        duration: "5분",
        guide: [
            "막혀있던 댐을 열듯, 온몸의 혈관을 확장시키는 큰 기지개를 켭니다.",
            "손끝과 발끝까지 따뜻한 혈액이 힘차게 도는 것을 느껴보세요.",
            "정체된 에너지가 뚫리며 머리가 맑아지고 활력이 솟아납니다.",
            "나의 몸과 마음은 끊임없이, 건강하게 순환하고 있습니다."
        ],
        audioTag: "Running Water"
    },
    [CareType.HEALTHY]: {
        title: "더 높이 나는 날개 (Vision)",
        activity: "성공 심상화 & 감사",
        duration: "5분",
        guide: [
            "당신의 최상의 컨디션에 깊이 감사하며, 이 에너지를 가치 있게 씁니다.",
            "목표를 달성하고 환호하는 자신의 모습을 생생하게 영화처럼 상영하세요.",
            "나는 준비되어 있고, 강하며, 무엇이든 해낼 수 있습니다.",
            "오늘의 나는 어제보다 더 성장했고, 내일 더 빛날 것입니다."
        ],
        audioTag: "Epic Inspire"
    },
    [CareType.CONCENTRATION]: {
        title: "집중력 몰입 (Deep Work)",
        activity: "원포인트 집중",
        duration: "5분",
        guide: [
            "시선을 한 점에 고정하고 1분간 깜빡이지 않습니다.",
            "주변의 소음이 점점 작아지고, 내 호흡 소리만 들립니다.",
            "지금 해야 할 단 하나의 과제만 생각합니다."
        ],
        audioTag: "Binaural Beats"
    }
};
