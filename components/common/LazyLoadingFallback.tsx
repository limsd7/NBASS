import React from 'react';

interface LazyLoadingFallbackProps {
    /** 폴백 하단에 표시할 안내 문구 (기본값은 기존 로딩 화면과 동일한 톤) */
    label?: string;
}

/**
 * 코드 분할(React.lazy)로 지연 로딩되는 청크를 기다리는 동안 표시하는 공통 폴백 UI.
 *
 * - 기존 앱의 로딩 화면(슬레이트/블루 스피너)과 동일한 톤을 사용하여 UI 이질감을 최소화합니다.
 * - 각 lazy 뷰가 화면 전체를 대체하므로 단순한 전체 영역 스피너 형태로 유지합니다.
 */
export const LazyLoadingFallback: React.FC<LazyLoadingFallbackProps> = ({ label = '화면을 준비하고 있습니다...' }) => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
        <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-6"></div>
        <p className="text-slate-500">{label}</p>
    </div>
);
