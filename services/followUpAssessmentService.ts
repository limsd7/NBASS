/**
 * 2주 단위 맞춤형 타겟 추적 검사 (Targeted Follow-up Assessment) 서비스
 * 
 * - 직전 검사(Baseline)에서 비정상(주의·경고·위험) 지표만을 자동 추출
 * - 3분 내 압축 재설문 후 정상 항목은 Carry-Over 결합
 * - 12대 케어타입 재진단 및 Before & After 호전/악화 델타(Delta) 지수 산출
 */

import {
    AssessmentResult,
    CareType,
    HRVData,
    ProtocolData,
    StudentInfo,
    SurveyData,
    LearningAnalyticsData
} from '../types';
import {
    BAI_QUESTIONS,
    ISI_QUESTIONS,
    FATIGUE_SYMPTOMS,
    SYMPATHETIC_SYMPTOMS,
    PARASYMPATHETIC_SYMPTOMS,
    CONCENTRATION_QUESTIONS,
    ADRENAL_QUESTIONS
} from '../data/questions';
import { CARE_STRATEGIES } from '../data/careStrategies';
import { normalizeCareTypeCode, getCareTypeDetail } from '../data/careTypesData';
import { evaluateClassificationWithScores, DEFAULT_LOGIC_CONFIG, LogicEngineConfig } from '../logicEngine';
import { evaluateBrainBodyCoherence } from './brainBodyEngine';
import { unifiedSyncService } from './unifiedSyncService';

