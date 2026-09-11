import { mergeExperienceFragmentsOnPage } from '../templateSurfaceUtils';
import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Award,
  BarChart3,
  BriefcaseBusiness,
  Code2,
  FolderKanban,
  GraduationCap,
  Languages as LanguagesIcon,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  Target,
  Trophy,
  UserRound,
} from 'lucide-react';

const cleanLines = (text = '') =>
  String(text || '')
    .split(/\r?\n/)
    .map((line) => line.replace(/^[•\-–—]\s*/, '').trim())
    .filter(Boolean);

const InfoGreen = ({ data }) => {
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

  const GREEN = '#10b981';
  const GREEN_DARK = '#047857';
  const GREEN_DEEP = '#065f46';
  const GREEN_SOFT = '#d1fae5';
  const GREEN_PALE = '#ecfdf5';

  const INK = '#162027';
  const BODY = '#52606d';
  const MUTED = '#8b98a5';
  const BORDER = '#e1e8e5';
  const WHITE = '#ffffff';
  const SOFT = '#f8fbfa';

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

    if (core.length) {
      blocks.push({
        id: 'core-skills',
        section: 'core',
        type: 'tags',
        items: core,
      });
    }

    if (technical.length) {
      blocks.push({
        id: 'technical-skills',
        section: 'technical',
        type: 'technical',
        items: technical,
      });
    }

    if (soft.length) {
      blocks.push({
        id: 'soft-skills',
        section: 'soft',
        type: 'tags',
        items: soft,
      });
    }

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
    awards,
    certifications,
    core,
    education,
    languages,
    projects,
    soft,
    technical,
  ]);

  const FirstHeader = ({ measureRef = null }) => (
    <header ref={measureRef} className="mb-5">
      <div
        className="relative overflow-hidden rounded-[14px]"
        style={{
          background:
            `linear-gradient(135deg, ${GREEN_DEEP} 0%, ${GREEN_DARK} 52%, ${GREEN} 100%)`,
          boxShadow: '0 16px 34px rgba(6,95,70,0.18)',
        }}
      >
        <div
          className="absolute -right-10 -top-12 h-36 w-36 rounded-full border-[18px]"
          style={{ borderColor: 'rgba(255,255,255,0.08)' }}
        />
        <div
          className="absolute right-20 top-6 h-14 w-14 rounded-full"
          style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
        />

        <div className="relative z-10 grid grid-cols-[1fr_34mm] items-center gap-6 px-6 py-5">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2">
              
              <span className="text-[7.5px] font-black uppercase tracking-[0.2em] text-emerald-100">
               
              </span>
            </div>

            <h1 className="break-words text-[30px] font-black uppercase leading-[0.94] tracking-[0.02em] text-white">
              {personal.name || 'Your Name'}
            </h1>

            {personal.title ? (
              <div className="mt-2 text-[9.5px] font-bold uppercase tracking-[0.16em] text-emerald-100">
                {personal.title}
              </div>
            ) : null}

            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[7px] font-semibold text-emerald-50/90">
              {personal.phone ? (
                <span className="flex items-center gap-1.5">
                  <Phone size={9} />
                  {personal.phone}
                </span>
              ) : null}

              {personal.email ? (
                <span className="flex items-center gap-1.5 break-all">
                  <Mail size={9} />
                  {personal.email}
                </span>
              ) : null}

              {personal.location ? (
                <span className="flex items-center gap-1.5">
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
          </div>

          <div className="flex justify-end">
            {personal.photo ? (
              <div className="rounded-full border border-white/30 bg-white/10 p-1.5">
                <img
                  src={personal.photo}
                  alt="Profile"
                  className="h-[29mm] w-[29mm] rounded-full object-cover"
                />
              </div>
            ) : (
              <div className="flex h-[31mm] w-[31mm] items-center justify-center rounded-full border border-white/30 bg-white/10 text-white/65">
                <UserRound size={28} />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );

  const ContinuationHeader = ({
    measureRef = null,
    pageNumber = 2,
  }) => (
    <header
      ref={measureRef}
      className="mb-4 flex items-end justify-between border-b pb-3"
      style={{ borderColor: BORDER }}
    >
      <div>
        <div
          className="text-[12px] font-black uppercase tracking-[0.04em]"
          style={{ color: INK }}
        >
          {personal.name || 'Your Name'}
        </div>

        {personal.title ? (
          <div
            className="mt-0.5 text-[7.8px] uppercase tracking-[0.1em]"
            style={{ color: GREEN_DARK }}
          >
            {personal.title}
          </div>
        ) : null}
      </div>

      <div
        className="rounded-full px-3 py-1 text-[7px] font-black uppercase tracking-[0.12em]"
        style={{
          backgroundColor: GREEN_PALE,
          color: GREEN_DARK,
        }}
      >
        Dashboard {pageNumber}
      </div>
    </header>
  );

  const SectionTitle = ({ sectionId, side = false }) => {
    const config = {
      summary: ['Profile Summary', UserRound],
      experience: ['Work Experience', BriefcaseBusiness],
      core: ['Core Expertise', Target],
      technical: ['Technical Stack', Code2],
      soft: ['Leadership & Collaboration', Sparkles],
      projects: ['Major Initiatives', FolderKanban],
      education: ['Education', GraduationCap],
      certifications: ['Certifications', Award],
      awards: ['Recognition', Trophy],
      languages: ['Languages', LanguagesIcon],
    };

    const [title, Icon] = config[sectionId];

    return (
      <div className={side ? 'pb-2.5' : 'pb-3'}>
        <div className="flex items-center gap-2.5">
          <div
            className={`${side ? 'h-6 w-6' : 'h-7 w-7'} flex shrink-0 items-center justify-center rounded-[6px]`}
            style={{
              backgroundColor: GREEN_PALE,
              color: GREEN_DARK,
            }}
          >
            <Icon size={side ? 10 : 12} />
          </div>

          <div
            className={`${side ? 'text-[7.5px]' : 'text-[9px]'} font-black uppercase tracking-[0.13em]`}
            style={{ color: INK }}
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
            className="rounded-[10px] border px-4 py-3.5"
            style={{
              backgroundColor: SOFT,
              borderColor: BORDER,
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
          <div
            className="relative rounded-[10px] border px-4 py-3.5"
            style={{
              backgroundColor: WHITE,
              borderColor: BORDER,
              boxShadow: '0 7px 18px rgba(15,23,42,0.04)',
            }}
          >
            <div
              className="absolute bottom-3 left-0 top-3 w-[3px] rounded-r-full"
              style={{ backgroundColor: GREEN }}
            />

            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div
                  className="text-[11.4px] font-black leading-tight"
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
                    style={{ color: GREEN_DARK }}
                  >
                    {item.company}
                  </div>
                ) : null}
              </div>

              {!block.continuation && item.date ? (
                <span
                  className="shrink-0 rounded-full px-2.5 py-1 text-[6.8px] font-bold"
                  style={{
                    backgroundColor: GREEN_PALE,
                    color: GREEN_DARK,
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
                    className="flex items-start gap-2 text-[9.1px] leading-[1.5]"
                    style={{ color: BODY }}
                  >
                    <span
                      className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{
                        backgroundColor:
                          index % 2 === 0 ? GREEN : GREEN_DARK,
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

    if (block.type === 'tags') {
      return (
        <div className="pb-3.5">
          <div className="flex flex-wrap gap-1.5">
            {block.items.map((item, index) => (
              <span
                key={`${block.id}-${item}-${index}`}
                className="rounded-full px-2.5 py-1 text-[6.8px] font-bold"
                style={{
                  backgroundColor:
                    block.section === 'soft'
                      ? GREEN
                      : GREEN_PALE,
                  color:
                    block.section === 'soft'
                      ? WHITE
                      : GREEN_DARK,
                  border:
                    block.section === 'soft'
                      ? 'none'
                      : `1px solid ${GREEN_SOFT}`,
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      );
    }

    if (block.type === 'technical') {
      return (
        <div className="pb-3.5">
          <div className="space-y-1.5">
            {block.items.map((item, index) => (
              <div
                key={`${block.id}-${item}-${index}`}
                className="flex items-center gap-2 border-b pb-1.5 text-[7.2px]"
                style={{
                  borderColor: BORDER,
                  color: BODY,
                }}
              >
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: GREEN }}
                />
                <span>{item}</span>
              </div>
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
            className="rounded-[8px] border px-3 py-2.5"
            style={{
              borderColor: BORDER,
              backgroundColor: GREEN_PALE,
            }}
          >
            <div
              className="text-[7.8px] font-black leading-[1.25]"
              style={{ color: GREEN_DARK }}
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
            className="border-l-2 pl-3"
            style={{ borderColor: GREEN }}
          >
            <div
              className="text-[7.8px] font-black leading-[1.28]"
              style={{ color: INK }}
            >
              {item.degree || item.school}
            </div>

            {item.degree && item.school ? (
              <div
                className="mt-1 text-[6.9px] leading-[1.35]"
                style={{ color: BODY }}
              >
                {item.school}
              </div>
            ) : null}

            {item.date ? (
              <div
                className="mt-1 text-[6.4px] font-bold"
                style={{ color: GREEN_DARK }}
              >
                {item.date}
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
            className="text-[7.4px] font-bold leading-[1.28]"
            style={{ color: INK }}
          >
            {item.name}
          </div>

          {(item.issuer || item.date) ? (
            <div
              className="mt-1 text-[6.5px]"
              style={{ color: MUTED }}
            >
              {[item.issuer, item.date].filter(Boolean).join(' • ')}
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
                  <span style={{ color: INK }}>{name}</span>
                  {level ? (
                    <span style={{ color: GREEN_DARK }}>{level}</span>
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
    'core',
    'technical',
    'soft',
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
        backgroundColor: '#dfe7e3',
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
          <FirstHeader measureRef={firstHeaderRef} />
          <ContinuationHeader
            measureRef={continuationHeaderRef}
            pageNumber={2}
          />
        </div>

        <div
          className="grid"
          style={{
            width: INNER_WIDTH,
            gridTemplateColumns: `${MAIN_WIDTH} ${SIDE_WIDTH}`,
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

      {/* Actual A4 pages */}
      <div className="space-y-5 print:space-y-0">
        {Array.from({ length: pageCount }).map((_, pageIndex) => {
          const mainPage =
            visibleMainPages[pageIndex] || { blocks: [] };

          const sidePage =
            visibleSidePages[pageIndex] || { blocks: [] };

          return (
            <section
              key={`info-green-page-${pageIndex}`}
              className="relative mx-auto h-[297mm] w-[210mm] overflow-hidden bg-white shadow-[0_20px_58px_rgba(0,0,0,0.16)] print:shadow-none"
              style={{
                width: PAGE_WIDTH,
                height: PAGE_HEIGHT,
                padding: '11mm 13mm 15mm',
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
              {pageIndex === 0 ? (
                <FirstHeader />
              ) : (
                <ContinuationHeader
                  pageNumber={pageIndex + 1}
                />
              )}

              <div
                className="grid"
                style={{
                  width: INNER_WIDTH,
                  gridTemplateColumns: `${MAIN_WIDTH} ${SIDE_WIDTH}`,
                  columnGap: COLUMN_GAP,
                  alignItems: 'start',
                }}
              >
                <main>
                  {mainPage.blocks.map((block, blockIndex) => {
                    const previous = mainPage.blocks[blockIndex - 1];

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

                <aside>
                  {sidePage.blocks.map((block, blockIndex) => {
                    const previous = sidePage.blocks[blockIndex - 1];

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
                className="absolute bottom-[5mm] left-[13mm] right-[13mm] flex items-center justify-between border-t pt-1.5 text-[6.2px] font-black uppercase tracking-[0.1em]"
                style={{
                  borderColor: BORDER,
                  color: MUTED,
                }}
              >
                <span style={{ color: GREEN_DARK }}>
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

export default InfoGreen;
