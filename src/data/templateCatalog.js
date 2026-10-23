import { getTemplateSeoMetadata } from './resumeExampleSeo';

export const TOP_TEMPLATE_IDS = [
  'Ats', 'minimal', 'formal', 'classic',
  'iit', 'iim', 'bits', 'nit',
  'consulting-line',
  'boardroom-one', 'leadership-signature', 'ceo-brief', 'ocean-ats', 'Academic', 'xlri',
  'mdi-gurgaon', 'nmims',
  'banasthali', 'bhu', 'lpu',
  'executive', 'rule-minimalist', 'professional', 'career-launch', 'associate-prime',
  'japanese', 'card', 'luxe', 'centered-initials', 'Architect',
  'data-scientist', 'engineer', 'product-manager', 'sales', 'professional-columns',
  'soft-serif', 'teacher', 'teal-innovator', 'sunset-slim', 'brick-formal',
  'business-analyst', 'accounting', 'marketing', 'modern', 'modern-gold',
  'medical', 'software-engineer', 'indigo-elite', 'info-executive', 'developer',
  'accent-grid', 'cloud-soft', 'sand-minimal', 'marine-clean', 'mint-fresh',
  'night-admin', 'marine-compact', 'sql-terminal', 'slate-duo', 'chartered-accountant',
  'lawyer-trial', 'reporting-mis', 'designer', 'creative', 'portfolio-showcase',
  'doctor-profile', 'physician-care', 'photographer-resume', 'newspaper-editorial', 'infographic',
];

