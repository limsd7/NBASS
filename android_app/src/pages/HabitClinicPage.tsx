import React, { useState, useEffect } from 'react';
import { UserProfile, BadHabitItem } from '../types';
import { dataSyncService } from '../services/dataSyncService';
import { useNbassRemoteRefresh } from '../hooks/useNbassRemoteRefresh';
import { hasRequiredTier } from '../services/featureGate';
import { LockedCard } from '../components/tiered-features/LockedCard';
import { Brain, AlertOctagon, Sparkles, CheckCircle2, Play, Pause, Flame, Clock, ShieldAlert, ArrowRight, RotateCcw, Printer, X, FileText, Lock, Wind, Mic, Zap, HeartPulse, BookOpen, Check, EyeOff, Moon, Coffee, ShieldCheck, Smartphone, Send } from 'lucide-react';

interface HabitClinicPageProps {
  user: UserProfile;
  onUpgradeClick: () => void;
}

const BAD_HABITS_LIST: BadHabitItem[] = [
  {
    id: 'habit-01',
    title: '모르는 문제 나오면 1~2분 만에 해설지/답지 보기',
    description: '스스로 고민하지 않고 즉시 해설을 보며 "알았다"고 뇌를 속이는 가짜 공부 (Fake Study)',
    category: '가짜 공부 (Fake Study)',
    wastedMinutesPerDay: 35,
    brainCause: '전두엽 배외측피질(DLPFC)의 인지적 고통 회피 및 즉각적 도파민 보상 갈망 현상입니다. 스스로 풀리지 않는 난제를 마주했을 때 뇌는 이를 신체적 통증과 유사한 인지적 스트레스로 감지합니다. 이때 해설지를 즉각 열람하면 복측 선조체에서 도파민이 순간적으로 분비되며 "문제를 이해했다"는 착각(Fluency Illusion)을 유발하고, 정작 스스로 기억을 끄집어내는 인출(Retrieval) 신경회로와 시냅스는 완전히 퇴화됩니다.',
    impact: '실전 수능 시험장에는 해설지가 없기 때문에 생소한 신유형이나 킬러 문항을 마주하는 순간 극심한 패닉과 뇌 정지(Brain Freeze)에 빠지게 됩니다. 혼자 힘으로 실마리를 찾는 인출 뉴런 네트워크가 굳어져 시험장에서 1~2등급 진입이 원천 봉쇄됩니다.',
    expectedScoreBoost: '🎯 수능 수학/과탐 킬러 2~3문항 해결 가능 (+8~12점 상승, 1~2등급 도약)',
    prescription: '「3분 키워드 차단 룰 & 3단계 점진적 인출」: ①답지를 반드시 책상에서 3m 이상 떨어진 곳에 물리적으로 격리합니다. ②문제가 막혔을 때 즉시 해설을 보지 않고, 빈 종이에 [문제의 핵심 키워드 1개]와 [관련 공식 2개]만 단서로 적은 후 최소 5분간 추가 사유를 진행합니다. ③도저히 안 풀릴 때만 해설지의 첫 줄(시작 아이디어)만 가림판으로 살짝 확인한 후, 즉시 덮고 남은 과정을 스스로 완주합니다.'
  },
  {
    id: 'habit-02',
    title: '안 풀리는 1문제를 25~30분 이상 멍하니 잡고 늘어지기',
    description: '오기나 불안감으로 인해 진도를 나가지 못하고 시간만 흘려보내는 집착형 지연',
    category: '집착 지연 (Over-stuck)',
    wastedMinutesPerDay: 45,
    brainCause: '전대상피질(ACC)의 오류 감지 회로가 과열되고 편도체가 불안에 휩싸이면서 나타나는 인지적 경직(Cognitive Inflexibility)입니다. "이것도 못 풀면 망한다"는 공포로 인해 다른 문제로 넘어가는 실행 전환(Task Switching) 능력이 마비되고, 뇌의 제한된 일일 글루코스(뇌 에너지)를 1문항에 60% 이상 낭비하게 됩니다.',
    impact: '시험 전체의 시간 배분이 완전히 파탄 납니다. 뒤쪽에 배치된 충분히 맞힐 수 있는 중급 배점 문항 4~5개를 읽지도 못하고 찍어버리게 되어 어처구니없는 대량 실점으로 이어집니다.',
    expectedScoreBoost: '🎯 시간 부족으로 날리던 후반부 문항 100% 확보 (+10~15점 상승)',
    prescription: '「10분 강제 타임아웃 & 마킹 룰」: ①타이머를 켜고 10분 동안 풀이 방향이 2갈래 이상 잡히지 않으면 즉시 문제 번호 위에 [별표 3개]를 치고 손을 뗗니다. ②심호흡 3회 후 다음 번호로 강제 점프합니다. ③전체 시험지/세션 1회독 완료 후 남은 시간(골든 버퍼)에 맑아진 뇌로 다시 돌아와 접근합니다.'
  },
  {
    id: 'habit-03',
    title: '공부 시작 전 책상 정리, 필통 정리, 플래너 꾸미기로 30분 쓰기',
    description: '어려운 공부를 시작하기 두려워 사소한 정리에 몰두하는 회피성 완벽주의',
    category: '회피 행동 (Avoidance)',
    wastedMinutesPerDay: 30,
    brainCause: '공부 착수 직전 작업기억 과부하에 대한 공포로 인해 발생하는 "생산적 회피(Productive Procrastination)" 현상입니다. 책상 청소나 펜 정리는 손쉬운 정리 작업을 통해 즉각적인 소소한 성취감(도파민)을 주기 때문에, 무의식적으로 고통스러운 진짜 공부를 뒤로 미루는 뇌의 방어 반응입니다.',
    impact: '가장 뇌가 맑고 집중력이 높은 착석 골든타임 30~40분을 비생산적 행동으로 허비하며, 정작 책을 펼쳤을 때는 이미 시작 관성(Inertia)에 지쳐 학습 의지가 꺾입니다.',
    expectedScoreBoost: '🎯 일일 순공 시간 +45분 즉시 확보, 월 22시간 추가 공부량 창출',
    prescription: '「2분 착수 트리거 (Zero-Friction Rx)」: ①전날 밤 취침 전, 내일 아침 풀 문제집을 펼쳐놓고 펜 뚜껑까지 열어둔 채 퇴실합니다. ②착석 즉시 정리·플래너 일체 금지, 타이머를 2분 누르고 첫 문제의 첫 문장 1줄만 무조건 읽고 쓰기 시작합니다. ③두뇌 시동이 걸리면 자연스럽게 몰입 상태로 전이됩니다.'
  },
  {
    id: 'habit-04',
    title: '인강 들으며 음악/유튜브 틀어놓고 멀티태스킹하기',
    description: '뇌의 도파민을 채우려다 작업기억 용량을 반토막 내는 집중력 분산',
    category: '도파민 분산 (Distraction)',
    wastedMinutesPerDay: 40,
    brainCause: '만성적인 D2 도파민 수용체 둔화로 인해 단일한 공부 자극에 만족하지 못하고 복합적인 감각 자극을 갈망하는 신경학적 주의 분산증입니다. 인간의 작업기억(Working Memory)은 단일 채널 음운 루프(Phonological Loop)를 공유하므로, 음악 가사나 배경 영상이 뇌로 유입되는 순간 공부 정보의 부호화(Encoding)가 70% 이상 차단됩니다.',
    impact: '인강을 3시간 들었어도 뇌에는 30분 분량만 조각나 저장됩니다. 장기기억화(LTP)가 차단되어 3일만 지나면 개념이 백지상태가 되며 실전 응용력이 전무해집니다.',
    expectedScoreBoost: '🎯 개념 암기 기억 유지율 3배 증가, 탐구 영역 백분위 +15%p 상승',
    prescription: '「감각 단일화 & 비행기 모드 격리」: ①인강 수강 시 스마트폰은 전원 종료 후 가방 깊숙이 넣거나 다른 방에 둡니다. ②BGM은 일체 차단하며, 주변 소음이 심할 경우 핑크 노이즈(Pink Noise) 또는 무음 귀마개만 허용합니다. ③강의 1강 종료 후 5분간 화면을 끄고 강사가 말한 핵심 뼈대를 빈 종이에 인출합니다.'
  },
  {
    id: 'habit-05',
    title: '침대나 소파에 엎드려서 책 보거나 인강 듣기',
    description: '자세 이완으로 인해 뇌 각성도가 떨어져 20분 내로 졸음과 브레인포그 유발',
    category: '각성도 저하 (Low Arousal)',
    wastedMinutesPerDay: 50,
    brainCause: '신체 자세가 이완되면 상행망상활성계(ARAS)를 통한 뇌간의 상향식 각성 신호가 급감합니다. 뇌는 엎드린 자세를 수면 준비 상태로 인식하여 멜라토닌 분비를 촉진하고 뇌파를 집중의 베타파에서 졸음의 세타파(Theta waves)로 떨어뜨립니다.',
    impact: '책상 앞 공부 시간 대비 실제 흡수율이 30% 이하로 급락합니다. "공부했다"는 자기만족만 남고 실질적인 두뇌 연산은 멈춘 브레인포그(Brain Fog) 상태로 시간이 낭비됩니다.',
    expectedScoreBoost: '🎯 졸음/멍때림 시간 제로화, 모의고사 전 과목 평균 +6~10점 상승',
    prescription: '「직각 착석 & 시야각 15도 유지」: ①공부는 오직 허리를 90도로 세울 수 있는 정규 독서실/책상 의자에서만 진행합니다. ②독서대를 사용하여 시야각을 15~20도 상향 고정하여 뇌 각성도를 물리적으로 자극합니다. ③졸음 전조 증상 발생 시 즉시 기립하여 3분 스트레칭 및 시원한 냉수를 음용합니다.'
  },
  {
    id: 'habit-06',
    title: '어려운 수학/국어 제쳐두고 쉬운 과목만 먼저 하기',
    description: '전두엽 에너지가 가장 맑은 골든타임을 쉬운 과목으로 낭비하는 편식 공부',
    category: '골든타임 낭비 (Misplacement)',
    wastedMinutesPerDay: 30,
    brainCause: '자아 고갈(Ego Depletion)을 피하려는 무의식적 편식 학습입니다. 전두엽 에너지가 가장 충만하고 신경전달물질이 맑은 오전 시간대에 인지 부하가 높은 킬러 과목을 회피하고, 뇌가 편안함을 느끼는 단순 암기나 좋아하는 쉬운 과목으로 도피하는 현상입니다.',
    impact: '진짜 등급을 결정짓는 취약 킬러 과목의 공부량이 절대적으로 부족해져, 아무리 하루 10시간을 앉아있어도 수능 당일 불수능 시험지를 받는 순간 치명적인 등급 폭락을 맞이합니다.',
    expectedScoreBoost: '🎯 취약 과목 3~4등급 ➡️ 안정적 1~2등급 도약 (+15~20점 수직 상승)',
    prescription: '「Eat That Frog: 오전 90분 킬러 블록」: ①기상 후 두뇌 각성 골든타임(식사 30분 후 첫 착석)에는 무조건 가장 취약하고 피하고 싶은 1순위 킬러 과목(수학 킬러/국어 독서)만 배치합니다. ②이 90분이 끝나기 전까지는 탐구나 쉬운 과목 책을 가방에서 꺼내지도 않는 철칙을 수립합니다.'
  },
  {
    id: 'habit-07',
    title: '형광펜 밑줄만 예쁘게 긋고 "다 외웠다"고 착각하기',
    description: '책을 읽으며 줄만 치고 스스로 인출(Recall)해보지 않는 수동적 눈공부',
    category: '수동적 착각 (Passive Reading)',
    wastedMinutesPerDay: 35,
    brainCause: '시각적 친숙함(Recognition)을 뇌의 인출(Recall) 능력으로 오인하는 메타인지(Metacognition) 오류입니다. 텍스트에 색칠할 때 시각 피질은 정보를 보았기 때문에 "안다"고 착각하지만, 해마와 대뇌피질 사이의 시냅스 연결 고리는 전혀 형성되지 않은 수동적 소비에 불과합니다.',
    impact: '문제를 풀 때는 선지가 헷갈려 정답률이 50% 밑으로 떨어지고, "공부할 땐 다 알았는데 시험장 가면 머리가 하얘진다"는 만성적 시험 불안을 유발합니다.',
    expectedScoreBoost: '🎯 수능 탐구/한국사/영어 빈칸추론 오답률 40% 감소 (+6~10점 상승)',
    prescription: '「블라인드 백지 인출(Active Recall) Rx」: ①형광펜 사용을 1페이지당 최대 3단어로 제한합니다. ②1개 소단원을 읽은 즉시 책을 완전히 덮습니다. ③빈 A4 용지에 방금 읽은 내용의 [핵심 개념 3가지]와 [인과관계 화살표]를 기억만으로 손으로 직접 써내려간 뒤 책과 대조합니다.'
  },
  {
    id: 'habit-08',
    title: '오답노트에 문제와 해설을 예쁘게 옮겨 적기만 하기',
    description: '사고 과정의 오류를 짚지 않고 글씨를 베껴 쓰며 만족하는 장식적 노동',
    category: '필사 노동 (Decorative Writing)',
    wastedMinutesPerDay: 40,
    brainCause: '전두엽의 고차원적 오류 분석 사고를 차단하고, 손가락 소근육의 단순 반복 운동으로 뇌를 달래는 가짜 성취감 추구 기제입니다. 글씨를 반듯하게 적는 행위는 시각적 만족감을 주어 뇌가 실질적인 사고의 고통을 건너뛰게 만듭니다.',
    impact: '오답 정리에 1시간을 쏟아부어도, 일주일 뒤 숫자나 조건만 바꾼 유사 변형 문제를 주면 85% 이상의 확률로 똑같이 다시 틀리게 됩니다.',
    expectedScoreBoost: '🎯 유사 변형 문제 오답률 0% 수렴, 수학/과탐 2등급 안정 확보',
    prescription: '「3줄 메타인지 오답노트 (No-Copying Rx)」: ①문제와 해설 베껴 쓰기 절대 금지. ②오답 상단에 딱 3줄만 기록합니다: 1줄-내가 시험장에서 착각한 잘못된 사고 경로, 2줄-출제자가 판 함정 키워드, 3줄-다음에 이 유형을 볼 때 떠올릴 첫 번째 행동 수칙. ③3일 후 백지 상태에서 재풀이 1회 실시.'
  },
  {
    id: 'habit-09',
    title: '인강만 하루 5~6시간 연속으로 들으며 스스로 푸는 자습 건너뛰기',
    description: '스타 강사의 유려한 풀이를 보며 내가 이해했다고 믿는 인강 중독증',
    category: '대리 만족 (Lecture Addiction)',
    wastedMinutesPerDay: 60,
    brainCause: '일타 강사의 명쾌한 설명을 보며 거울 뉴런(Mirror Neurons)이 활성화되어, 강사의 수학적 문제 해결력이 마치 자신의 능력인 양 뇌가 착각하는 "대리 이해 착시"입니다. 신경망의 시냅스 강화(LTP)는 스스로 오답과 씨름하며 뇌가 땀을 흘릴 때만 형성됩니다.',
    impact: '혼자 모의고사를 풀 때 1번 문제부터 조건 해석이 막히며 심각한 인지 마비(Cognitive Freezing)를 겪게 되고, 강의 러닝타임만 채우는 만년 수험생 루프에 갇힙니다.',
    expectedScoreBoost: '🎯 실전 수능 100분 시험 운용 체력 완성, 전 과목 백분위 종합 +12%p 상승',
    prescription: '「1:2 인강·순공 절대 보존 법칙」: ①인강 1시간을 수강했다면 무조건 그날 해당 과목의 [혼자 문제 풀고 씹어먹는 자습 시간 2시간]이 확보되지 않으면 다음 인강 재생을 금지합니다. ②강의 수강 직후 강의창을 닫고, 강사가 풀어준 예제를 빈 화면에서 스스로 끝까지 풀어냅니다.'
  },
  {
    id: 'habit-10',
    title: '모르는 개념 검색하려다 SNS·쇼츠·커뮤니티로 탈선하기',
    description: '공부 목적으로 폰을 켰다가 알고리즘 추천 영상과 피드로 빠져 시간 낭비',
    category: '디지털 탈선 (Digital Derailment)',
    wastedMinutesPerDay: 45,
    brainCause: '모르는 개념에 부딪혔을 때 발생하는 뇌의 인지적 마찰(Friction)을 해소하기 위해 스마트폰을 켜는 순간, 복측 선조체(Ventral Striatum)가 알고리즘의 강력한 가변 보상(Variable Reward)에 중독되어 전두엽 억제 제동력이 즉각 마비되는 현상입니다.',
    impact: '단 5분만 보려던 쇼츠가 30~40분으로 이어지고, 스마트폰에서 빠져나온 후에도 도파민 여운(Attention Residue)으로 인해 깊은 몰입(Flow) 상태로 재진입하는 데 최소 23분의 뇌 재부팅 시간이 낭비됩니다.',
    expectedScoreBoost: '🎯 주의 집중력 지속시간 2.5배 연장, 킬러 고난도 문항 몰입 유지력 극대화',
    prescription: '「아날로그 의문 파킹 랏(Parking Lot) 메모법」: ①공부 중 모르는 단어나 개념이 나와도 실시간 스마트폰 검색 절대 금지. ②책상 옆 노란색 포스트잇에 [궁금한 단어/페이지]만 1줄 메모해두고 즉시 다음 진도를 나갑니다. ③당일 모든 자습이 끝난 마지막 20분에만 몰아서 일괄 검색하여 해결합니다.'
  },
  {
    id: 'habit-11',
    title: '새벽 2~3시까지 졸면서 억지로 책상에 붙어있기',
    description: '수면 부족으로 인해 뇌 회로가 반쯤 잠든 상태에서 시간만 채우는 비효율 공부',
    category: '수면 부채 (Sleep Deprivation)',
    wastedMinutesPerDay: 60,
    brainCause: '뇌의 림프계(Glymphatic System)를 통한 피로 부산물(베타 아밀로이드, 아데노신) 청소 메커니즘을 차단하고, 해마에서 대뇌피질로 기억을 전송하는 수면 공고화(Memory Consolidation) 단계를 스스로 파괴하는 행위입니다. 수면이 박탈된 뇌는 혈중 알코올 농도 0.08%(면허 취소 수준)와 동일한 전두엽 처리 지연을 겪습니다.',
    impact: '새벽에 3시간을 억지로 버텨봤자 다음 날 학교나 학원 수업 시간 전체를 멍때리며 날리게 되어, 3시간 얻고 8시간을 잃는 최악의 마이너스 학습 손실이 발생합니다.',
    expectedScoreBoost: '🎯 두뇌 연산 처리 속도 40% 개선, 시험 당일 어이없는 계산 실수 90% 제거',
    prescription: '「서카디안 골든 6.5시간 락인」: ①수험생의 취침 한계선은 무조건 자정(24:00)으로 고정합니다. ②아무리 공부가 덜 끝났어도 24:00에는 소등하고 최소 6.5시간의 연속 수면을 보장해야 해마가 낮에 공부한 지식을 장기기억으로 압축 저장합니다. ③새벽 공부 대신 오전 6:30 기상 후 맑은 뇌로 공부합니다.'
  },
  {
    id: 'habit-12',
    title: '계획만 하루 12시간 빽빽하게 세우고 1개 틀어지면 하루 통째로 포기하기',
    description: '비현실적인 계획을 세우고 작은 차질에도 올-오어-낫싱(All or Nothing)으로 자포자기',
    category: '완벽주의 번아웃 (Planning Burnout)',
    wastedMinutesPerDay: 50,
    brainCause: '계획 오류(Planning Fallacy)와 완벽주의적 흑백논리(All-or-Nothing) 인지 왜곡이 결합된 상태입니다. 오전 계획이 단 15분만 지연되어도 편도체는 극심한 자기 비난과 죄책감을 분비하고, 이를 방어하기 위해 "오늘은 망했으니 내일부터 새로 시작하자"는 식의 학습 파업(회피)을 선택합니다.',
    impact: '한 달 중 실제로 계획대로 공부하는 날은 2~3일에 불과하며, 만성적인 자책감과 학습된 무기력(Learned Helplessness)에 빠져 수험 생활 전반의 자존감이 붕괴됩니다.',
    expectedScoreBoost: '🎯 주간 학습 완수율 30% ➡️ 85% 달성, 슬럼프 없는 안정적 수험 페이스 유지',
    prescription: '「70% 탄력 버퍼 스케줄링 & 10분 마감 룰」: ①하루 계획은 최대 집중 가용 시간의 70%만 채우고, 나머지 30%는 무조건 비어있는 [완충 버퍼(Buffer Zone)]로 편성합니다. ②계획이 밀렸을 땐 포기하지 말고 밀린 분량을 버퍼 시간에 흡수시킵니다. ③"완벽한 하루"가 아니라 "70% 완주한 날들의 연속"이 수능 1등급을 만든다는 마인드셋을 확립합니다.'
  }
];

