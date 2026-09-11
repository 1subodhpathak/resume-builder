import { mergeExperienceFragmentsOnPage } from '../templateSurfaceUtils';
import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Linkedin,
  Mail,
  MapPin,
  Phone,
} from 'lucide-react';

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

const Startup = ({ data }) => {
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

  const PURPLE = '#6366f1';
  const PURPLE_DARK = '#4f46e5';
  const PURPLE_DEEP = '#312e81';
  const CYAN = '#06b6d4';
  const CYAN_DARK = '#0891b2';
  const CYAN_SOFT = '#ecfeff';
  const NAVY = '#0f172a';
  const TEXT = '#475569';
  const MUTED = '#94a3b8';
  const BORDER = '#e2e8f0';
  const WHITE = '#ffffff';

  const PAGE_WIDTH = '210mm';
  const PAGE_HEIGHT = '297mm';
  const INNER_WIDTH = '188mm';
  const MAIN_WIDTH = '120mm';
  const SIDE_WIDTH = '60mm';
  const GAP = '8mm';
  const CONTENT_HEIGHT = '276mm';
  const FOOTER_RESERVE = '6mm';

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
    () => [
      ...(skills.core || []),
      ...(skills.technical || []),
      ...(skills.soft || []),
    ].filter(Boolean),
    [skills]
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

  const Header = ({
    compact = false,
    pageNumber = 1,
    measureRef = null,
  }) => (
    <div ref={measureRef} className={compact ? 'mb-[5mm]' : 'mb-[7mm]'}>
      {!compact ? (
        <div
          className="relative overflow-hidden text-white"
          style={{
            marginLeft: '-11mm',
            marginRight: '-11mm',
            marginTop: '-8mm',
            padding: '9mm 11mm 10mm',
            background: `linear-gradient(135deg, ${PURPLE_DARK} 0%, ${PURPLE} 42%, ${CYAN} 100%)`,
          }}
        >
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.18) 10px, rgba(255,255,255,.18) 20px)',
            }}
          />

          <div className="absolute right-[8mm] top-[7mm] h-[20mm] w-[20mm] rounded-full border border-white/20" />
          <div className="absolute right-[20mm] bottom-[-7mm] h-[24mm] w-[42mm] rotate-[-8deg] rounded-full border border-white/15" />

          <div className="relative z-10 flex items-center gap-5">
            {personal.photo ? (
              <img
                src={personal.photo}
                alt="Profile"
                className="h-[27mm] w-[27mm] shrink-0 rounded-[14px] border-4 object-cover shadow-xl"
                style={{ borderColor: 'rgba(255,255,255,.30)' }}
              />
            ) : null}

            <div className="min-w-0 flex-1">
              <h1 className="break-words text-[28px] font-black uppercase leading-[0.95] tracking-[-0.04em]">
                {personal.name || 'Your Name'}
              </h1>

              {personal.title ? (
                <div className="mt-2 text-[9.5px] font-black uppercase tracking-[0.13em] text-white/90">
                  {personal.title}
                </div>
              ) : null}

              {(personal.email ||
                personal.phone ||
                personal.location ||
                personal.linkedin) ? (
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[6.6px] font-bold uppercase tracking-[0.06em] text-white/80">
                  {personal.email ? (
                    <span className="flex items-center gap-1.5 break-all">
                      <Mail size={9} />
                      {personal.email}
                    </span>
                  ) : null}

                  {personal.phone ? (
                    <span className="flex items-center gap-1.5">
                      <Phone size={9} />
                      {personal.phone}
                    </span>
                  ) : null}

                  {personal.location ? (
                    <span className="flex items-center gap-1.5 break-words">
                      <MapPin size={9} />
                      {personal.location}
                    </span>
                  ) : null}

                  {personal.linkedin ? (
                    <span className="flex items-center gap-1.5 break-all">
                      <Linkedin size={9} />
                      {personal.linkedin}
                    </span>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
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
                style={{ color: PURPLE }}
              >
                {personal.title}
              </div>
            ) : null}
          </div>

          <div
            className="rounded-full px-3 py-1 text-[6.5px] font-black uppercase tracking-[0.08em] text-white"
            style={{
              background: `linear-gradient(90deg, ${PURPLE}, ${CYAN})`,
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
          className="h-[8px] w-[24px] rounded-full"
          style={{
            background: `linear-gradient(90deg, ${PURPLE}, ${CYAN})`,
          }}
        />

        <h2
          className="text-[9.5px] font-black uppercase tracking-[0.11em]"
          style={{ color: PURPLE_DARK }}
        >
          {title}
        </h2>

        <div className="h-px flex-1" style={{ backgroundColor: BORDER }} />
      </div>
    </div>
  );

  const SideSectionTitle = ({ title }) => (
    <div className="mb-3">
      <div
        className="border-b-[3px] pb-1.5 text-[7.8px] font-black uppercase tracking-[0.09em]"
        style={{
          borderColor: PURPLE_DEEP,
          color: PURPLE_DARK,
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
            className="rounded-[14px] border px-4 py-3"
            style={{
              borderColor: '#c7d2fe',
              background:
                'linear-gradient(135deg, rgba(99,102,241,.045), rgba(6,182,212,.04))',
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
            style={{ borderColor: CYAN }}
          >
            <div
              className="absolute -left-[6px] top-[4px] h-[9px] w-[9px] rounded-full"
              style={{
                backgroundColor: WHITE,
                border: `3px solid ${PURPLE}`,
              }}
            />

            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3
                  className="text-[10.8px] font-black uppercase leading-tight tracking-[0.02em]"
                  style={{ color: NAVY }}
                >
                  {item.role}

                  {block.continuation ? (
                    <span
                      className="ml-1 text-[6px] font-normal italic normal-case tracking-normal"
                      style={{ color: MUTED }}
                    >
                      continued
                    </span>
                  ) : null}
                </h3>

                {!block.continuation && item.company ? (
                  <div
                    className="mt-1 text-[7.4px] font-black uppercase tracking-[0.08em]"
                    style={{ color: CYAN_DARK }}
                  >
                    {item.company}
                  </div>
                ) : null}
              </div>

              {!block.continuation && item.date ? (
                <span
                  className="shrink-0 rounded-full px-2.5 py-1 text-[6px] font-black uppercase tracking-[0.07em] text-white"
                  style={{ backgroundColor: PURPLE }}
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
                      className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: CYAN }}
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
                className="rounded-full border-2 px-2.5 py-1.5 text-[6.2px] font-black uppercase tracking-[0.04em]"
                style={{
                  borderColor: '#a5b4fc',
                  color: PURPLE_DARK,
                  backgroundColor: '#f8faff',
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
            className="relative border-l-[3px] pl-3.5"
            style={{ borderColor: CYAN }}
          >
            <div
              className="text-[7.2px] font-black uppercase leading-[1.3] tracking-[0.04em]"
              style={{ color: NAVY }}
            >
              {item.degree || item.school}
            </div>

            {item.degree && item.school ? (
              <div
                className="mt-1 text-[6.2px] font-bold leading-[1.35]"
                style={{ color: TEXT }}
              >
                {item.school}
              </div>
            ) : null}

            {item.date ? (
              <div
                className="mt-1 text-[5.7px] font-semibold uppercase tracking-[0.06em]"
                style={{ color: MUTED }}
              >
                {item.date}
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
            className="rounded-[10px] border px-3 py-2.5"
            style={{
              borderColor: '#c7d2fe',
              background:
                'linear-gradient(135deg, rgba(99,102,241,.045), rgba(6,182,212,.05))',
            }}
          >
            <div
              className="text-[7px] font-black uppercase leading-[1.3] tracking-[0.04em]"
              style={{ color: NAVY }}
            >
              {item.name}
            </div>

            {item.desc ? (
              <div
                className="mt-1.5 whitespace-pre-wrap break-words text-[6.2px] font-medium leading-[1.4]"
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
              className="mt-[1px] text-[7px] font-black"
              style={{ color: block.type === 'award' ? CYAN_DARK : PURPLE }}
            >
              {block.type === 'award' ? '★' : '✓'}
            </span>

            <div>
              <div
                className="text-[6.5px] font-semibold leading-[1.35]"
                style={{ color: NAVY }}
              >
                {item.name}
              </div>

              {(item.issuer || item.date) ? (
                <div className="mt-1 text-[5.7px]" style={{ color: MUTED }}>
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
            className="flex items-center justify-between gap-2 rounded-full border px-2.5 py-1.5"
            style={{
              borderColor: '#a5f3fc',
              backgroundColor: CYAN_SOFT,
            }}
          >
            <span
              className="text-[6.3px] font-bold"
              style={{ color: NAVY }}
            >
              {item.name}
            </span>

            {item.level ? (
              <span
                className="text-[5.6px] font-semibold"
                style={{ color: CYAN_DARK }}
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
    skills: 'Skills',
    education: 'Education',
    projects: 'Projects',
    certifications: 'Certifications',
    awards: 'Highlights',
    languages: 'Languages',
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

        if (
          pageBlocks.length &&
          usedHeight + required > getLimit()
        ) {
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

      {/* Visible A4 pages */}
      <div className="space-y-5 print:space-y-0">
        {Array.from({ length: pageCount }).map((_, pageIndex) => {
          const mainPage =
            visibleMainPages[pageIndex] || { blocks: [] };

          const sidePage =
            visibleSidePages[pageIndex] || { blocks: [] };

          return (
            <section
              key={`startup-page-${pageIndex}`}
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

                <aside>
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
                </aside>
              </div>

              <footer
                className="absolute bottom-[4mm] left-[11mm] right-[11mm] flex items-center justify-between border-t pt-1.5 text-[5.8px] font-black uppercase tracking-[0.1em]"
                style={{
                  borderColor: BORDER,
                  color: MUTED,
                }}
              >
                <span
                  style={{
                    background: `linear-gradient(90deg, ${PURPLE_DARK}, ${CYAN_DARK})`,
                    WebkitBackgroundClip: 'text',
                    color: 'transparent',
                  }}
                >
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

export default Startup;