const TEMPLATE_CATALOG = [
  { id: 'Ats', name: 'ATS Standard', hasHeadshot: false, graphics: 'Low', columns: '1', color: '#000000', recommended: true },
  { id: 'minimal', name: 'ATS Minimal', hasHeadshot: false, graphics: 'Low', columns: '1', color: '#1a1a1a', recommended: false },
  { id: 'formal', name: 'Structured Formal', hasHeadshot: false, graphics: 'Low', columns: '1', color: '#334155', recommended: false },
  { id: 'classic', name: 'Ivy League', hasHeadshot: false, graphics: 'Low', columns: '1', color: '#334155', recommended: false },
  { id: 'consulting-line', name: 'Consulting Line', hasHeadshot: false, graphics: 'Low', columns: '1', color: '#334155', recommended: true },
  { id: 'boardroom-one', name: 'Linkedin', hasHeadshot: false, graphics: 'Low', columns: '1', color: '#1e3a8a', recommended: true },
  { id: 'leadership-signature', name: 'Leadership Signature', hasHeadshot: false, graphics: 'Low', columns: '1', color: '#7c2d12', recommended: true },
  { id: 'ceo-brief', name: 'CEO Roles', hasHeadshot: false, graphics: 'Low', columns: '1', color: '#b45309', recommended: true },
  { id: 'ocean-ats', name: 'Deep Ocean', hasHeadshot: false, graphics: 'Low', columns: '1', color: '#004B8D', recommended: false },
  { id: 'Academic', name: 'Academic Scholar', hasHeadshot: false, graphics: 'Low', columns: '1', color: '#27272a', recommended: false },
  { id: 'iit', name: 'IIT Official', hasHeadshot: false, graphics: 'Low', columns: '1', color: '#28359c', recommended: true },
  { id: 'iim', name: 'IIM Business', hasHeadshot: false, graphics: 'Low', columns: '1', color: '#4b5563', recommended: true },
  { id: 'bits', name: 'BITS Pilani', hasHeadshot: false, graphics: 'Low', columns: '1', color: '#4b5563', recommended: true },
  { id: 'xlri', name: 'XLRI Business', hasHeadshot: false, graphics: 'Low', columns: '1', color: '#374151', recommended: true },
  { id: 'mdi-gurgaon', name: 'MDI Gurgaon', hasHeadshot: false, graphics: 'Low', columns: '1', color: '#101b40', recommended: true },
  { id: 'nmims', name: 'NMIMS Mumbai', hasHeadshot: false, graphics: 'Low', columns: '1', color: '#214963', recommended: true },
  { id: 'banasthali', name: 'Banasthali Campus', hasHeadshot: true, graphics: 'Low', columns: '2', color: '#713343', recommended: true },
  { id: 'bhu', name: 'BHU Academic', hasHeadshot: false, graphics: 'Low', columns: '1', color: '#1f4f78', recommended: true },
  { id: 'lpu', name: 'LPU Campus', hasHeadshot: true, graphics: 'Low', columns: '2', color: '#063866', recommended: true },
  { id: 'nit', name: 'NIT Engineering', hasHeadshot: true, graphics: 'Low', columns: '1', color: '#12465c', recommended: true },

  { id: 'executive', name: 'Global Executive', hasHeadshot: false, graphics: 'low', columns: '1', color: '#1a1a1a', recommended: true },
  { id: 'rule-minimalist', name: 'Rule Minimalist', hasHeadshot: false, graphics: 'Low', columns: '1', color: '#1e3a8a', recommended: false },
  { id: 'professional', name: 'Clean Professional', hasHeadshot: true, graphics: 'Low', columns: '1', color: '#0d9488', recommended: true },
  { id: 'career-launch', name: 'Career Launch', hasHeadshot: true, graphics: 'Low', columns: '1', color: '#0f766e', recommended: true },
  { id: 'associate-prime', name: 'Associate Prime', hasHeadshot: true, graphics: 'Low', columns: '1', color: '#2563eb', recommended: true },
  { id: 'japanese', name: 'Japanese Clean', hasHeadshot: true, graphics: 'Low', columns: '1', color: '#1c1917', recommended: true },
  { id: 'card', name: 'Card Minimal', hasHeadshot: true, graphics: 'Low', columns: '1', color: '#18181b', recommended: false },
  { id: 'luxe', name: 'Luxe Executive', hasHeadshot: true, graphics: 'Low', columns: '1', color: '#d4af37', recommended: false },
  { id: 'centered-initials', name: 'Centered Initials', hasHeadshot: true, graphics: 'Low', columns: '1', color: '#1e3a8a', recommended: false },
  { id: 'Architect', name: 'Architect', hasHeadshot: false, graphics: 'High', columns: '1', color: '#1e3a5f', recommended: true },

  { id: 'software-engineer', name: 'Software Engineer', hasHeadshot: true, graphics: 'High', columns: '2', color: '#00695c', recommended: true },
  { id: 'data-scientist', name: 'Data Scientist', hasHeadshot: false, graphics: 'low', columns: '2', color: '#3b82f6', recommended: true },
  { id: 'sql-terminal', name: 'SQL Terminal', hasHeadshot: false, graphics: 'High', columns: '2', color: '#fb923c', recommended: false },
  { id: 'tech', name: 'Terminal Dark', hasHeadshot: true, graphics: 'High', columns: '2', color: '#00E5FF', recommended: false },
  { id: 'developer', name: 'Dev Console', hasHeadshot: true, graphics: 'High', columns: '2', color: '#282c34', recommended: true },
  { id: 'class-file-dark', name: 'Class File Dark', hasHeadshot: true, graphics: 'High', columns: '2', color: '#9adbf7', recommended: false },
  { id: 'coder', name: 'Coder Terminal', hasHeadshot: true, graphics: 'High', columns: '2', color: '#0d1117', recommended: false },
  { id: 'cyan-grid', name: 'Cyan Flux', hasHeadshot: true, graphics: 'High', columns: '2', color: '#0097A7', recommended: false },
  { id: 'accent-grid', name: 'Accent Grid', hasHeadshot: true, graphics: 'low', columns: '2', color: '#1e3a8a', recommended: false },
  { id: 'engineer', name: 'Industrial Engineer', hasHeadshot: false, graphics: 'Low', columns: '2', color: '#2563eb', recommended: false },

  { id: 'business-analyst', name: 'Business Analyst', hasHeadshot: false, graphics: 'High', columns: '2', color: '#2e7d32', recommended: true },
  { id: 'chartered-accountant', name: 'Chartered Accountant', hasHeadshot: true, graphics: 'High', columns: '2', color: '#0f766e', recommended: false },
  { id: 'lawyer-trial', name: 'Trial Lawyer', hasHeadshot: true, graphics: 'High', columns: '2', color: '#1f3b73', recommended: false },
  { id: 'reporting-mis', name: 'Reporting MIS', hasHeadshot: true, graphics: 'High', columns: '2', color: '#2563eb', recommended: false },
  { id: 'indigo-elite', name: 'Indigo Leader', hasHeadshot: true, graphics: 'High', columns: '2', color: '#004B8D', recommended: true },
  { id: 'product-manager', name: 'Product Manager', hasHeadshot: false, graphics: 'Low', columns: '2', color: '#3b82f6', recommended: false },
  { id: 'accounting', name: 'Financial Expert', hasHeadshot: false, graphics: 'High', columns: '2', color: '#006064', recommended: false },
  { id: 'sales', name: 'Sales Executive', hasHeadshot: false, graphics: 'Low', columns: '2', color: '#2563eb', recommended: false },
  { id: 'impact-header', name: 'Impact Header', hasHeadshot: true, graphics: 'High', columns: '2', color: '#0f172a', recommended: false },
  { id: 'modern-gold', name: 'Beige Executive', hasHeadshot: false, graphics: 'High', columns: '2', color: '#A79284', recommended: false },
  { id: 'professional-columns', name: 'Prof. Columns', hasHeadshot: false, graphics: 'Low', columns: '2', color: '#1e3a8a', recommended: false },
  { id: 'bordered-elegant', name: 'Bordered Elegant', hasHeadshot: true, graphics: 'High', columns: '2', color: '#1e3a8a', recommended: false },

  { id: 'designer', name: 'Creative Designer', hasHeadshot: true, graphics: 'High', columns: '2', color: '#F57C00', recommended: true },
  { id: 'creative', name: 'Creative Gradient', hasHeadshot: true, graphics: 'High', columns: '2', color: '#7c3aed', recommended: true },
  { id: 'marketing', name: 'Marketing Pro', hasHeadshot: false, graphics: 'High', columns: '2', color: '#004d40', recommended: true },
  { id: 'motion-designer-board', name: 'Motion Designer Board', hasHeadshot: true, graphics: 'High', columns: '2', color: '#facc15', recommended: false },
  { id: 'student-notes', name: 'Student Notes', hasHeadshot: true, graphics: 'High', columns: '2', color: '#2563eb', recommended: false },
  { id: 'chalkboard-artist', name: 'Chalkboard Artist', hasHeadshot: true, graphics: 'High', columns: '2', color: '#262626', recommended: false },
  { id: 'polaroid-portfolio', name: 'Polaroid Portfolio', hasHeadshot: true, graphics: 'High', columns: '2', color: '#2563eb', recommended: false },
  { id: 'influencer-media-kit', name: 'Influencer Media Kit', hasHeadshot: true, graphics: 'High', columns: '2', color: '#06b6d4', recommended: false },
  { id: 'youtube-creator', name: 'YouTube Creator', hasHeadshot: true, graphics: 'High', columns: '2', color: '#ff2d20', recommended: false },
  { id: 'actor-spotlight', name: 'Actor Spotlight', hasHeadshot: true, graphics: 'High', columns: '2', color: '#b4472f', recommended: false },
  { id: 'chef-menu', name: 'Chef Menu', hasHeadshot: true, graphics: 'High', columns: '2', color: '#991b1b', recommended: false },
  { id: 'painter-canvas', name: 'Painter Canvas', hasHeadshot: true, graphics: 'High', columns: '2', color: '#a855f7', recommended: false },
  { id: 'magazine-cover', name: 'Magazine Cover', hasHeadshot: true, graphics: 'High', columns: '1', color: '#dc2626', recommended: false },
  { id: 'portfolio-showcase', name: 'Portfolio Showcase', hasHeadshot: true, graphics: 'High', columns: '2', color: '#1ed5a9', recommended: true },
  { id: 'Artistic', name: 'Artistic Portfolio', hasHeadshot: true, graphics: 'High', columns: '2', color: '#1e1b4b', recommended: false },
  { id: 'startup', name: 'Startup Gradient', hasHeadshot: true, graphics: 'High', columns: '2', color: '#6366f1', recommended: false },
  { id: 'gamer-arena', name: 'Gamer Arena', hasHeadshot: true, graphics: 'High', columns: '2', color: '#facc15', recommended: false },
  { id: 'newspaper-editorial', name: 'Newspaper Editorial', hasHeadshot: true, graphics: 'High', columns: '2', color: '#2a2a2a', recommended: false },
  { id: 'photographer-resume', name: 'Photographer Resume', hasHeadshot: true, graphics: 'High', columns: '2', color: '#d97706', recommended: false },
  { id: 'infographic', name: 'Infographic', hasHeadshot: true, graphics: 'High', columns: '1', color: '#3b82f6', recommended: false },
  { id: 'metro', name: 'Metro Blocks', hasHeadshot: true, graphics: 'High', columns: '2', color: '#f59e0b', recommended: false },
  { id: 'berlin', name: 'Berlin Bold', hasHeadshot: true, graphics: 'High', columns: '2', color: '#0f172a', recommended: false },
  { id: 'amber-visual', name: 'Amber Visual', hasHeadshot: true, graphics: 'High', columns: '2', color: '#F57C00', recommended: false },
  { id: 'skyline', name: 'Skyline Creative', hasHeadshot: true, graphics: 'High', columns: '2', color: '#2A7BBF', recommended: false },
  { id: 'mocha-creative', name: 'Mocha Visual', hasHeadshot: true, graphics: 'High', columns: '2', color: '#A79284', recommended: false },
  { id: 'bubble-header', name: 'Bubble Header', hasHeadshot: true, graphics: 'High', columns: '1', color: '#3b82f6', recommended: false },
  { id: 'Mosaic', name: 'Mosaic', hasHeadshot: true, graphics: 'High', columns: '1', color: '#3b82f6', recommended: false },

  { id: 'modern', name: 'Modern Emerald', hasHeadshot: false, graphics: 'High', columns: '2', color: '#1A1C1E', recommended: true },
  { id: 'cloud-soft', name: 'Cloud Minimal', hasHeadshot: true, graphics: 'Low', columns: '2', color: '#0369A1', recommended: false },
  { id: 'soft-serif', name: 'Soft Serif', hasHeadshot: false, graphics: 'Low', columns: '2', color: '#334155', recommended: false },
  { id: 'sand-minimal', name: 'Sandstone Clean', hasHeadshot: true, graphics: 'Low', columns: '2', color: '#A79284', recommended: false },
  { id: 'marine-clean', name: 'Marine Clean', hasHeadshot: true, graphics: 'Low', columns: '2', color: '#0097A7', recommended: false },
  { id: 'mint-fresh', name: 'Mint Minimal', hasHeadshot: true, graphics: 'Low', columns: '2', color: '#2D5A43', recommended: false },
  { id: 'sunset-slim', name: 'Sunset Brief', hasHeadshot: false, graphics: 'Low', columns: '2', color: '#F57C00', recommended: false },

  { id: 'doctor-profile', name: 'Doctor Profile', hasHeadshot: true, graphics: 'High', columns: '2', color: '#0f766e', recommended: false },
  { id: 'physician-care', name: 'Physician Care', hasHeadshot: true, graphics: 'High', columns: '2', color: '#0f4f63', recommended: false },
  { id: 'medical', name: 'Medical Clinical', hasHeadshot: true, graphics: 'High', columns: '1', color: '#0d9488', recommended: true },
  { id: 'teacher', name: 'Education Pro', hasHeadshot: false, graphics: 'Low', columns: '2', color: '#78716c', recommended: false },

  { id: 'teal-innovator', name: 'Teal Innovator', hasHeadshot: false, graphics: 'low', columns: '2', color: '#0097A7', recommended: false },
  { id: 'navy-sidebar', name: 'Navy Modern', hasHeadshot: true, graphics: 'High', columns: '2', color: '#0f172a', recommended: false },
  { id: 'forest-sidebar', name: 'Forest Duo', hasHeadshot: true, graphics: 'High', columns: '2', color: '#2D5A43', recommended: false },
  { id: 'slate-duo', name: 'Slate Split', hasHeadshot: false, graphics: 'High', columns: '2', color: '#2D2E2E', recommended: false },
  { id: 'crimson-sidebar', name: 'Crimson Edge', hasHeadshot: true, graphics: 'High', columns: '2', color: '#D32F2F', recommended: false },
  { id: 'ruby-creative', name: 'Ruby Creative', hasHeadshot: true, graphics: 'High', columns: '2', color: '#D32F2F', recommended: false },
  { id: 'orange-punch', name: 'Orange Punch', hasHeadshot: true, graphics: 'High', columns: '2', color: '#F57C00', recommended: false },
  { id: 'blue-frame', name: 'Blue Frame', hasHeadshot: true, graphics: 'High', columns: '2', color: '#1e3a8a', recommended: false },
  { id: 'brick-formal', name: 'Brick Solid', hasHeadshot: false, graphics: 'Low', columns: '2', color: '#D32F2F', recommended: false },

  { id: 'pointer-banner', name: 'Pointer Banner', hasHeadshot: true, graphics: 'High', columns: '2', color: '#2d4a8a', recommended: false },
  { id: 'block-branding', name: 'Block Branding', hasHeadshot: true, graphics: 'High', columns: '2', color: '#1a1a1a', recommended: false },
  { id: 'modern-circle', name: 'Modern Circle', hasHeadshot: true, graphics: 'High', columns: '2', color: '#D32F2F', recommended: false },
  { id: 'azure-pro', name: 'Azure Impact', hasHeadshot: true, graphics: 'High', columns: '2', color: '#2563eb', recommended: false },
  { id: 'night-admin', name: 'Night Admin', hasHeadshot: true, graphics: 'Low', columns: '2', color: '#1A1C1E', recommended: false },
  { id: 'marine-compact', name: 'Marine Compact', hasHeadshot: true, graphics: 'Low', columns: '2', color: '#0097A7', recommended: false },

  { id: 'info-blue', name: 'Blue Sidebar', hasHeadshot: true, graphics: 'High', columns: '2', color: '#1d4ed8', recommended: false },
  { id: 'info-executive', name: 'Executive Grid', hasHeadshot: true, graphics: 'High', columns: '2', color: '#1e3a8a', recommended: true },
  { id: 'info-teal', name: 'Teal Circular', hasHeadshot: true, graphics: 'High', columns: '2', color: '#0f766e', recommended: false },
  { id: 'info-green', name: 'Floating Charts', hasHeadshot: true, graphics: 'High', columns: '2', color: '#10b981', recommended: false },
  { id: 'info-navy', name: 'Full Infographic', hasHeadshot: true, graphics: 'High', columns: '2', color: '#1e293b', recommended: false },
];

