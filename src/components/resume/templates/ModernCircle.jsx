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

const ModernCircle = ({ data }) => {
  const {
    personal = {},
    experience = [],
    education = [],
    skills = {},
    projects = [],
    awards = [],
  } = data || {};

  const { core = [], technical = [], soft = [] } = skills;

  const ROSE = '#f43f5e';
  const ROSE_SOFT = '#fff1f2';
  const SLATE = '#0f172a';
  const TEXT = '#475569';
  const MUTED = '#94a3b8';
  const BORDER = '#e2e8f0';
  const PAPER = '#ffffff';

  const PAGE_WIDTH = '210mm';
  const PAGE_HEIGHT = '297mm';
  const INNER_WIDTH = '188mm';
  const MAIN_WIDTH = '122mm';
  const SIDE_WIDTH = '58mm';
  const GAP = '8mm';
  const CONTENT_HEIGHT = '256mm';
  const FOOTER_RESERVE = '8mm';

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
  }, [chunkArray, experience, personal.summary]);

  const sideBlocks = useMemo(() => {
    const blocks = [];

    if (
      personal.photo ||
      personal.email ||
      personal.phone ||
      personal.location
    ) {
      blocks.push({
        id: 'contact-card',
        section: 'contact',
        type: 'contact',
      });
    }

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
        section: 'awards',
        type: 'award',
        item,
      });
    });

    return blocks;
  }, [
    allSkills,
    awards,
    chunkArray,
    education,
    personal.email,
    personal.location,
    personal.phone,
    personal.photo,
    projects,
  ]);

  const Header = ({ pageNumber = 1, measureRef = null }) => {
    const nameParts = String(personal.name || 'Your Name').trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ');

    return (
      <header ref={measureRef} className="relative mb-[6mm] overflow-hidden">
        {pageNumber === 1 ? (
          <div className="relative min-h-[35mm] border-l-[7px] pl-[7mm] pr-[6mm] pt-[3mm] pb-[4mm]" style={{ borderColor: ROSE }}>
            <div
              className="absolute -right-[42mm] -top-[40mm] h-[92mm] w-[92mm] rounded-full"
              style={{ backgroundColor: ROSE_SOFT }}
            />

            <div className="relative z-10">
              <h1 className="text-[29px] font-black uppercase leading-[0.95] tracking-[-0.04em]" style={{ color: SLATE }}>
                {firstName}
              </h1>

              {lastName ? (
                <h1 className="text-[29px] font-black uppercase leading-[0.95] tracking-[-0.04em]" style={{ color: ROSE }}>
                  {lastName}
                </h1>
              ) : null}

              {personal.title ? (
                <p
                  className="mt-2 text-[10px] font-medium uppercase tracking-[0.14em]"
                  style={{ color: TEXT }}
                >
                  {personal.title}
                </p>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="flex items-end justify-between border-b pb-3" style={{ borderColor: BORDER }}>
            <div>
              <div className="text-[12px] font-black uppercase tracking-[-0.01em]" style={{ color: SLATE }}>
                {personal.name || 'Your Name'}
              </div>

              {personal.title ? (
                <div className="mt-1 text-[7px] font-semibold uppercase tracking-[0.1em]" style={{ color: ROSE }}>
                  {personal.title}
                </div>
              ) : null}
            </div>

            <div
              className="rounded-full px-3 py-1 text-[6.5px] font-black uppercase tracking-[0.09em]"
              style={{
                backgroundColor: ROSE_SOFT,
                color: ROSE,
              }}
            >
              Page {pageNumber}
            </div>
          </div>
        )}
      </header>
    );
  };

  const SectionTitle = ({ title, compact = false }) => (
    <div className={compact ? 'mb-3' : 'mb-4'}>
      <h2
        className={`${compact ? 'text-[8px]' : 'text-[10px]'} font-black uppercase tracking-[0.11em]`}
        style={{ color: ROSE }}
      >
        {title}
      </h2>

      <div
        className={`${compact ? 'mt-1 h-[1px]' : 'mt-1.5 h-[2px]'} w-full`}
        style={{
          background:
            compact
              ? `linear-gradient(90deg, ${ROSE} 0%, ${BORDER} 52%, transparent 100%)`
              : `linear-gradient(90deg, ${ROSE} 0%, ${ROSE} 22%, ${BORDER} 22%, ${BORDER} 100%)`,
        }}
      />
    </div>
  );

  const MainBlock = ({ block }) => {
    if (block.type === 'summary') {
      return (
        <div className="pb-4">
          <div
            className="rounded-[16px] border-l-[4px] px-4 py-3"
            style={{
              borderColor: ROSE,
              backgroundColor: '#fffafa',
            }}
          >
            <p className="whitespace-pre-wrap text-[9.5px] font-normal italic leading-[1.55]" style={{ color: TEXT }}>
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
          <div className="relative pl-5">
            <div
              className="absolute bottom-0 left-[4px] top-[5px] w-px"
              style={{ backgroundColor: '#fecdd3' }}
            />

            <div
              className="absolute left-0 top-[4px] h-[9px] w-[9px] rounded-full border-2"
              style={{
                backgroundColor: PAPER,
                borderColor: ROSE,
              }}
            />

            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="text-[11px] font-black leading-tight" style={{ color: SLATE }}>
                  {item.role}
                  {block.continuation ? (
                    <span className="ml-1 text-[6.5px] font-normal italic" style={{ color: MUTED }}>
                      continued
                    </span>
                  ) : null}
                </h3>

                {!block.continuation && item.company ? (
                  <div className="mt-1 text-[7.6px] font-black uppercase tracking-[0.08em]" style={{ color: ROSE }}>
                    {item.company}
                  </div>
                ) : null}
              </div>

              {!block.continuation && item.date ? (
                <span
                  className="shrink-0 rounded-full px-2.5 py-1 text-[6.3px] font-black uppercase tracking-[0.07em]"
                  style={{
                    backgroundColor: '#f8fafc',
                    color: TEXT,
                  }}
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
                    className="flex items-start gap-2 text-[8.7px] leading-[1.5]"
                    style={{ color: TEXT }}
                  >
                    <span
                      className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: ROSE }}
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
    if (block.type === 'contact') {
      return (
        <div className="pb-4">
          <div
            className="rounded-[16px] p-4 text-white shadow-[0_10px_24px_rgba(15,23,42,0.12)]"
            style={{ backgroundColor: SLATE }}
          >
            {personal.photo ? (
              <div className="mb-4 flex justify-center">
                <img
                  src={personal.photo}
                  alt="Profile"
                  className="h-[23mm] w-[23mm] rounded-full border-4 object-cover"
                  style={{ borderColor: ROSE }}
                />
              </div>
            ) : null}

            <div className="space-y-2 text-center text-[7px] font-medium text-slate-300">
              {personal.email ? (
                <div className="break-all">{personal.email}</div>
              ) : null}
              {personal.phone ? <div>{personal.phone}</div> : null}
              {personal.location ? (
                <div className="break-words">{personal.location}</div>
              ) : null}
            </div>
          </div>
        </div>
      );
    }

    if (block.type === 'skills') {
      return (
        <div className="pb-3.5">
          <div className="flex flex-wrap gap-1.5">
            {block.items.map((skill, index) => (
              <span
                key={`${block.id}-${index}`}
                className="rounded-full px-2.5 py-1.5 text-[6.7px] font-bold"
                style={{
                  backgroundColor: ROSE_SOFT,
                  color: '#e11d48',
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
          <div className="text-[7.7px] font-bold leading-[1.3]" style={{ color: SLATE }}>
            {item.school || item.degree}
          </div>

          {item.school && item.degree ? (
            <div className="mt-1 text-[6.8px] leading-[1.35]" style={{ color: TEXT }}>
              {item.degree}
            </div>
          ) : null}

          {item.date ? (
            <div className="mt-1 text-[6.2px] font-semibold" style={{ color: ROSE }}>
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
            className="rounded-[13px] border px-3 py-2.5"
            style={{
              borderColor: '#ffe4e6',
              backgroundColor: '#fffafa',
            }}
          >
            <div className="text-[7.5px] font-black leading-[1.3]" style={{ color: SLATE }}>
              {item.name}
            </div>

            {item.desc ? (
              <div className="mt-1.5 whitespace-pre-wrap break-words text-[6.6px] leading-[1.4]" style={{ color: TEXT }}>
                {item.desc}
              </div>
            ) : null}
          </div>
        </article>
      );
    }

    if (block.type === 'award') {
      const item = block.item;

      return (
        <article className="pb-2.5">
          <div className="flex items-start gap-2 text-[7px] font-medium leading-[1.35]" style={{ color: TEXT }}>
            <span className="mt-[1px]" style={{ color: ROSE }}>★</span>
            <span>{item.name}</span>
          </div>
        </article>
      );
    }

    return null;
  };

  const mainSections = {
    summary: 'Profile',
    experience: 'Work History',
  };

  const sideSections = {
    contact: null,
    skills: 'Skills',
    education: 'Education',
    projects: 'Projects',
    awards: 'Honors',
  };

  const paginateColumn = useCallback(
    ({ blocks, blockRefs, sectionRefs }) => {
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
      })
    );

    setSidePages(
      paginateColumn({
        blocks: sideBlocks,
        blockRefs: sideMeasureRefs,
        sectionRefs: sideSectionRefs,
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
          <Header pageNumber={1} measureRef={firstHeaderRef} />
          <Header pageNumber={2} measureRef={continuationHeaderRef} />
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
                key={`main-title-${section}`}
                ref={(node) => {
                  mainSectionRefs.current[section] = node;
                }}
              >
                {title ? <SectionTitle title={title} /> : null}
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
                key={`side-title-${section}`}
                ref={(node) => {
                  sideSectionRefs.current[section] = node;
                }}
              >
                {title ? <SectionTitle title={title} compact /> : null}
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
              key={`modern-circle-page-${pageIndex}`}
              className="relative mx-auto h-[297mm] w-[210mm] overflow-hidden bg-white shadow-xl print:shadow-none"
              style={{
                width: PAGE_WIDTH,
                height: PAGE_HEIGHT,
                padding: '8mm 11mm 13mm',
                boxSizing: 'border-box',
                breakAfter:
                  pageIndex < pageCount - 1 ? 'page' : 'auto',
                pageBreakAfter:
                  pageIndex < pageCount - 1 ? 'always' : 'auto',
              }}
            >
              <Header pageNumber={pageIndex + 1} />

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
                    const previous = mainPage.blocks[blockIndex - 1];
                    const title = mainSections[block.section];
                    const showTitle =
                      Boolean(title) &&
                      (blockIndex === 0 ||
                        previous?.section !== block.section);

                    return (
                      <React.Fragment key={`${pageIndex}-main-${block.id}`}>
                        {showTitle ? <SectionTitle title={title} /> : null}

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
                          <SectionTitle title={title} compact />
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
                className="absolute bottom-[4.5mm] left-[11mm] right-[11mm] flex items-center justify-between border-t pt-1.5 text-[6px] font-black uppercase tracking-[0.1em]"
                style={{
                  borderColor: BORDER,
                  color: MUTED,
                }}
              >
                <span style={{ color: ROSE }}>Confidential</span>
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

export default ModernCircle;
