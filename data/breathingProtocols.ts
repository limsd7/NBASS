// 심신 안정 호흡 프로토콜 라이브러리
// - 12대 CareType × 상황(수면/급성불안/집중/데일리)에 매핑되는 단일 진실 원천
// - 4-7-8 단일 처방의 오남용 방지: 숨참기 부하가 큰 유형(부신피로·저활력 등)은 무리 없는 프로토콜 우선
// - 의학적 처방이 아닌 심신 안정 보조 루틴이며, 주의사항을 함께 제공한다

export interface BreathPattern {
  inhaleSec: number; // 들이마시기
  holdSec: number;   // 멈추기 1 (0이면 생략)
  exhaleSec: number; // 내쉬기
  hold2Sec: number;  // 멈추기 2 (0이면 생략)
}

export type BreathSituation =
  | 'pre_sleep'      // 잠들기 전
  | 'acute_anxiety'  // 갑작스러운 불안·긴장·머리 하얘짐
  | 'focus'          // 집중 필요·시험 직전 가다듬기
  | 'daily_calm'     // 평소 꾸준한 관리 (하루 5분)
  | 'pre_study';     // 공부 시작 전 전환 루틴

export interface BreathingProtocol {
  id: string;
  name: string;
  emoji: string;
  oneLiner: string;
  pattern: BreathPattern;
  rounds: number;          // 권장 라운드 수
  estMinutes: number;      // 예상 소요 시간(분)
  situations: BreathSituation[];
  holdCaution: boolean;    // 숨 참기 포함 여부 (주의 문구 노출용)
  evidence: 'RCT' | 'pilot' | 'traditional';
  evidenceNote: string;
  steps: string[];         // 따라하기 안내 스크립트
  caution?: string;        // 개별 주의사항
}