const topTemplateRank = new Map(
  TOP_TEMPLATE_IDS.map((templateId, index) => [templateId, index])
);

const STUDENT_TEMPLATE_IDS = new Set([
  'Academic', 'iit', 'iim', 'bits', 'xlri', 'mdi-gurgaon', 'nmims',
  'banasthali', 'bhu', 'lpu', 'nit', 'student-notes', 'career-launch',
  'associate-prime',
]);

const SERVICE_TEMPLATE_IDS = new Set([
  'teacher', 'doctor-profile', 'physician-care', 'medical', 'lawyer-trial',
  'chartered-accountant', 'accounting', 'designer', 'creative', 'marketing',
  'photographer-resume', 'actor-spotlight', 'chef-menu', 'painter-canvas',
  'influencer-media-kit', 'youtube-creator', 'motion-designer-board',
]);

const getTemplateCategory = (templateId) => {
  if (STUDENT_TEMPLATE_IDS.has(templateId)) return 'Students';
  if (SERVICE_TEMPLATE_IDS.has(templateId)) return 'Services';
  return 'Professionals';
};

export const TEMPLATES = TEMPLATE_CATALOG.map((template) => ({
  ...template,
  category: getTemplateCategory(template.id),
  ...getTemplateSeoMetadata(template.id),
})).sort((left, right) => {
  const leftRank = topTemplateRank.get(left.id) ?? Number.MAX_SAFE_INTEGER;
  const rightRank = topTemplateRank.get(right.id) ?? Number.MAX_SAFE_INTEGER;
  return leftRank - rightRank;
});
