import React, { Fragment, useMemo } from 'react';
import FormattedTextBlock from './FormattedTextBlock';
import PreviewEditableField from './PreviewEditableField';

const DEFAULT_SECTION_ORDER = [
  'summary',
  'experience',
  'projects',
  'education',
  'skills',
  'certifications',
  'awards',
  'languages',
  'volunteering',
];

const SECTION_TITLES = {
  summary: 'Professional Summary',
  experience: 'Experience',
  projects: 'Projects',
  education: 'Education',
  skills: 'Skills',
  certifications: 'Certifications',
  awards: 'Awards',
  languages: 'Languages',
  volunteering: 'Volunteering',
};

const CLASSIC_IDS = new Set([
  'professional', 'Ats', 'minimal', 'classic', 'formal', 'Academic', 'ocean-ats',
  'executive', 'rule-minimalist', 'japanese', 'card', 'medical',
]);

const SIDEBAR_IDS = new Set([
  'software-engineer', 'data-scientist', 'developer', 'coder', 'cyan-grid', 'accent-grid',
  'engineer', 'business-analyst', 'indigo-elite', 'product-manager', 'professional-columns',
  'bordered-elegant', 'modern', 'cloud-soft', 'soft-serif', 'sand-minimal',
  'marine-clean', 'mint-fresh', 'sunset-slim', 'teacher', 'teal-innovator',
  'navy-sidebar', 'forest-sidebar', 'slate-duo', 'crimson-sidebar', 'ruby-creative',
  'orange-punch', 'blue-frame', 'brick-formal', 'marine-compact',
]);

const FEATURE_IDS = new Set([
  'designer', 'creative', 'marketing', 'Artistic', 'startup', 'amber-visual',
  'skyline', 'mocha-creative', 'bubble-header', 'Mosaic', 'Architect',
  'block-branding', 'modern-circle', 'azure-pro', 'pointer-banner', 'centered-initials',
]);

const METRICS_IDS = new Set([
  'infographic', 'metro', 'info-blue', 'info-executive', 'info-teal', 'info-green', 'info-navy',
]);

const PALETTES = [
  { accent: '#0f766e', ink: '#0f172a', muted: '#475569', line: '#cbd5e1', surface: '#f0fdfa', strong: '#134e4a' },
  { accent: '#1d4ed8', ink: '#0f172a', muted: '#475569', line: '#cbd5e1', surface: '#eff6ff', strong: '#1e3a8a' },
  { accent: '#7c2d12', ink: '#111827', muted: '#4b5563', line: '#d6d3d1', surface: '#fff7ed', strong: '#9a3412' },
  { accent: '#7c3aed', ink: '#111827', muted: '#4b5563', line: '#ddd6fe', surface: '#f5f3ff', strong: '#5b21b6' },
  { accent: '#b45309', ink: '#111827', muted: '#4b5563', line: '#fde68a', surface: '#fffbeb', strong: '#92400e' },
  { accent: '#be123c', ink: '#111827', muted: '#4b5563', line: '#fecdd3', surface: '#fff1f2', strong: '#9f1239' },
  { accent: '#0f172a', ink: '#0f172a', muted: '#475569', line: '#cbd5e1', surface: '#f8fafc', strong: '#020617' },
  { accent: '#0369a1', ink: '#0f172a', muted: '#475569', line: '#bae6fd', surface: '#f0f9ff', strong: '#075985' },
  { accent: '#166534', ink: '#0f172a', muted: '#475569', line: '#bbf7d0', surface: '#f0fdf4', strong: '#14532d' },
];

const hashString = (value = '') =>
  value.split('').reduce((total, char) => ((total << 5) - total) + char.charCodeAt(0), 0);

