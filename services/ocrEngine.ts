import { createWorker, PSM } from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';

// Tesseract.js와 pdfjs-dist 설정
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://esm.sh/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs';

export interface ExtractedField {
  key: string;
  value: string | number;
  type: 'string' | 'number' | 'date' | 'currency';
  group?: 'HRV' | 'EEG' | 'INFO';
  confidence?: number;
  description?: string;
  boundingBox?: number[];
}

export interface ExtractionResult {
  documentType: string;
  summary: string;
  fields: ExtractedField[];
  rawText?: string;
  previewUrls?: string[];
}

const DEFAULT_METRIC_CONFIGS = [
  // INFO Group
  { key: '성명', regex: /(?:성명|이름|Name)\s*[:.]?\s*([가-힣a-zA-Z\s]{2,10})/i, group: 'INFO' as const, type: 'string' as const },
  { key: '연령', regex: /(?:연령|나이|Age)\s*[:.]?\s*(\d{1,3})/i, group: 'INFO' as const, type: 'number' as const },
  { key: '성별', regex: /(?:성별|Gender|Sex)\s*[:.]?\s*([남여MaleFemale]{1,6})/i, group: 'INFO' as const, type: 'string' as const },
  { key: '검사일시', regex: /(?:검사일시|검사\s*일시|Date)\s*[:.]?\s*(\d{4}[-./]\d{2}[-./]\d{2})/i, group: 'INFO' as const, type: 'date' as const },
  { key: '차트번호', regex: /(?:차트번호|차트\s*번호|등록번호|등록\s*번호|환자\s*등록번호|환자\s*ID|Patient\s*ID|ID|No)\s*[:.]?\s*([A-Z0-9-]+)/i, group: 'INFO' as const, type: 'string' as const },

  // HRV Group - Basic
  { key: 'Heart Rate', regex: /(?:Heart\s*Rate|HR|심박수|Heartrate\s*per\s*minute|평균\s*심박수)[^0-9]*(\d+(?:\.\d+)?)/i, group: 'HRV' as const, type: 'number' as const },
  { key: 'Mean RR', regex: /(?:Mean\s*RR|RR\s*간격|평균\s*RR|RR\s*Interval)[^0-9]*(\d+(?:\.\d+)?)/i, group: 'HRV' as const, type: 'number' as const },
  { key: 'TP', regex: /(?:TP|Total\s*Power)[^0-9]*([\d,]+(?:\.\d+)?)/i, group: 'HRV' as const, type: 'number' as const },
  { key: 'LF', regex: /(?:\bLF\b|Low\s*Frequency)[^0-9]*([\d,]+(?:\.\d+)?)/i, group: 'HRV' as const, type: 'number' as const },
  { key: 'HF', regex: /(?:\bHF\b|High\s*Frequency)[^0-9]*([\d,]+(?:\.\d+)?)/i, group: 'HRV' as const, type: 'number' as const },
  { key: 'VLF', regex: /(?:VLF|Very\s*Low)[^0-9]*([\d,]+(?:\.\d+)?)/i, group: 'HRV' as const, type: 'number' as const },
  { key: 'SNS', regex: /(?:SNS|교감|교감신경)[^0-9]*([\d,]+(?:\.\d+)?)/i, group: 'HRV' as const, type: 'number' as const },
  { key: 'PNS', regex: /(?:PNS|부교감|부교감신경)[^0-9]*([\d,]+(?:\.\d+)?)/i, group: 'HRV' as const, type: 'number' as const },
  { key: 'LF/HF', regex: /(?:LF\/HF|Ratio)[^0-9]*([\d,]+(?:\.\d+)?)/i, group: 'HRV' as const, type: 'number' as const },

  // HRV Group - Detailed
  { key: 'HRV-index', regex: /(?:HRV-index|HRV\s*index|자율신경지수|Index)[^0-9]*([\d,]+(?:\.\d+)?)/i, group: 'HRV' as const, type: 'number' as const },
  { key: 'ANS age', regex: /(?:ANS\s*age|혈관나이|혈관\s*나이|자율신경나이|자율신경\s*나이)[^0-9]*([\d,]+(?:\.\d+)?)/i, group: 'HRV' as const, type: 'number' as const },
  { key: 'APG 유형', regex: /(?:APG\s*유형|APG\s*Type|유형)\s*[:.]?\s*([A-G가-힣1-7]+)/i, group: 'HRV' as const, type: 'string' as const },

  { key: '누적피로', regex: /(?:누적피로|누적\s*피로|피로도|피로|Fatigue|Cumulative\s*Fatigue)\s*[:.]?\s*((?:매우|Very)?\s*[가-힣a-zA-Z]+|[\d,.]+)/i, group: 'HRV' as const, type: 'string' as const },
  { key: '신체스트레스', regex: /(?:신체스트레스|신체\s*스트레스|스트레스|Stress|Physical\s*Stress)\s*[:.]?\s*((?:매우|Very)?\s*[가-힣a-zA-Z]+|[\d,.]+)/i, group: 'HRV' as const, type: 'string' as const },
  { key: '신체활력도', regex: /(?:신체활력도|신체\s*활력도|활력도|활력|Vitality|Physical\s*Vitality)\s*[:.]?\s*((?:매우|Very)?\s*[가-힣a-zA-Z]+|[\d,.]+)/i, group: 'HRV' as const, type: 'string' as const },

  // EEG Group
  { key: '두뇌건강점수', regex: /(?:두뇌건강점수|두뇌\s*건강\s*점수|두뇌\s*점수|Brain\s*Score|점수)[^0-9]*([\d,]+(?:\.\d+)?)/i, group: 'EEG' as const, type: 'number' as const },
  { key: 'Gamma', regex: /(?:Gamma|감마파|감마)[^0-9(]*([\d,]+(?:\.\d+)?)/i, group: 'EEG' as const, type: 'number' as const },
  { key: 'H-beta', regex: /(?:H-beta|High\s*Beta|고베타)[^0-9(]*([\d,]+(?:\.\d+)?)/i, group: 'EEG' as const, type: 'number' as const },
  { key: 'M-beta', regex: /(?:M-beta|Middle\s*Beta|중베타)[^0-9(]*([\d,]+(?:\.\d+)?)/i, group: 'EEG' as const, type: 'number' as const },
  { key: 'L-beta', regex: /(?:L-beta|Low\s*Beta|저베타)[^0-9(]*([\d,]+(?:\.\d+)?)/i, group: 'EEG' as const, type: 'number' as const },
  { key: 'Alpha', regex: /(?:Alpha|알파파|알파)[^0-9(]*([\d,]+(?:\.\d+)?)/i, group: 'EEG' as const, type: 'number' as const },
  { key: 'Theta', regex: /(?:Theta|세타파|세타)[^0-9(]*([\d,]+(?:\.\d+)?)/i, group: 'EEG' as const, type: 'number' as const },

  { key: '좌뇌활성도', regex: /(?:좌뇌활성도|좌뇌\s*활성도|좌뇌|Left\s*Activity)[^0-9]*([\d,]+(?:\.\d+)?)/i, group: 'EEG' as const, type: 'number' as const },
  { key: '우뇌활성도', regex: /(?:우뇌활성도|우뇌\s*활성도|우뇌|Right\s*Activity)[^0-9]*([\d,]+(?:\.\d+)?)/i, group: 'EEG' as const, type: 'number' as const },
  { key: '두뇌스트레스', regex: /(?:두뇌스트레스|두뇌\s*스트레스|Brain\s*Stress)\s*[:.]?\s*((?:매우|Very)?\s*[가-힣a-zA-Z]+|[\d,.]+)/i, group: 'EEG' as const, type: 'string' as const },
  { key: '집중도', regex: /(?:집중도|Concentration|Focus)\s*[:.]?\s*((?:매우|Very)?\s*[가-힣a-zA-Z]+|[\d,.]+)/i, group: 'EEG' as const, type: 'string' as const },
  { key: '주의도', regex: /(?:주의도|Attention)\s*[:.]?\s*((?:매우|Very)?\s*[가-힣a-zA-Z]+|[\d,.]+)/i, group: 'EEG' as const, type: 'string' as const },
];

export const enhanceImageData = (data: Uint8ClampedArray, factor: number) => {
  for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      let gray = 0.299 * r + 0.587 * g + 0.114 * b;
      gray = factor * (gray - 128) + 128;
      gray = Math.max(0, Math.min(255, gray));
      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
  }
};

const extractFieldsFromText = (text: string): ExtractedField[] => {
  const cleanText = text.replace(/\s+/g, ' ');
  return DEFAULT_METRIC_CONFIGS.map(config => {
    const match = cleanText.match(config.regex);
    let val = match && match[1] ? match[1].trim() : "";
    if (config.type === 'number' && val !== "") {
        // 숫자 콤마 제거 등
        val = val.replace(/,/g, '');
    }
    return {
      key: config.key,
      value: config.type === 'number' && val ? parseFloat(val) : val,
      type: config.type,
      group: config.group,
      confidence: match ? 0.8 : 0,
    };
  });
};

export const extractDataFromDocument = async (
  base64Data: string,
  mimeType: string,
  onProgress?: (msg: string) => void
): Promise<ExtractionResult> => {
  let fullText = "";
  const previewUrls: string[] = [];
  if (onProgress) onProgress("OCR 엔진 초기화 중...");
  const worker = await createWorker('kor+eng');

  try {
    if (mimeType === 'application/pdf') {
      if (onProgress) onProgress("PDF 변환 중...");
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);

      const loadingTask = pdfjsLib.getDocument({ data: bytes });
      const pdf = await loadingTask.promise;

      for (let i = 1; i <= Math.min(pdf.numPages, 3); i++) {
        if (onProgress) onProgress(`PDF 페이지 ${i} 분석 중...`);
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.5 }); // 메모리 절약을 위해 2.5로 조정
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) continue;
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: context, viewport: viewport }).promise;

        // Image Enhancement
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const contrast = 20;
        const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
        enhanceImageData(imageData.data, factor);
        context.putImageData(imageData, 0, 0);

        // Store canvas as dataURL for preview
        previewUrls.push(canvas.toDataURL('image/jpeg', 0.8));

        const { data: { text } } = await worker.recognize(canvas);
        fullText += text + "\n";
      }
    } else {
      if (onProgress) onProgress("이미지 텍스트 분석 중...");
      const dataUrl = `data:${mimeType};base64,${base64Data}`;
      previewUrls.push(dataUrl);
      const { data: { text } } = await worker.recognize(dataUrl);
      fullText = text;
    }

    if (onProgress) onProgress("텍스트 매핑 중...");
    const fields = extractFieldsFromText(fullText);

    return {
      documentType: "Medical Report (OCR)",
      summary: "텍스트 추출 완료",
      fields: fields,
      rawText: fullText,
      previewUrls
    };
  } catch (e) {
    console.error("OCR Error:", e);
    throw new Error("결과지 분석 중 오류가 발생했습니다.");
  } finally {
    await worker.terminate();
  }
};

