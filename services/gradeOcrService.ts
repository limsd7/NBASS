import { SUNEUNG_SUBJECTS } from '../data/suneungSubjects';

// 성적표 사진 인식 (Tesseract.js, kor+eng)
// - 인식 결과는 반드시 사용자 확인을 거쳐 반영한다 (자동 저장 금지)
// - PDF는 이미지로 변환 후 동일 파이프라인 사용 (추후 확장)

export interface OcrGradeCandidate {
    subjectId: string;
    subjectName: string;
    rawScore: number;
    maxScore: number;
    context: string;
}

const normalize = (s: string): string => s.replace(/\s+/g, '');

const nameVariants = (name: string): string[] => {
    const base = normalize(name);
    const out = [base];
    if (base.includes('Ⅰ')) {
        out.push(base.replace(/Ⅰ/g, 'I'));
        out.push(base.replace(/Ⅰ/g, '1'));
    }
    if (base.includes('Ⅱ')) {
        out.push(base.replace(/Ⅱ/g, 'II'));
        out.push(base.replace(/Ⅱ/g, '2'));
    }
    // 로마자 I/아라비아 1 혼용 OCR 대비 (예: 물리학I ↔ 물리학1)
    if (/I$/.test(base)) {
        out.push(base.replace(/I$/, '1'));
    }
    if (/1$/.test(base)) {
        out.push(base.replace(/1$/, 'I'));
    }
    return Array.from(new Set(out));
};

export const recognizeGradeImage = async (
    file: File | Blob,
    onProgress?: (percent: number) => void
): Promise<string> => {
    // tesseract.js는 동적 import로만 로드 (메인 번들 비대화 방지)
    const Tesseract: any = await import('tesseract.js');
    onProgress?.(5);
    const worker = await Tesseract.createWorker('kor+eng');
    try {
        onProgress?.(30);
        const { data } = await worker.recognize(file);
        onProgress?.(100);
        return (data?.text || '') as string;
    } finally {
        try { await worker.terminate?.(); } catch { /* ignore */ }
    }
};

// 과목명 매칭 + 인근 숫자 추출 (원점수 후보)
// - 과목명 뒤 15자 윈도우에서 탐색 (다음 과목 점수 오인 방지)
// - '84점2등급'이 붙어 '842등급'으로 인식되는 경우: 앞 2자리(100점은 3자리)를 점수로 복원
// - 등급 숫자('2등급')는 점수가 아니므로 제외
// - 만점 범위를 벗어나면 버린다
export const parseGradeScores = (
    text: string,
    subjects = SUNEUNG_SUBJECTS
): OcrGradeCandidate[] => {
    if (!text || !Array.isArray(subjects) || subjects.length === 0) return [];
    const flat = normalize(text);
    if (!flat) return [];
    const out: OcrGradeCandidate[] = [];
    const seen = new Set<string>();

    // 모든 과목명 변형 (윈도우 경계용: 다음 과목명 앞에서 자름)
    const allVariants: { variant: string; id: string }[] = [];
    for (const sub of subjects) {
        if (!sub?.id || !sub?.name) continue;
        for (const v of nameVariants(sub.name)) {
            allVariants.push({ variant: v, id: sub.id });
        }
    }

    const findAllHits = (variants: string[]): { hit: number; hitLen: number }[] => {
        const hits: { hit: number; hitLen: number }[] = [];
        for (const v of variants) {
            let from = 0;
            while (from < flat.length) {
                const idx = flat.indexOf(v, from);
                if (idx < 0) break;
                hits.push({ hit: idx, hitLen: v.length });
                from = idx + Math.max(1, v.length);
            }
        }
        return hits.sort((a, b) => a.hit - b.hit);
    };

    const extractScore = (windowText: string, maxScore: number): number | null => {
        if (!windowText) return null;
        let rawScore: number | null = null;
        const glued = windowText.match(/(\d{3,4})등급/);
        if (glued) {
            const digits = glued[1];
            rawScore = digits.startsWith('100') ? 100 : Number(digits.slice(0, 2));
        } else {
            const withoutGrades = windowText.replace(/\d{1,2}등급/g, '');
            const m = withoutGrades.match(/(\d{1,3})/);
            if (m) rawScore = Number(m[1]);
        }
        if (rawScore === null || !Number.isFinite(rawScore) || rawScore < 0) return null;
        if (rawScore <= maxScore) return rawScore;
        // 만점 초과 시 붙음 오인식 복원 시도 (예: 50점 만점에 '842등급' → 84는 초과이므로 앞 2자리 84도 초과 → 무효 유지)
        // 100점 만점인데 3자리 붙음으로 100 초과가 된 경우에만 앞 2자리로 복원
        if (maxScore >= 100 && rawScore > 100) {
            const fallback = Number(String(Math.floor(rawScore)).slice(0, 2));
            if (Number.isFinite(fallback) && fallback >= 0 && fallback <= maxScore) return fallback;
        }
        if (maxScore < 100 && rawScore > maxScore) {
            const digits = String(Math.floor(rawScore));
            // '100'으로 시작하면 100→50점 만점에서는 앞 2자리(10)로 복원 시도
            const fallback = digits.startsWith('100') ? 10 : Number(digits.slice(0, 2));
            if (Number.isFinite(fallback) && fallback >= 0 && fallback <= maxScore) return fallback;
        }
        return null;
    };

    for (const sub of subjects) {
        if (!sub?.id || !sub?.name || seen.has(sub.id)) continue;
        const maxScore = Number(sub.maxScore) || 100;
        const variants = nameVariants(sub.name);
        const hits = findAllHits(variants);
        if (hits.length === 0) continue;
        // 후보 위치마다 점수 추출을 시도해 유효 점수가 나오는 첫 위치를 채택 (중복 표기/머리말 오매칭 방지)
        let accepted: { rawScore: number; context: string } | null = null;
        for (const { hit, hitLen } of hits) {
            // 다음 과목명이 나오기 전까지만 탐색 (이웃 과목 점수 오인 방지, 상한 60자)
            let windowEnd = Math.min(flat.length, hit + hitLen + 60);
            for (const av of allVariants) {
                if (av.id === sub.id) continue;
                const ni = flat.indexOf(av.variant, hit + hitLen);
                if (ni >= 0 && ni < windowEnd) windowEnd = ni;
            }
            const windowText = flat.slice(hit + hitLen, windowEnd);
            const rawScore = extractScore(windowText, maxScore);
            if (rawScore !== null) {
                accepted = { rawScore, context: windowText.slice(0, 20) };
                break;
            }
        }
        if (!accepted) continue;
        seen.add(sub.id);
        out.push({
            subjectId: sub.id,
            subjectName: sub.name,
            rawScore: accepted.rawScore,
            maxScore: sub.maxScore,
            context: accepted.context,
        });
    }
    return out;
};
