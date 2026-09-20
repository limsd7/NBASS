/**
 * UTM 트래킹 유틸 — 광고 채널 어트리뷰션 및 퍼널 전환 추적
 *
 * 광고 링크 예시:
 *   https://nbass.io/?utm_source=naver&utm_medium=gfa&utm_campaign=parent_anxiety&utm_content=ad001&v=a
 *
 * - utm_source: 채널 (naver / meta / google / seeding)
 * - utm_medium: 포맷 (gfa / reels / shorts / knowledge)
 * - utm_campaign: 캠페인명 (예: parent_anxiety_2026)
 * - utm_content: 소재 ID (A/B 소재 구분)
 * - v: 랜딩 변형 (a / b / c) — A/B 테스트용
 *
 * 저장 위치: localStorage (nbass_utm_*)
 * 퍼널 이벤트: landing_visit → diagnosis_start → diagnosis_complete → paid_convert
 */

export interface UtmAttribution {
    utmSource: string;
    utmMedium: string;
    utmCampaign: string;
    utmContent: string;
    variant: string;
    capturedAt: string;
}

export interface FunnelEvent {
    event: 'landing_visit' | 'diagnosis_start' | 'diagnosis_complete' | 'paid';
    variant: string;
    utmSource: string;
    utmMedium: string;
    utmCampaign: string;
    utmContent: string;
    timestamp: string;
}

const ATTRIBUTION_KEY = 'nbass_utm_attribution';
const EVENTS_KEY = 'nbass_funnel_events';
const SESSION_VISIT_KEY = 'nbass_landing_visit_logged';

/** URL에서 UTM 파라미터를 읽어 localStorage에 저장 (세션당 1회) */
export function captureUtmFromUrl(): UtmAttribution | null {
    try {
        const params = new URLSearchParams(window.location.search);
        const source = params.get('utm_source');
        const medium = params.get('utm_medium');
        const campaign = params.get('utm_campaign');
        const content = params.get('utm_content');
        const variant = params.get('v') || '';

        // UTM이 하나도 없으면 기존 어트리뷰션 유지
        if (!source && !medium && !campaign && !content && !variant) {
            return getStoredAttribution();
        }

        const attribution: UtmAttribution = {
            utmSource: source || 'direct',
            utmMedium: medium || 'none',
            utmCampaign: campaign || 'none',
            utmContent: content || 'none',
            variant: variant || 'default',
            capturedAt: new Date().toISOString(),
        };

        localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(attribution));

        // 랜딩 방문 이벤트 (세션당 1회)
        if (!sessionStorage.getItem(SESSION_VISIT_KEY)) {
            sessionStorage.setItem(SESSION_VISIT_KEY, '1');
            logFunnelEvent('landing_visit', attribution);
        }

        return attribution;
    } catch {
        return null;
    }
}

/** 저장된 어트리뷰션 조회 (없으면 direct 기본값) */
export function getStoredAttribution(): UtmAttribution {
    try {
        const raw = localStorage.getItem(ATTRIBUTION_KEY);
        if (raw) return JSON.parse(raw);
    } catch { }
    return {
        utmSource: 'direct',
        utmMedium: 'none',
        utmCampaign: 'none',
        utmContent: 'none',
        variant: 'default',
        capturedAt: new Date().toISOString(),
    };
}

/** 퍼널 이벤트 기록 (최대 500개 보관) */
export function logFunnelEvent(event: FunnelEvent['event'], attribution?: UtmAttribution): void {
    try {
        const attr = attribution || getStoredAttribution();
        const events: FunnelEvent[] = JSON.parse(localStorage.getItem(EVENTS_KEY) || '[]');
        events.push({
            event,
            variant: attr.variant,
            utmSource: attr.utmSource,
            utmMedium: attr.utmMedium,
            utmCampaign: attr.utmCampaign,
            utmContent: attr.utmContent,
            timestamp: new Date().toISOString(),
        });
        // 최대 500개 유지 (용량 방지)
        if (events.length > 500) events.splice(0, events.length - 500);
        localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
    } catch { }
}

/** 퍼널 이벤트 전체 조회 (오너 대시보드/광고 분석용) */
export function getFunnelEvents(): FunnelEvent[] {
    try {
        return JSON.parse(localStorage.getItem(EVENTS_KEY) || '[]');
    } catch {
        return [];
    }
}

/** 채널/변형별 전환 요약 통계 (A/B 판정용) */
export interface FunnelSummary {
    [key: string]: {
        landingVisit: number;
        diagnosisStart: number;
        diagnosisComplete: number;
        paid: number;
    };
}

export function getFunnelSummary(groupBy: 'utmSource' | 'variant' | 'utmContent' = 'utmSource'): FunnelSummary {
    const summary: FunnelSummary = {};
    for (const e of getFunnelEvents()) {
        const key = String((e as any)[groupBy] || 'unknown');
        if (!summary[key]) {
            summary[key] = { landingVisit: 0, diagnosisStart: 0, diagnosisComplete: 0, paid: 0 };
        }
        if (e.event === 'landing_visit') summary[key].landingVisit++;
        else if (e.event === 'diagnosis_start') summary[key].diagnosisStart++;
        else if (e.event === 'diagnosis_complete') summary[key].diagnosisComplete++;
        else if (e.event === 'paid') summary[key].paid++;
    }
    return summary;
}

/** 앱 진입 URL에 현재 어트리뷰션을 쿼리로 덧붙이기 (랜딩 → 앱 전달용) */
export function appendUtmToUrl(baseUrl: string): string {
    try {
        const attr = getStoredAttribution();
        const url = new URL(baseUrl, window.location.origin);
        if (attr.utmSource !== 'direct') url.searchParams.set('utm_source', attr.utmSource);
        if (attr.utmMedium !== 'none') url.searchParams.set('utm_medium', attr.utmMedium);
        if (attr.utmCampaign !== 'none') url.searchParams.set('utm_campaign', attr.utmCampaign);
        if (attr.utmContent !== 'none') url.searchParams.set('utm_content', attr.utmContent);
        if (attr.variant !== 'default') url.searchParams.set('v', attr.variant);
        return url.pathname + url.search;
    } catch {
        return baseUrl;
    }
}
