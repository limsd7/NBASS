import type { AssessmentResult } from '../../../types';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MedicalReport } from '../../reports/MedicalReport';
import type { MembershipTier } from '../../../utils/featureGate';

export interface PrintReportExtras {
    config?: any;
    strategies?: any;
    selectedSubjectOptions?: any;
    adminMemo?: string;
    recommendedProducts?: any[];
    isPremiumOrAbove?: boolean;
    membershipTier?: MembershipTier;
}

// 새 창에 완성 HTML을 쓰는 공통 인쇄 창 (네트워크 무의존, 인라인 스타일만)
export const openHtmlPrintWindow = (title: string, printContent: string): void => {
        // 1. Gather ONLY compiled inline <style> elements from current document (0 network requests, instantly available in memory)
        // Never copy external <link rel="stylesheet"> which cause slow Google font downloads or 404s on relative paths in about:blank!
        const headStyles = Array.from(document.querySelectorAll('head style'))
            .map(el => el.outerHTML)
            .join('\n');

        // 2. High-performance local print reset styles (no external blocking @import or slow CDN links)
        const printStyle = `
            @page { 
                size: A4 portrait; 
                margin: 0; 
            }
            html, body { 
                margin: 0; 
                padding: 0; 
                background: #ffffff !important; 
                -webkit-print-color-adjust: exact !important; 
                print-color-adjust: exact !important;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Pretendard", "Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", "맑은 고딕", sans-serif !important;
            }
            .no-print, .floating-print-btn { display: none !important; }
            body { overflow-y: auto; }
            .floating-print-btn {
                position: fixed; top: 20px; right: 20px;
                background: #1e293b; color: white; padding: 12px 24px;
                border-radius: 9999px; font-weight: bold; cursor: pointer;
                box-shadow: 0 10px 15px -3px rgba(0,0,0,0.2); border: none; z-index: 1000;
                transition: all 0.2s;
                font-size: 14px;
            }
            .floating-print-btn:hover { transform: scale(1.05); background: #0f172a; }
        `;

        const printWindow = window.open('', '_blank', 'width=1200,height=900');
        if (printWindow) {
            printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="ko">
          <head>
            <meta charset="utf-8" />
            <base href="${window.location.origin}/" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>${title}</title>
            ${headStyles}
            <style>
              ${printStyle}
            </style>
          </head>
          <body>
            <button class="floating-print-btn" onclick="window.print()">🖨️ 인쇄 / PDF 저장</button>
            <div id="print-root">
              ${printContent}
            </div>
            <script>
              // Zero network dependencies: images are local or removed, styles are inlined
              var printed = false;
              function triggerPrint() {
                if (printed) return;
                printed = true;
                setTimeout(function() {
                  window.print();
                }, 50);
              }

              if (document.readyState === 'complete') {
                triggerPrint();
              } else {
                window.addEventListener('load', triggerPrint);
                setTimeout(triggerPrint, 250);
              }
            </script>
          </body>
        </html>
      `);
            printWindow.document.close();
            printWindow.focus();
        }
};

// Moved verbatim from ResultsView.tsx handlePrintWindow (no behavior change)
export const openResultPrintWindow = (result: AssessmentResult): void => {
        // [변경] 인쇄/PDF 저장은 유료 전용이 아니라 '심층 분석 대시보드'를 인쇄물로 보는 기능 → Free 모드에서도 허용
        // Target the Medical Report component (works in both dashboard view and report view)
        const reportElement = document.getElementById('medical-report-container') || document.querySelector('.medical-report-root');
        if (!reportElement) {
            alert('보고서 내용을 불러오는 중입니다. 잠시 후 다시 시도해 주세요.');
            return;
        }

        // Clean content: remove any lingering external @import fonts
        let printContent = reportElement.innerHTML;
        printContent = printContent.replace(/@import\s+url\([^)]+\);?/gi, '');

        openHtmlPrintWindow(
            `NBASS 정밀 진단 보고서 : 등급표시 - ${result.student.name}`,
            printContent
        );
};

// 정밀 종합 리포트(16P 전문) 직접 인쇄: 어느 화면에서든 전체 MedicalReport를
// 정적 렌더링해 인쇄 창으로 연다 (DOM 컨테이너 불필요, 클릭 태스크 내 동기 실행)
export const printAssessmentReport = (result: AssessmentResult, extras: PrintReportExtras = {}): void => {
    const html = renderToStaticMarkup(
        createElement(MedicalReport, {
            result,
            config: extras.config,
            strategies: extras.strategies,
            selectedSubjectOptions: extras.selectedSubjectOptions,
            adminMemo: extras.adminMemo,
            recommendedProducts: extras.recommendedProducts,
            isPremiumOrAbove: extras.isPremiumOrAbove,
            membershipTier: extras.membershipTier,
        })
    );
    openHtmlPrintWindow(
        `NBASS 정밀 진단 보고서 : 등급표시 - ${result.student.name}`,
        html.replace(/@import\s+url\([^)]+\);?/gi, '')
    );
};