const hasContent = (sectionId, data) => {
  switch (sectionId) {
    case 'summary':
      return Boolean(data.personal?.summary?.trim());
    case 'experience':
      return Boolean(data.experience?.length);
    case 'projects':
      return Boolean(data.projects?.length);
    case 'education':
      return Boolean(data.education?.length);
    case 'skills':
      return Boolean([
        ...(data.skills?.technical || []),
        ...(data.skills?.core || []),
        ...(data.skills?.soft || []),
      ].filter(Boolean).length);
    case 'certifications':
      return Boolean(data.certifications?.length);
    case 'awards':
      return Boolean(data.awards?.length);
    case 'languages':
      return Boolean(data.languages?.length);
    case 'volunteering':
      return Boolean(data.volunteering?.length);
    default:
      return false;
  }
};

const getLayout = (templateId) => {
  if (CLASSIC_IDS.has(templateId)) return 'classic';
  if (FEATURE_IDS.has(templateId)) return 'feature';
  if (METRICS_IDS.has(templateId)) return 'metrics';
  if (SIDEBAR_IDS.has(templateId)) return 'sidebar';
  return 'editorial';
};

const getTheme = (templateId) => {
  const palette = PALETTES[Math.abs(hashString(templateId)) % PALETTES.length];
  const layout = getLayout(templateId);

  return {
    ...palette,
    layout,
    showPhoto: !['Ats', 'minimal', 'classic', 'formal', 'Academic', 'executive', 'teacher'].includes(templateId),
    nameSize: layout === 'feature' ? 'text-[42px]' : layout === 'classic' ? 'text-[36px]' : 'text-[38px]',
    titleTracking: layout === 'classic' ? 'tracking-[0.32em]' : 'tracking-[0.24em]',
  };
};

const sectionSpacingStyle = (sectionId, data) => {
  const extraSpacing = data.layoutSpacing?.[sectionId];
  return extraSpacing ? { marginTop: `${extraSpacing}px` } : undefined;
};

const sectionHeader = (title, theme) => (
  <div className="mb-4 flex items-center gap-3 border-b pb-3" style={{ borderColor: theme.line }}>
    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: theme.accent }} />
    <h3 className="text-[11px] font-black uppercase tracking-[0.28em]" style={{ color: theme.strong }}>
      {title}
    </h3>
  </div>
);

const sectionShellClass = (theme) => {
  switch (theme.layout) {
    case 'feature':
      return 'rounded-[28px] border bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.07)]';
    case 'metrics':
      return 'rounded-[24px] border bg-white p-5 shadow-[0_14px_34px_rgba(15,23,42,0.06)]';
    case 'sidebar':
      return 'rounded-[22px] border bg-white p-5';
    case 'editorial':
      return 'border-t pt-5';
    default:
      return 'rounded-[22px] border bg-white p-5';
  }
};

const ContactLine = ({ personal, theme }) => {
  const contactItems = [personal.email, personal.phone, personal.location, personal.linkedin].filter(Boolean);
  if (!contactItems.length) return null;

  return (
    <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-[12px] font-medium" style={{ color: theme.muted }}>
      {contactItems.map((item) => (
        <PreviewEditableField
          key={item}
          path={
            item === personal.email ? 'personal.email'
              : item === personal.phone ? 'personal.phone'
                : item === personal.location ? 'personal.location'
                  : 'personal.linkedin'
          }
          label={
            item === personal.email ? 'Email'
              : item === personal.phone ? 'Phone'
                : item === personal.location ? 'Location'
                  : 'LinkedIn'
          }
          className="rounded-full border px-3 py-1"
          style={{ borderColor: theme.line, backgroundColor: `${theme.surface}` }}
        >
          {item}
        </PreviewEditableField>
      ))}
    </div>
  );
};

const SkillsChips = ({ skills, theme }) => {
  const tags = [
    ...(skills?.technical || []),
    ...(skills?.core || []),
    ...(skills?.soft || []),
  ].filter(Boolean);

  if (!tags.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag, index) => (
        <span
          key={`${tag}-${index}`}
          className="rounded-full border px-3 py-1.5 text-[11px] font-semibold"
          style={{ borderColor: `${theme.accent}30`, backgroundColor: `${theme.accent}10`, color: theme.strong }}
        >
          {tag}
        </span>
      ))}
    </div>
  );
};

