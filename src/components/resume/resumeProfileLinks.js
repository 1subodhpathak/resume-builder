const PROFILE_LINKS = [
  { key: 'linkedin', label: 'linkedin_profile', editLabel: 'LinkedIn' },
  { key: 'github', label: 'github_id', editLabel: 'GitHub' },
  { key: 'website', label: 'my_website', editLabel: 'Website' },
  { key: 'portfolio', label: 'my_portfolio', editLabel: 'Portfolio' },
];

const externalHref = (value, type = '') => {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw;
  if (/^\/\//.test(raw)) return `https:${raw}`;

  if (type === 'linkedin') {
    if (/linkedin\.com/i.test(raw)) return `https://${raw.replace(/^\/+/, '')}`;
    return `https://www.linkedin.com/in/${raw.replace(/^in\//, '')}`;
  }

  if (type === 'github') {
    if (/github\.com/i.test(raw)) return `https://${raw.replace(/^\/+/, '')}`;
    return `https://github.com/${raw}`;
  }

  return `https://${raw}`;
};

const createProfileAnchor = (document, link) => {
  const anchor = document.createElement('a');
  anchor.href = externalHref(link.value, link.key);
  anchor.target = '_blank';
  anchor.rel = 'noopener noreferrer';
  anchor.textContent = link.label;
  anchor.className = 'resume-profile-link';
  anchor.dataset.resumeProfileLink = link.key;
  anchor.dataset.editPath = `personal.${link.key}`;
  anchor.dataset.editLabel = link.editLabel;
  anchor.style.color = 'inherit';
  anchor.style.textDecoration = 'underline';
  anchor.style.textUnderlineOffset = '0.12em';
  return anchor;
};

const isBoundaryChar = (char) => {
  if (!char) return true;
  return /[\s|•,:;"'()<>[\]\/]/.test(char);
};

const findSafeLinkMatch = (text, links) => {
  let bestMatch = null;

  for (const link of links) {
    if (!link.value || link.value.length < 3) continue;

    let searchStart = 0;
    while (searchStart < text.length) {
      const index = text.indexOf(link.value, searchStart);
      if (index === -1) break;

      const charBefore = index > 0 ? text[index - 1] : '';
      const charAfter = index + link.value.length < text.length ? text[index + link.value.length] : '';

      if (isBoundaryChar(charBefore) && isBoundaryChar(charAfter)) {
        if (!bestMatch || index < bestMatch.index) {
          bestMatch = { link, index };
        }
        break;
      }
      searchStart = index + 1;
    }
  }

  return bestMatch;
};

const replaceProfileValues = (surface, links) => {
  if (!surface?.ownerDocument || !links.length) return;

  const { ownerDocument } = surface;
  const walker = ownerDocument.createTreeWalker(
    surface,
    ownerDocument.defaultView.NodeFilter.SHOW_TEXT
  );
  const textNodes = [];

  while (walker.nextNode()) textNodes.push(walker.currentNode);

  textNodes.forEach((textNode) => {
    const parent = textNode.parentElement;
    if (!parent || parent.closest('a, script, style, textarea, input, [data-resume-profile-link]')) return;
    if (parent.closest('table, tbody, tr, td, th, ul, ol, li, [data-section="summary"], [data-section="experience"], [data-section="education"], [data-section="projects"], [data-section="skills"], [data-section="awards"], [data-section="certifications"], .iit-section-wrap, .resume-section-body, .experience-item, .education-item')) return;

    const source = textNode.nodeValue || '';
    if (!links.some((link) => link.value && link.value.length >= 3 && source.includes(link.value))) return;

    const fragment = ownerDocument.createDocumentFragment();
    let remaining = source;
    let hasReplaced = false;

    while (remaining) {
      const match = findSafeLinkMatch(remaining, links);

      if (!match) {
        fragment.append(remaining);
        break;
      }

      hasReplaced = true;
      if (match.index > 0) fragment.append(remaining.slice(0, match.index));
      fragment.append(createProfileAnchor(ownerDocument, match.link));
      remaining = remaining.slice(match.index + match.link.value.length);
    }

    if (hasReplaced) {
      textNode.replaceWith(fragment);
    }
  });
};

export const installResumeProfileLinks = (surface, personal = {}) => {
  const links = PROFILE_LINKS
    .map((item) => ({ ...item, value: String(personal?.[item.key] || '').trim() }))
    .filter((item) => item.value && item.value.length >= 3)
    .sort((a, b) => b.value.length - a.value.length);

  if (!surface || !links.length) return () => {};

  let queued = false;
  const enhance = () => {
    if (queued) return;
    queued = true;
    queueMicrotask(() => {
      queued = false;
      replaceProfileValues(surface, links);
    });
  };

  replaceProfileValues(surface, links);
  const observer = new surface.ownerDocument.defaultView.MutationObserver(enhance);
  observer.observe(surface, { childList: true, subtree: true, characterData: true });

  return () => observer.disconnect();
};

