/**
 * PC logicEngine 분류 코어 어댑터
 * - 모바일 AssessmentRawInput → PC 형태(hrv/survey/protocol/analytics/bloodTest/cognitive) 변환
 * - 이식된 evaluateClassificationWithScores로 판정 후 모바일 값으로 매핑
 * - PcCareType.CONCENTRATION(레거시) → ATTENTION_DEFICIT, UNASSESSED → null(호출 측 폴백)
 */
import {
  evaluateClassificationWithScores,
  loadLogicConfig,
  PcCareType,
} from './logicEngine';
import { CARE_TYPE_METADATA, type AssessmentRawInput } from './careTypeEngine';
import type { CareType, Prescriptions } from '../types';

export function mapPcTypeToMobile(t: PcCareType): CareType | null {
  if (t === PcCareType.UNASSESSED) return null;
  if (t === PcCareType.CONCENTRATION) return 'Attention Deficit' as unknown as CareType;
  return t as unknown as CareType;
}

/** 센서 미연동 기본 HRV (PC initialHRV와 동일 0基准) */
function defaultHrv(): any {
  return {
    sns: 0,
    pns: 0,
    ansAge: 0,
    fatigue: 0,
    vitality: 0,
    physicalStress: 0,
    vlf: 0,
    lf: 0,
    hf: 0,
    tp: 0,
    hrvIndex: 0,
    meanHr: 0,
    meanBpm: 75,
    stressIndex: 0,
    ppgLevel: 1,
    brainScore: 0,
    dominantEEG: [],
    eegGamma: 0,
    eegHBeta: 0,
    eegMBeta: 0,
    eegLBeta: 0,
    eegAlpha: 0,
    eegTheta: 0,
    brainBalanceL: 50,
    brainBalanceR: 50,
    brainStressCategory: '',
    concentrationLevel: 0,
    concentrationCategory: '',
    attentionLevel: 0,
    attentionCategory: '',
  };
}

export interface PcPatch {
  careType: CareType;
  careTypeName: string;
  secondaryCareType?: string;
  secondaryCareTypeName?: string;
  secondaryConfidence?: 'CONFIRMED' | 'PROVISIONAL';
  primaryScore: number;
  classificationResult: {
    primary: string;
    primaryScore: number;
    secondary: string[];
    secondaryScores: { type: string; score: number }[];
    secondaryDetails: { type: string; score: number; confidence: string; confidenceLabelKr: string }[];
    allScores: { type: string; score: number }[];
  };
  topCareScores: { type: string; name: string; score: number; description: string }[];
  prescriptions: Prescriptions;
  keyAdvice: { study: string; circadian: string; stress: string };
}

