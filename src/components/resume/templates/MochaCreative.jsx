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

const MochaCreative = ({ data }) => {
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

  const PAGE_WIDTH = '210mm';
  const PAGE_HEIGHT = '297mm';
  const SIDEBAR_WIDTH = '64mm';
  const MAIN_WIDTH = '122mm';
  const GAP = '0mm';
  const CONTENT_HEIGHT = '275mm';
  const FOOTER_RESERVE = '8mm';

  const COLORS = {
    sidebar: '#4e342e',
    sidebarDark: '#3e2723',
    sidebarMid: '#5d4037',
    sidebarLight: '#6d4c41',
    beige: '#d7ccc8',
    beige2: '#a1887f',
    accent: '#8d6e63',
    paper: '#fffdf9',
    paper2: '#fdfbf7',
    soft: '#efebe9',
    text: '#4a3b32',
  };

  const mainMeasureRefs = useRef({});
  const sideMeasureRefs = useRef({});
  const mainSectionRefs = useRef({});
  const sideSectionRefs = useRef({});
  const sideFirstHeaderRef = useRef(null);
  const sideContinuationHeaderRef = useRef(null);
  const mainContinuationHeaderRef = useRef(null);
  const contentHeightRef = useRef(null);
  const footerReserveRef = useRef(null);

  const [mainPages, setMainPages] = useState([]);
  const [sidePages, setSidePages] = useState([]);

  const allSkills = useMemo(
    () => [...core, ...technical, ...soft].filter(Boolean),
    [core, technical, soft]
  );

  const chunkArray = useCallback((items = [], size = 8) => {
    const result = [];
    for (let i = 0; i < items.length; i += size) {
      result.push(items.slice(i, i + size));
    }
    return result;
  }, []);

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
  }, [chunkArray, experience, personal.summary, projects]);

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
    chunkArray,
    education,
    languages,
    projects,
  ]);

  const SidebarIdentity = ({ compact = false, measureRef = null, page = 1 }) => (
    <div ref={measureRef}>
      {!compact ? (
        <>
          <div className="text-center">
            {personal.photo ? (
              <img
                src={personal.photo}
                alt="Profile"
                className="mx-auto mb-5 h-[28mm] w-[28mm] rounded-full border-4 object-cover shadow-lg"
                style={{ borderColor: COLORS.accent }}
              />
            ) : null}

            <h1 className="text-[17px] font-black uppercase tracking-[0.05em] leading-tight text-white">
              {personal.name || 'Your Name'}
            </h1>

            {personal.title ? (
              <p
                className="mt-3 border-t pt-3 text-[7.5px] font-bold uppercase tracking-[0.14em]"
                style={{
                  borderColor: COLORS.sidebarLight,
                  color: COLORS.beige2,
                }}
              >
                {personal.title}
              </p>
            ) : null}
          </div>

          <div className="mt-5 space-y-3 text-[7px] font-medium">
            {personal.email ? (
              <div className="flex flex-col">
                <span
                  className="text-[6px] font-bold uppercase tracking-[0.1em]"
                  style={{ color: COLORS.accent }}
                >
                  Email
                </span>
                <span className="break-all text-white">{personal.email}</span>
              </div>
            ) : null}

            {personal.phone ? (
              <div className="flex flex-col">
                <span
                  className="text-[6px] font-bold uppercase tracking-[0.1em]"
                  style={{ color: COLORS.accent }}
                >
                  Phone
                </span>
                <span className="text-white">{personal.phone}</span>
              </div>
            ) : null}

            {personal.location ? (
              <div className="flex flex-col">
                <span
                  className="text-[6px] font-bold uppercase tracking-[0.1em]"
                  style={{ color: COLORS.accent }}
                >
                  Location
                </span>
                <span className="break-words text-white">{personal.location}</span>
              </div>
            ) : null}
          </div>
        </>
      ) : (
        <div className="border-b pb-3" style={{ borderColor: COLORS.sidebarLight }}>
          <div className="text-[10px] font-black uppercase tracking-[0.06em] text-white">
            {personal.name || 'Your Name'}
          </div>
          {personal.title ? (
            <div
              className="mt-1 text-[6px] font-bold uppercase tracking-[0.1em]"
              style={{ color: COLORS.beige2 }}
            >
              {personal.title}
            </div>
          ) : null}
          <div
            className="mt-2 text-[6px] font-bold uppercase tracking-[0.12em]"
            style={{ color: COLORS.accent }}
          >
            Page {page}
          </div>
        </div>
      )}
    </div>
  );

  const MainContinuationHeader = ({ measureRef = null, page = 2 }) => (
    <div
      ref={measureRef}
      className="mb-[5mm] flex items-end justify-between border-b pb-3"
      style={{ borderColor: COLORS.soft }}
    >
      <div>
        <div
          className="text-[12px] font-black uppercase tracking-[0.05em]"
          style={{ color: COLORS.sidebarDark }}
        >
          {personal.name || 'Your Name'}
        </div>
        {personal.title ? (
          <div
            className="mt-1 text-[7px] font-bold uppercase tracking-[0.12em]"
            style={{ color: COLORS.accent }}
          >
            {personal.title}
          </div>
        ) : null}
      </div>

      <div
        className="rounded-full px-3 py-1 text-[6.5px] font-black uppercase tracking-[0.1em]"
        style={{
          backgroundColor: COLORS.soft,
          color: COLORS.sidebarDark,
        }}
      >
        Page {page}
      </div>
    </div>
  );

  const SectionTitle = ({ title, sidebar = false }) => (
    <div className={sidebar ? 'mb-3' : 'mb-4'}>
      <h3
        className={`${sidebar ? 'text-[7px] text-white' : 'text-[9px]'} font-black uppercase tracking-[0.14em]`}
        style={{
          color: sidebar ? '#ffffff' : COLORS.sidebarDark,
          borderBottom: sidebar
            ? `1px solid ${COLORS.sidebarLight}`
            : `2px solid ${COLORS.beige}`,
          paddingBottom: sidebar ? '4px' : '6px',
          display: 'inline-block',
        }}
      >
        {title}
      </h3>
    </div>
  );

  const MainBlock = ({ block }) => {
    if (block.type === 'summary') {
      return (
        <div className="pb-4">
          <section
            className="rounded-tl-[20px] rounded-br-[20px] p-4"
            style={{ backgroundColor: COLORS.soft }}
          >
            <p
              className="whitespace-pre-wrap text-[9.2px] leading-[1.5]"
              style={{ color: COLORS.sidebarMid }}
            >
              {block.text}
            </p>
          </section>
        </div>
      );
    }

    if (block.type === 'experience') {
      const item = block.item;

      return (
        <article className="pb-4">
          <div className="relative border-l-2 pl-5" style={{ borderColor: COLORS.beige }}>
            <div
              className="absolute -left-[6px] top-[3px] h-3 w-3 rounded-full"
              style={{ backgroundColor: COLORS.accent }}
            />

            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h4
                  className="text-[10.7px] font-bold leading-tight"
                  style={{ color: COLORS.sidebarDark }}
                >
                  {item.role}
                  {block.continuation ? (
                    <span className="ml-1 text-[6px] font-normal italic" style={{ color: COLORS.beige2 }}>
                      continued
                    </span>
                  ) : null}
                </h4>

                {!block.continuation && item.company ? (
                  <div
                    className="mt-1 text-[7.5px] font-bold"
                    style={{ color: COLORS.accent }}
                  >
                    {item.company}
                  </div>
                ) : null}
              </div>

              {!block.continuation && item.date ? (
                <span
                  className="shrink-0 text-[6.3px] font-bold uppercase tracking-[0.08em]"
                  style={{ color: COLORS.beige2 }}
                >
                  {item.date}
                </span>
              ) : null}
            </div>

            {block.lines.length ? (
              <div className="mt-2 space-y-1.5">
                {block.lines.map((line, index) => (
                  <div
                    key={`${block.id}-${index}`}
                    className="flex items-start gap-2 text-[8.4px] leading-[1.45]"
                    style={{ color: COLORS.sidebarMid }}
                  >
                    <span
                      className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: COLORS.accent }}
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
        <article className="pb-3">
          <div
            className="rounded border p-3"
            style={{
              borderColor: COLORS.soft,
              backgroundColor: '#ffffff',
              boxShadow: '0 3px 10px rgba(78,52,46,0.04)',
            }}
          >
            <h4
              className="mb-1 text-[8.5px] font-bold"
              style={{ color: COLORS.sidebarDark }}
            >
              {item.name}
            </h4>
            {item.desc ? (
              <p
                className="whitespace-pre-wrap text-[7.4px] leading-[1.4]"
                style={{ color: COLORS.sidebarLight }}
              >
                {item.desc}
              </p>
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
        <div className="pb-3">
          <div className="flex flex-wrap gap-1.5">
            {block.items.map((skill, index) => (
              <span
                key={`${block.id}-${index}`}
                className="rounded border px-2 py-1 text-[6.2px] font-medium"
                style={{
                  backgroundColor: COLORS.sidebarDark,
                  borderColor: COLORS.sidebarMid,
                  color: COLORS.beige,
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
          <div className="text-[7px] font-bold text-white">
            {item.school || item.degree}
          </div>

          {item.school && item.degree ? (
            <div className="mt-1 text-[6.2px]" style={{ color: COLORS.beige2 }}>
              {item.degree}
            </div>
          ) : null}

          {item.date ? (
            <div className="mt-1 text-[6px] italic opacity-70">
              {item.date}
            </div>
          ) : null}
        </article>
      );
    }

    if (block.type === 'award' || block.type === 'certification') {
      const item = block.item;

      return (
        <article className="pb-2.5">
          <div className="text-[6.8px] font-bold leading-[1.3] text-white">
            {block.type === 'award' ? '★ ' : '✓ '}
            {item.name}
          </div>

          {(item.issuer || item.date) ? (
            <div className="mt-1 text-[5.8px]" style={{ color: COLORS.beige2 }}>
              {[item.issuer, item.date].filter(Boolean).join(' • ')}
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
            className="rounded border px-3 py-2.5"
            style={{
              backgroundColor: COLORS.sidebarDark,
              borderColor: COLORS.sidebarMid,
            }}
          >
            <div className="text-[7px] font-bold leading-[1.3] text-white">
              {item.name}
            </div>

            {item.desc ? (
              <div
                className="mt-1.5 whitespace-pre-wrap break-words text-[6.1px] leading-[1.4]"
                style={{ color: COLORS.beige }}
              >
                {item.desc}
              </div>
            ) : null}
          </div>
        </article>
      );
    }

    if (block.type === 'language') {
      const item = block.item;

      return (
        <article className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[6.8px] font-bold text-white">{item.name}</span>
            {item.level ? (
              <span className="text-[5.8px]" style={{ color: COLORS.beige2 }}>
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
    experience: 'Experience',
  };

  const sideSections = {
    skills: 'Expertise',
    education: 'Education',
    projects: 'Projects',
    achievements: 'Achievements',
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
            (pageIndex === 0 ? firstHeaderHeight : continuationHeaderHeight)
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

        if (pageBlocks.length && usedHeight + required > getLimit()) {
          commitPage();

          required =
            blockHeight +
            (block.section && sectionRefs.current[block.section]
              ? sectionRefs.current[block.section].getBoundingClientRect().height
              : 0);
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
        // Page 1 main column has no header, so do not reserve sidebar identity height here.
        firstHeaderRef: null,
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
  }, [mainBlocks, paginateColumn, sideBlocks]);

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

    if (document.fonts?.ready) {
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
        sideFirstHeaderRef.current,
        sideContinuationHeaderRef.current,
        mainContinuationHeaderRef.current,
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
    mainPages.length ? mainPages : [{ blocks: mainBlocks }];

  const visibleSidePages =
    sidePages.length ? sidePages : [{ blocks: sideBlocks }];

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
            width: PAGE_WIDTH,
            gridTemplateColumns: `${SIDEBAR_WIDTH} ${MAIN_WIDTH}`,
            columnGap: GAP,
          }}
        >
          <div
            style={{
              width: SIDEBAR_WIDTH,
              backgroundColor: COLORS.sidebar,
              padding: '9mm 7mm',
            }}
          >
            <SidebarIdentity measureRef={sideFirstHeaderRef} />
            <div className="mt-[5mm]">
              <SidebarIdentity compact page={2} measureRef={sideContinuationHeaderRef} />
            </div>
          </div>

          <div
            style={{
              width: MAIN_WIDTH,
              padding: '9mm 10mm',
            }}
          >
            <MainContinuationHeader measureRef={mainContinuationHeaderRef} page={2} />
          </div>
        </div>

        <div
          className="grid"
          style={{
            width: PAGE_WIDTH,
            gridTemplateColumns: `${SIDEBAR_WIDTH} ${MAIN_WIDTH}`,
            columnGap: GAP,
          }}
        >
          <div
            style={{
              width: SIDEBAR_WIDTH,
              backgroundColor: COLORS.sidebar,
              padding: '0 7mm',
            }}
          >
            {Object.entries(sideSections).map(([section, title]) => (
              <div
                key={`side-title-${section}`}
                ref={(node) => {
                  sideSectionRefs.current[section] = node;
                }}
              >
                <SectionTitle title={title} sidebar />
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
              padding: '0 10mm',
            }}
          >
            {Object.entries(mainSections).map(([section, title]) => (
              <div
                key={`main-title-${section}`}
                ref={(node) => {
                  mainSectionRefs.current[section] = node;
                }}
              >
                <SectionTitle title={title} />
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
              key={`mocha-page-${pageIndex}`}
              className="relative mx-auto h-[297mm] w-[210mm] overflow-hidden bg-white shadow-xl print:shadow-none"
              style={{
                width: PAGE_WIDTH,
                height: PAGE_HEIGHT,
                display: 'grid',
                gridTemplateColumns: `${SIDEBAR_WIDTH} ${MAIN_WIDTH}`,
                columnGap: GAP,
                breakAfter:
                  pageIndex < pageCount - 1 ? 'page' : 'auto',
                pageBreakAfter:
                  pageIndex < pageCount - 1 ? 'always' : 'auto',
              }}
            >
              <aside
                className="relative flex h-full flex-col text-[#d7ccc8]"
                style={{
                  width: SIDEBAR_WIDTH,
                  backgroundColor: COLORS.sidebar,
                  padding: '9mm 7mm 13mm',
                  boxSizing: 'border-box',
                }}
              >
                <SidebarIdentity compact={pageIndex > 0} page={pageIndex + 1} />

                <div className={pageIndex === 0 ? 'mt-[7mm]' : 'mt-[5mm]'}>
                  {sidePage.blocks.map((block, blockIndex) => {
                    const previous = sidePage.blocks[blockIndex - 1];
                    const title = sideSections[block.section];
                    const showTitle =
                      Boolean(title) &&
                      (blockIndex === 0 ||
                        previous?.section !== block.section);

                    return (
                      <React.Fragment key={`${pageIndex}-side-${block.id}`}>
                        {showTitle ? (
                          <SectionTitle title={title} sidebar />
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
                className="relative h-full"
                style={{
                  width: MAIN_WIDTH,
                  backgroundColor: COLORS.paper,
                  padding: '9mm 10mm 13mm',
                  boxSizing: 'border-box',
                }}
              >
                {pageIndex > 0 ? (
                  <MainContinuationHeader page={pageIndex + 1} />
                ) : null}

                {mainPage.blocks.map((block, blockIndex) => {
                  const previous = mainPage.blocks[blockIndex - 1];
                  const title = mainSections[block.section];
                  const showTitle =
                    Boolean(title) &&
                    (blockIndex === 0 ||
                      previous?.section !== block.section);

                  return (
                    <React.Fragment key={`${pageIndex}-main-${block.id}`}>
                      {showTitle ? (
                        <SectionTitle title={title} />
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
                className="absolute bottom-[4.5mm] right-[10mm] text-[5.8px] font-black uppercase tracking-[0.1em]"
                style={{ color: COLORS.beige2 }}
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

export default MochaCreative;
