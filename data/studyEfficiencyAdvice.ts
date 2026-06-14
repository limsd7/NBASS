/**
 * 공부 효율성 검사 결과에 대한 CareType별 맞춤 조언
 * 각 조언은 약 500자 내외의 한국어 텍스트
 */

import { CareType } from '../types';
import { ChronotypeResult, TAIResult, DigitalAddictionResult, MetacognitionResult, VARKResult } from './studyEfficiencyAssessments';

// 크로노타입 결과별 기본 조언
const CHRONOTYPE_BASE_ADVICE: Record<ChronotypeResult, string> = {
    morning: '아침형 생체리듬을 가진 당신은 오전 6시~11시에 집중력이 최고조에 달합니다. 이 시간에 고난도 과목(수학, 과탐)을 배치하세요. 저녁 9시 이후에는 새로운 개념 학습보다 가벼운 복습이나 암기 위주로 전환하는 것이 효율적입니다. 취침 시간을 일정하게 유지하고, 주말에도 기상 시간을 2시간 이상 늦추지 않는 것이 리듬 유지에 중요합니다.',
    moderate_morning: '다소 아침형인 당신은 오전 8시~12시가 골든타임입니다. 핵심 개념 학습과 문제풀이를 이 시간에 집중하세요. 점심 직후 1~2시에는 졸음이 올 수 있으니 가벼운 복습이나 암기로 대체하고, 오후 4시 이후 다시 집중 모드로 전환하세요. 저녁 9시 이후는 휴식 시간으로 확보하는 것이 다음날 컨디션 유지에 도움됩니다.',
    neutral: '중간형 생체리듬을 가진 당신은 시간대에 크게 구애받지 않고 유연하게 적응할 수 있는 장점이 있습니다. 하지만 이는 양날의 검이 될 수 있습니다. 일정한 학습 루틴을 스스로 만들어 지키는 것이 중요합니다. 매일 같은 시간에 시작하고 끝내는 습관을 들이세요. 수면 패턴의 일관성이 집중력 유지의 핵심입니다.',
    moderate_evening: '다소 저녁형인 당신은 오후 3시~9시에 집중력이 점점 상승합니다. 오전에는 무리하지 말고 가벼운 복습과 워밍업에 활용하세요. 핵심 학습은 오후에 배치하되, 밤 11시 이후 학습은 수면의 질을 떨어뜨려 다음날 효율을 저하시킵니다. 시험 2주 전부터는 점진적으로 기상 시간을 앞당기는 조정이 필요합니다.',
    evening: '확실한 저녁형인 당신은 오후 5시~자정에 가장 집중이 잘 됩니다. 이 특성을 인정하고 활용하세요. 다만 새벽 공부는 오히려 비효율적이며, 수면 부족으로 이어져 악순환을 만듭니다. 아침 기상이 어려우면 알람을 여러 개 설정하고, 기상 즉시 밝은 빛을 쬐세요. 시험 기간에는 최소 3주 전부터 점진적 조정이 필수입니다.'
};

