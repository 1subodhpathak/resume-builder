import { mergeExperienceFragmentsOnPage } from '../templateSurfaceUtils';
import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import FormattedTextBlock from '../FormattedTextBlock';
import PreviewEditableField from '../PreviewEditableField';

const splitForPagination = (text = '') => {
  const raw = String(text || '').trim();
  if (!raw) return [];

  const sourceLines = raw
    .split(/\r?\n/)
    .map((line) => line.replace(/^[•\-–—]\s*/, '').trim())
    .filter(Boolean);

  if (sourceLines.length > 1) return sourceLines;
  if (raw.length <= 260) return [raw];

  const sentences = raw
    .split(/(?<=[.!?])\s+/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (sentences.length > 1) return sentences;

  const words = raw.split(/\s+/);
  const chunks = [];

  for (let i = 0; i < words.length; i += 34) {
    chunks.push(words.slice(i, i + 34).join(' '));
  }

  return chunks;
};

const chunkArray = (items = [], size = 8) => {
  const safe = Array.isArray(items) ? items : [];
  const chunks = [];

  for (let i = 0; i < safe.length; i += size) {
    chunks.push(safe.slice(i, i + size));
  }

  return chunks;
};

const Minimal = ({ data }) => {
  const {
    personal = {},
    experience = [],
    education = [],
    skills = {},
    projects = [],
    certifications = [],
    languages = [],
    awards = [],
  } = data || {};

  const {
    core = [],
    technical = [],
    soft = [],
  } = skills;

  const PAGE_WIDTH = '210mm';
  const PAGE_HEIGHT = '297mm';
  const CONTENT_WIDTH = '182mm';
  const CONTENT_HEIGHT = '269mm';

  const measureRefs = useRef({});
  const sectionHeaderRefs = useRef({});
  const fullHeaderMeasureRef = useRef(null);
  const continuationHeaderMeasureRef = useRef(null);
  const contentHeightMeasureRef = useRef(null);

  const [pages, setPages] = useState([]);

  const allSkills = useMemo(
    () => [
      ...core,
      ...technical,
      ...soft,
    ].filter(Boolean),
    [core, technical, soft]
  );

  const blocks = useMemo(() => {
    const next = [];

    if (personal.summary?.trim()) {
      const units = splitForPagination(personal.summary);
      const chunks = units.length ? chunkArray(units, 3) : [];

      chunks.forEach((lines, chunkIndex) => {
        next.push({
          id: `summary-${chunkIndex}`,
          section: 'summary',
          type: 'summary',
          lines,
          continuation: chunkIndex > 0,
        });
      });
    }

    experience.forEach((exp, index) => {
      const units = splitForPagination(exp.desc);
      const chunks = [];

      if (!units.length) {
        chunks.push([]);
      } else {
        // Keep the first chunk small so another role can start in genuine
        // leftover space rather than moving wholesale to the next page.
        chunks.push(units.slice(0, 2));

        for (let i = 2; i < units.length; i += 3) {
          chunks.push(units.slice(i, i + 3));
        }
      }

      chunks.forEach((lines, chunkIndex) => {
        next.push({
          id: `experience-${exp.id || index}-${chunkIndex}`,
          section: 'experience',
          type: 'experience',
          exp,
          index,
          lines,
          continuation: chunkIndex > 0,
          forceBreak: Boolean(exp.pageBreak && chunkIndex === 0),
        });
      });
    });

    if (allSkills.length) {
      chunkArray(allSkills, 14).forEach((items, index) => {
        next.push({
          id: `skills-${index}`,
          section: 'skills',
          type: 'skills',
          items,
        });
      });
    }

    projects.forEach((project, index) => {
      const units = splitForPagination(project.desc);
      const chunks = units.length ? chunkArray(units, 3) : [[]];

      chunks.forEach((lines, chunkIndex) => {
        next.push({
          id: `project-${project.id || index}-${chunkIndex}`,
          section: 'projects',
          type: 'project',
          project,
          index,
          lines,
          continuation: chunkIndex > 0,
          forceBreak: Boolean(project.pageBreak && chunkIndex === 0),
        });
      });
    });

    education.forEach((edu, index) => {
      next.push({
        id: `education-${edu.id || index}`,
        section: 'education',
        type: 'education',
        edu,
        index,
        forceBreak: Boolean(edu.pageBreak),
      });
    });

    certifications.forEach((cert, index) => {
      next.push({
        id: `certification-${cert.id || index}`,
        section: 'certifications',
        type: 'certification',
        cert,
        index,
        forceBreak: Boolean(cert.pageBreak),
      });
    });

    awards.forEach((award, index) => {
      next.push({
        id: `award-${award.id || index}`,
        section: 'awards',
        type: 'award',
        award,
        index,
        forceBreak: Boolean(award.pageBreak),
      });
    });

    languages.forEach((language, index) => {
      next.push({
        id: `language-${language.id || index}`,
        section: 'languages',
        type: 'language',
        language,
        index,
        forceBreak: Boolean(language.pageBreak),
      });
    });

    return next;
  }, [
    allSkills,
    awards,
    certifications,
    education,
    experience,
    languages,
    personal.summary,
    projects,
  ]);

  const sectionTitles = {
    summary: 'Profile',
    experience: 'Experience',
    skills: 'Expertise',
    projects: 'Projects',
    education: 'Education',
    certifications: 'Certifications',
    awards: 'Awards',
    languages: 'Languages',
  };

  const SectionTitle = ({ sectionId }) => (
    <div className="pb-3">
      <h2 className="border-b border-slate-200 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
        {sectionTitles[sectionId]}
      </h2>
    </div>
  );

  const FullHeader = ({ measureRef = null }) => (
    <header
      ref={measureRef}
      className="mb-5 border-b border-slate-200 pb-4 text-center"
    >
      <PreviewEditableField
        path="personal.name"
        label="Full Name"
        as="h1"
        className="text-[28px] font-normal uppercase leading-tight tracking-[0.14em] text-slate-900"
        style={{}}
      >
        {personal.name || 'Your Name'}
      </PreviewEditableField>

      {personal.title ? (
        <PreviewEditableField
          path="personal.title"
          label="Professional Title"
          className="mt-1.5 block text-[10px] italic text-slate-600"
        style={{}}
      >
          {personal.title}
        </PreviewEditableField>
      ) : null}

      <div className="mt-2.5 flex flex-wrap justify-center gap-x-3 gap-y-1 font-sans text-[8.8px] tracking-wide text-slate-500">
        {[
          personal.email ? { key: 'email', value: personal.email } : null,
          personal.phone ? { key: 'phone', value: personal.phone } : null,
          personal.location ? { key: 'location', value: personal.location } : null,
          personal.linkedin ? { key: 'linkedin', value: personal.linkedin } : null,
          personal.github ? { key: 'github', value: `GitHub: ${personal.github}` } : null,
          personal.portfolio ? { key: 'portfolio', value: `Portfolio: ${personal.portfolio}` } : null,
          personal.website ? { key: 'website', value: `Website: ${personal.website}` } : null,
        ].filter(Boolean).map((item, idx) => (
          <React.Fragment key={item.key}>
            {idx > 0 && <span>|</span>}
            <span className="break-all">{item.value}</span>
          </React.Fragment>
        ))}
      </div>
    </header>
  );

  const ContinuationHeader = ({
    measureRef = null,
    pageNumber = 2,
  }) => (
    <header ref={measureRef} className="mb-4 border-b border-slate-200 pb-3">
      <div className="flex items-end justify-between gap-6">
        <div>
          <div className="text-[13px] font-bold uppercase tracking-[0.07em] text-slate-900">
            {personal.name || 'Your Name'}
          </div>

          {personal.title ? (
            <div className="mt-0.5 text-[8.8px] italic text-slate-500">
              {personal.title}
            </div>
          ) : null}
        </div>

        <div className="font-sans text-[8px] font-bold uppercase tracking-[0.12em] text-slate-400">
          Page {pageNumber}
        </div>
      </div>
    </header>
  );

  const renderTextLines = (
    lines,
    {
      measurement = false,
      editablePath = '',
      editableLabel = '',
      className = 'text-[9.8px] leading-[1.52] text-slate-700',
    } = {}
  ) => {
    if (!lines?.length) return null;

    const text = lines.join('\n');

    if (measurement) {
      return (
        <div className={`whitespace-pre-wrap ${className}`}>
          {text}
        </div>
      );
    }

    const formattedBlock = (
      <FormattedTextBlock
        text={text}
        plainClassName={`${className} whitespace-pre-wrap`}
        unorderedListClassName={`pl-4 list-disc space-y-1 ${className}`}
        orderedListClassName={`pl-4 list-decimal space-y-1 ${className}`}
        editablePath={editablePath}
        editableLabel={editableLabel}
      />
    );

    if (!editablePath) {
      return formattedBlock;
    }

    return (
      <PreviewEditableField
        path={editablePath}
        label={editableLabel || 'Editable Text'}
        as="div"
        className="block"
        style={{}}
      >
        {formattedBlock}
      </PreviewEditableField>
    );
  };

  const renderBlock = (block, { measurement = false } = {}) => {
    if (block.type === 'summary') {
      return (
        <div className="pb-4">
          {renderTextLines(block.lines, {
            measurement,
            editablePath: 'personal.summary',
            editableLabel: 'Professional Summary',
            className: 'text-[10px] leading-[1.58] text-slate-700 text-center',
          })}
        </div>
      );
    }

    if (block.type === 'experience') {
      const { exp, index } = block;

      return (
        <article className="pb-4">
          <div className="grid grid-cols-12 gap-5">
            <div className="col-span-3 border-r border-slate-200 pr-5 text-right">
              {!block.continuation && exp.date ? (
                <p className="text-[9px] font-bold leading-[1.35] text-slate-900">
                  {measurement ? (
                    exp.date
                  ) : (
                    <PreviewEditableField
                      path={`experience[${index}].date`}
                      label="Experience Date"
                      className="inline"
                      style={{}}
                    >
                      {exp.date}
                    </PreviewEditableField>
                  )}
                </p>
              ) : null}

              {!block.continuation && exp.company ? (
                <p className="mt-1.5 text-[9px] italic leading-[1.4] text-slate-500">
                  {measurement ? (
                    exp.company
                  ) : (
                    <PreviewEditableField
                      path={`experience[${index}].company`}
                      label="Experience Company"
                      className="inline"
                      style={{}}
                    >
                      {exp.company}
                    </PreviewEditableField>
                  )}
                </p>
              ) : null}
            </div>

            <div className="col-span-9 pl-1">
              <h3 className="mb-1.5 text-[11.5px] font-bold leading-tight text-slate-900">
                {measurement ? (
                  <>
                    {exp.role}
                    {block.continuation ? ' (continued)' : ''}
                  </>
                ) : (
                  <>
                    <PreviewEditableField
                      path={`experience[${index}].role`}
                      label="Experience Role"
                      className="inline"
                      style={{}}
                    >
                      {exp.role}
                    </PreviewEditableField>
                    {block.continuation ? (
                      <span className="ml-1 text-[7px] font-normal italic text-slate-500">
                        (continued)
                      </span>
                    ) : null}
                  </>
                )}
              </h3>

              {renderTextLines(block.lines, {
                measurement,
                editablePath: `experience[${index}].desc`,
                editableLabel: 'Experience Description',
                className: 'text-[9.8px] leading-[1.52] text-slate-700',
              })}
            </div>
          </div>
        </article>
      );
    }

    if (block.type === 'skills') {
      return (
        <div className="pb-4">
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {block.items.map((skill, index) => (
              <span
                key={`${block.id}-${index}`}
                className="border-b border-slate-200 pb-0.5 text-[9.6px] italic text-slate-700"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      );
    }

    if (block.type === 'project') {
      const { project, index } = block;

      return (
        <div className="pb-4">
          <div className="mb-1 text-[10.5px] font-bold text-slate-900">
            {measurement ? (
              <>
                {project.name}
                {block.continuation ? ' (continued)' : ''}
              </>
            ) : (
              <>
                <PreviewEditableField
                  path={`projects[${index}].name`}
                  label="Project Name"
                  className="inline"
                      style={{}}
                    >
                  {project.name}
                </PreviewEditableField>
                {block.continuation ? (
                  <span className="ml-1 text-[7px] font-normal italic text-slate-500">
                    (continued)
                  </span>
                ) : null}
              </>
            )}
          </div>

          {renderTextLines(block.lines, {
            measurement,
            editablePath: `projects[${index}].desc`,
            editableLabel: 'Project Description',
            className: 'text-[9.6px] leading-[1.5] text-slate-600',
          })}
        </div>
      );
    }

    if (block.type === 'education') {
      const { edu, index } = block;

      return (
        <div className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-[10.5px] font-bold leading-tight text-slate-900">
                {measurement ? (
                  edu.school
                ) : (
                  <PreviewEditableField
                    path={`education[${index}].school`}
                    label="Education School"
                    className="inline"
                      style={{}}
                    >
                    {edu.school}
                  </PreviewEditableField>
                )}
              </div>

              {edu.degree ? (
                <div className="mt-1 text-[9.6px] leading-[1.45] text-slate-600">
                  {measurement ? (
                    edu.degree
                  ) : (
                    <PreviewEditableField
                      path={`education[${index}].degree`}
                      label="Education Degree"
                      className="inline"
                      style={{}}
                    >
                      {edu.degree}
                    </PreviewEditableField>
                  )}
                </div>
              ) : null}
            </div>

            {edu.date ? (
              <div className="shrink-0 text-[8.8px] text-slate-400">
                {measurement ? (
                  edu.date
                ) : (
                  <PreviewEditableField
                    path={`education[${index}].date`}
                    label="Education Date"
                    className="inline"
                      style={{}}
                    >
                    {edu.date}
                  </PreviewEditableField>
                )}
              </div>
            ) : null}
          </div>
        </div>
      );
    }

    if (block.type === 'certification') {
      const { cert, index } = block;

      return (
        <div className="pb-2.5">
          <div className="text-[10px] font-bold text-slate-900">
            {measurement ? (
              cert.name
            ) : (
              <PreviewEditableField
                path={`certifications[${index}].name`}
                label="Certification Name"
                className="inline"
                      style={{}}
                    >
                {cert.name}
              </PreviewEditableField>
            )}
          </div>

          {(cert.issuer || cert.date) ? (
            <div className="mt-1 text-[9px] text-slate-500">
              {measurement ? (
                [cert.issuer, cert.date].filter(Boolean).join(' • ')
              ) : (
                <>
                  {cert.issuer ? (
                    <PreviewEditableField
                      path={`certifications[${index}].issuer`}
                      label="Certification Issuer"
                      className="inline"
                      style={{}}
                    >
                      {cert.issuer}
                    </PreviewEditableField>
                  ) : null}
                  {cert.issuer && cert.date ? ' • ' : null}
                  {cert.date ? (
                    <PreviewEditableField
                      path={`certifications[${index}].date`}
                      label="Certification Date"
                      className="inline"
                      style={{}}
                    >
                      {cert.date}
                    </PreviewEditableField>
                  ) : null}
                </>
              )}
            </div>
          ) : null}
        </div>
      );
    }

    if (block.type === 'award') {
      const { award, index } = block;

      return (
        <div className="pb-2.5">
          <div className="text-[10px] font-bold text-slate-900">
            {measurement ? (
              award.name
            ) : (
              <PreviewEditableField
                path={`awards[${index}].name`}
                label="Award Name"
                className="inline"
                      style={{}}
                    >
                {award.name}
              </PreviewEditableField>
            )}
          </div>

          {(award.issuer || award.date) ? (
            <div className="mt-1 text-[9px] text-slate-500">
              {measurement ? (
                [award.issuer, award.date].filter(Boolean).join(' • ')
              ) : (
                <>
                  {award.issuer ? (
                    <PreviewEditableField
                      path={`awards[${index}].issuer`}
                      label="Award Issuer"
                      className="inline"
                      style={{}}
                    >
                      {award.issuer}
                    </PreviewEditableField>
                  ) : null}
                  {award.issuer && award.date ? ' • ' : null}
                  {award.date ? (
                    <PreviewEditableField
                      path={`awards[${index}].date`}
                      label="Award Date"
                      className="inline"
                      style={{}}
                    >
                      {award.date}
                    </PreviewEditableField>
                  ) : null}
                </>
              )}
            </div>
          ) : null}
        </div>
      );
    }

    if (block.type === 'language') {
      const { language, index } = block;

      const name =
        typeof language === 'string'
          ? language
          : language?.name || 'Language';

      const level =
        typeof language === 'string'
          ? ''
          : language?.level || '';

      return (
        <div className="pb-2 text-[9.8px] text-slate-700">
          {measurement || typeof language === 'string' ? (
            <>
              <span className="font-bold text-slate-900">{name}</span>
              {level ? ` — ${level}` : ''}
            </>
          ) : (
            <>
              <PreviewEditableField
                path={`languages[${index}].name`}
                label="Language"
                className="inline font-bold text-slate-900"
                style={{}}
              >
                {name}
              </PreviewEditableField>
              {level ? (
                <>
                  {' — '}
                  <PreviewEditableField
                    path={`languages[${index}].level`}
                    label="Language Level"
                    className="inline"
                      style={{}}
                    >
                    {level}
                  </PreviewEditableField>
                </>
              ) : null}
            </>
          )}
        </div>
      );
    }

    return null;
  };

  const paginate = useCallback(() => {
    const contentHeight =
      contentHeightMeasureRef.current?.getBoundingClientRect().height || 0;

    const firstHeaderHeight =
      fullHeaderMeasureRef.current?.getBoundingClientRect().height || 0;

    const continuationHeaderHeight =
      continuationHeaderMeasureRef.current?.getBoundingClientRect().height || 0;

    if (!contentHeight) return;

    if (!blocks.length) {
      setPages([{ blocks: [] }]);
      return;
    }

    const nextPages = [];
    let pageIndex = 0;
    let currentBlocks = [];
    let usedHeight = 0;
    let activeSection = null;

    const getLimit = () =>
      Math.max(
        0,
        contentHeight -
          (pageIndex === 0
            ? firstHeaderHeight
            : continuationHeaderHeight)
      );

    const commitPage = () => {
      nextPages.push({ blocks: mergeExperienceFragmentsOnPage(currentBlocks) });
      pageIndex += 1;
      currentBlocks = [];
      usedHeight = 0;
      activeSection = null;
    };

    blocks.forEach((block) => {
      if (block.forceBreak && currentBlocks.length) {
        commitPage();
      }

      const blockHeight =
        measureRefs.current[
          block.id
        ]?.getBoundingClientRect().height || 0;

      const sectionHeight =
        block.section &&
        activeSection !== block.section
          ? sectionHeaderRefs.current[
              block.section
            ]?.getBoundingClientRect().height || 0
          : 0;

      let required =
        sectionHeight + blockHeight;

      if (
        currentBlocks.length &&
        usedHeight + required > getLimit()
      ) {
        commitPage();

        required =
          (block.section
            ? sectionHeaderRefs.current[
                block.section
              ]?.getBoundingClientRect().height || 0
            : 0) + blockHeight;
      }

      currentBlocks.push(block);
      usedHeight += required;
      activeSection = block.section || activeSection;
    });

    if (currentBlocks.length || !nextPages.length) {
      nextPages.push({ blocks: mergeExperienceFragmentsOnPage(currentBlocks) });
    }

    setPages(nextPages);
  }, [blocks]);

  useLayoutEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    let cancelled = false;

    const run = () => {
      if (cancelled) return;

      window.requestAnimationFrame(() => {
        if (!cancelled) paginate();
      });
    };

    run();

    if (
      typeof document !== 'undefined' &&
      document.fonts?.ready
    ) {
      document.fonts.ready
        .then(run)
        .catch(() => {});
    }

    const observer =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(run)
        : null;

    if (observer) {
      [
        ...Object.values(measureRefs.current),
        ...Object.values(sectionHeaderRefs.current),
        fullHeaderMeasureRef.current,
        continuationHeaderMeasureRef.current,
      ].forEach((node) => {
        if (node) observer.observe(node);
      });
    }

    window.addEventListener('resize', run);

    return () => {
      cancelled = true;
      observer?.disconnect();
      window.removeEventListener('resize', run);
    };
  }, [paginate]);

  const visiblePages =
    pages.length
      ? pages
      : [{ blocks }];

  const sectionIds = [
    'summary',
    'experience',
    'skills',
    'projects',
    'education',
    'certifications',
    'awards',
    'languages',
  ];

  return (
    <div className="resume-preview-wrapper relative mx-auto w-full max-w-[210mm] font-serif text-slate-900">
      {/* Hidden measurement layer */}
      <div
        className="minimal-measure-layer pointer-events-none absolute left-[-99999px] top-0 opacity-0"
        aria-hidden="true"
      >
        <div
          ref={contentHeightMeasureRef}
          style={{
            width: CONTENT_WIDTH,
            height: CONTENT_HEIGHT,
          }}
        />

        <div style={{ width: CONTENT_WIDTH }}>
          <FullHeader
            measureRef={fullHeaderMeasureRef}
          />

          <ContinuationHeader
            measureRef={continuationHeaderMeasureRef}
            pageNumber={2}
          />

          {sectionIds.map((sectionId) => (
            <div
              key={`measure-section-${sectionId}`}
              ref={(node) => {
                sectionHeaderRefs.current[
                  sectionId
                ] = node;
              }}
            >
              <SectionTitle sectionId={sectionId} />
            </div>
          ))}

          {blocks.map((block) => (
            <div
              key={`measure-${block.id}`}
              ref={(node) => {
                measureRefs.current[
                  block.id
                ] = node;
              }}
            >
              {renderBlock(block, { measurement: true })}
            </div>
          ))}
        </div>
      </div>

      {/* Real A4 pages */}
      <div className="minimal-pages space-y-5">
        {visiblePages.map((page, pageIndex) => (
          <section
            key={`minimal-page-${pageIndex}`}
            className="minimal-a4-page relative mx-auto h-[297mm] w-[210mm] overflow-hidden bg-white shadow-[0_18px_55px_rgba(15,23,42,0.12)] print:shadow-none"
            style={{
              width: PAGE_WIDTH,
              height: PAGE_HEIGHT,
              padding: '13mm 14mm 15mm',
              boxSizing: 'border-box',
              breakAfter:
                pageIndex < visiblePages.length - 1 ? 'page' : 'auto',
              pageBreakAfter:
                pageIndex < visiblePages.length - 1 ? 'always' : 'auto',
              breakInside: 'avoid-page',
              pageBreakInside: 'avoid',
            }}
          >
            {pageIndex === 0 ? (
              <FullHeader />
            ) : (
              <ContinuationHeader
                pageNumber={pageIndex + 1}
              />
            )}

            <div>
              {page.blocks.map((block, blockIndex) => {
                const previous =
                  page.blocks[blockIndex - 1];

                const showTitle =
                  block.section &&
                  (blockIndex === 0 ||
                    previous?.section !== block.section);

                return (
                  <React.Fragment
                    key={`${pageIndex}-${block.id}`}
                  >
                    {showTitle ? (
                      <SectionTitle
                        sectionId={block.section}
                      />
                    ) : null}

                    <div
                      style={{
                        breakInside: 'avoid',
                        pageBreakInside: 'avoid',
                      }}
                    >
                      {renderBlock(block)}
                    </div>
                  </React.Fragment>
                );
              })}
            </div>

            <footer className="absolute bottom-[6mm] left-[14mm] right-[14mm] flex items-center justify-between border-t border-slate-200 pt-2 font-sans text-[7.5px] font-bold uppercase tracking-[0.1em] text-slate-400">
              <span>Confidential</span>
              <span>
                Page {pageIndex + 1} / {visiblePages.length}
              </span>
            </footer>
          </section>
        ))}
      </div>

      <style>{`
        @page {
          size: A4 portrait;
          margin: 0;
        }

        @media print {
          html,
          body {
            width: 210mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .resume-preview-wrapper {
            width: 210mm !important;
            max-width: 210mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          /* Critical: measurement DOM is for browser calculations only.
             Chromium can otherwise allocate PDF sheets for far-offscreen
             absolute nodes, producing duplicate/blank pages. */
          .minimal-measure-layer {
            display: none !important;
          }

          .minimal-pages {
            display: block !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .minimal-pages > * + * {
            margin-top: 0 !important;
          }

          .minimal-a4-page {
            display: block !important;
            position: relative !important;
            width: 210mm !important;
            height: 297mm !important;
            min-height: 297mm !important;
            max-height: 297mm !important;
            margin: 0 !important;
            box-shadow: none !important;
            overflow: hidden !important;
            break-inside: avoid-page !important;
            page-break-inside: avoid !important;
          }

          .minimal-a4-page:not(:last-child) {
            break-after: page !important;
            page-break-after: always !important;
          }

          .minimal-a4-page:last-child {
            break-after: auto !important;
            page-break-after: auto !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Minimal;
