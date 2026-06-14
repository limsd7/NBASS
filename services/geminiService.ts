
import { GoogleGenAI } from "@google/genai";
import { HRVData, SurveyData, CareType, ProtocolData } from "../types";

export const generateProfessionalAnalysis = async (
  hrv: HRVData,
  survey: SurveyData,
  protocol: ProtocolData,
  careType: CareType
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

  const prompt = `
    As a clinical neuropsychologist and learning strategy consultant, provide an integrated analysis of the student's Brain-Body data.
    
    [1. Learning Protocol & Environment]
    - Study Location: ${protocol.location}, Noise Level: ${protocol.noiseLevel}/10, Self-reported Stress: ${protocol.stressLevel}/10
    - Strategic Factors: Emotional ${protocol.emotionalFactor}, Motivational ${protocol.motivationalFactor}, Behavioral ${protocol.behavioralFactor}

    [2. Objective Biometrics]
    - HRV/ANS: SNS ${hrv.sns}%, PNS ${hrv.pns}%, ANS Age ${hrv.ansAge}, Vascular Level ${hrv.ppgLevel}/7
    - EEG/Brain: Health Score ${hrv.brainScore}, Dominant Rhythm ${hrv.dominantEEG}
    - EEG Ratios: Gamma ${hrv.eegGamma}%, H-Beta ${hrv.eegHBeta}%, M-Beta ${hrv.eegMBeta}%, L-Beta ${hrv.eegLBeta}%, Alpha ${hrv.eegAlpha}%, Theta ${hrv.eegTheta}%
    - Brain Balance: Left ${hrv.brainBalanceL}% / Right ${hrv.brainBalanceR}%
    - Brain Stress Category: ${hrv.brainStressCategory}
    - Focus Level: ${hrv.concentrationLevel} (${hrv.concentrationCategory}), Attention Level: ${hrv.attentionLevel} (${hrv.attentionCategory})
    
    [3. Psychological Profiles]
    - Anxiety (BAI): ${survey.bai}, Insomnia (ISI): ${survey.isi}
    - Concentration Index Score: ${survey.concentrationScore}/28

    Please provide a comprehensive report in Korean:
    1. Overall Classification: Choose one (정서 불안형 / 동기 결여형 / 환경 취약형 / 몰입 저하형) and justify it using both brain and body data.
    2. Neuro-Physical Analysis: Explain the relationship between their Brain Stress (${hrv.brainStressCategory}) and their ANS SNS/PNS balance. Mention how their dominant EEG (${hrv.dominantEEG}) correlates with their self-reported concentration.
    3. Actionable Intervention: Provide specific study tactics and wellness routines (e.g., neuro-feedback techniques, specific nutritional focus, or environmental changes).
    
    Keep the tone professional, clinical, and encouraging. Use Markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "통합 리포트 생성 중 오류가 발생했습니다. 입력한 데이터를 기반으로 전문가 상담을 진행하시기 바랍니다.";
  }
};
