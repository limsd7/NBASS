// Internal helper to prepare print window with full style & media print rules
const preparePrintWindow = (content: HTMLElement, title: string) => {
  const printWindow = window.open('', '_blank', 'width=1200,height=900');
  if (!printWindow) {
    alert('팝업 차단이 설정되어 있습니다. 팝업 허용 후 다시 시도해 주세요.');
    return;
  }

  // Gather Styles from current document
  const styles: string[] = [];
  document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
    styles.push(link.outerHTML);
  });
  document.querySelectorAll('style').forEach(style => {
    styles.push(style.outerHTML);
  });

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="ko">
      <head>
        <title>${title}</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script src="https://cdn.tailwindcss.com"></script>
        ${styles.join('\n')}
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Pretendard:wght@400;600;700;800;900&display=swap');
          
          body { 
            background: white !important; 
            margin: 0; 
            padding: 0; 
            font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif !important;
            color: #0f172a;
          }
          
          .no-print { display: none !important; }
          .print-container { padding: 32px; max-width: 1200px; margin: 0 auto; width: 100%; }
          
          /* Preserve exact background colors and gradients */
          * { 
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important; 
            color-adjust: exact !important;
          }
          
          /* Page break controls for clean multi-page printing */
          .print-page-break { page-break-before: always !important; break-before: page !important; }
          .print-avoid-break { page-break-inside: avoid !important; break-inside: avoid !important; }
          
          @media print {
             @page {
               size: A4 portrait;
               margin: 10mm 10mm 10mm 10mm;
             }
             body { background: white !important; }
             .floating-print-btn { display: none !important; }
             .print-container { padding: 0 !important; max-width: 100% !important; width: 100% !important; }
             .shadow-sm, .shadow-md, .shadow-lg, .shadow-xl, .shadow-2xl { box-shadow: none !important; }
          }
          
          .floating-print-btn {
            position: fixed; top: 20px; right: 20px;
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            color: white; padding: 12px 28px;
            border-radius: 14px; font-weight: 800; cursor: pointer;
            box-shadow: 0 10px 25px -5px rgba(79, 70, 229, 0.4); 
            border: none; z-index: 10000;
            transition: all 0.2s ease;
            font-size: 15px;
          }
          .floating-print-btn:hover { transform: translateY(-2px); box-shadow: 0 15px 30px -5px rgba(79, 70, 229, 0.5); }
        </style>
      </head>
      <body>
        <button class="floating-print-btn no-print" onclick="window.print()">🖨️ 인쇄 / PDF 저장</button>
        <div class="print-container">
          ${content.outerHTML}
        </div>
        <script>
           window.onload = () => {
             setTimeout(() => {
                window.print();
             }, 800);
           };
        </script>
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
};

const processClonedElement = (original: HTMLElement, clone: HTMLElement) => {
  // Preserve Canvas (Recharts) and Form States
  const originalElements = original.querySelectorAll('canvas, input, textarea, select, svg');
  const cloneElements = clone.querySelectorAll('canvas, input, textarea, select, svg');

  originalElements.forEach((orig, index) => {
    const cloned = cloneElements[index];
    if (!cloned) return;

    if (orig instanceof HTMLCanvasElement && cloned instanceof HTMLCanvasElement) {
      try {
        const img = document.createElement('img');
        img.src = orig.toDataURL('image/png');
        img.className = orig.className;
        img.style.cssText = orig.style.cssText;
        cloned.parentNode?.replaceChild(img, cloned);
      } catch (e) {
        console.warn('Canvas conversion skipped:', e);
      }
    } else if (orig instanceof HTMLInputElement && cloned instanceof HTMLInputElement) {
      if (orig.type === 'checkbox' || orig.type === 'radio') {
        if (orig.checked) cloned.setAttribute('checked', 'checked');
      } else {
        cloned.setAttribute('value', orig.value);
      }
    } else if (orig instanceof HTMLTextAreaElement && cloned instanceof HTMLTextAreaElement) {
      cloned.textContent = orig.value;
    } else if (orig instanceof HTMLSelectElement && cloned instanceof HTMLSelectElement) {
      const selectedIdx = orig.selectedIndex;
      if (selectedIdx !== -1 && cloned.options[selectedIdx]) {
        cloned.options[selectedIdx].setAttribute('selected', 'selected');
      }
    }
  });

  // Remove Animation Classes to prevent initial hidden states in print
  const animatedElements = clone.querySelectorAll('.animate-in, .fade-in, .slide-in-from-bottom-4, .slide-in-from-top-4, .duration-500, .duration-300, .zoom-in-95');
  animatedElements.forEach(el => {
    el.classList.remove('animate-in', 'fade-in', 'slide-in-from-bottom-4', 'slide-in-from-top-4', 'duration-500', 'duration-300', 'zoom-in-95');
  });

  // Force height auto and visible overflow so content is not cut off
  if (clone.classList.contains('h-[90vh]')) clone.classList.remove('h-[90vh]');
  if (clone.classList.contains('overflow-hidden')) clone.classList.remove('overflow-hidden');
  clone.style.height = 'auto';
  clone.style.maxHeight = 'none';
  clone.style.overflow = 'visible';

  // Expand all details elements
  const detailsElements = clone.querySelectorAll('details');
  detailsElements.forEach(detail => {
    detail.setAttribute('open', 'true');
  });
};

export const printElement = (elementId: string, title: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return;
  }

  const clone = element.cloneNode(true) as HTMLElement;
  processClonedElement(element, clone);
  preparePrintWindow(clone, title);
};

export const printReport = (elementId: string, title: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return;
  }

  const contentContainer = document.createElement('div');
  const mainClone = element.cloneNode(true) as HTMLElement;
  processClonedElement(element, mainClone);
  contentContainer.appendChild(mainClone);

  // Include following sibling report cards if available
  let sibling = element.nextElementSibling;
  while (sibling) {
    const classList = sibling.className || '';
    if (classList.includes('fixed') || sibling.id === 'admin-panel') {
      break;
    }
    if (classList.includes('bg-white') || classList.includes('bg-gradient') ||
      classList.includes('rounded') || classList.includes('grid') ||
      classList.includes('border') || classList.includes('shadow')) {
      const siblingClone = sibling.cloneNode(true) as HTMLElement;
      processClonedElement(sibling as HTMLElement, siblingClone);
      contentContainer.appendChild(siblingClone);
    }
    sibling = sibling.nextElementSibling;
  }

  preparePrintWindow(contentContainer, title);
};
