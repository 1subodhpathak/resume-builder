import { mergeExperienceFragmentsOnPage } from '../templateSurfaceUtils';
import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

const Executive = ({ data }) => {
  const {
    personal = {},
    experience = [],
    education = [],
    skills = {},
    projects = [],
    certifications = [],
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
   * The hidden measurement layer uses the same width, typography,
   * spacing, and section styles as the final page.
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
   * Build logical resume blocks.
   *
   * Experience is divided into bullet chunks so a long executive role
   * can continue cleanly on the next A4 page without being cut in half.
   *
   * Skills are chunked as well.
   *
   * Education, certifications, and projects are kept as individual blocks
   * so each entry moves intact to the next page when necessary.
   */
  const blocks = useMemo(() => {
    const next = [];

    if (personal.summary?.trim()) {
      next.push({
        id: 'summary',
        section: 'Executive Profile',
        type: 'summary',
        text: personal.summary.trim(),
      });
    }

    chunkArray(allSkills, 14).forEach((skillChunk, index) => {
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
          section: 'Professional Experience',
          type: 'experience',
          item: exp,
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
        forceBreak: Boolean(edu.pageBreak),
      });
    });

    certifications.forEach((certification, index) => {
      next.push({
        id: `certification-${certification.id || index}`,
        section: 'Certifications',
        type: 'certification',
        item: certification,
        forceBreak: Boolean(certification.pageBreak),
      });
    });

    projects.forEach((project, index) => {
      next.push({
        id: `project-${project.id || index}`,
        section: 'Selected Projects',
        type: 'project',
        item: project,
        forceBreak: Boolean(project.pageBreak),
      });
    });

    return next;
  }, [
    allSkills,
    certifications,
    chunkArray,
    education,
    experience,
    getBullets,
    personal.summary,
    projects,
  ]);

  const SectionTitle = ({ title }) => (
    <h2 className="mb-3 border-b border-slate-300 pb-1.5 font-sans text-[10px] font-bold uppercase tracking-[0.16em] text-slate-800">
      {title}
    </h2>
  );

  const FullHeader = ({ measureRef = null }) => (
    <header
      ref={measureRef}
      className="pb-5 text-center"
    >
      <div className="border-b-2 border-slate-900 pb-5">
        <h1 className="mb-2 text-[28px] font-bold uppercase leading-none tracking-[0.12em] text-slate-900">
          {personal.name || 'Your Name'}
        </h1>

        {personal.title ? (
          <p className="mb-3 font-sans text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500">
            {personal.title}
          </p>
        ) : null}

        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 font-sans text-[8.5px] leading-4 text-slate-600">
          {[
            personal.phone ? { key: 'phone', value: personal.phone } : null,
            personal.email ? { key: 'email', value: personal.email } : null,
            personal.location ? { key: 'location', value: personal.location } : null,
            personal.linkedin ? { key: 'linkedin', value: personal.linkedin } : null,
            personal.github ? { key: 'github', value: `GitHub: ${personal.github}` } : null,
            personal.portfolio ? { key: 'portfolio', value: `Portfolio: ${personal.portfolio}` } : null,
            personal.website ? { key: 'website', value: `Website: ${personal.website}` } : null,
          ].filter(Boolean).map((item, idx) => (
            <React.Fragment key={item.key}>
              {idx > 0 && <span>•</span>}
              <span className="break-all">{item.value}</span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </header>
  );

  const ContinuationHeader = ({
    measureRef = null,
    pageNumber = 2,
  }) => (
    <header ref={measureRef} className="pb-4">
      <div className="flex items-end justify-between border-b border-slate-300 pb-2">
        <div>
          <div className="text-[12px] font-bold uppercase tracking-[0.08em] text-slate-900">
            {personal.name || 'Your Name'}
          </div>

          {personal.title ? (
            <div className="mt-0.5 font-sans text-[8px] uppercase tracking-[0.12em] text-slate-500">
              {personal.title}
            </div>
          ) : null}
        </div>

        <div className="font-sans text-[7.5px] font-bold uppercase tracking-[0.14em] text-slate-400">
          Confidential · Page {pageNumber}
        </div>
      </div>
    </header>
  );

  const renderBlock = (block) => {
    if (!block) return null;

    if (block.type === 'summary') {
      return (
        <div className="pb-5 text-center">
          <p className="mx-auto max-w-[155mm] text-[10px] leading-[1.65] text-slate-800">
            {block.text}
          </p>
        </div>
      );
    }

    if (block.type === 'skills') {
      return (
        <div className="pb-5">
          <div className="border-y border-slate-200 bg-slate-50 px-4 py-3">
            {block.continuation ? (
              <div className="mb-2 text-center font-sans text-[7.5px] font-bold uppercase tracking-[0.14em] text-slate-400">
                Competencies continued
              </div>
            ) : null}

            <div className="flex flex-wrap justify-center gap-x-5 gap-y-1.5 font-sans text-[9px] font-medium text-slate-700">
              {block.items.map((skill, index) => (
                <span key={`${block.id}-${skill}-${index}`}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (block.type === 'experience') {
      const exp = block.item;

      return (
        <div className="pb-5">
          <div className="flex items-baseline justify-between gap-5 font-sans">
            <div className="min-w-0 flex-1">
              <h3 className="text-[12px] font-bold leading-[1.3] text-slate-900">
                {exp.role}

                {block.continuation ? (
                  <span className="ml-1 text-[8px] font-medium italic text-slate-400">
                    continued
                  </span>
                ) : null}
              </h3>

              {!block.continuation && exp.company ? (
                <div className="mt-1 font-serif text-[10px] italic text-slate-600">
                  {exp.company}
                </div>
              ) : null}
            </div>

            {!block.continuation && exp.date ? (
              <span className="shrink-0 text-[8.5px] font-bold text-slate-500">
                {exp.date}
              </span>
            ) : null}
          </div>

          {block.bullets.length ? (
            <ul className="mt-2 list-disc space-y-1 pl-4 font-sans text-[9.5px] leading-[1.55] text-slate-700 marker:text-slate-400">
              {block.bullets.map((line, index) => (
                <li key={`${block.id}-bullet-${index}`}>{line}</li>
              ))}
            </ul>
          ) : null}
        </div>
      );
    }

    if (block.type === 'education') {
      const edu = block.item;

      return (
        <div className="pb-4">
          <div className="flex items-baseline justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="text-[10.5px] font-bold text-slate-900">
                {edu.school}
              </div>

              {edu.degree ? (
                <div className="mt-0.5 text-[9.5px] italic text-slate-600">
                  {edu.degree}
                </div>
              ) : null}
            </div>

            {edu.date ? (
              <div className="shrink-0 font-sans text-[8px] text-slate-400">
                {edu.date}
              </div>
            ) : null}
          </div>
        </div>
      );
    }

    if (block.type === 'certification') {
      const certification = block.item;

      return (
        <div className="pb-3">
          <div className="flex items-baseline justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-bold text-slate-900">
                {certification.name}
              </div>

              {certification.issuer ? (
                <div className="mt-0.5 font-sans text-[8.5px] text-slate-500">
                  {certification.issuer}
                </div>
              ) : null}
            </div>

            {certification.date ? (
              <div className="shrink-0 font-sans text-[8px] text-slate-400">
                {certification.date}
              </div>
            ) : null}
          </div>
        </div>
      );
    }

    if (block.type === 'project') {
      const project = block.item;

      return (
        <div className="pb-4">
          <div className="text-[10px] font-bold text-slate-900">
            {project.name}
          </div>

          {project.desc ? (
            <p className="mt-1 whitespace-pre-wrap font-sans text-[9px] leading-[1.5] text-slate-500">
              {project.desc}
            </p>
          ) : null}
        </div>
      );
    }

    return null;
  };

  /*
   * AUTOMATIC PAGE PACKING
   *
   * The invisible measurement layer gives us actual rendered heights for:
   * - first page header
   * - continuation header
   * - every section heading
   * - every resume block
   *
   * Blocks are then packed into physical A4 pages until the next block
   * no longer fits, at which point it begins on the next page.
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
    <div className="resume-preview-wrapper relative mx-auto w-full max-w-[210mm] font-serif text-slate-900">
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
            'Executive Profile',
            'Core Competencies',
            'Professional Experience',
            'Education',
            'Certifications',
            'Selected Projects',
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
            key={`executive-page-${pageIndex}`}
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
            <div className="absolute bottom-[6mm] left-[16mm] right-[16mm] flex items-center justify-between border-t border-slate-200 pt-1.5 font-sans text-[6.5px] font-bold uppercase tracking-[0.12em] text-slate-400">
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

export default Executive;
