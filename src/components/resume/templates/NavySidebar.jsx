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
  const result = [];
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size));
  }
  return result;
};

const NavySidebar = ({ data }) => {
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

  const { core = [], technical = [], soft = [] } = skills;

  const NAVY = '#0f172a';
  const NAVY_2 = '#1e293b';
  const TEAL = '#14b8a6';
  const TEAL_SOFT = '#ccfbf1';
  const WHITE = '#ffffff';
  const TEXT = '#475569';
  const MUTED = '#94a3b8';
  const BORDER = '#e2e8f0';

  const PAGE_WIDTH = '210mm';
  const PAGE_HEIGHT = '297mm';
  const SIDEBAR_WIDTH = '66mm';
  const MAIN_WIDTH = '144mm';
  const SIDEBAR_PAD_X = '7mm';
  const MAIN_PAD_X = '10mm';
  const COLUMN_TOP = '9mm';
  const COLUMN_BOTTOM = '13mm';
  const USABLE_HEIGHT = '275mm';
  const FOOTER_RESERVE = '7mm';

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

    education.forEach((item, index) => {
      blocks.push({
        id: `education-${item.id ?? index}`,
        section: 'education',
        type: 'education',
        item,
        forceBreak: Boolean(item.pageBreak),
      });
    });

    chunkArray(allSkills, 10).forEach((items, index) => {
      if (!items.length) return;
      blocks.push({
        id: `skills-${index}`,
        section: 'skills',
        type: 'skills',
        items,
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
    pageNumber = 1,
    compact = false,
    measureRef = null,
  }) => (
    <header
      ref={measureRef}
      className={compact ? 'mb-[5mm]' : 'mb-[6mm]'}
    >
      {!compact ? (
        <div>
          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              <h1
                className="break-words text-[28px] font-black uppercase leading-[0.95] tracking-[-0.035em]"
                style={{ color: NAVY }}
              >
                {personal.name || 'Your Name'}
              </h1>

              {personal.title ? (
                <p
                  className="mt-2 text-[10px] font-bold uppercase tracking-[0.12em]"
                  style={{ color: TEAL }}
                >
                  {personal.title}
                </p>
              ) : null}
            </div>

            <div
              className="h-[7px] w-[32mm] shrink-0 rounded-full"
              style={{
                background: `linear-gradient(90deg, ${NAVY} 0%, ${TEAL} 100%)`,
              }}
            />
          </div>

          <div
            className="mt-4 h-px w-full"
            style={{ backgroundColor: BORDER }}
          />
        </div>
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
                style={{ color: TEAL }}
              >
                {personal.title}
              </div>
            ) : null}
          </div>

          <div
            className="rounded-full px-3 py-1 text-[6.5px] font-black uppercase tracking-[0.08em]"
            style={{
              backgroundColor: TEAL_SOFT,
              color: '#0f766e',
            }}
          >
            Page {pageNumber}
          </div>
        </div>
      )}
    </header>
  );

  const SidebarIdentity = ({
    compact = false,
    pageNumber = 1,
    measureRef = null,
  }) => (
    <div ref={measureRef}>
      {!compact ? (
        <>
          {personal.photo ? (
            <div className="mb-[6mm] flex justify-center">
              <img
                src={personal.photo}
                alt="Profile"
                className="h-[28mm] w-[28mm] rounded-full border-4 object-cover"
                style={{ borderColor: NAVY_2 }}
              />
            </div>
          ) : null}

          <div className="space-y-2.5 text-[6.8px]">
            {personal.email ? (
              <div className="break-all font-semibold text-white">
                {personal.email}
              </div>
            ) : null}

            {personal.phone ? (
              <div className="text-slate-300">{personal.phone}</div>
            ) : null}

            {personal.location ? (
              <div className="break-words text-slate-300">
                {personal.location}
              </div>
            ) : null}

            {personal.linkedin ? (
              <div className="break-all font-medium" style={{ color: '#5eead4' }}>
                {personal.linkedin}
              </div>
            ) : null}
          </div>
        </>
      ) : (
        <div
          className="border-b pb-3"
          style={{ borderColor: '#334155' }}
        >
          <div className="text-[9px] font-black uppercase tracking-[0.05em] text-white">
            {personal.name || 'Your Name'}
          </div>

          {personal.title ? (
            <div
              className="mt-1 text-[5.8px] font-bold uppercase tracking-[0.08em]"
              style={{ color: '#5eead4' }}
            >
              {personal.title}
            </div>
          ) : null}

          <div className="mt-2 text-[5.8px] font-bold uppercase tracking-[0.1em] text-slate-500">
            Page {pageNumber}
          </div>
        </div>
      )}
    </div>
  );

  const MainSectionTitle = ({ title }) => (
    <div className="mb-4">
      <div className="flex items-center gap-2.5">
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: NAVY }}
        />
        <h2
          className="text-[10px] font-black uppercase tracking-[0.09em]"
          style={{ color: NAVY }}
        >
          {title}
        </h2>
        <div className="h-px flex-1" style={{ backgroundColor: BORDER }} />
      </div>
    </div>
  );

  const SideSectionTitle = ({ title }) => (
    <div className="mb-3">
      <h3
        className="text-[6.8px] font-black uppercase tracking-[0.14em]"
        style={{ color: '#2dd4bf' }}
      >
        {title}
      </h3>
      <div
        className="mt-1.5 h-px w-full"
        style={{ backgroundColor: '#334155' }}
      />
    </div>
  );

  const MainBlock = ({ block }) => {
    if (block.type === 'summary') {
      return (
        <div className="pb-4">
          <div
            className="border-l-[4px] pl-4 text-[9.4px] leading-[1.55]"
            style={{
              borderColor: TEAL,
              color: TEXT,
            }}
          >
            {block.text}
          </div>
        </div>
      );
    }

    if (block.type === 'experience') {
      const item = block.item;

      return (
        <article className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3
                className="text-[10.7px] font-black leading-tight"
                style={{ color: NAVY_2 }}
              >
                {item.role}

                {block.continuation ? (
                  <span
                    className="ml-1 text-[6.2px] font-normal italic"
                    style={{ color: MUTED }}
                  >
                    continued
                  </span>
                ) : null}
              </h3>

              {!block.continuation && item.company ? (
                <div
                  className="mt-1 text-[7.6px] font-bold"
                  style={{ color: TEAL }}
                >
                  {item.company}
                </div>
              ) : null}
            </div>

            {!block.continuation && item.date ? (
              <span
                className="shrink-0 text-[6.3px] font-bold uppercase tracking-[0.07em]"
                style={{ color: MUTED }}
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
                  className="flex items-start gap-2 text-[8.6px] leading-[1.48]"
                  style={{ color: TEXT }}
                >
                  <span
                    className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: TEAL }}
                  />
                  <span>{line}</span>
                </div>
              ))}
            </div>
          ) : null}
        </article>
      );
    }

    return null;
  };

  const SideBlock = ({ block }) => {
    if (block.type === 'education') {
      const item = block.item;

      return (
        <article className="pb-3">
          <div className="text-[7.2px] font-bold leading-[1.3] text-white">
            {item.school || item.degree}
          </div>

          {item.school && item.degree ? (
            <div className="mt-1 text-[6.3px] italic leading-[1.35] text-slate-300">
              {item.degree}
            </div>
          ) : null}

          {item.date ? (
            <div className="mt-1 text-[5.8px] text-slate-500">
              {item.date}
            </div>
          ) : null}
        </article>
      );
    }

    if (block.type === 'skills') {
      return (
        <div className="pb-3.5">
          <div className="flex flex-wrap gap-1.5">
            {block.items.map((skill, index) => (
              <span
                key={`${block.id}-${index}`}
                className="rounded px-2 py-1.5 text-[6.2px] font-semibold text-white"
                style={{ backgroundColor: NAVY_2 }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      );
    }

    if (block.type === 'project') {
      const item = block.item;

      return (
        <article className="pb-3">
          <div
            className="rounded-[10px] border px-3 py-2.5"
            style={{
              borderColor: '#334155',
              backgroundColor: '#111c2f',
            }}
          >
            <div className="text-[7px] font-bold leading-[1.3] text-white">
              {item.name}
            </div>

            {item.desc ? (
              <div className="mt-1.5 whitespace-pre-wrap break-words text-[6.2px] leading-[1.4] text-slate-300">
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
          <div className="flex items-start gap-2 text-[6.6px] font-semibold leading-[1.35] text-slate-200">
            <span style={{ color: '#2dd4bf' }}>
              {block.type === 'award' ? '★' : '✓'}
            </span>
            <span>{item.name}</span>
          </div>

          {(item.issuer || item.date) ? (
            <div className="mt-1 pl-4 text-[5.7px] text-slate-500">
              {[item.issuer, item.date].filter(Boolean).join(' • ')}
            </div>
          ) : null}
        </article>
      );
    }

    if (block.type === 'language') {
      const item = block.item;

      return (
        <article className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[6.6px] font-semibold text-slate-200">
              {item.name}
            </span>

            {item.level ? (
              <span
                className="text-[5.7px] font-medium"
                style={{ color: '#5eead4' }}
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
    summary: 'Profile',
    experience: 'Experience',
  };

  const sideSections = {
    education: 'Education',
    skills: 'Skills',
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
            width: PAGE_WIDTH,
            height: USABLE_HEIGHT,
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
            width: PAGE_WIDTH,
            gridTemplateColumns: `${SIDEBAR_WIDTH} ${MAIN_WIDTH}`,
          }}
        >
          <div
            style={{
              width: SIDEBAR_WIDTH,
              padding: `${COLUMN_TOP} ${SIDEBAR_PAD_X} 0`,
              boxSizing: 'border-box',
              backgroundColor: NAVY,
            }}
          >
            <SidebarIdentity measureRef={sideFirstHeaderRef} />
            <div className="mt-[5mm]">
              <SidebarIdentity
                compact
                pageNumber={2}
                measureRef={sideContinuationHeaderRef}
              />
            </div>
          </div>

          <div
            style={{
              width: MAIN_WIDTH,
              padding: `${COLUMN_TOP} ${MAIN_PAD_X} 0`,
              boxSizing: 'border-box',
              backgroundColor: WHITE,
            }}
          >
            <MainHeader measureRef={mainFirstHeaderRef} />
            <div className="mt-[5mm]">
              <MainHeader
                compact
                pageNumber={2}
                measureRef={mainContinuationHeaderRef}
              />
            </div>
          </div>
        </div>

        <div
          className="grid"
          style={{
            width: PAGE_WIDTH,
            gridTemplateColumns: `${SIDEBAR_WIDTH} ${MAIN_WIDTH}`,
          }}
        >
          <div
            style={{
              width: SIDEBAR_WIDTH,
              padding: `0 ${SIDEBAR_PAD_X}`,
              boxSizing: 'border-box',
              backgroundColor: NAVY,
            }}
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

          <div
            style={{
              width: MAIN_WIDTH,
              padding: `0 ${MAIN_PAD_X}`,
              boxSizing: 'border-box',
            }}
          >
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
              key={`navy-sidebar-page-${pageIndex}`}
              className="relative mx-auto h-[297mm] w-[210mm] overflow-hidden bg-white shadow-xl print:shadow-none"
              style={{
                width: PAGE_WIDTH,
                height: PAGE_HEIGHT,
                display: 'grid',
                gridTemplateColumns: `${SIDEBAR_WIDTH} ${MAIN_WIDTH}`,
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
              <aside
                className="relative h-full text-slate-300"
                style={{
                  width: SIDEBAR_WIDTH,
                  backgroundColor: NAVY,
                  padding: `${COLUMN_TOP} ${SIDEBAR_PAD_X} ${COLUMN_BOTTOM}`,
                  boxSizing: 'border-box',
                }}
              >
                <SidebarIdentity
                  compact={pageIndex > 0}
                  pageNumber={pageIndex + 1}
                />

                <div className={pageIndex === 0 ? 'mt-[7mm]' : 'mt-[5mm]'}>
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

              <main
                className="relative h-full bg-white"
                style={{
                  width: MAIN_WIDTH,
                  padding: `${COLUMN_TOP} ${MAIN_PAD_X} ${COLUMN_BOTTOM}`,
                  boxSizing: 'border-box',
                }}
              >
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

              <footer
                className="absolute bottom-[4mm] right-[10mm] text-[5.8px] font-black uppercase tracking-[0.1em]"
                style={{ color: MUTED }}
              >
                Page {pageIndex + 1} / {pageCount}
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

export default NavySidebar;