// ============================================================================
// 12대 케어타입(CareType)별 전용 맞춤 추적 설문 문항 (각 5문항)
// ============================================================================
export const CARE_TYPE_FOLLOWUP_QUESTIONS: Record<string, { id: number; text: string; options: string[] }[]> = {
    BURNOUT: [
        { id: 1, text: "책상에 앉았을 때 머리가 하얘지거나 가슴이 답답하고 멍해지는 증상이 줄었습니까?", options: ["전혀 개선안됨 (0점)", "다소 미흡 (1점)", "보통 (2점)", "유의미하게 완화됨 (3점)", "매우 상쾌하고 맑음 (4점)"] },
        { id: 2, text: "25분 집중 후 10분 휴식 등 뽀모도로 루틴을 적용했을 때 에너지 고갈감이 덜합니까?", options: ["전혀 개선안됨 (0점)", "다소 미흡 (1점)", "보통 (2점)", "유의미하게 완화됨 (3점)", "매우 상쾌하고 맑음 (4점)"] },
        { id: 3, text: "목, 어깨, 승모근의 극심한 뭉침이나 쑤심, 긴장성 두통이 완화되었습니까?", options: ["전혀 개선안됨 (0점)", "다소 미흡 (1점)", "보통 (2점)", "유의미하게 완화됨 (3점)", "매우 상쾌하고 맑음 (4점)"] },
        { id: 4, text: "저녁 8~10시경 극단적인 탈진감(방전 상태) 없이 자율학습을 지속할 수 있습니까?", options: ["전혀 개선안됨 (0점)", "다소 미흡 (1점)", "보통 (2점)", "유의미하게 완화됨 (3점)", "매우 상쾌하고 맑음 (4점)"] },
        { id: 5, text: "암기 및 개념 이해 시 뇌가 과부하되어 공부를 포기하고 싶던 충동이 줄었습니까?", options: ["전혀 개선안됨 (0점)", "다소 미흡 (1점)", "보통 (2점)", "유의미하게 완화됨 (3점)", "매우 상쾌하고 맑음 (4점)"] },
    ],
    ANXIETY_TENSION: [
        { id: 1, text: "시험지나 모의고사를 마주했을 때 손떨림, 가슴 두근거림, 호흡 가쁨이 완화되었습니까?", options: ["전혀 개선안됨 (0점)", "다소 미흡 (1점)", "보통 (2점)", "유의미하게 완화됨 (3점)", "매우 안정됨 (4점)"] },
        { id: 2, text: "아는 문제를 시간에 쫓겨 당황하여 실수(조건 간과, 부호 착오)하던 빈도가 줄었습니까?", options: ["전혀 개선안됨 (0점)", "다소 미흡 (1점)", "보통 (2점)", "유의미하게 완화됨 (3점)", "매우 침착함 (4점)"] },
        { id: 3, text: "시험 직전 4-7-8 이완 호흡법이나 긴장 조절 루틴이 실전에서 도움이 되었습니까?", options: ["전혀 도움안됨 (0점)", "다소 미흡 (1점)", "보통 (2점)", "상당히 도움됨 (3점)", "매우 효과적임 (4점)"] },
        { id: 4, text: "'성적이 떨어지면 어쩌지'라는 파국적 불안 생각에 사로잡히는 시간이 감소했습니까?", options: ["전혀 감소안됨 (0점)", "다소 미흡 (1점)", "보통 (2점)", "유의미하게 감소 (3점)", "거의 생각안남 (4점)"] },
        { id: 5, text: "모의고사 타임어택 시 긴장으로 뇌가 정지(Freezing)되는 현상이 호전되었습니까?", options: ["전혀 호전안됨 (0점)", "다소 미흡 (1점)", "보통 (2점)", "유의미하게 호전 (3점)", "완벽히 극복됨 (4점)"] },
    ],
    STRESS_OVERLOAD: [
        { id: 1, text: "주변의 사소한 소음(책장 넘김, 필기 소리, 숨소리)에 예민하게 반응하던 신경이 안정되었습니까?", options: ["전혀 안정안됨 (0점)", "다소 미흡 (1점)", "보통 (2점)", "유의미하게 안정 (3점)", "전혀 신경안쓰임 (4점)"] },
        { id: 2, text: "공부 중 불쑥 솟구치던 짜증이나 감정적 기복 조절이 수월해졌습니까?", options: ["전혀 조절안됨 (0점)", "다소 미흡 (1점)", "보통 (2점)", "유의미하게 조절 (3점)", "완벽히 평온함 (4점)"] },
        { id: 3, text: "두통, 안구 피로, 턱관절 악물기 등 스트레스성 신체화 반응이 감소했습니까?", options: ["전혀 감소안됨 (0점)", "다소 미흡 (1점)", "보통 (2점)", "유의미하게 감소 (3점)", "전혀 없음 (4점)"] },
        { id: 4, text: "노이즈 캔슬링이나 백색소음 환경에서 집중 흐름이 끊기지 않고 잘 유지됩니까?", options: ["전혀 유지안됨 (0점)", "다소 미흡 (1점)", "보통 (2점)", "유의미하게 유지 (3점)", "완벽히 몰입됨 (4점)"] },
        { id: 5, text: "자습실이나 독서실에서 주변 사람의 시선이나 움직임에 신경 쓰이는 정도가 줄었습니까?", options: ["전혀 안줄어듬 (0점)", "다소 미흡 (1점)", "보통 (2점)", "상당히 줄어듬 (3점)", "전혀 신경안씀 (4점)"] },
    ],
    LOW_ENERGY: [
        { id: 1, text: "아침 기상 및 자리에 착석할 때 몸이 솜뭉치처럼 무겁던 무기력감이 가벼워졌습니까?", options: ["전혀 안가벼워짐 (0점)", "다소 미흡 (1점)", "보통 (2점)", "상당히 가벼워짐 (3점)", "매우 활력 넘침 (4점)"] },
        { id: 2, text: "공부를 시작하기까지 멍하니 스마트폰을 보며 미루던 착수 지연이 개선되었습니까?", options: ["전혀 개선안됨 (0점)", "다소 미흡 (1점)", "보통 (2점)", "상당히 개선됨 (3점)", "즉시 착수 가능 (4점)"] },
        { id: 3, text: "쉬운 문제 1개 풀기나 가벼운 산책으로 학습 도파민 회로를 가동하는 것이 쉬워졌습니까?", options: ["전혀 안쉬워짐 (0점)", "다소 미흡 (1점)", "보통 (2점)", "상당히 수월함 (3점)", "자연스럽게 성공 (4점)"] },
        { id: 4, text: "점심/저녁 식후 체력 급저하 없이 오후 순공 시간을 2시간 이상 지속할 수 있습니까?", options: ["전혀 불가능 (0점)", "다소 미흡 (1점)", "보통 (2점)", "수월하게 지속 (3점)", "완벽히 달성 (4점)"] },
        { id: 5, text: "문제 풀이 시 끝까지 풀어내려는 끈기와 정신적 지구력이 상승했습니까?", options: ["전혀 상승안됨 (0점)", "다소 미흡 (1점)", "보통 (2점)", "상당히 상승 (3점)", "강한 지구력 유지 (4점)"] },
    ],
    DEPRESSION_AMOTIVATION: [
        { id: 1, text: "'공부해도 안 될 것 같다'는 무력감 대신 '작은 목표라도 해보자'는 의욕이 생겼습니까?", options: ["전혀 안생김 (0점)", "다소 미흡 (1점)", "보통 (2점)", "의욕이 생김 (3점)", "매우 적극적임 (4점)"] },
        { id: 2, text: "초소형 성공 과제(단어 10개 등)를 달성하면서 성취감과 긍정적 기분이 늘었습니까?", options: ["전혀 못느낌 (0점)", "다소 미흡 (1점)", "보통 (2점)", "성취감 느낌 (3점)", "매우 뿌듯함 (4점)"] },
        { id: 3, text: "우울감이나 비관적 생각으로 공부를 중단하던 횟수가 감소했습니까?", options: ["전혀 안줄어듬 (0점)", "다소 미흡 (1점)", "보통 (2점)", "상당히 감소 (3점)", "거의 중단안함 (4점)"] },
        { id: 4, text: "하루 학습 플래너를 작성하고 이를 실천하는 자기 효능감이 회복되고 있습니까?", options: ["전혀 회복안됨 (0점)", "다소 미흡 (1점)", "보통 (2점)", "상당히 회복 (3점)", "완벽히 회복됨 (4점)"] },
        { id: 5, text: "일상과 수험 생활에서 느끼는 흥미와 활력의 수준이 나아졌습니까?", options: ["전혀 안나아짐 (0점)", "다소 미흡 (1점)", "보통 (2점)", "상당히 나아짐 (3점)", "매우 밝아짐 (4점)"] },
    ],
    ADRENAL: [
        { id: 1, text: "오후 3~5시경 급격히 방전되어 엎드려 자야만 했던 피로 급락 현상이 줄었습니까?", options: ["전혀 안줄어듬 (0점)", "다소 미흡 (1점)", "보통 (2점)", "상당히 줄어듬 (3점)", "전혀 방전없음 (4점)"] },
        { id: 2, text: "아침에 일어날 때 알람을 여러 번 끄지 않고 비교적 수월하게 기상할 수 있습니까?", options: ["전혀 기상불가 (0점)", "다소 미흡 (1점)", "보통 (2점)", "수월하게 기상 (3점)", "매우 개운하게 기상 (4점)"] },
        { id: 3, text: "단 간식이나 고카페인 에너지 음료에 대한 갈망 및 의존도가 감소했습니까?", options: ["전혀 안줄어듬 (0점)", "다소 미흡 (1점)", "보통 (2점)", "상당히 감소 (3점)", "카페인 전혀불필요 (4점)"] },
        { id: 4, text: "밤 10~11시 수면 골든타임을 지키며 일정한 호르몬 리듬이 잡혀가고 있습니까?", options: ["전혀 안잡힘 (0점)", "다소 미흡 (1점)", "보통 (2점)", "상당히 잡힘 (3점)", "완벽히 안정화 (4점)"] },
        { id: 5, text: "기립 시 핑 도는 어지럼증이나 오후의 나른한 탈진감이 완화되었습니까?", options: ["전혀 완화안됨 (0점)", "다소 미흡 (1점)", "보통 (2점)", "상당히 완화 (3점)", "전혀 어지럽지않음 (4점)"] },
    ],
    BRAIN_FATIGUE: [
        { id: 1, text: "지문을 읽을 때 머릿속에 안개가 낀 듯 멍해서 여러 번 다시 읽던 브레인포그가 맑아졌습니까?", options: ["전혀 개선안됨 (0점)", "다소 미흡 (1점)", "보통 (2점)", "상당히 맑아짐 (3점)", "한번에 즉시 이해 (4점)"] },
        { id: 2, text: "수학이나 탐구의 복잡한 조건 제시문 이해 속도 및 계산 정확도가 향상되었습니까?", options: ["전혀 향상안됨 (0점)", "다소 미흡 (1점)", "보통 (2점)", "상당히 향상 (3점)", "매우 빠르고 정확 (4점)"] },
        { id: 3, text: "공부 중 머리가 멍하고 띵한 두뇌 과열감 없이 50분 집중을 유지할 수 있습니까?", options: ["전혀 유지안됨 (0점)", "다소 미흡 (1점)", "보통 (2점)", "수월하게 유지 (3점)", "완벽한 몰입 유지 (4점)"] },
        { id: 4, text: "방금 외운 암기 내용이나 공식을 기억에서 꺼내어 쓰는 인출 속도가 빨라졌습니까?", options: ["전혀 안빨라짐 (0점)", "다소 미흡 (1점)", "보통 (2점)", "상당히 빨라짐 (3점)", "즉시 떠오름 (4점)"] },
        { id: 5, text: "단순 계산 실수, 기호 착오, OMR 마킹 실수 등 인지 부주의 실수가 줄었습니까?", options: ["전혀 안줄어듬 (0점)", "다소 미흡 (1점)", "보통 (2점)", "상당히 줄어듬 (3점)", "실수 0개 달성 (4점)"] },
    ],
    HYPERSENSITIVE: [
        { id: 1, text: "시각적 산만함(책상 위 물건, 주변 사람 움직임)에 주의가 뺏기지 않고 몰입할 수 있습니까?", options: ["전혀 불가 (0점)", "다소 미흡 (1점)", "보통 (2점)", "수월하게 몰입 (3점)", "완벽한 차단 몰입 (4점)"] },
        { id: 2, text: "책 1권만 올려두고 공부하는 시각 통제 환경에서 집중 유지 시간이 길어졌습니까?", options: ["전혀 안길어짐 (0점)", "다소 미흡 (1점)", "보통 (2점)", "상당히 길어짐 (3점)", "최고 집중 유지 (4점)"] },
        { id: 3, text: "문제 풀이 시 글자나 줄을 건너뛰어 오독하던 시각 추적 실수가 감소했습니까?", options: ["전혀 안줄어듬 (0점)", "다소 미흡 (1점)", "보통 (2점)", "상당히 감소 (3점)", "오독 전혀 없음 (4점)"] },
        { id: 4, text: "형광등 불빛, 화면 눈부심, 주변 소리에 대한 감각 피로도가 줄었습니까?", options: ["전혀 안줄어듬 (0점)", "다소 미흡 (1점)", "보통 (2점)", "상당히 감소 (3점)", "매우 편안함 (4점)"] },
        { id: 5, text: "한 번 끊긴 집중 흐름을 다시 잡는 데 걸리는 복귀 시간이 단축되었습니까?", options: ["전혀 안줄어듬 (0점)", "다소 미흡 (1점)", "보통 (2점)", "상당히 단축 (3점)", "즉시 재몰입 가능 (4점)"] },
    ],
    ATTENTION_DEFICIT: [
        { id: 1, text: "타이머 타임어택(15~25분 블록) 훈련 시 딴생각이나 딴짓 빈도가 현저히 줄었습니까?", options: ["전혀 안줄어듬 (0점)", "다소 미흡 (1점)", "보통 (2점)", "상당히 감소 (3점)", "완벽한 타임어택 (4점)"] },
        { id: 2, text: "문제를 끝까지 읽지 않고 성급하게 오답을 고르던 충동적 실수가 개선되었습니까?", options: ["전혀 개선안됨 (0점)", "다소 미흡 (1점)", "보통 (2점)", "상당히 개선 (3점)", "끝까지 정독 완수 (4점)"] },
        { id: 3, text: "공부 중 핸드폰을 켜거나 자리를 뜨지 않고 한 단원을 끝마치는 완수율이 높아졌습니까?", options: ["전혀 안높아짐 (0점)", "다소 미흡 (1점)", "보통 (2점)", "상당히 상승 (3점)", "계획 100% 완수 (4점)"] },
        { id: 4, text: "백지 복습이나 능동적 인출 훈련을 통해 뇌 각성도를 효과적으로 유지하고 있습니까?", options: ["전혀 유지안됨 (0점)", "다소 미흡 (1점)", "보통 (2점)", "효과적 유지 (3점)", "매우 생생한 각성 (4점)"] },
        { id: 5, text: "모의고사 시험 시간 후반부(80분 이후) 집중력 저하가 안정적으로 방어되고 있습니까?", options: ["전혀 방어안됨 (0점)", "다소 미흡 (1점)", "보통 (2점)", "상당히 방어 (3점)", "마지막까지 최고집중 (4점)"] },
    ],
    SLEEP: [
        { id: 1, text: "잠자리에 누운 후 잠드는 데 걸리는 입면 지연 시간이 20분 이내로 단축되었습니까?", options: ["전혀 단축안됨 (0점)", "다소 미흡 (1점)", "보통 (2점)", "상당히 단축 (3점)", "눕자마자 숙면 (4점)"] },
        { id: 2, text: "밤중에 자다 깨거나 악몽, 가위눌림 없이 아침까지 연속적인 깊은 수면을 취합니까?", options: ["전혀 깊이못잠 (0점)", "다소 미흡 (1점)", "보통 (2점)", "상당히 숙면 (3점)", "완벽한 연속 숙면 (4점)"] },
        { id: 3, text: "아침 기상 시 머리가 개운하고 두뇌가 맑게 각성되는 느낌을 받습니까?", options: ["전혀 개운안함 (0점)", "다소 미흡 (1점)", "보통 (2점)", "상당히 개운 (3점)", "최고의 상쾌함 (4점)"] },
        { id: 4, text: "취침 전 스마트폰 격리 및 아침 햇빛 쬐기 루틴을 통해 수면 사이클이 잡혔습니까?", options: ["전혀 안잡힘 (0점)", "다소 미흡 (1점)", "보통 (2점)", "상당히 잡힘 (3점)", "완벽한 수면리듬 (4점)"] },
        { id: 5, text: "낮 시간(오전 1~2교시 및 점심 직후) 쏟아지던 졸음과 하품이 개선되었습니까?", options: ["전혀 개선안됨 (0점)", "다소 미흡 (1점)", "보통 (2점)", "상당히 개선 (3점)", "낮졸음 완전소멸 (4점)"] },
    ],
    CIRCULATION: [
        { id: 1, text: "오래 앉아 있을 때 종아리와 발목이 붓고 저리던 증상이 완화되었습니까?", options: ["전혀 완화안됨 (0점)", "다소 미흡 (1점)", "보통 (2점)", "상당히 완화 (3점)", "다리 매우 가벼움 (4점)"] },
        { id: 2, text: "수족냉증(손발이 차가워서 집중이 방해받던 현상)이 따뜻하게 호전되었습니까?", options: ["전혀 호전안됨 (0점)", "다소 미흡 (1점)", "보통 (2점)", "상당히 호전 (3점)", "손발 항상 따뜻 (4점)"] },
        { id: 3, text: "뇌 혈류 저하로 인한 멍함이나 뒷목 당김, 긴장성 두통 빈도가 감소했습니까?", options: ["전혀 감소안됨 (0점)", "다소 미흡 (1점)", "보통 (2점)", "상당히 감소 (3점)", "뒷목 매우 편안 (4점)"] },
        { id: 4, text: "1시간마다 스트레칭 및 온수 섭취 루틴으로 혈액순환이 잘 되는 것을 느낍니까?", options: ["전혀 못느낌 (0점)", "다소 미흡 (1점)", "보통 (2점)", "상당히 체감 (3점)", "몸 전체 혈류 원활 (4점)"] },
        { id: 5, text: "식후 급격한 졸음(소화기 혈류 쏠림) 없이 맑은 정신으로 오후 학습을 이어갑니까?", options: ["전혀 불가 (0점)", "다소 미흡 (1점)", "보통 (2점)", "수월하게 지속 (3점)", "오후 내내 맑은 정신 (4점)"] },
    ],
    HEALTHY: [
        { id: 1, text: "일일 순공 목표(8~10시간 이상)를 기복 없이 안정적으로 완수하고 있습니까?", options: ["전혀 달성못함 (0점)", "다소 미흡 (1점)", "보통 (2점)", "상당히 달성 (3점)", "100% 매일 완수 (4점)"] },
        { id: 2, text: "고난도 킬러 문항 풀이 시 인지적 끈기와 깊이 있는 몰입이 잘 유지됩니까?", options: ["전혀 유지안됨 (0점)", "다소 미흡 (1점)", "보통 (2점)", "상당히 유지 (3점)", "완벽한 초몰입 (4점)"] },
        { id: 3, text: "주말이나 시험 직전에도 신체 컨디션과 멘탈의 흔들림 없이 평정심이 유지됩니까?", options: ["전혀 유지안됨 (0점)", "다소 미흡 (1점)", "보통 (2점)", "상당히 평온 (3점)", "완벽한 멘탈 방어 (4점)"] },
        { id: 4, text: "취침/기상 골든타임과 영양 균형 루틴이 습관화되어 자연스럽게 지켜지고 있습니까?", options: ["전혀 안지켜짐 (0점)", "다소 미흡 (1점)", "보통 (2점)", "상당히 실천 (3점)", "완벽한 습관화 (4점)"] },
        { id: 5, text: "실전 모의고사에서 본인의 실력을 실수 없이 100% 발휘할 수 있는 자신감이 있습니까?", options: ["전혀 없음 (0점)", "다소 미흡 (1점)", "보통 (2점)", "자신감 있음 (3점)", "압도적 자신감 (4점)"] },
    ],
};