// CareType별 크로노타입 추가 조언
const CHRONOTYPE_CARETYPE_MODIFIER: Record<CareType, string> = {
    [CareType.BURNOUT]: ' 번아웃 상태에서는 평소보다 골든타임이 짧아집니다. 무리하지 말고 50분 집중 후 반드시 10분 휴식하세요.',
    [CareType.ADRENAL]: ' 부신피로 상태에서는 기상 직후 2시간은 힘들 수 있습니다. 코르티솔 리듬 회복을 위해 오전 10-12시를 핵심 학습 시간으로 삼으세요.',
    [CareType.STRESS_OVERLOAD]: ' 스트레스가 높은 시간대를 파악하여 그 시간은 휴식에 할애하세요. 저녁 불안이 높다면 새로운 학습 대신 복습을 배치하세요.',
    [CareType.SLEEP]: ' 수면 부족 시에는 원래 골든타임보다 1-2시간 늦게 집중력이 올라옵니다. 오후 2-4시 졸음이 극심하면 15분 파워냅을 활용하세요.',
    [CareType.ANXIETY_TENSION]: ' 불안이 낮은 시간대에 어려운 과목을 배치하세요. 시험 직전에는 새로운 학습보다 아는 것 확인에 시간을 쓰세요.',
    [CareType.LOW_ENERGY]: ' 에너지 피크 시간에 핵심 학습을 집중하고, 나머지는 가벼운 복습으로 채우세요. 10분 단위로 시작해 점진적으로 늘리세요.',
    [CareType.DEPRESSION_AMOTIVATION]: ' 동기가 조금이라도 있는 시간에 집중하세요. 혼자 있는 시간에 공부하기 어려우면 카페나 도서관을 활용하세요.',
    [CareType.BRAIN_FATIGUE]: ' 뇌가 가장 회복된 시간(주로 기상 후 2-3시간)에 핵심 학습을 배치하세요. 40분 단위로 휴식을 취하세요.',
    [CareType.HYPERSENSITIVE]: ' 주변 자극이 적은 시간대에 집중 학습을 배치하세요. 밤 11시 이후는 과민 반응이 증가할 수 있습니다.',
    [CareType.ATTENTION_DEFICIT]: ' 약물 복용자라면 약효가 최대인 시간에 맞춰 핵심 학습을 배치하세요. 산만함이 심한 시간대에는 15-20분 세션으로 운영하세요.',
    [CareType.CIRCULATION]: ' 가벼운 운동 후에 학습 효율이 높아집니다. 오래 앉아있으면 순환이 떨어지므로 50분마다 움직이세요.',
    [CareType.HEALTHY]: ' 현재 상태를 유지하면서 수면 패턴 일관성을 지키세요. 골든타임에 고난도, 저효율 시간에 복습을 배치하면 최적화됩니다.',
    [CareType.CONCENTRATION]: ' 집중력이 가장 높은 시간에 어려운 과목을 몰아서 배치하세요. 집중력 저하 시간에는 휴식 후 재개하세요.',
    [CareType.UNASSESSED]: ' 먼저 2주간 학습 시간대별 효율을 기록해보세요. 데이터 수집 후 맞춤 전략을 수립할 수 있습니다.'
};

// VARK 유형별 기본 조언
const VARK_BASE_ADVICE: Record<'V' | 'A' | 'R' | 'K' | 'multi', string> = {
    V: '시각형 학습자인 당신은 그림, 도표, 색깔을 통해 정보를 가장 잘 흡수합니다. 마인드맵과 개념도를 적극 활용하고, 형광펜으로 색깔 코딩하세요. 수학은 그래프와 도형을 크게 그리며 풀고, 국어 지문은 박스와 화살표로 구조를 시각화하세요. 영어 단어는 이미지와 연결하여 암기하면 효과적입니다. 인강이나 유튜브 강의도 좋은 학습 자원입니다.',
    A: '청각형 학습자인 당신은 듣고 말하는 것을 통해 가장 잘 학습합니다. 소리 내어 읽고 암기하고, 중요한 내용을 녹음해서 반복 청취하세요. 스터디 그룹에서 토론하거나 혼자 설명하는 연습이 효과적입니다. 국어 지문은 낭독하고, 수학은 풀이 과정을 말로 설명하며 풀고, 영어는 쉐도잉과 듣기 훈련에 집중하세요.',
    R: '읽기/쓰기형 학습자인 당신은 글을 통해 가장 잘 학습합니다. 교과서와 참고서를 정독하고, 필기 노트를 꼼꼼히 작성하세요. 요약본을 직접 만들어 반복해서 읽고, 핵심 내용을 글로 정리하는 습관을 들이세요. 수학은 풀이 과정을 빠짐없이 써가며 풀고, 오답 노트를 꼼꼼히 작성하세요. 영어는 문법 정리 노트와 작문 연습이 효과적입니다.',
    K: '운동감각형 학습자인 당신은 직접 해보고 움직이면서 가장 잘 학습합니다. 문제 풀이 중심으로 학습하고, 서서 또는 걸으면서 공부해보세요. 손으로 쓰며 암기하고, 실습이나 실험 기회를 적극 활용하세요. 국어 지문은 펜으로 직접 표시하며 읽고, 수학은 많은 문제 풀이로 체득하고, 영어는 단어를 여러 번 써가며 암기하세요.',
    multi: '복합형 학습자인 당신은 여러 감각을 활용할 때 가장 효과적으로 학습합니다. 과목과 상황에 따라 다양한 방법을 혼용하세요. 강점을 활용하되, 부족한 영역도 의식적으로 훈련하면 더욱 유연한 학습자가 될 수 있습니다. 국어는 듣기+읽기+시각화를 번갈아 사용하고, 수학은 설명 듣고 직접 풀고 오답 정리까지 종합적으로 접근하세요.'
};

