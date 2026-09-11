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
  BriefcaseBusiness,
  FolderKanban,
  GraduationCap,
  Languages as LanguagesIcon,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  Target,
  UserRound,
} from 'lucide-react';

const BlueFrame = ({ data }) => {
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

  const FRAME_WIDTH = '196mm';
  const FRAME_HEIGHT = '283mm';
  const INNER_WIDTH = '180mm';
  const MAIN_WIDTH = '116mm';
  const SIDE_WIDTH = '56mm';
  const COLUMN_GAP = '8mm';

  const CONTENT_HEIGHT = '260mm';
  const FOOTER_RESERVE = '8mm';

  const BLUE = '#1e3a8a';
  const BLUE_2 = '#1d4ed8';
  const BLUE_SOFT = '#eff6ff';
  const BLUE_BORDER = '#bfdbfe';

  const PAGE_BG = '#ffffff';
  const WHITE = '#ffffff';
  const INK = '#0f172a';
  const BODY = '#475569';
  const MUTED = '#94a3b8';
  const BORDER = '#e2e8f0';
  const SIDE_BG = '#f8fafc';

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

  const normalizeLines = useCallback((value = '') => {
    return String(value || '')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => line.replace(/^[•\-–—]\s*/, '').trim())
      .filter(Boolean);
  }, []);

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
      const chunks = chunkArray(normalizeLines(item.desc), 4);

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
  }, [
    chunkArray,
    experience,
    normalizeLines,
    personal.summary,
  ]);

  const sideBlocks = useMemo(() => {
    const blocks = [];

    chunkArray(allSkills, 10).forEach((items, index) => {
      if (!items.length) return;

      blocks.push({
        id: `skills-${index}`,
        section: 'skills',
        type: 'skills',
        items,
        continuation: index > 0,
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
        forceBreak: Boolean(item.pageBreak),
      });
    });

    awards.forEach((item, index) => {
      blocks.push({
        id: `award-${item.id ?? 'na'}-${index}`,
        section: 'awards',
        type: 'award',
        item,
        forceBreak: Boolean(item.pageBreak),
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

  const FullHeader = ({ measureRef = null }) => (
    <header ref={measureRef} className="mb-5">
      <div
        className="flex items-center justify-between gap-6 border-b-[4px] pb-5"
        style={{ borderColor: BLUE }}
      >
        <div className="min-w-0 flex-1">
          <div
            className="mb-1.5 text-[8px] font-black uppercase tracking-[0.2em]"
            style={{ color: BLUE_2 }}
          >
            Professional Resume
          </div>

          <h1
            className="break-words text-[30px] font-black uppercase leading-none tracking-[-0.035em]"
            style={{ color: BLUE }}
          >
            {personal.name || 'Your Name'}
          </h1>

          {personal.title ? (
            <div
              className="mt-2 text-[10px] font-semibold uppercase tracking-[0.1em]"
              style={{ color: BODY }}
            >
              {personal.title}
            </div>
          ) : null}
        </div>

        {personal.photo ? (
          <img
            src={personal.photo}
            alt="Profile"
            className="h-[24mm] w-[24mm] shrink-0 object-cover"
            style={{
              border: `2px solid ${BLUE}`,
              padding: '1mm',
              backgroundColor: '#ffffff',
            }}
          />
        ) : (
          <div
            className="flex h-[24mm] w-[24mm] shrink-0 items-center justify-center"
            style={{
              border: `2px solid ${BLUE}`,
              color: BLUE,
              backgroundColor: BLUE_SOFT,
            }}
          >
            <UserRound size={30} />
          </div>
        )}
      </div>

      <div
        className="grid grid-cols-2 gap-x-5 gap-y-2 border-b py-3 text-[8px] font-medium"
        style={{
          borderColor: BORDER,
          color: BODY,
        }}
      >
        {personal.email ? (
          <div className="flex items-center gap-2 break-all">
            <Mail size={10} style={{ color: BLUE_2 }} />
            <span>{personal.email}</span>
          </div>
        ) : null}

        {personal.phone ? (
          <div className="flex items-center gap-2">
            <Phone size={10} style={{ color: BLUE_2 }} />
            <span>{personal.phone}</span>
          </div>
        ) : null}

        {personal.location ? (
          <div className="flex items-center gap-2">
            <MapPin size={10} style={{ color: BLUE_2 }} />
            <span>{personal.location}</span>
          </div>
        ) : null}

        {personal.linkedin ? (
          <div className="flex items-center gap-2 break-all">
            <Linkedin size={10} style={{ color: BLUE_2 }} />
            <span>{personal.linkedin}</span>
          </div>
        ) : null}
      </div>
    </header>
  );

  const ContinuationHeader = ({
    measureRef = null,
    pageNumber = 2,
  }) => (
    <header
      ref={measureRef}
      className="mb-4 flex items-end justify-between border-b-[3px] pb-3"
      style={{ borderColor: BLUE }}
    >
      <div>
        <div
          className="text-[13px] font-black uppercase tracking-[-0.02em]"
          style={{ color: BLUE }}
        >
          {personal.name || 'Your Name'}
        </div>

        {personal.title ? (
          <div
            className="mt-0.5 text-[8.5px] font-semibold"
            style={{ color: BODY }}
          >
            {personal.title}
          </div>
        ) : null}
      </div>

      <div
        className="px-3 py-1 text-[8px] font-black uppercase tracking-[0.08em] text-white"
        style={{ backgroundColor: BLUE }}
      >
        Page {pageNumber}
      </div>
    </header>
  );

  const MainSectionTitle = ({ sectionId }) => {
    const config = {
      summary: {
        title: 'Profile',
        icon: Target,
      },
      experience: {
        title: 'Experience',
        icon: BriefcaseBusiness,
      },
    };

    const section = config[sectionId];
    const Icon = section.icon;

    return (
      <div className="pb-3">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 items-center justify-center text-white"
            style={{ backgroundColor: BLUE }}
          >
            <Icon size={14} />
          </div>

          <h2
            className="text-[10px] font-black uppercase tracking-[0.14em]"
            style={{ color: BLUE }}
          >
            {section.title}
          </h2>

          <div
            className="h-px flex-1"
            style={{ backgroundColor: BLUE_BORDER }}
          />
        </div>
      </div>
    );
  };

  const SideSectionTitle = ({ sectionId }) => {
    const config = {
      skills: ['Skills', Sparkles],
      education: ['Education', GraduationCap],
      projects: ['Projects', FolderKanban],
      certifications: ['Certifications', Award],
      awards: ['Awards', Award],
      languages: ['Languages', LanguagesIcon],
    };

    const [title, Icon] = config[sectionId];

    return (
      <div className="pb-2.5">
        <div
          className="flex items-center gap-2 border-b pb-2"
          style={{ borderColor: BLUE_BORDER }}
        >
          <Icon size={11} style={{ color: BLUE_2 }} />

          <h2
            className="text-[8.8px] font-black uppercase tracking-[0.12em]"
            style={{ color: BLUE }}
          >
            {title}
          </h2>
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
              backgroundColor: BLUE_SOFT,
              borderColor: BLUE,
            }}
          >
            <p
              className="whitespace-pre-wrap text-[10.5px] leading-[1.58]"
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
          <div className="relative">
            <div
              className="absolute bottom-0 left-[4px] top-0 w-[2px]"
              style={{ backgroundColor: '#dbeafe' }}
            />

            <div
              className="absolute left-0 top-[5px] h-[10px] w-[10px] rounded-full border-[2px] bg-white"
              style={{ borderColor: BLUE }}
            />

            <div className="pl-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3
                    className="text-[12px] font-black leading-tight"
                    style={{ color: INK }}
                  >
                    {item.role}

                    {block.continuation ? (
                      <span
                        className="ml-1 text-[8px] font-medium italic"
                        style={{ color: MUTED }}
                      >
                        continued
                      </span>
                    ) : null}
                  </h3>

                  {!block.continuation && item.company ? (
                    <div
                      className="mt-1 text-[9.3px] font-bold"
                      style={{ color: BLUE_2 }}
                    >
                      {item.company}
                    </div>
                  ) : null}
                </div>

                {!block.continuation && item.date ? (
                  <span
                    className="shrink-0 text-[8px] font-bold"
                    style={{ color: BLUE_2 }}
                  >
                    {item.date}
                  </span>
                ) : null}
              </div>

              {block.lines.length ? (
                <ul className="mt-2.5 space-y-1.5">
                  {block.lines.map((line, index) => (
                    <li
                      key={`${block.id}-${index}`}
                      className="flex items-start gap-2 text-[10px] leading-[1.5]"
                      style={{ color: BODY }}
                    >
                      <span
                        className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: BLUE_2 }}
                      />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
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
          <div className="flex flex-wrap gap-x-2 gap-y-1.5">
            {block.items.map((skill, index) => (
              <span
                key={`${block.id}-${skill}-${index}`}
                className="text-[8px] font-medium"
                style={{ color: BODY }}
              >
                <span style={{ color: BLUE_2 }}>•</span>{' '}
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
            className="text-[8.8px] font-black leading-[1.25]"
            style={{ color: INK }}
          >
            {item.degree || item.school}
          </div>

          {item.degree && item.school ? (
            <div
              className="mt-1 text-[7.8px] leading-[1.35]"
              style={{ color: BODY }}
            >
              {item.school}
            </div>
          ) : null}

          {item.date ? (
            <div
              className="mt-1 text-[7.3px] font-bold"
              style={{ color: BLUE_2 }}
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
              backgroundColor: BLUE_SOFT,
              borderColor: BLUE_2,
            }}
          >
            <div
              className="text-[8.8px] font-black"
              style={{ color: INK }}
            >
              {item.name}
            </div>

            {item.desc ? (
              <div
                className="mt-1.5 text-[7.7px] leading-[1.4]"
                style={{ color: BODY }}
              >
                {item.desc}
              </div>
            ) : null}
          </div>
        </article>
      );
    }

    if (block.type === 'certification') {
      const item = block.item;

      return (
        <article className="pb-2.5">
          <div
            className="text-[8.4px] font-black leading-[1.2]"
            style={{ color: INK }}
          >
            {item.name}
          </div>

          {(item.issuer || item.date) ? (
            <div
              className="mt-1 text-[7.3px]"
              style={{ color: BODY }}
            >
              {[item.issuer, item.date]
                .filter(Boolean)
                .join(' • ')}
            </div>
          ) : null}
        </article>
      );
    }

    if (block.type === 'award') {
      const item = block.item;

      return (
        <article className="pb-2.5">
          <div className="flex items-start gap-2">
            <Award
              size={10}
              className="mt-0.5 shrink-0"
              style={{ color: BLUE_2 }}
            />

            <div>
              <div
                className="text-[8.4px] font-black leading-[1.2]"
                style={{ color: INK }}
              >
                {item.name}
              </div>

              {item.issuer ? (
                <div
                  className="mt-0.5 text-[7.3px]"
                  style={{ color: BODY }}
                >
                  {item.issuer}
                </div>
              ) : null}
            </div>
          </div>
        </article>
      );
    }

    if (block.type === 'languages') {
      return (
        <div className="pb-3.5">
          <div className="space-y-2">
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
                  className="flex items-center justify-between gap-3 border-b pb-1.5"
                  style={{ borderColor: BORDER }}
                >
                  <span
                    className="text-[8px] font-bold"
                    style={{ color: INK }}
                  >
                    {name}
                  </span>

                  {level ? (
                    <span
                      className="text-[7.2px]"
                      style={{ color: MUTED }}
                    >
                      {level}
                    </span>
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
          blockRefs.current[
            block.id
          ]?.getBoundingClientRect().height || 0;

        const sectionHeight =
          block.section &&
          activeSection !== block.section
            ? sectionRefs.current[
                block.section
              ]?.getBoundingClientRect().height || 0
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
                ? sectionRefs.current[
                    block.section
                  ]?.getBoundingClientRect().height || 0
                : 0
            ) + blockHeight;
        }

        pageBlocks.push(block);
        usedHeight += required;
        activeSection =
          block.section || activeSection;
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
      document.fonts.ready
        .then(run)
        .catch(() => {});
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

  const mainSectionOrder = [
    'summary',
    'experience',
  ];

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
      className="resume-preview-wrapper relative mx-auto w-full max-w-[210mm] font-sans"
      style={{ backgroundColor: '#dbeafe' }}
    >
      {/* HIDDEN MEASUREMENT */}
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
          <FullHeader measureRef={firstHeaderRef} />
          <ContinuationHeader
            measureRef={continuationHeaderRef}
            pageNumber={2}
          />
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
                  mainSectionRefs.current[
                    sectionId
                  ] = node;
                }}
              >
                <MainSectionTitle
                  sectionId={sectionId}
                />
              </div>
            ))}

            {mainBlocks.map((block) => (
              <div
                key={`measure-main-${block.id}`}
                ref={(node) => {
                  mainMeasureRefs.current[
                    block.id
                  ] = node;
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
                  sideSectionRefs.current[
                    sectionId
                  ] = node;
                }}
              >
                <SideSectionTitle
                  sectionId={sectionId}
                />
              </div>
            ))}

            {sideBlocks.map((block) => (
              <div
                key={`measure-side-${block.id}`}
                ref={(node) => {
                  sideMeasureRefs.current[
                    block.id
                  ] = node;
                }}
              >
                {renderSideBlock(block)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* REAL A4 PAGES */}
      <div className="space-y-5 print:space-y-0">
        {Array.from({ length: pageCount }).map((_, pageIndex) => {
          const mainPage =
            visibleMainPages[pageIndex] || { blocks: [] };

          const sidePage =
            visibleSidePages[pageIndex] || { blocks: [] };

          return (
            <section
              key={`blue-frame-page-${pageIndex}`}
              className="relative mx-auto h-[297mm] w-[210mm] overflow-hidden bg-white shadow-[0_18px_55px_rgba(30,58,138,0.14)] print:shadow-none"
              style={{
                width: PAGE_WIDTH,
                height: PAGE_HEIGHT,
                padding: '7mm',
                boxSizing: 'border-box',
                backgroundColor: PAGE_BG,
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
                className="relative h-full w-full"
                style={{
                  width: FRAME_WIDTH,
                  height: FRAME_HEIGHT,
                  boxSizing: 'border-box',
                  border: `1.2mm solid ${BLUE}`,
                  padding: '7mm 8mm 10mm',
                  backgroundColor: WHITE,
                }}
              >
                {pageIndex === 0 ? (
                  <FullHeader />
                ) : (
                  <ContinuationHeader
                    pageNumber={pageIndex + 1}
                  />
                )}

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
                            <MainSectionTitle
                              sectionId={block.section}
                            />
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
                    className="border-l pl-[4mm]"
                    style={{
                      borderColor: BORDER,
                      backgroundColor: SIDE_BG,
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
                            <SideSectionTitle
                              sectionId={block.section}
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
                  className="absolute bottom-[4mm] left-[8mm] right-[8mm] flex items-center justify-between border-t pt-1.5 text-[6.5px] font-black uppercase tracking-[0.11em]"
                  style={{
                    borderColor: BLUE_BORDER,
                    color: MUTED,
                  }}
                >
                  <span style={{ color: BLUE }}>
                    Confidential
                  </span>

                  <span>
                    Page {pageIndex + 1} / {pageCount}
                  </span>
                </footer>
              </div>
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

export default BlueFrame;
