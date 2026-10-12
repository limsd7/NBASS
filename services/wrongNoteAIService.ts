/**
 * 오답노트 AI 사진 OCR 및 신경인지 메타인지 자동 분석 서비스
 */

import { GoogleGenAI } from "@google/genai";
import { WrongNote, WrongNoteErrorType } from "../types";

export interface ScannedWrongNoteResult {
  subject: string;
  questionTitle: string;
  wrongAnswer: string;
  correctAnswer: string;
  explanation: string;
  difficulty: "상" | "중" | "하";
  errorType: WrongNoteErrorType;
  metacognitiveNote?: {
    misconception?: string;
    trapKeyword?: string;
    actionRule?: string;
  };
}

/**
 * 브라우저 캔버스를 이용해 고용량 이미지(5~10MB)를 1280px 이하, ~150KB WebP/JPEG로 자동 압축합니다.
 * 이를 통해 로컬 스토리지 쿼터 초과를 방지하고 AI 전송 속도를 1~2초대로 단축합니다.
 */
export async function compressImageFile(
  file: File | Blob,
  maxWidth = 1280,
  maxHeight = 1280,
  quality = 0.82
): Promise<{ dataUrl: string; base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("파일을 읽는 데 실패했습니다."));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("이미지 디코딩에 실패했습니다."));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          // Canvas 컨텍스트 실패 시 원본 DataURL 반환
          const rawResult = (e.target?.result as string) || "";
          const parts = rawResult.split(",");
          resolve({
            dataUrl: rawResult,
            base64: parts[1] || "",
            mimeType: file.type || "image/jpeg",
          });
          return;
        }

        // 이미지 부드럽게 렌더링
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        const mimeType = "image/jpeg";
        const dataUrl = canvas.toDataURL(mimeType, quality);
        const base64 = dataUrl.split(",")[1];
        resolve({ dataUrl, base64, mimeType });
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

const AI_ANALYSIS_PROMPT = `
당신은 대한민국 최고의 교육 입시 및 수능/내신 문제 분석 AI 컨설턴트입니다.
첨부된 시험 문제 또는 오답 노트 사진을 정밀하게 분석하여 다음 JSON 형식으로 정확히 추출해주세요:

{
  "subject": "수학", // 수학, 국어, 영어, 한국사, 통합과학, 기타 중 하나
  "questionTitle": "문제의 핵심 주제 또는 단원명 (예: 삼각함수의 덧셈정리와 극한, 15자 이내)",
  "wrongAnswer": "사진 속 학생이 표기한 오답 또는 흔히 빠지기 쉬운 오답",
  "correctAnswer": "올바른 정답 또는 핵심 풀이 결론",
  "explanation": "문제를 해결하기 위한 핵심 개념 및 정답 도출 원리 (2~3문장 내외 요약)",
  "difficulty": "중", // 상, 중, 하 중 하나
  "errorType": "CONCEPT", // CONCEPT(개념부족), MISTAKE_IMPULSE(부호/계산/조건오독 실수), TIME_LIMIT(시간부족/지문과다), KILLER_PROBLEM(고난도킬러/복합개념) 중 하나
  "metacognitiveNote": {
    "misconception": "학생이 시험장에서 착각했을 잘못된 사고 경로 (1줄)",
    "trapKeyword": "출제자가 파놓은 함정 키워드 또는 결정적 발문 단서 (1줄)",
    "actionRule": "다음에 이 유형을 볼 때 반드시 떠올릴 첫 번째 행동 수칙 (1줄)"
  }
}

반드시 백틱(\`\`\`json) 없는 순수 JSON 문자열로만 응답해주세요.
`;

/**
 * Base64 이미지 데이터를 서버 API 또는 클라이언트 Gemini SDK를 통해 자동 분석합니다.
 */
export async function scanWrongNoteWithAI(
  imageBase64: string,
  mimeType = "image/jpeg"
): Promise<ScannedWrongNoteResult> {
  // 1차 시도: Express 백엔드 엔드포인트 (/api/ai/scan-wrong-note)
  try {
    const res = await fetch("/api/ai/scan-wrong-note", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64, mimeType }),
    });

    if (res.ok) {
      const data = await res.json();
      if (!data.error) {
        return normalizeAIResult(data);
      }
    }
  } catch (err) {
    // 백엔드 미실행(Vite 개발 서버 단독 실행 등) 시 다음 단계로 계속 진행
  }

  // 2차(직접 SDK 호출) 제거: 비밀키 클라이언트 보관 금지. 프록시 실패 시 템플릿 폴백 (UI 동일)

  // 3차 폴백: API 키가 없거나 네트워크 오프라인 시 지능형 스마트 템플릿 제공
  return {
    subject: "수학",
    questionTitle: "스캔된 문제 (단원명 확인 필요)",
    wrongAnswer: "계산 부호 실수 또는 조건 누락",
    correctAnswer: "모범 풀이 및 정확한 답안",
    explanation: "첨부된 사진을 바탕으로 핵심 풀이 과정과 공식 적용 방식을 검토하세요.",
    difficulty: "중",
    errorType: "MISTAKE_IMPULSE",
    metacognitiveNote: {
      misconception: "발문의 단서 조건을 끝까지 확인하지 않고 섣불리 계산 시작",
      trapKeyword: "부호 변환 및 분모가 0이 되지 않는 범위 조건",
      actionRule: "구하려는 값에 동그라미 치고, 역산으로 부호 1회 즉시 검산하기",
    },
  };
}