const SummarySection = ({ data, theme }) => (
  <section data-section-id="summary" data-pdf-block className={sectionShellClass(theme)} style={sectionSpacingStyle('summary', data)}>
    {sectionHeader(SECTION_TITLES.summary, theme)}
    <FormattedTextBlock
      text={data.personal.summary}
      editablePath="personal.summary"
      editableLabel="Professional Summary"
      plainClassName="text-sm leading-7 text-slate-700 whitespace-pre-wrap"
      unorderedListClassName="space-y-2 pl-5 text-sm leading-7 text-slate-700 list-disc"
      orderedListClassName="space-y-2 pl-5 text-sm leading-7 text-slate-700 list-decimal"
    />
  </section>
);

const ExperienceSection = ({ data, theme }) => (
  <section data-section-id="experience" data-pdf-block className={sectionShellClass(theme)} style={sectionSpacingStyle('experience', data)}>
    {sectionHeader(SECTION_TITLES.experience, theme)}
    <div className="space-y-5">
      {(data.experience || []).map((item, index) => (
        <div key={item.id} className="experience-item" data-pdf-block>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <PreviewEditableField path={`experience[${index}].role`} label="Experience Role" as="h4" className="text-sm font-bold text-slate-900">
                {item.role}
              </PreviewEditableField>
              {item.company ? (
                <PreviewEditableField
                  path={`experience[${index}].company`}
                  label="Experience Company"
                  as="p"
                  className="mt-1 text-[12px] font-semibold uppercase tracking-[0.18em]"
                  style={{ color: theme.accent }}
                >
                  {item.company}
                </PreviewEditableField>
              ) : null}
            </div>
            {item.date ? (
              <PreviewEditableField path={`experience[${index}].date`} label="Experience Date" className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">
                {item.date}
              </PreviewEditableField>
            ) : null}
          </div>
          <FormattedTextBlock
            text={item.desc}
            editablePath={`experience[${index}].desc`}
            editableLabel="Experience Description"
            plainClassName="mt-3 text-sm leading-6 text-slate-700 whitespace-pre-wrap"
            unorderedListClassName="mt-3 space-y-1.5 pl-5 text-sm leading-6 text-slate-700 list-disc"
            orderedListClassName="mt-3 space-y-1.5 pl-5 text-sm leading-6 text-slate-700 list-decimal"
          />
        </div>
      ))}
    </div>
  </section>
);

const ProjectsSection = ({ data, theme }) => (
  <section data-section-id="projects" data-pdf-block className={sectionShellClass(theme)} style={sectionSpacingStyle('projects', data)}>
    {sectionHeader(SECTION_TITLES.projects, theme)}
    <div className="space-y-4">
      {(data.projects || []).map((item, index) => (
        <div key={item.id} className="project-item" data-pdf-block>
          <PreviewEditableField path={`projects[${index}].name`} label="Project Name" as="h4" className="text-sm font-bold text-slate-900">
            {item.name}
          </PreviewEditableField>
          <FormattedTextBlock
            text={item.desc}
            editablePath={`projects[${index}].desc`}
            editableLabel="Project Description"
            plainClassName="mt-2 text-sm leading-6 text-slate-700 whitespace-pre-wrap"
            unorderedListClassName="mt-2 space-y-1.5 pl-5 text-sm leading-6 text-slate-700 list-disc"
            orderedListClassName="mt-2 space-y-1.5 pl-5 text-sm leading-6 text-slate-700 list-decimal"
          />
        </div>
      ))}
    </div>
  </section>
);

