import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

export interface PrintOptions {
  title?: string;
  landscape?: boolean;
  filename?: string;
  onStart?: () => void;
  onComplete?: () => void;
  onError?: (err: unknown) => void;
}

/**
 * Visual feedback toast for print operations
 */
export function showPrintToast(
  message: string,
  type: 'info' | 'success' | 'warning' = 'info',
  durationMs: number = 4000
) {
  const existingToast = document.getElementById('print-feedback-toast');
  if (existingToast && existingToast.parentNode) {
    existingToast.parentNode.removeChild(existingToast);
  }

  const toast = document.createElement('div');
  toast.id = 'print-feedback-toast';
  toast.className = 'no-print';
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 99999;
    padding: 12px 18px;
    border-radius: 12px;
    font-family: 'Kantumruy Pro', 'Siemreap', system-ui, sans-serif;
    font-size: 13px;
    font-weight: 600;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.2);
    display: flex;
    align-items: center;
    gap: 10px;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    transform: translateY(20px);
    opacity: 0;
    max-width: 90vw;
  `;

  if (type === 'success') {
    toast.style.backgroundColor = '#065f46';
    toast.style.color = '#ffffff';
    toast.style.border = '1px solid #059669';
  } else if (type === 'warning') {
    toast.style.backgroundColor = '#92400e';
    toast.style.color = '#ffffff';
    toast.style.border = '1px solid #d97706';
  } else {
    toast.style.backgroundColor = '#1e293b';
    toast.style.color = '#ffffff';
    toast.style.border = '1px solid #334155';
  }

  // Icon SVG
  const iconSvg = type === 'success'
    ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>`
    : type === 'warning'
    ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`
    : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>`;

  toast.innerHTML = `
    <span style="display: flex; align-items: center; justify-content: center; shrink: 0;">${iconSvg}</span>
    <span>${message}</span>
  `;

  document.body.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';
  });

  // Auto remove
  setTimeout(() => {
    toast.style.transform = 'translateY(20px)';
    toast.style.opacity = '0';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, durationMs);
}

/**
 * Fallback to high-resolution A4 PDF generation when browser print dialog is blocked
 * by sandboxed iframes or permissions
 */
async function fallbackPdfPrint(
  targetElement: HTMLElement,
  options: PrintOptions = {}
): Promise<void> {
  const orientation = options.landscape ? 'landscape' : 'portrait';
  const filename = options.filename || `${options.title || 'ឯកសារបោះពុម្ព'}.pdf`;

  showPrintToast('កំពុងបង្កើតឯកសារ PDF សម្រាប់បោះពុម្ព...', 'info', 5000);

  // Clone element to prevent style alterations on the active DOM
  const clone = targetElement.cloneNode(true) as HTMLElement;
  clone.style.position = 'fixed';
  clone.style.top = '-9999px';
  clone.style.left = '-9999px';
  clone.style.width = options.landscape ? '280mm' : '195mm';
  clone.style.backgroundColor = '#ffffff';
  clone.style.color = '#000000';
  clone.style.padding = '10mm';
  clone.style.boxSizing = 'border-box';
  clone.style.zIndex = '-9999';

  // Remove any no-print items in clone
  const noPrints = clone.querySelectorAll('.no-print, .print\\:hidden, [data-no-print="true"]');
  noPrints.forEach(el => el.remove());

  document.body.appendChild(clone);

  try {
    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const pdf = new jsPDF({
      unit: 'mm',
      format: 'a4',
      orientation: orientation,
    });

    const marginMm = [8, 8, 8, 8];
    const [marginTop, marginRight, marginBottom, marginLeft] = marginMm;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const innerWidth = pageWidth - marginLeft - marginRight;
    const innerHeight = pageHeight - marginTop - marginBottom;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const pageSlicePx = Math.floor(canvasWidth * (innerHeight / innerWidth));
    const totalPages = Math.max(1, Math.ceil(canvasHeight / pageSlicePx));

    for (let page = 0; page < totalPages; page++) {
      if (page > 0) {
        pdf.addPage('a4', orientation);
      }

      const sourceY = page * pageSlicePx;
      const sourceHeight = Math.min(pageSlicePx, canvasHeight - sourceY);

      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = canvasWidth;
      sliceCanvas.height = sourceHeight;
      const sliceCtx = sliceCanvas.getContext('2d');

      if (sliceCtx) {
        sliceCtx.fillStyle = '#ffffff';
        sliceCtx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
        sliceCtx.drawImage(
          canvas,
          0, sourceY, canvasWidth, sourceHeight,
          0, 0, canvasWidth, sourceHeight
        );

        const imgData = sliceCanvas.toDataURL('image/jpeg', 0.98);
        const renderedHeight = (sourceHeight / canvasWidth) * innerWidth;
        pdf.addImage(imgData, 'JPEG', marginLeft, marginTop, innerWidth, renderedHeight);
      }
    }

    pdf.save(filename);
    showPrintToast('បានទាញយកឯកសារ PDF សម្រាប់បោះពុម្ពរួចរាល់!', 'success', 4000);
  } finally {
    if (clone.parentNode) {
      clone.parentNode.removeChild(clone);
    }
  }
}