// CareType별 VARK 추가 조언
const VARK_CARETYPE_MODIFIER: Record<CareType, string> = {
    [CareType.BURNOUT]: ' 에너지가 부족하므로 가장 편한 학습 방식에 집중하세요. 새로운 방법을 시도할 여력이 없는 상태입니다.',
    [CareType.ADRENAL]: ' 에너지 변동이 크므로 활력이 있을 때 능동적 방법, 없을 때 수동적 방법을 사용하세요.',
    [CareType.STRESS_OVERLOAD]: ' 손을 움직이는 학습(쓰기, 문제풀이)이 불안 분산에 효과적입니다.',
    [CareType.SLEEP]: ' 졸음이 올 때는 능동적 방법(서서 공부, 소리내어 읽기)으로 전환하세요.',
    [CareType.ANXIETY_TENSION]: ' 불안할 때는 손으로 쓰면서 공부하면 집중이 잘 됩니다.',
    [CareType.LOW_ENERGY]: ' 가장 적은 에너지로 효과적인 방법을 선택하세요. 무리한 방법 전환은 피로를 가중시킵니다.',
    [CareType.DEPRESSION_AMOTIVATION]: ' 혼자 읽기보다 강의 듣기, 함께 공부하기가 동기 유지에 도움됩니다.',
    [CareType.BRAIN_FATIGUE]: ' 복잡한 방법보다 단순한 방법(반복 읽기, 듣기)으로 인지 부담을 줄이세요.',
    [CareType.HYPERSENSITIVE]: ' 자극이 적은 방법(조용히 읽기)이 과민 반응을 줄입니다.',
    [CareType.ATTENTION_DEFICIT]: ' 여러 감각을 동시에 사용하면 집중 유지에 도움됩니다.',
    [CareType.CIRCULATION]: ' 앉아서 읽기보다 걸으면서 듣기, 서서 쓰기가 순환에 좋습니다.',
    [CareType.HEALTHY]: ' 주요 학습 방식을 유지하면서 부족한 영역을 보완하세요.',
    [CareType.CONCENTRATION]: ' 가장 집중이 잘 되는 방식에 올인하세요.',
    [CareType.UNASSESSED]: ' 다양한 방법을 시도해보고 효과적인 것을 찾으세요.'
};

// 시험불안 유형별 기본 조언
const TAI_BASE_ADVICE: Record<'cognitive' | 'somatic' | 'balanced', string> = {
    cognitive: '인지적 걱정이 우세한 당신은 "시험 망치면 어쩌지?"류의 부정적 사고가 주요 원인입니다. 인지 재구조화를 통해 부정적 생각을 객관적으로 검토하세요. 걱정 시간을 하루 10분으로 제한하고, 나머지는 학습에 집중하세요. 작은 성취도 기록하는 성공 경험 일지를 작성하여 자신감을 회복하세요. 100점이 아닌 "할 수 있는 최선"을 목표로 현실적으로 설정하세요.',
    somatic: '신체적 긴장이 우세한 당신은 손떨림, 두근거림, 소화불량 등 신체 증상이 주요 문제입니다. 4-7-8 호흡법(4초 흡입, 7초 유지, 8초 호출)을 매일 연습하세요. 점진적 근육 이완법을 목과 어깨 위주로 익히세요. 모의고사를 많이 치러 시험 상황에 노출되는 연습을 하고, 시험 전날부터 카페인과 당류를 제한하세요.',
    balanced: '인지적 걱정과 신체적 긴장이 모두 나타나는 복합형입니다. 마음챙김 명상을 통해 생각과 신체 감각을 동시에 관찰하는 연습을 하세요. 호흡법과 긍정적 자기대화를 병행하고, 충분한 수면으로 기초 체력을 확보하세요. 시험 전 루틴을 확립하여 예측 가능성을 높이면 불안이 감소합니다. 긴장을 "준비된 상태"로 재해석하세요.'
};

