const A4_RATIO = 297 / 210;

export const DEFAULT_A4_BLOCK_SELECTOR = [
  '.manual-page-break',
  'header',
  'main > *',
  'aside > *',
  'article > *',
  '.experience-item',
  '.project-item',
  '.education-item',
  '.volunteering-item',
  '[data-pdf-block]',
  '[data-pdf-keep-with-next]',
  'h1',
  'h2',
  'h3',
  'h4',
  '[class*="space-y-"] > *',
  '[class*="grid-cols-"] > *',
  'section',
  'ul > li',
  'ol > li',
].join(', ');

const PRINT_ROOT_CLASS = 'codex-print-root';
const PRINT_ROOT_ACTIVE_CLASS = 'is-active';
const PRINT_STYLE_ID = 'codex-a4-print-export-style';

export const getA4PageHeightPx = (width) => Math.floor(width * A4_RATIO);

const waitForStylesheets = async (ownerDocument) => {
  if (!ownerDocument) return;

  const stylesheetPromises = Array.from(
    ownerDocument.querySelectorAll('link[rel="stylesheet"]')
  ).map((link) => {
    if (link.sheet) return Promise.resolve();

    return new Promise((resolve) => {
      const finish = () => resolve();
      link.addEventListener('load', finish, { once: true });
      link.addEventListener('error', finish, { once: true });
      window.setTimeout(finish, 3000);
    });
  });

  await Promise.all(stylesheetPromises);
};

export const waitForEmbeddedAssets = async (root) => {
  if (!(root instanceof HTMLElement)) return;

  const ownerDocument = root.ownerDocument || document;
  const imagePromises = Array.from(root.querySelectorAll('img')).map((img) => {
    if (img.complete) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      img.addEventListener('load', resolve, { once: true });
      img.addEventListener('error', resolve, { once: true });
    });
  });

  const fontPromise = ownerDocument.fonts?.ready ?? Promise.resolve();

  await Promise.all([
    fontPromise,
    waitForStylesheets(ownerDocument),
    ...imagePromises,
    new Promise((resolve) => window.requestAnimationFrame(() => window.requestAnimationFrame(resolve))),
  ]);
};

const getBlockPriority = (node) => {
  if (!(node instanceof HTMLElement)) return 0;
  if (node.classList.contains('manual-page-break')) return 100;
  if (
    node.matches(
      '[data-pdf-block], .experience-item, .project-item, .education-item, .volunteering-item'
    )
  ) {
    return 80;
  }
  if (node.matches('article > *')) return 75;
  if (node.matches('ul > li, ol > li')) return 65;
  if (node.matches('[data-pdf-keep-with-next], h1, h2, h3, h4')) return 60;
  if (node.matches('main > *, aside > *, section')) return 45;
  return 30;
};

const collectSemanticBlocks = (root, scale = 1, blockSelector = DEFAULT_A4_BLOCK_SELECTOR) => {
  const rootRect = root.getBoundingClientRect();

  return Array.from(root.querySelectorAll(blockSelector))
    .filter((node) => node instanceof HTMLElement)
    .map((node) => {
      const rect = node.getBoundingClientRect();
      const isManualBreak = node.classList.contains('manual-page-break');
      const top = Math.max(0, Math.round((rect.top - rootRect.top) * scale));
      const bottom = Math.max(top, Math.round((rect.bottom - rootRect.top) * scale));

      return {
        node,
        top,
        bottom,
        height: Math.max(0, Math.round(rect.height * scale)),
        priority: getBlockPriority(node),
        isHeading: node.matches('[data-pdf-keep-with-next], h1, h2, h3, h4'),
        isListItem: node.matches('ul > li, ol > li'),
        isManualBreak,
      };
    })
    .filter((block) => block.isManualBreak || block.bottom > block.top)
    .sort((a, b) => a.top - b.top || b.priority - a.priority || a.height - b.height);
};