/**
 * Universal print handler that prints a specified DOM element cleanly
 * 1. Tries hidden iframe print with cloned document styles & Khmer fonts
 * 2. If browser blocks iframe printing, tries standard window.print()
 * 3. If direct printing is blocked by sandboxed iframe environment, automatically
 *    generates and downloads high-definition A4 PDF ready for print.
 */
export async function printElement(
  targetElementOrId: HTMLElement | string,
  options: PrintOptions = {}
): Promise<boolean> {
  options.onStart?.();

  let targetElement: HTMLElement | null = null;
  if (typeof targetElementOrId === 'string') {
    targetElement = document.getElementById(targetElementOrId);
  } else {
    targetElement = targetElementOrId;
  }

  if (!targetElement) {
    console.error('Target element for print not found:', targetElementOrId);
    options.onError?.(new Error('Target element not found'));
    showPrintToast('មិនអាចស្វែងរកទិន្នន័យសម្រាប់បោះពុម្ពបានទេ', 'warning');
    return false;
  }

  showPrintToast('កំពុងបើកផ្ទាំងបោះពុម្ព...', 'info', 2500);

  // Method 1: Try printing through an isolated hidden iframe
  try {
    const iframe = document.createElement('iframe');
    iframe.id = 'universal-print-iframe';
    iframe.style.position = 'fixed';
    iframe.style.top = '-9999px';
    iframe.style.left = '-9999px';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) {
      throw new Error('Unable to access iframe document');
    }

    // Collect all head stylesheets and style tags
    let stylesHtml = '';
    document.querySelectorAll('link[rel="stylesheet"], style').forEach(el => {
      stylesHtml += el.outerHTML + '\n';
    });

    const pageOrientation = options.landscape ? 'A4 landscape' : 'A4 portrait';

    const printStyles = `
      <style>
        @page {
          size: ${pageOrientation};
          margin: 10mm 8mm;
        }
        *, *::before, *::after {
          box-sizing: border-box;
        }
        body {
          margin: 0 !important;
          padding: 8px !important;
          background: #ffffff !important;
          color: #000000 !important;
          font-family: 'Kantumruy Pro', 'Siemreap', system-ui, -apple-system, sans-serif !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          font-size: 11pt;
        }
        .no-print, .print\\:hidden, [data-no-print="true"] {
          display: none !important;
        }
        table {
          width: 100% !important;
          border-collapse: collapse !important;
          page-break-inside: auto;
        }
        tr {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        th, td {
          border-color: #334155 !important;
        }
        thead {
          display: table-header-group !important;
        }
        tfoot {
          display: table-footer-group !important;
        }
        .page-break {
          page-break-after: always;
        }
      </style>
    `;

    // Clone target HTML
    const clone = targetElement.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('.no-print, .print\\:hidden, [data-no-print="true"]').forEach(el => el.remove());

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="km">
        <head>
          <meta charset="utf-8">
          <title>${options.title || 'បោះពុម្ពឯកសារ'}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Kantumruy+Pro:ital,wght@0,300..700;1,300..700&family=Moul&family=Siemreap&display=swap" rel="stylesheet">
          ${stylesHtml}
          ${printStyles}
        </head>
        <body class="font-khmer">
          ${clone.outerHTML}
        </body>
      </html>
    `);
    doc.close();

    // Give browser a short moment to parse CSS & fonts
    await new Promise(resolve => setTimeout(resolve, 350));

    let printSucceeded = false;
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      printSucceeded = true;
    } catch (iframeErr) {
      console.warn('Iframe print failed or blocked:', iframeErr);
      printSucceeded = false;
    }

    // Cleanup iframe after delay
    setTimeout(() => {
      try {
        if (iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
      } catch (_) {}
    }, 2000);

    if (printSucceeded) {
      options.onComplete?.();
      showPrintToast('បានបើកផ្ទាំងបោះពុម្ពរួចរាល់', 'success', 3000);
      return true;
    }
  } catch (err) {
    console.warn('Iframe print setup encountered an issue:', err);
  }

  // Method 2: Try direct window.print()
  try {
    window.print();
    options.onComplete?.();
    return true;
  } catch (winErr: unknown) {
    console.warn('Direct window.print() blocked by sandbox:', winErr);

    // Method 3: Graceful fallback to PDF download so the user ALWAYS gets their document printed
    try {
      await fallbackPdfPrint(targetElement, options);
      options.onComplete?.();
      return true;
    } catch (pdfErr) {
      console.error('All print methods failed:', pdfErr);
      options.onError?.(pdfErr);
      showPrintToast('មិនអាចដំណើរការបោះពុម្ពបានទេ', 'warning');
      return false;
    }
  }
}