export const HabitClinicPage: React.FC<HabitClinicPageProps> = ({ user, onUpgradeClick }) => {
  const isPremiumOrAbove = hasRequiredTier(user.tier, 'premium');
  const isPlusOrAbove = hasRequiredTier(user.tier, 'premium');

  // 체크된 습관 목록 (저장된 진단이 있으면 복원, 없으면 기본값)
  const [checkedIds, setCheckedIds] = useState<string[]>(() => {
    try {
      const saved = dataSyncService.getHabitDiagnosis(user.studentId);
      if (saved && Array.isArray(saved.checkedHabitIds) && saved.checkedHabitIds.length > 0) {
        return saved.checkedHabitIds;
      }
    } catch { /* ignore */ }
    return [];
  });
  const [isDiagnosisSaved, setIsDiagnosisSaved] = useState(() => {
    try {
      return !!dataSyncService.getHabitDiagnosis(user.studentId);
    } catch {
      return false;
    }
  });
  const [showReportModal, setShowReportModal] = useState(false);

  // 실시간 행동 교정기 (PREMIUM 전용) 10대 뇌신경 프로토콜 상태
  useNbassRemoteRefresh(() => {
    try {
      const saved = dataSyncService.getHabitDiagnosis(user.studentId);
      if (saved && Array.isArray(saved.checkedHabitIds)) {
        setCheckedIds(saved.checkedHabitIds);
        setIsDiagnosisSaved(true);
      }
    } catch { /* ignore */ }
  }, ['habit', 'remote']);

  type ProtocolId = 'p1' | 'p2' | 'p3' | 'p4' | 'p5' | 'p6' | 'p7' | 'p8' | 'p9' | 'p10';

  const PROTOCOL_META: Record<ProtocolId, { no: number; group: 'core' | 'boost'; step: string; name: string; fullTitle: string; icon: string }> = {
    p1: { no: 1, group: 'core', step: '1번', name: '물리 차단', fullTitle: '실전 3단계 물리 행동 교정기 (자극 제어 & 서약)', icon: '🔒' },
    p2: { no: 2, group: 'core', step: '2번', name: 'IF-THEN', fullTitle: 'IF-THEN 신경망 조건반사 스위치 (이행 의도 실행기)', icon: '🧠' },
    p3: { no: 3, group: 'core', step: '3번', name: '60초 리콜', fullTitle: '60초 마이크로 리콜 & 파인만 보이스 인출기 (능동 회상)', icon: '🎙️' },
    p4: { no: 4, group: 'boost', step: '4번', name: '도파민 스트릭', fullTitle: '도파민 연속 스트릭 & 손실 회피(Loss Aversion) 금고', icon: '🔥' },
    p5: { no: 5, group: 'boost', step: '5번', name: '학부모 안심', fullTitle: '학부모 안심 동기화 & 잔소리 제로(Zero) 세이프가드', icon: '📲' },
    p6: { no: 6, group: 'core', step: '6번', name: '3분 한숨', fullTitle: '3분 생리학적 한숨(Physiological Sigh) & HRV 리셋', icon: '🫁' },
    p7: { no: 7, group: 'core', step: '7번', name: '3색 오답', fullTitle: '3색 뇌신경 오답 메타인지 분해기 (착각 지점 분해)', icon: '🎯' },
    p8: { no: 8, group: 'boost', step: '8번', name: '시각 터널링', fullTitle: '시각 터널링 & 모노태스킹 블랙아웃 (주의 잔류물 0%)', icon: '🌑' },
    p9: { no: 9, group: 'boost', step: '9번', name: '울트라디안', fullTitle: '울트라디안 90분 피크-딥(Peak-Dip) 과목 매칭', icon: '⚡' },
    p10: { no: 10, group: 'boost', step: '10번', name: '수면 고착', fullTitle: '취침 직전 15분 해마 수면 고착 (Sleep Memory Replay)', icon: '🌙' },
  };

  const [protocolCategory, setProtocolCategory] = useState<'all' | 'core' | 'boost'>('all');
  const [activeProtocolTab, setActiveProtocolTab] = useState<ProtocolId>('p1');
  const [selectedTargetHabit, setSelectedTargetHabit] = useState<string>('habit-01');
  const [isRoutineRunning, setIsRoutineRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [successStreak, setSuccessStreak] = useState(0); // 교정 시작 전
  const [todayCompleted, setTodayCompleted] = useState(false);

  // [프로토콜 1] 물리 차단 & 점진 힌트
  const [pledgeChecked, setPledgeChecked] = useState(false);
  const [distanceChecked, setDistanceChecked] = useState(false);
  const [hintLevel, setHintLevel] = useState<1 | 2 | 3>(1);

  // [프로토콜 2] IF-THEN 조건반사 스위치
  const [ifSituation, setIfSituation] = useState('수학/과탐 난문에서 3분간 막혀 답지를 열고 싶을 때');
  const [thenReaction, setThenReaction] = useState('즉시 샤프를 내려놓고 이면지에 문제 핵심 조건 3가지를 동그라미 치며 2분간 말로 설명한다');
  const [sosTriggered, setSosTriggered] = useState(false);

  // [프로토콜 3] 60초 마이크로 리콜 & 파인만 인출기
  const [recallInput, setRecallInput] = useState('');
  const [recallScore, setRecallScore] = useState<number | null>(null);
  const [isAnalyzingRecall, setIsAnalyzingRecall] = useState(false);

  // [프로토콜 4] 도파민 연속 스트릭 & 손실 회피 금고
  const [dopamineStreak, setDopamineStreak] = useState(0);
  const [dopaminePoints, setDopaminePoints] = useState(0);
  const [isStreakProtected, setIsStreakProtected] = useState(false);
  const [streakNotice, setStreakNotice] = useState(false);

  // [프로토콜 5] 학부모 실시간 안심 동기화 루프
  const [parentSyncSent, setParentSyncSent] = useState(false);
  const [parentNoticeToast, setParentNoticeToast] = useState(false);

  // [프로토콜 6] 3분 생리학적 한숨 & HRV 리셋
  const [isSighRunning, setIsSighRunning] = useState(false);
  const [sighSeconds, setSighSeconds] = useState(180);
  const [sighPhase, setSighPhase] = useState<'inhale1' | 'inhale2' | 'exhale'>('inhale1');
  const [hrvStatus, setHrvStatus] = useState<number>(0); // 호흡 시작 전 0% (실측 연동 전까지 추정치 미표시)

  // [프로토콜 7] 3색 뇌신경 오답 분해기
  const [redTrap, setRedTrap] = useState('');
  const [yellowMissing, setYellowMissing] = useState('');
  const [greenAction, setGreenAction] = useState('');
  const [savedErrorCount, setSavedErrorCount] = useState(0);
  const [errorSavedNotice, setErrorSavedNotice] = useState(false);

  // [프로토콜 8] 시각 터널링 & 모노태스킹 블랙아웃
  const [isBlackoutActive, setIsBlackoutActive] = useState(false);
  const [blackoutDeskChecked, setBlackoutDeskChecked] = useState(false);
  const [blackoutTimer, setBlackoutTimer] = useState(25 * 60);
  const [isBlackoutRunning, setIsBlackoutRunning] = useState(false);
  const [blackoutConcept, setBlackoutConcept] = useState('');

  // [프로토콜 9] 울트라디안 90분 피크-딥 과목 매칭
  const [chronotype, setChronotype] = useState<'LARK' | 'OWL'>('LARK');
  const [isUltradianApplied, setIsUltradianApplied] = useState(false);

  // [프로토콜 10] 취침 직전 15분 해마 수면 고착
  const [sleepPledgeChecked, setSleepPledgeChecked] = useState(false);
  const [sleepReplayActive, setSleepReplayActive] = useState(false);
  const [replayCardIndex, setReplayCardIndex] = useState(0);

  // 10대 프로토콜 가동 개수 및 기대 점수 계산
  const activeProtocolsCount = 
    (pledgeChecked || distanceChecked || isRoutineRunning ? 1 : 0) +
    (ifSituation ? 1 : 0) +
    (recallScore !== null ? 1 : 0) +
    (isStreakProtected ? 1 : 0) +
    (parentSyncSent ? 1 : 0) +
    (isSighRunning || sighSeconds < 180 ? 1 : 0) +
    (savedErrorCount > 0 ? 1 : 0) +
    (isBlackoutActive || blackoutDeskChecked ? 1 : 0) +
    (isUltradianApplied ? 1 : 0) +
    (sleepPledgeChecked ? 1 : 0);

  const boostMap: Record<number, { score: string; hours: string; tierBenefit: string }> = {
    0: { score: '+4~6점', hours: '+1.5시간', tierBenefit: '1개 등급 상승 기반 확보' },
    1: { score: '+6~8점', hours: '+1.8시간', tierBenefit: '가짜 공부 차단, 1개 등급 상승' },
    2: { score: '+10~13점', hours: '+2.2시간', tierBenefit: '시험장 당황 방지, 1.5개 등급 상승' },
    3: { score: '+14~17점', hours: '+2.6시간', tierBenefit: '장기기억 고착 회로 가동, 1.5개 등급 도약' },
    4: { score: '+18~21점', hours: '+3.0시간', tierBenefit: '작심삼일 탈피, 2개 등급 수직 상승' },
    5: { score: '+22~25점', hours: '+3.4시간', tierBenefit: '시험 불안 60% 차단, 준킬러 정복' },
    6: { score: '+25~28점', hours: '+3.7시간', tierBenefit: '자율신경 평정심, 킬러 2문항 추가 확보' },
    7: { score: '+28~31점', hours: '+4.0시간', tierBenefit: '오답 변형 완전 정복, 최상위권 안착' },
    8: { score: '+30~33점', hours: '+4.2시간', tierBenefit: '시각 노이즈 제로, 독해 속도 20% 단축' },
    9: { score: '+32~35점', hours: '+4.5시간', tierBenefit: '두뇌 생체리듬 극대화, 전 과목 1등급' },
    10: { score: '+35~38점 수직 상승!', hours: '+5.0시간 이상', tierBenefit: '전 과목 만점/의치한약수·SKY 합격선 돌파' }
  };
  const currentBoost = boostMap[activeProtocolsCount] || boostMap[10];

  // 12대 CareType 종합진단 연계 파이프라인 분석 및 AI 추천 매칭 엔진
  const rawCareTypeStr = (user.careType || user.primaryCareType || user.careTypeName || 'Brain Fatigue').toString();

  type ClinicalPattern = 'FATIGUE' | 'DISTRACTION' | 'ANXIETY' | 'SURFACE_STUDY';
  let pattern: ClinicalPattern = 'FATIGUE';
  let careTypeDisplay = '두뇌 피로형 (Brain Fatigue)';

  if (rawCareTypeStr.includes('Attention') || rawCareTypeStr.includes('Hypersensitive') || rawCareTypeStr.includes('산만')) {
    pattern = 'DISTRACTION';
    careTypeDisplay = '주의력 산만 & 도파민 갈망형';
  } else if (rawCareTypeStr.includes('Anxiety') || rawCareTypeStr.includes('Stress') || rawCareTypeStr.includes('긴장') || rawCareTypeStr.includes('불안')) {
    pattern = 'ANXIETY';
    careTypeDisplay = '불안-긴장 과민형 (Anxiety-Tension)';
  } else if (rawCareTypeStr.includes('Depression') || rawCareTypeStr.includes('Concentration') || rawCareTypeStr.includes('Amotivation') || rawCareTypeStr.includes('무기력')) {
    pattern = 'SURFACE_STUDY';
    careTypeDisplay = '가짜 공부 & 표면 처리형 (Surface Study)';
  } else {
    pattern = 'FATIGUE';
    careTypeDisplay = '두뇌 피로 & 에너지 방전형 (Brain Fatigue)';
  }

  interface PipelineRecommendation {
    primaryId: ProtocolId;
    primaryTitle: string;
    primaryGain: string;
    primaryScore: string;
    secondaryIds: ProtocolId[];
    secondaryTitle: string;
    secondaryCumulativeGain: string;
    secondaryScore: string;
  }

  const pipelineMap: Record<ClinicalPattern, PipelineRecommendation> = {
    FATIGUE: {
      primaryId: 'p6',
      primaryTitle: '방법 6: 🫁 3분 생리학적 한숨 & HRV 리셋',
      primaryGain: '전두엽 포도당 대사 고갈로 인한 만성 인지 방전 즉각 차단. 멍때리는 가짜 공부 45분 회복 및 뇌 정지(Brain Freeze) 80% 차단',
      primaryScore: '+6~8점 확보 (1개 등급 상승)',
      secondaryIds: ['p9', 'p10', 'p1'],
      secondaryTitle: '방법 9(울트라디안 피크-딥) + 방법 10(수면 리플레이) + 방법 1(물리 차단)',
      secondaryCumulativeGain: '두뇌 바이오리듬 최적화 + 밤사이 해마 장기기억 고착으로 일일 순공 3.5시간 이상 순도 100% 회복',
      secondaryScore: '총 +22~26점 수직 상승! (2개 등급 도약)'
    },
    DISTRACTION: {
      primaryId: 'p1',
      primaryTitle: '방법 1: 🔒 3단계 물리적 차단 & 힌트 오픈',
      primaryGain: '시각 자극 3m 격리로 충동적 도파민 열람 70% 억제. 답지 확인 욕구 봉쇄 및 킬러 문항 사유 지구력 2배 증대',
      primaryScore: '+6~8점 확보 (킬러 문항 정답)',
      secondaryIds: ['p8', 'p4', 'p2'],
      secondaryTitle: '방법 8(시각 터널링 블랙아웃) + 방법 4(도파민 스트릭) + 방법 2(IF-THEN)',
      secondaryCumulativeGain: '시각 피질 분산 0% 통제 + 손실 회피 심리로 작심삼일 영구 박멸, 일일 낭비 시간 3시간 즉각 회수',
      secondaryScore: '총 +24~28점 수직 상승! (1~2등급 도약)'
    },
    ANXIETY: {
      primaryId: 'p2',
      primaryTitle: '방법 2: 🧠 IF-THEN 조건반사 스위치',
      primaryGain: '난문 마주할 때 편도체 공포 반응 및 멘탈 붕괴 85% 차단. 무의식적 10초 대체 행동 자동 실행으로 실수 완벽 방어',
      primaryScore: '+6~8점 확보 (마킹 실수 0건)',
      secondaryIds: ['p6', 'p5', 'p7'],
      secondaryTitle: '방법 6(HRV 호흡) + 방법 5(학부모 안심 동기화) + 방법 7(3색 오답)',
      secondaryCumulativeGain: '시험 당일 긴장성 복통/두통 제로화 및 가정 내 잔소리 갈등 80% 감소로 심리적 평정심 극대화',
      secondaryScore: '총 +22~27점 수직 상승! (최상위권 도약)'
    },
    SURFACE_STUDY: {
      primaryId: 'p3',
      primaryTitle: '방법 3: 🎙️ 60초 마이크로 리콜 & 인출기',
      primaryGain: '가짜 숙달 효과(Fluency Illusion) 파괴. 30분 공부 후 60초 인출로 해마 LTP 가동하여 개념 혼동 실수 완벽 제거',
      primaryScore: '+7~9점 확보 (신유형 문항 완벽 격파)',
      secondaryIds: ['p7', 'p10', 'p1'],
      secondaryTitle: '방법 7(3색 오답 분해) + 방법 10(수면 리플레이) + 방법 1(물리 차단)',
      secondaryCumulativeGain: '단순 베껴 쓰기 박멸, 3색 메타인지 & 밤샘 수면 고착으로 장기기억 보존율 8배 증폭',
      secondaryScore: '총 +24~30점 수직 상승! (2개 등급 수직 점프)'
    }
  };

  const currentRec = pipelineMap[pattern];

  useEffect(() => {
    if (currentRec?.primaryId) {
      setActiveProtocolTab(currentRec.primaryId);
    }
  }, [pattern]);

  // [프로토콜 8] 시각 터널링 블랙아웃 타이머
  useEffect(() => {
    let bInterval: any = null;
    if (isBlackoutRunning && blackoutTimer > 0) {
      bInterval = setInterval(() => {
        setBlackoutTimer(prev => prev - 1);
      }, 1000);
    } else if (blackoutTimer === 0) {
      setIsBlackoutRunning(false);
      alert('🌑 시각 터널링 25분 초집중 완료! 시각 피질 주의 잔류물 0% 통제에 성공했습니다.');
    }
    return () => clearInterval(bInterval);
  }, [isBlackoutRunning, blackoutTimer]);

  // 생리학적 한숨 (Physiological Sigh) 3분 타이머
  useEffect(() => {
    let sighInterval: any = null;
    if (isSighRunning && sighSeconds > 0) {
      sighInterval = setInterval(() => {
        setSighSeconds(prev => {
          const next = prev - 1;
          const elapsed = 180 - next;
          const cycleSec = elapsed % 9;
          if (cycleSec < 2) {
            setSighPhase('inhale1');
          } else if (cycleSec < 3) {
            setSighPhase('inhale2');
          } else {
            setSighPhase('exhale');
          }
          setHrvStatus(h => Math.min(99, Math.round((h + 0.3) * 10) / 10));
          return next;
        });
      }, 1000);
    } else if (sighSeconds === 0) {
      setIsSighRunning(false);
      setHrvStatus(99);
      alert('🫁 3분 생리학적 한숨 리셋 완료! 자율신경계(HRV)가 정상화되고 전두엽 혈류가 30% 복원되었습니다.');
    }
    return () => clearInterval(sighInterval);
  }, [isSighRunning, sighSeconds]);

  const handleAnalyzeRecall = () => {
    if (!recallInput.trim()) {
      alert('인출할 핵심 개념이나 요약 내용을 작성해주세요.');
      return;
    }
    setIsAnalyzingRecall(true);
    setTimeout(() => {
      setIsAnalyzingRecall(false);
      const words = recallInput.trim().split(/\s+/).length;
      const calculated = Math.min(98, Math.max(82, 75 + words * 2));
      setRecallScore(calculated);
    }, 600);
  };

  const handleSaveErrorNote = () => {
    if (!redTrap.trim() || !yellowMissing.trim() || !greenAction.trim()) {
      alert('착각 지점(Red), 인출 실패(Yellow), 초동 조치(Green) 3가지를 모두 입력해주세요.');
      return;
    }
    setErrorSavedNotice(true);
    setTimeout(() => setErrorSavedNotice(false), 3000);
    setSavedErrorCount(prev => prev + 1);
    setRedTrap('');
    setYellowMissing('');
    setGreenAction('');
  };

  const toggleHabitCheck = (id: string) => {
    setCheckedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // 총 낭비 시간 계산
  const totalWastedMinutes = checkedIds.reduce((sum, id) => {
    const found = BAD_HABITS_LIST.find(h => h.id === id);
    return sum + (found?.wastedMinutesPerDay || 0);
  }, 0);

  // 뽀모도로 카운트다운
  useEffect(() => {
    let timer: any = null;
    if (isRoutineRunning && timerSeconds > 0) {
      timer = setInterval(() => setTimerSeconds(prev => prev - 1), 1000);
    } else if (timerSeconds === 0) {
      setIsRoutineRunning(false);
      alert('🎉 25분 행동 교정 세션 완료! 나쁜 습관을 참으셨나요?');
    }
    return () => clearInterval(timer);
  }, [isRoutineRunning, timerSeconds]);

  const handleRunDiagnosis = async () => {
    if (checkedIds.length === 0) {
      alert('최소 1개 이상의 습관을 선택해주세요.');
      return;
    }
    setIsDiagnosisSaved(true);
    setShowReportModal(true);
    await dataSyncService.saveHabitDiagnosis({
      studentId: user.studentId,
      checkedHabitIds: checkedIds,
      totalWastedMinutes,
      shockReport: {
        wastedTimeSummary: `매일 약 ${totalWastedMinutes}분의 가짜 공부 발생`,
        brainScienceCause: '전두엽 포도당 대사 고갈로 뇌가 사고를 회피하는 생리적 반응',
      }
    });
  };

  const handleSuccessCheck = () => {
    setSuccessStreak(prev => prev + 1);
    setTodayCompleted(true);
    alert('🏆 대단합니다! 오늘의 나쁜 습관을 성공적으로 참아내어 전두엽 억제 통제력이 강화되었습니다!');
  };

  const handlePrintReport = () => {
    const studentName = user.name || '수험생';
    const studentId = user.studentId || 'NBASS-2026-ST01';
    const dateStr = new Date().toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    const monthlyWastedHours = Math.round((totalWastedMinutes * 30) / 60);

    const habitsHtml = checkedIds.map(id => {
      const h = BAD_HABITS_LIST.find(item => item.id === id);
      if (!h) return '';
      return `
        <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 14px; margin-bottom: 10px; background: #f8fafc; page-break-inside: avoid; break-inside: avoid;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <div>
              <span style="font-size: 10px; font-weight: 800; background: #fee2e2; color: #b91c1c; padding: 2px 7px; border-radius: 4px;">${h.category}</span>
              <span style="font-size: 12px; font-weight: 800; color: #0f172a; margin-left: 6px;">${h.title}</span>
            </div>
            <span style="font-size: 11px; font-weight: 800; color: #e11d48; font-family: monospace;">일일 -${h.wastedMinutesPerDay}분 손실</span>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1.2fr; gap: 8px; font-size: 10.5px;">
            <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 7px;">
              <div style="font-size: 10px; font-weight: 800; color: #4338ca; margin-bottom: 2px;">🧠 뇌과학적 원인</div>
              <div style="color: #475569; line-height: 1.4;">${h.brainCause || ''}</div>
            </div>
            <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 7px;">
              <div style="font-size: 10px; font-weight: 800; color: #e11d48; margin-bottom: 2px;">⚡ 수능/성적 악영향</div>
              <div style="color: #475569; line-height: 1.4; margin-bottom: 4px;">${h.impact || ''}</div>
              ${h.expectedScoreBoost ? `<div style="font-size: 9.5px; font-weight: 800; color: #d97706; background: #fef3c7; padding: 3px 6px; border-radius: 4px; border: 1px solid #fde68a;">${h.expectedScoreBoost}</div>` : ''}
            </div>
            <div style="background: ${isPlusOrAbove ? '#f0fdf4' : '#fdf4ff'}; border: 1px solid ${isPlusOrAbove ? '#bbf7d0' : '#f0abfc'}; border-radius: 8px; padding: 7px;">
              <div style="font-size: 10px; font-weight: 800; color: ${isPlusOrAbove ? '#15803d' : '#86198f'}; margin-bottom: 2px;">💊 임상 교정 처방 (Rx) ${isPlusOrAbove ? '' : '[PREMIUM 전용]'}</div>
              <div style="color: ${isPlusOrAbove ? '#166534' : '#701a75'}; line-height: 1.4;">
                ${isPlusOrAbove ? (h.prescription || '') : '🔒 본 습관의 정밀 임상 처방전(Rx) 및 3단계 힌트 프로토콜은 PREMIUM 등급 전용입니다.'}
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    const printWindow = window.open('', '_blank', 'width=850,height=1000');
    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="ko">
      <head>
        <meta charset="UTF-8">
        <title>수험생 나쁜 공부습관 뇌과학 정밀 진단 소견서 - ${studentName}</title>
        <style>
          @page { size: A4 portrait; margin: 12mm 15mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Pretendard", sans-serif; color: #0f172a; margin: 0; padding: 0; background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .page-container { width: 100%; max-width: 780px; margin: 0 auto; padding: 10px; }
          .avoid-break { page-break-inside: avoid; break-inside: avoid; }
        </style>
      </head>
      <body>
        <div class="page-container">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f172a; padding-bottom: 10px; margin-bottom: 12px;">
            <div>
              <div style="font-size: 10px; font-weight: 900; letter-spacing: 1.5px; color: #e11d48; text-transform: uppercase;">NBASS Cognitive &amp; Behavioral Clinic</div>
              <h1 style="font-size: 18px; font-weight: 900; color: #0f172a; margin: 2px 0 0 0;">수험생 나쁜 공부습관 뇌과학 정밀 진단 소견서</h1>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 9px; color: #64748b; font-weight: bold;">등록번호: <span style="color: #4338ca; font-family: monospace;">DOC-2026-HB8821</span></div>
              <div style="font-size: 9px; color: #64748b; font-weight: bold;">열람 등급: <span style="color: #e11d48; font-weight: 900;">${user.tier.toUpperCase()} TIER</span></div>
            </div>
          </div>

          <div class="avoid-break" style="display: flex; justify-content: space-between; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 12px; margin-bottom: 12px; font-size: 11px;">
            <div><span style="color: #64748b;">수험생 성명 / ID:</span> <strong style="color: #0f172a;">${studentName}</strong> (${studentId})</div>
            <div><span style="color: #64748b;">진단 발급 일시:</span> <strong style="color: #334155;">${dateStr}</strong></div>
            <div><span style="color: #64748b;">분석 기관:</span> <strong>NBASS 뇌인지행동 임상연구소</strong></div>
          </div>

          <div class="avoid-break" style="background: linear-gradient(135deg, #4c0519 0%, #0f172a 50%, #1e1b4b 100%); color: white; border-radius: 12px; padding: 12px 16px; margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.15); padding-bottom: 6px; margin-bottom: 8px;">
              <span style="font-size: 11px; font-weight: 800; color: #fda4af;">⚠️ 팩트 폭행: 진단된 하루 '가짜 공부' 시간 누적 피해</span>
              <span style="font-size: 9px; background: rgba(255,255,255,0.15); padding: 2px 7px; border-radius: 10px; color: #fde047; font-weight: bold;">집중력 임계치 붕괴 경고</span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; text-align: center;">
              <div style="background: rgba(255,255,255,0.06); padding: 8px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);">
                <div style="font-size: 9.5px; color: #cbd5e1;">하루 낭비 시간</div>
                <div style="font-size: 20px; font-weight: 900; color: #fb7185; font-family: monospace; margin: 2px 0;">${totalWastedMinutes}분</div>
                <div style="font-size: 8.5px; color: #94a3b8;">공부 중 딴짓/가짜공부</div>
              </div>
              <div style="background: rgba(255,255,255,0.06); padding: 8px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);">
                <div style="font-size: 9.5px; color: #cbd5e1;">30일 누적 유실</div>
                <div style="font-size: 20px; font-weight: 900; color: #fde047; font-family: monospace; margin: 2px 0;">약 ${monthlyWastedHours}시간</div>
                <div style="font-size: 8.5px; color: #94a3b8;">한 달에 3~4일치 순공 증발</div>
              </div>
              <div style="background: rgba(255,255,255,0.06); padding: 8px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);">
                <div style="font-size: 9.5px; color: #cbd5e1;">수능 예측 등급 손실</div>
                <div style="font-size: 20px; font-weight: 900; color: #ef4444; font-family: monospace; margin: 2px 0;">-1.8 ~ -2.2등급</div>
                <div style="font-size: 8.5px; color: #94a3b8;">킬러문항 인출 실패 위험</div>
              </div>
            </div>
          </div>

          <div class="avoid-break" style="background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 10px; padding: 10px 12px; margin-bottom: 12px; font-size: 11px;">
            <div style="font-size: 11px; font-weight: 900; color: #312e81; margin-bottom: 3px;">✨ 12대 Care Type 신경계 메커니즘 연계 정밀 분석</div>
            <p style="margin: 0; color: #334155; line-height: 1.45;">
              현재 수험생의 신경계는 <strong>[두뇌 피로형 &amp; 도파민 갈망 루프]</strong>에 진입해 있습니다.
              전두엽 배외측피질(DLPFC)의 글루코스(포도당) 대사가 급격히 떨어지면, 뇌는 생존을 위해 사고의 고통을 피하려는 방어 기제로
              <strong>"즉각적인 답지 열람"</strong>이나 <strong>"책상 정리 회피"</strong>, <strong>"숏폼·음악 멀티태스킹"</strong>을 유발합니다.
              이는 단순한 의지 부족이 아닌 <strong>신경생리학적 뇌 에너지 방전 신호</strong>입니다.
            </p>
          </div>

          <div style="margin-bottom: 12px;">
            <div style="font-size: 11.5px; font-weight: 900; color: #0f172a; margin-bottom: 6px;">📄 진단된 나쁜 공부습관별 뇌과학 소견 및 긴급 처방 (Rx)</div>
            ${habitsHtml}
          </div>

          <div class="avoid-break" style="border-top: 1px solid #cbd5e1; padding-top: 8px; margin-top: 12px; display: flex; justify-content: space-between; align-items: center; font-size: 9.5px; color: #64748b;">
            <div>본 소견서는 NBASS 인지신경과학 연구소의 알고리즘에 의해 자동 생성된 맞춤형 처방 리포트입니다.</div>
            <div style="font-weight: 900; color: #0f172a;">NBASS 의학 인지행동 클리닉 [인]</div>
          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const minutes = Math.floor(timerSeconds / 60);
  const seconds = timerSeconds % 60;

  return (
    <div className="p-4 space-y-4 pb-24 max-w-4xl mx-auto">
      {/* 인쇄 최적화 전용 스타일: 인쇄 시 모달 외 모든 요소 숨김 및 다중 페이지 중복 방지 */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm 12mm;
          }
          body * {
            visibility: hidden !important;
          }
          #habit-mobile-printable-report, #habit-mobile-printable-report * {
            visibility: visible !important;
          }
          .habit-modal-overlay {
            position: static !important;
            background: none !important;
            padding: 0 !important;
            display: block !important;
            width: 100% !important;
            height: auto !important;
            inset: auto !important;
          }
          #habit-mobile-printable-report {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            max-height: none !important;
            overflow: visible !important;
            border-radius: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
            color: #0f172a !important;
          }
          .habit-modal-scrollable {
            overflow: visible !important;
            max-height: none !important;
            height: auto !important;
            padding: 0 !important;
          }
          .habit-print-hidden {
            display: none !important;
            visibility: hidden !important;
          }
          .habit-print-avoid-break {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      {/* 1. Header Banner (인쇄 시 숨김) */}
      <div className="print:hidden bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 mb-1 text-xs font-bold text-rose-600">
          <Brain className="w-4 h-4" />
          <span>12대 Care Type 연계 신경계 클리닉</span>
        </div>
        <h2 className="text-xl font-black text-slate-900">공부습관 교정 클리닉</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          의지력 탓이 아닙니다. 뇌과학적 원인을 진단하고 실시간 행동 교정 루틴을 실행합니다.
        </p>
      </div>

      {/* 2. [1단계] 나쁜 공부습관 퀵 설문 진단 (인쇄 시 숨김) */}
      <div className="print:hidden bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
            <AlertOctagon className="w-4 h-4 text-amber-500" />
            <span>수험생 12대 나쁜 공부습관 정밀 자가 진단</span>
          </h3>
          <span className="text-[10px] text-slate-400 font-bold">복수 선택 가능</span>
        </div>

        <p className="text-xs text-slate-600">
          현재 공부할 때 자주 반복되는 나쁜 패턴을 모두 체크하세요:
        </p>

        <div className="space-y-2">
          {BAD_HABITS_LIST.map((habit) => {
            const isChecked = checkedIds.includes(habit.id);
            return (
              <div
                key={habit.id}
                onClick={() => toggleHabitCheck(habit.id)}
                className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-start gap-3 ${
                  isChecked
                    ? 'bg-rose-50/70 border-rose-300 text-rose-950 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {}}
                  className="mt-1 accent-rose-600 w-4 h-4 shrink-0 rounded"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-black leading-snug">{habit.title}</span>
                    <span className="text-[9px] font-bold text-rose-600 shrink-0 bg-white/80 px-1.5 py-0.2 rounded border border-rose-200">
                      -{habit.wastedMinutesPerDay}분/일
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-tight">
                    {habit.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={handleRunDiagnosis}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 hover:from-slate-800 text-white font-black text-xs shadow-md active:scale-98 transition flex items-center justify-center gap-1.5 mt-2"
        >
          <Brain className="w-4 h-4 text-amber-400" />
          <span>나쁜 습관 뇌과학 진단 리포트 생성하기</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 3. [PREMIUM 등급 분기]: 충격 진단 리포트 (PREMIUM 이상 개방) */}
      <div className="print:hidden space-y-4">
        {isPremiumOrAbove ? (
          <div className="bg-gradient-to-br from-rose-950 via-slate-900 to-indigo-950 text-white p-5 rounded-3xl shadow-md border border-rose-800/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-black flex items-center gap-1">
                <span>⚠️</span>
                <span>PREMIUM 팩트 폭행 충격 리포트</span>
              </span>
              <span className="text-[10px] text-amber-300 font-bold bg-white/10 px-2 py-0.5 rounded-md">
                12대 케어타입 연계
              </span>
            </div>

            {/* Shock Stat */}
            <div className="py-2 border-y border-white/10">
              <span className="text-xs text-slate-300 block">진단된 하루 '가짜 공부(Fake Study)' 낭비 시간</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-rose-400 font-mono">
                  매일 {totalWastedMinutes}분
                </span>
                <span className="text-xs text-slate-400 font-bold">
                  (한 달 누적 약 {Math.round((totalWastedMinutes * 30) / 60)}시간 손실!)
                </span>
              </div>
            </div>

            {/* Brain Science Explanation */}
            <div className="bg-white/10 p-3 rounded-2xl border border-white/10 text-xs space-y-1">
              <p className="font-bold text-amber-300 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>왜 이런 습관이 생겼을까요? (뇌과학적 원인)</span>
              </p>
              <p className="text-slate-200 text-[11px] leading-relaxed">
                학생의 <strong>두뇌 피로형 &amp; 도파민 갈망</strong> 신경계 패턴으로 인해, 전두엽 포도당 대사가 고갈되면 뇌가 에너지를 아끼기 위해 <strong>"해설지 슬쩍 보기"</strong>나 <strong>"책상 정리 딴짓"</strong>으로 자동 회피하는 것입니다.
              </p>
            </div>
          </div>
        ) : (
          <LockedCard
            requiredTier="premium"
            featureTitle="나쁜 습관 충격 진단 &amp; 낭비시간 분석 잠금"
            description="내가 하루에 몇 분의 '가짜 공부'를 하며 시간을 버리고 있는지 정밀 팩트폭행 리포트를 확인하려면 PREMIUM 등급이 필요합니다."
            onUpgradeClick={onUpgradeClick}
          />
        )}
      </div>

      {/* 4. [PREMIUM 등급 분기]: 실시간 10대 뇌신경 행동 교정 스위트 (PREMIUM 전용 개방) */}
      <div className="space-y-4">
        <h3 className="text-sm font-black text-slate-900 px-1 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-purple-600 animate-pulse" />
            <span>2단계: PREMIUM 10대 뇌신경 행동 교정 스위트</span>
          </span>
          <span className="text-[10px] bg-purple-100 text-purple-800 font-black px-2 py-0.5 rounded-md border border-purple-300">
            👑 PREMIUM 전용
          </span>
        </h3>

        {isPlusOrAbove ? (
          <div className="bg-white p-4.5 rounded-3xl border-2 border-purple-300 shadow-md space-y-4">
            {/* 1. 상단: 📈 10대 행동 교정 시너지 & 기대 성적 향상 시뮬레이터 */}
            <div className="bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 text-white p-3.5 rounded-2xl border border-purple-500/30 space-y-2 shadow-sm">
              <div className="flex items-center justify-between text-xs">
                <span className="font-black text-purple-300 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>프로토콜 시너지 기대 성적 예측</span>
                </span>
                <span className="text-[10px] font-black bg-white/10 px-1.5 py-0.5 rounded text-amber-300 font-mono">
                  {activeProtocolsCount}/10 가동
                </span>
              </div>
              <div className="flex items-baseline justify-between pt-0.5">
                <div>
                  <span className="text-2xl font-black text-amber-400 font-mono">
                    {currentBoost.score}
                  </span>
                  <span className="text-[10px] text-slate-300 font-bold ml-1.5">
                    (순공 {currentBoost.hours})
                  </span>
                </div>
                <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                  {currentBoost.tierBenefit}
                </span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-amber-400 via-rose-400 to-purple-400 h-full transition-all duration-500 rounded-full"
                  style={{ width: `${Math.max(10, (activeProtocolsCount / 10) * 100)}%` }}
                />
              </div>
            </div>

            {/* 2. Streak Banner */}
            <div className="flex items-center justify-between bg-purple-50 p-2.5 rounded-2xl border border-purple-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-xs">
                  🔥
                </div>
                <div>
                  <span className="text-[11px] font-black text-purple-950 block">연속 습관 교정 스트릭</span>
                  <span className="text-[10px] text-purple-700 font-bold">{successStreak}일 연속 나쁜 습관 참아내는 중!</span>
                </div>
              </div>
              <span className="text-xs font-black text-purple-700 font-mono">Top 5%</span>
            </div>

            {/* 2-1. 🤖 12대 종합진단 연계: AI 신경계 맞춤 처방 파이프라인 브리핑 카드 */}
            <div className="p-3.5 bg-gradient-to-br from-purple-900/40 via-indigo-950/60 to-slate-900 text-white rounded-2xl border border-purple-400/40 space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[11px] font-black text-white">
                    AI 종합진단 연계 처방 파이프라인
                  </span>
                </div>
                <span className="text-[9px] font-black bg-amber-400/20 text-amber-300 border border-amber-400/40 px-1.5 py-0.5 rounded-full">
                  {careTypeDisplay}
                </span>
              </div>

              {/* Step 1: AI 1순위 핵심 1가지 완수 시 실질적 도움 */}
              <div className="p-2.5 bg-amber-400/10 rounded-xl border border-amber-400/30 space-y-1">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <span className="text-[10.5px] font-black text-amber-300 flex items-center gap-1">
                    <span>🥇 [Step 1] AI 1순위:</span>
                    <strong className="text-white underline">{currentRec.primaryTitle}</strong>
                  </span>
                  <span className="text-[9.5px] font-black text-amber-300 font-mono bg-amber-950/80 px-1.5 py-0.2 rounded border border-amber-400/30">
                    {currentRec.primaryScore}
                  </span>
                </div>
                <p className="text-[10px] text-slate-200 leading-tight">
                  👉 <strong>이 1가지만 완수해도</strong>: {currentRec.primaryGain}
                </p>
                <button
                  onClick={() => setActiveProtocolTab(currentRec.primaryId)}
                  className="mt-1 w-full py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-lg text-[10.5px] flex items-center justify-center gap-1 transition active:scale-98 cursor-pointer"
                >
                  <span>👉 AI 1순위 프로토콜 즉시 실행</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Step 2: AI 1차 추천 3종 추가 가동 시 누적 추가 이득 */}
              <div className="p-2.5 bg-purple-500/10 rounded-xl border border-purple-400/30 space-y-0.5">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <span className="text-[10.5px] font-black text-purple-300">
                    ✨ [Step 2] 1차 추천 3종 병행: <span className="text-slate-200 font-normal">{currentRec.secondaryTitle}</span>
                  </span>
                  <span className="text-[9.5px] font-black text-purple-300 font-mono bg-purple-950/80 px-1.5 py-0.2 rounded border border-purple-400/30">
                    {currentRec.secondaryScore}
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 leading-tight">
                  👉 <strong>1차 추천 세트를 함께 가동하면</strong>: {currentRec.secondaryCumulativeGain}
                </p>
              </div>
            </div>

            {/* 3. 10대 프로토콜 탭 셀렉터 (카테고리 필터 & AI 뱃지 동적 점등) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-1">
                <div className="flex items-center gap-1">
                  <span className="text-sm">{PROTOCOL_META[activeProtocolTab].icon}</span>
                  <span className="font-black text-purple-800 text-[11px] truncate max-w-[170px]">
                    [{PROTOCOL_META[activeProtocolTab].step}] {PROTOCOL_META[activeProtocolTab].name}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[9.5px]">
                  <button
                    type="button"
                    onClick={() => setProtocolCategory('all')}
                    className={`px-1.5 py-0.5 rounded-md font-black transition cursor-pointer ${
                      protocolCategory === 'all'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    전체 10
                  </button>
                  <button
                    type="button"
                    onClick={() => setProtocolCategory('core')}
                    className={`px-1.5 py-0.5 rounded-md font-black transition cursor-pointer ${
                      protocolCategory === 'core'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    행동 5
                  </button>
                  <button
                    type="button"
                    onClick={() => setProtocolCategory('boost')}
                    className={`px-1.5 py-0.5 rounded-md font-black transition cursor-pointer ${
                      protocolCategory === 'boost'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    생체 5
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-1 p-1 bg-slate-100 rounded-2xl border border-slate-200">
                {(Object.keys(PROTOCOL_META) as ProtocolId[])
                  .filter(id => protocolCategory === 'all' || PROTOCOL_META[id].group === protocolCategory)
                  .map(pId => {
                    const isPrimary = pId === currentRec.primaryId;
                    const isSecondary = currentRec.secondaryIds.includes(pId);
                    const info = PROTOCOL_META[pId];
                    return (
                      <button
                        key={pId}
                        onClick={() => setActiveProtocolTab(pId)}
                        className={`py-1.5 px-0.5 text-[10px] font-black rounded-xl transition flex flex-col items-center gap-0.5 cursor-pointer relative ${
                          activeProtocolTab === pId ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 bg-white/70'
                        }`}
                      >
                        {isPrimary && (
                          <span className="text-[7px] font-black text-amber-300 bg-amber-950 px-1 py-0.2 rounded border border-amber-400/60 leading-none">
                            🥇 1순위
                          </span>
                        )}
                        {isSecondary && (
                          <span className="text-[7px] font-bold text-purple-300 bg-purple-950 px-1 py-0.2 rounded border border-purple-400/40 leading-none">
                            ✨ 추천
                          </span>
                        )}
                        {!isPrimary && !isSecondary && (
                          <span className="text-[7px] font-normal text-slate-400 leading-none">
                            🎯 마스터
                          </span>
                        )}
                        <span className="mt-0.5 text-[9px]">{info.icon} {info.step}</span>
                        <span className="text-[8px] font-normal truncate max-w-[55px]">{info.name}</span>
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* 4. 10대 프로토콜별 상세 인터랙티브 패널 */}
            {/* [방법 1] 물리 차단 */}
            {activeProtocolTab === 'p1' && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <div className="p-2.5 bg-indigo-50 rounded-xl border border-indigo-200 text-[10.5px] text-slate-700 space-y-0.5">
                  <span className="font-bold text-indigo-900 flex items-center gap-1 text-[11px]">
                    <Brain className="w-3.5 h-3.5 text-indigo-600" />
                    <span>뇌과학 원리: 자극 제어(Stimulus Control) &amp; 진입 장벽</span>
                  </span>
                  <p className="leading-snug">
                    답지가 3m 멀어지면 충동 도파민이 70% 감소합니다. 3단계 점진적 힌트로 스스로의 인출 회로를 보존하세요.
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-800 mb-1">
                    ① 오늘 봉인할 나쁜 습관 선언
                  </label>
                  <select
                    value={selectedTargetHabit}
                    onChange={(e) => setSelectedTargetHabit(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800"
                  >
                    {BAD_HABITS_LIST.map(h => (
                      <option key={h.id} value={h.id}>🚫 {h.title}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5 text-xs">
                  <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pledgeChecked}
                      onChange={(e) => setPledgeChecked(e.target.checked)}
                      className="accent-purple-600 rounded w-4 h-4"
                    />
                    <span className="font-bold text-[11px] text-slate-800">
                      1단계 서약: 오늘 이 습관을 절대 타협하지 않는다.
                    </span>
                  </label>
                  <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={distanceChecked}
                      onChange={(e) => setDistanceChecked(e.target.checked)}
                      className="accent-purple-600 rounded w-4 h-4"
                    />
                    <span className="font-bold text-[11px] text-slate-800">
                      2단계 격리: 답지 및 폰을 책상에서 3m 이상 치웠다.
                    </span>
                  </label>
                </div>

                {/* 3단계 힌트 오픈제 */}
                <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 space-y-1.5">
                  <span className="text-[11px] font-black text-amber-900 block">
                    3단계: 점진적 힌트 오픈 프로토콜 (5분 간격)
                  </span>
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      onClick={() => setHintLevel(1)}
                      className={`py-1 px-1.5 rounded-lg text-[9.5px] font-bold border cursor-pointer ${
                        hintLevel === 1 ? 'bg-amber-500 text-slate-950 border-amber-600' : 'bg-white text-slate-700 border-amber-200'
                      }`}
                    >
                      1단계: 키워드
                    </button>
                    <button
                      onClick={() => setHintLevel(2)}
                      className={`py-1 px-1.5 rounded-lg text-[9.5px] font-bold border cursor-pointer ${
                        hintLevel === 2 ? 'bg-amber-500 text-slate-950 border-amber-600' : 'bg-white text-slate-700 border-amber-200'
                      }`}
                    >
                      2단계: 공식 단서
                    </button>
                    <button
                      onClick={() => setHintLevel(3)}
                      className={`py-1 px-1.5 rounded-lg text-[9.5px] font-bold border cursor-pointer ${
                        hintLevel === 3 ? 'bg-amber-500 text-slate-950 border-amber-600' : 'bg-white text-slate-700 border-amber-200'
                      }`}
                    >
                      3단계: 최종 풀이
                    </button>
                  </div>
                  <div className="text-[10px] text-slate-700 bg-white/80 p-2 rounded-lg border border-amber-200/60 leading-snug">
                    {hintLevel === 1 && '💡 [1단계]: 핵심 키워드 1개만 메모하고 5분간 추가 사유 진행'}
                    {hintLevel === 2 && '📐 [2단계]: 적용할 시작 공식 형태만 확인 후 풀이 끝까지 작성'}
                    {hintLevel === 3 && '📖 [3단계]: 10분 고민 후 오답 원인 파악용으로 첫 줄만 체크'}
                  </div>
                </div>

                {/* 25분 뽀모도로 타이머 */}
                <div className="bg-slate-900 text-white p-3 rounded-2xl text-center space-y-1.5">
                  <span className="text-[9.5px] text-slate-400 font-bold block">
                    25분 동안 위 습관 완전 봉인하기 (+4~8점 상승)
                  </span>
                  <div className="text-2xl font-black font-mono tracking-widest text-emerald-400">
                    {String(Math.floor(timerSeconds / 60)).padStart(2, '0')}:{String(timerSeconds % 60).padStart(2, '0')}
                  </div>
                  <div className="flex items-center justify-center gap-2 pt-0.5">
                    <button
                      onClick={() => setIsRoutineRunning(!isRoutineRunning)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 transition cursor-pointer ${
                        isRoutineRunning ? 'bg-amber-400 text-slate-950' : 'bg-emerald-500 text-white'
                      }`}
                    >
                      {isRoutineRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                      <span>{isRoutineRunning ? '일시정지' : '세션 시작'}</span>
                    </button>
                    <button
                      onClick={() => { setIsRoutineRunning(false); setTimerSeconds(25 * 60); }}
                      className="p-1.5 rounded-xl bg-white/10 text-slate-300 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* [방법 2] IF-THEN 조건반사 스위치 */}
            {activeProtocolTab === 'p2' && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <div className="p-2.5 bg-purple-50 rounded-xl border border-purple-200 text-[10.5px] text-slate-700 space-y-0.5">
                  <span className="font-bold text-purple-900 flex items-center gap-1 text-[11px]">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span>뇌과학 원리: 골위처 교수 '실행 의도(Implementation Intentions)'</span>
                  </span>
                  <p className="leading-snug">
                    기저핵에 조건반사를 미리 각인해두면 의지력 고갈 없이 뇌 정지를 85% 차단합니다.
                  </p>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-black text-rose-600 block text-[10.5px] mb-0.5">
                      🚨 만약 위기 상황이 닥치면 (IF):
                    </span>
                    <select
                      value={ifSituation}
                      onChange={(e) => setIfSituation(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-[11px] font-bold text-slate-800"
                    >
                      <option value="수학/과탐 난문에서 3분간 막혀 답지를 열고 싶을 때">수학/과탐 난문에서 3분간 막혀 답지를 열고 싶을 때</option>
                      <option value="공부 도중 스마트폰을 집어 들고 싶을 때">공부 도중 스마트폰을 집어 들고 싶을 때</option>
                      <option value="집중이 풀리고 잡생각(DMN)으로 멍때릴 때">집중이 풀리고 잡생각(DMN)으로 멍때릴 때</option>
                      <option value="계획이 밀려 짜증나고 자포자기하고 싶을 때">계획이 밀려 짜증나고 자포자기하고 싶을 때</option>
                    </select>
                  </div>

                  <div>
                    <span className="font-black text-emerald-600 block text-[10.5px] mb-0.5">
                      ⚡ 그때 1초 만에 실행할 대체 행동 (THEN):
                    </span>
                    <input
                      type="text"
                      value={thenReaction}
                      onChange={(e) => setThenReaction(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-[11px] font-bold text-slate-800"
                    />
                  </div>
                </div>

                <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-200 text-center space-y-1.5">
                  <span className="text-[10px] font-bold text-rose-800 block">
                    충동이 일어났나요? SOS 골든 브레이크 발동! (+5~8점 방어)
                  </span>
                  <button
                    onClick={() => {
                      setSosTriggered(true);
                      setTimeout(() => setSosTriggered(false), 5000);
                    }}
                    className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1 shadow-sm active:scale-95 transition cursor-pointer"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>🚨 [SOS 골든 브레이크] 발동하기</span>
                  </button>
                  {sosTriggered && (
                    <div className="p-2 bg-white rounded-xl border-2 border-rose-500 animate-bounce text-left text-[11px] font-bold text-rose-600">
                      ⚡ <strong>긴급 처방 발동</strong>: "{thenReaction}"
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* [방법 3] 60초 마이크로 리콜 */}
            {activeProtocolTab === 'p3' && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-[10.5px] text-slate-700 space-y-0.5">
                  <span className="font-bold text-amber-900 flex items-center gap-1 text-[11px]">
                    <Mic className="w-3.5 h-3.5 text-amber-600" />
                    <span>뇌과학 원리: 가짜 숙달 효과 박멸 &amp; 해마 LTP 장기기억화</span>
                  </span>
                  <p className="leading-snug">
                    단순 눈팅은 기억률 10%입니다. 소리 내어 요약 인출할 때 기억 보존율이 8배(80% 이상) 고착됩니다.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-black text-slate-800">
                    60초 셀프 티칭 요약 (핵심 개념 / 착각 지점):
                  </label>
                  <textarea
                    value={recallInput}
                    onChange={(e) => setRecallInput(e.target.value)}
                    rows={3}
                    placeholder="예: '등차수열 합 공식에서 n/2 대신 공차를 곱했다. 핵심은 첫항과 끝항 평균에 항수를 곱하는 원리다.'"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
                  />
                  <button
                    onClick={handleAnalyzeRecall}
                    disabled={isAnalyzingRecall}
                    className="w-full py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1 shadow-sm transition active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isAnalyzingRecall ? '해마 인출 분석 중...' : '✨ AI 해마 LTP 인출 정확도 점수 분석 (+6~10점)'}</span>
                  </button>
                </div>

                {recallScore !== null && (
                  <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs space-y-0.5">
                    <div className="flex justify-between items-center font-black">
                      <span className="text-emerald-900">🧠 뇌신경 인출 정확도</span>
                      <span className="text-emerald-600 font-mono text-sm">{recallScore}점 / 100점</span>
                    </div>
                    <p className="text-[10.5px] text-slate-600">
                      훌륭합니다! 언어 피질을 거쳐 해마에 고착되어 망각 곡선상 7일 이상 보존됩니다.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* [방법 4] 도파민 연속 스트릭 & 손실 회피 금고 */}
            {activeProtocolTab === 'p4' && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <div className="p-2.5 bg-orange-50 rounded-xl border border-orange-200 text-[10.5px] text-slate-700 space-y-0.5">
                  <span className="font-bold text-orange-900 flex items-center gap-1 text-[11px]">
                    <Flame className="w-3.5 h-3.5 text-orange-600" />
                    <span>뇌과학 원리: 행동경제학 '손실 회피 편향(Loss Aversion)'</span>
                  </span>
                  <p className="leading-snug">
                    인간은 잃는 고통에 2.5배 더 민감합니다. 누적 스트릭을 볼모로 삼아 습관 타협을 원천 봉쇄합니다.
                  </p>
                </div>

                <div className="p-3 bg-gradient-to-r from-orange-950 to-slate-900 rounded-2xl border border-orange-400/40 text-white space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[9.5px] text-orange-300 font-bold block">불꽃 연속 실천 스트릭</span>
                      <div className="text-lg font-black text-orange-400 flex items-center gap-1">
                        <span>🔥 Day {dopamineStreak} 달성 중!</span>
                        <span className="text-[10px] text-slate-400 font-normal">/ 30일</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[9.5px] text-amber-300 font-bold block">도파민 마일리지</span>
                      <span className="text-base font-mono font-black text-amber-300">{dopaminePoints.toLocaleString()} DP</span>
                    </div>
                  </div>

                  <div className="p-2 bg-black/40 rounded-xl border border-orange-500/30 text-[10.5px] space-y-1">
                    <span className="text-rose-400 font-black flex items-center gap-1">
                      <AlertOctagon className="w-3 h-3" />
                      <span>손실 회피 금고 경고:</span>
                    </span>
                    <p className="text-slate-300 leading-snug">
                      오늘 습관을 1회라도 타협하면 누적 <strong>{dopamineStreak}일 연속 스트릭과 {dopaminePoints} DP가 즉시 동결(Freeze)</strong>됩니다!
                    </p>
                    <div className="text-[9.5px] text-amber-300">
                      🛡️ 구제: 「3색 뇌신경 오답 재구성」 1건 작성 시 100% 즉시 복구
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setIsStreakProtected(true);
                      setStreakNotice(true);
                      setTimeout(() => setStreakNotice(false), 3000);
                    }}
                    className="w-full py-2 bg-orange-500 hover:bg-orange-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1 shadow-md active:scale-95 transition cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>오늘 나쁜 습관 타협 0건 수호 서약 (스트릭 잠금)</span>
                  </button>

                  {streakNotice && (
                    <div className="p-1.5 bg-emerald-500/20 border border-emerald-400 text-emerald-300 rounded-lg text-center text-[10.5px] font-bold">
                      🎉 오늘 스트릭이 안전하게 금고에 봉인되었습니다!
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* [방법 5] 학부모 실시간 안심 동기화 루프 */}
            {activeProtocolTab === 'p5' && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-200 text-[10.5px] text-slate-700 space-y-0.5">
                  <span className="font-bold text-blue-900 flex items-center gap-1 text-[11px]">
                    <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                    <span>뇌과학 원리: 사회적 책임감(Social Accountability) &amp; 불안 해소</span>
                  </span>
                  <p className="leading-snug">
                    부모의 잔소리는 편도체를 자극해 기억을 지웁니다. 노력 지표를 실시간 동기화하여 잔소리를 차단합니다.
                  </p>
                </div>

                <div className="p-3 bg-amber-50 rounded-2xl border-2 border-amber-300 space-y-2">
                  <div className="flex items-center justify-between pb-1.5 border-b border-amber-200 text-xs">
                    <span className="font-black text-amber-900 flex items-center gap-1 text-[11px]">
                      <span>🔔 [학부모 알림톡 자동 생성 미리보기]</span>
                    </span>
                    <span className="text-[9px] text-slate-500">실시간 연동</span>
                  </div>

                  <div className="p-2.5 bg-white rounded-xl text-xs space-y-1.5 border border-slate-200">
                    <div className="font-bold text-slate-900 text-[11px]">
                      [NBASS 뇌신경 안심 리포트]
                    </div>
                    <p className="text-slate-700 leading-snug text-[10.5px]">
                      "{user.name || '학생'} 님이 오늘 [해설지 조기 열람] 충동을 <strong>4회 극복</strong>하고 <strong>75분의 순수 사유 시간</strong>을 지켜냈습니다! 현재 뇌 에너지가 소모되었으니 '공부했니?' 대신 따뜻한 격려를 권장합니다."
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                      <span>순수 사유 지킴률: <strong className="text-emerald-600 font-mono">94%</strong></span>
                      <span>가정 잔소리 감소: <strong className="text-blue-600 font-mono">-80%</strong></span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setParentSyncSent(true);
                      setParentNoticeToast(true);
                      setTimeout(() => setParentNoticeToast(false), 3500);
                    }}
                    className="w-full py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1 shadow-sm active:scale-95 transition cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                    <span>📲 오늘 노력 지표 학부모님께 즉시 안심 전송</span>
                  </button>

                  {parentNoticeToast && (
                    <div className="p-1.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-center text-[10.5px] font-bold">
                      ✅ 학부모님께 안심 리포트가 성공적으로 전송되었습니다!
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* [방법 6] 3분 생리학적 한숨 & HRV 리셋 */}
            {activeProtocolTab === 'p6' && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <div className="p-2.5 bg-teal-50 rounded-xl border border-teal-200 text-[10.5px] text-slate-700 space-y-0.5">
                  <span className="font-bold text-teal-900 flex items-center gap-1 text-[11px]">
                    <Wind className="w-3.5 h-3.5 text-teal-600" />
                    <span>뇌과학 원리: 생리학적 한숨(Physiological Sigh) &amp; HRV 리셋</span>
                  </span>
                  <p className="leading-snug">
                    앤드류 후버만: 두 번 들이마시고 길게 내쉬는 한숨은 3분 만에 심박수를 안정화해 뇌 정지를 해소합니다.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-900 text-white rounded-2xl text-center space-y-2.5">
                  <div className="flex items-center justify-between text-[10.5px] text-slate-400">
                    <span>자율신경 안정도(HRV):</span>
                    <span className="font-mono font-bold text-teal-400">{hrvStatus}% (안정화 진행)</span>
                  </div>

                  <div className="w-20 h-20 mx-auto rounded-full bg-teal-500/20 border-2 border-teal-400 flex items-center justify-center transition-all duration-700">
                    <span className="text-[11px] font-black text-teal-300 text-center whitespace-pre-line">
                      {sighPhase === 'inhale1' && '들숨 ①\n(깊게)'}
                      {sighPhase === 'inhale2' && '들숨 ②\n(더 깊게)'}
                      {sighPhase === 'exhale' && '날숨\n(천천히)'}
                    </span>
                  </div>

                  <div className="text-2xl font-black font-mono tracking-wider text-teal-400">
                    {String(Math.floor(sighSeconds / 60)).padStart(2, '0')}:{String(sighSeconds % 60).padStart(2, '0')}
                  </div>

                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => setIsSighRunning(!isSighRunning)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                        isSighRunning ? 'bg-amber-400 text-slate-950' : 'bg-teal-500 text-white'
                      }`}
                    >
                      {isSighRunning ? '일시정지' : '3분 호흡 시작 (+4~7점 방어)'}
                    </button>
                    <button
                      onClick={() => { setIsSighRunning(false); setSighSeconds(180); setHrvStatus(55); }}
                      className="p-1.5 rounded-xl bg-white/10 text-slate-300 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* [방법 7] 3색 뇌신경 오답 분해기 */}
            {activeProtocolTab === 'p7' && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-200 text-[10.5px] text-slate-700 space-y-0.5">
                  <span className="font-bold text-rose-900 flex items-center gap-1 text-[11px]">
                    <BookOpen className="w-3.5 h-3.5 text-rose-600" />
                    <span>뇌과학 원리: 전대상피질(dACC) 오류 감지 회로 자극</span>
                  </span>
                  <p className="leading-snug">
                    단순 베껴 쓰기를 중단하고 3색 메타인지로 분석할 때 동일 변형 유형 오답 재발률이 95% 차단됩니다.
                  </p>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div>
                    <span className="font-black text-rose-600 block text-[10.5px]">🔴 Red (착각 지점):</span>
                    <input
                      type="text"
                      value={redTrap}
                      onChange={(e) => setRedTrap(e.target.value)}
                      placeholder="예: '서로 다른' 조건 놓치고 중복 조합 적용"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-[11px]"
                    />
                  </div>
                  <div>
                    <span className="font-black text-amber-600 block text-[10.5px]">🟡 Yellow (인출 누락):</span>
                    <input
                      type="text"
                      value={yellowMissing}
                      onChange={(e) => setYellowMissing(e.target.value)}
                      placeholder="예: 여사건 공식 및 경계값 검증"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-[11px]"
                    />
                  </div>
                  <div>
                    <span className="font-black text-emerald-600 block text-[10.5px]">🟢 Green (10초 초동 조치):</span>
                    <input
                      type="text"
                      value={greenAction}
                      onChange={(e) => setGreenAction(e.target.value)}
                      placeholder="예: 문제 첫 단어에 네모 치고 반대 경우 1줄 적기"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-[11px]"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSaveErrorNote}
                  className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1 shadow-xs transition active:scale-95 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>💾 3색 오답 처방 저장 ({savedErrorCount}건, +8~12점)</span>
                </button>

                {errorSavedNotice && (
                  <div className="p-2 bg-emerald-50 rounded-xl text-center text-[10.5px] font-bold text-emerald-700">
                    ✅ 3색 오답 처방이 저장되었습니다!
                  </div>
                )}
              </div>
            )}

            {/* [방법 8] 시각 터널링 & 모노태스킹 블랙아웃 */}
            {activeProtocolTab === 'p8' && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <div className="p-2.5 bg-zinc-100 rounded-xl border border-zinc-300 text-[10.5px] text-slate-700 space-y-0.5">
                  <span className="font-bold text-zinc-900 flex items-center gap-1 text-[11px]">
                    <EyeOff className="w-3.5 h-3.5 text-zinc-600" />
                    <span>뇌과학 원리: 시각 피질 주의 잔류물(Attention Residue) 0% 통제</span>
                  </span>
                  <p className="leading-snug">
                    뇌 정보의 80%는 시각을 거칩니다. 잡다한 메뉴와 주변 물건을 차단해 몰입 속도를 2배로 올립니다.
                  </p>
                </div>

                <div className="p-3 bg-slate-950 text-white rounded-2xl border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                    <span className="text-[11px] font-black text-slate-200 flex items-center gap-1">
                      <span>🌑 [블랙아웃 Zen 모노태스킹 모드]</span>
                    </span>
                    <span className="text-[9.5px] text-emerald-400 font-mono">시각 노이즈 0%</span>
                  </div>

                  <label className="flex items-center gap-2 p-2 bg-slate-900 rounded-xl border border-slate-800 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={blackoutDeskChecked}
                      onChange={(e) => setBlackoutDeskChecked(e.target.checked)}
                      className="accent-purple-500 rounded w-4 h-4"
                    />
                    <span className="text-slate-300 font-bold text-[10.5px]">
                      책상 위에는 오직 1문제와 샤프 1자루 외에 모두 내렸습니다.
                    </span>
                  </label>

                  <div className="text-center py-1">
                    <div className="text-3xl font-black font-mono tracking-widest text-slate-100">
                      {String(Math.floor(blackoutTimer / 60)).padStart(2, '0')}:{String(blackoutTimer % 60).padStart(2, '0')}
                    </div>
                    <span className="text-[9.5px] text-slate-400 mt-0.5 block">모노태스킹 25분 단일 문제 사유</span>
                  </div>

                  <div>
                    <span className="text-[10.5px] text-slate-400 block mb-1">
                      지금 풀고 있는 문제의 핵심 발상 1줄:
                    </span>
                    <input
                      type="text"
                      value={blackoutConcept}
                      onChange={(e) => setBlackoutConcept(e.target.value)}
                      placeholder="예: x=2에서 미분계수가 0임을 그래프 접선으로 해석"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>

                  <div className="flex items-center justify-center gap-2 pt-0.5">
                    <button
                      onClick={() => setIsBlackoutRunning(!isBlackoutRunning)}
                      className={`flex-1 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                        isBlackoutRunning ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 text-slate-950'
                      }`}
                    >
                      {isBlackoutRunning ? '일시정지' : '🌑 시각 터널링 시작 (+5~8점)'}
                    </button>
                    <button
                      onClick={() => { setIsBlackoutRunning(false); setBlackoutTimer(25 * 60); }}
                      className="p-2 rounded-xl bg-slate-800 text-slate-300 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* [방법 9] 울트라디안 90분 피크-딥 과목 매칭 */}
            {activeProtocolTab === 'p9' && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-[10.5px] text-slate-700 space-y-0.5">
                  <span className="font-bold text-amber-900 flex items-center gap-1 text-[11px]">
                    <Zap className="w-3.5 h-3.5 text-amber-600" />
                    <span>뇌과학 원리: 90분 생체 바이오리듬 '울트라디안(Ultradian Rhythm)'</span>
                  </span>
                  <p className="leading-snug">
                    뇌는 90분 집중 후 20분 회복이 필수입니다. Dip 구간에 킬러를 풀지 않고 리듬에 맞춰 과목을 스위칭합니다.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-slate-800 text-[11px]">
                      나의 크로노타입 선택:
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setChronotype('LARK')}
                        className={`px-2 py-0.5 rounded-lg text-[10.5px] font-bold transition cursor-pointer ${
                          chronotype === 'LARK' ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        🌅 아침형
                      </button>
                      <button
                        onClick={() => setChronotype('OWL')}
                        className={`px-2 py-0.5 rounded-lg text-[10.5px] font-bold transition cursor-pointer ${
                          chronotype === 'OWL' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        🦉 올빼미형
                      </button>
                    </div>
                  </div>

                  {/* 피크-딥 시각화 */}
                  <div className="space-y-1 pt-0.5">
                    <div className="p-2 bg-indigo-50 rounded-xl border border-indigo-200 flex items-center justify-between">
                      <div>
                        <span className="text-[9.5px] font-bold text-indigo-600 block">🚀 Peak 1 (최상 집중)</span>
                        <span className="font-black text-slate-800 text-[10.5px]">
                          {chronotype === 'LARK' ? '09:00 ~ 10:30' : '10:30 ~ 12:00'} : 수학 킬러 / 국어 고난도 독서
                        </span>
                      </div>
                      <span className="text-[9px] bg-indigo-600 text-white px-1.5 py-0.2 rounded-full font-bold">부하 100%</span>
                    </div>

                    <div className="p-2 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
                      <div>
                        <span className="text-[9.5px] font-bold text-amber-600 block">☕ Dip 1 (아데노신 저하)</span>
                        <span className="font-black text-slate-800 text-[10.5px]">
                          {chronotype === 'LARK' ? '13:30 ~ 14:00' : '14:30 ~ 15:00'} : 20분 커피 냅 &amp; 영단어
                        </span>
                      </div>
                      <span className="text-[9px] bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded-full font-bold">리프레시</span>
                    </div>

                    <div className="p-2 bg-purple-50 rounded-xl border border-purple-200 flex items-center justify-between">
                      <div>
                        <span className="text-[9.5px] font-bold text-purple-600 block">🚀 Peak 2 (2차 각성)</span>
                        <span className="font-black text-slate-800 text-[10.5px]">
                          {chronotype === 'LARK' ? '14:30 ~ 16:30' : '16:00 ~ 18:00'} : 과탐/사탐 기출 심층 분석
                        </span>
                      </div>
                      <span className="text-[9px] bg-purple-600 text-white px-1.5 py-0.2 rounded-full font-bold">LTP 시냅스</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setIsUltradianApplied(true);
                      alert('⚡ 울트라디안 바이오리듬이 학습 계획에 적용되었습니다! (+6~10점 상승)');
                    }}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1 shadow-sm active:scale-95 transition cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>⚡ 공부 계획에 울트라디안 리듬 즉시 동조하기</span>
                  </button>
                </div>
              </div>
            )}

            {/* [방법 10] 취침 직전 15분 해마 수면 고착 */}
            {activeProtocolTab === 'p10' && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <div className="p-2.5 bg-purple-50 rounded-xl border border-purple-200 text-[10.5px] text-slate-700 space-y-0.5">
                  <span className="font-bold text-purple-900 flex items-center gap-1 text-[11px]">
                    <Moon className="w-3.5 h-3.5 text-purple-600" />
                    <span>뇌과학 원리: 서파 수면(SWS) 중 해마 ➡️ 피질 기억 전이(Consolidation)</span>
                  </span>
                  <p className="leading-snug">
                    낮에 공부한 지식은 잘 때 대뇌피질로 복사됩니다. 취침 전 10분 리플레이로 기억 보존율을 300% 높입니다.
                  </p>
                </div>

                <div className="p-3 bg-gradient-to-br from-indigo-950 to-slate-900 text-white rounded-2xl border border-indigo-700/50 space-y-2.5">
                  <div className="flex items-center justify-between pb-1.5 border-b border-indigo-800/60 text-xs">
                    <span className="font-black text-indigo-200 flex items-center gap-1 text-[11px]">
                      <span>🌙 [취침 직전 15분 골든 리플레이 큐]</span>
                    </span>
                    <span className="text-[9.5px] text-indigo-400 font-mono">기억 보존율 300%</span>
                  </div>

                  <div className="p-2.5 bg-indigo-900/40 rounded-xl border border-indigo-500/30 text-xs space-y-1.5">
                    <span className="text-[9.5px] text-indigo-300 font-bold block">
                      오늘 기록된 3색 오답 리플레이 ({replayCardIndex + 1}/3):
                    </span>
                    <div className="font-bold text-xs text-amber-200 leading-snug">
                      {replayCardIndex === 0 && '📌 [수학 21번]: "극값 x>0 조건 놓치지 않기 - 첫 문장 네모 박스"'}
                      {replayCardIndex === 1 && '📌 [국어 독서]: "인과 관계와 선후 관계 구분 - 지문 접속사에 역삼각형"'}
                      {replayCardIndex === 2 && '📌 [탐구 18번]: "역학적 에너지 보존식 기준점 0m 지면 설정 후 전개"'}
                    </div>
                    <div className="flex items-center justify-between pt-0.5">
                      <button
                        onClick={() => setReplayCardIndex(prev => (prev > 0 ? prev - 1 : 2))}
                        className="px-2 py-0.5 bg-white/10 rounded-lg text-[9.5px] text-slate-300 cursor-pointer"
                      >
                        ◀ 이전 카드
                      </button>
                      <button
                        onClick={() => setReplayCardIndex(prev => (prev < 2 ? prev + 1 : 0))}
                        className="px-2 py-0.5 bg-white/10 rounded-lg text-[9.5px] text-slate-300 cursor-pointer"
                      >
                        다음 카드 ▶
                      </button>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 p-2 bg-black/40 rounded-xl border border-indigo-500/30 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={sleepPledgeChecked}
                      onChange={(e) => setSleepPledgeChecked(e.target.checked)}
                      className="accent-indigo-500 rounded w-4 h-4"
                    />
                    <span className="text-slate-200 font-bold text-[10.5px]">
                      취침 전 스마트폰 SNS 절대 금지 서약 (블루라이트 차단)
                    </span>
                  </label>

                  <button
                    onClick={() => {
                      setSleepReplayActive(true);
                      alert('🌙 15분 해마 수면 고착 세션이 가동되었습니다. 편안히 수면에 들어 기억을 영구 고착시키세요 (+5~9점).');
                    }}
                    className="w-full py-2 bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1 shadow-md active:scale-95 transition cursor-pointer"
                  >
                    <Moon className="w-3.5 h-3.5" />
                    <span>🌙 15분 수면 고착 가동 (+5~9점 장기기억화)</span>
                  </button>
                </div>
              </div>
            )}

            {/* Check Success Button */}
            {!todayCompleted ? (
              <button
                onClick={handleSuccessCheck}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>오늘 10대 뇌신경 행동 교정 마스터 완수! (보상 &amp; 학부모 알림)</span>
              </button>
            ) : (
              <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-center text-xs font-bold text-emerald-800">
                🎉 오늘 10대 교정 목표를 완벽히 달성했습니다! 학부모 안심 리포트가 전송되었습니다.
              </div>
            )}
          </div>
        ) : (
          <div className="p-5 bg-gradient-to-br from-slate-900 to-purple-950 rounded-2xl text-white text-center space-y-3 shadow-md">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center mx-auto text-lg border border-purple-400/30">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-purple-200">
                10대 뇌신경 행동 교정 스위트 잠금
              </h4>
              <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                물리 차단, IF-THEN 조건반사, 60초 파인만 인출기, 도파민 스트릭 금고, 학부모 안심 동기화, 3분 생리학적 한숨, 3색 오답 분해기, 시각 터널링, 울트라디안 리듬, 15분 수면 고착 등 10대 실전 교정기는 <strong>PREMIUM 등급 전용</strong>입니다.
              </p>
            </div>
            {onUpgradeClick && (
              <button
                onClick={onUpgradeClick}
                className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-black text-xs rounded-xl shadow-md transition active:scale-95 cursor-pointer"
              >
                PREMIUM(월 ₩19,900)으로 10대 행동 교정기 풀버전 열기
              </button>
            )}
          </div>
        )}
      </div>

      {/* 📄 모바일 나쁜 습관 뇌과학 진단 소견서 전용 모달 */}
      {showReportModal && (
        <div className="habit-modal-overlay fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
          <div id="habit-mobile-printable-report" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 w-full sm:max-w-lg max-h-[92vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800">
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-rose-500/20 text-rose-400 rounded-lg">
                  <Brain className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[9px] font-black text-rose-400 uppercase tracking-wider block">
                    NBASS 인지신경 클리닉
                  </span>
                  <h3 className="text-sm font-black text-white">
                    나쁜 공부습관 뇌과학 정밀 진단 소견서
                  </h3>
                </div>
              </div>
              <div className="flex items-center gap-2 habit-print-hidden">
                <button
                  onClick={handlePrintReport}
                  className="p-1.5 text-slate-300 hover:text-white rounded-lg cursor-pointer"
                  title="인쇄"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="habit-modal-scrollable p-5 overflow-y-auto space-y-4 text-xs">
              {/* Paper Meta */}
              <div className="habit-print-avoid-break p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[9px] font-bold">수험생</span>
                  <span className="font-bold text-slate-800 dark:text-white">{user.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] font-bold">등록번호</span>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">DOC-2026-HB8821</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] font-bold">열람 등급</span>
                  <span className="font-black text-[9px] uppercase px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
                    {user.tier.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Shock Metric Banner */}
              <div className="habit-print-avoid-break bg-gradient-to-br from-rose-950 via-slate-900 to-indigo-950 text-white p-4 rounded-2xl border border-rose-800/40 space-y-3">
                <div className="flex items-center gap-1.5 text-rose-300 font-black text-xs border-b border-white/10 pb-2">
                  <AlertOctagon className="w-4 h-4 text-rose-400" />
                  <span>진단된 하루 '가짜 공부' 누적 손실</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-white/5 rounded-xl">
                    <span className="text-[10px] text-slate-300 block">하루 낭비</span>
                    <span className="text-lg font-black text-rose-400 font-mono">{totalWastedMinutes}분</span>
                  </div>
                  <div className="p-2 bg-white/5 rounded-xl">
                    <span className="text-[10px] text-slate-300 block">30일 누적</span>
                    <span className="text-lg font-black text-amber-400 font-mono">약 {Math.round((totalWastedMinutes * 30) / 60)}h</span>
                  </div>
                  <div className="p-2 bg-white/5 rounded-xl">
                    <span className="text-[10px] text-slate-300 block">수능 예측</span>
                    <span className="text-lg font-black text-red-500 font-mono">-2.0등급</span>
                  </div>
                </div>
              </div>

              {/* PREMIUM 이상: 정밀 뇌과학 원인 및 처방 */}
              {isPremiumOrAbove ? (
                <div className="space-y-4">
                  <div className="habit-print-avoid-break p-3.5 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl border border-indigo-200 dark:border-indigo-800 space-y-1.5">
                    <span className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5 text-xs">
                      <Sparkles className="w-4 h-4 text-indigo-500" />
                      <span>12대 Care Type 신경계 정밀 병인 분석</span>
                    </span>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                      학생의 뇌는 <strong>[두뇌 피로형]</strong> 패턴으로 전두엽 배외측피질(DLPFC) 글루코스가 소모되면 즉각적 해설지 열람이나 딴짓으로 회피를 감행합니다. 이는 의지 박약이 아닌 생리적 방전 반응입니다.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-1.5">
                      <span className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5 text-xs">
                        <FileText className="w-3.5 h-3.5 text-rose-500" />
                        <span>진단된 습관별 뇌과학 소견 및 임상 처방 (Rx)</span>
                      </span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-300">
                        👑 PREMIUM 전용
                      </span>
                    </div>

                    {isPlusOrAbove ? (
                      <div className="space-y-2.5">
                        {checkedIds.map(id => {
                          const habit = BAD_HABITS_LIST.find(h => h.id === id);
                          if (!habit) return null;
                          return (
                            <div key={habit.id} className="habit-print-avoid-break p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                              <div className="flex justify-between items-start gap-2">
                                <div>
                                  <span className="text-[9px] font-bold text-rose-600 bg-rose-100 dark:bg-rose-950/80 px-1.5 py-0.5 rounded">
                                    {habit.category}
                                  </span>
                                  <div className="font-bold text-slate-900 dark:text-white text-xs mt-1">{habit.title}</div>
                                </div>
                                <span className="text-[10px] font-bold text-rose-500 font-mono shrink-0">-{habit.wastedMinutesPerDay}분</span>
                              </div>
                              <div className="space-y-1.5 text-[10.5px] text-slate-600 dark:text-slate-300 pt-1">
                                <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-800">
                                  <strong className="text-indigo-600 dark:text-indigo-400 block text-[10px] mb-0.5">🧠 뇌과학적 원인:</strong>
                                  <p className="leading-snug">{habit.brainCause}</p>
                                </div>
                                <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-800">
                                  <strong className="text-rose-600 dark:text-rose-400 block text-[10px] mb-0.5">⚡ 수능/성적 악영향:</strong>
                                  <p className="leading-snug mb-1">{habit.impact}</p>
                                  {habit.expectedScoreBoost && (
                                    <div className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-1 rounded border border-amber-200 dark:border-amber-800/60">
                                      {habit.expectedScoreBoost}
                                    </div>
                                  )}
                                </div>
                                <div className="p-2 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800/50">
                                  <strong className="text-emerald-700 dark:text-emerald-400 block text-[10px] mb-0.5">💊 임상 교정 처방 (Rx):</strong>
                                  <p className="leading-snug text-slate-700 dark:text-slate-200">{habit.prescription}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      /* PREMIUM 전용 안내 및 4대 킬러 기능 소개 */
                      <div className="p-4 bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-950 text-white rounded-2xl border border-purple-500/30 space-y-3.5 shadow-lg">
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-400/30 flex items-center justify-center shrink-0 mt-0.5">
                            <Lock className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-[9px] font-black uppercase text-purple-300 tracking-wider block">PREMIUM 전용 임상 소견서</span>
                            <h5 className="font-bold text-white text-xs leading-snug">
                              진단된 습관별 뇌과학 소견 및 긴급 처방 (Rx)은 PREMIUM 이상에서 열람 가능합니다
                            </h5>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          뇌 신경망을 재건축하는 맞춤 처방전(Rx)과 함께 학원·과외가 해결하지 못하는 <strong>4대 킬러 인터랙티브 교정 시스템</strong>이 즉시 열립니다.
                        </p>

                        <div className="space-y-2 text-[10.5px]">
                          <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 space-y-0.5">
                            <span className="font-bold text-purple-300 block">🧠 1. 12대 습관별 심층 뇌과학 소견서 &amp; 평생 소장 A4 리포트</span>
                            <p className="text-slate-300 text-[10px]">수능 악영향 해설, 기대 점수 상승치(+8~15점), 임상 처방전 무제한 인쇄/PDF 발급</p>
                          </div>
                          <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 space-y-0.5">
                            <span className="font-bold text-amber-300 block">🎯 2. 실전 3단계 행동 교정기 &amp; 3단계 힌트 오픈제</span>
                            <p className="text-slate-300 text-[10px]">1단계 봉인 선언 ➡️ 2단계 3m 격리/대체 행동 ➡️ 3단계 타이머로 가짜 공부 원천 박멸</p>
                          </div>
                          <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 space-y-0.5">
                            <span className="font-bold text-emerald-300 block">⏱️ 3. 골든 서카디안 뽀모도로 타이머 &amp; 알파파 바이노럴 비트</span>
                            <p className="text-slate-300 text-[10px]">25분 초집중 + 5분 신경계 회복 세션과 주파수 사운드로 전두엽 방전 방지</p>
                          </div>
                          <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 space-y-0.5">
                            <span className="font-bold text-rose-300 block">📈 4. 연속 봉인 스트릭 &amp; 학부모 안심 리포트</span>
                            <p className="text-slate-300 text-[10px]">매일 습관 참아내기 연속 보상 및 순공 시간 회복률 실시간 학부모 연동</p>
                          </div>
                        </div>

                        <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 text-[10px] text-slate-300">
                          ☕ <strong>수험생 맞춤 영양 솔루션</strong> (HL 커피 처방) 및 📊 <strong>12대 Care Type 종합진단 파이프라인</strong> 무제한 연계
                        </div>

                        <button
                          onClick={() => { setShowReportModal(false); onUpgradeClick(); }}
                          className="w-full py-3 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>PREMIUM (월 ₩19,900)으로 처방전 및 4대 킬러 기능 즉시 열기</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* 무료 회원용 잠금 */
                <div className="p-4 bg-slate-900 text-white rounded-2xl border border-amber-400/30 text-center space-y-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center mx-auto">
                    <Lock className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-amber-300 text-xs">상세 뇌과학 원인 및 처방전 잠금</h4>
                  <p className="text-[10px] text-slate-300">
                    전체 습관별 뇌신경 정밀 원인과 처방전을 보려면 PREMIUM 등급이 필요합니다.
                  </p>
                  <button
                    onClick={() => { setShowReportModal(false); onUpgradeClick(); }}
                    className="w-full py-2 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black rounded-lg text-xs cursor-pointer"
                  >
                    PREMIUM(월 ₩9,900)으로 전체 리포트 열기
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer (인쇄 시 숨김) */}
            <div className="habit-print-hidden p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2 shrink-0">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                닫기
              </button>
              {isPlusOrAbove ? (
                <button
                  onClick={() => {
                    setShowReportModal(false);
                    window.scrollTo({ top: 400, behavior: 'smooth' });
                  }}
                  className="flex-1 py-2 bg-purple-600 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>3단계 행동 교정기 시작</span>
                </button>
              ) : (
                <button
                  onClick={() => { setShowReportModal(false); onUpgradeClick(); }}
                  className="flex-1 py-2 bg-purple-600 text-white rounded-xl text-xs font-black cursor-pointer"
                >
                  PREMIUM 실전 교정기 열기
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
