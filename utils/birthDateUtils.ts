// 생년월일 입력 파싱/조립 (moved verbatim from App.tsx; no logic change)
export interface BirthParts {
    year: string;
    month: string;
    day: string;
}

export const parseBirthParts = (birthDate?: string): BirthParts => {
    if (!birthDate) return { year: '', month: '', day: '' };
    const parts = birthDate.split('-');
    return {
        year: parts[0] || '',
        // 선행 0 제거하여 표시 (01 -> 1)
        month: parts[1] ? String(parseInt(parts[1], 10) || '') : '',
        day: parts[2] ? String(parseInt(parts[2], 10) || '') : ''
    };
};

export interface BirthPartUpdate {
    parts: BirthParts;
    storageValue: string;
    focusNext: 'month' | 'day' | null;
}

export const computeBirthPartUpdate = (
    current: BirthParts,
    part: 'year' | 'month' | 'day',
    value: string
): BirthPartUpdate => {
    const next: BirthParts = { ...current };
    const numValue = value.replace(/\D/g, ''); // 숫자만
    let focusNext: 'month' | 'day' | null = null;

    if (part === 'year') {
        const limitedValue = numValue.slice(0, 4);
        next.year = limitedValue;
        // 4자리 입력 완료시 월 필드로 자동 이동
        if (limitedValue.length === 4) focusNext = 'month';
    } else if (part === 'month') {
        const limitedValue = numValue.slice(0, 2);
        next.month = limitedValue; // 패딩 없이 원본 값 유지
        if (limitedValue.length === 2) focusNext = 'day';
    } else {
        const limitedValue = numValue.slice(0, 2);
        next.day = limitedValue; // 패딩 없이 원본 값 유지
    }

    // 날짜 생성 시에만 패딩 적용 (내부 저장용)
    const storageValue = (next.year.length === 4 && next.month && next.day)
        ? `${next.year}-${next.month.padStart(2, '0')}-${next.day.padStart(2, '0')}`
        : `${next.year}-${next.month}-${next.day}`;

    return { parts: next, storageValue, focusNext };
};
