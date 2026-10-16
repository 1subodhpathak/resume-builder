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

const chunkArray = (items = [], size = 8) => {
  const safe = Array.isArray(items) ? items : [];
  const chunks = [];

  for (let i = 0; i < safe.length; i += size) {
    chunks.push(safe.slice(i, i + size));
  }

  return chunks;
};

const OrangePunch = ({ data }) => {
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

  const ORANGE = '#f97316';
  const ORANGE_DARK = '#ea580c';
  const ORANGE_SOFT = '#fff7ed';
  const SLATE = '#0f172a';
  const SLATE_2 = '#1e293b';
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
  const CONTENT_HEIGHT = '263mm';
  const FOOTER_RESERVE = '8mm';

  const mainMeasureRefs = useRef({});
  const sideMeasureRefs = useRef({});
  const mainSectionRefs = useRef({});
  const sideSectionRefs = useRef({});

  const mainFirstHeaderRef = useRef(null);
  const mainContinuationHeaderRef = useRef(null);
  const sideFirstHeaderRef = useRef(null);
  const sideContinuationHeaderRef = useRef(null);

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
      const chunks = lines.length ? chunkArray(lines, 4) : [[]];

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

    chunkArray(allSkills, 10).forEach((items, index) => {
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
      blocks.push({
        id: `project-${item.id ?? index}`,
        section: 'projects',
        type: 'project',
        item,
        forceBreak: Boolean(item.pageBreak),
      });
    });

    certifications.forEach((item, index) => {
      blocks.push({
        id: `certification-${item.id ?? index}`,
        section: 'certifications',
        type: 'certification',
        item,
      });
    });

    awards.forEach((item, index) => {
      blocks.push({
        id: `award-${item.id ?? index}`,
        section: 'awards',
        type: 'award',
        item,
      });
    });

    languages.forEach((item, index) => {
      blocks.push({
        id: `language-${item.id ?? index}`,
        section: 'languages',
        type: 'language',
        item,
      });
    });

    return blocks;
  }, [
    allSkills,
    awards,
    certifications,
    education,
    languages,
    projects,
  ]);

  const MainHeader = ({
    compact = false,
    pageNumber = 1,
    measureRef = null,
  }) => (
    <header
      ref={measureRef}
      className={compact ? 'mb-[5mm]' : 'mb-[6mm]'}
    >
      {!compact ? (
        <>
          <div className="flex items-center justify-between gap-6">
            <div className="min-w-0">
              <h1
                className="break-words text-[28px] font-black uppercase leading-[0.95] tracking-[-0.04em]"
                style={{ color: SLATE }}
              >
                {personal.name || 'Your Name'}
              </h1>

              {personal.title ? (
                <div
                  className="mt-2 inline-block -skew-x-6 px-3.5 py-1.5 text-[8px] font-black uppercase tracking-[0.12em] text-white"
                  style={{ backgroundColor: ORANGE }}
                >
                  <span className="inline-block skew-x-6">
                    {personal.title}
                  </span>
                </div>
              ) : null}
            </div>

            {personal.photo ? (
              <img
                src={personal.photo}
                alt="Profile"
                className="h-[27mm] w-[27mm] shrink-0 border-4 object-cover"
                style={{
                  borderColor: SLATE,
                  boxShadow: `5px 5px 0 ${ORANGE}`,
                }}
              />
            ) : null}
          </div>

          <div
            className="mt-4 h-[2px] w-full"
            style={{ backgroundColor: SLATE }}
          />
        </>
      ) : (
        <div
          className="flex items-end justify-between border-b pb-3"
          style={{ borderColor: BORDER }}
        >
          <div>
            <div
              className="text-[12px] font-black uppercase tracking-[-0.01em]"
              style={{ color: SLATE }}
            >
              {personal.name || 'Your Name'}
            </div>

            {personal.title ? (
              <div
                className="mt-1 text-[7px] font-bold uppercase tracking-[0.1em]"
                style={{ color: ORANGE_DARK }}
              >
                {personal.title}
              </div>
            ) : null}
          </div>

          <div
            className="px-3 py-1 text-[6.5px] font-black uppercase tracking-[0.08em] text-white"
            style={{ backgroundColor: ORANGE }}
          >
            Page {pageNumber}
          </div>
        </div>
      )}
    </header>
  );

  const ContactStrip = ({
    compact = false,
    measureRef = null,
    pageNumber = 1,
  }) => (
    <div ref={measureRef}>
      {!compact ? (
        <div
          className="border-y-2 py-2.5"
          style={{ borderColor: SLATE }}
        >
          <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-[7px] font-bold">
            {personal.email ? (
              <div className="break-all">
                <span className="mr-1.5" style={{ color: ORANGE }}>✉</span>
                {personal.email}
              </div>
            ) : null}

            {personal.phone ? (
              <div>
                <span className="mr-1.5" style={{ color: ORANGE }}>☎</span>
                {personal.phone}
              </div>
            ) : null}

            {personal.location ? (
              <div className="break-words">
                <span className="mr-1.5" style={{ color: ORANGE }}>●</span>
                {personal.location}
              </div>
            ) : null}

            {personal.linkedin ? (
              <div className="break-all">
                <span className="mr-1.5" style={{ color: ORANGE }}>↗</span>
                {personal.linkedin}
              </div>
            ) : null}

        {personal.github ? (
              <div className="break-all">
                <span className="mr-1.5" style={{ color: ORANGE }}>↗</span>
                GitHub: {personal.github}
              </div>
            ) : null}

        {personal.portfolio ? (
              <div className="break-all">
                <span className="mr-1.5" style={{ color: ORANGE }}>↗</span>
                Portfolio: {personal.portfolio}
              </div>
            ) : null}

        {personal.website ? (
              <div className="break-all">
                <span className="mr-1.5" style={{ color: ORANGE }}>↗</span>
                Website: {personal.website}
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <div
          className="border-b pb-3"
          style={{ borderColor: BORDER }}
        >
          <div
            className="text-[8px] font-black uppercase tracking-[0.05em]"
            style={{ color: SLATE }}
          >
            {personal.name || 'Your Name'}
          </div>

          <div
            className="mt-1 text-[6px] font-bold uppercase tracking-[0.09em]"
            style={{ color: ORANGE_DARK }}
          >
            Sidebar • Page {pageNumber}
          </div>
        </div>
      )}
    </div>
  );

  const MainSectionTitle = ({ title }) => (
    <div className="mb-4">
      <div className="flex items-center gap-2.5">
        <span
          className="h-3 w-3 shrink-0"
          style={{ backgroundColor: ORANGE }}
        />

        <h3
          className="text-[10px] font-black uppercase tracking-[0.08em]"
          style={{ color: SLATE }}
        >
          {title}
        </h3>

        <div
          className="h-[2px] flex-1"
          style={{ backgroundColor: BORDER }}
        />
      </div>
    </div>
  );

  const SideSectionTitle = ({ title }) => (
    <div className="mb-3">
      <div
        className="border-b-[3px] pb-1.5 text-[8px] font-black uppercase tracking-[0.08em]"
        style={{
          borderColor: SLATE,
          color: SLATE,
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
            className="border-l-[4px] px-4 py-3"
            style={{
              borderColor: ORANGE,
              backgroundColor: ORANGE_SOFT,
            }}
          >
            <p
              className="whitespace-pre-wrap text-[9.4px] font-medium leading-[1.55]"
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
          <div
            className="relative border-l-[3px] pl-5"
            style={{ borderColor: SLATE }}
          >
            <div
              className="absolute -left-[8px] top-[4px] h-3.5 w-3.5 rounded-full border-[3px] bg-white"
              style={{ borderColor: ORANGE }}
            />

            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h4
                  className="text-[10.8px] font-black leading-tight"
                  style={{ color: SLATE }}
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
                    className="mt-1 text-[7.5px] font-black uppercase tracking-[0.06em]"
                    style={{ color: TEXT }}
                  >
                    {item.company}
                  </div>
                ) : null}
              </div>

              {!block.continuation && item.date ? (
                <span
                  className="shrink-0 px-2.5 py-1 text-[6.3px] font-black uppercase tracking-[0.07em] text-white"
                  style={{ backgroundColor: SLATE }}
                >
                  {item.date}
                </span>
              ) : null}
            </div>

            {block.lines.length ? (
              <div className="mt-2.5 space-y-1.5">
                {block.lines.map((line, index) => (
                  <div
                    key={`${block.id}-${index}`}
                    className="flex items-start gap-2 text-[8.6px] font-medium leading-[1.48]"
                    style={{ color: TEXT }}
                  >
                    <span
                      className="mt-[5px] h-1.5 w-1.5 shrink-0"
                      style={{ backgroundColor: ORANGE }}
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
                className="px-2 py-1.5 text-[6.3px] font-black uppercase tracking-[0.04em] text-white"
                style={{ backgroundColor: SLATE }}
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
            style={{ color: SLATE }}
          >
            {item.school || item.degree}
          </div>

          {item.school && item.degree ? (
            <div
              className="mt-1 text-[6.5px] font-bold leading-[1.35]"
              style={{ color: ORANGE_DARK }}
            >
              {item.degree}
            </div>
          ) : null}

          {item.date ? (
            <div
              className="mt-1 text-[5.8px] font-bold uppercase tracking-[0.06em]"
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
          <div
            className="border-2 px-3 py-2.5"
            style={{
              borderColor: '#fed7aa',
              backgroundColor: ORANGE_SOFT,
            }}
          >
            <div
              className="text-[7.3px] font-black leading-[1.3]"
              style={{ color: SLATE }}
            >
              {item.name}
            </div>

            {item.desc ? (
              <div
                className="mt-1.5 whitespace-pre-wrap break-words text-[6.3px] font-medium leading-[1.4]"
                style={{ color: TEXT }}
              >
                {item.desc}
              </div>
            ) : null}
          </div>
        </article>
      );
    }

    if (block.type === 'certification' || block.type === 'award') {
      const item = block.item;

      return (
        <article className="pb-2.5">
          <div className="flex items-start gap-2">
            <span
              className="mt-[1px] font-black"
              style={{ color: ORANGE }}
            >
              {block.type === 'award' ? '★' : '✓'}
            </span>

            <div>
              <div
                className="text-[6.6px] font-bold leading-[1.35]"
                style={{ color: SLATE_2 }}
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

    if (block.type === 'language') {
      const item = block.item;

      return (
        <article className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <span
              className="text-[6.7px] font-bold"
              style={{ color: SLATE_2 }}
            >
              {item.name}
            </span>

            {item.level ? (
              <span
                className="text-[5.8px] font-bold"
                style={{ color: ORANGE_DARK }}
              >
                {item.level}
              </span>
            ) : null}
          </div>
        </article>
      );
    }

    return null;
  };

  const mainSections = {
    summary: 'About',
    experience: 'Work',
  };

  const sideSections = {
    skills: 'Skills',
    education: 'Education',
    projects: 'Projects',
    certifications: 'Certifications',
    awards: 'Honors',
    languages: 'Languages',
  };

  const paginateColumn = useCallback(
    ({
      blocks,
      blockRefs,
      sectionRefs,
      firstHeaderRef = null,
      continuationHeaderRef = null,
    }) => {
      const contentHeight =
        contentHeightRef.current?.getBoundingClientRect().height || 0;

      const footerReserve =
        footerReserveRef.current?.getBoundingClientRect().height || 0;

      const firstHeaderHeight =
        firstHeaderRef?.current?.getBoundingClientRect().height || 0;

      const continuationHeaderHeight =
        continuationHeaderRef?.current?.getBoundingClientRect().height || 0;

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
        firstHeaderRef: mainFirstHeaderRef,
        continuationHeaderRef: mainContinuationHeaderRef,
      })
    );

    setSidePages(
      paginateColumn({
        blocks: sideBlocks,
        blockRefs: sideMeasureRefs,
        sectionRefs: sideSectionRefs,
        firstHeaderRef: sideFirstHeaderRef,
        continuationHeaderRef: sideContinuationHeaderRef,
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
        mainFirstHeaderRef.current,
        mainContinuationHeaderRef.current,
        sideFirstHeaderRef.current,
        sideContinuationHeaderRef.current,
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

        <div
          className="grid"
          style={{
            width: INNER_WIDTH,
            gridTemplateColumns: `${MAIN_WIDTH} ${SIDE_WIDTH}`,
            columnGap: GAP,
          }}
        >
          <div style={{ width: MAIN_WIDTH }}>
            <MainHeader measureRef={mainFirstHeaderRef} />

            <div className="mt-[5mm]">
              <MainHeader
                compact
                pageNumber={2}
                measureRef={mainContinuationHeaderRef}
              />
            </div>
          </div>

          <div style={{ width: SIDE_WIDTH }}>
            <ContactStrip measureRef={sideFirstHeaderRef} />

            <div className="mt-[5mm]">
              <ContactStrip
                compact
                pageNumber={2}
                measureRef={sideContinuationHeaderRef}
              />
            </div>
          </div>
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

          <div>
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

      {/* Visible pages */}
      <div className="space-y-5 print:space-y-0">
        {Array.from({ length: pageCount }).map((_, pageIndex) => {
          const mainPage =
            visibleMainPages[pageIndex] || { blocks: [] };

          const sidePage =
            visibleSidePages[pageIndex] || { blocks: [] };

          return (
            <section
              key={`orange-punch-page-${pageIndex}`}
              className="relative mx-auto h-[297mm] w-[210mm] overflow-hidden border-t-[5mm] bg-white shadow-xl print:shadow-none"
              style={{
                width: PAGE_WIDTH,
                height: PAGE_HEIGHT,
                padding: '7mm 11mm 13mm',
                boxSizing: 'border-box',
                borderColor: ORANGE,
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
                  <MainHeader
                    compact={pageIndex > 0}
                    pageNumber={pageIndex + 1}
                  />

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

                <aside>
                  <ContactStrip
                    compact={pageIndex > 0}
                    pageNumber={pageIndex + 1}
                  />

                  <div className={pageIndex === 0 ? 'mt-[6mm]' : 'mt-[5mm]'}>
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
                  </div>
                </aside>
              </div>

              <footer
                className="absolute bottom-[4mm] left-[11mm] right-[11mm] flex items-center justify-between border-t pt-1.5 text-[6px] font-black uppercase tracking-[0.1em]"
                style={{
                  borderColor: BORDER,
                  color: MUTED,
                }}
              >
                <span style={{ color: ORANGE_DARK }}>
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

export default OrangePunch;