/**
 * 특정 이미지 영역을 잘라내어 정밀 OCR 수행
 */
export const recognizeRegion = async (
  imageSrc: string, // data URL of the canvas/image
  box: number[], // [ymin, xmin, ymax, xmax] (0-1000 scale)
): Promise<string> => {
  const worker = await createWorker('kor+eng');

  // OCR Engine Tuning: PSM 7 (Single Line) for region extraction
  await worker.setParameters({
    tessedit_pageseg_mode: PSM.SINGLE_LINE,
  });

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = async () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject("Canvas context error");

      const [ymin, xmin, ymax, xmax] = box;
      const x = (xmin / 1000) * img.width;
      const y = (ymin / 1000) * img.height;
      const w = ((xmax - xmin) / 1000) * img.width;
      const h = ((ymax - ymin) / 1000) * img.height;

      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(img, x, y, w, h, 0, 0, w, h);

      // Contrast and Threshold enhancement for region
      const imageData = ctx.getImageData(0, 0, w, h);
      const data = imageData.data;
      const contrast = 50; 
      const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
      for (let i = 0; i < data.length; i += 4) {
          const r = factor * (data[i] - 128) + 128;
          const g = factor * (data[i + 1] - 128) + 128;
          const b = factor * (data[i + 2] - 128) + 128;
          // Simple binarization (Threshold 150)
          const avg = (r + g + b) / 3;
          const val = avg >= 150 ? 255 : 0;
          data[i] = val;
          data[i + 1] = val;
          data[i + 2] = val;
      }
      ctx.putImageData(imageData, 0, 0);

      try {
        const { data: { text } } = await worker.recognize(canvas);
        await worker.terminate();
        resolve(text.trim());
      } catch (err) {
        await worker.terminate();
        reject(err);
      }
    };
    img.onerror = () => reject("Image load error");
    img.src = imageSrc;
  });
};
