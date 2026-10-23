const ROLE_GROUPS = {
  tech: new Set([
    'software-engineer', 'data-scientist', 'sql-terminal', 'tech', 'developer', 'class-file-dark',
    'coder', 'cyan-grid', 'accent-grid', 'engineer', 'azure-pro',
  ]),
  analyst: new Set([
    'professional', 'Ats', 'minimal', 'classic', 'formal', 'ocean-ats', 'business-analyst',
    'reporting-mis', 'product-manager', 'professional-columns', 'info-blue', 'info-executive',
  ]),
  design: new Set([
    'designer', 'creative', 'marketing', 'motion-designer-board', 'chalkboard-artist',
    'polaroid-portfolio', 'influencer-media-kit', 'youtube-creator', 'actor-spotlight',
    'chef-menu', 'painter-canvas', 'portfolio-showcase', 'Artistic', 'startup', 'gamer-arena',
    'newspaper-editorial', 'photographer-resume', 'infographic', 'metro', 'berlin',
    'amber-visual', 'skyline', 'mocha-creative', 'bubble-header', 'Mosaic',
  ]),
  finance: new Set([
    'chartered-accountant', 'accounting', 'brick-formal', 'luxe',
  ]),
  sales: new Set(['sales']),
  academic: new Set(['Academic', 'iit', 'iim', 'bits', 'xlri', 'mdi-gurgaon', 'nmims',
    'banasthali', 'bhu', 'lpu', 'nit', 'teacher', 'student-notes']),
  healthcare: new Set(['doctor-profile', 'physician-care', 'medical']),
  leadership: new Set([
    'executive', 'indigo-elite', 'leadership-signature', 'boardroom-one', 'ceo-brief',
    'consulting-line', 'impact-header',
  ]),
  legal: new Set(['lawyer-trial']),
};

const CREATIVE_TEMPLATE_IDS = new Set(ROLE_GROUPS.design);
const EXECUTIVE_TEMPLATE_IDS = new Set([...ROLE_GROUPS.leadership, ...ROLE_GROUPS.finance, ...ROLE_GROUPS.legal]);
const ATS_TEMPLATE_IDS = new Set([
  'professional', 'Ats', 'minimal', 'classic', 'formal', 'Academic', 'iit', 'iim', 'bits', 'xlri',
  'mdi-gurgaon', 'nmims', 'ocean-ats',
  'banasthali', 'bhu', 'lpu', 'nit',
  'career-launch', 'associate-prime', 'consulting-line', 'leadership-signature', 'boardroom-one', 'ceo-brief',
]);

const normalizeGraphics = (graphics = '') => String(graphics).toLowerCase();
const normalizeColumns = (columns = '1') => String(columns);

const deriveBestForRoles = (templateId) =>
  Object.entries(ROLE_GROUPS)
    .filter(([, ids]) => ids.has(templateId))
    .map(([role]) => role);

export const deriveTemplateMetadata = (template = {}) => {
  const graphics = normalizeGraphics(template.graphics);
  const columns = normalizeColumns(template.columns);
  const isCreative = CREATIVE_TEMPLATE_IDS.has(template.id);
  const isExecutive = EXECUTIVE_TEMPLATE_IDS.has(template.id);
  const bestForRoles = deriveBestForRoles(template.id);

  let contentDensity = 'balanced';
  if (columns === '1' && graphics === 'low') contentDensity = 'compact';
  if (columns === '2' && graphics === 'high') contentDensity = 'spacious';

  let experienceCapacity = columns === '1' ? 'high' : 'medium';
  let skillsCapacity = columns === '2' ? 'high' : 'medium';
  let summaryCapacity = columns === '1' ? 'high' : 'medium';
  let multiPageTolerance = columns === '1' ? 'high' : 'medium';

  if (isCreative) {
    experienceCapacity = 'medium';
    skillsCapacity = 'medium';
    summaryCapacity = 'medium';
    multiPageTolerance = 'low';
  }

  if (isExecutive) {
    experienceCapacity = 'high';
    skillsCapacity = 'medium';
    summaryCapacity = 'high';
    multiPageTolerance = 'high';
  }

  return {
    contentDensity,
    experienceCapacity,
    skillsCapacity,
    summaryCapacity,
    multiPageTolerance,
    atsSafety: ATS_TEMPLATE_IDS.has(template.id) ? 'high' : isCreative ? 'medium' : 'medium',
    bestForSeniority: isExecutive
      ? ['senior', 'executive']
      : contentDensity === 'compact'
        ? ['entry', 'mid']
        : ['mid', 'senior'],
    bestForRoles: bestForRoles.length ? bestForRoles : ['general'],
    styleFamily: isCreative ? 'creative' : isExecutive ? 'executive' : graphics === 'low' ? 'classic' : 'modern',
  };
};

export const enrichTemplatesWithMetadata = (templates = []) =>
  templates.map((template) => ({
    ...template,
    ...deriveTemplateMetadata(template),
  }));
