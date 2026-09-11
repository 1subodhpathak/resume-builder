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
  Circle,
  FolderKanban,
  GraduationCap,
  Languages as LanguagesIcon,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Shapes,
  Sparkles,
  UserRound,
} from 'lucide-react';

const Berlin = ({ data }) => {
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
  const FOOTER_RESERVE = '10mm';

  const BLUE = '#2563eb';
  const YELLOW = '#eab308';
  const RED = '#dc2626';
  const BLACK = '#0a0a0a';
  const TEXT = '#18181b';
  const BODY = '#52525b';
  const MUTED = '#a1a1aa';
  const BORDER = '#e4e4e7';
  const PAGE_BG = '#fafafa';
  const WHITE = '#ffffff';

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
        className="relative overflow-hidden px-[7mm] py-[6mm] text-white"
        style={{
          backgroundColor: BLACK,
          boxShadow: '0 14px 34px rgba(0,0,0,0.14)',
        }}
      >
        <div
          className="pointer-events-none absolute right-[8mm] top-[5mm] h-[24mm] w-[24mm] rounded-full border-[4px]"
          style={{ borderColor: YELLOW }}
        />
        <div
          className="pointer-events-none absolute bottom-[5mm] right-[30mm] h-[11mm] w-[11mm]"
          style={{ backgroundColor: RED }}
        />
        <div
          className="pointer-events-none absolute bottom-[4mm] right-[14mm] h-[18mm] w-[5mm]"
          style={{ backgroundColor: BLUE }}
        />

        <div className="relative z-10 flex items-center gap-5">
          {personal.photo ? (
            <div
              className="shrink-0 p-[3px]"
              style={{ backgroundColor: YELLOW }}
            >
              <img
                src={personal.photo}
                alt="Profile"
                className="h-[24mm] w-[24mm] object-cover"
              />
            </div>
          ) : (
            <div
              className="flex h-[24mm] w-[24mm] shrink-0 items-center justify-center"
              style={{
                backgroundColor: '#18181b',
                border: `3px solid ${YELLOW}`,
              }}
            >
              <UserRound size={34} />
            </div>
          )}

          <div className="min-w-0 flex-1 pr-[35mm]">
            <div
              className="mb-1.5 text-[8px] font-black uppercase tracking-[0.22em]"
              style={{ color: YELLOW }}
            >
              
            </div>

            <h1 className="break-words text-[29px] font-black uppercase leading-none tracking-[-0.04em]">
              {personal.name || 'Your Name'}
            </h1>

            {personal.title ? (
              <div
                className="mt-2 text-[10px] font-black uppercase tracking-[0.12em]"
                style={{ color: '#fef08a' }}
              >
                {personal.title}
              </div>
            ) : null}

            <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5 text-[8px] font-medium text-white/75">
              {personal.phone ? (
                <span className="flex items-center gap-1.5">
                  <Phone size={10} />
                  {personal.phone}
                </span>
              ) : null}

              {personal.email ? (
                <span className="flex items-center gap-1.5 break-all">
                  <Mail size={10} />
                  {personal.email}
                </span>
              ) : null}

              {personal.location ? (
                <span className="flex items-center gap-1.5">
                  <MapPin size={10} />
                  {personal.location}
                </span>
              ) : null}

              {personal.linkedin ? (
                <span className="flex items-center gap-1.5 break-all">
                  <Linkedin size={10} />
                  {personal.linkedin}
                </span>
              ) : null}
            </div>
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
      className="mb-4 flex items-end justify-between border-b-[3px] pb-3"
      style={{ borderColor: BLACK }}
    >
      <div>
        <div
          className="text-[13px] font-black uppercase tracking-[-0.02em]"
          style={{ color: BLACK }}
        >
          {personal.name || 'Your Name'}
        </div>

        {personal.title ? (
          <div
            className="mt-0.5 text-[8.5px] font-semibold uppercase"
            style={{ color: BLUE }}
          >
            {personal.title}
          </div>
        ) : null}
      </div>

      <div className="flex items-center gap-1.5">
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: BLUE }}
        />
        <span
          className="h-2.5 w-2.5"
          style={{ backgroundColor: RED }}
        />
        <span
          className="h-2.5 w-5"
          style={{ backgroundColor: YELLOW }}
        />

        <span
          className="ml-1 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.08em] text-white"
          style={{ backgroundColor: BLACK }}
        >
          Page {pageNumber}
        </span>
      </div>
    </header>
  );

  const MainSectionTitle = ({ sectionId }) => {
    const config = {
      summary: {
        title: 'Profile',
        color: BLUE,
        icon: Circle,
      },
      experience: {
        title: 'Experience',
        color: YELLOW,
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
            style={{ backgroundColor: section.color }}
          >
            <Icon
              size={14}
              style={{
                color:
                  section.color === YELLOW
                    ? BLACK
                    : WHITE,
              }}
            />
          </div>

          <h2
            className="text-[10px] font-black uppercase tracking-[0.15em]"
            style={{ color: BLACK }}
          >
            {section.title}
          </h2>

          <div
            className="h-[3px] flex-1"
            style={{
              background:
                `linear-gradient(90deg, ${section.color} 0 28%, ${BLACK} 28% 100%)`,
            }}
          />
        </div>
      </div>
    );
  };

  const SideSectionTitle = ({ sectionId }) => {
    const config = {
      projects: ['Projects', FolderKanban, YELLOW],
      education: ['Education', GraduationCap, BLUE],
      skills: ['Skills', Shapes, RED],
      certifications: ['Certifications', Award, BLUE],
      awards: ['Awards', Sparkles, YELLOW],
      languages: ['Languages', LanguagesIcon, RED],
    };

    const [title, Icon, color] = config[sectionId];

    return (
      <div className="pb-2.5">
        <div className="flex items-center gap-2">
          <div
            className="flex h-6 w-6 items-center justify-center"
            style={{ backgroundColor: color }}
          >
            <Icon
              size={11}
              style={{
                color:
                  color === YELLOW
                    ? BLACK
                    : WHITE,
              }}
            />
          </div>

          <h2
            className="text-[8.8px] font-black uppercase tracking-[0.12em]"
            style={{ color: BLACK }}
          >
            {title}
          </h2>

          <div
            className="h-px flex-1"
            style={{ backgroundColor: BORDER }}
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
            className="border-l-[5px] px-4 py-3.5"
            style={{
              backgroundColor: '#f8fafc',
              borderColor: BLUE,
            }}
          >
            <p
              className="whitespace-pre-wrap text-[10.5px] italic leading-[1.58]"
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
            className="relative border-l-[5px] px-4 py-3"
            style={{
              backgroundColor: WHITE,
              borderColor: YELLOW,
            }}
          >
            <div
              className="absolute right-0 top-0 h-3 w-3"
              style={{ backgroundColor: RED }}
            />

            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h3
                  className="text-[12px] font-black uppercase leading-tight"
                  style={{ color: TEXT }}
                >
                  {item.role}

                  {block.continuation ? (
                    <span
                      className="ml-1 text-[8px] font-medium italic normal-case"
                      style={{ color: MUTED }}
                    >
                      continued
                    </span>
                  ) : null}
                </h3>

                {!block.continuation && item.company ? (
                  <div
                    className="mt-1 text-[9.3px] font-black uppercase tracking-[0.08em]"
                    style={{ color: BLUE }}
                  >
                    {item.company}
                  </div>
                ) : null}
              </div>

              {!block.continuation && item.date ? (
                <span
                  className="shrink-0 text-[8px] font-black uppercase tracking-[0.08em]"
                  style={{ color: BLUE }}
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
                      className="mt-[5px] h-1.5 w-1.5 shrink-0"
                      style={{
                        backgroundColor:
                          index % 2 === 0
                            ? RED
                            : BLUE,
                      }}
                    />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </article>
      );
    }

    return null;
  };

  const renderSideBlock = (block) => {
    if (!block) return null;

    if (block.type === 'project') {
      const item = block.item;

      return (
        <article className="pb-3">
          <div
            className="border-l-[5px] px-3 py-2.5"
            style={{
              borderColor: YELLOW,
              backgroundColor: '#fffbeb',
            }}
          >
            <div
              className="text-[9.2px] font-black uppercase"
              style={{ color: BLUE }}
            >
              {item.name}
            </div>

            {item.desc ? (
              <div
                className="mt-1.5 text-[8.1px] leading-[1.42]"
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
            className="border-l-[5px] px-3 py-2.5"
            style={{
              borderColor: BLUE,
              backgroundColor: WHITE,
            }}
          >
            <div
              className="text-[9.2px] font-black uppercase"
              style={{ color: TEXT }}
            >
              {item.degree || item.school}
            </div>

            {item.degree && item.school ? (
              <div
                className="mt-1 text-[8.1px] font-semibold uppercase"
                style={{ color: YELLOW }}
              >
                {item.school}
              </div>
            ) : null}

            {item.date ? (
              <div
                className="mt-1 text-[7.7px] font-black uppercase"
                style={{ color: BLUE }}
              >
                {item.date}
              </div>
            ) : null}
          </div>
        </article>
      );
    }

    if (block.type === 'skills') {
      return (
        <div className="pb-3.5">
          <div className="flex flex-wrap gap-1.5">
            {block.items.map((skill, index) => {
              const palette =
                index % 3 === 0
                  ? [BLUE, '#eff6ff']
                  : index % 3 === 1
                    ? [RED, '#fef2f2']
                    : [BLACK, '#fefce8'];

              return (
                <span
                  key={`${block.id}-${skill}-${index}`}
                  className="border-2 px-2 py-1 text-[7.5px] font-black uppercase tracking-[0.06em]"
                  style={{
                    borderColor: palette[0],
                    backgroundColor: palette[1],
                    color: TEXT,
                  }}
                >
                  {skill}
                </span>
              );
            })}
          </div>
        </div>
      );
    }

    if (block.type === 'certification') {
      const item = block.item;

      return (
        <article className="pb-2.5">
          <div
            className="text-[8.6px] font-black uppercase"
            style={{ color: TEXT }}
          >
            {item.name}
          </div>

          {(item.issuer || item.date) ? (
            <div
              className="mt-1 text-[7.6px]"
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
            <span
              className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: YELLOW }}
            />

            <div>
              <div
                className="text-[8.6px] font-black uppercase"
                style={{ color: TEXT }}
              >
                {item.name}
              </div>

              {item.issuer ? (
                <div
                  className="mt-0.5 text-[7.5px]"
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
                  className="flex items-center justify-between gap-3 border-2 px-2.5 py-1.5"
                  style={{ borderColor: BLUE }}
                >
                  <span
                    className="text-[8px] font-black uppercase"
                    style={{ color: TEXT }}
                  >
                    {name}
                  </span>

                  {level ? (
                    <span
                      className="text-[7.2px] font-bold uppercase"
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
    'projects',
    'education',
    'skills',
    'certifications',
    'awards',
    'languages',
  ];

  return (
    <div
      className="resume-preview-wrapper relative mx-auto w-full max-w-[210mm] font-sans"
      style={{ backgroundColor: '#e4e4e7' }}
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
              key={`berlin-page-${pageIndex}`}
              className="relative mx-auto h-[297mm] w-[210mm] overflow-hidden bg-white shadow-[0_18px_55px_rgba(0,0,0,0.14)] print:shadow-none"
              style={{
                width: PAGE_WIDTH,
                height: PAGE_HEIGHT,
                padding: '11mm 13mm 15mm',
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
                <main
                  className="border-t-[5px] pt-[4mm]"
                  style={{
                    width: MAIN_WIDTH,
                    borderColor: BLUE,
                  }}
                >
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
                  className="border-t-[5px] p-[4mm]"
                  style={{
                    width: SIDE_WIDTH,
                    boxSizing: 'border-box',
                    borderColor: YELLOW,
                    backgroundColor: WHITE,
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
                className="absolute bottom-[6mm] left-[13mm] right-[13mm] flex items-center justify-between border-t pt-2 text-[7.2px] font-black uppercase tracking-[0.1em]"
                style={{
                  borderColor: BLACK,
                  color: MUTED,
                }}
              >
                <span
                  className="flex items-center gap-2"
                  style={{ color: BLACK }}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: BLUE }}
                  />
                  <span
                    className="h-2 w-2"
                    style={{ backgroundColor: RED }}
                  />
                  <span
                    className="h-2 w-4"
                    style={{ backgroundColor: YELLOW }}
                  />
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

export default Berlin;
