export const scrollToLandingSection = (sectionId, offset = 96) => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  if (!sectionId || sectionId === 'top') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  const target = document.getElementById(sectionId);
  if (!target) return;

  const top = target.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
};