const EducationSection = ({ data, theme }) => (
  <section data-section-id="education" data-pdf-block className={sectionShellClass(theme)} style={sectionSpacingStyle('education', data)}>
    {sectionHeader(SECTION_TITLES.education, theme)}
    <div className="space-y-4">
      {(data.education || []).map((item, index) => (
        <div key={item.id} className="education-item" data-pdf-block>
          <PreviewEditableField path={`education[${index}].degree`} label="Education Degree" as="h4" className="text-sm font-bold text-slate-900">
            {item.degree}
          </PreviewEditableField>
          {item.school ? (
            <PreviewEditableField path={`education[${index}].school`} label="Education School" as="p" className="text-sm text-slate-700">
              {item.school}
            </PreviewEditableField>
          ) : null}
          {item.date ? (
            <PreviewEditableField path={`education[${index}].date`} label="Education Date" as="p" className="text-[11px] font-semibold text-slate-500">
              {item.date}
            </PreviewEditableField>
          ) : null}
        </div>
      ))}
    </div>
  </section>
);

const SkillsSection = ({ data, theme }) => (
  <section data-section-id="skills" data-pdf-block className={sectionShellClass(theme)} style={sectionSpacingStyle('skills', data)}>
    {sectionHeader(SECTION_TITLES.skills, theme)}
    <SkillsChips skills={data.skills} theme={theme} />
  </section>
);

const CertificationsSection = ({ data, theme }) => (
  <section data-section-id="certifications" data-pdf-block className={sectionShellClass(theme)} style={sectionSpacingStyle('certifications', data)}>
    {sectionHeader(SECTION_TITLES.certifications, theme)}
    <div className="space-y-3">
      {(data.certifications || []).map((item) => (
        <div key={item.id} data-pdf-block>
          <h4 className="text-sm font-bold text-slate-900">{item.name}</h4>
          <p className="text-sm text-slate-700">{[item.issuer, item.date].filter(Boolean).join(' • ')}</p>
        </div>
      ))}
    </div>
  </section>
);

const AwardsSection = ({ data, theme }) => (
  <section data-section-id="awards" data-pdf-block className={sectionShellClass(theme)} style={sectionSpacingStyle('awards', data)}>
    {sectionHeader(SECTION_TITLES.awards, theme)}
    <div className="space-y-3">
      {(data.awards || []).map((item) => (
        <div key={item.id} data-pdf-block>
          <h4 className="text-sm font-bold text-slate-900">{item.name}</h4>
          <p className="text-sm text-slate-700">{[item.issuer, item.date].filter(Boolean).join(' • ')}</p>
        </div>
      ))}
    </div>
  </section>
);

const LanguagesSection = ({ data, theme }) => (
  <section data-section-id="languages" data-pdf-block className={sectionShellClass(theme)} style={sectionSpacingStyle('languages', data)}>
    {sectionHeader(SECTION_TITLES.languages, theme)}
    <div className="space-y-2">
      {(data.languages || []).map((item) => (
        <div key={item.id || item.name} className="flex items-center justify-between gap-4 text-sm" data-pdf-block>
          <span className="font-medium text-slate-900">{item.name}</span>
          <span className="text-slate-600">{item.level}</span>
        </div>
      ))}
    </div>
  </section>
);

const VolunteeringSection = ({ data, theme }) => (
  <section data-section-id="volunteering" data-pdf-block className={sectionShellClass(theme)} style={sectionSpacingStyle('volunteering', data)}>
    {sectionHeader(SECTION_TITLES.volunteering, theme)}
    <div className="space-y-4">
      {(data.volunteering || []).map((item, index) => (
        <div key={item.id} className="volunteering-item" data-pdf-block>
          <PreviewEditableField path={`volunteering[${index}].role`} label="Volunteering Role" as="h4" className="text-sm font-bold text-slate-900">
            {item.role}
          </PreviewEditableField>
          <p className="text-sm text-slate-700">{[item.org, item.date].filter(Boolean).join(' • ')}</p>
          <FormattedTextBlock
            text={item.desc}
            editablePath={`volunteering[${index}].desc`}
            editableLabel="Volunteering Description"
            plainClassName="mt-2 text-sm leading-6 text-slate-700 whitespace-pre-wrap"
            unorderedListClassName="mt-2 space-y-1.5 pl-5 text-sm leading-6 text-slate-700 list-disc"
            orderedListClassName="mt-2 space-y-1.5 pl-5 text-sm leading-6 text-slate-700 list-decimal"
          />
        </div>
      ))}
    </div>
  </section>
);

