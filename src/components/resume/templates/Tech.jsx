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

const Tech = ({ data }) => {
  const {
    personal = {},
    experience = [],
    education = [],
    skills = {},
    projects = [],
    certifications = [],
    awards = [],
    languages = [],
  } = data || {};

  const {
    core = [],
    technical = [],
    soft = [],
  } = skills;

  const BG = '#1e1e1e';
  const PANEL = '#252526';
  const PANEL_2 = '#2d2d30';
  const GREEN = '#4ade80';
  const GREEN_DARK = '#22c55e';
  const CYAN = '#67e8f9';
  const BLUE = '#60a5fa';
  const YELLOW = '#facc15';
  const PURPLE = '#c084fc';
  const RED = '#f87171';
  const WHITE = '#f8fafc';
  const TEXT = '#cbd5e1';
  const MUTED = '#64748b';
  const BORDER = '#334155';

  const PAGE_WIDTH = '210mm';
  const PAGE_HEIGHT = '297mm';
  const INNER_WIDTH = '188mm';
  const MAIN_WIDTH = '121mm';
  const SIDE_WIDTH = '59mm';
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
    <div ref={measureRef} className={compact ? 'mb-[5mm]' : 'mb-[6mm]'}>
      {!compact ? (
        <div>
          <div
            className="flex items-center justify-between border-b pb-3"
            style={{ borderColor: '#16a34a55' }}
          >
            <div className="min-w-0">
              <div
                className="text-[6.5px] font-bold uppercase tracking-[0.16em]"
                style={{ color: MUTED }}
              >
                resume.tsx
              </div>

              <h1
                className="mt-1 break-words text-[24px] font-black leading-[1] tracking-[-0.04em]"
                style={{ color: GREEN }}
              >
                {`> ${personal.name || 'USER'}`}
              </h1>

              {personal.title ? (
                <div
                  className="mt-2 text-[8.5px] font-bold"
                  style={{ color: TEXT }}
                >
                  <span style={{ color: PURPLE }}>const</span>{' '}
                  role ={' '}
                  <span style={{ color: YELLOW }}>
                    "{personal.title}"
                  </span>
                  ;
                </div>
              ) : null}
            </div>

            {personal.photo ? (
              <img
                src={personal.photo}
                alt="Profile"
                className="h-[22mm] w-[22mm] shrink-0 rounded border object-cover"
                style={{
                  borderColor: '#22c55e88',
                  boxShadow: '0 0 0 2px rgba(34,197,94,.06)',
                }}
              />
            ) : null}
          </div>

          {(personal.email ||
            personal.phone ||
            personal.location ||
            personal.linkedin) ? (
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[6.7px] font-medium">
              {personal.email ? (
                <span className="break-all" style={{ color: CYAN }}>
                  email: <span style={{ color: TEXT }}>"{personal.email}"</span>
                </span>
              ) : null}

              {personal.phone ? (
                <span style={{ color: CYAN }}>
                  phone: <span style={{ color: TEXT }}>"{personal.phone}"</span>
                </span>
              ) : null}

              {personal.location ? (
                <span className="break-words" style={{ color: CYAN }}>
                  location: <span style={{ color: TEXT }}>"{personal.location}"</span>
                </span>
              ) : null}

              {personal.linkedin ? (
                <span className="break-all" style={{ color: CYAN }}>
                  git/in: <span style={{ color: TEXT }}>"{personal.linkedin}"</span>
                </span>
              ) : null}

              {personal.github ? (
                <span className="break-all" style={{ color: CYAN }}>
                  github: <span style={{ color: TEXT }}>"{personal.github}"</span>
                </span>
              ) : null}

              {personal.portfolio ? (
                <span className="break-all" style={{ color: CYAN }}>
                  portfolio: <span style={{ color: TEXT }}>"{personal.portfolio}"</span>
                </span>
              ) : null}

              {personal.website ? (
                <span className="break-all" style={{ color: CYAN }}>
                  website: <span style={{ color: TEXT }}>"{personal.website}"</span>
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : (
        <div
          className="flex items-end justify-between border-b pb-3"
          style={{ borderColor: '#334155' }}
        >
          <div>
            <div
              className="text-[10px] font-black"
              style={{ color: GREEN }}
            >
              {`> ${personal.name || 'USER'}`}
            </div>

            {personal.title ? (
              <div
                className="mt-1 text-[6.3px]"
                style={{ color: MUTED }}
              >
                {personal.title}
              </div>
            ) : null}
          </div>

          <div
            className="rounded border px-2.5 py-1 text-[6px] font-bold"
            style={{
              borderColor: '#22c55e55',
              color: GREEN,
              backgroundColor: '#052e1618',
            }}
          >
            page:{pageNumber}
          </div>
        </div>
      )}
    </div>
  );

  const MainSectionTitle = ({ title }) => (
    <div className="mb-3.5 flex items-center gap-2.5">
      <div
        className="text-[7.5px] font-black uppercase tracking-[0.1em]"
        style={{ color: GREEN_DARK }}
      >
        {`// ${title}`}
      </div>
      <div className="h-px flex-1" style={{ backgroundColor: '#334155' }} />
    </div>
  );

  const SideSectionTitle = ({ title }) => (
    <div className="mb-3">
      <div
        className="border-b pb-1.5 text-[7.2px] font-black uppercase tracking-[0.08em]"
        style={{
          borderColor: '#334155',
          color: GREEN_DARK,
        }}
      >
        {`// ${title}`}
      </div>
    </div>
  );

  const MainBlock = ({ block }) => {
    if (block.type === 'summary') {
      return (
        <div className="pb-4">
          <div
            className="rounded border px-4 py-3"
            style={{
              borderColor: '#334155',
              backgroundColor: PANEL,
            }}
          >
            <div
              className="mb-2 text-[6.5px]"
              style={{ color: MUTED }}
            >
              <span style={{ color: BLUE }}>/**</span>
            </div>

            <p
              className="whitespace-pre-wrap text-[9px] font-medium leading-[1.5]"
              style={{ color: TEXT }}
            >
              {block.text}
            </p>

            <div
              className="mt-2 text-[6.5px]"
              style={{ color: MUTED }}
            >
              <span style={{ color: BLUE }}>*/</span>
            </div>
          </div>
        </div>
      );
    }

    if (block.type === 'experience') {
      const item = block.item;

      return (
        <article className="pb-4">
          <div
            className="relative border-l pl-5"
            style={{ borderColor: '#475569' }}
          >
            <span
              className="absolute -left-[5px] top-[4px] h-[8px] w-[8px] rounded-full border"
              style={{
                backgroundColor: BG,
                borderColor: GREEN,
              }}
            />

            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3
                  className="text-[10.5px] font-black leading-tight"
                  style={{ color: WHITE }}
                >
                  {item.role}

                  {block.continuation ? (
                    <span
                      className="ml-1 text-[5.8px] font-normal italic"
                      style={{ color: MUTED }}
                    >
                      continued
                    </span>
                  ) : null}
                </h3>

                {!block.continuation && item.company ? (
                  <div
                    className="mt-1 text-[7px]"
                    style={{ color: GREEN }}
                  >
                    @ {item.company}
                  </div>
                ) : null}
              </div>

              {!block.continuation && item.date ? (
                <div
                  className="shrink-0 text-[6px]"
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
                    className="flex items-start gap-2 text-[8.7px] font-medium leading-[1.48]"
                    style={{ color: TEXT }}
                  >
                    <span style={{ color: GREEN_DARK }}>›</span>
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
        <article className="pb-3.5">
          <div
            className="border px-3.5 py-3"
            style={{
              borderColor: '#334155',
              backgroundColor: PANEL,
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div
                className="text-[8px] font-black"
                style={{ color: WHITE }}
              >
                {item.name}

                {block.continuation ? (
                  <span
                    className="ml-1 text-[5.7px] font-normal italic"
                    style={{ color: MUTED }}
                  >
                    continued
                  </span>
                ) : null}
              </div>

              {!block.continuation ? (
                <span
                  className="shrink-0 text-[5.8px]"
                  style={{ color: PURPLE }}
                >
                  module
                </span>
              ) : null}
            </div>

            {block.lines.length ? (
              <div className="mt-2 space-y-1.5">
                {block.lines.map((line, index) => (
                  <div
                    key={`${block.id}-${index}`}
                    className="flex items-start gap-2 text-[7.8px] font-medium leading-[1.45]"
                    style={{ color: TEXT }}
                  >
                    <span style={{ color: BLUE }}>→</span>
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
                className="border px-2 py-1.5 text-[6.5px] font-bold"
                style={{
                  borderColor: '#22c55e44',
                  backgroundColor: '#052e1628',
                  color: GREEN,
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
            style={{ color: WHITE }}
          >
            {item.school || item.degree}
          </div>

          {item.school && item.degree ? (
            <div
              className="mt-1 text-[6.6px] font-medium leading-[1.35]"
              style={{ color: TEXT }}
            >
              {item.degree}
            </div>
          ) : null}

          {item.date ? (
            <div
              className="mt-1 text-[6px]"
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
            className="border px-3 py-2.5"
            style={{
              borderColor: '#334155',
              backgroundColor: PANEL,
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <div
                className="break-words text-[7.2px] font-black leading-[1.3]"
                style={{ color: WHITE }}
              >
                {item.name}
                {block.continuation ? (
                  <span className="ml-1 text-[5.5px] font-normal italic" style={{ color: MUTED }}>
                    continued
                  </span>
                ) : null}
              </div>

              {!block.continuation ? (
                <span className="shrink-0 text-[5.5px]" style={{ color: PURPLE }}>
                  module
                </span>
              ) : null}
            </div>

            {block.lines.length ? (
              <div className="mt-2 space-y-1.5">
                {block.lines.map((line, index) => (
                  <div
                    key={`${block.id}-${index}`}
                    className="flex items-start gap-1.5 text-[6.6px] font-medium leading-[1.42]"
                    style={{ color: TEXT }}
                  >
                    <span style={{ color: BLUE }}>→</span>
                    <span className="min-w-0 break-words">{line}</span>
                  </div>
                ))}
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
              className="mt-[1px] text-[6.8px] font-black"
              style={{
                color:
                  block.type === 'award'
                    ? YELLOW
                    : BLUE,
              }}
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
                  className="mt-1 text-[5.8px]"
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
          <div
            className="text-[6.7px] leading-[1.45]"
            style={{ color: TEXT }}
          >
            <span style={{ color: GREEN_DARK }}>const</span>{' '}
            <span style={{ color: CYAN }}>{item.name}</span>
            {' = '}
            <span style={{ color: YELLOW }}>
              "{item.level || ''}"
            </span>
            ;
          </div>
        </article>
      );
    }

    return null;
  };

  const mainSections = {
    summary: 'profile',
    experience: 'experience',
  };

  const sideSections = {
    skills: 'stack',
    education: 'education',
    projects: 'projects',
    certifications: 'certifications',
    awards: 'highlights',
    languages: 'langs',
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
      className="resume-preview-wrapper relative mx-auto w-full max-w-[210mm] bg-slate-900"
      style={{
        fontFamily:
          '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
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
              key={`tech-page-${pageIndex}`}
              className="relative mx-auto h-[297mm] w-[210mm] overflow-hidden shadow-2xl print:shadow-none"
              style={{
                width: PAGE_WIDTH,
                height: PAGE_HEIGHT,
                padding: '8mm 11mm 13mm',
                boxSizing: 'border-box',
                backgroundColor: BG,
                backgroundImage: `
                  linear-gradient(rgba(255,255,255,.018) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,.018) 1px, transparent 1px)
                `,
                backgroundSize: '24px 24px',
                breakAfter:
                  pageIndex < pageCount - 1 ? 'page' : 'auto',
                pageBreakAfter:
                  pageIndex < pageCount - 1 ? 'always' : 'auto',
              }}
            >
              {/* editor chrome */}
              <div
                className="pointer-events-none absolute left-0 right-0 top-0 h-[5mm] border-b"
                style={{
                  backgroundColor: '#181818',
                  borderColor: '#2d2d30',
                }}
              >
                <div className="absolute left-[5mm] top-1/2 flex -translate-y-1/2 gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: RED }} />
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: YELLOW }} />
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: GREEN_DARK }} />
                </div>
              </div>

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
                className="absolute bottom-[4mm] left-[11mm] right-[11mm] flex items-center justify-between border-t pt-1.5 text-[5.8px]"
                style={{
                  borderColor: '#334155',
                  color: MUTED,
                }}
              >
                <span style={{ color: GREEN_DARK }}>
                  Confidential
                </span>

                <span>
                  page {pageIndex + 1}/{pageCount}
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
            background: ${BG} !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .resume-preview-wrapper {
            background: ${BG} !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Tech;
