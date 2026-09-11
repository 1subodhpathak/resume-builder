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

const RubyCreative = ({ data }) => {
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

  const RUBY = '#9d174d';
  const RUBY_DARK = '#831843';
  const RUBY_DEEP = '#500724';
  const RUBY_PALE = '#fdf2f8';
  const TEXT = '#475569';
  const NAVY = '#0f172a';
  const MUTED = '#94a3b8';
  const BORDER = '#e2e8f0';
  const WHITE = '#ffffff';

  const PAGE_WIDTH = '210mm';
  const PAGE_HEIGHT = '297mm';
  const SIDEBAR_WIDTH = '64mm';
  const MAIN_WIDTH = '146mm';
  const SIDEBAR_PAD_X = '7mm';
  const MAIN_PAD_X = '10mm';
  const TOP_PAD = '9mm';
  const BOTTOM_PAD = '13mm';
  const USABLE_HEIGHT = '275mm';
  const FOOTER_RESERVE = '6mm';

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
        section: 'recognition',
        type: 'certification',
        item,
      });
    });

    awards.forEach((item, index) => {
      blocks.push({
        id: `award-${item.id ?? index}`,
        section: 'recognition',
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

  const SidebarIdentity = ({
    compact = false,
    pageNumber = 1,
    measureRef = null,
  }) => (
    <div ref={measureRef}>
      {!compact ? (
        <>
          <div className="text-center">
            {personal.photo ? (
              <img
                src={personal.photo}
                alt="Profile"
                className="mx-auto mb-5 h-[27mm] w-[27mm] rounded-full border-4 object-cover shadow-xl"
                style={{
                  borderColor: '#f9a8d4',
                  boxShadow: '0 8px 24px rgba(80,7,36,.30)',
                }}
              />
            ) : null}

            <h1 className="break-words text-[16px] font-black uppercase leading-[1.02] tracking-[0.03em] text-white">
              {personal.name || 'Your Name'}
            </h1>

            {personal.title ? (
              <p
                className="mt-2 text-[6.7px] font-black uppercase tracking-[0.14em]"
                style={{ color: '#f9a8d4' }}
              >
                {personal.title}
              </p>
            ) : null}
          </div>

          {(personal.email || personal.phone || personal.location) ? (
            <div className="mt-[6mm] space-y-2.5 text-[6.4px] font-medium">
              {personal.email ? (
                <div className="break-all border-b pb-2" style={{ borderColor: '#be185d' }}>
                  {personal.email}
                </div>
              ) : null}

              {personal.phone ? (
                <div className="border-b pb-2" style={{ borderColor: '#be185d' }}>
                  {personal.phone}
                </div>
              ) : null}

              {personal.location ? (
                <div className="break-words border-b pb-2" style={{ borderColor: '#be185d' }}>
                  {personal.location}
                </div>
              ) : null}
            </div>
          ) : null}
        </>
      ) : (
        <div className="border-b pb-3" style={{ borderColor: '#be185d' }}>
          <div className="text-[8.5px] font-black uppercase tracking-[0.05em] text-white">
            {personal.name || 'Your Name'}
          </div>

          {personal.title ? (
            <div
              className="mt-1 text-[5.7px] font-bold uppercase tracking-[0.09em]"
              style={{ color: '#f9a8d4' }}
            >
              {personal.title}
            </div>
          ) : null}

          <div className="mt-2 text-[5.7px] font-bold uppercase tracking-[0.1em] text-pink-300/60">
            Page {pageNumber}
          </div>
        </div>
      )}
    </div>
  );

  const MainHeader = ({
    compact = false,
    pageNumber = 1,
    measureRef = null,
  }) => (
    <div ref={measureRef}>
      {!compact ? (
        <div className="mb-[6mm]">
          <div className="relative overflow-hidden pb-4">
            <div
              className="absolute -left-[8mm] top-[3mm] h-[10mm] w-[48mm] rotate-[-4deg] opacity-10"
              style={{
                backgroundColor: RUBY,
                borderRadius: '999px',
              }}
            />

            <div className="relative">
              <div
                className="text-[8px] font-black uppercase tracking-[0.18em]"
                style={{ color: RUBY }}
              >
                Curriculum Vitae
              </div>

              <div
                className="mt-1 h-[3px] w-[34mm]"
                style={{
                  background: `linear-gradient(90deg, ${RUBY}, #f472b6, transparent)`,
                }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-[5mm] flex items-end justify-between border-b pb-3" style={{ borderColor: BORDER }}>
          <div>
            <div className="text-[11px] font-black uppercase tracking-[-0.01em]" style={{ color: NAVY }}>
              {personal.name || 'Your Name'}
            </div>

            {personal.title ? (
              <div
                className="mt-1 text-[6px] font-black uppercase tracking-[0.1em]"
                style={{ color: RUBY }}
              >
                {personal.title}
              </div>
            ) : null}
          </div>

          <div
            className="rounded-full px-3 py-1 text-[6px] font-black uppercase tracking-[0.08em]"
            style={{
              backgroundColor: RUBY_PALE,
              color: RUBY_DARK,
            }}
          >
            Page {pageNumber}
          </div>
        </div>
      )}
    </div>
  );

  const MainSectionTitle = ({ title }) => (
    <div className="relative mb-4">
      <div
        className="pointer-events-none absolute -top-3 left-0 text-[23px] font-black uppercase leading-none tracking-[-0.04em]"
        style={{
          color: RUBY,
          opacity: 0.07,
        }}
      >
        {title}
      </div>

      <div className="relative flex items-center gap-2.5 pt-2">
        <div className="h-[8px] w-[26px] rounded-full" style={{ backgroundColor: RUBY }} />

        <h3
          className="text-[9.5px] font-black uppercase tracking-[0.11em]"
          style={{ color: RUBY_DARK }}
        >
          {title}
        </h3>

        <div className="h-px flex-1" style={{ backgroundColor: '#fbcfe8' }} />
      </div>
    </div>
  );

  const SideSectionTitle = ({ title }) => (
    <div className="mb-3">
      <h3 className="inline-block border-b-2 border-pink-400 pb-1 text-[6.8px] font-black uppercase tracking-[0.12em] text-white">
        {title}
      </h3>
    </div>
  );

  const MainBlock = ({ block }) => {
    if (block.type === 'summary') {
      return (
        <div className="pb-4">
          <div
            className="rounded-r-[16px] border-l-[4px] px-4 py-3"
            style={{
              borderColor: RUBY,
              backgroundColor: RUBY_PALE,
            }}
          >
            <p
              className="whitespace-pre-wrap text-[9.3px] font-medium leading-[1.55]"
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
          <div className="relative border-l-[2px] pl-5" style={{ borderColor: '#fbcfe8' }}>
            <div
              className="absolute -left-[5px] top-[4px] h-[8px] w-[8px] rounded-full"
              style={{ backgroundColor: RUBY }}
            />

            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h4 className="text-[10.7px] font-black leading-tight" style={{ color: NAVY }}>
                  {item.role}

                  {block.continuation ? (
                    <span className="ml-1 text-[6px] font-normal italic" style={{ color: MUTED }}>
                      continued
                    </span>
                  ) : null}
                </h4>

                {!block.continuation && item.company ? (
                  <div className="mt-1 text-[7.4px] font-bold" style={{ color: RUBY }}>
                    {item.company}
                  </div>
                ) : null}
              </div>

              {!block.continuation && item.date ? (
                <div
                  className="shrink-0 text-[6.2px] font-bold uppercase tracking-[0.08em]"
                  style={{ color: MUTED }}
                >
                  {item.date}
                </div>
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
                      className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: '#f472b6' }}
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
                className="rounded border px-2 py-1.5 text-[6.1px] font-semibold"
                style={{
                  backgroundColor: 'rgba(80,7,36,.35)',
                  borderColor: '#be185d',
                  color: '#fce7f3',
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
          <div className="text-[7.1px] font-bold leading-[1.3] text-white">
            {item.school || item.degree}
          </div>

          {item.school && item.degree ? (
            <div className="mt-1 text-[6.2px] leading-[1.35]" style={{ color: '#fbcfe8' }}>
              {item.degree}
            </div>
          ) : null}

          {item.date ? (
            <div className="mt-1 text-[5.7px] text-pink-300/60">
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
            className="rounded-[10px] border px-3 py-2.5"
            style={{
              backgroundColor: 'rgba(80,7,36,.32)',
              borderColor: '#be185d',
            }}
          >
            <div className="text-[6.9px] font-bold leading-[1.3] text-white">
              {item.name}
            </div>

            {item.desc ? (
              <div className="mt-1.5 whitespace-pre-wrap break-words text-[6.1px] font-medium leading-[1.4] text-pink-100/85">
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
            <span className="mt-[1px] text-[7px] font-black" style={{ color: '#f9a8d4' }}>
              {block.type === 'award' ? '★' : '✓'}
            </span>

            <div>
              <div className="text-[6.5px] font-semibold leading-[1.35] text-pink-50">
                {item.name}
              </div>

              {(item.issuer || item.date) ? (
                <div className="mt-1 text-[5.6px] text-pink-300/60">
                  {[item.issuer, item.date].filter(Boolean).join(' • ')}
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
          <div
            className="flex items-center justify-between gap-2 border-b pb-1.5"
            style={{ borderColor: '#be185d' }}
          >
            <span className="text-[6.5px] font-semibold text-pink-50">
              {item.name}
            </span>

            {item.level ? (
              <span className="text-[5.6px] font-medium text-pink-300">
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
    skills: 'Skills',
    education: 'Education',
    projects: 'Projects',
    recognition: 'Recognition',
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

    if (typeof document !== 'undefined' && document.fonts?.ready) {
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
              padding: `${TOP_PAD} ${SIDEBAR_PAD_X} 0`,
              boxSizing: 'border-box',
              backgroundColor: RUBY,
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
              padding: `${TOP_PAD} ${MAIN_PAD_X} 0`,
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
              backgroundColor: RUBY,
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

      <div className="space-y-5 print:space-y-0">
        {Array.from({ length: pageCount }).map((_, pageIndex) => {
          const mainPage =
            visibleMainPages[pageIndex] || { blocks: [] };

          const sidePage =
            visibleSidePages[pageIndex] || { blocks: [] };

          return (
            <section
              key={`ruby-page-${pageIndex}`}
              className="relative mx-auto h-[297mm] w-[210mm] overflow-hidden bg-white shadow-xl print:shadow-none"
              style={{
                width: PAGE_WIDTH,
                height: PAGE_HEIGHT,
                display: 'grid',
                gridTemplateColumns: `${SIDEBAR_WIDTH} ${MAIN_WIDTH}`,
                breakAfter: pageIndex < pageCount - 1 ? 'page' : 'auto',
                pageBreakAfter: pageIndex < pageCount - 1 ? 'always' : 'auto',
              }}
            >
              <aside
                className="relative h-full"
                style={{
                  width: SIDEBAR_WIDTH,
                  padding: `${TOP_PAD} ${SIDEBAR_PAD_X} ${BOTTOM_PAD}`,
                  boxSizing: 'border-box',
                  background: `linear-gradient(180deg, ${RUBY} 0%, ${RUBY_DARK} 68%, ${RUBY_DEEP} 100%)`,
                  color: '#fdf2f8',
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
                      (blockIndex === 0 || previous?.section !== block.section);

                    return (
                      <React.Fragment key={`${pageIndex}-side-${block.id}`}>
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
                  padding: `${TOP_PAD} ${MAIN_PAD_X} ${BOTTOM_PAD}`,
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
                    (blockIndex === 0 || previous?.section !== block.section);

                  return (
                    <React.Fragment key={`${pageIndex}-main-${block.id}`}>
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

export default RubyCreative;
