// 호흡 추천 엔진: CareType × 상황 → 프로토콜 랭킹
import {
  BREATHING_PROTOCOLS,
  CARETYPE_PRIMARY_BREATH,
  SITUATION_DEFAULT_PROTOCOL,
  SITUATION_SECONDARY,
  BreathingProtocol,
  BreathSituation
} from '../data/breathingProtocols';
import { normalizeCareTypeCode } from '../data/careTypesData';

export type { BreathSituation };
export type { BreathingProtocol };

export function getBreathingProtocol(id: string): BreathingProtocol {
  const found = BREATHING_PROTOCOLS.find(p => p.id === id);
  if (found) return found;
  return BREATHING_PROTOCOLS.find(p => p.id === 'diaphragmatic')!;
}

export interface BreathRecommendation {
  primary: BreathingProtocol;
  alternatives: BreathingProtocol[];
  reason: string;
}

// 상황 프로토콜 우선, CareType 1순위를 차선으로 결합
// (예: 불안형 + 취침전 → 4-7-8 우선, 생리적 한숨 차선)
export function recommendBreathingProtocols(
  careTypeCode?: string,
  situation: BreathSituation = 'daily_calm'
): BreathRecommendation {
  const norm = normalizeCareTypeCode(careTypeCode);
  const careKey = norm === 'CONCENTRATION' ? 'ATTENTION_DEFICIT' : norm;
  const situationFirst = getBreathingProtocol(SITUATION_DEFAULT_PROTOCOL[situation]);
  const careFirst = getBreathingProtocol(CARETYPE_PRIMARY_BREATH[careKey] || CARETYPE_PRIMARY_BREATH.UNASSESSED);

  const seen = new Set<string>();
  const alternatives: BreathingProtocol[] = [];
  const pushAlt = (p: BreathingProtocol) => {
    if (!seen.has(p.id)) {
      seen.add(p.id);
      alternatives.push(p);
    }
  };

  // 1순위: 상황이 지정되면 상황 기본 프로토콜, daily_calm이면 CareType 1순위
  const primary = situation === 'daily_calm' ? careFirst : situationFirst;
  seen.add(primary.id);
  if (situation === 'daily_calm') {
    for (const id of SITUATION_SECONDARY[situation]) pushAlt(getBreathingProtocol(id));
  } else {
    if (careFirst.id !== primary.id) pushAlt(careFirst);
    for (const id of SITUATION_SECONDARY[situation]) pushAlt(getBreathingProtocol(id));
  }

  const reason = situation === 'daily_calm'
    ? `현재 상태(${careFirst.name})에 맞춘 데일리 루틴입니다.`
    : `지금 상황(${situationFirst.name})에 맞는 응급·전환 루틴이며, 현재 상태 맞춤(${careFirst.name})도 함께 제공합니다.`;

  return { primary, alternatives: alternatives.slice(0, 3), reason };
}

// UI용 상황 라벨
export const BREATH_SITUATION_LABELS: Record<BreathSituation, { label: string; emoji: string }> = {
  pre_sleep: { label: '잠들기 전', emoji: '🌙' },
  acute_anxiety: { label: '불안·긴장 급할 때', emoji: '🆘' },
  focus: { label: '집중 필요할 때', emoji: '🎯' },
  daily_calm: { label: '평소 꾸준 관리', emoji: '🌿' },
  pre_study: { label: '공부 시작 전', emoji: '📚' }
};