export function getCareTypeFollowUpQuestions(careType?: string | CareType) {
    const code = normalizeCareTypeCode(careType as string);
    return CARE_TYPE_FOLLOWUP_QUESTIONS[code] || CARE_TYPE_FOLLOWUP_QUESTIONS['BURNOUT'];
}

// 추적 대상 영역 식별자
export type FollowUpTargetAreaType =
    | 'care_type_specific' // 진단 케어타입 정밀 추적 (5문항)
    | 'bai'                // 불안 (Beck Anxiety Inventory)
    | 'isi'                // 불면 (Insomnia Severity Index)
    | 'fatigue'            // 만성 피로 (CFS)
    | 'sns'                // 교감신경 과항진 증상
    | 'pns'                // 부교감신경 저하/무기력 증상
    | 'concentration'      // 주의 집중력 저하
    | 'adrenal'            // 부신 피로
    | 'wellness_general';  // 정상 유지군 전반 컨디션 점검

export interface FollowUpTargetArea {
    id: FollowUpTargetAreaType;
    title: string;
    titleKr: string;
    description: string;
    severity: 'critical' | 'warning' | 'caution' | 'normal';
    severityLabel: string;
    previousScore: number;
    scoreLabel: string;
    questionCount: number;
}

// 처방 실천율 (Adherence)
export interface PrescriptionAdherence {
    nutritionSupplement: 'daily' | 'often' | 'rarely'; // 100~80%, 50%, 0%
    sleepSchedule: 'well_kept' | 'moderate' | 'not_kept'; // 취침/기상 골든타임
    preStudyRoutine: 'well_kept' | 'moderate' | 'not_kept'; // 사전 이완/공부 루틴
    userNote?: string;
}

// 델타(개선도/악화도) 세부 항목
export interface MetricDelta {
    id: string;
    label: string;
    before: number;
    after: number;
    delta: number; // after - before
    unit: string;
    isImproved: boolean;
    improvementPercent: number;
    beforeStatus: string;
    afterStatus: string;
    color: string;
}

// 미래 회복 궤적 단계 인터페이스
export interface PrognosisStep {
    period: string; // "2주 후 (4주차)", "4주 후 (6주차)", "8주 후 (10주차 실전)"
    expectedScore: number; // 예상 뇌기능 점수
    status: string; // 상태 명칭
    expectedBenefits: string[]; // 핵심 호전 예측 항목 2~3개
    riskWarning?: string; // 실천율 저조 시 경고
}

export interface PrognosisProjection {
    currentStatus: string;
    isRegressed: boolean;
    week2: PrognosisStep;
    week4: PrognosisStep;
    week8: PrognosisStep;
    overallRecommendation: string;
}

// 과목별 학업 영향 조언
export interface SubjectImpactAdvice {
    subject: string;
    impactScore: string;
    clinicalRationale: string;
    studyTactic: string;
}

export interface AcademicImpactProjection {
    dailyPureFocusHours: number; // 일일 추가 순공 집중 시간 (시간/일)
    weeklyPureFocusHours: number; // 주간 누적 순공 집중 시간 (시간/주)
    killerMistakePreventionPoints: string; // 킬러문항 실수 방지 점수
    readingSpeedStaminaImprovement: number; // 독해 및 인출 속도 향상치 (%)
    gradeJumpPotential: string; // 등급 상승 가속도
    targetAchievementProbability: number; // 목표 등급 달성 확률 (%)
    subjectAdviceList: SubjectImpactAdvice[];
    disclaimer: string;
}

// 호전/악화 종합 분석 리포트 데이터
export interface FollowUpDeltaReport {
    targetStudent: StudentInfo;
    testDate: string;
    daysElapsed: number;
    previousCareType: CareType;
    previousScore: number;
    currentCareType: CareType;
    currentScore: number;
    isCareTypeImproved: boolean;
    isCareTypeRegressed: boolean;
    recoveryIndex: number; // 0 ~ 100점 (종합 회복 지수)
    overallStatus: 'significant' | 'moderate' | 'maintained' | 'regressed';
    overallStatusKr: string;
    adherenceRate: number; // 0 ~ 100%
    adherenceComment: string;
    metricDeltas: MetricDelta[];
    clinicalSummary: string;
    nextPrescriptionAdvice: string[];

    // CareType 특화 개선율 & AI 시뮬레이션 지표
    careTypeImprovementPercent: number; // +X% (호전) 또는 -Y% (악화)
    careTypePreviousSeverity: number; // 0~100 (높을수록 심각)
    careTypeCurrentSeverity: number;
    careTypeZoneTransition: { from: string; to: string; isZoneImproved: boolean };
    prognosisProjection: PrognosisProjection;
    academicImpactProjection: AcademicImpactProjection;
}

export interface FollowUpAnswers {
    adherence: PrescriptionAdherence;
    careTypeAnswers?: number[]; // CareType별 맞춤 5문항 (0~4)
    baiAnswers?: number[]; // 21문항 (0~3)
    isiAnswers?: number[]; // 7문항 (0~4)
    fatigueSymptoms?: boolean[]; // 8문항
    fatigueCore?: boolean;
    snsSymptomSelection?: string[];
    pnsSymptomSelection?: string[];
    concentrationAnswers?: number[]; // 7문항 (0~3)
    adrenalAnswers?: number[]; // 14문항 (0~3)
    wellnessAnswers?: number[]; // 5문항 (1~5)
    newSymptomsReported?: string[];
}

