import { mergeExperienceFragmentsOnPage } from '../templateSurfaceUtils';
import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

const Classic = ({ data }) => {
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

  /*
   * CLASSIC — TRUE A4 PREVIEW PAGINATION
   *
   * Preserves the traditional serif resume layout while rendering actual
   * 210mm × 297mm pages in the browser.
   *
   * The typography is intentionally compact enough that a normal resume
   * usually remains on one page. Longer resumes continue cleanly to Page 2+.
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

  const getLines = useCallback((value = '') => {
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

  const technicalSkills = useMemo(
    () => [...core, ...technical].filter(Boolean),
    [core, technical]
  );

  const blocks = useMemo(() => {
    const next = [];

    if (personal.summary?.trim()) {
      next.push({
        id: 'summary',
        section: 'summary',
        type: 'summary',
        text: personal.summary.trim(),
      });
    }

    if (technicalSkills.length || soft.length) {
      next.push({
        id: 'skills',
        section: 'skills',
        type: 'skills',
        technical: technicalSkills,
        professional: soft,
      });
    }

    experience.forEach((item, index) => {
      const chunks = chunkArray(getLines(item.desc), 4);

      chunks.forEach((lines, chunkIndex) => {
        next.push({
          id: `experience-${item.id || index}-${chunkIndex}`,
          section: 'experience',
          type: 'experience',
          item,
          lines,
          continuation: chunkIndex > 0,
          forceBreak: Boolean(item.pageBreak && chunkIndex === 0),
        });
      });
    });

    projects.forEach((item, index) => {
      next.push({
        id: `project-${item.id || index}`,
        section: 'projects',
        type: 'project',
        item,
        forceBreak: Boolean(item.pageBreak),
      });
    });

    education.forEach((item, index) => {
      next.push({
        id: `education-${item.id || index}`,
        section: 'education',
        type: 'education',
        item,
        forceBreak: Boolean(item.pageBreak),
      });
    });

    certifications.forEach((item, index) => {
      next.push({
        id: `certification-${item.id || index}`,
        section: 'additional',
        type: 'certification',
        item,
        forceBreak: Boolean(item.pageBreak),
      });
    });

    awards.forEach((item, index) => {
      next.push({
        id: `award-${item.id || index}`,
        section: 'additional',
        type: 'award',
        item,
        forceBreak: Boolean(item.pageBreak),
      });
    });

    chunkArray(languages, 8).forEach((items, index) => {
      if (!items.length) return;

      next.push({
        id: `languages-${index}`,
        section: 'additional',
        type: 'languages',
        items,
        continuation: index > 0,
      });
    });

    return next;
  }, [
    awards,
    certifications,
    chunkArray,
    education,
    experience,
    getLines,
    languages,
    personal.summary,
    projects,
    soft,
    technicalSkills,
  ]);

  const SECTION_TITLES = {
    summary: 'Professional Summary',
    skills: 'Core Competencies',
    experience: 'Experience',
    projects: 'Projects',
    education: 'Education',
    additional: 'Additional Information',
  };

  const SectionTitle = ({ sectionId }) => (
    <div className="pb-2.5">
      <h3 className="border-b border-slate-300 pb-1 text-[9.5px] font-bold uppercase tracking-[0.08em] text-slate-900">
        {SECTION_TITLES[sectionId]}
      </h3>
    </div>
  );

  const FullHeader = ({ measureRef = null }) => (
    <header
      ref={measureRef}
      className="mb-4 border-b-2 border-slate-800 pb-4 text-center"
    >
      <h1 className="text-[25px] font-bold uppercase tracking-[0.06em] text-slate-900">
        {personal.name || 'Your Name'}
      </h1>

      {personal.title ? (
        <p className="mt-1.5 text-[10px] italic text-slate-600">
          {personal.title}
        </p>
      ) : null}

      <div className="mt-2.5 flex flex-wrap justify-center gap-x-2 gap-y-1 font-sans text-[8.5px] text-slate-700">
        {personal.email ? <span className="break-all">{personal.email}</span> : null}
        {personal.email && personal.phone ? <span>•</span> : null}
        {personal.phone ? <span>{personal.phone}</span> : null}
        {(personal.email || personal.phone) && personal.location ? <span>•</span> : null}
        {personal.location ? <span>{personal.location}</span> : null}
        {(personal.email || personal.phone || personal.location) && personal.linkedin ? <span>•</span> : null}
        {personal.linkedin ? <span className="break-all">{personal.linkedin}</span> : null}
      </div>
    </header>
  );

  const ContinuationHeader = ({
    measureRef = null,
    pageNumber = 2,
  }) => (
    <header ref={measureRef} className="pb-3">
      <div className="flex items-end justify-between border-b border-slate-300 pb-2">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.05em] text-slate-900">
            {personal.name || 'Your Name'}
          </div>

          {personal.title ? (
            <div className="mt-0.5 text-[8px] italic text-slate-500">
              {personal.title}
            </div>
          ) : null}
        </div>

        <div className="font-sans text-[7.5px] font-bold uppercase tracking-[0.1em] text-slate-400">
          Confidential · Page {pageNumber}
        </div>
      </div>
    </header>
  );

  const renderBlock = (block) => {
    if (!block) return null;

    if (block.type === 'summary') {
      return (
        <div className="pb-4">
          <p className="whitespace-pre-wrap text-justify text-[9.5px] leading-[1.5] text-slate-700">
            {block.text}
          </p>
        </div>
      );
    }

    if (block.type === 'skills') {
      return (
        <div className="pb-4 text-[9.5px] leading-[1.45] text-slate-800">
          {block.technical.length ? (
            <div className="mb-1">
              <span className="mr-2 font-bold">
                Technical:
              </span>
              {block.technical.join(', ')}
            </div>
          ) : null}

          {block.professional.length ? (
            <div>
              <span className="mr-2 font-bold">
                Professional:
              </span>
              {block.professional.join(', ')}
            </div>
          ) : null}
        </div>
      );
    }

    if (block.type === 'experience') {
      const item = block.item;

      return (
        <div className="pb-4">
          <div className="flex items-baseline justify-between gap-4 font-sans">
            <div className="min-w-0 flex-1">
              <h4 className="text-[9.5px] font-bold text-slate-900">
                {item.role}
                {block.continuation ? (
                  <span className="ml-1 text-[7.5px] font-normal italic text-slate-400">
                    continued
                  </span>
                ) : null}
              </h4>

              {!block.continuation && item.company ? (
                <div className="mt-0.5 text-[9px] font-bold italic text-slate-700">
                  {item.company}
                </div>
              ) : null}
            </div>

            {!block.continuation && item.date ? (
              <span className="shrink-0 text-[8.5px] font-bold text-slate-500">
                {item.date}
              </span>
            ) : null}
          </div>

          {block.lines.length ? (
            <div className="mt-1.5 space-y-0.5 text-[9px] leading-[1.45] text-slate-700">
              {block.lines.map((line, index) => (
                <p key={`${block.id}-${index}`}>
                  {line}
                </p>
              ))}
            </div>
          ) : null}
        </div>
      );
    }

    if (block.type === 'project') {
      const item = block.item;

      return (
        <div className="pb-3">
          <div className="text-[9.5px] font-bold text-slate-900">
            {item.name}
          </div>

          {item.desc ? (
            <p className="mt-0.5 whitespace-pre-wrap text-[9px] leading-[1.45] text-slate-600">
              {item.desc}
            </p>
          ) : null}
        </div>
      );
    }

    if (block.type === 'education') {
      const item = block.item;

      return (
        <div className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="text-[9.5px] font-bold text-slate-900">
                {item.school}
              </div>

              {item.degree ? (
                <div className="mt-0.5 text-[9px] italic text-slate-600">
                  {item.degree}
                </div>
              ) : null}
            </div>

            {item.date ? (
              <span className="shrink-0 font-sans text-[8.5px] text-slate-500">
                {item.date}
              </span>
            ) : null}
          </div>
        </div>
      );
    }

    if (block.type === 'certification') {
      const item = block.item;

      return (
        <div className="pb-2 text-[9px] text-slate-700">
          <span className="font-bold text-slate-900">
            Certification:
          </span>{' '}
          {item.name}
          {item.issuer ? ` (${item.issuer})` : ''}
          {item.date ? ` — ${item.date}` : ''}
        </div>
      );
    }

    if (block.type === 'award') {
      const item = block.item;

      return (
        <div className="pb-2 text-[9px] text-slate-700">
          <span className="font-bold text-slate-900">
            Award:
          </span>{' '}
          {item.name}
          {item.issuer ? ` — ${item.issuer}` : ''}
          {item.date ? ` (${item.date})` : ''}
        </div>
      );
    }

    if (block.type === 'languages') {
      return (
        <div className="pb-3 text-[9px] text-slate-700">
          <span className="font-bold text-slate-900">
            Languages:
          </span>{' '}
          {block.items
            .map((item) => {
              const name =
                typeof item === 'string'
                  ? item
                  : item?.name || 'Language';

              const level =
                typeof item === 'string'
                  ? ''
                  : item?.level || '';

              return level ? `${name} (${level})` : name;
            })
            .join(', ')}
        </div>
      );
    }

    return null;
  };

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
          (
            pageIndex === 0
              ? firstHeaderHeight
              : continuationHeaderHeight
          )
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
        if (!block.section || activeSection === block.section) {
          return 0;
        }

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

    setPages(
      nextPages.length
        ? nextPages
        : [{ blocks: [] }]
    );
  }, [blocks]);

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return undefined;

    let cancelled = false;

    const runPagination = () => {
      if (cancelled) return;

      window.requestAnimationFrame(() => {
        if (!cancelled) {
          paginate();
        }
      });
    };

    runPagination();

    if (
      typeof document !== 'undefined' &&
      document.fonts?.ready
    ) {
      document.fonts.ready
        .then(runPagination)
        .catch(() => {});
    }

    window.addEventListener('resize', runPagination);

    return () => {
      cancelled = true;
      window.removeEventListener('resize', runPagination);
    };
  }, [paginate]);

  const visiblePages =
    pages.length
      ? pages
      : [{ blocks }];

  return (
    <div className="resume-preview-wrapper relative mx-auto w-full max-w-[210mm] font-serif text-slate-900">
      {/* HIDDEN MEASUREMENT LAYER */}
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
          />

          <ContinuationHeader
            measureRef={continuationHeaderMeasureRef}
            pageNumber={2}
          />

          {Object.keys(SECTION_TITLES).map((sectionId) => (
            <div
              key={`measure-section-${sectionId}`}
              ref={(node) => {
                sectionHeaderRefs.current[sectionId] = node;
              }}
            >
              <SectionTitle sectionId={sectionId} />
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

      {/* REAL A4 PAGES */}
      <div className="space-y-5 print:space-y-0">
        {visiblePages.map((page, pageIndex) => (
          <section
            key={`classic-page-${pageIndex}`}
            className="relative mx-auto h-[297mm] w-[210mm] overflow-hidden bg-white shadow-[0_18px_55px_rgba(15,23,42,0.12)] print:shadow-none"
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
              <ContinuationHeader
                pageNumber={pageIndex + 1}
              />
            )}

            <div>
              {page.blocks.map((block, blockIndex) => {
                const previousBlock =
                  page.blocks[blockIndex - 1];

                const showSectionTitle =
                  Boolean(block.section) &&
                  (
                    blockIndex === 0 ||
                    previousBlock?.section !== block.section
                  );

                return (
                  <React.Fragment
                    key={`${pageIndex}-${block.id}`}
                  >
                    {showSectionTitle ? (
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

            <div className="absolute bottom-[6mm] left-[15mm] right-[15mm] flex items-center justify-between border-t border-slate-100 pt-1.5 font-sans text-[7px] font-bold uppercase tracking-[0.12em] text-slate-400">
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

export default Classic;
