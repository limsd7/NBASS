import { useCallback, useEffect, useRef } from 'react';
import { isDocumentHidden, now } from '../utils/mobileTestUtils';

/**
 * 터치/마우스/펜을 단일 포인터로 통일하고 백그라운드 왜곡을 방지하는 훅
 */
export const useTouchTest = (onHidden?: () => void) => {
    const startStampRef = useRef<number>(0);

    useEffect(() => {
        const handleVisibility = () => {
            if (isDocumentHidden() && onHidden) onHidden();
        };
        document.addEventListener('visibilitychange', handleVisibility);
        return () => document.removeEventListener('visibilitychange', handleVisibility);
    }, [onHidden]);

    const markStart = useCallback(() => {
        startStampRef.current = now();
        return startStampRef.current;
    }, []);

    const getStart = useCallback(() => startStampRef.current, []);

    /** pointerdown 기반 통합 핸들러 (300ms 클릭 지연 제거) */
    const pointerProps = useCallback(
        (onDown: (e: React.PointerEvent) => void) => ({
            onPointerDown: (e: React.PointerEvent) => {
                e.preventDefault();
                onDown(e);
            },
        }),
        [],
    );

    return { markStart, getStart, pointerProps, startStampRef };
};
