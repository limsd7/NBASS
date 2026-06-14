/**
 * Print Layout Utilities
 * 
 * Provides constants and utilities for optimizing medical report printing
 * to A4 page sizes (210mm × 297mm) without modifying UI/UX content.
 */

// A4 Paper dimensions in millimeters
export const A4_WIDTH_MM = 210;
export const A4_HEIGHT_MM = 297;

// Print margins (adjustable)
export const PRINT_MARGIN_TOP_MM = 10;
export const PRINT_MARGIN_BOTTOM_MM = 10;
export const PRINT_MARGIN_LEFT_MM = 10;
export const PRINT_MARGIN_RIGHT_MM = 10;

// Usable content area
export const CONTENT_HEIGHT_MM = A4_HEIGHT_MM - PRINT_MARGIN_TOP_MM - PRINT_MARGIN_BOTTOM_MM;
export const CONTENT_WIDTH_MM = A4_WIDTH_MM - PRINT_MARGIN_LEFT_MM - PRINT_MARGIN_RIGHT_MM;

/**
 * CSS for print-optimized A4 pages
 * Ensures each page fills exactly one A4 sheet with proper breaks
 */
export const getPrintPageStyles = () => `
  /* A4 Page Setup */
  .page {
    width: ${A4_WIDTH_MM}mm !important;
    height: ${A4_HEIGHT_MM}mm !important;
    margin: 0 auto ${PRINT_MARGIN_BOTTOM_MM}mm !important;
    padding: ${PRINT_MARGIN_TOP_MM}mm !important;
    box-sizing: border-box;
    background-color: #f1f5f9 !important;
    page-break-after: always !important;
    display: flex !important;
    flex-direction: column !important;
    overflow: hidden; /* Prevent content overflow */
  }

  /* Force page break before specific sections */
  .page-break-before {
    page-break-before: always !important;
    break-before: page !important;
  }

  /* Report card fills the entire page */
  .report-card {
    background-color: white !important;
    border-radius: 0.75rem;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1) !important;
    border: none !important;
    border-top: 8px solid #1e40af !important;
    padding: 2.5rem !important;
    height: 100% !important;
    display: flex !important;
    flex-direction: column !important;
    overflow: hidden;
  }

  /* Content area should fill available space */
  .report-card > .flex-1 {
    flex: 1 1 auto !important;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  @media print {
    @page {
      size: A4;
      margin: 0;
    }

    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background-color: #f1f5f9 !important;
    }

    .page {
      margin: 0 !important;
      border: none !important;
      background-color: #f1f5f9 !important;
      page-break-inside: avoid;
      height: ${A4_HEIGHT_MM}mm !important;
    }

    .report-card {
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1) !important;
      background-color: white !important;
      page-break-inside: avoid;
    }

    /* Explicit page breaks only */
    .page-break-before {
      page-break-before: always !important;
      break-before: page !important;
    }

    /* Prevent awkward breaks in specific elements */
    h2, h3, h4 {
      page-break-after: avoid !important;
      page-break-inside: avoid !important;
    }

    .grid-cols-3, .grid-cols-4 {
      page-break-inside: avoid !important;
    }

    /* Ensure colors print correctly */
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
  }
`;

/**
 * Page numbering helper
 */
export const formatPageNumber = (pageNum: number): string => {
    return String(pageNum).padStart(2, '0');
};

/**
 * Check if content should be split across multiple pages
 * (Future enhancement for dynamic splitting)
 */
export const shouldSplitContent = (contentHeight: number): boolean => {
    return contentHeight > CONTENT_HEIGHT_MM;
};