// CareType별 시험불안 추가 조언
const TAI_CARETYPE_MODIFIER: Record<CareType, string> = {
    [CareType.BURNOUT]: ' 시험 당일 80% 컨디션으로 충분합니다. 완벽 포기가 오히려 좋은 결과를 가져옵니다.',
    [CareType.ADRENAL]: ' 혈당 안정을 위해 시험 중간 간식(견과류)을 준비하세요.',
    [CareType.STRESS_OVERLOAD]: ' 그라운딩 기법(발바닥 감각 집중)으로 현재에 머무르세요.',
    [CareType.SLEEP]: ' 수면 부족 시 시험 직전 5분간 눈을 감고 휴식하세요.',
    [CareType.ANXIETY_TENSION]: ' 손바닥 합장 10초 힘주기로 긴장 에너지를 방출하세요.',
    [CareType.LOW_ENERGY]: ' 시험장 도착 후 가볍게 몸을 움직여 각성도를 높이세요.',
    [CareType.DEPRESSION_AMOTIVATION]: ' 시험장에 온 것 자체가 성공입니다. 스스로를 격려하세요.',
    [CareType.BRAIN_FATIGUE]: ' 어려운 문제는 과감히 넘기고 아는 문제에 집중하세요.',
    [CareType.HYPERSENSITIVE]: ' 시험장 소음이 신경 쓰이면 귀마개 사용을 고려하세요.',
    [CareType.ATTENTION_DEFICIT]: ' 시험 시작 전 문제 전체를 훑어 계획을 세우세요.',
    [CareType.CIRCULATION]: ' 시험 중간 발끝 움직이기로 혈류를 유지하세요.',
    [CareType.HEALTHY]: ' 평소 연습한 루틴을 그대로 실행하세요.',
    [CareType.CONCENTRATION]: ' 첫 문제에 너무 오래 매달리지 말고 흐름을 타세요.',
    [CareType.UNASSESSED]: ' 차분하게 호흡하고 아는 문제부터 푸세요.'
};

// 디지털 중독 수준별 기본 조언
const DIGITAL_BASE_ADVICE: Record<'healthy' | 'caution' | 'risk' | 'addiction', string> = {
    healthy: '디지털 사용이 잘 통제되고 있습니다. 현재 습관을 유지하면서 공부 시간에는 폰을 다른 방에 두는 습관을 더하면 좋습니다. 앱 사용 시간을 주기적으로 모니터링하여 변화를 감지하세요. 뽀모도로 기법(25분 집중, 5분 휴식)을 활용하면 집중력을 더욱 높일 수 있습니다. 좋은 습관을 유지하는 것도 노력이 필요합니다.',
    caution: '약간의 디지털 의존 성향이 보입니다. 학습 시간에는 알림을 끄고, SNS와 숏폼 앱은 폴더 깊이 숨기세요. 취침 1시간 전에는 폰 사용을 중단하고, 주 1회 "폰 프리 데이"를 시도해보세요. 폰을 격리한 후 20분 단위로 집중하고, 휴식 시간에도 폰 대신 스트레칭을 하면 도파민 민감도가 회복됩니다.',
    risk: '도파민 민감도 저하로 집중력에 영향을 미치고 있습니다. 앱 타이머를 강제 설정하고, 그레이스케일 모드를 사용하세요. 숏폼 앱 삭제를 진지하게 고려하고, 공부 시작 전 폰을 잠금함에 보관하세요. 2주간 디지털 디톡스 프로토콜을 실행하세요. 15분 단위 뽀모도로로 시작해 집중 시간을 점진적으로 늘려가세요.',
    addiction: '강한 디지털 의존 상태입니다. 적극적 개입이 필요합니다. 숏폼과 게임 앱을 완전 삭제하고, 부모님께 폰 보관을 요청하세요. 공부 중 폰을 볼 때마다 기록하여 패턴을 인식하세요. 전문 상담도 고려해보세요. 10분 집중 후 2분 휴식부터 시작하여 성공 경험을 쌓으세요. 지루함은 뇌 회복의 신호입니다.'
};

