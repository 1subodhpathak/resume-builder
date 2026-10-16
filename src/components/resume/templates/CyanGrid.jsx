import { mergeExperienceFragmentsOnPage } from '../templateSurfaceUtils';
import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Globe,
  Github,
  Award,
  BriefcaseBusiness,
  CircuitBoard,
  Database,
  FolderKanban,
  GraduationCap,
  Languages as LanguagesIcon,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  ServerCog,
  Sparkles,
  UserRound,
} from 'lucide-react';

const cleanLines = (text = '') =>
  String(text || '')
    .split(/\r?\n/)
    .map((line) => line.replace(/^[•\-–—]\s*/, '').trim())
    .filter(Boolean);

const CyanGrid = ({ data }) => {
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

  const PAGE_WIDTH = '210mm';
  const PAGE_HEIGHT = '297mm';

  const INNER_WIDTH = '184mm';
  const MAIN_WIDTH = '118mm';
  const SIDE_WIDTH = '58mm';
  const COLUMN_GAP = '8mm';

  const CONTENT_HEIGHT = '250mm';
  const FOOTER_RESERVE = '9mm';

  const BG = '#07111a';
  const PANEL = '#0d1a25';
  const PANEL_2 = '#102332';
  const BORDER = '#1d3b4c';

  const CYAN = '#22d3ee';
  const CYAN_SOFT = '#67e8f9';
  const BLUE = '#38bdf8';
  const GREEN = '#34d399';
  const PURPLE = '#a78bfa';
  const AMBER = '#fbbf24';
  const RED = '#fb7185';

  const TEXT = '#e6f6fb';
  const BODY = '#a9c0cb';
  const MUTED = '#6e8996';
  const GRID_LINE = 'rgba(34,211,238,0.055)';

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

  const chunkArray = useCallback((items = [], size = 4) => {
    const chunks = [];

    for (let index = 0; index < items.length; index += size) {
      chunks.push(items.slice(index, index + size));
    }

    return chunks.length ? chunks : [[]];
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
      const chunks = chunkArray(cleanLines(item.desc), 4);

      chunks.forEach((lines, chunkIndex) => {
        blocks.push({
          id: `experience-${item.id ?? 'na'}-${index}-${chunkIndex}`,
          section: 'experience',
          type: 'experience',
          item,
          lines,
          continuation: chunkIndex > 0,
          forceBreak: Boolean(item.pageBreak && chunkIndex === 0),
        });
      });
    });

    return blocks;
  }, [chunkArray, experience, personal.summary]);

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

    projects.forEach((item, index) => {
      blocks.push({
        id: `project-${item.id ?? 'na'}-${index}`,
        section: 'projects',
        type: 'project',
        item,
        forceBreak: Boolean(item.pageBreak),
      });
    });

    education.forEach((item, index) => {
      blocks.push({
        id: `education-${item.id ?? 'na'}-${index}`,
        section: 'education',
        type: 'education',
        item,
        forceBreak: Boolean(item.pageBreak),
      });
    });

    certifications.forEach((item, index) => {
      blocks.push({
        id: `certification-${item.id ?? 'na'}-${index}`,
        section: 'certifications',
        type: 'certification',
        item,
      });
    });

    awards.forEach((item, index) => {
      blocks.push({
        id: `award-${item.id ?? 'na'}-${index}`,
        section: 'awards',
        type: 'award',
        item,
      });
    });

    if (languages.length) {
      blocks.push({
        id: 'languages',
        section: 'languages',
        type: 'languages',
        items: languages,
      });
    }

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

  const Header = ({
    measureRef = null,
    pageNumber = 1,
  }) => (
    <header ref={measureRef} className="mb-5">
      <div
        className="relative overflow-hidden rounded-[10px] border"
        style={{
          background:
            `linear-gradient(135deg, ${PANEL} 0%, ${PANEL_2} 100%)`,
          borderColor: BORDER,
          boxShadow: '0 14px 34px rgba(0,0,0,0.20)',
        }}
      >
        <div
          className="absolute inset-y-0 left-0 w-[4px]"
          style={{
            background:
              `linear-gradient(180deg, ${CYAN} 0%, ${BLUE} 100%)`,
          }}
        />

        <div className="grid grid-cols-[1fr_34mm] gap-5 px-5 py-4 items-center">
          <div className="min-w-0">
            <div
              className="mb-2 flex items-center gap-2 text-[7px] font-black uppercase tracking-[0.18em]"
              style={{ color: CYAN }}
            >
              <CircuitBoard size={10} />
              Digital Profile / Node {String(pageNumber).padStart(2, '0')}
            </div>

            <h1
              className="break-words text-[28px] font-black uppercase leading-none tracking-[0.03em]"
              style={{ color: TEXT }}
            >
              {personal.name || 'Your Name'}
            </h1>

            {personal.title ? (
              <div
                className="mt-2 text-[9.5px] font-semibold uppercase tracking-[0.14em]"
                style={{ color: CYAN_SOFT }}
              >
                {personal.title}
              </div>
            ) : null}

            <div
              className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[7px]"
              style={{ color: BODY }}
            >
              {personal.email ? (
                <span className="flex items-center gap-1.5 break-all">
                  <Mail size={9} style={{ color: CYAN }} />
                  {personal.email}
                </span>
              ) : null}

              {personal.phone ? (
                <span className="flex items-center gap-1.5">
                  <Phone size={9} style={{ color: GREEN }} />
                  {personal.phone}
                </span>
              ) : null}

              {personal.location ? (
                <span className="flex items-center gap-1.5">
                  <MapPin size={9} style={{ color: PURPLE }} />
                  {personal.location}
                </span>
              ) : null}

              {personal.linkedin ? (
                <span className="flex items-center gap-1.5 break-all">
                  <Linkedin size={9} style={{ color: BLUE }} />
                  {personal.linkedin}
                </span>
              ) : null}

        {personal.github ? (
                <span className="flex items-center gap-1.5 break-all">
                  <Github size={9} style={{ color: BLUE }} />
                  {personal.github}
                </span>
              ) : null}

        {personal.portfolio ? (
                <span className="flex items-center gap-1.5 break-all">
                  <Globe size={9} style={{ color: BLUE }} />
                  {personal.portfolio}
                </span>
              ) : null}

        {personal.website ? (
                <span className="flex items-center gap-1.5 break-all">
                  <Globe size={9} style={{ color: BLUE }} />
                  {personal.website}
                </span>
              ) : null}
            </div>
          </div>

          <div
            className="ml-auto overflow-hidden rounded-[9px] border p-1"
            style={{
              borderColor: BORDER,
              backgroundColor: BG,
            }}
          >
            {personal.photo ? (
              <img
                src={personal.photo}
                alt="Profile"
                className="h-[29mm] w-full rounded-[6px] object-cover grayscale-[15%]"
              />
            ) : (
              <div
                className="flex h-[29mm] w-full items-center justify-center rounded-[6px]"
                style={{
                  backgroundColor: PANEL_2,
                  color: MUTED,
                }}
              >
                <UserRound size={28} />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );

  const SectionTitle = ({ sectionId, side = false }) => {
    const config = {
      summary: ['About', UserRound, CYAN],
      experience: ['Work History', BriefcaseBusiness, BLUE],
      skills: ['Skills', Sparkles, CYAN],
      projects: ['Projects', FolderKanban, GREEN],
      education: ['Education', GraduationCap, PURPLE],
      certifications: ['Certifications', Award, AMBER],
      awards: ['Recognition', Award, RED],
      languages: ['Languages', LanguagesIcon, BLUE],
    };

    const [title, Icon, color] = config[sectionId];

    return (
      <div className={side ? 'pb-2.5' : 'pb-3'}>
        <div className="flex items-center gap-2">
          <div
            className={`${side ? 'h-6 w-6' : 'h-7 w-7'} flex shrink-0 items-center justify-center rounded-[5px] border`}
            style={{
              borderColor: BORDER,
              backgroundColor: PANEL_2,
              color,
            }}
          >
            <Icon size={side ? 10 : 12} />
          </div>

          <div
            className={`${side ? 'text-[7.5px]' : 'text-[9px]'} font-black uppercase tracking-[0.14em]`}
            style={{ color }}
          >
            {title}
          </div>

          <div className="h-px flex-1" style={{ backgroundColor: BORDER }} />
        </div>
      </div>
    );
  };

  const renderMainBlock = (block) => {
    if (!block) return null;

    if (block.type === 'summary') {
      return (
        <div className="pb-4">
          <div
            className="rounded-[8px] border px-4 py-3.5"
            style={{
              backgroundColor: PANEL,
              borderColor: BORDER,
            }}
          >
            <p
              className="whitespace-pre-wrap text-[9.9px] leading-[1.58]"
              style={{ color: BODY }}
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
            className="relative rounded-[8px] border px-4 py-3.5"
            style={{
              backgroundColor: PANEL,
              borderColor: BORDER,
            }}
          >
            <div
              className="absolute left-0 top-0 h-full w-[3px] rounded-l-[8px]"
              style={{
                background:
                  `linear-gradient(180deg, ${CYAN} 0%, ${BLUE} 100%)`,
              }}
            />

            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div
                  className="text-[11.2px] font-black leading-tight"
                  style={{ color: TEXT }}
                >
                  {item.role}

                  {block.continuation ? (
                    <span
                      className="ml-1 text-[7px] font-normal italic"
                      style={{ color: MUTED }}
                    >
                      continued
                    </span>
                  ) : null}
                </div>

                {!block.continuation && item.company ? (
                  <div
                    className="mt-1 text-[8.4px] font-bold uppercase tracking-[0.1em]"
                    style={{ color: CYAN }}
                  >
                    {item.company}
                  </div>
                ) : null}
              </div>

              {!block.continuation && item.date ? (
                <span
                  className="shrink-0 rounded-full px-2.5 py-1 text-[6.8px] font-bold"
                  style={{
                    color: CYAN_SOFT,
                    backgroundColor: '#0a1720',
                    border: `1px solid ${BORDER}`,
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
                    className="flex items-start gap-2 text-[9px] leading-[1.48]"
                    style={{ color: BODY }}
                  >
                    <span
                      className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{
                        backgroundColor:
                          index % 2 === 0 ? CYAN : GREEN,
                      }}
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

  const renderSideBlock = (block) => {
    if (!block) return null;

    if (block.type === 'skills') {
      return (
        <div className="pb-3.5">
          <div className="flex flex-wrap gap-1.5">
            {block.items.map((skill, index) => (
              <span
                key={`${block.id}-${skill}-${index}`}
                className="rounded-[5px] px-2 py-1 text-[6.8px] font-semibold"
                style={{
                  color: CYAN_SOFT,
                  backgroundColor: '#0a1720',
                  border: `1px solid ${BORDER}`,
                }}
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
            className="rounded-[7px] border px-3 py-2.5"
            style={{
              borderColor: BORDER,
              backgroundColor: PANEL_2,
            }}
          >
            <div
              className="text-[7.8px] font-bold"
              style={{ color: GREEN }}
            >
              {item.name}
            </div>

            {item.desc ? (
              <div
                className="mt-1.5 text-[6.8px] leading-[1.4]"
                style={{ color: BODY }}
              >
                {item.desc}
              </div>
            ) : null}
          </div>
        </article>
      );
    }

    if (block.type === 'education') {
      const item = block.item;

      return (
        <article className="pb-3">
          <div
            className="text-[7.8px] font-bold leading-[1.3]"
            style={{ color: TEXT }}
          >
            {item.school || item.degree}
          </div>

          {item.school && item.degree ? (
            <div
              className="mt-1 text-[6.8px] leading-[1.35]"
              style={{ color: BODY }}
            >
              {item.degree}
            </div>
          ) : null}

          {item.date ? (
            <div
              className="mt-1 text-[6.4px]"
              style={{ color: PURPLE }}
            >
              {item.date}
            </div>
          ) : null}
        </article>
      );
    }

    if (block.type === 'certification' || block.type === 'award') {
      const item = block.item;
      const color =
        block.type === 'certification'
          ? AMBER
          : RED;

      return (
        <article className="pb-2.5">
          <div
            className="text-[7.4px] font-bold leading-[1.3]"
            style={{ color: TEXT }}
          >
            {item.name}
          </div>

          {(item.issuer || item.date) ? (
            <div
              className="mt-1 text-[6.5px]"
              style={{ color }}
            >
              {[item.issuer, item.date]
                .filter(Boolean)
                .join(' • ')}
            </div>
          ) : null}
        </article>
      );
    }

    if (block.type === 'languages') {
      return (
        <div className="pb-3.5">
          <div className="space-y-1.5">
            {block.items.map((item, index) => {
              const name =
                typeof item === 'string'
                  ? item
                  : item?.name || 'Language';

              const level =
                typeof item === 'string'
                  ? ''
                  : item?.level || '';

              return (
                <div
                  key={item?.id || `${name}-${index}`}
                  className="flex items-center justify-between gap-2 text-[6.9px]"
                >
                  <span style={{ color: TEXT }}>{name}</span>
                  {level ? (
                    <span style={{ color: BLUE }}>{level}</span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return null;
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
          block.section && activeSection !== block.section
            ? sectionRefs.current[block.section]?.getBoundingClientRect().height || 0
            : 0;

        let required =
          sectionHeight + blockHeight;

        if (
          pageBlocks.length &&
          usedHeight + required > getLimit()
        ) {
          commitPage();

          required =
            (
              block.section
                ? sectionRefs.current[block.section]?.getBoundingClientRect().height || 0
                : 0
            ) + blockHeight;
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
      Object.values(mainMeasureRefs.current).forEach((node) => {
        if (node) observer.observe(node);
      });

      Object.values(sideMeasureRefs.current).forEach((node) => {
        if (node) observer.observe(node);
      });

      [
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

  const mainSectionOrder = ['summary', 'experience'];

  const sideSectionOrder = [
    'skills',
    'projects',
    'education',
    'certifications',
    'awards',
    'languages',
  ];

  return (
    <div
      className="resume-preview-wrapper relative mx-auto w-full max-w-[210mm]"
      style={{
        backgroundColor: '#cbd5e1',
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      {/* Hidden measurement */}
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
          <Header measureRef={firstHeaderRef} pageNumber={1} />
          <Header measureRef={continuationHeaderRef} pageNumber={2} />
        </div>

        <div
          className="grid"
          style={{
            width: INNER_WIDTH,
            gridTemplateColumns:
              `${MAIN_WIDTH} ${SIDE_WIDTH}`,
            columnGap: COLUMN_GAP,
            alignItems: 'start',
          }}
        >
          <div style={{ width: MAIN_WIDTH }}>
            {mainSectionOrder.map((sectionId) => (
              <div
                key={`measure-main-title-${sectionId}`}
                ref={(node) => {
                  mainSectionRefs.current[sectionId] = node;
                }}
              >
                <SectionTitle sectionId={sectionId} />
              </div>
            ))}

            {mainBlocks.map((block) => (
              <div
                key={`measure-main-${block.id}`}
                ref={(node) => {
                  mainMeasureRefs.current[block.id] = node;
                }}
              >
                {renderMainBlock(block)}
              </div>
            ))}
          </div>

          <div
            style={{
              width: SIDE_WIDTH,
              boxSizing: 'border-box',
              paddingLeft: '4mm',
              borderLeft: `1px solid ${BORDER}`,
            }}
          >
            {sideSectionOrder.map((sectionId) => (
              <div
                key={`measure-side-title-${sectionId}`}
                ref={(node) => {
                  sideSectionRefs.current[sectionId] = node;
                }}
              >
                <SectionTitle sectionId={sectionId} side />
              </div>
            ))}

            {sideBlocks.map((block) => (
              <div
                key={`measure-side-${block.id}`}
                ref={(node) => {
                  sideMeasureRefs.current[block.id] = node;
                }}
              >
                {renderSideBlock(block)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actual pages */}
      <div className="space-y-5 print:space-y-0">
        {Array.from({ length: pageCount }).map((_, pageIndex) => {
          const mainPage =
            visibleMainPages[pageIndex] || { blocks: [] };

          const sidePage =
            visibleSidePages[pageIndex] || { blocks: [] };

          return (
            <section
              key={`cyan-grid-page-${pageIndex}`}
              className="relative mx-auto h-[297mm] w-[210mm] overflow-hidden shadow-[0_20px_58px_rgba(0,0,0,0.28)] print:shadow-none"
              style={{
                width: PAGE_WIDTH,
                height: PAGE_HEIGHT,
                padding: '11mm 13mm 15mm',
                boxSizing: 'border-box',
                backgroundColor: BG,
                color: TEXT,
                backgroundImage: `
                  linear-gradient(${GRID_LINE} 1px, transparent 1px),
                  linear-gradient(90deg, ${GRID_LINE} 1px, transparent 1px)
                `,
                backgroundSize: '18px 18px',
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
              <Header pageNumber={pageIndex + 1} />

              <div
                className="grid"
                style={{
                  width: INNER_WIDTH,
                  gridTemplateColumns:
                    `${MAIN_WIDTH} ${SIDE_WIDTH}`,
                  columnGap: COLUMN_GAP,
                  alignItems: 'start',
                }}
              >
                <main>
                  {mainPage.blocks.map((block, blockIndex) => {
                    const previous =
                      mainPage.blocks[blockIndex - 1];

                    const showTitle =
                      block.section &&
                      (
                        blockIndex === 0 ||
                        previous?.section !== block.section
                      );

                    return (
                      <React.Fragment
                        key={`${pageIndex}-main-${block.id}`}
                      >
                        {showTitle ? (
                          <SectionTitle sectionId={block.section} />
                        ) : null}

                        <div
                          style={{
                            breakInside: 'avoid',
                            pageBreakInside: 'avoid',
                          }}
                        >
                          {renderMainBlock(block)}
                        </div>
                      </React.Fragment>
                    );
                  })}
                </main>

                <aside
                  style={{
                    width: SIDE_WIDTH,
                    boxSizing: 'border-box',
                    paddingLeft: '4mm',
                    borderLeft: `1px solid ${BORDER}`,
                  }}
                >
                  {sidePage.blocks.map((block, blockIndex) => {
                    const previous =
                      sidePage.blocks[blockIndex - 1];

                    const showTitle =
                      block.section &&
                      (
                        blockIndex === 0 ||
                        previous?.section !== block.section
                      );

                    return (
                      <React.Fragment
                        key={`${pageIndex}-side-${block.id}`}
                      >
                        {showTitle ? (
                          <SectionTitle
                            sectionId={block.section}
                            side
                          />
                        ) : null}

                        <div
                          style={{
                            breakInside: 'avoid',
                            pageBreakInside: 'avoid',
                          }}
                        >
                          {renderSideBlock(block)}
                        </div>
                      </React.Fragment>
                    );
                  })}
                </aside>
              </div>

              <footer
                className="absolute bottom-[5mm] left-[13mm] right-[13mm] flex items-center justify-between border-t pt-1.5 text-[6.2px] font-bold uppercase tracking-[0.11em]"
                style={{
                  borderColor: BORDER,
                  color: MUTED,
                }}
              >
                <span className="flex items-center gap-2">
                  <Database size={8} style={{ color: CYAN }} />
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

export default CyanGrid;