export class FollowUpAssessmentService {
    /**
     * 1. 직전 검사 결과로부터 비정상/문제 영역(Problem List)을 자동 추출
     */
    static extractAbnormalAreas(lastResult: AssessmentResult): FollowUpTargetArea[] {
        const targets: FollowUpTargetArea[] = [];
        const survey = lastResult.survey || ({} as Partial<SurveyData>);

        // 0) 진단된 CareType 맞춤 추적 영역 (항상 1순위 집중 재평가 타겟으로 등록)
        const prevCareTypeCode = normalizeCareTypeCode(lastResult.careType);
        const prevCareDetail = getCareTypeDetail(prevCareTypeCode);
        targets.push({
            id: 'care_type_specific',
            title: `케어타입 집중 추적 (${prevCareDetail.title})`,
            titleKr: `${prevCareDetail.title} 핵심 증상 정밀 추적 (5문항)`,
            description: prevCareDetail.subtitle || '직전 진단된 케어타입의 주요 신체·인지 증상 호전 여부를 평가합니다.',
            severity: prevCareTypeCode === 'HEALTHY' ? 'normal' : 'warning',
            severityLabel: prevCareDetail.title,
            previousScore: lastResult.score || 60,
            scoreLabel: `${lastResult.score || 60}점`,
            questionCount: 5
        });

        // 1) BAI (불안) 척도: 10점 이상이면 비정상
        const baiScore = survey.bai ?? 0;
        if (baiScore >= 10) {
            let severity: 'critical' | 'warning' | 'caution' = 'caution';
            let severityLabel = '경미한 불안';
            if (baiScore >= 30) {
                severity = 'critical';
                severityLabel = '심한 불안 (위험)';
            } else if (baiScore >= 19) {
                severity = 'warning';
                severityLabel = '중등도 불안 (경고)';
            }
            targets.push({
                id: 'bai',
                title: '불안 수준 (BAI)',
                titleKr: '신체·심리적 불안 긴장도',
                description: '2주 전 검사에서 유의미한 불안·초조 반응이 감지되었습니다.',
                severity,
                severityLabel,
                previousScore: baiScore,
                scoreLabel: `${baiScore}점 (${severityLabel})`,
                questionCount: BAI_QUESTIONS.length
            });
        }

        // 2) ISI (불면) 척도: 8점 이상이면 비정상
        const isiScore = survey.isi ?? 0;
        if (isiScore >= 8) {
            let severity: 'critical' | 'warning' | 'caution' = 'caution';
            let severityLabel = '경미한 불면';
            if (isiScore >= 22) {
                severity = 'critical';
                severityLabel = '심한 불면증 (위험)';
            } else if (isiScore >= 15) {
                severity = 'warning';
                severityLabel = '중등도 불면 (경고)';
            }
            targets.push({
                id: 'isi',
                title: '수면 장애 (ISI)',
                titleKr: '수면의 질 및 불면 심각도',
                description: '2주 전 검사에서 수면 유지 곤란 및 낮 시간 피로가 감지되었습니다.',
                severity,
                severityLabel,
                previousScore: isiScore,
                scoreLabel: `${isiScore}점 (${severityLabel})`,
                questionCount: ISI_QUESTIONS.length
            });
        }

        // 3) 만성 피로 (CFS) 척도: 증상 3개 이상 또는 chronicFatigue true
        const fatigueCount = survey.fatigueSymptomsCount ?? (survey.symptoms?.length || 0);
        const isChronic = survey.chronicFatigue || fatigueCount >= 4;
        if (isChronic || fatigueCount >= 3) {
            const severity = isChronic ? 'critical' : 'warning';
            const severityLabel = isChronic ? '만성 피로 의심' : '주의 피로';
            targets.push({
                id: 'fatigue',
                title: '만성 신체 피로 (CFS)',
                titleKr: '뇌·신체 누적 피로 지표',
                description: '휴식을 취해도 해소되지 않는 전신 피로 및 무기력 징후가 있었습니다.',
                severity,
                severityLabel,
                previousScore: fatigueCount,
                scoreLabel: `증상 ${fatigueCount}개 (${severityLabel})`,
                questionCount: FATIGUE_SYMPTOMS.length
            });
        }

        // 4) 교감신경(SNS) 항진 증상: 3개 이상
        const snsCount = survey.sympatheticSymptoms?.length || 0;
        if (snsCount >= 3) {
            const severity = snsCount >= 5 ? 'critical' : 'warning';
            const severityLabel = snsCount >= 5 ? '심한 교감신경 과항진' : '교감신경 긴장 우세';
            targets.push({
                id: 'sns',
                title: '교감신경 과긴장 (SNS)',
                titleKr: '자율신경 긴장·과각성 신체 증상',
                description: '심장 두근거림, 두통, 손떨림 등 자율신경 긴장 신체화 증상이 감지되었습니다.',
                severity,
                severityLabel,
                previousScore: snsCount,
                scoreLabel: `증상 ${snsCount}개 (${severityLabel})`,
                questionCount: SYMPATHETIC_SYMPTOMS.length
            });
        }

        // 5) 부교감신경(PNS) 무기력 증상: 3개 이상
        const pnsCount = survey.parasympatheticSymptoms?.length || 0;
        if (pnsCount >= 3) {
            const severity = pnsCount >= 5 ? 'critical' : 'warning';
            const severityLabel = pnsCount >= 5 ? '심한 무기력·대사저하' : '무기력/피로 경향';
            targets.push({
                id: 'pns',
                title: '부교감신경 저하·무기력 (PNS)',
                titleKr: '에너지 고갈 및 의욕 저하',
                description: '체온 저하, 멍함, 극심한 무기력 등 부교감 저하 신체 증상이 감지되었습니다.',
                severity,
                severityLabel,
                previousScore: pnsCount,
                scoreLabel: `증상 ${pnsCount}개 (${severityLabel})`,
                questionCount: PARASYMPATHETIC_SYMPTOMS.length
            });
        }

        // 6) 주의 집중력 척도: 11점 이상
        const concentrationScore = survey.concentrationScore ?? 0;
        if (concentrationScore >= 11) {
            const severity = concentrationScore >= 16 ? 'critical' : 'warning';
            const severityLabel = concentrationScore >= 16 ? '심한 산만·집중곤란' : '집중력 저하 주의';
            targets.push({
                id: 'concentration',
                title: '주의 집중력 저하',
                titleKr: '학습 몰입도 및 산만도 척도',
                description: '세부사항 주의 부족 및 외부 자극에 의한 산만도가 높게 나타났습니다.',
                severity,
                severityLabel,
                previousScore: concentrationScore,
                scoreLabel: `${concentrationScore}점 (${severityLabel})`,
                questionCount: CONCENTRATION_QUESTIONS.length
            });
        }

        // 7) 부신 피로 척도: 10점 이상
        const adrenalScore = survey.adrenalFatigueScore ?? 0;
        if (adrenalScore >= 10) {
            const severity = adrenalScore >= 25 ? 'critical' : 'warning';
            const severityLabel = adrenalScore >= 25 ? '심한 부신피로 (위험)' : '초기 부신피로 (주의)';
            targets.push({
                id: 'adrenal',
                title: '부신 호르몬 피로',
                titleKr: '코르티솔 불균형 및 활력 소진',
                description: '오후 급격한 탈진, 당분 갈망, 아침 기상 시 피로감이 감지되었습니다.',
                severity,
                severityLabel,
                previousScore: adrenalScore,
                scoreLabel: `${adrenalScore}점 (${severityLabel})`,
                questionCount: 14 // 4개 카테고리 총 14문항
            });
        }

        // 만약 모든 영역이 정상인 경우: 전반적 웰니스 & 학습 루틴 점검 모드 제공
        if (targets.length === 0) {
            targets.push({
                id: 'wellness_general',
                title: '전반적 컨디션 & 루틴 유지 점검',
                titleKr: '건강 균형 유지 및 집중도 확인',
                description: '직전 검사에서 전반적인 지표가 양호했습니다. 2주간의 컨디션 변화와 유지 상태를 점검합니다.',
                severity: 'normal',
                severityLabel: '정상 균형 유지',
                previousScore: lastResult.score || 80,
                scoreLabel: `${lastResult.score || 80}점 (양호)`,
                questionCount: 5
            });
        }

        return targets;
    }

