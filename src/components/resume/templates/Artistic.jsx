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
  Brush,
  FolderKanban,
  GraduationCap,
  Languages as LanguagesIcon,
  Mail,
  MapPin,
  Palette,
  Phone,
  Sparkles,
  UserRound,
} from 'lucide-react';

const Artistic = ({ data }) => {
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
  const MAIN_WIDTH = '116mm';
  const SIDE_WIDTH = '60mm';
  const COLUMN_GAP = '8mm';
  const CONTENT_HEIGHT = '250mm';
  const FOOTER_RESERVE = '10mm';

  const PRIMARY = '#1e1b4b';
  const ACCENT = '#f43f5e';
  const HIGHLIGHT = '#fbbf24';
  const LILAC = '#f5f3ff';
  const ROSE_SOFT = '#fff1f2';
  const AMBER_SOFT = '#fffbeb';
  const PAGE_BG = '#fffdfb';
  const WHITE = '#ffffff';
  const INK = '#0f172a';
  const BODY = '#475569';
  const MUTED = '#94a3b8';
  const BORDER = '#e2e8f0';

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

    chunkArray(languages, 6).forEach((items, index) => {
      if (!items.length) return;

      blocks.push({
        id: `languages-${index}`,
        section: 'languages',
        type: 'languages',
        items,
        continuation: index > 0,
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

  const FullHeader = ({ measureRef = null }) => (
    <header ref={measureRef} className="mb-5">
      <div
        className="relative overflow-hidden rounded-[28px] px-[7mm] py-[6mm] text-white"
        style={{
          background:
            'linear-gradient(120deg,#1e1b4b 0%,#312e81 52%,#4c1d95 100%)',
          boxShadow: '0 14px 38px rgba(30,27,75,0.18)',
        }}
      >
        <div
          className="pointer-events-none absolute -right-7 -top-8 h-28 w-28 rounded-full"
          style={{ backgroundColor: ACCENT, opacity: 0.28 }}
        />
        <div
          className="pointer-events-none absolute right-[22%] top-[-18px] h-16 w-16 rotate-12 rounded-[18px]"
          style={{ backgroundColor: HIGHLIGHT, opacity: 0.30 }}
        />
        <div
          className="pointer-events-none absolute -bottom-8 left-[28%] h-24 w-24 -rotate-12 rounded-[28px]"
          style={{ backgroundColor: '#818cf8', opacity: 0.20 }}
        />

        <div className="relative z-10 flex items-center gap-5">
          {personal.photo ? (
            <div
              className="shrink-0 rounded-[22px] p-[3px]"
              style={{
                background:
                  `linear-gradient(135deg,${HIGHLIGHT},${ACCENT})`,
              }}
            >
              <img
                src={personal.photo}
                alt="Profile"
                className="h-[24mm] w-[24mm] rounded-[19px] object-cover"
              />
            </div>
          ) : (
            <div className="flex h-[24mm] w-[24mm] shrink-0 items-center justify-center rounded-[20px] border border-white/20 bg-white/10">
              <UserRound size={34} />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div
              className="mb-1.5 text-[8px] font-black uppercase tracking-[0.2em]"
              style={{ color: '#fbcfe8' }}
            >
              Professional Profile
            </div>

            <h1 className="break-words text-[28px] font-black uppercase leading-none tracking-[-0.03em]">
              {personal.name || 'Your Name'}
            </h1>

            {personal.title ? (
              <div
                className="mt-2 text-[10px] font-black uppercase tracking-[0.12em]"
                style={{ color: HIGHLIGHT }}
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
      className="mb-4 flex items-end justify-between border-b pb-3"
      style={{ borderColor: BORDER }}
    >
      <div>
        <div
          className="text-[13px] font-black uppercase tracking-[-0.01em]"
          style={{ color: PRIMARY }}
        >
          {personal.name || 'Your Name'}
        </div>

        {personal.title ? (
          <div
            className="mt-0.5 text-[8.5px] font-semibold"
            style={{ color: ACCENT }}
          >
            {personal.title}
          </div>
        ) : null}
      </div>

      <div
        className="rounded-full px-3 py-1 text-[8px] font-black uppercase tracking-[0.08em]"
        style={{
          backgroundColor: ROSE_SOFT,
          color: ACCENT,
        }}
      >
        Page {pageNumber}
      </div>
    </header>
  );

  const MainSectionTitle = ({ sectionId }) => {
    const config = {
      summary: {
        title: 'Creative Profile',
        icon: Palette,
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
            className="flex h-8 w-8 items-center justify-center rounded-[11px]"
            style={{
              backgroundColor: ROSE_SOFT,
              color: ACCENT,
            }}
          >
            <Icon size={14} />
          </div>

          <h2
            className="text-[10px] font-black uppercase tracking-[0.14em]"
            style={{ color: PRIMARY }}
          >
            {section.title}
          </h2>

          <div
            className="h-px flex-1"
            style={{
              background:
                `repeating-linear-gradient(90deg, ${ACCENT}55 0 5px, transparent 5px 10px)`,
            }}
          />
        </div>
      </div>
    );
  };

  const SideSectionTitle = ({ sectionId }) => {
    const config = {
      projects: ['Selected Work', FolderKanban],
      education: ['Education', GraduationCap],
      skills: ['Creative Skills', Brush],
      certifications: ['Credentials', Award],
      awards: ['Recognition', Sparkles],
      languages: ['Languages', LanguagesIcon],
    };

    const [title, Icon] = config[sectionId];

    return (
      <div className="pb-2.5">
        <div
          className="flex items-center gap-2 border-b pb-2"
          style={{ borderColor: '#ede9fe' }}
        >
          <Icon size={12} style={{ color: ACCENT }} />

          <h2
            className="text-[9px] font-black uppercase tracking-[0.12em]"
            style={{ color: PRIMARY }}
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
            className="rounded-[20px] border-2 border-dashed px-4 py-4"
            style={{
              backgroundColor: '#fdfcff',
              borderColor: '#fda4af',
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
            className="relative rounded-[20px] border-2 border-dashed px-4 py-4"
            style={{
              backgroundColor: WHITE,
              borderColor: '#fecdd3',
            }}
          >
            <div
              className="absolute -left-[6px] top-[20px] h-3 w-3 rounded-full border-[2px] border-white"
              style={{ backgroundColor: ACCENT }}
            />

            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h3
                  className="text-[12px] font-black uppercase leading-tight"
                  style={{ color: PRIMARY }}
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
                    className="mt-1 text-[9.5px] font-black uppercase tracking-[0.07em]"
                    style={{ color: ACCENT }}
                  >
                    {item.company}
                  </div>
                ) : null}
              </div>

              {!block.continuation && item.date ? (
                <span
                  className="shrink-0 rounded-full px-2.5 py-1 text-[8px] font-black uppercase"
                  style={{
                    backgroundColor: ACCENT,
                    color: WHITE,
                  }}
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
                      style={{
                        backgroundColor:
                          index % 2 === 0
                            ? HIGHLIGHT
                            : ACCENT,
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
            className="rounded-[18px] border-2 border-dashed px-3 py-3"
            style={{
              backgroundColor: AMBER_SOFT,
              borderColor: '#fde68a',
            }}
          >
            <div
              className="text-[9.4px] font-black uppercase"
              style={{ color: PRIMARY }}
            >
              {item.name}
            </div>

            {item.desc ? (
              <div
                className="mt-1.5 text-[8.3px] leading-[1.42]"
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
            className="rounded-[18px] border px-3 py-3"
            style={{
              backgroundColor: WHITE,
              borderColor: '#ddd6fe',
            }}
          >
            <div
              className="text-[9.4px] font-black uppercase"
              style={{ color: PRIMARY }}
            >
              {item.degree || item.school}
            </div>

            {item.degree && item.school ? (
              <div
                className="mt-1 text-[8.3px]"
                style={{ color: BODY }}
              >
                {item.school}
              </div>
            ) : null}

            {item.date ? (
              <div
                className="mt-1 text-[8px] font-bold"
                style={{ color: ACCENT }}
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
            {block.items.map((skill, index) => (
              <span
                key={`${block.id}-${skill}-${index}`}
                className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[8px] font-bold"
                style={{
                  backgroundColor:
                    index % 3 === 0
                      ? LILAC
                      : index % 3 === 1
                        ? ROSE_SOFT
                        : AMBER_SOFT,
                  color: PRIMARY,
                  border:
                    index % 3 === 0
                      ? '1px solid #ddd6fe'
                      : index % 3 === 1
                        ? '1px solid #fecdd3'
                        : '1px solid #fde68a',
                }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    backgroundColor:
                      index % 2 === 0
                        ? ACCENT
                        : HIGHLIGHT,
                  }}
                />
                {skill}
              </span>
            ))}
          </div>
        </div>
      );
    }

    if (block.type === 'certification') {
      const item = block.item;

      return (
        <article className="pb-2.5">
          <div
            className="text-[8.8px] font-black uppercase leading-[1.2]"
            style={{ color: PRIMARY }}
          >
            {item.name}
          </div>

          {(item.issuer || item.date) ? (
            <div
              className="mt-1 text-[7.8px]"
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
          <div
            className="rounded-[15px] border px-3 py-2.5"
            style={{
              backgroundColor: ROSE_SOFT,
              borderColor: '#fecdd3',
            }}
          >
            <div
              className="text-[8.8px] font-black uppercase"
              style={{ color: ACCENT }}
            >
              {item.name}
            </div>

            {item.issuer ? (
              <div
                className="mt-1 text-[7.7px]"
                style={{ color: BODY }}
              >
                {item.issuer}
              </div>
            ) : null}
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
                  className="flex items-center justify-between gap-3 rounded-full border px-3 py-1.5"
                  style={{
                    borderColor: '#fecdd3',
                    backgroundColor: WHITE,
                  }}
                >
                  <span
                    className="text-[8.3px] font-bold uppercase"
                    style={{ color: PRIMARY }}
                  >
                    {name}
                  </span>

                  {level ? (
                    <span
                      className="text-[7.3px] font-bold"
                      style={{ color: ACCENT }}
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
      style={{ backgroundColor: PAGE_BG }}
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
              key={`artistic-page-${pageIndex}`}
              className="relative mx-auto h-[297mm] w-[210mm] overflow-hidden shadow-[0_18px_55px_rgba(30,27,75,0.12)] print:shadow-none"
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
                  className="rounded-[24px] border p-[4mm]"
                  style={{
                    width: MAIN_WIDTH,
                    boxSizing: 'border-box',
                    backgroundColor: WHITE,
                    borderColor: '#ede9fe',
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
                  className="rounded-[24px] border p-[4mm]"
                  style={{
                    width: SIDE_WIDTH,
                    boxSizing: 'border-box',
                    background:
                      'linear-gradient(180deg,#fff7fb 0%,#fffdf8 100%)',
                    borderColor: '#fecdd3',
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
                className="absolute bottom-[6mm] left-[13mm] right-[13mm] flex items-center justify-between border-t pt-2 text-[7.5px] font-black uppercase tracking-[0.1em]"
                style={{
                  borderColor: BORDER,
                  color: MUTED,
                }}
              >
                <span style={{ color: PRIMARY }}>
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

export default Artistic;
