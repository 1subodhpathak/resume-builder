import { mergeExperienceFragmentsOnPage } from '../templateSurfaceUtils';
import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

const splitLines = (text = '') =>
  String(text || '')
    .split(/\r?\n/)
    .map((line) => line.replace(/^[•\-–—]\s*/, '').trim())
    .filter(Boolean);

const chunkArray = (items = [], size = 10) => {
  const safe = Array.isArray(items) ? items : [];
  const chunks = [];

  for (let i = 0; i < safe.length; i += size) {
    chunks.push(safe.slice(i, i + size));
  }

  return chunks;
};

const PointerBanner = ({ data }) => {
  const {
    personal = {},
    experience = [],
    education = [],
    skills = {},
    projects = [],
    certifications = [],
    awards = [],
  } = data || {};

  const {
    core = [],
    technical = [],
    soft = [],
  } = skills;

  const SKY = '#0284c7';
  const SKY_DARK = '#0369a1';
  const SKY_LIGHT = '#e0f2fe';
  const NAVY = '#0f172a';
  const TEXT = '#475569';
  const MUTED = '#94a3b8';
  const BORDER = '#e2e8f0';
  const WHITE = '#ffffff';

  const PAGE_WIDTH = '210mm';
  const PAGE_HEIGHT = '297mm';
  const INNER_WIDTH = '188mm';
  const MAIN_WIDTH = '122mm';
  const SIDE_WIDTH = '58mm';
  const GAP = '8mm';
  const CONTENT_HEIGHT = '276mm';
  const FOOTER_RESERVE = '5mm';

  const mainMeasureRefs = useRef({});
  const sideMeasureRefs = useRef({});
  const mainSectionRefs = useRef({});
  const sideSectionRefs = useRef({});

  const firstHeaderRef = useRef(null);
  const continuationHeaderRef = useRef(null);
  const contentHeightRef = useRef(null);
  const footerReserveRef = useRef(null);

  const [mainPages, setMainPages] = useState([]);
  const [sidePages, setSidePages] = useState([]);

  const allSkills = useMemo(
    () => [...core, ...technical, ...soft].filter(Boolean),
    [core, technical, soft]
  );

  const mainBlocks = useMemo(() => {
    const blocks = [];

    if (personal.summary?.trim()) {
      blocks.push({
        id: 'summary',
        section: 'summary',
        type: 'summary',
        text: personal.summary.trim(),
      });
    }

    experience.forEach((item, index) => {
      const lines = splitLines(item.desc);

      // Keep the first part deliberately compact so the role heading/company/date
      // can occupy genuine leftover space on the current page. Remaining text
      // continues in small blocks, with no data removed.
      const chunks = [];

      if (!lines.length) {
        chunks.push([]);
      } else {
        chunks.push(lines.slice(0, 2));

        for (let i = 2; i < lines.length; i += 3) {
          chunks.push(lines.slice(i, i + 3));
        }
      }

      chunks.forEach((chunk, chunkIndex) => {
        blocks.push({
          id: `experience-${item.id ?? index}-${chunkIndex}`,
          section: 'experience',
          type: 'experience',
          item,
          lines: chunk,
          continuation: chunkIndex > 0,
          forceBreak: Boolean(item.pageBreak && chunkIndex === 0),
        });
      });
    });

    return blocks;
  }, [experience, personal.summary]);

  const sideBlocks = useMemo(() => {
    const blocks = [];

    chunkArray(allSkills, 12).forEach((items, index) => {
      if (!items.length) return;
      blocks.push({
        id: `skills-${index}`,
        section: 'skills',
        type: 'skills',
        items,
      });
    });

    education.forEach((item, index) => {
      blocks.push({
        id: `education-${item.id ?? index}`,
        section: 'education',
        type: 'education',
        item,
        forceBreak: Boolean(item.pageBreak),
      });
    });

    projects.forEach((item, index) => {
      const lines = splitLines(item.desc);
      const chunks = [];

      if (!lines.length) {
        chunks.push([]);
      } else {
        chunks.push(lines.slice(0, 2));
        for (let lineIndex = 2; lineIndex < lines.length; lineIndex += 3) {
          chunks.push(lines.slice(lineIndex, lineIndex + 3));
        }
      }

      chunks.forEach((chunk, chunkIndex) => {
        blocks.push({
          id: `project-${item.id ?? index}-${chunkIndex}`,
          section: 'projects',
          type: 'project',
          item,
          lines: chunk,
          continuation: chunkIndex > 0,
          forceBreak: Boolean(item.pageBreak && chunkIndex === 0),
        });
      });
    });

    awards.forEach((item, index) => {
      blocks.push({
        id: `award-${item.id ?? index}`,
        section: 'achievements',
        type: 'award',
        item,
      });
    });

    certifications.forEach((item, index) => {
      blocks.push({
        id: `certification-${item.id ?? index}`,
        section: 'achievements',
        type: 'certification',
        item,
      });
    });

    return blocks;
  }, [allSkills, awards, certifications, education, projects]);

  const Header = ({
    compact = false,
    pageNumber = 1,
    measureRef = null,
  }) => (
    <div ref={measureRef} className={compact ? 'mb-[5mm]' : 'mb-[7mm]'}>
      {!compact ? (
        <>
          <div
            className="relative overflow-hidden text-white"
            style={{
              marginLeft: '-11mm',
              marginRight: '-11mm',
              marginTop: '-8mm',
              padding: '10mm 11mm 15mm',
              background: `linear-gradient(135deg, ${SKY_DARK} 0%, ${SKY} 72%, #38bdf8 100%)`,
              clipPath:
                'polygon(0 0, 100% 0, 100% 78%, 58% 78%, 50% 100%, 42% 78%, 0 78%)',
            }}
          >
            <div className="mx-auto flex items-start justify-between gap-6">
              <div className="min-w-0 flex-1">
                <h1 className="break-words text-[29px] font-black uppercase leading-[0.95] tracking-[-0.035em]">
                  {personal.name || 'Your Name'}
                </h1>

                {personal.title ? (
                  <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.13em] text-sky-100">
                    {personal.title}
                  </p>
                ) : null}
              </div>

              {personal.photo ? (
                <img
                  src={personal.photo}
                  alt="Profile"
                  className="h-[25mm] w-[25mm] shrink-0 rounded-full border-4 object-cover"
                  style={{
                    borderColor: '#7dd3fc',
                    boxShadow: '0 6px 18px rgba(15,23,42,.18)',
                  }}
                />
              ) : null}
            </div>
          </div>

          {(personal.email || personal.phone || personal.location) ? (
            <div
              className="relative z-10 mx-auto -mt-[7mm] flex max-w-[150mm] flex-wrap justify-center gap-x-5 gap-y-1.5 rounded-full border bg-white/95 px-5 py-2.5 shadow-lg"
              style={{ borderColor: '#e0f2fe' }}
            >
              {personal.email ? (
                <span className="break-all text-[7px] font-bold text-slate-600">
                  {personal.email}
                </span>
              ) : null}

              {personal.phone ? (
                <span className="text-[7px] font-bold text-slate-600">
                  {personal.phone}
                </span>
              ) : null}

              {personal.location ? (
                <span className="break-words text-[7px] font-bold text-slate-600">
                  {personal.location}
                </span>
              ) : null}
            </div>
          ) : null}
        </>
      ) : (
        <div
          className="flex items-end justify-between border-b pb-3"
          style={{ borderColor: BORDER }}
        >
          <div>
            <div
              className="text-[12px] font-black uppercase tracking-[-0.01em]"
              style={{ color: NAVY }}
            >
              {personal.name || 'Your Name'}
            </div>

            {personal.title ? (
              <div
                className="mt-1 text-[7px] font-bold uppercase tracking-[0.1em]"
                style={{ color: SKY }}
              >
                {personal.title}
              </div>
            ) : null}
          </div>

          <div
            className="relative px-4 py-1 text-[6.5px] font-black uppercase tracking-[0.08em] text-white"
            style={{
              backgroundColor: SKY,
              clipPath: 'polygon(0 0, 86% 0, 100% 50%, 86% 100%, 0 100%)',
            }}
          >
            Page {pageNumber}
          </div>
        </div>
      )}
    </div>
  );

  const MainSectionTitle = ({ title }) => (
    <div className="mb-4">
      <div className="flex items-center gap-2.5">
        <div
          className="h-[9px] w-[22px]"
          style={{
            backgroundColor: SKY,
            clipPath: 'polygon(0 0, 72% 0, 100% 50%, 72% 100%, 0 100%)',
          }}
        />
        <h3
          className="text-[9.5px] font-black uppercase tracking-[0.1em]"
          style={{ color: SKY_DARK }}
        >
          {title}
        </h3>
        <div className="h-px flex-1" style={{ backgroundColor: BORDER }} />
      </div>
    </div>
  );

  const SideSectionTitle = ({ title }) => (
    <div className="mb-3">
      <div
        className="border-b-[3px] pb-1.5 text-[7.8px] font-black uppercase tracking-[0.09em]"
        style={{
          borderColor: NAVY,
          color: SKY_DARK,
        }}
      >
        {title}
      </div>
    </div>
  );

  const MainBlock = ({ block }) => {
    if (block.type === 'summary') {
      return (
        <div className="pb-4">
          <div
            className="rounded-r-[14px] border-l-[4px] px-4 py-3"
            style={{
              borderColor: SKY,
              backgroundColor: '#f8fbfd',
            }}
          >
            <p
              className="whitespace-pre-wrap text-[9.4px] leading-[1.55]"
              style={{ color: TEXT }}
            >
              {block.text}
            </p>
          </div>
        </div>
      );
    }

    if (block.type === 'experience') {
      const item = block.item;

      return (
        <article className="pb-4">
          <div className="group">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h4
                  className="text-[10.8px] font-black leading-tight"
                  style={{ color: NAVY }}
                >
                  {item.role}

                  {block.continuation ? (
                    <span
                      className="ml-1 text-[6px] font-normal italic"
                      style={{ color: MUTED }}
                    >
                      continued
                    </span>
                  ) : null}
                </h4>

                {!block.continuation && item.company ? (
                  <div
                    className="mt-1 text-[7.5px] font-bold"
                    style={{ color: SKY_DARK }}
                  >
                    {item.company}
                  </div>
                ) : null}
              </div>

              {!block.continuation && item.date ? (
                <span
                  className="shrink-0 text-[6.3px] font-black uppercase tracking-[0.07em]"
                  style={{ color: MUTED }}
                >
                  {item.date}
                </span>
              ) : null}
            </div>

            {!block.continuation ? (
              <div
                className="mt-2 h-px"
                style={{ backgroundColor: '#f1f5f9' }}
              />
            ) : null}

            {block.lines.length ? (
              <div className="mt-2.5 space-y-1.5">
                {block.lines.map((line, index) => (
                  <div
                    key={`${block.id}-${index}`}
                    className="flex items-start gap-2 text-[8.6px] leading-[1.5]"
                    style={{ color: TEXT }}
                  >
                    <span
                      className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: SKY }}
                    />
                    <span>{line}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </article>
      );
    }

    if (block.type === 'project') {
      const item = block.item;

      return (
        <article className="pb-4">
          <div className="rounded-[12px] border px-4 py-3" style={{ borderColor: BORDER, backgroundColor: '#f8fbfd' }}>
            <div className="flex items-start justify-between gap-3">
              <h4 className="break-words text-[9.5px] font-black leading-tight" style={{ color: NAVY }}>
                {item.name}
                {block.continuation ? (
                  <span className="ml-1 text-[6px] font-normal italic" style={{ color: MUTED }}>continued</span>
                ) : null}
              </h4>
              {!block.continuation && item.date ? (
                <span className="shrink-0 text-[6.2px] font-bold" style={{ color: SKY_DARK }}>{item.date}</span>
              ) : null}
            </div>
            {block.lines.length ? (
              <div className="mt-2 space-y-1.5">
                {block.lines.map((line, index) => (
                  <div key={`${block.id}-${index}`} className="flex items-start gap-2 text-[8.3px] leading-[1.48]" style={{ color: TEXT }}>
                    <span className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: SKY }} />
                    <span>{line}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </article>
      );
    }

    return null;
  };

  const SideBlock = ({ block }) => {
    if (block.type === 'skills') {
      return (
        <div className="pb-3.5">
          <div className="flex flex-wrap gap-1.5">
            {block.items.map((skill, index) => (
              <span
                key={`${block.id}-${index}`}
                className="rounded px-2 py-1.5 text-[6.4px] font-bold"
                style={{
                  backgroundColor: SKY_LIGHT,
                  color: SKY_DARK,
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      );
    }

    if (block.type === 'education') {
      const item = block.item;

      return (
        <article className="pb-3">
          <div
            className="text-[7.4px] font-black leading-[1.3]"
            style={{ color: NAVY }}
          >
            {item.school || item.degree}
          </div>

          {item.school && item.degree ? (
            <div
              className="mt-1 text-[6.5px] leading-[1.35]"
              style={{ color: TEXT }}
            >
              {item.degree}
            </div>
          ) : null}

          {item.date ? (
            <div
              className="mt-1 text-[5.8px] font-semibold"
              style={{ color: MUTED }}
            >
              {item.date}
            </div>
          ) : null}
        </article>
      );
    }

    if (block.type === 'project') {
      const item = block.item;

      return (
        <article className="pb-3">
          <div className="rounded-lg border px-3 py-2.5" style={{ borderColor: BORDER, backgroundColor: '#f8fbfd' }}>
            <div className="flex items-start justify-between gap-2">
              <h4 className="min-w-0 break-words text-[7.3px] font-black leading-[1.3]" style={{ color: NAVY }}>
                {item.name}
                {block.continuation ? (
                  <span className="ml-1 text-[5.5px] font-normal italic" style={{ color: MUTED }}>continued</span>
                ) : null}
              </h4>
              {!block.continuation && item.date ? (
                <span className="shrink-0 text-[5.7px] font-bold" style={{ color: SKY_DARK }}>{item.date}</span>
              ) : null}
            </div>
            {block.lines.length ? (
              <div className="mt-2 space-y-1.5">
                {block.lines.map((line, index) => (
                  <div key={`${block.id}-${index}`} className="flex items-start gap-1.5 text-[6.4px] leading-[1.42]" style={{ color: TEXT }}>
                    <span className="mt-[4px] h-1 w-1 shrink-0 rounded-full" style={{ backgroundColor: SKY }} />
                    <span className="min-w-0 break-words">{line}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </article>
      );
    }

    if (block.type === 'award' || block.type === 'certification') {
      const item = block.item;

      return (
        <article className="pb-2.5">
          <div className="flex items-start gap-2">
            <span
              className="mt-[1px] text-[7px] font-black"
              style={{ color: SKY }}
            >
              {block.type === 'award' ? '★' : '✓'}
            </span>

            <div>
              <div
                className="text-[6.6px] font-semibold leading-[1.35]"
                style={{ color: TEXT }}
              >
                {item.name}
              </div>

              {(item.issuer || item.date) ? (
                <div
                  className="mt-1 text-[5.7px]"
                  style={{ color: MUTED }}
                >
                  {[item.issuer, item.date]
                    .filter(Boolean)
                    .join(' • ')}
                </div>
              ) : null}
            </div>
          </div>
        </article>
      );
    }

    return null;
  };

  const mainSections = {
    summary: 'About Me',
    experience: 'Experience',
  };

  const sideSections = {
    skills: 'Skills',
    education: 'Education',
    projects: 'Projects',
    achievements: 'Achievements',
  };

  const paginateColumn = useCallback(
    ({
      blocks,
      blockRefs,
      sectionRefs,
    }) => {
      const contentHeight =
        contentHeightRef.current?.getBoundingClientRect().height || 0;

      const footerReserve =
        footerReserveRef.current?.getBoundingClientRect().height || 0;

      const firstHeaderHeight =
        firstHeaderRef.current?.getBoundingClientRect().height || 0;

      const continuationHeaderHeight =
        continuationHeaderRef.current?.getBoundingClientRect().height || 0;

      if (!contentHeight) return [];
      if (!blocks.length) return [{ blocks: [] }];

      const pages = [];
      let pageIndex = 0;
      let pageBlocks = [];
      let usedHeight = 0;
      let activeSection = null;

      const getLimit = () =>
        Math.max(
          0,
          contentHeight -
            footerReserve -
            (
              pageIndex === 0
                ? firstHeaderHeight
                : continuationHeaderHeight
            )
        );

      const commitPage = () => {
        pages.push({ blocks: mergeExperienceFragmentsOnPage(pageBlocks) });
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
          blockRefs.current[block.id]?.getBoundingClientRect().height || 0;

        const sectionHeight =
          block.section &&
          activeSection !== block.section &&
          sectionRefs.current[block.section]
            ? sectionRefs.current[block.section].getBoundingClientRect().height
            : 0;

        let required = blockHeight + sectionHeight;

        if (
          pageBlocks.length &&
          usedHeight + required > getLimit()
        ) {
          commitPage();

          required =
            blockHeight +
            (
              block.section &&
              sectionRefs.current[block.section]
                ? sectionRefs.current[block.section].getBoundingClientRect().height
                : 0
            );
        }

        pageBlocks.push(block);
        usedHeight += required;
        activeSection = block.section || activeSection;
      });

      if (pageBlocks.length || !pages.length) {
        pages.push({ blocks: mergeExperienceFragmentsOnPage(pageBlocks) });
      }

      return pages;
    },
    []
  );

  const paginate = useCallback(() => {
    setMainPages(
      paginateColumn({
        blocks: mainBlocks,
        blockRefs: mainMeasureRefs,
        sectionRefs: mainSectionRefs,
      })
    );

    setSidePages(
      paginateColumn({
        blocks: sideBlocks,
        blockRefs: sideMeasureRefs,
        sectionRefs: sideSectionRefs,
      })
    );
  }, [
    mainBlocks,
    paginateColumn,
    sideBlocks,
  ]);

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return undefined;

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
      document.fonts.ready.then(run).catch(() => {});
    }

    const observer =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(run)
        : null;

    if (observer) {
      [
        ...Object.values(mainMeasureRefs.current),
        ...Object.values(sideMeasureRefs.current),
        firstHeaderRef.current,
        continuationHeaderRef.current,
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

  const visibleMainPages =
    mainPages.length
      ? mainPages
      : [{ blocks: mainBlocks }];

  const visibleSidePages =
    sidePages.length
      ? sidePages
      : [{ blocks: sideBlocks }];

  const pageCount = Math.max(
    visibleMainPages.length,
    visibleSidePages.length,
    1
  );

  return (
    <div
      className="resume-preview-wrapper relative mx-auto w-full max-w-[210mm] bg-slate-200"
      style={{
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      {/* Hidden measurement layer */}
      <div
        className="pointer-events-none absolute left-[-99999px] top-0 opacity-0"
        aria-hidden="true"
      >
        <div
          ref={contentHeightRef}
          style={{
            width: INNER_WIDTH,
            height: CONTENT_HEIGHT,
          }}
        />

        <div
          ref={footerReserveRef}
          style={{
            width: '1mm',
            height: FOOTER_RESERVE,
          }}
        />

        <div style={{ width: INNER_WIDTH }}>
          <Header
            pageNumber={1}
            measureRef={firstHeaderRef}
          />

          <Header
            compact
            pageNumber={2}
            measureRef={continuationHeaderRef}
          />
        </div>

        <div
          className="grid"
          style={{
            width: INNER_WIDTH,
            gridTemplateColumns: `${MAIN_WIDTH} ${SIDE_WIDTH}`,
            columnGap: GAP,
            alignItems: 'start',
          }}
        >
          <div>
            {Object.entries(mainSections).map(([section, title]) => (
              <div
                key={`measure-main-title-${section}`}
                ref={(node) => {
                  mainSectionRefs.current[section] = node;
                }}
              >
                <MainSectionTitle title={title} />
              </div>
            ))}

            {mainBlocks.map((block) => (
              <div
                key={`measure-main-${block.id}`}
                ref={(node) => {
                  mainMeasureRefs.current[block.id] = node;
                }}
              >
                <MainBlock block={block} />
              </div>
            ))}
          </div>

          <div
            className="border-l pl-[7mm]"
            style={{ borderColor: '#f1f5f9' }}
          >
            {Object.entries(sideSections).map(([section, title]) => (
              <div
                key={`measure-side-title-${section}`}
                ref={(node) => {
                  sideSectionRefs.current[section] = node;
                }}
              >
                <SideSectionTitle title={title} />
              </div>
            ))}

            {sideBlocks.map((block) => (
              <div
                key={`measure-side-${block.id}`}
                ref={(node) => {
                  sideMeasureRefs.current[block.id] = node;
                }}
              >
                <SideBlock block={block} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Visible A4 pages */}
      <div className="space-y-5 print:space-y-0">
        {Array.from({ length: pageCount }).map((_, pageIndex) => {
          const mainPage =
            visibleMainPages[pageIndex] || { blocks: [] };

          const sidePage =
            visibleSidePages[pageIndex] || { blocks: [] };

          return (
            <section
              key={`pointer-banner-page-${pageIndex}`}
              className="relative mx-auto h-[297mm] w-[210mm] overflow-hidden bg-white shadow-xl print:shadow-none"
              style={{
                width: PAGE_WIDTH,
                height: PAGE_HEIGHT,
                padding: '8mm 11mm 13mm',
                boxSizing: 'border-box',
                breakAfter:
                  pageIndex < pageCount - 1
                    ? 'page'
                    : 'auto',
                pageBreakAfter:
                  pageIndex < pageCount - 1
                    ? 'always'
                    : 'auto',
              }}
            >
              <Header
                compact={pageIndex > 0}
                pageNumber={pageIndex + 1}
              />

              <div
                className="grid"
                style={{
                  width: INNER_WIDTH,
                  gridTemplateColumns: `${MAIN_WIDTH} ${SIDE_WIDTH}`,
                  columnGap: GAP,
                  alignItems: 'start',
                }}
              >
                <main>
                  {mainPage.blocks.map((block, blockIndex) => {
                    const previous =
                      mainPage.blocks[blockIndex - 1];

                    const title = mainSections[block.section];

                    const showTitle =
                      Boolean(title) &&
                      (
                        blockIndex === 0 ||
                        previous?.section !== block.section
                      );

                    return (
                      <React.Fragment
                        key={`${pageIndex}-main-${block.id}`}
                      >
                        {showTitle ? (
                          <MainSectionTitle title={title} />
                        ) : null}

                        <div
                          style={{
                            breakInside: 'avoid',
                            pageBreakInside: 'avoid',
                          }}
                        >
                          <MainBlock block={block} />
                        </div>
                      </React.Fragment>
                    );
                  })}
                </main>

                <aside
                  className="border-l pl-[7mm]"
                  style={{ borderColor: '#f1f5f9' }}
                >
                  {sidePage.blocks.map((block, blockIndex) => {
                    const previous =
                      sidePage.blocks[blockIndex - 1];

                    const title = sideSections[block.section];

                    const showTitle =
                      Boolean(title) &&
                      (
                        blockIndex === 0 ||
                        previous?.section !== block.section
                      );

                    return (
                      <React.Fragment
                        key={`${pageIndex}-side-${block.id}`}
                      >
                        {showTitle ? (
                          <SideSectionTitle title={title} />
                        ) : null}

                        <div
                          style={{
                            breakInside: 'avoid',
                            pageBreakInside: 'avoid',
                          }}
                        >
                          <SideBlock block={block} />
                        </div>
                      </React.Fragment>
                    );
                  })}
                </aside>
              </div>

              <footer
                className="absolute bottom-[4mm] left-[11mm] right-[11mm] flex items-center justify-between border-t pt-1.5 text-[6px] font-black uppercase tracking-[0.1em]"
                style={{
                  borderColor: BORDER,
                  color: MUTED,
                }}
              >
                <span style={{ color: SKY_DARK }}>
                  Confidential
                </span>

                <span>
                  Page {pageIndex + 1} / {pageCount}
                </span>
              </footer>
            </section>
          );
        })}
      </div>

      <style>{`
        @page {
          size: A4;
          margin: 0;
        }

        @media print {
          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .resume-preview-wrapper {
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PointerBanner;