// CareType별 디지털 중독 추가 조언
const DIGITAL_CARETYPE_MODIFIER: Record<CareType, string> = {
    [CareType.BURNOUT]: ' 에너지 부족으로 폰 유혹에 더 취약합니다. 물리적으로 격리하고 10분 단위 학습부터 시작하세요.',
    [CareType.ADRENAL]: ' 도파민 조절이 회복의 핵심입니다. 숏폼 앱 삭제를 강력히 권장합니다.',
    [CareType.STRESS_OVERLOAD]: ' 스트레스 해소를 폰에 의존하지 마세요. 산책이나 호흡법으로 대체하세요.',
    [CareType.SLEEP]: ' 취침 1시간 전 폰 금지가 수면 개선의 시작입니다.',
    [CareType.ANXIETY_TENSION]: ' 불안할 때 폰을 찾으면 일시적 안도 후 더 불안해집니다. 호흡법으로 대체하세요.',
    [CareType.LOW_ENERGY]: ' 에너지 없을 때 폰이 휴식처럼 느껴지지만 실제로는 뇌를 더 피로하게 합니다.',
    [CareType.DEPRESSION_AMOTIVATION]: ' SNS 비교가 우울을 악화시킵니다. 사람과 직접 만나는 것이 회복에 효과적입니다.',
    [CareType.BRAIN_FATIGUE]: ' 뇌가 지쳤을 때 폰은 추가 피로를 줍니다. 눈 감고 휴식이 진짜 휴식입니다.',
    [CareType.HYPERSENSITIVE]: ' 알림 소리와 진동이 과민을 자극합니다. 방해금지 모드를 상시 사용하세요.',
    [CareType.ATTENTION_DEFICIT]: ' 디지털 자극이 주의력을 더 산만하게 만듭니다. 앱 타이머를 강제 설정하세요.',
    [CareType.CIRCULATION]: ' 폰 사용 = 오래 앉아있기. 폰 사용 시간만큼 움직이세요.',
    [CareType.HEALTHY]: ' 현재 통제력을 유지하면서 공부 시간에는 폰 격리를 습관화하세요.',
    [CareType.CONCENTRATION]: ' 집중하려면 폰을 다른 방에 두세요. 눈에 보이면 신경 쓰입니다.',
    [CareType.UNASSESSED]: ' 먼저 1주일간 스크린 타임을 기록해보세요.'
};

// 메타인지 수준별 기본 조언
const METACOGNITION_BASE_ADVICE: Record<'beginner' | 'developing' | 'proficient' | 'expert', string> = {
    beginner: '주로 반복과 암기에 의존하는 초보 학습자 단계입니다. 이해 중심 학습으로 전환이 필요합니다. 새로운 내용을 배울 때 "왜?"라고 3번 질문하고, 오늘 배운 내용을 친구에게 설명해보세요. 개념 하나를 실생활 예시로 연결해보고, 단원 시작 전 목차를 먼저 훑어보세요. 단순 반복 시간을 줄이고 문제 풀이를 늘리며, 모르는 것을 인정하고 질문하는 습관을 들이세요.',
    developing: '이해하려는 노력이 보이는 발전 중인 학습자입니다. 구조화 능력을 키우면 도약할 수 있습니다. 단원별 마인드맵을 만들고, 배운 개념들 간의 관계를 정리하세요. 스스로 예상 문제를 만들어보고, 공부 후 "오늘 뭘 배웠나" 3줄 요약을 작성하세요. 개념 간 연결 고리를 찾고, 요약본을 직접 만들어 복습하세요.',
    proficient: '효과적인 학습 전략을 사용하는 능숙한 학습자입니다. 메타인지를 강화하면 최상위로 갈 수 있습니다. 공부 후 "내가 얼마나 이해했나" 자가 평가를 하고, 학습 계획 vs 실제 결과를 비교 분석하세요. 자신만의 최적 학습법을 문서화하고, 약점 파악 후 집중 보완 계획을 수립하세요. 어려운 문제일수록 과정을 기록하고 오답 패턴을 분석하세요.',
    expert: '고급 학습 전략을 잘 활용하는 전문 학습자입니다. 꾸준히 유지하고 후배를 가르쳐보세요. 다른 학생을 가르치면 메타인지가 더욱 강화됩니다. 새로운 학습 방법을 실험하고 평가하며, 장기 목표에 맞춘 학습 로드맵을 수립하세요. 심화 개념을 탐구하고 융합적 사고를 발전시키세요. 현재 전략을 유지하며 컨디션 관리에 집중하세요.'
};

