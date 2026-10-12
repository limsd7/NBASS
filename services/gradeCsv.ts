// 성적 CSV 입출력 유틸 (RFC4180 최소 준수: 따옴표·콤마·개행·CRLF 처리)
import { SUNEUNG_SUBJECTS } from '../data/suneungSubjects';

export const VALID_EXAM_TYPES = new Set(['midterm', 'final', 'mock_exam', 'suneung', 'practice', 'other']);

export const parseCsvLine = (text: string, start: number): { fields: string[]; next: number } => {
    const fields: string[] = [];
    let cur = '';
    let inQuotes = false;
    let i = start;
    // BOM 건너뛰기
    if (i === 0 && text.charCodeAt(0) === 0xFEFF) i++;
    while (i < text.length) {
        const ch = text[i];
        if (inQuotes) {
            if (ch === '"') {
                if (text[i + 1] === '"') { cur += '"'; i += 2; continue; }
                inQuotes = false; i++;
                continue;
            }
            cur += ch; i++;
            continue;
        }
        if (ch === '"') { inQuotes = true; i++; continue; }
        if (ch === ',') { fields.push(cur); cur = ''; i++; continue; }
        if (ch === '\r') { i++; continue; }
        if (ch === '\n') { i++; break; }
        cur += ch; i++;
    }
    fields.push(cur);
    return { fields, next: i };
};

export const parseCsv = (text: string): string[][] => {
    const rows: string[][] = [];
    let pos = 0;
    while (pos < text.length) {
        const { fields, next } = parseCsvLine(text, pos);
        pos = next;
        if (fields.length === 1 && fields[0].trim() === '') continue;
        rows.push(fields.map(f => f.trim()));
    }
    return rows;
};

export const escapeCsvCell = (v: unknown): string => {
    const s = v === undefined || v === null ? '' : String(v);
    return `"${s.replace(/"/g, '""')}"`;
};

export interface CsvGradeRow {
    examName: string;
    examType: string;
    examDate: string;
    memo: string;
    subjects: { subjectId: string; grade: number }[];
}

// 헤더명 기준 매핑 (고정 오프셋 제거) + examType/examDate 검증 + 결과 요약
export function rowsToGradeRecords(
    rows: string[][],
    makeId: () => string,
    studentId: string
): { records: CsvGradeRow[]; imported: number; skipped: number; error?: string } {
    if (rows.length <= 1) {
        return { records: [], imported: 0, skipped: 0, error: '가져올 데이터 행이 없습니다. CSV 양식을 확인해주세요.' };
    }
    const headers = rows[0];
    const colIdx = (names: string[]): number => headers.findIndex(h => names.includes(h));
    const nameCol = colIdx(['시험명']);
    const typeCol = colIdx(['시험유형']);
    const dateCol = colIdx(['날짜']);
    const memoCol = colIdx(['메모']);
    if (nameCol < 0) {
        return { records: [], imported: 0, skipped: 0, error: 'CSV 헤더에 시험명 열이 없습니다. 내보내기 양식을 사용해주세요.' };
    }
    const subjectCols: { col: number; id: string }[] = [];
    headers.forEach((h, idx) => {
        const subj = SUNEUNG_SUBJECTS.find(s => s.name === h);
        if (subj) subjectCols.push({ col: idx, id: subj.id });
    });

    const records: CsvGradeRow[] = [];
    let skipped = 0;
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const get = (c: number): string => (c >= 0 && c < row.length ? row[c] : '');
        const examName = get(nameCol);
        if (!examName) { skipped++; continue; }

        const rawType = get(typeCol) || 'other';
        const examType = VALID_EXAM_TYPES.has(rawType) ? rawType : 'other';
        const rawDate = get(dateCol);
        const parsedDate = new Date(rawDate);
        const examDate = rawDate && Number.isFinite(parsedDate.getTime())
            ? parsedDate.toISOString().slice(0, 10)
            : new Date().toISOString().slice(0, 10);

        const subjects: { subjectId: string; grade: number }[] = [];
        for (const { col, id } of subjectCols) {
            const gradeVal = parseInt(get(col), 10);
            if (Number.isFinite(gradeVal) && gradeVal >= 1 && gradeVal <= 9) {
                subjects.push({ subjectId: id, grade: gradeVal });
            }
        }
        if (subjects.length === 0) { skipped++; continue; }
        records.push({
            examName: examName.trim(),
            examType,
            examDate,
            memo: get(memoCol),
            subjects
        });
    }
    return { records, imported: records.length, skipped };
}

export function sameExamKey(a: { examDate: string; examName: string }, b: { examDate: string; examName: string }): boolean {
    return a.examDate === b.examDate && (a.examName || '').trim() === (b.examName || '').trim();
}

export function buildExportCsv(
    records: { id: string; examName: string; examType: string; examDate: string; memo?: string; subjects: { subjectId: string; grade?: number }[] }[],
    studentName: string
): { content: string; filename: string } {
    const headers = ['ID', '시험명', '시험유형', '날짜', '메모', ...SUNEUNG_SUBJECTS.map(s => s.name)];
    const rows = records.map(r => {
        const baseInfo = [r.id, r.examName, r.examType, r.examDate, (r.memo || '')];
        const subjectGrades = SUNEUNG_SUBJECTS.map(s => {
            const sub = r.subjects.find(x => x.subjectId === s.id);
            return sub?.grade ?? '';
        });
        return [...baseInfo, ...subjectGrades].map(escapeCsvCell).join(',');
    });
    const content = "\uFEFF" + [headers.map(escapeCsvCell).join(','), ...rows].join('\r\n');
    return { content, filename: `성적기록_${studentName}.csv` };
}

export function makeId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    return `id_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
