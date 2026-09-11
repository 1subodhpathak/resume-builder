/**
 * Joins pre-measured fragments of one logical content block when pagination
 * placed them on the same physical page. The first fragment keeps its original
 * continuation state, so a label is retained only when the page itself starts
 * with content carried over from an earlier page.
 */
export const mergeExperienceFragmentsOnPage = (blocks = []) => {
  return blocks.reduce((merged, block) => {
    const previous = merged[merged.length - 1];
    const fragmentType = block?.type;
    const isMergeableType =
      fragmentType === 'experience' ||
      fragmentType === 'summary' ||
      fragmentType === 'profile';
    const sameLogicalItem =
      fragmentType !== 'experience' || previous?.item === block?.item;
    const sameFragmentSeries =
      isMergeableType &&
      previous?.type === fragmentType &&
      block.continuation === true &&
      previous.section === block.section &&
      sameLogicalItem;

    if (!sameFragmentSeries) {
      merged.push(block);
      return merged;
    }

    const contentKey = Array.isArray(previous.lines) && Array.isArray(block.lines)
      ? 'lines'
      : Array.isArray(previous.bullets) && Array.isArray(block.bullets)
        ? 'bullets'
        : Array.isArray(previous.items) && Array.isArray(block.items)
          ? 'items'
          : null;

    if (!contentKey) {
      merged.push(block);
      return merged;
    }

    merged[merged.length - 1] = {
      ...previous,
      [contentKey]: [...previous[contentKey], ...block[contentKey]],
    };

    return merged;
  }, []);
};

const SECTION_HEADING_PATTERN = /\b(summary|profile|objective|experience|employment|work history|career|projects?|education|academic|skills?|expertise|competenc|certifications?|credentials|awards?|achievements?|recognition|languages?|volunteering|community|publications?)\b/i;

const isSectionHeading = (element) => {
  if (!(element instanceof HTMLElement)) return false;
  const text = String(element.textContent || '')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > 0 && text.length <= 64 && SECTION_HEADING_PATTERN.test(text);
};

const getSectionScope = (heading, container, headings) => {
  let candidate = heading.parentElement;

  while (candidate && candidate !== container) {
    const containedHeadings = headings.filter((item) => candidate.contains(item));
    if (containedHeadings.length > 1) return candidate;
    candidate = candidate.parentElement;
  }

  return container;
};

/**
 * Marks real section headings in both static and measured/paginated template
 * trees. CSS can then adjust spacing without depending on templates using a
 * particular element such as <section>.
 */
export const installResumeSectionSpacing = (container) => {
  if (!(container instanceof HTMLElement)) return () => {};

  const apply = () => {
    const headings = Array.from(container.querySelectorAll('h2, h3'))
      .filter(isSectionHeading);

    headings.forEach((heading) => {
      const scope = getSectionScope(heading, container, headings);
      const scopedHeadings = headings.filter((item) => scope.contains(item));
      const isFirst = scopedHeadings[0] === heading;

      heading.classList.toggle('resume-section-spacing-anchor', !isFirst);

      if (!heading.dataset.resumeBaseMarginTop) {
        const baseMarginTop = getComputedStyle(heading).marginTop || '0px';
        heading.dataset.resumeBaseMarginTop = baseMarginTop;
        heading.style.setProperty('--resume-base-margin-top', baseMarginTop);
      }
    });
  };

  apply();

  if (typeof MutationObserver === 'undefined') return () => {};
  const observer = new MutationObserver(apply);
  observer.observe(container, { childList: true, subtree: true });
  return () => observer.disconnect();
};

const getClassText = (element) => {
  if (!(element instanceof HTMLElement)) return '';
  return typeof element.className === 'string' ? element.className : '';
};

const SURFACE_CLASS_MARKERS = [
  'w-[210mm]',
  'max-w-[210mm]',
  'min-h-[297mm]',
  'h-[297mm]',
  'min-h-[1100px]',
  'resume-preview-wrapper',
];

export const looksLikeResumeSurface = (element) => {
  if (!(element instanceof HTMLElement)) return false;

  const classText = getClassText(element);
  if (SURFACE_CLASS_MARKERS.some((marker) => classText.includes(marker))) {
    return true;
  }

  const inlineWidth = element.style?.width || '';
  const inlineMinHeight = element.style?.minHeight || '';
  return inlineWidth.includes('210mm') || inlineMinHeight.includes('297mm');
};

export const findResumeContentSurface = (container) => {
  if (!(container instanceof HTMLElement)) return null;

  const taggedSurface = container.querySelector('[data-resume-content-surface="true"]');
  if (taggedSurface instanceof HTMLElement) {
    return taggedSurface;
  }

  if (looksLikeResumeSurface(container)) {
    return container;
  }

  const descendants = Array.from(container.querySelectorAll('*'));
  return descendants.find((node) => looksLikeResumeSurface(node)) || container;
};

export const markResumeContentSurface = (container) => {
  if (!(container instanceof HTMLElement)) return null;

  container
    .querySelectorAll('[data-resume-content-surface], [data-resume-outer-shell]')
    .forEach((node) => {
      node.removeAttribute('data-resume-content-surface');
      node.removeAttribute('data-resume-outer-shell');
    });

  const templateRoot = container.firstElementChild instanceof HTMLElement
    ? container.firstElementChild
    : null;

  if (!templateRoot) return null;

  const printableSurface = findResumeContentSurface(templateRoot);
  if (!(printableSurface instanceof HTMLElement)) return null;

  printableSurface.dataset.resumeContentSurface = 'true';

  if (printableSurface !== templateRoot) {
    templateRoot.dataset.resumeOuterShell = 'true';
  }

  return printableSurface;
};
