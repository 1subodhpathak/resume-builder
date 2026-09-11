import React, { forwardRef, useMemo } from 'react';
import { normalizeDocumentSettings } from './ResumePreview';
import FormattedTextBlock from './FormattedTextBlock';

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

const TEMPLATE_ACCENTS = {
  professional: { accent: '#0f766e', surface: '#f0fdfa', ink: '#0f172a' },
  minimal: { accent: '#111827', surface: '#f8fafc', ink: '#0f172a' },
  modern: { accent: '#2563eb', surface: '#eff6ff', ink: '#0f172a' },
  executive: { accent: '#1d4ed8', surface: '#eff6ff', ink: '#111827' },
  tech: { accent: '#0891b2', surface: '#ecfeff', ink: '#0f172a' },
};

const FONT_FAMILY_MAP = {
  inter: 'Inter, "Helvetica Neue", Arial, sans-serif',
  arial: 'Arial, Helvetica, sans-serif',
  times: '"Times New Roman", Times, serif',
  calibri: 'Calibri, "Segoe UI", Arial, sans-serif',
  helvetica: 'Helvetica, Arial, sans-serif',
  verdana: 'Verdana, Geneva, sans-serif',
  rubik: '"Rubik", "Inter", "Helvetica Neue", Arial, sans-serif',
  manrope: '"Manrope", "Inter", "Helvetica Neue", Arial, sans-serif',
  source: '"Source Sans 3", "Helvetica Neue", Arial, sans-serif',
  lora: '"Lora", Georgia, "Times New Roman", serif',
  georgia: 'Georgia, "Times New Roman", serif',
  garamond: 'Garamond, Baskerville, "Times New Roman", serif',
  mono: '"IBM Plex Mono", "SFMono-Regular", Consolas, monospace',
};

const BACKGROUNDS = {
  none: '',
  grid: 'linear-gradient(90deg, rgba(15,23,42,0.04) 1px, transparent 1px), linear-gradient(rgba(15,23,42,0.04) 1px, transparent 1px)',
  hex: 'radial-gradient(circle at 24px 24px, rgba(15,23,42,0.07) 2px, transparent 2px), radial-gradient(circle at 0 0, rgba(15,23,42,0.05) 2px, transparent 2px)',
  wave: 'repeating-radial-gradient(circle at 0 0, rgba(14,165,233,0.09), rgba(14,165,233,0.09) 2px, transparent 2px, transparent 18px)',
  lines: 'repeating-linear-gradient(135deg, rgba(15,23,42,0.04) 0 2px, transparent 2px 10px)',
  dots: 'radial-gradient(rgba(15,23,42,0.09) 1px, transparent 1px)',
  corner: 'linear-gradient(135deg, rgba(37,99,235,0.10), transparent 42%), linear-gradient(315deg, rgba(15,118,110,0.08), transparent 40%)',
  arc: 'radial-gradient(circle at 100% 0, rgba(37,99,235,0.10), transparent 36%), radial-gradient(circle at 0 100%, rgba(15,118,110,0.08), transparent 34%)',
};

const estimateSectionWeight = (id, data) => {
  switch (id) {
    case 'summary':
      return Math.max(1, Math.ceil((data.personal?.summary?.length || 0) / 180));
    case 'experience':
      return Math.max(2, (data.experience?.length || 0) * 3);
    case 'projects':
      return Math.max(1, (data.projects?.length || 0) * 2);
    case 'education':
      return Math.max(1, Math.ceil((data.education?.length || 0) * 1.5));
    case 'skills':
      return 2;
    case 'certifications':
    case 'awards':
    case 'languages':
    case 'volunteering':
      return Math.max(1, data[id]?.length || 1);
    default:
      return 1;
  }
};

const splitIntoColumns = (sectionIds, columnCount, data) => {
  const columns = Array.from({ length: columnCount }, () => ({ weight: 0, items: [] }));

  sectionIds.forEach((id) => {
    const weight = estimateSectionWeight(id, data);
    const targetIndex = columns.reduce((smallest, column, index) => (
      column.weight < columns[smallest].weight ? index : smallest
    ), 0);

    columns[targetIndex].items.push(id);
    columns[targetIndex].weight += weight;
  });

  return columns.map((column) => column.items);
};

const SectionCard = ({ title, accent, style, children }) => (
  <section
    data-pdf-block
    className="rounded-[20px] border border-slate-200 bg-white/95 shadow-[0_12px_32px_rgba(15,23,42,0.06)] p-5"
    style={style}
  >
    <div className="mb-4 flex items-center gap-3 border-b border-slate-100 pb-3" style={{ color: accent }}>
      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: accent }} />
      <h3 className="text-[11px] font-black uppercase tracking-[0.28em]">{title}</h3>
    </div>
    {children}
  </section>
);

