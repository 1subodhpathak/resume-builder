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
  FolderKanban,
  GraduationCap,
  Languages as LanguagesIcon,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  Trophy,
  UserRound,
} from 'lucide-react';

const cleanLines = (text = '') =>
  String(text || '')
    .split(/\r?\n/)
    .map((line) => line.replace(/^[•\-–—]\s*/, '').trim())
    .filter(Boolean);

const ImpactHeader = ({ data }) => {
  const {
    personal = {},
    experience = [],
    education = [],
    skills = {},
    projects = [],
    awards = [],
    certifications = [],
    languages = [],
  } = data || {};

  const {
    core = [],
    technical = [],
    soft = [],
  } = skills;

  const PAGE_WIDTH = '210mm';
  const PAGE_HEIGHT = '297mm';

  const INNER_WIDTH = '188mm';
  const MAIN_WIDTH = '126mm';
  const SIDE_WIDTH = '54mm';
  const GAP = '8mm';
  const CONTENT_HEIGHT = '252mm';
  const FOOTER_RESERVE = '8mm';

  const BLACK = '#111827';
  const BLACK_2 = '#1f2937';
  const INK = '#172033';
  const BODY = '#5f6b7a';
  const MUTED = '#94a3b8';
  const BORDER = '#e3e8ef';
  const SOFT = '#f8fafc';
  const WHITE = '#ffffff';
  const ACCENT = '#ef4444';

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
    for (let i = 0; i < items.length; i += size) {
      chunks.push(items.slice(i, i + size));
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

    education.forEach((item, index) => {
      blocks.push({
        id: `education-${item.id ?? 'na'}-${index}`,
        section: 'education',
        type: 'education',
        item,
        forceBreak: Boolean(item.pageBreak),
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
      {pageNumber === 1 ? (
        <div
          className="relative overflow-hidden rounded-[14px]"
          style={{
            background:
              `linear-gradient(135deg, ${BLACK} 0%, ${BLACK_2} 100%)`,
          }}
        >
          <div
            className="absolute -right-[18mm] -top-[14mm] h-[46mm] w-[46mm] rotate-12"
            style={{ backgroundColor: 'rgba(239,68,68,0.14)' }}
          />

          <div className="relative z-10 grid grid-cols-[1fr_33mm] items-center gap-5 px-6 py-5">
            <div className="min-w-0">
              <div
                className="mb-2 inline-flex items-center gap-2 border-l-[4px] pl-3 text-[7.5px] font-black uppercase tracking-[0.18em]"
                style={{
                  borderColor: ACCENT,
                  color: '#fca5a5',
                }}
              >
                
              </div>

              <h1
                className="break-words text-[30px] font-black uppercase leading-[0.92] tracking-[-0.035em]"
                style={{ color: WHITE }}
              >
                {personal.name || 'Your Name'}
              </h1>

              {personal.title ? (
                <div
                  className="mt-2 text-[10px] font-semibold uppercase tracking-[0.14em]"
                  style={{ color: '#cbd5e1' }}
                >
                  {personal.title}
                </div>
              ) : null}

              <div
                className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[6.8px]"
                style={{ color: '#cbd5e1' }}
              >
                {personal.phone ? (
                  <span className="flex items-center gap-1.5">
                    <Phone size={8} style={{ color: '#fca5a5' }} />
                    {personal.phone}
                  </span>
                ) : null}

                {personal.email ? (
                  <span className="flex items-center gap-1.5 break-all">
                    <Mail size={8} style={{ color: '#fca5a5' }} />
                    {personal.email}
                  </span>
                ) : null}

                {personal.location ? (
                  <span className="flex items-center gap-1.5">
                    <MapPin size={8} style={{ color: '#fca5a5' }} />
                    {personal.location}
                  </span>
                ) : null}

                {personal.linkedin ? (
                  <span className="flex items-center gap-1.5 break-all">
                    <Linkedin size={8} style={{ color: '#fca5a5' }} />
                    {personal.linkedin}
                  </span>
                ) : null}

        {personal.github ? (
                  <span className="flex items-center gap-1.5 break-all">
                    <Github size={8} style={{ color: '#fca5a5' }} />
                    {personal.github}
                  </span>
                ) : null}

        {personal.portfolio ? (
                  <span className="flex items-center gap-1.5 break-all">
                    <Globe size={8} style={{ color: '#fca5a5' }} />
                    {personal.portfolio}
                  </span>
                ) : null}

        {personal.website ? (
                  <span className="flex items-center gap-1.5 break-all">
                    <Globe size={8} style={{ color: '#fca5a5' }} />
                    {personal.website}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="flex justify-end">
              {personal.photo ? (
                <div
                  className="overflow-hidden rounded-[10px] border-[3px]"
                  style={{
                    borderColor: WHITE,
                    boxShadow: `6px 6px 0 ${ACCENT}`,
                  }}
                >
                  <img
                    src={personal.photo}
                    alt="Profile"
                    className="h-[28mm] w-[28mm] object-cover"
                  />
                </div>
              ) : (
                <div
                  className="flex h-[28mm] w-[28mm] items-center justify-center rounded-[10px] border-[3px]"
                  style={{
                    borderColor: WHITE,
                    color: '#94a3b8',
                    backgroundColor: BLACK_2,
                    boxShadow: `6px 6px 0 ${ACCENT}`,
                  }}
                >
                  <UserRound size={26} />
                </div>
              )}
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
              className="text-[12.5px] font-black uppercase tracking-[-0.01em]"
              style={{ color: INK }}
            >
              {personal.name || 'Your Name'}
            </div>
            {personal.title ? (
              <div
                className="mt-0.5 text-[7.8px] uppercase tracking-[0.1em]"
                style={{ color: BODY }}
              >
                {personal.title}
              </div>
            ) : null}
          </div>

          <div
            className="rounded-full px-3 py-1 text-[7px] font-black uppercase tracking-[0.1em]"
            style={{
              backgroundColor: '#fee2e2',
              color: '#b91c1c',
            }}
          >
            Page {pageNumber}
          </div>
        </div>
      )}
    </header>
  );

  const SectionTitle = ({ sectionId, side = false }) => {
    const config = {
      summary: ['Profile', UserRound],
      experience: ['Experience', BriefcaseBusiness],
      skills: ['Expertise', Sparkles],
      education: ['Education', GraduationCap],
      projects: ['Projects', FolderKanban],
      certifications: ['Certifications', Award],
      awards: ['Recognition', Trophy],
      languages: ['Languages', LanguagesIcon],
    };

    const [title, Icon] = config[sectionId];

    return (
      <div className={side ? 'pb-2.5' : 'pb-3'}>
        <div className="flex items-center gap-2.5">
          <div
            className={`${side ? 'h-6 w-6' : 'h-7 w-7'} flex shrink-0 items-center justify-center rounded-[5px]`}
            style={{
              backgroundColor: side ? '#111827' : '#fee2e2',
              color: side ? WHITE : ACCENT,
            }}
          >
            <Icon size={side ? 10 : 12} />
          </div>

          <div
            className={`${side ? 'text-[7.4px]' : 'text-[9.5px]'} font-black uppercase tracking-[0.12em]`}
            style={{ color: side ? BLACK : INK }}
          >
            {title}
          </div>

          <div
            className="h-[2px] flex-1"
            style={{ backgroundColor: side ? '#111827' : BORDER }}
          />
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
            className="border-l-[4px] px-4 py-3.5"
            style={{
              borderColor: ACCENT,
              backgroundColor: SOFT,
            }}
          >
            <p
              className="whitespace-pre-wrap text-[10px] leading-[1.58]"
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
          <div className="relative pl-5">
            <div
              className="absolute bottom-0 left-[3px] top-1 w-px"
              style={{ backgroundColor: BORDER }}
            />

            <div
              className="absolute left-0 top-[3px] h-[7px] w-[7px]"
              style={{
                backgroundColor: ACCENT,
                boxShadow: `0 0 0 3px ${WHITE}`,
              }}
            />

            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div
                  className="text-[11.6px] font-black leading-tight"
                  style={{ color: INK }}
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
                    className="mt-1 text-[8.5px] font-black uppercase tracking-[0.09em]"
                    style={{ color: ACCENT }}
                  >
                    {item.company}
                  </div>
                ) : null}
              </div>

              {!block.continuation && item.date ? (
                <span
                  className="shrink-0 bg-slate-900 px-2.5 py-1 text-[6.7px] font-black uppercase tracking-[0.08em]"
                  style={{ color: WHITE }}
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
                    className="flex items-start gap-2 text-[9.2px] leading-[1.5]"
                    style={{ color: BODY }}
                  >
                    <span
                      className="mt-[5px] h-1.5 w-1.5 shrink-0"
                      style={{
                        backgroundColor:
                          index % 2 === 0 ? ACCENT : BLACK,
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
          <div className="space-y-1.5">
            {block.items.map((skill, index) => (
              <div
                key={`${block.id}-${skill}-${index}`}
                className="flex items-center gap-2 border-l-[3px] px-2 py-1.5 text-[7px] font-bold"
                style={{
                  borderColor:
                    index % 2 === 0 ? ACCENT : BLACK,
                  backgroundColor: '#f8fafc',
                  color: INK,
                }}
              >
                {skill}
              </div>
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
            className="text-[7.8px] font-black leading-[1.28]"
            style={{ color: INK }}
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
              className="mt-1 text-[6.3px] font-bold"
              style={{ color: ACCENT }}
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
            className="border-l-[4px] px-3 py-2.5"
            style={{
              borderColor: BLACK,
              backgroundColor: SOFT,
            }}
          >
            <div
              className="text-[7.5px] font-black"
              style={{ color: INK }}
            >
              {item.name}
            </div>

            {item.desc ? (
              <div
                className="mt-1.5 text-[6.6px] leading-[1.4]"
                style={{ color: BODY }}
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
          <div
            className="text-[7.2px] font-black leading-[1.28]"
            style={{ color: INK }}
          >
            {item.name}
          </div>

          {(item.issuer || item.date) ? (
            <div
              className="mt-1 text-[6.3px]"
              style={{ color: MUTED }}
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
                  className="flex items-center justify-between gap-2 border-b pb-1.5 text-[6.8px]"
                  style={{ borderColor: BORDER }}
                >
                  <span style={{ color: INK }}>{name}</span>
                  {level ? (
                    <span style={{ color: ACCENT }}>{level}</span>
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

        let required = sectionHeight + blockHeight;

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

      [firstHeaderRef.current, continuationHeaderRef.current].forEach((node) => {
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
    'education',
    'projects',
    'certifications',
    'awards',
    'languages',
  ];

  return (
    <div
      className="resume-preview-wrapper relative mx-auto w-full max-w-[210mm]"
      style={{
        backgroundColor: '#e5e7eb',
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
            gridTemplateColumns: `${MAIN_WIDTH} ${SIDE_WIDTH}`,
            columnGap: GAP,
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

          <div style={{ width: SIDE_WIDTH }}>
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

      {/* Visible pages */}
      <div className="space-y-5 print:space-y-0">
        {Array.from({ length: pageCount }).map((_, pageIndex) => {
          const mainPage =
            visibleMainPages[pageIndex] || { blocks: [] };

          const sidePage =
            visibleSidePages[pageIndex] || { blocks: [] };

          return (
            <section
              key={`impact-page-${pageIndex}`}
              className="relative mx-auto h-[297mm] w-[210mm] overflow-hidden bg-white shadow-[0_20px_58px_rgba(0,0,0,0.16)] print:shadow-none"
              style={{
                width: PAGE_WIDTH,
                height: PAGE_HEIGHT,
                padding: '9mm 11mm 14mm',
                boxSizing: 'border-box',
                backgroundColor: WHITE,
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
                  gridTemplateColumns: `${MAIN_WIDTH} ${SIDE_WIDTH}`,
                  columnGap: GAP,
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
                  className="border-l pl-[5mm]"
                  style={{ borderColor: BORDER }}
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
                className="absolute bottom-[5mm] left-[11mm] right-[11mm] flex items-center justify-between border-t pt-1.5 text-[6.1px] font-black uppercase tracking-[0.1em]"
                style={{
                  borderColor: BORDER,
                  color: MUTED,
                }}
              >
                <span style={{ color: ACCENT }}>
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

export default ImpactHeader;