const SECTION_RENDERERS = {
  summary: SummarySection,
  experience: ExperienceSection,
  projects: ProjectsSection,
  education: EducationSection,
  skills: SkillsSection,
  certifications: CertificationsSection,
  awards: AwardsSection,
  languages: LanguagesSection,
  volunteering: VolunteeringSection,
};

const renderSections = (ids, data, theme) =>
  ids.map((sectionId) => {
    const Renderer = SECTION_RENDERERS[sectionId];
    if (!Renderer || !hasContent(sectionId, data)) return null;
    return <Renderer key={sectionId} data={data} theme={theme} />;
  });

const partitionSections = (order, preference = []) => {
  const sideSet = new Set(preference);
  return {
    main: order.filter((id) => !sideSet.has(id)),
    side: order.filter((id) => sideSet.has(id)),
  };
};

const Header = ({ data, theme }) => {
  const personal = data.personal || {};

  return (
    <header
      className={`relative overflow-hidden border-b px-8 py-8 ${theme.layout === 'feature' ? 'rounded-[32px] border shadow-[0_24px_60px_rgba(15,23,42,0.08)]' : ''}`}
      style={{
        borderColor: theme.line,
        background:
          theme.layout === 'feature'
            ? `linear-gradient(135deg, ${theme.surface}, white 55%)`
            : theme.layout === 'classic'
              ? `linear-gradient(180deg, white, ${theme.surface})`
              : 'white',
        marginBottom: `${data.documentSettings?.sectionSpacing || 28}px`,
      }}
      data-pdf-block
    >
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-20" style={{ backgroundColor: theme.accent }} />
      <div className="relative z-10 flex items-start justify-between gap-6">
        <div className="min-w-0 flex-1">
          <div className="mb-3 inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em]" style={{ backgroundColor: `${theme.accent}14`, color: theme.accent }}>
            {theme.layout === 'feature' ? 'Signature Profile' : 'Professional Resume'}
          </div>
          <div className="flex items-start gap-5">
            {theme.showPhoto && personal.photo ? (
              <img
                src={personal.photo}
                alt={personal.name || 'Profile'}
                className="h-24 w-24 rounded-3xl border object-cover shadow-sm"
                style={{ borderColor: `${theme.accent}35` }}
              />
            ) : null}
            <div className="min-w-0">
              <PreviewEditableField path="personal.name" label="Full Name" as="h1" className={`${theme.nameSize} font-black uppercase leading-none tracking-[0.04em] text-slate-900 break-words`}>
                {personal.name || 'Your Name'}
              </PreviewEditableField>
              {personal.title ? (
                <PreviewEditableField path="personal.title" label="Job Title" as="p" className={`mt-3 text-[12px] font-bold uppercase ${theme.titleTracking}`} style={{ color: theme.accent }}>
                  {personal.title}
                </PreviewEditableField>
              ) : null}
              <ContactLine personal={personal} theme={theme} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

const ClassicLayout = ({ orderedSections, data, theme }) => (
  <div className="min-h-[1100px] bg-white shadow-lg">
    <Header data={data} theme={theme} />
    <div className="space-y-5 px-8 pb-8">
      {renderSections(orderedSections, data, theme)}
    </div>
  </div>
);

const SidebarLayout = ({ orderedSections, data, theme }) => {
  const { main, side } = partitionSections(orderedSections, ['skills', 'certifications', 'awards', 'languages']);

  return (
    <div className="min-h-[1100px] overflow-hidden bg-white shadow-lg">
      <Header data={data} theme={theme} />
      <div className="grid grid-cols-[0.36fr_0.64fr] gap-0 px-0 pb-0">
        <aside className="min-h-full px-6 py-8" style={{ backgroundColor: theme.surface, borderRight: `1px solid ${theme.line}` }}>
          <div className="space-y-4">
            {renderSections(side, data, theme)}
          </div>
        </aside>
        <main className="px-8 py-8">
          <div className="space-y-5">
            {renderSections(main, data, theme)}
          </div>
        </main>
      </div>
    </div>
  );
};

const FeatureLayout = ({ orderedSections, data, theme }) => {
  const { main, side } = partitionSections(orderedSections, ['skills', 'languages', 'certifications', 'awards']);

  return (
    <div className="min-h-[1100px] bg-[linear-gradient(180deg,#ffffff,#f8fafc)] shadow-lg">
      <div className="px-8 pt-8">
        <Header data={data} theme={theme} />
      </div>
      <div className="grid grid-cols-[0.62fr_0.38fr] gap-6 px-8 pb-8">
        <main className="space-y-5">{renderSections(main, data, theme)}</main>
        <aside className="space-y-5">{renderSections(side, data, theme)}</aside>
      </div>
    </div>
  );
};

const MetricsLayout = ({ orderedSections, data, theme }) => {
  const { main, side } = partitionSections(orderedSections, ['skills', 'languages', 'certifications', 'awards']);

  return (
    <div className="min-h-[1100px] bg-white shadow-lg">
      <Header data={data} theme={theme} />
      <div className="px-8 pb-8">
        <div className="mb-6 grid grid-cols-3 gap-3">
          {[
            { label: 'Experience Entries', value: `${data.experience?.length || 0}` },
            { label: 'Projects', value: `${data.projects?.length || 0}` },
            { label: 'Skills', value: `${[...(data.skills?.technical || []), ...(data.skills?.core || []), ...(data.skills?.soft || [])].filter(Boolean).length}` },
          ].map((item) => (
            <div key={item.label} className="rounded-[20px] border px-4 py-4" style={{ borderColor: theme.line, backgroundColor: theme.surface }}>
              <div className="text-[10px] font-black uppercase tracking-[0.24em]" style={{ color: theme.accent }}>{item.label}</div>
              <div className="mt-2 text-2xl font-black text-slate-900">{item.value}</div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-[0.62fr_0.38fr] gap-6">
          <main className="space-y-5">{renderSections(main, data, theme)}</main>
          <aside className="space-y-5">{renderSections(side, data, theme)}</aside>
        </div>
      </div>
    </div>
  );
};

const EditorialLayout = ({ orderedSections, data, theme }) => {
  const { main, side } = partitionSections(orderedSections, ['skills', 'languages', 'certifications', 'awards']);

  return (
    <div className="min-h-[1100px] bg-white shadow-lg">
      <Header data={data} theme={theme} />
      <div className="grid grid-cols-[0.42fr_0.58fr] gap-8 px-8 pb-8">
        <aside className="space-y-5">
          {renderSections(side, data, theme)}
        </aside>
        <main className="space-y-5">
          {renderSections(main, data, theme)}
        </main>
      </div>
    </div>
  );
};

const UniversalTemplateRenderer = ({ data, template, documentSettings }) => {
  const safeData = {
    personal: {},
    experience: [],
    education: [],
    projects: [],
    skills: { technical: [], core: [], soft: [] },
    certifications: [],
    awards: [],
    languages: [],
    volunteering: [],
    layoutSpacing: {},
    documentSettings,
    ...data,
  };

  const orderedSections = useMemo(
    () => (documentSettings?.sectionOrder?.length ? documentSettings.sectionOrder : DEFAULT_SECTION_ORDER).filter((id) => hasContent(id, safeData)),
    [documentSettings?.sectionOrder, safeData]
  );

  const theme = useMemo(() => getTheme(template), [template]);

  const layoutProps = { orderedSections, data: safeData, theme };

  switch (theme.layout) {
    case 'classic':
      return <ClassicLayout {...layoutProps} />;
    case 'sidebar':
      return <SidebarLayout {...layoutProps} />;
    case 'feature':
      return <FeatureLayout {...layoutProps} />;
    case 'metrics':
      return <MetricsLayout {...layoutProps} />;
    default:
      return <EditorialLayout {...layoutProps} />;
  }
};

export default UniversalTemplateRenderer;