const ExportResumeDocument = forwardRef(({ data, template = 'professional' }, ref) => {
  const theme = TEMPLATE_ACCENTS[template] || TEMPLATE_ACCENTS.professional;
  const settings = normalizeDocumentSettings(data?.documentSettings);
  const sectionOrder = (settings.sectionOrder?.length ? settings.sectionOrder : DEFAULT_SECTION_ORDER)
    .filter((id) => id !== 'header');
  const columnCount = Math.min(4, Math.max(1, Number(settings.columnLayout || 2)));
  const columns = useMemo(() => splitIntoColumns(sectionOrder, columnCount, data || {}), [sectionOrder, columnCount, data]);
  const backgroundImage = BACKGROUNDS[settings.backgroundPattern || 'none'];
  const backgroundSize = ['grid', 'dots'].includes(settings.backgroundPattern) ? '18px 18px' : '120px 120px';
  const layoutSpacing = data?.layoutSpacing || {};
  const documentStyle = {
    '--resume-page-margin': `${settings.pageMargin}px`,
    '--resume-section-gap': `${settings.sectionSpacing}px`,
    '--resume-font-scale': settings.fontScale,
    '--resume-line-height': settings.lineHeight,
    '--resume-font-family': FONT_FAMILY_MAP[settings.fontFamily] || FONT_FAMILY_MAP.inter,
  };

  const sectionWrapperStyle = (id) => {
    const extraTopSpacing = Number(layoutSpacing[id] || 0);
    return extraTopSpacing ? { marginTop: `${extraTopSpacing}px` } : undefined;
  };

  const renderSection = (id) => {
    switch (id) {
      case 'summary':
        return data?.personal?.summary ? (
          <SectionCard key={id} title="Professional Summary" accent={theme.accent} style={sectionWrapperStyle(id)}>
            <FormattedTextBlock
              text={data.personal.summary}
              plainClassName="text-sm text-slate-700 whitespace-pre-wrap"
              unorderedListClassName="space-y-1.5 pl-5 text-sm text-slate-700 list-disc"
              orderedListClassName="space-y-1.5 pl-5 text-sm text-slate-700 list-decimal"
            />
          </SectionCard>
        ) : null;
      case 'experience':
        return data?.experience?.length ? (
          <SectionCard key={id} title="Experience" accent={theme.accent} style={sectionWrapperStyle(id)}>
            <div className="space-y-5">
              {data.experience.map((item) => (
                <div key={item.id} className="experience-item" data-pdf-block>
                  <div className="flex items-start justify-between gap-4">
                  <div>
                      <h4 className="text-sm font-bold text-slate-900">{item.role}</h4>
                      <p className="text-xs font-bold uppercase tracking-[0.14em]" style={{ color: theme.accent }}>
                        {item.company}
                      </p>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">{item.date}</span>
                  </div>
                  <FormattedTextBlock
                    text={item.desc}
                    plainClassName="mt-3 text-sm text-slate-700 whitespace-pre-wrap"
                    unorderedListClassName="mt-3 space-y-1.5 pl-5 text-sm text-slate-700 list-disc"
                    orderedListClassName="mt-3 space-y-1.5 pl-5 text-sm text-slate-700 list-decimal"
                  />
                </div>
              ))}
            </div>
          </SectionCard>
        ) : null;
      case 'projects':
        return data?.projects?.length ? (
          <SectionCard key={id} title="Projects" accent={theme.accent} style={sectionWrapperStyle(id)}>
            <div className="space-y-4">
              {data.projects.map((item) => (
                <div key={item.id} className="project-item" data-pdf-block>
                  <h4 className="text-sm font-bold text-slate-900">{item.name}</h4>
                  <FormattedTextBlock
                    text={item.desc}
                    plainClassName="mt-2 text-sm text-slate-700 whitespace-pre-wrap"
                    unorderedListClassName="mt-2 space-y-1.5 pl-5 text-sm text-slate-700 list-disc"
                    orderedListClassName="mt-2 space-y-1.5 pl-5 text-sm text-slate-700 list-decimal"
                  />
                </div>
              ))}
            </div>
          </SectionCard>
        ) : null;
      case 'education':
        return data?.education?.length ? (
          <SectionCard key={id} title="Education" accent={theme.accent} style={sectionWrapperStyle(id)}>
            <div className="space-y-4">
              {data.education.map((item) => (
                <div key={item.id} className="education-item" data-pdf-block>
                  <h4 className="text-sm font-bold text-slate-900">{item.degree}</h4>
                  <p className="text-sm text-slate-700">{item.school}</p>
                  <p className="text-[11px] font-semibold text-slate-500">{item.date}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        ) : null;
      case 'skills': {
        const skills = [
          ...(data?.skills?.technical || []),
          ...(data?.skills?.core || []),
          ...(data?.skills?.soft || []),
        ].filter(Boolean);
        return skills.length ? (
          <SectionCard key={id} title="Skills" accent={theme.accent} style={sectionWrapperStyle(id)}>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <span
                  key={`${skill}-${index}`}
                  className="rounded-full border px-3 py-1.5 text-[11px] font-semibold text-slate-700"
                  style={{ borderColor: `${theme.accent}33`, backgroundColor: `${theme.accent}12` }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </SectionCard>
        ) : null;
      }
      case 'certifications':
        return data?.certifications?.length ? (
          <SectionCard key={id} title="Certifications" accent={theme.accent} style={sectionWrapperStyle(id)}>
            <div className="space-y-3">
              {data.certifications.map((item) => (
                <div key={item.id} data-pdf-block>
                  <h4 className="text-sm font-bold text-slate-900">{item.name}</h4>
                  <p className="text-sm text-slate-700">{[item.issuer, item.date].filter(Boolean).join(' • ')}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        ) : null;
      case 'awards':
        return data?.awards?.length ? (
          <SectionCard key={id} title="Awards" accent={theme.accent} style={sectionWrapperStyle(id)}>
            <div className="space-y-3">
              {data.awards.map((item) => (
                <div key={item.id} data-pdf-block>
                  <h4 className="text-sm font-bold text-slate-900">{item.name}</h4>
                  <p className="text-sm text-slate-700">{[item.issuer, item.date].filter(Boolean).join(' • ')}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        ) : null;
      case 'languages':
        return data?.languages?.length ? (
          <SectionCard key={id} title="Languages" accent={theme.accent} style={sectionWrapperStyle(id)}>
            <div className="space-y-2">
              {data.languages.map((item) => (
                <div key={item.id || item.name} className="flex items-center justify-between gap-4 text-sm" data-pdf-block>
                  <span className="font-medium text-slate-900">{item.name}</span>
                  <span className="text-slate-600">{item.level}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        ) : null;
      case 'volunteering':
        return data?.volunteering?.length ? (
          <SectionCard key={id} title="Volunteering" accent={theme.accent} style={sectionWrapperStyle(id)}>
            <div className="space-y-4">
              {data.volunteering.map((item) => (
                <div key={item.id} className="volunteering-item" data-pdf-block>
                  <h4 className="text-sm font-bold text-slate-900">{item.role}</h4>
                  <p className="text-sm text-slate-700">{[item.org, item.date].filter(Boolean).join(' • ')}</p>
                  <FormattedTextBlock
                    text={item.desc}
                    plainClassName="mt-2 text-sm text-slate-700 whitespace-pre-wrap"
                    unorderedListClassName="mt-2 space-y-1.5 pl-5 text-sm text-slate-700 list-disc"
                    orderedListClassName="mt-2 space-y-1.5 pl-5 text-sm text-slate-700 list-decimal"
                  />
                </div>
              ))}
            </div>
          </SectionCard>
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div ref={ref} className="resume-export-document resume-preview-wrapper resume-page-shell relative overflow-hidden bg-white" style={documentStyle}>
      <div className="pointer-events-none absolute inset-0 opacity-70" style={{ backgroundImage, backgroundSize }} />

      <div className="resume-page-shell__content relative z-10 min-h-full">
        <header
          className="rounded-[28px] border p-8 shadow-[0_24px_64px_rgba(15,23,42,0.08)]"
          style={{
            borderColor: `${theme.accent}22`,
            background: `linear-gradient(135deg, ${theme.surface}, white 65%)`,
            marginBottom: `${settings.sectionSpacing}px`,
          }}
        >
          <div className="flex items-start justify-between gap-6">
            <div className="max-w-[70%]">
              <div
                className="mb-3 inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em]"
                style={{ backgroundColor: `${theme.accent}14`, color: theme.accent }}
              >
                Professional Resume
              </div>
              <h1 className="text-[30px] font-black uppercase tracking-[0.06em]" style={{ color: theme.ink }}>
                {data?.personal?.name || 'Your Name'}
              </h1>
              {data?.personal?.title ? (
                <p className="mt-2 text-base font-semibold uppercase tracking-[0.22em]" style={{ color: theme.accent }}>
                  {data.personal.title}
                </p>
              ) : null}
            </div>

            <div className="space-y-2 text-right text-[12px] text-slate-600">
              {data?.personal?.email ? <div>{data.personal.email}</div> : null}
              {data?.personal?.phone ? <div>{data.personal.phone}</div> : null}
              {data?.personal?.location ? <div>{data.personal.location}</div> : null}
              {data?.personal?.linkedin ? <div>{data.personal.linkedin}</div> : null}
            </div>
          </div>
        </header>

        <main
          className="grid items-start"
          style={{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`, gap: '20px' }}
        >
          {columns.map((column, index) => (
            <div key={`column-${index}`} className="space-y-5">
              {column.map((sectionId) => renderSection(sectionId))}
            </div>
          ))}
        </main>
      </div>
    </div>
  );
});

export default ExportResumeDocument;
