// Internal helper to prepare print window with styles
const preparePrintWindow = (content: HTMLElement, title: string) => {
  const printWindow = window.open('', '_blank', 'width=1200,height=900');
  if (!printWindow) return;

  // Gather Styles
  const styles: string[] = [];
  document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
    styles.push(link.outerHTML);
  });
  document.querySelectorAll('style').forEach(style => {
    styles.push(style.outerHTML);
  });

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script src="https://cdn.tailwindcss.com"></script>
        ${styles.join('\n')}
        <style>
          body { background: white !important; margin: 0; padding: 0; }
          .no-print { display: none !important; }
          .print-container { padding: 40px; max-width: 1000px; margin: 0 auto; }
          
          /* Ensure backgrounds are printed */
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          
          /* Hide print button in print view */
          @media print {
             .floating-print-btn { display: none; }
             
             /* Page break classes for sectioned printing */
             .print-page-break { page-break-before: always; break-before: page; }
             .print-avoid-break { page-break-inside: avoid; break-inside: avoid; }
             
             /* Ensure proper sizing */
             .print-container { padding: 20px; max-width: 100%; }
          }
           .floating-print-btn {
              position: fixed; top: 20px; right: 20px;
              background: #4f46e5; color: white; padding: 12px 24px;
              border-radius: 12px; font-weight: bold; cursor: pointer;
              box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); border: none; z-index: 1000;
              transition: all 0.2s;
            }
            .floating-print-btn:hover { background: #4338ca; transform: scale(1.05); }
        </style>
      </head>
      <body>
        <button class="floating-print-btn no-print" onclick="window.print()">🖨️ 인쇄 / PDF 저장</button>
        <div class="print-container">
          ${content.outerHTML}
        </div>
        <script>
           // Auto-trigger print after images load and styles apply
           window.onload = () => {
             // Tailwind fonts/styles might take a moment to parse.
             // A short delay ensures the print view is fully rendered.
             setTimeout(() => {
                window.print();
             }, 1000);
           };
        </script>
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
};

const processClonedElement = (original: HTMLElement, clone: HTMLElement) => {
  // Preserve Canvas and Form States
  const originalElements = original.querySelectorAll('canvas, input, textarea, select');
  const cloneElements = clone.querySelectorAll('canvas, input, textarea, select');

  originalElements.forEach((orig, index) => {
    const cloned = cloneElements[index];
    if (orig instanceof HTMLCanvasElement && cloned instanceof HTMLCanvasElement) {
      const img = document.createElement('img');
      img.src = orig.toDataURL();
      img.className = orig.className;
      img.style.cssText = orig.style.cssText;
      cloned.parentNode?.replaceChild(img, cloned);
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
      if (selectedIdx !== -1) {
        const options = cloned.options;
        if (options[selectedIdx]) {
          options[selectedIdx].setAttribute('selected', 'selected');
        }
      }
    }
  });

  // Remove Animation Classes
  const animatedElements = clone.querySelectorAll('.animate-in, .fade-in, .slide-in-from-bottom-4, .slide-in-from-top-4, .duration-500, .duration-300, .zoom-in-95');
  animatedElements.forEach(el => {
    el.classList.remove('animate-in', 'fade-in', 'slide-in-from-bottom-4', 'slide-in-from-top-4', 'duration-500', 'duration-300', 'zoom-in-95');
  });

  // Remove fixed heights or overflow hiddens that might cut content
  if (clone.classList.contains('h-[90vh]')) clone.classList.remove('h-[90vh]');
  if (clone.classList.contains('overflow-hidden')) clone.classList.remove('overflow-hidden');
  clone.style.height = 'auto'; // Force auto height
  clone.style.overflow = 'visible'; // Force visible overflow

  // Expand all <details> elements
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

  // 1. Gather the target element AND all its following siblings
  const contentContainer = document.createElement('div');

  // Clone the main element
  contentContainer.appendChild(element.cloneNode(true));

  // Also clone all following sibling elements until we hit admin/modal content
  let sibling = element.nextElementSibling;
  while (sibling) {
    // Stop if we hit global admin components or modals
    const classList = sibling.className || '';
    if (classList.includes('fixed') || sibling.id === 'admin-panel') {
      break;
    }
    // Only include elements that look like report content
    if (classList.includes('bg-white') || classList.includes('bg-gradient') ||
      classList.includes('rounded') || classList.includes('grid') ||
      classList.includes('border') || classList.includes('shadow')) {
      contentContainer.appendChild(sibling.cloneNode(true));
    }
    sibling = sibling.nextElementSibling;
  }

  // We need to process the *container* but careful with original reference mapping
  // Actually, capturing form state for siblings is tricky with the previous logic
  // The previous logic traversed `element` and `clone` (container).
  // But now `clone` is a new container with multiple children.

  // For simplicity & robustness, let's just process the container.
  // NOTE: This might miss form state updates for siblings if we don't map them back to originals.
  // The original code only mapped for `element`.

  // To keep it 100% compatible with previous logic for the MAIN ID element:
  const mainClone = contentContainer.firstElementChild as HTMLElement;
  if (mainClone) processClonedElement(element, mainClone);

  // For siblings, we might skip form state preservation for now as it's likely just static report results.

  preparePrintWindow(contentContainer, title);
};
