import React from 'react';

const MISSING_FIELDS = {
  linkedin: new Set(['formal', 'rule-minimalist', 'indigo-elite', 'student-notes', 'chalkboard-artist', 'polaroid-portfolio', 'youtube-creator', 'actor-spotlight', 'chef-menu', 'painter-canvas', 'magazine-cover', 'Artistic', 'gamer-arena', 'mocha-creative', 'modern', 'ruby-creative', 'pointer-banner', 'modern-circle']),
  projects: new Set([]),
  awards: new Set(['executive']),
  certifications: new Set(['formal', 'software-engineer', 'motion-designer-board', 'photographer-resume', 'modern-circle']),
  languages: new Set(['Ats', 'formal', 'executive', 'rule-minimalist', 'software-engineer', 'reporting-mis', 'sales', 'photographer-resume', 'modern', 'pointer-banner', 'modern-circle']),
  volunteering: new Set(['Ats', 'minimal', 'formal', 'classic', 'executive', 'rule-minimalist', 'professional', 'japanese', 'card', 'luxe', 'centered-initials', 'Architect', 'software-engineer', 'data-scientist', 'tech', 'developer', 'class-file-dark', 'coder', 'cyan-grid', 'accent-grid', 'engineer', 'business-analyst', 'reporting-mis', 'indigo-elite', 'product-manager', 'accounting', 'sales', 'impact-header', 'modern-gold', 'professional-columns', 'bordered-elegant', 'marketing', 'motion-designer-board', 'student-notes', 'chalkboard-artist', 'polaroid-portfolio', 'influencer-media-kit', 'youtube-creator', 'actor-spotlight', 'chef-menu', 'painter-canvas', 'magazine-cover', 'Artistic', 'startup', 'gamer-arena', 'newspaper-editorial', 'photographer-resume', 'metro', 'berlin', 'amber-visual', 'skyline', 'mocha-creative', 'bubble-header', 'Mosaic', 'modern', 'cloud-soft', 'soft-serif', 'sunset-slim', 'doctor-profile', 'physician-care', 'medical', 'teacher', 'teal-innovator', 'navy-sidebar', 'forest-sidebar', 'crimson-sidebar', 'ruby-creative', 'orange-punch', 'blue-frame', 'brick-formal', 'pointer-banner', 'block-branding', 'modern-circle', 'azure-pro', 'info-blue', 'info-executive', 'info-teal', 'info-green', 'info-navy']),
};

export const templateNeedsLinkedInFallback = (templateId) =>
  MISSING_FIELDS.linkedin.has(templateId);

const hasItems = (items) => Array.isArray(items) && items.some(Boolean);

const DetailList = ({ items, renderTitle, renderMeta, renderBody }) => (
  <div className="space-y-4">
    {items.filter(Boolean).map((item, index) => (
      <article key={item?.id || `${renderTitle(item)}-${index}`} data-pdf-block className="break-inside-avoid">
        <div className="flex items-start justify-between gap-5">
          <h3 className="text-[12px] font-bold text-slate-900">{renderTitle(item)}</h3>
          {renderMeta(item) ? <span className="shrink-0 text-[9px] font-semibold text-slate-500">{renderMeta(item)}</span> : null}
        </div>
        {renderBody(item) ? <p className="mt-1.5 whitespace-pre-wrap text-[10px] leading-[1.55] text-slate-600">{renderBody(item)}</p> : null}
      </article>
    ))}
  </div>
);

const AddendumSection = ({ title, children }) => (
  <section data-pdf-block className="break-inside-avoid">
    <h2 className="mb-4 border-b border-slate-300 pb-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-700">
      {title}
    </h2>
    {children}
  </section>
);

const TemplateDataCompleteness = ({ templateId, data, children }) => {
  const personal = data?.personal || {};
  const fallbackSections = {
    projects: MISSING_FIELDS.projects.has(templateId) && hasItems(data?.projects) ? data.projects : [],
    awards: MISSING_FIELDS.awards.has(templateId) && hasItems(data?.awards) ? data.awards : [],
    certifications: MISSING_FIELDS.certifications.has(templateId) && hasItems(data?.certifications) ? data.certifications : [],
    languages: MISSING_FIELDS.languages.has(templateId) && hasItems(data?.languages) ? data.languages : [],
    volunteering: MISSING_FIELDS.volunteering.has(templateId) && hasItems(data?.volunteering) ? data.volunteering : [],
  };

  // Contact details are handled inline by ResumePreview. A LinkedIn, website,
  // or portfolio value must never create a standalone continuation page.
  const needsAddendum = Object.values(fallbackSections).some(hasItems);
  if (!needsAddendum) return children;

  return (
    <div className="resume-preview-wrapper resume-completeness-document w-full" data-resume-completeness-document="true">
      <div className="resume-completeness-template">{children}</div>
      <div className="min-h-[297mm] w-full bg-white px-[14mm] py-[13mm] font-sans text-slate-800">
        <header className="mb-9 border-b-2 border-slate-900 pb-5">
          <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-slate-500">Continued Information</p>
          <h1 className="mt-2 text-[22px] font-black tracking-tight text-slate-950">{personal.name || 'Resume'}</h1>
        </header>

        <main className="space-y-9">
          {hasItems(fallbackSections.projects) ? (
            <AddendumSection title="Projects">
              <DetailList items={fallbackSections.projects} renderTitle={(item) => item?.name || 'Project'} renderMeta={(item) => item?.date || ''} renderBody={(item) => item?.desc || ''} />
            </AddendumSection>
          ) : null}
          {hasItems(fallbackSections.awards) ? (
            <AddendumSection title="Awards">
              <DetailList items={fallbackSections.awards} renderTitle={(item) => item?.name || 'Award'} renderMeta={(item) => item?.date || ''} renderBody={(item) => item?.issuer || item?.desc || ''} />
            </AddendumSection>
          ) : null}
          {hasItems(fallbackSections.certifications) ? (
            <AddendumSection title="Certifications">
              <DetailList items={fallbackSections.certifications} renderTitle={(item) => item?.name || 'Certification'} renderMeta={(item) => item?.date || ''} renderBody={(item) => item?.issuer || ''} />
            </AddendumSection>
          ) : null}
          {hasItems(fallbackSections.languages) ? (
            <AddendumSection title="Languages">
              <div className="flex flex-wrap gap-3">
                {fallbackSections.languages.filter(Boolean).map((item, index) => {
                  const name = typeof item === 'string' ? item : item?.name;
                  const level = typeof item === 'string' ? '' : item?.level;
                  return <span key={item?.id || `${name}-${index}`} className="rounded-full border border-slate-300 px-3 py-1.5 text-[9px]"><strong>{name}</strong>{level ? ` - ${level}` : ''}</span>;
                })}
              </div>
            </AddendumSection>
          ) : null}
          {hasItems(fallbackSections.volunteering) ? (
            <AddendumSection title="Volunteering">
              <DetailList items={fallbackSections.volunteering} renderTitle={(item) => item?.role || item?.name || 'Volunteer Experience'} renderMeta={(item) => item?.date || ''} renderBody={(item) => [item?.org, item?.desc].filter(Boolean).join('\n')} />
            </AddendumSection>
          ) : null}
        </main>
      </div>
    </div>
  );
};

export default TemplateDataCompleteness;