// CareType별 메타인지 추가 조언
const METACOGNITION_CARETYPE_MODIFIER: Record<CareType, string> = {
    [CareType.BURNOUT]: ' 지금은 새로운 학습법 도전보다 기존 방법 유지가 우선입니다. 회복 후 업그레이드하세요.',
    [CareType.ADRENAL]: ' 에너지가 있을 때 정교화/조직화 전략, 없을 때 단순 복습으로 조절하세요.',
    [CareType.STRESS_OVERLOAD]: ' 복잡한 전략보다 "아는 것 확인"에 집중하세요.',
    [CareType.SLEEP]: ' 수면 부족 시 새로운 전략 실행이 어렵습니다. 기본에 충실하세요.',
    [CareType.ANXIETY_TENSION]: ' 완벽한 전략보다 "시작하기"가 더 중요합니다.',
    [CareType.LOW_ENERGY]: ' 가장 적은 노력으로 효과적인 전략만 사용하세요.',
    [CareType.DEPRESSION_AMOTIVATION]: ' 전략보다 "매일 조금이라도 하기"가 핵심입니다.',
    [CareType.BRAIN_FATIGUE]: ' 인지 부하를 줄이는 방향으로 전략을 단순화하세요.',
    [CareType.HYPERSENSITIVE]: ' 조용한 환경에서 깊은 사고 전략이 효과적입니다.',
    [CareType.ATTENTION_DEFICIT]: ' 체계적 조직화 전략이 산만함을 줄이는 데 핵심입니다.',
    [CareType.CIRCULATION]: ' 움직이면서 공부하는 전략(서서 설명하기 등)이 효과적입니다.',
    [CareType.HEALTHY]: ' 현재 수준에서 한 단계 업그레이드에 도전하세요.',
    [CareType.CONCENTRATION]: ' 메타인지 점검 루틴을 도입해 집중 여부를 스스로 확인하세요.',
    [CareType.UNASSESSED]: ' 다양한 학습 전략을 시도해보고 효과를 기록하세요.'
};

// ========== 조언 생성 함수 ==========

export function getChronotypeAdvice(result: ChronotypeResult, careType: CareType): string {
    const base = CHRONOTYPE_BASE_ADVICE[result];
    const modifier = CHRONOTYPE_CARETYPE_MODIFIER[careType] || CHRONOTYPE_CARETYPE_MODIFIER[CareType.HEALTHY];
    return base + modifier;
}

export function getVARKAdvice(result: VARKResult, careType: CareType): string {
    const base = VARK_BASE_ADVICE[result.primary];
    const modifier = VARK_CARETYPE_MODIFIER[careType] || VARK_CARETYPE_MODIFIER[CareType.HEALTHY];
    return base + modifier;
}

export function getTestAnxietyAdvice(result: TAIResult, careType: CareType): string {
    const base = TAI_BASE_ADVICE[result.dominantType];
    const modifier = TAI_CARETYPE_MODIFIER[careType] || TAI_CARETYPE_MODIFIER[CareType.HEALTHY];
    return base + modifier;
}

export function getDigitalAddictionAdvice(result: DigitalAddictionResult, careType: CareType): string {
    const base = DIGITAL_BASE_ADVICE[result.level];
    const modifier = DIGITAL_CARETYPE_MODIFIER[careType] || DIGITAL_CARETYPE_MODIFIER[CareType.HEALTHY];
    return base + modifier;
}

export function getMetacognitionAdvice(result: MetacognitionResult, careType: CareType): string {
    const base = METACOGNITION_BASE_ADVICE[result.learnerLevel];
    const modifier = METACOGNITION_CARETYPE_MODIFIER[careType] || METACOGNITION_CARETYPE_MODIFIER[CareType.HEALTHY];
    return base + modifier;
}
