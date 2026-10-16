import { mergeExperienceFragmentsOnPage } from '../templateSurfaceUtils';
import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

const Academic = ({ data }) => {
  const {
    personal = {},
    experience = [],
    education = [],
    skills = {},
    projects = [],
    certifications = [],
    languages = [],
    awards = [],
    volunteering = [],
  } = data || {};

  const { core = [], technical = [], soft = [] } = skills;

  /*
   * Real A4 geometry.
   *
   * 210mm x 297mm
   * 15mm horizontal padding => 180mm usable width
   * 14mm top + 16mm bottom => 267mm usable height
   *
   * The hidden measurement layer uses the same dimensions and typography
   * as the visible resume pages, so pagination happens in the React preview,
   * not only when printing.
   */
  const PAGE_WIDTH = '210mm';
  const PAGE_HEIGHT = '297mm';
  const CONTENT_WIDTH = '180mm';
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
   * Build measurable resume blocks.
   *
   * Long experience entries are split into bullet groups so one large role
   * cannot force the whole resume to overflow. The role heading is repeated
   * with "continued" on the next page when needed.
   *
   * Manual item.pageBreak values are still respected.
   */
  const blocks = useMemo(() => {
    const next = [];

    if (personal.summary?.trim()) {
      next.push({
        id: 'summary',
        section: 'Summary',
        type: 'summary',
        text: personal.summary.trim(),
      });
    }

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

    experience.forEach((exp, index) => {
      const bulletChunks = chunkArray(getBullets(exp.desc), 4);

      bulletChunks.forEach((bullets, chunkIndex) => {
        next.push({
          id: `experience-${exp.id || index}-${chunkIndex}`,
          section: 'Professional Experience',
          type: 'experience',
          item: exp,
          itemIndex: index,
          bullets,
          continuation: chunkIndex > 0,
          forceBreak: Boolean(exp.pageBreak && chunkIndex === 0),
        });
      });
    });

    projects.forEach((project, index) => {
      next.push({
        id: `project-${project.id || index}`,
        section: 'Selected Projects',
        type: 'project',
        item: project,
        itemIndex: index,
        forceBreak: Boolean(project.pageBreak),
      });
    });

    chunkArray(allSkills, 22).forEach((skillChunk, index) => {
      if (!skillChunk.length) return;

      next.push({
        id: `skills-${index}`,
        section: 'Skills & Competencies',
        type: 'skills',
        items: skillChunk,
        continuation: index > 0,
      });
    });

    certifications.forEach((certification, index) => {
      next.push({
        id: `certification-${certification.id || index}`,
        section: 'Honors & Certifications',
        type: 'certification',
        item: certification,
        itemIndex: index,
        forceBreak: Boolean(certification.pageBreak),
      });
    });

    awards.forEach((award, index) => {
      next.push({
        id: `award-${award.id || index}`,
        section: 'Honors & Certifications',
        type: 'award',
        item: award,
        itemIndex: index,
        forceBreak: Boolean(award.pageBreak),
      });
    });

    volunteering.forEach((item, index) => {
      next.push({
        id: `volunteering-${item.id || index}`,
        section: 'Academic & Community Service',
        type: 'volunteering',
        item,
        itemIndex: index,
        forceBreak: Boolean(item.pageBreak),
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
    volunteering,
  ]);

  const SectionTitle = ({ title }) => (
    <h2 className="mb-2 border-b border-zinc-300 pb-1 text-[10px] font-bold uppercase tracking-[0.23em] text-zinc-800">
      {title}
    </h2>
  );

  const FullHeader = ({ measureRef = null }) => (
    <div ref={measureRef} className="pb-5 text-center">
      <h1 className="mb-1 text-[27px] font-bold uppercase leading-none tracking-[0.035em] text-zinc-900">
        {personal.name || 'Your Name'}
      </h1>

      {personal.title ? (
        <p className="mb-2 text-[11px] italic leading-4 text-zinc-600">
          {personal.title}
        </p>
      ) : null}

      <div className="flex flex-wrap justify-center gap-x-2 gap-y-1 text-[9px] leading-4 text-zinc-600">
        {personal.email ? <span>{personal.email}</span> : null}
        {personal.email && personal.phone ? <span>•</span> : null}
        {personal.phone ? <span>{personal.phone}</span> : null}
        {personal.phone && personal.location ? <span>•</span> : null}
        {personal.location ? <span>{personal.location}</span> : null}
        {personal.location && personal.linkedin ? <span>•</span> : null}
        {personal.linkedin ? (
          <span className="break-all">{personal.linkedin}</span>
        ) : null}

        {personal.github ? (
          <span className="break-all">GitHub: {personal.github}</span>
        ) : null}

        {personal.portfolio ? (
          <span className="break-all">Portfolio: {personal.portfolio}</span>
        ) : null}

        {personal.website ? (
          <span className="break-all">Website: {personal.website}</span>
        ) : null}
      </div>
    </div>
  );

  const ContinuationHeader = ({
    measureRef = null,
    pageNumber = 2,
  }) => (
    <div ref={measureRef} className="pb-4">
      <div className="flex items-end justify-between border-b border-zinc-300 pb-2">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.05em] text-zinc-900">
            {personal.name || 'Your Name'}
          </div>
          {personal.title ? (
            <div className="mt-0.5 text-[8px] italic text-zinc-500">
              {personal.title}
            </div>
          ) : null}
        </div>

        <div className="text-[7.5px] font-bold uppercase tracking-[0.15em] text-zinc-500">
          Curriculum Vitae · Page {pageNumber}
        </div>
      </div>
    </div>
  );

  const renderBlock = (block) => {
    if (!block) return null;

    if (block.type === 'summary') {
      return (
        <div className="pb-4">
          <p className="whitespace-pre-wrap text-justify text-[10px] leading-[1.6] text-zinc-700 indent-6">
            {block.text}
          </p>
        </div>
      );
    }

    if (block.type === 'education') {
      const edu = block.item;

      return (
        <div className="pb-3">
          <div className="flex items-baseline justify-between gap-4">
            <span className="min-w-0 flex-1 text-[10px] font-bold text-zinc-900">
              {edu.degree}
            </span>

            {edu.date ? (
              <span className="shrink-0 text-[8.5px] uppercase text-zinc-500">
                {edu.date}
              </span>
            ) : null}
          </div>

          {edu.school ? (
            <p className="mt-0.5 text-[9.5px] italic text-zinc-700">
              {edu.school}
            </p>
          ) : null}
        </div>
      );
    }

    if (block.type === 'experience') {
      const exp = block.item;

      return (
        <div className="pb-4">
          <div className="flex items-baseline justify-between gap-4">
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold text-zinc-900">
                {exp.role}
              </span>

              {block.continuation ? (
                <span className="ml-1 text-[8px] italic text-zinc-400">
                  continued
                </span>
              ) : null}
            </div>

            {!block.continuation && exp.date ? (
              <span className="shrink-0 text-[8.5px] uppercase text-zinc-500">
                {exp.date}
              </span>
            ) : null}
          </div>

          {!block.continuation && exp.company ? (
            <p className="mt-0.5 text-[9.5px] italic text-zinc-700">
              {exp.company}
            </p>
          ) : null}

          {block.bullets.length ? (
            <ul className="mt-1.5 list-disc space-y-1 pl-4 text-[9.5px] leading-[1.55] text-zinc-700 marker:text-zinc-400">
              {block.bullets.map((line, index) => (
                <li key={`${block.id}-bullet-${index}`}>{line}</li>
              ))}
            </ul>
          ) : null}
        </div>
      );
    }

    if (block.type === 'project') {
      const project = block.item;

      return (
        <div className="pb-4">
          <div className="text-[10px] font-bold text-zinc-900">
            {project.name}
          </div>

          {project.desc ? (
            <p className="mt-1 whitespace-pre-wrap text-[9.5px] leading-[1.55] text-zinc-700">
              {project.desc}
            </p>
          ) : null}
        </div>
      );
    }

    if (block.type === 'skills') {
      return (
        <div className="pb-4">
          {block.continuation ? (
            <div className="mb-1 text-[8px] italic text-zinc-500">
              continued
            </div>
          ) : null}

          <p className="text-[9.5px] leading-[1.6] text-zinc-700">
            {block.items.join(' • ')}
          </p>
        </div>
      );
    }

    if (block.type === 'certification') {
      const certification = block.item;

      return (
        <div className="pb-2">
          <div className="flex items-baseline justify-between gap-4 text-[9.5px] leading-[1.5] text-zinc-700">
            <div className="min-w-0 flex-1">
              <span className="font-bold text-zinc-900">
                {certification.name}
              </span>
              {certification.issuer ? (
                <span> — {certification.issuer}</span>
              ) : null}
            </div>

            {certification.date ? (
              <span className="shrink-0 text-[8px] uppercase text-zinc-500">
                {certification.date}
              </span>
            ) : null}
          </div>
        </div>
      );
    }

    if (block.type === 'award') {
      const award = block.item;

      return (
        <div className="pb-2">
          <div className="flex items-baseline justify-between gap-4 text-[9.5px] leading-[1.5] text-zinc-700">
            <div className="min-w-0 flex-1">
              <span className="font-bold text-zinc-900">{award.name}</span>
              {award.issuer ? <span> — {award.issuer}</span> : null}
            </div>

            {award.date ? (
              <span className="shrink-0 text-[8px] uppercase text-zinc-500">
                {award.date}
              </span>
            ) : null}
          </div>
        </div>
      );
    }

    if (block.type === 'volunteering') {
      const item = block.item;

      return (
        <div className="pb-4">
          <div className="flex items-baseline justify-between gap-4">
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold text-zinc-900">
                {item.role || item.name || 'Service'}
              </span>
              {item.org ? (
                <span className="text-[9.5px] italic text-zinc-700">
                  {' '}
                  — {item.org}
                </span>
              ) : null}
            </div>

            {item.date ? (
              <span className="shrink-0 text-[8px] uppercase text-zinc-500">
                {item.date}
              </span>
            ) : null}
          </div>

          {item.desc ? (
            <p className="mt-1 whitespace-pre-wrap text-[9.5px] leading-[1.55] text-zinc-700">
              {item.desc}
            </p>
          ) : null}
        </div>
      );
    }

    if (block.type === 'languages') {
      return (
        <div className="pb-4">
          <div className="grid grid-cols-2 gap-x-8 gap-y-1.5">
            {block.items.map((language, index) => {
              const name =
                typeof language === 'string'
                  ? language
                  : language?.name || 'Language';
              const level =
                typeof language === 'string' ? '' : language?.level || '';

              return (
                <div
                  key={`${block.id}-${name}-${index}`}
                  className="flex items-baseline justify-between gap-3 text-[9.5px] text-zinc-700"
                >
                  <span className="font-bold text-zinc-900">{name}</span>
                  {level ? (
                    <span className="text-[8px] italic text-zinc-500">
                      {level}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return null;
  };

  /*
   * Automatic pagination.
   *
   * Each block is first rendered invisibly at the exact A4 content width.
   * We measure the block's pixel height, section heading height, and the
   * correct page header height, then pack blocks into actual A4 pages.
   *
   * A block that does not fit is moved to the next page before rendering.
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
    <div
      className="resume-preview-wrapper relative mx-auto w-full max-w-[210mm]"
      style={{
        fontFamily:
          "'Computer Modern', 'CMU Serif', Georgia, 'Times New Roman', serif",
      }}
    >
      {/* =====================================================
          HIDDEN MEASUREMENT LAYER
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
          <FullHeader measureRef={firstHeaderMeasureRef} />

          <ContinuationHeader
            measureRef={continuationHeaderMeasureRef}
            pageNumber={2}
          />

          {[
            'Summary',
            'Education',
            'Professional Experience',
            'Selected Projects',
            'Skills & Competencies',
            'Honors & Certifications',
            'Academic & Community Service',
            'Languages',
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
              {renderBlock(block)}
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
            key={`academic-page-${pageIndex}`}
            className="relative mx-auto h-[297mm] w-[210mm] overflow-hidden bg-white shadow-[0_18px_55px_rgba(24,24,27,0.12)] print:shadow-none"
            style={{
              width: PAGE_WIDTH,
              height: PAGE_HEIGHT,
              padding: '14mm 15mm 16mm',
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
            <div className="absolute bottom-[6mm] left-[15mm] right-[15mm] flex items-center justify-between border-t border-zinc-200 pt-1.5 text-[7px] uppercase tracking-[0.14em] text-zinc-400">
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

export default Academic;