export const BREATHING_PROTOCOLS: BreathingProtocol[] = [
  {
    id: 'diaphragmatic',
    name: '복식호흡 (4초 들이마시기 · 6초 내쉬기)',
    emoji: '🌬️',
    oneLiner: '가장 기본이 되는 이완 호흡. 누구에게나 맞는 시작점.',
    pattern: { inhaleSec: 4, holdSec: 0, exhaleSec: 6, hold2Sec: 0 },
    rounds: 8,
    estMinutes: 3,
    situations: ['daily_calm', 'pre_study', 'acute_anxiety'],
    holdCaution: false,
    evidence: 'traditional',
    evidenceNote: '날숨을 길게 가져가는 이완 호흡의 기본형으로 가장 널리 활용됩니다.',
    steps: [
      '편하게 앉거나 누워 어깨 힘을 풀고, 한 손은 가슴·다른 손은 배 위에 올리세요.',
      '코로 4초간 천천히 들이마시며 배 위의 손이 올라오는 것을 느끼세요.',
      '입으로 6초간 길게 내쉬며 배가 꺼지는 것을 느끼세요. (8회 반복)',
      '숫자 세기를 멈추고 편안한 속도로 3번 자연스럽게 호흡하며 마무리하세요.'
    ]
  },
  {
    id: 'coherent_5_5',
    name: '공명호흡 (5초 · 5초)',
    emoji: '💓',
    oneLiner: '분당 5~6회의 느린 리듬. 자율신경 균형·꾸준한 관리용.',
    pattern: { inhaleSec: 5, holdSec: 0, exhaleSec: 5, hold2Sec: 0 },
    rounds: 12,
    estMinutes: 4,
    situations: ['daily_calm', 'pre_study', 'focus'],
    holdCaution: false,
    evidence: 'pilot',
    evidenceNote: '느린 호흡 리듬이 심박 안정·자율신경 균형에 도움이 된다는 연구들이 있습니다.',
    steps: [
      '등을 세우고 편안히 앉아 호흡에만 주의를 두세요.',
      '코로 5초 들이마시고, 코(또는 입)로 5초 내쉬기를 일정하게 반복하세요.',
      '속도보다 리듬의 일정함이 중요합니다. (12회 반복)',
      '마지막 3회는 숫자 없이 몸의 이완을 느끼며 마무리하세요.'
    ]
  },
  {
    id: 'box_4',
    name: '박스호흡 (4-4-4-4)',
    emoji: '⬛',
    oneLiner: '일정한 네모 리듬으로 긴장된 마음을 가다듬는 집중용.',
    pattern: { inhaleSec: 4, holdSec: 4, exhaleSec: 4, hold2Sec: 4 },
    rounds: 4,
    estMinutes: 3,
    situations: ['focus', 'pre_study'],
    holdCaution: true,
    evidence: 'traditional',
    evidenceNote: '발표·시험 전 마음 가다듬기에 널리 쓰이는 집중용 기법입니다.',
    steps: [
      '네모 한 변씩 그려가듯 4초 들이마시기 → 4초 멈추기 → 4초 내쉬기 → 4초 멈추기를 반복하세요.',
      '각 구간의 숫자를 일정한 속도로 세는 것이 핵심입니다. (4회 반복)',
      '멈추는 구간이 힘들면 3초로 줄여서 시작해도 됩니다.'
    ]
  },
  {
    id: 'phys_sigh',
    name: '생리적 한숨 (두 번 들이마시기 + 긴 날숨)',
    emoji: '😮‍💨',
    oneLiner: '급한 긴장을 1~2회로 빠르게 푸는 응급용.',
    pattern: { inhaleSec: 4, holdSec: 0, exhaleSec: 8, hold2Sec: 0 },
    rounds: 3,
    estMinutes: 1,
    situations: ['acute_anxiety', 'pre_study'],
    holdCaution: false,
    evidence: 'pilot',
    evidenceNote: '짧은 실시간 중재로 각성 완화에 활용되는 기법입니다.',
    steps: [
      '코로 깊게 들이마신 뒤, 멈추지 말고 짧게 한 번 더 들이마시세요.',
      '입으로 길고 천천히(8초) 완전히 내쉬세요.',
      '1~3회 반복하면 충분합니다. 어지러우면 바로 멈추세요.'
    ]
  },
  {
    id: 'cyclic_sighing',
    name: '사이클릭 사이잉 (5분 날숨 강조 루틴)',
    emoji: '🌊',
    oneLiner: '하루 5분, 날숨을 강조한 반복. 일상 스트레스 관리에 활용되는 루틴.',
    pattern: { inhaleSec: 4, holdSec: 0, exhaleSec: 8, hold2Sec: 0 },
    rounds: 20,
    estMinutes: 5,
    situations: ['daily_calm'],
    holdCaution: false,
    evidence: 'RCT',
    evidenceNote: '2023년 소규모 무작위 대조 연구에서 하루 5분 날숨 강조 호흡군의 스트레스·기분 지표 개선이 보고되었습니다. 단일 연구 결과이므로 개인차가 있을 수 있습니다.',
    steps: [
      '편안히 앉아 타이머를 5분으로 맞추세요.',
      '코로 들이마시고(짧게 두 번 나눠도 됨) 입으로 길게 내쉬기를 반복하세요.',
      '들이마심보다 내쉼이 길어지도록만 의식하고, 억지로 길게 참지 마세요.',
      '5분이 끝나면 1분간 평소처럼 쉬며 몸의 변화를 느껴보세요.'
    ]
  },
  {
    id: 'pursed_lip',
    name: '입술 오므려 내쉬기 (2초 · 4초+)',
    emoji: '🎺',
    oneLiner: '숨 가쁨·긴장 시 휘파람 입술로 빠르게 진정.',
    pattern: { inhaleSec: 2, holdSec: 0, exhaleSec: 5, hold2Sec: 0 },
    rounds: 8,
    estMinutes: 2,
    situations: ['acute_anxiety'],
    holdCaution: false,
    evidence: 'traditional',
    evidenceNote: '호흡 곤란·긴장 완화에 쓰이는 표준 이완 기법 중 하나입니다.',
    steps: [
      '코로 2초간 편안히 들이마시세요.',
      '휘파람 불듯 입술을 오므리고 4초 이상 천천히 내쉬세요.',
      '내쉬는 동안 어깨가 내려가는 것을 느끼세요. (8회 반복)'
    ]
  },
  {
    id: 'alternate_nostril',
    name: '교대 비공 호흡 (좌우 균형)',
    emoji: '👃',
    oneLiner: '좌우 콧구멍을 번갈아 쓰는 요가 전통의 균형 호흡.',
    pattern: { inhaleSec: 4, holdSec: 0, exhaleSec: 4, hold2Sec: 0 },
    rounds: 8,
    estMinutes: 3,
    situations: ['daily_calm', 'focus'],
    holdCaution: false,
    evidence: 'pilot',
    evidenceNote: '차분함·균형감 회복에 대한 소규모 연구들이 있습니다.',
    steps: [
      '오른손 엄지로 오른쪽 콧구멍을 막고 왼쪽으로 4초 들이마시세요.',
      '왼쪽을 막고 오른쪽으로 4초 내쉬세요. 이어서 오른쪽으로 들이마시세요.',
      '반대쪽으로 내쉬면 1라운드입니다. (8라운드 반복)',
      '코가 막혀 있으면 무리하지 말고 복식호흡으로 대체하세요.'
    ]
  },
  {
    id: 'bhramari',
    name: '벌호흡 (콧소리 진동 내쉬기)',
    emoji: '🐝',
    oneLiner: '벌 날갯소리처럼 낮게 울리며 내쉬는 시험 불안 특화형.',
    pattern: { inhaleSec: 4, holdSec: 0, exhaleSec: 6, hold2Sec: 0 },
    rounds: 7,
    estMinutes: 3,
    situations: ['acute_anxiety', 'pre_sleep', 'daily_calm'],
    holdCaution: false,
    evidence: 'pilot',
    evidenceNote: '수험생·학생 대상 시험 불안 완화 파일럿 연구들이 보고된 기법입니다.',
    steps: [
      '코로 4초 들이마신 뒤, 입을 다물고 "음~" 하고 낮게 울리며 6초 내쉬세요.',
      '검지손가락으로 양쪽 귀를 가볍게 막으면 진동이 잘 느껴집니다.',
      '이마·머릿속이 울리는 감각에 주의를 두세요. (7회 반복)'
    ]
  },
  {
    id: 'breath_478',
    name: '4-7-8 호흡 (수면 유도)',
    emoji: '🌙',
    oneLiner: '긴 날숨+멈춤으로 몸을 잠재우는 취침 전 특화형.',
    pattern: { inhaleSec: 4, holdSec: 7, exhaleSec: 8, hold2Sec: 0 },
    rounds: 4,
    estMinutes: 2,
    situations: ['pre_sleep'],
    holdCaution: true,
    evidence: 'traditional',
    evidenceNote: '잠들기 전·불안 시 널리 활용되는 이완 기법입니다. 숨 참기가 힘들면 4-4-6으로 줄여 시작하세요.',
    steps: [
      '혀끝을 윗니 뒤 잇몸에 대고, 입으로 "후~" 완전히 내쉬어 폐를 비우세요.',
      '입을 다물고 코로 4초 들이마시기 → 7초 멈추기 → 입으로 8초 내쉬기를 반복하세요. (4라운드)',
      '처음 며칠은 4라운드까지만 하고, 어지러우면 바로 멈추세요.'
    ],
    caution: '숨 참기가 포함됩니다. 임신 중이거나 심혈관·호흡기 질환이 있으면 무리하지 말고 의료진과 상의하세요.'
  }
];

