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
  CakeSlice,
  ChefHat,
  Coffee,
  CookingPot,
  Flame,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Salad,
  Soup,
  Star,
  UtensilsCrossed,
  Wine,
} from 'lucide-react';

const cleanLines = (text = '') =>
  String(text || '')
    .split(/\r?\n/)
    .map((line) => line.replace(/^[•\-–—]\s*/, '').trim())
    .filter(Boolean);

const ChefMenuResume = ({ data }) => {
  const {
    personal = {},
    experience = [],
    education = [],
    skills = {},
    certifications = [],
    awards = [],
    projects = [],
    languages = [],
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

  const PAPER = '#f7f0e3';
  const PAPER_LIGHT = '#fffaf0';
  const WHITE = '#ffffff';
  const INK = '#2f2a24';
  const BODY = '#5f564d';
  const MUTED = '#9b8d7f';

  const BURGUNDY = '#7f1d1d';
  const BURGUNDY_DARK = '#5f1717';
  const GOLD = '#c89b3c';
  const GOLD_SOFT = '#f5e7bd';
  const FOREST = '#315b46';
  const OLIVE = '#66734f';
  const BORDER = '#dacbb6';

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

  const specialties = useMemo(
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
  }, [
    chunkArray,
    experience,
    personal.summary,
  ]);

  const sideBlocks = useMemo(() => {
    const blocks = [];

    chunkArray(specialties, 10).forEach((items, index) => {
      if (!items.length) return;

      blocks.push({
        id: `specialties-${index}`,
        section: 'specialties',
        type: 'specialties',
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
      const lines = cleanLines(item.desc);
      const chunks = lines.length ? chunkArray(lines, 2) : [[]];

      chunks.forEach((projectLines, chunkIndex) => {
        blocks.push({
          id: `project-${item.id ?? 'na'}-${index}-${chunkIndex}`,
          section: 'projects',
          type: 'project',
          item,
          lines: projectLines,
          continuation: chunkIndex > 0,
          forceBreak: Boolean(item.pageBreak && chunkIndex === 0),
        });
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
    awards,
    certifications,
    chunkArray,
    education,
    languages,
    projects,
    specialties,
  ]);

  const MenuRule = ({ compact = false }) => (
    <div className="flex items-center gap-2">
      <div
        className={`${compact ? 'w-6' : 'w-10'} h-px`}
        style={{ backgroundColor: GOLD }}
      />
      <Star
        size={compact ? 8 : 9}
        fill={GOLD}
        style={{ color: GOLD }}
      />
      <div className="h-px flex-1" style={{ backgroundColor: BORDER }} />
    </div>
  );

  const FirstHeader = ({ measureRef = null }) => (
    <header ref={measureRef} className="mb-5">
      <div
        className="relative overflow-hidden border px-[7mm] py-[6mm]"
        style={{
          backgroundColor: PAPER_LIGHT,
          borderColor: BURGUNDY,
          boxShadow: '0 10px 26px rgba(127,29,29,0.08)',
        }}
      >
        {/* Decorative restaurant-menu corner ornaments */}
        <div
          className="absolute left-3 top-3 h-7 w-7 border-l-2 border-t-2"
          style={{ borderColor: GOLD }}
        />
        <div
          className="absolute right-3 top-3 h-7 w-7 border-r-2 border-t-2"
          style={{ borderColor: GOLD }}
        />
        <div
          className="absolute bottom-3 left-3 h-7 w-7 border-b-2 border-l-2"
          style={{ borderColor: GOLD }}
        />
        <div
          className="absolute bottom-3 right-3 h-7 w-7 border-b-2 border-r-2"
          style={{ borderColor: GOLD }}
        />

        <div className="relative z-10 grid grid-cols-[36mm_1fr] gap-6 items-center">
          <div
            className="relative overflow-hidden rounded-full border-[3px] p-[2mm]"
            style={{
              borderColor: GOLD,
              backgroundColor: '#fff8e8',
            }}
          >
            {personal.photo ? (
              <img
                src={personal.photo}
                alt="Profile"
                className="h-[31mm] w-full rounded-full object-cover"
              />
            ) : (
              <div
                className="flex h-[31mm] w-full items-center justify-center rounded-full"
                style={{
                  backgroundColor: '#f1e4cc',
                  color: BURGUNDY,
                }}
              >
                <ChefHat size={34} />
              </div>
            )}
          </div>

          <div className="min-w-0 text-center">
            <div className="flex items-center justify-center gap-2">
              <UtensilsCrossed size={15} style={{ color: BURGUNDY }} />
              <div
                className="text-[8px] font-black uppercase tracking-[0.28em]"
                style={{ color: BURGUNDY }}
              >
                Signature Menu
              </div>
              <ChefHat size={15} style={{ color: BURGUNDY }} />
            </div>

            <h1
              className="mt-2 break-words text-[29px] font-black uppercase leading-none tracking-[0.035em]"
              style={{
                color: INK,
                fontFamily: 'Georgia, "Times New Roman", serif',
              }}
            >
              {personal.name || 'Your Name'}
            </h1>

            {personal.title ? (
              <div
                className="mt-2 text-[9.5px] font-black uppercase tracking-[0.18em]"
                style={{ color: GOLD }}
              >
                {personal.title}
              </div>
            ) : null}

            <div className="mt-3">
              <MenuRule />
            </div>

            <div
              className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[7.6px] font-semibold"
              style={{ color: BODY }}
            >
              {personal.phone ? (
                <span className="flex items-center gap-1.5">
                  <Phone size={10} style={{ color: BURGUNDY }} />
                  {personal.phone}
                </span>
              ) : null}

              {personal.email ? (
                <span className="flex items-center gap-1.5 break-all">
                  <Mail size={10} style={{ color: BURGUNDY }} />
                  {personal.email}
                </span>
              ) : null}

              {personal.location ? (
                <span className="flex items-center gap-1.5">
                  <MapPin size={10} style={{ color: BURGUNDY }} />
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
      className="mb-4 border-b pb-3"
      style={{ borderColor: BURGUNDY }}
    >
      <div className="flex items-end justify-between gap-4">
        <div>
          <div
            className="text-[12px] font-black uppercase tracking-[0.05em]"
            style={{
              color: INK,
              fontFamily: 'Georgia, "Times New Roman", serif',
            }}
          >
            {personal.name || 'Your Name'}
          </div>

          {personal.title ? (
            <div
              className="mt-0.5 text-[7.8px] font-black uppercase tracking-[0.12em]"
              style={{ color: GOLD }}
            >
              {personal.title}
            </div>
          ) : null}
        </div>

        <div
          className="flex items-center gap-2 rounded-full border px-3 py-1 text-[7px] font-black uppercase tracking-[0.12em]"
          style={{
            borderColor: GOLD,
            color: BURGUNDY,
            backgroundColor: '#fff8e8',
          }}
        >
          <UtensilsCrossed size={9} />
          Page {pageNumber}
        </div>
      </div>
    </header>
  );

  const SectionTitle = ({ sectionId, side = false }) => {
    const config = {
      summary: ['Chef’s Note', ChefHat, BURGUNDY],
      experience: ['Kitchen Experience', CookingPot, BURGUNDY],
      projects: ['Signature Dishes & Menus', Soup, FOREST],
      specialties: ['Culinary Specialties', UtensilsCrossed, BURGUNDY],
      education: ['Culinary Training', GraduationCap, FOREST],
      certifications: ['Kitchen Credentials', Award, GOLD],
      awards: ['Accolades', Star, BURGUNDY],
      languages: ['Languages', Coffee, OLIVE],
    };

    const [title, Icon, color] = config[sectionId];

    return (
      <div className={side ? 'pb-2.5' : 'pb-3'}>
        <div className="flex items-center gap-2.5">
          <div
            className={`${side ? 'h-7 w-7' : 'h-8 w-8'} flex shrink-0 items-center justify-center rounded-full border`}
            style={{
              borderColor: GOLD,
              color,
              backgroundColor: '#fff8e8',
            }}
          >
            <Icon size={side ? 12 : 14} />
          </div>

          <div className="min-w-0 flex-1">
            <div
              className={`${side ? 'text-[8.3px]' : 'text-[9.5px]'} font-black uppercase tracking-[0.13em]`}
              style={{ color: BURGUNDY_DARK }}
            >
              {title}
            </div>
            <MenuRule compact />
          </div>
        </div>
      </div>
    );
  };

  const renderMainBlock = (block) => {
    if (block.type === 'summary') {
      return (
        <div className="pb-4">
          <div
            className="border px-4 py-4"
            style={{
              borderColor: BORDER,
              backgroundColor: '#fffaf2',
            }}
          >
            <p
              className="whitespace-pre-wrap text-[10.3px] leading-[1.58]"
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
            className="relative border-b pb-3.5"
            style={{ borderColor: BORDER }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div
                  className="text-[10.8px] font-black uppercase leading-[1.18]"
                  style={{ color: INK }}
                >
                  {item.role}

                  {block.continuation ? (
                    <span
                      className="ml-1 text-[7px] font-medium normal-case italic"
                      style={{ color: MUTED }}
                    >
                      continued
                    </span>
                  ) : null}
                </div>

                {!block.continuation && item.company ? (
                  <div
                    className="mt-1 text-[8.3px] font-black uppercase tracking-[0.12em]"
                    style={{ color: BURGUNDY }}
                  >
                    {item.company}
                  </div>
                ) : null}
              </div>

              {!block.continuation && item.date ? (
                <span
                  className="shrink-0 rounded-full border px-2.5 py-1 text-[6.9px] font-black uppercase tracking-[0.12em]"
                  style={{
                    borderColor: GOLD,
                    color: BURGUNDY_DARK,
                    backgroundColor: '#fff8e8',
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
                    className="flex items-start gap-2 text-[8.9px] leading-[1.48]"
                    style={{ color: BODY }}
                  >
                    <Flame
                      size={9}
                      className="mt-[2px] shrink-0"
                      style={{
                        color:
                          index % 2 === 0
                            ? BURGUNDY
                            : GOLD,
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

    if (block.type === 'project') {
      const item = block.item;

      return (
        <article className="pb-3">
          <div
            className="border px-4 py-3.5"
            style={{
              borderColor: GOLD_SOFT,
              backgroundColor: '#fff8e8',
            }}
          >
            <div className="flex items-center gap-2">
              <Soup size={12} style={{ color: FOREST }} />
              <div
                className="text-[9.3px] font-black uppercase tracking-[0.09em]"
                style={{ color: INK }}
              >
                {item.name}
              </div>
            </div>

            {item.desc ? (
              <p
                className="mt-2 text-[8.4px] leading-[1.48]"
                style={{ color: BODY }}
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
    if (block.type === 'specialties') {
      const icons = [
        Salad,
        Soup,
        CookingPot,
        Coffee,
        CakeSlice,
        Wine,
        UtensilsCrossed,
      ];

      return (
        <div className="pb-3.5">
          <div className="space-y-1.5">
            {block.items.map((item, index) => {
              const Icon = icons[index % icons.length];

              return (
                <div
                  key={`${block.id}-${item}-${index}`}
                  className="flex items-center gap-2 border-b pb-1.5 text-[7.7px] font-bold"
                  style={{
                    borderColor: BORDER,
                    color: BODY,
                  }}
                >
                  <Icon
                    size={10}
                    className="shrink-0"
                    style={{
                      color:
                        index % 2 === 0
                          ? BURGUNDY
                          : FOREST,
                    }}
                  />
                  <span>{item}</span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (block.type === 'education') {
      const item = block.item;

      return (
        <article className="pb-3">
          <div
            className="text-[8.5px] font-black uppercase leading-[1.25]"
            style={{ color: INK }}
          >
            {item.degree || item.school}
          </div>

          {item.degree && item.school ? (
            <div
              className="mt-1 text-[7.5px] leading-[1.35]"
              style={{ color: BODY }}
            >
              {item.school}
            </div>
          ) : null}

          {item.date ? (
            <div
              className="mt-1 text-[6.9px] font-black uppercase tracking-[0.09em]"
              style={{ color: GOLD }}
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
          <div className="border px-3 py-2.5" style={{ borderColor: GOLD_SOFT, backgroundColor: '#fff8e8' }}>
            <div className="flex items-center gap-2">
              <Soup size={10} className="shrink-0" style={{ color: FOREST }} />
              <div className="min-w-0 break-words text-[7.8px] font-black uppercase leading-[1.25] tracking-[0.06em]" style={{ color: INK }}>
                {item.name}
                {block.continuation ? <span className="ml-1 text-[6px] font-medium normal-case italic" style={{ color: MUTED }}>continued</span> : null}
              </div>
            </div>
            {block.lines.length ? (
              <div className="mt-2 space-y-1">
                {block.lines.map((line, index) => (
                  <div key={`${block.id}-${index}`} className="flex items-start gap-1.5 text-[7px] leading-[1.4]" style={{ color: BODY }}>
                    <Flame size={8} className="mt-[1px] shrink-0" style={{ color: index % 2 === 0 ? BURGUNDY : GOLD }} />
                    <span className="min-w-0 break-words">{line}</span>
                  </div>
                ))}
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
          <div className="flex items-start gap-2">
            <Award
              size={10}
              className="mt-0.5 shrink-0"
              style={{ color: GOLD }}
            />

            <div>
              <div
                className="text-[8px] font-black leading-[1.25]"
                style={{ color: INK }}
              >
                {item.name}
              </div>

              {(item.issuer || item.date) ? (
                <div
                  className="mt-1 text-[7px]"
                  style={{ color: BODY }}
                >
                  {[item.issuer, item.date].filter(Boolean).join(' • ')}
                </div>
              ) : null}
            </div>
          </div>
        </article>
      );
    }

    if (block.type === 'award') {
      const item = block.item;

      return (
        <article className="pb-2.5">
          <div className="flex items-start gap-2">
            <Star
              size={10}
              fill={GOLD}
              className="mt-0.5 shrink-0"
              style={{ color: GOLD }}
            />

            <div>
              <div
                className="text-[8px] font-black leading-[1.25]"
                style={{ color: INK }}
              >
                {item.name}
              </div>

              {(item.issuer || item.date) ? (
                <div
                  className="mt-1 text-[7px]"
                  style={{ color: BODY }}
                >
                  {[item.issuer, item.date].filter(Boolean).join(' • ')}
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
                  className="flex items-center justify-between gap-2 border-b pb-1.5"
                  style={{ borderColor: BORDER }}
                >
                  <span
                    className="text-[7.6px] font-bold"
                    style={{ color: INK }}
                  >
                    {name}
                  </span>

                  {level ? (
                    <span
                      className="text-[6.9px] font-semibold"
                      style={{ color: OLIVE }}
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

  const mainSectionOrder = [
    'summary',
    'experience',
  ];

  const sideSectionOrder = [
    'specialties',
    'education',
    'projects',
    'certifications',
    'awards',
    'languages',
  ];

  return (
    <div
      className="resume-preview-wrapper relative mx-auto w-full max-w-[210mm] font-sans"
      style={{ backgroundColor: '#d6c7b1' }}
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

      {/* Real A4 pages */}
      <div className="space-y-5 print:space-y-0">
        {Array.from({ length: pageCount }).map((_, pageIndex) => {
          const mainPage =
            visibleMainPages[pageIndex] || { blocks: [] };

          const sidePage =
            visibleSidePages[pageIndex] || { blocks: [] };

          return (
            <section
              key={`chef-menu-page-${pageIndex}`}
              className="relative mx-auto h-[297mm] w-[210mm] overflow-hidden shadow-[0_18px_55px_rgba(87,56,29,0.18)] print:shadow-none"
              style={{
                width: PAGE_WIDTH,
                height: PAGE_HEIGHT,
                padding: '11mm 13mm 15mm',
                boxSizing: 'border-box',
                backgroundColor: PAPER,
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
              {/* Menu border */}
              <div
                className="pointer-events-none absolute inset-[6mm] border"
                style={{ borderColor: BURGUNDY }}
              />
              <div
                className="pointer-events-none absolute inset-[8mm] border"
                style={{ borderColor: GOLD_SOFT }}
              />

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

                <aside
                  className="border-l pl-[4mm]"
                  style={{
                    borderColor: BORDER,
                  }}
                >
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
                className="absolute bottom-[6mm] left-[13mm] right-[13mm] flex items-center justify-between border-t pt-1.5 text-[6.3px] font-black uppercase tracking-[0.12em]"
                style={{
                  borderColor: BORDER,
                  color: MUTED,
                }}
              >
                <span
                  className="flex items-center gap-2"
                  style={{ color: BURGUNDY }}
                >
                  <UtensilsCrossed size={9} />
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

export default ChefMenuResume;