export function classifyWithPcCore(raw: AssessmentRawInput): PcPatch | null {
  const sv = raw.survey as any;
  const se = raw.studyEfficiency as any;
  const cog = raw.cognitive as any;

  const survey = {
    bai: sv.bai ?? 0,
    isi: sv.isi ?? 0,
    chronicFatigue: sv.chronicFatigue ?? false,
    fatigueSymptomsCount: sv.fatigueSymptomsCount ?? sv.cfs ?? 0,
    symptoms: [...(sv.sympatheticSymptoms || []), ...(sv.parasympatheticSymptoms || []), ...(sv.circulationSymptoms || [])],
    sympatheticSymptoms: sv.sympatheticSymptoms || [],
    parasympatheticSymptoms: sv.parasympatheticSymptoms || [],
    circulationSymptoms: sv.circulationSymptoms || [],
    circulationScore: sv.circulationScore ?? (sv.circulationSymptomsCount ?? 0) * 3,
    circulationSymptomsCount: sv.circulationSymptomsCount ?? 0,
    concentrationScore: sv.concentration ?? 0,
    adrenalFatigueScore: sv.adrenal ?? 0,
    testAnxietyCognitive: sv.testAnxietyCognitive ?? 0,
    testAnxietySomatic: sv.testAnxietySomatic ?? 0,
    digitalAddictionScore: sv.digitalAddictionScore ?? 0,
    chronotypeScore: sv.chronotypeScore ?? 0,
    varkPrimary: sv.varkPrimary,
    varkScores: sv.varkScores,
    metacognitionScores: sv.metacognitionScores,
    learningTraits: se.learningTraits
      ? {
          scores: {
            gritPlan: se.learningTraits.grit,
            mentalResilience: se.learningTraits.resilience,
            temperament: se.learningTraits.temperament,
            metaCognition: se.learningTraits.metacognition,
            internalMotivation: se.learningTraits.motivation,
          },
          rawAnswers: se.learningTraitAnswers || [],
        }
      : undefined,
  };

  const protocol = raw.protocol
    ? {
        location: raw.protocol.location,
        noiseLevel: raw.protocol.noiseLevel,
        stressLevel: raw.protocol.stressLevel,
        avgSleep: raw.protocol.sleepHours ?? raw.analytics?.avgSleepHours,
        sleepHours: raw.protocol.sleepHours,
        emotionalFactor: raw.protocol.emotionalFactor,
        motivationalFactor: raw.protocol.motivationalFactor,
        behavioralFactor: raw.protocol.behavioralFactor,
        taskDifficulty: raw.protocol.taskDifficulty,
        timeDistortion: raw.protocol.timeDistortion,
      }
    : undefined;

  const bucketToPc = (b: string): string =>
    b === 'morning' ? 'morning' : b === 'evening' ? 'evening' : 'neutral';
  const analytics = raw.analytics
    ? {
        pureStudyRatio: raw.analytics.pureStudyRatio,
        avgFocusDuration: raw.analytics.avgFocusDuration,
        distractionCount: raw.analytics.distractionCount,
        avgSleepHours: raw.analytics.avgSleepHours,
        chronotype: bucketToPc(se.chronotype),
        goalAchievementRate: raw.analytics.goalAchievementRate,
        sleepQuality: raw.analytics.sleepQuality,
        energyPattern: raw.analytics.energyPattern,
        breakAdequacy: raw.analytics.breakAdequacy,
        isTested: true,
        testDate: new Date().toISOString().slice(0, 10),
      }
    : undefined;

  const cognitive: any = {};
  if (cog.digitPlayed) {
    cognitive.workingMemory = { forwardSpan: cog.workingMemorySpan };
  }
  if (cog.goNoGoPlayed) {
    cognitive.attention = {
      accuracy: cog.goNoGoAccuracy,
      reactionTime: cog.reactionTimeMs,
      mistakes: { commission: cog.falseAlarms ?? 0 },
    };
  }

  let config;
  try {
    config = loadLogicConfig();
  } catch {
    config = { classificationRules: [] } as any;
  }
  const rules = (config && (config as any).classificationRules) || [];
  if (!Array.isArray(rules) || rules.length === 0) return null;

  const cls = evaluateClassificationWithScores(
    rules,
    defaultHrv(),
    survey,
    protocol,
    analytics,
    undefined,
    false,
    Object.keys(cognitive).length > 0 ? cognitive : undefined
  );

  const primaryMobile = mapPcTypeToMobile(cls.primary);
  if (!primaryMobile) return null;

  const meta: any = (CARE_TYPE_METADATA as any)[primaryMobile] || {};
  const toMobile = (t: PcCareType): string => mapPcTypeToMobile(t) || (t as unknown as string);
  const mappedSecondary = (cls.secondary || [])
    .map(toMobile)
    .filter((s) => s && (CARE_TYPE_METADATA as any)[s]);
  const firstSecondary = mappedSecondary[0];
  const firstDetail = (cls.secondaryDetails || []).find(
    (d) => toMobile(d.type) === firstSecondary
  );
  const topCareScores = (cls.allScores || [])
    .map((s) => ({ t: toMobile(s.type), score: s.score }))
    .filter((s) => s.t && (CARE_TYPE_METADATA as any)[s.t])
    .slice(0, 5)
    .map((s) => {
      const m: any = (CARE_TYPE_METADATA as any)[s.t];
      return { type: s.t as string, name: m.nameKr, score: s.score, description: m.summary };
    });

  const prescriptions: Prescriptions = meta.prescriptions || { nutrition: [], study: [], sleep: [], mental: [] };
  return {
    careType: primaryMobile,
    careTypeName: meta.nameKr || String(primaryMobile),
    secondaryCareType: firstSecondary,
    secondaryCareTypeName: firstSecondary ? (CARE_TYPE_METADATA as any)[firstSecondary]?.nameKr : undefined,
    secondaryConfidence: firstDetail
      ? firstDetail.confidence === 'confirmed' ? 'CONFIRMED' : 'PROVISIONAL'
      : firstSecondary ? 'PROVISIONAL' : undefined,
    primaryScore: cls.primaryScore,
    classificationResult: {
      primary: primaryMobile as unknown as string,
      primaryScore: cls.primaryScore,
      secondary: mappedSecondary as unknown as string[],
      secondaryScores: (cls.secondaryScores || []).map((s) => ({ type: toMobile(s.type), score: s.score })),
      secondaryDetails: (cls.secondaryDetails || []).map((d) => ({
        type: toMobile(d.type),
        score: d.score,
        confidence: d.confidence,
        confidenceLabelKr: d.confidenceLabelKr,
      })),
      allScores: (cls.allScores || []).map((s) => ({ type: toMobile(s.type), score: s.score })),
    },
    topCareScores,
    prescriptions,
    keyAdvice: {
      study: (prescriptions.study || [])[0] || '취약 과목 오전 골든타임 배치',
      circadian: (prescriptions.sleep || [])[0] || '서카디안 리듬 밤 11시 반 취침 고정',
      stress: (prescriptions.mental || [])[0] || '4-7-8 자율신경 이완 복식호흡',
    },
  };
}

export default classifyWithPcCore;