// 상황별 기본 프로토콜 (상황 우선 매칭용)
export const SITUATION_DEFAULT_PROTOCOL: Record<BreathSituation, string> = {
  pre_sleep: 'breath_478',
  acute_anxiety: 'phys_sigh',
  focus: 'box_4',
  daily_calm: 'cyclic_sighing',
  pre_study: 'diaphragmatic'
};

// 12대 CareType별 1순위 프로토콜 (숨참기 부하 고려)
// - 부신피로·무기력·순환저하형은 숨 참기(홀드) 없는 프로토콜 우선
// - 불안·과민형은 급성(생리적 한숨)과 데일리(공명/벌호흡)를 병행 전제로 1순위만 지정
export const CARETYPE_PRIMARY_BREATH: Record<string, string> = {
  BURNOUT: 'coherent_5_5',
  ANXIETY_TENSION: 'phys_sigh',
  STRESS_OVERLOAD: 'diaphragmatic',
  LOW_ENERGY: 'coherent_5_5',
  DEPRESSION_AMOTIVATION: 'diaphragmatic',
  ADRENAL: 'coherent_5_5',
  BRAIN_FATIGUE: 'box_4',
  HYPERSENSITIVE: 'pursed_lip',
  ATTENTION_DEFICIT: 'box_4',
  SLEEP: 'breath_478',
  CIRCULATION: 'diaphragmatic',
  HEALTHY: 'coherent_5_5',
  UNASSESSED: 'diaphragmatic'
};

// 상황별 차선 프로토콜 (CareType 무관 공통)
export const SITUATION_SECONDARY: Record<BreathSituation, string[]> = {
  pre_sleep: ['bhramari', 'diaphragmatic'],
  acute_anxiety: ['bhramari', 'pursed_lip'],
  focus: ['coherent_5_5', 'alternate_nostril'],
  daily_calm: ['coherent_5_5', 'diaphragmatic'],
  pre_study: ['coherent_5_5', 'box_4']
};

export const BREATH_SAFETY_NOTICE =
  '어지럽거나 손발이 저릿하면 바로 멈추고 평소 호흡으로 돌아오세요. 숨 참기가 포함된 방법은 임신 중이거나 심혈관·호흡기 질환이 있다면 무리하지 말고 필요하면 의료진과 상의하세요. 처음엔 하루 3~5분으로 시작하세요.';
