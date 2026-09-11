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

const Professional = ({ data }) => {
  const {
    personal = {},
    experience = [],
    education = [],
    skills = {},
    projects = [],
    languages = [],
    certifications = [],
    awards = [],
  } = data || {};

  const { technical = [], soft = [], core = [] } = skills;

  /*
   * REAL A4 PAGE GEOMETRY
   *
   * 210mm × 297mm
   * 16mm horizontal padding
   * 14mm top padding
   * 16mm bottom padding
   *
   * A hidden measurement layer renders the same content width and typography,
   * then the component packs content into real A4 pages before displaying it.
   */
  const PAGE_WIDTH = '210mm';
  const PAGE_HEIGHT = '297mm';
  const CONTENT_WIDTH = '178mm';
  const CONTENT_HEIGHT = '267mm';

  const measurementRefs = useRef({});
  const sectionHeaderRefs = useRef({});
  const firstHeaderMeasureRef = useRef(null);
  const continuationHeaderMeasureRef = useRef(null);
  const contentHeightMeasureRef = useRef(null);

  const [pages, setPages] = useState([]);

  const getBullets = useCallback((value = '') => {
    return String(value || '')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => line.replace(/^[•\-–—]\s*/, '').trim())
      .filter(Boolean);
  }, []);

  const chunkArray = useCallback((items = [], size = 4) => {
    const chunks = [];

    for (let index = 0; index < items.length; index += size) {
      chunks.push(items.slice(index, index + size));
    }

    return chunks.length ? chunks : [[]];
  }, []);

  const allSkills = useMemo(
    () => [...core, ...technical, ...soft].filter(Boolean),
    [core, technical, soft]
  );

  /*
   * Build logical blocks.
   *
   * Long experience entries are split into bullet groups so one role can
   * continue onto the next page cleanly instead of overflowing.
   *
   * Skills and languages are chunked.
   *
   * Education, certifications, awards, and projects remain intact whenever
   * possible and can still honor item.pageBreak.
   */
  const blocks = useMemo(() => {
    const next = [];

    if (personal.summary?.trim()) {
      next.push({
        id: 'summary',
        section: 'Professional Summary',
        type: 'summary',
        text: personal.summary.trim(),
      });
    }

    chunkArray(allSkills, 16).forEach((skillChunk, index) => {
      if (!skillChunk.length) return;

      next.push({
        id: `skills-${index}`,
        section: 'Core Competencies',
        type: 'skills',
        items: skillChunk,
        continuation: index > 0,
      });
    });

    experience.forEach((exp, index) => {
      const bulletChunks = chunkArray(getBullets(exp.desc), 4);

      bulletChunks.forEach((bullets, chunkIndex) => {
        next.push({
          id: `experience-${exp.id || index}-${chunkIndex}`,
          section: 'Experience',
          type: 'experience',
          item: exp,
          itemIndex: index,
          bullets,
          continuation: chunkIndex > 0,
          forceBreak: Boolean(exp.pageBreak && chunkIndex === 0),
        });
      });
    });

    education.forEach((edu, index) => {
      next.push({
        id: `education-${edu.id || index}`,
        section: 'Education',
        type: 'education',
        item: edu,
        itemIndex: index,
        forceBreak: Boolean(edu.pageBreak),
      });
    });

    certifications.forEach((certification, index) => {
      next.push({
        id: `certification-${certification.id || index}`,
        section: 'Certifications',
        type: 'certification',
        item: certification,
        itemIndex: index,
        forceBreak: Boolean(certification.pageBreak),
      });
    });

    awards.forEach((award, index) => {
      next.push({
        id: `award-${award.id || index}`,
        section: 'Awards',
        type: 'award',
        item: award,
        itemIndex: index,
        forceBreak: Boolean(award.pageBreak),
      });
    });

    chunkArray(languages, 8).forEach((languageChunk, index) => {
      if (!languageChunk.length) return;

      next.push({
        id: `languages-${index}`,
        section: 'Languages',
        type: 'languages',
        items: languageChunk,
        continuation: index > 0,
      });
    });

    projects.forEach((project, index) => {
      next.push({
        id: `project-${project.id || index}`,
        section: 'Projects',
        type: 'project',
        item: project,
        itemIndex: index,
        forceBreak: Boolean(project.pageBreak),
      });
    });

    return next;
  }, [
    allSkills,
    awards,
    certifications,
    chunkArray,
    education,
    experience,
    getBullets,
    languages,
    personal.summary,
    projects,
  ]);

  const SectionTitle = ({ title }) => (
    <h3 className="mb-3 text-[9.5px] font-bold uppercase tracking-[0.18em] text-slate-400">
      {title}
    </h3>
  );

  const FullHeader = ({
    measureRef = null,
    measurement = false,
  }) => (
    <header
      ref={measureRef}
      className="mb-5 flex items-start justify-between gap-7 border-b-2 border-slate-800 pb-5"
    >
      <div className="min-w-0 flex-1">
        {measurement ? (
          <h1 className="text-[27px] font-extrabold uppercase leading-none tracking-[-0.035em] text-slate-900">
            {personal.name || 'Your Name'}
          </h1>
        ) : (
          <PreviewEditableField
            path="personal.name"
            label="Full Name"
            as="h1"
            className="text-[27px] font-extrabold uppercase leading-none tracking-[-0.035em] text-slate-900"
          >
            {personal.name || 'Your Name'}
          </PreviewEditableField>
        )}

        {measurement ? (
          <p className="mt-2 text-[12px] font-medium text-slate-600">
            {personal.title || 'Professional Title'}
          </p>
        ) : (
          <PreviewEditableField
            path="personal.title"
            label="Job Title"
            as="p"
            className="mt-2 text-[12px] font-medium text-slate-600"
          >
            {personal.title || 'Professional Title'}
          </PreviewEditableField>
        )}

        <div className="mt-3 flex flex-wrap gap-x-2.5 gap-y-1 text-[8.5px] font-medium leading-4 text-slate-500">
          {personal.email ? <span className="break-all">{personal.email}</span> : null}
          {personal.email && personal.phone ? <span>•</span> : null}
          {personal.phone ? <span>{personal.phone}</span> : null}
          {(personal.email || personal.phone) && personal.location ? <span>•</span> : null}
          {personal.location ? <span>{personal.location}</span> : null}
          {(personal.email || personal.phone || personal.location) &&
          personal.linkedin ? (
            <span>•</span>
          ) : null}
          {personal.linkedin ? (
            <span className="break-all">{personal.linkedin}</span>
          ) : null}
        </div>
      </div>

      {personal.photo ? (
        <img
          src={personal.photo}
          alt="Profile"
          className="h-[76px] w-[76px] shrink-0 rounded-full border-2 border-slate-200 object-cover"
        />
      ) : null}
    </header>
  );

  const ContinuationHeader = ({
    measureRef = null,
    pageNumber = 2,
  }) => (
    <header ref={measureRef} className="pb-4">
      <div className="flex items-end justify-between border-b border-slate-300 pb-2">
        <div>
          <div className="text-[11px] font-extrabold uppercase tracking-[0.04em] text-slate-900">
            {personal.name || 'Your Name'}
          </div>

          {personal.title ? (
            <div className="mt-0.5 text-[8px] font-medium text-slate-500">
              {personal.title}
            </div>
          ) : null}
        </div>

        <div className="text-[7.5px] font-bold uppercase tracking-[0.14em] text-slate-400">
          Confidential · Page {pageNumber}
        </div>
      </div>
    </header>
  );

  const renderBlock = (block, { measurement = false } = {}) => {
    if (!block) return null;

    if (block.type === 'summary') {
      return (
        <div className="pb-5">
          {measurement ? (
            <div className="whitespace-pre-wrap text-[10px] leading-[1.6] text-slate-700">
              {block.text}
            </div>
          ) : (
            <FormattedTextBlock
              text={block.text}
              editablePath="personal.summary"
              editableLabel="Professional Summary"
              plainClassName="text-[10px] leading-[1.6] text-slate-700 whitespace-pre-wrap"
              unorderedListClassName="ml-4 list-disc space-y-1 text-[10px] leading-[1.55] text-slate-700"
              orderedListClassName="ml-4 list-decimal space-y-1 text-[10px] leading-[1.55] text-slate-700"
            />
          )}
        </div>
      );
    }

    if (block.type === 'skills') {
      return (
        <div className="pb-5">
          {block.continuation ? (
            <div className="mb-2 text-[7.5px] font-bold uppercase tracking-[0.12em] text-slate-400">
              Competencies continued
            </div>
          ) : null}

          <div className="flex flex-wrap gap-1.5">
            {block.items.map((skill, index) => (
              <span
                key={`${block.id}-${skill}-${index}`}
                className="rounded bg-slate-100 px-2.5 py-1 text-[8px] font-bold leading-none text-slate-700"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      );
    }

    if (block.type === 'experience') {
      const exp = block.item;
      const index = block.itemIndex;

      return (
        <div className="pb-5">
          <div className="flex items-baseline justify-between gap-4">
            <div className="min-w-0 flex-1">
              {measurement ? (
                <div className="text-[11.5px] font-bold leading-[1.3] text-slate-900">
                  {exp.role}
                  {block.continuation ? ' continued' : ''}
                </div>
              ) : (
                <div className="flex items-baseline gap-1">
                  <PreviewEditableField
                    path={`experience[${index}].role`}
                    label="Experience Role"
                    as="h4"
                    className="inline text-[11.5px] font-bold leading-[1.3] text-slate-900"
                  >
                    {exp.role}
                  </PreviewEditableField>

                  {block.continuation ? (
                    <span className="text-[8px] font-medium italic text-slate-400">
                      continued
                    </span>
                  ) : null}
                </div>
              )}

              {!block.continuation && exp.company ? (
                measurement ? (
                  <div className="mt-1 text-[9px] font-semibold text-teal-700">
                    {exp.company}
                  </div>
                ) : (
                  <PreviewEditableField
                    path={`experience[${index}].company`}
                    label="Experience Company"
                    as="div"
                    className="mt-1 text-[9px] font-semibold text-teal-700"
                  >
                    {exp.company}
                  </PreviewEditableField>
                )
              ) : null}
            </div>

            {!block.continuation && exp.date ? (
              measurement ? (
                <span className="shrink-0 text-[8.5px] font-bold text-slate-400">
                  {exp.date}
                </span>
              ) : (
                <PreviewEditableField
                  path={`experience[${index}].date`}
                  label="Experience Date"
                  className="shrink-0 text-[8.5px] font-bold text-slate-400"
                >
                  {exp.date}
                </PreviewEditableField>
              )
            ) : null}
          </div>

          {block.bullets.length ? (
            measurement ? (
              <ul className="mt-2 ml-4 list-disc space-y-1 text-[9.5px] leading-[1.55] text-slate-600">
                {block.bullets.map((line, bulletIndex) => (
                  <li key={`${block.id}-measure-${bulletIndex}`}>{line}</li>
                ))}
              </ul>
            ) : (
              <ul className="mt-2 ml-4 list-disc space-y-1 text-[9.5px] leading-[1.55] text-slate-600">
                {block.bullets.map((line, bulletIndex) => (
                  <li key={`${block.id}-bullet-${bulletIndex}`}>{line}</li>
                ))}
              </ul>
            )
          ) : null}
        </div>
      );
    }

    if (block.type === 'education') {
      const edu = block.item;
      const index = block.itemIndex;

      return (
        <div className="pb-4">
          <div className="flex items-baseline justify-between gap-4">
            <div className="min-w-0 flex-1">
              {measurement ? (
                <div className="text-[10px] font-bold text-slate-900">
                  {edu.school}
                </div>
              ) : (
                <PreviewEditableField
                  path={`education[${index}].school`}
                  label="Education School"
                  className="block text-[10px] font-bold text-slate-900"
                >
                  {edu.school}
                </PreviewEditableField>
              )}

              {edu.degree ? (
                measurement ? (
                  <div className="mt-0.5 text-[9px] text-slate-600">
                    {edu.degree}
                  </div>
                ) : (
                  <PreviewEditableField
                    path={`education[${index}].degree`}
                    label="Education Degree"
                    className="mt-0.5 block text-[9px] text-slate-600"
                  >
                    {edu.degree}
                  </PreviewEditableField>
                )
              ) : null}
            </div>

            {edu.date ? (
              measurement ? (
                <span className="shrink-0 text-[8px] text-slate-400">
                  {edu.date}
                </span>
              ) : (
                <PreviewEditableField
                  path={`education[${index}].date`}
                  label="Education Date"
                  className="shrink-0 text-[8px] text-slate-400"
                >
                  {edu.date}
                </PreviewEditableField>
              )
            ) : null}
          </div>
        </div>
      );
    }

    if (block.type === 'certification') {
      const certification = block.item;
      const index = block.itemIndex;

      return (
        <div className="pb-3">
          <div className="flex items-baseline justify-between gap-4">
            <div className="min-w-0 flex-1">
              {measurement ? (
                <div className="text-[9.5px] font-bold text-slate-800">
                  {certification.name}
                </div>
              ) : (
                <PreviewEditableField
                  path={`certifications[${index}].name`}
                  label="Certification Name"
                  className="block text-[9.5px] font-bold text-slate-800"
                >
                  {certification.name}
                </PreviewEditableField>
              )}

              {certification.issuer ? (
                measurement ? (
                  <div className="mt-0.5 text-[8px] text-slate-500">
                    {certification.issuer}
                  </div>
                ) : (
                  <PreviewEditableField
                    path={`certifications[${index}].issuer`}
                    label="Certification Issuer"
                    className="mt-0.5 block text-[8px] text-slate-500"
                  >
                    {certification.issuer}
                  </PreviewEditableField>
                )
              ) : null}
            </div>

            {certification.date ? (
              <span className="shrink-0 text-[8px] text-slate-400">
                {certification.date}
              </span>
            ) : null}
          </div>
        </div>
      );
    }

    if (block.type === 'award') {
      const award = block.item;
      const index = block.itemIndex;

      return (
        <div className="pb-3">
          {measurement ? (
            <>
              <div className="text-[9.5px] font-bold text-slate-800">
                {award.name}
              </div>
              {award.issuer ? (
                <div className="mt-0.5 text-[8px] text-slate-500">
                  {award.issuer}
                </div>
              ) : null}
            </>
          ) : (
            <>
              <PreviewEditableField
                path={`awards[${index}].name`}
                label="Award Name"
                className="block text-[9.5px] font-bold text-slate-800"
              >
                {award.name}
              </PreviewEditableField>

              {award.issuer ? (
                <PreviewEditableField
                  path={`awards[${index}].issuer`}
                  label="Award Issuer"
                  className="mt-0.5 block text-[8px] text-slate-500"
                >
                  {award.issuer}
                </PreviewEditableField>
              ) : null}
            </>
          )}
        </div>
      );
    }

    if (block.type === 'languages') {
      return (
        <div className="pb-4">
          <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-[9px] text-slate-700">
            {block.items.map((language, index) => {
              const name =
                typeof language === 'string'
                  ? language
                  : language?.name || 'Language';
              const level =
                typeof language === 'string' ? '' : language?.level || '';

              return (
                <span key={`${block.id}-${name}-${index}`}>
                  <strong>{name}</strong>
                  {level ? ` (${level})` : ''}
                </span>
              );
            })}
          </div>
        </div>
      );
    }

    if (block.type === 'project') {
      const project = block.item;
      const index = block.itemIndex;

      return (
        <div className="pb-4">
          {measurement ? (
            <div className="text-[9.5px] font-bold text-slate-800">
              {project.name}
            </div>
          ) : (
            <PreviewEditableField
              path={`projects[${index}].name`}
              label="Project Name"
              className="block text-[9.5px] font-bold text-slate-800"
            >
              {project.name}
            </PreviewEditableField>
          )}

          {project.desc ? (
            measurement ? (
              <div className="mt-1 whitespace-pre-wrap text-[9px] leading-[1.5] text-slate-500">
                {project.desc}
              </div>
            ) : (
              <FormattedTextBlock
                text={project.desc}
                editablePath={`projects[${index}].desc`}
                editableLabel="Project Description"
                plainClassName="mt-1 text-[9px] leading-[1.5] text-slate-500 whitespace-pre-wrap"
                unorderedListClassName="mt-1 ml-4 list-disc space-y-1 text-[9px] leading-[1.5] text-slate-500"
                orderedListClassName="mt-1 ml-4 list-decimal space-y-1 text-[9px] leading-[1.5] text-slate-500"
              />
            )
          ) : null}
        </div>
      );
    }

    return null;
  };

  /*
   * AUTOMATIC PAGINATION
   *
   * Every block and section heading is measured at final A4 width.
   * The paginator fills each page until the next complete block will not fit,
   * then begins that block on the next page.
   */
  const paginate = useCallback(() => {
    const contentHeight =
      contentHeightMeasureRef.current?.getBoundingClientRect().height || 0;

    const firstHeaderHeight =
      firstHeaderMeasureRef.current?.getBoundingClientRect().height || 0;

    const continuationHeaderHeight =
      continuationHeaderMeasureRef.current?.getBoundingClientRect().height || 0;

    if (!contentHeight) return;

    if (!blocks.length) {
      setPages([{ blocks: [] }]);
      return;
    }

    const nextPages = [];
    let pageIndex = 0;
    let pageBlocks = [];
    let usedHeight = 0;
    let activeSection = null;

    const getPageLimit = () =>
      Math.max(
        0,
        contentHeight -
          (pageIndex === 0 ? firstHeaderHeight : continuationHeaderHeight)
      );

    const commitPage = () => {
      if (pageBlocks.length) {
        nextPages.push({ blocks: mergeExperienceFragmentsOnPage(pageBlocks) });
      }

      pageIndex += 1;
      pageBlocks = [];
      usedHeight = 0;
      activeSection = null;
    };

    blocks.forEach((block) => {
      if (block.forceBreak && pageBlocks.length) {
        commitPage();
      }

      const blockHeight =
        measurementRefs.current[block.id]?.getBoundingClientRect().height || 0;

      const getSectionHeight = () => {
        if (!block.section || activeSection === block.section) return 0;

        return (
          sectionHeaderRefs.current[
            block.section
          ]?.getBoundingClientRect().height || 0
        );
      };

      let sectionHeight = getSectionHeight();
      let requiredHeight = sectionHeight + blockHeight;

      if (
        pageBlocks.length &&
        usedHeight + requiredHeight > getPageLimit()
      ) {
        commitPage();

        sectionHeight =
          block.section
            ? sectionHeaderRefs.current[
                block.section
              ]?.getBoundingClientRect().height || 0
            : 0;

        requiredHeight = sectionHeight + blockHeight;
      }

      pageBlocks.push(block);
      usedHeight += requiredHeight;
      activeSection = block.section || activeSection;
    });

    if (pageBlocks.length) {
      nextPages.push({ blocks: mergeExperienceFragmentsOnPage(pageBlocks) });
    }

    setPages(nextPages.length ? nextPages : [{ blocks: [] }]);
  }, [blocks]);

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return undefined;

    let cancelled = false;

    const runPagination = () => {
      if (cancelled) return;

      window.requestAnimationFrame(() => {
        if (!cancelled) paginate();
      });
    };

    runPagination();

    if (
      typeof document !== 'undefined' &&
      document.fonts?.ready
    ) {
      document.fonts.ready.then(runPagination).catch(() => {});
    }

    window.addEventListener('resize', runPagination);

    return () => {
      cancelled = true;
      window.removeEventListener('resize', runPagination);
    };
  }, [paginate]);

  const visiblePages = pages.length ? pages : [{ blocks }];

  return (
    <div className="resume-preview-wrapper relative mx-auto w-full max-w-[210mm] font-sans text-slate-800">
      {/* =====================================================
          HIDDEN MEASUREMENT LAYER
          Uses plain text equivalents for editable components.
      ===================================================== */}
      <div
        className="pointer-events-none absolute left-[-99999px] top-0 opacity-0"
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
            measureRef={firstHeaderMeasureRef}
            measurement
          />

          <ContinuationHeader
            measureRef={continuationHeaderMeasureRef}
            pageNumber={2}
          />

          {[
            'Professional Summary',
            'Core Competencies',
            'Experience',
            'Education',
            'Certifications',
            'Awards',
            'Languages',
            'Projects',
          ].map((title) => (
            <div
              key={`measure-section-${title}`}
              ref={(node) => {
                sectionHeaderRefs.current[title] = node;
              }}
            >
              <SectionTitle title={title} />
            </div>
          ))}

          {blocks.map((block) => (
            <div
              key={`measure-${block.id}`}
              ref={(node) => {
                measurementRefs.current[block.id] = node;
              }}
            >
              {renderBlock(block, { measurement: true })}
            </div>
          ))}
        </div>
      </div>

      {/* =====================================================
          REAL A4 PAGES
      ===================================================== */}
      <div className="space-y-5 print:space-y-0">
        {visiblePages.map((page, pageIndex) => (
          <section
            key={`professional-page-${pageIndex}`}
            className="relative mx-auto h-[297mm] w-[210mm] overflow-hidden bg-white shadow-[0_18px_55px_rgba(15,23,42,0.14)] print:shadow-none"
            style={{
              width: PAGE_WIDTH,
              height: PAGE_HEIGHT,
              padding: '14mm 16mm 16mm',
              boxSizing: 'border-box',
              breakAfter: 'page',
              pageBreakAfter: 'always',
            }}
          >
            {pageIndex === 0 ? (
              <FullHeader />
            ) : (
              <ContinuationHeader pageNumber={pageIndex + 1} />
            )}

            <div>
              {page.blocks.map((block, blockIndex) => {
                const previousBlock = page.blocks[blockIndex - 1];

                const showSectionTitle =
                  Boolean(block.section) &&
                  (blockIndex === 0 ||
                    previousBlock?.section !== block.section);

                return (
                  <React.Fragment key={`${pageIndex}-${block.id}`}>
                    {showSectionTitle ? (
                      <SectionTitle title={block.section} />
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

            {/* PAGE FOOTER */}
            <div className="absolute bottom-[6mm] left-[16mm] right-[16mm] flex items-center justify-between border-t border-slate-200 pt-1.5 text-[6.5px] font-bold uppercase tracking-[0.12em] text-slate-400">
              <span>Confidential</span>
              <span>
                Page {pageIndex + 1} / {visiblePages.length}
              </span>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default Professional;
