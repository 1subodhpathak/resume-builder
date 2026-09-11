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
  Brush,
  GraduationCap,
  Languages as LanguagesIcon,
  Mail,
  MapPin,
  Palette,
  Phone,
  Sparkles,
  UserRound,
  Wrench,
} from 'lucide-react';

const cleanLines = (text = '') =>
  String(text || '')
    .split(/\r?\n/)
    .map((line) => line.replace(/^[•\-–—]\s*/, '').trim())
    .filter(Boolean);

const ChalkboardArtist = ({ data }) => {
  const {
    personal = {},
    experience = [],
    education = [],
    skills = {},
    languages = [],
    projects = [],
    certifications = [],
    awards = [],
  } = data || {};

  const {
    core = [],
    technical = [],
    soft = [],
  } = skills;

  const PAGE_WIDTH = '210mm';
  const PAGE_HEIGHT = '297mm';

  // 6mm wooden frame + 8mm board padding on each side.
  const BOARD_INNER_WIDTH = '182mm';
  const BOARD_CONTENT_HEIGHT = '269mm';

  const MAIN_WIDTH = '116mm';
  const SIDE_WIDTH = '58mm';
  const COLUMN_GAP = '8mm';
  const FOOTER_RESERVE = '8mm';

  const WOOD = '#9a6a3a';
  const WOOD_LIGHT = '#c58b52';
  const BOARD = '#1f3526';
  const BOARD_DARK = '#17271c';

  const CHALK = '#f8f5ec';
  const CHALK_SOFT = 'rgba(248,245,236,0.82)';
  const CHALK_MUTE = 'rgba(248,245,236,0.62)';
  const LINE = 'rgba(248,245,236,0.20)';

  const YELLOW = '#f5d86a';
  const BLUE = '#8fd3ff';
  const PINK = '#ffb3c7';
  const GREEN = '#92f0b3';
  const PEACH = '#ffc89d';

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

  const artisticSkills = useMemo(
    () => [...core, ...soft].filter(Boolean),
    [core, soft]
  );

  const technicalSkills = useMemo(
    () => technical.filter(Boolean),
    [technical]
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

    experience.forEach((item, index) => {
      const lines = cleanLines(item.desc);
      const chunks = chunkArray(lines, 4);

      chunks.forEach((chunk, chunkIndex) => {
        blocks.push({
          id: `experience-${item.id ?? 'na'}-${index}-${chunkIndex}`,
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
  }, [chunkArray, experience]);

  const sideBlocks = useMemo(() => {
    const blocks = [];

    chunkArray(artisticSkills, 10).forEach((items, index) => {
      if (!items.length) return;
      blocks.push({
        id: `creative-skills-${index}`,
        section: 'creativeSkills',
        type: 'skills',
        items,
      });
    });

    chunkArray(technicalSkills, 9).forEach((items, index) => {
      if (!items.length) return;
      blocks.push({
        id: `technical-skills-${index}`,
        section: 'technicalSkills',
        type: 'technicalSkills',
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

    if (languages.length) {
      blocks.push({
        id: 'languages',
        section: 'languages',
        type: 'languages',
        items: languages,
      });
    }

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

    return blocks;
  }, [
    artisticSkills,
    awards,
    certifications,
    chunkArray,
    education,
    languages,
    projects,
    technicalSkills,
  ]);

  const ChalkRule = ({ color = CHALK_MUTE }) => (
    <div
      className="mt-1 h-[2px] w-full border-t border-dashed"
      style={{ borderColor: color }}
    />
  );

  const FirstHeader = ({ measureRef = null }) => (
    <header ref={measureRef} className="mb-5">
      <div className="grid grid-cols-12 gap-5 items-start">
        <div className="col-span-8">
          <div
            className="inline-block rounded-full border px-4 py-1 text-[7.5px] font-black uppercase tracking-[0.22em]"
            style={{
              borderColor: LINE,
              color: YELLOW,
              backgroundColor: 'rgba(255,255,255,0.03)',
            }}
          >
            Professional Profile
          </div>

          <h1
            className="mt-3 break-words text-[31px] font-black uppercase leading-[0.95]"
            style={{
              color: CHALK,
              textShadow: '0.8px 0.8px 0 rgba(255,255,255,0.20)',
            }}
          >
            {personal.name || 'Your Name'}
          </h1>

          {personal.title ? (
            <div
              className="mt-2 text-[9.5px] font-black uppercase tracking-[0.17em]"
              style={{ color: BLUE }}
            >
              {personal.title}
            </div>
          ) : null}

          {personal.summary ? (
            <p
              className="mt-4 max-w-[98%] text-[9.2px] font-medium leading-[1.52]"
              style={{ color: CHALK_SOFT }}
            >
              “{personal.summary}”
            </p>
          ) : null}
        </div>

        <div className="col-span-4">
          <div
            className="ml-auto w-[39mm] rotate-[2deg] rounded-[15px] border p-2"
            style={{
              borderColor: LINE,
              backgroundColor: 'rgba(0,0,0,0.14)',
            }}
          >
            {personal.photo ? (
              <img
                src={personal.photo}
                alt="Profile"
                className="h-[32mm] w-full rounded-[10px] object-cover"
              />
            ) : (
              <div
                className="flex h-[32mm] w-full items-center justify-center rounded-[10px]"
                style={{
                  color: CHALK_MUTE,
                  backgroundColor: 'rgba(255,255,255,0.04)',
                }}
              >
                <UserRound size={28} />
              </div>
            )}
          </div>

          <div className="mt-3 space-y-1.5 text-[7.4px] font-semibold">
            {personal.email ? (
              <div
                className="flex items-start gap-2 break-all"
                style={{ color: CHALK_SOFT }}
              >
                <Mail size={10} className="mt-0.5 shrink-0" style={{ color: YELLOW }} />
                <span>{personal.email}</span>
              </div>
            ) : null}

            {personal.phone ? (
              <div
                className="flex items-start gap-2"
                style={{ color: CHALK_SOFT }}
              >
                <Phone size={10} className="mt-0.5 shrink-0" style={{ color: BLUE }} />
                <span>{personal.phone}</span>
              </div>
            ) : null}

            {personal.location ? (
              <div
                className="flex items-start gap-2"
                style={{ color: CHALK_SOFT }}
              >
                <MapPin size={10} className="mt-0.5 shrink-0" style={{ color: PINK }} />
                <span>{personal.location}</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: YELLOW }} />
        <div className="h-2 w-2" style={{ backgroundColor: BLUE }} />
        <div className="h-2 w-5 rounded-full" style={{ backgroundColor: PINK }} />
        <div className="flex-1">
          <ChalkRule />
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
      className="mb-4 flex items-end justify-between"
    >
      <div>
        <div
          className="text-[12px] font-black uppercase tracking-[0.10em]"
          style={{ color: CHALK }}
        >
          {personal.name || 'Your Name'}
        </div>

        {personal.title ? (
          <div
            className="mt-0.5 text-[7.7px] font-black uppercase tracking-[0.14em]"
            style={{ color: BLUE }}
          >
            {personal.title}
          </div>
        ) : null}
      </div>

      <div
        className="rounded-full border px-3 py-1 text-[7px] font-black uppercase tracking-[0.14em]"
        style={{
          borderColor: LINE,
          color: YELLOW,
          backgroundColor: 'rgba(255,255,255,0.03)',
        }}
      >
        Page {pageNumber}
      </div>

      <div className="absolute left-[8mm] right-[8mm] mt-4">
        <ChalkRule />
      </div>
    </header>
  );

  const SectionTitle = ({
    sectionId,
    side = false,
  }) => {
    const config = {
      experience: ['Experience / Journey', Brush, YELLOW],
      projects: ['Projects & Artwork', Sparkles, GREEN],
      creativeSkills: ['Creative Skill Set', Palette, PINK],
      technicalSkills: ['Tools & Software', Wrench, BLUE],
      education: ['Education', GraduationCap, GREEN],
      languages: ['Languages', LanguagesIcon, PINK],
      certifications: ['Certifications', Award, YELLOW],
      awards: ['Recognition', Award, PEACH],
    };

    const [title, Icon, color] = config[sectionId];

    return (
      <div className={side ? 'pb-2.5' : 'pb-3'}>
        <div className="flex items-center gap-2.5">
          <div
            className={`${side ? 'h-7 w-7' : 'h-8 w-8'} flex shrink-0 items-center justify-center rounded-full border`}
            style={{
              borderColor: LINE,
              color,
              backgroundColor: 'rgba(255,255,255,0.025)',
            }}
          >
            <Icon size={side ? 12 : 14} />
          </div>

          <div className="min-w-0 flex-1">
            <div
              className={`${side ? 'text-[8.1px]' : 'text-[9.2px]'} font-black uppercase tracking-[0.14em]`}
              style={{ color: CHALK }}
            >
              {title}
            </div>
            <ChalkRule color="rgba(248,245,236,0.16)" />
          </div>
        </div>
      </div>
    );
  };

  const renderMainBlock = (block) => {
    if (block.type === 'experience') {
      const item = block.item;

      return (
        <article className="pb-4">
          <div
            className="relative rounded-[18px] border px-4 py-3.5"
            style={{
              borderColor: LINE,
              backgroundColor: 'rgba(255,255,255,0.025)',
            }}
          >
            <div
              className="absolute bottom-4 left-[13px] top-4 w-[2px]"
              style={{ backgroundColor: 'rgba(245,216,106,0.34)' }}
            />

            <div
              className="absolute left-[9px] top-[19px] h-[9px] w-[9px] rounded-full"
              style={{
                backgroundColor: YELLOW,
                boxShadow: '0 0 7px rgba(245,216,106,0.25)',
              }}
            />

            <div className="pl-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div
                    className="text-[10.6px] font-black uppercase leading-[1.15] tracking-[0.08em]"
                    style={{ color: CHALK }}
                  >
                    {item.role}

                    {block.continuation ? (
                      <span
                        className="ml-1 text-[7px] font-medium normal-case italic"
                        style={{ color: CHALK_MUTE }}
                      >
                        continued
                      </span>
                    ) : null}
                  </div>

                  {!block.continuation && item.company ? (
                    <div
                      className="mt-1 text-[8.2px] font-black uppercase tracking-[0.13em]"
                      style={{ color: BLUE }}
                    >
                      {item.company}
                    </div>
                  ) : null}
                </div>

                {!block.continuation && item.date ? (
                  <span
                    className="shrink-0 rounded-full border px-2 py-1 text-[6.8px] font-black uppercase tracking-[0.12em]"
                    style={{
                      borderColor: LINE,
                      color: PEACH,
                      backgroundColor: 'rgba(255,255,255,0.035)',
                    }}
                  >
                    {item.date}
                  </span>
                ) : null}
              </div>

              {block.lines.length ? (
                <div className="mt-2.5 space-y-1.4">
                  {block.lines.map((line, index) => (
                    <div
                      key={`${block.id}-${index}`}
                      className="flex items-start gap-2 text-[8.7px] font-medium leading-[1.45]"
                      style={{ color: CHALK_SOFT }}
                    >
                      <span
                        className="mt-[4px] h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{
                          backgroundColor:
                            index % 2 === 0 ? GREEN : PINK,
                        }}
                      />
                      <span>{line}</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </article>
      );
    }

    if (block.type === 'project') {
      const item = block.item;

      return (
        <article className="pb-3">
          <div
            className="rounded-[16px] border px-4 py-3"
            style={{
              borderColor: LINE,
              backgroundColor: 'rgba(255,255,255,0.025)',
            }}
          >
            <div
              className="text-[9.3px] font-black uppercase tracking-[0.10em]"
              style={{ color: GREEN }}
            >
              {item.name}
            </div>

            {item.desc ? (
              <p
                className="mt-1.5 text-[8.3px] font-medium leading-[1.45]"
                style={{ color: CHALK_SOFT }}
              >
                {item.desc}
              </p>
            ) : null}
          </div>
        </article>
      );
    }

    return null;
  };

  const renderSideBlock = (block) => {
    if (block.type === 'project') {
      return renderMainBlock(block);
    }

    if (block.type === 'skills') {
      return (
        <div className="pb-3.5">
          <div className="flex flex-wrap gap-1.5">
            {block.items.map((item, index) => (
              <span
                key={`${block.id}-${item}-${index}`}
                className="rounded-full border px-2.5 py-1.5 text-[6.9px] font-black uppercase tracking-[0.08em]"
                style={{
                  borderColor: LINE,
                  color: [YELLOW, BLUE, GREEN, PINK][index % 4],
                  backgroundColor: 'rgba(255,255,255,0.025)',
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      );
    }

    if (block.type === 'technicalSkills') {
      return (
        <div className="pb-3.5">
          <div className="space-y-2">
            {block.items.map((item, index) => (
              <div
                key={`${block.id}-${item}-${index}`}
                className="border-b pb-1.5 text-[7.5px] font-black uppercase tracking-[0.10em]"
                style={{
                  borderColor: 'rgba(248,245,236,0.11)',
                  color: CHALK_SOFT,
                }}
              >
                <span style={{ color: [BLUE, GREEN, YELLOW, PINK][index % 4] }}>
                  —
                </span>{' '}
                {item}
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
            className="border-l-2 pl-3"
            style={{ borderColor: 'rgba(146,240,179,0.45)' }}
          >
            <div
              className="text-[8.3px] font-black uppercase leading-[1.25]"
              style={{ color: CHALK }}
            >
              {item.school || item.degree}
            </div>

            {item.school && item.degree ? (
              <div
                className="mt-1 text-[7.4px] font-bold uppercase tracking-[0.08em]"
                style={{ color: GREEN }}
              >
                {item.degree}
              </div>
            ) : null}

            {item.date ? (
              <div
                className="mt-1 text-[6.8px] font-black uppercase tracking-[0.12em]"
                style={{ color: CHALK_MUTE }}
              >
                {item.date}
              </div>
            ) : null}
          </div>
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
                  className="flex items-center justify-between gap-2 rounded-[10px] border px-2.5 py-1.5"
                  style={{
                    borderColor: LINE,
                    backgroundColor: 'rgba(255,255,255,0.025)',
                  }}
                >
                  <span
                    className="text-[7.4px] font-black uppercase"
                    style={{ color: CHALK }}
                  >
                    {name}
                  </span>

                  {level ? (
                    <span
                      className="text-[6.8px] font-black uppercase"
                      style={{ color: PINK }}
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

    if (block.type === 'certification' || block.type === 'award') {
      const item = block.item;

      return (
        <article className="pb-2.5">
          <div
            className="text-[7.8px] font-black leading-[1.28]"
            style={{ color: CHALK }}
          >
            {item.name}
          </div>

          {(item.issuer || item.date) ? (
            <div
              className="mt-1 text-[6.9px]"
              style={{ color: CHALK_MUTE }}
            >
              {[item.issuer, item.date].filter(Boolean).join(' • ')}
            </div>
          ) : null}
        </article>
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

    if (typeof document !== 'undefined' && document.fonts?.ready) {
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

  const mainSectionOrder = ['experience'];
  const sideSectionOrder = [
    'creativeSkills',
    'technicalSkills',
    'education',
    'projects',
    'languages',
    'certifications',
    'awards',
  ];

  return (
    <div
      className="resume-preview-wrapper relative mx-auto w-full max-w-[210mm] font-sans"
      style={{ backgroundColor: '#d1d5db' }}
    >
      {/* Hidden measurement layer: same widths as the visible columns */}
      <div
        className="pointer-events-none absolute left-[-99999px] top-0 opacity-0"
        aria-hidden="true"
      >
        <div
          ref={contentHeightRef}
          style={{
            width: BOARD_INNER_WIDTH,
            height: BOARD_CONTENT_HEIGHT,
          }}
        />

        <div
          ref={footerReserveRef}
          style={{
            width: '1mm',
            height: FOOTER_RESERVE,
          }}
        />

        <div style={{ width: BOARD_INNER_WIDTH }}>
          <FirstHeader measureRef={firstHeaderRef} />
          <ContinuationHeader
            measureRef={continuationHeaderRef}
            pageNumber={2}
          />
        </div>

        <div
          className="grid"
          style={{
            width: BOARD_INNER_WIDTH,
            gridTemplateColumns: `${SIDE_WIDTH} ${MAIN_WIDTH}`,
            columnGap: COLUMN_GAP,
            alignItems: 'start',
          }}
        >
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
        </div>
      </div>

      {/* Real A4 pages */}
      <div className="space-y-5 print:space-y-0">
        {Array.from({ length: pageCount }).map((_, pageIndex) => {
          const mainPage =
            visibleMainPages[pageIndex] || { blocks: [] };

          const sidePage =
            visibleSidePages[pageIndex] || { blocks: [] };

          return (
            <section
              key={`chalkboard-page-${pageIndex}`}
              className="relative mx-auto h-[297mm] w-[210mm] overflow-hidden shadow-2xl print:shadow-none"
              style={{
                width: PAGE_WIDTH,
                height: PAGE_HEIGHT,
                padding: '6mm',
                boxSizing: 'border-box',
                backgroundColor: WOOD,
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
                className="relative h-full w-full overflow-hidden"
                style={{
                  backgroundColor: BOARD,
                  border: `1px solid ${WOOD_LIGHT}`,
                  backgroundImage:
                    'radial-gradient(circle at 20% 18%, rgba(255,255,255,0.05), transparent 28%), radial-gradient(circle at 80% 15%, rgba(255,255,255,0.025), transparent 23%), radial-gradient(circle at 50% 72%, rgba(255,255,255,0.018), transparent 33%)',
                }}
              >
                <div className="absolute right-5 top-4 rotate-[-8deg] text-[20px] opacity-25" style={{ color: CHALK }}>
                  ★
                </div>
                <div className="absolute bottom-6 right-10 rotate-[8deg] text-[18px] opacity-22" style={{ color: PINK }}>
                  ♡
                </div>

                <div
                  className="relative h-full"
                  style={{
                    padding: '8mm',
                    boxSizing: 'border-box',
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
                      width: BOARD_INNER_WIDTH,
                      gridTemplateColumns: `${SIDE_WIDTH} ${MAIN_WIDTH}`,
                      columnGap: COLUMN_GAP,
                      alignItems: 'start',
                    }}
                  >
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
                              <SectionTitle
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
                  </div>

                  <footer
                    className="absolute bottom-[3mm] left-[8mm] right-[8mm] flex items-center justify-between border-t border-dashed pt-1.5 text-[6.2px] font-black uppercase tracking-[0.13em]"
                    style={{
                      borderColor: LINE,
                      color: CHALK_MUTE,
                    }}
                  >
                    <span style={{ color: YELLOW }}>
                      Confidential
                    </span>

                    <span>
                      Page {pageIndex + 1} / {pageCount}
                    </span>
                  </footer>
                </div>
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

export default ChalkboardArtist;
