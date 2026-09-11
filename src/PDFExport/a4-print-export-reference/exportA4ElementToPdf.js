/**
 * Reference copy of the current CoverLetter A4 print export pipeline.
 *
 * This file is intentionally not imported anywhere in the app.
 * It exists only as reusable documentation code for future projects.
 *
 * The implementation is copied from the active Editor print flow and then
 * lifted into a standalone helper so the logic is easier to reuse.
 */

const waitForImages = async (root) => {
  const images = Array.from(root.querySelectorAll('img'));
  const pendingImages = images.filter((image) => !image.complete || image.naturalWidth === 0);

  await Promise.all(
    pendingImages.map(
      (image) =>
        new Promise((resolve) => {
          const finish = () => resolve();
          image.addEventListener('load', finish, { once: true });
          image.addEventListener('error', finish, { once: true });
        })
    )
  );
};

const cloneActiveStylesheets = () =>
  Array.from(document.querySelectorAll('style, link[rel="stylesheet"]')).map((node) =>
    node.cloneNode(true)
  );

const normalizeExportPreview = (previewNode) => {
  if (!(previewNode instanceof Element)) return;

  previewNode.style.setProperty('background', '#ffffff', 'important');
  previewNode.style.setProperty('background-color', '#ffffff', 'important');
  previewNode.style.setProperty('box-shadow', 'none', 'important');
  previewNode.style.setProperty('filter', 'none', 'important');
};

const prepareExportPreview = (previewNode, templateId) => {
  if (!(previewNode instanceof Element)) return;

  normalizeExportPreview(previewNode);
  previewNode.setAttribute('data-export-mode', 'print');

  if (templateId) {
    previewNode.setAttribute('data-template', templateId);
  }

  previewNode.style.width = '210mm';
  previewNode.style.height = 'auto';
  previewNode.style.minHeight = '297mm';
  previewNode.style.maxHeight = 'none';
  previewNode.style.margin = '0';
  previewNode.style.boxSizing = 'border-box';
  previewNode.style.boxShadow = 'none';
  previewNode.style.overflow = 'hidden';

  previewNode.querySelectorAll('[contenteditable="true"]').forEach((node) => {
    node.setAttribute('contenteditable', 'false');
  });

  previewNode.querySelectorAll('[data-editor-body="true"]').forEach((node) => {
    node.removeAttribute('data-editor-body');
  });
};

const waitForPrintStyles = async (printDocument) => {
  const stylesheetLinks = Array.from(printDocument.querySelectorAll('link[rel="stylesheet"]'));

  await Promise.all(
    stylesheetLinks.map(
      (link) =>
        new Promise((resolve) => {
          if (link.sheet) {
            resolve();
            return;
          }

          const finish = () => resolve();
          link.addEventListener('load', finish, { once: true });
          link.addEventListener('error', finish, { once: true });
        })
    )
  );
};

const createPrintStyles = () => `
  @page {
    size: A4;
    margin: 0;
  }

  html, body {
    margin: 0;
    padding: 0;
    background: #ffffff;
  }

  body {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .print-root {
    width: 210mm;
    min-height: 297mm;
    margin: 0 auto;
    background: #ffffff;
    overflow: hidden;
  }

  .print-fit-shell {
    width: 210mm;
    min-height: 297mm;
    overflow: hidden;
  }

  #cover-letter-preview {
    width: 210mm !important;
    min-height: 297mm !important;
    height: auto !important;
    max-height: none !important;
    margin: 0 !important;
    box-sizing: border-box !important;
    box-shadow: none !important;
    filter: none !important;
    overflow: hidden !important;
    background: #ffffff !important;
    background-color: #ffffff !important;
  }

  #cover-letter-preview[data-export-mode="print"] {
    background: #ffffff !important;
    background-color: #ffffff !important;
  }

  #cover-letter-preview[data-template="modern-block"][data-export-mode="print"] .modern-block-sidebar {
    background: #ffffff !important;
    background-color: #ffffff !important;
  }

  #cover-letter-preview[data-export-mode="print"] [data-pdf-bg="white"] {
    background: #ffffff !important;
    background-color: #ffffff !important;
  }

  #cover-letter-preview[data-export-mode="print"] .export-no-shadow,
  #cover-letter-preview[data-export-mode="print"] [class*="shadow"] {
    box-shadow: none !important;
  }

  * {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
`;

/**
 * Print an already-rendered A4 HTML preview as a PDF through the browser print dialog.
 *
 * @param {Object} options
 * @param {Element} options.sourceElement - The live DOM node to clone, usually #cover-letter-preview.
 * @param {string} [options.filename='document.pdf'] - Print window title / suggested file name.
 * @param {string} [options.templateId] - Optional template identifier for template-specific print overrides.
 */
export const exportA4ElementToPdf = async ({
  sourceElement,
  filename = 'document.pdf',
  templateId,
}) => {
  if (!(sourceElement instanceof Element)) {
    throw new Error('exportA4ElementToPdf requires a valid sourceElement');
  }

  const exportElement = sourceElement.cloneNode(true);
  prepareExportPreview(exportElement, templateId);
  exportElement.style.overflow = 'hidden';

  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.opacity = '0';
  iframe.style.pointerEvents = 'none';
  document.body.appendChild(iframe);

  const printDocument = iframe.contentDocument;
  const iframeWindow = iframe.contentWindow;

  if (!printDocument || !iframeWindow) {
    iframe.remove();
    throw new Error('Could not access print iframe');
  }

  printDocument.open();
  printDocument.write(
    '<!doctype html><html><head></head><body><div class="print-root"><div class="print-fit-shell"></div></div></body></html>'
  );
  printDocument.close();

  const head = printDocument.head;
  if (!head) {
    iframe.remove();
    throw new Error('Could not create print document head');
  }

  const base = printDocument.createElement('base');
  base.href = document.baseURI;
  head.appendChild(base);

  const meta = printDocument.createElement('meta');
  meta.setAttribute('charset', 'utf-8');
  head.appendChild(meta);

  const title = printDocument.createElement('title');
  title.textContent = filename;
  head.appendChild(title);

  cloneActiveStylesheets().forEach((node) => {
    head.appendChild(node);
  });

  const printStyles = printDocument.createElement('style');
  printStyles.textContent = createPrintStyles();
  head.appendChild(printStyles);

  const mountNode = printDocument.querySelector('.print-fit-shell');
  if (!mountNode) {
    iframe.remove();
    throw new Error('Could not find print mount node');
  }

  mountNode.appendChild(exportElement);

  await waitForPrintStyles(printDocument);
  await iframeWindow.document.fonts?.ready;
  await waitForImages(printDocument);
  await new Promise((resolve) =>
    iframeWindow.requestAnimationFrame(() =>
      iframeWindow.requestAnimationFrame(resolve)
    )
  );

  const cleanup = () => {
    window.setTimeout(() => iframe.remove(), 250);
  };

  iframeWindow.addEventListener('afterprint', cleanup, { once: true });
  iframeWindow.focus();
  iframeWindow.print();
};

