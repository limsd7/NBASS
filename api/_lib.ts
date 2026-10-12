// Vercel/Netlify 서버리스 공용 헬퍼 (api/_lib.ts는 라우트가 아님)
import { GoogleGenAI } from "@google/genai";

export const getGeminiKey = (): string => process.env.GEMINI_API_KEY || "";

export const getAiClient = (): GoogleGenAI =>
  new GoogleGenAI({
    apiKey: getGeminiKey(),
    httpOptions: { headers: { "User-Agent": "aistudio-build" } },
  });

export const noKey = (res: any) =>
  res.status(500).json({
    error: "GEMINI_API_KEY가 설정되지 않았습니다. 설정(Settings) 메뉴에서 API 키를 입력해주세요.",
  });

export const cleanJson = (text: string): string =>
  (text || "{}").replace(/```json/g, "").replace(/```/g, "").trim();

export const methodGuard = (req: any, res: any): boolean => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "POST only" });
    return false;
  }
  return true;
};