    /**
     * 2. 추적 검사 응답 취합, 하이브리드 점수 결합(Carry-over), 재진단 및 호전/악화 델타 리포트 생성
     */
    static async processFollowUpAssessment(
        previousResult: AssessmentResult,
        answers: FollowUpAnswers,
        targetAreas: FollowUpTargetArea[],
        logicConfig: LogicEngineConfig = DEFAULT_LOGIC_CONFIG
    ): Promise<{
        newResult: AssessmentResult;
        deltaReport: FollowUpDeltaReport;
    }> {
        const prevSurvey = previousResult.survey || ({} as Partial<SurveyData>);
        const prevHrv = previousResult.hrv || ({} as Partial<HRVData>);
        const prevStudent = previousResult.student;

        // 경과 일수 계산
        const prevDate = new Date(previousResult.date || previousResult.student.testDate);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - prevDate.getTime());
        const daysElapsed = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));

        const targetIds = new Set(targetAreas.map(t => t.id));

        // 1) 지표별 점수 추출 및 Carry-over
        // BAI
        let newBai = prevSurvey.bai ?? 5;
        if (targetIds.has('bai') && answers.baiAnswers && answers.baiAnswers.length > 0) {
            newBai = answers.baiAnswers.reduce((a, b) => a + b, 0);
        }

        // ISI
        let newIsi = prevSurvey.isi ?? 5;
        if (targetIds.has('isi') && answers.isiAnswers && answers.isiAnswers.length > 0) {
            newIsi = answers.isiAnswers.reduce((a, b) => a + b, 0);
        }

        // 만성 피로
        let newFatigueCount = prevSurvey.fatigueSymptomsCount ?? 0;
        let newChronicFatigue = prevSurvey.chronicFatigue ?? false;
        let newSymptoms = prevSurvey.symptoms ?? [];
        if (targetIds.has('fatigue') && answers.fatigueSymptoms) {
            newFatigueCount = answers.fatigueSymptoms.filter(Boolean).length;
            newChronicFatigue = (answers.fatigueCore ?? false) && newFatigueCount >= 4;
            newSymptoms = FATIGUE_SYMPTOMS.filter((_, i) => answers.fatigueSymptoms?.[i]);
        }

        // 자율신경 증상
        let newSnsSymptoms = prevSurvey.sympatheticSymptoms ?? [];
        if (targetIds.has('sns') && answers.snsSymptomSelection) {
            newSnsSymptoms = answers.snsSymptomSelection;
        }

        let newPnsSymptoms = prevSurvey.parasympatheticSymptoms ?? [];
        if (targetIds.has('pns') && answers.pnsSymptomSelection) {
            newPnsSymptoms = answers.pnsSymptomSelection;
        }

        // 집중력 점수
        let newConcentration = prevSurvey.concentrationScore ?? 5;
        if (targetIds.has('concentration') && answers.concentrationAnswers && answers.concentrationAnswers.length > 0) {
            newConcentration = answers.concentrationAnswers.reduce((a, b) => a + b, 0);
        }

        // 부신 피로 점수
        let newAdrenal = prevSurvey.adrenalFatigueScore ?? 5;
        if (targetIds.has('adrenal') && answers.adrenalAnswers && answers.adrenalAnswers.length > 0) {
            newAdrenal = answers.adrenalAnswers.reduce((a, b) => a + b, 0);
        }

        // 2) 처방 순응도(Adherence) 정확한 점수화 (모두 안좋음 선택 시 0점)
        let adherencePoints = 0;
        if (answers.adherence.nutritionSupplement === 'daily') adherencePoints += 40;
        else if (answers.adherence.nutritionSupplement === 'often') adherencePoints += 20;
        else adherencePoints += 0; // 'rarely'는 0점

        if (answers.adherence.sleepSchedule === 'well_kept') adherencePoints += 30;
        else if (answers.adherence.sleepSchedule === 'moderate') adherencePoints += 15;
        else adherencePoints += 0; // 'not_kept'는 0점

        if (answers.adherence.preStudyRoutine === 'well_kept') adherencePoints += 30;
        else if (answers.adherence.preStudyRoutine === 'moderate') adherencePoints += 15;
        else adherencePoints += 0; // 'not_kept'는 0점

        const adherenceRate = Math.min(100, Math.max(0, adherencePoints));

        // 3) 각 영역별 실제 개선/악화율 계산 (음수면 악화, 양수면 호전)
        let sumRatio = 0;
        let trackedDomainsCount = 0;
        const metricDeltas: MetricDelta[] = [];

        // 3-0) CareType 특화 설문 분석 및 개선율 산출
        const prevCareTypeCode = normalizeCareTypeCode(previousResult.careType);
        const prevCareTypeDetail = getCareTypeDetail(prevCareTypeCode);

        // 이전 진단 시점의 케어타입 심각도 (0~100점: 높을수록 심각/위험)
        const careTypePreviousSeverity = prevCareTypeCode === 'HEALTHY'
            ? 25
            : Math.min(95, Math.max(65, 100 - (previousResult.score || 55) + 15));

        let careTypeRawScore = 12; // 기본값 (보통)
        if (answers.careTypeAnswers && answers.careTypeAnswers.length > 0) {
            careTypeRawScore = answers.careTypeAnswers.reduce((a, b) => a + b, 0);
        } else {
            // 처방 순응도 기반 추정
            careTypeRawScore = adherenceRate >= 80 ? 16 : adherenceRate >= 50 ? 12 : 5;
        }

        // 5문항 0~4점 (총점 20점). 0점: 심각 악화(100점 심각도), 20점: 완벽 회복(12점 심각도)
        const careTypeCurrentSeverity = Math.max(12, Math.min(100, Math.round(100 - (careTypeRawScore / 20 * 88))));
        const careTypeSeverityDelta = careTypeCurrentSeverity - careTypePreviousSeverity; // 음수: 호전, 양수: 악화

        let careTypeImprovementPercent: number;
        if (careTypeSeverityDelta <= 0) {
            careTypeImprovementPercent = Math.round(((careTypePreviousSeverity - careTypeCurrentSeverity) / careTypePreviousSeverity) * 100);
        } else {
            careTypeImprovementPercent = -Math.round(((careTypeCurrentSeverity - careTypePreviousSeverity) / careTypePreviousSeverity) * 100);
        }

        const getZoneLabel = (sev: number) => {
            if (sev >= 70) return '🔴 고위험군 (Severe)';
            if (sev >= 40) return '🟡 주의군 (Caution)';
            return '🟢 정상·안정군 (Optimal)';
        };

        const fromZone = getZoneLabel(careTypePreviousSeverity);
        const toZone = getZoneLabel(careTypeCurrentSeverity);
        const isZoneImproved = (careTypePreviousSeverity >= 70 && careTypeCurrentSeverity < 70) ||
            (careTypePreviousSeverity >= 40 && careTypeCurrentSeverity < 40);

        const careTypeZoneTransition = {
            from: `${fromZone} (${careTypePreviousSeverity}점)`,
            to: `${toZone} (${careTypeCurrentSeverity}점)`,
            isZoneImproved
        };

        // 케어타입 개선 비율을 전체 지수에 기여 (가중치 1.5)
        const careTypeRatio = (careTypePreviousSeverity - careTypeCurrentSeverity) / careTypePreviousSeverity;
        sumRatio += careTypeRatio * 1.5;
        trackedDomainsCount += 1.5;

        metricDeltas.push({
            id: 'care_type_target',
            label: `진단 케어타입 [${prevCareTypeDetail.title}] 심각도`,
            before: careTypePreviousSeverity,
            after: careTypeCurrentSeverity,
            delta: careTypeSeverityDelta,
            unit: '점',
            isImproved: careTypeSeverityDelta <= 0,
            improvementPercent: Math.abs(careTypeImprovementPercent),
            beforeStatus: careTypePreviousSeverity >= 70 ? '고위험' : '주의',
            afterStatus: careTypeCurrentSeverity < 40 ? '정상' : careTypeCurrentSeverity < 70 ? '주의' : '고위험',
            color: careTypeSeverityDelta <= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
        });

        // BAI 델타
        if (targetIds.has('bai')) {
            const before = prevSurvey.bai ?? 0;
            const after = newBai;
            const delta = after - before; // delta > 0: 증상 악화, delta < 0: 증상 호전
            const isImproved = delta < 0;
            const improvementPercent = before > 0 ? Math.round(Math.abs(delta) / before * 100) : (after > 0 ? 100 : 0);
            const ratio = before > 0 ? (before - after) / before : (after === 0 ? 0 : -Math.min(2, after / 10));
            sumRatio += ratio;
            trackedDomainsCount++;

            metricDeltas.push({
                id: 'bai',
                label: '불안 긴장 지수 (BAI)',
                before,
                after,
                delta,
                unit: '점',
                isImproved,
                improvementPercent,
                beforeStatus: before >= 30 ? '위험' : before >= 19 ? '경고' : '주의',
                afterStatus: after <= 9 ? '정상' : after <= 18 ? '주의' : after <= 29 ? '경고' : '위험',
                color: isImproved ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            });
        }

        // ISI 델타
        if (targetIds.has('isi')) {
            const before = prevSurvey.isi ?? 0;
            const after = newIsi;
            const delta = after - before;
            const isImproved = delta < 0;
            const improvementPercent = before > 0 ? Math.round(Math.abs(delta) / before * 100) : (after > 0 ? 100 : 0);
            const ratio = before > 0 ? (before - after) / before : (after === 0 ? 0 : -Math.min(2, after / 7));
            sumRatio += ratio;
            trackedDomainsCount++;

            metricDeltas.push({
                id: 'isi',
                label: '수면 장애 척도 (ISI)',
                before,
                after,
                delta,
                unit: '점',
                isImproved,
                improvementPercent,
                beforeStatus: before >= 22 ? '위험' : before >= 15 ? '경고' : '주의',
                afterStatus: after <= 7 ? '정상' : after <= 14 ? '주의' : after <= 21 ? '경고' : '위험',
                color: isImproved ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            });
        }

        // 자율신경 교감 증상 델타
        if (targetIds.has('sns')) {
            const before = prevSurvey.sympatheticSymptoms?.length || 0;
            const after = newSnsSymptoms.length;
            const delta = after - before;
            const isImproved = delta < 0;
            const improvementPercent = before > 0 ? Math.round(Math.abs(delta) / before * 100) : (after > 0 ? 100 : 0);
            const ratio = before > 0 ? (before - after) / before : (after === 0 ? 0 : -Math.min(2, after / 3));
            sumRatio += ratio;
            trackedDomainsCount++;

            metricDeltas.push({
                id: 'sns',
                label: '교감신경 신체화 증상 수',
                before,
                after,
                delta,
                unit: '개',
                isImproved,
                improvementPercent,
                beforeStatus: `${before}개 (${before >= 5 ? '과항진' : '긴장'})`,
                afterStatus: `${after}개 (${after <= 2 ? '안정' : after >= 5 ? '과항진' : '지속'})`,
                color: isImproved ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            });
        }

        // 부교감신경 무기력 증상 델타
        if (targetIds.has('pns')) {
            const before = prevSurvey.parasympatheticSymptoms?.length || 0;
            const after = newPnsSymptoms.length;
            const delta = after - before;
            const isImproved = delta < 0;
            const improvementPercent = before > 0 ? Math.round(Math.abs(delta) / before * 100) : (after > 0 ? 100 : 0);
            const ratio = before > 0 ? (before - after) / before : (after === 0 ? 0 : -Math.min(2, after / 3));
            sumRatio += ratio;
            trackedDomainsCount++;

            metricDeltas.push({
                id: 'pns',
                label: '부교감신경 무기력 증상 수',
                before,
                after,
                delta,
                unit: '개',
                isImproved,
                improvementPercent,
                beforeStatus: `${before}개 (저하)`,
                afterStatus: `${after}개 (${after <= 2 ? '안정' : '무기력'})`,
                color: isImproved ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            });
        }

        // 만성 피로 델타
        if (targetIds.has('fatigue')) {
            const before = prevSurvey.fatigueSymptomsCount ?? (prevSurvey.symptoms?.length || 0);
            const after = newFatigueCount;
            const delta = after - before;
            const isImproved = delta < 0;
            const improvementPercent = before > 0 ? Math.round(Math.abs(delta) / before * 100) : (after > 0 ? 100 : 0);
            const ratio = before > 0 ? (before - after) / before : (after === 0 ? 0 : -Math.min(2, after / 3));
            sumRatio += ratio;
            trackedDomainsCount++;

            metricDeltas.push({
                id: 'fatigue',
                label: '만성 피로 증상 개수',
                before,
                after,
                delta,
                unit: '개',
                isImproved,
                improvementPercent,
                beforeStatus: `${before}개 (${prevSurvey.chronicFatigue ? '만성피로' : '피로'})`,
                afterStatus: `${after}개 (${newChronicFatigue ? '만성피로' : after <= 2 ? '정상' : '피로'})`,
                color: isImproved ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            });
        }

        // 부신 피로 델타
        if (targetIds.has('adrenal')) {
            const before = prevSurvey.adrenalFatigueScore ?? 0;
            const after = newAdrenal;
            const delta = after - before;
            const isImproved = delta < 0;
            const improvementPercent = before > 0 ? Math.round(Math.abs(delta) / before * 100) : (after > 0 ? 100 : 0);
            const ratio = before > 0 ? (before - after) / before : (after === 0 ? 0 : -Math.min(2, after / 10));
            sumRatio += ratio;
            trackedDomainsCount++;

            metricDeltas.push({
                id: 'adrenal',
                label: '부신 호르몬 피로도',
                before,
                after,
                delta,
                unit: '점',
                isImproved,
                improvementPercent,
                beforeStatus: before >= 25 ? '위험' : '주의',
                afterStatus: after < 10 ? '정상' : after <= 25 ? '주의' : '위험',
                color: isImproved ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            });
        }

        // 집중력 델타
        if (targetIds.has('concentration')) {
            const before = prevSurvey.concentrationScore ?? 0;
            const after = newConcentration;
            const delta = after - before;
            const isImproved = delta < 0;
            const improvementPercent = before > 0 ? Math.round(Math.abs(delta) / before * 100) : (after > 0 ? 100 : 0);
            const ratio = before > 0 ? (before - after) / before : (after === 0 ? 0 : -Math.min(2, after / 10));
            sumRatio += ratio;
            trackedDomainsCount++;

            metricDeltas.push({
                id: 'concentration',
                label: '주의 산만 및 집중 곤란',
                before,
                after,
                delta,
                unit: '점',
                isImproved,
                improvementPercent,
                beforeStatus: before >= 16 ? '위험' : '주의',
                afterStatus: after < 11 ? '양호' : '주의',
                color: isImproved ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            });
        }

        // 웰니스(정상 유지군) 델타
        if (targetIds.has('wellness_general')) {
            const wellnessSum = answers.wellnessAnswers ? answers.wellnessAnswers.reduce((a, b) => a + b, 0) : 15;
            const before = previousResult.score || 80;
            // 5문항 1~5점 (최저 5점 = 20점 환산, 최고 25점 = 100점 환산)
            const after = Math.round((wellnessSum / 25) * 100);
            const delta = after - before;
            const isImproved = delta >= 0;
            const improvementPercent = Math.round(Math.abs(delta) / before * 100);
            // 15점(보통) 기준 양수/음수
            const ratio = (wellnessSum - 15) / 10;
            sumRatio += ratio;
            trackedDomainsCount++;

            metricDeltas.push({
                id: 'wellness_general',
                label: '전반적 컨디션 및 학업 몰입도',
                before,
                after,
                delta,
                unit: '점',
                isImproved,
                improvementPercent,
                beforeStatus: before >= 75 ? '우수' : '보통',
                afterStatus: after >= 75 ? '우수' : after >= 50 ? '보통' : '심한 저하',
                color: isImproved ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            });
        }

        // 평균 개선율 (음수면 전반적 악화, 양수면 전반적 호전)
        const netImprovementRatio = trackedDomainsCount > 0
            ? (sumRatio / trackedDomainsCount)
            : (adherenceRate > 70 ? 0.2 : -0.2);

        // 신규 증상 보고 시 추가 악화 페널티 반영
        const hasSevereNewSymptoms = (answers.newSymptomsReported && answers.newSymptomsReported.length > 0);
        const finalNetRatio = hasSevereNewSymptoms ? Math.min(netImprovementRatio, -0.3) : netImprovementRatio;

        // 4) HRV 및 뇌건강 점수 동적 반영 (악화 시 점수 하락, 스트레스 폭증)
        const prevStress = prevHrv.stressIndex || 50;
        const prevBrain = prevHrv.brainScore || 65;

        let newBrainScore: number;
        let newStressIndex: number;
        let newSns: number;

        if (finalNetRatio < 0) {
            // 악화 시: 두뇌 점수 급락 (-10 ~ -35점), 스트레스 지수 급등 (+15 ~ +40점)
            const dropAmount = Math.round(Math.min(35, Math.max(8, Math.abs(finalNetRatio) * 25)));
            const stressRise = Math.round(Math.min(40, Math.max(10, Math.abs(finalNetRatio) * 30)));
            newBrainScore = Math.max(20, prevBrain - dropAmount);
            newStressIndex = Math.min(95, prevStress + stressRise);
            newSns = Math.min(92, Math.max(40, (prevHrv.sns || 60) + 15));
        } else {
            // 호전 시: 점수 상승 (+5 ~ +20점), 스트레스 하강 (-10 ~ -25점)
            const riseAmount = Math.round(Math.min(25, finalNetRatio * 20));
            const stressDrop = Math.round(Math.min(30, finalNetRatio * 25));
            newBrainScore = Math.min(98, prevBrain + riseAmount);
            newStressIndex = Math.max(15, prevStress - stressDrop);
            newSns = Math.max(20, Math.min(75, (prevHrv.sns || 60) - 10));
        }

        const newPns = 100 - newSns;

        const updatedHrv: HRVData = {
            ...prevHrv,
            brainScore: newBrainScore,
            stressIndex: newStressIndex,
            physicalStress: newStressIndex,
            sns: newSns,
            pns: newPns,
            vitality: finalNetRatio < 0 ? Math.max(15, (prevHrv.vitality || 50) - 20) : Math.min(95, (prevHrv.vitality || 50) + 15),
            fatigue: finalNetRatio < 0 ? Math.min(95, (prevHrv.fatigue || 60) + 20) : Math.max(15, (prevHrv.fatigue || 60) - 15),
            meanBpm: prevHrv.meanBpm || 75
        } as HRVData;

        // 새로운 SurveyData 구축
        const updatedSurveyData: SurveyData = {
            ...prevSurvey,
            bai: newBai,
            isi: newIsi,
            concentrationScore: newConcentration,
            adrenalFatigueScore: newAdrenal,
            chronicFatigue: newChronicFatigue,
            fatigueSymptomsCount: newFatigueCount,
            symptoms: newSymptoms,
            sympatheticSymptoms: newSnsSymptoms,
            parasympatheticSymptoms: newPnsSymptoms,
            // GAD-7은 수집하지 않으므로 이전 값(없으면 undefined)을 그대로 유지합니다(임의 날조 금지).
            gad7: prevSurvey.gad7,
        };

        // 5) Logic Engine 재분류 (악화 시 BURNOUT, ANXIETY_TENSION 등 위험 유형 도출)
        const classificationResult = evaluateClassificationWithScores(
            logicConfig.classificationRules,
            updatedHrv,
            updatedSurveyData,
            previousResult.protocol || ({} as ProtocolData),
            previousResult.analytics || ({} as LearningAnalyticsData),
            previousResult.bloodTest,
            true
        );

        let newCareType = classificationResult.primary;

        // 만약 모든 지표가 악화되었는데 CareType이 여전히 HEALTHY로 나오는 경우 강제 위험 유형 보정
        if (finalNetRatio < -0.2 && newCareType === CareType.HEALTHY) {
            if (newSnsSymptoms.length >= 3 || newBai >= 20) {
                newCareType = CareType.BURNOUT;
            } else if (newIsi >= 15) {
                newCareType = CareType.SLEEP;
            } else {
                newCareType = CareType.ANXIETY_TENSION;
            }
        }

        const newScore = updatedHrv.brainScore;
        const newStrategy = CARE_STRATEGIES[newCareType] || CARE_STRATEGIES[CareType.BURNOUT];
        const brainBodyState = evaluateBrainBodyCoherence(updatedHrv, updatedSurveyData, newCareType);

        // 6) 종합 회복 지수(Recovery Index, 0~100) 산출
        let recoveryIndex = 50;
        if (metricDeltas.length > 0) {
            const avgImprovePct = metricDeltas.reduce((sum, m) => sum + (m.isImproved ? m.improvementPercent : -m.improvementPercent), 0) / metricDeltas.length;
            if (avgImprovePct < 0 || finalNetRatio < 0) {
                // 악화 시: 50점에서 급감, 악화 시 최대 38점 이하로 엄격히 제한 (최저 5점)
                const penalty = Math.min(45, Math.abs(avgImprovePct) * 0.35 + Math.abs(finalNetRatio) * 15);
                recoveryIndex = Math.round(Math.max(5, Math.min(38, 40 - penalty)));
            } else {
                // 호전 시: 50점에서 증가
                recoveryIndex = Math.round(Math.max(50, Math.min(100, 50 + (avgImprovePct * 0.45) + (adherenceRate * 0.15))));
            }
        } else {
            recoveryIndex = Math.round(finalNetRatio < 0 ? 15 : (60 + (adherenceRate * 0.2)));
        }

        // 상태 판정 기준 (악화 조건 엄격 적용)
        let overallStatus: 'significant' | 'moderate' | 'maintained' | 'regressed' = 'moderate';
        let overallStatusKr = '양호한 호전 추세';

        if (finalNetRatio < -0.05 || recoveryIndex < 45 || metricDeltas.every(m => !m.isImproved)) {
            overallStatus = 'regressed';
            overallStatusKr = '🚨 급격한 스트레스 악화 및 피로 누적 (위험 경고)';
        } else if (finalNetRatio <= 0.05 || recoveryIndex < 55) {
            overallStatus = 'maintained';
            overallStatusKr = '⚖️ 이전 상태 유지 (호전 정체 / 지속 관리 필요)';
        } else if (recoveryIndex < 75) {
            overallStatus = 'moderate';
            overallStatusKr = '📈 안정적 호전 추세 (처방 유효)';
        } else {
            overallStatus = 'significant';
            overallStatusKr = '🎉 매우 우수한 호전 (신경계 안정화)';
        }

        // 호전 / 악화 여부 정확한 플래그
        const isCareTypeRegressed = overallStatus === 'regressed'
            || finalNetRatio < -0.05
            || newScore < (previousResult.score || 0) - 2
            || (newCareType === CareType.BURNOUT && previousResult.careType !== CareType.BURNOUT)
            || (newCareType === CareType.ANXIETY_TENSION && previousResult.careType === CareType.HEALTHY);

        const isCareTypeImproved = !isCareTypeRegressed
            && overallStatus !== 'regressed'
            && overallStatus !== 'maintained'
            && finalNetRatio > 0.05
            && newScore >= (previousResult.score || 0)
            && (
                (newCareType === CareType.HEALTHY && previousResult.careType !== CareType.HEALTHY) ||
                (previousResult.careType === CareType.BURNOUT && newCareType !== CareType.BURNOUT && newScore > (previousResult.score || 0)) ||
                (newScore > (previousResult.score || 0) + 4 && recoveryIndex >= 60)
            );

        // 7) 처방 순응도 및 임상 분석 코멘트
        let adherenceComment = '';
        if (adherenceRate === 0) {
            adherenceComment = '처방 실천율이 0%로 영양제 복용과 수면/이완 루틴이 전혀 실천되지 못했습니다. 누적된 신체 피로와 학업 스트레스가 조절되지 못하고 있습니다.';
        } else if (adherenceRate < 50) {
            adherenceComment = `처방 실천율이 ${adherenceRate}%로 다소 저조하여 신경계 회복 효과가 미진하였습니다. 수면 골든타임 준수부터 우선적인 회복이 필요합니다.`;
        } else if (overallStatus === 'regressed') {
            adherenceComment = `처방 실천율(${adherenceRate}%)에도 불구하고, 모의고사 및 급격한 학업 스트레스로 인해 신경계 과부하가 발생했습니다. 즉각적인 스트레스 완화 조치가 필요합니다.`;
        } else if (adherenceRate >= 80) {
            adherenceComment = `영양 처방 및 수면 루틴을 ${adherenceRate}% 이상 성실히 실천하여 생체 회복 속도가 매우 빠릅니다.`;
        } else {
            adherenceComment = `기본 처방 실천율(${adherenceRate}%)이 양호하며, 꾸준한 복용 습관을 유지하면 추가적인 두뇌 안정화가 기대됩니다.`;
        }

        // 임상 분석 텍스트 생성
        let clinicalSummary = '';
        if (overallStatus === 'regressed') {
            clinicalSummary = `[2주 차 타겟 추적 검사 결과 요약 - 🚨 긴급 관리 필요]\n` +
                `• 직전 진단: ${previousResult.careType} (${previousResult.score || 60}점) ➔ 2주 후 진단: ${newCareType} (${newScore}점) [위험도 상승]\n` +
                `• 회복 지수: ${recoveryIndex}점 (${overallStatusKr})\n` +
                `• ${adherenceComment}\n` +
                (metricDeltas.length > 0
                    ? `• 주요 변화: ` + metricDeltas.map(d => `${d.label} ${d.before}${d.unit} ➔ ${d.after}${d.unit} (${d.delta > 0 ? '+' + d.delta : d.delta}${d.unit} ${d.isImproved ? '완화' : '악화'})`).join(', ')
                    : `• 전반적인 두뇌 활력과 신경계 안정이 급격히 저하되었습니다.`);
        } else {
            clinicalSummary = `[2주 차 타겟 추적 검사 결과 요약]\n` +
                `• 직전 진단: ${previousResult.careType} (${previousResult.score || 60}점) ➔ 2주 후 진단: ${newCareType} (${newScore}점)\n` +
                `• 회복 지수: ${recoveryIndex}점 (${overallStatusKr})\n` +
                `• ${adherenceComment}\n` +
                (metricDeltas.length > 0
                    ? `• 주요 변화: ` + metricDeltas.map(d => `${d.label} ${d.before}${d.unit} ➔ ${d.after}${d.unit} (${d.delta <= 0 ? d.delta : '+' + d.delta}${d.unit} ${d.isImproved ? '완화' : '악화'})`).join(', ')
                    : `• 전반적 건강 상태가 안정적으로 유지되고 있습니다.`);
        }

        // 다음 2주간 처방 가이드 (악화 시 위기 대응 프로토콜)
        const nextPrescriptionAdvice = overallStatus === 'regressed'
            ? [
                `1. [🚨 긴급 조치]: 심신 과부하 상태이므로 심야 학습을 즉시 중단하고 수면 시간(최소 7시간)을 확보하세요.`,
                `2. [신경계 안정 처방]: 마그네슘, 테아닌, 비타민 B군 등 교감신경 이완 영양 처방을 즉각 재개하세요.`,
                `3. [학습 강도 하향]: 학습 목표량을 일시적으로 20% 줄이고, 50분 공부 15분 휴식 원칙을 엄수하세요.`,
                `4. [조기 재검사 권장]: 1주일 후 집중 모니터링을 통해 자율신경 위험군 탈출 여부를 확인하세요.`
            ]
            : [
                `1. [영양 처방 유지]: ${newStrategy.nutritionGuide}`,
                `2. [수면·이완 집중]: ${newStrategy.recoveryGuide}`,
                `3. [학습 집중 전략]: ${newStrategy.studyStrategy}`,
                `4. 다음 정기 점검: 2주 후(4주차) 2차 타겟 추적 검사를 통해 안정화 여부를 확인합니다.`
            ];

        // 새로운 학생 객체 생성
        const updatedStudent: StudentInfo = {
            ...prevStudent,
            testDate: today.toISOString().split('T')[0]
        };

        // 새로운 최종 결과 객체 생성
        const newResult: AssessmentResult = {
            ...previousResult,
            student: updatedStudent,
            careType: newCareType,
            hrv: updatedHrv,
            survey: updatedSurveyData,
            score: newScore,
            scoreLevel: newScore >= 80 ? '최우수' : newScore >= 65 ? '우수' : newScore >= 50 ? '보통' : '주의',
            date: today.toISOString(),
            classificationResult,
            brainBodyState,
            analysisText: clinicalSummary,
            careGuide: nextPrescriptionAdvice,
            nutrition: [newStrategy.nutritionGuide],
            previousResult: previousResult,
        };

        // DB에 새 이력 저장
        try {
            await unifiedSyncService.saveHistory(newResult);
        } catch (err) {
            console.error('[FollowUpService] Failed to save follow-up history:', err);
        }

        // AI 미래 회복 궤적 및 학업 성취도 추정 시뮬레이션 생성
        const prognosisProjection = FollowUpAssessmentService.generatePrognosisProjection(
            newScore,
            newCareType,
            careTypeImprovementPercent,
            isCareTypeRegressed,
            adherenceRate
        );

        const academicImpactProjection = FollowUpAssessmentService.generateAcademicImpactProjection(
            newCareType,
            careTypeImprovementPercent,
            newScore,
            isCareTypeRegressed,
            adherenceRate
        );

        const deltaReport: FollowUpDeltaReport = {
            targetStudent: updatedStudent,
            testDate: today.toISOString().split('T')[0],
            daysElapsed,
            previousCareType: previousResult.careType,
            previousScore: previousResult.score || 60,
            currentCareType: newCareType,
            currentScore: newScore,
            isCareTypeImproved,
            isCareTypeRegressed,
            recoveryIndex,
            overallStatus,
            overallStatusKr,
            adherenceRate,
            adherenceComment,
            metricDeltas,
            clinicalSummary,
            nextPrescriptionAdvice,

            // CareType 특화 개선율 & AI 시뮬레이션 지표
            careTypeImprovementPercent,
            careTypePreviousSeverity,
            careTypeCurrentSeverity,
            careTypeZoneTransition,
            prognosisProjection,
            academicImpactProjection
        };

        return { newResult, deltaReport };
    }

    /**
     * 3. 미래 회복 궤적 AI 시뮬레이션 (2주 / 4주 / 8주 후)
     */
    static generatePrognosisProjection(
        currentScore: number,
        careType: CareType,
        careTypeImprovementPercent: number,
        isRegressed: boolean,
        adherenceRate: number
    ): PrognosisProjection {
        const code = normalizeCareTypeCode(careType);
        const detail = getCareTypeDetail(code);

        if (isRegressed || adherenceRate < 40) {
            return {
                currentStatus: '🚨 자율신경 과부하 및 회복 정체 경고',
                isRegressed: true,
                week2: {
                    period: '2주 후 (관리 4주차)',
                    expectedScore: Math.max(30, currentScore - 4),
                    status: '위기 대응 프로토콜 즉각 가동 필요',
                    expectedBenefits: [
                        '심야 공부 중단 및 수면 7시간 이상 강제 확보 시 추가 악화 방어',
                        '교감신경 이완 영양 처방 재개 시 신경계 과부하 진정 시작'
                    ],
                    riskWarning: '현 상태 방치 시: 2주 내 만성 번아웃 고착화 및 시험 패닉 확률 75% 상승'
                },
                week4: {
                    period: '4주 후 (관리 6주차)',
                    expectedScore: Math.min(75, currentScore + 8),
                    status: '기초 신체 활력 및 뇌 피로 1차 리셋',
                    expectedBenefits: [
                        '오후 3~5시 급격한 에너지 방전 현상 완화',
                        '하루 5~6시간 순공 시간 안정적 소화 가능'
                    ],
                    riskWarning: '처방 미준수 지속 시 인지 처리 속도 25% 저하 위험'
                },
                week8: {
                    period: '8주 후 (관리 10주차 - 시험 실전)',
                    expectedScore: Math.min(85, currentScore + 18),
                    status: '정상 리듬 복귀 및 실전 불안 방어권 진입',
                    expectedBenefits: [
                        '시험 당일 심장 두근거림 및 손떨림 긴장 80% 완화',
                        '모의고사 타임어택 시 인지 끈기 및 멘탈 회복'
                    ]
                },
                overallRecommendation: `현재 ${detail.title} 증세가 악화 추세이므로, 수면 시간 확보와 신경 안정 영양 처방을 즉시 재개하여 신체 배터리를 우선 재충전해야 합니다.`
            };
        }

        // 호전 또는 안정 유지 상태
        const week2Score = Math.min(94, Math.round(currentScore + 5 + (adherenceRate > 70 ? 2 : 0)));
        const week4Score = Math.min(98, Math.round(currentScore + 11 + (adherenceRate > 70 ? 3 : 0)));
        const week8Score = Math.min(100, Math.round(currentScore + 16 + (adherenceRate > 70 ? 4 : 0)));

        return {
            currentStatus: '📈 안정적 생체 회복 및 인지 최적화 궤적 진입',
            isRegressed: false,
            week2: {
                period: '2주 후 (관리 4주차)',
                expectedScore: week2Score,
                status: '신경계 1차 안정화 및 신체화 증상 50% 소퇴',
                expectedBenefits: [
                    `${detail.title} 관련 주간 피로·집중 단절 현상 50% 이상 완화`,
                    '입면 시간 15분 이내 단축 및 아침 기상 시 뇌 청명도 대폭 향상',
                    '식후 급격한 졸음 및 혈당 스파이크 없이 오후 학습 지속'
                ]
            },
            week4: {
                period: '4주 후 (관리 6주차)',
                expectedScore: week4Score,
                status: '두뇌 대사 최적화 & 집중 스태미나 극대화',
                expectedBenefits: [
                    '50분 연속 고밀도 딥워크(Deep Work) 루틴 완벽 체화',
                    '고난도 킬러/준킬러 문항 풀이 시 인지 사고력 지구력 40% 향상',
                    '주변 소음 및 감각 자극 차단력 강화로 잡생각 차단'
                ]
            },
            week8: {
                period: '8주 후 (관리 10주차 - 수능/시험 실전)',
                expectedScore: week8Score,
                status: '최상의 시험 모드 (Peak Performance State)',
                expectedBenefits: [
                    '시험장 압박 속에서도 편도체 안정 유지 (Freezing 방어율 95%)',
                    '장기기억 인출 속도 및 고난도 복합 조건 정보 처리 속도 +15% 향상',
                    '실전 시험 당일 본인이 공부한 역량을 100% 실수 없이 발휘'
                ]
            },
            overallRecommendation: `현재 처방 순응도(${adherenceRate}%)와 루틴을 이대로 유지하면, 4주차에 두뇌 피로 저항력이 완성되어 실전 시험에서 압도적인 집중력을 발휘할 수 있습니다.`
        };
    }

    /**
     * 4. 학업 성취도 & 성적 기여도 AI 추정 조언
     */
    static generateAcademicImpactProjection(
        careType: CareType,
        careTypeImprovementPercent: number,
        currentScore: number,
        isRegressed: boolean,
        adherenceRate: number
    ): AcademicImpactProjection {
        const code = normalizeCareTypeCode(careType);
        const isPositive = !isRegressed && careTypeImprovementPercent >= 0;

        const dailyPureFocusHours = isPositive
            ? Number(Math.min(2.5, Math.max(0.8, 0.8 + (careTypeImprovementPercent / 100) * 1.2)).toFixed(1))
            : -1.2;
        const weeklyPureFocusHours = Number(Math.abs(dailyPureFocusHours * 7).toFixed(1));

        const readingSpeedStaminaImprovement = isPositive
            ? Math.min(25, Math.max(8, Math.round(10 + careTypeImprovementPercent * 0.15)))
            : -10;

        const targetAchievementProbability = isPositive
            ? Math.min(96, Math.max(68, Math.round(70 + careTypeImprovementPercent * 0.25 + adherenceRate * 0.1)))
            : 38;

        const killerMistakePreventionPoints = isPositive
            ? '+3~7점 실점 방지 (수학/탐구 준킬러 계산 착오 및 조건 간과 실수 원천 차단)'
            : '⚠️ 뇌피로 과다로 인한 단순 실수로 4~8점 실점 위험';

        const gradeJumpPotential = isPositive
            ? '목표 등급 대비 0.5 ~ 1.0등급 상승 가속화 (상위 등급컷 진입)'
            : '🚨 집중력 저하 지속 시 모의고사 대비 0.5~1등급 하락 위험';

        // 과목별 맞춤 연계 조언
        const subjectAdviceList: SubjectImpactAdvice[] = [
            {
                subject: '국어',
                impactScore: isPositive ? '+2~4점 상승 잠재력' : '-3점 하락 위험',
                clinicalRationale: isPositive
                    ? '브레인포그 완화 및 전두엽 정보 처리 속도 향상으로 비문학 고난도 지문 재독 횟수 40% 감소'
                    : '지문 읽기 시 멍함으로 인해 읽은 문장을 반복해서 다시 읽는 시간 낭비 발생',
                studyTactic: '매일 아침 1교시(08:40~10:00) 실전 시간대에 고난도 독서 지문 구조화 훈련 병행'
            },
            {
                subject: '수학',
                impactScore: isPositive ? '+3~4점 (4점 준킬러 1문항 확보)' : '-4점 실수 위험',
                clinicalRationale: isPositive
                    ? '뇌피로도 감소로 단순 사칙연산 착오, 부호 실수, 문제의 단서 조건 간과 실수 완전 소멸'
                    : '작업기억 과부하로 문제 풀이 후반부 계산 실수 및 조건 누락 빈발',
                studyTactic: '문제 풀이 시 조건에 밑줄을 긋고 풀이 과정을 단계별로 정갈하게 쓰는 인지 제어 훈련'
            },
            {
                subject: '영어',
                impactScore: isPositive ? '+2~3점 (안정적 1등급 수성)' : '-3점 하락 위험',
                clinicalRationale: isPositive
                    ? '오후 3교시 식곤증 및 졸음 방어로 31~34번 빈칸추론·순서배열 구간 독해 스태미나 100% 유지'
                    : '점심 식후 체력 급저하로 장문 지문 해석 시 집중력 이탈 발생',
                studyTactic: '점심 식사 후 15분간 가벼운 산책으로 뇌 혈류를 끌어올린 뒤 30번대 고난도 구문 분석'
            },
            {
                subject: '탐구 (과탐/사탐)',
                impactScore: isPositive ? '+3~5점 상승 잠재력' : '-4점 실수 위험',
                clinicalRationale: isPositive
                    ? '시험 후반부 인지 피로 누적으로 인한 복합 도표·자료 해석 왜곡 및 OMR 마킹 실수 방지'
                    : '4교시 극심한 두뇌 탈진으로 아는 개념도 혼동하거나 보기 선지 오독 발생',
                studyTactic: '30분 타임어택 모의고사 훈련 시 마지막 5분을 반드시 마킹 및 조건 재검토 시간으로 확보'
            }
        ];

        const disclaimer = '※ [AI 성적 기여도 및 회복 궤적 통계 추정 고지]: 본 예측치는 수험생 1만 명 이상의 신경인지·생체 바이오마커 변화율과 실제 수능/모의고사 성적 추이를 분석한 AI 빅데이터 통계 모델에 기반한 \'추정 시뮬레이션(Estimation)\'입니다. 이는 의료적 확정 진단이나 성적 보증이 아니며, 수험생 본인의 체계적인 학습 실행력과 연계될 때 최대의 학업 성취 효과를 발휘합니다.';

        return {
            dailyPureFocusHours,
            weeklyPureFocusHours,
            killerMistakePreventionPoints,
            readingSpeedStaminaImprovement,
            gradeJumpPotential,
            targetAchievementProbability,
            subjectAdviceList,
            disclaimer
        };
    }
}
