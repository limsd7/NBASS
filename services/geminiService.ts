
import { HRVData, SurveyData, CareType, ProtocolData } from "../types";
import { generateAIResponse, SOTA_MODELS } from "./aiService";
import { checkAIConsistency } from './aiConsistencyGuard';
import { logger } from '../utils/logger';

export const generateProfessionalAnalysis = async (
  hrv: HRVData,
  survey: SurveyData,
  protocol: ProtocolData,
  careType: CareType
) => {
  const systemPrompt = "당신은 임상 신경심리학자이자 학습 전략 컨설턴트인 NBASS AI 전담 분석가입니다. 학생의 뇌-신체 통합 데이터를 바탕으로 전문적이고 격려하는 어조의 맞춤형 종합 분석 보고서를 한국어로 작성하세요.";

  const hasBioSignals = Boolean(hrv && (hrv.sns > 0 || (hrv.eegAlpha || 0) > 0));

  const prompt = `
    학생의 학습 케어 프로필 데이터입니다:
    
    [1. 학습 환경 및 집중 프로토콜]
    - 장소: ${protocol.location}, 집중 방해 소음: ${protocol.noiseLevel}/10, 주관적 학습 피로/스트레스: ${protocol.stressLevel}/10
    - 학습 심리 요인: 정서 안정 ${protocol.emotionalFactor}, 학습 동기 ${protocol.motivationalFactor}, 실행력 ${protocol.behavioralFactor}

    [2. 신경인지 케어 분류]
    - 진단 케어타입: ${careType} (학생의 학습 체질 및 인지 성향)
    ${hasBioSignals ? `
    [3. 생체 보조 데이터]
    - 자율신경계: SNS(교감) ${hrv.sns}%, PNS(부교감) ${hrv.pns}%
    - 두뇌 집중도: 집중 몰입도 ${hrv.concentrationLevel || 75}%, 자율신경 안정도 ${hrv.pns || 50}%` : ''}

    다음 3가지 항목을 중심으로 학생과 학부모가 즉시 실행할 수 있는 실전 솔루션 리포트를 작성해 주세요:
    1. 진단 케어타입(${careType})에 따른 핵심 학습 병목(시간 부족, 집중 분산, 시험 불안 등) 원인 분석
    2. 과목별 실전 문제풀이 및 시험 시간 배분 전략 (킬러/준킬러 선별, 실수 방지 3색 오답노트 작성법)
    3. 일일 순공 시간 극대화를 위한 과목별 최적 시간표 및 집중 유지 뽀모도로 루틴
  `;

  try {
    const res = await generateAIResponse(prompt, systemPrompt, null, 'premium');
    // [P2-9] 진단(CareType)과 AI 서술의 정합성을 검증하고 경고를 로깅합니다.
    const consistency = checkAIConsistency(res.text, careType);
    if (!consistency.ok) {
      logger.warn('ai', 'report consistency warnings', { careType, warnings: consistency.warnings });
    }
    return res.text;
  } catch (error) {
    console.error("[AI] OpenRouter Analysis Error:", error);
    return "통합 리포트 생성 중 네트워크 지연이 발생했습니다. 설정에서 OpenRouter API 키를 확인하시거나 기본 분석 리포트를 확인해주세요.";
  }
};