export const calculatePageBreaks = (
  root,
  pageHeightPx,
  {
    manualBreaks = [],
    scale = 1,
    explicitContentHeight,
    blockSelector = DEFAULT_A4_BLOCK_SELECTOR,
  } = {}
) => {
  if (!(root instanceof HTMLElement) || !pageHeightPx) return [];

  const contentHeight = explicitContentHeight || Math.round(root.scrollHeight * scale);
  const minPageFill = Math.floor(pageHeightPx * 0.55);
  const significantBlockHeight = Math.floor(24 * scale);
  const maxEarlyBreakGap = Math.floor(pageHeightPx * 0.2);
  const semanticBlocks = collectSemanticBlocks(root, scale, blockSelector);
  const measuredManualBreaks = semanticBlocks
    .filter((block) => block.isManualBreak)
    .map((block) => block.top);
  const sortedManualBreaks = [...manualBreaks, ...measuredManualBreaks]
    .map((value) => Math.round(value))
    .filter((value) => value > 0 && value < contentHeight - 1)
    .filter((value, index, values) => values.indexOf(value) === index)
    .sort((a, b) => a - b);

  const pickAutomaticPageEnd = (pageStart, pageTargetEnd) => {
    const blocksInRange = semanticBlocks.filter(
      (block) =>
        !block.isManualBreak &&
        block.bottom > pageStart &&
        block.top < pageTargetEnd
    );

    const crossingBlocks = blocksInRange
      .filter(
        (block) =>
          block.top < pageTargetEnd &&
          block.bottom > pageTargetEnd &&
          block.top - pageStart >= minPageFill
      )
      .sort((a, b) => b.priority - a.priority || a.top - b.top || a.height - b.height);

    const keepTogetherBlock = crossingBlocks.find(
      (block) => block.height <= pageHeightPx * 0.92 && !block.isHeading
    );

    if (keepTogetherBlock) {
      return keepTogetherBlock.top;
    }

    const oversizedBlock = crossingBlocks.find(
      (block) => block.priority >= 75 && block.height > pageHeightPx * 0.92
    );

    if (oversizedBlock) {
      const bulletBoundary = semanticBlocks
        .filter(
          (block) =>
            block.isListItem &&
            block.top > oversizedBlock.top &&
            block.top < pageTargetEnd &&
            block.top - pageStart >= minPageFill
        )
        .sort((a, b) => b.top - a.top)[0];

      if (bulletBoundary) {
        return bulletBoundary.top;
      }
    }

    const headingNearPageEnd = blocksInRange
      .filter(
        (block) =>
          block.isHeading &&
          block.top - pageStart >= minPageFill &&
          pageTargetEnd - block.top <= maxEarlyBreakGap
      )
      .sort((a, b) => b.top - a.top)[0];

    if (headingNearPageEnd) {
      return headingNearPageEnd.top;
    }

    const nextBlockStart = blocksInRange
      .filter(
        (block) =>
          block.height >= significantBlockHeight &&
          block.top > pageStart + minPageFill &&
          pageTargetEnd - block.top <= maxEarlyBreakGap
      )
      .sort((a, b) => b.priority - a.priority || b.top - a.top)[0];

    if (nextBlockStart) {
      return nextBlockStart.top;
    }

    const completedBlock = [...blocksInRange]
      .filter(
        (block) =>
          block.height >= significantBlockHeight &&
          block.bottom <= pageTargetEnd &&
          block.bottom - pageStart >= minPageFill
      )
      .sort((a, b) => b.bottom - a.bottom || b.priority - a.priority)[0];

    return completedBlock ? completedBlock.bottom : pageTargetEnd;
  };

  const pageBreaks = [];
  let pageStart = 0;
  let guard = 0;

  while (pageStart + 1 < contentHeight && guard < 100) {
    guard += 1;
    const pageTargetEnd = Math.min(pageStart + pageHeightPx, contentHeight);
    if (pageTargetEnd >= contentHeight) break;

    const nextManualBreak = sortedManualBreaks.find(
      (point) =>
        point > pageStart + Math.floor(pageHeightPx * 0.2) &&
        point <= pageTargetEnd
    );

    const chosenEnd = nextManualBreak || pickAutomaticPageEnd(pageStart, pageTargetEnd);
    const safeEnd = Math.min(Math.max(Math.round(chosenEnd), pageStart + 1), contentHeight);

    if (safeEnd >= contentHeight) break;

    pageBreaks.push(safeEnd);
    pageStart = safeEnd;
  }

  return pageBreaks;
};

