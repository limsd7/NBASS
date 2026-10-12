/**
 * Phase 0: 학생 주도 카카오 공유하기 (비용 0, 서버 불필요)
 * - Kakao JS SDK "공유하기": 학생 탭 → 카톡 공유 시트 (자동 발송 아님)
 * - SDK 미로드/키 미설정 시 클립보드 복사 폴백 (버튼이 깨지지 않음)
 * - 공유 내용은 실측치만 (스트릭·프로토콜 수·오답 누적)
 */
declare global {
    interface Window { Kakao?: any }
}

const getJsKey = (): string => {
    try {
        if (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.VITE_KAKAO_JS_KEY) {
            return String((import.meta as any).env.VITE_KAKAO_JS_KEY);
        }
    } catch { /* ignore */ }
    return '';
};

let sdkInitialized = false;

export function isKakaoSdkReady(): boolean {
    try {
        if (typeof window === 'undefined' || !window.Kakao) return false;
        if (!sdkInitialized) {
            const key = getJsKey();
            if (!key) return false;
            window.Kakao.init(key);
            sdkInitialized = true;
        }
        return window.Kakao.isInitialized?.() === true;
    } catch {
        return false;
    }
}

export interface HabitShareContent {
    studentName: string;
    dateLabel: string;
    streakDays: number;
    protocolCount: number;
    errorCount: number;
}

export function buildHabitShareText(c: HabitShareContent): string {
    const lines = [
        '[NBASS Habit 실천 기록]',
        `${c.studentName} · ${c.dateLabel}`,
        `• 연속 실천 ${c.streakDays}일`,
        `• 가동 프로토콜 ${c.protocolCount}/10`,
    ];
    if (c.errorCount > 0) lines.push(`• 3색 오답 분석 ${c.errorCount}건 누적`);
    lines.push('결과보다 과정을 칭찬해 주세요.');
    return lines.join('\n');
}

export async function copyTextToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch { /* 폴백 */ }
    try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand('copy');
        ta.remove();
        return ok;
    } catch {
        return false;
    }
}

/** 카톡 공유 시트 실행. SDK 미준비 시 'unavailable' (호출 측에서 복사 폴백) */
export function shareHabitToKakao(c: HabitShareContent): 'shared' | 'unavailable' {
    try {
        if (!isKakaoSdkReady()) return 'unavailable';
        const url = window.location.origin;
        const desc = `연속 ${c.streakDays}일 · 프로토콜 ${c.protocolCount}/10${c.errorCount > 0 ? ` · 오답분석 ${c.errorCount}건` : ''}`;
        window.Kakao.Share.sendDefault({
            objectType: 'feed',
            content: {
                title: `[NBASS] ${c.studentName} Habit 실천 기록`,
                description: desc,
                link: { mobileWebUrl: url, webUrl: url },
            },
            buttons: [{ title: '기록 확인하기', link: { mobileWebUrl: url, webUrl: url } }],
        });
        return 'shared';
    } catch {
        return 'unavailable';
    }
}