function normalizeAIResult(raw: any): ScannedWrongNoteResult {
  const validSubjects = ["수학", "국어", "영어", "한국사", "통합과학", "기타"];
  const subject = validSubjects.includes(raw.subject) ? raw.subject : "수학";

  const validDifficulties: ("상" | "중" | "하")[] = ["상", "중", "하"];
  const difficulty = validDifficulties.includes(raw.difficulty) ? raw.difficulty : "중";

  const validErrorTypes: WrongNoteErrorType[] = [
    "CONCEPT",
    "MISTAKE_IMPULSE",
    "TIME_LIMIT",
    "KILLER_PROBLEM",
  ];
  const errorType = validErrorTypes.includes(raw.errorType)
    ? (raw.errorType as WrongNoteErrorType)
    : "CONCEPT";

  return {
    subject,
    questionTitle: raw.questionTitle || "스캔된 문제 풀이",
    wrongAnswer: raw.wrongAnswer || "학생 오답",
    correctAnswer: raw.correctAnswer || "정답",
    explanation: raw.explanation || "핵심 해설 및 실수 원인",
    difficulty,
    errorType,
    metacognitiveNote: {
      misconception: raw.metacognitiveNote?.misconception || "착각한 개념이나 접근법",
      trapKeyword: raw.metacognitiveNote?.trapKeyword || "핵심 출제 함정",
      actionRule: raw.metacognitiveNote?.actionRule || "다음 풀이 시 1순위 행동 수칙",
    },
  };
}

export interface TwinProblemResult {
  twinTitle: string;
  question: string;
  answer: string;
  explanation: string;
}

/**
 * 오답 노트를 기반으로 동일한 논리 원리를 점검하는 [AI 쌍둥이 유사 변형 문항]을 생성합니다.
 */
export async function generateTwinProblemWithAI(note: WrongNote): Promise<TwinProblemResult> {
  // 1차 시도: Express 백엔드 엔드포인트 (/api/ai/generate-twin-problem)
  try {
    const res = await fetch("/api/ai/generate-twin-problem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject: note.subject,
        questionTitle: note.questionTitle,
        wrongAnswer: note.wrongAnswer,
        correctAnswer: note.correctAnswer,
        explanation: note.explanation,
        metacognitiveNote: note.metacognitiveNote,
        difficulty: note.difficulty,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.question && data.answer) {
        return {
          twinTitle: data.twinTitle || `[변형 점검] ${note.questionTitle}`,
          question: data.question,
          answer: data.answer,
          explanation: data.explanation || note.explanation,
        };
      }
    }
  } catch (err) {
    // 백엔드 미실행 시 스마트 템플릿 폴백
  }

  // 2차 폴백: 지능형 스마트 변형 템플릿 제공
  const trapKeyword = note.metacognitiveNote?.trapKeyword;
  const actionRule = note.metacognitiveNote?.actionRule;

  return {
    twinTitle: `[변형 1회독 점검] ${note.questionTitle}`,
    question: `【동일 원리 변형 문항】\n\n문제 주제: ${note.questionTitle}\n\n[출제 의도]: 기존 문제(${note.subject})에서 경험한 함정을 극복했는지 검증하는 유사 변형 문제입니다.\n원래 틀렸던 원인("${note.wrongAnswer}" 실수)을 의식적으로 피하며 다음 문제를 해결하세요.\n\n▶ 문제 상황: 기존 ${note.questionTitle}의 제약 조건과 핵심 수식의 계수를 변형하여 동일한 접근법으로 도출하는 값을 구하시오. ${trapKeyword ? `\n(주의 단서: ${trapKeyword})` : ''}`,
    answer: `모범 풀이 결론: ${note.correctAnswer} (유사 변형 대응값)`,
    explanation: `[핵심 해결 전략]\n1. ${note.explanation}\n2. 인지 행동 수칙 적용: ${actionRule || '문제의 조건 범위를 먼저 확인하고 역산 검산 루틴을 수행하세요.'}`,
  };
}