const ensurePrintStyles = () => {
  if (document.getElementById(PRINT_STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = PRINT_STYLE_ID;
  style.textContent = `
    .${PRINT_ROOT_CLASS} {
      display: none;
    }

    .${PRINT_ROOT_CLASS}.${PRINT_ROOT_ACTIVE_CLASS} {
      display: block;
      position: fixed;
      inset: 0;
      visibility: hidden;
      opacity: 0;
      pointer-events: none;
    }

    @page {
      size: A4;
      margin: 0;
    }

    @media print {
      html,
      body {
        margin: 0 !important;
        padding: 0 !important;
        background: #ffffff !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      body > *:not(.${PRINT_ROOT_CLASS}.${PRINT_ROOT_ACTIVE_CLASS}) {
        display: none !important;
      }

      body * {
        visibility: hidden !important;
      }

      .${PRINT_ROOT_CLASS}.${PRINT_ROOT_ACTIVE_CLASS},
      .${PRINT_ROOT_CLASS}.${PRINT_ROOT_ACTIVE_CLASS} * {
        visibility: visible !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }

      .${PRINT_ROOT_CLASS}.${PRINT_ROOT_ACTIVE_CLASS} {
        display: block !important;
        position: static !important;
        inset: auto !important;
        left: auto !important;
        top: auto !important;
        right: auto !important;
        bottom: auto !important;
        width: auto !important;
        max-width: none !important;
        height: auto !important;
        background: #ffffff !important;
        visibility: visible !important;
        opacity: 1 !important;
        z-index: 2147483647 !important;
        overflow: visible !important;
      }

      .codex-print-pages {
        width: 210mm !important;
        margin: 0 auto !important;
        background: transparent !important;
      }

      .codex-print-page {
        width: 210mm !important;
        height: 297mm !important;
        margin: 0 auto !important;
        background: transparent !important;
        position: relative !important;
        overflow: hidden !important;
        page-break-after: always !important;
        break-after: page !important;
      }

      .codex-print-page:last-child {
        page-break-after: auto !important;
        break-after: auto !important;
      }

      .codex-print-page-viewport {
        position: relative !important;
        width: 210mm !important;
        height: 297mm !important;
        overflow: hidden !important;
        background: transparent !important;
      }

      .codex-print-page-content {
        position: relative !important;
        width: 210mm !important;
        overflow: hidden !important;
      }

      .codex-print-page-content > * {
        width: 210mm !important;
        box-shadow: none !important;
      }
    }
  `;

  document.head.appendChild(style);
};

const normalizeLinkHref = (value, type) => {
  const normalized = String(value || '').trim();
  if (!normalized) return '';

  if (type === 'email') {
    return normalized.startsWith('mailto:') ? normalized : 'mailto:' + normalized;
  }

  if (/^(https?:|mailto:|tel:)/i.test(normalized)) {
    return normalized;
  }

  return 'https://' + normalized.replace(/^\/+/, '');
};

const makePrintContactLinksClickable = (root) => {
  if (!(root instanceof HTMLElement)) return;

  const linkFields = [
    { selector: '[data-edit-path="personal.email"]', type: 'email' },
    { selector: '[data-edit-path="personal.linkedin"]', type: 'url' },
    { selector: '[data-edit-path="personal.github"]', type: 'url' },
    { selector: '[data-edit-path="personal.website"]', type: 'url' },
    { selector: '[data-edit-path="personal.portfolio"]', type: 'url' },
  ];

  linkFields.forEach(({ selector, type }) => {
    root.querySelectorAll(selector).forEach((node) => {
      if (!(node instanceof HTMLElement) || node.closest('a[href]') || node.querySelector('a[href]')) {
        return;
      }

      const href = normalizeLinkHref(node.textContent, type);
      if (!href) return;

      const anchor = node.ownerDocument.createElement('a');
      anchor.href = href;
      anchor.innerHTML = node.innerHTML;
      anchor.style.color = 'inherit';
      anchor.style.font = 'inherit';
      anchor.style.textDecoration = 'inherit';
      anchor.style.letterSpacing = 'inherit';
      anchor.style.lineHeight = 'inherit';

      node.replaceChildren(anchor);
    });
  });
};

const buildPrintClone = (sourceNode, { minimumHeightPx } = {}) => {
  if (!(sourceNode instanceof HTMLElement)) return null;

  const printClone = sourceNode.cloneNode(true);
  printClone.classList.add('codex-print-document');
  printClone.style.width = '210mm';
  printClone.style.minHeight = minimumHeightPx
    ? Math.ceil(minimumHeightPx) + 'px'
    : '297mm';
  printClone.style.height = 'auto';
  printClone.style.transform = 'none';
  printClone.style.boxShadow = 'none';
  printClone.style.overflow = 'visible';
  printClone.style.setProperty('-webkit-print-color-adjust', 'exact');
  printClone.style.setProperty('print-color-adjust', 'exact');
  makePrintContactLinksClickable(printClone);
  printClone.querySelectorAll('[data-codex-spacer="true"]').forEach((node) => {
    node.style.display = 'block';
  });
  printClone.querySelectorAll('.manual-page-break').forEach((node) => {
    node.style.display = 'none';
    node.style.breakBefore = 'auto';
    node.style.pageBreakBefore = 'auto';
  });

  return printClone;
};

const copySurfaceBackground = (sourceNode, targetNode) => {
  if (!(sourceNode instanceof HTMLElement) || !(targetNode instanceof HTMLElement)) return;

  const computedStyle = window.getComputedStyle(sourceNode);
  targetNode.style.setProperty('background-color', computedStyle.backgroundColor, 'important');
  targetNode.style.setProperty('background-image', computedStyle.backgroundImage, 'important');
  targetNode.style.setProperty('background-position', computedStyle.backgroundPosition, 'important');
  targetNode.style.setProperty('background-repeat', computedStyle.backgroundRepeat, 'important');
  targetNode.style.setProperty('background-size', computedStyle.backgroundSize, 'important');
  targetNode.style.setProperty('-webkit-print-color-adjust', 'exact');
  targetNode.style.setProperty('print-color-adjust', 'exact');
};

export const findExistingA4Pages = (sourceNode) => {
  if (!(sourceNode instanceof HTMLElement)) return [];

  // Completeness documents combine the original template with one or more
  // fallback sections. Paginate the combined flow instead of selecting only
  // an exact-size page nested inside the original template.
  if (sourceNode.querySelector('[data-resume-completeness-document="true"]')) {
    return [];
  }

  const candidates = Array.from(sourceNode.querySelectorAll('*')).filter((node) => {
    if (!(node instanceof HTMLElement)) return false;

    const className = typeof node.className === 'string' ? node.className : '';
    const hasA4Classes =
      className.includes('h-[297mm]') &&
      className.includes('w-[210mm]');
    const hasA4InlineSize =
      node.style.width === '210mm' &&
      node.style.height === '297mm';

    return hasA4Classes || hasA4InlineSize || node.dataset.resumePage === 'true';
  });

  return candidates.filter(
    (candidate) =>
      !candidates.some(
        (possibleParent) =>
          possibleParent !== candidate &&
          possibleParent.contains(candidate)
      )
  );
};

const buildExistingA4PrintDocument = (sourceNode, existingPages) => {
  if (!(sourceNode instanceof HTMLElement) || !existingPages.length) return null;

  existingPages.forEach((page, index) => {
    page.dataset.codexSourcePageIndex = String(index);
  });

  const pagesRoot = document.createElement('div');
  pagesRoot.className = 'codex-print-pages';

  existingPages.forEach((sourcePage, index) => {
    const pageClone = buildPrintClone(sourceNode, {
      minimumHeightPx: getA4PageHeightPx(sourceNode.offsetWidth),
    });
    if (!(pageClone instanceof HTMLElement)) return;

    // Exact-size A4 templates (such as ATS Minimal) already own their page
    // margins. The editor wraps them in a configurable page shell for preview,
    // but retaining that shell padding during export makes the 210mm child
    // wider than the printable viewport and clips both edges.
    pageClone.style.setProperty('--resume-page-margin', '0px');
    pageClone.style.padding = '0';

    const clonedPages = Array.from(
      pageClone.querySelectorAll('[data-codex-source-page-index]')
    );

    clonedPages.forEach((page) => {
      if (!(page instanceof HTMLElement)) return;

      if (page.dataset.codexSourcePageIndex !== String(index)) {
        page.remove();
        return;
      }

      page.style.margin = '0';
      page.style.width = '210mm';
      page.style.maxWidth = '210mm';
      page.style.height = '297mm';
      page.style.boxSizing = 'border-box';
      page.style.boxShadow = 'none';
      page.style.breakAfter = 'auto';
      page.style.pageBreakAfter = 'auto';
    });

    const pageShell = document.createElement('div');
    pageShell.className = 'codex-print-page';

    const pageViewport = document.createElement('div');
    pageViewport.className = 'codex-print-page-viewport';
    pageViewport.dataset.pageIndex = String(index + 1);
    copySurfaceBackground(sourcePage, pageViewport);

    const pageContent = document.createElement('div');
    pageContent.className = 'codex-print-page-content';
    pageContent.style.height = '297mm';
    pageContent.dataset.pageStart = '0';
    pageContent.dataset.pageEnd = '297mm';

    pageContent.appendChild(pageClone);
    pageViewport.appendChild(pageContent);
    pageShell.appendChild(pageViewport);
    pagesRoot.appendChild(pageShell);

  });

  existingPages.forEach((page) => {
    page.removeAttribute('data-codex-source-page-index');
  });

  return {
    pagesRoot,
    pageBreaks: [],
    pageCount: existingPages.length,
    usedExistingPages: true,
  };
};

export const buildPaginatedPrintDocument = (
  sourceNode,
  {
    manualBreaks = [],
    blockSelector = DEFAULT_A4_BLOCK_SELECTOR,
  } = {}
) => {
  if (!(sourceNode instanceof HTMLElement)) return null;

  const existingPages = findExistingA4Pages(sourceNode);
  if (existingPages.length > 0) {
    return buildExistingA4PrintDocument(sourceNode, existingPages);
  }

  const pageHeightPx = getA4PageHeightPx(sourceNode.offsetWidth);
  const contentHeight = sourceNode.scrollHeight;
  const breaks = calculatePageBreaks(sourceNode, pageHeightPx, {
    manualBreaks,
    scale: 1,
    explicitContentHeight: contentHeight,
    blockSelector,
  });
  const boundaries = [0, ...breaks, contentHeight]
    .map((value) => Math.max(0, Math.round(value)))
    .filter((value, index, values) => index === 0 || value > values[index - 1]);

  const pagesRoot = document.createElement('div');
  pagesRoot.className = 'codex-print-pages';
  // Full-bleed templates often paint their page background on the document
  // root (and use flex children such as a dark sidebar). Extend every clone to
  // the complete printed page stack so those surfaces continue through the
  // unused portion of the final page instead of exposing the white print root.
  const printedDocumentHeight = Math.max(
    contentHeight,
    (boundaries.length - 1) * pageHeightPx
  );

  boundaries.slice(0, -1).forEach((start, index) => {
    const end = boundaries[index + 1];
    const visibleHeight = Math.min(pageHeightPx, Math.max(1, end - start));
    const pageClone = buildPrintClone(sourceNode, {
      minimumHeightPx: printedDocumentHeight,
    });
    if (!(pageClone instanceof HTMLElement)) return;

    pageClone.style.position = 'relative';
    pageClone.style.left = '0';
    pageClone.style.top = '0';
    pageClone.style.margin = '0';
    pageClone.style.transform = 'translateY(-' + start + 'px)';

    const pageShell = document.createElement('div');
    pageShell.className = 'codex-print-page';

    const pageViewport = document.createElement('div');
    pageViewport.className = 'codex-print-page-viewport';
    pageViewport.dataset.pageIndex = String(index + 1);
    copySurfaceBackground(sourceNode, pageViewport);

    const pageContent = document.createElement('div');
    pageContent.className = 'codex-print-page-content';
    pageContent.style.height = visibleHeight + 'px';
    pageContent.dataset.pageStart = String(start);
    pageContent.dataset.pageEnd = String(end);

    pageContent.appendChild(pageClone);
    pageViewport.appendChild(pageContent);
    pageShell.appendChild(pageViewport);
    pagesRoot.appendChild(pageShell);
  });

  return { pagesRoot, pageBreaks: breaks, pageCount: boundaries.length - 1 };
};

const ensureTempPrintRoot = () => {
  let tempRoot = document.querySelector(`body > .${PRINT_ROOT_CLASS}.${PRINT_ROOT_ACTIVE_CLASS}`);

  if (!(tempRoot instanceof HTMLElement)) {
    tempRoot = document.createElement('div');
    tempRoot.className = `${PRINT_ROOT_CLASS} ${PRINT_ROOT_ACTIVE_CLASS}`;
    document.body.appendChild(tempRoot);
  }

  tempRoot.innerHTML = '';
  Object.assign(tempRoot.style, {
    display: 'block',
    position: 'fixed',
    left: '0',
    top: '0',
    width: '100%',
    background: '#ffffff',
    visibility: 'hidden',
    opacity: '0',
    pointerEvents: 'none',
    zIndex: '2147483647',
    overflow: 'visible',
  });

  return tempRoot;
};

const cleanupTempPrintRoot = (root) => {
  if (!(root instanceof HTMLElement)) return;
  root.innerHTML = '';
  root.remove();
};

export const exportPaginatedA4ElementToPdf = async ({
  sourceElement,
  filename = 'document.pdf',
  manualBreaks = [],
  blockSelector = DEFAULT_A4_BLOCK_SELECTOR,
  onBeforePrint,
  onAfterPrint,
} = {}) => {
  if (!(sourceElement instanceof HTMLElement)) {
    throw new Error('exportPaginatedA4ElementToPdf requires a valid sourceElement');
  }

  if (typeof window.print !== 'function') {
    throw new Error('window.print is not available in this browser.');
  }

  ensurePrintStyles();
  await waitForEmbeddedAssets(sourceElement);

  const paginatedDocument = buildPaginatedPrintDocument(sourceElement, {
    manualBreaks,
    blockSelector,
  });

  if (!(paginatedDocument?.pagesRoot instanceof HTMLElement)) {
    throw new Error('Unable to build paginated print document');
  }

  const printRoot = ensureTempPrintRoot();
  const previousTitle = document.title;

  try {
    await waitForEmbeddedAssets(paginatedDocument.pagesRoot);
    printRoot.appendChild(paginatedDocument.pagesRoot);
    await waitForEmbeddedAssets(printRoot);

    document.title = filename;
    onBeforePrint?.({
      pageBreaks: paginatedDocument.pageBreaks,
      pageCount: paginatedDocument.pageCount,
      printRoot,
    });

    await new Promise((resolve) => {
      let finished = false;
      let cleanupTimer = null;
      let fallbackTimer = null;
      let hasEnteredPrintMode = false;
      const printMediaQuery =
        typeof window.matchMedia === 'function' ? window.matchMedia('print') : null;

      const cleanupListeners = () => {
        window.removeEventListener('afterprint', handleAfterPrint);
        window.removeEventListener('focus', handleWindowFocus);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        printMediaQuery?.removeEventListener?.('change', handlePrintMediaChange);

        if (cleanupTimer) {
          window.clearTimeout(cleanupTimer);
          cleanupTimer = null;
        }

        if (fallbackTimer) {
          window.clearTimeout(fallbackTimer);
          fallbackTimer = null;
        }
      };

      const finish = () => {
        if (finished) return;
        finished = true;
        cleanupListeners();
        document.title = previousTitle;
        cleanupTempPrintRoot(printRoot);
        onAfterPrint?.({
          pageBreaks: paginatedDocument.pageBreaks,
          pageCount: paginatedDocument.pageCount,
        });
        resolve();
      };

      const scheduleCleanup = (delay = 250) => {
        if (cleanupTimer) {
          window.clearTimeout(cleanupTimer);
        }

        cleanupTimer = window.setTimeout(() => {
          finish();
        }, delay);
      };

      const handleAfterPrint = () => {
        finish();
      };

      const handleWindowFocus = () => {
        scheduleCleanup(hasEnteredPrintMode ? 250 : 1200);
      };

      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          scheduleCleanup(hasEnteredPrintMode ? 250 : 1200);
        }
      };

      const handlePrintMediaChange = (event) => {
        hasEnteredPrintMode = event.matches || hasEnteredPrintMode;
        if (!event.matches && hasEnteredPrintMode) {
          finish();
        }
      };

      window.addEventListener('afterprint', handleAfterPrint);
      window.addEventListener('focus', handleWindowFocus);
      document.addEventListener('visibilitychange', handleVisibilityChange);
      printMediaQuery?.addEventListener?.('change', handlePrintMediaChange);

      fallbackTimer = window.setTimeout(() => {
        finish();
      }, 60000);

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          window.focus?.();
          window.print();
        });
      });
    });

    return {
      pageBreaks: paginatedDocument.pageBreaks,
      pageCount: paginatedDocument.pageCount,
    };
  } catch (error) {
    document.title = previousTitle;
    cleanupTempPrintRoot(printRoot);
    throw error;
  }
};
